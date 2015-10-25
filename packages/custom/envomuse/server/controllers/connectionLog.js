'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  ConnectionLog = mongoose.model('ConnectionLog'),
  moment = require('moment-range');

exports.getSiteConnectionLogs = function (req, res, next) {
  var site = req.site;
  // find programs between [3-yesterday, later)
  var today = moment().startOf('day'),
  oneWeekAgo = moment(today).subtract(7, 'days');

  ConnectionLog.find({
    siteid: site,
    heartbeatTm: {$gte: oneWeekAgo}
  })
  .select('ip mac heartbeatTm')
  .sort('-heartbeatTm')
  .exec(function(err, connectionLogs) {
    if (err) {
      return res.status(400).json({
        error: 'ConnectionLog find error'
      });
    }

    res.json(connectionLogs);
    return;    
  });
}