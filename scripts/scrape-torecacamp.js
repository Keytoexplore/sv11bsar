const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');

// Configuration
const SETS = [
  { code: 'SV11B', searchTerm: 'SV11B' },
  { code: 'SV11W', searchTerm: 'SV11W' },
  { code: 'M3', searchTerm: 'M3' },
  { code: 'M2a', searchTerm: 'M2a' }
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
  
  // Extract price from JSON-LD structured data
  // Priority: A- first, then fallback to B if A- not available
  let priceAMinus = null;
  let inStock = false;
  let conditionUsed = null;
  
  // Method 1: Parse JSON-LD
  $('script[type="application/ld+json"]').each((i, elem) => {
    try {
      const jsonText = $(elem).html();
      const jsonData = JSON.parse(jsonText);
      
      // Handle both single product and array of products
      const offers = Array.isArray(jsonData) ? jsonData.flatMap(item => item.offers || []) : (jsonData.offers || []);
      
      // First priority: Look for A-
      for (const offer of offers) {
        if (offer.name && offer.name.includes('【状態A-】')) {
          priceAMinus = Math.round(parseFloat(offer.price));
          inStock = offer.availability && !offer.availability.includes('OutOfStock');
          conditionUsed = 'A-';
          break;
        }
      }
      
      // Fallback: If no A-, use B
      if (!priceAMinus) {
        for (const offer of offers) {
          if (offer.name && offer.name.includes('【状態B】')) {
            priceAMinus = Math.round(parseFloat(offer.price));
            inStock = offer.availability && !offer.availability.includes('OutOfStock');
            conditionUsed = 'B';
            break;
          }
        }
      }
    } catch (e) {
      // Ignore JSON parse errors
    }
  });
  
  // Method 2: Parse Shopify Analytics meta data (if Method 1 failed)
  if (!priceAMinus) {
    const scriptText = $('body').html();
    const metaMatch = scriptText.match(/window\.ShopifyAnalytics\.meta\s*=\s*({[\s\S]*?});/);
    
    if (metaMatch) {
      try {
        const metaData = JSON.parse(metaMatch[1]);
        if (metaData.product && metaData.product.variants) {
          // Try A- first
          let variant = metaData.product.variants.find(v => 
            v.public_title && v.public_title.includes('【状態A-】')
          );
          
          if (variant) {
            priceAMinus = Math.round(variant.price / 100);
            inStock = true;
            conditionUsed = 'A-';
          } else {
            // Fallback to B
            variant = metaData.product.variants.find(v => 
              v.public_title && v.public_title.includes('【状態B】')
            );
            
            if (variant) {
              priceAMinus = Math.round(variant.price / 100);
              inStock = true;
              conditionUsed = 'B';
            }
          }
        }
      } catch (e) {
        // Ignore parse errors
      }
    }
  }
  
  if (!priceAMinus) {
    console.log(`  ⚠️  No A- or B price found for: ${title}`);
    return null;
  }
  
  return {
    cardNumber,
    setCode,
    rarity,
    price_jpy: priceAMinus,
    condition: conditionUsed, // 'A-' or 'B'
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
          console.log(`     ✅ ${cardData.cardNumber} ${cardData.rarity} - ¥${cardData.price_jpy} [${cardData.condition}] (${cardData.in_stock ? 'In Stock' : 'Sold Out'})`);
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
