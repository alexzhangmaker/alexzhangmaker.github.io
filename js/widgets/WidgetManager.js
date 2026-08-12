/**
 * BaseWidget - 抽象 Widget 基类 (支持 Bento Grid 尺寸配置)
 */
class BaseWidget {
    constructor(manifest) {
        this.id = manifest.id;                    // 唯一标识, 如 'widget-calendar'
        this.name = manifest.name;                // 组件名称, 如 '日历月历'
        this.icon = manifest.icon || '🧩';        // 显示图标
        this.description = manifest.description || '';
        this.enabled = manifest.enabled ?? true;  // 默认使能状态
        this.gridSize = manifest.gridSize || 'bento-span-12'; // Bento Grid 占比, 如 'bento-span-4', 'bento-span-8', 'bento-span-12'
        this.config = manifest.config || {};      // 自定义参数
    }

    async init() {}
    async render(container) {}
    async destroy() {}
    renderSettings(container) {}
}

/**
 * WidgetManager - Bento Grid 架构 Widget 注册与生命周期管理器 (支持紧凑纵向 Stack)
 */
class WidgetManager {
    constructor() {
        this.widgets = new Map();
        this.loadUserConfig();
    }

    // 注册 Widget 实例
    register(widget) {
        if (!(widget instanceof BaseWidget)) {
            console.error("注册失败: widget 必须继承 BaseWidget", widget);
            return;
        }
        
        // 恢复用户保存的使能与尺寸配置
        const savedConfig = this.userConfigs[widget.id];
        if (savedConfig) {
            widget.enabled = savedConfig.enabled ?? widget.enabled;
            widget.gridSize = savedConfig.gridSize || widget.gridSize;
            widget.config = { ...widget.config, ...savedConfig.config };
        }

        this.widgets.set(widget.id, widget);
        console.log(`🍱 Widget [${widget.name}] 已成功挂载 Bento 架构!`);
    }

    // 获取所有注册的 Widgets
    getAllWidgets() {
        return Array.from(this.widgets.values());
    }

    // 获取已启用的 Widgets
    getEnabledWidgets() {
        return this.getAllWidgets().filter(w => w.enabled);
    }

    // 切换 Widget 使能状态
    setWidgetEnabled(id, enabled) {
        const widget = this.widgets.get(id);
        if (widget) {
            widget.enabled = enabled;
            this.saveUserConfig();
        }
    }

    // 调整 Widget Bento 网格尺寸
    setWidgetGridSize(id, gridSize) {
        const widget = this.widgets.get(id);
        if (widget) {
            widget.gridSize = gridSize;
            this.saveUserConfig();
        }
    }

    // 读取用户配置
    loadUserConfig() {
        try {
            const raw = localStorage.getItem('user_widget_configs');
            this.userConfigs = raw ? JSON.parse(raw) : {};
        } catch (e) {
            this.userConfigs = {};
        }
    }

    // 持久化用户配置
    saveUserConfig() {
        const configs = {};
        this.widgets.forEach(w => {
            configs[w.id] = {
                enabled: w.enabled,
                gridSize: w.gridSize,
                config: w.config
            };
        });
        this.userConfigs = configs;
        localStorage.setItem('user_widget_configs', JSON.stringify(configs));
    }

    // 渲染 Bento Grid 仪表板视图 (紧凑纵向排列, 解决 Row 高度间距过大问题)
    async renderDashboard(container) {
        container.innerHTML = '';
        container.className = "w-full min-w-0";

        const enabledWidgets = this.getEnabledWidgets();

        if (enabledWidgets.length === 0) {
            container.innerHTML = `
                <div class="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100 max-w-lg mx-auto my-8">
                    <div class="text-4xl mb-3">🍱</div>
                    <h3 class="text-lg font-bold text-gray-800 mb-1">暂无开启的 Bento Widget 组件</h3>
                    <p class="text-xs text-gray-400 mb-4">请在右上角系统设置 ⚙️ 的 “组件管理中心” 中开启您需要的组件。</p>
                </div>
            `;
            return;
        }

        // 外层 12 列 Bento Grid 容器
        const bentoGridContainer = document.createElement('div');
        bentoGridContainer.className = "bento-grid w-full min-w-0";

        // 分组分类：span-4, span-8, span-12
        const span4Widgets = [];
        const span8Widgets = [];
        const span12Widgets = [];

        for (const w of enabledWidgets) {
            if (w.gridSize.includes('4')) {
                span4Widgets.push(w);
            } else if (w.gridSize.includes('8')) {
                span8Widgets.push(w);
            } else {
                span12Widgets.push(w);
            }
        }

        // 1. 如果既有 4 跨度也有 8 跨度组件，按左右双向 Stack 列组装
        if (span4Widgets.length > 0 && span8Widgets.length > 0) {
            // 左纵列 (span-4)
            const leftCol = document.createElement('div');
            leftCol.className = "bento-span-4 w-full min-w-0 flex flex-col gap-6";
            leftCol.style.gridColumn = "span 4 / span 4";

            for (const w of span4Widgets) {
                const wWrapper = document.createElement('div');
                wWrapper.id = `widget-container-${w.id}`;
                wWrapper.className = "w-full min-w-0 flex flex-col";
                leftCol.appendChild(wWrapper);
                await w.render(wWrapper);
            }
            bentoGridContainer.appendChild(leftCol);

            // 右纵列 (span-8)
            const rightCol = document.createElement('div');
            rightCol.className = "bento-span-8 w-full min-w-0 flex flex-col gap-6";
            rightCol.style.gridColumn = "span 8 / span 8";

            for (const w of span8Widgets) {
                const wWrapper = document.createElement('div');
                wWrapper.id = `widget-container-${w.id}`;
                wWrapper.className = "w-full min-w-0 flex flex-col";
                rightCol.appendChild(wWrapper);
                await w.render(wWrapper);
            }
            bentoGridContainer.appendChild(rightCol);

            // 渲染全宽 span-12 组件
            for (const w of span12Widgets) {
                const wWrapper = document.createElement('div');
                wWrapper.id = `widget-container-${w.id}`;
                wWrapper.className = "bento-span-12 w-full min-w-0 flex flex-col";
                wWrapper.style.gridColumn = "span 12 / span 12";
                bentoGridContainer.appendChild(wWrapper);
                await w.render(wWrapper);
            }
        } else {
            // 没有跨列混合时按顺序独立渲染
            for (const w of enabledWidgets) {
                const wWrapper = document.createElement('div');
                wWrapper.id = `widget-container-${w.id}`;

                let spanClass = 'bento-span-12';
                let spanVal = 12;
                if (w.gridSize.includes('4')) { spanClass = 'bento-span-4'; spanVal = 4; }
                else if (w.gridSize.includes('6')) { spanClass = 'bento-span-6'; spanVal = 6; }
                else if (w.gridSize.includes('8')) { spanClass = 'bento-span-8'; spanVal = 8; }

                wWrapper.className = `${spanClass} w-full min-w-0 flex flex-col`;
                wWrapper.style.gridColumn = `span ${spanVal} / span ${spanVal}`;
                bentoGridContainer.appendChild(wWrapper);
                await w.render(wWrapper);
            }
        }

        container.appendChild(bentoGridContainer);
    }
}

// 暴露全局 WidgetManager 实例
window.gWidgetManager = new WidgetManager();
