function AccountController($scope, $routeParams, $location, $http, UserService) {
  $scope.user = UserService.user();
  $scope.ready = false;
  var ready = function (result) {
    $scope.ready = true;
  }
  
  if (UserService.isAuthenticated()) {
    ready();
  } else {
    console.log("its a bounce ting");
    $location.path('/account/login');
  }

  $scope.logout = function() {
    UserService.logout(function() {
      $location.path('/account/login');
    });
  }

}