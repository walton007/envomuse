'use strict';

/* jshint -W098 */
var express = require('express'),
   mean = require('meanio'),
   _ = require('lodash'),
   config = mean.loadConfig(),
   customer = require('../controllers/customer'),
   sites = require('../controllers/site'),
   channels = require('../controllers/channel'),
   programs = require('../controllers/program'),
   jobs = require('../controllers/job'),
   tracks = require('../controllers/track'),
   users = require('../controllers/user'),
   terminals = require('../controllers/terminal'),
   dashboard = require('../controllers/dashboard'),
   exportRequests = require('../controllers/exportRequest'),
   comingJobs = (config.enableZmq) ? require('../controllers/comingJobZmq') : require('../controllers/comingJob');


// The Package is past automatically as first parameter
module.exports = function(Envomuse, app, auth, database) {
  //Set musicAssert
  
  app.use('/musicAssert', express.static(config.root + '/'+ config.musicAssert));

  var apiRouter = express.Router();
  app.use('/api'
    , function (req, res, next) {
      if (!config.requireAuth) {
        return next();
      }

      return auth.requiresAdmin(req, res, next);
    }
    ,apiRouter);

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
  
  apiRouter.route('/programs/:programId/generateExportRequest')
  .post(programs.generateExportRequest);

  apiRouter.param('programId', programs.program);

  //ExportRequest
  apiRouter.route('/exportRequests/')
  .get(exportRequests.all);
  apiRouter.route('/exportRequests/:exportRequestId')
  .get(exportRequests.show);
  apiRouter.param('exportRequestId', exportRequests.exportRequest);

  //tracks
  apiRouter.route('/tracks')
  .get(tracks.all);
  apiRouter.route('/tracks/:trackId')
  .get(tracks.show);
  apiRouter.route('/tracks/:trackId/hqfile')
  .get(function(req, res, next) {
    var hqfileUrl = req.trackI.rawfilepath.substr(config.root.length);
    // console.log('hqfileUrl:', hqfileUrl);
    res.redirect(hqfileUrl);
  });
  apiRouter.route('/trackId/:trackId/lqfile')
  .get(function(req, res, next) {
    var rawfileUrl = req.track.rawfilepath.substr(config.root.length);
    // console.log('rawfileUrl:', rawfileUrl);
    res.redirect(rawfileUrl);
  });
  apiRouter.param('trackId', tracks.track); 

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

  //Users Management
  apiRouter.route('/users/')
  .get(users.all);
  
  ////////////////////////////////////////////////////////////////////////////////////////
  //API For IT-Tool: IT-Tool is used for sync track and expose musicPlayer to customer
  var itapiRouter = express.Router();
  app.use('/itapi'
    , function (req, res, next) {
      if (!config.requireAuth) {
        return next();
      }

      console.log('req.url:', req.url);
      console.log('_.endsWith:', _.endsWith);

      if (_.endsWith(req.url, '/login')) {
        console.log('1');
        return next();
      }

      console.log('2');

      return auth.requiresItAdminRole(req, res, next);
    }
    ,itapiRouter);

  itapiRouter.route('/login')
  .post(function(req, res, next) {
    res.json({ok: true});
  });
  // itapiRouter's exportRequests
  itapiRouter.route('/exportRequests/')
  .get(exportRequests.all);
  itapiRouter.route('/exportRequests/:exportRequestId')
  .get(exportRequests.show);
  itapiRouter.param('exportRequestId', exportRequests.exportRequest);
  
  // itapiRouter's track information
  itapiRouter.route('/tracks/:trackId/hqfile')
  .get(function(req, res, next) {
    var hqfileUrl = req.track.rawfilepath.substr(config.root.length);
    console.log('hqfileUrl:', hqfileUrl);
    res.redirect(hqfileUrl);
  });
  itapiRouter.route('/tracks/:trackId/meta')
  .get(function(req, res, next) {
    var trackInfo = _.pick(req.track.toJSON(), '_id', 'name', 'duration', 'hash');
    res.json(trackInfo);
  });
  itapiRouter.param('trackId', tracks.track); 

  ////////////////////////////////////////////////////////////////////////////////////////
  //API Terminal Player related interface will be moved to another dedicated server 
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

  terminalRouter.route('/playlists')
  .get(terminals.getProgramList);

  terminalRouter.route('/playlists/:playlistId')
  .get(terminals.getProgram);
  terminalRouter.param('playlistId', terminals.playlist); 

  terminalRouter.route('/tracks/:trackId/hqfile')
  .get(function(req, res, next) {
    var hqfileUrl = req.track.rawfilepath.substr(config.root.length);
    console.log('hqfileUrl:', hqfileUrl);
    res.redirect(hqfileUrl);
  });
  terminalRouter.route('/tracks/:trackId/meta')
  .get(function(req, res, next) {
    var trackInfo = _.pick(req.track.toJSON(), '_id', 'name', 'duration', 'hash');
    res.json(trackInfo);
  });
  terminalRouter.param('trackId', tracks.track); 


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

  

  var adminRouter = express.Router();
  app.use('/admin', adminRouter);

  adminRouter.use(function(req, res, next) {
    if (req.url === '/' || req.url === '/index.html') {
      return dashboard.render(req, res, config.requireAuth);
    }
    next();
  }, 
  express.static(config.root + '/admin'));

  //integrate admin module
  // app.use('/admin', express.static(config.root + '/admin'));  //admin
  app.use('/', express.static(config.root + '/home'));  //home

};