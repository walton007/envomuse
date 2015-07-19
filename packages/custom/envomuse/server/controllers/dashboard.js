'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Customer = mongoose.model('Customer'),
  Task = mongoose.model('Task'),
  Channel = mongoose.model('Channel'),
  Job = mongoose.model('Job'),
  Site = mongoose.model('Site'),
  Program = mongoose.model('Program'),
  moment = require('moment-range'),
  Q = require('q'),
  _ = require('lodash');

exports.analysis = function(req, res) {
  var promise, promiseArr = [];
  
  // get customerStatus 
  promise = Customer.aggregate([{
      $match: {
        deleteFlag: false
      }
    }, {
      $group: {
        _id: '$status',
        count: {
          $sum: 1
        }
      }
    }]).exec();
  promiseArr.push(promise);

  // get siteDeliveryStats
  promise = Site.aggregate([{
      $match: {
        deleteFlag: false
      }
    }, {
      $group: {
        _id: '$deliveryState',
        count: {
          $sum: 1
        }
      }
    }]).exec();
  promiseArr.push(promise);

  // get totalChannel
  promise = Channel.find().count().exec();
  promiseArr.push(promise);

  // get totalJobs
  promise = Job.find({
  }).count().exec();
  promiseArr.push(promise);

  // Wait all done
  Q.all(promiseArr)
  .done(function (values) {
    var customerStatus = {
      'prospect': 0,  'demo': 0, 'signed' : 0, 'inactive': 0
    };
    _.each(values[0], function(obj) {
      customerStatus[obj._id] = obj.count;
    });

    var siteDeliveryStats = {
      'delivered': 0,  'undelivered': 0
    };
    _.each(values[1], function(obj) {
      siteDeliveryStats[obj._id] = obj.count;
    });

    var totalChannel = values[2];
    var totalJob = values[3];


    var ret = {
      totalChannel: totalChannel,
      totalJob: totalJob,
      customerStatus: customerStatus, 
      siteDeliveryStats: siteDeliveryStats
    }; 

    res.json(ret);

  }, function(err) {
    console.error(err);
    return res.status(400).json({
        error: 'Query Err'
      });
  });
};

function calcRecentWeekPlaylist (req) {
  'calcRecentWeekPlaylist';

  var deferred = Q.defer();

  var customer = req.user.customer;
  console.log('customer is:', customer);

  // find programs between [3-yesterday, later)
  var today = moment().startOf('day'),
  beginDay = moment(today).subtract(3, 'days'),
  futureDay = moment(beginDay).add(6, 'days');
  console.log('beginDay is:', beginDay);
  console.log('futureDay is:', futureDay);



  Program.find({
    customer: customer,
    $or: [ {
      startDate: {
        $lte: beginDay
      },
      endDate: {
        $gte: futureDay
      }
    }, {startDate: {
      $gte: beginDay,
      $lte: futureDay,
    }}, {endDate: {
      $gte: beginDay,
      $lte: futureDay,
    }}]
  })
  .sort('-created')
  .exec(function (err, programs) {
    // console.log('err, programs:', err, programs); 
    if (err) {
      return deferred.reject(err);
    }
    var pickedDayPlaylistArr = [];
    var range = moment.range(beginDay, futureDay);
    range.by('days', function (day) {
      var dayProgram = _.find(programs, function (program) {
        var programRange = moment.range(program.startDate, program.endDate);
        return programRange.contains(day);
        if (programRange.contains(day)) {
        };
      });

      if (!dayProgram) {
        pickedDayPlaylistArr.push({
          date: day,
          playlist : []
        });
        return;
      }

      // console.log('dayProgram:', dayProgram);

      // Get playlist from this program
      var dayPlaylist = _.find(dayProgram.dayPlaylistArr, function (dayPlaylist) {
        var tempDate = moment(dayPlaylist.date);
        return (tempDate.year() === day.year() 
          && tempDate.date() === day.date()
          && tempDate.day() === day.day());
      });

      var pickedDayPlaylist = _.pick(dayPlaylist, ['date', 'playlist']);
      pickedDayPlaylistArr.push(pickedDayPlaylist);
    });

    deferred.resolve(pickedDayPlaylistArr);
  });

  return deferred.promise;
}

// API-2: sites status { timestamp:xxxx, online:3000, offline:40, local:50 }
function getUserSpecificInfo(req) {
  console.log('getUserSpecificInfo');
  var deferred = Q.defer();

  var promise, promiseArr = [];

  // get sites basic info
  promise = Site.find({disable: false})
  .select('siteName reference playerStatus deviceId')
  .sort('-created').exec();
  promiseArr.push(promise);

  //get recent playlist
  promise = calcRecentWeekPlaylist(req);
  promiseArr.push(promise);

  // Wait all done
  Q.all(promiseArr)
  .done(function (values) {
    // console.log('values:', values);
    

    var sites = values[0];
    var dayPlaylistArr = values[1];

    console.log('dayPlaylistArr length', dayPlaylistArr.length);


    var ret = {
      sites: sites,
      dayPlaylistArr: dayPlaylistArr
    }; 

    deferred.resolve(ret);

  }, function(err) {
    console.error(err);
    deferred.reject(err);
  });

  return deferred.promise;
}

exports.render = function(req, res) {
  console.log('====== render');

  function isAdmin() {
    return req.user && req.user.roles.indexOf('admin') !== -1;
  }

  function isCustomer() {
    // console.log('req.user.roles:', req.user.roles);
    return req.user && req.user.roles.indexOf('customer') !== -1;
  }

  if (isCustomer()) {
    getUserSpecificInfo(req)
    .then(function (myInfo) {
      console.log('render myInfo:', myInfo.sites);
      // Send some basic starting info to the view
      res.render('admin', {
        user: req.user ? {
          name: req.user.name,
          _id: req.user._id,
          username: req.user.username,
          roles: req.user.roles
        } : {},
        isAdmin: 'false',
        myInfo: myInfo
      });

    }, function (err) {

    })
    return;
  };

  // Send some basic starting info to the view
  res.render('admin', {
    user: req.user ? {
      name: req.user.name,
      _id: req.user._id,
      username: req.user.username,
      roles: req.user.roles
    } : {},
    isAdmin: isAdmin() ? 'true' : 'false',
    myInfo: {}
  });
  return;
};