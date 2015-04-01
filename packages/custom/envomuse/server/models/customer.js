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

mongoose.model('Customer', CustomerSchema);