function CheckoutLoginController($scope, $location, UserService, CheckoutService) {
  $scope.user = UserService.user();
  $scope.ready = false;
  var ready = function(result) {
    $scope.ready = true;
  }
  if (UserService.isAuthenticated()) {
    $location.path('/checkout/info');
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
    UserService.login($scope.loginUser, {}, function(msg) {
      $location.path('/checkout/info');
    });
  };

  $scope.signUp = function() {
    $scope.submitted = true;
    UserService.register($scope.regUser, function(msg) {
      $location.path('/checkout/info');
    });
  };
  

}

function CheckoutInfoController($scope, $location, UserService, UtilsService, CheckoutService) {
  $scope.user = UserService.user();
  $scope.auth = UserService.isAuthenticated();
  $scope.info;
  $scope.ready = false;

  CheckoutService.init(function(result) {
    console.log("result: " + result.success);
    if (result.success) {
      $scope.info = result.info;
      $scope.totals = CheckoutService.getTotals($scope.info);

      $scope.ready = true;
    } else {
      console.log("Invalid checkout instance. restart");
    }
  });
  
  
  $scope.logout = function() {
    UserService.logout(function() {
      $location.path('/checkout');
    });
  }

  $scope.continue = function() {
    CheckoutService.sendInfo($scope.info, function(result) {
      //
      $location.path('/checkout/shipping');
    });
  };

  $scope.applyCoupon = function(code) {
    CheckoutService.applyCoupon(code, function(result) {
      if (result.success) {
        $scope.info = result.info;
        $scope.totals = CheckoutService.getTotals($scope.info);
      }
    })
  }
}

function CheckoutShippingController($scope, $location, UserService, UtilsService, CheckoutService) {
  $scope.user = UserService.user();
  $scope.auth = UserService.isAuthenticated();
  $scope.info;
  $scope.ready = false;
  console.log("dafuq");

  CheckoutService.init(function(result) {
    if (result.success) {
      $scope.info = result.info;
      if ($scope.info.shipping == null) {
        $location.path("/checkout/info");
      }
      $scope.totals = CheckoutService.getTotals($scope.info);
      CheckoutService.loadShippingMethods(function(result) {
        if (result.success) {
          $scope.methods = result.rates;
          $scope.ready = true;
        }
      });
    }
  });

  $scope.selectMethod = function(method) {
    $scope.info.shipping_method = method;
    CheckoutService.sendInfo({
      shipping_method: $scope.info.shipping_method
    }, function(result) {
      $scope.totals = CheckoutService.getTotals($scope.info);
    });
  }


  $scope.continue = function() {
    $location.path('/checkout/payment');
  }

  $scope.applyCoupon = function(code) {
    CheckoutService.applyCoupon(code, function(result) {
      if (result.success) {
        $scope.info = result.info;
        $scope.totals = CheckoutService.getTotals($scope.info);
      }
    })
  }
}

function CheckoutPaymentController($scope, $location, UserService, UtilsService, CheckoutService) {
  $scope.user = UserService.user()
  $scope.auth = UserService.isAuthenticated();
  $scope.ready = false;
  CheckoutService.init(function(result) {
    console.log("result:" + result);
    if (result.success) {
      $scope.info = result.info;
      if ($scope.info.shipping_method == null) {
        $location.path("/checkout/shipping");
      }
      $scope.totals = CheckoutService.getTotals($scope.info);
      $scope.ready = true;
    } else {
      console.log("Invalid checkout instance. restart");
    }
  });
  
  $scope.stripeCallback = function(code, result) {
    if (result.error) {
      $scope.err = "Invalid credit card credentials. Pease review your information.";
    } else {
      console.log(result);
      CheckoutService.setCC(result.card)
      CheckoutService.sendStripeToken(result.id, function(result) {
        console.log(result);
        if (result.data.success) {
          $location.path('/checkout/review');
        }
      });
    }
  }

  $scope.applyCoupon = function(code) {
    CheckoutService.applyCoupon(code, function(result) {
      if (result.success) {
        $scope.info = result.info;
        $scope.totals = CheckoutService.getTotals($scope.info);
      }
    })
  }
}

function CheckoutReviewController($scope, $location, UserService, UtilsService, CheckoutService) {
  $scope.user = UserService.user()
  $scope.auth = UserService.isAuthenticated();
  $scope.cc = CheckoutService.getCC();
  $scope.ready = false;
  if ($scope.cc == null) {
    $location.path("/checkout/payment");
  }

  CheckoutService.init(function(result) {
    if (result.success) {
      $scope.info = result.info;
      $scope.totals = CheckoutService.getTotals($scope.info);
      $scope.ready = true;
    } else {
      console.log("Invalid checkout instance. restart");
    }
  });

  $scope.submit = function() {
    CheckoutService.chargeStripeToken($scope.totals.total, function(result) {
      if (result.data.success) {
        CheckoutService.destroyInstance();
      }
    })
  }

  $scope.applyCoupon = function(code) {
    CheckoutService.applyCoupon(code, function(result) {
      if (result.success) {
        $scope.info = result.info;
        $scope.totals = CheckoutService.getTotals($scope.info);
      }
    })
  }
}