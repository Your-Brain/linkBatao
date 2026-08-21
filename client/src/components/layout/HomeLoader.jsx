import React, { useEffect, useState } from 'react';
import { Layers } from 'lucide-react';

export function HomeLoader() {
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setExiting(true);
    }, 750);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className={`
        fixed inset-0 z-[99999] flex items-center justify-center
        overflow-hidden bg-zinc-950
        transition-all duration-400 ease-in-out
        ${exiting ? 'opacity-0 pointer-events-none' : 'opacity-100'}
      `}
    >
      {/* Ambient Lighting */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
        <div className="h-72 w-72 rounded-full bg-indigo-600/10 blur-[90px]" />
      </div>

      {/* Content */}
      <div
        className={`
          relative z-10 flex flex-col items-center
          transition-all duration-300
          ${exiting ? 'scale-95 opacity-0' : 'scale-100 opacity-100'}
        `}
      >
        <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mb-4 shadow-[0_0_20px_rgba(99,102,241,0.25)] animate-pulse">
          <Layers className="w-6 h-6" />
        </div>

        <h1 className="text-base font-semibold tracking-tight text-white">
          AuraLink
        </h1>

        <div className="mt-4 h-1 w-32 overflow-hidden bg-zinc-900 rounded-full border border-zinc-800">
          <div className="h-full bg-indigo-600 rounded-full animate-[progress_0.8s_ease-in-out_infinite]" />
        </div>

        <p className="mt-2.5 text-xs text-zinc-500">
          Loading discovery engine...
        </p>
      </div>

      <style>
        {`
          @keyframes progress {
            0% { transform: translateX(-100%); width: 30%; }
            50% { width: 70%; }
            100% { transform: translateX(200%); width: 30%; }
          }
        `}
      </style>
    </div>
  );
}