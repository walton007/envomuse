'use strict';

//Customers service : Customer REST endpoint
app.factory('Customers', ['$resource',
  function($resource) {
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
      'getPageData': {method:'GET', isArray:false, params:{'offset':0, 'size':10, 'type': 'new'}}
    });
  }
]);

//STORE - SITES
app.factory('Sites', ['$resource',
  function($resource) {
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
      'siteStats': {method:'GET', isArray:false, params:{'statistic':true}},

      'update': {method: 'PUT'},
      'getIncrCount':  {method:'GET', isArray:false, params:{'increase': true, startDate:1, endDate:1}},
      'getCount': {method:'GET', isArray:false, params:{'count':0}},
      'getPageData': {method:'GET', isArray:false, params:{'offset':0, 'size':10, 'type': 'new'}}
    });
  }
]);

/*
//JOBS
app.factory('Sites', ['$resource',
  function($resource) {
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
      'delete': {method:'DELETE'},*
      'update': {method: 'PUT'},
      'getIncrCount':  {method:'GET', isArray:false, params:{'increase': true, startDate:1, endDate:1}},
      'getCount': {method:'GET', isArray:false, params:{'count':0}},
      'getPageData': {method:'GET', isArray:false, params:{'offset':0, 'size':10, 'type': 'new'}}
    });
  }
]);

//COMING JOBS
app.factory('Sites', ['$resource',
  function($resource) {
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
      'delete': {method:'DELETE'},*
      'update': {method: 'PUT'},
      'getIncrCount':  {method:'GET', isArray:false, params:{'increase': true, startDate:1, endDate:1}},
      'getCount': {method:'GET', isArray:false, params:{'count':0}},
      'getPageData': {method:'GET', isArray:false, params:{'offset':0, 'size':10, 'type': 'new'}}
    });
  }
]);
*/