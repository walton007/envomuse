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
  md5: String,
  importStatus: {
    type: String,
    required: true,
    default: 'notImport',
    enum: ['notImport', 'importing', 'imported'],
  },
  outdate: {
	  type: Boolean,
	  default: false
	}
});

mongoose.model('ComingJob', ComingJobSchema);