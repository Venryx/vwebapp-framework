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
var remarkable_1 = require("remarkable");
var remarkable_react_1 = require("remarkable-react");
var react_vextensions_1 = require("react-vextensions");
//import {Component as BaseComponent} from "react";
var RegexHelpers_1 = require("../General/RegexHelpers");
var URLs_1 = require("../URL/URLs");
var Link_1 = require("./Link");
var js_vextensions_1 = require("js-vextensions");
var VReactMarkdown_Remarkable = /** @class */ (function (_super) {
    __extends(VReactMarkdown_Remarkable, _super);
    function VReactMarkdown_Remarkable() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    VReactMarkdown_Remarkable.prototype.InitMarkdown = function (props) {
        var extraInfo = props.extraInfo, markdownOptions = props.markdownOptions, rendererOptions = props.rendererOptions;
        markdownOptions = markdownOptions || { html: true };
        this.markdown = new remarkable_1.default(markdownOptions);
        var rendererOptions_final = __assign({}, rendererOptions);
        rendererOptions_final.components = __assign({}, rendererOptions_final.components);
        if (rendererOptions_final.components.a == null)
            rendererOptions_final.components.a = (function (props) {
                var href = props.href, target = props.target, rest = __rest(props, ["href", "target"]);
                var toURL = js_vextensions_1.VURL.Parse(href);
                if (target == null && toURL.domain != URLs_1.GetCurrentURL().domain) {
                    target = "_blank";
                }
                return React.createElement(Link_1.Link, __assign({}, rest, { to: href, target: target }));
            });
        /*if (rendererOptions_final.components.htmlblock == null) rendererOptions_final.components.htmlblock = (props=> {
            let {content} = props;
            return <div dangerouslySetInnerHTML={{__html: content}}/>;
        });
        if (rendererOptions_final.components.htmltag == null) rendererOptions_final.components.htmltag = (props=> {
            let {content} = props;
            return <span dangerouslySetInnerHTML={{__html: content}}/>;
        });
        rendererOptions_final.tokens = {...rendererOptions_final.tokens};
        if (rendererOptions_final.tokens.htmlblock == null) rendererOptions_final.tokens.htmlblock = "htmlblock";
        if (rendererOptions_final.tokens.htmltag == null) rendererOptions_final.tokens.htmltag = "htmltag";*/
        this.markdown.renderer = new remarkable_react_1.default(rendererOptions_final);
    };
    VReactMarkdown_Remarkable.prototype.ComponentWillReceiveProps = function (props) {
        if (react_vextensions_1.ShallowChanged(props.markdownOptions, this.props.markdownOptions) || react_vextensions_1.ShallowChanged(props.rendererOptions, this.props.rendererOptions)) {
            this.InitMarkdown(props);
        }
    };
    VReactMarkdown_Remarkable.prototype.render = function () {
        var _a = this.props, source = _a.source, extraInfo = _a.extraInfo, markdownOptions = _a.markdownOptions, rendererOptions = _a.rendererOptions, replacements = _a.replacements, containerType = _a.containerType, style = _a.style, addMarginsForDanglingNewLines = _a.addMarginsForDanglingNewLines, rest = __rest(_a, ["source", "extraInfo", "markdownOptions", "rendererOptions", "replacements", "containerType", "style", "addMarginsForDanglingNewLines"]);
        //source = source || this.FlattenedChildren.join("\n\n");
        if (this.markdown == null) {
            this.InitMarkdown(this.props);
        }
        if (replacements) {
            var patterns = replacements.VKeys().map(function (regexStr, index) { return ({ name: index + "", regex: new RegExp(regexStr) }); });
            var segments = RegexHelpers_1.ParseSegmentsForPatterns(source, patterns);
            if (segments.length > 1) {
                var segmentUIs = segments.map(function (segment, index) {
                    if (segment.patternMatched == null) {
                        if (replacements.default) {
                            return replacements.default(segment, index, extraInfo).VAct(function (a) { return a.key = index; });
                        }
                        var text = segment.textParts[0].replace(/\r/g, "");
                        return (React.createElement(VReactMarkdown_Remarkable, { key: index, source: text.trim(), replacements: replacements, extraInfo: extraInfo, markdownOptions: markdownOptions, rendererOptions: rendererOptions, style: E(addMarginsForDanglingNewLines && {
                                marginTop: text.startsWith("\n\n") ? 15 : text.startsWith("\n") ? 5 : 0,
                                marginBottom: text.endsWith("\n\n") ? 15 : text.endsWith("\n") ? 5 : 0,
                            }), addMarginsForDanglingNewLines: addMarginsForDanglingNewLines }));
                    }
                    var renderFuncForReplacement = replacements.VValues()[segment.patternMatched];
                    return renderFuncForReplacement(segment, index, extraInfo).VAct(function (a) { return a.key = index; });
                });
                return React.createElement(containerType, { style: style }, segmentUIs);
            }
        }
        var markdownResult = this.markdown.render(source);
        return React.createElement(containerType, __assign({}, rest, { style: style }), markdownResult);
    };
    VReactMarkdown_Remarkable.defaultProps = { containerType: "div" };
    return VReactMarkdown_Remarkable;
}(react_vextensions_1.BaseComponent));
exports.VReactMarkdown_Remarkable = VReactMarkdown_Remarkable;
//# sourceMappingURL=VReactMarkdown_Remarkable.js.map