import React, { useState, useEffect } from 'react';
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

export const ResourceRow = ({ resource: initialResource, onReport, onAddToCollection, onResourceDeleted }) => {
  const { user, savedIds, toggleSaveResource } = useAuth();
  const { showToast } = useToast();
  const { isAdultResource, blurNsfw } = useIncognito();

  const [resource, setResource] = useState(initialResource);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleted, setIsDeleted] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isRevealed, setIsRevealed] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    setResource(initialResource);
    setImageFailed(false);
  }, [initialResource]);

  if (!resource || isDeleted) return null;

  const isAdminOrMod = user && (user.role === 'ADMIN' || user.role === 'MODERATOR');
  const isSaved = savedIds.has(resource._id);
  const isHidden = resource.status === 'REMOVED' || resource.status === 'REJECTED';
  const isAdult = isAdultResource(resource);
  const isBlurred = isAdult && blurNsfw && !isRevealed;

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
      case 'VIDEO': return <Video className="w-3 h-3 text-purple-400" />;
      case 'IMAGE': return <ImageIcon className="w-3 h-3 text-emerald-400" />;
      case 'ARTICLE': return <FileText className="w-3 h-3 text-amber-400" />;
      case 'AUDIO': return <Music className="w-3 h-3 text-indigo-400" />;
      default: return <Globe className="w-3 h-3 text-purple-300" />;
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
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={`glass-card rounded-2xl overflow-hidden p-4 border transition-all flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 text-left group hud-bracket ${isHidden
          ? 'border-rose-500/40 bg-rose-950/10'
          : isAdult
            ? 'border-purple-600/40 hover:border-purple-400/80 shadow-[0_0_15px_rgba(147,51,234,0.15)]'
            : 'border-purple-900/30 hover:border-purple-500/50'
        }`}
    >
      {/* Left Thumbnail Preview */}
      <Link to={`/resources/${resource._id}`} className="w-full sm:w-44 h-28 shrink-0 rounded-xl overflow-hidden bg-[#07040f] relative block">
        {resource.thumbnail && !imageFailed ? (
          <img
            src={resource.thumbnail}
            alt={resource.title}
            className={`w-full h-full object-cover group-hover:scale-105 transition-all duration-500 opacity-90 group-hover:opacity-100 ${isBlurred ? 'blur-lg scale-110 opacity-40' : ''
              }`}
            onError={() => setImageFailed(true)}
          />
        ) : (
          <div className={`w-full h-full flex flex-col items-center justify-center p-2 text-center transition-all ${
            isAdult
              ? 'bg-gradient-to-br from-purple-950/50 via-[#0d081e] to-[#07040f]'
              : resource.resourceType === 'VIDEO'
                ? 'bg-gradient-to-br from-purple-900/30 via-[#0d081e] to-[#140d2e]'
                : 'bg-gradient-to-br from-[#0d081e] to-[#140d2e]'
          }`}>
            {resource.resourceType === 'VIDEO' ? (
              <div className="w-9 h-9 rounded-xl bg-purple-600/15 border border-purple-500/40 flex items-center justify-center mb-1 shadow-purple-glow group-hover:scale-110 transition-transform">
                <Play className="w-4 h-4 text-purple-400 fill-purple-400/20 ml-0.5" />
              </div>
            ) : (
              <div className="w-8 h-8 rounded-lg bg-purple-950/40 border border-purple-900/50 flex items-center justify-center mb-1">
                {renderResourceTypeIcon(resource.resourceType)}
              </div>
            )}
            <span className="text-[10px] font-mono text-purple-200/70 truncate max-w-[120px]">{resource.domain}</span>
          </div>
        )}

        {/* Resource Type & 18+ Badge */}
        <div className="absolute top-2 left-2 pointer-events-none flex items-center gap-1">
          <span className="px-2 py-0.5 rounded-md bg-[#07040f]/90 backdrop-blur-md text-[9px] font-mono font-bold text-purple-300 border border-purple-500/30 uppercase tracking-wider flex items-center gap-1">
            {renderResourceTypeIcon(resource.resourceType)}
            <span>{resource.resourceType}</span>
          </span>
          {isAdult && (
            <span className="px-1.5 py-0.5 rounded-md bg-purple-950/90 backdrop-blur-md text-[9px] font-mono font-bold text-purple-200 border border-purple-500/50 uppercase">
              18+
            </span>
          )}
        </div>

        {/* 18+ Sensitive Blur Overlay */}
        {isBlurred && (
          <div className="absolute inset-0 z-20 bg-[#07040f]/80 backdrop-blur-sm flex flex-col items-center justify-center p-2 text-center pointer-events-auto">
            <span className="text-[9px] font-mono font-bold text-purple-300 mb-1 flex items-center gap-1">
              <Ghost className="w-2.5 h-2.5 text-purple-400" />
              <span>18+ NSFW</span>
            </span>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsRevealed(true);
              }}
              className="px-2 py-0.5 rounded bg-[#140d2e] hover:bg-[#1f1344] text-purple-200 border border-purple-800/60 text-[9px] font-mono transition-colors cursor-pointer flex items-center gap-1"
            >
              <Eye className="w-2.5 h-2.5 text-purple-400" />
              <span>Reveal</span>
            </button>
          </div>
        )}

        {/* Hidden Overlay */}
        {isHidden && (
          <div className="absolute inset-0 bg-[#07040f]/85 backdrop-blur-xs flex items-center justify-center pointer-events-none">
            <span className="px-2 py-0.5 rounded bg-rose-500/90 text-white font-bold text-[9px] uppercase font-mono">Hidden</span>
          </div>
        )}

        {/* Play Icon */}
        {resource.embedType !== 'NONE' && !isHidden && !isBlurred && (
          <div className="absolute inset-0 bg-[#07040f]/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <div className="w-8 h-8 rounded-full bg-purple-500 text-white flex items-center justify-center shadow-purple-glow">
              <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
            </div>
          </div>
        )}
      </Link>

      {/* Middle Details Content */}
      <div className="flex-1 space-y-1.5 min-w-0">
        {/* Meta Line */}
        <div className="flex flex-wrap items-center gap-2 text-xs text-purple-300/60 font-medium">
          {categoryName && (
            <span className="px-2 py-0.5 rounded-md bg-purple-600/15 text-purple-300 font-mono font-semibold border border-purple-500/30 text-[10px] uppercase tracking-wider">
              {categoryName}
            </span>
          )}
          <span className="flex items-center gap-1 text-[11px] font-mono text-purple-200/80">
            <img
              src={`https://www.google.com/s2/favicons?domain=${resource.domain}&sz=64`}
              alt=""
              className="w-3.5 h-3.5 rounded-full inline"
              onError={(e) => { e.target.style.display = 'none'; }}
            />
            <span>{resource.domain}</span>
          </span>

          <button
            onClick={handleCopyUrl}
            title={isCopied ? 'URL Copied!' : 'Copy Direct URL'}
            className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-semibold border transition-all cursor-pointer ${isCopied
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                : 'bg-[#140d2e] hover:bg-purple-600/20 text-purple-300/70 hover:text-purple-200 border-purple-900/40'
              }`}
          >
            {isCopied ? <Check className="w-2.5 h-2.5 text-emerald-400" /> : <Copy className="w-2.5 h-2.5" />}
            <span>{isCopied ? 'Copied' : 'Copy URL'}</span>
          </button>
        </div>

        {/* Title */}
        <Link to={`/resources/${resource._id}`} className="block group-hover:text-purple-300 transition-colors">
          <h3 className="font-display font-bold text-sm sm:text-base text-slate-100 line-clamp-1">
            {resource.title}
          </h3>
        </Link>

        {/* Description */}
        {resource.description && (
          <p className="text-xs text-purple-200/60 line-clamp-1 leading-relaxed">
            {resource.description}
          </p>
        )}

        {/* Tags & Admin Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
          {Array.isArray(resource.tags) && resource.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {resource.tags.slice(0, 4).map((tag, idx) => (
                <span key={idx} className="text-[10px] text-purple-300/70 font-mono bg-[#140d2e] px-1.5 py-0.5 rounded border border-purple-900/40">
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Admin Controls */}
          {isAdminOrMod && (
            <div className="flex items-center gap-1.5 ml-auto">
              <span className="text-[10px] text-amber-400 font-mono font-bold flex items-center gap-0.5">
                <ShieldAlert className="w-3 h-3" />
                <span>Admin:</span>
              </span>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsEditModalOpen(true);
                }}
                className="px-2 py-0.5 rounded bg-purple-600/20 text-purple-300 hover:bg-purple-600/30 border border-purple-500/40 text-[10px] font-semibold transition-colors flex items-center gap-0.5 cursor-pointer"
              >
                <Edit3 className="w-3 h-3" />
                <span>Edit</span>
              </button>
              <button
                onClick={handleAdminToggleHide}
                className={`px-2 py-0.5 rounded text-[10px] font-semibold border transition-colors flex items-center gap-0.5 cursor-pointer ${isHidden
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30'
                    : 'bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30'
                  }`}
              >
                {isHidden ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                <span>{isHidden ? 'Unhide' : 'Hide'}</span>
              </button>
              <button
                onClick={handleAdminDelete}
                className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 border border-rose-500/40 text-[10px] font-semibold transition-colors flex items-center gap-0.5 cursor-pointer"
              >
                <Trash2 className="w-3 h-3" />
                <span>Delete</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Right Stats & Action Buttons */}
      <div className="flex sm:flex-col items-center justify-between sm:justify-center gap-3 sm:border-l border-purple-900/30 sm:pl-4 shrink-0">
        <div className="flex items-center gap-3 text-xs text-purple-300/60">
          <span className="flex items-center gap-1 text-[11px] font-mono" title="Views">
            <Eye className="w-3.5 h-3.5 text-purple-400/60" />
            <span>{resource.views || 0}</span>
          </span>
          <span className="flex items-center gap-1 text-[11px] font-mono" title="Saves">
            <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'text-purple-400 fill-purple-400' : 'text-purple-400/60'}`} />
            <span>{resource.saves || 0}</span>
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={handleSaveToggle}
            title={isSaved ? 'Remove Bookmark' : 'Save Bookmark'}
            className={`p-1.5 rounded-lg border transition-all cursor-pointer ${isSaved
                ? 'bg-purple-600/30 text-purple-200 border-purple-500/50 shadow-purple-glow-sm'
                : 'bg-[#140d2e] hover:bg-purple-900/30 text-purple-300/70 hover:text-purple-200 border-purple-900/40'
              }`}
          >
            <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-purple-300' : ''}`} />
          </button>

          <button
            onClick={handleAddToCollection}
            title="Add to Vault"
            className="p-1.5 rounded-lg bg-[#140d2e] hover:bg-purple-600/20 text-purple-300/70 hover:text-purple-200 border border-purple-900/40 transition-colors cursor-pointer"
          >
            <FolderPlus className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={handleShare}
            title="Share Link"
            className="p-1.5 rounded-lg bg-[#140d2e] hover:bg-purple-900/30 text-purple-300/70 hover:text-purple-200 border border-purple-900/40 transition-colors cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={handleReportClick}
            title="Report Link"
            className="p-1.5 rounded-lg bg-[#140d2e] hover:bg-rose-500/20 text-purple-300/70 hover:text-rose-300 border border-purple-900/40 transition-colors cursor-pointer"
          >
            <Flag className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Edit Modal */}
      <EditResourceModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        resource={resource}
        onResourceUpdated={(updated) => setResource(updated)}
      />
    </motion.div>
  );
};
