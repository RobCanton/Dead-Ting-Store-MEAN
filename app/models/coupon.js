var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// set up a mongoose model
var CouponSchema = new Schema({
  code: {
    type: String,
    required: true,
    unique: true
  },
  discount: {
    subtotal: Number,
    shipping: Number
  },
  description: String
});

module.exports = mongoose.model('Coupon', CouponSchema);