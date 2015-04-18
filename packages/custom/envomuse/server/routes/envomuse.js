'use strict';

/* jshint -W098 */
var express = require('express'),
   mean = require('meanio'),
   customer = require('../controllers/customer'),
   sites = require('../controllers/site'),
   comingJobs = require('../controllers/comingJob');

// The Package is past automatically as first parameter
module.exports = function(Envomuse, app, auth, database) {
  //Set musicAssert
  var config = mean.loadConfig();
  app.use('/musicAssert', express.static(config.root + '/musicAssert'));

  var apiRouter = express.Router();
  app.use('/api', apiRouter);

  //Coming Jobs
  apiRouter.route('/comingJobs')
  .get(comingJobs.all);
  apiRouter.route('/comingJobs/forceRefresh')
  .post(comingJobs.forceRefresh);
  
  apiRouter.route('/comingJobs/:comingJobId')
  .get(function(req, res, next) {
    res.json({id:2});
  });

  apiRouter.route('/comingJobs/:comingJobId/import')
  .post(function(req, res, next) {
    res.send(200);
  });
  apiRouter.param('comingJobId', function(req, res, next, id){
    req.comingJobsId = id;
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
    req.body.startDate = new Date();
    req.body.endDate = new Date();
    //generateProgram
    res.json({
      id: 100
    });
  });
  apiRouter.route('/jobs/:jobId/export')
  .post(function(req, res, next) {
    //export job war package
    res.json([{
      id: 100
    }]);
  });
  apiRouter.route('/jobs/:jobId/programs')
  .post(function(req, res, next) {
    //export job war package
    res.json([{
      id: 100,
      programInfo : {}
    }]);
  });
  apiRouter.param('jobId', function(req, res, next, id){
    req.job = null;
    next();
  }); 

  //export task
  apiRouter.route('/exportTasks/')
  .get(function(req, res, next) {
    res.json([{taskid:2, jobid:1, complete: false, warFileName:10}]);
  })
  apiRouter.route('/exportTasks/:taskid')
  .get(function(req, res, next) {
    res.json({id:2});
  })
  .delete(function(req, res, next) {
    res.send(200);
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
  apiRouter.route('/customers/?expand')
  .get(customer.all)
  .post(customer.create);
  apiRouter.route('/customers/:customerId')
  .get(customer.show)
  .put(customer.update)
  .delete(customer.destroy);
  apiRouter.route('/customers/:customerId/sites')
  .get(function(req, res, next) {
    res.json([{siteid:1}]);
  });
  apiRouter.param('customerId', customer.customer); 

  //Sites
  apiRouter.route('/sites/')
  .get(sites.all)
  .post(sites.create);
  apiRouter.route('/sites/:siteId')
  .get(sites.show)
  .put(sites.update)
  .delete(sites.destroy);
  apiRouter.route('/sites/:siteId/bindLicense')
  .post(sites.bindLicense);
  apiRouter.route('/sites/:siteId/license/activate')
  .post(sites.licenseActivate);
  apiRouter.route('/sites/:siteId/connectionLogs')
  .get(function(req, res, next) {
    res.json([{id:2}]);
  });
  apiRouter.param('siteId', sites.site);

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
