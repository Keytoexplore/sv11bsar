// Exchange rate caching
let exchangeRateCache: { rate: number; timestamp: number } | null = null;
const CACHE_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Fetch JPY to USD exchange rate (cached for 24 hours)
 */
export async function getExchangeRate(): Promise<number> {
  // Check cache
  if (exchangeRateCache && Date.now() - exchangeRateCache.timestamp < CACHE_DURATION_MS) {
    return exchangeRateCache.rate;
  }

  try {
    // Use exchangerate-api.com (free tier: 1500 requests/month)
    const response = await fetch('https://api.exchangerate-api.com/v4/latest/JPY');
    const data = await response.json();
    
    if (data.rates && data.rates.USD) {
      const rate = data.rates.USD;
      exchangeRateCache = { rate, timestamp: Date.now() };
      return rate;
    }
  } catch (error) {
    console.error('Failed to fetch exchange rate:', error);
  }

  // Fallback rate if API fails (approximate)
  return 0.0067; // 1 JPY ≈ 0.0067 USD (as of Feb 2026)
}

/**
 * Convert JPY to USD
 */
export function convertJPYtoUSD(jpy: number, exchangeRate: number): number {
  return jpy * exchangeRate;
}

/**
 * Calculate profit margin percentage
 * Formula: ((TCGPlayer USD - Toreca USD) / Toreca USD) × 100
 */
export function calculateProfitMargin(
  tcgPlayerPriceUSD: number,
  torecaPriceJPY: number,
  exchangeRate: number
): number {
  const torecaPriceUSD = convertJPYtoUSD(torecaPriceJPY, exchangeRate);
  
  if (torecaPriceUSD === 0) return 0;
  
  const profitMargin = ((tcgPlayerPriceUSD - torecaPriceUSD) / torecaPriceUSD) * 100;
  return Math.round(profitMargin * 10) / 10; // Round to 1 decimal place
}

/**
 * Categorize profit margin
 */
export type ProfitCategory = 'perfect' | 'good' | 'medium' | 'bad';

export function getProfitCategory(profitMargin: number): ProfitCategory {
  if (profitMargin >= 80) return 'perfect';
  if (profitMargin >= 50) return 'good';
  if (profitMargin >= 30) return 'medium';
  return 'bad';
}

/**
 * Get color classes for profit category
 */
export function getProfitCategoryColors(category: ProfitCategory): {
  bg: string;
  text: string;
  border: string;
} {
  switch (category) {
    case 'perfect':
      return {
        bg: 'bg-green-900/30',
        text: 'text-green-200',
        border: 'border-green-500/50',
      };
    case 'good':
      return {
        bg: 'bg-blue-900/30',
        text: 'text-blue-200',
        border: 'border-blue-500/50',
      };
    case 'medium':
      return {
        bg: 'bg-yellow-900/30',
        text: 'text-yellow-200',
        border: 'border-yellow-500/50',
      };
    case 'bad':
      return {
        bg: 'bg-red-900/30',
        text: 'text-red-200',
        border: 'border-red-500/50',
      };
  }
}

/**
 * Get display label for profit category
 */
export function getProfitCategoryLabel(category: ProfitCategory): string {
  switch (category) {
    case 'perfect':
      return 'Perfect 🔥';
    case 'good':
      return 'Good 💎';
    case 'medium':
      return 'Medium ⚖️';
    case 'bad':
      return 'Low ❌';
  }
}

/**
 * Toreca price data structure
 */
export interface TorecaPrice {
  cardNumber: string;
  setCode: string;
  rarity: string;
  price_jpy: number;
  in_stock: boolean;
  last_updated: string;
  url: string;
}

/**
 * Load Japan-Toreca prices from JSON file
 */
export async function loadTorecaPrices(): Promise<TorecaPrice[]> {
  try {
    // Server-side: use fs to read the file
    if (typeof window === 'undefined') {
      const fs = require('fs');
      const path = require('path');
      const filePath = path.join(process.cwd(), 'public/data/toreca-prices.json');
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(fileContent);
    }
    
    // Client-side: use fetch
    const response = await fetch('/data/toreca-prices.json');
    if (!response.ok) return [];
    return await response.json();
  } catch (error) {
    console.error('Failed to load Japan-Toreca prices:', error);
    return [];
  }
}

/**
 * Load Torecacamp prices from JSON file
 */
export async function loadTorecacampPrices(): Promise<TorecaPrice[]> {
  try {
    // Server-side: use fs to read the file
    if (typeof window === 'undefined') {
      const fs = require('fs');
      const path = require('path');
      const filePath = path.join(process.cwd(), 'public/data/torecacamp-prices.json');
      
      // Check if file exists
      if (!fs.existsSync(filePath)) {
        console.log('Torecacamp prices file not found (not scraped yet)');
        return [];
      }
      
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(fileContent);
    }
    
    // Client-side: use fetch
    const response = await fetch('/data/torecacamp-prices.json');
    if (!response.ok) return [];
    return await response.json();
  } catch (error) {
    console.error('Failed to load Torecacamp prices:', error);
    return [];
  }
}

/**
 * Combined Toreca data from both sources
 */
export interface TorecaMatch {
  // Japan-Toreca data
  japanToreca: {
    price_jpy: number;
    in_stock: boolean;
    url: string;
  } | null;
  // Torecacamp data
  torecacamp: {
    price_jpy: number;
    in_stock: boolean;
    url: string;
  } | null;
  // Best price (lowest of both)
  lowestPrice: number | null;
  lowestSource: 'japan-toreca' | 'torecacamp' | null;
}

/**
 * Match Toreca price to a card
 */
export function matchTorecaPrice(
  cardSetName: string,
  cardNumber: string,
  torecaPrices: TorecaPrice[]
): TorecaPrice | null {
  // Extract set code from set name (e.g., "Black Bolt" -> "SV11B")
  const setCode = cardSetName.toLowerCase().includes('black bolt')
    ? 'SV11B'
    : cardSetName.toLowerCase().includes('white flare')
    ? 'SV11W'
    : null;

  if (!setCode) return null;

  return torecaPrices.find(
    (tp) => tp.setCode === setCode && tp.cardNumber === cardNumber
  ) || null;
}

/**
 * Match card to prices from BOTH Toreca sources
 */
export function matchBothTorecaSources(
  cardSetName: string,
  cardNumber: string,
  japanTorecaPrices: TorecaPrice[],
  torecacampPrices: TorecaPrice[]
): TorecaMatch {
  // Extract set code
  const setCode = cardSetName.toLowerCase().includes('black bolt')
    ? 'SV11B'
    : cardSetName.toLowerCase().includes('white flare')
    ? 'SV11W'
    : null;
  
  const result: TorecaMatch = {
    japanToreca: null,
    torecacamp: null,
    lowestPrice: null,
    lowestSource: null
  };
  
  if (!setCode) return result;
  
  // Match Japan-Toreca
  const japanMatch = japanTorecaPrices.find(
    (tp) => tp.setCode === setCode && tp.cardNumber === cardNumber
  );
  
  if (japanMatch) {
    result.japanToreca = {
      price_jpy: japanMatch.price_jpy,
      in_stock: japanMatch.in_stock,
      url: japanMatch.url
    };
  }
  
  // Match Torecacamp
  const campMatch = torecacampPrices.find(
    (tp) => tp.setCode === setCode && tp.cardNumber === cardNumber
  );
  
  if (campMatch) {
    result.torecacamp = {
      price_jpy: campMatch.price_jpy,
      in_stock: campMatch.in_stock,
      url: campMatch.url
    };
  }
  
  // Determine lowest price
  if (result.japanToreca && result.torecacamp) {
    if (result.japanToreca.price_jpy <= result.torecacamp.price_jpy) {
      result.lowestPrice = result.japanToreca.price_jpy;
      result.lowestSource = 'japan-toreca';
    } else {
      result.lowestPrice = result.torecacamp.price_jpy;
      result.lowestSource = 'torecacamp';
    }
  } else if (result.japanToreca) {
    result.lowestPrice = result.japanToreca.price_jpy;
    result.lowestSource = 'japan-toreca';
  } else if (result.torecacamp) {
    result.lowestPrice = result.torecacamp.price_jpy;
    result.lowestSource = 'torecacamp';
  }
  
  return result;
}
