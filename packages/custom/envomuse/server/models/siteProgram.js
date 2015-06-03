'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

//----------- site, program mapping related information  ----------------//
 
var SiteProgramSchema = new Schema({
  creatorName: String,
  site: {
    type: Schema.ObjectId,
    ref: 'Site'
  },
  siteName: String, 
  program: {
    type: Schema.ObjectId,
    ref: 'Program'
  },
  programName: String, 
  bindDate: {
    type: Date,
    default: Date.now,
    required: true
  },
});
/**
 * Statics
 */
SiteProgramSchema.statics.load = function(id, cb) {
  this.findOne({
    _id: id
  }).exec(cb);
};

SiteProgramSchema.statics.loadBy = function(site, program, cb) {
  this.findOne({
    site: site,
    program: program
  }).exec(cb);
};

mongoose.model('SiteProgram', SiteProgramSchema);