import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ResourceCard } from './ResourceCard';
import { ResourceRow } from './ResourceRow';
import { ResourceTable } from './ResourceTable';
import { LayoutGrid, List, Table2, SearchX } from 'lucide-react';

export const ResourceGrid = ({ resources, loading, onReport, onAddToCollection, onResourceDeleted, hideLayoutToggle = false }) => {
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
            <div className="h-8 w-36 bg-[#090e1d] rounded-xl animate-pulse border border-slate-800" />
          </div>
        )}
        {viewMode === 'table' ? (
          <div className="glass-card rounded-2xl p-6 space-y-4 animate-pulse border border-slate-800">
            <div className="h-10 bg-[#0e162c] rounded-xl" />
            <div className="h-12 bg-[#090e1d] rounded-xl" />
            <div className="h-12 bg-[#090e1d] rounded-xl" />
            <div className="h-12 bg-[#090e1d] rounded-xl" />
          </div>
        ) : (
          <div className={viewMode === 'grid' ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5" : "flex flex-col gap-3"}>
            {Array.from({ length: 8 }).map((_, idx) => (
              <div key={idx} className={`glass-card rounded-2xl animate-pulse p-4 border border-slate-800 ${viewMode === 'grid' ? 'h-80 space-y-4' : 'h-32 flex gap-4'}`}>
                <div className={viewMode === 'grid' ? "w-full h-40 bg-[#0e162c] rounded-xl" : "w-44 h-full bg-[#0e162c] rounded-xl shrink-0"} />
                <div className="flex-1 space-y-2 pt-1">
                  <div className="h-4 bg-[#0e162c] rounded w-3/4" />
                  <div className="h-3 bg-[#090e1d] rounded w-1/2" />
                  <div className="h-3 bg-[#090e1d] rounded w-full" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (!resources || resources.length === 0) {
    return (
      <div className="glass-panel rounded-3xl p-12 text-center max-w-md mx-auto my-12 border border-slate-800 space-y-4 hud-bracket">
        <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 text-cyan-400 mx-auto flex items-center justify-center border border-cyan-500/20 shadow-glow">
          <SearchX className="w-7 h-7" />
        </div>
        <h3 className="font-display text-lg font-bold text-white">No Transmissions Found</h3>
        <p className="text-xs text-slate-400 leading-relaxed">
          No resources detected matching your current filters. Adjust your search parameters or query keywords.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 text-left">

      {/* Top Layout View Mode Switcher */}
      {!hideLayoutToggle && (
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
          <span className="text-xs text-slate-400 font-mono">
            INDEXED NODES: <strong className="text-cyan-300">{resources.length}</strong> {resources.length === 1 ? 'ITEM' : 'ITEMS'}
          </span>

          <div className="flex items-center gap-1 bg-[#090e1d] p-1 rounded-xl border border-slate-800">
            {/* Grid Toggle */}
            <button
              onClick={() => handleLayoutChange('grid')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${viewMode === 'grid'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
                }`}
              title="Grid View (Cards)"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Grid</span>
            </button>

            {/* List Toggle */}
            <button
              onClick={() => handleLayoutChange('list')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${viewMode === 'list'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
                }`}
              title="List View (Rows)"
            >
              <List className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">List</span>
            </button>

            {/* Table Toggle */}
            <button
              onClick={() => handleLayoutChange('table')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${viewMode === 'table'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
                }`}
              title="Table View (Data Grid)"
            >
              <Table2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Table</span>
            </button>
          </div>
        </div>
      )}

      {/* Content Rendering: Grid vs List vs Table */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {resources.map((resource) => (
            <ResourceCard
              key={resource._id}
              resource={resource}
              onReport={onReport}
              onAddToCollection={onAddToCollection}
              onResourceDeleted={onResourceDeleted}
            />
          ))}
        </div>
      )}

      {viewMode === 'list' && (
        <div className="flex flex-col gap-3">
          {resources.map((resource) => (
            <ResourceRow
              key={resource._id}
              resource={resource}
              onReport={onReport}
              onAddToCollection={onAddToCollection}
              onResourceDeleted={onResourceDeleted}
            />
          ))}
        </div>
      )}

      {viewMode === 'table' && (
        <ResourceTable
          resources={resources}
          onReport={onReport}
          onAddToCollection={onAddToCollection}
          onResourceDeleted={onResourceDeleted}
        />
      )}

    </div>
  );
};
