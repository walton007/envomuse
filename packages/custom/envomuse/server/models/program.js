'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema,
  commonUtil = require('./commonUtil');

var BaseSchema = commonUtil.BaseSchema;

//----------- program, music related information  ----------------//
 
var ProgramSchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  job: {
    type: Schema.ObjectId,
    ref: 'Job'
  },
  channel: {
    type: Schema.ObjectId,
    ref: 'Channel'
  },
  startDate: Date,
  endDate: Date,
  createDate: {
    type: Date,
    default: Date.now,
    required: true
  },

  dayPrograms: [{
    guid: String,
    date: Date,
    displayDate: String,
    dayTemplateName: String,
    playlist: [{
      song: {
        type: Schema.ObjectId,
        ref: 'Song',

        boxtag: 'box1Tag box2Tag'
      },
      title: String,
      hour: String,
      milliseconds: Number,
      volume: Number,
      fadeIn: Number,
      fadeOut: Number,
      duration: Number,
      // displayTm: String,
      url:String,
    }],
  }]
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