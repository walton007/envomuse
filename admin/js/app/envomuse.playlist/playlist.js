app.controller('PlaylistListCtrl', ['$scope', 'playlists', '$stateParams', function($scope, playlists, $stateParams) {
    
    //TBD: add sort functionalities

    $scope.init = function(){
      $scope.maxSize = 5; //total buttons displayed
      $scope.bigCurrentPage = 1;  //current page
      $scope.datasource = [];


      playlists.getLength().then(function(res){
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
      $scope.status = $stateParams.linkState;

      playlists.getPage($scope.bigCurrentPage,$scope.status).then(function(res){
        $scope.datasource = res;
      });
    };

  }]);

app.controller('PlaylistDetailCtrl', ['$scope', 'playlists', '$stateParams', function($scope,playlists,$stateParams) {

  playlists.get($stateParams.playlistId).then(function(res){
    $scope.playlist = res;

    $scope.rowCollectionBasic = res.tracksByDay;
    
  });

}]);

app.controller('PlaylistDetailCtrl', ['$scope', 'playlists', '$stateParams', function($scope,playlists,$stateParams) {

  playlists.get($stateParams.playlistId).then(function(res){
    $scope.playlist = res;

    $scope.rowCollectionBasic = res.tracksByDay;
    
  });

}]);

app.controller('PlaylistBindCtrl', ['$scope', 'playlists', '$stateParams', function($scope, playlists, $stateParams) {
    
    playlists.get($stateParams.playlistId).then(function(res){
      $scope.item = res;
    });

    playlists.allBrands().then(function(res){
      $scope.brands = res;
    });

    $scope.showStores = function (){
      $scope.selectedBrandId = $scope.playlist.associatedBrandId;

      playlists.allStores($scope.selectedBrandId).then(function(res){
        $scope.selectedBrandStores = res;
        for(var i=0;i<$scope.selectedBrandStores.length;i++){
          if(i%2==0)
            $scope.selectedBrandStores[i].associatedPlaylistId = null;
        }

        console.log($scope.selectedBrandStores);
      });
    }

  }]);

/*
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
*/