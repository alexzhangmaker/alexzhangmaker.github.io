/**
 * KanbanTasksWidget - 任务看板组件 (Bento Grid 8/12 占比)
 */
class KanbanTasksWidget extends BaseWidget {
    constructor() {
        super({
            id: 'widget-kanban',
            name: '今日待办/任务看板组件',
            icon: '📌',
            description: '提供任务指标统计、快捷新建以及待办/进行中/已完成三列流转看板',
            enabled: true,
            gridSize: 'bento-span-8' // Bento 架构: 占据 8/12 宽度 (2/3)
        });
    }

    async render(container) {
        container.className = "w-full min-w-0 space-y-6";
        container.innerHTML = "";

        // 兼容 ES6 let 作用域，安全获取 gKanbanTasks
        const tasksList = (typeof gKanbanTasks !== 'undefined' && Array.isArray(gKanbanTasks)) ? gKanbanTasks : (window.gKanbanTasks || []);
        const totalCount = tasksList.length;
        const todoTasks = tasksList.filter(t => t.status === 'todo');
        const inProgressTasks = tasksList.filter(t => t.status === 'in_progress');
        const completedTasks = tasksList.filter(t => t.status === 'completed');
        const rateStr = totalCount > 0 ? Math.round((completedTasks.length / totalCount) * 100) + '%' : '0%';

        // 行 1：5 个任务统计 UI 组件
        const row1 = document.createElement('div');
        row1.className = "grid grid-cols-2 sm:grid-cols-5 gap-3 w-full min-w-0";
        row1.innerHTML = `
            <div class="bg-white rounded-2xl p-3 text-center shadow-sm border border-gray-100 flex flex-col items-center justify-center h-20 min-w-0">
                <div class="text-2xl font-black text-indigo-600 mb-0.5">${totalCount}</div>
                <div class="text-xs font-bold text-gray-400">全部</div>
            </div>
            <div class="bg-white rounded-2xl p-3 text-center shadow-sm border border-gray-100 flex flex-col items-center justify-center h-20 min-w-0">
                <div class="text-2xl font-black text-amber-500 mb-0.5">${todoTasks.length}</div>
                <div class="text-xs font-bold text-gray-400">待办</div>
            </div>
            <div class="bg-white rounded-2xl p-3 text-center shadow-sm border border-gray-100 flex flex-col items-center justify-center h-20 min-w-0">
                <div class="text-2xl font-black text-blue-500 mb-0.5">${inProgressTasks.length}</div>
                <div class="text-xs font-bold text-gray-400">进行中</div>
            </div>
            <div class="bg-white rounded-2xl p-3 text-center shadow-sm border border-gray-100 flex flex-col items-center justify-center h-20 min-w-0">
                <div class="text-2xl font-black text-emerald-500 mb-0.5">${completedTasks.length}</div>
                <div class="text-xs font-bold text-gray-400">已完成</div>
            </div>
            <div class="bg-white rounded-2xl p-3 text-center shadow-sm border border-gray-100 flex flex-col items-center justify-center h-20 min-w-0">
                <div class="text-2xl font-black text-purple-600 mb-0.5">${rateStr}</div>
                <div class="text-xs font-bold text-gray-400">完成率</div>
            </div>
        `;
        container.appendChild(row1);

        // 行 2：添加任务部分的 UI 组件
        const row2 = document.createElement('div');
        row2.className = "w-full min-w-0 bg-white rounded-2xl shadow-sm border-2 border-dashed border-indigo-200 p-2.5 px-4 flex items-center justify-between gap-3";
        row2.innerHTML = `
            <div class="flex items-center gap-2 flex-1 min-w-0">
                <span class="text-lg">✍️</span>
                <input type="text" id="idKanbanNewTaskInput" placeholder="输入新任务，按 Enter 添加..." class="w-full bg-transparent border-none outline-none text-gray-700 text-sm font-medium placeholder-gray-400">
            </div>
            <button id="idBTNKanbanAddTask" class="px-4 py-2 rounded-xl text-white font-bold text-xs shadow hover:shadow-md transition-all flex items-center gap-1.5 whitespace-nowrap" style="background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);">
                <i class="fas fa-plus text-xs"></i> 添加任务
            </button>
        `;
        container.appendChild(row2);

        // 行 3：三列布局的 待办 / 进行中 / 已完成
        const row3 = document.createElement('div');
        row3.className = "grid grid-cols-1 md:grid-cols-3 gap-5 w-full min-w-0";
        row3.innerHTML = `
            <!-- 待办列 -->
            <div class="bg-white rounded-2xl shadow-sm border-t-4 border-amber-400 border-gray-100 p-4 min-h-[380px] flex flex-col min-w-0">
                <div class="flex items-center justify-between pb-3 mb-3 border-b border-gray-100">
                    <div class="flex items-center gap-2 font-bold text-gray-800 text-sm">
                        <span class="text-amber-500">📌</span> 待办
                    </div>
                    <span class="bg-amber-100 text-amber-700 text-xs font-bold px-2 py-0.5 rounded-full">${todoTasks.length}</span>
                </div>
                <div id="col-todo" class="space-y-3 flex-1 overflow-y-auto"></div>
            </div>

            <!-- 进行中列 -->
            <div class="bg-white rounded-2xl shadow-sm border-t-4 border-blue-500 border-gray-100 p-4 min-h-[380px] flex flex-col min-w-0">
                <div class="flex items-center justify-between pb-3 mb-3 border-b border-gray-100">
                    <div class="flex items-center gap-2 font-bold text-gray-800 text-sm">
                        <span class="text-blue-500">⏳</span> 进行中
                    </div>
                    <span class="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-0.5 rounded-full">${inProgressTasks.length}</span>
                </div>
                <div id="col-in_progress" class="space-y-3 flex-1 overflow-y-auto"></div>
            </div>

            <!-- 已完成列 -->
            <div class="bg-white rounded-2xl shadow-sm border-t-4 border-emerald-500 border-gray-100 p-4 min-h-[380px] flex flex-col min-w-0">
                <div class="flex items-center justify-between pb-3 mb-3 border-b border-gray-100">
                    <div class="flex items-center gap-2 font-bold text-gray-800 text-sm">
                        <span class="text-emerald-500">✅</span> 已完成
                    </div>
                    <span class="bg-emerald-100 text-emerald-700 text-xs font-bold px-2 py-0.5 rounded-full">${completedTasks.length}</span>
                </div>
                <div id="col-completed" class="space-y-3 flex-1 overflow-y-auto"></div>
            </div>
        `;
        container.appendChild(row3);

        // 渲染各列任务卡片
        const colTodo = container.querySelector('#col-todo');
        const colInProgress = container.querySelector('#col-in_progress');
        const colCompleted = container.querySelector('#col-completed');

        todoTasks.forEach(task => this.renderKanbanCard(task, colTodo));
        inProgressTasks.forEach(task => this.renderKanbanCard(task, colInProgress));
        completedTasks.forEach(task => this.renderKanbanCard(task, colCompleted));

        // 事件绑定：添加任务
        const inputTask = container.querySelector('#idKanbanNewTaskInput');
        const btnAddTask = container.querySelector('#idBTNKanbanAddTask');
        const handleAddTask = () => {
            if (inputTask && inputTask.value.trim()) {
                if (typeof addKanbanTask === 'function') {
                    addKanbanTask(inputTask.value);
                }
                if (typeof displayDailyTools === 'function') {
                    displayDailyTools();
                } else {
                    this.render(container);
                }
            }
        };
        btnAddTask.onclick = handleAddTask;
        inputTask.onkeydown = (e) => {
            if (e.key === 'Enter') handleAddTask();
        };
    }

    renderKanbanCard(task, container) {
        const card = document.createElement('div');
        card.className = "bg-white border border-gray-200/80 rounded-xl p-3.5 shadow-sm hover:shadow-md transition-all min-w-0";

        let badgeHtml = '';
        let actionBtnsHtml = '';

        if (task.status === 'todo') {
            badgeHtml = `<span class="bg-amber-50 text-amber-600 text-[11px] font-bold px-2 py-0.5 rounded-md flex-shrink-0">待办</span>`;
            actionBtnsHtml = `
                <button class="btn-move-status text-[11px] font-medium text-gray-500 hover:text-blue-600 bg-gray-100 hover:bg-blue-50 px-2 py-1 rounded transition-colors" data-status="in_progress">→ 进行中</button>
                <button class="btn-move-status text-[11px] font-medium text-gray-500 hover:text-emerald-600 bg-gray-100 hover:bg-emerald-50 px-2 py-1 rounded transition-colors" data-status="completed">→ 完成</button>
            `;
        } else if (task.status === 'in_progress') {
            badgeHtml = `<span class="bg-blue-50 text-blue-600 text-[11px] font-bold px-2 py-0.5 rounded-md flex-shrink-0">进行中</span>`;
            actionBtnsHtml = `
                <button class="btn-move-status text-[11px] font-medium text-gray-500 hover:text-amber-600 bg-gray-100 hover:bg-amber-50 px-2 py-1 rounded transition-colors" data-status="todo">← 待办</button>
                <button class="btn-move-status text-[11px] font-medium text-gray-500 hover:text-emerald-600 bg-gray-100 hover:bg-emerald-50 px-2 py-1 rounded transition-colors" data-status="completed">→ 完成</button>
            `;
        } else {
            badgeHtml = `<span class="bg-emerald-50 text-emerald-600 text-[11px] font-bold px-2 py-0.5 rounded-md flex-shrink-0">已完成</span>`;
            actionBtnsHtml = `
                <button class="btn-move-status text-[11px] font-medium text-gray-500 hover:text-amber-600 bg-gray-100 hover:bg-amber-50 px-2 py-1 rounded transition-colors" data-status="todo">← 待办</button>
                <button class="btn-move-status text-[11px] font-medium text-gray-500 hover:text-blue-600 bg-gray-100 hover:bg-blue-50 px-2 py-1 rounded transition-colors" data-status="in_progress">← 进行中</button>
            `;
        }

        card.innerHTML = `
            <div class="flex items-start justify-between gap-2 mb-2">
                <h4 class="text-sm font-bold text-gray-800 leading-snug break-all">${task.title}</h4>
                <button class="btn-delete-task text-gray-300 hover:text-red-500 text-xs p-0.5 transition-colors flex-shrink-0" title="删除任务">✕</button>
            </div>
            <div class="flex items-center justify-between gap-1 mb-3 flex-wrap">
                ${badgeHtml}
                <div class="flex items-center gap-1 flex-wrap">
                    ${actionBtnsHtml}
                </div>
            </div>
            <div class="border-t border-dashed border-gray-100 pt-2 flex items-center justify-between gap-2 text-xs">
                <span class="text-gray-400 truncate max-w-[130px]" title="${task.memo || ''}">${task.memo || '无备注'}</span>
                <div class="flex items-center gap-1 flex-shrink-0">
                    <input type="text" placeholder="添加备注..." class="input-memo text-[11px] border border-gray-200 rounded px-2 py-0.5 w-20 outline-none focus:border-indigo-400">
                    <button class="btn-save-memo text-xs text-indigo-500 hover:text-indigo-700 bg-indigo-50 w-5 h-5 rounded-full flex items-center justify-center font-bold flex-shrink-0">+</button>
                </div>
            </div>
        `;

        // 删除按钮绑定
        card.querySelector('.btn-delete-task').onclick = () => {
            if (typeof deleteKanbanTask === 'function') deleteKanbanTask(task.id);
            if (typeof displayDailyTools === 'function') displayDailyTools();
        };

        // 状态切换按钮绑定
        card.querySelectorAll('.btn-move-status').forEach(btn => {
            btn.onclick = () => {
                const newStatus = btn.dataset.status;
                if (typeof updateKanbanTaskStatus === 'function') updateKanbanTaskStatus(task.id, newStatus);
                if (typeof displayDailyTools === 'function') displayDailyTools();
            };
        });

        // 备注更新绑定
        const memoInput = card.querySelector('.input-memo');
        const memoBtn = card.querySelector('.btn-save-memo');
        const handleMemoSave = () => {
            if (memoInput && memoInput.value.trim()) {
                if (typeof updateKanbanTaskMemo === 'function') updateKanbanTaskMemo(task.id, memoInput.value.trim());
                if (typeof displayDailyTools === 'function') displayDailyTools();
            }
        };
        memoBtn.onclick = handleMemoSave;
        memoInput.onkeydown = (e) => {
            if (e.key === 'Enter') handleMemoSave();
        };

        container.appendChild(card);
    }
}

// 自动注册当前 Widget
window.gWidgetManager.register(new KanbanTasksWidget());
