'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Program = mongoose.model('Program'),
  Site = mongoose.model('Site'),
  SiteProgram = mongoose.model('SiteProgram'),
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
  //Expand sites info
  SiteProgram.count({program: req.program})
  .exec(function(err, count) {
    console.log('sitePrograms count:', count);
    if (err) {
      return res.status(500).json({
        error: 'Cannot list the sitePrograms when query program'
      });
    }

    var jsonObj = req.program.toJSON();
    jsonObj['sitesCount'] = count;
     
    res.json(jsonObj);
  });
};


/**
 * Show an program
 */
exports.sites = function(req, res) {
  //Expand sites info
  SiteProgram.find({program: req.program})
  .exec(function(err, sitePrograms) {
    console.log('sitePrograms ');
    if (err) {
      return res.status(500).json({
        error: 'Cannot list the sitePrograms when query program'
      });
    }
     
    res.json(sitePrograms);
  });
};

exports.statistic = function(req, res, next) {
  if (!('statistic' in req.query)) {
    next();
    return;
  }

  Program.count(function(err, count) {
    if (err) {
      console.error('Program count error:', err);
      return res.status(500).json({
        error: 'count the Program error'
      });
    }

    res.json({
      bindCount: count,
      unbindCount: 0
    });
    return;
  });
};

exports.bindSites = function(req, res) {
  req.checkBody('sites', 'invalid sites').isJSON();

  var errors = req.validationErrors(true);
  if (false && errors) {
    res.send(errors, 400);
    return;
  }

  if (req.body.sites.length === 0) {
    console.log(33);
    res.send('sites length is zero', 401);
    return;
  };

  //Check sites first
  Site.find({"_id": {$in: req.body.sites}})
  .exec(function (err, sites) {
    // body...
    if (err) {
      return res.status(500).json({
        error: 'Query BindSites count error'
      });
    }
    if (sites.length !== req.body.sites.length) {
      return res.status(400).json({
        error: 'Invalid sites'
      });
    };

    // console.log('sites:', sites);

    var spArr = _.map(sites, function (site) {
      // body...
      return {
        site: site._id,
        siteName: site.siteName,
        program: req.program._id,
        programName: req.program.name
      };
    });

    // console.log('spArr:', spArr);

    //Do batch insert
    SiteProgram.collection.insert(spArr, function(err, sitePrograms) {
      if (err) {
        console.log('err is:', err);
        return res.status(500).json({
          error: 'SiteProgram insertion failure'
        });
      };
      res.json(sitePrograms);
    });

  });
};


// /**
//  * Update an customer
//  */
// exports.update = function(req, res) {
//   var customer = req.customer;
//   //console.log(req);
//   customer = _.extend(customer, req.body);

//   customer.save(function(err) {
//     if (err) {
//       return res.status(500).json({
//         error: 'Cannot update the customer'
//       });
//     }
//     res.json(customer);

//   });
// };


/**
 * Show an program's sites information
 */
exports.all = function(req, res) {
  //collect sites information
  Program.find({
  }).select('-__t -__v -deleteFlag -modified')
    .exec(function(err, programs) {
      if (err) {
        console.error('find programs error');
        res.send(err, 500);
        return;
      };
       
      res.json(programs);
    });
};