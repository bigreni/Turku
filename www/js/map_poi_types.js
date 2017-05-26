var gStationsApp = {
    poiViewer: null,
    poiViewerInitInterval: null
};

gStationsApp.initStationsApp = function() {

    gStationsApp.poiViewer = new PoiViewer.viewer(Map_fullmap, "gStationsApp");
    clearInterval(gStationsApp.poiViewerInitInterval);
    delete gStationsApp.poiViewerInitInterval;
    gStationsApp.createAllStationsPOIs();
};

function TurkuStationsType(name, inputId)
{
    this.name = name;
    this.url = null;
    this.inputId = inputId;
    this.styles = {};
    this.init();
}
;

TurkuStationsType.prototype = new PoiViewer.PoiType("", "", "");
TurkuStationsType.prototype.renderData = function(rData)
{
    var data = {pois: []};
    for (var i = 0; i < rData.stops.length; i++)
    {
        var stop = rData.stops[i];
        if((typeof stop.mainstop != "undefined") && (stop.mainstop != stop.extId))
            var mainStopId = stop.mainstop;
        else
            var mainStopId = null;
        data.pois.push({text: stop.name, coord: new CCoord({lat: stop.y, lon: stop.x}), id: stop.extId, mainStopId:mainStopId, rawData:stop, isMeta:stop.isrealmeta == "1" });
    }

    return data;
};

TurkuStationsType.prototype.getStyle = function(poi)
{
    if((Map_fullmap.getZoom("api") < 4) && (poi == null))
        return null;
    if((Map_fullmap.getZoom("api") < 4))
        return this.styles["point"]; // Hauptmast Style als Punkte
    if((Map_fullmap.getZoom("api") < 6) || (poi == null))
        return this.styles["small_main"]; // Hauptmast Style
    else if(poi.mainStopId == null)
    {
        if(poi.isMeta)
            return null;
    }
    return this.styles["small"]; // Nebenmast Style
};

TurkuStationsType.prototype.getUrl = function()
{
    if(Map_fullmap.getZoom('api') < 6)
        return Hafas.Config.gUrlTravelPlannerJSON + "y?performLocating=2&tpl=stop2json&look_stopclass=31&look_nv=combinemode|3|&";
    else
        return Hafas.Config.gUrlTravelPlannerJSON + "y?performLocating=2&tpl=stop2json&look_stopclass=31&look_nv=meta|yes|&";
};

TurkuStationsType.prototype.getKey = function(poi)
{
    /*
     * Der Key aendert sich damit ein Neuzeichnen erzwungen wird.
     */
    if(Map_fullmap.getZoom('api') < 4)
        return "point_"+poi.id;
    if(Map_fullmap.getZoom('api') < 6)
        return poi.id;
    else
        return "all_"+poi.id;
};

TurkuStationsType.prototype.sort = function(poiList)
{
    poiList.sort(function(a, b) {
        if(a.mainStopId == null)
            var ai = 1;
        else
            var ai = 0;
        if(b.mainStopId == null)
            var bi = 1;
        else
            var bi = 0;
        return ai - bi;
    });
};


gStationsApp.createAllStationsPOIs = function()
{
    // new TurkuStationsType([poiName], [url], [inputId]);
    var poiType_0 = new TurkuStationsType(
            "station_8",
            "StationMenuCheckbox_8"
            );
    poiType_0.onclick = function(poi) {
        var param = {
            map: Map_fullmap,
            name: poi.text,
            x: poi.coord.lon,
            y: poi.coord.lat,
            id: poi.id,
            mainStopId:poi.mainStopId,
            rawData:poi.rawData
        };
        var ib = new StationInfobox(Map_fullmap, param);
        ib.show();
    };
    poiType_0.styles["main"] = new PoiViewer.PoiStyle({
        icon: Hafas.Config.gImagePath+"map/map_stop.png",
        minZoom: 0,
        size: {width: 43, height: 53},
        hotspot: {x: 20, y: 50}
    });
    poiType_0.styles["small"] = new PoiViewer.PoiStyle({
        icon: Hafas.Config.gImagePath+"map/map_stop_small.png",
        minZoom: 0,
        size: {width: 30, height: 37},
        hotspot: {x: 15, y: 36}
    });
    poiType_0.styles["small_main"] = new PoiViewer.PoiStyle({
        icon: Hafas.Config.gImagePath+"map/map_stop.png",
        minZoom: 0,
        size: {width: 30, height: 37},
        hotspot: {x: 15, y: 36}
    });
    poiType_0.styles["point"] = new PoiViewer.PoiStyle({
        icon: Hafas.Config.gImagePath+"map/stop_point.png",
        minZoom: 0,
        size: {width: 10, height: 10},
        hotspot: {x: 5, y: 5}
    });
    poiType_0.styles["none"] = new PoiViewer.PoiStyle({
        icon: Hafas.Config.gImagePath+"img/map/stop_point.png",
        minZoom: 0,
        size: {width: 0, height: 0},
        hotspot: {x: 0, y: 0}
    });
    poiType_0.minZoom = 915728640;
    gStationsApp.poiViewer.addPoiType(poiType_0);
    gStationsApp.poiViewer.update();
};

// Funktion von hfsGui.tp ueberschreiben
hfsGui.tp.setLocationAs = function(name, id, target)
{
    var stationTripId = "A=1@O=" + name + "@L=" + id;
    var url = Hafas.Config.gUrlTravelPlanner + Hafas.Config.gCatenateLayout;
    if (target == "from")
    {
        url += "REQ0JourneyStopsS0G=" + name + "&REQ0JourneyStopsS0ID=" + stationTripId + "&";
    }
    else
    {
        url += "REQ0JourneyStopsZ0G=" + name + "&REQ0JourneyStopsZ0ID=" + stationTripId + "&";
    }
    url += "start=1&";
    window.location.href = url;
};

Map_fullmap_InitFunctions.push(gStationsApp.initStationsApp);


