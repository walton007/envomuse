app.controller('StoreListCtrl', ['$scope', 'stores', '$stateParams', function($scope, stores, $stateParams) {
    
    //TBD: add sort functionalities

    $scope.init = function(){
      $scope.maxSize = 10; //total buttons displayed
      $scope.bigCurrentPage = 1;  //current page
      $scope.datasource = [];

      stores.getLength().then(function(res){
        $scope.bigTotalItems = res;
      });

      $scope.pageChanged();
    };

    $scope.setPage = function (pageNo) {
      $scope.bigCurrentPage = pageNo;
    };
    $scope.pageChanged = function() {

      stores.getPage($scope.bigCurrentPage).then(function(res){
        $scope.datasource = res;
        $scope.brandName = res[0].brandName;
      });
    };
  }])
;

app.controller('StoreDetailCtrl', ['$scope', 'stores', '$stateParams', function($scope, stores, $stateParams) {
  stores.get($stateParams.storeId).then(function(store){
    $scope.store = store;
  })
}]);