var Router = require("Router");
var appRouter = new Router();
var jsonmask = require('json-mask');

// Global Variable
var client_id = "c7fab932-ec7e-44f4-bf3e-12626130eb951430125765.261189";
var apikey = "APIKey " + client_id;
//var endpoint = "https://private-anon-645bd75f4-insteon.apiary-mock.com/api/v2"; // mockup
// endpoint
var endpoint = "https://connect.insteon.com/api/v2"; // actual working
// endpoint
var insteonClient = require('http')({
	baseUrl : endpoint,
	connectTimeout : 1000,
	socketTimeout : 5000,
});

// routes ======================================================================

// get all devices
appRouter.get('/devices', function(req, res) {
	var url = "/devices?properties=all";
	getInsteonObj(url, req, res);
});

// get device by id
appRouter.get('/devices/:id', function(req, res, id) {
	var url = "/devices/" + id;
	getInsteonObj(url, req, res);
});

// get all rooms
appRouter.get('/rooms', function(req, res) {
	var url = "/rooms?properties=all";
	getInsteonObj(url, req, res);
});

// get all scenes
appRouter.get('/scenes', function(req, res) {
	var url = "/scenes?properties=all";
	getInsteonObj(url, req, res);
});

// get scene by id
appRouter.get('/scenes/:id', function(req, res, id) {
	var url = "/scenes/" + id;
	getInsteonObj(url, req, res);
});

//get command status by id
appRouter.get('/status/:id', function(req, res, id) {
	var url = "/commands/"+id;
	getInsteonObj(url, req, res);
});

//execute command
appRouter.get('/commands/:type/:id/:status', function(req, res, type, id, status) {
	var url = "/commands";
	sendCommand(url, req, res, type, id, status);
});

// get all houses
appRouter.get('/houses', function(req, res) {
	var url = "/houses?properties=all";
	getInsteonObj(url, req, res);
});

//login to get the token

appRouter.get('/oauth2', function(req, res) {
	var url = "/oauth2/token";
	var uid = "jigsheth@gmail.com";
	var pwd = "1-Icabp1_t-1";
	var fbody = "grant_type=password&username=" + uid + "&password=" + pwd
			+ "&client_id=" + client_id;
	var result = insteonClient.request({
		url : url,
		body : fbody,
		headers : {"Content-Type":"application/x-www-form-urlencoded; charset=UTF-8"},
		method : "POST"
	}, function(response) {
		// the callback function will execute on the repsonse when its ready
		//console.log(response.body);
		var myJSONObject = eval('(' + response.body + ')');
		return {
			status : response.statusCode,
			data : jsonmask(myJSONObject, 'access_token')
		};
	});
	// res.setStatus(statusCode);
	res.setBody(result);
});

appRouter.all('*catchall', function(req, res) {
	res.setBody({
		note : 'Insteon API Gateway',
		links : [ {
			title : 'Rooms object',
			href : baseUrl + '/rooms'
		}, {
			title : 'Houses object',
			href : baseUrl + '/houses'
		}, {
			title : 'Devices object',
			href : baseUrl + '/devices'
		}, {
			title : 'Device by id object',
			href : baseUrl + '/devices/device_id'
		}, {
			title : 'Scenes object',
			href : baseUrl + '/scenes'
		}, {
			title : 'Scene by id object',
			href : baseUrl + '/scenes/scene_id'
		}, {
			title : 'Any Insteon objects attributes can be filter by using json-mask to fields param',
			href : baseUrl + '/devices?fields=DeviceList(DeviceID,DeviceName)'
		} ]
	});
});

function getInsteonObj(url, req, res) {
	//console.log('headers: ' + req.headers.token);
	if (req.headers.token) {
		var authtoken = "Bearer " + req.headers.token;
		var result = insteonClient.request({
			url : url,
			headers : {
				Accept : 'application/json',
				Authentication : apikey,
				Authorization : authtoken,
			},
		}, function(response) {
			// the callback function will execute on the repsonse when its ready
			var myJSONObject = eval('(' + response.body + ')');

			return {
				status : response.statusCode,
				data : (req.parameters.fields) ? jsonmask(myJSONObject, req.parameters.fields) : myJSONObject
			};
		});
	} else {
		result = "{\"status\":401,\"data\": \"You are not authorized to access this resource.\"}";
	}
	res.setBody(result);
}

function sendCommand(url, req, res, type, id, status) {
	if (req.headers.token) {
		var authtoken = "Bearer " + req.headers.token;
		command = "{\"command\":\""+status+"\",\""+(type == 'd' ? 'device_id' : 'scene_id')+"\":"+id+"}";
		var result = insteonClient.request({
			url : url,
			headers : {"Content-Type":"application/json; charset=UTF-8","Authentication":apikey,"Authorization":authtoken},
			body: command,
			method : "POST"
		}, function(response) {
			// the callback function will execute on the repsonse when its ready
			var myJSONObject = eval('(' + response.body + ')');

			return {
				status : response.statusCode,
				data : (req.parameters.fields) ? jsonmask(myJSONObject, req.parameters.fields) : myJSONObject
			};
		});
	} else {
		result = "{\"status\":401,\"data\": \"You are not authorized to access this resource.\"}";
	}
	res.setBody(result);
}

module.exports = appRouter;
