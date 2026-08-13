import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Play, Bookmark, Share2, Flag, Eye, ExternalLink, Video, FileText, Image as ImageIcon, Globe, Music, FolderPlus } from 'lucide-react';

export const ResourceCard = ({ resource, onReport, onAddToCollection }) => {
  const { savedIds, toggleSaveResource } = useAuth();
  const { showToast } = useToast();

  if (!resource) return null;

  const isSaved = savedIds.has(resource._id);

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

  const renderResourceTypeIcon = (type) => {
    switch (type) {
      case 'VIDEO': return <Video className="w-3 h-3 text-sky-400" />;
      case 'IMAGE': return <ImageIcon className="w-3 h-3 text-emerald-400" />;
      case 'ARTICLE': return <FileText className="w-3 h-3 text-amber-400" />;
      case 'AUDIO': return <Music className="w-3 h-3 text-purple-400" />;
      default: return <Globe className="w-3 h-3 text-cyan-400" />;
    }
  };

  return (
    <div className="glass-card rounded-2xl overflow-hidden flex flex-col justify-between group h-full border border-slate-800/80 hover:border-sky-500/40">
      
      {/* Card Header & Thumbnail */}
      <Link to={`/resources/${resource._id}`} className="block relative aspect-video w-full overflow-hidden bg-dark-900">
        {resource.thumbnail ? (
          <img
            src={resource.thumbnail}
            alt={resource.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => {
              e.target.src = `https://www.google.com/s2/favicons?domain=${resource.domain}&sz=128`;
            }}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-dark-800 to-dark-700 p-4 text-center">
            <Globe className="w-8 h-8 text-sky-400/60 mb-1" />
            <span className="text-xs font-semibold text-slate-400">{resource.domain}</span>
          </div>
        )}

        {/* Top Badges Overlay */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none">
          <span className="px-2.5 py-1 rounded-full bg-dark-900/80 backdrop-blur-md text-[10px] font-bold text-sky-300 border border-sky-400/20 uppercase tracking-wider flex items-center gap-1.5 shadow-md">
            {renderResourceTypeIcon(resource.resourceType)}
            <span>{resource.resourceType}</span>
          </span>

          {resource.category && (
            <span className="px-2.5 py-1 rounded-full bg-slate-900/80 backdrop-blur-md text-[10px] font-medium text-slate-300 border border-slate-700/60">
              {resource.category.name}
            </span>
          )}
        </div>

        {/* Play Overlay Button for Embedded Videos */}
        {resource.embedType !== 'NONE' && (
          <div className="absolute inset-0 bg-dark-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-sky-500/90 text-slate-950 flex items-center justify-center shadow-glow transform scale-90 group-hover:scale-100 transition-transform">
              <Play className="w-5 h-5 fill-current ml-0.5" />
            </div>
          </div>
        )}
      </Link>

      {/* Card Content Body */}
      <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
        <div className="space-y-2">
          {/* Domain Favicon */}
          <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
            <img
              src={`https://www.google.com/s2/favicons?domain=${resource.domain}&sz=64`}
              alt={resource.domain}
              className="w-3.5 h-3.5 rounded-full"
              onError={(e) => { e.target.style.display = 'none'; }}
            />
            <span className="truncate">{resource.domain}</span>
            <span className="text-slate-600">•</span>
            <span className="text-[11px] text-slate-500">
              {resource.submittedBy ? `@${resource.submittedBy.username}` : resource.anonymousId}
            </span>
          </div>

          {/* Title */}
          <Link to={`/resources/${resource._id}`} className="block">
            <h3 className="font-display font-bold text-sm text-slate-100 group-hover:text-sky-300 transition-colors line-clamp-2 leading-snug">
              {resource.title}
            </h3>
          </Link>

          {/* Description snippet */}
          {resource.description && (
            <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
              {resource.description}
            </p>
          )}

          {/* Tags */}
          {Array.isArray(resource.tags) && resource.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 pt-1">
              {resource.tags.slice(0, 3).map((tag, idx) => (
                <span key={idx} className="text-[10px] text-slate-400 hover:text-sky-300 font-mono bg-dark-800/80 px-2 py-0.5 rounded border border-slate-800">
                  #{tag}
                </span>
              ))}
              {resource.tags.length > 3 && (
                <span className="text-[10px] text-slate-500">+{resource.tags.length - 3}</span>
              )}
            </div>
          )}
        </div>

        {/* Card Footer Toolbar */}
        <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2 text-xs text-slate-400">
          
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-[11px]" title="Views">
              <Eye className="w-3.5 h-3.5 text-slate-500" />
              <span>{resource.views || 0}</span>
            </span>
            <span className="flex items-center gap-1 text-[11px]" title="Saves">
              <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'text-sky-400 fill-sky-400' : 'text-slate-500'}`} />
              <span>{resource.saves || 0}</span>
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={handleSaveToggle}
              title={isSaved ? 'Remove Bookmark' : 'Save Bookmark'}
              className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                isSaved
                  ? 'bg-sky-500/20 text-sky-300 border-sky-500/40'
                  : 'bg-dark-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 border-slate-700/50'
              }`}
            >
              <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-sky-300' : ''}`} />
            </button>

            <button
              onClick={handleAddToCollection}
              title="Add to Collection"
              className="p-1.5 rounded-lg bg-dark-800 hover:bg-cyan-500/20 text-slate-400 hover:text-cyan-300 border border-slate-700/50 transition-colors cursor-pointer"
            >
              <FolderPlus className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={handleShare}
              title="Share Link"
              className="p-1.5 rounded-lg bg-dark-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 border border-slate-700/50 transition-colors cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={handleReportClick}
              title="Report Link"
              className="p-1.5 rounded-lg bg-dark-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 border border-slate-700/50 transition-colors cursor-pointer"
            >
              <Flag className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>

      </div>

    </div>
  );
};

