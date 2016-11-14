# Micro

Micro client side router and template loading/mustache library.

- Works with pretty links via history API
- Load templates with XHR in app container (not reloading page)
- Template caching to local memory
- Listene to <a> tag click with hub-link attribute
- Page loading animations
- Basic mustache replacement for easier data forwarding
- Before and afterrender events
- Settings per page or globaly

## Installing

    $ npm install micro-spa

    or by embedding directly on page

    <script src="https://unpkg.com/micro-spa@latest"></script>

## Running examples

  To run examples do the following to install dev dependencies and run the example express server:

    $ git clone https://github.com/sgoran/micro.git
    $ cd micro
    $ npm install
    $ npm start
    $ open http://localhost:8080

## API

```javascript
  new Micro({
            config: {
                container: '#app',
                tplDir: '/tpl'
            },
            router: [{
                match: '/',
                title: 'Home Page',
                src: "home.html"
            },{
                match: '/example',
                title: 'Example Page',
                src: "examples.html"
            }]
        });

    
