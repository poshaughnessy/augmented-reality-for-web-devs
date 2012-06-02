var express = require('express');

var app = express.createServer(express.logger());

app.get('/', function(request, response) {
    response.send('coming soon');
    //response.sendfile(__dirname + '/index.html');
});

app.configure(function() {
    app.use('/css', express.static(__dirname + '/css'));
    app.use('/fonts', express.static(__dirname + '/fonts'));
    app.use('/img', express.static(__dirname + '/img'));
    app.use('/js', express.static(__dirname + '/js'));
    app.use('/media', express.static(__dirname + '/media'));
    app.use('/models', express.static(__dirname + '/models'));
});

var port = process.env.PORT || 8000;
app.listen(port, function() {
    console.log('Listening on ' + port);
});

