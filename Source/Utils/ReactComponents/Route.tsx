import {BaseComponent} from "react-vextensions";
import {Fragment as Fragment_} from "redux-little-router";
import {VURL} from "js-vextensions";
import {NormalizeURL} from "../URL/URLs";
import React from "react";
let Fragment = Fragment_ as any;

export class Route extends BaseComponent<{path?: string, withConditions?: (location: Location)=>boolean}, {}> {
	render() {
		let {path, withConditions, children} = this.props;
		return (
			<Fragment
					parentRoute="routeWhichNeverMatches" matchWildcardRoute={()=>true} // fixes that "/global/map/philosophy.3" was not considered to match any of the route-patterns
					withConditions={withConditions || (url=> {
						let urlStr = NormalizeURL(VURL.FromState(url)).toString({domain: false, queryVars: false, hash: false});
						//return url.startsWith(targetURL);
						return urlStr.startsWith(path);
					})}>
				{children}
			</Fragment>
		);
	}
}