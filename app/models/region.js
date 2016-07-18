var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// set up a mongoose model
var RegionSchema = new Schema({
  country: {
    type: String,
    required: true
  },
  region: {
    type: String,
    unique: true,
    required: true
  },
  taxes: {
    pst: Number,
    gst: Number,
    hst: Number
  }
});

module.exports = mongoose.model('Region', RegionSchema);