import React, { useState, useEffect } from 'react';
import { X, Monitor, Tablet, Smartphone, ExternalLink, Download } from 'lucide-react';
import { DroppedComponent, DeviceType, Project } from '../types';

interface PreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project;
}

export const PreviewModal: React.FC<PreviewModalProps> = ({ isOpen, onClose, project }) => {
  const [deviceType, setDeviceType] = useState<DeviceType>('desktop');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      // Simulate loading time
      const timer = setTimeout(() => setIsLoading(false), 500);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const generatePreviewHTML = () => {
    const components = project.components
      .sort((a, b) => a.position - b.position)
      .map(comp => comp.component.html)
      .join('\n');

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${project.settings.title}</title>
    <script src="https://cdn.tailwindcss.com"></script>
    ${project.settings.customCss ? `<style>${project.settings.customCss}</style>` : ''}
</head>
<body>
    ${components}
    ${project.settings.customJs ? `<script>${project.settings.customJs}</script>` : ''}
</body>
</html>`;
  };

  const openInNewTab = () => {
    const html = generatePreviewHTML();
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  };

  const downloadHTML = () => {
    const html = generatePreviewHTML();
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${project.name.toLowerCase().replace(/\s+/g, '-')}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getDeviceClass = () => {
    switch (deviceType) {
      case 'mobile':
        return 'w-[375px] h-[667px]';
      case 'tablet':
        return 'w-[768px] h-[1024px]';
      default:
        return 'w-full h-full';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-2xl w-full h-full max-w-7xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center space-x-4">
            <h2 className="text-xl font-semibold">Preview - {project.name}</h2>
            
            {/* Device Toggle */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setDeviceType('desktop')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  deviceType === 'desktop'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Monitor className="w-4 h-4" />
                Desktop
              </button>
              <button
                onClick={() => setDeviceType('tablet')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  deviceType === 'tablet'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Tablet className="w-4 h-4" />
                Tablet
              </button>
              <button
                onClick={() => setDeviceType('mobile')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  deviceType === 'mobile'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Smartphone className="w-4 h-4" />
                Mobile
              </button>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={openInNewTab}
              className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              Open in New Tab
            </button>
            <button
              onClick={downloadHTML}
              className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              <Download className="w-4 h-4" />
              Download HTML
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Preview Content */}
        <div className="flex-1 bg-gray-100 p-4 overflow-auto">
          <div className="flex justify-center h-full  ">
            <div className={`bg-white shadow-lg transition-all duration-300 ${getDeviceClass()} ${
              deviceType !== 'desktop' ? 'border border-gray-300 rounded-lg overflow-hidden' : ''
            }`}>
              {isLoading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="animate-pulse text-gray-500">Loading preview...</div>
                </div>
              ) : (
                <iframe
                  srcDoc={generatePreviewHTML()}
                  className="w-full h-full border-0"
                  title="Website Preview"
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};