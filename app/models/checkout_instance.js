var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Region = require('./region'); // get the mongoose model
var Coupon = require('./coupon');

// set up a mongoose model
var CheckoutInstanceSchema = new Schema({
  customer: {
    email: String,
    firstname: String,
    lastname: String,
  },
  shipping: {
    address: String,
    apt: String,
    city: String,
    region: String,
    country: String,
    postal: String,
    phone: String
  },
  shipping_method: {
    price: {
      total: Number
    },
    service: {
      name: String,
      code: String
    },
    serviceStandard: {
      expectedDeliveryDate: Number,
      expectedTransitTime: Number
    }
  },
  coupon: Coupon.schema,
  tax_rate: Number,
  paymentToken: String,
  status: String
}, {
  timestamps: true
});

module.exports = mongoose.model('CheckoutInstance', CheckoutInstanceSchema);


CheckoutInstanceSchema.pre('save', function(next) {
  var instance = this;
  if (instance.shipping.postal != null) {
    instance.shipping.postal = instance.shipping.postal.toUpperCase();
    instance.shipping.postal = instance.shipping.postal.replace(/\s+/g, '');
  }

  if (instance.shipping.region != null) {
    Region.findOne({
      region: instance.shipping.region
    }, function(err, result) {
      if (err == null) {
        instance.tax_rate = result.taxes.hst + result.taxes.pst + result.taxes.gst;
      }
      next();
    })
  } else {
    next();
  }

})