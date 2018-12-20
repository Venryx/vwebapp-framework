import {BaseComponent} from "react-vextensions";
import {VURL} from "js-vextensions";
import {NormalizeURL} from "../URL/URLs";
import React from "react";
import {Route as Route_Base, Switch} from "react-router";
let aa = {Route_Base, Switch} as any;

export class Route extends BaseComponent<{path?: string, exact?: boolean, withConditions?: (location: Location)=>boolean}, {}> {
	render() {
		let {path, exact, withConditions, children} = this.props;
		/*return (
			<Fragment
					parentRoute="routeWhichNeverMatches" matchWildcardRoute={()=>true} // fixes that "/global/map/philosophy.3" was not considered to match any of the route-patterns
					withConditions={withConditions || (url=> {
						let urlStr = NormalizeURL(VURL.FromState(url)).toString({domain: false, queryVars: false, hash: false});
						//return url.startsWith(targetURL);
						return urlStr.startsWith(path);
					})}>
				{children}
			</Fragment>
		);*/
		return (
			<aa.Switch>
				<aa.Route_Base path={path} exact={exact}>
					{match=>match ?
						children as any : null}
				</aa.Route_Base>
			</aa.Switch>
		);
	}
}