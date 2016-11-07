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

        // run
        router.invoke();

        var me = this;

        // return public API
        return {
            id: me.id,
            page: router.path.bind(router),
            load: tpl.loadTpl.bind(tpl),
            render: tpl.replaceHtml.bind(tpl),
            compile: tpl.parseTpl.bind(tpl),
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
        * Set observable logic betwen modules
        * For example route match will trigger load template etc
        */
       initEventsLogic: function(router, tpl){
           
           if(this.eventsAdded)
            return;
            
            var me = this;

            me.events.on('routeChange', router.path.bind(router));
            me.events.on('routeMatch', tpl.loadTpl.bind(tpl));
           
           // not ok - dont describe well what it does
            var setAppEvents = function(config, params, event){
                var page = config.page;
                if(page.on && typeof page.on[event] === 'function')
                    page.on[event](page, params)

                var globalOptions = me.props.config;
                if(globalOptions.on && typeof globalOptions.on[event] === 'function')
                    globalOptions.on[event](config, params)
            };
        
            me.events.on('beforerender', function(config, params){ 
                var title = config.page.title;
                window.document.title = (title ? title : me.defaultTile);
                setAppEvents(config, params, 'beforerender');
            });

            me.events.on('render', function(config, params){
                setAppEvents(config, params, 'render');
                me.setListeners(config); 
            });

            // back/forward listeners
            if (window.addEventListener)  
                window.addEventListener('popstate', router.invoke.bind(router));
            

            me.eventsAdded = true;

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
        setListeners: function(config){

           var me = this;

           setTimeout(function() {
               
              Array.prototype.slice.call(document.querySelectorAll('[micro-link]')).forEach(function(el){
                
                // add active link
                if(config){   
                    if(config.page.match==el.getAttribute('micro-link'))
                        el.classList.add('micro-active');
                    else
                        el.classList.remove('micro-active');
                }
                    
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
         * Change .animated animation-duration
         * this enables user to set it manually
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
         * Some helpers
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