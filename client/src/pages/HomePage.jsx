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
  Search,
  CheckCircle2,
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
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-400" />
              <h2 className="font-semibold text-sm text-zinc-100">
                Explore by Category
              </h2>
            </div>
            <span className="text-xs text-zinc-500 font-medium">
              {(resources || []).length} resources found
            </span>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            <button
              onClick={() => setActiveCategory('all')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all shrink-0 cursor-pointer ${
                activeCategory === 'all'
                  ? 'bg-indigo-600 text-white shadow-sm font-semibold'
                  : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
              }`}
            >
              All Categories
            </button>

            {(categories || []).map((cat) => {
              const isSexCat = cat.slug === 'sex' || cat.name?.toLowerCase() === 'sex';
              const isSelected = activeCategory === cat.slug;
              return (
                <button
                  key={cat._id}
                  onClick={() => setActiveCategory(cat.slug)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all shrink-0 cursor-pointer ${
                    isSelected
                      ? isSexCat
                        ? 'bg-purple-600 text-white shadow-sm font-semibold'
                        : 'bg-indigo-600 text-white shadow-sm font-semibold'
                      : isSexCat
                        ? 'bg-purple-950/40 text-purple-300 hover:text-purple-100 border border-purple-800/60'
                        : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
                  }`}
                >
                  {cat.name} {isSexCat ? '(18+)' : ''}
                </button>
              );
            })}
          </div>
        </div>

        {/* Toolbar: Sort Tabs, Media Type Filter & View Mode */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-zinc-900/90 border border-zinc-800/90 p-2.5 sm:p-3 rounded-2xl shadow-sm">

          {/* Sort Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            <button
              onClick={() => setActiveSort('trending')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer shrink-0 ${
                activeSort === 'trending'
                  ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/40'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5 text-indigo-400" />
              <span>Trending</span>
            </button>

            <button
              onClick={() => setActiveSort('newest')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer shrink-0 ${
                activeSort === 'newest'
                  ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/40'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
              }`}
            >
              <Clock className="w-3.5 h-3.5 text-sky-400" />
              <span>Latest</span>
            </button>

            <button
              onClick={() => setActiveSort('saves')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer shrink-0 ${
                activeSort === 'saves'
                  ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/40'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
              }`}
            >
              <Bookmark className="w-3.5 h-3.5 text-purple-400" />
              <span>Most Saved</span>
            </button>

            <button
              onClick={() => setActiveSort('views')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer shrink-0 ${
                activeSort === 'views'
                  ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/40'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
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
              <Filter className="w-3.5 h-3.5 text-zinc-400" />
              <select
                value={activeType}
                onChange={(e) => setActiveType(e.target.value)}
                className="bg-zinc-950 text-xs text-zinc-300 px-3 py-1.5 rounded-lg border border-zinc-800 focus:border-indigo-500 outline-none cursor-pointer"
              >
                <option value="ALL">All Media Types</option>
                <option value="VIDEO">Videos & Streams</option>
                <option value="WEBSITE">Websites & Tools</option>
                <option value="ARTICLE">Articles & Reading</option>
                <option value="IMAGE">Images & Visuals</option>
                <option value="AUDIO">Audio & Tracks</option>
              </select>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center bg-zinc-950 rounded-lg p-0.5 border border-zinc-800">
              <button
                onClick={() => setViewMode('grid')}
                title="Grid view"
                className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                  viewMode === 'grid'
                    ? 'bg-zinc-800 text-white shadow-sm'
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                title="Table list view"
                className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                  viewMode === 'table'
                    ? 'bg-zinc-800 text-white shadow-sm'
                    : 'text-zinc-500 hover:text-zinc-300'
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

