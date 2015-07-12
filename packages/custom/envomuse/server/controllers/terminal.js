'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Program = mongoose.model('Program'),
  Q = require('q'),
  moment = require('moment-range'),
  _ = require('lodash');


function getDateDuration() {
  var startDate = moment().startOf('month'),
  endDate = moment(startDate).add(1, 'M');
  return {
    startDate: startDate,
    endDate: endDate
  };
}

/**
 * Show an program's sites information
 */
exports.getProgramList = function(req, res) {
  console.log('getProgramList:');
  var duration = getDateDuration();
  Program.find({
    $or: [ {startDate: {
      $gte: duration.startDate,
      $lte: duration.endDate,
    }}, {endDate: {
      $gte: duration.startDate,
      $lte: duration.endDate,
    }} ]
    
  })
  .select('_id name startDate endDate created')
  .sort('-created')
  .exec(function(err, programs) {
    if (err) {
      console.error('find programs error');
      res.send(err, 400);
      return;
    };
     
    res.json(programs);
  });
};

/**
 * Find program by id
 */
exports.playlist = function(req, res, next, id) {
  console.log('playlist id:', id);
  Program.findOne({
    _id: id
  })
  .select('_id name startDate endDate created dayPlaylistArr.date \
    dayPlaylistArr.playlist.track dayPlaylistArr.playlist.duration dayPlaylistArr.playlist.name  dayPlaylistArr.playlist.exactPlayTime')
  .exec(function(err, program) {
    if (err) {
      return next(new Error('Failed to load program ' + id));
    };
     
    req.program = program;
    next();
  });
};

exports.getProgram = function(req, res) {
  console.log('getProgram:');
  res.json(req.program);
};

