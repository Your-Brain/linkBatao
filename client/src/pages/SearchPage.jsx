import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import API from '../services/api';
import { ResourceGrid } from '../components/resources/ResourceGrid';
import { Search, Filter, Sparkles, X } from 'lucide-react';

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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Search Header Banner */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-sky-500/20 text-center space-y-6">
        <h1 className="font-display font-bold text-2xl sm:text-4xl text-white">
          Media & Link <span className="text-gradient">Search Engine</span>
        </h1>

        <form onSubmit={handleSearchSubmit} className="max-w-2xl mx-auto relative">
          <input
            type="text"
            placeholder="Search by keywords, tags (#react), domains (youtube.com), or title..."
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            className="w-full bg-dark-900 text-base text-slate-100 placeholder-slate-500 pl-12 pr-12 py-3.5 rounded-2xl border border-slate-700 focus:border-sky-400 focus:ring-2 focus:ring-sky-400/20 outline-none shadow-glow transition-all"
          />
          <Search className="w-5 h-5 text-sky-400 absolute left-4 top-1/2 -translate-y-1/2" />
          {inputQuery && (
            <button
              type="button"
              onClick={() => { setInputQuery(''); setSearchParams(categoryParam ? { category: categoryParam } : {}); }}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </form>

        {/* Auto Suggestions */}
        {suggestions.length > 0 && (
          <div className="flex flex-wrap items-center justify-center gap-2 text-xs">
            <span className="text-slate-400 font-medium flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" /> Suggestions:
            </span>
            {suggestions.map((sug, idx) => (
              <button
                key={idx}
                onClick={() => handleSuggestionClick(sug)}
                className="px-3 py-1 rounded-lg bg-dark-800 hover:bg-sky-500/20 text-sky-300 border border-slate-700 hover:border-sky-400 transition-colors cursor-pointer"
              >
                {sug}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Category Pills Header Slider */}
      {(categories || []).length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-slate-800/80">
          <button
            onClick={() => handleCategorySelect('all')}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer ${
              !categoryParam || categoryParam === 'all'
                ? 'bg-gradient-to-r from-sky-500 to-cyan-500 text-slate-950 shadow-glow'
                : 'bg-dark-800/80 text-slate-400 hover:text-slate-200 border border-slate-700/60'
            }`}
          >
            All Categories
          </button>
          {(categories || []).map((cat) => (
            <button
              key={cat._id}
              onClick={() => handleCategorySelect(cat.slug)}
              className={`px-4 py-2 rounded-full text-xs font-semibold transition-all shrink-0 cursor-pointer ${
                categoryParam.toLowerCase() === cat.slug.toLowerCase()
                  ? 'bg-sky-500/20 text-sky-300 border border-sky-400/60 shadow-glow'
                  : 'bg-dark-800/80 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      )}

      {/* Results Header Stats */}
      <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-800/80 pb-4">
        <span>
          Showing {results.length} of <strong className="text-white">{total}</strong> results
          {queryParam && <span> for "<strong className="text-sky-300">{queryParam}</strong>"</span>}
          {categoryParam && <span> in category <strong className="text-cyan-300">{categoryParam}</strong></span>}
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
