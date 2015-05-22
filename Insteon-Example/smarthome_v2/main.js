// set up ========================
var express = require('express');
var session = require('express-session');
var request = require('request');
var morgan = require('morgan'); // log requests to the console (express4)
var bodyParser = require('body-parser'); // pull information from HTML POST
var cfenv = require("cfenv");
var http = require("http");

var appEnv = cfenv.getAppEnv();
var app = express(); // create our app w/ express
var server = http.createServer(app);

// configuration =================
app.use(session({
	  secret: 'ssshhhhh',
	  resave: false,
	  saveUninitialized: true
	}));

app.use(express.static(__dirname + '/public')); // set the static files location /public/img will be /img for users

app.use(morgan('dev')); // log every request to the console
app.use(bodyParser.urlencoded({
	'extended' : 'true'
})); // parse application/x-www-form-urlencoded
app.use(bodyParser.json()); // parse application/json
app.use(bodyParser.json({
	type : 'application/vnd.api+json'
})); // parse application/vnd.api+json as json

// listen (start app with node server.js) ======================================
server.listen(appEnv.port, appEnv.bind, function() {
	  console.log("SmarthomeApp is listening on port " + appEnv.url)
});

// Global Variable
var sess;
//var endpoint = "http://localhost:8080/api";  // actual working endpoint
var endpoint = "https://insteon.cfapps.io/api";  // actual working endpoint

// routes ======================================================================

// api ---------------------------------------------------------------------

// get all devices
app.get('/api/devices', function(req, res) {
	var url = endpoint + "/devices?fields=DeviceList(DeviceID,DeviceName)";
	getInsteonObjs(url, req, res);
});

//get device by id
app.get('/api/devices/:id', function(req, res) {
	var url = endpoint + "/devices/"+req.params.id+"?fields=(DeviceID,DeviceName,TimerEnabled)";
	getInsteonObjs(url, req, res);
});

// get all rooms
app.get('/api/rooms', function(req, res) {
	var url = endpoint + "/rooms?fields=RoomList(RoomName)/(DeviceList,SceneList)";
	//var url = endpoint + "/rooms";
	getInsteonObjs(url, req, res);
});

// get all scenes
app.get('/api/scenes', function(req, res) {
	var url = endpoint + "/scenes?fields=SceneList(SceneID,SceneName,TimerEnabled,OnTime,OffTime)/DeviceList(DeviceID)";
	getInsteonObjs(url, req, res);
});

//get scene by id
app.get('/api/scenes/:id', function(req, res) {
	var url = endpoint + "/scenes/"+req.params.id+"?fields=(SceneID,SceneName,TimerEnabled)/DeviceList(DeviceID)";
	getInsteonObjs(url, req, res);
});

//get command status by id
app.get('/api/status/:id', function(req, res) {
	var url = endpoint + "/status/"+req.params.id;
	getInsteonObjs(url, req, res);
});

//execute command
app.get('/api/commands/:type/:id/:status', function(req, res) {
	var url = endpoint + "/commands/"+req.params.type+"/"+req.params.id+"/"+req.params.status;
	getInsteonObjs(url, req, res);
});

// get all houses
app.get('/api/houses', function(req, res) {
	var url = endpoint + "/houses?fields=HouseList(HouseID,HouseName,IP)";
	getInsteonObjs(url, req, res);
});

function getInsteonObjs(url, req, res) {
	sess = req.session;
	if (sess.token) {
		request({
			url : url,
			headers : {
				"token" : sess.token
			},
			method : "GET"
		}, function(error, response, body) {
			//console.log("body: "+body);
			(response.statusCode >= 200 && response.statusCode <= 299) ? res.end(body) : res.end(error);
		});
	} else {
		login(sess, res, req.path);
	}
}

function login(sess, res, uri) {
	var url = endpoint + "/oauth2";
	request({
		url : url,
		method : "GET"
	}, function(error, response, body) {
		if (response.statusCode == 200) {
			//console.log(body);
			var jsonObj = JSON.parse(body);
			sess.token = jsonObj.data.access_token;
			res.redirect(uri);
		}
	});
}

// application -------------------------------------------------------------
app.get('*', function(req, res) {
	res.sendFile(__dirname + '/public/index.html'); // load the single view file
											// (angular will handle the page
											// changes on the front-end)
});
