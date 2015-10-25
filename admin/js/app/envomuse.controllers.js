//Dashboard
app.controller('DashboardCtrl', ['$scope', 'DashStats', 'ComingJobs', '$stateParams', 
  function($scope, DashStats, ComingJobs, $stateParams) {  

    $scope.load = function() {
      
      DashStats.get(function(res) {

        //global stats
        $scope.stats = res;
        $scope.stats.totalCustomers = res.customerStatus.prospect+res.customerStatus.demo+res.customerStatus.inactive+res.customerStatus.signed;

        //delivery stats
        $scope.siteDeliveryStats = res.siteDeliveryStats.delivered===0?0:100*res.siteDeliveryStats.delivered/(res.siteDeliveryStats.delivered+res.siteDeliveryStats.undelivered);

        //brand stats
        $scope.customerStatus = res.customerStatus;
        $scope.dataCustomerStatus = [ 
          { label: "目标客户", data: res.customerStatus.prospect }, 
          { label: "样品测试", data: res.customerStatus.demo },
          { label: "签约客户", data: res.customerStatus.signed },
          { label: "合约终止", data: res.inactive }
        ];
      });

      //coming jobs stats
      ComingJobs.getCount(function(res){
        $scope.comingJobsStats = res;
      });

  };
}]);


//User admin dashboard
app.controller('UserHomeCtrl', ['$scope', '$stateParams', '$window',
  function($scope, $stateParams, $window) {

    console.log($window.myInfo);

    $scope.data = $window.myInfo;

    $scope.sites = $scope.data.sites;
    $scope.playlist = $scope.data.dayPlaylistArr;

}]);

//Customer list
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
              logo:e.logo!=null?e.logo:'img/default_logo.png',
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

//Customer add new
app.controller('CustomerNewCtrl', ['$scope', '$rootScope', '$state', 'Customers', 
  function($scope,$rootScope, $state, Customers) {

    $scope.myImage='';
    $scope.myCroppedImage='';
    $scope.cropType="circle";

    var handleFileSelect=function(evt) {
      var file=evt.currentTarget.files[0];
      var reader = new FileReader();
      reader.onload = function (evt) {
        $scope.$apply(function($scope){
          $scope.myImage=evt.target.result;
          $rootScope.myCroppedImage = $scope.myCroppedImage;
        });
      };
      reader.readAsDataURL(file);
    };
    angular.element(document.querySelector('#fileInput')).on('change',handleFileSelect);

  
  $scope.brand = {};

  $scope.industrylist = ["奢侈品","时尚-服饰","美容美发","餐饮","零售","银行","酒店宾馆","汽车","航空","其它"];

  $scope.statuslist = [
    {key:"prospect", value:"目标客户"},
    {key:"demo", value:"样品测试"},
    {key:"signed", value:"签约客户"},
    {key:"inactive", value:"合约终止"}
  ];

  $scope.updateperiodlist = [
    "每月更新","每2月更新","每季度更新","半年更新"
  ];

  $scope.createBrand = function(){

    var newCustomer = {
      brand: $scope.brand.name,
      companyName: $scope.brand.company,
      logo:   $scope.myCroppedImage,
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

//Customer detail
app.controller('CustomerDetailCtrl', ['$scope', '$state', '$rootScope', 'Customers', 'CustomerManager', 'CustomerChannels', '$stateParams', 
  function($scope, $state, $rootScope, Customers, CustomerManager, CustomerChannels, $stateParams) {

  //messaging
  $scope.alerts = [];
  $scope.closeAlert = function(index) {
    $scope.alerts.splice(index, 1);
  };

  $scope.hideMe = function(id){
    if(id!=null)
      $state.go('customers.store',{brandId:id});
    else
      $state.go('customers.store',{brandId:$stateParams.brandId});
  };

  Customers.get({'customerId':$stateParams.brandId},
    function(res) {
      $scope.brand = res;

      switch($scope.brand.status){
        case 'prospect':$scope.brand.status="目标客户";break;
        case 'demo':$scope.brand.status="样品测试";break;
        case 'signed':$scope.brand.status="签约客户";break;
        case 'inactive':$scope.brand.status="合约终止";break;
      }

      $scope.leader = $scope.brand.contacts.filter(function(e){
        return e.isLeader;
      })[0];
    });

  CustomerChannels.getChannels({'customerId':$stateParams.brandId},
    function(res) {
      $scope.channels = res;
    });
}]);

//Customer edit
app.controller('CustomerEditCtrl', ['$scope', '$state', 'Customers', '$stateParams', 
  function($scope, $state, Customers,$stateParams) {
  
  Customers.get({'customerId':$stateParams.brandId},
    function(res) {
      $scope.brand = res;
    });

  $scope.industrylist = [
    "奢侈品","时尚-服饰","美容美发","餐饮","零售","银行","酒店宾馆","汽车","航空","其它"
  ];
  $scope.statuslist = [
    {key:"prospect", value:"目标客户"},
    {key:"demo", value:"样品测试"},
    {key:"signed", value:"签约客户"},
    {key:"inactive", value:"合约终止"}
  ];

  $scope.updateperiodlist = [
    "每月更新","每2月更新","每季度更新","半年更新"
  ];

  $scope.saveBrand = function(){
    var customerUpdated = {
      _id: $scope.brand._id,
      brand: $scope.brand.brand,
      companyName: $scope.brand.company,
      industry: $scope.brand.industry,
      status: $scope.brand.status,
      updatePeriod: $scope.brand.updatePeriod,
      crmInfo: {
        contractDate: ($scope.brand.crmInfo.contractDate!=null)?$scope.brand.crmInfo.contractDate:null,
        endContractDate: ($scope.brand.crmInfo.endContractDate!=null)?$scope.brand.crmInfo.endContractDate:null
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
      $state.go('customers.store',{brandId:customer._id},{reload: true});
    });

  };
}]);

//Customer contact list
app.controller('ContactListCtrl', ['$scope', '$state', 'Customers', '$stateParams', 
  function($scope, $state, Customers, $stateParams) {

  //for footer controller
  $scope.brandId = $stateParams.brandId;
  
  if($scope.brand!=null){
    $scope.datasource = $scope.brand.contacts;
  }
  else{
    Customers.get({'customerId':$stateParams.brandId},
    function(res) {
      $scope.brand = res;
      $scope.datasource = $scope.brand.contacts;
    }); 
  }

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
      $scope.$parent.alerts.push({type: 'success', msg: $scope.itemToEdit.name + '修改成功！'});
      $state.go('customers.contact',{brandId:$scope.brand._id});
    });

  };

}]);

//Customer contact new
app.controller('ContactNewCtrl', ['$scope', 'Customers', '$stateParams', '$state', 
  function($scope, Customers, $stateParams, $state) {
  
  if($scope.brand==null){
    Customers.get({'customerId':$stateParams.brandId},
    function(res) {
      $scope.brand = res;
    });
  }

  $scope.createContact = function(){
    var newContact = {
      name: $scope.contact.name,
      isLeader: $scope.contact.isLeader,
      gender: $scope.contact.gender,
      // birthday: $scope.contact.birthday !=null ? $scope.contact.birthday.getTime():"",
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
      $scope.$parent.alerts.push({type: 'success', msg: $scope.contact.name + '添加成功！'});
      $state.go('customers.contact',{brandId:$scope.brand._id});
    });
  };
}]);

//Customer set manager
app.controller('CustomerSetManagerCtrl', ['$scope', 'CustomerManager', 'Customers', '$stateParams', '$state', 
  function($scope, CustomerManager, Customers, $stateParams, $state) {
  
  if($scope.brand==null){
    Customers.get({'customerId':$stateParams.brandId},
    function(res) {
      $scope.brand = res;
    });
  }

  $scope.setManager = function(){

    var manager = {
      email:$scope.brand.user.email,
      password:$scope.manager.pwd1
    };

    CustomerManager.save({customerId:$stateParams.brandId},manager,function(res){
        $scope.$parent.alerts.push({type: 'success', msg: res.email + '生成成功！'});
        $state.go('customers.store',{brandId:$stateParams.brandId});  
        // console.log(res);
      });
  };
}]);

//Customer site new
app.controller('StoreNewCtrl', ['$scope', 'Customers', 'Sites', 'CustomerSites', '$stateParams', '$state',
  function($scope, Customers, Sites, CustomerSites, $stateParams,$state) {

  if($scope.brand==null){
    Customers.get({'customerId':$stateParams.brandId},
    function(res) {
      $scope.brand = res;
    });
  }

  $scope.createStore = function(){
    var newStore = {
      customerId: $scope.brand._id,
      siteName: $scope.store.sitename,
      reference: $scope.store.reference,
      manager: $scope.store.manager,
      phone: $scope.store.phone,
      address: $scope.store.address,
      // country: $scope.store.country,
      province: $scope.store.province,
      city: $scope.store.city,
      // channel:$scope.selectedChannel,
      // businesscenter: $scope.store.businesscenter,
      // manager: $scope.store.contact,
      // zipcode: $scope.store.zipcode,
      // latitude: $scope.store.latitude,
      // longitude: $scope.store.longitude,
      // description: $scope.store.description
    };

    var store = new CustomerSites(newStore);
    store.$save({'customerId':  $stateParams.brandId}, function(site) {
      $state.go('customers.store.detail',{brandId:$scope.brand._id,storeId:site._id});
      $scope.$parent.alerts.push({type: 'success', msg: $scope.store.sitename + '添加成功！'});
    });
  };
}]);

//Customer site edit
app.controller('StoreEditCtrl', ['$scope', 'Sites', 'CustomerChannels', '$stateParams', '$state',
  function($scope, Sites, CustomerChannels, $stateParams,$state) {

  if($scope.store==null){
    Sites.get({'siteId':$stateParams.storeId},
    function(res) {
      $scope.store = res;
    });
  }

  CustomerChannels.getChannels({'customerId':$stateParams.brandId},
    function(res) {
      $scope.channels = res;
      $scope.selectedChannel = $scope.channels[$scope.channels.map(function(x) {return x._id; }).indexOf($scope.store.channel)];
  });

  $scope.saveStore = function(){
    var updatedStore = {
      _id:$scope.store._id,
      customerId: $scope.brand._id,
      siteName: $scope.store.siteName,
      reference: $scope.store.reference,
      channel:$scope.selectedChannel._id,
      manager: $scope.store.manager,
      phone: $scope.store.phone,
      address: $scope.store.address,
      province: $scope.store.province,
      city: $scope.store.city,
      disable: $scope.store.disable,
      deliveryInfo: $scope.store.deliveryInfo
    };

    var store = new Sites(updatedStore);
    store.$update(function(site) {
      $scope.$parent.alerts.push({type: 'success', msg: $scope.store.siteName + '修改成功！'});
      $state.go('customers.store.detail',{brandId:$scope.brand._id,storeId:$scope.store._id});
    });
  };
}]);

//Customer store detail
app.controller('StoreDetailCtrl', ['$scope', '$state', 'Customers', 'Sites', 'SiteLicense', '$stateParams', 
  function($scope, $state, Customers, Sites, SiteLicense, $stateParams) {

  $scope.siteId = $stateParams.storeId;

  Sites.get({'siteId':$scope.siteId},
    function(res) {
      $scope.store = res;
    });

  if($scope.brand==null){
    Customers.get({'customerId':$stateParams.brandId},
    function(res) {
      $scope.brand = res;
    });
  }


  $scope.bindLicense = function(storeId){
    // console.log(storeId);
    SiteLicense.save({'siteId':storeId},function(res){
      // console.log(res);
    })
  };
  
}]);

//Customer store list
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

        console.log(res);
        
      $scope.bigTotalItems = res.count;
      $scope.datasource = res.data;
      $scope.normalizedDataSource = $scope.datasource.map(function(e){
        return {
          _id:e._id,
          siteName:e.siteName,
          reference:e.reference,
          deviceId:e.deviceId,
          channelName:e.channelName,
          channelType:e.channelType==='normal'?'light':(e.channelType==='special'?'primary':'info'),
          deliverState:e.deliveryInfo.deliveried === true ?'success':'light',
          playerStatus:e.playerStatus==='offline'?'danger':'success',
          license: e.license.uuid
        };
      });
    });
  };
}]);


//Channels dash
app.controller('ChannelsDashCtrl', ['$scope', 'CustomersBasic', '$stateParams', 
  function($scope, CustomersBasic, $stateParams) {

    CustomersBasic.get(function(res){
      for(var i=0;i<res.length;i++){
        res[i].channels.map(function(e){
          switch (e.type){
                case 'default':e.type="默认频道";e.bg="light";isOpen=false;break;
                case 'normal':e.type="正常频道";e.bg="info";isOpen=false;break;
                case 'special':e.type="高优先级频道";e.bg="primary";isOpen=false;break;
              }
        });
      }

      $scope.customerDataItems = res;
    });

}]);

//Channels detail
app.controller('ChannelsDetailCtrl', ['$scope', '$state', 'Jobs', 'Customers', 'ExportProgram', 'ProgramById', 'ChannelsProgramList', 'ChannelsGenerateProgram', '$stateParams', 
  function($scope, $state, Jobs, Customers, ExportProgram, ProgramById, ChannelsProgramList, ChannelsGenerateProgram, $stateParams) {

    $scope.alerts = [];
    $scope.closeAlert = function(index) {
        $scope.alerts.splice(index, 1);
      };

    Jobs.get(function(res) {
      $scope.jobs = res;
    });

    Customers.get({'customerId':$stateParams.brandId},
    function(res) {
      $scope.chosenBrand = res;

      switch($scope.chosenBrand.status){
        case 'prospect':$scope.chosenBrand.status="目标客户";break;
        case 'demo':$scope.chosenBrand.status="样品测试";break;
        case 'signed':$scope.chosenBrand.status="签约客户";break;
        case 'inactive':$scope.chosenBrand.status="合约终止";break;
      }
    });

    $scope.chosenBrandId = $stateParams.brandId;
    $scope.chosenChannelId = $stateParams.channelId;

    ChannelsProgramList.getPrograms({'channelId':$scope.chosenChannelId},
      function(res) {
      $scope.programs = res;
    });
    
    //initialisation
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

    /*ChannelsProgramList.get(function(res){
      $scope.customerDataItems = res;
    });*/

    $scope.job = {};

    $scope.generate = function(){
      var conf = {
        name:$scope.program.comment,
        // daterange:$scope.program.dateRange,
        // job:$scope.job.selected
        startDate:$scope.program.dateRange.substring(0,10),
        endDate:$scope.program.dateRange.substring(13,23),
        jobId:$scope.job.selected._id,
      };
    
      console.log(conf);

      ChannelsGenerateProgram.generateProgram({channelId:$scope.chosenChannelId},conf,function(res){
        // $scope.$parent.alerts.push({type: 'success', msg: res.name + '生成成功！'});
        $state.go('channels.detail',{brandId:$scope.chosenBrandId,channelId:$scope.chosenChannelId},{reload: true});  
      });
  };

    $scope.doExport = function(id){
      console.log('export....'+id)
      ExportProgram.doExport({programId:id},{},function(res){
        console.log(res);
      },function(error){
        // console.log(error);
        $scope.alerts.push({type: 'danger', msg: error.data.error});
      })
    };

    $scope.doDeleteProgram = function(id){
      console.log('delete program....'+id)
      ProgramById.delete({programId:id},{},function(res){
        console.log('delete program');
        for (var i = $scope.programs.length - 1; i >= 0; i--) {
          if ($scope.programs[i]._id === id) {
            $scope.programs.splice(i, 1);
            break;
          }
        };
      },function(error){
        // console.log(error);
        $scope.alerts.push({type: 'danger', msg: error.data.error});
      })
    };

}]);


//Customer channel list
app.controller('ChannelListCtrl', ['$scope', 'CustomerSites', 'CustomerChannels', 'ChannelsBindSite', '$stateParams', '$state', 
  function($scope, CustomerSites, CustomerChannels,ChannelsBindSite,$stateParams, $state) {
  
  $scope.init = function(){
    $scope.channel = {};
    $scope.checkedSites = [];
    $scope.formValid = false;

    //load sites, only load for the first time
    //pageSize set to a large value to get all sites
    if(!$scope.allSites){
      CustomerSites.getPageData({'customerId':$stateParams.brandId,pageNumber:1,pageSize:1000},
        function(res) {
          $scope.allSites = res.data.map(function(e){

            switch (e.channelType){
              case 'default':e.channelType="默认频道";e.bg="light";break;
              case 'normal':e.channelType="正常频道";e.bg="info";break;
              case 'special':e.channelType="高优先级频道";e.bg="primary";break;
            }

            return {
              _id:e._id,
              channelId:e.channel,
              channelName:e.channelName,
              channelType:e.channelType,
              bg:e.bg,
              siteName:e.siteName,
              siteRef:e.reference
            };
          });
      });
    }

    //load channels
    CustomerChannels.getChannels({'customerId':$stateParams.brandId},
    function(res) {
      $scope.channels = res.map(function(e){
        e.showSelect=true;

        switch (e.type){
          case 'default':e.type="默认频道";e.bg="light";e.showSelect=false;break;
          case 'normal':e.type="正常频道";e.bg="info";break;
          case 'special':e.type="高优先级频道";e.bg="primary";break;
        }
        return e;
      });
    });
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


  $scope.startBind = function(channelId){
    ChannelsBindSite.save({'channelId':channelId},{"sites":$scope.checkedSites},function() {
      $scope.$parent.alerts.push({type: 'success', msg:'绑定成功！'});
      $state.go('customers.channel',{brandId:$stateParams.brandId},{reload:true});
    });
  };

}]);


//Customer channel new
app.controller('ChannelNewCtrl', ['$scope', 'CustomerChannels', '$stateParams', '$state', 
  function($scope, CustomerChannels,$stateParams, $state) {
  
  $scope.channel = {};

  $scope.createChannel = function(){

    var newChannel = {
      name: $scope.channel.name,
      type: $scope.channel.special?'special':'normal'
      // comment:$scope.channel.comment
    };

    CustomerChannels.saveChannel({customerId:$stateParams.brandId},newChannel,function() {
      $scope.$parent.alerts.push({type: 'success', msg: $scope.channel.name + '添加成功！'});
      $state.go('customers.channel',{brandId:$stateParams.brandId});
    });
  };
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
      console.log($scope.job);

      $scope.job.dateTemplates = $scope.job.dateTemplates.map(function(e){
        switch(e.periodInfo.calcType){
          case 'multipleDates':
            e.periodInfo.calcType="多日期";
            e.periodInfo.values = e.periodInfo.multipleDatesValues;
            break;
          case 'dateRange':
            e.periodInfo.calcType = '日期范围';
            e.periodInfo.values = {
              startDate:e.periodInfo.dateRangeValues.startDate,
              endDate:e.periodInfo.dateRangeValues.endDate
            };
            break;
          case 'daysOfWeek':
            e.periodInfo.calcType="周";
            e.periodInfo.values = [];

            for(var key in e.periodInfo.daysOfWeekValues){
              switch(key){
                case 'Mon': e.periodInfo.values.push({dateName:'星期一',checked:e.periodInfo.daysOfWeekValues[key]});break;
                case 'Tue': e.periodInfo.values.push({dateName:'星期二',checked:e.periodInfo.daysOfWeekValues[key]});break;
                case 'Wed': e.periodInfo.values.push({dateName:'星期三',checked:e.periodInfo.daysOfWeekValues[key]});break;
                case 'Thur': e.periodInfo.values.push({dateName:'星期四',checked:e.periodInfo.daysOfWeekValues[key]});break;
                case 'Fri': e.periodInfo.values.push({dateName:'星期五',checked:e.periodInfo.daysOfWeekValues[key]});break;
                case 'Sat': e.periodInfo.values.push({dateName:'星期六',checked:e.periodInfo.daysOfWeekValues[key]});break;
                case 'Sun': e.periodInfo.values.push({dateName:'星期日',checked:e.periodInfo.daysOfWeekValues[key]});break;
              }
            }
            break;
        };

        return e;
      });
    });
}]);

app.directive('timeline', function() {
  return function($scope, $element, $attrs) {
    // console.log($scope.row.clock.boxes);
    var defaultDateStr = '2015-08-01';

    var clock = $scope.row.clock.boxes.map(function(e){
      return {
        _id:e._id,
        title:e.name,
        start:defaultDateStr.concat(e.startTm.substring(10)),
        end:defaultDateStr.concat(e.endTm.substring(10)),
        color: '#'+(Math.random()*0xFFFFFF<<0).toString(16),
        tracks:e.tracks
      };
    });
    
   $element.timestack({
      span: 'hour',
      data: clock
    });
  };
});

//Channel daily program playlist detail
app.controller('DailyPlaylistDetailCtrl', ['$scope', 'ProgramById', '$stateParams', 
  function($scope, ProgramById, $stateParams) {  

  $scope.brandId = $stateParams.barndId;
  $scope.channelId = $stateParams.channelId;
  $scope.programId = $stateParams.programId;


  Customers.get({'customerId':$stateParams.brandId},
    function(res) {
      $scope.chosenBrand = res;

      switch($scope.chosenBrand.status){
        case 'prospect':$scope.chosenBrand.status="目标客户";break;
        case 'demo':$scope.chosenBrand.status="样品测试";break;
        case 'signed':$scope.chosenBrand.status="签约客户";break;
        case 'inactive':$scope.chosenBrand.status="合约终止";break;
      }
    });

  ProgramById.get({'programId':$scope.programId},
    function(res) {

      $scope.dailyPlaylist = res.dayPlaylistArr.filter(function(e){
        return e._id===$stateParams.dailyplaylistId;
      });
      console.log($scope.dailyPlaylist);
    });

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

app.controller('ComingJobsCtrl', ['$state', '$timeout', '$scope', 'ComingJobs', 'ComingJobsImport', 'ComingJobsRefresh', '$stateParams', 
  function($state, $timeout, $scope, ComingJobs, ComingJobsImport, ComingJobsRefresh, $stateParams) {  

  $scope.jobs = [];

  $scope.getJobs = function(res){
    $scope.jobs = res.map(function(e){
        var statusTrans = {
          'idle': [1,'导入中...'],
          'running': [1,'导入中...'],
          'finished': [2,'导入完成'],
          'failed': [3,'导入失败']
        };
        return {
          type:e.__t,
          _id:e._id,
          creator:e.meta.creator,
          customerName:e.meta.brand,
          created:e.meta.created,
          importStatusDescription: (!e.task) ? '待导入' : statusTrans[e.task.status][1],
          importStatusFlag: (!e.task) ? 0 : statusTrans[e.task.status][0],
        };
      });

     $scope.count = $scope.jobs.length;
  };

  ComingJobs.getList(function(res){
    $scope.comingJobs = res;
    console.log($scope.comingJobs);

    $scope.getJobs(res);

  });

  $scope.refresh = function(){
    $scope.isRefreshing = true;

    ComingJobsRefresh.refresh({},function(res){
      $state.go('tasks.incoming',{},{reload: true});
      $scope.isRefreshing = false;
    },function(res){
      $scope.isRefreshing = false;
    });
  };

  $scope.reload = function(){
    $scope.isRefreshing = false;
    $state.go('tasks.incoming',{},{reload: true});
  };


  $scope.doImport = function(id){

    ComingJobsImport.import({'jobId':id},{},function(res){
      console.log(res);
      $state.go('tasks.incoming',{},{reload: true});
    });
  };

}]);

/*//Programs - Playlists
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

  }]);*/

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




/*app.controller('PlaylistBindCtrl', ['$scope', 'ProgramById','CustomersBasic', 'CustomerSites', 'ProgramBindSite', '$stateParams', function($scope,ProgramById, CustomersBasic, CustomerSites, ProgramBindSite, $stateParams) {

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

      /*\{ type: 'danger', msg: 'Well done! You successfully read this important alert message.' },
      { type: 'info', msg: 'Heads up! This alert needs your attention, but it is not super important.' },
      { type: 'warning', msg: 'Warning! Best check yo self, you are not looking too good...' }*
    });
  };

}]);
*/

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

  }]
);