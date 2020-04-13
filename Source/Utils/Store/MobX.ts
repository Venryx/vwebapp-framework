import {runInAction, observable, autorun, configure, onReactionError, ObservableMap, ObservableSet} from "mobx";
import {observer, IReactComponent} from "mobx-react";
import {EnsureClassProtoRenderFunctionIsWrapped, BaseComponent} from "react-vextensions";
import React, {Component, useRef} from "react";
import {ToJSON, E} from "js-vextensions";
import {setUseProxies, setAutoFreeze} from "immer";
import {manager} from "../../Manager";
import {HandleError} from "../General/Errors";

// old: call ConfigureMobX() before any part of mobx tree is created (ie. at start of Store/index.ts); else, immer produce() doesn't work properly
//ConfigureMobX();

ConfigureMobX();
export function ConfigureMobX() {
	// configure({ enforceActions: 'always' });
	configure({enforceActions: "observed"});

	// have unhandled exceptions in mobx reactions sent to the global error-handler
	onReactionError((error, derivation)=>{
		HandleError(error);
	});

	// fixes various issues when Immer is sent mobx objects (see NPMPatches.ts for old fix attempts)
	setUseProxies(false);
	setAutoFreeze(false);
}

export type ActionFunc<StoreType> = (store: StoreType)=>void;

// variant of observer(...) wrapper-func, which returns a simple function result, instead of a ReactJS element-info entry (needed for ShowMessageBox.message)
export function observer_simple<T extends IReactComponent>(target: T): T {
	return observer(target)["type"];
}

// variant of @observer decorator, which also adds (and is compatible with) class-hooks
export class Observer_Options {
	classHooks = true;
}
export function Observer(targetClass: Function);
export function Observer(options: Partial<Observer_Options>);
export function Observer(...args) {
	let options = new Observer_Options();
	if (typeof args[0] == "function") {
		ApplyToClass(args[0]);
	} else {
		options = E(options, args[0]);
		return ApplyToClass;
	}

	function ApplyToClass(targetClass: Function) {
		if (options.classHooks) ClassHooks(targetClass);
		//if (targetClass instanceof (BaseComponent.prototype as any)) {
		if (targetClass.prototype.PreRender) {
			EnsureClassProtoRenderFunctionIsWrapped(targetClass.prototype);
		}
		observer(targetClass as any);
	}
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
		if (this[MAGIC_STACKS]) {
			// apply the stack-resetting functionality normally done in the on-instance patched this.render
			Object.getOwnPropertySymbols(this[MAGIC_STACKS]).forEach(k=>{
				this[MAGIC_STACKS][k] = 0;
			});
		}
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
		let name_withArgs = name;
		name_withArgs += `(${callArgs.map(a=>(a != null ? ToJSON(a) : "null")).join(", ")})`;
		return runInAction(name_withArgs, ()=>actionFunc(...callArgs));
	};
	// result["isStoreAction"] = true; // mark export as store-action (for copying into mobx-state-tree actions collection)
	return result;
}

export const O = observable;

export function RunInAction_Set(setterFunc: ()=>any);
export function RunInAction_Set(compInstance: Component, setterFunc: ()=>any);
export function RunInAction_Set(...args) {
	let compInstance: Component, setterFunc: ()=>any;
	if (args.length == 1) [setterFunc] = args;
	else [compInstance, setterFunc] = args;

	const funcStr = setterFunc.toString();
	const funcStr_namePartMatch = funcStr.match(/(store.+?) /);
	const actionName = `Set${compInstance ? `@${compInstance.constructor.name}` : ""}:${funcStr_namePartMatch?.[1] ?? funcStr}`;
	runInAction(actionName, setterFunc);
}

// mobx-mirror
// ==========

/*export type MobXToPlainConverter = (mobxTree: any)=>any;
export const defaultMobXToPlainConverters = [
	(mobxTree)=> {
		if (mobxTree instanceof )
	},
] as MobXToPlainConverter[];*/

/**
Makes it possible to use MobX object-trees as the source/base object for Immer's produce function.
See here for more info: https://github.com/immerjs/immer/issues/515
*/
export function GetMirrorOfMobXTree<T>(mobxTree: T, prototypesToKeep: Function[] = [Array, Map, Set]): T {
	if (mobxTree == null) return null;
	if (mobxTree["$mirror"] == null) {
		const tree_plainMirror =
			Array.isArray(mobxTree) ? [] :
			mobxTree instanceof Map || mobxTree instanceof ObservableMap ? new Map() :
			mobxTree instanceof Set || mobxTree instanceof ObservableSet ? new Set() :
			{};
		if (prototypesToKeep.Any(a=>mobxTree instanceof a)) {
			Object.setPrototypeOf(tree_plainMirror, Object.getPrototypeOf(mobxTree));
		}

		if (Object.isExtensible(mobxTree)) {
			Object.defineProperty(mobxTree, "$mirror", {value: tree_plainMirror});
		}
		StartUpdatingMirrorOfMobXTree(mobxTree, tree_plainMirror);
	}
	return mobxTree["$mirror"];
}
export function StartUpdatingMirrorOfMobXTree(mobxTree: any, tree_plainMirror: any, prototypesToKeep: Function[] = [Array, Map, Set]) {
	//const stopUpdating = autorun(()=>{
	autorun(()=>{
		const sourceIsMap = mobxTree instanceof Map || mobxTree instanceof ObservableMap;
		const targetIsMap = tree_plainMirror instanceof Map || tree_plainMirror instanceof ObservableMap;
		for (const key of sourceIsMap ? mobxTree.keys() : Object.keys(mobxTree)) {
			const valueFromSource = sourceIsMap ? mobxTree.get(key) : mobxTree[key]; // this counts as a mobx-get, meaning the autorun subscribes, so this func reruns when the prop-value changes
			//const valueForTarget_old = tree_plainMirror[key];
			const valueForTarget = typeof valueFromSource == "object" ? GetMirrorOfMobXTree(valueFromSource, prototypesToKeep) : valueFromSource;

			if (targetIsMap) {
				tree_plainMirror.set(key, valueForTarget);
			} else {
				tree_plainMirror[key] = valueForTarget;
			}

			//if (typeof valueForTarget_old == "object" && valueForTarget_old["$mirror_stopUpdating"]) { [...]
		}
	});
	//Object.defineProperty(mobxTree, "$mirror_stopUpdating", stopUpdating);
}