import firebase_ from "firebase";
import { connect } from "react-redux";
import { ShallowChanged } from "react-vextensions";
import { setListeners, unsetListeners } from "redux-firestore/es/actions/firestore";
import { GetPathParts, PathToListenerPath } from "./DatabaseHelpers";
import { State_Base, ActionSet } from "../Store/StoreHelpers";
import { SplitStringBySlash_Cached } from "./StringSplitCache";
import { manager, RootState_Base } from "../../Manager";

let firebase = firebase_ as any;

// todo: rename to FirestoreConnect

// Place a selector in Connect() whenever it uses data that:
// 1) might change during the component's lifetime, and:
// 2) is not already used by an existing selector in Connect()
// This way, it'll correctly trigger a re-render when the underlying data changes.

export let inConnectFunc = false;

G({FirebaseConnect: Connect}); // make global, for firebase-forum
// if you're sending in a connect-func rather than a connect-func-wrapper, then you need to make it have at least one argument (to mark it as such)
export function Connect<T, P>(innerMapStateToPropsFunc: (state: RootState_Base, props: P)=>any);
export function Connect<T, P>(mapStateToProps_inner_getter: ()=>(state: RootState_Base, props: P)=>any);
export function Connect<T, P>(funcOrFuncGetter) {
	let mapStateToProps_inner: (state: RootState_Base, props: P)=>any, mapStateToProps_inner_getter: ()=>(state: RootState_Base, props: P)=>any;
	let isFuncGetter = funcOrFuncGetter.length == 0; //&& typeof TryCall(funcOrFuncGetter) == "function";
	if (!isFuncGetter) mapStateToProps_inner = funcOrFuncGetter;
	else mapStateToProps_inner_getter = funcOrFuncGetter;

	let mapStateToProps_wrapper = function(state: RootState_Base, props: P) {
		let s = this;
		inConnectFunc = true;
		
		ClearRequestedPaths();
		ClearAccessedPaths();
		//Assert(GetAccessedPaths().length == 0, "Accessed-path must be empty at start of mapStateToProps call (ie. the code in Connect()).");

		let changedPath = null;

		let storeDataChanged = false;
		if (s.lastAccessedStorePaths_withData == null) {
			storeDataChanged = true;
		} else {
			for (let path in s.lastAccessedStorePaths_withData) {
				if (State_Base({countAsAccess: false}, ...SplitStringBySlash_Cached(path)) !== s.lastAccessedStorePaths_withData[path]) {
					//store.dispatch({type: "Data changed!" + path});
					storeDataChanged = true;
					changedPath = path;
					break;
				}
			}
		}
		//let propsChanged = ShallowChanged(props, s.lastProps || {});
		let propsChanged = ShallowChanged(props, s.lastProps || {}, "children");

		//let result = storeDataChanged ? mapStateToProps_inner(state, props) : s.lastResult;
		if (!storeDataChanged && !propsChanged) {
			inConnectFunc = false;
			return s.lastResult;
		}
		//let result = mapStateToProps_inner.call(s, state, props);
		// for debugging in profiler
		//let debugText = ToJSON(props).replace(/[^a-zA-Z0-9]/g, "_");
		let debugText = (props["node"] ? " @ID:" + props["node"]._id : "") + " @changedPath: " + changedPath;
		let wrapperFunc = eval(`(function ${debugText.replace(/[^a-zA-Z0-9]/g, "_")}() { return mapStateToProps_inner.apply(s, arguments); })`);
		let result = wrapperFunc.call(s, state, props);

		manager.globalConnectorPropGetters.Pairs().forEach(({key, value: getter})=> {
			result[key] = getter.call(s, state, props);
		});

		let oldRequestedPaths: string[] = s.lastRequestedPaths || [];
		let requestedPaths = GetRequestedPaths();
		//if (firebase._ && ShallowChanged(requestedPaths, oldRequestedPaths)) {
		if (ShallowChanged(requestedPaths, oldRequestedPaths)) {
			window["setImmediate"](()=> {
				//s.lastEvents = getEventsFromInput(requestedPaths.map(path=>GetPathParts(path)[0]));
				let removedPaths = oldRequestedPaths.Except(...requestedPaths);
				// todo: find correct way of unwatching events; the way below seems to sometimes unwatch while still needed watched
				// for now, we just never unwatch
				//unWatchEvents(store.firebase, DispatchDBAction, getEventsFromInput(removedPaths));
				//store.firestore.unsetListeners(removedPaths.map(path=>GetPathParts(path)[0]));
				let removedPaths_toDocs = removedPaths.map(path=>GetPathParts(path)[0]);
				let removedPaths_toDocs_asListenerPaths = removedPaths_toDocs.map(path=>PathToListenerPath(path));
				//store.firestore.unsetListeners(removedPaths_toDocs_asListenerPaths);
				unsetListeners(firebase.firebase_ || firebase, DispatchDBAction, removedPaths_toDocs_asListenerPaths);
				
				let addedPaths = requestedPaths.Except(...oldRequestedPaths);
				let addedPaths_toDocs = addedPaths.map(path=>GetPathParts(path)[0]);
				let addedPaths_toDocs_asListenerPaths = addedPaths_toDocs.map(path=>PathToListenerPath(path));
				//watchEvents(store.firebase, DispatchDBAction, getEventsFromInput(addedPaths.map(path=>GetPathParts(path)[0])));
				// for debugging, you can check currently-watched-paths using: store.firestore._.listeners
				//store.firestore.setListeners(addedPaths_toDocs_asListenerPaths);
				setListeners(firebase.firebase_ || firebase, DispatchDBAction, addedPaths_toDocs_asListenerPaths);
				Log("Requesting paths: " + addedPaths.join(","));
			});
			s.lastRequestedPaths = requestedPaths;
		}

		let accessedStorePaths: string[] = GetAccessedPaths();
		//ClearAccessedPaths();
		s.lastAccessedStorePaths_withData = {};
		for (let path of accessedStorePaths) {
			s.lastAccessedStorePaths_withData[path] = State_Base({countAsAccess: false}, ...SplitStringBySlash_Cached(path));
		}
		s.lastProps = props;
		s.lastResult = result;

		inConnectFunc = false;

		return result;
	};

	if (mapStateToProps_inner) {
		return connect(mapStateToProps_wrapper); //, null, null, {withRef: true}); // {withRef: true} lets you do wrapperComp.getWrappedInstance() 
	}
	return connect(()=> {
		mapStateToProps_inner = mapStateToProps_inner_getter();
		return mapStateToProps_wrapper;
	}); //, null, null, {withRef: true});
}

export let pathListenerCounts = {};
export function SetListeners(paths: string[]) {
	for (let path of paths) {
		let oldListenerCount = pathListenerCounts[path] || 0;
		pathListenerCounts[path] = oldListenerCount + 1;
		if (oldListenerCount > 0) continue;

		// for debugging, you can check currently-watched-paths using: store.firestore._.listeners
		let listenerPath = PathToListenerPath(path);
		manager.store.firestore.setListener(listenerPath);
	}
}
export function UnsetListeners(paths: string[]) {
	for (let path of paths) {
		let listenerPath = PathToListenerPath(path);
		pathListenerCounts[path]--;
		if (pathListenerCounts[path] == 0) {
			manager.store.firestore.unsetListener(listenerPath);
		}
	}
}

let actionTypeBufferInfos = {
	"@@reactReduxFirebase/START": {time: 300},
	"@@reactReduxFirebase/SET": {time: 300},
	/*"@@reduxFirestore/SET_LISTENER": {time: 300},
	"@@reduxFirestore/LISTENER_RESPONSE": {time: 300},
	"@@reduxFirestore/UNSET_LISTENER": {time: 300},*/
};
let actionTypeLastDispatchTimes = {};
let actionTypeBufferedActions = {};

function DispatchDBAction(action) {
	let timeSinceLastDispatch = Date.now() - (actionTypeLastDispatchTimes[action.type] || 0);
	let bufferInfo = actionTypeBufferInfos[action.type];

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
			setTimeout(()=> {
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
	//Log("Requesting Stage1: " + path);
	requestedPaths[path] = true;
}
/** This only adds paths to a "request list". Connect() is in charge of making the actual db requests. */
export function RequestPaths(paths: string[]) {
	for (let path of paths)
		RequestPath(path);
}
export function ClearRequestedPaths() {
	requestedPaths = {};
}
export function GetRequestedPaths() {
	return requestedPaths.VKeys();
}

let accessedStorePaths = {} as {[key: string]: boolean};
export function OnAccessPath(path: string) {
	//Log("Accessing-path Stage1: " + path);
	//let path = pathSegments.join("/");
	accessedStorePaths[path] = true;
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