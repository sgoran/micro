;(function (window, document){
    
    //this.props = props;

    var me = this;

    function Router(props){
    
        me = this;
        me.props = props,
        events = (Micro && Micro['Pubsub']) ? Micro['Pubsub']: false;
       
        me.BreakException = {};

    }

    Router.prototype = {

        /**
         * Routes init
         */
        invoke: function(rule){
            
             me.props && me.props.forEach(function(page) {
                
                if(me.doesMatch(page)){

                    if(page.afterrender && typeof page.afterrender === 'function')
                        page.afterrender();

                    if(events)
                        events.publish('routechange', page);

                    //throw me.BreakException;
                }
                    
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

            if(!page.rule){
                me.log(page.route+" rule has no callback");
                return match;
            }
                

            var ruleParams = page.rule.split('/');
            ruleParams.shift();

            var urlParams = urlPath.split('/');
            urlParams.shift();
            
            // should match exact route including "/" or "/page" etc
            if(urlPath==page.rule)
                match = true;
            
            
            if(ruleParams.length == urlParams.length){
                for(var i = 0; i<ruleParams.length; i++)
                    if(ruleParams[i].search(':')==0)
                        match = true;
            }
            

             return match;

        },

        
        path: function(href){
            if(window.location.pathname!=href){
                history.pushState({}, '', href);
                this.invoke();
            }
        },
        
        log: function(msg){

            console.log(msg);

        },

    }; 

    if(typeof Micro === "function" && Micro.prototype.isMicro){
      Micro['Router'] = Router;
    }
    else if ( typeof module != 'undefined' && module.exports ){
	    module.exports = Router;
    }else if( typeof define == 'function' && define.amd ){
        define( function () { return Router; }); 
    }
    else{
        window.Router = Router;
    }



}(window, document));