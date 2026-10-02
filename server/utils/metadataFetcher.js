import axios from 'axios';
import * as cheerio from 'cheerio';
import { URL } from 'url';

// Check for private/internal IPs to prevent SSRF
export function isPrivateHost(hostname) {
  if (!hostname) return true;
  const lower = hostname.toLowerCase();

  if (
    lower === 'localhost' ||
    lower.endsWith('.local') ||
    lower.endsWith('.internal') ||
    lower === '127.0.0.1' ||
    lower === '::1' ||
    lower === '0.0.0.0'
  ) {
    return true;
  }

  // IPv4 regex checks for private subnets (10.x.x.x, 172.16-31.x.x, 192.168.x.x, 169.254.x.x)
  const ipMatch = lower.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (ipMatch) {
    const [, p1, p2] = ipMatch.map(Number);
    if (p1 === 10) return true;
    if (p1 === 172 && p2 >= 16 && p2 <= 31) return true;
    if (p1 === 192 && p2 === 168) return true;
    if (p1 === 169 && p2 === 254) return true;
  }

  return false;
}

// Known video thumbnail CDNs that should NOT be treated as generic icons
const KNOWN_THUMB_CDNS = [
  'ytimg.com',
  'youtube.com/vi/',
  'vimeocdn.com',
  'phncdn.com',
  'stripchat.com/preview',
  'highwebmedia.com',
  'spankbang.com',
  'spankbang.party',
  'xvideos-cdn.com',
  'xnxx-cdn.com',
  'xhcdn.com',
  'xhpingcdn.com',
  'xhpicgcdn.com',
  'xhpiccdn.com',
  'eporner.com',
  'eporner-cdn.com',
  'camsoda.com',
  'bongacams.com',
  'redtube.com',
  'youporn.com',
  'tnaflix.com',
  'motherless.com',
  'heavy-r.com',
  'rule34.xxx',
  'gelbooru.com',
  'danbooru.donmai.us',
  'e-hentai.org',
  'hanime.tv',
  'hentaihaven.xxx',
  'sndcdn.com'
];

// Check if an image URL is merely a site logo, favicon, avatar, or generic placeholder
export function isLogoOrGenericIcon(imgUrl) {
  if (!imgUrl) return true;
  const lower = imgUrl.toLowerCase();

  // 1. Unconditionally reject any avatar, user profile pic, creator badge, or promo ad
  // Video thumbnails NEVER contain 'avatar' or 'profile' in their URL!
  if (
    lower.includes('avatar') ||
    lower.includes('profile') ||
    lower.includes('author') ||
    lower.includes('user_pic') ||
    lower.includes('user-pic') ||
    lower.includes('default_user') ||
    lower.includes('rta.component') ||
    lower.includes('rta_nightmode') ||
    lower.includes('promo/message') ||
    lower.includes('flirtify') ||
    lower.includes('crown.svg') ||
    lower.includes('sponsor') ||
    lower.includes('badge') ||
    lower.includes('button')
  ) {
    return true;
  }

  // 2. If it's a known video thumbnail CDN, only reject if filename is explicitly a logo
  if (KNOWN_THUMB_CDNS.some(cdn => lower.includes(cdn))) {
    if (/\b(site_logo|header_logo|footer_logo|logo\.svg|logo\.png|favicon)\b/i.test(lower)) {
      return true;
    }
    return false;
  }

  // Reject SVG icons / base64 placeholders
  if (
    lower.startsWith('data:image/svg') ||
    lower.includes('base64,r0lgodlhaqab') ||
    lower.includes('blank.gif') ||
    lower.includes('pixel.gif') ||
    lower.includes('spacer.gif') ||
    lower.includes('1x1.') ||
    lower.includes('placeholder')
  ) {
    return true;
  }

  const logoPatterns = [
    'pornhub_logo',
    'ph_logo',
    'ph_favicon',
    'xvideos_logo',
    'xnxx_logo',
    'xhamster_logo',
    'spankbang_logo',
    'redtube_logo',
    'youporn_logo',
    'eporner_logo',
    'chaturbate_logo',
    'stripchat_logo',
    'logo.svg',
    'logo.png',
    'logo.jpg',
    'logo.webp',
    'site_logo',
    'site-logo',
    'header-logo',
    'footer-logo',
    'nav-logo',
    'brand-logo',
    'brand_logo',
    'watermark',
    'default_avatar',
    'avatar_default',
    'touch-icon',
    'apple-icon',
    'app_icon',
    'loading.gif',
    'spinner.gif'
  ];

  return logoPatterns.some(pattern => lower.includes(pattern));
}

// Helper to clean extracted image URLs (unescape JSON escapes, resolve relative paths)
export function cleanExtractedUrl(rawUrl, baseUrl) {
  if (!rawUrl || typeof rawUrl !== 'string') return null;
  let url = rawUrl.trim();

  // Remove JSON escaped slashes and HTML entities
  url = url
    .replaceAll('\\/', '/')
    .replaceAll('\\u002F', '/')
    .replaceAll('\\u002f', '/')
    .replaceAll('&amp;', '&')
    .replaceAll('&quot;', '')
    .replaceAll('&#39;', '')
    .replaceAll('&lt;', '')
    .replaceAll('&gt;', '');

  // Strip wrapping url('...') syntax if captured from CSS
  url = url
    .replace(/^url\(\s*['"]?/, '')
    .replace(/['"]?\s*\)$/, '')
    .replace(/^['"]/, '')
    .replace(/['"]$/, '')
    .trim();

  if (!url) return null;

  // Discard data URIs that are tiny SVGs or 1x1 GIFs
  if (
    url.startsWith('data:image/svg') ||
    url.includes('base64,R0lGODlhAQAB') ||
    url.includes('blank.gif') ||
    url.includes('pixel.gif')
  ) {
    return null;
  }

  // Handle protocol-relative URL: //cdn.example.com/img.jpg
  if (url.startsWith('//')) {
    url = 'https:' + url;
  } else if (!url.startsWith('http://') && !url.startsWith('https://')) {
    try {
      url = new URL(url, baseUrl).toString();
    } catch (e) {
      return null;
    }
  }

  return url;
}

// Known Adult Domains for auto-tagging and specialized parsers
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
  'onlyfans.com',
  'fansly.com',
  'manyvids.com',
  'clips4sale.com',
  'brazzers.com',
  'naughtyamerica.com',
  'realitykings.com',
  'mofos.com',
  'bangbros.com',
  'hqporner.com',
  'beeg.com',
  'tnaflix.com',
  'motherless.com',
  'heavy-r.com',
  'hanime.tv',
  'hentaihaven.xxx',
  'rule34.xxx',
  'danbooru.donmai.us',
  'gelbooru.com',
  'e-hentai.org'
];

/**
 * Checks whether a given host is a known adult domain or mirror
 */
export function isAdultHost(host) {
  if (!host) return false;
  const h = String(host).toLowerCase().replace(/^www\./, '');
  return (
    ADULT_DOMAINS.some(d => h === d || h.endsWith(`.${d}`)) ||
    h.includes('xhamster') ||
    h.includes('xhwide') ||
    h.includes('xvideos') ||
    h.includes('xnxx') ||
    h.includes('spankbang') ||
    h.includes('pornhub')
  );
}

/**
 * Extracts xHamster video ID from URL string or path
 */
export function extractXHamsterVideoId(urlOrPath) {
  if (!urlOrPath) return null;
  const match =
    String(urlOrPath).match(/\/videos\/[^\/]+-([a-zA-Z0-9]+)(?:[?&#/]|$)/i) ||
    String(urlOrPath).match(/\/videos\/([a-zA-Z0-9]+)(?:[?&#/]|$)/i) ||
    String(urlOrPath).match(/[?&]video=([a-zA-Z0-9]+)/i);
  return match ? match[1] : null;
}

/**
 * Robust CSS url('...') and url(...) extractor that handles internal parentheses like /s(w:1280,h:720)/
 */
export function extractCssUrls(str) {
  if (!str || typeof str !== 'string') return [];
  const urls = [];
  // 1. Quoted: url('...') or url("...")
  const quotedMatches = str.matchAll(/url\(\s*['"]([^'"]+)['"]\s*\)/gi);
  for (const m of quotedMatches) {
    if (m[1]) urls.push(m[1].trim());
  }
  // 2. Unquoted: url(...)
  const unquotedMatches = str.matchAll(/url\(\s*([^\s'")]+)\s*\)/gi);
  for (const m of unquotedMatches) {
    if (m[1] && !m[1].startsWith('\'') && !m[1].startsWith('"')) {
      urls.push(m[1].trim());
    }
  }
  return urls;
}

// Browser request headers with adult disclaimer & age verification bypass cookies
export const STANDARD_HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
  'Accept':
    'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
  'Accept-Language': 'en-US,en;q=0.9',
  'Sec-Ch-Ua': '"Not/A)Brand";v="8", "Chromium";v="126", "Google Chrome";v="126"',
  'Sec-Ch-Ua-Mobile': '?0',
  'Sec-Ch-Ua-Platform': '"Windows"',
  'Sec-Fetch-Dest': 'document',
  'Sec-Fetch-Mode': 'navigate',
  'Sec-Fetch-Site': 'none',
  'Sec-Fetch-User': '?1',
  'Upgrade-Insecure-Requests': '1',
  'Cache-Control': 'max-age=0',
  'Cookie':
    'age_verified=1; hasVisited=1; accessAgeDisclaimerPH=1; platform=pc; consent=1; xvideos_age=1; xh_over_18=1; over18=1; adult_verified=1; is_adult=1; warning=1; splash=1; r18=1; loop=1; compliance=1; privacy_notice=1; legal_age=1; accepted_disclaimer=1; cookies_accepted=1; verified=1; gate=pass; disclaimer_accepted=1; check_age=1; birth_date=1990-01-01;'
};

/**
 * Extract and score thumbnail candidates across CSS background-images,
 * video posters, lazy loading attributes, DOM elements, and player scripts.
 */
function extractAndScoreCandidates($, rawHtml, baseUrl) {
  const candidates = [];
  const seenUrls = new Set();

  const addCandidate = (rawUrl, score, source) => {
    const cleaned = cleanExtractedUrl(rawUrl, baseUrl);
    if (!cleaned) return;
    if (seenUrls.has(cleaned)) return;
    if (isLogoOrGenericIcon(cleaned)) return;

    seenUrls.add(cleaned);
    candidates.push({ url: cleaned, score, source });
  };

  // 1. High-Precision Player Script Configurations (Score 98 - 100)
  if (rawHtml) {
    // XVideos / XNXX player script thumb
    const xv169 = rawHtml.match(/html5player\.setThumbUrl169\s*\(\s*['"]([^'"]+)['"]\s*\)/i);
    if (xv169 && xv169[1]) addCandidate(xv169[1], 100, 'xvideos-thumb169');

    const xvThumb = rawHtml.match(/html5player\.setThumbUrl\s*\(\s*['"]([^'"]+)['"]\s*\)/i);
    if (xvThumb && xvThumb[1]) addCandidate(xvThumb[1], 98, 'xvideos-thumb');

    const xvSlide = rawHtml.match(/html5player\.setThumbSlideBig\s*\(\s*['"]([^'"]+)['"]\s*\)/i);
    if (xvSlide && xvSlide[1]) addCandidate(xvSlide[1], 95, 'xvideos-slide');

    const xvPoster = rawHtml.match(/html5player\.setPosterUrl\s*\(\s*['"]([^'"]+)['"]\s*\)/i);
    if (xvPoster && xvPoster[1]) addCandidate(xvPoster[1], 100, 'xvideos-poster');

    // Pornhub / Tube8 flashvars
    const phImg = rawHtml.match(/"image_url"\s*:\s*"([^"]+)"/i);
    if (phImg && phImg[1]) addCandidate(phImg[1], 100, 'flashvars-image_url');

    const phThumb = rawHtml.match(/"thumbnail_url"\s*:\s*"([^"]+)"/i);
    if (phThumb && phThumb[1]) addCandidate(phThumb[1], 98, 'flashvars-thumbnail_url');

    // xHamster window.initials JSON extraction
    const xhInitialsMatch = rawHtml.match(/window\.initials\s*=\s*({[\s\S]*?});/);
    if (xhInitialsMatch) {
      try {
        const initials = JSON.parse(xhInitialsMatch[1]);
        if (initials.videoModel?.thumbURL) {
          addCandidate(initials.videoModel.thumbURL, 100, 'xhamster-videoModel-thumbURL');
        }
        if (initials.videoModel?.previewThumbURL) {
          addCandidate(initials.videoModel.previewThumbURL, 98, 'xhamster-videoModel-previewThumbURL');
        }
        if (initials.videoModel?.imageURL) {
          addCandidate(initials.videoModel.imageURL, 100, 'xhamster-videoModel-imageURL');
        }
        if (initials.videoModel?.posterURL) {
          addCandidate(initials.videoModel.posterURL, 100, 'xhamster-videoModel-posterURL');
        }
      } catch (e) {}
    }

    const xhThumb = rawHtml.match(/"thumbURL"\s*:\s*"([^"]+)"/i);
    if (xhThumb && xhThumb[1]) addCandidate(xhThumb[1], 100, 'xhamster-thumbURL');

    const xhPreviewThumb = rawHtml.match(/"previewThumbURL"\s*:\s*"([^"]+)"/i);
    if (xhPreviewThumb && xhPreviewThumb[1]) addCandidate(xhPreviewThumb[1], 98, 'xhamster-previewThumbURL');

    const xhImage = rawHtml.match(/"imageURL"\s*:\s*"([^"]+)"/i);
    if (xhImage && xhImage[1]) addCandidate(xhImage[1], 100, 'xhamster-imageURL');

    // xHamster CDN preview images (1280x720 / 1920x1080)
    const xhCdnMatches = rawHtml.matchAll(/https?:\\?\/\\?\/[^"'()\s]+(?:xhpingcdn|xhpicgcdn|xhpiccdn|xhcdn)[^"'()\s]+\.(?:jpg|jpeg|webp|png)(?:\?[^"'()\s]*)?/gi);
    for (const m of xhCdnMatches) {
      if (m[0]) addCandidate(m[0], 99, 'xhamster-cdn-regex');
    }

    // SpankBang stream / poster
    const sbCover = rawHtml.match(/cover_url\s*[:=]\s*["']([^"']+)["']/i);
    if (sbCover && sbCover[1]) addCandidate(sbCover[1], 100, 'spankbang-cover');

    const sbStream = rawHtml.match(/stream_data\s*[:=]\s*({[\s\S]*?})/i);
    if (sbStream && sbStream[1]) {
      try {
        const streamJson = JSON.parse(sbStream[1]);
        if (streamJson.poster) addCandidate(streamJson.poster, 100, 'spankbang-stream-poster');
        if (streamJson.preview) addCandidate(streamJson.preview, 95, 'spankbang-stream-preview');
        if (streamJson.thumbnail) addCandidate(streamJson.thumbnail, 95, 'spankbang-stream-thumb');
      } catch (e) {}
    }

    // RedTube & YouPorn page params
    const rtImg = rawHtml.match(/video_image\s*[:=]\s*["']([^"']+)["']/i);
    if (rtImg && rtImg[1]) addCandidate(rtImg[1], 100, 'redtube-video-image');

    // Eporner video image
    const epPoster = rawHtml.match(/video_poster\s*[:=]\s*["']([^"']+)["']/i);
    if (epPoster && epPoster[1]) addCandidate(epPoster[1], 100, 'eporner-poster');

    // Generic player variable matches
    const posterGeneric = rawHtml.match(/["']?poster["']?\s*[:=]\s*["'](https?:\\?\/\\?[^"']+\.(?:jpg|jpeg|png|webp)[^"']*)["']/i);
    if (posterGeneric && posterGeneric[1]) addCandidate(posterGeneric[1], 95, 'generic-poster-regex');

    const thumbGeneric = rawHtml.match(/["']?(?:thumbnail|thumb_url|preview_url|video_thumb)["']?\s*[:=]\s*["'](https?:\\?\/\\?[^"']+\.(?:jpg|jpeg|png|webp)[^"']*)["']/i);
    if (thumbGeneric && thumbGeneric[1]) addCandidate(thumbGeneric[1], 92, 'generic-thumb-regex');
  }

  // Dedicated xHamster Player / Preload Image / Poster extraction
  $('.xp-preload-image, .xp-poster, #player-container, [data-role="xplayer"]').each((_, el) => {
    const style = $(el).attr('style') || '';
    const urls = extractCssUrls(style);
    for (const u of urls) {
      addCandidate(u, 100, 'xhamster-player-poster-css');
    }
  });

  // 2. HTML5 Video Tag Poster (Score 95)
  $('video').each((_, el) => {
    const poster = $(el).attr('poster');
    if (poster) addCandidate(poster, 95, 'video-poster-attr');
  });

  // 3. CSS Background Images in Inline Styles (The Pro CSS Solution) (Score 85 - 95)
  // Many adult and tube websites store the video thumbnail in background-image on responsive containers
  $('[style*="url("], [style*="background"], [style*="--"]').each((_, el) => {
    const style = $(el).attr('style') || '';
    const classAndId = `${$(el).attr('class') || ''} ${$(el).attr('id') || ''}`.toLowerCase();
    const isPlayerEl = /player|video|poster|cover|thumb|preview|screen|stage|holder|fp-|vjs-|jw-|fluid|xp-/.test(
      classAndId
    );

    const urls = extractCssUrls(style);
    for (const extractedUrl of urls) {
      addCandidate(
        extractedUrl,
        isPlayerEl ? 95 : 65,
        isPlayerEl ? 'css-player-inline' : 'css-generic-inline'
      );
    }
  });

  // 4. CSS Background Images inside <style> blocks (Score 70 - 85)
  $('style').each((_, el) => {
    const cssText = $(el).html() || '';
    const ruleMatches = cssText.matchAll(/([^{}]+)\{([^}]+)\}/gi);
    for (const rule of ruleMatches) {
      const selector = rule[1].toLowerCase();
      const body = rule[2];
      const isPlayerRule = /player|video|poster|cover|thumb|preview|screen|stage|holder|fp-|vjs-|xp-/.test(
        selector
      );
      const urls = extractCssUrls(body);
      for (const u of urls) {
        addCandidate(
          u,
          isPlayerRule ? 85 : 60,
          isPlayerRule ? 'css-style-rule-player' : 'css-style-rule-generic'
        );
      }
    }
  });

  // 5. Global Raw HTML CSS Fallback Regex (Score 60 - 80)
  if (rawHtml) {
    const rawUrls = extractCssUrls(rawHtml);
    for (const u of rawUrls) {
      const lower = u.toLowerCase();
      const isMediaLike =
        lower.includes('/video') ||
        lower.includes('/thumb') ||
        lower.includes('/poster') ||
        lower.includes('/preview') ||
        lower.includes('1280x720') ||
        lower.includes('.jpg') ||
        lower.includes('.webp');
      addCandidate(u, isMediaLike ? 80 : 55, 'raw-html-css-bg');
    }
  }

  // 6. JSON-LD structured data (VideoObject, Article, MediaObject) (Score 90)
  $('script[type="application/ld+json"]').each((_, el) => {
    try {
      const text = $(el).html();
      if (!text) return;
      const data = JSON.parse(text);
      const items = Array.isArray(data) ? data : [data];
      for (const item of items) {
        if (item.thumbnailUrl) {
          if (Array.isArray(item.thumbnailUrl)) {
            item.thumbnailUrl.forEach(u => addCandidate(u, 90, 'jsonld-thumbnailUrl'));
          } else {
            addCandidate(item.thumbnailUrl, 90, 'jsonld-thumbnailUrl');
          }
        }
        if (item.image) {
          if (typeof item.image === 'string') {
            addCandidate(item.image, 85, 'jsonld-image');
          } else if (item.image.url) {
            addCandidate(item.image.url, 85, 'jsonld-image-url');
          } else if (Array.isArray(item.image)) {
            item.image.forEach(u => addCandidate(typeof u === 'string' ? u : u?.url, 85, 'jsonld-image-array'));
          }
        }
      }
    } catch (e) {}
  });

  // 7. OpenGraph & Twitter Meta Tags (Score 95 - 96)
  // Canonical metadata placed by video platforms for social previews
  const ogImageSecure = $('meta[property="og:image:secure_url"]').attr('content');
  const ogImage = $('meta[property="og:image"]').attr('content');
  const twitterImage =
    $('meta[name="twitter:image"]').attr('content') ||
    $('meta[name="twitter:image:src"]').attr('content');
  const preloadImg = $('link[rel="preload"][as="image"]').attr('href');
  const linkImageSrc =
    $('link[rel="image_src"]').attr('href') ||
    $('link[rel="thumbnail"]').attr('href');
  const metaThumb = $('meta[itemprop="thumbnailUrl"]').attr('content') || $('meta[name="thumbnail"]').attr('content');

  if (ogImageSecure) addCandidate(ogImageSecure, 96, 'og:image:secure_url');
  if (ogImage) addCandidate(ogImage, 95, 'og:image');
  if (twitterImage) addCandidate(twitterImage, 94, 'twitter:image');
  if (preloadImg) addCandidate(preloadImg, 95, 'link:preload-image');
  if (linkImageSrc) addCandidate(linkImageSrc, 85, 'link:image_src');
  if (metaThumb) addCandidate(metaThumb, 88, 'meta:thumbnail');

  // 8. Lazy-Loaded Image & Video Attributes (Score 70 - 85)
  // Many modern sites render <img src="blank.gif" data-src="..." data-original="..." />
  $('img, [data-src], [data-original], [data-poster], [data-thumb], [data-thumbnail]').each((_, el) => {
    const classAndId = `${$(el).attr('class') || ''} ${$(el).attr('id') || ''}`.toLowerCase();
    const isPlayerEl = /player|video|poster|cover|thumb|preview|screen|main/.test(classAndId);
    const score = isPlayerEl ? 85 : 60;

    const dataAttrs = [
      'data-src',
      'data-original',
      'data-poster',
      'data-thumb',
      'data-thumbnail',
      'data-preview',
      'data-image',
      'data-bg',
      'data-highres',
      'data-cfsrc',
      'data-webp',
      'data-lazy'
    ];

    for (const attr of dataAttrs) {
      const val = $(el).attr(attr);
      if (val) addCandidate(val, score, `dom-${attr}`);
    }

    // Process srcset for high-res candidate
    const srcset = $(el).attr('srcset') || $(el).attr('data-srcset');
    if (srcset) {
      const parts = srcset.split(',').map(s => s.trim().split(' ')[0]).filter(Boolean);
      if (parts.length > 0) {
        // Largest image is usually at the end of srcset
        addCandidate(parts[parts.length - 1], score, 'dom-srcset');
      }
    }

    // Standard src attribute
    const src = $(el).attr('src');
    if (src) {
      addCandidate(src, isPlayerEl ? 75 : 45, 'dom-src');
    }
  });

  // Sort candidates by score descending
  candidates.sort((a, b) => b.score - a.score);
  return candidates;
}

/**
 * Main Metadata Fetcher Function
 */
export async function fetchUrlMetadata(urlString) {
  try {
    let targetUrl = String(urlString || '').trim();
    if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
      targetUrl = 'https://' + targetUrl;
    }

    const parsed = new URL(targetUrl);

    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      throw new Error('Unsupported protocol. Only HTTP and HTTPS URLs are permitted.');
    }

    if (isPrivateHost(parsed.hostname)) {
      throw new Error('Access to private or local network resources is forbidden.');
    }

    const host = parsed.hostname.toLowerCase().replace(/^www\./, '');
    const isAdult = isAdultHost(host);

    // 1. Specialized fetcher for YouTube
    if (host === 'youtube.com' || host === 'm.youtube.com' || host === 'youtu.be') {
      let videoId = null;
      if (host === 'youtu.be') {
        videoId = parsed.pathname.replace(/^\//, '').split('/')[0]?.split('?')[0];
      } else if (parsed.pathname.startsWith('/shorts/')) {
        videoId = parsed.pathname.split('/shorts/')[1]?.split('/')[0]?.split('?')[0];
      } else if (parsed.pathname.startsWith('/embed/')) {
        videoId = parsed.pathname.split('/embed/')[1]?.split('/')[0]?.split('?')[0];
      } else {
        videoId = parsed.searchParams.get('v');
      }

      let ytTitle = '';
      let ytAuthor = '';
      let ytThumb = videoId ? `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg` : '';

      try {
        const oembedRes = await axios.get(
          `https://www.youtube.com/oembed?url=${encodeURIComponent(urlString)}&format=json`,
          {
            timeout: 4000,
            headers: { 'User-Agent': 'Mozilla/5.0' }
          }
        );
        if (oembedRes.data) {
          ytTitle = oembedRes.data.title || '';
          ytAuthor = oembedRes.data.author_name || '';
          if (oembedRes.data.thumbnail_url) {
            ytThumb = oembedRes.data.thumbnail_url;
          }
        }
      } catch (err) {}

      return {
        title: ytTitle || (videoId ? `YouTube Video (${videoId})` : 'YouTube Video'),
        description: ytAuthor ? `YouTube video by ${ytAuthor}` : 'Watch video on YouTube',
        thumbnail: ytThumb,
        resourceType: 'VIDEO',
        domain: host,
        isNsfw: false
      };
    }

    // 2. Specialized fetcher for Vimeo
    if (host === 'vimeo.com') {
      try {
        const oembedRes = await axios.get(
          `https://vimeo.com/api/oembed.json?url=${encodeURIComponent(urlString)}`,
          {
            timeout: 4000,
            headers: { 'User-Agent': 'Mozilla/5.0' }
          }
        );
        if (oembedRes.data) {
          return {
            title: oembedRes.data.title || 'Vimeo Video',
            description:
              oembedRes.data.description || `Vimeo video by ${oembedRes.data.author_name || 'Creator'}`,
            thumbnail: oembedRes.data.thumbnail_url || '',
            resourceType: 'VIDEO',
            domain: host,
            isNsfw: false
          };
        }
      } catch (err) {}
    }

    // 3. Specialized fetcher for Spotify
    if (host === 'open.spotify.com') {
      try {
        const oembedRes = await axios.get(
          `https://open.spotify.com/oembed?url=${encodeURIComponent(urlString)}`,
          {
            timeout: 4000,
            headers: { 'User-Agent': 'Mozilla/5.0' }
          }
        );
        if (oembedRes.data) {
          return {
            title: oembedRes.data.title || 'Spotify Track',
            description: `Listen on Spotify`,
            thumbnail: oembedRes.data.thumbnail_url || '',
            resourceType: 'AUDIO',
            domain: host,
            isNsfw: false
          };
        }
      } catch (err) {}
    }

    // 4. Specialized fetcher for SoundCloud
    if (host === 'soundcloud.com') {
      try {
        const oembedRes = await axios.get(
          `https://soundcloud.com/oembed?url=${encodeURIComponent(urlString)}&format=json`,
          {
            timeout: 4000,
            headers: { 'User-Agent': 'Mozilla/5.0' }
          }
        );
        if (oembedRes.data) {
          return {
            title: oembedRes.data.title || 'SoundCloud Track',
            description:
              oembedRes.data.description ||
              `SoundCloud audio by ${oembedRes.data.author_name || 'Artist'}`,
            thumbnail: oembedRes.data.thumbnail_url || '',
            resourceType: 'AUDIO',
            domain: host,
            isNsfw: false
          };
        }
      } catch (err) {}
    }

    // 5. Specialized direct snapshot generators for Live Cam sites
    if (host.includes('stripchat.com')) {
      const username = parsed.pathname.replace(/^\//, '').split('/')[0]?.split('?')[0];
      if (username && username !== 'embed') {
        return {
          title: `${username} Live Cam Stream`,
          description: `Watch ${username} live on Stripchat`,
          thumbnail: `https://img.stripchat.com/preview/${username}.jpg`,
          resourceType: 'VIDEO',
          domain: host,
          isNsfw: true
        };
      }
    }

    if (host.includes('chaturbate.com')) {
      const username = parsed.pathname.replace(/^\//, '').split('/')[0]?.split('?')[0];
      if (username && !['in', 'tags', 'terms', 'privacy', 'auth'].includes(username)) {
        return {
          title: `${username} Chaturbate Cam Room`,
          description: `Live webcam broadcast from ${username}`,
          thumbnail: `https://roomimg.stream.highwebmedia.com/ri/${username}.jpg`,
          resourceType: 'VIDEO',
          domain: host,
          isNsfw: true
        };
      }
    }

    if (host.includes('camsoda.com')) {
      const username = parsed.pathname.replace(/^\//, '').split('/')[0]?.split('?')[0];
      if (username && !['chat', 'signup', 'login'].includes(username)) {
        return {
          title: `${username} CamSoda Live Stream`,
          description: `Live broadcast on CamSoda`,
          thumbnail: `https://images.camsoda.com/users/${username}/profile.jpg`,
          resourceType: 'VIDEO',
          domain: host,
          isNsfw: true
        };
      }
    }

    if (host.includes('bongacams.com')) {
      const username = parsed.pathname.replace(/^\//, '').split('/')[0]?.split('?')[0];
      if (username && !['tags', 'terms', 'login'].includes(username)) {
        return {
          title: `${username} BongaCams Stream`,
          description: `Live broadcast on BongaCams`,
          thumbnail: `https://cdn.bongacams.com/promo/profile/${username}.jpg`,
          resourceType: 'VIDEO',
          domain: host,
          isNsfw: true
        };
      }
    }

    // 6. Specialized fetcher for Pornhub oEmbed API
    if (host.includes('pornhub.com') || host.includes('pornhubpremium.com')) {
      const viewkey =
        parsed.searchParams.get('viewkey') ||
        (parsed.pathname.includes('/embed/') ? parsed.pathname.split('/embed/')[1]?.split('/')[0] : null);
      if (viewkey) {
        try {
          const oembedUrl = `https://www.pornhub.com/oembed?url=https://www.pornhub.com/view_video.php?viewkey=${viewkey}&format=json`;
          const oembedRes = await axios.get(oembedUrl, {
            timeout: 5000,
            headers: STANDARD_HEADERS
          });

          if (oembedRes.data && (oembedRes.data.thumbnail_url || oembedRes.data.title)) {
            const thumb = cleanExtractedUrl(oembedRes.data.thumbnail_url, urlString);
            const finalThumb = thumb && !isLogoOrGenericIcon(thumb) ? thumb : '';

            if (finalThumb) {
              return {
                title: (oembedRes.data.title || 'Pornhub Video').trim(),
                description: `Video on Pornhub by ${oembedRes.data.author_name || 'Community Creator'}`,
                thumbnail: finalThumb,
                resourceType: 'VIDEO',
                domain: host,
                isNsfw: true
              };
            }
          }
        } catch (oembedErr) {
          // Fall through to standard scraping
        }
      }
    }

    // 7. Perform Full Desktop Browser GET Request with Age Verification Cookies
    let response;
    let responseHtml = '';
    let responseContentType = '';

    try {
      response = await axios.get(urlString, {
        timeout: 9000,
        maxRedirects: 5,
        maxContentLength: 5 * 1024 * 1024,
        headers: STANDARD_HEADERS
      });
      responseHtml = typeof response.data === 'string' ? response.data : '';
      responseContentType = response.headers['content-type'] || '';
    } catch (fetchErr) {
      // If direct request fails (e.g. 403 / bot protection), check if we can fetch the embed frame!
      // XVideos / XNXX fallback to lightweight embedframe
      if (host.includes('xvideos.com') || host.includes('xnxx.com')) {
        const match =
          parsed.pathname.match(/\/video[\.-]?(\d+)/i) || parsed.pathname.match(/\/embedframe\/(\d+)/i);
        const vid = match ? match[1] : null;
        if (vid) {
          try {
            const isXnxx = host.includes('xnxx');
            const embedUrl = isXnxx
              ? `https://www.xnxx.com/embedframe/${vid}`
              : `https://www.xvideos.com/embedframe/${vid}`;
            const embedRes = await axios.get(embedUrl, {
              timeout: 6000,
              headers: STANDARD_HEADERS
            });
            response = embedRes;
            responseHtml = typeof embedRes.data === 'string' ? embedRes.data : '';
            responseContentType = embedRes.headers['content-type'] || '';
          } catch (e) {}
        }
      } else if (host.includes('spankbang.com') || host.includes('spankbang.party')) {
        // Spankbang fallback to embed
        const match = parsed.pathname.match(/\/([a-zA-Z0-9]+)\/video\//i);
        if (match && match[1]) {
          try {
            const embedRes = await axios.get(`https://spankbang.com/${match[1]}/embed/`, {
              timeout: 6000,
              headers: STANDARD_HEADERS
            });
            response = embedRes;
            responseHtml = typeof embedRes.data === 'string' ? embedRes.data : '';
            responseContentType = embedRes.headers['content-type'] || '';
          } catch (e) {}
        }
      } else if (host.includes('xhamster') || host.includes('xhwide')) {
        // xHamster fallback to embed across mirrors
        const vid = extractXHamsterVideoId(parsed.pathname) || extractXHamsterVideoId(urlString);
        if (vid) {
          const embedCandidates = [
            `https://xhamster.com/xembed.php?video=${vid}`,
            `https://${host}/xembed.php?video=${vid}`,
            `https://xhamster.desi/xembed.php?video=${vid}`
          ];
          for (const embedUrl of embedCandidates) {
            try {
              const embedRes = await axios.get(embedUrl, {
                timeout: 5000,
                headers: STANDARD_HEADERS
              });
              if (embedRes.data && typeof embedRes.data === 'string') {
                response = embedRes;
                responseHtml = embedRes.data;
                responseContentType = embedRes.headers['content-type'] || '';
                break;
              }
            } catch (e) {}
          }
        }
      }

      if (!responseHtml) {
        throw fetchErr;
      }
    }

    // Handle Direct Image Response
    if (responseContentType.startsWith('image/')) {
      return {
        title: parsed.pathname.split('/').pop() || 'Image Resource',
        description: `Direct Image from ${parsed.hostname}`,
        thumbnail: urlString,
        resourceType: 'IMAGE',
        domain: host,
        isNsfw: isAdult
      };
    }

    // Load Cheerio DOM
    const $ = cheerio.load(responseHtml);

    // Metadata Title
    const ogTitle = $('meta[property="og:title"]').attr('content');
    const twitterTitle = $('meta[name="twitter:title"]').attr('content');
    const pageTitle = $('title').text();
    const title = (ogTitle || twitterTitle || pageTitle || '').trim();

    // Metadata Description
    const ogDesc = $('meta[property="og:description"]').attr('content');
    const metaDesc = $('meta[name="description"]').attr('content');
    const twitterDesc = $('meta[name="twitter:description"]').attr('content');
    const description = (ogDesc || twitterDesc || metaDesc || '').trim();

    // 8. Extract & Rank all candidates via CSS, Script, DOM & OpenGraph
    const candidates = extractAndScoreCandidates($, responseHtml, urlString);

    let validThumbnail = '';
    if (candidates.length > 0) {
      validThumbnail = candidates[0].url;
    }

    // If still no valid thumbnail found for XVideos/XNXX/xHamster, try embedframe extraction
    if (!validThumbnail && (host.includes('xvideos.com') || host.includes('xnxx.com') || host.includes('xhamster') || host.includes('xhwide'))) {
      if (host.includes('xhamster') || host.includes('xhwide')) {
        const vid = extractXHamsterVideoId(parsed.pathname) || extractXHamsterVideoId(urlString);
        if (vid) {
          const embedCandidates = [
            `https://xhamster.com/xembed.php?video=${vid}`,
            `https://${host}/xembed.php?video=${vid}`,
            `https://xhamster.desi/xembed.php?video=${vid}`
          ];
          for (const embedUrl of embedCandidates) {
            try {
              const embedRes = await axios.get(embedUrl, {
                timeout: 5000,
                headers: STANDARD_HEADERS
              });
              const embedHtml = typeof embedRes.data === 'string' ? embedRes.data : '';
              const xhEmbedCandidates = extractAndScoreCandidates(
                cheerio.load(embedHtml),
                embedHtml,
                embedUrl
              );
              if (xhEmbedCandidates.length > 0) {
                validThumbnail = xhEmbedCandidates[0].url;
                break;
              }
            } catch (e) {}
          }
        }
      } else {
        const match =
          parsed.pathname.match(/\/video[\.-]?(\d+)/i) || parsed.pathname.match(/\/embedframe\/(\d+)/i);
        const vid = match ? match[1] : null;
        if (vid) {
          try {
            const isXnxx = host.includes('xnxx');
            const embedUrl = isXnxx
              ? `https://www.xnxx.com/embedframe/${vid}`
              : `https://www.xvideos.com/embedframe/${vid}`;
            const embedRes = await axios.get(embedUrl, {
              timeout: 5000,
              headers: STANDARD_HEADERS
            });
            const embedHtml = typeof embedRes.data === 'string' ? embedRes.data : '';
            const embedCandidates = extractAndScoreCandidates(
              cheerio.load(embedHtml),
              embedHtml,
              embedUrl
            );
            if (embedCandidates.length > 0) {
              validThumbnail = embedCandidates[0].url;
            }
          } catch (e) {}
        }
      }
    }

    // Final fallback to high-resolution Google favicon
    if (!validThumbnail && host) {
      validThumbnail = `https://www.google.com/s2/favicons?domain=${host}&sz=128`;
    }

    // Adult Content Verification
    const adultKeywords = [
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
      'spankbang',
      'xvideos',
      'pornhub',
      'xhamster',
      'xnxx'
    ];
    const textToCheck = `${title} ${description} ${$('meta[name="keywords"]').attr('content') || ''}`.toLowerCase();
    const finalIsAdult = Boolean(
      isAdult ||
        adultKeywords.some(kw => {
          const regex = new RegExp(`\\b${kw}\\b`, 'i');
          return regex.test(textToCheck);
        })
    );

    // Infer Resource Type from Open Graph or DOM elements
    const ogType = $('meta[property="og:type"]').attr('content') || '';
    let resourceType = 'WEBSITE';
    if (ogType.includes('video') || finalIsAdult || $('video').length > 0) {
      resourceType = 'VIDEO';
    } else if (ogType.includes('article')) {
      resourceType = 'ARTICLE';
    } else if (ogType.includes('audio') || ogType.includes('music')) {
      resourceType = 'AUDIO';
    }

    return {
      title: title || parsed.hostname,
      description: description.slice(0, 500) || `Resource from ${parsed.hostname}`,
      thumbnail: validThumbnail || '',
      resourceType,
      domain: host,
      isNsfw: finalIsAdult
    };
  } catch (err) {
    let targetUrl = String(urlString || '').trim();
    if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
      targetUrl = 'https://' + targetUrl;
    }

    let host = '';
    let isAdult = false;
    let fallbackThumb = '';

    try {
      const parsed = new URL(targetUrl);
      host = parsed.hostname.toLowerCase().replace(/^www\./, '');
      isAdult = isAdultHost(host);

      if (host === 'youtube.com' || host === 'm.youtube.com' || host === 'youtu.be') {
        const v =
          host === 'youtu.be'
            ? parsed.pathname.replace(/^\//, '').split('/')[0]
            : parsed.searchParams.get('v');
        if (v) fallbackThumb = `https://i.ytimg.com/vi/${v}/hqdefault.jpg`;
      } else if (host.includes('stripchat.com')) {
        const u = parsed.pathname.replace(/^\//, '').split('/')[0];
        if (u) fallbackThumb = `https://img.stripchat.com/preview/${u}.jpg`;
      } else if (host.includes('chaturbate.com')) {
        const u = parsed.pathname.replace(/^\//, '').split('/')[0];
        if (u) fallbackThumb = `https://roomimg.stream.highwebmedia.com/ri/${u}.jpg`;
      } else if (host.includes('xhamster') || host.includes('xhwide')) {
        const vid = extractXHamsterVideoId(parsed.pathname) || extractXHamsterVideoId(targetUrl);
        if (vid) {
          const embedCandidates = [
            `https://xhamster.com/xembed.php?video=${vid}`,
            `https://${host}/xembed.php?video=${vid}`,
            `https://xhamster.desi/xembed.php?video=${vid}`
          ];
          for (const embedUrl of embedCandidates) {
            try {
              const embedRes = await axios.get(embedUrl, {
                timeout: 5000,
                headers: STANDARD_HEADERS
              });
              const embedHtml = typeof embedRes.data === 'string' ? embedRes.data : '';
              const xhCandidates = extractAndScoreCandidates(
                cheerio.load(embedHtml),
                embedHtml,
                embedUrl
              );
              if (xhCandidates.length > 0) {
                fallbackThumb = xhCandidates[0].url;
                break;
              }
            } catch (e) {}
          }
        }
        if (!fallbackThumb && host) {
          fallbackThumb = `https://www.google.com/s2/favicons?domain=${host}&sz=128`;
        }
      } else if (host) {
        fallbackThumb = `https://www.google.com/s2/favicons?domain=${host}&sz=128`;
      }
    } catch (e) {
      host = targetUrl.replace(/^https?:\/\//, '').split('/')[0];
    }

    return {
      title: host || 'Discovered Resource',
      description: `Resource from ${host || 'web'}`,
      thumbnail: fallbackThumb,
      resourceType: isAdult ? 'VIDEO' : 'WEBSITE',
      domain: host,
      isNsfw: isAdult
    };
  }
}
