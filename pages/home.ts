import WCPage from "../components/page";

console.log('importing /home')

class HomePage extends WCPage {
  connectedCallback() {
    this.insertAdjacentHTML('beforeend', `
        <a href="/about">about</a>
        <a href="/item/1">item 1</a>
    `)
  }
}

customElements.define('home-page', HomePage);
