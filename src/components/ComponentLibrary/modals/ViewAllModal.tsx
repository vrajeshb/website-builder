import React, { useState, useMemo } from 'react';
import { X, Search, Filter, Grid3x3, List, BarChart3, Box, Upload, Sparkles, Layers, User, Users, Globe, TrendingUp, Star, Eye, Download, Heart, Crown, Shield, Play, Maximize2, CheckCircle } from 'lucide-react';

export type SortMode = 'name' | 'category' | 'created' | 'popular' | 'rating' | 'trending' | 'recent' | 'downloads' | 'likes';
export type ViewMode = 'grid' | 'list' | 'compact';

export interface Component {
  id: string;
  name: string;
  category: string;
  tags: string[];
  description?: string;
  created_at: string;
  usage_count?: number;
  rating?: number;
  created_by?: string;
  thumbnail?: string;
  preview_image?: string[] | string;
  downloads?: number;
  likes?: number;
  views?: number;
  trending_score?: number;
  creator_name?: string;
  creator_avatar?: string;
  is_verified?: boolean;
  is_premium?: boolean;
  html?: string;
}

export interface ViewAllModalProps {
  components: Component[];
  favoriteIds: Set<string>;
  currentUserId?: string | null;
  isPremiumUser?: boolean;
  onClose: () => void;
  onComponentSelect: (component: Component) => void;
  onPreview: (component: Component | null) => void;
  onFavorite: (id: string) => void;
  onUpload: () => void;
  onAIGenerate: () => void;
}

const ImagePreview: React.FC<{ images: string[] | string; thumbnail: string; name: string; html?: string; onExpand: () => void }> = ({ images, thumbnail, name, html, onExpand }) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [hover, setHover] = useState(false);
  const [imgError, setImgError] = useState(false);

  const displayImages = (Array.isArray(images) ? images : images ? [images] : []).filter(Boolean).length > 0 
    ? (Array.isArray(images) ? images : [images]) 
    : [thumbnail];

  const hasImg = displayImages[currentIdx] && !imgError;
  const showIframe = imgError || (!hasImg && html);

  React.useEffect(() => {
    if (!hover || displayImages.length <= 1) return;
    const timer = setInterval(() => setCurrentIdx(p => (p + 1) % displayImages.length), 2000);
    return () => clearInterval(timer);
  }, [hover, displayImages.length]);

  return (
    <div className="relative w-full aspect-video bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg overflow-hidden group cursor-pointer" onMouseEnter={() => setHover(true)} onMouseLeave={() => { setHover(false); setCurrentIdx(0); }} onClick={onExpand}>
      {showIframe && html ? (
        <iframe srcDoc={`<!DOCTYPE html><html><head><meta charset="UTF-8"><script src="https://cdn.tailwindcss.com"><\/script><style>html,body{width:1920px;height:1080px;margin:0;padding:0;overflow:hidden;background:#fff}body{transform:scale(0.1505);transform-origin:top left}</style></head><body>${html}<\/body><\/html>`} className="w-full h-full border-0" title={name} sandbox="allow-scripts" />
      ) : (
        <img src={displayImages[currentIdx]} alt={name} className="w-full h-full object-contain group-hover:scale-110 transition-all" onError={() => setImgError(true)} />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      {displayImages.length > 1 && !imgError && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 opacity-0 group-hover:opacity-100">
          {displayImages.map((_, i) => <div key={i} className={`w-1.5 h-1.5 rounded-full ${i === currentIdx ? 'bg-white w-4' : 'bg-white/50'}`} />)}
        </div>
      )}
      <button className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1.5 bg-black/60 rounded-lg hover:bg-black/80"><Maximize2 className="w-3.5 h-3.5 text-white" /></button>
      {hover && <button className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 p-1.5 bg-black/60 rounded-lg"><Play className="w-3.5 h-3.5 text-white" /></button>}
    </div>
  );
};

const Stats: React.FC<{ views?: number; downloads?: number; likes?: number; rating?: number; compact?: boolean }> = ({ views, downloads, likes, rating, compact }) => (
  <div className={`flex items-center gap-2 text-gray-400 ${compact ? 'text-xs gap-1' : 'text-xs'}`}>
    {rating && <span className="flex items-center gap-0.5"><Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />{rating.toFixed(1)}</span>}
    {downloads && <span className="flex items-center gap-0.5"><Download className="w-3 h-3" />{downloads > 1000 ? `${(downloads / 1000).toFixed(1)}k` : downloads}</span>}
    {!compact && likes && <span className="flex items-center gap-0.5"><Heart className="w-3 h-3" />{likes > 1000 ? `${(likes / 1000).toFixed(1)}k` : likes}</span>}
    {!compact && views && <span className="flex items-center gap-0.5"><Eye className="w-3 h-3" />{views > 1000 ? `${(views / 1000).toFixed(1)}k` : views}</span>}
  </div>
);

const CreatorBadge: React.FC<{ name?: string; avatar?: string; isVerified?: boolean; compact?: boolean }> = ({ name, avatar, isVerified, compact }) => {
  if (!name) return null;
  return (
    <div className={`flex items-center gap-1.5 ${compact ? 'text-xs' : 'text-sm'}`}>
      {avatar ? <img src={avatar} alt={name} className={`${compact ? 'w-5 h-5' : 'w-6 h-6'} rounded-full border border-gray-600`} /> : <div className={`${compact ? 'w-5 h-5' : 'w-6 h-6'} rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold`}>{name[0].toUpperCase()}</div>}
      <span className="text-gray-300 font-medium">{name}</span>
      {isVerified && <CheckCircle className={`${compact ? 'w-3 h-3' : 'w-4 h-4'} text-blue-400 fill-blue-400`} />}
    </div>
  );
};

const ComponentCard: React.FC<{ comp: Component; view: ViewMode; isFav: boolean; isPrem: boolean; onSel: () => void; onPrev: () => void; onFav: () => void }> = ({ comp, view, isFav, isPrem, onSel, onPrev, onFav }) => {
  const isLocked = comp.is_premium && !isPrem;
  const [hover, setHover] = useState(false);

  if (view === 'list') {
    return (
      <div className="bg-gray-800/50 border border-gray-700/50 hover:border-blue-500/30 rounded-lg p-4 flex gap-4 group hover:shadow-xl hover:shadow-blue-500/10 transition-all">
        <div className="w-40 flex-shrink-0 rounded-lg overflow-hidden bg-gray-900">
          <ImagePreview images={comp.preview_image || []} thumbnail={comp.thumbnail || ''} name={comp.name} html={comp.html} onExpand={onPrev} />
        </div>
        <div className="flex-1 flex flex-col min-w-0">
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-white font-bold text-lg truncate">{comp.name}</h3>
                {comp.is_premium && <Crown className="w-4 h-4 text-yellow-400 fill-yellow-400 flex-shrink-0" />}
              </div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs px-2.5 py-1 bg-blue-500/20 text-blue-300 rounded-full capitalize">{comp.category}</span>
              </div>
            </div>
            <button onClick={onFav} className={`p-2 rounded-lg transition-all ${isFav ? 'bg-red-500/20 text-red-400' : 'bg-gray-700/50 text-gray-400 hover:text-red-400'}`}>
              <Heart className={`w-5 h-5 ${isFav ? 'fill-red-400' : ''}`} />
            </button>
          </div>
          <p className="text-gray-400 text-sm mb-3 line-clamp-2">{comp.description || 'No description'}</p>
          <div className="mt-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CreatorBadge name={comp.creator_name} avatar={comp.creator_avatar} isVerified={comp.is_verified} />
              <Stats rating={comp.rating} downloads={comp.downloads} />
            </div>
            <div className="flex items-center gap-2">
              <button onClick={onPrev} className="px-3 py-1.5 bg-gray-700/50 text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-700">Preview</button>
              <button onClick={onSel} disabled={isLocked} className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${isLocked ? 'bg-gray-600/50 text-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}>
                {isLocked ? 'Premium' : 'Select'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (view === 'compact') {
    return (
      <div className="bg-gray-800/50 border border-gray-700/50 rounded-lg p-3 flex gap-3 group hover:shadow-lg transition-all">
        <div className="w-20 h-20 flex-shrink-0 rounded-lg bg-gray-900 overflow-hidden">
          <img src={comp.thumbnail} alt={comp.name} className="w-full h-full object-cover" />
        </div>
        <div className="flex-1 min-w-0 flex flex-col">
          <div className="flex items-start justify-between mb-1">
            <h3 className="text-white font-semibold text-sm truncate">{comp.name}</h3>
            <button onClick={onFav} className={`p-1 ${isFav ? 'text-red-400' : 'text-gray-400'}`}><Heart className={`w-4 h-4 ${isFav ? 'fill-red-400' : ''}`} /></button>
          </div>
          <span className="text-xs px-2 py-0.5 bg-blue-500/20 text-blue-300 rounded w-fit mb-1">{comp.category}</span>
          <Stats rating={comp.rating} downloads={comp.downloads} compact />
          <div className="mt-auto flex gap-2">
            <button onClick={onPrev} className="flex-1 text-xs px-2 py-1 bg-gray-700/50 text-gray-300 rounded hover:bg-gray-700">Preview</button>
            <button onClick={onSel} disabled={isLocked} className={`flex-1 text-xs px-2 py-1 rounded font-medium ${isLocked ? 'bg-gray-600/50 text-gray-400 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'}`}>{isLocked ? 'Pro' : 'Select'}</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl overflow-hidden group hover:shadow-lg transition-all cursor-pointer" onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
      <div className="relative">
        <ImagePreview images={comp.preview_image || []} thumbnail={comp.thumbnail || ''} name={comp.name} html={comp.html} onExpand={onPrev} />
        {comp.is_premium && <div className="absolute top-2 left-2 px-2 py-1 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg flex items-center gap-1 shadow-lg"><Crown className="w-3 h-3 text-white fill-white" /><span className="text-white text-xs font-bold">PRO</span></div>}
      </div>
      <div className="p-3">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-white font-bold text-sm truncate flex-1">{comp.name}</h3>
          <button onClick={onFav} className={`p-1 rounded-lg transition-all ${isFav ? 'bg-red-500/20 text-red-400' : 'bg-gray-700/50 text-gray-400'}`}><Heart className={`w-4 h-4 ${isFav ? 'fill-red-400' : ''}`} /></button>
        </div>
        <span className="text-xs px-2 py-1 bg-blue-500/20 text-blue-300 rounded-full capitalize">{comp.category}</span>
        {comp.description && <p className="text-gray-400 text-xs mt-2 line-clamp-2">{comp.description}</p>}
        <div className="mt-2 mb-2"><Stats rating={comp.rating} downloads={comp.downloads} views={comp.views} /></div>
        {comp.creator_name && <div className="mt-2 pt-2 border-t border-gray-700/50"><CreatorBadge name={comp.creator_name} avatar={comp.creator_avatar} isVerified={comp.is_verified} compact /></div>}
        <div className={`mt-3 flex gap-2 transition-opacity ${hover ? 'opacity-100' : 'opacity-0'}`}>
          <button onClick={onPrev} className="flex-1 text-xs px-3 py-2 bg-gray-700/50 text-gray-300 rounded-lg hover:bg-gray-700">Preview</button>
          <button onClick={onSel} disabled={isLocked} className={`flex-1 text-xs px-3 py-2 rounded-lg font-semibold transition-all ${isLocked ? 'bg-gray-600/50 text-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}>{isLocked ? 'Premium' : 'Select'}</button>
        </div>
      </div>
    </div>
  );
};

const ViewAllModal: React.FC<ViewAllModalProps> = ({ components, favoriteIds, currentUserId, isPremiumUser = false, onClose, onComponentSelect, onPreview, onFavorite, onUpload, onAIGenerate }) => {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [view, setView] = useState<ViewMode>('grid');
  const [sort, setSort] = useState<SortMode>('name');
  const [showFilters, setShowFilters] = useState(false);
  const [priceFilter, setPriceFilter] = useState<'all' | 'free' | 'premium'>('all');

  const allTags = useMemo(() => Array.from(new Set(components.flatMap(c => c.tags))).sort(), [components]);
  const categories = ['all', ...new Set(components.map(c => c.category))];

  const filtered = useMemo(() => {
    let result = [...components];
    
    if (category !== 'all') result = result.filter(c => c.category === category);
    if (priceFilter !== 'all') result = result.filter(c => priceFilter === 'premium' ? c.is_premium : !c.is_premium);
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(c => c.name.toLowerCase().includes(q) || c.tags.some(t => t.includes(q)) || c.description?.toLowerCase().includes(q));
    }

    result.sort((a, b) => {
      switch (sort) {
        case 'name': return a.name.localeCompare(b.name);
        case 'category': return a.category.localeCompare(b.category);
        case 'created': return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'popular': return (b.usage_count || 0) - (a.usage_count || 0);
        case 'rating': return (b.rating || 0) - (a.rating || 0);
        case 'trending': return (b.trending_score || 0) - (a.trending_score || 0);
        case 'downloads': return (b.downloads || 0) - (a.downloads || 0);
        case 'likes': return (b.likes || 0) - (a.likes || 0);
        default: return 0;
      }
    });

    return result;
  }, [components, category, search, sort, priceFilter]);

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl w-full max-w-[95vw] h-[95vh] flex flex-col border border-gray-700/50 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700/50 bg-gray-900/80 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <Layers className="w-7 h-7 text-blue-400" />
            <div>
              <h2 className="text-2xl font-bold text-white">Component Library</h2>
              <p className="text-gray-400 text-sm">{filtered.length} of {components.length} components</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex gap-1 bg-gray-800/80 rounded-xl p-1 border border-gray-600/50">
              <button onClick={() => setView('grid')} className={`p-2.5 rounded-lg transition-all ${view === 'grid' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}><Grid3x3 className="w-4 h-4" /></button>
              <button onClick={() => setView('list')} className={`p-2.5 rounded-lg transition-all ${view === 'list' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}><List className="w-4 h-4" /></button>
              <button onClick={() => setView('compact')} className={`p-2.5 rounded-lg transition-all ${view === 'compact' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}><Box className="w-4 h-4" /></button>
            </div>
            <button onClick={() => setShowFilters(!showFilters)} className={`p-2.5 rounded-xl transition-all ${showFilters ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}><Filter className="w-5 h-5" /></button>
            <button onClick={onUpload} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl font-medium flex items-center gap-2"><Upload className="w-4 h-4" />Upload</button>
            <button onClick={onAIGenerate} className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-xl font-medium flex items-center gap-2"><Sparkles className="w-4 h-4" />AI</button>
            <button onClick={onClose} className="text-gray-400 hover:text-white p-2 hover:bg-gray-700/50 rounded-xl"><X className="w-6 h-6" /></button>
          </div>
        </div>

        {/* Filters & Search */}
        <div className="p-4 border-b border-gray-700/50 bg-gray-800/30 space-y-3">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input type="text" placeholder="Search components..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full bg-gray-800/80 text-white pl-10 pr-4 py-2.5 rounded-lg border border-gray-600/50 focus:border-blue-500 outline-none" />
            </div>
            <select value={sort} onChange={(e) => setSort(e.target.value as SortMode)} className="bg-gray-800/80 text-white px-4 py-2.5 rounded-lg border border-gray-600/50 outline-none">
              <option value="name">Sort by Name</option>
              <option value="category">Sort by Category</option>
              <option value="created">Sort by Created</option>
              <option value="popular">Sort by Popular</option>
              <option value="rating">Sort by Rating</option>
              <option value="downloads">Sort by Downloads</option>
            </select>
          </div>

          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-3 bg-gray-800/40 rounded-lg border border-gray-700/40">
              <div>
                <label className="block text-sm font-bold text-gray-300 mb-2">Category</label>
                <div className="flex flex-wrap gap-2">
                  {categories.map(cat => (
                    <button key={cat} onClick={() => setCategory(cat)} className={`px-3 py-1.5 rounded-lg text-xs capitalize font-medium transition-all ${category === cat ? 'bg-blue-600 text-white' : 'bg-gray-700/50 text-gray-300 hover:bg-gray-700'}`}>{cat}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-300 mb-2">Price</label>
                <select value={priceFilter} onChange={(e) => setPriceFilter(e.target.value as any)} className="w-full bg-gray-700/50 text-white px-3 py-2 rounded-lg border border-gray-600/50 text-sm">
                  <option value="all">All</option>
                  <option value="free">Free</option>
                  <option value="premium">Premium</option>
                </select>
              </div>
              <div className="flex items-end">
                <button onClick={() => { setSearch(''); setCategory('all'); setPriceFilter('all'); }} className="w-full px-3 py-2 bg-gray-700/50 hover:bg-gray-700 text-gray-300 rounded-lg text-sm transition-all">Clear Filters</button>
              </div>
            </div>
          )}
        </div>

        {/* Components Grid */}
        <div className="flex-1 overflow-y-auto p-4 bg-gray-900/50">
          {filtered.length > 0 ? (
            <div className={view === 'grid' ? 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4' : view === 'list' ? 'space-y-4' : 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'}>
              {filtered.map((comp) => (
                <ComponentCard key={comp.id} comp={comp} view={view} isFav={favoriteIds.has(comp.id)} isPrem={isPremiumUser} onSel={() => { if (comp.is_premium && !isPremiumUser) return; onComponentSelect(comp); onClose(); }} onPrev={() => onPreview(comp)} onFav={() => onFavorite(comp.id)} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-2xl font-bold text-white mb-2">No components found</h3>
              <p className="text-gray-400 mb-6 text-center">Try adjusting your search or filters</p>
              <button onClick={onUpload} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2"><Upload className="w-5 h-5" />Upload Component</button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-700/50 bg-gray-900/80 flex items-center justify-between text-sm">
          <div className="flex items-center gap-4 text-gray-400">
            <span><span className="text-white font-bold">{filtered.length}</span> shown</span>
            <span><Heart className="w-4 h-4 text-red-400 fill-red-400 inline mr-1" /><span className="text-white font-bold">{favoriteIds.size}</span> favorites</span>
            <span><span className="text-white font-bold">{allTags.length}</span> tags</span>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white px-4 py-2 rounded-lg hover:bg-gray-700/50">Close</button>
        </div>
      </div>
    </div>
  );
};

export default ViewAllModal;