'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Customer = mongoose.model('Customer'),
  Task = mongoose.model('Task'),
  Job = mongoose.model('Job'),
  Site = mongoose.model('Site'),
  Program = mongoose.model('Program'),
  SiteProgram = mongoose.model('SiteProgram'),
  SiteProgramController = require('./siteProgram'),
  Q = require('q'),
  _ = require('lodash');

/**
 * Create an site
 */
exports.analysis = function(req, res) {
  var promise, promiseArr = [];

  // get totalCustomer
  promise = Customer.find({
    deleteFlag: false
  }).count().exec();
  promiseArr.push(promise);

  // get totalTask
  promise = Task.find({
  }).count().exec();
  promiseArr.push(promise);

  // get totalJobs
  promise = Job.find({
  }).count().exec();
  promiseArr.push(promise);

  // get totalPlaylist
  promise = Program.find({
  }).count().exec();
  promiseArr.push(promise);

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

  // Wait all done
  Q.all(promiseArr)
  .done(function (values) {
    var totalCustomer = values[0];
    var totalTask = values[1];
    var totalJobs = values[2];
    var totalPrograms = values[3];
    var customerStatus = {
      'prospect': 0,  'demo': 0, 'signed' : 0, 'inactive': 0
    };
    _.each(values[4], function(obj) {
      customerStatus[obj._id] = obj.count;
    });

    var siteDeliveryStats = {
      'delivered': 0,  'undelivered': 0
    };
    _.each(values[5], function(obj) {
      siteDeliveryStats[obj._id] = obj.count;
    });

    var ret = { 
      stats:{
        totalCustomer:totalCustomer, 
        totalTask:totalTask, 
        totalJobs:totalJobs,
        totalPrograms:totalPrograms
      },
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

// API-2: sites status { timestamp:xxxx, online:3000, offline:40, local:50 }

exports.render = function(req, res) {

  function isAdmin() {
    return req.user && req.user.roles.indexOf('admin') !== -1;
  }

  // Send some basic starting info to the view
  res.render('admin', {
    user: req.user ? {
      name: req.user.name,
      _id: req.user._id,
      username: req.user.username,
      roles: req.user.roles
    } : {},
    isAdmin: isAdmin() ? 'true' : 'false'
  });
};