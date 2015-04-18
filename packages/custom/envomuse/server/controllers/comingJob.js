'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  zmqAgent = require('../zmqclient/client'),
  _ = require('lodash');


/**
 * Create an customer
 */
exports.create = function(req, res) {
  var customer = new Customer(req.body);
  customer.user = req.user;

  customer.save(function(err) {
    if (err) {
      console.warn('create err:', err);
      return res.status(500).json({
        error: 'Cannot save the customer'
      });
    }
    res.json(customer);

  });
};

/**
 * Update an customer
 */
exports.update = function(req, res) {
  var customer = req.customer;

  customer = _.extend(customer, req.body);

  customer.save(function(err) {
    if (err) {
      return res.status(500).json({
        error: 'Cannot update the customer'
      });
    }
    res.json(customer);

  });
};

/**
 * Delete an customer
 */
exports.destroy = function(req, res) {
  var customer = req.customer;

  customer.remove(function(err) {
    if (err) {
      return res.status(500).json({
        error: 'Cannot delete the customer'
      });
    }
    res.json(customer);

  });
};

 /**
 * forceRefresh
 */
exports.forceRefresh = function(req, res) {
  zmqAgent.sendCmd('comingJobs', ['forceRefresh'], function(comingJobs) {
    console.log('forceRefresh comingJobs:', comingJobs);
    res.json(comingJobs);
  });
};


/**
 * List of comingJobs
 */
exports.all = function(req, res) {
  zmqAgent.sendCmd('comingJobs', ['all'], function(comingJobs) {
    res.json(comingJobs);
  });
};
