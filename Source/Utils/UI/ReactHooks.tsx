//export {useSelector as UseSelector} from "react-redux";
import {Assert} from "js-vextensions";
import {useState} from "react";
import {shallowEqual, useSelector} from "react-redux";
import {inRenderFunc, ShallowChanged} from "react-vextensions";
import {State_Base, connectCompsFrozen, ClearRequestedPaths, ClearAccessedPaths, ClearRequests_Query, SplitStringBySlash_Cached, manager, GetRequestedPaths, SetListeners, GetRequests_Query_JSON, SetListeners_Query, GetAccessedPaths} from "../..";
import {StoreRequestCollector} from "../Database/DatabaseHelpers";
import {g} from "../../PrivateExports";

export function UseSelector<TState, TSelected>(
	selector: (state: TState) => TSelected,
	equalityFn?: (left: TSelected, right: TSelected) => boolean,
): TSelected {
	return useSelector(selector, equalityFn);
}

// wrapper for store-accessor functions
// ==========

//export function StoreAccessor<Func extends Function>(name: string, accessor: Func): Func & {Watch: Func} {
/*export function StoreAccessor<Func extends Function>(accessor: Func): Func & {Watch: Func} {
	/*let result = function() {
		return accessor.apply(this, arguments);
	}
	return result;*#/
	accessor["Watch"] = function() {
		//const [idForThisWatchCallInComp, _] = useState(`${name}_${Date.now()}`);
		const [idForThisWatchCallInComp, _] = useState(Date.now());
		return /* A.NonNull =*#/ UseSelector(()=>{
			return /* A.NonNull =*#/ CachedTransform_WithStore(name, [idForThisWatchCallInComp], arguments, ()=>{
				return /*A.NonNull =*#/ accessor.apply(this, arguments);
			});
		});
	};
	return accessor as any;
}*/

export function StoreAccessor<Func extends Function>(accessor: Func): Func & {Watch: Func};
export function StoreAccessor<Func extends Function>(name: string, accessor: Func): Func & {Watch: Func};
export function StoreAccessor(...args) {
	let name: string, accessor: Function;
	if (args.length == 1) [accessor] = args;
	else if (args.length == 2) [name, accessor] = args;

	accessor["Watch"] = function(...callArgs) {
		//Assert(inRenderFunc, "The .Watch() variant of a store-selector function can only be called within a component's render() function.");
		//const [idForThisWatchCallInComp, _] = useState(Date.now());
		const [firebaseConnectStorage, _] = useState({});
		const [vCacheStorage, setVCacheStorage_real] = useState({});
		// don't actually call the setX function, cause that will trigger ui update; instead, just mutate it
		/*const setVCacheStorage_fake = val=>{
			vCacheStorage.Pairs().forEach(a=>Reflect.deleteProperty(vCacheStorage, a.key)); // delete old
			vCacheStorage.Extend(val); // add new
		};*/

		return UseSelector(()=>{
			const s = firebaseConnectStorage as any;
			const props = callArgs;

			if (connectCompsFrozen && s.lastResult) {
				return s.lastResult;
			}
			g.inConnectFuncFor = s.WrappedComponent;

			ClearRequestedPaths();
			ClearAccessedPaths();
			//Assert(GetAccessedPaths().length == 0, "Accessed-path must be empty at start of mapStateToProps call (ie. the code in Connect()).");
			ClearRequests_Query();

			let changedPath = null;

			let storeDataChanged = false;
			if (s.lastAccessedStorePaths_withData == null) {
				storeDataChanged = true;
			} else {
				for (const path in s.lastAccessedStorePaths_withData) {
					if (State_Base({countAsAccess: false}, ...SplitStringBySlash_Cached(path)) !== s.lastAccessedStorePaths_withData[path]) {
						//store.dispatch({type: "Data changed!" + path});
						storeDataChanged = true;
						changedPath = path;
						break;
					}
				}
			}
			//let propsChanged = ShallowChanged(props, s.lastProps || {});
			const propsChanged = ShallowChanged(props, s.lastProps || {}, {propsToIgnore: ["children"]});

			//let result = storeDataChanged ? mapStateToProps_inner(state, props) : s.lastResult;
			if (!storeDataChanged && !propsChanged) {
				g.inConnectFuncFor = null;
				return s.lastResult;
			}

			// for debugging in profiler
			/*let result;
			if (manager.devEnv) {
				//let debugText = ToJSON(props).replace(/[^a-zA-Z0-9]/g, "_");
				const debugText = `${props["node"] ? ` @ID:${props["node"]._id}` : ""} @changedPath: ${changedPath}`;
				const wrapperFunc = eval(`(function ${debugText.replace(/[^a-zA-Z0-9]/g, "_")}() { return mapStateToProps_inner.apply(s, arguments); })`);
				result = wrapperFunc.call(s, state, props);
			} else {
				result = mapStateToProps_inner.call(s, state, props);
			}*/
			const result = Hooks_CachedTransform_WithStore(name, vCacheStorage, callArgs, ()=>{
				return accessor.apply(this, callArgs);
			});

			// todo: reimplement this (or something similar)
			/*manager.globalConnectorPropGetters.Pairs().forEach(({key, value: getter})=>{
				result[key] = getter.call(s, state, props);
			});*/

			const oldRequestedPaths: string[] = s.lastRequestedPaths || [];
			const requestedPaths: string[] = GetRequestedPaths();
			// if (firebase._ && ShallowChanged(requestedPaths, oldRequestedPaths)) {
			if (ShallowChanged(requestedPaths, oldRequestedPaths)) {
				g.setImmediate(()=>{
					// s.lastEvents = getEventsFromInput(requestedPaths.map(path=>GetPathParts(path)[0]));
					const removedPaths = oldRequestedPaths.Except(...requestedPaths);
					// todo: find correct way of unwatching events; the way below seems to sometimes unwatch while still needed watched
					// for now, we just never unwatch
					// unWatchEvents(store.firebase, DispatchDBAction, getEventsFromInput(removedPaths));
					// store.firestore.unsetListeners(removedPaths.map(path=>GetPathParts(path)[0]));
					/* const removedPaths_toDocs = removedPaths.map(path => GetPathParts(path)[0]);
					const removedPaths_toDocs_asListenerPaths = removedPaths_toDocs.map(path => PathToListenerPath(path));
					// store.firestore.unsetListeners(removedPaths_toDocs_asListenerPaths);
					unsetListeners(firebase['firebase_'] || firebase, DispatchDBAction, removedPaths_toDocs_asListenerPaths); */
					// UnsetListeners(removedPaths);

					const addedPaths = requestedPaths.Except(...oldRequestedPaths);
					/* const addedPaths_toDocs = addedPaths.map(path => GetPathParts(path)[0]);
					const addedPaths_toDocs_asListenerPaths = addedPaths_toDocs.map(path => PathToListenerPath(path));
					// watchEvents(store.firebase, DispatchDBAction, getEventsFromInput(addedPaths.map(path=>GetPathParts(path)[0])));
					// for debugging, you can check currently-watched-paths using: store.firestore._.listeners
					// store.firestore.setListeners(addedPaths_toDocs_asListenerPaths);
					setListeners(firebase['firebase_'] || firebase, DispatchDBAction, addedPaths_toDocs_asListenerPaths); */
					SetListeners(addedPaths);
				});
				s.lastRequestedPaths = requestedPaths;
			}

			// query requests // todo: clean this up
			const oldQueryRequests: string[] = s.lastQueryRequests || [];
			const queryRequests: string[] = GetRequests_Query_JSON();
			// if (firebase._ && ShallowChanged(requestedPaths, oldRequestedPaths)) {
			if (ShallowChanged(queryRequests, oldQueryRequests)) {
				g.setImmediate(()=>{
					const removedQueries = oldQueryRequests.Except(...queryRequests);
					// todo: remove listener for removed query-request
					const addedQueries = queryRequests.Except(...oldQueryRequests);
					//SetListeners(addedPaths);
					SetListeners_Query(addedQueries);
				});
				s.lastQueryRequests = requestedPaths;
			}

			const accessedStorePaths: string[] = GetAccessedPaths();
			//ClearAccessedPaths();
			s.lastAccessedStorePaths_withData = {};
			for (const path of accessedStorePaths) {
				s.lastAccessedStorePaths_withData[path] = State_Base({countAsAccess: false}, ...SplitStringBySlash_Cached(path));
			}
			s.lastProps = props;
			s.lastResult = result;

			g.inConnectFuncFor = null;

			return result;
		});
	};
	return accessor as any;
}

// custom VCache
// ==========

export function Hooks_CachedTransform_WithStore<T, T2, T3>(
	name: string,
	vCacheStorage, //setVCacheStorage,
	dynamicProps: T2,
	transformFunc: (debugInfo: any, dynamicProps: T2)=>T3,
): T3 {
	//let newStorage = Clone(vCacheStorage);

	const dynamicProps_withStoreData = {...dynamicProps as any};
	if (vCacheStorage.lastDynamicProps) {
		for (const key of Object.keys(vCacheStorage.lastDynamicProps)) {
			if (key.startsWith("store_")) {
				const path = key.substr("store_".length);
				// let oldVal = storage.lastDynamicProps[key];
				// let newVal = State({countAsAccess: false}, ...path.split("/"));
				const newVal = State_Base(...path.split("/")); // count as access, so that Connect() retriggers for changes to these inside-transformer accessed-paths
				dynamicProps_withStoreData[key] = newVal;
			}
		}
	}

	const collector = new StoreRequestCollector().Start();
	//let newStorage; // gets set by Hooks_CachedTransform below
	try {
		//const setVCacheStorage_fake = val=>newStorage = val;
		var result = Hooks_CachedTransform(name, vCacheStorage, dynamicProps_withStoreData, transformFunc);
	} finally {
		collector.Stop();
	}

	// for each accessed store entry, add it to VCache's "last dynamic props" for this transform
	for (const path of collector.storePathsRequested) {
		const val = State_Base({countAsAccess: false}, path);
		vCacheStorage.lastDynamicProps[`store_${path}`] = val;
	}

	// only actually call this once
	//setVCacheStorage(newStorage);

	return result;
}

export function Hooks_CachedTransform<T, T2, T3>(
	name: string,
	vCacheStorage, //setVCacheStorage,
	dynamicProps: T2,
	transformFunc: (debugInfo: any, dynamicProps: T2)=>T3,
): T3 {
	if (!shallowEqual(dynamicProps, vCacheStorage.lastDynamicProps)) {
		/*MaybeLog(a=>a.cacheUpdates,
			()=>`Recalculating cache. @Type:${transformType} @StaticProps:${ToJSON(staticProps)} @DynamicProps:${ToJSON(dynamicProps)} @TransformFunc:${transformFunc}`);*/

		//const newStorage = {} as any;
		vCacheStorage.lastDynamicProps = dynamicProps;
		vCacheStorage.lastDebugInfo = {};
		vCacheStorage.lastResult = transformFunc(vCacheStorage.lastDebugInfo, dynamicProps);
		//setVCacheStorage(newStorage);
		return vCacheStorage.lastResult;
	}
	return vCacheStorage.lastResult;
}