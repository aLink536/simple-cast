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
    const cc = document.querySelector('current-conditions');
    if (cc) {
      cc.connectedCallback();
    }

    // Close popup
    closePopup('search');
  }
});
