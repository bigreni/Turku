var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
import { MobileAd } from "./base";
export var InterstitialAd = /** @class */ (function (_super) {
    __extends(InterstitialAd, _super);
    function InterstitialAd() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    InterstitialAd.prototype.isLoaded = function () {
        return _super.prototype.isLoaded.call(this);
    };
    InterstitialAd.prototype.load = function () {
        return _super.prototype.load.call(this);
    };
    InterstitialAd.prototype.show = function () {
        return _super.prototype.show.call(this);
    };
    InterstitialAd.cls = "InterstitialAd";
    return InterstitialAd;
}(MobileAd));
//# sourceMappingURL=interstitial.js.map