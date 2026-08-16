import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import API from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { X, Link2, Sparkles, AlertTriangle, CheckCircle2, RefreshCw, Globe, Video, Image as ImageIcon, FileText, Music, UserCheck, Shield } from 'lucide-react';

const FALLBACK_CATEGORIES = [
  { _id: 'technology', name: 'Technology' },
  { _id: 'programming', name: 'Programming' },
  { _id: 'gaming', name: 'Gaming' },
  { _id: 'education', name: 'Education' },
  { _id: 'entertainment', name: 'Entertainment' },
  { _id: 'music', name: 'Music' },
  { _id: 'fashion', name: 'Fashion' },
  { _id: 'sports', name: 'Sports' },
  { _id: 'news', name: 'News' },
  { _id: 'art', name: 'Art' },
  { _id: 'lifestyle', name: 'Lifestyle' },
  { _id: 'other', name: 'Other' },
  { _id: 'sex', name: 'Sex' }
];

export const SubmitModal = ({ isOpen, onClose, categories = [], onResourceSubmitted }) => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const activeCategories = (categories && categories.length > 0) ? categories : FALLBACK_CATEGORIES;

  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [tags, setTags] = useState('');
  const [resourceType, setResourceType] = useState('WEBSITE');
  const [thumbnail, setThumbnail] = useState('');

  const [fetchingPreview, setFetchingPreview] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [previewData, setPreviewData] = useState(null);

  useEffect(() => {
    if (activeCategories && activeCategories.length > 0 && !category) {
      setCategory(activeCategories[0]._id);
    }
  }, [activeCategories, category]);

  if (!isOpen) return null;

  const handleFetchPreview = async () => {
    if (!url.trim()) {
      showToast('Please enter a valid URL', 'info');
      return;
    }

    setFetchingPreview(true);
    try {
      const res = await API.post('/resources/metadata-preview', { url: url.trim() });
      if (res.data.success) {
        const p = res.data;
        setPreviewData(p);
        if (p.metadata.title) setTitle(p.metadata.title);
        if (p.metadata.description) setDescription(p.metadata.description);
        if (p.metadata.thumbnail) setThumbnail(p.metadata.thumbnail);
        if (p.metadata.resourceType) setResourceType(p.metadata.resourceType);

        if (p.isDuplicate) {
          showToast('Warning: This link is already submitted to AuraLink', 'info');
        } else {
          showToast('Metadata fetched successfully!', 'success');
        }
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Could not auto-fetch URL metadata. You can enter details manually.', 'info');
    } finally {
      setFetchingPreview(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!url.trim() || !title.trim() || !category) {
      showToast('Please fill in URL, Title, and Category', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const res = await API.post('/resources', {
        url: url.trim(),
        title: title.trim(),
        description: description.trim(),
        category,
        tags: tags ? tags.split(',').map(t => t.trim()) : [],
        resourceType,
        thumbnail
      });

      if (res.data.success) {
        showToast('Link submitted successfully to AuraLink!', 'success');
        if (onResourceSubmitted) onResourceSubmitted(res.data.data);
        onClose();
        // Reset form
        setUrl('');
        setTitle('');
        setDescription('');
        setTags('');
        setPreviewData(null);
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Submission failed.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-dark-950/80 backdrop-blur-md overflow-y-auto animate-fade-in">
      <div className="relative w-full max-w-xl glass-modal rounded-3xl p-6 sm:p-8 shadow-2xl border border-sky-500/30 my-8">
        
        {/* Modal Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-white rounded-full bg-dark-800/60 hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-500 to-cyan-400 p-0.5 shadow-glow flex items-center justify-center">
            <div className="w-full h-full bg-dark-900 rounded-[14px] flex items-center justify-center text-sky-400">
              <Link2 className="w-5 h-5" />
            </div>
          </div>
          <div>
            <h2 className="font-display font-bold text-xl text-white">Submit New Link</h2>
            <p className="text-xs text-slate-400">Public resource indexing & media discovery</p>
          </div>
        </div>

        {/* Identity Indicator */}
        <div className="mb-6 px-4 py-2.5 rounded-xl bg-dark-800/80 border border-slate-700/60 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-sky-400" />
            <span className="text-slate-300 font-medium">Submitting as:</span>
          </div>
          <span className="font-mono font-bold text-sky-300">
            {user ? `@${user.username}` : `Anonymous (Auto Identifier)`}
          </span>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          
          {/* URL Input with Auto-Fetch */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Resource URL *
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                required
                placeholder="https://youtube.com/watch?v=... or https://example.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="flex-1 bg-dark-900 text-sm text-slate-100 placeholder-slate-500 px-4 py-2.5 rounded-xl border border-slate-700 focus:border-sky-400 outline-none"
              />
              <button
                type="button"
                onClick={handleFetchPreview}
                disabled={fetchingPreview}
                className="px-4 py-2.5 rounded-xl bg-dark-700 hover:bg-slate-700 text-sky-300 font-semibold text-xs border border-sky-500/30 flex items-center gap-1.5 shrink-0 transition-colors cursor-pointer"
              >
                {fetchingPreview ? (
                  <RefreshCw className="w-4 h-4 animate-spin text-sky-400" />
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-cyan-400" />
                    <span>Auto-Fetch</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Duplicate Link Warning Banner */}
          {previewData && previewData.isDuplicate && (
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
              <span>
                Note: This normalized URL has already been registered on AuraLink. Submitting it again may be blocked.
              </span>
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Free Interactive WebGL Shaders & Effects"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-dark-900 text-sm text-slate-100 placeholder-slate-500 px-4 py-2.5 rounded-xl border border-slate-700 focus:border-sky-400 outline-none transition-colors"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Description (Optional)
            </label>
            <textarea
              rows={2}
              placeholder="What makes this link valuable? Context helps others discover it..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-dark-900 text-sm text-slate-100 placeholder-slate-500 px-4 py-2.5 rounded-xl border border-slate-700 focus:border-sky-400 outline-none resize-none transition-colors"
            />
          </div>

          {/* Category & Type Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Category Dropdown */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-dark-900 text-sm text-slate-100 px-4 py-2.5 rounded-xl border border-slate-700 focus:border-sky-400 outline-none transition-colors"
              >
                <option value="">Select Category</option>
                {activeCategories.map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Resource Type
              </label>
              <select
                value={resourceType}
                onChange={(e) => setResourceType(e.target.value)}
                className="w-full bg-dark-900 text-sm text-slate-100 px-4 py-2.5 rounded-xl border border-slate-700 focus:border-sky-400 outline-none"
              >
                <option value="VIDEO">Video</option>
                <option value="WEBSITE">Website</option>
                <option value="ARTICLE">Article</option>
                <option value="IMAGE">Image</option>
                <option value="AUDIO">Audio</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Tags (comma separated)
            </label>
            <input
              type="text"
              placeholder="e.g. react, tutorial, webdev, javascript"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="w-full bg-dark-900 text-sm text-slate-100 placeholder-slate-500 px-4 py-2.5 rounded-xl border border-slate-700 focus:border-sky-400 outline-none font-mono"
            />
          </div>

          {/* Submit Action Buttons */}
          <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-cyan-500 text-slate-950 font-bold text-xs shadow-glow hover:scale-105 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
            >
              {submitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Publishing...</span>
                </>
              ) : (
                <span>Publish Link</span>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>,
    document.body
  );
};
