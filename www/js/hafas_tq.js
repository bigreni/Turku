

hfsGui.tq = {
    currentQueryData: null,
    currentLineData: null,
    currentRealGraph: null,
    map: null,
    selectedStation:null,
    searchLine: function(lineNumber, trainParam, date, section)
    {
        var url = Hafas.Config.gUrlHelp + Hafas.Config.gCatenateLayout;
        url += "tpl=lineInfo&";
        url += "lineNumber=" + lineNumber + "&";
        url += "trainParam=" + trainParam + "&";
        url += "date=" + date + "&";
        url += "guiVer="+Hafas.GuiVersion+"&";
        if(section != null)
        {
            url += "startStation="+section.start+"&";
            url += "endStation="+section.end+"&";
        }
        location.href = url;
    },
    init: function()
    {
        this.currentRealGraph = null;
        this.currentLineData = null;
        this._loadLineData();
        this._loadRealGraph();
        this._initMap();
    },
    _initMap: function()
    {
        var olMap = new HafasOpenLayersMap("tqResultMap", {
            id: "tqMap",
            language: Hafas.Config.gLanguage,
            coord: new CCoord({lat: 0, lon: 0}),
            zoom: 1015808
        });
        olMap.show();
        this.map = olMap;
    },
    _loadLineData: function()
    {
        var url = Hafas.Config.gUrlTrainInfoJSON + this.currentQueryData.trainParam + "?date=" + this.currentQueryData.date + Hafas.Config.gCatenateLayout;

        jQuery.ajax({
            url: url
        }).done(function(res) {
            this.currentLineData = res;

            this._createSectionData();
            this._renderLineBoard();
            this._drawLineInMap();
            this.scrollToResultOnMobile();
        }.bind(this));

    },
    _loadRealGraph: function()
    {
        var url = Hafas.Config.gUrlTravelPlannerJSON + "y?" + Hafas.Config.gCatenateLayout;
        url += "look_nv=type|realgraph|&";
        url += "look_trainid="+this.currentQueryData.trainParam+"&";
        url += "performLocating=512&";
        url += "tpl=rg2json&";

        jQuery.ajax({
            url: url
        }).done(function(res) {
            this.currentRealGraph = res.rgpoints;
            this._drawLineInMap();
        }.bind(this));
    },
    _createSectionData: function()
    {
        var type = "out";
        for(var i = 0; i < this.currentLineData.stationList.length; i++)
        {
            var station = this.currentLineData.stationList[i];
            station.sectionType = type;
            if(this.currentQueryData.section == null)
                continue;
            if(this.currentQueryData.section.start == station.location.id)
            {
                station.sectionType = "enter";
                type = "in";
            }
            if(this.currentQueryData.section.end == station.location.id)
            {
                station.sectionType = "leave";
                type = "out";
            }
        }
    },
    _renderLineBoard: function()
    {
        var html = Mark.up(jQuery("#jsTpl_LineInfoBoard").html(), this.currentLineData);
        jQuery("#tqResultBoard").html(html);

        var titleHtml = Mark.up(jQuery("#jsTpl_LineInfoTitle").html(), this.currentLineData);
        jQuery("#lineInfo_lineName").html(titleHtml);
    },
    _drawLineInMap: function()
    {
        if((this.currentRealGraph == null) || (this.currentLineData == null))
            return;
        var polyCoords = [];
        for (var i = 0; i < this.currentRealGraph.length; i++)
        {
            var coord = new CCoord({lat: this.currentRealGraph[i].y, lon: this.currentRealGraph[i].x});
            polyCoords.push(coord);
        }

        var polyParam = {
            type: "polyline",
            coords: polyCoords,
            width: 3,
            color: "000"
        };

        var polyLine = this.map.createContent(polyParam);
        this.map.showContent(polyLine);

        for (var i = 0; i < this.currentLineData.stationList.length; i++)
        {
            this._drawStopInMap(this.currentLineData.stationList[i]);
        }

        this.map.centerToCoords(polyCoords);
    },
    _drawStopInMap: function(station)
    {
        var clickAtStop = function() {
            hfsGui.tq._showInfobox(this);
        }.bind(station);

        if ((station.index != 0) && (station.index != this.currentLineData.stationList.length - 1))
        {
            var markerParam = {
                type: 'location',
                imageurl: Hafas.Config.gImagePath + 'map/dot.png',
                imageheight: 12,
                imagewidth: 12,
                hotspot: {x: 6, y: 6},
                text: Hafas.tools.decodeHTML(station.location.name),
                coord: new CCoord({lon: station.location.x, lat: station.location.y}),
                onclick:clickAtStop
            };
        }
        else
        {
            var markerParam = {
                type: 'location',
                imageurl: Hafas.Config.gImagePath + 'map/marker.png',
                imageheight: 32,
                imagewidth: 20,
                hotspot: {x: 10, y: 32},
                text: Hafas.tools.decodeHTML(station.location.name),
                coord: new CCoord({lon: station.location.x, lat: station.location.y}),
                onclick:clickAtStop
            };
        }
        var marker = this.map.createContent(markerParam);
        this.map.showContent(marker);
        this.map.centerToContent(marker);
    },
    _showInfobox: function(station)
    {
        var ib = new StationInfobox(this.map, station.location);
        ib.show();
    },
    scrollToResultOnMobile: function()
    {
       if(Hafas.tools.isInMobileMode())
           Hafas.tools.scrollTo("tqResultAchor");
    }

};


