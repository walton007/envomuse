'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Track = mongoose.model('Track'),
  _ = require('lodash');

exports.all = function(req, res) {
  Track.find().sort('-created').select('-rawfilepath -encfilepath -hash -__v').exec(function(err, songs) {
    if (err) {
      return res.status(500).json({
        error: 'Cannot list the Song'
      });
    }
    res.json(tracks);
  });
};

/**
 * Show an song
 */
exports.show = function(req, res) {
  res.json(req.track);
};

/**
 * Find track by id
 */
exports.track = function(req, res, next, id) {
  Track.load(id, function(err, track) {
    if (err) return next(err);
    if (!track) return next(new Error('Failed to load track ' + id));
    req.track = track;
    next();
  });
};