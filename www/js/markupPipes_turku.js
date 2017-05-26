
Mark.pipes.distance = function(distS)
{
    var dist = parseInt(distS, 10);
    if (isNaN(dist))
        return "";
    if (dist > 1000)
        return parseInt(dist / 100) / 10.0 + " km";
    else
        return dist + " m";
};

Mark.pipes.decode = function(value)
{
    return Hafas.tools.decodeHTML(value);
};

Mark.pipes.decodeURI = function(value)
{
    return decodeURIComponent(value);
};

Mark.pipes.isMetaStation = function(location)
{
    return (location.rawData.isrealmeta != undefined) && (location.rawData.isrealmeta == 1);
};

// Fuer StationBoard (Aequvalente Stationen)
Mark.pipes.isMetaStationEQ = function(location)
{
    return location.ismain == "yes";
};

Mark.pipes.sectionHasInterDescription = function(section)
{
    var connection = hfsGui.tp.getConnectionData(section.connectionName);
    if (section.isGISRoute && (section.index == 0 || section.index == connection.sections.length - 1))
        return true;
    if (!section.isGISRoute && section.intermedianStops.length > 2)
        return true;
    return false;
};

Mark.pipes.connectionWalkDist = function(connection)
{
    var dist = 0;
    for (var i = 0; i < connection.sections.length; i++)
    {
        var section = connection.sections[i];
        if ((section.isGISRoute) && (section.product.type == "GIS_0"))
            dist += parseInt(section.dist);
    }

    if (dist < 500)
        return dist + " " + Hafas.Texts.tp.shortMeters;
    dist = parseInt(dist / 100);
    dist = dist / 10.0;
    return dist + " " + Hafas.Texts.tp.shortKm;
};

Mark.pipes.connectionDuration = function(dur)
{
    var durArr = dur.split(":");
    return parseInt(durArr[0], 10) * 60 + parseInt(durArr[1], 10);
};

Mark.pipes.productTypeName = function(pBit)
{
    return Hafas.Config.Products[pBit].name;
};

Mark.pipes.getSectionClass = function(section)
{
    if (section.isGISRoute)
        return "GIS_section";
    if (section.index == 0)
        return "NORMAL_section";
    var connection = hfsGui.tp.getConnectionData(section.connectionName);
    var prevSection = connection.sections[section.index - 1];
    if (prevSection.isGISRoute)
        return "GIS_END_section";
    return "NORMAL_section";
};

Mark.pipes.isGISChange = function(section)
{
    if (section.isGISRoute)
        return true;
    if (section.index == 0)
        return null;
    var connection = hfsGui.tp.getConnectionData(section.connectionName);
    var prevSection = connection.sections[section.index - 1];
    if (prevSection.isGISRoute)
        return true;
    return false;
};

Mark.pipes.getConnectionLabel = function(connection)
{
    if (connection.type == "firstOfDay") // Erste des Tages
        return Hafas.Texts.tp.firstConnection;
    else if (connection.type == "lastOfDay") // Letzte des Tages
        return Hafas.Texts.tp.lastConnection;

    var prevConnection = hfsGui.tp.getPrevConnectionData(connection.name);
    if (prevConnection != null)
    {
        if (prevConnection.type == "firstOfDay") // Erste normale Verbindungs nach erste des Tages
            return connection.from.dep.date;

        if (prevConnection.from.dep.date != connection.from.dep.date) // Datumswechsel der Verbindungen
            return connection.from.dep.date;
    }
    else if (hfsGui.tp.currentResult.queryParams.date != connection.from.dep.date) // Erste sichtbare Verbindung. Datum ist ungleich der Anfrage
        return connection.from.dep.date;
    return "";
};

Mark.pipes.hasRealTime = function(journey)
{
    return journey.realTime.hasRealTime;
};

Mark.pipes.isOnTime = function(realTime)
{
    return (realTime.hasRealTime) && (realTime.delay == 0);
};

Mark.pipes.isOnTimeTS = function(realTime)
{
    return (typeof realTime.isDepOnTime != "undefined" && realTime.isDepOnTime) || (typeof realTime.isArrOnTime != "undefined" && realTime.isArrOnTime);
};

/*
 * Checkt ob eine Sektion ein echter (Bus zu Bus) Umstieg ist
 */
Mark.pipes.isRealChange = function(section)
{
    if (section.isGISRoute)
        return false;
    if (section.index == 0)
        return false;
    var connection = hfsGui.tp.getConnectionData(section.connectionName);
    for (var i = section.index - 1; i >= 0; i--)
        if (!connection.sections[i].isGISRoute)
            return true;
    return false;
};

Mark.pipes.footwayStartOrDest = function(section)
{
    var connection = hfsGui.tp.getConnectionData(section.connectionName);
    if ((section.index == "0") && (connection.sections.length > 1))
        return "START";
    else if (section.index > 0)
        return "END";
    else
        return "COMPLETE";
};

Mark.pipes.footwayManoeuver = function(section)
{
    if (Hafas.Config.FoorwayDescriptionImages[section.Manoeuvre] == undefined)
        return section.Manoeuvre;
    return "<img src='" + Hafas.Config.FoorwayDescriptionImages[section.Manoeuvre] + "' alt='' />";
};

Mark.pipes.isStation = function(location)
{
    return location.type == "STATION";
};

Mark.pipes.getConnetionWarnings = function(connection)
{
    var warningHTML = "";
    for (var i = 0; i < connection.sections.length; i++)
    {
        var section = connection.sections[i];
        if (((section.from.dep.realTime.isDelayed)&&(section.from.dep.realTime.delay>0)) || ((section.to.arr.realTime.isDelayed)&&(section.to.arr.realTime.delay>0)))
        {
            warningHTML += Hafas.Texts.RealTime.lineIsLatePrefix + " <strong>" + section.product.name + "</strong> " + Hafas.Texts.RealTime.lineIsLatePostfix + "<br />";
        }
    }
    return warningHTML;

};

Mark.pipes.getConnetionErrors = function(connection)
{
    var warningHTML = "";
    for (var i = 0; i < connection.sections.length; i++)
    {
        var section = connection.sections[i];
        if (section.realTime.isCanceled)
        {
            warningHTML += "<strong>" + Hafas.Texts.RealTime.errorOn + " " + section.product.name + ":</strong>  " + Hafas.Texts.RealTime.lineCanceled + "<br />";
        }
        if (section.realTime.isCriticalLate)
        {
            warningHTML += "<strong>" + Hafas.Texts.RealTime.errorOn + " " + section.product.name + ":</strong> " + Hafas.Texts.RealTime.lineCritical + "<br />";
        }
    }
    return warningHTML;

};

Mark.pipes.getSectionClass = function(section)
{
    if (section.realTime.hasErrorBefore)
        return "errorBefore";
    else if (section.realTime.hasErrorInJourney)
        return "errorInSection";
    else if (section.realTime.hasWarningBefore)
        return "warningBefore";
    else if (section.realTime.hasWarningInJourney)
        return "warningInSection";
    return "";
};

Mark.pipes.getRealTimeColor = function(section)
{
    if (section.realTime.hasErrorBefore)
        return "red";
    else if (section.realTime.hasErrorInJourney)
        return "red";
    else if (section.realTime.hasWarningBefore)
        return "grey";
    else if (section.realTime.hasWarningInJourney)
        return "grey";
    return "black";
};

Mark.pipes.isGISConnection = function(connection)
{
    return (connection.sections.length == 1) && (connection.sections[0].isGISRoute);
};

Mark.pipes.isBikeConnection = function(connection)
{
    return (connection.sections.length == 1) && (typeof connection.sections[0].isGISBikeRoute != "undefined");
};

Mark.pipes.lineInfoStationClass = function(station)
{
    if (station.index == 0)
        return "start";
    if (station.index == hfsGui.tq.currentLineData.stationList.length - 1)
        return "end";
    return "intermedian";
};

Mark.pipes.tqHasRealTime = function(stop)
{
    return (typeof stop.realTime.arrTime != "undefined") ||
            (typeof stop.realTime.depTime != "undefined") ||
            stop.realTime.isCanceled ||
            stop.realTime.isNewStop;
};

Mark.pipes.lineNumber = function(value)
{
    return value.split(" ").pop();
};

Mark.pipes.hour = function(value)
{
    if (value.length == 1)
        return "0" + value;
    return value;
};

Mark.pipes.timeMin = function(value)
{
    return parseInt(value.split(":")[1], 10);
};

Mark.pipes.livemapGetTrainRealTimeClass = function(trainStation)
{
    if (trainStation.delay == 0)
        return "onTime";
    else if (parseInt(trainStation.delay) > 0)
        return "late";
    else
        return "";
};

Mark.pipes.livemapGetTrainRealTime = function(trainStation)
{
    if (typeof trainStation.delay == "undefined")
        return "-";
    if (trainStation.delay == 0)
        return "<span class='onTime'>+ 0 min</span>";
    else if (parseInt(trainStation.delay) > 0)
        return "<span class='late'>+ " + trainStation.delay + " min</span>";
    else if (parseInt(trainStation.delay) < 0)
        return "<span class='onTime'>" + trainStation.delay + " min</span>";
    else
        return "";
};

Mark.pipes.locationIcon = function(typeS)
{
    var type = parseInt(typeS);
    switch(type)
    {
        case 1:
            return "<img src='"+Hafas.Config.gImagePath+"icons/suggest_stop.png' />";
        case 2:
            return "<img src='"+Hafas.Config.gImagePath+"icons/suggest_adress.png' />";
        case 4:
            return "<img src='"+Hafas.Config.gImagePath+"icons/suggest_poi.png' />";
        default:
            return "";
    }
};