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