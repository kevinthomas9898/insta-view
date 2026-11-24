/**
 * Client-Side IndexedDB Storage for the Offline "Watch Later" Story Vault.
 * 100% private to the user's browser — zero server storage or telemetry.
 */

export interface VaultStoryItem {
  id: string;
  username: string;
  userAvatar?: string;
  mediaUrl: string;
  thumbnailUrl?: string;
  type: 'image' | 'video';
  takenAt: number;
  savedAt: number;
  expiresAt: number;
}

const DB_NAME = 'instaview_db';
const DB_VERSION = 1;
const STORE_NAME = 'story_vault';

function getDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      return reject(new Error('IndexedDB not supported in this environment'));
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('username', 'username', { unique: false });
        store.createIndex('savedAt', 'savedAt', { unique: false });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Save a story to the offline vault
 */
export async function saveStoryToVault(item: VaultStoryItem): Promise<boolean> {
  try {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(item);

      req.onsuccess = () => resolve(true);
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.error('Failed to save story to vault:', err);
    return false;
  }
}

/**
 * Retrieve all saved stories from the vault, sorted by savedAt descending
 */
export async function getVaultStories(): Promise<VaultStoryItem[]> {
  try {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.getAll();

      req.onsuccess = () => {
        const items = (req.result || []) as VaultStoryItem[];
        items.sort((a, b) => b.savedAt - a.savedAt);
        resolve(items);
      };
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.error('Failed to get vault stories:', err);
    return [];
  }
}

/**
 * Remove a specific story from the vault
 */
export async function removeStoryFromVault(id: string): Promise<boolean> {
  try {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.delete(id);

      req.onsuccess = () => resolve(true);
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.error('Failed to remove story from vault:', err);
    return false;
  }
}

/**
 * Check if a story is already saved in the vault
 */
export async function isStoryInVault(id: string): Promise<boolean> {
  try {
    const db = await getDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(id);

      req.onsuccess = () => resolve(Boolean(req.result));
      req.onerror = () => resolve(false);
    });
  } catch {
    return false;
  }
}

/**
 * Clear the entire vault
 */
export async function clearVault(): Promise<boolean> {
  try {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.clear();

      req.onsuccess = () => resolve(true);
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.error('Failed to clear vault:', err);
    return false;
  }
}
