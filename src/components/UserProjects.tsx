import { useEffect, useState } from 'react';
import { supabase, type Project } from '../lib/supabase';
import { FileText, Calendar, Loader2, X, Package, FolderOpen } from 'lucide-react';

interface UserProjectsProps {
  isOpen: boolean;
  onClose: () => void;
  onProjectSelect: (project: Project) => void;
}

export function UserProjects({ isOpen, onClose, onProjectSelect }: UserProjectsProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      setProjects(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-teal-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-teal-600 rounded-full flex items-center justify-center">
              <Package className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">My Projects</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/80 rounded-lg transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center min-h-[400px]">
              <Loader2 className="w-12 h-12 animate-spin text-blue-600 mb-4" />
              <p className="text-gray-600 font-medium">Loading your projects...</p>
            </div>
          ) : error ? (
            <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6 text-red-800">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <X className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <p className="font-semibold text-lg">Error loading projects</p>
                  <p className="text-sm mt-1">{error}</p>
                </div>
              </div>
            </div>
          ) : projects.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-teal-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <FolderOpen className="w-12 h-12 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No projects yet</h3>
              <p className="text-gray-600 mb-6">Start building and save your first project</p>
              <button
                onClick={onClose}
                className="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-teal-600 text-white rounded-lg hover:from-blue-600 hover:to-teal-700 transition-all shadow-md hover:shadow-lg font-medium"
              >
                Start Creating
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-gray-600 mb-4">
                {projects.length} {projects.length === 1 ? 'project' : 'projects'} found
              </p>
              {projects.map((project) => (
                <button
                  key={project.id}
                  onClick={() => {
                    onProjectSelect(project);
                    onClose();
                  }}
                  className="w-full bg-white rounded-xl border-2 border-gray-200 p-5 hover:border-blue-400 hover:shadow-lg transition-all duration-200 text-left group"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex gap-4 flex-1">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-teal-600 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                        <FileText className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-700 transition-colors mb-1">
                          Project {project.uuid ? project.uuid.slice(0, 8) : project.id}
                        </h3>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <span>Created {formatDate(project.created_at)}</span>
                          </div>
                          {project.updated_at !== project.created_at && (
                            <div className="flex items-center gap-1.5">
                              <Calendar className="w-4 h-4 text-gray-400" />
                              <span>Updated {formatDate(project.updated_at)}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center text-blue-600 group-hover:text-blue-700 font-medium text-sm gap-1 group-hover:gap-2 transition-all">
                      <span>Open</span>
                      <span className="text-lg">→</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
