import { getDefaultLocation } from '../js/weatherapi.js';

class ThemeBox extends HTMLElement {
  connectedCallback() {
    this.currentCond = document.querySelector('current-conditions');

    // watch for location changes
    this.observer = new MutationObserver(() => this.render());
    if (this.currentCond) {
      this.observer.observe(this.currentCond, {
        attributes: true,
        attributeFilter: ['data-lat', 'data-lon'],
        childList: true,
        subtree: true
      });
    }

    this.render();
  }

  disconnectedCallback() {
    this.observer?.disconnect();
    if (this.map) {
      this.map.remove();
      this.map = null;
    }
  }

  async render() {
    const card = this.querySelector('.card');
    if (!card) return;

    // 🔹 ensure map container exists only once
    let mapDiv = card.querySelector('#map');
    if (!mapDiv) {
      card.innerHTML = `
        <div id="map" style="width:100%; height:100%; border-radius:0.5rem;"></div>
        <p class="text-xs text-secondary mt-2">Map provided by OpenStreetMap</p>
      `;
      mapDiv = card.querySelector('#map');
    }

    // 1️⃣ get coords
    let lat = this.currentCond?.getAttribute('data-lat');
    let lon = this.currentCond?.getAttribute('data-lon');
    if (!lat || !lon) {
      try {
        const loc = await getDefaultLocation();
        lat = loc.lat;
        lon = loc.lng;
      } catch (e) {
        console.error('Error getting default location:', e);
      }
    }

    if (!lat || !lon) {
      mapDiv.innerHTML = `<p class="text-secondary">Location unavailable</p>`;
      return;
    }

    // 2️⃣ init map once
    if (!this.map) {
      this.map = L.map(mapDiv).setView([lat, lon], 10);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/">OSM</a> contributors'
      }).addTo(this.map);
    } else {
      this.map.setView([lat, lon], 10);
    }

    // 3️⃣ update marker
    if (this.marker) this.map.removeLayer(this.marker);
    this.marker = L.marker([lat, lon]).addTo(this.map);

    // 4️⃣ fix sizing
    setTimeout(() => this.map.invalidateSize(), 100);
  }
}

customElements.define('theme-box', ThemeBox);
