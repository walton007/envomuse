'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;
   

//----------- program, music related information  ----------------//

//some information supplied by music editor:
// name, creator, duration, 
//some information is calculated by server: md5, rawfilepath, encfilepath
var TrackSchema = new Schema({
  name: String,
  duration: Number,
  hash: {
    type: String,
    required: true,
    unique: true
  },
  rawfilepath: String,
  encfilepath: String,
  comingJob: {
    type: Schema.ObjectId,
    ref: 'comingJob'
  },
  fromBoxs: [String],
  tags: [{key: String, value: String}],
});

/**
 * Statics
 */
TrackSchema.statics.load = function(id, cb) {
  this.findOne({
    _id: id
  }).exec(cb);
};

mongoose.model('Track', TrackSchema);