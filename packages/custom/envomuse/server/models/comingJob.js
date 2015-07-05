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
  importStatus: {
    type: String,
    required: true,
    default: 'notImport',
    enum: ['notImport', 'importing', 'imported', 'badzip'],
  },
  created: {
    type: Date,
    default: Date.now,
    required: true
  },
  outdate: {
	  type: Boolean,
	  default: false
	},

  extractFilepath: String
});

ComingJobSchema.method('doImporting',
  function(callback) {
    this.importStatus = 'importing';
    this.save(callback); 
  });

ComingJobSchema.method('badzip',
  function() {
    console.log(this.filepath, 'is badzip');
    this.importStatus = 'badzip';
    this.save(); 
  });

ComingJobSchema.method('finish',
  function() {
    this.importStatus = 'imported';
    this.save(); 
  });

mongoose.model('ComingJob', ComingJobSchema);