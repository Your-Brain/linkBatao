/**
 * AuraLink Service Worker
 * Includes Universal Web Share Target Interceptor, Offline Caching, and Asset Management.
 */

const CACHE_NAME = 'auralink-cache-v1';
const DB_NAME = 'aura_share_db';
const DB_VERSION = 1;
const STORE_NAME = 'shared_payloads';

const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.svg'
];

// Open / initialize IndexedDB inside Service Worker
function openShareDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// Store shared payload into IndexedDB
async function saveSharedPayload(payload) {
  try {
    const db = await openShareDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(payload);
      req.onsuccess = () => resolve(payload.id);
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.error('[Service Worker] Failed to save shared payload to IndexedDB:', err);
    return null;
  }
}

// -------------------------------------------------------------
// Service Worker Lifecycle Events
// -------------------------------------------------------------

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS).catch((err) => {
        console.warn('[Service Worker] Pre-cache warning:', err);
      });
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// -------------------------------------------------------------
// Fetch Event & Web Share Target Interception
// -------------------------------------------------------------

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // 1. Intercept Web Share Target POST request
  if (event.request.method === 'POST' && url.pathname === '/share-target') {
    event.respondWith(
      (async () => {
        try {
          const formData = await event.request.formData();
          const title = formData.get('title') || '';
          const text = formData.get('text') || '';
          const sharedUrl = formData.get('url') || '';
          const mediaFiles = formData.getAll('media') || [];

          // Format files with metadata and array buffers / blobs
          const filesData = [];
          for (const file of mediaFiles) {
            if (file && file.size > 0) {
              filesData.push({
                name: file.name || 'shared_file',
                type: file.type || 'application/octet-stream',
                size: file.size,
                lastModified: file.lastModified,
                blob: file // Blob is stored directly in IndexedDB
              });
            }
          }

          const shareId = 'share_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
          const payload = {
            id: shareId,
            timestamp: Date.now(),
            title: String(title),
            text: String(text),
            url: String(sharedUrl),
            files: filesData,
            source: 'native_share_target'
          };

          // Save payload to IndexedDB for the client window to retrieve
          await saveSharedPayload(payload);

          // Standard Web Share Target redirect (HTTP 303 See Other to GET page)
          return Response.redirect(`/share-target?share_id=${encodeURIComponent(shareId)}`, 303);
        } catch (err) {
          console.error('[Service Worker] Error processing POST share_target:', err);
          return Response.redirect('/share-target?error=share_process_failed', 303);
        }
      })()
    );
    return;
  }

  // 2. Navigation / Page requests (Network first, fall back to cached index.html)
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(async () => {
        const cache = await caches.open(CACHE_NAME);
        const cachedResponse = await cache.match('/index.html') || await cache.match('/');
        return cachedResponse || new Response('Offline - AuraLink', { status: 503, headers: { 'Content-Type': 'text/plain' } });
      })
    );
    return;
  }

  // 3. API requests (Always network first, do not cache API)
  if (url.pathname.startsWith('/api')) {
    event.respondWith(fetch(event.request));
    return;
  }

  // 4. Static assets (Stale-While-Revalidate)
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      }).catch(() => cachedResponse);

      return cachedResponse || fetchPromise;
    })
  );
});
