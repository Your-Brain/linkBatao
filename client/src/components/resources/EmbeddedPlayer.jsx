import React, { useState } from 'react';
import { ExternalLink, Play, AlertCircle, RefreshCw, Volume2, Maximize2 } from 'lucide-react';

export const EmbeddedPlayer = ({ resource }) => {
  const [loading, setLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  if (!resource) return null;

  const { embedType, embedUrl, url, title, thumbnail, domain } = resource;

  // Handle No Embed (Display Open Graph metadata card + Open Original Source button)
  if (embedType === 'NONE' || !embedUrl) {
    return (
      <div className="relative rounded-2xl glass-panel p-6 border border-purple-900/40 flex flex-col md:flex-row items-center gap-6 overflow-hidden">
        {thumbnail && (
          <div className="w-full md:w-64 h-44 rounded-xl overflow-hidden bg-[#07040f] shrink-0 relative border border-purple-900/30">
            <img
              src={thumbnail}
              alt={title}
              className="w-full h-full object-cover"
              onError={(e) => { e.target.style.display = 'none'; }}
            />
          </div>
        )}
        <div className="flex-1 space-y-3 text-left">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-purple-600/20 text-purple-300 text-xs font-semibold uppercase tracking-wider font-mono border border-purple-500/30">
            <span>External Web Resource</span>
          </div>
          <h3 className="text-xl font-bold text-white line-clamp-2 font-display">{title}</h3>
          <p className="text-sm text-purple-200/70 line-clamp-2 leading-relaxed">{resource.description || `Explore this resource on ${domain}`}</p>
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
          className="max-h-[480px] w-auto object-contain rounded-xl shadow-2xl"
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
