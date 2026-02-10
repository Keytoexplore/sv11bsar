'use client';

import Image from 'next/image';
import { useState } from 'react';

interface CardProps {
  card: {
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
  };
}

export function Card({ card }: CardProps) {
  const [imageError, setImageError] = useState(false);
  const imageUrl = card.imageCdnUrl400 || card.imageCdnUrl || '/placeholder-card.png';

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-xl overflow-hidden hover:scale-105 transition-transform duration-200 shadow-xl border border-white/20">
      <div className="relative aspect-[3/4] bg-gradient-to-br from-purple-900/50 to-blue-900/50">
        {!imageError ? (
          <Image
            src={imageUrl}
            alt={card.name}
            fill
            className="object-contain p-2"
            onError={() => setImageError(true)}
            unoptimized
          />
        ) : (
          <div className="flex items-center justify-center h-full text-white/50">
            <div className="text-center">
              <div className="text-4xl mb-2">🎴</div>
              <p className="text-sm">Image unavailable</p>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 space-y-3">
        <div>
          <h3 className="text-lg font-bold text-white truncate" title={card.name}>
            {card.name}
          </h3>
          <p className="text-sm text-purple-200">
            #{card.cardNumber} • {card.rarity}
          </p>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-purple-300">Market Price</span>
            <span className="text-xl font-bold text-green-400">
              {formatPrice(card.prices.market)}
            </span>
          </div>

          {card.prices.low > 0 && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-purple-300">Low Price</span>
              <span className="text-lg font-semibold text-blue-400">
                {formatPrice(card.prices.low)}
              </span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/10">
            <div className="text-center">
              <p className="text-xs text-purple-300">Sellers</p>
              <p className="text-sm font-semibold text-white">{card.prices.sellers}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-purple-300">Listings</p>
              <p className="text-sm font-semibold text-white">{card.prices.listings}</p>
            </div>
          </div>
        </div>

        <div className="pt-2 space-y-2">
          <p className="text-xs text-purple-400">
            Updated: {formatDate(card.prices.lastUpdated)}
          </p>

          <a
            href={card.tcgPlayerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full bg-purple-600 hover:bg-purple-700 text-white text-center py-2 rounded-lg transition-colors font-medium text-sm"
          >
            View on TCGPlayer →
          </a>
        </div>
      </div>
    </div>
  );
}
