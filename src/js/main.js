import './weatherapi.js';
import '../web-c/index.js';
import { searchLocation, setDefaultLocation } from './weatherapi.js';

export async function updateLucideIcon(el, name) {
  if (!el) return; // prevent crash if element is missing

  const newIcon = document.createElement('i');
  newIcon.setAttribute('data-lucide', name);
  newIcon.className = el.className;
  el.replaceWith(newIcon);
  lucide.createIcons();
}


window.openPopup = function (name) {
  const popup = document.querySelector(`pop-up[data-popup="${name}"]`);
  if (popup) {
    popup.open();

    // Focus input/textarea/autofocus after DOM has rendered
    requestAnimationFrame(() => {
      const input = popup.querySelector('[autofocus], input, textarea');
      if (input) input.focus();
    });
  }
};

window.closePopup = function (name) {
  const popup = document.querySelector(`pop-up[data-popup="${name}"]`);
  if (popup) popup.close();
};

// ✅ Add location search handler
document.addEventListener('click', async (e) => {
  if (e.target.matches('[data-action="search-location"]')) {
    const popup = document.querySelector('pop-up[data-popup="search"]');
    const input = popup.querySelector('input');
    const query = input?.value?.trim();

    if (!query) return;

    const result = await searchLocation(query);
    if (!result) {
      alert('Location not found.');
      return;
    }

    // Set new default location for global use
    setDefaultLocation(result.lat, result.lng, result.name, result.country);


    // Re-trigger the component to fetch new data
    // Re-trigger the component(s) to fetch new data
    const cc = document.querySelector('current-conditions');
    if (cc) cc.connectedCallback();

    const hc = document.querySelector('hourly-conditions');
    if (hc) hc.connectedCallback();


    // Close popup
    closePopup('search');
  }
});


export function mapWeatherToLucideIcon(type, isDaytime) {
  const map = {
    CLEAR: isDaytime ? 'sun' : 'moon',
    CLOUDY: 'cloud',
    MOSTLY_CLOUDY: 'cloud-sun',
    PARTLY_CLOUDY: isDaytime ? 'cloud-sun' : 'cloud-moon',
    FOG: 'cloud-fog',
    RAIN: 'cloud-rain',
    CHANCE_RAIN: 'cloud-drizzle',
    THUNDERSTORM: 'cloud-lightning',
    SNOW: 'cloud-snow',
    CHANCE_SNOW: 'snowflake',
    WIND: 'wind',
    HAZE: 'align-vertical-space-around', // fallback
  };

  return map[type] || 'cloud';
}


function startMinuteTicker() {
  const now = new Date();
  const msToNextMinute = (60 - now.getSeconds()) * 1000;

  setTimeout(() => {
    // Fire first tick
    window.dispatchEvent(new Event('minute-tick'));

    // Then fire every minute
    setInterval(() => {
      window.dispatchEvent(new Event('minute-tick'));
    }, 60000);
  }, msToNextMinute);
}

// Start ticker on load
startMinuteTicker();


// === Dynamic theme by time of day (pastel + accessible) ===

function setTheme(mode) {
  const root = document.documentElement;

  switch (mode) {
    case "sunrise": // 5–8 am
      root.style.setProperty("--color-primary", "#FFF1F2");   // rose-50
      root.style.setProperty("--color-accent", "#FBCFE8");    // pink-200
      root.style.setProperty("--color-secondary", "#7C2D12"); // deep brown for readable text
      root.style.setProperty("--color-white", "#1F2937");     // gray-800 text
      root.style.setProperty("--color-dark", "#E5E7EB");      // gray-200 border
      break;

    case "day": // 8 am–5 pm
      root.style.setProperty("--color-primary", "#ECFEFF");   // cyan-50
      root.style.setProperty("--color-accent", "#93C5FD");    // blue-300
      root.style.setProperty("--color-secondary", "#1E3A8A"); // strong indigo for text
      root.style.setProperty("--color-white", "#0F172A");     // gray-900 text
      root.style.setProperty("--color-dark", "#CBD5E1");      // slate-300 border
      break;

    case "sunset": // 5–8 pm
      root.style.setProperty("--color-primary", "#FFF7ED");   // orange-50
      root.style.setProperty("--color-accent", "#FDBA74");    // orange-300
      root.style.setProperty("--color-secondary", "#7C2D12"); // dark orange/brown text
      root.style.setProperty("--color-white", "#1F2937");     // gray-800 text
      root.style.setProperty("--color-dark", "#FED7AA");      // orange-200 border
      break;

    default: // 🌙 night (original dark mode)
      root.style.setProperty("--color-primary", "#0F1C24");
      root.style.setProperty("--color-secondary", "#8FB2CC");
      root.style.setProperty("--color-accent", "#21384A");
      root.style.setProperty("--color-white", "#FFFFFF");
      root.style.setProperty("--color-dark", "#172933");
      break;
  }
}

function detectTimeMode(hours) {
  if (hours >= 5 && hours < 8) return "sunrise";
  if (hours >= 8 && hours < 17) return "day";
  if (hours >= 17 && hours < 20) return "sunset";
  return "night";
}

function updateThemeFromTime() {
  const timeEl = document.querySelector(".cc--time");
  if (!timeEl) return;

  const text = timeEl.textContent || "";
  const match = text.match(/(\d{1,2}):(\d{2})/);
  if (!match) return;

  let hours = parseInt(match[1], 10);

  // handle AM/PM if present
  if (/PM/i.test(text) && hours < 12) hours += 12;
  if (/AM/i.test(text) && hours === 12) hours = 0;

  setTheme(detectTimeMode(hours));
}

// 🚀 Run once on page load
document.addEventListener("DOMContentLoaded", updateThemeFromTime);

// 🔄 Update every minute via ticker
window.addEventListener("minute-tick", updateThemeFromTime);

// 🕵️ Watch for .cc--time being updated by weather component
const timeEl = document.querySelector(".cc--time");
if (timeEl) {
  const obs = new MutationObserver(updateThemeFromTime);
  obs.observe(timeEl, { childList: true, characterData: true, subtree: true });
}

// WEATHER MOOD
export function applyWeatherMood(weatherType) {
  const root = document.documentElement;

  switch (weatherType) {
    case "CLEAR":
      root.style.setProperty("--theme-filter", "saturate(1.2) brightness(1.05)");
      break;
    case "CLOUDY":
    case "MOSTLY_CLOUDY":
    case "PARTLY_CLOUDY":
    case "FOG":
    case "HAZE":
      root.style.setProperty("--theme-filter", "saturate(0.8) brightness(0.9)");
      break;
    case "RAIN":
    case "CHANCE_RAIN":
    case "THUNDERSTORM":
      root.style.setProperty("--theme-filter", "saturate(0.7) brightness(0.85)");
      break;
    case "SNOW":
    case "CHANCE_SNOW":
      root.style.setProperty("--theme-filter", "saturate(0.75) brightness(1.1)");
      break;
    default:
      root.style.setProperty("--theme-filter", "none");
  }
}
