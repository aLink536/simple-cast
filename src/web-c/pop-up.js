class PopUp extends HTMLElement {
  constructor() {
    super();
    this._onKeyDown = this._onKeyDown.bind(this);
    this._onClickOutside = this._onClickOutside.bind(this);
  }

  connectedCallback() {
    this.style.display = 'none';
    this.setAttribute('aria-hidden', 'true');
    this.setAttribute('role', 'dialog');

    this.style.position ||= 'fixed';
    this.style.inset ||= '0';
    this.style.zIndex ||= '9999';

    document.addEventListener('keydown', this._onKeyDown);
    this.addEventListener('click', this._onClickOutside);
  }

  disconnectedCallback() {
    document.removeEventListener('keydown', this._onKeyDown);
    this.removeEventListener('click', this._onClickOutside);
  }

  open() {
    this.style.display = 'flex';
    this.setAttribute('aria-hidden', 'false');
  }

  close() {
    this.style.display = 'none';
    this.setAttribute('aria-hidden', 'true');
  }

  _onKeyDown(e) {
    if (e.key === 'Escape') this.close();
  }

  _onClickOutside(e) {
    if (e.target === this) this.close();
  }
}

customElements.define('pop-up', PopUp);
