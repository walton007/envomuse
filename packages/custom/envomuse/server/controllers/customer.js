'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Customer = mongoose.model('Customer'),
  User = mongoose.model('User'),
  Site = mongoose.model('Site'),
  Channel = mongoose.model('Channel'),
  ChannelController = require('./channel'),
  UserController = require('./user'),
  util = require('util'),
  randomstring = require("randomstring"),
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

  customer.save(function(err, retCustomer) {
    if (err) {
      console.warn('create err:', err);
      return res.status(400).json({
        error: 'Cannot save the customer'
      });
    }

    // Create a default channel for this customer
    ChannelController.addDefChannelForCustomer(retCustomer,
      function(err, channel) {
        if (err) {
          return res.status(400).json({
            error: 'Cannot create the default channel'
          });
        };

        res.json(retCustomer);
      }
    );
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
      

      //expand customer user info
      UserController.loadUserInfo(req.customer)
      .then(function(retUser) {
        var jsonObj = req.customer.toJSON();
        jsonObj['sitesCount'] = count;
        jsonObj['user'] = retUser;
        res.json(jsonObj);
      }, function(err) {
        console.error('load user info error');
        res.send(err, 400);
        return;
      })

      
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
    filterChannelName = req.query.channelName,
    callback = function(error, pageCount, sites, itemCount) {
      if (error) {
        console.error(error);
        res.status(500).json({
          error: error
        });
      } else {
        res.json({
          pageCount: pageCount,
          data: sites,
          count: itemCount
        });
      }
    };

  var filterCond = filterChannelName ? {
    customer: req.customer,
    channelName: filterChannelName,
  } : {
    customer: req.customer,
  };

  Site.paginate(filterCond,
    pageNumber, pageSize, callback, {
      sortBy: '-created',
      columns: '_id siteName reference created deviceId playerStatus deliveryState channel channelName channelType'
    });
};

exports.addSite = function(req, res) {
  req.body.customer = req.customer;
  req.body.customerName = req.customer.brand;
  ChannelController.getCustomerDefChannel(req.customer,
    function(err, channel) {
      if (err) {
        console.warn('getCustomerDefChannel err:', err);
        return res.status(400).json({
          error: 'Cannot get CustomerDefChannel'
        });
      }

      var siteObj = _.extend(req.body, {
        channel: channel,
        channelName: channel.name,
        channelType: channel.type,
        deviceId: randomstring.generate(10),
        license: {
          uuid: randomstring.generate(10)
        }
      });
      
      // SiteController.create(req, res);

      var site = new Site(siteObj);
      site.save(function(err, retSite) {
        if (err) {
          console.warn('create err:', err);
          return res.status(400).json({
            error: 'Cannot save the site'
          });
        }
        res.json(retSite);
      });
    });
};

function getSiteNum(customers) {
  var deferred = Q.defer();

  Site.aggregate([{
      $match: {
        customer: {
          $in: _.map(customers, '_id')
        }
      }
    }, {
      $group: {
        _id: '$customer',
        count: {
          $sum: 1
        }
      }
    }])
    .exec(function(err, result) {
      console.log('result:', result);
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
        ret.sitesCount = ret.sitesCount ? ret.sitesCount: 0;
        return ret;
      });

      deferred.resolve(retCustomers);
    });

  return deferred.promise;
}

/**
 * List of Customers
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

  Customer.paginate({
      deleteFlag: false
    },
    pageNumber, pageSize, callback, {
      sortBy: '-created',
      columns: '_id created logo name brand status industry'
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

function getChannelsInfo(customers) {
  var deferred = Q.defer();
  var jsonObj, channelObj, customersMap = {};
  _.each(customers, function(obj) {
    jsonObj = obj.toJSON();
    jsonObj.channels = [];
    customersMap[jsonObj._id] = jsonObj;
  })

  Channel.find({})
  .exec(function(err, channels) {
    if (err) {
      deferred.reject(err);
      return;
    };
    
    _.each(channels, function(channel) {
      channelObj = _.pick(channel, ['_id', 'name', 'type']);
      jsonObj = customersMap[channel.customer];
      jsonObj.channels.push(channelObj);
    });

    deferred.resolve(_.values(customersMap));
  });

  return deferred.promise;
}

exports.basicInfos = function(req, res, next) {
  if (!('basicInfos' in req.query)) {
    next();
    return;
  };

  Customer.where({
    deleteFlag: false
  }).select('_id name brand logo').exec(function(err, customers) {
    if (err) {
      console.error('customer basicInfos error:', err);
      return res.status(500).json({
        error: 'count the basicInfos error'
      });ba
    }

    getChannelsInfo(customers)
      .then(function(valueArr) {
        res.json(valueArr);
      }, function(err) {
        res.json({
          getChannelsInfoErr: err
        }, 400);
      });

    return;
  });
};

exports.bindUser = function(req, res, next) {
  // because we set our user.provider to local our models/user.js validation will always be true
  req.assert('email', 'You must enter a valid email address').isEmail();
  req.assert('password', 'Password must be between 8-20 characters long').len(8, 20);

  var errors = req.validationErrors();
  console.log(1.5, errors);
  if (errors) {
    return res.status(400).send(errors);
  }

  console.log(2);

  var user = new User(req.body);
  user.customer = req.customer;
  user.provider = 'local';
  user.username = user.email;
  user.name = user.email;
  user.roles = ['customer'];
  user.save(function(err, retUser) {
    console.log(3, err);
    if (err) {
      switch (err.code) {
            case 11000:
            case 11001:
              res.status(400).json([{
                msg: 'Username already taken',
                param: 'username'
              }]);
              break;
            default:
              var modelErrors = [];

              if (err.errors) {

                for (var x in err.errors) {
                  modelErrors.push({
                    param: x,
                    msg: err.errors[x].message,
                    value: err.errors[x].value
                  });
                }

                res.status(400).json(modelErrors);
              }
          }
      return;
    }

    res.json(retUser);
  });
}