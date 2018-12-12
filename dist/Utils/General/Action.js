"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Action = /** @class */ (function () {
    function Action(payload) {
        this.type = this.constructor.name;
        this.payload = payload;
        //this.Extend(payload);
        Object.setPrototypeOf(this, Object.getPrototypeOf({}));
    }
    Action.prototype.Is = function (actionType) {
        if (actionType == null)
            return false; // this can occur during start-up "assert reducer sanity" phase
        return this.type == actionType.name;
        //return this instanceof actionType; // alternative
    };
    Action.prototype.IsAny = function () {
        var _this = this;
        var actionTypes = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            actionTypes[_i] = arguments[_i];
        }
        return actionTypes.Any(function (a) { return _this.type == a.name; });
    };
    return Action;
}());
exports.Action = Action;
Object.prototype._AddFunction("Is", Action.prototype.Is);
Object.prototype._AddFunction("IsAny", Action.prototype.IsAny);
//Object.prototype._AddFunction("IsACTSetFor", Action.prototype.IsACTSetFor);
/*export function IsACT<Props>(action, actionType: new(..._)=>Action<Props>): action is Props {
    return action.type == actionType.name;
    //return action instanceof actionType; // alternative
}*/
/*export function IsACT<T, Props>(action: Action<T>, actionType: new(..._)=>Action<Props>): action is Props {
    return this.type == actionType.name;
    //return this instanceof actionType; // alternative
}*/
function IsACTSetFor(action, path) {
    if (!action.type.startsWith("ACTSet_"))
        return false;
    // exact match
    if (action.payload["path"] == path)
        return true;
    // wildcard match
    if (path.includes("$any")) {
        var pathParts = path.split("/");
        var actionPathParts = action.payload["path"].split("/");
        for (var _i = 0, _a = pathParts.entries(); _i < _a.length; _i++) {
            var _b = _a[_i], index = _b[0], pathPart = _b[1];
            var matches = pathPart == actionPathParts[index] || pathPart == "$any";
            if (!matches)
                return false;
        }
        return true;
    }
    return false;
}
exports.IsACTSetFor = IsACTSetFor;
//# sourceMappingURL=Action.js.map