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
        loadTpl: function(route){
            
            var me = this; 
            this.activeRoute = route;
            
            me.events.fire('beforerender', {
                page: this.activeRoute
            });
            
            if(Array.isArray(route.tpl))
                route.tpl.forEach(function(page){
                    me.loadFile(page);
                });
            else
                me.loadFile(route);

            

        },

        loadFile: function(file){

            var me = this;
            me.activeTpl = file;
            
            // treba dovrsiti ovo za animacije malo bolje
            // tako da radi dobro i kad nije fade efekat
            var container = document.querySelector(me.getContainerSelector(file));
            container.className = "";
            container.style.opacity = 0;

            if(me.isRouteCached(file)){
                me.render(me.tplCache[file.src], file);
                return;
            }

            tplFile = me.props.tplDir+'/'+file.src;

            var oReq = new XMLHttpRequest();

            oReq.addEventListener("load", function(){
                
                if(me.props.cache || file.cache)
                    me.cacheRoute(file, oReq.responseText);

                me.render(oReq.responseText, file);

            });

            oReq.open("GET", tplFile, true);

            oReq.send();
        },

        getContainerSelector: function(tplObj){
            return tplObj.container || this.props.container
        },
        /**
         * Returns boolean
         */
        isRouteCached: function(page){
            return this.tplCache && this.tplCache.hasOwnProperty(page.src);
        },

        /**
         * Cache tpl
         */
        cacheRoute: function(page, data){
            this.tplCache[page.tpl] = data;
        },
        
        /**
         * Main render function 
         * treba proslijedititi jos parametara
         */
        render: function(html, path){ 
            
            var me = this;
            var data = (this.activeRoute.data || this.props.data || {});
            var source = this.parseTpl(html, data);

            this.replaceHtml(source, me.getContainerSelector(path) ); 

            setTimeout(function(){
                me.events.fire('render', {
                    page: me.activeRoute
                });
            }, 0);
            
            this.animate(path);    

        },

        /**
         * Should be faster than innerHTML
         */
        replaceHtml: function(html, selector) { 
            var me = this;
            //document.getElementById(me.props.container).className = "animated fadeOut";
            
            
            //setTimeout(function() {
                
                document.querySelector(selector).innerHTML = html;    
            //}, 1300);
            

            return;



            // var oldEl = (typeof this.props.container === "string" ? document.getElementById(this.props.container) : this.props.container);
            // if(oldEl==null) 
            //     return;
                
            // var newEl = oldEl.cloneNode(false);
            
            // newEl.innerHTML = html;
            // oldEl.parentNode.replaceChild(newEl, oldEl);

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
        animate: function(path){
            var me = this;
            setTimeout(function(){
                var animation = path.enterAnimation ||  me.props.enterAnimation;
                if(animation)
                    document.querySelector(me.getContainerSelector(path)).className = "animated "+animation;
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