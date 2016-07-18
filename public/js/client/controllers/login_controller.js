function LoginController($scope, $routeParams, $location, UserService) {
  $scope.user = UserService.user();
  $scope.ready = false;
  var ready = function (result) {
    $scope.ready = true;
  }
  
  if (UserService.isAuthenticated()) {
    $location.path('/account');
  } else {
    ready();
  }
  
  $scope.submitted = false;

  $scope.loginUser = {
    email: '',
    password: ''
  };

  $scope.regUser = {
    email: '',
    password: '',
    firstname: '',
    lastname: ''
  };

  $scope.login = function() {
    $scope.submitted = true;
    UserService.login($scope.loginUser, { doTransfer: true }, function(err) {
      if (err) {
        $scope.submitted = false;
        $scope.err = err;
      } else {
        $location.path('/account');
      }
    });
  };

  $scope.signUp = function() {
    $scope.submitted = true;
    UserService.register($scope.regUser, function(err) {
      if (err) {
        $scope.submitted = false;
        $scope.regErr = err;
      } else {
        $location.path('/account');
      }
    });
  };
}