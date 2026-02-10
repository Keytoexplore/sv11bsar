const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');

// Configuration
const SETS = ['SV11B', 'SV11W'];
const BASE_URL = 'https://shop.japan-toreca.com';
const DELAY_MS = 1500; // Be nice to their server

// Helper: Sleep function
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Extract card data from product page HTML
function extractCardData(html, url) {
  const $ = cheerio.load(html);
  
  // Extract title: "【状態A-】ドリュウズex SAR (171/086) [SV11B]"
  const title = $('h1').first().text().trim();
  
  // Parse title components
  const cardNumberMatch = title.match(/\((\d+\/\d+)\)/);
  const setMatch = title.match(/\[(SV11[BW])\]/);
  const rarityMatch = title.match(/(SAR|AR|SR|BWR)/);
  
  if (!cardNumberMatch || !setMatch || !rarityMatch) {
    return null;
  }
  
  const cardNumber = cardNumberMatch[1];
  const setCode = setMatch[1];
  const rarity = rarityMatch[1];
  
  // Extract price - look for ¥ symbols
  let price = null;
  $('*').each((i, elem) => {
    const text = $(elem).text();
    if (text.includes('¥') && !price) {
      const match = text.match(/¥\s*([\d,]+)/);
      if (match) {
        price = parseInt(match[1].replace(/,/g, ''));
        return false; // Break loop
      }
    }
  });
  
  // Check stock - look for inventory text
  const bodyText = $('body').text();
  const inStock = bodyText.includes('在庫') && !bodyText.includes('在庫切れ') && !bodyText.includes('売り切れ');
  
  return {
    cardNumber,
    setCode,
    rarity,
    price_jpy: price,
    in_stock: inStock,
    last_updated: new Date().toISOString(),
    url
  };
}

// Scrape a single search results page
async function scrapeSearchPage(setCode, page = 1) {
  const searchUrl = `${BASE_URL}/search?q=${setCode}&page=${page}`;
  
  console.log(`  Fetching page ${page}: ${searchUrl}`);
  
  try {
    const response = await axios.get(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    const $ = cheerio.load(response.data);
    const productLinks = [];
    
    // Find all product links with A- condition
    $('a[href*="/products/"]').each((i, elem) => {
      const href = $(elem).attr('href');
      const text = $(elem).text();
      
      // Only A- condition cards with our target rarities
      if (href && text.includes('【状態A-】') && 
          (text.includes('SAR') || text.includes('AR') || text.includes('SR'))) {
        // Extract set code from title to verify
        const titleSetMatch = text.match(/\[(SV11[BW])\]/);
        if (titleSetMatch && titleSetMatch[1] === setCode) {
          const fullUrl = href.startsWith('http') ? href : `${BASE_URL}${href}`;
          // Remove query params for deduplication
          const cleanUrl = fullUrl.split('?')[0];
          if (!productLinks.includes(cleanUrl)) {
            productLinks.push(cleanUrl);
          }
        }
      }
    });
    
    // Check if there's a next page
    const hasNextPage = $('a:contains("次")').length > 0;
    
    return { productLinks, hasNextPage };
    
  } catch (error) {
    console.error(`    Error fetching page ${page}:`, error.message);
    return { productLinks: [], hasNextPage: false };
  }
}

// Scrape all pages for a set
async function scrapeSet(setCode) {
  console.log(`\n📦 Scraping ${setCode}...`);
  
  const allProductLinks = [];
  let page = 1;
  let hasMore = true;
  
  // Paginate through search results
  while (hasMore && page <= 20) { // Limit to 20 pages max for safety
    const { productLinks, hasNextPage } = await scrapeSearchPage(setCode, page);
    allProductLinks.push(...productLinks);
    hasMore = hasNextPage;
    page++;
    
    if (hasMore) {
      await sleep(DELAY_MS);
    }
  }
  
  console.log(`  Found ${allProductLinks.length} A- condition products`);
  
  // Scrape each product page
  const cards = [];
  for (let i = 0; i < allProductLinks.length; i++) {
    const url = allProductLinks[i];
    try {
      console.log(`  [${i + 1}/${allProductLinks.length}] ${url.split('/').pop()}`);
      
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });
      
      const cardData = extractCardData(response.data, url);
      
      if (cardData) {
        cards.push(cardData);
        console.log(`      ✓ ${cardData.cardNumber} ${cardData.rarity} ¥${cardData.price_jpy}`);
      } else {
        console.log(`      ✗ Could not parse card data`);
      }
      
      // Rate limiting
      await sleep(DELAY_MS);
      
    } catch (error) {
      console.error(`      Error: ${error.message}`);
    }
  }
  
  return cards;
}

// Main scraper
async function scrapeToreca() {
  console.log('🕷️  Toreca Scraper Starting...\n');
  console.log('Target: A- condition SAR/AR/SR cards from SV11B & SV11W');
  
  const allCards = [];
  
  for (const setCode of SETS) {
    const cards = await scrapeSet(setCode);
    allCards.push(...cards);
  }
  
  // Deduplicate by card number + set + rarity (in case of duplicates)
  const uniqueCards = Array.from(
    new Map(
      allCards.map(card => [
        `${card.setCode}-${card.cardNumber}-${card.rarity}`,
        card
      ])
    ).values()
  );
  
  // Save to JSON
  const outputPath = path.join(__dirname, '../public/data/toreca-prices.json');
  const outputDir = path.dirname(outputPath);
  
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  fs.writeFileSync(outputPath, JSON.stringify(uniqueCards, null, 2));
  
  // Summary
  console.log(`\n✅ Scraping Complete!`);
  console.log(`   Total unique cards: ${uniqueCards.length}`);
  console.log(`   Saved to: ${outputPath}`);
  
  const summary = {};
  uniqueCards.forEach(card => {
    const key = `${card.setCode} ${card.rarity}`;
    summary[key] = (summary[key] || 0) + 1;
  });
  
  console.log('\n📊 Summary:');
  Object.entries(summary)
    .sort(([a], [b]) => a.localeCompare(b))
    .forEach(([key, count]) => {
      console.log(`   ${key}: ${count} cards`);
    });
}

// Run
if (require.main === module) {
  scrapeToreca().catch(error => {
    console.error('\n❌ Fatal error:', error);
    process.exit(1);
  });
}

module.exports = { scrapeToreca };
