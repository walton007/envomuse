'use strict';

/* jshint -W098 */
var express = require('express'),
   mean = require('meanio'),
   customer = require('../controllers/customer'),
   sites = require('../controllers/site'),
   programs = require('../controllers/program'),
   comingJobs = require('../controllers/comingJob'),
   jobs = require('../controllers/job'),
   songs = require('../controllers/song'),
   sitePrograms = require('../controllers/siteProgram');

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
  .get(jobs.show)
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
  .get(jobs.programs);
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
  apiRouter.get('/programs', programs.statistic, programs.all);
  apiRouter.route('/programs/:programId')
  .get(programs.show)
  .delete(function(req, res, next) {
    res.send(200);
  });
  apiRouter.route('/programs/:programId/bindSite')
  .post(function(req, res, next){
    return sites.site(req, res, next, req.body.siteId);
  }, sites.bindProgram);
  apiRouter.route('/programs/:programId/bindSites')
  .post(programs.bindSites);

  apiRouter.route('/programs/:programId/sites')
  .get(programs.sites);

  apiRouter.param('programId', programs.program); 

  //Songs
  apiRouter.route('/songs')
  .get(songs.all);
  apiRouter.route('/songs/:songId')
  .get(songs.show);
  apiRouter.route('/songs/:songId/hqfile')
  .get(function(req, res, next) {
    var hqfileUrl = req.song.rawfilepath.substr(config.root.length);
    // console.log('hqfileUrl:', hqfileUrl);
    res.redirect(hqfileUrl);
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
  .get(sites.statistic, sites.all)
  apiRouter.route('/sites/:siteId')
  .get(sites.show)
  .put(sites.update)
  .delete(sites.destroy);
  apiRouter.route('/sites/:siteId/bindLicense')
  .post(sites.bindLicense);
  apiRouter.route('/sites/:siteId/bindProgram')
  .post(function(req, res, next) {
    return programs.program(req, res, next, req.body.programId);
  }, sites.bindProgram);
  apiRouter.route('/sites/:siteId/license/activate')
  .post(sites.licenseActivate);
  apiRouter.route('/sites/:siteId/connectionLogs')
  .get(function(req, res, next) {
    res.json([{id:2}]);
  });
  apiRouter.route('/sites/:siteId/programs')
  .get(sites.programs);
  apiRouter.param('siteId', sites.site);

  //All Terminal Player related interface will be moved to another dedicated server 
  var terminalRouter = express.Router();
  app.use('/terminal', terminalRouter);
  //ConnectionLogs For Music Player
  // ConnectionLog
  terminalRouter.route('/login')
  .post(function(req, res, next) {
    //param: {uuid: 'abc', deviceInfo: {mac:'ac-de-fc-sd'}}
    //update site.license info
    res.json({ok: true});
  });
  terminalRouter.route('/getTernimalConfig')
  .get(function(req, res, next) {
    //return site.playerSetting
    //once a day 
    res.json({fadeIn: 10, fadeOut:12 });
  });
  terminalRouter.route('/getJingoList')
  .get(function(req, res, next) {
    //return the site's jingo information
    //once a day 
    res.json({jingo: []});
  });
  terminalRouter.route('/getPlayList')
  .get(function(req, res, next) {
    //query param: version
    //once a day 
    res.json({playlist: []});
  });
  terminalRouter.route('/songs/:songId/hqfile')
  .get(function(req, res, next) {
    var hqfileUrl = req.song.rawfilepath.substr(config.root.length);
    // console.log('hqfileUrl:', hqfileUrl);
    res.redirect(hqfileUrl);
  });
  terminalRouter.route('/reports')
  .post(function(req, res, next) {
    // once a day: for statistic purpose
    // concrete content need to be defined later
    res.json({ok: true});
  });
  terminalRouter.route('/heartbeat')
  .post(function(req, res, next) {
    // 30 miniutes once a day: for statistic purpose
    // this will update site.lastHeartbeat
    res.json({ok: true});
  });

  //For Debug
  apiRouter.route('/debug/siteProgram')
  .get(sitePrograms.all);

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