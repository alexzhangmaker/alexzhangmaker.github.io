/**
 * Web Worker for background data synchronization between Local-First IndexedDB and Server (Firebase).
 * Supports Real-time WebSocket Listening (`on('value')`) for multi-device instant sync.
 */

// Import Firebase JS SDK in Worker context
try {
    importScripts("https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js");
    importScripts("https://www.gstatic.com/firebasejs/8.10.1/firebase-database.js");
} catch (err) {
    console.error("Worker failed to import Firebase scripts:", err);
}

let firebaseApp = null;
let database = null;
let isSyncing = false;
let isListening = false;

// Handle messages from main thread
self.onmessage = async function(e) {
    const msg = e.data;
    if (!msg || !msg.type) return;

    switch (msg.type) {
        case 'INIT_CONFIG':
            initFirebase(msg.config);
            break;

        case 'FETCH_REMOTE':
            await fetchRemoteData();
            break;

        case 'SYNC_PENDING':
            await syncPendingData(msg.data);
            break;

        default:
            console.warn("Unknown message type in Worker:", msg.type);
    }
};

function initFirebase(config) {
    if (!firebase.apps.length) {
        firebaseApp = firebase.initializeApp(config);
    } else {
        firebaseApp = firebase.app();
    }
    database = firebase.database();
    postStatus('READY', 'Firebase initialized in worker');

    // 开启长连接 WebSocket 实时订阅，秒级感知其他端（如节点A）的修改
    startRealtimeListener();
}

function startRealtimeListener() {
    if (!database || isListening) return;
    isListening = true;

    database.ref('Portal').on('value', (snapshot) => {
        const jsonPortal = snapshot.val();
        if (jsonPortal) {
            self.postMessage({
                type: 'REMOTE_DATA',
                data: jsonPortal,
                timestamp: Date.now()
            });
            if (!isSyncing) {
                postStatus('SYNCED', '已通过 WebSocket 收到远端实时数据更新');
            }
        }
    }, (err) => {
        console.error("Worker 实时订阅异常:", err);
        postStatus('ERROR', '实时订阅失败: ' + err.message);
    });
}

async function fetchRemoteData() {
    if (!database) {
        postStatus('ERROR', 'Firebase not initialized in worker');
        return;
    }

    postStatus('SYNCING', 'Fetching remote data from server...');

    try {
        const snapshot = await database.ref('Portal').once('value');
        const jsonPortal = snapshot.val();

        if (jsonPortal) {
            self.postMessage({
                type: 'REMOTE_DATA',
                data: jsonPortal,
                timestamp: Date.now()
            });
            postStatus('SYNCED', 'Remote data fetched successfully');
        } else {
            postStatus('SYNCED', 'No remote data found');
        }
    } catch (err) {
        console.error("Worker error fetching remote data:", err);
        postStatus('ERROR', 'Failed to fetch remote data: ' + err.message);
    }
}

async function syncPendingData(dataPackage) {
    if (!database) {
        postStatus('ERROR', 'Firebase not initialized in worker');
        return;
    }

    if (isSyncing) {
        return; // Prevent concurrent sync loops
    }

    isSyncing = true;
    postStatus('SYNCING', 'Syncing local changes to server...');

    try {
        const { jsonFolders, jsonMustHave, Bookmarks, flags } = dataPackage;

        const promises = [];

        // Save only modified paths or full Portal
        if (!flags || flags.flagBookmarksChanged || flags.forceAll) {
            if (Bookmarks !== undefined) {
                promises.push(database.ref('Portal/Bookmarks').set(Bookmarks));
            }
        }
        if (!flags || flags.flagDailyToolChanged || flags.forceAll) {
            if (jsonMustHave !== undefined) {
                promises.push(database.ref('Portal/jsonMustHave').set(jsonMustHave));
            }
        }
        if (!flags || flags.flagFolderChanged || flags.forceAll) {
            if (jsonFolders !== undefined) {
                promises.push(database.ref('Portal/jsonFolders').set(jsonFolders));
            }
        }

        if (promises.length > 0) {
            await Promise.all(promises);
        }

        isSyncing = false;
        postStatus('SYNCED', 'All changes synced to server');
        self.postMessage({
            type: 'SYNC_COMPLETE',
            timestamp: Date.now()
        });

    } catch (err) {
        isSyncing = false;
        console.error("Worker sync failed:", err);
        postStatus('ERROR', 'Server sync failed: ' + err.message);
    }
}

function postStatus(status, message = '') {
    self.postMessage({
        type: 'SYNC_STATUS',
        status: status, // 'READY' | 'SYNCING' | 'SYNCED' | 'ERROR' | 'OFFLINE'
        message: message,
        timestamp: Date.now()
    });
}
