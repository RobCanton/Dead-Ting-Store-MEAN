var app = angular.module('Admin', ["ngRoute"]).
config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/', {
    templateUrl: 'views/admin/login.html',
    controller: LoginController
  }).when('/dashboard', {
    templateUrl: 'views/admin/dashboard.html',
    controller: DashController
  }).otherwise({
    redirectTo: '/'
  });
}]);


