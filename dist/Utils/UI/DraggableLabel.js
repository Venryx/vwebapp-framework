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
var js_vextensions_1 = require("js-vextensions");
var DraggableLabel = /** @class */ (function (_super) {
    __extends(DraggableLabel, _super);
    function DraggableLabel() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.OnMouseMove_Global = function (e) {
            var onDrag = _this.props.onDrag;
            var mousePos = new js_vextensions_1.Vector2i(e.pageX, e.pageY);
            onDrag(mousePos.Minus(_this.lastMousePos), mousePos.Minus(_this.mouseDownPos), false);
            _this.lastMousePos = mousePos;
        };
        _this.OnMouseUp_Global = function (e) {
            var onDrag = _this.props.onDrag;
            var mousePos = new js_vextensions_1.Vector2i(e.pageX, e.pageY);
            onDrag(mousePos.Minus(_this.lastMousePos), mousePos.Minus(_this.mouseDownPos), true);
            _this.RemoveListeners();
        };
        return _this;
    }
    DraggableLabel.prototype.render = function () {
        var _this = this;
        var _a = this.props, onDragStart = _a.onDragStart, onDrag = _a.onDrag, style = _a.style, rest = __rest(_a, ["onDragStart", "onDrag", "style"]);
        return (React.createElement("label", __assign({}, rest, { style: E(onDrag && { cursor: "col-resize" }, style), onMouseDown: function (e) {
                if (onDrag == null)
                    return;
                _this.mouseDownPos = new js_vextensions_1.Vector2i(e.pageX, e.pageY);
                _this.lastMousePos = _this.mouseDownPos;
                onDragStart();
                document.addEventListener("mousemove", _this.OnMouseMove_Global);
                document.addEventListener("mouseup", _this.OnMouseUp_Global);
            } })));
    };
    DraggableLabel.prototype.ComponentWillUnmount = function () {
        this.RemoveListeners();
    };
    DraggableLabel.prototype.RemoveListeners = function () {
        document.removeEventListener("mousemove", this.OnMouseMove_Global);
        document.removeEventListener("mouseup", this.OnMouseUp_Global);
    };
    return DraggableLabel;
}(react_vextensions_1.BaseComponent));
exports.DraggableLabel = DraggableLabel;
//# sourceMappingURL=DraggableLabel.js.map