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
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[300px] bg-indigo-500/10 blur-[130px] rounded-full pointer-events-none" />

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-6">

        {/* Top Product Badge */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.05] border border-white/[0.1] text-zinc-300 text-xs font-medium backdrop-blur-md shadow-sm"
        >
          <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
          <span>Curated Web & Media Discovery Engine</span>
        </motion.div>

        {/* Hero Title */}
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.08 }}
          className="font-bold text-3xl sm:text-5xl md:text-6xl tracking-tight text-white leading-[1.15]"
        >
          Discover and organize the <br className="hidden sm:block" />
          <span className="hero-gradient">open web effortlessly</span>
        </motion.h1>

        {/* Hero Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.16 }}
          className="max-w-2xl mx-auto text-zinc-400 text-sm sm:text-base leading-relaxed"
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
              className="w-full bg-zinc-900/80 backdrop-blur-2xl text-zinc-100 placeholder-zinc-500 pl-11 pr-32 py-3.5 rounded-2xl border border-white/[0.1] hover:border-white/[0.18] focus:border-indigo-500 outline-none text-sm transition-all"
            />
            <Search className="w-4 h-4 text-zinc-400 absolute left-4 pointer-events-none" />
            <div className="absolute right-24 hidden sm:flex items-center gap-1 px-1.5 py-0.5 rounded bg-white/[0.06] border border-white/[0.08] text-[10px] font-mono text-zinc-400 pointer-events-none">
              <span>Alt+O</span>
            </div>
            <button
              type="submit"
              className="absolute right-2 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-medium transition-colors flex items-center gap-1 cursor-pointer shadow-sm"
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
          className="pt-2 flex flex-wrap items-center justify-center gap-6 text-xs text-zinc-400"
        >
          <span className="flex items-center gap-1.5">
            <Play className="w-3.5 h-3.5 text-indigo-400" />
            <span>Native Media Embeds</span>
          </span>
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>SSRF Safe Sandbox</span>
          </span>
          <span className="flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-zinc-400" />
            <span>Zero Tracking Logs</span>
          </span>
        </motion.div>

        {/* Trending Tags Pill Row */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.36 }}
          className="pt-2 flex flex-wrap items-center justify-center gap-1.5 text-xs text-zinc-400"
        >
          <span className="text-zinc-500 text-xs mr-1">Popular:</span>
          {['react', 'design', 'ai', 'developer-tools', 'music', 'shaders', 'tutorials'].map((tag) => (
            <button
              key={tag}
              onClick={() => handleQuickTagClick(tag)}
              className="px-2.5 py-1 rounded-lg bg-zinc-900/60 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-zinc-800 text-xs transition-colors cursor-pointer"
            >
              #{tag}
            </button>
          ))}
        </motion.div>

      </div>
    </section>
  );
};

