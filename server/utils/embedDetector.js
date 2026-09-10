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

    // Pornhub Detection
    if (host.includes('pornhub.com') || host.includes('pornhubpremium.com')) {
      const viewkey = parsed.searchParams.get('viewkey') || (pathname.includes('/embed/') ? pathname.split('/embed/')[1]?.split('/')[0] : null);
      if (viewkey) {
        return {
          embedType: 'PORNHUB',
          embedUrl: `https://www.pornhub.com/embed/${viewkey}`,
          resourceType: 'VIDEO'
        };
      }
    }

    // XVideos Detection
    if (host.includes('xvideos.com') || host.includes('xvideos2.com') || host.includes('xvideos.es') || host.includes('xvideos.in')) {
      const match = pathname.match(/\/video\.?(\d+)/i) || pathname.match(/\/embedframe\/(\d+)/i);
      if (match && match[1]) {
        return {
          embedType: 'XVIDEOS',
          embedUrl: `https://www.xvideos.com/embedframe/${match[1]}`,
          resourceType: 'VIDEO'
        };
      }
    }

    // XNXX Detection
    if (host.includes('xnxx.com') || host.includes('xnxx2.com') || host.includes('xnxx.tv')) {
      const match = pathname.match(/\/video-?(\d+)/i) || pathname.match(/\/embedframe\/(\d+)/i);
      if (match && match[1]) {
        return {
          embedType: 'XNXX',
          embedUrl: `https://www.xnxx.com/embedframe/${match[1]}`,
          resourceType: 'VIDEO'
        };
      }
    }

    // xHamster Detection
    if (host.includes('xhamster.com') || host.includes('xhamster.desi') || host.includes('xhamster.one') || host.includes('xhwide.com')) {
      const match = pathname.match(/\/videos\/[^\/]+-(\w+)/i) || pathname.match(/\/videos\/(\w+)/i) || pathname.match(/video=(\w+)/i);
      if (match && match[1]) {
        return {
          embedType: 'XHAMSTER',
          embedUrl: `https://xhamster.com/xembed.php?video=${match[1]}`,
          resourceType: 'VIDEO'
        };
      }
    }

    // RedTube Detection
    if (host.includes('redtube.com')) {
      const match = pathname.match(/^\/(\d+)/) || parsed.searchParams.get('id') || (pathname.includes('/embed/') ? pathname.split('/embed/')[1] : null);
      const vid = typeof match === 'object' && match ? match[1] : match;
      if (vid) {
        return {
          embedType: 'REDTUBE',
          embedUrl: `https://embed.redtube.com/?id=${vid}`,
          resourceType: 'VIDEO'
        };
      }
    }

    // YouPorn Detection
    if (host.includes('youporn.com')) {
      const match = pathname.match(/\/watch\/(\d+)/i) || pathname.match(/\/embed\/(\d+)/i);
      if (match && match[1]) {
        return {
          embedType: 'YOUPORN',
          embedUrl: `https://www.youporn.com/embed/${match[1]}`,
          resourceType: 'VIDEO'
        };
      }
    }

    // SpankBang Detection
    if (host.includes('spankbang.com') || host.includes('spankbang.party')) {
      const match = pathname.match(/\/([a-zA-Z0-9]+)\/video\//i) || pathname.match(/\/([a-zA-Z0-9]+)\/embed\//i);
      if (match && match[1]) {
        return {
          embedType: 'SPANKBANG',
          embedUrl: `https://spankbang.com/${match[1]}/embed/`,
          resourceType: 'VIDEO'
        };
      }
    }

    // Eporner Detection
    if (host.includes('eporner.com')) {
      const match = pathname.match(/\/video-?([a-zA-Z0-9]+)/i) || pathname.match(/\/embed\/([a-zA-Z0-9]+)/i);
      if (match && match[1]) {
        return {
          embedType: 'EPORNER',
          embedUrl: `https://www.eporner.com/embed/${match[1]}/`,
          resourceType: 'VIDEO'
        };
      }
    }

    // Stripchat Detection
    if (host.includes('stripchat.com')) {
      const username = pathname.replace(/^\//, '').split('/')[0]?.split('?')[0];
      if (username && username !== 'embed') {
        return {
          embedType: 'STRIPCHAT',
          embedUrl: `https://stripchat.com/embed/${username}`,
          resourceType: 'VIDEO'
        };
      }
    }

    // Hanime Detection
    if (host.includes('hanime.tv')) {
      const match = pathname.match(/\/videos\/hentai\/([a-zA-Z0-9_-]+)/i);
      if (match && match[1]) {
        return {
          embedType: 'HANIME',
          embedUrl: `https://player.hanime.tv/?v=${match[1]}`,
          resourceType: 'VIDEO'
        };
      }
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
