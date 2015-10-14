'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;
 
var ExportRequestSchema = new Schema({
  program: {
    type: Schema.ObjectId,
    ref: 'Program'
  },
  programName: String,
  channel: {
    type: Schema.ObjectId,
    ref: 'Channel'
  },
  channelName: String,
  customer: {
    type: Schema.ObjectId,
    ref: 'Customer'
  },
  customerName: String,
  sitesArr: [{
    deviceId: String,
    siteName: String,
    licenseUuid: String
  }],

  startDate: Date,
  endDate: Date,

  dayPlaylistArr: [{
    date: Date,
    playlist: [{
      track: {
        type: Schema.ObjectId,
        ref: 'Track'
      },
      name: String,
      duration: Number,
      exactPlayTime: Number,
      fromBoxs: [String]
    }],
  }],

  createDate: {
    type: Date,
    default: Date.now,
    required: true
  },

  comment: String
});

/**
 * Statics
 */
ExportRequestSchema.statics.load = function(id, cb) {
  this.findOne({
    _id: id
  }).exec(cb);
};

mongoose.model('ExportRequest', ExportRequestSchema);