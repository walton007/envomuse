'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema,
  commonUtil = require('./commonUtil');

var BaseSchema = commonUtil.BaseSchema;

var JobSchema = BaseSchema.extend({
  uuid: String,
  creator: String,
  programName: String,
  custumorName: String,
  delete: Boolean,
  programRule: {
    boxes: [{
      name: String,
      description: String,
      songlist: [ {
        //name: String,
        songid: {
          type: Schema.ObjectId,
          ref: 'Song'
        }
      }]
    }],
    rules: {
      name: String,
      description: String,
      boxes: [String],
    },
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
        multipleDatesValues: [Date],
        dateRangeValues: {startDate: Date, endDate: Date},
      },

      //one day is divided to 48 units, every rule may cover several units
      dayRuleUnits: [{ruleName:String, starthour: Number, endhour: Number}],
    }],
  }
});

mongoose.model('Job', JobSchema);