import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, ExternalLink, Lock, Flame, Radio, Terminal, Cpu } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="mt-20 border-t border-slate-800/80 bg-[#03050a]/95 text-slate-400 text-xs py-12 text-left">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">

          {/* Brand Col */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 font-mono font-bold text-xs">
                A
              </div>
              <span className="font-display font-bold text-base text-white">AuraLink</span>
            </div>
            <p className="leading-relaxed text-slate-400 text-xs">
              Autonomous link telemetry & media discovery engine. Indexing and organizing open web channels with direct responsive playback and zero tracking.
            </p>
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-cyan-950/40 border border-cyan-500/20 text-[10px] font-mono text-cyan-400">
              <Radio className="w-2.5 h-2.5 animate-pulse" />
              <span>ORBIT PROTOCOL ONLINE</span>
            </div>
          </div>

          {/* Quick Channels */}
          <div>
            <h4 className="font-mono font-semibold text-slate-200 uppercase tracking-wider mb-3 text-[10px]">Discovery Channels</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/search?category=technology" className="hover:text-cyan-300 transition-colors">#technology</Link></li>
              <li><Link to="/search?category=programming" className="hover:text-cyan-300 transition-colors">#programming</Link></li>
              <li><Link to="/search?category=gaming" className="hover:text-cyan-300 transition-colors">#gaming</Link></li>
              <li><Link to="/search?category=fashion" className="hover:text-cyan-300 transition-colors">#fashion</Link></li>
              <li><Link to="/search?category=music" className="hover:text-cyan-300 transition-colors">#music</Link></li>
            </ul>
          </div>

          {/* Security & Guarantees */}
          <div>
            <h4 className="font-mono font-semibold text-slate-200 uppercase tracking-wider mb-3 text-[10px]">Protocol Guarantees</h4>
            <ul className="space-y-2 text-xs">
              <li className="flex items-center gap-1.5"><Lock className="w-3.5 h-3.5 text-cyan-400" /> Anonymous Transmissions</li>
              <li className="flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> SSRF & XSS Shielded</li>
              <li className="flex items-center gap-1.5"><ExternalLink className="w-3.5 h-3.5 text-sky-400" /> Native Player Sandboxing</li>
              <li className="flex items-center gap-1.5"><Flame className="w-3.5 h-3.5 text-amber-400" /> Dynamic Signal Ranking</li>
            </ul>
          </div>

          {/* Legal & Safety */}
          <div>
            <h4 className="font-mono font-semibold text-slate-200 uppercase tracking-wider mb-3 text-[10px]">Legal & Telemetry Rules</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/privacy" className="hover:text-cyan-300 transition-colors">Privacy Policy</Link></li>
              <li><Link to="/privacy#terms" className="hover:text-cyan-300 transition-colors">Terms of Service</Link></li>
              <li><Link to="/privacy#dmca" className="hover:text-cyan-300 transition-colors">DMCA / Removal Requests</Link></li>
              <li><Link to="/privacy#report" className="hover:text-cyan-300 transition-colors">Signal Anomaly Reporting</Link></li>
            </ul>
          </div>

        </div>

        <div className="pt-6 border-t border-slate-800/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left text-[11px] font-mono text-slate-500">
          <p>© 2026 AuraLink Engine. All rights reserved. Public link discovery network.</p>
          <p className="flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-cyan-400" />
            <span>Built with React 18, Framer Motion & Tailwind CSS</span>
          </p>
        </div>
      </div>
    </footer>
  );
};
