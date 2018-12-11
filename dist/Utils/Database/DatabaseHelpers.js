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
var Imports = /** @class */ (function () {
    function Imports() {
    }
    return Imports;
}());
exports.Imports = Imports;
var i;
function VInit_DatabaseHelpers(imports) {
    i = imports;
    waitForInit_resolve();
}
exports.VInit_DatabaseHelpers = VInit_DatabaseHelpers;
var waitForInit = new Promise(function (resolve, reject) { return waitForInit_resolve = resolve; });
var waitForInit_resolve;
// content
// ==========
waitForInit.then(function () {
    G({ firebase_: i.firebase }); // doesn't show as R.firebase, fsr
});
function IsAuthValid(auth) {
    return auth && !auth.isEmpty;
}
exports.IsAuthValid = IsAuthValid;
// v-path: collection/obj/.prop/.prop2
// v-field-path: prop/prop2
// fb-path: collection/obj.prop.prop2
// fb-field-path: prop.prop2
function VPathToFBPath(vPath) {
    return vPath != null ? vPath.replace(/\/\./g, ".") : null;
}
exports.VPathToFBPath = VPathToFBPath;
function FBPathToVPath(fbPath) {
    return fbPath != null ? fbPath.replace(/\./g, "/.") : null;
}
exports.FBPathToVPath = FBPathToVPath;
function VFieldPathToFBFieldPath(vFieldPath) {
    return vFieldPath != null ? vFieldPath.replace(/\//g, ".") : null;
}
exports.VFieldPathToFBFieldPath = VFieldPathToFBFieldPath;
function FBFieldPathToVFieldPath(vFieldPath) {
    return vFieldPath != null ? vFieldPath.replace(/\./g, "/") : null;
}
exports.FBFieldPathToVFieldPath = FBFieldPathToVFieldPath;
/*export function CombinePathSegments(...pathSegments: (string | number)[]) {
    let result = "";
    for (let segment of pathSegments) {
        if (segment[0] != ".") {
            result += "/";
        }
        result += segment;
    }
    return result;
}*/
function GetPathParts(path, asFBPath) {
    if (asFBPath === void 0) { asFBPath = false; }
    var _a;
    var docPath = path.substr(0, path.indexOf("/.").IfN1Then(path.length));
    var fieldPathInDoc = docPath.length < path.length ? path.substr(docPath.length + 2).replace(/\./g, "") : null;
    if (asFBPath) {
        _a = [VPathToFBPath(docPath), VFieldPathToFBFieldPath(fieldPathInDoc)], docPath = _a[0], fieldPathInDoc = _a[1];
    }
    return [docPath, fieldPathInDoc];
}
exports.GetPathParts = GetPathParts;
function DBPath(path, inVersionRoot) {
    if (path === void 0) { path = ""; }
    if (inVersionRoot === void 0) { inVersionRoot = true; }
    Assert(path != null, "Path cannot be null.");
    Assert(IsString(path), "Path must be a string.");
    /*let versionPrefix = path.match(/^v[0-9]+/);
    if (versionPrefix == null) // if no version prefix already, add one (referencing the current version)*/
    if (inVersionRoot) {
        path = "versions/v" + i.dbVersion + "-" + i.env_short + (path ? "/" + path : '');
    }
    return path;
}
exports.DBPath = DBPath;
function DBPathSegments(pathSegments, inVersionRoot) {
    if (inVersionRoot === void 0) { inVersionRoot = true; }
    var result = pathSegments;
    if (inVersionRoot) {
        result = ["versions", "v" + i.dbVersion + "-" + i.env_short].concat(result);
    }
    return result;
}
exports.DBPathSegments = DBPathSegments;
function PathToListenerPath(path) {
    var pathNodesLeft = path.split("/");
    function ConvertNextTwoPathNodesIntoListenerPathNode(pathNodes) {
        var result = {};
        var collectionNode = pathNodes.splice(0, 1)[0];
        Assert(collectionNode.trim().length, "Path node cannot be empty. Path: " + path);
        result.collection = collectionNode;
        if (pathNodes.length) {
            result.doc = pathNodes.splice(0, 1)[0];
        }
        return result;
    }
    var root = ConvertNextTwoPathNodesIntoListenerPathNode(pathNodesLeft);
    if (pathNodesLeft.length) {
        root.subcollections = [];
        while (pathNodesLeft.length) {
            root.subcollections.push(ConvertNextTwoPathNodesIntoListenerPathNode(pathNodesLeft));
        }
    }
    return root;
}
exports.PathToListenerPath = PathToListenerPath;
function ListenerPathToPath(listenerPath) {
    var result = [];
    var pathNodes = [listenerPath].concat((listenerPath.subcollections || []));
    for (var _i = 0, pathNodes_1 = pathNodes; _i < pathNodes_1.length; _i++) {
        var pathNode = pathNodes_1[_i];
        result.push(pathNode.collection);
        if (pathNode.doc) {
            result.push(pathNode.doc);
        }
    }
    return result.join("/");
}
exports.ListenerPathToPath = ListenerPathToPath;
function SlicePath(path, removeFromEndCount) {
    var itemsToAdd = [];
    for (var _i = 2; _i < arguments.length; _i++) {
        itemsToAdd[_i - 2] = arguments[_i];
    }
    //let parts = path.split("/");
    var parts = i.SplitStringBySlash_Cached(path).slice();
    parts.splice.apply(parts, [parts.length - removeFromEndCount, removeFromEndCount].concat(itemsToAdd));
    return parts.join("/");
}
exports.SlicePath = SlicePath;
Object.prototype._AddFunction_Inline = function DBRef(path, inVersionRoot) {
    if (path === void 0) { path = ""; }
    if (inVersionRoot === void 0) { inVersionRoot = true; }
    var finalPath = DBPath(path, inVersionRoot);
    return this.ref(finalPath);
};
function ProcessDBData(data, standardizeForm, addHelpers, rootKey) {
    var treeNodes = i.GetTreeNodesInObjTree(data, true);
    for (var _i = 0, treeNodes_1 = treeNodes; _i < treeNodes_1.length; _i++) {
        var treeNode = treeNodes_1[_i];
        if (treeNode.Value == null)
            continue;
        // turn the should-not-have-been-array arrays (the ones without a "0" property) into objects
        if (standardizeForm && treeNode.Value instanceof Array && treeNode.Value[0] === undefined) {
            // if changing root, we have to actually modify the prototype of the passed-in "data" object
            /*if (treeNode.Value == data) {
                Object.setPrototypeOf(data, Object.getPrototypeOf({}));
                for (var key of Object.keys(data)) {
                    if (data[key] === undefined)
                        delete data[key];
                }
                continue;
            }*/
            var valueAsObject = {}.Extend(treeNode.Value);
            for (var key in valueAsObject) {
                // if fake array-item added by Firebase/js (just so the array would have no holes), remove it
                //if (valueAsObject[key] == null)
                if (valueAsObject[key] === undefined)
                    delete valueAsObject[key];
            }
            if (treeNode.Value == data)
                treeNode.obj[treeNode.prop] = valueAsObject; // if changing root, we need to modify wrapper.data
            else
                i.DeepSet(data, treeNode.PathStr, valueAsObject); // else, we need to use deep-set, because ancestors may have already changed during this transform/processing
        }
        // turn the should-have-been-array objects (the ones with a "0" property) into arrays
        if (standardizeForm && typeof treeNode.Value == "object" && !(treeNode.Value instanceof Array) && treeNode.Value[0] !== undefined) {
            // if changing root, we have to actually modify the prototype of the passed-in "data" object
            /*if (treeNode.Value == data) {
                Object.setPrototypeOf(data, Object.getPrototypeOf([]));
                data.length = data.VKeys(true).filter(a=>IsNumberString(a));
                continue;
            }*/
            var valueAsArray = [].Extend(treeNode.Value);
            if (treeNode.Value == data)
                treeNode.obj[treeNode.prop] = valueAsArray; // if changing root, we need to modify wrapper.data
            else
                i.DeepSet(data, treeNode.PathStr, valueAsArray); // else, we need to use deep-set, because ancestors may have already changed during this transform/processing
        }
        // add special _key or _id prop
        if (addHelpers && typeof treeNode.Value == "object") {
            var key = treeNode.prop == "_root" ? rootKey : treeNode.prop;
            if (parseInt(key).toString() == key) {
                treeNode.Value._id = parseInt(key);
                //treeNode.Value._Set("_id", parseInt(key));
            }
            // actually, always set "_key" (in case it's a "_key" that also happens to look like an "_id"/integer)
            //else {
            treeNode.Value._key = key;
            //treeNode.Value._Set("_key", key);
        }
    }
    return treeNodes[0].Value; // get possibly-modified wrapper.data
}
exports.ProcessDBData = ProcessDBData;
var helperProps = ["_key", "_id"];
/** Note: this mutates the original object. */
function RemoveHelpers(data) {
    var treeNodes = i.GetTreeNodesInObjTree(data, true);
    for (var _i = 0, treeNodes_2 = treeNodes; _i < treeNodes_2.length; _i++) {
        var treeNode = treeNodes_2[_i];
        if (helperProps.Contains(treeNode.prop))
            delete treeNode.obj[treeNode.prop];
    }
    return data;
}
exports.RemoveHelpers = RemoveHelpers;
var DBPathInfo = /** @class */ (function () {
    function DBPathInfo() {
        this.lastTimestamp = -1;
    }
    return DBPathInfo;
}());
var pathInfos = {};
var GetData_Options = /** @class */ (function () {
    function GetData_Options() {
        this.inVersionRoot = true;
        this.makeRequest = true;
        this.useUndefinedForInProgress = false;
    }
    return GetData_Options;
}());
exports.GetData_Options = GetData_Options;
G({ GetData: GetData });
function GetData() {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    var pathSegments, options;
    //if (typeof args[0] == "string") pathSegments = args;
    if (typeof args[0] == "string")
        pathSegments = args;
    else
        options = args[0], pathSegments = args.slice(1);
    options = E(new GetData_Options(), options);
    if (i.__DEV__) {
        Assert(pathSegments.All(function (segment) { return typeof segment == "number" || !segment.Contains("/"); }), "Each string path-segment must be a plain prop-name. (ie. contain no \"/\" separators) @segments(" + pathSegments + ")");
    }
    pathSegments = DBPathSegments(pathSegments, options.inVersionRoot);
    /*Assert(!path.endsWith("/"), "Path cannot end with a slash. (This may mean a path parameter is missing)");
    Assert(!path.Contains("//"), "Path cannot contain a double-slash. (This may mean a path parameter is missing)");*/
    var path = pathSegments.join("/");
    /*if (options.queries && options.queries.VKeys().length) {
        let queriesStr = "";
        for (let {name, value, index} of options.queries.Props()) {
            queriesStr += (index == 0 ? "#" : "&") + name + "=" + value;
        }
        pathSegments[pathSegments.length - 1] = pathSegments.Last() + queriesStr;
        path += queriesStr.replace(/[#=]/g, "_");
    }*/
    if (options.makeRequest) {
        var queriesStr = "";
        if (options.queries && options.queries.VKeys().length) {
            for (var _a = 0, _b = options.queries.Props(); _a < _b.length; _a++) {
                var _c = _b[_a], name_1 = _c.name, value = _c.value, index = _c.index;
                queriesStr += (index == 0 ? "#" : "&") + name_1 + "=" + value;
            }
        }
        i.RequestPath(path + queriesStr);
    }
    //let result = State("firebase", "data", ...SplitStringByForwardSlash_Cached(path)) as any;
    var result = i.State.apply(i, ["firestore", "data"].concat(pathSegments.map(function (a) { return typeof a == "string" && a[0] == "." ? a.substr(1) : a; })));
    //let result = State("firebase", "data", ...pathSegments) as any;
    if (result == null && options.useUndefinedForInProgress) {
        var requestCompleted = i.State().firestore.status.requested[path];
        if (!requestCompleted)
            return undefined; // undefined means, current-data for path is null/non-existent, but we haven't completed the current request yet
        else
            return null; // null means, we've completed the request, and there is no data at that path
    }
    return result;
}
exports.GetData = GetData;
var GetDataAsync_Options = /** @class */ (function () {
    function GetDataAsync_Options() {
        this.inVersionRoot = true;
        this.addHelpers = true;
    }
    return GetDataAsync_Options;
}());
exports.GetDataAsync_Options = GetDataAsync_Options;
G({ GetDataAsync: GetDataAsync });
function GetDataAsync() {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    return __awaiter(this, void 0, void 0, function () {
        var pathSegments, options, path, _a, colOrDocPath, fieldPathInDoc, isDoc, result, doc, docData, docs, _b, docs_1, doc;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    if (typeof args[0] == "string")
                        pathSegments = args;
                    else
                        options = args[0], pathSegments = args.slice(1);
                    options = E(new GetDataAsync_Options(), options);
                    path = DBPath(pathSegments.join("/"), options.inVersionRoot);
                    _a = GetPathParts(path), colOrDocPath = _a[0], fieldPathInDoc = _a[1];
                    isDoc = colOrDocPath.split("/").length % 2 == 0;
                    if (!isDoc) return [3 /*break*/, 2];
                    return [4 /*yield*/, i.firestoreDB.doc(colOrDocPath).get()];
                case 1:
                    doc = _c.sent();
                    docData = doc.exists ? doc.data() : null;
                    result = fieldPathInDoc ? i.DeepGet(docData, fieldPathInDoc) : docData;
                    return [3 /*break*/, 4];
                case 2: return [4 /*yield*/, i.firestoreDB.collection(colOrDocPath).get()];
                case 3:
                    docs = (_c.sent()).docs;
                    result = {};
                    for (_b = 0, docs_1 = docs; _b < docs_1.length; _b++) {
                        doc = docs_1[_b];
                        result[doc.id] = doc.data();
                    }
                    _c.label = 4;
                case 4:
                    if (result) {
                        result = ProcessDBData(result, true, options.addHelpers, pathSegments.Last() + "");
                    }
                    return [2 /*return*/, result];
            }
        });
    });
}
exports.GetDataAsync = GetDataAsync;
/**
 * Usage: await GetAsync(()=>GetNode(123))
 * It has the same processing as in Connect(), except callable using async/await.
 * It basically makes a pretend component -- connecting to firebase, and resolving the promise once the condition below is fulfilled:
 * 	It re-calls the db-getter func (after the last generation's requested-path-data was all received), and finds that no new paths are requested.
 */
G({ GetAsync: GetAsync });
function GetAsync(dbGetterFunc, statsLogger) {
    return __awaiter(this, void 0, void 0, function () {
        var firebase, result, requestedPathsSoFar, requestedPathsSoFar_last, newRequestedPaths, _i, newRequestedPaths_1, path;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    Assert(!i.g.inConnectFunc, "Cannot run GetAsync() from within a Connect() function.");
                    firebase = i.store.firebase;
                    requestedPathsSoFar = {};
                    _a.label = 1;
                case 1:
                    requestedPathsSoFar_last = Clone(requestedPathsSoFar);
                    i.ClearRequestedPaths();
                    result = dbGetterFunc();
                    newRequestedPaths = i.GetRequestedPaths().Except(requestedPathsSoFar.VKeys());
                    /*unWatchEvents(firebase, store.dispatch, getEventsFromInput(newRequestedPaths)); // do this just to trigger re-get
                    // start watching paths (causes paths to be requested)
                    watchEvents(firebase, store.dispatch, getEventsFromInput(newRequestedPaths));*/
                    i.UnsetListeners(newRequestedPaths); // do this just to trigger re-get
                    // start watching paths (causes paths to be requested)
                    i.SetListeners(newRequestedPaths);
                    _i = 0, newRequestedPaths_1 = newRequestedPaths;
                    _a.label = 2;
                case 2:
                    if (!(_i < newRequestedPaths_1.length)) return [3 /*break*/, 5];
                    path = newRequestedPaths_1[_i];
                    requestedPathsSoFar[path] = true;
                    // wait till data is received
                    return [4 /*yield*/, WaitTillPathDataIsReceived(path)];
                case 3:
                    // wait till data is received
                    _a.sent();
                    _a.label = 4;
                case 4:
                    _i++;
                    return [3 /*break*/, 2];
                case 5:
                    if (i.ShallowChanged(requestedPathsSoFar, requestedPathsSoFar_last)) return [3 /*break*/, 1];
                    _a.label = 6;
                case 6:
                    /*let paths_final = requestedPathsSoFar.VKeys();
                    let paths_data = await Promise.all(paths_final.map(path=>GetDataAsync(path)));
                    let listener = ()=> {
                        listener(); // unsubscribe
                    };
                    store.subscribe(listener);*/
                    if (statsLogger) {
                        statsLogger({ requestedPaths: requestedPathsSoFar });
                    }
                    return [2 /*return*/, result];
            }
        });
    });
}
exports.GetAsync = GetAsync;
G({ GetAsync_Raw: GetAsync_Raw });
function GetAsync_Raw(dbGetterFunc, statsLogger) {
    return __awaiter(this, void 0, void 0, function () {
        var value;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, GetAsync(dbGetterFunc, statsLogger)];
                case 1:
                    value = _a.sent();
                    if (value == null)
                        return [2 /*return*/, value];
                    return [2 /*return*/, RemoveHelpers(Clone(value))];
            }
        });
    });
}
exports.GetAsync_Raw = GetAsync_Raw;
function WaitTillPathDataIsReceived(path) {
    return new Promise(function (resolve, reject) {
        var pathDataReceived = i.State().firestore.status.requested[path];
        // if data already received, return right away
        if (pathDataReceived) {
            resolve();
        }
        // else, add listener, and wait till store received the data (then return it)
        var listener = function () {
            //pathDataReceived = State(a=>a.firebase.requested[path]);
            pathDataReceived = i.State().firestore.status.requested[path];
            if (pathDataReceived) {
                unsubscribe();
                resolve();
            }
        };
        var unsubscribe = i.store.subscribe(listener);
    });
}
exports.WaitTillPathDataIsReceived = WaitTillPathDataIsReceived;
/*;(function() {
    var Firebase = require("firebase");
    var FirebaseRef = Firebase.database.Reference;

    Firebase.ABORT_TRANSACTION_NOW = {};

    var originalTransaction = FirebaseRef.prototype.transaction;
    FirebaseRef.prototype.transaction = function transaction(updateFunction, onComplete, applyLocally) {
        var aborted, tries = 0, ref = this, updateError;

        var promise = new Promise(function(resolve, reject) {
            var wrappedUpdate = function(data) {
                // Clone data in case updateFunction modifies it before aborting.
                var originalData = JSON.parse(JSON.stringify(data));
                aborted = false;
                try {
                    if (++tries > 100) throw new Error('maxretry');
                    var result = updateFunction.call(this, data);
                    if (result === undefined) {
                        aborted = true;
                        result = originalData;
                    } else if (result === Firebase.ABORT_TRANSACTION_NOW) {
                        aborted = true;
                        result = undefined;
                    }
                    return result;
                } catch (e) {
                    // Firebase propagates exceptions thrown by the update function to the top level.	So
                    // catch them here instead, reject the promise, and abort the transaction by returning
                    // undefined.
                    updateError = e;
                }
            };

            function txn() {
                try {
                    originalTransaction.call(ref, wrappedUpdate, function(error, committed, snapshot) {
                        error = error || updateError;
                        var result;
                        if (error && (error.message === 'set' || error.message === 'disconnect')) {
                            txn();
                        } else if (error) {
                            result = onComplete ? onComplete(error, false, snapshot) : undefined;
                            reject(error);
                        } else {
                            result = onComplete ? onComplete(error, committed && !aborted, snapshot) : undefined;
                            resolve({committed: committed && !aborted, snapshot: snapshot});
                        }
                        return result;
                    }, applyLocally);
                } catch (e) {
                    if (onComplete) onComplete(e, false);
                    reject(e);
                }
            }

            txn();
        });

        return promise;
    };
})();*/
//export function FirebaseConnect<T>(paths: string[]); // just disallow this atm, since you might as well just use a connect/getter func
/*export function FirebaseConnect<T>(pathsOrGetterFunc?: string[] | ((props: T)=>string[]));
export function FirebaseConnect<T>(pathsOrGetterFunc?) {
    return firebaseConnect(props=> {
        let paths =
            pathsOrGetterFunc instanceof Array ? pathsOrGetterFunc :
            pathsOrGetterFunc instanceof Function ? pathsOrGetterFunc(props) :
            [];
        paths = paths.map(a=>DBPath(a)); // add version prefix to paths
        return paths;
    });
}*/
function ApplyDBUpdates(rootPath, dbUpdates) {
    return __awaiter(this, void 0, void 0, function () {
        var _i, _a, _b, localPath, value, updateEntries, _c, path, value, _d, docPath, fieldPathInDoc, docRef, nestedSetHelper, batch, _e, updateEntries_1, _f, path, value, _g, docPath, fieldPathInDoc, docRef, nestedSetHelper;
        return __generator(this, function (_h) {
            switch (_h.label) {
                case 0:
                    dbUpdates = Clone(dbUpdates);
                    if (rootPath != null) {
                        for (_i = 0, _a = dbUpdates.Props(); _i < _a.length; _i++) {
                            _b = _a[_i], localPath = _b.name, value = _b.value;
                            dbUpdates[rootPath + "/" + localPath] = value;
                            delete dbUpdates[localPath];
                        }
                    }
                    updateEntries = Object.entries(dbUpdates);
                    if (!(updateEntries.length == 1)) return [3 /*break*/, 7];
                    _c = updateEntries[0], path = _c[0], value = _c[1];
                    _d = GetPathParts(path, true), docPath = _d[0], fieldPathInDoc = _d[1];
                    value = Clone(value); // picky firestore library demands "simple JSON objects"
                    docRef = i.firestoreDB.doc(docPath);
                    if (!fieldPathInDoc) return [3 /*break*/, 2];
                    value = value != null ? value : i.firebase.firestore.FieldValue.delete();
                    nestedSetHelper = {};
                    i.DeepSet(nestedSetHelper, fieldPathInDoc, value, '.', true);
                    return [4 /*yield*/, docRef.set(nestedSetHelper, { merge: true })];
                case 1:
                    _h.sent();
                    return [3 /*break*/, 6];
                case 2:
                    if (!value) return [3 /*break*/, 4];
                    return [4 /*yield*/, docRef.set(value)];
                case 3:
                    _h.sent();
                    return [3 /*break*/, 6];
                case 4: return [4 /*yield*/, docRef.delete()];
                case 5:
                    _h.sent();
                    _h.label = 6;
                case 6: return [3 /*break*/, 9];
                case 7:
                    batch = i.firestoreDB.batch();
                    for (_e = 0, updateEntries_1 = updateEntries; _e < updateEntries_1.length; _e++) {
                        _f = updateEntries_1[_e], path = _f[0], value = _f[1];
                        _g = GetPathParts(path, true), docPath = _g[0], fieldPathInDoc = _g[1];
                        value = Clone(value); // picky firestore library demands "simple JSON objects"
                        docRef = i.firestoreDB.doc(docPath);
                        if (fieldPathInDoc) {
                            value = value != null ? value : i.firebase.firestore.FieldValue.delete();
                            nestedSetHelper = {};
                            i.DeepSet(nestedSetHelper, fieldPathInDoc, value, '.', true);
                            batch.set(docRef, nestedSetHelper, { merge: true });
                        }
                        else {
                            if (value) {
                                batch.set(docRef, value);
                            }
                            else {
                                batch.delete(docRef);
                            }
                        }
                        /* let path_final = DBPath(path);
                        let dbRef_parent = firestoreDB.doc(path_final.split("/").slice(0, -1).join("/"));
                        let value_final = Clone(value); // clone value, since update() rejects values with a prototype/type
                        batch.update(dbRef_parent, {[path_final.split("/").Last()]: value_final}); */
                    }
                    return [4 /*yield*/, batch.commit()];
                case 8:
                    _h.sent();
                    _h.label = 9;
                case 9: return [2 /*return*/];
            }
        });
    });
}
exports.ApplyDBUpdates = ApplyDBUpdates;
/*function FixSettingPrimitiveValueDirectly(fieldPathInDoc: string, value) {
    if (!looksLikeJsonObject(value) || !isPlainObject(value)) {
        [fieldPathInDoc, value] = [
            fieldPathInDoc.substr(0, fieldPathInDoc.lastIndexOf(".").IfN1Then(fieldPathInDoc.length)),
            {[fieldPathInDoc.split(".").Last()]: value},
        ];
    }
    return [fieldPathInDoc, value];
}

// returns true if should be represented in firestore-db as an "object" type (rather than firestore Date, number, etc.)
let jsonTypes = [Array, Date, g.Timestamp, g.GeoPoint, Blob, g.DocumentKeyReference, g.FieldValueImpl];
function looksLikeJsonObject(input) {
    return (
        typeof input === 'object' &&
        input !== null &&
        !(input instanceof (Array || {} as any) &&
        !(input instanceof (Date || {} as any)) &&
        !(input instanceof (g.Timestamp || {} as any)) &&
        !(input instanceof (g.GeoPoint || {} as any)) &&
        !(input instanceof (Blob || {} as any)) &&
        !(input instanceof (g.DocumentKeyReference || {} as any)) &&
        !(input instanceof (g.FieldValueImpl || {} as any)))
    );
}
function isPlainObject(input) {
    return (
        typeof input === 'object' &&
        input !== null &&
        Object.getPrototypeOf(input) === Object.prototype
    );
}*/ 
//# sourceMappingURL=DatabaseHelpers.js.map