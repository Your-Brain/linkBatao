/**
 * Client IndexedDB Helper for Web Share Target
 * Bridges Service Worker shared data with React UI
 */

const DB_NAME = 'aura_share_db';
const DB_VERSION = 1;
const STORE_NAME = 'shared_payloads';

export function openShareDB() {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      return reject(new Error('IndexedDB is not supported in this environment'));
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);
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

/**
 * Retrieve a shared payload by ID
 */
export async function getSharedPayload(id) {
  try {
    const db = await openShareDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(id);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('[IndexedDB] Could not retrieve shared payload:', err);
    return null;
  }
}

/**
 * Store a shared payload
 */
export async function setSharedPayload(payload) {
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
    console.error('[IndexedDB] Could not save shared payload:', err);
    return null;
  }
}

/**
 * Delete a shared payload by ID
 */
export async function deleteSharedPayload(id) {
  try {
    const db = await openShareDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.delete(id);
      req.onsuccess = () => resolve(true);
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('[IndexedDB] Could not delete shared payload:', err);
    return false;
  }
}

/**
 * Clean up shared payloads older than 24 hours
 */
export async function pruneOldSharedPayloads() {
  try {
    const db = await openShareDB();
    const cutoff = Date.now() - (24 * 60 * 60 * 1000);
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const req = store.openCursor();

    req.onsuccess = (event) => {
      const cursor = event.target.result;
      if (cursor) {
        if (cursor.value.timestamp && cursor.value.timestamp < cutoff) {
          cursor.delete();
        }
        cursor.continue();
      }
    };
  } catch (err) {
    // Non-critical pruning error
  }
}
