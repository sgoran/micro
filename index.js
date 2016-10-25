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
                    me.setListeners();
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