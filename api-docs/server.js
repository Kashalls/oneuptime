var express = require('express');
var app = express();
var path = require('path');

// set the server port
app.set('port', process.env.PORT || 1445);

// set the view engine to ejs
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// public static files
app.use(express.static(path.join(__dirname, 'public'), { maxAge: 2592000 }));

// index page
app.get('/', function (req, res) {
    res.render('pages/index');
});

app.listen(app.get('port'), function () {
    console.log("API Reference started on PORT:" + app.get('port'));
});
