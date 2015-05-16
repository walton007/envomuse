'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
mongoosePaginate = require('mongoose-paginate'),
  commonUtil = require('./commonUtil');

var BaseSchema = commonUtil.BaseSchema,
ContactSchema = commonUtil.ContactSchema;
var CustomerSchema = BaseSchema.extend({
  brand: String,
  address: String,
  industry: String,
  updatePeriod: String,

  contacts: [ContactSchema],
  logo:{
    type:String,
    default:"img/default_logo.png"
  },
  status: String,
  /*{
    type: String,
    required: true,
    default: 'prospect',
    enum: ['prospect', 'meeting', 'demo', 'pilot', 'active', 'inactive'],
  },*/
  crmInfo: {
    firstContactDate: Date,
    demoDate: Date,
    pilotDate: Date,
    contractDate: Date,
    endContractDate: Date,
    salesCost: Number,
    invoice: Boolean,
  },

  designFee: Number,
  setupFee: Number,
  monthServiceFee: Number,
  otherFee: Number,
  description: String
});

/**
 * Statics
 */
CustomerSchema.statics.load = function(id, cb) {
  this.findOne({
    _id: id
  }).populate('user', 'name username').exec(cb);
};

CustomerSchema.plugin(mongoosePaginate);

mongoose.model('Customer', CustomerSchema);