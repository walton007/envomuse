'use strict';

/* jshint -W098 */
var express = require('express'),
   mean = require('meanio'),
   customer = require('../controllers/customer');

// The Package is past automatically as first parameter
module.exports = function(Envomuse, app, auth, database) {
  //Set musicAssert
  var config = mean.loadConfig();
  app.use('/musicAssert', express.static(config.root + '/musicAssert'));

  var apiRouter = express.Router();
  app.use('/api', apiRouter);

  //Coming Jobs
  apiRouter.route('/comingJobs')
  .get(function(req, res, next) {
    res.json([{id:1}, {id:2}]);
  });
  
  apiRouter.route('/comingJobs/:comingJobId')
  .get(function(req, res, next) {
    res.json({id:2});
  });

  apiRouter.route('/comingJobs/:comingJobId/active')
  .post(function(req, res, next) {
    res.send(200);
  });
  apiRouter.param('comingJobId', function(req, res, next, id){
    req.comingJobs = null;
    next();
  }); 

  //Jobs
  apiRouter.get('/jobs', function(req, res, next) {
    res.json([{id:1}, {id:2}]);
  });

  apiRouter.route('/jobs/:jobId')
  .get(function(req, res, next) {
    res.json({id:2});
  })
  .delete(function(req, res, next) {
    res.send(200);
  });
  apiRouter.route('/jobs/:jobId/generateProgram')
  .post(function(req, res, next) {
    //generateProgram
    res.json({
      id: 100
    });
  });
  apiRouter.param('jobId', function(req, res, next, id){
    req.job = null;
    next();
  }); 

  //Programs
  apiRouter.get('/programs', function(req, res, next) {
    res.json([{id:1}, {id:2}]);
  });
  apiRouter.route('/programs/:programId')
  .get(function(req, res, next) {
    res.json({id:2});
  })
  .delete(function(req, res, next) {
    res.send(200);
  });
  apiRouter.route('/programs/:programId/bindSite')
  .post(function(req, res, next) {
    res.json({id:2});
  });
  apiRouter.param('programId', function(req, res, next, id){
    req.program = null;
    next();
  }); 

  //Songs
  apiRouter.route('/songs')
  .get(function(req, res, next) {
    res.json([{id:1}, {id:2}]);
  });
  apiRouter.route('/songs/:songId')
  .get(function(req, res, next) {
    res.json([{id:1}]);
  });
  apiRouter.route('/songs/:songId/hqfile')
  .get(function(req, res, next) {
    res.redirect('/musicAssert/alphaEnc.mp3');
  });
  apiRouter.route('/songs/:songId/lqfile')
  .get(function(req, res, next) {
    res.redirect('/musicAssert/alpha.mp3');
  });
  apiRouter.param('songId', function(req, res, next, id){
    req.program = null;
    next();
  }); 

  app.route('/resource/alpha.mp3')
  .get(function(req, res, next) {
    res.json([{id:1}, {id:23}]);
  });
  app.route('/resource/alphaEnc.mp3')
  .get(function(req, res, next) {
    res.json([{id:1}, {id:4}]);
  });

  //Customers
  apiRouter.route('/customers/')
  .get(customer.all)
  .post(customer.create);
  apiRouter.route('/customers/:customerId')
  .get(customer.show)
  .put(customer.update)
  .delete(customer.destroy);
  apiRouter.param('customerId', customer.customer); 

  //Sites
  apiRouter.route('/sites/')
  .get(function(req, res, next) {
    res.json([{id:1}, {id:2}]);
  })
  .post(function(req, res, next) {
    res.json({id:2});
  });
  apiRouter.route('/sites/:siteId')
  .get(function(req, res, next) {
    res.json({id:2});
  })
  .put(function(req, res, next) {
    res.json({id:2});
  })
  .delete(function(req, res, next) {
    res.json(200);
  });
  apiRouter.route('/sites/:siteId/bindLicense')
  .post(function(req, res, next) {
    res.send(200);
  });
  apiRouter.route('/sites/:siteId/license/activate')
  .post(function(req, res, next) {
    res.send(200);
  });
  apiRouter.route('/sites/:siteId/connectionLogs')
  .get(function(req, res, next) {
    res.json([{id:2}]);
  });
  apiRouter.param('siteId', function(req, res, next, id){
    req.site = null;
    next();
  });

  //ConnectionLogs For Music Player
  // ConnectionLog


  app.get('/envomuse/example/admin', auth.requiresAdmin, function(req, res, next) {
    res.send('Only users with Admin role can access this');
  });

  app.get('/envomuse/example/render', function(req, res, next) {
    Envomuse.render('index', {
      package: 'envomuse'
    }, function(err, html) {
      //Rendering a view from the Package server/views
      res.send(html);
    });
  });
};
