export default class WCPage extends HTMLElement {
  getParams() {
    const pathAttr = this.getAttribute('path');
    // extract param names from static routes
    const params = Array.from(pathAttr.matchAll(/:(\w+)/g))
      .map(result => result[1]);
    // turn current url segments into values for those params
    const values = location.pathname.match(this.regexFromPath(pathAttr)).slice(1);

    // build and return {param : value} object
    return params.reduce((acc, key, i) => {
      acc[key] = values[i];
      return acc;
    }, {});
  }

  private regexFromPath(path: string) {
    const pathWithEscapedSlashes = path.replace(/\//g, '\\/');
    const pathWithCapturedSegments = pathWithEscapedSlashes.replace(/:\w+/g, '(.+)');
    return new RegExp(`^${pathWithCapturedSegments}$`);
  }
}
