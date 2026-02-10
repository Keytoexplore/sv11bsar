import { RefreshButton } from '@/components/RefreshButton';
import {
  getExchangeRate,
  loadTorecaPrices,
  loadTorecacampPrices,
  matchBothTorecaSources,
  calculateProfitMargin,
  convertJPYtoUSD,
} from '@/lib/arbitrage';

type RarityType = 'Special Art Rare' | 'Art Rare' | 'Super Rare';

async function getCardsForSet(apiKey: string, setName: string, rarity: RarityType) {
  return fetch(
    'https://www.pokemonpricetracker.com/api/v2/cards?' + new URLSearchParams({
      language: 'japanese',
      search: setName,
      rarity: rarity,
      limit: '50',
      includeHistory: 'true',
      days: '30',
      sortBy: 'price',
      sortOrder: 'desc'
    }),
    {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
      next: { revalidate: 259200 } // 3 days = 259200 seconds
    }
  );
}

async function getAllCards() {
  const apiKey = process.env.POKEMON_API_KEY;
  
  if (!apiKey) {
    throw new Error('POKEMON_API_KEY is not set');
  }

  try {
    // Fetch all combinations: 2 sets × 3 rarities = 6 requests
    const rarities: RarityType[] = ['Special Art Rare', 'Art Rare', 'Super Rare'];
    const sets = ['Black Bolt', 'White Flare'];

    const requests = sets.flatMap(set =>
      rarities.map(rarity => getCardsForSet(apiKey, set, rarity))
    );

    const responses = await Promise.all(requests);

    // Check for errors
    for (const response of responses) {
      if (!response.ok) {
        const error = await response.json();
        console.error('API Error:', error);
        return { data: [], metadata: null, error: error.error || 'Failed to fetch' };
      }
    }

    const allData = await Promise.all(responses.map(r => r.json()));

    // Combine all cards
    const combinedCards = allData
      .flatMap(data => data.data)
      .sort((a, b) => b.prices.market - a.prices.market);

    // Combine metadata
    const totalApiCalls = allData.reduce(
      (sum, data) => sum + (data.metadata.apiCallsConsumed?.total || 0),
      0
    );

    const totalCards = allData.reduce(
      (sum, data) => sum + data.metadata.total,
      0
    );

    const combinedMetadata = {
      total: totalCards,
      count: combinedCards.length,
      limit: 300,
      offset: 0,
      hasMore: allData.some(data => data.metadata.hasMore),
      language: 'japanese',
      includes: allData[0].metadata.includes,
      historyWindow: allData[0].metadata.historyWindow,
      apiCallsConsumed: {
        total: totalApiCalls,
        breakdown: {
          cards: totalApiCalls,
          history: 0,
          ebay: 0
        },
        costPerCard: 1
      },
      planRestrictions: allData[0].metadata.planRestrictions
    };

    // Integrate Toreca prices from BOTH sources and calculate arbitrage
    const [japanTorecaPrices, torecacampPrices, exchangeRate] = await Promise.all([
      loadTorecaPrices(),
      loadTorecacampPrices(),
      getExchangeRate(),
    ]);

    const cardsWithArbitrage = combinedCards.map((card) => {
      const torecaMatch = matchBothTorecaSources(
        card.setName,
        card.cardNumber,
        japanTorecaPrices,
        torecacampPrices
      );

      // If we have at least one Toreca price
      if (torecaMatch.lowestPrice) {
        const lowestUSD = convertJPYtoUSD(torecaMatch.lowestPrice, exchangeRate);
        const profitMargin = calculateProfitMargin(
          card.prices.market,
          torecaMatch.lowestPrice,
          exchangeRate
        );

        return {
          ...card,
          // Keep old fields for backwards compatibility (use lowest)
          toreca_jpy: torecaMatch.lowestPrice,
          toreca_usd: lowestUSD,
          toreca_url: torecaMatch.lowestSource === 'japan-toreca' 
            ? torecaMatch.japanToreca?.url 
            : torecaMatch.torecacamp?.url,
          toreca_in_stock: torecaMatch.lowestSource === 'japan-toreca'
            ? torecaMatch.japanToreca?.in_stock
            : torecaMatch.torecacamp?.in_stock,
          profit_margin: profitMargin,
          exchange_rate: exchangeRate,
          // New fields for both sources
          toreca_match: torecaMatch,
        };
      }

      return card;
    });

    // Sort by profit margin (descending) by default
    cardsWithArbitrage.sort((a, b) => {
      if (a.profit_margin === undefined) return 1;
      if (b.profit_margin === undefined) return -1;
      return b.profit_margin - a.profit_margin;
    });

    return { data: cardsWithArbitrage, metadata: combinedMetadata, error: null };
  } catch (error) {
    console.error('Fetch error:', error);
    return { data: [], metadata: null, error: 'Network error' };
  }
}

import { CardsWithFilters } from '@/components/CardsWithFilters';

export default async function Home() {
  const { data: cards, metadata, error } = await getAllCards();

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">
              SV11B & SV11W Rare Cards
            </h1>
            <p className="text-purple-200">
              Black Bolt & White Flare - SAR, AR & SR Price Tracker
            </p>
          </div>
          <RefreshButton />
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-200 px-6 py-4 rounded-lg mb-6">
            <p className="font-semibold">Error loading cards:</p>
            <p className="text-sm mt-1">{error}</p>
            {error.includes('limit') && (
              <p className="text-xs mt-2 opacity-75">
                API daily credit limit reached. Cards will refresh automatically when limit resets.
              </p>
            )}
          </div>
        )}

        {metadata && (
          <div className="bg-white/10 backdrop-blur-md rounded-lg p-4 mb-6 text-white">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-sm opacity-75">Total Cards</p>
                <p className="text-2xl font-bold">{metadata.total}</p>
              </div>
              <div>
                <p className="text-sm opacity-75">Loaded</p>
                <p className="text-2xl font-bold">{metadata.count}</p>
              </div>
              <div>
                <p className="text-sm opacity-75">Credits Used</p>
                <p className="text-2xl font-bold">{metadata.apiCallsConsumed?.total || 0}</p>
              </div>
              <div>
                <p className="text-sm opacity-75">Last Updated</p>
                <p className="text-sm font-mono mt-1">
                  {new Date().toLocaleTimeString()}
                </p>
              </div>
            </div>
          </div>
        )}

        <CardsWithFilters initialCards={cards} totalCards={metadata?.total || 0} />

        {cards.length === 0 && !error && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🎴</div>
            <p className="text-xl text-purple-200">No cards found</p>
            <p className="text-sm text-purple-300 mt-2">
              Check back later or try refreshing the page
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
// Cache bust 1770722664
