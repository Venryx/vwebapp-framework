"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var redux_1 = require("redux");
function CombineReducers() {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    var getInitialState, reducerMap;
    if (args.length == 1)
        reducerMap = args[0];
    else
        getInitialState = args[0], reducerMap = args[1];
    if (getInitialState) {
        var reducer_1 = redux_1.combineReducers(reducerMap);
        return function (state, action) {
            if (state === void 0) { state = getInitialState(); }
            //return (state = getInitialState().VAct(a=>Object.setPrototypeOf(a, Object.getPrototypeOf({}))), action)=> {
            //return (state, action)=> {
            /*state = state || getInitialState().VAct(a=>Object.setPrototypeOf(a, Object.getPrototypeOf({})));
            Assert(Object.getPrototypeOf(state) == Object.getPrototypeOf({}));*/
            // combineReducers is picky; it requires it be passed a plain object; thus, we oblige ;-(
            Object.setPrototypeOf(state, Object.getPrototypeOf({}));
            return reducer_1(state, action);
        };
    }
    return redux_1.combineReducers(reducerMap);
}
exports.CombineReducers = CombineReducers;
// use a singleton for empty-obj and empty-array (that way VCache and other shallow-compare systems work with them)
exports.emptyObj = {};
exports.emptyArray = [];
exports.emptyArray_forLoading = [];
//# sourceMappingURL=ReducerUtils.js.map