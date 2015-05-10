app.controller('XCtrl', ['$scope', 'jobs', '$stateParams', '$filter', '$http', 'editableOptions', 'editableThemes', 
  function($scope, jobs, $stateParams, $filter, $http, editableOptions, editableThemes){
  
    editableThemes.bs3.inputClass = 'input-sm';
    editableThemes.bs3.buttonsClass = 'btn-sm';
    editableOptions.theme = 'bs3';

    $scope.init = function(){

     jobs.boxlist($stateParams.ruleId).then(function(res){
       $scope.blist = res.boxes;
       $scope.dType = res.calcType;
      });
   }

    $scope.dInfo = {
      dob: new Date(2015, 4, 15)
    };


  $scope.showBoxes = function() {
    var selected = $filter('filter')($scope.blist, {bId: $scope.cell.rId});
    return ($scope.user.status && selected.length) ? selected[0].text : 'Not set';
  };

}]);