import { URL } from 'url';

const TRACKING_PARAMS = new Set([
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_term',
  'utm_content',
  'fbclid',
  'gclid',
  'ref',
  's',
  'si',
  'igshid',
  'mc_cid',
  'mc_eid',
  '_hsenc',
  '_hsmi'
]);

export function normalizeUrl(rawUrl) {
  if (!rawUrl || typeof rawUrl !== 'string') {
    throw new Error('Invalid URL input');
  }

  let trimmed = rawUrl.trim();
  if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
    trimmed = 'https://' + trimmed;
  }

  const parsed = new URL(trimmed);

  // Lowercase hostname
  parsed.hostname = parsed.hostname.toLowerCase();

  // Strip tracking query parameters
  const keysToDelete = [];
  parsed.searchParams.forEach((value, key) => {
    if (TRACKING_PARAMS.has(key.toLowerCase())) {
      keysToDelete.push(key);
    }
  });

  keysToDelete.forEach(key => parsed.searchParams.delete(key));

  // Sort query parameters for consistent hashing
  parsed.searchParams.sort();

  // Strip trailing slash from pathname if path is longer than /
  if (parsed.pathname.length > 1 && parsed.pathname.endsWith('/')) {
    parsed.pathname = parsed.pathname.slice(0, -1);
  }

  return {
    normalizedUrl: parsed.toString(),
    domain: parsed.hostname.replace(/^www\./, ''),
    protocol: parsed.protocol
  };
}
