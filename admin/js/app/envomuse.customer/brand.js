app.controller('BrandListCtrl', ['$scope', 'brands', '$stateParams', function($scope, brands, $stateParams) {
    
    //TBD: add sort functionalities

    $scope.init = function(){
      $scope.maxSize = 5; //total buttons displayed
      $scope.bigCurrentPage = 1;  //current page
      $scope.datasource = [];

      brands.getLength().then(function(res){
        $scope.bigTotalItems = res;
      });

      $scope.pageChanged();
    };

    $scope.setPage = function (pageNo) {
      $scope.bigCurrentPage = pageNo;
    };
    $scope.pageChanged = function() {

      switch($stateParams.listState){
        case 'new':$scope.listState = '本年新增';break;
        case 'all':
        default:$scope.listState = '全部客户';
          break;
      }

      brands.getPage($scope.bigCurrentPage).then(function(res){
        $scope.datasource = res;
      });
    };
  }])
;

app.controller('BrandDetailCtrl', ['$scope', 'brands', '$stateParams', function($scope, brands, $stateParams) {
  brands.get($stateParams.brandId).then(function(brand){
    $scope.brand = brand;
  })
}]);

app.controller('BrandNewCtrl', ['$scope', 'brands', function($scope,brands) {
  $scope.brand = {
    name: '',
    industry: '',
    status: '',
    updateperiod: '',
    contact: '',
    contractdate: '',
    discount: '',
    unitprice: '',
    firstcontactdate: '',
    salesperson: '',
    descripton: ''
  }

  $scope.industrylist = [
    {name: 'Luxury'},
    {name: 'Restaurant'},
    {name: 'Automobile'},
    {name: 'Bank'},
    {name: 'Bookstore'},
    {name: 'Supermarket'},
    {name: 'Retail'}
  ];

  $scope.statuslist = [
    {name: 'first contact'},
    {name: 'demo'},
    {name: 'test'},
    {name: 'contract'}
  ];

  $scope.updateperiodlist = [
    {name: 'weekly'},
    {name: 'weekly'},
    {name: 'quaterly'},
    {name: '6 months'},
    {name: 'yearly'}
  ];

  brands.allContacts().then(function(res){
    $scope.contactlist = res;
  });

  $scope.salespersonlist = [
    {name: 'BD_A'},
    {name: 'BD_B'},
    {name: 'BD_C'},
    {name: 'BD_D'},
    {name: 'BD_E'}
  ];

  $scope.createBrand = function(){
    var newBrand = {
    name: $scope.brand.name,
    industry: $scope.brand.industry,
    status: $scope.brand.status,
    updateperiod: $scope.brand.updateperiod,
    contact: $scope.brand.contact,
    contractdate: $scope.brand.contractdate,
    discount: $scope.brand.discount,
    unitprice: $scope.brand.unitprice,
    firstcontactdate: $scope.brand.firstcontactdate,
    salesperson: $scope.brand.salesperson,
    descripton: $scope.brand.descripton
    };

    console.log(newBrand);


    //brands.createNew(newBrand)
  };

}]);

app.controller('BrandEditCtrl', ['$scope', 'brands', '$stateParams', function($scope,brands,$stateParams) {
  brands.get($stateParams.brandId).then(function(brand){
    $scope.brand = brand;
  })

  $scope.industrylist = [
    {name: 'Luxury'},
    {name: 'Restaurant'},
    {name: 'Automobile'},
    {name: 'Bank'},
    {name: 'Bookstore'},
    {name: 'Supermarket'},
    {name: 'Retail'}
  ];

  $scope.statuslist = [
    {name: 'first contact'},
    {name: 'demo'},
    {name: 'test'},
    {name: 'contract'}
  ];

  $scope.updateperiodlist = [
    {name: 'weekly'},
    {name: 'weekly'},
    {name: 'quaterly'},
    {name: '6 months'},
    {name: 'yearly'}
  ];

  brands.allContacts().then(function(res){
    $scope.contactlist = res;
  });

  $scope.salespersonlist = [
    {name: 'BD_A'},
    {name: 'BD_B'},
    {name: 'BD_C'},
    {name: 'BD_D'},
    {name: 'BD_E'}
  ];

  $scope.createBrand = function(){
    var newBrand = {
    name: $scope.brand.name,
    industry: $scope.brand.industry,
    status: $scope.brand.status,
    updateperiod: $scope.brand.updateperiod,
    contact: $scope.brand.contact,
    contractdate: $scope.brand.contractdate,
    discount: $scope.brand.discount,
    unitprice: $scope.brand.unitprice,
    firstcontactdate: $scope.brand.firstcontactdate,
    salesperson: $scope.brand.salesperson,
    descripton: $scope.brand.descripton
    };

    console.log(newBrand);
  };
}]);

app.controller('BrandDeleteModalCtrl', ['$scope', '$modal', '$log', function($scope, $modal, $log) {
    $scope.items = ['item1', 'item2', 'item3'];
    $scope.open = function (size,id) {
      var modalInstance = $modal.open({
        templateUrl: 'deleteCustomerConfirmModal',
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