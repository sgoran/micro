var express = require('express'), app = express();

app.get('/*',function(request, response, next) {
  if((/\.(gif|jpg|jpeg|png|js|css|html)$/i).test(request.url))
    next();
  else
    response.sendFile(__dirname+'/example/dev.html');
 });


['/', '/src', '/build', '/example/img', '/example/tpl'].forEach(function(path){
  app.use('/', express.static(__dirname + path));
});

['/', '/src', '/build', '/example/img', '/example/tpl'].forEach(function(path){
  app.use('/:path', express.static(__dirname + path));
});

 
app.listen(8080, function () {
  console.log('**** START on 8080****');
});
