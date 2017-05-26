
hfsGui.tp = {
    inputMap: null,
    currentResult: null,
    currentResultMaps: {},
    currentOverlayMarker: {
        startMarker: null,
        destMarker: null,
        startMarkerData: null,
        destMarkerData: null
    },
    state: {
        inputMapShown: false,
        shownDetails: {},
        advancedDetailsShown: false,
        firstConnectionLoaded: false,
        lastConnectionLoaded: false,
        activeDateTimeInput: false
    },
    localStoragePrefix: "turku",
    initInputMap: function(target)
    {
        this.inputMap = Hafas.Maps.Instances.tp_query_input;
        this.state.inputMapShown = true;
        this.inputMap.updateSize();
        this.inputMap.setZoom(2, "api");

        var startLocation = this._getStartLocation();
        if(startLocation != null)
            this.setStartMarkerToOverlayMap(startLocation, target == "start");

        var destLocation = this._getDestLocation();
        if(destLocation != null)
            this.setDestMarkerToOverlayMap(destLocation, target == "dest");
    },
    _getStartLocation: function()
    {
        var tripId = jQuery("#TPInputLeftStartID").val();
        var x = Hafas.tools.getDataFromTripelId(tripId, "X");
        var y = Hafas.tools.getDataFromTripelId(tripId, "Y");
        var id = Hafas.tools.getDataFromTripelId(tripId, "L");
        var name = Hafas.tools.getDataFromTripelId(tripId, "O");
        var type = parseInt(Hafas.tools.getDataFromTripelId(tripId, "A"));
        if (x == null || y == null || name == null)
            return null;
        else
            return {x: x, y: y, name: name, type: type, id: id};
    },
    _getDestLocation: function()
    {
        var tripId = jQuery("#TPInputLeftDestID").val();
        var x = Hafas.tools.getDataFromTripelId(tripId, "X");
        var y = Hafas.tools.getDataFromTripelId(tripId, "Y");
        var id = Hafas.tools.getDataFromTripelId(tripId, "L");
        var name = Hafas.tools.getDataFromTripelId(tripId, "O");
        var type = parseInt(Hafas.tools.getDataFromTripelId(tripId, "A"));
        if (x == null || y == null || name == null)
            return null;
        else
            return {x: x, y: y, name: name, type: type, id: id};
    },
    toggleInputsOnMobile: function()
    {
        if (jQuery("#TPInputLeft").hasClass("closedOnMobile"))
            jQuery("#TPInputLeft").removeClass("closedOnMobile");
        else
            jQuery("#TPInputLeft").addClass("closedOnMobile");
    },
    showInputsOnMobile: function()
    {
        jQuery("#TPInputLeft").removeClass("closedOnMobile");
    },
    scrollToInputOnMobile: function()
    {
        if (Hafas.tools.isInMobileMode())
            Hafas.tools.scrollTo("tpInputAchor");
    },
    scrollToMapOnTablet: function()
    {
        if (Hafas.tools.isInTabletMode())
            Hafas.tools.scrollTo("MapDiv_tp_query_input_anchor");
    },
    // Wird in input/input_content_tpForm.tpl genutzt
    setInputIfEmpty: function(name, type, extId, x, y, target)
    {
        if(target == "from")
        {
            var input = jQuery("#TPInputLeftStart");
            var idInput = jQuery("#TPInputLeftStartID");
        }
        else
        {
            var input = jQuery("#TPInputLeftDest");
            var idInput = jQuery("#TPInputLeftDestID");
        }

        if(input.val().trim() != "")
            return;

        var tripId = "A="+type+"@O="+name+"@L="+extId+"@X="+x+"@Y="+y;
        input.val(name);
        idInput.val(tripId);
    },
    /*
     * Fuer Infobox
     */
    setInputLocation: function(location, dir)
    {
        if (dir == "dep")
        {
            jQuery("#TPInputLeftStart").val(location.name);
            jQuery("#TPInputLeftStartID").val(location.tripId);
            this.setStartMarkerToOverlayMap(location, true);
        }
        else
        {
            jQuery("#TPInputLeftDest").val(location.name);
            jQuery("#TPInputLeftDestID").val(location.tripId);
            this.setDestMarkerToOverlayMap(location, true);
        }
        this._saveSearchOptions();
        this.showInputsOnMobile();
        this.scrollToInputOnMobile();
    },
    setLocationAs: function(name, id, target)
    {
        if (target == "from")
        {
            jQuery("#TPInputLeftStart").val(name);
            jQuery("#TPInputLeftStartID").val(id);
        }
        else
        {
            jQuery("#TPInputLeftDest").val(name);
            jQuery("#TPInputLeftDestID").val(id);
        }
        this._saveSearchOptions();
        this.showInputsOnMobile();
        this.scrollToInputOnMobile();
    },
    setStartMarkerToOverlayMap: function(location, zoomTo)
    {
        this.currentOverlayMarker.startMarkerData = location;
        if (this.inputMap == null)
            return;
        if (this.currentOverlayMarker.startMarker != null)
        {
            this.inputMap.hideContent(this.currentOverlayMarker.startMarker);
            this.inputMap.removeContent(this.currentOverlayMarker.startMarker);
        }
        var markerParam = {
            type: 'location',
            imageurl: Hafas.Config.gImagePath + 'map/startMarker.png',
            imageheight: 32,
            imagewidth: 20,
            hotspot: {x: 10, y: 32},
            text: location.name,
            coord: new CCoord({lon: location.x, lat: location.y})
        };
        this.currentOverlayMarker.startMarker = this.inputMap.createContent(markerParam);
        this.inputMap.showContent(this.currentOverlayMarker.startMarker);
        if (zoomTo)
            this.scrollMapToMarker(this.currentOverlayMarker.startMarker);
    },
    setDestMarkerToOverlayMap: function(location, zoomTo)
    {
        this.currentOverlayMarker.destMarkerData = location;
        if (this.inputMap == null)
            return;
        if (this.currentOverlayMarker.destMarker != null)
        {
            this.inputMap.hideContent(this.currentOverlayMarker.destMarker);
            this.inputMap.removeContent(this.currentOverlayMarker.destMarker);
        }

        var markerParam = {
            type: 'location',
            imageurl: Hafas.Config.gImagePath + 'map/destMarker.png',
            imageheight: 32,
            imagewidth: 20,
            hotspot: {x: 10, y: 32},
            text: location.name,
            coord: new CCoord({lon: location.x, lat: location.y})
        };

        this.currentOverlayMarker.destMarker = this.inputMap.createContent(markerParam);
        this.inputMap.showContent(this.currentOverlayMarker.destMarker);
        if (zoomTo)
            this.scrollMapToMarker(this.currentOverlayMarker.destMarker);
    },
    scrollMapToMarker: function(marker)
    {
        if (marker == null)
            return;
        this.inputMap.setZoom(5, "api");
        this.inputMap.centerToContent(marker);
    },
    openQueryPage: function(option)
    {
        var data = [];
        if (typeof option != "undefined")
            data.push(option);
        this._searchByData(data);
    },
    openResultPage: function()
    {
        var data = [];
        this._addStandardSearchParams(data);
        this._addDataFromShortInput(data);
        this._addDataFromDateTimeInput(data);
        this._addDataFromAdvancedInput(data);
        data.push({name: "start", value: "1"});
        this._searchByData(data);
    },
    openAdvancedOptions: function()
    {
        jQuery("#showAdvancedSearchModeBtn").hide();
        jQuery("#hideAdvancedSearchModeBtn").show();
        hfsGui.tp.state.advancedDetailsShown = true;
        jQuery("#TPInputLeft_AdvancedFormHolder").slideDown();
        this.resetAdvancedOptions();
    },
    hideAdvancedOptions: function()
    {
        jQuery("#advancedParameters").slideUp();
        jQuery("#showAdvancedSearchModeBtn").show();
        jQuery("#hideAdvancedSearchModeBtn").hide();
        hfsGui.tp.state.advancedDetailsShown = false;
        jQuery("#TPInputLeft_AdvancedFormHolder").slideUp();
    },
    _addDataFromShortInput: function(dataCollection)
    {
        var param = jQuery("#TPInputFormLeft").serializeArray();
        for (var i = 0; i < param.length; i++)
            dataCollection.push(param[i]);
        return dataCollection;
    },
    _addDataFromAdvancedInput: function(dataCollection)
    {
        if (this.state.advancedDetailsShown)
        {
            dataCollection.push({name: "advancedSearch", value: "yes"});
            dataCollection.push({name: "useAdvancedOptions", value: "yes"});

            var footWaySpeed = jQuery("#tpAdvFootSpeed").val();
            var footWayFromTo = jQuery("#tpAdvFootWayFromTo").val();
            if (footWayFromTo != "off")
            {
                dataCollection.push({name: "REQ0JourneyDep_Foot_enable", value: 1});
                dataCollection.push({name: "REQ0JourneyDest_Foot_enable", value: 1});
                dataCollection.push({name: "REQ0JourneyDep_Foot_minDist", value: 0});
                dataCollection.push({name: "REQ0JourneyDep_Foot_maxDist", value: footWayFromTo});
                dataCollection.push({name: "REQ0JourneyDep_Foot_speed", value: footWaySpeed});
                dataCollection.push({name: "REQ0JourneyDep_Foot_enable", value: 1});
                dataCollection.push({name: "REQ0JourneyDest_Foot_minDist", value: 0});
                dataCollection.push({name: "REQ0JourneyDest_Foot_maxDist", value: footWayFromTo});
                dataCollection.push({name: "REQ0JourneyDest_Foot_speed", value: footWaySpeed});
                dataCollection.push({name: "REQ0JourneyDest_Foot_enable", value: 1});
            }
            else
            {
                dataCollection.push({name: "REQ0JourneyDep_Foot_enable", value: 0});
                dataCollection.push({name: "REQ0JourneyDest_Foot_enable", value: 0});
            }
            var bikeWayFromTo = jQuery("#tpAdvBikeWayFromTo").val();
            if (bikeWayFromTo != "off")
            {
                dataCollection.push({name: "REQ0JourneyDep_Bike_enable", value: 1});
                dataCollection.push({name: "REQ0JourneyDep_Bike_minDist", value: 0});
                dataCollection.push({name: "REQ0JourneyDep_Bike_maxDist", value: bikeWayFromTo});
                dataCollection.push({name: "REQ0JourneyDest_Bike_enable", value: 1});
            }
            else
            {
                dataCollection.push({name: "REQ0JourneyDep_Bike_enable", value: 0});
                dataCollection.push({name: "REQ0JourneyDest_Bike_enable", value: 0});
            }
            dataCollection.push({name: "REQ0HafasNoOfChanges", value: jQuery("#tpAdvMaxChanges").val()});
            dataCollection.push({name: "REQ0HafasChangeTime", value: jQuery("#tpAdvChangesTime").val()});
        }
        return dataCollection;
    },
    _addDataFromDateTimeInput: function(dataCollection)
    {
        if (this.state.activeDateTimeInput)
        {
            var param = jQuery("#TPInputDateTimeFormLeft").serializeArray();
            for (var i = 0; i < param.length; i++)
                dataCollection.push(param[i]);
        }
        return dataCollection;
    },
    _searchByData: function(data)
    {
        var searchId = parseInt(Math.random() * 99999);
        this._saveQuery(data, searchId);
        data.push({name: "searchId", value: searchId});
        var form = jQuery("#TPQueryForm");
        var html = "";
        for (var i = 0; i < data.length; i++)
        {
            html += "<input type='hidden' name='" + data[i].name + "' value='" + data[i].value + "' />";
        }
        this._saveSearchOptions();
        form.html(html);
        form.submit();
    },
    _addStandardSearchParams: function(data)
    {
        data.push({name: "REQ0HafasSkipLongChanges", value: 1});
        data.push({name: "REQ0Total_Foot_enable", value: 1});
        if ((this.state.advancedDetailsShown) && (jQuery("#tpAdvBikeWayFromTo").val() == "off"))
            data.push({name: "REQ0Total_Bike_enable", value: 0});
        else
            data.push({name: "REQ0Total_Bike_enable", value: 1});
        data.push({name: "REQ0Total_Bike_maxDist", value: 50000});
        data.push({name: "REQ0Total_Bike_minDist", value: 0});
        data.push({name: "REQ0Total_Foot_maxDist", value: 10000});
        data.push({name: "REQ0Total_Foot_minDist", value: 0});
        data.push({name: "application", value: "PRIVATETRANSPORT"});
        if (this.state.advancedDetailsShown)
        {
            var footWaySpeed = jQuery("#tpAdvFootSpeed").val();
            data.push({name: "REQ0Total_Foot_speed", value: footWaySpeed});
        }
        else
        {
            data.push({name: "REQ0Total_Foot_speed", value: 100});
        }
        data.push({name: "existTotal_enable", value: "yes"});
    },
    _saveSearchOptions: function()
    {
        if (!Hafas.tools.hasSessionStorage)
            return;
        this.clearSearchOptions();
        sessionStorage.setItem(this.localStoragePrefix + "_tpFromName", jQuery("#TPInputLeftStart").val());
        sessionStorage.setItem(this.localStoragePrefix + "_tpFromId", jQuery("#TPInputLeftStartID").val());
        sessionStorage.setItem(this.localStoragePrefix + "_tpToName", jQuery("#TPInputLeftDest").val());
        sessionStorage.setItem(this.localStoragePrefix + "_tpToId", jQuery("#TPInputLeftDestID").val());
        if (this.state.activeDateTimeInput)
        {
            sessionStorage.setItem(this.localStoragePrefix + "_tpTime", jQuery("#tpInputTime").val());
            sessionStorage.setItem(this.localStoragePrefix + "_tpDate", jQuery("#inputDate_REQ0").val());
            if (jQuery("#tpInputDirDep").attr("checked"))
                sessionStorage.setItem(this.localStoragePrefix + "_tpDir", "dep");
            else
                sessionStorage.setItem(this.localStoragePrefix + "_tpDir", "arr");
            sessionStorage.setItem(this.localStoragePrefix + "_tpTimeIsSaved", 1);
        }

        if (this.state.advancedDetailsShown)
        {
            sessionStorage.setItem(this.localStoragePrefix + "_tpUseAdvacedSearch", "yes");
            sessionStorage.setItem(this.localStoragePrefix + "_tpFootWayFromTo", jQuery("#tpAdvFootWayFromTo").val());
            sessionStorage.setItem(this.localStoragePrefix + "_tpBikeWayFromTo", jQuery("#tpAdvBikeWayFromTo").val());
            sessionStorage.setItem(this.localStoragePrefix + "_tpFootSpeed", jQuery("#tpAdvFootSpeed").val());
            sessionStorage.setItem(this.localStoragePrefix + "_tpMaxChanges", jQuery("#tpAdvMaxChanges").val());
            sessionStorage.setItem(this.localStoragePrefix + "_tpChangesTime", jQuery("#tpAdvChangesTime").val());
        }
    },
    _saveQuery: function(data, id)
    {
        if (!Hafas.tools.hasSessionStorage)
            return;
        sessionStorage.setItem(this.localStoragePrefix + "_tpSearchId_" + id, JSON.stringify(data));
    },
    resetSearchOptions: function()
    {
        if (!Hafas.tools.hasSessionStorage)
            return;
        this.resetDateTimeOptions();
        if ((jQuery("#TPInputLeftStart").val() != "") || (jQuery("#TPInputLeftDest").val() != ""))
            return;
        jQuery("#TPInputLeftStart").val(sessionStorage.getItem(this.localStoragePrefix + "_tpFromName") || "");
        jQuery("#TPInputLeftStartID").val(sessionStorage.getItem(this.localStoragePrefix + "_tpFromId") || "");

        jQuery("#TPInputLeftDest").val(sessionStorage.getItem(this.localStoragePrefix + "_tpToName") || "");
        jQuery("#TPInputLeftDestID").val(sessionStorage.getItem(this.localStoragePrefix + "_tpToId") || "");
    },
    resetDateTimeOptions: function()
    {
        if (!Hafas.tools.hasSessionStorage)
            return;
        if (this.state.activeDateTimeInput)
        {
            if (sessionStorage.getItem(this.localStoragePrefix + "_tpTimeIsSaved") == "1")
            {
                jQuery("#tpInputTime").val(sessionStorage.getItem(this.localStoragePrefix + "_tpTime"));
                jQuery("#inputDate_REQ0").val(sessionStorage.getItem(this.localStoragePrefix + "_tpDate"));
                if (sessionStorage.getItem(this.localStoragePrefix + "_tpDir") == "arr")
                    jQuery("#tpInputDirArr").attr("checked", "checked");
                else
                    jQuery("#tpInputDirDep").attr("checked", "checked");
            }
            else
                this._setCurrentDateTimeToNow();
        }
    },
    resetAdvancedOptions: function()
    {
        if (!Hafas.tools.hasSessionStorage)
            return;
        if (sessionStorage.getItem(this.localStoragePrefix + "_tpUseAdvacedSearch") == "yes")
        {
            jQuery("#tpAdvFootWayFromTo").val(sessionStorage.getItem(this.localStoragePrefix + "_tpFootWayFromTo"));
            jQuery("#tpAdvBikeWayFromTo").val(sessionStorage.getItem(this.localStoragePrefix + "_tpBikeWayFromTo"));
            jQuery("#tpAdvFootSpeed").val(sessionStorage.getItem(this.localStoragePrefix + "_tpFootSpeed"));
            jQuery("#tpAdvMaxChanges").val(sessionStorage.getItem(this.localStoragePrefix + "_tpMaxChanges"));
            jQuery("#tpAdvChangesTime").val(sessionStorage.getItem(this.localStoragePrefix + "_tpChangesTime"));
        }
    },
    _setCurrentDateTimeToNow: function()
    {
        var dateTime = Hafas.tools.getCurrentDateTime();
        jQuery("#tpInputTime").val(dateTime.time);
        jQuery("#inputDate_REQ0").val(dateTime.date);
        jQuery("#tpInputDirDep").attr("checked", "checked");
    },
    clearSearchOptions: function()
    {
        if (!Hafas.tools.hasSessionStorage)
            return;

        sessionStorage.removeItem(this.localStoragePrefix + "_tpFromName");
        sessionStorage.removeItem(this.localStoragePrefix + "_tpFromId");
        sessionStorage.removeItem(this.localStoragePrefix + "_tpToName");
        sessionStorage.removeItem(this.localStoragePrefix + "_tpToId");
        sessionStorage.removeItem(this.localStoragePrefix + "_tpTimeIsSaved");
        sessionStorage.removeItem(this.localStoragePrefix + "_tpTime");
        sessionStorage.removeItem(this.localStoragePrefix + "_tpDate");
        sessionStorage.removeItem(this.localStoragePrefix + "_tpDir");
        sessionStorage.removeItem(this.localStoragePrefix + "_tpFootWayFromTo");
        sessionStorage.removeItem(this.localStoragePrefix + "_tpBikeWayFromTo");
        sessionStorage.removeItem(this.localStoragePrefix + "_tpFootSpeed");
        sessionStorage.removeItem(this.localStoragePrefix + "_tpMaxChanges");
        sessionStorage.removeItem(this.localStoragePrefix + "_tpChangesTime");
        sessionStorage.removeItem(this.localStoragePrefix + "_tpUseAdvacedSearch");
    },
    /* ############################ Result  ################################### */
    showDetails: function(connectionName)
    {
        if (this.state.shownDetails[connectionName] && this.state.shownDetails[connectionName].isShown)
        {
            //jQuery("#conParentContainer_" + connectionName).addClass("lc_hidden");
            jQuery("#conParentContainer_" + connectionName).hide();
            this.state.shownDetails[connectionName].isShown = false;
            jQuery("#mobileConnectionDetails_" + connectionName).removeClass("js_mobileShow");
            jQuery("#connectionDetailsRow_" + connectionName).removeClass("openRow");
            return;
        }
        jQuery("#conParentContainer_" + connectionName).show();
        jQuery("#mobileConnectionDetails_" + connectionName).addClass("js_mobileShow");
        jQuery("#connectionDetailsRow_" + connectionName).addClass("openRow");

        //jQuery("#conParentContainer_" + connectionName).removeClass("lc_hidden");
        this.state.shownDetails[connectionName] = {isShown: true, tab: null, isMapInit: false, isTextInit: false, isRouteInit: false};
        this.showDetailsTab(connectionName, "map");

    },
    showDetailsTab: function(connectionName, tabName)
    {
        //Inhalt
        jQuery("#conParentContainer_" + connectionName + " .detailsContainerInner").hide();
        jQuery("#conParentContainer_" + connectionName + " .detailsContainerInner_" + tabName).show();

        //Button
        jQuery("#conParentContainer_" + connectionName + " .menuItem").removeClass("active");
        jQuery("#conParentContainer_" + connectionName + " ." + tabName + "MenuItem").addClass("active");

        this.state.shownDetails[connectionName].tab = tabName;

        this.initDetailsRoute(connectionName);
        this.initDetailsMap(connectionName);
        if(tabName == "text")
            this.initDetailsText(connectionName);
    },
    initDetailsMap: function(connectionName)
    {
        if (this.state.shownDetails[connectionName].isMapInit)
            return;
        if (typeof this.currentResultMaps[connectionName] == "undefined")
        {
            var olMap = new HafasOpenLayersMap("MapDiv_" + connectionName, {
                id: connectionName,
                language: Hafas.Config.gLanguage,
                coord: new CCoord({lat: 0, lon: 0}),
                zoom: 10000
            });
            olMap.show();
            Hafas.Maps.Instances[connectionName] = olMap;
            this.currentResultMaps[connectionName] = new TpResultMap(olMap, {}, connectionName);
        }

        this.currentResultMaps[connectionName].map.updateSize();
        this.currentResultMaps[connectionName].drawMap();
        this.currentResultMaps[connectionName].moveToConnection();
        this.state.shownDetails[connectionName].isMapInit = true;
    },
    initDetailsText: function(connectionName)
    {
        if (this.state.shownDetails[connectionName].isTextInit)
            return;
        this.state.shownDetails[connectionName].isTextInit = true;

        this.renderTextDescription(this.getConnectionData(connectionName));
    },
    initDetailsRoute: function(connectionName)
    {
        if (this.state.shownDetails[connectionName].isRouteInit)
            return;

        this.state.shownDetails[connectionName].isRouteInit = true;

        var html = Mark.up(jQuery("#jtpl_tpDetailsMapRoute").html(), {connection: this.getConnectionData(connectionName), view: "map"});
        jQuery("#mapRouteContainerFor_" + connectionName).html(html);

        var html = Mark.up(jQuery("#jtpl_tpDetailsMapRoute").html(), {connection: this.getConnectionData(connectionName), view: "route"});
        jQuery("#routeContainerFor_" + connectionName).html(html);


    },
    renderFootwayDescription: function(descData, connection, startOrEnd, view)
    {
        var html = Mark.up(jQuery("#jtpl_tpDetailsFootwayDesc").html(), descData);
        jQuery("#connectionHolderFor_" + connection.name + "_" + view + " .footwayDesc_" + startOrEnd).html(html);
    },
    renderTextDescription: function(connection)
    {
        var html = Mark.up(jQuery("#jtpl_tpDetailsAsText").html(), connection);
        jQuery("#detailsAsText_" + connection.name).html(html);
    },
    getConnectionData: function(connectionName)
    {
        for (var i = 0; i < this.currentResult.connections.length; i++)
        {
            var connection = this.currentResult.connections[i];
            if (connectionName == connection.name)
                return connection;
        }
        return null;
    },
    getPrevConnectionData: function(connectionName)
    {
        for (var i = 1; i < this.currentResult.connections.length; i++)
        {
            var connection = this.currentResult.connections[i];
            if (connectionName == connection.name)
                return this.currentResult.connections[i - 1];
        }
        return null;
    },
    showDescForSection: function(connectionName, sectionIndex)
    {
        jQuery("#connectionHolderFor_" + connectionName + "_map .section_" + sectionIndex + " .intermedanStops").slideDown();
        jQuery("#connectionHolderFor_" + connectionName + "_map .section_" + sectionIndex + " .plusDot").hide();
        jQuery("#connectionHolderFor_" + connectionName + "_map .section_" + sectionIndex + " .minusDot").show();

        jQuery("#connectionHolderFor_" + connectionName + "_route .section_" + sectionIndex + " .intermedanStops").slideDown();
        jQuery("#connectionHolderFor_" + connectionName + "_route .section_" + sectionIndex + " .plusDot").hide();
        jQuery("#connectionHolderFor_" + connectionName + "_route .section_" + sectionIndex + " .minusDot").show();
    },
    hideDescForSection: function(connectionName, sectionIndex)
    {
        jQuery("#connectionHolderFor_" + connectionName + "_map .section_" + sectionIndex + " .intermedanStops").slideUp();
        jQuery("#connectionHolderFor_" + connectionName + "_map .section_" + sectionIndex + " .plusDot").show();
        jQuery("#connectionHolderFor_" + connectionName + "_map .section_" + sectionIndex + " .minusDot").hide();

        jQuery("#connectionHolderFor_" + connectionName + "_route .section_" + sectionIndex + " .intermedanStops").slideUp();
        jQuery("#connectionHolderFor_" + connectionName + "_route .section_" + sectionIndex + " .plusDot").show();
        jQuery("#connectionHolderFor_" + connectionName + "_route .section_" + sectionIndex + " .minusDot").hide();
    },
    renderResult: function()
    {
        this._sortConnections();
        this._calcExtraInfos();
        var html = Mark.up(jQuery("#jtpl_tpResultOverview").html(), this.currentResult);
        jQuery("#tpResultContainer").html(html);

        for (var i = 0; i < this.currentResult.connections.length; i++)
        {
            var connection = this.currentResult.connections[i];
            var sectionsHtml = Mark.up(jQuery("#jtpl_tpResultSections").html(), connection);
            jQuery("#overviewConnectionHolder_" + connection.name).html(sectionsHtml);
        }
        hfsGui.bookmark.addTpHash(jQuery("#TPInputLeftStartID").val(), jQuery("#TPInputLeftDestID").val())
        this.scrollToResultOnMobile();
    },
    /*
     * Erste Verbindung soll nach vorne
     */
    _sortConnections: function()
    {
        for (var i = 0; i < this.currentResult.connections.length; i++)
        {
            var connection = this.currentResult.connections[i];
            if (connection.type == "firstOfDay" && i != 0)
            {
                for (var j = i; j > 0; j--)
                {
                    this.currentResult.connections[j] = this.currentResult.connections[j - 1];
                }
                this.currentResult.connections[0] = connection;
                break;
            }
        }
    },
    _calcExtraInfos: function()
    {
        for (var i = 0; i < this.currentResult.connections.length; i++)
        {
            var connection = this.currentResult.connections[i];
            var hasWarning = false;
            var hasError = false;
            for (var j = 0; j < connection.sections.length; j++)
            {
                var section = connection.sections[j];
                section.realTime.hasWarningInJourney = false;
                section.realTime.hasWarningBefore = hasWarning;
                section.realTime.hasErrorInJourney = false;
                section.realTime.hasErrorBefore = hasError;
                if ((section.realTime.isCanceled) || (section.realTime.isCriticalLate))
                {
                    hasError = true;
                    section.realTime.hasErrorInJourney = true;
                }
                else if (((section.from.dep.realTime.isDelayed)&&(section.from.dep.realTime.delay>0)) || ((section.to.arr.realTime.isDelayed)&&(section.to.arr.realTime.delay>0)))
//                else if ((section.from.dep.realTime.isDelayed) || (section.to.arr.realTime.isDelayed))
                {
                    hasWarning = true;
                    section.realTime.hasWarningInJourney = true;
                }

            }
            connection.realTime.hasWarning = hasWarning;
            connection.realTime.hasError = connection.realTime.isCanceled || connection.realTime.isCriticalLate;
        }
    },
    loadLaterConnections: function()
    {
        this._reloadConnections({REQ0HafasScrollDir: "1", existTotal_enable:"no"});
    },
    loadEarlierConnections: function()
    {
        this._reloadConnections({REQ0HafasScrollDir: "2", existTotal_enable:"no"});
    },
    loadFirstConnection: function()
    {
        if (this.state.firstConnectionLoaded)
            return;
        this._reloadConnections({REQ0HafasSearchConnection: "first"});
        this.state.firstConnectionLoaded = true;
    },
    loadLastConnection: function()
    {
        if (this.state.lastConnectionLoaded)
            return;
        this._reloadConnections({REQ0HafasSearchConnection: "last"});
        this.state.lastConnectionLoaded = true;
    },
    _reloadConnections: function(param)
    {
        Hafas.tools.showWaitScreen();
        param.ident = this.currentResult.session.ident;
        param.ld = this.currentResult.session.ld;
        param.seqnr = this.currentResult.sequenzNr;
        param.tpl = "connResult2json";

        var url = Hafas.Config.gUrlTravelPlannerJSON + "y?" + Hafas.Config.gCatenateLayout;
        jQuery.ajax({
            url: url,
            data: param,
            method: "post"
        }).done(function(res) {
            this._clearResult();
            this.currentResult = res;
            this.renderResult();
            Hafas.tools.hideWaitScreen();
        }.bind(this));
    },
    _clearResult: function()
    {

    },
    updateResult: function()
    {
        var dataString = sessionStorage.getItem(hfsGui.tp.localStoragePrefix + "_tpSearchId_" + jQuery("#tpCurrentSearchId").val());
        var data = JSON.parse(dataString);
        var dateTime = Hafas.tools.getCurrentDateTime();
        var foundTime = false;
        var foundDate = false;
        for (var i = 0; i < data.length; i++)
        {
            if (data[i].name == "time")
            {
                data[i].name = dateTime.time;
                foundTime = true;
            }
            if (data[i].name == "date")
            {
                data[i].value = dateTime.date;
                foundDate = true;
            }
        }
        if (!foundTime)
            data.push({name: "time", value: dateTime.time});
        if (!foundDate)
            data.push({name: "date", value: dateTime.date});

        this._searchByData(data);
    },
    /*bookmarkConnection: function(buttonElem)
    {

      var bookmarkURL = jQuery(buttonElem).attr('href');
      var bookmarkTitle = jQuery(buttonElem).attr('title');

      if (window.sidebar && window.sidebar.addPanel) {
        // Firefox version < 23
        window.sidebar.addPanel(bookmarkTitle, bookmarkURL, '');
        return false;
      } else if ((window.sidebar && /Firefox/i.test(navigator.userAgent)) || (window.opera && window.print)) {
        // Firefox version >= 23 and Opera Hotlist
        return true;
      } else if (window.external && ('AddFavorite' in window.external)) {
        // IE Favorite
        window.external.AddFavorite(bookmarkURL, bookmarkTitle);
        return false;
      } else {
        // Other browsers (mainly WebKit - Chrome/Safari)
        alert(jQuery(buttonElem).attr('data-bookmark'));
      }

    },*/
    scrollToResultOnMobile: function()
    {
        if (Hafas.tools.isInMobileMode())
            Hafas.tools.scrollTo("tpResultAchor");
    },
    printConnection: function(connectioName)
    {
        var url = Hafas.Config.gUrlHelp+"tpl=print&printView=singleConnection&connectioName="+connectioName;
        var popup = window.open(url, "HafasPrint");
        popup.focus();
    },
    events: {
        startSearch: function()
        {
            hfsGui.tp.openResultPage();
        },
        showOnInputMap: function(target)
        {
            if(Hafas.tools.isInMobileMode())
            {
                if (target == "start")
                    hfsGui.mim.show(hfsGui.tp._getStartLocation());
                else
                    hfsGui.mim.show(hfsGui.tp._getDestLocation());
            }
            else
            {
                if (Hafas.currentPage != "tp_query")
                {
                    hfsGui.tp._saveSearchOptions();
                    hfsGui.tp.openQueryPage({name: "tpOpenInputMap", value: target});
                    return;
                }
                if (target == "start")
                    hfsGui.tp.scrollMapToMarker(hfsGui.tp.currentOverlayMarker.startMarker);
                else
                    hfsGui.tp.scrollMapToMarker(hfsGui.tp.currentOverlayMarker.destMarker);
                hfsGui.tp.scrollToMapOnTablet();
            }
        },
        showAdvancedOptions: function()
        {
            hfsGui.tp.openAdvancedOptions();
        },
        hideAdvancedOptions: function()
        {
            hfsGui.tp.hideAdvancedOptions();
        },
        activateDateTimeInput: function()
        {
            jQuery("#tpInputNowButton").removeClass("active");
            jQuery("#tpInputLaterButton").addClass("active");
            jQuery("#InputLeftDateTimeInputSet").slideDown();
            hfsGui.tp.state.activeDateTimeInput = true;
            hfsGui.tp._setCurrentDateTimeToNow();
        },
        deactivateDateTimeInput: function()
        {
            jQuery("#tpInputNowButton").addClass("active");
            jQuery("#tpInputLaterButton").removeClass("active");
            jQuery("#InputLeftDateTimeInputSet").slideUp();
            hfsGui.tp.state.activeDateTimeInput = false;
        },
        selectStartLocationFromSuggest: function(location)
        {
            hfsGui.tp.setStartMarkerToOverlayMap(location, true);
            hfsGui.tp._saveSearchOptions();

            if((location.type == "2") && (location.id == undefined))
                jQuery("#tpInputFromErrorHolder").html(Hafas.Texts.tp.pleaseSelectHouseNuber);
            else
                jQuery("#tpInputFromErrorHolder").html("");
        },
        selectDestLocationFromSuggest: function(location)
        {
            hfsGui.tp.setDestMarkerToOverlayMap(location, true);
            hfsGui.tp._saveSearchOptions();
            if((location.type == "2") && (location.id == undefined))
                jQuery("#tpInputToErrorHolder").html(Hafas.Texts.tp.pleaseSelectHouseNuber);
            else
                jQuery("#tpInputToErrorHolder").html("");
        },
        setCurrentPositionAs: function(target)
        {
            if(target == "start")
                jQuery("#TPInputLeftStart").addClass("wait");
            else
                jQuery("#TPInputLeftDest").addClass("wait");
            new PositionLocater(function(x, y){
               var locationId = "A=16@X="+x+"@Y="+y+"@O="+Hafas.Texts.tp.coord;
               if(target == "start")
               {
                   jQuery("#TPInputLeftStart").removeClass("wait");
                   jQuery("#TPInputLeftStart").val(Hafas.Texts.tp.coord);
                   jQuery("#TPInputLeftStartID").val(locationId);
               }
               else
               {
                   jQuery("#TPInputLeftDest").removeClass("wait");
                   jQuery("#TPInputLeftDest").val(Hafas.Texts.tp.coord);
                   jQuery("#TPInputLeftDestID").val(locationId);
               }
            }, function() {
                alert("Error. No Coordinates!");
            });
        },
        switchLocations: function()
        {
            var tmpName = jQuery("#TPInputLeftStart").val();
            var tmpId = jQuery("#TPInputLeftStartID").val();

            jQuery("#TPInputLeftStart").val(jQuery("#TPInputLeftDest").val());
            jQuery("#TPInputLeftStartID").val(jQuery("#TPInputLeftDestID").val());

            jQuery("#TPInputLeftDest").val(tmpName);
            jQuery("#TPInputLeftDestID").val(tmpId);
        }
    }
};



