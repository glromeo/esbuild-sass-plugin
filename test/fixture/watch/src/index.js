import banner from "./banner.scss";
import alternate from "./alternate.scss";

customElements.define("banner-element", class BannerElement extends HTMLElement {

    static get observedAttributes() { return ['alt']; }

    constructor() {
        super();
        this.attachShadow({mode: 'open'});
        this.sheet = new CSSStyleSheet();
        this.sheet.replaceSync(this.getCssText());
        this.shadowRoot.adoptedStyleSheets = [this.sheet];
    }

    getCssText() {
        if (this.getAttribute("alt") === "yes") {
            return alternate;
        } else {
            return banner;
        }
    }

    connectedCallback() {
        this.shadowRoot.innerHTML = `<div class="banner"><slot></slot></div>`
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === "alt") {
            if (newValue === "yes") {
                this.sheet.replaceSync(alternate);
            } else {
                this.sheet.replaceSync(banner);
            }
        }
    }
});