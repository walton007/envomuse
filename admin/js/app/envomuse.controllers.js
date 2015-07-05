//Customer-Brand
app.controller('DashboardCtrl', ['$scope', 'DashStats', 'ComingJobs', '$stateParams', 
  function($scope, DashStats, ComingJobs, $stateParams) {  

    $scope.load = function() {
      // $scope.stat = {};
      
      DashStats.get(function(res) {
        // console.log(res);
        $scope.stats = res.stats;
        $scope.siteDeliveryStats = res.siteDeliveryStats.delivered===0?0:100*res.siteDeliveryStats.delivered/(res.siteDeliveryStats.delivered+res.siteDeliveryStats.undelivered);
        $scope.customerStatus = res.customerStatus;

        $scope.dataCustomerStatus = [ 
          { label: "目标客户", data: res.customerStatus.目标客户 }, 
          { label: "样品测试", data: res.customerStatus.demo },
          { label: "签约客户", data: res.customerStatus.signed },
          { label: "合约终止", data: res.inactive }
        ];

        // console.log($scope.siteDeliveryStats);
      });

      ComingJobs.getCount(function(res){
        $scope.comingJobsStats = res;
      });

  };
}]);

app.controller('UserHomeCtrl', ['$scope', 'Customers', 'CustomerManager', '$stateParams', function($scope, Customers, CustomerManager, $stateParams) {

    $scope.d3 = [ 
      { label: "LICENSE未激活", data: 20 }, 
      { label: "待激活", data: 20 },
      { label: "在线", data: 40 },
      { label: "本地播放", data: 10 },
      { label: "离线", data: 10 }
    ];

}]);


//Customer-Brand
app.controller('CustomerCountCtrl', ['$scope', 'Customers', 'Sites', '$stateParams', 
  function($scope, Customers, Sites, $stateParams) {  

    $scope.init = function() {
      $scope.stat = {};
      $scope.customers = [];
      
      Customers.getCount(function(resp) {
        $scope.stat.totalCustomers = resp.count;
      });
  };
}]);

app.controller('CustomerListCtrl', ['$scope', 'Customers', '$stateParams', 
  function($scope, Customers, $stateParams) {

    $scope.maxSize = 5; //total buttons displayed
    $scope.bigCurrentPage = 1;  //current page
    $scope.datasource = [];
    $scope.pageItems = 12;
    $scope.bigTotalItems = 0;

    $scope.init = function(){
      $scope.pageChanged();
    };

    $scope.pageChanged = function() {

      Customers.getPageData({pageNumber:$scope.bigCurrentPage,pageSize:$scope.pageItems},
        function(res) {
          $scope.datasource = res.data;
          $scope.bigTotalItems = res.count;

          $scope.normalizedDataSource = $scope.datasource.map(function(e){
            return {
              _id:e._id,
              brand:e.brand,
              industry:e.industry,
              created:e.created,
              status:e.status,
              updatePeriod:e.updatePeriod,
              sitesCount:e.sitesCount!=null?e.sitesCount:0
            };
          });

        });
    };

  }]);


app.controller('ChannelsDashCtrl', ['$scope', 'CustomersBasic', '$stateParams', function($scope, CustomersBasic, $stateParams) {

  CustomersBasic.get(function(res){
    $scope.customerDataItems = res;
  });

  $scope.showChannel = function(id){
    $scope.channelId = id;
    $scope.partial = 'tpl/com.envomuse/channels_detail.html';
  };
}]);

app.controller('ChannelsDetailCtrl', ['$scope', 'ChannelsProgramList', '$stateParams', function($scope, ChannelsProgramList, $stateParams) {
  
  ChannelsProgramList.get(function(res){
    $scope.customerDataItems = res;
  });

  ChannelsProgramList.getPrograms({'channelId':$scope.channelId},
    function(res) {
      $scope.programs = res;
      console.log($scope.programs);
    });

}]);

app.controller('CustomerDetailCtrl', ['$scope', 'Customers', 'CustomerManager', 'CustomerChannels', '$stateParams', function($scope, Customers, CustomerManager, CustomerChannels, $stateParams) {

  $scope.init = function(){

    $scope.displayItemList = {
      "contact":false,
      "store":false,
      "channel":false,
      "addcontact":false,
      "editBrand":false,
      "addStore":false,
      "storeDetail":false,
      "editStore":false,
      "channel":false,
      "addchannel":false
    };

    if($stateParams.partial!=='store'){
      $scope.showItem($stateParams.partial,$stateParams.storeId);
    }
    else{
      $scope.showItem('store');
    }
  };

  $scope.showItem = function(item,params){

    for(var key in $scope.displayItemList){
       if($scope.displayItemList[key])
          $scope.previousItem = key;

       $scope.displayItemList[key] = false;
    }

    $scope.displayItemList[item] = true;

    if(item==='storeDetail')
      $scope.storeId = params;
      $scope.partial = $scope.getPartial();
  };

  $scope.hideMe = function(){
    // console.log($scope.previousItem);
    $scope.showItem($scope.previousItem);
  };

  $scope.getPartial = function () {
    if($scope.displayItemList.contact)
      return 'tpl/com.envomuse/customers_contact_list.html';
    else if($scope.displayItemList.addcontact)
      return 'tpl/com.envomuse/customers_contact_new.html';
    if($scope.displayItemList.store)
      return 'tpl/com.envomuse/customers_store_list.html';
    if($scope.displayItemList.addStore)
      return 'tpl/com.envomuse/customers_store_new.html';
    if($scope.displayItemList.storeDetail)
      return 'tpl/com.envomuse/customers_store_detail.html';
    if($scope.displayItemList.editBrand)
      return 'tpl/com.envomuse/customers_brand_edit.html';
    if($scope.displayItemList.editStore)
      return 'tpl/com.envomuse/customers_store_edit.html';
    if($scope.displayItemList.channel)
      return 'tpl/com.envomuse/customers_channel_list.html';
    if($scope.displayItemList.addchannel)
      return 'tpl/com.envomuse/customers_channel_new.html';
  }


  Customers.get({'customerId':$stateParams.brandId},
    function(res) {
      $scope.brand = res;
      $scope.leader = $scope.brand.contacts.filter(function(e){
        return e.isLeader;
      })[0];

      // console.log($scope.leader);
    });

  CustomerChannels.getChannels({'customerId':$stateParams.brandId},
    function(res) {
      $scope.channels = res;
    });

    //messaging
  $scope.alerts = [];
  $scope.closeAlert = function(index) {
    $scope.alerts.splice(index, 1);
  };


  $scope.editItem = function(item){
    $scope.itemToEdit = item;
    $scope.showSetManager = true;
  };

  //save customer to save contacts
  $scope.setManager = function(){
    $scope.showSetManager = false;

    CustomerManager.save({customerId:$scope.brand._id},function() {
      $scope.alerts.push({type: 'success', msg: '成功设置管理员，请将密码交给管理员！'});
    });

  };



}]);

app.controller('CustomerNewCtrl', ['$scope', '$rootScope', '$state', 'Customers', function($scope,$rootScope, $state, Customers) {
  $scope.brand = {};

  $scope.industrylist = [
    "奢侈品","时尚-服饰","美容美发","餐饮","零售","银行","酒店宾馆","汽车","航空","其它"
  ];
  $scope.statuslist = [
    {key:"prospect", value:"目标客户"},
    {key:"demo", value:"样品测试"},
    {key:"singed", value:"签约客户"},
    {key:"inactive", value:"合约终止"}
  ];
  $scope.updateperiodlist = [
    "每月更新","每2月更新","每季度更新","半年更新"
  ];

  $scope.createBrand = function(){

    var newCustomer = {
      brand: $scope.brand.name,
      companyName: $scope.brand.companyName,
      logo:   $rootScope.myCroppedImage,
      industry: $scope.brand.industry,
      status: $scope.brand.status,
      updatePeriod: $scope.brand.updatePeriod,
      crmInfo: {
        contractDate: ($scope.brand.contractStartDate!=null)?$scope.brand.contractStartDate.getTime():null,
        endContractDate: ($scope.brand.contractEndDate!=null)?$scope.brand.contractEndDate.getTime():null
      },
      designFee: $scope.brand.designFee,
      setupFee: $scope.brand.setupFee,
      monthServiceFee: $scope.brand.monthServiceFee,
      otherFee: $scope.brand.otherFee,
      otherFeeComment: $scope.brand.otherFeeComment,
      telephone:$scope.brand.telephone,
      fax:$scope.brand.fax,
      address:$scope.brand.address,
      description: $scope.brand.description
    };

    // console.log(newCustomer);

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

  //messaging
    $scope.alerts = [];
    $scope.closeAlert = function(index) {
        $scope.alerts.splice(index, 1);
      };

  $scope.industrylist = [
    "奢侈品","时尚-服饰","美容美发","餐饮","零售","银行","酒店宾馆","汽车","航空","其它"
  ];
  $scope.statuslist = [
    {key:"prospect", value:"目标客户"},
    {key:"demo", value:"样品测试"},
    {key:"singed", value:"签约客户"},
    {key:"inactive", value:"合约终止"}
  ];
  $scope.updateperiodlist = [
    "每月更新","每2月更新","每季度更新","半年更新"
  ];

  $scope.saveBrand = function(){
    var customerUpdated = {
      _id: $scope.brand._id,
      
      companyName: $scope.brand.companyName,
      crmInfo: {
        contractDate: ($scope.brand.contractDate!=null)?$scope.brand.contractDate.getTime():null,
        endContractDate: ($scope.brand.contractEndDate!=null)?$scope.brand.contractEndDate.getTime():null
      },
      designFee: $scope.brand.designFee,
      setupFee: $scope.brand.setupFee,
      monthServiceFee: $scope.brand.monthServiceFee,
      otherFee: $scope.brand.otherFee,
      otherFeeComment: $scope.brand.otherFeeComment,
      telephone:$scope.brand.telephone,
      fax:$scope.brand.fax,
      address:$scope.brand.address,
      description: $scope.brand.description
    };

    var customer = new Customers(customerUpdated);
    customer.$update(function(customer) {
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

  /*CustomerChannels.getChannels({'customerId':$stateParams.brandId},
    function(res) {
      $scope.channels = res;
    });
*/

  $scope.createStore = function(){
    var newStore = {
      customerId: $scope.brand._id,
      siteName: $scope.store.sitename,
      reference: $scope.store.reference,
      // channel:$scope.selectedChannel,
      // businesscenter: $scope.store.businesscenter,
      // manager: $scope.store.contact,
      address: $scope.store.address
      // country: $scope.store.country,
      // province: $scope.store.province,
      // city: $scope.store.city,
      // zipcode: $scope.store.zipcode,
      // latitude: $scope.store.latitude,
      // longitude: $scope.store.longitude,
      // description: $scope.store.description
    };

    var store = new CustomerSites(newStore);
    store.$save({'customerId':  $stateParams.brandId}, function(site) {
      //alert('add site success');
      $state.go('customers.brand.detail',{brandId:$scope.brand._id},{reload: true});
    });
  };

}]);

app.controller('StoreEditCtrl', ['$scope', 'Sites', 'CustomerChannels', '$stateParams', '$state',
  function($scope, Sites, CustomerChannels, $stateParams,$state) {

  Sites.get({'siteId':$scope.$parent.storeId},
    function(res) {
      $scope.store = res;
      // console.log($scope.store);

      CustomerChannels.getChannels({'customerId':$stateParams.brandId},
      function(res) {
        $scope.channels = res;
        // console.log($scope.channels);
        // console.log($scope.channels.map(function(x) {return x._id; }).indexOf($scope.store.channel));
        $scope.selectedChannel = $scope.channels[$scope.channels.map(function(x) {return x._id; }).indexOf($scope.store.channel)];
    });
  });  

  $scope.saveStore = function(){
    var updatedStore = {
      _id:$scope.store._id,
      customerId: $scope.brand._id,
      siteName: $scope.store.siteName,
      reference: $scope.store.reference,
      channel:$scope.selectedChannel._id,
      // businesscenter: $scope.store.businesscenter,
      // manager: $scope.store.contact,
      address: $scope.store.address
      // country: $scope.store.country,
      // province: $scope.store.province,
      // city: $scope.store.city,
      // zipcode: $scope.store.zipcode,
      // latitude: $scope.store.latitude,
      // longitude: $scope.store.longitude,
      //description: $scope.store.description
    };

    // console.log(updatedStore);

    var store = new Sites(updatedStore);
    store.$update(function(site) {
      // $state.go('customers.brand.detail',{brandId:$stateParams.brandId},{reload: true});
      $state.go('customers.brand.detail',{brandId:$scope.brand._id,partial:'storeDetail',storeId:$scope.store._id},{reload: true});
      // $scope.$parent.showItem('storeDetail',$scope.store._id);
    });
  };

}]);


app.controller('CustomerListCtrl', ['$scope', 'Customers', '$stateParams', 
  function($scope, Customers, $stateParams) {

    $scope.maxSize = 5; //total buttons displayed
    $scope.bigCurrentPage = 1;  //current page
    $scope.datasource = [];
    $scope.pageItems = 12;
    $scope.bigTotalItems = 0;

    $scope.init = function(){
      $scope.pageChanged();
    };

    $scope.pageChanged = function() {

      Customers.getPageData({pageNumber:$scope.bigCurrentPage,pageSize:$scope.pageItems},
        function(res) {
          $scope.datasource = res.data;
          $scope.bigTotalItems = res.count;

          $scope.normalizedDataSource = $scope.datasource.map(function(e){
            return {
              _id:e._id,
              brand:e.brand,
              industry:e.industry,
              created:e.created,
              status:e.status,
              updatePeriod:e.updatePeriod,
              sitesCount:e.sitesCount!=null?e.sitesCount:0
            };
          });

        });
    };

  }]);


app.controller('StoreListCtrl', ['$scope', 'CustomerSites', '$stateParams', 
  function($scope, CustomerSites, $stateParams) {
  
  $scope.maxSize = 5; //total buttons displayed
  $scope.bigCurrentPage = 1;  //current page
  $scope.datasource = [];
  $scope.pageItems = 50;
  $scope.bigTotalItems = 0;

  $scope.init = function(){
    $scope.pageChanged();
  };

  $scope.pageChanged = function() {

    CustomerSites.getPageData({'customerId':$stateParams.brandId,pageNumber:$scope.bigCurrentPage,pageSize:$scope.pageItems},
      function(res) {
      $scope.bigTotalItems = res.count;
      $scope.datasource = res.data;
      $scope.normalizedDataSource = $scope.datasource.map(function(e){
        return {
          _id:e._id,
          siteName:e.siteName,
          reference:e.reference,
          channelName:e.channelName,
          channelType:e.channelType==='normal'?'light':(e.channelType==='special'?'primary':'info'),
          deliverState:e.deliveryState==='deliveryYes'?'success':'light',
          playerStatus:e.playerStatus==='offline'?'danger':'success'
        };
      });
    });
  };
}]);


app.controller('StoreDetailCtrl', ['$scope', '$state', 'Customers', 'Sites', 'SiteLicense', '$stateParams', function($scope, $state, Customers, Sites, SiteLicense, $stateParams) {

  $scope.siteId = $scope.$parent.storeId;

  Sites.get({'siteId':$scope.siteId},
    function(res) {
      $scope.store = res;
    });

  //messaging
  $scope.alerts = [];
  $scope.closeAlert = function(index) {
    $scope.alerts.splice(index, 1);
  };

  Customers.get({'customerId':$stateParams.brandId},
    function(res) {
      $scope.brand = res;
    });

  $scope.setManager = function(chosenManager){

    var updatedStore = {
      _id:$scope.store._id,
      manager:$scope.chosenManager
    };

    var store = new Sites(updatedStore);
    store.$update(function(site) {
      showSetManager = false;
      $scope.alerts.push({type: 'success', msg: $scope.store.siteName + '修改成功！'});
      $state.go('customers.store.detail',{brandId:$stateParams.brandId,storeId:$stateParams.storeId},{reload: true});
    });
  };


  $scope.bindLicense = function(storeId){
    // console.log(storeId);
    SiteLicense.save({'siteId':storeId},function(res){
      // console.log(res);
    })
  };
  
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


//Channels
app.controller('ChannelNewCtrl', ['$scope', 'CustomerChannels', '$stateParams', '$state', function($scope, CustomerChannels,$stateParams, $state) {
  
  $scope.channel = {};

  $scope.createChannel = function(){

    var newChannel = {
      name: $scope.channel.name,
      type: 'normal'
    };

    CustomerChannels.saveChannel({customerId:$stateParams.brandId},newChannel,function() {
      $state.go('customers.brand.detail',{brandId:$stateParams.brandId},{reload: true});
    });
  };


}]);

app.controller('ChannelListCtrl', ['$scope', 'CustomerSites', 'CustomerChannels', 'ChannelsBindSite', '$stateParams', '$state', 
  function($scope, CustomerSites, CustomerChannels,ChannelsBindSite,$stateParams, $state) {
  
  $scope.init = function(){
    $scope.channel = {};
    $scope.checkedSites = [];
    $scope.formValid = false;
  };

  //get checked sites
  $scope.chooseSite = function(name) {
    var idx = $scope.checkedSites.indexOf(name);

    // is currently selected
    if (idx > -1) {
      $scope.checkedSites.splice(idx, 1);
    }
    // is newly selected
    else {
      $scope.checkedSites.push(name);
    }

    $scope.formValid = $scope.checkedSites.length>0;
  };

  CustomerChannels.getChannels({'customerId':$stateParams.brandId},
    function(res) {
      $scope.channels = res;
      // console.log($scope.channels);
    });

  $scope.showSites = function(id){
    $scope.showSiteList = true;
    $scope.channelId = id;
    
    CustomerSites.getPageData({'customerId':$stateParams.brandId},
      function(res) {
        $scope.sites = res.data;
    });
  };

  $scope.startBind = function(){
    console.log($scope.checkedSites);

    ChannelsBindSite.save({'channelId':$scope.channelId},{"sites":$scope.checkedSites},function() {
      $state.go('customers.brand.detail',{brandId:$stateParams.brandId},{reload: true});
    });
  };

}]);


//Contacts
app.controller('ContactNewCtrl', ['$scope', 'Customers', '$stateParams', '$state', 
  function($scope, Customers, $stateParams, $state) {
  
  $scope.contact = {};

  Customers.get({'customerId':$stateParams.brandId},
    function(res) {
      $scope.brand = res;
    });

  $scope.createContact = function(){

    var newContact = {
      name: $scope.contact.name,
      isLeader: $scope.contact.isLeader,
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

    switch($scope.brand.status){
      case "目标客户":$scope.brand.status='prospect';break;
      case "样品测试":$scope.brand.status='demo';break;
      case "签约客户":$scope.brand.status='signed';break;
      case "合约终止":$scope.brand.status='inactive';break;
    }

    $scope.brand.contacts.push(newContact);

    $scope.brand.$update(function(customer) {
      $state.go('customers.brand.detail',{brandId:$scope.brand._id,partial:'contact'},{reload: true});
    });
  };


}]);

/*app.controller('ContactEditCtrl', ['$scope', 'Customers', '$stateParams', '$state', function($scope, Customers, $stateParams, $state) {
  
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

}]);*/

app.controller('ContactListCtrl', ['$scope', 'Customers', '$stateParams', function($scope, Customers, $stateParams) {

  //for footer controller
  $scope.brandId = $stateParams.brandId;
  
  //messaging
  $scope.alerts = [];
  $scope.closeAlert = function(index) {
    $scope.alerts.splice(index, 1);
  };

  Customers.get({'customerId':$stateParams.brandId},
    function(res) {
      $scope.brand = res;
      $scope.datasource = $scope.brand.contacts;
    }); 

  $scope.editItem = function(item){
    item.editing = true;
    $scope.itemToEdit = item;
    $scope.showEdit = true;
  };

  //save customer to save contacts
  $scope.saveContact = function(){
    $scope.showEdit = false;

    var customerUpdated = {
      _id: $scope.brand._id,
      contacts:$scope.datasource
    };

    var customer = new Customers(customerUpdated);
    customer.$update(function(customer) {
      $scope.alerts.push({type: 'success', msg: $scope.itemToEdit.name + '修改成功！'});
      $state.go('customers.contact',{brandId:customer._id});
    });

  };


}]);

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
app.controller('JobsDashboardCtrl', ['$scope', 'Jobs', '$stateParams', function($scope, Jobs, $stateParams) {  

  Jobs.getCount(function(res){
    $scope.stat = res;
  });

}]);


app.controller('JobListCtrl', ['$scope', 'Jobs', '$stateParams', 
  function($scope, Jobs, $stateParams) {

  Jobs.get(function(res) {
        $scope.datasource = res;
      });

}]);


app.controller('JobDetailCtrl', ['$scope', 'JobById', '$stateParams', 
  function($scope, JobById, $stateParams) {  

  JobById.get({'jobId':$stateParams.jobId},
    function(res) {
      $scope.job = res;

      $scope.job.dateTemplates = $scope.job.dateTemplates.map(function(e){
        switch(e.periodInfo.calcType){
          case 'multipleDates':
            /*e.periodInfo.calcType="日期";
            e.periodInfo.dValues=e.timePeriods.multipleDatesValues.join(', ');*/
            break;
          case 'dateRange':
            // e.dateTemplates.periodInfo.calcType="日期范围";
            //e.timePeriods.dValues=e.timePeriods.dateRangeValues.startDate+'-->'+e.timePeriods.dateRangeValues.endDate;
            break;
          case 'daysOfWeek':
            e.periodInfo.calcType="周";
            e.periodInfo.values = [];

            for(var key in e.periodInfo.daysOfWeekValues){
              if(e.periodInfo.daysOfWeekValues[key])
                e.periodInfo.values.push(key);
            }

            break;
        };

        return e;
      });

      console.log($scope.job);

      /*$scope.job.programRule.playlists = $scope.job.programRule.playlists.filter(function(e){
      switch(e.timePeriods.calcType){
        case 'multipleDates':
          e.timePeriods.calcType="日期";
          e.timePeriods.dValues=e.timePeriods.multipleDatesValues.join(', ');
          break;
        case 'dateRange':
          e.timePeriods.calcType="日期范围";
          //e.timePeriods.dValues=e.timePeriods.dateRangeValues.startDate+'-->'+e.timePeriods.dateRangeValues.endDate;
          break;
        case 'daysOfWeek':
          e.timePeriods.calcType="周";
          e.timePeriods.dValues = e.timePeriods.daysOfWeekValues.join(', ');
          break;
      };*/

      //rules normalization
     /* e.dayRuleUnits = e.dayRuleUnits.map(function(d){
        for(var i=0;i<$scope.job.programRule.rules.length;i++){
          if(d.ruleName.toUpperCase()===$scope.job.programRule.rules[i].name.toUpperCase())
              return {
                _id:d._id,
                starthour:d.starthour,
                endhour:d.endhour,
                ruleName:d.ruleName,
                description:$scope.job.programRule.rules[i].description,
                boxes:$scope.job.programRule.rules[i].boxes
              };
        }
      });

      //boxes normalization
      for(var i=0;i<e.dayRuleUnits.length;i++){
        e.dayRuleUnits[i].boxes = e.dayRuleUnits[i].boxes.map(function(k){
          for(var j=0;j<$scope.job.programRule.boxes.length;j++){
            if(k.toUpperCase()===$scope.job.programRule.boxes[j].name.toUpperCase())
              return {
                _id:$scope.job.programRule.boxes[j]._id,
                name:$scope.job.programRule.boxes[j].name,
                description:$scope.job.programRule.boxes[j].description,
                songlist:$scope.job.programRule.boxes[j].songlist
              };
          }
        });
      }

      return e;
    });*/

        
    });

  
    $scope.startGenerate = function(item){
      var params = {
        startDate:item.programStartDate.toLocaleDateString(),
        endDate:item.programEndDate.toLocaleDateString(),
        name:item.targetProgramName
      };

      GenerateProgram.generate({'jobId':item._id},params,
        function(res){
          $state.go('jobs.detail',{jobId:item._id});
    });

      //console.log(params);
    };

 // console.log($scope.job);

}]);

/*app.controller('ProgramDetailCtrl', ['$scope', '$stateParams', function($scope, $stateParams) {  

  $scope.job = $stateParams.jobContent;
  $scope.program = $stateParams.programContent;

  //console.log($scope.program);

}]);*/

/*app.controller('RuleDetailCtrl', ['$scope', '$stateParams', function($scope, $stateParams) {  

  $scope.job = $stateParams.jobContent;
  $scope.program = $stateParams.programContent;
  $scope.rule = $stateParams.ruleContent;

  // console.log($scope.program);

}]);*/

app.controller('BoxDetailCtrl', ['$scope', 'BoxById', '$stateParams', function($scope,BoxById, $stateParams) {  

  BoxById.get({'jobId':$stateParams.jobId,'boxId':$stateParams.boxId},
    function(res) {
      $scope.box = res;
      // console.log($scope.box);
      });

  //console.log($scope.program);
  // console.log($scope.box);

}]);

/*
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
  ; */

//Tasks
/*app.controller('TasksDashboardCtrl', ['$scope', 'ComingJobs', '$stateParams', function($scope, ComingJobs, $stateParams) {  

  ComingJobs.getCount(function(res){
    $scope.stat = res;
    // console.log($scope.stat);
  });

}]);
*/
app.controller('ComingJobsCtrl', ['$scope', 'ComingJobs', 'ComingJobsImport', '$stateParams', 
  function($scope, ComingJobs, ComingJobsImport, $stateParams) {  

  $scope.jobs = [];

  ComingJobs.getList(function(res){
    $scope.comingJobs = res;
    console.log($scope.comingJobs);

    $scope.jobs = res.map(function(e){
        return {
          type:e.__t,
          _id:e._id,
          creator:e.meta.creator,
          customerName:e.meta.brand,
          // hash:e.hash,
          importStatus: (e.importStatus==='notImport')?'待导入':(e.importStatus==='importing'?'导入中...':'导入完成')
        };
      });

     $scope.count = $scope.jobs.length;

  });

  $scope.doImport = function(id){
    $scope.importInProgress = true;

    ComingJobsImport.import({'jobId':id},{},function(res){
      console.log(res);
    });
  };

}]);

//Programs - Playlists
app.controller('ProgramDashboardCtrl', ['$scope', 'Programs', '$stateParams', function($scope, Programs, $stateParams) {  

  Programs.getCount(function(res){
    $scope.stat = res;
  });

}]);

app.controller('PlaylistListCtrl', ['$scope', 'Programs', '$stateParams', function($scope, Programs, $stateParams) {
    
    Programs.allPrograms({},
        function(res) {
          $scope.datasource = res.filter(function(e){
            if($stateParams.linkState==='active')
              return e.inUse;
            else
              return !(e.inUse);
          });
        });

  }]);

/*app.controller('PlaylistDetailCtrl', ['$scope', 'ProgramById', '$stateParams', function($scope, ProgramById, $stateParams) {  

  // $scope.playlist = $stateParams.playlistContent;

  ProgramById.get({'programId':$stateParams.playlistId},
    function(res) {
      $scope.playlist = res;
      // console.log($scope.playlist);
    });
}]);*/

/*app.controller('PlaylistDetailCtrl', ['$scope', 'ProgramById', '$stateParams', function($scope, ProgramById, $stateParams) {  

// console.log($stateParams.playlist);
  $scope.generateEvents = function(res){

    $scope.playlist = res;
    // console.log($scope.playlist);

    $scope.events = [];

    var date = new Date();
    var d = date.getDate();
    var m = date.getMonth();
    var y = date.getFullYear();

    //will not show track list, only caulculates from start to end time
    if($scope.playlist !==null){
      for(var i=0;i<$scope.playlist.dayPrograms.length;i++){
        
        var d = $scope.playlist.dayPrograms[i].displayDate;//date string
        
        //console.log(end);
        //console.log(nd);
        var e={
          id:$scope.playlist.dayPrograms[i]._id,
          title: $scope.playlist.dayPrograms[i].displayDate,
          allDay:true,
          start:new Date(d),
          //end:endMoment,
          className:['b-l b-2x b-info'],
          editable:false,
          dailyPlaylistContent:$scope.playlist.dayPrograms[i]
          // playlistContent:$scope.playlist
        };
        //console.log(e);

        $scope.events.push(e);
      }
    }

    /* alert on dayClick */
  //   $scope.precision = 400;
  //   $scope.lastClickTime = 0;

  //   $scope.overlay = $('.fc-overlay');
  //   $scope.alertOnMouseOver = function( event, jsEvent, view ){
  //     $scope.event = event;
  //     $scope.overlay.removeClass('left right top').find('.arrow').removeClass('left right top pull-up');
  //     var wrap = $(jsEvent.target).closest('.fc-event');
  //     var cal = wrap.closest('.calendar');
  //     var left = wrap.offset().left - cal.offset().left;
  //     var right = cal.width() - (wrap.offset().left - cal.offset().left + wrap.width());
  //     var top = cal.height() - (wrap.offset().top - cal.offset().top + wrap.height());
  //     if( right > $scope.overlay.width() ) { 
  //       $scope.overlay.addClass('left').find('.arrow').addClass('left pull-up')
  //     }else if ( left > $scope.overlay.width() ) {
  //       $scope.overlay.addClass('right').find('.arrow').addClass('right pull-up');
  //     }else{
  //       $scope.overlay.find('.arrow').addClass('top');
  //     }
  //     if( top < $scope.overlay.height() ) { 
  //       $scope.overlay.addClass('top').find('.arrow').removeClass('pull-up').addClass('pull-down')
  //     }
  //     (wrap.find('.fc-overlay').length == 0) && wrap.append( $scope.overlay );
  //   };

  //   /* config object */
  //   $scope.uiConfig = {
  //     calendar:{
  //       height: 400,
  //       firstDay:1,//Monday as first day
  //       weekNumbers:true,
  //       editable: false,
  //       header:{
  //         left: 'prev',
  //         center: 'title',
  //         right: 'next'
  //       },
  //       eventMouseover: $scope.alertOnMouseOver
  //     }
  //   };

  //   /* Change View */
  //   $scope.changeView = function(view, calendar) {
  //     $('.calendar').fullCalendar('changeView', view);
  //   };

  //   $scope.today = function(calendar) {
  //     $('.calendar').fullCalendar('today');
  //   };

  // };

  // return ProgramById.get({'programId':$stateParams.playlistId}).$promise.then(
  //   function(res){
  //     $scope.generateEvents(res);
  //   });


//   ProgramById.get({'programId':$stateParams.playlistId},
//     function(res){
//       $scope.generateEvents(res);
//       console.log(res);
//     });

//   /* event sources array*/
//     $scope.eventSources = [$scope.events];

// }]);*/


app.controller('DailyPlaylistDetailCtrl', ['$scope', 'ProgramById', '$stateParams', function($scope, ProgramById, $stateParams) {  

  ProgramById.get({'programId':$stateParams.programId},
    function(res) {

      $scope.dailyPlaylist = res.dayPrograms.filter(function(e){
        return e._id===$stateParams.dailyplaylistId;
      });
      console.log($scope.dailyPlaylist);
    });

}]);

app.controller('PlaylistBindCtrl', ['$scope', 'ProgramById','CustomersBasic', 'CustomerSites', 'ProgramBindSite', '$stateParams', function($scope,ProgramById, CustomersBasic, CustomerSites, ProgramBindSite, $stateParams) {

  $scope.init = function(){

    ProgramById.get({'programId':$stateParams.playlistId},
    function(res) {
      $scope.playlist = res;
    });

    $scope.checkedSites = [];

    //messaging
    $scope.alerts = [];
    $scope.closeAlert = function(index) {
        $scope.alerts.splice(index, 1);
      };

    CustomersBasic.get(function(res){
      $scope.customers = res;
    });
  };

  $scope.showStores = function(){

    CustomerSites.getPageData({'customerId':$scope.selectedBrandId},
        function(res) {
          $scope.sites = res.data;
      });
  };

  //get checked sites
  $scope.chooseSite = function(id) {
    var idx = $scope.checkedSites.indexOf(id);

    // is currently selected
    if (idx > -1) {
      $scope.checkedSites.splice(idx, 1);
    }
    // is newly selected
    else {
      $scope.checkedSites.push(id);
    }
  };

  //TODO, should use a site array, NOT a single site
  $scope.startBind = function(){

    var params = {
      siteId:$scope.checkedSites[0]
    };

    ProgramBindSite.save({'programId':$scope.playlist._id},params,function(res){
      $scope.alerts.push({type: 'success', msg: $scope.playlist.name + '绑定成功！'});

      /*{ type: 'danger', msg: 'Well done! You successfully read this important alert message.' },
      { type: 'info', msg: 'Heads up! This alert needs your attention, but it is not super important.' },
      { type: 'warning', msg: 'Warning! Best check yo self, you are not looking too good...' }*/
    });
  };

}]);


app.controller('UserListCtrl', ['$scope', 'Users', '$stateParams', function($scope, Users, $stateParams) {

  //messaging
    $scope.alerts = [];
    $scope.closeAlert = function(index) {
        $scope.alerts.splice(index, 1);
      };

  Users.allUsers({},
    function(res) {
      // console.log(res);
      $scope.datasource = res;
    }); 

  $scope.editItem = function(item){
    item.editing = true;
    $scope.itemToEdit = item;
    $scope.showEdit = true;
  };

  //save customer to save contacts
  $scope.saveUser = function(){
    $scope.showEdit = false;

    /*var userUpdated = {
      _id: $scope.brand._id,
      contacts:$scope.datasource
    };

    var customer = new Customers(customerUpdated);
    customer.$update(function(customer) {
      $scope.alerts.push({type: 'success', msg: $scope.itemToEdit.name + '修改成功！'});
      $state.go('customers.contact',{brandId:customer._id});
    });*/

  };


}]);


app.controller('EnvoMusicCtrl', ["$sce",'$scope', function ($sce, $scope) {    
    $scope.API = null;
    $scope.active = 0;

    $scope.audios = [
      {
        title: "1. Lentement",
        artist:"Miaow",
        poster: "img/b0.jpg",
        sources: [
          {src: $sce.trustAsResourceUrl("http://flatfull.com/themes/assets/musics/Miaow-03-Lentement.mp3"), type: "audio/mpeg"},
          {src: $sce.trustAsResourceUrl("http://flatfull.com/themes/assets/musics/Miaow-03-Lentement.ogg"), type: "audio/ogg"}
        ]
      },
      {
        title: "2. Bubble",
        artist:"Miaow",
        poster: "img/b1.jpg",
        sources: [
          {src: $sce.trustAsResourceUrl("http://flatfull.com/themes/assets/musics/Miaow-07-Bubble.mp3"), type: "audio/mpeg"},
          {src: $sce.trustAsResourceUrl("http://flatfull.com/themes/assets/musics/Miaow-07-Bubble.ogg"), type: "audio/ogg"}
        ]
      },      
      {
        title: "3. Partir",
        artist:"Miaow",
        poster: "img/b2.jpg",
        sources: [
          {src: $sce.trustAsResourceUrl("http://flatfull.com/themes/assets/musics/Miaow-09-Partir.mp3"), type: "audio/mpeg"},
          {src: $sce.trustAsResourceUrl("http://flatfull.com/themes/assets/musics/Miaow-09-Partir.ogg"), type: "audio/ogg"}
        ]
      }
    ];

    $scope.config = {
      sources: $scope.audios[0].sources,
      title: $scope.audios[0].title,
      repeat: false,
      shuffle: false,
      autoPlay: false,
      theme: {
        url: "js/app/music/videogular.css"
      }
    };

    $scope.onPlayerReady = function(API) {
      $scope.API = API;
      if ($scope.API.currentState == 'play' || $scope.isCompleted) $scope.API.play();
      $scope.isCompleted = false;
    };

    $scope.onComplete = function() {
      $scope.isCompleted = true;
      // shuffle
      if($scope.config.shuffle){
        $scope.active = $scope.getRandom($scope.active);
      // next item
      }else{
        $scope.active++;
      }
      
      // last item
      if ($scope.active >= $scope.audios.length) {
        $scope.active = 0;
        // repeat
        if($scope.config.repeat){
          $scope.setActive($scope.active);
        }
      }else{
        $scope.setActive($scope.active);
      }
    };

    $scope.getRandom = function(index){
      var i = Math.floor( Math.random() * $scope.audios.length );
      if ( !(i-index) ){
        i = $scope.getRandom( index );
      }
      return i;
    }

    $scope.play = function(index){
      $scope.isCompleted = true;
      // get prev or next item
      index == "next" ? $scope.active++ : $scope.active--;
      if ($scope.active >= $scope.audios.length) $scope.active = 0;
      if ($scope.active == -1) $scope.active = $scope.audios.length - 1;
      // play it
      $scope.setActive($scope.active);
    };

    $scope.setActive = function(index){
      $scope.API.stop();
      $scope.config.sources = $scope.audios[index].sources;
      $scope.config.title = $scope.audios[index].title;
    };

    $scope.toggleRepeat = function(){
      $scope.config.repeat = !$scope.config.repeat;
      if ($scope.isCompleted) $scope.API.play();
    };

    $scope.toggleShuffle = function(){
      $scope.config.shuffle = !$scope.config.shuffle;
      console.log($scope.API.currentState);
      if ($scope.isCompleted) $scope.API.play();
    };

    // video
    $scope.video = {
      sources: [
        {src: $sce.trustAsResourceUrl("http://flatfull.com/themes/assets/video/big_buck_bunny_trailer.m4v"), type: "video/mp4"},
        {src: $sce.trustAsResourceUrl("http://flatfull.com/themes/assets/video/big_buck_bunny_trailer.webm"), type: "video/webm"},
        {src: $sce.trustAsResourceUrl("http://flatfull.com/themes/assets/video/big_buck_bunny_trailer.ogv"), type: "video/ogg"}
      ],
      theme: {
        url: "js/app/music/videogular.css"
      },
      plugins: {
        controls: {
          autoHide: true,
          autoHideTime: 5000
        },
        poster: "img/c1.jpg"
      }
    };

  }]
);