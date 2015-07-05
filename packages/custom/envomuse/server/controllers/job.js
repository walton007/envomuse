'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Job = mongoose.model('Job'),
  Program = mongoose.model('Program'),
  programController = require('./program'),
  siteProgramController = require('./siteProgram'),
  Q = require('q'),
  _ = require('lodash');

exports.all = function(req, res) {
  console.log('all jobs');
  // return only basic information
  Job.find().sort('-created')
  .select('_id creator brand type created')
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


// exports.statistic = function(req, res, next) {
//   if (!('statistic' in req.query)) {
//     next();
//     return;
//   }

//   Job.count(function(err, count) {
//     if (err) {
//       console.error('Job count error:', err);
//       return res.status(500).json({
//         error: 'count the Job error'
//       });
//     }

//     res.json({
//       // Jun added
//       // count: count
//       active: count,
//       inactive: 0
//     });
//     return;
//   });
// };


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