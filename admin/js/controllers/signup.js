'use strict';

// signup controller
app.controller('SignupFormController', ['$scope', '$http', '$state', function($scope, $http, $state) {
    $scope.user = {};
    $scope.authError = null;
    $scope.signup = function() {
      $scope.authError = null;
      // Try to create
      $http.post('/register', {username: $scope.user.name, name: $scope.user.name, email: $scope.user.email, password: $scope.user.password, confirmPassword:$scope.user.confirmPassword})
      .then(function(response) {
        if ( !response.data.user ) {
          $scope.authError = response.data[0].msg;
        }else{
          $state.go('app.dashboard');
        }
      }, function(response) {
        $scope.authError = response.data[0].msg;
      });
    };
  }])
 ;