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
        routes: [{
            rule: '/',
            tpl: "one.html",
            cache: true,
            data: {
                sample: "Sample TPL data"
            },
            afterrender: function(){
                // one.html rendered, do something
            }
        },{
            rule: '/two',
            tpl: "two.html",
            data: {
                replaceme: "Another sample TPL data"
            },
            afterrender: function(){
                // two.html rendered, do something
            }
        },{
            rule: '/three/:param',
            tpl: "three.php?arg=param"
        }],
        options:{
            enterAnimation: "fadeIn",
            loader: true,
            tplDir: '/tpl',
            //cache: true,
            container: 'containerId',

        } 
    });
    
    
