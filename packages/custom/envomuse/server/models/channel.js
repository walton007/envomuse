'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;


var ChannelSchema = new Schema({
  customer: {
    type: Schema.ObjectId,
    required: true,
    ref: 'Customer'
  },
  name:{
    type: String,
    required: true,
    unique: true
  },
  type: {
    type: String,
    required: true,
    default: 'normal',
    enum: ['normal', 'special', 'default'],
  }
});

/**
 * Statics
 */
ChannelSchema.statics.load = function(id, cb) {
  this.findOne({
    _id: id
  }).exec(cb);
};

mongoose.model('Channel', ChannelSchema);