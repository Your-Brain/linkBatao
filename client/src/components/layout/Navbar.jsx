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
  ArrowRight
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
    <header className="sticky top-0 z-40 w-full backdrop-blur-2xl bg-zinc-950/75 border-b border-white/[0.08] shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">

        {/* Brand Logo */}
        <div className="flex items-center gap-6 shrink-0">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 p-[1px] shadow-[0_0_15px_rgba(99,102,241,0.35)]">
              <div className="w-full h-full bg-zinc-950/80 backdrop-blur-md rounded-[11px] flex items-center justify-center text-indigo-400 group-hover:text-white transition-colors">
                <Layers className="w-4 h-4" />
              </div>
            </div>
            <span className="font-semibold text-base tracking-tight text-white group-hover:text-indigo-300 transition-colors">
              AuraLink
            </span>
          </Link>

          {/* Desktop Navigation Glass Pills */}
          <nav className="hidden md:flex items-center gap-1.5 text-xs font-medium text-zinc-400">
            <Link
              to="/"
              className={`px-3 py-1.5 rounded-lg backdrop-blur-md transition-all ${isActive('/')
                  ? 'bg-white/[0.1] text-white border border-white/[0.12] shadow-sm'
                  : 'hover:text-white hover:bg-white/[0.05]'
                }`}
            >
              Explore
            </Link>

            <Link
              to="/collections"
              className={`px-3 py-1.5 rounded-lg backdrop-blur-md transition-all ${isActive('/collections')
                  ? 'bg-white/[0.1] text-white border border-white/[0.12] shadow-sm'
                  : 'hover:text-white hover:bg-white/[0.05]'
                }`}
            >
              Vaults
            </Link>

            <Link
              to="/privacy"
              className={`px-3 py-1.5 rounded-lg backdrop-blur-md transition-all ${isActive('/privacy')
                  ? 'bg-white/[0.1] text-white border border-white/[0.12] shadow-sm'
                  : 'hover:text-white hover:bg-white/[0.05]'
                }`}
            >
              Safety
            </Link>
          </nav>
        </div>

        {/* Global Glass Search Bar with History Dropdown */}
        <div ref={searchContainerRef} className="hidden md:flex flex-1 max-w-md relative">
          <form onSubmit={handleSearchSubmit} className="w-full relative">
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search links, tags, domains (Win+O)..."
              value={searchQuery}
              onFocus={() => setIsHistoryOpen(true)}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-900/60 backdrop-blur-xl text-xs text-zinc-100 placeholder-zinc-500 pl-9 pr-16 py-2 rounded-xl border border-white/[0.08] hover:border-white/[0.15] focus:border-indigo-500/80 outline-none transition-all shadow-inner"
            />
            <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />

            {/* Shortcut Badge */}
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-white/[0.06] border border-white/[0.08] text-[10px] font-mono text-zinc-400 pointer-events-none">
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
                className="absolute top-full left-0 right-0 mt-2 bg-zinc-900/90 backdrop-blur-2xl rounded-2xl border border-white/[0.12] shadow-2xl p-3 z-50 text-left space-y-3"
              >
                {searchHistory.length > 0 ? (
                  <>
                    <div className="flex items-center justify-between px-1 text-xs text-zinc-400">
                      <span className="flex items-center gap-1.5 font-medium text-zinc-300">
                        <Clock className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Recent Searches</span>
                      </span>
                      <button
                        onClick={clearAllHistory}
                        className="text-[11px] text-zinc-500 hover:text-rose-400 transition-colors cursor-pointer"
                      >
                        Clear All
                      </button>
                    </div>

                    <div className="space-y-1 max-h-48 overflow-y-auto scrollbar-none">
                      {searchHistory.map((item, idx) => (
                        <div
                          key={idx}
                          onClick={() => handleSelectHistoryItem(item)}
                          className="flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-white/[0.08] text-xs text-zinc-200 cursor-pointer group transition-colors"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <Clock className="w-3 h-3 text-zinc-500 group-hover:text-indigo-400 shrink-0" />
                            <span className="truncate">{item}</span>
                          </div>
                          <button
                            onClick={(e) => removeHistoryItem(e, item)}
                            title="Remove from history"
                            className="p-1 text-zinc-500 hover:text-white rounded hover:bg-white/[0.1] opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="py-2 text-center text-xs text-zinc-400 space-y-1">
                    <p className="text-zinc-300 font-medium">No recent searches</p>
                    <p className="text-[11px] text-zinc-500">Type keywords, tags, or topics above</p>
                  </div>
                )}

                {/* Popular Tags Quick Navigation */}
                <div className="pt-2 border-t border-white/[0.06]">
                  <p className="text-[11px] text-zinc-400 font-medium px-1 mb-1.5 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-indigo-400" /> Suggested topics:
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {['ai', 'developer-tools', 'design', 'react', 'music'].map((tag) => (
                      <button
                        key={tag}
                        onClick={() => handleSelectHistoryItem(tag)}
                        className="px-2 py-0.5 rounded-md bg-white/[0.05] hover:bg-indigo-600/30 hover:text-indigo-200 text-zinc-300 border border-white/[0.08] text-xs transition-colors cursor-pointer"
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
                ? 'bg-purple-950/50 text-purple-200 border-purple-500/50 shadow-[0_0_15px_rgba(168,85,247,0.3)]'
                : 'bg-zinc-900/60 hover:bg-white/[0.08] text-zinc-300 border-white/[0.08]'
              }`}
          >
            {isIncognito ? (
              <>
                <Ghost className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
                <span className="hidden sm:inline">Incognito: <strong className="text-purple-300">ON</strong></span>
              </>
            ) : (
              <>
                <Shield className="w-3.5 h-3.5 text-zinc-400" />
                <span className="hidden sm:inline text-zinc-400">Safe Mode</span>
              </>
            )}
          </button>

          {/* Submit Action Button */}
          <button
            onClick={onOpenSubmitModal}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-medium bg-indigo-600 hover:bg-indigo-500 text-white shadow-[0_0_15px_rgba(99,102,241,0.3)] transition-all cursor-pointer shrink-0"
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
                className="flex items-center gap-2 p-1 rounded-xl border border-white/[0.08] hover:border-white/[0.2] transition-colors bg-zinc-900/60 backdrop-blur-md cursor-pointer"
              >
                <div className="w-7 h-7 rounded-lg bg-indigo-600/30 text-indigo-300 flex items-center justify-center text-xs font-semibold">
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
                    className="absolute right-0 mt-2 w-56 bg-zinc-900/90 backdrop-blur-2xl rounded-2xl py-2 shadow-2xl border border-white/[0.12] z-50 text-left"
                  >
                    <div className="px-4 py-2 border-b border-white/[0.06]">
                      <p className="text-xs font-semibold text-white">@{user.username}</p>
                      <p className="text-[11px] text-zinc-400 truncate">{user.email}</p>
                      <span className="inline-block mt-1 px-1.5 py-0.5 rounded text-[9px] font-mono font-semibold bg-white/[0.08] text-zinc-300 uppercase">
                        {user.role}
                      </span>
                    </div>

                    <Link
                      to="/profile"
                      className="flex items-center gap-2.5 px-4 py-2 text-xs text-zinc-200 hover:bg-white/[0.08] transition-colors"
                    >
                      <User className="w-3.5 h-3.5 text-zinc-400" />
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
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-rose-400 hover:bg-rose-950/20 transition-colors cursor-pointer text-left"
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
                className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-zinc-300 hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer"
              >
                Sign In
              </button>
              <button
                onClick={() => onOpenAuthModal('register')}
                className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-white/[0.1] hover:bg-white/[0.15] text-white border border-white/[0.12] transition-colors cursor-pointer"
              >
                Register
              </button>
            </div>
          )}

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-1.5 text-zinc-400 hover:text-white cursor-pointer"
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
            className="md:hidden px-4 pt-2 pb-5 border-t border-white/[0.08] bg-zinc-950/95 backdrop-blur-2xl space-y-3 text-left"
          >
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                placeholder="Search links, tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-zinc-900/80 text-xs text-zinc-100 placeholder-zinc-500 pl-8 pr-4 py-2 rounded-xl border border-white/[0.08] focus:border-indigo-500 outline-none"
              />
              <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
            </form>

            <div className="flex flex-col gap-1 text-xs font-medium text-zinc-300">
              <Link to="/" className="flex items-center gap-2 px-2.5 py-2 rounded-lg hover:bg-white/[0.06]">
                <Compass className="w-4 h-4 text-zinc-400" />
                <span>Explore</span>
              </Link>
              <Link to="/collections" className="flex items-center gap-2 px-2.5 py-2 rounded-lg hover:bg-white/[0.06]">
                <FolderHeart className="w-4 h-4 text-zinc-400" />
                <span>Vaults</span>
              </Link>
              <Link to="/privacy" className="flex items-center gap-2 px-2.5 py-2 rounded-lg hover:bg-white/[0.06]">
                <ShieldCheck className="w-4 h-4 text-zinc-400" />
                <span>Safety & Protocols</span>
              </Link>
              {!user && (
                <div className="flex gap-2 pt-2 border-t border-white/[0.08]">
                  <button
                    onClick={() => { onOpenAuthModal('login'); setMobileMenuOpen(false); }}
                    className="flex-1 py-1.5 rounded-lg bg-zinc-900 text-xs font-medium text-zinc-200 border border-zinc-800"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => { onOpenAuthModal('register'); setMobileMenuOpen(false); }}
                    className="flex-1 py-1.5 rounded-lg bg-indigo-600 text-xs font-medium text-white shadow-sm"
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

