import { OnPopulated, manager } from "../../Manager";
import firebase from "firebase";
import { SplitStringBySlash_Cached } from "./StringSplitCache";
import { GetTreeNodesInObjTree, DeepSet, DeepGet } from "js-vextensions";
import { RequestPath, inConnectFunc, ClearRequestedPaths, GetRequestedPaths, UnsetListeners, SetListeners } from "./FirebaseConnect";
import { State_Base } from "../Store/StoreHelpers";
import { ShallowChanged } from "react-vextensions";
import u from "updeep";
import { MaybeLog } from "../General/Logging";

OnPopulated(()=> {
	G({firebase_: firebase}); // doesn't show as R.firebase, fsr
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

/*export function CombinePathSegments(...pathSegments: (string | number)[]) {
	let result = "";
	for (let segment of pathSegments) {
		if (segment[0] != ".") {
			result += "/";
		}
		result += segment;
	}
	return result;
}*/
export function GetPathParts(path: string, asFBPath = false) {
	let docPath = path.substr(0, path.indexOf("/.").IfN1Then(path.length));
	let fieldPathInDoc = docPath.length < path.length ? path.substr(docPath.length + 2).replace(/\./g, "") : null;
	if (asFBPath) {
		[docPath, fieldPathInDoc] = [VPathToFBPath(docPath), VFieldPathToFBFieldPath(fieldPathInDoc)];
	}
	return [docPath, fieldPathInDoc];
}

export function DBPath(path = "", inVersionRoot = true) {
	Assert(path != null, "Path cannot be null.");
	Assert(IsString(path), "Path must be a string.");
	/*let versionPrefix = path.match(/^v[0-9]+/);
	if (versionPrefix == null) // if no version prefix already, add one (referencing the current version)*/
	if (inVersionRoot) {
		path = `versions/v${manager.dbVersion}-${manager.env_short}${path ? `/${path}` : ''}`;
	}
	return path;
}
export function DBPathSegments(pathSegments: (string | number)[], inVersionRoot = true) {
	let result = pathSegments;
	if (inVersionRoot) {
		result = (["versions", `v${manager.dbVersion}-${manager.env_short}`] as any).concat(result);
	}
	return result;
}

export function PathToListenerPath(path: string) {
	let pathNodesLeft = path.split("/");
	function ConvertNextTwoPathNodesIntoListenerPathNode(pathNodes: string[]) {
		let result = {} as any;
		let collectionNode = pathNodes.splice(0, 1)[0];
		Assert(collectionNode.trim().length, `Path node cannot be empty. Path: ${path}`);
		result.collection = collectionNode;
		if (pathNodes.length) {
			result.doc = pathNodes.splice(0, 1)[0];
		}
		return result;
	}
	
	let root = ConvertNextTwoPathNodesIntoListenerPathNode(pathNodesLeft);
	if (pathNodesLeft.length) {
		root.subcollections = [];
		while (pathNodesLeft.length) {
			root.subcollections.push(ConvertNextTwoPathNodesIntoListenerPathNode(pathNodesLeft));
		}
	}
	return root;
}
export function ListenerPathToPath(listenerPath: any) {
	let result = [];
	let pathNodes = [listenerPath].concat((listenerPath.subcollections || []));
	for (let pathNode of pathNodes) {
		result.push(pathNode.collection);
		if (pathNode.doc) {
			result.push(pathNode.doc);
		}
	}
	return result.join("/");
}

export function SlicePath(path: string, removeFromEndCount: number, ...itemsToAdd: string[]) {
	//let parts = path.split("/");
	let parts = SplitStringBySlash_Cached(path).slice();
	parts.splice(parts.length - removeFromEndCount, removeFromEndCount, ...itemsToAdd);
	return parts.join("/");
}

Object.prototype._AddFunction_Inline = function DBRef(path = "", inVersionRoot = true) {
	let finalPath = DBPath(path, inVersionRoot);
	return this.ref(finalPath);
}

export function ProcessDBData(data, standardizeForm: boolean, addHelpers: boolean, rootKey: string) {
	var treeNodes = GetTreeNodesInObjTree(data, true);
	for (let treeNode of treeNodes) {
		if (treeNode.Value == null) continue;

		// turn the should-not-have-been-array arrays (the ones without a "0" property) into objects
		if (standardizeForm && treeNode.Value instanceof Array && treeNode.Value[0] === undefined) {
			// if changing root, we have to actually modify the prototype of the passed-in "data" object
			/*if (treeNode.Value == data) {
				Object.setPrototypeOf(data, Object.getPrototypeOf({}));
				for (var key of Object.keys(data)) {
					if (data[key] === undefined)
						delete data[key];
				}
				continue;
			}*/

			let valueAsObject = {}.Extend(treeNode.Value) as any;
			for (let key in valueAsObject) {
				// if fake array-item added by Firebase/js (just so the array would have no holes), remove it
				//if (valueAsObject[key] == null)
				if (valueAsObject[key] === undefined)
					delete valueAsObject[key];
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
			
			let valueAsArray = [].Extend(treeNode.Value) as any;

			if (treeNode.Value == data) treeNode.obj[treeNode.prop] = valueAsArray; // if changing root, we need to modify wrapper.data
			else DeepSet(data, treeNode.PathStr, valueAsArray); // else, we need to use deep-set, because ancestors may have already changed during this transform/processing
		}

		// add special _key or _id prop
		if (addHelpers && typeof treeNode.Value == "object") {
			let key = treeNode.prop == "_root" ? rootKey : treeNode.prop;
			if (parseInt(key).toString() == key) {
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
let helperProps = ["_key", "_id"];
/** Note: this mutates the original object. */
export function RemoveHelpers(data) {
	var treeNodes = GetTreeNodesInObjTree(data, true);
	for (let treeNode of treeNodes) {
		if (helperProps.Contains(treeNode.prop))
			delete treeNode.obj[treeNode.prop];
	}
	return data;
}

class DBPathInfo {
	lastTimestamp = -1;
	cachedData;
}
let pathInfos = {} as {[path: string]: DBPathInfo};

export class GetData_Options {
	inVersionRoot? = true;
	makeRequest? = true;
	useUndefinedForInProgress? = false;
	queries?: any;
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
	let pathSegments: (string | number)[], options: GetData_Options;
	//if (typeof args[0] == "string") pathSegments = args;
	if (typeof args[0] == "string") pathSegments = args;
	else [options, ...pathSegments] = args;
	options = E(new GetData_Options(), options);

	pathSegments = DBPathSegments(pathSegments, options.inVersionRoot);

	if (manager.devEnv) {
		//Assert((manager.dbVersion && manager.env_short) || !options.inVersionRoot, "Cannot call GetData in-version-root until the dbVersion and env_short variables are supplied.");
		Assert(!pathSegments.Contains("vundefined-undefined"), `The path contains "vundefined-undefined"! This suggests that a module, like firebase-forum, is calling GetData before InitLibs() has executed.`);
		Assert(pathSegments.All(segment=>typeof segment == "number" || !segment.Contains("/")),
			`Each string path-segment must be a plain prop-name. (ie. contain no "/" separators) @segments(${pathSegments})`);
	}

	let path = pathSegments.join("/");
	/*if (options.queries && options.queries.VKeys().length) {
		let queriesStr = "";
		for (let {name, value, index} of options.queries.Props()) {
			queriesStr += (index == 0 ? "#" : "&") + name + "=" + value;
		}
		pathSegments[pathSegments.length - 1] = pathSegments.Last() + queriesStr;
		path += queriesStr.replace(/[#=]/g, "_");
	}*/

	if (options.makeRequest) {
		let queriesStr = "";
		if (options.queries && options.queries.VKeys().length) {
			for (let {name, value, index} of options.queries.Props()) {
				queriesStr += (index == 0 ? "#" : "&") + name + "=" + value;
			}
		}
		RequestPath(path + queriesStr);
	}

	//let result = State("firebase", "data", ...SplitStringByForwardSlash_Cached(path)) as any;
	let result = State_Base("firestore", "data", ...pathSegments.map(a=>typeof a == "string" && a[0] == "." ? a.substr(1) : a)) as any;
	//let result = State("firebase", "data", ...pathSegments) as any;
	if (result == null && options.useUndefinedForInProgress) {
		let requestCompleted = State_Base().firestore.status.requested[path];
		if (!requestCompleted) return undefined; // undefined means, current-data for path is null/non-existent, but we haven't completed the current request yet
		else return null; // null means, we've completed the request, and there is no data at that path
	}
	return result;
}

export class GetDataAsync_Options {
	inVersionRoot? = true;
	addHelpers? = true;
}

G({GetDataAsync});
export async function GetDataAsync(...pathSegments: (string | number)[]);
export async function GetDataAsync(options: GetDataAsync_Options, ...pathSegments: (string | number)[]);
export async function GetDataAsync(...args) {
	let pathSegments: (string | number)[], options: GetDataAsync_Options;
	if (typeof args[0] == "string") pathSegments = args;
	else [options, ...pathSegments] = args;
	options = E(new GetDataAsync_Options(), options);

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

	let path = DBPath(pathSegments.join("/"), options.inVersionRoot);
	//let path = CombinePathSegments(...pathSegments);
	let [colOrDocPath, fieldPathInDoc] = GetPathParts(path);
	let isDoc = colOrDocPath.split("/").length % 2 == 0;

	let result;
	if (isDoc) {
		let doc = await manager.firestoreDB.doc(colOrDocPath).get();
		let docData = doc.exists ? doc.data() : null;
		result = fieldPathInDoc ? DeepGet(docData, fieldPathInDoc) : docData;
	} else {
		let docs = (await manager.firestoreDB.collection(colOrDocPath).get()).docs;
		result = {};
		for (let doc of docs) {
			result[doc.id] = doc.data();
		}
	}

	if (result) {
		result = ProcessDBData(result, true, options.addHelpers, pathSegments.Last()+"");
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
	Assert(!inConnectFunc, "Cannot run GetAsync() from within a Connect() function.");
	//Assert(!g.inGetAsyncFunc, "Cannot run GetAsync() from within a GetAsync() function.");
	let firebase = manager.store.firebase;

	let result;

	let requestedPathsSoFar = {};
	let requestedPathsSoFar_last;
	do {
		requestedPathsSoFar_last = Clone(requestedPathsSoFar);

		ClearRequestedPaths();
		result = dbGetterFunc();
		let newRequestedPaths = GetRequestedPaths().Except(requestedPathsSoFar.VKeys());

		/*unWatchEvents(firebase, store.dispatch, getEventsFromInput(newRequestedPaths)); // do this just to trigger re-get
		// start watching paths (causes paths to be requested)
		watchEvents(firebase, store.dispatch, getEventsFromInput(newRequestedPaths));*/
		
		UnsetListeners(newRequestedPaths); // do this just to trigger re-get
		// start watching paths (causes paths to be requested)
		SetListeners(newRequestedPaths);

		for (let path of newRequestedPaths) {
			requestedPathsSoFar[path] = true;
			// wait till data is received
			await WaitTillPathDataIsReceived(path);
		}

		// stop watching paths (since we already got their data)
		// todo: find correct way of unwatching events; the way below seems to sometimes unwatch while still needed watched
		// for now, we just never unwatch
		//unWatchEvents(firebase, store.dispatch, getEventsFromInput(newRequestedPaths));
	} while (ShallowChanged(requestedPathsSoFar, requestedPathsSoFar_last))

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
	return RemoveHelpers(Clone(value));
}

export function WaitTillPathDataIsReceived(path: string): Promise<any> {
	return new Promise((resolve, reject)=> {
		let pathDataReceived = State_Base().firestore.status.requested[path];
		// if data already received, return right away
		if (pathDataReceived) {
			resolve();
		}

		// else, add listener, and wait till store received the data (then return it)
		let listener = ()=> {
			//pathDataReceived = State(a=>a.firebase.requested[path]);
			pathDataReceived = State_Base().firestore.status.requested[path];
			if (pathDataReceived) {
				unsubscribe();
				resolve();
			}
		};
		let unsubscribe = manager.store.subscribe(listener);
	});
}

/*;(function() {
	var Firebase = require("firebase");
	var FirebaseRef = Firebase.database.Reference;

	Firebase.ABORT_TRANSACTION_NOW = {};

	var originalTransaction = FirebaseRef.prototype.transaction;
	FirebaseRef.prototype.transaction = function transaction(updateFunction, onComplete, applyLocally) {
		var aborted, tries = 0, ref = this, updateError;

		var promise = new Promise(function(resolve, reject) {
			var wrappedUpdate = function(data) {
				// Clone data in case updateFunction modifies it before aborting.
				var originalData = JSON.parse(JSON.stringify(data));
				aborted = false;
				try {
					if (++tries > 100) throw new Error('maxretry');
					var result = updateFunction.call(this, data);
					if (result === undefined) {
						aborted = true;
						result = originalData;
					} else if (result === Firebase.ABORT_TRANSACTION_NOW) {
						aborted = true;
						result = undefined;
					}
					return result;
				} catch (e) {
					// Firebase propagates exceptions thrown by the update function to the top level.	So
					// catch them here instead, reject the promise, and abort the transaction by returning
					// undefined.
					updateError = e;
				}
			};

			function txn() {
				try {
					originalTransaction.call(ref, wrappedUpdate, function(error, committed, snapshot) {
						error = error || updateError;
						var result;
						if (error && (error.message === 'set' || error.message === 'disconnect')) {
							txn();
						} else if (error) {
							result = onComplete ? onComplete(error, false, snapshot) : undefined;
							reject(error);
						} else {
							result = onComplete ? onComplete(error, committed && !aborted, snapshot) : undefined;
							resolve({committed: committed && !aborted, snapshot: snapshot});
						}
						return result;
					}, applyLocally);
				} catch (e) {
					if (onComplete) onComplete(e, false);
					reject(e);
				}
			}

			txn();
		});

		return promise;
	};
})();*/

//export function FirebaseConnect<T>(paths: string[]); // just disallow this atm, since you might as well just use a connect/getter func
/*export function FirebaseConnect<T>(pathsOrGetterFunc?: string[] | ((props: T)=>string[]));
export function FirebaseConnect<T>(pathsOrGetterFunc?) {
	return firebaseConnect(props=> {
		let paths =
			pathsOrGetterFunc instanceof Array ? pathsOrGetterFunc :
			pathsOrGetterFunc instanceof Function ? pathsOrGetterFunc(props) :
			[];
		paths = paths.map(a=>DBPath(a)); // add version prefix to paths
		return paths;
	});
}*/

export async function ApplyDBUpdates(rootPath: string, dbUpdates: Object) {
	dbUpdates = Clone(dbUpdates);
	if (rootPath != null) {
		for (const { name: localPath, value } of dbUpdates.Props()) {
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
			value = value != null ? value : (firebase as any).firestore.FieldValue.delete();

			// await docRef.update({ [fieldPathInDoc]: value });
			// set works even if the document doesn't exist yet, so use set instead of update
			const nestedSetHelper = {};
			DeepSet(nestedSetHelper, fieldPathInDoc, value, '.', true);
			await docRef.set(nestedSetHelper, { merge: true });
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
				value = value != null ? value : (firebase as any).firestore.FieldValue.delete();

				// batch.update(docRef, { [fieldPathInDoc]: value });
				// set works even if the document doesn't exist yet, so use set instead of update
				const nestedSetHelper = {};
				DeepSet(nestedSetHelper, fieldPathInDoc, value, '.', true);
				batch.set(docRef, nestedSetHelper, { merge: true });
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
		const dbUpdates_chunk = dbUpdates_pairs_chunk.ToMap(a => a.key, a => a.value);
		MaybeLog(a => a.commands, l => l`Applying db-updates chunk #${index + 1} of ${dbUpdates_pairs_chunks.length}...`);
		await ApplyDBUpdates(rootPath, dbUpdates_chunk);
	}
}

export function ApplyDBUpdates_Local(dbData: any, dbUpdates: Object) {
	let result = dbData;
	for (const { name: path, value } of Clone(dbUpdates).Props()) {
		if (value != null) {
			result = u.updateIn(path.replace(/\//g, '.'), u.constant(value), result);
		} else {
			result = u.updateIn(path.split('/').slice(0, -1).join('.'), u.omit(path.split('/').slice(-1)), result);
		}
	}

	// firebase deletes becoming-empty collections/documents (and we pre-process-delete becoming-empty fields), so we do the same here
	const nodes = GetTreeNodesInObjTree(result, true);
	let emptyNodes;
	do {
		emptyNodes = nodes.filter(a => typeof a.Value === 'object' && (a.Value == null || a.Value.VKeys(true).length === 0));
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