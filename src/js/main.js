import './weatherapi.js';
import '../web-c/index.js';

export async function updateLucideIcon(el, name) {
  const newIcon = document.createElement('i');
  newIcon.setAttribute('data-lucide', name);
  newIcon.className = el.className;
  el.replaceWith(newIcon);
  lucide.createIcons();
}
