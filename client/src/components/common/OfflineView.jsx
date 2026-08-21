import React, { useState, useEffect } from 'react';
import { WifiOff, RefreshCw, AlertCircle, ArrowRight } from 'lucide-react';
import { ResourceCardSkeleton } from './Skeleton';

export const OfflineView = ({ onRetry, message = "You are currently browsing offline" }) => {
  const [retrying, setRetrying] = useState(false);

  const handleRetry = async () => {
    setRetrying(true);
    if (onRetry) {
      await onRetry();
    } else {
      window.location.reload();
    }
    setTimeout(() => setRetrying(false), 1200);
  };

  return (
    <div className="space-y-8 my-8 text-left">
      {/* Offline Notice Banner */}
      <div className="bg-zinc-900/90 rounded-2xl p-6 sm:p-8 border border-amber-500/30 shadow-2xl backdrop-blur-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-400 shrink-0">
              <WifiOff className="w-6 h-6 animate-pulse" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-base text-zinc-100">
                  Offline Mode Active
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 text-[10px] font-medium border border-amber-500/30">
                  Disconnected
                </span>
              </div>
              <p className="text-xs text-zinc-400 max-w-lg leading-relaxed">
                {message}. We've preserved your local layout and saved bookmarks so you can continue navigating smoothly.
              </p>
            </div>
          </div>

          <button
            onClick={handleRetry}
            disabled={retrying}
            className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-medium text-xs border border-zinc-700 transition-all flex items-center gap-2 cursor-pointer shrink-0 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${retrying ? 'animate-spin text-indigo-400' : ''}`} />
            <span>{retrying ? 'Checking Network...' : 'Retry Connection'}</span>
          </button>
        </div>
      </div>

      {/* Offline Skeleton Preview Placeholder */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 text-zinc-500" />
            <span>Cached Layout Preview</span>
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 opacity-60">
          <ResourceCardSkeleton />
          <ResourceCardSkeleton />
          <ResourceCardSkeleton />
          <ResourceCardSkeleton />
        </div>
      </div>
    </div>
  );
};
