// A RESTful factory for retreiving playlists from 'playlists_ok.json'
app.factory('playlists', ['$http', function ($http) {

  var path = 'api/playlists_ok.json';
  var playlists = $http.get(path).then(function (resp) {
    return resp.data;
  });

  var pathBrands = 'api/brands.json';
  var brands = $http.get(pathBrands).then(function (resp) {
    return resp.data;
  });

  var pathStore = 'api/stores.json';
  var stores = $http.get(pathStore).then(function (resp) {
    return resp.data;
  });


  var factory = {};

  factory.all = function () {
    return playlists;
  };

  factory.allBrands = function () {
    return brands.then(function(brands){
      return brands.map(function(e){
        return {
          "id": e.id,
          "brandName": e.brandName,
          "industry": e.industry,
          "logopicture": e.logopicture
        };
      });
    });
  };

  factory.allStores = function (brandId) {
    return stores.then(function(stores){
      return stores.filter(function(e){
        return e.brandId == brandId;
      }).map(function(e){
        return {
          "id": e.id,
          "storeName":e.storeName,
          "storeRef": e.storeRef,
          "associatedPlaylistId": e.associatedPlaylistId
        };
      });
    });
  };

  factory.get = function (id) {
    return playlists.then(function(playlists){
      for (var i = 0; i < playlists.length; i++) {
        if (playlists[i].id == id) return playlists[i];
      }
      return null;
    })
  };

  factory.getLength = function(){
    return playlists.then(function(playlists){
      return {'total':playlists.length,'active':playlists.filter(function(e){return e.linkState;}).length,'inactive':playlists.filter(function(e){return !(e.linkState);}).length};
    })
  };

  factory.getPage = function(pageNo,status){
    var results = [];
    var LISTCHUNKSIZE = 12; // items per page

    return playlists.then(function(playlists){
      var filteredPlaylists = playlists.filter(function(e){
          if(status=='active')
            return e.linkState;
          else if(status=='inactive')
            return !(e.linkState);
          else
            return true;
        });

      for(var i=0;i<LISTCHUNKSIZE;i++){
        var res = filteredPlaylists[(pageNo-1)*LISTCHUNKSIZE+i];
        if(res){
          results.push(res);
        }
      }
      return results;
    });
  };

  return factory;
}]);