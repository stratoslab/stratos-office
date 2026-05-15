import { TaskEntry } from './types';

const DB_NAME = 'stratos-history';
const STORE_NAME = 'entries';
const DB_VERSION = 1;
const MAX_ENTRIES = 200;

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('timestamp', 'timestamp', { unique: false });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function withStore<T>(mode: IDBTransactionMode, fn: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  return openDB().then(db => {
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, mode);
      const store = tx.objectStore(STORE_NAME);
      const request = fn(store);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
      tx.oncomplete = () => db.close();
    });
  });
}

export async function addEntry(entry: TaskEntry): Promise<void> {
  await withStore('readwrite', store => store.put(entry));
  const count = await getEntryCount();
  if (count > MAX_ENTRIES) {
    const entries = await getAllEntries();
    const oldest = entries[entries.length - 1];
    if (oldest) {
      await deleteEntry(oldest.id);
    }
  }
}

export async function getAllEntries(): Promise<TaskEntry[]> {
  return withStore('readonly', store => store.getAll()).then(entries =>
    entries.sort((a, b) => b.timestamp.localeCompare(a.timestamp))
  );
}

export async function deleteEntry(id: string): Promise<void> {
  await withStore('readwrite', store => store.delete(id));
}

export async function clearAll(): Promise<void> {
  await withStore('readwrite', store => store.clear());
}

export async function getEntryCount(): Promise<number> {
  return withStore('readonly', store => store.count());
}
