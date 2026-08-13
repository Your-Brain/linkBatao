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
      <div className="relative rounded-2xl glass-panel p-6 border border-slate-700/60 flex flex-col md:flex-row items-center gap-6 overflow-hidden">
        {thumbnail && (
          <div className="w-full md:w-64 h-44 rounded-xl overflow-hidden bg-dark-800 shrink-0 relative">
            <img
              src={thumbnail}
              alt={title}
              className="w-full h-full object-cover"
              onError={(e) => { e.target.src = `https://www.google.com/s2/favicons?domain=${domain}&sz=128`; }}
            />
          </div>
        )}
        <div className="flex-1 space-y-3 text-left">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-sky-500/10 text-sky-400 text-xs font-semibold uppercase tracking-wider">
            <span>External Web Resource</span>
          </div>
          <h3 className="text-xl font-bold text-white line-clamp-2">{title}</h3>
          <p className="text-sm text-slate-400 line-clamp-2">{resource.description || `Explore this resource on ${domain}`}</p>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-cyan-500 text-slate-950 font-bold text-sm shadow-glow hover:scale-105 transition-all"
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
      <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-black border border-slate-800 shadow-2xl">
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
      <div className="relative w-full max-h-[500px] rounded-2xl overflow-hidden bg-dark-900 border border-slate-800 flex items-center justify-center p-2">
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
    <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-black border border-slate-800 shadow-2xl">
      {loading && !hasError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-dark-900 z-10 space-y-3">
          <RefreshCw className="w-8 h-8 text-sky-400 animate-spin" />
          <span className="text-xs text-slate-400 font-medium">Initializing Media Player...</span>
        </div>
      )}

      {hasError ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-dark-900 z-10 space-y-3 p-6 text-center">
          <AlertCircle className="w-10 h-10 text-rose-400" />
          <p className="text-sm font-semibold text-slate-200">Embedded playback unavailable for this URL</p>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-500 text-slate-950 font-bold text-xs"
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
