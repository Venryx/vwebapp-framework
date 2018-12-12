"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) if (e.indexOf(p[i]) < 0)
            t[p[i]] = s[p[i]];
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_vextensions_1 = require("react-vextensions");
var redux_little_router_1 = require("redux-little-router");
var FirebaseConnect_1 = require("../Database/FirebaseConnect");
var index_1 = require("../../Store/index");
var URLManager_1 = require("../URL/URLManager");
var StateOverrides_1 = require("../../UI/@Shared/StateOverrides");
var URLs_1 = require("../URL/URLs");
var js_vextensions_1 = require("js-vextensions");
var General_1 = require("Utils/UI/General");
/*@Radium
export class Link extends BaseComponent<{to, target?: string, replace?: boolean, style?, onClick?}, {}> {
    render() {
        let {to, style, onClick, children} = this.props;
        return <LinkInner to={to} style={style} onClick={onClick}>{children}</LinkInner>;
    }
}*/
function isModifiedEvent(event) {
    return !!(event.metaKey || event.altKey || event.ctrlKey || event.shiftKey);
}
//@Connect((state, {to, actions, updateURLOnActions}: Props)=> {
var Link = /** @class */ (function (_super) {
    __extends(Link, _super);
    function Link() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Link.prototype.handleClick = function (event) {
        var _a = this.props, onClick = _a.onClick, to = _a.to, target = _a.target, replaceURL = _a.replace, actions = _a.actions;
        if (onClick)
            onClick(event);
        if (event.defaultPrevented)
            return; // onClick prevented default
        if (event.button !== 0)
            return; // ignore right clicks
        if (isModifiedEvent(event))
            return; // ignore clicks with modifier keys
        if (actions) {
            event.preventDefault();
            actions(store.dispatch); // apply actions
        }
        else {
            var isExternal = js_vextensions_1.VURL.Parse(to, true).domain != URLs_1.GetCurrentURL().domain;
            if (isExternal || target)
                return; // let browser handle external links, and "target=_blank"
            event.preventDefault();
            store.dispatch(replaceURL ? redux_little_router_1.replace(to) : redux_little_router_1.push(to));
        }
    };
    Link.prototype.render = function () {
        var _a = this.props, text = _a.text, to = _a.to, target = _a.target, actions = _a.actions, children = _a.children, rest = __rest(_a, ["text", "to", "target", "actions", "children"]); // eslint-disable-line no-unused-vars
        //const href = this.context.router.history.createHref(typeof to === 'string' ? {pathname: to} : to)
        var isExternal = js_vextensions_1.VURL.Parse(to, true).domain != URLs_1.GetCurrentURL().domain;
        if (isExternal && target === undefined) {
            target = "_blank";
        }
        if (to) {
            return (react_1.default.createElement("a", __assign({}, rest.Excluding.apply(rest, General_1.StandardCompProps()), { onClick: this.handleClick, href: to, target: target }),
                text,
                children));
        }
    };
    Link = __decorate([
        FirebaseConnect_1.Connect(function (state, _a) {
            var to = _a.to, actions = _a.actions;
            if (actions) {
                var actionsToDispatch_2 = [];
                function dispatch(action) {
                    actionsToDispatch_2.push(action);
                }
                actions(dispatch);
                var newState = index_1.State();
                //let rootReducer = MakeRootReducer();
                var rootReducer = store.reducer;
                for (var _i = 0, actionsToDispatch_1 = actionsToDispatch_2; _i < actionsToDispatch_1.length; _i++) {
                    var action = actionsToDispatch_1[_i];
                    newState = rootReducer(newState, action);
                }
                StateOverrides_1.State_overrides.state = newState;
                StateOverrides_1.State_overrides.countAsAccess = false;
                var newURL = URLManager_1.GetNewURL();
                StateOverrides_1.State_overrides.countAsAccess = null;
                StateOverrides_1.State_overrides.state = null;
                to = newURL.toString();
            }
            return {
                //oldLocation: updateURLOnActions ? State(a=>a.router.location) : null,
                to: to,
            };
        })
    ], Link);
    return Link;
}(react_vextensions_1.BaseComponent));
exports.Link = Link;
//Link.prototype.setState = function(newState, callback?) { return this.SetState(newState, callback); }; // add proxy, since using Radium
//# sourceMappingURL=Link.js.map