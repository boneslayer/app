var express = require('express'); 
var app = express(); 
var server = require('http').Server(app);
var path = require("path");
var fs = require('fs');

//------------------------------
app.set('jsonp callback', true);

app.get('/list', function(req, res) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Charset','utf-8');
    res.header('Content-Type', 'application/json');

    var jsonp_callback = app.get('jsonp callback name');
    var jsonp = (req.query[jsonp_callback]);
    var result = dirTree('uploads');
    if (jsonp) {
        res.jsonp(result);
    }
    else {
        res.json(result);
    }
});

//--------------------------
function dirTree(filename) {
    var stats = fs.lstatSync(filename),
        info = {
            path: filename,
            name: path.basename(filename)
        };

        if (stats.isDirectory()) {
        info.type = "folder";
        info.children = fs.readdirSync(filename).map(function(child) {
            return dirTree(filename + '/' + child);
        });
    } else {
        info.type = "file";
    }
    
    return info;
}

//------------------------------------------------------
app.use(express.static(path.join(__dirname, 'public')));

app.all('/*', function(req, res, next) {
    // Just send the index.html for other files to support HTML5Mode
    res.sendFile('index.html', { root: __dirname + '/public' });
});

server.listen(3000, function() {
    console.log(path.resolve(__dirname + '/public'));
    console.log('Listening on port %d', server.address().port);
}); 