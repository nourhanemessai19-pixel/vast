// IndexedDB storage service for custom VAST video clips (e.g. AI-generated mouth videos)

const DB_NAME = 'vast_video_database';
const STORE_NAME = 'item_videos';
const DB_VERSION = 1;

let dbPromise: Promise<IDBDatabase> | null = null;

function getDB(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'itemId' });
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

export interface StoredVideoRecord {
  itemId: string;
  blob: Blob;
  mimeType: string;
  name: string;
  uploadedAt: number;
}

export interface VideoInfo {
  itemId: string;
  name: string;
  uploadedAt: number;
  url: string;
  size: number;
}

const memoryObjectUrls = new Map<string, string>();
type Listener = (itemId: string, url: string | null) => void;
const listeners = new Set<Listener>();

// Fruit & vegetable alias map for smart fuzzy matching
const ITEM_ALIASES: Record<string, string[]> = {
  strawberry: ['strawberry', 'فراز', 'فراولة', 'fraise', 'fraz', 'fruits-strawberry', 'fruits_strawberry', 'fruit-0', 'fruits-0'],
  apple: ['apple', 'تفاح', 'تفاحة', 'pomme', 'تفاحه', 'fruits-apple', 'fruits_apple', 'fruit-1', 'fruits-1'],
  orange: ['orange', 'تشينة', 'برتقال', 'برتقالة', 'tchina', 'تشينه', 'fruits-orange', 'fruits_orange', 'fruit-2', 'fruits-2'],
  banana: ['banana', 'بنان', 'موز', 'موزة', 'banane', 'banaane', 'fruits-banana', 'fruits_banana', 'fruit-3', 'fruits-3'],
  grapes: ['grapes', 'عنب', 'raisin', '3neb', 'fruits-grapes', 'fruits_grapes', 'fruit-4', 'fruits-4'],
  watermelon: ['watermelon', 'دلاع', 'بطيخ', 'pasteque', 'dlaa', 'dalla3', 'fruits-watermelon', 'fruit-5', 'fruits-5'],
  pear: ['pear', 'أنجاص', 'انجاص', 'anjas', 'إجاص', 'اجاص', 'poire', 'fruits-pear', 'fruit-6', 'fruits-6'],
  peach: ['peach', 'خوخ', 'peche', 'pêche', 'khokh', 'fruits-peach', 'fruit-7', 'fruits-7'],
  lemon: ['lemon', 'ليمون', 'قارص', 'citron', 'qares', 'fruits-lemon', 'fruit-8', 'fruits-8'],
  potato: ['potato', 'بطاطا', 'pomme de terre', 'batata', 'vegetables-potato', 'vegetables_potato', 'veg-0', 'veggies-0'],
  tomato: ['tomato', 'طماطم', 'طماطيش', 'tomate', 'tmatem', 'vegetables-tomato', 'vegetables_tomato', 'veg-1', 'veggies-1'],
  carrot: ['carrot', 'زرودية', 'زروديه', 'جزر', 'carotte', 'zroudia', 'vegetables-carrot', 'vegetables_carrot', 'veg-2', 'veggies-2'],
  cucumber: ['cucumber', 'خيار', 'concombre', 'khiar', 'vegetables-cucumber', 'vegetables_cucumber', 'veg-3', 'veggies-3'],
  onion: ['onion', 'بصل', 'oignon', 'bsel', 'vegetables-onion', 'vegetables_onion', 'veg-4', 'veggies-4'],
  pepper: ['pepper', 'فلفل', 'poivron', 'felfel', 'vegetables-pepper', 'vegetables_pepper', 'veg-5', 'veggies-5'],
  garlic: ['garlic', 'ثوم', 'ail', 'thoum', 'vegetables-garlic', 'vegetables_garlic', 'veg-6', 'veggies-6'],
  eggplant: ['eggplant', 'باذنجان', 'بيذنجان', 'aubergine', 'batenjal', 'vegetables-eggplant', 'veg-7', 'veggies-7'],
  zucchini: ['zucchini', 'جريوات', 'قرعة', 'كوسى', 'courgette', 'garaa', 'vegetables-zucchini', 'veg-8', 'veggies-8'],
  lettuce: ['lettuce', 'سلاطة', 'خس', 'salade', 'laitue', 'slata', 'vegetables-lettuce', 'veg-9', 'veggies-9'],
};

export function extractYouTubeId(url: string | null | undefined): string | null {
  if (!url) return null;
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
  return match ? match[1] : null;
}

export const customVideoService = {
  saveYouTubeUrl(itemId: string, rawUrl: string): string {
    const url = rawUrl.trim();
    try {
      localStorage.setItem(`vast_custom_youtube_${itemId}`, url);
    } catch {
      // Ignore
    }
    listeners.forEach((l) => l(itemId, url));
    return url;
  },

  getCustomYouTubeUrl(itemId: string): string | null {
    try {
      return localStorage.getItem(`vast_custom_youtube_${itemId}`);
    } catch {
      return null;
    }
  },

  async saveVideo(itemId: string, fileOrBlob: Blob, filename = 'vast_video.mp4'): Promise<string> {
    const db = await getDB();
    const savePromise = new Promise<string>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);

      const record: StoredVideoRecord = {
        itemId,
        blob: fileOrBlob,
        mimeType: fileOrBlob.type || 'video/mp4',
        name: filename,
        uploadedAt: Date.now(),
      };

      const putReq = store.put(record);

      putReq.onsuccess = () => {
        if (memoryObjectUrls.has(itemId)) {
          try {
            URL.revokeObjectURL(memoryObjectUrls.get(itemId)!);
          } catch {
            // Ignore
          }
        }
        const url = URL.createObjectURL(fileOrBlob);
        memoryObjectUrls.set(itemId, url);
        listeners.forEach((l) => l(itemId, url));
        resolve(url);
      };

      putReq.onerror = () => {
        reject(putReq.error);
      };
    });

    // Also attempt server-side persistence in background
    try {
      fetch(`/api/upload-video?itemId=${encodeURIComponent(itemId)}`, {
        method: 'POST',
        headers: {
          'Content-Type': fileOrBlob.type || 'video/mp4',
          'X-File-Name': encodeURIComponent(filename),
        },
        body: fileOrBlob,
      }).catch((err) => {
        console.warn('Server persistence not available, saved locally in IndexedDB:', err);
      });
    } catch {
      // Ignore background upload errors
    }

    return savePromise;
  },

  async getSingleUrl(key: string): Promise<string | null> {
    if (memoryObjectUrls.has(key)) {
      return memoryObjectUrls.get(key)!;
    }

    try {
      const db = await getDB();
      return new Promise((resolve) => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const req = store.get(key);

        req.onsuccess = () => {
          const record = req.result as StoredVideoRecord | undefined;
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

  // Retrieve ALL stored video records across the entire database
  async getAllStoredVideos(): Promise<VideoInfo[]> {
    const list: VideoInfo[] = [];
    try {
      const db = await getDB();
      const records: StoredVideoRecord[] = await new Promise((resolve) => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const req = store.getAll();
        req.onsuccess = () => resolve((req.result as StoredVideoRecord[]) || []);
        req.onerror = () => resolve([]);
      });

      for (const rec of records) {
        if (rec && rec.blob) {
          let url = memoryObjectUrls.get(rec.itemId);
          if (!url) {
            url = URL.createObjectURL(rec.blob);
            memoryObjectUrls.set(rec.itemId, url);
          }
          list.push({
            itemId: rec.itemId,
            name: rec.name || rec.itemId,
            uploadedAt: rec.uploadedAt || Date.now(),
            url,
            size: rec.blob.size || 0,
          });
        }
      }

      // Also include any stored YouTube links
      try {
        for (let i = 0; i < localStorage.length; i++) {
          const k = localStorage.key(i);
          if (k && k.startsWith('vast_custom_youtube_')) {
            const ytItemId = k.replace('vast_custom_youtube_', '');
            const ytUrl = localStorage.getItem(k);
            if (ytUrl) {
              list.push({
                itemId: ytItemId,
                name: `فيديو يوتيوب (${ytItemId})`,
                uploadedAt: Date.now(),
                url: ytUrl,
                size: 0,
              });
            }
          }
        }
      } catch {
        // Ignore
      }
    } catch {
      // Ignore
    }

    return list;
  },

  async getVideoUrl(itemId: string): Promise<string | null> {
    // 0. Check custom YouTube link first
    const directYt = this.getCustomYouTubeUrl(itemId);
    if (directYt) return directYt;

    const aliases = ITEM_ALIASES[itemId.toLowerCase()] || [];
    for (const alias of aliases) {
      const aliasYt = this.getCustomYouTubeUrl(alias);
      if (aliasYt) return aliasYt;
    }

    // 1. Direct key match
    const directUrl = await this.getSingleUrl(itemId);
    if (directUrl) return directUrl;

    // 2. Check predefined aliases (Arabic dialect, English, French, category keys)
    for (const alias of aliases) {
      const aliasUrl = await this.getSingleUrl(alias);
      if (aliasUrl) {
        memoryObjectUrls.set(itemId, aliasUrl);
        return aliasUrl;
      }
    }

    // 3. Variant patterns
    const variants = [
      `fruits-${itemId}`,
      `fruits_${itemId}`,
      `vegetables-${itemId}`,
      `vegetables_${itemId}`,
      itemId.replace(/^(fruits|vegetables)[-_]/, ''),
      itemId.toLowerCase(),
    ];

    for (const variant of variants) {
      if (variant !== itemId) {
        const variantUrl = await this.getSingleUrl(variant);
        if (variantUrl) {
          memoryObjectUrls.set(itemId, variantUrl);
          return variantUrl;
        }
      }
    }

    // 4. Check all records in DB for matching key or filename
    try {
      const allVideos = await this.getAllStoredVideos();
      const lowerId = itemId.toLowerCase();
      
      // Match by alias in stored video itemId or filename
      const match = allVideos.find((v) => {
        const vKey = v.itemId.toLowerCase();
        const vName = v.name.toLowerCase();

        if (vKey === lowerId || vKey.includes(lowerId) || lowerId.includes(vKey)) return true;
        if (vName.includes(lowerId)) return true;

        for (const alias of aliases) {
          const lowerAlias = alias.toLowerCase();
          if (vKey === lowerAlias || vKey.includes(lowerAlias) || vName.includes(lowerAlias)) {
            return true;
          }
        }
        return false;
      });

      if (match) {
        memoryObjectUrls.set(itemId, match.url);
        return match.url;
      }
    } catch {
      // Ignore
    }

    return null;
  },

  async deleteVideo(itemId: string): Promise<void> {
    try {
      localStorage.removeItem(`vast_custom_youtube_${itemId}`);
    } catch {
      // Ignore
    }

    const db = await getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.delete(itemId);

      req.onsuccess = () => {
        if (memoryObjectUrls.has(itemId)) {
          try {
            URL.revokeObjectURL(memoryObjectUrls.get(itemId)!);
          } catch {
            // Ignore
          }
          memoryObjectUrls.delete(itemId);
        }
        listeners.forEach((l) => l(itemId, null));
        resolve();
      };

      req.onerror = () => {
        reject(req.error);
      };
    });
  },

  async getAllStoredItemIds(): Promise<string[]> {
    try {
      const db = await getDB();
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

  async assignExistingVideo(sourceItemId: string, targetItemId: string): Promise<string | null> {
    try {
      const db = await getDB();
      const sourceRec: StoredVideoRecord | undefined = await new Promise((resolve) => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const req = store.get(sourceItemId);
        req.onsuccess = () => resolve(req.result as StoredVideoRecord | undefined);
        req.onerror = () => resolve(undefined);
      });

      if (!sourceRec || !sourceRec.blob) return null;
      return await this.saveVideo(targetItemId, sourceRec.blob, sourceRec.name);
    } catch {
      return null;
    }
  },

  async exportBackup(): Promise<{ count: number; filename: string }> {
    const db = await getDB();
    const records: StoredVideoRecord[] = await new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => resolve([]);
    });

    const youtubeLinks: { itemId: string; url: string }[] = [];
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith('vast_custom_youtube_')) {
          const ytItemId = k.replace('vast_custom_youtube_', '');
          const ytUrl = localStorage.getItem(k);
          if (ytUrl) youtubeLinks.push({ itemId: ytItemId, url: ytUrl });
        }
      }
    } catch {
      // Ignore
    }

    if (records.length === 0 && youtubeLinks.length === 0) {
      throw new Error('لا توجد أي فيديوهات مرفوعة أو روابط لتصديرها حالياً');
    }

    const exportItems = await Promise.all(
      records.map(async (r) => {
        const dataUrl = await new Promise<string>((res, rej) => {
          const reader = new FileReader();
          reader.onloadend = () => res(reader.result as string);
          reader.onerror = rej;
          reader.readAsDataURL(r.blob);
        });
        return {
          itemId: r.itemId,
          mimeType: r.mimeType,
          name: r.name,
          uploadedAt: r.uploadedAt,
          dataUrl,
        };
      })
    );

    const backupPayload = {
      app: 'speech-rehab-vast',
      version: 1,
      exportedAt: Date.now(),
      totalVideos: exportItems.length + youtubeLinks.length,
      items: exportItems,
      youtubeLinks,
    };

    const jsonString = JSON.stringify(backupPayload);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const dateStr = new Date().toISOString().split('T')[0];
    const filename = `vast-videos-backup-${dateStr}.json`;

    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 3000);

    return { count: exportItems.length + youtubeLinks.length, filename };
  },

  async importBackup(file: File): Promise<number> {
    const text = await file.text();
    const parsed = JSON.parse(text);
    if (!parsed) {
      throw new Error('صيغة ملف النسخة الاحتياطية غير صالحة');
    }

    let count = 0;
    if (Array.isArray(parsed.items)) {
      for (const item of parsed.items) {
        if (item.itemId && item.dataUrl) {
          const parts = item.dataUrl.split(';base64,');
          const contentType = parts[0].split(':')[1] || 'video/mp4';
          const raw = window.atob(parts[1]);
          const rawLength = raw.length;
          const uInt8Array = new Uint8Array(rawLength);
          for (let i = 0; i < rawLength; ++i) {
            uInt8Array[i] = raw.charCodeAt(i);
          }
          const blob = new Blob([uInt8Array], { type: contentType });
          await this.saveVideo(item.itemId, blob, item.name || `${item.itemId}.mp4`);
          count++;
        }
      }
    }

    if (Array.isArray(parsed.youtubeLinks)) {
      for (const yt of parsed.youtubeLinks) {
        if (yt.itemId && yt.url) {
          this.saveYouTubeUrl(yt.itemId, yt.url);
          count++;
        }
      }
    }

    return count;
  },

  subscribe(listener: Listener) {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
};

