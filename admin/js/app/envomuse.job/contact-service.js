// A RESTful factory for retreiving contacts from 'contact.json'
app.factory('contacts', ['$http', function ($http) {

  var path = 'api/contacts.json';
  var contacts = $http.get(path).then(function (resp) {
    return resp.data;
  });

  var factory = {};

  factory.all = function () {
    return contacts;
  };

  factory.get = function (id) {
    return contacts.then(function(contacts){
      for (var i = 0; i < contacts.length; i++) {
        if (contacts[i].id == id) return contacts[i];
      }
      return null;
    })
  };

  factory.getLength = function(){
    return contacts.then(function(contacts){
      return contacts.length;
    })
  };

  //get a list of item in a page
  factory.getPage = function(pageNo){
    var results = [];
    var LISTCHUNKSIZE = 12; // items per page

    return contacts.then(function(contacts){
      for(var i=0;i<LISTCHUNKSIZE;i++){
        var res = contacts[(pageNo-1)*LISTCHUNKSIZE+i];
        if(res){
          results.push(res);
        }
      }
      return results;  
    });
  }

  return factory;
}]);