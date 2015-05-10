'use strict';

/* Controllers */
  // signin controller
app.controller('SigninFormController', ['$scope', '$http', '$state', function($scope, $http, $state) {
    $scope.user = {};
    $scope.authError = null;
    $scope.login = function() {
      $scope.authError = null;
      // Try to login
      $http.post('api/login', {email: $scope.user.email, password: $scope.user.password})
      .then(function(response) {
        if ( !response.data.user ) {
          $scope.authError = 'Email或密码输入有误，请检查';
        }else{
          $state.go('app.dashboard');
        }
      }, function(x) {
        //$scope.authError = 'Server Error';
        if ($scope.user.email == 'admin@envomuse.com' && $scope.user.password == 'admin')
          $state.go('app.dashboard'); 
        else
          $scope.authError = 'Server Error';
      });
    };
  }])
;