import React, { useState } from 'react';
import { ExternalLink, Play, AlertCircle, RefreshCw, Volume2, Maximize2, FileText, Copy, Check, Type, BookOpen } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

export const EmbeddedPlayer = ({ resource }) => {
  const [loading, setLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isLargeFont, setIsLargeFont] = useState(false);
  const { showToast } = useToast();

  if (!resource) return null;

  const { embedType, embedUrl, url, title, thumbnail, domain, content, description, resourceType, isTextPost } = resource;

  const textBody = (content || (isTextPost ? description : '') || '').trim();
  const isArticleOrBlog = Boolean(textBody || resourceType === 'ARTICLE');

  const handleCopyText = () => {
    const textToCopy = `${title}\n\n${textBody || description}`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    showToast('Article text copied to clipboard!', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  // Render Blog / Article Reader View for text-based resources
  if (isArticleOrBlog && textBody) {
    const wordCount = textBody.split(/\s+/).filter(Boolean).length;
    const readingTime = Math.max(1, Math.ceil(wordCount / 200));

    return (
      <div className="relative rounded-3xl bg-[#0c081e] p-6 sm:p-8 border border-purple-900/50 shadow-2xl space-y-6 hud-bracket text-left overflow-hidden">
        {/* Blog Header Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-purple-900/40 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-600/20 text-purple-300 border border-purple-500/30 flex items-center justify-center shadow-inner">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-purple-200">
                Article & Blog Reader
              </span>
              <p className="text-[11px] font-mono text-purple-400/70">
                {wordCount} words • ~{readingTime} min read
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyText}
              className="px-3.5 py-1.5 rounded-xl bg-[#140d2e] hover:bg-purple-900/40 text-purple-200 border border-purple-800/40 text-xs font-mono transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy Text'}</span>
            </button>
            <button
              onClick={() => setIsLargeFont(!isLargeFont)}
              className="px-3 py-1.5 rounded-xl bg-[#140d2e] hover:bg-purple-900/40 text-purple-200 border border-purple-800/40 text-xs font-mono transition-colors flex items-center gap-1 cursor-pointer"
              title="Toggle font size"
            >
              <Type className="w-3.5 h-3.5 text-purple-400" />
              <span>{isLargeFont ? 'A-' : 'A+'}</span>
            </button>
          </div>
        </div>

        {/* Optional Cover Thumbnail */}
        {thumbnail && (
          <div className="w-full max-h-80 rounded-2xl overflow-hidden bg-[#07040f] border border-purple-900/30">
            <img
              src={thumbnail}
              alt={title}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
              onError={(e) => {
                if (!e.target.dataset.triedProxy && thumbnail) {
                  e.target.dataset.triedProxy = 'true';
                  e.target.src = `/api/resources/proxy-image?url=${encodeURIComponent(thumbnail)}`;
                }
              }}
            />
          </div>
        )}

        {/* Formatted Article Body */}
        <div className={`text-purple-100/90 leading-relaxed font-sans space-y-4 ${
          isLargeFont ? 'text-base sm:text-lg leading-relaxed' : 'text-sm sm:text-base leading-relaxed'
        }`}>
          {textBody.split('\n\n').map((paragraph, idx) => {
            const trimmed = paragraph.trim();
            if (!trimmed) return null;

            if (trimmed.startsWith('# ')) {
              return <h1 key={idx} className="text-2xl font-bold font-display text-white mt-6 mb-2">{trimmed.slice(2)}</h1>;
            }
            if (trimmed.startsWith('## ')) {
              return <h2 key={idx} className="text-xl font-bold font-display text-white mt-5 mb-2">{trimmed.slice(3)}</h2>;
            }
            if (trimmed.startsWith('### ')) {
              return <h3 key={idx} className="text-lg font-bold font-display text-purple-200 mt-4 mb-2">{trimmed.slice(4)}</h3>;
            }
            if (trimmed.startsWith('```') && trimmed.endsWith('```')) {
              return (
                <pre key={idx} className="p-4 rounded-2xl bg-[#07040f] border border-purple-900/50 font-mono text-xs text-purple-300 overflow-x-auto my-3">
                  <code>{trimmed.replace(/^```[a-z]*\n?/, '').replace(/```$/, '')}</code>
                </pre>
              );
            }
            if (trimmed.startsWith('> ')) {
              return (
                <blockquote key={idx} className="border-l-4 border-purple-500 pl-4 py-1.5 italic text-purple-200/80 bg-purple-950/20 rounded-r-xl my-3 font-serif">
                  {trimmed.slice(2)}
                </blockquote>
              );
            }
            if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
              const items = trimmed.split('\n').map(l => l.replace(/^[-*]\s+/, '').trim()).filter(Boolean);
              return (
                <ul key={idx} className="list-disc list-inside space-y-1.5 my-2 pl-2 text-purple-200/90">
                  {items.map((item, itemIdx) => (
                    <li key={itemIdx} className="leading-relaxed">{item}</li>
                  ))}
                </ul>
              );
            }
            if (/^\d+\.\s+/.test(trimmed)) {
              const items = trimmed.split('\n').map(l => l.replace(/^\d+\.\s+/, '').trim()).filter(Boolean);
              return (
                <ol key={idx} className="list-decimal list-inside space-y-1.5 my-2 pl-2 text-purple-200/90">
                  {items.map((item, itemIdx) => (
                    <li key={itemIdx} className="leading-relaxed">{item}</li>
                  ))}
                </ol>
              );
            }

            return <p key={idx} className="whitespace-pre-line leading-relaxed">{trimmed}</p>;
          })}
        </div>
      </div>
    );
  }

  // Handle No Embed (Display Open Graph metadata card + Open Original Source button)
  if (embedType === 'NONE' || !embedUrl) {
    return (
      <div className="relative rounded-2xl glass-panel p-6 border border-purple-900/40 flex flex-col md:flex-row items-center gap-6 overflow-hidden">
        {thumbnail && (
          <div className="w-full md:w-64 h-44 rounded-xl overflow-hidden bg-[#07040f] shrink-0 relative border border-purple-900/30">
            <img
              src={thumbnail}
              alt={title}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
              onError={(e) => {
                if (!e.target.dataset.triedProxy && thumbnail) {
                  e.target.dataset.triedProxy = 'true';
                  e.target.src = `/api/resources/proxy-image?url=${encodeURIComponent(thumbnail)}`;
                } else {
                  e.target.style.display = 'none';
                }
              }}
            />
          </div>
        )}
        <div className="flex-1 space-y-3 text-left">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-purple-600/20 text-purple-300 text-xs font-semibold uppercase tracking-wider font-mono border border-purple-500/30">
            <span>External Web Resource</span>
          </div>
          <h3 className="text-xl font-bold text-white line-clamp-2 font-display">{title}</h3>
          <p className="text-sm text-purple-200/70 line-clamp-2 leading-relaxed">{description || `Explore this resource on ${domain}`}</p>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-sm shadow-purple-glow hover:scale-105 transition-all cursor-pointer"
          >
            <span>Open Original Source</span>
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>
    );
  }

  // Handle Direct HTML5 Video
  if (embedType === 'DIRECT_VIDEO') {
    return (
      <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-black border border-purple-900/40 shadow-2xl">
        <video
          src={embedUrl}
          controls
          poster={thumbnail}
          className="w-full h-full object-contain"
        >
          Your browser does not support the HTML5 video player.
        </video>
      </div>
    );
  }

  // Handle Direct Image Lightbox
  if (embedType === 'DIRECT_IMAGE') {
    return (
      <div className="relative w-full max-h-[500px] rounded-2xl overflow-hidden bg-[#0d081e] border border-purple-900/40 flex items-center justify-center p-2">
        <img
          src={embedUrl}
          alt={title}
          referrerPolicy="no-referrer"
          className="max-h-[480px] w-auto object-contain rounded-xl shadow-2xl"
          onError={(e) => {
            if (!e.target.dataset.triedProxy && embedUrl) {
              e.target.dataset.triedProxy = 'true';
              e.target.src = `/api/resources/proxy-image?url=${encodeURIComponent(embedUrl)}`;
            }
          }}
        />
      </div>
    );
  }

  // Handle YouTube, Vimeo, Spotify, SoundCloud iFrame Embeds
  return (
    <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-black border border-purple-900/40 shadow-2xl">
      {loading && !hasError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0d081e] z-10 space-y-3">
          <RefreshCw className="w-8 h-8 text-purple-400 animate-spin" />
          <span className="text-xs text-purple-300 font-medium">Initializing Media Player...</span>
        </div>
      )}

      {hasError ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0d081e] z-10 space-y-3 p-6 text-center">
          <AlertCircle className="w-10 h-10 text-rose-400" />
          <p className="text-sm font-semibold text-slate-200">Embedded playback unavailable for this URL</p>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 text-white font-bold text-xs shadow-purple-glow hover:bg-purple-500 transition-colors"
          >
            <span>Watch on Original Website</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      ) : (
        <iframe
          src={embedUrl}
          title={title}
          className="w-full h-full border-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          onLoad={() => setLoading(false)}
          onError={() => { setLoading(false); setHasError(true); }}
        />
      )}
    </div>
  );
};
