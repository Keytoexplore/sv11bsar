import { CardGrid } from '@/components/CardGrid';
import { RefreshButton } from '@/components/RefreshButton';

async function getSARCards() {
  const apiKey = process.env.POKEMON_API_KEY;
  
  if (!apiKey) {
    throw new Error('POKEMON_API_KEY is not set');
  }

  try {
    const response = await fetch(
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
        next: { revalidate: 3600 } // Revalidate every hour
      }
    );

    if (!response.ok) {
      const error = await response.json();
      console.error('API Error:', error);
      return { data: [], metadata: null, error: error.error || 'Failed to fetch' };
    }

    const result = await response.json();
    return result;
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
              SV11B Black Bolt - SAR Cards
            </h1>
            <p className="text-purple-200">
              Special Art Rare price tracker
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
