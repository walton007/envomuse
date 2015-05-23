'use strict';

//Articles service used for articles REST endpoint
app.factory('Customers', ['$resource',
  function($resource) {
    return $resource('/api/customers/:customerId', {
      customerId: '@_id'
    }, {
      update: {
        method: 'PUT'
      },
      'getIncrCount':  {method:'GET', isArray:false, params:{'increase': true,
      startDate:1, endDate:1}},
      'getCount': {method:'GET', isArray:false, params:{'count':0}},
      'getPageData': {method:'GET', isArray:false,
         params:{'pageNumber':1, 'pageSize':10, 'type': 'new'}}
    });
  }
]);

// A RESTful factory for retreiving brands from 'brand.json'
app.factory('brands', ['$http', function ($http) {

  var path = 'api/brands.json';
  var brands = $http.get(path).then(function (resp) {
    return resp.data;
  });

  var path_contact = 'api/contacts.json';
  var contacts = $http.get(path_contact).then(function (resp) {
    return resp.data;
  });




  var factory = {};

  factory.all = function () {
    return brands;
  };

  factory.getstat = function($resource) {
    return $resource('warehouses/:warehouseId', {
      warehouseId: '@_id'
    }, {
      update: {
        method: 'PUT'
      }
    });
  };

  factory.allContacts = function () {
    return contacts.then(function(contacts){
      return contacts.map(function(e){
        return {'name':e.name};
      })
    });
  };

  factory.get = function (id) {
    return brands.then(function(brands){
      for (var i = 0; i < brands.length; i++) {
        if (brands[i].id == id) return brands[i];
      }
      return null;
    })
  };

  factory.getLength = function(){
    return brands.then(function(brands){
      return brands.length;
    })
  };

  //get a list of item in a page
  factory.getPage = function(pageNo){
    var results = [];
    var LISTCHUNKSIZE = 12; // items per page

    return brands.then(function(brands){
      for(var i=0;i<LISTCHUNKSIZE;i++){
        var res = brands[(pageNo-1)*LISTCHUNKSIZE+i];
        if(res){
          results.push(res);
        }
      }
      return results;
    });
  };

  //create new => need server support
  /*
  factory.createNew = function(newBrand){
    newBrand.id = getLength+1;
    $http.post(path, newBrand).success(function(){
      $scope.msg = 'Data saved';
      }).error(function(data) {
          alert("failure message:" + JSON.stringify({data:data}));
    });
  }
  */

  return factory;
}]);