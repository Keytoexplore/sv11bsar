import { Card } from './Card';

interface PokemonCard {
  id: string;
  name: string;
  cardNumber: string;
  rarity: string;
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
  priceHistory?: Array<{
    date: string;
    price: number;
  }>;
}

interface CardGridProps {
  cards: PokemonCard[];
}

export function CardGrid({ cards }: CardGridProps) {
  if (!cards || cards.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {cards.map((card) => (
        <Card key={card.id} card={card} />
      ))}
    </div>
  );
}
