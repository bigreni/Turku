function refresh() {
    var iframe = document.getElementById('frmMap');
    iframe.src = iframe.src;
    closeme();
};

function showMap()
{
    if(document.getElementById('frmMap').src == '')
    {
        document.getElementById('frmMap').src = 'LiveMap.html';
        document.getElementById('frmPlanner').setAttribute('allow', 'geolocation *;');
    }
    document.getElementById('divPlanner').style.display = 'none';
    document.getElementById('divMap').style.display = 'block';
    document.getElementById('divPlanner').style.height = '0vh';
    document.getElementById('divMap').style.height = '92vh';
}

function showPlanner()
{    
    if ((/(ipad|iphone|ipod|android|windows phone)/i.test(navigator.userAgent))) {
        showAd();
    }

    if(document.getElementById('frmPlanner').src == '')
    {
        document.getElementById('frmPlanner').src = 'https://turku.digitransit.fi/';
        document.getElementById('frmPlanner').setAttribute('allow', 'geolocation *;');
    }
    document.getElementById('divPlanner').style.display = 'block';
    document.getElementById('divMap').style.display = 'none';    
    document.getElementById('divMap').style.height = '0vh';
    document.getElementById('divPlanner').style.height = '92vh';
}

 