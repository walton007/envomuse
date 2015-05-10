// A RESTful factory for retreiving jobs from 'program.json'
app.factory('jobs', ['$http', function ($http) {

  var path = 'api/jobs.json';
  var jobs = $http.get(path).then(function (resp) {
    return resp.data;
  });

/*
  var rpath = 'api/rules.json';
  var rules = $http.get(rpath).then(function (resp) {
    return resp.data;
  });
*/

  var factory = {};

  factory.all = function () {
    return jobs;
  };

  /*
  factory.allRules = function () {
    return rules;
  };

  factory.ruleslist = function () {
    return rules.then(
      function(rules){

        var tmp = rules.map(function(e){
          return e.rules;
        });

        return tmp.reduce(function(a,b){
          return a.concat(b);
        });
      })
  };
*/

  factory.get = function (id) {
    return jobs.then(function(jobs){
      for (var i = 0; i < jobs.length; i++) {
        if (jobs[i].id == id) return jobs[i];
      }
      return null;
    })
  };

/*
  factory.getRule = function (id) {
    return rules.then(function(rules){
      for (var i = 0; i < rules.length; i++) {
        if (rules[i].rgId == id) return rules[i];
      }
      return null;
    })
  };
*/

  factory.getLength = function(){
    return jobs.then(function(jobs){
      return {'total':jobs.length,'active':jobs.filter(function(e){return e.status;}).length,'inactive':jobs.filter(function(e){return !e.status;}).length};
    })
  };

  /*
  //get a list of item in a page
  factory.getPage = function(pageNo){
    var results = [];
    var LISTCHUNKSIZE = 12; // items per page

    return jobs.then(function(jobs){
      for(var i=0;i<LISTCHUNKSIZE;i++){
        var res = jobs[(pageNo-1)*LISTCHUNKSIZE+i];
        if(res){
          results.push(res);
        }
      }
      return results;
    });
  };
  */
  factory.getPage = function(pageNo,status){
    var results = [];
    var LISTCHUNKSIZE = 12; // items per page

    return jobs.then(function(jobs){
      var filteredJobs = jobs.filter(function(e){
          if(status=='active')
            return e.status;
          else if(status=='inactive')
            return !(e.status);
          else
            return true;
        });

      for(var i=0;i<LISTCHUNKSIZE;i++){
        var res = filteredJobs[(pageNo-1)*LISTCHUNKSIZE+i];
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