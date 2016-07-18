angular.module('MyStore')

.service('LocalCart', function($http, API_ENDPOINT) {
  var cartName = "dtx"
  var items = [];

  var saveItems = function() {
    if (localStorage != null && JSON != null) {
      localStorage[cartName + "_items"] = JSON.stringify(items);
    }
  }

  var clearItems = function() {
    items = [];
    saveItems();
    localStorage.removeItem(cartName + "_items");
  }

  var populateProductData = function(index, callback) {
    if (items[index] != null) {
      $http.get(API_ENDPOINT.url + '/product/' + items[index].sku).then(function(result) {
        if (result.data.success) {
          items[index]._product = result.data.product;
          if (index < items.length - 1) {
            populateProductData(index + 1, callback);
          } else {
            callback(true);
          }
        } else {
          callback(false);
        }
      });
    }
  }

  var loadItems = function() {
    items = [];
    var storedItems = localStorage != null ? localStorage[cartName + "_items"] : null;
    if (storedItems != null && JSON != null) {
      try {
        var _items = JSON.parse(storedItems);
        for (var i = 0; i < _items.length; i++) {
          var item = _items[i];
          if (item.sku != null && item.size != null && item.quantity != null && item.product_id != null && item._product != null) {
            item = {
              sku: item.sku,
              size: item.size,
              quantity: item.quantity,
              product_id: item.product_id,
              _product: item._product
            };
            items.push(item);
          }
        }
      } catch (err) {
        // ignore errors while loading...
      }
    }
  }

  var findItemIndex = function(item) {
    for (var i = 0; i < items.length; i++) {
      if (items[i].sku == item.sku && items[i].size == item.size) {
        return i;
      }
    }
    return -1;
  }

  var addItem = function(item,callback) {
    if (item.quantity !== 0) {
      var index = findItemIndex(item);
      if (index != -1) {
        items[index].quantity = items[index].quantity + item.quantity;
        // save changes
        saveItems();
        callback();
      } else {
        var newItem = {
          sku: item.sku,
          size: item.size,
          quantity: item.quantity,
          product_id: item.product_id
        };
        $http.get(API_ENDPOINT.url + '/product/' + item.sku).then(function(result) {
          if (result.data.success) {
            newItem._product = result.data.product;
            items.push(newItem);
            // save changes
            saveItems();
            callback();
          }
        });
        
      }
      
    }
  }

  var removeItem = function(item) {
    var index = findItemIndex(item);
    if (index != -1) {
      items.splice(index, 1);
      saveItems();
    }
  }
  
  var updateItem = function(item) {
    var index = findItemIndex(item);
    if (index != -1) {
      items[index].quantity = item.quantity;
      saveItems();
    }
  }

  return {
    clearItems: clearItems,
    loadItems: loadItems,
    saveItems: saveItems,
    addItem: addItem,
    removeItem: removeItem,
    updateItem: updateItem,
    populateProductData: populateProductData,
    getItems: function() {
      return items
    }
  };
});