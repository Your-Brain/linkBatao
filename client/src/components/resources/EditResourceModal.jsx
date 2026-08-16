import React, { useState, useEffect } from 'react';
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
    tags: ''
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
        tags: Array.isArray(resource.tags) ? resource.tags.join(', ') : (resource.tags || '')
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-dark-950/85 backdrop-blur-md animate-fade-in overflow-hidden">
      <div className="relative w-full max-w-xl glass-modal rounded-3xl border border-sky-500/30 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden text-left">
        
        {/* Pinned Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/80 bg-dark-900/60 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400">
              <Edit3 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-display font-bold text-base sm:text-lg text-white">Edit Resource Details</h3>
              <p className="text-[11px] text-slate-400">Update link metadata and visibility status</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden min-h-0">
          <div className="p-6 overflow-y-auto space-y-4 flex-1">
            
            {/* Title */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Title *</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-dark-900/80 border border-slate-700 text-white text-xs focus:border-sky-400 focus:outline-none transition-colors"
                placeholder="Resource title"
              />
            </div>

            {/* Target URL */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Resource URL *</label>
              <input
                type="url"
                required
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-dark-900/80 border border-slate-700 text-white text-xs focus:border-sky-400 focus:outline-none transition-colors font-mono"
                placeholder="https://example.com"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Description</label>
              <textarea
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-dark-900/80 border border-slate-700 text-white text-xs focus:border-sky-400 focus:outline-none resize-none transition-colors"
                placeholder="Provide a helpful description..."
              />
            </div>

            {/* Category & Resource Type */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-dark-900/80 border border-slate-700 text-white text-xs focus:border-sky-400 focus:outline-none transition-colors"
                >
                  <option value="">Select Category</option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Type</label>
                <select
                  value={formData.resourceType}
                  onChange={(e) => setFormData({ ...formData, resourceType: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-dark-900/80 border border-slate-700 text-white text-xs focus:border-sky-400 focus:outline-none transition-colors"
                >
                  <option value="WEBSITE">Website</option>
                  <option value="VIDEO">Video</option>
                  <option value="ARTICLE">Article</option>
                  <option value="IMAGE">Image</option>
                  <option value="AUDIO">Audio</option>
                </select>
              </div>
            </div>

            {/* Visibility Status & Thumbnail */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Status (Visibility)</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-dark-900/80 border border-slate-700 text-white text-xs focus:border-sky-400 focus:outline-none font-bold transition-colors"
                >
                  <option value="APPROVED" className="text-emerald-400">APPROVED (Visible to Users)</option>
                  <option value="REMOVED" className="text-rose-400">REMOVED (Hidden from Users)</option>
                  <option value="PENDING" className="text-amber-400">PENDING (In Moderation)</option>
                  <option value="REJECTED" className="text-slate-400">REJECTED (Hidden)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Thumbnail URL</label>
                <input
                  type="text"
                  placeholder="https://..."
                  value={formData.thumbnail}
                  onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-dark-900/80 border border-slate-700 text-white text-xs focus:border-sky-400 focus:outline-none transition-colors"
                />
              </div>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Tags (Comma-separated)</label>
              <input
                type="text"
                placeholder="ai, dev, video, tools"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-dark-900/80 border border-slate-700 text-white text-xs focus:border-sky-400 focus:outline-none transition-colors"
              />
            </div>

          </div>

          {/* Pinned Action Footer */}
          <div className="px-6 py-4 border-t border-slate-800/80 bg-dark-950/90 backdrop-blur-md flex items-center justify-end gap-3 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-cyan-500 text-slate-950 font-bold text-xs shadow-glow hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{loading ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
