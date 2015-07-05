'use strict';

/**
 * Module dependencies.
 */
var comingJobsCommand = require('../../../../../zeromq/comingJobsCommand');

/**
 * Get allTasks
 */
exports.allTasks = function(req, res) {
  comingJobsCommand.allTasks(function (tasks) {
    res.json(tasks);
  });
};

/**
 * import an comingJobs
 */
exports.import = function(req, res) {
  var comingJobsId = req.comingJobsId;
  comingJobsCommand.doImport(comingJobsId, function (taskId) {
    res.json({
      taskId: taskId
    });
  }, function (err) {
    res.status(400).json({
        error: err
    });
  });
};

 /**
 * forceRefresh
 */
exports.forceRefresh = function(req, res) {
  comingJobsCommand.forceRefresh(function (comingJobs) {
    res.json(comingJobs);
  });
};


/**
 * List of comingJobs
 */
exports.all = function(req, res) {
  comingJobsCommand.all(function (comingJobs) {
    res.json(comingJobs);
  });
};

exports.show = function(req, res) {
  var comingJobsId = req.comingJobsId;
  comingJobsCommand.detail(comingJobsId, function (comingJob) {
    res.json(comingJob);
  }, function (err) {
    res.status(400).json({
        error: err
    });
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

  comingJobsCommand.statistic(function (rst) {
    res.json({
      'notImport': (rst.notImport ? rst.notImport : 0),
      'importing': (rst.importing ? rst.importing : 0),
      'imported': (rst.imported ? rst.imported : 0),
      'badzip': (rst.badzip ? rst.badzip : 0),
       });
  });
};

