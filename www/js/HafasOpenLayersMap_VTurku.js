
OpenLayers.ImgPath = Hafas.Config.gImagePath + "map/openlayers/";

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
        this.handler.pixelTolerance = 15;
    }
});


// Werte aus http://epsg.io/3877
//    Proj4js.defs["EPSG:2393"] = "+proj=tmerc +lat_0=0 +lon_0=27 +k=1 +x_0=3500000 +y_0=0 +ellps=intl +towgs84=-96.0617,-82.4278,-121.7535,4.80107,0.34543,-1.37646,1.4964 +units=m +no_defs";
Proj4js.defs["EPSG:3877"] = "+proj=tmerc +lat_0=0 +lon_0=23 +k=1 +x_0=23500000 +y_0=0 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs";
Proj4js.defs["EPSG:4326"] = "+proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs";
var gProj4GeoProj = new Proj4js.Proj('EPSG:4326');
//    var gProj4OLProj = new Proj4js.Proj('EPSG:2393');
var gProj4OLProj = new Proj4js.Proj('EPSG:3877');

function HafasOpenLayersMap(mapDivName, params)
{
    // #################################### Attribute ##############################################

    this.mapParams = params;
    this.localurl = Hafas.Config.gImagePath + "map/OpenLayersMap/";
    this.mapDiv = document.getElementById(mapDivName);
    this.mapDivName = mapDivName;
    this.content = {};
    this.activeTimeout = null;
    this.contcount = 0;
    this.fullscreen = false;
    this.leftClickInfobox = null;

    // #################################### oeffentliche Funktionen ################################

    this.show = function() { // neu
        this.w = (typeof this.mapParams.width != 'undefined' ? this.mapParams.width : this.mapDiv.clientWidth);
        this.wStyle = (typeof this.mapDiv.style.width != "undefined") ? this.mapDiv.style.width : null;
        this.h = (typeof this.mapParams.height != 'undefined' ? this.mapParams.height : this.mapDiv.clientHeight);
        this.gMRCValue = 20037508.34;

        var osm_param = {
//                projection: "EPSG:2393",
            projection: "EPSG:3877",
            controls: this.createStandardControls(this.h, this.w),
//                maxExtent: new OpenLayers.Bounds(3195286.87, 6687911.41, 3293060.13, 6762170.96),
            maxExtent: new OpenLayers.Bounds(19734149.31, 4410859.98, 23686511.87, 9376833.67),
            theme: null,
            resolutions: [95.48169921874978, 47.74084960937489, 23.870424804687445, 11.935212402343723, 5.967606201171861, 2.9838031005859307, 1.4919015502929653, 0.7459507751464827],
            zoom: this.mapParams.zoom
        };

        if (typeof this.mapParams.restrictedExtent != 'undefined')
            osm_params.restrictedExtent = this.mapParams.restrictedExtent;

        if (typeof this.mapParams.fullscreenContainer != 'undefined')
            this.fullscreenContainer = this.mapParams.fullscreenContainer;

        this.map = new OpenLayers.Map(this.mapDivName, osm_param);
        this.events = this.mapParams.events || [];
        this.layer = this.mapParams.layer || [];

        for (var k = 0; k < this.layer.length; k++) {
            if (typeof this.layer[k].isBaseLayer != "undefined" && this.layer[k].isBaseLayer) {
                this.addTileLayer(this.layer[k]);
            }
        }

        var turku_wms = new OpenLayers.Layer.WMS("Test-Turku",
                "https://opaskartta.turku.fi/TeklaOGCWeb/WMS.ashx",
                {
//                    layers: "Opaskartta",
                    layers: "Opaskartta,Opaskartta_bussipysakit",
                    transparent: true
                }
        );
        turku_wms.setIsBaseLayer(true);
        this.map.addLayers([turku_wms, this.createStandardVectorLayer(), this.createStandardMarkerLayer()]);
        this.afterShowMapStandardBehaviour();
        this.centerToGeo(this.mapParams.coord);
        this.setZoom(this.mapParams.zoom, "api");

        Hafas.registerEvents(this.events, this);

        // Initialisiere andere Layer
        for (var k = 0; k < this.layer.length; k++) {
            if (typeof this.layer[k].isBaseLayer == "undefined" || !this.layer[k].isBaseLayer) {
                this.addTileLayer(this.layer[k]);
            }
        }

        Hafas.ps.pub("/map/show", [this]);
        Hafas.ps.pub("/map/show/" + this.mapParams.id, [this]);
        return;
    };

    this.createStandardControls = function(h, w) // neu
    {
        if (this.mapParams.mode == "print")
            return [];

        if (this.mapParams.mode == "mobile")
            return [new OpenLayers.Control.TouchNavigation({dragPanOptions: {enableKinetic: true}}), new OpenLayers.Control.Navigation()];

        return [new OpenLayers.Control.PanZoomBar(), new OpenLayers.Control.Navigation()];
    };

    this.createStandardVectorLayer = function() {
        this.vector_layer_style = OpenLayers.Util.extend({}, OpenLayers.Feature.Vector.style['default']);
        this.vector_layer_style.fillOpacity = 0.2;
        this.vector_layer_style.graphicOpacity = 1;
        this.vector_layer = new OpenLayers.Layer.Vector("graphical_content", this.vector_layer_style);
        return this.vector_layer;
    };

    this.createStandardMarkerLayer = function() {
        this.marker_layer = new OpenLayers.Layer.Vector("markers", {
            styleMap: new OpenLayers.StyleMap(this.labelstyle),
            rendererOptions: {zIndexing: true}
        });
        return this.marker_layer;
    };

    this.afterShowMapStandardBehaviour = function() { // copy von AOpenLayers (std40)
        this.map.setCenter(this.CCoord2LonLat(this.mapParams.coord), this.AjaxMap2OpenLayerZoom(this.mapParams.zoom));

        this.selectFeature = new OpenLayers.Control.SelectFeature([this.vector_layer, this.marker_layer], {
            hover: true,
            callbacks: {
                "click": function(feature) {
                    if (typeof feature.onSelect == "function") {
                        feature.onSelect();
                    }
                }
            }
        });

        // add select feature
        this.map.addControl(this.selectFeature);
        this.selectFeature.handlers.feature.stopDown = false;

        this.selectFeature.activate();

        // Events
        if (this.mapParams.mode != 'print')
        {
            this.map.events.register('click', this.map, this.cbClick.bind(this));
            this.map.events.register('mousedown', this.map, this.cbMouseDown.bind(this));
            this.map.events.register('mousemove', this.map, this.cbMouseMove.bind(this));
            this.map.events.register('mouseup', this.map, this.cbMouseUp.bind(this));
            this.map.events.register('zoomend', this.map, this.cbChange.bind(this));
            this.map.events.register('moveend', this.map, this.cbChange.bind(this));
        }
        // General Values
        this.ol_tooltipsize = new OpenLayers.Size(100, 20);
        this.ol_infoboxsize = new OpenLayers.Size(268, 200);
        this.infobox_visible = false;
        this.currentcontentpar = null;
        this.mousedownevent = null;
        this.ol_ib_icon = {size: new OpenLayers.Size(0, 0), offset: new OpenLayers.Pixel(0, 0)};

        this.map.addControl(new OpenLayers.Control.Attribution());
    };

    this.getURLParams = function() // copy von PTV
    {
        var par =
                "&REQMapWidth=" + this.mapDiv.clientWidth +
                "&REQMapHeight=" + this.mapDiv.clientHeight +
                "&REQMapCenterX=" + this.getCenter().getLon() +
                "&REQMapCenterY=" + this.getCenter().getLat() +
                "&REQMapScaling=" + this.getZoom();
        var r = 0;
        for (var c = this.contcount; c > 0; c--) {
            var p = this.content[c.toString()];
            if (typeof p != 'undefined') {
                if (p.show) {
                    if (p.type == 'polyline' || p.type == 'route') {
                        par += "&REQMapRoute" + r + ".DisplayMode=POLYGON";
                        par += "&REQMapRoute" + r + ".Color=" + this.getColorFFFFFF(p.color);
                        par += "&REQMapRoute" + r + ".LineWidth=" + p.width;
                        for (var l = 0; l < p.coords.length; l++) {
                            par += "&REQMapRoute" + r + ".Location" + l + ".X=" + p.coords[l].getLon();
                            par += "&REQMapRoute" + r + ".Location" + l + ".Y=" + p.coords[l].getLat();
                            if (l == 0 || l == p.coords.length - 1)
                                par += "&REQMapRoute" + r + ".Location" + l + ".Marker=TRANSPARENT";
                        }
                        r++;
                    }
                    else if (p.type == 'location') {
                        par += "&REQMapRoute" + r + ".DisplayMode=LOCATIONS";
                        par += "&REQMapRoute" + r + ".Location0.X=" + p.coord.getLon();
                        par += "&REQMapRoute" + r + ".Location0.Y=" + p.coord.getLat();
                        //            par+="&REQMapRoute"+r+".Location0.Name="+p.text;
                        var imageptv = p.imageurl.substring(p.imageurl.lastIndexOf("/") + 1, p.imageurl.lastIndexOf(".")).toUpperCase();
                        par += "&REQMapRoute" + r + ".Location0.Marker=" + imageptv;
                        r++;
                    }
                }
            }
        }
        return par;
    };

    this.setMouseWheelZoom = function()
    {
        this.map.setAllowMouseWheelZoom(false);
    }

    this.setDoubleClickZoom = function(boolval) // copy von PTV
    {
        this.map.setAllowDoubleClickZoom(boolval);
    }

    this.setAllowedZoomLevels = function(bool) {
        if (bool) {
            this.vectorlayer.onMouseMove = this.drawMouseMove;
        } else {
            this.vectorlayer.onMouseMove = this.normalMouseMove;
        }
    }

    this.addTileLayer = function(desc, l) {
        if (typeof desc.id == 'undefined')
            desc.id = 'MyTileLayer' + l.toString();
        if (typeof desc.name == 'undefined')
            desc.name = desc.id;
        if (typeof desc.url == 'undefined')
            return;
        if (typeof desc.urlsubpath == 'undefined')
            desc.urlsubpath = '';
        if (typeof desc.type == 'undefined')
            desc.type = 'static';
        if (typeof desc.opacity == 'undefined')
            desc.opacity = 1.0;
        if (typeof desc.name == 'undefined')
            desc.name = desc.id;
        //ngr 07.02.13 Text�nderung ** if(typeof desc.attribution=='undefined') desc.attribution='Data CC-By-SA by <a href="http://openstreetmap.org/">OpenStreetMap</a>';
        if (typeof desc.attribution == 'undefined') {
            //desc.attribution='Geodaten &copy; <a href="http://www.openstreetmap.org/">OpenStreetMap</a> und Mitwirkende, <a href="http://www.opendatacommons.org/licenses/odbl/">ODbL</a>';
            desc.attribution = '';
        }


        var get_my_url = function(bounds) {
            var res = this.map.getResolution();
            var x = Math.round((bounds.left - this.maxExtent.left) / (res * this.tileSize.w));
            var y = Math.round((this.maxExtent.top - bounds.top) / (res * this.tileSize.h));
            var z = this.map.getZoom();
            var url = desc.url;
            if (desc.type == 'static')
                url += desc.urlsubpath + "/" + z + "/" + x + "/" + y + ".png";
            else
                url += "z=" + z + "&x=" + x + "&y=" + y;
            if (typeof desc.onGetTile == 'function')
                desc.onGetTile(x, y, z);
            return url;
        };
        var isBaseLayer = (typeof desc.isBaseLayer != 'undefined') ? desc.isBaseLayer : false;
        var layer = new OpenLayers.Layer.TMS(desc.name,
                desc.url,
                {'type': 'png', attribution: desc.attribution, isBaseLayer: isBaseLayer, 'getURL': get_my_url});

        layer.setOpacity(desc.opacity);
        this.map.addLayer(layer);
        this.map.raiseLayer(layer, -2);
        return layer;
    };


    this.removeTileLayer = function(name)
    {
        if (typeof name == "string") {
            if (typeof this.map.getLayersByName(name)[0] == 'undefined' || this.map.getLayersByName(name)[0] == null)
                return;
            this.map.removeLayer(this.map.getLayersByName(name)[0]);
        } else {
            this.map.removeLayer(name);
        }
        Hafas.ps.pub("/map/layerremoved", this);
    };

    this.updateSize = function() { // OK
        if ((typeof this.map != 'undefined') && this.map != null)
            this.map.updateSize();
    };

    this.setOnChange = function(listener) { // OK
        if (typeof this.mapParams.onchange == 'undefined')
            this.mapParams.onchange = new Array;
        this.mapParams.onchange[this.mapParams.onchange.length] = listener;
    };

    this.setOnZoom = function(listener) { // OK
        if (typeof this.mapParams.onzoom == 'undefined')
            this.mapParams.onzoom = new Array;
        this.mapParams.onzoom[this.mapParams.onzoom.length] = listener;
    };

    this.getBoundingBox = function() { //OK
        var bb = this.map.getExtent();
        return {
            sw: this.LonLat2CCoord({lon: bb.left, lat: bb.bottom}),
            ne: this.LonLat2CCoord({lon: bb.right, lat: bb.top})
        };
    };

    this.setBoundingBox = function(bb) {
        var sw = this.CCoord2LonLat(bb.sw);
        var ne = this.CCoord2LonLat(bb.ne);
        this.map.zoomToExtent(new OpenLayers.Bounds(sw.lon, sw.lat, ne.lon, ne.lat));
    };

    this.isPointInBoundingBox = function(point) {
        var currentBB = this.getBoundingBox();
        if ((point.getLon() > currentBB.sw.getLon()) && (point.getLon() < currentBB.ne.getLon()) && (point.getLat() > currentBB.sw.getLat()) && (point.getLat() < currentBB.ne.getLat())) {
            return true;
        } else {
            return false;
        }
    };

    this.showInfoboxGeo = function(geo, infobox) {
        var ol_lonlat = this.CCoord2LonLat(geo);
        if (typeof infobox != "string") {
            infobox.create(geo, this._addInfobox.bind(this));
        } else {
            this._addInfobox(geo, infobox);
        }
    };

    this._addInfobox = function(coord, content)
    {
        var ol_lonlat = this.CCoord2LonLat(coord);
        var infobox_popup = new OpenLayers.Popup.FramedCloud("infobox_popup", ol_lonlat, this.ol_infoboxsize, content, this.ol_ib_icon, true,
                function() {
                    this.ajaxmap.infobox_visible = false;
                    this.map.removePopup(this);
                });

        if (this.infobox_visible)
            this.map.removePopup(this.currentInfobox);

        infobox_popup.closeOnMove = false;
        infobox_popup.keepInMap = true;
        infobox_popup.panMapIfOutOfView = true;
        infobox_popup.ajaxmap = this;
        infobox_popup.autoSize = true;
        this.map.addPopup(infobox_popup);
        infobox_popup.updateSize();
        this.infobox_visible = true;
        this.currentcontentpar = null;
        this.currentInfobox = infobox_popup;
        if ((typeof params != "undefined") && (typeof params.oninfocontentshow == "function")) {
            params.oninfocontentshow(infobox_popup);
        }
    };

    this.hasInfobox = function() {
        if (this.map.popups.length == 0)
            return false;
        return true;
    };

    this.isCoordVisible = function(c) // OK
    {
        var latlon = this.CCoord2LonLat(c);
        return this.map.getExtent().containsLonLat(latlon);
    };

    this.getCenter = function() { // OK
        return this.LonLat2CCoord(this.map.getCenter());
    };


    this.getZoom = function(mode) { // OK
        if (typeof mode != 'undefined' && mode == 'api')
            return this.map.getZoom();
        else
            return this.OpenLayer2AjaxMapZoom(this.map.getZoom());
    }

    this.setZoom = function(zoom, mode) {
        if (typeof mode == "undefined") {
            this.map.zoomTo(this.AjaxMap2OpenLayerZoom(zoom));
        } else if (mode == "api") {
            this.map.zoomTo(zoom);
        }
    }

    this.centerToGeo = function(coord) { // OK
        this.map.setCenter(this.CCoord2LonLat(coord));
    }

    this.centerToContent = function(content) { // copen von AOpenLayers (std40)
        if (typeof content == 'undefined')
            return;
        if (content == null)
            return;
        var par = this.content[content];
        switch (par.type) {
            case "circle":
            case "point":
                break;
            case "location":
                this.map.setCenter(this.CCoord2LonLat(par.coord));
                break;
            case "polyline":
                if (typeof par.ol_bounds == 'undefined') {
                    par.ol_bounds = par.ol_geometry.getBounds();
                }
                this.map.zoomToExtent(par.ol_bounds);
                break;
            case "polygon":
            case "route":
        }
    };
    this.centerToCoords = function(coordList)
    {
        if (coordList.length == 0)
            return;
        var left = coordList[0].getLon();
        var right = coordList[0].getLon();
        var top = coordList[0].getLat();
        var bottom = coordList[0].getLat();
        for (var i = 0; i < coordList.length; i++)
        {

            var coord = coordList[i];
            if (coord.getLon() < left)
                left = coord.getLon();
            if (coord.getLon() > right)
                right = coord.getLon();
            if (coord.getLat() > top)
                top = coord.getLat();
            if (coord.getLat() < bottom)
                bottom = coord.getLat();
        }
        var lb = this.CCoord2LonLat(new CCoord({lat: bottom, lon: left}));
        var rt = this.CCoord2LonLat(new CCoord({lat: top, lon: right}));
        var bb = new OpenLayers.Bounds(lb.lon, lb.lat, rt.lon, rt.lat);
        this.map.zoomToExtent(bb);
    };
    this.CCoord2LonLat = function(coord) {
        var p = new Proj4js.Point(coord.getLon() / 1000000, coord.getLat() / 1000000);
        Proj4js.transform(gProj4GeoProj, gProj4OLProj, p)
        return new OpenLayers.LonLat(p.x, p.y);
    };
    this.LonLat2CCoord = function(lonlat) {
        var p = new Proj4js.Point(lonlat.lon, lonlat.lat);
        Proj4js.transform(gProj4OLProj, gProj4GeoProj, p);
        return new CCoord({lat: Math.round(1000000 * p.y), lon: Math.round(1000000 * p.x)});
    }
    this.AjaxMap2OpenLayerZoom = function(aZoom) {
        if (typeof aZoom == 'undefined')
            return 1;
        var maxpix = Math.max(this.mapDiv.clientWidth, this.mapDiv.clientHeight);
        return Math.max(0, Math.min(17, 19 - Math.round(Math.log(aZoom / (maxpix * 0.2)) / Math.log(2))));
    }
    this.OpenLayer2AjaxMapZoom = function(aOpenLayerZoom) {
        if (typeof aOpenLayerZoom == 'undefined') {
            return 10000;
        }
        var maxpix = Math.max(this.mapDiv.clientWidth, this.mapDiv.clientHeight);
        return Math.round(Math.exp((19 - aOpenLayerZoom) * Math.log(2)) * (maxpix * 0.2));
    }
    this.hideContent = function(content) { // OK
        if (typeof content == 'undefined')
            return;
        if (content == null)
            return;
        var p = this.content[content];
        if (typeof p == 'undefined')
            return;
        p.show = false;
        switch (p.type) {
            case 'location':
                this.hideLocation(p);
                break;
            case 'point':
            case 'circle':
                this.hideContent(p._poly);
                break;
            case 'route':
            case 'polyline':
                this.hidePolyline(p);
                break;
            case 'polygon':
            case 'container':
                if (typeof p.vectorlayer.removeElement != 'undefined')
                    p.vectorlayer.removeElement(p.cc);
                else
                    p.vectorlayer.hideElement(p.cc);
                delete p.content;
                break;
        }
        Hafas.ps.pub("/map/hidecontent", this);
    }

    this.removeContent = function(content) { // OK
        if (typeof content == 'undefined')
            return;
        if (content == null)
            return;
        var p = this.content[content];
        if (typeof p == 'undefined')
            return;
        switch (p.type) {
            case 'location':
            case 'route':
            case 'polyline':
            case 'polygon':
            case 'container':
                break;
            case 'circle':
            case 'point':
                this.removeContent(p._poly);
                break;
        }
        if (p.draggable) {
            for (var j = 0; j < this.draggables.length; j++) {
                if (this.draggables[j].cc == content) {
                    // delete in draggable array
                    delete this.draggables[j];
                    this.draggables = this.draggables.compact();
                }
            }
        }
        this.content[content] = null;
        delete this.content[content];
        Hafas.ps.pub("/map/removecontent", this);
    }


    this.hideAllInfoBoxes = function() { // copy von COpenLayer (rmv)
        if (this.currentInfobox != null) {
            this.removePopUp(this.currentInfobox);
        }
    }

    this.removePopUp = function(popup) {
        this.map.removePopup(popup);
    }

    this.updatePopUp = function(popup, content) {
        popup.updateSize();
    }

    // #################################### private Funktionen ####################################

    this.cbonViewChange = function() {
        this.activeTimeout = null;
        if (typeof this.mapParams.onchange != 'undefined')
            for (var i = 0; i < this.mapParams.onchange.length; i++) {
                this.mapParams.onchange[i]();
            }
    }
    this.scr2geo = function(s) {
        return this.LonLat2CCoord(this.map.getLonLatFromPixel(s));
    }
    this.geo2scr = function(g) {
        return this.map.getPixelFromLonLat(this.CCoord2LonLat(g));
    }
    this.CCoord2olPoint = function(coord) {
        var olll = this.CCoord2LonLat(coord);
        return new OpenLayers.Geometry.Point(olll.lon, olll.lat);
        ;
    }
    this.cbChange = function(evt) {
        window.clearTimeout(this.activeTimeout);
        this.activeTimeout = window.setTimeout(this.cbonViewChange.bind(this), 500);
        Hafas.ps.pub("/map/change", [this, evt]);
        Hafas.ps.pub("/map/change/" + this.mapParams.id, [this, evt]);
        OpenLayers.Event.stop(evt);
    }
    this.cbMouseDown = function(evt) {
        Hafas.ps.pub("/map/mousedown", [this, evt]);
        OpenLayers.Event.stop(evt);
    }
    this.cbMouseMove = function(evt) {
        Hafas.ps.pub("/map/mousemove", [this, evt]);
        OpenLayers.Event.stop(evt);
    }
    this.cbMouseUp = function(evt) {
        Hafas.ps.pub("/map/mouseup", [this, evt]);
        OpenLayers.Event.stop(evt);
    }
    this.cbClick = function(evt) {
        if (!this.activeTimeout) {
            this.cbLeftClick(evt);
        }
        Hafas.ps.pub("/map/leftclick", [this, evt]);
        OpenLayers.Event.stop(evt);
    }
    this.cbLeftClick = function(evt) {
        var geo = this.scr2geo(evt.xy);
        if (typeof this.mapParams.onclick != 'undefined') {
            this.mapParams.onclick(geo);
        }
        if (typeof this.mapParams.onLeftInfoClick != 'undefined') {
            this.showInfoboxGeo(geo, this.mapParams.onLeftInfoClick(geo, this));
        }
    }
    this.cbRightClick = function(evt) {

    }


    this.createLocation = function(par) {
        par.ajaxmap = this;
        if (typeof par.layername == 'undefined') {
            par.layername = 'vector';
        }
        par.vectorlayer = this.map.getLayer(par.layername);

        var style_mark = OpenLayers.Util.extend({}, OpenLayers.Feature.Vector.style['default']);
        style_mark.graphicWidth = par.imagewidth;
        style_mark.graphicHeight = par.imageheight;
        style_mark.fillOpacity = 1;
        if (typeof par.priority != "undefined") {
            style_mark.graphicZIndex = par.priority;
        } else {
            style_mark.graphicZIndex = 10;
        }

        if (typeof par.hotspot != 'undefined')
        {
            style_mark.graphicXOffset = -par.hotspot.x;
            style_mark.graphicYOffset = -par.hotspot.y;
        }
        style_mark.externalGraphic = par.imageurl;
        if (typeof par.text != 'undefined')
            style_mark.graphicTitle = decodeURI(par.text);

        var ol_lonlat = this.CCoord2LonLat(par.coord);
        var point = new OpenLayers.Geometry.Point(ol_lonlat.lon, ol_lonlat.lat);
        var pointFeature = new OpenLayers.Feature.Vector(point, null, style_mark);
        par.feature = pointFeature;
    };

    this.showLocation = function(par) {
        if (typeof par.infotitle != 'undefined')
        {
            //Handler
            par.feature.onSelect = function()
            {
                this.hafasMap.showInfoboxGeo(par.coord, this.par.infocontent);
            }.bind({hafasMap: this, par: par});
        }
        if (typeof par.onclick == 'function')
        {
            par.feature.onSelect = function()
            {
                this.par.onclick(null);
            }.bind({par: par});
        }
        this.marker_layer.addFeatures([par.feature]);
    };

    this.hideLocation = function(par) {
        if (typeof  par.feature != 'undefined') {
            this.marker_layer.removeFeatures([par.feature]);
        }
    };

    this.createPolylineStyles = function(par) {
        if (typeof par.color == 'undefined')
            par.color = "0000ff";
        if (typeof par.opacity == 'undefined')
            par.opacity = 1;
        if (typeof par.width == 'undefined')
            par.width = 4;
        var style = OpenLayers.Util.extend({}, this.vector_layer_style);
        style.strokeColor = "#" + par.color;
        style.strokeOpacity = par.opacity;
        style.strokeWidth = par.width;
        return [style];
    };
    this.createPolyline = function(par) {
        par.ol_styles = this.createPolylineStyles(par);
        par.ol_ll = [];
        if (typeof par.coords != 'undefined') {
            for (var i = 0; i < par.coords.length; i++) {
                if (typeof par.coords[i] != "undefined") {
                    par.ol_ll.push(this.CCoord2olPoint(par.coords[ i ]));
                }
            }
        }
        par.ol_geometry = new OpenLayers.Geometry.LineString(par.ol_ll);
        par.ol_features = [];
        for (var i = 0; i < par.ol_styles.length; ++i) {
            par.ol_features.push(new OpenLayers.Feature.Vector(new OpenLayers.Geometry.LineString(par.ol_ll), null, par.ol_styles[ i ]));
        }
    };
    this.showPolyline = function(par) {
        this.vector_layer.addFeatures(par.ol_features);
    };
    this.hidePolyline = function(par) {
        this.vector_layer.removeFeatures(par.ol_features);
    };
}




// #################################### statische Funktionen ###################################



// #################################### Veraerbung ##########################################

HafasOpenLayersMap.prototype = new AjaxMap();



