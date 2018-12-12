"use strict";
//import ReactInstrumentation from "react-dom/lib/ReactInstrumentation";
Object.defineProperty(exports, "__esModule", { value: true });
// disable react-dev-tools for this project
g.disableReactDevTools = 0;
if (g.disableReactDevTools && typeof g.__REACT_DEVTOOLS_GLOBAL_HOOK__ === "object") {
    console.log("Disabling React dev-tools.");
    //g.__REACT_DEVTOOLS_GLOBAL_HOOK__.inject = ()=>{};
    for (var _i = 0, _a = Object.entries(g.__REACT_DEVTOOLS_GLOBAL_HOOK__); _i < _a.length; _i++) {
        var _b = _a[_i], key = _b[0], value = _b[1];
        g.__REACT_DEVTOOLS_GLOBAL_HOOK__[key] = typeof value == "function" ? function () { } : null;
    }
    // fixes error in react-three-renderer (however, I think it also causes React dev-tools to not show the library's custom-components)
    /*let dn = ()=>{};
    ReactInstrumentation.debugTool = {
        removeHook: dn, onSetChildren: dn, onHostOperation: dn, addHook: dn, onBeginFlush: dn, onEndFlush: dn,
        onBeginLifeCycleTimer: dn, onEndLifeCycleTimer: dn, onBeforeMountComponent: dn, onMountComponent: dn,
    };*/
    /*for (let key of Object.keys(ReactInstrumentation.debugTool)) {
        ReactInstrumentation.debugTool[key] = ()=>{};
    }*/
}
//import JQuery from "../JQuery/JQuery3.1.0";
var react_1 = require("react");
//import Self from "./Start_1";
G({ React: react_1.default }); //declare global { const React; }
//# sourceMappingURL=Start_1.js.map