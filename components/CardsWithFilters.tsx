'use client';

import { useState, useMemo } from 'react';
import { FilterBar, FilterState } from './FilterBar';
import { ArbitrageCardGrid } from './ArbitrageCardGrid';
import { filterAndSortCards, Card } from '@/lib/filterCards';

interface CardsWithFiltersProps {
  initialCards: Card[];
  totalCards: number;
}

export function CardsWithFilters({ initialCards, totalCards }: CardsWithFiltersProps) {
  const [appliedFilters, setAppliedFilters] = useState<FilterState>({
    set: 'all',
    rarity: 'all',
    minPrice: 0,
    maxPrice: 10000,
    minProfit: 0,
    stockStatus: 'all',
    sortBy: 'profit',
    searchTerm: '',
  });

  const filteredCards = useMemo(() => {
    return filterAndSortCards(initialCards, appliedFilters);
  }, [initialCards, appliedFilters]);

  const handleApplyFilters = (filters: FilterState) => {
    setAppliedFilters(filters);
  };

  return (
    <>
      <FilterBar
        onApplyFilters={handleApplyFilters}
        totalCards={totalCards}
        filteredCount={filteredCards.length}
      />
      <ArbitrageCardGrid cards={filteredCards} />
      {filteredCards.length === 0 && (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">🔍</div>
          <p className="text-xl text-purple-200">No cards match your filters</p>
          <p className="text-sm text-purple-300 mt-2">
            Try adjusting your search criteria
          </p>
        </div>
      )}
    </>
  );
}
