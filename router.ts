export {};

class WCRouter extends HTMLElement {
  connectedCallback() {
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.innerHTML = '<slot name="page"></slot>';

    // whenever the browser history is used (triggering 'popstate'), we route again.
    window.addEventListener('popstate', this.routePage);
    // whenever am anchor somewhere inside the router-tree is clicked,
    // we capture the click and route on the client.
    this.shadowRoot.addEventListener('click', (e) => this.captureAnchorClick(e));

    void this.routePage()
    console.log("navigated to " + location.pathname)
  }

  navigateTo(url) {
    history.pushState(null, null, url);
    void this.routePage()
  }

  reload() {
    void this.routePage();
  }

  private captureAnchorClick(e: Event) {
    e.preventDefault();
    if ((e.target as HTMLElement).matches('a')) {
      this.navigateTo((e.target as HTMLAnchorElement).href);
    }
  }

  private async routePage() {
    console.log("routing to path " + location.pathname);
    [...this.querySelectorAll('wc-route')].forEach(child => {
      child.removeAttribute('slot');
    });

    let wcRoute = [...this.querySelectorAll('wc-route')]
      .find(child => {
        const pathAttr = child.getAttribute('path');
        console.log(`child: ${child.tagName} - pathAttr: ${pathAttr}`);
        return location.pathname.match(this.regexFromPath(pathAttr));
      }) ?? document.createElement('p');

    wcRoute.setAttribute('slot', 'page')
  }

  private regexFromPath(path: string) {
    const pathWithEscapedSlashes = path.replace(/\//g, '\\/');
    const pathWithCapturedSegments = pathWithEscapedSlashes.replace(/:\w+/g, '(.+)');
    return new RegExp(`^${pathWithCapturedSegments}$`);
  }
}

customElements.define('wc-router', WCRouter);

