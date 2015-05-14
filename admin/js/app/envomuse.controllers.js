app.controller('CustomerCountCtrl', ['$scope', 'Customers', 'Sites', '$stateParams', 
  function($scope, Customers, Sites, $stateParams) {  

    $scope.init = function() {
      $scope.stat = {};
      $scope.customers = [];
      
      Customers.getCount(function(resp) {
        $scope.stat.totalBrand = resp.count;
      });

      var startDt = new Date(), endDt = startDt;

      Customers.getIncrCount({startDate: startDt.getTime(),
        endDate: endDt.getTime()}, 
        function(resp) {
          $scope.stat.newBrand = resp.count;
      });

      Sites.siteStats(function(resp){
        $scope.stat.newSite = resp.activeStore;
        $scope.stat.totalSite = resp.totalStore;
      });
  };
}]);


app.controller('CustomerListCtrl', ['$scope', 'Customers', '$stateParams', 
  function($scope, Customers, $stateParams) {
    
    //TBD: add sort
    $scope.init = function(){
      $scope.maxSize = 5; //total buttons displayed
      $scope.bigCurrentPage = 1;  //current page
      $scope.datasource = [];
      $scope.pageItems = 12;

      Customers.getPageData({'offset':0, 'size':$scope.pageItems, 'type': $stateParams.listState},
        function(res) {
          $scope.bigTotalItems = res.count;
          $scope.datasource = res.data;
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

      Customers.getPageData({'offset':($scope.bigCurrentPage-1)*$scope.pageItems, 'size':$scope.pageItems, 'type': $stateParams.listState},
        function(res) {
          //$scope.bigTotalItems = res.count;
          $scope.datasource = res.data;
        });
    };

  }]);

app.controller('CustomerDetailCtrl', ['$scope', 'Customers', '$stateParams', function($scope, Customers, $stateParams) {
  Customers.get({'customerId':$stateParams.brandId},
    function(res) {
      $scope.brand = res;
    });
}]);

app.controller('CustomerNewCtrl', ['$scope', 'Customers', function($scope, Customers) {
  $scope.brand = {};

  $scope.industrylist = [
    "保险业","采矿","能源","餐饮","宾馆","电讯业","房地产","服务","服装业","公益组织","广告业","航空航天","化学","健康","保健","建筑业","教育","培训","计算机","金属冶炼","警察","消防","军人","会计","美容","媒体","出版","木材","造纸","零售","批发","农业","旅游业","司法","律师","司机","体育运动","学术研究","演艺","医疗服务","艺术","设计","银行","金融","因特网","音乐舞蹈","邮政快递","运输业","政府机关","机械制造","咨询","其它"
  ];
  $scope.statuslist = [
    "目标客户","初步接触","DEMO展示","PILOT试用","现有","合同已终止","其它"
  ];
  $scope.updateperiodlist = [
    "每周更新","每月更新","每季度更新","半年更新","其它"
  ];

  $scope.createBrand = function(){

    var newCustomer = {
      brand: $scope.brand.name,
      logoData: $scope.myCroppedImage,
      industry: $scope.brand.industry,
      status: $scope.brand.status,
      updatePeriod: $scope.brand.updatePeriod,
      crmInfo: {
        contractDate: $scope.brand.contractdate.getTime()
      },
      designFee: $scope.brand.designFee,
      setupFee: $scope.brand.setupFee,
      monthServiceFee: $scope.brand.monthServiceFee,
      otherFee: $scope.brand.otherFee,
      description: $scope.brand.description
    };

    var customer = new Customers(newCustomer);
    customer.$save(function(customer) {
      alert('create customer success');
      /*if(customer){
        $rootScope.$on('$stateChangeStart', 
          function(event, toState, toParams, fromState, fromParams){
            event.preventDefault();
            $state.
        })
      }*/
    });
  };

}]);

app.controller('CustomerEditCtrl', ['$scope', '$state', 'Customers', '$stateParams', function($scope, $state, Customers,$stateParams) {
  
  Customers.get({'customerId':$stateParams.brandId},
    function(res) {
      $scope.brand = res;
    });

  $scope.industrylist = [
    "保险业","采矿","能源","餐饮","宾馆","电讯业","房地产","服务","服装业","公益组织","广告业","航空航天","化学","健康","保健","建筑业","教育","培训","计算机","金属冶炼","警察","消防","军人","会计","美容","媒体","出版","木材","造纸","零售","批发","农业","旅游业","司法","律师","司机","体育运动","学术研究","演艺","医疗服务","艺术","设计","银行","金融","因特网","音乐舞蹈","邮政快递","运输业","政府机关","机械制造","咨询","其它"
  ];
  $scope.statuslist = [
    "目标客户","初步接触","DEMO展示","PILOT试用","现有","合同已终止","其它"
  ];
  $scope.updateperiodlist = [
    "每周更新","每月更新","每季度更新","半年更新","其它"
  ];

  $scope.saveBrand = function(){
    var customerUpdated = {
      _id: $scope.brand._id,
      brand: $scope.brand.name,
      industry: $scope.brand.industry,
      status: $scope.brand.status,
      updatePeriod: $scope.brand.updateperiod,
      crmInfo: {
        contractDate: $scope.brand.crmInfo.contractDate
      },
      designFee: $scope.brand.designFee,
      setupFee: $scope.brand.setupFee,
      monthServiceFee: $scope.brand.monthServiceFee,
      otherFee: $scope.brand.otherFee,
      description: $scope.brand.description
    };

    var customer = new Customers(customerUpdated);
    customer.$update(function(customer) {
      alert('edit customer success');
    });
  };

}]);

app.controller('CustomerDeleteModalCtrl', ['$scope', '$modal', '$log', function($scope, $modal, $log) {
    $scope.items = ['item1', 'item2', 'item3'];

    $scope.open = function (size,id) {
      var modalInstance = $modal.open({
        templateUrl: 'deleteCustomerConfirmModal',
        controller: 'ModalInstanceCtrl',
        size: size,
        resolve: {
          items: function () {
            return $scope.items;
          },
          customerId: function (){
            return id;
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


//STORES
app.controller('StoreNewCtrl', ['$scope', 'Customers', 'Sites', '$stateParams', function($scope, Customers, Sites, $stateParams) {

  Customers.get({'customerId':$stateParams.brandId},
    function(res) {
      $scope.brand = res;
    });



}]);

//CONTACTS
app.controller('ContactNewCtrl', ['$scope', 'Customers', '$stateParams', function($scope, Customers, $stateParams) {
  
  $scope.contact = {};

  Customers.get({'customerId':$stateParams.brandId},
    function(res) {
      $scope.brand = res;
    });

  $scope.createContact = function(){

    var newContact = {
      name: $scope.contact.name,
      gender: $scope.contact.gender,
      birthday: $scope.contact.birthday.getTime(),
      workmobile: $scope.contact.workmobile,
      privatemobile: $scope.contact.privatemobile,
      email: $scope.contact.email,
      weixin: $scope.contact.wechat,
      qq: $scope.contact.qq,
      title: $scope.contact.title,
      department: $scope.contact.department
    };

    $scope.brand.contacts.push(newContact);

    $scope.brand.$update(function(customer) {
      alert('Add contact success');
    });
  };


}]);