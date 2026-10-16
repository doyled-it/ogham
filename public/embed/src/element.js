import { oghamSVG } from './api.js';

const ATTRS = ['text', 'mode', 'orientation', 'words', 'feather', 'tradition', 'weight', 'spacing', 'colourway', 'background', 'label', 'physical'];
const OPTION_ATTRS = ATTRS.filter((a) => a !== 'text' && a !== 'physical');

class OghamText extends HTMLElement {
  static get observedAttributes() { return ATTRS; }

  connectedCallback() {
    if (!this.shadowRoot) this.attachShadow({ mode: 'open' });
    this.draw();
  }

  attributeChangedCallback() {
    if (this.shadowRoot) this.draw();
  }

  draw() {
    const options = {};
    for (const name of OPTION_ATTRS) {
      const v = this.getAttribute(name);
      if (v !== null) options[name] = v;
    }
    try {
      const out = oghamSVG(this.getAttribute('text') || '', options);
      let svg = out.svg;
      if (!this.hasAttribute('physical')) {
        // Scale to the container: full width, let height follow the viewBox.
        svg = svg.replace(/width="[\d.]+mm"/, 'width="100%"').replace(/ height="[\d.]+mm"/, '');
      }
      this.shadowRoot.innerHTML = svg;
    } catch {
      this.shadowRoot.innerHTML = '';
    }
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('ogham-text')) {
  customElements.define('ogham-text', OghamText);
}

export { oghamSVG, OghamText };
