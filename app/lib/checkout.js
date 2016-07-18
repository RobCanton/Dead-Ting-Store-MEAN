var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var morgan = require('morgan');
var mongoose = require('mongoose');
var config = require('../config/database'); // get db config file
var Coupon = require('../models/coupon');
var User = require('../models/user');
var CheckoutInstance = require('../models/checkout_instance'); // get the mongoose model
var stripe = require("stripe")("sk_test_fk3JeVb54XYgsrco3SlCYd90");
var mailgun = require("mailgun-js")({
  apiKey: "key-f109f3dc65e417e72964a3b29a2411b9",
  domain: "deadting.com"
});

module.exports.set = function(apiRoutes) {


  var CanadaPost = require('./canadapost')('a6d6e00c0c94fdd8', '1c18bcacb93be1dfd85b19', '8461315');
  CanadaPost.setOriginPostalCode('L3P8M1');

  apiRoutes.post('/checkout/instance', function(req, res) {

    var instance = new CheckoutInstance({
      status: "CHECKOUT"
    })

    var user = req.body.email;

    // PULL USER INFORMATION
    if (user != null) {
      User.findOne({
        name: user
      }, function(err, user) {
        if (err || user == null) return res.json({
          success: false
        })
        instance.customer.email = user.name;
        instance.customer.firstname = user.firstname;
        instance.customer.lastname = user.lastname;

        instance.save(function(err, doc) {
          if (err) return res.json({
            success: false
          });
          res.json({
            success: true,
            info: doc
          });
        })
      })
    } else {
      console.log("blank");
      // CREATE BLANK INSTANCE
      instance.save(function(err, doc) {
        if (err) return res.json({
          success: false
        });
        res.json({
          success: true,
          info: doc
        });
      })
    }

  })

  apiRoutes.get('/checkout/info/:id', function(req, res) {
    var id = req.params.id;
    CheckoutInstance.findById(id, function(err, instance) {
      if (err || instance == null) return res.json({
        success: false
      });
      res.json({
        success: true,
        info: instance
      })
    });
  });

  apiRoutes.post('/checkout/info/:id', function(req, res) {
    var id = req.params.id;
    console.log("Posting info to id: " + id);
    CheckoutInstance.findById(id, function(err, instance) {
      if (err || instance == null) return res.json({
        success: false
      })

      if (req.body.customer != null) {
        instance.customer = req.body.customer;
      }
      if (req.body.shipping != null) {
        instance.shipping = req.body.shipping;
      }
      if (req.body.shipping_method != null) {
        instance.shipping_method = req.body.shipping_method;
      }
      if (req.body.coupon != null) {
        instance.coupon = req.body.coupon;
      }

      instance.save(function(err) {
        if (err) return res.json({
          success: false
        });
        res.json({
          success: true
        })
      })

    });
  });

  // route to a restricted info (GET http://localhost:8080/api/memberinfo)
  apiRoutes.get('/checkout/shipping/:id', function(req, res) {
    var id = req.params.id;

    CheckoutInstance.findById(id, function(err, instance) {
      if (err) return res.json({
        success: false
      });

      var postal = instance.shipping.postal;
      if (postal == null) return res.json({
        success: false
      });

      CanadaPost.getRatesDomestic({
          weight: 0.135, // kg
          dimensions: {
            length: 10,
            width: 10,
            height: 10
          },
          destinationPostalCode: postal
        },
        function(err, _rates) {
          if (err) {
            console.log("No shipping info");
            return res.json({
              success: false
            });
          }
          res.json({
            success: true,
            rates: _rates
          });
        });
    });

  });


  apiRoutes.post('/checkout/payment/:id', function(req, res) {
    var id = req.params.id;

    CheckoutInstance.findById(id, function(err, instance) {
      if (err) return res.json({
        success: false
      });

      //       var total = req.body.total;
      var token = req.body.token;
      if (token == null) return res.json({
        success: false
      });

      instance.paymentToken = token;

      instance.save(function(err) {
        if (err) return res.json({
          success: false
        });
        res.json({
          success: true
        })
      })

    });
  });


  var submitOrder = function(instance) {

  }


  apiRoutes.post('/checkout/charge/:id', function(req, res) {
    var id = req.params.id;
    var total = req.body.total;
    CheckoutInstance.findById(id, function(err, instance) {
      if (err) return res.json({
        success: false
      });

      var charge = stripe.charges.create({
        amount: total * 100, //convert to cents,
        currency: "cad",
        source: instance.paymentToken,
        description: instance.customer.email,
        metadata: {
          checkout_id: id
        }
      }, function(err, charge) {
        if (err && err.type === 'StripeCardError') {
          return res.json({
            success: false,
            msg: "Card has been declined."
          })
        }

        instance.status = "ORDER RECEIVED";
        instance.save(function(err, _instance) {
          if (err) return res.json({
            success: false
          })
          console.log("_instance");

          var data = {
            from: 'Sales - Dead Ting Apparel <sales@deadting.com>',
            to: 'support@deadting.com',
            subject: _instance.customer.email + " completed an order",
            html: '<b>' + _instance.customer.email + ' has completed an order.</b><br/>'
          };

          mailgun.messages().send(data, function(error, body) {
            console.log(body);
          });

          res.json({
            success: true,
            order: _instance
          });
        })

      })
    });
  });


  apiRoutes.get('/checkout/coupon/:id/:code', function(req, res) {
    var id = req.params.id;
    var code = req.params.code;

    Coupon.findOne({
      code: code
    }, function(err, coupon) {
      if (err || coupon == null) return res.json({
        success: false
      })
      CheckoutInstance.findById(id, function(err, instance) {
        if (err || instance == null) return res.json({
          success: false
        });

        instance.coupon = coupon;
        instance.save(function(err) {
          if (err) return res.json({
            success: false
          })

          res.json({
            success: true,
            info: instance
          })
        })


      });
    });
  })




}