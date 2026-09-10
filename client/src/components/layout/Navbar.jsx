import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useIncognito } from '../../context/IncognitoContext';
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
  Ghost,
  Shield,
  Layers,
  Clock,
  Trash2,
  Sparkles,
  ArrowRight,
  Share2
} from 'lucide-react';

const SEARCH_HISTORY_KEY = 'auralink_search_history';

export const Navbar = ({ onOpenSubmitModal, onOpenAuthModal }) => {
  const { user, logout } = useAuth();
  const { isIncognito, toggleIncognito } = useIncognito();
  const navigate = useNavigate();
  const location = useLocation();

  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [searchHistory, setSearchHistory] = useState([]);

  const searchInputRef = useRef(null);
  const searchContainerRef = useRef(null);

  // Load search history from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(SEARCH_HISTORY_KEY);
      if (stored) {
        setSearchHistory(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Failed to load search history', e);
    }
  }, []);

  // Save to search history
  const saveSearchQuery = (query) => {
    const trimmed = query.trim();
    if (!trimmed) return;
    try {
      const filtered = searchHistory.filter(item => item.toLowerCase() !== trimmed.toLowerCase());
      const updated = [trimmed, ...filtered].slice(0, 8);
      setSearchHistory(updated);
      localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to save search history', e);
    }
  };

  const removeHistoryItem = (e, itemToRemove) => {
    e.preventDefault();
    e.stopPropagation();
    const updated = searchHistory.filter(item => item !== itemToRemove);
    setSearchHistory(updated);
    try {
      localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(updated));
    } catch (err) { }
  };

  const clearAllHistory = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setSearchHistory([]);
    try {
      localStorage.removeItem(SEARCH_HISTORY_KEY);
    } catch (err) { }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      saveSearchQuery(searchQuery);
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setIsHistoryOpen(false);
      setMobileMenuOpen(false);
    }
  };

  const handleSelectHistoryItem = (item) => {
    saveSearchQuery(item);
    navigate(`/search?q=${encodeURIComponent(item)}`);
    setSearchQuery('');
    setIsHistoryOpen(false);
    setMobileMenuOpen(false);
  };

  // Keyboard shortcut listener: Win+O, Alt+O, Ctrl+O, Ctrl+K, or Slash (/) to focus search input
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't intercept if user is typing in a textarea or input (unless it's an explicit modifier combo)
      const isTyping = ['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName);
      const isOKey = e.key === 'o' || e.key === 'O' || e.code === 'KeyO';
      const isKKey = e.key === 'k' || e.key === 'K' || e.code === 'KeyK';
      const isSlash = e.key === '/' && !isTyping;

      const isModifierO = isOKey && (e.altKey || e.metaKey || e.ctrlKey);
      const isModifierK = isKKey && (e.ctrlKey || e.metaKey);

      if (isModifierO || isModifierK || isSlash) {
        e.preventDefault();
        e.stopPropagation();

        // Focus navbar search or hero search if available
        if (searchInputRef.current) {
          searchInputRef.current.focus();
          searchInputRef.current.select();
        }
        const heroInput = document.getElementById('hero-search-input');
        if (heroInput && window.scrollY < 300) {
          heroInput.focus();
          heroInput.select();
        }

        setIsHistoryOpen(true);
      } else if (e.key === 'Escape') {
        setIsHistoryOpen(false);
        setUserDropdownOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, []);

  // Click outside to close search history
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setIsHistoryOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close dropdown on route change
  useEffect(() => {
    setUserDropdownOpen(false);
    setMobileMenuOpen(false);
    setIsHistoryOpen(false);
  }, [location.pathname]);

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-2xl bg-[#07040f]/80 border-b border-purple-900/30 shadow-[0_4px_30px_rgba(0,0,0,0.6)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">

        {/* Brand Logo */}
        <div className="flex items-center gap-6 shrink-0">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 p-[1px] shadow-purple-glow">
              <div className="w-full h-full bg-[#0d081e] backdrop-blur-md rounded-[11px] flex items-center justify-center text-purple-400 group-hover:text-white transition-colors">
                <Layers className="w-4 h-4" />
              </div>
            </div>
            <span className="font-bold text-base tracking-tight text-white group-hover:text-purple-300 transition-colors font-display">
              Aura<span className="text-purple-400">Link</span>
            </span>
          </Link>

          {/* Desktop Navigation Glass Pills */}
          <nav className="hidden md:flex items-center gap-1.5 text-xs font-medium text-purple-200/70">
            <Link
              to="/"
              className={`px-3 py-1.5 rounded-xl backdrop-blur-md transition-all ${isActive('/')
                  ? 'bg-purple-600/20 text-purple-200 border border-purple-500/40 shadow-sm font-semibold'
                  : 'hover:text-white hover:bg-purple-900/20'
                }`}
            >
              Explore
            </Link>

            <Link
              to="/collections"
              className={`px-3 py-1.5 rounded-xl backdrop-blur-md transition-all ${isActive('/collections')
                  ? 'bg-purple-600/20 text-purple-200 border border-purple-500/40 shadow-sm font-semibold'
                  : 'hover:text-white hover:bg-purple-900/20'
                }`}
            >
              Vaults
            </Link>

            <Link
              to="/privacy"
              className={`px-3 py-1.5 rounded-xl backdrop-blur-md transition-all ${isActive('/privacy')
                  ? 'bg-purple-600/20 text-purple-200 border border-purple-500/40 shadow-sm font-semibold'
                  : 'hover:text-white hover:bg-purple-900/20'
                }`}
            >
              Safety
            </Link>

            <Link
              to="/share-target"
              className={`px-3 py-1.5 rounded-xl backdrop-blur-md transition-all flex items-center gap-1.5 ${isActive('/share-target')
                  ? 'bg-purple-600/20 text-purple-200 border border-purple-500/40 shadow-sm font-semibold'
                  : 'hover:text-purple-300 hover:bg-purple-900/20 text-purple-300/80'
                }`}
            >
              <Share2 className="w-3.5 h-3.5 text-purple-400" />
              <span>Share Target</span>
            </Link>
          </nav>
        </div>

        {/* Global Glass Search Bar with History Dropdown */}
        <div ref={searchContainerRef} className="hidden md:flex flex-1 max-w-md relative">
          <form onSubmit={handleSearchSubmit} className="w-full relative">
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search links, tags, domains (Alt+O)..."
              value={searchQuery}
              onFocus={() => setIsHistoryOpen(true)}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#0d081e]/80 backdrop-blur-xl text-xs text-slate-100 placeholder-purple-300/40 pl-9 pr-16 py-2 rounded-xl border border-purple-900/30 hover:border-purple-500/30 focus:border-purple-500 outline-none transition-all shadow-inner"
            />
            <Search className="w-3.5 h-3.5 text-purple-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />

            {/* Shortcut Badge */}
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-purple-950/60 border border-purple-800/40 text-[10px] font-mono text-purple-300/70 pointer-events-none">
              <span>Alt+O</span>
            </div>
          </form>

          {/* Glass Search History & Quick Suggestions Dropdown */}
          <AnimatePresence>
            {isHistoryOpen && (
              <motion.div
                initial={{ opacity: 0, y: 6, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 6, scale: 0.98 }}
                transition={{ duration: 0.15 }}
                className="absolute top-full left-0 right-0 mt-2 bg-[#0d081e]/95 backdrop-blur-2xl rounded-2xl border border-purple-800/40 shadow-2xl p-3 z-50 text-left space-y-3"
              >
                {searchHistory.length > 0 ? (
                  <>
                    <div className="flex items-center justify-between px-1 text-xs text-purple-300/70">
                      <span className="flex items-center gap-1.5 font-medium text-purple-200">
                        <Clock className="w-3.5 h-3.5 text-purple-400" />
                        <span>Recent Searches</span>
                      </span>
                      <button
                        onClick={clearAllHistory}
                        className="text-[11px] text-purple-400/60 hover:text-rose-400 transition-colors cursor-pointer"
                      >
                        Clear All
                      </button>
                    </div>

                    <div className="space-y-1 max-h-48 overflow-y-auto scrollbar-none">
                      {searchHistory.map((item, idx) => (
                        <div
                          key={idx}
                          onClick={() => handleSelectHistoryItem(item)}
                          className="flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-purple-900/30 text-xs text-slate-200 cursor-pointer group transition-colors"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <Clock className="w-3 h-3 text-purple-400/60 group-hover:text-purple-300 shrink-0" />
                            <span className="truncate">{item}</span>
                          </div>
                          <button
                            onClick={(e) => removeHistoryItem(e, item)}
                            title="Remove from history"
                            className="p-1 text-purple-400/60 hover:text-white rounded hover:bg-purple-800/40 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="py-2 text-center text-xs text-purple-300/70 space-y-1">
                    <p className="text-purple-200 font-medium">No recent searches</p>
                    <p className="text-[11px] text-purple-400/60">Type keywords, tags, or topics above</p>
                  </div>
                )}

                {/* Popular Tags Quick Navigation */}
                <div className="pt-2 border-t border-purple-900/30">
                  <p className="text-[11px] text-purple-300/70 font-medium px-1 mb-1.5 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-purple-400" /> Suggested topics:
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {['ai', 'developer-tools', 'design', 'react', 'music', 'shaders'].map((tag) => (
                      <button
                        key={tag}
                        onClick={() => handleSelectHistoryItem(tag)}
                        className="px-2 py-0.5 rounded-md bg-purple-950/50 hover:bg-purple-700/40 hover:text-purple-200 text-purple-300/80 border border-purple-800/40 text-xs transition-colors cursor-pointer"
                      >
                        #{tag}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Actions & User Control Hub */}
        <div className="flex items-center gap-2.5">
          {/* Incognito Stealth Mode Toggle Button */}
          <button
            onClick={toggleIncognito}
            title={isIncognito ? "Incognito Active: 18+ Channels Unlocked (Alt+I)" : "Safe Browsing Active: Click to unlock Incognito / 18+ mode (Alt+I)"}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium backdrop-blur-md transition-all cursor-pointer border ${isIncognito
                ? 'bg-purple-950/60 text-purple-200 border-purple-500/60 shadow-purple-glow'
                : 'bg-[#0d081e] hover:bg-purple-950/30 text-purple-200/80 border-purple-900/40'
              }`}
          >
            {isIncognito ? (
              <>
                <Ghost className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
                <span className="hidden sm:inline">Incognito: <strong className="text-purple-300">ON</strong></span>
              </>
            ) : (
              <>
                <Shield className="w-3.5 h-3.5 text-purple-400/70" />
                <span className="hidden sm:inline text-purple-300/70">Safe Mode</span>
              </>
            )}
          </button>

          {/* Submit Action Button */}
          <button
            onClick={onOpenSubmitModal}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-medium bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-purple-glow transition-all cursor-pointer shrink-0"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span className="hidden sm:inline">Submit Link</span>
            <span className="sm:hidden">Submit</span>
          </button>

          {/* User Account Session */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 p-1 rounded-xl border border-purple-900/40 hover:border-purple-500/50 transition-colors bg-[#0d081e] backdrop-blur-md cursor-pointer"
              >
                <div className="w-7 h-7 rounded-lg bg-purple-600/30 text-purple-300 flex items-center justify-center text-xs font-semibold">
                  {user.username.charAt(0).toUpperCase()}
                </div>
              </button>

              {/* User Dropdown */}
              <AnimatePresence>
                {userDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 6, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 6, scale: 0.96 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-56 bg-[#0d081e]/95 backdrop-blur-2xl rounded-2xl py-2 shadow-2xl border border-purple-800/40 z-50 text-left"
                  >
                    <div className="px-4 py-2 border-b border-purple-900/30">
                      <p className="text-xs font-semibold text-white">@{user.username}</p>
                      <p className="text-[11px] text-purple-300/60 truncate">{user.email}</p>
                      <span className="inline-block mt-1 px-1.5 py-0.5 rounded text-[9px] font-mono font-semibold bg-purple-950/60 text-purple-300 border border-purple-800/40 uppercase">
                        {user.role}
                      </span>
                    </div>

                    <Link
                      to="/profile"
                      className="flex items-center gap-2.5 px-4 py-2 text-xs text-slate-200 hover:bg-purple-900/30 transition-colors"
                    >
                      <User className="w-3.5 h-3.5 text-purple-400" />
                      <span>Saved Links</span>
                    </Link>

                    {(user.role === 'ADMIN' || user.role === 'MODERATOR') && (
                      <Link
                        to="/admin"
                        className="flex items-center gap-2.5 px-4 py-2 text-xs text-amber-300 hover:bg-amber-500/10 transition-colors"
                      >
                        <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                        <span>Admin Console</span>
                      </Link>
                    )}

                    <button
                      onClick={() => {
                        logout();
                        setUserDropdownOpen(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-rose-400 hover:bg-rose-950/30 transition-colors cursor-pointer text-left"
                    >
                      <LogOut className="w-3.5 h-3.5 text-rose-400" />
                      <span>Sign Out</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <div className="hidden sm:flex items-center gap-1.5">
              <button
                onClick={() => onOpenAuthModal('login')}
                className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-purple-200/80 hover:text-white hover:bg-purple-900/30 transition-colors cursor-pointer"
              >
                Sign In
              </button>
              <button
                onClick={() => onOpenAuthModal('register')}
                className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-purple-600/30 hover:bg-purple-600/50 text-purple-200 border border-purple-500/40 transition-colors cursor-pointer"
              >
                Register
              </button>
            </div>
          )}

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-1.5 text-purple-300 hover:text-white cursor-pointer"
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
            className="md:hidden px-4 pt-2 pb-5 border-t border-purple-900/30 bg-[#07040f]/95 backdrop-blur-2xl space-y-3 text-left"
          >
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                placeholder="Search links, tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#0d081e] text-xs text-slate-100 placeholder-purple-300/40 pl-8 pr-4 py-2 rounded-xl border border-purple-900/40 focus:border-purple-500 outline-none"
              />
              <Search className="w-3.5 h-3.5 text-purple-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            </form>

            <div className="flex flex-col gap-1 text-xs font-medium text-purple-200/80">
              <Link to="/" className="flex items-center gap-2 px-2.5 py-2 rounded-lg hover:bg-purple-900/20">
                <Compass className="w-4 h-4 text-purple-400" />
                <span>Explore</span>
              </Link>
              <Link to="/collections" className="flex items-center gap-2 px-2.5 py-2 rounded-lg hover:bg-purple-900/20">
                <FolderHeart className="w-4 h-4 text-purple-400" />
                <span>Vaults</span>
              </Link>
              <Link to="/privacy" className="flex items-center gap-2 px-2.5 py-2 rounded-lg hover:bg-purple-900/20">
                <ShieldCheck className="w-4 h-4 text-purple-400" />
                <span>Safety & Protocols</span>
              </Link>
              <Link to="/share-target" className="flex items-center gap-2 px-2.5 py-2 rounded-lg bg-purple-600/15 text-purple-200 border border-purple-500/30">
                <Share2 className="w-4 h-4 text-purple-400" />
                <span>Web Share Target</span>
              </Link>
              {!user && (
                <div className="flex gap-2 pt-2 border-t border-purple-900/30">
                  <button
                    onClick={() => { onOpenAuthModal('login'); setMobileMenuOpen(false); }}
                    className="flex-1 py-1.5 rounded-lg bg-[#0d081e] text-xs font-medium text-purple-200 border border-purple-900/40"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => { onOpenAuthModal('register'); setMobileMenuOpen(false); }}
                    className="flex-1 py-1.5 rounded-lg bg-purple-600 text-xs font-medium text-white shadow-purple-glow"
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

