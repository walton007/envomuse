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
  job: {
    type: Schema.ObjectId,
    ref: 'Job'
  },
  dayPrograms: [{
    guid: String,
    date: Date,
    displayDate: String,
    playlist: [{
      song: {
        type: Schema.ObjectId,
        ref: 'Song'
      },
      title: String,
      hour: String,
      milliseconds: Number,
      volume: Number,
      fadeIn: Number,
      fadeOut: Number,
      duration: Number,
      displayTm: String,
      url:String,
    }],
  }],
   
  startDate: Date,
  displayStartDate: String,
  endDate: Date,
  displayEndDate: String,
});

/**
 * Statics
 */
ProgramSchema.statics.load = function(id, cb) {
  this.findOne({
    _id: id
  }).exec(cb);
};

mongoose.model('Program', ProgramSchema);