'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
mongoosePaginate = require('mongoose-paginate'),
  Schema = mongoose.Schema,
  commonUtil = require('./commonUtil');

var SiteSchema = commonUtil.BaseSchema.extend({
  channel: {
    type: Schema.ObjectId,
    required: true,
    ref: 'Channel'
  },
  channelName: String,
  channelType: String,
  customer: {
    type: Schema.ObjectId,
    required: true,
    ref: 'Customer'
  },
  customerName: String,

  siteName:{
    type: String,
    required: true,
    unique: true
  },
  reference: String,
  manager: commonUtil.ContactSchema,
  phone: String,
  address: String,
  province: String,
  city: String,
   
  exportTime: Date,
  deliveryState: {
    type: String,
    required: true,
    default: 'deliveryYes',
    enum: ['deliveryYes', 'deliveryNo'],
  },

  license: {
    uuid: String,
    deviceInfo: {
      mac: String
    },
    sshkey: String
  },

  licenseActivatedDate: Date,
  lastHeartbeat: {
    date: Date,
    version: String
  },

  disable: {
    type: Boolean,
    required: true,
    default: false
  },

  playerSetting: {
    startSyncTm: String,
    retryCnt: Number
  },

  playerStatus: {
    type: String,
    required: true,
    default: 'offline',
    enum: ['online', 'offline'],
  }
});

/**
 * Statics
 */
SiteSchema.statics.load = function(id, cb) {
  this.findOne({
    _id: id
  }).exec(cb);
};

SiteSchema.plugin(mongoosePaginate);

mongoose.model('Site', SiteSchema);


//terminal api:
// 1. active
// 2. download song
// 3, heartbeat
// 4. sync: get latest playlist param[startDt, endDt], get hash in playlist to cache 
