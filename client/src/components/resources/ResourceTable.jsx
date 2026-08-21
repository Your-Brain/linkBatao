import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import API from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useIncognito } from '../../context/IncognitoContext';
import { EditResourceModal } from './EditResourceModal';
import {
  ExternalLink,
  Copy,
  Check,
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
  Ghost
} from 'lucide-react';

export const ResourceTable = ({ resources, onReport, onAddToCollection, onResourceDeleted }) => {
  const { user, savedIds, toggleSaveResource } = useAuth();
  const { showToast } = useToast();
  const { isAdultResource } = useIncognito();

  const [copiedUrlId, setCopiedUrlId] = useState(null);
  const [editingResource, setEditingResource] = useState(null);
  const [hiddenResourceIds, setHiddenResourceIds] = useState(new Set());
  const [deletedResourceIds, setDeletedResourceIds] = useState(new Set());

  const isAdminOrMod = user && (user.role === 'ADMIN' || user.role === 'MODERATOR');

  const handleCopyUrl = (e, resource) => {
    e.preventDefault();
    e.stopPropagation();
    const urlToCopy = resource.url || `${window.location.origin}/resources/${resource._id}`;
    navigator.clipboard.writeText(urlToCopy);
    setCopiedUrlId(resource._id);
    showToast('Direct URL copied to clipboard!', 'success');
    setTimeout(() => {
      setCopiedUrlId(null);
    }, 2000);
  };

  const handleSharePage = (e, resource) => {
    e.preventDefault();
    e.stopPropagation();
    const shareUrl = `${window.location.origin}/resources/${resource._id}`;
    navigator.clipboard.writeText(shareUrl);
    showToast('Resource page link copied to clipboard!', 'info');
  };

  const handleSaveToggle = (e, resourceId) => {
    e.preventDefault();
    e.stopPropagation();
    toggleSaveResource(resourceId);
  };

  const handleAddToCollection = (e, resource) => {
    e.preventDefault();
    e.stopPropagation();
    if (onAddToCollection) onAddToCollection(resource);
  };

  const handleReportClick = (e, resource) => {
    e.preventDefault();
    e.stopPropagation();
    if (onReport) onReport(resource);
  };

  const handleAdminToggleHide = async (e, resource) => {
    e.preventDefault();
    e.stopPropagation();
    const isCurrentlyHidden = hiddenResourceIds.has(resource._id) || resource.status === 'REMOVED' || resource.status === 'REJECTED';
    const newStatus = isCurrentlyHidden ? 'APPROVED' : 'REMOVED';

    try {
      const res = await API.patch(`/admin/resources/${resource._id}`, { status: newStatus });
      if (res.data.success) {
        showToast(`Resource set to ${newStatus === 'APPROVED' ? 'Visible' : 'Hidden'}`, 'success');
        setHiddenResourceIds((prev) => {
          const next = new Set(prev);
          if (newStatus === 'REMOVED') {
            next.add(resource._id);
          } else {
            next.delete(resource._id);
          }
          return next;
        });
      }
    } catch (err) {
      showToast('Failed to update resource status', 'error');
    }
  };

  const handleAdminDelete = async (e, resource) => {
    e.preventDefault();
    e.stopPropagation();
    if (!window.confirm(`Admin Action: Permanently delete "${resource.title}"?`)) return;

    try {
      const res = await API.delete(`/admin/resources/${resource._id}`);
      if (res.data.success) {
        showToast('Resource deleted by Admin', 'success');
        setDeletedResourceIds((prev) => new Set(prev).add(resource._id));
        if (onResourceDeleted) onResourceDeleted(resource._id);
      }
    } catch (err) {
      showToast('Failed to delete resource', 'error');
    }
  };

  const renderResourceTypeIcon = (type) => {
    switch (type) {
      case 'VIDEO': return <Video className="w-3.5 h-3.5 text-cyan-400" />;
      case 'IMAGE': return <ImageIcon className="w-3.5 h-3.5 text-emerald-400" />;
      case 'ARTICLE': return <FileText className="w-3.5 h-3.5 text-amber-400" />;
      case 'AUDIO': return <Music className="w-3.5 h-3.5 text-purple-400" />;
      default: return <Globe className="w-3.5 h-3.5 text-sky-400" />;
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

  const activeResources = (resources || []).filter(r => !deletedResourceIds.has(r._id));

  return (
    <div className="w-full overflow-hidden rounded-2xl border border-slate-800 glass-card text-left hud-bracket">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-300 border-collapse">
          <thead>
            <tr className="border-b border-slate-800 bg-[#070c1b] text-slate-400 font-mono font-semibold uppercase tracking-wider text-[10px]">
              <th className="py-3 px-4 min-w-[280px]">Resource & Title</th>
              <th className="py-3 px-3 min-w-[130px]">Source Domain</th>
              <th className="py-3 px-3 min-w-[120px]">Type / Class</th>
              <th className="py-3 px-3 min-w-[190px]">Direct Stream URL</th>
              <th className="py-3 px-3 text-center min-w-[90px]">Telemetry</th>
              <th className="py-3 px-4 text-right min-w-[170px]">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-sans">
            {activeResources.map((resource) => {
              const isSaved = savedIds.has(resource._id);
              const isHidden = hiddenResourceIds.has(resource._id) || resource.status === 'REMOVED' || resource.status === 'REJECTED';
              const isAdult = isAdultResource(resource);
              const categoryName = getCategoryName(resource.category);
              const isCopied = copiedUrlId === resource._id;

              return (
                <tr
                  key={resource._id}
                  className={`hover:bg-[#0e162c]/60 transition-colors group ${isHidden ? 'bg-rose-950/15 opacity-75' : isAdult ? 'bg-purple-950/10' : ''
                    }`}
                >
                  {/* Content & Title */}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <Link
                        to={`/resources/${resource._id}`}
                        className="w-12 h-9 rounded-lg overflow-hidden bg-[#03050a] shrink-0 border border-slate-800 relative block group-hover:border-cyan-500/40 transition-colors"
                      >
                        {resource.thumbnail ? (
                          <img
                            src={resource.thumbnail}
                            alt=""
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform opacity-90"
                            onError={(e) => {
                              e.target.src = `https://www.google.com/s2/favicons?domain=${resource.domain}&sz=64`;
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-dark-900">
                            {renderResourceTypeIcon(resource.resourceType)}
                          </div>
                        )}
                      </Link>

                      <div className="min-w-0 max-w-sm">
                        <Link
                          to={`/resources/${resource._id}`}
                          className="font-semibold text-slate-100 group-hover:text-cyan-300 transition-colors line-clamp-1 block text-xs sm:text-sm font-display"
                        >
                          {resource.title}
                        </Link>
                        {resource.description && (
                          <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                            {resource.description}
                          </p>
                        )}
                        {Array.isArray(resource.tags) && resource.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {isAdult && (
                              <span className="text-[9px] font-mono text-purple-300 bg-purple-950/40 px-1.5 py-0.2 rounded border border-purple-500/40">
                                18+ NSFW
                              </span>
                            )}
                            {resource.tags.slice(0, 2).map((t, idx) => (
                              <span key={idx} className="text-[9px] font-mono text-slate-400 bg-[#070c1b] px-1.5 py-0.2 rounded border border-slate-800">
                                #{t}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Domain */}
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-1.5 text-xs text-slate-300 font-mono">
                      <img
                        src={`https://www.google.com/s2/favicons?domain=${resource.domain}&sz=64`}
                        alt=""
                        className="w-3.5 h-3.5 rounded-full inline shrink-0"
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                      <span className="truncate max-w-[120px] text-[11px]">{resource.domain}</span>
                    </div>
                  </td>

                  {/* Category & Type */}
                  <td className="py-3 px-3">
                    <div className="flex flex-col items-start gap-1">
                      {categoryName && (
                        <span className={`px-2 py-0.5 rounded-md font-mono font-semibold text-[9px] uppercase tracking-wider ${isAdult ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' : 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/20'
                          }`}>
                          {categoryName}
                        </span>
                      )}
                      <span className="inline-flex items-center gap-1 text-[9px] text-slate-400 font-mono uppercase">
                        {renderResourceTypeIcon(resource.resourceType)}
                        <span>{resource.resourceType}</span>
                      </span>
                    </div>
                  </td>

                  {/* Direct URL with Copy Button */}
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={(e) => handleCopyUrl(e, resource)}
                        className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border text-[10px] font-mono font-medium transition-all cursor-pointer ${isCopied
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                            : 'bg-[#090e1d] hover:bg-cyan-500/20 text-slate-300 hover:text-cyan-300 border-slate-800'
                          }`}
                        title="Copy direct source URL"
                      >
                        {isCopied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        <span>{isCopied ? 'Copied URL!' : 'Copy URL'}</span>
                      </button>

                      <a
                        href={resource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1 rounded-lg bg-[#090e1d] hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 transition-colors"
                        title="Open direct link in new tab"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </td>

                  {/* Stats */}
                  <td className="py-3 px-3 text-center">
                    <div className="flex items-center justify-center gap-2 text-[10px] font-mono text-slate-400">
                      <span className="flex items-center gap-0.5" title="Views">
                        <Eye className="w-3 h-3 text-slate-500" />
                        <span>{resource.views || 0}</span>
                      </span>
                      <span className="flex items-center gap-0.5" title="Saves">
                        <Bookmark className={`w-3 h-3 ${isSaved ? 'text-cyan-400 fill-cyan-400' : 'text-slate-500'}`} />
                        <span>{resource.saves || 0}</span>
                      </span>
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={(e) => handleSaveToggle(e, resource._id)}
                        title={isSaved ? 'Remove Bookmark' : 'Save Bookmark'}
                        className={`p-1.5 rounded-lg border transition-all cursor-pointer ${isSaved
                            ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                            : 'bg-[#090e1d] hover:bg-slate-800 text-slate-400 hover:text-slate-200 border-slate-800'
                          }`}
                      >
                        <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-cyan-300' : ''}`} />
                      </button>

                      <button
                        onClick={(e) => handleAddToCollection(e, resource)}
                        title="Add to Vault"
                        className="p-1.5 rounded-lg bg-[#090e1d] hover:bg-cyan-500/20 text-slate-400 hover:text-cyan-300 border border-slate-800 transition-colors cursor-pointer"
                      >
                        <FolderPlus className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={(e) => handleSharePage(e, resource)}
                        title="Share Page Link"
                        className="p-1.5 rounded-lg bg-[#090e1d] hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 transition-colors cursor-pointer"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={(e) => handleReportClick(e, resource)}
                        title="Report Link"
                        className="p-1.5 rounded-lg bg-[#090e1d] hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 border border-slate-800 transition-colors cursor-pointer"
                      >
                        <Flag className="w-3.5 h-3.5" />
                      </button>

                      {isAdminOrMod && (
                        <div className="flex items-center gap-1 pl-1 border-l border-slate-800">
                          <button
                            onClick={() => setEditingResource(resource)}
                            title="Admin Edit"
                            className="p-1.5 rounded-lg bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-500/40 transition-colors cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={(e) => handleAdminToggleHide(e, resource)}
                            title={isHidden ? 'Admin Unhide' : 'Admin Hide'}
                            className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${isHidden
                                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30'
                                : 'bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30'
                              }`}
                          >
                            {isHidden ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                          </button>
                          <button
                            onClick={(e) => handleAdminDelete(e, resource)}
                            title="Admin Delete"
                            className="p-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Admin Edit Modal */}
      {editingResource && (
        <EditResourceModal
          isOpen={!!editingResource}
          onClose={() => setEditingResource(null)}
          resource={editingResource}
          onResourceUpdated={() => {
            setEditingResource(null);
          }}
        />
      )}
    </div>
  );
};
