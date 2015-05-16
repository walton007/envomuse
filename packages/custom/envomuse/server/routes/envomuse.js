'use strict';

/* jshint -W098 */
var express = require('express'),
   mean = require('meanio'),
   customer = require('../controllers/customer'),
   sites = require('../controllers/site'),
   comingJobs = require('../controllers/comingJob'),
   jobs = require('../controllers/job'),
   songs = require('../controllers/song');

// The Package is past automatically as first parameter
module.exports = function(Envomuse, app, auth, database) {
  //Set musicAssert
  var config = mean.loadConfig();
  app.use('/musicAssert', express.static(config.root + '/'+ config.musicAssert));

  var apiRouter = express.Router();
  app.use('/api', apiRouter);

  //Coming Jobs
  apiRouter.route('/comingJobs')
  .get(comingJobs.statistic, comingJobs.all);
  apiRouter.route('/comingJobs/forceRefresh')
  .post(comingJobs.forceRefresh);

  apiRouter.route('/comingJobs/:comingJobId/import')
  .post(comingJobs.import);
  apiRouter.param('comingJobId', function(req, res, next, id){
    req.comingJobsId = id;
    next();
  }); 

  //Jobs
  apiRouter.get('/jobs', jobs.statistic, jobs.all);

  apiRouter.route('/jobs/:jobId')
  .get(function(req, res, next) {
    res.json({id:2});
  })
  .delete(function(req, res, next) {
    res.send(200);
  });
  apiRouter.route('/jobs/:jobId/generateProgram')
  .post(jobs.generateProgram);
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
  apiRouter.param('jobId', jobs.job); 

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

  //all Tasks
  apiRouter.route('/tasks/')
  .get(comingJobs.allTasks);

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
  .get(songs.all);
  apiRouter.route('/songs/:songId')
  .get(function(req, res, next) {
    res.json([{id:1}]);
  });
  apiRouter.route('/songs/:songId/hqfile')
  .get(function(req, res, next) {
    var hqfileUrl = req.song.rawfilepath.substr(config.root.length);
    // console.log('hqfileUrl:', hqfileUrl);
    res.redirect(hqfileUrl);
    // res.redirect('/musicAssert/alphaEnc.mp3');
  });
  apiRouter.route('/songs/:songId/lqfile')
  .get(function(req, res, next) {
    var rawfileUrl = req.song.rawfilepath.substr(config.root.length);
    // console.log('rawfileUrl:', rawfileUrl);
    res.redirect(rawfileUrl);
  });
  apiRouter.param('songId', songs.song); 

  //Customers
  apiRouter.route('/customers/')
  .get(customer.count, customer.analysis, customer.basicInfos, customer.paginate)
  .post(customer.create);
  // .put(customer.update);  //added jun
  apiRouter.route('/customers/:customerId')
  .get(customer.show)
  .put(customer.update)
  .delete(customer.destroy);
  apiRouter.route('/customers/:customerId/sites')
  .get(customer.sitesPaginate)
  .post(customer.addSite);
  apiRouter.param('customerId', customer.customer); 

  //Sites
  apiRouter.route('/sites/')
  .get(sites.statistic)
  // .post(sites.create);
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

  //integrate admin module
  app.use('/ui', express.static(config.root + '/admin'));
};
