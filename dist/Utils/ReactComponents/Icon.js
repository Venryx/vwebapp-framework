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
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) if (e.indexOf(p[i]) < 0)
            t[p[i]] = s[p[i]];
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_vextensions_1 = require("react-vextensions");
//import iconData from "../../../Source/Utils/UI/IconData.json";
/*var iconData_raw = {} as any; //require("../../../Source/Utils/UI/IconData.json");
let iconData = {};
for (let entry of iconData_raw.icons) {
    iconData[entry.tags[0]] = entry.paths[0];
}*/
/*
[old]
IconData.json generated using icomoon.io. Just add the packs below, select the icons listed in IconType (or just select all), then click "Download JSON" in corner menu.

Icon packs:
* IcoMoon - Free
* Font Awesome
*/
/*export type IconType =
| "arrow-up" | "arrow-down"
;*/
// SVG's not used during the initial icon-rendering batch were never getting rendered.
// For now, we'll fix this by importing all SVG's from the get-go.
var context = require.context("../../../Resources/SVGs/", true /* include subfolders */, /\.svg$/);
var files = {};
context.keys().forEach(function (filename) {
    files[filename] = context(filename);
});
//export class Icon extends BaseComponent<{icon: IconType, color?: string}, {}> {
var Icon = /** @class */ (function (_super) {
    __extends(Icon, _super);
    function Icon() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Icon.prototype.render = function () {
        var _a = this.props, icon = _a.icon, size = _a.size, color = _a.color, rest = __rest(_a, ["icon", "size", "color"]);
        //let data = iconData[icon];
        /*return (
             <svg>
                 <path d={data} fill={color}></path>
             </svg>
         );*/
        var info = require("../../../Resources/SVGs/" + icon + ".svg").default;
        return (React.createElement("svg", __assign({}, rest, { viewBox: info.viewBox, width: size, height: size }),
            React.createElement("use", { xlinkHref: "#" + info.id, style: { fill: color } })));
    };
    Icon.defaultProps = { color: "rgba(255,255,255,.7)" };
    return Icon;
}(react_vextensions_1.BaseComponent));
exports.Icon = Icon;
//# sourceMappingURL=Icon.js.map