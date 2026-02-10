'use client';

import Image from 'next/image';
import { useState } from 'react';
import {
  getProfitCategory,
  getProfitCategoryColors,
  getProfitCategoryLabel,
  convertJPYtoUSD,
  type TorecaMatch,
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
    // Arbitrage data (old fields for lowest price)
    toreca_jpy?: number;
    toreca_usd?: number;
    toreca_url?: string;
    toreca_in_stock?: boolean;
    profit_margin?: number;
    exchange_rate?: number;
    // New: both Toreca sources
    toreca_match?: TorecaMatch;
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

          {/* Both Toreca Sources */}
          {hasTorecaData && card.toreca_match && (
            <>
              {/* Japan-Toreca */}
              {card.toreca_match.japanToreca && (
                <div className={`bg-white/5 rounded-lg p-2 border-l-2 ${
                  card.toreca_match.lowestSource === 'japan-toreca' 
                    ? 'border-yellow-400' 
                    : 'border-transparent'
                }`}>
                  <div className="flex justify-between items-center mb-1">
                    <div className="flex items-center gap-1">
                      <p className="text-xs text-purple-300">Japan-Toreca</p>
                      {card.toreca_match.lowestSource === 'japan-toreca' && (
                        <span className="text-xs bg-yellow-500/20 text-yellow-300 px-1 rounded">
                          LOWEST
                        </span>
                      )}
                    </div>
                    {card.toreca_match.japanToreca.in_stock ? (
                      <span className="text-xs bg-green-500/20 text-green-300 px-2 py-0.5 rounded">
                        In Stock
                      </span>
                    ) : (
                      <span className="text-xs bg-gray-500/20 text-gray-300 px-2 py-0.5 rounded">
                        Out
                      </span>
                    )}
                  </div>
                  <div className="flex justify-between items-baseline">
                    <p className="text-lg font-bold text-blue-400">
                      {formatJPY(card.toreca_match.japanToreca.price_jpy)}
                    </p>
                    <p className="text-sm text-blue-300">
                      ≈ {formatPrice(convertJPYtoUSD(card.toreca_match.japanToreca.price_jpy, card.exchange_rate!))}
                    </p>
                  </div>
                </div>
              )}

              {/* Torecacamp */}
              {card.toreca_match.torecacamp && (
                <div className={`bg-white/5 rounded-lg p-2 border-l-2 ${
                  card.toreca_match.lowestSource === 'torecacamp' 
                    ? 'border-yellow-400' 
                    : 'border-transparent'
                }`}>
                  <div className="flex justify-between items-center mb-1">
                    <div className="flex items-center gap-1">
                      <p className="text-xs text-purple-300">Torecacamp</p>
                      {card.toreca_match.lowestSource === 'torecacamp' && (
                        <span className="text-xs bg-yellow-500/20 text-yellow-300 px-1 rounded">
                          LOWEST
                        </span>
                      )}
                    </div>
                    {card.toreca_match.torecacamp.in_stock ? (
                      <span className="text-xs bg-green-500/20 text-green-300 px-2 py-0.5 rounded">
                        In Stock
                      </span>
                    ) : (
                      <span className="text-xs bg-gray-500/20 text-gray-300 px-2 py-0.5 rounded">
                        Out
                      </span>
                    )}
                  </div>
                  <div className="flex justify-between items-baseline">
                    <p className="text-lg font-bold text-blue-400">
                      {formatJPY(card.toreca_match.torecacamp.price_jpy)}
                    </p>
                    <p className="text-sm text-blue-300">
                      ≈ {formatPrice(convertJPYtoUSD(card.toreca_match.torecacamp.price_jpy, card.exchange_rate!))}
                    </p>
                  </div>
                </div>
              )}
            </>
          )}

          {/* No Toreca Data */}
          {!hasTorecaData && (
            <div className="bg-white/5 rounded-lg p-2 text-center">
              <p className="text-xs text-gray-400">
                No Toreca prices available
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

          {/* Toreca Source Buttons */}
          {hasTorecaData && card.toreca_match && (
            <>
              {card.toreca_match.japanToreca && (
                <a
                  href={card.toreca_match.japanToreca.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full bg-blue-600 hover:bg-blue-700 text-white text-center py-2 rounded-lg transition-colors font-medium text-sm"
                >
                  Buy on Japan-Toreca →
                </a>
              )}
              {card.toreca_match.torecacamp && (
                <a
                  href={card.toreca_match.torecacamp.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full bg-cyan-600 hover:bg-cyan-700 text-white text-center py-2 rounded-lg transition-colors font-medium text-sm"
                >
                  Buy on Torecacamp →
                </a>
              )}
            </>
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
