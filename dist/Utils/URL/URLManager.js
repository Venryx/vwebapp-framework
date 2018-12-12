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
var main_1 = require("../../Store/main");
var URLs_1 = require("./URLs");
var Store_1 = require("Store");
var js_vextensions_1 = require("js-vextensions");
var firebase_forum_1 = require("firebase-forum");
/*export function GetCrawlerURLStrForMap(mapID: number) {
    let map = GetMap(mapID);
    if (map == null) return mapID.toString();

    let result = map.name.toLowerCase().replace(/[^a-z]/g, "-");
    // need to loop, in some cases, since regex doesn't reprocess "---" as two sets of "--".
    while (result.Contains("--")) {
        result = result.replace(/--/g, "-");
    }
    result = result.TrimStart("-").TrimEnd("-") + "." + map._id.toString();
    return result;
}

export function GetCrawlerURLStrForNode(node: MapNode) {
    let result = GetNodeDisplayText(node).toLowerCase().replace(/[^a-z]/g, "-");
    // need to loop, in some cases, since regex doesn't reprocess "---" as two sets of "--".
    while (result.Contains("--")) {
        result = result.replace(/--/g, "-");
    }
    result = result.TrimStart("-").TrimEnd("-") + "." + node._id.toString();
    return result;
}*/
function GetCurrentURL_SimplifiedForPageViewTracking() {
    //let result = URL.Current();
    var result = GetNewURL(false);
    /*let mapID = GetOpenMapID();
    let onMapPage = result.Normalized().toString({domain: false}).startsWith("/global/map");
    if (mapID && onMapPage) {
        let nodeID = GetFocusedNodeID(mapID);
        let node = nodeID ? GetNode(nodeID) : null;
        //if (result.pathNodes.length == 1) {
        /*if (result.Normalized().toString({domain: false}).startsWith("/global/map") && result.pathNodes.length == 1) {
            result.pathNodes.push("map");
        }*#/
        if (node) {
            result = result.Normalized();
            result.pathNodes.push(GetCrawlerURLStrForNode(node));
        }
}*/
    return result;
}
exports.GetCurrentURL_SimplifiedForPageViewTracking = GetCurrentURL_SimplifiedForPageViewTracking;
// loading
// ==========
var pagesWithSimpleSubpages = ["home", "more", "write"].ToMap(function (page) { return page; }, function () { return null; });
function GetSyncLoadActionsForURL(url, directURLChange) {
    var result = [];
    var page = url.pathNodes[0];
    result.push(new main_1.ACTSetPage(page).VSet({ fromURL: true }));
    var subpage = url.pathNodes[1];
    if (url.pathNodes[1] && page in pagesWithSimpleSubpages) {
        result.push(new main_1.ACTSetSubpage({ page: page, subpage: subpage }).VSet({ fromURL: true }));
    }
    if (url.pathNodes[0] == "forum") {
        var subforumStr = url.pathNodes[1];
        var subforumIDMatch = subforumStr && subforumStr.match(/([0-9]+)$/);
        var subforumID = subforumIDMatch ? subforumIDMatch[1].ToInt() : null;
        result.push(new firebase_forum_1.ACTSubforumSelect({ id: subforumID }));
        var threadStr = url.pathNodes[2];
        var threadIDMatch = threadStr && threadStr.match(/([0-9]+)$/);
        var threadID = threadIDMatch ? threadIDMatch[1].ToInt() : null;
        result.push(new firebase_forum_1.ACTThreadSelect({ id: threadID }));
    }
    return result;
}
exports.GetSyncLoadActionsForURL = GetSyncLoadActionsForURL;
// maybe temp; easier than using the "fromURL" prop, since AddressBarWrapper class currently doesn't have access to the triggering action itself
exports.loadingURL = false;
function LoadURL(urlStr) {
    return __awaiter(this, void 0, void 0, function () {
        var url, syncActions, _i, syncActions_1, action;
        return __generator(this, function (_a) {
            MaybeLog(function (a) { return a.urlLoads; }, function () { return "Loading url: " + urlStr; });
            exports.loadingURL = true;
            url = URLs_1.NormalizeURL(js_vextensions_1.VURL.Parse(urlStr));
            syncActions = GetSyncLoadActionsForURL(url, true);
            for (_i = 0, syncActions_1 = syncActions; _i < syncActions_1.length; _i++) {
                action = syncActions_1[_i];
                store.dispatch(action);
            }
            exports.loadingURL = false;
            return [2 /*return*/];
        });
    });
}
exports.LoadURL = LoadURL;
// saving
// ==========
//g.justChangedURLFromCode = false;
function GetNewURL(includeMapViewStr) {
    //let newURL = URL.Current();
    /*let oldURL = URL.Current(true);
    let newURL = new URL(oldURL.domain, oldURL.pathNodes);*/
    if (includeMapViewStr === void 0) { includeMapViewStr = true; }
    var newURL = new js_vextensions_1.VURL();
    var page = main_1.GetPage();
    newURL.pathNodes.push(page);
    var subpage = main_1.GetSubpage();
    if (page in pagesWithSimpleSubpages) {
        newURL.pathNodes.push(subpage);
    }
    if (page == "forum") {
        var subforumID = firebase_forum_1.GetSelectedSubforumID();
        if (subforumID)
            newURL.pathNodes.push(subforumID + "");
        var threadID = firebase_forum_1.GetSelectedThreadID();
        if (threadID)
            newURL.pathNodes.push(threadID + "");
    }
    if (Store_1.State(function (a) { return a.main.urlExtraStr; })) {
        newURL.SetQueryVar("extra", Store_1.State(function (a) { return a.main.urlExtraStr; }));
    }
    if (!Store_1.State(function (a) { return a.main.analyticsEnabled; }) && newURL.GetQueryVar("analytics") == null) {
        newURL.SetQueryVar("analytics", "false");
    }
    if (Store_1.State(function (a) { return a.main.envOverride; })) {
        newURL.SetQueryVar("env", Store_1.State(function (a) { return a.main.envOverride; }));
    }
    if (Store_1.State(function (a) { return a.main.dbVersionOverride; })) {
        newURL.SetQueryVar("dbVersion", Store_1.State(function (a) { return a.main.dbVersionOverride; }));
    }
    // a default-child is only used (ie. removed from url) if there are no path-nodes after it
    if (subpage && subpage == URLs_1.rootPageDefaultChilds[page] && newURL.pathNodes.length == 2)
        newURL.pathNodes.length = 1;
    if (page == "home" && newURL.pathNodes.length == 1)
        newURL.pathNodes.length = 0;
    Assert(!newURL.pathNodes.Any(function (a) { return a == "/"; }), "A path-node cannot be just \"/\". @url(" + newURL + ")");
    return newURL;
}
exports.GetNewURL = GetNewURL;
//# sourceMappingURL=URLManager.js.map