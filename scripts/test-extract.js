const axios = require('axios');
const cheerio = require('cheerio');

async function test() {
  const url = 'https://shop.japan-toreca.com/products/pokemon-215303-a-damaged';
  console.log('Testing extraction on:', url);
  
  const response = await axios.get(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
  });
  
  const $ = cheerio.load(response.data);
  
  const title = $('h1').first().text().trim();
  console.log('\nTitle:', title);
  
  // Find price
  let price = null;
  $('*').each((i, elem) => {
    const text = $(elem).text();
    if (text.includes('¥') && !price) {
      const match = text.match(/¥\s*([\d,]+)/);
      if (match) {
        price = parseInt(match[1].replace(/,/g, ''));
        return false;
      }
    }
  });
  
  console.log('Price:', price);
  
  // Check for card details
  const cardNumberMatch = title.match(/\((\d+\/\d+)\)/);
  const setMatch = title.match(/\[(SV11[BW])\]/);
  const rarityMatch = title.match(/(SAR|AR|SR|BWR)/);
  
  console.log('Card number:', cardNumberMatch ? cardNumberMatch[1] : 'NOT FOUND');
  console.log('Set:', setMatch ? setMatch[1] : 'NOT FOUND');
  console.log('Rarity:', rarityMatch ? rarityMatch[1] : 'NOT FOUND');
  
  // Check stock
  const bodyText = $('body').text();
  const inStock = bodyText.includes('在庫') && !bodyText.includes('在庫切れ');
  console.log('In stock:', inStock);
}

test().catch(console.error);
