app.controller('ContactListCtrl', ['$scope', 'contacts', '$stateParams', function($scope, contacts, $stateParams) {
    
    //TBD: add sort functionalities
    $scope.brandId = $stateParams.brandId;
    $scope.brandName = 'HERMES_DEMO';

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

app.controller('ContactNewCtrl', ['$scope', 'contacts', '$stateParams', function($scope, contacts, $stateParams) {
  /*
  contacts.getBrand($stateParams.brandId).then(function(brand){
    $scope.brand = brand;
  })
*/

  $scope.brandId = $stateParams.brandId;
  $scope.storeId = $stateParams.storeId;

}]);

app.controller('ContactEditCtrl', ['$scope', 'contacts', '$stateParams', function($scope, contacts, $stateParams) {
  contacts.get($stateParams.storeId).then(function(store){
    $scope.store = store;
  })

}]);

app.controller('ContactDeleteModalCtrl', ['$scope', '$modal', '$log', function($scope, $modal, $log) {
    $scope.items = ['item1', 'item2', 'item3'];
    $scope.open = function (size,id) {
      var modalInstance = $modal.open({
        templateUrl: 'deleteContactConfirmModal',
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