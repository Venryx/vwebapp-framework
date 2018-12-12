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
var react_datetime_1 = require("react-datetime");
var moment_1 = require("moment");
function FixVal(val, props) {
    //let timeOnly = props.dateFormat == false;
    if (IsString(val)) {
        if (val == "")
            return null;
        var asMoment = moment_1.default(val, ["HH:mm", "hh:mm a"]);
        if (!asMoment.isValid)
            return null;
        return asMoment;
    }
    return val;
}
var VDateTime = /** @class */ (function (_super) {
    __extends(VDateTime, _super);
    function VDateTime() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    VDateTime.prototype.render = function () {
        var _this = this;
        var _a = this.props, value = _a.value, onChange = _a.onChange, delayChangeTillDefocus = _a.delayChangeTillDefocus, min = _a.min, max = _a.max, rest = __rest(_a, ["value", "onChange", "delayChangeTillDefocus", "min", "max"]);
        var valueTemp = this.state.valueTemp;
        return (React.createElement(react_datetime_1.default, __assign({}, rest, { value: valueTemp !== undefined ? valueTemp : value, onChange: function (val) {
                if (!IsString(val)) {
                    if (min && val < min)
                        val = min;
                    if (max && val > max)
                        val = max;
                }
                if (delayChangeTillDefocus)
                    _this.SetState({ valueTemp: val }, null, false);
                else
                    onChange(FixVal(val, _this.props));
            }, inputProps: { onBlur: function (e) { return _this.OnInputBlurOrBoxClose(e.target.value); } }, onBlur: function (val) { return _this.OnInputBlurOrBoxClose(val); } })));
    };
    VDateTime.prototype.OnInputBlurOrBoxClose = function (val) {
        var _a = this.props, value = _a.value, onChange = _a.onChange, delayChangeTillDefocus = _a.delayChangeTillDefocus, min = _a.min, max = _a.max, rest = __rest(_a, ["value", "onChange", "delayChangeTillDefocus", "min", "max"]);
        if (!delayChangeTillDefocus)
            return;
        if (!IsString(val)) {
            if (min && val < min)
                val = min;
            if (max && val > max)
                val = max;
        }
        onChange(FixVal(val, this.props));
    };
    return VDateTime;
}(react_vextensions_1.BaseComponent));
exports.VDateTime = VDateTime;
//# sourceMappingURL=VDateTime.js.map