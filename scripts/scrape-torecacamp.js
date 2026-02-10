const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');

// Configuration
const SETS = [
  { code: 'SV11B', searchTerm: 'SV11B' },
  { code: 'SV11W', searchTerm: 'SV11W' }
];
const RARITIES = ['SAR', 'AR', 'SR'];
const BASE_URL = 'https://torecacamp-pokemon.com';
const DELAY_MS = 2000; // 2 seconds between requests

// Helper: Sleep function
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Extract card data from product page HTML
function extractCardData(html, url) {
  const $ = cheerio.load(html);
  
  // Extract title: "ドリュウズex SAR SV11B 171/086"
  const title = $('h1').first().text().trim();
  
  // Skip PSA graded cards
  if (title.includes('PSA') || title.includes('psa')) {
    console.log(`  ⏭️  Skipping PSA card: ${title}`);
    return null;
  }
  
  // Parse title components
  const cardNumberMatch = title.match(/(\d+\/\d+)/);
  const setMatch = title.match(/(SV11[BW]|M3|M2a?|M1[LS])/i);
  const rarityMatch = title.match(/(SAR|AR|SR|BWR)/);
  
  if (!cardNumberMatch || !setMatch || !rarityMatch) {
    console.log(`  ⚠️  Could not parse: ${title}`);
    return null;
  }
  
  const cardNumber = cardNumberMatch[1];
  const setCode = setMatch[1].toUpperCase();
  const rarity = rarityMatch[1];
  
  // Extract A- price from radio buttons
  let priceAMinus = null;
  let inStock = false;
  
  // Look for radio button group containing conditions
  $('input[type="radio"]').each((i, elem) => {
    const $radio = $(elem);
    const $label = $radio.next();
    const labelText = $label.text().trim();
    
    // Look for 【状態A-】 condition
    if (labelText.includes('【状態A-】') || labelText.includes('状態A-')) {
      // Price is in a sibling element or nearby
      const priceText = $label.find('*').text() || $label.parent().text();
      const priceMatch = priceText.match(/¥\s*([\d,]+)/);
      
      if (priceMatch) {
        priceAMinus = parseInt(priceMatch[1].replace(/,/g, ''));
      }
      
      // Check if it's sold out
      const isSoldOut = labelText.includes('Sold Out') || labelText.includes('売り切れ') || labelText.includes('在庫なし');
      inStock = !isSoldOut;
    }
  });
  
  // Alternative: Look in radiogroup with aria structure
  if (!priceAMinus) {
    $('[role="radiogroup"] [role="radio"]').each((i, elem) => {
      const $radio = $(elem);
      const text = $radio.text();
      
      if (text.includes('【状態A-】')) {
        const priceMatch = text.match(/¥\s*([\d,]+)/);
        if (priceMatch) {
          priceAMinus = parseInt(priceMatch[1].replace(/,/g, ''));
          const isSoldOut = text.includes('Sold Out') || text.includes('売り切れ');
          inStock = !isSoldOut;
        }
      }
    });
  }
  
  if (!priceAMinus) {
    console.log(`  ⚠️  No A- price found for: ${title}`);
    return null;
  }
  
  return {
    cardNumber,
    setCode,
    rarity,
    price_jpy: priceAMinus,
    in_stock: inStock,
    last_updated: new Date().toISOString(),
    url
  };
}

// Search for cards and get product URLs
async function searchCards(setCode, rarity) {
  const searchTerm = `${setCode} ${rarity}`;
  const searchUrl = `${BASE_URL}/search?q=${encodeURIComponent(searchTerm)}`;
  
  console.log(`\n🔍 Searching: ${searchTerm}`);
  console.log(`   URL: ${searchUrl}`);
  
  try {
    const response = await axios.get(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    const $ = cheerio.load(response.data);
    const productUrls = [];
    
    // Find product links in search results
    $('a[href*="/products/"]').each((i, elem) => {
      const href = $(elem).attr('href');
      if (href && href.includes('/products/rc_')) {
        const fullUrl = href.startsWith('http') ? href : `${BASE_URL}${href}`;
        // Remove query params and deduplicate
        const cleanUrl = fullUrl.split('?')[0];
        if (!productUrls.includes(cleanUrl)) {
          productUrls.push(cleanUrl);
        }
      }
    });
    
    console.log(`   ✅ Found ${productUrls.length} products`);
    return productUrls;
    
  } catch (error) {
    console.error(`   ❌ Search failed: ${error.message}`);
    return [];
  }
}

// Scrape a single product page
async function scrapeProduct(url) {
  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    return extractCardData(response.data, url);
  } catch (error) {
    console.error(`   ❌ Failed to scrape ${url}: ${error.message}`);
    return null;
  }
}

// Main scraping function
async function scrapeAllCards() {
  console.log('🚀 Starting Torecacamp scraper...\n');
  
  const allCards = [];
  
  for (const set of SETS) {
    console.log(`\n📦 Processing set: ${set.code}`);
    
    for (const rarity of RARITIES) {
      // Search for cards
      const productUrls = await searchCards(set.code, rarity);
      await sleep(DELAY_MS);
      
      // Scrape each product
      for (const url of productUrls) {
        console.log(`\n  📄 Scraping: ${url}`);
        const cardData = await scrapeProduct(url);
        
        if (cardData) {
          allCards.push(cardData);
          console.log(`     ✅ ${cardData.cardNumber} ${cardData.rarity} - ¥${cardData.price_jpy} (${cardData.in_stock ? 'In Stock' : 'Sold Out'})`);
        }
        
        await sleep(DELAY_MS);
      }
    }
  }
  
  // Save results
  const outputPath = path.join(__dirname, '../public/data/torecacamp-prices.json');
  fs.writeFileSync(outputPath, JSON.stringify(allCards, null, 2));
  
  console.log(`\n✅ Scraping complete!`);
  console.log(`📁 Saved ${allCards.length} cards to: ${outputPath}`);
  
  // Stats
  const inStock = allCards.filter(c => c.in_stock).length;
  console.log(`\n📊 Stats:`);
  console.log(`   Total cards: ${allCards.length}`);
  console.log(`   In stock: ${inStock}`);
  console.log(`   Sold out: ${allCards.length - inStock}`);
  
  // Price range
  const prices = allCards.map(c => c.price_jpy);
  console.log(`   Price range: ¥${Math.min(...prices)} - ¥${Math.max(...prices)}`);
}

// Run scraper
scrapeAllCards().catch(console.error);
