app.controller('JobListCtrl', ['$scope', 'jobs', '$stateParams', function($scope, jobs, $stateParams) {
    
    //TBD: add sort functionalities

    $scope.init = function(){
      $scope.maxSize = 5; //total buttons displayed
      $scope.bigCurrentPage = 1;  //current page
      $scope.datasource = [];

      jobs.getLength().then(function(res){
        $scope.bigTotalItems = res.total;
        $scope.bigActiveItems = res.active;
        $scope.bigInActiveItems = res.inactive;
      });

      $scope.pageChanged();
    };

    $scope.setPage = function (pageNo) {
      $scope.bigCurrentPage = pageNo;
    };
    $scope.pageChanged = function() {
      $scope.status = $stateParams.jobStatus;

      jobs.getPage($scope.bigCurrentPage,$scope.status).then(function(res){
        $scope.datasource = res;
      });
    };

  }]);

/*
app.controller('JobNewCtrl', ['$scope', 'jobs', function($scope,jobs) {
  $scope.job = {
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

  jobs.allContacts().then(function(res){
    $scope.contactlist = res;
  });

  $scope.salespersonlist = [
    {name: 'BD_A'},
    {name: 'BD_B'},
    {name: 'BD_C'},
    {name: 'BD_D'},
    {name: 'BD_E'}
  ];

  $scope.createJob = function(){
    var newJob = {
    name: $scope.job.name,
    industry: $scope.job.industry,
    status: $scope.job.status,
    updateperiod: $scope.job.updateperiod,
    contact: $scope.job.contact,
    contractdate: $scope.job.contractdate,
    discount: $scope.job.discount,
    unitprice: $scope.job.unitprice,
    firstcontactdate: $scope.job.firstcontactdate,
    salesperson: $scope.job.salesperson,
    descripton: $scope.job.descripton
    };

    console.log(newJob);


    //jobs.createNew(newJob)
  };

}]);
*/
/*
app.controller('JobEditCtrl', ['$scope', 'jobs', '$stateParams', function($scope,jobs,$stateParams) {
  jobs.get($stateParams.jobId).then(function(job){
    $scope.job = job;
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

  jobs.allContacts().then(function(res){
    $scope.contactlist = res;
  });

  $scope.salespersonlist = [
    {name: 'BD_A'},
    {name: 'BD_B'},
    {name: 'BD_C'},
    {name: 'BD_D'},
    {name: 'BD_E'}
  ];

  $scope.createJob = function(){
    var newJob = {
    name: $scope.job.name,
    industry: $scope.job.industry,
    status: $scope.job.status,
    updateperiod: $scope.job.updateperiod,
    contact: $scope.job.contact,
    contractdate: $scope.job.contractdate,
    discount: $scope.job.discount,
    unitprice: $scope.job.unitprice,
    firstcontactdate: $scope.job.firstcontactdate,
    salesperson: $scope.job.salesperson,
    descripton: $scope.job.descripton
    };

    console.log(newJob);

    
    //jobs.createNew(newJob)
  };
}]);
*/
app.controller('JobDetailCtrl', ['$scope', 'jobs', '$stateParams', function($scope,jobs,$stateParams) {

  jobs.get($stateParams.jobId).then(function(res){
    $scope.job = res;
    //console.log(res);
    $scope.rowCollectionBasic = res.programs.filter(function(e){
      switch(e.calcType){
        case 'date':
          e.calcType="日期";
          e.dValues=e.dateValues.join(';');
          break;
        case 'dateRange':
          e.calcType="日期范围";
          e.dValues=e.dateRangeStart+'-->'+e.dateRangeEnd;
          break;
        case 'daysOfWeek':
          e.calcType="周";
          e.dValues=e.weekValues;
          break;
      };

      return e;
    });
  });

}]);

app.controller('ProgramDetailCtrl', ['$scope', 'jobs', '$stateParams', function($scope,jobs,$stateParams) {

  jobs.get($stateParams.jobId).then(function(res){
    $scope.job = res;
    
    for(var i=0;i<res.programs.length;i++){
      if(res.programs[i].programId==$stateParams.programId){
        $scope.program = res.programs[i];
        $scope.rowCollectionBasic = $scope.program.rules;

        switch($scope.program.calcType){
        case 'date':
          $scope.program.calcType="日期";
          $scope.program.dValues=$scope.program.dateValues.join(';');
          break;
        case 'dateRange':
          $scope.program.calcType="日期范围";
          $scope.program.dValues=$scope.program.dateRangeStart+'-->'+$scope.program.dateRangeEnd;
          break;
        case 'daysOfWeek':
          $scope.program.calcType="周";
          $scope.program.dValues=$scope.program.weekValues;
          break;
      };
      }
    }
  });

}]);

app.controller('RuleDetailCtrl', ['$scope', 'jobs', '$stateParams', function($scope,jobs,$stateParams) {

  jobs.get($stateParams.jobId).then(function(res){
    $scope.job = res;
    $scope.programId = $stateParams.programId;

    for(var i=0;i<res.programs.length;i++){
      if(res.programs[i].programId==$stateParams.programId){
        for(var j=0;j<res.programs[i].rules.length;j++){
          if(res.programs[i].rules[j].ruleId==$stateParams.ruleId)
            $scope.program = res.programs[i];
            $scope.rule = res.programs[i].rules[j];
            $scope.rowCollectionBasic = $scope.rule.boxes;
        }
      }
    }

  });

}]);

app.controller('BoxDetailCtrl', ['$scope', 'jobs', '$stateParams', function($scope,jobs,$stateParams) {

  jobs.get($stateParams.jobId).then(function(res){
    $scope.job = res;
    $scope.programId = $stateParams.programId;
    $scope.ruleId = $stateParams.ruleId;
    $scope.boxId = $stateParams.boxId;

    for(var i=0;i<res.programs.length;i++){
      if(res.programs[i].programId==$stateParams.programId){
        for(var j=0;j<res.programs[i].rules.length;j++){
          if(res.programs[i].rules[j].ruleId==$stateParams.ruleId){
            for(var k=0;k<res.programs[i].rules[j].boxes.length;k++){
              if(res.programs[i].rules[j].boxes[k].boxId==$stateParams.boxId){
                 $scope.program = res.programs[i];
                 $scope.rule = res.programs[i].rules[j];
                 $scope.box = res.programs[i].rules[j].boxes[k];
                 $scope.trackList = $scope.box.songList;  
                 //console.log($scope.box);        
              }
            }
          }
        }
      }
    }
  });

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

app.controller('EnvoMusicCtrl',
  ["$sce",'$scope', function ($sce, $scope) {    
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
      autoPlay: true,
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