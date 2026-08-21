import React from 'react';

// Card Skeleton for Grid View
export const ResourceCardSkeleton = () => {
  return (
    <div className="bg-zinc-900/90 rounded-2xl overflow-hidden border border-zinc-800/80 p-4 space-y-3.5 animate-pulse text-left shadow-sm">
      {/* Thumbnail Skeleton */}
      <div className="w-full h-44 rounded-xl bg-zinc-800/70 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-zinc-700/20 to-transparent -translate-x-full animate-[shimmer_1.5s_infinite]" />
      </div>

      {/* Meta Line Skeleton */}
      <div className="flex items-center justify-between gap-2">
        <div className="h-4 w-20 bg-zinc-800 rounded-md" />
        <div className="h-4 w-16 bg-zinc-800/60 rounded-md" />
      </div>

      {/* Title Skeleton */}
      <div className="space-y-1.5">
        <div className="h-4.5 bg-zinc-800 rounded-md w-4/5" />
        <div className="h-3.5 bg-zinc-800/60 rounded-md w-full" />
      </div>

      {/* Tags Skeleton */}
      <div className="flex items-center gap-1.5 pt-1">
        <div className="h-4 w-12 bg-zinc-800/50 rounded" />
        <div className="h-4 w-14 bg-zinc-800/50 rounded" />
        <div className="h-4 w-10 bg-zinc-800/50 rounded" />
      </div>

      {/* Footer / Actions Skeleton */}
      <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between">
        <div className="h-3.5 w-24 bg-zinc-800/50 rounded" />
        <div className="flex gap-1.5">
          <div className="w-7 h-7 bg-zinc-800 rounded-lg" />
          <div className="w-7 h-7 bg-zinc-800 rounded-lg" />
        </div>
      </div>
    </div>
  );
};

// Row Skeleton for List View
export const ResourceRowSkeleton = () => {
  return (
    <div className="bg-zinc-900/90 rounded-xl overflow-hidden p-3.5 border border-zinc-800/80 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 animate-pulse shadow-sm">
      <div className="w-full sm:w-40 h-24 rounded-lg bg-zinc-800/70 shrink-0" />
      <div className="flex-1 space-y-2 min-w-0">
        <div className="flex items-center gap-2">
          <div className="h-4 w-16 bg-zinc-800 rounded" />
          <div className="h-3.5 w-24 bg-zinc-800/60 rounded" />
        </div>
        <div className="h-4.5 bg-zinc-800 rounded w-3/5" />
        <div className="h-3.5 bg-zinc-800/60 rounded w-4/5" />
        <div className="flex gap-1.5 pt-1">
          <div className="h-3.5 w-12 bg-zinc-800/50 rounded" />
          <div className="h-3.5 w-14 bg-zinc-800/50 rounded" />
        </div>
      </div>
      <div className="flex sm:flex-col items-center gap-2 sm:border-l border-zinc-800 sm:pl-3.5">
        <div className="h-4 w-16 bg-zinc-800/50 rounded" />
        <div className="flex gap-1">
          <div className="w-7 h-7 bg-zinc-800 rounded-md" />
          <div className="w-7 h-7 bg-zinc-800 rounded-md" />
        </div>
      </div>
    </div>
  );
};

// Table Skeleton
export const ResourceTableSkeleton = () => {
  return (
    <div className="w-full overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900 animate-pulse shadow-sm">
      <div className="h-10 bg-zinc-950 border-b border-zinc-800" />
      <div className="divide-y divide-zinc-800/80">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="p-3.5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-[280px]">
              <div className="w-12 h-9 bg-zinc-800 rounded-md shrink-0" />
              <div className="space-y-1.5 flex-1">
                <div className="h-4 bg-zinc-800 rounded w-3/4" />
                <div className="h-3 bg-zinc-800/60 rounded w-1/2" />
              </div>
            </div>
            <div className="h-4 w-24 bg-zinc-800/60 rounded hidden sm:block" />
            <div className="h-4 w-16 bg-zinc-800/60 rounded hidden md:block" />
            <div className="h-4 w-28 bg-zinc-800/60 rounded hidden lg:block" />
            <div className="flex gap-1.5 ml-auto">
              <div className="w-7 h-7 bg-zinc-800 rounded-md" />
              <div className="w-7 h-7 bg-zinc-800 rounded-md" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
