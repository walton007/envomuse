'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Song = mongoose.model('Song'),
  _ = require('lodash');

exports.all = function(req, res) {
  Song.find().sort('-created').select('-rawfilepath -encfilepath -hash -__v').exec(function(err, songs) {
    if (err) {
      return res.status(500).json({
        error: 'Cannot list the Song'
      });
    }
    res.json(songs);
  });
};

/**
 * Find song by id
 */
exports.song = function(req, res, next, id) {
  Song.load(id, function(err, song) {
    if (err) return next(err);
    if (!song) return next(new Error('Failed to load song ' + id));
    req.song = song;
    next();
  });
};