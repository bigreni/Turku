     function onLoad() {
        if ((/(ipad|iphone|ipod|android|windows phone)/i.test(navigator.userAgent))) {
            document.addEventListener('deviceready', checkFirstUse, false);
        } else {
            notFirstUse();
        }
    }

    function initApp() {
        if (/(android)/i.test(navigator.userAgent)){
            interstitial = new admob.InterstitialAd({
                //dev
                adUnitId: 'ca-app-pub-3940256099942544/1033173712'
                //prod
                //adUnitId: 'ca-app-pub-9249695405712287/2495341951'
              });
            }
            else if(/(ipod|iphone|ipad)/i.test(navigator.userAgent) || (navigator.userAgent.includes("Mac") && "ontouchend" in document)) {
                interstitial = new admob.InterstitialAd({
                    //dev
                    adUnitId: 'ca-app-pub-3940256099942544/4411468910'
                    //prod
                    //adUnitId: 'ca-app-pub-9249695405712287/8955912090'
                  });
            }
            registerAdEvents();
            interstitial.load();
    }

    // optional, in case respond to events or handle error
    function registerAdEvents() {
        // new events, with variable to differentiate: adNetwork, adType, adEvent
        document.addEventListener('admob.ad.load', function (data) {
            document.getElementById("screen").style.display = 'none';    
        });
        document.addEventListener('admob.ad.loadfail', function (data) {
            document.getElementById("screen").style.display = 'none'; 
        });
        document.addEventListener('admob.ad.show', function (data) { 
            document.getElementById("screen").style.display = 'none';     
        });
        document.addEventListener('admob.ad.dismiss', function (data) {
            document.getElementById("screen").style.display = 'none';     
        });
    }

   function checkFirstUse()
    {
        initApp();
        checkPermissions();
        checkTrackingPermissions();
        askRating();
        //document.getElementById('screen').style.display = 'none';     
    }

       function notFirstUse()
    {
        document.getElementById('screen').style.display = 'none';     
    }

function askRating()
{
    const appRatePlugin = AppRate;
    appRatePlugin.setPreferences({
        reviewType: {
            ios: 'AppStoreReview',
            android: 'InAppBrowser'
            },
    useLanguage:  'en',
    usesUntilPrompt: 10,
    promptAgainForEachNewVersion: true,
    storeAppURL: {
                ios: '1227310753',
                android: 'market://details?id=com.turku.withads'
               }
    });
    
    AppRate.promptForRating(false);  
}

function checkTrackingPermissions(){
    const idfaPlugin = cordova.plugins.idfa;

    idfaPlugin.getInfo()
        .then(info => {
            if (!info.trackingLimited) {
                return info.idfa || info.aaid;
            } else if (info.trackingPermission === idfaPlugin.TRACKING_PERMISSION_NOT_DETERMINED) {
                return idfaPlugin.requestPermission().then(result => {
                    if (result === idfaPlugin.TRACKING_PERMISSION_AUTHORIZED) {
                        return idfaPlugin.getInfo().then(info => {
                            return info.idfa || info.aaid;
                        });
                    }
                });
            }
        });
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

function showAd()
{
    document.getElementById("screen").style.display = 'block';     
    if ((/(ipad|iphone|ipod|android|windows phone)/i.test(navigator.userAgent))) {
        interstitial.show();
    }
    document.getElementById("screen").style.display = 'none'; 
}