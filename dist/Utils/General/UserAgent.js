"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ua_parser_js_1 = require("ua-parser-js");
//export const supportedBrowsers = ["Chrome", "Firefox", "Safari", "Chrome WebView", "Mobile Safari", "Edge"];
exports.supportedBrowsers = ["Chrome", "Firefox", "Safari", "Chrome WebView", "Mobile Safari"];
var parser = new ua_parser_js_1.UAParser();
function GetBrowser() {
    return parser.getBrowser();
}
exports.GetBrowser = GetBrowser;
/*export function GetBrowserName(): BrowserName {
    return parser.getBrowser().name;
}
export function GetBrowserVersion(): string {
    return parser.getBrowser().version;
}*/ 
//# sourceMappingURL=UserAgent.js.map