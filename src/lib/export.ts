import { Project } from '../types';

interface Page {
  id: string;
  name: string;
  slug: string;
  components: any[];
  isHome?: boolean;
}

class MultiPageExportService {
  // HTML/CSS sanitization
  private sanitizeHTML(html: string): string {
    return html.replace(/<!--[\s\S]*?-->/g, '').trim();
  }

  // JSX Conversion helpers
  private convertToJSX(html: string): string {
    return html
      .replace(/<!--\s*(.*?)\s*-->/g, '{/* $1 */}')
      .replace(/\sclass=/g, ' className=')
      .replace(/\sfor=/g, ' htmlFor=')
      .replace(/\s(stroke-width|fill-opacity|stroke-linecap)=/g, (m, attr) => 
        ` ${attr.replace(/-([a-z])/g, (_, c) => c.toUpperCase())}=`)
      .replace(/<(input|img|br|hr|meta|link)([^>]*?)(?<!\/)>/gi, '<$1$2 />');
  }

  // Generate Navigation Component
  private generateNav(pages: Page[], projectName: string): string {
    return `<nav class="bg-gray-800 sticky top-0 z-50 shadow-lg">
  <div class="max-w-7xl mx-auto px-4">
    <div class="flex items-center justify-between h-16">
      <span class="text-white font-bold text-xl">${projectName}</span>
      <div class="flex space-x-4">
        ${pages.map(p => `
        <a href="${p.slug === 'home' ? 'index.html' : `${p.slug}.html`}" 
           class="text-gray-300 hover:text-white px-3 py-2 rounded-md transition">
          ${p.name}
        </a>`).join('')}
      </div>
    </div>
  </div>
</nav>`;
  }

  // HTML Multi-Page Export
  generateMultiPageHTML(pages: Page[], projectName: string, settings?: any): Record<string, string> {
    const files: Record<string, string> = {};
    const nav = this.generateNav(pages, projectName);
    
    // Extract all unique styles
    const allStyles = [...new Set(
      pages.flatMap(p => p.components.map(c => c.component.css).filter(Boolean))
    )].join('\n\n');

    pages.forEach(page => {
      const fileName = page.slug === 'home' ? 'index.html' : `${page.slug}.html`;
      
      files[fileName] = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${page.name} - ${projectName}</title>
  <meta name="description" content="${settings?.description || page.name}">
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    ${allStyles}
  </style>
</head>
<body class="bg-gray-50">
  ${nav}
  <main class="min-h-screen">
    ${page.components.map(c => c.component.html).join('\n')}
  </main>
  <footer class="bg-gray-800 text-white py-8 mt-16">
    <div class="max-w-7xl mx-auto px-4 text-center">
      <p>&copy; ${new Date().getFullYear()} ${projectName}</p>
    </div>
  </footer>
</body>
</html>`;
    });

    files['README.md'] = this.generateReadme(pages, projectName, 'HTML');
    return files;
  }

  // React Multi-Page Export
  generateMultiPageReact(pages: Page[], projectName: string): Record<string, string> {
    const files: Record<string, string> = {};

    // Generate page components with proper JSX
    pages.forEach(page => {
      const pageName = page.name.replace(/\s+/g, '');
      const components = page.components.map((c, idx) => {
        const CompName = `${pageName}Component${idx}`;
        const jsx = this.convertToJSX(c.component.html);
        const css = c.component.css || '';

        // Create individual component
        files[`src/components/${CompName}.jsx`] = `import React from 'react';
${css ? `import './${CompName}.css';` : ''}

export default function ${CompName}() {
  return (
    ${jsx}
  );
}`;

        if (css) {
          files[`src/components/${CompName}.css`] = css;
        }

        return CompName;
      });

      // Create page component
      files[`src/pages/${pageName}.jsx`] = `import React from 'react';
${components.map(c => `import ${c} from '../components/${c}';`).join('\n')}

export default function ${pageName}() {
  return (
    <div className="min-h-screen">
      ${components.map(c => `<${c} />`).join('\n      ')}
    </div>
  );
}`;
    });

    // Navigation component
    files['src/components/Navigation.jsx'] = `import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function Navigation() {
  const location = useLocation();
  const pages = ${JSON.stringify(pages.map(p => ({ name: p.name, path: p.slug === 'home' ? '/' : `/${p.slug}` })))};

  return (
    <nav className="bg-gray-800 sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <span className="text-white font-bold text-xl">${projectName}</span>
          <div className="flex space-x-4">
            {pages.map(page => (
              <Link
                key={page.path}
                to={page.path}
                className={\`px-3 py-2 rounded-md transition \${
                  location.pathname === page.path
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-300 hover:text-white'
                }\`}
              >
                {page.name}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}`;

    // App with routing
    const pageImports = pages.map(p => {
      const name = p.name.replace(/\s+/g, '');
      return { name, path: p.slug === 'home' ? '/' : `/${p.slug}` };
    });

    files['src/App.jsx'] = `import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navigation from './components/Navigation';
${pageImports.map(p => `import ${p.name} from './pages/${p.name}';`).join('\n')}

function App() {
  return (
    <BrowserRouter>
      <Navigation />
      <Routes>
        ${pageImports.map(p => `<Route path="${p.path}" element={<${p.name} />} />`).join('\n        ')}
      </Routes>
    </BrowserRouter>
  );
}

export default App;`;

    // Configuration files
    files['package.json'] = JSON.stringify({
      name: projectName.toLowerCase().replace(/\s+/g, '-'),
      version: '1.0.0',
      dependencies: {
        react: '^18.2.0',
        'react-dom': '^18.2.0',
        'react-router-dom': '^6.20.0'
      },
      devDependencies: {
        '@vitejs/plugin-react': '^4.0.0',
        vite: '^5.0.0',
        tailwindcss: '^3.3.0',
        autoprefixer: '^10.4.0',
        postcss: '^8.4.0'
      },
      scripts: {
        dev: 'vite',
        build: 'vite build',
        preview: 'vite preview'
      }
    }, null, 2);

    files['vite.config.js'] = `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
});`;

    files['src/main.jsx'] = `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);`;

    files['src/index.css'] = `@tailwind base;
@tailwind components;
@tailwind utilities;`;

    files['index.html'] = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${projectName}</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>`;

    files['README.md'] = this.generateReadme(pages, projectName, 'React');
    return files;
  }

  // Next.js Multi-Page Export
  generateMultiPageNextJS(pages: Page[], projectName: string): Record<string, string> {
    const files: Record<string, string> = {};

    // Generate page components
    pages.forEach(page => {
      const pageName = page.name.replace(/\s+/g, '');
      const components = page.components.map((c, idx) => {
        const CompName = `${pageName}Component${idx}`;
        const jsx = this.convertToJSX(c.component.html);
        const css = c.component.css || '';

        files[`components/${CompName}.jsx`] = `'use client';
import React from 'react';
${css ? `import styles from './${CompName}.module.css';` : ''}

export default function ${CompName}() {
  return (
    ${jsx}
  );
}`;

        if (css) {
          files[`components/${CompName}.module.css`] = css;
        }

        return CompName;
      });

      const fileName = page.slug === 'home' ? 'app/page.jsx' : `app/${page.slug}/page.jsx`;
      files[fileName] = `'use client';
import React from 'react';
${components.map(c => `import ${c} from '@/components/${c}';`).join('\n')}

export default function ${pageName}Page() {
  return (
    <main className="min-h-screen">
      ${components.map(c => `<${c} />`).join('\n      ')}
    </main>
  );
}`;
    });

    // Layout with navigation
    files['app/layout.jsx'] = `import './globals.css';
import Navigation from '@/components/Navigation';

export const metadata = {
  title: '${projectName}',
  description: 'Multi-page application',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Navigation />
        {children}
      </body>
    </html>
  );
}`;

    files['components/Navigation.jsx'] = `'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navigation() {
  const pathname = usePathname();
  const pages = ${JSON.stringify(pages.map(p => ({ name: p.name, path: p.slug === 'home' ? '/' : `/${p.slug}` })))};

  return (
    <nav className="bg-gray-800 sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <span className="text-white font-bold text-xl">${projectName}</span>
          <div className="flex space-x-4">
            {pages.map(page => (
              <Link
                key={page.path}
                href={page.path}
                className={\`px-3 py-2 rounded-md transition \${
                  pathname === page.path
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-300 hover:text-white'
                }\`}
              >
                {page.name}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}`;

    files['app/globals.css'] = `@tailwind base;
@tailwind components;
@tailwind utilities;`;

    files['package.json'] = JSON.stringify({
      name: projectName.toLowerCase().replace(/\s+/g, '-'),
      version: '1.0.0',
      scripts: {
        dev: 'next dev',
        build: 'next build',
        start: 'next start'
      },
      dependencies: {
        next: '^14.0.0',
        react: '^18.2.0',
        'react-dom': '^18.2.0'
      },
      devDependencies: {
        tailwindcss: '^3.3.0',
        autoprefixer: '^10.4.0',
        postcss: '^8.4.0'
      }
    }, null, 2);

    files['next.config.js'] = `/** @type {import('next').NextConfig} */
const nextConfig = {};
module.exports = nextConfig;`;

    files['README.md'] = this.generateReadme(pages, projectName, 'Next.js');
    return files;
  }

  // Vue Multi-Page Export
  generateMultiPageVue(pages: Page[], projectName: string): Record<string, string> {
    const files: Record<string, string> = {};

    pages.forEach(page => {
      const pageName = page.name.replace(/\s+/g, '');
      const components = page.components.map((c, idx) => {
        const CompName = `${pageName}Component${idx}`;
        const html = this.sanitizeHTML(c.component.html);
        const css = c.component.css || '';

        files[`src/components/${CompName}.vue`] = `<template>
${html.split('\n').map(l => '  ' + l).join('\n')}
</template>

<script>
export default {
  name: '${CompName}'
};
</script>

${css ? `<style scoped>\n${css}\n</style>` : ''}`;

        return CompName;
      });

      files[`src/views/${pageName}.vue`] = `<template>
  <div class="min-h-screen">
    ${components.map(c => `<${c} />`).join('\n    ')}
  </div>
</template>

<script>
${components.map(c => `import ${c} from '@/components/${c}.vue';`).join('\n')}

export default {
  name: '${pageName}',
  components: { ${components.join(', ')} }
};
</script>`;
    });

    files['src/router/index.js'] = `import { createRouter, createWebHistory } from 'vue-router';
${pages.map(p => `import ${p.name.replace(/\s+/g, '')} from '@/views/${p.name.replace(/\s+/g, '')}.vue';`).join('\n')}

const routes = [
${pages.map(p => `  { path: '${p.slug === 'home' ? '/' : `/${p.slug}`}', component: ${p.name.replace(/\s+/g, '')} }`).join(',\n')}
];

export default createRouter({
  history: createWebHistory(),
  routes
});`;

    files['package.json'] = JSON.stringify({
      name: projectName.toLowerCase().replace(/\s+/g, '-'),
      version: '1.0.0',
      scripts: {
        dev: 'vite',
        build: 'vite build',
        preview: 'vite preview'
      },
      dependencies: {
        vue: '^3.3.0',
        'vue-router': '^4.2.0'
      },
      devDependencies: {
        '@vitejs/plugin-vue': '^4.0.0',
        vite: '^5.0.0',
        tailwindcss: '^3.3.0'
      }
    }, null, 2);

    files['README.md'] = this.generateReadme(pages, projectName, 'Vue');
    return files;
  }

  // Generate README
  private generateReadme(pages: Page[], projectName: string, framework: string): string {
    const totalComponents = pages.reduce((sum, p) => sum + p.components.length, 0);
    
    return `# ${projectName}

${framework} multi-page application with ${pages.length} page${pages.length !== 1 ? 's' : ''}.

## 📊 Project Stats
- **Pages**: ${pages.length}
- **Total Components**: ${totalComponents}
- **Framework**: ${framework}

## 📄 Pages
${pages.map(p => `- **${p.name}** (${p.slug === 'home' ? '/' : `/${p.slug}`}) - ${p.components.length} component${p.components.length !== 1 ? 's' : ''}`).join('\n')}

## 🚀 Getting Started

\`\`\`bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
\`\`\`

## 📦 What's Included
- Fully functional navigation between pages
- Responsive Tailwind CSS styling
- Individual components for each section
- Production-ready configuration

Built with ❤️ using Multi-Page Builder
`;
  }

  // Download as ZIP
  async downloadFiles(files: Record<string, string>, projectName: string): Promise<void> {
    const JSZip = (await import('jszip')).default;
    const zip = new JSZip();

    Object.entries(files).forEach(([path, content]) => {
      zip.file(path, content);
    });

    const blob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${projectName.toLowerCase().replace(/\s+/g, '-')}.zip`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}

export const multiPageExportService = new MultiPageExportService();