'use strict';


//get customers basic info ==> for site bind
app.factory('DashStats', ['$resource', function($resource) {
    return $resource(
      '/api/dashboard/', 
    {
      
    },
    {
  
      /*'get':  {method:'GET'},
      'save':   {method:'POST'},
      'query':  {method:'GET', isArray:true},
      'remove': {method:'DELETE'},
      'delete': {method:'DELETE'},*/
      'get':{method:'GET',isArray:false}
    });
  }
]);


//Customers service : Customer REST endpoint
app.factory('Customers', ['$resource', function($resource) {
    return $resource(
      '/api/customers/:customerId', 
    {
      customerId: '@_id'
    },
    {
      'update': {method: 'PUT'},
      'getIncrCount':  {method:'GET', isArray:false, params:{'increase': true, startDate:1, endDate:1}},
      'getCount': {method:'GET', isArray:false, params:{'count':0}},
      'getPageData': {method:'GET', isArray:false, params:{'pageNumber':1, 'pageSize':10}}
    });
  }
]);

//get customers basic info ==> for site bind
app.factory('CustomersBasic', ['$resource', function($resource) {
    return $resource(
      '/api/customers/', 
    {
      
    },
    {
  
      /*'get':  {method:'GET'},
      'save':   {method:'POST'},
      'query':  {method:'GET', isArray:true},
      'remove': {method:'DELETE'},
      'delete': {method:'DELETE'},*/
      'get':{method:'GET',isArray:true,params:{'basicInfos':''}}
    });
  }
]);

app.factory('CustomerSites', ['$resource', function($resource) {
    return $resource(
      '/api/customers/:customerId/sites', 
    {
      customerId: '@_id'
    },
    {
      'getPageData': {method:'GET', isArray:false, params:{'pageNumber':1, 'pageSize':12}}
    });
  }
]);

app.factory('CustomerChannels', ['$resource', function($resource) {
    return $resource(
      '/api/customers/:customerId/channels', 
    {
      customerId: '@_id'
    },
    {
      'getChannels': {method:'GET', isArray:true},
      'saveChannel': {method:'POST'}
    });
  }
]);

app.factory('ChannelsBindSite', ['$resource', function($resource) {
    return $resource(
      '/api/channels/:channelId/bindSites', 
    {
      channelId: '@_id'
    },
    {
      'bind': {method:'POST'}
    });
  }
]);

app.factory('ChannelsProgramList', ['$resource', function($resource) {
    return $resource(
      '/api/channels/:channelId/', 
    {
      channelId: '@_id'
    },
    {
      'getPrograms': {method:'GET', isArray:true}
    });
  }
]);

app.factory('CustomerManager', ['$resource', function($resource) {
    return $resource(
      '/api/customers/:customerId/bindUser', 
    {
      customerId: '@_id'
    },
    {
      'save':   {method:'POST'}
    });
  }
]);

//STORE - SITES
app.factory('Sites', ['$resource', function($resource) {
    return $resource(
      '/api/sites/:siteId', 
    {
      siteId: '@_id'
    },
    {

      /*'get':  {method:'GET'},
      'save':   {method:'POST'},
      'query':  {method:'GET', isArray:true},
      'remove': {method:'DELETE'},
      'delete': {method:'DELETE'},*/
      'update': {method: 'PUT'},
      'siteStats': {method:'GET', isArray:false, params:{'statistic':true}},
      'getPageData': {method:'GET', isArray:false, params:{'pageNumber':1, 'pageSize':12}}
    });
  }
]);

app.factory('SiteLicense', ['$resource', function($resource) {
    return $resource(
      '/api/sites/:siteId/bindLicense', 
    {
      siteId: '@_id'
    },
    {
      'save':   {method:'POST'}
    });
  }
]);

//Activate license
app.factory('License', ['$resource', function($resource) {
    return $resource(
      '/api/sites/:siteId/license/activate', 
    {
      siteId: '@_id'
    },
    {
      'generate': {method: 'POST'},
      'siteStats': {method:'GET', isArray:false, params:{'statistic':true}},
      'getPageData': {method:'GET', isArray:false, params:{'pageNumber':1, 'pageSize':12}}
    });
  }
]);



//Jobs
app.factory('Jobs', ['$resource', function($resource) {
    return $resource(
      '/api/jobs/', 
    {
    },
    {
      'get': {method:'GET', isArray:true},
      'getCount':{method:'GET', isArray:false, params:{'statistic':0}}
    });
  }
]);

app.factory('JobById', ['$resource', function($resource) {
    return $resource(
      '/api/jobs/:jobId', 
    {
      jobId: '@_id'
    },
    {
      // 'get': {method:'GET', isArray:false},
      // 'getCount':{method:'GET', isArray:false, params:{'statistic':0}}
    });
  }
]);

//boxById
app.factory('BoxById', ['$resource', function($resource) {
    return $resource(
      '/api/jobs/:jobId/boxes/:boxId', 
    {
      jobId: '@_id',
      boxId: '@_id'
    },
    {
      // 'get': {method:'GET', isArray:false},
      // 'getCount':{method:'GET', isArray:false, params:{'statistic':0}}
    });
  }
]);



//ComingJobs, used for dash statistic
app.factory('ComingJobs', ['$resource', function($resource) {
    return $resource(
      '/api/comingJobs/', 
    {
    },
    {
      //'get': {method:'GET', isArray:false},
      // 'getCount':{method:'GET', isArray:true}
      'getCount': {method:'GET', isArray:false, params:{'statistic':''}}
    });
  }
]);

app.factory('ComingJobsRefresh', ['$resource', function($resource) {
    return $resource(
      '/api/comingJobs/forceRefresh', 
    {
    },
    {
      //'get': {method:'GET', isArray:false},
      'refresh':{method:'POST',isArray:true}
    });
  }
]);

app.factory('ComingJobsImport', ['$resource', function($resource) {
    return $resource(
      '/api/comingJobs/:jobId/import', 
    {
      jobId:'@_id'
    },
    {
      'import':{method:'POST'}
    });
  }
]);

app.factory('GenerateProgram', ['$resource', function($resource) {
    return $resource(
      '/api/jobs/:jobId/generateProgram', 
    {
      jobId:'@_id'
    },
    {
      'generate':{method:'POST',}
    });
  }
]);


//Tasks, used for comingjos list page
app.factory('Tasks', ['$resource', function($resource) {
    return $resource(
      '/api/tasks/', 
    {
    },
    {
      'allTasks': {method:'GET', isArray:true}
    });
  }
]);

//Programs - Playlist
app.factory('Programs', ['$resource', function($resource) {
    return $resource(
      '/api/programs/', 
    {
    },
    {
      'allPrograms': {method:'GET', isArray:true},
      'getCount': {method:'GET', isArray:false, params:{'statistic':''}}
      //'getPageData': {method:'GET', isArray:false, params:{'pageNumber':1, 'pageSize':12}}
    });
  }
]);

app.factory('ProgramById', ['$resource', function($resource) {
    return $resource(
      '/api/programs/:programId/', 
    {
      programId: '@_id'
    },
    {
      
    });
  }
]);

app.factory('ProgramBindSite', ['$resource', function($resource) {
    return $resource(
      '/api/programs/:programId/bindSite', 
    {
      programId:'@_id'
    },
    {
      'bind':{method:'POST'}
    });
  }
]);

//users

///customers/:customerId/bindUser
app.factory('Users', ['$resource', function($resource) {
    return $resource(
      '/api/users', 
    {
      
    },
    {
      'allUsers': {method:'GET', isArray:true},
    });
  }
]);