import {customElement, html, LitElement, property} from "lit-element";

import styles from "./hello-world.scss";

@customElement("hello-world")
export default class HelloWorld extends LitElement {

    @property() message = 'Hello World';

    static styles = styles

    render() {
        return html`<div class="banner">${this.message}</div>`;
    }
}
