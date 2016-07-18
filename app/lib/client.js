var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var morgan = require('morgan');
var mongoose = require('mongoose');
var passport = require('passport');
var config = require('../config/database'); // get db config file
var User = require('../models/user'); // get the mongoose model
var CartItem = require('../models/cartItem'); // get the mongoose model
var Product = require('../models/product'); // get the mongoose model
var jwt = require('jwt-simple');

module.exports.set = function(apiRoutes) {

  // route to a restricted info (GET http://localhost:8080/api/memberinfo)
  apiRoutes.get('/products', function(req, res) {
    Product.find({}, '', function(err, docs) {
      if (err) {
        return res.json({
          success: false
        });
      }
      res.json({
        success: true,
        products: docs
      });
    })
  });

  apiRoutes.get('/products/:sku', function(req, res) {
    Product.findOne({
      sku: req.params.sku
    }, function(err, doc) {
      if (err) {
        return res.json({
          success: false
        });
      }

      var sizes = [];
      if (doc.sizes.os >= 0) {
        sizes.push({
          name: "One Size",
          code: "os",
          inStock: (doc.sizes.os > 0 ? true : false)
        });
      }
      if (doc.sizes.xs >= 0) {
        sizes.push({
          name: "Extra Small",
          code: "xs",
          inStock: (doc.sizes.xs > 0 ? true : false)
        });
      }
      if (doc.sizes.sm >= 0) {
        sizes.push({
          name: "Small",
          code: "sm",
          inStock: (doc.sizes.sm > 0 ? true : false)
        });
      }
      if (doc.sizes.md >= 0) {
        sizes.push({
          name: "Medium",
          code: "md",
          inStock: (doc.sizes.md > 0 ? true : false)
        });
      }
      if (doc.sizes.lg >= 0) {
        sizes.push({
          name: "Large",
          code: "lg",
          inStock: (doc.sizes.lg > 0 ? true : false)
        });
      }
      if (doc.sizes.xl >= 0) {
        sizes.push({
          name: "Extra Large",
          code: "xl",
          inStock: (doc.sizes.xl > 0 ? true : false)
        });
      }

      var clientDoc = {
        _id: doc._id,
        sku: doc.sku,
        name: doc.name,
        desc: doc.desc,
        price: doc.price,
        sizes: sizes
      }
      res.json({
        success: true,
        product: clientDoc
      });
    });
  });

  // create a new user account (POST http://localhost:8080/api/signup)
  apiRoutes.post('/signup', function(req, res) {
    if (!req.body.email || !req.body.password) {
      res.json({
        success: false,
        msg: 'Please enter a name and password.'
      });
    } else {
      var newUser = new User({
        name: req.body.email,
        password: req.body.password,
        firstname: req.body.firstname,
        lastname: req.body.lastname,
        isAdmin: false
      });
      // save the user
      newUser.save(function(err) {
        if (err) {
          return res.json({
            success: false,
            msg: 'Email is already in use.'
          });
        }
        res.json({
          success: true,
          msg: 'Successfully created new user.'
        });
      });
    }
  });

  // route to authenticate a user (POST http://localhost:8080/api/authenticate)
  apiRoutes.post('/authenticate', function(req, res) {
    User.findOne({
      name: req.body.email
    }, function(err, user) {

      if (err || !user) {
            res.send({
              success: false,
              msg: 'Wrong email or password'
            });
      } else {
        // check if password matches
        user.comparePassword(req.body.password, function(err, isMatch) {
          if (isMatch && !err) {
            // if user is found and password is right create a token
            var token = jwt.encode(user, config.secret);
            // return the information including token as JSON

            res.json({
              success: true,
              username: user.name,
              token: 'JWT ' + token
            });
          } else {
            res.send({
              success: false,
              msg: 'Wrong email or password'
            });
          }
        });
      }
    });
  });

  // route to a restricted info (GET http://localhost:8080/api/memberinfo)
  apiRoutes.get('/userinfo', passport.authenticate('jwt', {
      session: false
    }),
    function(req, res) {
      User.findOne({
        name: req.user.name
      }).populate({
        path: 'cart._product',
        model: 'Product'
      }).exec(function(err, data) {
        if (err) return err;
        res.json({
          success: true,
          user: {
            email: data.name,
            firstname: data.firstname,
            lastname: data.lastname,
            cart: data.cart
          }
        });
      });
    });

  // REMOVE ITEM from user cart
  apiRoutes.post('/item/remove', passport.authenticate('jwt', {
    session: false
  }), function(req, res) {
      req.user.removeCartItem(req.body.sku, req.body.size);
      req.user.save(function(err) {
        if (err) return res.json({
          success: false,
          err: err
        })
        res.json({
          success: true
        });
      });

  });

  // UPDATE ITEM from user cart
  apiRoutes.post('/item/update', passport.authenticate('jwt', {
    session: false
  }), function(req, res) {
    req.user.updateCartItem(req.body.sku, req.body.size, req.body.quantity);
    req.user.save(function(err) {
      if (err) return res.json({
        success: false,
        err: err
      })
      res.json({
        success: true
      });
    });
  });
  

  // ADD ITEM to user cart
  apiRoutes.post('/item/add', passport.authenticate('jwt', {
    session: false
  }), function(req, res) {
    var item = CartItem({
      size: req.body.size,
      quantity: req.body.quantity,
      sku: req.body.sku,
      _product: req.body.product_id
    });

    req.user.addCartItem(item);
    req.user.save(function(err) {
      if (err) return res.json({
        success: false,
        err: err
      })
      res.json({
        success: true
      });
    });
  });
  // ADD ITEM to user cart
  apiRoutes.post('/item/add/multiple', passport.authenticate('jwt', {
    session: false
  }), function(req, res) {
    var items = req.body.items;
    for (var i = 0; i < items.length; i++) {
      var item = CartItem({
        size: items[i].size,
        quantity: items[i].quantity,
        sku: items[i].sku,
        _product: items[i].product_id
      });
      req.user.addCartItem(item);
    }
    req.user.save(function(err) {
      if (err) return res.json({
        success: false,
        err: err
      })
      res.json({
        success: true
      });
    });
  });

  getToken = function(headers) {
    if (headers && headers.authorization) {
      var parted = headers.authorization.split(' ');
      if (parted.length === 2) {
        return parted[1];
      } else {
        return null;
      }
    } else {
      return null;
    }
  };

}