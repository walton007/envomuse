'use strict';

/* Controllers */
  // signin controller
app.controller('SigninFormController', ['$scope', '$http', '$state', function($scope, $http, $state) {
    $scope.user = {};
    $scope.authError = null;
    $scope.login = function() {
      $scope.authError = null;
      // Try to login
      $http.post('/login', {email: $scope.user.email, password: $scope.user.password})
      .then(function(response) {
        if ( !response.data.user ) {
          $scope.authError = response.data[0].msg;
        }else{
          switch(response.data.user.roles.shift()){
            case 'customer':console.log('GO TO USER HOME');$state.go('user.home',{reload:true});break;
            case 'admin':console.log('GO TO ADMIN DASH');$state.go('app.dashboard',{reload:true});break;
            default:break;
          }
        }
      }, function(response) {
          console.log(response);
          $scope.authError = response.data[0].msg;
      });
    };
  }])
;