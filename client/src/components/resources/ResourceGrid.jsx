import React, { useState } from 'react';
import { ResourceCard } from './ResourceCard';
import { ResourceRow } from './ResourceRow';
import { ResourceTable } from './ResourceTable';
import { ResourceCardSkeleton, ResourceRowSkeleton, ResourceTableSkeleton } from '../common/Skeleton';
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
      <div className="space-y-4 text-left">
        {!hideLayoutToggle && (
          <div className="flex justify-end border-b border-purple-900/30 pb-3">
            <div className="h-8 w-32 bg-[#0d081e] rounded-lg animate-pulse border border-purple-900/40" />
          </div>
        )}
        {viewMode === 'table' ? (
          <ResourceTableSkeleton />
        ) : viewMode === 'list' ? (
          <div className="flex flex-col gap-3">
            {Array.from({ length: 6 }).map((_, idx) => (
              <ResourceRowSkeleton key={idx} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {Array.from({ length: 8 }).map((_, idx) => (
              <ResourceCardSkeleton key={idx} />
            ))}
          </div>
        )}
      </div>
    );
  }

  if (!resources || resources.length === 0) {
    return (
      <div className="bg-[#0d081e]/90 backdrop-blur-md rounded-2xl p-12 text-center max-w-md mx-auto my-12 border border-purple-900/40 space-y-4 shadow-xl">
        <div className="w-12 h-12 rounded-xl bg-purple-950/60 text-purple-400 mx-auto flex items-center justify-center border border-purple-800/40 shadow-purple-glow-sm">
          <SearchX className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-white font-display">No Links Found</h3>
        <p className="text-xs text-purple-200/60 leading-relaxed">
          No resources found matching your current filter. Try selecting a different category or search term.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 text-left">

      {/* Top Layout View Mode Switcher */}
      {!hideLayoutToggle && (
        <div className="flex items-center justify-between border-b border-purple-900/30 pb-3">
          <span className="text-xs text-purple-300/70">
            Showing <strong className="text-purple-200">{resources.length}</strong> {resources.length === 1 ? 'item' : 'items'}
          </span>

          <div className="flex items-center gap-1 bg-[#0d081e] p-1 rounded-xl border border-purple-900/40 shadow-inner">
            {/* Grid Toggle */}
            <button
              onClick={() => handleLayoutChange('grid')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-purple-600 text-white shadow-purple-glow-sm font-semibold'
                  : 'text-purple-300/70 hover:text-white hover:bg-purple-900/20'
              }`}
              title="Grid View (Cards)"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Grid</span>
            </button>

            {/* List Toggle */}
            <button
              onClick={() => handleLayoutChange('list')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'list'
                  ? 'bg-purple-600 text-white shadow-purple-glow-sm font-semibold'
                  : 'text-purple-300/70 hover:text-white hover:bg-purple-900/20'
              }`}
              title="List View (Rows)"
            >
              <List className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">List</span>
            </button>

            {/* Table Toggle */}
            <button
              onClick={() => handleLayoutChange('table')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-purple-600 text-white shadow-purple-glow-sm font-semibold'
                  : 'text-purple-300/70 hover:text-white hover:bg-purple-900/20'
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

