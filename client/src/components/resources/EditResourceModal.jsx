import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import API from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { X, Save, Edit3, Sparkles, RefreshCw, Image as ImageIcon, ExternalLink } from 'lucide-react';

export const EditResourceModal = ({ isOpen, onClose, resource, onResourceUpdated }) => {
  const { showToast } = useToast();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchingPreview, setFetchingPreview] = useState(false);

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
        console.error('Failed to load categories', err);
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
    }
  }, [resource]);

  if (!isOpen || !resource) return null;

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
        const updates = { ...formData };

        if (p.metadata.title) updates.title = p.metadata.title;
        if (p.metadata.description) updates.description = p.metadata.description;
        if (p.metadata.thumbnail) updates.thumbnail = p.metadata.thumbnail;
        if (p.metadata.resourceType) updates.resourceType = p.metadata.resourceType;
        if (p.metadata.isNsfw !== undefined) {
          updates.isNsfw = Boolean(p.metadata.isNsfw);
          if (p.metadata.isNsfw) {
            const sexCat = categories.find(c => c.slug === 'sex' || c.name?.toLowerCase() === 'sex');
            if (sexCat) updates.category = sexCat._id;
          }
        }

        setFormData(updates);
        showToast('Telemetry & metadata re-fetched successfully!', 'success');
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Could not auto-fetch metadata for this URL.', 'error');
    } finally {
      setFetchingPreview(false);
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
      const res = await API.put(`/resources/${resource._id}`, formData);
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

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 bg-zinc-950/80 backdrop-blur-md overflow-hidden">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 6 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 6 }}
        transition={{ duration: 0.15 }}
        className="relative w-full max-w-xl bg-zinc-900 rounded-2xl border border-zinc-800 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden text-left"
      >
        {/* Pinned Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-900 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-600/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Edit3 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-white">Edit Resource</h3>
              <p className="text-xs text-zinc-400">Update resource metadata, re-fetch telemetry, or modify status</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden min-h-0">
          <div className="p-6 overflow-y-auto space-y-4 flex-1">

            {/* Target URL with Re-fetch Action */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-medium text-zinc-300">Target URL *</label>
                <button
                  type="button"
                  onClick={handleFetchPreview}
                  disabled={fetchingPreview || !formData.url}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-[11px] font-medium transition-all cursor-pointer disabled:opacity-40"
                  title="Re-fetch title, description, thumbnail, and media type from URL"
                >
                  {fetchingPreview ? (
                    <>
                      <RefreshCw className="w-3 h-3 animate-spin text-indigo-400" />
                      <span>Re-fetching...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3 h-3 text-indigo-400" />
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
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  className="flex-1 px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white text-xs focus:border-indigo-500 focus:outline-none font-mono"
                  placeholder="https://example.com"
                />
                {formData.url && (
                  <a
                    href={formData.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2.5 rounded-xl bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-white transition-colors flex items-center justify-center shrink-0"
                    title="Open URL in new tab"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">Title *</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white text-xs focus:border-indigo-500 focus:outline-none transition-colors"
                placeholder="Resource title"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">Description</label>
              <textarea
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white text-xs focus:border-indigo-500 focus:outline-none resize-none"
                placeholder="Provide a helpful description..."
              />
            </div>

            {/* Category & Resource Type */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white text-xs focus:border-indigo-500 focus:outline-none cursor-pointer"
                >
                  <option value="">Select Category</option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      {cat.name} {cat.slug === 'sex' || cat.name?.toLowerCase() === 'sex' ? '(18+ NSFW)' : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">Media Type</label>
                <select
                  value={formData.resourceType}
                  onChange={(e) => setFormData({ ...formData, resourceType: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white text-xs focus:border-indigo-500 focus:outline-none cursor-pointer"
                >
                  <option value="WEBSITE">Website / Tool</option>
                  <option value="VIDEO">Video / Stream</option>
                  <option value="ARTICLE">Article / Post</option>
                  <option value="IMAGE">Image / Graphic</option>
                  <option value="AUDIO">Audio / Track</option>
                  <option value="OTHER">Other Media</option>
                </select>
              </div>
            </div>

            {/* Visibility Status & Thumbnail */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white text-xs font-semibold focus:border-indigo-500 focus:outline-none cursor-pointer"
                >
                  <option value="APPROVED" className="text-emerald-400">Approved (Visible)</option>
                  <option value="REMOVED" className="text-rose-400">Removed (Hidden)</option>
                  <option value="PENDING" className="text-amber-400">Pending Review</option>
                  <option value="REJECTED" className="text-zinc-400">Rejected</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">Thumbnail URL</label>
                <input
                  type="text"
                  placeholder="https://..."
                  value={formData.thumbnail}
                  onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white text-xs font-mono focus:border-indigo-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Thumbnail Live Preview */}
            {formData.thumbnail && (
              <div className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center gap-3">
                <div className="w-14 h-10 rounded-lg overflow-hidden bg-zinc-900 border border-zinc-800 shrink-0 relative flex items-center justify-center">
                  <img
                    src={formData.thumbnail}
                    alt="Preview"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                  <ImageIcon className="w-4 h-4 text-zinc-600 absolute pointer-events-none" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-medium text-zinc-300 truncate">Thumbnail Live Preview</p>
                  <p className="text-[10px] font-mono text-zinc-500 truncate">{formData.thumbnail}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, thumbnail: '' })}
                  className="px-2 py-1 text-[10px] text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-md transition-colors"
                >
                  Clear
                </button>
              </div>
            )}

            {/* Tags */}
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">Tags (Comma-separated)</label>
              <input
                type="text"
                placeholder="ai, tools, web"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white text-xs focus:border-indigo-500 focus:outline-none"
              />
            </div>

            {/* 18+ NSFW Adult Content Toggle */}
            <div className={`p-3 rounded-xl border transition-all flex items-center justify-between gap-3 ${
              formData.isNsfw ? 'bg-purple-950/30 border-purple-800' : 'bg-zinc-950 border-zinc-800'
            }`}>
              <div>
                <p className={`text-xs font-semibold ${formData.isNsfw ? 'text-purple-200' : 'text-zinc-300'}`}>
                  18+ / NSFW Classification
                </p>
                <p className="text-[11px] text-zinc-400">
                  {formData.isNsfw ? 'Visible exclusively in Incognito Mode' : 'Flag as mature content'}
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isNsfw}
                  onChange={(e) => setFormData({ ...formData, isNsfw: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-600 border border-zinc-700 peer-checked:border-purple-500"></div>
              </label>
            </div>

          </div>

          {/* Pinned Action Footer */}
          <div className="px-6 py-4 border-t border-zinc-800 bg-zinc-950 flex items-center justify-end gap-3 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-zinc-400 hover:text-white cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs shadow-sm transition-all disabled:opacity-50 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{loading ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>

        </form>

      </motion.div>
    </div>,
    document.body
  );
};
