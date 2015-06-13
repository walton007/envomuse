'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

var SiteTimelineLogSchema = new Schema({
  prevPlayerStatus: {
    type: String,
    required: true,
    default: 'offline',
    enum: ['online', 'offline', 'local'],
  },
  curPlayerStatus: {
    type: String,
    required: true,
    default: 'offline',
    enum: ['online', 'offline', 'local'],
  },
  commentArray: [{content: String, date: Date, userName: String} ],
  created: Date,
  site: {
    type: Schema.ObjectId,
    ref: 'Site'
  }
});

mongoose.model('SiteTimelineLog', SiteTimelineLogSchema);