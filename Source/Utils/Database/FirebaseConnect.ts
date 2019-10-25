import {FromJSON, GetTreeNodesInObjTree, IsObject, ToJSON} from "js-vextensions";
import _ from "lodash";
import {connect} from "react-redux";
import {ShallowChanged} from "react-vextensions";
import {firestoreReducer} from "redux-firestore";
import {manager, OnPopulated, RootState_Base} from "../../Manager";
import {e, g} from "../../PrivateExports";
import {MaybeLog_Base, ShouldLog_Base} from "../General/Logging";
import {ActionSet, State_Base} from "../Store/StoreHelpers";
import {activeStoreAccessCollectors, GetPathParts, NotifyPathsReceived, NotifyPathsReceiving, NotifyQueriesReceived, PathToListenerPath} from "./DatabaseHelpers";
import {SplitStringBySlash_Cached} from "./StringSplitCache";

// todo: rename to FirestoreConnect

// Place a selector in Connect() whenever it uses data that:
// 1) might change during the component's lifetime, and:
// 2) is not already used by an existing selector in Connect()
// This way, it'll correctly trigger a re-render when the underlying data changes.

// This is used, for now, when you want to use a number of GetAsync() calls in a row, but don't want this slowing down the UI by having all UI components run their selectors every time.
// Calling freeze before the set of calls will delay the connect/ui updates until unfreeze is called. (used primarily for the more-efficient running of Command instances locally)
export let connectCompsFrozen = false;
export function FreezeConnectComps() {
	connectCompsFrozen = true;
}
export function UnfreezeConnectComps(triggerStoreChange = true) {
	connectCompsFrozen = false;
	// trigger store-change, so that frozen-comps that would have updated based on changes while frozen, can now do so
	if (triggerStoreChange) {
		manager.store.dispatch({type: "UnfreezeConnectComps"});
	}
}

G({FirebaseConnect: Connect}); // make global, for firebase-forum

// if you're sending in a connect-func rather than a connect-func-wrapper, then you need to make it have at least one argument (to mark it as such)
/*export function Connect<T, P>(innerMapStateToPropsFunc: (state: RootState_Base, props: P)=>any);
export function Connect<T, P>(mapStateToProps_inner_getter: ()=>(state: RootState_Base, props: P)=>any);
export function Connect<T, P>(funcOrFuncGetter) {
	let mapStateToProps_inner: (state: RootState_Base, props: P)=>any;
	let mapStateToProps_inner_getter: ()=>(state: RootState_Base, props: P)=>any;
	const isFuncGetter = funcOrFuncGetter.length == 0; //&& typeof TryCall(funcOrFuncGetter) == "function";
	if (!isFuncGetter) mapStateToProps_inner = funcOrFuncGetter;
	else mapStateToProps_inner_getter = funcOrFuncGetter;*/

export function Connect<T, P>(mapStateToProps_inner: (state: RootState_Base, props: P)=>any, forwardRef = true) {
	const mapStateToProps_wrapper = function(state: RootState_Base, props: P) {
		const s = this;
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
		let result;
		if (manager.devEnv) {
			//let debugText = ToJSON(props).replace(/[^a-zA-Z0-9]/g, "_");
			const debugText = `${props["node"] ? ` @ID:${props["node"]._id}` : ""} @changedPath: ${changedPath}`;
			const wrapperFunc = eval(`(function ${debugText.replace(/[^a-zA-Z0-9]/g, "_")}() { return mapStateToProps_inner.apply(s, arguments); })`);
			result = wrapperFunc.call(s, state, props);
		} else {
			result = mapStateToProps_inner.call(s, state, props);
		}

		manager.globalConnectorPropGetters.Pairs().forEach(({key, value: getter})=>{
			result[key] = getter.call(s, state, props);
		});

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
	};

	/*if (mapStateToProps_inner) {
		//return connect(mapStateToProps_wrapper, null, null, {withRef: true}); // {withRef: true} lets you do wrapperComp.getWrappedInstance()
		return connect(mapStateToProps_wrapper, null, null, {forwardRef: true}); // {fowardRef: true} will make-so the "ref" callback will return the wrapped-comp rather than the Connect wrapper-comp
	}
	return connect(()=>{
		mapStateToProps_inner = mapStateToProps_inner_getter();
		return mapStateToProps_wrapper;
	//}, null, null, {withRef: true});
	}, null, null, {forwardRef: true});*/

	return connect(mapStateToProps_wrapper, null, null, forwardRef ? {forwardRef: true} : {}) as any; // {fowardRef: true} will make-so the "ref" callback will return the wrapped-comp rather than the Connect wrapper-comp
}

export function SetListeners_Query(queryRequestJSONs: string[]) {
	for (const queryJSON of queryRequestJSONs) {
		const query = FromJSON(queryJSON) as QueryRequest;
		const listenerMeta = PathToListenerPath(query.path);
		listenerMeta.storeAs = query.key;

		if (query.whereFilters) {
			//Assert(query.whereFilters.length == 1, "Only one where-filter is supported atm.");
			const deepestNode = GetTreeNodesInObjTree(listenerMeta, true).OrderBy(a=>a.ancestorNodes.length).Last(a=>IsObject(a.Value));
			deepestNode.Value.where = query.whereFilters.map(filter=>{
				return [filter.propPath, filter.comparison, filter.value];
			});
			//deepestNode.Value.storeAs = query.key;
		}

		manager.store.firestore.setListeners([listenerMeta]);
	}
}

export const pathListenerCounts = {};
export function SetListeners(paths: string[]) {
	const paths_toDocs = paths.map(path=>GetPathParts(path)[0]);
	for (const path of paths_toDocs) {
		const oldListenerCount = pathListenerCounts[path] || 0;
		pathListenerCounts[path] = oldListenerCount + 1;
		if (oldListenerCount > 0) continue;

		// for debugging, you can check currently-watched-paths using: store.firestore._.listeners
		const listenerPath = PathToListenerPath(path);
		manager.store.firestore.setListener(listenerPath);
	}
}
export function UnsetListeners(paths: string[], forceUnsetActualListener = false) {
	const paths_toDocs = paths.map(path=>GetPathParts(path)[0]);
	for (const path of paths_toDocs) {
		const listenerPath = PathToListenerPath(path);
		pathListenerCounts[path]--;
		if (pathListenerCounts[path] == 0 || forceUnsetActualListener) {
			manager.store.firestore.unsetListener(listenerPath);
		}
	}
}

// in dev-mode, don't buffer actions as this makes it harder to debug using Redux dev-tools panel
//const actionTypeBufferInfos = DEV ? {} : {
const actionTypeBufferInfos = {
	"@@reactReduxFirebase/START": {time: 300},
	"@@reactReduxFirebase/SET": {time: 300},
	// buffer these less, since is we buffer too much it can slow down the progressive-response of the Connect() functions to new data
	/*"@@reduxFirestore/SET_LISTENER": {time: 300},
	"@@reduxFirestore/LISTENER_RESPONSE": {time: 300},
	"@@reduxFirestore/UNSET_LISTENER": {time: 300},*/
};
const actionTypeLastDispatchTimes = {};
const actionTypeBufferedActions = {};

OnPopulated(()=>{
	// Set up action-type buffering, as well as "dispatch blocking" for some actions that are useless and just slow the UI/connect-funcs down.
	// (The dispatch-blocking only works fully with the optimization in the CDL webpack-config, which modifies redux to not notify subscribers, if an action caused absolutely no change to the store data)
	e.AddDispatchInterceptor(action=>{
		// These are merely informational entries into the redux store. We don't use them, so block these actions from being dispatched.
		// if (action.type === '@@reduxFirestore/SET_LISTENER' || action.type === '@@reduxFirestore/UNSET_LISTENER') return;
		if (action.type === "@@reduxFirestore/SET_LISTENER" || action.type === "@@reduxFirestore/UNSET_LISTENER" || e.DoesActionSetFirestoreData(action)) {
			const state = State_Base();
			// const newFirebaseState = firebaseStateReducer(state.firebase, action);
			const newFirestoreState = firestoreReducer(state.firestore, action);

			// Watch for changes to requesting and requested, and channel those statuses into a custom pathReceiveStatuses map.
			// This way, when an action only changes these statuses, we can cancel the action dispatch, greatly reducing performance impact.
			NotifyPathsReceiving(newFirestoreState.status.requesting.Pairs().filter(a=>a.value).map(a=>a.key));
			NotifyPathsReceived(newFirestoreState.status.requested.Pairs().filter(a=>a.value).map(a=>a.key));

			if (action.meta && action.meta.storeAs) {
				NotifyQueriesReceived([action.meta.storeAs]);
			}

			// Probably temp; this type was causing MAJOR slowdowns in cdl project. Removing it seems to, at least usually, not ruin anything, so if added back, clean or have author clean this system up!
			/*if (action.type == "@@reduxFirestore/DOCUMENT_ADDED") {
				const path = GetFirestoreDataSetterActionPath(action);
				// if collection, block dispatch
				if (path.split("/").length % 2 == 1) {
					return false;
				}
			}*/

			// these ones never store actual data, so always block them
			if (action.type === "@@reduxFirestore/SET_LISTENER" || action.type === "@@reduxFirestore/UNSET_LISTENER") {
				return false; // block dispatch
			}
			// certain actions only sometimes store (new) data, so conditionally block them
			/*if (action.type == "@@reduxFirestore/DOCUMENT_ADDED" || action.type == "@@reduxFirestore/LISTENER_RESPONSE") {
				// Here we check if the action changed more than just the statuses. If it didn't, block the action dispatch.
				const path = GetFirestoreDataSetterActionPath(action);
				const oldData = DeepGet(state.firestore.data, path);
				const newData = DeepGet(newFirestoreState.data, path);
				// if (newData === oldData) {
				if (newData === oldData || ToJSON(newData) === ToJSON(oldData)) {
					return false;
				}
			}*/
		}

		const timeSinceLastDispatch = Date.now() - (actionTypeLastDispatchTimes[action.type] || 0);
		const bufferInfo = actionTypeBufferInfos[action.type];

		// if we're not supposed to buffer this action type, or it's been long enough since last dispatch of this type
		if (bufferInfo == null || timeSinceLastDispatch >= bufferInfo.time) {
			actionTypeLastDispatchTimes[action.type] = Date.now();
			// dispatch action right away
			return true;
		}

		// else, buffer action to be dispatched later
		// if timer not started, start it now
		if (actionTypeBufferedActions[action.type] == null) {
			setTimeout(()=>{
				// now that wait is over, apply any buffered event-triggers
				manager.store.dispatch(new ActionSet(...actionTypeBufferedActions[action.type]));

				actionTypeLastDispatchTimes[action.type] = Date.now();
				actionTypeBufferedActions[action.type] = null;
			}, (actionTypeLastDispatchTimes[action.type] + bufferInfo.time) - Date.now());
		}

		// add action to buffer, to be run when timer ends
		actionTypeBufferedActions[action.type] = (actionTypeBufferedActions[action.type] || []).concat(action);
	});
});


export class WhereFilter {
	constructor(propPath: string, comparison: string, value: string) {
		this.propPath = propPath;
		this.comparison = comparison;
		this.value = value;
	}
	propPath: string;
	comparison: string;
	value: string;
}

export class QueryRequest {
	constructor(initialData?: Partial<QueryRequest>) {
		this.Extend(initialData);
	}
	key: string;
	path: string;
	whereFilters: WhereFilter[];
}

const allQueryRequests = {} as {[key: string]: boolean};
let queryRequests = {} as {[key: string]: boolean};
export function RequestPath_Query(key: string, path: string, whereFilters?: WhereFilter[]) {
	const query = new QueryRequest({key, path, whereFilters});
	const queryJSON = ToJSON(query);
	MaybeLog_Base(a=>a.dbRequests, log=>{
		if (allQueryRequests[queryJSON] == null || !ShouldLog_Base(a=>a.dbRequests_onlyFirst)) {
			log(`${_.padEnd(`Requesting query (stage 1): ${queryJSON}`, 150)}Component:${g.inConnectFuncFor ? g.inConnectFuncFor.name : ""}`);
		}
	});
	allQueryRequests[queryJSON] = true;

	queryRequests[queryJSON] = true;
}
export function ClearRequests_Query() {
	queryRequests = {};
}
export function GetRequests_Query_JSON(): string[] {
	return queryRequests.VKeys();
}
export function GetRequests_Query(): QueryRequest[] {
	return GetRequests_Query_JSON().map(FromJSON);
}
export function GetRequests_Query_Keys(): string[] {
	return GetRequests_Query().map(a=>a.key);
}

const allDBPathsRequested = {};
let requestedPaths = {} as {[key: string]: boolean};
/** This only adds paths to a "request list". Connect() is in charge of making the actual db requests. */
export function RequestPath(path: string) {
	MaybeLog_Base(a=>a.dbRequests, log=>{
		if (allDBPathsRequested[path] == null || !ShouldLog_Base(a=>a.dbRequests_onlyFirst)) {
			log(`${_.padEnd(`Requesting db-path (stage 1): ${path}`, 150)}Component:${g.inConnectFuncFor ? g.inConnectFuncFor.name : ""}`);
		}
	});
	allDBPathsRequested[path] = true;

	// firestore path-requests are always by-doc, so cut off any field-paths
	const path_toDoc = GetPathParts(path)[0];
	requestedPaths[path_toDoc] = true;
}
/** This only adds paths to a "request list". Connect() is in charge of making the actual db requests. */
export function RequestPaths(paths: string[]) {
	for (const path of paths) {
		RequestPath(path);
	}
}
export function ClearRequestedPaths() {
	requestedPaths = {};
}
export function GetRequestedPaths() {
	return requestedPaths.VKeys();
}

export let accessedStorePaths = {} as {[key: string]: boolean};
export function OnAccessPath(path: string, value: any) {
	// Log("Accessing-path Stage1: " + path);
	// let path = pathSegments.join("/");
	accessedStorePaths[path] = true;
	if (activeStoreAccessCollectors) {
		for (const collector of activeStoreAccessCollectors) {
			collector.storePathsRequested_withValues[path] = value;
		}
	}
}
/*export function OnAccessPaths(paths: string[]) {
	for (let path of paths)
		OnAccessPath(path);
}*/
export function ClearAccessedPaths() {
	accessedStorePaths = {};
}
export function GetAccessedPaths() {
	//Log("GetAccessedPaths:" + accessedStorePaths.VKeys());
	return accessedStorePaths.VKeys();
}