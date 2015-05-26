//Customer-Brand
app.controller('CustomerCountCtrl', ['$scope', 'Customers', 'Sites', '$stateParams', 
  function($scope, Customers, Sites, $stateParams) {  

    $scope.init = function() {
      $scope.stat = {};
      $scope.customers = [];
      
      Customers.getCount(function(resp) {
        $scope.stat.totalBrand = resp.count;
      });

      var startDt = new Date(), endDt = startDt;

      Customers.getIncrCount({startDate: startDt.toLocaleDateString(),
        endDate: endDt.toLocaleDateString()}, 
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

      Customers.getPageData({},
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

      Customers.getPageData({},
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

app.controller('CustomerNewCtrl', ['$scope', '$state', 'Customers', function($scope,$state, Customers) {
  $scope.brand = {};

  $scope.industrylist = [
    "奢侈品","酒店/宾馆","餐饮","服装业", "服务","美容","媒体","零售","设计","银行","金融","因特网","咨询","其它"
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
      if(customer){
        $state.go('customers.brand.detail',{brandId:customer._id});
      }
    });
  };

}]);

app.controller('CustomerEditCtrl', ['$scope', '$state', 'Customers', '$stateParams', function($scope, $state, Customers,$stateParams) {
  
  Customers.get({'customerId':$stateParams.brandId},
    function(res) {
      $scope.brand = res;
    });

  $scope.industrylist = [
    "奢侈品","酒店/宾馆","餐饮","服装业", "服务","美容","媒体","零售","设计","银行","金融","因特网","咨询","其它"
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
      //alert('edit customer success');
      $state.go('customers.brand.detail',{brandId:customer._id});
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
}]); 

//STORES-Sites
app.controller('StoreNewCtrl', ['$scope', 'Customers', 'Sites', 'CustomerSites', '$stateParams', '$state',
  function($scope, Customers, Sites, CustomerSites, $stateParams,$state) {

  Customers.get({'customerId':$stateParams.brandId},
    function(res) {
      $scope.brand = res;
      $scope.contacts = $scope.brand.contacts;
    });

  $scope.createStore = function(){
    var newStore = {
      customerId: $scope.brand._id,
      siteName: $scope.store.sitename,
      reference: $scope.store.reference,
      // businesscenter: $scope.store.businesscenter,
      // manager: $scope.store.contact,
      // address: $scope.store.address,
      // country: $scope.store.country,
      // province: $scope.store.province,
      // city: $scope.store.city,
      // zipcode: $scope.store.zipcode,
      // latitude: $scope.store.latitude,
      // longitude: $scope.store.longitude,
      description: $scope.store.description
    };

    var store = new CustomerSites(newStore);
    store.$save({'customerId':  $stateParams.brandId}, function(site) {
      //alert('add site success');
      $state.go('customers.store.detail',{brandId:$stateParams.brandId,storeId:site._id});
    });
  };

}]);

app.controller('StoreEditCtrl', ['$scope', 'Customers', 'Sites', '$stateParams', '$state',
  function($scope, Customers, Sites, $stateParams,$state) {

  Customers.get({'customerId':$stateParams.brandId},
    function(res) {
      $scope.brand = res;
      $scope.contacts = $scope.brand.contacts;
    });

  Sites.get({'siteId':$stateParams.storeId},
    function(res) {
      $scope.store = res;
    });

  $scope.saveStore = function(){
    var updatedStore = {
      _id:$scope.store._id,
      customerId: $scope.brand._id,
      siteName: $scope.store.siteName,
      reference: $scope.store.reference,
      // businesscenter: $scope.store.businesscenter,
      // manager: $scope.store.contact,
      // address: $scope.store.address,
      // country: $scope.store.country,
      // province: $scope.store.province,
      // city: $scope.store.city,
      // zipcode: $scope.store.zipcode,
      // latitude: $scope.store.latitude,
      // longitude: $scope.store.longitude,
      description: $scope.store.description
    };

    var store = new Sites(updatedStore);
    store.$update(function(site) {
      //alert('add site success');
      $state.go('customers.store.detail',{brandId:$stateParams.brandId,storeId:$stateParams.storeId});
    });
  };

}]);


app.controller('StoreListCtrl', ['$scope', 'Customers', 'Sites', 'CustomerSites', '$stateParams', function($scope, Customers, Sites, CustomerSites, $stateParams) {
    
    //TBD: add sort
    $scope.init = function(){
      $scope.maxSize = 5; //total buttons displayed
      $scope.bigCurrentPage = 1;  //current page
      $scope.datasource = [];
      $scope.pageItems = 12;

      Customers.get({'customerId':$stateParams.brandId},
      function(res) {
        $scope.brand = res;
      });

      // CustomerSites.getPageData({'customerId':$stateParams.brandId},
      //   function(res) {
      //     $scope.bigTotalItems = res.count;
      //     $scope.datasource = res;
      //   });

      $scope.pageChanged();
    };

    $scope.setPage = function (pageNo) {
      $scope.bigCurrentPage = pageNo;
    };

    $scope.pageChanged = function() {

      CustomerSites.getPageData({'customerId':$stateParams.brandId},
        function(res) {
          $scope.bigTotalItems = res.count;
          $scope.datasource = res.data;
        });
    };

  }]);


app.controller('StoreDetailCtrl', ['$scope', 'Customers', 'Sites', '$stateParams', function($scope, Customers, Sites, $stateParams) {
  Sites.get({'siteId':$stateParams.storeId},
    function(res) {
      $scope.store = res;
    });

  Customers.get({'customerId':$stateParams.brandId},
      function(res) {
        $scope.brand = res;
      });

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


//Contacts
app.controller('ContactNewCtrl', ['$scope', 'Customers', '$stateParams', '$state', function($scope, Customers, $stateParams, $state) {
  
  $scope.contact = {};

  Customers.get({'customerId':$stateParams.brandId},
    function(res) {
      $scope.brand = res;
    });

  $scope.createContact = function(){

    var newContact = {
      name: $scope.contact.name,
      gender: $scope.contact.gender,
      birthday: $scope.contact.birthday !=null ? $scope.contact.birthday.getTime():"",
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
      //alert('Add contact success');
      $state.go('customers.brand.detail',{brandId:customer._id});
    });
  };


}]);

app.controller('ContactEditCtrl', ['$scope', 'Customers', '$stateParams', '$state', function($scope, Customers, $stateParams, $state) {
  
  $scope.brand = $stateParams.brandContent;
  getContact = function(){
    for(var i=0;i<$scope.brand.contacts.length;i++){
      if($scope.brand.contacts[i]._id===$stateParams.contactId)
        return $scope.brand.contacts[i];
    }
  };

  $scope.contact = getContact();

  $scope.saveContact = function(){
    var customerUpdated = $scope.brand;

    var customer = new Customers(customerUpdated);
    customer.$update(function(customer) {
      //alert('edit customer success');
      $state.go('customers.contact.detail',{contactId:$stateParams.contactId,brandContent:customer});
    });
  };

}]);

app.controller('ContactListCtrl', ['$scope', 'Customers', '$stateParams', function($scope, Customers, $stateParams) {

    //for footer controller
    $scope.brandId = $stateParams.brandId;

    $scope.init = function(){
      $scope.maxSize = 5; //total buttons displayed
      $scope.bigCurrentPage = 1;  //current page
      $scope.datasource = [];
      $scope.pageItems = 12;


      Customers.get({'customerId':$stateParams.brandId},
        function(res) {
          $scope.brand = res;
          $scope.bigTotalItems = $scope.brand.contacts.length;
          $scope.datasource = $scope.brand.contacts.slice(($scope.bigCurrentPage-1)*$scope.pageItems,($scope.bigTotalItems-($scope.bigCurrentPage-1)*$scope.pageItems)/$scope.pageItems>1?$scope.pageItems:$scope.bigTotalItems);

          $scope.pageChanged();
        });      
    };

    $scope.setPage = function (pageNo) {
      $scope.bigCurrentPage = pageNo;
    };

    $scope.pageChanged = function() {
      $scope.datasource = $scope.brand.contacts.slice(
          ($scope.bigCurrentPage-1)*$scope.pageItems,
          ($scope.bigTotalItems-($scope.bigCurrentPage-1)*$scope.pageItems)/$scope.pageItems>1?$scope.pageItems:$scope.bigTotalItems);
    };

  }])
;

app.controller('ContactDetailCtrl', ['$scope', 'Customers', '$stateParams', function($scope, Customers, $stateParams) {

  $scope.brand = $stateParams.brandContent;

  for(var arr = $scope.brand.contacts,i=0;i<arr.length;i++){
    if(arr[i]._id===$stateParams.contactId)
      $scope.contact = arr[i];
  }

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


//Jobs
app.controller('JobListCtrl', ['$scope', 'Jobs', '$stateParams', function($scope, Jobs, $stateParams) {
    
    //TBD: add sort functionalities

    $scope.init = function(){
      $scope.maxSize = 5; //total buttons displayed
      $scope.bigCurrentPage = 1;  //current page
      $scope.datasource = [];

      // Jobs.get({},
      //   function(res) {
      //     $scope.datasource = res;

      //     $scope.pageChanged();
      //   });

      $scope.pageChanged();
    };

    $scope.setPage = function (pageNo) {
      $scope.bigCurrentPage = pageNo;
    };
    $scope.pageChanged = function() {

      Jobs.get(function(res) {
          $scope.datasource = res;
        });

    };

  }]);

app.controller('SetJobDateRangeModalCtrl', ['$scope', '$modal', '$log', function($scope, $modal, $log) {
    $scope.items = ['item1', 'item2', 'item3'];
    $scope.open = function (size) {
      var modalInstance = $modal.open({
        templateUrl: 'setJobDateRangeModal',
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
