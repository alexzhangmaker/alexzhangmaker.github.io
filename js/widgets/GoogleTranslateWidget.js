/**
 * GoogleTranslateWidget - Google 翻译即时工具组件 (Bento Grid 4/12 占比)
 */
class GoogleTranslateWidget extends BaseWidget {
    constructor() {
        super({
            id: 'widget-translate',
            name: 'Google 翻译小工具',
            icon: '🔤',
            description: '提供多语种即时文本翻译工具（基于公共翻译接口 API）',
            enabled: false, // 默认关闭，用户可在系统设置中自由开启
            gridSize: 'bento-span-4' // Bento 架构: 占据 4/12 宽度 (1/3)
        });
    }

    async render(container) {
        container.className = "w-full min-w-0 bg-white rounded-2xl p-5 shadow-sm border border-gray-100 space-y-3";

        container.innerHTML = `
            <div class="flex items-center justify-between pb-2 border-b border-gray-100">
                <div class="flex items-center gap-2">
                    <span class="text-base">🔤</span>
                    <span class="font-bold text-gray-800 text-xs">即时翻译 (Google API)</span>
                </div>
                <span class="text-[10px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">中 ⇄ 英</span>
            </div>

            <textarea id="idTranslateInput" placeholder="输入需要翻译的文本..." class="w-full h-16 text-xs p-2.5 border border-gray-200 rounded-xl outline-none focus:border-indigo-400 resize-none"></textarea>

            <button id="idBTNTranslateDo" class="w-full py-1.5 rounded-xl text-white font-bold text-xs shadow-sm hover:shadow transition-all flex items-center justify-center gap-1" style="background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);">
                <i class="fas fa-language"></i> 开始翻译
            </button>

            <div id="idTranslateResult" class="hidden text-xs p-2.5 bg-indigo-50/70 border border-indigo-100 text-indigo-950 rounded-xl break-all"></div>
        `;

        const input = container.querySelector('#idTranslateInput');
        const btn = container.querySelector('#idBTNTranslateDo');
        const result = container.querySelector('#idTranslateResult');

        btn.onclick = async () => {
            const text = input.value.trim();
            if (!text) return;
            btn.innerText = "翻译中...";
            result.classList.remove('hidden');
            result.innerHTML = `<span class="text-gray-400">正在调用翻译接口...</span>`;

            try {
                // 使用公共 API 模拟翻译
                const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=zh-CN&dt=t&q=${encodeURIComponent(text)}`;
                const res = await fetch(url);
                const data = await res.json();
                if (data && data[0] && data[0][0] && data[0][0][0]) {
                    const translatedText = data[0].map(item => item[0]).join('');
                    result.innerHTML = `<span class="font-bold text-indigo-700">译文：</span> ${translatedText}`;
                } else {
                    result.innerHTML = `<span class="text-red-500">翻译接口未返回结果</span>`;
                }
            } catch (err) {
                result.innerHTML = `<span class="text-red-500">翻译请求失败: ${err.message}</span>`;
            } finally {
                btn.innerHTML = `<i class="fas fa-language"></i> 开始翻译`;
            }
        };
    }
}

// 自动注册当前 Widget
window.gWidgetManager.register(new GoogleTranslateWidget());
