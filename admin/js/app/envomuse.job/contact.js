app.controller('ContactListCtrl', ['$scope', 'contacts', '$stateParams', function($scope, contacts, $stateParams) {
    
    //TBD: add sort functionalities

    $scope.init = function(){
      $scope.maxSize = 5; //total buttons displayed
      $scope.bigCurrentPage = 1;  //current page
      $scope.datasource = [];

      contacts.getLength().then(function(res){
        $scope.bigTotalItems = res;
      });

      $scope.pageChanged();
    };

    $scope.setPage = function (pageNo) {
      $scope.bigCurrentPage = pageNo;
    };
    $scope.pageChanged = function() {

      contacts.getPage($scope.bigCurrentPage).then(function(res){
        $scope.datasource = res;
      });
    };
  }])
;

app.controller('ContactDetailCtrl', ['$scope', 'contacts', '$stateParams', function($scope, contacts, $stateParams) {
  contacts.get($stateParams.contactId).then(function(contact){
    $scope.contact = contact;
  })
}]);