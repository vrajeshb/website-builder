import React, { useState } from 'react';
import { X, Save } from 'lucide-react';
import { Project } from '../types';

interface ProjectSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project;
  onSave: (settings: Project['settings']) => void;
}

export const ProjectSettings: React.FC<ProjectSettingsProps> = ({
  isOpen,
  onClose,
  project,
  onSave
}) => {
  const [settings, setSettings] = useState(project.settings);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave(settings);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">Project Settings</h2>
            <p className="text-gray-600 mt-1">Configure your website settings</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Settings Form */}
        <div className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-800">Basic Information</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Website Title
              </label>
              <input
                type="text"
                value={settings.title}
                onChange={(e) => setSettings({ ...settings, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                placeholder="Enter your website title"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Meta Description
              </label>
              <textarea
                value={settings.description}
                onChange={(e) => setSettings({ ...settings, description: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                placeholder="Describe your website for search engines"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Favicon URL (optional)
              </label>
              <input
                type="url"
                value={settings.favicon || ''}
                onChange={(e) => setSettings({ ...settings, favicon: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                placeholder="https://example.com/favicon.ico"
              />
            </div>
          </div>

          {/* Custom Code */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-800">Custom Code</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Custom CSS
              </label>
              <textarea
                value={settings.customCss || ''}
                onChange={(e) => setSettings({ ...settings, customCss: e.target.value })}
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none font-mono text-sm"
                placeholder="/* Add your custom CSS here */"
              />
              <p className="text-xs text-gray-500 mt-1">
                This CSS will be added to the &lt;head&gt; section of your website
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Custom JavaScript
              </label>
              <textarea
                value={settings.customJs || ''}
                onChange={(e) => setSettings({ ...settings, customJs: e.target.value })}
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none font-mono text-sm"
                placeholder="// Add your custom JavaScript here"
              />
              <p className="text-xs text-gray-500 mt-1">
                This JavaScript will be added before the closing &lt;/body&gt; tag
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between p-6 bg-gray-50 rounded-b-lg">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            <Save className="w-4 h-4" />
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
};