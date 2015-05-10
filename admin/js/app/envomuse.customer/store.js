app.controller('StoreListCtrl', ['$scope', 'stores', '$stateParams', function($scope, stores, $stateParams) {
    
    //TBD: add sort functionalities
    $scope.brandId = $stateParams.brandId;

    $scope.init = function(){
      $scope.maxSize = 7; //total buttons displayed
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

app.controller('StoreNewCtrl', ['$scope', 'stores', '$stateParams', function($scope, stores, $stateParams) {
  stores.getBrand($stateParams.brandId).then(function(brand){
    $scope.brand = brand;
  })

}]);

app.controller('StoreEditCtrl', ['$scope', 'stores', '$stateParams', function($scope, stores, $stateParams) {
  stores.get($stateParams.storeId).then(function(store){
    $scope.store = store;
  })

}]);

app.controller('StoreDeleteModalCtrl', ['$scope', '$modal', '$log', function($scope, $modal, $log) {
    $scope.items = ['item1', 'item2', 'item3'];
    $scope.open = function (size,id) {
      var modalInstance = $modal.open({
        templateUrl: 'deleteStoreConfirmModal',
        controller: 'ModalInstanceCtrl',
        size: size,
        resolve: {
          items: function () {
            return $scope.items;
          }
        }
      });

      modalInstance.result.then(function (selectedItem) {
        $scope.selected = selectedItem;
      }, function () {
        $log.info('Modal dismissed at: ' + new Date());
      });
    };
  }])
  ; 