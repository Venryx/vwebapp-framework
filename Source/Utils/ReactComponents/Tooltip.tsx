import {BaseComponent} from "react-vextensions";
import React, {HTMLProps} from "react";
import {E} from "js-vextensions";
//import "rc-tooltip/assets/bootstrap.css";

export type InTooltipProps = {style?: any} & Partial<HTMLProps<HTMLDivElement>>;

export class InTooltip extends BaseComponent<InTooltipProps, {}> {
	render() {
		const {style, children, ...rest} = this.props;
		return (
			<div {...rest} style={E({whiteSpace: "pre"}, style)}>
				{children}
			</div>
		);
	}
}