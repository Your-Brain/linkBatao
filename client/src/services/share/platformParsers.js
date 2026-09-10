/**
 * Modular Platform Parsers Registry
 * Pluggable architecture for detecting and enriching metadata from popular platforms
 */

export const PLATFORM_TYPES = {
  YOUTUBE: 'youtube',
  INSTAGRAM: 'instagram',
  TWITTER: 'twitter',
  TIKTOK: 'tiktok',
  FACEBOOK: 'facebook',
  REDDIT: 'reddit',
  LINKEDIN: 'linkedin',
  PINTEREST: 'pinterest',
  SPOTIFY: 'spotify',
  GITHUB: 'github',
  PORNHUB: 'pornhub',
  XVIDEOS: 'xvideos',
  XHAMSTER: 'xhamster',
  SPANKBANG: 'spankbang',
  REDTUBE: 'redtube',
  ADULT_MEDIA: 'adult_media',
  GENERIC_WEB: 'generic_web'
};

// -------------------------------------------------------------
// Individual Platform Parsers
// -------------------------------------------------------------

/**
 * 1. YouTube Parser
 * Supports: youtube.com/watch?v=, youtu.be/, youtube.com/shorts/, music.youtube.com, embed
 */
export const youtubeParser = {
  name: 'YouTube',
  platform: PLATFORM_TYPES.YOUTUBE,
  color: '#FF0000',
  brandBg: 'bg-red-500/10 border-red-500/30 text-red-400',
  icon: 'Youtube',
  resourceType: 'VIDEO',
  suggestedCategory: 'entertainment',

  canHandle(url) {
    if (!url) return false;
    try {
      const hostname = new URL(url).hostname.toLowerCase();
      return (
        hostname.includes('youtube.com') ||
        hostname.includes('youtu.be') ||
        hostname.includes('youtube-nocookie.com')
      );
    } catch {
      return false;
    }
  },

  parse(rawUrl) {
    try {
      const parsed = new URL(rawUrl);
      const hostname = parsed.hostname.toLowerCase();
      const pathname = parsed.pathname;
      let videoId = null;
      let isShort = false;
      let isMusic = hostname.includes('music.youtube.com');
      let isPlaylist = parsed.searchParams.has('list');
      let timestamp = parsed.searchParams.get('t') || null;

      if (hostname.includes('youtu.be')) {
        // e.g. youtu.be/ABC123xyz
        videoId = pathname.slice(1).split('?')[0].split('&')[0];
      } else if (pathname.includes('/shorts/')) {
        // e.g. youtube.com/shorts/ABC123xyz
        videoId = pathname.split('/shorts/')[1].split('?')[0].split('/')[0];
        isShort = true;
      } else if (pathname.includes('/embed/')) {
        // e.g. youtube.com/embed/ABC123xyz
        videoId = pathname.split('/embed/')[1].split('?')[0];
      } else if (pathname.includes('/watch')) {
        // e.g. youtube.com/watch?v=ABC123xyz
        videoId = parsed.searchParams.get('v');
      }

      const cleanVideoId = videoId ? videoId.replace(/[^a-zA-Z0-9_-]/g, '') : null;
      const embedUrl = cleanVideoId ? `https://www.youtube-nocookie.com/embed/${cleanVideoId}` : null;
      const thumbnail = cleanVideoId ? `https://img.youtube.com/vi/${cleanVideoId}/maxresdefault.jpg` : null;

      return {
        platform: PLATFORM_TYPES.YOUTUBE,
        platformName: isShort ? 'YouTube Shorts' : (isMusic ? 'YouTube Music' : 'YouTube'),
        isSupported: true,
        videoId: cleanVideoId,
        isShort,
        isMusic,
        isPlaylist,
        timestamp,
        embedUrl,
        thumbnail,
        suggestedCategory: isShort || isMusic ? 'music' : 'entertainment',
        tags: [isShort ? 'shorts' : 'video', 'youtube', isMusic ? 'music' : 'stream']
      };
    } catch (err) {
      return null;
    }
  }
};

/**
 * 2. Instagram Parser
 * Supports: instagram.com/p/, /reel/, /tv/, /stories/
 */
export const instagramParser = {
  name: 'Instagram',
  platform: PLATFORM_TYPES.INSTAGRAM,
  color: '#E4405F',
  brandBg: 'bg-pink-500/10 border-pink-500/30 text-pink-400',
  icon: 'Instagram',
  resourceType: 'IMAGE',
  suggestedCategory: 'lifestyle',

  canHandle(url) {
    if (!url) return false;
    try {
      const hostname = new URL(url).hostname.toLowerCase();
      return hostname.includes('instagram.com') || hostname.includes('instagr.am');
    } catch {
      return false;
    }
  },

  parse(rawUrl) {
    try {
      const parsed = new URL(rawUrl);
      const path = parsed.pathname;
      let mediaType = 'IMAGE';
      let subtype = 'post';
      let shortcode = null;

      if (path.includes('/reel/')) {
        subtype = 'reel';
        mediaType = 'VIDEO';
        shortcode = path.split('/reel/')[1]?.split('/')[0];
      } else if (path.includes('/p/')) {
        subtype = 'post';
        shortcode = path.split('/p/')[1]?.split('/')[0];
      } else if (path.includes('/tv/')) {
        subtype = 'igtv';
        mediaType = 'VIDEO';
        shortcode = path.split('/tv/')[1]?.split('/')[0];
      }

      return {
        platform: PLATFORM_TYPES.INSTAGRAM,
        platformName: subtype === 'reel' ? 'Instagram Reel' : 'Instagram',
        subtype,
        shortcode,
        resourceType: mediaType,
        suggestedCategory: 'lifestyle',
        tags: ['instagram', subtype, 'social']
      };
    } catch (err) {
      return null;
    }
  }
};

/**
 * 3. X / Twitter Parser
 * Supports: twitter.com/user/status/id, x.com/user/status/id
 */
export const twitterParser = {
  name: 'X (Twitter)',
  platform: PLATFORM_TYPES.TWITTER,
  color: '#1DA1F2',
  brandBg: 'bg-sky-500/10 border-sky-500/30 text-sky-400',
  icon: 'Twitter',
  resourceType: 'ARTICLE',
  suggestedCategory: 'news',

  canHandle(url) {
    if (!url) return false;
    try {
      const hostname = new URL(url).hostname.toLowerCase();
      return hostname.includes('twitter.com') || hostname.includes('x.com');
    } catch {
      return false;
    }
  },

  parse(rawUrl) {
    try {
      const parsed = new URL(rawUrl);
      const path = parsed.pathname;
      const parts = path.split('/').filter(Boolean);
      let username = null;
      let tweetId = null;

      if (parts.length >= 3 && parts[1] === 'status') {
        username = parts[0];
        tweetId = parts[2];
      } else if (parts.length === 1) {
        username = parts[0];
      }

      return {
        platform: PLATFORM_TYPES.TWITTER,
        platformName: 'X (Twitter)',
        username,
        tweetId,
        resourceType: 'ARTICLE',
        suggestedCategory: 'news',
        tags: ['x', 'twitter', username ? `@${username}` : 'social']
      };
    } catch (err) {
      return null;
    }
  }
};

/**
 * 4. TikTok Parser
 * Supports: tiktok.com/@user/video/id, vt.tiktok.com, vm.tiktok.com
 */
export const tiktokParser = {
  name: 'TikTok',
  platform: PLATFORM_TYPES.TIKTOK,
  color: '#00F2FE',
  brandBg: 'bg-teal-500/10 border-teal-500/30 text-teal-400',
  icon: 'PlayCircle',
  resourceType: 'VIDEO',
  suggestedCategory: 'entertainment',

  canHandle(url) {
    if (!url) return false;
    try {
      const hostname = new URL(url).hostname.toLowerCase();
      return hostname.includes('tiktok.com');
    } catch {
      return false;
    }
  },

  parse(rawUrl) {
    try {
      const parsed = new URL(rawUrl);
      const path = parsed.pathname;
      let videoId = null;
      let username = null;

      if (path.includes('/video/')) {
        const parts = path.split('/video/');
        videoId = parts[1]?.split('?')[0]?.split('/')[0];
        username = parts[0].replace('/', '').replace('@', '');
      }

      return {
        platform: PLATFORM_TYPES.TIKTOK,
        platformName: 'TikTok',
        videoId,
        username,
        resourceType: 'VIDEO',
        suggestedCategory: 'entertainment',
        tags: ['tiktok', 'shortvideo', 'viral']
      };
    } catch (err) {
      return null;
    }
  }
};

/**
 * 5. Facebook Parser
 * Supports: facebook.com, fb.watch, reels
 */
export const facebookParser = {
  name: 'Facebook',
  platform: PLATFORM_TYPES.FACEBOOK,
  color: '#1877F2',
  brandBg: 'bg-blue-600/10 border-blue-600/30 text-blue-400',
  icon: 'Facebook',
  resourceType: 'ARTICLE',
  suggestedCategory: 'lifestyle',

  canHandle(url) {
    if (!url) return false;
    try {
      const hostname = new URL(url).hostname.toLowerCase();
      return hostname.includes('facebook.com') || hostname.includes('fb.watch') || hostname.includes('fb.me');
    } catch {
      return false;
    }
  },

  parse(rawUrl) {
    const isVideo = rawUrl.includes('/watch') || rawUrl.includes('/reel') || rawUrl.includes('fb.watch');
    return {
      platform: PLATFORM_TYPES.FACEBOOK,
      platformName: isVideo ? 'Facebook Video' : 'Facebook',
      resourceType: isVideo ? 'VIDEO' : 'ARTICLE',
      suggestedCategory: 'lifestyle',
      tags: ['facebook', isVideo ? 'video' : 'post']
    };
  }
};

/**
 * 6. Reddit Parser
 * Supports: reddit.com/r/subreddit/comments/id, redd.it/id
 */
export const redditParser = {
  name: 'Reddit',
  platform: PLATFORM_TYPES.REDDIT,
  color: '#FF4500',
  brandBg: 'bg-orange-500/10 border-orange-500/30 text-orange-400',
  icon: 'MessageSquare',
  resourceType: 'ARTICLE',
  suggestedCategory: 'other',

  canHandle(url) {
    if (!url) return false;
    try {
      const hostname = new URL(url).hostname.toLowerCase();
      return hostname.includes('reddit.com') || hostname.includes('redd.it');
    } catch {
      return false;
    }
  },

  parse(rawUrl) {
    try {
      const parsed = new URL(rawUrl);
      const path = parsed.pathname;
      let subreddit = null;
      let postId = null;

      if (path.includes('/r/')) {
        const parts = path.split('/r/')[1].split('/');
        subreddit = parts[0];
        if (parts[1] === 'comments') {
          postId = parts[2];
        }
      }

      return {
        platform: PLATFORM_TYPES.REDDIT,
        platformName: subreddit ? `Reddit (r/${subreddit})` : 'Reddit',
        subreddit,
        postId,
        resourceType: 'ARTICLE',
        suggestedCategory: 'other',
        tags: ['reddit', subreddit ? `r/${subreddit}` : 'community']
      };
    } catch {
      return null;
    }
  }
};

/**
 * 7. LinkedIn Parser
 */
export const linkedinParser = {
  name: 'LinkedIn',
  platform: PLATFORM_TYPES.LINKEDIN,
  color: '#0A66C2',
  brandBg: 'bg-blue-700/10 border-blue-700/30 text-blue-300',
  icon: 'Linkedin',
  resourceType: 'ARTICLE',
  suggestedCategory: 'technology',

  canHandle(url) {
    if (!url) return false;
    try {
      return new URL(url).hostname.toLowerCase().includes('linkedin.com');
    } catch {
      return false;
    }
  },

  parse(rawUrl) {
    return {
      platform: PLATFORM_TYPES.LINKEDIN,
      platformName: 'LinkedIn',
      resourceType: 'ARTICLE',
      suggestedCategory: 'technology',
      tags: ['linkedin', 'career', 'professional']
    };
  }
};

/**
 * 8. Pinterest Parser
 */
export const pinterestParser = {
  name: 'Pinterest',
  platform: PLATFORM_TYPES.PINTEREST,
  color: '#BD081C',
  brandBg: 'bg-red-600/10 border-red-600/30 text-red-400',
  icon: 'Pin',
  resourceType: 'IMAGE',
  suggestedCategory: 'art',

  canHandle(url) {
    if (!url) return false;
    try {
      const hostname = new URL(url).hostname.toLowerCase();
      return hostname.includes('pinterest.com') || hostname.includes('pin.it');
    } catch {
      return false;
    }
  },

  parse(rawUrl) {
    return {
      platform: PLATFORM_TYPES.PINTEREST,
      platformName: 'Pinterest',
      resourceType: 'IMAGE',
      suggestedCategory: 'art',
      tags: ['pinterest', 'design', 'inspiration']
    };
  }
};

/**
 * 9. Spotify Parser
 */
export const spotifyParser = {
  name: 'Spotify',
  platform: PLATFORM_TYPES.SPOTIFY,
  color: '#1DB954',
  brandBg: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
  icon: 'Music',
  resourceType: 'MUSIC',
  suggestedCategory: 'music',

  canHandle(url) {
    if (!url) return false;
    try {
      return new URL(url).hostname.toLowerCase().includes('spotify.com');
    } catch {
      return false;
    }
  },

  parse(rawUrl) {
    try {
      const parsed = new URL(rawUrl);
      const path = parsed.pathname;
      let embedUrl = null;
      let type = 'track';

      if (path.includes('/track/')) {
        const id = path.split('/track/')[1].split('?')[0];
        embedUrl = `https://open.spotify.com/embed/track/${id}`;
        type = 'track';
      } else if (path.includes('/album/')) {
        const id = path.split('/album/')[1].split('?')[0];
        embedUrl = `https://open.spotify.com/embed/album/${id}`;
        type = 'album';
      } else if (path.includes('/playlist/')) {
        const id = path.split('/playlist/')[1].split('?')[0];
        embedUrl = `https://open.spotify.com/embed/playlist/${id}`;
        type = 'playlist';
      }

      return {
        platform: PLATFORM_TYPES.SPOTIFY,
        platformName: 'Spotify',
        embedUrl,
        type,
        resourceType: 'MUSIC',
        suggestedCategory: 'music',
        tags: ['spotify', 'music', type]
      };
    } catch {
      return null;
    }
  }
};

/**
 * 10. GitHub Parser
 */
export const githubParser = {
  name: 'GitHub',
  platform: PLATFORM_TYPES.GITHUB,
  color: '#E6EDF3',
  brandBg: 'bg-slate-700/20 border-slate-600/40 text-slate-200',
  icon: 'Github',
  resourceType: 'TOOL',
  suggestedCategory: 'programming',

  canHandle(url) {
    if (!url) return false;
    try {
      const hostname = new URL(url).hostname.toLowerCase();
      return hostname.includes('github.com') || hostname.includes('gist.github.com');
    } catch {
      return false;
    }
  },

  parse(rawUrl) {
    try {
      const parsed = new URL(rawUrl);
      const parts = parsed.pathname.split('/').filter(Boolean);
      const owner = parts[0] || null;
      const repo = parts[1] || null;

      return {
        platform: PLATFORM_TYPES.GITHUB,
        platformName: repo ? `GitHub (${owner}/${repo})` : 'GitHub',
        owner,
        repo,
        resourceType: 'TOOL',
        suggestedCategory: 'programming',
        tags: ['github', 'opensource', 'code', ...(repo ? [repo] : [])]
      };
    } catch {
      return null;
    }
  }
};

/**
 * 11. Pornhub Parser
 * Supports: pornhub.com/view_video.php?viewkey=..., /embed/..., rt.pornhub.com
 */
export const pornhubParser = {
  name: 'Pornhub',
  platform: PLATFORM_TYPES.PORNHUB,
  color: '#FF9900',
  brandBg: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
  icon: 'PlayCircle',
  resourceType: 'VIDEO',
  suggestedCategory: 'sex',
  isNsfw: true,

  canHandle(url) {
    if (!url) return false;
    try {
      const hostname = new URL(url).hostname.toLowerCase();
      return hostname.includes('pornhub.com') || hostname.includes('pornhubpremium.com') || hostname.includes('phncdn.com');
    } catch {
      return false;
    }
  },

  parse(rawUrl) {
    try {
      const parsed = new URL(rawUrl);
      let viewkey = parsed.searchParams.get('viewkey');
      if (!viewkey && parsed.pathname.includes('/embed/')) {
        viewkey = parsed.pathname.split('/embed/')[1]?.split('?')[0]?.split('/')[0];
      }

      const cleanKey = viewkey ? viewkey.replace(/[^a-zA-Z0-9_-]/g, '') : null;
      const embedUrl = cleanKey ? `https://www.pornhub.com/embed/${cleanKey}` : null;

      return {
        platform: PLATFORM_TYPES.PORNHUB,
        platformName: 'Pornhub',
        isSupported: true,
        videoId: cleanKey,
        viewkey: cleanKey,
        embedUrl,
        thumbnail: '', // Let auto-fetch or player provide clean content thumbnail, never the site logo
        resourceType: 'VIDEO',
        isNsfw: true,
        suggestedCategory: 'sex',
        tags: ['pornhub', 'video', 'adult', 'nsfw', '18+']
      };
    } catch (err) {
      return null;
    }
  }
};

/**
 * 12. XVideos & XNXX Parser
 */
export const xvideosParser = {
  name: 'XVideos',
  platform: PLATFORM_TYPES.XVIDEOS,
  color: '#E0245E',
  brandBg: 'bg-rose-500/10 border-rose-500/30 text-rose-400',
  icon: 'PlayCircle',
  resourceType: 'VIDEO',
  suggestedCategory: 'sex',
  isNsfw: true,

  canHandle(url) {
    if (!url) return false;
    try {
      const hostname = new URL(url).hostname.toLowerCase();
      return hostname.includes('xvideos.com') || hostname.includes('xvideos2.com') || hostname.includes('xvideos.es') || hostname.includes('xnxx.com') || hostname.includes('xnxx2.com');
    } catch {
      return false;
    }
  },

  parse(rawUrl) {
    try {
      const parsed = new URL(rawUrl);
      const isXnxx = parsed.hostname.includes('xnxx');
      const match = parsed.pathname.match(/\/video[\.-]?(\d+)/i) || parsed.pathname.match(/\/embedframe\/(\d+)/i);
      const videoId = match ? match[1] : null;
      const embedUrl = videoId ? (isXnxx ? `https://www.xnxx.com/embedframe/${videoId}` : `https://www.xvideos.com/embedframe/${videoId}`) : null;

      return {
        platform: isXnxx ? 'xnxx' : PLATFORM_TYPES.XVIDEOS,
        platformName: isXnxx ? 'XNXX' : 'XVideos',
        isSupported: true,
        videoId,
        embedUrl,
        thumbnail: '',
        resourceType: 'VIDEO',
        isNsfw: true,
        suggestedCategory: 'sex',
        tags: [isXnxx ? 'xnxx' : 'xvideos', 'video', 'adult', 'nsfw', '18+']
      };
    } catch {
      return null;
    }
  }
};

/**
 * 13. xHamster Parser
 */
export const xhamsterParser = {
  name: 'xHamster',
  platform: PLATFORM_TYPES.XHAMSTER,
  color: '#438AFE',
  brandBg: 'bg-blue-500/10 border-blue-500/30 text-blue-400',
  icon: 'PlayCircle',
  resourceType: 'VIDEO',
  suggestedCategory: 'sex',
  isNsfw: true,

  canHandle(url) {
    if (!url) return false;
    try {
      const hostname = new URL(url).hostname.toLowerCase();
      return hostname.includes('xhamster.com') || hostname.includes('xhamster.desi') || hostname.includes('xhamster.one') || hostname.includes('xhwide.com');
    } catch {
      return false;
    }
  },

  parse(rawUrl) {
    try {
      const parsed = new URL(rawUrl);
      const match = parsed.pathname.match(/\/videos\/[^\/]+-(\w+)/i) || parsed.pathname.match(/\/videos\/(\w+)/i) || parsed.searchParams.get('video');
      const videoId = typeof match === 'object' && match ? match[1] : match;
      const embedUrl = videoId ? `https://xhamster.com/xembed.php?video=${videoId}` : null;

      return {
        platform: PLATFORM_TYPES.XHAMSTER,
        platformName: 'xHamster',
        isSupported: true,
        videoId,
        embedUrl,
        thumbnail: '',
        resourceType: 'VIDEO',
        isNsfw: true,
        suggestedCategory: 'sex',
        tags: ['xhamster', 'video', 'adult', 'nsfw', '18+']
      };
    } catch {
      return null;
    }
  }
};

/**
 * 14. SpankBang Parser
 */
export const spankbangParser = {
  name: 'SpankBang',
  platform: PLATFORM_TYPES.SPANKBANG,
  color: '#EC4899',
  brandBg: 'bg-pink-500/10 border-pink-500/30 text-pink-400',
  icon: 'PlayCircle',
  resourceType: 'VIDEO',
  suggestedCategory: 'sex',
  isNsfw: true,

  canHandle(url) {
    if (!url) return false;
    try {
      const hostname = new URL(url).hostname.toLowerCase();
      return hostname.includes('spankbang.com') || hostname.includes('spankbang.party');
    } catch {
      return false;
    }
  },

  parse(rawUrl) {
    try {
      const parsed = new URL(rawUrl);
      const match = parsed.pathname.match(/\/([a-zA-Z0-9]+)\/video\//i) || parsed.pathname.match(/\/([a-zA-Z0-9]+)\/embed\//i);
      const videoId = match ? match[1] : null;
      const embedUrl = videoId ? `https://spankbang.com/${videoId}/embed/` : null;

      return {
        platform: PLATFORM_TYPES.SPANKBANG,
        platformName: 'SpankBang',
        isSupported: true,
        videoId,
        embedUrl,
        thumbnail: '',
        resourceType: 'VIDEO',
        isNsfw: true,
        suggestedCategory: 'sex',
        tags: ['spankbang', 'video', 'adult', 'nsfw', '18+']
      };
    } catch {
      return null;
    }
  }
};

/**
 * 15. General Adult Media Parser
 */
export const adultMediaParser = {
  name: 'Adult Media',
  platform: PLATFORM_TYPES.ADULT_MEDIA,
  color: '#A855F7',
  brandBg: 'bg-purple-500/10 border-purple-500/30 text-purple-400',
  icon: 'Shield',
  resourceType: 'VIDEO',
  suggestedCategory: 'sex',
  isNsfw: true,

  canHandle(url) {
    if (!url) return false;
    try {
      const hostname = new URL(url).hostname.toLowerCase();
      const adultKeywords = [
        'redtube.com', 'youporn.com', 'eporner.com', 'chaturbate.com',
        'stripchat.com', 'onlyfans.com', 'fansly.com', 'manyvids.com',
        'brazzers.com', 'naughtyamerica.com', 'hqporner.com', 'beeg.com',
        'hanime.tv', 'rule34.xxx', 'gelbooru.com', 'e-hentai.org'
      ];
      return adultKeywords.some(kw => hostname.includes(kw));
    } catch {
      return false;
    }
  },

  parse(rawUrl) {
    try {
      const parsed = new URL(rawUrl);
      const hostname = parsed.hostname.replace(/^www\./, '');
      return {
        platform: PLATFORM_TYPES.ADULT_MEDIA,
        platformName: hostname,
        hostname,
        resourceType: 'VIDEO',
        isNsfw: true,
        suggestedCategory: 'sex',
        tags: [hostname.split('.')[0], 'adult', 'nsfw', '18+']
      };
    } catch {
      return null;
    }
  }
};

/**
 * 16. Generic Web Parser (Default Fallback)
 */
export const genericWebParser = {
  name: 'Website',
  platform: PLATFORM_TYPES.GENERIC_WEB,
  color: '#6366F1',
  brandBg: 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400',
  icon: 'Globe',
  resourceType: 'WEBSITE',
  suggestedCategory: 'technology',

  canHandle() {
    return true; // Catch-all fallback
  },

  parse(rawUrl) {
    try {
      const parsed = new URL(rawUrl);
      const hostname = parsed.hostname.replace(/^www\./, '');
      const favicon = `https://www.google.com/s2/favicons?domain=${hostname}&sz=128`;

      return {
        platform: PLATFORM_TYPES.GENERIC_WEB,
        platformName: hostname,
        hostname,
        favicon,
        resourceType: 'WEBSITE',
        suggestedCategory: 'technology',
        tags: [hostname.split('.')[0], 'web']
      };
    } catch {
      return {
        platform: PLATFORM_TYPES.GENERIC_WEB,
        platformName: 'Link',
        hostname: '',
        favicon: null,
        resourceType: 'WEBSITE',
        suggestedCategory: 'other',
        tags: ['web']
      };
    }
  }
};

export const ADULT_DOMAINS = [
  'pornhub.com',
  'pornhubpremium.com',
  'rt.pornhub.com',
  'phncdn.com',
  'xvideos.com',
  'xvideos2.com',
  'xvideos.es',
  'xvideos.in',
  'xnxx.com',
  'xnxx2.com',
  'xnxx.tv',
  'xhamster.com',
  'xhamster.desi',
  'xhamster.one',
  'xhwide.com',
  'spankbang.com',
  'spankbang.party',
  'redtube.com',
  'youporn.com',
  'eporner.com',
  'tube8.com',
  'chaturbate.com',
  'stripchat.com',
  'camsoda.com',
  'bongacams.com',
  'livejasmin.com',
  'onlyfans.com',
  'fansly.com',
  'manyvids.com',
  'clips4sale.com',
  'brazzers.com',
  'naughtyamerica.com',
  'realitykings.com',
  'hqporner.com',
  'beeg.com',
  'hanime.tv',
  'rule34.xxx',
  'gelbooru.com',
  'e-hentai.org',
  'nhentai.net',
  'txxx.com',
  'daftsex.com'
];

export const ADULT_KEYWORDS = [
  'nsfw',
  '18+',
  'adult',
  'xxx',
  'porn',
  'porno',
  'sex',
  'sexy',
  'erotic',
  'erotica',
  'hentai',
  'nude',
  'nudes',
  'boobs',
  'tits',
  'milf',
  'blowjob',
  'fetish',
  'leaks',
  'naked',
  'spankbang',
  'xvideos',
  'pornhub',
  'xhamster',
  'xnxx'
];

/**
 * Universal detector for adult / 18+ content across URLs, text, titles and tags
 */
export function detectIsAdultContent(url = '', title = '', text = '', tags = []) {
  // 1. Check URL hostname & path
  if (url) {
    try {
      const parsed = new URL(url.startsWith('http') ? url : `https://${url}`);
      const host = parsed.hostname.toLowerCase().replace(/^www\./, '');
      if (ADULT_DOMAINS.some(d => host === d || host.endsWith(`.${d}`))) {
        return true;
      }
      const pathWords = parsed.pathname.toLowerCase().split(/[/_.-]+/);
      if (pathWords.some(pw => ADULT_KEYWORDS.includes(pw))) {
        return true;
      }
    } catch {
      const lowerUrl = String(url).toLowerCase();
      if (ADULT_DOMAINS.some(d => lowerUrl.includes(d))) return true;
      if (ADULT_KEYWORDS.some(kw => lowerUrl.includes(kw))) return true;
    }
  }

  // 2. Check tags array
  if (Array.isArray(tags)) {
    if (tags.some(t => {
      const lt = String(t).toLowerCase().replace(/^#/, '').trim();
      return ADULT_KEYWORDS.includes(lt);
    })) {
      return true;
    }
  }

  // 3. Check combined text and title
  const combined = `${title || ''} ${text || ''}`.toLowerCase();
  const words = combined.split(/[\s,._\-#?!/]+/);
  if (words.some(w => ADULT_KEYWORDS.includes(w))) {
    return true;
  }

  return false;
}

export function getSuggestedAdultTags(platformOrDomain = '') {
  const baseTags = ['18+', 'adult', 'nsfw'];
  if (platformOrDomain) {
    const clean = platformOrDomain.replace(/^www\./, '').split('.')[0].toLowerCase();
    if (clean && !baseTags.includes(clean)) {
      baseTags.push(clean);
    }
  }
  return baseTags;
}

// -------------------------------------------------------------
// Parser Registry
// -------------------------------------------------------------

const PARSERS = [
  youtubeParser,
  instagramParser,
  twitterParser,
  tiktokParser,
  facebookParser,
  redditParser,
  linkedinParser,
  pinterestParser,
  spotifyParser,
  githubParser,
  pornhubParser,
  xvideosParser,
  xhamsterParser,
  spankbangParser,
  adultMediaParser
];

/**
 * Detects the matching platform and parses URL into rich metadata
 */
export function detectAndParseUrl(url) {
  if (!url) return null;

  for (const parser of PARSERS) {
    if (parser.canHandle(url)) {
      const parsedData = parser.parse(url);
      const isAdult = parsedData?.isNsfw || detectIsAdultContent(url);
      const enrichedTags = isAdult
        ? [...new Set([...(parsedData?.tags || []), '18+', 'adult', 'nsfw'])]
        : (parsedData?.tags || []);

      return {
        ...parsedData,
        isNsfw: isAdult,
        suggestedCategory: isAdult ? 'sex' : (parsedData?.suggestedCategory || 'other'),
        tags: enrichedTags,
        matchedParser: parser
      };
    }
  }

  // Fallback to generic web parser
  const genericData = genericWebParser.parse(url);
  const isAdult = detectIsAdultContent(url);
  const enrichedTags = isAdult
    ? [...new Set([...(genericData?.tags || []), '18+', 'adult', 'nsfw'])]
    : (genericData?.tags || []);

  return {
    ...genericData,
    isNsfw: isAdult,
    suggestedCategory: isAdult ? 'sex' : genericData.suggestedCategory,
    tags: enrichedTags,
    matchedParser: genericWebParser
  };
}
