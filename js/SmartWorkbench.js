/**
 * SmartWorkbench.js - 12列 x 15行 智能工作台网格引擎
 * 
 * 核心特性：
 * 1. 12列 x 15行 精密数学网格坐标系，自适应列宽与固定行高/间距
 * 2. 自由拖拽与碰撞实时让位 (Auto-Displacement & Reflow)
 * 3. 右下角抓手自由缩放 (Snap to Grid Resizing)
 * 4. 蓝色虚线落位预览框 (Placeholder Preview) 与最近空位智能回弹 (Smart Nearest Placement)
 * 5. LocalStorage 本地持久化与一键推荐布局 / 重置布局
 * 6. 悬停渐显控制按钮与极简视觉设计
 */

class SmartWorkbench {
    constructor(containerId, options = {}) {
        this.container = typeof containerId === 'string' ? document.getElementById(containerId) : containerId;
        this.cols = options.cols || 12;
        this.rows = options.rows || 15;
        this.rowHeight = options.rowHeight || 80;
        this.gap = options.gap || 16;
        this.storageKey = options.storageKey || 'smart_workbench_layout_v2';
        this.showGridLines = options.showGridLines ?? true;

        this.cards = [];
        this.isDragging = false;
        this.isResizing = false;
        this.activeCard = null;
        this.activeCardEl = null;
        this.dragOffset = { x: 0, y: 0 };
        this.placeholder = null;
        this.gridOverlay = null;
        this.resizeObserver = null;
        this.savedBeforeDrag = null;

        // 默认卡片预设元数据
        this.cardDefinitions = [
            {
                id: 'card-kanban',
                title: '今日待办 & 任务看板',
                icon: '📌',
                type: 'widget-kanban',
                defaultPos: { x: 0, y: 0, w: 8, h: 6 },
                minW: 4, minH: 4, maxW: 12, maxH: 15,
                renderContent: (cardBody) => this.renderWidgetCard('widget-kanban', cardBody)
            },
            {
                id: 'card-calendar',
                title: '日历月历',
                icon: '📅',
                type: 'widget-calendar',
                defaultPos: { x: 8, y: 0, w: 4, h: 6 },
                minW: 3, minH: 4, maxW: 12, maxH: 15,
                renderContent: (cardBody) => this.renderWidgetCard('widget-calendar', cardBody)
            },
            {
                id: 'card-weather',
                title: '实时多城天气',
                icon: '🌤️',
                type: 'widget-weather',
                defaultPos: { x: 0, y: 6, w: 4, h: 5 },
                minW: 3, minH: 3, maxW: 12, maxH: 15,
                renderContent: (cardBody) => this.renderWidgetCard('widget-weather', cardBody)
            },
            {
                id: 'card-memo',
                title: '快捷备忘速记',
                icon: '📝',
                type: 'widget-quick-memo',
                defaultPos: { x: 4, y: 6, w: 4, h: 5 },
                minW: 3, minH: 3, maxW: 12, maxH: 15,
                renderContent: (cardBody) => this.renderWidgetCard('widget-quick-memo', cardBody)
            },
            {
                id: 'card-treasury',
                title: '国债收益率与金融',
                icon: '🏦',
                type: 'widget-treasury',
                defaultPos: { x: 8, y: 6, w: 4, h: 5 },
                minW: 3, minH: 3, maxW: 12, maxH: 15,
                renderContent: (cardBody) => this.renderWidgetCard('widget-treasury', cardBody)
            },
            {
                id: 'card-translate',
                title: 'Google 即时翻译',
                icon: '🔤',
                type: 'widget-translate',
                defaultPos: { x: 0, y: 11, w: 6, h: 4 },
                minW: 3, minH: 3, maxW: 12, maxH: 15,
                renderContent: (cardBody) => this.renderWidgetCard('widget-translate', cardBody)
            },
            {
                id: 'card-app-shutter',
                title: '应用快门 & 快捷启动',
                icon: '⚡',
                type: 'app-shutter',
                defaultPos: { x: 6, y: 11, w: 6, h: 4 },
                minW: 3, minH: 3, maxW: 12, maxH: 15,
                renderContent: (cardBody) => this.renderAppShutterCard(cardBody)
            }
        ];

        this.init();
    }

    // 初始化工作台
    init() {
        if (!this.container) {
            console.error("SmartWorkbench: 容器未找到");
            return;
        }

        this.loadLayout();
        this.buildDOMStructure();
        this.renderCards();
        this.setupGlobalEvents();
        this.setupResizeObserver();
    }

    // 从 localStorage 加载布局，若无则使用推荐布局
    loadLayout() {
        try {
            const raw = localStorage.getItem(this.storageKey);
            if (raw) {
                const parsed = JSON.parse(raw);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    this.cards = this.cardDefinitions.map(def => {
                        const saved = parsed.find(p => p.id === def.id);
                        if (saved) {
                            return {
                                ...def,
                                x: Math.max(0, Math.min(this.cols - (saved.w || def.defaultPos.w), saved.x ?? def.defaultPos.x)),
                                y: Math.max(0, Math.min(this.rows - (saved.h || def.defaultPos.h), saved.y ?? def.defaultPos.y)),
                                w: Math.max(def.minW, Math.min(def.maxW, saved.w ?? def.defaultPos.w)),
                                h: Math.max(def.minH, Math.min(def.maxH, saved.h ?? def.defaultPos.h)),
                                enabled: saved.enabled ?? true
                            };
                        } else {
                            return {
                                ...def,
                                x: def.defaultPos.x,
                                y: def.defaultPos.y,
                                w: def.defaultPos.w,
                                h: def.defaultPos.h,
                                enabled: true
                            };
                        }
                    });
                    return;
                }
            }
        } catch (e) {
            console.warn("读取工作台布局失败，恢复默认布局:", e);
        }

        // 默认布局
        this.resetToRecommendedLayout();
    }

    // 保存布局到 localStorage
    saveLayout() {
        try {
            const data = this.cards.map(c => ({
                id: c.id,
                x: c.x,
                y: c.y,
                w: c.w,
                h: c.h,
                enabled: c.enabled
            }));
            localStorage.setItem(this.storageKey, JSON.stringify(data));
            this.showSavedIndicator();
        } catch (e) {
            console.error("保存工作台布局失败:", e);
        }
    }

    // 显示自动保存微提示
    showSavedIndicator() {
        const tag = document.getElementById('idWorkbenchSaveTag');
        if (tag) {
            tag.classList.remove('opacity-0');
            tag.classList.add('opacity-100');
            clearTimeout(this._saveTagTimer);
            this._saveTagTimer = setTimeout(() => {
                tag.classList.remove('opacity-100');
                tag.classList.add('opacity-0');
            }, 1500);
        }
    }

    // 一键推荐布局 (美观、层级分明、严丝合缝)
    resetToRecommendedLayout() {
        this.cards = this.cardDefinitions.map(def => ({
            ...def,
            x: def.defaultPos.x,
            y: def.defaultPos.y,
            w: def.defaultPos.w,
            h: def.defaultPos.h,
            enabled: true
        }));
        this.saveLayout();
        if (this.gridArea) {
            this.renderCards();
        }
    }

    // 重置默认布局
    resetLayout() {
        this.resetToRecommendedLayout();
    }

    // 构建工作台顶部工具栏与主网格 DOM
    buildDOMStructure() {
        this.container.innerHTML = '';
        this.container.className = "smart-workbench-root w-full flex flex-col space-y-4";

        // 顶部工具栏
        const toolbar = document.createElement('div');
        toolbar.className = "workbench-toolbar bg-white rounded-2xl px-5 py-3 shadow-sm border border-gray-100 flex flex-wrap items-center justify-between gap-3";
        toolbar.innerHTML = `
            <div class="flex items-center gap-3">
                <div class="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-500 flex items-center justify-center text-white shadow-md shadow-indigo-100 text-lg">
                    ⚡
                </div>
                <div>
                    <div class="flex items-center gap-2">
                        <h2 class="font-extrabold text-gray-800 text-base tracking-tight">智能工作台</h2>
                        <span class="bg-indigo-50 text-indigo-600 font-bold text-[11px] px-2 py-0.5 rounded-full border border-indigo-100/80">12列 × 15行 网格</span>
                    </div>
                    <p class="text-xs text-gray-400">搭积木桌面 · 自由拖拽 · 智能让位 · 实时缩放</p>
                </div>
            </div>

            <div class="flex items-center gap-2 flex-wrap">
                <span id="idWorkbenchSaveTag" class="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg transition-opacity duration-300 opacity-0 flex items-center gap-1 border border-emerald-100">
                    <i class="fas fa-check-circle"></i> 已存本地
                </span>

                <button id="idBTNToggleGridLines" class="px-3 py-1.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50 hover:text-indigo-600 transition-all flex items-center gap-1.5 shadow-sm" title="开启/关闭 12x15 参考网格线">
                    <i class="fas fa-border-all text-xs"></i> <span>网格线</span>
                </button>

                <button id="idBTNAddWorkbenchCard" class="px-3 py-1.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50 hover:text-indigo-600 transition-all flex items-center gap-1.5 shadow-sm" title="管理/添加卡片模块">
                    <i class="fas fa-plus text-xs"></i> <span>添加卡片</span>
                </button>

                <button id="idBTNRecommendLayout" class="px-3.5 py-1.5 rounded-xl text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-100 transition-all flex items-center gap-1.5 shadow-sm" title="一键排列为推荐的美观有序布局">
                    <i class="fas fa-wand-magic-sparkles text-xs"></i> <span>推荐布局</span>
                </button>

                <button id="idBTNResetLayout" class="px-3 py-1.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-500 hover:bg-red-50 hover:text-red-600 hover:border-red-100 transition-all flex items-center gap-1.5 shadow-sm" title="恢复至初始默认布局">
                    <i class="fas fa-rotate-left text-xs"></i> <span>重置</span>
                </button>
            </div>
        `;
        this.container.appendChild(toolbar);

        // 主网格容器 (网格画板)
        const gridWrapper = document.createElement('div');
        gridWrapper.className = "workbench-grid-wrapper relative w-full overflow-x-auto overflow-y-visible pb-12";

        this.gridArea = document.createElement('div');
        this.gridArea.className = `workbench-grid-canvas relative w-full ${this.showGridLines ? 'show-grid-lines' : ''}`;
        this.gridArea.style.minHeight = `${this.rows * this.rowHeight + (this.rows - 1) * this.gap}px`;

        // 蓝色虚线落位预览占位框
        this.placeholder = document.createElement('div');
        this.placeholder.className = "workbench-placeholder hidden";
        this.placeholder.innerHTML = `<div class="placeholder-inner"><i class="fas fa-arrows-alt text-blue-400 mr-1.5"></i>释放落位</div>`;
        this.gridArea.appendChild(this.placeholder);

        // 网格参考线覆盖层
        this.gridOverlay = document.createElement('div');
        this.gridOverlay.className = "workbench-grid-overlay pointer-events-none absolute inset-0";
        this.gridArea.appendChild(this.gridOverlay);

        gridWrapper.appendChild(this.gridArea);
        this.container.appendChild(gridWrapper);

        this.bindToolbarButtons();
        this.updateGridOverlay();
    }

    // 绑定工具栏按钮事件
    bindToolbarButtons() {
        const btnRecommend = document.getElementById('idBTNRecommendLayout');
        if (btnRecommend) {
            btnRecommend.onclick = () => {
                this.resetToRecommendedLayout();
            };
        }

        const btnReset = document.getElementById('idBTNResetLayout');
        if (btnReset) {
            btnReset.onclick = () => {
                if (confirm("确定要重置当前工作台的所有卡片布局吗？")) {
                    this.resetLayout();
                }
            };
        }

        const btnToggleGrid = document.getElementById('idBTNToggleGridLines');
        if (btnToggleGrid) {
            btnToggleGrid.onclick = () => {
                this.showGridLines = !this.showGridLines;
                this.gridArea.classList.toggle('show-grid-lines', this.showGridLines);
                btnToggleGrid.classList.toggle('text-indigo-600', this.showGridLines);
                btnToggleGrid.classList.toggle('bg-indigo-50', this.showGridLines);
                this.updateGridOverlay();
            };
        }

        const btnAddCard = document.getElementById('idBTNAddWorkbenchCard');
        if (btnAddCard) {
            btnAddCard.onclick = () => {
                this.openCardManagerModal();
            };
        }
    }

    // 动态计算当前容器下列宽与像素换算
    getColWidth() {
        const containerWidth = this.gridArea.clientWidth || this.container.clientWidth || 1200;
        const totalGap = (this.cols - 1) * this.gap;
        return Math.max(60, (containerWidth - totalGap) / this.cols);
    }

    // 网格坐标转像素坐标
    gridToPixels(x, y, w, h) {
        const colWidth = this.getColWidth();
        return {
            left: Math.round(x * (colWidth + this.gap)),
            top: Math.round(y * (this.rowHeight + this.gap)),
            width: Math.round(w * colWidth + (w - 1) * this.gap),
            height: Math.round(h * this.rowHeight + (h - 1) * this.gap)
        };
    }

    // 像素坐标转网格坐标 (带智能限制)
    pixelsToGrid(left, top, w, h) {
        const colWidth = this.getColWidth();
        let gx = Math.round(left / (colWidth + this.gap));
        let gy = Math.round(top / (this.rowHeight + this.gap));
        let gw = Math.round((w + this.gap) / (colWidth + this.gap));
        let gh = Math.round((h + this.gap) / (this.rowHeight + this.gap));

        gw = Math.max(1, Math.min(this.cols, gw));
        gh = Math.max(1, Math.min(this.rows, gh));
        gx = Math.max(0, Math.min(this.cols - gw, gx));
        gy = Math.max(0, Math.min(this.rows - gh, gy));

        return { x: gx, y: gy, w: gw, h: gh };
    }

    // 更新网格参考线覆盖层
    updateGridOverlay() {
        if (!this.gridOverlay) return;
        if (!this.showGridLines) {
            this.gridOverlay.innerHTML = '';
            return;
        }

        let cellsHtml = '';
        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.cols; c++) {
                const px = this.gridToPixels(c, r, 1, 1);
                cellsHtml += `
                    <div class="grid-cell-guide" style="left:${px.left}px;top:${px.top}px;width:${px.width}px;height:${px.height}px;"></div>
                `;
            }
        }
        this.gridOverlay.innerHTML = cellsHtml;
    }

    // 渲染所有已开启的卡片
    renderCards() {
        // 清理已有卡片 DOM (保留占位框和参考线)
        const oldCards = this.gridArea.querySelectorAll('.workbench-card');
        oldCards.forEach(el => el.remove());

        const enabledCards = this.cards.filter(c => c.enabled);

        enabledCards.forEach(card => {
            const cardEl = this.createCardElement(card);
            this.gridArea.appendChild(cardEl);
            this.updateCardPosition(cardEl, card.x, card.y, card.w, card.h);

            // 渲染内部组件内容
            const body = cardEl.querySelector('.workbench-card-body');
            if (body && typeof card.renderContent === 'function') {
                card.renderContent(body);
            }
        });

        this.updateCanvasHeight();
    }

    // 动态更新网格画布总高度
    updateCanvasHeight() {
        let maxRow = 0;
        this.cards.filter(c => c.enabled).forEach(c => {
            if (c.y + c.h > maxRow) maxRow = c.y + c.h;
        });
        const finalRows = Math.max(this.rows, maxRow);
        const totalHeight = finalRows * this.rowHeight + (finalRows - 1) * this.gap + 30;
        this.gridArea.style.minHeight = `${totalHeight}px`;
    }

    // 创建单张卡片 DOM 节点
    createCardElement(card) {
        const el = document.createElement('div');
        el.className = "workbench-card";
        el.dataset.cardId = card.id;

        el.innerHTML = `
            <!-- 卡片顶栏 -->
            <div class="workbench-card-header flex items-center justify-between select-none">
                <div class="flex items-center gap-2 min-w-0">
                    <span class="card-icon text-sm">${card.icon || '🧩'}</span>
                    <span class="card-title font-bold text-gray-800 text-xs truncate">${card.title}</span>
                    <span class="card-size-badge text-[10px] text-gray-400 font-mono bg-gray-100 px-1.5 py-0.2 rounded">${card.w}x${card.h}</span>
                </div>

                <!-- 悬停渐显操作按钮 -->
                <div class="card-hover-actions flex items-center gap-1">
                    <button class="card-btn-action btn-settings" title="卡片尺寸与选项">
                        <i class="fas fa-gear text-xs"></i>
                    </button>
                    <button class="card-btn-action btn-close text-gray-400 hover:text-red-500" title="隐藏卡片">
                        <i class="fas fa-times text-xs"></i>
                    </button>
                </div>
            </div>

            <!-- 卡片内容主体 -->
            <div class="workbench-card-body w-full flex-1 overflow-y-auto overflow-x-hidden min-h-0"></div>

            <!-- 右下角缩放拖拽手柄 -->
            <div class="card-resize-handle" title="拖拽调整大小">
                <svg viewBox="0 0 10 10" width="8" height="8" class="text-gray-300">
                    <line x1="8" y1="2" x2="2" y2="8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                    <line x1="8" y1="5" x2="5" y2="8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                </svg>
            </div>
        `;

        // 绑定卡片右上角按钮事件
        const btnClose = el.querySelector('.btn-close');
        if (btnClose) {
            btnClose.addEventListener('click', (e) => {
                e.stopPropagation();
                this.hideCard(card.id);
            });
        }

        const btnSettings = el.querySelector('.btn-settings');
        if (btnSettings) {
            btnSettings.addEventListener('click', (e) => {
                e.stopPropagation();
                this.openCardSettings(card.id);
            });
        }

        // 绑定拖拽移动事件
        const header = el.querySelector('.workbench-card-header');
        header.addEventListener('mousedown', (e) => this.onDragStart(e, card, el));

        // 绑定右下角缩放事件
        const resizeHandle = el.querySelector('.card-resize-handle');
        resizeHandle.addEventListener('mousedown', (e) => this.onResizeStart(e, card, el));

        return el;
    }

    // 更新卡片绝对定位像素位置与尺寸
    updateCardPosition(cardEl, x, y, w, h, animated = true) {
        const px = this.gridToPixels(x, y, w, h);
        if (!animated) {
            cardEl.style.transition = 'none';
        } else {
            cardEl.style.transition = 'left 0.22s cubic-bezier(0.2,0,0,1), top 0.22s cubic-bezier(0.2,0,0,1), width 0.22s cubic-bezier(0.2,0,0,1), height 0.22s cubic-bezier(0.2,0,0,1)';
        }

        cardEl.style.left = `${px.left}px`;
        cardEl.style.top = `${px.top}px`;
        cardEl.style.width = `${px.width}px`;
        cardEl.style.height = `${px.height}px`;

        // 更新尺寸徽章
        const badge = cardEl.querySelector('.card-size-badge');
        if (badge) {
            badge.textContent = `${w}x${h}`;
        }
    }

    // ==========================================
    // 拖拽移动与碰撞自动让位 (Drag & Auto-Reflow)
    // ==========================================

    onDragStart(e, card, cardEl) {
        if (e.target.closest('button') || e.target.closest('input') || e.target.closest('select')) return;
        if (e.button !== 0) return; // 仅限鼠标左键

        e.preventDefault();
        this.isDragging = true;
        this.activeCard = card;
        this.activeCardEl = cardEl;

        const cardRect = cardEl.getBoundingClientRect();

        this.dragOffset = {
            x: e.clientX - cardRect.left,
            y: e.clientY - cardRect.top
        };

        // 保存拖拽前完整状态，用于碰撞恢复
        this.savedBeforeDrag = this.cards.map(c => ({ ...c }));

        cardEl.classList.add('is-dragging');
        cardEl.style.transition = 'none';
        cardEl.style.zIndex = '50';

        // 显示蓝色虚线占位框
        this.showPlaceholder(card.x, card.y, card.w, card.h);

        const onMouseMove = (moveEvent) => {
            if (!this.isDragging) return;

            const curGridRect = this.gridArea.getBoundingClientRect();
            const left = moveEvent.clientX - curGridRect.left - this.dragOffset.x;
            const top = moveEvent.clientY - curGridRect.top - this.dragOffset.y;

            // 卡片实时平滑跟随鼠标
            cardEl.style.left = `${left}px`;
            cardEl.style.top = `${top}px`;

            // 计算目标网格坐标
            const candidate = this.pixelsToGrid(left, top, cardEl.offsetWidth, cardEl.offsetHeight);
            const targetX = Math.max(0, Math.min(this.cols - card.w, candidate.x));
            const targetY = Math.max(0, Math.min(this.rows - card.h, candidate.y));

            // 更新占位框位置
            this.showPlaceholder(targetX, targetY, card.w, card.h);

            // 实时碰撞检测与自动让位
            this.performAutoReflow(card.id, targetX, targetY, card.w, card.h);
        };

        const onMouseUp = () => {
            if (!this.isDragging) return;
            this.isDragging = false;

            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);

            cardEl.classList.remove('is-dragging');
            cardEl.style.zIndex = '';

            // 获取占位框最终网格坐标
            let finalPos = { ...this.currentPlaceholderPos };

            // 校验是否有效空间，空间不足则寻找最近有效空位
            if (!this.isValidSlot(card.id, finalPos.x, finalPos.y, card.w, card.h)) {
                finalPos = this.findNearestValidSlot(card.id, finalPos.x, finalPos.y, card.w, card.h);
            }

            card.x = finalPos.x;
            card.y = finalPos.y;

            this.hidePlaceholder();
            this.updateCardPosition(cardEl, card.x, card.y, card.w, card.h, true);
            this.repositionAllCards();
            this.saveLayout();
            this.updateCanvasHeight();
        };

        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    }

    // 碰撞检测：两个矩形是否重叠
    isOverlapping(a, b) {
        return !(
            a.x + a.w <= b.x ||
            a.x >= b.x + b.w ||
            a.y + a.h <= b.y ||
            a.y >= b.y + b.h
        );
    }

    // 实时让位重排算法
    performAutoReflow(activeCardId, targetX, targetY, targetW, targetH) {
        const movingBox = { x: targetX, y: targetY, w: targetW, h: targetH };
        let hasChanges = false;

        // 从原始快照克隆，进行动态位移计算
        const currentCards = this.savedBeforeDrag.map(c => ({ ...c }));
        const activeItem = currentCards.find(c => c.id === activeCardId);
        if (activeItem) {
            activeItem.x = targetX;
            activeItem.y = targetY;
        }

        // 检测与活动卡片发生碰撞的其它卡片，沿 Y 轴向下顺延让位
        currentCards.filter(c => c.enabled && c.id !== activeCardId).forEach(other => {
            if (this.isOverlapping(movingBox, other)) {
                // 将被遮挡卡片向下推移至当前卡片下方
                const pushedY = targetY + targetH;
                if (pushedY + other.h <= this.rows + 5) {
                    other.y = pushedY;
                    hasChanges = true;
                }
            }
        });

        // 级联处理后续可能产生的连环碰撞
        let loopCount = 0;
        let collisionFound = true;
        while (collisionFound && loopCount < 8) {
            collisionFound = false;
            loopCount++;

            for (let i = 0; i < currentCards.length; i++) {
                const c1 = currentCards[i];
                if (!c1.enabled) continue;

                for (let j = i + 1; j < currentCards.length; j++) {
                    const c2 = currentCards[j];
                    if (!c2.enabled) continue;

                    if (this.isOverlapping(c1, c2)) {
                        collisionFound = true;
                        hasChanges = true;
                        // 将处于下方或非 active 的卡片进一步下移
                        if (c1.id === activeCardId) {
                            c2.y = c1.y + c1.h;
                        } else if (c2.id === activeCardId) {
                            c1.y = c2.y + c2.h;
                        } else if (c1.y < c2.y) {
                            c2.y = c1.y + c1.h;
                        } else {
                            c1.y = c2.y + c2.h;
                        }
                    }
                }
            }
        }

        // 同步位置到 DOM (除正在被鼠标拖拽的 active 卡片外)
        if (hasChanges) {
            currentCards.forEach(updated => {
                if (updated.id !== activeCardId && updated.enabled) {
                    const cardData = this.cards.find(c => c.id === updated.id);
                    if (cardData) {
                        cardData.x = updated.x;
                        cardData.y = updated.y;
                    }
                    const el = this.gridArea.querySelector(`[data-card-id="${updated.id}"]`);
                    if (el) {
                        this.updateCardPosition(el, updated.x, updated.y, updated.w, updated.h, true);
                    }
                }
            });
        }
    }

    // 重新排列所有卡片以消除缝隙和重叠
    repositionAllCards() {
        this.cards.filter(c => c.enabled).forEach(card => {
            const el = this.gridArea.querySelector(`[data-card-id="${card.id}"]`);
            if (el) {
                this.updateCardPosition(el, card.x, card.y, card.w, card.h, true);
            }
        });
    }

    // 检查槽位是否完全合法（无碰撞且在 12x15 边界内）
    isValidSlot(cardId, x, y, w, h) {
        if (x < 0 || y < 0 || x + w > this.cols || y + h > this.rows + 3) return false;
        const box = { x, y, w, h };
        return !this.cards.some(c => c.enabled && c.id !== cardId && this.isOverlapping(box, c));
    }

    // 寻找距离目标位置最近的有效空位 (Smart Snap / Fallback)
    findNearestValidSlot(cardId, targetX, targetY, w, h) {
        let bestSlot = { x: targetX, y: targetY };
        let minDistance = Infinity;

        for (let r = 0; r <= this.rows - h; r++) {
            for (let c = 0; c <= this.cols - w; c++) {
                if (this.isValidSlot(cardId, c, r, w, h)) {
                    const dist = Math.hypot(c - targetX, r - targetY);
                    if (dist < minDistance) {
                        minDistance = dist;
                        bestSlot = { x: c, y: r };
                    }
                }
            }
        }
        return bestSlot;
    }

    // 显示落位占位框
    showPlaceholder(x, y, w, h) {
        this.currentPlaceholderPos = { x, y, w, h };
        const px = this.gridToPixels(x, y, w, h);

        this.placeholder.style.left = `${px.left}px`;
        this.placeholder.style.top = `${px.top}px`;
        this.placeholder.style.width = `${px.width}px`;
        this.placeholder.style.height = `${px.height}px`;
        this.placeholder.classList.remove('hidden');
    }

    // 隐藏落位占位框
    hidePlaceholder() {
        this.placeholder.classList.add('hidden');
    }

    // ==========================================
    // 缩放调整操作 (Resize with Handle)
    // ==========================================

    onResizeStart(e, card, cardEl) {
        e.preventDefault();
        e.stopPropagation();

        this.isResizing = true;
        this.activeCard = card;
        this.activeCardEl = cardEl;

        const startX = e.clientX;
        const startY = e.clientY;
        const startW = cardEl.offsetWidth;
        const startH = cardEl.offsetHeight;

        cardEl.classList.add('is-resizing');
        cardEl.style.zIndex = '50';

        this.showPlaceholder(card.x, card.y, card.w, card.h);

        const onMouseMove = (moveEvent) => {
            if (!this.isResizing) return;

            const dx = moveEvent.clientX - startX;
            const dy = moveEvent.clientY - startY;

            const curPxW = Math.max(120, startW + dx);
            const curPxH = Math.max(80, startH + dy);

            cardEl.style.width = `${curPxW}px`;
            cardEl.style.height = `${curPxH}px`;

            const colWidth = this.getColWidth();
            let newW = Math.round((curPxW + this.gap) / (colWidth + this.gap));
            let newH = Math.round((curPxH + this.gap) / (this.rowHeight + this.gap));

            // 限制在 minW/maxW 以及 12列边界内
            newW = Math.max(card.minW || 2, Math.min(card.maxW || 12, Math.min(this.cols - card.x, newW)));
            newH = Math.max(card.minH || 2, Math.min(card.maxH || 15, Math.min(this.rows - card.y, newH)));

            this.showPlaceholder(card.x, card.y, newW, newH);
        };

        const onMouseUp = () => {
            if (!this.isResizing) return;
            this.isResizing = false;

            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);

            cardEl.classList.remove('is-resizing');
            cardEl.style.zIndex = '';

            card.w = this.currentPlaceholderPos.w;
            card.h = this.currentPlaceholderPos.h;

            this.hidePlaceholder();
            this.updateCardPosition(cardEl, card.x, card.y, card.w, card.h, true);
            this.performAutoReflow(card.id, card.x, card.y, card.w, card.h);
            this.repositionAllCards();
            this.saveLayout();
            this.updateCanvasHeight();
        };

        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    }

    // ==========================================
    // 卡片管理、隐藏与添加
    // ==========================================

    hideCard(cardId) {
        const card = this.cards.find(c => c.id === cardId);
        if (card) {
            card.enabled = false;
            this.saveLayout();
            this.renderCards();
        }
    }

    openCardSettings(cardId) {
        const card = this.cards.find(c => c.id === cardId);
        if (!card) return;

        const modal = document.createElement('div');
        modal.className = "fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in";
        modal.innerHTML = `
            <div class="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden border border-gray-100">
                <div class="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                    <div class="flex items-center gap-2">
                        <span class="text-base">${card.icon}</span>
                        <h3 class="font-extrabold text-gray-800 text-sm">${card.title} 选项</h3>
                    </div>
                    <button class="btn-close-modal text-gray-400 hover:text-gray-600 p-1">
                        <i class="fas fa-times text-sm"></i>
                    </button>
                </div>
                <div class="p-5 space-y-4 text-xs">
                    <div>
                        <label class="font-bold text-gray-700 block mb-1">当前网格占比 (宽 x 高):</label>
                        <div class="grid grid-cols-2 gap-2">
                            <div>
                                <span class="text-gray-400 text-[10px]">宽度 (列 1~12):</span>
                                <input type="number" min="${card.minW}" max="${card.maxW}" value="${card.w}" id="idInputCardW" class="w-full p-2 border rounded-xl outline-none font-bold text-gray-700 mt-0.5">
                            </div>
                            <div>
                                <span class="text-gray-400 text-[10px]">高度 (行 1~15):</span>
                                <input type="number" min="${card.minH}" max="${card.maxH}" value="${card.h}" id="idInputCardH" class="w-full p-2 border rounded-xl outline-none font-bold text-gray-700 mt-0.5">
                            </div>
                        </div>
                    </div>
                    <div class="p-3 bg-blue-50/60 rounded-xl text-indigo-900 border border-blue-100/80">
                        <p class="leading-relaxed">💡 您也可以直接在工作台右下角拖拽抓手快速缩放卡片。</p>
                    </div>
                </div>
                <div class="px-5 py-3 bg-gray-50 border-t border-gray-100 flex justify-end gap-2">
                    <button class="btn-apply-size px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm">
                        应用修改
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        modal.querySelector('.btn-close-modal').onclick = () => modal.remove();
        modal.querySelector('.btn-apply-size').onclick = () => {
            const nw = parseInt(modal.querySelector('#idInputCardW').value) || card.w;
            const nh = parseInt(modal.querySelector('#idInputCardH').value) || card.h;
            card.w = Math.max(card.minW, Math.min(card.maxW, Math.min(this.cols - card.x, nw)));
            card.h = Math.max(card.minH, Math.min(card.maxH, Math.min(this.rows - card.y, nh)));
            this.saveLayout();
            this.renderCards();
            modal.remove();
        };
    }

    openCardManagerModal() {
        const modal = document.createElement('div');
        modal.className = "fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in";

        let listHtml = '';
        this.cards.forEach(c => {
            listHtml += `
                <div class="flex items-center justify-between p-3 rounded-xl border border-gray-100 ${c.enabled ? 'bg-indigo-50/30' : 'bg-gray-50'}">
                    <div class="flex items-center gap-3">
                        <span class="text-xl">${c.icon}</span>
                        <div>
                            <div class="font-bold text-gray-800 text-xs">${c.title}</div>
                            <div class="text-[10px] text-gray-400">标准尺寸: ${c.defaultPos.w}x${c.defaultPos.h}</div>
                        </div>
                    </div>
                    <label class="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" class="sr-only peer card-toggle-chk" data-card-id="${c.id}" ${c.enabled ? 'checked' : ''}>
                        <div class="w-10 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                    </label>
                </div>
            `;
        });

        modal.innerHTML = `
            <div class="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-gray-100">
                <div class="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                    <div class="flex items-center gap-2">
                        <span class="text-lg">🍱</span>
                        <h3 class="font-extrabold text-gray-800 text-sm">卡片模块中心</h3>
                    </div>
                    <button class="btn-close-modal text-gray-400 hover:text-gray-600 p-1">
                        <i class="fas fa-times text-sm"></i>
                    </button>
                </div>
                <div class="p-6 space-y-3 max-h-[60vh] overflow-y-auto">
                    ${listHtml}
                </div>
                <div class="px-6 py-3.5 bg-gray-50 border-t border-gray-100 flex justify-end">
                    <button class="btn-save-manager px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md">
                        保存并更新工作台
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        modal.querySelector('.btn-close-modal').onclick = () => modal.remove();
        modal.querySelector('.btn-save-manager').onclick = () => {
            modal.querySelectorAll('.card-toggle-chk').forEach(chk => {
                const cId = chk.dataset.cardId;
                const card = this.cards.find(c => c.id === cId);
                if (card) {
                    const wasEnabled = card.enabled;
                    card.enabled = chk.checked;
                    // 如果从禁用重新开启，且原位置已被占用，自动寻找空位
                    if (!wasEnabled && card.enabled) {
                        const slot = this.findNearestValidSlot(card.id, card.x, card.y, card.w, card.h);
                        card.x = slot.x;
                        card.y = slot.y;
                    }
                }
            });
            this.saveLayout();
            this.renderCards();
            modal.remove();
        };
    }

    // ==========================================
    // 各 Widget 组件与卡片内容渲染适配器
    // ==========================================

    renderWidgetCard(widgetId, cardBody) {
        cardBody.className = "workbench-card-body w-full flex-1 overflow-y-auto overflow-x-hidden min-h-0";
        if (window.gWidgetManager) {
            const widget = window.gWidgetManager.getAllWidgets().find(w => w.id === widgetId);
            if (widget && typeof widget.render === 'function') {
                const wrapper = document.createElement('div');
                wrapper.className = "w-full min-w-0 h-full";
                cardBody.appendChild(wrapper);
                widget.render(wrapper);
                return;
            }
        }
        cardBody.innerHTML = `<div class="p-4 text-center text-xs text-gray-400">组件 [${widgetId}] 准备中...</div>`;
    }

    renderAppShutterCard(cardBody) {
        cardBody.className = "workbench-card-body w-full flex-1 overflow-y-auto overflow-x-hidden p-3 space-y-2";
        const tools = (typeof gDialyTools !== 'undefined' && Array.isArray(gDialyTools)) ? gDialyTools : [];

        let itemsHtml = '';
        const displayTools = tools.slice(0, 12);

        displayTools.forEach(tool => {
            const title = tool.title || '常用应用';
            const url = (tool.data && tool.data.url) ? tool.data.url : '#';
            const iconText = typeof getIconText === 'function' ? getIconText(url, "first-two") : title.slice(0, 2);

            itemsHtml += `
                <a href="${url}" target="_blank" class="flex items-center gap-2.5 p-2 rounded-xl bg-gray-50/80 hover:bg-indigo-50/70 border border-gray-100 hover:border-indigo-100 transition-all group">
                    <div class="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-blue-600 text-white font-bold text-[11px] flex items-center justify-center shrink-0 shadow-sm">
                        ${iconText}
                    </div>
                    <div class="min-w-0 flex-1">
                        <div class="font-bold text-gray-700 group-hover:text-indigo-600 text-xs truncate">${title}</div>
                        <div class="text-[10px] text-gray-400 truncate">${url.replace(/^https?:\/\//, '')}</div>
                    </div>
                    <i class="fas fa-external-link-alt text-[10px] text-gray-300 group-hover:text-indigo-400 mr-1"></i>
                </a>
            `;
        });

        if (displayTools.length === 0) {
            itemsHtml = `
                <div class="text-center py-6 text-xs text-gray-400">
                    <i class="fas fa-rocket text-2xl text-gray-300 mb-2"></i>
                    <p>暂无应用，可在常用应用中添加</p>
                </div>
            `;
        }

        cardBody.innerHTML = `
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                ${itemsHtml}
            </div>
        `;
    }

    // 窗口尺寸变化自适应
    setupResizeObserver() {
        if (typeof ResizeObserver !== 'undefined') {
            if (this.resizeObserver) {
                this.resizeObserver.disconnect();
            }
            this.resizeObserver = new ResizeObserver(() => {
                if (!this.isDragging && !this.isResizing) {
                    this.repositionAllCards();
                    this.updateGridOverlay();
                }
            });
            this.resizeObserver.observe(this.container);
        }
    }

    setupGlobalEvents() {
        window.addEventListener('resize', () => {
            if (!this.isDragging && !this.isResizing) {
                this.repositionAllCards();
                this.updateGridOverlay();
            }
        });
    }
}

// 暴露全局实例工厂方法
window.initSmartWorkbench = function(containerId, options) {
    window.gSmartWorkbench = new SmartWorkbench(containerId, options);
    return window.gSmartWorkbench;
};
