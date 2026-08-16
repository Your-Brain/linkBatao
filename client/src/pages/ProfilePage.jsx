import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import { ResourceGrid } from '../components/resources/ResourceGrid';
import { User, Bookmark, Send, ShieldCheck, Sparkles, Radio, Layers } from 'lucide-react';

export const ProfilePage = ({ refreshKey = 0, onReportResource, onAddToCollection }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('saved');
  const [savedResources, setSavedResources] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return;
      setLoading(true);
      try {
        const meRes = await API.get('/auth/me');
        if (meRes.data.success) {
          setSavedResources(meRes.data.user.savedResources || []);
        }

        // Fetch submissions
        const subRes = await API.get('/resources?limit=50');
        if (subRes.data.success) {
          const userSubs = subRes.data.data.filter(
            r => r.submittedBy && r.submittedBy._id === user._id
          );
          setSubmissions(userSubs);
        }
      } catch (err) {
        console.error('[ProfilePage] Failed to fetch user profile data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user, refreshKey]);

  if (!user) {
    return (
      <div className="max-w-md mx-auto py-20 px-4 text-center space-y-4 glass-panel rounded-3xl border border-slate-800 p-8 hud-bracket">
        <h2 className="font-display text-xl font-bold text-white">Transmission Restricted</h2>
        <p className="text-xs text-slate-400">Authenticate session to inspect your operator console and vaulted signals.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-left">
      
      {/* Profile Operator Header */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-cyan-500/25 flex flex-col sm:flex-row items-center gap-6 hud-bracket">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-cyan-500 to-sky-600 p-[1.5px] shadow-glow shrink-0">
          <div className="w-full h-full bg-[#050811] rounded-[14px] flex items-center justify-center text-2xl font-bold text-cyan-300">
            {user.username.charAt(0).toUpperCase()}
          </div>
        </div>

        <div className="space-y-1.5 flex-1 text-center sm:text-left">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <h1 className="font-display font-bold text-2xl text-white">@{user.username}</h1>
            <span className="px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 uppercase border border-cyan-500/30">
              OPERATOR // {user.role}
            </span>
          </div>
          <p className="text-xs font-mono text-slate-400">{user.email}</p>
          <p className="text-xs text-slate-300 pt-0.5">{user.bio || 'Link & Signal Telemetry Operator on AuraLink'}</p>
        </div>

        {/* Quick Operator Stats Widget */}
        <div className="flex items-center gap-4 bg-[#090e1d] px-4 py-3 rounded-2xl border border-slate-800 shrink-0">
          <div className="text-center">
            <p className="text-base font-bold font-mono text-cyan-300">{savedResources.length}</p>
            <p className="text-[10px] font-mono text-slate-500 uppercase">Bookmarked</p>
          </div>
          <div className="w-[1px] h-8 bg-slate-800" />
          <div className="text-center">
            <p className="text-base font-bold font-mono text-sky-300">{submissions.length}</p>
            <p className="text-[10px] font-mono text-slate-500 uppercase">Transmitted</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab('saved')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-semibold transition-all cursor-pointer ${
            activeTab === 'saved'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Bookmark className="w-3.5 h-3.5 text-cyan-400" />
          <span>Vaulted Signals ({savedResources.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('submissions')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-semibold transition-all cursor-pointer ${
            activeTab === 'submissions'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Send className="w-3.5 h-3.5 text-sky-400" />
          <span>Transmissions ({submissions.length})</span>
        </button>
      </div>

      {/* Grid Content */}
      <ResourceGrid
        resources={activeTab === 'saved' ? savedResources : submissions}
        loading={loading}
        onReport={onReportResource}
        onAddToCollection={onAddToCollection}
      />

    </div>
  );
};
