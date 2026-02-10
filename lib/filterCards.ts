import { FilterState } from '@/components/FilterBar';

export interface Card {
  id: string;
  name: string;
  cardNumber: string;
  rarity: string;
  setName: string;
  imageCdnUrl400?: string;
  imageCdnUrl?: string;
  prices: {
    market: number;
    low: number;
    sellers: number;
    listings: number;
    lastUpdated: string;
  };
  tcgPlayerUrl: string;
}

export function filterAndSortCards(cards: Card[], filters: FilterState): Card[] {
  // First, deduplicate cards by ID
  const uniqueCards = Array.from(
    new Map(cards.map(card => [card.id, card])).values()
  );
  
  return uniqueCards
    .filter((card) => {
      // Set filter
      if (filters.set !== 'all') {
        const setName = card.setName.toLowerCase();
        if (filters.set === 'blackbolt' && !setName.includes('black bolt')) return false;
        if (filters.set === 'whiteflare' && !setName.includes('white flare')) return false;
      }

      // Rarity filter
      if (filters.rarity !== 'all') {
        if (filters.rarity === 'SAR' && !card.rarity.includes('Special Art')) return false;
        if (filters.rarity === 'AR' && !card.rarity.includes('Art Rare')) return false;
        if (filters.rarity === 'SR' && !card.rarity.includes('Super Rare')) return false;
      }

      // Price range filter
      if (card.prices.market < filters.minPrice || card.prices.market > filters.maxPrice) {
        return false;
      }

      // Search term filter
      if (filters.searchTerm) {
        const search = filters.searchTerm.toLowerCase();
        const matchesName = card.name.toLowerCase().includes(search);
        const matchesNumber = card.cardNumber.toLowerCase().includes(search);
        if (!matchesName && !matchesNumber) return false;
      }

      return true;
    })
    .sort((a, b) => {
      switch (filters.sortBy) {
        case 'price-desc':
          return b.prices.market - a.prices.market;
        case 'price-asc':
          return a.prices.market - b.prices.market;
        case 'name':
          return a.name.localeCompare(b.name);
        case 'number':
          return a.cardNumber.localeCompare(b.cardNumber);
        default:
          return 0;
      }
    });
}
