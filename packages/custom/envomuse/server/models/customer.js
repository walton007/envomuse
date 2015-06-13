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
  companyName: String,
  brand: String,
  address: String,
  industry: String,
  updatePeriod: String,
  telephone: String,
  fax: String,

  contacts: [ContactSchema],
  // contacts: [],
  logo:{
    type:String,
    default:"img/default_logo.png"
  },
  status: {
    type: String,
    required: true,
    default: 'prospect',
    enum: ['prospect', 'demo', 'signed', 'inactive'],
  },
  crmInfo: {
    // manager: ContactSchema, //brand manager
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
  otherFeeComment: String,
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