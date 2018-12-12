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
var Icon_1 = require("./Icon");
var TreeView = /** @class */ (function (_super) {
    __extends(TreeView, _super);
    function TreeView(props) {
        var _this = _super.call(this, props) || this;
        var defaultCollapsed = _this.props.defaultCollapsed;
        _this.state = { collapsed: defaultCollapsed };
        return _this;
    }
    TreeView.prototype.onArrowClick = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        var _a = this.props, collapsable = _a.collapsable, onArrowClick = _a.onArrowClick;
        var collapsed = this.state.collapsed;
        var newCollapsed = collapsed;
        if (collapsable) {
            newCollapsed = !collapsed;
            this.SetState({ collapsed: newCollapsed });
        }
        if (onArrowClick)
            onArrowClick(newCollapsed);
    };
    TreeView.prototype.onClick = function (e) {
        var onClick = this.props.onClick;
        if (onClick)
            onClick(e);
    };
    TreeView.prototype.render = function () {
        var _a = this.props, collapsable = _a.collapsable, title = _a.title, children = _a.children, selected = _a.selected, style = _a.style, titleStyle = _a.titleStyle, rest = __rest(_a, ["collapsable", "title", "children", "selected", "style", "titleStyle"]);
        var collapsed = this.state.collapsed;
        var iconSize = 8; // with padding: 12
        return (React.createElement("div", __assign({ style: style }, rest),
            React.createElement(Icon_1.Icon, { icon: "arrow-" + (collapsed ? "right" : "down"), size: iconSize, style: E({
                    display: "inline-block", boxSizing: "content-box", width: iconSize, height: iconSize, verticalAlign: "top", marginTop: 2, padding: 2,
                    backgroundPosition: 2, backgroundRepeat: "no-repeat", backgroundSize: 8, cursor: "pointer",
                }, !collapsable && { opacity: 0 }), onClick: this.onArrowClick }),
            React.createElement("div", { onClick: this.onClick, style: E(titleStyle, { display: "inline-block", width: "calc(100% - 12px)",
                    backgroundColor: selected ? "rgba(44, 79, 122, .5)" : null }) }, title),
            React.createElement("div", { style: E({ paddingLeft: 10 }, collapsed && { display: "none" }) }, children)));
    };
    TreeView.defaultProps = { collapsable: true };
    return TreeView;
}(react_vextensions_1.BaseComponent));
exports.TreeView = TreeView;
//# sourceMappingURL=TreeView.js.map