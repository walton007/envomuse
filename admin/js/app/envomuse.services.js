'use strict';

//Customers service : Customer REST endpoint
app.factory('Customers', ['$resource', function($resource) {
    return $resource(
      '/api/customers/:customerId', 
    {
      customerId: '@_id'
    },
    {
  
      /*'get':  {method:'GET'},
      'save':   {method:'POST'},
      'query':  {method:'GET', isArray:true},
      'remove': {method:'DELETE'},
      'delete': {method:'DELETE'},*/
      'update': {method: 'PUT'},
      'getIncrCount':  {method:'GET', isArray:false, params:{'increase': true, startDate:1, endDate:1}},
      'getCount': {method:'GET', isArray:false, params:{'count':0}},
      'getPageData': {method:'GET', isArray:false, params:{'pageNumber':1, 'pageSize':12}}
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

//ComingJobs, used for dash statistic
app.factory('ComingJobs', ['$resource', function($resource) {
    return $resource(
      '/api/comingJobs/', 
    {
    },
    {
      //'get': {method:'GET', isArray:false},
      'getCount':{method:'GET', isArray:false}
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

//Programs
app.factory('Programs', ['$resource', function($resource) {
    return $resource(
      '/api/programs/', 
    {
    },
    {
      'getCount': {method:'GET', isArray:false, params:{'statistic':''}}
    });
  }
]);