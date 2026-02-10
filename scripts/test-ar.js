const axios = require('axios');
const cheerio = require('cheerio');

async function testAR() {
  const searchUrl = 'https://torecacamp-pokemon.com/search?q=SV11B+AR';
  console.log('🔍 Searching:', searchUrl);
  
  const response = await axios.get(searchUrl, {
    headers: {'User-Agent': 'Mozilla/5.0'}
  });
  
  const $ = cheerio.load(response.data);
  const productUrls = [];
  
  $('a[href*="/products/"]').each((i, elem) => {
    const href = $(elem).attr('href');
    if (href && href.includes('/products/rc_') && !productUrls.includes(href)) {
      const fullUrl = href.startsWith('http') ? href : `https://torecacamp-pokemon.com${href}`;
      productUrls.push(fullUrl.split('?')[0]);
    }
  });
  
  console.log(`✅ Found ${productUrls.length} product URLs`);
  console.log('\nFirst 5 products:');
  productUrls.slice(0, 5).forEach((url, i) => {
    console.log(`  ${i+1}. ${url}`);
  });
  
  // Test scrape first product
  if (productUrls.length > 0) {
    console.log('\n📄 Testing first product...');
    const testUrl = productUrls[0];
    const prodResponse = await axios.get(testUrl, {
      headers: {'User-Agent': 'Mozilla/5.0'}
    });
    
    const $prod = cheerio.load(prodResponse.data);
    const title = $prod('h1').first().text().trim();
    console.log(`   Title: ${title}`);
    
    // Check for A- price in JSON-LD
    let found = false;
    $prod('script[type="application/ld+json"]').each((i, elem) => {
      try {
        const jsonText = $prod(elem).html();
        const jsonData = JSON.parse(jsonText);
        const offers = Array.isArray(jsonData) ? jsonData.flatMap(item => item.offers || []) : (jsonData.offers || []);
        
        const aMinusOffer = offers.find(o => o.name && o.name.includes('【状態A-】'));
        if (aMinusOffer) {
          console.log(`   ✅ Found A- price: ¥${Math.round(aMinusOffer.price)}`);
          found = true;
        }
      } catch (e) {}
    });
    
    if (!found) {
      console.log('   ⚠️  No A- condition found');
      console.log('   Available conditions:');
      $prod('script[type="application/ld+json"]').each((i, elem) => {
        try {
          const jsonText = $prod(elem).html();
          const jsonData = JSON.parse(jsonText);
          const offers = Array.isArray(jsonData) ? jsonData.flatMap(item => item.offers || []) : (jsonData.offers || []);
          offers.forEach(o => {
            if (o.name) console.log(`      - ${o.name}: ¥${Math.round(o.price)}`);
          });
        } catch (e) {}
      });
    }
  }
}

testAR().catch(console.error);
