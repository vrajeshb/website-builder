import React, { useState, useEffect } from 'react';
import { X, Palette, Type, Box, Save } from 'lucide-react';
import toast from 'react-hot-toast';

export interface GlobalConfig {
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
      overlay: string;
    };
    button: {
      primary: string;
      secondary: string;
      success: string;
      danger: string;
      ghost: string;
    };
    border: {
      primary: string;
      secondary: string;
      divider: string;
      focus: string;
    };
  };
  typography: {
    fontSize: {
      heading: string;        // h1
      headingSmall: string;   // h2
      titleLarge: string;     // h3
      title: string;          // h4
      subtitle: string;       // h5, h6
      body: string;           // p
      caption: string;        // small, span
    };
    fontWeight: {
      light: string;
      regular: string;
      medium: string;
      semibold: string;
      bold: string;
    };
    lineHeight: {
      tight: string;
      normal: string;
      relaxed: string;
    };
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

interface GlobalConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: GlobalConfig;
  onSave: (config: GlobalConfig) => void;
}

const defaultConfig: GlobalConfig = {
  colors: {
    text: {
      primary: '#1f2937',
      secondary: '#6b7280',
      accent: '#3b82f6',
      muted: '#9ca3af',
      inverse: '#ffffff',
    },
    background: {
      primary: '#ffffff',
      secondary: '#f9fafb',
      surface: '#f3f4f6',
      card: '#ffffff',
      overlay: '#00000080',
    },
    button: {
      primary: '#3b82f6',
      secondary: '#6b7280',
      success: '#10b981',
      danger: '#ef4444',
      ghost: '#00000000',
    },
    border: {
      primary: '#3b82f6',
      secondary: '#d1d5db',
      divider: '#e5e7eb',
      focus: '#3b82f6',
    },
  },
  typography: {
    fontSize: {
      heading: '48px',
      headingSmall: '36px',
      titleLarge: '30px',
      title: '24px',
      subtitle: '20px',
      body: '16px',
      caption: '14px',
    },
    fontWeight: {
      light: '300',
      regular: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
    },
    lineHeight: {
      tight: '1.25',
      normal: '1.5',
      relaxed: '1.75',
    },
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    '2xl': '48px',
  },
  borderRadius: {
    none: '0px',
    sm: '4px',
    md: '8px',
    lg: '12px',
    full: '9999px',
  },
};

export const GlobalConfigModal: React.FC<GlobalConfigModalProps> = ({
  isOpen,
  onClose,
  config,
  onSave,
}) => {
  const [localConfig, setLocalConfig] = useState<GlobalConfig>(config || defaultConfig);
  const [activeTab, setActiveTab] = useState<'colors' | 'typography' | 'spacing'>('colors');

  const generateCSSVariables = (configData: GlobalConfig): string => {
    return `
      :root {
        /* Typography - Font Sizes */
        --font-size-heading: ${configData.typography.fontSize.heading};
        --font-size-headingSmall: ${configData.typography.fontSize.headingSmall};
        --font-size-titleLarge: ${configData.typography.fontSize.titleLarge};
        --font-size-title: ${configData.typography.fontSize.title};
        --font-size-subtitle: ${configData.typography.fontSize.subtitle};
        --font-size-body: ${configData.typography.fontSize.body};
        --font-size-caption: ${configData.typography.fontSize.caption};
        
        /* Typography - Font Weights */
        --font-weight-light: ${configData.typography.fontWeight.light};
        --font-weight-regular: ${configData.typography.fontWeight.regular};
        --font-weight-medium: ${configData.typography.fontWeight.medium};
        --font-weight-semibold: ${configData.typography.fontWeight.semibold};
        --font-weight-bold: ${configData.typography.fontWeight.bold};
        
        /* Colors - Text */
        --color-text-primary: ${configData.colors.text.primary};
        --color-text-secondary: ${configData.colors.text.secondary};
        --color-text-accent: ${configData.colors.text.accent};
        --color-text-muted: ${configData.colors.text.muted};
        --color-text-inverse: ${configData.colors.text.inverse};
        
        /* Colors - Background */
        --color-bg-primary: ${configData.colors.background.primary};
        --color-bg-secondary: ${configData.colors.background.secondary};
        --color-bg-surface: ${configData.colors.background.surface};
        --color-bg-card: ${configData.colors.background.card};
        
        /* Colors - Button */
        --color-button-primary: ${configData.colors.button.primary};
        --color-button-secondary: ${configData.colors.button.secondary};
        --color-button-success: ${configData.colors.button.success};
        --color-button-danger: ${configData.colors.button.danger};
        --color-button-ghost: ${configData.colors.button.ghost};
        
        /* Spacing */
        --spacing-xs: ${configData.spacing.xs};
        --spacing-sm: ${configData.spacing.sm};
        --spacing-md: ${configData.spacing.md};
        --spacing-lg: ${configData.spacing.lg};
        --spacing-xl: ${configData.spacing.xl};
        --spacing-2xl: ${configData.spacing['2xl']};
        
        /* Border Radius */
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

  useEffect(() => {
    setLocalConfig(config || defaultConfig);
    
    // Initialize CSS variables on mount
    const cssVars = generateCSSVariables(config || defaultConfig);
    let styleTag = document.getElementById('design-tokens-style');
    if (!styleTag) {
      styleTag = document.createElement('style');
      styleTag.id = 'design-tokens-style';
      document.head.appendChild(styleTag);
    }
    styleTag.textContent = cssVars;
  }, [config]);

  const handleSave = () => {
    // Generate CSS variables from config
    const cssVars = generateCSSVariables(localConfig);
    
    // Inject CSS variables into document
    let styleTag = document.getElementById('design-tokens-style');
    if (!styleTag) {
      styleTag = document.createElement('style');
      styleTag.id = 'design-tokens-style';
      document.head.appendChild(styleTag);
    }
    styleTag.textContent = cssVars;
    
    onSave(localConfig);
    toast.success('Global config saved successfully!');
    onClose();
  };

  const handleReset = () => {
    setLocalConfig(defaultConfig);
    toast.success('Reset to default values');
  };

  const updateColor = (category: keyof GlobalConfig['colors'], key: string, value: string) => {
    setLocalConfig(prev => ({
      ...prev,
      colors: {
        ...prev.colors,
        [category]: {
          ...prev.colors[category],
          [key]: value,
        },
      },
    }));
  };

  const updateTypography = (category: keyof GlobalConfig['typography'], key: string, value: string) => {
    setLocalConfig(prev => ({
      ...prev,
      typography: {
        ...prev.typography,
        [category]: {
          ...prev.typography[category],
          [key]: value,
        },
      },
    }));
  };

  const updateSpacing = (key: string, value: string) => {
    setLocalConfig(prev => ({
      ...prev,
      spacing: {
        ...prev.spacing,
        [key]: value,
      },
    }));
  };

  const updateBorderRadius = (key: string, value: string) => {
    setLocalConfig(prev => ({
      ...prev,
      borderRadius: {
        ...prev.borderRadius,
        [key]: value,
      },
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/60" onClick={onClose}>
      <div
        className="w-full max-w-5xl max-h-[90vh] bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Global Design Config</h2>
            <p className="text-sm opacity-90">Define your design system tokens</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-lg transition-all">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 px-6 bg-gray-50">
          {[
            { key: 'colors', label: 'Colors', icon: Palette },
            { key: 'typography', label: 'Typography', icon: Type },
            { key: 'spacing', label: 'Spacing & Borders', icon: Box },
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key as any)}
              className={`flex items-center gap-2 px-6 py-4 font-semibold border-b-2 transition-all ${
                activeTab === key
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-800'
              }`}
            >
              <Icon className="w-5 h-5" />
              {label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* COLORS TAB */}
          {activeTab === 'colors' && (
            <div className="space-y-8">
              {/* Text Colors */}
              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <div className="w-1 h-6 bg-blue-500 rounded"></div>
                  Text Colors
                </h3>
                <div className="grid grid-cols-5 gap-4">
                  {Object.entries(localConfig.colors.text).map(([key, value]) => (
                    <div key={key}>
                      <label className="block text-sm font-semibold mb-2 capitalize">{key}</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={value}
                          onChange={(e) => updateColor('text', key, e.target.value)}
                          className="w-12 h-12 border-2 rounded-lg cursor-pointer"
                        />
                        <input
                          type="text"
                          value={value}
                          onChange={(e) => updateColor('text', key, e.target.value)}
                          className="flex-1 px-3 py-2 border-2 rounded-lg text-sm font-mono"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Background Colors */}
              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <div className="w-1 h-6 bg-green-500 rounded"></div>
                  Background Colors
                </h3>
                <div className="grid grid-cols-5 gap-4">
                  {Object.entries(localConfig.colors.background).map(([key, value]) => (
                    <div key={key}>
                      <label className="block text-sm font-semibold mb-2 capitalize">{key}</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={value}
                          onChange={(e) => updateColor('background', key, e.target.value)}
                          className="w-12 h-12 border-2 rounded-lg cursor-pointer"
                        />
                        <input
                          type="text"
                          value={value}
                          onChange={(e) => updateColor('background', key, e.target.value)}
                          className="flex-1 px-3 py-2 border-2 rounded-lg text-sm font-mono"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Button Colors */}
              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <div className="w-1 h-6 bg-purple-500 rounded"></div>
                  Button Colors
                </h3>
                <div className="grid grid-cols-5 gap-4">
                  {Object.entries(localConfig.colors.button).map(([key, value]) => (
                    <div key={key}>
                      <label className="block text-sm font-semibold mb-2 capitalize">{key}</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={value}
                          onChange={(e) => updateColor('button', key, e.target.value)}
                          className="w-12 h-12 border-2 rounded-lg cursor-pointer"
                        />
                        <input
                          type="text"
                          value={value}
                          onChange={(e) => updateColor('button', key, e.target.value)}
                          className="flex-1 px-3 py-2 border-2 rounded-lg text-sm font-mono"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Border Colors */}
              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <div className="w-1 h-6 bg-orange-500 rounded"></div>
                  Border Colors
                </h3>
                <div className="grid grid-cols-4 gap-4">
                  {Object.entries(localConfig.colors.border).map(([key, value]) => (
                    <div key={key}>
                      <label className="block text-sm font-semibold mb-2 capitalize">{key}</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={value}
                          onChange={(e) => updateColor('border', key, e.target.value)}
                          className="w-12 h-12 border-2 rounded-lg cursor-pointer"
                        />
                        <input
                          type="text"
                          value={value}
                          onChange={(e) => updateColor('border', key, e.target.value)}
                          className="flex-1 px-3 py-2 border-2 rounded-lg text-sm font-mono"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TYPOGRAPHY TAB */}
          {activeTab === 'typography' && (
            <div className="space-y-8">
              {/* Font Sizes */}
              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <div className="w-1 h-6 bg-blue-500 rounded"></div>
                  Font Sizes (Element Mapping)
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(localConfig.typography.fontSize).map(([key, value]) => (
                    <div key={key} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <label className="block text-sm font-semibold mb-2">
                          {key === 'heading' && '📐 Heading (h1)'}
                          {key === 'headingSmall' && '📐 Heading Small (h2)'}
                          {key === 'titleLarge' && '📐 Title Large (h3)'}
                          {key === 'title' && '📐 Title (h4)'}
                          {key === 'subtitle' && '📐 Subtitle (h5, h6)'}
                          {key === 'body' && '📝 Body (p)'}
                          {key === 'caption' && '📝 Caption (small, span)'}
                        </label>
                        <input
                          type="text"
                          value={value}
                          onChange={(e) => updateTypography('fontSize', key, e.target.value)}
                          className="w-full px-3 py-2 border-2 rounded-lg font-mono"
                          placeholder="e.g., 16px, 1rem"
                        />
                      </div>
                      <div style={{ fontSize: value }} className="text-gray-600 font-semibold">
                        Aa
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Font Weights */}
              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <div className="w-1 h-6 bg-green-500 rounded"></div>
                  Font Weights
                </h3>
                <div className="grid grid-cols-5 gap-4">
                  {Object.entries(localConfig.typography.fontWeight).map(([key, value]) => (
                    <div key={key}>
                      <label className="block text-sm font-semibold mb-2 capitalize">{key}</label>
                      <input
                        type="text"
                        value={value}
                        onChange={(e) => updateTypography('fontWeight', key, e.target.value)}
                        className="w-full px-3 py-2 border-2 rounded-lg font-mono"
                        placeholder="400"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Line Heights */}
              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <div className="w-1 h-6 bg-purple-500 rounded"></div>
                  Line Heights
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  {Object.entries(localConfig.typography.lineHeight).map(([key, value]) => (
                    <div key={key}>
                      <label className="block text-sm font-semibold mb-2 capitalize">{key}</label>
                      <input
                        type="text"
                        value={value}
                        onChange={(e) => updateTypography('lineHeight', key, e.target.value)}
                        className="w-full px-3 py-2 border-2 rounded-lg font-mono"
                        placeholder="1.5"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* SPACING TAB */}
          {activeTab === 'spacing' && (
            <div className="space-y-8">
              {/* Spacing */}
              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <div className="w-1 h-6 bg-blue-500 rounded"></div>
                  Spacing Scale
                </h3>
                <div className="grid grid-cols-6 gap-4">
                  {Object.entries(localConfig.spacing).map(([key, value]) => (
                    <div key={key}>
                      <label className="block text-sm font-semibold mb-2 uppercase">{key}</label>
                      <input
                        type="text"
                        value={value}
                        onChange={(e) => updateSpacing(key, e.target.value)}
                        className="w-full px-3 py-2 border-2 rounded-lg font-mono"
                        placeholder="16px"
                      />
                      <div
                        className="mt-2 bg-blue-500 rounded"
                        style={{ width: value, height: '8px' }}
                      ></div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Border Radius */}
              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <div className="w-1 h-6 bg-purple-500 rounded"></div>
                  Border Radius
                </h3>
                <div className="grid grid-cols-5 gap-4">
                  {Object.entries(localConfig.borderRadius).map(([key, value]) => (
                    <div key={key}>
                      <label className="block text-sm font-semibold mb-2 capitalize">{key}</label>
                      <input
                        type="text"
                        value={value}
                        onChange={(e) => updateBorderRadius(key, e.target.value)}
                        className="w-full px-3 py-2 border-2 rounded-lg font-mono"
                        placeholder="8px"
                      />
                      <div
                        className="mt-2 bg-gray-300 w-16 h-16"
                        style={{ borderRadius: value }}
                      ></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t bg-gray-50">
          <button
            onClick={handleReset}
            className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-bold hover:bg-gray-100 transition-all"
          >
            Reset to Default
          </button>
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-bold hover:bg-gray-100 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 px-6 rounded-xl font-bold flex items-center justify-center gap-2 transition-all"
          >
            <Save className="w-5 h-5" />
            Save Config
          </button>
        </div>
      </div>
    </div>
  );
};

export { defaultConfig };