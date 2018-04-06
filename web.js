var express = require('express');
var path = require('path');

var app = express();

app.get('/', function(request, response) {
    response.sendFile(path.join(__dirname, '/index.html'));
});

app.use('/css', express.static(path.join(__dirname, 'css')));
app.use('/fonts', express.static(path.join(__dirname, 'fonts')));
app.use('/img', express.static(path.join(__dirname, 'img')));
app.use('/js', express.static(path.join(__dirname, 'js')));
app.use('/media', express.static(path.join(__dirname, 'media')));
app.use('/models', express.static(path.join(__dirname, 'models')));
app.use('/favicon.ico', express.static(path.join(__dirname, 'favicon.ico')));

var port = process.env.PORT || 8000;
app.listen(port, function() {
    console.log('Listening on ' + port);
});

