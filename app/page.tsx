import { CardGrid } from '@/components/CardGrid';
import { RefreshButton } from '@/components/RefreshButton';

async function getSARCards() {
  const apiKey = process.env.POKEMON_API_KEY;
  
  if (!apiKey) {
    throw new Error('POKEMON_API_KEY is not set');
  }

  try {
    // Fetch both Black Bolt (SV11B) and White Flare (SV11W) SAR cards
    const [blackBoltResponse, whiteFlareResponse] = await Promise.all([
      fetch(
        'https://www.pokemonpricetracker.com/api/v2/cards?' + new URLSearchParams({
          language: 'japanese',
          search: 'Black Bolt',
          rarity: 'Special Art Rare',
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
          next: { revalidate: 3600 }
        }
      ),
      fetch(
        'https://www.pokemonpricetracker.com/api/v2/cards?' + new URLSearchParams({
          language: 'japanese',
          search: 'White Flare',
          rarity: 'Special Art Rare',
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
          next: { revalidate: 3600 }
        }
      )
    ]);

    if (!blackBoltResponse.ok || !whiteFlareResponse.ok) {
      const error = !blackBoltResponse.ok 
        ? await blackBoltResponse.json() 
        : await whiteFlareResponse.json();
      console.error('API Error:', error);
      return { data: [], metadata: null, error: error.error || 'Failed to fetch' };
    }

    const blackBoltData = await blackBoltResponse.json();
    const whiteFlareData = await whiteFlareResponse.json();

    // Combine cards from both sets
    const combinedCards = [...blackBoltData.data, ...whiteFlareData.data]
      .sort((a, b) => b.prices.market - a.prices.market); // Sort by price descending

    // Combine metadata
    const combinedMetadata = {
      total: blackBoltData.metadata.total + whiteFlareData.metadata.total,
      count: combinedCards.length,
      limit: 100,
      offset: 0,
      hasMore: blackBoltData.metadata.hasMore || whiteFlareData.metadata.hasMore,
      language: 'japanese',
      includes: blackBoltData.metadata.includes,
      historyWindow: blackBoltData.metadata.historyWindow,
      apiCallsConsumed: {
        total: (blackBoltData.metadata.apiCallsConsumed?.total || 0) + 
               (whiteFlareData.metadata.apiCallsConsumed?.total || 0),
        breakdown: {
          cards: (blackBoltData.metadata.apiCallsConsumed?.breakdown?.cards || 0) +
                 (whiteFlareData.metadata.apiCallsConsumed?.breakdown?.cards || 0),
          history: (blackBoltData.metadata.apiCallsConsumed?.breakdown?.history || 0) +
                   (whiteFlareData.metadata.apiCallsConsumed?.breakdown?.history || 0),
          ebay: 0
        },
        costPerCard: 1
      },
      planRestrictions: blackBoltData.metadata.planRestrictions
    };

    return { data: combinedCards, metadata: combinedMetadata, error: null };
  } catch (error) {
    console.error('Fetch error:', error);
    return { data: [], metadata: null, error: 'Network error' };
  }
}

export default async function Home() {
  const { data: cards, metadata, error } = await getSARCards();

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">
              SV11B & SV11W SAR Cards
            </h1>
            <p className="text-purple-200">
              Black Bolt & White Flare - Special Art Rare price tracker
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
                <p className="text-sm opacity-75">Showing</p>
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

        <CardGrid cards={cards} />

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
