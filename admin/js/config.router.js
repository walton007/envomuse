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
                        return $ocLazyLoad.load(['js/controllers/chart.js']);
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
              .state('customers.dash', {
                  url: '/',
                  templateUrl: 'tpl/com.envomuse/customers_dashboard.html',
                  /*resolve: {
                    deps: ['$ocLazyLoad',
                      function( $ocLazyLoad ){
                        return $ocLazyLoad.load(['js/app/envomuse.controllers.js',
                                                 'js/app/envomuse.services.js']);
                    }]
                  }*/
              })
              .state('customers.brand', {
                  url: '/list/',
                  views: {
                      '': {
                          templateUrl: 'tpl/com.envomuse/customers_list.html'
                      },
                      'footer': {
                          templateUrl: 'tpl/com.envomuse/customers_list_footer.html'
                      }
                  }
              })
              .state('customers.brand.new', {
                  url: '/brand/new',
                  parent: 'customers',
                  views: {
                      '': {
                          templateUrl: 'tpl/com.envomuse/customers_brand_new.html'
                      },
                      'footer': {
                          templateUrl: 'tpl/com.envomuse/customers_brand_new_footer.html'
                      }
                  },
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
              .state('customers.brand.edit', {
                  url: '/brand/:brandId/edit',
                  parent: 'customers',
                  views: {
                      '': {
                          templateUrl: 'tpl/com.envomuse/customers_brand_edit.html'
                      },
                      'footer': {
                          templateUrl: 'tpl/com.envomuse/customers_brand_edit_footer.html'
                      }
                  }
              })
              .state('customers.brand.detail', {
                  url: '/:brandId/detail',
                  parent: 'customers',
                  views: {
                      '': {
                          templateUrl: 'tpl/com.envomuse/customers_brand_detail.html'
                      },
                      'footer': {
                          templateUrl: 'tpl/com.envomuse/customers_brand_detail_footer.html'
                      }
                  }
              })
              .state('customers.invoice', {
                  url: '/:brandId/invoice',
                  parent: 'customers',
                  views: {
                      '': {
                          templateUrl: 'tpl/com.envomuse/customers_invoice.html'
                      },
                      'footer': {
                          templateUrl: 'tpl/com.envomuse/customers_invoice_footer.html'
                      }
                  }
              })

              .state('customers.store', {
                  url: '/:brandId/store',
                  params : {
                    brandId:null
                  },
                  views: {
                      '': {
                          templateUrl: 'tpl/com.envomuse/customers_store_list.html'
                      },
                      'footer': {
                          templateUrl: 'tpl/com.envomuse/customers_store_list_footer.html'
                      }
                  }
              })
              .state('customers.store.detail', {
                  url: '/:brandId/store/:storeId/',
                  parent: 'customers',
                  // params : {
                  //   brandId:null
                  // },
                  views: {
                      '': {
                          templateUrl: 'tpl/com.envomuse/customers_store_detail.html'
                      },
                      'footer': {
                          templateUrl: 'tpl/com.envomuse/customers_store_detail_footer.html'
                      }
                  }
              })
              .state('customers.store.add', {
                  url: '/:brandId/addStore',
                  parent: 'customers',
                  views: {
                      '': {
                          templateUrl: 'tpl/com.envomuse/customers_store_new.html'
                      },
                      'footer': {
                          templateUrl: 'tpl/com.envomuse/customers_store_new_footer.html'
                      }
                  }
              })
              .state('customers.store.edit', {
                  url: '/store/:storeId/edit',
                  params : {
                    brandId:null
                  },
                  parent: 'customers',
                  templateUrl: 'tpl/com.envomuse/customers_store_edit.html'
              })
              .state('customers.contact', {
                  url: '/:brandId/contacts',
                  views: {
                      '': {
                          templateUrl: 'tpl/com.envomuse/customers_contact_list.html'
                      },
                      'footer': {
                          templateUrl: 'tpl/com.envomuse/customers_contact_list_footer.html'
                      }
                  }
              })
              .state('customers.contact.detail', {
                  url: '/contact/:contactId/detail',
                  parent: 'customers',
                  params : {
                    brandContent:null
                  },
                  views: {
                      '': {
                          templateUrl: 'tpl/com.envomuse/customers_contact_detail.html'
                      },
                      'footer': {
                          templateUrl: 'tpl/com.envomuse/customers_contact_detail_footer.html'
                      }
                  }
              })
              .state('customers.contact.add', {
                  url: '/:brandId/addContact',
                  parent: 'customers',
                  views: {
                      '': {
                          templateUrl: 'tpl/com.envomuse/customers_contact_new.html'
                      },
                      'footer': {
                          templateUrl: 'tpl/com.envomuse/customers_contact_new_footer.html'
                      }
                  },
              })
              .state('customers.contact.edit', {
                  url: '/contact/:contactId/edit',
                  parent: 'customers',
                  params : {
                    brandContent:null
                  },
                  views: {
                      '': {
                          templateUrl: 'tpl/com.envomuse/customers_contact_edit.html'
                      },
                      'footer': {
                          templateUrl: 'tpl/com.envomuse/customers_contact_edit_footer.html'
                      }
                  }
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
              .state('jobs.dash', {
                  url: '/dash',
                  templateUrl: 'tpl/com.envomuse/jobs_dashboard.html'
              })
              .state('jobs.list', {
                  url: '/',
                  views: {
                      '': {
                          templateUrl: 'tpl/com.envomuse/jobs_list.html'
                      },
                      'footer': {
                          templateUrl: 'tpl/com.envomuse/jobs_list_footer.html'
                      }
                  }
              })
              .state('jobs.detail', {
                  url: '/:jobId/',
                  params : {
                    // jobContent:null
                  },
                  views: {
                      '': {
                          templateUrl: 'tpl/com.envomuse/jobs_detail.html'
                      },
                      'footer': {
                          templateUrl: 'tpl/com.envomuse/jobs_detail_footer.html'
                      }
                  }
              })

              .state('jobs.program', {
                  url: '/program/:programId/detail',
                  params : {
                    programContent:null,
                    jobContent:null
                  },
                  views: {
                      '': {
                          templateUrl: 'tpl/com.envomuse/jobs_program_detail.html'
                      },
                      'footer': {
                          templateUrl: 'tpl/com.envomuse/jobs_program_detail_footer.html'
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

              /*.state('jobs.rule', {
                  url: '/rule/:ruleId/detail',
                  params : {
                    ruleContent:null,
                    programContent:null,
                    jobContent:null
                  },
                  views: {
                      '': {
                          templateUrl: 'tpl/com.envomuse/jobs_rule_detail.html'
                      },
                      'footer': {
                          templateUrl: 'tpl/com.envomuse/jobs_rule_detail_footer.html'
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
              })*/
              
              .state('jobs.box', {
                  url: '/box/:boxId/',
                  templateUrl: 'tpl/com.envomuse/jobs_box_detail.html',
                  params : {
                    boxId:null,
                    programId:null,
                    jobId:null
                  },
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
                  params : {
                    playlistContent:null
                  },
                  views: {
                      '': {
                          templateUrl: 'tpl/com.envomuse/playlists_bind.html'
                      },
                      'footer': {
                          templateUrl: 'tpl/com.envomuse/playlists_bind_footer.html'
                      }
                  }
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
                  url: '/dash',
                  templateUrl: 'tpl/com.envomuse/tasks_dashboard.html'
              })
              .state('tasks.incoming', {
                  url: '/incoming',
                  views: {
                      '': {
                          templateUrl: 'tpl/com.envomuse/tasks_incoming.html'
                      },
                      'footer': {
                          templateUrl: 'tpl/com.envomuse/tasks_incoming_footer.html'
                      }
                  },
              })
              .state('tasks.finished', {
                  url: '/finished',
                  views: {
                      '': {
                          templateUrl: 'tpl/com.envomuse/tasks_ongoing.html'
                      },
                      'footer': {
                          templateUrl: 'tpl/com.envomuse/tasks_ongoing_footer.html'
                      }
                  },
              })

              
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
