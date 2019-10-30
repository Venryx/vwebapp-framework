import {DeepGet, Assert, nl, IsFunction, ConvertPathGetterFuncToPropChain} from "js-vextensions";
import {manager, RootState_Base} from "../../Manager";
import {State_Options, State_overrides} from "./StateOverrides";
import {Action, IsACTSetFor} from "../General/Action";
import {e, g} from "../../PrivateExports";
import {GetStoreValue, StoreAccessor} from "./PathWatchManager";

interface StateFunc<RootState> {
	<T>(): RootState;
	<T>(pathGetterFunc: (state: RootState)=>T): T;
	<T>(...pathSegments: (string | number)[]);
	<T>(options: State_Options, ...pathSegments: (string | number)[]);
}
interface StateFunc_WithWatch<RootState> extends StateFunc<RootState> {
	Watch: StateFunc<RootState>;
}
export const State_Base: StateFunc_WithWatch<RootState_Base> = StoreAccessor("State", (...args)=>{
	let pathSegments: (string | number)[], options = new State_Options();
	if (args.length == 0) return State_overrides.state || manager.store.getState();
	if (typeof args[0] == "function") pathSegments = ConvertPathGetterFuncToPropChain(args[0]);

	/*else if (typeof args[0] == "string") pathSegments = args;
	else [options, ...pathSegments] = args;

	// if only one string provided, assume it's the full path
	if (pathSegments.length === 1) {
		pathSegments = e.SplitStringBySlash_Cached(pathSegments[0] as string);
	}*/

	// this version is faster because it doesn't need the [...pathSegments] for the State_Base({}, "full/string/path") variant
	else if (typeof args[0] == "string") {
		pathSegments = args.length === 1 ? e.SplitStringBySlash_Cached(args[0] as string) : args;
	} else {
		[options] = args;
		pathSegments = args.length === 2 ? e.SplitStringBySlash_Cached(args[1] as string) : args.slice(1);
	}

	if (manager.devEnv && !g.inSpeedTest) {
		Assert(pathSegments.every(segment=>segment != null), `Path-segment cannot be null. @segments(${pathSegments})`);
		Assert(pathSegments.every(segment=>typeof segment == "number" || !segment.includes("/")),
			`Each string path-segment must be a plain prop-name. (ie. contain no "/" separators) @segments(${pathSegments})`);
	}

	options.state = options.state || State_overrides.state || manager.store.getState();
	options.countAsAccess = options.countAsAccess != null ? options.countAsAccess : (State_overrides.countAsAccess != null ? State_overrides.countAsAccess : true);

	//const selectedData = DeepGet(options.state, pathSegments);
	const selectedData = GetStoreValue(options.state, pathSegments);
	//if (options.countAsAccess && pathSegments.length) {
	if (options.countAsAccess) {
		const path = typeof args[0] === "string" && args.length === 1 ? args[0] : pathSegments.join("/");
		//Assert(g.inConnectFunc, "State(), with countAsAccess:true, must be called from within a Connect() func.");
		e.OnAccessPath(path, selectedData);
	}
	return selectedData;
});

export function CreateState<RootState>() {
	/*function State<T>(): RootState;
	function State<T>(pathGetterFunc: (state: RootState)=>T): T;
	function State<T>(...pathSegments: (string | number)[]);
	function State<T>(options: State_Options, ...pathSegments: (string | number)[]);
	function State<T>(...args) {
		return State_Base(...args);
	}
	return State;*/
	//return State_Base as typeof State_Base<RootStateType, any>;
	return State_Base as StateFunc_WithWatch<RootState>;
}

export function StorePath(pathGetterFunc: (state: RootState_Base)=>any) {
	return ConvertPathGetterFuncToPropChain(pathGetterFunc).join("/");
}

/*export function InjectReducer(store, {key, reducer}) {
	store.asyncReducers[key] = reducer;
	store.replaceReducer(MakeRootReducer(store.asyncReducers));
}*/

export function CreateACTSet<RootState>() {
	type ACTSet_Payload = {path: string | ((state: RootState)=>any), value};
	return class ACTSet extends Action<ACTSet_Payload> {
		constructor(path: string | ((state: RootState)=>any), value) {
			if (typeof path == "function") path = StorePath(path);
			super({path, value});
			this.type = `ACTSet_${path}`; //.replace(/[^a-zA-Z0-9]/g, "_"); // add path to action-type, for easier debugging in dev-tools
		}
		type: string;
	};
}
export function CreateSimpleReducer<RootState>() {
	return function SimpleReducer(path: string | ((store: RootState)=>any), defaultValue = null) {
		if (IsFunction(path)) path = StorePath(path);
		return (state = defaultValue, action: Action<any>)=>{
			if (IsACTSetFor(action, path as string)) return action.payload.value;
			return state;
		};
	};
}

export class ActionSet extends Action<{actions: Action<any>[]}> {
	static EnsureActionFlattened(action: Action<any>, includeSelfIfActionSet = false) {
		if (action.Is(ActionSet)) {
			return action.payload.actions.concat(includeSelfIfActionSet ? [action] : []);
		}
		return [action];
	}

	constructor(...actions: Action<any>[]) {
		Assert(actions.find(action=>action instanceof Array) == null, "Your code should be \"new ActionSet(action1, action2, ...)\", not \"new ActionSet(actions)\".");
		Assert(actions.find(action=>action.type == "ActionSet") == null, "An ActionSet cannot contain an ActionSet as a subaction. (unfold the subactions manually)");
		super({actions});
	}
}

export let bufferedActions: Action<any>[];
export function StartBufferingActions() {
	bufferedActions = [];
}
export function StopBufferingActions() {
	const oldBufferedActions = bufferedActions;
	bufferedActions = null;
	if (oldBufferedActions.length == 1) {
		manager.store.dispatch(oldBufferedActions[0]);
	} else if (oldBufferedActions.length > 1) {
		manager.store.dispatch(new ActionSet(...oldBufferedActions));
	}
}

/* export let uiConnectRefreshCalls: ((targetThis, rootState, props)=>any)[];
export function StartBufferingUIConnectRefreshes() {
	uiConnectRefreshCalls = [];
}
export function StopBufferingUIConnectRefreshes() {
	const oldUIConnectRefreshCalls = uiConnectRefreshCalls;
	uiConnectRefreshCalls = null;
	for (let refreshCall of oldUIConnectRefreshCalls) {
		// todo
	}
} */