"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var main_1 = require("../../Store/main");
var _NotificationMessage_1 = require("../../Store/main/@NotificationMessage");
var Logging_1 = require("./Logging");
var raven_js_1 = require("raven-js");
var Main_1 = require("Main");
if (!Main_1.hasHotReloaded) {
    //g.onerror = function(message: string, filePath: string, line: number, column: number, error: Error) {
    g.addEventListener("error", function (e) {
        var _a = e, message = _a.message, filePath = _a.filename, line = _a.lineno, column = _a.colno, error = _a.error;
        /*LogError(`JS) ${message} (at ${filePath}:${line}:${column})
    Stack) ${error.stack}`);*/
        // sentry already picks up errors that make it here; so don't send it to sentry again
        if (error != null) {
            HandleError(error, false);
        }
        else {
            HandleError({ stack: filePath + ":" + line + ":" + column, toString: function () { return message; } }, false);
        }
    });
    g.addEventListener("unhandledrejection", function (e) {
        //console.error(`Unhandled rejection (promise: `, e.promise, `, reason: `, e.reason, `).`);
        HandleError(e.reason);
    });
    g.addEventListener("onrejectionhandled", function (e) {
        //console.error(`Unhandled rejection (promise: `, e.promise, `, reason: `, e.reason, `).`);
        HandleError(e.reason);
    });
}
function HandleError(error, recordWithSentry, extraInfo) {
    if (recordWithSentry === void 0) { recordWithSentry = true; }
    if (extraInfo === void 0) { extraInfo = {}; }
    error = error || { message: "[empty error]" };
    var message = (error.message || error.toString()).replace(/\r/g, "").TrimStart("\n");
    /*let stackWithoutMessage = (
        error.stack && error.message && error.stack.Contains(error.message)
            ? error.stack.replace(error.message, "")
            : error.stack || ""
    ).TrimStart("\r", "\n");*/
    var stack = (error.stack || "").replace(/\r/g, "").TrimStart("\n");
    //alert("An error occurred: " + error);
    var errorStr = "";
    if (!message.startsWith("Assert failed) "))
        errorStr += "An error has occurred: ";
    if (!stack.Contains(message))
        errorStr += message;
    errorStr += (errorStr.length ? "\n" : "") + stack;
    Logging_1.LogError(errorStr);
    if (recordWithSentry) {
        /*(()=> {
            // errors that should be shown to user, but not recorded
            if (message.startsWith("KaTeX parse error: ")) return;
            Raven.captureException(error);
        })();*/
        raven_js_1.default.captureException(error, { extra: extraInfo });
    }
    // wait a bit, in case we're in a reducer function (calling dispatch from within a reducer errors)
    setTimeout(function () {
        store.dispatch(new main_1.ACTNotificationMessageAdd(new _NotificationMessage_1.NotificationMessage(errorStr)));
    });
}
exports.HandleError = HandleError;
//# sourceMappingURL=Errors.js.map