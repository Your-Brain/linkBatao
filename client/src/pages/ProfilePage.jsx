import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import { ResourceGrid } from '../components/resources/ResourceGrid';
import { User, Bookmark, Send, ShieldCheck, Sparkles } from 'lucide-react';

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
      <div className="max-w-md mx-auto py-20 px-4 text-center space-y-4">
        <h2 className="text-xl font-bold text-white">Access Restricted</h2>
        <p className="text-sm text-slate-400">Please log in to view your profile and saved bookmarks.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Profile Header */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-sky-500/20 flex flex-col sm:flex-row items-center gap-6 text-left">
        <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-sky-400 to-cyan-500 p-1 shadow-glow shrink-0">
          <div className="w-full h-full bg-dark-900 rounded-full flex items-center justify-center text-2xl font-extrabold text-sky-300">
            {user.username.charAt(0).toUpperCase()}
          </div>
        </div>

        <div className="space-y-1 flex-1">
          <div className="flex items-center gap-2">
            <h1 className="font-display font-extrabold text-2xl text-white">@{user.username}</h1>
            <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-sky-500/20 text-sky-300 uppercase border border-sky-500/30">
              {user.role}
            </span>
          </div>
          <p className="text-xs text-slate-400">{user.email}</p>
          <p className="text-xs text-slate-300 pt-1">{user.bio || 'Link Discovery Curator on AuraLink'}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab('saved')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'saved'
              ? 'bg-sky-500/20 text-sky-300 border border-sky-400/40'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Bookmark className="w-4 h-4 text-sky-400" />
          <span>Saved Bookmarks ({savedResources.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('submissions')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'submissions'
              ? 'bg-sky-500/20 text-sky-300 border border-sky-400/40'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Send className="w-4 h-4 text-cyan-400" />
          <span>My Submissions ({submissions.length})</span>
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
