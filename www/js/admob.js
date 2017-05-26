    function onLoad() {
        if ((/(ipad|iphone|ipod|android|windows phone)/i.test(navigator.userAgent))) {
            document.addEventListener('deviceready', checkFirstUse, false);
        } else {
            checkFirstUse();
        }
    }
    var admobid = {};
    if (/(android)/i.test(navigator.userAgent)) {
        admobid = { // for Android
            banner: 'ca-app-pub-1683858134373419/6195622280',
            interstitial: 'ca-app-pub-9249695405712287/2495341951'
        };
    } else if(/(ipod|iphone|ipad)/i.test(navigator.userAgent)) { // for ios
    admobid = {
      banner: 'ca-app-pub-1683858134373419/6195622280', // or DFP format "/6253334/dfp_example_ad"
      interstitial: 'ca-app-pub-9249695405712287/1663006354'
    };
  }




    function initApp() {
        if (!AdMob) { return; }
        initAd();
        // display the banner at startup
        //createSelectedBanner();
        //display interstitial at startup
        loadInterstitial();
    }
    function initAd() {
        var defaultOptions = {
            // bannerId: admobid.banner,
            // interstitialId: admobid.interstitial,
            // adSize: 'SMART_BANNER',
            // width: integer, // valid when set adSize 'CUSTOM'
            // height: integer, // valid when set adSize 'CUSTOM'
            position: AdMob.AD_POSITION.BOTTOM_CENTER,
            // offsetTopBar: false, // avoid overlapped by status bar, for iOS7+
            bgColor: 'black', // color name, or '#RRGGBB'
            // x: integer,      // valid when set position to 0 / POS_XY
            // y: integer,      // valid when set position to 0 / POS_XY
            isTesting: false, // set to true, to receiving test ad for testing purpose
            overlap: false
            // autoShow: true // auto show interstitial ad when loaded, set to false if prepare/show
        };
        AdMob.setOptions(defaultOptions);
        registerAdEvents();
    }
    // optional, in case respond to events or handle error
    function registerAdEvents() {
        // new events, with variable to differentiate: adNetwork, adType, adEvent
        document.addEventListener('onAdFailLoad', function (data) 
        {
            document.getElementById('fullpage').style.visibility = 'visible';
            document.getElementById('splashscreen').style.display = 'none';
        });
        document.addEventListener('onAdLoaded', function (data) { });
        document.addEventListener('onAdPresent', function (data) { });
        document.addEventListener('onAdLeaveApp', function (data) { });
        document.addEventListener('onAdDismiss', function (data) 
        {
            document.getElementById('fullpage').style.visibility = 'visible';
            document.getElementById('splashscreen').style.display = 'none';
        });
    }

    function createSelectedBanner() {
        AdMob.createBanner({adId:admobid.banner});
    }

function loadInterstitial() {
    AdMob.prepareInterstitial({ adId: admobid.interstitial, isTesting: false, autoShow: true });
}


function successFunction()
{
    
}
 
function errorFunction(error)
{
    
}

   function checkFirstUse()
    {
            $('#simplemenu').sidr();
            initApp();
            askRating();
            //document.getElementById('fullpage').style.visibility = 'visible';
            //document.getElementById('splashscreen').style.display = 'none';
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
}

function showPlanner()
{
    if(document.getElementById('frmPlanner').src == '')
    {
        document.getElementById('frmPlanner').src = 'http://beta.digitransit.fi/';
    }
    document.getElementById('divPlanner').style.display = 'block';
    document.getElementById('divMap').style.display = 'none';    
    document.getElementById('divMap').style.height = '0vh';
    document.getElementById('divPlanner').style.height = '100vh';
}