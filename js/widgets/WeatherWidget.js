/**
 * WeatherWidget - 实时天气小工具 (基于 Open-Meteo 开放 API)
 */
class WeatherWidget extends BaseWidget {
    constructor() {
        super({
            id: 'widget-weather',
            name: 'Weather 实时天气',
            icon: '🌤️',
            description: '基于 Open-Meteo 开放 API 获取本地地理位置与实时天气预报（无需 API Key）',
            enabled: true,
            gridSize: 'bento-span-4' // Bento 架构: 4/12 (1/3 宽度)
        });

        this.weatherData = null;
        this.cityName = '本地';
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

    async autoLocateAndFetch() {
        return new Promise((resolve) => {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    async (pos) => {
                        try {
                            const lat = pos.coords.latitude;
                            const lng = pos.coords.longitude;
                            this.weatherData = await this.fetchWeatherData(lat, lng);
                            this.cityName = "当前位置";
                            resolve();
                        } catch (e) {
                            await this.fetchByIP(resolve);
                        }
                    },
                    async () => {
                        await this.fetchByIP(resolve);
                    },
                    { timeout: 4000 }
                );
            } else {
                this.fetchByIP(resolve);
            }
        });
    }

    async fetchByIP(resolve) {
        try {
            const ipRes = await fetch('https://ipapi.co/json/');
            const ipData = await ipRes.json();
            if (ipData && ipData.latitude && ipData.longitude) {
                this.cityName = ipData.city || ipData.region || '本地';
                this.weatherData = await this.fetchWeatherData(ipData.latitude, ipData.longitude);
            } else {
                this.cityName = "北京";
                this.weatherData = await this.fetchWeatherData(39.9042, 116.4074);
            }
        } catch (e) {
            this.cityName = "北京";
            try {
                this.weatherData = await this.fetchWeatherData(39.9042, 116.4074);
            } catch (err) {}
        }
        resolve();
    }

    async render(container) {
        container.className = "w-full min-w-0 bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col space-y-3";

        container.innerHTML = `
            <div class="flex items-center justify-between pb-2 border-b border-gray-100">
                <div class="flex items-center gap-2">
                    <span class="text-base">🌤️</span>
                    <span class="font-extrabold text-gray-800 text-xs">实时天气</span>
                </div>
                <span id="idWeatherCityBadge" class="text-[10px] text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded font-bold">${this.cityName}</span>
            </div>
            <div id="idWeatherBody" class="py-2 flex items-center justify-center">
                <span class="text-xs text-gray-400">正在获取本地天气数据...</span>
            </div>
        `;

        if (!this.weatherData) {
            await this.autoLocateAndFetch();
        }

        const body = container.querySelector('#idWeatherBody');
        const cityBadge = container.querySelector('#idWeatherCityBadge');
        cityBadge.textContent = this.cityName;

        if (this.weatherData && this.weatherData.current_weather) {
            const cw = this.weatherData.current_weather;
            const info = this.getWeatherIconAndDesc(cw.weathercode);
            const temp = Math.round(cw.temperature);
            const wind = cw.windspeed;

            let dailyHtml = '';
            if (this.weatherData.daily && this.weatherData.daily.temperature_2m_max) {
                const maxT = Math.round(this.weatherData.daily.temperature_2m_max[0]);
                const minT = Math.round(this.weatherData.daily.temperature_2m_min[0]);
                dailyHtml = `<span class="text-[11px] text-gray-400">${minT}°C ~ ${maxT}°C</span>`;
            }

            body.innerHTML = `
                <div class="w-full flex items-center justify-between px-2">
                    <div class="flex items-center gap-3">
                        <span class="text-4xl">${info.icon}</span>
                        <div>
                            <div class="text-2xl font-black text-gray-800">${temp}°C</div>
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
            body.innerHTML = `<span class="text-xs text-red-400">天气数据加载失败，请检查网络连接</span>`;
        }
    }
}

// 自动注册 Weather Widget
window.gWidgetManager.register(new WeatherWidget());
