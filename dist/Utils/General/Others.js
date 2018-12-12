"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var DatabaseHelpers_1 = require("../Database/DatabaseHelpers");
var js_vextensions_1 = require("js-vextensions");
var THREE = require("three");
function GetUpdates(oldData, newData, useNullInsteadOfUndefined) {
    if (useNullInsteadOfUndefined === void 0) { useNullInsteadOfUndefined = true; }
    var result = {};
    for (var _i = 0, _a = oldData.VKeys(true).concat(newData.VKeys(true)); _i < _a.length; _i++) {
        var key = _a[_i];
        if (newData[key] !== oldData[key]) {
            result[key] = newData[key];
            if (newData[key] === undefined && useNullInsteadOfUndefined) {
                result[key] = null;
            }
        }
    }
    return DatabaseHelpers_1.RemoveHelpers(result);
}
exports.GetUpdates = GetUpdates;
function GetOffsetRect(el) {
    return new js_vextensions_1.VRect(el.clientLeft, el.clientTop, el.clientWidth, el.clientHeight, false);
}
exports.GetOffsetRect = GetOffsetRect;
function GetScreenRect(el) {
    var clientRect = el.getBoundingClientRect();
    return new js_vextensions_1.VRect(clientRect.left, clientRect.top, clientRect.width, clientRect.height, false);
}
exports.GetScreenRect = GetScreenRect;
AddSchema({
    properties: {
        x: { type: "number" },
        y: { type: "number" },
    },
}, "Vector2i");
AddSchema({
    properties: {
        x: { type: "number" },
        y: { type: "number" },
        width: { type: "number" },
        height: { type: "number" },
    },
}, "VRect");
function ToVector2i(vector) {
    return new js_vextensions_1.Vector2i(vector.x, vector.y);
}
exports.ToVector2i = ToVector2i;
function ToVector2(vector) {
    return new THREE.Vector2(vector.x, vector.y);
}
exports.ToVector2 = ToVector2;
function ToVector3(vector, z) {
    if (z === void 0) { z = 0; }
    return new THREE.Vector3(vector.x, vector.y, z);
}
exports.ToVector3 = ToVector3;
//# sourceMappingURL=Others.js.map