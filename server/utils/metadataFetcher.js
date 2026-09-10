import axios from 'axios';
import * as cheerio from 'cheerio';
import { URL } from 'url';

// Check for private/internal IPs to prevent SSRF
function isPrivateHost(hostname) {
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

// Check if an image URL is merely a site logo, favicon, or generic placeholder
function isLogoOrGenericIcon(imgUrl) {
  if (!imgUrl) return true;
  const lower = imgUrl.toLowerCase();

  // If it's a known video thumbnail CDN, it is NOT a generic icon
  if (
    lower.includes('ytimg.com') ||
    lower.includes('youtube.com/vi/') ||
    lower.includes('vimeocdn.com') ||
    lower.includes('phncdn.com') ||
    lower.includes('stripchat.com/preview') ||
    lower.includes('highwebmedia.com') ||
    lower.includes('spankbang.com') ||
    lower.includes('xvideos-cdn.com') ||
    lower.includes('xnxx-cdn.com')
  ) {
    return false;
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
    'header-logo',
    'footer-logo',
    'nav-logo',
    'brand-logo',
    'watermark',
    'default_avatar',
    'avatar_default',
    'blank.png',
    'touch-icon',
    'apple-icon',
    'brand_logo',
    'app_icon'
  ];
  return logoPatterns.some(pattern => lower.includes(pattern));
}

// Known Adult Domains for auto-tagging and specialized parsers
const ADULT_DOMAINS = [
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
    const isAdult = ADULT_DOMAINS.some(d => host === d || host.endsWith(`.${d}`));

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
        const oembedRes = await axios.get(`https://www.youtube.com/oembed?url=${encodeURIComponent(urlString)}&format=json`, {
          timeout: 4000,
          headers: { 'User-Agent': 'Mozilla/5.0' }
        });
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
        const oembedRes = await axios.get(`https://vimeo.com/api/oembed.json?url=${encodeURIComponent(urlString)}`, {
          timeout: 4000,
          headers: { 'User-Agent': 'Mozilla/5.0' }
        });
        if (oembedRes.data) {
          return {
            title: oembedRes.data.title || 'Vimeo Video',
            description: oembedRes.data.description || `Vimeo video by ${oembedRes.data.author_name || 'Creator'}`,
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
        const oembedRes = await axios.get(`https://open.spotify.com/oembed?url=${encodeURIComponent(urlString)}`, {
          timeout: 4000,
          headers: { 'User-Agent': 'Mozilla/5.0' }
        });
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
        const oembedRes = await axios.get(`https://soundcloud.com/oembed?url=${encodeURIComponent(urlString)}&format=json`, {
          timeout: 4000,
          headers: { 'User-Agent': 'Mozilla/5.0' }
        });
        if (oembedRes.data) {
          return {
            title: oembedRes.data.title || 'SoundCloud Track',
            description: oembedRes.data.description || `SoundCloud audio by ${oembedRes.data.author_name || 'Artist'}`,
            thumbnail: oembedRes.data.thumbnail_url || '',
            resourceType: 'AUDIO',
            domain: host,
            isNsfw: false
          };
        }
      } catch (err) {}
    }

    // 5. Specialized fetcher for Pornhub oEmbed
    if (host.includes('pornhub.com') || host.includes('pornhubpremium.com')) {
      const viewkey = parsed.searchParams.get('viewkey') || (parsed.pathname.includes('/embed/') ? parsed.pathname.split('/embed/')[1]?.split('/')[0] : null);
      if (viewkey) {
        try {
          const oembedUrl = `https://www.pornhub.com/oembed?url=https://www.pornhub.com/view_video.php?viewkey=${viewkey}&format=json`;
          const oembedRes = await axios.get(oembedUrl, {
            timeout: 5000,
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
              'Accept': 'application/json,text/plain,*/*'
            }
          });

          if (oembedRes.data && (oembedRes.data.thumbnail_url || oembedRes.data.title)) {
            const thumb = oembedRes.data.thumbnail_url || '';
            const finalThumb = (!isLogoOrGenericIcon(thumb)) ? thumb : '';

            return {
              title: (oembedRes.data.title || 'Pornhub Video').trim(),
              description: `Video on Pornhub by ${oembedRes.data.author_name || 'Community Creator'}`,
              thumbnail: finalThumb || '',
              resourceType: 'VIDEO',
              domain: host,
              isNsfw: true
            };
          }
        } catch (oembedErr) {
          // Fall through to standard scraping
        }
      }
    }

    // 6. Specialized direct snapshot generators for Live Cam sites
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

    // Standard Desktop Browser Headers with Age Verification Cookies
    const response = await axios.get(urlString, {
      timeout: 8000,
      maxContentLength: 4 * 1024 * 1024, // 4MB max response
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Sec-Fetch-User': '?1',
        'Upgrade-Insecure-Requests': '1',
        'Cookie': 'hasVisited=1; accessAgeDisclaimerPH=1; age_verified=1; platform=pc; consent=1; xvideos_age=1; xh_over_18=1;'
      }
    });

    const contentType = response.headers['content-type'] || '';

    // Handle Direct Image Response
    if (contentType.startsWith('image/')) {
      return {
        title: parsed.pathname.split('/').pop() || 'Image Resource',
        description: `Direct Image from ${parsed.hostname}`,
        thumbnail: urlString,
        resourceType: 'IMAGE',
        domain: host,
        isNsfw: isAdult
      };
    }

    // Handle HTML Document Response
    const $ = cheerio.load(response.data);

    const ogTitle = $('meta[property="og:title"]').attr('content');
    const twitterTitle = $('meta[name="twitter:title"]').attr('content');
    const pageTitle = $('title').text();
    const title = (ogTitle || twitterTitle || pageTitle || '').trim();

    const ogDesc = $('meta[property="og:description"]').attr('content');
    const metaDesc = $('meta[name="description"]').attr('content');
    const twitterDesc = $('meta[name="twitter:description"]').attr('content');
    const description = (ogDesc || twitterDesc || metaDesc || '').trim();

    // Multi-source Thumbnail candidates
    const candidateImages = [];

    // 1. JSON-LD structured data (VideoObject, Article, MediaObject)
    $('script[type="application/ld+json"]').each((_, el) => {
      try {
        const text = $(el).html();
        if (!text) return;
        const data = JSON.parse(text);
        const items = Array.isArray(data) ? data : [data];
        for (const item of items) {
          if (item.thumbnailUrl) {
            if (Array.isArray(item.thumbnailUrl)) candidateImages.push(...item.thumbnailUrl);
            else candidateImages.push(item.thumbnailUrl);
          }
          if (item.image) {
            if (typeof item.image === 'string') candidateImages.push(item.image);
            else if (item.image.url) candidateImages.push(item.image.url);
            else if (Array.isArray(item.image)) candidateImages.push(...item.image);
          }
        }
      } catch (e) {}
    });

    // 2. OpenGraph & Twitter image tags
    const ogImageSecure = $('meta[property="og:image:secure_url"]').attr('content');
    const ogImage = $('meta[property="og:image"]').attr('content');
    const twitterImage = $('meta[name="twitter:image"]').attr('content') || $('meta[name="twitter:image:src"]').attr('content');
    const linkImageSrc = $('link[rel="image_src"]').attr('href') || $('link[rel="thumbnail"]').attr('href');
    const videoPoster = $('video').attr('poster') || $('div[data-poster]').attr('data-poster') || $('div[data-thumb]').attr('data-thumb');

    if (ogImageSecure) candidateImages.push(ogImageSecure);
    if (ogImage) candidateImages.push(ogImage);
    if (twitterImage) candidateImages.push(twitterImage);
    if (linkImageSrc) candidateImages.push(linkImageSrc);
    if (videoPoster) candidateImages.push(videoPoster);

    // 3. Platform-specific script regex extractions
    const rawHtml = typeof response.data === 'string' ? response.data : '';

    // XVideos / XNXX player script thumb
    const xvideosThumb169 = rawHtml.match(/html5player\.setThumbUrl169\s*\(\s*['"]([^'"]+)['"]\s*\)/i);
    if (xvideosThumb169 && xvideosThumb169[1]) candidateImages.push(xvideosThumb169[1]);
    const xvideosThumb = rawHtml.match(/html5player\.setThumbUrl\s*\(\s*['"]([^'"]+)['"]\s*\)/i);
    if (xvideosThumb && xvideosThumb[1]) candidateImages.push(xvideosThumb[1]);

    // xHamster initials video model thumb
    const xhamsterThumb = rawHtml.match(/"thumbUrl"\s*:\s*"([^"]+)"/i) || rawHtml.match(/"image"\s*:\s*"([^"]+)"/i);
    if (xhamsterThumb && xhamsterThumb[1]) candidateImages.push(xhamsterThumb[1].replace(/\\/g, ''));

    // SpankBang stream / poster
    const spankbangCover = rawHtml.match(/cover_url\s*[:=]\s*["']([^"']+)["']/i);
    if (spankbangCover && spankbangCover[1]) candidateImages.push(spankbangCover[1]);

    // General flashvars or player image_url
    const flashvarsMatch = rawHtml.match(/"image_url"\s*:\s*"([^"]+)"/i);
    if (flashvarsMatch && flashvarsMatch[1]) candidateImages.push(flashvarsMatch[1].replace(/\\/g, ''));

    const posterMatch = rawHtml.match(/poster\s*[:=]\s*["']([^"']+)["']/i);
    if (posterMatch && posterMatch[1]) candidateImages.push(posterMatch[1]);

    // Resolve candidates & filter out site logos / placeholder icons
    let validThumbnail = '';
    for (let candidate of candidateImages) {
      if (!candidate || typeof candidate !== 'string') continue;
      candidate = candidate.trim();
      if (!candidate) continue;

      if (!candidate.startsWith('http')) {
        try {
          candidate = new URL(candidate, urlString).toString();
        } catch (e) {
          continue;
        }
      }

      // If it's not a generic logo/icon, prioritize it
      if (!isLogoOrGenericIcon(candidate)) {
        validThumbnail = candidate;
        break;
      }
    }

    // Fallback: If all candidates were filtered, use the first valid candidate
    if (!validThumbnail && candidateImages.length > 0) {
      for (let candidate of candidateImages) {
        if (!candidate || typeof candidate !== 'string') continue;
        let c = candidate.trim();
        if (!c.startsWith('http')) {
          try {
            c = new URL(c, urlString).toString();
          } catch (e) {
            continue;
          }
        }
        if (c.startsWith('http')) {
          validThumbnail = c;
          break;
        }
      }
    }

    // Final fallback to Google High-Res Favicon
    if (!validThumbnail && host) {
      validThumbnail = `https://www.google.com/s2/favicons?domain=${host}&sz=128`;
    }

    // Check adult content via domain and content keywords
    const adultKeywords = ['nsfw', '18+', 'adult', 'xxx', 'porn', 'porno', 'sex', 'sexy', 'erotic', 'erotica', 'hentai', 'nude', 'nudes', 'boobs', 'tits', 'spankbang', 'xvideos', 'pornhub', 'xhamster', 'xnxx'];
    const textToCheck = `${title} ${description} ${$('meta[name="keywords"]').attr('content') || ''}`.toLowerCase();
    const finalIsAdult = Boolean(isAdult || adultKeywords.some(kw => {
      const regex = new RegExp(`\\b${kw}\\b`, 'i');
      return regex.test(textToCheck);
    }));

    // Infer Resource Type from Open Graph or Meta tags
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
      isAdult = ADULT_DOMAINS.some(d => host === d || host.endsWith(`.${d}`));

      if (host === 'youtube.com' || host === 'm.youtube.com' || host === 'youtu.be') {
        const v = host === 'youtu.be' ? parsed.pathname.replace(/^\//, '').split('/')[0] : parsed.searchParams.get('v');
        if (v) fallbackThumb = `https://i.ytimg.com/vi/${v}/hqdefault.jpg`;
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
