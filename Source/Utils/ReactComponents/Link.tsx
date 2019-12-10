import {VURL, Assert} from "js-vextensions";
import React from "react";
import {BaseComponent, FilterOutUnrecognizedProps, BaseComponentPlus} from "react-vextensions";
import produce from "immer";
import {WithStore} from "mobx-firelink";
import {GetCurrentURL} from "../URL/URLs";
import {manager, OnPopulated} from "../../Manager";
import {Action} from "../General/Action";
import {ActionFunc} from "../Store/MobX";

/*@Radium
export class Link extends BaseComponent<{to, target?: string, replace?: boolean, style?, onClick?}, {}> {
	render() {
		let {to, style, onClick, children} = this.props;
		return <LinkInner to={to} style={style} onClick={onClick}>{children}</LinkInner>;
	}
}*/

function isModifiedEvent(event) {
	return !!(event.metaKey || event.altKey || event.ctrlKey || event.shiftKey);
}

export type Link_Props = {
	onClick?, style?,
	text?: string, to?: string, target?: string, replace?: boolean, // url-based
	//actions?: (dispatch: Function)=>void,
	actionFunc?: ActionFunc<any>, // new approach, for mobx/mst store
	//updateURLOnActions?: boolean, // action-based
} & Omit<React.HTMLProps<HTMLAnchorElement>, "href">;
export class Link extends BaseComponentPlus({} as Link_Props, {}) {
	static ValidateProps(props: Link_Props) {
		/*const {actionFunc, to} = props;
		Assert(actionFunc != null || to != null, `Must supply the Link component with either an "actionFunc" or "to" property.`);*/
		Assert("actionFunc" in props || "to" in props, `Must supply the Link component with either an "actionFunc" or "to" property.`);
	}

	handleClick(event) {
		const {onClick, to, target, replace: replaceURL, actionFunc} = this.props;
		if (onClick) onClick(event);

		if (event.defaultPrevented) return; // onClick prevented default
		if (event.button !== 0) return; // ignore right clicks
		if (isModifiedEvent(event)) return; // ignore clicks with modifier keys

		if (actionFunc != null) {
			event.preventDefault();
			actionFunc(manager.store);
		} else {
			const isExternal = VURL.Parse(to, true).domain != GetCurrentURL().domain;
			if (isExternal || target) return; // let browser handle external links, and "target=_blank"

			event.preventDefault();
			//manager.store.dispatch(replaceURL ? replace(to) : push(to));
			if (replaceURL) {
				history.replaceState(null, null, to);
			} else {
				history.pushState(null, null, to);
			}
		}
	}

	render() {
		let {text, actionFunc, to, target, children, ...rest} = this.props;

		if (actionFunc) {
			const newState = produce(manager.store, draft=>{
				actionFunc(draft);
			});
			//let newURL = UsingRootState(newState, ()=>manager.GetNewURL());
			const newURL = WithStore(newState, ()=>manager.GetNewURL());
			//const newURL = manager.GetNewURL.WS(newState)();
			to = newURL.toString();
		}

		//if (manager.prodEnv && to == null) return; // defensive
		//const href = this.context.router.history.createHref(typeof to === 'string' ? {pathname: to} : to)

		// if external link (and target not specified), set target to "_blank", causing it to open in new tab
		const isExternal = to && VURL.Parse(to, true).domain != GetCurrentURL().domain;
		const target_final = isExternal && target === undefined ? "_blank" : target;

		return (
			<a {...FilterOutUnrecognizedProps(rest, "a")} onClick={this.handleClick} href={to} target={target_final}>
				{text}
				{children}
			</a>
		);
	}

	// add proxy, since using Radium
	/*setState(newState, callback?) {
		return this.SetState(newState, callback);
	}*/
}
//Link.prototype.setState = function(newState, callback?) { return this.SetState(newState, callback); }; // add proxy, since using Radium