import React, { useState, useCallback, useEffect, lazy, Suspense } from 'react';
import { Upload, Layers, ChevronDown, X, Maximize2, ExternalLink, List, Grid3x3 as Grid3X3, BookOpen, Heart, TrendingUp, Sparkles, User, Users, Globe, Star } from 'lucide-react';
import { ComponentCard } from './components/ComponentCard';
import { FilterControls } from './components/FilterControls';
import { PaginationControls } from './components/PaginationControls';
import { ComponentPreviewModal } from './modals/ComponentPreviewModal';
import { useComponentData } from './hooks/useComponentData';
import { useComponentFiltering } from './hooks/useComponentFiltering';
import { useFavorites } from './hooks/useFavorites';
import { usePagination } from './hooks/usePagination';
import { Component, ComponentLibraryProps } from './types';
import { VIEW_MODES } from './constants';
import toast, { Toaster } from 'react-hot-toast';
import { componentService, supabase, profileService } from '../../lib/supabase';

const LazyUploadModal = lazy(() => import('./modals/UploadModal'));
const LazyAIModal = lazy(() => import('./modals/AIModal'));
const LazyViewAllModal = lazy(() => import('./modals/ViewAllModal'));

type CreatorTab = 'all' | 'mine' | string;

export const ComponentLibrary: React.FC<ComponentLibraryProps> = ({
  onComponentSelect,
  onComponentDrag
}) => {
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showAIModal, setShowAIModal] = useState(false);
  const [showPreview, setShowPreview] = useState<Component | null>(null);
  const [showViewAllModal, setShowViewAllModal] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [bulkSelected, setBulkSelected] = useState<Set<string>>(new Set());
  const [draggedComponent, setDraggedComponent] = useState<Component | null>(null);
  const [selectedCreatorTab, setSelectedCreatorTab] = useState<CreatorTab>('all');
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isPremiumUser, setIsPremiumUser] = useState(false);

  const { components, loading, error, refreshComponents } = useComponentData();
  const { filterState, filteredComponents, allTags, updateFilter, clearFilters } = useComponentFiltering(components);
  const { favoriteIds, toggleFavorite, addToFavorites } = useFavorites();
  

  useEffect(() => {
    const fetchPremiumStatus = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    setCurrentUserId(user.id);

    try {
      const isPremium = await profileService.checkPremiumStatus(user.id);
      setIsPremiumUser(isPremium);
      console.log('Premium status:', isPremium);
    } catch (err) {
      console.error('Error checking premium status:', err);
    }
  };

  fetchPremiumStatus();
  }, []);

  const creators = React.useMemo(() => {
    const creatorSet = new Map<string, { id: string; name: string; count: number }>();
    components.forEach(component => {
      if (component.created_by) {
        const existing = creatorSet.get(component.created_by);
        if (existing) {
          existing.count++;
        } else {
          creatorSet.set(component.created_by, {
            id: component.created_by,
            name: `Creator ${component.created_by.slice(0, 8)}...`,
            count: 1
          });
        }
      }
    });
    return Array.from(creatorSet.values());
  }, [components]);

  const myComponentsCount = React.useMemo(() => {
    if (!currentUserId) return 0;
    return components.filter(c => c.created_by === currentUserId).length;
  }, [components, currentUserId]);

  const creatorFilteredComponents = React.useMemo(() => {
    if (selectedCreatorTab === 'all') return filteredComponents;
    if (selectedCreatorTab === 'mine') {
      return filteredComponents.filter(component => component.created_by === currentUserId);
    }
    return filteredComponents.filter(component => component.created_by === selectedCreatorTab);
  }, [filteredComponents, selectedCreatorTab, currentUserId]);

  const {
    currentPage,
    totalPages,
    paginatedItems,
    goToPage,
    hasNextPage,
    hasPreviousPage,
    totalItems,
    resetPagination
  } = usePagination(creatorFilteredComponents);

  useEffect(() => {
    resetPagination();
  }, [creatorFilteredComponents.length, resetPagination]);

  const handleDragStart = useCallback((e: React.DragEvent, component: Component) => {
    setDraggedComponent(component);
    e.dataTransfer.setData('application/json', JSON.stringify(component));
    e.dataTransfer.effectAllowed = 'copy';

    const dragImage = document.createElement('div');
    dragImage.className = 'bg-white p-4 rounded-lg shadow-xl border-2 border-blue-400';
    dragImage.innerHTML = `
      <div class="text-sm font-medium text-gray-800 mb-2">${component.name}</div>
      <div class="text-xs text-gray-500">${component.category}</div>
    `;
    dragImage.style.position = 'absolute';
    dragImage.style.top = '-1000px';
    document.body.appendChild(dragImage);
    e.dataTransfer.setDragImage(dragImage, 100, 50);

    setTimeout(() => document.body.removeChild(dragImage), 0);

    if (onComponentDrag) {
      onComponentDrag(component);
    }
  }, [onComponentDrag]);

  const handleDragEnd = useCallback(() => {
    setDraggedComponent(null);
  }, []);

  const handleBulkAction = useCallback((action: string) => {
    const selectedComponents = components.filter(c => bulkSelected.has(c.id));
    const dataStr = JSON.stringify(selectedComponents, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    switch (action) {
      case 'favorite':
        addToFavorites([...bulkSelected]);
        toast.success(`Added ${bulkSelected.size} components to favorites`);
        break;
      case 'export':
        link.href = url;
        link.download = 'components-export.json';
        link.click();
        toast.success('Components exported successfully');
        break;
    }
    setBulkSelected(new Set());
  }, [bulkSelected, components, addToFavorites]);

  const handleUpload = useCallback(async (formData: any) => {
    try {
      await componentService.create(formData);
      await refreshComponents();
      setShowUploadModal(false);
      toast.success('Component uploaded successfully!');
    } catch (error) {
      console.error('Upload failed:', error);
      toast.error('Failed to upload component');
    }
  }, [refreshComponents]);

  const handleAIGenerate = useCallback(async (description: string, category: string, options: any, code: string) => {
    try {
      const newComponent = {
        name: description.split(' ').slice(0, 4).join(' ') + '...',
        category: category,
        html: code,
        tags: [category, options.style, options.colorScheme, 'ai-generated'],
        description: description,
        ai_generated: true
      };

      await componentService.create(newComponent);
      await refreshComponents();

      setShowAIModal(false);
      toast.success('AI component generated and saved successfully!');

      const allComponents = await componentService.getAll();
      const savedComponent = allComponents.find((c: Component) => c.code === code);
      if (savedComponent) {
        setShowPreview(savedComponent);
      }
    } catch (error) {
      console.error('AI generation failed:', error);
      toast.error('Failed to generate component');
    }
  }, [refreshComponents]);

  const handleBulkSelect = useCallback((componentId: string, selected: boolean) => {
    setBulkSelected(prev => {
      const newSet = new Set(prev);
      if (selected) {
        newSet.add(componentId);
      } else {
        newSet.delete(componentId);
      }
      return newSet;
    });
  }, []);

  if (loading) {
    return (
      <div className={`${sidebarCollapsed ? 'w-16' : 'w-80'} flex-shrink-0 bg-gradient-to-br from-gray-900 to-gray-800 border-r border-gray-700 p-4 transition-all duration-300`}>
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-700 rounded-lg"></div>
          <div className="h-10 bg-gray-700 rounded-lg"></div>
          <div className="grid grid-cols-3 gap-2">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-8 bg-gray-700 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${sidebarCollapsed ? 'w-16' : 'w-80'} flex-shrink-0 bg-gradient-to-br from-gray-900 to-gray-800 border-r border-gray-700 p-4 transition-all duration-300`}>
        <div className="text-center text-red-400 p-4">
          <p className="mb-2">Failed to load components</p>
          <button
            onClick={refreshComponents}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Toaster position="top-right" />
      <div className={`${sidebarCollapsed ? 'w-16' : 'w-80'} flex-shrink-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border-r border-gray-700/50 flex flex-col h-full transition-all duration-300 sticky overflow-y-auto overflow-x-hidden h-screen top-0 left-0`}>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.05),transparent_50%)]"></div>

        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="absolute top-4 -right-3 bg-gray-800 border border-gray-600 text-gray-300 hover:text-white p-1.5 rounded-full shadow-lg z-10 transition-all hover:scale-110"
        >
          <ChevronDown className={`w-3 h-3 transition-transform ${sidebarCollapsed ? 'rotate-90' : '-rotate-90'}`} />
        </button>

        {!sidebarCollapsed ? (
          <>
            <div className="p-4 border-b border-gray-700/50 bg-gray-900/50 backdrop-blur-sm relative z-10">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-white text-lg font-semibold flex items-center gap-2">
                  <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
                    <Layers className="w-5 h-5 text-white" />
                  </div>
                  <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                    Component Library
                  </span>
                </h2>
                  {isPremiumUser && (
                    <div className="top-1 right-1 bg-gradient-to-br from-yellow-400 to-orange-500 p-1 rounded">
                       <Star className="w-2.5 h-2.5 text-white fill-current" />
                    </div>
                  )}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowViewAllModal(true)}
                    className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-all group"
                    title="View All Components"
                  >
                    <Maximize2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  </button>
                  <button
                    onClick={() => {
                      const nextMode = filterState.viewMode === VIEW_MODES.GRID
                        ? VIEW_MODES.LIST
                        : filterState.viewMode === VIEW_MODES.LIST
                        ? VIEW_MODES.CARD
                        : VIEW_MODES.GRID;
                      updateFilter({ viewMode: nextMode });
                    }}
                    className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-all group"
                    title={`Switch to ${filterState.viewMode === VIEW_MODES.GRID ? 'list' : filterState.viewMode === VIEW_MODES.LIST ? 'card' : 'grid'} view`}
                  >
                    {filterState.viewMode === VIEW_MODES.GRID ? <List className="w-4 h-4" /> :
                     filterState.viewMode === VIEW_MODES.LIST ? <Grid3X3 className="w-4 h-4" /> :
                     <BookOpen className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="mb-4">
                <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
                  <button
                    onClick={() => setSelectedCreatorTab('all')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                      selectedCreatorTab === 'all'
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25'
                        : 'bg-gray-700/50 text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    <Globe className="w-3.5 h-3.5" />
                    All
                    <span className="bg-gray-900/50 px-1.5 py-0.5 rounded text-xs">
                      {components.length}
                    </span>
                  </button>

                  <button
                    onClick={() => setSelectedCreatorTab('mine')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                      selectedCreatorTab === 'mine'
                        ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/25'
                        : 'bg-gray-700/50 text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    <User className="w-3.5 h-3.5" />
                    My Components
                    <span className="bg-gray-900/50 px-1.5 py-0.5 rounded text-xs">
                      {myComponentsCount}
                    </span>
                  </button>

                  {creators.slice(0, 3).map(creator => (
                    <button
                      key={creator.id}
                      onClick={() => setSelectedCreatorTab(creator.id)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                        selectedCreatorTab === creator.id
                          ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/25'
                          : 'bg-gray-700/50 text-gray-300 hover:bg-gray-700'
                      }`}
                    >
                      <Users className="w-3.5 h-3.5" />
                      {creator.name}
                      <span className="bg-gray-900/50 px-1.5 py-0.5 rounded text-xs">
                        {creator.count}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <FilterControls
                filterState={filterState}
                allTags={allTags}
                onUpdateFilter={updateFilter}
                onClearFilters={clearFilters}
                showAdvancedFilters={showAdvancedFilters}
                onToggleAdvancedFilters={() => setShowAdvancedFilters(!showAdvancedFilters)}
              />
            </div>

            <div className="flex-1 overflow-y-auto p-4 relative z-10">
              <div className="space-y-2 pb-4">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setShowUploadModal(true)}
                    className="flex items-center justify-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-3 py-3 rounded-xl text-sm font-medium transition-all shadow-lg hover:shadow-green-500/25 hover:scale-105"
                  >
                    <Upload className="w-4 h-4" />
                    Upload
                  </button>
                  <button
                    onClick={() => setShowAIModal(true)}
                    className="flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-3 py-3 rounded-xl text-sm font-medium transition-all shadow-lg hover:shadow-purple-500/25 hover:scale-105"
                  >
                    <Sparkles className="w-4 h-4" />
                    AI Gen
                  </button>
                </div>

                <button
                  onClick={() => setShowViewAllModal(true)}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30 text-blue-300 px-3 py-2.5 rounded-xl text-sm font-medium transition-all hover:from-blue-600/30 hover:to-purple-600/30 hover:border-blue-400/50"
                >
                  <ExternalLink className="w-4 h-4" />
                  View All Components
                </button>
              </div>

              {bulkSelected.size > 0 && (
                <div className="mb-4 p-3 bg-blue-500/20 border border-blue-500/30 rounded-lg flex items-center justify-between mt-3">
                  <span className="text-blue-300 text-sm font-medium">
                    {bulkSelected.size} selected
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleBulkAction('favorite')}
                      className="text-xs bg-red-500/20 text-red-300 px-2 py-1 rounded hover:bg-red-500/30"
                    >
                      <Heart className="w-3 h-3 inline mr-1" />
                      Favorite
                    </button>
                    <button
                      onClick={() => setBulkSelected(new Set())}
                      className="text-xs bg-gray-500/20 text-gray-300 px-2 py-1 rounded hover:bg-gray-500/30"
                    >
                      Clear
                    </button>
                  </div>
                </div>
              )}

              <div className={`${
                filterState.viewMode === VIEW_MODES.GRID ? 'space-y-3' :
                filterState.viewMode === VIEW_MODES.LIST ? 'space-y-2' :
                'space-y-4'
              }`}>
                {paginatedItems.map(component => (
                  <ComponentCard
                    key={component.id}
                    component={component}
                    viewMode={filterState.viewMode}
                    isFavorite={favoriteIds.has(component.id)}
                    isSelected={bulkSelected.has(component.id)}
                    isPremiumUser={isPremiumUser}
                    onSelect={() => {
                      if (component.is_premium && !isPremiumUser) {
                        toast.error('This is a premium component. Upgrade to access.');
                        return;
                      }
                      onComponentSelect(component);
                    }}
                    onPreview={() => setShowPreview(component)}
                    onFavorite={() => toggleFavorite(component.id)}
                    onBulkSelect={handleBulkSelect}
                    onDragStart={(e) => handleDragStart(e, component)}
                    onDragEnd={handleDragEnd}
                    isDragging={draggedComponent?.id === component.id}
                  />
                ))}
              </div>

              {creatorFilteredComponents.length === 0 && (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🔍</div>
                  <div className="text-gray-400 mb-2 text-lg font-medium">No components found</div>
                  <p className="text-sm text-gray-500 mb-6 max-w-xs mx-auto">
                    {selectedCreatorTab !== 'all'
                      ? `No components found for this creator`
                      : filterState.searchQuery || filterState.selectedCategory !== 'all'
                      ? 'Try adjusting your search or category filter, or create a new component'
                      : 'Upload your first component to get started'
                    }
                  </p>
                  <div className="flex gap-2 justify-center">
                    {selectedCreatorTab !== 'all' && (
                      <button
                        onClick={() => setSelectedCreatorTab('all')}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors text-sm"
                      >
                        Show All
                      </button>
                    )}
                    {(filterState.searchQuery || filterState.selectedCategory !== 'all') && (
                      <button
                        onClick={clearFilters}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors text-sm"
                      >
                        Clear Filters
                      </button>
                    )}
                    <button
                      onClick={() => setShowUploadModal(true)}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors text-sm"
                    >
                      Upload Component
                    </button>
                  </div>
                </div>
              )}

              {creatorFilteredComponents.length > 0 && (
                <PaginationControls
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={totalItems}
                  itemsPerPage={24}
                  onPageChange={goToPage}
                  hasNextPage={hasNextPage}
                  hasPreviousPage={hasPreviousPage}
                />
              )}
            </div>

            <div className="p-4 border-t border-gray-700/50 bg-gray-900/50 backdrop-blur-sm relative z-10">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">
                    {creatorFilteredComponents.length} of {components.length} components
                  </span>
                  <div className="flex items-center gap-3 text-gray-400">
                    <div className="flex items-center gap-1">
                      <Heart className="w-4 h-4 text-red-400" />
                      {favoriteIds.size}
                    </div>
                    <div className="flex items-center gap-1">
                      <TrendingUp className="w-4 h-4 text-green-400" />
                      {components.filter(c => c.usage_count && c.usage_count > 10).length}
                    </div>
                  </div>
                </div>

                {filterState.selectedTags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {filterState.selectedTags.map(tag => (
                      <span
                        key={tag}
                        className="text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded-full flex items-center gap-1"
                      >
                        {tag}
                        <button
                          onClick={() => {
                            const newTags = filterState.selectedTags.filter(t => t !== tag);
                            updateFilter({ selectedTags: newTags });
                          }}
                          className="hover:bg-blue-500/30 rounded-full p-0.5"
                        >
                          <X className="w-2 h-2" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="p-4 flex flex-col items-center space-y-4">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
              <Layers className="w-5 h-5 text-white" />
            </div>

            <div className="flex flex-col gap-2">
              <button
                onClick={() => setShowViewAllModal(true)}
                className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-all"
                title="View All Components"
              >
                <Maximize2 className="w-4 h-4" />
              </button>

              <button
                onClick={() => setShowUploadModal(true)}
                className="p-2 text-green-400 hover:text-white hover:bg-green-600 rounded-lg transition-all"
                title="Upload Component"
              >
                <Upload className="w-4 h-4" />
              </button>

              <button
                onClick={() => setShowAIModal(true)}
                className="p-2 text-purple-400 hover:text-white hover:bg-purple-600 rounded-lg transition-all"
                title="AI Generate"
              >
                <Sparkles className="w-4 h-4" />
              </button>
            </div>

            <div className="text-center">
              <div className="text-xs text-gray-500">{components.length}</div>
              <div className="text-xs text-gray-600">items</div>
            </div>
          </div>
        )}
      </div>

      <Suspense fallback={null}>
        {showViewAllModal && (
          <LazyViewAllModal
            components={components}
            favoriteIds={favoriteIds}
            currentUserId={currentUserId}
            onClose={() => setShowViewAllModal(false)}
            onComponentSelect={onComponentSelect}
            onPreview={setShowPreview}
            isPremiumUser={isPremiumUser}
            onFavorite={toggleFavorite}
            onUpload={() => setShowUploadModal(true)}
            onAIGenerate={() => setShowAIModal(true)}
          />
        )}

        {showUploadModal && (
          <LazyUploadModal
            onClose={() => setShowUploadModal(false)}
            onUpload={handleUpload}
          />
        )}

        {showAIModal && (
          <LazyAIModal
            onClose={() => setShowAIModal(false)}
            onGenerate={handleAIGenerate}
          />
        )}
      </Suspense>

      {showPreview && (
        <ComponentPreviewModal
          component={showPreview}
          isPremiumUser={isPremiumUser}
          onClose={() => setShowPreview(null)}
          onSelect={() => {
            onComponentSelect(showPreview);
            setShowPreview(null);
          }}
        />
      )}
    </>
  );
};
