import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import {
  Search,
  Plus,
  Compass,
  FolderHeart,
  ShieldCheck,
  LogIn,
  UserPlus,
  LogOut,
  User,
  Menu,
  X,
  ShieldAlert,
  Radio,
  Sparkles,
  Command
} from 'lucide-react';

export const Navbar = ({ onOpenSubmitModal, onOpenAuthModal }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
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

  // Close dropdown on route change
  useEffect(() => {
    setUserDropdownOpen(false);
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-800/80 bg-[#050811]/90 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">

        {/* Brand Logo & Telemetry Indicator */}
        <div className="flex items-center gap-4 shrink-0">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-sky-600 p-[1px] shadow-glow">
              <div className="w-full h-full bg-dark-900 rounded-[7px] flex items-center justify-center relative overflow-hidden">
                <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_#22d3ee]" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="font-display font-bold text-lg tracking-tight text-white group-hover:text-cyan-300 transition-colors">
                Aura<span className="text-cyan-400">Link</span>
              </span>
              <span className="text-[9px] font-mono text-cyan-400/80 tracking-widest hidden sm:inline uppercase">
                HUB // v2.4
              </span>
            </div>
          </Link>

          {/* Live Node Signal Pill Widget */}
          <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-950/40 border border-cyan-500/20 text-[10px] font-mono text-cyan-300">
            <Radio className="w-3 h-3 text-cyan-400 animate-pulse" />
            <span>ORBIT NET ONLINE</span>
          </div>
        </div>

        {/* Global Search Bar with Sci-Fi Command Shortcut */}
        <form onSubmit={handleSearchSubmit} className="hidden md:flex flex-1 max-w-md relative">
          <input
            type="text"
            placeholder="Search resources, protocols, tags, domains..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#090e1d] text-xs text-slate-100 placeholder-slate-500 pl-9 pr-14 py-2 rounded-xl border border-slate-800 focus:border-cyan-400 outline-none transition-all"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-dark-800 border border-slate-700/60 text-[9px] font-mono text-slate-400 pointer-events-none">
            <Command className="w-2.5 h-2.5" />
            <span>K</span>
          </div>
        </form>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1 text-xs font-medium text-slate-300">
          <Link
            to="/"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              isActive('/')
                ? 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/30'
                : 'hover:text-white hover:bg-slate-800/40'
            }`}
          >
            <Compass className="w-3.5 h-3.5 text-cyan-400" />
            <span>Discovery Engine</span>
          </Link>

          <Link
            to="/collections"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              isActive('/collections')
                ? 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/30'
                : 'hover:text-white hover:bg-slate-800/40'
            }`}
          >
            <FolderHeart className="w-3.5 h-3.5 text-sky-400" />
            <span>Vaults</span>
          </Link>

          <Link
            to="/privacy"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              isActive('/privacy')
                ? 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/30'
                : 'hover:text-white hover:bg-slate-800/40'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Protocols</span>
          </Link>
        </nav>

        {/* Actions & User Control Hub */}
        <div className="flex items-center gap-2.5">
          {/* Submit Action Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onOpenSubmitModal}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-cyan-500 to-sky-500 text-slate-950 shadow-glow transition-all cursor-pointer shrink-0"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Transmit Link</span>
          </motion.button>

          {/* User Account Session */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 p-1 rounded-xl border border-slate-800 hover:border-cyan-500/40 transition-colors bg-[#090e1d] cursor-pointer"
              >
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-cyan-400 to-indigo-500 flex items-center justify-center text-xs font-bold text-slate-950">
                  {user.username.charAt(0).toUpperCase()}
                </div>
              </button>

              {/* Framer Motion Dropdown */}
              <AnimatePresence>
                {userDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.96 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-56 glass-modal rounded-2xl py-2 shadow-2xl border border-cyan-500/30 z-50 text-left"
                  >
                    <div className="px-4 py-2 border-b border-slate-800">
                      <p className="text-xs font-bold text-white">@{user.username}</p>
                      <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
                      <span className="inline-block mt-1 px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-cyan-500/20 text-cyan-300 uppercase border border-cyan-500/30">
                        {user.role}
                      </span>
                    </div>

                    <Link
                      to="/profile"
                      className="flex items-center gap-2.5 px-4 py-2 text-xs text-slate-200 hover:bg-cyan-500/10 hover:text-cyan-300 transition-colors"
                    >
                      <User className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Saved & Transmissions</span>
                    </Link>

                    {(user.role === 'ADMIN' || user.role === 'MODERATOR') && (
                      <Link
                        to="/admin"
                        className="flex items-center gap-2.5 px-4 py-2 text-xs text-amber-300 hover:bg-amber-500/10 transition-colors"
                      >
                        <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                        <span>Command Center</span>
                      </Link>
                    )}

                    <button
                      onClick={() => {
                        logout();
                        setUserDropdownOpen(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5 text-rose-400" />
                      <span>Terminate Session</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <div className="hidden sm:flex items-center gap-1.5">
              <button
                onClick={() => onOpenAuthModal('login')}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors cursor-pointer"
              >
                <LogIn className="w-3 h-3 text-cyan-400" />
                <span>Log In</span>
              </button>
              <button
                onClick={() => onOpenAuthModal('register')}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-dark-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/30 transition-colors cursor-pointer"
              >
                <UserPlus className="w-3 h-3" />
                <span>Register</span>
              </button>
            </div>
          )}

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-1.5 text-slate-300 hover:text-white cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden px-4 pt-2 pb-6 border-t border-slate-800 bg-[#050811]/98 backdrop-blur-2xl space-y-4"
          >
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                placeholder="Search links, tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#090e1d] text-xs text-slate-100 placeholder-slate-500 pl-9 pr-4 py-2 rounded-xl border border-slate-800 focus:border-cyan-400 outline-none"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </form>

            <div className="flex flex-col gap-2 font-medium text-slate-200 text-xs">
              <Link to="/" className="flex items-center gap-2 py-2 hover:text-cyan-300">
                <Compass className="w-4 h-4 text-cyan-400" />
                <span>Discovery Engine</span>
              </Link>
              <Link to="/collections" className="flex items-center gap-2 py-2 hover:text-cyan-300">
                <FolderHeart className="w-4 h-4 text-sky-400" />
                <span>Vaults & Collections</span>
              </Link>
              <Link to="/privacy" className="flex items-center gap-2 py-2 hover:text-cyan-300">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Protocols & Safety</span>
              </Link>
              {!user && (
                <div className="flex gap-2 pt-2 border-t border-slate-800">
                  <button
                    onClick={() => { onOpenAuthModal('login'); setMobileMenuOpen(false); }}
                    className="flex-1 py-2 rounded-xl bg-dark-800 text-xs font-semibold text-slate-200 border border-slate-700"
                  >
                    Log In
                  </button>
                  <button
                    onClick={() => { onOpenAuthModal('register'); setMobileMenuOpen(false); }}
                    className="flex-1 py-2 rounded-xl bg-cyan-500 text-xs font-bold text-slate-950 shadow-glow"
                  >
                    Register
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
