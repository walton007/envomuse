'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  commonUtil = require('./commonUtil');

var BaseSchema = commonUtil.BaseSchema,
ContactSchema = commonUtil.ContactSchema;

var CustomerSchema = BaseSchema.extend({
  brand: String,
  address: String,
  industry: String,
  updatePeriod: String,

  contacts: [ContactSchema],

  state: {
    type: String,
    required: true,
    default: 'prospect',
    enum: ['prospect', 'meeting', 'demo', 'pilot', 'active', 'inactive'],
  },
  crmInfo: {
    firstContactDate: Date,
    demoDate: Date,
    pilotDate: Date,
    contractDate: Date,
    endContractDate: Date,
    salesCost: Number,
    invoice: Boolean,
  }
});

/**
 * Statics
 */
CustomerSchema.statics.load = function(id, cb) {
  this.findOne({
    _id: id
  }).populate('user', 'name username').exec(cb);
};

mongoose.model('Customer', CustomerSchema);