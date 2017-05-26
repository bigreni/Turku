
var LiveMapDebugData = {};

var PeriodicalExecuter = function(a, b) {
  this.initialize(a, b);
};
PeriodicalExecuter.prototype.initialize = function(callback, frequency) {
  this.callback = callback;
  this.frequency = frequency;
  this.currentlyExecuting = false;

  this.registerCallback();
};

PeriodicalExecuter.prototype.registerCallback = function() {
  this.timer = setInterval(this.onTimerEvent.bind(this), this.frequency * 1000);
};

PeriodicalExecuter.prototype.stop = function() {
  if (!this.timer)
    return;
  clearInterval(this.timer);
  this.timer = null;
};

PeriodicalExecuter.prototype.onTimerEvent = function() {
  if (!this.currentlyExecuting) {
    try {
      this.currentlyExecuting = true;
      this.callback(this);
    } finally {
      this.currentlyExecuting = false;
    }
  }
};


function initFocus() {
  /* do nothing */
}
function initFontsize() {
  /* do nothing */
}

function getDebugDate() {
  var now = new Date();
  var hours = now.getHours();
  var minutes = now.getMinutes();
  var seconds = now.getSeconds();
  hours = (parseInt(hours) < 10) ? '0' + hours : hours;
  minutes = (parseInt(minutes) < 10) ? '0' + minutes : minutes;
  seconds = (parseInt(seconds) < 10) ? '0' + seconds : seconds;
  return hours + ":" + minutes + ":" + seconds;
}

if (typeof Hafas.Livemap == 'undefined') {
  /**
   * @brief Class Hafas.Livemap
   **/

  Hafas.Livemap = function(p) {
    this.initialize(p);
  };
  Hafas.Livemap.prototype = {
    initialize: function(param) {
      /* livemap basic settings */
      this.serverTime = null;                                              // initial server time when livemap launches
      this.map = param.map;
      this.switchmap = param.map;
      this.cookiename = 'rmv_livefahrplan_settings';                        // Cookie for DB Zugradar Settings
      this.guiVersion = param.guiVersion;                                  // guiVersion - anti-cache/reload livemap function
      this.maxTrains = param.maxTrains || null;                            // maximum amount of trains (serverlimit)
      this.logtrains = param.logTrain || false;                            // Log trains with unrealistic speed?
      this.name = param.name;                                              // Name of the livemap
      this.outdatedBrowser = param.outdatedBrowser || false;               // Is Browser up to date?
      this.build = null;
      this.productClassData = 0;
      this.stationManager = param.stationManager || null;

      this.prodclasses = 0;                                                // initially selected product classes
      this.imageSizePerZoomLevel = new Array(57, 57, 57, 57, 57, 57, 57, 57, 57, 57);


      /* train visual settings */
      this.shownames = param.params.shownames || true;                    // show Trainnames
      this.showdestination = param.params.showdirection || false;          // show Traindestination
      this.showrealtimeinfo = param.params.showrealtimeinfo || true;       // show realtime information


      this.presentationTimer = param.params.presentationTimer || 10;

      this.currentTrainFollowId = null;                                    // Train ID of a train in track mode
      this.currentTrainLaneId = null;                                      // Train ID of current shown track
      this.exclusiveTrainId = null;                                        // Train ID of an exclusive shown train

      this.minDelay = param.params.livemapSettingMinDelay || null;           // minimumDelay Filter
      this.limitOnDelay = false;                                           // Delayfilter true/false
      this.limitOnRealtime = false;                                        // Only trains with realtime true/false
      this.limitOnCustomerProduct = false;                                 // Only specific customer trains true/false
      this.adminCode = null;                                               // admin code
      this.useDataTiles = false;                                           // use data tiles for caching mechanism
      this.minimized = false;
      this.realtimeonly = false;
      this.showAgeOfReport = param.params.showAgeOfReport || false;
      this.showAsDelayMinimum = param.displayDelayAt || 5;
      this.overdueTrainsContradictionVal = param.overdueTrainsRuleValue || 80;
      this.showSBahnTrains = param.sBahnTrains || false;
      this.tagOverdueTrains = param.tagOverdueTrains || false;
      this.tagReplacementTrains = param.tagReplacementTrains || false;
      this.overdueMsgTime = param.overdueMsgTime;

      this.livemapBaseURL = "http://" + document.domain;
      /*if(Hafas.Config.gUrlTravelPlannerJSON.indexOf("/") == 0) {
       this.basicUrl = this.livemapBaseURL + Hafas.Config.gUrlTravelPlannerJSON;
       }else{
       this.basicUrl = Hafas.Config.gUrlTravelPlannerJSON
       } */
      if (typeof Hafas.Config.gLivemapBaseUrl == "undefined") {
        this.basicUrl = Hafas.Config.gUrlTravelPlannerJSON || gUrlTravelPlannerJSON;
        this.basicUrl += "y?";
      } else {
        this.basicUrl = Hafas.Config.gLivemapBaseUrl + Hafas.Config.gQuery_path + "/3" + Hafas.Config.gLanguage + Hafas.Config.gBrowser + "y?";
      }
      this.singleVehicleUrl = this.basicUrl + 'tpl=singletrain2json&performLocating=8&look_nv=get_rtmsgstatus|yes|get_rtfreitextmn|yes|&';

      this.currentZoomLevel = this.map.getZoom("api");


      /* saves Server Time which will be sync each <x> Minutes */
      this.servertime = new Date();
      this.serverTimeDelta = null;

      /* Statistic */
      this.shownTrains = 0;
      this.shownRoutes = 0;

      /* Timer Rerences */
      this.trackTrainIntervalTimer = null;                                 // the interval reference for the tracking function
      this.useInactivityTimeout = false;
      this.shiftTrainPositionTimer = null;
      this.updateTrainArrayTimer = null;                                   // Timer for updating the trainarray
      this.firstTrainRequestTimer = null;                                  // Timer for initial Request
      this.admsUpdateTimeout = null;                                       // Time for adms update
      this.clockTimer = null;                                              // Timer for livemap clock
      this.clockIntervalRef = null;
      this.msec = 0;

      this.selectedLines = null;

      this.productCategories = new Object;
      this.productCategories[1] = false;                                   // ICE
      this.productCategories[2] = false;                                   // IC
      this.productCategories[4] = false;                                   // D/IR
      this.productCategories[8] = false;                                   // R
      this.productCategories[16] = false;                                  // S

      this.trainContainer = new Object();                                  // Holds data of all train objects visible in the map
      this.stopContainer = new Array();                                    // Holds data of all stops with information on trains currently stopping
      this.trainRoutes = new Object();                                     // Holds data of all routes that are visible in the map
      this.priorBoundingBox = null;
      this.trails = new Object();
      this.zoomlevel = new Array(5);

      this.trainInfoStausWindowVis = false;
      this.intervalPerZoom = 1;                                             // zoom-dependent multiplier for the chosen interval
      this.ajaxrequestActive = false;                                       // Holds status if train ajax request is currently active
      this.setProductClassInterval = null;
      this.zugPosMode = 2;

      /* Historic Mode */
      this.historicMode = false;                                            // Status historic mode active: true/false
      this.historyTimeStamp = new Date();                                   // Timestamp of current historical date
      this.playBackSpeed = 1;                                               // determins play speed of the livemap

      this.inactivityTimeout = null;
      this.mindelaytimer = null;
      this.currentOpenInfoWindow = null;

      /* pre-determin positions relevant */
      this.interpolateJourneys = true;
      this.intervalstep = 2000;
      this.interval = 60000;

      this.positionCounter = 0;
      this.currentAddInfo = null;
      this.trainResultObj = new Array();
      this.canvasDrawTimer = new Array();
      this.updateTimerByMovement = null;
      this.lastDataTimeStamp = null;
      this.dataTile = null;
      this.currentDataTiles = new Array();                                 // holds bounding box information for each data tile
      this.currentMultiTrainPopup = null;

      this.currentDataTileDivider = null;
      this.previousDataTileDivider = null;

      // check if this is first request
      this.initialRequestDone = false;
      this.requestInProgress = false;

      this.trainOverlay = new CanvasTrainOverlay(this);

      this.lineFilter = new LineFilterDisplay(this);

      /* Timer detects idling of the user */
      if (this.presentationTimer != null) {
        document.body.addEventListener("mousemove", function() {
          if (this.inactivityTimeout != null) {
            window.clearTimeout(this.inactivityTimeout);
            this.inactivityTimeout = null;
          }
          this.inactivityTimeout = window.setTimeout(this.showInactivityPopup.bind(this), 1000 * 60 * this.presentationTimer);
        }.bind(this));
      }

      /* Set Timeout if user idles */
      this.inactivityTimeout = window.setTimeout(this.showInactivityPopup.bind(this), 1000 * 60 * this.presentationTimer);

      /* set checkboxes of products */
      this.setCheckBoxes();

      /*start the livemap after syncing with the hafas server */
      this.timeSync(function() {
        /* limit map boundaries and zoom level */
        this.setupMap();
        this.startanimation();
        this.startClockInterval();
      }.bind(this));
    },
    getOutdatedBrowser: function() {
      return this.outdatedBrowser;
    },
    getServerClientTimeDelta: function() {
      return this.serverTimeDelta;
    },
    getShowAgeOfReport: function() {
      return this.showAgeOfReport;
    },
    getInterpolateJourneys: function() {
      return this.interpolateJourneys;
    },
    getMaxTrains: function() {
      return this.maxTrains;
    },
    setupMap: function() {
      /*  update on mouse movement or zooming */
      this.map.setOnChange(function() {
        // No update when totally zoomed out
        this.setCheckBoxes();
        //this.updateLiveMap(false, true);
        //this.checkShowNames();
        this.currentZoomLevel = this.map.map.getZoom();
      }.bind(this));

      if (this.stationManager != null) {
        this.stationManager.setLivemap(this);
      }


      // setup first data tile nw, ne, se, sw
      // setup first data tile nw, ne, se, sw
      // OLD NW new CCoord({lon: 6248611 , lat: 51048789 })
      this.dataTile = [new CCoord({lon: 7604861, lat: 51048789}), // nw
        new CCoord({lon: 10522049, lat: 51048789}), // ne
        new CCoord({lon: 10522049, lat: 49210927}), // se
        new CCoord({lon: 6248611, lat: 49210927}), // sw
        new CCoord({lon: 7648611, lat: 51048789})] // nw


    },
    getVisibleTiles: function(array) {
      var visTiles = new Array();
      for (var k = 0; k < array.length; k++) {
        if (array[k].visible) {
          visTiles.push(k);
        }
      }
      return visTiles;
    },
    getDataTileDivider: function() {
      var zoom = this.map.getZoom("api");
      if (this.switchmap.currMapType == "CPTVMap") {
        if (zoom < 7) {
          var dataTileDivider = 2;
        } else if (zoom >= 7) {
          var dataTileDivider = 1;
        }
      } else {
        if (zoom < 14) {
          var dataTileDivider = 1;
        } else if (zoom >= 14) {
          var dataTileDivider = 2;
        }
      }
      return dataTileDivider;
    },
    checkMinDelay: function(inputf) {
      if (this.checkDelayTimeout != null) {
        window.clearTimeout(this.checkDelayTimeout);
        this.checkDelayTimeout = null;
      }
      this.checkDelayTimeout = window.setTimeout(function() {
        if (isNaN(inputf.value) || inputf.value.length == 0) {
          inputf.value = '';
          //this.setMinDelay(0,false);
          this.minDelay = null;
          this.setCheckBoxes();
          //this.updateLiveMap(false);
        } else {
          if (this.mindelaytimer != null) {
            window.clearTimeout(this.mindelaytimer);
            this.mindelaytimer = null;
          }
          this.mindelaytimer = window.setTimeout(function() {
            this.setMinDelay(inputf.value, true);
            this.setCheckBoxes();
            //this.updateLiveMap(false);
          }.bind(this), 400);
        }
        if (typeof Hafas.Maps.enableDimmer == 'function') {
          Hafas.Maps.enableDimmer();
        }
      }.bind(this), 500);
    },
    setMinDelay: function(minutes, boolval) {
      this.minDelay = parseInt(minutes);
      this.limitOnDelay = boolval;
      Hafas.Maps.disableDimmer();
    },
    calculateDataTiles: function() {
      //this.drawDebugTileLayer();


      var oldDataTiles = this.currentDataTiles;

      this.currentDataTiles = new Array();

      var dataTileDivider = this.getDataTileDivider();

      this.previousDataTileDivider = this.currentDataTileDivider;
      this.currentDataTileDivider = dataTileDivider;

      for (var m = 0; m < dataTileDivider; m++) {
        for (var j = 0; j < dataTileDivider; j++) {
          var tileWidth = Math.abs(this.dataTile[1].getLon() - this.dataTile[0].getLon()) / dataTileDivider;
          var tileHeight = Math.abs(this.dataTile[1].getLat() - this.dataTile[2].getLat()) / dataTileDivider;
          var currentDataTile = new Array();

          var currentDataTileWest = this.dataTile[0].getLon() + j * tileWidth;
          var currentDataTileEast = currentDataTileWest + tileWidth;
          var currentDataTileNorth = this.dataTile[0].getLat() - m * tileHeight;
          var currentDataTileSouth = currentDataTileNorth - tileHeight;

          // check if data tile is relevant for current screen view
          var dataTile = {
            ne: new CCoord({lon: currentDataTileEast, lat: currentDataTileNorth}),
            sw: new CCoord({lon: currentDataTileWest, lat: currentDataTileSouth}),
            nw: new CCoord({lon: currentDataTileWest, lat: currentDataTileNorth}),
            se: new CCoord({lon: currentDataTileEast, lat: currentDataTileSouth})
          };
          dataTile.visible = this.isDataTileInViewPort(dataTile);
          // Bounding Box request
          this.currentDataTiles.push(dataTile);
        }
      }
      if (this.currentDataTileDivider != this.previousDataTileDivider) {
        return true;
      } else {

      }
    },
    isDataTileInViewPort: function(data) {
      for (var m in data) {
        var bb = this.map.getBoundingBox();
        this.map.isPointInBoundingBox(data[m]);
        bb.nw = new CCoord({lon: bb.sw.getLon(), lat: bb.ne.getLat()});
        bb.se = new CCoord({lon: bb.ne.getLon(), lat: bb.sw.getLat()});

        //First bounding box, top left corner, bottom right corner
        var data_bb_nw_x = data.nw.getLon();
        var data_bb_nw_y = data.nw.getLat();
        var data_bb_se_x = data.se.getLon();
        var data_bb_se_y = data.se.getLat();

        //Second bounding box, top left corner, bottom right corner
        var bb_nw_x = bb.nw.getLon();
        var bb_nw_y = bb.nw.getLat();
        var bb_se_x = bb.se.getLon();
        var bb_se_y = bb.se.getLat();

        var rabx = Math.abs(parseInt(data_bb_nw_x) + parseInt(data_bb_se_x) - parseInt(bb_nw_x) - parseInt(bb_se_x));
        var raby = Math.abs(parseInt(data_bb_nw_y) + parseInt(data_bb_se_y) - parseInt(bb_nw_y) - parseInt(bb_se_y));

        //rAx + rBx
        var raxPrbx = parseInt(data_bb_se_x) - parseInt(data_bb_nw_x) + parseInt(bb_se_x) - parseInt(bb_nw_x);

        //rAy + rBy
        var rayPrby = parseInt(data_bb_nw_y) - parseInt(data_bb_se_y) + parseInt(bb_nw_y) - parseInt(bb_se_y);

        if ((rabx <= raxPrbx) && (raby <= rayPrby)) {
          return true;
        }
        return false;
      }
    },
    drawDebugTileLayer: function() {
      if (typeof this.debugTiles != "undefined") {
        for (var l = 0; l < this.debugTiles.length; l++) {
          this.map.hideContent(this.debugTiles[l]);
          this.map.removeContent(this.debugTiles[l]);
        }
      }
      var colors = ["blue", "red", "yellow", "gray", "purple"];
      this.debugTiles = new Array();
      var zoom = this.map.getZoom("api");
      var dataTileDivider = this.getDataTileDivider();
      for (var m = 0; m < dataTileDivider; m++) {
        for (var j = 0; j < dataTileDivider; j++) {
          var tileWidth = Math.abs(this.dataTile[1].getLon() - this.dataTile[0].getLon()) / dataTileDivider;
          var tileHeight = Math.abs(this.dataTile[1].getLat() - this.dataTile[2].getLat()) / dataTileDivider;
          var currentDataTile = new Array();

          var currentDataTileWest = this.dataTile[0].getLon() + j * tileWidth;
          var currentDataTileEast = currentDataTileWest + tileWidth;
          var currentDataTileNorth = this.dataTile[0].getLat() - m * tileHeight;
          var currentDataTileSouth = currentDataTileNorth - tileHeight;

          var tmpCoords = [new CCoord({lon: currentDataTileWest, lat: currentDataTileNorth}),
            new CCoord({lon: currentDataTileEast, lat: currentDataTileNorth}),
            new CCoord({lon: currentDataTileEast, lat: currentDataTileSouth}),
            new CCoord({lon: currentDataTileWest, lat: currentDataTileSouth}),
            new CCoord({lon: currentDataTileWest, lat: currentDataTileNorth})];
          var tmp = this.map.createContent({
            type: 'polyline',
            coords: tmpCoords,
            color: colors[m],
            width: 3
          });
          this.map.showContent(tmp);
          this.debugTiles.push(tmp);
        }
      }
    },
    showInactivityPopup: function() {
      this.stopanimation();
      eId('timeoutHintDiv').style.display = 'block';
    },
    hideInactivityPopup: function() {
      this.startanimation();
      eId('timeoutHintDiv').style.display = 'none';
    },
    hideOptionMenu: function() {
      eId('hideMainOptionsLink').style.display = 'none';
      eId('showMainOptionsLink').style.display = 'block';
      eId('bahnLivefahrplanMainMenu').style.display = 'none';
    },
    showOptionMenu: function() {
      eId('showMainOptionsLink').style.display = 'none';
      eId('hideMainOptionsLink').style.display = 'block';
      eId('bahnLivefahrplanMainMenu').style.display = 'block';
    },
    timeSync: function(callback) {
      var aUrl = this.basicUrl + '&tpl=time2json&performLocating=512&look_nv=type|servertime&';
      var clientTime = new Date();
      jQuery.ajax({
        url: aUrl,
        method: 'get',
        success: function(data) {
          if (typeof data.error == "undefined") {
            this.servertime = new Date(data[0].year, parseInt(data[0].month - 1), data[0].day, data[0].hours, data[0].minutes, data[0].seconds);
            this.serverTimeDelta = this.servertime.getTime() - clientTime.getTime();
            this.build = data[0].DDMMYYYY.substr(4, 4) + data[0].DDMMYYYY.substr(2, 2) + data[0].DDMMYYYY.substr(0, 2);
            callback();
          } else {

          }
        }.bind(this)
      });
    },
    stopClockInterval: function() {
      if (this.clockIntervalRef != null) {
        window.clearInterval(this.clockIntervalRef);
        this.clockIntervalRef = null;
      }
    },
    startClockInterval: function() {
      this.stopClockInterval();
      var now = new Date();
      //var clock_result = this.convertTimeStamps(now.getHours()) + ":" + this.convertTimeStamps(now.getMinutes()) + ":" + this.convertTimeStamps(now.getSeconds());
      this.clockIntervalRef = window.setInterval(this.updateClock.bind(this), 1000);
    },
    updateClock: function() {
      var now = new Date();
      var clock_result = this.convertTimeStamps(now.getHours()) + ":" + this.convertTimeStamps(now.getMinutes()) + ":" + this.convertTimeStamps(now.getSeconds());
      if (eId("timer")) {
        eId("timer").innerHTML = clock_result;
      }
      if (eId("historicTimeVal")) {
        eId("historicTimeVal").innerHTML = clock_result;
      }
    },
    startClock: function(startDate) {
      this.clock = startDate;
      var clock_result = this.convertTimeStamps(this.clock.getHours()) + ":" + this.convertTimeStamps(this.clock.getMinutes()) + ":" + this.convertTimeStamps(this.clock.getSeconds());
      eId("timer").innerHTML = clock_result;
      eId("historicTimeVal").innerHTML = clock_result;
      var next = new Date(startDate.getTime());
      this.historyTimeStamp = startDate;
      next.setMilliseconds(next.getMilliseconds() + (100 * this.playBackSpeed));
      this.clockTimer = window.setTimeout(this.startClock.bind(this, next), 100);
      // check whether historic time reached current time
      if (this.historicMode) {
        if (this.historyTimeStamp.getTime() > new Date().getTime()) {
          this.disableHistoricMode();
          this.startanimation();
        }
      }
    },
    stopClock: function() {
      window.clearTimeout(this.clockTimer);
      this.clockTimer = null;
    },
    //checkShowNames: function() {
    /*if (((this.map.map.getZoom() <= 7) && (this.switchmap.currMapType != "CPTVMap")) || ((this.switchmap.currMapType == "CPTVMap") && this.map.map.getZoom() >= 8)) {
     this.setShowNames(false);
     eId(this.name + '_showTrainNames').disabled = true;
     } else {
     eId(this.name + '_showTrainNames').disabled = false;
     this.setShowNames(eId(this.name + '_showTrainNames').checked);
     }*/
    //},
    setCorrectTimeShiftPerZoom: function() {
      if ((this.map.map.getZoom() >= 10) && (this.timeShiftSpeed < 16)) {
        this.intervalPerZoom = this.timeShiftSpeed;
      } else {
        this.intervalPerZoom = 1;
      }
    },
    checkDOMElement: function(elem) {
      if (elem != null) {
        return true;
      } else {
        return false;
      }
    },
    saveMapSettings: function() {

    },
    showInactivityHint: function() {
      Effect.Appear("dimmerInactivity", {duration: 0.4, to: 0.7});
      Effect.Appear("dimmerInactivityicon", {duration: 0.4});
    },
    hideInactivityHint: function() {
      Effect.Fade("dimmerInactivity", {duration: 0.4});
      Effect.Fade("dimmerInactivityicon", {duration: 0.4});
    },
    continueRequests: function() {
      this.hideInactivityHint();
      this.startanimation();
    },
    createLightBox: function() {
      if (this.lightbox == null) {
        this.lightbox = document.createElement("div");
        this.lightbox.style.position = 'absolute';
      }
    },
    enableHistoricMode: function(timestamp, currentTime, clock) {
      this.closeInfoWindow();
      this.historicMode = true;
      this.stopanimation();
      if (this.historicTimeStampInterval != null) {
        window.clearInterval(this.historicTimeStampInterval);
      }
      this.historicInitialTimeStamp = timestamp;
      var newTimeValues = currentTime.split(":");
      this.historicInitialTimeStamp.setHours(newTimeValues[0]);
      this.historicInitialTimeStamp.setMinutes(newTimeValues[1]);
      this.historicInitialTimeStamp.setSeconds(newTimeValues[2]);
      this.historicClockDisplay = clock;
      this.startanimation();
    },
    disableHistoricMode: function() {
      if (this.historicTimeStampInterval != null) {
        window.clearInterval(this.historicTimeStampInterval);
      }
      eId('playbackTool').style.display = 'none';
      eId('historyModeBtn').style.display = 'inline';
      this.historicMode = false;
      this.playBackSpeed = 1;
      this.intervalPerZoom = 1;
      this.stopanimation();
      this.stopClock();
      this.startClockInterval();
    },
    convertTimeStamps: function(Value) {
      return (Value > 9) ? "" + Value : "0" + Value;
    },
    getHistoricTimer: function() {
      return this.historicInitialTimeStamp;
    },
    unload: function() {
      this.stopanimation(); // Animation anhalten wenn aktiv
      for (var key in this.singleJourneys) {
        var id = key.replace("x", "/");
        this.removeSingleJourney(id);
      }
      delete this;
    },
    setSelectedLines: function(arr) {
      this.selectedLines = arr;
      this.updateLiveMap(false);
    },
    isLineSelected: function(line) {
      for (var k = 0; k < this.selectedLines.length; k++) {
        if ((this.selectedLines[k] == line) || ((this.selectedLines[k] == 99) && (line == "(A)"))) {
          return true;
        }
      }
    },
    setExclusiveTrain: function(val) {
      if (val == null) {
        this.hideExclTrainMenu(this.exclusiveTrainId);
      } else {
        this.showExclTrainMenu(val);
      }
      this.exclusiveTrainId = val;
    },
    showExclTrainMenu: function(val) {
      eId('currentExclTrainIcon').innerHTML = Hafas.Config.ProductImagesHTML[this.trainContainer[val].getProductClass()];
      eId('currentExclTrainName').innerHTML = this.trainContainer[val].name;
      eId('exclusiveTrainInMapContainer').style.display = 'block';
    },
    hideExclTrainMenu: function(val) {
      if (eId('train_' + val + 'exclusiveTrain')) {
        eId('train_' + val + 'exclusiveTrain').checked = false;
      }
      eId('exclusiveTrainInMapContainer').style.display = 'none';
      eId('currentExclTrainName').innerHTML = "";
    },
    setCheckBoxes: function(noUpdate) {
      var zoom = this.map.getZoom();
      var iteratorArray = this.zoomlevel;
      for (var i = 0; i < iteratorArray.length; i++) {
        if ((zoom > iteratorArray[i]) && (eId(this.name + '_chb_' + i) != null)) {
          eId(this.name + '_chb_' + i).disabled = true;
          this.setProductClass(i + 1, false, false);
        } else {
          if (eId(this.name + '_chb_' + i) != null) {
            eId(this.name + '_chb_' + i).disabled = false;
            if (eId(this.name + '_chb_' + i).checked) {
              this.setProductClass(i + 1, true, false);
            } else {
              this.setProductClass(i + 1, false, false);
            }
          }
        }
      }
      if (this.map.getZoom("api") >= 2) {
        eId(this.name + "_showTrainNames").disabled = false;
        if (eId(this.name + "_showTrainNames").checked) {
          this.shownames = true;
        } else {
          this.shownames = false;
        }
      } else {
        this.shownames = false;
        eId(this.name + "_showTrainNames").disabled = true;
      }
      Hafas.Maps.disableDimmer();
    }, enableAll: function() {
      for (var i = 0; i < this.zoomlevel.length; i++) {
        eId(this.name + '_chb_' + i).checked = true;
        if (eId(this.name + '_chb_' + i).disabled == false) {
          this.setProductClass(i + 1, true, false);
        }
      }
      this.updateLiveMap(false);
    }, disableAll: function() {
      for (var i = 0; i < this.zoomlevel.length; i++) {
        eId(this.name + '_chb_' + i).checked = false;
        this.setProductClass(i + 1, false, false);
      }
      this.updateLiveMap(false);
    },
    setShowNames: function(bool) {
      this.shownames = bool;
      if (bool)
      {
        document.getElementById("destinationlivemap").disabled = false;
        document.getElementById("realtimelivemap").disabled = false;
        this.setShowDestination(document.getElementById("destinationlivemap").checked);
        this.setShowDestination(document.getElementById("realtimelivemap").checked);
      }
      else
      {
        document.getElementById("destinationlivemap").disabled = true;
        document.getElementById("realtimelivemap").disabled = true;
        this.setShowDestination(false);
        this.setRealtimeInfo(false);
      }
      Hafas.Maps.disableDimmer();
    },
    setShowDestination: function(boolval) {
      this.showdestination = boolval;
      this.updateLiveMap(false);
    },
    setRealtimeInfo: function(boolval) {
      this.showrealtimeinfo = boolval;
      this.updateLiveMap(false);
    },
    setProductClass: function(prodindex, prodboolval, update) {
      if (prodboolval == true) {
        this.prodclasses |= Math.pow(2, prodindex - 1);
      } else {
        var prodclass = Math.pow(2, prodindex - 1);
        this.prodclasses &= ~(prodclass);
        this.clearJourneysByProductClass(prodclass);
      }
      /*if(this.setProductClassInterval != null){
       window.clearTimeout(this.setProductClassInterval);
       this.setProductClassInterval = null;
       }*/
      this.trainOverlay.draw();
      this.setProductClassInterval = window.setTimeout(function() {
        if ((typeof update == 'undefined') || (update == true)) {
          this.stopanimation();
          this.trainOverlay.draw();
          this.startanimation();
        }
      }.bind(this), 1000);
    },
    clearJourneysByProductClass: function(pclass) {
      for (var key in this.trainContainer) {
        this.trainContainer[key].updated = false;
        if ((this.trainContainer[key].getProductClass() & pclass) == pclass) {
          if (this.switchmap.currMapType == "CPTVMap") {
            this.trainOverlay.clearCanvasTrainMarker(key);
          }
          delete this.trainContainer[key];
        }
      }
    },
    setRealtime: function(boolval) {
      this.limitOnRealtime = boolval;
      this.updateLiveMap(false);
    },
    excludeProducts: function(prodclass, boolval) {
      this.limitOnCustomerProduct = boolval;
    },
    startanimation: function() {
      if (this.aktiv) {
        this.aktiv.stop();
        delete this.aktiv;
      }
      /// Initialen Request ausf�hren
      this.callback();

      // Server request
      //var currentRequestBegin = this.getRequestTimeStamp();
      var correctedNow = this.getServerTime();
      var roundedSeconds = this.getRoundedTimeValue(correctedNow.getSeconds());

      var nextIntervalBegin = parseInt(roundedSeconds) + parseInt((this.interval) / 1000);

      var nextIntervalBeginAJAXOffset = nextIntervalBegin - 5;
      var nextRequestInSeconds = nextIntervalBeginAJAXOffset - correctedNow.getSeconds();

      if (nextRequestInSeconds < 0) {
        var startInSec = 0;
      } else {
        var startInSec = nextRequestInSeconds * 1000;
      }

      this.firstTrainRequestTimer = window.setTimeout(function() {
        this.callback();
        this.aktiv = new PeriodicalExecuterForObjects(this, (this.interval / 1000));
      }.bind(this), startInSec);
      this.isAnimated = true;
    },
    callback: function() {
      this.updateLiveMap(false);
    },
    calcTrainVector: function(trainArray)
    {
      var dir_vec = {x: 0, y: 0};
      if (typeof trainArray.poly == 'undefined')
      {
        return dir_vec;
      }
      var intervalStep = this.calculateIntervalStep() / 1000;
      if (typeof trainArray.poly[1] != 'undefined') {
        dir_vec.x = (parseInt(trainArray.poly[1][0]) - parseInt(trainArray.poly[0][0])) / 2;
        dir_vec.y = (parseInt(trainArray.poly[1][1]) - parseInt(trainArray.poly[0][1])) / 2;
      }
      else if (typeof trainArray.poly[0] != 'undefined')
      {
        dir_vec.x = (parseInt(trainArray.poly[0][0]) - parseInt(trainArray.x)) / 2;
        dir_vec.y = (parseInt(trainArray.poly[0][1]) - parseInt(trainArray.y)) / 2;
      }
      return dir_vec;
    },
    stopanimation: function() {
      // Interval for updating train Array (always shifting first position of the array)
      if (this.shiftTrainPositionTimer != null) {
        window.clearInterval(this.shiftTrainPositionTimer);
      }
      // Interval for obtaining train data from the server
      if (this.aktiv) {
        this.aktiv.stop();
        delete this.aktiv;
      }
      // Timeout for initial request
      if (this.firstTrainRequestTimer != null) {
        window.clearTimeout(this.firstTrainRequestTimer);
      }
      // Timeout for trainoverlay redrawing
      if (this.trainOverlay.updateTimeout != null) {
        window.clearTimeout(this.trainOverlay.updateTimeout);
      }
      // Interval for updating Train Arrays
      if (this.updateTrainArrayTimer != null) {
        window.clearInterval(this.updateTrainArrayTimer);
      }
      // Intervals for interpolation steps
      for (var k = 0; k < this.canvasDrawTimer.length; k++) {
        window.clearTimeout(this.canvasDrawTimer[k]);
      }
      if (this.interpolateTimer != null) {
        window.clearInterval(this.interpolateTimer);
      }
      this.initialRequestDone = false;
      //this.trainContainer = new Object;
      //this.stopContainer = new Object;
      this.isAnimated = false;
    },
    prodclass2binary: function(prodval) {
      var bitString = prodval.toString(2);
      bitString = bitString.split("").reverse().join("");
      return bitString;
    },
    getActivatedProducts: function(products) {
      var result = new Array();
      for (var j = 0; j < products.length; j++) {
        if ((parseInt(products[j]) == 1) && (j != 2)) {
          if (j == 1) {
            var prodclass = 6;
          } else {
            var prodclass = Math.pow(2, j);
          }
          result.push(prodclass);
        }
      }
      return result;
    },
    updateLiveMap: function(chbox, onchangeReq) {
      var requestTime = (new Date()).getTime();
      if (this.useDataTiles) {
        this.calculateDataTiles();
        var activeProducts = this.getActivatedProducts(this.prodclass2binary(this.prodclasses));
        if (this.prodclasses > 0) {
          for (var k = 0; k < this.currentDataTiles.length; k++) {
            if (this.currentDataTiles[k].visible) {
              var updateReq = (typeof onchangeReq != "undefined") ? onchangeReq : false;
              this.ajaxrequestActive = true;
              jQuery.ajax({
                url: this.getUrl(onchangeReq, this.currentDataTiles[k]),
                method: 'get',
                success: this.handleLocatingResult.bind(this, updateReq, k, requestTime),
                error: function() {
                  alert(Hafas.Texts.Livemap["errorUpdateTrainPosition"]);
                }
              });
            }
          }
        }
      } else {
        jQuery.ajax({
          url: this.getUrl(onchangeReq),
          method: 'get',
          success: this.handleLocatingResult.bind(this, updateReq, k, requestTime),
          error: function() {
            alert(Hafas.Texts.Livemap["errorUpdateTrainPosition"]);
          }
        });
      }
    },
    getDirectionImage: function(train, station) {
      if (typeof train.direction == "undefined") {
        var directionVal = '01';
      } else if (train.direction.length == 1) {
        var directionVal = '0' + train.direction;
      } else {
        var directionVal = train.direction;
      }
      /*if(station == false){
       var shadowimage = gImagePath + 'livemap/arrows/arrow-blue/' + directionVal +'.png'
       }else{*/
      var shadowimage = gImagePath + 'livemap/arrows/arrow-black/' + directionVal + '.png';
      //}
      return shadowimage;
    },
    getTrainPosition: function(data) {
      var aUrl = Hafas.Config.gUrlTravelPlannerJSON + 'tpl=singletrain2json&performLocating=8&look_nv=get_rtmsgstatus|yes|get_rtfreitextmn|yes|get_rtstoptimes|yes|get_fstop|yes|get_pstop|yes|get_nstop|yes|get_lstop|yes|' + this.getZugPosMode() + '&look_trainid=' + data.trainLink + '&';
      jQuery.ajax({
        url: aUrl,
        success: function(resultObj) {
          //var resultObj = eval('(' + o.responseText + ')');
          if (typeof resultObj.look.singletrain[0] != "undefined") {
            var productclass = Math.pow(2, parseInt(data.trainClass));
            if (productclass == 2) {
              this.setProductClass(2, this.checked, false);
              this.setProductClass(3, this.checked);
            } else {
              this.setProductClass(parseInt(data.trainClass), this.checked);
            }
            eId('livefahrplan_chb_' + data.trainClass).checked = true;
            this.map.centerToGeo(new CCoord({lon: resultObj.look.singletrain[0].x, lat: resultObj.look.singletrain[0].y}));
            this.map.setZoom(5000);
          } else {

          }
        }.bind(this)
      });
    },
    singleRequest: function(trainId, prod) {
      var hashTrainId = trainId.replace(new RegExp(/\//g), "x");
      if (typeof prod != 'undefined') {
        var image = Hafas.Config.ProductImages[parseInt(prod)];
      } else {
        var image = gImagePath + 'products/_pic.gif';
      }
      jQuery.ajax({url: this.singleVehicleUrl + trainId,
        success: function(train) {
          //var train = eval('(' + o.responseText + ')');
          param = {
            type: 'location',
            coord: new CCoord({lon: train.look.singletrain[0].x, lat: train.look.singletrain[0].y}),
            imageurl: image,
            imagewidth: 29,
            imageheight: 34,
            hotspot: {x: 15, y: 34},
            text: train.look.singletrain[0].name
          };
          if (typeof this.singleJourneys[hashTrainId].content == 'undefined') {
            this.singleJourneys[hashTrainId].content = new Object;
            this.singleJourneys[hashTrainId].content = this.map.createContent(param);
            this.map.showContent(this.singleJourneys[hashTrainId].content);
          } else {
            this.map.updateContent(this.singleJourneys[hashTrainId].content, null, param);
          }
        }.bind(this),
        error: function() {
        }
      });
    },
    string2date: function(timeString) {
      var date = new Date();
      var split = timeString.split(":");
      date.setHours(split[0]);
      date.setMinutes(split[1]);
      if (typeof split[2] != "undefined") {
        date.setSeconds(split[2]);
      } else {
        date.setSeconds(0);
      }

      date.setMilliseconds(0);
      return date;
    },
    handleLocatingResult: function(updateReq, indexNo, requestTime, response) {
      // date when answer was received
      // Interpret and deserialise response
      Hafas.Maps.disableDimmer();

      var requestStepsLeft = parseInt(((new Date()).getTime() - requestTime) / this.intervalstep) + 1;
      console.log("left:" + requestStepsLeft);

      //var response = eval('(' + ajaxResponse.responseText + ')');
      var l = response;
      var trainArray = l[0];
      var stopArray = l[1];

      /* Check result for error ! */
      if (typeof l.error == "undefined") {
        var timeString = trainArray[trainArray.length - 1][0];
        var dateString = trainArray[trainArray.length - 1][5];
        this.livemapCurrentIntervalStep = trainArray[trainArray.length - 1][3];
        this.livemapCurrentInterval = trainArray[trainArray.length - 1][2];
        this.trainPositionsLeft = parseInt(this.livemapCurrentInterval) / parseInt(this.livemapCurrentIntervalStep);
        this.currentTime = new Date().getTime();
        this.lastDataTimeStamp = this.string2date(timeString);
        this.currentTrainArrayTimeStamp = new Date(this.lastDataTimeStamp.getTime());
        this.drawtrains(trainArray, requestStepsLeft);
        this.stopContainer[indexNo] = stopArray;
        this.initStopContainer(this.stopContainer[indexNo], timeString, dateString);
        this.initialRequestDone = true;
      } else {
        /* Server delivers { "error":<code> }*/
        this.stopanimation();
      }
    },
    initStopContainer: function(container, time, date) {
      var timeBase = this.createTimeStampFromString(date, time);
      for (var j = 0; j < container.length; j++) {
        for (var p = 0; p < container[j].m.length; p++) {
          var tsBegin = new Date(timeBase.getTime() + parseInt(container[j].m[p].b));
          var tsEnd = new Date(timeBase.getTime() + parseInt(container[j].m[p].e));
          container[j].m[p].tsBegin = tsBegin;
          container[j].m[p].tsEnd = tsEnd;
        }
      }
    },
    createTimeStampFromString: function(date, time) {
      //var dateSplit = date.split(".");
      var timeSplit = time.split(":");
      var day = date.substr(6, 2);
      var month = parseInt(date.substr(4, 2)) - 1;
      var year = date.substr(0, 4);
      var hour = parseInt(timeSplit[0], 10);
      var minute = parseInt(timeSplit[1], 10);
      var seconds = parseInt(timeSplit[2], 10);
      var date = new Date(year, month, day, hour, minute, seconds, 0);
      return date;
    },
    clearNoLongerVisibleTrains: function() {
      var bb = this.map.getBoundingBox();
      for (var key in this.trainContainer) {
        this.trainContainer[key].updated = false;
        if (this.map.isPointInBoundingBox(new CCoord({lon: this.trainContainer[key].getCalcX(), lat: this.trainContainer[key].getCalcY()})) == false) {
          if (this.switchmap.currMapType == "CPTVMap") {
            if (typeof this.trainContainer[key].ptvObjRef != "undefined") {
              this.map.hideContent(this.trainContainer[key].ptvObjRef);
              this.map.removeContent(this.trainContainer[key].ptvObjRef);
              delete this.trainContainer[key].ptvObjRef;
            }
          }
          delete this.trainContainer[key];
        }
      }
    },
    showGraphicalTrainRoute: function(id) {
      var realId = id.replace(new RegExp(/x/g), "/");
      var aUrl = Hafas.Config.gUrlTrainInfo + realId + '?L=vs_traindiagram&showWithoutHeader=1&rt=1&date=' + this.trainContainer[id].getReferenceDate() + '&graphical=1&';
      eId('trainRouteContainerGraphicalFrame').src = aUrl;
      eId('trainRouteContainer').style.display = 'none';
      eId('trainRouteContainerGraphical').style.display = 'block';
    },
    showErrorNotice: function() {
      //
    },
    drawtrains: function(trains, requestTimeLeft) {
      // deleting elements no longer needed
      this.clearNoLongerVisibleTrains();
      // new AjaxMap
      this.livemapRefDate = this.string2date(trains[trains.length - 1][0]);
      this.livemapRefDataUntil = this.string2date(trains[trains.length - 1][0]);
      this.livemapRefDataUntil = new Date(this.livemapRefDataUntil.getTime() + trains[trains.length - 1][2]);

      var oldTrainIdList = [];

      for (var trainKey in this.trainContainer)
      {
        this.trainContainer[trainKey].hasCurrentData = false;
        oldTrainIdList.push(trainKey);
      }

      var d = trains.length - 1;
      console.log("train count:" + d);
      for (var i = 0; i < d; i++) {
        var hashTrainId = trains[i][3].replace(new RegExp(/\//g), "x");  // using 'X' as Seperator because '/' ist not allowed
        // Neuer Zug bisher noch nicht gezeichnet
        var ckv = 22222 + ((parseInt(trains[trains.length - 1][5]) + d) % 22222);
        if (typeof this.trainContainer[hashTrainId] == 'undefined') {
          this.trainContainer[hashTrainId] = new Hafas.Journey(trains[i], trains[d][0], ckv, this, trains[trains.length - 1][5], hashTrainId);
        } else {
          this.trainContainer[hashTrainId].updateData(trains[i], trains[d][0], ckv, trains[trains.length - 1][5], requestTimeLeft);
        }
        if (this.currentAddInfo == hashTrainId) {
          this.getSingleTrain(hashTrainId, false, this.trainContainer[hashTrainId].getCalcX(), this.trainContainer[hashTrainId].getCalcY());
        }
      }

      for (var i = 0; i < oldTrainIdList.length; i++)
        if (!this.trainContainer[oldTrainIdList[i]].hasCurrentData)
          delete this.trainContainer[oldTrainIdList[i]];

      this.shownTrains = d;
      this.ajaxrequestActive = false;

      this.lineFilter.update();

      if (typeof this.trainOverlay != "undefined") {
        this.trainOverlay.updateTrains();
      }
    }, calcAbsolutePolyTimeVal: function(hashTrainId, refDate) {
      var refDateSplit = refDate[0].split(":");
      var refDateObj = new Date();
      refDateObj.setHours(parseInt(refDateSplit[0], 10));
      refDateObj.setMinutes(parseInt(refDateSplit[1], 10));
      refDateObj.setSeconds(parseInt(refDateSplit[2], 10));
      for (var k = 0; k < this.trainContainer[hashTrainId].poly.length; k++) {
        var tmpDate = new Date(refDateObj.getTime());
        tmpDate.setSeconds(tmpDate.getSeconds() + (this.trainContainer[hashTrainId].poly[k][2] / 1000))
        this.trainContainer[hashTrainId].poly[k][4] = tmpDate;
      }
    }, logTrain: function(info, trainData, speed) {
      var aUrl = Hafas.Config.gBaseUrl + Hafas.Config.gUrlHelp + "tpl=trainlog&"
      var Jetzt = new Date();
      var Tag = Jetzt.getDate();
      var Monat = Jetzt.getMonth() + 1;
      var Jahr = Jetzt.getYear();
      if (Jahr < 999)
        Jahr += 1900;
      var Stunden = Jetzt.getHours();
      var Minuten = Jetzt.getMinutes();
      var Sekunden = Jetzt.getSeconds();
      var WoTag = Jetzt.getDay();
      var Vortag = (Tag < 10) ? "0" : "";
      var Vormon = (Monat < 10) ? ".0" : ".";
      var Vorstd = (Stunden < 10) ? "0" : "";
      var Vormin = (Minuten < 10) ? ":0" : ":";
      var Vorsek = (Sekunden < 10) ? ":0" : ":";
      var Datum = Vortag + Tag + Vormon + Monat + "." + Jahr;
      var Uhrzeit = Vorstd + Stunden + Vormin + Minuten + Vorsek + Sekunden;
      var logMessage = "LOGTRAI;" + Datum + ";" + Uhrzeit + ";" + trainData.name + ";" + speed + ";" + trainData.prevstop + ";" + trainData.prevstopno + ";" + trainData.nextstop + ";" + trainData.nextstopno;
      jQuery.ajax({
        url: aUrl,
        method: "post",
        postBody: "logmessage=" + logMessage + "&",
      });
    }, drawTrainOverlay: function() {
      if (typeof this.trainOverlay != "undefined") {
        this.trainOverlay.draw(0);
      }
    }, attachLinkEvent: function(id) {
      return function() {
        return id;
      };
    }, checkProductClass: function(productclass, products) {
      // prÃ¼fen ob Produktklasse gesetzt ist!
      var productbits = products.toString(2).split("").reverse().join("");
      var pclass = (Math.log(productclass)) / (Math.log(2));
      if (productbits[pclass] == '1') {
        return true;
      } else {
        return false;
      }
    }, showTrainInfoStatusWindow: function(key) {
      if (this.trainInfoStausWindowVis != true) {
        var obj = this.currentInfoBoxData.look.singletrain[0];
        var id = "";
        jQuery('#trainInfoBoxStatusWindow').html('<table style="width:240px;margin-top:0px;" class="infoBoxPearl">' +
                '<tr class="infoBoxHeadline">' +
                '<td colspan="100"><div style="white-space:nowrap;">' + Hafas.Config.ProductImagesHTML[this.currentInfoBoxData.prodclass] + ' <strong>' + obj.name + ' &bull; ' + obj.lstopname + '</strong></div></td>' +
                '</tr>' +
                '<tr class="infoBoxFunctions">' +
                '<td class="leftTd" colspan="2" style="width:50%;">' +
                '<div id="' + id + 'follow" style="padding:3px;"><input class="radioBtnLivemap" type="checkbox" id="' + id + 'followChbox"/> <label for="' + id + 'followChbox"/>' + Hafas.Texts.Livemap["followjourney"] + '</label></div>' +
                '</td>' +
                '<td class="rightTd" colspan="2" style="width:50%;">' +
                '<div id="' + id + 'follow" style="padding:3px;"><input checked="checked" class="radioBtnLivemap" type="checkbox" id="' + id + 'routeChbox"/> <label for="' + id + 'routeChbox"/>' + Hafas.Texts.Livemap["showroute"] + '</label> <span id="' + id + '_waitIcon" style="visibility:hidden;"><img style="vertical-align:middle;" src="' + Hafas.Config.gImagePath + 'livemap/ajax_loader_small.gif"/></span></div>' +
                '</td>' +
                '</tr>' +
                '</table>');
        Effect.Appear('trainInfoBoxStatusWindow', {duration: 0.4});
      }
      this.trainInfoStausWindowVis = true;
    }, closeTrainInfoStatusWindow: function() {
      eId('trainInfoBoxStatusWindow').style.display = 'none';
      this.trainInfoStausWindowVis = false;
    },
    setZugPosMode: function(val, realtimeonly) {
      this.zugPosMode = val;
      if (typeof realtimeonly == "undefined") {
        this.realtimeonly = false;
      } else {
        this.realtimeonly = realtimeonly;
      }
      this.updateLiveMap();
    },
    getZugPosMode: function() {
      // Zugposmode
      var zugposmode = 'zugposmode|' + this.zugPosMode + '|';
      if (this.realtimeonly) {
        zugposmode += 'get_rtonly|yes|';
      }
      return zugposmode;
    },
    createRouteMenuEntry: function(hashId) {
      var newRouteMenuEntry = document.createElement("div");
      var self = this;
      var currentColor = "EAAB00";
      newRouteMenuEntry.id = "routeMenuEntry_" + hashId;
      var checkBoxDiv = document.createElement("div");
      checkBoxDiv.className = 'livemapLineMenuItem';
      var checkBox = document.createElement("input");
      checkBox.type = 'checkbox';
      checkBox.checked = true;
      checkBox.id = "routeMenuEntryChb_" + hashId;
      checkBox.onclick = function() {
        if (!this.checked) {
          self.hideRoute(hashId);
        }
      };
      checkBoxDiv.appendChild(checkBox);

      var colorDiv = document.createElement("div");
      colorDiv.className = 'color';
      colorDiv.style.backgroundColor = '#' + currentColor;
      var colorLineDiv = document.createElement("div");
      colorLineDiv.className = 'colorLine';
      colorLineDiv.style.backgroundColor = '#' + this.getHighlightColor(currentColor);
      colorDiv.appendChild(colorLineDiv);


      var trainNameDiv = document.createElement("div");
      var trainNameLabel = document.createElement("label");
      trainNameLabel.setAttribute("for", "routeMenuEntryChb_" + hashId);
      trainNameLabel.innerHTML = this.trainContainer[hashId].name;
      trainNameDiv.className = "name";
      trainNameDiv.appendChild(trainNameLabel);


      var clearerDiv = document.createElement("div");
      clearerDiv.style.clear = 'both';

      newRouteMenuEntry.appendChild(checkBoxDiv);
      newRouteMenuEntry.appendChild(colorDiv);
      newRouteMenuEntry.appendChild(trainNameDiv);
      newRouteMenuEntry.appendChild(clearerDiv);


      eId('VisibleRoutesContent').appendChild(newRouteMenuEntry);
      this.shownRoutes++;
      //eId('notificationRoutesCounter').innerHTML = this.shownRoutes;
      eId('VisibleRoutesContent').style.display = "";

      eId('notificationVisibleRoutes').style.display = "";

    },
    checkBoundingBoxInBoundingBox: function(priorBB, bb2) {
      var coord1 = this.checkPointInBoundingBox(new CCoord({lon: bb2.ne.lon, lat: bb2.ne.lat}), priorBB);
      var coord2 = this.checkPointInBoundingBox(new CCoord({lon: bb2.sw.lon, lat: bb2.sw.lat}), priorBB);
      return (coord1 && coord2);
    },
    showRoute: function(realId, newEntry) {
      var route_url = gUrlTravelPlannerJSON + 'y?look_trainid=' + realId + '&tpl=chain2json&performLocating=16&';
      jQuery.ajax({
        url: route_url,
        method: "post",
        success: function(JSONRes) {
          //var JSONRes = eval('(' + o.responseText + ')');
          this.showTrainLane(JSONRes, realId);
          var hashTrainId = realId.replace(new RegExp(/\//g), "x");
          if ((typeof newEntry != 'undefined') && (newEntry == true)) {
            this.createRouteMenuEntry(hashTrainId);
          }
        }.bind(this)
      });

    }, hideDetailContainer: function(id) {
      var rehashTrainId = id.replace(new RegExp(/\//g), "x");
      this.map.hideContent(this.trainContainer[rehashTrainId].detailContainer);
      this.trainContainer[rehashTrainId].addInfo = false;
      eId(rehashTrainId + "chkbox").checked = false;

    }, hideRoute: function(id) {
      if (typeof this.trainRoutes[id + 'line'] != 'undefined') {
        for (var key in this.trainRoutes[id + 'line']) {
          this.map.hideContent(this.trainRoutes[id + 'line'][key]);
          this.map.removeContent(this.trainRoutes[id + 'line'][key]);

          this.map.hideContent(this.trainRoutes[id + 'lineBG'][key]);
          this.map.removeContent(this.trainRoutes[id + 'lineBG'][key]);
        }
        for (var key in this.trainRoutes[id + 'stop']) {
          this.map.hideContent(this.trainRoutes[id + 'stop'][key]);
          this.map.removeContent(this.trainRoutes[id + 'stop'][key]);
        }
        if (this.trainContainer[id])
          this.trainContainer[id].showRoute = false;
        this.shownRoutes--;

        if (eId('showRouteLink' + id) != null) {
          eId('showRouteLink' + id).style.display = 'block';
          eId('hideRouteLink' + id).style.display = 'none';
        }
        if (eId(id + 'r_chkbox') != null) {
          eId(id + 'r_chkbox').checked = false;
        }
        if (eId(id + 'routeChbox') != null) {
          eId(id + 'routeChbox').checked = false;
        }

        if (eId("routeMenuEntry_" + id) != null) {
          eId("routeMenuEntry_" + id).parentNode.removeChild(eId("routeMenuEntry_" + id));
        }
        eId('notificationRoutesCounter').innerHTML = this.shownRoutes;
        if (this.shownRoutes == 0) {
          eId('notificationVisibleRoutes').style.display = 'none';
        }

      }
    }, getLineWidthPerZoomLevel: function() {
      var zoom = this.map.getZoom("api");
      switch (zoom) {
        case 10:
          return 9;
        case 10:
          return 9;
        case 11:
          return 10;
          break;
        case 12:
          return 12;
          break;
        case 13:
          return 16;
          break;
        case 14:
          return 16;
          break;
        case 15:
          return 16;
          break;
        default:
          return 6;
          break;
      }
    }, updateRouteDisplay: function() {
      if (this.currentTrainLaneId != null) {
        var lineWidth = this.getLineWidthPerZoomLevel();
        this.map.updateContent(this.trainRoutes[this.currentTrainLaneId + 'line'], {
          width: lineWidth
        });
      }
    }, zoomToProduct: function(id) {
      if (typeof this.trainContainer[id] != 'undefined') {
        this.map.centerToGeo(new CCoord({lon: this.trainContainer[id].x, lat: this.trainContainer[id].y}), true);
      }

    }, checkPointInBoundingBox: function(coord, bb) {
      if (coord.getLon() >= bb.sw.getLon() && coord.getLon() <= bb.ne.getLon() && coord.getLat() <= bb.ne.getLat() && coord.getLat() >= bb.sw.getLat()) {
        return true;
      } else {
        return false;
      }

    }, calculateIntervalStep: function() {
      var zoomVal = 22 - this.map.map.getZoom();
      var basicIntervalStep = this.intervalstep;
      /*            if (zoomVal >= 20) {
       basicIntervalStep = basicIntervalStep * 7.5;
       } else if (zoomVal >= 15) {
       basicIntervalStep = basicIntervalStep * 5;
       } else if (zoomVal >= 12) {
       basicIntervalStep = basicIntervalStep * 2.5;
       }*/
      return basicIntervalStep;
    },
    getServerTime: function() {
      return new Date(new Date().getTime() + this.getServerClientTimeDelta());
    },
    getRequestTimeStamp: function() {
      var correctedTimeStamp = this.getServerTime();
      var resultString = '';
      var timeStampYYYYMMDD = null;

      // Historic Mode?
      if (this.historicMode) {
        var selectedDate = eId('historyDateSelector').options[eId('historyDateSelector').selectedIndex].value;
        resultString += 'look_requestdate=' + selectedDate + '&look_requesttime=' + this.convertTimeStamps(this.historyTimeStamp.getHours()) + ":" + this.convertTimeStamps(this.historyTimeStamp.getMinutes()) + ":" + this.convertTimeStamps(this.historyTimeStamp.getSeconds()) + '&';
        var ts = selectedDate.split(".");
        ts = ts[2] + ts[1] + ts[0];
        timeStampYYYYMMDD = ts;

      } else {
        // Normal mode?
        if (typeof mapMovement != "undefined") {
          correctedTimeStamp = this.currentTrainArrayTimeStamp;
          correctedTimeStamp.setSeconds(correctedTimeStamp.getSeconds() + (this.livemapCurrentIntervalStep / 1000))
        } else if (this.initialRequestDone) {
          correctedTimeStamp.setSeconds(parseInt(correctedTimeStamp.getSeconds()) + 5);
        }
        var normalizedSeconds = this.getRoundedTimeValue(correctedTimeStamp.getSeconds());
        resultString += 'look_requesttime=' + this.convertTimeStamps(correctedTimeStamp.getHours()) + ":" + this.convertTimeStamps(correctedTimeStamp.getMinutes()) + ":" + this.convertTimeStamps(normalizedSeconds) + '&';

        var ts_year = correctedTimeStamp.getFullYear()
        var ts_month = correctedTimeStamp.getMonth() + 1;
        ts_month = (ts_month < 10) ? '0' + ts_month : ts_month;
        var ts_day = correctedTimeStamp.getDate();
        ts_day = (ts_day < 10) ? '0' + ts_day : ts_day;
        timeStampYYYYMMDD = "" + ts_year + "" + ts_month + "" + ts_day;
        var ts_hours = correctedTimeStamp.getHours();
        var ts_minutes = correctedTimeStamp.getMinutes();
        var ts_seconds = normalizedSeconds;

        var requestDate = new Date(ts_year, ts_month - 1, ts_day, ts_hours, ts_minutes, ts_seconds);
      }
      return {looknv_param: resultString, ts: timeStampYYYYMMDD, date: requestDate};
    }, getRoundedTimeValue: function(seconds) {
      if (seconds < 30) {
        return 0;
      } else {
        return 30;
      }
    }, getUrl: function(mapMovement, dataTile, product) {
      var url = '';
      /*if (typeof dataTile != "undefined") {
       var boundingBox = 'look_minx=' + dataTile.sw.getLon() + '&look_maxx=' + dataTile.ne.getLon() + '&look_miny=' + dataTile.sw.getLat() + '&look_maxy=' + dataTile.ne.getLat() + '&';
       } else {
       var bb = this.map.getBoundingBox();
       var boundingBox = 'look_minx=' + bb.sw.getLon() + '&look_maxx=' + bb.ne.getLon() + '&look_miny=' + bb.sw.getLat() + '&look_maxy=' + bb.ne.getLat() + '&';
       }*/
      var boundingBox = "look_minx=20000000&look_maxx=24000000&look_miny=60000000&look_maxy=61000000&"; // Ganz Turku!
      // Build train request
      var looknv = 'look_nv=';
      looknv += 'get_rtmsgstatus|yes|';  // Get realtime message status

      looknv += 'get_passproc|yes|';
      if (this.getShowAgeOfReport()) {
        looknv += 'get_ageofreport|yes|get_rtfreitextmn|yes|';   // Get last reporting point
      }
      looknv += 'get_zntrainname|no|';  // Do not get trainname from infotext
      looknv += this.getZugPosMode();   // Set train positioning mode

      // Use Javascript interpolation?
      if (this.getInterpolateJourneys()) {
        var currentIntervalStep = this.calculateIntervalStep();
        var interval = (this.interval * this.playBackSpeed) + 5000; // + puffer
        var intervalStep = (currentIntervalStep * this.playBackSpeed);
        looknv += 'interval|' + interval + '|intervalstep|' + intervalStep + '|';   // Set Interval and intervalstep for request
      }

      if (this.getMaxTrains() != null) {
        looknv += 'maxnumberoftrains|' + this.getMaxTrains() + '|';  //
      }
      looknv += 'get_nstop|yes|';         // get infos for next stop
      looknv += 'get_pstop|yes|';         // get infos for previous stop
      looknv += 'get_fstop|yes|';         // get info for first stop
      looknv += 'get_stopevaids|yes|';    // get external ids for requested stops
      looknv += 'get_stoptimes|yes|';     // get rt times for selected stops
      looknv += 'get_rtstoptimes|yes|';   // get stop times for selected stops
      looknv += 'tplmode|trains2json3|';  // use optimized mode
      if (this.historicMode == true) {
        looknv += 'rgdensity|15|';      // use lower density for historic mode
      }
      looknv += 'correctunrealpos|no|';   // correct realgraph (off)
      looknv += 'livemapTrainfilter|yes|'; // trainfilter
      looknv += 'get_zusatztyp|yes|';
      looknv += 'get_infotext|yes|';

      if ((this.adminCode != null) && (typeof administrationMapping[this.adminCode] != "undefined")) {
        looknv += 'adms|' + this.adminCode + '____';
      }
      var prodclass = this.prodclasses;
      //url = Hafas.Config.gUrlTravelPlannerJSON + boundingBox + 'tpl=trains2json3&look_productclass='+prodclass+'&look_json=yes&performLocating=1&';
      url = this.basicUrl + boundingBox + 'tpl=trains2json3&look_productclass=' + prodclass + '&look_json=yes&performLocating=1&';
      var timeStampObj = this.getRequestTimeStamp();
      this.currentRequestTimeStamp = timeStampObj.date;
      url += timeStampObj.looknv_param;

      if (looknv != 'look_nv=') {
        url += looknv;
      }
      url += "&interval=" + interval + "&intervalstep=" + intervalStep + "&livemapRequest=yes&ts=" + timeStampObj.ts + "&";
      return url;
    },
    showTrainLane: function(obj, ids) {
      var actObj = this;
      var hashTrainId = ids.replace(new RegExp(/\//g), "x");
      var stoparray = new Array;
      var allcoords = new Array;
      actObj.trainRoutes[hashTrainId + 'stop'] = {};
      for (var i = 0; i < obj.stops.length; i++) {
        if (obj.stops[i].bno != -1) {
          var locparam = {
            type: 'location',
            imageurl: Hafas.Config.gImagePath + '/map/livemap_station.png',
            imagewidth: 6,
            imageheight: 6,
            hotspot: {x: 3, y: 3},
            coord: new CCoord({lat: parseInt(obj.stops[i].y), lon: parseInt(obj.stops[i].x)}),
            text: obj.stops[i].name
          };
          if ((typeof obj.stops[i].dep != "undefined") || (typeof obj.stops[i].arr != "undefined")) {
            locparam.text += " (" + (typeof obj.stops[i].dep != "undefined" ? obj.stops[i].dep : obj.stops[i].arr) + ")"
          }
          this.trainRoutes[hashTrainId + 'stop'][i] = actObj.map.createContent(locparam);
          actObj.map.showContent(actObj.trainRoutes[hashTrainId + 'stop'][i]);
          allcoords[allcoords.length] = locparam.coord;
        }
        stoparray[parseInt(obj.stops[i].id)] = obj.stops[i];
      }
      actObj.trainRoutes[hashTrainId + 'line'] = new Object();
      actObj.trainRoutes[hashTrainId + 'lineBG'] = new Object();
      try {

        var coords = [];
        for (var i = 0; i < obj.edges.length; i++) {
          obj.edges[i].stop1 = stoparray[parseInt(obj.edges[i].id1)];
          obj.edges[i].stop2 = stoparray[parseInt(obj.edges[i].id2)];
          if (i == 0)
          {
            coords.push(new CCoord({lat: parseInt(obj.edges[i].stop1.y), lon: parseInt(obj.edges[i].stop1.x)}));
          }
          coords.push(new CCoord({lat: parseInt(obj.edges[i].stop2.y), lon: parseInt(obj.edges[i].stop2.x)}));
        }
        actObj.trainRoutes[hashTrainId + 'line'][0] = actObj.map.createContent({
          type: "polyline",
          coords: coords,
          color: "EAAB00",
          //color: Hafas.Config.ProductColors[parseInt(actObj.trainContainer[hashTrainId].getProductClass())],
          width: 6,
          opacity: 1
        });
        //var darkColor = parseInt("0x"+Hafas.Config.ProductColors[actObj.trainContainer[hashTrainId].prodclass]) <
        actObj.trainRoutes[hashTrainId + 'line'][1] = actObj.map.createContent({
          type: "polyline",
          coords: coords,
          //color: this.getHighlightColor(Hafas.Config.ProductColors[parseInt(actObj.trainContainer[hashTrainId].getProductClass())]),
          color: this.getHighlightColor("EAAB00"),
          width: 2,
          opacity: 0.7});
        actObj.map.showContent(actObj.trainRoutes[hashTrainId + 'line'][0]);
        actObj.map.showContent(actObj.trainRoutes[hashTrainId + 'line'][1]);
        //for(var i=0; i < obj.edges.length; i++)
        //actObj.map.showContent(actObj.trainRoutes[hashTrainId+'lineBG'][i]);
      }
      catch (e) {

      }
      actObj.trainContainer[hashTrainId].showRoute = true;
      /* if(this.params.center)
       this.map.centerToContent(this.map.createContent({type: "polyline",coords:allcoords})); */
    },
    restart: function() {
      this.stopanimation();
      this.startanimation();
    },
    getHighlightColor: function(color)
    {
      if (color.length != 6)
        return "000000";
      var r = parseInt("0x" + color.substring(0, 2));
      var g = parseInt("0x" + color.substring(2, 4));
      var b = parseInt("0x" + color.substring(4, 6));
      //var h = 0.29*r+0.58*g+0.114*b;
      var h = r / 3 + b / 3 + g / 3;
      if (h > 125)
        return "000000";
      else
        return "ffffff";
    },
    addMenuEntryForRoute: function(id) {
      var pclass = (Math.log(parseInt(this.trainContainer[id].prodclass)) / (Math.log(2)));
      var currentRouteLink = document.createElement("a");
      currentRouteLink.id = 'routeChbox_' + id;
      currentRouteLink.className = 'linkButtonInfobox';
      currentRouteLink.innerHTML = Hafas.Texts.Livemap["hideroute"];
      currentRouteLink.href = 'javascript:void(0);';
      currentRouteLink.onclick = function() {
        this.hideRoute(id);
      }.bind(this);
      eId('routewindow').style.display = 'block';
      eId('routewindowId').innerHTML = '';
      var content = document.createElement("span");
      content.innerHTML = Hafas.Config.ProductImagesLivemap[this.trainContainer[id].getProductClass()] + " " + this.trainContainer[id].getName() + " ";
      eId('routewindowId').appendChild(content);
      eId('routewindowId').appendChild(currentRouteLink);
      eId('routesInMapContainer').style.display = 'block';
    },
    setCurrentTrackId: function(trackid) {
      this.stopTracking();
      this.currentTrainFollowId = trackid;
      if (eId(this.currentTrainFollowId + 'followChbox') != null) {
        eId(this.currentTrainFollowId + 'followChbox').checked = true;
      }
      this.zoomToProduct(trackid);
      if (eId('trackwindowId') != null) {
        eId('trackwindowId').innerHTML = this.trainContainer[trackid].name;
        eId('trackwindow').style.display = 'block';
      }
      this.followProduct(true);
      this.trackTrainIntervalTimer = new PeriodicalExecuter(this.followProduct.bind(this), 4);
    },
    drawRouteFromStboard: function(id) {
      this.showRoute(id);
    },
    setAdditionalInfoWindowByTrainId: function(id, boolval) {
      if (typeof this.trainContainer[id] != "undefined") {
        this.trainContainer[id].addInfo = boolval;
        if (boolval == false) {
          this.currentAddInfo = null;
        } else {
          this.currentAddInfo = id;
        }
      }
    },
    stopTracking: function() {
      if (typeof this.trackTrainIntervalTimer != 'undefined' && this.trackTrainIntervalTimer != null) {
        this.trackTrainIntervalTimer.stop();
        if (eId(this.currentTrainFollowId + 'followChbox') != null) {
          eId(this.currentTrainFollowId + 'followChbox').checked = false;
        }
        if (eId('trackwindowId') != null) {
          eId('trackwindowId').innerHTML = '';
          eId('trackwindow').style.display = 'none';
        }
        this.currentTrainFollowId = null;
        this.trackTrainIntervalTimer = null;
      }
    },
    createHistoryDateSelector: function() {
      var dateSelector = eId('historyDateSelector');
      dateSelector.length = 0;
      var yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      var yesterdayString = this.convertTimeStamps(yesterday.getDate()) + "." + (this.convertTimeStamps(yesterday.getMonth() + 1)) + "." + this.convertTimeStamps(yesterday.getFullYear());
      dateSelector.options[dateSelector.length] = new Option(yesterdayString, yesterdayString);
      var today = new Date();
      var todayString = this.convertTimeStamps(today.getDate()) + "." + (this.convertTimeStamps(today.getMonth() + 1)) + "." + this.convertTimeStamps(today.getFullYear(), true, true);
      dateSelector.options[dateSelector.length] = new Option(todayString, todayString);
      dateSelector.options[dateSelector.length - 1].selected = true;
    },
    switchToHistoryMode: function() {
      /* Stop current live animation */
      eId('historyModeBtn').style.display = 'none';
      this.stopClockInterval();
      this.stopanimation();
      this.historicMode = true;
      this.historyTimeStamp = new Date();

      this.createHistoryDateSelector();

      eId('playbackTool').style.display = 'block';
      // History
      this.historyTimeStamp.setHours(this.historyTimeStamp.getHours() - 1);
      for (var k = 0; k < eId('historyHours').options.length; k++) {
        if (eId('historyHours').options[k].value == this.historyTimeStamp.getHours()) {
          eId('historyHours').selectedIndex = k;
        }
      }
      var initString = this.convertTimeStamps(this.historyTimeStamp.getHours()) + ":" + this.convertTimeStamps(this.historyTimeStamp.getMinutes()) + ":" + this.convertTimeStamps(this.historyTimeStamp.getSeconds());
      //eId('historyHours').selectedIndex = this.historyTimeStamp.getHours();
      eId('historyMinutes').selectedIndex = (Math.round(this.historyTimeStamp.getMinutes() / 5) * 5) / 5;
      this.historyTimeStamp.setHours(this.historyTimeStamp.getHours());
      this.historyTimeStamp.setMinutes(Math.round(this.historyTimeStamp.getMinutes() / 5) * 5);
      this.historyTimeStamp.setSeconds(this.historyTimeStamp.getSeconds());

      this.timeDeltaBetweenNowAndPast = this.historyTimeStamp.getTime() - new Date().getTime();

      // Uhr anhalten
      this.stopClock();
      this.startClock(this.historyTimeStamp);
      this.setPlayBackSpeed(this.playBackSpeed);
      this.enableHistoricMode(this.historyTimeStamp, initString, eId('historicTimeVal'));
    },
    focusStation: function(data) {
      this.hideTrainRouteOverlay();
      this.map.centerToGeo(new CCoord({lon: data.x, lat: data.y}));
      this.map.setZoom(20000);
    },
    setPlayBackSpeed: function(speed) {
      this.stopanimation();
      this.playBackSpeed = speed;
      for (var m = 0; m < eId('playbackSpeedList').children.length; m++) {
        eId('playbackSpeedList').children[m].className = '';
      }
      eId('playbackSpeed' + speed).className = 'selected';
      this.startanimation();
    },
    changeTimeViaSelectBox: function() {
      this.stopanimation();
      this.stopClock();
      var selIndexHours = eId('historyHours').selectedIndex;
      var selIndexMinutes = eId('historyMinutes').selectedIndex;
      this.historyTimeStamp.setHours(eId('historyHours').options[selIndexHours].value);
      this.historyTimeStamp.setMinutes(eId('historyMinutes').options[selIndexMinutes].value);
      this.historyTimeStamp.setSeconds(0);
      this.startClock(this.historyTimeStamp);
      this.startanimation();
    },
    hideUserHint: function(id) {
      if (eId(id)) {
        eId(id).style.display = 'none';
      }
    },
    showStboard: function(par) {
      eId('stboardTickerFrame').src = Hafas.Config.gBaseUrl + Hafas.Config.gUrlStationQuery + '&widget=yes&showJourneys=15&evaId=' + par.extId;
      eId('stboardDep').style.display = 'block';
      eId('deleteCurrentSearch').style.display = 'inline';
    },
    deleteStboard: function() {
      eId('stboardTickerFrame').src = '';
      eId('stboardDep').style.display = 'none';
      eId('mapSearchField').value = '';
      eId('deleteCurrentSearch').style.display = 'none';
    },
    focusJourney: function(trainId, pclass) {
      var aUrl = Hafas.Config.gUrlTravelPlannerJSON + "tpl=singletrain2json&performLocating=8&look_nv=get_rtmsgstatus|yes|get_rtfreitextmn|yes|get_rtstoptimes|yes|get_fstop|yes|get_pstop|yes|get_nstop|yes|get_lstop|yes|zugposmode|2|&look_trainid=" + trainId + "&";
      jQuery.ajax({
        url: aUrl,
        success: function(data) {
          //var data = eval('(' + o.responseText + ')');
          var train = data.look.singletrain[0];
          var coord = new CCoord({lon: train.x, lat: train.y});
          this.map.centerToGeo(coord);
        }.bind(this)
      });
    },
    followProduct: function(zoom) {
      //if( typeof this.aktiv != 'undefined') {
      var train = this.trainContainer[this.currentTrainFollowId];
      if ((typeof train != 'undefined') && (train != null)) {
        this.map.centerToGeo(new CCoord({lon: train.getCalcX(), lat: train.getCalcY()}));
        if ((typeof zoom != "undefined") && (zoom == true)) {
          this.map.setZoom(20000);
        }
        /*this.map.map.panBy(-150,-140);*/
      }
      //}
    },
    getCurrentTimeString: function(t, format, minuteOffset) {
      var now;
      if ((typeof t != 'undefined') && (t != null)) {
        now = t;
      } else {
        now = new Date();
        var timeStampInit = this.getServerTime().getTime();
        if (typeof minuteOffset != "undefined") {
          timeStampInit += (minuteOffset * 1000 * 60);
        }
        now = new Date(timeStampInit);
      }
      var seconds, minutes, hours;
      if (now.getSeconds() < 10)
        seconds = '0' + now.getSeconds();
      else
        seconds = now.getSeconds();
      if (now.getMinutes() < 10)
        minutes = '0' + now.getMinutes();
      else
        minutes = now.getMinutes();
      if (now.getHours() < 10)
        hours = '0' + now.getHours();
      else
        hours = now.getHours();
      if (typeof format == "undefined") {
        var now_str = hours + ':' + minutes + ':' + seconds;
      } else if (format == "hh:mm") {
        var now_str = hours + ':' + minutes;
      }
      return now_str;
    }, delay2class: function(delay) {
      if ((!isNaN(delay)) && (delay != '')) {
        if (delay > 0) {
          var delayclass = 'delayed';
          var delayvalue = '+ ' + delay;
        } else if (delay == 0) {
          var delayclass = 'ontime';
          var delayvalue = Hafas.Texts.Livemap["ontime"];
        } else {
          var delayclass = 'ontime';
          var delayvalue = delay;
        }
      } else {
        var delayclass = '';
        var delayvalue = '';
      }
      return {css: delayclass, delay: delayvalue}
    }, setFernverkehr: function(boolval) {
      this.setProductClass(1, boolval, false);
      this.setProductClass(2, boolval, false);
      this.setProductClass(3, boolval, true);
      //this.updateLiveMap(false);
    }, setNahverkehr: function(boolval) {
      this.setProductClass(4, boolval, true);
      //this.updateLiveMap(false);
    }, setSBahn: function(boolval) {
      this.setProductClass(5, boolval, true);
      //this.updateLiveMap(false);
    }, showTopDelayList: function() {
      //eId('dimmerFullScreen').style.display = 'block';
      eId('topDelayOverlayFullScreen').style.display = 'block';
      var aUrl = Hafas.Config.gBaseUrl + Hafas.Config.gUrlHelp + '&L=vs_rtstat&tpl=rtstatistic_main&staType=trains';
      eId('topDelayContainer').src = aUrl;
    }, hideTopDelayOverlay: function() {
      //eId('dimmerFullScreen').style.display = 'none';
      eId('topDelayOverlayFullScreen').style.display = 'none';
    }, setMinDelay: function(value) {
      if (value.length == 0) {
        this.minDelay = null;
      } else {
        this.minDelay = parseInt(value);
      }

    }, setAdminCode: function(value) {
      this.adminCode = value;
      if (this.admsUpdateTimeout != null) {
        window.clearTimeout(this.admsUpdateTimeout);
      }
      this.admsUpdateTimeout = window.setTimeout(function() {
        this.trainContainer = new Object;
        this.updateLiveMap();
      }.bind(this), 1000);
    }, openTrainRouteOverlay: function(id) {
      var realId = id.replace(new RegExp(/x/g), "/");
      eId('dimmerFullScreen').style.display = 'block';
      eId('trainRouteOverlayFullScreen').style.display = 'block';
      var date = new Date();
      var datestring = date.getDate() + "." + (parseInt(date.getMonth()) + 1) + "." + date.getFullYear();
      var aUrl = Hafas.Config.gLivemapBaseUrl + Hafas.Config.gTraininfo_path + "/3" + Hafas.Config.gLanguage + Hafas.Config.gBrowser + "/" + realId + '?showWithoutHeader=1&date=' + datestring + '&' + Hafas.Config.gCatenateLayout + '&';
      if ((typeof this.trainContainer[id].infotexts[0] != "undefined") || (typeof this.trainContainer[id].infotexts[1] != "undefined")) {
        var trainname = this.trainContainer[id].infotexts[0].OC + " " + this.trainContainer[id].infotexts[1].RT;
      } else {
        var trainname = this.trainContainer[id].getName();
      }
      aUrl += "customerTrainName=" + this.trainContainer[id].infotexts[0].OC + " " + this.trainContainer[id].infotexts[1].RT + " " + this.trainContainer[id].fstop.fdep + " " + this.trainContainer[id].fstop.fname + " " + Hafas.Texts.Livemap['destination'] + " " + this.trainContainer[id].getLastStopName();
//            aUrl += "customerTrainName=" + this.trainContainer[id].infotexts[0].OC + " " + this.trainContainer[id].infotexts[1].RT + " " + Hafas.Texts.Livemap['destination'] + " " + this.trainContainer[id].getLastStopName();
      eId('trainRouteContainer').innerHTML = '';
      jQuery.ajax({
        url: aUrl,
        success: function(o) {
          eId('trainRouteContainer').scrollTop = 0;
          eId('trainRouteContainer').innerHTML = o;
        }
      });
    }, hideTrainRouteOverlay: function() {
      eId('trainRouteOverlayFullScreen').style.display = 'none';
    }, isRealtimeAvailable: function(fDelay, pDelay, nDelay, dDelay) {
      if ((fDelay == '') && (pDelay == '') && (nDelay == '') && (dDelay == '')) {
        return false;
      } else {
        return true;
      }
    }, closeInfoWindow: function() {
      if ((this.currentOpenInfoWindow != null) && (typeof this.trainContainer[this.currentOpenInfoWindow] != "undefined")) {
        if (typeof this.trainContainer[this.currentOpenInfoWindow].infobox != "undefined") {
          this.trainContainer[this.currentOpenInfoWindow].infobox.close();
          this.trainContainer[this.currentOpenInfoWindow].infobox = null;
        }
        this.setAdditionalInfoWindowByTrainId(this.currentOpenInfoWindow, false);
        this.currentOpenInfoWindow = null;

      }
    }, getInfoBoxContentForJourney: function(result, id) {

      if (this.trainContainer[id] != undefined)
        var dateRef = this.trainContainer[id].dateRef;
      else
        var dateRef = "";
      var data = {
        train: {
          trainId: result.look.singletrain[0].trainid,
          id: id,
          name: this.trainContainer[id].getName(),
          destination: result.look.singletrain[0].directionName,
          dateRef: dateRef,
          startStation: {
            name: result.look.singletrain[0].fstopname,
            time: result.look.singletrain[0].fdep,
            delay: result.look.singletrain[0].fdep_d
          },
          destStation: {
            name: result.look.singletrain[0].lstopname,
            time: result.look.singletrain[0].larr,
            delay: result.look.singletrain[0].larr_d
          }
        },
        isFollowChecked: (id == this.trackerid),
        isRouteChecked: (id == this.currentTrainLaneId)
      };

      if ((typeof result.look.singletrain[0].pstopname != "undefined") &&
              (result.look.singletrain[0].fstopname != result.look.singletrain[0].pstopname))
        data.train.lastStation = {
          name: result.look.singletrain[0].pstopname,
          time: result.look.singletrain[0].pdep,
          delay: result.look.singletrain[0].pdep_d
        };

      if ((typeof result.look.singletrain[0].nstopname != "undefined") &&
              (result.look.singletrain[0].lstopname != result.look.singletrain[0].nstopname))
        data.train.nextStation = {
          name: result.look.singletrain[0].nstopname,
          time: result.look.singletrain[0].narr,
          delay: result.look.singletrain[0].narr_d
        };

      var html = Mark.up(document.getElementById("livemapInfoboxTrain").innerHTML, data);
      return html;

    }, generateRequest: function(id, click, x, y) {
      var actObj = this;
      var realId = id.replace(new RegExp(/x/g), "/");
      var aUrl = this.singleVehicleUrl + '&look_nv=get_rtstoptimes|yes|get_fstop|yes|get_pstop|yes|get_nstop|yes|get_lstop|yes|' + this.getZugPosMode() + '&look_trainid=' + realId + '&';
      if (this.historicMode) {
        aUrl += 'look_requesttime=' + convertTimeStamps(this.historicInitialTimeStamp.getHours()) + ":" + convertTimeStamps(this.historicInitialTimeStamp.getMinutes()) + ":" + convertTimeStamps(this.historicInitialTimeStamp.getSeconds()) + '&';
      }
      jQuery.ajax({
        url: aUrl,
        method: 'post',
        success: function(result) {
          var html = this.getInfoBoxContentForJourney(result, id);

          if ((!this.trainContainer[id].addInfo) || (eId(id + 'outerInfoBoxWrap') == null)) {
            if ((this.currentOpenInfoWindow != null) && (typeof this.trainContainer[this.currentOpenInfoWindow] != 'undefined')) {
              if (typeof this.trainContainer[id] != 'undefined')
              {
                this.trainContainer[this.currentOpenInfoWindow].addInfo = false;
              }
            }
            var currentInfoBox = actObj.map.showInfoboxGeo(new CCoord({lon: actObj.trainContainer[id].getCalcX(), lat: actObj.trainContainer[id].getCalcY()}), '<div id="' + id + 'outerInfoBoxWrap">' + html + '</div>');
            setTimeout(function() {
              /*eId(id + 'trainRoute').onclick = function() {
               actObj.openTrainRouteOverlay(id);
               }*/
              eId(id + 'followChbox').onclick = function() {
                if (this.checked) {
                  actObj.setCurrentTrackId(id);
                } else {
                  actObj.stopTracking();
                }
              }
              eId(id + 'routeChbox').onclick = function() {
                if (this.checked) {
                  actObj.clickOnShowRoute(id, true);
                } else {
                  actObj.hideRoute(id);
                }
              }
            }.bind(this), 500);

            this.trainContainer[id].infobox = currentInfoBox;
            this.trainContainer[id].addInfo = true;
          } else {
            actObj.map.updateInfoBoxPosition(this.trainContainer[id].infobox, new CCoord({lon: result.look.singletrain[0].x, lat: result.look.singletrain[0].y}));
            //this.trainContainer[id].infobox.setContent(html);
            eId(id + 'outerInfoBoxWrap').innerHTML = html;
            eId(id + 'trainRoute').onclick = function() {
              actObj.openTrainRouteOverlay(id);
            }
            eId(id + 'followChbox').onclick = function() {
              if (this.checked) {
                actObj.setCurrentTrackId(id);
              } else {
                actObj.stopTracking();
              }
            }
            eId(id + 'routeChbox').onclick = function() {
              if (this.checked) {
                actObj.clickOnShowRoute(id);
              } else {
                actObj.hideRoute(id);
              }
            }
          }
          this.currentOpenInfoWindow = id;

        }.bind(this)
      }
      );
    },
    clickOnShowRoute: function(id) {
      var realId = id.replace(new RegExp(/x/g), "/");
      if (!this.trainContainer[id].showRoute)
      {
        this.showRoute(realId, true);
      }
    }
    , togglePopupTabs: function(id, trainId) {
      if (typeof currentActiveTab != "undefined") {
        eId(currentActiveTab).className = '';
        eId(currentActiveTab + "Content").style.display = 'none';
      }
      eId(id + "Content").style.display = 'block';
      eId(id).className = 'active';
      currentActiveTab = id;
      this.trainContainer[trainId].activePopupTab = id;
    }, getMultiInfoBoxContent: function(trains, x, y) {
      var html = '';
      for (var m = 0; m < trains.length; m++) {
        var hashId = trains[m].id.replace(new RegExp(/\//g), "x");
        var train_icon = Hafas.Config.ProductImagesHTML[this.trainContainer[hashId].getProductClass()];
        html += '<div class="multiInfoBoxEntry">' + train_icon + '<strong>' + trains[m].n + '</strong> <a class="linkButton" href="javascript:Livemap_map.getSingleTrain(\'' + hashId + '\',null,' + x + ',' + y + ');">Details</a></div>';
      }
      return html;
    }, getMultiTrain: function(obj, id) {
      if (this.currentOpenInfoWindow) {
        this.setAdditionalInfoWindowByTrainId(this.currentOpenInfoWindow, false);
      }
      var html = "<div style='width:300px;'>";
      html += "<div><strong>" + obj.name + "</strong></div>";
      for (var k = 0; k < obj.reference.length; k++) {
        var hashTrainId = obj.reference[k].id.replace(new RegExp(/\//g), "x");
        html += "<div><a class='livemapMultiTrainLink' href='javascript:void(0);' onclick='javascript:Livemap_livefahrplan.getSingleTrain(\"" + hashTrainId + "\",null," + x + "," + y + ");'>" + obj.reference[k].n + "</a> <a style='padding-left:15px !important;' href='javascript:void(0);' onclick='javascript:Livemap_livefahrplan.getSingleTrain(\"" + hashTrainId + "\",null," + x + "," + y + ");' class='linkButton'>" + this.trainContainer[hashTrainId].getLastStopName() + "</a></div>";
      }
      html += "</div>";
      var x = obj.x;
      var y = obj.y;

      this.currentMultiTrainPopup = {
        popup: this.map.showInfoboxGeo(new CCoord({lon: x, lat: y}), null, html, null, function() {
        }),
        stopCount: obj.sc
      };

    }, isTrainFollowed: function(id) {
      if ((this.currentTrainFollowId != null) && (this.currentTrainFollowId == id)) {
        return true;
      }
      return false;
    }, isTrainRouteShown: function(id) {
      if ((this.currentTrainLaneId != null) && (this.currentTrainLaneId == id)) {
        return true;
      }
      return false;
    }, isTrainExclusivelySelected: function(id) {
      if ((this.exclusiveTrainId != null) && (this.exclusiveTrainId == id)) {
        return true;
      }
      return false;
    }, setPopupStatus: function(id) {
      var realId = id.replace(new RegExp(/x/g), "/");
      var actObj = this;
      /* Check if route is displayed? */
      if (eId('train_' + id + 'trainRoute')) {
        eId('train_' + id + 'trainRoute').onclick = function() {
          this.openTrainRouteOverlay(id);
          eId('currentTrainPosLabel').innerHTML = actObj.trainContainer[id].name;
        }
      }
      if (eId('train_' + id + 'routeChbox') && this.isTrainRouteShown(id)) {
        eId('train_' + id + 'routeChbox').checked = "checked";
      }
      if (eId('train_' + id + 'followChbox') && this.isTrainFollowed(id)) {
        eId('train_' + id + 'followChbox').checked = "checked";
      }

      if (eId('train_' + id + 'exclusiveTrain') && this.isTrainExclusivelySelected(id)) {
        eId('train_' + id + 'exclusiveTrain').checked = "checked";
      }

      if (eId('train_' + id + 'exclusiveTrain')) {
        eId('train_' + id + 'exclusiveTrain').onclick = function() {
          if (this.checked) {
            actObj.setExclusiveTrain(id);
          } else {
            actObj.setExclusiveTrain(null);
          }
        }
      }
      if (eId('train_' + id + 'followChbox')) {
        eId('train_' + id + 'followChbox').onclick = function() {
          if (this.checked) {
            actObj.setCurrentTrackId(id);
          } else {
            actObj.stopTracking();
          }
        }
      }
      if (eId('train_' + id + 'routeChbox')) {
        eId('train_' + id + 'routeChbox').onclick = function() {
          if (this.checked) {
            actObj.showRoute(realId, true);
          } else {
            actObj.hideRoute(id);
          }
        }
      }
      currentActiveTab = 'train_' + id + 'tabInfo';
    }, getTrainFunctionsHTML: function(id) {
      if (parseInt(this.trainContainer[id].getAgeOfReport()) != -1) {
        var timeString = this.getCurrentTimeString(null, "hh:mm", -this.trainContainer[id].getAgeOfReport()) + " " + Hafas.Texts.Livemap["hour"];
      } else {
        var timeString = Hafas.Texts.Livemap["noReportingMsg"];
      }
      var html = '<div>' + Hafas.Texts.Livemap["lastReportingMsg"] + ' ' + timeString + '</div>' +
              '<div class="trainLivemapFunctions">' +
              '<div style="float:left;">' +
              /* Follow Mode */
              '<div>' +
              '<input type="checkbox" class="livemapCheckbox" id="train_' + id + 'followChbox"/><label for="train_' + id + 'followChbox">' + Hafas.Texts.Livemap["followJourney"] + '</label>' +
              '</div>' +
              /* Route Mode */
              '<div>' +
              '<input type="checkbox" class="livemapCheckbox" id="train_' + id + 'routeChbox"/><label for="train_' + id + 'routeChbox">' + Hafas.Texts.Livemap["routeJourney"] + '</label><span id="train_' + id + 'routeLoader" style="visibility:hidden;"><img style="vertical-align:middle;" src="' + Hafas.Config.gImagePath + 'vs_livefahrplan/ajax_loader_small_black.gif"/></span>' +
              '</div>' +
              /* Exclusive Mode */
              '<div>' +
              '<input type="checkbox" class="livemapCheckbox" id="train_' + id + 'exclusiveTrain"/><label for="train_' + id + 'exclusiveTrain">' + Hafas.Texts.Livemap["onlyThisTrain"] + '</label>' +
              '</div>' +
              '</div>' +
              '<div style="float:right;">' +
              '<p class="floatRight button-inside querybutton" style="margin-right:0px;"><span class="button-border"><button onclick="javascript:Livemap_' + this.name + '.openTrainRouteOverlay(\'' + id + '\');" title="' + Hafas.Texts.Livemap["showallStops"] + '" value="Suchen" name="start" class="highlight" type="submit"><span>' + Hafas.Texts.Livemap["showallStops"] + '</span></button></span></p>' +
              '</div>' +
              '<div style="clear:both;"></div>' +
              '</div>';
      return html;
    }, getSingleTrain: function(id, click, x, y) {
      var actObj = this;
      var realId = id.replace(new RegExp(/x/g), "/");
      var showRouteLinkVis = 'display:block';
      var hideRouteLinkVis = 'display:none';
      this.singleVehicleUrl = Hafas.Config.gUrlTravelPlanner + 'L=vs_livefahrplan&tpl=trainpopup&performLocating=8&';
      var aUrl = Hafas.Config.gUrlTrainInfo + '/' + realId + '?L=vs_livefahrplan&showWithoutHeader=1&date=' + this.trainContainer[id].getReferenceDate() + '&rt=1&compactView=true&';

      if (typeof this.trainContainer[this.currentOpenInfoWindow] != "undefined") {
        this.setAdditionalInfoWindowByTrainId(this.currentOpenInfoWindow, true);
      }
      jQuery.ajax({
        url: aUrl,
        method: 'post',
        complete: function(html) {
          //var html = o.responseText;
          if ((!this.trainContainer[id].addInfo) || (eId(id + 'outerInfoBoxWrap') == null)) {
            if ((this.currentOpenInfoWindow != null) && (typeof this.trainContainer[this.currentOpenInfoWindow] != 'undefined')) {
              this.setAdditionalInfoWindowByTrainId(this.currentOpenInfoWindow, false);
            }
            this.currentOpenInfoWindow = id;
            var coord = new CCoord({lon: actObj.trainContainer[id].getCalcX(), lat: actObj.trainContainer[id].getCalcY()});

            //pixel coord
            var scrPix = this.map.geo2scr(coord);
            if (scrPix.x < 600) {
              //this.map.map.panBy(-(600 - scrPix.x),0);
            }

            var currentInfoBox = actObj.map.showInfoboxGeo(coord, null, '<div id="' + id + 'outerInfoBoxWrap" class="trainPopupDefault">' + html + this.getTrainFunctionsHTML(id) + '</div>', null, function() {
              this.setPopupStatus(id);
            }.bind(this), function() {
              // Popup closed
              this.setAdditionalInfoWindowByTrainId(id, false);
              this.stopTracking();
            }.bind(this));
            this.trainContainer[id].infobox = currentInfoBox;
            this.setAdditionalInfoWindowByTrainId(id, true);
          } else {
            eId(id + 'outerInfoBoxWrap').innerHTML = html + this.getTrainFunctionsHTML(id);
            this.setPopupStatus(id);
          }
          this.currentOpenInfoWindow = id;
        }.bind(this)
      }
      );
    }
  };
}


var PeriodicalExecuterForObjects = function(a, b) {
  this.initialize(a, b);
};
PeriodicalExecuterForObjects.prototype = new PeriodicalExecuter();

PeriodicalExecuterForObjects.prototype.initialize = function(aobject, afrequency) {
  this.obj = aobject;
  this.frequency = afrequency;
  this.currentlyExecuting = false;
  this.registerCallback();
};
PeriodicalExecuterForObjects.prototype.callback = function() {
  if (typeof this.obj != 'undefined' && typeof this.obj.callback != 'undefined')
    this.obj.callback();
};



Hafas.Journey = function(a, b, c, d, e, f) {
  this.initialize(a, b, c, d, e, f);
}
Hafas.Journey.prototype = {
  initialize: function(param, timestamp, ckv, livemap, requestTimeStamp, hashId) {
    /* Array mapping */
    this.hashId = hashId;
    this.cache = [];
    this.livemapRef = livemap;
    this.ckv = ckv;
    this.name = param[0];
    this.x = this.sign(param[1]);
    this.y = this.sign(param[2]);
    this.id = param[3];
    this.direction = param[4];
    this.productclass = param[5];
    this.delay = param[6];
    this.lstopname = param[7];
    this.pstopname = param[9];
    this.pstopno = param[10];
    this.pstopdeparture = param[17];
    this.nstopname = param[11];
    this.nstopno = param[12];
    this.nstoparrival = param[16];
    this.dateRef = param[13];
    this.timestampRef = timestamp;
    this.ageofreport = param[14];
    this.lastreporting = param[15];
    this.hideMoments = param[22];
    this.passproc = 0;
    this.requestTimeStamp = requestTimeStamp;
    this.poly = this.initPositionData(param[8]);
    this.zpathflags = param[20];
    this.calcX = null;
    this.calcY = null;
    this.display = false;
    this.additionaltype = param[21];
    this.infotexts = param[25];
    this.fstop = param[26];
    this.hasCurrentData = true;
    this.currentPolyIndex = -1;

  },
  updateData: function(data, timestampRef, ckv, requestTimeStamp, requestStepsLeft) {
    this.name = data[0];
    this.ckv = ckv;
    //this.x = this.sign(data[1]);
    //this.y = this.sign(data[2]);
    this.id = data[3];
    this.direction = data[4];
    this.productclass = data[5];
    this.delay = data[6];
    this.lstopname = data[7];
    this.pstopname = data[9];
    this.pstopno = data[10];
    this.nstopname = data[11];
    this.nstopno = data[12];
    this.dateRef = data[13];
    this.pstopdeparture = data[17];
    this.nstoparrival = data[16];
    this.ageofreport = data[14];
    this.lastreporting = data[15];
    this.zpathflags = data[20];
    this.timestampRef = timestampRef;
    this.additionaltype = data[21];
    this.hideMoments = data[22];
    this.requestTimeStamp = requestTimeStamp;
    this.infotexts = data[25];
    this.fstop = data[26];
    this.hasCurrentData = true;
    this.updatePolyObject(data[8], requestStepsLeft);
  },
  createTimeStampFromString: function(date, time) {
    var dateSplit = date.split(".");
    var timeSplit = time.split(":");
    var day = parseInt(dateSplit[0], 10);
    var month = parseInt(dateSplit[1], 10) - 1;
    var year = "20" + parseInt(dateSplit[2], 10);
    var hour = parseInt(timeSplit[0], 10);
    var minute = parseInt(timeSplit[1], 10);
    var seconds = parseInt(timeSplit[2], 10);
    var date = new Date(year, month, day, hour, minute, seconds, 0);
    return date;
  },
  sign: function(val) {
    var signed = this.ckv * (val % this.ckv) + parseInt(val / this.ckv);
    return signed;
  },
  parseReqDate: function(dateStr) {
    return dateStr.substr(6, 2) + "." + dateStr.substr(4, 2) + "." + dateStr.substr(2, 2);
  },
  initPositionData: function(poly, newDelay) {
    var timeBase = this.createTimeStampFromString(this.parseReqDate(this.requestTimeStamp), this.timestampRef);
    poly[0].hasNewDelay = newDelay;
    for (var m = 0; m < poly.length; m++) {
      var currentPositionTimeStamp = new Date(timeBase.getTime() + poly[m][2]);
      poly[m].time = currentPositionTimeStamp;
      poly[m][5] = parseInt(poly[m][5], 10);
      poly.delay = this.delay;
      //this.cache.push(poly[m]);
      /*if (m < poly.length - 1) {
       poly[m].speed = this.calcSpeed(poly[m], poly[m + 1]);
       }*/
    }
    if (this.hideMoments != null) {
      for (var n = 0; n < this.hideMoments.length; n++) {
        this.hideMoments[n].tsBegin = new Date(timeBase.getTime() + this.hideMoments[n].b);
        this.hideMoments[n].tsEnd = new Date(timeBase.getTime() + this.hideMoments[n].e);
      }
    }

    return poly;
  },
  updatePolyObject: function(rawPoly, requestStepsLeft) {
    var poly = this.initPositionData(rawPoly);

    if (this.poly[this.currentPolyIndex] != undefined)
      var currentPoly = this.poly[this.currentPolyIndex];
    else
      var currentPoly = this.poly[this.poly.length - 1];

    // startM : Position des Starts des neuen Poli
    var startM = requestStepsLeft;
    var pl = poly.length;

    if (poly.length <= startM)
    {
      startM = 0;
      console.warn("Livemap->updatePolyObject: Request Zeit zu groß!");
    }

    var jumpSpeed = this.calcSpeed(currentPoly, poly[startM]);

    // Großer Sprung nach forne -> einige Punkte werden übersprungen damit die Gewschindigkeit unter 150 kmh bleibt.
    if (jumpSpeed > 150)
    {
      currentPoly.isJump = true;
      // Keine Richtung
      currentPoly[3] = -1;
      for (var i = startM; i < pl; i++)
      {
        jumpSpeed = jumpSpeed / (i + 1);
        startM = i;
        if (jumpSpeed < 150)
          break;
      }
      //console.log("Good Jump Linie:" + this.name + " -> " + startM + ":" + pl + " Speed:" + jumpSpeed);
    }

    // Aktueller Punkte und neue Daten werden zusammengefasst.
    this.poly = [currentPoly].concat(poly.slice(startM, poly.length));

    // Fahrt nach hinte wird verhindert indem die Koordinaten der folgenden Punkte mit der aktuellen Koordinate gleichgesetzt werden bis die Fahrt wieder vorwärts geht.
    for (var i = 0; i < this.poly.length; i++)
    {
      if (this.passproc > this.poly[i][5])
      {
        this.poly[i][0] = this.x;
        this.poly[i][1] = this.y;
        this.poly[i][3] = -1;
        if ((i > 0) || (this.passproc > this.poly[i + 1][5])) // Der Wartezustand wird nur markiert, wenn er mindestens 2 Intervalle anhält
          this.poly[i].isWait = true;
        this.poly[i].isJump = false;
      }
      else if (this.passproc < this.poly[i][5])
        break;
    }
    //if (j != 0)
    //  console.log("Bad Jump Linie:" + this.name + " -> " + j + ":" + this.poly.length + " pass:" + this.passproc + " first:" + this.poly[1][5]);

    if (LiveMapDebugData[this.name] == undefined)
      LiveMapDebugData[this.name] = [];
    if (LiveMapDebugData[this.name][this.hashId] == undefined)
      LiveMapDebugData[this.name][this.hashId] = {train: this, poly: []};
    LiveMapDebugData[this.name][this.hashId].train = this;
    LiveMapDebugData[this.name][this.hashId].poly = LiveMapDebugData[this.name][this.hashId].poly.concat(this.poly)



    var polyIndex = this.livemapRef.trainOverlay.getPolyIndex(this.poly, this.livemapRef.getServerTime());
    this.poly.splice(0, polyIndex);
  },
  isTrainLayered: function(time) {
    for (var k = 0; k < this.hideMoments.length; k++) {
      if ((time.getTime() >= this.hideMoments[k].tsBegin.getTime()) && (time.getTime() <= this.hideMoments[k].tsEnd.getTime())) {
        return true;
      }
    }
    return false;
  },
  getHideMoments: function() {
    return this.hideMoments;
  },
  drawDebugPositions: function() {
    var poly = new Array();
    if (typeof this.polyDebug != "undefined" && this.polyDebug != null) {
      this.livemapRef.map.hideContent(this.polyDebug);
      this.livemapRef.map.removeContent(this.polyDebug);
    }
    var colors = ["red", "blue", "green", "yellow"];
    for (var i = 0; i < this.poly.length; i++) {
      poly.push(new CCoord({lon: this.poly[i][0], lat: this.poly[i][1]}));
    }
    var random = Math.floor(0 + (3 + 1) * (Math.random()));
    var polyTmp = this.livemapRef.map.createContent({
      type: 'polyline',
      coords: poly,
      width: 3,
      color: colors[random]
    });
    this.livemapRef.map.showContent(polyTmp);
    this.polyDebug = polyTmp;
  },
  isProductClassActive: function() {
    var prodclass = this.getProductClass();
    if ((this.livemapRef.prodclasses & prodclass) !== 0) {
      return true;
    } else {
      return false;
    }
  },
  isReportOverdue: function() {
    var result = this.getZpathflags() & 2;
    if (result == 0) {
      return false;
    } else {
      return true;
    }
  },
  noReportMessages: function() {
    var result = this.getZpathflags() & 4;
    if (result == 0) {
      return false;
    } else {
      return true;
    }
  },
  checkTrainRule: function() {

  },
  /********** GETTER **************/
  /* returns the trainname */
  getName: function() {
    return this.name;
  },
  /* returns the trainId*/
  getId: function() {
    return this.id;
  },
  getKey: function() {
    return this.key;
  },
  /* return product class*/
  getProductClass: function() {
    return this.productclass;
  },
  /* return delay value of journey */
  getDelay: function() {
    return this.delay;
  },
  /* return last stop name */
  getLastStopName: function() {
    return this.lstopname;
  },
  /* return next stop name */
  getNextStopName: function() {
    return this.nstopname;
  },
  /* return previous stop name */
  getPreviousStopName: function() {
    return this.pstopname;
  },
  /* return reference date */
  getReferenceDate: function() {
    return this.dateRef;
  },
  /* return ageofreport */
  getAgeOfReport: function() {
    return this.ageofreport;
  },
  /* return name of last reporting point */
  getLastReportingPoint: function() {
    return this.lastreporting;
  },
  getCalcX: function() {
    return this.calcX;
  },
  getCalcY: function() {
    return this.calcY;
  },
  getZpathflags: function() {
    return parseInt(this.zpathflags);
  },
  getAdditionalType: function() {
    return parseInt(this.additionaltype);
  },
  getDisplay: function() {
    return this.display;
  },
  getDirection: function() {
    return this.direction;
  },
  getPassProcCm: function() {
    return this.passprocCm;
  },
  getPassProc: function() {
    return this.passproc;
  },
  getCodeDeMission: function() {
    return this.codeDeMission;
  },
  /********** SETTER **************/
  setCalcX: function(x) {
    this.calcX = x;
  },
  setCalcY: function(y) {
    this.calcY = y;
  },
  setDisplay: function(display) {
    this.display = display;
  },
  calcSpeed: function(currPoint, nextPoint) {

    // Achtung! Die Funktion ist eine sehr sehr grobe Annäherung.

    var dx = 71.5 * ((currPoint[0] - nextPoint[0]) / 10000);
    var dy = 111.3 * ((currPoint[1] - nextPoint[1]) / 10000);
    var dist = Math.sqrt(dx * dx + dy * dy);
    //var time = this.livemapRef.intervalStep / 1000;
    var time = 2;
    return Math.abs(dist * (36 / time));
    //return dist;
  }
};

/*
 * Zeigt einen Linefilter an. Jede Linie kann per Checkbox an und abgewählt werden.
 */
function LineFilterDisplay(livemap)
{
  this.livemap = livemap;
  this.isShown = false;
  this.currentLines = {};
  this.lineFilterDiv = document.getElementById("Livemap_LineFilterContainer");
  this.defaultDisabled = false;

  this.update = function()
  {
    var newLines = 0;
    var hasLostLine = false;
    var hasFoundLine = false;

    for (var key in this.currentLines)
    {
      this.currentLines[key].count = 0;
    }
    for (var key in this.livemap.trainContainer)
    {
      var train = this.livemap.trainContainer[key];
      if (this.currentLines[train.name] == undefined)
      {
        newLines++;
        this.currentLines[train.name] = {name: train.name, count: 1, disabled: this.defaultDisabled, isLost: false, number: train.name.split(" ").pop()};
      }
      else
        this.currentLines[train.name].count++;
    }
    for (var key in this.currentLines)
    {
      if ((this.currentLines[key].count == 0) && (!this.currentLines[key].isLost))
      {
        hasLostLine = true;
        this.currentLines[key].isLost = true;
      }
      else if ((this.currentLines[key].count > 0) && (this.currentLines[key].isLost))
      {
        hasFoundLine = true;
        this.currentLines[key].isLost = false;
      }
    }

    //if (this.isShown && ((newLines.length > 0) || hasLostLine || hasFoundLine))
    if (this.isShown)
      this.render();
  };
  this.show = function()
  {
    if (this.isShown)
      return false;
    this.isShown = true;
    document.getElementById("Livemap_LineFilterShowButton").style.display = "none";
    document.getElementById("Livemap_LineFilterHideButton").style.display = "";
    this.render();
    return true;
  };
  this.hide = function()
  {
    if (!this.isShown)
      return false;
    this.isShown = false;
    document.getElementById("Livemap_LineFilterShowButton").style.display = "";
    document.getElementById("Livemap_LineFilterHideButton").style.display = "none";
    this.enableAll();
    this.lineFilterDiv.innerHTML = "";
    return true;
  };
  this.render = function() {
    if (!this.isShown)
      return;
    var list = [];
    for (var key in this.currentLines)
    {
      list.push(this.currentLines[key]);
    }
    list.sort(function(a, b) {
      return Hafas.tools.LineNumberSorter(a.number, b.number);
    });

    var html = Mark.up(document.getElementById("jsTpl_livemapLineFilterList").innerHTML, {lines: list});
    this.lineFilterDiv.innerHTML = html;
  };

  this.isTrainActive = function(trainName)
  {
    if (!this.isShown)
      return true;
    else if (this.currentLines[trainName] == undefined)
    {
      console.warn("Livemap - LineFilterDisplay.isTrainActive: Unbekannter Zug:" + trainName);
      return true;
    }
    return !this.currentLines[trainName].disabled;
  };

  this.setTrainState = function(trainName, state)
  {
    if (this.currentLines[trainName] == undefined)
    {
      console.warn("Livemap - LineFilterDisplay.setTrainState: Unbekannter Zug:" + trainName);
      return true;
    }
    this.currentLines[trainName].disabled = !state;
  };
  this.disableAll = function()
  {
    for (var key in this.currentLines)
    {
      this.currentLines[key].disabled = true;
    }
    this.render();
    document.getElementById("linemal_lineFilterDisButton").style.display = "none";
    document.getElementById("linemal_lineFilterEnButton").style.display = "";
    this.defaultDisabled = true;
  };

  this.enableAll = function()
  {
    for (var key in this.currentLines)
    {
      this.currentLines[key].disabled = false;
    }
    this.render();
    document.getElementById("linemal_lineFilterDisButton").style.display = "";
    document.getElementById("linemal_lineFilterEnButton").style.display = "none";
    this.defaultDisabled = false;
  };
}





