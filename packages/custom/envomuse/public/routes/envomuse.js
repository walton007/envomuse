'use strict';

angular.module('mean.envomuse').config(['$stateProvider',
  function($stateProvider) {
    $stateProvider.state('envomuse example page', {
      url: '/envomuse/example',
      templateUrl: 'envomuse/views/index.html'
    });
  }
]);
