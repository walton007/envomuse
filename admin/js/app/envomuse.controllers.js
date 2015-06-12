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
    
    //TBD: add sort
    $scope.init = function(){
      $scope.maxSize = 5; //total buttons displayed
      $scope.bigCurrentPage = 1;  //current page
      $scope.datasource = [];
      $scope.pageItems = 10;

      $scope.pageChanged();
    };
    
    $scope.pageChanged = function() {

      $scope.setPage = function (pageNo) {
        $scope.bigCurrentPage = pageNo;
      };

      Customers.getPageData({pageNumber:$scope.bigCurrentPage,pageSize:$scope.pageItems},
        function(res) {
          $scope.bigTotalItems = res.count;
          $scope.datasource = res.data;

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

app.controller('CustomerDetailCtrl', ['$scope', 'Customers', '$stateParams', function($scope, Customers, $stateParams) {
  Customers.get({'customerId':$stateParams.brandId},
    function(res) {
      $scope.brand = res;
    });
}]);

app.controller('CustomerNewCtrl', ['$scope', '$rootScope', '$state', 'Customers', function($scope,$rootScope, $state, Customers) {
  $scope.brand = {};

  $scope.industrylist = [
    "奢侈品","酒店/宾馆","餐饮","服装业", "服务","美容","媒体","零售","设计","银行","金融","因特网","咨询","其它"
  ];
  $scope.statuslist = [
    "目标客户","初步接触","DEMO展示","PILOT试用","合同中","合同终止","其它"
  ];
  $scope.updateperiodlist = [
    "每月更新","每季度更新","半年更新","其它"
  ];

  $scope.createBrand = function(){

    var newCustomer = {
      brand: $scope.brand.name,
      logo:   $rootScope.myCroppedImage,
      industry: $scope.brand.industry,
      status: $scope.brand.status,
      updatePeriod: $scope.brand.updatePeriod,
      crmInfo: {
        contractDate: ($scope.brand.contractdate!=null)?$scope.brand.contractdate.getTime():null
      },
      designFee: $scope.brand.designFee,
      setupFee: $scope.brand.setupFee,
      monthServiceFee: $scope.brand.monthServiceFee,
      otherFee: $scope.brand.otherFee,
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
      $scope.pageItems = 5;

      Customers.get({'customerId':$stateParams.brandId},
        function(res) {
          $scope.brand = res;
        });

      $scope.pageChanged();
    };

    $scope.pageChanged = function() {

      $scope.setPage = function (pageNo) {
        $scope.bigCurrentPage = pageNo;
      };

      CustomerSites.getPageData({'customerId':$stateParams.brandId,pageNumber:$scope.bigCurrentPage,pageSize:$scope.pageItems},
        function(res) {
          $scope.bigTotalItems = res.count;
          $scope.datasource = res.data;

          $scope.normalizedDataSource = $scope.datasource.map(function(e){
            return {
              _id:e._id,
              siteName:e.siteName,
              reference:e.reference,
              created:e.created,
              siteProgramsCount:e.programs.length,
              lastBindDate:e.programs[0]!=null?e.programs[0].bindDate:null,
              manager:e.manager
            };
          });
        });
    };

  }]);


app.controller('StoreDetailCtrl', ['$scope', '$state', 'Customers', 'Sites', 'SiteLicense', '$stateParams', function($scope, $state, Customers, Sites, SiteLicense, $stateParams) {

  Sites.get({'siteId':$stateParams.storeId},
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


app.controller('JobListCtrl', ['$scope', 'Jobs', '$stateParams', function($scope, Jobs, $stateParams) {

    $scope.init = function(){
      $scope.maxSize = 5; //total buttons displayed
      $scope.bigCurrentPage = 1;  //current page
      $scope.datasource = [];

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


app.controller('JobDetailCtrl', ['$scope', 'JobById', 'GenerateProgram', '$stateParams', function($scope, JobById, GenerateProgram, $stateParams) {  

  // $scope.job = $stateParams.jobContent;

  JobById.get({'jobId':$stateParams.jobId},
    function(res) {
      $scope.job = res;

      $scope.job.programRule.playlists = $scope.job.programRule.playlists.filter(function(e){
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
      };

      //rules normalization
      e.dayRuleUnits = e.dayRuleUnits.map(function(d){
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
    });

        console.log($scope.job);
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
      console.log($scope.box);
      });

  //console.log($scope.program);
  console.log($scope.box);

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
app.controller('TasksDashboardCtrl', ['$scope', 'ComingJobs', '$stateParams', function($scope, ComingJobs, $stateParams) {  

  ComingJobs.getCount(function(res){
    $scope.stat = res;
    // console.log($scope.stat);
  });

}]);

app.controller('ComingJobsCtrl', ['$scope', 'ComingJobsRefresh', 'Tasks', '$stateParams', function($scope, ComingJobsRefresh, Tasks, $stateParams) {  

  $scope.jobs = [];

  $scope.refresh = function (){
    ComingJobsRefresh.refresh(function(res){
      
      $scope.jobs = res.map(function(e){
        return {
          type:e.__t,
          version: e.__v,
          _id:e._id,
          creator:e.creator,
          customerName:e.customerName, 
          filepath:e.filepath,
          hash:e.hash,
          importStatus: (e.importStatus==='notImport')?'待导入':(e.importStatus==='importing'?'导入中...':'导入完成')
        };
      });

     /*$scope.count = $scope.jobs.filter(function(e){
      return e.importStatus !== 'notImport';
     }).length;*/
     $scope.count = $scope.jobs.length;
     //console.log($scope.jobs);
    });
  };

  $scope.doImport = function(id){
    ComingJobsImport.import({'jobId':id},function(res){
      $scope.tasks = res;
      alert(res);
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

app.controller('PlaylistBindCtrl', ['$scope', 'CustomersBasic', 'CustomerSites', 'ProgramBindSite', '$stateParams', function($scope, CustomersBasic, CustomerSites, ProgramBindSite, $stateParams) {

  $scope.init = function(){
    $scope.playlist = $stateParams.playlistContent;
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