import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Share2,
  Sparkles,
  Link2,
  FileText,
  Video,
  Image as ImageIcon,
  Music,
  Send,
  Copy,
  ExternalLink,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  Download,
  Smartphone,
  Info,
  Layers,
  Globe,
  Radio,
  RefreshCw,
  Plus,
  Play,
  Check,
  ShieldCheck,
  HelpCircle,
  FolderPlus
} from 'lucide-react';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { parseUniversalShareInput } from '../services/share/urlExtractor';
import { detectAndParseUrl, PLATFORM_TYPES } from '../services/share/platformParsers';
import { processSharedFile, revokeFilePreviews, formatFileSize } from '../services/share/fileHandler';
import { getSharedPayload, deleteSharedPayload, pruneOldSharedPayloads } from '../services/share/indexedDb';

export function ShareTargetPage({ categories = [], onResourceSubmitted }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();

  const fileInputRef = useRef(null);

  // Raw & Parsed State
  const [manualInput, setManualInput] = useState('');
  const [parsedData, setParsedData] = useState(null);
  const [platformInfo, setPlatformInfo] = useState(null);
  const [sharedFiles, setSharedFiles] = useState([]);
  const [isProcessing, setIsProcessing] = useState(true);

  // Resource Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [resourceType, setResourceType] = useState('WEBSITE');
  const [tags, setTags] = useState([]);
  const [customTagInput, setCustomTagInput] = useState('');
  const [isNsfw, setIsNsfw] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  // PWA Install State
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isPwaInstalled, setIsPwaInstalled] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [activeTab, setActiveTab] = useState('receiver'); // 'receiver' | 'simulator' | 'guide'

  // Listen for PWA beforeinstallprompt event
  useEffect(() => {
    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    const handleAppInstalled = () => {
      setIsPwaInstalled(true);
      setDeferredPrompt(null);
      showToast('AuraLink PWA installed successfully!', 'success');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleAppInstalled);

    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsPwaInstalled(true);
    }

    pruneOldSharedPayloads();

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [showToast]);

  const handleInstallPwa = async () => {
    if (!deferredPrompt) {
      setShowGuide(true);
      return;
    }
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsPwaInstalled(true);
      setDeferredPrompt(null);
    }
  };

  // -------------------------------------------------------------
  // Process Share Input (URLs, Text, Files)
  // -------------------------------------------------------------
  const processShareInput = useCallback((rawTitle, rawText, rawUrl, rawFiles = []) => {
    const parsed = parseUniversalShareInput({
      title: rawTitle || '',
      text: rawText || '',
      url: rawUrl || ''
    });

    setParsedData(parsed);

    // Platform analysis if URL exists
    let detected = null;
    if (parsed.hasUrl && parsed.primaryUrl) {
      detected = detectAndParseUrl(parsed.primaryUrl);
      setPlatformInfo(detected);
    } else {
      setPlatformInfo(null);
    }

    // Process Files
    const processedFilesList = rawFiles.map(f => processSharedFile(f)).filter(Boolean);
    setSharedFiles(processedFilesList);

    // Auto-populate form fields
    const defaultTitle = parsed.title ||
      (detected ? `${detected.platformName} Content` : '') ||
      (processedFilesList.length > 0 ? processedFilesList[0].name : '') ||
      'Shared Link';

    setTitle(defaultTitle);
    setDescription(parsed.cleanText || '');

    // Suggested resource type
    if (processedFilesList.length > 0) {
      setResourceType(processedFilesList[0].classification?.suggestedResourceType || 'DOCUMENT');
    } else if (detected) {
      setResourceType(detected.resourceType || 'WEBSITE');
    } else {
      setResourceType('WEBSITE');
    }

    // Category suggestions
    const suggestedCat = detected?.suggestedCategory || (processedFilesList.length > 0 ? processedFilesList[0].classification?.suggestedCategory : 'technology');
    if (categories && categories.length > 0) {
      const match = categories.find(c => c.slug === suggestedCat || c._id === suggestedCat || c.name.toLowerCase() === suggestedCat.toLowerCase());
      setSelectedCategory(match ? match._id : categories[0]._id);
    }

    // Merge hashtags & detected tags
    const combinedTags = [...new Set([
      ...(parsed.hashtags || []),
      ...(detected?.tags || [])
    ])];
    setTags(combinedTags);

    setIsProcessing(false);
  }, [categories]);

  // -------------------------------------------------------------
  // Intake on Mount (Query Params & IndexedDB)
  // -------------------------------------------------------------
  useEffect(() => {
    const initShareTarget = async () => {
      setIsProcessing(true);

      const shareId = searchParams.get('share_id');
      const paramUrl = searchParams.get('url');
      const paramText = searchParams.get('text');
      const paramTitle = searchParams.get('title');

      // 1. From IndexedDB (POST share target with files)
      if (shareId) {
        try {
          const payload = await getSharedPayload(shareId);
          if (payload) {
            processShareInput(payload.title, payload.text, payload.url, payload.files || []);
            // Clean payload from DB after reading
            await deleteSharedPayload(shareId);
            return;
          }
        } catch (err) {
          console.warn('Error reading share from IndexedDB:', err);
        }
      }

      // 2. From GET Query Parameters (e.g. ?url=...&text=...&title=...)
      if (paramUrl || paramText || paramTitle) {
        processShareInput(paramTitle, paramText, paramUrl, []);
        return;
      }

      // 3. No direct share intent received → Wait for manual input
      setIsProcessing(false);
    };

    initShareTarget();

    return () => {
      revokeFilePreviews(sharedFiles);
    };
  }, [searchParams, processShareInput]);

  // Clean up object URLs on unmount
  useEffect(() => {
    return () => {
      revokeFilePreviews(sharedFiles);
    };
  }, [sharedFiles]);

  // -------------------------------------------------------------
  // Manual Input Trigger
  // -------------------------------------------------------------
  const handleManualProcess = (e) => {
    e?.preventDefault();
    if (!manualInput.trim()) {
      showToast('Please paste a URL or text to process', 'info');
      return;
    }
    processShareInput('', manualInput, '', []);
    showToast('Shared text analyzed successfully!', 'success');
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    processShareInput(files[0].name, '', '', files);
    showToast(`Received ${files.length} file(s)`, 'success');
  };

  const handleAddTag = () => {
    const trimmed = customTagInput.trim().replace(/^#/, '').toLowerCase();
    if (trimmed && !tags.includes(trimmed)) {
      setTags(prev => [...prev, trimmed]);
      setCustomTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setTags(prev => prev.filter(t => t !== tagToRemove));
  };

  const handleCopyLink = () => {
    const urlToCopy = parsedData?.primaryUrl || manualInput;
    if (!urlToCopy) return;
    navigator.clipboard.writeText(urlToCopy);
    setIsCopied(true);
    showToast('Link copied to clipboard!', 'success');
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleReset = () => {
    revokeFilePreviews(sharedFiles);
    setParsedData(null);
    setPlatformInfo(null);
    setSharedFiles([]);
    setManualInput('');
    setTitle('');
    setDescription('');
    setTags([]);
    setSearchParams({});
    showToast('Cleared share workspace', 'info');
  };

  // -------------------------------------------------------------
  // Save Resource to Database
  // -------------------------------------------------------------
  const handleSaveResource = async (e) => {
    e?.preventDefault();

    if (!user) {
      showToast('Please sign in to save this resource', 'info');
      return;
    }

    if (!title.trim()) {
      showToast('Please provide a title for the resource', 'error');
      return;
    }

    const finalUrl = parsedData?.primaryUrl || '';
    if (!finalUrl && sharedFiles.length === 0) {
      showToast('A valid link or file is required to save', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        title: title.trim(),
        description: description.trim(),
        url: finalUrl || 'https://auralink.app/file/' + (sharedFiles[0]?.name || 'shared'),
        category: selectedCategory || (categories[0]?._id || 'other'),
        resourceType,
        tags,
        isNsfw,
        thumbnail: platformInfo?.thumbnail || ''
      };

      const res = await API.post('/resources', payload);
      if (res.data?.success) {
        showToast('Resource saved to AuraLink library!', 'success');
        if (onResourceSubmitted) {
          onResourceSubmitted(res.data.data);
        } else {
          navigate(`/resources/${res.data.data._id}`);
        }
      } else {
        showToast(res.data?.message || 'Failed to save resource', 'error');
      }
    } catch (err) {
      console.error('Error saving shared resource:', err);
      showToast(err.response?.data?.message || 'Failed to save resource', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // -------------------------------------------------------------
  // Simulator Pre-Sets
  // -------------------------------------------------------------
  const loadPreset = (presetType) => {
    switch (presetType) {
      case 'youtube_video':
        processShareInput(
          'Rick Astley - Never Gonna Give You Up (Official Music Video)',
          'Check out this classic video! https://www.youtube.com/watch?v=dQw4w9WgXcQ?si=trackXYZ',
          'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
        );
        showToast('Loaded YouTube Video preset', 'info');
        break;

      case 'youtube_shorts':
        processShareInput(
          'Insane Web Tricks',
          'Watch this quick short: https://youtube.com/shorts/5-2nB8-55pE?si=shortTracker',
          'https://youtube.com/shorts/5-2nB8-55pE'
        );
        showToast('Loaded YouTube Shorts preset', 'info');
        break;

      case 'instagram':
        processShareInput(
          'Instagram Reel Share',
          'Check out this reel https://www.instagram.com/reel/C8xyz123/?igsh=tracker123',
          'https://www.instagram.com/reel/C8xyz123/'
        );
        showToast('Loaded Instagram preset', 'info');
        break;

      case 'twitter':
        processShareInput(
          'X Status Share',
          'Breaking news update: https://x.com/OpenAI/status/1789718786358763520?s=20 #AI #Tech',
          'https://x.com/OpenAI/status/1789718786358763520'
        );
        showToast('Loaded X / Twitter preset', 'info');
        break;

      case 'spotify':
        processShareInput(
          'Spotify Track',
          'Vibe with this track: https://open.spotify.com/track/4cOdK2wGLETKBW3PvgPWqT?si=spotifyTracker',
          'https://open.spotify.com/track/4cOdK2wGLETKBW3PvgPWqT'
        );
        showToast('Loaded Spotify preset', 'info');
        break;

      case 'messy_text':
        processShareInput(
          '',
          'Hey guys, look at this article from TechCrunch! https://techcrunch.com/2026/01/15/future-of-ai-agents/ it has some great insights. #future #tech',
          ''
        );
        showToast('Loaded Messy Text preset', 'info');
        break;

      default:
        break;
    }
  };

  const hasReceivedData = Boolean(parsedData?.hasUrl || sharedFiles.length > 0 || parsedData?.cleanText);

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
      {/* Header & Status Banner */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800/80 pb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Share2 className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold font-display text-white tracking-tight flex items-center gap-2.5">
                Web Share Target
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-medium border border-cyan-500/30">
                  Universal Receiver
                </span>
              </h1>
              <p className="text-sm text-zinc-400">
                Native OS Share Sheet receiver & intelligent media parser
              </p>
            </div>
          </div>
        </div>

        {/* Tab / Mode Switcher */}
        <div className="flex items-center gap-2 bg-zinc-900/80 p-1 rounded-xl border border-zinc-800">
          <button
            onClick={() => setActiveTab('receiver')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'receiver'
                ? 'bg-cyan-500 text-zinc-950 shadow-md font-semibold'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Receiver
          </button>
          <button
            onClick={() => setActiveTab('simulator')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
              activeTab === 'simulator'
                ? 'bg-cyan-500 text-zinc-950 shadow-md font-semibold'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Share Simulator
          </button>
          <button
            onClick={() => setActiveTab('guide')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
              activeTab === 'guide'
                ? 'bg-cyan-500 text-zinc-950 shadow-md font-semibold'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            Install PWA
          </button>
        </div>
      </div>

      {/* PWA Installation Prompt Bar (If not yet standalone) */}
      {!isPwaInstalled && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 p-4 rounded-2xl bg-gradient-to-r from-cyan-950/50 via-indigo-950/40 to-purple-950/50 border border-cyan-500/30 backdrop-blur-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg shadow-cyan-950/30"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-300 shrink-0">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">
                Enable Native OS Share Sheet Integration
              </p>
              <p className="text-xs text-zinc-300">
                Install AuraLink to receive links, videos, and files directly from YouTube, Instagram, Gallery, and other apps.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
            <button
              onClick={handleInstallPwa}
              className="w-full sm:w-auto px-4 py-2 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-zinc-950 font-semibold text-xs transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              Install PWA
            </button>
            <button
              onClick={() => setActiveTab('guide')}
              className="px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs transition-all cursor-pointer"
            >
              Guide
            </button>
          </div>
        </motion.div>
      )}

      {/* --------------------------------------------------------- */}
      {/* TAB 1: RECEIVER & PARSER WORKSPACE                       */}
      {/* --------------------------------------------------------- */}
      {activeTab === 'receiver' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Card / Receiver Deck */}
          <div className="lg:col-span-8 space-y-6">
            {/* Live Shared Intake Preview Card */}
            {hasReceivedData ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-6 rounded-2xl bg-zinc-900/90 border border-zinc-800 shadow-xl relative overflow-hidden backdrop-blur-xl"
              >
                {/* Brand / Platform Glow Accent */}
                <div
                  className="absolute top-0 right-0 w-48 h-48 rounded-full blur-3xl opacity-20 pointer-events-none"
                  style={{ backgroundColor: platformInfo?.color || '#06B6D4' }}
                />

                {/* Top Badge & Reset */}
                <div className="flex items-center justify-between mb-4 border-b border-zinc-800/80 pb-3">
                  <div className="flex items-center gap-2.5">
                    {platformInfo && (
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold border flex items-center gap-1.5 ${platformInfo.brandBg}`}>
                        <Globe className="w-3.5 h-3.5" />
                        {platformInfo.platformName}
                      </span>
                    )}
                    {sharedFiles.length > 0 && (
                      <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-purple-500/10 border border-purple-500/30 text-purple-400 flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5" />
                        {sharedFiles.length} Shared File(s)
                      </span>
                    )}
                    <span className="text-xs text-zinc-400 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      Sanitized & Verified
                    </span>
                  </div>

                  <button
                    onClick={handleReset}
                    className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors text-xs flex items-center gap-1 cursor-pointer"
                    title="Clear content"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span className="hidden sm:inline">Reset</span>
                  </button>
                </div>

                {/* Primary Media / Embed Previews */}
                <div className="mb-6">
                  {/* YouTube Embed Preview */}
                  {platformInfo?.platform === PLATFORM_TYPES.YOUTUBE && platformInfo.embedUrl && (
                    <div className="rounded-xl overflow-hidden border border-zinc-800 bg-black aspect-video mb-4 shadow-lg">
                      <iframe
                        src={platformInfo.embedUrl}
                        title="YouTube video player"
                        className="w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                      />
                    </div>
                  )}

                  {/* Spotify Embed Preview */}
                  {platformInfo?.platform === PLATFORM_TYPES.SPOTIFY && platformInfo.embedUrl && (
                    <div className="rounded-xl overflow-hidden mb-4 border border-emerald-500/20">
                      <iframe
                        src={platformInfo.embedUrl}
                        width="100%"
                        height="152"
                        frameBorder="0"
                        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                        loading="lazy"
                        title="Spotify embed"
                      />
                    </div>
                  )}

                  {/* Shared File Previews (Image, Video, Audio) */}
                  {sharedFiles.length > 0 && (
                    <div className="space-y-3 mb-4">
                      {sharedFiles.map((file, idx) => (
                        <div key={idx} className="p-4 rounded-xl bg-zinc-950/70 border border-zinc-800/80">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className="p-1.5 rounded-lg bg-zinc-800 text-cyan-400">
                                {file.classification?.category === 'IMAGE' ? <ImageIcon className="w-4 h-4" /> :
                                 file.classification?.category === 'VIDEO' ? <Video className="w-4 h-4" /> :
                                 file.classification?.category === 'AUDIO' ? <Music className="w-4 h-4" /> :
                                 <FileText className="w-4 h-4" />}
                              </span>
                              <div>
                                <p className="text-xs font-semibold text-zinc-200 truncate max-w-xs">{file.name}</p>
                                <p className="text-[10px] text-zinc-400">{file.sizeFormatted} • {file.type}</p>
                              </div>
                            </div>
                            <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-800 text-zinc-300">
                              {file.classification?.label}
                            </span>
                          </div>

                          {/* Image preview */}
                          {file.classification?.category === 'IMAGE' && file.objectUrl && (
                            <div className="rounded-lg overflow-hidden max-h-64 border border-zinc-800 flex items-center justify-center bg-zinc-900">
                              <img src={file.objectUrl} alt={file.name} className="max-h-64 object-contain" />
                            </div>
                          )}

                          {/* Video preview */}
                          {file.classification?.category === 'VIDEO' && file.objectUrl && (
                            <video controls className="w-full rounded-lg max-h-64 bg-black">
                              <source src={file.objectUrl} type={file.type} />
                              Your browser does not support HTML5 video preview.
                            </video>
                          )}

                          {/* Audio preview */}
                          {file.classification?.category === 'AUDIO' && file.objectUrl && (
                            <audio controls className="w-full mt-2">
                              <source src={file.objectUrl} type={file.type} />
                              Your browser does not support HTML5 audio preview.
                            </audio>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Clean Detected URL Display */}
                  {parsedData?.primaryUrl && (
                    <div className="p-3.5 rounded-xl bg-zinc-950/80 border border-zinc-800 flex items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-2 truncate">
                        <Link2 className="w-4 h-4 text-cyan-400 shrink-0" />
                        <span className="text-zinc-300 truncate font-mono">{parsedData.primaryUrl}</span>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={handleCopyLink}
                          className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors"
                          title="Copy clean URL"
                        >
                          {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                        <a
                          href={parsedData.primaryUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors"
                          title="Open original link"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </div>
                  )}
                </div>

                {/* Edit & Save Form */}
                <form onSubmit={handleSaveResource} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                      Resource Title <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Title of video, link, or media..."
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white text-sm focus:border-cyan-500 focus:outline-none transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                      Description / Caption Note
                    </label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Add an optional description or notes..."
                      rows={3}
                      className="w-full px-3.5 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-white text-sm focus:border-cyan-500 focus:outline-none transition-colors resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                        Category
                      </label>
                      <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white text-xs focus:border-cyan-500 focus:outline-none capitalize"
                      >
                        {categories.map((c) => (
                          <option key={c._id} value={c._id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                        Resource Type
                      </label>
                      <select
                        value={resourceType}
                        onChange={(e) => setResourceType(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white text-xs focus:border-cyan-500 focus:outline-none"
                      >
                        <option value="VIDEO">Video</option>
                        <option value="WEBSITE">Website / Article</option>
                        <option value="IMAGE">Image / Graphic</option>
                        <option value="MUSIC">Music / Podcast</option>
                        <option value="DOCUMENT">Document / PDF</option>
                        <option value="TOOL">Tool / Repository</option>
                      </select>
                    </div>
                  </div>

                  {/* Tags Pill Editor */}
                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                      Tags & Keywords
                    </label>
                    <div className="flex flex-wrap items-center gap-2 p-2 rounded-xl bg-zinc-950 border border-zinc-800 min-h-[42px]">
                      {tags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-1 rounded-lg bg-zinc-800 text-cyan-300 text-xs flex items-center gap-1.5 border border-zinc-700/60"
                        >
                          #{tag}
                          <button
                            type="button"
                            onClick={() => handleRemoveTag(tag)}
                            className="text-zinc-400 hover:text-rose-400 transition-colors"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                      <input
                        type="text"
                        value={customTagInput}
                        onChange={(e) => setCustomTagInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ',') {
                            e.preventDefault();
                            handleAddTag();
                          }
                        }}
                        placeholder="Add tag and press Enter..."
                        className="bg-transparent text-xs text-white placeholder-zinc-500 focus:outline-none flex-1 min-w-[120px] px-1"
                      />
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="pt-2 flex items-center justify-between gap-3 border-t border-zinc-800/80">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="share-nsfw"
                        checked={isNsfw}
                        onChange={(e) => setIsNsfw(e.target.checked)}
                        className="rounded border-zinc-700 bg-zinc-900 text-purple-600 focus:ring-purple-500"
                      />
                      <label htmlFor="share-nsfw" className="text-xs text-zinc-400 cursor-pointer">
                        Mark as 18+ / Sensitive
                      </label>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-zinc-950 font-bold text-xs transition-all shadow-lg shadow-cyan-500/20 flex items-center gap-2 disabled:opacity-50 cursor-pointer"
                    >
                      {isSubmitting ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <FolderPlus className="w-4 h-4" />
                          Save to AuraLink
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </motion.div>
            ) : (
              /* Empty Receiver State / Manual Paste Zone */
              <div className="p-8 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 text-center space-y-6">
                <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mx-auto text-cyan-400 shadow-inner">
                  <Share2 className="w-8 h-8" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white mb-1">
                    Ready to Receive Content
                  </h2>
                  <p className="text-xs text-zinc-400 max-w-md mx-auto">
                    Share any link, video, caption, or file from your apps directly to AuraLink, or paste raw text below.
                  </p>
                </div>

                {/* Manual Input Form */}
                <form onSubmit={handleManualProcess} className="max-w-lg mx-auto space-y-3">
                  <textarea
                    value={manualInput}
                    onChange={(e) => setManualInput(e.target.value)}
                    placeholder="Paste a YouTube link, Instagram post, X thread, or text with links here..."
                    rows={4}
                    className="w-full px-4 py-3 rounded-xl bg-zinc-950 border border-zinc-800 text-white text-sm focus:border-cyan-500 focus:outline-none transition-colors resize-none placeholder-zinc-600"
                  />

                  <div className="flex items-center gap-2 justify-center">
                    <button
                      type="submit"
                      className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-bold text-xs transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
                    >
                      <Sparkles className="w-4 h-4" />
                      Parse & Process
                    </button>

                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <ImageIcon className="w-4 h-4 text-purple-400" />
                      Select File
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      onChange={handleFileUpload}
                      className="hidden"
                      accept="image/*,video/*,audio/*,application/pdf,text/*"
                    />
                  </div>
                </form>
              </div>
            )}
          </div>

          {/* Right Sidebar: Supported Platforms & Quick Tips */}
          <div className="lg:col-span-4 space-y-6">
            {/* Supported Platforms Card */}
            <div className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-cyan-400" />
                Universal Platform Support
              </h3>
              <p className="text-xs text-zinc-400">
                AuraLink automatically identifies and optimizes metadata for major services:
              </p>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2 rounded-lg bg-zinc-950/80 border border-zinc-800 flex items-center gap-2 text-zinc-300">
                  <span className="w-2 h-2 rounded-full bg-red-500" />
                  YouTube / Shorts
                </div>
                <div className="p-2 rounded-lg bg-zinc-950/80 border border-zinc-800 flex items-center gap-2 text-zinc-300">
                  <span className="w-2 h-2 rounded-full bg-pink-500" />
                  Instagram Reels
                </div>
                <div className="p-2 rounded-lg bg-zinc-950/80 border border-zinc-800 flex items-center gap-2 text-zinc-300">
                  <span className="w-2 h-2 rounded-full bg-sky-500" />
                  X / Twitter
                </div>
                <div className="p-2 rounded-lg bg-zinc-950/80 border border-zinc-800 flex items-center gap-2 text-zinc-300">
                  <span className="w-2 h-2 rounded-full bg-teal-400" />
                  TikTok Videos
                </div>
                <div className="p-2 rounded-lg bg-zinc-950/80 border border-zinc-800 flex items-center gap-2 text-zinc-300">
                  <span className="w-2 h-2 rounded-full bg-blue-600" />
                  Facebook Watch
                </div>
                <div className="p-2 rounded-lg bg-zinc-950/80 border border-zinc-800 flex items-center gap-2 text-zinc-300">
                  <span className="w-2 h-2 rounded-full bg-orange-500" />
                  Reddit Threads
                </div>
                <div className="p-2 rounded-lg bg-zinc-950/80 border border-zinc-800 flex items-center gap-2 text-zinc-300">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  Spotify Music
                </div>
                <div className="p-2 rounded-lg bg-zinc-950/80 border border-zinc-800 flex items-center gap-2 text-zinc-300">
                  <span className="w-2 h-2 rounded-full bg-indigo-500" />
                  Web Articles & PDFs
                </div>
              </div>
            </div>

            {/* Privacy & Security Guarantee */}
            <div className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-2.5 text-xs text-zinc-400">
              <div className="flex items-center gap-2 text-white font-semibold">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Security & Untrusted Input Protection
              </div>
              <ul className="space-y-1.5 list-disc list-inside text-zinc-400">
                <li>Strict URL protocol whitelist (HTTPS/HTTP).</li>
                <li>Tracking parameters automatically removed.</li>
                <li>No automatic upload without explicit user save action.</li>
                <li>Executable scripts and binaries blocked.</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* --------------------------------------------------------- */}
      {/* TAB 2: INTERACTIVE SHARE SIMULATOR                        */}
      {/* --------------------------------------------------------- */}
      {activeTab === 'simulator' && (
        <div className="p-6 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-6">
          <div className="border-b border-zinc-800 pb-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-cyan-400" />
              Share Target Simulator Playground
            </h2>
            <p className="text-xs text-zinc-400">
              Test how the Web Share Target responds to shares from various apps without needing an Android device.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <button
              onClick={() => { loadPreset('youtube_video'); setActiveTab('receiver'); }}
              className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 hover:border-red-500/50 transition-all text-left group cursor-pointer"
            >
              <div className="flex items-center gap-2.5 mb-2">
                <span className="p-2 rounded-lg bg-red-500/10 text-red-400 group-hover:scale-110 transition-transform">
                  <Play className="w-4 h-4" />
                </span>
                <span className="text-sm font-semibold text-white">YouTube Video</span>
              </div>
              <p className="text-xs text-zinc-400">
                Simulate sharing a regular video link with video ID & thumbnail detection.
              </p>
            </button>

            <button
              onClick={() => { loadPreset('youtube_shorts'); setActiveTab('receiver'); }}
              className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 hover:border-red-500/50 transition-all text-left group cursor-pointer"
            >
              <div className="flex items-center gap-2.5 mb-2">
                <span className="p-2 rounded-lg bg-red-500/10 text-red-400 group-hover:scale-110 transition-transform">
                  <Smartphone className="w-4 h-4" />
                </span>
                <span className="text-sm font-semibold text-white">YouTube Shorts</span>
              </div>
              <p className="text-xs text-zinc-400">
                Simulate sharing YouTube Shorts `/shorts/` link with tracker parameters.
              </p>
            </button>

            <button
              onClick={() => { loadPreset('instagram'); setActiveTab('receiver'); }}
              className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 hover:border-pink-500/50 transition-all text-left group cursor-pointer"
            >
              <div className="flex items-center gap-2.5 mb-2">
                <span className="p-2 rounded-lg bg-pink-500/10 text-pink-400 group-hover:scale-110 transition-transform">
                  <ImageIcon className="w-4 h-4" />
                </span>
                <span className="text-sm font-semibold text-white">Instagram Reel</span>
              </div>
              <p className="text-xs text-zinc-400">
                Simulate sharing an Instagram reel with shortcode extraction.
              </p>
            </button>

            <button
              onClick={() => { loadPreset('twitter'); setActiveTab('receiver'); }}
              className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 hover:border-sky-500/50 transition-all text-left group cursor-pointer"
            >
              <div className="flex items-center gap-2.5 mb-2">
                <span className="p-2 rounded-lg bg-sky-500/10 text-sky-400 group-hover:scale-110 transition-transform">
                  <Send className="w-4 h-4" />
                </span>
                <span className="text-sm font-semibold text-white">X / Twitter Post</span>
              </div>
              <p className="text-xs text-zinc-400">
                Simulate tweet share with handle, status ID, and hashtag parser.
              </p>
            </button>

            <button
              onClick={() => { loadPreset('spotify'); setActiveTab('receiver'); }}
              className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 hover:border-emerald-500/50 transition-all text-left group cursor-pointer"
            >
              <div className="flex items-center gap-2.5 mb-2">
                <span className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 group-hover:scale-110 transition-transform">
                  <Music className="w-4 h-4" />
                </span>
                <span className="text-sm font-semibold text-white">Spotify Track</span>
              </div>
              <p className="text-xs text-zinc-400">
                Simulate music track sharing with embedded player widget.
              </p>
            </button>

            <button
              onClick={() => { loadPreset('messy_text'); setActiveTab('receiver'); }}
              className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 hover:border-cyan-500/50 transition-all text-left group cursor-pointer"
            >
              <div className="flex items-center gap-2.5 mb-2">
                <span className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 group-hover:scale-110 transition-transform">
                  <FileText className="w-4 h-4" />
                </span>
                <span className="text-sm font-semibold text-white">Messy Caption + URL</span>
              </div>
              <p className="text-xs text-zinc-400">
                Simulate multi-sentence text with embedded URLs and hashtags.
              </p>
            </button>
          </div>
        </div>
      )}

      {/* --------------------------------------------------------- */}
      {/* TAB 3: PWA INSTALLATION & OS COMPATIBILITY GUIDE          */}
      {/* --------------------------------------------------------- */}
      {activeTab === 'guide' && (
        <div className="p-6 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-6">
          <div className="border-b border-zinc-800 pb-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-cyan-400" />
              Web Share Target & PWA Installation Guide
            </h2>
            <p className="text-xs text-zinc-400">
              How the native share target API operates across mobile and desktop devices.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Android Guide */}
            <div className="p-5 rounded-xl bg-zinc-950 border border-zinc-800 space-y-3">
              <div className="flex items-center gap-2 text-white font-semibold text-sm">
                <span className="w-3 h-3 rounded-full bg-emerald-400" />
                Android (Chrome, Edge, Samsung Internet, Brave)
              </div>
              <p className="text-xs text-zinc-300">
                Full native Web Share Target support for URLs, texts, and multipart files (Level 1 & Level 2).
              </p>
              <ol className="text-xs text-zinc-400 space-y-1.5 list-decimal list-inside">
                <li>Open AuraLink in Chrome or Edge on Android.</li>
                <li>Tap the browser menu (⋮) and select <strong>Install App</strong> or <strong>Add to Home screen</strong>.</li>
                <li>Once installed, open any app (YouTube, Instagram, Gallery, Chrome).</li>
                <li>Tap <strong>Share</strong> and select <strong>AuraLink</strong> from your app list!</li>
              </ol>
            </div>

            {/* iOS Safari Guide */}
            <div className="p-5 rounded-xl bg-zinc-950 border border-zinc-800 space-y-3">
              <div className="flex items-center gap-2 text-white font-semibold text-sm">
                <span className="w-3 h-3 rounded-full bg-amber-400" />
                iOS / iPadOS (Safari & WebKit)
              </div>
              <p className="text-xs text-zinc-300">
                Apple does not yet support the incoming Web Share Target API. Use our instant clipboard paste fallback:
              </p>
              <ol className="text-xs text-zinc-400 space-y-1.5 list-decimal list-inside">
                <li>In any iOS app (YouTube/Instagram), tap <strong>Share → Copy Link</strong>.</li>
                <li>Open AuraLink (or tap your Home Screen icon).</li>
                <li>Navigate to <strong>Share Target</strong> and paste into the quick receiver box.</li>
              </ol>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
