const axios = require('axios');
const cheerio = require('cheerio');

async function test() {
  const url = 'https://torecacamp-pokemon.com/products/rc_itvbjlnst51k_xuau';
  console.log('Testing:', url);
  
  const response = await axios.get(url, {headers: {'User-Agent': 'Mozilla/5.0'}});
  const $ = cheerio.load(response.data);
  
  const title = $('h1').first().text().trim();
  console.log('Title:', title);
  
  let priceAMinus = null;
  let conditionUsed = null;
  
  $('script[type="application/ld+json"]').each((i, elem) => {
    try {
      const jsonData = JSON.parse($(elem).html());
      const offers = Array.isArray(jsonData) ? jsonData.flatMap(item => item.offers || []) : (jsonData.offers || []);
      
      // Try A- first
      for (const offer of offers) {
        if (offer.name && offer.name.includes('【状態A-】')) {
          priceAMinus = Math.round(parseFloat(offer.price));
          conditionUsed = 'A-';
          break;
        }
      }
      
      // Fallback to B
      if (!priceAMinus) {
        for (const offer of offers) {
          if (offer.name && offer.name.includes('【状態B】')) {
            priceAMinus = Math.round(parseFloat(offer.price));
            conditionUsed = 'B';
            break;
          }
        }
      }
    } catch (e) {}
  });
  
  if (priceAMinus) {
    console.log('✅ Found:', '¥' + priceAMinus, '[' + conditionUsed + ']');
  } else {
    console.log('❌ No A- or B price found');
  }
}

test().catch(console.error);
