Micro client side spa library: http://lessgeneric.com/micro/

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
    $ open http://localhost:8080/micro/

## Simple API

```javascript
  new Micro({
            config: {
                container: '#app',
                tplDir: '/tpl',
                enterAnimation: 'fadeIn'
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

    
