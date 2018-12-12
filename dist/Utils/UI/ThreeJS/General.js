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
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_vextensions_1 = require("react-vextensions");
var js_vextensions_1 = require("js-vextensions");
//import MeshLine from "three.meshline";
var ElementDescriptorContainer_1 = require("react-three-renderer/lib/ElementDescriptorContainer");
var CustomGeometry_1 = require("./CustomGeometry");
var CustomMaterial_1 = require("./CustomMaterial");
ElementDescriptorContainer_1.default.prototype._AddSetter_Inline = function descriptors(value) {
    delete ElementDescriptorContainer_1.default.prototype.descriptors; // remove this hook from prototype (so we can set value on instance)
    // set to the value supplied, except with entries added
    var react3RendererInstance = null; // (apparently this isn't needed for every descriptor)
    this.descriptors = value.Extended({
        customGeometry: new CustomGeometry_1.CustomGeometryDescriptor(react3RendererInstance),
        customMaterial: new CustomMaterial_1.CustomMaterialDescriptor(react3RendererInstance),
    });
    ElementDescriptorContainer_1.default.prototype._AddSetter_Inline = descriptors; // add this hook back to prototype
};
var BoxGeometry_PivotAtX = /** @class */ (function (_super) {
    __extends(BoxGeometry_PivotAtX, _super);
    function BoxGeometry_PivotAtX() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    BoxGeometry_PivotAtX.prototype.render = function () {
        var _this = this;
        var _a = this.props, width = _a.width, height = _a.height, depth = _a.depth;
        return (React.createElement("boxGeometry", { ref: function (c) { return _this.geometry = c; }, width: width, height: height, depth: depth }));
    };
    BoxGeometry_PivotAtX.prototype.ComponentDidMountOrUpdate = function () {
        var _a = this.props, width = _a.width, height = _a.height, depth = _a.depth, pivotPoint_rel = _a.pivotPoint_rel;
        //this.geometry.applyMatrix(new THREE.Matrix4().makeTranslation(0.5, 0.5, 0.5));
        //this.geometry.translate(-pivotPoint_rel.x, -pivotPoint_rel.y, 0);
        if (this.geometry) {
            var lastTranslate = this.geometry["lastTranslate"];
            var distToNewPivot_rel = pivotPoint_rel.Minus(.5, .5); // since pivot starts at center, only change-pivot (translate) based on how far new-pivot is from the center
            var newTranslateAmount = new js_vextensions_1.Vector2i(-distToNewPivot_rel.x * width, -distToNewPivot_rel.y * height);
            var translateDiff = newTranslateAmount.Minus(lastTranslate || js_vextensions_1.Vector2i.zero);
            if (translateDiff.x != 0 || translateDiff.y != 0) {
                this.geometry.translate(translateDiff.x, translateDiff.y, 0);
                /*this.geometry.verticesNeedUpdate = true;
                this.geometry.computeBoundingSphere();*/
            }
            this.geometry["lastTranslate"] = newTranslateAmount;
        }
    };
    BoxGeometry_PivotAtX = __decorate([
        react_vextensions_1.SimpleShouldUpdate
    ], BoxGeometry_PivotAtX);
    return BoxGeometry_PivotAtX;
}(react_vextensions_1.BaseComponent));
exports.BoxGeometry_PivotAtX = BoxGeometry_PivotAtX;
var ShapeGeometry = /** @class */ (function (_super) {
    __extends(ShapeGeometry, _super);
    function ShapeGeometry() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ShapeGeometry.prototype.render = function () {
        var _this = this;
        var shapes = this.props.shapes;
        return (React.createElement("shapeGeometry", { ref: function (c) { return _this.geometry = c; }, shapes: shapes }));
    };
    return ShapeGeometry;
}(react_vextensions_1.BaseComponent));
exports.ShapeGeometry = ShapeGeometry;
/*export class MeshLine extends BaseComponent<{vertexes: Vector2i[]}, {}> {
    render() {
        return (
        );
    }
}*/ 
//# sourceMappingURL=General.js.map