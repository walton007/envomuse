'use strict';

/* jshint -W098 */
angular.module('mean.envomuse').controller('EnvomuseController', ['$scope', 'Global', 'Envomuse',
  function($scope, Global, Envomuse) {
    $scope.global = Global;
    $scope.package = {
      name: 'envomuse'
    };
  }
]);
