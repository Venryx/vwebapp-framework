import firebase_ from "firebase";
import {connect} from "react-redux";
import {ShallowChanged} from "react-vextensions";
import {setListeners, unsetListeners} from "redux-firestore/es/actions/firestore";
import {GetPathParts, PathToListenerPath, activeStoreAccessCollectors} from "./DatabaseHelpers";
import {State_Base, ActionSet} from "../Store/StoreHelpers";
import {SplitStringBySlash_Cached} from "./StringSplitCache";
import {manager, RootState_Base} from "../../Manager";
import {g} from "../../PrivateExports";

const firebase = firebase_ as any;

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
export function Connect<T, P>(innerMapStateToPropsFunc: (state: RootState_Base, props: P)=>any);
export function Connect<T, P>(mapStateToProps_inner_getter: ()=>(state: RootState_Base, props: P)=>any);
export function Connect<T, P>(funcOrFuncGetter) {
	let mapStateToProps_inner: (state: RootState_Base, props: P)=>any; let
mapStateToProps_inner_getter: ()=>(state: RootState_Base, props: P)=>any;
	const isFuncGetter = funcOrFuncGetter.length == 0; //&& typeof TryCall(funcOrFuncGetter) == "function";
	if (!isFuncGetter) mapStateToProps_inner = funcOrFuncGetter;
	else mapStateToProps_inner_getter = funcOrFuncGetter;

	const mapStateToProps_wrapper = function(state: RootState_Base, props: P) {
		const s = this;
		if (connectCompsFrozen && s.lastResult) {
			return s.lastResult;
		}
		g.inConnectFuncFor = s.WrappedComponent;

		ClearRequestedPaths();
		ClearAccessedPaths();
		//Assert(GetAccessedPaths().length == 0, "Accessed-path must be empty at start of mapStateToProps call (ie. the code in Connect()).");

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
		const propsChanged = ShallowChanged(props, s.lastProps || {}, "children");

		//let result = storeDataChanged ? mapStateToProps_inner(state, props) : s.lastResult;
		if (!storeDataChanged && !propsChanged) {
			g.inConnectFuncFor = null;
			return s.lastResult;
		}
		//let result = mapStateToProps_inner.call(s, state, props);
		// for debugging in profiler
		//let debugText = ToJSON(props).replace(/[^a-zA-Z0-9]/g, "_");
		const debugText = `${props["node"] ? ` @ID:${props["node"]._id}` : ""} @changedPath: ${changedPath}`;
		const wrapperFunc = eval(`(function ${debugText.replace(/[^a-zA-Z0-9]/g, "_")}() { return mapStateToProps_inner.apply(s, arguments); })`);
		const result = wrapperFunc.call(s, state, props);

		manager.globalConnectorPropGetters.Pairs().forEach(({key, value: getter})=>{
			result[key] = getter.call(s, state, props);
		});

		const oldRequestedPaths: string[] = s.lastRequestedPaths || [];
		const requestedPaths = GetRequestedPaths();
		//if (firebase._ && ShallowChanged(requestedPaths, oldRequestedPaths)) {
		if (ShallowChanged(requestedPaths, oldRequestedPaths)) {
			window["setImmediate"](()=>{
				//s.lastEvents = getEventsFromInput(requestedPaths.map(path=>GetPathParts(path)[0]));
				const removedPaths = oldRequestedPaths.Except(...requestedPaths);
				// todo: find correct way of unwatching events; the way below seems to sometimes unwatch while still needed watched
				// for now, we just never unwatch
				//unWatchEvents(store.firebase, DispatchDBAction, getEventsFromInput(removedPaths));
				//store.firestore.unsetListeners(removedPaths.map(path=>GetPathParts(path)[0]));
				const removedPaths_toDocs = removedPaths.map(path=>GetPathParts(path)[0]);
				const removedPaths_toDocs_asListenerPaths = removedPaths_toDocs.map(path=>PathToListenerPath(path));
				//store.firestore.unsetListeners(removedPaths_toDocs_asListenerPaths);
				unsetListeners(firebase.firebase_ || firebase, DispatchDBAction, removedPaths_toDocs_asListenerPaths);

				const addedPaths = requestedPaths.Except(...oldRequestedPaths);
				const addedPaths_toDocs = addedPaths.map(path=>GetPathParts(path)[0]);
				const addedPaths_toDocs_asListenerPaths = addedPaths_toDocs.map(path=>PathToListenerPath(path));
				//watchEvents(store.firebase, DispatchDBAction, getEventsFromInput(addedPaths.map(path=>GetPathParts(path)[0])));
				// for debugging, you can check currently-watched-paths using: store.firestore._.listeners
				//store.firestore.setListeners(addedPaths_toDocs_asListenerPaths);
				setListeners(firebase.firebase_ || firebase, DispatchDBAction, addedPaths_toDocs_asListenerPaths);
				Log(`Requesting paths: ${addedPaths.join(",")}`);
			});
			s.lastRequestedPaths = requestedPaths;
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

	if (mapStateToProps_inner) {
		//return connect(mapStateToProps_wrapper, null, null, {withRef: true}); // {withRef: true} lets you do wrapperComp.getWrappedInstance()
		return connect(mapStateToProps_wrapper, null, null, {forwardRef: true}); // {fowardRef: true} will make-so the "ref" callback will return the wrapped-comp rather than the Connect wrapper-comp
	}
	return connect(()=>{
		mapStateToProps_inner = mapStateToProps_inner_getter();
		return mapStateToProps_wrapper;
	//}, null, null, {withRef: true});
	}, null, null, {forwardRef: true});
}

export const pathListenerCounts = {};
export function SetListeners(paths: string[]) {
	for (const path of paths) {
		const oldListenerCount = pathListenerCounts[path] || 0;
		pathListenerCounts[path] = oldListenerCount + 1;
		if (oldListenerCount > 0) continue;

		// for debugging, you can check currently-watched-paths using: store.firestore._.listeners
		const listenerPath = PathToListenerPath(path);
		manager.store.firestore.setListener(listenerPath);
	}
}
export function UnsetListeners(paths: string[]) {
	for (const path of paths) {
		const listenerPath = PathToListenerPath(path);
		pathListenerCounts[path]--;
		if (pathListenerCounts[path] == 0) {
			manager.store.firestore.unsetListener(listenerPath);
		}
	}
}

const actionTypeBufferInfos = {
	"@@reactReduxFirebase/START": {time: 300},
	"@@reactReduxFirebase/SET": {time: 300},
	/*"@@reduxFirestore/SET_LISTENER": {time: 300},
	"@@reduxFirestore/LISTENER_RESPONSE": {time: 300},
	"@@reduxFirestore/UNSET_LISTENER": {time: 300},*/
};
const actionTypeLastDispatchTimes = {};
const actionTypeBufferedActions = {};

function DispatchDBAction(action) {
	const timeSinceLastDispatch = Date.now() - (actionTypeLastDispatchTimes[action.type] || 0);
	const bufferInfo = actionTypeBufferInfos[action.type];

	// if we're not supposed to buffer this action type, or it's been long enough since last dispatch of this type
	if (bufferInfo == null || timeSinceLastDispatch >= bufferInfo.time) {
		// dispatch action right away
		manager.store.dispatch(action);
		actionTypeLastDispatchTimes[action.type] = Date.now();
	}
	// else, buffer action to be dispatched later
	else {
		// if timer not started, start it now
		if (actionTypeBufferedActions[action.type] == null) {
			setTimeout(()=>{
				// now that wait is over, apply any buffered event-triggers
				manager.store.dispatch(new ActionSet(actionTypeBufferedActions[action.type]));

				actionTypeLastDispatchTimes[action.type] = Date.now();
				actionTypeBufferedActions[action.type] = null;
			}, (actionTypeLastDispatchTimes[action.type] + bufferInfo.time) - Date.now());
		}

		// add action to buffer, to be run when timer ends
		actionTypeBufferedActions[action.type] = (actionTypeBufferedActions[action.type] || []).concat(action);
	}
}

let requestedPaths = {} as {[key: string]: boolean};
/** This only adds paths to a "request list". Connect() is in charge of making the actual db requests. */
export function RequestPath(path: string) {
	//MaybeLog(a => a.dbRequests, () => `${_.padEnd(`Requesting db-path (stage 1): ${path}`, 150)}Component:${g.inConnectFuncFor ? g.inConnectFuncFor.name : ''}`);
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
export function OnAccessPath(path: string) {
	// Log("Accessing-path Stage1: " + path);
	// let path = pathSegments.join("/");
	accessedStorePaths[path] = true;
	if (activeStoreAccessCollectors) {
		for (const collector of activeStoreAccessCollectors) {
			collector.storePathsRequested.push(path);
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