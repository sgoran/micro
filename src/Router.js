;(function (window, document){
    
    function Router(routes, events){
        
        
        this.routes = routes;
        this.events = events;//= (Micro && Micro['Pubsub']) ? Micro['Pubsub']: false;
        var me = this;


    }

    Router.prototype = {

        /**
         * Routes init
         */
        invoke: function(){

            var me = this;
            
            this.routes && this.routes.forEach(function(route) {
                
                if(me.doesMatch(route))
                    me.events.fire('routeMatch', route);
                
            });
            
            return me;

        },

        /**
         * Check if page object match
         * @to-do: This must be done much better
         */
        doesMatch: function(route){

            var urlPath = window.location.pathname;
            var match = false;

            if(!route.match){
                this.log(route.route+' rule has no "match" rule');
                return match;
            }
                

            var matchParams = route.match.split('/');
            matchParams.shift();

            var urlParams = urlPath.split('/');
            urlParams.shift();
            
            // should match exact route including "/" or "/route" etc
            if(urlPath==route.match)
                match = true;
            
            
            if(matchParams.length == urlParams.length){
                for(var i = 0; i<matchParams.length; i++)
                    if(matchParams[i].search(':')==0)
                        match = true;
            }
            
            
             return match;

        },

        
        path: function(href){
            
            if(window.location.pathname!=href)
             history.pushState({page: new Date().getTime()}, '',href);
            
            this.invoke();
        },
        
        log: function(msg){
            console.log(msg);
        },

    }; 

    if(typeof Micro === "function" && Micro.prototype.isMicro)
         Micro['Router'] = Router;

}(window, document));