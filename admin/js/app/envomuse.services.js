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
      'get': {method:'GET', isArray:true}
    });
  }
]);