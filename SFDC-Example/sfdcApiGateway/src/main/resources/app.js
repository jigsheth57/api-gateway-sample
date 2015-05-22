var Router = require("Router");
var HystrixCommand = require("./HystrixCommand");
var cache = require('cache');
var env = require('env');
var jsonmask = require('json-mask');

// Global Variable
var appRouter = new Router();

var sfdcClient = require('http')({
	connectTimeout : 1000,
	socketTimeout : 5000,
});

// get all contacts by accounts or create new account
appRouter.get('/accounts', function(req, res) {
	var reqObj = {url: "/query/?q=" + env("sfdc.query.accounts"), method: "GET", body: ""};
	getSFDCObj(reqObj, req, res);
});

//get all opportunities by accounts
appRouter.get('/opp_by_accts', function(req, res) {
	var reqObj = {url: "/query/?q=" + env("sfdc.query.opp_by_accts"), method: "GET", body: ""};
	getSFDCObj(reqObj, req, res);
});

// create/retrieve/update/delete account detail by id
appRouter.all('/account/:id', function(req, res, id) {
	//console.log("req.method "+ req.method);
	//console.log("req.body "+ req.body);
	var reqObj = "";
	switch(req.method) {
		case "POST" : reqObj = {url: "/sobjects/account/", method: req.method, body: req.body};break;
		case "DELETE" : reqObj = {url: "/sobjects/account/" + id + "/", method: req.method, body: ""};break;
		case "PUT" : reqObj = {url: "/sobjects/account/" + id + "/", method: "PATCH", body: req.body};break;
		default : reqObj = {url: "/sobjects/account/" + id + "/", method: "GET", body: ""};break;
	}
	getSFDCObj(reqObj, req, res);
});

// create/retrieve/update/delete contact detail by id
appRouter.all('/contact/:id', function(req, res, id) {
	var reqObj = "";
	switch(req.method) {
		case "POST" : reqObj = {url: "/sobjects/contact/", method: req.method, body: req.body};break;
		case "DELETE" : reqObj = {url: "/sobjects/contact/" + id + "/", method: req.method, body: ""};break;
		case "PUT" : reqObj = {url: "/sobjects/contact/" + id + "/", method: "PATCH", body: req.body};break;
		default : reqObj = {url: "/sobjects/contact/" + id + "/", method: "GET", body: ""};break;
	}
	getSFDCObj(reqObj, req, res);
});

// create/retrieve/update/delete opportunity by id
appRouter.all('/opportunity/:id', function(req, res, id) {
	var reqObj = "";
	switch(req.method) {
		case "POST" : reqObj = {url: "/sobjects/opportunity/", method: req.method, body: req.body};break;
		case "DELETE" : reqObj = {url: "/sobjects/opportunity/" + id + "/", method: req.method, body: ""};break;
		case "PUT" : reqObj = {url: "/sobjects/opportunity/" + id + "/", method: "PATCH", body: req.body};break;
		default : reqObj = {url: "/sobjects/opportunity/" + id + "/", method: "GET", body: ""};break;
	}
	getSFDCObj(reqObj, req, res);
});

// login to get the token
appRouter.get('/oauth2', function(req, res) {
	var endpoint = "https://login.salesforce.com/services"; // 
	//var url = "/oauth2/authorize";
	var url = "/oauth2/token";
	//var fbody = "response_type=token&client_id="+ env("sfdc.client_id") + "&redirect_uri=http://localhost:8080/api/oauth2/_callback";

	var fbody = "grant_type=password&username=" + env("sfdc.uid")
			+ "&password=" + env("sfdc.pwd") + "&client_id="
			+ env("sfdc.client_id") + "&client_secret="
			+ env("sfdc.client_key");

	var result = sfdcClient.request({
		baseUrl : endpoint,
		url : url,
		body : fbody,
		headers : {
			"Content-Type" : "application/x-www-form-urlencoded; charset=UTF-8"
		},
		method : "POST"
	}, function(response) {
		// the callback function will execute on
		// the response when its ready
		//console.log(response.body);
		var myJSONObject = eval('(' + response.body + ')');
		if (myJSONObject.instance_url) {
			cache.set("instance_url", myJSONObject.instance_url
					+ "/services/data/v33.0");
			cache.set("access_token", myJSONObject.access_token);
		}
		return {
			status : response.statusCode,
			data : jsonmask(myJSONObject, "instance_url,access_token")
		};
	});
	res.setBody(result);
});

appRouter
		.all(
				'/*catchall',
				function(req, res) {
					res
							.setBody({
								note : 'API Gateway to provide SalesForce.com\'s business objects.',
								links : [
										{
											title : 'List of Accounts with main Contact info',
											href : baseUrl + '/accounts'
										},
										{
											title : 'Account object by id',
											href : baseUrl
													+ '/account/account_id'
										},
										{
											title : 'Contact object by id',
											href : baseUrl
													+ '/contact/contact_id'
										},
										{
											title : 'List of Accounts with all of the associated Opportunity info',
											href : baseUrl + '/opp_by_accts'
										},
										{
											title : 'Opportunity object by id',
											href : baseUrl
													+ '/opportunity/opportunity_id'
										},
										{
											title : 'Login to generate oauth2 token',
											href : baseUrl + '/oauth2'
										} ]
							});
				});

function getSFDCObj(reqObj, req, res) {
	//console.log('headers: ' + req.headers.token);
	var result;
	if (req.headers.token) {
		var getSFDCBusObjCommand = new HystrixCommand(reqObj.url, "SFDCBusObj",
				function run() {
					var result1 = getResult(reqObj, req);
					return result1;
				}, function getFallback() {
					console.log("Entering fallback!");
					try {
						var result1 = cache.get(reqObj.url).then(
								function(data) {
									return (data) ? data
											: env("sfdc.service.unavailable");
								});
						return result1;
					} catch (err) {
						return env("sfdc.service.unavailable");
					}
				});
		result = getSFDCBusObjCommand.execute();
	} else {
		result = env("sfdc.service.unauthorize");
	}
	res.setBody(result);
}

function getResult(reqObj, req) {
	//throw new Error("");
	var authtoken = "Bearer " + req.headers.token;
	result = sfdcClient.request({
		baseUrl : env("sfdc.service.endpoint"),
		url : reqObj.url,
		headers : {
			Accept : 'application/json',
			Authorization : authtoken,
		},
		method : reqObj.method,
		body : reqObj.body
	}, function(response) {
		// the callback function will execute on
		// the response when its ready
		//console.log(response.statusCode);
		//console.log(response.body);
		var myJSONObject = (req.method == "GET" || req.method == "POST") ? eval('(' + response.body + ')') : {status: "completed"};
		
		if(req.method == "GET")
			cache.set(reqObj.url, "{\"status\":204,\"data\":"+response.body+"}");

		return {
			status : response.statusCode,
			data : (req.parameters.fields) ? jsonmask(myJSONObject,
					req.parameters.fields) : myJSONObject
		};
	});
	return result;
}

module.exports = appRouter;
