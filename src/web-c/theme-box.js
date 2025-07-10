class ThemeBox extends HTMLElement {
  connectedCallback() {
    console.log('<theme-box> connected');
  }
}

customElements.define('theme-box', ThemeBox);
