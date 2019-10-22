     function onLoad() {
        if ((/(ipad|iphone|ipod|android|windows phone)/i.test(navigator.userAgent))) {
            document.addEventListener('deviceready', checkFirstUse, false);
        } else {
            notFirstUse();
        }
    }

  var admobid = {};
  if( /(android)/i.test(navigator.userAgent) ) { // for android & amazon-fireos
    admobid = {
      banner: 'ca-app-pub-1683858134373419/6195622280', // or DFP format "/6253334/dfp_example_ad"
      interstitial: 'ca-app-pub-9249695405712287/2495341951'
    };
  } else if(/(ipod|iphone|ipad)/i.test(navigator.userAgent)) { // for ios
    admobid = {
      banner: 'ca-app-pub-1683858134373419/7790106682', // or DFP format "/6253334/dfp_example_ad"
      interstitial: 'ca-app-pub-9249695405712287/8955912090'
    };
  }

    function initApp() {
        if (!AdMob) { alert('admob plugin not ready'); return; }
        initAd();
        //display interstitial at startup
        loadInterstitial();
    }
    function initAd() {
        var defaultOptions = {
            position: AdMob.AD_POSITION.BOTTOM_CENTER,
            bgColor: 'black', // color name, or '#RRGGBB'
            isTesting: false // set to true, to receiving test ad for testing purpose
        };
        AdMob.setOptions(defaultOptions);
        registerAdEvents();
    }
    // optional, in case respond to events or handle error
    function registerAdEvents() {
        // new events, with variable to differentiate: adNetwork, adType, adEvent
        document.addEventListener('onAdFailLoad', function (data) {
            document.getElementById('screen').style.display = 'none';     
        });
        document.addEventListener('onAdLoaded', function (data) {
            AdMob.showInterstitial();
        });
        document.addEventListener('onAdPresent', function (data) { });
        document.addEventListener('onAdLeaveApp', function (data) { });
        document.addEventListener('onAdDismiss', function (data) { 
            document.getElementById('screen').style.display = 'none';     
        });
    }

    function createSelectedBanner() {
          AdMob.createBanner({adId:admobid.banner});
    }

    function loadInterstitial() {
        //AdMob.prepareInterstitial({ adId: admobid.interstitial, isTesting: false, autoShow: false });
    }

   function checkFirstUse()
    {
        checkPermissions();
        //window.ga.startTrackerWithId('UA-88579601-2', 1, function(msg) {
        //    window.ga.trackView('Home');
        //});
        initApp();
        askRating();
        //document.getElementById('screen').style.display = 'none';     
    }

       function notFirstUse()
    {
        document.getElementById('screen').style.display = 'none';     
    }

function askRating()
{
  AppRate.preferences = {
  openStoreInApp: true,
  useLanguage:  'fi',
  usesUntilPrompt: 10,
  promptAgainForEachNewVersion: true,
  storeAppURL: {
                ios: '1227310753',
                android: 'market://details?id=com.turku.withads'
               }
};
 
AppRate.promptForRating(false);
}


function showMap()
{
    document.getElementById('divPlanner').style.display = 'none';
    document.getElementById('divMap').style.display = 'block';
    document.getElementById('divPlanner').style.height = '0vh';
    document.getElementById('divMap').style.height = '100vh';
    window.ga.trackView('Map');
}

function showPlanner()
{
    if(document.getElementById('frmPlanner').src == '')
    {
        document.getElementById('frmPlanner').src = 'http://beta.digitransit.fi/';
        document.getElementById('frmPlanner').setAttribute('allow', 'geolocation *;');
    }
    document.getElementById('divPlanner').style.display = 'block';
    document.getElementById('divMap').style.display = 'none';    
    document.getElementById('divMap').style.height = '0vh';
    document.getElementById('divPlanner').style.height = '100vh';
    window.ga.trackView('Planner');
}

function checkPermissions()
{
    cordova.plugins.diagnostic.getLocationAuthorizationStatus(function (status) {
        switch (status) {
            case cordova.plugins.diagnostic.permissionStatus.NOT_REQUESTED:
                cordova.plugins.diagnostic.requestLocationAuthorization(function (status) {
                    console.log("success");
                }, function (error) {
                    console.error(error);
                });
                break;
            case cordova.plugins.diagnostic.permissionStatus.GRANTED:
                break;
            case cordova.plugins.diagnostic.permissionStatus.DENIED:
                cordova.plugins.diagnostic.requestLocationAuthorization(function (status) {
                }, function (error) {
                    console.error(error);
                });
                break;
            case cordova.plugins.diagnostic.permissionStatus.DENIED_ALWAYS:
                break;
            default:
                cordova.plugins.diagnostic.requestLocationAuthorization(function (status) {
                }, function (error) {
                    console.error(error);
                });
        }
    }, function (error) {
        console.error(error);
    });
}
