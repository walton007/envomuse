'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  ExportRequest = mongoose.model('ExportRequest'),
  Q = require('q'),
  _ = require('lodash');

exports.all = function(req, res) {
  console.log('all ExposeRequests');
  // return only basic information
  ExportRequest.find().sort('-createDate')
  .select('_id createDate programName')
  .exec(function(err, exposeRequests) {
    if (err) {
      return res.status(400).json({
        error: 'Cannot list the ExposeRequests'
      });
    }

    res.json(exposeRequests);
  });
};

exports.exportRequest = function(req, res, next, id) {
  ExportRequest.load(id, function(err, exposeRequest) {
    if (err) return next(err);
    if (!exposeRequest) return next(new Error('Failed to load exposeRequest ' + id));
    req.exposeRequest = exposeRequest;
    next();
  });
};

exports.show = function(req, res, next) {
  res.json(req.exposeRequest);
}