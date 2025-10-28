export type ViewMode = 'grid' | 'list' | 'card' | 'masonry';
export type SortMode = 'name' | 'category' | 'created' | 'popular' | 'rating' | 'usage';

export interface AdvancedFilters {
  premium: string;
  complexity: string;
  responsive: string;
  rating: string;
  usage: string;
}

export interface ComponentLibraryProps {
  onComponentSelect: (component: Component) => void;
  onComponentDrag?: (component: Component) => void;
}

export interface FilterState {
  searchQuery: string;
  selectedCategory: string;
  selectedTags: string[];
  advancedFilters: AdvancedFilters;
  viewMode: ViewMode;
  sortMode: SortMode;
}

export interface PaginationState {
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
}

// Re-export Component type (assuming it exists in a shared types file)
export type { Component } from '../../types';