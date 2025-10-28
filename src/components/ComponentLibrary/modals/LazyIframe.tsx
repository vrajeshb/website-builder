import React, { memo } from 'react';

interface LazyIframeProps {
  srcDoc: string;
  className: string;
  title: string;
}

const LazyIframe: React.FC<LazyIframeProps> = memo(({ srcDoc, className, title }) => {
  return (
    <iframe
      srcDoc={srcDoc}
      className={className}
      title={title}
      loading="lazy"
      sandbox="allow-scripts allow-same-origin"
    />
  );
});

LazyIframe.displayName = 'LazyIframe';

export default LazyIframe;