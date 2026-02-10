import { ArbitrageCard } from './ArbitrageCard';

interface ArbitrageCardProps {
  id: string;
  name: string;
  cardNumber: string;
  setName: string;
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
  toreca_jpy?: number;
  toreca_usd?: number;
  toreca_url?: string;
  toreca_in_stock?: boolean;
  profit_margin?: number;
  exchange_rate?: number;
}

interface ArbitrageCardGridProps {
  cards: ArbitrageCardProps[];
}

export function ArbitrageCardGrid({ cards }: ArbitrageCardGridProps) {
  if (!cards || cards.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {cards.map((card) => (
        <ArbitrageCard key={card.id} card={card} />
      ))}
    </div>
  );
}
