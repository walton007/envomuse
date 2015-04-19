'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Job = mongoose.model('Job'),
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