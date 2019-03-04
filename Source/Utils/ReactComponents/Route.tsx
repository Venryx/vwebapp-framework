import {BaseComponent} from "react-vextensions";
import React from "react";
import {Route as Route_Base, Switch} from "react-router";
import {e} from "../../PrivateExports";
//import {GetCurrentURL} from 'Utils/URL/URLs';

const aa = {Route_Base, Switch} as any;

export class Route extends BaseComponent<{path?: string, exact?: boolean, withConditions?: (location: Location)=>boolean}, {}> {
	render() {
		const {path, exact, withConditions, children} = this.props;
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
					{match=>{
						//let {GetCurrentURL} = require('Utils/URL/URLs'); // late-require, due to require-cycle issue
						if (!match) return null;
						if (withConditions && withConditions(e.GetCurrentURL().ToLocationObject() as any) == false) return false;
						return children;
					}}
				</aa.Route_Base>
			</aa.Switch>
		);
	}
}