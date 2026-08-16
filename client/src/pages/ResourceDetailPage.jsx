import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { EmbeddedPlayer } from '../components/resources/EmbeddedPlayer';
import { ResourceCard } from '../components/resources/ResourceCard';
import { EditResourceModal } from '../components/resources/EditResourceModal';
import { ExternalLink, Bookmark, Share2, Flag, Eye, EyeOff, Edit3, Trash2, ShieldAlert, Tag, Globe, Sparkles, FolderPlus, Copy, Check } from 'lucide-react';

export const ResourceDetailPage = ({ onReportResource, onAddToCollection }) => {
  const { id } = useParams();
  const { user, savedIds, toggleSaveResource } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [resource, setResource] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCopiedUrl, setIsCopiedUrl] = useState(false);

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

  useEffect(() => {
    fetchResource();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [id]);

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

  const isAdminOrMod = user && (user.role === 'ADMIN' || user.role === 'MODERATOR');
  const isOwner = user && resource.submittedBy && (resource.submittedBy._id === user._id || resource.submittedBy === user._id);
  const canManage = isAdminOrMod || isOwner;

  const isSaved = savedIds.has(resource._id);
  const isHidden = resource.status === 'REMOVED' || resource.status === 'REJECTED';

  const handleCopyDirectUrl = () => {
    const directUrl = resource.url || window.location.href;
    navigator.clipboard.writeText(directUrl);
    setIsCopiedUrl(true);
    showToast('Direct URL copied to clipboard!', 'success');
    setTimeout(() => setIsCopiedUrl(false), 2000);
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    showToast('Page link copied to clipboard!', 'info');
  };

  const handleToggleHide = async () => {
    const newStatus = isHidden ? 'APPROVED' : 'REMOVED';
    try {
      const res = await API.patch(`/admin/resources/${resource._id}`, { status: newStatus });
      if (res.data.success) {
        showToast(`Resource is now ${newStatus === 'APPROVED' ? 'Visible' : 'Hidden'}`, 'success');
        setResource({ ...resource, status: newStatus });
      }
    } catch (err) {
      showToast('Failed to update resource visibility', 'error');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete "${resource.title}"?`)) return;

    try {
      const endpoint = isAdminOrMod ? `/admin/resources/${resource._id}` : `/resources/${resource._id}`;
      const res = await API.delete(endpoint);
      if (res.data.success) {
        showToast('Resource deleted successfully', 'success');
        navigate('/');
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to delete resource', 'error');
    }
  };

  const getCategoryName = (cat) => {
    if (!cat) return null;
    if (typeof cat === 'object' && cat.name) return cat.name;
    if (typeof cat === 'string' && !cat.match(/^[0-9a-fA-F]{24}$/)) {
      return cat.charAt(0).toUpperCase() + cat.slice(1);
    }
    return null;
  };

  const categoryName = getCategoryName(resource.category);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">

      {/* Admin / Owner Controls Banner */}
      {canManage && (
        <div className="glass-panel p-4 rounded-2xl border border-amber-500/30 flex flex-wrap items-center justify-between gap-4 text-left">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0" />
            <div>
              <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider">
                {isAdminOrMod ? 'Moderator & Admin Controls' : 'Owner Actions'}
              </h4>
              <p className="text-[11px] text-slate-400">
                Current Status: <strong className={isHidden ? 'text-rose-400' : 'text-emerald-400'}>{resource.status}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="px-3 py-1.5 rounded-lg bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-500/40 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit Link</span>
            </button>

            {isAdminOrMod && (
              <button
                onClick={handleToggleHide}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors flex items-center gap-1.5 cursor-pointer ${isHidden
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30'
                    : 'bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30'
                  }`}
              >
                {isHidden ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                <span>{isHidden ? 'Unhide (Show to Users)' : 'Hide from Users'}</span>
              </button>
            )}

            <button
              onClick={handleDelete}
              className="px-3 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Link</span>
            </button>
          </div>
        </div>
      )}

      {/* Top Media Player Section */}
      <EmbeddedPlayer resource={resource} />

      {/* Main Content Details Panel */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-slate-800 space-y-6">

        {/* Title & Domain Header */}
        <div className="space-y-3 text-left">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {categoryName && (
              <span className="px-3 py-1 rounded-full bg-sky-500/10 text-sky-300 font-semibold border border-sky-500/20 uppercase tracking-wider">
                {categoryName}
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

          {/* Copy Direct Resource URL */}
          <button
            onClick={handleCopyDirectUrl}
            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
              isCopiedUrl
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                : 'bg-dark-800 text-slate-300 border-slate-700 hover:border-sky-400 hover:text-sky-300'
            }`}
          >
            {isCopiedUrl ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span>{isCopiedUrl ? 'URL Copied!' : 'Copy Direct URL'}</span>
          </button>

          <button
            onClick={() => toggleSaveResource(resource._id)}
            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${isSaved
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
            <span>Share Page</span>
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

      {/* Edit Modal */}
      <EditResourceModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        resource={resource}
        onResourceUpdated={(updated) => {
          setResource(updated);
        }}
      />

    </div>
  );
};
