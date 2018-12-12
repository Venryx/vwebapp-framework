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
//import "rc-tooltip/assets/bootstrap.css";
var InTooltip = /** @class */ (function (_super) {
    __extends(InTooltip, _super);
    function InTooltip() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    InTooltip.prototype.render = function () {
        var children = this.props.children;
        return (React.createElement("div", { style: { whiteSpace: "pre" } }, children));
    };
    return InTooltip;
}(react_vextensions_1.BaseComponent));
exports.InTooltip = InTooltip;
//# sourceMappingURL=Tooltip.js.map