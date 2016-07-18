function GalleryController($scope, $location, $http, UserService, socket) {
  $scope.user = UserService.user();


}
MyApp.directive("drawing", ['socket', function(socket) {
  return {
    restrict: "A",
    link: function(scope, element) {
      var ctx = element[0].getContext('2d');

      // variable that decides if something should be drawn on mousemove
      var drawing = false;

      // the last coordinates before the current move
      var lastX;
      var lastY;

      element.bind('mousedown', function(event) {
        if (event.offsetX !== undefined) {
          lastX = event.offsetX;
          lastY = event.offsetY;
        } else { // Firefox compatibility
          lastX = event.layerX - event.currentTarget.offsetLeft;
          lastY = event.layerY - event.currentTarget.offsetTop;
        }

        socket.emit('mousedown');

        // begins new line
        ctx.beginPath();

        drawing = true;
      });
      element.bind('mousemove', function(event) {

        if (drawing) {
          // get current mouse position
          if (event.offsetX !== undefined) {
            currentX = event.offsetX;
            currentY = event.offsetY;
          } else {
            currentX = event.layerX - event.currentTarget.offsetLeft;
            currentY = event.layerY - event.currentTarget.offsetTop;
          }

          //draw(lastX, lastY, currentX, currentY);
          socket.emit('draw_line', {
            line: [lastX, lastY, currentX, currentY]
          });

          // set current coordinates to last one
          lastX = currentX;
          lastY = currentY;

        }

      });
      element.bind('mouseup', function(event) {
        // stop drawing
        drawing = false;
        socket.emit('mouseup');
      });

      // canvas reset
      function reset() {
        element[0].width = element[0].width;
      }

      function draw(lX, lY, cX, cY) {
        // line from
        ctx.moveTo(lX, lY);
        // to
        ctx.lineTo(cX, cY);
        ctx.lineWidth = 3;
        // color
        ctx.strokeStyle = "#000";
        // draw it
        ctx.stroke();
      }

      socket.on('draw_line', function(data) {
        var line = data.line;
        draw(line[0], line[1], line[2], line[3]);
      });

    }
  };
}]);