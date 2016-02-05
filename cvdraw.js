// cvdraw simple canvas drawing tool
// coded by 9000 volts
// part of the js draw library
var cvdraw = function (container, width, height) {
  // This allows the omission of 'new' in constructor calls.
  if (!(this instanceof cvdraw)) return new cvdraw(container, width, height);

  // Shorthand for this.
  var t = this;

  // Shorthand for container.
  t.co = container;

  // Shorthand for canvas dimensions.
  t.w = width;
  t.h = height;

  // Positioning for child elements.
  t.co.style.position = "relative";

  // Make a canvas.
  var makeCanvas = function () {
    var cv = document.createElement("canvas");
    cv.style.position = "absolute";
    cv.style.top = "0";
    cv.style.left = "0";
    cv.width = t.w;
    cv.height = t.h;
    t.co.appendChild(cv);
    var c = cv.getContext("2d");
    return {cv: cv, c: c};
  };

  // Main canvas and context.
  var cmain = makeCanvas();
  t.cv = cmain.cv;
  t.c = cmain.c;

  // Preview canvas and context.
  var cpreview = makeCanvas();
  t.pv = cpreview.cv;
  t.p = cpreview.c;

  // The current position of the mouse button.
  t.down = 0;
  t.drawing = 0;
  t.coords = [];
  t.color = "#222";

  t.history = [];

  t.brushes = {
    squiggly: {
      stroke: function () {
        t.c.beginPath();
        t.c.moveTo(t.coords[0].x, t.coords[0].y);
        t.c.strokeStyle = t.color;
        t.c.lineCap = "round";
        t.c.lineWidth = this.o.size;
        var control = t.coords[0];
        var o = this.o;
        t.coords.forEach(function(coord) {
          t.c.quadraticCurveTo(control.x, control.y, coord.x, coord.y);
          control = {x: coord.x + o.squiggle, y: coord.y + o.squiggle};
        });
        t.c.stroke();
      },
      o: {
        size: 3,
        squiggle: 10
      }
    },
    line: {
      stroke: function () {
        t.c.beginPath();
        t.c.moveTo(t.coords[0].x, t.coords[0].y);
        t.c.strokeStyle = t.color;
        t.c.lineCap = "round";
        t.c.lineWidth = this.o.size;
        var o = this.o;
        t.coords.forEach(function(coord) {
          t.c.lineTo(coord.x, coord.y);
        });
        t.c.stroke();
      },
      o: {
        size: 3
      }
    },
    dots: {
      stroke: function () {
        t.c.beginPath();
        t.c.moveTo(t.coords[0].x, t.coords[0].y);
        t.c.fillStyle = t.color;
        var o = this.o;
        t.coords.forEach(function(coord) {
          t.c.fillRect(Math.floor(coord.x - (o.size / 2)), Math.floor(coord.y - (o.size / 2)), o.size, o.size);
        });
        t.c.stroke();
      },
      o: {
        size: 1
      }
    }
  };

  t.useBrush = function (brush) {
    t.brush = brush;
  };

  // Get the canvas position of a mouse event.
  t.pos = function (e) {
    var rect = t.cv.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  };
  // Is the mouse event even on the canvas?
  t.onCanvas = function (e) {
    var p = t.pos(e);
    return (p.x >= 0 && p.y >= 0 && p.x <= t.w && p.y <= t.h);
  };

  t.undo = function () {
    if (t.history.length) {
      var i = new Image();
      i.src = t.history.pop();
      t.c.clearRect(0, 0, t.w, t.h);
      t.c.drawImage(i, 0, 0);
    }
  };

  // Finalize a drawn stroke onto the screen.
  t.finalizeStroke = function () {
    if (t.drawing) {
      t.drawing = 0;
      t.history.push(t.cv.toDataURL("image/png"));
      t.p.clearRect(0, 0, t.w, t.h);
      t.brush.stroke();
    }
  };

  t.mouseMove = function (e) {
    if (t.down && t.onCanvas(e)) {
      var p = t.pos(e);
      if (!t.drawing) {
        t.drawing = 1;
        t.coords = [];
        t.p.beginPath();
        t.p.moveTo(p.x, p.y);
        t.p.strokeStyle = "#555";
        t.p.lineCap = "round";
        t.p.lineWidth = 0.1;
      }
      t.p.lineTo(p.x, p.y);
      t.coords.push(p);
      t.p.stroke();
    } else t.finalizeStroke();
  };

  // Keep track of the mouse status across the whole page.
  window.addEventListener("mousedown", function (e) {
    t.down = 1;
    t.mouseMove(e);
  });
  window.addEventListener("mouseup", function (e) {
    t.down = 0;
    t.finalizeStroke();
  });
  window.addEventListener("mousemove", t.mouseMove);

  t.useBrush(t.brushes.dots);
};
