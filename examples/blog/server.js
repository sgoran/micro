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
    response.sendFile(__dirname+'/'+file+'.html');
 });


['/', '/src', '/img', '/js', '/vendor'].forEach(function(path){
  app.use('/', express.static(__dirname + path));
});

['/', '/src', '/img', '/js', '/vendor'].forEach(function(path){
  app.use('/:path', express.static(__dirname + path));
});

 
app.listen(8080, function () {
  console.log('**** START on 8080****');
});
