import {runInAction} from "mobx";
import {observer} from "mobx-react";
import {EnsureClassProtoRenderFunctionIsWrapped, BaseComponent} from "react-vextensions";
import {Component, useRef} from "react";
import React from "react";

//export function Observer(targetClass: ()=>ReactElement) {
export function Observer(targetClass: Function) {
	//if (targetClass instanceof (BaseComponent.prototype as any)) {
	if (targetClass.prototype.PreRender) {
		EnsureClassProtoRenderFunctionIsWrapped(targetClass.prototype);
	}
	observer(targetClass as any);
}

export function ClassHooks(targetClass: Function) {
	const componentWillMount_orig = targetClass.prototype.componentWillMount;
	targetClass.prototype.componentWillMount = function() {
		const MAGIC_STACKS = GetMagicStackSymbol(this);
		if (!this[MAGIC_STACKS]) {
			// by initializing comp[MAGIC_STACKS] ahead of time, we keep react-universal-hooks from patching this.render
			this[MAGIC_STACKS] = {};
		}
		if (componentWillMount_orig) return componentWillMount_orig.apply(this, arguments);
	};

	const render_orig = targetClass.prototype.render;
	// note our patching Class.render, not instance.render -- this is compatible with mobx-react
	targetClass.prototype.render = function() {
		const MAGIC_STACKS = GetMagicStackSymbol(this);
		// apply the stack-resetting functionality normally done in the on-instance patched this.render
		Object.getOwnPropertySymbols(this[MAGIC_STACKS]).forEach(k=>{
			this[MAGIC_STACKS][k] = 0;
		});
		return render_orig.apply(this, arguments);
	};
}
let magicStackSymbol_cached: Symbol;
export function GetMagicStackSymbol(comp: Component) {
	if (magicStackSymbol_cached == null) {
		const instanceKey = React.version.indexOf("16") === 0 ? "stateNode" : "_instance";
		const ReactInternals = React["__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED"];
		const compBeingRendered_real = ReactInternals.ReactCurrentOwner.current;

		const compBeingRendered_fake = {render: ()=>({})};
		ReactInternals.ReactCurrentOwner.current = {[instanceKey]: compBeingRendered_fake};
		useRef(); // this triggers react-universal-hooks to attach data to the "comp being rendered" (fake object above)
		//useClassRef(); // variant, if only using the underlying react-class-hooks library
		ReactInternals.ReactCurrentOwner.current = compBeingRendered_real;

		// now we can obtain the secret magic-stacks symbol, by iterating the symbols on compBeingRendered_fake
		const symbols = Object.getOwnPropertySymbols(compBeingRendered_fake);
		const magicStackSymbol = symbols.find(a=>a.toString() == "Symbol(magicStacks)");
		magicStackSymbol_cached = magicStackSymbol;
	}
	return magicStackSymbol_cached as any; // needed for ts to allow as index
}

export function StoreAction<Func extends Function>(actionFunc: Func): Func & {Watch: Func};
export function StoreAction<Func extends Function>(name: string, actionFunc: Func): Func & {Watch: Func};
export function StoreAction(...args) {
	let name: string, actionFunc: Function;
	if (typeof args[0] == "function") [actionFunc] = args;
	else [name, actionFunc] = args;

	/* if (name) action["displayName"] = name;
	action["Watch"] = function(...callArgs) {
		//const accessor_withCallArgsBound = accessor.bind(null, ...callArgs); // bind is bad, because it doesn't "gobble" the "watcher" arg
		const action_withCallArgsBound = ()=>{
			//return accessor.apply(this, callArgs);
			return action(...callArgs);
			//return accessor_withProfiling(...callArgs);
		};
		if (name) action_withCallArgsBound["displayName"] = name;
		//outerAccessor["callArgs"] = callArgs;
		//outerAccessor["displayName"] = `${name || "Unknown"}(${callArgs.join(", ")})`;
		return Watch(action_withCallArgsBound, dependencies);
	};
	return action as any; */

	//let action_final = action(name, actionFunc);
	const result = (...callArgs)=>{
		runInAction(name, ()=>actionFunc(...callArgs));
	};
	// result["isStoreAction"] = true; // mark export as store-action (for copying into mobx-state-tree actions collection)
	return result;
}