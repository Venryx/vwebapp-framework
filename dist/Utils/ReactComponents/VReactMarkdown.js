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
var react_markdown_1 = require("react-markdown");
var react_vextensions_1 = require("react-vextensions");
//import {Component as BaseComponent} from "react";
var RegexHelpers_1 = require("../General/RegexHelpers");
var URLs_1 = require("../URL/URLs");
var Link_1 = require("./Link");
var js_vextensions_1 = require("js-vextensions");
var VReactMarkdown = /** @class */ (function (_super) {
    __extends(VReactMarkdown, _super);
    function VReactMarkdown() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    VReactMarkdown.prototype.render = function () {
        var _a = this.props, source = _a.source, replacements = _a.replacements, extraInfo = _a.extraInfo, style = _a.style, addMarginsForDanglingNewLines = _a.addMarginsForDanglingNewLines, containerProps = _a.containerProps, renderers = _a.renderers, rest = __rest(_a, ["source", "replacements", "extraInfo", "style", "addMarginsForDanglingNewLines", "containerProps", "renderers"]);
        var containerProps_final = __assign({}, containerProps);
        containerProps_final.style = E(containerProps_final.style, style);
        var renderers_final = __assign({}, renderers);
        renderers_final.Link = renderers_final.Link || (function (props) {
            var href = props.href, target = props.target, rest = __rest(props, ["href", "target"]);
            var toURL = js_vextensions_1.VURL.Parse(href);
            if (target == null && toURL.domain != URLs_1.GetCurrentURL().domain) {
                target = "_blank";
            }
            return React.createElement(Link_1.Link, __assign({}, rest, { to: href, target: target }));
        });
        if (replacements) {
            var patterns = replacements.VKeys().map(function (regexStr, index) { return ({ name: index + "", regex: new RegExp(regexStr) }); });
            var segments = RegexHelpers_1.ParseSegmentsForPatterns(source, patterns);
            return (React.createElement("div", null, segments.map(function (segment, index) {
                if (segment.patternMatched == null) {
                    if (replacements.default) {
                        return replacements.default(segment, index, extraInfo).VAct(function (a) { return a.key = index; });
                    }
                    var text = segment.textParts[0].replace(/\r/g, "");
                    return (React.createElement(react_markdown_1.default, __assign({}, rest, { key: index, source: text.trim(), renderers: renderers_final, containerProps: {
                            style: E(addMarginsForDanglingNewLines && {
                                marginTop: text.startsWith("\n\n") ? 15 : text.startsWith("\n") ? 5 : 0,
                                marginBottom: text.endsWith("\n\n") ? 15 : text.endsWith("\n") ? 5 : 0,
                            }),
                        } })));
                }
                var renderFuncForReplacement = replacements.VValues()[segment.patternMatched];
                return renderFuncForReplacement(segment, index, extraInfo).VAct(function (a) { return a.key = index; });
            })));
        }
        return React.createElement(react_markdown_1.default, __assign({}, rest, { source: source, containerProps: containerProps_final, renderers: renderers_final }));
    };
    return VReactMarkdown;
}(react_vextensions_1.BaseComponent));
exports.VReactMarkdown = VReactMarkdown;
//# sourceMappingURL=VReactMarkdown.js.map