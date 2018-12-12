"use strict";
// class/function tags
// ==========
Object.defineProperty(exports, "__esModule", { value: true });
/*export function Global(...args) {
    if (!(args[0] instanceof Function)) { // if decorator's being early-called, to provide args
        var [receiveClassFunc] = args;
        return (...args2)=> {
            var [target] = args2;
            receiveClassFunc(target);
            Global(...args2);
        };
    }

    var [target] = args as [Function];

    var name = target.GetName();
    //console.log("Globalizing: " + name);
    g[name] = target;
}*/
function Global(target) {
    var name = target.GetName();
    //console.log("Globalizing: " + name);
    g[name] = target;
}
exports.Global = Global;
function Grab(grabFunc) {
    return function (target) { return grabFunc(target); };
}
exports.Grab = Grab;
/*export function SimpleShouldUpdate(target) {
    target.prototype.shouldComponentUpdate = function(newProps, newState) {
        return ShallowCompare(this, newProps, newState);
        /*var result = ShallowCompare(this, newProps, newState);
        Log(result + ";" + g.ToJSON(this.props) + ";" + g.ToJSON(newProps));
        return result;*#/
    }
}*/
// polyfills for constants
// ==========
if (Number.MIN_SAFE_INTEGER == null)
    Number.MIN_SAFE_INTEGER = -9007199254740991;
if (Number.MAX_SAFE_INTEGER == null)
    Number.MAX_SAFE_INTEGER = 9007199254740991;
//function Break() { debugger; };
function Debugger() {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    debugger;
}
exports.Debugger = Debugger;
function Debugger_Wrap(arg1) {
    var args = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        args[_i - 1] = arguments[_i];
    }
    debugger;
    return arg1;
}
exports.Debugger_Wrap = Debugger_Wrap;
function Debugger_True() {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    debugger;
    return true;
}
exports.Debugger_True = Debugger_True;
function Debugger_If(condition) {
    var args = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        args[_i - 1] = arguments[_i];
    }
    if (condition)
        debugger;
}
exports.Debugger_If = Debugger_If;
function WrapWithDebugger(func) {
    var args = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        args[_i - 1] = arguments[_i];
    }
    return function () {
        debugger;
        func.apply(this, arguments);
    };
}
exports.WrapWithDebugger = WrapWithDebugger;
G({ Debugger: Debugger, Debugger_Wrap: Debugger_Wrap, Debugger_True: Debugger_True, Debugger_If: Debugger_If, WrapWithDebugger: WrapWithDebugger });
//var quickIncrementValues = {};
//export function QuickIncrement(name = new Error().stack.split("\n")[2]) { // this doesn't always work, fsr
function QuickIncrement(name) {
    if (name === void 0) { name = "default"; }
    QuickIncrement["values"][name] = (QuickIncrement["values"][name] | 0) + 1;
    return QuickIncrement["values"][name];
}
exports.QuickIncrement = QuickIncrement;
QuickIncrement["values"] = [];
G({ QuickIncrement: QuickIncrement });
// general
// ==========
/*G({E}); declare global { function E(...objExtends: any[]); }
export function E(...objExtends: any[]) {
    var result = {} as any;
    for (var extend of objExtends)
        result.Extend(extend);
    return result;
    //return StyleSheet.create(result);
}*/
G({ E: E });
function E(e1, e2, e3, e4, e5, e6, e7, e8) {
    var result = {};
    for (var _i = 0, arguments_1 = arguments; _i < arguments_1.length; _i++) {
        var extend = arguments_1[_i];
        result.Extend(extend);
    }
    return result;
    //return StyleSheet.create(result);
}
exports.E = E;
var eo = {};
G({ eo: eo });
// methods: url writing/parsing
// ==================
exports.inFirefox = navigator.userAgent.toLowerCase().includes("firefox");
// others
// ==================
/*export var inTestMode = true; //GetUrlVars(CurrentUrl()).inTestMode == "true";
export function InTestMode() { return inTestMode; }*/
exports.blockCSCalls = false;
exports.loadTime = Date.now();
/*setTimeout(()=> {
    $(()=> {
        loadTime = Date.now();
    });
});*/
function GetTimeSinceLoad() {
    return (Date.now() - exports.loadTime) / 1000;
}
exports.GetTimeSinceLoad = GetTimeSinceLoad;
//window.evalOld = window.eval;
//window.eval = function() { try { evalOld.apply(this, arguments); } catch(error) { Log("JS error: " + error); }};
/*window.evalOld = eval;
window.eval = function(code) {
    if (true) { //new Error().stack.Contains("Packages/VDF")) //!code.Contains(";") && code != "CallCS_Callback")
        window.lastSpecialEvalExpression = code;
        window.lastSpecialEvalStack = new Error().stack;
        //window.evalStacks = window.evalStacks || [];
        //window.evalStacks.push(new Error().stack);
        window.evalExpressionsStr += code + "\n";
        window.evalStacksStr += new Error().stack + "\n";
    }
    return evalOld.apply(this, arguments);
};*/
/*export function EStrToInt(eStr: string) {
    return parseInt(eStr.substr(1));
}
export function IntToEStr(int: number) {
    return "e" + int;
}*/
// another way to require at runtime -- with full paths
//g.RequireTest = (require as any).context("../../", true, /\.tsx?$/);
function $Simple(queryStr) {
    return [].slice.call(document.querySelectorAll(queryStr));
}
exports.$Simple = $Simple;
function CopyText(text) {
    /*
    //var note = $(`<input type="text">`).appendTo("body");
    var note = document.createElement("textarea");
    document.body.appendChild(note);
    note.innerHTML = text;

    note.focus();
    var range = document.createRange();
    range.setStart(note, 0);
    range.setEnd(note, 1);
    //range.setEnd(note2, 0);

    //range.setEnd(e("notesEnder"), 0); // adds one extra new-line; that's okay, right?
    var sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);

    document.execCommand("copy");*/
    document.oncopy = function (event) {
        event.clipboardData.setData("text/plain", text);
        event.preventDefault();
        document.oncopy = null;
    };
    document.execCommand("copy", false, null);
}
exports.CopyText = CopyText;
function GetRandomNumber(options) {
    var min = options.min, max = options.max, mustBeInteger = options.mustBeInteger;
    /*Assert(IsNumber(min), `Min must be a number. (not: ${min})`);
    Assert(IsNumber(max), `Max must be a number. (not: ${max})`);*/
    var range = max - min;
    if (options.mustBeInteger)
        return min + Math.floor(Math.random() * (range + 1));
    return min + (Math.random() * range);
}
exports.GetRandomNumber = GetRandomNumber;
//# sourceMappingURL=Globals_Free.js.map