// IndexedDB Permanent Offline PDF Document Store
// Saves imported PDFs, textbook chapters and custom folders permanently across app restarts

const DB_NAME = 'ApexStudy_PDF_Storage_DB';
const DB_VERSION = 1;
const STORE_NAME = 'pdf_documents';

let dbPromise: Promise<IDBDatabase> | null = null;

function getDb(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = event => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };

    request.onsuccess = event => {
      const db = (event.target as IDBOpenDBRequest).result;
      resolve(db);
    };

    request.onerror = event => {
      console.error('IndexedDB open error:', (event.target as IDBOpenDBRequest).error);
      reject((event.target as IDBOpenDBRequest).error);
    };
  });

  return dbPromise;
}

/**
 * Permanently saves a PDF file, Blob or ArrayBuffer to IndexedDB.
 * Returns a persistent key URI e.g. "idb://pdf-123456" that can be loaded anytime.
 */
export async function savePdfToStorage(id: string, fileOrBlob: Blob | File | ArrayBuffer): Promise<string> {
  const db = await getDb();

  let arrayBuffer: ArrayBuffer;
  if (fileOrBlob instanceof ArrayBuffer) {
    arrayBuffer = fileOrBlob;
  } else if (fileOrBlob instanceof Blob) {
    arrayBuffer = await fileOrBlob.arrayBuffer();
  } else {
    throw new Error('Unsupported PDF data format');
  }

  const cleanId = id.replace(/^idb:\/\//, '');

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);

    const record = {
      id: cleanId,
      data: arrayBuffer,
      savedAt: new Date().toISOString(),
      size: arrayBuffer.byteLength,
    };

    const request = store.put(record);

    request.onsuccess = () => {
      resolve(`idb://${cleanId}`);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}

/**
 * Loads a permanently saved PDF from IndexedDB by its idb URI or ID.
 * Returns a Uint8Array ready for PDF.js rendering.
 */
export async function loadPdfFromStorage(idbKey: string): Promise<Uint8Array | null> {
  const cleanId = idbKey.replace(/^idb:\/\//, '').trim();
  if (!cleanId) return null;

  try {
    const db = await getDb();

    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const request = store.get(cleanId);

      request.onsuccess = () => {
        const record = request.result;
        if (record && record.data) {
          resolve(new Uint8Array(record.data));
        } else {
          resolve(null);
        }
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  } catch (err) {
    console.error('Failed to load PDF from IndexedDB:', err);
    return null;
  }
}

/**
 * Deletes a PDF from IndexedDB.
 */
export async function deletePdfFromStorage(idbKey: string): Promise<void> {
  const cleanId = idbKey.replace(/^idb:\/\//, '').trim();
  if (!cleanId) return;

  try {
    const db = await getDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const request = store.delete(cleanId);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.error('Failed to delete PDF from IndexedDB:', err);
  }
}
