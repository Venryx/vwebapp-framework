//export {useSelector as UseSelector} from "react-redux";
import {Assert, WaitXThenRun, ToNumber} from "js-vextensions";
import _ from "lodash";
import {useEffect, useState} from "react";
import {shallowEqual, useSelector} from "react-redux";
import {BaseComponent} from "react-vextensions";
import {SetListeners, SetListeners_Query, manager} from "../..";
import {g} from "../../PrivateExports";
import {accessedStorePaths} from "../Database/FirebaseConnect";

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
			// if watcher is a "root watcher" (ie. under comp render-func, but NOT within a SubWatch call), and current processing IS within a SubWatch call, don't notify this watcher (it should only watch for when SubWatch returns a new result)
			if (watcher.IsRootWatcher && watchStack.length >= 2) return;
			watcher.NotifyThatSomethingWatchedHasChanged();
		});
		this.lastValue = newVal;

		// process for children
		for (const child of this.children.Pairs()) {
			child.value.CheckForChanges(newVal != null ? newVal[child.key] : undefined);
		}
	}
}

export const pathWatchTree = new PathWatchNode(null, null, null);

/** This enhancer must be called before react-redux's enhancer. (so put this one earlier in the compose list) */
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

export function GetStoreValue(storeState: any, pathSegments: (string | number)[]) {
	let targetNode = pathWatchTree;
	//let targetStoreVal = manager.store.getState();
	let targetStoreVal = storeState;

	for (const [index, pathNode] of pathSegments.entries()) {
		targetStoreVal = targetStoreVal != null ? targetStoreVal[pathNode] : undefined;
		targetNode = targetNode.GetChild(pathNode, targetStoreVal);
	}

	if (watchStack.length) {
		targetNode.NotifyWatcherAccess(watchStack.Last());
	}

	return targetStoreVal;
}

// watcher part
// ==========

export const watchStack = [] as Watcher[];
export class Watcher {
	constructor(initialData?: Partial<Watcher>) {
		this.Extend(initialData);
	}

	// if this watcher is from a SubWatch call, it may have watchers above it that we need to track (so we know when we can destroy ourself)
	parentWatchers = [] as Watcher[]; // ancestor watchers, for our result
	NotifyParentWatcherUnlinked(parentWatcher: Watcher) {
		this.parentWatchers.Remove(parentWatcher);
		if (this.parentWatchers.length == 0) {
			//this.DisconnectAndMarkDisabled();
			//this.InXSecondsIfStillNoParentWatchers_DisconnectAndMarkDisabled();
			// destroying a sub-watcher potentially discards valuable cached data -- thus only proceed with it if, at the end of the current call stack, this sub-watcher remains without a parent watcher
			WaitXThenRun(0, ()=>{
				if (this.parentWatchers.length == 0) {
					this.Destroy();
				}
			});
		}
	}
	watchedSubWatchers = [] as Watcher[];
	ClearSubWatcherWatches() {
		for (const subWatcher of this.watchedSubWatchers) {
			//subWatcher.parentWatchers.Remove(this);
			subWatcher.NotifyParentWatcherUnlinked(this);
		}
		this.watchedSubWatchers = [];
	}

	accessor: (watcher: Watcher)=>any; // the "watcher" param is supplied for convenience only (for debugging and such)
	lastDependencies: any[];
	lastResult: any;
	runCount = 0;
	needsRerun = true;
	Run(dependencies: any[]) {
		if (this.IsRootWatcher) Assert(watchStack.length == 0);
		// clear old watcher<>pathWatchNode links (so the entries we're about to add are the only ones -- thus releasing watch-paths the watcher doesn't want/ask-for anymore)
		this.ClearNodeWatches();
		this.ClearSubWatcherWatches();
		this.requestedDBPaths_previous = this.requestedDBPaths;
		this.requestedDBPaths = [];
		this.requestedDBQueries_previous = this.requestedDBQueries;
		this.requestedDBQueries = [];

		watchStack.push(this);
		let result;
		try {
			result = this.accessor(this);
		} finally {
			Assert(watchStack.Last() == this);
			watchStack.RemoveAt(watchStack.length - 1);
			if (this.IsRootWatcher) Assert(watchStack.length == 0);
		}

		this.ApplyDBRequests();
		this.lastDependencies = dependencies;
		this.lastResult = result;
		this.runCount++;
		this.needsRerun = false; // reset flag
		return result;
	}

	NotifyThatSomethingWatchedHasChanged() {
		Assert(!this.destroyed);
		if (this.IsRootWatcher) {
			this.needsRerun = true; // just set flag; the useSelector() is subscribed to store, so will automatically re-run the code within Watch
		} else {
			const oldResult = this.lastResult;
			this.Run([]); // subwatchers never have (passed) dependencies, since their accessors are disallowed from accessing non-cell-id closure values
			if (this.lastResult !== oldResult) {
				this.parentWatchers.forEach(a=>a.NotifyThatSomethingWatchedHasChanged());
			}
		}
	}

	watchedNodes = [] as PathWatchNode[];
	ClearNodeWatches() {
		for (const node of this.watchedNodes) {
			node.watchers.Remove(this);
		}
		this.watchedNodes = [];
	}

	destroyed = false; // just a safety field, to notice if we try to interact with a Watcher after it's been "destroyed"
	Destroy() {
		Assert(!this.destroyed);
		this.ClearNodeWatches();
		this.ClearSubWatcherWatches();
		if (this.IsSubWatcher) {
			// remove last reference to subwatcher, so it can be garbage-collected
			delete subWatchers[subWatchers.Pairs().find(a=>a.value == this).key];
		}
		this.destroyed = true;
	}

	// extra
	comp: BaseComponent<any>;
	get IsRootWatcher() { return this.comp != null; }
	get IsSubWatcher() { return this.comp == null; }

	requestedDBPaths_previous = [] as string[];
	requestedDBPaths = [] as string[];
	NotifyDBPathRequestMade(path: string) {
		if (!this.requestedDBPaths.Contains(path)) this.requestedDBPaths.push(path);
	}
	requestedDBQueries_previous = [] as string[];
	requestedDBQueries = [] as string[];
	NotifyDBQueryRequestMade(queryJSON: string) {
		if (!this.requestedDBQueries.Contains(queryJSON)) this.requestedDBQueries.push(queryJSON);
	}
	ApplyDBRequests() {
		// we call setImmediate so that the UI doesn't freeze up (it does this during Cypress tests, anyway)
		function RunImmediately(func: Function) {
			func();
			// if using one of these delayed versions, you have to change the code below to make a local copy of this.requestedDBPaths and such, so the delayed callback has the same value as here
			//if (!g.Cypress) func();
			//g.setImmediate(func);
			//g.setTimeout(func, 0);
		}

		if (!shallowEqual(this.requestedDBPaths, this.requestedDBPaths_previous)) {
			RunImmediately(()=>{
				const removedPaths = this.requestedDBPaths_previous.Except(...this.requestedDBPaths);
				// todo: find correct way of unwatching paths; the way below seems to sometimes unwatch while still needed watched (for now, we just never unwatch)
				// UnsetListeners(removedPaths);
				const addedPaths = this.requestedDBPaths.Except(...this.requestedDBPaths_previous);
				SetListeners(addedPaths);
			});
		}

		// query requests // todo: clean this up
		// if (firebase._ && ShallowChanged(requestedPaths, oldRequestedPaths)) {
		if (!shallowEqual(this.requestedDBQueries, this.requestedDBQueries_previous)) {
			RunImmediately(()=>{
				const removedQueries = this.requestedDBQueries_previous.Except(...this.requestedDBQueries);
				// todo: find correct way of unwatching queries
				const addedQueries = this.requestedDBQueries.Except(...this.requestedDBQueries_previous);
				//SetListeners(addedPaths);
				SetListeners_Query(addedQueries);
			});
		}
	}

	debugDataHistory = [] as any[];
}
/* export class SubWatcher {
	watchersOfSelf = [] as Watcher[]; // ancestor watchers, for our result
} */

export function Watch<T>(accessor: (watcher: Watcher)=>T, dependencies: any[]): T {
	Assert(watchStack.length == 0, "Cannot have calls to Watch within a Watch accessor. (try using SubWatch)");

	const comp = BaseComponent.componentCurrentlyRendering as BaseComponent<any> & {watches_lastRenderID: number, watches_lastRunWatchID: number};
	const [watcher, __] = useState(new Watcher({comp}));
	Assert(watcher.comp == comp);
	useEffect(()=>{
		// cleanup function (runs when component is unmounted)
		return ()=>{
			//watcher.ClearNodeWatches();
			watcher.Destroy();
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
		if (watcher.needsRerun || !shallowEqual(dependencies, watcher.lastDependencies)) {
			watcher.accessor = accessor; // we need to update this each time, due to the old closure being outdated
			watcher.Run(dependencies);

			// add some debug info to the component's debug object, for viewing in react-devtools
			const debugKey_base = `Watcher${_.padStart((watchID + 1).toString(), 2, "0")} `;
			const accessorDisplayStr = `@${accessor["displayName"] || ""}(${(dependencies || []).map(()=>"X").join(",")})`;
			const debugKey = [debugKey_base, `@store(${watcher.watchedNodes.length})`, `@db(${watcher.requestedDBPaths.length})`, accessorDisplayStr].filter(a=>a).join(" ");
			const zws = String.fromCharCode(65279); // zero width space (used to force ordering of object keys)
			const watchedNodes_pathsAndValues = watcher.watchedNodes.ToMap((a, index)=>`${_.padStart(index.toString(), 3, " ")}: ${a.GetPath()}`, a=>a.lastValue);
			const debugData = {
				[`${zws.repeat(0)}${accessorDisplayStr}`]: dependencies,
				[`${zws.repeat(1)}Result`]: watcher.lastResult,
				[`${zws.repeat(2)}ReadsFromStore @length(${watcher.watchedNodes.length})`]: watchedNodes_pathsAndValues,
				[`${zws.repeat(3)}RequestsFromDB @length(${watcher.requestedDBPaths.length})`]: watcher.requestedDBPaths,
				[`${zws.repeat(4)}OtherData`]: watcher,
			};
			watcher.debugDataHistory.Insert(0, debugData);
			comp.debug.VKeys().filter(a=>a.startsWith(debugKey_base)).forEach(key=>Reflect.deleteProperty(comp.debug, key)); // delete old versions of entry
			comp.Debug({[debugKey]: debugData}); // store new version
		}
		return watcher.lastResult;
	});
}

// for profiling
class StoreAccessorProfileData {
	constructor(name: string) {
		this.name = name;
		// make names the same length, for easier scanning in console listing // not needed for console.table
		//this.name = _.padEnd(name, 50, " ");
		this.callCount = 0;
		this.totalRunTime = 0;
		this.totalRunTime_asRoot = 0;
	}
	name: string;
	callCount: number;
	totalRunTime: number;
	totalRunTime_asRoot: number;
	//origAccessors: Function[];
}
export const storeAccessorProfileData = {} as {[key: string]: StoreAccessorProfileData};
export function LogStoreAccessorRunTimes() {
	const accessorRunTimes_ordered = storeAccessorProfileData.VValues().OrderByDescending(a=>a.totalRunTime);
	Log(`Store-accessor cumulative run-times: @TotalCalls(${accessorRunTimes_ordered.map(a=>a.callCount).Sum()}) @TotalTimeInRootAccessors(${accessorRunTimes_ordered.map(a=>a.totalRunTime_asRoot).Sum()})`);
	//Log({}, accessorRunTimes_ordered);
	console.table(accessorRunTimes_ordered);
}

// for profiling
export const accessorStack = [];

export function StoreAccessor<Func extends Function>(accessor: Func): Func & {Watch: Func};
export function StoreAccessor<Func extends Function>(name: string, accessor: Func): Func & {Watch: Func};
export function StoreAccessor(...args) {
	let name: string, accessor: Function;
	if (args.length == 1) [accessor] = args;
	else if (args.length == 2) [name, accessor] = args;

	// add profiling to the accessor function
	//if (manager.devEnv) { // manager isn't populated yet
	if (g.DEV) {
		const accessor_orig = accessor;
		accessor = (...callArgs)=>{
			accessorStack.push(name);

			const startTime = performance.now();
			//return accessor.apply(this, callArgs);
			const result = accessor_orig(...callArgs);
			const runTime = performance.now() - startTime;

			const profileData = storeAccessorProfileData[name] || (storeAccessorProfileData[name] = new StoreAccessorProfileData(name));
			profileData.callCount++;
			profileData.totalRunTime += runTime;
			if (accessorStack.length == 1) {
				profileData.totalRunTime_asRoot += runTime;
			}
			// name should have been added by webpack transformer, but if not, give some info to help debugging
			if (name == null) {
				profileData["origAccessors"] = profileData["origAccessors"] || [];
				if (!profileData["origAccessors"].Contains(accessor_orig)) {
					profileData["origAccessors"].push(accessor_orig);
				}
			}

			accessorStack.RemoveAt(accessorStack.length - 1);
			return result;
		};
	}

	if (name) accessor["displayName"] = name;
	accessor["Watch"] = function(...callArgs) {
		//const accessor_withCallArgsBound = accessor.bind(null, ...callArgs); // bind is bad, because it doesn't "gobble" the "watcher" arg
		const accessor_withCallArgsBound = ()=>{
			//return accessor.apply(this, callArgs);
			return accessor(...callArgs);
			//return accessor_withProfiling(...callArgs);
		};
		if (name) accessor_withCallArgsBound["displayName"] = name;
		//outerAccessor["callArgs"] = callArgs;
		//outerAccessor["displayName"] = `${name || "Unknown"}(${callArgs.join(", ")})`;
		return Watch(accessor_withCallArgsBound, callArgs);
	};
	return accessor as any;
}

// sub-watch system
// ==========

/* export class SubWatchStorage<T2, T3> {
	watchersOfSelf = [] as Watcher[]; // ancestor watchers, for our result
	watcher = new Watcher(); // our watcher, for the store-paths we access
}
export const subWatchers = {} as {[storageKey: string]: Watcher};
export function GetStorageForSubWatch<T2, T3>(transformType: string, staticProps: any[]) {
	//let storageKey = transformType + "|" + JSON.stringify(staticProps);
	const storageKey = `${transformType}|${staticProps.join("|")}`;
	const storage = subWatchers[storageKey] as SubWatchStorage<T2, T3> || (subWatchers[storageKey] = new SubWatchStorage<T2, T3>());
	return storage;
} */
export const subWatchers = {} as {[storageKey: string]: Watcher};
type SafePrimitive = boolean | string | number;
type SafeParam = SafePrimitive | SafePrimitive[];
function IsSafePrimitive(val) { return val == null || typeof val == "boolean" || typeof val == "number" || typeof val == "string"; }
function IsSafeParam(val) { return IsSafePrimitive(val) || (val instanceof Array && val.every(IsSafePrimitive)); }
export function GetSubWatcherForAccessorID(accessorID_base: string, accessorID_params: SafeParam[]) {
	//Assert(accessorID_params.every(IsSafePrimitive), `Every entry in accessorID_params must be a primitive. See the description of the SubWatch function for an explanation of why this is needed.`);
	Assert(accessorID_params.every(IsSafeParam), `Every entry in accessorID_params must be a primitive (or primitive-array). See the description of the SubWatch function for an explanation of why this is needed.`);

	//let storageKey = `${accessorID_base}|${JSON.stringify(accessorID_params)}`;
	const storageKey = `${accessorID_base}|${accessorID_params.map(a=>(a === undefined ? null : a)).join("|")}`;
	const storage = subWatchers[storageKey] as Watcher || (subWatchers[storageKey] = new Watcher());
	return storage;
}

/** ```markdown
 * Instructions for use: Find a slow accessor, which -- after being given the cell identification parameters -- can continue to operate without any "new passed information". (this is necessary for the "bubble up only" refresh mechanism to work)
 *
 * What is meant by "cell id base" and "cell id parameters"? Simply put, they're the "key" by which a unique memory cell is created and stored.
 * The "cell id base" should usually just be the name of the high-level getter/accessor function that SubWatch will be used in.
 * The "cell id parameters" is an array of primitives (or primitive-arrays) that supplement the id-base, making the full-id specific enough that its "memory cell" remains *stable* between renders/calls. (assuming the underlying data remains stable)
 ``` */
export function SubWatch<Result>(cellID_base: string, cellID_params: SafeParam[], accessor: (watcher: Watcher)=>Result): Result {
	const watcher = GetSubWatcherForAccessorID(cellID_base, cellID_params);
	const parentWatcher = watchStack.LastOrX();
	if (parentWatcher) {
		if (!parentWatcher.watchedSubWatchers.Contains(watcher)) {
			watcher.watchedSubWatchers.push(watcher);
			watcher.parentWatchers.push(parentWatcher);
		}
	}

	//if (watcher.needsRerun || !shallowEqual(dependencies, watcher.lastDependencies)) {
	//if (watcher.needsRerun) {
	if (watcher.runCount == 0) {
		// We only need to set the accessor once. How come we can do that here, but not in Watch?
		// Because unlike Watch accessors, SubWatch accessors are disallowed from using closure values (other than those passed in the cellID_params array).
		// Instead, all data they access is supplied by the functions they call. This makes the "bubble up only" refresh mechanism possible.
		//if (watcher.accessor == null) {
		watcher.accessor = accessor;
		watcher.Run([]);
	}
	return watcher.lastResult;
}