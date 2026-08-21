/**
 * CalendarWidget - 交互式月历组件 (Bento Bento 4/12 占比)
 */
class CalendarWidget extends BaseWidget {
    constructor() {
        super({
            id: 'widget-calendar',
            name: '日历月历组件',
            icon: '📅',
            description: '提供交互式月历浏览、日期点选与今天归位功能',
            enabled: true,
            gridSize: 'bento-span-4' // Bento 架构: 占据 4/12 宽度 (1/3)
        });

        this.currentKanbanDate = new Date();
        this.kanbanViewYear = this.currentKanbanDate.getFullYear();
        this.kanbanViewMonth = this.currentKanbanDate.getMonth();
    }

    formatChineseDate(date) {
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const day = date.getDate();
        const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
        const weekDay = weekDays[date.getDay()];
        return `${year}年${month}月${day}日 ${weekDay}`;
    }

    async render(container) {
        container.className = "w-full min-w-0 bg-white rounded-2xl p-5 shadow-sm border border-gray-100";
        const displayYear = this.kanbanViewYear;
        const displayMonth = this.kanbanViewMonth;
        const monthNames = ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"];

        container.innerHTML = `
            <!-- 顶栏：年月与导航 -->
            <div class="flex items-center justify-between pb-3 mb-3 border-b border-gray-100">
                <button id="idBTNCalPrevMonth" class="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-indigo-600 hover:bg-gray-50 transition-all">
                    <i class="fas fa-chevron-left text-xs"></i>
                </button>
                <div class="flex items-center gap-2">
                    <span class="font-extrabold text-gray-800 text-sm tracking-wide">${displayYear}年 ${monthNames[displayMonth]}</span>
                    <button id="idBTNCalToday" class="text-[11px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full hover:bg-indigo-100 transition-colors">今天</button>
                </div>
                <button id="idBTNCalNextMonth" class="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-indigo-600 hover:bg-gray-50 transition-all">
                    <i class="fas fa-chevron-right text-xs"></i>
                </button>
            </div>

            <!-- 选中日期简报 -->
            <div class="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl p-3 flex items-center justify-between mb-4">
                <div>
                    <div class="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">SELECTED DATE</div>
                    <div class="text-xs font-extrabold text-gray-800">${this.formatChineseDate(this.currentKanbanDate)}</div>
                </div>
                <span class="text-xl">📅</span>
            </div>

            <!-- 星期标头 -->
            <div class="grid grid-cols-7 text-center text-xs font-bold text-gray-400 mb-2">
                <span>日</span><span>一</span><span>二</span><span>三</span><span>四</span><span>五</span><span>六</span>
            </div>

            <!-- 月历日期网格 -->
            <div id="idCalGrid" class="grid grid-cols-7 gap-1 text-center text-xs font-medium"></div>
        `;

        const calGrid = container.querySelector('#idCalGrid');
        const firstDayIndex = new Date(displayYear, displayMonth, 1).getDay();
        const daysInMonth = new Date(displayYear, displayMonth + 1, 0).getDate();
        const daysInPrevMonth = new Date(displayYear, displayMonth, 0).getDate();
        const today = new Date();

        // 填充上个月末尾天数
        for (let i = firstDayIndex - 1; i >= 0; i--) {
            const dayNum = daysInPrevMonth - i;
            const cell = document.createElement('div');
            cell.className = "text-gray-300 py-1.5 rounded-xl select-none";
            cell.textContent = dayNum;
            calGrid.appendChild(cell);
        }

        // 填充当月天数
        for (let day = 1; day <= daysInMonth; day++) {
            const cell = document.createElement('div');
            const isSelected = this.currentKanbanDate.getFullYear() === displayYear &&
                               this.currentKanbanDate.getMonth() === displayMonth &&
                               this.currentKanbanDate.getDate() === day;
            const isToday = today.getFullYear() === displayYear &&
                            today.getMonth() === displayMonth &&
                            today.getDate() === day;

            let classes = "py-1.5 rounded-xl cursor-pointer transition-all select-none ";
            if (isSelected) {
                classes += "bg-emerald-500 text-white font-extrabold shadow-md transform scale-105";
            } else if (isToday) {
                classes += "bg-indigo-50 text-indigo-600 font-extrabold border border-indigo-200";
            } else {
                classes += "text-gray-700 hover:bg-indigo-50 hover:text-indigo-600";
            }

            cell.className = classes;
            cell.textContent = day;

            cell.onclick = () => {
                this.currentKanbanDate = new Date(displayYear, displayMonth, day);
                this.render(container);
            };

            calGrid.appendChild(cell);
        }

        // 填充下个月开头天数
        const totalCellsSoFar = firstDayIndex + daysInMonth;
        const remainingCells = (totalCellsSoFar <= 35 ? 35 : 42) - totalCellsSoFar;
        for (let day = 1; day <= remainingCells; day++) {
            const cell = document.createElement('div');
            cell.className = "text-gray-300 py-1.5 rounded-xl select-none";
            cell.textContent = day;
            calGrid.appendChild(cell);
        }

        // 按钮事件绑定
        container.querySelector('#idBTNCalPrevMonth').onclick = () => {
            this.kanbanViewMonth--;
            if (this.kanbanViewMonth < 0) {
                this.kanbanViewMonth = 11;
                this.kanbanViewYear--;
            }
            this.render(container);
        };
        container.querySelector('#idBTNCalNextMonth').onclick = () => {
            this.kanbanViewMonth++;
            if (this.kanbanViewMonth > 11) {
                this.kanbanViewMonth = 0;
                this.kanbanViewYear++;
            }
            this.render(container);
        };
        container.querySelector('#idBTNCalToday').onclick = () => {
            this.currentKanbanDate = new Date();
            this.kanbanViewYear = this.currentKanbanDate.getFullYear();
            this.kanbanViewMonth = this.currentKanbanDate.getMonth();
            this.render(container);
        };
    }
}

// 自动注册当前 Widget
window.gWidgetManager.register(new CalendarWidget());
