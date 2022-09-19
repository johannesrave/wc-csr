import WCPage from "../components/page";

export default class AboutPage extends WCPage {
  connectedCallback() {
    this.insertAdjacentHTML('beforeend', `
        <a href="/">home</a>
        <a href="/item/1">item 1</a>
    `)
  }
}

customElements.define('about-page', AboutPage);
