var express = require('express');
var path = require('path');

var app = express();
app.use('/',express.static(path.join(__dirname,"client")));
app.get('/',function(req,res){
  res.sendFile(path.join(__dirname,'client/index.html'));
});

var server = app.listen(process.env.PORT || 3000, ()=>{
  console.log("App listening at port "+server.address().port);
});
