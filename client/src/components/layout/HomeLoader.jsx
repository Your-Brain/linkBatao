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
        overflow-hidden bg-[#07040f]
        transition-all duration-400 ease-in-out
        ${exiting ? 'opacity-0 pointer-events-none' : 'opacity-100'}
      `}
    >
      {/* Ambient Lighting */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
        <div className="h-80 w-80 rounded-full bg-purple-600/15 blur-[100px]" />
      </div>

      {/* Content */}
      <div
        className={`
          relative z-10 flex flex-col items-center
          transition-all duration-300
          ${exiting ? 'scale-95 opacity-0' : 'scale-100 opacity-100'}
        `}
      >
        <div className="w-14 h-14 rounded-2xl bg-purple-600/20 border border-purple-500/40 flex items-center justify-center text-purple-300 mb-4 shadow-purple-glow animate-pulse">
          <Layers className="w-7 h-7 text-purple-400" />
        </div>

        <h1 className="text-lg font-bold tracking-tight text-white font-display">
          Aura<span className="text-purple-400">Link</span>
        </h1>

        <div className="mt-4 h-1.5 w-36 overflow-hidden bg-[#0d081e] rounded-full border border-purple-900/40">
          <div className="h-full bg-gradient-to-r from-purple-600 to-indigo-500 rounded-full animate-[progress_0.8s_ease-in-out_infinite]" />
        </div>

        <p className="mt-2.5 text-xs text-purple-300/60 font-mono">
          Initializing discovery engine...
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