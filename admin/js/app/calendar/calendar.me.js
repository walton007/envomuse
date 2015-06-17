/**
 * calendarDemoApp - 0.1.3
 */

app.controller('FullMecalendarCtrl', ['$scope', 'ProgramById', '$stateParams', function($scope, ProgramById, $stateParams) {  

  $scope.programId = $stateParams.playlistId;
  
  var date = new Date();
    var d = date.getDate();
    var m = date.getMonth();
    var y = date.getFullYear();

   
    $scope.events = [];

    $scope.events = [
      {title:'轻松早晨', start: new Date(y, m, d - 1, 8, 0), end: new Date(y, m, d - 1, 11, 59), allDay: false, className: ['b-l b-2x b-info'], location:'Tokyo', info:'Tokyo Game Racing'},
      {title:'温情提示', start: new Date(y, m, d - 1, 12, 0), end: new Date(y, m, d - 1, 12, 1), allDay: false,className: ['b-l b-2x b-danger']},
      {title:'舒适午间', start: new Date(y, m, d - 1, 12, 2), end: new Date(y, m, d - 1, 14, 0), allDay: false,className: ['b-l b-2x b-success'], location:'Tokyo', info:'Tokyo Game Racing'},
      {title:'青春下午', start: new Date(y, m, d - 1, 14, 0), end: new Date(y, m, d - 1, 18, 0), allDay: false,className: ['b-l b-2x b-primary'], location:'Tokyo', info:'Tokyo Game Racing'},
      {title:'激情晚上', start: new Date(y, m, d - 1, 18, 0), end: new Date(y, m, d - 1, 22, 0), allDay: false,className: ['b-l b-2x b-danger'], location:'Tokyo', info:'Tokyo Game Racing'},
      {title:'爵士心情', start: new Date(y, m, d, 8, 0), end: new Date(y, m, d, 18, 0), allDay: false, className: ['b-l b-2x b-success'], location:'Tokyo', info:'Tokyo Game Racing'},
      {title:'浓情夏日', start: new Date(y, m, d, 18, 0), end: new Date(y, m, d, 22, 0), allDay: false,className: ['b-l b-2x b-warning'], location:'Tokyo', info:'Tokyo Game Racing'},
    ];


    /* alert on dayClick */
    $scope.precision = 400;
    $scope.lastClickTime = 0;
    
    /* alert on Drop */
    $scope.alertOnDrop = function(event, delta, revertFunc, jsEvent, ui, view){
       $scope.alertMessage = ('Event Droped to make dayDelta ' + delta);
    };
    /* alert on Resize */
    $scope.alertOnResize = function(event, delta, revertFunc, jsEvent, ui, view){
       $scope.alertMessage = ('Event Resized to make dayDelta ' + delta);
    };

    $scope.overlay = $('.fc-overlay');
    $scope.alertOnMouseOver = function( event, jsEvent, view ){
      $scope.event = event;
      $scope.overlay.removeClass('left right top').find('.arrow').removeClass('left right top pull-up');
      var wrap = $(jsEvent.target).closest('.fc-event');
      var cal = wrap.closest('.calendar');
      var left = wrap.offset().left - cal.offset().left;
      var right = cal.width() - (wrap.offset().left - cal.offset().left + wrap.width());
      var top = cal.height() - (wrap.offset().top - cal.offset().top + wrap.height());
      if( right > $scope.overlay.width() ) { 
        $scope.overlay.addClass('left').find('.arrow').addClass('left pull-up')
      }else if ( left > $scope.overlay.width() ) {
        $scope.overlay.addClass('right').find('.arrow').addClass('right pull-up');
      }else{
        $scope.overlay.find('.arrow').addClass('top');
      }
      if( top < $scope.overlay.height() ) { 
        $scope.overlay.addClass('top').find('.arrow').removeClass('pull-up').addClass('pull-down')
      }
      (wrap.find('.fc-overlay').length == 0) && wrap.append( $scope.overlay );
    }

    /* config object */
    $scope.uiConfig = {
      calendar:{
        minTime: '6:00',
        maxTime: '23:00',
        allDaySlot: false,
        defaultView: 'agendaWeek',
        height: 400,
        editable: false,
        firstDay:1,//Monday as first day
        weekNumbers:false,
        header:{
          left: 'prev',
          center: 'title',
          right: 'next'
        },
        dayClick: $scope.alertOnEventClick,
        eventMouseover: $scope.alertOnMouseOver
      }
    };

    /* event sources array*/
    $scope.eventSources = [$scope.events];
}]);
/* EOF */
