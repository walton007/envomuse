'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema,
  commonUtil = require('./commonUtil');

//----------- program, music related information  ----------------//

//some information supplied by music editor:
// name, creator, duration, 
//some information is calculated by server: md5, rawfilepath, encfilepath
var SongSchema = new Schema({
  name: String,
  duration: Number,
  tags: [{key: String, value: String}],
  hash: String,
  rawfilepath: String,
  encfilepath: String,
  
  creator: String,
  tagEditor: String,
  comingJob: {
    type: Schema.ObjectId,
    ref: 'comingJob'
  }
});


/**
 * Statics
 */
SongSchema.statics.load = function(id, cb) {
  this.findOne({
    _id: id
  }).exec(cb);
};

mongoose.model('Song', SongSchema);