import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import { ResourceGrid } from '../components/resources/ResourceGrid';
import { User, Bookmark, Send, Sparkles, Layers, ShieldCheck } from 'lucide-react';

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
      <div className="max-w-md mx-auto py-20 px-4 text-center space-y-4 bg-[#0d081e] rounded-3xl border border-purple-900/40 p-8 shadow-xl hud-bracket">
        <h2 className="text-lg font-display font-semibold text-white">Sign In Required</h2>
        <p className="text-xs font-mono text-purple-300/70">Please sign in to view your saved bookmarks and submitted links.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-left">
      
      {/* Profile Header */}
      <div className="bg-[#0d081e] rounded-3xl p-6 sm:p-8 border border-purple-900/40 flex flex-col sm:flex-row items-center gap-6 shadow-xl hud-bracket">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 p-[1px] shadow-[0_0_20px_rgba(147,51,234,0.35)] shrink-0 flex items-center justify-center">
          <div className="w-full h-full bg-[#0d081e] rounded-[15px] flex items-center justify-center text-2xl font-bold font-display text-purple-300">
            {user.username.charAt(0).toUpperCase()}
          </div>
        </div>

        <div className="space-y-1.5 flex-1 text-center sm:text-left">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <h1 className="font-display font-bold text-2xl text-white">@{user.username}</h1>
            <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-mono font-bold bg-[#140d2e] text-purple-300 uppercase border border-purple-900/40">
              {user.role}
            </span>
          </div>
          <p className="text-xs font-mono text-purple-400/70">{user.email}</p>
          <p className="text-xs text-purple-200/80 pt-0.5">{user.bio || 'Curator on AuraLink'}</p>
        </div>

        {/* Quick Stats Widget */}
        <div className="flex items-center gap-4 bg-[#07040f] px-5 py-3.5 rounded-2xl border border-purple-900/40 shrink-0">
          <div className="text-center">
            <p className="text-lg font-bold font-mono text-purple-400">{savedResources.length}</p>
            <p className="text-[10px] font-mono text-purple-400/60 uppercase">Saved</p>
          </div>
          <div className="w-[1px] h-8 bg-purple-900/40" />
          <div className="text-center">
            <p className="text-lg font-bold font-mono text-purple-200">{submissions.length}</p>
            <p className="text-[10px] font-mono text-purple-400/60 uppercase">Submitted</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-purple-900/30 pb-3">
        <button
          onClick={() => setActiveTab('saved')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono transition-all cursor-pointer ${
            activeTab === 'saved'
              ? 'bg-purple-600/25 text-purple-200 border border-purple-500/50 shadow-sm font-bold'
              : 'text-purple-400/70 hover:text-white'
          }`}
        >
          <Bookmark className="w-3.5 h-3.5 text-purple-400" />
          <span>Saved Links ({savedResources.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('submissions')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono transition-all cursor-pointer ${
            activeTab === 'submissions'
              ? 'bg-purple-600/25 text-purple-200 border border-purple-500/50 shadow-sm font-bold'
              : 'text-purple-400/70 hover:text-white'
          }`}
        >
          <Send className="w-3.5 h-3.5 text-purple-400" />
          <span>Submissions ({submissions.length})</span>
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
