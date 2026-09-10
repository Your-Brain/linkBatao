import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import API from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { detectIsAdultContent, getSuggestedAdultTags } from '../../services/share/platformParsers';
import { EmbeddedPlayer } from './EmbeddedPlayer';
import {
  X,
  Save,
  Edit3,
  Sparkles,
  RefreshCw,
  Image as ImageIcon,
  ExternalLink,
  Eye,
  Play,
  Globe,
  Check,
  Video,
  LayoutGrid
} from 'lucide-react';

export const EditResourceModal = ({ isOpen, onClose, resource, onResourceUpdated }) => {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState('form'); // 'form' | 'preview'
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchingPreview, setFetchingPreview] = useState(false);
  const [imageError, setImageError] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    url: '',
    category: '',
    resourceType: 'WEBSITE',
    status: 'APPROVED',
    thumbnail: '',
    tags: '',
    isNsfw: false
  });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await API.get('/categories');
        if (res.data.success) {
          setCategories(res.data.data);
        }
      } catch (err) {
        console.error('Failed to fetch categories', err);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    if (resource) {
      setFormData({
        title: resource.title || '',
        description: resource.description || '',
        url: resource.url || '',
        category: resource.category?._id || resource.category || '',
        resourceType: resource.resourceType || 'WEBSITE',
        status: resource.status || 'APPROVED',
        thumbnail: resource.thumbnail || '',
        tags: Array.isArray(resource.tags) ? resource.tags.join(', ') : (resource.tags || ''),
        isNsfw: Boolean(resource.isNsfw)
      });
      setImageError(false);
    }
  }, [resource]);

  if (!isOpen || !resource) return null;

  // Helper to merge tags in formData
  const appendTagsToForm = (newTagList, currentTags) => {
    const parsedCurrent = typeof currentTags === 'string'
      ? currentTags.split(',').map(t => t.trim().toLowerCase()).filter(Boolean)
      : (Array.isArray(currentTags) ? currentTags.map(t => String(t).toLowerCase()) : []);
    const combined = [...new Set([...parsedCurrent, ...newTagList.map(t => t.toLowerCase())])];
    return combined.join(', ');
  };

  const handleUrlChange = (newUrl) => {
    setFormData(prev => {
      const updates = { ...prev, url: newUrl };
      if (newUrl && detectIsAdultContent(newUrl)) {
        updates.isNsfw = true;
        const sexCat = categories.find(c => c.slug === 'sex' || c.name?.toLowerCase() === 'sex');
        if (sexCat) updates.category = sexCat._id;
        const suggested = getSuggestedAdultTags(newUrl);
        updates.tags = appendTagsToForm(suggested, updates.tags);
      }
      return updates;
    });
  };

  const handleCategoryChange = (newCatId) => {
    setFormData(prev => {
      const updates = { ...prev, category: newCatId };
      const selectedCat = categories.find(c => c._id === newCatId || c.slug === newCatId);
      if (selectedCat && (selectedCat.slug === 'sex' || selectedCat.name?.toLowerCase() === 'sex')) {
        updates.isNsfw = true;
        updates.tags = appendTagsToForm(['18+', 'adult', 'nsfw'], updates.tags);
      }
      return updates;
    });
  };

  const handleNsfwToggle = (checked) => {
    setFormData(prev => {
      const updates = { ...prev, isNsfw: checked };
      if (checked) {
        const sexCat = categories.find(c => c.slug === 'sex' || c.name?.toLowerCase() === 'sex');
        if (sexCat) updates.category = sexCat._id;
        updates.tags = appendTagsToForm(['18+', 'adult', 'nsfw'], updates.tags);
      }
      return updates;
    });
  };

  const handleFetchPreview = async () => {
    if (!formData.url || !formData.url.trim()) {
      showToast('Please enter a valid URL to re-fetch metadata', 'info');
      return;
    }

    setFetchingPreview(true);
    try {
      const res = await API.post('/resources/metadata-preview', { url: formData.url.trim() });
      if (res.data.success) {
        const p = res.data;
        let newThumb = '';

        setFormData(prev => {
          const updates = { ...prev };

          if (p.normalizedUrl) updates.url = p.normalizedUrl;
          if (p.metadata?.title) updates.title = p.metadata.title;
          if (p.metadata?.description) updates.description = p.metadata.description;

          if (p.metadata?.thumbnail && p.metadata.thumbnail.trim()) {
            updates.thumbnail = p.metadata.thumbnail.trim();
            newThumb = updates.thumbnail;
            setImageError(false);
          } else if (!updates.thumbnail && p.domain) {
            updates.thumbnail = `https://www.google.com/s2/favicons?domain=${p.domain}&sz=128`;
            newThumb = updates.thumbnail;
            setImageError(false);
          }

          if (p.metadata?.resourceType) updates.resourceType = p.metadata.resourceType;

          // Check adult content
          const isAdult = Boolean(
            p.metadata?.isNsfw ||
            detectIsAdultContent(formData.url, p.metadata?.title, p.metadata?.description)
          );

          if (isAdult) {
            updates.isNsfw = true;
            const sexCat = categories.find(c => c.slug === 'sex' || c.name?.toLowerCase() === 'sex');
            if (sexCat) updates.category = sexCat._id;
            const suggested = getSuggestedAdultTags(p.domain || formData.url);
            updates.tags = appendTagsToForm(suggested, updates.tags);
          } else if (p.metadata?.isNsfw !== undefined) {
            updates.isNsfw = Boolean(p.metadata.isNsfw);
          }

          return updates;
        });

        showToast(
          p.metadata?.thumbnail || newThumb
            ? 'Telemetry & thumbnail re-fetched successfully!'
            : 'Metadata updated successfully!',
          'success'
        );
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Could not auto-fetch metadata for this URL.', 'error');
    } finally {
      setFetchingPreview(false);
    }
  };

  const handleUseDomainIcon = () => {
    try {
      const domain = new URL(formData.url).hostname.replace(/^www\./, '');
      const iconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
      setFormData(prev => ({ ...prev, thumbnail: iconUrl }));
      setImageError(false);
      showToast('Domain high-res icon applied as thumbnail', 'success');
    } catch (err) {
      showToast('Please enter a valid URL first', 'error');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.url) {
      showToast('Title and URL are required', 'error');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...formData,
        tags: typeof formData.tags === 'string'
          ? formData.tags.split(',').map(t => t.trim()).filter(Boolean)
          : formData.tags
      };

      const res = await API.put(`/resources/${resource._id}`, payload);
      if (res.data.success) {
        showToast('Resource updated successfully!', 'success');
        if (onResourceUpdated) onResourceUpdated(res.data.data);
        onClose();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update resource', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Preview helper object
  const selectedCatObj = categories.find(c => c._id === formData.category || c.slug === formData.category);
  const previewResource = {
    ...resource,
    ...formData,
    tags: typeof formData.tags === 'string'
      ? formData.tags.split(',').map(t => t.trim()).filter(Boolean)
      : formData.tags,
    category: selectedCatObj || resource.category,
    domain: (() => {
      try {
        return new URL(formData.url).hostname.replace(/^www\./, '');
      } catch (e) {
        return resource.domain || 'example.com';
      }
    })()
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 bg-[#07040f]/85 backdrop-blur-xl overflow-hidden">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 6 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 6 }}
        transition={{ duration: 0.15 }}
        className="relative w-full max-w-2xl bg-[#0d081e] rounded-3xl border border-purple-900/40 shadow-2xl flex flex-col max-h-[92vh] overflow-hidden text-left hud-bracket"
      >
        {/* Pinned Header with Mode Switcher Tabs */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-purple-900/30 bg-[#0d081e] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-purple-600/20 border border-purple-500/40 flex items-center justify-center text-purple-300">
              <Edit3 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-display font-bold text-sm text-white">Edit Link Resource</h3>
              <p className="text-[11px] font-mono text-purple-300/70">Modify metadata, re-fetch thumbnails, or inspect live preview</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* View Mode Switcher */}
            <div className="flex items-center bg-[#07040f] rounded-xl p-0.5 border border-purple-900/40">
              <button
                type="button"
                onClick={() => setActiveTab('form')}
                className={`px-3 py-1 rounded-lg text-xs font-mono transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'form'
                    ? 'bg-purple-600 text-white shadow-sm font-semibold'
                    : 'text-purple-300/70 hover:text-purple-100'
                }`}
              >
                <Edit3 className="w-3 h-3" />
                <span>Edit Details</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('preview')}
                className={`px-3 py-1 rounded-lg text-xs font-mono transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'preview'
                    ? 'bg-purple-600 text-white shadow-sm font-semibold'
                    : 'text-purple-300/70 hover:text-purple-100'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Live Preview</span>
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl text-purple-300 hover:text-white bg-[#140d2e] border border-purple-900/40 hover:border-purple-500/50 transition-colors cursor-pointer ml-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Modal Content */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden min-h-0">
          <div className="p-6 overflow-y-auto space-y-4 flex-1">

            {activeTab === 'form' ? (
              <>
                {/* Target URL with Re-fetch Action */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-mono font-semibold text-purple-200">Target URL *</label>
                    <button
                      type="button"
                      onClick={handleFetchPreview}
                      disabled={fetchingPreview || !formData.url}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-purple-600/20 hover:bg-purple-600/30 text-purple-200 border border-purple-500/40 text-[11px] font-mono font-medium transition-all cursor-pointer disabled:opacity-40 shadow-sm"
                      title="Auto-fetch fixed thumbnail, title, and media player data"
                    >
                      {fetchingPreview ? (
                        <>
                          <RefreshCw className="w-3 h-3 animate-spin text-purple-400" />
                          <span>Re-fetching...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3 h-3 text-purple-400" />
                          <span>Re-fetch Metadata</span>
                        </>
                      )}
                    </button>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      required
                      value={formData.url}
                      onChange={(e) => handleUrlChange(e.target.value)}
                      className="flex-1 px-3.5 py-2.5 rounded-xl bg-[#090515] border border-purple-900/40 text-purple-100 text-xs focus:border-purple-500 focus:ring-1 focus:ring-purple-500/30 focus:outline-none font-mono transition-all"
                      placeholder="https://example.com"
                    />
                    {formData.url && (
                      <a
                        href={formData.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2.5 rounded-xl bg-[#140d2e] hover:bg-purple-900/30 border border-purple-900/40 text-purple-300 hover:text-white transition-colors flex items-center justify-center shrink-0"
                        title="Open URL in new tab"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </div>

                {/* Title */}
                <div>
                  <label className="block text-xs font-mono font-semibold text-purple-200 mb-1">Title *</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#090515] border border-purple-900/40 text-purple-100 text-xs focus:border-purple-500 focus:ring-1 focus:ring-purple-500/30 focus:outline-none transition-all"
                    placeholder="Resource title"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-mono font-semibold text-purple-200 mb-1">Description</label>
                  <textarea
                    rows={2}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#090515] border border-purple-900/40 text-purple-100 text-xs focus:border-purple-500 focus:ring-1 focus:ring-purple-500/30 focus:outline-none resize-none transition-all"
                    placeholder="Provide a helpful description..."
                  />
                </div>

                {/* Category & Resource Type */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-mono font-semibold text-purple-200 mb-1">Category</label>
                    <select
                      value={formData.category}
                      onChange={(e) => handleCategoryChange(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#090515] border border-purple-900/40 text-purple-100 text-xs focus:border-purple-500 focus:outline-none cursor-pointer"
                    >
                      <option value="" className="bg-[#0d081e] text-purple-300">Select Category</option>
                      {categories.map((cat) => (
                        <option key={cat._id} value={cat._id} className="bg-[#0d081e] text-purple-100">
                          {cat.name} {cat.slug === 'sex' || cat.name?.toLowerCase() === 'sex' ? '(18+ NSFW)' : ''}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-mono font-semibold text-purple-200 mb-1">Media Type</label>
                    <select
                      value={formData.resourceType}
                      onChange={(e) => setFormData({ ...formData, resourceType: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#090515] border border-purple-900/40 text-purple-100 text-xs focus:border-purple-500 focus:outline-none cursor-pointer"
                    >
                      <option value="WEBSITE" className="bg-[#0d081e]">Website / Tool</option>
                      <option value="VIDEO" className="bg-[#0d081e]">Video / Stream</option>
                      <option value="ARTICLE" className="bg-[#0d081e]">Article / Post</option>
                      <option value="IMAGE" className="bg-[#0d081e]">Image / Graphic</option>
                      <option value="AUDIO" className="bg-[#0d081e]">Audio / Track</option>
                      <option value="OTHER" className="bg-[#0d081e]">Other Media</option>
                    </select>
                  </div>
                </div>

                {/* Visibility Status */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-mono font-semibold text-purple-200 mb-1">Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#090515] border border-purple-900/40 text-purple-100 text-xs font-semibold focus:border-purple-500 focus:outline-none cursor-pointer"
                    >
                      <option value="APPROVED" className="bg-[#0d081e] text-emerald-400">Approved (Visible)</option>
                      <option value="REMOVED" className="bg-[#0d081e] text-rose-400">Removed (Hidden)</option>
                      <option value="PENDING" className="bg-[#0d081e] text-amber-400">Pending Review</option>
                      <option value="REJECTED" className="bg-[#0d081e] text-purple-400">Rejected</option>
                    </select>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-mono font-semibold text-purple-200">Thumbnail URL</label>
                      <button
                        type="button"
                        onClick={handleUseDomainIcon}
                        className="text-[10px] text-purple-400 hover:text-purple-300 underline cursor-pointer"
                        title="Generate high-resolution logo from domain"
                      >
                        Use Domain Icon
                      </button>
                    </div>
                    <input
                      type="text"
                      placeholder="https://..."
                      value={formData.thumbnail}
                      onChange={(e) => {
                        setFormData({ ...formData, thumbnail: e.target.value });
                        setImageError(false);
                      }}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#090515] border border-purple-900/40 text-purple-100 text-xs font-mono focus:border-purple-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Thumbnail Live Visual Card with Quick Actions */}
                {formData.thumbnail ? (
                  <div className="p-3 rounded-2xl bg-[#140d2e]/70 border border-purple-900/30 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-16 h-12 rounded-xl overflow-hidden bg-[#07040f] border border-purple-900/40 shrink-0 relative flex items-center justify-center">
                        {!imageError ? (
                          <img
                            src={formData.thumbnail}
                            alt="Preview"
                            className="w-full h-full object-cover"
                            onError={() => setImageError(true)}
                          />
                        ) : (
                          <div className="flex flex-col items-center justify-center text-purple-400/60 text-[10px]">
                            <ImageIcon className="w-4 h-4 text-rose-400" />
                            <span>Failed</span>
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="text-xs font-medium text-purple-200 truncate">Thumbnail Active</p>
                          {imageError ? (
                            <span className="px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 text-[9px] font-semibold">Image Broken</span>
                          ) : (
                            <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[9px] font-semibold flex items-center gap-0.5">
                              <Check className="w-2.5 h-2.5" /> Ready
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] font-mono text-purple-400/60 truncate max-w-sm">{formData.thumbnail}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={handleFetchPreview}
                        className="px-2.5 py-1 text-[11px] text-purple-300 hover:text-white hover:bg-purple-600/20 rounded-lg transition-colors cursor-pointer"
                        title="Re-fetch thumbnail from URL"
                      >
                        Re-fetch
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setFormData({ ...formData, thumbnail: '' });
                          setImageError(false);
                        }}
                        className="px-2.5 py-1 text-[11px] text-purple-400/70 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                      >
                        Clear
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-3.5 rounded-2xl bg-[#140d2e]/40 border border-dashed border-purple-900/40 flex items-center justify-between gap-3 text-xs text-purple-300/70">
                    <div className="flex items-center gap-2">
                      <ImageIcon className="w-4 h-4 text-purple-400" />
                      <span>No thumbnail image assigned.</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleFetchPreview}
                        className="px-2.5 py-1 rounded-lg bg-purple-600/20 hover:bg-purple-600/30 text-purple-200 text-[11px] font-medium transition-colors cursor-pointer"
                      >
                        Auto-detect Thumbnail
                      </button>
                      <button
                        type="button"
                        onClick={handleUseDomainIcon}
                        className="px-2.5 py-1 rounded-lg bg-[#140d2e] hover:bg-[#1a1138] text-purple-200 border border-purple-900/40 text-[11px] font-medium transition-colors cursor-pointer"
                      >
                        Use Favicon
                      </button>
                    </div>
                  </div>
                )}

                {/* Tags */}
                <div>
                  <label className="block text-xs font-mono font-semibold text-purple-200 mb-1">Tags (Comma-separated)</label>
                  <input
                    type="text"
                    placeholder="react, web, tools, ai"
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#090515] border border-purple-900/40 text-purple-100 text-xs focus:border-purple-500 focus:outline-none transition-all"
                  />
                </div>

                {/* 18+ NSFW Adult Content Toggle */}
                <div className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                  formData.isNsfw ? 'bg-purple-950/40 border-purple-600/50 shadow-[0_0_15px_rgba(168,85,247,0.15)]' : 'bg-[#140d2e]/60 border-purple-900/30'
                }`}>
                  <div>
                    <p className={`text-xs font-semibold ${formData.isNsfw ? 'text-purple-200' : 'text-purple-300'}`}>
                      18+ / NSFW Classification
                    </p>
                    <p className="text-[11px] text-purple-400/80">
                      {formData.isNsfw ? 'Visible in mature channel filter' : 'Flag as mature content'}
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isNsfw}
                      onChange={(e) => handleNsfwToggle(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-10 h-5 bg-[#090515] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-600 border border-purple-800 peer-checked:border-purple-400"></div>
                  </label>
                </div>
              </>
            ) : (
              /* LIVE PREVIEW TAB VIEW */
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4 text-purple-400" />
                    <h4 className="font-display font-semibold text-xs text-white uppercase tracking-wider">
                      Interactive Live Preview
                    </h4>
                  </div>
                  <span className="text-[11px] font-mono text-purple-300/70">
                    Live rendering with current form modifications
                  </span>
                </div>

                {/* Embedded Player Preview if available */}
                {resource.embedType && resource.embedType !== 'NONE' && (
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-purple-200 flex items-center gap-1.5">
                      <Play className="w-3.5 h-3.5 text-purple-400" />
                      <span>Embedded Player Simulation</span>
                    </p>
                    <div className="rounded-2xl overflow-hidden border border-purple-900/40">
                      <EmbeddedPlayer resource={previewResource} />
                    </div>
                  </div>
                )}

                {/* Card Grid Preview */}
                <div className="space-y-2">
                  <p className="text-xs font-medium text-purple-200 flex items-center gap-1.5">
                    <LayoutGrid className="w-3.5 h-3.5 text-purple-400" />
                    <span>Grid Card Appearance</span>
                  </p>

                  <div className="max-w-sm mx-auto p-4 rounded-3xl bg-[#07040f] border border-purple-900/40 shadow-inner">
                    <div className="bg-[#0d081e] rounded-2xl overflow-hidden border border-purple-900/30 flex flex-col justify-between group shadow-md">
                      {/* Thumbnail Header */}
                      <div className="relative aspect-video w-full overflow-hidden bg-black flex items-center justify-center">
                        {formData.thumbnail && !imageError ? (
                          <img
                            src={formData.thumbnail}
                            alt={formData.title}
                            className="w-full h-full object-cover"
                            onError={() => setImageError(true)}
                          />
                        ) : (
                          <div className="flex flex-col items-center justify-center p-4 text-center">
                            <div className="w-10 h-10 rounded-2xl bg-[#140d2e] border border-purple-900/40 flex items-center justify-center mb-1 text-purple-400">
                              {formData.resourceType === 'VIDEO' ? <Video className="w-5 h-5" /> : <Globe className="w-5 h-5" />}
                            </div>
                            <span className="text-[11px] font-mono text-purple-300/70 truncate max-w-[170px]">{previewResource.domain}</span>
                          </div>
                        )}

                        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none">
                          <span className="px-2 py-0.5 rounded-lg bg-[#07040f]/90 text-[9px] font-mono font-bold text-purple-300 border border-purple-500/30 uppercase tracking-wider">
                            {formData.resourceType}
                          </span>
                          {formData.isNsfw && (
                            <span className="px-2 py-0.5 rounded-lg bg-purple-950/90 text-[9px] font-mono font-bold text-purple-300 border border-purple-500/40 uppercase tracking-wider">
                              18+ NSFW
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Card Content */}
                      <div className="p-4 space-y-2 text-left">
                        <div className="flex items-center gap-1.5 text-[11px] text-purple-300/70 font-mono">
                          <img
                            src={`https://www.google.com/s2/favicons?domain=${previewResource.domain}&sz=64`}
                            alt=""
                            className="w-3.5 h-3.5 rounded-full shrink-0"
                            onError={(e) => { e.target.style.display = 'none'; }}
                          />
                          <span className="truncate">{previewResource.domain}</span>
                        </div>

                        <h3 className="font-display font-semibold text-sm text-white line-clamp-2 leading-snug">
                          {formData.title || 'Untitled Resource'}
                        </h3>

                        {formData.description && (
                          <p className="text-xs text-purple-200/70 line-clamp-2 leading-relaxed">
                            {formData.description}
                          </p>
                        )}

                        {formData.tags && (
                          <div className="flex flex-wrap gap-1 pt-1">
                            {String(formData.tags).split(',').slice(0, 3).map((tag, idx) => (
                              <span key={idx} className="text-[10px] text-purple-300 font-mono bg-[#140d2e] px-2 py-0.5 rounded-lg border border-purple-900/40">
                                #{tag.trim()}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Telemetry Summary Table */}
                <div className="bg-[#07040f] rounded-2xl p-4 border border-purple-900/40 space-y-2 text-xs">
                  <h5 className="font-semibold text-purple-200">Resource Telemetry Details</h5>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px]">
                    <div>
                      <span className="text-purple-400/60 block">Category:</span>
                      <span className="text-purple-200 font-medium">{selectedCatObj?.name || 'Unassigned'}</span>
                    </div>
                    <div>
                      <span className="text-purple-400/60 block">Visibility:</span>
                      <span className="text-purple-200 font-medium">{formData.status}</span>
                    </div>
                    <div>
                      <span className="text-purple-400/60 block">Embed Mode:</span>
                      <span className="text-purple-200 font-medium font-mono">{resource.embedType || 'NONE'}</span>
                    </div>
                  </div>
                </div>

              </div>
            )}

          </div>

          {/* Pinned Action Footer */}
          <div className="px-6 py-4 border-t border-purple-900/30 bg-[#0d081e] flex items-center justify-between gap-3 shrink-0">
            <div className="text-xs text-purple-300/70">
              {activeTab === 'preview' ? (
                <button
                  type="button"
                  onClick={() => setActiveTab('form')}
                  className="text-purple-400 hover:text-purple-300 flex items-center gap-1 cursor-pointer font-mono"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Back to Edit Form</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setActiveTab('preview')}
                  className="text-purple-400 hover:text-purple-300 flex items-center gap-1 cursor-pointer font-mono"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Switch to Live Preview</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-mono text-purple-300/70 hover:text-white cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-mono font-semibold text-xs shadow-[0_0_20px_rgba(147,51,234,0.35)] transition-all disabled:opacity-50 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>{loading ? 'Saving...' : 'Save Changes'}</span>
              </button>
            </div>
          </div>

        </form>

      </motion.div>
    </div>,
    document.body
  );
};
