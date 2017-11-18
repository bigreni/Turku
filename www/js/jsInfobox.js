

var jsInfobox = {};
var jsInfoboxCount = 0;

function infotextstation(location, map)
{
    /*jsInfobox[jsInfoboxCount] = {data: location, map: map};
    jsInfoboxCount++;
    return "<div class='simpleInfoboxContent'><strong>" + location.name + "</strong></div>";*/

    var ib = new StationInfobox(map, location);
    return ib.content;
}

function infotextmap(geo, map)
{
    jsInfobox[jsInfoboxCount] = {data: geo, map: map};
    var tpl = jQuery("#jsTpl_InfoboxWait").html();
    var html = Mark.up(tpl, {infoboxId: jsInfoboxCount, geo: geo});
    jsInfoboxCount++;
    
    new GeoLocater(geo, map.map.getResolution(), function(location, dist, data) {
        jsInfobox[jsInfoboxCount] = {data: location, map: map};
        var tpl = jQuery("#jsTpl_InfoboxMapTp").html();
        var html = Mark.up(tpl, {infoboxId: jsInfoboxCount, location: location});
        jsInfoboxCount++;
        map.showInfoboxGeo(new CCoord({ lat:location.y, lon:location.x }), html);
    });
    
    
    return html;
    
    
}

var JsInfobox = {
    closeInfobox: function(id)
    {
        jsInfobox[id].map.hideAllInfoBoxes();
    }
};


hfsGui.infoboxes = {
    currentInfoboxes: {},
    count: 0
};

function AbstractInfobox(name)
{
    this.name = name;
    this.map = null;
    this.content = "";
    this.coord = null;

    this._init = function()
    {
        this.id = hfsGui.infoboxes.count++;
        this.get = "hfsGui.infoboxes.currentInfoboxes["+this.id+"]";
        hfsGui.infoboxes.currentInfoboxes[this.id] = this;
    };

    this._addToMap = function()
    {
        this.map.showInfoboxGeo(this.coord, this.content);
    };

    this.show = function()
    {
        this._addToMap();
    };

    this.hide = function()
    {
        this.map.hideAllInfoBoxes();
    };
};


function StationInfobox(map, station)
{
    this._init();
    this.map = map;
    this.station = station;
    this.coord = new CCoord({lat: station.y, lon: station.x});
    this.content = Mark.up(jQuery("#jsTpl_StationInfobox").html(), {infobox: this, location: station});
};

StationInfobox.prototype = new AbstractInfobox("StationInfobox");

StationInfobox.goToTab_info = function(infobox) {
    jQuery("#StationInfoboxContent_nextBus_"+infobox.id).hide();
    jQuery("#StationInfoboxContent_info_"+infobox.id).show();
    jQuery("#StationInfobox_tab_info_"+infobox.id).addClass("active");
    jQuery("#StationInfobox_tab_nextBus_"+infobox.id).removeClass("active");
};
StationInfobox.goToTab_nextBus = function(infobox) {
    jQuery("#StationInfoboxContent_nextBus_"+infobox.id).show();
    jQuery("#StationInfoboxContent_info_"+infobox.id).hide();
    jQuery("#StationInfobox_tab_nextBus_"+infobox.id).addClass("active");
    jQuery("#StationInfobox_tab_info_"+infobox.id).removeClass("active");
    jQuery("#StationInfobox_nextBusList_"+infobox.id).html("<div class='smallWait'> </div>");
    hfsGui.sqQuery.getNextDeparturesAsJSON(infobox.station.id, function(data) {
        var list = [];
        for (var i = 0; i < data.journeys.length && i < 5; i++)
            list.push(data.journeys[i]);
        var html = Mark.up(jQuery("#jsTpl_nextBusList").html(), {journeyList: list});
        jQuery("#StationInfobox_nextBusList_"+infobox.id).html(html);
    }, infobox.station.mainStopId);
};





