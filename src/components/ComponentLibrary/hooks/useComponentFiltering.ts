import { useState, useEffect, useMemo, useCallback } from 'react';
import { Component, FilterState, SortMode } from '../types';
import { SORT_MODES } from '../constants';

const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

export const useComponentFiltering = (components: Component[]) => {
  const [filterState, setFilterState] = useState<FilterState>({
    searchQuery: '',
    selectedCategory: 'all',
    selectedTags: [],
    advancedFilters: {
      premium: 'all',
      complexity: 'all',
      responsive: 'all',
      rating: 'all',
      usage: 'all'
    },
    viewMode: 'grid',
    sortMode: 'name'
  });

  const debouncedSearchQuery = useDebounce(filterState.searchQuery, 300);

  // Memoized filter functions for performance
  const filterByCategory = useCallback((comp: Component, category: string) => {
    return category === 'all' || comp.category === category;
  }, []);

  const filterBySearch = useCallback((comp: Component, query: string) => {
    if (!query) return true;
    const searchTerm = query.toLowerCase();
    return (
      comp.name.toLowerCase().includes(searchTerm) ||
      comp.tags.some(tag => tag.toLowerCase().includes(searchTerm)) ||
      comp.category.toLowerCase().includes(searchTerm) ||
      comp.description?.toLowerCase().includes(searchTerm)
    );
  }, []);

  const filterByTags = useCallback((comp: Component, tags: string[]) => {
    return tags.length === 0 || tags.some(tag => comp.tags.includes(tag));
  }, []);

  const filterByAdvanced = useCallback((comp: Component, filters: FilterState['advancedFilters']) => {
    if (filters.premium !== 'all') {
      const isPremium = filters.premium === 'premium';
      if (comp.is_premium !== isPremium) return false;
    }

    if (filters.rating !== 'all') {
      const minRating = parseInt(filters.rating.replace('+', ''));
      if ((comp.rating || 0) < minRating) return false;
    }

    return true;
  }, []);

  const sortComponents = useCallback((a: Component, b: Component, sortMode: SortMode) => {
    switch (sortMode) {
      case SORT_MODES.NAME:
        return a.name.localeCompare(b.name);
      case SORT_MODES.CATEGORY:
        return a.category.localeCompare(b.category);
      case SORT_MODES.CREATED:
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      case SORT_MODES.POPULAR:
        return (b.usage_count || 0) - (a.usage_count || 0);
      case SORT_MODES.RATING:
        return (b.rating || 0) - (a.rating || 0);
      case SORT_MODES.USAGE:
        return (b.usage_count || 0) - (a.usage_count || 0);
      default:
        return 0;
    }
  }, []);

  // Memoized filtered and sorted components
  const filteredComponents = useMemo(() => {
    let filtered = components.filter(comp => 
      filterByCategory(comp, filterState.selectedCategory) &&
      filterBySearch(comp, debouncedSearchQuery) &&
      filterByTags(comp, filterState.selectedTags) &&
      filterByAdvanced(comp, filterState.advancedFilters)
    );

    return filtered.sort((a, b) => sortComponents(a, b, filterState.sortMode));
  }, [
    components,
    filterState.selectedCategory,
    debouncedSearchQuery,
    filterState.selectedTags,
    filterState.advancedFilters,
    filterState.sortMode,
    filterByCategory,
    filterBySearch,
    filterByTags,
    filterByAdvanced,
    sortComponents
  ]);

  // Get all unique tags (memoized)
  const allTags = useMemo(() => {
    const tags = new Set<string>();
    components.forEach(comp => comp.tags.forEach(tag => tags.add(tag)));
    return Array.from(tags).sort();
  }, [components]);

  const updateFilter = useCallback((updates: Partial<FilterState>) => {
    setFilterState(prev => ({ ...prev, ...updates }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilterState(prev => ({
      ...prev,
      searchQuery: '',
      selectedCategory: 'all',
      selectedTags: [],
      advancedFilters: {
        premium: 'all',
        complexity: 'all',
        responsive: 'all',
        rating: 'all',
        usage: 'all'
      }
    }));
  }, []);

  return {
    filterState,
    filteredComponents,
    allTags,
    updateFilter,
    clearFilters
  };
};