import {html, LitElement} from "lit-element";

import styles from "./styles.scss";

customElements.define("hello-world", class CustomElement extends LitElement {
    static styles = [styles];
    render() {
        return html`<div class="message">Hello World, I have been rendered with Lit-CSS!!!</div>`;
    }
});