/**
 * Sentry.Anywhere IndexedDB Storage Module
 * Manages local database storage for Offline/Local-First functionality.
 */

const DB_NAME = 'SentryAnywhereDB';
const DB_VERSION = 1;
const STORE_APP_STATE = 'app_state';
const STORE_SYNC_QUEUE = 'sync_queue';

let dbInstance = null;

/**
 * Open and initialize the IndexedDB database.
 */
function openDB() {
    return new Promise((resolve, reject) => {
        if (dbInstance) {
            return resolve(dbInstance);
        }

        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            
            // Store for full app state (jsonFolders, jsonMustHave, Bookmarks)
            if (!db.objectStoreNames.contains(STORE_APP_STATE)) {
                db.createObjectStore(STORE_APP_STATE, { keyPath: 'key' });
            }

            // Store for sync operation queue
            if (!db.objectStoreNames.contains(STORE_SYNC_QUEUE)) {
                db.createObjectStore(STORE_SYNC_QUEUE, { keyPath: 'id', autoIncrement: true });
            }
        };

        request.onsuccess = (event) => {
            dbInstance = event.target.result;
            resolve(dbInstance);
        };

        request.onerror = (event) => {
            console.error('Failed to open IndexedDB:', event.target.error);
            reject(event.target.error);
        };
    });
}

/**
 * Get stored app state from IndexedDB.
 */
async function getLocalAppState() {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_APP_STATE, 'readonly');
        const store = tx.objectStore(STORE_APP_STATE);
        const req = store.get('portal');

        req.onsuccess = () => {
            resolve(req.result ? req.result.data : null);
        };
        req.onerror = (e) => reject(e.target.error);
    });
}

/**
 * Save current app state to IndexedDB.
 */
async function saveLocalAppState(data) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_APP_STATE, 'readwrite');
        const store = tx.objectStore(STORE_APP_STATE);
        const record = {
            key: 'portal',
            data: data,
            updatedAt: Date.now()
        };
        const req = store.put(record);

        req.onsuccess = () => resolve(true);
        req.onerror = (e) => reject(e.target.error);
    });
}

/**
 * Add a pending change task to sync_queue.
 */
async function enqueueSyncTask(task) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_SYNC_QUEUE, 'readwrite');
        const store = tx.objectStore(STORE_SYNC_QUEUE);
        const record = {
            ...task,
            timestamp: Date.now(),
            status: 'pending'
        };
        const req = store.add(record);

        req.onsuccess = () => resolve(req.result);
        req.onerror = (e) => reject(e.target.error);
    });
}

/**
 * Get all pending sync tasks.
 */
async function getPendingSyncTasks() {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_SYNC_QUEUE, 'readonly');
        const store = tx.objectStore(STORE_SYNC_QUEUE);
        const req = store.getAll();

        req.onsuccess = () => {
            const pending = (req.result || []).filter(t => t.status === 'pending');
            resolve(pending);
        };
        req.onerror = (e) => reject(e.target.error);
    });
}

/**
 * Clear all pending sync tasks from queue.
 */
async function clearPendingSyncTasks() {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_SYNC_QUEUE, 'readwrite');
        const store = tx.objectStore(STORE_SYNC_QUEUE);
        const req = store.clear();

        req.onsuccess = () => resolve(true);
        req.onerror = (e) => reject(e.target.error);
    });
}

// Export for global window scope
if (typeof window !== 'undefined') {
    window.dbStorage = {
        openDB,
        getLocalAppState,
        saveLocalAppState,
        enqueueSyncTask,
        getPendingSyncTasks,
        clearPendingSyncTasks
    };
}
