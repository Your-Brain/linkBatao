import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { X, LogIn, UserPlus, Sparkles, Mail, Lock, User, Radio } from 'lucide-react';

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
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-[#03050a]/85 backdrop-blur-xl">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 8 }}
        transition={{ duration: 0.2 }}
        className="relative w-full max-w-md glass-modal rounded-3xl p-6 sm:p-8 shadow-2xl border border-cyan-500/30 text-left hud-bracket"
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 text-slate-400 hover:text-white rounded-xl bg-[#090e1d] border border-slate-800 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header Tabs */}
        <div className="flex items-center gap-4 mb-6 border-b border-slate-800 pb-3">
          <button
            type="button"
            onClick={() => setMode('login')}
            className={`font-display font-bold text-base pb-1 transition-colors cursor-pointer ${
              mode === 'login' ? 'text-cyan-300 border-b-2 border-cyan-400' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            Authenticate Session
          </button>
          <button
            type="button"
            onClick={() => setMode('register')}
            className={`font-display font-bold text-base pb-1 transition-colors cursor-pointer ${
              mode === 'register' ? 'text-cyan-300 border-b-2 border-cyan-400' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            Initialize Operator
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <div>
              <label className="block text-[11px] font-mono font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Operator Handle *
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="Choose public handle (e.g. nova_pilot)"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-[#090e1d] text-xs text-slate-100 placeholder-slate-500 pl-10 pr-4 py-2.5 rounded-xl border border-slate-800 focus:border-cyan-400 outline-none transition-all"
                />
                <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>
          )}

          <div>
            <label className="block text-[11px] font-mono font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Email Address *
            </label>
            <div className="relative">
              <input
                type="email"
                required
                placeholder="operator@network.org"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#090e1d] text-xs text-slate-100 placeholder-slate-500 pl-10 pr-4 py-2.5 rounded-xl border border-slate-800 focus:border-cyan-400 outline-none transition-all"
              />
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-mono font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Secret Passkey *
            </label>
            <div className="relative">
              <input
                type="password"
                required
                minLength={6}
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#090e1d] text-xs text-slate-100 placeholder-slate-500 pl-10 pr-4 py-2.5 rounded-xl border border-slate-800 focus:border-cyan-400 outline-none transition-all"
              />
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading}
            className="w-full mt-4 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-sky-500 text-slate-950 font-bold text-xs font-mono uppercase tracking-wider shadow-glow transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {mode === 'login' ? (
              <>
                <LogIn className="w-4 h-4" />
                <span>{loading ? 'Authenticating...' : 'Establish Session'}</span>
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4" />
                <span>{loading ? 'Registering...' : 'Initialize Account'}</span>
              </>
            )}
          </motion.button>
        </form>

        <p className="text-[10px] font-mono text-slate-500 mt-4 text-center">
          Zero logs policy enabled. Guarded by AuraLink Protocol.
        </p>

      </motion.div>
    </div>,
    document.body
  );
};
