import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Search,
  ArrowRight,
  ShieldCheck,
  Zap,
  Globe2,
  Lock,
  Sparkles,
  Play
} from 'lucide-react';

const SEARCH_HISTORY_KEY = 'auralink_search_history';

export const HeroSection = ({ onOpenSubmitModal }) => {
  const navigate = useNavigate();
  const [heroSearch, setHeroSearch] = useState('');

  const handleHeroSearch = (e) => {
    e.preventDefault();
    const trimmed = heroSearch.trim();
    if (trimmed) {
      try {
        const stored = localStorage.getItem(SEARCH_HISTORY_KEY);
        const history = stored ? JSON.parse(stored) : [];
        const filtered = history.filter(item => item.toLowerCase() !== trimmed.toLowerCase());
        localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify([trimmed, ...filtered].slice(0, 8)));
      } catch (err) {}
      navigate(`/search?q=${encodeURIComponent(trimmed)}`);
    }
  };

  const handleQuickTagClick = (tag) => {
    try {
      const stored = localStorage.getItem(SEARCH_HISTORY_KEY);
      const history = stored ? JSON.parse(stored) : [];
      const filtered = history.filter(item => item.toLowerCase() !== tag.toLowerCase());
      localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify([tag, ...filtered].slice(0, 8)));
    } catch (err) {}
    navigate(`/search?q=${encodeURIComponent(tag)}`);
  };

  return (
    <section className="relative pt-12 pb-14 md:pt-20 md:pb-24 overflow-hidden">
      {/* Ambient Radial Lighting */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[340px] bg-purple-600/15 blur-[140px] rounded-full pointer-events-none" />

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-6">

        {/* Top Product Badge */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-950/60 border border-purple-800/50 text-purple-200 text-xs font-medium backdrop-blur-md shadow-sm"
        >
          <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
          <span>Curated Web & Media Discovery Engine</span>
        </motion.div>

        {/* Hero Title */}
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.08 }}
          className="font-bold text-3xl sm:text-5xl md:text-6xl tracking-tight text-white leading-[1.15] font-display"
        >
          Discover and organize the <br className="hidden sm:block" />
          <span className="hero-gradient">open web effortlessly</span>
        </motion.h1>

        {/* Hero Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.16 }}
          className="max-w-2xl mx-auto text-purple-200/70 text-sm sm:text-base leading-relaxed"
        >
          Explore community-curated tools, streamable media, and developer utilities with direct embedded playback and zero personal tracking.
        </motion.p>

        {/* Main Hero Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.22 }}
          className="max-w-xl mx-auto pt-2"
        >
          <form onSubmit={handleHeroSearch} className="relative flex items-center shadow-2xl">
            <input
              id="hero-search-input"
              type="text"
              placeholder="Search links, articles, videos, or tools..."
              value={heroSearch}
              onChange={(e) => setHeroSearch(e.target.value)}
              className="w-full bg-[#0d081e]/90 backdrop-blur-2xl text-slate-100 placeholder-purple-300/40 pl-11 pr-32 py-3.5 rounded-2xl border border-purple-900/40 hover:border-purple-500/40 focus:border-purple-500 outline-none text-sm transition-all shadow-inner"
            />
            <Search className="w-4 h-4 text-purple-400 absolute left-4 pointer-events-none" />
            <div className="absolute right-24 hidden sm:flex items-center gap-1 px-1.5 py-0.5 rounded bg-purple-950/60 border border-purple-800/40 text-[10px] font-mono text-purple-300/70 pointer-events-none">
              <span>Alt+O</span>
            </div>
            <button
              type="submit"
              className="absolute right-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer shadow-purple-glow hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>Search</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>
        </motion.div>

        {/* Value Prop Highlights */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="pt-2 flex flex-wrap items-center justify-center gap-6 text-xs text-purple-200/70"
        >
          <span className="flex items-center gap-1.5">
            <Play className="w-3.5 h-3.5 text-purple-400" />
            <span>Native Media Embeds</span>
          </span>
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>SSRF Safe Sandbox</span>
          </span>
          <span className="flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-purple-300/60" />
            <span>Zero Tracking Logs</span>
          </span>
        </motion.div>

        {/* Trending Tags Pill Row */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.36 }}
          className="pt-2 flex flex-wrap items-center justify-center gap-1.5 text-xs text-purple-300/80"
        >
          <span className="text-purple-400/60 text-xs mr-1">Popular:</span>
          {['react', 'design', 'ai', 'developer-tools', 'music', 'shaders', 'tutorials'].map((tag) => (
            <button
              key={tag}
              onClick={() => handleQuickTagClick(tag)}
              className="px-2.5 py-1 rounded-lg bg-[#0d081e]/80 hover:bg-purple-900/40 text-purple-200/80 hover:text-white border border-purple-900/40 hover:border-purple-500/30 text-xs transition-colors cursor-pointer"
            >
              #{tag}
            </button>
          ))}
        </motion.div>

      </div>
    </section>
  );
};

