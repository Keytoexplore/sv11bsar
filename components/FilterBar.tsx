'use client';

import { useState } from 'react';

interface FilterBarProps {
  onFilterChange: (filters: FilterState) => void;
  totalCards: number;
  filteredCount: number;
}

export interface FilterState {
  set: 'all' | 'blackbolt' | 'whiteflare';
  rarity: 'all' | 'SAR' | 'AR' | 'SR';
  minPrice: number;
  maxPrice: number;
  sortBy: 'price-desc' | 'price-asc' | 'name' | 'number';
  searchTerm: string;
}

export function FilterBar({ onFilterChange, totalCards, filteredCount }: FilterBarProps) {
  const [filters, setFilters] = useState<FilterState>({
    set: 'all',
    rarity: 'all',
    minPrice: 0,
    maxPrice: 10000,
    sortBy: 'price-desc',
    searchTerm: '',
  });

  const [showAdvanced, setShowAdvanced] = useState(false);

  const updateFilter = (key: keyof FilterState, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
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
            className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">All Sets</option>
            <option value="blackbolt">Black Bolt (SV11B)</option>
            <option value="whiteflare">White Flare (SV11W)</option>
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
            className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
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
            className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
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
        {showAdvanced ? 'Hide' : 'Show'} Price Range
      </button>

      {/* Advanced Filters */}
      {showAdvanced && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-white/20">
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
      )}

      {/* Results Summary */}
      <div className="text-center pt-2 border-t border-white/20">
        <p className="text-purple-200">
          Showing <span className="font-bold text-white">{filteredCount}</span> of{' '}
          <span className="font-bold text-white">{totalCards}</span> cards
        </p>
      </div>
    </div>
  );
}
