// this is a lazy load controller, 
// so start with "app." to register this controller

app.filter('propsFilter', function() {
    return function(items, props) {
        var out = [];

        if (angular.isArray(items)) {
          items.forEach(function(item) {
            var itemMatches = false;

            var keys = Object.keys(props);
            for (var i = 0; i < keys.length; i++) {
              var prop = keys[i];
              var text = props[prop].toLowerCase();
              if (item[prop].toString().toLowerCase().indexOf(text) !== -1) {
                itemMatches = true;
                break;
              }
            }

            if (itemMatches) {
              out.push(item);
            }
          });
        } else {
          // Let the output be the input untouched
          out = items;
        }

        return out;
    };
})

app.controller('SelectCtrl', ['$scope', 'Jobs', function($scope, Jobs ) {
    
    Jobs.get(function(res) {
      $scope.jobs = res;
    });

    $scope.disabled = undefined;
    $scope.searchEnabled = undefined;

    $scope.enable = function() {
    $scope.disabled = false;
    };

    $scope.disable = function() {
    $scope.disabled = true;
    };

    $scope.enableSearch = function() {
    $scope.searchEnabled = true;
    }

    $scope.disableSearch = function() {
    $scope.searchEnabled = false;
    }

    $scope.clear = function() {
    $scope.job.selected = undefined;
    };

    $scope.counter = 0;
    $scope.someFunction = function (item, model){
    $scope.counter++;
    $scope.eventResult = {item: item, model: model};
    };

    $scope.removed = function (item, model) {
    $scope.lastRemoved = {
        item: item,
        model: model
      };
    };

    $scope.generate = function(item){
      var params = {
        jobName:program.jobSelected,
        dateRange:program.dateRange,
        comment:program.comment
        /*startDate:item.programStartDate.toLocaleDateString(),
        endDate:item.programEndDate.toLocaleDateString(),
        name:item.targetProgramName*/
      };

      // console.log($scope.job.selected);
      // console.log(params);
    };

}]);