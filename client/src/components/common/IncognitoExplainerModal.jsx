import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Ghost, Shield, ShieldCheck, EyeOff, Sparkles, X, CheckCircle2, Zap } from 'lucide-react';
import { useIncognito } from '../../context/IncognitoContext';

export const IncognitoExplainerModal = () => {
  const { isExplainerOpen, closeExplainer, isIncognito, toggleIncognito } = useIncognito();

  if (!isExplainerOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-xl bg-[#0c081e] border border-purple-800/60 rounded-3xl p-6 sm:p-8 shadow-[0_0_50px_rgba(147,51,234,0.25)] text-left overflow-hidden hud-bracket"
        >
          {/* Subtle Cyber Grid Glow Background */}
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-48 h-48 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />

          {/* Close button */}
          <button
            onClick={closeExplainer}
            className="absolute top-5 right-5 p-2 rounded-xl bg-purple-950/40 hover:bg-purple-900/60 text-purple-300 border border-purple-800/40 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Modal Header */}
          <div className="flex items-center gap-3.5 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-600/30 to-indigo-600/30 border border-purple-500/40 flex items-center justify-center text-purple-300 shadow-purple-glow">
              <Ghost className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display font-bold text-xl text-white">
                  Incognito Stealth Mode
                </h3>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider border ${
                  isIncognito
                    ? 'bg-purple-950/80 text-purple-300 border-purple-500/50'
                    : 'bg-emerald-950/80 text-emerald-300 border-emerald-500/50'
                }`}>
                  {isIncognito ? 'Currently ON' : 'Safe Mode Active'}
                </span>
              </div>
              <p className="text-xs font-mono text-purple-300/70">
                Discrete safe browsing & private adult content control
              </p>
            </div>
          </div>

          {/* Feature Pillars */}
          <div className="space-y-3.5 mb-6">
            {/* Safe Browsing Pillar */}
            <div className="p-3.5 rounded-2xl bg-[#140d2e]/80 border border-purple-900/40 flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-mono font-bold text-emerald-300 uppercase tracking-wider">
                  Safe Browsing (Default)
                </h4>
                <p className="text-xs text-purple-200/80 mt-0.5 leading-relaxed">
                  Automatically shields all 18+ adult resources, NSFW categories, sensitive tags, and mature vaults from search results and feeds.
                </p>
              </div>
            </div>

            {/* Stealth Mode Pillar */}
            <div className="p-3.5 rounded-2xl bg-[#140d2e]/80 border border-purple-900/40 flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-300 shrink-0 mt-0.5">
                <Ghost className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-mono font-bold text-purple-300 uppercase tracking-wider">
                  Stealth Incognito Mode (Alt + I)
                </h4>
                <p className="text-xs text-purple-200/80 mt-0.5 leading-relaxed">
                  Unlocks 18+ adult content, sensitive media channels, and mature resource vaults for discrete private viewing.
                </p>
              </div>
            </div>

            {/* Zero Footprint Pillar */}
            <div className="p-3.5 rounded-2xl bg-[#140d2e]/80 border border-purple-900/40 flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-300 shrink-0 mt-0.5">
                <EyeOff className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-mono font-bold text-indigo-300 uppercase tracking-wider">
                  Zero Trace & Ephemeral Privacy
                </h4>
                <p className="text-xs text-purple-200/80 mt-0.5 leading-relaxed">
                  No search history or visit tracking is stored during Incognito browsing. Closing your tab immediately resets mode to Safe Browsing.
                </p>
              </div>
            </div>
          </div>

          {/* Action Footer */}
          <div className="pt-4 border-t border-purple-900/40 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs font-mono text-purple-300/70">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Keyboard Shortcut: <kbd className="px-1.5 py-0.5 rounded bg-purple-950/80 border border-purple-800/60 text-white font-bold">Alt + I</kbd></span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  toggleIncognito();
                }}
                className={`px-4 py-2 rounded-xl text-xs font-mono font-bold uppercase transition-all cursor-pointer shadow-sm flex items-center gap-1.5 ${
                  isIncognito
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-500/20'
                    : 'bg-purple-600 hover:bg-purple-500 text-white shadow-purple-glow'
                }`}
              >
                {isIncognito ? (
                  <>
                    <Shield className="w-3.5 h-3.5" />
                    <span>Switch to Safe Mode</span>
                  </>
                ) : (
                  <>
                    <Ghost className="w-3.5 h-3.5" />
                    <span>Turn On Incognito</span>
                  </>
                )}
              </button>

              <button
                onClick={closeExplainer}
                className="px-4 py-2 rounded-xl bg-purple-950/40 hover:bg-purple-900/60 text-purple-200 border border-purple-800/40 text-xs font-mono font-semibold transition-colors cursor-pointer"
              >
                Got It
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
