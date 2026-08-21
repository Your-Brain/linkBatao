import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, ExternalLink, Lock, Flame, Sparkles } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="mt-20 border-t border-zinc-800/80 bg-zinc-950 text-zinc-400 text-xs py-12 text-left">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">

          {/* Brand Col */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2.5">
              <div className="w-6 h-6 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-bold text-xs">
                A
              </div>
              <span className="font-bold text-base text-white">AuraLink</span>
            </div>
            <p className="leading-relaxed text-zinc-400 text-xs">
              Modern link discovery and bookmarking platform. Indexing open web resources with responsive playback and zero tracking.
            </p>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-zinc-900 border border-zinc-800 text-[10px] text-zinc-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Platform Online</span>
            </div>
          </div>

          {/* Quick Categories */}
          <div>
            <h4 className="font-semibold text-zinc-200 uppercase tracking-wider mb-3 text-[11px]">Popular Categories</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/search?category=technology" className="hover:text-zinc-200 transition-colors">Technology</Link></li>
              <li><Link to="/search?category=programming" className="hover:text-zinc-200 transition-colors">Programming</Link></li>
              <li><Link to="/search?category=gaming" className="hover:text-zinc-200 transition-colors">Gaming</Link></li>
              <li><Link to="/search?category=education" className="hover:text-zinc-200 transition-colors">Education</Link></li>
              <li><Link to="/search?category=music" className="hover:text-zinc-200 transition-colors">Music & Podcasts</Link></li>
            </ul>
          </div>

          {/* Platform Highlights */}
          <div>
            <h4 className="font-semibold text-zinc-200 uppercase tracking-wider mb-3 text-[11px]">Features & Security</h4>
            <ul className="space-y-2 text-xs">
              <li className="flex items-center gap-2"><Lock className="w-3.5 h-3.5 text-indigo-400" /> Anonymous Submissions</li>
              <li className="flex items-center gap-2"><ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> SSRF & Malicious Link Protection</li>
              <li className="flex items-center gap-2"><ExternalLink className="w-3.5 h-3.5 text-indigo-400" /> Sandboxed Embed Players</li>
              <li className="flex items-center gap-2"><Flame className="w-3.5 h-3.5 text-amber-400" /> Smart Ranking Algorithm</li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold text-zinc-200 uppercase tracking-wider mb-3 text-[11px]">Legal & Safety</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/privacy" className="hover:text-zinc-200 transition-colors">Privacy Policy</Link></li>
              <li><Link to="/privacy" className="hover:text-zinc-200 transition-colors">Terms of Service</Link></li>
              <li><Link to="/privacy" className="hover:text-zinc-200 transition-colors">DMCA & Copyright Notice</Link></li>
              <li><Link to="/privacy" className="hover:text-zinc-200 transition-colors">Safety Guidelines</Link></li>
            </ul>
          </div>

        </div>

        <div className="pt-6 border-t border-zinc-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left text-xs text-zinc-500">
          <p>© 2026 AuraLink. All rights reserved.</p>
          <p className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Built with React 18 & Tailwind CSS</span>
          </p>
        </div>
      </div>
    </footer>
  );
};

