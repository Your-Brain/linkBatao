import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import { ResourceGrid } from '../components/resources/ResourceGrid';
import { User, Bookmark, Send, Sparkles, Layers } from 'lucide-react';

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
      <div className="max-w-md mx-auto py-20 px-4 text-center space-y-4 bg-zinc-900 rounded-3xl border border-zinc-800 p-8 shadow-sm">
        <h2 className="text-lg font-semibold text-white">Sign In Required</h2>
        <p className="text-xs text-zinc-400">Please sign in to view your saved bookmarks and submitted links.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-left">
      
      {/* Profile Header */}
      <div className="bg-zinc-900 rounded-3xl p-6 sm:p-8 border border-zinc-800 flex flex-col sm:flex-row items-center gap-6 shadow-sm">
        <div className="w-16 h-16 rounded-2xl bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-2xl font-bold text-indigo-300 shrink-0">
          {user.username.charAt(0).toUpperCase()}
        </div>

        <div className="space-y-1.5 flex-1 text-center sm:text-left">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <h1 className="font-bold text-2xl text-white">@{user.username}</h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-zinc-800 text-zinc-300 uppercase border border-zinc-700">
              {user.role}
            </span>
          </div>
          <p className="text-xs text-zinc-400">{user.email}</p>
          <p className="text-xs text-zinc-300 pt-0.5">{user.bio || 'Curator on AuraLink'}</p>
        </div>

        {/* Quick Stats Widget */}
        <div className="flex items-center gap-4 bg-zinc-950 px-4 py-3 rounded-2xl border border-zinc-800 shrink-0">
          <div className="text-center">
            <p className="text-base font-bold text-indigo-400">{savedResources.length}</p>
            <p className="text-[10px] text-zinc-500 uppercase">Saved</p>
          </div>
          <div className="w-[1px] h-8 bg-zinc-800" />
          <div className="text-center">
            <p className="text-base font-bold text-zinc-200">{submissions.length}</p>
            <p className="text-[10px] text-zinc-500 uppercase">Submitted</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-zinc-800 pb-3">
        <button
          onClick={() => setActiveTab('saved')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
            activeTab === 'saved'
              ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/40 shadow-sm font-semibold'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <Bookmark className="w-3.5 h-3.5 text-indigo-400" />
          <span>Saved Links ({savedResources.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('submissions')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
            activeTab === 'submissions'
              ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/40 shadow-sm font-semibold'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <Send className="w-3.5 h-3.5 text-indigo-400" />
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

