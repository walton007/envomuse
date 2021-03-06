'use strict';

/**
 * Config for the router
 */
angular.module('app')
  .run(
    [          '$rootScope', '$state', '$stateParams',
      function ($rootScope,   $state,   $stateParams) {
          $rootScope.$state = $state;
          $rootScope.$stateParams = $stateParams;
      }
    ]
  )
  .config(
    [          '$stateProvider', '$urlRouterProvider', 'JQ_CONFIG', 
      function ($stateProvider,   $urlRouterProvider, JQ_CONFIG) {

        console.log('==== 1');
        function defineAdminState() {
          console.log('defineAdminState');
          $urlRouterProvider
              .otherwise('/app/dashboard');
          $stateProvider
              .state('app', {
                  abstract: true,
                  url: '/app',
                  templateUrl: 'tpl/app.html'
              })
              .state('app.dashboard', {
                  url: '/dashboard',
                  templateUrl: 'tpl/app_dashboard.html',
                  resolve: {
                    deps: ['$ocLazyLoad',
                      function( $ocLazyLoad ){
                        return $ocLazyLoad.load(['js/app/envomuse.controllers.js',
                                                 'js/app/envomuse.services.js',
                                                 'js/controllers/chart.js']);
                    }]
                  }
              })
              //channels
              .state('channels', {
                  abstract: true,
                  url: '/channels',
                  //templateUrl: 'tpl/layout.html',
                  templateUrl: 'tpl/app.html',
                  resolve: {
                    deps: ['$ocLazyLoad','uiLoad',
                      function( $ocLazyLoad,uiLoad ){
                        return $ocLazyLoad.load(['js/app/envomuse.controllers.js',
                                                 'js/app/envomuse.services.js',
                                                 'js/filters/fromNow.js'])
                        .then(function(){
                              return $ocLazyLoad.load('ui.select');
                            });
                    }]
                  }
              })
              .state('channels.dash', {
                  url: '',
                  templateUrl: 'tpl/com.envomuse/channels_dash.html'
              })
              .state('channels.detail', {
                  url: '/:brandId/:channelId/:channelName/detail/',
                  parent:'channels.dash',
                  templateUrl: 'tpl/com.envomuse/channels_detail.html',
              })
              .state('channels.detail.program', {
                  url: '/:brandId/:channelId/program',
                  parent:'channels.dash',
                  params:{
                    programArr:null,
                    brand:null
                  },
                  templateUrl: 'tpl/com.envomuse/programs_detail.html',
                  resolve: {
                      deps: ['$ocLazyLoad', 'uiLoad',
                        function( $ocLazyLoad, uiLoad ){
                          return uiLoad.load(
                            JQ_CONFIG.fullcalendar.concat('js/app/calendar/calendar.js')
                          ).then(
                            function(){
                              return $ocLazyLoad.load('ui.calendar');
                            }
                          )
                      }]
                  }    
              })
              .state('channels.detail.program.dailydetail', {
                  url: '/:brandId/:channelId/program/:programId/detail',
                  parent:'channels.dash',
                  params:{
                    brand:null
                  },
                  views: {
                      '': {
                          templateUrl: 'tpl/com.envomuse/programs_daily_detail.html',
                      },
                      'footer': {
                          templateUrl: 'tpl/com.envomuse/programs_daily_detail_footer.html'
                      }
                  }, 
                  resolve: {
                      deps: ['$ocLazyLoad',
                        function( $ocLazyLoad){
                          return $ocLazyLoad.load([
                                              'com.2fdevs.videogular', 
                                              'com.2fdevs.videogular.plugins.controls', 
                                              'com.2fdevs.videogular.plugins.overlayplay',
                                              'com.2fdevs.videogular.plugins.poster',
                                              'com.2fdevs.videogular.plugins.buffering',
                                              'js/app/music/ctrl.js', 
                                              'js/app/music/theme.css'
                                              ]);
                      }]
                  }

              })

              //customer
              .state('customers', {
                  abstract: true,
                  url: '/customers',
                  //templateUrl: 'tpl/layout.html',
                  templateUrl: 'tpl/app.html',
                  resolve: {
                    deps: ['$ocLazyLoad',
                      function( $ocLazyLoad ){
                        return $ocLazyLoad.load(['js/app/envomuse.controllers.js',
                                                 'js/app/envomuse.services.js',
                                                 'js/filters/fromNow.js']);
                    }]
                  }
              })
              .state('customers.brand', {
                  url: '/list/',
                  templateUrl: 'tpl/com.envomuse/customers_list.html'
              })
              
              .state('customers.brand.new', {
                  url: '/add',
                  parent: 'customers',
                  templateUrl: 'tpl/com.envomuse/customers_brand_new.html',
                  resolve: {
                      deps: ['$ocLazyLoad',
                        function( $ocLazyLoad){
                          return $ocLazyLoad.load('ngImgCrop').then(
                              function(){
                                 return $ocLazyLoad.load('js/controllers/imgcrop.js');
                              }
                          );
                      }]
                  }
              })
              .state('customers.brand.detail', {
                  url: '/:brandId/detail',
                  parent: 'customers',
                  params:{
                    'partial':'store',
                    'storeId':null
                  },
                  templateUrl: 'tpl/com.envomuse/customers_brand_detail.html'
              })
              .state('customers.brand.edit', {
                  url: '/:brandId/edit',
                  parent: 'customers.brand.detail',
                  templateUrl: 'tpl/com.envomuse/customers_brand_edit.html'
              })

              .state('customers.invoice', {
                  url: '/:brandId/invoice',
                  parent: 'customers.brand.detail',
                  templateUrl: 'tpl/com.envomuse/customers_invoice.html'
              })

              .state('customers.store', {
                  url: '/:brandId/store',
                  parent: 'customers.brand.detail',
                  templateUrl: 'tpl/com.envomuse/customers_store_list.html'
              })

              .state('customers.store.add', {
                  url: '/:brandId/store/new',
                  parent: 'customers.brand.detail',
                  templateUrl: 'tpl/com.envomuse/customers_store_new.html'
              })

              .state('customers.store.detail', {
                  url: '/:brandId/store/:storeId/',
                  parent: 'customers.brand.detail',
                  templateUrl: 'tpl/com.envomuse/customers_store_detail.html'
              })
              
              .state('customers.store.edit', {
                  url: '/:brandId/store/:storeId/edit',
                  parent: 'customers.brand.detail',
                  templateUrl: 'tpl/com.envomuse/customers_store_edit.html'
              })

              .state('customers.contact', {
                  parent: 'customers.brand.detail',
                  url: '/:brandId/contacts',
                  templateUrl: 'tpl/com.envomuse/customers_contact_list.html'
              })

              .state('customers.contact.add', {
                  url: '/:brandId/addContact',
                  parent: 'customers.brand.detail',
                  templateUrl: 'tpl/com.envomuse/customers_contact_new.html'
              })

              .state('customers.channel', {
                  url: '/:brandId/channel',
                  parent: 'customers.brand.detail',
                  templateUrl: 'tpl/com.envomuse/customers_channel_list.html'
              })

              .state('customers.channel.add', {
                  url: '/:brandId/channel/new',
                  parent: 'customers.brand.detail',
                  templateUrl: 'tpl/com.envomuse/customers_channel_new.html'
              })

              .state('customers.brand.detail.setmanager', {
                  url: '/:brandId/setmanager',
                  parent: 'customers.brand.detail',
                  templateUrl: 'tpl/com.envomuse/customers_brand_manager.html'
              })
            
              //tasks
              .state('tasks', {
                  abstract: true,
                  url: '/tasks',
                  // templateUrl: 'tpl/layout.html',
                  templateUrl: 'tpl/app.html',
                  resolve: {
                    deps: ['$ocLazyLoad',
                      function( $ocLazyLoad ){
                        return $ocLazyLoad.load(['js/app/envomuse.controllers.js',
                                                 'js/app/envomuse.services.js']);
                    }]
                  }
              })

              .state('tasks.incoming', {
                  url: '/incoming',
                  templateUrl: 'tpl/com.envomuse/tasks_incoming.html'
              })
              /*.state('tasks.running', {
                  url: '/running',
                  templateUrl: 'tpl/com.envomuse/tasks_running.html'
              })*/

              //jobs
              .state('jobs', {
                  abstract: true,
                  url: '/jobs',
                  // templateUrl: 'tpl/layout.html',
                  templateUrl: 'tpl/app.html',
                  resolve: {
                    deps: ['$ocLazyLoad',
                      function( $ocLazyLoad ){
                        return $ocLazyLoad.load(['js/app/envomuse.controllers.js',
                                                 'js/app/envomuse.services.js']);
                    }]
                  }
              })

              .state('jobs.list', {
                  url: '/list',
                  templateUrl: 'tpl/com.envomuse/jobs_list.html'
              })

              .state('jobs.detail', {
                  url: '/:jobId/',
                  templateUrl: 'tpl/com.envomuse/jobs_detail.html',
                  resolve: {
                      deps: ['$ocLazyLoad', 'uiLoad',
                        function( $ocLazyLoad ){
                          return $ocLazyLoad.load([
                                          'js/app/timeline/timestack.css',
                                          'js/app/timeline/timestack.min.js']
                                         );
                  }]
                }
              })
              
              .state('jobs.box', {
                  url: '/:jobId/box/:boxId/',
                  templateUrl: 'tpl/com.envomuse/jobs_box_detail.html',
                  views: {
                      '': {
                          templateUrl: 'tpl/com.envomuse/jobs_box_detail.html'
                      },
                      'footer': {
                          templateUrl: 'tpl/com.envomuse/jobs_box_detail_footer.html'
                      }
                  },
                  resolve: {
                      deps: ['$ocLazyLoad',
                        function( $ocLazyLoad){
                          return $ocLazyLoad.load([
                                              'com.2fdevs.videogular', 
                                              'com.2fdevs.videogular.plugins.controls', 
                                              'com.2fdevs.videogular.plugins.overlayplay',
                                              'com.2fdevs.videogular.plugins.poster',
                                              'com.2fdevs.videogular.plugins.buffering',
                                              'js/app/music/ctrl.js', 
                                              'js/app/music/theme.css'
                                              ]);
                      }]
                  }
             })

              //playlists
              .state('playlists', {
                  abstract: true,
                  url: '/playlists',
                  // templateUrl: 'tpl/layout.html',
                  templateUrl: 'tpl/app.html',
                  resolve: {
                    deps: ['$ocLazyLoad',
                      function( $ocLazyLoad ){
                        return $ocLazyLoad.load(['js/app/envomuse.controllers.js',
                                                 'js/app/envomuse.services.js']);
                    }]
                  }
              })
              
              // pages
              // others
              .state('access', {
                  url: '/access',
                  template: '<div ui-view class="fade-in-right-big smooth"></div>'
              })
              // .state('access.signin', {
              //     url: '/signin',
              //     templateUrl: 'tpl/page_signin.html',
              //     resolve: {
              //         deps: ['uiLoad',
              //           function( uiLoad ){
              //             return uiLoad.load( ['js/controllers/signin.js'] );
              //         }]
              //     }
              // })
              .state('access.logout', {        
                controller: function () {
                  window.location = '/logout';
                }
              })

        };

        function defineCustomerState() {
          console.log('defineCustomerState');
          $urlRouterProvider
              .otherwise('/u/home');
          $stateProvider
          .state('user', {
                  abstract: true,
                  url: '/u',
                  templateUrl: 'tpl/app_user.html',
                  resolve: {
                    deps: ['$ocLazyLoad',
                      function( $ocLazyLoad ){
                        return $ocLazyLoad.load(['js/app/envomuse.controllers.js',
                                                 'js/app/envomuse.services.js']);
                    }]
                  }
              })
              .state('user.home', {
                  url: '/home',
                  templateUrl: 'tpl/com.envomuse/user_home.html',
                  resolve: {
                      deps: ['$ocLazyLoad', 'uiLoad',
                        function( $ocLazyLoad, uiLoad ){
                          return uiLoad.load(
                            JQ_CONFIG.fullcalendar.concat('js/app/calendar/calendar.user.js')
                          ).then(
                            function(){
                              return $ocLazyLoad.load(['ui.calendar',
                                              'com.2fdevs.videogular', 
                                              'com.2fdevs.videogular.plugins.controls', 
                                              'com.2fdevs.videogular.plugins.overlayplay',
                                              'com.2fdevs.videogular.plugins.poster',
                                              'com.2fdevs.videogular.plugins.buffering',
                                              'js/app/music/useradmin_ctrl.js', 
                                              'js/app/music/theme.css']
                                             );
                            }
                          )
                      }]
                  }
              })
              .state('user.sites', {
                  url: '/sites',
                  templateUrl: 'tpl/com.envomuse/user_sites.html'
              })
              .state('access', {
                  url: '/access',
                  template: '<div ui-view class="fade-in-right-big smooth"></div>'
              })
              // .state('access.signin', {
              //     url: '/signin',
              //     templateUrl: 'tpl/page_signin.html',
              //     resolve: {
              //         deps: ['uiLoad',
              //           function( uiLoad ){
              //             return uiLoad.load( ['js/controllers/signin.js'] );
              //         }]
              //     }
              // })
              .state('access.logout', {        
                controller: function () {
                  window.location = '/logout';
                }
              })

        };

        function defineAnoymousState() {
          console.log('defineAnoymousState');
          // others
          $urlRouterProvider
              .otherwise('/access/signin');
          $stateProvider
          .state('access', {
              url: '/access',
              template: '<div ui-view class="fade-in-right-big smooth"></div>'
          })
          .state('access.signin', {
              url: '/signin',
              templateUrl: 'tpl/page_signin.html',
              resolve: {
                  deps: ['uiLoad',
                    function( uiLoad ){
                      return uiLoad.load( ['js/controllers/signin.js'] );
                  }]
              }
          })
          .state('access.logout', {        
            controller: function () {
              window.location = '/logout';
            }
          })

        };

        if (window.isAdmin) {
            defineAdminState();
          } else if (window.myInfo.sites) {
            defineCustomerState();
          } else {
            defineAnoymousState();
          }
      }
    ]
  );
