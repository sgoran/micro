/**
 * Micro client side router and tpl lib 
 */
;(function (window, document){
    
    var me;

    function Micro(props){
        
        me = this, me.props = props;
        me.events =  new Micro.Pubsub();
        me.router = new Micro.Router(me.props.routes, me.events);
        me.tpl = new Micro.Tpl(me.props.options, me.events);

        me.urlPath = window.location.pathname;

        me.BreakException = {};

        me.setListeners();

        me.events.subscribe('routechange', function(page){

            me.tpl.loadTpl(page);
            me.tpl.props.listeners = { 
                rendered: function(){
                    me.setListeners();
                }
            }

        });

        window.onpopstate = me.router.invoke; 
            
        me.router.invoke();
        me.setListeners();

        return me;

    };

    Micro.prototype = {
       isMicro: true,
       aClick: function(e) {
            
            var e = window.e || e;
            var t = e.target;

            if (t.tagName == 'A'){
             
                e.preventDefault();

                if(t.hasAttribute('href'))
                    me.router.path(t.getAttribute('href'))

                return;

            }
            
        },

        setListeners: function(){
           
            Array.prototype.slice.call(document.querySelectorAll('[hub-link]')).forEach(function(el){
                if (el.addEventListener)
                    el.addEventListener('click', me.aClick, false);
                else
                    el.attachEvent('onclick', me.aClick);
            });

        },
    
    }; 
    
    if ( typeof module != 'undefined' && module.exports ){
	    module.exports = Micro;
    }else if( typeof define == 'function' && define.amd ){
        define( function () { return Micro; }); 
    }
    else{
        window.Micro = Micro;
    }



}(window, document));
//https://davidwalsh.name/pubsub-javascript
;(function(){

  var topics, hOP;

  function Pubsub(){
    topics = {};
    hOP = topics.hasOwnProperty;
  };

  Pubsub.prototype = {
    subscribe: function(topic, listener) {
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
    publish: function(topic, info) {
      // If the topic doesn't exist, or there's no listeners in queue, just leave
      if(!hOP.call(topics, topic)) return;

      // Cycle through topics queue, fire!
      topics[topic].forEach(function(item) {
      		item(info != undefined ? info : {});
      });
    }

  };

  if(typeof Micro === "function" && Micro.prototype.isMicro){
      Micro['Pubsub'] = Pubsub;
  }
  else if ( typeof module != 'undefined' && module.exports ){
    module.exports = Pubsub;
  }else if( typeof define == 'function' && define.amd ){
      define( function () { return Pubsub; }); 
  }
  else{
      window.Pubsub = Pubsub;
  }

  
})();
;(function (window, document){
    
    //this.props = props;

    var me = this;

    function Router(props, events){
    
        me = this;
        me.props = props;
        me.events = events;//= (Micro && Micro['Pubsub']) ? Micro['Pubsub']: false;
       
        me.BreakException = {};

    }

    Router.prototype = {

        /**
         * Routes init
         */
        invoke: function(rule){
            
             me.props && me.props.forEach(function(page) {
                
                if(me.doesMatch(page)){

                    if(page.afterrender && typeof page.afterrender === 'function')
                        page.afterrender();

                    if(me.events)
                        me.events.publish('routechange', page);

                    //throw me.BreakException;
                }
                    
            });
            
            return me;

        },

        /**
         * Check if page object match
         * @to-do: This must be done much better
         */
        doesMatch: function(page){

            var urlPath = window.location.pathname;
            var match = false;

            if(!page.rule){
                me.log(page.route+" rule has no callback");
                return match;
            }
                

            var ruleParams = page.rule.split('/');
            ruleParams.shift();

            var urlParams = urlPath.split('/');
            urlParams.shift();
            
            // should match exact route including "/" or "/page" etc
            if(urlPath==page.rule)
                match = true;
            
            
            if(ruleParams.length == urlParams.length){
                for(var i = 0; i<ruleParams.length; i++)
                    if(ruleParams[i].search(':')==0)
                        match = true;
            }
            

             return match;

        },

        
        path: function(href){
            if(window.location.pathname!=href){
                history.pushState({}, '', href);
                this.invoke();
            }
        },
        
        log: function(msg){

            console.log(msg);

        },

    }; 

    if(typeof Micro === "function" && Micro.prototype.isMicro){
      Micro['Router'] = Router;
    }
    else if ( typeof module != 'undefined' && module.exports ){
	    module.exports = Router;
    }else if( typeof define == 'function' && define.amd ){
        define( function () { return Router; }); 
    }
    else{
        window.Router = Router;
    }



}(window, document));
/**
 * Tpl.js 
 */
;(function (window, document){
    
    var me = this;
    
    function Tpl(props, events){

        me = this;
        me.props = props;
        me.container = this.props.container;
        me.enterAnimation = me.props.enterAnimation;

        if(me.enterAnimation && me.enterAnimation!='')
            me.embedAnimations();
        
    }

    Tpl.prototype = {
        /**
         * Holds template cache
         */
        tplCache: {},

        /**
         * Should be faster than innerHTML
         */
        replaceHtml: function(html) { 

            var oldEl = typeof me.container === "string" ? document.getElementById(me.container) : me.container;
            var newEl = oldEl.cloneNode(false);
            
            newEl.innerHTML = html;
            oldEl.parentNode.replaceChild(newEl, oldEl);

        },

        /**
         * Do XHR for template and call this.render
         */
        loadTpl: function(page){
            
            var me = this; 
            me.activePage = page;
            
            if(me.isRouteCached(page)){
                me.render(this.tplCache[page.tpl])
                return;
            }


            
            tplFile = this.props.tplDir+'/'+page.tpl;
            oReq = new XMLHttpRequest();

            oReq.addEventListener("load", function(){
                
                if(me.props.cache || page.cache)
                    me.cacheRoute(page, oReq.responseText);

                me.render(oReq.responseText);
            });

            oReq.open("GET", tplFile);
            oReq.send();

        },

        /**
         * Returns boolean
         */
        isRouteCached: function(page){
            return this.tplCache && this.tplCache.hasOwnProperty(page.tpl);
        },

        /**
         * Cache tpl
         */
        cacheRoute: function(page, data){
            this.tplCache[page.tpl] = data;
        },
        
        /**
         * Mustache replace
         * Should work with nested data/objects like {{data.item}}
         */
        parseTpl: function(tpl, data) { 

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
         * Main render function 
         */
        render: function(html){
            
            var data = (me.activePage.data || me.props.data || {}),
                source = this.parseTpl(html, data);
                
            
            // leave animation
            //document.getElementById("container").className = "animated fadeOut";
            
            this.replaceHtml(source); 


            if(me.props.listeners){
                setTimeout(function(){
                    if(typeof me.props.listeners.rendered === 'function')
                        me.props.listeners.rendered();
                }, 0);
            }
                

            this._afterrender();    

        },

        /**
         * Executes after tpl is added
         */
        _afterrender: function(){
            setTimeout(function(){
                if(me.enterAnimation)
                document.getElementById("container").className = "animated "+me.enterAnimation;
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
            var link = document.createElement('link');
            link.href = 'https://cdnjs.cloudflare.com/ajax/libs/animate.css/3.5.2/animate.min.css';
            link.rel="stylesheet";
            document.head.appendChild(link);
        }

    }; 
    
    if(typeof Micro === "function" && Micro.prototype.isMicro){
      Micro['Tpl'] = Tpl;
    }
    else if ( typeof module != 'undefined' && module.exports ){
	    module.exports = Tpl;
    }else if( typeof define == 'function' && define.amd ){
        define( function () { return Tpl; }); 
    }
    else{
        window.Tpl = Tpl;
    }



}(window, document));