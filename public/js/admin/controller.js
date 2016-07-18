function LoginController($scope, $routeParams, $location, AuthService) {

  $scope.submitted = false;

  $scope.loginUser = {
    email: '',
    password: ''
  };

  $scope.logout = function() {
    AuthService.logout();
  }

  $scope.login = function() {
    $scope.submitted = true;
    AuthService.login($scope.loginUser).then(function(msg) {
      console.log("Login success!");
      $location.path('/dashboard');
    }, function(errMsg) {
      console.log("Login failed!\n" + errMsg);
    });
  };
}

function DashController($scope, $routeParams, $http, $location, API_ENDPOINT, AUTH_EVENTS, AuthService) {
  
  function blockUser() {
    console.log("Not authenticated admin.");
    $location.path('/');
  }
  
  if (AuthService.isAuthenticated()) {
    $http.get(API_ENDPOINT.url + '/admininfo').then(function(result) {
      if (result.data.success) {
        console.log ("Authorized Admin");
      } else {
        blockUser();
      }
    });
  } else {
    blockUser();
  }
  
  $scope.newProduct = {
    sku:'',
    name:'',
    desc:'',
    price:0,
    stock:0,
    sizes: {
      os: -1,
      xs: -1,
      sm: -1,
      md: -1,
      lg: -1,
      xl: -1
    }
  };
  $scope.addProduct = function() {
    console.log("adding product");
    $http.post(API_ENDPOINT.url + '/addproduct', $scope.newProduct).then(function(result) {
      console.log(result.data);
    });
  }
  
  $scope.$on(AUTH_EVENTS.notAuthenticated, function(event) {
    AuthService.logout();
    console.log("session lost!");
  });
}