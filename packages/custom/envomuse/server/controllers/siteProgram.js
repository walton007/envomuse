'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  SiteProgram = mongoose.model('SiteProgram'),
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