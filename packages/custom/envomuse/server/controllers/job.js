'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Job = mongoose.model('Job'),
  Program = mongoose.model('Program'),
  moment = require('moment-range'),
  Chance = require('chance'),
  _ = require('lodash');

exports.all = function(req, res) {
  Job.find().sort('-created').exec(function(err, jobs) {
    if (err) {
      return res.status(500).json({
        error: 'Cannot list the jobs'
      });
    }
    res.json(jobs);
  });
};

/**
 * Find job by id
 */
exports.job = function(req, res, next, id) {
  Job.load(id, function(err, job) {
    if (err) return next(err);
    if (!job) return next(new Error('Failed to load job ' + id));
    req.job = job;
    next();
  });
};

function translateDateString(dateString) {
  return moment(dateString);
};
function translateDayString(dayString) {
  var dayOfWeekMap = {'Mon': moment().day(1),
         'Tue': moment().day(2), 
         'Wed': moment().day(3),
         'Thur': moment().day(4),
         'Fri': moment().day(5), 
         'Sat': moment().day(6),
         'Sun': moment().day(0)};
  return dayOfWeekMap[dayString];
};
function translateDayRuleUnitString(ruleUnitString) {
  return moment().hour(parseInt(Number));
}

//Define the song selection strategy
var chance = new Chance(12345); 
function randomFromBox(ctx, box) {
  var idx = chance.integer({min: 0, max: box.songlist.length-1}) 
  return box.songlist[idx];
}

function generatePlaylistFromJob(checkDay, job) {
  var sortedPlaylists = _.sortBy(job.programRule.playlists, 
    function(playlist) {
      var numberArr = [ 'multipleDates', 'dateRange', 'daysOfWeek']; 
      return numberArr.indexOf(playlist.timePeriods.calcType);
    }),
    findPlaylist = null;
  for (var i = sortedPlaylists.length - 1; i >= 0; i--) {
    var curPlaylist = sortedPlaylists[i],
    calcType = curPlaylist.timePeriods.calcType;
    if (calcType === 'multipleDates') {
      var multipleDatesValues = curPlaylist.timePeriods.multipleDatesValues;
      for (var j = multipleDatesValues.length - 1; j >= 0; j--) {
        if (translateDateString(multipleDatesValues[j]).dayOfYear() === checkDay.dayOfYear()) {
          findPlaylist = curPlaylist;
          break;
        }
      };
    };
    if (calcType === 'dateRange') {
      var start = translateDateString(curPlaylist.timePeriods.dateRangeValues.startDate),
      end = translateDateString(curPlaylist.timePeriods.dateRangeValues.endDate);
      var range = moment().range(start, end);
      if (range.contains(checkDay)) {
        findPlaylist = curPlaylist;
      }
    };
    if (calcType === 'daysOfWeek') {
      for (var j = curPlaylist.timePeriods.daysOfWeekValues.length - 1; j >= 0; j--) {
        if (translateDayString(curPlaylist.timePeriods.daysOfWeekValues).day() === checkDay.day()) {
          findPlaylist = curPlaylist;
          break;
        }
      };

      var daysOfWeekValues = curPlaylist.timePeriods.daysOfWeekValues;
      _(daysOfWeekValues).map(function(day) {

      })
      for (var j = multipleDatesValues.length - 1; j >= 0; j--) {
        if (moment(multipleDatesValues[j]).day() === checkDay.day()) {
          findPlaylist = curPlaylist;
          break;
        }
      };
    };

    if (findPlaylist) {
      break;
    };
  };

  if (findPlaylist) {
    var ctx = {};
    var selectedSongPair = [];
    findPlaylist.dayRuleUnits;
    var sortedDayRuleUnits = _.sortBy(findPlaylist.dayRuleUnits, 
      function(dayRuleUnit) {
        dayRuleUnit.starthour = translateDayRuleUnitString(dayRuleUnit.starthour);
        return translateDayRuleUnitString(dayRuleUnit.starthour);
      });
    if (sortedPlaylists.length === 0) {
      return null;
    };
    var curHour = sortedPlaylists[0].starthour;
    _(sortedDayRuleUnits).each(function(sortedDayRuleUnit) {
      //find rule
      var rules = _.filter(job.programRule.rules, function(rule) {
        rule.name === sortedDayRuleUnit.ruleName;
      }), rule = rules[0];
      var boxes = {};
      _(job.programRule.boxes).each(function(box) {
        boxes[box.name] = box;
      });
      //iterate rule until time used out
      _.each(rule.boxes, function(boxKey) {
        // if (curHour ) {};
        var songObj = randomFromBox(ctx, boxes[boxKey]);
        songObj.songid;
        var track = {
      id: Number,
      title: String,
      hour: Date,
      volume: Number,
      fadeIn: Number,
      fadeOut: Number,
      duration: Number,
      url:String,
    };

      });
      
    })
    return;
  };
  return null;
}

function generateProgramFromJob(startDate, endDate, job) {
  console.log('generateProgramFromJob');
  var range = moment.range(startDate, endDate);
  range.by('days', function(checkDay) {
    // Do something with `moment`
    console.log('day:', checkDay);
    //generate playlist for current moment

  });

}

exports.generateProgram = function(req, res, next) {
    var startDate = moment(req.body.startDate),
       endDate  = moment(req.body.endDate);
    //Check startDate and endDate
    if (!startDate.isValid() || !endDate.isValid() || moment.max(startDate, endDate) === startDate) {
      return res.status(500).json({
        error: 'require startDate & endDate'
      });
    };
    //generateProgram
    generateProgramFromJob(startDate, endDate, req.job);
    res.json({
      id: 100
    });
  }