import WCPage from "../components/page";

export default class ItemPage extends WCPage {
  connectedCallback() {
    this.insertAdjacentHTML('beforeend', `
        <a href="/">home</a>
        <a href="/about">about</a>
    `)
  }
}

customElements.define('item-page', ItemPage);
