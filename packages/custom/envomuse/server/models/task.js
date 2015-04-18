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
    enum: ['idle', 'running', 'finished'],
  },
  ref: String
});

mongoose.model('Task', TaskSchema);