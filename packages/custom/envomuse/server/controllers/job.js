'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Job = mongoose.model('Job'),
  Q = require('q'),
  _ = require('lodash');

exports.all = function(req, res) {
  console.log('all jobs');
  // return only basic information
  Job.find().sort('-created')
  .select('_id name creator brand type created')
  .exec(function(err, jobs) {
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

exports.box = function(req, res, next) {
  var uuid = req.param("boxId");
  if (!uuid) {
    return res.status(400).json({
      error: 'boxid needed'
    });
  };

  var findBox = null;

  _.each(req.job.dateTemplates, function (dateTemplate) {
    _.each(dateTemplate.clock.boxes, function (box) {
      if (box.uuid === uuid) {
        findBox = box;
        return;
      };
    });
  });

  if (findBox) {
    return res.json(findBox);
  }

  return res.status(400).json({
    error: 'no such boxid'
  });
};

exports.show = function(req, res, next) {
  res.json(req.job);
}