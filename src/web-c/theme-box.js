import { getDefaultLocation } from '../js/weatherapi.js'; 
// ← adjust that path if your structure differs

class ThemeBox extends HTMLElement {
  connectedCallback() {
    this.currentCond = document.querySelector('current-conditions');
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
  }

  async render() {
    const card = this.querySelector('.card');
    if (!card) return;
    card.innerHTML = `<p class="text-secondary">Loading webcam…</p>`;

    // 1️⃣ Determine coords
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
      card.innerHTML = `<p class="text-secondary">Location unavailable</p>`;
      return;
    }
    console.log('ThemeBox fetching webcam at', lat, lon);

    // 2️⃣ Helper to hit v3
    const apiKey = '3JFHGb4J0iX1xBSC5YqKLLhcTyI6ym5v';
    const baseUrl = 'https://api.windy.com/webcams/api/v3/webcams';
    async function fetchCams(paramsObj) {
      const params = new URLSearchParams(paramsObj);
      const url = `${baseUrl}?${params}`;
      console.log(' → Fetching:', decodeURIComponent(url));
      const res = await fetch(url, {
        headers: { 'X-WINDY-API-KEY': apiKey }
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      console.log('Raw response:', json);
      return json.webcams || [];
    }

    let webcams = [];

    // 3️⃣ First try: within 20 km (limit 10 for live search)
    webcams = await fetchCams({
      nearby: `${lat},${lon},20`,
      limit: '10',
      include: 'player,images,urls',
      lang: 'en'
    });

    // 4️⃣ If none, widen to 100 km
    if (webcams.length === 0) {
      console.log('No webcams within 20 km, widening to 100 km');
      webcams = await fetchCams({
        nearby: `${lat},${lon},100`,
        limit: '10',
        include: 'player,images,urls',
        lang: 'en'
      });
    }

    // 5️⃣ If still none, fallback to global popular
    if (webcams.length === 0) {
      console.log('No webcams within 100 km, falling back to global popular');
      webcams = await fetchCams({
        limit: '10',
        include: 'player,images,urls',
        sortKey: 'popularity',
        sortDirection: 'desc',
        lang: 'en'
      });
    }

    // 6️⃣ Pick the first live feed if available, else the closest
    let cam = webcams.find(c => c.player?.live) || webcams[0];

    // 7️⃣ Render result
    card.innerHTML = '';
    if (!cam) {
      card.innerHTML = `<p class="text-secondary">No webcams available.</p>`;
    } else if (cam.player?.live) {
      card.innerHTML = `
        <iframe
          src="${cam.player.live}"
          frameborder="0"
          allowfullscreen
          class="rounded-lg w-full h-48"
        ></iframe>
      `;
    } else if (cam.player?.day) {
      card.innerHTML = `
        <iframe
          src="${cam.player.day}"
          frameborder="0"
          allowfullscreen
          class="rounded-lg w-full h-48"
        ></iframe>
      `;
    } else if (cam.images?.current?.icon) {
      card.innerHTML = `
        <img
          src="${cam.images.current.icon}"
          alt="${cam.title}"
          class="rounded-lg w-full"
        />
      `;
    } else {
      card.innerHTML = `<p class=\"text-secondary\">Image unavailable.</p>`;
    }

    // 8️⃣ Always show attribution
    const att = document.createElement('p');
    att.textContent = 'Webcam provided by Windy.com';
    att.className = 'text-xs text-secondary mt-2';
    card.appendChild(att);
  }
}

customElements.define('theme-box', ThemeBox);
