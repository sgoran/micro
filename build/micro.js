/**
 * Micro client side router and tpl lib 
 */
;(function (window, document){

    function Micro(props){

        // set all properties
        this.props = props;
        this.id = this.utils.getUniqueId();
        this.defaultTile = window.document.title;

        // instantiate new instances with every Micro instance
        this.events =  new Micro.Pubsub(this.id);
        var router = new Micro.Router(this.props.router, this.events);
        var tpl = new Micro.Tpl(this.props.config, this.events);
        
        this.setAnimationDuration();
        this.setListeners();
        this.initEventsLogic(router, tpl);

        // observe current route
        router.invoke();

        var me = this;

        // return public API
        return {
            id: me.id,
            page: router.path.bind(router),
            load: tpl.load.bind(tpl),
            render: tpl.replaceHtml.bind(tpl),
            compile: tpl.parse.bind(tpl),
            setAnimation: function(animation){
                tpl.props.enterAnimation = animation;
            },
            getPage: function(obj){
                var key = Object.keys(obj)[0];
                return me.props.router.filter(function(ob){
                    return (ob[key]==obj[key]);
                })[0];
            }
            
        };

    };

    

    Micro.prototype = {

       /**
        * In cae other Micro global variable exists
        */
       isMicro: true,

       /**
        * initEventsLogic marker
        */
       eventsAdded: false,

       /**
        * Adds class to clicked link
        */
       defaultActiveLinkCls: 'micro-link-active',

       /**
        * Set observable logic betwen modules
        * For example route match will trigger load template etc
        */
       initEventsLogic: function(router, tpl){
           
           if(this.eventsAdded)
            return;
            
            var me = this;

            me.events.on('routeChange', router.path.bind(router));
            me.events.on('routeMatch', tpl.load.bind(tpl));
                       
            me.events.on('beforerender', function(config){
                window.document.title = (config.route.title ? config.route.title : me.defaultTile);
                me.fireUserEvent(config, 'beforerender');
            });

            me.events.on('render', function(config){
                me.fireUserEvent(config, 'render');
                me.setListeners(config.route);
            });

            // back/forward listeners
            if (window.addEventListener)  
                window.addEventListener('popstate', router.invoke.bind(router));
            
            me.eventsAdded = true;

       },
        
       /**
        * fire config.on events if user is listening  
        */ 
       fireUserEvent: function(options, event){
            
            var globalEvents = this.props.config.on;

            if(globalEvents && typeof globalEvents[event] === 'function')
                globalEvents[event](options.route, options.tpl);

       },

       /**
        * Fires on 
        */
       microLinkClick: function(e) {
            
            var e = window.e || e;
            var t = e.target;

            if (t.tagName == 'A'){
                e.preventDefault();
                if(t.hasAttribute('micro-link')){
                    this.events.fire('routeChange', t.getAttribute('micro-link'));
                    return false;
                }
            }
            
        },

        /**
         * Set listeners to all micro-links and mark them with Micro instance id
         * in case multiple instance exists
         */
        setListeners: function(route){

           var me = this;

           setTimeout(function() {
               
              Array.prototype.slice.call(document.querySelectorAll('[micro-link]')).forEach(function(el){
                
                // add / remove active link
                if(route){
                    
                    var linkActiveCls = me.props.config.linkActiveCls || me.defaultActiveLinkCls,
                        active = (route.match==el.getAttribute('micro-link'));

                    el.classList.toggle(linkActiveCls, active);

                }
                                        
                
                // don't set listeners if el has microId already    
                if(!el.microId || (el.microId && el.microId.length && el.microId.indexOf(me.id)<0)){
                    
                    if(!el.microId)
                        el.microId = [];
                        

                    if (el.addEventListener){  
                         el.addEventListener('click', function(e){ 
                            me.microLinkClick(e)
                        }, false);
                    }
                    else{
                        el.attachEvent('onclick', function(e){
                            me.microLinkClick(e)
                        });
                    }

                    el.microId.push(me.id);

                }

            }); 

           }, 0);
            

        },

        /**
         * Change .animated animation-duration property
         * User can set it manually
         */
        setAnimationDuration: function(){

            var duration = this.props.config.animationDuration;

            if(this.props.config.enterAnimation && this.props.config.animationDuration){
             
                var style = document.createElement("style");
                style.type = 'text/css';
                style.appendChild(document.createTextNode('.animated{animation-duration: '+duration+'s !important; -webkit-animation-duration: '+duration+'s !important; }'));
                document.head.appendChild(style);    

            }

        },

        /**
         * Helpers
         */
        utils: (function(){

            var me = this;

            function getRandomInt(min, max) {
                min = Math.ceil(min);
                max = Math.floor(max);
                return Math.floor(Math.random() * (max - min)) + min;
            };

            function shuffle(a) {
                var j, x, i;
                for (i = a.length; i; i--) {
                    j = Math.floor(Math.random() * i);
                    x = a[i - 1];
                    a[i - 1] = a[j];
                    a[j] = x;
                }
                return a.join('');
            };

            me.getUniqueId = function(){
                return shuffle((new Date().getTime().toString()+getRandomInt(1, 10000).toString()).split('')).trim();
            }
            
            return me;

        }())
        
    }; 
    
    if ( typeof module != 'undefined' && module.exports )
	    module.exports = Micro;
    else if( typeof define == 'function' && define.amd )
        define( function () { return Micro; }); 
    else
        window.Micro = Micro;
    
}(window, document));
//https://davidwalsh.name/pubsub-javascript
;(function(){

  function Pubsub(id){
    this.id = id;
    var topics = {};
    var hOP = topics.hasOwnProperty;

    return {
      on: function(topic, listener) {
        // Create the topic's object if not yet created
        if(!hOP.call(topics, topic)) 
          topics[topic] = [];

        // Add the listener to queue
        var index = topics[topic].push(listener) -1;

        // Provide handle back for removal of topic
        return {
          remove: function() {
            delete topics[topic][index];
          }
        };
      },
      fire: function(topic, info) {   
        // If the topic doesn't exist, or there's no listeners in queue, just leave
        if(!hOP.call(topics, topic)) return;

        // Cycle through topics queue, fire!
        topics[topic].forEach(function(item) {
            item(info != undefined ? info : {});
        });
      }
    }
  };


  if(typeof Micro === "function" && Micro.prototype.isMicro)
      Micro['Pubsub'] = Pubsub;
      
  
})();
;(function (window, document){
    
    function Router(routes, events){
        
        
        this.routes = routes;
        this.events = events;//= (Micro && Micro['Pubsub']) ? Micro['Pubsub']: false;
        var me = this;


    }

    Router.prototype = {

        /**
         * Routes init
         */
        invoke: function(){

            var me = this;
            
            this.routes && this.routes.forEach(function(route) {
                
                if(me.doesMatch(route))
                    me.events.fire('routeMatch', route);
                
            });
            
            return me;

        },

        /**
         * Check if page object match
         * @to-do: This must be done much better
         */
        doesMatch: function(route){

            var urlPath = window.location.pathname;
            var match = false;

            if(!route.match){
                this.log(route.route+' rule has no "match" rule');
                return match;
            }
                

            var matchParams = route.match.split('/');
            matchParams.shift();

            var urlParams = urlPath.split('/');
            urlParams.shift();
            
            // should match exact route including "/" or "/route" etc
            if(urlPath==route.match)
                match = true;
            
            
            if(matchParams.length == urlParams.length){
                for(var i = 0; i<matchParams.length; i++)
                    if(matchParams[i].search(':')==0)
                        match = true;
            }
            
            
             return match;

        },

        
        path: function(href){
            
            if(window.location.pathname!=href)
             history.pushState({page: new Date().getTime()}, '',href);
            
            this.invoke();
        },
        
        log: function(msg){
            console.log(msg);
        },

    }; 

    if(typeof Micro === "function" && Micro.prototype.isMicro)
         Micro['Router'] = Router;

}(window, document));
/**
 * Tpl.js 
 */
;(function (window, document){
    
    function Tpl(props, events){
        
        var me = this;
        this.props = props;
        this.events = events;
       
        if(this.props.enterAnimation && this.props.enterAnimation!='')
            this.embedAnimations();
        
       
    }

    Tpl.prototype = {
        /**
         * Holds template cache
         */
        tplCache: {},

        /**
         * Get tpl with XHR and call this.render
         */
        load: function(route){
            
            var me = this; 
            me.activeRoute = route;

            if(Array.isArray(route.tpl))
                route.tpl.forEach(function(tpl){
                    me.loadFile(tpl);
                });
            else
                me.loadFile(route);

            

        },

        loadFile: function(tpl){
            
            var me = this;
    
            me.events.fire('beforerender', {
                route: me.activeRoute,
                tpl: tpl
            });

            // treba dovrsiti ovo za animacije malo bolje
            // tako da radi dobro i kad nije fade efekat
            var container = document.querySelector(me.getContainerSelector(tpl));
            container.className = "";
            container.style.opacity = 0;

            if(me.isRouteCached(tpl)){
                me.render(me.tplCache[tpl.src], tpl);
                return;
            }

            var tplFile = me.props.tplDir+'/'+tpl.src;
            var oReq = new XMLHttpRequest();

            oReq.addEventListener("load", function(){
                
                if(me.props.cache || tpl.cache)
                    me.cacheRoute(tpl, oReq.responseText);

                me.render(oReq.responseText, tpl);

            });

            oReq.open("GET", tplFile, true);

            oReq.send();
        },

        getContainerSelector: function(tpl){
            return tpl.container || this.props.container
        },
        /**
         * Returns boolean
         */
        isRouteCached: function(tpl){
            return this.tplCache && this.tplCache.hasOwnProperty(tpl.src);
        },

        /**
         * Cache tpl
         */
        cacheRoute: function(tpl, data){
            this.tplCache[tpl.src] = data;
        },
        
        /**
         * Main render function 
         */
        render: function(html, tpl){ 
            
            var me = this;
            
            var data = (this.activeRoute.data || this.props.data || {});
            var source = this.parse(html, data);

            this.replaceHtml(source, me.getContainerSelector(tpl) ); 
            this.animate(tpl);    

            setTimeout(function(){
                me.events.fire('render', {
                    route: me.activeRoute,
                    tpl: tpl
                });
            }, 0);

        },

        /**
         * need to finish this
         */
        replaceHtml: function(html, selector) {

            var me = this;
            //document.getElementById(me.props.container).className = "animated fadeOut";
            document.querySelector(selector).innerHTML = html;    
            
            return;

        },

        /**
         * Mustache replace
         * Should work with nested data/objects like {{data.item}}
         */
        parse: function(tpl, data) { 

            return tpl.replace((RegExp("{{\\s*([a-z0-9_][.a-z0-9_]*)\\s*}}", "gi")), function (tag, k) {

                var p = k.split("."),
                    len = p.length,
                    temp = data,
                    i = 0;

                for (; i < len; i++) 
                    temp = temp[p[i]] || '';
                
                return temp;
            });
        },

        /**
         * Executes after tpl is added
         * Available animations are 
            'fadeIn'
            'fadeInDown'
            'fadeInDownBig'
            'fadeInLeft'
            'fadeInLeftBig'
            'fadeInRight'
            'fadeInRightBig'
            'fadeInUp'
            'fadeInUpBig
         */
        animate: function(tpl){
            var animations = [
            'fadeIn', 
            'fadeInDown',
            'fadeInDownBig',
            'fadeInLeft',
            'fadeInLeftBig',
            'fadeInRight',
            'fadeInRightBig',
            'fadeInUp',
            'fadeInUpBig'
            ];
            var me = this;

            setTimeout(function(){
                
                var animation = tpl.enterAnimation ||  me.props.enterAnimation;
                
                if(animation && animations.indexOf(animation)>-1)
                    document.querySelector(me.getContainerSelector(tpl)).className = "animated "+animation;
                else
                    document.querySelector(me.getContainerSelector(tpl)).style.opacity = 1;

            }, 0);
            
        },

        /**
         * console.log
         */
        log: function(msg){
            console.log(msg);
        },

        /**
         * 
         */
        embedAnimations: function(){

            var id = 'microAnimationLibrary';
            if(!document.getElementById('microAnimationLibrary')){
                var link = document.createElement('link');
                link.href = 'https://cdnjs.cloudflare.com/ajax/libs/animate.css/3.5.2/animate.min.css';
                link.rel="stylesheet";
                link.id = id;
                document.head.appendChild(link);
            }
            
        }

    }; 
    
    if(typeof Micro === "function" && Micro.prototype.isMicro)
        Micro['Tpl'] = Tpl;
    
}(window, document));