// A RESTful factory for retreiving jobs from 'program.json'
app.factory('jobs', ['$http', function ($http) {

  var rpath = 'api/rules-box.json';
  var rules = $http.get(rpath).then(function (resp) {
    return resp.data;
  });


  var factory = {};

  factory.boxlist = function (id) {
    return rules.then(
      function(rules){
        for (var i = 0; i < rules.length; i++) {
        if (rules[i].rId == id) return rules[i];
      }
    });
  };

  return factory;
}]);