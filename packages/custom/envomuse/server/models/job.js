'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

var JobSchema = new Schema({
  uuid: String,
  creator: String,
  programName: String,
  custumorName: String,
  programRule: {
    boxes: [{
      name: String,
      description: String,
      songlist: [ {
        //name: String,
        songid: {
          type: Schema.ObjectId,
          ref: 'Song'
        },
        relativePath: String
      }]
    }],
    rules: [{
      name: String,
      description: String,
      boxes: [String],
    }],
    playlists: [{
      name: String,
      timePeriods: {
        calcType: {
          type: String,
          required: true,
          default: 'daysOfWeek',
          enum: ['multipleDates', 'daysOfWeek', 'dateRange'],
        },
        daysOfWeekValues: [{ //daysOfWeek
          type: String,
          required: true,
          default: 'Mon',
          enum: ['Mon', 'Tue', 'Wed', 'Thur', 'Fri', 'Sat', 'Sun'],
        }],
        multipleDatesValues: [String],
        dateRangeValues: {startDate: String, endDate: String},
      },

      //one day is divided to 48 units, every rule may cover several units
      dayRuleUnits: [{ruleName:String, starthour: String, endhour: String}],
    }],
  }
});

/**
 * Statics
 */
JobSchema.statics.load = function(id, cb) {
  this.findOne({
    _id: id
  }).exec(cb);
};

mongoose.model('Job', JobSchema);

module.exports = exports = {
  JobSchema: JobSchema
}; 