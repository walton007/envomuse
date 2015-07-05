'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

var JobSchema = new Schema({
  uuid: String,
  creator: String,
  created: Date,
  brand: String,
  type: {
    type: String,
    required: true,
    default: 'simplified',
    enum: ['simplified', 'advanced'],
  },
  dateTemplates: [{
    "clock": {
      "boxes": [{
            "name": String,
            "totalLength": Number,
            "startTm": Date,
            "endTm": Date,
            "tracks": [{
              duration: Number,
              track: {
                type: Schema.ObjectId,
                ref: 'Track'
              },
            }]
          }]
    },

    "periodInfo": {
      calcType: {
        type: String,
        required: true,
        default: 'daysOfWeek',
        enum: ['multipleDates', 'daysOfWeek', 'dateRange'],
      },
      daysOfWeekValues: { //daysOfWeek
        "Mon": Boolean,
        "Tue": Boolean,
        "Wed": Boolean,
        "Thur": Boolean,
        "Fri": Boolean,
        "Sat": Boolean,
        "Sun": Boolean
      },
      multipleDatesValues: [Date],
      dateRangeValues: {startDate: Date, endDate: Date},
    }
  }]
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