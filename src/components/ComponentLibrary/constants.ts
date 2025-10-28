export const CATEGORIES = [
  'all', 'header', 'hero', 'features', 'pricing', 'testimonials', 
  'contact', 'footer', 'gallery', 'blog', 'custom', 'navigation',
  'forms', 'cards', 'buttons', 'layouts', 'ecommerce', 'dashboard','ecommerce'
];

export const ADVANCED_FILTERS = {
  premium: ['all', 'free', 'premium'],
  complexity: ['all', 'simple', 'medium', 'complex'],
  responsive: ['all', 'yes', 'no'],
  rating: ['all', '4+', '3+', '2+'],
  usage: ['all', 'popular', 'trending', 'new']
};

export const VIEW_MODES = {
  GRID: 'grid' as const,
  LIST: 'list' as const,
  CARD: 'card' as const,
  MASONRY: 'masonry' as const
};

export const SORT_MODES = {
  NAME: 'name' as const,
  CATEGORY: 'category' as const,
  CREATED: 'created' as const,
  POPULAR: 'popular' as const,
  RATING: 'rating' as const,
  USAGE: 'usage' as const
};

export const ITEMS_PER_PAGE = 24;
export const SEARCH_DEBOUNCE_DELAY = 300;