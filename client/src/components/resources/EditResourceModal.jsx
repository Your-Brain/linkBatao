import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import API from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { X, Save, Edit3, Link, Tag, Globe, Sparkles } from 'lucide-react';

export const EditResourceModal = ({ isOpen, onClose, resource, onResourceUpdated }) => {
  const { showToast } = useToast();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

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
        showToast('Resource telemetry updated successfully!', 'success');
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
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 bg-[#03050a]/85 backdrop-blur-xl overflow-hidden">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 8 }}
        transition={{ duration: 0.2 }}
        className="relative w-full max-w-xl glass-modal rounded-3xl border border-cyan-500/30 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden text-left hud-bracket"
      >
        {/* Pinned Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-[#070b17] shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Edit3 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-display font-bold text-base text-white">Modify Resource Parameters</h3>
              <p className="text-[11px] font-mono text-slate-400">Update signal metadata and moderation status</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden min-h-0">
          <div className="p-6 overflow-y-auto space-y-4 flex-1">

            {/* Title */}
            <div>
              <label className="block text-[11px] font-mono font-semibold text-slate-300 mb-1">Signal Title *</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#090e1d] border border-slate-800 text-white text-xs focus:border-cyan-400 focus:outline-none transition-colors"
                placeholder="Resource title"
              />
            </div>

            {/* Target URL */}
            <div>
              <label className="block text-[11px] font-mono font-semibold text-slate-300 mb-1">Destination URL *</label>
              <input
                type="url"
                required
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#090e1d] border border-slate-800 text-white text-xs focus:border-cyan-400 focus:outline-none font-mono"
                placeholder="https://example.com"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-[11px] font-mono font-semibold text-slate-300 mb-1">Telemetry Description</label>
              <textarea
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#090e1d] border border-slate-800 text-white text-xs focus:border-cyan-400 focus:outline-none resize-none"
                placeholder="Provide a helpful description..."
              />
            </div>

            {/* Category & Resource Type */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-mono font-semibold text-slate-300 mb-1">Channel</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#090e1d] border border-slate-800 text-white text-xs font-mono focus:border-cyan-400 focus:outline-none cursor-pointer"
                >
                  <option value="">Select Channel</option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-mono font-semibold text-slate-300 mb-1">Media Class</label>
                <select
                  value={formData.resourceType}
                  onChange={(e) => setFormData({ ...formData, resourceType: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#090e1d] border border-slate-800 text-white text-xs font-mono focus:border-cyan-400 focus:outline-none cursor-pointer"
                >
                  <option value="WEBSITE">Website / Tool</option>
                  <option value="VIDEO">Video / Stream</option>
                  <option value="ARTICLE">Article / Paper</option>
                  <option value="IMAGE">Image / Graphic</option>
                  <option value="AUDIO">Audio / Track</option>
                </select>
              </div>
            </div>

            {/* Visibility Status & Thumbnail */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-mono font-semibold text-slate-300 mb-1">Status (Visibility)</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#090e1d] border border-slate-800 text-white text-xs font-mono font-bold focus:border-cyan-400 focus:outline-none cursor-pointer"
                >
                  <option value="APPROVED" className="text-emerald-400">APPROVED (Visible to Users)</option>
                  <option value="REMOVED" className="text-rose-400">REMOVED (Hidden from Users)</option>
                  <option value="PENDING" className="text-amber-400">PENDING (In Moderation)</option>
                  <option value="REJECTED" className="text-slate-400">REJECTED (Hidden)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-mono font-semibold text-slate-300 mb-1">Thumbnail Stream URL</label>
                <input
                  type="text"
                  placeholder="https://..."
                  value={formData.thumbnail}
                  onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#090e1d] border border-slate-800 text-white text-xs font-mono focus:border-cyan-400 focus:outline-none"
                />
              </div>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-[11px] font-mono font-semibold text-slate-300 mb-1">Tags (Comma-separated)</label>
              <input
                type="text"
                placeholder="ai, dev, video, tools"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#090e1d] border border-slate-800 text-white text-xs font-mono focus:border-cyan-400 focus:outline-none"
              />
            </div>

            {/* 18+ NSFW Adult Content Toggle */}
            <div className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
              formData.isNsfw ? 'bg-purple-950/30 border-purple-500/50' : 'bg-[#090e1d] border-slate-800'
            }`}>
              <div>
                <p className={`text-xs font-mono font-bold ${formData.isNsfw ? 'text-purple-200' : 'text-slate-300'}`}>
                  18+ / NSFW Adult Classification
                </p>
                <p className="text-[10px] text-slate-400 font-mono">
                  {formData.isNsfw ? 'Visible exclusively in Incognito Mode' : 'Flag as adult/explicit content'}
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isNsfw}
                  onChange={(e) => setFormData({ ...formData, isNsfw: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-dark-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-500 border border-slate-700 peer-checked:border-purple-400"></div>
              </label>
            </div>

          </div>

          {/* Pinned Action Footer */}
          <div className="px-6 py-4 border-t border-slate-800 bg-[#050811] flex items-center justify-end gap-3 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-mono text-slate-400 hover:text-white cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-sky-500 text-slate-950 font-bold font-mono text-xs uppercase tracking-wider shadow-glow hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{loading ? 'Saving...' : 'Commit Changes'}</span>
            </button>
          </div>

        </form>

      </motion.div>
    </div>,
    document.body
  );
};
