'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Site = mongoose.model('Site'),
  Channel = mongoose.model('Channel'),
  ChannelController = require('./channel'),
  Q = require('q'),
  uuid = require('node-uuid'),
  _ = require('lodash');

/**
 * Find Site by id
 */
exports.site = function(req, res, next, id) {
  Site.load(id, function(err, site) {
    if (err) return next(err);
    if (!site) return next(new Error('Failed to load site ' + id));
    req.site = site;
    next();
  });
};

/**
 * Create an site
 */
// exports.create = function(req, res) {
//   var site = new Site(req.body);
//   site.save(function(err, retSite) {
//     if (err) {
//       console.warn('create err:', err);
//       return res.status(400).json({
//         error: 'Cannot save the site'
//       });
//     }
//     res.json(retSite);
//   });
// };

/**
 * Update an site
 */
exports.update = function(req, res) {
  var site = req.site;
  console.warn('update site :', site);

  var vairableProperties = ['siteName', 'reference', 'manager', 
  'phone', 'address', 'province', 'city'];
  var siteProperties = {};
  _.each(vairableProperties, function (property) {
    if (property in req.body) {
      siteProperties[property] = req.body[property];
    }
  });

  var readyQ = Q.defer();

  if ('channel' in req.body) {
    // handle channel info
    Channel.load(req.body.channel, function(err, channel) {
        if (err || !channel) {
          readyQ.reject('Invalid Channel');
          return;
        }
        siteProperties = _.extend(siteProperties, {
          'channel': channel,
          'channelName': channel.channelName,
          'channelType': channel.channelType
        });
        readyQ.resolve();
    });
  } else {
    readyQ.resolve();
  }

  readyQ.promise.then(function () {
    site = _.extend(site, siteProperties);

    site.save(function(err) {
      if (err) {
        console.warn('update site error:', err);
        return res.status(400).json({
          error: 'Cannot update the site'
        });
      }
      res.json(site);

    });
  }, function (err) {
    res.status(400).json({
      error: err
    });
  });
};

/**
 * Delete an site
 */
exports.destroy = function(req, res) {
  var site = req.site;

  site.remove(function(err) {
    if (err) {
      return res.status(500).json({
        error: 'Cannot delete the site'
      });
    }
    res.json(site);

  });
};

/**
 * Show an site
 */
exports.show = function(req, res) {
  //add programSites info
  res.json(req.site);
};

/**
 * List basic Infos of Sites
 */
exports.basicInfos = function(req, res, next) {
  console.log('basic');
  if (!('basicInfos' in req.query)) {
    next();
    return;
  };

  Site.find({disable: false})
  .select('_id siteName reference channelType')
  .sort('-created').exec(function(err, sites) {
    if (err) {
      return res.status(400).json({
        error: 'Cannot list the sites'
      });
    }
    res.json(sites);
  });
};

exports.getChannelSitesInfo = function (req, res, next) {
  var channel = req.channel;
  Site.find({disable: false, channel: channel})
  .select('siteName reference deviceId license.uuid')
  .sort('-created').exec(function(err, sites) {
    if (err) {
      return res.status(400).json({
        error: 'Cannot list the sites'
      });
    }
    var retInfo = {
      channelId: channel._id,
      channelName: channel.name,
      sites: sites
    };
    res.json(retInfo);
  });
}

/**
 * bind license for an site
 */
exports.bindLicense = function(req, res) {
  var site = req.site;
  if (site.license && site.license.uuid) {
    console.log('bindLicense early return');
    return res.json(site);
  };

  site.license = {
    uuid: uuid.v4()
  };
  site.save(function(err, newSite) {
    if (err) {
      console.warn('bindLicense error:', err);
      return res.status(500).json({
        error: 'Cannot bindLicense'
      });
    }
    res.json(newSite);
  });
};

exports.statistic = function(req, res, next) {
  if (!('statistic' in req.query)) {
    return next();
  }

  Site.aggregate([{
      $match: {
        deleteFlag: false
      }
    }, {
      $group: {
        _id: '$playerStatus',
        count: {
          $sum: 1
        }
      }
    }])
  .exec(function(err, val) {
    if (err) {
      return res.status(400).json({
        error: 'statistic the site error'
      });
    }
    var statusDict = {
      'online': 0,
      'offline': 0,
      'local': 0
    };
    _.each(val, function(obj) {
      statusDict[obj._id] = obj.count;
    });
    res.json(statusDict);
  });
};