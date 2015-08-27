'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;
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
  jobName: String,
  channel: {
    type: Schema.ObjectId,
    ref: 'Channel'
  },
  customer: {
    type: Schema.ObjectId,
    ref: 'Customer'
  },
  startDate: Date,
  endDate: Date,

  dayPlaylistArr: [{
    date: Date,
    
    dateTemplateName: String, // Who defined it? what's the use of it?
    playlist: [{
      track: {
        type: Schema.ObjectId,
        ref: 'Track'
      },
      name: String,
      duration: Number,
      exactPlayTime: Number,
      fromBoxs: [String],
      // url:String,
    }],
  }],

  exported: Boolean,

  createDate: {
    type: Date,
    default: Date.now,
    required: true
  },
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