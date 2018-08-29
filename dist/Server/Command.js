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
// dynamic imports
var u; // from "updeep";
var GetUserID; // from "Store/firebase/users";
var DBPath, GetPathParts, ApplyDBUpdates, RemoveHelpers; // from "../Frame/Database/DatabaseHelpers";
var HandleError; // from "../Frame/General/Errors";
function Command_Init(imports) {
    //({MaybeLog} = imports);
    (u = imports.u, GetUserID = imports.GetUserID, DBPath = imports.DBPath, GetPathParts = imports.GetPathParts, ApplyDBUpdates = imports.ApplyDBUpdates, RemoveHelpers = imports.RemoveHelpers, HandleError = imports.HandleError);
}
exports.Command_Init = Command_Init;
// content
// ==========
var CommandUserInfo = /** @class */ (function () {
    function CommandUserInfo() {
    }
    return CommandUserInfo;
}());
exports.CommandUserInfo = CommandUserInfo;
var currentCommandRun_listeners = null;
function WaitTillCurrentCommandFinishes() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, new Promise(function (resolve, reject) {
                    currentCommandRun_listeners.push({ resolve: resolve, reject: reject });
                })];
        });
    });
}
function OnCurrentCommandFinished() {
    var currentCommandRun_listeners_copy = currentCommandRun_listeners;
    currentCommandRun_listeners = null;
    for (var _i = 0, currentCommandRun_listeners_copy_1 = currentCommandRun_listeners_copy; _i < currentCommandRun_listeners_copy_1.length; _i++) {
        var listener = currentCommandRun_listeners_copy_1[_i];
        listener.resolve();
    }
}
var Command = /** @class */ (function () {
    function Command(payload) {
        this.userInfo = { id: GetUserID() }; // temp
        this.type = this.constructor.name;
        this.payload = payload;
        //this.Extend(payload);
        //Object.setPrototypeOf(this, Object.getPrototypeOf({}));
    }
    // these methods are executed on the server (well, will be later)
    // ==========
    /** [sync] Validates the payload data. (ie. the validation that doesn't require accessing the database) */
    Command.prototype.Validate_Early = function () { };
    ;
    /** [async] Validates the data, prepares it, and executes it -- thus applying it into the database. */
    Command.prototype.Run = function () {
        return __awaiter(this, void 0, void 0, function () {
            var dbUpdates;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!currentCommandRun_listeners) return [3 /*break*/, 2];
                        return [4 /*yield*/, WaitTillCurrentCommandFinishes()];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 0];
                    case 2:
                        currentCommandRun_listeners = [];
                        MaybeLog(function (a) { return a.commands; }, function () { return "Running command. @type:" + _this.constructor.name + " @payload(" + ToJSON(_this.payload, function (k, v) { return v === undefined ? null : v; }) + ")"; });
                        _a.label = 3;
                    case 3:
                        _a.trys.push([3, , 7, 8]);
                        RemoveHelpers(this.payload); // have this run locally, before sending, to save on bandwidth
                        this.Validate_Early();
                        return [4 /*yield*/, this.Prepare()];
                    case 4:
                        _a.sent();
                        return [4 /*yield*/, this.Validate()];
                    case 5:
                        _a.sent();
                        dbUpdates = this.GetDBUpdates();
                        //FixDBUpdates(dbUpdates);
                        //await store.firebase.helpers.DBRef().update(dbUpdates);
                        //await (store as any).firestore.update(dbUpdates);
                        return [4 /*yield*/, ApplyDBUpdates(DBPath(), dbUpdates)];
                    case 6:
                        //FixDBUpdates(dbUpdates);
                        //await store.firebase.helpers.DBRef().update(dbUpdates);
                        //await (store as any).firestore.update(dbUpdates);
                        _a.sent();
                        MaybeLog(function (a) { return a.commands; }, function () { return "Finishing command. @type:" + _this.constructor.name + " @payload(" + ToJSON(_this.payload, function (k, v) { return v === undefined ? null : v; }) + ")"; });
                        return [3 /*break*/, 8];
                    case 7:
                        OnCurrentCommandFinished();
                        return [7 /*endfinally*/];
                    case 8: 
                    // later on (once set up on server), this will send the data back to the client, rather than return it
                    return [2 /*return*/, this.returnData];
                }
            });
        });
    };
    return Command;
}());
exports.Command = Command;
function MergeDBUpdates(baseUpdatesMap, updatesToMergeMap) {
    var baseUpdates = baseUpdatesMap.Props().map(function (prop) { return ({ path: prop.name, data: prop.value }); });
    var updatesToMerge = updatesToMergeMap.Props().map(function (prop) { return ({ path: prop.name, data: prop.value }); });
    for (var _i = 0, updatesToMerge_1 = updatesToMerge; _i < updatesToMerge_1.length; _i++) {
        var update = updatesToMerge_1[_i];
        // if an update-to-merge exists for a path, remove any base-updates starting with that path (since the to-merge ones have priority)
        if (update.data == null) {
            for (var _a = 0, _b = baseUpdates.slice(); _a < _b.length; _a++) { // make copy, since Remove() seems to break iteration otherwise
                var update2 = _b[_a];
                if (update2.path.startsWith(update.path)) {
                    baseUpdates.Remove(update2);
                }
            }
        }
    }
    var finalUpdates = [];
    var _loop_1 = function (update) {
        var updatesToMergeIntoThisOne = updatesToMerge.filter(function (update2) {
            return update2.path.startsWith(update.path);
        });
        for (var _i = 0, updatesToMergeIntoThisOne_1 = updatesToMergeIntoThisOne; _i < updatesToMergeIntoThisOne_1.length; _i++) {
            var updateToMerge = updatesToMergeIntoThisOne_1[_i];
            var updateToMerge_relativePath = updateToMerge.path.substr((update.path + "/").length);
            //if (updateToMerge.data) {
            // assume that the update-to-merge has priority, so have it completely overwrite the data at its path
            update.data = u.updateIn(updateToMerge_relativePath.replace(/\//g, "."), u.constant(updateToMerge.data), update.data);
            /*} else {
                update.data = null;
            }*/
            // remove from updates-to-merge list (since we just merged it)
            updatesToMerge.Remove(updateToMerge);
        }
        finalUpdates.push(update);
    };
    for (var _c = 0, baseUpdates_1 = baseUpdates; _c < baseUpdates_1.length; _c++) {
        var update = baseUpdates_1[_c];
        _loop_1(update);
    }
    // for any "update to merge" which couldn't be merged into one of the base-updates, just add it as its own update (it won't clash with the others)
    for (var _d = 0, updatesToMerge_2 = updatesToMerge; _d < updatesToMerge_2.length; _d++) {
        var update = updatesToMerge_2[_d];
        finalUpdates.push(update);
    }
    var finalUpdatesMap = finalUpdates.reduce(function (result, current) { return result.VSet(current.path, current.data); }, {});
    return finalUpdatesMap;
}
exports.MergeDBUpdates = MergeDBUpdates;
// template
// ==========
/*
    Validate_Early() {
    }

    async Prepare() {
    }
    async Validate() {
    }

    GetDBUpdates() {
        let updates = {
        };
        return updates;
    }
*/ 
//# sourceMappingURL=Command.js.map