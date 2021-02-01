import {customElement, html, LitElement} from "lit-element";

import styles from "./styles.scss";

@customElement("hello-world")
export default class HelloWorld extends LitElement {

    static styles = styles

    render() {
        return html`<div class="Hello"><h1 class="banner">Hello World!</h1></div>`;
    }
}