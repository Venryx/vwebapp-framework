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
var URLManager_1 = require("../URL/URLManager");
var DatabaseHelpers_1 = require("../Database/DatabaseHelpers");
var index_1 = require("../../Store/index");
var react_ga_1 = require("react-ga");
var URLs_1 = require("../URL/URLs");
var raven_js_1 = require("raven-js");
var redux_little_router_1 = require("redux-little-router");
var StringSplitCache_1 = require("Utils/Database/StringSplitCache");
var DatabaseHelpers_2 = require("Utils/Database/DatabaseHelpers");
var firebase_1 = require("../../Store/firebase");
var Main_1 = require("Main");
// use this to intercept dispatches (for debugging)
/*let oldDispatch = store.dispatch;
store.dispatch = function(...args) {
    if (GetTimeSinceLoad() > 5)
        debugger;
    oldDispatch.apply(this, args);
};*/
var lastPath = "";
//export function ProcessAction(action: Action<any>, newState: RootState, oldState: RootState) {
// only use this if you actually need to change the action-data before it gets dispatched/applied (otherwise use [Mid/Post]DispatchAction)
function PreDispatchAction(action) {
    if (action.type == "@@reactReduxFirebase/SET") {
        if (action["data"]) {
            action["data"] = DatabaseHelpers_1.ProcessDBData(action["data"], true, true, StringSplitCache_1.SplitStringBySlash_Cached(action["path"]).Last());
        }
        else {
            // don't add the property to the store, if it is just null anyway (this makes it consistent with how firebase returns the whole db-state)
            delete action["data"];
        }
    }
    if (action.type == "@@reduxFirestore/LISTENER_RESPONSE" || action.type == "@@reduxFirestore/DOCUMENT_ADDED" || action.type == "@@reduxFirestore/DOCUMENT_MODIFIED") {
        if (action.payload.data) {
            // "subcollections" prop currently bugged in some cases, so just use new "path" prop when available
            var path = action["meta"].path || DatabaseHelpers_2.ListenerPathToPath(action["meta"]);
            action.payload.data = DatabaseHelpers_1.ProcessDBData(action.payload.data, true, true, StringSplitCache_1.SplitStringBySlash_Cached(path).Last());
        } /*else {
            // don't add the property to the store, if it is just null anyway (this makes it consistent with how firebase returns the whole db-state)
            delete action.payload.data;
        }*/
    }
    /*if (g.actionStacks || (DEV && !actionStacks_actionTypeIgnorePatterns.Any(a=>action.type.startsWith(a)))) {
        action["stack"] = new Error().stack.split("\n").slice(1); // add stack, so we can inspect in redux-devtools
    }*/
}
exports.PreDispatchAction = PreDispatchAction;
/*const actionStacks_actionTypeIgnorePatterns = [
    "@@reactReduxFirebase/", // ignore redux actions
];*/
function MidDispatchAction(action, newState) {
}
exports.MidDispatchAction = MidDispatchAction;
function DoesURLChangeCountAsPageChange(oldURL, newURL, directURLChange) {
    if (oldURL == null)
        return true;
    if (oldURL.PathStr() != newURL.PathStr())
        return true;
    /*let oldSyncLoadActions = GetSyncLoadActionsForURL(oldURL, directURLChange);
    let oldMapViewMergeAction = oldSyncLoadActions.find(a=>a.Is(ACTMapViewMerge));
    
    let newSyncLoadActions = GetSyncLoadActionsForURL(newURL, directURLChange);
    let newMapViewMergeAction = newSyncLoadActions.find(a=>a.Is(ACTMapViewMerge));

    let oldViewStr = oldURL.GetQueryVar("view");
    let oldURLWasTemp = oldViewStr == "";
    if (newMapViewMergeAction != oldMapViewMergeAction && !oldURLWasTemp) {
        //let oldFocused = GetFocusedNodePath(GetMapView(mapViewMergeAction.payload.mapID));
        let oldFocused = oldMapViewMergeAction ? GetFocusedNodePath(oldMapViewMergeAction.payload.mapView) : null;
        let newFocused = newMapViewMergeAction ? GetFocusedNodePath(newMapViewMergeAction.payload.mapView) : null;
        if (newFocused != oldFocused) return true;
    }
    return false;*/
}
exports.DoesURLChangeCountAsPageChange = DoesURLChangeCountAsPageChange;
function RecordPageView(url) {
    //let url = window.location.pathname;
    if (react_ga_1.default["initialized"]) {
        react_ga_1.default.set({ page: url.toString({ domain: false }) });
        react_ga_1.default.pageview(url.toString({ domain: false }) || "/");
    }
    MaybeLog(function (a) { return a.pageViews; }, function () { return "Page-view: " + url; });
}
exports.RecordPageView = RecordPageView;
var postInitCalled = false;
var pageViewTracker_lastURL;
function PostDispatchAction(action) {
    return __awaiter(this, void 0, void 0, function () {
        var url, simpleURL, userID, joinDate;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!postInitCalled) {
                        PostInit();
                        postInitCalled = true;
                    }
                    url = URLs_1.GetCurrentURL();
                    simpleURL = URLManager_1.GetCurrentURL_SimplifiedForPageViewTracking();
                    if (DoesURLChangeCountAsPageChange(pageViewTracker_lastURL, simpleURL, true)) {
                        pageViewTracker_lastURL = simpleURL;
                        RecordPageView(simpleURL);
                    }
                    //if (action.type == "@@INIT") {
                    //if (action.type == "persist/REHYDRATE" && GetPath().startsWith("global/map"))
                    if (action.type == "persist/REHYDRATE") {
                        store.dispatch({ type: "PostRehydrate" }); // todo: ms this also gets triggered when there is no saved-state (ie, first load)
                    }
                    if (action.type == "PostRehydrate") {
                        if (!Main_1.hasHotReloaded) {
                            URLManager_1.LoadURL(startURL.toString());
                        }
                        //UpdateURL(false);
                        if (Main_1.prodEnv && index_1.State("main", "analyticsEnabled")) {
                            Log("Initialized Google Analytics.");
                            //ReactGA.initialize("UA-21256330-34", {debug: true});
                            react_ga_1.default.initialize("UA-21256330-34");
                            react_ga_1.default["initialized"] = true;
                            /*let url = VURL.FromState(State().router).toString(false);
                            ReactGA.set({page: url});
                            ReactGA.pageview(url || "/");*/
                        }
                    }
                    if (!(action.type == redux_little_router_1.LOCATION_CHANGED)) return [3 /*break*/, 2];
                    if (!!action.payload.byCode) return [3 /*break*/, 2];
                    //setTimeout(()=>UpdateURL());
                    return [4 /*yield*/, URLManager_1.LoadURL(url.toString())];
                case 1:
                    //setTimeout(()=>UpdateURL());
                    _a.sent();
                    //UpdateURL(false);
                    if (url.toString({ domain: false }).startsWith("/global/map")) {
                        if (isBot) {
                            /*let newURL = url.Clone();
                            let node = await GetNodeAsync(nodeID);
                            let node = await GetNodeAsync(nodeID);
                            newURL.pathNodes[1] = "";
                            store.dispatch(replace(newURL.toString(false)));*/
                        }
                        else {
                            // we don't yet have a good way of knowing when loading is fully done; so just do a timeout
                            /*WaitXThenRun(0, UpdateURL, 200);
                            WaitXThenRun(0, UpdateURL, 400);
                            WaitXThenRun(0, UpdateURL, 800);
                            WaitXThenRun(0, UpdateURL, 1600);*/
                        }
                    }
                    _a.label = 2;
                case 2:
                    if (!(action.type == "@@reactReduxFirebase/LOGIN")) return [3 /*break*/, 4];
                    userID = action["auth"].uid;
                    return [4 /*yield*/, DatabaseHelpers_1.GetDataAsync("userExtras", userID, ".joinDate")];
                case 3:
                    joinDate = _a.sent();
                    if (joinDate == null) {
                        /*let firebase = store.firebase.helpers;
                        firebase.DBRef(`userExtras/${userID}`).update({
                            permissionGroups: {basic: true, verified: true, mod: false, admin: false},
                            joinDate: Date.now(),
                        });*/
                        firestoreDB.doc(DatabaseHelpers_1.DBPath("userExtras/" + userID)).set({
                            permissionGroups: { basic: true, verified: true, mod: false, admin: false },
                            joinDate: Date.now(),
                        }, { merge: true });
                    }
                    _a.label = 4;
                case 4: return [2 /*return*/];
            }
        });
    });
}
exports.PostDispatchAction = PostDispatchAction;
function PostInit() {
    var lastAuth;
    //Log("Subscribed");
    store.subscribe(function () {
        var auth = firebase_1.GetAuth();
        if (DatabaseHelpers_2.IsAuthValid(auth) && auth != lastAuth) {
            //Log("Setting user-context: " + auth);
            //Raven.setUserContext(auth);
            raven_js_1.default.setUserContext(auth.Including("uid", "displayName", "email", "photoURL"));
            lastAuth = auth;
        }
    });
}
//# sourceMappingURL=ActionProcessor.js.map