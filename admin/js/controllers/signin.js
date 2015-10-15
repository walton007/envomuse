'use strict';

/* Controllers */
  // signin controller
app.controller('SigninFormController', ['$scope', '$http', '$location', '$state', function($scope, $http, $location, $state) {
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
          switch(response.data.user.roles[0]){
            case 'customer':console.log('GO TO USER HOME');$state.go('user.home',{reload:true});break;
            case 'admin':console.log('GO TO ADMIN DASH');$state.go('app.dashboard',{reload:true});break;
            default:break;
          }
        }
      }, function(response) {
          // console.log(response);
          $scope.authError = '用户名或密码错误，请重试';
      });
    };

    $scope.login = function() {
        $http.post('/login', {
          email: $scope.user.email,
          password: $scope.user.password
        })
          .success(function(response) {
            // authentication OK
            // $scope.loginError = 0;
            // $rootScope.user = response.user;
            // $rootScope.$emit('loggedin');
            // if (response.redirect) {
            //   if (window.location.href === response.redirect) {
            //     //This is so an admin user will get full admin page
            //     window.location.reload();
            //   } else {
            //     window.location = response.redirect;
            //   }
            // } else {
            //   $location.url('/');
            // }
            // $location.url('/');
            // window.location.reload();
            // $location.url('/');
            window.location.reload();
          })
          .error(function() {
            $scope.authError = '用户名或密码错误，请重试';
          });
      };
  }])
;