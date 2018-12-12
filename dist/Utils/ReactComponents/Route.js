"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var react_vextensions_1 = require("react-vextensions");
var redux_little_router_1 = require("redux-little-router");
var js_vextensions_1 = require("js-vextensions");
var URLs_1 = require("../URL/URLs");
var Route = /** @class */ (function (_super) {
    __extends(Route, _super);
    function Route() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Route.prototype.render = function () {
        var _a = this.props, path = _a.path, withConditions = _a.withConditions, children = _a.children;
        return (React.createElement(redux_little_router_1.Fragment, { parentRoute: "routeWhichNeverMatches", matchWildcardRoute: function () { return true; }, withConditions: withConditions || (function (url) {
                var urlStr = URLs_1.NormalizeURL(js_vextensions_1.VURL.FromState(url)).toString({ domain: false, queryVars: false, hash: false });
                //return url.startsWith(targetURL);
                return urlStr.startsWith(path);
            }) }, children));
    };
    return Route;
}(react_vextensions_1.BaseComponent));
exports.Route = Route;
//# sourceMappingURL=Route.js.map