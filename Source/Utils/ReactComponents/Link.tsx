import {VURL, Assert} from "js-vextensions";
import React from "react";
import {BaseComponent, FilterOutUnrecognizedProps, BaseComponentPlus} from "react-vextensions";
import {replace, push} from "connected-react-router";
import {Connect} from "../Database/FirebaseConnect";
import {GetCurrentURL} from "../URL/URLs";
import {State_Base} from "../Store/StoreHelpers";
import {manager, OnPopulated} from "../../Manager";
import {State_overrides} from "../Store/StateOverrides";
import {Action} from "../General/Action";

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

let rootReducer;
OnPopulated(()=>{
	rootReducer = manager.MakeRootReducer(true);
});

export type Link_Props = {
	onClick?, style?,
	text?: string, to?: string, target?: string, replace?: boolean, // url-based
	//actions?: (dispatch: Function)=>void,
	actions?: Action<any>[],
	//updateURLOnActions?: boolean, // action-based
} & Omit<React.HTMLProps<HTMLAnchorElement>, "href">;
export class Link extends BaseComponentPlus({} as Link_Props, {}) {
	static ValidateProps(props: Link_Props) {
		const {actions, to} = props;
		Assert(actions != null || to != null, `Must supply the Link component with either an "actions" or "to" property.`);
	}

	handleClick(event) {
		const {onClick, to, target, replace: replaceURL, actions} = this.props;
		if (onClick) onClick(event);

		if (event.defaultPrevented) return; // onClick prevented default
		if (event.button !== 0) return; // ignore right clicks
		if (isModifiedEvent(event)) return; // ignore clicks with modifier keys

		if (actions != null) {
			event.preventDefault();
			// apply actions
			for (const action of actions) {
				manager.store.dispatch(action);
			}
		} else {
			const isExternal = VURL.Parse(to, true).domain != GetCurrentURL().domain;
			if (isExternal || target) return; // let browser handle external links, and "target=_blank"

			event.preventDefault();
			manager.store.dispatch(replaceURL ? replace(to) : push(to));
		}
	}

	render() {
		let {text, actions, to, target, children, ...rest} = this.props;

		if (actions) {
			// if state-data-override is active from something else, just return our last result
			//if (State_overrides.state) return this.lastResult;

			let newState = State_Base.Watch();
			//let rootReducer = manager.MakeRootReducer();
			//const rootReducer = manager.store.reducer;
			for (const action of actions) {
				newState = rootReducer(newState, action);
			}
			/*State_overrides.state = newState;
			State_overrides.countAsAccess = false;*/
			const newURL = manager.GetNewURL["Watch"]();
			/*State_overrides.countAsAccess = null;
			State_overrides.state = null;*/

			to = newURL.toString();
		}


		//if (manager.prodEnv && to == null) return; // defensive
		//const href = this.context.router.history.createHref(typeof to === 'string' ? {pathname: to} : to)

		// if external link (and target not specified), set target to "_blank", causing it to open in new tab
		const isExternal = VURL.Parse(to, true).domain != GetCurrentURL().domain;
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