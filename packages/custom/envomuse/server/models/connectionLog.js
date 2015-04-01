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
  heartbeatTm: Date,
  siteid: {
    type: Schema.ObjectId,
    ref: 'Site'
  },
});
mongoose.model('ConnectionLog', ConnectionLogSchema);