'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema,
  commonUtil = require('./commonUtil');

var BaseSchema = commonUtil.BaseSchema;

var TaskSchema = BaseSchema.extend({
  taskId: String,
  type: String,
  status: {
    type: String,
    required: true,
    default: 'idle',
    enum: ['idle', 'running', 'finished'],
  }
});

mongoose.model('Task', TaskSchema);