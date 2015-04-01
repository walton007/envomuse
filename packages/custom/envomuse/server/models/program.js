'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema,
  commonUtil = require('./commonUtil');

var BaseSchema = commonUtil.BaseSchema;

//----------- program, music related information  ----------------//
 
var ProgramSchema = BaseSchema.extend({
  name: String,
  jobid: {
    type: Schema.ObjectId,
    ref: 'Job'
  },
  playlists: [{
    guid: String,
    date: Date,
    tracks: [{
      id: Number,
      title: String,
      hour: Date,
      volume: Number,
      fadeIn: Number,
      fadeOut: Number,
      duration: Number,
      url:String,
    }],
  }],
  startDate: Date,
  endDate: Date,
  siteId: {
    type: Schema.ObjectId,
    ref: 'Site'
  },
});

mongoose.model('Program', ProgramSchema);