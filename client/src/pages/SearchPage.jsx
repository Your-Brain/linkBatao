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
      <div className="bg-zinc-900 rounded-3xl p-6 sm:p-8 border border-zinc-800 text-center space-y-4 shadow-sm relative overflow-hidden">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-600/15 border border-indigo-500/30 text-indigo-300 text-xs font-medium">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          <span>Global Search Engine</span>
        </div>

        <h1 className="font-bold text-2xl sm:text-3xl text-white">
          Search Discovery Index
        </h1>

        <form onSubmit={handleSearchSubmit} className="max-w-2xl mx-auto relative shadow-md">
          <input
            type="text"
            placeholder="Search keywords, #tags, domains, or topics..."
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            className="w-full bg-zinc-950 text-sm sm:text-base text-zinc-100 placeholder-zinc-500 pl-11 pr-11 py-3.5 rounded-2xl border border-zinc-800 focus:border-indigo-500 outline-none transition-all shadow-inner"
          />
          <Search className="w-4 h-4 text-zinc-400 absolute left-4 top-1/2 -translate-y-1/2" />
          {inputQuery && (
            <button
              type="button"
              onClick={() => { setInputQuery(''); setSearchParams(categoryParam ? { category: categoryParam } : {}); }}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </form>

        {/* Auto Suggestions */}
        {suggestions.length > 0 && (
          <div className="flex flex-wrap items-center justify-center gap-1.5 text-xs pt-1">
            <span className="text-zinc-500 text-xs flex items-center gap-1">
              Suggested:
            </span>
            {suggestions.map((sug, idx) => (
              <button
                key={idx}
                onClick={() => handleSuggestionClick(sug)}
                className="px-2.5 py-0.5 rounded-lg bg-zinc-950 hover:bg-zinc-800 text-zinc-300 hover:text-indigo-300 border border-zinc-800 text-xs transition-colors cursor-pointer"
              >
                {sug}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Category Pills Header Slider */}
      {(categories || []).length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-zinc-800/80">
          <button
            onClick={() => handleCategorySelect('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all shrink-0 cursor-pointer ${
              !categoryParam || categoryParam === 'all'
                ? 'bg-indigo-600 text-white shadow-sm font-semibold'
                : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
            }`}
          >
            All Categories
          </button>
          {(categories || []).map((cat) => {
            const isSexCat = cat.slug === 'sex' || cat.name?.toLowerCase() === 'sex';
            const isSelected = categoryParam.toLowerCase() === cat.slug.toLowerCase();
            return (
              <button
                key={cat._id}
                onClick={() => handleCategorySelect(cat.slug)}
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
      )}

      {/* Results Header Stats */}
      <div className="flex items-center justify-between text-xs text-zinc-400 border-b border-zinc-800/80 pb-3">
        <span>
          Found <strong className="text-zinc-200">{results.length}</strong> matching {results.length === 1 ? 'result' : 'results'}
          {queryParam && <span> for "<strong className="text-zinc-100">{queryParam}</strong>"</span>}
          {categoryParam && <span> in <strong className="text-indigo-300">{categoryParam}</strong></span>}
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

