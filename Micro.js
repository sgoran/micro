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
            return shuffle((new Date().getTime().toString()+me.getRandomInt(1, 10000).toString()).split(''));
        }
        

        return me;
    }());

    function Micro(props){

        this.props = props;
        this.id = utils.getUniqueId();
        this.events =  new Micro.Pubsub();
        this.events.id = this.id.trim(); 
        this.router = new Micro.Router(this.props.pages, this.events);
        this.tpl = new Micro.Tpl(this.props.options, this.events);

        this.urlPath = window.location.pathname;
        
        var me = this;
        this.events.on('routechange', function(page){ 
            me.events.fire('loadTpl', page);
            
            me.tpl.props.listeners = { 
                rendered: function(){
                    me.setListeners();
                }
            }
            
        });

        
        // attach listeners for back/forward
        if (window.addEventListener){  
                window.addEventListener('popstate', function(e){ 
                    me.router.invoke();
                });
        }
        else{
            window.attachEvent('popstate', function(e){
                me.router.invoke();
            });
        }
        this.router.invoke();
        this.setListeners();

        return this;

    };

    

    Micro.prototype = {
       isMicro: true,
       aClick: function(e) {
            
            var e = window.e || e;
            var t = e.target;

            if (t.tagName == 'A'){
                e.preventDefault();
                if(t.hasAttribute('micro-route')){
                    this.events.fire('pathChange', t.getAttribute('micro-route'));
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
                            me.aClick(e)
                        }, false);
                    }
                    else{
                        el.attachEvent('onclick', function(e){
                            me.aClick(e)
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