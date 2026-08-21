import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import API from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useIncognito } from '../../context/IncognitoContext';
import { EditResourceModal } from './EditResourceModal';
import {
  Play,
  Bookmark,
  Share2,
  Flag,
  Eye,
  EyeOff,
  Edit3,
  Trash2,
  Video,
  FileText,
  Image as ImageIcon,
  Globe,
  Music,
  FolderPlus,
  ShieldAlert,
  Copy,
  Check,
  Ghost
} from 'lucide-react';

export const ResourceCard = ({ resource: initialResource, onReport, onAddToCollection, onResourceDeleted }) => {
  const { user, savedIds, toggleSaveResource } = useAuth();
  const { showToast } = useToast();
  const { isAdultResource, blurNsfw } = useIncognito();

  const [resource, setResource] = useState(initialResource);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleted, setIsDeleted] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isRevealed, setIsRevealed] = useState(false);

  if (!resource || isDeleted) return null;

  const isAdminOrMod = user && (user.role === 'ADMIN' || user.role === 'MODERATOR');
  const isSaved = savedIds.has(resource._id);
  const isHidden = resource.status === 'REMOVED' || resource.status === 'REJECTED';

  const handleCopyUrl = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const urlToCopy = resource.url || `${window.location.origin}/resources/${resource._id}`;
    navigator.clipboard.writeText(urlToCopy);
    setIsCopied(true);
    showToast('Direct URL copied to clipboard!', 'success');
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleShare = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const shareUrl = `${window.location.origin}/resources/${resource._id}`;
    navigator.clipboard.writeText(shareUrl);
    showToast('Resource link copied to clipboard!', 'info');
  };

  const handleSaveToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleSaveResource(resource._id);
  };

  const handleAddToCollection = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onAddToCollection) onAddToCollection(resource);
  };

  const handleReportClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onReport) onReport(resource);
  };

  const handleAdminToggleHide = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    const newStatus = isHidden ? 'APPROVED' : 'REMOVED';
    try {
      const res = await API.patch(`/admin/resources/${resource._id}`, { status: newStatus });
      if (res.data.success) {
        showToast(`Resource set to ${newStatus === 'APPROVED' ? 'Visible' : 'Hidden'}`, 'success');
        setResource({ ...resource, status: newStatus });
      }
    } catch (err) {
      showToast('Failed to update resource status', 'error');
    }
  };

  const handleAdminDelete = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!window.confirm(`Admin Action: Permanently delete "${resource.title}"?`)) return;

    try {
      const res = await API.delete(`/admin/resources/${resource._id}`);
      if (res.data.success) {
        showToast('Resource deleted by Admin', 'success');
        setIsDeleted(true);
        if (onResourceDeleted) onResourceDeleted(resource._id);
      }
    } catch (err) {
      showToast('Failed to delete resource', 'error');
    }
  };

  const renderResourceTypeIcon = (type) => {
    switch (type) {
      case 'VIDEO': return <Video className="w-3 h-3 text-cyan-400" />;
      case 'IMAGE': return <ImageIcon className="w-3 h-3 text-emerald-400" />;
      case 'ARTICLE': return <FileText className="w-3 h-3 text-amber-400" />;
      case 'AUDIO': return <Music className="w-3 h-3 text-purple-400" />;
      default: return <Globe className="w-3 h-3 text-sky-400" />;
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

  const isAdult = isAdultResource(resource);
  const isBlurred = isAdult && blurNsfw && !isRevealed;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`glass-card rounded-2xl overflow-hidden flex flex-col justify-between group h-full border text-left hud-bracket ${
        isHidden
          ? 'border-rose-500/40 bg-rose-950/10'
          : isAdult
          ? 'border-purple-500/30 hover:border-purple-400/60'
          : 'border-slate-800 hover:border-cyan-500/40'
      }`}
    >
      {/* Card Header & Thumbnail */}
      <Link to={`/resources/${resource._id}`} className="block relative aspect-video w-full overflow-hidden bg-[#03050a]">
        {resource.thumbnail ? (
          <img
            src={resource.thumbnail}
            alt={resource.title}
            className={`w-full h-full object-cover group-hover:scale-105 transition-all duration-500 opacity-90 group-hover:opacity-100 ${
              isBlurred ? 'blur-lg scale-110 opacity-40' : ''
            }`}
            onError={(e) => {
              e.target.src = `https://www.google.com/s2/favicons?domain=${resource.domain}&sz=128`;
            }}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-[#090e1d] to-[#0e1529] p-4 text-center">
            <Globe className="w-8 h-8 text-cyan-400/50 mb-1" />
            <span className="text-[11px] font-mono font-medium text-slate-400 truncate max-w-[150px]">{resource.domain}</span>
          </div>
        )}

        {/* Top Badges Overlay */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none z-10">
          <div className="flex items-center gap-1.5">
            <span className="px-2 py-0.5 rounded-lg bg-[#050811]/90 backdrop-blur-md text-[9px] font-mono font-bold text-cyan-300 border border-cyan-400/25 uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
              {renderResourceTypeIcon(resource.resourceType)}
              <span>{resource.resourceType}</span>
            </span>

            {isAdult && (
              <span className="px-2 py-0.5 rounded-lg bg-purple-950/90 backdrop-blur-md text-[9px] font-mono font-bold text-purple-300 border border-purple-500/40 uppercase tracking-wider shadow-sm">
                18+ NSFW
              </span>
            )}
          </div>

          {categoryName && (
            <span className="px-2 py-0.5 rounded-lg bg-[#050811]/90 backdrop-blur-md text-[9px] font-mono text-slate-300 border border-slate-700/80">
              {categoryName}
            </span>
          )}
        </div>

        {/* 18+ Sensitive Blur Overlay */}
        {isBlurred && (
          <div className="absolute inset-0 z-20 bg-[#03050a]/80 backdrop-blur-sm flex flex-col items-center justify-center p-3 text-center pointer-events-auto">
            <span className="px-2.5 py-1 rounded-lg bg-purple-500/20 text-purple-300 border border-purple-500/40 text-[10px] font-mono font-bold uppercase tracking-wider mb-2 flex items-center gap-1 shadow-sm">
              <Ghost className="w-3 h-3 text-purple-400" />
              <span>18+ Sensitive Media</span>
            </span>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsRevealed(true);
              }}
              className="px-3 py-1 rounded-lg bg-dark-800 hover:bg-dark-700 text-slate-200 border border-slate-700 text-[10px] font-mono font-semibold transition-colors cursor-pointer flex items-center gap-1 shadow-md"
            >
              <Eye className="w-3 h-3 text-cyan-400" />
              <span>Click to Reveal</span>
            </button>
          </div>
        )}

        {/* Status Hidden Overlay */}
        {isHidden && (
          <div className="absolute inset-0 bg-dark-950/80 backdrop-blur-xs flex items-center justify-center pointer-events-none">
            <span className="px-3 py-1 rounded-lg bg-rose-500/90 text-white font-bold text-[10px] uppercase font-mono tracking-wider shadow-lg flex items-center gap-1">
              <EyeOff className="w-3 h-3" />
              <span>Hidden / Removed</span>
            </span>
          </div>
        )}

        {/* Play Overlay for Videos */}
        {resource.embedType !== 'NONE' && !isHidden && !isBlurred && (
          <div className="absolute inset-0 bg-dark-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <div className="w-10 h-10 rounded-full bg-cyan-400 text-slate-950 flex items-center justify-center shadow-glow transform scale-90 group-hover:scale-100 transition-transform">
              <Play className="w-4 h-4 fill-current ml-0.5" />
            </div>
          </div>
        )}
      </Link>

      {/* Card Content Body */}
      <div className="p-4 space-y-3 flex-1 flex flex-col justify-between text-left">
        <div className="space-y-2">
          {/* Domain & Quick Copy Pill */}
          <div className="flex items-center justify-between gap-2 text-xs text-slate-400 font-medium">
            <div className="flex items-center gap-1.5 min-w-0">
              <img
                src={`https://www.google.com/s2/favicons?domain=${resource.domain}&sz=64`}
                alt=""
                className="w-3.5 h-3.5 rounded-full shrink-0"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
              <span className="truncate text-slate-300 font-mono text-[11px]">{resource.domain}</span>
            </div>

            {/* Quick 1-click Direct URL copy */}
            <button
              onClick={handleCopyUrl}
              title={isCopied ? 'Direct URL Copied!' : 'Copy Direct Resource URL'}
              className={`flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono font-medium border transition-all cursor-pointer ${
                isCopied
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  : 'bg-[#090e1d] hover:bg-cyan-500/20 text-slate-400 hover:text-cyan-300 border-slate-800'
              }`}
            >
              {isCopied ? <Check className="w-2.5 h-2.5 text-emerald-400" /> : <Copy className="w-2.5 h-2.5" />}
              <span>{isCopied ? 'Copied' : 'Copy URL'}</span>
            </button>
          </div>

          {/* Title */}
          <Link to={`/resources/${resource._id}`} className="block group-hover:text-cyan-300 transition-colors">
            <h3 className="font-display font-bold text-sm text-slate-100 line-clamp-2 leading-snug">
              {resource.title}
            </h3>
          </Link>

          {/* Description */}
          {resource.description && (
            <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
              {resource.description}
            </p>
          )}

          {/* Tags */}
          {Array.isArray(resource.tags) && resource.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 pt-1">
              {resource.tags.slice(0, 3).map((tag, idx) => (
                <span key={idx} className="text-[10px] text-slate-400 font-mono bg-[#090e1d] px-1.5 py-0.5 rounded border border-slate-800">
                  #{tag}
                </span>
              ))}
              {resource.tags.length > 3 && (
                <span className="text-[9px] text-slate-500 font-mono">+{resource.tags.length - 3}</span>
              )}
            </div>
          )}
        </div>

        {/* ADMIN OVERLAY BAR */}
        {isAdminOrMod && (
          <div className="pt-2 pb-1 border-t border-amber-500/30 bg-amber-500/5 -mx-4 -mb-1 px-4 flex items-center justify-between gap-1 text-[11px]">
            <span className="text-amber-400 font-bold flex items-center gap-1 text-[10px] font-mono">
              <ShieldAlert className="w-3 h-3" />
              <span>Admin:</span>
            </span>

            <div className="flex items-center gap-1">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsEditModalOpen(true);
                }}
                className="px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 hover:bg-sky-500/30 border border-sky-500/40 text-[10px] font-semibold transition-colors flex items-center gap-0.5 cursor-pointer"
                title="Edit Link Details"
              >
                <Edit3 className="w-3 h-3" />
                <span>Edit</span>
              </button>

              <button
                onClick={handleAdminToggleHide}
                className={`px-2 py-0.5 rounded text-[10px] font-semibold border transition-colors flex items-center gap-0.5 cursor-pointer ${
                  isHidden
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30'
                    : 'bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30'
                }`}
                title={isHidden ? 'Unhide Link' : 'Hide Link'}
              >
                {isHidden ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                <span>{isHidden ? 'Unhide' : 'Hide'}</span>
              </button>

              <button
                onClick={handleAdminDelete}
                className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 border border-rose-500/40 text-[10px] font-semibold transition-colors flex items-center gap-0.5 cursor-pointer"
                title="Delete Link"
              >
                <Trash2 className="w-3 h-3" />
                <span>Delete</span>
              </button>
            </div>
          </div>
        )}

        {/* Card Footer Toolbar */}
        <div className="pt-2.5 border-t border-slate-800/80 flex items-center justify-between gap-2 text-xs text-slate-400">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-[11px] font-mono" title="Views">
              <Eye className="w-3.5 h-3.5 text-slate-500" />
              <span>{resource.views || 0}</span>
            </span>
            <span className="flex items-center gap-1 text-[11px] font-mono" title="Saves">
              <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'text-cyan-400 fill-cyan-400' : 'text-slate-500'}`} />
              <span>{resource.saves || 0}</span>
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={handleSaveToggle}
              title={isSaved ? 'Remove Bookmark' : 'Save Bookmark'}
              className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                isSaved
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                  : 'bg-[#090e1d] hover:bg-slate-800 text-slate-400 hover:text-slate-200 border-slate-800'
              }`}
            >
              <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-cyan-300' : ''}`} />
            </button>

            <button
              onClick={handleAddToCollection}
              title="Add to Vault Collection"
              className="p-1.5 rounded-lg bg-[#090e1d] hover:bg-cyan-500/20 text-slate-400 hover:text-cyan-300 border border-slate-800 transition-colors cursor-pointer"
            >
              <FolderPlus className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={handleShare}
              title="Share Link"
              className="p-1.5 rounded-lg bg-[#090e1d] hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 transition-colors cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={handleReportClick}
              title="Report Link"
              className="p-1.5 rounded-lg bg-[#090e1d] hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 border border-slate-800 transition-colors cursor-pointer"
            >
              <Flag className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>

      {/* Admin Edit Modal */}
      <EditResourceModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        resource={resource}
        onResourceUpdated={(updated) => setResource(updated)}
      />
    </motion.div>
  );
};
