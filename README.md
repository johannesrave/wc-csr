# Client-side routing webcomponent exploration

this is an exploration of a portable csr-router webcomponent.

an initial inspirational idea for the component usage can best be expressed in code:

```html
<wc-router page-file="pages.ts" file-based="false" lazy="false">
    <wc-route path="/"          page="home-page"></wc-route>
    <wc-route path="/item/:id"  page="item-page"></wc-route>
    <wc-route path="/about"     page="about-page"></wc-route>
</wc-router>
```

this is not the final API, but rather the starting point on which this exploration will expand.

MUST:

- capture clicks on anchors, which would ordinarily cause a server-request
- set the browser-location according to those clicks
- display page-components based on this location
- keep the browser-history functional
- display a fallback if no routes match (client side 404?!)

EVALUATE:

- should the browser or a related component define custom elements for the pages or is this rather the concern of the
  app itself?

NON-FUNCTIONAL:

- it should meet some expectations towards client side routing, such as a usable browser-history and shareable URLs with
  little or no in-memory-state.
- it should be portable in that users should be able to drop it into their markup, define some routes and
  page-components and then have their client-site routing "just work"
- it should be explicit in its configuration and API, with little magic going on in the background.
- it should be sensible about resource-usage, be it processing power, re-rendering, initial page load and memory
  footprint. these goals may and will conflict, so tradeoffs will need to be made.


## Where will this be used?

this router-component would most likely be used in the index.html or equivalent entry-point into your site or app.

- as routing is a very basic mechanism that takes over some fundamental functionality of the whole app,
  integrating, initializing and configuring it at this "root"-level makes conceptual sense.
- an html file is where a using a portable custom element in a declarative fashion is the most natural.
- index.html is the entry point for the whole site, and the router then is the entry point for the web-app
- plugging the actual content ("pages") into the app here is trivial and natural.
- ...

## API for adding routes and pages to the router

we define the responsibility of the router to be that of setting the browser-location/-url when an anchor is clicked, as
well as displaying a certain component based on that location. (a secondary concern is to feed the page-component the
query-parameters from the url, if any are present.)
routes and components, those two pieces of information are needed by the router.
adding one <wc-route>-element per route is a natural fit, as they can be trivially added in the markup and accessed from
within the <wc-router>.

however, a basic decision is how pages are represented. there are at least two options, illustrated in code here:

### 1. Pages as attributes

```html
<wc-router>
    <wc-route path="/"          page="home"></wc-route>
    <wc-route path="/item/:id"  page="item"></wc-route>
    <wc-route path="/about"     page="about"></wc-route>
</wc-router>
```

implications:

- the router has to somehow define and create a page-component from the given string.
- pages are NOT instantiated until the router does so. this is probably a good thing, as initial parsing and execution
  on page-load would otherwise include all potential pages.

### 2. Pages as components

```html
<wc-router>
    <wc-route path="/">
        <home-page></home-page>
    </wc-route>
    <wc-route path="/item/:id">
        <item-page></item-page>
    </wc-route>
    <wc-route path="/about">
        <about-page></about-page>
    </wc-route>
</wc-router>
```

implications:

- if used together with the shadow dom, a route could potentially be displayed simply by giving it a `slot="page"`
  -attribute. however, `connectedCallback` can't be used to detect when a page is being displayed anymore. detecting the attribute change on the `<wc-route>` becomes a possibility, but this then must be propagated to the page-child
  somehow. also, a ['slotchange'-event](https://developer.mozilla.org/en-US/docs/Web/API/HTMLSlotElement/slotchange_event) exists that is triggered on the slot-element if elements in the slot change.
- pages could be defined lazily, but would afterwards automatically remain in memory.
- IF pages are to be defined DYNAMICALLY/lazily/on demand, then the class defining each element must be known to the router, or another defining script must be notified. either way, static knowledge about that interface is needed for the router.
- IF pages are to be defined STATICALLY, their customElement definition can live outside the router. in this case,
  element-definition can't be enforced by the router, and also all pages are already defined/upgraded on entering the
  site!

### 3. Hybrid variant

```html
<wc-router>
  <slot name="page"></slot>
  <wc-route path="/" element="home-page"></wc-route>
  <wc-route path="/item/:id" element="item-page"></wc-route>
  <wc-route path="/about" element="about-page"></wc-route>
  <home-page></home-page>
  <about-page slot="page"></about-page>
</wc-router>
```

in this variant, the router still creates elements from strings, therefore doesn't execute the page-content prematurely. however afterwards, the page-element is "cached" inside the light-dom of the router. the currently active page then get to display inside the "page"-slot of the router.

implications:
- some problems of the simpler variants are solved by this, but it is a lot less clear to read.
- `connectedCallback` can now be at least used to initialize a page on its first display, but afterwards the page always remains connected.


### 4. Hybrid variant II

```html
<wc-router>
  #shadow-root
    <home-page></home-page>
  <wc-route path="/" element="home-page"></wc-route>
  <wc-route path="/item/:id" element="item-page"></wc-route>
  <wc-route path="/about" element="about-page"></wc-route>
  <about-page></about-page>
</wc-router>
```

same as variant 3, but the current page isn't displayed by giving it a slot-attribute, but it is added to the shadow-root instead, enabling the use of ``


## API for defining page-components

there are different ways to express this configuration:

+ specific explicit configuration where the pages could have a reference to their defining module per route:
  ```html
  <wc-route path="/" tag="home-page" module="./pages/HomePage"></wc-route>
  ```
  or
  ```html
  <wc-route path="/">
      <home-page module="./pages/HomePage"></home-page>
  </wc-route>
  ```
+ global explicit configuration in the router, a place where all pages are imported and defined (on
  demand?): `<wc-router page-file="pages.ts">`
+ implicit configuration, all pages are imported and defined somewhere else in the app (`app.ts`), and the router
  basically hopes for the page-elements to be defined when it adds them to the DOM.
+ file based, eg. a `/pages`-directory that is searched by the router: `<wc-router file-based="true">`

## Place to actually host the pages

where are the page components being hosted in the document? there are some options:

- simply as a child of the router alongside the routes. all other children can't have any visual elements.
- use the shadow dom and `<slot>` inside the router, keep all pages inside the router's light dom and give the current
  page a slot="page" attribute.
- use the shadow dom on the router and programmatically move the current page from the light into the shadow-dom (or
  instantiate there).
- designated element inside the router (`<wc-current-page>`)
- designated element outside the router (`<wc-current-page>`)

## Questions that didn't get their own section yet:

do pages need a wrapping component that provides some functionality/interface?
ideally, page-components don't need to know that they are being hosted by a router. some functionality might however be easier or only be implemented if there is some interface between the router and the pages.
