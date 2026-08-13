import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Plus, Compass, Play, ShieldAlert, Layers } from 'lucide-react';

export const HeroSection = ({ onOpenSubmitModal }) => {
  const navigate = useNavigate();

  const handleQuickTagClick = (tag) => {
    navigate(`/search?q=${encodeURIComponent(tag)}`);
  };

  return (
    <section className="relative pt-12 pb-16 md:pt-16 md:pb-24 overflow-hidden">
      {/* Glow Backdrop Orbs */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-sky-500/20 via-cyan-500/10 to-indigo-500/10 blur-[100px] rounded-full pointer-events-none" />

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 text-center space-y-6">
        
        {/* Top Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass-panel border-sky-400/30 text-sky-300 text-xs font-semibold shadow-glow animate-glow-pulse">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>Anonymous Media & Public Link Discovery Platform</span>
        </div>

        {/* Hero Title */}
        <h1 className="font-display font-extrabold text-3xl sm:text-5xl md:text-6xl tracking-tight text-white leading-[1.15]">
          Discover, Categorize & Bookmark the <span className="text-gradient">Open Web Anonymously</span>
        </h1>

        {/* Hero Subtitle */}
        <p className="max-w-2xl mx-auto text-slate-300 text-base sm:text-lg leading-relaxed">
          Index YouTube videos, articles, images, code, and resources. Enjoy direct responsive embedded playback, custom collections, and zero mandatory signups.
        </p>

        {/* Hero Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          <button
            onClick={onOpenSubmitModal}
            className="flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-sky-500 to-cyan-500 text-slate-950 font-bold text-sm hover:shadow-glow hover:scale-105 active:scale-95 transition-all shadow-lg cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Submit Link Anonymously</span>
          </button>
          
          <button
            onClick={() => navigate('/search')}
            className="flex items-center gap-2 px-6 py-3 rounded-full glass-panel hover:bg-slate-800/80 text-slate-200 font-semibold text-sm border border-slate-700 hover:border-sky-400/50 hover:scale-105 active:scale-95 transition-all cursor-pointer"
          >
            <Compass className="w-4 h-4 text-sky-400" />
            <span>Explore All Resources</span>
          </button>
        </div>

        {/* Popular Tags Pills */}
        <div className="pt-6 flex flex-wrap items-center justify-center gap-2 text-xs text-slate-400">
          <span className="font-medium text-slate-500 uppercase tracking-wider text-[10px]">Trending Tags:</span>
          {['react', 'cyberpunk', 'synthwave', 'javascript', 'architecture', 'vimeo'].map(tag => (
            <button
              key={tag}
              onClick={() => handleQuickTagClick(tag)}
              className="px-2.5 py-1 rounded-lg bg-dark-800/70 border border-slate-800 hover:border-sky-400/50 hover:text-sky-300 transition-colors cursor-pointer"
            >
              #{tag}
            </button>
          ))}
        </div>

      </div>
    </section>
  );
};
