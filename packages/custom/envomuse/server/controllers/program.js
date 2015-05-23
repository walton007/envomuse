'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Program = mongoose.model('Program'),
  _ = require('lodash');


/**
 * Find program by id
 */
exports.program = function(req, res, next, id) {
  Program.load(id, function(err, customer) {
    if (err) return next(err);
    if (!customer) return next(new Error('Failed to load program ' + id));
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
 * bind this program to some site
 */
exports.bindSite = function(req, res) {
  // res.json(req.program);
  res.json({id:2});
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