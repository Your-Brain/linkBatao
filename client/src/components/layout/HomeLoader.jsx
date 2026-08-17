import React, { useEffect, useState } from 'react';

export function HomeLoader() {
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    // Start exit animation shortly before App removes the loader
    const timer = setTimeout(() => {
      setExiting(true);
    }, 950);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className={`
        fixed inset-0 z-[99999] flex items-center justify-center
        overflow-hidden bg-[#050816]
        transition-all duration-500 ease-[cubic-bezier(0.77,0,0.18,1)]
        ${exiting ? '-translate-y-full' : 'translate-y-0'}
      `}
    >

      {/* --------------------------------
          Background
      -------------------------------- */}
      <div className="absolute inset-0 pointer-events-none">

        {/* Main glow */}
        <div className="absolute left-1/2 top-1/2 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-sky-500/[0.06] blur-[100px]" />

        {/* Secondary glow */}
        <div className="absolute left-[35%] top-[40%] h-40 w-40 rounded-full bg-cyan-400/[0.05] blur-[70px]" />

        {/* Grid */}
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(148,163,184,0.8) 1px, transparent 1px),
              linear-gradient(90deg, rgba(148,163,184,0.8) 1px, transparent 1px)
            `,
            backgroundSize: '48px 48px',
          }}
        />

        {/* Vignette */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(5,8,22,0.75)_75%,rgba(5,8,22,1)_100%)]" />
      </div>

      {/* --------------------------------
          Loader Content
      -------------------------------- */}
      <div
        className={`
          relative z-10 flex flex-col items-center
          transition-all duration-300
          ${exiting ? 'scale-95 opacity-0' : 'scale-100 opacity-100'}
        `}
      >

        {/* Scanner */}
        <div className="relative h-32 w-32">

          {/* Outer ring */}
          <div className="absolute inset-0 rounded-full border border-slate-700/60" />

          {/* Dashed orbit */}
          <div
            className="absolute -inset-2 rounded-full border border-dashed border-sky-400/20 animate-spin"
            style={{ animationDuration: '12s' }}
          />

          {/* Main scanner */}
          <div
            className="absolute inset-2 rounded-full border border-transparent border-t-sky-400 border-r-sky-400/40 animate-spin"
            style={{ animationDuration: '2.2s' }}
          />

          {/* Inner scanner */}
          <div
            className="absolute inset-5 rounded-full border border-transparent border-b-cyan-300/70 border-l-cyan-300/30 animate-spin"
            style={{
              animationDuration: '1.6s',
              animationDirection: 'reverse',
            }}
          />

          {/* Inner circle */}
          <div className="absolute inset-8 rounded-full border border-sky-400/20 bg-sky-400/[0.04]" />

          {/* Core */}
          <div className="absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-sky-300 shadow-[0_0_20px_rgba(56,189,248,0.9)] animate-pulse" />

          {/* Orbit points */}
          <span className="absolute left-1/2 top-1 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-sky-400 shadow-[0_0_10px_rgba(56,189,248,0.8)]" />

          <span className="absolute bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-cyan-400/50" />

          <span className="absolute left-1 top-1/2 h-1 w-1 -translate-y-1/2 rounded-full bg-sky-400/50" />

          <span className="absolute right-1 top-1/2 h-1 w-1 -translate-y-1/2 rounded-full bg-sky-400/50" />
        </div>

        {/* Status */}
        <div className="mt-10 flex flex-col items-center">

          <div className="flex items-center gap-2">

            <span className="h-1.5 w-1.5 rounded-full bg-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.8)] animate-pulse" />

            <span className="text-[11px] font-medium uppercase tracking-[0.4em] text-slate-400">
              Initializing
            </span>

          </div>

          <h1 className="mt-3 text-lg font-semibold tracking-[0.28em] text-white">
            INDEXING
          </h1>

          {/* Progress */}
          <div className="mt-5 h-px w-40 overflow-hidden bg-slate-800">

            <div
              className="h-full w-1/3 bg-sky-400 shadow-[0_0_10px_rgba(56,189,248,0.8)]"
              style={{
                animation: 'loaderProgress 1s ease-in-out forwards',
              }}
            />

          </div>

          <p className="mt-4 text-[10px] tracking-[0.2em] text-slate-600">
            ORGANIZING RESOURCES
          </p>

        </div>
      </div>

      {/* Bottom system information */}
      <div className="absolute bottom-6 left-6 text-[9px] tracking-[0.2em] text-slate-700">
        SYSTEM / READY
      </div>

      <div className="absolute bottom-6 right-6 text-[9px] tracking-[0.2em] text-slate-700">
        v1.0
      </div>

      {/* Progress animation */}
      <style>
        {`
          @keyframes loaderProgress {
            0% {
              transform: translateX(-120%);
            }

            100% {
              transform: translateX(300%);
            }
          }
        `}
      </style>
    </div>
  );
}