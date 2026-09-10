import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import API from '../services/api';
import { useIncognito } from '../context/IncognitoContext';
import { HeroSection } from '../components/layout/HeroSection';
import { ResourceGrid } from '../components/resources/ResourceGrid';
import { ResourceTable } from '../components/resources/ResourceTable';
import {
  Flame,
  Clock,
  Bookmark,
  Eye,
  Filter,
  Grid,
  List,
  Layers,
  Sparkles,
  TrendingUp,
  LayoutGrid
} from 'lucide-react';

export const HomePage = ({ categories = [], refreshKey = 0, onOpenSubmitModal, onReportResource, onAddToCollection }) => {
  const { isIncognito } = useIncognito();
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');
  const [activeSort, setActiveSort] = useState('trending');
  const [activeType, setActiveType] = useState('ALL');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'

  const fetchResources = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        sort: activeSort,
        limit: 18,
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
    <div className="space-y-10 pb-24 text-left">
      {/* Hero Section */}
      <HeroSection onOpenSubmitModal={onOpenSubmitModal} />

      {/* Main Content Explorer Container */}
      <section id="explore-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">

        {/* Category Filter Pills */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-purple-400" />
              <h2 className="font-display font-bold text-sm text-purple-100 uppercase tracking-wider">
                Explore Channels & Topics
              </h2>
            </div>
            <span className="text-xs font-mono text-purple-400/70">
              {(resources || []).length} active signals
            </span>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
            <button
              onClick={() => setActiveCategory('all')}
              className={`px-4 py-2 rounded-2xl text-xs font-mono font-semibold transition-all shrink-0 cursor-pointer ${
                activeCategory === 'all'
                  ? 'bg-purple-600 text-white shadow-[0_0_15px_rgba(147,51,234,0.4)] border border-purple-500'
                  : 'bg-[#0d081e] hover:bg-[#140d2e] text-purple-300 hover:text-white border border-purple-900/40 hover:border-purple-700/60'
              }`}
            >
              All Channels
            </button>

            {(categories || []).map((cat) => {
              const isSexCat = cat.slug === 'sex' || cat.name?.toLowerCase() === 'sex';
              const isSelected = activeCategory === cat.slug;
              return (
                <button
                  key={cat._id}
                  onClick={() => setActiveCategory(cat.slug)}
                  className={`px-4 py-2 rounded-2xl text-xs font-mono font-semibold transition-all shrink-0 cursor-pointer ${
                    isSelected
                      ? 'bg-purple-600 text-white shadow-[0_0_15px_rgba(147,51,234,0.4)] border border-purple-500'
                      : isSexCat
                        ? 'bg-purple-950/40 text-purple-300 hover:text-purple-100 border border-purple-800/60 hover:border-purple-600'
                        : 'bg-[#0d081e] hover:bg-[#140d2e] text-purple-300 hover:text-white border border-purple-900/40 hover:border-purple-700/60'
                  }`}
                >
                  {cat.name} {isSexCat ? '(18+)' : ''}
                </button>
              );
            })}
          </div>
        </div>

        {/* Toolbar: Sort Tabs, Media Type Filter & View Mode */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-[#0d081e]/90 border border-purple-900/40 p-3 sm:p-3.5 rounded-2xl shadow-sm backdrop-blur-md">

          {/* Sort Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            <button
              onClick={() => setActiveSort('trending')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-medium transition-all cursor-pointer shrink-0 ${
                activeSort === 'trending'
                  ? 'bg-purple-600/25 text-purple-200 border border-purple-500/50 shadow-sm'
                  : 'text-purple-400/70 hover:text-purple-200 hover:bg-[#140d2e]'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5 text-purple-400" />
              <span>Trending</span>
            </button>

            <button
              onClick={() => setActiveSort('newest')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-medium transition-all cursor-pointer shrink-0 ${
                activeSort === 'newest'
                  ? 'bg-purple-600/25 text-purple-200 border border-purple-500/50 shadow-sm'
                  : 'text-purple-400/70 hover:text-purple-200 hover:bg-[#140d2e]'
              }`}
            >
              <Clock className="w-3.5 h-3.5 text-indigo-400" />
              <span>Latest</span>
            </button>

            <button
              onClick={() => setActiveSort('saves')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-medium transition-all cursor-pointer shrink-0 ${
                activeSort === 'saves'
                  ? 'bg-purple-600/25 text-purple-200 border border-purple-500/50 shadow-sm'
                  : 'text-purple-400/70 hover:text-purple-200 hover:bg-[#140d2e]'
              }`}
            >
              <Bookmark className="w-3.5 h-3.5 text-purple-400" />
              <span>Most Saved</span>
            </button>

            <button
              onClick={() => setActiveSort('views')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-medium transition-all cursor-pointer shrink-0 ${
                activeSort === 'views'
                  ? 'bg-purple-600/25 text-purple-200 border border-purple-500/50 shadow-sm'
                  : 'text-purple-400/70 hover:text-purple-200 hover:bg-[#140d2e]'
              }`}
            >
              <Eye className="w-3.5 h-3.5 text-emerald-400" />
              <span>Most Viewed</span>
            </button>
          </div>

          {/* Media Type & View Switcher */}
          <div className="flex items-center gap-2.5 ml-auto sm:ml-0 shrink-0">
            {/* Media Type Dropdown */}
            <div className="flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-purple-400" />
              <select
                value={activeType}
                onChange={(e) => setActiveType(e.target.value)}
                className="bg-[#090515] text-xs font-mono text-purple-200 px-3 py-1.5 rounded-xl border border-purple-900/40 focus:border-purple-500 outline-none cursor-pointer"
              >
                <option value="ALL" className="bg-[#0d081e]">All Media Types</option>
                <option value="VIDEO" className="bg-[#0d081e]">Videos & Streams</option>
                <option value="WEBSITE" className="bg-[#0d081e]">Websites & Tools</option>
                <option value="ARTICLE" className="bg-[#0d081e]">Articles & Reading</option>
                <option value="IMAGE" className="bg-[#0d081e]">Images & Visuals</option>
                <option value="AUDIO" className="bg-[#0d081e]">Audio & Tracks</option>
              </select>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center bg-[#090515] rounded-xl p-0.5 border border-purple-900/40">
              <button
                onClick={() => setViewMode('grid')}
                title="Grid view"
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  viewMode === 'grid'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-purple-400/60 hover:text-purple-200'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                title="Table list view"
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  viewMode === 'table'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-purple-400/60 hover:text-purple-200'
                }`}
              >
                <List className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

        </div>

        {/* Resource Display (Grid or Table) */}
        {viewMode === 'grid' ? (
          <ResourceGrid
            resources={resources}
            loading={loading}
            onReport={onReportResource}
            onAddToCollection={onAddToCollection}
          />
        ) : (
          <ResourceTable
            resources={resources}
            loading={loading}
            onReport={onReportResource}
            onAddToCollection={onAddToCollection}
          />
        )}

      </section>
    </div>
  );
};
