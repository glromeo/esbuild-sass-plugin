import {customElement, html, LitElement, property} from 'lit-element'

import styles from './hello-world.scss'

@customElement('hello-world')
export default class HelloWorld extends LitElement {

  static styles = styles
  @property() message = 'Hello World'

  render() {
    return html`<div class="banner">${this.message}</div>`
  }
}
