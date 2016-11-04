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
  else if ( typeof module != 'undefined' && module.exports )
      module.exports = Pubsub;
  else if( typeof define == 'function' && define.amd )
      define( function () { return Pubsub; }); 
  else
      window.Pubsub = Pubsub;
  
})();
;(function (window, document){
    
    function Router(pages, events){
        
        
        this.pages = pages;
        this.events = events;//= (Micro && Micro['Pubsub']) ? Micro['Pubsub']: false;
        var me = this;


    }

    Router.prototype = {

        /**
         * Routes init
         */
        invoke: function(){

            var me = this;
            
            this.pages && this.pages.forEach(function(page) {
                
                if(me.doesMatch(page))
                    me.events.fire('routeMatch', page);
                
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

            if(!page.match){
                this.log(page.route+" rule has no callback");
                return match;
            }
                

            var matchParams = page.match.split('/');
            matchParams.shift();

            var urlParams = urlPath.split('/');
            urlParams.shift();
            
            // should match exact route including "/" or "/page" etc
            if(urlPath==page.match)
                match = true;
            
            
            if(matchParams.length == urlParams.length){
                for(var i = 0; i<matchParams.length; i++)
                    if(matchParams[i].search(':')==0)
                        match = true;
            }
            
            
             return match;

        },

        
        path: function(href){
            
            if(window.location.pathname!=href){
             history.pushState({page: new Date().getTime()}, '',href);
            }
            this.invoke();
        },
        
        log: function(msg){
            console.log(msg);
        },

    }; 

    if(typeof Micro === "function" && Micro.prototype.isMicro)
         Micro['Router'] = Router;
    else if ( typeof module != 'undefined' && module.exports )
	    module.exports = Router;
    else if( typeof define == 'function' && define.amd )
        define( function () { return Router; }); 
    else
        window.Router = Router;

}(window, document));
/**
 * Tpl.js 
 */
;(function (window, document){
    
    function Tpl(props, events){
        
        var me = this;
        this.props = props;
        this.events = events;
       // me.container = this.props.container;
        this.props.enterAnimation;

        if(this.props.enterAnimation && this.props.enterAnimation!='')
            this.embedAnimations();
        
       
    }

    Tpl.prototype = {
        /**
         * Holds template cache
         */
        tplCache: {},

        

        /**
         * Do XHR for template and call this.render
         */
        loadTpl: function(page){
            
            var me = this; 
            this.activePage = page;
            

            document.getElementById(me.props.container).className = "";
            document.getElementById(me.props.container).style.opacity = 0;

            me.events.fire('beforerender', {
                page: this.activePage
            });

            if(this.isRouteCached(page)){
                this.render(this.tplCache[page.tpl])
                return;
            }

            tplFile = this.props.tplDir+'/'+page.tpl;

            var oReq = new XMLHttpRequest();

            oReq.addEventListener("load", function(){
                
                if(me.props.cache || page.cache)
                    me.cacheRoute(page, oReq.responseText);

                me.render(oReq.responseText);

            });

            oReq.open("GET", tplFile, true);

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
         * Main render function 
         */
        render: function(html){ 
            var me = this;
            var data = (this.activePage.data || this.props.data || {});
                
            var source = this.parseTpl(html, data);
                
            this.replaceHtml(source); 

            setTimeout(function(){
                me.events.fire('render', {
                    page: me.activePage
                });
            }, 0);
            
            this.animate();    

        },

        /**
         * Should be faster than innerHTML
         */
        replaceHtml: function(html) { 
            var me = this;
            //document.getElementById(me.props.container).className = "animated fadeOut";

            //setTimeout(function() {
                
                document.getElementById(me.props.container).innerHTML = html;    
            //}, 1300);
            

            return;



            var oldEl = (typeof this.props.container === "string" ? document.getElementById(this.props.container) : this.props.container);
            if(oldEl==null) 
                return;
                
            var newEl = oldEl.cloneNode(false);
            //console.log(newEl, html)
            newEl.innerHTML = html;
            oldEl.parentNode.replaceChild(newEl, oldEl);

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
         * Executes after tpl is added
         */
        animate: function(){
            var me = this;
            setTimeout(function(){
                var animation = me.activePage.enterAnimation ||  me.props.enterAnimation;
                if(animation)
                    document.getElementById(me.props.container).className = "animated "+animation;
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
    else if ( typeof module != 'undefined' && module.exports )
	    module.exports = Tpl;
    else if( typeof define == 'function' && define.amd )
        define( function () { return Tpl; }); 
    else
        window.Tpl = Tpl;
    
}(window, document));