'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Program = mongoose.model('Program'),
  Q = require('q'),
  _ = require('lodash');


/**
 * Find program by id
 */
exports.program = function(req, res, next, id) {
  Program.load(id, function(err, program) {
    if (err) return next(err);
    if (!program) return next(new Error('Failed to load program ' + id));
    req.program = program;
    next();
  });
};

exports.getProgramCountFromJobs = function(jobs) {
  var deferred = Q.defer();
  Program.aggregate([{
    $match: {
      job: {$in: _.map(jobs, '_id')}
    }
  }, {
    $group: {
      _id: '$job',
      count: {$sum: 1}
    }
  }])
  .exec(function(err, result) {
    console.log('result:', result);
    if (err) {
      deferred.reject(err);
      return;
    };
    var jobProgramMap = {};
    _.each(result, function(obj) {
      jobProgramMap[obj._id] = obj.count;
    })

    var retJobs = _.map(jobs, function(job) {
        var ret = job.toJSON();
        ret.programCount = jobProgramMap[job._id] ? jobProgramMap[job._id]: 0;
        return ret;
      });

    deferred.resolve(retJobs);
  });

  return deferred.promise;
};


/**
 * Show an program
 */
exports.show = function(req, res) {
  res.json(req.program);
};

/**
 * Show an program's sites information
 */
exports.all = function(req, res) {
  //collect sites information
  Program.find({
  }).select('_id name startDate endDate inUse created')
    .exec(function(err, programs) {
      if (err) {
        console.error('find programs error');
        res.send(err, 500);
        return;
      };
       
      res.json(programs);
    });
};