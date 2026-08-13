import { URL } from 'url';

export function detectEmbed(urlString) {
  try {
    const parsed = new URL(urlString);
    const host = parsed.hostname.toLowerCase().replace(/^www\./, '');
    const pathname = parsed.pathname;

    // YouTube Detection
    if (host === 'youtube.com' || host === 'm.youtube.com') {
      const videoId = parsed.searchParams.get('v');
      if (videoId) {
        return {
          embedType: 'YOUTUBE',
          embedUrl: `https://www.youtube.com/embed/${videoId}`,
          resourceType: 'VIDEO'
        };
      }
    } else if (host === 'youtu.be') {
      const videoId = pathname.substring(1);
      if (videoId) {
        return {
          embedType: 'YOUTUBE',
          embedUrl: `https://www.youtube.com/embed/${videoId}`,
          resourceType: 'VIDEO'
        };
      }
    }

    // Vimeo Detection
    if (host === 'vimeo.com') {
      const match = pathname.match(/\/(\d+)/);
      if (match && match[1]) {
        return {
          embedType: 'VIMEO',
          embedUrl: `https://player.vimeo.com/video/${match[1]}`,
          resourceType: 'VIDEO'
        };
      }
    }

    // Spotify Detection
    if (host === 'open.spotify.com') {
      if (pathname.startsWith('/track/') || pathname.startsWith('/album/') || pathname.startsWith('/playlist/')) {
        return {
          embedType: 'SPOTIFY',
          embedUrl: `https://open.spotify.com/embed${pathname}`,
          resourceType: 'AUDIO'
        };
      }
    }

    // SoundCloud Detection
    if (host === 'soundcloud.com') {
      const encodedUrl = encodeURIComponent(urlString);
      return {
        embedType: 'SOUNDCLOUD',
        embedUrl: `https://w.soundcloud.com/player/?url=${encodedUrl}&color=%2338bdf8&auto_play=false&hide_related=true&show_comments=false&show_user=true&show_reposts=false&show_teaser=false`,
        resourceType: 'AUDIO'
      };
    }

    // Direct Video Extensions
    if (/\.(mp4|webm|ogv|mov)$/i.test(pathname)) {
      return {
        embedType: 'DIRECT_VIDEO',
        embedUrl: urlString,
        resourceType: 'VIDEO'
      };
    }

    // Direct Image Extensions
    if (/\.(png|jpg|jpeg|gif|webp|svg)$/i.test(pathname)) {
      return {
        embedType: 'DIRECT_IMAGE',
        embedUrl: urlString,
        resourceType: 'IMAGE'
      };
    }

    return {
      embedType: 'NONE',
      embedUrl: '',
      resourceType: null // will be inferred by metadata scraper or user selection
    };
  } catch (err) {
    return {
      embedType: 'NONE',
      embedUrl: '',
      resourceType: 'WEBSITE'
    };
  }
}
