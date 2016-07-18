var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt');
var CartItem = require('./cartItem');

// set up a mongoose model
var UserSchema = new Schema({
  name: {
    type: String,
    unique: true,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  firstname: {
    type: String,
    required: true
  },
  lastname: {
    type: String,
    required: true
  },
  isAdmin: {
    type: Boolean,
    required: true
  },
  cart: [CartItem.schema]

});

UserSchema.pre('save', function(next) {
  var user = this;
  if (this.isModified('password') || this.isNew) {
    bcrypt.genSalt(10, function(err, salt) {
      if (err) {
        return next(err);
      }
      bcrypt.hash(user.password, salt, function(err, hash) {
        if (err) {
          return next(err);
        }
        user.password = hash;
        next();
      });
    });
  } else {
    console.log("user saved");
    return next();
  }
});

UserSchema.methods.comparePassword = function(passw, cb) {
  bcrypt.compare(passw, this.password, function(err, isMatch) {
    if (err) {
      return cb(err);
    }
    cb(null, isMatch);
  });
};

UserSchema.methods.findCartItemIndex = function(sku, size) {
  var user = this;
  var index = -1;
  var i;
  for (i in user.cart) {
    if (user.cart[i].sku == sku && user.cart[i].size == size) {
      index = i;
    }
  }
  return index;
}

  UserSchema.methods.addCartItem = function(item) {
    var user = this;
    var i = user.findCartItemIndex(item.sku, item.size);
    if (i != -1) {
      user.cart[i].quantity = user.cart[i].quantity + item.quantity;
    } else {
      user.cart.push(item);
    }
  }

UserSchema.methods.removeCartItem = function (sku, size) {
  var user = this;
  var i = user.findCartItemIndex(sku, size);
  if (i != -1) {
    var item = user.cart[i].remove();
    return true;
  }
  return false;
}

UserSchema.methods.updateCartItem = function (sku, size, quantity) {
  
  var user = this;
  var i = user.findCartItemIndex(sku, size);
  if (i != -1) {
    user.cart[i].quantity = quantity;
    return true;
  }
  return false;
}

UserSchema.methods.getTotalNumCartItems = function () {
  var user = this;
  var num = 0;
  for (var i = 0; i < user.cart.length; i++) {
    num += user.cart[i].quantity;
  }
  return num;
}





module.exports = mongoose.model('User', UserSchema);