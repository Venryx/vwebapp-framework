"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var js_vextensions_1 = require("js-vextensions");
exports.rootPages = [
    "users", "feedback", "forum", "more",
    "home",
    "tools",
];
// a default-child is only used (ie. removed from url) if there are no path-nodes after it
exports.rootPageDefaultChilds = {
    more: "links",
    home: "home",
    tools: "waves",
};
function GetCurrentURL(fromAddressBar) {
    if (fromAddressBar === void 0) { fromAddressBar = false; }
    var State = require("Store").State;
    return fromAddressBar ? js_vextensions_1.VURL.Parse(js_vextensions_1.GetCurrentURLString()) : js_vextensions_1.VURL.FromState(State("router"));
}
exports.GetCurrentURL = GetCurrentURL;
function NormalizeURL(url) {
    var result = url.Clone();
    if (!exports.rootPages.Contains(result.pathNodes[0])) {
        result.pathNodes.Insert(0, "home");
    }
    if (result.pathNodes[1] == null && exports.rootPageDefaultChilds[result.pathNodes[0]]) {
        result.pathNodes.Insert(1, exports.rootPageDefaultChilds[result.pathNodes[0]]);
    }
    return result;
}
exports.NormalizeURL = NormalizeURL;
//# sourceMappingURL=URLs.js.map