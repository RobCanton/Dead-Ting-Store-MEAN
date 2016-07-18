function StoreController($scope, $routeParams, $http, UserService, API_ENDPOINT) {
  $scope.user = UserService.user();
  $scope.ready = false;
  var ready = function (result) {
    $scope.ready = true;
  }

  $http.get(API_ENDPOINT.url + '/products').then(function(result) {
    if (result.data.success) {
      $scope.products = result.data.products;
      ready();
    }
  });

  $scope.products = [];
}