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
        * In case other Micro global variable exists
        * check does it have this identifier
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