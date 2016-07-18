var mongoose = require('mongoose');
var Schema = mongoose.Schema;


// set up a mongoose model
var ProductSchema = new Schema({
  sku: {
    type: String,
    unique: true,
    required: true
  },
  name: {
    type: String,
  },
  desc: {
    type: String,
  },
  price: {
    type: Number,
  },
  sizes: { 
    os: Number,
    xs: Number,
    sm: Number,
    md: Number,
    lg: Number,
    xl: Number
  },
  details: {
    weight: Number,
    dimensions: {
      width: Number,
      height: Number,
      length: Number
    }
  }
});

ProductSchema.pre('save', function(next) {
  // Verify product info
  next();
});


module.exports = mongoose.model('Product', ProductSchema);