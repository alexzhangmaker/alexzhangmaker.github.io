/**
 * QuickMemoWidget - 基于 TipTap / WYSIWYG 风格的无 Toolbar 快捷备忘录 Widget
 */
class QuickMemoWidget extends BaseWidget {
    constructor() {
        super({
            id: 'widget-quick-memo',
            name: 'QuickMemo 快捷备忘录',
            icon: '📝',
            description: '基于 TipTap / WYSIWYG 风格的无 Toolbar 快捷便签，自动将首个 # 标题提取为备忘录名称并保存至 IndexedDB',
            enabled: true,
            gridSize: 'bento-span-4' // Bento 架构: 4/12 (1/3 宽度)
        });

        this.memoTitle = '未命名速记便签';
        this.memoHtml = '<h1># 备忘录标题</h1><p>在下方开始输入您的想法与备忘事项...</p>';
        this.saveTimer = null;
    }

    extractFirstH1Title(htmlContent, textContent) {
        if (!htmlContent) return '未命名速记便签';
        const temp = document.createElement('div');
        temp.innerHTML = htmlContent;
        const h1 = temp.querySelector('h1');
        if (h1 && h1.textContent.trim()) {
            return h1.textContent.replace(/^#\s*/, '').trim();
        }

        // 检查原始文本行
        const rawText = textContent || temp.textContent || '';
        const lines = rawText.split('\n');
        for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed.startsWith('# ')) {
                return trimmed.replace(/^#\s+/, '').trim();
            } else if (trimmed) {
                return trimmed;
            }
        }
        return '未命名速记便签';
    }

    async init() {
        // 从 IndexedDB 读取持久化的 QuickMemo 数据
        if (window.dbStorage && typeof window.dbStorage.getQuickMemo === 'function') {
            try {
                const savedData = await window.dbStorage.getQuickMemo();
                if (savedData && savedData.html) {
                    this.memoHtml = savedData.html;
                    this.memoTitle = savedData.title || this.extractFirstH1Title(savedData.html, '');
                }
            } catch (e) {
                console.warn("读取 QuickMemo IndexedDB 失败:", e);
            }
        }
    }

    async render(container) {
        await this.init();

        container.className = "w-full min-w-0 bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col space-y-3";

        container.innerHTML = `
            <!-- 顶栏标题简报 -->
            <div class="flex items-center justify-between pb-2 border-b border-gray-100">
                <div class="flex items-center gap-2 min-w-0">
                    <span class="text-base flex-shrink-0">📝</span>
                    <span id="idMemoTitleDisplay" class="font-extrabold text-gray-800 text-xs truncate max-w-[200px]" title="${this.memoTitle}">${this.memoTitle}</span>
                </div>
                <div class="flex items-center gap-1.5 flex-shrink-0">
                    <span id="idMemoSaveState" class="text-[10px] text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded font-bold">已保存至 IndexedDB</span>
                </div>
            </div>

            <!-- 无 Toolbar WYSIWYG 编辑器画布 -->
            <div id="idTipTapEditorWrapper" class="w-full min-h-[160px] max-h-[300px] overflow-y-auto p-3 bg-gray-50/60 border border-gray-200/80 rounded-xl outline-none focus-within:border-indigo-400 focus-within:bg-white transition-all text-xs text-gray-800 leading-relaxed">
                <div id="idTipTapEditorCanvas" class="prose prose-sm outline-none min-h-[140px]" contenteditable="true"></div>
            </div>

            <!-- 底部操作与提示 -->
            <div class="flex items-center justify-between text-[10px] text-gray-400">
                <span>输入 <code class="bg-gray-100 px-1 rounded text-indigo-600"># 标题</code> 自动提取主标题</span>
                <button id="idBTNClearMemo" class="text-gray-400 hover:text-red-500 transition-colors">清空便签</button>
            </div>
        `;

        const editorCanvas = container.querySelector('#idTipTapEditorCanvas');
        const titleDisplay = container.querySelector('#idMemoTitleDisplay');
        const saveState = container.querySelector('#idMemoSaveState');
        const btnClear = container.querySelector('#idBTNClearMemo');

        // 填充 HTML 初始内容
        editorCanvas.innerHTML = this.memoHtml;

        const handleInput = () => {
            const html = editorCanvas.innerHTML;
            const text = editorCanvas.textContent;
            const title = this.extractFirstH1Title(html, text);

            this.memoHtml = html;
            this.memoTitle = title;
            titleDisplay.textContent = title;
            titleDisplay.title = title;

            saveState.textContent = "正在保存...";
            saveState.className = "text-[10px] text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded font-bold";

            if (this.saveTimer) clearTimeout(this.saveTimer);
            this.saveTimer = setTimeout(async () => {
                if (window.dbStorage && typeof window.dbStorage.saveQuickMemo === 'function') {
                    await window.dbStorage.saveQuickMemo({
                        html: this.memoHtml,
                        title: this.memoTitle,
                        updatedAt: Date.now()
                    });
                }
                saveState.textContent = "已保存至 IndexedDB";
                saveState.className = "text-[10px] text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded font-bold";
            }, 400);
        };

        editorCanvas.oninput = handleInput;
        editorCanvas.onkeyup = (e) => {
            // 当用户在首行输入 # 并且按 Enter 或 Space 时，自动将其转换为 <h1>
            if (e.key === ' ' || e.key === 'Enter') {
                const text = editorCanvas.innerText || '';
                if (text.startsWith('# ') && !editorCanvas.querySelector('h1')) {
                    const cleanText = text.replace(/^#\s+/, '');
                    editorCanvas.innerHTML = `<h1># ${cleanText}</h1>`;
                    // 将光标定位至末尾
                    const range = document.createRange();
                    const sel = window.getSelection();
                    range.selectNodeContents(editorCanvas);
                    range.collapse(false);
                    sel.removeAllRanges();
                    sel.addRange(range);
                    handleInput();
                }
            }
        };

        btnClear.onclick = () => {
            if (confirm("确定要清空当前 QuickMemo 备忘录吗？")) {
                editorCanvas.innerHTML = `<h1># 新建速记便签</h1><p></p>`;
                handleInput();
            }
        };
    }
}

// 自动注册 QuickMemo Widget
window.gWidgetManager.register(new QuickMemoWidget());
