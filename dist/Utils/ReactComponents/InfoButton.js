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
//import ReactTooltip from "react-tooltip";
var rc_tooltip_1 = require("rc-tooltip");
var Tooltip_1 = require("./Tooltip");
var react_vcomponents_1 = require("react-vcomponents");
var TooltipInfo = /** @class */ (function () {
    function TooltipInfo(text, effect) {
        this.text = text;
        this.effect = effect;
        this.id = ++lastTipID;
    }
    Object.defineProperty(TooltipInfo.prototype, "IDStr", {
        get: function () { return "tooltip_" + this.id; },
        enumerable: true,
        configurable: true
    });
    return TooltipInfo;
}());
var tooltips = [];
var lastTipID = -1;
var InfoButton = /** @class */ (function (_super) {
    __extends(InfoButton, _super);
    function InfoButton() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    InfoButton.prototype.ComponentWillMountOrReceiveProps = function (props) {
        if (this.tooltip)
            this.DestroyTooltip();
        this.CreateTooltip(props);
    };
    InfoButton.prototype.ComponentWillUnmount = function () {
        this.DestroyTooltip();
    };
    InfoButton.prototype.DestroyTooltip = function () {
        tooltips.Remove(this.tooltip);
        this.tooltip = null;
    };
    InfoButton.prototype.CreateTooltip = function (props) {
        var text = props.text, effect = props.effect;
        this.tooltip = new TooltipInfo(text, effect);
        tooltips.push(this.tooltip);
        /*if (InfoButton_TooltipWrapper.main) {
            InfoButton_TooltipWrapper.main.Update(()=>ReactTooltip.rebuild());
        }*/
    };
    InfoButton.prototype.render = function () {
        var _a = this.props, text = _a.text, effect = _a.effect, rest = __rest(_a, ["text", "effect"]);
        return (React.createElement(rc_tooltip_1.default, { placement: "top", overlay: React.createElement(Tooltip_1.InTooltip, null, text) },
            React.createElement(react_vcomponents_1.Button, __assign({}, rest, { size: 13, iconSize: 13, iconPath: "/Images/Buttons/Info.png", useOpacityForHover: true, style: { position: "relative", zIndex: 1, marginLeft: 1, backgroundColor: null, boxShadow: null, border: null }, "data-tip": true, "data-for": this.tooltip.IDStr }))));
    };
    InfoButton.defaultProps = { effect: "solid" };
    return InfoButton;
}(react_vextensions_1.BaseComponent));
exports.InfoButton = InfoButton;
// we have to use an outside-of-scrollview tooltip-wrapper, because "position: fixed" does not work under an element with "willChange: transform" 
/*export class InfoButton_TooltipWrapper extends BaseComponent<{}, {}> {
    static main: InfoButton_TooltipWrapper;
    ComponentDidMount() {
        InfoButton_TooltipWrapper.main = this;
    }
    ComponentWillUnmount() {
        InfoButton_TooltipWrapper.main = null;
    }
    render() {
        return (
            <div>
                {tooltips.map((tooltip, index)=> {
                    return (
                        <ReactTooltip key={index} id={tooltip.IDStr} effect={tooltip.effect}>
                            <Pre>{tooltip.text}</Pre>
                        </ReactTooltip>
                    );
                })}
            </div>
        );
    }
}*/ 
//# sourceMappingURL=InfoButton.js.map