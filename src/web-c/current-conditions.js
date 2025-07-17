import { getCurrentConditions, getDefaultLocation } from '../js/weatherapi.js';
import { updateLucideIcon, mapWeatherToLucideIcon } from '../js/main.js';

class CurrentConditions extends HTMLElement {
  connectedCallback() {
    this.updateConditions(); // Initial load
    this._onMinuteTick = () => this.updateConditions();
    window.addEventListener('minute-tick', this._onMinuteTick);
  }

  disconnectedCallback() {
    window.removeEventListener('minute-tick', this._onMinuteTick);
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

      const humidity = data.relativeHumidity;
      this.querySelector('.cc--humidity').textContent = `Humidity: ${humidity}%`;

      const humidityCard = this.querySelector('.cc--humidity-card');
      if (humidityCard) {
        let fillColor = '';
        let fadeColor = '';

        if (humidity < 30) {
          fillColor = '#2a4155'; // very subtle blue-tinted slate
          fadeColor = 'rgba(42, 65, 85, 0.2)';
        } else if (humidity < 60) {
          fillColor = '#2f4b60'; // slightly lighter
          fadeColor = 'rgba(47, 75, 96, 0.2)';
        } else if (humidity < 80) {
          fillColor = '#34546a';
          fadeColor = 'rgba(52, 84, 106, 0.2)';
        } else {
          fillColor = '#3a5e75';
          fadeColor = 'rgba(58, 94, 117, 0.2)';
        }


        const topFadeStart = humidity;
        const topFadeEnd = Math.min(humidity + 0, 100);

        const gradient = `linear-gradient(to top,
    ${fillColor} 0%,
    ${fillColor} ${topFadeStart}%,
    ${fadeColor} ${topFadeEnd}%,
    #21384A ${topFadeEnd}%
  )`;

        humidityCard.style.background = gradient;
        humidityCard.style.color = '#fff';
        humidityCard.style.transition = 'background 0.5s ease-in-out';
      }


      // Rotate the wind direction arrow (cc-direction)
      const directionDegrees = data.wind.direction.degrees; // e.g., 335
      const arrowEl = this.querySelector('.cc-direction');
      if (arrowEl) {
        // Wind is coming *from* this direction — so point the arrow TO it
        arrowEl.style.transform = `rotate(${(directionDegrees + 180) % 360}deg)`;
      }

      // Format local time at weather location
      const utcTime = new Date(data.currentTime);
      const timeZone = data.timeZone.id;
      const formattedTime = new Intl.DateTimeFormat('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
        timeZone,
      }).format(utcTime);

      // Update time label
      this.querySelector('.cc--time').childNodes[0].textContent = `${formattedTime} `;

      // Use Lucide icon based on actual weather condition
      const iconName = mapWeatherToLucideIcon(data.weatherCondition.type, data.isDaytime);
      const iconEl = this.querySelector('.cc--time-icon');
      if (iconEl) {
        iconEl.setAttribute('data-lucide', iconName);
        iconEl.innerHTML = '';
        lucide.createIcons({ icons: lucide.icons, nameAttr: 'data-lucide' });
      }

      this.querySelector('.cc-location').textContent = `${name}`;
      this.querySelector('.cc-country').textContent = country;

    } catch (err) {
      console.error('Failed to load weather data:', err);
      this.querySelector('.cc--weather').textContent = 'Unavailable';
    }
  }
}

customElements.define('current-conditions', CurrentConditions);
