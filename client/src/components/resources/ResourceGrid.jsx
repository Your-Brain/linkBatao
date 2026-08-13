import React from 'react';
import { ResourceCard } from './ResourceCard';
import { Compass, SearchX } from 'lucide-react';

export const ResourceGrid = ({ resources, loading, onReport, onAddToCollection }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, idx) => (
          <div key={idx} className="glass-card rounded-2xl h-80 animate-pulse p-4 space-y-4">
            <div className="w-full h-40 bg-slate-800/60 rounded-xl" />
            <div className="h-4 bg-slate-800/80 rounded w-3/4" />
            <div className="h-3 bg-slate-800/50 rounded w-1/2" />
            <div className="h-3 bg-slate-800/40 rounded w-full" />
          </div>
        ))}
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
  );
};

