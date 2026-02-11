'use client';

import { useState } from 'react';

interface FilterBarProps {
  onApplyFilters: (filters: FilterState) => void;
  totalCards: number;
  filteredCount: number;
}

export interface FilterState {
  set: 'all' | 'blackbolt' | 'whiteflare' | 'm3' | 'm2a' | 'm2' | 'm1l' | 'm1s';
  rarity: 'all' | 'SAR' | 'AR' | 'SR';
  minPrice: number;
  maxPrice: number;
  minProfit: number;
  stockStatus: 'all' | 'in-stock' | 'out-of-stock';
  sortBy: 'price-desc' | 'price-asc' | 'name' | 'number' | 'profit';
  searchTerm: string;
}

export function FilterBar({ onApplyFilters, totalCards, filteredCount }: FilterBarProps) {
  const [filters, setFilters] = useState<FilterState>({
    set: 'all',
    rarity: 'all',
    minPrice: 0,
    maxPrice: 10000,
    minProfit: 0,
    stockStatus: 'all',
    sortBy: 'profit',
    searchTerm: '',
  });

  const [showAdvanced, setShowAdvanced] = useState(false);

  const updateFilter = (key: keyof FilterState, value: any) => {
    setFilters({ ...filters, [key]: value });
  };

  const applyFilters = () => {
    onApplyFilters(filters);
  };

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 mb-6 space-y-4">
      {/* Main Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Search */}
        <div>
          <label className="block text-sm font-medium text-purple-200 mb-2">
            Search Card
          </label>
          <input
            type="text"
            placeholder="Search by name..."
            value={filters.searchTerm}
            onChange={(e) => updateFilter('searchTerm', e.target.value)}
            className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-purple-300/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        {/* Set Filter */}
        <div>
          <label className="block text-sm font-medium text-purple-200 mb-2">
            Set
          </label>
          <select
            value={filters.set}
            onChange={(e) => updateFilter('set', e.target.value)}
            className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 [&>option]:text-black [&>option]:bg-white"
          >
            <option value="all">All Sets</option>
            <option value="blackbolt">Black Bolt (SV11B)</option>
            <option value="whiteflare">White Flare (SV11W)</option>
            <option value="m3">M3: Nihil Zero</option>
            <option value="m2a">M2a: High Class Pack MEGA Dream ex</option>
            <option value="m2">M2: Mega Set 2</option>
            <option value="m1l">M1L: Mega Brave</option>
            <option value="m1s">M1S: Mega Symphonia</option>
          </select>
        </div>

        {/* Rarity Filter */}
        <div>
          <label className="block text-sm font-medium text-purple-200 mb-2">
            Rarity
          </label>
          <select
            value={filters.rarity}
            onChange={(e) => updateFilter('rarity', e.target.value)}
            className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 [&>option]:text-black [&>option]:bg-white"
          >
            <option value="all">All Rarities</option>
            <option value="SAR">Special Art Rare (SAR)</option>
            <option value="AR">Art Rare (AR)</option>
            <option value="SR">Super Rare (SR)</option>
          </select>
        </div>

        {/* Sort */}
        <div>
          <label className="block text-sm font-medium text-purple-200 mb-2">
            Sort By
          </label>
          <select
            value={filters.sortBy}
            onChange={(e) => updateFilter('sortBy', e.target.value)}
            className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 [&>option]:text-black [&>option]:bg-white"
          >
            <option value="profit">💰 Profit Margin (Best First)</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="name">Name (A-Z)</option>
            <option value="number">Card Number</option>
          </select>
        </div>
      </div>

      {/* Advanced Filters Toggle */}
      <button
        onClick={() => setShowAdvanced(!showAdvanced)}
        className="text-purple-300 hover:text-purple-100 text-sm flex items-center gap-2"
      >
        <svg
          className={`w-4 h-4 transition-transform ${showAdvanced ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
        {showAdvanced ? 'Hide' : 'Show'} Advanced Filters
      </button>

      {/* Advanced Filters */}
      {showAdvanced && (
        <div className="space-y-4 pt-4 border-t border-white/20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-purple-200 mb-2">
                Min Price ($)
              </label>
              <input
                type="number"
                value={filters.minPrice}
                onChange={(e) => updateFilter('minPrice', parseFloat(e.target.value) || 0)}
                className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                min="0"
                step="0.01"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-purple-200 mb-2">
                Max Price ($)
              </label>
              <input
                type="number"
                value={filters.maxPrice}
                onChange={(e) => updateFilter('maxPrice', parseFloat(e.target.value) || 10000)}
                className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                min="0"
                step="0.01"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-purple-200 mb-2">
                Min Profit Margin (%)
              </label>
              <input
                type="number"
                value={filters.minProfit}
                onChange={(e) => updateFilter('minProfit', parseFloat(e.target.value) || 0)}
                className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                min="0"
                max="1000"
                step="5"
              />
              <p className="text-xs text-purple-400 mt-1">
                Only show cards with {filters.minProfit}%+ profit
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-purple-200 mb-2">
                Stock Status
              </label>
              <select
                value={filters.stockStatus}
                onChange={(e) => updateFilter('stockStatus', e.target.value)}
                className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 [&>option]:text-black [&>option]:bg-white"
              >
                <option value="all">All Cards</option>
                <option value="in-stock">In Stock Only</option>
                <option value="out-of-stock">Out of Stock Only</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4 border-t border-white/20">
        <button
          onClick={applyFilters}
          className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
        >
          Apply Filters
        </button>
        <button
          onClick={() => {
            setFilters({
              set: 'all',
              rarity: 'all',
              minPrice: 0,
              maxPrice: 10000,
              minProfit: 0,
              stockStatus: 'all',
              sortBy: 'profit',
              searchTerm: '',
            });
          }}
          className="px-4 py-3 bg-white/5 hover:bg-white/10 text-purple-200 font-medium rounded-lg transition-colors border border-white/20"
        >
          Reset
        </button>
      </div>

      {/* Results Summary */}
      <div className="text-center pt-4">
        <p className="text-purple-200">
          Showing <span className="font-bold text-white">{filteredCount}</span> of{' '}
          <span className="font-bold text-white">{totalCards}</span> cards
        </p>
      </div>
    </div>
  );
}
