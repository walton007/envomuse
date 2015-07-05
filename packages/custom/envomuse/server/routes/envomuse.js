'use strict';

/* jshint -W098 */
var express = require('express'),
   mean = require('meanio'),
   config = mean.loadConfig(),
   customer = require('../controllers/customer'),
   sites = require('../controllers/site'),
   channels = require('../controllers/channel'),
   programs = require('../controllers/program'),
   jobs = require('../controllers/job'),
   songs = require('../controllers/song'),
   users = require('../controllers/user'),
   dashboard = require('../controllers/dashboard'),
   comingJobs = (config.enableZmq) ? require('../controllers/comingJobZmq') : require('../controllers/comingJob');


// The Package is past automatically as first parameter
module.exports = function(Envomuse, app, auth, database) {
  //Set musicAssert
  
  app.use('/musicAssert', express.static(config.root + '/'+ config.musicAssert));

  var apiRouter = express.Router();
  app.use('/api', apiRouter);

  //all Tasksx`
  apiRouter.route('/dashboard/')
  .get(dashboard.analysis);

  //Coming Jobs
  apiRouter.route('/comingJobs')
  .get(comingJobs.statistic, comingJobs.all);
  apiRouter.route('/comingJobs/forceRefresh')
  .post(comingJobs.forceRefresh);

  apiRouter.route('/comingJobs/:comingJobId/')
  .get(comingJobs.show);
  apiRouter.route('/comingJobs/:comingJobId/import')
  .post(comingJobs.import);
  apiRouter.param('comingJobId', function(req, res, next, id){
    req.comingJobsId = id;
    next();
  }); 

  //Jobs
  apiRouter.get('/jobs', jobs.all);

  apiRouter.route('/jobs/:jobId')
  .get(jobs.show)
  .delete(function(req, res, next) {
    res.send(200);
  });
  // apiRouter.route('/jobs/:jobId/generateProgram')
  // .post(jobs.generateProgram);
  apiRouter.route('/jobs/:jobId/export')
  .post(function(req, res, next) {
    //export job war package
    res.json([{
      id: 100
    }]);
  });
  apiRouter.route('/jobs/:jobId/boxes/:boxId')
  .get(jobs.box);
  
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
  // apiRouter.get('/programs', programs.statistic, programs.all);
  apiRouter.route('/programs/:programId')
  .get(programs.show);
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
  .get(customer.basicInfos, customer.paginate)
  .post(customer.create);
  // .put(customer.update);  //added jun
  apiRouter.route('/customers/:customerId')
  .get(customer.show)
  .put(customer.update)
  .delete(customer.destroy);
  apiRouter.route('/customers/:customerId/sites')
  .get(sites.basicInfos, customer.sitesPaginate)
  .post(customer.addSite);

  // Add User
  apiRouter.route('/customers/:customerId/bindUser')
  .post(customer.bindUser);

  apiRouter.param('customerId', customer.customer); 

  //Channels
  apiRouter.route('/customers/:customerId/channels')
  .get(channels.basicChannelInfo)
  .post(channels.addChannel);
  apiRouter.route('/channels/:channelId/')
  .get(channels.getChannelProgramInfo);

  apiRouter.route('/channels/:channelId/bindSites')
  .post(channels.bindSites);

  apiRouter.route('/channels/:channelId/generateProgram')
  .post(channels.generateProgram);

  apiRouter.param('channelId', channels.channel);
  
  //Sites
  apiRouter.route('/sites/:siteId')
  .get(sites.show)
  .put(sites.update)
  .delete(sites.destroy);
  apiRouter.route('/sites/:siteId/bindLicense')
  .post(sites.bindLicense);
  

  apiRouter.route('/sites/:siteId/licenseActivate')
  .post(sites.licenseActivate);
  apiRouter.route('/sites/:siteId/connectionLogs')
  .get(function(req, res, next) {
    res.json([{id:2}]);
  });
  apiRouter.route('/sites/:siteId/refreshPlayerStatus')
  .post(function(req, res, next) {
    res.json({playerStatus: 'online'});
  });
  apiRouter.route('/sites/:siteId/timelineLogs')
  .get(function(req, res, next) {
    res.json([{playerStatus: 'online'}]);
  });

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
  terminalRouter.route('/config')
  .get(function(req, res, next) {
    //return site.playerSetting
    //once a day 
    res.json({fadeIn: 10, fadeOut:12 });
  });
  terminalRouter.route('/jingoList')
  .get(function(req, res, next) {
    //return the site's jingo information
    //once a day 
    res.json({jingo: []});
  });
  terminalRouter.route('/playlist')
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

  //Users Management
  apiRouter.route('/users/')
  .get(users.all);

  var adminRouter = express.Router();
  app.use('/admin', adminRouter);
  //auth.requiresLogin,
  adminRouter.use(
    // auth.requiresLogin, 
    function(req, res, next) {
      // if (!req.isAuthenticated()) {
      //   return res.status(401).send('User is not authorized');
      // }
      if (req.url === '/' || req.url === '/index.html') {
        return dashboard.render(req, res);
      }
      next();
    }, 
    express.static(config.root + '/admin'));

  //integrate admin module
  // app.use('/admin', express.static(config.root + '/admin'));  //admin
  app.use('/', express.static(config.root + '/home'));  //home

};