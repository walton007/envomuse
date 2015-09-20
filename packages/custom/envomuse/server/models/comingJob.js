'use strict';

console.log('comingJobs model');

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

var ComingJobSchema = new Schema({
  filepath: String,
  hash: String,
  meta: Schema.Types.Mixed,
  invalid: {
    required: true,
    type: Boolean,
    default: false
  },
  created: {
    type: Date,
    default: Date.now,
    required: true
  },

  extractFilepath: String
});

mongoose.model('ComingJob', ComingJobSchema);