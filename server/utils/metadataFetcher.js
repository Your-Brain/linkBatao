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

export async function fetchUrlMetadata(urlString) {
  try {
    const parsed = new URL(urlString);

    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      throw new Error('Unsupported protocol. Only HTTP and HTTPS URLs are permitted.');
    }

    if (isPrivateHost(parsed.hostname)) {
      throw new Error('Access to private or local network resources is forbidden.');
    }

    const response = await axios.get(urlString, {
      timeout: 5000,
      maxContentLength: 2 * 1024 * 1024, // 2MB max response
      headers: {
        'User-Agent': 'AuraLinkBot/1.0 (+https://auralink.io/bot)',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5'
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
        domain: parsed.hostname.replace(/^www\./, '')
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

    let ogImage = $('meta[property="og:image"]').attr('content') || $('meta[name="twitter:image"]').attr('content') || '';
    if (ogImage && !ogImage.startsWith('http')) {
      try {
        ogImage = new URL(ogImage, urlString).toString();
      } catch (e) {
        ogImage = '';
      }
    }

    // Infer Resource Type from Open Graph or Meta tags
    const ogType = $('meta[property="og:type"]').attr('content') || '';
    let resourceType = 'WEBSITE';
    if (ogType.includes('video')) {
      resourceType = 'VIDEO';
    } else if (ogType.includes('article')) {
      resourceType = 'ARTICLE';
    } else if (ogType.includes('audio') || ogType.includes('music')) {
      resourceType = 'AUDIO';
    }

    const favicon = `https://www.google.com/s2/favicons?domain=${parsed.hostname}&sz=128`;

    return {
      title: title || parsed.hostname,
      description: description.slice(0, 500) || `Resource from ${parsed.hostname}`,
      thumbnail: ogImage || favicon,
      resourceType,
      domain: parsed.hostname.replace(/^www\./, '')
    };
  } catch (err) {
    const parsed = new URL(urlString);
    return {
      title: parsed.hostname,
      description: `Discovered link on ${parsed.hostname}`,
      thumbnail: `https://www.google.com/s2/favicons?domain=${parsed.hostname}&sz=128`,
      resourceType: 'WEBSITE',
      domain: parsed.hostname.replace(/^www\./, '')
    };
  }
}
