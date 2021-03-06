import ReactMarkdown, {ReactMarkdownProps} from "react-markdown";
import {BaseComponent, ShallowChanged, FilterOutUnrecognizedProps} from "react-vextensions";
//import {Component as BaseComponent} from "react";
import {VURL, E} from "js-vextensions";
import React from "react";
import {Segment, ParseSegmentsForPatterns} from "../General/RegexHelpers";
import {GetCurrentURL} from "../URL/URLs";
import {Link} from "./Link";
import {manager} from "../../Manager";

export type ReplacementFunc = (segment: Segment, index: number, extraInfo)=>JSX.Element;

// this is distinct from react-vmarkdown (this is a markdown renderer, whereas react-vmarkdown is a markdown editor)
export class VReactMarkdown extends BaseComponent
	<{source: string, replacements?: {[key: string]: ReplacementFunc}, extraInfo?, style?, addMarginsForDanglingNewLines?: boolean, containerProps?: any} & ReactMarkdownProps,
	{}> {
	render() {
		const {source, replacements, extraInfo, style, addMarginsForDanglingNewLines, containerProps, renderers, ...rest} = this.props;

		const containerProps_final = {...containerProps};
		containerProps_final.style = E(containerProps_final.style, style);

		const renderers_final = {...renderers} as any;
		renderers_final.link = renderers_final.link || (props=>{
			let {href, target, ...rest} = props;
			const toURL = VURL.Parse(href);
			const sameDomain = toURL.domain == GetCurrentURL().domain;

			if (target == "") target = null; // normalize falsy target
			if (target == null && sameDomain) {
				target = "_blank";
			}

			if (sameDomain) {
				const actionFunc = manager.GetLoadActionFuncForURL(toURL);
				return <Link {...FilterOutUnrecognizedProps(rest, "a")} actionFunc={actionFunc} target={target}/>;
			}
			return <Link {...FilterOutUnrecognizedProps(rest, "a")} to={href} target={target}/>;
		});

		if (replacements) {
			const patterns = replacements.VKeys().map((regexStr, index)=>({name: `${index}`, regex: new RegExp(regexStr)}));
			const segments = ParseSegmentsForPatterns(source, patterns);
			return (
				<div>
					{segments.map((segment, index)=>{
						if (segment.patternMatched == null) {
							if (replacements.default) {
								return replacements.default(segment, index, extraInfo).VAct(a=>a.key = index);
							}
							const text = segment.textParts[0].replace(/\r/g, "");
							return (
								<div style={E(addMarginsForDanglingNewLines && {
									marginTop: text.startsWith("\n\n") ? 15 : text.startsWith("\n") ? 5 : 0,
									marginBottom: text.endsWith("\n\n") ? 15 : text.endsWith("\n") ? 5 : 0,
								})}>
									<ReactMarkdown {...rest} key={index} source={text.trim()} renderers={renderers_final}/>
								</div>
							);
						}
						const renderFuncForReplacement = replacements.VValues()[segment.patternMatched.name] as ReplacementFunc;
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