//export {useSelector as UseSelector} from "react-redux";
import {Assert} from "js-vextensions";
import {useState, useEffect} from "react";
import {shallowEqual, useSelector} from "react-redux";
import {BaseComponent} from "react-vextensions";
import _ from "lodash";
import {ClearAccessedPaths, ClearRequestedPaths, ClearRequests_Query, GetRequestedPaths, GetRequests_Query_JSON, manager, SetListeners, SetListeners_Query} from "../..";
import {OnStoreCreated} from "../../Manager";
import {g} from "../../PrivateExports";

export class PathWatchNode {
	constructor(parent: PathWatchNode, key: string, initialValue: any) {
		this.parent = parent;
		this.key = key;
		this.lastValue = initialValue;
	}

	parent: PathWatchNode;
	key: string;
	GetPath() {
		let result = this.key;
		let nextParent = this.parent;
		while (nextParent != null && nextParent.key != null) {
			result = `${nextParent.key}/${result}`;
			nextParent = nextParent.parent;
		}
		return result;
	}

	children = {} as {[key: string]: PathWatchNode};
	GetChild(key: string | number, currentValue: any) {
		if (this.children[key] == null) {
			this.children[key] = new PathWatchNode(this, key.toString(), currentValue);
		}
		return this.children[key];
	}

	watchers = [] as Watcher[];
	NotifyWatcherAccess(watcher: Watcher) {
		// check node.watchers instead of watcher.watchedNodes, since node.watchers will tend to be smaller
		if (!this.watchers.Contains(watcher)) {
			this.watchers.push(watcher);
			watcher.watchedNodes.push(this);
		}
	}

	lastValue: any;
	CheckForChanges(newVal) {
		// if our value is the same, we know the whole subtree is the same (since reducers never mutate the state-tree)
		if (newVal === this.lastValue) return;

		// process for self
		this.watchers.forEach(watcher=>{
			watcher.NotifyDataChanged();
		});
		this.lastValue = newVal;

		// process for children
		for (const child of this.children.Pairs()) {
			child.value.CheckForChanges(newVal[child.key]);
		}
	}

	/*currentCallStoreValue: any;
	// gets value, with other processing
	GetValue() {
		//let newValue =
	}*/
}

export const pathWatchTree = new PathWatchNode(null, null, null);

OnStoreCreated(()=>{
	//pathWatchTree = new PathWatchNode(manager.store.getState());
	pathWatchTree.lastValue = manager.store.getState();
	manager.store.subscribe(()=>{
		CheckPathWatchTreeForChanges();
	});
});
export function CheckPathWatchTreeForChanges() {
	pathWatchTree.CheckForChanges(manager.store.getState());
}

export let currentWatcherBeingRun: Watcher;
export function NotifyWatcherRunStart(watcher: Watcher) {
	Assert(currentWatcherBeingRun == null);
	currentWatcherBeingRun = watcher;
	// clear old watcher<>pathWatchNode links (so the entries we're about to add are the only ones -- thus releasing watch-paths the watcher doesn't want/ask-for anymore)
	watcher.ClearNodeWatches();
}
export function NotifyWatcherRunEnd(watcher: Watcher) {
	Assert(currentWatcherBeingRun == watcher);
	currentWatcherBeingRun = null;
}
// todo: figure out why multiple watchers are being run at the same time, and resolve it if possible
/*export const currentWatchersBeingRun = [] as Watcher[];
export function NotifyWatcherRunStart(watcher: Watcher) {
	if (currentWatchersBeingRun.Contains(watcher)) return;
	currentWatchersBeingRun.push(watcher);
}
export function NotifyWatcherRunEnd(watcher: Watcher) {
	currentWatchersBeingRun.Remove(watcher);
}*/

export function GetStoreValue(storeState: any, pathSegments: (string | number)[]) {
	let targetNode = pathWatchTree;
	//let targetStoreVal = manager.store.getState();
	let targetStoreVal = storeState;

	for (const pathNode of pathSegments) {
		//if (targetNode == null) break;
		if (targetStoreVal == null) break;
		//targetNode = targetNode.children[pathNode];
		targetStoreVal = targetStoreVal[pathNode];
		targetNode = targetNode.GetChild(pathNode, targetStoreVal);

		/* if (targetNode.lastValue !== targetStoreVal) {
			//targetNode.currentCallStoreValue = targetStoreVal;
			targetNode.NotifyValueChanged(targetStoreVal);
		} */
	}
	//if (targetNode == null) return null;
	//if (targetStoreVal == null) return null;

	if (currentWatcherBeingRun) {
		targetNode.NotifyWatcherAccess(currentWatcherBeingRun);
	}
	/*for (const watcher of currentWatchersBeingRun) {
		targetNode.NotifyWatcherAccess(watcher);
	}*/

	//return targetNode.GetValue();
	return targetStoreVal;
}

// watcher part
// ==========

export class Watcher {
	constructor(initialData?: Partial<Watcher>) {
		this.Extend(initialData);
	}
	lastDependencies: any[];
	lastResult: any;
	needsRerun = true;
	NotifyDataChanged() {
		Assert(!this.disabled);
		this.needsRerun = true;
	}

	watchedNodes = [] as PathWatchNode[];
	ClearNodeWatches() {
		for (const node of this.watchedNodes) {
			node.watchers.Remove(this);
		}
		this.watchedNodes = [];
	}

	disabled = false; // just a safety field, to notice if we try to interact with a Watcher after it's been disconnected-and-disabled
	DisconnectAndMarkDisabled() {
		Assert(!this.disabled);
		this.ClearNodeWatches();
		this.disabled = true;
	}

	// extra
	db_lastRequestedPaths: string[];
	db_lastQueryRequests: string[];
}

export let inWatchFunc = false;
//export let inWatchFunc_lastStack: string;
export function Watch<T>(accessor: ()=>T, dependencies: any[]): T {
	//Assert(inRenderFunc, "The .Watch() variant of a store-selector function can only be called within a component's render() function.");
	Assert(!inWatchFunc, "Cannot have calls to Watch within a Watch accessor.");
	//Assert(!inWatchFunc, ()=>LogError("Cannot have calls to Watch within a Watch accessor. Other stack:", inWatchFunc_lastStack));
	inWatchFunc = true;
	//inWatchFunc_lastStack = GetStackTraceStr();

	try {
		/*const [_, triggerRefresh_setter] = useState(0);
		const TriggerWatcherRefresh = ()=>triggerRefresh_setter(Date.now());*/
		/*const [, forceRender_raw] = useReducer(s=>s + 1, 0);
		const ForceRender = ()=>forceRender_raw({});*/

		/*const [watcher, _] = useState(new Watcher({
			NotifyDataChanged: ForceRender,
		}));*/
		const [watcher, __] = useState(new Watcher());
		useEffect(()=>{
			// cleanup function (runs when component is unmounted)
			return ()=>{
				//watcher.ClearNodeWatches();
				watcher.DisconnectAndMarkDisabled();
			};
		}, []);

		// add this watcher's watched-paths to the component's stash, for debugging
		const comp = BaseComponent.componentCurrentlyRendering as BaseComponent<any> & {watches_lastRenderID: number, watches_lastRunWatchID: number};
		const renderID = comp.renderCount;
		const isFirstWatchOfRender = renderID != comp.watches_lastRenderID;
		if (isFirstWatchOfRender) comp.watches_lastRunWatchID = -1;
		const watchID = comp.watches_lastRunWatchID + 1;
		comp.Debug({[`watcher${_.padStart((watchID + 1).toString(), 2, "0")}_paths`]: watcher.watchedNodes.map(a=>a.GetPath())});
		comp.watches_lastRenderID = renderID;
		comp.watches_lastRunWatchID = watchID;

		return useSelector(()=>{
			if (!watcher.needsRerun && shallowEqual(dependencies, watcher.lastDependencies)) {
				return watcher.lastResult;
			}

			DBHelper_Pre();
			NotifyWatcherRunStart(watcher);
			let result;
			try {
				result = accessor();
			} finally {
				NotifyWatcherRunEnd(watcher);
			}
			DBHelper_Post(watcher);

			watcher.lastDependencies = dependencies;
			watcher.lastResult = result;
			watcher.needsRerun = false; // reset flag
			return result;
		});
	} finally {
		inWatchFunc = false;
	}
}

/*const setTimeout_clearStack_funcs = [];
const timer = new Timer(100, ()=>{
	for (const func of setTimeout_clearStack_funcs) {
		func();
	}
	setTimeout_clearStack_funcs.length = 0;
}).Start();
export function setTimeout_clearStack(func) {
	setTimeout_clearStack_funcs.push(func);
}*/

function DBHelper_Pre() {
	// these are for db-requests
	ClearRequestedPaths();
	ClearAccessedPaths();
	//Assert(GetAccessedPaths().length == 0, "Accessed-path must be empty at start of mapStateToProps call (ie. the code in Connect()).");
	ClearRequests_Query();
}
function DBHelper_Post(watcher: Watcher) {
	// we call setImmediate so that the UI doesn't freeze up (it does this during Cypress tests, anyway)
	function RunImmediately(func: Function) {
		//func();
		//if (!g.Cypress) func();
		g.setImmediate(func);
		//g.setTimeout(func, 0);
		//g.setTimeout(func, 10000);
	}

	const oldRequestedPaths: string[] = watcher.db_lastRequestedPaths || [];
	const requestedPaths: string[] = GetRequestedPaths();
	if (!shallowEqual(requestedPaths, oldRequestedPaths)) {
		RunImmediately(()=>{
			const removedPaths = oldRequestedPaths.Except(...requestedPaths);
			// todo: find correct way of unwatching paths; the way below seems to sometimes unwatch while still needed watched (for now, we just never unwatch)
			// UnsetListeners(removedPaths);
			const addedPaths = requestedPaths.Except(...oldRequestedPaths);
			SetListeners(addedPaths);
		});
		watcher.db_lastRequestedPaths = requestedPaths;
	}

	// query requests // todo: clean this up
	const oldQueryRequests: string[] = watcher.db_lastQueryRequests || [];
	const queryRequests: string[] = GetRequests_Query_JSON();
	// if (firebase._ && ShallowChanged(requestedPaths, oldRequestedPaths)) {
	if (!shallowEqual(queryRequests, oldQueryRequests)) {
		RunImmediately(()=>{
			const removedQueries = oldQueryRequests.Except(...queryRequests);
			// todo: find correct way of unwatching queries
			const addedQueries = queryRequests.Except(...oldQueryRequests);
			//SetListeners(addedPaths);
			SetListeners_Query(addedQueries);
		});
		watcher.db_lastQueryRequests = requestedPaths;
	}
}

export function StoreAccessor<Func extends Function>(accessor: Func): Func & {Watch: Func};
export function StoreAccessor<Func extends Function>(name: string, accessor: Func): Func & {Watch: Func};
export function StoreAccessor(...args) {
	let name: string, accessor: Function;
	if (args.length == 1) [accessor] = args;
	else if (args.length == 2) [name, accessor] = args;

	accessor["Watch"] = function(...callArgs) {
		return Watch(()=>{
			//return accessor.apply(this, callArgs);
			return accessor(...callArgs);
		}, callArgs);
	};
	return accessor as any;
}