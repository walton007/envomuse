'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema,
  commonUtil = require('./commonUtil');


var TaskSchema = new Schema({
  type: {
    type: String,
    required: true,
    enum: ['comingJob'],
  },
  status: {
    type: String,
    required: true,
    default: 'idle',
    enum: ['idle', 'running', 'finished', 'failed'],
  },
  ref: String,
  description: String,
  errorCode: Number,
  historyErrorRecordArr: [{
    description: String,
    errorCode: Number
  }]
});

TaskSchema.method('failed',
  function() {
    this.status = 'failed';
    this.save(); 
  });

TaskSchema.method('finish',
  function() {
    this.status = 'finished';
    this.save(); 
  });

mongoose.model('Task', TaskSchema);