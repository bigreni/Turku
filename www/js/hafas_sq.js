
hfsGui.sqQuery = {
    search: function() {
        var tripId = jQuery('#sqLocationInputID').val();
        if (tripId == "")
        {
            if (SimpleLocSuggest.Instances.sqLocationInput.currData.length > 0)
            {
                tripId = SimpleLocSuggest.Instances.sqLocationInput.currData[0].id;
            }
            else
            {
                SimpleLocSuggest.Instances.sqLocationInput.loadSuggestForInput();
                return;
            }
        }
        var stationName = encodeURIComponent(Hafas.tools.getDataFromTripelId(tripId, "O"));
        var evaId = Hafas.tools.getDataFromTripelId(tripId, "L");
        var date = jQuery("#sqDateInput").val();
        this.searchFor(stationName, evaId, date);
    },
    searchFor: function(stationName, evaId, date)
    {
        var url = Hafas.Config.gHelp_path + "/3" + Hafas.Config.gLanguage + "n?" + Hafas.Config.gCatenateLayout;
        url += "tpl=stationInfo&";
        if (date != null)
            url += "date=" + date;
        url += "&OK#" + encodeURI(stationName) + "|" + evaId;
        location.href = url;
    },
    getNextDeparturesAsJSON: function(stationId, callback, mainStopId)
    {
        var url = Hafas.Config.gBaseUrl + Hafas.Config.gStboard_path + "/3" + Hafas.Config.gLanguage + "ny?" + Hafas.Config.gCatenateLayout;
        var data = {
//            ignoreMasts: 1,
            input: stationId,
            start: "1",
            tpl: "stationboardResult2json",
            maxJourneys: 10
        };

//        if (typeof mainStopId == "undefined")
//            data.disableEquivs = "yes";

        jQuery.ajax({
            url: url,
            data: data
        }).done(function(res) {
            callback(res);
        });
    },
    toggleInputsOnMobile: function()
    {
        if (jQuery("#SQInputLeft").hasClass("closedOnMobile"))
            jQuery("#SQInputLeft").removeClass("closedOnMobile");
        else
            jQuery("#SQInputLeft").addClass("closedOnMobile");
    }
};

hfsGui.sqResult = {
    currentResult: null,
    currentResultData: null,
    currentLines: null,
    planDataPeriod: null,
    map: null,
    currentQueryData: null,
    currentStopsNear: null,
    currentLineFilter: "all",
    isScrolled: false,
    changeDateTimeout: null,
    init: function()
    {
        this.currentLineFilter = "all";
        var hashArr = decodeURI(location.hash).split("|");
        this.currentQueryData.stationName = decodeURI(hashArr[0].replace("#", ""));
        this.currentQueryData.stationId = hashArr[1];
        jQuery("#stationBoard_stationName").html(this.currentQueryData.stationName);
        jQuery("#sqLocationInput").val(this.currentQueryData.stationName);
        jQuery("#sqLocationInputID").val("A=1@O=" + this.currentQueryData.stationName + "@L=" + this.currentQueryData.stationId);
        this._checkForEquivStations();
    },
    _checkForEquivStations: function()
    {
        var url = Hafas.Config.gUrlTravelPlannerJSON + "y?tpl=stopnr2json&extId=" + parseInt(this.currentQueryData.stationId) + "&performLocating=512&look_nv=type|equivalents|extId|" + this.currentQueryData.stationId + "|uic|80|extended|1&";

        jQuery.ajax({
            url: url
        }).done(function(data) {
            this.currentQueryData.x = parseInt(data.station.x);
            this.currentQueryData.y = parseInt(data.station.y);
            this.currentQueryData.stationName = data.station.name;

            this._loadStationsNear();
            this._initMap();

            if (data.eqivStations.length <= 1)
            {
                jQuery("#sqResultEquivStationsHint").hide();
                jQuery("#sqResultEquivStations").hide();
                jQuery("#sqResultBoardContainer").show();
                jQuery("#sqResultLineListContainer").show();
                this._loadBoard();
                this._loadLineInfos();
            }
            else if ((data.eqivStations.length < 5) || (data.station.ismain != "yes"))
            {
                jQuery("#sqResultEquivStationsHint").hide();
                jQuery("#sqResultEquivStations").show();
                jQuery("#sqResultBoardContainer").show();
                jQuery("#sqResultLineListContainer").show();
                this._showEquivStationList(data.eqivStations, data.metaStation, data.station);
                this._loadBoard();
                this._loadLineInfos();
            }
            else
            {
                jQuery("#sqResultEquivStationsHint").show();
                jQuery("#sqResultEquivStations").show();
                jQuery("#sqResultBoardContainer").hide();
                jQuery("#sqResultLineListContainer").hide();
                this._showEquivStationList(data.eqivStations, data.metaStation, data.station);
                this.scrollToEquivStopsOnMobile();
            }
        }.bind(this));
    },
    _showEquivStationList: function(stationList, metaStation, currentStation)
    {
        stationList.sort(function(a, b) {
            if (a.name.length == b.name.length)
                return a.name.localeCompare(b.name);
            else
                return a.name.length - b.name.length;
        });

        for (var i = 0; i < stationList.length; i++)
            if (parseInt(stationList[i].extId) == parseInt(hfsGui.sqResult.currentQueryData.stationId))
                stationList[i].isCurrent = true;
            else
                stationList[i].isCurrent = false;

        var html = Mark.up(jQuery("#jsTplStationBoardEquivStationsList").html(), {equivStations: stationList, metaStation: metaStation, isMetaSelected: currentStation.ismain});
        jQuery("#sqEquivStations").html(html);
    },
    /* ########################### Map ################ */
    _initMap: function()
    {
        var olMap = new HafasOpenLayersMap("sqResultMap", {
            id: "sqMap",
            language: Hafas.Config.gLanguage,
            coord: new CCoord({lat: 0, lon: 0}),
            zoom: 1015808
        });
        olMap.show();
        this.map = olMap;

        var markerParam = {
            type: 'location',
            imageurl: Hafas.Config.gImagePath + 'map/marker.png',
            imageheight: 32,
            imagewidth: 20,
            hotspot: {x: 10, y: 32},
            text: this.currentQueryData.stationName,
            coord: new CCoord({lon: this.currentQueryData.x, lat: this.currentQueryData.y})
        };
        var marker = olMap.createContent(markerParam);
        olMap.showContent(marker);
        olMap.centerToContent(marker);
        olMap.setZoom(5, "api");
    },
    /* ########################### Board ################ */
    _loadBoard: function()
    {
        this.currentResult = null;
        this.currentResultData = null;
        this.currentLines = null;
        this.currentStopsNear = null;
        this.isScrolled = false;

        var url = Hafas.Config.gBaseUrl + Hafas.Config.gStboard_path + "/3" + Hafas.Config.gLanguage + "ny?" + Hafas.Config.gCatenateLayout;

        var data = {
            dateBegin: this.currentQueryData.date,
            dateEnd: this.currentQueryData.date,
//            disableEquivs: "yes",
//            ignoreMasts: 1,
            input: this.currentQueryData.stationId,
            selectDate: "period",
            start: "1",
            timeSlots: 1,
            boardType: "dep",
            tpl: "stationboardResult2json"
        };

        jQuery("#sqResultTable").html("<div class='wait'> </div>");

        jQuery.ajax({
            url: url,
            data: data
        }).done(function(res) {
            this.currentResult = res;
            this._renderBoard();
            this._renderLineFilter();
        }.bind(this));
    },
    _renderBoard: function()
    {
        try {
            var hArray = [];
            for (var i = 0; i < 25; i++)
            {
                hArray.push({hour: i, journeyList: []});
            }
            for (var i = 0; i < this.currentResult.journeys.length; i++)
            {
                var journey = this.currentResult.journeys[i];
                if (!this._checkLine(journey))
                    continue;
                var h = parseInt(journey.time.split(":")[0], 10);
                hArray[h].journeyList.push(journey);
            }
            var html = Mark.up(jQuery("#jsTplStationBoardTable").html(), {hours: hArray});
            jQuery("#sqResultTable").html(html);
            this.currentResultData = hArray;
            this.scrollToResultOnMobile();
        }
        catch (e)
        {
            jQuery("#sqResultTable").html("js error");
        }
    },
    /* ########################### Linien ################ */
    _loadLineInfos: function()
    {
        var url = Hafas.Config.gBaseUrl + Hafas.Config.gStboard_path + "/3" + Hafas.Config.gLanguage + "ny?" + Hafas.Config.gCatenateLayout;

        var data = {
            disableEquivs: "yes",
            ignoreMasts: 1,
            input: this.currentQueryData.stationId,
            performTransferSearch: 1,
            start: 1,
            tpl: "transfers2json",
            dateBegin: this.planDataPeriod.begin,
            dateEnd: this.planDataPeriod.end
        };
        jQuery.ajax({
            url: url,
            data: data
        }).done(function(res) {
            this.currentLines = res.lines;
            this.currentLines.sort(function(a, b) {
                return Hafas.tools.LineNumberSorter(
                        a.name.split(" ").pop(),
                        b.name.split(" ").pop());
            });
            this._renderLineList();

        }.bind(this));
    },
    _renderLineList: function()
    {
        var html = Mark.up(jQuery("#jsTplStationBoardLineList").html(), {lineList: this.currentLines});
        jQuery("#sqResultLinieList").html(html);
    },
    _renderLineFilter: function()
    {
        var linesOfDayDict = {};
        var linesOfDayList = [];
        var selectedLineFound = false;

        for (var i = 0; i < this.currentResult.journeys.length; i++)
        {
            var journey = this.currentResult.journeys[i];
            var lineNumber = journey.line.name.split(" ").pop();
            if (linesOfDayDict[lineNumber] == undefined)
            {
                linesOfDayDict[lineNumber] = true;
                if (lineNumber == this.currentLineFilter)
                {
                    linesOfDayList.push({lineNumber: lineNumber, selected: true});
                    selectedLineFound = true;
                }
                else
                    linesOfDayList.push({lineNumber: lineNumber, selected: false});
            }
        }

        linesOfDayList.sort(function(a, b) {
            return Hafas.tools.LineNumberSorter(a.lineNumber, b.lineNumber);
        });

        if (!selectedLineFound)
            this.currentLineFilter = "all";

        var html = Mark.up(jQuery("#jsTplStationBoardLineFilter").html(), {lineList: linesOfDayList, selectAll: !selectedLineFound});
        jQuery("#sqLineFilter").html(html);
    },
    /* ########################### Board-Filter ################ */
    changeDate: function(date)
    {
        this.currentQueryData.date = date;
        if (this.changeDateTimeout != null)
            clearTimeout(this.changeDateTimeout);

        this.changeDateTimeout = setTimeout(function() {
            this._loadBoard();
            this.changeDateTimeout = null;
        }.bind(this), 1000);

    },
    changeLineFilter: function()
    {
        var nodeList = document.getElementsByName("sqLineFilter");
        var filter = "all";
        for (var i = 0; i < nodeList.length; i++)
        {
            if (nodeList[i].checked)
            {
                filter = nodeList[i].value;
                break;
            }
        }
        this.currentLineFilter = filter;
        this.isScrolled = false;
        this._renderBoard();
    },
    _checkLine: function(journey)
    {
        if (this.currentLineFilter == "all")
            return true;
        var lineNumber = journey.line.name.split(" ").pop();
        if (this.currentLineFilter == lineNumber)
            return true;
        return false;
    },
    /* ########################### Stations Near ################ */
    _loadStationsNear: function()
    {
        var url = Hafas.Config.gUrlTravelPlannerJSON + "y?" + Hafas.Config.gCatenateLayout;

        var data = {
            performLocating: 2,
            look_x: this.currentQueryData.x,
            look_y: this.currentQueryData.y,
            look_maxno: 15,
            look_stopclass: 1,
            look_nv: "combinemode|3|",
            tpl: "stop2json"
        };
        jQuery.ajax({
            url: url,
            data: data
        }).done(function(res) {
            this.currentStopsNear = res.stops;
            this._renderStopsNear();
            this.scrollToResultOnMobile();

        }.bind(this));
    },
    _renderStopsNear: function()
    {
        var stopList = [];
        for (var i = 0; i < this.currentStopsNear.length; i++)
            if (parseInt(this.currentStopsNear[i].extId, 10) != parseInt(this.currentQueryData.stationId, 10))
                stopList.push(this.currentStopsNear[i]);
        var html = Mark.up(jQuery("#jsTplStationBoardStationNearList").html(), {stopList: stopList});
        jQuery("#sqNearByStationsList").html(html);
    },
    /* ########################### Links ################ */
    searchAtTravelplanner: function(target)
    {
        var name = Hafas.tools.decodeHTML(this.currentQueryData.stationName);
        var id = "A=1@O=" +
                name +
                "@X=" + this.currentQueryData.x +
                "@Y=" + this.currentQueryData.y +
                "@L=" + this.currentQueryData.stationId;
        hfsGui.tp.setLocationAs(name, id, target);
    },
    searchAtStBoard: function(stationName, stationId)
    {
        if (stationId == this.currentQueryData.stationId)
            return;
        this.currentQueryData.stationName = stationName;
        this.currentQueryData.stationId = stationId;
        this.currentQueryData.x = null;
        this.currentQueryData.y = null;

        jQuery("#sqResultMap").html("");
        jQuery("#stationBoard_stationName").html(stationName);

        jQuery("#sqResultLinieList").html("<div class='wait'> </div>");
        jQuery("#sqNearByStationsList").html("<div class='wait'> </div>");

        //this.init();
        location.hash = encodeURI(stationName) + "|" + stationId;
    },
    /* ################### mobile functions ################## */

    openRow: function(button)
    {
        var holder = jQuery(button.parentNode);
        holder.addClass("open");
    },
    closeRow: function(button)
    {
        var holder = jQuery(button.parentNode);
        holder.removeClass("open");
    },
    scrollToResultOnMobile: function()
    {
        if ((this.currentResultData == null) || (this.currentLines == null) || (this.currentStopsNear == null) || this.isScrolled)
            return; // Ergebnis noch nicht vollständig geladen.
        this.isScrolled = true;
        if (Hafas.tools.isInMobileMode())
        {
            setTimeout(function() {
                var now = new Date();
                var h = now.getHours();
                var index = -1;
                for (var i = 0; i < this.currentResultData.length; i++)
                {
                    if (this.currentResultData[i].journeyList.length == 0)
                        continue;
                    if (i >= h)
                    {
                        index = i;
                        break;
                    }
                }
                if (index == -1)
                    Hafas.tools.scrollTo("sqResultBoardAchor");
                else
                {
                    Hafas.tools.scrollTo("openRowButton_" + index, -30);
                    setTimeout(function() {
                        hfsGui.sqResult.openRow(eId("openRowButton_" + this.index));
                    }.bind({index: index}), 500);

                }
            }.bind(this), 100);
        }
    },
    scrollToEquivStopsOnMobile: function()
    {
        if (this.isScrolled)
            return;
        this.isScrolled = true;
        if (Hafas.tools.isInMobileMode())
        {
            Hafas.tools.scrollTo("sqResultEquivStationsAchor");
        }
    },
    hideAllLines: function()
    {
        jQuery("#sqResultLinieList .hiddenList").slideUp();
        jQuery("#sqResultLinieList .showAllButton").show();
    },
    showAllLines: function()
    {
        jQuery("#sqResultLinieList .hiddenList").slideDown();
        jQuery("#sqResultLinieList .showAllButton").hide();
    },
    hideAllStationsNear: function()
    {
        jQuery("#sqNearByStationsList .hiddenList").slideUp();
        jQuery("#sqNearByStationsList .showAllButton").show();
    },
    showAllStationsNear: function()
    {
        jQuery("#sqNearByStationsList .hiddenList").slideDown();
        jQuery("#sqNearByStationsList .showAllButton").hide();
    }
};






