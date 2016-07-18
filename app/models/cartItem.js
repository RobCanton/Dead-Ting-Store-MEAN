var mongoose = require('mongoose');
var Schema = mongoose.Schema;


// set up a mongoose model
var CartItem = new Schema({
  sku: {
    type: String,
    required: true
  },
  size: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    required: true
  },
  _product: { 
    type: Schema.ObjectId,
    ref: 'Product' 
  }
});

module.exports = mongoose.model('CartItem', CartItem);