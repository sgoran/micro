/**
 * Micro client side router and tpl lib 
 */
;(function (window, document){
    
    var me;

    function Micro(props){

        me = this, me.props = props;
        me.events = Micro.Pubsub;
        me.router = new Micro.Router(me.props.routes);
        me.tpl = new Micro.Tpl(me.props.options);

        me.urlPath = window.location.pathname;

        me.BreakException = {};

        me.setListeners();

        me.events.subscribe('routechange', function(page){

            me.tpl.loadTpl(page);
            me.tpl.props.listeners = { 
                rendered: function(){
                    setTimeout(function(){
                        me.setListeners();
                    }, 0);
                } 
            }

        });

        window.onpopstate = me.router.invoke; 
            
        me.router.invoke();
        me.setListeners();

    }

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

  var topics = {};
  var hOP = topics.hasOwnProperty;
  
  var Pubsub = {
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

    function Router(props){
    
        me = this;
        me.props = props,
        events = (Micro && Micro['Pubsub']) ? Micro['Pubsub']: false;
       
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

                    if(events)
                        events.publish('routechange', page);

                    //throw me.BreakException;
                }
                    
            });
            
            return me;

        },

        /**
         * Check if page object match
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
    
    function Tpl(props){

        me = this;
        me.props = props;
        

    }

    Tpl.prototype = {
        tplCache: {},

        //http://blog.stevenlevithan.com/archives/faster-than-innerhtml
        replaceHtml: function(el, html) {
            var oldEl = typeof el === "string" ? document.getElementById(el) : el;
            /*@cc_on // Pure innerHTML is slightly faster in IE
                oldEl.innerHTML = html;
                return oldEl;
            @*/
            var newEl = oldEl.cloneNode(false);
            newEl.innerHTML = html;
            oldEl.parentNode.replaceChild(newEl, oldEl);
            /* Since we just removed the old element from the DOM, return a reference
            to the new element, which can be used to restore variable references. */
            return newEl;
        },

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
        isRouteCached: function(page){
            return this.tplCache && this.tplCache.hasOwnProperty(page.tpl);
        },
        cacheRoute: function(page, data){
            this.tplCache[page.tpl] = data;
        },
        
        //https://github.com/addyosmani/microtemplatez/blob/master/microtemplatez.js
        parseTpl: function( tmpl, data ) {

            return tmpl.replace((RegExp("{{\\s*([a-z0-9_][.a-z0-9_]*)\\s*}}", "gi")), function (tag, k) {
                var p = k.split("."),
                    len = p.length,
                    temp = data,
                    i = 0;
                for (; i < len; i++) 
                    temp = temp[p[i]] || '';
                
                return temp;
            });
        },
        
        render: function(html){
            
            var data = (me.activePage.data || me.props.data || {}),
                source = this.parseTpl(html, data),
                container = document.getElementById(this.props.container);

            this.replaceHtml(container, source); 

            if(me.props.listeners)
                me.props.listeners.rendered();

        },

        log: function(msg){

            console.log(msg);

        },

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