'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Job = mongoose.model('Job'),
  Program = mongoose.model('Program'),
  moment = require('moment-range'),
  Chance = require('chance'),
  programController = require('./program'),
  siteProgramController = require('./siteProgram'),
  Q = require('q'),
  _ = require('lodash');

exports.all = function(req, res) {
  console.log('all jobs');
  // return only basic information
  Job.find().sort('-created')
  .select('_id creator customerName programName')
  .exec(function(err, jobs) {
    if (err) {
      return res.status(500).json({
        error: 'Cannot list the jobs'
      });
    }

    //Get Program from jobs
    programController.getProgramCountFromJobs(jobs)
    .then(function(retJobs) {
      res.json(retJobs);
    }, function(err) {
      return res.status(400).json({
        error: 'getProgramCountFromJobs failed'
      });
    });
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

exports.box = function(req, res, next) {
  var uuid = req.param("boxId");
  if (!uuid) {
    return res.status(400).json({
      error: 'boxid needed'
    });
  };

  var boxes = _.filter(req.job.programRule.boxes, {uuid: uuid});
  if (boxes.length) {
    return res.json(boxes[0]);
  };

  return res.status(400).json({
    error: 'no such boxid'
  });

};


exports.statistic = function(req, res, next) {
  if (!('statistic' in req.query)) {
    next();
    return;
  }

  Job.count(function(err, count) {
    if (err) {
      console.error('Job count error:', err);
      return res.status(500).json({
        error: 'count the Job error'
      });
    }

    res.json({
      // Jun added
      // count: count
      active: count,
      inactive: 0
    });
    return;
  });
};

function translateDateString(dateString) {
  return moment(dateString);
}

function translateDayString(dayString) {
  console.log('translateDayString dayString:', dayString);
  var dayOfWeekMap = {'Mon': moment().day(1),
         'Tue': moment().day(2), 
         'Wed': moment().day(3),
         'Thur': moment().day(4),
         'Fri': moment().day(5), 
         'Sat': moment().day(6),
         'Sun': moment().day(0)};
  return dayOfWeekMap[dayString];
}

function translateDayRuleUnitString(ruleUnitString) {
  console.log('translateDayRuleUnitString:', ruleUnitString);
  return moment().hour(parseInt(ruleUnitString));
}

//Define the song selection strategy
var chance = new Chance(12345); 
function randomFromBox(ctx, box) {
  var idx = chance.integer({min: 0, max: box.songlist.length-1}) 
  return box.songlist[idx];
}

function getTimeInCurDay(mmt) {
  return mmt.milliseconds()
  + mmt.seconds() *1000
  + mmt.minutes() *60*1000
  + mmt.hours() *60 *60 *1000;
}

function generatePlaylistFromRule(ctx) {
  console.log('generatePlaylistFromRule:', ctx.starthour.toISOString());
  var starthourAsMs = getTimeInCurDay(ctx.starthour),
    endhourAsMs = getTimeInCurDay(ctx.endhour);

    ctx.lasthour = moment.max(ctx.lasthour, ctx.starthour);
  
  var breakFlag = false;
  var i = 0;
  var lasthourAsMs = getTimeInCurDay(ctx.lasthour);
  while (true) {
    if (i > 1000 || breakFlag || lasthourAsMs > endhourAsMs) {
      break;
    };
    i++;
    // console.log('starthourAsMs:', starthourAsMs, 'endhourAsMs:', endhourAsMs, 'lasthourAsMs:', lasthourAsMs);
    
    // console.log();
    _.each(ctx.currentRule.boxes, function(boxKey) {
      if (breakFlag || lasthourAsMs > endhourAsMs) {
        breakFlag = true;
        return;
      };
      var songObj = randomFromBox(ctx, ctx.boxes[boxKey]);
      var track = {
        song: songObj.song,
        displayTm: ctx.lasthour.format("LTS"),
        milliseconds: lasthourAsMs,
        duration: !!songObj.duration ? songObj.duration : 3*60*1000 
      };
      //update ctx
      ctx.lasthour.add(track.duration, 'milliseconds');
      //update lasthourAsMs
      lasthourAsMs = getTimeInCurDay(ctx.lasthour);
      ctx.playlist.push(track);
    });
  }
}

function generatePlaylistFromJob(checkDay, job) {
  console.log('generatePlaylistFromJob for day:', checkDay.format('L'));
  
  var jobJson = job.toJSON();
  var sortedPlaylists = _.sortBy(jobJson.programRule.playlists, 
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
        if (translateDayString(curPlaylist.timePeriods.daysOfWeekValues[j]).day() === checkDay.day()) {
          findPlaylist = curPlaylist;
          break;
        }
      };
    };

    if (findPlaylist) {
      break;
    };
  };

  if (!findPlaylist) {
    console.warn('Not find suitable playlist');
    return null;
  }

  // var dayRuleUnits = _.cloneDeep(findPlaylist.dayRuleUnits;
  var dayRuleUnits = findPlaylist.dayRuleUnits;
  console.log('dayRuleUnits is:', dayRuleUnits);

  var ctx = {
    playlist: [],
    boxes: job.programRule.boxes,
    lasthour: undefined,

    currentRule: undefined,
    starthour: undefined,
    endhour: undefined
  };

  _(job.programRule.boxes).each(function(box) {
    ctx.boxes[box.name] = box;
  });

  var selectedSongPair = [];
  console.log('findPlaylist.dayRuleUnits:', dayRuleUnits);
  var sortedDayRuleUnits = _.sortBy(dayRuleUnits, 
    function(dayRuleUnit) {
      dayRuleUnit.starthour = translateDayRuleUnitString(dayRuleUnit.starthour);
      dayRuleUnit.endhour = translateDayRuleUnitString(dayRuleUnit.endhour);
      return dayRuleUnit.starthour;
    });
  if (sortedPlaylists.length === 0) {
    return null;
  };
  // ctx.lasthour = moment(sortedPlaylists[0].starthour.toISOString());
  ctx.lasthour = moment(sortedPlaylists[0].starthour);
  
  _(sortedDayRuleUnits).each(function(sortedDayRuleUnit) {
    console.log(sortedDayRuleUnit.ruleName, sortedDayRuleUnit.starthour.toISOString()
      ,sortedDayRuleUnit.endhour.toISOString());
    //find rule
    var rules = _.filter(job.programRule.rules, function(rule) {
      return rule.name === sortedDayRuleUnit.ruleName;
    }), rule = rules[0];
    //Generate Playlist from rule
    ctx.starthour = sortedDayRuleUnit.starthour;
    ctx.endhour = sortedDayRuleUnit.endhour;
    ctx.currentRule = rule;
    generatePlaylistFromRule(ctx);
  });

  return ctx.playlist;
}

function generateProgramFromJob(startDate, endDate, job) {
  console.log('generateProgramFromJob 1');
  var invalidDays = [];
  var validDays = [];
  var range = moment.range(startDate, endDate.subtract(1, 'days'));
  range.by('days', function(checkDay) {
    //generate playlist for current moment
    var playlist = generatePlaylistFromJob(checkDay, job);
    if (!playlist) {
      invalidDays.push(checkDay);
    } else {
      validDays.push({
        // date: checkDay.format('L'),
        date: checkDay,
        playlist: playlist
      })
    }
  });
  return {
    validDays: validDays,
    invalidDays: invalidDays
  };
}

function generateProgramRecord(job, startDate, endDate, programName, validDays) {
  var deferred = Q.defer();
  var program = new Program({
    name: programName,
    customerName: job.customerName,
    job: job,
    startDate: startDate,
    displayStartDate: startDate.format('L'),
    endDate: endDate,
    displayEndDate: endDate.format('L')
  });
  program.dayPrograms = _.map(validDays, function(obj) {
    var dayProgram = {
      date: obj.date,
      displayDate: obj.date.format('L'),
      playlist: []
    };
    dayProgram.playlist = _.map(obj.playlist, function(trackObj) {
      return {
        song: trackObj.song,
        milliseconds: trackObj.milliseconds,
        duration: trackObj.duration,
        displayTm: trackObj.displayTm
      };
    });
    
    return dayProgram;
  });

  program.save(function(err, newObj) {
    if (err) {
      console.warn('create err:', err);
      deferred.reject(err);
      return;
    }
    deferred.resolve(newObj);
  });

  return deferred.promise;
}

exports.generateProgram = function(req, res, next) {
  req.checkBody('startDate', 'invalid startDate').isDate();
  req.checkBody('endDate', 'invalid endDate').isDate();
  var errors = req.validationErrors(true);
  if (errors) {
    res.send(errors, 400);
    return;
  }

    var startDate = moment(req.body.startDate),
       endDate  = moment(req.body.endDate);
    //Check startDate and endDate
    if (!startDate.isValid() || !endDate.isValid() || moment.max(startDate, endDate) === startDate) {
      return res.status(500).json({
        error: 'require startDate & endDate'
      });
    };
    //generateProgram
    var result = generateProgramFromJob(startDate, endDate, req.job);
    if (result.invalidDays.length) {
      res.json({
        invalidDays: result.invalidDays
      }, 400);
    } else {
      console.log('have validDays');
      //generate program valid now!
      generateProgramRecord(req.job, startDate, endDate,
       req.body.name ? req.body.name : req.job.programName, result.validDays)
      .then(function(program){
        res.json(program);
      }, function(err) {
        res.json({
          createProgramErr: err
        }, 400);
      });
    }
    
  }

exports.show = function(req, res, next) {
  Program.find({
    job: req.job
  })
  .select('_id name startDate endDate created')
  .exec(function(err, programs) {
    if (err) {
      console.warn('programs err:', err);
      res.json({
        getProgramErr: err
      }, 400);
      return;
    }

    siteProgramController.getSiteReferenceCountFrom(programs)
    .then(function(retPrograms) {
      var retJob = req.job.toJSON();
      retJob.programs = retPrograms;
      res.json(retJob);
    }, function(err) {
      res.json({
        getSiteReferenceCountFrom: err
      }, 400);
    });
    
  });
}