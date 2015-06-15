'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  User = mongoose.model('User'),
  Q = require('q'),
  _ = require('lodash');

exports.all = function(req, res) {
  User.find().sort('-created').select('_id email created customer')
  .populate('customer', 'brand')
  .exec(function(err, users) {
    if (err) {
      return res.status(500).json({
        error: 'Cannot list the users'
      });
    }
    res.json(users);
  });
};

exports.loadUserInfo = function(customer) {
  var deferred = Q.defer();

  User.findOne({customer: customer}).select('_id email created')
  .exec(function(err, user) {
    if (err) {
      deferred.reject(err);
      return;
    }
    deferred.resolve(user);
  });

  return deferred.promise;
};
