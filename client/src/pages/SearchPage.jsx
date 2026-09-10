import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import API from '../services/api';
import { useIncognito } from '../context/IncognitoContext';
import { ResourceGrid } from '../components/resources/ResourceGrid';
import { Search, Filter, Sparkles, X } from 'lucide-react';

export const SearchPage = ({ categories = [], onReportResource, onAddToCollection }) => {
  const { isIncognito } = useIncognito();
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
        limit: 18,
        includeNsfw: isIncognito
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
  }, [queryParam, categoryParam, typeParam, isIncognito]);

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

      {/* Search Header Banner */}
      <div className="bg-[#0d081e] rounded-3xl p-6 sm:p-8 border border-purple-900/40 text-center space-y-4 shadow-xl relative overflow-hidden hud-bracket">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-600/15 border border-purple-500/30 text-purple-300 text-xs font-mono">
          <Sparkles className="w-3.5 h-3.5 text-purple-400" />
          <span>Global Search Engine</span>
        </div>

        <h1 className="font-display font-bold text-2xl sm:text-3xl text-white">
          Search Discovery Index
        </h1>

        <form onSubmit={handleSearchSubmit} className="max-w-2xl mx-auto relative shadow-md">
          <input
            type="text"
            placeholder="Search keywords, #tags, domains, or topics..."
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            className="w-full bg-[#07040f] text-sm sm:text-base text-purple-100 placeholder-purple-400/40 pl-11 pr-11 py-3.5 rounded-2xl border border-purple-900/40 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all shadow-inner font-mono"
          />
          <Search className="w-4 h-4 text-purple-400 absolute left-4 top-1/2 -translate-y-1/2" />
          {inputQuery && (
            <button
              type="button"
              onClick={() => { setInputQuery(''); setSearchParams(categoryParam ? { category: categoryParam } : {}); }}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-purple-400 hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </form>

        {/* Auto Suggestions */}
        {suggestions.length > 0 && (
          <div className="flex flex-wrap items-center justify-center gap-1.5 text-xs pt-1">
            <span className="text-purple-400/60 font-mono text-xs flex items-center gap-1">
              Suggested:
            </span>
            {suggestions.map((sug, idx) => (
              <button
                key={idx}
                onClick={() => handleSuggestionClick(sug)}
                className="px-2.5 py-0.5 rounded-lg bg-[#140d2e] hover:bg-purple-900/30 text-purple-300 hover:text-white border border-purple-900/40 text-xs font-mono transition-colors cursor-pointer"
              >
                {sug}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Category Pills Header Slider */}
      {(categories || []).length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin border-b border-purple-900/30">
          <button
            onClick={() => handleCategorySelect('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-semibold transition-all shrink-0 cursor-pointer ${
              !categoryParam || categoryParam === 'all'
                ? 'bg-purple-600 text-white shadow-sm font-semibold'
                : 'bg-[#0d081e] hover:bg-[#140d2e] text-purple-300 hover:text-white border border-purple-900/40'
            }`}
          >
            All Channels
          </button>
          {(categories || []).map((cat) => {
            const isSexCat = cat.slug === 'sex' || cat.name?.toLowerCase() === 'sex';
            const isSelected = categoryParam.toLowerCase() === cat.slug.toLowerCase();
            return (
              <button
                key={cat._id}
                onClick={() => handleCategorySelect(cat.slug)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-semibold transition-all shrink-0 cursor-pointer ${
                  isSelected
                    ? isSexCat
                      ? 'bg-purple-600 text-white shadow-sm font-semibold'
                      : 'bg-purple-600 text-white shadow-sm font-semibold'
                    : isSexCat
                      ? 'bg-purple-950/40 text-purple-300 hover:text-purple-100 border border-purple-800/60'
                      : 'bg-[#0d081e] hover:bg-[#140d2e] text-purple-300 hover:text-white border border-purple-900/40'
                }`}
              >
                {cat.name} {isSexCat ? '(18+)' : ''}
              </button>
            );
          })}
        </div>
      )}

      {/* Results Header Stats */}
      <div className="flex items-center justify-between text-xs font-mono text-purple-300/70 border-b border-purple-900/30 pb-3">
        <span>
          Found <strong className="text-purple-200 font-bold">{results.length}</strong> matching {results.length === 1 ? 'signal' : 'signals'}
          {queryParam && <span> for "<strong className="text-white">{queryParam}</strong>"</span>}
          {categoryParam && <span> in <strong className="text-purple-300">{categoryParam}</strong></span>}
        </span>
      </div>

      {/* Results Grid with Skeleton loading */}
      <ResourceGrid
        resources={results}
        loading={loading}
        onReport={onReportResource}
        onAddToCollection={onAddToCollection}
      />

    </div>
  );
};
