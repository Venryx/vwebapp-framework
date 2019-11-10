import {runInAction} from "mobx";
import {observer} from "mobx-react";
import {EnsureClassProtoRenderFunctionIsWrapped} from "react-vextensions";

//export function Observer(targetClass: ()=>ReactElement) {
export function Observer(targetClass: Function) {
	EnsureClassProtoRenderFunctionIsWrapped(targetClass.prototype);
	observer(targetClass as any);
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
	return (...callArgs)=>{
		runInAction(name, ()=>actionFunc(...callArgs));
	};
}