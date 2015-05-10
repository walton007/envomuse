// A RESTful factory for retreiving stores from 'brand.json'


//TODO: All results should be paginized with the brandId! To be done on server side.

app.factory('stores', ['$http', function ($http) {

  var path = 'api/stores.json';
  var stores = $http.get(path).then(function (resp) {
    return resp.data;
  });

  var pathBrand = 'api/brands.json';
  var brands = $http.get(pathBrand).then(function (resp) {
    return resp.data;
  });

  var factory = {};

  factory.all = function () {
    return stores;
  };

  factory.get = function (id) {
    return stores.then(function(stores){
      for (var i = 0; i < stores.length; i++) {
        if (stores[i].id == id) return stores[i];
      }
      return null;
    })
  };

  factory.getBrand = function (id) {
    return brands.then(function(brands){
      for (var i = 0; i < brands.length; i++) {
        if (brands[i].id == id) return brands[i];
      }
      return null;
    })
  };

  factory.getLength = function(){
    return stores.then(function(stores){
      return stores.length;
    })
  };

  //get a list of item in a page
  factory.getPage = function(pageNo){
    var results = [];
    var LISTCHUNKSIZE = 12; // items per page

    return stores.then(function(stores){
      for(var i=0;i<LISTCHUNKSIZE;i++){
        var res = stores[(pageNo-1)*LISTCHUNKSIZE+i];
        if(res){
          results.push(res);
        }
      }
      return results;  
    });
  }

  return factory;
}]);