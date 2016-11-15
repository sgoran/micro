var express = require('express'), app = express();

var file = 'index'
process.argv.forEach((val, index) => {
  if(val=='dev')
    file = 'dev';
});

app.get('/*',function(request, response, next) {
  if((/\.(gif|jpg|ico|jpeg|png|js|css|html)$/i).test(request.url))
    next();
  else
    response.sendFile(__dirname+'/examples/micro/'+file+'.html');
 });


['/', '/src', '/examples', '/examples/micro/img', '/examples/micro/tpl'].forEach(function(path){
  app.use('/', express.static(__dirname + path));
});

['/', '/src', '/examples', '/examples/micro/img', '/examples/micro/tpl'].forEach(function(path){
  app.use('/:path', express.static(__dirname + path));
});

 
app.listen(8080, function () {
  console.log('**** START on 8080****');
});
