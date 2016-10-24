/**
 * Tpl.js 
 */
;(function (window, document){
    
    var me = this;
    
    function Tpl(props){

        me = this;
        me.props = props;
        

    }

    Tpl.prototype = {
        tplCache: {},

        //http://blog.stevenlevithan.com/archives/faster-than-innerhtml
        replaceHtml: function(el, html) {
            var oldEl = typeof el === "string" ? document.getElementById(el) : el;
            /*@cc_on // Pure innerHTML is slightly faster in IE
                oldEl.innerHTML = html;
                return oldEl;
            @*/
            var newEl = oldEl.cloneNode(false);
            newEl.innerHTML = html;
            oldEl.parentNode.replaceChild(newEl, oldEl);
            /* Since we just removed the old element from the DOM, return a reference
            to the new element, which can be used to restore variable references. */
            return newEl;
        },

        loadTpl: function(page){
            
            var me = this; 
            me.activePage = page;
            
            if(me.isRouteCached(page)){
                me.render(this.tplCache[page.tpl])
                return;
            }


            
            tplFile = this.props.tplDir+'/'+page.tpl;
            oReq = new XMLHttpRequest();

            oReq.addEventListener("load", function(){
                
                if(me.props.cache || page.cache)
                    me.cacheRoute(page, oReq.responseText);

                me.render(oReq.responseText);
            });

            oReq.open("GET", tplFile);
            oReq.send();

        },
        isRouteCached: function(page){
            return this.tplCache && this.tplCache.hasOwnProperty(page.tpl);
        },
        cacheRoute: function(page, data){
            this.tplCache[page.tpl] = data;
        },
        
        //https://github.com/addyosmani/microtemplatez/blob/master/microtemplatez.js
        parseTpl: function( tmpl, data ) {

            return tmpl.replace((RegExp("{{\\s*([a-z0-9_][.a-z0-9_]*)\\s*}}", "gi")), function (tag, k) {
                var p = k.split("."),
                    len = p.length,
                    temp = data,
                    i = 0;
                for (; i < len; i++) 
                    temp = temp[p[i]] || '';
                
                return temp;
            });
        },
        
        render: function(html){
            
            var data = (me.activePage.data || me.props.data || {}),
                source = this.parseTpl(html, data),
                container = document.getElementById(this.props.container);
            
            document.getElementById("container").className = "animated fadeOut";

            this.replaceHtml(container, source); 

            if(me.props.listeners)
                me.props.listeners.rendered();

        },

        log: function(msg){

            console.log(msg);

        },

    }; 
    
    if(typeof Micro === "function" && Micro.prototype.isMicro){
      Micro['Tpl'] = Tpl;
    }
    else if ( typeof module != 'undefined' && module.exports ){
	    module.exports = Tpl;
    }else if( typeof define == 'function' && define.amd ){
        define( function () { return Tpl; }); 
    }
    else{
        window.Tpl = Tpl;
    }



}(window, document));