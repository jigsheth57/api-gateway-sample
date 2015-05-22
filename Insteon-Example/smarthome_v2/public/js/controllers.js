/*
 * JS file for all of the Angular controllers in the app
 */
'use strict';

/*
 * Define the Smarthome controllers scope for Angular
 */
var smarthomeControllers = angular.module('smarthomeControllers', []);

smarthomeApp.controller('HouseListController', function($scope, $http) {
	$scope.getHouses = function() {
		// when landing on the page, get all houses and show them
		$http.get('/api/houses').success(function(data) {
			//console.log("response data: " + JSON.stringify(data));
			$scope.houses = data.data.HouseList;
		}).error(function(data) {
			console.log('Error: ' + data);
			$scope.message = data.message;
			$scope.error = data.code;
		});
	};

	// Initial page load
	$scope.getHouses();
});

smarthomeApp.controller('RoomListController', function($scope, $http) {
	$scope.getRooms = function() {
		$http.get('/api/rooms').success(function(data) {
			$scope.rooms = data.data.RoomList;
		}).error(function(data) {
			console.log('Error: ' + data);
			$scope.message = data.message;
			$scope.error = data.code;
		});
	};

	// Initial page load
	$scope.getRooms();
});

smarthomeApp.controller('SceneListController', function($scope, $http) {
	$scope.getScenes = function() {
		$http.get('/api/scenes').success(function(data) {
			//console.log("response data: " + JSON.stringify(data));
			$scope.scenes = data.data.SceneList;
		}).error(function(data) {
			console.log('Error: ' + data);
			$scope.message = data.message;
			$scope.error = data.code;
		});
	};

	// Initial page load
	$scope.getScenes();
});

smarthomeApp.controller('SceneInfoController', function($scope, $http, $routeParams) {
	$scope.getScene = function() {
		$http.get('/api/scenes/'+$routeParams.id).success(function(data) {
			//console.log("response data: " + JSON.stringify(data));
			$scope.scene = data.data;
		}).error(function(data) {
			console.log('Error: ' + data);
			$scope.message = data.message;
			$scope.error = data.code;
		});
	};

	$scope.setStatus = function(sceneid,command)  {
		$http.get('/api/commands/s/'+sceneid+'/'+command).success(function(data) {
			//$scope.status = data;
		}).error(function(data) {
			console.log('Error: ' + data);
			$scope.message = data.message;
			$scope.error = data.code;
		});
	};
	
	// Initial page load
	$scope.getScene();
});

smarthomeApp.controller('DeviceListController', function($scope, $http) {
	$scope.getDevices = function() {
		$http.get('/api/devices').success(function(data) {
			//console.log("response data: " + JSON.stringify(data));
			$scope.devices = data.data.DeviceList;
		}).error(function(data) {
			console.log('Error: ' + data);
			$scope.message = data.message;
			$scope.error = data.code;
		});
	};

	// Initial page load
	$scope.getDevices();
});

smarthomeApp.controller('DeviceInfoController', function($scope, $http, $routeParams) {
	$scope.getDevice = function() {
		$http.get('/api/devices/'+$routeParams.id).success(function(data) {
			//console.log("response data: " + JSON.stringify(data));
			$scope.device = data.data;
			$http.get('/api/commands/d/'+$routeParams.id+'/get_status').success(function(sdata) {
				//console.log("response data: " + JSON.stringify(sdata));
				//$scope.status = sdata;
				setTimeout(function(){$http.get('/api/status/'+sdata.data.id).success(function(stdata) {
					//console.log("response data: " + JSON.stringify(stdata));
					$scope.status = stdata.data.response;
				});}, 1000);
			});

		}).error(function(data) {
			console.log('Error: ' + data);
			$scope.message = data.message;
			$scope.error = data.code;
		});
	};

	$scope.setStatus = function(deviceid,command)  {
		$http.get('/api/commands/d/'+deviceid+'/'+command).success(function(data) {
			//console.log("response data: " + JSON.stringify(data));
			$scope.status = data;
			setTimeout(function(){$http.get('/api/status/'+data.data.id).success(function(sdata) {
				//console.log("response data: " + JSON.stringify(sdata));
				$scope.command = sdata.data;
			});}, 2000);
			setTimeout(function(){$http.get('/api/commands/d/'+deviceid+'/get_status').success(function(sdata) {
				//console.log("response data: " + JSON.stringify(sdata));
				//$scope.command = sdata;
				setTimeout(function(){$http.get('/api/status/'+sdata.data.id).success(function(stdata) {
					//console.log("response data: " + JSON.stringify(stdata));
					$scope.status = stdata.data.response;
				});}, 1000);			
			});}, 2000);
		}).error(function(data) {
			console.log('Error: ' + data);
			$scope.message = data.message;
			$scope.error = data.code;
		});
	};
	
	// Initial page load
	$scope.getDevice();
});
