import ReactMarkdown, {ReactMarkdownProps} from "react-markdown";
import {BaseComponent, ShallowChanged} from "react-vextensions";
//import {Component as BaseComponent} from "react";
import {Segment, ParseSegmentsForPatterns} from "../General/RegexHelpers";
import {GetCurrentURL} from "../URL/URLs";
import {Link} from "./Link";
import {VURL} from "js-vextensions";
import React from "react";

export type ReplacementFunc = (segment: Segment, index: number, extraInfo)=>JSX.Element;

export class VReactMarkdown extends BaseComponent
		<{source: string, replacements?: {[key: string]: ReplacementFunc}, extraInfo?, style?, addMarginsForDanglingNewLines?: boolean, containerProps?: any} & ReactMarkdownProps,
		{}> {
	render() {
		let {source, replacements, extraInfo, style, addMarginsForDanglingNewLines, containerProps, renderers, ...rest} = this.props;

		let containerProps_final = {...containerProps};
		containerProps_final.style = E(containerProps_final.style, style);

		let renderers_final = {...renderers} as any;
		renderers_final.Link = renderers_final.Link || (props=> {
			let {href, target, ...rest} = props;
			let toURL = VURL.Parse(href);
			if (target == null && toURL.domain != GetCurrentURL().domain) {
				target = "_blank";
			}
			return <Link {...rest} to={href} target={target}/>;
		});

		if (replacements) {
			let patterns = replacements.VKeys().map((regexStr, index)=>({name: index+"", regex: new RegExp(regexStr)}));
			let segments = ParseSegmentsForPatterns(source, patterns);
			return (
				<div>
					{segments.map((segment, index)=> {
						if (segment.patternMatched == null) {
							if (replacements.default) {
								return replacements.default(segment, index, extraInfo).VAct(a=>a.key = index);
							}
							let text = segment.textParts[0].replace(/\r/g, "");
							return (
								<div style={E(addMarginsForDanglingNewLines && {
									marginTop: text.startsWith("\n\n") ? 15 : text.startsWith("\n") ? 5 : 0,
									marginBottom: text.endsWith("\n\n") ? 15 : text.endsWith("\n") ? 5 : 0,
								})}>
									<ReactMarkdown {...rest} key={index} source={text.trim()} renderers={renderers_final}/>
								</div>
							);
						}
						let renderFuncForReplacement = replacements.VValues()[segment.patternMatched] as ReplacementFunc;
						return renderFuncForReplacement(segment, index, extraInfo).VAct(a=>a.key = index);
					})}
				</div>
			);
		}

		return (
			<div {...containerProps_final}>
				<ReactMarkdown {...rest} source={source} renderers={renderers_final}/>
			</div>
		);
	}
}