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
this is not the final API, it is the inspiration and initial idea from which this exploration will expand.

there are some intuitive conceptual requirements for the resulting component in order of relevance:

- it should meet some expectations towards client side routing, such as a usable browser-history and shareable URLs with little or no in-memory-state.
- it should be portable in that users should be able to drop it into their markup, define some routes and page-components and then have their client-site routing "just work"
- it should be explicit in its configuration and API, with little magic going on in the background.
- it should be sensible about resource-usage, be it processing power, rerendering, initial page load and memory footprint. these goals may and will conflict, so tradeoffs will need to be made.


## Where will this be used?

this router-component would most likely be used in the index.html or equivalent entry-point into your site or app.

- as routing is a very basic mechanism that takes over some fundamental functionality of the whole app, 
integrating, initializing and configuring it at this "root"-level makes conceptual sense.
- an html file is where a using a portable custom element in a declarative fashion is the most natural.
- index.html is the entry point for the whole site, and the router then is the entry point for the web-app 
- plugging the actual content ("pages") into the app here is trivial and natural.
- ...

## API for adding routes and pages to the router

adding one <wc-route>-element per route is a natural fit, as they can be trivially added in the markup and 
accessed from within the <wc-router>. 

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
- pages are NOT instantiated until the router does so. this is probably a good thing, as initial parsing and execution on page-load would otherwise include all potential pages.


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
- the element tags are already explicit here.



## API for defining page-components

for the router to be able to find and plug in the correct page for a url, it needs I think three pieces of information: the path to match, a representation of the page-component/customElement to display and the js-module that defines the behaviour of that component.

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
  !! this variant has some fundamental implications in regard to caching, lazy-loading and usage of the shadow dom.
+ global explicit configuration in the router, a place where all pages are imported and defined (on demand?): `<wc-router page-file="pages.ts">`
+ implicit configuration, all pages are imported and defined somewhere else in the app (`app.ts`), and the router basically hopes for the page-elements to be defined when it adds them to the DOM.
+ file based, eg. a `/pages`-directory that is searched by the router: `<wc-router file-based="true">`


## Place to actually host the pages

where are the page components being hosted in the document? there are some options:

- simply as a child of the router alongside the routes. all other children can't have any visual elements.
- use the shadow dom on the router and programmatically move the current page from the light into the shadow-dom (or instantiate there).
- use the shadow dom and `<slot>` inside the router, keep all pages inside the router's light dom and give the current page a slot="page" attribute.
- designated element inside the router (`<wc-current-page>`)
- designated element outside the router (`<wc-current-page>`)


