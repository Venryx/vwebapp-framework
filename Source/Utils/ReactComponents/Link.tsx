import { VURL } from "js-vextensions";
import React from 'react';
import { BaseComponent } from "react-vextensions";
import { push, replace } from "redux-little-router";
import { Connect } from "../Database/FirebaseConnect";
import { GetCurrentURL, GetNewURL } from "../URL/URLs";
import { State_Base } from "../Store/StoreHelpers";
import { manager } from "../../Manager";
import { State_overrides } from "../Store/StateOverrides";
import { StandardCompProps } from "../UI/General";

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

type Props = {
	onClick?, style?,
	text?: string, to?: string, target?: string, replace?: boolean, // url-based
	actions?: (dispatch: Function)=>void, //updateURLOnActions?: boolean, // action-based
} & React.HTMLProps<HTMLAnchorElement>;
//@Connect((state, {to, actions, updateURLOnActions}: Props)=> {
@Connect((state, {to, actions}: Props)=> {
	if (actions) {
		let actionsToDispatch = [];
		function dispatch(action) {
			actionsToDispatch.push(action);
		}
		actions(dispatch);

		let newState = State_Base();
		//let rootReducer = MakeRootReducer();
		let rootReducer = manager.store.reducer;
		for (let action of actionsToDispatch) {
			newState = rootReducer(newState, action);
		}
		State_overrides.state = newState;
		State_overrides.countAsAccess = false;
		let newURL = GetNewURL();
		State_overrides.countAsAccess = null;
		State_overrides.state = null;

		to = newURL.toString();
	}
	return {
		//oldLocation: updateURLOnActions ? State(a=>a.router.location) : null,
		to,
	};
})
export class Link extends BaseComponent<Props, {}> {
	handleClick(event) {
		let {onClick, to, target, replace: replaceURL, actions} = this.props;
		if (onClick) onClick(event);

		if (event.defaultPrevented) return; // onClick prevented default
		if (event.button !== 0) return; // ignore right clicks
		if (isModifiedEvent(event)) return; // ignore clicks with modifier keys

		if (actions) {
			event.preventDefault();
			actions(manager.store.dispatch); // apply actions
		} else {
			let isExternal = VURL.Parse(to, true).domain != GetCurrentURL().domain;
			if (isExternal || target) return; // let browser handle external links, and "target=_blank"

			event.preventDefault();
			manager.store.dispatch(replaceURL ? replace(to) : push(to));
		}
	}

	render() {
		let {text, to, target, actions, children, ...rest} = this.props // eslint-disable-line no-unused-vars
		//const href = this.context.router.history.createHref(typeof to === 'string' ? {pathname: to} : to)
		let isExternal = VURL.Parse(to, true).domain != GetCurrentURL().domain;
		if (isExternal && target === undefined) {
			target = "_blank";
		}

		if (to) {
			return (
				<a {...rest.Excluding(...StandardCompProps())} onClick={this.handleClick} href={to} target={target}>
					{text}
					{children}
				</a>
			);
		}
	}

	// add proxy, since using Radium
	/*setState(newState, callback?) {
		return this.SetState(newState, callback);
	}*/
}
//Link.prototype.setState = function(newState, callback?) { return this.SetState(newState, callback); }; // add proxy, since using Radium