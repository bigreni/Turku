
var PoiViewer = {VERSION: 1.1};

PoiViewer.PoiStyle = function(option)
{
    this.init = function(option)
    {
        this.icon = option.icon;
        this.size = option.size;
        this.hotspot = option.hotspot;
        this.minZoom = option.minZoom;
    };

    this.getIcon = function()
    {
        return this.icon;
    };

    this.getSize = function()
    {
        return this.size;
    };

    this.getHotspot = function()
    {
        return this.hotspot;
    };

    if (typeof option != "undefined")
        this.init(option);
};

PoiViewer.PoiType = function(name, url, inputId)
{
    this.name = name;
    this.url = url;
    this.inputId = inputId;
    this.useClustering = false;
    this.clusterStyle = null;

    this.init = function()
    {
        this.isActive = false;
        this.styles = [];
        this.minZoom = 99999999;
        this.markerDict = {};
        this.clusterDict = {};
    };

    this.addStyle = function(poiStyle)
    {
        if (poiStyle.minZoom < this.minZoom)
            this.minZoom = poiStyle.minZoom;
        this.styles.push(poiStyle);
    };

    this.renderData = function(data)
    {
        return data;
    };

    this.getKey = function(poi)
    {
        return poi.extId;
    };

    this.getClusterKey = function(cluster)
    {
        return cluster.coord.x + "_" + cluster.coord.y;
    };

    this.setDisabled = function(state)
    {
        var input = document.getElementById(this.inputId);
        input.disabled = state;
        if (state)
            input.parentNode.style.opacity = 0.6;
        else
            input.parentNode.style.opacity = 1;
    };

    this.isPoiShown = function(poi)
    {
        var key = this.getKey(poi);
        if (typeof this.markerDict[key] == "undefined")
            return false;
        else
            return true;
    };

    this.isClusterShown = function(cluster)
    {
        return typeof this.clusterDict[this.getClusterKey(cluster)] != "undefined";
    };

    this.addMarker = function(marker, poi)
    {
        this.markerDict[this.getKey(poi)] = marker;
    };

    this.addCluster = function(marker, cluster)
    {
        this.clusterDict[this.getClusterKey(cluster)] = marker;
    };

    this.removeMarker = function(poi)
    {
        delete this.markerDict[this.getKey(poi)];
    };

    this.updateState = function()
    {
        this.isActive = document.getElementById(this.inputId).checked;
    };

    this.onclick = function(poi)
    {

    };

    this.getUrl = function()
    {
        return this.url;
    };

    this.getStyle = function(poi)
    {
        return this.styles[0];
    };

    this.htmlEntityDecode = function(s)
    {
        var div = document.createElement("div");
        div.innerHTML = s;
        return div.innerHTML;
    };

    this.onShow = function()
    {

    };

    this.sort = function(poiList)
    {
        return poiList;
    };

    this.init();
};

PoiViewer.viewer = function(map, myNameSpace)
{
    this.map = map;
    this.poiDict = {};
    this.poiList = [];
    this.poiData = {};
    this.currentBoundingBox = null;
    this.currentBBParam = "";
    this.curZoom = null;
    this.isShown = true;
    this.clusterer = new PoiViewer.Clusterer(map, 60);
    this.myNameSpace = myNameSpace;

    this.addPoiType = function(poiType)
    {
        this.poiDict[poiType.name] = poiType;
        this.poiList.push(poiType);
        poiType.setDisabled(this.curZoom >= poiType.minZoom);
    };

    this.show = function()
    {
        this.isShown = true;
        this.update();
    };

    this.hide = function()
    {
        this.isShown = false;
        this.removeAllMarkers();
    };

    this.onChange = function()
    {
        this.update();
    };

    this.update = function()
    {
        if (!this.isShown)
        {
            return;
        }
        this.clusterer = new PoiViewer.Clusterer(this.map, 60);
        this.poiData = {};
        this.createBoundingBox();
        var zoom = this.map.getZoom();
        if (zoom != this.curZoom)
            var zoomChange = true;
        else
            var zoomChange = false;

        this.curZoom = zoom;
        for (var i = 0; i < this.poiList.length; i++)
        {
            var poiType = this.poiList[i];
            if (this.curZoom < poiType.minZoom && poiType.isActive)
            {
                this.loadData(poiType);
            }
            else
            {
                this.removeMarkersFor(poiType);
                this.removeClusterMarkersFor(poiType);
            }
            if (zoomChange)
                poiType.setDisabled(this.curZoom >= poiType.minZoom);
        }

    };

    this.loadData = function(poiType)
    {
        var url = poiType.getUrl();
        jQuery.ajax({
            dataType: "json",
            url: url + this.currentBBParam,
            success: function(rdata) {
                this.viewer.onDataResponse(this.poiType, this.poiType.renderData(rdata));
            }.bind({viewer: this, poiType: poiType}),
            error: function()
            {
                console.log("Error beim anzeigen der Pois!");
            }
        });
    };

    this.onDataResponse = function(poiType, data)
    {
        if (this.curZoom >= poiType.minZoom || !poiType.isActive)
            return;
        this.joinData(poiType, data);
        if (poiType.useClustering)
            this.drawClusteredData(poiType);
        else
            this.drawData(poiType);
    };

    this.joinData = function(poiType, data)
    {
        if (typeof this.poiData[poiType.name] == "undefined")
        {
            this.poiData[poiType.name] = data;
            poiType.loadedData = {};
            for (var i = 0; i < data.pois.length; i++)
            {
                poiType.loadedData[poiType.getKey(data.pois[i])] = true;
            }
        }
        else
        {
            for (var i = 0; i < data.pois.length; i++)
            {
                var key = poiType.getKey(data.pois[i]);
                if (typeof poiType.loadedData[key] == "undefined")
                    this.poiData[poiType.name].pois.push(data.pois[i]);
            }
        }
    };

    this.drawData = function(poiType)
    {
        var data = this.poiData[poiType.name];
        poiType.sort(data.pois);
        // gererate Keys
        var newPoiDict = {};
        for (var i = 0; i < data.pois.length; i++)
        {
            newPoiDict[poiType.getKey(data.pois[i])] = true;
        }

        // delete old Marker
        for (var key in poiType.markerDict)
        {
            if (typeof newPoiDict[key] == "undefined")
            {
                var marker = poiType.markerDict[key];
                this.map.hideContent(marker, true);
                this.map.removeContent(marker, true);
                delete poiType.markerDict[key];
            }
        }

        for (var i = 0; i < data.pois.length; i++)
        {
            var poi = data.pois[i];
            if (poiType.isPoiShown(poi))
                continue;
            var poiStyle = poiType.getStyle(poi);
            if (poiStyle == null)
                continue;
            var marker = this.createMarker(poiStyle, poi, poiType);
            poiType.addMarker(marker, poi);
        }
        poiType.onShow();
    };

    this.drawClusteredData = function(poiType)
    {
        // Cluster Data
        var clusterList = (new PoiViewer.Clusterer(this.map, 60)).createClusterFromList(this.poiData[poiType.name].pois);

        // gererate Keys
        var newClusterDict = {};
        var newPoiDict = {};
        for (var i = 0; i < clusterList.length; i++)
        {
            var poiCluster = clusterList[i];
            if (poiCluster.size == 1)
            {
                newPoiDict[poiType.getKey(poiCluster.contents[0])] = true;
            }
            else if (poiCluster.size > 1)
            {
                newClusterDict[poiType.getClusterKey(poiCluster)] = true;
            }
        }

        // delete old Marker
        for (var key in poiType.markerDict)
        {
            if (typeof newPoiDict[key] == "undefined")
            {
                var marker = poiType.markerDict[key];
                this.map.hideContent(marker, true);
                this.map.removeContent(marker, true);
                delete poiType.markerDict[key];
            }
        }

        // delete old Cluster
        for (var key in poiType.clusterDict)
        {
            if (typeof newClusterDict[key] == "undefined")
            {
                var marker = poiType.clusterDict[key];
                this.map.hideContent(marker, true);
                this.map.removeContent(marker, true);
                delete poiType.clusterDict[key];
            }
        }

        // Add new merkrs and clusters
        for (var i = 0; i < clusterList.length; i++)
        {
            var poiCluster = clusterList[i];
            if (poiCluster.size == 1) // Einzel Marker
            {
                var poi = poiCluster.contents[0];
                if (poiType.isPoiShown(poi))
                    continue;
                var poiStyle = poiType.getStyle(poi);
                if (poiStyle == null)
                    continue;
                var marker = this.createMarker(poiStyle, poi, poiType);
                poiType.addMarker(marker, poi);
            }
            else if (poiCluster.size > 1) // Cluster
            {
                if (poiType.isClusterShown(poiCluster))
                    continue;
                var marker = this.createClusterMarker(poiCluster, poiType);
                poiType.addCluster(marker, poiCluster);
            }
        }
        poiType.onShow();
    };

    this.createMarker = function(poiStyle, poi, poiType)
    {
        var size = poiStyle.getSize();
        var markerParam = {
            type: "location",
            coord: poi.coord,
            imageurl: poiStyle.getIcon(),
            imagewidth: size.width,
            imageheight: size.height,
            hotspot: poiStyle.getHotspot(),
            text: poi.text,
            onclick: function() {
                poiType.onclick(poi);
            }
        };
        var marker = this.map.createContent(markerParam, true);
        this.map.showContent(marker, true);
        return marker;
    };

    this.createClusterMarker = function(cluster, poiType)
    {
        var poiStyle = poiType.clusterStyle;
        if (cluster.size > poiStyle.option.maxClusterSize)
            var size = "X";
        else
            var size = cluster.size;
        var poiSize = poiStyle.getSize();
        var markerParam = {
            type: "location",
            coord: new CCoord({lat: parseInt(cluster.coord.y), lon: parseInt(cluster.coord.x)}),
            imageurl: poiStyle.getIcon().replace("[SIZE]", size),
            imagewidth: poiSize.width,
            imageheight: poiSize.height,
            hotspot: poiStyle.getHotspot(),
            text: cluster.size + " " + poiType.clusterName,
            onclick: function() {
                this.showClusterInfobox(cluster, poiType);
            }.bind(this)
        };
        var marker = this.map.createContent(markerParam, true);
        this.map.showContent(marker, true);
        return marker;
    };

    this.showClusterInfobox = function(cluster, poiType)
    {
        var content = document.createElement("div");
        content.className = "clusterInfoboxContent";
        for (var i = 0; i < cluster.size; i++)
        {
            var a = document.createElement("a");
            a.className = "clusterItem arrowlink";
            a.innerHTML = cluster.contents[i].name;
            var div = document.createElement("div");
            div.className = "clusterRow";
            a.setAttribute("onclick", this.myNameSpace + ".poiViewer.showPoiPopup('" + poiType.name + "', '" + poiType.getKey(cluster.contents[i]) + "')");
            div.appendChild(a);
            content.appendChild(div);
        }
        this.map.showInfoboxGeo(new CCoord({lat: cluster.coord.y, lon: cluster.coord.x}),
        poiType.clusterName, content.outerHTML);
    };

    this.showPoiPopup = function(poiName, poiKey)
    {
        var poiType = this.poiDict[poiName];
        for (var i = 0; i < this.poiData[poiName].pois.length; i++)
        {
            var tmppoi = this.poiData[poiName].pois[i];
            if (poiType.getKey(tmppoi) == poiKey)
            {
                var poi = tmppoi;
                break;
            }
        }
        poiType.onclick(poi);
    };

    this.removeAllMarkers = function()
    {
        for (var i = 0; i < this.poiList.length; i++)
        {
            this.removeMarkersFor(this.poiList[i]);
            this.removeClusterMarkersFor(this.poiList[i]);
        }
    };

    this.removeMarkersFor = function(poiType)
    {
        for (var key in poiType.markerDict)
        {
            this.map.hideContent(poiType.markerDict[key], true);
            this.map.removeContent(poiType.markerDict[key], true);
        }
        poiType.markerDict = {};
    };

    this.removeClusterMarkersFor = function(poiType)
    {
        for (var key in poiType.clusterDict)
        {
            var marker = poiType.clusterDict[key];
            this.map.hideContent(marker, true);
            this.map.removeContent(marker, true);
        }
        poiType.clusterDict = {};
    };

    this.createBoundingBox = function()
    {
        var bb = this.map.getBoundingBox();
        this.currentBoundingBox = {ne: new CCoord({lat: bb.ne.getLat(), lon: bb.ne.getLon()}), sw: new CCoord({lat: bb.sw.getLat(), lon: bb.sw.getLon()})};
        var param = "&look_maxx=" + this.currentBoundingBox.ne.getLon()
                + "&look_maxy=" + this.currentBoundingBox.ne.getLat()
                + "&look_minx=" + this.currentBoundingBox.sw.getLon()
                + "&look_miny=" + this.currentBoundingBox.sw.getLat();
        this.currentBBParam = param;
    };

    this.onUpdateState = function(poiTypeName)
    {
        var poiType = this.poiDict[poiTypeName];
        poiType.updateState();
        if (this.curZoom < poiType.minZoom && poiType.isActive)
        {
            this.loadData(poiType);
        }
        else
        {
            this.removeMarkersFor(poiType);
            this.removeClusterMarkersFor(poiType);
        }
    };

    this.redraw = function()
    {
        this.removeAllMarkers();
        this.update();
    };

    this.getPoisAt = function(geo)
    {
        var mouseXY = this.map.geo2scr(geo);
        var resultList = [];
        for (var i = 0; i < this.poiList.length; i++)
        {
            var poiType = this.poiList[i];
            if ((!poiType.isActive) || (typeof this.poiData[poiType.name] == "undefined"))
                continue;
            var poiStyle = poiType.getStyle(null);
            if(poiStyle == null)
                continue;
            var width = poiStyle.size.width;
            var height = poiStyle.size.height;
            var top = mouseXY.y - poiStyle.hotspot.y + height;
            var left = mouseXY.x - poiStyle.hotspot.x;
            var bottom = top + height;
            var right = left + width;
            var tl = this.map.scr2geo({x: left, y: top});
            var br = this.map.scr2geo({x: right, y: bottom});

            var poiList = this.poiData[poiType.name].pois;
            for (var j = 0; j < poiList.length; j++)
            {
                var poi = poiList[j];
                if (!poiType.isPoiShown(poi))
                    continue;

                if (poi.coord.lat < tl.lat)
                    if (poi.coord.lon > tl.lon)
                        if (poi.coord.lat > br.lat)
                            if (poi.coord.lon < br.lon)
                                resultList.push({poi: poi, poiType: poiType});
            }
        }
        return resultList;
    };

    this.map.setOnChange(this.onChange.bind(this));
    this.createBoundingBox();
    this.curZoom = this.map.getZoom();
};

PoiViewer.Clusterer = function(map, size)
{
    this.cluster = {};
    this.clusterList = [];
    this.map = map;

    this.createClusterFromList = function(markerList)
    {
        var nullPix = map.geo2scr(new CCoord({lat: 0, lon: 0}));
        var normalShift = {x: nullPix.x % size, y: nullPix.y % size};

        for (var i = 0; i < markerList.length; i++)
        {
            var marker = markerList[i];
            var pix = map.geo2scr(new CCoord({lat: marker.y, lon: marker.x}));

            var clxy = parseInt((pix.x - normalShift.x) / size) + "X" + parseInt((pix.y - normalShift.y) / size);
            if (typeof this.cluster[clxy] == "undefined")
            {
                this.cluster[clxy] = {size: 1, contents: [marker], key: clxy};
                this.clusterList.push(this.cluster[clxy]);
            }
            else
            {
                this.cluster[clxy].size++;
                this.cluster[clxy].contents.push(marker);
            }
        }
        for (var i = 0; i < this.clusterList.length; i++)
        {
            var cluster = this.clusterList[i];
            var x = 0;
            var y = 0;
            for (var j = 0; j < cluster.size; j++)
            {
                x += parseInt(cluster.contents[j].x);
                y += parseInt(cluster.contents[j].y);
            }
            cluster.coord = {x: x / cluster.size, y: y / cluster.size};
        }
        return this.clusterList;
    };
};

