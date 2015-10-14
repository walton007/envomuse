'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema,
  commonUtil = require('./commonUtil');

var BaseSchema = commonUtil.BaseSchema;


var ConnectionLogSchema = BaseSchema.extend({
  ip: String,
  mac: String,
  heartbeatTm: {
    type: Date,
    default: Date.now,
    required: true
  },
  siteid: {
    type: Schema.ObjectId,
    ref: 'Site'
  },
});
mongoose.model('ConnectionLog', ConnectionLogSchema);