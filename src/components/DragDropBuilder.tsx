import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
  DragOverEvent,
} from '@dnd-kit/core';
import { File, Home, ChevronDown } from 'lucide-react';
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import { DroppedComponent, DeviceType } from './types';
import { SortableComponent } from './SortableComponent';
import { UserProfile } from './UserProfile';
import { UserSettings } from './UserSettings';
import { useAuth } from '../contexts/AuthContext';
import { Monitor, Tablet, Smartphone, Eye, Settings, Save, Undo, Redo, Copy, Grid3x3 as Grid3X3, Ruler, ZoomIn, ZoomOut, Layers, Move, RotateCcw, Trash2, Plus, Download, History, Palette, Code, Play, FolderOpen } from 'lucide-react';
import toast from 'react-hot-toast';
import { UserProjects } from './UserProjects';
import { GlobalConfigModal, GlobalConfig, defaultConfig } from './GlobalConfigModal';
import { Settings as SettingsIcon } from 'lucide-react';

interface Page {
  id: string;
  name: string;
  slug: string;
  components: DroppedComponent[];
  isHome?: boolean;
  createdAt: string;
}

interface DragDropBuilderProps {
  droppedComponents: DroppedComponent[];
  onComponentsChange: (components: DroppedComponent[]) => void;
  onPreview: () => void;
  onSave: () => void;
  onSettings: () => void;
  onMyProjects?: () => void;
  currentProjectId?: string | null;
  onProjectIdChange?: (id: string | null) => void;
  pages?: Page[];  // Add ? to make it optional
  activePageId?: string;  // Add ? to make it optional
  onPageChange?: (pageId: string) => void;  // Add ? to make it optional
  onPagesChange?: (pages: Page[]) => void;  // Add ? to make it optional
}

interface HistoryState {
  components: DroppedComponent[];
  timestamp: number;
}

interface UserData {
  name: string;
  email: string;
  avatar?: string;
  joinDate: string;
}

export const DragDropBuilder: React.FC<DragDropBuilderProps> = ({
  droppedComponents,
  onComponentsChange,
  onPreview,
  onSave,
  onSettings,
  onMyProjects,
  currentProjectId,
  onProjectIdChange,
  pages,
  activePageId,
  onPageChange,
  onPagesChange
}) => {
  const { user, loading, updateProfile, signOut } = useAuth();
  
  const [activeId, setActiveId] = useState<string | null>(null);
  const [deviceType, setDeviceType] = useState<DeviceType>('desktop');
  const [zoomLevel, setZoomLevel] = useState(100);
  const [showGrid, setShowGrid] = useState(false);
  const [showRuler, setShowRuler] = useState(false);
  const [selectedComponents, setSelectedComponents] = useState<Set<string>>(new Set());
  const [history, setHistory] = useState<HistoryState[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [clipboardComponent, setClipboardComponent] = useState<DroppedComponent | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [showUserSettings, setShowUserSettings] = useState(false);
  const [showProjects, setShowProjects] = useState(false);
  const [showPageManager, setShowPageManager] = useState(false);
  const [globalConfig, setGlobalConfig] = useState<GlobalConfig>(defaultConfig);
  const [showGlobalConfig, setShowGlobalConfig] = useState(false);

  const activePage = pages.find(p => p.id === activePageId) || pages[0];
  
  const canvasRef = useRef<HTMLDivElement>(null);

  const handleGlobalConfigSave = useCallback((config: GlobalConfig) => {
    setGlobalConfig(config);
    // Optionally save to localStorage or backend
    localStorage.setItem('globalConfig', JSON.stringify(config));
    toast.success('Global config applied to all components');
  }, []);

  useEffect(() => {
    const savedConfig = localStorage.getItem('globalConfig');
    if (savedConfig) {
      try {
        setGlobalConfig(JSON.parse(savedConfig));
      } catch (e) {
        console.error('Failed to load global config:', e);
      }
    }
  }, []);


  const handleAddPage = useCallback(() => {
    if (!pages || !onPagesChange || !onPageChange) return;
    
    const pageNumber = pages.length + 1;
    const newPage: Page = {
      id: `page-${Date.now()}`,
      name: `Page ${pageNumber}`,
      slug: `page-${pageNumber}`,
      components: [],
      createdAt: new Date().toISOString()
    };
    onPagesChange([...pages, newPage]);
    onPageChange(newPage.id);
    toast.success(`Created: ${newPage.name}`);
  }, [pages, onPagesChange, onPageChange]);
  
  const handleDeletePage = useCallback((pageId: string) => {
    if (!pages || !onPagesChange || !onPageChange) return;
    
    if (pages.length === 1) {
      toast.error('Cannot delete the last page');
      return;
    }
    
    const pageToDelete = pages.find(p => p.id === pageId);
    if (pageToDelete?.isHome) {
      toast.error('Cannot delete the home page');
      return;
    }
    
    const newPages = pages.filter(p => p.id !== pageId);
    onPagesChange(newPages);
    
    if (activePageId === pageId) {
      onPageChange(pages[0].id);
    }
    
    toast.success('Page deleted');
  }, [pages, activePageId, onPagesChange, onPageChange]);

  // Convert user data for display - simplified and fast
  const userData: UserData = React.useMemo(() => {
    if (user) {
      return {
        name: user.full_name || user.email?.split('@')[0] || 'User',
        email: user.email || '',
        avatar: user.avatar_url,
        joinDate: 'Member' // Simplified to avoid date parsing
      };
    }
    return {
      name: 'Guest User',
      email: '',
      joinDate: 'Today'
    };
  }, [user]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // History management
  const addToHistory = useCallback((components: DroppedComponent[]) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push({
      components: [...components],
      timestamp: Date.now()
    });
    
    if (newHistory.length > 50) {
      newHistory.shift();
    }
    
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [history, historyIndex]);

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const prevState = history[historyIndex - 1];
      onComponentsChange(prevState.components);
      setHistoryIndex(historyIndex - 1);
      toast.success('Action undone');
    }
  }, [history, historyIndex, onComponentsChange]);

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const nextState = history[historyIndex + 1];
      onComponentsChange(nextState.components);
      setHistoryIndex(historyIndex + 1);
      toast.success('Action redone');
    }
  }, [history, historyIndex, onComponentsChange]);

  // Component operations
  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id.toString());
    setDragOverIndex(null);
  }, []);

  const handleDragOver = useCallback((event: DragOverEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      const activeIndex = droppedComponents.findIndex(item => item.id === active.id);
      const overIndex = droppedComponents.findIndex(item => item.id === over.id);
      
      if (activeIndex !== -1 && overIndex !== -1) {
        setDragOverIndex(overIndex);
      }
    } else {
      setDragOverIndex(null);
    }
  }, [droppedComponents]);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = droppedComponents.findIndex((item) => item.id === active.id);
      const newIndex = droppedComponents.findIndex((item) => item.id === over.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        const newItems = arrayMove(droppedComponents, oldIndex, newIndex);
        const updatedItems = newItems.map((item, index) => ({
          ...item,
          position: index
        }));
        
        addToHistory(droppedComponents);
        onComponentsChange(updatedItems);
        toast.success('Component moved');
      }
    }

    setActiveId(null);
    setDragOverIndex(null);
  }, [droppedComponents, onComponentsChange, addToHistory]);

  const handleComponentDelete = useCallback((componentId: string) => {
    addToHistory(droppedComponents);
    const updated = droppedComponents
      .filter(comp => comp.id !== componentId)
      .map((comp, index) => ({ ...comp, position: index }));
    onComponentsChange(updated);
    setSelectedComponents(prev => {
      const newSet = new Set(prev);
      newSet.delete(componentId);
      return newSet;
    });
    toast.success('Component deleted');
  }, [droppedComponents, onComponentsChange, addToHistory]);

  
  const handleComponentEdit = useCallback((componentId: string, updates: Partial<DroppedComponent>) => {
    const updated = droppedComponents.map(comp =>
      comp.id === componentId ? { ...comp, ...updates } : comp
    );
    onComponentsChange(updated);
  }, [droppedComponents, onComponentsChange]);

  const handleComponentCopy = useCallback((component: DroppedComponent) => {
    setClipboardComponent({ ...component, id: `${component.id}_copy_${Date.now()}` });
    toast.success('Component copied to clipboard');
  }, []);

  const handleComponentPaste = useCallback(() => {
    if (clipboardComponent) {
      addToHistory(droppedComponents);
      const newComponent = {
        ...clipboardComponent,
        id: `${clipboardComponent.id}_${Date.now()}`,
        position: droppedComponents.length
      };
      onComponentsChange([...droppedComponents, newComponent]);
      toast.success('Component pasted');
    }
  }, [clipboardComponent, droppedComponents, onComponentsChange, addToHistory]);

  const handleComponentDuplicate = useCallback((component: DroppedComponent) => {
    addToHistory(droppedComponents);
    const duplicated = {
      ...component,
      id: `${component.id}_dup_${Date.now()}`,
      position: component.position + 1
    };
    
    const updated = [...droppedComponents];
    updated.splice(component.position + 1, 0, duplicated);
    
    const reindexed = updated.map((comp, index) => ({ ...comp, position: index }));
    onComponentsChange(reindexed);
    toast.success('Component duplicated');
  }, [droppedComponents, onComponentsChange, addToHistory]);

  const handleBulkDelete = useCallback(() => {
    if (selectedComponents.size > 0) {
      addToHistory(droppedComponents);
      const updated = droppedComponents
        .filter(comp => !selectedComponents.has(comp.id))
        .map((comp, index) => ({ ...comp, position: index }));
      
      onComponentsChange(updated);
      setSelectedComponents(new Set());
      toast.success(`Deleted ${selectedComponents.size} components`);
    }
  }, [selectedComponents, droppedComponents, onComponentsChange, addToHistory]);

  const toggleComponentSelection = useCallback((componentId: string, multiSelect = false) => {
    setSelectedComponents(prev => {
      const newSet = new Set(multiSelect ? prev : []);
      if (prev.has(componentId)) {
        newSet.delete(componentId);
      } else {
        newSet.add(componentId);
      }
      return newSet;
    });
  }, []);

  const handleUserDataUpdate = useCallback(async (newUserData: UserData) => {
    if (user) {
      try {
        await updateProfile({
          full_name: newUserData.name,
          avatar_url: newUserData.avatar,
        });
        toast.success('Profile updated successfully');
      } catch (error) {
        console.error('Error updating profile:', error);
        toast.error('Failed to update profile');
      }
    }
  }, [user, updateProfile]);

  const handleDeleteUserComponent = useCallback((componentId: string) => {
    handleComponentDelete(componentId);
  }, [handleComponentDelete]);

  const handleLogout = useCallback(async () => {
    try {
      await signOut();
      toast.success('Logged out successfully');
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error('Failed to sign out');
    }
  }, [signOut]);

  const handleProjectSelect = useCallback((project: any) => {
    console.log('Selected project:', project);
    console.log('Project components:', project.components);
  
    let projectData = project.components; // Use 'components' not 'data'
  
    // Handle if components is a string (JSON)
    if (typeof projectData === 'string') {
      try {
        projectData = JSON.parse(projectData);
      } catch (e) {
        console.error('Failed to parse project components:', e);
        toast.error('Invalid project data format');
        return;
      }
    }
  
    // Verify it's an array
    if (Array.isArray(projectData)) {
      addToHistory(droppedComponents);
      onComponentsChange(projectData);
      if (onProjectIdChange) {
        onProjectIdChange(project.id);
      }
      setShowProjects(false);
      const projectName = project.name || project.id.slice(0, 8);
      toast.success(`Loaded project: ${projectName}`);
    } else {
      console.error('Invalid project data structure:', projectData);
      toast.error('Invalid project data - expected an array');
    }
  }, [droppedComponents, onComponentsChange, addToHistory, onProjectIdChange]);
  

  const getDeviceClass = () => {
    switch (deviceType) {
      case 'mobile':
        return 'w-full max-w-sm';
      case 'tablet':
        return 'w-full max-w-2xl';
      default:
        return 'w-full';
    }
  };

  const getZoomClass = () => {
    return `scale-[${zoomLevel / 100}]`;
  };

  const activeComponent = activeId
    ? droppedComponents.find((item) => item.id === activeId)
    : null;

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  // Show loading state only from AuthContext
  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-700">Loading your workspace...</h2>
          <p className="text-sm text-gray-500 mt-2">This should only take a moment</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Enhanced Toolbar */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 border-b border-blue-700/50 px-4 py-3 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Layers className="w-5 h-5" />
              Website Builder
            </h2>
            
            {/* Page Selector */}
<div className="relative">
  <button
    onClick={() => setShowPageManager(!showPageManager)}
    className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg hover:bg-white/20 transition-all"
  >
    <File className="w-4 h-4" />
    <span className="text-sm font-medium">{activePage?.name || 'Select Page'}</span>
    <ChevronDown className="w-4 h-4" />
  </button>
  
  {showPageManager && (
    <div className="absolute top-full left-0 mt-2 w-72 bg-gray-900 border border-gray-700 rounded-lg shadow-2xl z-[9999]">
      <div className="p-3 border-b border-gray-700">
        <button
          onClick={() => {
            handleAddPage();
            setShowPageManager(false);
          }}
          className="w-full flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium transition-all"
        >
          <Plus className="w-4 h-4" />
          Add New Page
        </button>
      </div>
      <div className="max-h-64 overflow-y-auto">
        {pages.map(page => (
          <div
            key={page.id}
            className={`flex items-center justify-between px-4 py-2 hover:bg-gray-800 transition-all ${
              page.id === activePageId ? 'bg-gray-800' : ''
            }`}
          >
            <button
              onClick={() => {
                onPageChange(page.id);
                setShowPageManager(false);
                toast.success(`Switched to: ${page.name}`);
              }}
              className="flex-1 text-left flex items-center gap-2"
            >
              {page.isHome && <Home className="w-4 h-4 text-blue-400" />}
              <span className="text-sm text-white">{page.name}</span>
              <span className="text-xs text-gray-500">({page.components.length})</span>
            </button>
            {!page.isHome && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeletePage(page.id);
                }}
                className="p-1.5 hover:bg-red-500/20 text-red-400 rounded transition-all"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  )}
</div>
            {/* History Controls */}
            {/* <div className="flex items-center gap-1 bg-white/10 backdrop-blur-sm rounded-lg p-1">
              <button
                onClick={undo}
                disabled={!canUndo}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                  canUndo
                    ? 'text-white hover:bg-white/20'
                    : 'text-white/50 cursor-not-allowed'
                }`}
                title="Undo (Ctrl+Z)"
              >
                <Undo className="w-4 h-4" />
                Undo
              </button>
              <button
                onClick={redo}
                disabled={!canRedo}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                  canRedo
                    ? 'text-white hover:bg-white/20'
                    : 'text-white/50 cursor-not-allowed'
                }`}
                title="Redo (Ctrl+Y)"
              >
                <Redo className="w-4 h-4" />
                Redo
              </button>
            </div> */}

            {/* Device Toggle */}
            {/* <div className="flex bg-white/10 backdrop-blur-sm rounded-lg p-1">
              <button
                onClick={() => setDeviceType('desktop')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                  deviceType === 'desktop'
                    ? 'bg-white/20 text-white'
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
              >
                <Monitor className="w-4 h-4" />
                Desktop
              </button>
              <button
                onClick={() => setDeviceType('tablet')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                  deviceType === 'tablet'
                    ? 'bg-white/20 text-white'
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
              >
                <Tablet className="w-4 h-4" />
                Tablet
              </button>
              <button
                onClick={() => setDeviceType('mobile')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                  deviceType === 'mobile'
                    ? 'bg-white/20 text-white'
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
              >
                <Smartphone className="w-4 h-4" />
                Mobile
              </button>
            </div> */}

            {/* View Controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowGlobalConfig(true)}
                className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg hover:bg-white/20 transition-all"
                title="Global Design Config"
              >
                <SettingsIcon className="w-4 h-4" />
                Global Config
              </button>

              <GlobalConfigModal
                isOpen={showGlobalConfig}
                onClose={() => setShowGlobalConfig(false)}
                config={globalConfig}
                onSave={handleGlobalConfigSave}
              />

              <div className="flex items-center gap-1 bg-white/10 backdrop-blur-sm rounded-lg p-1">
                <button
                  onClick={() => setZoomLevel(Math.max(25, zoomLevel - 25))}
                  className="p-1.5 text-white/80 hover:text-white hover:bg-white/20 rounded-md transition-all"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <span className="text-sm font-medium text-white min-w-[50px] text-center">
                  {zoomLevel}%
                </span>
                <button
                  onClick={() => setZoomLevel(Math.min(200, zoomLevel + 25))}
                  className="p-1.5 text-white/80 hover:text-white hover:bg-white/20 rounded-md transition-all"
                  title="Zoom In"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
              </div>

              <button
                onClick={() => setShowGrid(!showGrid)}
                className={`p-2 rounded-lg transition-all ${
                  showGrid
                    ? 'bg-white/20 text-white'
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
                title="Toggle Grid"
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
              
              <button
                onClick={() => setShowRuler(!showRuler)}
                className={`p-2 rounded-lg transition-all ${
                  showRuler
                    ? 'bg-white/20 text-white'
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
                title="Toggle Ruler"
              >
                <Ruler className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* Bulk Actions */}
            {selectedComponents.size > 0 && (
              <div className="flex items-center gap-2 bg-red-500/20 backdrop-blur-sm border border-red-400/30 rounded-lg px-3 py-2">
                <span className="text-sm font-medium text-white">
                  {selectedComponents.size} selected
                </span>
                <button
                  onClick={handleBulkDelete}
                  className="text-red-200 hover:text-white transition-colors"
                  title="Delete selected"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Clipboard Actions */}
            <div className="flex items-center gap-1">
              <button
                onClick={handleComponentPaste}
                disabled={!clipboardComponent}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  clipboardComponent
                    ? 'text-white/80 hover:text-white hover:bg-white/10'
                    : 'text-white/40 cursor-not-allowed'
                }`}
                title="Paste Component"
              >
                <Copy className="w-4 h-4" />
                Paste
              </button>
            </div>

            {/* Action Buttons */}
            {onMyProjects && (
              <button
                onClick={onMyProjects}
                className="flex items-center gap-2 px-3 py-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-all"
              >
                <FolderOpen className="w-4 h-4" />
                My Projects
              </button>
            )}
            <button
              onClick={onSettings}
              className="flex items-center gap-2 px-3 py-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-all"
            >
              <Settings className="w-4 h-4" />
              Settings
            </button>
            <button
              onClick={onPreview}
              className="flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white px-4 py-2 rounded-lg transition-all"
            >
              <Eye className="w-4 h-4" />
              Preview
            </button>
            <button
              onClick={onSave}
              className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-all shadow-md"
            >
              <Save className="w-4 h-4" />
              Save
            </button>

            {/* User Profile */}
            <UserProfile
              userData={userData}
              onSettingsClick={() => setShowUserSettings(true)}
              onLogout={handleLogout}
              onMyProjectsClick={() => setShowProjects(true)}
            />
          </div>
        </div>
      </div>

      {/* Enhanced Canvas */}
      <div className="flex-1 overflow-auto bg-gradient-to-br from-gray-100 to-gray-200 p-4 relative">
        {/* Ruler */}
        {showRuler && (
          <>
            <div className="absolute top-0 left-4 right-4 h-8 bg-white/90 backdrop-blur-sm border-b border-gray-300 flex items-end text-xs text-gray-600 z-10">
              {Array.from({ length: 50 }, (_, i) => (
                <div key={i} className="flex-1 border-l border-gray-300 pl-1">
                  {i * 100}
                </div>
              ))}
            </div>
            <div className="absolute top-8 left-0 bottom-0 w-8 bg-white/90 backdrop-blur-sm border-r border-gray-300 flex flex-col justify-start text-xs text-gray-600 z-10">
              {Array.from({ length: 20 }, (_, i) => (
                <div key={i} className="flex-1 border-t border-gray-300 pt-1">
                  {i * 100}
                </div>
              ))}
            </div>
          </>
        )}

        <div className={`mx-auto transition-all duration-300 ${getDeviceClass()}`} style={{ marginTop: showRuler ? '2rem' : '0', marginLeft: showRuler ? '2rem' : 'auto' }}>
          <div 
            ref={canvasRef}
            className={`bg-white shadow-2xl rounded-lg overflow-hidden min-h-[600px] relative transition-transform duration-200 ${getZoomClass()}`}
            style={{ transformOrigin: 'top center' }}
          >
            {/* Grid Overlay */}
            {showGrid && (
              <div
                className="absolute inset-0 opacity-20 pointer-events-none"
                style={{
                  backgroundImage: 'linear-gradient(to right, #e5e7eb 1px, transparent 1px), linear-gradient(to bottom, #e5e7eb 1px, transparent 1px)',
                  backgroundSize: '20px 20px'
                }}
              />
            )}

            {droppedComponents.length === 0 ? (
              <div className="flex items-center justify-center h-96 border-2 border-dashed border-gray-300 m-8 rounded-lg bg-gradient-to-br from-gray-50 to-white">
                <div className="text-center">
                  <Plus className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <div className="text-gray-400 text-xl mb-2">Add components here</div>
                  <p className="text-gray-500 text-sm max-w-md">
                    Selected components from the library will appear here
                  </p>
                </div>
              </div>
            ) : (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={droppedComponents.map(item => item.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-0">
                    {droppedComponents
                      .sort((a, b) => a.position - b.position)
                      .map((component, index) => (
                        <div key={component.id} className="relative">
                          {dragOverIndex === index && (
                            <div className="h-2 bg-blue-400 rounded-full mx-4 my-1 shadow-lg animate-pulse" />
                          )}
                          <SortableComponent
                            component={component}
                            onDelete={handleComponentDelete}
                            onEdit={handleComponentEdit}
                            onCopy={() => handleComponentCopy(component)}
                            onDuplicate={() => handleComponentDuplicate(component)}
                            deviceType={deviceType}
                            isSelected={selectedComponents.has(component.id)}
                            onSelect={(multiSelect) => toggleComponentSelection(component.id, multiSelect)}
                            zoomLevel={zoomLevel}
                            globalConfig={globalConfig}
                          />
                        </div>
                      ))}
                  </div>
                </SortableContext>

                <DragOverlay>
                  {activeComponent ? (
                    <div className="bg-white shadow-2xl rounded-lg p-4 border-2 border-blue-400 opacity-95 transform rotate-2 scale-105">
                      <div className="text-sm font-medium text-gray-600 mb-2 flex items-center gap-2">
                        <Move className="w-4 h-4" />
                        {activeComponent.component.name}
                      </div>
                      <div 
                        className="pointer-events-none opacity-75 transform scale-90"
                        dangerouslySetInnerHTML={{ __html: activeComponent.component.html }}
                      />
                    </div>
                  ) : null}
                </DragOverlay>
              </DndContext>
            )}
          </div>
        </div>
      </div>

      {/* Enhanced Status Bar */}
      <div className="bg-gray-900 text-white px-4 py-2 text-sm flex items-center justify-between">
        <div className="flex items-center space-x-6">
          <div className="flex items-center gap-2">
            <File className="w-4 h-4 text-green-400" />
            <span>Page: {activePage?.name}</span>
          </div>
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-blue-400" />
            <span>Components: {droppedComponents.length}</span>
          </div>
          <div className="flex items-center gap-2">
            <FolderOpen className="w-4 h-4 text-purple-400" />
            <span>Total Pages: {pages.length}</span>
          </div>
          <div className="flex items-center gap-2">
            <Monitor className="w-4 h-4 text-green-400" />
            <span>Device: {deviceType}</span>
          </div>
          <div className="flex items-center gap-2">
            <ZoomIn className="w-4 h-4 text-purple-400" />
            <span>Zoom: {zoomLevel}%</span>
          </div>
          {selectedComponents.size > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-yellow-400">Selected: {selectedComponents.size}</span>
            </div>
          )}
          {user && (
            <div className="flex items-center gap-2">
              <span className="text-green-400">User: {userData.name}</span>
            </div>
          )}
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-gray-400" />
            <span>History: {historyIndex + 1}/{history.length}</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full animate-pulse ${user ? 'bg-green-400' : 'bg-yellow-400'}`}></div>
            <span>{user ? 'Authenticated' : 'Guest Mode'}</span>
          </div>
        </div>
      </div>

      {/* User Settings Modal */}
      <UserSettings
        isOpen={showUserSettings}
        onClose={() => setShowUserSettings(false)}
        userData={userData}
        onUserDataUpdate={handleUserDataUpdate}
        userComponents={droppedComponents}
        onDeleteUserComponent={handleDeleteUserComponent}
      />
      <UserProjects
        isOpen={showProjects}
        onClose={() => setShowProjects(false)}
        onProjectSelect={handleProjectSelect}
      />
    </div>
  );
};