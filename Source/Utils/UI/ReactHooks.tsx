//export {useSelector as UseSelector} from "react-redux";
import {useSelector, shallowEqual} from "react-redux";
import {useState} from "react";
import {A, Clone} from "js-vextensions";
import {CachedTransform_WithStore, StoreRequestCollector} from "../Database/DatabaseHelpers";
import {State_Base} from "../..";

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

	accessor["Watch"] = function() {
		const [idForThisWatchCallInComp, _] = useState(Date.now());
		const [vCacheStorage, setVCacheStorage_real] = useState({});
		// don't actually call the setX function, cause that will trigger ui update; instead, just mutate it
		/*const setVCacheStorage_fake = val=>{
			vCacheStorage.Pairs().forEach(a=>Reflect.deleteProperty(vCacheStorage, a.key)); // delete old
			vCacheStorage.Extend(val); // add new
		};*/

		return UseSelector(()=>{
			return Hooks_CachedTransform_WithStore(name, vCacheStorage, [idForThisWatchCallInComp], arguments, ()=>{
				return accessor.apply(this, arguments);
			});
		});
	};
	return accessor as any;
}

// custom VCache
// ==========

export function Hooks_CachedTransform_WithStore<T, T2, T3>(
	name: string,
	vCacheStorage, //setVCacheStorage,
	staticProps: any[], dynamicProps: T2,
	transformFunc: (debugInfo: any, staticProps: any[], dynamicProps: T2)=>T3,
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
		var result = Hooks_CachedTransform(name, vCacheStorage, staticProps, dynamicProps_withStoreData, transformFunc);
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
	staticProps: any[], dynamicProps: T2,
	transformFunc: (debugInfo: any, staticProps: any[], dynamicProps: T2)=>T3,
): T3 {
	if (!shallowEqual(dynamicProps, vCacheStorage.lastDynamicProps)) {
		/*MaybeLog(a=>a.cacheUpdates,
			()=>`Recalculating cache. @Type:${transformType} @StaticProps:${ToJSON(staticProps)} @DynamicProps:${ToJSON(dynamicProps)} @TransformFunc:${transformFunc}`);*/

		//const newStorage = {} as any;
		vCacheStorage.lastDynamicProps = dynamicProps;
		vCacheStorage.lastDebugInfo = {};
		vCacheStorage.lastResult = transformFunc(vCacheStorage.lastDebugInfo, staticProps, dynamicProps);
		//setVCacheStorage(newStorage);
		return vCacheStorage.lastResult;
	}
	return vCacheStorage.lastResult;
}