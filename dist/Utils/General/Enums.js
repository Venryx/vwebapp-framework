"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// maybe temp (maybe instead find way to have TypeScript enums work well)
var Enum = /** @class */ (function () {
    function Enum(name, value) {
        //s.realTypeName = enumTypeName; // old: maybe temp; makes-so VDF system recognizes enumValues as of this enumType
        this.name = name;
        this.value = value;
    }
    //@_VDFSerialize() Serialize() { return new VDFNode(this.name, this.constructor.GetName()); }
    Enum.prototype.toString = function () { return this.name; };
    ;
    Enum._IsEnum = 0; // mimic odd enum marker/flag, used by TypeScript
    return Enum;
}());
exports.Enum = Enum;
function _Enum(target) {
    var typeName = target.GetName();
    // for now at least, auto-add enum as global, since enums are types and VDF system needs types to be global
    g[typeName] = target;
    // extends class itself
    target.Deserialize = function (node) { return target[node.primitiveValue]; }; //.AddTags(new VDFDeserialize(true));
    target.V = new target("enum root");
    //target.name = enumTypeName;
    //target.realTypeName = enumTypeName;
    //target._IsEnum = 0; // mimic odd enum marker/flag, used by TypeScript
    // add enum entries
    //var names = Object.getOwnPropertyNames(target.prototype);
    var tempEnumInstance = new target();
    var names = Object.getOwnPropertyNames(tempEnumInstance).Except("name", "value");
    var index = -1;
    for (var _i = 0, names_1 = names; _i < names_1.length; _i++) {
        var name_1 = names_1[_i];
        ++index;
        var value = IsNumber(tempEnumInstance[name_1]) ? tempEnumInstance[name_1] : index;
        var entry = new target(name_1, value);
        // make accessible by MyEnum.MyEntry
        target[name_1] = entry;
        // make accessible by MyEnum.V.MyEntry
        target.V[name_1] = entry;
    }
    target.names = names;
    target.entries = target.names.Select(function (name) { return target[name]; });
    target.values = target.entries.Select(function (a) { return a.value; });
    target.options = target.entries.Select(function (a) { return ({ name: a.name, value: a }); });
}
exports._Enum = _Enum;
// functions for if using TypeScript enums
// ==========
function GetEntries(enumType, nameModifierFunc) {
    return Object.keys(enumType).Where(function (a) { return a.match(/^\D/) != null; }).Select(function (name) { return ({ name: nameModifierFunc ? nameModifierFunc(name) : name, value: enumType[name] }); });
}
exports.GetEntries = GetEntries;
function GetValues(enumType) {
    return GetEntries(enumType).map(function (a) { return a.value; });
}
exports.GetValues = GetValues;
function GetValues_ForSchema(enumType) {
    return GetValues(enumType).map(function (value) { return ({ const: value }); });
}
exports.GetValues_ForSchema = GetValues_ForSchema;
//# sourceMappingURL=Enums.js.map