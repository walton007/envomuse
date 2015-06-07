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

/**
 * Pre-save hook
 */
// SiteProgramSchema.pre('save', function(next) {
//   console.log(this.program);
//   if (this.isNew) {
//     console.log(333);
//     console.log('this.program:', this.program);
//     this.program.inUse = true;
//     this.program.save();
//   }

//   next();

//   console.log(2);
// });

mongoose.model('SiteProgram', SiteProgramSchema);