import React, { useState, useEffect, useRef } from 'react';
import type { Component } from '../types/component';

interface ComponentPreviewProps {
  component: Component;
  className?: string;
}

export function ComponentPreview({ component, className = '' }: ComponentPreviewProps) {
  const [previewError, setPreviewError] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (!iframeRef.current || !component.code) return;

    const iframeDoc = iframeRef.current.contentDocument;
    if (!iframeDoc) return;

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <script crossorigin src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
          <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
          <script src="https://cdn.tailwindcss.com"></script>
          <style>
            body { margin: 0; padding: 16px; background: transparent; }
            * { box-sizing: border-box; }
          </style>
        </head>
        <body>
          <div id="root"></div>
          <script type="module">
            try {
              ${component.code}
            } catch (error) {
              document.getElementById('root').innerHTML = '<div style="color: red; padding: 20px;">Error rendering component: ' + error.message + '</div>';
            }
          </script>
        </body>
      </html>
    `;

    iframeDoc.open();
    iframeDoc.write(html);
    iframeDoc.close();
  }, [component.code]);

  if (component.preview_url) {
    return (
      <img
        src={component.preview_url}
        alt={component.name}
        className={`w-full h-full object-cover ${className}`}
        onError={() => setPreviewError(true)}
      />
    );
  }

  if (previewError) {
    return (
      <div className={`w-full h-full flex items-center justify-center bg-gray-800/50 ${className}`}>
        <div className="text-center text-gray-400">
          <div className="text-4xl mb-2">🎨</div>
          <p className="text-sm">{component.name}</p>
        </div>
      </div>
    );
  }

  return (
    <iframe
      ref={iframeRef}
      className={`w-full h-full border-0 ${className}`}
      sandbox="allow-scripts"
      title={`Preview of ${component.name}`}
    />
  );
}
