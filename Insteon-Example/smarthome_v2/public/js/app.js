var smarthomeApp = angular.module('smarthomeApp', [ 'ngRoute',
		'smarthomeControllers' ]);

smarthomeApp.config([ '$routeProvider', function($routeProvider) {
	$routeProvider.when('/houses', {
		templateUrl : '/partials/houseList.html',
		controller : 'HouseListController'
	}).when('/rooms', {
		templateUrl : '/partials/roomList.html',
		controller : 'RoomListController'
	}).when('/scenes', {
		templateUrl : '/partials/sceneList.html',
		controller : 'SceneListController'
	}).when('/scenes/:id', {
		templateUrl : '/partials/sceneInfo.html',
		controller : 'SceneInfoController'
	}).when('/devices', {
		templateUrl : '/partials/deviceList.html',
		controller : 'DeviceListController'
	}).when('/devices/:id', {
		templateUrl : '/partials/deviceInfo.html',
		controller : 'DeviceInfoController'
	}).otherwise({
		redirectTo : '/rooms'
	})
} ])
