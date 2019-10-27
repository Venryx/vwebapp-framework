//export {useSelector as UseSelector} from "react-redux";
import {Assert} from "js-vextensions";
import _ from "lodash";
import {useEffect, useState} from "react";
import {shallowEqual, useSelector} from "react-redux";
import {BaseComponent} from "react-vextensions";
import {ClearAccessedPaths, ClearRequestedPaths, ClearRequests_Query, GetRequestedPaths, GetRequests_Query_JSON, SetListeners, SetListeners_Query} from "../..";
import {g} from "../../PrivateExports";

export class PathWatchNode {
	constructor(parent: PathWatchNode, key: string, initialValue: any) {
		this.parent = parent;
		this.key = key;
		this.lastValue = initialValue;
	}

	parent: PathWatchNode;
	key: string;
	path_cached: string;
	GetPath() {
		if (this.path_cached == null) {
			let result = this.key;
			let nextParent = this.parent;
			while (nextParent != null && nextParent.key != null) {
				result = `${nextParent.key}/${result}`;
				nextParent = nextParent.parent;
			}
			this.path_cached = result;
		}
		return this.path_cached;
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
			child.value.CheckForChanges(newVal != null ? newVal[child.key] : undefined);
		}
	}
}

export const pathWatchTree = new PathWatchNode(null, null, null);

// this enhancer must be called before react-redux's enhancer (so put this one earlier in compose list)
export const pathWatchManagerEnhancer = createStore=>(reducer, initialState)=>{
	const store = createStore(reducer, initialState);
	pathWatchTree.lastValue = store.getState();
	store.subscribe(()=>{
		//Log("Checking CheckPathWatchTreeForChanges");
		CheckPathWatchTreeForChanges(store);
	});
	return store;
};

export function CheckPathWatchTreeForChanges(store) {
	pathWatchTree.CheckForChanges(store.getState());
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

export function GetStoreValue(storeState: any, pathSegments: (string | number)[]) {
	let targetNode = pathWatchTree;
	//let targetStoreVal = manager.store.getState();
	let targetStoreVal = storeState;

	for (const [index, pathNode] of pathSegments.entries()) {
		targetStoreVal = targetStoreVal != null ? targetStoreVal[pathNode] : undefined;
		targetNode = targetNode.GetChild(pathNode, targetStoreVal);
	}

	if (currentWatcherBeingRun) {
		targetNode.NotifyWatcherAccess(currentWatcherBeingRun);
	}

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
		this.needsRerun = true; // just set flag; the useSelector() is subscribed to store, so will automatically re-run the code within Watch
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
	comp: BaseComponent<any>;
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
		const comp = BaseComponent.componentCurrentlyRendering as BaseComponent<any> & {watches_lastRenderID: number, watches_lastRunWatchID: number};
		const [watcher, __] = useState(new Watcher({comp}));
		Assert(watcher.comp == comp);
		useEffect(()=>{
			// cleanup function (runs when component is unmounted)
			return ()=>{
				//watcher.ClearNodeWatches();
				watcher.DisconnectAndMarkDisabled();
			};
		}, []);

		// figure out render-id (index) and watcher-id (index)
		const renderID = comp.renderCount - 1;
		const isFirstWatchOfRender = renderID != comp.watches_lastRenderID;
		if (isFirstWatchOfRender) comp.watches_lastRunWatchID = -1;
		const watchID = comp.watches_lastRunWatchID + 1;
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
			const watchedNodes_pathsAndValues = watcher.watchedNodes.ToMap((a, index)=>`${_.padStart(index.toString(), 3, " ")}: ${a.GetPath()}`, a=>a.lastValue);
			const requestedDBPaths = DBHelper_Post(watcher);

			// add some debug info to the component's debug object, for viewing in react-devtools
			const debugKey_base = `watcher${_.padStart((watchID + 1).toString(), 2, "0")} `;
			const debugKey = `${debugKey_base}@store(${watcher.watchedNodes.length}) @db(${requestedDBPaths.length})`;
			const zws = String.fromCharCode(65279); // zero width space (used to force ordering of object keys)
			const debugData = {
				[`${zws.repeat(0)}readsFromStore @length(${watcher.watchedNodes.length})`]: watchedNodes_pathsAndValues,
				[`${zws.repeat(1)}requestsFromDB @length(${requestedDBPaths.length})`]: requestedDBPaths,
				[`${zws.repeat(2)}result`]: result,
				[`${zws.repeat(3)}oldResult`]: watcher.lastResult,
				[`${zws.repeat(4)}otherData`]: watcher,
			};
			comp.debug.VKeys().filter(a=>a.startsWith(debugKey_base)).forEach(key=>Reflect.deleteProperty(comp.debug, key)); // delete old versions of entry
			comp.Debug({[debugKey]: debugData}); // store new version

			watcher.lastDependencies = dependencies;
			watcher.lastResult = result;
			watcher.needsRerun = false; // reset flag
			return result;
		});
	} finally {
		inWatchFunc = false;
	}
}

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

	return requestedPaths;
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