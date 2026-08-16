import React, { useState, useEffect, useCallback } from 'react';
import API from '../services/api';
import { HeroSection } from '../components/layout/HeroSection';
import { ResourceGrid } from '../components/resources/ResourceGrid';
import { Flame, Clock, Bookmark, Eye, Filter, Sparkles, RefreshCw } from 'lucide-react';

export const HomePage = ({ categories = [], refreshKey = 0, onOpenSubmitModal, onReportResource, onAddToCollection }) => {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');
  const [activeSort, setActiveSort] = useState('trending');
  const [activeType, setActiveType] = useState('ALL');

  const fetchResources = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        sort: activeSort,
        limit: 16
      };
      if (activeCategory !== 'all') {
        params.category = activeCategory;
      }
      if (activeType !== 'ALL') {
        params.resourceType = activeType;
      }

      const res = await API.get('/resources', { params });
      if (res.data.success) {
        setResources(res.data.data);
      }
    } catch (err) {
      console.error('[HomePage] Failed to fetch resources:', err);
    } finally {
      setLoading(false);
    }
  }, [activeCategory, activeSort, activeType]);

  useEffect(() => {
    fetchResources();
  }, [fetchResources, refreshKey]);

  return (
    <div className="space-y-10 pb-16">
      {/* Hero Section */}
      <HeroSection onOpenSubmitModal={onOpenSubmitModal} />

      {/* Main Content Explorer Container */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">

        {/* Category Pills Header Slider */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-slate-800/80">
          <button
            onClick={() => setActiveCategory('all')}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer ${activeCategory === 'all'
                ? 'bg-gradient-to-r from-sky-500 to-cyan-500 text-slate-950 shadow-glow'
                : 'bg-dark-800/80 text-slate-400 hover:text-slate-200 border border-slate-700/60'
              }`}
          >
            All Categories
          </button>
          {(categories || []).map((cat) => (
            <button
              key={cat._id}
              onClick={() => setActiveCategory(cat.slug)}
              className={`px-4 py-2 rounded-full text-xs font-semibold transition-all shrink-0 cursor-pointer ${activeCategory === cat.slug
                  ? 'bg-sky-500/20 text-sky-300 border border-sky-400/60 shadow-glow'
                  : 'bg-dark-800/80 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Filters & Sorting Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-4 rounded-2xl border border-slate-800/80">

          {/* Sort Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto">
            <button
              onClick={() => setActiveSort('trending')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${activeSort === 'trending' ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30' : 'text-slate-400 hover:text-slate-200'
                }`}
            >
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              <span>Trending</span>
            </button>

            <button
              onClick={() => setActiveSort('newest')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${activeSort === 'newest' ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30' : 'text-slate-400 hover:text-slate-200'
                }`}
            >
              <Clock className="w-3.5 h-3.5 text-sky-400" />
              <span>Recently Added</span>
            </button>

            <button
              onClick={() => setActiveSort('saves')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${activeSort === 'saves' ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30' : 'text-slate-400 hover:text-slate-200'
                }`}
            >
              <Bookmark className="w-3.5 h-3.5 text-purple-400" />
              <span>Most Saved</span>
            </button>

            <button
              onClick={() => setActiveSort('views')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${activeSort === 'views' ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30' : 'text-slate-400 hover:text-slate-200'
                }`}
            >
              <Eye className="w-3.5 h-3.5 text-cyan-400" />
              <span>Most Viewed</span>
            </button>
          </div>

          {/* Resource Type Dropdown Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={activeType}
              onChange={(e) => setActiveType(e.target.value)}
              className="bg-dark-900 text-xs text-slate-300 px-3 py-1.5 rounded-xl border border-slate-700 focus:border-sky-400 outline-none"
            >
              <option value="ALL">All Content Types</option>
              <option value="VIDEO">Videos</option>
              <option value="ARTICLE">Articles</option>
              <option value="WEBSITE">Websites</option>
              <option value="IMAGE">Images</option>
              <option value="AUDIO">Audio</option>
            </select>
          </div>

        </div>

        {/* Resource Grid Section */}
        <ResourceGrid
          resources={resources}
          loading={loading}
          onReport={onReportResource}
          onAddToCollection={onAddToCollection}
        />

      </section>
    </div>
  );
};
