import { getDefaultLocation, getHourlyForecast } from '../js/weatherapi.js';

class HourlyConditions extends HTMLElement {
  async connectedCallback() {
    await this.updateForecast();
  }

  async updateForecast() {
    const container = this.querySelector('div');
    if (!container) return;

    container.innerHTML = '';

    try {
      const { lat, lng } = await getDefaultLocation();
      const data = await getHourlyForecast(lat, lng);
      const forecast = data.forecastHours.slice(0, 6); // or more if needed

      forecast.forEach(hour => {
        const displayHour = `${String(hour.displayDateTime.hours).padStart(2, '0')}:00`;
        const temp = `${Math.round(hour.temperature.degrees)}°C`;
        const wind = `${hour.wind.speed.value} km/h`;
        const rain = `${hour.precipitation.probability.percent}%`;
        const icon = `${hour.weatherCondition.iconBaseUri}?w=48&h=48`;
        const description = hour.weatherCondition.description.text;

        const card = document.createElement('div');
        card.className = 'card shrink-0 snap-start w-[70vw] sm:w-[22vw] text-center text-white flex flex-col items-center gap-1 py-2';


        card.innerHTML = `
          <div class="text-xs">${displayHour}</div>
          <img src="${icon}" alt="${description}" class="w-5 h-5" />
          <div class="text-sm font-semibold">${temp}</div>
          <div class="text-xs">💨 ${wind}</div>
          <div class="text-xs">🌧️ ${rain}</div>
        `;

        container.appendChild(card);
      });

    } catch (err) {
      console.error('Failed to load hourly forecast:', err);
      container.innerHTML = '<p class="text-secondary">Hourly forecast unavailable.</p>';
    }
  }
}

customElements.define('hourly-conditions', HourlyConditions);
