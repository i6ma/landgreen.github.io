/* window.onresize = function(event) {
  ctx.canvas.width = 500;//window.innerWidth;
  ctx.canvas.height = 500;window.innerHeight;
  settings = {
    x: window.innerWidth * 0.5,
    y: window.innerHeight * 0.5,
  }
}; */
function vectorDiagram() {
  var canvas = document.getElementById("myCanvas");
  var ctx = canvas.getContext("2d");
  //find the width of the parent node and set the canvas to that wdith
  ctx.font = '15px Arial';

  var settings = {
    x: canvas.width * 0.5,
    y: canvas.height * 0.5,
  }

  var vector = {
    x: 0,
    y: 0,
    angle: 0,
    mag: 0,
  }

  var mousePos = {
    x: canvas.width * 0.75,
    y: canvas.height * 0.25
  };

  //gets mouse position
  function getMousePos(canvas, evt) {
    var rect = canvas.getBoundingClientRect();
    return {
      x: evt.clientX - rect.left,
      y: evt.clientY - rect.top
    };
  }
  // waits for mouse move and then updates position
  canvas.addEventListener('mousemove', function(evt) {
    mousePos = getMousePos(canvas, evt);
    cycle();
  }, false);

  function cycle() {
    //set new values
    vector.x = mousePos.x - settings.x;
    vector.y = mousePos.y - settings.y;
    vector.mag = Math.sqrt((vector.x * vector.x) + (vector.y * vector.y))
    vector.angle = (2 * Math.PI + Math.atan2(settings.y - mousePos.y, mousePos.x - settings.x)) % (2 * Math.PI);
    //clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    //right angle mark
    if (Math.abs(vector.x) > 50 && Math.abs(vector.y) > 50) {
      var xOff = vector.x > 0 ? -20 : 20;
      var yOff = vector.y > 0 ? 20 : -20;;
      ctx.beginPath();
      ctx.moveTo(settings.x + vector.x + xOff, settings.y);
      ctx.lineTo(settings.x + vector.x + xOff, settings.y + yOff);
      ctx.lineTo(settings.x + vector.x, settings.y + yOff);
      ctx.strokeStyle = "grey";
      ctx.stroke();
    }
    //x and y components
    ctx.beginPath();
    ctx.moveTo(settings.x, settings.y);
    ctx.lineTo(mousePos.x, settings.y);
    ctx.strokeStyle = "darkgreen";
	ctx.setLineDash([6, 4]);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(mousePos.x, settings.y);
    ctx.lineTo(mousePos.x, mousePos.y);
    ctx.strokeStyle = "blue";
    ctx.stroke();
	ctx.setLineDash([]);
    //hypotenus
    ctx.beginPath();
    ctx.moveTo(mousePos.x, mousePos.y);
    ctx.lineTo(settings.x, settings.y);
    ctx.strokeStyle = "black";
    ctx.stroke();
    //angle
    if (Math.abs(vector.mag > 50)) {
      ctx.beginPath();
      ctx.arc(settings.x, settings.y, 20, -vector.angle, 0);
      ctx.stroke();
    }
    //data
    ctx.fillStyle = "black";
    if (Math.abs(vector.mag) > 50) {
      ctx.save();
      ctx.translate(settings.x, settings.y);
      ctx.rotate(-vector.angle);
      ctx.translate(vector.mag * 0.5, 0);
      if (vector.angle > Math.PI/2 && vector.angle < 3*Math.PI/2) {
        ctx.rotate(Math.PI);
      }
      ctx.fillText(vector.mag.toFixed(0), 0, 0);
      ctx.restore();
    }
    ctx.fillText('mag = ' + vector.mag.toFixed(0), 5, 25);
    ctx.fillText('θ = ' + (vector.angle * 180 / Math.PI).toFixed(0), 5, 50);
    ctx.fillStyle = "darkgreen";
    if (Math.abs(vector.x) > 50) {
      ctx.fillText(vector.x.toFixed(0), settings.x + vector.x * 0.5, settings.y);
    }
    ctx.fillText('x = mag cos(θ)', 5, 100);
    ctx.fillText('x = '+vector.mag.toFixed(0)+'cos('+(vector.angle * 180 / Math.PI).toFixed(0)+')', 5, 125);
    ctx.fillText('x = ' + vector.x.toFixed(0), 5, 150);
    ctx.fillStyle = "blue";
    if (Math.abs(vector.y) > 50) {
      ctx.fillText(-vector.y.toFixed(0), settings.x + vector.x, settings.y + vector.y * 0.5);
    }
    ctx.fillText('y = mag sin(θ)', 5, 200);
    ctx.fillText('y = '+vector.mag.toFixed(0)+'sin('+(vector.angle * 180 / Math.PI).toFixed(0)+')', 5, 225);
    ctx.fillText('y = ' + -vector.y.toFixed(0), 5, 250);
  }
  cycle()
}
