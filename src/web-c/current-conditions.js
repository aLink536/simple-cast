import { getCurrentConditions, getDefaultLocation } from '../js/weatherapi.js';
import { updateLucideIcon } from '../js/main.js';

class CurrentConditions extends HTMLElement {
  async connectedCallback() {
    const { lat, lng, name } = await getDefaultLocation();

    getCurrentConditions(lat, lng)
      .then(data => {
        this.querySelector('.cc--temp').textContent = `${data.temperature.degrees}°C`;
        this.querySelector('.cc--weather').textContent = data.weatherCondition.description.text;
        this.querySelector('.cc--feels-like').textContent = `Feels like: ${data.feelsLikeTemperature.degrees}°C`;
        this.querySelector('.cc--high-low').textContent = `High: ${data.currentConditionsHistory.maxTemperature.degrees}°  Low: ${data.currentConditionsHistory.minTemperature.degrees}°`;
        this.querySelector('.cc--wind').textContent = `Wind: ${data.wind.speed.value} km/h`;
        this.querySelector('.cc--air-pressure').textContent = `AP: ${Math.round(data.airPressure.meanSeaLevelMillibars)} hPa`;
        this.querySelector('.cc--humidity').textContent = `Humidity: ${data.relativeHumidity}%`;

        // Format local time
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
        updateLucideIcon(iconEl, iconName);


        // ✅ Use resolved city name
        this.querySelector('.cc-location').textContent = `${name}: `;
      })
      .catch(err => {
        console.error('Failed to load weather data:', err);
        this.querySelector('.cc--weather').textContent = 'Unavailable';
      });
  }
}

customElements.define('current-conditions', CurrentConditions);
