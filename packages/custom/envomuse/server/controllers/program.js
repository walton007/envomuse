'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Program = mongoose.model('Program'),
  Site = mongoose.model('Site'),
  ExportRequest = mongoose.model('ExportRequest'),
  Q = require('q'),
  _ = require('lodash');


/**
 * Find program by id
 */
exports.program = function(req, res, next, id) {
  Program.load(id, function(err, program) {
    if (err) return next(err);
    if (!program) return next(new Error('Failed to load program ' + id));
    req.program = program;
    next();
  });
};

/**
 * Show an program
 */
exports.show = function(req, res) {
  res.json(req.program);
};

/**
 * Show an program's sites information
 */
exports.all = function(req, res) {
  //collect sites information
  Program.find({
  }).select('_id name startDate endDate inUse created')
    .exec(function(err, programs) {
      if (err) {
        console.error('find programs error');
        res.send(err, 500);
        return;
      };
       
      res.json(programs);
    });
};


/**
 * Generate Export Request from this program
 */
exports.generateExportRequest = function(req, res) {
  var channelName, customerName, sitesInfo = [];
  var program = req.program;

  console.log('program.channel:', typeof program.channel, program.channel.str);

  Site.find({channel: program.channel})
  .select('_id siteName deviceId channelName customerName license.uuid')
  .sort('-created').exec(function(err, sites) {
    if (err) {
      return res.status(400).json({
        error: 'Cannot list the sites in generateExportRequest'
      });
    }

    if (sites.length === 0) {
      return res.status(400).json({
        error: 'No sites bind with current program'
      });
    }

    // console.log('sites:', sites);
    // return res.status(200).json({
    //     error: 'bingo'
    //   });

    _.each(sites, function (site) {
      sitesInfo.push({
        siteName: site.siteName,
        deviceId: site.deviceId,
        licenseUuid: site.license.uuid
      });
    });
    channelName = sites[0].channelName;
    customerName = sites[0].customerName;

    var exportRequestInfo = {
      program: program,
      programName: program.name,
      channel: program.channel,
      channelName: channelName,
      customer: program.customer,
      customerName: customerName,
      sitesArr: sitesInfo,

      startDate: program.startDate,
      endDate: program.endDate,

      dayPlaylistArr: program.dayPlaylistArr,
      comment: req.body.comment
    };

    var newExportRequest = new ExportRequest(exportRequestInfo);
    newExportRequest.save(
      function(err, retExportRequest) {
        if (err) {
          console.warn('create ExportRequest err:', err);
          return res.status(400).json({
            error: 'Cannot save the ExportRequest'
          });
        }

        program.exported = true;
        program.save();

        res.json(retExportRequest);
      });

  });
};