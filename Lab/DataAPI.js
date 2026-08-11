// 模拟从Firebase及IndexedDB获取的数据（本地优先架构）
let gFolderTree = [];
let gDialyTools = [];
let gBookmarks = [];
let gAppShutterTabs = [{ id: 'default', name: '常用' }];
let currentActiveAppTabId = 'default';
let flagFolderChanged = false;
let flagBookmarksChanged = false;
let flagDailyToolChanged = false;

// Firebase配置
const firebaseConfig = {
    apiKey: "AIzaSyA6MZ_p5lVuy8TMAqiuV6IRx9fggV44lQs",
    authDomain: "outpost-8d74e.firebaseapp.com",
    databaseURL: "https://outpost-8d74e.asia-southeast1.firebasedatabase.app/",
    projectId: "outpost-8d74e",
    storageBucket: "outpost-8d74e.firebasestorage.app",
    messagingSenderId: "724993324937",
    appId: "1:724993324937:web:ce6c7e6b06489331c79358",
    measurementId: "G-QPHWRTH6BH"
};

const gPortalPath = "Portal";
const color2Save = "#0000FF";
const colorSaved = "#FFFFFF";

// 初始化Firebase（主线程备用）
if (typeof firebase !== 'undefined' && firebase.apps && !firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const database = typeof firebase !== 'undefined' && firebase.database ? firebase.database() : null;

// Background Web Worker 实例
let syncWorker = null;

function initSyncWorker() {
    if (syncWorker || typeof Worker === 'undefined') return;

    try {
        syncWorker = new Worker('./js/syncWorker.js');

        // 发送 Firebase 配置给 Worker
        syncWorker.postMessage({
            type: 'INIT_CONFIG',
            config: firebaseConfig
        });

        // 监听 Worker 的状态和数据变动消息
        syncWorker.onmessage = async (e) => {
            const msg = e.data;
            if (!msg || !msg.type) return;

            if (msg.type === 'SYNC_STATUS') {
                updateSaveIconStatus(msg.status);
            } else if (msg.type === 'SYNC_COMPLETE') {
                flagFolderChanged = false;
                flagBookmarksChanged = false;
                flagDailyToolChanged = false;
                updateSaveIconStatus('SYNCED');
            } else if (msg.type === 'REMOTE_DATA') {
                await handleRemoteDataUpdate(msg.data);
            }
        };

        // 网络恢复在线时触发 Worker 同步
        window.addEventListener('online', () => {
            console.log("网络恢复在线，触发 Worker 后台同步...");
            persistLocalAndSync({ forceAll: true });
        });

    } catch (err) {
        console.warn("无法启动 Web Worker:", err);
    }
}

function updateSaveIconStatus(status) {
    const svgElement = document.querySelector('#idBTNSaveChange');
    if (!svgElement) return;

    if (status === 'SYNCED') {
        svgElement.setAttribute('fill', colorSaved);
        svgElement.setAttribute('title', '数据已完美同步到本地与云端');
    } else if (status === 'SYNCING') {
        svgElement.setAttribute('fill', color2Save);
        svgElement.setAttribute('title', '后台 Worker 正在同步到云端...');
    } else if (status === 'ERROR') {
        svgElement.setAttribute('fill', '#EF476F');
        svgElement.setAttribute('title', '同步遇到网络波动，保存在本地并自动重试');
    }
}

/**
 * 本地数据持久化并触发 Worker 后台同步
 */
/**
 * 本地数据持久化并触发 Worker 后台同步
 */
async function persistLocalAndSync(flags = {}) {
    const dataPackage = {
        jsonFolders: gFolderTree,
        jsonMustHave: gDialyTools,
        Bookmarks: gBookmarks,
        appShutterTabs: gAppShutterTabs
    };

    // 1. 立即持久化到本地 IndexedDB
    if (window.dbStorage) {
        try {
            await window.dbStorage.saveLocalAppState(dataPackage);
        } catch (e) {
            console.error("IndexedDB 保存失败:", e);
        }
    }

    // 2. 更新同步指示指示灯
    updateSaveIconStatus('SYNCING');

    // 3. 驱动 Web Worker 后台异步推送到服务器
    if (syncWorker) {
        syncWorker.postMessage({
            type: 'SYNC_PENDING',
            data: {
                ...dataPackage,
                flags: {
                    flagFolderChanged,
                    flagDailyToolChanged,
                    flagBookmarksChanged,
                    ...flags
                }
            }
        });
    } else if (database) {
        // Fallback: 如果不支持 Worker，走异步 set
        asyncSaveAppDataFallback();
    }
}

async function handleRemoteDataUpdate(jsonPortal) {
    if (!jsonPortal) return;

    // 如果本地有未同步的修改，优先保留本地修改
    if (flagFolderChanged || flagBookmarksChanged || flagDailyToolChanged) {
        console.log("本地存在未同步修改，跳过远端覆盖");
        return;
    }

    gFolderTree = jsonPortal.jsonFolders || [];
    gDialyTools = jsonPortal.jsonMustHave || [];
    gBookmarks = jsonPortal.Bookmarks || [];
    gAppShutterTabs = jsonPortal.appShutterTabs || [{ id: 'default', name: '常用' }];

    // 保存到 IndexedDB
    if (window.dbStorage) {
        await window.dbStorage.saveLocalAppState({
            jsonFolders: gFolderTree,
            jsonMustHave: gDialyTools,
            Bookmarks: gBookmarks,
            appShutterTabs: gAppShutterTabs
        });
    }

    // 触发自定义事件通知 UI 刷新
    window.dispatchEvent(new CustomEvent('appDataUpdated'));
}

/**
 * 应用快门 Tab 管理方法
 */
function plusAppShutterTab(tabName) {
    if (!tabName || !tabName.trim()) return null;
    const name = tabName.trim();
    const exists = gAppShutterTabs.some(t => t.name === name);
    if (exists) {
        alert('Tab 名称已存在');
        return null;
    }
    const newTab = {
        id: crypto.randomUUID(),
        name: name,
        createdAt: Date.now()
    };
    gAppShutterTabs.push(newTab);
    currentActiveAppTabId = newTab.id;
    flagDailyToolChanged = true;
    persistLocalAndSync();
    return newTab;
}

function removeAppShutterTab(tabId) {
    if (tabId === 'default') {
        alert('默认 Tab 无法删除');
        return false;
    }
    const index = gAppShutterTabs.findIndex(t => t.id === tabId);
    if (index !== -1) {
        gAppShutterTabs.splice(index, 1);
        if (gDialyTools) {
            gDialyTools.forEach(tool => {
                if (tool.tabId === tabId) {
                    tool.tabId = 'default';
                }
            });
        }
        currentActiveAppTabId = 'default';
        flagDailyToolChanged = true;
        persistLocalAndSync();
        return true;
    }
    return false;
}

/**
 * 结构转换辅助函数
 */
function _transformPortal(portalEntries) {
    if (!portalEntries) return portalEntries;
    for (let i = 0; i < portalEntries.length; i++) {
        let jsonNode = portalEntries[i];
        if (jsonNode.type == "Gateway.Folder") {
            if (jsonNode.hasOwnProperty("Contents")) {
                _transformPortal(jsonNode.Contents);
                jsonNode.children = jsonNode.Contents;
                delete jsonNode.Contents;
            }
            jsonNode.type = "folder";
            jsonNode.name = jsonNode.title;
            delete jsonNode.title;
        }
    }
    return portalEntries;
}

/**
 * 本地优先的加载数据入口
 */
async function asyncLoadAppData() {
    // 1. 初始化 Worker
    initSyncWorker();

    // 2. 优先从 IndexedDB 读取本地数据 (实现 0 延迟秒开)
    let localData = null;
    try {
        if (window.dbStorage) {
            localData = await window.dbStorage.getLocalAppState();
        }
    } catch (e) {
        console.warn("读取本地 IndexedDB 失败，降级拉取远端:", e);
    }

    if (localData) {
        console.log("🚀 [Local-First] 从本地 IndexedDB 加载数据成功:", localData);
        gFolderTree = localData.jsonFolders || [];
        gDialyTools = localData.jsonMustHave || [];
        gBookmarks = localData.Bookmarks || [];
        gAppShutterTabs = localData.appShutterTabs || [{ id: 'default', name: '常用' }];
        flagFolderChanged = false;
        flagBookmarksChanged = false;
        flagDailyToolChanged = false;
        updateSaveIconStatus('SYNCED');
    }

    // 3. 如果本地没有缓存数据，同步从 Firebase 拉取
    if (!localData && database) {
        console.log("☁️ 首次运行，本地无缓存，从 Firebase 获取数据...");
        try {
            const snapshot = await database.ref('Portal').once('value');
            const jsonPortal = snapshot.val();
            if (jsonPortal) {
                gFolderTree = jsonPortal.jsonFolders || [];
                gDialyTools = jsonPortal.jsonMustHave || [];
                gBookmarks = jsonPortal.Bookmarks || [];
                gAppShutterTabs = jsonPortal.appShutterTabs || [{ id: 'default', name: '常用' }];

                if (window.dbStorage) {
                    await window.dbStorage.saveLocalAppState({
                        jsonFolders: gFolderTree,
                        jsonMustHave: gDialyTools,
                        Bookmarks: gBookmarks,
                        appShutterTabs: gAppShutterTabs
                    });
                }
                updateSaveIconStatus('SYNCED');
            }
        } catch (err) {
            console.error("加载 Firebase 初始数据失败:", err);
        }
    } else {
        // 本地已有数据，通知 Worker 在后台校验远端最新数据
        if (syncWorker) {
            syncWorker.postMessage({ type: 'FETCH_REMOTE' });
        }
    }
}

/**
 * 保存全量数据
 */
async function asyncSaveAppData() {
    flagFolderChanged = true;
    flagBookmarksChanged = true;
    flagDailyToolChanged = true;
    await persistLocalAndSync({ forceAll: true });
}

async function asyncSaveAppDataFallback() {
    try {
        if (flagBookmarksChanged) {
            await database.ref(`Portal/Bookmarks`).set(gBookmarks);
            flagBookmarksChanged = false;
        }
        if (flagDailyToolChanged) {
            await database.ref(`Portal/jsonMustHave`).set(gDialyTools);
            flagDailyToolChanged = false;
        }
        if (flagFolderChanged) {
            await database.ref(`Portal/jsonFolders`).set(gFolderTree);
            flagFolderChanged = false;
        }
        updateSaveIconStatus('SYNCED');
    } catch (err) {
        console.error("Fallback 保存数据失败:", err);
        updateSaveIconStatus('ERROR');
    }
}

function loadAppData() {
    if (!database) return;
    const PortalRef = database.ref(gPortalPath);
    PortalRef.on('value', (snapshot) => {
        const jsonPortal = snapshot.val();
        if (jsonPortal) {
            _transformPortal(jsonPortal.jsonFolders);
            gFolderTree = jsonPortal.jsonFolders;
        }
    }, (error) => {
        console.error('加载Portal数据失败:', error);
    });
}

function fetchFolderBookmarks(folder) {
    const bookmarks = [];
    if (!gBookmarks) return bookmarks;
    gBookmarks.forEach(jsonBookmark => {
        if (jsonBookmark.folderID == folder.id) bookmarks.push(jsonBookmark);
    });
    return bookmarks;
}

function findObjectsWithSameValue(array, attribute) {
    const groupedByValue = new Map();
    array.forEach(obj => {
        const value = obj[attribute];
        if (value !== undefined) {
            if (!groupedByValue.has(value)) {
                groupedByValue.set(value, []);
            }
            groupedByValue.get(value).push(obj);
        }
    });
    return Array.from(groupedByValue.entries())
        .filter(([_, group]) => group.length > 1)
        .map(([value, objects]) => ({
            attributeValue: value,
            objects: objects
        }));
}

async function removeBookmark(bookmarkID) {
    console.log(`will removeBookmark:${bookmarkID}`);
    for (let i = 0; i < gBookmarks.length; i++) {
        if (gBookmarks[i].id == bookmarkID) {
            gBookmarks.splice(i, 1);
            flagBookmarksChanged = true;
            await persistLocalAndSync();
            return;
        }
    }
}

function normalizeUrl(url) {
    if (!url) return '';
    let str = url.trim().toLowerCase();
    str = str.replace(/^https?:\/\//, '');
    str = str.replace(/\/+$/, '');
    return str;
}

function plusDailyTool(jsonTool) {
    const targetUrl = jsonTool.data ? jsonTool.data.url : jsonTool.url;
    const targetNorm = normalizeUrl(targetUrl);

    if (targetNorm && gDialyTools) {
        const isDuplicate = gDialyTools.some(tool => {
            const toolUrl = tool.data ? tool.data.url : tool.url;
            return normalizeUrl(toolUrl) === targetNorm;
        });

        if (isDuplicate) {
            alert("该应用 URL 已经存在，无法重复添加！");
            return false;
        }
    }

    if (!jsonTool.updatedAt) jsonTool.updatedAt = Date.now();
    gDialyTools.push(jsonTool);
    flagDailyToolChanged = true;
    persistLocalAndSync();
    return true;
}

function removeDailyTool(toolID) {
    for (let i = 0; i < gDialyTools.length; i++) {
        if (gDialyTools[i].id == toolID) {
            gDialyTools.splice(i, 1);
            flagDailyToolChanged = true;
            persistLocalAndSync();
            return true;
        }
    }
    return false;
}

function plusFolderatRoot(jsonFolder) {
    if (!jsonFolder.updatedAt) jsonFolder.updatedAt = Date.now();
    gFolderTree.push(jsonFolder);
    flagFolderChanged = true;
    persistLocalAndSync();
}

function plusFolder2Folder(jsonFolder, selectedNode) {
    if (!selectedNode.children) {
        selectedNode.children = [];
    }
    if (!jsonFolder.updatedAt) jsonFolder.updatedAt = Date.now();
    selectedNode.children.push(jsonFolder);
    flagFolderChanged = true;
    persistLocalAndSync();
}

function removeFolderFromForest(folderID) {
    function _callRemoved() {
        flagFolderChanged = true;
        persistLocalAndSync();
    }

    function _removeFolder(jsonRoot, folderID) {
        if (!jsonRoot.children || jsonRoot.children.length === 0) return false;
        for (let i = 0; i < jsonRoot.children.length; i++) {
            if (jsonRoot.children[i].id == folderID) {
                jsonRoot.children.splice(i, 1);
                return true;
            }
            let bRemoved = _removeFolder(jsonRoot.children[i], folderID);
            if (bRemoved) return true;
        }
        return false;
    }

    for (let i = 0; i < gFolderTree.length; i++) {
        if (gFolderTree[i].id == folderID) {
            if (!gFolderTree[i].children || gFolderTree[i].children.length === 0) {
                gFolderTree.splice(i, 1);
                _callRemoved();
                return true;
            }
            return false;
        }

        let bRemoved = _removeFolder(gFolderTree[i], folderID);
        if (bRemoved) {
            _callRemoved();
            return true;
        }
    }
    return false;
}

function plusBookmark2Folder(jsonBookmark, folderNode) {
    if (!folderNode) {
        alert('something wrong in plusBookmark2Folder');
    } else {
        if (!jsonBookmark.updatedAt) jsonBookmark.updatedAt = Date.now();
        jsonBookmark.folderID = folderNode.id;
        gBookmarks.push(jsonBookmark);
        flagBookmarksChanged = true;
        persistLocalAndSync();
    }
}