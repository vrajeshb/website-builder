import React, { useState } from 'react';
import { X, Download, Code, FileText } from 'lucide-react';
import { multiPageExportService } from '../lib/export';
import toast from 'react-hot-toast';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: any;
  pages?: any[];
}

const FRAMEWORKS = [
  { id: 'html', name: 'HTML', description: 'Static HTML with navigation', icon: FileText, color: 'bg-orange-100 text-orange-600' },
  { id: 'react', name: 'React', description: 'React Router + Components', icon: Code, color: 'bg-blue-100 text-blue-600' },
  { id: 'nextjs', name: 'Next.js', description: 'App Router with pages', icon: Code, color: 'bg-gray-100 text-gray-600' },
  { id: 'vue', name: 'Vue', description: 'Vue Router + SFCs', icon: Code, color: 'bg-green-100 text-green-600' }
];

export const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose, project, pages }) => {
  const [selectedFramework, setSelectedFramework] = useState('html');
  const [isExporting, setIsExporting] = useState(false);

  if (!isOpen) return null;

  const projectPages = pages || (project.pages ? 
    (typeof project.pages === 'string' ? JSON.parse(project.pages) : project.pages) : 
    [{ id: '1', name: 'Home', slug: 'home', components: project.components, isHome: true }]
  );

  const totalComponents = projectPages.reduce((s, p) => s + p.components.length, 0);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      let files: Record<string, string>;

      switch (selectedFramework) {
        case 'html':
          files = multiPageExportService.generateMultiPageHTML(projectPages, project.name, project.settings);
          break;
        case 'react':
          files = multiPageExportService.generateMultiPageReact(projectPages, project.name);
          break;
        case 'nextjs':
          files = multiPageExportService.generateMultiPageNextJS(projectPages, project.name);
          break;
        case 'vue':
          files = multiPageExportService.generateMultiPageVue(projectPages, project.name);
          break;
        default:
          throw new Error('Unsupported framework');
      }

      await multiPageExportService.downloadFiles(files, project.name);
      toast.success(`${FRAMEWORKS.find(f => f.id === selectedFramework)?.name} export completed!`);
      onClose();
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Export failed. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">Export Multi-Page Project</h2>
            <p className="text-gray-600 mt-1">"{project.name}" • {projectPages.length} page{projectPages.length !== 1 ? 's' : ''} • {totalComponents} components</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Framework Selection */}
          <div className="grid grid-cols-2 gap-4">
            {FRAMEWORKS.map(fw => {
              const Icon = fw.icon;
              return (
                <button
                  key={fw.id}
                  onClick={() => setSelectedFramework(fw.id)}
                  className={`p-4 rounded-lg border-2 text-left transition ${
                    selectedFramework === fw.id
                      ? 'border-blue-500 bg-blue-50 shadow-sm'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${fw.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-800">{fw.name}</h3>
                      <p className="text-sm text-gray-600 mt-0.5">{fw.description}</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Features */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-800 mb-2">✨ What's Included:</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              {selectedFramework === 'html' && (
                <>
                  <li>• Separate HTML file per page with sticky navigation</li>
                  <li>• All styles combined and optimized</li>
                  <li>• Ready to deploy anywhere</li>
                </>
              )}
              {selectedFramework === 'react' && (
                <>
                  <li>• Individual component files (no dangerouslySetInnerHTML)</li>
                  <li>• React Router with active link styling</li>
                  <li>• Vite + Tailwind configured</li>
                </>
              )}
              {selectedFramework === 'nextjs' && (
                <>
                  <li>• Next.js 14 App Router structure</li>
                  <li>• Server components where possible</li>
                  <li>• Vercel-ready deployment</li>
                </>
              )}
              {selectedFramework === 'vue' && (
                <>
                  <li>• Single File Components (.vue)</li>
                  <li>• Vue Router with navigation</li>
                  <li>• Scoped styles per component</li>
                </>
              )}
            </ul>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{projectPages.length}</div>
              <div className="text-xs text-blue-700 mt-1">Pages</div>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">{totalComponents}</div>
              <div className="text-xs text-purple-700 mt-1">Components</div>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{Object.keys(FRAMEWORKS).length}</div>
              <div className="text-xs text-green-700 mt-1">Frameworks</div>
            </div>
          </div>

          {/* Page List */}
          <div className="bg-gray-50 rounded-lg p-4 max-h-40 overflow-y-auto">
            <h4 className="font-medium text-gray-700 mb-2 text-sm">Pages:</h4>
            {projectPages.map(page => (
              <div key={page.id} className="flex items-center justify-between py-1.5 text-sm">
                <span className="font-medium text-gray-800">{page.name}</span>
                <span className="text-xs text-gray-500 bg-white px-2 py-0.5 rounded">
                  {page.components.length} comp{page.components.length !== 1 ? 's' : ''}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between p-6 bg-gray-50 border-t rounded-b-xl">
          <button onClick={onClose} className="px-4 py-2 text-gray-600 hover:text-gray-800 transition font-medium">
            Cancel
          </button>
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-blue-400 disabled:to-blue-500 text-white px-6 py-2.5 rounded-lg transition shadow-lg shadow-blue-500/30 font-medium"
          >
            <Download className="w-4 h-4" />
            {isExporting ? 'Exporting...' : 'Download Project'}
          </button>
        </div>
      </div>
    </div>
  );
};