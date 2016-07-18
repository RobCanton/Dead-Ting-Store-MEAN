function ItemController($scope, $routeParams, $http, $location, UtilsService, UserService, API_ENDPOINT) {
 $scope.user = UserService.user();
  $scope.ready = false;
  var ready = function (result) {
    $scope.ready = true;
  }
  
  $scope.product = {};
  $scope.selectedSize = {};

  if ($routeParams.productSku != null) {
    $scope.product.sku = $routeParams.productSku;

    $http.get(API_ENDPOINT.url + '/products/' + $routeParams.productSku).then(function(result) {
      if (result.data.success) {
        $scope.product = result.data.product;
        $scope.selectedSize = $scope.product.sizes[0];
        ready();
      }
    });
  }
  
  $scope.addItem = function() {
    var cartItem = {
      product_id: $scope.product._id,
      sku: $scope.product.sku,
      quantity: 1,
      size: $scope.selectedSize.code
    }
    UserService.addItemToCart(cartItem, function(result) {
      $location.path('/cart');
    });
  }
}