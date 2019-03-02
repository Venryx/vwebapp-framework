import {BaseComponent} from "react-vextensions";
import {Icon} from "./Icon";
import React from "react";
import {Omit} from "../../Manager";

type Props = {
	collapsable?: boolean, className?: string, itemClassName?: string, title: (JSX.Element | string), selected?: boolean, defaultCollapsed?: boolean, style?, titleStyle?: any,
	onClick?: (e: Event)=>void, onArrowClick?: (newCollapsed: boolean)=>void
} & Omit<React.HTMLProps<HTMLDivElement>, "title">;
export class TreeView extends BaseComponent<Props, {collapsed: boolean}> {
	static defaultProps = {collapsable: true};
	constructor(props) {
		super(props);
		var {defaultCollapsed} = this.props;
		this.state = {collapsed: defaultCollapsed};
	}

	onArrowClick(...args) {
		var {collapsable, onArrowClick} = this.props;
		var {collapsed} = this.state;
		var newCollapsed = collapsed;
		if (collapsable) {
			newCollapsed = !collapsed;
			this.SetState({collapsed: newCollapsed});
		}
		if (onArrowClick) onArrowClick(newCollapsed);
	}

	onClick(e) {
		var {onClick} = this.props;
		if (onClick) onClick(e);
	}

	render() {
		var {collapsable, title, children, selected, style, titleStyle, ...rest} = this.props;
		var {collapsed} = this.state;

		var iconSize = 8; // with padding: 12
		return (
			<div style={style} {...rest}>
				<Icon icon={`arrow-${collapsed ? "right" : "down"}`} size={iconSize}
					style={E(
						{
							display: "inline-block", boxSizing: "content-box", width: iconSize, height: iconSize, verticalAlign: "top", marginTop: 2, padding: 2,
							backgroundPosition: 2, backgroundRepeat: "no-repeat", backgroundSize: 8, cursor: "pointer",
						},
						!collapsable && {opacity: 0},
					)}
					onClick={this.onArrowClick}/>
				<div onClick={this.onClick}
					style={E(
						titleStyle,
						{display: "inline-block", width: "calc(100% - 12px)",
							backgroundColor: selected ? "rgba(44, 79, 122, .5)" : null}
					)}>
					{title}
				</div>
				<div style={E({paddingLeft: 10}, collapsed && {display: "none"})}>
					{children}
				</div>
			</div>
		);
	}
}