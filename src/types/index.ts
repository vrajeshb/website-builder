export interface Component {
  id: string;
  name: string;
  category: 'header' | 'footer' | 'hero' | 'pricing' | 'features' | 'contact' | 'testimonials' | 'gallery' | 'blog' | 'custom' | 'ecommerce';
  html: string;
  css?: string;
  js?: string;
  preview_image?: string;
  tags: string[];
  is_premium?: boolean;
  created_at?: string;
}

export interface DroppedComponent {
  id: string;
  componentId: string;
  component: Component;
  position: number;
  customStyles?: Record<string, string>;
  elementTokens?: ElementToken[];
  isLocked?: boolean;
}

export interface ElementToken {
  element: string;
  selector: string;
  tagName: string;
  textPreview?: string;
  fontSizeKey: 'heading' | 'headingSmall' | 'titleLarge' | 'title' | 'subtitle' | 'body' | 'caption';
  fontWeightKey: 'light' | 'regular' | 'medium' | 'semibold' | 'bold';
  textColorKey: 'primary' | 'secondary' | 'accent' | 'muted' | 'inverse';
  backgroundColorKey?: string;
  paddingKey: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  borderRadiusKey?: 'none' | 'sm' | 'md' | 'lg' | 'full';
}

export interface Project {
  id: string;
  name: string;
  components: DroppedComponent[];
  settings: {
    title: string;
    description: string;
    favicon?: string;
    customCss?: string;
    customJs?: string;
  };
  created_at: string;
  updated_at: string;
}

export type DeviceType = 'desktop' | 'tablet' | 'mobile';

export type ExportFramework = 'html' | 'react' | 'nextjs' | 'vue' | 'angular' | 'svelte';