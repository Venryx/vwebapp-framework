"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var Globals_Free_1 = require("./Globals_Free");
var js_vextensions_1 = require("js-vextensions");
/*var Debug = true;

var Log = function(msg, type = 'default') { if(!Debug) return;
 var colorString = '';
 switch(type) { case 'error': colorString = '\x1b[91m';
 break;
 case 'warning': colorString = '\x1b[93m';
 break;
 case 'default': default: colorString = '\x1b[0m';
 break;
 } var spaceString = Array(7 - process.pid.toString().length).join(' ');
 console.log(colorString, process.pid + '' + spaceString + msg + '\x1b[0m');
};*/
/*console.log_orig = console.log;
console.log = function(message) {
    var str = message + "";
    if (str.Contains("blacklist pattern [")) return; // disable smooth-scroller extension's message
    console.log_orig.apply(this, arguments);
};*/
var warn_orig = console.warn;
console.warn = function () {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    //var str = message + "";
    if (typeof args[2] == "string" && args[2].includes("do not mix longhand and shorthand properties in the same style object"))
        return;
    if (typeof args[0] == "string" && args[0].includes("a promise was created in a handler but was not returned from it, see http://goo.gl/rRqMUw"))
        return;
    warn_orig.apply(this, args);
};
var error_orig = console.error;
console.error = function (exception) {
    var str = exception + "";
    if (str.Contains('Warning: A component is `contentEditable`'))
        return;
    //if (str.Contains("Warning: Unknown prop `")) return;
    error_orig.apply(this, arguments);
    //LogSourceStackTraceFrom(new Error());
};
// fix for that console.table doesn't seem to be working (as used by react-addons-perf)
//console.table = function() { console.log.apply(this, arguments); };
var LogTypes = /** @class */ (function () {
    function LogTypes() {
        this.nodeRenders = false;
        this.nodeRenders_for = null;
        this.nodeRenderDetails = false;
        this.nodeRenderDetails_for = null;
        this.pageViews = false;
        this.urlLoads = false;
        this.cacheUpdates = false;
        this.commands = false;
    }
    LogTypes = __decorate([
        Globals_Free_1.Global
    ], LogTypes);
    return LogTypes;
}());
exports.LogTypes = LogTypes;
g.logTypes = new LogTypes();
if (localStorage.getItem("logTypes")) {
    g.logTypes = JSON.parse(localStorage.getItem("logTypes"));
}
g.addEventListener("beforeunload", function () {
    localStorage.setItem("logTypes", JSON.stringify(logTypes));
});
G({ ShouldLog: ShouldLog });
function ShouldLog(shouldLogFunc) {
    return shouldLogFunc(g.logTypes || {});
}
G({ MaybeLog: MaybeLog });
function MaybeLog(shouldLogFunc, logMessageGetter) {
    if (!ShouldLog(shouldLogFunc))
        return;
    Log(logMessageGetter());
}
exports.onLogFuncs = [];
//declare global { function Log(...args); } G({Log});
G({ Log: Log });
function Log(message, appendStackTrace, logLater) {
    // #mms: add-stack-trace-and-current-call-info-to-logs setting exists
    if (appendStackTrace === void 0) { appendStackTrace = false; }
    if (logLater === void 0) { logLater = false; }
    var finalMessage = message;
    if (appendStackTrace) {
        /*if (inUnity)
            finalMessage += "\n\nStackTrace) " + new Error().Stack;
        else*/
        finalMessage += "\n@" + js_vextensions_1.GetStackTraceStr();
    }
    console.log(finalMessage);
    for (var _i = 0, onLogFuncs_1 = exports.onLogFuncs; _i < onLogFuncs_1.length; _i++) {
        var onLogFunc = onLogFuncs_1[_i];
        onLogFunc(message, appendStackTrace, logLater);
    }
    return message;
}
exports.Log = Log;
G({ LogLater: LogLater });
function LogLater(message, appendStackTrace) {
    if (appendStackTrace === void 0) { appendStackTrace = false; }
    Log(message, appendStackTrace, true);
}
exports.LogLater = LogLater;
G({ LogWarning: LogWarning });
function LogWarning(message, appendStackTrace, logLater) {
    if (appendStackTrace === void 0) { appendStackTrace = false; }
    if (logLater === void 0) { logLater = false; }
    console.warn("LogWarning) " + message);
    return message;
}
exports.LogWarning = LogWarning;
G({ LogError: LogError });
function LogError(message, appendStackTrace, logLater) {
    if (appendStackTrace === void 0) { appendStackTrace = false; }
    if (logLater === void 0) { logLater = false; }
    console.error("LogError) " + message);
    return message;
}
exports.LogError = LogError;
//# sourceMappingURL=Logging.js.map