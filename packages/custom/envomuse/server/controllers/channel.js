'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Channel = mongoose.model('Channel'),
  Site = mongoose.model('Site'),
  Job = mongoose.model('Job'),
  Program = mongoose.model('Program'),
  Track = mongoose.model('Track'),
  Chance = require('chance'),
  moment = require('moment-range'),
  Q = require('q'),
  _ = require('lodash');

/**
 * Find channel by id
 */
exports.channel = function(req, res, next, id) {
  Channel.load(id, function(err, channel) {
    if (err) return next(err);
    if (!channel) return next(new Error('Failed to load channel ' + id));
    req.channel = channel;
    next();
  });
};

exports.addChannel = function(req, res, next) {
  req.checkBody('name', 'invalid name').notEmpty();
  req.checkBody('type', 'invalid type').notEmpty();
  var errors = req.validationErrors(true);
  if (errors) {
    res.send(errors, 400);
    return;
  }

  var channel = new Channel({
    customer: req.customer,
    name: req.body.name,
    type: req.body.type
  });

  channel.save(function(err, retObj) {
    if (err) {
      console.warn('create err:', err);
      return res.status(400).json({
        error: 'Cannot create channel'
      });
    }
    res.json(retObj);
  });
}

exports.addDefChannelForCustomer = function(customer, callback) {
  var channel = new Channel({
    customer: customer,
    name: customer.brand + 'Default',
    type: 'default'
  });

  channel.save(callback);
}

exports.getCustomerDefChannel = function(customer, callback) {
  Channel.findOne({customer: customer, type: "default"})
  .exec(callback);
}

function getSitesCount(channels) {
  var deferred = Q.defer();

  Site.aggregate([{
      $match: {
        channel: {
          $in: _.map(channels, '_id')
        }
      }
    }, {
      $group: {
        _id: '$channel',
        count: {
          $sum: 1
        }
      }
    }])
    .exec(function(err, result) {
      if (err) {
        deferred.reject(err);
        return;
      };
      var channelSiteCountMap = {};
      _.each(result, function(obj) {
        channelSiteCountMap[obj._id] = obj.count;
      })

      var retChannels = _.map(channels, function(channel) {
        var ret = _.pick(channel, ['_id', 'name', 'type']);
        ret.sitesCount =  channelSiteCountMap[channel._id] ? channelSiteCountMap[channel._id] : 0; 
        return ret;
      });

      deferred.resolve(retChannels);
    });

  return deferred.promise;
}

exports.basicChannelInfo = function(req, res, next) {
  Channel.find({customer: req.customer._id})
  .exec(function(err, channels) {
    if (err) {
      return res.status(400).json({
        error: 'Channel find error'
      });
    }

    if (channels.length === 0) {
      res.json([]);
      return;
    }

    getSitesCount(channels)
    .then( function (valArr) {
      res.json(valArr);
    }, function (err) {
      res.status(400).json({
        error: err
      });
    });
    
  });
}

exports.getChannelProgramInfo = function(req, res, next) {
  Program.find({channel: req.channel._id})
  .select('_id name job jobName startDate endDate createDate')
  .exec(function(err, programs) {
    if (err) {
      res.status(400).json({
        error: err
      });
      return;
    }

    res.json(programs);
  });
}

exports.bindSites = function(req, res) {
  // sites;
  console.log('sites:', req.body.sites);

  // req.checkBody('sites', 'invalid sites').isJSON();

  // var errors = req.validationErrors(true);
  // if (errors) {
  //   res.send(errors, 400);
  //   return;
  // }

  if (req.body.sites.length === 0) {
    res.send('sites length is zero', 401);
    return;
  };

  //Check sites first
  Site.update(
    { 
      "siteName": {$in: req.body.sites} 
    }
    ,{
      $set: { 
        channel: req.channel,
        channelName: req.channel.name,
        channelType: req.channel.type
      }
    }
    ,{
      multi: true
    }, function (err, raw) {
      console.log(raw);
      // body...
      if (err) {
        return res.status(400).json({
          error: 'BindSites error'
        });
      }
      res.status(201).json({affectCount: raw});
    });
};

exports.generateProgram = function (req, res) {
  req.checkBody('startDate', 'invalid startDate').isDate();
  req.checkBody('endDate', 'invalid endDate').isDate();
  var errors = req.validationErrors(true);
  if (errors) {
    res.send(errors, 400);
    return;
  }

  var startDate = moment(req.body.startDate),
     endDate  = moment(req.body.endDate),
     programName = req.body.name;
  //Check startDate and endDate
  if (!startDate.isValid() || !endDate.isValid() || moment.max(startDate, endDate) === startDate) {
    return res.status(400).json({
      error: 'require startDate & endDate'
    });
  };

  //Check job valid
  Job.load(req.body.jobId, function (err, job) {
    if (err) {
      return res.status(400).json({
        error: 'require startDate & endDate'
      });
    }

    //generateProgram
    var result = generateProgramFromJob(startDate, endDate, job);
    if (result.invalidDays.length) {
      res.json({
        invalidDays: result.invalidDays
      }, 400);
    } else {
      console.log('have validDays');
      //generate program valid now!
      generateProgramRecord(job, req.channel, startDate, endDate,
       programName, result.validDays)
      .then(function(program){
        res.json(program);
      }, function(err) {
        res.json({
          createProgramErr: err
        }, 400);
      });
    }
    
  });
}

function getTimeInCurDay(date) {
  var mmt = moment(date);
  // console.log('mmt is:', mmt);
  return mmt.milliseconds()
  + mmt.seconds() *1000
  + mmt.minutes() *60*1000
  + mmt.hours() *60 *60 *1000;
}

function generateOneDayPlaylistFromJob(checkDay, job) {
  console.log('generatePlaylistFromJob for day:', checkDay.format('L'));
  
  var jobJson = job.toJSON();
  var dateTemplate = _.find(jobJson.dateTemplates, function (_dateTemplate) {
    var periodInfo = _dateTemplate.periodInfo,
     calcType = periodInfo.calcType;
    if (calcType === 'multipleDates') {
      var multipleDatesValues = periodInfo.multipleDatesValues;
      var dateMatch = _.some(multipleDatesValues, function (_date) {
        return _date.getFullYear() === checkDay.getFullYear()
        && _date.getMonth() === checkDay.getMonth()
        && _date.getDate() === checkDay.getDate()
      });
      return dateMatch;
    }
    if (calcType === 'dateRange') {
      var range = moment().range(periodInfo.dateRangeValues.startDate, 
        periodInfo.dateRangeValues.endDate);
      return range.contains(checkDay);
    };
    if (calcType === 'daysOfWeek') {
      var dayIdx = checkDay.day();
      var dayKey = ['Sun', "Mon", "Tue", "Wed", "Thur", "Fri", "Sat"][dayIdx];
      return periodInfo.daysOfWeekValues[dayKey];
    };

  });

  if (!dateTemplate) {
    console.warn('Not find suitable dateTemplate');
    return null;
  }

  // var dayRuleUnits = _.cloneDeep(findPlaylist.dayRuleUnits;
  var boxes = _.sortBy(dateTemplate.clock.boxes, function(box) {
    return box.startTm;
  });
  var ctx = {
    exactPlayTime: getTimeInCurDay(_.first(boxes).startTm),
    finalEndTime: getTimeInCurDay(_.last(boxes).endTm),

    preparedTracks: []
  };

  var randomIdx, chance = new Chance(12345);
  _.each(boxes, function (box) {
    if (ctx.exactPlayTime > ctx.finalEndTime) {
      return;
    }
    var curBoxEndTime = getTimeInCurDay(box.endTm);
    while (ctx.exactPlayTime < curBoxEndTime) {
      // random select a track from box
      randomIdx = chance.integer({min: 0, max: box.tracks.length-1}) ;
      var boxTrackInfo = box.tracks[randomIdx],
      trackInfo = {
        track: boxTrackInfo.track,
        duration: boxTrackInfo.duration,
        name: boxTrackInfo.name,
        exactPlayTime: ctx.exactPlayTime,
        fromBoxs: null // Need to update later. Query Track Record to fill this field
      };

      ctx.preparedTracks.push(trackInfo);
      //update ctx.exactPlayTime
      ctx.exactPlayTime = ctx.exactPlayTime + trackInfo.duration *1000;
    }

  });

  return {
    date: checkDay,
    dateTemplateName: dateTemplate.name,
    playlist: ctx.preparedTracks,
  };
}

function generateProgramRecord(job, channel, startDate, endDate, programName, validDays) {
  var deferred = Q.defer();
  var trackInfos = [];
  var dayPlaylistArr = [];
  _.each(validDays, function (validDay) {
    trackInfos = _.union(trackInfos, validDay.playlist);
  });

  // fill fromBoxs field in validDays
  Track.find({
    '_id': {$in: _.pluck(trackInfos, 'track')}
  })
  .select('_id fromBoxs')
  .exec(function (err, tracks) {
    if (err) {
      deferred.reject(err);
      return;
    }

    console.log('tracks:', tracks);
     
    var keys = _.pluck(tracks, '_id'),
        values = _.pluck(tracks, 'fromBoxs'),
    keyValues = _.zipObject(keys, values);

    _.each(trackInfos, function (trackInfo) {
      trackInfo.fromBoxs = keyValues[trackInfo.track];
    });

    var program = new Program({
      name: programName,
      job: job,
      jobName: job.name,
      channel: channel,
      customer: channel.customer,
      startDate: startDate,
      endDate: endDate,
      dayPlaylistArr: validDays
    });

    program.save(function(err, newObj) {
      if (err) {
        console.warn('create err:', err);
        deferred.reject(err);
        return;
      }
      deferred.resolve(newObj);
    });
  });

  return deferred.promise;
}

function generateProgramFromJob(startDate, endDate, job) {
  console.log('generateProgramFromJob 1');
  var invalidDays = [];
  var validDays = [];
  var range = moment.range(startDate, endDate);
  range.by('days', function(checkDay) {
    //generate playlist for current moment
    var dayPlaylist = generateOneDayPlaylistFromJob(checkDay, job);
    if (!dayPlaylist) {
      invalidDays.push(checkDay);
    } else {
      validDays.push(dayPlaylist);
    }
  });
  return {
    validDays: validDays,
    invalidDays: invalidDays
  };
}
