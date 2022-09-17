export {};

class WCRouter extends HTMLElement {
  static html = `<slot name="page"></slot>`

  connectedCallback() {
    this.attachShadow({mode: 'open'});
    this.shadowRoot.innerHTML = WCRouter.html

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
    // console.log("routing to path " + location.pathname)
    // console.log("looking for respective page...")
    const currentPage = this.getCurrentPageElement() ?? this.notFoundPage()
    // console.log(currentPage)
    this.shadowRoot.replaceChildren(currentPage);
    // this.shadowRoot.querySelector('slot[name="page"]').replaceChildren(currentPage);
  }

  private getCurrentPageElement(): Element {
    let wcRouteForPath = [...this.querySelectorAll('wc-route')]
      .find(child => {
        const pathAttr = child.getAttribute('path');
        // console.log(`child: ${child.tagName} - pathAttr: ${pathAttr}`);
        return location.pathname.match(this.regexFromPath(pathAttr));
      });

    const pageTag = wcRouteForPath.getAttribute('page');
    return document.createElement(pageTag);
  }

  private notFoundPage() {
    const p = document.createElement('p');
    p.insertAdjacentHTML('beforeend', "404");
    return p;
  }

  private regexFromPath(path: string) {
    const pathWithEscapedSlashes = path.replace(/\//g, '\\/');
    const pathWithCapturedSegments = pathWithEscapedSlashes.replace(/:\w+/g, '(.+)');
    return new RegExp(`^${pathWithCapturedSegments}$`);
  }
}

customElements.define('wc-router', WCRouter);

