import React from 'react';

// Card Skeleton for Grid View
export const ResourceCardSkeleton = () => {
  return (
    <div className="bg-[#0d081e] rounded-3xl overflow-hidden border border-purple-900/40 p-4 space-y-3.5 animate-pulse text-left shadow-md hud-bracket">
      {/* Thumbnail Skeleton */}
      <div className="w-full h-44 rounded-2xl bg-[#140d2e] relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-500/10 to-transparent -translate-x-full animate-[shimmer_1.5s_infinite]" />
      </div>

      {/* Meta Line Skeleton */}
      <div className="flex items-center justify-between gap-2">
        <div className="h-4 w-20 bg-[#140d2e] rounded-lg" />
        <div className="h-4 w-16 bg-[#140d2e]/60 rounded-lg" />
      </div>

      {/* Title Skeleton */}
      <div className="space-y-1.5">
        <div className="h-4.5 bg-[#140d2e] rounded-lg w-4/5" />
        <div className="h-3.5 bg-[#140d2e]/60 rounded-lg w-full" />
      </div>

      {/* Tags Skeleton */}
      <div className="flex items-center gap-1.5 pt-1">
        <div className="h-4 w-12 bg-[#140d2e]/50 rounded-md" />
        <div className="h-4 w-14 bg-[#140d2e]/50 rounded-md" />
        <div className="h-4 w-10 bg-[#140d2e]/50 rounded-md" />
      </div>

      {/* Footer / Actions Skeleton */}
      <div className="pt-2 border-t border-purple-900/30 flex items-center justify-between">
        <div className="h-3.5 w-24 bg-[#140d2e]/50 rounded-md" />
        <div className="flex gap-1.5">
          <div className="w-7 h-7 bg-[#140d2e] rounded-xl" />
          <div className="w-7 h-7 bg-[#140d2e] rounded-xl" />
        </div>
      </div>
    </div>
  );
};

// Row Skeleton for List View
export const ResourceRowSkeleton = () => {
  return (
    <div className="bg-[#0d081e] rounded-2xl overflow-hidden p-3.5 border border-purple-900/40 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 animate-pulse shadow-md hud-bracket">
      <div className="w-full sm:w-40 h-24 rounded-xl bg-[#140d2e] shrink-0" />
      <div className="flex-1 space-y-2 min-w-0">
        <div className="flex items-center gap-2">
          <div className="h-4 w-16 bg-[#140d2e] rounded" />
          <div className="h-3.5 w-24 bg-[#140d2e]/60 rounded" />
        </div>
        <div className="h-4.5 bg-[#140d2e] rounded w-3/5" />
        <div className="h-3.5 bg-[#140d2e]/60 rounded w-4/5" />
        <div className="flex gap-1.5 pt-1">
          <div className="h-3.5 w-12 bg-[#140d2e]/50 rounded" />
          <div className="h-3.5 w-14 bg-[#140d2e]/50 rounded" />
        </div>
      </div>
      <div className="flex sm:flex-col items-center gap-2 sm:border-l border-purple-900/30 sm:pl-3.5">
        <div className="h-4 w-16 bg-[#140d2e]/50 rounded" />
        <div className="flex gap-1">
          <div className="w-7 h-7 bg-[#140d2e] rounded-xl" />
          <div className="w-7 h-7 bg-[#140d2e] rounded-xl" />
        </div>
      </div>
    </div>
  );
};

// Table Skeleton
export const ResourceTableSkeleton = () => {
  return (
    <div className="w-full overflow-hidden rounded-3xl border border-purple-900/40 bg-[#0d081e] animate-pulse shadow-xl hud-bracket">
      <div className="h-10 bg-[#07040f] border-b border-purple-900/30" />
      <div className="divide-y divide-purple-900/20">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="p-3.5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-[280px]">
              <div className="w-12 h-9 bg-[#140d2e] rounded-xl shrink-0" />
              <div className="space-y-1.5 flex-1">
                <div className="h-4 bg-[#140d2e] rounded w-3/4" />
                <div className="h-3 bg-[#140d2e]/60 rounded w-1/2" />
              </div>
            </div>
            <div className="h-4 w-24 bg-[#140d2e]/60 rounded hidden sm:block" />
            <div className="h-4 w-16 bg-[#140d2e]/60 rounded hidden md:block" />
            <div className="h-4 w-28 bg-[#140d2e]/60 rounded hidden lg:block" />
            <div className="flex gap-1.5 ml-auto">
              <div className="w-7 h-7 bg-[#140d2e] rounded-xl" />
              <div className="w-7 h-7 bg-[#140d2e] rounded-xl" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
