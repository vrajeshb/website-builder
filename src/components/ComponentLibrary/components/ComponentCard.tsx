import React, { useState, memo } from 'react';
import {
  Heart, Eye, Plus, Code, Star, Lock
} from 'lucide-react';
import { Component, ViewMode } from '../types';

interface ComponentCardProps {
  component: Component;
  viewMode: ViewMode;
  isFavorite: boolean;
  isSelected?: boolean;
  isPremiumUser?: boolean;
  onSelect: () => void;
  onPreview: () => void;
  onFavorite: () => void;
  onBulkSelect?: (selected: boolean) => void;
  onDragStart: (e: React.DragEvent) => void;
  onDragEnd: () => void;
  isDragging: boolean;
}

interface IframePreviewProps {
  html: string;
  containerWidth?: number;  // default 238
  containerHeight?: number; // default 128
  virtualWidth?: number;    // default 1920
  virtualHeight?: number;   // default 1080
}

export const IframePreview: React.FC<IframePreviewProps> = ({
  html,
  containerWidth = 238,
  containerHeight = 150,
  virtualWidth = 1920,
  virtualHeight = 1080
}) => {
  const scale = Math.min(containerWidth / virtualWidth, containerHeight / virtualHeight);

  return (
    <iframe
      srcDoc={`<!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8" />
            <meta name="viewport" content="width=${virtualWidth}">
            <script src="https://cdn.tailwindcss.com"></script>
            <style>
              html, body {
                width: ${virtualWidth}px;
                height: ${virtualHeight}px;
                margin: 0;
                padding: 0;
                overflow: hidden;
              }
              body {
                transform: scale(${scale});
                transform-origin: top left;
                background: white;
              }
            </style>
          </head>
          <body>${html}</body>
        </html>`}
      className="w-full h-full border-0 pointer-events-none"
      sandbox="allow-scripts"
      title="Preview"
      style={{ width: containerWidth, height: containerHeight }}
    />
  );
};


export const ComponentCard: React.FC<ComponentCardProps> = memo(({
  component,
  viewMode,
  isFavorite,
  isSelected = false,
  isPremiumUser = false,
  onSelect,
  onPreview,
  onFavorite,
  onBulkSelect,
  onDragStart,
  onDragEnd,
  isDragging
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const isLocked = component.is_premium && !isPremiumUser;

  const handleBulkToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    onBulkSelect?.(!isSelected);
  };

  const handleSelectClick = () => {
    if (isLocked) {
      return;
    }
    onSelect();
  };

  if (viewMode === 'list') {
    return (
      <div
        className={`flex items-center gap-3 bg-gray-800/50 rounded-lg p-3 border transition-all group relative ${
          isDragging ? 'opacity-50 scale-95' : ''
        } ${
          isSelected ? 'border-blue-500 bg-blue-500/10' : 'border-gray-700/50 hover:border-gray-600'
        } ${isLocked ? 'opacity-60' : ''}`}
        draggable={!isLocked}
        onDragStart={isLocked ? undefined : onDragStart}
        onDragEnd={onDragEnd}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className={`flex items-center gap-3 flex-1 min-w-0 ${isLocked ? 'cursor-not-allowed' : 'cursor-pointer'}`} onClick={handleSelectClick}>
          <div className="w-12 h-12 bg-gray-700/50 rounded-lg flex items-center justify-center overflow-hidden relative">
            {component.preview_image ? (
              <img 
                src={component.preview_image} 
                alt="" 
                className="w-full h-full object-cover" 
                loading="lazy"
              />
            ) : (
              <Code className="w-6 h-6 text-gray-400" />
            )}
            {component.is_premium && (
              <div className="absolute top-0 right-0 bg-gradient-to-br from-yellow-400 to-orange-500 p-1 rounded-bl-lg">
                {isLocked ? <Lock className="w-2 h-2 text-white" /> : <Star className="w-2 h-2 text-white" />}
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-white font-medium text-sm truncate">{component.name}</h3>
              {component.rating && component.rating > 0 && (
                <div className="flex items-center gap-1">
                  <Star className="w-3 h-3 text-yellow-400 fill-current" />
                  <span className="text-xs text-gray-400">{component.rating.toFixed(1)}</span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              <p className="text-gray-400 text-xs capitalize">{component.category}</p>
              {component.usage_count && component.usage_count > 0 && (
                <span className="text-xs text-gray-500">• {component.usage_count} uses</span>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-1">
          <button
            onClick={(e) => { e.stopPropagation(); onFavorite(); }}
            className={`p-1.5 rounded-lg transition-all ${
              isFavorite ? 'text-red-400 hover:text-red-300' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onPreview(); }}
            className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-all"
          >
            <Eye className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  if (viewMode === 'card') {
    return (
      <div
        className={`bg-gray-800/50 rounded-xl p-6 border transition-all group backdrop-blur-sm relative ${
          isDragging ? 'opacity-50 scale-95' : 'hover:shadow-xl hover:shadow-blue-500/10 hover:-translate-y-1'
        } ${
          isSelected ? 'border-blue-500 bg-blue-500/5' : 'border-gray-700/50 hover:border-gray-600'
        } ${isLocked ? 'opacity-60 cursor-not-allowed' : ''}`}
        draggable={!isLocked}
        onDragStart={isLocked ? undefined : onDragStart}
        onDragEnd={onDragEnd}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={handleSelectClick}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-semibold text-lg truncate pr-2">{component.name}</h3>
          <div className="flex items-center gap-1">
            <button
              onClick={(e) => { e.stopPropagation(); onFavorite(); }}
              className={`p-2 rounded-lg transition-all ${
                isFavorite ? 'text-red-400 hover:text-red-300 bg-red-500/10' : 'text-gray-400 hover:text-white hover:bg-gray-700'
              }`}
            >
              <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
            </button>
          </div>
        </div>
        
        <div className="relative mb-4 rounded-xl overflow-hidden bg-gray-700/30 h-32 group">
          {component.preview_image ? (
            <img
              src={component.preview_image}
              alt={component.name}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full">
            <IframePreview html={component.html || '<div>No preview</div>'} />
          </div>
          )}
          
          {component.is_premium && (
            <div className="absolute top-2 right-2 bg-gradient-to-br from-yellow-400 to-orange-500 px-2 py-1 rounded-full flex items-center gap-1">
              {isLocked ? <Lock className="w-3 h-3 text-white fill-current" /> : <Star className="w-3 h-3 text-white fill-current" />}
              <span className="text-xs text-white font-medium">{isLocked ? 'Locked' : 'Pro'}</span>
            </div>
          )}
          
          {isHovered && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center gap-3">
              {isLocked ? (
                <div className="text-center px-4">
                  <Lock className="w-8 h-8 text-white mx-auto mb-2" />
                  <p className="text-white text-sm font-medium">Premium Only</p>
                  <p className="text-gray-300 text-xs mt-1">Upgrade to access</p>
                </div>
              ) : (
                <>
                  <button
                    onClick={(e) => { e.stopPropagation(); onPreview(); }}
                    className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-xl transition-all transform hover:scale-110"
                    title="Preview"
                  >
                    <Eye className="w-5 h-5" />
                  </button>
                  <button
                    className="bg-green-600 hover:bg-green-700 text-white p-3 rounded-xl transition-all transform hover:scale-110"
                    title="Use Component"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>
          )}
        </div>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm px-3 py-1 bg-gradient-to-r from-blue-600/20 to-purple-600/20 text-blue-300 rounded-full capitalize border border-blue-500/20">
              {component.category}
            </span>
            {component.rating && component.rating > 0 && (
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                <span className="text-sm text-gray-300">{component.rating.toFixed(1)}</span>
              </div>
            )}
          </div>
          
          <div className="flex flex-wrap gap-1">
            {component.tags.slice(0, 3).map(tag => (
              <span key={tag} className="text-xs bg-gray-700/50 text-gray-300 px-2 py-1 rounded-full">
                {tag}
              </span>
            ))}
            {component.tags.length > 3 && (
              <span className="text-xs text-gray-400">+{component.tags.length - 3}</span>
            )}
          </div>
          
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>{component.usage_count || 0} uses</span>
            <span>{new Date(component.created_at).toLocaleDateString()}</span>
          </div>
        </div>
      </div>
    );
  }

  // Grid view (default)
  return (
    <div
      className={`bg-gray-800/50 rounded-xl p-4 border transition-all group backdrop-blur-sm relative ${
        isDragging ? 'opacity-50 scale-95' : 'hover:shadow-lg hover:shadow-blue-500/10'
      } ${
        isSelected ? 'border-blue-500 bg-blue-500/10' : 'border-gray-700/50 hover:border-gray-600'
      } ${isLocked ? 'opacity-60 cursor-not-allowed' : ''}`}
      draggable={!isLocked}
      onDragStart={isLocked ? undefined : onDragStart}
      onDragEnd={onDragEnd}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleSelectClick}
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-white font-medium text-sm truncate pr-2">{component.name}</h3>
        <div className="flex items-center gap-1">
          <button
            onClick={(e) => { e.stopPropagation(); onFavorite(); }}
            className={`p-1 rounded-lg transition-all ${
              isFavorite ? 'text-red-400 hover:text-red-300' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Heart className={`w-3.5 h-3.5 ${isFavorite ? 'fill-current' : ''}`} />
          </button>
        </div>
      </div>
      
      <div className="relative mb-3 rounded-lg overflow-hidden bg-gray-700/50 h-32">
        {component.preview_image ? (
          <img
            src={component.preview_image}
            alt={component.name}
            className="w-full h-full object-contain"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full">
          <IframePreview html={component.html || '<div>No preview</div>'} />
        </div>
        )}
        
        {component.is_premium && (
          <div className="absolute top-1 right-1 bg-gradient-to-br from-yellow-400 to-orange-500 p-1 rounded">
            {isLocked ? <Lock className="w-2.5 h-2.5 text-white fill-current" /> : <Star className="w-2.5 h-2.5 text-white fill-current" />}
          </div>
        )}
        
        {isHovered && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center gap-2">
            {isLocked ? (
              <div className="text-center px-2">
                <Lock className="w-6 h-6 text-white mx-auto mb-1" />
                <p className="text-white text-xs font-medium">Premium</p>
              </div>
            ) : (
              <>
                <button
                  onClick={(e) => { e.stopPropagation(); onPreview(); }}
                  className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg transition-all"
                  title="Preview"
                >
                  <Eye className="w-4 h-4" />
                </button>
                <button
                  className="bg-green-600 hover:bg-green-700 text-white p-2 rounded-lg transition-all"
                  title="Use Component"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        )}
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs px-2 py-1 bg-gradient-to-r from-blue-600/20 to-purple-600/20 text-blue-300 rounded-full capitalize border border-blue-500/20">
            {component.category}
          </span>
          {component.rating && component.rating > 0 && (
            <div className="flex items-center gap-1">
              <Star className="w-3 h-3 text-yellow-400 fill-current" />
              <span className="text-xs text-gray-400">{component.rating.toFixed(1)}</span>
            </div>
          )}
        </div>
        
        <div className="flex flex-wrap gap-1">
          {component.tags.slice(0, 2).map(tag => (
            <span key={tag} className="text-xs bg-gray-700/50 text-gray-300 px-2 py-0.5 rounded-full">
              {tag}
            </span>
          ))}
          {component.tags.length > 2 && (
            <span className="text-xs text-gray-400">+{component.tags.length - 2}</span>
          )}
        </div>
      </div>
    </div>
  );
});

ComponentCard.displayName = 'ComponentCard';