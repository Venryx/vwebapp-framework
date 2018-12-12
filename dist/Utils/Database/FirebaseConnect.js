"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var firebase_1 = require("firebase");
var StringSplitCache_1 = require("Utils/Database/StringSplitCache");
var react_redux_1 = require("react-redux");
var react_vextensions_1 = require("react-vextensions");
var firestore_1 = require("redux-firestore/es/actions/firestore");
var users_1 = require("Store/firebase/users");
var users_2 = require("../../Store/firebase/users");
var index_1 = require("../../Store/index");
var DatabaseHelpers_1 = require("./DatabaseHelpers");
var firebase = firebase_1.default;
// todo: rename to FirestoreConnect
// Place a selector in Connect() whenever it uses data that:
// 1) might change during the component's lifetime, and:
// 2) is not already used by an existing selector in Connect()
// This way, it'll correctly trigger a re-render when the underlying data changes.
G({ FirebaseConnect: Connect }); // make global, for firebase-forum
function Connect(funcOrFuncGetter) {
    var mapStateToProps_inner, mapStateToProps_inner_getter;
    var isFuncGetter = funcOrFuncGetter.length == 0; //&& typeof TryCall(funcOrFuncGetter) == "function";
    if (!isFuncGetter)
        mapStateToProps_inner = funcOrFuncGetter;
    else
        mapStateToProps_inner_getter = funcOrFuncGetter;
    var mapStateToProps_wrapper = function (state, props) {
        var s = this;
        g.inConnectFunc = true;
        ClearRequestedPaths();
        ClearAccessedPaths();
        //Assert(GetAccessedPaths().length == 0, "Accessed-path must be empty at start of mapStateToProps call (ie. the code in Connect()).");
        //let firebase = state.firebase;
        //let firebase = props["firebase"];
        //let firebase = store.firebase;
        var firestore = store.firestore;
        var changedPath = null;
        var storeDataChanged = false;
        if (s.lastAccessedStorePaths_withData == null) {
            storeDataChanged = true;
        }
        else {
            for (var path in s.lastAccessedStorePaths_withData) {
                if (index_1.State.apply(void 0, [{ countAsAccess: false }].concat(StringSplitCache_1.SplitStringBySlash_Cached(path))) !== s.lastAccessedStorePaths_withData[path]) {
                    //store.dispatch({type: "Data changed!" + path});
                    storeDataChanged = true;
                    changedPath = path;
                    break;
                }
            }
        }
        //let propsChanged = ShallowChanged(props, s.lastProps || {});
        var propsChanged = react_vextensions_1.ShallowChanged(props, s.lastProps || {}, "children");
        //let result = storeDataChanged ? mapStateToProps_inner(state, props) : s.lastResult;
        if (!storeDataChanged && !propsChanged) {
            g.inConnectFunc = false;
            return s.lastResult;
        }
        //let result = mapStateToProps_inner.call(s, state, props);
        // for debugging in profiler
        //let debugText = ToJSON(props).replace(/[^a-zA-Z0-9]/g, "_");
        var debugText = (props["node"] ? " @ID:" + props["node"]._id : "") + " @changedPath: " + changedPath;
        var wrapperFunc = eval("(function " + debugText.replace(/[^a-zA-Z0-9]/g, "_") + "() { return mapStateToProps_inner.apply(s, arguments); })");
        var result = wrapperFunc.call(s, state, props);
        // also access some other paths here, so that when they change, they trigger ui updates for everything
        result._user = users_2.GetUser(users_1.GetUserID());
        result._permissions = users_2.GetUserPermissionGroups(users_1.GetUserID());
        var oldRequestedPaths = s.lastRequestedPaths || [];
        var requestedPaths = GetRequestedPaths();
        //if (firebase._ && ShallowChanged(requestedPaths, oldRequestedPaths)) {
        if (react_vextensions_1.ShallowChanged(requestedPaths, oldRequestedPaths)) {
            g.setImmediate(function () {
                //s.lastEvents = getEventsFromInput(requestedPaths.map(path=>GetPathParts(path)[0]));
                var removedPaths = oldRequestedPaths.Except.apply(oldRequestedPaths, requestedPaths);
                // todo: find correct way of unwatching events; the way below seems to sometimes unwatch while still needed watched
                // for now, we just never unwatch
                //unWatchEvents(store.firebase, DispatchDBAction, getEventsFromInput(removedPaths));
                //store.firestore.unsetListeners(removedPaths.map(path=>GetPathParts(path)[0]));
                var removedPaths_toDocs = removedPaths.map(function (path) { return DatabaseHelpers_1.GetPathParts(path)[0]; });
                var removedPaths_toDocs_asListenerPaths = removedPaths_toDocs.map(function (path) { return DatabaseHelpers_1.PathToListenerPath(path); });
                //store.firestore.unsetListeners(removedPaths_toDocs_asListenerPaths);
                firestore_1.unsetListeners(firebase.firebase_ || firebase, DispatchDBAction, removedPaths_toDocs_asListenerPaths);
                var addedPaths = requestedPaths.Except.apply(requestedPaths, oldRequestedPaths);
                var addedPaths_toDocs = addedPaths.map(function (path) { return DatabaseHelpers_1.GetPathParts(path)[0]; });
                var addedPaths_toDocs_asListenerPaths = addedPaths_toDocs.map(function (path) { return DatabaseHelpers_1.PathToListenerPath(path); });
                //watchEvents(store.firebase, DispatchDBAction, getEventsFromInput(addedPaths.map(path=>GetPathParts(path)[0])));
                // for debugging, you can check currently-watched-paths using: store.firestore._.listeners
                //store.firestore.setListeners(addedPaths_toDocs_asListenerPaths);
                firestore_1.setListeners(firebase.firebase_ || firebase, DispatchDBAction, addedPaths_toDocs_asListenerPaths);
                Log("Requesting paths: " + addedPaths.join(","));
            });
            s.lastRequestedPaths = requestedPaths;
        }
        var accessedStorePaths = GetAccessedPaths();
        //ClearAccessedPaths();
        s.lastAccessedStorePaths_withData = {};
        for (var _i = 0, accessedStorePaths_1 = accessedStorePaths; _i < accessedStorePaths_1.length; _i++) {
            var path = accessedStorePaths_1[_i];
            s.lastAccessedStorePaths_withData[path] = index_1.State.apply(void 0, [{ countAsAccess: false }].concat(StringSplitCache_1.SplitStringBySlash_Cached(path)));
        }
        s.lastProps = props;
        s.lastResult = result;
        g.inConnectFunc = false;
        return result;
    };
    if (mapStateToProps_inner) {
        return react_redux_1.connect(mapStateToProps_wrapper, null, null, { withRef: true }); // {withRef: true} lets you do wrapperComp.getWrappedInstance() 
    }
    return react_redux_1.connect(function () {
        mapStateToProps_inner = mapStateToProps_inner_getter();
        return mapStateToProps_wrapper;
    }, null, null, { withRef: true });
}
exports.Connect = Connect;
exports.pathListenerCounts = {};
function SetListeners(paths) {
    for (var _i = 0, paths_1 = paths; _i < paths_1.length; _i++) {
        var path = paths_1[_i];
        var oldListenerCount = exports.pathListenerCounts[path] || 0;
        exports.pathListenerCounts[path] = oldListenerCount + 1;
        if (oldListenerCount > 0)
            continue;
        // for debugging, you can check currently-watched-paths using: store.firestore._.listeners
        var listenerPath = DatabaseHelpers_1.PathToListenerPath(path);
        store.firestore.setListener(listenerPath);
    }
}
exports.SetListeners = SetListeners;
function UnsetListeners(paths) {
    for (var _i = 0, paths_2 = paths; _i < paths_2.length; _i++) {
        var path = paths_2[_i];
        var listenerPath = DatabaseHelpers_1.PathToListenerPath(path);
        exports.pathListenerCounts[path]--;
        if (exports.pathListenerCounts[path] == 0) {
            store.firestore.unsetListener(listenerPath);
        }
    }
}
exports.UnsetListeners = UnsetListeners;
var actionTypeBufferInfos = {
    "@@reactReduxFirebase/START": { time: 300 },
    "@@reactReduxFirebase/SET": { time: 300 },
};
var actionTypeLastDispatchTimes = {};
var actionTypeBufferedActions = {};
function DispatchDBAction(action) {
    var timeSinceLastDispatch = Date.now() - (actionTypeLastDispatchTimes[action.type] || 0);
    var bufferInfo = actionTypeBufferInfos[action.type];
    // if we're not supposed to buffer this action type, or it's been long enough since last dispatch of this type
    if (bufferInfo == null || timeSinceLastDispatch >= bufferInfo.time) {
        // dispatch action right away
        store.dispatch(action);
        actionTypeLastDispatchTimes[action.type] = Date.now();
    }
    // else, buffer action to be dispatched later
    else {
        // if timer not started, start it now
        if (actionTypeBufferedActions[action.type] == null) {
            setTimeout(function () {
                // now that wait is over, apply any buffered event-triggers
                var combinedAction = { type: "ApplyActionSet", actions: actionTypeBufferedActions[action.type] };
                store.dispatch(combinedAction);
                actionTypeLastDispatchTimes[action.type] = Date.now();
                actionTypeBufferedActions[action.type] = null;
            }, (actionTypeLastDispatchTimes[action.type] + bufferInfo.time) - Date.now());
        }
        // add action to buffer, to be run when timer ends
        actionTypeBufferedActions[action.type] = (actionTypeBufferedActions[action.type] || []).concat(action);
    }
}
var requestedPaths = {};
/** This only adds paths to a "request list". Connect() is in charge of making the actual db requests. */
function RequestPath(path) {
    //Log("Requesting Stage1: " + path);
    requestedPaths[path] = true;
}
exports.RequestPath = RequestPath;
/** This only adds paths to a "request list". Connect() is in charge of making the actual db requests. */
function RequestPaths(paths) {
    for (var _i = 0, paths_3 = paths; _i < paths_3.length; _i++) {
        var path = paths_3[_i];
        RequestPath(path);
    }
}
exports.RequestPaths = RequestPaths;
function ClearRequestedPaths() {
    requestedPaths = {};
}
exports.ClearRequestedPaths = ClearRequestedPaths;
function GetRequestedPaths() {
    return requestedPaths.VKeys();
}
exports.GetRequestedPaths = GetRequestedPaths;
var accessedStorePaths = {};
function OnAccessPath(path) {
    //Log("Accessing-path Stage1: " + path);
    //let path = pathSegments.join("/");
    accessedStorePaths[path] = true;
}
exports.OnAccessPath = OnAccessPath;
/*export function OnAccessPaths(paths: string[]) {
    for (let path of paths)
        OnAccessPath(path);
}*/
function ClearAccessedPaths() {
    accessedStorePaths = {};
}
exports.ClearAccessedPaths = ClearAccessedPaths;
function GetAccessedPaths() {
    //Log("GetAccessedPaths:" + accessedStorePaths.VKeys());
    return accessedStorePaths.VKeys();
}
exports.GetAccessedPaths = GetAccessedPaths;
//# sourceMappingURL=FirebaseConnect.js.map