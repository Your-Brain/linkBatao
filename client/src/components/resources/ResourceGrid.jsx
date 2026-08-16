import React, { useState, useEffect } from 'react';
import { ResourceCard } from './ResourceCard';
import { ResourceRow } from './ResourceRow';
import { LayoutGrid, List, SearchX } from 'lucide-react';

export const ResourceGrid = ({ resources, loading, onReport, onAddToCollection, hideLayoutToggle = false }) => {
  const [viewMode, setViewMode] = useState(() => {
    return localStorage.getItem('aura_view_layout') || 'grid';
  });

  const handleLayoutChange = (mode) => {
    setViewMode(mode);
    localStorage.setItem('aura_view_layout', mode);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {!hideLayoutToggle && (
          <div className="flex justify-end border-b border-slate-800/80 pb-3">
            <div className="h-8 w-24 bg-slate-800/60 rounded-xl animate-pulse" />
          </div>
        )}
        <div className={viewMode === 'grid' ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" : "flex flex-col gap-4"}>
          {Array.from({ length: 8 }).map((_, idx) => (
            <div key={idx} className={`glass-card rounded-2xl animate-pulse p-4 ${viewMode === 'grid' ? 'h-80 space-y-4' : 'h-32 flex gap-4'}`}>
              <div className={viewMode === 'grid' ? "w-full h-40 bg-slate-800/60 rounded-xl" : "w-44 h-full bg-slate-800/60 rounded-xl shrink-0"} />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-slate-800/80 rounded w-3/4" />
                <div className="h-3 bg-slate-800/50 rounded w-1/2" />
                <div className="h-3 bg-slate-800/40 rounded w-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!resources || resources.length === 0) {
    return (
      <div className="glass-panel rounded-3xl p-12 text-center max-w-md mx-auto my-12 border border-slate-800 space-y-4">
        <div className="w-16 h-16 rounded-full bg-sky-500/10 text-sky-400 mx-auto flex items-center justify-center border border-sky-500/20 shadow-glow">
          <SearchX className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-white">No Resources Found</h3>
        <p className="text-sm text-slate-400 leading-relaxed">
          We couldn't find any media or links matching your current filters. Try searching for a different keyword or category.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      
      {/* Top Layout View Mode Switcher */}
      {!hideLayoutToggle && (
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
          <span className="text-xs text-slate-400 font-medium">
            Showing <strong className="text-slate-200">{resources.length}</strong> {resources.length === 1 ? 'item' : 'items'}
          </span>

          <div className="flex items-center gap-1 bg-dark-900/80 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => handleLayoutChange('grid')}
              className={`p-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Grid View (Cards)"
            >
              <LayoutGrid className="w-4 h-4" />
              <span className="hidden sm:inline">Grid</span>
            </button>

            <button
              onClick={() => handleLayoutChange('list')}
              className={`p-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'list'
                  ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="List View (Rows)"
            >
              <List className="w-4 h-4" />
              <span className="hidden sm:inline">List</span>
            </button>
          </div>
        </div>
      )}

      {/* Grid vs List View Content Container */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {resources.map((resource) => (
            <ResourceCard
              key={resource._id}
              resource={resource}
              onReport={onReport}
              onAddToCollection={onAddToCollection}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {resources.map((resource) => (
            <ResourceRow
              key={resource._id}
              resource={resource}
              onReport={onReport}
              onAddToCollection={onAddToCollection}
            />
          ))}
        </div>
      )}

    </div>
  );
};
