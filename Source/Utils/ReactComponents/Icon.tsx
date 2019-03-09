import {BaseComponent} from "react-vextensions";
import React from "react";
import {manager} from "vwebapp-framework/Source/Manager";
import {Assert} from "js-vextensions";

// todo: get this working, despite our now being in the vwebapp-framework module

// Use code like the following to supply the "manager.iconInfo" property. (after integrating svg-loader into your webpack config)
/*
var context = (require as any).context("../Resources/SVGs/", true, /\.svg$/);
var files = {};
context.keys().forEach((filename)=>{
	files[filename] = context(filename).default;
});

vWebAppFramework_manager.Populate({
	iconInfo,
});
*/

//export class Icon extends BaseComponent<{icon: IconType, color?: string}, {}> {
export class Icon extends BaseComponent<{icon: string, size: number, color?: string} & React.HTMLProps<SVGElement>, {}> {
	static defaultProps = {color: "rgba(255,255,255,.7)"};
	render() {
		const {icon, size, color, ...rest} = this.props;
		//let info = require(`../../../../../Resources/SVGs/${icon}.svg`).default;
		//let info = files[`./${icon}.svg`];
		const info = manager.iconInfo[`./${icon}.svg`];
		Assert(info != null, `Could not find icon-info for "${icon}.svg" in manager.iconInfo map. See comment in vwebapp-framework/Source/Utils/ReactComponent/Icon.tsx for example code.`);
		return (
			<svg {...rest as any} viewBox={info.viewBox} width={size} height={size}>
				<use xlinkHref={`#${info.id}`} style={{fill: color}}/>
			</svg>
		);
	}
}