;(function (window, document){
    
    function Router(pages, events){
        
        
        this.pages = pages;
        this.events = events;//= (Micro && Micro['Pubsub']) ? Micro['Pubsub']: false;
        var me = this;


    }

    Router.prototype = {

        /**
         * Routes init
         */
        invoke: function(){

            var me = this;
            
            this.pages && this.pages.forEach(function(page) {
                
                if(me.doesMatch(page))
                    me.events.fire('routeMatch', page);
                
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

            if(!page.match){
                this.log(page.route+" rule has no callback");
                return match;
            }
                

            var matchParams = page.match.split('/');
            matchParams.shift();

            var urlParams = urlPath.split('/');
            urlParams.shift();
            
            // should match exact route including "/" or "/page" etc
            if(urlPath==page.match)
                match = true;
            
            
            if(matchParams.length == urlParams.length){
                for(var i = 0; i<matchParams.length; i++)
                    if(matchParams[i].search(':')==0)
                        match = true;
            }
            
            
             return match;

        },

        
        path: function(href){
            
            if(window.location.pathname!=href){
             history.pushState({page: new Date().getTime()}, '',href);
            }
            this.invoke();
        },
        
        log: function(msg){
            console.log(msg);
        },

    }; 

    if(typeof Micro === "function" && Micro.prototype.isMicro)
         Micro['Router'] = Router;
    else if ( typeof module != 'undefined' && module.exports )
	    module.exports = Router;
    else if( typeof define == 'function' && define.amd )
        define( function () { return Router; }); 
    else
        window.Router = Router;

}(window, document));