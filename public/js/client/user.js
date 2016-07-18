angular.module('MyStore')

.service('UserService', function($http, API_ENDPOINT, LocalCart, AuthService) {
  var user = {
    email: '',
    firstname: '',
    cart: [],
    cartInfo: {
      subtotal: 0,
      numItems: 0
    }
  };
  var shipping_info = {};

  var calculateCartInfo = function() {
    var subtotal = 0;
    var numItems = 0;

    for (var i = 0; i < user.cart.length; i++) {
      subtotal += user.cart[i].quantity * user.cart[i]._product.price;
      numItems += user.cart[i].quantity;
    }

    user.cartInfo.subtotal = subtotal;
    user.cartInfo.numItems = numItems;
  }

  var getUserInfo = function(next) {
    if (AuthService.isAuthenticated()) {
      $http.get(API_ENDPOINT.url + '/userinfo').then(function(result) {
        user.email = result.data.user.email;
        user.firstname = result.data.user.firstname;
        user.cart = result.data.user.cart;
        calculateCartInfo();
        if (next != null) {
          next();
        }
      });
    } else {
      LocalCart.loadItems();
      user.cart = LocalCart.getItems();
      calculateCartInfo();

      // Verify local cart data against database
      LocalCart.populateProductData(0, function() {
        user.cart = LocalCart.getItems();
        calculateCartInfo();
      })

      if (next != null) {
        next();
      }
    }
  }

  var cartTransfer = function(next) {
    var items = []
    for (var i = 0; i < LocalCart.getItems().length; i++) {
      var item = LocalCart.getItems()[i];
      var addItem = {
        product_id: item.product_id,
        sku: item.sku,
        quantity: item.quantity,
        size: item.size
      }
      items.push(addItem);
    }
    $http.post(API_ENDPOINT.url + '/item/add/multiple', {
      items: items
    }).then(function(result) {
      LocalCart.clearItems();
      getUserInfo(next);
    });
  }

  var promptCartTransfer = function(next) {
    var c = confirm("You have items in your cart.\nDo you want to add them to: " + user.email + "?");
    if (c === true) {
      cartTransfer(next);
    } else {
      next();
    }
  }

  var login = function(user, options, next) {
    AuthService.login(user).then(function(result) {
      getUserInfo(function() {
        if (options.doTransfer != null) {
          cartTransfer(next);
        } else {
          if (LocalCart.getItems().length !== 0) {
            promptCartTransfer(function() {
              next();
            })
          } else {
            next();
          }
        }
      });
    }, function(err) {
      next(err);
    });
  }

  var logout = function(next) {
    AuthService.logout();
    LocalCart.clearItems();
    getUserInfo(next);
  }

  var register = function(user, next) {
    AuthService.register(user).then(function(msg) {
      login(user,{ doTransfer: true}, next);
    }, function(err) {
      next(err);
    });
  }

  var addItemToCart = function(item, next) {
    if (AuthService.isAuthenticated()) {
      $http.post(API_ENDPOINT.url + '/item/add', item).then(function(result) {
        next(result);
      });
    } else {
      // use local solution
      LocalCart.addItem(item, function() {
        next(true);
      });

    }
  }

  var removeItemFromCart = function(item, next) {
    if (AuthService.isAuthenticated()) {
      $http.post(API_ENDPOINT.url + '/item/remove', {
        sku: item.sku,
        size: item.size
      }).then(function(result) {
        getUserInfo();
        next(result);
      });
    } else {
      // use local solution
      LocalCart.removeItem(item);
      user.cart = LocalCart.getItems();
      calculateCartInfo();
      next(true);
    }
  }

  var updateItem = function(item) {
    if (AuthService.isAuthenticated()) {
      $http.post(API_ENDPOINT.url + '/item/update', {
        sku: item.sku,
        size: item.size,
        quantity: item.quantity
      }).then(function(result) {
        getUserInfo();
      });
    } else {
      // use local solution
      LocalCart.updateItem(item);
      user.cart = LocalCart.getItems();
      calculateCartInfo();
    }
  }

  return {
    getUserInfo: function(next) {
      getUserInfo(next);
    },
    addItemToCart: addItemToCart,
    removeItemFromCart: removeItemFromCart,
    updateItem: updateItem,
    login: function(user, options, next) {
      login(user, options, next)
    },
    logout: function(next) {
      logout(next)
    },
    register: function(user, next) {
      register(user, next)
    },
    isAuthenticated: function() {
      return AuthService.isAuthenticated()
    },
    user: function() {
      return user
    }
  };
})