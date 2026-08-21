import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import API from '../services/api';
import { useIncognito } from '../context/IncognitoContext';
import { HeroSection } from '../components/layout/HeroSection';
import { ResourceGrid } from '../components/resources/ResourceGrid';
import { Flame, Clock, Bookmark, Eye, Filter, Sparkles, Radio, Layers, RefreshCw, Ghost } from 'lucide-react';

export const HomePage = ({ categories = [], refreshKey = 0, onOpenSubmitModal, onReportResource, onAddToCollection }) => {
  const { isIncognito } = useIncognito();
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
        limit: 16,
        includeNsfw: isIncognito
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
  }, [activeCategory, activeSort, activeType, isIncognito]);

  useEffect(() => {
    fetchResources();
  }, [fetchResources, refreshKey]);

  return (
    <div className="space-y-10 pb-20">
      {/* Hero Section with Telemetry Widgets */}
      <HeroSection onOpenSubmitModal={onOpenSubmitModal} />

      {/* Main Content Explorer Container */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 text-left">

        {/* Category Matrix Horizontal Selector */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              <h2 className="font-display font-bold text-sm text-white uppercase tracking-wider">
                Discovery Channels
              </h2>
            </div>
            <span className="text-[10px] font-mono text-slate-500 uppercase">
              {categories.length + 1} CHANNELS ONLINE
            </span>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none border-b border-slate-800/80">
            <button
              onClick={() => setActiveCategory('all')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-semibold transition-all shrink-0 cursor-pointer ${activeCategory === 'all'
                  ? 'bg-gradient-to-r from-cyan-500 to-sky-500 text-slate-950 font-bold shadow-glow'
                  : 'bg-[#090e1d] text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
            >
              #ALL CHANNELS
            </button>

            {(categories || []).map((cat) => {
              const isSexCat = cat.slug === 'sex' || cat.name?.toLowerCase() === 'sex';
              return (
                <button
                  key={cat._id}
                  onClick={() => setActiveCategory(cat.slug)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-semibold transition-all shrink-0 cursor-pointer ${
                    activeCategory === cat.slug
                      ? isSexCat
                        ? 'bg-purple-500/30 text-purple-200 border border-purple-400 shadow-sm'
                        : 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/60 shadow-sm'
                      : isSexCat
                      ? 'bg-purple-950/20 text-purple-300/80 hover:text-purple-200 border border-purple-500/30'
                      : 'bg-[#090e1d] text-slate-400 hover:text-slate-200 border border-slate-800'
                  }`}
                >
                  #{cat.name.toUpperCase()}{isSexCat ? ' [18+]' : ''}
                </button>
              );
            })}
          </div>
        </div>

        {/* Filters & Sorting Space Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-3.5 rounded-2xl border border-slate-800/80 hud-bracket">

          {/* Sort Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto">
            <button
              onClick={() => setActiveSort('trending')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-medium transition-colors cursor-pointer ${activeSort === 'trending'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'text-slate-400 hover:text-slate-200'
                }`}
            >
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              <span>Trending Orbit</span>
            </button>

            <button
              onClick={() => setActiveSort('newest')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-medium transition-colors cursor-pointer ${activeSort === 'newest'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'text-slate-400 hover:text-slate-200'
                }`}
            >
              <Clock className="w-3.5 h-3.5 text-sky-400" />
              <span>Latest Transmissions</span>
            </button>

            <button
              onClick={() => setActiveSort('saves')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-medium transition-colors cursor-pointer ${activeSort === 'saves'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'text-slate-400 hover:text-slate-200'
                }`}
            >
              <Bookmark className="w-3.5 h-3.5 text-purple-400" />
              <span>Vaulted</span>
            </button>

            <button
              onClick={() => setActiveSort('views')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-medium transition-colors cursor-pointer ${activeSort === 'views'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'text-slate-400 hover:text-slate-200'
                }`}
            >
              <Eye className="w-3.5 h-3.5 text-cyan-400" />
              <span>High Signal</span>
            </button>
          </div>

          {/* Resource Type Dropdown Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-cyan-400" />
            <select
              value={activeType}
              onChange={(e) => setActiveType(e.target.value)}
              className="bg-[#090e1d] text-xs font-mono text-slate-300 px-3 py-1.5 rounded-xl border border-slate-700 focus:border-cyan-400 outline-none cursor-pointer"
            >
              <option value="ALL">ALL MEDIA CLASSES</option>
              <option value="VIDEO">VIDEOS & STREAMS</option>
              <option value="ARTICLE">ARTICLES & PAPERS</option>
              <option value="WEBSITE">WEBSITES & TOOLS</option>
              <option value="IMAGE">IMAGES & GRAPHICS</option>
              <option value="AUDIO">AUDIO & PODCASTS</option>
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
