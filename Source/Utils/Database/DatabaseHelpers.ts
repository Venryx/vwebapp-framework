import {GetTreeNodesInObjTree, DeepSet, DeepGet, CachedTransform, GetStorageForCachedTransform, Assert, IsString, IsNumberString, IsNumber, Clone, FromJSON, ToJSON} from "js-vextensions";
import {ShallowChanged} from "react-vextensions";
import u from "updeep";
import {OnPopulated, manager} from "../../Manager";
import {SplitStringBySlash_Cached} from "./StringSplitCache";
import {RequestPath, ClearRequestedPaths, GetRequestedPaths, UnsetListeners, SetListeners, WhereFilter, RequestPath_Query, ClearRequests_Query, GetRequests_Query, GetRequests_Query_JSON, SetListeners_Query, QueryRequest, GetRequests_Query_Keys} from "./FirebaseConnect";
import {State_Base, StartBufferingActions, StopBufferingActions} from "../Store/StoreHelpers";
import {MaybeLog_Base} from "../General/Logging";
import {g} from "../../PrivateExports";
import {firebaseApp} from "./Firebase";

OnPopulated(()=>{
	G({firebase_: firebaseApp}); // doesn't show as R.firebase, fsr
});

export function IsAuthValid(auth) {
	return auth && !auth.isEmpty;
}

// v-path: collection/obj/.prop/.prop2
// v-field-path: prop/prop2
// fb-path: collection/obj.prop.prop2
// fb-field-path: prop.prop2

export function VPathToFBPath(vPath: string) {
	return vPath != null ? vPath.replace(/\/\./g, ".") : null;
}
export function FBPathToVPath(fbPath: string) {
	return fbPath != null ? fbPath.replace(/\./g, "/.") : null;
}
export function VFieldPathToFBFieldPath(vFieldPath: string) {
	return vFieldPath != null ? vFieldPath.replace(/\//g, ".") : null;
}
export function FBFieldPathToVFieldPath(vFieldPath: string) {
	return vFieldPath != null ? vFieldPath.replace(/\./g, "/") : null;
}

/**
 * @param asFBPath If true, returned paths are separated with "."; if false, by "/". Default: false
 * @returns [colOrDocPath, fieldPathInDoc]
 * */
export function GetPathParts(path: string, asFBPath = false): [string, string] {
	let colOrDocPath = path.substr(0, path.indexOf("/.").IfN1Then(path.length));
	const isDocPath = colOrDocPath.length != path.length; // if length differs, it means field-path is supplied, which means it's a doc-path
	if (isDocPath) {
		Assert(SplitStringBySlash_Cached(colOrDocPath).length % 2 == 0, `Segment count in docPath (${colOrDocPath}) must be multiple of 2.`);
	}

	let fieldPathInDoc = colOrDocPath.length < path.length ? path.substr(colOrDocPath.length + 2).replace(/\./g, "") : null;
	if (asFBPath) {
		[colOrDocPath, fieldPathInDoc] = [VPathToFBPath(colOrDocPath), VFieldPathToFBFieldPath(fieldPathInDoc)];
	}
	return [colOrDocPath, fieldPathInDoc];
}

export function DBPath(path = "", inVersionRoot = true) {
	Assert(path != null, "Path cannot be null.");
	Assert(IsString(path), "Path must be a string.");
	/*let versionPrefix = path.match(/^v[0-9]+/);
	if (versionPrefix == null) // if no version prefix already, add one (referencing the current version)*/
	if (inVersionRoot) {
		path = `versions/v${manager.dbVersion}-${manager.db_short}${path ? `/${path}` : ""}`;
	}
	return path;
}
export function DBPathSegments(pathSegments: (string | number)[], inVersionRoot = true) {
	let result = pathSegments;
	if (inVersionRoot) {
		result = (["versions", `v${manager.dbVersion}-${manager.db_short}`] as any).concat(result);
	}
	return result;
}

export function PathToListenerPath(path: string) {
	const pathNodesLeft = path.split("/");
	function ConvertNextTwoPathNodesIntoListenerPathNode(pathNodes: string[]) {
		const result = {} as any;
		const collectionNode = pathNodes.splice(0, 1)[0];
		Assert(collectionNode.trim().length, `Path node cannot be empty. Path: ${path}`);
		result.collection = collectionNode;
		if (pathNodes.length) {
			result.doc = pathNodes.splice(0, 1)[0];
		}
		return result;
	}

	const root = ConvertNextTwoPathNodesIntoListenerPathNode(pathNodesLeft);
	if (pathNodesLeft.length) {
		root.subcollections = [];
		while (pathNodesLeft.length) {
			root.subcollections.push(ConvertNextTwoPathNodesIntoListenerPathNode(pathNodesLeft));
		}
	}
	return root;
}
export function ListenerPathToPath(listenerPath: any) {
	const result = [];
	const pathNodes = [listenerPath].concat((listenerPath.subcollections || []));
	for (const pathNode of pathNodes) {
		result.push(pathNode.collection);
		if (pathNode.doc) {
			result.push(pathNode.doc);
		}
	}
	return result.join("/");
}

export function SlicePath(path: string, removeFromEndCount: number, ...itemsToAdd: string[]) {
	//let parts = path.split("/");
	const parts = SplitStringBySlash_Cached(path).slice();
	parts.splice(parts.length - removeFromEndCount, removeFromEndCount, ...itemsToAdd);
	return parts.join("/");
}

Object.prototype._AddFunction_Inline = function DBRef(path = "", inVersionRoot = true) {
	const finalPath = DBPath(path, inVersionRoot);
	return this.ref(finalPath);
};

export function ProcessDBData(data, standardizeForm: boolean, addHelpers: boolean, rootKey: string) {
	var treeNodes = GetTreeNodesInObjTree(data, true);
	for (const treeNode of treeNodes) {
		if (treeNode.Value == null) continue;

		// turn the should-not-have-been-array arrays (the ones without a "0" property) into objects
		//if (standardizeForm && treeNode.Value instanceof Array && treeNode.Value[0] === undefined) {

		// turn the should-not-have-been-array arrays (the ones with non-number property) into objects
		if (standardizeForm && treeNode.Value instanceof Array && treeNode.Value.VKeys(true).Any(a=>!IsNumberString(a))) {
			// if changing root, we have to actually modify the prototype of the passed-in "data" object
			/*if (treeNode.Value == data) {
				Object.setPrototypeOf(data, Object.getPrototypeOf({}));
				for (var key of Object.keys(data)) {
					if (data[key] === undefined)
						delete data[key];
				}
				continue;
			}*/

			const valueAsObject = {}.Extend(treeNode.Value) as any;
			for (const key in valueAsObject) {
				// if fake array-item added by Firebase/js (just so the array would have no holes), remove it
				//if (valueAsObject[key] == null)
				if (valueAsObject[key] === undefined) { delete valueAsObject[key]; }
			}

			if (treeNode.Value == data) treeNode.obj[treeNode.prop] = valueAsObject; // if changing root, we need to modify wrapper.data
			else DeepSet(data, treeNode.PathStr, valueAsObject); // else, we need to use deep-set, because ancestors may have already changed during this transform/processing
		}

		// turn the should-have-been-array objects (the ones with a "0" property) into arrays
		if (standardizeForm && typeof treeNode.Value == "object" && !(treeNode.Value instanceof Array) && treeNode.Value[0] !== undefined) {
			// if changing root, we have to actually modify the prototype of the passed-in "data" object
			/*if (treeNode.Value == data) {
				Object.setPrototypeOf(data, Object.getPrototypeOf([]));
				data.length = data.VKeys(true).filter(a=>IsNumberString(a));
				continue;
			}*/

			const valueAsArray = [].Extend(treeNode.Value) as any;

			if (treeNode.Value == data) treeNode.obj[treeNode.prop] = valueAsArray; // if changing root, we need to modify wrapper.data
			else DeepSet(data, treeNode.PathStr, valueAsArray); // else, we need to use deep-set, because ancestors may have already changed during this transform/processing
		}

		// add special _key or _id prop
		if (addHelpers && typeof treeNode.Value == "object") {
			const key = treeNode.prop == "_root" ? rootKey : treeNode.prop;
			if (IsNumberString(key)) {
				treeNode.Value._id = parseInt(key);
				//treeNode.Value._Set("_id", parseInt(key));
			}

			// actually, always set "_key" (in case it's a "_key" that also happens to look like an "_id"/integer)
			//else {
			treeNode.Value._key = key;
			//treeNode.Value._Set("_key", key);
		}
	}
	return treeNodes[0].Value; // get possibly-modified wrapper.data
}
const helperProps = ["_key", "_id"];
/** Note: this mutates the original object. */
export function RemoveHelpers(data) {
	var treeNodes = GetTreeNodesInObjTree(data, true);
	for (const treeNode of treeNodes) {
		if (helperProps.Contains(treeNode.prop)) { delete treeNode.obj[treeNode.prop]; }
	}
	return data;
}
export function WithoutHelpers(data) {
	return RemoveHelpers(Clone(data));
}

class DBPathInfo {
	lastTimestamp = -1;
	cachedData;
}
const pathInfos = {} as {[path: string]: DBPathInfo};

export type PathSegment = string | number;
export function ValidatePathSegments_GetDataFuncs(pathSegments: (string | number)[], options: GetData_Options | GetDataAsync_Options) {
	if (manager.devEnv) {
		//Assert((manager.dbVersion && manager.db_short) || !options.inVersionRoot, "Cannot call GetData in-version-root until the dbVersion and db_short variables are supplied.");
		Assert(!pathSegments.Contains("vundefined-undefined"), "The path contains \"vundefined-undefined\"! This suggests that a module, like firebase-forum, is calling GetData before InitLibs() has executed.");
		Assert(pathSegments.every(segment=>typeof segment === "number" || !segment.Contains("/")), `Each string path-segment must be a plain prop-name. (ie. contain no "/" separators) @segments(${pathSegments})`);

		const colOrDocPathSegments = pathSegments.filter(segment=>IsNumber(segment) || !segment.startsWith("."));
		if (options.collection) {
			Assert(colOrDocPathSegments.length % 2 !== 0,
				`Calling GetData() to retrieve a document or doc-field (${pathSegments.join("/")}) is prohibited if you pass {collection:true} as an option.`);
		} else {
			Assert(colOrDocPathSegments.length % 2 === 0, ()=>`
				Calling GetData() to retrieve a collection (${pathSegments.join("/")}) is only allowed if you pass {collection:true} as an option.
				Did you forget to add "." in front of field-path segments? (eg: "collection/doc/.field1/.field2")`.AsMultiline(0));
		}
	}
}

export class GetData_Options {
	inVersionRoot? = true;
	makeRequest? = true;
	collection? = false;
	excludeCollections?: string[];
	useUndefinedForInProgress? = false;
	//queries?: any;
}

G({GetData});
/** Begins request to get data at the given path in the Firebase database.
 *
 * Returns undefined when the current-data for the path is null/non-existent, but a request is in-progress.
 * Returns null when we've completed the request, and there is no data at that path. */
//export function GetData(pathSegments: (string | number)[], options?: GetData_Options) {
/*export function GetData(pathSegment1: string | number, pathSegment2: string | number, ...pathSegments: (string | number)[]);
export function GetData(options: GetData_Options, pathSegment1: string | number, pathSegment2: string | number, ...pathSegments: (string | number)[]);*/
export function GetData(...pathSegments: (string | number)[]);
export function GetData(options: GetData_Options, ...pathSegments: (string | number)[]);
export function GetData(...args) {
	let pathSegments: (string | number)[]; let options: GetData_Options;
	//if (typeof args[0] == "string") pathSegments = args;
	if (typeof args[0] == "string") pathSegments = args;
	else [options, ...pathSegments] = args;
	options = E(new GetData_Options(), options);

	pathSegments = DBPathSegments(pathSegments, options.inVersionRoot);
	ValidatePathSegments_GetDataFuncs(pathSegments, options);

	const path = pathSegments.join("/");
	/*if (options.queries && options.queries.VKeys().length) {
		let queriesStr = "";
		for (let {name, value, index} of options.queries.Props()) {
			queriesStr += (index == 0 ? "#" : "&") + name + "=" + value;
		}
		pathSegments[pathSegments.length - 1] = pathSegments.Last() + queriesStr;
		path += queriesStr.replace(/[#=]/g, "_");
	}*/

	if (options.makeRequest) {
		/*let queriesStr = "";
		if (options.queries && options.queries.VKeys().length) {
			for (const {name, value, index} of options.queries.Props()) {
				queriesStr += `${(index == 0 ? "#" : "&") + name}=${value}`;
			}
		}
		RequestPath(path + queriesStr);*/
		RequestPath(path);
	}

	//let result = State("firebase", "data", ...SplitStringByForwardSlash_Cached(path)) as any;
	let result = State_Base("firestore", "data", ...pathSegments.map(a=>(typeof a == "string" && a[0] == "." ? a.substr(1) : a))) as any;
	//let result = State("firebase", "data", ...pathSegments) as any;

	// if at this path there's both an object-doc, and subcollections, exclude those subcollections (and if in doing so we find object-doc doesn't exist, set result to null)
	if (result != null && options.excludeCollections) {
		for (const key of options.excludeCollections) {
			delete result[key];
		}
		if (result.VKeys(true).length == 0) {
			result = null;
		}
	}

	if (result == null && options.useUndefinedForInProgress) {
		const requestCompleted = State_Base().firestore.status.requested[path];
		if (!requestCompleted) return undefined; // undefined means, current-data for path is null/non-existent, but we haven't completed the current request yet
		return null; // null means, we've completed the request, and there is no data at that path
	}
	return result;
}

export class GetData_Query_Options {
	inVersionRoot? = true;
	makeRequest? = true;
	collection? = false;

	key?: string; // if not set, we use the path+whereFilters as the key
	whereFilters?: WhereFilter[];
}
export function GetData_Query(options: GetData_Query_Options, ...pathSegments: PathSegment[]) {
	options = E(new GetData_Query_Options(), options);

	pathSegments = DBPathSegments(pathSegments, options.inVersionRoot);
	ValidatePathSegments_GetDataFuncs(pathSegments, options);

	const path = pathSegments.join("/");
	options.key = options.key || ToJSON({path, whereFilters: options.whereFilters}).replace(/[/]/g, "_");
	if (options.makeRequest) {
		RequestPath_Query(options.key, path, options.whereFilters);
	}

	const result = State_Base("firestore", "data", options.key);
	// the storeAs prop appears to not be working (probably config mistake), so just get data from regular path for now
	//let result = State_Base("firestore", "data", ...pathSegments.map(a=>(typeof a == "string" && a[0] == "." ? a.substr(1) : a))) as any;
	return result;
}

export class GetDataAsync_Options {
	inVersionRoot? = true;
	collection? = false;
	addHelpers? = true;
}

G({GetDataAsync});
/**
 * Usually you'll want to use GetAsync() instead. (example: "await GetAsync(()=>GetNode(id))")
 * Also beware: GetDataAsync() seems to sometimes trigger a LISTENER_RESPONSE action with {data: null}, even if the DB has already sent the actual data for a new path.
 */
export async function GetDataAsync(...pathSegments: (string | number)[]): Promise<any>;
export async function GetDataAsync(options: GetDataAsync_Options, ...pathSegments: (string | number)[]): Promise<any>;
export async function GetDataAsync(...args) {
	let pathSegments: (string | number)[]; let options: GetDataAsync_Options;
	if (typeof args[0] == "string") pathSegments = args;
	else [options, ...pathSegments] = args;
	options = E(new GetDataAsync_Options(), options);

	pathSegments = DBPathSegments(pathSegments, options.inVersionRoot);
	ValidatePathSegments_GetDataFuncs(pathSegments, options);

	/*let firebase = store.firebase.helpers;
	return await new Promise((resolve, reject) => {
		//firebase.child(DBPath(path, inVersionRoot)).once("value",
		let path = pathSegments.join("/");
		firebase.DBRef(path, options.inVersionRoot).once("value",
			(snapshot: FirebaseDataSnapshot)=> {
				let result = snapshot.val();
				if (result)
					result = ProcessDBData(result, true, options.addHelpers, pathSegments.Last()+"");
				resolve(result);
			},
			(ex: Error)=> {
				reject(ex);
			});
	});*/

	const path = pathSegments.join("/");
	const [colOrDocPath, fieldPathInDoc] = GetPathParts(path);
	const isDoc = colOrDocPath.split("/").length % 2 == 0;

	let result;
	if (isDoc) {
		const doc = await manager.firestoreDB.doc(colOrDocPath).get();
		const docData = doc.exists ? doc.data() : null;
		result = fieldPathInDoc ? DeepGet(docData, fieldPathInDoc) : docData;
	} else {
		const {docs} = await manager.firestoreDB.collection(colOrDocPath).get();
		result = {};
		for (const doc of docs) {
			result[doc.id] = doc.data();
		}
	}

	if (result) {
		result = ProcessDBData(result, true, options.addHelpers, `${pathSegments.Last()}`);
	}
	return result;
}

/**
 * Usage: await GetAsync(()=>GetNode(123))
 * It has the same processing as in Connect(), except callable using async/await.
 * It basically makes a pretend component -- connecting to firebase, and resolving the promise once the condition below is fulfilled:
 * 	It re-calls the db-getter func (after the last generation's requested-path-data was all received), and finds that no new paths are requested.
 */
G({GetAsync});
export async function GetAsync<T>(dbGetterFunc: ()=>T, statsLogger?: ({requestedPaths: string})=>void): Promise<T> {
	Assert(g.inConnectFuncFor == null, "Cannot run GetAsync() from within a Connect() function.");
	//Assert(!g.inGetAsyncFunc, "Cannot run GetAsync() from within a GetAsync() function.");
	const {firebase} = manager.store;

	let result;

	const requestedPathsSoFar = {};
	const queryRequestsSoFar = {};
	let requestedPathsSoFar_last;
	let queryRequestsSoFar_last;
	do {
		requestedPathsSoFar_last = Clone(requestedPathsSoFar);
		queryRequestsSoFar_last = Clone(queryRequestsSoFar);

		ClearRequestedPaths();
		ClearRequests_Query();
		result = dbGetterFunc();
		const newRequestedPaths = GetRequestedPaths().Except(requestedPathsSoFar.VKeys());
		const newQueryRequestJSONs = GetRequests_Query_JSON().Except(queryRequestsSoFar.VKeys());
		const newQueryRequests = newQueryRequestJSONs.map(FromJSON) as QueryRequest[];

		StartBufferingActions();

		/*unWatchEvents(firebase, store.dispatch, getEventsFromInput(newRequestedPaths)); // do this just to trigger re-get
		// start watching paths (causes paths to be requested)
		watchEvents(firebase, store.dispatch, getEventsFromInput(newRequestedPaths));*/

		UnsetListeners(newRequestedPaths); // do this just to trigger re-get
		// start watching paths (causes paths to be requested)
		SetListeners(newRequestedPaths);

		SetListeners_Query(newQueryRequestJSONs);

		StopBufferingActions();

		for (const path of newRequestedPaths) {
			requestedPathsSoFar[path] = true;
			// wait till data is received
			await WaitTillPathDataIsReceived(path);
		}
		for (const query of newQueryRequests) {
			//const query = FromJSON(queryJSON) as QueryRequest;
			queryRequestsSoFar[query.key] = true;
			//Log(`Waiting for query:${query.key}`);
			// wait till data is received
			await WaitTillQueryDataIsReceived(query.key);
			//Log(`Got query:${query.key}`);
		}

		// todo: await receive of query-request data

		// stop watching paths (since we already got their data)
		// todo: find correct way of unwatching events; the way below seems to sometimes unwatch while still needed watched
		// for now, we just never unwatch
		//unWatchEvents(firebase, store.dispatch, getEventsFromInput(newRequestedPaths));
	} while (ShallowChanged(requestedPathsSoFar, requestedPathsSoFar_last) || ShallowChanged(queryRequestsSoFar, queryRequestsSoFar_last));

	/*let paths_final = requestedPathsSoFar.VKeys();
	let paths_data = await Promise.all(paths_final.map(path=>GetDataAsync(path)));
	let listener = ()=> {
		listener(); // unsubscribe
	};
	store.subscribe(listener);*/

	if (statsLogger) {
		statsLogger({requestedPaths: requestedPathsSoFar});
	}

	return result;
}
G({GetAsync_Raw});
export async function GetAsync_Raw<T>(dbGetterFunc: ()=>T, statsLogger?: ({requestedPaths: string})=>void): Promise<T> {
	const value = await GetAsync(dbGetterFunc, statsLogger);
	if (value == null) return value;
	return WithoutHelpers(value);
}

type ReceiveStatus = "not started" | "receiving" | "received";
export const pathReceiveStatuses = {} as {[key: string]: ReceiveStatus};
export const pathReceivingListeners = {} as {[key: string]: Function[]};
export const pathReceivedListeners = {} as {[key: string]: Function[]};
export function NotifyPathsReceiving(paths: string[]) {
	for (const path of paths) {
		pathReceiveStatuses[path] = "receiving";
		if (pathReceivingListeners[path]) {
			// pathReceivingListeners[path].forEach(listener => listener());
			for (const listener of pathReceivingListeners[path]) listener();
		}
	}
}
export function NotifyPathsReceived(paths: string[]) {
	for (const path of paths) {
		pathReceiveStatuses[path] = "received";
		if (pathReceivedListeners[path]) {
			for (const listener of pathReceivedListeners[path]) listener();
		}
	}
}
export function WaitTillPathDataIsReceiving(path: string): Promise<any> {
	Assert(!path.Contains("/."), "This function can only be supplied with collection/document paths. (not field paths)");
	return new Promise((resolve, reject)=>{
		let pathDataReceiving = pathReceiveStatuses[path] === "receiving";
		// if data already receiving, resolve right away
		if (pathDataReceiving) resolve();

		// else, add listener, and wait till store is receiving the data (then resolve it)
		const listener = ()=>{
			pathDataReceiving = pathReceiveStatuses[path] === "receiving";
			if (pathDataReceiving) {
				pathReceivingListeners[path].Remove(listener);
				resolve();
			}
		};
		pathReceivingListeners[path] = pathReceivingListeners[path] || [];
		pathReceivingListeners[path].push(listener);
	});
}
export function WaitTillPathDataIsReceived(path: string): Promise<any> {
	Assert(!path.Contains("/."), "This function can only be supplied with collection/document paths. (not field paths)");
	return new Promise((resolve, reject)=>{
		let pathDataReceived = pathReceiveStatuses[path] === "received";
		// if data already received, resolve right away
		if (pathDataReceived) resolve();

		// else, add listener, and wait till store has received the data (then resolve it)
		const listener = ()=>{
			pathDataReceived = pathReceiveStatuses[path] === "received";
			if (pathDataReceived) {
				pathReceivedListeners[path].Remove(listener);
				resolve();
			}
		};
		pathReceivedListeners[path] = pathReceivedListeners[path] || [];
		pathReceivedListeners[path].push(listener);
	});
}

export const queryReceiveStatuses = {} as {[key: string]: ReceiveStatus};
export const queryReceivedListeners = {} as {[key: string]: Function[]};
export function NotifyQueriesReceived(keys: string[]) {
	for (const key of keys) {
		queryReceiveStatuses[key] = "received";
		if (queryReceivedListeners[key]) {
			for (const listener of queryReceivedListeners[key]) listener();
		}
	}
}
export function WaitTillQueryDataIsReceived(key: string): Promise<any> {
	return new Promise((resolve, reject)=>{
		let queryDataReceived = queryReceiveStatuses[key] === "received";
		// if data already received, resolve right away
		if (queryDataReceived) resolve();

		// else, add listener, and wait till store has received the data (then resolve it)
		const listener = ()=>{
			queryDataReceived = queryReceiveStatuses[key] === "received";
			if (queryDataReceived) {
				queryReceivedListeners[key].Remove(listener);
				resolve();
			}
		};
		queryReceivedListeners[key] = queryReceivedListeners[key] || [];
		queryReceivedListeners[key].push(listener);
	});
}

export const activeStoreAccessCollectors = [] as StoreRequestCollector[];
export class StoreRequestCollector {
	//storePathsRequested = [] as string[];
	storePathsRequested_withValues = {} as {[key: string]: any};
	Start() {
		activeStoreAccessCollectors.push(this);
		return this;
	}
	Stop() {
		activeStoreAccessCollectors.Remove(this);
	}
}

/** Same as CachedTransform(), except it also includes all accessed store-data as dynamic-props.
* This means that you can now "early return cache" for lots of cases, where dynamic-props is *only* the store-data, thus requiring *no recalculation*.
* So basically, by wrapping code in this function, you're saying:
*		"Do not re-evaluate the code below unless dynamic-props have changed, or one of the store-paths it accessed last time has changed."
* 		(with the transformType and staticProps defining what "here" means)
*/
/* export function CachedTransform_WithStore<T, T2, T3>(
	transformType: string, staticProps: any[], dynamicProps: T2,
	transformFunc: (debugInfo: any, staticProps: any[], dynamicProps: T2)=>T3,
): T3 {
	const storage = GetStorageForCachedTransform(transformType, staticProps);
	const dynamicProps_withStoreData = {...dynamicProps as any};
	if (storage.lastDynamicProps) {
		for (const key of Object.keys(storage.lastDynamicProps)) {
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
	try {
		var result = CachedTransform(transformType, staticProps, dynamicProps_withStoreData, transformFunc);
	} finally {
		collector.Stop();
	}

	// for each accessed store entry, add it to VCache's "last dynamic props" for this transform
	/*for (const path of collector.storePathsRequested_withValues) {
		const val = State_Base({countAsAccess: false}, path);
		storage.lastDynamicProps[`store_${path}`] = val;
	}*#/
	for (const {key: path, value} of collector.storePathsRequested_withValues.Pairs()) {
		storage.lastDynamicProps[`store_${path}`] = value;
	}

	return result;
} */

export function AssertValidatePath(path: string) {
	Assert(!path.endsWith("/"), "Path cannot end with a slash. (This may mean a path parameter is missing)");
	Assert(!path.Contains("//"), "Path cannot contain a double-slash. (This may mean a path parameter is missing)");
}

export function ConvertDataToValidDBUpdates(rootPath: string, rootData: any, dbUpdatesRelativeToRootPath = true) {
	const result = {};
	for (const {key: pathFromRoot, value: data} of rootData.Pairs()) {
		const fullPath = `${rootPath}/${pathFromRoot}`;
		const pathForDBUpdates = dbUpdatesRelativeToRootPath ? pathFromRoot : fullPath;

		// if entry`s "path" has odd number of segments (ie. points to collection), extract the children data into separate set-doc updates
		if (SplitStringBySlash_Cached(fullPath).length % 2 !== 0) {
			for (const {key, value} of data.Pairs()) {
				result[`${pathForDBUpdates}/${key}`] = value;
			}
		} else {
			result[pathForDBUpdates] = data;
		}
	}
	return result;
}

export async function ApplyDBUpdates(rootPath: string, dbUpdates: Object) {
	dbUpdates = Clone(dbUpdates);
	if (rootPath != null) {
		for (const {name: localPath, value} of dbUpdates.Props()) {
			dbUpdates[`${rootPath}/${localPath}`] = value;
			delete dbUpdates[localPath];
		}
	}

	// temp; if only updating one field, just do it directly (for some reason, a batch takes much longer)
	const updateEntries = (Object as any).entries(dbUpdates);
	if (updateEntries.length == 1) {
		let [path, value] = updateEntries[0];
		const [docPath, fieldPathInDoc] = GetPathParts(path, true);
		value = Clone(value); // picky firestore library demands "simple JSON objects"

		// [fieldPathInDoc, value] = FixSettingPrimitiveValueDirectly(fieldPathInDoc, value);

		const docRef = manager.firestoreDB.doc(docPath);
		if (fieldPathInDoc) {
			value = value != null ? value : firebaseApp.firestore.FieldValue.delete();

			// await docRef.update({ [fieldPathInDoc]: value });
			// set works even if the document doesn't exist yet, so use set instead of update
			const nestedSetHelper = {};
			DeepSet(nestedSetHelper, fieldPathInDoc, value, ".", true);
			await docRef.set(nestedSetHelper, {merge: true});
		} else {
			if (value) {
				await docRef.set(value);
			} else {
				await docRef.delete();
			}
		}
	} else {
		// await firestoreDB.runTransaction(async batch=> {
		const batch = manager.firestoreDB.batch();
		for (let [path, value] of updateEntries) {
			const [docPath, fieldPathInDoc] = GetPathParts(path, true);
			value = Clone(value); // picky firestore library demands "simple JSON objects"

			// [fieldPathInDoc, value] = FixSettingPrimitiveValueDirectly(fieldPathInDoc, value);

			const docRef = manager.firestoreDB.doc(docPath);
			if (fieldPathInDoc) {
				value = value != null ? value : firebaseApp.firestore.FieldValue.delete();

				// batch.update(docRef, { [fieldPathInDoc]: value });
				// set works even if the document doesn't exist yet, so use set instead of update
				const nestedSetHelper = {};
				DeepSet(nestedSetHelper, fieldPathInDoc, value, ".", true);
				batch.set(docRef, nestedSetHelper, {merge: true});
			} else {
				if (value) {
					batch.set(docRef, value);
				} else {
					batch.delete(docRef);
				}
			}
			/* let path_final = DBPath(path);
			let dbRef_parent = firestoreDB.doc(path_final.split("/").slice(0, -1).join("/"));
			let value_final = Clone(value); // clone value, since update() rejects values with a prototype/type
			batch.update(dbRef_parent, {[path_final.split("/").Last()]: value_final}); */
		}
		await batch.commit();
	}
}

export const maxDBUpdatesPerBatch = 500;
export async function ApplyDBUpdates_InChunks(rootPath: string, dbUpdates: Object, updatesPerChunk = maxDBUpdatesPerBatch) {
	const dbUpdates_pairs = dbUpdates.Pairs();

	const dbUpdates_pairs_chunks = [];
	for (let offset = 0; offset < dbUpdates_pairs.length; offset += updatesPerChunk) {
		const chunk = dbUpdates_pairs.slice(offset, offset + updatesPerChunk);
		dbUpdates_pairs_chunks.push(chunk);
	}

	for (const [index, dbUpdates_pairs_chunk] of dbUpdates_pairs_chunks.entries()) {
		const dbUpdates_chunk = dbUpdates_pairs_chunk.ToMap(a=>a.key, a=>a.value);
		if (dbUpdates_pairs_chunks.length > 1) {
			MaybeLog_Base(a=>a.commands, l=>l(`Applying db-updates chunk #${index + 1} of ${dbUpdates_pairs_chunks.length}...`));
		}
		await ApplyDBUpdates(rootPath, dbUpdates_chunk);
	}
}

export function ApplyDBUpdates_Local(dbData: any, dbUpdates: Object) {
	let result = dbData;
	for (const {name: path, value} of Clone(dbUpdates).Props()) {
		if (value != null) {
			result = u.updateIn(path.replace(/\//g, "."), u.constant(value), result);
		} else {
			result = u.updateIn(path.split("/").slice(0, -1).join("."), u.omit(path.split("/").slice(-1)), result);
		}
	}

	// firebase deletes becoming-empty collections/documents (and we pre-process-delete becoming-empty fields), so we do the same here
	const nodes = GetTreeNodesInObjTree(result, true);
	let emptyNodes;
	do {
		emptyNodes = nodes.filter(a=>typeof a.Value === "object" && (a.Value == null || a.Value.VKeys(true).length === 0));
		for (const node of emptyNodes) {
			delete node.obj[node.prop];
		}
	} while (emptyNodes.length);

	return result;
}

/*function FixSettingPrimitiveValueDirectly(fieldPathInDoc: string, value) {
	if (!looksLikeJsonObject(value) || !isPlainObject(value)) {
		[fieldPathInDoc, value] = [
			fieldPathInDoc.substr(0, fieldPathInDoc.lastIndexOf(".").IfN1Then(fieldPathInDoc.length)),
			{[fieldPathInDoc.split(".").Last()]: value},
		];
	}
	return [fieldPathInDoc, value];
}

// returns true if should be represented in firestore-db as an "object" type (rather than firestore Date, number, etc.)
let jsonTypes = [Array, Date, g.Timestamp, g.GeoPoint, Blob, g.DocumentKeyReference, g.FieldValueImpl];
function looksLikeJsonObject(input) {
	return (
		typeof input === 'object' &&
		input !== null &&
		!(input instanceof (Array || {} as any) &&
		!(input instanceof (Date || {} as any)) &&
		!(input instanceof (g.Timestamp || {} as any)) &&
		!(input instanceof (g.GeoPoint || {} as any)) &&
		!(input instanceof (Blob || {} as any)) &&
		!(input instanceof (g.DocumentKeyReference || {} as any)) &&
		!(input instanceof (g.FieldValueImpl || {} as any)))
	);
}
function isPlainObject(input) {
	return (
		typeof input === 'object' &&
		input !== null &&
		Object.getPrototypeOf(input) === Object.prototype
	);
}*/

//export interface FirebaseApp extends firebase.app.App {
export type FirebaseApp = firebase.app.App & {
	// added by react-redux-firebase
	_,
	helpers: {
		ref(path: string), //: firebase.DatabaseReference,
		set,
		uniqueSet,
		push,
		remove,
		update,
		login(options: {provider: "email?" | "google" | "facebook" | "twitter" | "github" | "anonymous?" | "?", type: "popup" | "?"}),
		logout(),
		uploadFile,
		uploadFiles,
		deleteFile,
		createUser,
		resetPassword,
		watchEvent,
		unWatchEvent,
		storage(), //: firebase.FirebaseStorage,
	},
};