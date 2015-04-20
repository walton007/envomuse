'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Job = mongoose.model('Job'),
  Program = mongoose.model('Program'),
  moment = require('moment-range'),
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

function generateProgramFromJob(startDate, endDate, job) {
  console.log('generateProgramFromJob');
  var range = moment.range(startDate, endDate);
  range.by('days', function(moment) {
    // Do something with `moment`
    console.log('moment:', moment);
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