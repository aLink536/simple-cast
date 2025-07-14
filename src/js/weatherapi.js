// src/weatherApi.js
const BASE_URL = 'https://weather.googleapis.com/v1';
const apiKey = 'AIzaSyDWy85DaJhHAZW-ZLxfnINwLCXRi0jgdTY'; // replace in local dev only

const defaultLat = -33.8688;
const defaultLng = 151.2093;
let cachedDefaultLocation = null;

const USER_AGENT_HEADER = {
  'User-Agent': 'VibeCastWeatherApp/1.0 (you@yourapp.com)'
};

// Helper to extract location name
function extractLocationName(address, fallback = 'Unknown') {
  return (
    address.city ||
    address.town ||
    address.village ||
    address.hamlet ||
    address.county ||
    address.state ||
    address.country ||
    fallback
  );
}

// Helper to fetch from OpenStreetMap
async function fetchFromOSM(url) {
  const res = await fetch(url, { headers: USER_AGENT_HEADER });
  if (!res.ok) throw new Error(`OSM error: ${res.status} ${res.statusText}`);
  return res.json();
}

// Get default location (reverse geocoding)
export async function getDefaultLocation() {
  if (cachedDefaultLocation) return cachedDefaultLocation;

  // ✅ Try localStorage first
  const stored = localStorage.getItem('vibecast_location');
  if (stored) {
    try {
      cachedDefaultLocation = JSON.parse(stored);
      return cachedDefaultLocation;
    } catch (e) {
      console.warn('Invalid location in localStorage:', e);
    }
  }

  // Fallback to default with reverse geocoding
  const fallback = { lat: defaultLat, lng: defaultLng, name: 'Unknown', country: 'Unknown' };

  try {
    const url = `https://nominatim.openstreetmap.org/reverse?lat=${defaultLat}&lon=${defaultLng}&format=json`;
    const data = await fetchFromOSM(url);
    const address = data.address;
    const name = extractLocationName(address);
    const country = address.country || 'Unknown';

    cachedDefaultLocation = { lat: defaultLat, lng: defaultLng, name, country };

    // ✅ Store it for next time
    localStorage.setItem('vibecast_location', JSON.stringify(cachedDefaultLocation));

    return cachedDefaultLocation;
  } catch (err) {
    console.warn('Reverse geocoding failed:', err);
    return fallback;
  }
}



// Generic fetch wrapper for Weather API
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

export function getCurrentConditions(lat, lng) {
  return fetchWeather('currentConditions:lookup', {
    'location.latitude': lat,
    'location.longitude': lng,
  });
}

export function getForecast(lat, lng) {
  return fetchWeather('forecast/days:lookup', {
    'location.latitude': lat,
    'location.longitude': lng,
  });
}

export async function searchLocation(query) {
  try {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1&addressdetails=1`;
    const data = await fetchFromOSM(url);

    if (!data.length) throw new Error('No results found.');

    const result = data[0];
    const address = result.address;
    const name = extractLocationName(address, query);
    const country = address.country || 'Unknown'; // ✅ Define country

    return {
      lat: parseFloat(result.lat),
      lng: parseFloat(result.lon),
      name,
      country
    };
  } catch (err) {
    console.warn('Location search failed:', err);
    return null;
  }
}

export function setDefaultLocation(lat, lng, name = 'Unknown', country = 'Unknown') {
  cachedDefaultLocation = { lat, lng, name, country };
  localStorage.setItem('vibecast_location', JSON.stringify(cachedDefaultLocation));
}



console.log('Weather API module loaded');
