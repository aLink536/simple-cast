import { getCurrentConditions, getDefaultLocation } from '../js/weatherapi.js';
import { updateLucideIcon } from '../js/main.js';

class CurrentConditions extends HTMLElement {
  async connectedCallback() {
    await this.updateConditions(); // Initial load

    // ⏱ Wait until the start of the next full minute
    const now = new Date();
    const msToNextMinute = (60 - now.getSeconds()) * 1000;

    this._syncTimeout = setTimeout(() => {
      this.updateConditions(); // Sync update

      // 🔁 Continue updating every minute
      this._interval = setInterval(() => this.updateConditions(), 60000);
    }, msToNextMinute);
  }

  disconnectedCallback() {
    clearTimeout(this._syncTimeout);
    clearInterval(this._interval);
  }

  async updateConditions() {
    const { lat, lng, name, country } = await getDefaultLocation();

    try {
      const data = await getCurrentConditions(lat, lng);

      this.querySelector('.cc--temp').textContent = `${data.temperature.degrees}°C`;
      this.querySelector('.cc--weather').textContent = data.weatherCondition.description.text;
      this.querySelector('.cc--feels-like').textContent = `Feels like: ${data.feelsLikeTemperature.degrees}°C`;
      this.querySelector('.cc--high-low').textContent = `High: ${data.currentConditionsHistory.maxTemperature.degrees}°  Low: ${data.currentConditionsHistory.minTemperature.degrees}°`;
      this.querySelector('.cc--wind').textContent = `Wind: ${data.wind.speed.value} km/h`;
      this.querySelector('.cc--air-pressure').textContent = `AP: ${Math.round(data.airPressure.meanSeaLevelMillibars)} hPa`;
      this.querySelector('.cc--humidity').textContent = `Humidity: ${data.relativeHumidity}%`;

      // Format local time at weather location
      const utcTime = new Date(data.currentTime);
      const timeZone = data.timeZone.id;
      const formattedTime = new Intl.DateTimeFormat('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
        timeZone,
      }).format(utcTime);

      this.querySelector('.cc--time').childNodes[0].textContent = `${formattedTime} `;

      const iconName = data.isDaytime ? 'sun' : 'moon';
      const iconEl = this.querySelector('.cc--time-icon');
      if (iconEl) {
        iconEl.setAttribute('data-lucide', iconName);
        iconEl.innerHTML = '';
        lucide.createIcons({ icons: lucide.icons, nameAttr: 'data-lucide' });
      }

      this.querySelector('.cc-location').textContent = `${name}: `;
      this.querySelector('.cc-country').textContent = country;

    } catch (err) {
      console.error('Failed to load weather data:', err);
      this.querySelector('.cc--weather').textContent = 'Unavailable';
    }
  }
}

customElements.define('current-conditions', CurrentConditions);
