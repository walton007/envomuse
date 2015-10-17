'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Program = mongoose.model('Program'),
  Site = mongoose.model('Site'),
  ConnectionLog = mongoose.model('ConnectionLog'),
  Q = require('q'),
  moment = require('moment-range'),
  _ = require('lodash');


function getDateDuration() {
  var startDate = moment().startOf('month'),
  endDate = moment(startDate).add(1, 'M');
  return {
    startDate: startDate,
    endDate: endDate
  };
}

/**
 * Show an program's sites information
 */
exports.getProgramList = function(req, res) {
  console.log('getProgramList:');
  var duration = getDateDuration();
  Program.find({
    deleteFlag: {$ne : true},
    channel: req.site.channel,

    $or: [ {startDate: {
      $gte: duration.startDate,
      $lte: duration.endDate,
    }}, {endDate: {
      $gte: duration.startDate,
      $lte: duration.endDate,
    }} ]
    
  })
  .select('_id name startDate endDate created')
  .sort('-created')
  .exec(function(err, programs) {
    if (err) {
      console.error('find programs error');
      res.send(err, 400);
      return;
    };
     
    res.json(programs);
  });
};

/**
 * Find program by id
 */
exports.playlist = function(req, res, next, id) {
  console.log('playlist id:', id);
  Program.findOne({
    _id: id
  })
  .select('_id name startDate endDate created dayPlaylistArr.date \
    dayPlaylistArr.playlist.track dayPlaylistArr.playlist.duration dayPlaylistArr.playlist.name  dayPlaylistArr.playlist.exactPlayTime')
  .exec(function(err, program) {
    if (err) {
      return next(new Error('Failed to load program ' + id));
    };
     
    req.program = program;
    next();
  });
};

exports.getProgram = function(req, res) {
  console.log('getProgram:');
  if (req.site.channel === req.program.channel) {
    return res.status(403).json({
            error: 'forbiddon'
          });
  }
  res.json(req.program);
};


exports.checkValidConnection = function(req, res, next) {
  // console.log('checkValidConnection req.headers:',req.headers);
  var envomuseSign = req.headers.envomuse;
  if (!envomuseSign) {
    return res.status(400).json({
        error: 'invalid req'
      });
  };

  var infoArr = envomuseSign.split('=');
  if (infoArr.length !== 3) {
    return res.send("invalid envomuseSign", 400);
  };
  var playerVersion = infoArr[0],
    siteUuid = infoArr[1],
    mac = infoArr[2];

  console.log(playerVersion, siteUuid, mac);
  req.clientInfo = {
    mac:  mac
  };

  if (!siteUuid || !mac) {
    return res.status(400).json({
        error: 'invalid req mac'
      });
  }

  //Find suitable site
  Site.loadByUuid(siteUuid, function (err, site) {
    if (err) {
      return res.send("error in server", 400);
    }
    if (!site) {
      return res.send("no such site", 400);
    }
    if (site.disable) {
      return res.send("site have been disabled", 400);
    }
    if (!site.license.deviceMac) {
      // Activate device mac
      site.license.deviceMac = mac;
      site.licenseActivatedDate = new Date();
      site.save(function(err, updateSite) {
        if (err) {
          console.warn('update licenseActivate error:', err);
          return res.status(505).json({
            error: 'error in server'
          });
        }
        req.site = updateSite;
        next();
      });
      return;
    }

    if (site.license.deviceMac !== mac) {
      return res.status(400).json({
            error: 'no such site invalid mac'
          });
    } else {
      site.lastHeartbeat = {
        date: new Date(),
        version: playerVersion
      } 
      site.save(function(err, updateSite) {
        if (err) {
          console.warn('update licenseActivate error2:', err);
          return res.status(505).json({
            error: 'error in server 2'
          });
        }
        req.site = updateSite;
        next();
      });
      return;
    }
  });
};

/**
 * record site hearbeat info
 */
exports.siteHeartBeat = function(req, res) {
  //Check the last record to see whether the frequency is too high
  var checkMoment = moment().subtract(30, 'minutes');
  ConnectionLog.find({siteid: req.site, heartbeatTm: {$gte: checkMoment}})
  .count()
  .exec(function(err, count) {
    if (err) {
      return res.status(500).json({
        error: 'find connectionLog count error'
      });
    }
    if (count > 0) {
      console.info('heartbeat frequency too high, just ignore it');
      res.status(200).json({ });
    } else {
      console.info('save this heartbeat info');
      var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
      var connectionLog = new ConnectionLog({
        ip: ip,
        mac: req.clientInfo.mac,
        siteid: req.site
      });
      
      connectionLog.save(function(err) {
        if (err) {
          return res.status(500).json({
            error: 'Cannot save the connectionLog'
          });
        }
        res.status(200).json({});
      });

    }
  });
  
}
