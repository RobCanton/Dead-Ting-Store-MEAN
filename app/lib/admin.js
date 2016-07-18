var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var morgan = require('morgan');
var mongoose = require('mongoose');
var passport = require('passport');
var config = require('../config/database'); // get db config file
var User = require('../models/user'); // get the mongoose model
var Product = require('../models/product'); // get the mongoose model
var jwt = require('jwt-simple');

module.exports.set = function(apiRoutes) {


  // route to authenticate a user (POST http://localhost:8080/api/authenticate)
  apiRoutes.post('/admin-authenticate', function(req, res) {
    User.findOne({
      name: req.body.email
    }, function(err, user) {
      if (err) throw err;

      if (!user) {
        res.send({
          success: false,
          msg: 'Authentication failed. User not found.'
        });
      } else {
        // check if password matches
        user.comparePassword(req.body.password, function(err, isMatch) {
          if (isMatch && !err) {
            // if user is found and password is right create a token
            var token = jwt.encode(user, config.secret);

            if (user.isAdmin) {
              // return the information including token as JSON 
              res.json({
                success: true,
                token: 'JWT ' + token
              });
            } else {
              res.send({
                success: false,
                msg: 'Accessed denied. Not admin.'
              });
            }
          } else {
            res.send({
              success: false,
              msg: 'Authentication failed. Wrong password.'
            });
          }
        });
      }
    });
  });

  // Get restricted Admin info
  apiRoutes.get('/admininfo', passport.authenticate('jwt', {
    session: false
  }), function(req, res) {
    if (req.user.isAdmin) {
      res.json({
        success: true
      });
    } else {
      res.json({
        success: false
      });
    }

  });

  // Add New Product to store database
  apiRoutes.post('/addproduct', passport.authenticate('jwt', {
    session: false
  }), function(req, res) {
    if (req.user.isAdmin) {
      var newProduct = new Product({
        sku: req.body.sku,
        name: req.body.name,
        desc: req.body.desc,
        price: req.body.price,
        stock: req.body.stock,
        sizes: req.body.sizes
      });
      // save the user
      newProduct.save(function(err) {

        if (err) {
          return res.json({
            success: false,
            msg: 'Product already exists.'
          });
        }
        console.log("Saving product");
        res.json({
          success: true,
          msg: 'Successful created new product.'
        });
      });
    } else {
      res.json({
        success: false
      });
    }
  });
}