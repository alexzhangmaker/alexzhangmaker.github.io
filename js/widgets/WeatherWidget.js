/**
 * WeatherWidget - 多城市天气关注与管理 Widget (基于 Open-Meteo 开放 API)
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
            description: '基于 Open-Meteo 开放 API 支持多城市天气预报、城市切换及自定义关注城市列表',
            enabled: true,
            gridSize: 'bento-span-4' // Bento 架构: 4/12 (1/3 宽度)
        });

        this.cities = [];
        this.activeCityId = 'bangkok';
        this.weatherCache = new Map(); // city.id -> weatherData
        this.loadCityConfig();
    }

    // 读取关注城市列表与当前选中城市
    loadCityConfig() {
        try {
            const rawCities = localStorage.getItem('weather_widget_cities');
            this.cities = rawCities ? JSON.parse(rawCities) : [...DEFAULT_WEATHER_CITIES];
            const rawActiveId = localStorage.getItem('weather_widget_active_city');
            this.activeCityId = rawActiveId || (this.cities[0] ? this.cities[0].id : 'bangkok');
        } catch (e) {
            this.cities = [...DEFAULT_WEATHER_CITIES];
            this.activeCityId = 'bangkok';
        }
    }

    // 保存关注城市配置
    saveCityConfig() {
        localStorage.setItem('weather_widget_cities', JSON.stringify(this.cities));
        localStorage.setItem('weather_widget_active_city', this.activeCityId);
    }

    getWeatherIconAndDesc(code) {
        const map = {
            0: { icon: '☀️', desc: '晴朗' },
            1: { icon: '🌤️', desc: '晴间多云' },
            2: { icon: '⛅', desc: '多云' },
            3: { icon: '☁️', desc: '阴天' },
            45: { icon: '🌫️', desc: '有雾' },
            48: { icon: '🌫️', desc: '淞雾' },
            51: { icon: '🌦️', desc: '细雨' },
            53: { icon: '🌧️', desc: '中雨' },
            55: { icon: '🌧️', desc: '大雨' },
            61: { icon: '🌧️', desc: '小雨' },
            63: { icon: '🌧️', desc: '中雨' },
            65: { icon: '⛈️', desc: '暴雨' },
            71: { icon: '🌨️', desc: '小雪' },
            73: { icon: '🌨️', desc: '中雪' },
            75: { icon: '❄️', desc: '大雪' },
            95: { icon: '⚡', desc: '雷阵雨' },
            96: { icon: '⛈️', desc: '雷阵雨伴有冰雹' }
        };
        return map[code] || { icon: '🌤️', desc: '多云' };
    }

    async fetchWeatherData(lat, lng) {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current_weather=true&daily=temperature_2m_max,temperature_2m_min,weathercode&timezone=auto`;
        const res = await fetch(url);
        return await res.json();
    }

    async getCityWeather(city) {
        if (this.weatherCache.has(city.id)) {
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

        // 当前激活的城市
        let currentCity = this.cities.find(c => c.id === this.activeCityId);
        if (!currentCity && this.cities.length > 0) {
            currentCity = this.cities[0];
            this.activeCityId = currentCity.id;
        }

        // 构建 Header 栏 (左: 标题, 右: ⚙️ 设置按钮)
        container.innerHTML = `
            <div class="flex items-center justify-between pb-2 border-b border-gray-100">
                <div class="flex items-center gap-2">
                    <span class="text-base">🌤️</span>
                    <span class="font-extrabold text-gray-800 text-xs">实时天气</span>
                </div>
                <div class="flex items-center gap-1.5">
                    <button id="idBTNWeatherSettings" class="w-7 h-7 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-gray-100 transition-all flex items-center justify-center text-xs" title="管理关注城市">
                        <i class="fas fa-cog"></i>
                    </button>
                </div>
            </div>

            <!-- 天气主界面区域 -->
            <div id="idWeatherBody" class="py-1 min-h-[85px] flex items-center justify-center">
                <span class="text-xs text-gray-400">正在拉取 ${currentCity ? currentCity.name : ''} 天气...</span>
            </div>

            <!-- 关注城市快速切换 Chips 标签栏 -->
            <div id="idWeatherCityChips" class="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs pt-1 border-t border-dashed border-gray-100 no-scrollbar"></div>
        `;

        // 渲染城市 Chips 标签
        const chipsContainer = container.querySelector('#idWeatherCityChips');
        this.cities.forEach(city => {
            const isActive = city.id === this.activeCityId;
            const chip = document.createElement('button');
            chip.className = `px-2.5 py-1 rounded-full text-[11px] font-bold whitespace-nowrap transition-all select-none ${
                isActive 
                ? 'bg-indigo-600 text-white shadow-sm scale-105' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`;
            chip.textContent = city.name;
            chip.onclick = async () => {
                this.activeCityId = city.id;
                this.saveCityConfig();
                await this.render(container);
            };
            chipsContainer.appendChild(chip);
        });

        // 绑定 Setting 按钮点击事件，弹出 Modal
        container.querySelector('#idBTNWeatherSettings').onclick = () => {
            this.openWeatherSettingsModal(container);
        };

        // 获取并渲染天气数据
        if (currentCity) {
            const weatherData = await this.getCityWeather(currentCity);
            const body = container.querySelector('#idWeatherBody');
            if (!body) return;

            if (weatherData && weatherData.current_weather) {
                const cw = weatherData.current_weather;
                const info = this.getWeatherIconAndDesc(cw.weathercode);
                const temp = Math.round(cw.temperature);
                const wind = cw.windspeed;

                let dailyHtml = '';
                if (weatherData.daily && weatherData.daily.temperature_2m_max) {
                    const maxT = Math.round(weatherData.daily.temperature_2m_max[0]);
                    const minT = Math.round(weatherData.daily.temperature_2m_min[0]);
                    dailyHtml = `<span class="text-[11px] font-semibold text-gray-400">${minT}°C ~ ${maxT}°C</span>`;
                }

                body.innerHTML = `
                    <div class="w-full flex items-center justify-between px-1">
                        <div class="flex items-center gap-3">
                            <span class="text-4xl">${info.icon}</span>
                            <div>
                                <div class="flex items-center gap-1.5">
                                    <span class="text-2xl font-black text-gray-800">${temp}°C</span>
                                    <span class="text-[11px] font-extrabold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded-md">${currentCity.name}</span>
                                </div>
                                <div class="text-xs font-bold text-gray-500">${info.desc}</div>
                            </div>
                        </div>
                        <div class="text-right space-y-1">
                            ${dailyHtml}
                            <div class="text-[10px] text-gray-400">风速: ${wind} km/h</div>
                        </div>
                    </div>
                `;
            } else {
                body.innerHTML = `<span class="text-xs text-red-400">网络开小差了，无法获取 ${currentCity.name} 天气</span>`;
            }
        }
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
                    if (this.activeCityId === cId) {
                        this.activeCityId = this.cities[0].id;
                    }
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
