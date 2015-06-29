'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Channel = mongoose.model('Channel'),
  Site = mongoose.model('Site'),
  Program = mongoose.model('Program'),
  Q = require('q'),
  _ = require('lodash');

/**
 * Find channel by id
 */
exports.channel = function(req, res, next, id) {
  Channel.load(id, function(err, channel) {
    if (err) return next(err);
    if (!channel) return next(new Error('Failed to load channel ' + id));
    req.channel = channel;
    next();
  });
};

exports.addChannel = function(req, res, next) {
  req.checkBody('name', 'invalid name').notEmpty();
  req.checkBody('type', 'invalid type').notEmpty();
  var errors = req.validationErrors(true);
  if (errors) {
    res.send(errors, 400);
    return;
  }

  var channel = new Channel({
    customer: req.customer,
    name: req.body.name,
    type: req.body.type
  });

  channel.save(function(err, retObj) {
    if (err) {
      console.warn('create err:', err);
      return res.status(400).json({
        error: 'Cannot create channel'
      });
    }
    res.json(retObj);
  });
}

exports.addDefChannelForCustomer = function(customer, callback) {
  var channel = new Channel({
    customer: customer,
    name: customer.brand + 'Default',
    type: 'default'
  });

  channel.save(callback);
}

exports.getCustomerDefChannel = function(customer, callback) {
  Channel.findOne({customer: customer, type: "default"})
  .exec(callback);
}

function getSitesCount(channels) {
  var deferred = Q.defer();

  Site.aggregate([{
      $match: {
        customer: {
          $in: _.map(channels, '_id')
        }
      }
    }, {
      $group: {
        _id: '$channel',
        count: {
          $sum: 1
        }
      }
    }])
    .exec(function(err, result) {
      if (err) {
        deferred.reject(err);
        return;
      };
      var channelSiteCountMap = {};
      _.each(result, function(obj) {
        channelSiteCountMap[obj._id] = obj.count;
      })

      var retChannels = _.map(channels, function(channel) {
        var ret = _.pick(channel, ['_id', 'name', 'type']);
        ret.sitesCount =  channelSiteCountMap[channel._id] ? channelSiteCountMap[channel._id] : 0; 
        return ret;
      });

      deferred.resolve(retChannels);
    });

  return deferred.promise;
}

exports.basicChannelInfo = function(req, res, next) {
  Channel.find({customer: req.customer._id})
  .exec(function(err, channels) {
    if (err) {
      return res.status(400).json({
        error: 'Channel find error'
      });
    }

    if (channels.length === 0) {
      res.json([]);
      return;
    }

    getSitesCount(channels)
    .then( function (valArr) {
      res.json(valArr);
    }, function (err) {
      res.status(400).json({
        error: err
      });
    });
    
  });
}

exports.getChannelProgramInfo = function(req, res, next) {
  Program.find({channel: req.channel._id})
  .select('_id name startDate endDate createDate')
  .exec(function(err, programs) {
    if (err) {
      res.status(400).json({
        error: err
      });
      return;
    }

    res.json(programs);
  });
}

exports.bindSites = function(req, res) {
  // sites;
  console.log('sites:', req.body.sites);

  // req.checkBody('sites', 'invalid sites').isJSON();

  // var errors = req.validationErrors(true);
  // if (errors) {
  //   res.send(errors, 400);
  //   return;
  // }

  if (req.body.sites.length === 0) {
    res.send('sites length is zero', 401);
    return;
  };

  //Check sites first
  Site.update(
    { 
      "siteName": {$in: req.body.sites} 
    }
    ,{
      $set: { 
        channel: req.channel,
        channelName: req.channel.name,
        channelType: req.channel.type
      }
    }
    ,{
      multi: true
    }, function (err, raw) {
      console.log(raw);
      // body...
      if (err) {
        return res.status(400).json({
          error: 'BindSites error'
        });
      }
      res.status(201).json({affectCount: raw});
    });
};
