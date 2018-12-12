"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var DatabaseHelpers_1 = require("Utils/Database/DatabaseHelpers");
var Command_1 = require("./Command");
var recentActions_1 = require("../Store/firebase/userExtras/$userExtras/recentActions");
function MapEdit(target) {
    var oldPrepare = target.prototype.Prepare;
    target.prototype.Prepare = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, oldPrepare.apply(this)];
                    case 1:
                        _b.sent();
                        if (!this.payload.mapID) return [3 /*break*/, 3];
                        _a = this;
                        return [4 /*yield*/, DatabaseHelpers_1.GetDataAsync({ addHelpers: false }, "maps", this.payload.mapID, ".edits")];
                    case 2:
                        _a.map_oldEditCount = (_b.sent()) || 0;
                        _b.label = 3;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    var oldGetDBUpdates = target.prototype.GetDBUpdates;
    target.prototype.GetDBUpdates = function () {
        var updates = oldGetDBUpdates.apply(this);
        var newUpdates = {};
        if (this.payload.mapID) {
            newUpdates["maps/" + this.payload.mapID + "/.edits"] = this.map_oldEditCount + 1;
            newUpdates["maps/" + this.payload.mapID + "/.editedAt"] = Date.now();
        }
        return Command_1.MergeDBUpdates(updates, newUpdates);
    };
}
exports.MapEdit = MapEdit;
// todo: maybe remove (kinda redundant vs UndoableAction)
function UserEdit(target) {
    var oldPrepare = target.prototype.Prepare;
    target.prototype.Prepare = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, oldPrepare.apply(this)];
                    case 1:
                        _b.sent();
                        _a = this;
                        return [4 /*yield*/, DatabaseHelpers_1.GetDataAsync({ addHelpers: false }, "userExtras", this.userInfo.id, ".edits")];
                    case 2:
                        _a.user_oldEditCount = (_b.sent()) || 0;
                        return [2 /*return*/];
                }
            });
        });
    };
    var oldGetDBUpdates = target.prototype.GetDBUpdates;
    target.prototype.GetDBUpdates = function () {
        var updates = oldGetDBUpdates.apply(this);
        var newUpdates = {};
        newUpdates["userExtras/" + this.userInfo.id + "/.edits"] = this.user_oldEditCount + 1;
        newUpdates["userExtras/" + this.userInfo.id + "/.lastEditAt"] = Date.now();
        return Command_1.MergeDBUpdates(updates, newUpdates);
    };
}
exports.UserEdit = UserEdit;
// this should almost always be the bottom (last line) decorator, so that it's applied first and doesn't capture extra-updates from other decorators
function UndoableAction() {
    return function (target) {
        var oldPrepare = target.prototype.Prepare;
        target.prototype.Prepare = function () {
            return __awaiter(this, void 0, void 0, function () {
                var updates, _i, _a, _b, path, newData, oldData, _c, _d, _e;
                var _this = this;
                return __generator(this, function (_f) {
                    switch (_f.label) {
                        case 0: return [4 /*yield*/, oldPrepare.apply(this)];
                        case 1:
                            _f.sent();
                            updates = oldGetDBUpdates.call(this);
                            this.updates_oldData = {};
                            _i = 0, _a = updates.Props();
                            _f.label = 2;
                        case 2:
                            if (!(_i < _a.length)) return [3 /*break*/, 5];
                            _b = _a[_i], path = _b.name, newData = _b.value;
                            return [4 /*yield*/, DatabaseHelpers_1.GetDataAsync.apply(void 0, [{ addHelpers: false }].concat(path.split("/")))];
                        case 3:
                            oldData = _f.sent();
                            this.updates_oldData[path] = oldData;
                            _f.label = 4;
                        case 4:
                            _i++;
                            return [3 /*break*/, 2];
                        case 5:
                            _c = this;
                            _d = ToInt;
                            return [4 /*yield*/, DatabaseHelpers_1.GetDataAsync({ addHelpers: false }, "userExtras", this.userInfo.id, ".actions")];
                        case 6:
                            _c.user_oldActionCount = _d.apply(void 0, [_f.sent()]) || 0;
                            _e = this;
                            return [4 /*yield*/, DatabaseHelpers_1.GetAsync(function () { return recentActions_1.GetRecentActions(_this.userInfo.id); })];
                        case 7:
                            _e.undoneActions = (_f.sent()).filter(function (a) { return a.undone; });
                            return [2 /*return*/];
                    }
                });
            });
        };
        var oldGetDBUpdates = target.prototype.GetDBUpdates;
        target.prototype.GetDBUpdates = function () {
            var updates = oldGetDBUpdates.apply(this);
            var newUpdates = {};
            newUpdates["userExtras/" + this.userInfo.id + "/.actions"] = this.user_oldActionCount + 1;
            var actionID = this.user_oldActionCount;
            newUpdates["userExtras/" + this.userInfo.id + "/recentActions/" + actionID] = { oldData: this.updates_oldData, newData: updates };
            // trim recent-actions list so it doesn't grow more than 30 entries long
            newUpdates["userExtras/" + this.userInfo.id + "/recentActions/" + (actionID - 30)] = null;
            // for any recent-action that has been undone, delete it from history now that we're adding a new entry (we moved before the entries, then added new, making them outdated)
            for (var _i = 0, _a = this.undoneActions; _i < _a.length; _i++) {
                var action = _a[_i];
                newUpdates["userExtras/" + this.userInfo.id + "/recentActions/" + action._id] = null;
            }
            return Command_1.MergeDBUpdates(updates, newUpdates);
        };
    };
}
exports.UndoableAction = UndoableAction;
//# sourceMappingURL=CommandMacros.js.map