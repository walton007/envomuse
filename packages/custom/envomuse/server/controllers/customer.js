'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Customer = mongoose.model('Customer'),
  _ = require('lodash');


/**
 * Find Customer by id
 */
exports.customer = function(req, res, next, id) {
  Customer.load(id, function(err, customer) {
    if (err) return next(err);
    if (!customer) return next(new Error('Failed to load customer ' + id));
    req.customer = customer;
    next();
  });
};

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
 * Show an customer
 */
exports.show = function(req, res) {
  res.json(req.customer);
};

/**
 * List of Articles
 */
exports.all = function(req, res) {
  var offset = req.query.offset,
  size = req.query.size,
  type = req.query.type;
  
  Customer.find().sort('-created').populate('user', 'name username').exec(function(err, customers) {
    if (err) {
      return res.status(500).json({
        error: 'Cannot list the customers'
      });
    }
    res.json({count: 1000, data: customers});

  });
};

exports.count = function(req, res, next) {
  if ('count' in req.query) {
    res.json({count:100});
    return;
  };

  next();
};

exports.analysis = function(req, res, next) {
  console.log('increase:', req.query);
  if ('increase' in req.query) {
    res.json({count:10});
    return;
  };

  next();
};
