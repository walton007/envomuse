'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Site = mongoose.model('Site'),
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
exports.create = function(req, res) {
  var site = new Site(req.body);
  site.user = req.user;

  site.save(function(err) {
    if (err) {
      console.warn('create err:', err);
      return res.status(500).json({
        error: 'Cannot save the site'
      });
    }
    res.json(site);

  });
};

/**
 * Update an site
 */
exports.update = function(req, res) {
  var site = req.site;
  if ('manager' in req.body) {
    site.manager = _.extend(site.manager, req.body.manager);
    delete req.body.manager;
  }
  if ('license' in req.body) {
    delete req.body.license;
  }
  site = _.extend(site, req.body);
  site.save(function(err) {
    if (err) {
      console.warn('update site error:', err);
      return res.status(500).json({
        error: 'Cannot update the site'
      });
    }
    res.json(site);

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
  res.json(req.site);
};


/**
 * List of Sites
 */
exports.all = function(req, res) {
  Site.find().sort('-created').populate('user', 'name username').exec(function(err, sites) {
    if (err) {
      return res.status(500).json({
        error: 'Cannot list the sites'
      });
    }
    res.json(sites);

  });
};


 /**
 * bind license for an site
 */
exports.bindLicense = function(req, res) {
  var site = req.site;
  site.license = {uuid: uuid.v4(), activated: false};
  site.save(function(err) {
    if (err) {
      console.warn('bindLicense error:', err);
      return res.status(500).json({
        error: 'Cannot bindLicense'
      });
    }
    res.json(site);
  });
};

 /**
 * active license for an site
 */
exports.licenseActivate = function(req, res) {
  var mac = req.body.mac;
  var macRegex = /^([0-9A-F]{2}[:-]){5}([0-9A-F]{2})$/;
  if (!macRegex.test(mac)) {
    return res.status(503).json({
        error: 'invalid mac!'
      });
  }
  var requestuuid = req.body.uuid;
  var site = req.site;
  if (!!site.license) {
    if (requestuuid !== site.license.uuid) {
      console.log('requestuuid:', requestuuid);
      console.log('site.license.uuid:', site.license.uuid);
      return res.status(502).json({
        error: 'invalid license uuid!'
      });
    }

    if (site.license.activated) {
      return res.status(501).json({
        error: 'license already activated!'
      });
    } else {
      site.license = _.extend(site.license, {
        activated: true,
        deviceInfo: mac,
        activatedDate: new Date()
      });  
      site.save(function(err) {
        if (err) {
          console.warn('update licenseActivate error:', err);
          return res.status(505).json({
            error: 'licenseActivate failed'
          });
        }
        res.json(site);
      });
    }

  } else {
    return res.status(500).json({
        error: 'bindLicense first!'
      });
  }
};

