import React, { lazy, Suspense } from 'react';
import { X, Plus, Star } from 'lucide-react';
import { Component } from '../types';

interface ComponentPreviewModalProps {
  component: Component;
  isPremiumUser: boolean;
  onClose: () => void;
  onSelect: () => void;
}

const LazyIframe = lazy(() => import('./LazyIframe'));

export const ComponentPreviewModal: React.FC<ComponentPreviewModalProps> = ({
  component,
  isPremiumUser,
  onClose,
  onSelect
}) => {
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl w-full max-w-[90vw] max-h-[90vh] flex flex-col shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              {component.name}
              {component.is_premium && (
                <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-sm px-2 py-1 rounded-full flex items-center gap-1">
                  <Star className="w-3 h-3 fill-current" />
                  Pro
                </span>
              )}
            </h2>
            <p className="text-gray-600 capitalize">{component.category} component</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                if (component.is_premium && !isPremiumUser) {
                  alert("⚠️ This is a premium component. Upgrade to Pro to use it!");
                  return;
                }
                onSelect();
              }}
              className={`px-6 py-2 rounded-lg transition-colors flex items-center gap-2 
                ${component.is_premium && !isPremiumUser 
                  ? "bg-gray-400 cursor-not-allowed" 
                  : "bg-blue-600 hover:bg-blue-700 text-white"}`}
              disabled={component.is_premium && !isPremiumUser}
            >
              <Plus className="w-4 h-4" />
              {component.is_premium ? (isPremiumUser ? "Use Component" : "Premium Only") : "Use Component"}
            </button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors p-2"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="flex-1 p-6 overflow-auto bg-gray-50">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <Suspense fallback={
              <div className="w-full h-96 bg-gray-100 rounded-lg flex items-center justify-center">
                <div className="text-gray-500">Loading preview...</div>
              </div>
            }>
              <LazyIframe
                srcDoc={`
                  <!DOCTYPE html>
                  <html>
                  <head>
                    <script src="https://cdn.tailwindcss.com"></script>
                    <style>
                      body { margin: 0; padding: 20px; }
                      ${component.css || ''}
                    </style>
                  </head>
                  <body>
                    ${component.html}
                    <script>
                      ${component.js || ''}
                    </script>
                  </body>
                  </html>
                `}
                className="w-full h-96 border-0 rounded-lg"
                title="Component Preview"
              />
            </Suspense>
          </div>
        </div>

        <div className="p-6 bg-gray-50 border-t">
          <div className="flex flex-wrap gap-2 mb-4">
            {component.tags.map(tag => (
              <span key={tag} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                {tag}
              </span>
            ))}
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span>Category: {component.category}</span>
              {component.rating && component.rating > 0 && (
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <span>{component.rating.toFixed(1)}</span>
                </div>
              )}
              {component.usage_count && component.usage_count > 0 && (
                <span>{component.usage_count} uses</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};