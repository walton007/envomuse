'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  zmqAgent = require('../zmqclient/client'),
  _ = require('lodash');


/**
 * Get allTasks
 */
exports.allTasks = function(req, res) {
  zmqAgent.sendCmd('comingJobs', ['allTasks'], function(tasks) {
    res.json(tasks);
  });
};

/**
 * import an comingJobs
 */
exports.import = function(req, res) {
  var comingJobsId = req.comingJobsId;
  zmqAgent.sendCmd('comingJobs', ['doImport', comingJobsId], function(taskId) {
    res.json({
      taskId: taskId
    });
  });
};

/**
 * Delete an customer
 */
exports.destroy = function(req, res) {
  var customer = req.customer;

  customer.remove(function(err) {
    if (err) {
      return res.status(500).json({
        error: 'Cannot delete the customer'
      });
    }
    res.json(customer);

  });
};

 /**
 * forceRefresh
 */
exports.forceRefresh = function(req, res) {
  zmqAgent.sendCmd('comingJobs', ['forceRefresh'], function(comingJobs) {
    // console.log('forceRefresh comingJobs:', comingJobs);
    res.json(comingJobs);
  });
};


/**
 * List of comingJobs
 */
exports.all = function(req, res) {
  zmqAgent.sendCmd('comingJobs', ['all'], function(comingJobs) {
    res.json(comingJobs);
  });
};

/**
 * statistic of comingJobs
 */
exports.statistic = function(req, res, next) {
  if (!('statistic' in req.query)) {
    next();
    return;
  }
  zmqAgent.sendCmd('comingJobs', ['statistic'], function(comingJobsCount) {
    res.json({count: comingJobsCount});
  });
};

