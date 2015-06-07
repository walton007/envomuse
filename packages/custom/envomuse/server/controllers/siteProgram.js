'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  SiteProgram = mongoose.model('SiteProgram'),
  Q = require('q'),
  _ = require('lodash');

exports.all = function(req, res) {
  SiteProgram.find().sort('-created').exec(function(err, sitePrograms) {
    if (err) {
      return res.status(500).json({
        error: 'Cannot list the sitePrograms'
      });
    }
    res.json(sitePrograms);
  });
};

exports.getSiteProgramlist =  function (sites) {
  var deferred = Q.defer();
  SiteProgram.aggregate([{
    $match: {
      site: {$in: _.map(sites, '_id')}
    }
  }, {
    $group: {
      _id: '$site',
      programs: {$push: {creatorName: '$creatorName',
       program:'$program',
       programName: '$programName',
       bindDate: '$bindDate'
      }}
    }
  }])
  .exec(function(err, result) {
    console.log('result:', result);
    if (err) {
      deferred.reject(err);
      return;
    };
    var siteProgramMap = {};
    _.each(result, function(obj) {
      siteProgramMap[obj._id] = obj.programs;
    })

    var retSites = _.map(sites, function(site) {
        var ret = site.toJSON();
        ret.programs = siteProgramMap[site._id] ? siteProgramMap[site._id]: [] ;
        return ret;
      });

    deferred.resolve(retSites);
  });

  return deferred.promise;

}

exports.getSiteReferenceCountFrom =  function (programs) {
  var deferred = Q.defer();
  SiteProgram.aggregate([{
    $match: {
      program: {$in: _.map(programs, '_id')}
    }
  }, {
    $group: {
      _id: '$program',
      count: {$sum: 1}
    }
  }])
  .exec(function(err, result) {
    console.log('result:', result);
    if (err) {
      deferred.reject(err);
      return;
    };
    var programCountMap = {};
    _.each(result, function(obj) {
      programCountMap[obj._id] = obj.count;
    })

    var retPrograms = _.map(programs, function(program) {
        var ret = program.toJSON();
        ret.siteRefCount = programCountMap[program._id] ? programCountMap[program._id]: 0 ;
        return ret;
      });

    deferred.resolve(retPrograms);
  });

  return deferred.promise;
}