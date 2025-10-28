import { Project } from '../types';

class ExportService {
  private sanitizeHTML(html: string): string {
    return html
      .replace(/<!--[\s\S]*?-->/g, '')
      .replace(/<style[\s\S]*?<\/style>/gi, '')
      .trim();
  }

  private convertHTMLCommentsToJSX(html: string): string {
    return html.replace(/<!--\s*(.*?)\s*-->/g, '{/* $1 */}');
  }

  private convertSVGAttributesToJSX(html: string): string {
    const attributeMap: Record<string, string> = {
      'stroke-width': 'strokeWidth',
      'stroke-linecap': 'strokeLinecap',
      'stroke-linejoin': 'strokeLinejoin',
      'fill-opacity': 'fillOpacity',
      'stroke-opacity': 'strokeOpacity',
      'fill-rule': 'fillRule',
      'clip-rule': 'clipRule',
      'stroke-dasharray': 'strokeDasharray',
      'stroke-dashoffset': 'strokeDashoffset',
      'stroke-miterlimit': 'strokeMiterlimit',
      'font-family': 'fontFamily',
      'font-size': 'fontSize',
      'font-weight': 'fontWeight',
      'text-anchor': 'textAnchor',
      'dominant-baseline': 'dominantBaseline',
      'alignment-baseline': 'alignmentBaseline',
      'baseline-shift': 'baselineShift',
      'stop-color': 'stopColor',
      'stop-opacity': 'stopOpacity',
      'vector-effect': 'vectorEffect',
      'paint-order': 'paintOrder',
      'marker-start': 'markerStart',
      'marker-mid': 'markerMid',
      'marker-end': 'markerEnd',
    };

    let result = html;
    Object.entries(attributeMap).forEach(([htmlAttr, jsxAttr]) => {
      const regex = new RegExp(`\\s${htmlAttr}=`, 'gi');
      result = result.replace(regex, ` ${jsxAttr}=`);
    });

    return result;
  }

  private convertClassToClassName(html: string): string {
    return html.replace(/\sclass=/g, ' className=');
  }

  private convertForToHtmlFor(html: string): string {
    return html.replace(/\sfor=/g, ' htmlFor=');
  }

  private ensureSelfClosingTags(html: string): string {
    const selfClosingTags = ['input', 'img', 'br', 'hr', 'meta', 'link', 'area', 'base', 'col', 'embed', 'param', 'source', 'track', 'wbr'];

    selfClosingTags.forEach(tag => {
      const regex = new RegExp(`<${tag}([^>]*?)(?<!/)>`, 'gi');
      html = html.replace(regex, (match, attrs) => {
        if (attrs.trim().endsWith('/')) {
          return match;
        }
        return `<${tag}${attrs} />`;
      });

      const closeTagRegex = new RegExp(`<${tag}([^>]*?)></${tag}>`, 'gi');
      html = html.replace(closeTagRegex, `<${tag}$1 />`);
    });

    return html;
  }

  private fixTailwindLineClamp(html: string): string {
    const regex = /className="([^"]*)line-clamp-(\d+)([^"]*)"/g;
    return html.replace(regex, (match, before, number, after) => {
      const cleanBefore = before.trim();
      const cleanAfter = after.trim();
      const classes = [cleanBefore, `[display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:${number}] overflow-hidden`, cleanAfter]
        .filter(Boolean)
        .join(' ');
      return `className="${classes}"`;
    });
  }

  private escapeJSXInCode(html: string): string {
    const codeBlockRegex = /<pre([^>]*)>([\s\S]*?)<\/pre>/gi;

    return html.replace(codeBlockRegex, (match, attrs, content) => {
      let escapedContent = content
        .replace(/<span([^>]*)>([\s\S]*?)<\/span>/gi, (spanMatch, spanAttrs, spanContent) => {
          const cleanContent = spanContent
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
          return `<span${spanAttrs}>${cleanContent}</span>`;
        });

      escapedContent = escapedContent.replace(/\{/g, '&#123;').replace(/\}/g, '&#125;');

      return `<pre${attrs}>${escapedContent}</pre>`;
    });
  }

  private convertToJSX(html: string): string {
    let result = html;

    result = this.convertHTMLCommentsToJSX(result);
    result = this.convertClassToClassName(result);
    result = this.convertForToHtmlFor(result);
    result = this.convertSVGAttributesToJSX(result);
    result = this.ensureSelfClosingTags(result);
    result = this.fixTailwindLineClamp(result);
    result = this.escapeJSXInCode(result);

    return result;
  }

  private extractStyles(html: string): string {
    const styleRegex = /<style[^>]*>([\s\S]*?)<\/style>/gi;
    const matches = html.match(styleRegex);

    if (!matches) return '';

    return matches
      .map(match => {
        const content = match.replace(/<\/?style[^>]*>/gi, '');
        return content.trim();
      })
      .join('\n\n');
  }

  generateHTML(project: Project): string {
    const styles = project.components
      .map(pc => pc.component.css || '')
      .filter(Boolean)
      .join('\n\n');

    const componentsHTML = project.components
      .map(pc => pc.component.html)
      .join('\n\n');

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${project.name}</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
${styles}
  </style>
</head>
<body>
${componentsHTML}
</body>
</html>`;
  }

  generateReact(project: Project): Record<string, string> {
    const files: Record<string, string> = {};

    project.components.forEach((pc, index) => {
      const componentName = pc.component.name.replace(/[^a-zA-Z0-9]/g, '') || `Component${index}`;
      const jsxContent = this.convertToJSX(this.sanitizeHTML(pc.component.html));
      const styles = pc.component.css || '';

      files[`src/components/${componentName}.jsx`] = `import React from 'react';
${styles ? `import './${componentName}.css';` : ''}

const ${componentName} = () => {
  return (
    ${jsxContent.split('\n').map((line, i) => i === 0 ? line : `    ${line}`).join('\n')}
  );
};

export default ${componentName};`;

      if (styles) {
        files[`src/components/${componentName}.css`] = styles;
      }
    });

    const componentNames = project.components.map((pc, index) =>
      pc.component.name.replace(/[^a-zA-Z0-9]/g, '') || `Component${index}`
    );

    files['src/App.jsx'] = `import React from 'react';
${componentNames.map(name => `import ${name} from './components/${name}';`).join('\n')}

function App() {
  return (
    <div className="min-h-screen">
${componentNames.map(name => `      <${name} />`).join('\n')}
    </div>
  );
}

export default App;`;

    files['package.json'] = JSON.stringify({
      name: project.name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
      version: '0.1.0',
      private: true,
      dependencies: {
        'react': '^18.2.0',
        'react-dom': '^18.2.0'
      },
      devDependencies: {
        '@vitejs/plugin-react': '^4.0.0',
        'autoprefixer': '^10.4.14',
        'postcss': '^8.4.24',
        'tailwindcss': '^3.3.2',
        'vite': '^4.3.9'
      },
      scripts: {
        'dev': 'vite',
        'build': 'vite build',
        'preview': 'vite preview'
      }
    }, null, 2);

    files['tailwind.config.js'] = `/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}`;

    files['vite.config.js'] = `import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
})`;

    files['index.html'] = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${project.name}</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>`;

    files['src/main.jsx'] = `import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)`;

    files['src/index.css'] = `@tailwind base;
@tailwind components;
@tailwind utilities;`;

    return files;
  }

  generateNextJS(project: Project): Record<string, string> {
    const files: Record<string, string> = {};

    project.components.forEach((pc, index) => {
      const componentName = pc.component.name.replace(/[^a-zA-Z0-9]/g, '') || `Component${index}`;
      const jsxContent = this.convertToJSX(this.sanitizeHTML(pc.component.html));
      const styles = pc.component.css || '';

      files[`components/${componentName}.jsx`] = `'use client';

import React from 'react';
${styles ? `import styles from './${componentName}.module.css';` : ''}

const ${componentName} = () => {
  return (
    ${jsxContent.split('\n').map((line, i) => i === 0 ? line : `    ${line}`).join('\n')}
  );
};

export default ${componentName};`;

      if (styles) {
        files[`components/${componentName}.module.css`] = styles;
      }
    });

    const componentNames = project.components.map((pc, index) =>
      pc.component.name.replace(/[^a-zA-Z0-9]/g, '') || `Component${index}`
    );

    files['app/page.jsx'] = `'use client';

${componentNames.map(name => `import ${name} from '@/components/${name}';`).join('\n')}

export default function Home() {
  return (
    <main className="min-h-screen">
${componentNames.map(name => `      <${name} />`).join('\n')}
    </main>
  );
}`;

    files['app/layout.jsx'] = `import './globals.css';

export const metadata = {
  title: '${project.name}',
  description: 'Generated by Project Builder',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}`;

    files['app/globals.css'] = `@tailwind base;
@tailwind components;
@tailwind utilities;`;

    files['package.json'] = JSON.stringify({
      name: project.name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
      version: '0.1.0',
      private: true,
      scripts: {
        'dev': 'next dev',
        'build': 'next build',
        'start': 'next start',
        'lint': 'next lint'
      },
      dependencies: {
        'react': '^18.2.0',
        'react-dom': '^18.2.0',
        'next': '^14.0.0'
      },
      devDependencies: {
        'autoprefixer': '^10.4.14',
        'postcss': '^8.4.24',
        'tailwindcss': '^3.3.2'
      }
    }, null, 2);

    files['tailwind.config.js'] = `/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}`;

    files['postcss.config.js'] = `module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}`;

    files['next.config.js'] = `/** @type {import('next').NextConfig} */
const nextConfig = {}

module.exports = nextConfig`;

    files['.gitignore'] = `node_modules
.next
out
.env*.local`;

    return files;
  }

  generateVue(project: Project): Record<string, string> {
    const files: Record<string, string> = {};

    project.components.forEach((pc, index) => {
      const componentName = pc.component.name.replace(/[^a-zA-Z0-9]/g, '') || `Component${index}`;
      let vueTemplate = this.sanitizeHTML(pc.component.html);

      vueTemplate = this.convertHTMLCommentsToJSX(vueTemplate);
      vueTemplate = this.ensureSelfClosingTags(vueTemplate);
      vueTemplate = this.convertSVGAttributesToJSX(vueTemplate);

      const styles = pc.component.css || '';

      files[`src/components/${componentName}.vue`] = `<template>
${vueTemplate.split('\n').map(line => `  ${line}`).join('\n')}
</template>

<script>
export default {
  name: '${componentName}'
}
</script>

${styles ? `<style scoped>\n${styles}\n</style>` : ''}`;
    });

    const componentNames = project.components.map((pc, index) =>
      pc.component.name.replace(/[^a-zA-Z0-9]/g, '') || `Component${index}`
    );

    files['src/App.vue'] = `<template>
  <div id="app" class="min-h-screen">
${componentNames.map(name => `    <${name} />`).join('\n')}
  </div>
</template>

<script>
${componentNames.map(name => `import ${name} from './components/${name}.vue'`).join('\n')}

export default {
  name: 'App',
  components: {
${componentNames.map(name => `    ${name}`).join(',\n')}
  }
}
</script>`;

    files['package.json'] = JSON.stringify({
      name: project.name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
      version: '0.1.0',
      private: true,
      scripts: {
        'dev': 'vite',
        'build': 'vite build',
        'preview': 'vite preview'
      },
      dependencies: {
        'vue': '^3.3.4'
      },
      devDependencies: {
        '@vitejs/plugin-vue': '^4.2.3',
        'autoprefixer': '^10.4.14',
        'postcss': '^8.4.24',
        'tailwindcss': '^3.3.2',
        'vite': '^4.3.9'
      }
    }, null, 2);

    files['vite.config.js'] = `import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
})`;

    files['index.html'] = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${project.name}</title>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/main.js"></script>
  </body>
</html>`;

    files['src/main.js'] = `import { createApp } from 'vue'
import App from './App.vue'
import './style.css'

createApp(App).mount('#app')`;

    files['src/style.css'] = `@tailwind base;
@tailwind components;
@tailwind utilities;`;

    files['tailwind.config.js'] = `/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}`;

    return files;
  }

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
    a.download = `${projectName.toLowerCase().replace(/[^a-z0-9]/g, '-')}.zip`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}

export const exportService = new ExportService();
