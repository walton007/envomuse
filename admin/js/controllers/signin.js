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
          $state.go('app.dashboard');
        }
      }, function(response) {
          console.log(response);
          $scope.authError = response.data[0].msg;
      });
    };
  }])
;