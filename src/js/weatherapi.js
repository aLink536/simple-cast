// src/weatherApi.js
const BASE_URL = 'https://weather.googleapis.com/v1';

const apiKey = 'AIzaSyDWy85DaJhHAZW-ZLxfnINwLCXRi0jgdTY'; // replace in local dev only


const defaultLat = -33.8688;
const defaultLng = 151.2093;

let cachedDefaultLocation = null;

export async function getDefaultLocation() {
  if (cachedDefaultLocation) return cachedDefaultLocation;

  const fallback = {
    lat: defaultLat,
    lng: defaultLng,
    name: 'Unknown'
  };

  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${defaultLat}&lon=${defaultLng}&format=json`, {
      headers: {
        'User-Agent': 'VibeCastWeatherApp/1.0 (you@yourapp.com)'
      }
    });

    const data = await res.json();
    const address = data.address;
    const name =
      address.city ||
      address.town ||
      address.village ||
      address.county ||
      address.state ||
      address.country ||
      'Unknown';

    cachedDefaultLocation = { lat: defaultLat, lng: defaultLng, name };
    return cachedDefaultLocation;
  } catch (err) {
    console.warn('Reverse geocoding failed:', err);
    return fallback;
  }
}

// Generic fetch wrapper
async function fetchWeather(endpoint, params = {}) {
    const url = new URL(`${BASE_URL}/${endpoint}`);
    url.searchParams.set('key', apiKey);

    for (const [key, value] of Object.entries(params)) {
        url.searchParams.set(key, value);
    }

    const res = await fetch(url);

    if (!res.ok) {
        throw new Error(`Weather API error: ${res.status} ${res.statusText}`);
    }

    return res.json();
}

// Get current conditions
export function getCurrentConditions(lat, lng) {
    return fetchWeather('currentConditions:lookup', {
        'location.latitude': lat,
        'location.longitude': lng,
    });
}

// Get multi-day forecast
export function getForecast(lat, lng) {
    return fetchWeather('forecast/days:lookup', {
        'location.latitude': lat,
        'location.longitude': lng,
    });
}

console.log('Weather API module loaded');

