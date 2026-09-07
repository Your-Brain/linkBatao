/**
 * Universal URL & Text Extractor
 * Safely parses, cleans, sanitizes, and extracts URLs and text from share payloads.
 */

// Tracking parameters to strip for clean canonical URLs
const TRACKING_PARAMS = [
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_term',
  'utm_content',
  'utm_id',
  'si',          // YouTube & Spotify share identifier
  'igsh',        // Instagram share hash
  'fbclid',      // Facebook click ID
  'gclid',       // Google click ID
  'msclkid',     // Microsoft click ID
  'ref',         // Generic ref
  'ref_src',     // Twitter / X ref source
  'ref_url',     // Twitter ref url
  'feature',     // YouTube feature tracker (e.g. youtu.be/xyz?feature=shared)
  'share_id',    // Generic share tracker
  'tracking_id',
  'mc_cid',      // Mailchimp
  'mc_eid'
];

// Robust Regex to find URLs inside arbitrary shared text
const URL_REGEX = /(https?:\/\/[^\s<>"'{}|\\^`[\]]+)/gi;

/**
 * Validates if a URL is safe and well-formed
 */
export function isValidWebUrl(rawUrl) {
  if (!rawUrl || typeof rawUrl !== 'string') return false;
  const trimmed = rawUrl.trim();

  // Explicitly disallow dangerous pseudo-protocols
  const lower = trimmed.toLowerCase();
  if (
    lower.startsWith('javascript:') ||
    lower.startsWith('data:') ||
    lower.startsWith('vbscript:') ||
    lower.startsWith('file:') ||
    lower.startsWith('blob:')
  ) {
    return false;
  }

  try {
    const parsed = new URL(trimmed.startsWith('http://') || trimmed.startsWith('https://') ? trimmed : `https://${trimmed}`);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Clean URL by removing analytics & marketing trackers while keeping essential functional query params
 */
export function cleanTrackingParams(rawUrl) {
  if (!isValidWebUrl(rawUrl)) return rawUrl;

  try {
    const parsed = new URL(rawUrl);
    TRACKING_PARAMS.forEach((param) => {
      parsed.searchParams.delete(param);
    });

    // Clean up dangling question marks
    const cleaned = parsed.toString();
    return cleaned.replace(/\?$/, '');
  } catch {
    return rawUrl;
  }
}

/**
 * Extracts all URLs found inside a block of text
 */
export function extractUrlsFromText(text) {
  if (!text || typeof text !== 'string') return [];
  const matches = text.match(URL_REGEX) || [];

  const uniqueValidUrls = [];
  for (const match of matches) {
    // Strip trailing punctuation often attached from sentence ends like "check this: https://example.com/."
    const sanitized = match.replace(/[.,;:!?)\]]+$/, '');
    if (isValidWebUrl(sanitized) && !uniqueValidUrls.includes(sanitized)) {
      uniqueValidUrls.push(sanitized);
    }
  }

  return uniqueValidUrls;
}

/**
 * Safely sanitizes user text to prevent XSS when rendered
 */
export function sanitizeText(str) {
  if (!str || typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Extracts hashtags from text
 */
export function extractHashtags(text) {
  if (!text || typeof text !== 'string') return [];
  const matches = text.match(/#([\w\u0080-\uFFFF]+)/g) || [];
  return [...new Set(matches.map(tag => tag.replace(/^#/, '').toLowerCase()))];
}

/**
 * Universal Share Parser
 * Ingests { title, text, url } from Web Share Target and breaks it down into structured data
 */
export function parseUniversalShareInput({ title = '', text = '', url = '' }) {
  const safeTitle = typeof title === 'string' ? title.trim() : '';
  const safeText = typeof text === 'string' ? text.trim() : '';
  const safeUrl = typeof url === 'string' ? url.trim() : '';

  // 1. Collect all candidate URLs from dedicated url field + text + title
  const candidateUrls = [];

  if (safeUrl && isValidWebUrl(safeUrl)) {
    candidateUrls.push(safeUrl);
  }

  // Extract URLs embedded inside text
  const urlsInText = extractUrlsFromText(safeText);
  urlsInText.forEach((u) => {
    if (!candidateUrls.includes(u)) candidateUrls.push(u);
  });

  // Extract URLs embedded inside title (rare but possible)
  const urlsInTitle = extractUrlsFromText(safeTitle);
  urlsInTitle.forEach((u) => {
    if (!candidateUrls.includes(u)) candidateUrls.push(u);
  });

  // Pick primary URL
  const rawPrimaryUrl = candidateUrls.length > 0 ? candidateUrls[0] : null;
  const primaryUrl = rawPrimaryUrl ? cleanTrackingParams(rawPrimaryUrl) : null;
  const cleanedAllUrls = candidateUrls.map(u => cleanTrackingParams(u));

  // 2. Clean up text by removing the primary URL to get pure caption/message
  let cleanText = safeText;
  if (primaryUrl && urlsInText.includes(rawPrimaryUrl)) {
    cleanText = cleanText.replace(rawPrimaryUrl, '').replace(/\s+/g, ' ').trim();
  }

  // If title was identical to URL, fallback title
  let finalTitle = safeTitle;
  if (finalTitle && isValidWebUrl(finalTitle)) {
    finalTitle = '';
  }

  // Extract hashtags
  const hashtags = extractHashtags(safeText);

  return {
    hasUrl: Boolean(primaryUrl),
    primaryUrl,
    allUrls: cleanedAllUrls,
    title: finalTitle,
    rawText: safeText,
    cleanText,
    hashtags
  };
}
