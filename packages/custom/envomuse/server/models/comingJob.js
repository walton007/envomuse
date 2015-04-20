'use strict';

console.log('comingJobs model');

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema,
  job = require('./job'),
  commonUtil = require('./commonUtil');


var ComingJobSchema = job.JobSchema.extend({
  filepath: String,
  hash: String,
  importStatus: {
    type: String,
    required: true,
    default: 'notImport',
    enum: ['notImport', 'importing', 'imported', 'badzip'],
  },
  outdate: {
	  type: Boolean,
	  default: false
	},

  extractFilepath: String
});

ComingJobSchema.method('badzip',
  function() {
    this.status = 'badzip';
    this.save(); 
  });

ComingJobSchema.method('finish',
  function() {
    this.importStatus = 'imported';
    this.save(); 
  });

mongoose.model('ComingJob', ComingJobSchema);