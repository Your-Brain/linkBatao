import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import API from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import {
  X,
  Link2,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Globe,
  Video,
  Image as ImageIcon,
  FileText,
  Music,
  UserCheck,
  Shield,
  Send,
  Radio
} from 'lucide-react';

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
          showToast('Notice: This signal is already registered on AuraLink', 'info');
        } else {
          showToast('Telemetry metadata fetched successfully!', 'success');
        }
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Could not auto-fetch metadata. Enter parameters manually.', 'info');
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
        showToast('Link signal transmitted successfully to network!', 'success');
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
      showToast(err.response?.data?.message || 'Transmission failed.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-[#03050a]/85 backdrop-blur-xl overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 8 }}
        transition={{ duration: 0.2 }}
        className="relative w-full max-w-xl glass-modal rounded-3xl p-6 sm:p-8 shadow-2xl border border-cyan-500/30 my-8 hud-bracket text-left"
      >
        {/* Modal Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 text-slate-400 hover:text-white rounded-xl bg-[#090e1d] border border-slate-800 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-sky-600 p-[1px] shadow-glow flex items-center justify-center">
            <div className="w-full h-full bg-[#050811] rounded-[11px] flex items-center justify-center text-cyan-400">
              <Link2 className="w-4 h-4" />
            </div>
          </div>
          <div>
            <h2 className="font-display font-bold text-lg text-white">Transmit New Link Signal</h2>
            <p className="text-[11px] font-mono text-slate-400">Public resource indexing & telemetry discovery</p>
          </div>
        </div>

        {/* Identity Indicator */}
        <div className="mb-5 px-3.5 py-2 rounded-xl bg-[#090e1d] border border-slate-800 flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-2">
            <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span className="text-slate-400">TRANSMISSION ORIGIN:</span>
          </div>
          <span className="font-bold text-cyan-300">
            {user ? `@${user.username}` : `ANONYMOUS (AUTO IDENTIFIER)`}
          </span>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-4 text-left">

          {/* URL Input with Auto-Fetch */}
          <div>
            <label className="block text-[11px] font-mono font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Resource URL *
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                required
                placeholder="https://youtube.com/watch?v=... or https://example.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="flex-1 bg-[#090e1d] text-xs text-slate-100 placeholder-slate-500 px-3.5 py-2.5 rounded-xl border border-slate-800 focus:border-cyan-400 outline-none font-mono"
              />
              <button
                type="button"
                onClick={handleFetchPreview}
                disabled={fetchingPreview}
                className="px-3.5 py-2.5 rounded-xl bg-[#0e162c] hover:bg-slate-700 text-cyan-300 font-mono font-semibold text-xs border border-cyan-500/30 flex items-center gap-1.5 shrink-0 transition-colors cursor-pointer"
              >
                {fetchingPreview ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-cyan-400" />
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Auto-Fetch</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Duplicate Warning Banner */}
          {previewData && previewData.isDuplicate && (
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
              <span>
                Note: This normalized URL is already recorded in the global index. Submitting duplicate might be rejected.
              </span>
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-[11px] font-mono font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Free Interactive WebGL Shaders & Effects"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-[#090e1d] text-xs text-slate-100 placeholder-slate-500 px-3.5 py-2.5 rounded-xl border border-slate-800 focus:border-cyan-400 outline-none"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-[11px] font-mono font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Description (Optional)
            </label>
            <textarea
              rows={2}
              placeholder="What makes this link valuable? Provide context for the network..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-[#090e1d] text-xs text-slate-100 placeholder-slate-500 px-3.5 py-2.5 rounded-xl border border-slate-800 focus:border-cyan-400 outline-none resize-none"
            />
          </div>

          {/* Category & Type Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-mono font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Channel / Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-[#090e1d] text-xs font-mono text-slate-100 px-3.5 py-2.5 rounded-xl border border-slate-800 focus:border-cyan-400 outline-none cursor-pointer"
              >
                <option value="">Select Channel</option>
                {activeCategories.map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-mono font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Media Class
              </label>
              <select
                value={resourceType}
                onChange={(e) => setResourceType(e.target.value)}
                className="w-full bg-[#090e1d] text-xs font-mono text-slate-100 px-3.5 py-2.5 rounded-xl border border-slate-800 focus:border-cyan-400 outline-none cursor-pointer"
              >
                <option value="VIDEO">Video / Stream</option>
                <option value="WEBSITE">Website / Tool</option>
                <option value="ARTICLE">Article / Paper</option>
                <option value="IMAGE">Image / Graphic</option>
                <option value="AUDIO">Audio / Track</option>
                <option value="OTHER">Other Media</option>
              </select>
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-[11px] font-mono font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Tags (Comma separated)
            </label>
            <input
              type="text"
              placeholder="react, webdev, shaders, javascript"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="w-full bg-[#090e1d] text-xs font-mono text-slate-100 placeholder-slate-500 px-3.5 py-2.5 rounded-xl border border-slate-800 focus:border-cyan-400 outline-none"
            />
          </div>

          {/* Submit Action Buttons */}
          <div className="pt-3 flex items-center justify-end gap-2.5 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-mono text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-sky-500 text-slate-950 font-bold font-mono text-xs uppercase tracking-wider shadow-glow transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Transmitting...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Broadcast Link</span>
                </>
              )}
            </motion.button>
          </div>

        </form>

      </motion.div>
    </div>,
    document.body
  );
};
