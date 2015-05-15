'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema,
  commonUtil = require('./commonUtil');

var BaseSchema = commonUtil.BaseSchema,
ContactSchema= commonUtil.ContactSchema;


var SiteSchema = BaseSchema.extend({
  customerid: {
    type: Schema.ObjectId,
    ref: 'Customer'
  },
  siteName:String,
  businesscenter:String,
  reference: String,
  manager: ContactSchema,
  phone: String,
  address: String,
  country: String,
  province: String,
  city: String,
  zipcode: String,
  latitude: String,
  longitude: String,
  description: String,

  license: {
    uuid: String,
    activated: {
      type: Boolean,
      required: true,
      default: false
    },
    deviceInfo: {
      mac: String
    },
    sshkey: String,

    lastConnectDate: Date,
    playerStatus: {
      type: String,
      default: 'local',
      enum: ['updated', 'local', 'partialUpate'],
    },
    activatedDate: Date,
  },

  disable: {
    type: Boolean,
    required: true,
    default: false
  },

  playerSetting: {
    startSyncTm: String,
    retryCnt: Number
  }
});

/**
 * Statics
 */
SiteSchema.statics.load = function(id, cb) {
  this.findOne({
    _id: id
  }).populate('user', 'name username').exec(cb);
};

mongoose.model('Site', SiteSchema);


//terminal api:
// 1. active
// 2. download song
// 3, heartbeat
// 4. sync: get latest playlist param[startDt, endDt], get hash in playlist to cache 
