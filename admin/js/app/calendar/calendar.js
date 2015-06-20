/**
 * calendarDemoApp - 0.1.3
 */

app.controller('FullcalendarCtrl', ['$scope', 'ProgramById', '$stateParams', function($scope, ProgramById, $stateParams) {  

  $scope.programId = $stateParams.playlistId;
  
  var date = new Date();
    var d = date.getDate();
    var m = date.getMonth();
    var y = date.getFullYear();

   
    $scope.events = [];

    ProgramById.get({'programId':$stateParams.playlistId},
      function(res) {
        var playlist = res;

        if(playlist !==null){
          for(var i=0;i<playlist.dayPrograms.length;i++){
            var d = playlist.dayPrograms[i].date;//date string
            var e={
              id:playlist.dayPrograms[i]._id,
              title: playlist.name,
              allDay:true,
              start:new Date(d),
              //end:endMoment,
              className:['b-l b-2x b-info'],
              editable:false
              // dailyPlaylistContent:playlist.dayPrograms[i]
              // playlistContent:$scope.playlist
            };

            $scope.events.push(e);
          }
        }
      });


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
        minTime: '8:00',
        maxTime: '23:00',
        allDaySlot: false,
        height: 600,
        editable: false,
        firstDay:1,//Monday as first day
        weekNumbers:false,
        header:{
          left: 'prev',
          center: 'title',
          right: 'next'
        },
        dayClick: $scope.alertOnEventClick,
        eventDrop: $scope.alertOnDrop,
        eventResize: $scope.alertOnResize,
        eventMouseover: $scope.alertOnMouseOver
      }
    };
    
    /* Change View */
    $scope.changeView = function(view, calendar) {
      $('.calendar').fullCalendar('changeView', view);
    };

    $scope.today = function(calendar) {
      $('.calendar').fullCalendar('today');
    };

    /* event sources array*/
    $scope.eventSources = [$scope.events];
}]);
/* EOF */
