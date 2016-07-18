var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var morgan = require('morgan');
var mongoose = require('mongoose');
var passport = require('passport');
var config = require('./app/config/database'); // get db config file
var port = process.env.PORT || 5002;
var jwt = require('jwt-simple');
var http = require('http').Server(app);
var io = require('socket.io')(http);


//CORS middleware
var allowCrossDomain = function(req, res, next) {
	res.header('Access-Control-Allow-Origin', 'http://159.203.16.13:4747');
	res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
	res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');

	next();
}

app.use(allowCrossDomain);
// get our request parameters
app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(bodyParser.json());
app.use(express.static(__dirname + '/public'));

// log to console
app.use(morgan('dev'));

// Use the passport package in our application
app.use(passport.initialize());

// Route to client-side store index
app.get('/', function(req, res) {
  res.sendfile(__dirname + '/public/index.html');
});

// Route to admin-side dashboard index
app.get('/admin', function(req, res) {
  res.sendfile(__dirname + '/public/admin.html');
});

// connect to database
mongoose.connect(config.database);

// pass passport for configuration
require('./app/config/passport')(passport);

// bundle our routes
var apiRoutes = express.Router();

var adminAPI = require('./app/lib/admin.js');
adminAPI.set(apiRoutes);

var clientAPI = require('./app/lib/client.js');
clientAPI.set(apiRoutes);

var checkoutAPI = require('./app/lib/checkout.js');
checkoutAPI.set(apiRoutes);

// connect the api routes under /api/*
app.use('/api', apiRoutes);

http.listen(port, function() {
  console.log('Winter has come: ' + port);
});


// TESTING SOCKET.IO

var line_history = [];

io.on('connection', function(socket) {
  console.log('a user connected');
  socket.on('disconnect', function() {
    console.log('user disconnected');
  });
  
  socket.on('mousedown', function() {
    console.log("mousedown!");
  });
  socket.on('mouseup', function() {
    console.log("mouseup!");
  });

  for (var i in line_history) {
    socket.emit('draw_line', {
      line: line_history[i]
    });
  }

  socket.on('draw_line', function(data) {
    line_history.push(data.line);
    io.emit('draw_line', {
      line: data.line
    });
  });

});