// SortableComponent.tsx
import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { DroppedComponent, ElementToken } from '../types';
import { GripVertical, Edit3, Trash2, Copy, RotateCw, Palette, ChevronDown, ChevronUp, Lock, Unlock, Star, X, Settings, Hash, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

// --- Global Config Definitions (Moved from external file to make component self-contained) ---

// Assuming DeviceType is defined externally, mock it here for completeness
type DeviceType = 'desktop' | 'tablet' | 'mobile';

export interface GlobalConfig {
  typography: {
    fontFamily: string;
    fontSize: {
      heading: string;
      headingSmall: string;
      titleLarge: string;
      title: string;
      subtitle: string;
      body: string;
      caption: string;
    };
    fontWeight: {
      light: string;
      regular: string;
      medium: string;
      semibold: string;
      bold: string;
    };
  };
  colors: {
    text: {
      primary: string;
      secondary: string;
      accent: string;
      muted: string;
      inverse: string;
    };
    background: {
      primary: string;
      secondary: string;
      surface: string;
      card: string;
    };
    button: {
      primary: string;
      secondary: string;
      success: string;
      danger: string;
      ghost: string;
    }
  };
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
    '2xl': string;
  };
  borderRadius: {
    none: string;
    sm: string;
    md: string;
    lg: string;
    full: string;
  };
}

export const defaultConfig: GlobalConfig = {
  typography: {
    fontFamily: 'Inter',
    fontSize: {
      heading: '3rem',
      headingSmall: '2.25rem',
      titleLarge: '1.875rem',
      title: '1.5rem',
      subtitle: '1.25rem',
      body: '1rem',
      caption: '0.875rem',
    },
    fontWeight: {
      light: '300',
      regular: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
    },
  },
  colors: {
    text: {
      primary: '#1F2937', // Gray 800
      secondary: '#4B5563', // Gray 600
      accent: '#4F46E5', // Indigo 600
      muted: '#9CA3AF', // Gray 400
      inverse: '#FFFFFF',
    },
    background: {
      primary: '#F9FAFB', // Gray 50
      secondary: '#E5E7EB', // Gray 200
      surface: '#FFFFFF',
      card: '#F3F4F6', // Gray 100
    },
    button: {
      primary: '#4F46E5', // Indigo 600
      secondary: '#6B7280', // Gray 500
      success: '#10B981', // Green 500
      danger: '#EF4444', // Red 500
      ghost: 'transparent',
    }
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '3rem',
  },
  borderRadius: {
    none: '0px',
    sm: '0.125rem',
    md: '0.375rem',
    lg: '0.5rem',
    full: '9999px',
  },
};

// --- Type Definitions (Kept for Context) ---
interface SortableComponentProps {
  component: DroppedComponent; // Assuming DroppedComponent is defined elsewhere
  onDelete: (id: string) => void;
  onEdit: (id: string, updates: Partial<DroppedComponent>) => void;
  onCopy?: (component: DroppedComponent) => void;
  onDuplicate?: (component: DroppedComponent) => void;
  deviceType: DeviceType;
  isSelected?: boolean;
  onSelect?: (multiSelect: boolean) => void;
  zoomLevel?: number;
  globalConfig?: GlobalConfig;
}

// ElementToken interface is imported from ../types

// ✅ FIXED: Map element types to default token keys (guarantees all keys exist)
const getDefaultTokenMapping = (tagName: string): Omit<ElementToken, 'selector' | 'element'> => {
  const tag = tagName.toLowerCase();

  // base defaults to guarantee all fields exist
  const base: Omit<ElementToken, 'selector' | 'element'> = {
    tagName: 'p',
    fontSizeKey: 'body',
    fontWeightKey: 'regular',
    textColorKey: 'primary',
    backgroundColorKey: undefined,
    paddingKey: 'md',
    borderRadiusKey: undefined,
  };

  // tag-specific overrides (partial)
  const defaults: Record<string, Partial<Omit<ElementToken, 'selector' | 'element'>>> = {
    // Headings
    'h1': { tagName: 'h1', fontSizeKey: 'heading', fontWeightKey: 'bold' },
    'h2': { tagName: 'h2', fontSizeKey: 'headingSmall', fontWeightKey: 'bold' },
    'h3': { tagName: 'h3', fontSizeKey: 'titleLarge', fontWeightKey: 'semibold' },
    'h4': { tagName: 'h4', fontSizeKey: 'title', fontWeightKey: 'semibold' },
    'h5': { tagName: 'h5', fontSizeKey: 'subtitle', fontWeightKey: 'medium' },
    'h6': { tagName: 'h6', fontSizeKey: 'subtitle', fontWeightKey: 'medium' },

    // Text elements
    'p': { tagName: 'p' },
    'span': { tagName: 'span', fontSizeKey: 'caption' },
    'small': { tagName: 'small', fontSizeKey: 'caption', textColorKey: 'muted' },

    // Interactive elements
    'a': { tagName: 'a', fontSizeKey: 'body', fontWeightKey: 'regular', textColorKey: 'accent', paddingKey: 'xs', borderRadiusKey: undefined },
    'button': { tagName: 'button', fontSizeKey: 'body', fontWeightKey: 'medium', textColorKey: 'inverse', backgroundColorKey: 'primary', paddingKey: 'md', borderRadiusKey: 'md' },
    'label': { tagName: 'label', fontSizeKey: 'body', fontWeightKey: 'medium', textColorKey: 'primary', paddingKey: 'sm' },

    // Semantic text elements
    'strong': { tagName: 'strong', fontSizeKey: 'body', fontWeightKey: 'bold' },
    'b': { tagName: 'b', fontSizeKey: 'body', fontWeightKey: 'bold' },
    'em': { tagName: 'em', fontSizeKey: 'body', fontWeightKey: 'regular' },
    'i': { tagName: 'i', fontSizeKey: 'body', fontWeightKey: 'regular' },
    'u': { tagName: 'u', fontSizeKey: 'body', fontWeightKey: 'regular' },
    'mark': { tagName: 'mark', fontSizeKey: 'body', fontWeightKey: 'regular' },
    'del': { tagName: 'del', fontSizeKey: 'body', fontWeightKey: 'regular', textColorKey: 'muted' },
    'ins': { tagName: 'ins', fontSizeKey: 'body', fontWeightKey: 'regular' },

    // Code elements
    'code': { tagName: 'code', fontSizeKey: 'caption', fontWeightKey: 'regular', backgroundColorKey: 'card', borderRadiusKey: 'sm' },
    'pre': { tagName: 'pre', fontSizeKey: 'caption', fontWeightKey: 'regular', backgroundColorKey: 'card', borderRadiusKey: 'sm' },

    // List elements
    'li': { tagName: 'li', fontSizeKey: 'body', fontWeightKey: 'regular', paddingKey: 'sm' },

    // Block elements
    'blockquote': { tagName: 'blockquote', fontSizeKey: 'body', fontWeightKey: 'regular', textColorKey: 'secondary', paddingKey: 'md', borderRadiusKey: 'sm' },
    'div': { tagName: 'div', fontSizeKey: 'body', fontWeightKey: 'regular', paddingKey: 'md', borderRadiusKey: 'md' },

    // Table elements
    'th': { tagName: 'th', fontSizeKey: 'body', fontWeightKey: 'semibold', paddingKey: 'sm' },
    'td': { tagName: 'td', fontSizeKey: 'body', fontWeightKey: 'regular', paddingKey: 'sm' },

    // Figure elements
    'figcaption': { tagName: 'figcaption', fontSizeKey: 'caption', fontWeightKey: 'regular', textColorKey: 'muted', paddingKey: 'sm' },
    'caption': { tagName: 'caption', fontSizeKey: 'caption', fontWeightKey: 'regular', textColorKey: 'muted', paddingKey: 'sm' },
    'legend': { tagName: 'legend', fontSizeKey: 'body', fontWeightKey: 'medium', paddingKey: 'sm' },
  };

  return { ...base, ...(defaults[tag] || {}) };
};

/**
 * Comprehensive element detection function that handles all nesting scenarios.
 * Detects ALL text elements including deeply nested and complex structures.
 *
 * NOTE: This function now fills any missing token keys with safe fallbacks
 * so the rest of the code can rely on all token keys existing.
 */

const detectElements = (htmlContent: string): ElementToken[] => {
  if (!htmlContent) return [];

  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(`<html><body>${htmlContent}</body></html>`, 'text/html');
    const elements: ElementToken[] = [];

    // Extended list of elements to detect, including more semantic elements
    const tagQuery = 'h1, h2, h3, h4, h5, h6, p, span, a, button, li, strong, em, b, i, u, small, mark, del, ins, code, pre, blockquote, label, legend, figcaption, caption, th, td';
    const foundElements = doc.body.querySelectorAll(tagQuery);

    const globalCounters: Record<string, number> = {};
    const processedElements = new Set<Element>();

    // Helper function to check if element has meaningful content
    const hasMeaningfulContent = (element: Element): boolean => {
      const text = element.textContent?.trim();
      if (text && text.length > 0) return true;
    
      // If element has attributes, it’s likely relevant
      if (element.attributes.length > 0) return true;
    
      // Check for nested elements that might contain text
      const hasNestedText = Array.from(element.querySelectorAll('*')).some(
        (child) => child.textContent?.trim()
      );
    
      return hasNestedText;
    };

    // Helper function to generate unique selector - FIXED: Simple selectors only
    const generateSelector = (element: Element, tagName: string, counter: number): string => {
      // Use simple nth-of-type selector that works regardless of parent
      // This is more reliable when DOM structure changes
      return `${tagName}:nth-of-type(${counter})`;
    };

    // Helper function to get text preview
    const getTextPreview = (element: Element): string => {
      // Get direct text content first
      let directText = '';
      element.childNodes.forEach(node => {
        if (node.nodeType === Node.TEXT_NODE) {
          directText += node.textContent || '';
        }
      });
      directText = directText.trim();

      // If no direct text, get full text content
      const fullText = element.textContent?.trim() || '';
      const textForPreview = directText || fullText;
      
      return textForPreview.length > 30
        ? textForPreview.substring(0, 30) + '...'
        : textForPreview;
    };

    // Helper function to create element token with proper defaults
    const createElementToken = (
      el: Element, 
      actualTagName: string, 
      selector: string
    ): ElementToken => {
      const initialTokens = getDefaultTokenMapping(actualTagName);
      const textPreview = getTextPreview(el);

      // CRITICAL FIX: Don't spread initialTokens - explicitly set each property
      // This ensures we don't accidentally include undefined or invalid values
      const token: ElementToken = {
        element: actualTagName.toUpperCase(),
        selector: selector,
        textPreview: textPreview,
        tagName: actualTagName, // Use actual tag name, not from defaults
        fontSizeKey: initialTokens.fontSizeKey || 'body',
        fontWeightKey: initialTokens.fontWeightKey || 'regular',
        textColorKey: initialTokens.textColorKey || 'primary',
        paddingKey: initialTokens.paddingKey || 'md',
      };

      // Only add optional properties if they have valid values
      if (initialTokens.backgroundColorKey !== undefined && initialTokens.backgroundColorKey !== null) {
        token.backgroundColorKey = initialTokens.backgroundColorKey;
      }
      
      if (initialTokens.borderRadiusKey !== undefined && initialTokens.borderRadiusKey !== null) {
        token.borderRadiusKey = initialTokens.borderRadiusKey;
      }

      return token;
    };

    // Process all found elements
    foundElements.forEach((el) => {
      // Skip if already processed
      if (processedElements.has(el)) return;

      const actualTagName = el.tagName.toLowerCase();
      
      // Check if element should be detected
      const shouldDetect = hasMeaningfulContent(el) || 
                          ['button', 'a', 'label'].includes(actualTagName) ||
                          (actualTagName === 'div' && el.children.length === 0 && el.textContent?.trim());

      if (shouldDetect) {
        // Initialize counter for this tag type
        if (!globalCounters[actualTagName]) {
          globalCounters[actualTagName] = 0;
        }
        globalCounters[actualTagName]++;

        const count = globalCounters[actualTagName];
        const selector = generateSelector(el, actualTagName, count);

        // Mark as processed
        processedElements.add(el);

        // Create and push the token
        elements.push(createElementToken(el, actualTagName, selector));
      }
    });

    // If no elements detected, try a more aggressive approach
    if (elements.length === 0) {
      // Look for any element with text content, regardless of tag
      const allElements = doc.body.querySelectorAll('*');
      allElements.forEach((el) => {
        if (processedElements.has(el)) return;
        
        const tagName = el.tagName.toLowerCase();
        const textContent = el.textContent?.trim();
        
        // Skip if no text or if it's a container with only child elements
        if (!textContent || (el.children.length > 0 && !el.children[0].textContent?.trim())) return;
        
        // Skip script, style, and other non-content elements
        if (['script', 'style', 'meta', 'link', 'title', 'head'].includes(tagName)) return;
        
        if (!globalCounters[tagName]) {
          globalCounters[tagName] = 0;
        }
        globalCounters[tagName]++;

        const count = globalCounters[tagName];
        const selector = generateSelector(el, tagName, count);

        processedElements.add(el);

        // Create and push the token
        elements.push(createElementToken(el, tagName, selector));
      });
    }

    // Fallback if still no elements found
    if (elements.length === 0) {
      const fallbackH2 = document.createElement('h2');
      fallbackH2.textContent = 'Heading';
      const fallbackP = document.createElement('p');
      fallbackP.textContent = 'Paragraph';
      
      return [
        createElementToken(fallbackH2, 'h2', 'h2:nth-of-type(1)'),
        createElementToken(fallbackP, 'p', 'p:nth-of-type(1)')
      ];
    }

    return elements;
  } catch (e) {
    console.error('Error parsing HTML during element detection:', e);
    
    const fallbackH2 = document.createElement('h2');
    fallbackH2.textContent = 'Heading';
    const fallbackP = document.createElement('p');
    fallbackP.textContent = 'Paragraph';
    
    return [
      createElementToken(fallbackH2, 'h2', 'h2:nth-of-type(1)'),
      createElementToken(fallbackP, 'p', 'p:nth-of-type(1)')
    ];
  }
};

// A constant list of token classes for robust cleanup
const TOKEN_CLASSES = [
  'text-heading', 'text-headingSmall', 'text-titleLarge', 'text-title', 'text-subtitle', 'text-body', 'text-caption',
  'font-light', 'font-regular', 'font-medium', 'font-semibold', 'font-bold',
  'text-primary', 'text-secondary', 'text-accent', 'text-muted', 'text-inverse',
  'bg-primary', 'bg-secondary', 'bg-surface', 'bg-card',
  'bg-button-primary', 'bg-button-secondary', 'bg-button-success', 'bg-button-danger', 'bg-button-ghost',
  'hover:bg-button-primary-hover', 'hover:bg-button-secondary-hover', 'hover:bg-button-success-hover', 'hover:bg-button-danger-hover', 'hover:bg-button-ghost-hover',
  'p-xs', 'p-sm', 'p-md', 'p-lg', 'p-xl', 'p-2xl',
  'px-xs', 'px-sm', 'px-md', 'px-lg', 'px-xl', 'px-2xl',
  'py-xs', 'py-sm', 'py-md', 'py-lg', 'py-xl', 'py-2xl',
  'pt-xs', 'pt-sm', 'pt-md', 'pt-lg', 'pt-xl', 'pt-2xl',
  'pb-xs', 'pb-sm', 'pb-md', 'pb-lg', 'pb-xl', 'pb-2xl',
  'pl-xs', 'pl-sm', 'pl-md', 'pl-lg', 'pl-xl', 'pl-2xl',
  'pr-xs', 'pr-sm', 'pr-md', 'pr-lg', 'pr-xl', 'pr-2xl',
  'rounded-none', 'rounded-sm', 'rounded-md', 'rounded-lg', 'rounded-full',
];
const TOKEN_CLASS_SET = new Set(TOKEN_CLASSES);

// Helper function to check if a class should be removed
const shouldRemoveTokenClass = (cls: string): boolean => {
  if (cls.startsWith('font-[') && cls.endsWith(']')) {
    return false;
  }
  const parts = cls.split(':');
  const baseClass = parts[parts.length - 1];
  return TOKEN_CLASS_SET.has(baseClass);
};

// Utility function to fix existing tokens with complex selectors
const fixTokenSelectors = (tokens: ElementToken[], html: string): ElementToken[] => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(`<html><body>${html}</body></html>`, 'text/html');
  
  const fixedTokens: ElementToken[] = [];
  const globalCounters: Record<string, number> = {};
  
  tokens.forEach((token) => {
    try {
      // Try to find the element
      let element = doc.querySelector(token.selector);
      
      // If not found with complex selector, try simplified version
      if (!element && token.selector.includes(' > ')) {
        const simplifiedSelector = token.selector.split(' > ').pop();
        if (simplifiedSelector) {
          element = doc.querySelector(simplifiedSelector);
        }
      }
      
      // If still not found, try matching by tag and text content
      if (!element) {
        const tagName = token.tagName || token.element.toLowerCase();
        const allElements = doc.querySelectorAll(tagName);
        
        allElements.forEach(el => {
          const elText = el.textContent?.trim();
          const tokenText = token.textPreview?.replace('...', '').trim();
          if (elText && tokenText && elText.startsWith(tokenText)) {
            element = el;
          }
        });
      }
      
      if (element) {
        const actualTagName = element.tagName.toLowerCase();
        
        // Initialize counter for this tag type
        if (!globalCounters[actualTagName]) {
          globalCounters[actualTagName] = 0;
        }
        globalCounters[actualTagName]++;
        
        const count = globalCounters[actualTagName];
        const newSelector = `${actualTagName}:nth-of-type(${count})`;
        
        // Create fixed token with new selector
        const fixedToken: ElementToken = {
          ...token,
          element: actualTagName.toUpperCase(),
          selector: newSelector,
          tagName: actualTagName,
        };
        
        fixedTokens.push(fixedToken);
      } else {
        console.warn('Could not fix selector for token:', token);
        // Keep original token if we can't fix it
        fixedTokens.push(token);
      }
    } catch (e) {
      console.error('Error fixing token selector:', e);
      fixedTokens.push(token);
    }
  });
  
  return fixedTokens;
};


// --- OPTIMIZATION: Extracted TokenEditorRow Component ---
const TokenEditorRow: React.FC<{
  index: number;
  token: ElementToken;
  globalConfig: GlobalConfig;
  updateElementToken: (index: number, updates: Partial<ElementToken>) => void;
}> = React.memo(({ index, token, globalConfig, updateElementToken }) => {
  return (
    <div className="border-2 border-gray-200 rounded-xl p-4 hover:border-blue-300 transition-all">
      <div className="flex items-center justify-between mb-4">
        <h5 className="font-bold text-gray-800 flex items-center gap-2">
          <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-sm font-mono">
            {token.element}
          </span>
          {token.textPreview && (
            <span className="text-sm text-gray-600 italic">"{token.textPreview}"</span>
          )}
        </h5>
      </div>

      <div className="grid grid-cols-2 gap-4">

        {/* HTML Tag Selector */}
        <div>
          <label className="block text-sm font-semibold mb-2">HTML Tag</label>
          <select
            value={token.tagName}
            onChange={(e) => updateElementToken(index, { tagName: e.target.value as string })}
            className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
          >
            {/* Headings */}
            <optgroup label="Headings">
              <option value="h1">Heading 1 (h1)</option>
              <option value="h2">Heading 2 (h2)</option>
              <option value="h3">Heading 3 (h3)</option>
              <option value="h4">Heading 4 (h4)</option>
              <option value="h5">Heading 5 (h5)</option>
              <option value="h6">Heading 6 (h6)</option>
            </optgroup>
            
            {/* Text Elements */}
            <optgroup label="Text Elements">
              <option value="p">Paragraph (p)</option>
              <option value="span">Inline Span (span)</option>
              <option value="small">Small Text (small)</option>
            </optgroup>
            
            {/* Interactive Elements */}
            <optgroup label="Interactive">
              <option value="a">Link / Anchor (a)</option>
              <option value="button">Button (button)</option>
              <option value="label">Label (label)</option>
            </optgroup>
            
            {/* Semantic Text */}
            <optgroup label="Semantic Text">
              <option value="strong">Strong (strong)</option>
              <option value="b">Bold (b)</option>
              <option value="em">Emphasis (em)</option>
              <option value="i">Italic (i)</option>
              <option value="u">Underline (u)</option>
              <option value="mark">Mark (mark)</option>
              <option value="del">Deleted (del)</option>
              <option value="ins">Inserted (ins)</option>
            </optgroup>
            
            {/* Code Elements */}
            <optgroup label="Code">
              <option value="code">Inline Code (code)</option>
              <option value="pre">Preformatted (pre)</option>
            </optgroup>
            
            {/* Lists & Structure */}
            <optgroup label="Lists & Structure">
              <option value="li">List Item (li)</option>
              <option value="blockquote">Blockquote (blockquote)</option>
              <option value="div">Div Container (div)</option>
            </optgroup>
            
            {/* Table Elements */}
            <optgroup label="Table">
              <option value="th">Table Header (th)</option>
              <option value="td">Table Cell (td)</option>
            </optgroup>
            
            {/* Figure Elements */}
            <optgroup label="Figures">
              <option value="figcaption">Figure Caption (figcaption)</option>
              <option value="caption">Table Caption (caption)</option>
              <option value="legend">Fieldset Legend (legend)</option>
            </optgroup>
          </select>
          <div className="mt-1 text-xs text-gray-500">
            Current size: <span className="font-mono font-bold text-blue-600">{globalConfig?.typography.fontSize[token.fontSizeKey]}</span>
          </div>
        </div>

        {/* Font Size Selector */}
        <div>
          <label className="block text-sm font-semibold mb-2">Font Size Token</label>
          <select
            value={token.fontSizeKey}
            onChange={(e) => updateElementToken(index, { fontSizeKey: e.target.value as keyof GlobalConfig['typography']['fontSize'] })}
            className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
          >
            {Object.entries(globalConfig.typography.fontSize).map(([key, value]) => (
              <option key={key} value={key}>{key} - {value}</option>
            ))}
          </select>
          <div className="mt-1 text-xs text-gray-500">
            Current weight: <span className="font-mono font-bold text-blue-600">{globalConfig?.typography.fontWeight[token.fontWeightKey]}</span>
          </div>
        </div>

        {/* Font Weight Selector */}
        <div>
          <label className="block text-sm font-semibold mb-2">Font Weight Token</label>
          <select
            value={token.fontWeightKey}
            onChange={(e) => updateElementToken(index, { fontWeightKey: e.target.value as keyof GlobalConfig['typography']['fontWeight'] })}
            className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
          >
            {Object.entries(globalConfig.typography.fontWeight).map(([key, value]) => (
              <option key={key} value={key}>{key} - {value}</option>
            ))}
          </select>
        </div>

        {/* Text Color Selector */}
        <div>
          <label className="block text-sm font-semibold mb-2">Text Color Token</label>
          <select
            value={token.textColorKey}
            onChange={(e) => updateElementToken(index, { textColorKey: e.target.value as keyof GlobalConfig['colors']['text'] })}
            className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
          >
            {Object.entries(globalConfig.colors.text).map(([key, value]) => (
              <option key={key} value={key}>{key} - {value}</option>
            ))}
          </select>
        </div>

        {/* Background Color (for buttons/divs and other elements that support backgrounds) */}
        {(token.element === 'BUTTON' || token.element === 'DIV' || token.element === 'BLOCKQUOTE' || token.element === 'PRE') && (
          <div>
            <label className="block text-sm font-semibold mb-2">Background Token</label>
            <select
              value={token.backgroundColorKey || ''}
              onChange={(e) => updateElementToken(index, { backgroundColorKey: e.target.value || undefined })}
              className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
            >
              <option value="">None</option>
              {token.element === 'BUTTON' ? (
                Object.entries(globalConfig.colors.button).map(([key, value]) => (
                  <option key={key} value={key}>Button {key} - {value}</option>
                ))
              ) : (
                Object.entries(globalConfig.colors.background).map(([key, value]) => (
                  <option key={key} value={key}>BG {key} - {value}</option>
                ))
              )}
            </select>
          </div>
        )}

        {/* Padding */}
        <div>
          <label className="block text-sm font-semibold mb-2">Padding Token</label>
          <select
            value={token.paddingKey}
            onChange={(e) => updateElementToken(index, { paddingKey: e.target.value as keyof GlobalConfig['spacing'] })}
            className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
          >
            {Object.entries(globalConfig.spacing).map(([key, value]) => (
              <option key={key} value={key}>{key} - {value}</option>
            ))}
          </select>
        </div>

        {/* Border Radius */}
        {(token.element === 'BUTTON' || token.element === 'DIV' || token.element === 'A' || token.element === 'BLOCKQUOTE' || token.element === 'PRE' || token.element === 'CODE') && (
          <div>
            <label className="block text-sm font-semibold mb-2">Border Radius Token</label>
            <select
              value={token.borderRadiusKey || 'md'}
              onChange={(e) => updateElementToken(index, { borderRadiusKey: e.target.value as keyof GlobalConfig['borderRadius'] })}
              className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
            >
              {Object.entries(globalConfig.borderRadius).map(([key, value]) => (
                <option key={key} value={key}>{key} - {value}</option>
              ))}
            </select>
          </div>
        )}
      </div>
    </div>
  );
});
TokenEditorRow.displayName = 'TokenEditorRow';


// --- Token Editor Modal Component (Extracted for Performance) ---
const TokenEditorModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  componentName: string;
  componentHtml: string;
  activeTab: 'tokens' | 'manual';
  setActiveTab: (tab: 'tokens' | 'manual') => void;
  elementTokens: ElementToken[];
  globalConfig: GlobalConfig;
  updateElementToken: (index: number, updates: Partial<ElementToken>) => void;
  onHtmlChange: (html: string) => void;
  onApplyAndSave: () => void;
}> = React.memo(({
  isOpen,
  onClose,
  componentName,
  componentHtml,
  activeTab,
  setActiveTab,
  elementTokens,
  globalConfig,
  updateElementToken,
  onHtmlChange,
  onApplyAndSave
}) => {
  const scrollableContentRef = useRef<HTMLDivElement>(null);

  // Reset scroll when modal opens
  useEffect(() => {
    if (isOpen && scrollableContentRef.current) {
      scrollableContentRef.current.scrollTop = 0;
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const modalContent = (
    <div
      className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/60"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="w-full max-w-4xl max-h-[90vh] bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-4 flex items-center justify-between">
          <div>
            <h4 className="font-bold text-xl flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              Token Editor
            </h4>
            <p className="text-sm opacity-90">{componentName}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 px-6">
          {[
            { key: 'tokens', label: 'Design Tokens', icon: Sparkles },
            { key: 'manual', label: 'Manual HTML', icon: Palette }
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key as 'tokens' | 'manual')}
              className={`flex items-center gap-2 px-4 py-3 font-semibold border-b-2 transition-colors ${
                activeTab === key
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div ref={scrollableContentRef} className="overflow-y-auto p-6 h-[450px]">
          {activeTab === 'tokens' && (
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <strong>🎨 Design Tokens:</strong> Select token values from your global config. Changes apply automatically using Tailwind classes.
                </p>
                {globalConfig && (
                  <p className="text-xs text-blue-600 mt-2">
                    ✨ Using global config values: {Object.keys(globalConfig.typography.fontSize).length} font sizes, {Object.keys(globalConfig.colors.text).length} text colors
                  </p>
                )}
              </div>

              {elementTokens.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Sparkles className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No text elements detected in this component</p>
                  <p className="text-xs mt-2">Try adding HTML elements like h2, h3, p tags</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {elementTokens.map((token, index) => (
                    <TokenEditorRow
                      key={index}
                      index={index}
                      token={token}
                      globalConfig={globalConfig}
                      updateElementToken={updateElementToken}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'manual' && (
            <div className="space-y-6">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-800">
                  <strong>⚠️ Manual Mode:</strong> Edit HTML directly. Use design tokens for consistency.
                </p>
              </div>

              <div>
                <label className="block text-sm font-bold mb-2">HTML Content</label>
                <textarea
                  value={componentHtml}
                  onChange={(e) => onHtmlChange(e.target.value)}
                  className="w-full h-64 px-4 py-2 border-2 border-gray-300 rounded-lg font-mono text-sm focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t bg-gray-50">
          <button
            onClick={onApplyAndSave}
            className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 px-6 rounded-xl font-bold flex items-center justify-center gap-2 transition-all"
          >
            <Sparkles className="w-5 h-5" />
            Apply Tokens & Save
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
});
TokenEditorModal.displayName = 'TokenEditorModal';

// --- The Main Component ---
export const SortableComponent: React.FC<SortableComponentProps> = ({
  component,
  onDelete,
  onEdit,
  onCopy,
  onDuplicate,
  deviceType,
  isSelected = false,
  onSelect,
  zoomLevel = 100,
  globalConfig = defaultConfig as GlobalConfig
}) => {
  const initialIsLocked = component.isLocked ?? false;
  const [isHovered, setIsHovered] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLocked, setIsLocked] = useState(initialIsLocked);
  const [activeTab, setActiveTab] = useState<'tokens' | 'manual'>('tokens');
  const [elementTokens, setElementTokens] = useState<ElementToken[]>([]);

  const componentRef = useRef<HTMLDivElement>(null);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: component.id,
    disabled: isLocked
  });

  const style = useMemo(() => ({
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }), [transform, transition, isDragging]);


  // --- Helper: Update Element Token ---
  const updateElementToken = useCallback((index: number, updates: Partial<ElementToken>) => {
    setElementTokens(currentTokens => {
      const updated = [...currentTokens];

      if (updates.tagName && updated[index].tagName !== updates.tagName) {
        // If the tag name changed, reset defaults based on the new tag
        const newDefaults = getDefaultTokenMapping(updates.tagName);
        updated[index] = {
          ...updated[index],
          ...updates,
          fontSizeKey: newDefaults.fontSizeKey,
          fontWeightKey: newDefaults.fontWeightKey,
          textColorKey: newDefaults.textColorKey,
          backgroundColorKey: newDefaults.backgroundColorKey,
          paddingKey: newDefaults.paddingKey,
          borderRadiusKey: newDefaults.borderRadiusKey,
          tagName: newDefaults.tagName || updates.tagName,
        };
      } else {
        updated[index] = { ...updated[index], ...updates };
      }

      // Save tokens immediately when changed
      onEdit(component.id, { elementTokens: updated });

      return updated;
    });
  }, [component.id, onEdit]);
  // --- END Update Element Token ---

  // Callback for manual HTML editing
  const handleHtmlChange = useCallback((html: string) => {
    onEdit(component.id, {
      component: { ...component.component, html }
    });
  }, [component.id, component.component, onEdit]);
  
  // --- HTML Token Application Logic (Memoized) ---
const applyTokensToHTML = useCallback((
  html: string, 
  tokens: ElementToken[], 
  shouldUpdateSelectors: boolean = false
): { html: string; updatedTokens?: ElementToken[] } => {
  if (!globalConfig) return { html };

  const parser = new DOMParser();
  const doc = parser.parseFromString(`<html><body>${html}</body></html>`, 'text/html');

  // 1. Add unique data attributes to track elements BEFORE any modifications
  // FIXED: Enhanced selector matching with fallbacks
  tokens.forEach((token, index) => {
    try {
      // Try original selector first
      let element = doc.querySelector(token.selector);
      
      // If not found, try simplified selector (remove parent)
      if (!element && token.selector.includes(' > ')) {
        const simplifiedSelector = token.selector.split(' > ').pop();
        if (simplifiedSelector) {
          element = doc.querySelector(simplifiedSelector);
        }
      }
      
      // If still not found, try just the tag name with nth-of-type
      if (!element) {
        const match = token.selector.match(/(\w+):nth-of-type\((\d+)\)/);
        if (match) {
          const [, tagName, position] = match;
          element = doc.querySelector(`${tagName}:nth-of-type(${position})`);
        }
      }
      
      if (element) {
        element.setAttribute('data-token-id', `token-${index}`);
      } else {
        console.warn(`Could not find element for token ${index}:`, token.selector);
      }
    } catch (e) {
      console.error(`Error setting data-token-id for token ${index}:`, e);
    }
  });

  // 2. Apply tokens to each element
  tokens.forEach((token, index) => {
    try {
      let element = doc.querySelector(`[data-token-id="token-${index}"]`);

      if (element) {
        // 2a. Tag Name Replacement Logic
        if (element.tagName.toLowerCase() !== token.tagName.toLowerCase()) {
          const newElement = doc.createElement(token.tagName);

          // Copy all attributes
          Array.from(element.attributes).forEach(attr => {
            newElement.setAttribute(attr.name, attr.value);
          });

          // Move all children
          while (element.firstChild) {
            newElement.appendChild(element.firstChild);
          }

          element.parentNode?.replaceChild(newElement, element);
          element = newElement;
        }

       // 2b. Class Cleanup - Remove old token classes and normalize
       const existingClasses = element.getAttribute('class') || '';
        
       // Remove the class attribute entirely first to prevent corruption
       element.removeAttribute('class');
       
       const classesToKeep = existingClasses
         .split(/\s+/)  // Split on any whitespace
         .filter(cls => cls.length > 0 && !shouldRemoveTokenClass(cls));

       // 2c. Apply New Tailwind Classes
       const tailwindClasses: string[] = [];

        // Font Size - with validation
        const sizeTokenMap: Record<keyof GlobalConfig['typography']['fontSize'], string> = { 
          'heading': 'text-heading', 
          'headingSmall': 'text-headingSmall', 
          'titleLarge': 'text-titleLarge', 
          'title': 'text-title', 
          'subtitle': 'text-subtitle', 
          'body': 'text-body', 
          'caption': 'text-caption' 
        };
        if (token.fontSizeKey && token.fontSizeKey in sizeTokenMap) {
          tailwindClasses.push(sizeTokenMap[token.fontSizeKey]);
        } else if (token.fontSizeKey) {
          console.warn(`Invalid fontSizeKey: ${token.fontSizeKey} for element ${token.element}`);
          tailwindClasses.push('text-body'); // fallback
        }

        // Font Weight - with validation
        const weightTokenMap: Record<keyof GlobalConfig['typography']['fontWeight'], string> = { 
          'light': 'font-light', 
          'regular': 'font-regular', 
          'medium': 'font-medium', 
          'semibold': 'font-semibold', 
          'bold': 'font-bold' 
        };
        if (token.fontWeightKey && token.fontWeightKey in weightTokenMap) {
          tailwindClasses.push(weightTokenMap[token.fontWeightKey]);
        } else if (token.fontWeightKey) {
          console.warn(`Invalid fontWeightKey: ${token.fontWeightKey} for element ${token.element}`);
          tailwindClasses.push('font-regular'); // fallback
        }

        // Text Color - with validation
        const colorTokenMap: Record<keyof GlobalConfig['colors']['text'], string> = { 
          'primary': 'text-primary', 
          'secondary': 'text-secondary', 
          'accent': 'text-accent', 
          'muted': 'text-muted', 
          'inverse': 'text-inverse' 
        };
        if (token.textColorKey && token.textColorKey in colorTokenMap) {
          tailwindClasses.push(colorTokenMap[token.textColorKey]);
        } else if (token.textColorKey) {
          console.warn(`Invalid textColorKey: ${token.textColorKey} for element ${token.element}`);
          tailwindClasses.push('text-primary'); // fallback
        }

        // Background Color - with validation
        if (token.backgroundColorKey) {
          let bgColorClass = '';
          if (token.element === 'BUTTON') {
            const buttonColorMap: Record<string, string> = {
                'primary': 'bg-button-primary hover:bg-button-primary-hover',
                'secondary': 'bg-button-secondary hover:bg-button-secondary-hover',
                'success': 'bg-button-success hover:bg-button-success-hover',
                'danger': 'bg-button-danger hover:bg-button-danger-hover',
                'ghost': 'bg-button-ghost hover:bg-button-ghost-hover',
            };
            bgColorClass = buttonColorMap[token.backgroundColorKey] || '';
            if (!bgColorClass) {
              console.warn(`Invalid backgroundColorKey for button: ${token.backgroundColorKey}`);
            }
          } else if (['DIV', 'BLOCKQUOTE', 'PRE'].includes(token.element)) {
            const backgroundColorMap: Record<string, string> = {
                'primary': 'bg-primary',
                'secondary': 'bg-secondary',
                'surface': 'bg-surface',
                'card': 'bg-card',
            };
            bgColorClass = backgroundColorMap[token.backgroundColorKey] || '';
            if (!bgColorClass) {
              console.warn(`Invalid backgroundColorKey: ${token.backgroundColorKey}`);
            }
          }
          if (bgColorClass) {
            tailwindClasses.push(bgColorClass);
          }
        }

        // Padding - with validation
        const paddingTokenMap: Record<keyof GlobalConfig['spacing'], string> = { 
          'xs': 'p-xs', 
          'sm': 'p-sm', 
          'md': 'p-md', 
          'lg': 'p-lg', 
          'xl': 'p-xl', 
          '2xl': 'p-2xl' 
        };
        if (token.paddingKey && token.paddingKey in paddingTokenMap) {
          tailwindClasses.push(paddingTokenMap[token.paddingKey]);
        } else if (token.paddingKey) {
          console.warn(`Invalid paddingKey: ${token.paddingKey} for element ${token.element}`);
          tailwindClasses.push('p-md'); // fallback
        }

        // Border Radius - with validation
        const radiusTokenMap: Record<keyof GlobalConfig['borderRadius'], string> = { 
          'none': 'rounded-none', 
          'sm': 'rounded-sm', 
          'md': 'rounded-md', 
          'lg': 'rounded-lg', 
          'full': 'rounded-full' 
        };
        if (token.borderRadiusKey && token.borderRadiusKey in radiusTokenMap) {
          tailwindClasses.push(radiusTokenMap[token.borderRadiusKey]);
        } else if (token.borderRadiusKey) {
          console.warn(`Invalid borderRadiusKey: ${token.borderRadiusKey} for element ${token.element}`);
        }
       // 2d. Final Class Assignment - Combine kept classes with new token classes
       const allClasses = [...classesToKeep, ...tailwindClasses]
       .filter(cls => cls && cls.trim().length > 0)
       .map(cls => cls.trim())
       .join(' ');
     
     // Set the final class string (only if we have classes)
     if (allClasses.length > 0) {
       element.setAttribute('class', allClasses);
     } else {
          element.removeAttribute('class');
        }
      } else {
        console.warn(`Element not found for token ${index}:`, token.selector);
      }
    } catch (e) {
      console.error(`Error applying token ${index}:`, token, e);
    }
  });

  let updatedTokens: ElementToken[] | undefined = undefined;

  // 3. Regenerate selectors (only when requested, i.e., on save)
  if (shouldUpdateSelectors) {
    updatedTokens = [];
    const globalCounters: Record<string, number> = {};

    tokens.forEach((token, index) => {
      const element = doc.querySelector(`[data-token-id="token-${index}"]`);
      if (element) {
        const actualTagName = element.tagName.toLowerCase();

        if (!globalCounters[actualTagName]) {
          globalCounters[actualTagName] = 0;
        }
        globalCounters[actualTagName]++;

        const count = globalCounters[actualTagName];
        const newSelector = `${actualTagName}:nth-of-type(${count})`;

        const textContent = element.textContent?.trim() || '';
        const previewText = textContent.length > 30
          ? textContent.substring(0, 30) + '...'
          : textContent;

        // Create updated token preserving all properties
        const updatedToken: ElementToken = {
          element: actualTagName.toUpperCase(),
          selector: newSelector,
          tagName: actualTagName,
          textPreview: previewText,
          fontSizeKey: token.fontSizeKey,
          fontWeightKey: token.fontWeightKey,
          textColorKey: token.textColorKey,
          paddingKey: token.paddingKey,
        };

        // Only add optional properties if they exist in original token
        if (token.backgroundColorKey !== undefined) {
          updatedToken.backgroundColorKey = token.backgroundColorKey;
        }
        
        if (token.borderRadiusKey !== undefined) {
          updatedToken.borderRadiusKey = token.borderRadiusKey;
        }

        updatedTokens!.push(updatedToken);
      } else {
        console.warn(`Element not found when updating selectors for token ${index}`);
      }
    });
  }

  // 4. Remove all tracking attributes before returning HTML
  doc.querySelectorAll('[data-token-id]').forEach(el => {
    el.removeAttribute('data-token-id');
  });

  // Get clean HTML and fix any malformed attributes
  let cleanHTML = doc.body.innerHTML;
  
  // Fix malformed class attributes (class= text-...) -> (class="text-...")
  cleanHTML = cleanHTML.replace(/class=\s+([^"\s][^>]*?)>/g, (match, classes) => {
    const cleanClasses = classes.trim().replace(/"/g, '');
    return `class="${cleanClasses}">`;
  });

  return { html: cleanHTML, updatedTokens };
}, [globalConfig]);
// --- END HTML Token Application Logic (Memoized) ---


  // --- EFFECT: Initialize Tokens ---
  useEffect(() => {
    // Check if component.component.html exists before attempting to parse/detect
    if (component.component.html) {
        const hasExistingTokens = component.elementTokens && Array.isArray(component.elementTokens) && component.elementTokens.length > 0;

        if (!hasExistingTokens) {
            const detected = detectElements(component.component.html);
            setElementTokens(detected);
            // Only update parent state if detection found new tokens
            if (detected.length > 0) {
                onEdit(component.id, { elementTokens: detected });
            }
        } else if (hasExistingTokens) {
            // Use existing tokens if they are present and valid
            setElementTokens(component.elementTokens as ElementToken[]);
        }
    }
  }, [component.id, component.elementTokens, component.component.html, onEdit]);
  // --- END EFFECT: Initialize Tokens ---

  // --- EFFECT: Auto-fix complex selectors on mount ---
useEffect(() => {
  if (elementTokens.length > 0 && component.component.html) {
    const hasComplexSelectors = elementTokens.some(token => 
      token.selector.includes(' > ')
    );
    
    if (hasComplexSelectors) {
      console.log('Fixing complex selectors automatically...');
      const fixedTokens = fixTokenSelectors(elementTokens, component.component.html);
      setElementTokens(fixedTokens);
      onEdit(component.id, { elementTokens: fixedTokens });
    }
  }
}, []); // Run once on mount
// --- END EFFECT: Auto-fix complex selectors ---

  // --- HANDLERS ---
  const handleComponentClick = (e: React.MouseEvent) => {
    if (isLocked) return;
    e.stopPropagation();
    const multiSelect = e.ctrlKey || e.metaKey;
    onSelect?.(multiSelect);
  };

  const handleLockToggle = () => {
    const newLocked = !isLocked;
    setIsLocked(newLocked);
    onEdit(component.id, { isLocked: newLocked });
  };

  // Memoized function for saving changes
  const handleApplyTokensAndSave = useCallback(() => {
    // 1. Force regenerate CSS variables (kept for context, but is external)
    if (globalConfig) {
      const generateCSSVars = (configData: GlobalConfig): string => {
        return `
          :root {
            /* ... CSS variables for all tokens ... */
            --font-size-heading: ${configData.typography.fontSize.heading};
            --font-size-headingSmall: ${configData.typography.fontSize.headingSmall};
            --font-size-titleLarge: ${configData.typography.fontSize.titleLarge};
            --font-size-title: ${configData.typography.fontSize.title};
            --font-size-subtitle: ${configData.typography.fontSize.subtitle};
            --font-size-body: ${configData.typography.fontSize.body};
            --font-size-caption: ${configData.typography.fontSize.caption};

            --font-weight-light: ${configData.typography.fontWeight.light};
            --font-weight-regular: ${configData.typography.fontWeight.regular};
            --font-weight-medium: ${configData.typography.fontWeight.medium};
            --font-weight-semibold: ${configData.typography.fontWeight.semibold};
            --font-weight-bold: ${configData.typography.fontWeight.bold};

            --color-text-primary: ${configData.colors.text.primary};
            --color-text-secondary: ${configData.colors.text.secondary};
            --color-text-accent: ${configData.colors.text.accent};
            --color-text-muted: ${configData.colors.text.muted};
            --color-text-inverse: ${configData.colors.text.inverse};

            --color-bg-primary: ${configData.colors.background.primary};
            --color-bg-secondary: ${configData.colors.background.secondary};
            --color-bg-surface: ${configData.colors.background.surface};
            --color-bg-card: ${configData.colors.background.card};

            --color-button-primary: ${configData.colors.button.primary};
            --color-button-secondary: ${configData.colors.button.secondary};
            --color-button-success: ${configData.colors.button.success};
            --color-button-danger: ${configData.colors.button.danger};
            --color-button-ghost: ${configData.colors.button.ghost};

            --spacing-xs: ${configData.spacing.xs};
            --spacing-sm: ${configData.spacing.sm};
            --spacing-md: ${configData.spacing.md};
            --spacing-lg: ${configData.spacing.lg};
            --spacing-xl: ${configData.spacing.xl};
            --spacing-2xl: ${configData.spacing['2xl']};

            --radius-none: ${configData.borderRadius.none};
            --radius-sm: ${configData.borderRadius.sm};
            --radius-md: ${configData.borderRadius.md};
            --radius-lg: ${configData.borderRadius.lg};
            --radius-full: ${configData.borderRadius.full};
          }

          /* Semantic Token Classes */
          .text-heading { font-size: var(--font-size-heading) !important; }
          .text-headingSmall { font-size: var(--font-size-headingSmall) !important; }
          .text-titleLarge { font-size: var(--font-size-titleLarge) !important; }
          .text-title { font-size: var(--font-size-title) !important; }
          .text-subtitle { font-size: var(--font-size-subtitle) !important; }
          .text-body { font-size: var(--font-size-body) !important; }
          .text-caption { font-size: var(--font-size-caption) !important; }

          .font-light { font-weight: var(--font-weight-light) !important; }
          .font-regular { font-weight: var(--font-weight-regular) !important; }
          .font-medium { font-weight: var(--font-weight-medium) !important; }
          .font-semibold { font-weight: var(--font-weight-semibold) !important; }
          .font-bold { font-weight: var(--font-weight-bold) !important; }

          .text-primary { color: var(--color-text-primary) !important; }
          .text-secondary { color: var(--color-text-secondary) !important; }
          .text-accent { color: var(--color-text-accent) !important; }
          .text-muted { color: var(--color-text-muted) !important; }
          .text-inverse { color: var(--color-text-inverse) !important; }

          .bg-primary { background-color: var(--color-bg-primary) !important; }
          .bg-secondary { background-color: var(--color-bg-secondary) !important; }
          .bg-surface { background-color: var(--color-bg-surface) !important; }
          .bg-card { background-color: var(--color-bg-card) !important; }

          .bg-button-primary { background-color: var(--color-button-primary) !important; }
          .bg-button-primary-hover:hover { background-color: color-mix(in srgb, var(--color-button-primary) 85%, black) !important; }
          .bg-button-secondary { background-color: var(--color-button-secondary) !important; }
          .bg-button-secondary-hover:hover { background-color: color-mix(in srgb, var(--color-button-secondary) 85%, black) !important; }
          .bg-button-success { background-color: var(--color-button-success) !important; }
          .bg-button-success-hover:hover { background-color: color-mix(in srgb, var(--color-button-success) 85%, black) !important; }
          .bg-button-danger { background-color: var(--color-button-danger) !important; }
          .bg-button-danger-hover:hover { background-color: color-mix(in srgb, var(--color-button-danger) 85%, black) !important; }
          .bg-button-ghost { background-color: var(--color-button-ghost) !important; }
          .bg-button-ghost-hover:hover { background-color: rgba(0, 0, 0, 0.05) !important; }

          .p-xs { padding: var(--spacing-xs) !important; }
          .p-sm { padding: var(--spacing-sm) !important; }
          .p-md { padding: var(--spacing-md) !important; }
          .p-lg { padding: var(--spacing-lg) !important; }
          .p-xl { padding: var(--spacing-xl) !important; }
          .p-2xl { padding: var(--spacing-2xl) !important; }
        `;
      };

      const cssVars = generateCSSVars(globalConfig);
      let styleTag = document.getElementById('design-tokens-style');
      if (!styleTag) {
        styleTag = document.createElement('style');
        styleTag.id = 'design-tokens-style';
        document.head.appendChild(styleTag);
      }
      styleTag.textContent = cssVars;
    }

    // 2. Apply tokens and get updated selectors/HTML
    const result = applyTokensToHTML(component.component.html, elementTokens, true);

    // 3. Update parent state
    onEdit(component.id, {
      component: { ...component.component, html: result.html },
      elementTokens: result.updatedTokens ?? elementTokens
    });

    // 4. Update local state with new tokens (selectors were regenerated)
    if (result.updatedTokens) {
      setElementTokens(result.updatedTokens);
    }

    setIsEditing(false);
    toast.success('Tokens applied successfully!');
  }, [component.id, component.component, elementTokens, onEdit, globalConfig, applyTokensToHTML]);


  // Memoized function for opening the editor
  const handleOpenEditor = useCallback(() => {
    const currentTokens = component.elementTokens && Array.isArray(component.elementTokens) && component.elementTokens.length > 0
      ? component.elementTokens as ElementToken[]
      : detectElements(component.component.html);

    // Update local state to match what's saved/detected
    setElementTokens(currentTokens);
    setIsEditing(true);
  }, [component.elementTokens, component.component.html]);


  // Memoize the content of the live preview
  const livePreviewHTML = useMemo(() => {
    if (!globalConfig) {
      return component.component.html;
    }
    // Use the latest tokens from state for the live preview
    return applyTokensToHTML(component.component.html, elementTokens, false).html;
  }, [component.component.html, globalConfig, elementTokens, applyTokensToHTML]);


  // --- MAIN RENDER ---
  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative group transition-all duration-200 ${
        isDragging ? 'z-50' : 'z-0'
      } ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
      onClick={handleComponentClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {(isHovered || isDragging || isSelected) && !isLocked && (
        <div className="absolute top-0 left-0 right-0 bg-gray-900/95 text-white px-4 py-2 rounded-t-xl shadow-xl z-[999] flex items-center justify-between">
          {/* ... Control buttons (Listeners, info, etc.) ... */}
          <div className="flex items-center space-x-3">
            <button
              {...attributes}
              {...listeners}
              className="cursor-grab active:cursor-grabbing p-2 hover:bg-white/10 rounded-lg"
            >
              <GripVertical className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold">{component.component.name}</span>
              <span className="text-xs bg-white/20 px-2 py-1 rounded-full">
                {component.component.category}
              </span>
              {component.component.is_premium && (
                <div className="flex items-center gap-1 bg-yellow-400 px-2 py-1 rounded-full">
                  <Star className="w-3 h-3 text-yellow-900 fill-current" />
                  <span className="text-xs text-yellow-900 font-bold">PRO</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-1">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-2 hover:bg-white/10 rounded-lg"
            >
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            <button
              onClick={handleLockToggle}
              className={`p-2 rounded-lg ${isLocked ? 'bg-red-500/20 text-red-400' : 'hover:bg-white/10'}`}
            >
              {isLocked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
            </button>

            <button
              onClick={handleOpenEditor}
              className={`p-2 rounded-lg ${isEditing ? 'bg-blue-500/20 text-blue-400' : 'hover:bg-white/10'}`}
            >
              <Edit3 className="w-4 h-4" />
            </button>

            {onCopy && (
              <button onClick={() => onCopy(component)} className="p-2 hover:bg-white/10 rounded-lg">
                <Copy className="w-4 h-4" />
              </button>
            )}

            {onDuplicate && (
              <button onClick={() => onDuplicate(component)} className="p-2 hover:bg-white/10 rounded-lg">
                <RotateCw className="w-4 h-4" />
              </button>
            )}

            <button
              onClick={() => onDelete(component.id)}
              className="p-2 hover:bg-red-500/20 text-red-400 rounded-lg"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {isLocked && (
        <div className="absolute top-3 right-3 bg-red-500 text-white p-2 rounded-lg shadow-xl z-[998]">
          <Lock className="w-4 h-4" />
        </div>
      )}

      {/* Render the optimized editor modal */}
      <TokenEditorModal
        isOpen={isEditing}
        onClose={() => setIsEditing(false)}
        componentName={component.component.name}
        componentHtml={component.component.html}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        elementTokens={elementTokens}
        globalConfig={globalConfig}
        updateElementToken={updateElementToken}
        onHtmlChange={handleHtmlChange}
        onApplyAndSave={handleApplyTokensAndSave}
      />

      <div
        ref={componentRef}
        style={{
            // Add zoom scaling for responsiveness, ensuring the component's preview scales correctly
            transform: `scale(${zoomLevel / 100})`,
            transformOrigin: 'top left',
            width: `${100 / (zoomLevel / 100)}%`, // Correct width to avoid horizontal scrollbar when zoomed in
        }}
        className={`relative transition-all duration-200 ${
          isHovered && !isLocked ? 'ring-1 ring-blue-300' : ''
        } ${isSelected ? 'ring-2 ring-blue-500' : ''} ${isLocked ? 'opacity-75' : ''}`}
        dangerouslySetInnerHTML={{ __html: livePreviewHTML }}
      />

      {isSelected && (
        <div className="absolute -top-2 -left-2 w-5 h-5 bg-blue-500 rounded-full shadow-xl border-2 border-white animate-pulse"></div>
      )}

      {/* Expanded Info */}
      {isExpanded && (
        <div className="absolute top-full left-0 right-0 bg-white/95 border border-gray-200 rounded-b-xl shadow-2xl p-4 z-[998]">
          <div className="grid grid-cols-3 gap-6 text-sm">
            {/* Info Section */}
            <div>
              <h5 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                <Settings className="w-4 h-4 text-blue-600" />
                Component Info
              </h5>
              <div className="space-y-2">
                <p className="text-gray-700"><span className="font-semibold text-gray-800">Name:</span> <span className="text-gray-600">{component.component.name}</span></p>
                <p className="text-gray-700"><span className="font-semibold text-gray-800">Category:</span> <span className="text-gray-600">{component.component.category}</span></p>
                <p className="text-gray-700"><span className="font-semibold text-gray-800">Elements:</span> <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-xs font-bold">{elementTokens.length}</span></p>
                <p className="text-gray-700"><span className="font-semibold text-gray-800">Premium:</span> <span className="text-gray-600">{component.component.is_premium ? 'Yes ⭐' : 'No'}</span></p>
              </div>
            </div>

            {/* Tags Section */}
            <div>
              <h5 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                <Hash className="w-4 h-4 text-purple-600" />
                Tags
              </h5>
              {component.component.tags.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {component.component.tags.map(tag => (
                    <span key={tag} className="bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-xs font-medium hover:bg-purple-200 transition-colors">
                      #{tag}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 italic">No tags</p>
              )}
            </div>

            {/* Tokens Preview */}
            <div>
              <h5 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-yellow-600" />
                Active Tokens
              </h5>
              <div className="space-y-1 text-xs">
                <p className="text-gray-600"><span className="font-semibold">HTML Tag:</span> <span className="bg-red-100 text-red-700 px-1.5 py-0.5 rounded font-mono">{elementTokens[0]?.tagName || 'N/A'}</span></p>
                <p className="text-gray-600"><span className="font-semibold">Font Size:</span> <span className="bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded font-mono">{elementTokens[0]?.fontSizeKey || 'N/A'}</span></p>
                <p className="text-gray-600"><span className="font-semibold">Font Weight:</span> <span className="bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded font-mono">{elementTokens[0]?.fontWeightKey || 'N/A'}</span></p>
                <p className="text-gray-600"><span className="font-semibold">Text Color:</span> <span className="bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded font-mono">{elementTokens[0]?.textColorKey || 'N/A'}</span></p>
                <p className="text-gray-600"><span className="font-semibold">Padding:</span> <span className="bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded font-mono">{elementTokens[0]?.paddingKey || 'N/A'}</span></p>
              </div>
            </div>
          </div>

          {/* Separator */}
          <div className="border-t border-gray-200 my-4"></div>

          {/* Token Details Table */}
          <div>
            <h5 className="font-bold text-gray-800 mb-3">Element Token Mapping</h5>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b-2 border-gray-300">
                    <th className="text-left py-2 px-2 font-bold text-gray-700">Element</th>
                    <th className="text-left py-2 px-2 font-bold text-gray-700">Selector</th>
                    <th className="text-left py-2 px-2 font-bold text-gray-700">Tag Name</th>
                    <th className="text-left py-2 px-2 font-bold text-gray-700">Size</th>
                    <th className="text-left py-2 px-2 font-bold text-gray-700">Weight</th>
                    <th className="text-left py-2 px-2 font-bold text-gray-700">Color</th>
                  </tr>
                </thead>
                <tbody>
                  {elementTokens.slice(0, 5).map((token, idx) => (
                    <tr key={idx} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="py-2 px-2"><span className="bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded text-xs font-mono">{token.element}</span></td>
                      <td className="py-2 px-2 text-gray-600 font-mono">{token.selector}</td>
                      <td className="py-2 px-2"><span className="bg-red-100 text-red-700 px-1 py-0.5 rounded font-mono">{token.tagName}</span></td>
                      <td className="py-2 px-2"><span className="bg-green-100 text-green-700 px-1 py-0.5 rounded font-mono">{token.fontSizeKey}</span></td>
                      <td className="py-2 px-2"><span className="bg-orange-100 text-orange-700 px-1 py-0.5 rounded font-mono">{token.fontWeightKey}</span></td>
                      <td className="py-2 px-2"><span className="bg-purple-100 text-purple-700 px-1 py-0.5 rounded font-mono">{token.textColorKey}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {elementTokens.length > 5 && (
                <p className="text-xs text-gray-500 mt-2 italic">+{elementTokens.length - 5} more elements...</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
