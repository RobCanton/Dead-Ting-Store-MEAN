angular.module('MyStore')

.service('CheckoutService', function($http, API_ENDPOINT, UserService) {

  var cc;
  
  var round = function (value) {
    return Math.round(value * 100) / 100;
  }

  var loadInstanceId = function() {
    if (localStorage != null && localStorage.dtx_ci != null) {
      return localStorage.dtx_ci;
    } else {
      return null;
    }
  }

  var saveInstanceId = function(id) {
    localStorage.dtx_ci = id;
  }

  var createNewCheckoutInstance = function(next) {
    console.log("Creating new instance");
    var user = {};
    if (UserService.isAuthenticated()) {
      console.log("User is authed");
      user = {
        email: UserService.user().email
      }
    }
    console.log("doin tings");
    $http.post(API_ENDPOINT.url + "/checkout/instance", user).then(function(result) {
      console.log("call: " + result.data.success);
      if (!result.data.success) {
        return next(result.data);
      }
      console.log("wutagwan");
      console.log(result.data);
      saveInstanceId(result.data.info._id);
      next(result.data);
    });
  }

  var loadCheckoutInstance = function(id, next) {
    console.log("Using existing instance");
    $http.get(API_ENDPOINT.url + "/checkout/info/" + id).then(function(result) {
      next(result.data);
    });
  }

  var loadShippingMethods = function(next) {
    var id = loadInstanceId();
    if (id == null) {
      return next()
    }
    $http.get(API_ENDPOINT.url + "/checkout/shipping/" + id).then(function(result) {
      next(result.data);
    });
  }

  var sendInfo = function(info, next) {
    var id = loadInstanceId();
    if (id != null) {
      $http.post(API_ENDPOINT.url + "/checkout/info/" + id, info).then(function(result) {
        next();
      });
    } else {
      // bounce to start
    }
  }

  var init = function(next) {
    var id = loadInstanceId();
    if (id == null) {
      createNewCheckoutInstance(next);
    } else {
      loadCheckoutInstance(id, next);
    }
  }

  var getTotals = function(info) {
    var subtotal = UserService.user().cartInfo.subtotal;
    var shipping = null;
    var taxes = null;
    var total = null;
      
    if (info != null) {

      if (info.shipping_method != null) {
        shipping = round(info.shipping_method.price.total);
      }
      
      // DISCOUNT
      if (info.coupon != null) {
        subtotal *= 1 - info.coupon.discount.subtotal;
        shipping *= 1 - info.coupon.discount.shipping;
      }
      
      if (info.tax_rate != null) {
        taxes = round(info.tax_rate * subtotal);
      }
      
      if (info.shipping_method != null && info.tax_rate != null) {
        total = round(subtotal + shipping + taxes);
      }
      
    }
    return {
      subtotal: subtotal,
      shipping: shipping,
      taxes: taxes,
      total: total
    }
  }

  var applyCoupon = function(code, next) {
    var id = loadInstanceId();
    $http.get(API_ENDPOINT.url + "/checkout/coupon/" + id + "/" + code).then(function(result) {
        next(result.data);
    })
  }

  return {

    init: function(next) {
      init(next);
    },

    sendInfo: function(info, next) {
      sendInfo(info, next);
    },

    loadCheckoutInstance: function(id, next) {
      loadCheckoutInstance(id, next)
    },

    loadShippingMethods: function(next) {
      loadShippingMethods(next)
    },

    getTotals: function(info) {
      return getTotals(info);
    },

    sendStripeToken: function(token, next) {
      var id = loadInstanceId();
      $http.post(API_ENDPOINT.url + "/checkout/payment/" + id, {token: token}).then(function(result) {
        next(result);
      });
    },
    chargeStripeToken: function(total, next) {
      var id = loadInstanceId();
      $http.post(API_ENDPOINT.url + "/checkout/charge/" + id, {total: total}).then(function(result) {
        console.log("result: " + result);
        next(result);
      })
    },
    destroyInstance: function() {
      localStorage.removeItem("dtx_ci");
    },
    setCC: function(_cc) {
      cc = _cc;
    },
    getCC: function() {
      return cc;
    },

    applyCoupon: function(code, next) {
      applyCoupon(code, next);
    }
  }
})