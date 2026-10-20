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
let flagDailyToolChanged = false;

// 本地待同步修改的精准脏追踪字典（解决多端并发冲突与误恢复的关键）
const pendingToolEdits = new Map();     // toolId -> toolObject (本地明确新增或编辑的卡片)
const pendingToolDeletions = new Set(); // toolId (本地明确删除的卡片 ID)
const pendingTabEdits = new Map();      // tabId -> tabObject (本地新增或修改的 Tab)
const pendingTabDeletions = new Set();  // tabId (本地明确删除的 Tab ID)

let gKanbanTasks = [
    { id: 'task-1', title: '部署到服务器', status: 'todo', memo: '', createdAt: Date.now() - 3600000 },
    { id: 'task-2', title: '编写使用文档', status: 'in_progress', memo: '19:03:27', createdAt: Date.now() - 7200000 },
    { id: 'task-3', title: '准备katrain', status: 'in_progress', memo: '', createdAt: Date.now() - 5400000 },
    { id: 'task-4', title: '完成每日看板开发', status: 'completed', memo: '', createdAt: Date.now() - 10800000 }
];

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
                    pendingToolEdits.clear();
                    pendingToolDeletions.clear();
                    pendingTabEdits.clear();
                    pendingTabDeletions.clear();
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
 * 处理从 Firebase 实时推送回来的云端数据快照 (WebSocket on('value'))
 * 关键规则：
 * 1. 当本机无任何未同步修改（闲置浏览机器）时，云端即权威真理，直接应用云端全量数据，绝不向云端回写旧数据！
 * 2. 只有当本机确实存在明确未完成同步的增/删/改时，才以云端为底本叠加本地改动，彻底杜绝已删除卡片死灰复燃。
 */
async function handleRemoteDataUpdate(jsonPortal) {
    if (!jsonPortal) return;

    const hasPendingChanges = flagDailyToolChanged || 
                              pendingToolEdits.size > 0 || 
                              pendingToolDeletions.size > 0 || 
                              pendingTabEdits.size > 0 || 
                              pendingTabDeletions.size > 0;

    // 场景 A：本机没有未完成的本地修改（例如在另一台电脑上只是运行 app，或者已完成同步）
    // 此时直接以云端数据为准，严禁任何形式的本地反向推送！
    if (!hasPendingChanges) {
        gDialyTools = sanitizeArray(jsonPortal.jsonMustHave);
        gAppShutterTabs = sanitizeArray(jsonPortal.appShutterTabs);
        ensureDefaultAppShutterTabs();

        if (jsonPortal.kanbanTasks) {
            gKanbanTasks = sanitizeArray(jsonPortal.kanbanTasks);
        }

        // 仅在本地持久化以备离线秒开，绝不回写云端
        if (window.dbStorage) {
            await window.dbStorage.saveLocalAppState({
                jsonMustHave: gDialyTools,
                appShutterTabs: gAppShutterTabs,
                kanbanTasks: gKanbanTasks
            });
        }

        updateSaveIconStatus('SYNCED');
        window.dispatchEvent(new CustomEvent('appDataUpdated'));
        return;
    }

    // 场景 B：本机恰好处于离线编辑中或有待同步修改，以云端数据为底本做精准冲突合并
    console.log("检测到本地存在待同步的修改，基于云端做精确增量叠加...");

    const remoteTools = sanitizeArray(jsonPortal.jsonMustHave);
    const toolMap = new Map();

    // 1. 载入云端卡片，但跳过本机用户明确主动删除了的卡片
    remoteTools.forEach(tool => {
        if (tool && tool.id) {
            if (!pendingToolDeletions.has(tool.id)) {
                toolMap.set(tool.id, tool);
            }
        }
    });

    // 2. 叠加本机用户明确新增或更新的卡片
    pendingToolEdits.forEach((localTool, toolId) => {
        const remoteTool = toolMap.get(toolId);
        if (remoteTool) {
            const localTime = localTool.updatedAt || 0;
            const remoteTime = remoteTool.updatedAt || 0;
            if (localTime >= remoteTime) {
                toolMap.set(toolId, localTool);
            }
        } else {
            toolMap.set(toolId, localTool);
        }
    });

    gDialyTools = Array.from(toolMap.values());

    // 3. 合并 Tab 分类
    const remoteTabs = sanitizeArray(jsonPortal.appShutterTabs);
    const tabMap = new Map();
    remoteTabs.forEach(t => {
        if (t && t.id && !pendingTabDeletions.has(t.id)) {
            tabMap.set(t.id, t);
        }
    });
    pendingTabEdits.forEach((localTab, tabId) => {
        tabMap.set(tabId, localTab);
    });
    gAppShutterTabs = Array.from(tabMap.values());
    ensureDefaultAppShutterTabs();

    if (jsonPortal.kanbanTasks) {
        gKanbanTasks = sanitizeArray(jsonPortal.kanbanTasks);
    }

    // 保存合并后的最新状态并推送到云端
    if (window.dbStorage) {
        await window.dbStorage.saveLocalAppState({
            jsonMustHave: gDialyTools,
            appShutterTabs: gAppShutterTabs,
            kanbanTasks: gKanbanTasks
        });
    }

    persistLocalAndSync();
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
        createdAt: Date.now(),
        updatedAt: Date.now()
    };
    pendingTabDeletions.delete(newTab.id);
    pendingTabEdits.set(newTab.id, newTab);

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
        pendingTabEdits.delete(tabId);
        pendingTabDeletions.add(tabId);

        gAppShutterTabs.splice(index, 1);
        if (gDialyTools) {
            gDialyTools.forEach(tool => {
                if (tool.tabId === tabId) {
                    tool.tabId = 'default';
                    tool.updatedAt = Date.now();
                    pendingToolEdits.set(tool.id, tool);
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
    gAppShutterTabs.forEach(t => {
        t.updatedAt = Date.now();
        pendingTabEdits.set(t.id, t);
    });
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
        createdAt: Date.now(),
        updatedAt: Date.now()
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

    // 2. 优先从 IndexedDB 读取本地数据以秒开页面
    let localData = null;
    try {
        if (window.dbStorage) {
            localData = await window.dbStorage.getLocalAppState();
        }
    } catch (e) {
        console.warn("读取本地 IndexedDB 失败，降级拉取远端:", e);
    }

    if (localData) {
        console.log("🚀 [Local-First] 从本地 IndexedDB 成功加载缓存:", localData);
        gDialyTools = localData.jsonMustHave || [];
        gAppShutterTabs = localData.appShutterTabs || [];
        ensureDefaultAppShutterTabs();
        if (localData.kanbanTasks) {
            gKanbanTasks = localData.kanbanTasks;
        }

        // 初始化加载时，尚未有任何本地待提交变更
        flagDailyToolChanged = false;
        pendingToolEdits.clear();
        pendingToolDeletions.clear();
        pendingTabEdits.clear();
        pendingTabDeletions.clear();
        updateSaveIconStatus('SYNCED');
    }

    // 3. 如果本地完全没有缓存数据，同步从 Firebase 拉取初始数据
    if (!localData && database) {
        console.log("☁️ 首次运行，本地无缓存，从 Firebase 获取初始数据...");
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
        // 本地已有缓存，通知 Worker 在后台拉取最新远端数据（并通过 WebSocket 持续监听）
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

    if (!jsonTool.id) jsonTool.id = crypto.randomUUID();
    jsonTool.updatedAt = Date.now();
    if (!jsonTool.data) {
        jsonTool.data = {
            url: jsonTool.url || '',
            memo: jsonTool.memo || ''
        };
    }

    pendingToolDeletions.delete(jsonTool.id);
    pendingToolEdits.set(jsonTool.id, jsonTool);

    gDialyTools.push(jsonTool);
    flagDailyToolChanged = true;
    persistLocalAndSync();
    return true;
}

/**
 * 更新应用信息
 */
function updateDailyTool(toolID, updateFields) {
    const tool = gDialyTools.find(t => t.id === toolID);
    if (!tool) return false;

    if (updateFields.title !== undefined) tool.title = updateFields.title;
    if (!tool.data) tool.data = {};
    if (updateFields.url !== undefined) tool.data.url = updateFields.url;
    if (updateFields.memo !== undefined) tool.data.memo = updateFields.memo;
    if (updateFields.tabId !== undefined) tool.tabId = updateFields.tabId;
    tool.updatedAt = Date.now();

    pendingToolDeletions.delete(tool.id);
    pendingToolEdits.set(tool.id, tool);

    flagDailyToolChanged = true;
    persistLocalAndSync();
    return true;
}

/**
 * 从导航桌面移除应用
 */
function removeDailyTool(toolID) {
    if (!toolID) return false;

    pendingToolEdits.delete(toolID);
    pendingToolDeletions.add(toolID);

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