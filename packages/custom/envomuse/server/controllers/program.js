'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Program = mongoose.model('Program'),
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
  SiteProgram.find({program: req.program}).sort('-created')
  .exec(function(err, sitePrograms) {
    console.log('sitePrograms:', sitePrograms);
    if (err) {
      return res.status(500).json({
        error: 'Cannot list the sitePrograms when query program'
      });
    }

    var jsonObj = req.program.toJSON();
    jsonObj['sites'] = sitePrograms;
     
    res.json(jsonObj);
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