'use client';

import Image from 'next/image';
import { useState } from 'react';
import {
  getProfitCategory,
  getProfitCategoryColors,
  getProfitCategoryLabel,
} from '@/lib/arbitrage';

interface ArbitrageCardProps {
  card: {
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
    // Arbitrage data
    toreca_jpy?: number;
    toreca_usd?: number;
    toreca_url?: string;
    toreca_in_stock?: boolean;
    profit_margin?: number;
    exchange_rate?: number;
  };
}

export function ArbitrageCard({ card }: ArbitrageCardProps) {
  const [imageError, setImageError] = useState(false);
  const imageUrl = card.imageCdnUrl400 || card.imageCdnUrl || '/placeholder-card.png';

  const hasTorecaData = card.toreca_jpy !== undefined;
  const profitCategory = card.profit_margin !== undefined
    ? getProfitCategory(card.profit_margin)
    : null;
  
  const categoryColors = profitCategory ? getProfitCategoryColors(profitCategory) : null;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const formatJPY = (price: number) => {
    return `¥${price.toLocaleString('ja-JP')}`;
  };

  return (
    <div
      className={`rounded-xl overflow-hidden hover:scale-105 transition-all duration-200 shadow-xl border-2 ${
        categoryColors ? `${categoryColors.bg} ${categoryColors.border}` : 'bg-white/10 border-white/20'
      }`}
    >
      {/* Profit Badge */}
      {profitCategory && categoryColors && (
        <div className={`${categoryColors.bg} ${categoryColors.text} px-4 py-2 text-center font-bold border-b-2 ${categoryColors.border}`}>
          <div className="flex items-center justify-between">
            <span className="text-sm">{getProfitCategoryLabel(profitCategory)}</span>
            <span className="text-xl">
              {card.profit_margin! >= 0 ? '+' : ''}{card.profit_margin}%
            </span>
          </div>
        </div>
      )}

      {/* Card Image */}
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

      {/* Card Info */}
      <div className="p-4 space-y-3 backdrop-blur-md bg-black/20">
        <div>
          <h3 className="text-lg font-bold text-white truncate" title={card.name}>
            {card.name}
          </h3>
          <p className="text-sm text-purple-200">
            #{card.cardNumber} • {card.rarity}
          </p>
        </div>

        {/* Price Comparison */}
        <div className="space-y-2">
          {/* TCGPlayer Price */}
          <div className="bg-white/5 rounded-lg p-2">
            <p className="text-xs text-purple-300 mb-1">TCGPlayer (Sell)</p>
            <p className="text-xl font-bold text-green-400">
              {formatPrice(card.prices.market)}
            </p>
          </div>

          {/* Toreca Price */}
          {hasTorecaData && (
            <div className="bg-white/5 rounded-lg p-2">
              <div className="flex justify-between items-center mb-1">
                <p className="text-xs text-purple-300">Japan-Toreca (Buy)</p>
                {card.toreca_in_stock ? (
                  <span className="text-xs bg-green-500/20 text-green-300 px-2 py-0.5 rounded">
                    In Stock
                  </span>
                ) : (
                  <span className="text-xs bg-gray-500/20 text-gray-300 px-2 py-0.5 rounded">
                    Out of Stock
                  </span>
                )}
              </div>
              <div className="flex justify-between items-baseline">
                <p className="text-lg font-bold text-blue-400">
                  {formatJPY(card.toreca_jpy!)}
                </p>
                <p className="text-sm text-blue-300">
                  ≈ {formatPrice(card.toreca_usd!)}
                </p>
              </div>
            </div>
          )}

          {/* No Toreca Data */}
          {!hasTorecaData && (
            <div className="bg-white/5 rounded-lg p-2 text-center">
              <p className="text-xs text-gray-400">
                No Toreca price available
              </p>
            </div>
          )}
        </div>

        {/* Stats */}
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

        {/* Action Buttons */}
        <div className="pt-2 space-y-2">
          <a
            href={card.tcgPlayerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full bg-purple-600 hover:bg-purple-700 text-white text-center py-2 rounded-lg transition-colors font-medium text-sm"
          >
            TCGPlayer →
          </a>

          {hasTorecaData && card.toreca_url && (
            <a
              href={card.toreca_url}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full bg-blue-600 hover:bg-blue-700 text-white text-center py-2 rounded-lg transition-colors font-medium text-sm"
            >
              Buy on Toreca →
            </a>
          )}
        </div>

        {/* Last Updated */}
        <p className="text-xs text-purple-400 text-center pt-2 border-t border-white/10">
          Updated: {new Date(card.prices.lastUpdated).toLocaleDateString()}
        </p>
      </div>
    </div>
  );
}
