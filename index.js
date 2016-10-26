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

        me.events.on('routechange', function(page){

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
                console.log(1)
                //e.preventDefault();

                if(t.hasAttribute('micro-route'))
                    me.router.path(t.getAttribute('micro-route'));

                //return false;

            }
            
        },

        setListeners: function(){
           
            Array.prototype.slice.call(document.querySelectorAll('[micro-route]')).forEach(function(el){
                if (el.addEventListener){
                    el.addEventListener('click', me.aClick, false);
                    
                }
                else{
                    el.attachEvent('onclick', me.aClick);
                }
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