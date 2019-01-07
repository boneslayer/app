var express = require('express'); 
var app = express(); 

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

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    next(createError(404));
  });
  
// error handler
app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

module.exports = app; 