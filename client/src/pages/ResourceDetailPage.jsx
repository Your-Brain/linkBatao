import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { EmbeddedPlayer } from '../components/resources/EmbeddedPlayer';
import { ResourceCard } from '../components/resources/ResourceCard';
import { ExternalLink, Bookmark, Share2, Flag, Eye, Clock, ShieldCheck, Tag, Globe, Sparkles, FolderPlus } from 'lucide-react';

export const ResourceDetailPage = ({ onReportResource, onAddToCollection }) => {
  const { id } = useParams();
  const { savedIds, toggleSaveResource } = useAuth();
  const { showToast } = useToast();

  const [resource, setResource] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResource = async () => {
      setLoading(true);
      try {
        const res = await API.get(`/resources/${id}`);
        if (res.data.success) {
          setResource(res.data.data);
          setRelated(res.data.related || []);
        }
      } catch (err) {
        showToast('Failed to load resource details', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchResource();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [id, showToast]);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-12 space-y-6 animate-pulse">
        <div className="w-full aspect-video bg-slate-800/60 rounded-3xl" />
        <div className="h-8 bg-slate-800/80 rounded w-2/3" />
        <div className="h-4 bg-slate-800/40 rounded w-1/3" />
      </div>
    );
  }

  if (!resource) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold text-white">Resource Not Found</h2>
        <p className="text-slate-400 text-sm">The link or media resource you are looking for does not exist or has been removed.</p>
        <Link to="/" className="inline-block px-5 py-2.5 rounded-xl bg-sky-500 text-slate-950 font-bold text-xs">
          Return to Discovery Engine
        </Link>
      </div>
    );
  }

  const isSaved = savedIds.has(resource._id);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    showToast('Page link copied to clipboard!', 'info');
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      
      {/* Top Media Player Section */}
      <EmbeddedPlayer resource={resource} />

      {/* Main Content Details Panel */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-slate-800 space-y-6">
        
        {/* Title & Domain Header */}
        <div className="space-y-3 text-left">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {resource.category && (
              <span className="px-3 py-1 rounded-full bg-sky-500/10 text-sky-300 font-semibold border border-sky-500/20 uppercase tracking-wider">
                {resource.category.name}
              </span>
            )}
            <span className="px-3 py-1 rounded-full bg-dark-800 text-slate-300 border border-slate-700 font-mono">
              {resource.resourceType}
            </span>
            <span className="text-slate-500">•</span>
            <span className="text-slate-400 flex items-center gap-1 font-medium">
              <Globe className="w-3.5 h-3.5 text-slate-400" />
              {resource.domain}
            </span>
          </div>

          <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-white leading-tight">
            {resource.title}
          </h1>

          <div className="flex items-center gap-4 text-xs text-slate-400 font-medium">
            <span>
              Submitted by: <strong className="text-sky-300">{resource.submittedBy ? `@${resource.submittedBy.username}` : resource.anonymousId}</strong>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Eye className="w-3.5 h-3.5 text-slate-500" />
              {resource.views} views
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Bookmark className="w-3.5 h-3.5 text-slate-500" />
              {resource.saves} saves
            </span>
          </div>
        </div>

        {/* Action Toolbar */}
        <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-b border-slate-800/80 py-4">
          <a
            href={resource.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-cyan-500 text-slate-950 font-bold text-xs shadow-glow hover:scale-105 transition-all"
          >
            <span>Open Original Source</span>
            <ExternalLink className="w-4 h-4" />
          </a>

          <button
            onClick={() => toggleSaveResource(resource._id)}
            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
              isSaved
                ? 'bg-sky-500/20 text-sky-300 border-sky-400/50'
                : 'bg-dark-800 text-slate-300 border-slate-700 hover:border-sky-400'
            }`}
          >
            <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-sky-300' : ''}`} />
            <span>{isSaved ? 'Bookmarked' : 'Save Bookmark'}</span>
          </button>

          <button
            onClick={() => onAddToCollection && onAddToCollection(resource)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-dark-800 text-slate-300 hover:text-cyan-300 border border-slate-700 hover:border-cyan-500/40 text-xs font-semibold transition-colors cursor-pointer"
          >
            <FolderPlus className="w-4 h-4 text-cyan-400" />
            <span>Add to Collection</span>
          </button>

          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-dark-800 text-slate-300 hover:text-white border border-slate-700 hover:border-slate-600 text-xs font-semibold transition-colors cursor-pointer"
          >
            <Share2 className="w-4 h-4" />
            <span>Share</span>
          </button>

          <button
            onClick={() => onReportResource(resource)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-dark-800 text-slate-400 hover:text-rose-300 border border-slate-700 hover:border-rose-500/30 text-xs font-semibold transition-colors ml-auto cursor-pointer"
          >
            <Flag className="w-4 h-4" />
            <span>Report</span>
          </button>
        </div>

        {/* Description */}
        {resource.description && (
          <div className="space-y-2 text-left">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Description</h3>
            <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">
              {resource.description}
            </p>
          </div>
        )}

        {/* Tags */}
        {Array.isArray(resource.tags) && resource.tags.length > 0 && (
          <div className="space-y-2 text-left">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Tag className="w-3.5 h-3.5 text-sky-400" />
              <span>Resource Tags</span>
            </h3>
            <div className="flex flex-wrap gap-2">
              {resource.tags.map((t, idx) => (
                <Link
                  key={idx}
                  to={`/search?q=${encodeURIComponent(t)}`}
                  className="px-3 py-1 rounded-lg bg-dark-800 text-slate-300 hover:text-sky-300 border border-slate-700 text-xs font-mono transition-colors"
                >
                  #{t}
                </Link>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* Related Resources Grid */}
      {related.length > 0 && (
        <div className="space-y-4 text-left">
          <h2 className="font-display font-bold text-xl text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-cyan-400" />
            <span>Related Resources</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {related.map(r => (
              <ResourceCard
                key={r._id}
                resource={r}
                onReport={onReportResource}
                onAddToCollection={onAddToCollection}
              />
            ))}
          </div>
        </div>
      )}

    </div>
  );
};

