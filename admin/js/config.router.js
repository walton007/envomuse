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

              .state('me', {
                  abstract: true,
                  url: '/me',
                  templateUrl: 'tpl/app.me.html'
              })
              .state('me.home', {
                  url: '/home',
                  // templateUrl: 'tpl/com.envomuse/userhome.html',
                  views: {
                      '': {
                          templateUrl: 'tpl/com.envomuse/userhome.html',
                      },
                      'footer': {
                          templateUrl: 'tpl/com.envomuse/userhome.footer.html'
                      }
                  },
                  resolve: {
                      deps: ['$ocLazyLoad', 'uiLoad',
                        function( $ocLazyLoad, uiLoad ){
                          return uiLoad.load(
                            JQ_CONFIG.fullcalendar.concat('js/app/calendar/calendar.me.js')
                          ).then(
                            function(){
                              return $ocLazyLoad.load(['ui.calendar',
                                              'com.2fdevs.videogular', 
                                              'com.2fdevs.videogular.plugins.controls', 
                                              'com.2fdevs.videogular.plugins.overlayplay',
                                              'com.2fdevs.videogular.plugins.poster',
                                              'com.2fdevs.videogular.plugins.buffering',
                                              'js/app/music/ctrl.js', 
                                              'js/app/music/theme.css',
                                                 'js/app/envomuse.controllers.js',
                                                 'js/app/envomuse.services.js']
                                                 );
                            }
                          )
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
                                                 'js/filters/fromNow.js',
                                                 'js/app/envomuse.select.js'])
                        .then(function(){
                              return $ocLazyLoad.load('ui.select');
                            });
                    }]
                  }
              })
              .state('channels.dash', {
                  url: '/:channelId',
                  templateUrl: 'tpl/com.envomuse/channels_dash.html'
              })
              .state('channels.detail', {
                  url: '/:channelId/detail',
                  parent:'channels',
                  templateUrl: 'tpl/com.envomuse/channels_detail.html',
                  
                  
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
              /*.state('customers.dash', {
                url: '/',
                templateUrl: 'tpl/com.envomuse/customers_dashboard.html'
              })*/
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
                  parent: 'customers',
                  templateUrl: 'tpl/com.envomuse/customers_brand_edit.html'
              })

              .state('customers.invoice', {
                  url: '/:brandId/invoice',
                  parent: 'customers',
                  templateUrl: 'tpl/com.envomuse/customers_invoice.html'
              })

              .state('customers.store', {
                  url: '/:brandId/store',
                  templateUrl: 'tpl/com.envomuse/customers_store_list.html'
              })

              .state('customers.store.add', {
                  url: '/:brandId/store/new',
                  parent: 'customers',
                  templateUrl: 'tpl/com.envomuse/customers_store_new.html'
              })

              .state('customers.store.detail', {
                  url: '/:brandId/store/:storeId/',
                  parent: 'customers',
                  templateUrl: 'tpl/com.envomuse/customers_store_detail.html'
              })
              
              .state('customers.store.edit', {
                  url: '/:brandId/store/:storeId/edit',
                  parent: 'customers',
                  templateUrl: 'tpl/com.envomuse/customers_store_edit.html'
              })

              .state('customers.contact', {
                  url: '/:brandId/contacts',
                  templateUrl: 'tpl/com.envomuse/customers_contact_list.html'
              })

              .state('customers.contact.add', {
                  url: '/:brandId/addContact',
                  parent: 'customers',
                  templateUrl: 'tpl/com.envomuse/customers_contact_new.html'
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
              .state('tasks.dash', {
                  url: '/',
                  templateUrl: 'tpl/com.envomuse/tasks_dashboard.html'
              })

              .state('tasks.incoming', {
                  url: '/incoming',
                  templateUrl: 'tpl/com.envomuse/tasks_incoming.html'
              })
              .state('tasks.running', {
                  url: '/running',
                  templateUrl: 'tpl/com.envomuse/tasks_running.html'
              })

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
/*
              .state('jobs.dash', {
                  url: '/',
                  templateUrl: 'tpl/com.envomuse/jobs_dashboard.html'
              })
*/
              .state('jobs.list', {
                  url: '/list',
                  templateUrl: 'tpl/com.envomuse/jobs_list.html'
              })

              .state('jobs.detail', {
                  url: '/:jobId/',
                  templateUrl: 'tpl/com.envomuse/jobs_detail.html'
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
              .state('playlists.dash', {
                  url: '/',
                  templateUrl: 'tpl/com.envomuse/playlists_dashboard.html'
              })
              .state('playlists.list', {
                  url: '/:linkState',
                  //templateUrl: 'tpl/com.envomuse/playlists_list.html',
                  views: {
                      '': {
                          templateUrl: 'tpl/com.envomuse/playlists_list.html'
                      },
                      'footer': {
                          templateUrl: 'tpl/com.envomuse/playlists_list_footer.html'
                      }
                  }                 
              })
              .state('playlists.detail', {
                  url: '/:playlistId/',
                  //templateUrl: 'tpl/com.envomuse/playlists_detail.html',
                  /*params : {
                    playlistContent:null
                  },*/
                  views: {
                      '': {
                          templateUrl: 'tpl/com.envomuse/playlists_detail.html'
                      },
                      'footer': {
                          templateUrl: 'tpl/com.envomuse/playlists_detail_footer.html'
                      }
                  },
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
                  /*resolve: {
                      deps: ['$ocLazyLoad',
                        function( $ocLazyLoad ){
                            return $ocLazyLoad.load('ui.calendar');
                          }]
                  }  */           
              })
              .state('playlists.dailydetail', {
                  url: '/:programId/:dailyplaylistId/',
                  //templateUrl: 'tpl/com.envomuse/playlists_detail.html',
                  /*params : {
                    dailyPlaylistContent:null,
                    playlistContent:null
                  },*/
                  //templateUrl: 'tpl/com.envomuse/playlists_daily_detail.html',
                  views: {
                      '': {
                          templateUrl: 'tpl/com.envomuse/playlists_daily_detail.html',
                      },
                      'footer': {
                          templateUrl: 'tpl/com.envomuse/playlists_daily_detail_footer.html'
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
              .state('playlists.associate', {
                  url: '/:playlistId/bind',
                  templateUrl: 'tpl/com.envomuse/playlists_bind.html'
              })

              /*//users
              .state('users', {
                abstract: true,
                  url: '/users',
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
              .state('users.list', {
                  url: '/',
                  templateUrl: 'tpl/com.envomuse/users_list.html'
              })  */  

              
              // pages
              .state('app.page', {
                  url: '/page',
                  template: '<div ui-view class="fade-in-down"></div>'
              })
              .state('app.page.profile', {
                  url: '/profile',
                  templateUrl: 'tpl/page_profile.html'
              })
              .state('app.page.post', {
                  url: '/post',
                  templateUrl: 'tpl/page_post.html'
              })
              .state('app.page.search', {
                  url: '/search',
                  templateUrl: 'tpl/page_search.html'
              })
              .state('app.page.invoice', {
                  url: '/invoice',
                  templateUrl: 'tpl/page_invoice.html'
              })
              .state('app.page.price', {
                  url: '/price',
                  templateUrl: 'tpl/page_price.html'
              })
              .state('app.docs', {
                  url: '/docs',
                  templateUrl: 'tpl/docs.html'
              })
              // others
              .state('lockme', {
                  url: '/lockme',
                  templateUrl: 'tpl/page_lockme.html'
              })
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
              .state('access.signup', {
                  url: '/signup',
                  templateUrl: 'tpl/page_signup.html',
                  resolve: {
                      deps: ['uiLoad',
                        function( uiLoad ){
                          return uiLoad.load( ['js/controllers/signup.js'] );
                      }]
                  }
              })
              .state('access.forgotpwd', {
                  url: '/forgotpwd',
                  templateUrl: 'tpl/page_forgotpwd.html'
              })
              .state('access.404', {
                  url: '/404',
                  templateUrl: 'tpl/page_404.html'
              })
              .state('access.logout', {        
                controller: function () {
                  window.location = '/logout';
                }
              })

              // fullCalendar
              .state('app.calendar', {
                  url: '/calendar',
                  templateUrl: 'tpl/app_calendar.html',
                  // use resolve to load other dependences
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

              

              .state('layout', {
                  abstract: true,
                  url: '/layout',
                  templateUrl: 'tpl/layout.html'
              })
              .state('layout.fullwidth', {
                  url: '/fullwidth',
                  views: {
                      '': {
                          templateUrl: 'tpl/layout_fullwidth.html'
                      },
                      'footer': {
                          templateUrl: 'tpl/layout_footer_fullwidth.html'
                      }
                  },
                  resolve: {
                      deps: ['uiLoad',
                        function( uiLoad ){
                          return uiLoad.load( ['js/controllers/vectormap.js'] );
                      }]
                  }
              })
              .state('layout.mobile', {
                  url: '/mobile',
                  views: {
                      '': {
                          templateUrl: 'tpl/layout_mobile.html'
                      },
                      'footer': {
                          templateUrl: 'tpl/layout_footer_mobile.html'
                      }
                  }
              })
              .state('layout.app', {
                  url: '/app',
                  views: {
                      '': {
                          templateUrl: 'tpl/layout_app.html'
                      },
                      'footer': {
                          templateUrl: 'tpl/layout_footer_fullwidth.html'
                      }
                  },
                  resolve: {
                      deps: ['uiLoad',
                        function( uiLoad ){
                          return uiLoad.load( ['js/controllers/tab.js'] );
                      }]
                  }
              })
              .state('apps', {
                  abstract: true,
                  url: '/apps',
                  templateUrl: 'tpl/layout.html'
              })
      }
    ]
  );
