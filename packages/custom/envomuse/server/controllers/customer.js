'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Customer = mongoose.model('Customer'),
  Site = mongoose.model('Site'),
  SiteController = require('./site'),
  util = require('util'),
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
  //console.log(req);
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
  //collect sites information
  Site.find({
      customer: req.customer
    }).count()
    .exec(function(err, count) {
      if (err) {
        console.error('find site error');
        res.send(err, 500);
        return;
      };
      var jsonObj = req.customer.toJSON();
      jsonObj['sitesCount'] = count;
      res.json(jsonObj);
    });
};

/**
 * Show an customer's sites information
 */
exports.sites = function(req, res) {
  //collect sites information
  Site.find({
      customer: req.customer
    }).select('-__t -__v -deleteFlag')
    .exec(function(err, sites) {
      if (err) {
        console.error('find site error');
        res.send(err, 500);
        return;
      };
       
      res.json(sites);
    });
};

exports.sitesPaginate = function(req, res) {
  req.checkQuery('pageNumber', 'invalid pageNumber').isInt();
  req.checkQuery('pageSize', 'invalid pageSize').isInt();
  var errors = req.validationErrors(true);
  if (errors) {
    res.send(errors, 400);
    return;
  }

  var pageNumber = req.query.pageNumber,
    pageSize = req.query.pageSize,
    callback = function(error, pageCount, paginatedResults, itemCount) {
      if (error) {
        console.error(error);
        res.status(500).json({
          error: error
        });
      } else {
        res.json({
          pageCount: pageCount,
          data: paginatedResults,
          count: itemCount
        });
      }
    }

  Site.paginate({
    customer: req.customer,
      deleteFlag: false
    },
    pageNumber, pageSize, callback, {
      sortBy: '-created',
      columns: '-__v -__t -deleteFlag'
    });

};

exports.addSite = function(req, res) {
  req.body.customer = req.customer;
  SiteController.create(req, res);
};

/**
 * List of Articles
 */
exports.paginate = function(req, res) {
  req.checkQuery('pageNumber', 'invalid pageNumber').isInt();
  req.checkQuery('pageSize', 'invalid pageSize').isInt();
  var errors = req.validationErrors(true);
  if (errors) {
    res.send(errors, 400);
    return;
  }

  var pageNumber = req.query.pageNumber,
    pageSize = req.query.pageSize,
    type = req.query.type,
    callback = function(error, pageCount, paginatedResults, itemCount) {
      if (error) {
        console.error(error);
        res.status(500).json({
          error: error
        });
      } else {
        res.json({
          pageCount: pageCount,
          data: paginatedResults,
          count: itemCount
        });
        console.log('Pages:', pageCount);
        console.log('itemCount:', itemCount);
      }
    }

  Customer.paginate({
      deleteFlag: false
    },
    pageNumber, pageSize, callback, {
      sortBy: '-created',
      columns: '-__v -__t -deleteFlag'
    });
};

exports.count = function(req, res, next) {
  if (!('count' in req.query)) {
    next();
    return;
  };

  Customer.count(function(err, count) {
    if (err) {
      console.error('customer count error:', err);
      return res.status(500).json({
        error: 'count the customers error'
      });
    }

    res.json({
      count: count
    });
    return;
  });
};

exports.analysis = function(req, res, next) {
  console.log('increase:', req.query);
  if (!('increase' in req.query)) {
    next();
    return;
  };

  req.checkQuery('startDate', 'invalid startDate').isDate();
  req.checkQuery('endDate', 'invalid endDate').isDate();
  var errors = req.validationErrors(true);
  if (errors) {
    res.send(errors, 400);
    return;
  }

  Customer.where({
    created: {
      $gte: req.query.startDate,
      $lte: req.query.endDate,
    }
  }).count(function(err, count) {
    if (err) {
      console.error('customer analysis error:', err);
      return res.status(500).json({
        error: 'count the analysis error'
      });
    }

    res.json({
      count: count
    });
    return;

  });

  return;
};

exports.basicInfos = function(req, res, next) {
  if (!('basicInfos' in req.query)) {
    next();
    return;
  };

  Customer.where({deleteFlag: false}).select('_id brand').exec(function(err, customers) {
    if (err) {
      console.error('customer basicInfos error:', err);
      return res.status(500).json({
        error: 'count the basicInfos error'
      });
    }

    res.json(customers);
    return;
  });
};
