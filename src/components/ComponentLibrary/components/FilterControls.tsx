import React, { memo } from 'react';
import { Search, X, Settings, Filter, ChevronDown } from 'lucide-react';
import { CATEGORIES, ADVANCED_FILTERS, SORT_MODES } from '../constants';
import { FilterState, SortMode } from '../types';

interface FilterControlsProps {
  filterState: FilterState;
  allTags: string[];
  onUpdateFilter: (updates: Partial<FilterState>) => void;
  onClearFilters: () => void;
  showAdvancedFilters: boolean;
  onToggleAdvancedFilters: () => void;
}

export const FilterControls: React.FC<FilterControlsProps> = memo(({
  filterState,
  allTags,
  onUpdateFilter,
  onClearFilters,
  showAdvancedFilters,
  onToggleAdvancedFilters
}) => {
  return (
    <>
      {/* Search */}
      <div className="relative mb-4">
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
          <Search className="w-4 h-4" />
        </div>
        <input
          type="text"
          placeholder="Search components, tags, categories..."
          value={filterState.searchQuery}
          onChange={(e) => onUpdateFilter({ searchQuery: e.target.value })}
          className="w-full bg-gray-800/80 text-white pl-10 pr-10 py-3 rounded-xl border border-gray-600/50 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all backdrop-blur-sm placeholder-gray-400"
        />
        {filterState.searchQuery && (
          <button
            onClick={() => onUpdateFilter({ searchQuery: '' })}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white hover:bg-gray-700 p-1 rounded transition-all"
          >
            <X className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* Advanced Filters Toggle */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={onToggleAdvancedFilters}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
            showAdvancedFilters 
              ? 'text-blue-400 bg-blue-500/20' 
              : 'text-gray-400 hover:text-white hover:bg-gray-700'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span className="text-sm">Advanced Filters</span>
          <ChevronDown className={`w-4 h-4 transition-transform ${showAdvancedFilters ? 'rotate-180' : ''}`} />
        </button>
        
        <button
          onClick={onClearFilters}
          className="text-xs text-blue-400 hover:text-blue-300 px-3 py-1 rounded-lg hover:bg-blue-500/10 transition-all"
        >
          Clear All
        </button>
      </div>

      {/* Advanced Filters Panel */}
      {showAdvancedFilters && (
        <div className="space-y-3 mb-4 p-3 bg-gray-800/30 rounded-xl border border-gray-600/30">
          <div className="grid grid-cols-2 gap-2">
            <select
              value={filterState.advancedFilters.premium}
              onChange={(e) => onUpdateFilter({
                advancedFilters: { ...filterState.advancedFilters, premium: e.target.value }
              })}
              className="bg-gray-700/50 text-white text-xs px-2 py-2 rounded-lg border border-gray-600 focus:border-blue-500 outline-none"
            >
              <option value="all">All Types</option>
              <option value="free">Free Only</option>
              <option value="premium">Premium Only</option>
            </select>
            <select
              value={filterState.advancedFilters.rating}
              onChange={(e) => onUpdateFilter({
                advancedFilters: { ...filterState.advancedFilters, rating: e.target.value }
              })}
              className="bg-gray-700/50 text-white text-xs px-2 py-2 rounded-lg border border-gray-600 focus:border-blue-500 outline-none"
            >
              <option value="all">Any Rating</option>
              <option value="4+">4+ Stars</option>
              <option value="3+">3+ Stars</option>
              <option value="2+">2+ Stars</option>
            </select>
          </div>

          {/* Tag Filter */}
          {allTags.length > 0 && (
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-2">Filter by Tags</label>
              <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto">
                {allTags.slice(0, 12).map(tag => (
                  <button
                    key={tag}
                    onClick={() => {
                      const newTags = filterState.selectedTags.includes(tag)
                        ? filterState.selectedTags.filter(t => t !== tag)
                        : [...filterState.selectedTags, tag];
                      onUpdateFilter({ selectedTags: newTags });
                    }}
                    className={`text-xs px-2 py-1 rounded-full transition-all ${
                      filterState.selectedTags.includes(tag)
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Sort and Category Controls */}
      <div className="flex items-center gap-2 mb-4">
        <select
          value={filterState.sortMode}
          onChange={(e) => onUpdateFilter({ sortMode: e.target.value as SortMode })}
          className="flex-1 bg-gray-800/80 text-white px-3 py-2 rounded-lg border border-gray-600/50 focus:border-blue-500 outline-none text-sm"
        >
          <option value={SORT_MODES.NAME}>Sort by Name</option>
          <option value={SORT_MODES.CATEGORY}>Sort by Category</option>
          <option value={SORT_MODES.CREATED}>Sort by Created</option>
          <option value={SORT_MODES.POPULAR}>Sort by Popular</option>
          <option value={SORT_MODES.RATING}>Sort by Rating</option>
          <option value={SORT_MODES.USAGE}>Sort by Usage</option>
        </select>
      </div>

      {/* Category Filter */}
      {/* <div className="grid grid-cols-3 gap-2 mb-4">
        {CATEGORIES.slice(0, 9).map(category => (
          <button
            key={category}
            onClick={() => onUpdateFilter({ selectedCategory: category })}
            className={`px-3 py-2 rounded-lg text-xs font-medium capitalize transition-all relative overflow-hidden ${
              filterState.selectedCategory === category
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg transform scale-105'
                : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700 border border-gray-600/30 hover:border-gray-500'
            }`}
          >
            {category}
            {filterState.selectedCategory === category && (
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-400/20 animate-pulse"></div>
            )}
          </button>
        ))}
      </div> */}

      {/* Active Filters Display */}
      {(filterState.selectedTags.length > 0 || filterState.selectedCategory !== 'all' || filterState.searchQuery) && (
        <div className="flex flex-wrap gap-2 mb-4 p-3 bg-gray-800/20 rounded-xl border border-gray-700/30">
          {filterState.searchQuery && (
            <span className="bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full text-sm flex items-center gap-1">
              Search: "{filterState.searchQuery}"
              <button onClick={() => onUpdateFilter({ searchQuery: '' })}>
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          
          {filterState.selectedCategory !== 'all' && (
            <span className="bg-green-500/20 text-green-300 px-3 py-1 rounded-full text-sm flex items-center gap-1 capitalize">
              {filterState.selectedCategory}
              <button onClick={() => onUpdateFilter({ selectedCategory: 'all' })}>
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          
          {filterState.selectedTags.map(tag => (
            <span key={tag} className="bg-purple-500/20 text-purple-300 px-3 py-1 rounded-full text-sm flex items-center gap-1">
              {tag}
              <button onClick={() => {
                const newTags = filterState.selectedTags.filter(t => t !== tag);
                onUpdateFilter({ selectedTags: newTags });
              }}>
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </>
  );
});

FilterControls.displayName = 'FilterControls';