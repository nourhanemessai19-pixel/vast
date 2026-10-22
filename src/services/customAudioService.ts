// IndexedDB persistent storage service for custom audio recordings (e.g. human voice definitions)

const DB_NAME = 'aphasia_audio_database';
const STORE_NAME = 'custom_audios';
const DB_VERSION = 1;

let dbPromise: Promise<IDBDatabase> | null = null;

function getAudioDB(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'key' });
      }
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });

  return dbPromise;
}

export interface StoredAudioRecord {
  key: string;
  blob: Blob;
  mimeType: string;
  createdAt: number;
}

const memoryObjectUrls = new Map<string, string>();

export const customAudioService = {
  async saveAudio(key: string, blob: Blob, mimeType: string = 'audio/webm'): Promise<string> {
    const db = await getAudioDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const record: StoredAudioRecord = {
        key,
        blob,
        mimeType,
        createdAt: Date.now(),
      };
      const req = store.put(record);

      req.onsuccess = () => {
        // Revoke previous memory URL if any
        if (memoryObjectUrls.has(key)) {
          URL.revokeObjectURL(memoryObjectUrls.get(key)!);
        }
        const url = URL.createObjectURL(blob);
        memoryObjectUrls.set(key, url);
        resolve(url);
      };

      req.onerror = () => {
        reject(req.error);
      };
    });
  },

  async getAudioUrl(key: string): Promise<string | null> {
    if (memoryObjectUrls.has(key)) {
      return memoryObjectUrls.get(key)!;
    }

    try {
      const db = await getAudioDB();
      return new Promise((resolve) => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const req = store.get(key);

        req.onsuccess = () => {
          const record = req.result as StoredAudioRecord | undefined;
          if (record && record.blob) {
            const url = URL.createObjectURL(record.blob);
            memoryObjectUrls.set(key, url);
            resolve(url);
          } else {
            resolve(null);
          }
        };

        req.onerror = () => {
          resolve(null);
        };
      });
    } catch {
      return null;
    }
  },

  async getAllAudioKeys(): Promise<string[]> {
    try {
      const db = await getAudioDB();
      return new Promise((resolve) => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const req = store.getAllKeys();

        req.onsuccess = () => {
          resolve((req.result as string[]) || []);
        };

        req.onerror = () => {
          resolve([]);
        };
      });
    } catch {
      return [];
    }
  },

  async deleteAudio(key: string): Promise<void> {
    if (memoryObjectUrls.has(key)) {
      URL.revokeObjectURL(memoryObjectUrls.get(key)!);
      memoryObjectUrls.delete(key);
    }

    try {
      const db = await getAudioDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const req = store.delete(key);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    } catch {
      // ignore
    }
  },
};
