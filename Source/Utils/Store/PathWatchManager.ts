//export {useSelector as UseSelector} from "react-redux";
import {Assert, WaitXThenRun, ToNumber} from "js-vextensions";
import _ from "lodash";
import {useEffect, useState} from "react";
import {shallowEqual, useSelector} from "react-redux";
import {BaseComponent} from "react-vextensions";
import {SetListeners, SetListeners_Query, manager} from "../..";
import {g} from "../../PrivateExports";
import {accessedStorePaths} from "../Database/FirebaseConnect";

// can use approach-1 or approach-2
const approach: number = 1;

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
		this.lastValue = newVal;

		// Note: If you want to find out why some data in the store isn't getting "propagated up" to a watcher/component, here is a good place to put a conditional breakpoint.

		// process for self
		const watchers_copy = this.watchers.slice(); // make copy of the watchers array, since calling NotifyThatSomethingWatchedHasChanged() may mutate it (delete destroyed watchers, or reorder persistent watchers)
		watchers_copy.forEach(watcher=>{
			if (watcher.destroyed) return;
			// if watcher is a "root watcher" (ie. under comp render-func, but NOT within a SubWatch call), and current processing IS within a SubWatch call, don't notify this watcher (it should only watch for when SubWatch returns a new result)
			//if (watcher.IsRootWatcher && watchStack.length >= 2) return;
			watcher.NotifyDependencyChanged(this);
		});

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

export class CompUpdateCommand {
	constructor(comp: BaseComponent) {
		this.comp = comp;
	}
	comp: BaseComponent;
	triggeringWatchers = [] as Watcher[];
}

export let CheckPathWatchTreeForChanges_compUpdatesScheduled = [] as CompUpdateCommand[];
export function CheckPathWatchTreeForChanges(store) {
	pathWatchTree.CheckForChanges(store.getState());
	const compUpdates_copy = CheckPathWatchTreeForChanges_compUpdatesScheduled.slice(); // make copy of array, to make sure it doesn't get mutated during the comp-updates
	compUpdates_copy.forEach(update=>{
		if (!update.comp.mounted) return; // parent may have been updated, and unmounted it's child (this comp)
		update.comp.forceUpdate();
		const lastWatcherTriggeredRender_info = {"@RenderIndexAtPoint": update.comp.renderCount - 1};
		for (const watcher of update.triggeringWatchers) {
			const debugInfo = watcher.GetDebugInfo();
			lastWatcherTriggeredRender_info[debugInfo.debugKey] = debugInfo.debugData;
		}
		update.comp.Debug({"@LastChangedWatchers": lastWatcherTriggeredRender_info});
	});
	CheckPathWatchTreeForChanges_compUpdatesScheduled = [];
}
export function ScheduleCompUpdate(comp: BaseComponent, triggeringWatcher: Watcher) {
	let update = CheckPathWatchTreeForChanges_compUpdatesScheduled.find(a=>a.comp == comp);
	if (update == null) {
		update = new CompUpdateCommand(comp);
		CheckPathWatchTreeForChanges_compUpdatesScheduled.push(update);
	}
	if (!update.triggeringWatchers.Contains(triggeringWatcher)) {
		update.triggeringWatchers.push(triggeringWatcher);
	}
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
				// since we're running asynchronously, this may get called multiple times, so check if already destroyed before destroying
				if (this.parentWatchers.length == 0 && !this.destroyed) {
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
		this.needsRerun = false; // reset flag
		this.runCount++;

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

		// add some debug info to the component's debug object, for viewing in react-devtools
		if (this.comp) {
			const debugInfo = this.GetDebugInfo();
			this.debugDataHistory.Insert(0, debugInfo);
			this.comp.debug.VKeys().filter(a=>a.startsWith(debugInfo.debugKey_base)).forEach(key=>Reflect.deleteProperty(this.comp.debug, key)); // delete old versions of entry
			this.comp.Debug({[debugInfo.debugKey]: debugInfo.debugData}); // store new version
		}

		return result;
	}

	NotifyDependencyChanged(changedDependency: PathWatchNode | Watcher) {
		Assert(!this.destroyed);

		// todo: add a similar thing for watched sub-watchers
		if (changedDependency instanceof PathWatchNode) {
			/* let oldEntry = this.watchedNodes_lastChangeRunIndexes.find(a=>a.node == changedDependency);
			if (watchedNodes_lastChangeRunIndexes) */
			this.watchedNodes_lastChangeRunIndexes[changedDependency.path_cached] = this.runCount - 1;
		}

		if (this.IsRootWatcher) {
			if (approach == 1) {
				this.needsRerun = true; // just set flag; the useSelector() is subscribed to store, so will automatically re-run the code within Watch
			} else if (approach == 2) {
				this.needsRerun = true;
				//this.comp.forceUpdate();
				ScheduleCompUpdate(this.comp, this);
			}
		} else {
			const oldResult = this.lastResult;
			this.Run([]); // subwatchers never have (passed) dependencies, since their accessors are disallowed from accessing non-cell-id closure values
			if (this.lastResult !== oldResult) {
				//this.parentWatchers.forEach(a=>a.NotifyThatSomethingWatchedHasChanged());
				const parentWatchers_copy = this.parentWatchers.slice(); // make copy of the watchers array, since calling NotifyThatSomethingWatchedHasChanged() may mutate it (delete destroyed watchers, or reorder persistent watchers)
				parentWatchers_copy.forEach(parentWatcher=>{
					if (parentWatcher.destroyed) return;
					parentWatcher.NotifyDependencyChanged(this);
				});
			}
		}
	}

	watchedNodes = [] as PathWatchNode[];
	//watchedNodes_lastChangeRunIndexes = [] as {node: PathWatchNode, lastChange_runIndex: number}[];
	watchedNodes_lastChangeRunIndexes = {} as {[key: string]: number};
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
	comp_watcherIndex: number;
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
			//func();
			// for cypress, we have to break the call-stack, else it processes way too much data between each UI refresh (and caused errors at one point)
			if (g.Cypress) g.setImmediate(func);
			else func();
			//g.setImmediate(func);
			//g.setTimeout(func, 0);
		}

		// make local copies of these fields, to ensure they're unchanged when processed in a bit by the callbacks below
		const {requestedDBPaths, requestedDBPaths_previous, requestedDBQueries, requestedDBQueries_previous} = this;

		if (!shallowEqual(requestedDBPaths, requestedDBPaths_previous)) {
			RunImmediately(()=>{
				const removedPaths = requestedDBPaths_previous.Except(...requestedDBPaths);
				// todo: find correct way of unwatching paths; the way below seems to sometimes unwatch while still needed watched (for now, we just never unwatch)
				// UnsetListeners(removedPaths);
				const addedPaths = requestedDBPaths.Except(...requestedDBPaths_previous);
				SetListeners(addedPaths);
			});
		}

		// query requests
		// if (firebase._ && ShallowChanged(requestedPaths, oldRequestedPaths)) {
		if (!shallowEqual(requestedDBQueries, requestedDBQueries_previous)) {
			RunImmediately(()=>{
				const removedQueries = requestedDBQueries_previous.Except(...requestedDBQueries);
				// todo: find correct way of unwatching queries
				const addedQueries = requestedDBQueries.Except(...requestedDBQueries_previous);
				//SetListeners(addedPaths);
				SetListeners_Query(addedQueries);
			});
		}
	}

	debugDataHistory = [] as {debugKey: string, debugData: any}[];
	GetDebugInfo() {
		const debugKey_base = `Watcher${_.padStart((this.comp_watcherIndex + 1).toString(), 2, "0")} `;
		const accessorDisplayStr = `@${this.accessor["displayName"] || ""}(${(this.lastDependencies || []).map(()=>"X").join(",")})`;
		const debugKey = [debugKey_base, `@changedAt(${this.comp.renderCount - 1}) @store(${this.watchedNodes.length})`, `@db(${this.requestedDBPaths.length})`, accessorDisplayStr].filter(a=>a).join(" ");
		const zws = String.fromCharCode(65279); // zero width space (used to force ordering of object keys)
		const watchedNode_debugInfos = this.watchedNodes.ToMap((node: PathWatchNode, index)=>{
			//const changedAt = this.watchedNodes_lastChangeRunIndexes.find(a=>a.node == node.path).lastChange_runIndex;
			const changedAt = this.watchedNodes_lastChangeRunIndexes[node.path_cached];
			return `${_.padStart(index.toString(), 3, " ")} @changedAt(${changedAt}) @path: ${node.GetPath()}`;
		}, a=>a.lastValue);
		const debugData = {
			[`${zws.repeat(0)}${accessorDisplayStr}`]: this.lastDependencies,
			[`${zws.repeat(1)}Result`]: this.lastResult,
			[`${zws.repeat(2)}RunIndex`]: this.runCount - 1,
			[`${zws.repeat(3)}ReadsFromStore @length(${this.watchedNodes.length})`]: watchedNode_debugInfos,
			[`${zws.repeat(4)}RequestsFromDB @length(${this.requestedDBPaths.length})`]: this.requestedDBPaths,
			[`${zws.repeat(5)}OtherData`]: this,
		};
		return {debugKey_base, debugKey, debugData};
	}
}
/* export class SubWatcher {
	watchersOfSelf = [] as Watcher[]; // ancestor watchers, for our result
} */

//export let watcherCount = 0;
export function Watch<T>(accessor: (watcher: Watcher)=>T, dependencies: any[]): T {
	Assert(watchStack.length == 0, "Cannot have calls to Watch within a Watch accessor. (try using SubWatch)");

	const comp = BaseComponent.componentCurrentlyRendering as BaseComponent<any> & {watches_lastRenderIndex: number, watches_lastRunWatcherIndex: number};
	const [watcher, __] = useState(new Watcher({comp}));
	/*if (watcher.runCount == 0) {
		watcherCount++;
		Log(`${watcherCount} (created)`);
	}*/
	Assert(watcher.comp == comp);
	useEffect(()=>{
		// cleanup function (runs when component is unmounted)
		return ()=>{
			/*watcherCount--;
			Log(`${watcherCount} (destroyed)`);*/
			//watcher.ClearNodeWatches();
			watcher.Destroy();
		};
	}, []);

	// figure out render-index and watcher-index
	const renderIndex = comp.renderCount - 1;
	const isFirstWatchOfRender = renderIndex != comp.watches_lastRenderIndex;
	if (isFirstWatchOfRender) comp.watches_lastRunWatcherIndex = -1;
	const watcherIndex = comp.watches_lastRunWatcherIndex + 1;
	comp.watches_lastRenderIndex = renderIndex;
	comp.watches_lastRunWatcherIndex = watcherIndex;
	if (watcher.comp_watcherIndex == null) {
		watcher.comp_watcherIndex = watcherIndex;
	}

	// Approach 1 uses the "useSelector(...)" wrapper below; approach 2 doesn't, instead calling forceUpdate() within NotifyThatSomethingWatchedHasChanged()
	// #1 is basically: When accessed store-data changes, re-run accessor-func but without updating the from-render-func closure values [maybe wrong about this, as should cause it to get stuck]. If result changes, then do a full comp re-render.
	// #2 is basically: When accessed store-data changes, do a full comp re-render right away. (however, as for #1, any accessors that didn't have their store-data changed just quick-return the cached result)
	// Which is faster theoretically? #1 should be faster if the accessor-functions (combined, but with cache-hits) have a run-time that is half (or less) than the non-accessor part of comp.render. Else, #2 should be faster.
	// Which is faster in practice (in the CD project)? #2 is actually slightly faster -- 20s instead of 22s -- so I'm going with that for now.

	const proceed = ()=>{
		if (watcher.needsRerun || !shallowEqual(dependencies, watcher.lastDependencies)) {
			watcher.accessor = accessor; // we need to update this each time, due to the old closure being outdated
			watcher.Run(dependencies);
		}
		return watcher.lastResult;
	};
	if (approach == 1) return useSelector(proceed);
	if (approach == 2) return proceed();
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

export type CallArgToDependencyConvertorFunc = (callArgs: any[])=>any[];

export function StoreAccessor<Func extends Function>(accessor: Func, callArgToDependencyConvertorFunc?: CallArgToDependencyConvertorFunc): Func & {Watch: Func};
export function StoreAccessor<Func extends Function>(name: string, accessor: Func, callArgToDependencyConvertorFunc?: CallArgToDependencyConvertorFunc): Func & {Watch: Func};
export function StoreAccessor(...args) {
	let name: string, accessor: Function, callArgToDependencyConvertorFunc: CallArgToDependencyConvertorFunc;
	if (typeof args[0] == "function") [accessor, callArgToDependencyConvertorFunc] = args;
	else [name, accessor, callArgToDependencyConvertorFunc] = args;

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
		const dependencies = callArgToDependencyConvertorFunc ? callArgToDependencyConvertorFunc(callArgs) : callArgs;

		//const accessor_withCallArgsBound = accessor.bind(null, ...callArgs); // bind is bad, because it doesn't "gobble" the "watcher" arg
		const accessor_withCallArgsBound = ()=>{
			//return accessor.apply(this, callArgs);
			return accessor(...callArgs);
			//return accessor_withProfiling(...callArgs);
		};
		if (name) accessor_withCallArgsBound["displayName"] = name;
		//outerAccessor["callArgs"] = callArgs;
		//outerAccessor["displayName"] = `${name || "Unknown"}(${callArgs.join(", ")})`;
		return Watch(accessor_withCallArgsBound, dependencies);
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
	//const storageKey = JSON.stringify([accessorID_base, accessorID_params.map(a=>(a === undefined ? null : a))]);
	//const storageKey = JSON.stringify([accessorID_base as any].concat(accessorID_params));
	//const storageKey = JSON.stringify(arguments);
	//const storageKey = QuickJoinByPipe(arguments as any);
	const storage = subWatchers[storageKey] as Watcher || (subWatchers[storageKey] = new Watcher());
	return storage;
}

// for debugging (run RR.GetChangedSubWatchers() in console)
export let lastSubWatcherRunCounts = {};
export function GetChangedSubWatchers() {
	console.log("Changed sub-watchers:", subWatchers.Pairs().filter(a=>a.value.runCount != lastSubWatcherRunCounts[a.key]).map(a=>a.value));
	lastSubWatcherRunCounts = subWatchers.Pairs().ToMap(a=>a.key, a=>a.value.runCount);
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
			parentWatcher.watchedSubWatchers.push(watcher);
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