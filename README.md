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
  var micro = new Micro({
                    pages: [{
                        name: 'firstPage',
                        match: '/',
                        enterAnimation: "fadeInDown",
                        title: 'Section 1',
                        tpl: "section.html",
                        data: {
                            sample: 'SECTION 1'
                        }
                    },{
                        match: '/page',
                        tpl: "section2.html",
                        enterAnimation: "fadeInRight",
                        title: 'Section 2',
                        data: {
                            sample: 'SECTION 2'
                        },
                        on: {
                            render: function(page, params){
                                // do something after render   
                            }
                        }
                    },{
                        match: '/category/:param',
                        enterAnimation: "fadeInUp",
                        tpl: "section3.html",
                        title: 'Section 3',
                        data: {
                            sample: 'SECTION 3'
                        },
                        
                    }],
                    options:{
                        enterAnimation: true,
                        tplDir: '/tpl',
                        cache: true,
                        container: 'app'
                    } 
                });
    
    
