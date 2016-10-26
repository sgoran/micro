//https://davidwalsh.name/pubsub-javascript
;(function(){

  var topics, hOP;

  function Pubsub(){
    topics = {};
    hOP = topics.hasOwnProperty;
  };

  Pubsub.prototype = {
    subscribe: function(topic, listener) {
      // Create the topic's object if not yet created
      if(!hOP.call(topics, topic)) 
        topics[topic] = [];

      // Add the listener to queue
      var index = topics[topic].push(listener) -1;

      // Provide handle back for removal of topic
      return {
        remove: function() {
          delete topics[topic][index];
        }
      };
    },
    publish: function(topic, info) {
      // If the topic doesn't exist, or there's no listeners in queue, just leave
      if(!hOP.call(topics, topic)) return;

      // Cycle through topics queue, fire!
      topics[topic].forEach(function(item) {
      		item(info != undefined ? info : {});
      });
    }

  };

  if(typeof Micro === "function" && Micro.prototype.isMicro){
      Micro['Pubsub'] = Pubsub;
  }
  else if ( typeof module != 'undefined' && module.exports ){
    module.exports = Pubsub;
  }else if( typeof define == 'function' && define.amd ){
      define( function () { return Pubsub; }); 
  }
  else{
      window.Pubsub = Pubsub;
  }

  
})();