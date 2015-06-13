'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Site = mongoose.model('Site'),
  SiteProgram = mongoose.model('SiteProgram'),
  SiteProgramController = require('./siteProgram'),
  uuid = require('node-uuid'),
  _ = require('lodash');

/**
 * Create an site
 */
exports.analysis = function(req, res) {
  res.json({
    idle: 1
  });
};


exports.render = function(req, res) {

  function isAdmin() {
    return req.user && req.user.roles.indexOf('admin') !== -1;
  }

  // Send some basic starting info to the view
  res.render('admin', {
    user: req.user ? {
      name: req.user.name,
      _id: req.user._id,
      username: req.user.username,
      roles: req.user.roles
    } : {},
    isAdmin: isAdmin() ? 'true' : 'false'
  });
};