/*=================================================================
  Filename: Cango2D-1v00.js
  By: A.R.Collins

  A 2D grpahics library for the canvas element designed for simple
  animated applications.

  Kindly give credit to Dr A R Collins <http://www.arc.id.au/>
  Report bugs to tony at arc.id.au

  Date   |Description                                          |By
  -----------------------------------------------------------------
  12Sep13 Version 1.00 release, from Rev 0v86                   ARC
  =================================================================*/

  // exposed globals
  var Cango2D, Drag2D, Tweener,
      svgToCgo2D, // SVG path data string conversion utility function
      shapes2D,   // predefined geometric shapes in Cgo2D format
      _resized,   // keep track of which canvases are initialised
      _buf,       // each screen canvas will have an off-screen buffer
      _draggable, // array of Obj2Ds that are draggable for each canvas
      _overlays;  // array of overlays for each canvas


(function()
{
  /*-----------------------------------------------------------------------------------------
   * http://paulirish.com/2011/requestanimationframe-for-smart-animating/
   * http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating
   * requestAnimationFrame polyfill by Erik Möller
   * fixes from Paul Irish and Tino Zijdel
   *----------------------------------------------------------------------------------------*/
  var lastTime = 0,
      vendors = ['webkit', 'moz'],
      x;
  for(x = 0; x < vendors.length && !window.requestAnimationFrame; ++x)
  {
    window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
    window.cancelAnimationFrame =
      window[vendors[x]+'CancelAnimationFrame'] || window[vendors[x]+'CancelRequestAnimationFrame'];
  }

  if (!window.requestAnimationFrame)
  {
    window.requestAnimationFrame = function(callback)
    {
      var currTime = new Date().getTime();
      var timeToCall = Math.max(0, 16 - (currTime - lastTime));
      var id = window.setTimeout(function(){callback(currTime + timeToCall);}, timeToCall);
      lastTime = currTime + timeToCall;
      return id;
    };
  }

  if (!window.cancelAnimationFrame)
  {
    window.cancelAnimationFrame = function(id) {clearTimeout(id);};
  }
}());

/*-----------------------------------------------------------------------------------------*/

(function()
{
  "use strict";

  var uniqueVal = 0;    // used to generate unique value for different Cango instances

  if (!Date.now)
  {
    Date.now = function now()
    {
      return new Date().getTime();
    };
  }

  var isArray = function(obj)
  {
    return Object.prototype.toString.call(obj) === '[object Array]';
  };

  var isNumber = function(o)
  {
    return !isNaN(o) && o !== null && o !== "" && o !== false;
  };

  // simple add event handler that has the handlers called in the sequence that they were set
  var addLoadEvent = function(obj, func)
  {
  	var oldonload = obj.onload;

  	if (typeof(obj.onload) != "function")
    {
      obj.onload = func;
    }
  	else
    {
    	obj.onload = function(){ oldonload(); func(); };
    }
  };

  var addEvent = function(element, eventType, handler)
  {
    if (element.attachEvent)
    {
     return element.attachEvent('on'+eventType, handler);
    }
    return element.addEventListener(eventType, handler, false);
  };

  var removeEvent = function(element, eventType, handler)
  {
   if (element.removeEventListener)
   {
      element.removeEventListener (eventType, handler, false);
   }
   if (element.detachEvent)
   {
      element.detachEvent ('on'+eventType, handler);
   }
  };

  if (!Array.prototype.contains)
  {
    Array.prototype.contains = function(obj)
    {
      var i = this.length;
      while (i--)
      {
        if (this[i] === obj)
        {
          return true;
        }
      }
      return false;
    };
  }

  if (!Array.prototype.indexOf)
  {
    Array.prototype.indexOf= function(find, i /*opt*/)
    {
      var n;
      if (i===undefined)
      {
        i= 0;
      }
      if (i<0)
      {
        i+= this.length;
      }
      if (i<0)
      {
        i= 0;
      }
      for (n = this.length; i < n; i++)
      {
        if (this[i] && this[i]===find)
        {
          return i;
        }
      }
      return -1;
    };
  }

  if (!Array.prototype.map)
  {
    Array.prototype.map = function(fun, thisArg)
    {
      var i;
      var len = this.length;
      if (typeof fun != "function")
      {
        throw new TypeError();
      }
      var res = [];
      var thisp = thisArg;
      for (i = 0; i < len; i++)
      {
        if (this.hasOwnProperty(i))
        {
          res[i] = fun.call(thisp, this[i], i, this);
        }
      }
      return res;
    };
  }

  if (typeof _resized != "object")
  {
     _resized = {};   // keep track of which canvases are initialised
  }

  if (typeof _buf != "object")
  {
     _buf = {};       // keep track of which canvases are buffered
  }

  if (typeof _draggable != "object")
  {
     _draggable = {};   // keep track of draggable objects on each canvas
  }

  if (typeof _overlays != "object")
  {
     _overlays = {};   // keep track of overlays on each canvas
  }

  if (shapes2D === undefined)
  {
    shapes2D = {'circle':  ["M", -0.5,0,
                            "C", -0.5, -0.27614, -0.27614, -0.5, 0, -0.5,
                            "C", 0.27614, -0.5, 0.5, -0.27614, 0.5, 0,
                            "C", 0.5, 0.27614, 0.27614, 0.5, 0, 0.5,
                            "C", -0.27614, 0.5, -0.5, 0.27614, -0.5, 0],
                'square':  ['M', 0.5, -0.5, 'l', 0, 1, -1, 0, 0, -1, 'z'],
                'triangle':['M', 0.5, -0.289, 'l', -0.5, 0.866, -0.5, -0.866, 'z'],
                'cross':   ['M', -0.5, 0, 'l', 1, 0, 'M', 0, -0.5, 'l', 0, 1],
                'ex':      ['M', -0.3535,-0.3535, 'L',0.3535,0.3535,
                            'M',-0.3535,0.3535, 'L',0.3535,-0.3535]};
  }

  /* =============================================================================
   * Convert Cgo2D data array ['M',x,y2, 'L',x,y2, ... 'Q',cx,cy2,x,y2, 'A',x,y ]
   * to array of canvas DrawCmd {drawFn:'moveTo', [x,y]}
   * ----------------------------------------------------------------------------*/
  function cgo2DtoDrawCmd(path, scl)
  {
    var x = 0,
        y = 0,
        px, py,
        c1x, c1y,
        rot, rx, ry, larc, swp,
        arc_segs,
        cmd, pc,
        cmdObj,
        seg, coords,
        commands = [],
        xScale = scl || 1,
        yScale = xScale,
        xOfs = 0,          // move the shape drawing origin
        yOfs = 0,
        i, j,
        segments = [];

    function segmentToBezier(cx, cy, th0, th1, rx, ry, sin_th, cos_th)
    {
      var a00 = cos_th * rx,
          a01 = -sin_th * ry,
          a10 = sin_th * rx,
          a11 = cos_th * ry,
          th_half = 0.5 * (th1 - th0),
          t = (8/3) * Math.sin(th_half * 0.5) * Math.sin(th_half * 0.5) / Math.sin(th_half),
          x1 = cx + Math.cos(th0) - t * Math.sin(th0),
          y1 = cy + Math.sin(th0) + t * Math.cos(th0),
          x3 = cx + Math.cos(th1),
          y3 = cy + Math.sin(th1),
          x2 = x3 + t * Math.sin(th1),
          y2 = y3 - t * Math.cos(th1);

      return [ a00 * x1 + a01 * y1, a10 * x1 + a11 * y1,
               a00 * x2 + a01 * y2, a10 * x2 + a11 * y2,
               a00 * x3 + a01 * y3, a10 * x3 + a11 * y3 ];
    }

    function arcToBezier(ox, oy, radx, rady, rotateX, large, sweep, x, y)
    {
      var th = rotateX * (Math.PI/180),
          sin_th = Math.sin(th),
          cos_th = Math.cos(th),
          rx = Math.abs(radx),
          ry = Math.abs(rady),
          px, py, pl,
          a00, a01, a10, a11,
          x0, y0, x1, y1,
          d,
          sfactor_sq,
          sfactor,
          xc, yc,
          th0, th1, th_arc,
          segments,
          result = [],
          i, th2, th3;

      px = cos_th * (ox - x) * 0.5 + sin_th * (oy - y) * 0.5;
      py = cos_th * (oy - y) * 0.5 - sin_th * (ox - x) * 0.5;
      pl = (px*px) / (rx*rx) + (py*py) / (ry*ry);
      if (pl > 1)
      {
        pl = Math.sqrt(pl);
        rx *= pl;
        ry *= pl;
      }
      a00 = cos_th / rx;
      a01 = sin_th / rx;
      a10 = -sin_th / ry;
      a11 = cos_th / ry;
      x0 = a00 * ox + a01 * oy;
      y0 = a10 * ox + a11 * oy;
      x1 = a00 * x + a01 * y;
      y1 = a10 * x + a11 * y;
      d = (x1-x0) * (x1-x0) + (y1-y0) * (y1-y0);
      sfactor_sq = 1 / d - 0.25;
      if (sfactor_sq < 0)
      {
        sfactor_sq = 0;
      }
      sfactor = Math.sqrt(sfactor_sq);
      if (sweep == large)
      {
        sfactor = -sfactor;
      }
      xc = 0.5 * (x0 + x1) - sfactor * (y1-y0);
      yc = 0.5 * (y0 + y1) + sfactor * (x1-x0);
      th0 = Math.atan2(y0-yc, x0-xc);
      th1 = Math.atan2(y1-yc, x1-xc);
      th_arc = th1-th0;
      if (th_arc < 0 && sweep == 1)
      {
        th_arc += 2*Math.PI;
      }
      else if (th_arc > 0 && sweep == 0)
      {
        th_arc -= 2 * Math.PI;
      }
      segments = Math.ceil(Math.abs(th_arc / (Math.PI * 0.5 + 0.001)));
      for (i=0; i<segments; i++)
      {
        th2 = th0 + i * th_arc / segments;
        th3 = th0 + (i+1) * th_arc / segments;
        result.push(segmentToBezier(xc, yc, th2, th3, rx, ry, sin_th, cos_th));
      }

      return result;
    }

    if (!isArray(path))
    {
      return commands;
    }
    // break the array into command segments
    if (typeof path[0] == 'number')
    {
      // special case of data only array. Test if 1st element is a number then
      // treat array as 'M', x0, y0, 'L', x1, y1, x2, y2, ... ]
      segments[0] = ['M', path[0], path[1]];
      var lineSeg = ['L'];
      for (j=2,i=2; i<path.length; i++)
      {
        if (typeof path[i] != 'number')
        {
          break;
        }
      }
      segments[1] = lineSeg.concat(path.slice(j,i));
    }
    else
    {
      for(j=0, i=1; i<path.length; i++)
      {
        if (typeof path[i] == 'string')
        {
          segments.push(path.slice(j,i));
          j = i;
        }
      }
      segments.push(path.slice(j,i));    // push the last command out
    }

    for (i=0; i<segments.length; i++)
    {
      seg = segments[i];
      cmd = seg[0];
      if ((i==0)&&(cmd != 'M'))   // check that the first move is absolute
      {
        cmd = 'M';
      }
      coords = seg.slice(1);      // skip the command copy coords
      if (coords)
      {
        coords = coords.map(parseFloat);
      }
      switch(cmd)
      {
        case 'M':
          x = xOfs + xScale*coords[0];
          y = yOfs + yScale*coords[1];
          px = py = null;
          cmdObj = new DrawCmd('moveTo', [x, y]);
          commands.push(cmdObj);
          coords.splice(0, 2);      // delete the 2 coords from the front of the array
          while (coords.length>0)
          {
            x = xOfs + xScale*coords[0];            // eqiv to muliple 'L' calls
            y = yOfs + yScale*coords[1];
            cmdObj = new DrawCmd('lineTo', [x, y]); // any coord pair after first move is regarded as line
            commands.push(cmdObj);
            coords.splice(0, 2);
          }
          break;
        case 'm':
          x += xScale*coords[0];
          y += yScale*coords[1];
          px = py = null;
          cmdObj = new DrawCmd('moveTo', [x, y]);
          commands.push(cmdObj);
          coords.splice(0, 2);      // delete the 2 coords from the front of the array
          while (coords.length>0)
          {
            x += xScale*coords[0];                  // eqiv to muliple 'l' calls
            y += yScale*coords[1];
            cmdObj = new DrawCmd('lineTo', [x, y]); // any coord pair after first move is regarded as line
            commands.push(cmdObj);
            coords.splice(0, 2);
          }
          break;
        case 'L':
          while (coords.length>0)
          {
            x = xOfs + xScale*coords[0];
            y = yOfs + yScale*coords[1];
            cmdObj = new DrawCmd('lineTo', [x, y]);
            commands.push(cmdObj);
            coords.splice(0, 2);
          }
          px = py = null;
          break;
        case 'l':
          while (coords.length>0)
          {
            x += xScale*coords[0];
            y += yScale*coords[1];
            cmdObj = new DrawCmd('lineTo', [x, y]);
            commands.push(cmdObj);
            coords.splice(0, 2);
          }
          px = py = null;
          break;
        case 'H':
          x = xOfs + xScale*coords[0];
          px = py = null ;
          cmdObj = new DrawCmd('lineTo', [x, y]);
          commands.push(cmdObj);
          break;
        case 'h':
          x += xScale*coords[0];
          px = py = null ;
          cmdObj = new DrawCmd('lineTo', [x, y]);
          commands.push(cmdObj);
          break;
        case 'V':
          y = yOfs + yScale*coords[0];
          px = py = null;
          cmdObj = new DrawCmd('lineTo', [x, y]);
          commands.push(cmdObj);
          break;
        case 'v':
          y += yScale*coords[0];
          px = py = null;
          cmdObj = new DrawCmd('lineTo', [x, y]);
          commands.push(cmdObj);
          break;
        case 'C':
          while (coords.length>0)
          {
            c1x = xOfs + xScale*coords[0];
            c1y = yOfs + yScale*coords[1];
            px = xOfs + xScale*coords[2];
            py = yOfs + yScale*coords[3];
            x = xOfs + xScale*coords[4];
            y = yOfs + yScale*coords[5];
            cmdObj = new DrawCmd('bezierCurveTo', [c1x, c1y, px, py, x, y]);
            commands.push(cmdObj);
            coords.splice(0, 6);
          }
          break;
        case 'c':
          while (coords.length>0)
          {
            c1x = x + xScale*coords[0];
            c1y = y + yScale*coords[1];
            px = x + xScale*coords[2];
            py = y + yScale*coords[3];
            x += xScale*coords[4];
            y += yScale*coords[5];
            cmdObj = new DrawCmd('bezierCurveTo', [c1x, c1y, px, py, x, y]);
            commands.push(cmdObj);
            coords.splice(0, 6);
          }
          break;
        case 'S':
          if (px == null || !pc.match(/[sc]/i))
          {
            px = x;                // already absolute coords
            py = y;
          }
          cmdObj = new DrawCmd('bezierCurveTo', [x-(px-x), y-(py-y),
                                                xOfs + xScale*coords[0], yOfs + yScale*coords[1],
                                                xOfs + xScale*coords[2], yOfs + yScale*coords[3]]);
          commands.push(cmdObj);
          px = xOfs + xScale*coords[0];
          py = yOfs + yScale*coords[1];
          x = xOfs + xScale*coords[2];
          y = yOfs + yScale*coords[3];
          break;
        case 's':
          if (px == null || !pc.match(/[sc]/i))
          {
            px = x;
            py = y;
          }
          cmdObj = new DrawCmd('bezierCurveTo', [x-(px-x), y-(py-y),
                                                x + xOfs + xScale*coords[0], y + yOfs + yScale*coords[1],
                                                x + xOfs + xScale*coords[2], y + yOfs + yScale*coords[3]]);
          commands.push(cmdObj);
          px = x + xScale*coords[0];
          py = y + yScale*coords[1];
          x += xScale*coords[2];
          y += yScale*coords[3];
          break;
        case 'Q':
          px = xOfs + xScale*coords[0];
          py = yOfs + yScale*coords[1];
          x = xOfs + xScale*coords[2];
          y = yOfs + yScale*coords[3];
          cmdObj = new DrawCmd('quadraticCurveTo', [px, py, x, y]);
          commands.push(cmdObj);
          break;
        case 'q':
          cmdObj = new DrawCmd('quadraticCurveTo', [x + xScale*coords[0], y + yScale*coords[1],
                                                    x + xScale*coords[2], y + yScale*coords[3]]);
          commands.push(cmdObj);
          px = x + xScale*coords[0];
          py = y + yScale*coords[1];
          x += xScale*coords[2];
          y += yScale*coords[3];
          break;
        case 'T':
          if ((px == null) || (!pc.match(/[qt]/i)))
          {
            px = x;
            py = y;
          }
          else
          {
            px = x-(px-x);
            py = y-(py-y);
          }
          cmdObj = new DrawCmd('quadraticCurveTo', [px, py,
                                                    xOfs + xScale*coords[0], yOfs + yScale*coords[1]]);
          commands.push(cmdObj);
          px = x-(px-x);
          py = y-(py-y);
          x = xOfs + xScale*coords[0];
          y = yOfs + yScale*coords[1];
          break;
        case 't':
          if (px == null || !pc.match(/[qt]/i))
          {
            px = x;
            py = y;
          }
          else
          {
            px = x-(px-x);
            py = y-(py-y);
          }
          cmdObj = new DrawCmd('quadraticCurveTo', [px, py,
                                                    x + xScale*coords[0], y + yScale*coords[1]]);
          commands.push(cmdObj);
          x += xScale*coords[0];
          y += yScale*coords[1];
          break;
        case 'A':
          while (coords.length>0)
          {
            px = x;
            py = y;
            rx = xScale*coords[0];
            ry = xScale*coords[1];
            rot = -coords[2];          // rotationX: swap for CCW +ve
            larc = coords[3];          // large arc    should be ok
            swp = 1 - coords[4];       // sweep: swap for CCW +ve
            x = xOfs + xScale*coords[5];
            y = yOfs + yScale*coords[6];
            arc_segs = arcToBezier(px, py, rx, ry, rot, larc, swp, x, y);
            for (j=0; j<arc_segs.length; j++)
            {
              cmdObj = new DrawCmd('bezierCurveTo', arc_segs[j]);
              commands.push(cmdObj);
            }
            coords.splice(0, 7);
          }
          break;
        case 'a':
          while (coords.length>0)
          {
            px = x;
            py = y;
            rx = xScale*coords[0];
            ry = xScale*coords[1];
            rot = -coords[2];          // rotationX: swap for CCW +ve
            larc = coords[3];          // large arc    should be ok
            swp = 1 - coords[4];       // sweep: swap for CCW +ve
            x += xScale*coords[5];
            y += yScale*coords[6];
            arc_segs = arcToBezier(px, py, rx, ry, rot, larc, swp, x, y);
            for (j=0; j<arc_segs.length; j++)
            {
              cmdObj = new DrawCmd('bezierCurveTo', arc_segs[j]);
              commands.push(cmdObj);
            }
            coords.splice(0, 7);
          }
          break;
        case 'Z':
          cmdObj = new DrawCmd('closePath', []);
          commands.push(cmdObj);
          break;
        case 'z':
          cmdObj = new DrawCmd('closePath', []);
          commands.push(cmdObj);
          break;
      }
      pc = cmd;     // save the previous command for possible reflected control points
    }
    return commands;
  }

  /*===============================================
   * Object holding an array of 3 1x3 arrays,
   * representing a 3x3 matrix and methods to
   * apply matrix tranforms.
   *----------------------------------------------*/
  function Transform2D()
  {
    this.matrix = [ [1, 0, 0],
                    [0, 1, 0],
                    [0, 0, 1] ];
  }

  // Reset the matrix to the identity matrix
  Transform2D.prototype.reset = function()
  {
    this.matrix[0][0] = 1;
    this.matrix[0][1] = 0;
    this.matrix[0][2] = 0;
    this.matrix[1][0] = 0;
    this.matrix[1][1] = 1;
    this.matrix[1][2] = 0;
    this.matrix[2][0] = 0;
    this.matrix[2][1] = 0;
    this.matrix[2][2] = 1;
  };

  Transform2D.prototype.applyTransform = function(m)
  {
    // apply a transform by multiplying this.matrix by matrix 'm'
    var a11 = this.matrix[0][0],
        a12 = this.matrix[0][1],
        a13 = this.matrix[0][2],
        a21 = this.matrix[1][0],
        a22 = this.matrix[1][1],
        a23 = this.matrix[1][2],
        a31 = this.matrix[2][0],
        a32 = this.matrix[2][1],
        a33 = this.matrix[2][2],
        b11 = m[0][0],
        b12 = m[0][1],
        b13 = m[0][2],
        b21 = m[1][0],
        b22 = m[1][1],
        b23 = m[1][2],
        b31 = m[2][0],
        b32 = m[2][1],
        b33 = m[2][2];

    this.matrix[0][0] = a11 * b11 + a12 * b21 + a13 * b31;
    this.matrix[0][1] = a11 * b12 + a12 * b22 + a13 * b32;
    this.matrix[0][2] = a11 * b13 + a12 * b23 + a13 * b33;
    this.matrix[1][0] = a21 * b11 + a22 * b21 + a23 * b31;
    this.matrix[1][1] = a21 * b12 + a22 * b22 + a23 * b32;
    this.matrix[1][2] = a21 * b13 + a22 * b23 + a23 * b33;
    this.matrix[2][0] = a31 * b11 + a32 * b21 + a33 * b31;
    this.matrix[2][1] = a31 * b12 + a32 * b22 + a33 * b32;
    this.matrix[2][2] = a31 * b13 + a32 * b23 + a33 * b33;
  };

  // Multiply two matricies
  Transform2D.prototype.matrixMult = function(a, b)
  {
    var a11 = a[0][0],
        a12 = a[0][1],
        a13 = a[0][2],
        a21 = a[1][0],
        a22 = a[1][1],
        a23 = a[1][2],
        a31 = a[2][0],
        a32 = a[2][1],
        a33 = a[2][2],
        b11 = b[0][0],
        b12 = b[0][1],
        b13 = b[0][2],
        b21 = b[1][0],
        b22 = b[1][1],
        b23 = b[1][2],
        b31 = b[2][0],
        b32 = b[2][1],
        b33 = b[2][2];

    this.matrix[0][0] = a11 * b11 + a12 * b21 + a13 * b31;
    this.matrix[0][1] = a11 * b12 + a12 * b22 + a13 * b32;
    this.matrix[0][2] = a11 * b13 + a12 * b23 + a13 * b33;
    this.matrix[1][0] = a21 * b11 + a22 * b21 + a23 * b31;
    this.matrix[1][1] = a21 * b12 + a22 * b22 + a23 * b32;
    this.matrix[1][2] = a21 * b13 + a22 * b23 + a23 * b33;
    this.matrix[2][0] = a31 * b11 + a32 * b21 + a33 * b31;
    this.matrix[2][1] = a31 * b12 + a32 * b22 + a33 * b32;
    this.matrix[2][2] = a31 * b13 + a32 * b23 + a33 * b33;
  };

  Transform2D.prototype.transformPoint = function(px, py, m)
  {
    var a1 = px,
        a2 = py,
        a3 = 1,
        b11 = m[0][0],
        b12 = m[0][1],
        b21 = m[1][0],
        b22 = m[1][1],
        b31 = m[2][0],
        b32 = m[2][1];

    return {x:a1 * b11 + a2 * b21 + a3 * b31 , y: a1 * b12 + a2 * b22 + a3 * b32};
  };

  // Apply a translation to current transform matrix
  Transform2D.prototype.translate = function(tx, ty)
  {
    var x = tx || 0,
        y = ty || 0,
        trns = [[1, 0, 0],
                [0, 1, 0],
                [x, y, 1]];
    this.applyTransform(trns);
  };

  // Rotate matrix, angle in degrees applied before translate
  Transform2D.prototype.rotate = function(degs)
  {
    var angle = degs || 0,
        t = Math.PI/180.0,
        s	= Math.sin(-angle*t),
        c	= Math.cos(-angle*t),
        rot = [ [c, -s, 0],
                [s,  c, 0],
                [0,  0, 1]];
    this.applyTransform(rot);
  };

  // Revolve is soft transform only and may be applied after soft translate.
  Transform2D.prototype.revolve = function(degs)
  {
    var angle = degs || 0,
        t = Math.PI/180.0,
        s	= Math.sin(-angle*t),
        c	= Math.cos(-angle*t),
        rev = [ [c, -s, 0],
                [s,  c, 0],
                [0,  0, 1]];
    this.applyTransform(rev);
  };

  // Apply a scale to current transform matrix always before translate
  Transform2D.prototype.scale = function(xScale, yScale)
  {
    var sx = xScale || 1,
        sy = yScale || sx,
        scl = [[sx, 0, 0],
               [0, sy, 0],
               [0, 0,  1]];
    this.applyTransform(scl);
  };

  // Generate a 2D translation matrix
  function translateMatrix(tx, ty)
  {
    var x = tx || 0,
        y = ty || 0;

    return [[1, 0, 0],
            [0, 1, 0],
            [x, y, 1]];
  }

  // Generate a 2D rotate matrix, angle in degrees
  function rotateMatrix(degs)
  {
    var angle = degs || 0,
        t = Math.PI/180.0,
        s	= Math.sin(-angle*t),
        c	= Math.cos(-angle*t);

    return [[c, -s, 0],
            [s,  c, 0],
            [0,  0, 1]];
  }

  // Generate a 2D revolve (identical to rotate) but may be applied after soft translate.
  function revolveMatrix(degs)
  {
    var angle = degs || 0,
        t = Math.PI/180.0,
        s	= Math.sin(-angle*t),
        c	= Math.cos(-angle*t);

    return [[c, -s, 0],
            [s,  c, 0],
            [0,  0, 1]];
  }

  // Generate a 2D scale matrix
  function scaleMatrix(xScale, yScale)
  {
    var sx = xScale || 1,
        sy = yScale || sx;

    return [[sx, 0, 0],
            [0, sy, 0],
            [0, 0,  1]];
  }

  function DrawCmd(cmdStr, coords)   // canvas syntax draw commands
  {
    this.drawFn = cmdStr;       // String version of the canvas command eg 'lineTo'
    this.parms = coords || [];  // world coordinates in [cp1x,cp1y, cp2x,cp2y, ... x,y]
    this.parmsPx = [];          // parms transformed into pixel coords
  }

  Tweener = function(values, delayTime, dur, loopStr)
  {
    var loopParm = "noloop";
    if (typeof loopStr == 'string')
    {
      loopParm = loopStr.toLowerCase();
    }

    this.tfmType = "";               // 'ROT', 'SCL'... filled in by Cango2D.animate method
    this.values = values;
    this.delay = delayTime || 0;
    this.duration = dur || 5000;
    this.startTime = 0;              // this.startTime fakes 0 time in looping
    this.loop = false;
    this.loopAll = false;

    if (loopParm == 'loop')
    {
      this.loop = true;
    }
    else if (loopParm == 'loopall')
    {
      this.loopAll = true;
    }
  };

  Tweener.prototype.getValue = function(time)
  {
    var localTime, numSlabs, slabDur, slab, frac, newVal,
        t = 0;

    if (time == 0)   // re-starting after a stop (delay will be included)
    {
      this.startTime = 0;
    }
    localTime = time - this.startTime;       // handles local looping
    if ((localTime > this.duration+this.delay) && (this.duration > 0) && (this.loop || this.loopAll))
    {
      this.startTime = this.loop? time-this.delay : time;   // we will re-start
      localTime = this.loop? this.delay : 0;   // force re-start at end of delay or at time 0
    }
    if (localTime > this.delay)  // repeat initial frame if there is a delay to start
    {
      t = localTime - this.delay;
    }
    if (isArray(this.values) && (this.values.length > 1))
    {
      if (t >= this.duration)
      {
        newVal = this.values[this.values.length-1];  // freeze at end value
      }
      else
      {
        numSlabs = this.values.length-1;
        slabDur = this.duration/numSlabs;
        slab = Math.floor(t/slabDur);
        frac = (t - slab*slabDur)/slabDur;
        newVal = this.values[slab] + frac*(this.values[slab+1] - this.values[slab]);
      }
    }
    else   // single value or single valued array
    {
      newVal = isArray(this.values)? this.values[0] : this.values;
    }

    return newVal;
  };

  Tweener.prototype.getMatrix = function(time)
  {
    var mat;

    if (this.tfmType == 'ROT')
    {
      mat = rotateMatrix(this.getValue(time));
    }
    else if (this.tfmType == 'REV')
    {
      mat = rotateMatrix(this.getValue(time));
    }
    else if (this.tfmType == 'SCL')
    {
      mat = scaleMatrix(this.getValue(time));
    }
    else if (this.tfmType == 'TRNX')
    {
      mat = translateMatrix(this.getValue(time), 0);
    }
    else if (this.tfmType == 'TRNY')
    {
      mat = translateMatrix(0, this.getValue(time));
    }
    else
    {
      return [[1,0,0],[0,1,0],[0,0,1]];
    }

    return mat;
  };

  function StaticTfm(obj)
  {
    var savThis = this;

    this.parent = obj;
    this.translate = function(x, y)
    {
      var trns = translateMatrix(x, y);
      savThis.parent.ofsTfmAry.push(trns);
    };
    this.scale = function(s)
    {
      var scl = scaleMatrix(s);
      savThis.parent.ofsTfmAry.unshift(scl);
    };
    this.rotate = function(deg)
    {
      var rot = rotateMatrix(deg);
      // put rotate in front of array so there is no move of dwgOrg
      savThis.parent.ofsTfmAry.unshift(rot);
    };
    this.revolve = function(deg)
    {
      var rev = revolveMatrix(deg);
      savThis.parent.ofsTfmAry.push(rev);
    };
    this.reset = function()
    {
      savThis.parent.ofsTfmAry = [];
      savThis.parent.ofsTfm.reset();  // reset the accumulation matrix
    };
  }

  function AnimTfm(obj)
  {
    var savThis = this;

    this.parent = obj;
    // container for methods to add animation Tweeners to a Group2D or Obj2D
    this.translate = function(xTwnr, yTwnr)
    {
      var trns;
      if (xTwnr instanceof Tweener)
      {
        xTwnr.tfmType = 'TRNX';
        // add the tweener to the array of transforms to be applied to the group
        savThis.parent.animTfmAry.push(xTwnr);
      }
      else  // xTwnr is a static value
      {
        trns = translateMatrix(xTwnr, 0);
        savThis.parent.animTfmAry.push(trns);
      }
      if (yTwnr instanceof Tweener)
      {
        yTwnr.tfmType = 'TRNY';
        // add the tweener to the array of transforms to be applied to the group
        savThis.parent.animTfmAry.push(yTwnr);
      }
      else  // yTwnr is a static value
      {
        trns = translateMatrix(0, yTwnr);
        savThis.parent.animTfmAry.push(trns);
      }
    };
    this.scale = function(sclTwnr)
    {
      // store the transform type in the Tweener object
      sclTwnr.tfmType = 'SCL';
      // add the tweener to the array of transforms to be applied to the group
      // unshift puts rotate at front of the array, must be before translates
      savThis.parent.animTfmAry.unshift(sclTwnr);
    };
    this.rotate = function(rotTwnr)
    {
      rotTwnr.tfmType = 'ROT';
      // unshift puts rotate at front of the array, must be before translates
      savThis.parent.animTfmAry.unshift(rotTwnr);
    };
    this.revolve = function(revTwnr)
    {
      revTwnr.tfmType = 'REV';
      // add the tweener to the array of transforms to be applied to the group
      savThis.parent.animTfmAry.push(revTwnr);
    };
    this.reset = function()
    {
      savThis.parent.animTfmAry = [];
      savThis.parent.ofsTfm.reset();  // reset the accumulation matrix
    };
  }

  function Group2D()
  {
    this.type = "GRP";                // enum of type to instruct the render method
    this.parent = null;               // pointer to parent group if any
    this.children = [];               // only Groups have children
    this.dwgOrg = {x:0, y:0};         // drawing origin (0,0) may get translated
    this.ofsTfmAry = [];              // static transforms cleared after render
    this.animTfmAry = [];             // animation transforms re-built after render
    this.ofsTfm = new Transform2D();  // sum total of ofsTfmArry actions
    this.grpTfm = new Transform2D();  // inherited from parent Group2D
    this.netTfm = new Transform2D();
    this.dragNdrop = null;
    // enable grp.transform.rotate etc. API
    this.transform = new StaticTfm(this);
    this.animateTransform = new AnimTfm(this);
    // add any objects passed by forwarding them to addObj
    this.addObj.apply(this, arguments);
  }

  Group2D.prototype.deleteObj = function(obj)
  {
    // remove from chiren array
    var idx = this.children.indexOf(obj);
    while (idx != -1)    // there may be multiple copies
    {
      this.children.splice(idx, 1);
      idx = this.children.indexOf(obj);
    }
  };

  Group2D.prototype.addObj = function()
  {
    var args = Array.prototype.slice.call(arguments), // grab array of arguments
        i, j;
    for (i=0; i<args.length; i++)
    {
      if (isArray(args[i]))
      {
        // check that only Groups or Obj2Ds are passed
        for (j=0; j<args[i].length; j++)
        {
          if ((args[i][j].drawCmds !== undefined)||(args[i][j].type == "GRP"))
          {
            // point the Obj2D or Group2D parent property at this Group2D
            if (args[i][j].parent != null)      // already a member of a Group2D, remove it
            {
              args[i][j].parent.deleteObj(args[i][j]);
            }
            args[i][j].parent = this;           // now its a free agent link it to this group
            this.children.push(args[i][j]);
          }
        }
      }
      else
      {
        if ((args[i].drawCmds !== undefined)||(args[i].type == "GRP"))
        {
          // point the Obj2D or Group2D parent property at this Group2D
          if (args[i].parent != null)       // already a member of a Group2D, remove it
          {
            args[i].parent.deleteObj(args[i]);
          }
          args[i].parent = this;            // now its a free agent link it to this group
          this.children.push(args[i]);
        }
      }
    }
  };

  /*======================================
   * Recursively apply a hard translation
   * to all the Obj2Ds in the family tree.
   *-------------------------------------*/
  Group2D.prototype.translate = function(x, y)
  {
    var i, childNode;
    // Apply transform to the hardOfsTfm of all Obj2D children recursively
    function applyXfm(obj)
    {
      // do nothing if array elements are not Panels
      if (obj.type != "GRP")
      {
        obj.translate(x, y);
      }
    }
    // task:function, grp: Group2D with children
  	function iterate(task, grp)
  	{
  		for (i=0; i < grp.children.length; i++)
  		{
  			childNode = grp.children[i];
   			task(childNode);
  			if ((childNode.type == "GRP") && (childNode.children.length > 0))
        {
  				iterate(task, childNode);
        }
  		}
  	}
    iterate(applyXfm, this);
  };

  /*======================================
   * Recursively apply a hard rotation
   * to all the Obj2Ds in the family tree.
   *-------------------------------------*/
  Group2D.prototype.rotate = function(degs)
  {
    var i, childNode;
    // Apply transform to the hardOfsTfm of all Obj2D children recursively
    function applyXfm(obj)
    {
      // do nothing if array elements are not Panels
      if (obj.type != "GRP")
      {
        obj.rotate(degs);
      }
    }
    // task:function, grp: Group2D with children
  	function iterate(task, grp)
  	{
  		for (i=0; i < grp.children.length; i++)
  		{
  			childNode = grp.children[i];
   			task(childNode);
  			if ((childNode.type == "GRP") && (childNode.children.length > 0))
        {
  				iterate(task, childNode);
        }
  		}
  	}
    iterate(applyXfm, this);
  };

  /*======================================
   * Recursively apply a hard scale
   * to all the Obj2Ds in the family tree.
   *-------------------------------------*/
  Group2D.prototype.scale = function(s)
  {
    var i, childNode;
    // Apply transform to the hardOfsTfm of all Obj2D children recursively
    function applyXfm(obj)
    {
      // do nothing if array elements are not Panels
      if (obj.type != "GRP")
      {
        obj.scale(s);
      }
    }
    // task:function, grp: Group2D with children
  	function iterate(task, grp)
  	{
  		for (i=0; i < grp.children.length; i++)
  		{
  			childNode = grp.children[i];
   			task(childNode);
  			if ((childNode.type == "GRP") && (childNode.children.length > 0))
        {
  				iterate(task, childNode);
        }
  		}
  	}
    iterate(applyXfm, this);
  };

  Group2D.prototype.enableDrag = function(drag)
  {
    this.dragNdrop = drag;
    // When rendered all child Obj2D will be added to _draggables to be checked on mousedown
  };

  Group2D.prototype.disableDrag = function()
  {
    // Can't immediately remove from _draggables array (no Cango reference) but no harm
    this.dragNdrop = null;
  };

  function Obj2D(cgo, commands, objtype, fillColor, strokeColor)
  {
    this.type = "SHAPE";              // type string to instruct the render method
    this.parent = null;               // pointer to parent group if any
    this.drawCmds = commands;         // array of DrawCmds (or an Image object)
    this.bBoxCmds = [];               // DrawCmd array for the text or img bounding box
    this.dwgOrg = {x:0, y:0};         // drawing origin (0,0) may get translated
    this.strokeCol = "black";         // renderer will stroke a path in this color
    this.fillCol = "gray";            // only used if type == SHAPE
    this.strokeWidth = 1;             // in case fat outline is wanted for Path or Shape outline
    this.strokeCap = "butt";          // freeze current style in case something fancy is wanted
    this.width = 0;                   // only used for type = IMG, TEXT, set to 0 until image loaded
    this.height = 0;                  //     "
    this.imgX = 0;                    // TEXT & IMG use these instead of hard transforms
    this.imgY = 0;                    //     "
    this.imgXscale = 1;               //     "
    this.imgYscale = 1;               //     "
    this.fontSize = 10;               // fontSize in points (TEXT only)
    this.fontWeight = 400;            // fontWeight 100..900 (TEXT only)
    this.hardOfsTfm = new Transform2D();  // offset from any parent Group2D's transform
    this.ofsTfmAry = [];              // static transforms cleared after render
    this.animTfmAry = [];             // animation transforms re-built after render
    this.ofsTfm = new Transform2D();  // product of hard & all the softOfsAry action, filled in at render
    this.grpTfm = new Transform2D();  // Parent Group2D's current transform
    this.netTfm = new Transform2D();  // parent Group2D netTfm applied to this.ofsTfm
    this.orgTfm = new Transform2D();  // accumulate soft translates, hard transforms don't shift origin
    this.zIndex = 0;                  // depth sort on this
    this.dragNdrop = null;
    // enable obj.transform.rotate etc. API
    this.transform = new StaticTfm(this);
    this.animateTransform = new AnimTfm(this);

    if (cgo)
    {
      this.type = objtype || "SHAPE";

      if ((fillColor !== undefined)&&(fillColor != null))
      {
        this.fillCol = fillColor;
      }
      else
      {
        this.fillCol = cgo.paintCol;
      }

      if ((strokeColor !== undefined)&&(strokeColor != null))
      {
        this.strokeCol = strokeColor;
      }
      else if (this.type == "SHAPE")
      {
        this.strokeCol = this.fillCol; // shapes default to stroke and fill the same
      }
      else
      {
        this.strokeCol = cgo.penCol;   // path and text default to current pen color
      }
      this.strokeWidth = cgo.penWid;
      this.strokeCap = cgo.lineCap;
    }
  }

  Obj2D.prototype.applyHardOfsTfm = function()
  {
    // apply hardOfsTfm for PATH and SHAPE Obj2Ds immediately so appendPath and revWinding are valid
    var tp, j, k;

    // apply hardOfsTfm so the outline path is valid
    for(j=0; j < this.drawCmds.length; j++)   // step through the draw segments
    {
      for (k=0; k < this.drawCmds[j].parms.length; k += 2)   // transform each x,y pair
      {
        tp = this.hardOfsTfm.transformPoint(this.drawCmds[j].parms[k], this.drawCmds[j].parms[k+1], this.hardOfsTfm.matrix);
        this.drawCmds[j].parms[k] = tp.x;
        this.drawCmds[j].parms[k+1] = tp.y;
        this.drawCmds[j].parmsPx[k] = this.vpLLx+this.xoffset+tp.x*this.xscl;
        this.drawCmds[j].parmsPx[k+1] = this.vpLLy+this.yoffset+tp.y*this.yscl;
      }
    }
    // to avoid applying twice, reset the hardOfsTfm to identity matrix
    this.hardOfsTfm.reset();
  };

  /*======================================
   * Apply a translation transform to the
   * Obj2D's hardOfsTfm.
   *-------------------------------------*/
  Obj2D.prototype.translate = function(x, y)
  {
    this.hardOfsTfm.translate(x, y);
    if ((this.type == "PATH")||(this.type == "SHAPE"))
    {
      this.applyHardOfsTfm();
    }
  };

  /*======================================
   * Apply a rotation transform to the
   * Obj2D's hardOfsTfm.
   *-------------------------------------*/
  Obj2D.prototype.rotate = function(degs)
  {
    this.hardOfsTfm.rotate(degs);
    if ((this.type == "PATH")||(this.type == "SHAPE"))
    {
      this.applyHardOfsTfm();
    }
  };

  /*======================================
   * Apply a scale transform to the
   * Obj2D's hardOfsTfm.
   *-------------------------------------*/
  Obj2D.prototype.scale = function(xScl, yScl)
  {
    this.hardOfsTfm.scale(xScl, yScl);
    if ((this.type == "PATH")||(this.type == "SHAPE"))
    {
      this.applyHardOfsTfm();
    }
  };

  Obj2D.prototype.appendPath = function(obj, delMove)
  {
    if ((this.type == "IMG") || (this.type == "TEXT") || (this.type == "GRP"))
    {
      return;
    }
    if (delMove)  // delete the inital 'moveTo' command
    {
      this.drawCmds = this.drawCmds.concat(obj.drawCmds.slice(1));
    }
    else
    {
      this.drawCmds = this.drawCmds.concat(obj.drawCmds);
    }
  };

  Obj2D.prototype.revWinding = function()
  {
    var cmds, zCmd, revCmds,
        k, len,
        dParms, dCmd;

    function revPairs(ary)
    {
      var i, j;
      if (ary.length < 3)
      {
        return ary;
      }
      var revAry = [];
      for (i=0, j=ary.length/2-1; j>=0; i++, j--)
      {
        revAry[2*i] = ary[2*j];
        revAry[2*i+1] = ary[2*j+1];
      }
      return revAry;
    }

    if ((this.type == "IMG") || (this.type == "TEXT") || (this.type == "TEXT"))
    {
      return;
    }
    // reverse the direction of drawing around a path, stops holes in shapes being filled
    if (this.drawCmds[this.drawCmds.length-1].drawFn.toUpperCase() == "closePath")
    {
      cmds = this.drawCmds.slice(0, -1);  // leave off Z
      zCmd = this.drawCmds.slice(-1);
    }
    else
    {
      cmds = this.drawCmds.slice(0);  // copy the whole array
    }
    revCmds = [];
    // now step back along the path
    k = cmds.length-1;
    len = cmds[k].parms.length;
    dParms = [cmds[k].parms[len-2], cmds[k].parms[len-1]];
    dCmd = new DrawCmd("moveTo", dParms);
    revCmds.push(dCmd);
    cmds[k].parms = cmds[k].parms.slice(0,-2);  // last point used so slice it off
    while (k>0)
    {
      dParms = revPairs(cmds[k].parms);
      len = cmds[k-1].parms.length;
      dParms.push(cmds[k-1].parms[len-2], cmds[k-1].parms[len-1]); // push last of next cmd
      dCmd = new DrawCmd(cmds[k].drawFn, dParms);
      revCmds.push(dCmd);
      cmds[k-1].parms = cmds[k-1].parms.slice(0,-2);  // last point used so slice it off
      k--;
    }
    // add the 'z' if it was a closed path
    if (zCmd)
    {
      revCmds.push(zCmd);
    }

    this.drawCmds = revCmds;
  };

  Obj2D.prototype.enableDrag = function(drag)
  {
    this.dragNdrop = drag;
    // When rendered this Obj2D will be added to _draggables to be checked on mousedown
    // the Drag2D has the Cango context saved as 'this.cgo'
    if (!_draggable[drag.cgo.cId].contains(this))
    {
      _draggable[drag.cgo.cId].push(this);
    }
  };

  Obj2D.prototype.disableDrag = function()
  {
    var aidx;

    function getIndex(ary, obj)
    {
      var i, j;
      for (i=0, j=ary.length; i<j; i++)
      {
        if (ary[i] === obj)
        {
          return i;
        }
      }
      return -1;
    }

    if (!this.dragNdrop)
    {
      return;
    }
    // remove this object from array to be checked on mousedown
    // the Drag2D has the cango context saved as 'this.cgo'
    aidx = getIndex(_draggable[this.dragNdrop.cgo.cId], this);
    _draggable[this.dragNdrop.cgo.cId].splice(aidx, 1);
    this.dragNdrop = null;
  };

  Obj2D.prototype.setProperty = function(propertyName, value)
  {
    if ((typeof propertyName !== "string")||(value === undefined)||(value === null))
    {
      return;
    }
    switch (propertyName.toLowerCase())
    {
      case "fillcolor":
        if ((typeof value == "string")||(typeof value == "object"))  // gradient is an object
        {
          this.fillCol = value;
        }
        break;
      case "strokecolor":
        if ((typeof value == "string")||(typeof value == "object"))  // gradient is an object
        {
          this.strokeCol = value;
        }
        break;
      case "strokewidth":
        if (isNumber(value))
        {
          this.strokeWidth = value;
        }
        break;
      case "linecap":
        if ((typeof value == "string")&&((value == "butt")||(value =="round")||(value == "square")))
        {
          this.strokeCap = value;
        }
        break;
      case "fontsize":
        this.fontSize = value;
        break;
      case "fontweight":
        if ((value>=100)&&(value<=900))
        {
           this.fontWeight = value;
        }
        break;
    }
  };

  Obj2D.prototype.dup = function()
  {
    var F = function(){},   // make a empty constructor
        newObj;             // a new Obj2D to be returned

    function clone(orgItem)
    {
      var newItem = (isArray(orgItem)) ? [] : {};
      var i;
      for (i in orgItem)
      {
        if ((orgItem[i] && typeof orgItem[i] == "object")&&(i != 'cgo'))
        {
          newItem[i] = clone(orgItem[i]);
        }
        else
        {
          newItem[i] = orgItem[i];
        }
      }
      return newItem;
    }

    F.prototype = this;     // make its prototype the Obj2D to be duplicated
    newObj = new F();
    // must deep clone the Object properties
    newObj.drawCmds = clone(this.drawCmds);
    newObj.bBoxCmds = clone(this.bBoxCmds);
    newObj.dwgOrg = clone(this.dwgOrg);
    newObj.hardOfsTfm = clone(this.hardOfsTfm);
    // The other objects are dynamic, just set up types
    newObj.ofsTfmAry = [];
    newObj.animTfmAry = [];
    newObj.ofsTfm = new Transform2D();
    newObj.grpTfm = new Transform2D();
    newObj.netTfm = new Transform2D();
    newObj.orgTfm = new Transform2D();
    newObj.transform = new StaticTfm(newObj);
    newObj.animateTransform = new AnimTfm(newObj);

    return newObj;         // return a object which inherits Obj2D properties
  };

  function transformCtx(ctx, xfm)  // apply a matrix transform to a canvas 2D context
  {
    if (xfm === undefined)
    {
      ctx.setTransform(1, 0, 0,
                       0, 1, 0);
    }
    else
    {
      ctx.setTransform(xfm.matrix[0][0], xfm.matrix[0][1], xfm.matrix[1][0],
                       xfm.matrix[1][1], xfm.matrix[2][0], xfm.matrix[2][1]);
    }
  }

//===============================================================================

  Cango2D = function(canvasId)
  {
    var savThis = this;

    this.cId = canvasId;
    this.cnvs = document.getElementById(canvasId);
    if (this.cnvs == null)
    {
      alert("can't find canvas "+canvasId);
      return;
    }
    this.rawWidth = this.cnvs.offsetWidth;
    this.rawHeight = this.cnvs.offsetHeight;
    this.aRatio = this.rawWidth/this.rawHeight;
    this.buffered = true;// draw animation to off-screen buffer then bitblt complete frames
    if (!_resized.hasOwnProperty(this.cId))
    {
      // make canvas native aspect ratio equal style box aspect ratio.
      // Note: rawWidth and rawHeight are floats, assignment to ints will truncate
      this.cnvs.setAttribute('width', this.rawWidth);    // reset number of graphics pixels
      this.cnvs.setAttribute('height', this.rawHeight);  // don't use style for this
      // create element for this canvas, this prevents resize for each Cango instance
      _resized[this.cId] = true;
      // create off screen drawing buffer
      if (this.buffered)
      {
        _buf[this.cId] = document.createElement('canvas');      // create buffer in memory
        _buf[this.cId].setAttribute('width', this.rawWidth);    // set number of graphics pixels
        _buf[this.cId].setAttribute('height', this.rawHeight);  // to match screen canvas
      }
      // create an array to hold all the draggable objects for each canvas
      _draggable[this.cId] = [];
      // create an array to hold all the overlay canvases for each background canvas
      _overlays[this.cId] = [];
    }
    if (this.buffered)
    {
      this.bufCtx = _buf[this.cId].getContext('2d');  // animation drawing done off screen
    }
    this.ctx = this.cnvs.getContext('2d');    // draw direct to screen canvas
    this.vpW = this.rawWidth;         // vp width in pixels (no more viewport so use full canvas)
    this.vpH = this.rawHeight;        // vp height in pixels, canvas height = width/aspect ratio
    this.vpLLx = 0;                   // vp lower left of viewport (not used) from canvas left, in pixels
    this.vpLLy = this.rawHeight;      // vp lower left of viewport from canvas top
    this.xscl = 1;                    // world x axis scale factor, default: pixels
    this.yscl = -1;                   // world y axis scale factor, +ve up (always -xscl since isotropic)
    this.xoffset = 0;                 // world x origin offset from viewport left in pixels
    this.yoffset = 0;                 // world y origin offset from viewport bottom in pixels
    this.ctx.textAlign = "left";      // all offsets are handled by lorg facility
    this.ctx.textBaseline = "top";
    this.penCol = "rgba(0, 0, 0, 1.0)";           // black
    this.penWid = 1;                  // pixels
    this.lineCap = "butt";
    this.paintCol = "rgba(128, 128, 128, 1.0)";   // gray
    this.fontSize = 10;               // pt
    this.fontWeight = 400;            // 100..900, 400 = normal,700 = bold
    this.fontFamily = "'Lucinda Console', monospace";
    this.animationObj = null;         // root object of scene when animating
    this.timer = null;                // need to save the rAF id for cancelling
    this.modes = {PAUSED:1, STOPPED:2, PLAYING:3, STEPPING:4};     // animation modes
    this.animMode = this.modes.STOPPED;
    this.prevAnimMode = this.modes.STOPPED;
    this.startTime = 0;               // animation start time (relative to 1970)
    this.currTime = 0;                // timestamp of frame on screen
    this.stepTime = 50;               // animation step time interval (in msec)

    this.worldToPixel = new Transform2D();

    this.getUnique = function()
    {
      uniqueVal += 1;     // a private 'global'
      return uniqueVal;
    };

    this.cnvs.onmousedown = function(evt)
    {
      var event, csrPos, testObj, len, j;

      function getCursorPos(event)
      {
        // pass in any mouse event, returns the position of the cursor in raw pixel coords
        var rect = savThis.cnvs.getBoundingClientRect();

        return {x: event.clientX - rect.left, y: event.clientY - rect.top};
      }

      function hitTest(pathObj)
      {
        var i;
        // create the path (don't stroke it - no-one will see) to test for hit
        savThis.ctx.beginPath();
        if ((pathObj.type == 'TEXT')||(pathObj.type == 'IMG'))   // use bounding box not drawCmds
        {
          for (i=0; i<pathObj.bBoxCmds.length; i++)
          {
            savThis.ctx[pathObj.bBoxCmds[i].drawFn].apply(savThis.ctx, pathObj.bBoxCmds[i].parmsPx);
          }
        }
        else
        {
          for (i=0; i<pathObj.drawCmds.length; i++)
          {
            savThis.ctx[pathObj.drawCmds[i].drawFn].apply(savThis.ctx, pathObj.drawCmds[i].parmsPx);
          }
        }
/*
    // for diagnostics on hit region, uncomment
    savThis.ctx.strokeStyle = 'red';
    savThis.ctx.lineWidth = 4;
    savThis.ctx.stroke();
*/
        return savThis.ctx.isPointInPath(csrPos.x, csrPos.y);
      }

      event = evt || window.event;
      csrPos = getCursorPos(event);  // savThis is any Cango ctx on the canvas
      len = _draggable[savThis.cId].length;
      // run through all the registered objects and test if cursor pos is in their path
      for (j = len-1; j >= 0; j--)       // search last drawn first, it will be on top
      {
        testObj = _draggable[savThis.cId][j];    // for readability
        if (hitTest(testObj))
        {
          // call the grab handler for this object (check it is still enabled)
          if (testObj.dragNdrop)
          {
            testObj.dragNdrop.grab(event, testObj);
            break;
          }
          if ((testObj.parent)&&(testObj.parent.dragNdrop))
          {
            testObj.parent.dragNdrop.grab(event, testObj);
            break;
          }
        }
      }
    };
  };

  Cango2D.prototype.toPixelCoords = function(x, y)
  {
    // transform x,y in world coords to canvas pixel coords (top left is 0,0 y axis +ve down)
    var xPx = this.vpLLx+this.xoffset+x*this.xscl;
    var yPx = this.vpLLy+this.yoffset+y*this.yscl;

    return {x: xPx, y: yPx};
  };

  Cango2D.prototype.toWorldCoords = function(xPx, yPx)
  {
    // transform xPx,yPx in raw canvas pixels to world coords (lower left is 0,0 +ve up)
    var xW = (xPx - this.vpLLx - this.xoffset)/this.xscl;
    var yW = (yPx - this.vpLLy - this.yoffset)/this.yscl;

    return {x: xW, y: yW};
  };

  Cango2D.prototype.getCursorPosWC = function(evt)
  {
    // pass in any mouse event, returns the position of the cursor in raw pixel coords
    var e = evt||window.event;
    var rect = this.cnvs.getBoundingClientRect();

    var xW = (e.clientX - rect.left - this.vpLLx - this.xoffset)/this.xscl;
    var yW = (e.clientY - rect.top - this.vpLLy - this.yoffset)/this.yscl;

    return {x: xW, y: yW};
  };

  Cango2D.prototype.clearCanvas = function(fillColor)
  {
    if (fillColor != undefined)
    {
      // a grad color (specified in world coords) may be used, so switch to world coords to clear
      this.ctx.save();            // there is a communal restore later so save a ctx for it
      // convert to world coords but no object transforms, move them to object drawing origin
      this.ctx.translate(this.vpLLx+this.xoffset, this.vpLLy+this.yoffset);
      this.ctx.scale(this.xscl, this.yscl);
      // now the gradients will be in correct world coorinate position when filling the canvas
      this.ctx.fillStyle = fillColor;
      // calc the canvas lower left x,y and the width and height in world ccords
      this.ctx.fillRect(-(this.vpLLx+this.xoffset)/this.xscl, -(-this.rawHeight+this.vpLLy+this.yoffset)/this.yscl, this.rawWidth/this.xscl, this.rawHeight/this.xscl);

      this.ctx.restore();
    }
    else
    {
      this.ctx.clearRect(0, 0, this.rawWidth, this.rawHeight);
    }
    // all drawing erased, but graphics contexts remain intact
    // clear the draggable array, draggables put back when rendered
    _draggable[this.cId].length = 0;
  };

  Cango2D.prototype.setWorldCoords = function(lowerLeftX, lowerLeftY, spanX)
  {
    var vpLLxWC = lowerLeftX || 0,     // viewport lower left x in world coords
        vpLLyWC = lowerLeftY || 0;     // viewport lower left y in world coords
    if ((spanX === undefined) || (spanX <= 0))
    {
      this.xscl = 1;                    // use pixel units
    }
    else
    {
      this.xscl = this.vpW/spanX;
    }
    this.yscl = -this.xscl;             // isotropic scale
    this.xoffset = -vpLLxWC*this.xscl;
    this.yoffset = -vpLLyWC*this.yscl;
  };

  Cango2D.prototype.setPropertyDefault = function(propertyName, value)
  {
    if ((typeof propertyName != "string")||(value == undefined)||(value == null))
    {
      return;
    }
    switch (propertyName.toLowerCase())
    {
      case "fillcolor":
        if ((typeof value == "string")||(typeof value == "object"))  // gradient will be an object
        {
          this.paintCol = value;
        }
        break;
      case "strokecolor":
        if ((typeof value == "string")||(typeof value == "object"))  // gradient will be an object
        {
          this.penCol = value;
        }
        break;
      case "strokewidth":
        this.penWid = value;
        break;
      case "linecap":
        if ((typeof value == "string")&&((value == "butt")||(value =="round")||(value == "square")))
        {
          this.lineCap = value;
        }
        break;
      case "fontfamily":
        if (typeof value == "string")
        {
          this.fontFamily = value;
        }
        break;
      case "fontsize":
        this.fontSize = value;
        break;
      case "fontweight":
        if ((typeof value == "string")||((value >= 100)&&(value <= 900)))
        {
          this.fontWeight = value;
        }
        break;
      case "steptime":
        if ((value >= 15)&&(value <= 500))
        {
          this.stepTime = value;
        }
        break;
      default:
        return;
    }
  };

  Cango2D.prototype.linearGradientFill = function(x1, y1, x2, y2, x, y, scl)
  {
    var xOfs = x || 0,
        yOfs = y || 0,
        xScale = scl || 1,
        yScale = scl || 1,
        // pixel version of world coordinate parms
        p1x = xOfs+x1*xScale,
        p1y = yOfs+y1*yScale,
        p2x = xOfs+x2*xScale,
        p2y = yOfs+y2*yScale;

    return this.ctx.createLinearGradient(p1x, p1y, p2x, p2y);
  };

  Cango2D.prototype.radialGradientFill = function(x1, y1, r1, x2, y2, r2, x, y, scl)
  {
    var xOfs = x || 0,
        yOfs = y || 0,
        xScale = scl || 1,
        yScale = scl || 1,
        // world coordinate parms (equivalent to compile methods)
        p1x = xOfs+x1*xScale,
        p1y = yOfs+y1*yScale,
        p1r = r1*xScale,
        p2x = xOfs+x2*xScale,
        p2y = yOfs+y2*yScale,
        p2r = r2*xScale;

    return this.ctx.createRadialGradient(p1x, p1y, p1r, p2x, p2y, p2r);
  };

  // this method allows the Object Group2D to be passed the Cango2D environment if necessary
  Cango2D.prototype.createGroup2D = function()
  {
    var grp = new Group2D();
    grp.addObj.apply(grp, arguments);

    return grp;
  };

  Cango2D.prototype.renderFrame = function(obj)
  {
    var savThis = this;

    function drawObj()
    {
      savThis.render(obj, true);  // pass clear canvas = true
    }

    window.requestAnimationFrame(drawObj);
  };

  /*=============================================
   * render will draw a Group2D or Obj2D.
   * If an Obj2D is passed, update the netTfm
   * and render it.
   * If a Group2D is passed, recursively update
   * the netTfm of the group's family tree,
   * then render all Obj2Ds.
   *--------------------------------------------*/
  Cango2D.prototype.render = function(rootObj, clear, animTime)
  {
    var savThis = this,
        objAry = [],
        i, objlen,
        time = animTime || 0;       // may be static render with animation possible - just paint t=0 frame

    function transformDrawCmds(obj)
    {
      // apply the netTfm matrix to all the drawCmds coordinates
      var j, k, tp;
      // transform the text bounding box
      if (obj.type == "TEXT")   // type IMG is done at render time (it may not be loaded)
      {
        // now transform the text bounding box (just moveTo and lineTo, no cPts)
        for(j=0; j < obj.bBoxCmds.length; j++)   // step through the draw segments
        {
          // check for ep since 'closePath' has no end point)
          if (obj.bBoxCmds[j].parms.length)
          {
            tp = obj.netTfm.transformPoint(obj.bBoxCmds[j].parms[0], obj.bBoxCmds[j].parms[1], obj.netTfm.matrix);
            obj.bBoxCmds[j].parmsPx[0] = savThis.vpLLx+savThis.xoffset+tp.x*savThis.xscl;
            obj.bBoxCmds[j].parmsPx[1] = savThis.vpLLy+savThis.yoffset+tp.y*savThis.yscl;
          }
        }
      }
      else if ((obj.type == "PATH")||(obj.type == "SHAPE"))
      {
        for(j=0; j < obj.drawCmds.length; j++)   // step through the draw segments
        {
          for (k=0; k < obj.drawCmds[j].parms.length; k += 2)   // transform each x,y pair
          {
            tp = obj.netTfm.transformPoint(obj.drawCmds[j].parms[k], obj.drawCmds[j].parms[k+1], obj.netTfm.matrix);
            obj.drawCmds[j].parmsPx[k] = savThis.vpLLx+savThis.xoffset+tp.x*savThis.xscl;
            obj.drawCmds[j].parmsPx[k+1] = savThis.vpLLy+savThis.yoffset+tp.y*savThis.yscl;
          }
        }
      }
    }

    function updateTransforms(rootGrp)
    {
      function applyXfm(obj, grp)
      {
        var tp, j;

        if (obj.type == "GRP")    // must be a Group2D
        {
          obj.grpTfm = grp.netTfm;  // grpTfm is always netTfm of the parent Group2D
          // now re-calc the group's netTfm which will be passed on to its kids
          if (obj.animTfmAry.length)
          {
            obj.ofsTfm.reset();       // clear out previous transform
            for (j=0; j<obj.animTfmAry.length; j++)
            {
              if (obj.animTfmAry[j] instanceof Tweener)  // this is a Tweener get the current matrix
              {
                obj.ofsTfm.applyTransform(obj.animTfmAry[j].getMatrix(time));
              }
              else
              {
                obj.ofsTfm.applyTransform(obj.animTfmAry[j]);    // ofsTfmAry is array of 3x3 matrices
              }
            }
          }
          else    // no animation so check static transforms
          {
            // don't clear out previous transforms, it can be used to accumulate movements
            for (j=0; j<obj.ofsTfmAry.length; j++)
            {
              if (obj.ofsTfmAry[j] instanceof Tweener)  // this is a Tweener get the current matrix
              {
                obj.ofsTfm.applyTransform(obj.ofsTfmAry[j].getMatrix(time));
              }
              else
              {
                obj.ofsTfm.applyTransform(obj.ofsTfmAry[j]);    // ofsTfmAry is array of 3x3 matrices
              }
            }
            // obj.ofsTfm now is updated, reset the ofsTfmAry array
            obj.ofsTfmAry.length = 0;
          }
          // obj.ofsTfm now is net softfTransforms
          obj.netTfm.matrixMult(obj.ofsTfm.matrix, obj.grpTfm.matrix);
          // apply this to the group drawing origin for drag and drop
          tp = obj.netTfm.transformPoint(0, 0, obj.netTfm.matrix);
          obj.dwgOrg.x = tp.x;
          obj.dwgOrg.y = tp.y;
        }
        else   // Obj2D
        {
          obj.grpTfm = grp.netTfm;
          // now calc the netTfm
          if (obj.animTfmAry.length)
          {
            obj.ofsTfm.reset();       // clear out previous transform
            for (j=0; j<obj.animTfmAry.length; j++)
            {
              if (obj.animTfmAry[j] instanceof Tweener)  // Tweener, so get the current matrix
              {
                obj.ofsTfm.applyTransform(obj.animTfmAry[j].getMatrix(time));
              }
              else
              {
                obj.ofsTfm.applyTransform(obj.animTfmAry[j]);
              }
            }
          }
          else
          {
            // don't clear out previous transforms, it can be used to accumulate movements
            for (j=0; j<obj.ofsTfmAry.length; j++)
            {
              if (obj.ofsTfmAry[j] instanceof Tweener)  // Tweener, so get the current matrix
              {
                obj.ofsTfm.applyTransform(obj.ofsTfmAry[j].getMatrix(time));
              }
              else
              {
                obj.ofsTfm.applyTransform(obj.ofsTfmAry[j]);
              }
            }
            // obj.ofsTfm now is updated, reset the ofsTfmAry array to avoid memory leak
            obj.ofsTfmAry.length = 0;
          }
          // ofsTfm now is total of all softfTransforms
          obj.netTfm.matrixMult(obj.hardOfsTfm.matrix, obj.ofsTfm.matrix); // apply softTfm to hardTfm
          obj.netTfm.applyTransform(obj.grpTfm.matrix);     // apply inherited group tfms
          // calc the transformed dwgOrg coords, dwgOrg only moved by softTfm and group soft
          obj.orgTfm.matrixMult(obj.ofsTfm.matrix, obj.grpTfm.matrix);
          tp = obj.netTfm.transformPoint(0, 0, obj.orgTfm.matrix);
          obj.dwgOrg.x = tp.x;
          obj.dwgOrg.y = tp.y;
          transformDrawCmds(obj, grp);     // pass the parent group too
        }
      }
      // task:function, grp: group with children
    	function iterate(task, grp)
    	{
    	  var x, childNode;
    		for (x=0; x<grp.children.length; x++)
    		{
    			childNode = grp.children[x];
      	  if (childNode.type != "GRP")    // find Obj2Ds to draw
          {
            objAry.push(childNode);       // just push into the array to be drawn
          }
     			task(childNode, grp);
    			if (childNode.children != undefined)
          {
    				iterate(task, childNode);
          }
    		}
    	}
      // now propagate the current grpXfm through the tree of children
      iterate(applyXfm, rootGrp);
    }

    function paintersSort(p1, p2)
    {
      return p1.zIndex - p2.zIndex;
    }

// ============ Start Here =====================================================

    if (clear === true)
    {
      this.clearCanvas();
    }
    if (rootObj.type == "GRP")
    {
      if (rootObj.animTfmAry.length)    // animations trump static transforms
      {
        rootObj.ofsTfm.reset();       // clear out previous transform
        // calculate rootObj current ofsTfm to propagate to the kids
        for (i=0; i < rootObj.animTfmAry.length; i++)
        {
          if (rootObj.animTfmAry[i] instanceof Tweener)  // this is a Tweener get the current matrix
          {
            rootObj.ofsTfm.applyTransform(rootObj.animTfmAry[i].getMatrix(time));
          }
          else
          {
            rootObj.ofsTfm.applyTransform(rootObj.animTfmAry[i]); // ofsTfmAry is array of 3x3 matrices
          }
        }
      }
      else
      {
        // don't reset the ofsTfm, it can be used to accululate transform effects
        // calculate rootObj current ofsTfm to propagate to the kids
        for (i=0; i < rootObj.ofsTfmAry.length; i++)
        {
          if (rootObj.ofsTfmAry[i] instanceof Tweener)  // this is a Tweener get the current matrix
          {
            rootObj.ofsTfm.applyTransform(rootObj.ofsTfmAry[i].getMatrix(time));
          }
          else
          {
            rootObj.ofsTfm.applyTransform(rootObj.ofsTfmAry[i]); // ofsTfmAry is array of 3x3 matrices
          }
        }
        // rootObj..ofsTfm now is updated, reset the ofsTfmAry array
        rootObj.ofsTfmAry.length = 0;
      }
      // rootObj.ofsTfm now is net of all ofsTfmAry effects
      rootObj.netTfm.matrixMult(rootObj.ofsTfm.matrix, rootObj.grpTfm.matrix);
      rootObj.dwgOrg = rootObj.netTfm.transformPoint(0, 0, rootObj.netTfm.matrix);

      updateTransforms(rootObj);   // apply transforms and populate objAry with Obj2Ds to be drawn
      objAry.sort(paintersSort);   // Depth sort Obj2Ds within group
      // now render the Obj2Ds onto the canvas
      for (i=0, objlen=objAry.length; i<objlen; i++)
      {
        if (objAry[i].type == "IMG")
        {
          if (objAry[i].width>0)  // image loaded, and width set?
          {
            this._paintImg(objAry[i]);
          }
          else
          {
            // objAry[i].drawCmds actually points to the image object
            addLoadEvent(objAry[i].drawCmds, function(){savThis._paintImg(objAry[i]);});
          }
        }
        else if (objAry[i].type == "TEXT")
        {
          this._paintText(objAry[i]);
        }
        else    // PATH, SHAPE
        {
          this._paintPath(objAry[i]);
        }
      }
    }
    else   // Obj2D
    {
      if (rootObj.animTfmAry.length)  // animations trump static transforms
      {
        rootObj.ofsTfm.reset();       // clear out previous transform
        // calc the net matrix from Obj2D hardOfsTfm and ofsTfmAry
        for (i=0; i < rootObj.animTfmAry.length; i++)
        {
          if (rootObj.animTfmAry[i] instanceof Tweener)  // a Tweener get the current matrix
          {
            rootObj.ofsTfm.applyTransform(rootObj.animTfmAry[i].getMatrix(time));
          }
          else
          {
            rootObj.ofsTfm.applyTransform(rootObj.animTfmAry[i]); // ofsTfmAry is array of 3x3 matrices
          }
        }
      }
      else
      {
        // don't reset the ofsTfm, it can be used to accululate transform effects
        // calc the net matrix from Obj2D hardOfsTfm and ofsTfmAry
        for (i=0; i < rootObj.ofsTfmAry.length; i++)
        {
          if (rootObj.ofsTfmAry[i] instanceof Tweener)  // a Tweener get the current matrix
          {
            rootObj.ofsTfm.applyTransform(rootObj.ofsTfmAry[i].getMatrix(time));
          }
          else
          {
            rootObj.ofsTfm.applyTransform(rootObj.ofsTfmAry[i]);    // ofsTfmAry is array of 3x3 matrices
          }
        }
        // rootObj.ofsTfm now is updated, reset the ofsTfmAry array
        rootObj.ofsTfmAry.length = 0;
      }
      rootObj.netTfm.matrixMult(rootObj.hardOfsTfm.matrix, rootObj.ofsTfm.matrix);
      rootObj.orgTfm = rootObj.ofsTfm;          // only soft transforms move the dwgOrg
      // calc the transformed dwgOrg coords, dwgOrg only moved by softTfm
      rootObj.dwgOrg = rootObj.netTfm.transformPoint(0, 0, rootObj.orgTfm.matrix);
      transformDrawCmds(rootObj);

      if (rootObj.type == "IMG")
      {
        if (rootObj.width>0)  // image loaded, and width set?
        {
          this._paintImg(rootObj);
        }
        else
        {
          addLoadEvent(rootObj.drawCmds, function(){savThis._paintImg(rootObj);});
        }
      }
      else if (rootObj.type == "TEXT")
      {
        this._paintText(rootObj);
      }
      else    // PATH, SHAPE
      {
        this._paintPath(rootObj);
      }
    }
  };

  Cango2D.prototype._paintImg = function(pathObj)
  {
    // should only be called after image has been loaded into drawCmds
    var j, tp, dCmd,
        img = pathObj.drawCmds,     // this is the place the image is stored in object
        scale = pathObj.imgXscale;

    this.ctx.save();   // save the clean ctx
    // NOTE: these transforms get applied in reverse order
    this.worldToPixel.reset();   // reset to identity matrix
    // flip world coordinates, to +ve down so images stay upright
    this.worldToPixel.scale(1/this.xscl, 1/this.yscl);    // pixel to world scale
    // apply the img.netTfm to this world transform
    this.worldToPixel.applyTransform(pathObj.netTfm.matrix);
    this.worldToPixel.scale(this.xscl, this.yscl);  // scale to pixels (and
    this.worldToPixel.translate(this.vpLLx + this.xoffset, this.vpLLy + this.yoffset);
    transformCtx(this.ctx, this.worldToPixel);
    // now insert the image at the rotation radius from the origin and scaled in width
    this.ctx.drawImage(img, scale*pathObj.imgX, scale*pathObj.imgY,
                            scale*pathObj.width, scale*pathObj.height);
    this.ctx.restore();    // undo the transforms

    // make a hitRegion boundary path around the image to be checked on mousedown
    for(j=0; j < pathObj.bBoxCmds.length; j++)   // step through the draw segments
    {
      dCmd = pathObj.bBoxCmds[j];
      if (dCmd.parms.length)    // last cmd is closePath has no parms
      {
        tp = pathObj.netTfm.transformPoint(dCmd.parms[0], dCmd.parms[1], pathObj.netTfm.matrix);
        dCmd.parmsPx[0] = this.vpLLx+this.xoffset+tp.x*this.xscl;
        dCmd.parmsPx[1] = this.vpLLy+this.yoffset+tp.y*this.yscl;
      }
    }
    if (pathObj.dragNdrop != null)
    {
      // now push it into Cango2D.draggable array, its checked by canvas mousedown event handler
      if (!_draggable[this.cId].contains(pathObj))
      {
        _draggable[this.cId].push(pathObj);
      }
    }
    else if ((pathObj.parent)&&(pathObj.parent.dragNdrop != null))
    {
      // check if parent group is draggable
      if (!_draggable[this.cId].contains(pathObj))
      {
        _draggable[this.cId].push(pathObj);
      }
    }
  };

  Cango2D.prototype._paintPath = function(pathObj)
  {
    // used for type: PATH, SHAPE
    var fill = null,
        i;

    this.ctx.save();   // save current context
    this.worldToPixel.reset();   // reset to identity matrix
    // change canvas to world coordinates, y +ve up the screen
    // apply the pathObj.netTfm to this transform
    this.worldToPixel.applyTransform(pathObj.netTfm.matrix);
    this.worldToPixel.scale(this.xscl, this.yscl);  // isotropic (yscl = -xscl)
    this.worldToPixel.translate(this.vpLLx+this.xoffset, this.vpLLy+this.yoffset);
    transformCtx(this.ctx, this.worldToPixel);

    this.ctx.beginPath();
    for (i=0; i<pathObj.drawCmds.length; i++)
    {
      this.ctx[pathObj.drawCmds[i].drawFn].apply(this.ctx, pathObj.drawCmds[i].parms); // draw the path
    }
    // if a SHAPE, fill with color
    if (pathObj.type == "SHAPE")
    {
      // pathObj.fillCol may be a function that generates dynamic color (so call it)
      if (pathObj.fillCol instanceof Function)
      {
        fill = pathObj.fillCol(arguments);
        this.ctx.fillStyle = fill;
        this.ctx.fill();
      }
      else if (typeof(pathObj.fillCol) == 'object')  // gradient
      {
        // make the current transformed path the current path, but don't fill.
        this.ctx.clip();
        this.ctx.restore();        // put back the pixel coord state

        this.ctx.save();            // there is a communal restore later so save a ctx for it
        // convert to world coords but no object transforms, move them to object drawing origin
        this.ctx.translate(this.vpLLx+this.xoffset+pathObj.dwgOrg.x*this.xscl,
                           this.vpLLy+this.yoffset+pathObj.dwgOrg.y*this.yscl);
        this.ctx.scale(this.xscl, this.yscl);
        // now the gradients will not be rotated so we can fill the current path
        this.ctx.fillStyle = pathObj.fillCol;
        this.ctx.fill();
      }
      else  // string
      {
        fill = pathObj.fillCol;
        this.ctx.fillStyle = fill;
        this.ctx.fill();
      }
      this.ctx.strokeStyle = pathObj.strokeCol;
    }
    else  // PATH
    {
      // pathObj.strokeCol may be a function that generates dynamic color (so call it)
      if (pathObj.strokeCol instanceof Function)
      {
        this.ctx.strokeStyle = pathObj.strokeCol(arguments);
      }
      else
      {
        this.ctx.strokeStyle = pathObj.strokeCol;
      }
      this.ctx.lineCap = pathObj.strokeCap;
    }
    this.ctx.lineWidth = Math.abs(pathObj.strokeWidth)/this.xscl;  // stokeWidth in pixels
    this.ctx.stroke();
    // restore the pixel context
    this.ctx.restore();
    if (pathObj.dragNdrop != null)
    {
      // now push it into Cango.draggable array, its checked by canvas mousedown event handler
      if (!_draggable[this.cId].contains(pathObj))
      {
        _draggable[this.cId].push(pathObj);
      }
    }
    else if ((pathObj.parent)&&(pathObj.parent.dragNdrop != null))
    {
      // check if parent group is draggable
      if (!_draggable[this.cId].contains(pathObj))
      {
        _draggable[this.cId].push(pathObj);
      }
    }
  };

  Cango2D.prototype._paintText = function(pathObj)
  {
    this.ctx.save();   // save the clean ctx
    this.worldToPixel.reset();   // reset to identity matrix
    // change canvas to world coordinates, Right Handed, y +ve up the screen
    this.worldToPixel.scale(1/this.xscl, 1/this.yscl);    // pixel to world scale
    this.worldToPixel.applyTransform(pathObj.netTfm.matrix);
    this.worldToPixel.scale(this.xscl, this.yscl);    // back to pixels for text writing
    this.worldToPixel.translate(this.vpLLx + this.xoffset, this.vpLLy + this.yoffset); //viewport offset
    transformCtx(this.ctx, this.worldToPixel);

    this.ctx.font = pathObj.fontWeight.toString()+" "+pathObj.fontSize+"px "+this.fontFamily;
    // set the fillStyle to strokeColor for text
    // pathObj.fillCol may be a function that generates dynamic color (so call it)
    if (pathObj.strokeCol instanceof Function)
    {
      this.ctx.fillStyle = pathObj.strokeCol(arguments);
    }
    else
    {
      this.ctx.fillStyle = pathObj.strokeCol;
    }
    // now actually fill the text
    this.ctx.fillText(pathObj.drawCmds, pathObj.imgX, pathObj.imgY);
     // undo the translation
    this.ctx.restore();

    if (pathObj.dragNdrop != null)
    {
      // now push it into Cango2D.draggable array, its checked by canvas mousedown event handler
      if (!_draggable[this.cId].contains(pathObj))
      {
        _draggable[this.cId].push(pathObj);
      }
    }
    else if ((pathObj.parent)&&(pathObj.parent.dragNdrop != null))
    {
      // check if parent group is draggable
      if (!_draggable[this.cId].contains(pathObj))
      {
        _draggable[this.cId].push(pathObj);
      }
    }
  };

  Cango2D.prototype.compilePath = function(path, color, scl, lineWidth)
  {
    var scale = scl || 1,
        cvsCmds,
        pathObj;
    // now send these off to the svg segs to canvas DrawCmd processor
    cvsCmds = cgo2DtoDrawCmd(path, scale);
    pathObj = new Obj2D(this, cvsCmds, "PATH", null, color, null);
    pathObj.strokeWidth = lineWidth || this.penWid;

    return pathObj;
  };

  Cango2D.prototype.compileShape = function(path, fillColor, strokeColor, scl)
  {
    var scale = scl || 1,
        cvsCmds,
        pathObj;

    // now send these off to the svg segs-to-canvas DrawCmd processor
    cvsCmds = cgo2DtoDrawCmd(path, scale);
    pathObj = new Obj2D(this, cvsCmds, "SHAPE", fillColor, strokeColor);

    return pathObj;
  };

  Cango2D.prototype.compileText = function(str, color, fontSz, fontWt, lorigin)
  {
    var weight = this.fontWeight,         // default = 400
        size = fontSz || this.fontSize,   // fontSize in pts
        lorg = lorigin || 1,
        wid, hgt, wid2, hgt2,
        lorgWC, dx, dy,
        pathObj = null;

    if (typeof str != 'string')
    {
      return pathObj;
    }
    if (typeof fontWt == 'string')
    {
      weight = fontWt;           // 'bold' etc
    }
    else if (isNumber(fontWt) && (fontWt > 99) && (fontWt < 901))
    {
      weight = fontWt;           // 100 .. 900
    }
    size *= 1.3;    // points to pixels
    pathObj = new Obj2D(this, str, "TEXT", null, color);
    this.ctx.save();
    // set the drawing context to measure the size
    this.ctx.font = size+"px "+this.fontFamily;
    wid = this.ctx.measureText(str).width;   // width in pixels
    this.ctx.restore();
    // all text rendering is done in pixels, calc lorg offsets in pixels
    hgt = size;   // Note: char cell is ~1.5*fontSize pixels high
    wid2 = wid/2;
    hgt2 = hgt/2;
    lorgWC = [0, [0, 0],    [wid2, 0],    [wid, 0],
                 [0, hgt2], [wid2, hgt2], [wid, hgt2],
                 [0, hgt],  [wid2, hgt],  [wid, hgt]];
    dx = -lorgWC[lorg][0];
    dy = -lorgWC[lorg][1];
    pathObj.imgX = dx;      // world coords offset to drawing origin
    pathObj.imgY = dy;
    pathObj.width = wid;
    pathObj.height = hgt;
    pathObj.fontSize = size;
    pathObj.fontWeight = weight;
    // construct the DrawCmds for the text bounding box
    pathObj.bBoxCmds[0] = new DrawCmd("moveTo", [dx, -dy]);           // upper left
    pathObj.bBoxCmds[1] = new DrawCmd("lineTo", [dx, -dy-hgt]);       // lower left
    pathObj.bBoxCmds[2] = new DrawCmd("lineTo", [dx+wid, -dy-hgt]);   // lower right
    pathObj.bBoxCmds[3] = new DrawCmd("lineTo", [dx+wid, -dy]);       // upper right
    pathObj.bBoxCmds[4] = new DrawCmd("closePath", []);

    return pathObj;
  };

  Cango2D.prototype.compileImg = function(imgRef, w, lorigin)
  {
    var savThis = this,
        lorg = lorigin || 1,
        img = (imgRef instanceof Image)? imgRef: new Image(),  // Image object
        imgObj = new Obj2D(this, img, "IMG", null, null);      // colors=null

    function configImgObj()  // call when image loaded
    {
      // save width in pixels (its rendered that way)
      var wid = w || 0,
          hgt,
          hgt2, wid2, lorgWC,
          dx, dy;

      if (wid)
      {
        wid *= savThis.xscl;   // save width in pixels
      }
      else
      {
        wid = imgObj.drawCmds.width;   // if w not specified use natural width
      }
      hgt = wid*imgObj.drawCmds.height/imgObj.drawCmds.width;  // keep aspect ratio
      wid2 = wid/2;
      hgt2 = hgt/2;
      lorgWC = [0, [0, 0],    [wid2, 0],    [wid, 0],
                   [0, hgt2], [wid2, hgt2], [wid, hgt2],
                   [0, hgt],  [wid2, hgt],  [wid, hgt]];
      dx = -lorgWC[lorg][0];
      dy = -lorgWC[lorg][1];
      imgObj.imgX = dx;     // world coords offset to drawing origin
      imgObj.imgY = dy;
      imgObj.width = wid;
      imgObj.height = hgt;
      // construct the DrawCmds for the text bounding box
      imgObj.bBoxCmds[0] = new DrawCmd("moveTo", [dx, -dy]);           // ul
      imgObj.bBoxCmds[1] = new DrawCmd("lineTo", [dx, -dy-hgt]);       // ll
      imgObj.bBoxCmds[2] = new DrawCmd("lineTo", [dx+wid, -dy-hgt]);   // lr
      imgObj.bBoxCmds[3] = new DrawCmd("lineTo", [dx+wid, -dy]);       // ur
      imgObj.bBoxCmds[4] = new DrawCmd("closePath", []);
    }

    if (imgRef instanceof Image)
    {
      // img already a valid Image object
      imgObj.drawCmds = imgRef;   // save the Image in Obj2D drawCmds property
      configImgObj();
    }
    else
    {
      imgObj.drawCmds = img;  // an empty iImage object
      imgObj.drawCmds.src = "";
      addLoadEvent(imgObj.drawCmds, configImgObj);
      // start to load the image
      imgObj.drawCmds.src = imgRef;
    }

    return imgObj;
  };

  Cango2D.prototype.drawPath = function(path, x, y, color, scl)
  {
    var pathObj = this.compilePath(path, color, scl, null);
    pathObj.transform.translate(x, y);
    this.render(pathObj);
    return pathObj;
  };

  Cango2D.prototype.drawShape = function(path, x, y, fillColor, scl)
  {
    // outline the same as fill color
    var pathObj = this.compileShape(path, fillColor, fillColor, scl);
    pathObj.transform.translate(x, y);
    this.render(pathObj);
    return pathObj;
  };

  Cango2D.prototype.drawText = function(str, x, y, color, ptSize, lorg)
  {
    var pathObj = this.compileText(str, color, ptSize, null, lorg);
    pathObj.transform.translate(x, y);
    this.render(pathObj);
    return pathObj;
  };

  Cango2D.prototype.drawImg = function(imgRef, x, y, w, lorigin)  // just load img then call render
  {
    var savThis = this,
        xOfs = x || 0,
        yOfs = y || 0,
        lorg = lorigin || 1,
        img = (imgRef instanceof Image)? imgRef: new Image(),  // Image object
        imgObj = new Obj2D(this, img, "IMG", null, null, lorg);

    function configImgObj()  // call when image loaded
    {
      // save width in pixels (its rendered that way)
      var wid = w || 0,
          hgt,
          hgt2, wid2, lorgWC,
          dx, dy;

      if (wid)
      {
        wid *= savThis.xscl;   // save width in pixels
      }
      else
      {
        wid = imgObj.drawCmds.width;   // if w not specified use natural width
      }
      hgt = wid*imgObj.drawCmds.height/imgObj.drawCmds.width;  // keep aspect ratio
      wid2 = wid/2;
      hgt2 = hgt/2;
      lorgWC = [0, [0, 0],    [wid2, 0],    [wid, 0],
                   [0, hgt2], [wid2, hgt2], [wid, hgt2],
                   [0, hgt],  [wid2, hgt],  [wid, hgt]];
      dx = -lorgWC[lorg][0];
      dy = -lorgWC[lorg][1];
      imgObj.imgX = dx;     // world coords offset to drawing origin
      imgObj.imgY = dy;
      imgObj.width = wid;
      imgObj.height = hgt;
      // construct the DrawCmds for the text bounding box
      imgObj.bBoxCmds[0] = new DrawCmd("moveTo", [dx, -dy]);           // ul
      imgObj.bBoxCmds[1] = new DrawCmd("lineTo", [dx, -dy-hgt]);       // ll
      imgObj.bBoxCmds[2] = new DrawCmd("lineTo", [dx+wid, -dy-hgt]);   // lr
      imgObj.bBoxCmds[3] = new DrawCmd("lineTo", [dx+wid, -dy]);       // ur
      imgObj.bBoxCmds[4] = new DrawCmd("closePath", []);
      // render the loaded image
      savThis.render(imgObj);
    }

    imgObj.transform.translate(xOfs, yOfs);     // soft transform to x,y
    if (imgRef instanceof Image)
    {
      // img already a valid Image object
      imgObj.drawCmds = imgRef;   // save the Image in Obj2D drawCmds property
      configImgObj();
    }
    else
    {
      imgObj.drawCmds = img;  // an empty iImage object
      imgObj.drawCmds.src = "";
      addLoadEvent(imgObj.drawCmds, configImgObj);
      // start to load the image
      imgObj.drawCmds.src = imgRef;
    }

    return imgObj;
  };

  Cango2D.prototype.clipPath = function(pathObj)
  {
    if ((this.type == "IMG")||(this.type == "TEXT"))
    {
      return;
    }
    var pxlCoords = [];
    var i, j;
    this.ctx.save();             // not required when resetClip is supported
    this.ctx.beginPath();
    for (i=0; i<pathObj.drawCmds.length; i++)
    {
      for (j=0; j<pathObj.drawCmds[i].parms.length; j+=2)  // convert x,y coord pairs to pixel coords
      {
        pxlCoords[j] = this.vpLLx+this.xoffset+this.xscl*pathObj.drawCmds[i].parms[j];
        if (pathObj.iso)
        {
          pxlCoords[j+1] = this.vpLLy+this.yoffset-this.xscl*pathObj.drawCmds[i].parms[j+1];
        }
        else
        {
          pxlCoords[j+1] = this.vpLLy+this.yoffset+this.yscl*pathObj.drawCmds[i].parms[j+1];
        }
      }
      this.ctx[pathObj.drawCmds[i].drawFn].apply(this.ctx, pxlCoords); // actually draw the path
    }
    this.ctx.clip();
  };

  Cango2D.prototype.resetClip = function()
  {
    // this.ctx.resetClip();       // not supported in bowsers yet (Feb13)
    this.ctx.restore();            // use this until resetClip is supported
  };

  Cango2D.prototype.animate = function(rootObj)
  {
    this.stopAnimation();   // make sure we are not still running and old animation
    this.animationObj = rootObj;
  };

  Cango2D.prototype.stopAnimation = function()
  {
    window.cancelAnimationFrame(this.timer);
    this.prevAnimMode = this.animMode;
    this.animMode = this.modes.STOPPED;
    // reset the currTime so play and step know to start again
    this.currTime = 0;
  };

  Cango2D.prototype.pauseAnimation = function()
  {
    window.cancelAnimationFrame(this.timer);
    this.prevAnimMode = this.animMode;
    this.animMode = this.modes.PAUSED;
  };

  Cango2D.prototype.stepAnimation = function()
  {
    var savThis = this;

    // this is the actual animator that draws the frame
    function drawIt()
    {
      var temp,
          localTime,
          time = Date.now();    // use this as a time stamp, browser don't all pass the same time code

      if (savThis.prevAnimMode == savThis.modes.STOPPED)
      {
        savThis.startTime = time;                // forces localTime = 0 to start from beginning
      }
      localTime =  time - savThis.startTime;
      // do all the drawing for this frame
      savThis.clearCanvas();
      if (savThis.buffered)
      {
        // drawing will be off screen, clear buffer
        savThis.bufCtx.clearRect(0, 0, savThis.rawWidth, savThis.rawHeight);
        // swap buffers while drawing done off scrreen
        temp = savThis.ctx;
        savThis.ctx = savThis.bufCtx;
      }
      savThis.render(savThis.animationObj, false, localTime);  // handle clearCanvas here
      if (savThis.buffered)
      {
        // drawing done, switch them back
        savThis.ctx = temp;
        // now bit-blt the image in buffer to the on-screen canvas (all drawing over written)
        savThis.ctx.drawImage(_buf[savThis.cId], 0, 0);
      }
      savThis.currTime = localTime;      // timestamp of what is currently on screen
      savThis.prevAnimMode = savThis.modes.PAUSED;
      savThis.animMode = savThis.modes.PAUSED;
    }

    // eqivalent to play for one frame and pause
    if (this.animMode == this.modes.PLAYING)
    {
      return;
    }
    // make the buffered drawing context match the screen ctx
    if (this.buffered)
    {
      this.bufCtx.strokeStyle = this.penCol;
      this.bufCtx.fillStyle = this.paintCol;
      this.bufCtx.lineWidth = this.penWid;
      this.bufCtx.lineCap = this.lineCap;
    }
    if (this.animMode == this.modes.PAUSED)
    {
      this.startTime = Date.now() - this.currTime;  // move time as if currFrame just drawn
    }
    this.prevAnimMode = this.animMode;
    this.animMode = this.modes.STEPPING;

    setTimeout(drawIt, this.stepTime);
  };

  Cango2D.prototype.playAnimation = function()
  {
    // this.animationObj and its family tree get drawn each frame any object with
    // animateTransform set have had their tweener added to the ofsTfmAry
    // When rendered the Tweenner getMatrix is called and its matrix applied like any
    // other transform. All getMatrix calls get passed the same value of localtime
    // each frame to keep sync.
    // this routine is the 'stepper' from timeline
    var savThis = this;

    // this is the actual animator that draws each frame
    function drawIt()
    {
      var temp,
          localTime,
          time = Date.now();    // use this as a time stamp, browser don't all pass the same time code

      if (savThis.prevAnimMode == savThis.modes.STOPPED)
      {
        savThis.startTime = time;                // forces localTime = 0 to start from beginning
      }
      localTime =  time - savThis.startTime;

      savThis.clearCanvas();
      if (savThis.buffered)
      {
        // drawing will be off screen, clear buffer
        savThis.bufCtx.clearRect(0, 0, savThis.rawWidth, savThis.rawHeight);
        // swap buffers while drawing done off scrreen
        temp = savThis.ctx;
        savThis.ctx = savThis.bufCtx;
      }
      savThis.render(savThis.animationObj, false, localTime);  // clear is false, clearing handled here
      if (savThis.buffered)
      {
        // drawing done, switch them back
        savThis.ctx = temp;
        // now bit-blt the image in buffer to the on-screen canvas
        savThis.ctx.drawImage(_buf[savThis.cId], 0, 0);
      }
      savThis.currTime = localTime;      // timestamp of what is currently on screen
      savThis.prevAnimMode = savThis.modes.PLAYING;
      savThis.timer = window.requestAnimationFrame(drawIt);
    }

    if (this.animMode == this.modes.PLAYING)
    {
      return;
    }
    // make the buffered drawing context match the screen ctx
    if (this.buffered)
    {
      this.bufCtx.strokeStyle = this.penCol;
      this.bufCtx.fillStyle = this.paintCol;
      this.bufCtx.lineWidth = this.penWid;
      this.bufCtx.lineCap = this.lineCap;
    }
    if (this.animMode == this.modes.PAUSED)
    {
      this.startTime = Date.now() - this.currTime;  // move time as if currFrame just drawn
    }

    this.prevAnimMode = this.animMode;
    this.animMode = this.modes.PLAYING;

    this.timer = window.requestAnimationFrame(drawIt);
  };

  Cango2D.prototype.createLayer = function()
  {
    var ovlHTML, overlay, newCvs,
        w = this.rawWidth,
        h = this.rawHeight,
        unique, ovlId,
        topCvs = this.cnvs,
        topId;

    unique = this.getUnique();
    ovlId = this.cId+"_ovl_"+unique;
    ovlHTML = "<canvas id='"+ovlId+"' style='position:absolute' width='"+w+"' height='"+h+"'></canvas>";
    if (_overlays[this.cId].length)
    {
      topId = _overlays[this.cId][_overlays[this.cId].length-1];
      topCvs = document.getElementById(topId);
    }
    topCvs.insertAdjacentHTML('afterend', ovlHTML);
    // make it the same size as the background canvas
    newCvs = document.getElementById(ovlId);
    newCvs.style.backgroundColor = "transparent";
    newCvs.style.left = this.cnvs.offsetLeft+'px';
    newCvs.style.top = this.cnvs.offsetTop+'px';
    newCvs.style.width = this.cnvs.offsetWidth+'px';
    newCvs.style.height = this.cnvs.offsetHeight+'px';
    // save the ID in an array to facilitate removal
    _overlays[this.cId].push(ovlId);

    return ovlId;    // return the new canvas id for call to new Cango(id)
  };

  Cango2D.prototype.deleteLayer = function(ovlyId)
  {
    var ovlNode,
        idx = _overlays[this.cId].indexOf(ovlyId);

    if (idx !== -1)
    {
      ovlNode = document.getElementById(ovlyId);
      if (ovlNode)       // there is a id stored but no actual canvas
      {
        ovlNode.parentNode.removeChild(ovlNode);
      }
      // now delete overlays array element
      _overlays[this.cId].splice(idx,1);       // delete the id
    }
  };

  // copy the basic graphics context values (for an overlay)
  Cango2D.prototype.dupCtx = function(src_graphCtx)
  {
    // copy all the graphics context parameters into the overlay ctx.
    this.vpLLx = src_graphCtx.vpLLx;      // vp lower left from canvas left in pixels
    this.vpLLy = src_graphCtx.vpLLy;      // vp lower left from canvas top
    this.xscl = src_graphCtx.xscl;        // world x axis scale factor
    this.yscl = src_graphCtx.yscl;        // world y axis scale factor
    this.xoffset = src_graphCtx.xoffset;  // world x origin offset from viewport left in pixels
    this.yoffset = src_graphCtx.yoffset;  // world y origin offset from viewport bottom in pixels
    this.penCol = src_graphCtx.penCol.slice(0);   // copy value not reference
    this.penWid = src_graphCtx.penWid;    // pixels
    this.lineCap = src_graphCtx.lineCap.slice(0);
    this.paintCol = src_graphCtx.paintCol.slice(0);
    this.fontSize = src_graphCtx.fontSize;
    this.fontWeight = src_graphCtx.fontWeight;
    this.fontFamily = src_graphCtx.fontFamily.slice(0);
  };

  Drag2D = function(cangoGC, grabFn, dragFn, dropFn)
  {
    var savThis = this;

    this.cgo = cangoGC;
    this.parent = null;                 // filled in on grab as this drag2D may be used by seveal Obj2D
    this.grabCallback = grabFn || null;
    this.dragCallback = dragFn || null;
    this.dropCallback = dropFn || null;
    this.dwgOrg = {x:0, y:0};           // parent (Obj2D) drawing origin in world coords
    this.grabOfs = {x:0, y:0};          // csr offset from parent (maybe Obj or Group) drawing origin
    this.dwgOrgOfs = {x:0, y:0};        // parent dwgOrg offset from its parent dwgOrg
    this.grpGrabOfs = {x:0, y:0};       // cursor offset from the parent's parent Group2D drawing origin
    // these closures are called in the scope of the Drag2D instance so 'this' points to the Drag2D
    // multplie Obj2D may use this Drag2D, hitTest passes back which it was
    this.grab = function(evt, grabbedObj)
    {
      var event = evt||window.event;
      // this Drag2D may be attached to Obj2D's Group2D parent
      if (grabbedObj.dragNdrop != null)
      {
        this.parent = grabbedObj;      // the parent is an Obj2D
      }
      else if ((grabbedObj.parent)&&(grabbedObj.parent.dragNdrop))
      {
        this.parent = grabbedObj.parent;   // the parent is a Group2D
      }
      else  // cant find the dragNdrop for this grab
      {
        return;
      }
      this.dwgOrg = this.parent.dwgOrg;

      this.cgo.cnvs.onmouseup = function(e){savThis.drop(e);};
      var csrPosWC = this.cgo.getCursorPosWC(event);      // update mouse pos to pass to the owner
      // copy the parent drawing origin (for convenience)
      this.grabOfs = {x:csrPosWC.x - this.dwgOrg.x,
                      y:csrPosWC.y - this.dwgOrg.y};
      if (this.parent.parent)
      {
        this.dwgOrgOfs = {x:this.dwgOrg.x - this.parent.parent.dwgOrg.x,
                          y:this.dwgOrg.y - this.parent.parent.dwgOrg.y};
      }
      else
      {
        this.dwgOrgOfs = {x:this.dwgOrg.x, y:this.dwgOrg.y};
      }
      // save the cursor offset from the parent's parent Group2D drawing origin (world coords)
      this.grpGrabOfs = {x:csrPosWC.x - this.dwgOrgOfs.x,
                         y:csrPosWC.y - this.dwgOrgOfs.y};

      if (this.grabCallback)
      {
        this.grabCallback(csrPosWC);    // call in the scope of dragNdrop object
      }

      this.cgo.cnvs.onmousemove = function(event){savThis.drag(event);};
      if (event.preventDefault)       // prevent default browser action (W3C)
      {
        event.preventDefault();
      }
      else                        // shortcut for stopping the browser action in IE
      {
        window.event.returnValue = false;
      }
      return false;
    };

    this.drag = function(event)
    {
      var csrPosWC = this.cgo.getCursorPosWC(event);  // update mouse pos to pass to the owner
      if (this.dragCallback)
      {
        this.dragCallback(csrPosWC);
      }
    };

    this.drop = function(event)
    {
      var csrPosWC = this.cgo.getCursorPosWC(event);  // update mouse pos to pass to the owner
      this.cgo.cnvs.onmouseup = null;
      this.cgo.cnvs.onmousemove = null;
      if (this.dropCallback)
      {
        this.dropCallback(csrPosWC);
      }
    };
  };

  if (svgToCgo2D === undefined)
  {
    svgToCgo2D = function(svgPath, xRef, yRef)
    {
      var cgoData = [],
          segs, strs,
          cmd, seg, cmdLetters, coords,
          xScale = 1,
          yScale = -1,                      // flip all the y coords to +ve up
          xOfs = xRef || 0,                 // move the drawing reference point
          yOfs = yRef || 0,
          k;

      function segsToCgo2D(segs, xRef, yRef, xScl, yScl)
      {
        var x = 0,
            y = 0,
            px, py,
            c1x, c1y,
            rot, rx, ry, larc, swp,
            seg, cmd, pc,
            commands = [],
            xScale = xScl || 1,
            yScale = yScl || xScale,   // in case only single scale factor passed
            xOfs = xRef || 0,          // move the shape drawing origin
            yOfs = yRef || 0,
            i, coords;

        for (i=0; i<segs.length; i++)
        {
          seg = segs[i];
          cmd = seg[0];
          if ((i==0)&&(cmd != 'M'))   // check that the first move is absolute
          {
            cmd = 'M';
          }
          coords = seg.slice(1);      // skip the command copy coords
          if (coords)
          {
            coords = coords.map(parseFloat);
          }
          switch(cmd)
          {
            case 'M':
              x = xOfs + xScale*coords[0];
              y = yOfs + yScale*coords[1];
              px = py = null;
              commands.push('M', x, y);
              coords.splice(0, 2);      // delete the 2 coords from the front of the array
              while (coords.length>0)
              {
                x = xOfs + xScale*coords[0];                // eqiv to muliple 'L' calls
                y = yOfs + yScale*coords[1];
                commands.push('L', x, y);
                coords.splice(0, 2);
              }
              break;
            case 'm':
              x += xScale*coords[0];
              y += yScale*coords[1];
              px = py = null;
              commands.push('M', x, y);
              coords.splice(0, 2);      // delete the 2 coords from the front of the array
              while (coords.length>0)
              {
                x += xScale*coords[0];              // eqiv to muliple 'l' calls
                y += yScale*coords[1];
                commands.push('L', x, y);
                coords.splice(0, 2);
              }
              break;
            case 'L':
              while (coords.length>0)
              {
                x = xOfs + xScale*coords[0];
                y = yOfs + yScale*coords[1];
                commands.push('L', x, y);
                coords.splice(0, 2);
              }
              px = py = null;
              break;
            case 'l':
              while (coords.length>0)
              {
                x += xScale*coords[0];
                y += yScale*coords[1];
                commands.push('L', x, y);
                coords.splice(0, 2);
              }
              px = py = null;
              break;
            case 'H':
              x = xOfs + xScale*coords[0];
              px = py = null ;
              commands.push('L', x, y);
              break;
            case 'h':
              x += xScale*coords[0];
              px = py = null ;
              commands.push('L', x, y);
              break;
            case 'V':
              y = yOfs + yScale*coords[0];
              px = py = null;
              commands.push('L', x, y);
              break;
            case 'v':
              y += yScale*coords[0];
              px = py = null;
              commands.push('L', x, y);
              break;
            case 'C':
              while (coords.length>0)
              {
                c1x = xOfs + xScale*coords[0];
                c1y = yOfs + yScale*coords[1];
                px = xOfs + xScale*coords[2];
                py = yOfs + yScale*coords[3];
                x = xOfs + xScale*coords[4];
                y = yOfs + yScale*coords[5];
                commands.push('C', c1x, c1y, px, py, x, y);
                coords.splice(0, 6);
              }
              break;
            case 'c':
              while (coords.length>0)
              {
                c1x = x + xScale*coords[0];
                c1y = y + yScale*coords[1];
                px = x + xScale*coords[2];
                py = y + yScale*coords[3];
                x += xScale*coords[4];
                y += yScale*coords[5];
                commands.push('C', c1x, c1y, px, py, x, y);
                coords.splice(0, 6);
              }
              break;
            case 'S':
              if (px == null || !pc.match(/[sc]/i))
              {
                px = x;                // already absolute coords
                py = y;
              }
              commands.push('C', x-(px-x), y-(py-y),
                                xOfs + xScale*coords[0], yOfs + yScale*coords[1],
                                xOfs + xScale*coords[2], yOfs + yScale*coords[3]);
              px = xOfs + xScale*coords[0];
              py = yOfs + yScale*coords[1];
              x = xOfs + xScale*coords[2];
              y = yOfs + yScale*coords[3];
              break;
            case 's':
              if (px == null || !pc.match(/[sc]/i))
              {
                px = x;
                py = y;
              }
              commands.push('C', x-(px-x), y-(py-y),
                                x + xOfs + xScale*coords[0], y +yOfs + yScale*coords[1],
                                x + xOfs + xScale*coords[2], y +yOfs + yScale*coords[3]);
              px = x + xScale*coords[0];
              py = y + yScale*coords[1];
              x += xScale*coords[2];
              y += yScale*coords[3];
              break;
            case 'Q':
              px = xOfs + xScale*coords[0];
              py = yOfs + yScale*coords[1];
              x = xOfs + xScale*coords[2];
              y = yOfs + yScale*coords[3];
              commands.push('Q', px, py, x, y);
              break;
            case 'q':
              commands.push('Q', [x + xScale*coords[0], y + yScale*coords[1],
                                  x + xScale*coords[2], y + yScale*coords[3]]);
              px = x + xScale*coords[0];
              py = y + yScale*coords[1];
              x += xScale*coords[2];
              y += yScale*coords[3];
              break;
            case 'T':
              if (px == null || !pc.match(/[qt]/i))
              {
                px = x;
                py = y;
              }
              else
              {
                px = x-(px-x);
                py = y-(py-y);
              }
              commands.push('Q', px, py, xOfs + xScale*coords[0], yOfs + yScale*coords[1]);
              px = x-(px-x);
              py = y-(py-y);
              x = xOfs + xScale*coords[0];
              y = yOfs + yScale*coords[1];
              break;
            case 't':
              if (px == null || !pc.match(/[qt]/i))
              {
                px = x;
                py = y;
              }
              else
              {
                px = x-(px-x);
                py = y-(py-y);
              }
              commands.push('Q', px, py, x + xScale*coords[0], y + yScale*coords[1]);
              x += xScale*coords[0];
              y += yScale*coords[1];
              break;
            case 'A':
              while (coords.length>0)
              {
                px = x;
                py = y;
                rx = xScale*coords[0];
                ry = xScale*coords[1];
                rot = coords[2];            // don't switch to CCW +ve cgo2DToDrawCmd will
                larc = coords[3];
                swp = coords[4];            // sweep: don't switch swap to CCW +ve
                x = xOfs + xScale*coords[5];
                y = yOfs + yScale*coords[6];
                commands.push('A', rx, ry, rot, larc, swp, x, y);
                coords.splice(0, 7);
              }
              break;
            case 'a':
              while (coords.length>0)
              {
                px = x;
                py = y;
                rx = xScale*coords[0];
                ry = xScale*coords[1];
                rot = coords[2];          // don't switch to CCW +ve cgo2DToDrawCmd will
                larc = coords[3];
                swp = coords[4];          // sweep: don't switch swap to CCW +ve
                x += xScale*coords[5];
                y += yScale*coords[6];
                commands.push('A', rx, ry, rot, larc, swp, x, y);
                coords.splice(0, 7);
              }
              break;
            case 'Z':
              commands.push('Z');
              break;
            case 'z':
              commands.push('Z');
              break;
          }
          pc = cmd;     // save the previous command for possible reflected control points
        }
        return commands;
      }

      if (typeof svgPath != 'string')
      {
        return cgoData;
      }
      // this is a preprocessor to get an svg Path string into 'Cgo2D' format
      segs = [];
      strs = svgPath.split(/(?=[a-df-z])/i);  // avoid e in exponents
      // now array of strings with command letter start to each
      for (k=0; k<strs.length; k++)
      {
        seg = strs[k];
        // get command letter into an array
        cmdLetters = seg.match(/[a-z]/i);
        if (!cmdLetters)
        {
          return cgoData;
        }
        cmd = cmdLetters.slice(0,1);
        if ((k==0)&&(cmd[0] != 'M'))   // check that the first move is absolute
        {
          cmd[0] = 'M';
        }
        coords = seg.match(/[\-\+]?[0-9]*\.?[0-9]+([eE][\-\+]?[0-9]+)?/gi);
        if (coords)
        {
          coords = coords.map(parseFloat);
        }
        segs.push(cmd.concat(coords));
      }

      // now send these off to the svg segs to Cgo2D
      cgoData = segsToCgo2D(segs, xOfs, -yOfs, xScale, yScale);

      return cgoData;  // array in Cgo2D format ['M', x, y, 'L', x, y, ....]
    };
  }

}());
