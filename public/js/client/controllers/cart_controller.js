function CartController($scope, $routeParams, $http, UtilsService, UserService) {
  $scope.user = UserService.user();
  $scope.ready = false;
  var ready = function (result) {
    $scope.ready = true;
  }
  UserService.getUserInfo(ready);

  $scope.removeItem = function(item) {
    UserService.removeItemFromCart(item, function (result) {
    });
  }
  
  $scope.updateItem = function(item, q) {
    if (item.quantity != null) {
      item.quantity += q;
      UserService.updateItem(item);
    }
  }
  
  $scope.increaseQuantity = function (item) {
    if (item.quantity < 10) {
      item.quantity += 1;
      UserService.updateItem(item);
    }
  }
  $scope.decreaseQuantity = function (item) {
    if (item.quantity > 1) {
      item.quantity -= 1;
      UserService.updateItem(item);
    }
  }
  $scope.utils = UtilsService;
}