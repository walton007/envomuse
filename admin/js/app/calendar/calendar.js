/**
 * calendarDemoApp - 0.1.3
 */

app.controller('FullcalendarCtrl', ['$scope', '$stateParams', function($scope, $stateParams) {  

    $scope.playlist = $stateParams.playlistContent;
    //console.log($stateParams.playlist);

    $scope.events = [];

    var date = new Date();
    var d = date.getDate();
    var m = date.getMonth();
    var y = date.getFullYear();

    //will not show track list, only caulculates from start to end time
    if($scope.playlist !==null){
      for(var i=0;i<$scope.playlist.dayPrograms.length;i++){
        
          var d = $scope.playlist.dayPrograms[i].displayDate;//date string
          
          //console.log(end);
          //console.log(nd);
          var e={
            id:$scope.playlist.dayPrograms[i]._id,
            title: $scope.playlist.dayPrograms[i].displayDate,
            allDay:true,
            start:new Date(d),
            //end:endMoment,
            className:['b-l b-2x b-info'],
            editable:false,
            dailyPlaylistContent:$scope.playlist.dayPrograms[i],
            playlistContent:$scope.playlist
          };
          //console.log(e);

          $scope.events.push(e);
      }
    }

    //parse playlist into events -> high load, change to display program name instead
   /* if($scope.playlist !==null){
      for(var i=0;i<$scope.playlist.dayPrograms.length;i++){
        for(var j=0;j<$scope.playlist.dayPrograms[i].playlist.length;j++){
          var d = $scope.playlist.dayPrograms[i].displayDate +' '+ $scope.playlist.dayPrograms[i].playlist[j].displayTm ;//date string
          var endMoment = moment(new Date(d)).add(300, 'seconds');
          //console.log(end);
          //console.log(nd);
          var e={
            title: i+' '+j,
            allDay:false,
            start:new Date(d),
            end:endMoment,
            className:['b-l b-2x b-info'],
            editable:false
          };
          //console.log(e);

          $scope.events.push(e);
        }
      }
    }*/

    /* alert on dayClick */
    $scope.precision = 400;
    $scope.lastClickTime = 0;
    /*$scope.alertOnEventClick = function( date, jsEvent, view ){
      var time = new Date().getTime();
      if(time - $scope.lastClickTime <= $scope.precision){
          $scope.events.push({
            title: 'New Event',
            start: date,
            className: ['b-l b-2x b-info']
          });
      }
      $scope.lastClickTime = time;
    };*/
    /* alert on Drop */
    /*$scope.alertOnDrop = function(event, delta, revertFunc, jsEvent, ui, view){
       $scope.alertMessage = ('Event Droped to make dayDelta ' + delta);
    };*/
    /* alert on Resize */
    /*$scope.alertOnResize = function(event, delta, revertFunc, jsEvent, ui, view){
       $scope.alertMessage = ('Event Resized to make dayDelta ' + delta);
    };*/

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
        height: 400,
        firstDay:1,//Monday as first day
        weekNumbers:true,
        editable: false,
        header:{
          left: 'prev',
          center: 'title',
          right: 'next'
        },
        //dayClick: $scope.alertOnEventClick,
        //eventDrop: $scope.alertOnDrop,
        //eventResize: $scope.alertOnResize,
        eventMouseover: $scope.alertOnMouseOver
      }
    };
    
    // /* add custom event*/
    // $scope.addEvent = function() {
    //   $scope.events.push({
    //     title: 'New Event',
    //     start: new Date(y, m, d),
    //     className: ['b-l b-2x b-info']
    //   });
    // };

    // /* remove event */
    // $scope.remove = function(index) {
    //   $scope.events.splice(index,1);
    // };

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
