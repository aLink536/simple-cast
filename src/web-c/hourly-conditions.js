import { getDefaultLocation, getHourlyForecast } from '../js/weatherapi.js';
import { mapWeatherToLucideIcon } from '../js/main.js';

class HourlyConditions extends HTMLElement {
  async connectedCallback() {
    await this.updateForecast();
  }

  async updateForecast() {
    const container = this.querySelector('.forecast-row');
    if (!container) return;

    container.innerHTML = '';

    try {
      const { lat, lng } = await getDefaultLocation();
      const data = await getHourlyForecast(lat, lng);
      const forecast = (data.forecastHours || []).slice(0, 24);

      if (forecast.length === 0) throw new Error('No forecast data available.');

      forecast.forEach(hour => {
        const displayHour = `${String(hour.displayDateTime.hours).padStart(2, '0')}:00`;
        const temp = `${Math.round(hour.temperature.degrees)}°C`;
        const wind = `${hour.wind.speed.value} km/h`;
        const rain = `${hour.precipitation.probability.percent}%`;
        const description = hour.weatherCondition.description.text;
        const iconName = mapWeatherToLucideIcon(hour.weatherCondition.type, hour.isDaytime);

        const item = document.createElement('div');
        item.className = 'min-w-[4.5rem] flex-shrink-0 text-center text-white flex flex-col items-center gap-1';

        item.innerHTML = `
          <div class="text-xs">${displayHour}</div>
          <i data-lucide="${iconName}" class="w-5 h-5"></i>
          <div class="text-sm font-semibold">${temp}</div>
          <div class="text-xs">💨 ${wind}</div>
          <div class="text-xs">🌧️ ${rain}</div>
        `;

        container.appendChild(item);
      });

      // Trigger Lucide to render new icons
      lucide.createIcons({ icons: lucide.icons, nameAttr: 'data-lucide' });

    } catch (err) {
      console.error('Failed to load hourly forecast:', err);
      container.innerHTML = '<p class="text-secondary text-sm">Hourly forecast unavailable.</p>';
    }
  }
}

customElements.define('hourly-conditions', HourlyConditions);
