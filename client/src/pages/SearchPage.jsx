import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import API from '../services/api';
import { ResourceGrid } from '../components/resources/ResourceGrid';
import { Search, Filter, Sparkles, X, Radio, Terminal, Compass } from 'lucide-react';

export const SearchPage = ({ categories = [], onReportResource, onAddToCollection }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryParam = searchParams.get('q') || '';
  const categoryParam = searchParams.get('category') || '';
  const typeParam = searchParams.get('resourceType') || '';

  const [inputQuery, setInputQuery] = useState(queryParam);
  const [results, setResults] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const executeSearch = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        limit: 16
      };
      if (queryParam) params.q = queryParam;
      if (categoryParam) params.category = categoryParam;
      if (typeParam) params.resourceType = typeParam;

      const res = await API.get('/search', { params });
      if (res.data.success) {
        setResults(res.data.data);
        setSuggestions(res.data.suggestions || []);
        setTotal(res.data.total || 0);
      }
    } catch (err) {
      console.error('[SearchPage] Search request error:', err);
    } finally {
      setLoading(false);
    }
  }, [queryParam, categoryParam, typeParam]);

  useEffect(() => {
    setInputQuery(queryParam);
    executeSearch();
  }, [queryParam, categoryParam, typeParam, executeSearch]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const newParams = {};
    if (inputQuery.trim()) newParams.q = inputQuery.trim();
    if (categoryParam) newParams.category = categoryParam;
    if (typeParam) newParams.resourceType = typeParam;
    setSearchParams(newParams);
  };

  const handleSuggestionClick = (sug) => {
    const cleaned = sug.startsWith('#') ? sug.substring(1) : sug;
    const newParams = { q: cleaned };
    if (categoryParam) newParams.category = categoryParam;
    if (typeParam) newParams.resourceType = typeParam;
    setSearchParams(newParams);
  };

  const handleCategorySelect = (slug) => {
    const newParams = {};
    if (queryParam) newParams.q = queryParam;
    if (typeParam) newParams.resourceType = typeParam;
    if (slug && slug !== 'all') newParams.category = slug;
    setSearchParams(newParams);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-left">
      
      {/* Sci-Fi Search Console Banner */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-cyan-500/25 text-center space-y-5 hud-bracket relative overflow-hidden">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/40 border border-cyan-500/30 text-cyan-300 text-xs font-mono shadow-glow">
          <Terminal className="w-3.5 h-3.5 text-cyan-400" />
          <span>QUERY CONSOLE // DEEP TELEMETRY INDEX</span>
        </div>

        <h1 className="font-display font-bold text-2xl sm:text-4xl text-white">
          Signal & Link <span className="text-gradient">Search Radar</span>
        </h1>

        <form onSubmit={handleSearchSubmit} className="max-w-2xl mx-auto relative">
          <input
            type="text"
            placeholder="Search keywords, #tags, domains (youtube.com), or topics..."
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            className="w-full bg-[#090e1d] text-sm sm:text-base text-slate-100 placeholder-slate-500 pl-12 pr-12 py-3.5 rounded-2xl border border-slate-700 focus:border-cyan-400 outline-none transition-all shadow-inner"
          />
          <Search className="w-5 h-5 text-cyan-400 absolute left-4 top-1/2 -translate-y-1/2" />
          {inputQuery && (
            <button
              type="button"
              onClick={() => { setInputQuery(''); setSearchParams(categoryParam ? { category: categoryParam } : {}); }}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </form>

        {/* Auto Suggestions */}
        {suggestions.length > 0 && (
          <div className="flex flex-wrap items-center justify-center gap-2 text-xs">
            <span className="text-slate-400 font-mono text-[11px] flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-cyan-400" /> Signals:
            </span>
            {suggestions.map((sug, idx) => (
              <button
                key={idx}
                onClick={() => handleSuggestionClick(sug)}
                className="px-2.5 py-1 rounded-lg bg-[#090e1d] hover:bg-cyan-500/20 text-cyan-300 border border-slate-800 hover:border-cyan-400 font-mono text-[11px] transition-colors cursor-pointer"
              >
                {sug}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Category Pills Header Slider */}
      {(categories || []).length > 0 && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none border-b border-slate-800/80">
          <button
            onClick={() => handleCategorySelect('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-semibold transition-all shrink-0 cursor-pointer ${
              !categoryParam || categoryParam === 'all'
                ? 'bg-gradient-to-r from-cyan-500 to-sky-500 text-slate-950 font-bold shadow-glow'
                : 'bg-[#090e1d] text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            #ALL CHANNELS
          </button>
          {(categories || []).map((cat) => (
            <button
              key={cat._id}
              onClick={() => handleCategorySelect(cat.slug)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-semibold transition-all shrink-0 cursor-pointer ${
                categoryParam.toLowerCase() === cat.slug.toLowerCase()
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/60 shadow-sm'
                  : 'bg-[#090e1d] text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              #{cat.name.toUpperCase()}
            </button>
          ))}
        </div>
      )}

      {/* Results Header Stats */}
      <div className="flex items-center justify-between text-xs text-slate-400 font-mono border-b border-slate-800/80 pb-4">
        <span>
          SIGNAL QUERY MATCHES: <strong className="text-cyan-300">{results.length}</strong> / {total} TOTAL
          {queryParam && <span> FOR "<strong className="text-white">{queryParam}</strong>"</span>}
          {categoryParam && <span> IN CHANNEL <strong className="text-sky-300">{categoryParam.toUpperCase()}</strong></span>}
        </span>
      </div>

      {/* Results Grid */}
      <ResourceGrid
        resources={results}
        loading={loading}
        onReport={onReportResource}
        onAddToCollection={onAddToCollection}
      />

    </div>
  );
};
