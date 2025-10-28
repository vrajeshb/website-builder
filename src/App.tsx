// Filename: App.tsx

import { useState, useEffect, useCallback } from 'react';
import { DndContext, DragEndEvent, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { Toaster } from 'react-hot-toast';
import toast from 'react-hot-toast';

// Authentication
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AuthForm } from './components/auth/AuthForm';

// Components
import { ComponentLibrary } from './components/ComponentLibrary';
import { DragDropBuilder } from './components/DragDropBuilder';
import { PreviewModal } from './components/PreviewModal';
import { AIChat } from './components/AIChat';
import { ExportModal } from './components/ExportModal';
import { ProjectSettings } from './components/ProjectSettings';

// Types and Services
import { Component, DroppedComponent } from './types';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

interface Project {
  id: string;
  name: string;
  components: DroppedComponent[];
  pages?: string | Page[];
  settings?: {
    title?: string;
    description?: string;
  };
  created_at: string;
  updated_at: string;
}

interface Page {
  id: string;
  name: string;
  slug: string;
  components: DroppedComponent[];
  isHome?: boolean;
  createdAt: string;
}

// Icons
import { Download, Sparkles } from 'lucide-react';

function BuilderApp() {
  const [components, setComponents] = useState<Component[]>([]);
  const [pages, setPages] = useState<Page[]>([
    {
      id: 'page-1',
      name: 'Home',
      slug: 'home',
      components: [],
      isHome: true,
      createdAt: new Date().toISOString()
    }
  ]);
  const [activePageId, setActivePageId] = useState('page-1');
  
  // Get active page components
  const activePage = pages.find(p => p.id === activePageId);
  const droppedComponents = activePage?.components || [];
  const [currentProject, setCurrentProject] = useState<Project>({
    id: 'temp',
    name: 'Untitled Website',
    components: [],
    settings: {
      title: 'My Website',
      description: 'A website built with AI-powered drag and drop builder',
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  });

  // Modal states
  const [showPreview, setShowPreview] = useState(false);
  const [showAIChat, setShowAIChat] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  );

  useEffect(() => {
    loadComponents();
  }, []);

  const loadComponents = async () => {
    try {
      const { data, error } = await supabase.from('components').select('*');
      if (error) throw error;
      setComponents(data || []);
    } catch (error) {
      console.error('Failed to load components:', error);
    }
  };

  const handleComponentSelect = useCallback((component: Component) => {
    setPages(prevPages => {
      return prevPages.map(page => {
        if (page.id === activePageId) {
          const newDroppedComponent: DroppedComponent = {
            id: `dropped-${Date.now()}-${Math.random()}`,
            componentId: component.id,
            component,
            position: page.components.length,
          };
          
          toast.success(`Added ${component.name} to ${page.name}!`);
          
          return {
            ...page,
            components: [...page.components, newDroppedComponent]
          };
        }
        return page;
      });
    });
  }, [activePageId]);

  const handleAIComponentSelect = useCallback((componentIds: string[]) => {
    setPages(prevPages => {
      return prevPages.map(page => {
        if (page.id === activePageId) {
          const newComponents = componentIds
            .map(id => components.find(comp => comp.id === id))
            .filter(Boolean)
            .map((component, index) => ({
              id: `dropped-${Date.now()}-${index}`,
              componentId: component!.id,
              component: component!,
              position: page.components.length + index,
            }));
          
          return {
            ...page,
            components: [...page.components, ...newComponents]
          };
        }
        return page;
      });
    });
  }, [components, activePageId]);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    if (over && over.id === 'drop-zone') {
      const component = components.find(comp => comp.id === active.id);
      if (component) handleComponentSelect(component);
    }
  }, [components, handleComponentSelect]);

  const handleProjectSave = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
  
      if (!user) {
        toast.error('Please sign in to save projects');
        return;
      }
  
      const isNewProject = !currentProject.id ||
                          currentProject.id === 'temp' ||
                          !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(currentProject.id);
  
      // Get all components from all pages
      const allComponents = pages.flatMap(page => page.components);
  
      const projectData = {
        name: currentProject.name,
        settings: currentProject.settings || {},
        components: allComponents, // All components from all pages
        pages: JSON.stringify(pages), // Save all pages as JSON string
        active_page_id: activePageId, // Save which page was active
        user_id: user.id
      };
  
      if (isNewProject) {
        const { data, error } = await supabase
          .from('projects')
          .insert([projectData])
          .select()
          .single();
  
        if (error) throw error;
  
        setCurrentProject({
          ...currentProject,
          id: data.id,
          created_at: data.created_at,
          updated_at: data.updated_at
        });
        toast.success('Project saved successfully!');
      } else {
        const { data, error } = await supabase
          .from('projects')
          .update({
            name: projectData.name,
            settings: projectData.settings,
            components: projectData.components,
            pages: projectData.pages, // Add this line - was missing!
            active_page_id: projectData.active_page_id // Add this line - was missing!
          })
          .eq('id', currentProject.id)
          .select()
          .single();
  
        if (error) throw error;
  
        setCurrentProject({
          ...currentProject,
          ...data
        });
        toast.success('Project updated successfully!');
      }
    } catch (error) {
      console.error('Failed to save project:', error);
      toast.error('Failed to save project');
    }
  };
  

  const handleSettingsSave = (settings: Project['settings']) => {
    setCurrentProject(prev => ({ ...prev, settings }));
    toast.success('Settings updated!');
  };

  const handleProjectLoad = async (projectId: string) => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .single();
  
      if (error) throw error;
  
      // Load pages if they exist
      if (data.pages) {
        const loadedPages = typeof data.pages === 'string' 
          ? JSON.parse(data.pages) 
          : data.pages;
        
        setPages(loadedPages);
        
        // Restore active page
        if (data.active_page_id) {
          setActivePageId(data.active_page_id);
        } else {
          // Set to home or first page
          const homePage = loadedPages.find((p: Page) => p.isHome);
          setActivePageId(homePage?.id || loadedPages[0]?.id || 'page-1');
        }
      } else if (data.components) {
        // Backwards compatibility: convert old single-page projects
        setPages([{
          id: 'page-1',
          name: 'Home',
          slug: 'home',
          components: data.components,
          isHome: true,
          createdAt: new Date().toISOString()
        }]);
        setActivePageId('page-1');
      }
  
      setCurrentProject({
        id: data.id,
        name: data.name,
        components: data.components || [],
        settings: data.settings || {},
        created_at: data.created_at,
        updated_at: data.updated_at
      });
  
      toast.success('Project loaded successfully!');
    } catch (error) {
      console.error('Failed to load project:', error);
      toast.error('Failed to load project');
    }
  };

  const handleProjectIdChange = useCallback((projectId: string | null) => {
    if (projectId) {
      handleProjectLoad(projectId);
    }
  }, []);

  const projectWithComponents = { ...currentProject, components: droppedComponents };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        {/* Sidebar */}
        <ComponentLibrary onComponentSelect={handleComponentSelect} />

        {/* Main Builder */}
        <DragDropBuilder
          droppedComponents={droppedComponents}
          onComponentsChange={(newComponents) => {
            setPages(prevPages => 
              prevPages.map(page => 
                page.id === activePageId 
                  ? { ...page, components: newComponents }
                  : page
              )
            );
          }}
          onPreview={() => setShowPreview(true)}
          onSave={handleProjectSave}
          onSettings={() => setShowSettings(true)}
          currentProjectId={currentProject.id}
          onProjectIdChange={handleProjectIdChange}
          pages={pages}
          activePageId={activePageId}
          onPageChange={setActivePageId}
          onPagesChange={setPages}
        />
        {/* Drop Zone */}
        <div id="drop-zone" className="absolute inset-0 pointer-events-none" />
      </DndContext>

      {/* Floating Buttons */}
      <div className="fixed right-4 bottom-4 space-y-3">
        <button
          onClick={() => setShowAIChat(!showAIChat)}
          className={`w-12 h-12 rounded-full shadow-lg flex items-center justify-center transition-all transform hover:scale-105 ${
            showAIChat ? 'bg-purple-600 text-white' : 'bg-white text-purple-600 hover:bg-purple-50'
          }`}
          title="AI Assistant"
        >
          <Sparkles className="w-6 h-6" />
        </button>

        <button
          onClick={() => setShowExport(true)}
          className="w-12 h-12 bg-white text-green-600 rounded-full shadow-lg flex items-center justify-center hover:bg-green-50 transition-all transform hover:scale-105"
          title="Export Project"
        >
          <Download className="w-6 h-6" />
        </button>
      </div>

      {/* Modals */}
      <PreviewModal isOpen={showPreview} onClose={() => setShowPreview(false)} project={projectWithComponents} />
      <AIChat isOpen={showAIChat} onClose={() => setShowAIChat(false)} components={components} onComponentSelect={handleAIComponentSelect} />
      <ExportModal 
        isOpen={showExport} 
        onClose={() => setShowExport(false)} 
        project={projectWithComponents} 
        pages={pages}
      />
      <ProjectSettings isOpen={showSettings} onClose={() => setShowSettings(false)} project={currentProject} onSave={handleSettingsSave} />

      {/* Toasts */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: { background: '#363636', color: '#fff' },
          success: { duration: 3000, iconTheme: { primary: '#10b981', secondary: '#fff' } },
          error: { duration: 5000, iconTheme: { primary: '#ef4444', secondary: '#fff' } },
        }}
      />
    </div>
  );
}

function AppContent() {
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const { user, loading, authError } = useAuth();

  // if (loading) return "Loading...";

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
        <AuthForm mode={authMode} onModeChange={setAuthMode} error={authError} />
      </div>
    );
  }

  return <BuilderApp />;
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;