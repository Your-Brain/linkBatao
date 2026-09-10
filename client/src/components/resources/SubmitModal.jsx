import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import API from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { detectIsAdultContent, getSuggestedAdultTags } from '../../services/share/platformParsers';
import {
  X,
  Link2,
  Sparkles,
  AlertTriangle,
  RefreshCw,
  Shield,
  Send,
  Radio,
  Layers,
  FileText,
  Tag
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
  const [isNsfw, setIsNsfw] = useState(false);

  const [fetchingPreview, setFetchingPreview] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [previewData, setPreviewData] = useState(null);

  useEffect(() => {
    if (activeCategories && activeCategories.length > 0 && !category) {
      setCategory(activeCategories[0]._id);
    }
  }, [activeCategories, category]);

  // Helper to append tags without duplicates
  const appendTags = (newTagList) => {
    setTags(prev => {
      const current = prev ? prev.split(',').map(t => t.trim().toLowerCase()).filter(Boolean) : [];
      const combined = [...new Set([...current, ...newTagList.map(t => t.toLowerCase())])];
      return combined.join(', ');
    });
  };

  const handleUrlChange = (newUrl) => {
    setUrl(newUrl);
    if (newUrl && detectIsAdultContent(newUrl)) {
      setIsNsfw(true);
      const sexCat = activeCategories.find(c => c.slug === 'sex' || c.name?.toLowerCase() === 'sex');
      if (sexCat) setCategory(sexCat._id);
      const suggested = getSuggestedAdultTags(newUrl);
      appendTags(suggested);
    }
  };

  const handleCategoryChange = (newCatId) => {
    setCategory(newCatId);
    const selectedCat = activeCategories.find(c => c._id === newCatId || c.slug === newCatId);
    if (selectedCat && (selectedCat.slug === 'sex' || selectedCat.name?.toLowerCase() === 'sex')) {
      setIsNsfw(true);
      appendTags(['18+', 'adult', 'nsfw']);
    }
  };

  const handleNsfwToggle = (checked) => {
    setIsNsfw(checked);
    if (checked) {
      const sexCat = activeCategories.find(c => c.slug === 'sex' || c.name?.toLowerCase() === 'sex');
      if (sexCat) setCategory(sexCat._id);
      appendTags(['18+', 'adult', 'nsfw']);
    }
  };

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

        // Auto-detect 18+ adult content from preview metadata
        const isAdult = Boolean(
          p.metadata.isNsfw ||
          detectIsAdultContent(url, p.metadata.title, p.metadata.description)
        );

        if (isAdult) {
          setIsNsfw(true);
          const sexCat = activeCategories.find(c => c.slug === 'sex' || c.name?.toLowerCase() === 'sex');
          if (sexCat) setCategory(sexCat._id);
          const suggested = getSuggestedAdultTags(p.domain || url);
          appendTags(suggested);
        }

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
        tags: tags ? tags.split(',').map(t => t.trim()).filter(Boolean) : [],
        resourceType,
        thumbnail,
        isNsfw
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
        setIsNsfw(false);
        setPreviewData(null);
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Transmission failed.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-[#07040f]/85 backdrop-blur-xl overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 8 }}
        transition={{ duration: 0.2 }}
        className="relative w-full max-w-xl bg-[#0d081e] rounded-3xl p-6 sm:p-8 shadow-2xl border border-purple-900/40 my-8 hud-bracket text-left"
      >
        {/* Modal Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-purple-300 hover:text-white rounded-xl bg-[#140d2e] border border-purple-900/40 hover:border-purple-500/50 transition-all cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 p-[1px] shadow-[0_0_15px_rgba(147,51,234,0.35)] flex items-center justify-center">
            <div className="w-full h-full bg-[#0d081e] rounded-[15px] flex items-center justify-center text-purple-400">
              <Link2 className="w-5 h-5" />
            </div>
          </div>
          <div>
            <h2 className="font-display font-bold text-lg text-white">Transmit New Link Signal</h2>
            <p className="text-[11px] font-mono text-purple-300/70">Public resource indexing & telemetry discovery</p>
          </div>
        </div>

        {/* Identity Indicator */}
        <div className="mb-5 px-3.5 py-2.5 rounded-xl bg-[#140d2e]/80 border border-purple-900/30 flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-2">
            <Radio className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
            <span className="text-purple-300/70">TRANSMISSION ORIGIN:</span>
          </div>
          <span className="font-bold text-purple-300">
            {user ? `@${user.username}` : `ANONYMOUS (AUTO IDENTIFIER)`}
          </span>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-4 text-left">

          {/* URL Input with Auto-Fetch */}
          <div>
            <label className="block text-[11px] font-mono font-semibold text-purple-200 uppercase tracking-wider mb-1.5">
              Resource URL *
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                required
                placeholder="https://youtube.com/watch?v=... or https://example.com"
                value={url}
                onChange={(e) => handleUrlChange(e.target.value)}
                className="flex-1 bg-[#090515] text-xs text-purple-100 placeholder-purple-400/40 px-3.5 py-2.5 rounded-xl border border-purple-900/40 focus:border-purple-500 focus:ring-1 focus:ring-purple-500/30 outline-none font-mono transition-all"
              />
              <button
                type="button"
                onClick={handleFetchPreview}
                disabled={fetchingPreview}
                className="px-3.5 py-2.5 rounded-xl bg-[#1a1138] hover:bg-purple-900/40 text-purple-200 font-mono font-semibold text-xs border border-purple-700/40 flex items-center gap-1.5 shrink-0 transition-all cursor-pointer hover:border-purple-500/60 disabled:opacity-50"
              >
                {fetchingPreview ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-purple-400" />
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-purple-400" />
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
            <label className="block text-[11px] font-mono font-semibold text-purple-200 uppercase tracking-wider mb-1.5">
              Title *
            </label>
            <input
              type="text"
              required
              placeholder="Descriptive resource title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-[#090515] text-xs text-purple-100 placeholder-purple-400/40 px-3.5 py-2.5 rounded-xl border border-purple-900/40 focus:border-purple-500 focus:ring-1 focus:ring-purple-500/30 outline-none transition-all"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-[11px] font-mono font-semibold text-purple-200 uppercase tracking-wider mb-1.5">
              Description
            </label>
            <textarea
              rows={2}
              placeholder="Brief description of the link or tool..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-[#090515] text-xs text-purple-100 placeholder-purple-400/40 px-3.5 py-2.5 rounded-xl border border-purple-900/40 focus:border-purple-500 focus:ring-1 focus:ring-purple-500/30 outline-none transition-all resize-none"
            />
          </div>

          {/* Category & Type Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-mono font-semibold text-purple-200 uppercase tracking-wider mb-1.5">
                Category *
              </label>
              <select
                value={category}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="w-full bg-[#090515] text-xs font-mono text-purple-100 px-3.5 py-2.5 rounded-xl border border-purple-900/40 focus:border-purple-500 focus:ring-1 focus:ring-purple-500/30 outline-none cursor-pointer transition-all capitalize"
              >
                {activeCategories.map((c) => (
                  <option key={c._id} value={c._id} className="bg-[#0d081e] text-purple-200">
                    {c.name} {c.slug === 'sex' || c.name?.toLowerCase() === 'sex' ? '(18+ NSFW)' : ''}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-mono font-semibold text-purple-200 uppercase tracking-wider mb-1.5">
                Resource Type
              </label>
              <select
                value={resourceType}
                onChange={(e) => setResourceType(e.target.value)}
                className="w-full bg-[#090515] text-xs font-mono text-purple-100 px-3.5 py-2.5 rounded-xl border border-purple-900/40 focus:border-purple-500 focus:ring-1 focus:ring-purple-500/30 outline-none cursor-pointer transition-all"
              >
                <option value="WEBSITE" className="bg-[#0d081e]">Website / Tool</option>
                <option value="VIDEO" className="bg-[#0d081e]">Video / Stream</option>
                <option value="ARTICLE" className="bg-[#0d081e]">Article / Paper</option>
                <option value="IMAGE" className="bg-[#0d081e]">Image / Graphic</option>
                <option value="MUSIC" className="bg-[#0d081e]">Audio / Track</option>
                <option value="OTHER" className="bg-[#0d081e]">Other Media</option>
              </select>
            </div>
          </div>

          {/* 18+ NSFW Adult Content Toggle */}
          <div className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
            isNsfw ? 'bg-purple-950/40 border-purple-600/50 shadow-[0_0_15px_rgba(168,85,247,0.15)]' : 'bg-[#140d2e]/60 border-purple-900/30'
          }`}>
            <div className="flex items-center gap-2.5 min-w-0">
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border ${
                isNsfw ? 'bg-purple-600/20 text-purple-300 border-purple-500/40' : 'bg-[#090515] text-purple-400 border-purple-900/40'
              }`}>
                <Shield className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className={`text-xs font-mono font-bold truncate ${isNsfw ? 'text-purple-200' : 'text-purple-300'}`}>
                  18+ / NSFW Adult Signal
                </p>
                <p className="text-[10px] text-purple-400/80 font-mono truncate">
                  {isNsfw ? 'Categorized under Adult network partition (18+ Active)' : 'Flag as mature content'}
                </p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input
                type="checkbox"
                checked={isNsfw}
                onChange={(e) => handleNsfwToggle(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-10 h-5 bg-[#090515] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-600 border border-purple-800 peer-checked:border-purple-400"></div>
            </label>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-[11px] font-mono font-semibold text-purple-200 uppercase tracking-wider mb-1.5">
              Tags (Comma separated)
            </label>
            <input
              type="text"
              placeholder="react, webdev, shaders, javascript"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="w-full bg-[#090515] text-xs font-mono text-purple-100 placeholder-purple-400/40 px-3.5 py-2.5 rounded-xl border border-purple-900/40 focus:border-purple-500 focus:ring-1 focus:ring-purple-500/30 outline-none transition-all"
            />
          </div>

          {/* Submit Action Buttons */}
          <div className="pt-3 flex items-center justify-end gap-2.5 border-t border-purple-900/30">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-mono text-purple-300/70 hover:text-white transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold font-mono text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(147,51,234,0.35)] transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
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
