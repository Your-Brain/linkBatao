import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Search, Plus, Compass, FolderHeart, ShieldCheck, LogIn, UserPlus, LogOut, User, Menu, X, ShieldAlert } from 'lucide-react';

export const Navbar = ({ onOpenSubmitModal, onOpenAuthModal }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setMobileMenuOpen(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-sky-500/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2.5 group shrink-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-500 to-cyan-400 p-0.5 shadow-glow group-hover:scale-105 transition-transform">
            <div className="w-full h-full bg-dark-900 rounded-[10px] flex items-center justify-center">
              <div className="w-3.5 h-3.5 rounded-full bg-sky-400 animate-pulse-slow shadow-[0_0_10px_#38bdf8]" />
            </div>
          </div>
          <span className="font-display font-bold text-xl tracking-tight text-white group-hover:text-sky-300 transition-colors">
            Aura<span className="text-sky-400">Link</span>
          </span>
        </Link>

        {/* Global Search Bar */}
        <form onSubmit={handleSearchSubmit} className="hidden md:flex flex-1 max-w-md relative">
          <input
            type="text"
            placeholder="Search links, tags, domains, videos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-dark-800/80 text-sm text-slate-100 placeholder-slate-400 pl-10 pr-4 py-2 rounded-full border border-slate-700/60 focus:border-sky-400 focus:ring-1 focus:ring-sky-400 transition-all outline-none"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        </form>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-300">
          <Link to="/" className="flex items-center gap-1.5 hover:text-sky-300 transition-colors">
            <Compass className="w-4 h-4 text-sky-400" />
            <span>Discover</span>
          </Link>
          <Link to="/collections" className="flex items-center gap-1.5 hover:text-sky-300 transition-colors">
            <FolderHeart className="w-4 h-4 text-cyan-400" />
            <span>Collections</span>
          </Link>
          <Link to="/privacy" className="flex items-center gap-1.5 hover:text-sky-300 transition-colors">
            <ShieldCheck className="w-4 h-4 text-slate-400" />
            <span>Privacy & Safety</span>
          </Link>
        </nav>

        {/* Actions & User Profile */}
        <div className="flex items-center gap-3">
          {/* Submit Link Button */}
          <button
            onClick={onOpenSubmitModal}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-gradient-to-r from-sky-500 to-cyan-500 text-slate-950 hover:shadow-glow hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer shadow-md"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Submit Link</span>
          </button>

          {/* User Menu / Auth Buttons */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 p-1 rounded-full border border-sky-500/30 hover:border-sky-400 transition-colors bg-dark-800/80"
              >
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-sky-400 to-indigo-500 flex items-center justify-center text-xs font-bold text-slate-950">
                  {user.username.charAt(0).toUpperCase()}
                </div>
              </button>

              {/* Dropdown Menu */}
              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 glass-modal rounded-2xl py-2 shadow-2xl border border-sky-500/20 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-4 py-2 border-b border-slate-700/50">
                    <p className="text-sm font-semibold text-white">{user.username}</p>
                    <p className="text-xs text-slate-400 truncate">{user.email}</p>
                    <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold bg-sky-500/20 text-sky-300 uppercase">
                      {user.role}
                    </span>
                  </div>

                  <Link
                    to="/profile"
                    onClick={() => setUserDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-200 hover:bg-sky-500/10 hover:text-sky-300 transition-colors"
                  >
                    <User className="w-4 h-4 text-sky-400" />
                    <span>My Saved & Submissions</span>
                  </Link>

                  {(user.role === 'ADMIN' || user.role === 'MODERATOR') && (
                    <Link
                      to="/admin"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-sm text-amber-300 hover:bg-amber-500/10 transition-colors"
                    >
                      <ShieldAlert className="w-4 h-4 text-amber-400" />
                      <span>Admin Moderation</span>
                    </Link>
                  )}

                  <button
                    onClick={() => {
                      logout();
                      setUserDropdownOpen(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-rose-400 hover:bg-rose-500/10 transition-colors text-left"
                  >
                    <LogOut className="w-4 h-4 text-rose-400" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="hidden sm:flex items-center gap-2">
              <button
                onClick={() => onOpenAuthModal('login')}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Log In</span>
              </button>
              <button
                onClick={() => onOpenAuthModal('register')}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-dark-700 hover:bg-slate-700 text-sky-300 border border-sky-500/30 transition-colors"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Register</span>
              </button>
            </div>
          )}

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-1.5 text-slate-300 hover:text-white"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden px-4 pt-2 pb-6 border-t border-slate-800 bg-dark-900/95 backdrop-blur-xl">
          <form onSubmit={handleSearchSubmit} className="mb-4 relative">
            <input
              type="text"
              placeholder="Search links, tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-dark-800 text-sm text-slate-100 placeholder-slate-400 pl-10 pr-4 py-2 rounded-xl border border-slate-700 focus:border-sky-400 outline-none"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          </form>

          <div className="flex flex-col gap-3 font-medium text-slate-200 text-sm">
            <Link to="/" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2 py-1.5 hover:text-sky-300">
              <Compass className="w-4 h-4 text-sky-400" />
              <span>Discover Engine</span>
            </Link>
            <Link to="/collections" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2 py-1.5 hover:text-sky-300">
              <FolderHeart className="w-4 h-4 text-cyan-400" />
              <span>Collections</span>
            </Link>
            <Link to="/privacy" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2 py-1.5 hover:text-sky-300">
              <ShieldCheck className="w-4 h-4 text-slate-400" />
              <span>Privacy & Safety</span>
            </Link>
            {!user && (
              <div className="flex gap-2 pt-2 border-t border-slate-800">
                <button
                  onClick={() => { onOpenAuthModal('login'); setMobileMenuOpen(false); }}
                  className="flex-1 py-2 rounded-lg bg-dark-800 text-xs font-semibold text-slate-200 border border-slate-700"
                >
                  Log In
                </button>
                <button
                  onClick={() => { onOpenAuthModal('register'); setMobileMenuOpen(false); }}
                  className="flex-1 py-2 rounded-lg bg-sky-500 text-xs font-semibold text-slate-950"
                >
                  Register
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
