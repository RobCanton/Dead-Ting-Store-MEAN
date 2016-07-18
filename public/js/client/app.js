var MyApp = angular.module('MyStore', ['ngRoute', 'angularSpinners', 'angularPayments', 'btford.socket-io']).
config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
  $routeProvider.when('/store', {
    templateUrl: 'views/store.html',
    controller: StoreController
  }).when('/item/:productSku', {
    templateUrl: 'views/product.html',
    controller: ItemController
  }).when('/cart', {
    templateUrl: 'views/cart.html',
    controller: CartController
  }).when('/account', {
    templateUrl: 'views/account.html',
    controller: AccountController
  }).when('/account/login', {
    templateUrl: 'views/login.html',
    controller: LoginController
  }).when('/gallery', {
    templateUrl: 'views/gallery.html',
    controller: GalleryController
  }).when('/checkout', {
    templateUrl: 'views/checkout/checkout_login.html',
    controller: CheckoutLoginController
  }).when('/checkout/info', {
    templateUrl: 'views/checkout/checkout_info.html',
    controller: CheckoutInfoController
  }).when('/checkout/shipping', {
    templateUrl: 'views/checkout/checkout_shipping.html',
    controller: CheckoutShippingController
  }).when('/checkout/payment', {
    templateUrl: 'views/checkout/checkout_payment.html',
    controller: CheckoutPaymentController
  }).when('/checkout/review', {
    templateUrl: 'views/checkout/checkout_review.html',
    controller: CheckoutReviewController
  }).otherwise({
    redirectTo: '/store'
  });
 
  
}]);

MyApp.run(function($rootScope, $window,  UserService, AuthService, AUTH_EVENTS) {
  UserService.getUserInfo();
  
  $rootScope.$on(AUTH_EVENTS.notAuthenticated, function(event) {
    console.log("Session lost");
    UserService.logout(function() {
      
    });
  });
})


MyApp.service("UtilsService", function() {
  var getSizeStringFromCode = function(code) {
      var str = "";
      switch (code) {
        case "xs":
          str = "Extra Small"
          break;
        case "sm":
          str = "Small"
          break;
        case "md":
          str = "Medium"
          break;
        case "lg":
          str = "Large"
          break;
        case "xl":
          str = "Extra Large"
          break;
        default:
          str = "One Size"
      }
    return str; 
   }
    // return data object with store and cart
  return {
    getSizeStringFromCode: getSizeStringFromCode
  };
});

MyApp.factory('socket', function (socketFactory) {
  return socketFactory();
});

