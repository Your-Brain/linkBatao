import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Sparkles,
  Plus,
  Compass,
  Radio,
  ShieldCheck,
  Zap,
  Globe2,
  Lock,
  Flame,
  ArrowRight
} from 'lucide-react';

export const HeroSection = ({ onOpenSubmitModal }) => {
  const navigate = useNavigate();

  const handleQuickTagClick = (tag) => {
    navigate(`/search?q=${encodeURIComponent(tag)}`);
  };

  return (
    <section className="relative pt-10 pb-12 md:pt-16 md:pb-20 overflow-hidden cosmos-grid">
      {/* Deep Space Background Mesh Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-gradient-to-r from-cyan-500/10 via-sky-500/10 to-purple-500/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 text-center space-y-6">

        {/* Top Space Mission Protocol Badge */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-cyan-950/50 border border-cyan-500/30 text-cyan-300 text-xs font-mono shadow-glow"
        >
          <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
          <span>DEEP WEB DISCOVERY ENGINE // ANONYMOUS PROTOCOL</span>
        </motion.div>

        {/* Hero Title with Crisp Sci-Fi Typography */}
        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="font-display font-extrabold text-3xl sm:text-5xl md:text-6xl tracking-tight text-white leading-[1.12]"
        >
          Index, Organize & Explore <br className="hidden sm:block" />
          <span className="text-gradient">The Open Web Anonymously</span>
        </motion.h1>

        {/* Hero Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="max-w-2xl mx-auto text-slate-300 text-sm sm:text-base leading-relaxed"
        >
          A high-performance media & link telemetry engine. Discover curated tools, videos, and articles with direct embedded players, vault collections, and zero personal data tracking.
        </motion.p>

        {/* Interactive Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-wrap items-center justify-center gap-3 pt-2"
        >
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={onOpenSubmitModal}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-sky-500 text-slate-950 font-bold text-xs uppercase tracking-wider shadow-glow hover:shadow-glow-lg transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Transmit New Link</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate('/search')}
            className="flex items-center gap-2 px-6 py-3 rounded-xl glass-panel hover:bg-slate-800/80 text-slate-200 font-semibold text-xs border border-slate-700 hover:border-cyan-500/40 transition-all cursor-pointer"
          >
            <Compass className="w-4 h-4 text-cyan-400" />
            <span>Telemetry Search Engine</span>
          </motion.button>
        </motion.div>

        {/* Live Space Telemetry & Status Widget Bar */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="pt-6"
        >
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl mx-auto text-left">
            
            {/* Widget 1: Shield Protocol */}
            <div className="glass-panel rounded-xl p-3 border border-slate-800 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] text-slate-400 uppercase font-mono tracking-wider">SSRF Guard</p>
                <p className="text-xs font-bold text-emerald-300">100% Shielded</p>
              </div>
            </div>

            {/* Widget 2: Node Privacy */}
            <div className="glass-panel rounded-xl p-3 border border-slate-800 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center shrink-0">
                <Lock className="w-4 h-4 text-cyan-400" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] text-slate-400 uppercase font-mono tracking-wider">Identity</p>
                <p className="text-xs font-bold text-cyan-300">Zero Logs</p>
              </div>
            </div>

            {/* Widget 3: Live Embeds */}
            <div className="glass-panel rounded-xl p-3 border border-slate-800 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center shrink-0">
                <Globe2 className="w-4 h-4 text-sky-400" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] text-slate-400 uppercase font-mono tracking-wider">Media Engine</p>
                <p className="text-xs font-bold text-sky-300">Native Playback</p>
              </div>
            </div>

            {/* Widget 4: Real-time Discovery */}
            <div className="glass-panel rounded-xl p-3 border border-slate-800 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center shrink-0">
                <Zap className="w-4 h-4 text-purple-400" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] text-slate-400 uppercase font-mono tracking-wider">Indexed Nodes</p>
                <p className="text-xs font-bold text-purple-300">Global Orbit</p>
              </div>
            </div>

          </div>
        </motion.div>

        {/* Trending Signals Tag Matrix */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="pt-2 flex flex-wrap items-center justify-center gap-1.5 text-xs text-slate-400"
        >
          <span className="font-mono text-slate-500 text-[10px] uppercase tracking-wider flex items-center gap-1 mr-1">
            <Flame className="w-3 h-3 text-amber-400" />
            Signals:
          </span>
          {['react', 'web3', 'cyberpunk', 'synthwave', 'javascript', 'ai-tools', 'vimeo'].map((tag) => (
            <button
              key={tag}
              onClick={() => handleQuickTagClick(tag)}
              className="px-2.5 py-0.5 rounded-lg bg-[#090e1d] border border-slate-800 hover:border-cyan-400/60 hover:text-cyan-300 text-slate-400 text-[11px] font-mono transition-all cursor-pointer"
            >
              #{tag}
            </button>
          ))}
        </motion.div>

      </div>
    </section>
  );
};
