import {RootState_Base} from "../..";

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

/*interface StoreAccessorFunc<RootState> {
	<Func extends Function>(accessor: (s: RootState)=>Func, callArgToDependencyConvertorFunc?: CallArgToDependencyConvertorFunc): Func & {WS: (state: RootState)=>Func};
	<Func extends Function>(name: string, accessor: (s: RootState)=>Func, callArgToDependencyConvertorFunc?: CallArgToDependencyConvertorFunc): Func & {WS: (state: RootState)=>Func};
}*/
interface StoreAccessorFunc<RootState> {
	<Func extends Function>(accessor: (s: RootState)=>Func, callArgToDependencyConvertorFunc?: CallArgToDependencyConvertorFunc): Func;
	<Func extends Function>(name: string, accessor: (s: RootState)=>Func, callArgToDependencyConvertorFunc?: CallArgToDependencyConvertorFunc): Func;
}

export function CreateStoreAccessor<RootState>() {
	//return State_Base as typeof State_Base<RootStateType, any>;
	//return State_Base as StateFunc_WithWatch<RootState>;
	return StoreAccessor_Base as StoreAccessorFunc<RootState>;
}

/**
Wrap a function with StoreAccessor if it's under the "Store/" path, and one of the following:
1) It accesses the store directly (ie. store.main.page). (thus, "WithStore(testStoreContents, ()=>GetThingFromStore())" works, without hacky overriding of project-wide "store" export)
2) It involves "heavy" processing, such that it's worth caching that processing. (rather than use computedFn directly, just standardize on StoreAccessor)
3) It involves a transformation of data into a new wrapper (ie. breaking reference equality), such that it's worth caching the processing. (to not trigger unnecessary child-ui re-renders)
*/
export const StoreAccessor_Base: StoreAccessorFunc<RootState_Base> = (...args)=>{
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
	/*accessor["Watch"] = function(...callArgs) {
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
	};*/
	return accessor as any;
};