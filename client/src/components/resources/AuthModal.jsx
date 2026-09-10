import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { X, LogIn, UserPlus, Mail, Lock, User, Sparkles, ShieldCheck } from 'lucide-react';

export const AuthModal = ({ isOpen, onClose, initialMode = 'login' }) => {
  const { login, register } = useAuth();
  const [mode, setMode] = useState(initialMode); // 'login' or 'register'
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    let success = false;
    if (mode === 'login') {
      success = await login(email, password);
    } else {
      success = await register(username, email, password);
    }

    setLoading(false);
    if (success) {
      onClose();
      setUsername('');
      setEmail('');
      setPassword('');
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-[#07040f]/85 backdrop-blur-xl">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 6 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 6 }}
        transition={{ duration: 0.15 }}
        className="relative w-full max-w-md bg-[#0d081e] rounded-3xl p-6 sm:p-8 shadow-2xl border border-purple-900/40 text-left hud-bracket"
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-purple-300 hover:text-white rounded-xl bg-[#140d2e] border border-purple-900/40 hover:border-purple-500/50 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Brand Icon & Heading */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 p-[1px] shadow-[0_0_15px_rgba(147,51,234,0.35)] flex items-center justify-center">
            <div className="w-full h-full bg-[#0d081e] rounded-[15px] flex items-center justify-center text-purple-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          <div>
            <h2 className="font-display font-bold text-lg text-white">AuraLink Node Access</h2>
            <p className="text-[11px] font-mono text-purple-300/70">Encrypted session authentication</p>
          </div>
        </div>

        {/* Header Tabs */}
        <div className="flex items-center gap-6 mb-6 border-b border-purple-900/30 pb-3">
          <button
            type="button"
            onClick={() => setMode('login')}
            className={`font-mono text-xs font-semibold pb-1 transition-all cursor-pointer ${
              mode === 'login'
                ? 'text-purple-300 border-b-2 border-purple-500 font-bold'
                : 'text-purple-400/60 hover:text-purple-200'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => setMode('register')}
            className={`font-mono text-xs font-semibold pb-1 transition-all cursor-pointer ${
              mode === 'register'
                ? 'text-purple-300 border-b-2 border-purple-500 font-bold'
                : 'text-purple-400/60 hover:text-purple-200'
            }`}
          >
            Create Account
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <div>
              <label className="block text-xs font-mono font-semibold text-purple-200 mb-1.5">
                Username *
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="e.g. alex_curator"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-[#090515] text-xs font-mono text-purple-100 placeholder-purple-400/40 pl-10 pr-4 py-2.5 rounded-xl border border-purple-900/40 focus:border-purple-500 focus:ring-1 focus:ring-purple-500/30 outline-none transition-colors"
                />
                <User className="w-4 h-4 text-purple-400/60 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-mono font-semibold text-purple-200 mb-1.5">
              Email Address *
            </label>
            <div className="relative">
              <input
                type="email"
                required
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#090515] text-xs font-mono text-purple-100 placeholder-purple-400/40 pl-10 pr-4 py-2.5 rounded-xl border border-purple-900/40 focus:border-purple-500 focus:ring-1 focus:ring-purple-500/30 outline-none transition-colors"
              />
              <Mail className="w-4 h-4 text-purple-400/60 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono font-semibold text-purple-200 mb-1.5">
              Password *
            </label>
            <div className="relative">
              <input
                type="password"
                required
                minLength={6}
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#090515] text-xs font-mono text-purple-100 placeholder-purple-400/40 pl-10 pr-4 py-2.5 rounded-xl border border-purple-900/40 focus:border-purple-500 focus:ring-1 focus:ring-purple-500/30 outline-none transition-colors"
              />
              <Lock className="w-4 h-4 text-purple-400/60 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-mono font-bold text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(147,51,234,0.35)] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {mode === 'login' ? (
              <>
                <LogIn className="w-4 h-4" />
                <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4" />
                <span>{loading ? 'Registering...' : 'Create Account'}</span>
              </>
            )}
          </motion.button>
        </form>

        <p className="text-[11px] font-mono text-purple-400/60 mt-4 text-center">
          Zero logs tracking policy. Guarded by AuraLink.
        </p>

      </motion.div>
    </div>,
    document.body
  );
};
