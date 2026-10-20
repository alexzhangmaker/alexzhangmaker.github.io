// Sentry · 应用导航桌面 数据服务与多端同步中心 (本地优先架构 Local-First)
let gDialyTools = [];
let gAppShutterTabs = [
    { id: 'workbench', name: '⚡ 智能工作台', isFixed: true },
    { id: 'default', name: '常用应用', isFixed: true }
];
let currentActiveAppTabId = 'workbench';
try {
    const savedTab = localStorage.getItem('currentActiveAppTabId');
    if (savedTab) currentActiveAppTabId = savedTab;
} catch (e) {}

let currentSyncId = 0;
const recentDeletedToolIds = new Set();
let gKanbanTasks = [
    { id: 'task-1', title: '部署到服务器', status: 'todo', memo: '', createdAt: Date.now() - 3600000 },
    { id: 'task-2', title: '编写使用文档', status: 'in_progress', memo: '19:03:27', createdAt: Date.now() - 7200000 },
    { id: 'task-3', title: '准备katrain', status: 'in_progress', memo: '', createdAt: Date.now() - 5400000 },
    { id: 'task-4', title: '完成每日看板开发', status: 'completed', memo: '', createdAt: Date.now() - 10800000 }
];
let flagDailyToolChanged = false;

window.gKanbanTasks = gKanbanTasks;

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
const color2Save = "#4f46e5";
const colorSaved = "#4b5563";

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
                // 仅当完成的同步版本号不小于当前最新修改版本时，才清除 dirty 标记
                if (!msg.syncId || msg.syncId >= currentSyncId) {
                    flagDailyToolChanged = false;
                    updateSaveIconStatus('SYNCED');
                }
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

    const path = svgElement.querySelector('path') || svgElement;
    if (status === 'SYNCED') {
        path.setAttribute('fill', colorSaved);
        svgElement.setAttribute('title', '数据已同步到本地与云端');
    } else if (status === 'SYNCING') {
        path.setAttribute('fill', color2Save);
        svgElement.setAttribute('title', '后台正在同步到云端...');
    } else if (status === 'ERROR') {
        path.setAttribute('fill', '#EF4444');
        svgElement.setAttribute('title', '网络波动，已保存在本地并自动重试');
    }
}

/**
 * 本地数据持久化并触发 Worker 后台同步
 */
async function persistLocalAndSync(flags = {}) {
    currentSyncId++;
    const thisSyncId = currentSyncId;

    const dataPackage = {
        syncId: thisSyncId,
        jsonMustHave: gDialyTools,
        appShutterTabs: gAppShutterTabs,
        kanbanTasks: gKanbanTasks
    };

    // 1. 立即持久化到本地 IndexedDB
    if (window.dbStorage) {
        try {
            await window.dbStorage.saveLocalAppState(dataPackage);
        } catch (e) {
            console.error("IndexedDB 保存失败:", e);
        }
    }

    // 2. 更新同步指示灯并通知 Worker
    if (syncWorker) {
        updateSaveIconStatus('SYNCING');
        syncWorker.postMessage({
            type: 'SYNC_PENDING',
            data: {
                ...dataPackage,
                flags: {
                    flagDailyToolChanged,
                    ...flags
                }
            }
        });
    } else {
        updateSaveIconStatus('SYNCED');
    }
}

function ensureDefaultAppShutterTabs() {
    if (!gAppShutterTabs || !Array.isArray(gAppShutterTabs) || gAppShutterTabs.length === 0) {
        gAppShutterTabs = [
            { id: 'workbench', name: '⚡ 智能工作台', isFixed: true },
            { id: 'default', name: '常用应用', isFixed: true }
        ];
        return;
    }
    // 确保 'workbench' 标签存在并置于最前
    if (!gAppShutterTabs.some(t => t.id === 'workbench')) {
        gAppShutterTabs.unshift({ id: 'workbench', name: '⚡ 智能工作台', isFixed: true });
    } else {
        const wbTab = gAppShutterTabs.find(t => t.id === 'workbench');
        if (wbTab) {
            wbTab.name = '⚡ 智能工作台';
            wbTab.isFixed = true;
        }
    }
    // 确保 'default' 标签存在
    if (!gAppShutterTabs.some(t => t.id === 'default')) {
        gAppShutterTabs.push({ id: 'default', name: '常用应用', isFixed: true });
    } else {
        const defTab = gAppShutterTabs.find(t => t.id === 'default');
        if (defTab) {
            defTab.name = '常用应用';
            defTab.isFixed = true;
        }
    }
}

function sanitizeArray(val) {
    if (!val) return [];
    if (Array.isArray(val)) return val;
    if (typeof val === 'object') return Object.values(val);
    return [];
}

/**
 * 智能增量合并本地与云端应用卡片，以卡片唯一 ID 和 updatedAt 时间戳为准，防止云端滞后快照覆盖本地刚添加的卡片
 */
function mergeDailyTools(localTools, remoteTools) {
    const localArr = sanitizeArray(localTools);
    const remoteArr = sanitizeArray(remoteTools);

    const toolMap = new Map();

    // 1. 将远端数据放入 map
    remoteArr.forEach(tool => {
        if (tool && tool.id) {
            if (recentDeletedToolIds.has(tool.id)) return;
            toolMap.set(tool.id, tool);
        }
    });

    let hasLocalExclusive = false;

    // 2. 将本地卡片与远端比对
    localArr.forEach(localTool => {
        if (!localTool || !localTool.id) return;
        if (recentDeletedToolIds.has(localTool.id)) return;

        const remoteTool = toolMap.get(localTool.id);
        if (remoteTool) {
            const localTime = localTool.updatedAt || 0;
            const remoteTime = remoteTool.updatedAt || 0;
            if (localTime >= remoteTime) {
                toolMap.set(localTool.id, localTool);
            }
        } else {
            toolMap.set(localTool.id, localTool);
            hasLocalExclusive = true;
        }
    });

    return {
        merged: Array.from(toolMap.values()),
        hasLocalExclusive
    };
}

/**
 * 智能增量合并本地与云端 Tab 分类
 */
function mergeAppTabs(localTabs, remoteTabs) {
    const localArr = sanitizeArray(localTabs);
    const remoteArr = sanitizeArray(remoteTabs);

    const tabMap = new Map();
    remoteArr.forEach(t => { if (t && t.id) tabMap.set(t.id, t); });
    localArr.forEach(t => {
        if (t && t.id && !tabMap.has(t.id)) {
            tabMap.set(t.id, t);
        }
    });
    return Array.from(tabMap.values());
}

async function handleRemoteDataUpdate(jsonPortal) {
    if (!jsonPortal) return;

    // 如果本地有未同步的修改，优先保留本地修改
    if (flagDailyToolChanged) {
        console.log("本地存在未同步修改，跳过远端覆盖");
        return;
    }

    // 执行智能合并
    const { merged: mergedTools, hasLocalExclusive } = mergeDailyTools(gDialyTools, jsonPortal.jsonMustHave);
    gDialyTools = mergedTools;

    gAppShutterTabs = mergeAppTabs(gAppShutterTabs, jsonPortal.appShutterTabs);
    ensureDefaultAppShutterTabs();

    if (jsonPortal.kanbanTasks) {
        gKanbanTasks = sanitizeArray(jsonPortal.kanbanTasks);
    }

    // 保存到 IndexedDB
    if (window.dbStorage) {
        await window.dbStorage.saveLocalAppState({
            jsonMustHave: gDialyTools,
            appShutterTabs: gAppShutterTabs,
            kanbanTasks: gKanbanTasks
        });
    }

    // 如果发现本地有远端缺失的新增卡片，立即主动补发同步到云端
    if (hasLocalExclusive) {
        console.log("检测到本地存在云端未收录的新增卡片，触发增量补发同步...");
        flagDailyToolChanged = true;
        persistLocalAndSync();
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
        alert('Tab 分类名称已存在');
        return null;
    }
    const newTab = {
        id: crypto.randomUUID(),
        name: name,
        createdAt: Date.now()
    };
    gAppShutterTabs.push(newTab);
    currentActiveAppTabId = newTab.id;
    try {
        localStorage.setItem('currentActiveAppTabId', newTab.id);
    } catch (e) {}
    flagDailyToolChanged = true;
    persistLocalAndSync();
    return newTab;
}

function removeAppShutterTab(tabId) {
    const tabObj = gAppShutterTabs.find(t => t.id === tabId);
    if (tabId === 'default' || tabId === 'workbench' || tabId === 'kanban' || (tabObj && tabObj.isFixed)) {
        alert('系统默认 Tab 无法删除');
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
        currentActiveAppTabId = 'workbench';
        try {
            localStorage.setItem('currentActiveAppTabId', 'workbench');
        } catch (e) {}
        flagDailyToolChanged = true;
        persistLocalAndSync();
        return true;
    }
    return false;
}

function reorderAppShutterTabs(newTabsArray) {
    if (!newTabsArray || !Array.isArray(newTabsArray)) return;
    gAppShutterTabs = newTabsArray;
    flagDailyToolChanged = true;
    persistLocalAndSync();
}

/**
 * 看板任务管理方法
 */
function addKanbanTask(title, status = 'todo') {
    if (!title || !title.trim()) return null;
    const task = {
        id: 'task-' + crypto.randomUUID(),
        title: title.trim(),
        status: status,
        memo: '',
        createdAt: Date.now()
    };
    gKanbanTasks.push(task);
    flagDailyToolChanged = true;
    persistLocalAndSync();
    return task;
}

function deleteKanbanTask(taskId) {
    const index = gKanbanTasks.findIndex(t => t.id === taskId);
    if (index !== -1) {
        gKanbanTasks.splice(index, 1);
        flagDailyToolChanged = true;
        persistLocalAndSync();
        return true;
    }
    return false;
}

function updateKanbanTaskStatus(taskId, newStatus) {
    const task = gKanbanTasks.find(t => t.id === taskId);
    if (task) {
        task.status = newStatus;
        task.updatedAt = Date.now();
        flagDailyToolChanged = true;
        persistLocalAndSync();
        return true;
    }
    return false;
}

function updateKanbanTaskMemo(taskId, memoText) {
    const task = gKanbanTasks.find(t => t.id === taskId);
    if (task) {
        task.memo = memoText;
        task.updatedAt = Date.now();
        flagDailyToolChanged = true;
        persistLocalAndSync();
        return true;
    }
    return false;
}

/**
 * 本地优先的加载数据入口
 */
async function asyncLoadAppData() {
    // 1. 初始化 Worker
    initSyncWorker();

    // 2. 优先从 IndexedDB 读取本地数据
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
        gDialyTools = localData.jsonMustHave || [];
        gAppShutterTabs = localData.appShutterTabs || [];
        ensureDefaultAppShutterTabs();
        if (localData.kanbanTasks) {
            gKanbanTasks = localData.kanbanTasks;
        }
        flagDailyToolChanged = false;
        updateSaveIconStatus('SYNCED');
    }

    // 3. 如果本地没有缓存数据，从 Firebase 拉取
    if (!localData && database) {
        console.log("☁️ 首次运行，本地无缓存，从 Firebase 获取数据...");
        try {
            const snapshot = await database.ref('Portal').once('value');
            const jsonPortal = snapshot.val();
            if (jsonPortal) {
                gDialyTools = jsonPortal.jsonMustHave || [];
                gAppShutterTabs = jsonPortal.appShutterTabs || [];
                ensureDefaultAppShutterTabs();
                if (jsonPortal.kanbanTasks) {
                    gKanbanTasks = jsonPortal.kanbanTasks;
                }

                if (window.dbStorage) {
                    await window.dbStorage.saveLocalAppState({
                        jsonMustHave: gDialyTools,
                        appShutterTabs: gAppShutterTabs,
                        kanbanTasks: gKanbanTasks
                    });
                }
                updateSaveIconStatus('SYNCED');
            }
        } catch (err) {
            console.error("加载 Firebase 初始数据失败:", err);
        }
    } else {
        // 本地已有数据，通知 Worker 在后台拉取最新远端数据进行对比
        if (syncWorker) {
            syncWorker.postMessage({ type: 'FETCH_REMOTE' });
        }
    }
}

/**
 * 手动保存并同步数据
 */
async function asyncSaveAppData() {
    flagDailyToolChanged = true;
    await persistLocalAndSync({ forceAll: true });
}

function normalizeUrl(url) {
    if (!url) return '';
    let str = url.trim().toLowerCase();
    str = str.replace(/^https?:\/\//, '');
    str = str.replace(/\/+$/, '');
    return str;
}

/**
 * 添加应用到导航桌面
 */
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

    if (jsonTool.id && recentDeletedToolIds.has(jsonTool.id)) {
        recentDeletedToolIds.delete(jsonTool.id);
    }
    if (!jsonTool.updatedAt) jsonTool.updatedAt = Date.now();
    gDialyTools.push(jsonTool);
    flagDailyToolChanged = true;
    persistLocalAndSync();
    return true;
}

/**
 * 从导航桌面移除应用
 */
function removeDailyTool(toolID) {
    if (toolID) recentDeletedToolIds.add(toolID);
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