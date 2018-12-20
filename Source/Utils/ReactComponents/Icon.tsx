import { BaseComponent } from "react-vextensions";
import React from "react";

//import iconData from "../../../Source/Utils/UI/IconData.json";
/*var iconData_raw = {} as any; //require("../../../Source/Utils/UI/IconData.json");
let iconData = {};
for (let entry of iconData_raw.icons) {
	iconData[entry.tags[0]] = entry.paths[0];
}*/

/*
[old]
IconData.json generated using icomoon.io. Just add the packs below, select the icons listed in IconType (or just select all), then click "Download JSON" in corner menu.

Icon packs:
* IcoMoon - Free
* Font Awesome
*/

/*export type IconType =
| "arrow-up" | "arrow-down"
;*/

// todo: get this working, despite our now being in the vwebapp-framework module

// SVG's not used during the initial icon-rendering batch were never getting rendered.
// For now, we'll fix this by importing all SVG's from the get-go.
/*var context = (require as any).context("../../../Resources/SVGs/", true /* include subfolders *#/, /\.svg$/);
var files = {};
context.keys().forEach((filename)=>{
	files[filename] = context(filename);
});*/

//export class Icon extends BaseComponent<{icon: IconType, color?: string}, {}> {
export class Icon extends BaseComponent<{icon: string, size: number, color?: string} & React.HTMLProps<SVGElement>, {}> {
	static defaultProps = {color: "rgba(255,255,255,.7)"};
	render() {
		let {icon, size, color, ...rest} = this.props;
		//let data = iconData[icon];
	   /*return (
			<svg>
				<path d={data} fill={color}></path>
			</svg>
		);*/
		let info = {} as any; //require(`../../../Resources/SVGs/${icon}.svg`).default;
		return (
			<svg {...rest as any} viewBox={info.viewBox} width={size} height={size}>
				<use xlinkHref={`#${info.id}`} style={{fill: color}}/>
			</svg>
		);
	}
}