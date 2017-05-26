

function trimLabel(str) {
  if (typeof str != "undefined" && str != null) {
    return str.replace(/^\s+/, '').replace(/\s+$/, '');
  } else {
    return "";
  }
}

function getColorForDelay(delay) {
  if (typeof delay != 'undefined' && delay != "") {
    if (parseInt(delay) <= 0 && parseInt(delay) <= 2) {
      var delayForColor = '50AA50';
      if (parseInt(delay) > 0) {
        var delaylabel = '+' + delay;
      } else {
        var delaylabel = delay;
      }
    } else {
      var delayForColor = '800000';
      if (parseInt(delay) == 0)
        var delaylabel = " " + parseInt(delay) + " ";
      else
        var delaylabel = '+' + parseInt(delay);
    }
  } else {
    var delaylabel = '-';
    var delayForColor = '000000';
  }
  return {
    label: delaylabel,
    color: delayForColor
  }
}

OpenLayers.Control.Click = OpenLayers.Class(OpenLayers.Control, {
  defaultHandlerOptions: {
    'single': true,
    'double': false,
    'pixelTolerance': 0,
    'stopSingle': false,
    'stopDouble': false
  },
  initialize: function(options) {
    this.handlerOptions = OpenLayers.Util.extend(
            {}, this.defaultHandlerOptions
            );
    OpenLayers.Control.prototype.initialize.apply(
            this, arguments
            );
    this.handler = new OpenLayers.Handler.Click(
            this, {
      'click': this.callback,
      'dblclick': this.onDblclick
    }, this.handlerOptions
            );
  },
  onClick: function(evt) {
    alert(evt.xy);
  },
  onDblclick: function(evt) {
    alert(evt.xy);
  }

});

TrainOverlay = {};
TrainOverlay.Layer = OpenLayers.Class(OpenLayers.Layer, {
  isBaseLayer: false,
  canvas: null,
  initialize: function(name, options) {
    OpenLayers.Layer.prototype.initialize.apply(this, arguments);
    this.canvas = document.createElement('canvas');
    if (typeof this.canvas.getContext != "function") {
      this.canvas = document.getElementById('livemap_canvas');
    }
    this.canvas.style.position = 'absolute';

    var sub = document.createElement('div');
    sub.appendChild(this.canvas);
    this.div.appendChild(sub);
  },
  getCanvas: function() {
    return this.canvas;
  },
  moveTo: function(bounds, zoomChanged, dragging) {
    OpenLayers.Layer.prototype.moveTo.apply(this, arguments);
    // The code is too slow to update the rendering during dragging.
    if (dragging) {
      return;
    }
    var someLoc = new OpenLayers.LonLat(0, 0);
    var offsetX = this.map.getViewPortPxFromLonLat(someLoc).x -
            this.map.getLayerPxFromLonLat(someLoc).x;
    var offsetY = this.map.getViewPortPxFromLonLat(someLoc).y -
            this.map.getLayerPxFromLonLat(someLoc).y;
    var ctx = this.canvas.getContext('2d');
  },
  CLASS_NAME: 'TrainOverlay.Layer'

});


// ################################## AbstractTrainOverlay #####################

function AbstractTrainOverlay()
{
  this.intervalTimerRef = new Array();

}

AbstractTrainOverlay.prototype.TRAIN_LABEL_ALPFA = 0.9;
AbstractTrainOverlay.prototype.PRODUCT_SPRITE_IMG = "livemap/products/products_sprite2.png";

AbstractTrainOverlay.prototype.IMAGEHEIGHT = 80;
AbstractTrainOverlay.prototype.IMAGEWIDTH = 80;
AbstractTrainOverlay.prototype.REALIMGSIZE = 57;

AbstractTrainOverlay.prototype.onAdd = function() {
  //this.livemap.map.map.events.register("click", this.map, this.trainClickManager.onClick.bind(this.trainClickManager));
  this.clickHandler = new OpenLayers.Control.Click({
    handlerOptions: {
      "single": true
    },
    callback: this.trainClickManager.onClick.bind(this.trainClickManager)
  });
  //this.livemap.map.map.addControl(this.clickHandler);
  this.livemap.map.map.addControl(this.clickHandler);
  this.clickHandler.activate();
  //this.livemap.map.map.events.register("mousemove", this.map, this.trainClickManager.onMouseMove.bind(this.trainClickManager));
  this.livemap.map.map.events.register("mousemove", this.map, this.trainClickManager.onMouseMove.bind(this.trainClickManager));
  this.updateTrains();
};

AbstractTrainOverlay.prototype.onRemove = function() {
  this.div_.parentNode.removeChild(this.div_);
  this.div_ = null;
};

AbstractTrainOverlay.prototype.draw = function()
{

  var bounds = this.map.getBoundingBox();

  /*var ne_coord = this.map.CCoord2LonLat(bounds.ne);
   var sw_coord = this.map.CCoord2LonLat(bounds.sw);*/
  var ne_coord = this.map.CCoord2LonLat(bounds.ne);
  var sw_coord = this.map.CCoord2LonLat(bounds.sw);

//
  var ne_pix = this.trainOverlay.getViewPortPxFromLonLat(ne_coord);
  var sw_pix = this.trainOverlay.getViewPortPxFromLonLat(sw_coord);


  var someLoc = new OpenLayers.LonLat(0, 0);
  var offsetX = this.map.map.getViewPortPxFromLonLat(someLoc).x -
          this.map.map.getLayerPxFromLonLat(someLoc).x;

  var offsetY = this.map.map.getViewPortPxFromLonLat(someLoc).y -
          this.map.map.getLayerPxFromLonLat(someLoc).y;

  this.trainOverlay.canvas.width = this.map.map.getSize().w;
  this.trainOverlay.canvas.height = this.map.map.getSize().h;
  this.trainOverlay.canvas.style.left = Math.round(-offsetX) + 'px';
  this.trainOverlay.canvas.style.top = Math.round(-offsetY) + 'px';

  this.currentsize = this.livemap.imageSizePerZoomLevel[this.livemap.map.map.getZoom()];

  var count = 0;
  var context = this.trainOverlay.getCanvas().getContext('2d');
  var journeyCount = 0;
  for (var key in this.livemap.trainContainer)
  {

    var train = this.livemap.trainContainer[key];
    if (!this.livemap.lineFilter.isTrainActive(train.name))
      continue;
    this.livemap.trainContainer[key].zLayer = count;
    if (this.livemap.trainContainer[key].poly.length > 0) {
      var current = new Date();
      current = new Date(current.getTime() + this.livemap.getServerClientTimeDelta());

      /* pick right timestamp for interpolating train position */
      var polyIndex = this.getPolyIndex(train.poly, current);

      /* no valid train position could be found in timeframe -> do not display then*/
      if ((typeof train.poly[polyIndex] == "undefined") || (typeof train.poly[polyIndex + 1] == "undefined")) {
        train.visible = false;
        if ((typeof train.infobox != "undefined") && (train.addInfo == true)) {
          this.livemap.map.map.removePopup(train.infobox);
        }
        train.currentPolyIndex = -1;
        continue;
      }

      train.currentPolyIndex = polyIndex;

      if ((this.livemap.minDelay != null) && ((parseInt(train.getDelay()) < this.livemap.minDelay) || (train.getDelay() == ""))) {
        train.visible = false;
        continue;
      }

      if ((this.livemap.limitOnRealtime) && (train.getDelay() == "")) {
        train.visible = false;
        continue;
      }

      train.visible = true;
      /* calculate delta between NOW and determined position */
      var delta = current.getTime() - train.poly[polyIndex].time.getTime();

      /* calculate delta in the current interval*/
      var deltaInterval = train.poly[polyIndex + 1].time.getTime() - train.poly[polyIndex].time.getTime();
      var interpolationVal = delta / deltaInterval;

      /* interpolate x and y */
      var x = parseInt(parseInt(train.poly[polyIndex][0]) + parseInt(interpolationVal * (train.poly[polyIndex + 1][0] - train.poly[polyIndex][0])));
      var y = parseInt(parseInt(train.poly[polyIndex][1]) + parseInt(interpolationVal * (train.poly[polyIndex + 1][1] - train.poly[polyIndex][1])));

      train.x = x;
      train.y = y;
      train.passproc = parseInt(parseInt(train.poly[polyIndex][5]) + parseInt(interpolationVal * (train.poly[polyIndex + 1][5] - train.poly[polyIndex][5])));

      /* set current calculated position (for mouseover/click events) */
      this.livemap.trainContainer[key].setCalcX(x);
      this.livemap.trainContainer[key].setCalcY(y);

      var newCoord = new CCoord({lat: y, lon: x});


      var latlon = this.livemap.map.CCoord2LonLat(newCoord);
    }
    else
    {
      var newCoord = new CCoord({lat: train.y, lon: train.x});
      var latlon = this.livemap.map.CCoord2LonLat(newCoord);
    }
    var pix = this.trainOverlay.getViewPortPxFromLonLat(latlon);
    this.drawTrainImage(train, pix, sw_pix.x, ne_pix.y, context, polyIndex);
    if ((typeof this.livemap.trainContainer[key].infobox != "undefined") && (this.livemap.trainContainer[key].addInfo == true)) {
      this.livemap.map.updateInfoBoxPosition(this.livemap.trainContainer[key].infobox, newCoord);
    }

    if (this.livemap.shownames) {
      this.drawTrainLabel(train, pix, sw_pix.x, ne_pix.y, context, offsetX, offsetY);
    }
    count++;
    document.getElementById('notificationTrainsCounter').innerHTML = count;

    if (train.debug || (LiveMapDebugData[train.name] && LiveMapDebugData[train.name].debug))
      this.drawTrainDebug(context, train, 0, 0, newCoord);
  }
}

AbstractTrainOverlay.prototype.getPolyIndex = function(poly, current) {
  var polyIndex = 0;
  for (var m = 0; m < poly.length - 2; m++) {
    if ((current.getTime() >= poly[m].time.getTime()) && (current.getTime() < poly[m + 1].time.getTime())) {
      polyIndex = m;
      break;
    }
  }
  return polyIndex;
}

AbstractTrainOverlay.prototype.updateTrains = function()
{
  if (this.updateTimeout != null) {
    window.clearTimeout(this.updateTimeout);
  }
  var startTime = new Date();
  this.draw();

  var endTime = new Date();
  var timeLeft = (endTime.getTime() - startTime.getTime());
  if ((timeLeft < 300))
  {
    timeLeft = 1000;
    /*if((this.livemap.isAnimated))
     { */
    this.intervalTimerRef[0] = window.setTimeout(this.draw.bind(this), 125);
    this.intervalTimerRef[1] = window.setTimeout(this.draw.bind(this), 250);
    this.intervalTimerRef[2] = window.setTimeout(this.draw.bind(this), 375);
    this.intervalTimerRef[3] = window.setTimeout(this.draw.bind(this), 500);
    this.intervalTimerRef[4] = window.setTimeout(this.draw.bind(this), 625);
    this.intervalTimerRef[5] = window.setTimeout(this.draw.bind(this), 750);
    this.intervalTimerRef[6] = window.setTimeout(this.draw.bind(this), 875);
    /*}*/
  }
  else
  {
    if (timeLeft > 2000)
      timeLeft += 5000;
    else if (timeLeft > 800)
      timeLeft += 2500;
    else
      timeLeft = 1000;
  }
  if ((this.livemap.isAnimated) && (!this.livemap.disabled))
  {
    this.updateTimeout = window.setTimeout(this.updateTrains.bind(this), timeLeft);
  }

}

AbstractTrainOverlay.prototype.drawTrainDebug = function(context, train, shiftX, shiftY, newCoord)
{

  //var latlon = this.livemap.map.Coord2LatLng(new CCoord( { lat:train.y, lon:train.x } ));
  var latlon = this.livemap.map.CCoord2LonLat(newCoord);

  var pix = this.trainOverlay.getViewPortPxFromLonLat(latlon);
  if (train.hasCurrentData)
    context.fillStyle = "#00FF00";
  else
    context.fillStyle = "#990";
  //console.log("green", pix);
  context.beginPath();
  context.arc(pix.x - shiftX, pix.y - shiftY, 5, 0, Math.PI * 2, true);
  context.closePath();
  context.fill();

  //console.log(train);
  /*
   var latlon2 = this.livemap.map.CCoord2LonLat(new CCoord({lat: parseInt(train.y) + parseInt(train.vec.y), lon: parseInt(train.x) + parseInt(train.vec.x)}));
   var pix2 = this.trainOverlay.getViewPortPxFromLonLat(latlon2);
   context.strokeStyle = "#ff0000";
   context.beginPath();
   context.moveTo(pix.x - shiftX, pix.y - shiftY);
   context.lineTo(pix2.x - shiftX, pix2.y - shiftY);
   context.stroke();*/

  if (LiveMapDebugData[train.name][train.hashId] == undefined)
    return;

  for (var i = 0; i < LiveMapDebugData[train.name][train.hashId].poly.length; i++)
  {

    var poly = LiveMapDebugData[train.name][train.hashId].poly[i];
    var latlon = this.livemap.map.CCoord2LonLat(new CCoord({lat: poly[1], lon: poly[0]}));
    //console.log(latlon)
    var pix = this.trainOverlay.getViewPortPxFromLonLat(latlon);
    //console.log("red", pix);
    if (poly.isJump)
      context.fillStyle = "#00aa00";
    else if (poly.isWait)
      context.fillStyle = "#FF0000";
    else
      context.fillStyle = "#0000aa";
    context.beginPath();
    context.arc(pix.x - shiftX, pix.y - shiftY, 3, 0, Math.PI * 2, true);
    context.closePath();
    context.fill();

    context.fillStyle = "#0f0";
    context.textAlign = "left";
    context.fillText(i + " " + poly[5], pix.x + 2, pix.y + 12);
  }
}

AbstractTrainOverlay.prototype.drawTrainLabel = function(train, pix, shift_x, shift_y, context)
{
  var delayBgColor = 'FFFFCC';
  var delayObj = getColorForDelay(train.delay);
  var delaylabel = delayObj.label;
  var delayForColor = delayObj.color;

  //Groessen berechenen
  if (typeof this.FONT_STYLE != 'undefined')
    context.font = this.FONT_STYLE;
  var rt_width = context.measureText(delaylabel).width + 2;

  var trainLabelContent = trimLabel(train.name);

  if (this.livemap.showdestination) {
    trainLabelContent += " > " + train.getLastStopName();
  }

  var text_width = context.measureText(trainLabelContent).width;
  var top = parseInt(pix.y - shift_y + this.currentsize / 2);
  if (this.livemap.showrealtimeinfo) {
    var w = parseInt(text_width + 6 + rt_width);
  } else {
    var w = parseInt(text_width + 6);
  }
  //var w = parseInt(text_width + 6);
  var left = parseInt(pix.x - shift_x - (w) / 2);
  var h = 16;

  //Zeichnen
  context.globalAlpha = this.TRAIN_LABEL_ALPFA;
  //context.fillStyle = '#'+Hafas.Config.ProductColors[train.prodclass];
  context.fillStyle = "#E8E8E8";
  context.fillRect(left, top, w, h);

  //context.fillStyle = "#FFFFCC";
  context.fillStyle = "#333";
  context.textAlign = "left";
  context.fillText(trainLabelContent, left + 2, top + 12);

  if (this.livemap.showrealtimeinfo) {
    context.fillStyle = '#' + delayBgColor;
    context.fillRect(left + (w - rt_width - 2), top, rt_width, h);

    context.fillStyle = "#" + delayForColor;
    context.fillText(delaylabel, left + (w - rt_width) - 1, top + 12);
  }

  context.globalAlpha = 1.0;

  context.lineWidth = 1;

  if (train.poly[train.currentPolyIndex].isJump)
    context.strokeStyle = "#0a0";
  else if (train.poly[train.currentPolyIndex].isWait)
    context.strokeStyle = "#a00";
  else
    context.strokeStyle = "#333";
  //context.strokeStyle = "#FFFFCC";
  context.strokeRect(left - 1, top - 1, w + 2, h + 2);
}

// ##################################### TrainClickManager ###########################

function TrainClickManager(livemap)
{
  this.livemap = livemap;

  this.sortByZIndex = function(a, b) {
    return (b.zLayer - a.zLayer);
  }

  this.onClick = function(mouseEvent)
  {
    var size = this.livemap.imageSizePerZoomLevel[this.livemap.map.map.getZoom()];

    //var mouselatlng = mouseEvent.latLng;

    //var click_pix = this.livemap.map.map.getViewPortPxFromLonLat(mouselatlng);
    var click_pix = mouseEvent.xy;
    var pix_bb = {x: click_pix.x + size, y: click_pix.y + size};

    //var coord = this.livemap.map.LatLng2Coord( mouselatlng );
    var coord = this.livemap.map.scr2geo(click_pix);
    var coord_bb = this.livemap.map.scr2geo(pix_bb);
    var coord_length = new CCoord({lat: Math.abs(coord_bb.lat - coord.lat) / 2, lon: Math.abs(coord_bb.lat - coord.lat) / 2});
    var hits = new Array();
    for (var key in this.livemap.trainContainer)
    {
      var train = this.livemap.trainContainer[key];
      if (!this.livemap.lineFilter.isTrainActive(train.name))
        continue;
      if (Math.abs(coord.lat - train.getCalcY()) < coord_length.lat)
        if (Math.abs(coord.lon - train.getCalcX()) < coord_length.lon)
        {
          train.key = key;
          //this.livemap.generateRequest(key, null, 0, 0);
          hits.push(this.livemap.trainContainer[key]);
          //return;
        }
    }
    if (hits.length > 0) {
      hits.sort(this.sortByZIndex);
      this.livemap.generateRequest(hits[0].key, null, 0, 0);
      return true;
    }
    else
    {
      var poiList = gStationsApp.poiViewer.getPoisAt(coord);
      if (poiList.length > 0)
      {
        poiList[0].poiType.onclick(poiList[0].poi);
      }
    }
    return false;
  };

  this.onMouseMove = function(mouseEvent)
  {
    var size = this.livemap.imageSizePerZoomLevel[this.livemap.map.map.getZoom()];
    var click_pix = mouseEvent.xy;
    var pix_bb = {x: click_pix.x + size, y: click_pix.y + size};
    var coord = this.livemap.map.scr2geo(click_pix);
    var coord_bb = this.livemap.map.scr2geo(pix_bb);
    var coord_length = new CCoord({lat: Math.abs(coord_bb.lat - coord.lat) / 2, lon: Math.abs(coord_bb.lat - coord.lat) / 2});
    var hits = new Array();

    if (this.livemap.map.hasInfobox())
    {
      this._hideMouseOver();
      return;
    }

    for (var key in this.livemap.trainContainer)
    {
      var train = this.livemap.trainContainer[key];
      if (!this.livemap.lineFilter.isTrainActive(train.name))
        continue;
      if (train.visible) {
        if (Math.abs(coord.lat - train.getCalcY()) < coord_length.lat)
          if (Math.abs(coord.lon - train.getCalcX()) < coord_length.lon)
          {
            this.livemap.trainOverlay.trainOverlay.getCanvas().style.cursor = "pointer";
            this.livemap.trainOverlay.trainOverlay.getCanvas().style.cursor = "hand";
            hits.push(this.livemap.trainContainer[key]);
          }
      }
    }
    if (hits.length > 0) {
      hits.sort(this.sortByZIndex);
      var pix = this.livemap.map.geo2scr(new CCoord({lon: hits[0].getCalcX(), lat: hits[0].getCalcY()}));
      //document.getElementById('livemapTrainTooltip').innerHTML = "<strong style='color:#0088CE;'>" + hits[0].getName() + "</strong> " + Hafas.Texts.Livemap['destination'] + " "+ hits[0].getLastStopName();

      if ((typeof hits[0].infotexts != "undefined") && (typeof hits[0].infotexts[0] != "undefined") && (typeof hits[0].infotexts[1] != "undefined") && (typeof hits[0].infotexts[0].OC != "undefined") && (typeof hits[0].infotexts[1].RT != "undefined")) {
        var trainname = hits[0].infotexts[0].OC + " " + hits[0].infotexts[1].RT;
      } else {
        var trainname = hits[0].getName();
      }

      /*document.getElementById('livemapTrainTooltip').innerHTML = "<strong style='color:#0088CE;'>" + trainname + "</strong> " + hits[0].fstop.fdep + " " + hits[0].fstop.fname + " " + Hafas.Texts.Livemap['destination'] + " " + hits[0].getLastStopName() + " <span class='" + this.livemap.delay2class(hits[0].getDelay()).css + "'>" + this.livemap.delay2class(hits[0].getDelay()).delay + "</span>";
       document.getElementById('livemapTrainTooltip').style.left = pix.x + 20 + "px";
       document.getElementById('livemapTrainTooltip').style.top = pix.y + "px";
       document.getElementById('livemapTrainTooltip').style.display = 'block'; */
//            this._drawMouseOver("<strong style='color:#0088CE;'>" + trainname + "</strong> " + hits[0].fstop.fdep + " " + hits[0].fstop.fname + " > " + Hafas.Texts.Livemap['destination'] + " " + hits[0].getLastStopName() + " <span class='" + this.livemap.delay2class(hits[0].getDelay()).css + "'>" + this.livemap.delay2class(hits[0].getDelay()).delay + "</span>", pix.x, pix.y);
      this._drawMouseOver("<strong>" + trainname + "</strong> " + Hafas.Texts.Livemap['destination'] + " " + hits[0].getLastStopName() + " <span class='" + this.livemap.delay2class(hits[0].getDelay()).css + "'>" + this.livemap.delay2class(hits[0].getDelay()).delay + "</span>", pix.x, pix.y);
      return;
    }
    else
    {
      var poiList = gStationsApp.poiViewer.getPoisAt(coord);
      if (poiList.length > 0)
      {
        var pix = this.livemap.map.geo2scr(poiList[0].poi.coord);
        this._drawMouseOver("<strong style='color:#EAAB00;'>" + poiList[0].poi.text + "</strong>", pix.x, pix.y - 25);
        return;
      }
    }
    this._hideMouseOver();
  };
  this._drawMouseOver = function(text, x, y) {
    document.getElementById('livemapTrainTooltip').innerHTML = text;
    document.getElementById('livemapTrainTooltip').style.left = x + 20 + "px";
    document.getElementById('livemapTrainTooltip').style.top = y + "px";
    document.getElementById('livemapTrainTooltip').style.display = 'block';
    this.livemap.trainOverlay.trainOverlay.getCanvas().style.cursor = "pointer";
  };

  this._hideMouseOver = function() {
    this.livemap.trainOverlay.trainOverlay.getCanvas().style.cursor = "";
    document.getElementById('livemapTrainTooltip').style.display = 'none';
  };
  return true;
}



// ##################################### CanvasTrainOverlay #####################
// Fuer alle Canvas Browser

function CanvasTrainOverlay(livemap)
{
  if (livemap != null) {
    this.init(livemap);
  }
}

CanvasTrainOverlay.prototype = new AbstractTrainOverlay();

CanvasTrainOverlay.prototype.dispose = function() {
  this.map.map.removeLayer(this.trainOverlay);
  if (this.updateTimeout != null) {
    window.clearTimeout(this.updateTimeout);
  }
  for (var k = 0; k < this.intervalTimerRef.length; k++) {
    window.clearTimeout(this.intervalTimerRef[k]);
  }
}

CanvasTrainOverlay.prototype.init = function(livemap)
{
  //this.setOptions( { map:livemap.map.map } );
  this.map = livemap.map;
  this.trainOverlay = new TrainOverlay.Layer("trainOverlay");

  //this.map.map.addLayers([this.trainOverlay]);

  this.map.map.addLayers([this.trainOverlay]);
  this.trainOverlay.setZIndex(735);
  this.map.setOnChange(function() {
    this.trainOverlay.redraw();
    //this.trainOverlay.setZIndex(400);
  }.bind(this));
  this.livemap = livemap;
  this.trainClickManager = new TrainClickManager(this.livemap);
  this.FONT_STYLE = "Lucida Grande 11px";

  this.prodImages = {};
  this.prodList = [1, 2, 4, 8, 16, 32, 64, 128, 256, 512, 1024, 2048, 4096, 8192];
  this.pr_img = document.createElement('img');
  this.ar_img_list = [];
  this.ar_station_img_list = [];
  for (var i = 0; i < 32; i++)
  {
    this.ar_img_list.push(document.createElement('img'));
    this.ar_img_list[i].src = this.livemap.getDirectionImage({direction: i + ""}, false);
    this.ar_station_img_list.push(document.createElement('img'));
    this.ar_station_img_list[i].src = this.livemap.getDirectionImage({direction: i + ""}, true);
  }
  this.pr_img.src = gImagePath + this.PRODUCT_SPRITE_IMG;
  this.pr_img.onload = this.preRenderTrains.bind(this);
  this.onAdd();
};


CanvasTrainOverlay.prototype.preRenderTrains = function()
{
  //
  for (var i = 0; i < 32; i++)
  {
    if (!this.ar_img_list[i].complete)
    {
      window.setTimeout(function() {
        this.preRenderTrains();
      }.bind(this), 1000);
      return;
    }
  }
  for (var i = -1; i < 32; i++)
  {
    for (var j = 0; j < this.prodList.length; j++)
    {
      var can = document.createElement('canvas');
      can.width = 80;
      can.height = 80;
      var width = this.IMAGEWIDTH;
      var height = this.IMAGEHEIGHT;

      var skip = j * (57);
      if (skip < 0)
        skip = 0;

      var context = can.getContext('2d');
      if (i >= 0)
      {
        //context.fillRect(0,0,width,height);
        var rotationAngle = 11.25 * i;
        context.save();
        context.translate(width / 2, height / 2);
        context.rotate(-rotationAngle * Math.PI / 180);
        context.translate(-(width / 2), -(height / 2));
        context.drawImage(this.ar_img_list[0], 0, 0, 57, 57, 10, 10, 60, 60);
      }
      context.restore();
      try {
        can.getContext('2d').drawImage(this.pr_img, skip, 0, 57, 57, 11.5, 11.5, 57, 57);
      } catch (e) {
        console.info(e);
      }
      this.prodImages[i + "_" + this.prodList[j]] = can;
    }

  }
}

CanvasTrainOverlay.prototype.drawFollowImage = function(follow, pix, shift_x, shift_y, context)
{
  context.drawImage(follow, 0, 0, 16, 16, pix.x - shift_x, pix.y - (this.currentsize / 2) - shift_y, 16, 16);
}


CanvasTrainOverlay.prototype.drawTrainImage = function(train, pix, shift_x, shift_y, context, polyIndex)
{
  // ############### SPECIAL SNCF VERSION -> NO PRODUCTCLASS BUT STATUS IS USED FOR CHOOSING THE RIGHT ICON
  if (train.getAgeOfReport() >= this.livemap.overdueMsgTime) {
    var status = 2;
  } else {
    var status = 1;
  }

  // ##############

  if (typeof this.livemap.iconMapping != "undefined") {
    var mappedProdClass = Math.pow(2, parseInt(this.livemap.iconMapping[train.getProductClass()]));
  } else {
    var mappedProdClass = train.getProductClass();
  }


  if ((typeof train.poly[polyIndex][3] == "undefined") || train.poly[polyIndex][3] == "") {
    var direction = train.getDirection();
  } else {
    if ((typeof train.poly[polyIndex][3] == 'undefined') || (train.poly[polyIndex][3] == "")) {
      var direction = "-1";
    } else {
      var direction = train.poly[polyIndex][3];
    }

  }
  var img_node = this.prodImages[direction + "_" + mappedProdClass];
  if (typeof img_node == 'undefined')
  {
    return;
  }
  //context.drawImage(img_node, 0, 0, 61, 61, pix.x-(this.currentsize/2)-shift_x, pix.y-(this.currentsize/2)-shift_y, this.currentsize, this.currentsize);
  if (train.poly[polyIndex].isJump)
    context.globalAlpha = 0.5;
  context.drawImage(img_node, 0, 0, 80, 80, pix.x - (this.currentsize / 2) - shift_x, pix.y - (this.currentsize / 2) - shift_y, this.currentsize, this.currentsize);

  context.globalAlpha = 1;
};
