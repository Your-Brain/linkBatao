import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, ExternalLink, Lock, Flame } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="mt-20 border-t border-slate-800/80 bg-dark-900/90 text-slate-400 text-xs py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">

          {/* Brand Col */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-sky-400/20 border border-sky-400/40 flex items-center justify-center text-sky-400 font-bold text-xs">
                A
              </div>
              <span className="font-display font-bold text-base text-white">AuraLink</span>
            </div>
            <p className="leading-relaxed text-slate-400">
              Next-generation anonymous media discovery platform. Indexing & organizing publicly accessible links, videos, and articles across the web.
            </p>
          </div>

          {/* Quick Categories */}
          <div>
            <h4 className="font-semibold text-slate-200 uppercase tracking-wider mb-3 text-[11px]">Discover Categories</h4>
            <ul className="space-y-2">
              <li><Link to="/search?category=technology" className="hover:text-sky-300 transition-colors">Technology & AI</Link></li>
              <li><Link to="/search?category=programming" className="hover:text-sky-300 transition-colors">Programming & Web Dev</Link></li>
              <li><Link to="/search?category=gaming" className="hover:text-sky-300 transition-colors">Gaming & eSports</Link></li>
              <li><Link to="/search?category=fashion" className="hover:text-sky-300 transition-colors">Fashion & Lookbooks</Link></li>
              <li><Link to="/search?category=music" className="hover:text-sky-300 transition-colors">Music & Soundtracks</Link></li>
            </ul>
          </div>

          {/* Security & Principles */}
          <div>
            <h4 className="font-semibold text-slate-200 uppercase tracking-wider mb-3 text-[11px]">Platform Guarantees</h4>
            <ul className="space-y-2">
              <li className="flex items-center gap-1.5"><Lock className="w-3.5 h-3.5 text-sky-400" /> Anonymous Submissions</li>
              <li className="flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> SSRF & XSS Guarded</li>
              <li className="flex items-center gap-1.5"><ExternalLink className="w-3.5 h-3.5 text-cyan-400" /> Official Embed & Source Links</li>
              <li className="flex items-center gap-1.5"><Flame className="w-3.5 h-3.5 text-amber-400" /> Dynamic Trending Score</li>
            </ul>
          </div>

          {/* Legal & Safety */}
          <div>
            <h4 className="font-semibold text-slate-200 uppercase tracking-wider mb-3 text-[11px]">Legal & Moderation</h4>
            <ul className="space-y-2">
              <li><Link to="/privacy" className="hover:text-sky-300 transition-colors">Privacy Policy</Link></li>
              <li><Link to="/privacy#terms" className="hover:text-sky-300 transition-colors">Terms of Service</Link></li>
              <li><Link to="/privacy#dmca" className="hover:text-sky-300 transition-colors">DMCA / Link Removal</Link></li>
              <li><Link to="/privacy#report" className="hover:text-sky-300 transition-colors">Report Inappropriate Content</Link></li>
            </ul>
          </div>

        </div>

        <div className="pt-6 border-t border-slate-800/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <p>© 2026 AuraLink Engine. All rights reserved. Link discovery platform.</p>
          <p className="text-slate-500">Built with React 18, Node.js, Express & MongoDB</p>
        </div>
      </div>
    </footer>
  );
};
