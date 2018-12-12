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
var rc_slider_1 = require("rc-slider");
var Slider = /** @class */ (function (_super) {
    __extends(Slider, _super);
    function Slider() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Slider.prototype.render = function () {
        var _this = this;
        var _a = this.props, value = _a.value, enabled = _a.enabled, delayChangeTillDefocus = _a.delayChangeTillDefocus, onChange = _a.onChange, rest = __rest(_a, ["value", "enabled", "delayChangeTillDefocus", "onChange"]);
        var editedValue = this.state.editedValue;
        return (React.createElement(rc_slider_1.default, __assign({ ref: function (c) { return _this.slider = c; } }, rest, { disabled: !enabled, value: editedValue != null ? editedValue : (value || 0), onChange: function (val) {
                if (delayChangeTillDefocus) {
                    _this.SetState({ editedValue: val });
                }
                else {
                    onChange(val);
                    _this.SetState({ editedValue: null });
                }
            }, onAfterChange: function (val) {
                if (delayChangeTillDefocus && onChange) {
                    onChange(val);
                    _this.SetState({ editedValue: null });
                }
            } })));
    };
    Slider.defaultProps = { enabled: true };
    return Slider;
}(react_vextensions_1.BaseComponent));
exports.Slider = Slider;
//# sourceMappingURL=Slider.js.map