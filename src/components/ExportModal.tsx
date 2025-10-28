import React, { useState } from 'react';
import { X, Download, Code, FileText, Files } from 'lucide-react';
import { Project, ExportFramework } from '../types';
import { exportService } from '../lib/export';
import toast from 'react-hot-toast';

interface Page {
  id: string;
  name: string;
  slug: string;
  components: any[];
  isHome?: boolean;
}

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project;
  pages?: Page[]; // Add pages prop
}

const FRAMEWORKS = [
  {
    id: 'html' as ExportFramework,
    name: 'HTML',
    description: 'Static HTML files for each page',
    icon: FileText,
    color: 'bg-orange-100 text-orange-600'
  },
  {
    id: 'react' as ExportFramework,
    name: 'React',
    description: 'React components with JSX',
    icon: Code,
    color: 'bg-blue-100 text-blue-600'
  },
  {
    id: 'nextjs' as ExportFramework,
    name: 'Next.js',
    description: 'Next.js project with pages',
    icon: Code,
    color: 'bg-gray-100 text-gray-600'
  },
  {
    id: 'vue' as ExportFramework,
    name: 'Vue',
    description: 'Vue.js components',
    icon: Code,
    color: 'bg-green-100 text-green-600'
  },
  {
    id: 'angular' as ExportFramework,
    name: 'Angular',
    description: 'Angular components (Coming Soon)',
    icon: Code,
    color: 'bg-red-100 text-red-600',
    disabled: true
  },
  {
    id: 'svelte' as ExportFramework,
    name: 'Svelte',
    description: 'Svelte components (Coming Soon)',
    icon: Code,
    color: 'bg-purple-100 text-purple-600',
    disabled: true
  }
];

export const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose, project, pages }) => {
  const [selectedFramework, setSelectedFramework] = useState<ExportFramework>('html');
  const [isExporting, setIsExporting] = useState(false);

  if (!isOpen) return null;

  // Parse pages from project if not provided directly
  const projectPages: Page[] = pages || 
    (project.pages ? 
      (typeof project.pages === 'string' ? JSON.parse(project.pages) : project.pages) 
      : [{
        id: 'page-1',
        name: 'Home',
        slug: 'home',
        components: project.components,
        isHome: true
      }]
    );

  const totalComponents = projectPages.reduce((sum, page) => sum + page.components.length, 0);
  const allCategories = new Set(
    projectPages.flatMap(page => 
      page.components.map(c => c.component?.category || 'uncategorized')
    )
  );

  const handleExport = async () => {
    setIsExporting(true);

    try {
      let files: Record<string, string>;

      switch (selectedFramework) {
        case 'html':
          files = generateMultiPageHTML(projectPages, project.name, project.settings);
          break;
        case 'react':
          files = generateMultiPageReact(projectPages, project.name);
          break;
        case 'nextjs':
          files = generateMultiPageNextJS(projectPages, project.name);
          break;
        case 'vue':
          files = generateMultiPageVue(projectPages, project.name);
          break;
        default:
          throw new Error('Unsupported framework');
      }

      await exportService.downloadFiles(files, project.name);
      toast.success(`${FRAMEWORKS.find(f => f.id === selectedFramework)?.name} export completed!`);
      onClose();
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Export failed. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  // Generate multi-page HTML
  const generateMultiPageHTML = (pages: Page[], projectName: string, settings?: any) => {
    const files: Record<string, string> = {};

    // Generate navigation HTML
    const navHTML = `
      <nav style="background: #1f2937; padding: 1rem; position: sticky; top: 0; z-index: 1000;">
        <div style="max-width: 1200px; margin: 0 auto; display: flex; gap: 1.5rem; align-items: center;">
          <span style="color: white; font-weight: bold; font-size: 1.25rem;">${settings?.title || projectName}</span>
          <div style="display: flex; gap: 1rem; margin-left: auto;">
            ${pages.map(page => `
              <a href="${page.slug === 'home' ? 'index.html' : `${page.slug}.html`}" 
                 style="color: white; text-decoration: none; padding: 0.5rem 1rem; border-radius: 0.375rem; transition: background 0.2s;"
                 onmouseover="this.style.background='rgba(255,255,255,0.1)'"
                 onmouseout="this.style.background='transparent'">
                ${page.name}
              </a>
            `).join('')}
          </div>
        </div>
      </nav>
    `;

    // Generate each page
    pages.forEach(page => {
      const fileName = page.slug === 'home' ? 'index.html' : `${page.slug}.html`;
      const componentsHTML = page.components.map(c => c.component.html).join('\n');

      files[fileName] = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${page.name} - ${projectName}</title>
  <meta name="description" content="${settings?.description || `${page.name} page`}">
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: system-ui, -apple-system, sans-serif; }
  </style>
</head>
<body>
  ${navHTML}
  <main>
    ${componentsHTML}
  </main>
  <footer style="background: #1f2937; color: white; padding: 2rem; text-align: center; margin-top: 4rem;">
    <p>&copy; ${new Date().getFullYear()} ${projectName}. All rights reserved.</p>
    <p style="margin-top: 0.5rem; opacity: 0.7;">Built with Multi-Page Builder</p>
  </footer>
</body>
</html>`;
    });

    // Add README
    files['README.md'] = `# ${projectName}

Multi-page website exported from Multi-Page Builder.

## Pages
${pages.map(page => `- ${page.name} (${page.slug === 'home' ? 'index.html' : `${page.slug}.html`}) - ${page.components.length} components`).join('\n')}

## Usage
1. Open index.html in your browser
2. Upload all HTML files to your web server
3. Enjoy your multi-page website!

## Stats
- Total Pages: ${pages.length}
- Total Components: ${totalComponents}
- Categories: ${allCategories.size}
`;

    return files;
  };

  // Generate multi-page React
  const generateMultiPageReact = (pages: Page[], projectName: string) => {
    const files: Record<string, string> = {};

    // Generate page components
    pages.forEach(page => {
      const componentName = page.name.replace(/\s+/g, '');
      files[`src/pages/${componentName}.jsx`] = `import React from 'react';

export default function ${componentName}() {
  return (
    <div>
      ${page.components.map((c, idx) => `
      {/* Component ${idx + 1}: ${c.component.name} */}
      <div dangerouslySetInnerHTML={{ __html: \`${c.component.html.replace(/`/g, '\\`')}\` }} />
      `).join('\n')}
    </div>
  );
}`;
    });

    // App.jsx with routing
    files['src/App.jsx'] = `import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
${pages.map(page => `import ${page.name.replace(/\s+/g, '')} from './pages/${page.name.replace(/\s+/g, '')}';`).join('\n')}

function App() {
  return (
    <BrowserRouter>
      <nav style={{ background: '#1f2937', padding: '1rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', gap: '1.5rem' }}>
          ${pages.map(page => `
          <Link to="${page.slug === 'home' ? '/' : `/${page.slug}`}" 
                style={{ color: 'white', textDecoration: 'none' }}>
            ${page.name}
          </Link>
          `).join('\n')}
        </div>
      </nav>
      <Routes>
        ${pages.map(page => `
        <Route path="${page.slug === 'home' ? '/' : `/${page.slug}`}" element={<${page.name.replace(/\s+/g, '')} />} />
        `).join('\n')}
      </Routes>
    </BrowserRouter>
  );
}

export default App;`;

    // package.json
    files['package.json'] = JSON.stringify({
      name: projectName.toLowerCase().replace(/\s+/g, '-'),
      version: '1.0.0',
      dependencies: {
        react: '^18.2.0',
        'react-dom': '^18.2.0',
        'react-router-dom': '^6.20.0'
      },
      scripts: {
        dev: 'vite',
        build: 'vite build',
        preview: 'vite preview'
      }
    }, null, 2);

    // README
    files['README.md'] = `# ${projectName}

React multi-page application with ${pages.length} pages.

## Installation
\`\`\`bash
npm install
npm run dev
\`\`\`

## Pages
${pages.map(page => `- ${page.name} (/${page.slug === 'home' ? '' : page.slug})`).join('\n')}
`;

    return files;
  };

  // Generate multi-page Next.js
  const generateMultiPageNextJS = (pages: Page[], projectName: string) => {
    const files: Record<string, string> = {};

    // Generate page files
    pages.forEach(page => {
      const fileName = page.slug === 'home' ? 'index.js' : `${page.slug}.js`;
      files[`pages/${fileName}`] = `import React from 'react';
import Layout from '../components/Layout';

export default function ${page.name.replace(/\s+/g, '')}() {
  return (
    <Layout title="${page.name}">
      ${page.components.map((c, idx) => `
      <div key={${idx}} dangerouslySetInnerHTML={{ __html: \`${c.component.html.replace(/`/g, '\\`')}\` }} />
      `).join('\n')}
    </Layout>
  );
}`;
    });

    // Layout component
    files['components/Layout.js'] = `import React from 'react';
import Link from 'next/link';

export default function Layout({ children, title }) {
  return (
    <>
      <nav style={{ background: '#1f2937', padding: '1rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', gap: '1.5rem' }}>
          ${pages.map(page => `
          <Link href="${page.slug === 'home' ? '/' : `/${page.slug}`}" 
                style={{ color: 'white', textDecoration: 'none' }}>
            ${page.name}
          </Link>
          `).join('\n')}
        </div>
      </nav>
      <main>{children}</main>
    </>
  );
}`;

    // package.json
    files['package.json'] = JSON.stringify({
      name: projectName.toLowerCase().replace(/\s+/g, '-'),
      version: '1.0.0',
      dependencies: {
        next: '^14.0.0',
        react: '^18.2.0',
        'react-dom': '^18.2.0'
      },
      scripts: {
        dev: 'next dev',
        build: 'next build',
        start: 'next start'
      }
    }, null, 2);

    return files;
  };

  // Generate multi-page Vue
  const generateMultiPageVue = (pages: Page[], projectName: string) => {
    const files: Record<string, string> = {};

    // Generate page components
    pages.forEach(page => {
      const componentName = page.name.replace(/\s+/g, '');
      files[`src/views/${componentName}.vue`] = `<template>
  <div>
    ${page.components.map(c => `
    <div v-html="'${c.component.html.replace(/'/g, "\\'")}'"></div>
    `).join('\n')}
  </div>
</template>

<script>
export default {
  name: '${componentName}'
}
</script>`;
    });

    // Router
    files['src/router/index.js'] = `import { createRouter, createWebHistory } from 'vue-router';
${pages.map(page => `import ${page.name.replace(/\s+/g, '')} from '../views/${page.name.replace(/\s+/g, '')}.vue';`).join('\n')}

const routes = [
  ${pages.map(page => `
  { path: '${page.slug === 'home' ? '/' : `/${page.slug}`}', component: ${page.name.replace(/\s+/g, '')} },
  `).join('\n')}
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;`;

    return files;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">Export Multi-Page Project</h2>
            <p className="text-gray-600 mt-1">Export "{project.name}" with {projectPages.length} page{projectPages.length !== 1 ? 's' : ''}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {FRAMEWORKS.map((framework) => {
              const Icon = framework.icon;
              return (
                <button
                  key={framework.id}
                  onClick={() => !framework.disabled && setSelectedFramework(framework.id)}
                  disabled={framework.disabled}
                  className={`p-4 rounded-lg border-2 text-left transition-all ${
                    selectedFramework === framework.id
                      ? 'border-blue-500 bg-blue-50'
                      : framework.disabled
                      ? 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-50'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className={`p-2 rounded-lg ${framework.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-800 flex items-center">
                        {framework.name}
                        {framework.disabled && (
                          <span className="ml-2 text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">
                            Coming Soon
                          </span>
                        )}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">{framework.description}</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-800 mb-2">What you'll get:</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              {selectedFramework === 'html' && (
                <>
                  <li>• Separate HTML file for each page with navigation</li>
                  <li>• Ready to upload to any web server</li>
                  <li>• All pages linked together automatically</li>
                  <li>• README with deployment instructions</li>
                </>
              )}
              {selectedFramework === 'react' && (
                <>
                  <li>• React Router setup with all pages</li>
                  <li>• Individual page components</li>
                  <li>• Navigation component included</li>
                  <li>• Package.json with required dependencies</li>
                </>
              )}
              {selectedFramework === 'nextjs' && (
                <>
                  <li>• Next.js pages directory structure</li>
                  <li>• Automatic routing for all pages</li>
                  <li>• Layout component with navigation</li>
                  <li>• Ready for deployment to Vercel</li>
                </>
              )}
              {selectedFramework === 'vue' && (
                <>
                  <li>• Vue Router configuration</li>
                  <li>• Individual .vue components</li>
                  <li>• Navigation setup included</li>
                  <li>• Package.json with Vue dependencies</li>
                </>
              )}
            </ul>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-4 text-center">
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-2xl font-bold text-gray-800">{totalComponents}</div>
              <div className="text-sm text-gray-600">Components</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-2xl font-bold text-gray-800">{allCategories.size}</div>
              <div className="text-sm text-gray-600">Categories</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-2xl font-bold text-gray-800">{projectPages.length}</div>
              <div className="text-sm text-gray-600">Page{projectPages.length !== 1 ? 's' : ''}</div>
            </div>
          </div>

          {/* Page List */}
          <div className="mt-4 bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-800 mb-3 flex items-center gap-2">
              <Files className="w-4 h-4" />
              Pages to Export:
            </h4>
            <div className="space-y-2">
              {projectPages.map(page => (
                <div key={page.id} className="flex items-center justify-between text-sm">
                  <span className="font-medium text-gray-700">{page.name}</span>
                  <span className="text-gray-500">{page.components.length} component{page.components.length !== 1 ? 's' : ''}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between p-6 bg-gray-50 rounded-b-lg">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-2 rounded-lg transition-colors"
          >
            <Download className="w-4 h-4" />
            {isExporting ? 'Exporting...' : `Export ${projectPages.length} Page${projectPages.length !== 1 ? 's' : ''}`}
          </button>
        </div>
      </div>
    </div>
  );
};