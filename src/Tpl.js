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