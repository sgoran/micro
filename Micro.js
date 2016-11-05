/**
 * Micro client side router and tpl lib 
 */
;(function (window, document){

    var utils = (function(){
        var me = this;

        me.getRandomInt = function (min, max) {
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
            return shuffle((new Date().getTime().toString()+me.getRandomInt(1, 10000).toString()).split('')).trim();
        }
        

        return me;
    }());

    function Micro(props){

        this.props = props;
        this.id = utils.getUniqueId();
        this.events =  new Micro.Pubsub(this.id);
        this.defaultTile = window.document.title;

        var router = new Micro.Router(this.props.pages, this.events);
        var tpl = new Micro.Tpl(this.props.options, this.events);
        
        this.setListeners();

        this.initEventsLogic(router, tpl);

        router.invoke();
        var me = this;

        return {
            id: me.id,
            page: router.path.bind(router),
            load: tpl.loadTpl.bind(tpl),
            render: tpl.render.bind(tpl),
            compile: tpl.parseTpl.bind(tpl),
            setAnimation: function(animation){
                tpl.props.enterAnimation = animation;
            },
            getPage: function(obj){
                var key = Object.keys(obj)[0]
                return me.props.pages.filter(function(ob){
                    return (ob[key]==obj[key]);
                })[0];
            }
            
            //setTplCache: tpl.cacheRoute.bind(tpl),
        };

    };

    

    Micro.prototype = {
       isMicro: true,
       eventsAdded: false,
       initEventsLogic: function(router, tpl){
           
           if(this.eventsAdded)
            return;
            
            var me = this;

            me.events.on('routeChange', router.path.bind(router));
            me.events.on('routeMatch', tpl.loadTpl.bind(tpl));
           
            var setAppEvents = function(config, params, event){
                var page = config.page;
                if(page.on && typeof page.on[event] === 'function')
                    page.on[event](page, params)

                var globalOptions = me.props.options;
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
                me.setListeners(); 
            });

            // back/forward listeners
            if (window.addEventListener)  
                window.addEventListener('popstate', router.invoke.bind(router));
            

            me.eventsAdded = true;

       },

       microLinkClick: function(e) {
            
            var e = window.e || e;
            var t = e.target;

            if (t.tagName == 'A'){
                e.preventDefault();
                if(t.hasAttribute('micro-route')){
                    this.events.fire('routeChange', t.getAttribute('micro-route'));
                    return false;
                }
            }
            
        },

        setListeners: function(){

           var me = this;

           setTimeout(function() {
               
               // set listeners to all links and mark them with MicroID
              Array.prototype.slice.call(document.querySelectorAll('[micro-route]')).forEach(function(el){
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
        
    }; 
    
    if ( typeof module != 'undefined' && module.exports )
	    module.exports = Micro;
    else if( typeof define == 'function' && define.amd )
        define( function () { return Micro; }); 
    else
        window.Micro = Micro;
    
}(window, document));