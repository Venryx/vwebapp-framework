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
var prop_types_1 = require("prop-types");
var GeometryDescriptorBase_1 = require("react-three-renderer/lib/descriptors/Geometry/GeometryDescriptorBase");
var CustomGeometryDescriptor = /** @class */ (function (_super) {
    __extends(CustomGeometryDescriptor, _super);
    function CustomGeometryDescriptor(react3RendererInstance) {
        var _this = _super.call(this, react3RendererInstance) || this;
        _this.hasProp("geometry", {
            type: prop_types_1.default.object,
            update: _this.triggerRemount,
            default: undefined,
        });
        return _this;
    }
    CustomGeometryDescriptor.prototype.construct = function (props) {
        return props.geometry;
    };
    return CustomGeometryDescriptor;
}(GeometryDescriptorBase_1.default));
exports.CustomGeometryDescriptor = CustomGeometryDescriptor;
//# sourceMappingURL=CustomGeometry.js.map