import WCPage from "../components/page";

export default class ItemPage extends WCPage {
  connectedCallback() {
    this.insertAdjacentHTML('beforeend', `
        <a href="/">home</a>
        <a href="/about">about</a>
        <a href="/item/1">item 1</a>
    `)
  }
}

customElements.define('item-page', ItemPage);
