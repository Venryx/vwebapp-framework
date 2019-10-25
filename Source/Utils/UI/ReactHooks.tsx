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
		const [vCacheStorage, setVCacheStorage_real] = useState(new Accessor_Storage());
		// don't actually call the setX function, cause that will trigger ui update; instead, just mutate it
		/*const setVCacheStorage_fake = val=>{
			vCacheStorage.Pairs().forEach(a=>Reflect.deleteProperty(vCacheStorage, a.key)); // delete old
			vCacheStorage.Extend(val); // add new
		};*/

		return UseSelector(()=>{
			return Hooks_CachedTransform_WithStore(name, vCacheStorage, callArgs, ()=>{
				return accessor.apply(this, callArgs);
			});
		});
	};
	return accessor as any;
}

// custom VCache
// ==========

export class Accessor_Storage<T1 = any, T2 = any, T3 = any> {
	lastDynamicProps_params: T1;
	lastDynamicProps_store = {};
	lastResult: T3;
	lastDebugInfo: any;

	db_lastRequestedPaths: string[];
	db_lastQueryRequests: string[];
}

export function Hooks_CachedTransform_WithStore<T, T2, T3>(
	name: string,
	accessorStorage: Accessor_Storage, //setVCacheStorage,
	dynamicProps_params_newValues: T2,
	transformFunc: ()=>T3,
): T3 {
	/* const s = firebaseConnectStorage as any;
	if (connectCompsFrozen && s.lastResult) {
		return s.lastResult;
	}
	//g.inConnectFuncFor = s.WrappedComponent; */

	let dynamicPropsChanged = false;
	if (!shallowEqual(accessorStorage.lastDynamicProps_params, dynamicProps_params_newValues)) {
		dynamicPropsChanged = true;
	}

	const newStoreValues = {}; // just optimization

	const lastDynamicProps_params_paths = Object.keys(accessorStorage.lastDynamicProps_store);
	for (const path of lastDynamicProps_params_paths) {
		const newValue = State_Base({countAsAccess: false}, path);
		newStoreValues[path] = newValue;
		if (newValue !== accessorStorage.lastDynamicProps_store[path]) {
			dynamicPropsChanged = true;
			break;
		}
	}

	let result = accessorStorage.lastResult;

	if (dynamicPropsChanged) {
		// these are for db-requests
		ClearRequestedPaths();
		ClearAccessedPaths();
		//Assert(GetAccessedPaths().length == 0, "Accessed-path must be empty at start of mapStateToProps call (ie. the code in Connect()).");
		ClearRequests_Query();

		// todo: reimplement this (or something similar): it pretends/assumes the component accessed these common db-request contents
		/*manager.globalConnectorPropGetters.Pairs().forEach(({key, value: getter})=>{
			result[key] = getter.call(s, state, props);
		});*/

		// this is for store requests/access
		const collector = new StoreRequestCollector().Start();

		try {
			result = transformFunc();
		} finally {
			collector.Stop();
		}

		/*MaybeLog(a=>a.cacheUpdates, ()=>`Recalculating cache. @Type:${transformType} @StaticProps:${ToJSON(staticProps)} @DynamicProps:${ToJSON(dynamicProps)} @TransformFunc:${transformFunc}`);*/

		accessorStorage.lastDynamicProps_params = dynamicProps_params_newValues;
		//vCacheStorage.lastDynamicProps_store = dynamicProps_store_newValues;
		// for each accessed store entry, add it to VCache's "last dynamic props" for this transform
		accessorStorage.lastDynamicProps_store = collector.storePathsRequested.ToMap(path=>path, path=>newStoreValues[path] || State_Base({countAsAccess: false}, path));
		accessorStorage.lastDebugInfo = {};
		accessorStorage.lastResult = result;

		const oldRequestedPaths: string[] = accessorStorage.db_lastRequestedPaths || [];
		const requestedPaths: string[] = GetRequestedPaths();
		// if (firebase._ && ShallowChanged(requestedPaths, oldRequestedPaths)) {
		if (!shallowEqual(requestedPaths, oldRequestedPaths)) {
			//g.setImmediate(()=>{

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

			//});
			accessorStorage.db_lastRequestedPaths = requestedPaths;
		}

		// query requests // todo: clean this up
		const oldQueryRequests: string[] = accessorStorage.db_lastQueryRequests || [];
		const queryRequests: string[] = GetRequests_Query_JSON();
		// if (firebase._ && ShallowChanged(requestedPaths, oldRequestedPaths)) {
		if (!shallowEqual(queryRequests, oldQueryRequests)) {
			//g.setImmediate(()=>{

			const removedQueries = oldQueryRequests.Except(...queryRequests);
			// todo: remove listener for removed query-request
			const addedQueries = queryRequests.Except(...oldQueryRequests);
			//SetListeners(addedPaths);
			SetListeners_Query(addedQueries);

			//});
			accessorStorage.db_lastQueryRequests = requestedPaths;
		}
	}

	return result;
}