/**
 * calendarDemoApp - 0.1.3
 */

app.controller('UserCalendarCtrl', ['$scope', '$stateParams', 
  function($scope, $stateParams) {  

    $scope.playlist = $scope.$parent.playlist;
  
    var date = new Date();
    var d = date.getDate();
    var m = date.getMonth();
    var y = date.getFullYear();
   
    var events = [];

    var colorBars = ['b-l b-5x b-info','b-l b-5x b-primary','b-l b-5x b-danger','b-l b-5x b-success','b-l b-5x b-warning'];
    var colorIndex = 0;

    for(var i=0,size=$scope.playlist.length;i<size;i++){
      for(var j=0,track_size=$scope.playlist[i].playlist.length;j<track_size;j++){
        var dt = $scope.playlist[i].date;
        var track = $scope.playlist[i].playlist[j];

        if(events.length>0){
          var lastEvent = events[events.length-1];

          if(lastEvent.title===track.fromBoxs[0] && lastEvent.dateString===dt){
            events[events.length-1].tracks.push(track);
            events[events.length-1].end = lastEvent.end.add(track.duration,'seconds');
          }
          else{
            if(colorIndex==4)
              colorIndex=0;
          
            var newEvent = {
              title:track.fromBoxs[0],
              start: moment(dt).add(track.exactPlayTime,'ms'),
              end: moment(dt).add(track.exactPlayTime,'ms').add(track.duration,'s'),
              allDay:false,
              tracks:[track],
              className: colorBars[colorIndex++],
              dateString:dt
            };

            events.push(newEvent);
          }
        }
        else{
          if(colorIndex==4)
            colorIndex=0;

          var newEvent = {
            title:track.fromBoxs[0],
            start: moment(dt).add(track.exactPlayTime,'ms'),
            end: moment(dt).add(track.exactPlayTime,'ms').add(track.duration,'s'),
            allDay:false,
            className: colorBars[colorIndex++],
            tracks:[track],
            dateString:dt
          };

          events.push(newEvent);
        }
      }
    }

    console.log(events);

    $scope.events = events;
  
    /* alert on dayClick */
    $scope.precision = 400;
    $scope.lastClickTime = 0;

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
        defaultView: 'agendaWeek',
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
        eventMouseover: $scope.alertOnMouseOver
      }
    };

    /* event sources array*/
    $scope.eventSources = [$scope.events];
}]);
/* EOF */
