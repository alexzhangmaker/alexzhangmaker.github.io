/**
 * WeatherWidget - 多城市天气关注与管理 Widget (基于 Open-Meteo 开放 API)
 * 采用城市天气列表形式展示各个城市的实时温度、天气状况、风速及高低温范围
 */

const DEFAULT_WEATHER_CITIES = [
    { id: 'bangkok', name: 'Bangkok (曼谷)', lat: 13.7563, lng: 100.5018 },
    { id: 'chiangmai', name: '清迈 (Chiang Mai)', lat: 18.7883, lng: 98.9853 },
    { id: 'shenzhen', name: '中国深圳', lat: 22.5431, lng: 114.0579 },
    { id: 'chengdu', name: '中国成都', lat: 30.5728, lng: 104.0668 },
    { id: 'xichang', name: '中国西昌', lat: 27.8950, lng: 102.2638 },
    { id: 'kunming', name: '中国昆明', lat: 24.8801, lng: 102.8329 }
];

const PRESET_CANDIDATE_CITIES = [
    ...DEFAULT_WEATHER_CITIES,
    { id: 'beijing', name: '中国北京', lat: 39.9042, lng: 116.4074 },
    { id: 'shanghai', name: '中国上海', lat: 31.2304, lng: 121.4737 },
    { id: 'guangzhou', name: '中国广州', lat: 23.1291, lng: 113.2644 },
    { id: 'hongkong', name: '中国香港', lat: 22.3193, lng: 114.1694 },
    { id: 'taipei', name: '中国台北', lat: 25.0330, lng: 121.5654 },
    { id: 'tokyo', name: '日本东京 (Tokyo)', lat: 35.6762, lng: 139.6503 },
    { id: 'singapore', name: '新加坡 (Singapore)', lat: 1.3521, lng: 103.8198 },
    { id: 'london', name: '英国伦敦 (London)', lat: 51.5074, lng: -0.1278 },
    { id: 'newyork', name: '美国纽约 (New York)', lat: 40.7128, lng: -74.0060 }
];

class WeatherWidget extends BaseWidget {
    constructor() {
        super({
            id: 'widget-weather',
            name: 'Weather 实时天气',
            icon: '🌤️',
            description: '基于 Open-Meteo 开放 API 支持多城市天气列表展示、实时更新及关注城市管理',
            enabled: true,
            gridSize: 'bento-span-4' // Bento 架构: 4/12 (1/3 宽度)
        });

        this.cities = [];
        this.weatherCache = new Map(); // city.id -> weatherData
        this.lastUpdateTime = null;
        this.loadCityConfig();
    }

    // 读取关注城市列表
    loadCityConfig() {
        try {
            const rawCities = localStorage.getItem('weather_widget_cities');
            this.cities = rawCities ? JSON.parse(rawCities) : [...DEFAULT_WEATHER_CITIES];
        } catch (e) {
            this.cities = [...DEFAULT_WEATHER_CITIES];
        }
    }

    // 保存关注城市配置
    saveCityConfig() {
        localStorage.setItem('weather_widget_cities', JSON.stringify(this.cities));
    }

    getWeatherIconAndDesc(code) {
        const map = {
            0: { icon: '☀️', desc: '晴朗' },
            1: { icon: '🌤️', desc: '晴间多云' },
            2: { icon: '⛅', desc: '多云' },
            3: { icon: '☁️', desc: '阴天' },
            45: { icon: '🌫️', desc: '有雾' },
            48: { icon: '🌫️', desc: '雾淞' },
            51: { icon: '🌦️', desc: '毛毛细雨' },
            53: { icon: '🌧️', desc: '细雨' },
            55: { icon: '🌧️', desc: '小雨' },
            56: { icon: '🌧️', desc: '冻雨' },
            57: { icon: '🌧️', desc: '中冻雨' },
            61: { icon: '🌧️', desc: '小雨' },
            63: { icon: '🌧️', desc: '中雨' },
            65: { icon: '⛈️', desc: '大雨' },
            66: { icon: '🌨️', desc: '冻雨' },
            67: { icon: '🌨️', desc: '强冻雨' },
            71: { icon: '🌨️', desc: '小雪' },
            73: { icon: '🌨️', desc: '中雪' },
            75: { icon: '❄️', desc: '大雪' },
            77: { icon: '🌨️', desc: '雪粒' },
            80: { icon: '🌧️', desc: '阵雨' },
            81: { icon: '🌧️', desc: '中度阵雨' },
            82: { icon: '⛈️', desc: '强阵雨' },
            85: { icon: '🌨️', desc: '小阵雪' },
            86: { icon: '🌨️', desc: '大阵雪' },
            95: { icon: '⚡', desc: '雷阵雨' },
            96: { icon: '⛈️', desc: '雷阵雨伴冰雹' },
            99: { icon: '⛈️', desc: '强雷雨伴冰雹' }
        };
        return map[code] || { icon: '🌤️', desc: '多云' };
    }

    async fetchWeatherData(lat, lng) {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current_weather=true&daily=temperature_2m_max,temperature_2m_min,weathercode&timezone=auto`;
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 6000);
        try {
            const res = await fetch(url, { signal: controller.signal });
            clearTimeout(timer);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            return await res.json();
        } catch (err) {
            clearTimeout(timer);
            throw err;
        }
    }

    async getCityWeather(city, forceRefresh = false) {
        if (!forceRefresh && this.weatherCache.has(city.id)) {
            return this.weatherCache.get(city.id);
        }
        try {
            const data = await this.fetchWeatherData(city.lat, city.lng);
            this.weatherCache.set(city.id, data);
            return data;
        } catch (err) {
            console.warn(`获取城市 ${city.name} 天气失败:`, err);
            return null;
        }
    }

    async render(container) {
        container.className = "w-full min-w-0 bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col space-y-3";

        const updateTimeStr = this.lastUpdateTime ? `更新于 ${this.lastUpdateTime}` : '实时同步中';

        // 构建 Header 栏 (左: 标题 + 城市数, 右: 🔄 刷新 + ⚙️ 设置按钮)
        container.innerHTML = `
            <div class="flex items-center justify-between pb-2 border-b border-gray-100">
                <div class="flex items-center gap-2">
                    <span class="text-base">🌤️</span>
                    <span class="font-extrabold text-gray-800 text-xs">实时天气</span>
                    <span class="text-[10px] font-extrabold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">${this.cities.length}</span>
                </div>
                <div class="flex items-center gap-1.5">
                    <button id="idBTNWeatherRefresh" class="w-7 h-7 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all flex items-center justify-center text-xs" title="刷新天气数据">
                        <i class="fas fa-sync-alt text-[11px]"></i>
                    </button>
                    <button id="idBTNWeatherSettings" class="w-7 h-7 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-gray-100 transition-all flex items-center justify-center text-xs" title="管理关注城市">
                        <i class="fas fa-cog text-[11px]"></i>
                    </button>
                </div>
            </div>

            <!-- 城市天气列表展示区域 -->
            <div id="idWeatherList" class="space-y-2 max-h-[300px] overflow-y-auto pr-0.5 select-none">
                ${this.cities.map(c => `
                    <div class="flex items-center justify-between p-2.5 rounded-xl bg-gray-50/80 border border-gray-100/80 animate-pulse">
                        <div class="flex items-center gap-2.5">
                            <div class="w-7 h-7 bg-gray-200 rounded-lg"></div>
                            <div class="space-y-1.5">
                                <div class="w-20 h-3 bg-gray-200 rounded"></div>
                                <div class="w-14 h-2 bg-gray-200 rounded"></div>
                            </div>
                        </div>
                        <div class="space-y-1 text-right">
                            <div class="w-10 h-4 bg-gray-200 rounded ml-auto"></div>
                            <div class="w-12 h-2 bg-gray-200 rounded ml-auto"></div>
                        </div>
                    </div>
                `).join('')}
            </div>

            <!-- 底部状态栏 -->
            <div class="flex items-center justify-between text-[10px] text-gray-400 border-t border-dashed border-gray-100 pt-2">
                <span>已关注 ${this.cities.length} 个城市</span>
                <span id="idWeatherUpdateTime">${updateTimeStr}</span>
            </div>
        `;

        const listContainer = container.querySelector('#idWeatherList');
        const updateTimeEl = container.querySelector('#idWeatherUpdateTime');
        const btnRefresh = container.querySelector('#idBTNWeatherRefresh');
        const btnSettings = container.querySelector('#idBTNWeatherSettings');

        // 绑定 Setting 按钮点击事件，弹出 Modal
        if (btnSettings) {
            btnSettings.onclick = () => {
                this.openWeatherSettingsModal(container);
            };
        }

        // 异步批量拉取所有城市天气并更新列表 UI
        const fetchAndUpdateList = async (forceRefresh = false) => {
            const spinIcon = btnRefresh ? btnRefresh.querySelector('i') : null;
            if (spinIcon) spinIcon.classList.add('animate-spin');

            const weatherResults = await Promise.all(
                this.cities.map(city => this.getCityWeather(city, forceRefresh))
            );

            if (spinIcon) spinIcon.classList.remove('animate-spin');

            const now = new Date();
            const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
            this.lastUpdateTime = timeStr;
            if (updateTimeEl) {
                updateTimeEl.textContent = `更新于 ${timeStr}`;
            }

            if (!listContainer) return;
            listContainer.innerHTML = '';

            if (this.cities.length === 0) {
                listContainer.innerHTML = `
                    <div class="text-center py-6 text-xs text-gray-400 space-y-2">
                        <div class="text-2xl">🌍</div>
                        <div>暂未添加关注城市</div>
                    </div>
                `;
                return;
            }

            this.cities.forEach((city, index) => {
                const weatherData = weatherResults[index];
                const row = document.createElement('div');

                if (weatherData && weatherData.current_weather) {
                    const cw = weatherData.current_weather;
                    const info = this.getWeatherIconAndDesc(cw.weathercode);
                    const temp = Math.round(cw.temperature);
                    const wind = cw.windspeed;

                    let dailyHtml = '';
                    if (weatherData.daily && weatherData.daily.temperature_2m_max) {
                        const maxT = Math.round(weatherData.daily.temperature_2m_max[0]);
                        const minT = Math.round(weatherData.daily.temperature_2m_min[0]);
                        dailyHtml = `<span class="text-[10px] font-semibold text-gray-400 block">${minT}° ~ ${maxT}°C</span>`;
                    }

                    row.className = "flex items-center justify-between p-2.5 rounded-xl bg-gray-50/80 hover:bg-indigo-50/40 border border-gray-100/80 hover:border-indigo-100 transition-all duration-200 group";
                    row.innerHTML = `
                        <div class="flex items-center gap-2.5 min-w-0">
                            <span class="text-2xl shrink-0 leading-none select-none">${info.icon}</span>
                            <div class="min-w-0">
                                <div class="font-bold text-gray-800 text-xs truncate group-hover:text-indigo-600 transition-colors">${city.name}</div>
                                <div class="text-[11px] text-gray-500 font-medium flex items-center gap-1.5 mt-0.5">
                                    <span class="text-indigo-600 font-semibold">${info.desc}</span>
                                    <span class="text-gray-300">·</span>
                                    <span class="text-gray-400 text-[10px]">风速 ${wind} km/h</span>
                                </div>
                            </div>
                        </div>
                        <div class="text-right shrink-0">
                            <div class="text-sm font-black text-gray-800 tracking-tight">${temp}°C</div>
                            ${dailyHtml}
                        </div>
                    `;
                } else {
                    row.className = "flex items-center justify-between p-2.5 rounded-xl bg-gray-50 border border-gray-100";
                    row.innerHTML = `
                        <div class="flex items-center gap-2 min-w-0">
                            <span class="text-sm text-gray-400">⚠️</span>
                            <span class="font-bold text-gray-700 text-xs truncate">${city.name}</span>
                        </div>
                        <span class="text-[10px] text-red-400 font-semibold">获取失败</span>
                    `;
                }

                listContainer.appendChild(row);
            });
        };

        // 绑定刷新按钮事件
        if (btnRefresh) {
            btnRefresh.onclick = async () => {
                this.weatherCache.clear();
                await fetchAndUpdateList(true);
            };
        }

        // 立即执行天气获取与渲染
        await fetchAndUpdateList(false);
    }

    // 关注城市管理 Modal
    openWeatherSettingsModal(widgetContainer) {
        const modalOverlay = document.createElement('div');
        modalOverlay.className = "fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4";

        const updateModalBody = () => {
            // 筛选尚未关注的预设候选城市
            const unaddedPresets = PRESET_CANDIDATE_CITIES.filter(
                preset => !this.cities.some(c => c.id === preset.id)
            );

            let citiesListHtml = '';
            this.cities.forEach((c, idx) => {
                const isOnlyOne = this.cities.length <= 1;
                citiesListHtml += `
                    <div class="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-200/80">
                        <div class="flex items-center gap-2">
                            <span class="font-bold text-gray-800 text-xs">${idx + 1}. ${c.name}</span>
                            <span class="text-[10px] text-gray-400">(${c.lat}, ${c.lng})</span>
                        </div>
                        <div class="flex items-center gap-2">
                            <button class="btn-delete-city text-xs text-red-500 hover:text-red-700 p-1 rounded transition-colors ${isOnlyOne ? 'opacity-30 cursor-not-allowed' : ''}" data-city-id="${c.id}" ${isOnlyOne ? 'disabled' : ''} title="从关注列表移除">
                                <i class="fas fa-trash-alt"></i>
                            </button>
                        </div>
                    </div>
                `;
            });

            let presetOptionsHtml = `<option value="">-- 选择预设城市 --</option>`;
            unaddedPresets.forEach(p => {
                presetOptionsHtml += `<option value="${p.id}">${p.name}</option>`;
            });

            modalOverlay.innerHTML = `
                <div class="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-gray-100 animate-fade-in">
                    <div class="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                        <div class="flex items-center gap-2">
                            <span class="text-lg">⚙️</span>
                            <h3 class="font-extrabold text-gray-800 text-base">关注城市列表管理</h3>
                        </div>
                        <button id="idBTNCloseWeatherModal" class="text-gray-400 hover:text-gray-600 p-1 rounded-lg transition-colors">
                            <i class="fas fa-times text-base"></i>
                        </button>
                    </div>

                    <div class="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                        <!-- 已关注城市 -->
                        <div>
                            <div class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">已关注城市 (${this.cities.length})</div>
                            <div class="space-y-2">
                                ${citiesListHtml}
                            </div>
                        </div>

                        <!-- 快速添加候选城市 -->
                        <div class="pt-3 border-t border-gray-100 space-y-3">
                            <div class="text-xs font-bold text-gray-400 uppercase tracking-wider">快捷添加预设城市</div>
                            <div class="flex items-center gap-2">
                                <select id="idSelectPresetCity" class="flex-1 text-xs p-2.5 border border-gray-200 rounded-xl outline-none focus:border-indigo-400 bg-white font-medium text-gray-700">
                                    ${presetOptionsHtml}
                                </select>
                                <button id="idBTNAddPresetCity" class="px-3.5 py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-700 transition-all whitespace-nowrap">
                                    + 添加
                                </button>
                            </div>
                        </div>

                        <!-- 自定义经纬度城市添加 -->
                        <div class="pt-3 border-t border-dashed border-gray-200 space-y-2">
                            <div class="text-xs font-bold text-gray-400 uppercase tracking-wider">自定义输入经纬度城市</div>
                            <input type="text" id="idCustomCityName" placeholder="城市名称 (如: 日本京都)" class="w-full text-xs p-2 border border-gray-200 rounded-lg outline-none focus:border-indigo-400">
                            <div class="grid grid-cols-2 gap-2">
                                <input type="number" step="0.0001" id="idCustomCityLat" placeholder="纬度 (Lat)" class="w-full text-xs p-2 border border-gray-200 rounded-lg outline-none focus:border-indigo-400">
                                <input type="number" step="0.0001" id="idCustomCityLng" placeholder="经度 (Lng)" class="w-full text-xs p-2 border border-gray-200 rounded-lg outline-none focus:border-indigo-400">
                            </div>
                            <button id="idBTNAddCustomCity" class="w-full py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs transition-all">
                                + 添加自定义城市
                            </button>
                        </div>
                    </div>

                    <div class="px-6 py-3.5 bg-gray-50 border-t border-gray-100 flex items-center justify-end gap-2">
                        <button id="idBTNSaveWeatherSettings" class="px-5 py-2 rounded-xl text-white font-bold text-xs shadow-md transition-all hover:shadow-lg" style="background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);">
                            完成设置
                        </button>
                    </div>
                </div>
            `;

            // 删除城市事件绑定
            modalOverlay.querySelectorAll('.btn-delete-city').forEach(btn => {
                btn.onclick = () => {
                    const cId = btn.dataset.cityId;
                    if (this.cities.length <= 1) {
                        alert("请至少保留一个关注城市");
                        return;
                    }
                    this.cities = this.cities.filter(c => c.id !== cId);
                    updateModalBody();
                };
            });

            // 添加预设城市
            modalOverlay.querySelector('#idBTNAddPresetCity').onclick = () => {
                const select = modalOverlay.querySelector('#idSelectPresetCity');
                const pId = select.value;
                if (!pId) return;
                const preset = PRESET_CANDIDATE_CITIES.find(p => p.id === pId);
                if (preset) {
                    this.cities.push({ ...preset });
                    updateModalBody();
                }
            };

            // 添加自定义城市
            modalOverlay.querySelector('#idBTNAddCustomCity').onclick = () => {
                const name = modalOverlay.querySelector('#idCustomCityName').value.trim();
                const lat = parseFloat(modalOverlay.querySelector('#idCustomCityLat').value);
                const lng = parseFloat(modalOverlay.querySelector('#idCustomCityLng').value);

                if (!name || isNaN(lat) || isNaN(lng)) {
                    alert("请正确填写城市名称及有效经纬度");
                    return;
                }

                const newCustomCity = {
                    id: 'custom-' + Date.now(),
                    name: name,
                    lat: lat,
                    lng: lng
                };
                this.cities.push(newCustomCity);
                updateModalBody();
            };

            // 关闭按钮
            modalOverlay.querySelector('#idBTNCloseWeatherModal').onclick = () => {
                document.body.removeChild(modalOverlay);
            };

            // 保存完成设置按钮
            modalOverlay.querySelector('#idBTNSaveWeatherSettings').onclick = async () => {
                this.saveCityConfig();
                this.weatherCache.clear();
                document.body.removeChild(modalOverlay);
                await this.render(widgetContainer);
            };
        };

        updateModalBody();
        document.body.appendChild(modalOverlay);
    }
}

// 自动注册 Weather Widget
window.gWidgetManager.register(new WeatherWidget());
