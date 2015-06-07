'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Customer = mongoose.model('Customer'),
  Site = mongoose.model('Site'),
  SiteController = require('./site'),
  SiteProgramController = require('./siteProgram'),
  util = require('util'),
  Q = require('q'),
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
  console.log('req.customer:', req.customer);
  customer = _.extend(customer, req.body);

  customer.save(function(err) {
    if (err) {
      return res.status(500).json({
        error: err
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
    callback = function(error, pageCount, sites, itemCount) {
      if (error) {
        console.error(error);
        res.status(500).json({
          error: error
        });
      } else {
        // get sites related siteProgram
        SiteProgramController.getSiteProgramlist(sites)
        .then(function(retSitesInfo) {
          res.json({
            pageCount: pageCount,
            data: retSitesInfo,
            count: itemCount
          });
        }, function(err) {
          res.json({
            getSiteProgramInfoErr: err
          }, 400);
        });
      }
    }

  Site.paginate({
    customer: req.customer,
      deleteFlag: false
    },
    pageNumber, pageSize, callback, {
      sortBy: '-created',
      columns: '_id siteName reference manager created'
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
  req.checkQuery('startDate', 'invalid startDate').optional().isDate();
  req.checkQuery('endDate', 'invalid endDate').optional().isDate();
  console.log('startDate:', req.query.startDate);

  var errors = req.validationErrors(true);
  if (errors) {
    res.send(errors, 400);
    return;
  }

  var useDateQuery = false;
  if (req.query.startDate && req.query.endDate) {
    useDateQuery = true;
  };

  var pageNumber = req.query.pageNumber,
    pageSize = req.query.pageSize,
    type = req.query.type,
    callback = function(error, pageCount, customers, itemCount) {
      if (error) {
        console.error(error);
        res.status(500).json({
          error: error
        });
        return;
      }

      getSiteNum(customers)
      .then(function(customersWithSitesCnt) {
        res.json({
          pageCount: pageCount,
          data: customersWithSitesCnt,
          count: itemCount
        });
      }, function(err) {
        res.json({
          getSiteNumErr: err
        }, 400);
      });
    }

  Customer.paginate(useDateQuery ? {
      deleteFlag: false,
      created: {
        $gte: req.query.startDate,
        $lte: req.query.endDate,
      }
    } : {deleteFlag: false},
    pageNumber, pageSize, callback, {
      sortBy: '-created',
      columns: '_id created brand industry address'
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

function getSiteNum(customers) {
  // console.log('getSiteNum');
  var deferred = Q.defer();

  Site.aggregate([{
    $match: {
      customer: {$in: _.map(customers, '_id')}
    }
  }, {
    $group: {
      _id: '$customer',
      count: {$sum: 1}
    }
  }])
  .exec(function(err, result) {
    if (err) {
      deferred.reject(err);
      return;
    };
    var customerSiteCountMap = {};
    _.each(result, function(obj) {
      customerSiteCountMap[obj._id] = obj.count;
    })

    var retCustomers = _.map(customers, function(customer) {
        var ret = customer.toJSON();
        ret.sitesCount = customerSiteCountMap[customer._id];
        console.log(customer._id);
        return ret;
      });

    deferred.resolve(retCustomers);
  });

  return deferred.promise;
}

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

    getSiteNum(customers)
    .then(function(customersWithSitesCnt) {
      res.json(customersWithSitesCnt);
    }, function(err) {
      res.json({
        getSiteNumErr: err
      }, 400);
    });

    return;
  });
};
