import {Action} from "../General/Action";
import { LoadURL, GetSyncLoadActionsForURL, GetCurrentURL_SimplifiedForPageViewTracking } from "../URL/URLs";
import {DBPath, GetData, GetDataAsync, ProcessDBData, ListenerPathToPath} from "../Database/DatabaseHelpers";
import {GetCurrentURL} from "../URL/URLs";
import Raven from "raven-js";
import {LOCATION_CHANGED} from "redux-little-router";
import {VURL} from "js-vextensions";
import { SplitStringBySlash_Cached } from "../Database/StringSplitCache";
import { RootState, manager } from "../../Manager";
import ReactGA from "react-ga";
import { State } from "./StoreHelpers";
import { MaybeLog } from "../General/Logging";

// use this to intercept dispatches (for debugging)
/*let oldDispatch = store.dispatch;
store.dispatch = function(...args) {
	if (GetTimeSinceLoad() > 5)
		debugger;
	oldDispatch.apply(this, args);
};*/

let lastPath = "";
//export function ProcessAction(action: Action<any>, newState: RootState, oldState: RootState) {
// only use this if you actually need to change the action-data before it gets dispatched/applied (otherwise use [Mid/Post]DispatchAction)
export function PreDispatchAction(action: Action<any>) {
	if (action.type == "@@reactReduxFirebase/SET") {
		if (action["data"]) {
			action["data"] = ProcessDBData(action["data"], true, true, SplitStringBySlash_Cached(action["path"]).Last());
		} else {
			// don't add the property to the store, if it is just null anyway (this makes it consistent with how firebase returns the whole db-state)
			delete action["data"];
		}
	}

	if (action.type == "@@reduxFirestore/LISTENER_RESPONSE" || action.type == "@@reduxFirestore/DOCUMENT_ADDED" || action.type == "@@reduxFirestore/DOCUMENT_MODIFIED") {
		if (action.payload.data) {
			// "subcollections" prop currently bugged in some cases, so just use new "path" prop when available
			let path = action["meta"].path || ListenerPathToPath(action["meta"]);
			
			action.payload.data = ProcessDBData(action.payload.data, true, true, SplitStringBySlash_Cached(path).Last());
		} /*else {
			// don't add the property to the store, if it is just null anyway (this makes it consistent with how firebase returns the whole db-state)
			delete action.payload.data;
		}*/
	}

	/*if (g.actionStacks || (DEV && !actionStacks_actionTypeIgnorePatterns.Any(a=>action.type.startsWith(a)))) {
		action["stack"] = new Error().stack.split("\n").slice(1); // add stack, so we can inspect in redux-devtools
	}*/
}
/*const actionStacks_actionTypeIgnorePatterns = [
	"@@reactReduxFirebase/", // ignore redux actions
];*/

export function MidDispatchAction(action: Action<any>, newState: RootState) {
}

export function DoesURLChangeCountAsPageChange(oldURL: VURL, newURL: VURL, directURLChange: boolean) {
	if (oldURL == null) return true;
	if (oldURL.PathStr() != newURL.PathStr()) return true;

	/*let oldSyncLoadActions = GetSyncLoadActionsForURL(oldURL, directURLChange);
	let oldMapViewMergeAction = oldSyncLoadActions.find(a=>a.Is(ACTMapViewMerge));
	
	let newSyncLoadActions = GetSyncLoadActionsForURL(newURL, directURLChange);
	let newMapViewMergeAction = newSyncLoadActions.find(a=>a.Is(ACTMapViewMerge));

	let oldViewStr = oldURL.GetQueryVar("view");
	let oldURLWasTemp = oldViewStr == "";
	if (newMapViewMergeAction != oldMapViewMergeAction && !oldURLWasTemp) {
		//let oldFocused = GetFocusedNodePath(GetMapView(mapViewMergeAction.payload.mapID));
		let oldFocused = oldMapViewMergeAction ? GetFocusedNodePath(oldMapViewMergeAction.payload.mapView) : null;
		let newFocused = newMapViewMergeAction ? GetFocusedNodePath(newMapViewMergeAction.payload.mapView) : null;
		if (newFocused != oldFocused) return true;
	}
	return false;*/
}
export function RecordPageView(url: VURL) {
	//let url = window.location.pathname;
	if (ReactGA["initialized"]) {
		ReactGA.set({page: url.toString({domain: false})});
		ReactGA.pageview(url.toString({domain: false}) || "/");
	}
	MaybeLog(a=>a.pageViews, ()=>"Page-view: " + url);
}

let postInitCalled = false;
let pageViewTracker_lastURL: VURL;
export async function PostDispatchAction(action: Action<any>) {
	if (!postInitCalled) {
		PostInit();
		postInitCalled = true;
	}

	let url = GetCurrentURL();
	//let oldURL = URL.Current();
	//let url = VURL.FromState(action.payload);
	let simpleURL = GetCurrentURL_SimplifiedForPageViewTracking();
	if (DoesURLChangeCountAsPageChange(pageViewTracker_lastURL, simpleURL, true)) {
		pageViewTracker_lastURL = simpleURL;
		RecordPageView(simpleURL);
	}

	//if (action.type == "@@INIT") {
	//if (action.type == "persist/REHYDRATE" && GetPath().startsWith("global/map"))
	if (action.type == "persist/REHYDRATE") {
		manager.store.dispatch({type: "PostRehydrate"}); // todo: ms this also gets triggered when there is no saved-state (ie, first load)
	}
	if (action.type == "PostRehydrate") {
		if (!manager.HasHotReloaded()) {
			LoadURL(manager.startURL.toString());
		}
		//UpdateURL(false);
		if (manager.prodEnv && State("main", "analyticsEnabled")) {
			Log("Initialized Google Analytics.");
			//ReactGA.initialize("UA-21256330-34", {debug: true});
			ReactGA.initialize("UA-21256330-34");
			ReactGA["initialized"] = true;

			/*let url = VURL.FromState(State().router).toString(false);
			ReactGA.set({page: url});
			ReactGA.pageview(url || "/");*/
		}
	}
	// is triggered by back/forward navigation, as well things that call store.dispatch([push/replace]()) -- such as UpdateURL()
	if (action.type == LOCATION_CHANGED) {
		/*if (g.justChangedURLFromCode) {
			g.justChangedURLFromCode = false;
		} else {*/
		if (!(action as any).payload.byCode) {
			//setTimeout(()=>UpdateURL());
			await LoadURL(url.toString());
			//UpdateURL(false);
		}
	}

	/*let movingToGlobals = false;
	if (action.type == LOCATION_CHANGED) {
		if (!lastPath.startsWith("/global") && action.payload.pathname.startsWith("/global"))
			movingToGlobals = true;
		lastPath = action.payload.pathname;
	}
	if (movingToGlobals || action.IsAny(ACTMapNodeSelect, ACTMapNodePanelOpen, ACTMapNodeExpandedSet, ACTViewCenterChange)) {
		setTimeout(()=>UpdateURL_Globals());
	}*/
	/*let pushURL_actions = [
		ACTSetPage, ACTSetSubpage, // general
		ACTTermSelect, ACTImageSelect, // content
		//ACTDebateMapSelect, // debates
		ACTDebateMapSelect_WithData, // debates
	];
	let replaceURL_actions = [
		ACTMapNodeSelect, ACTMapNodePanelOpen, ACTMapNodeExpandedSet, ACTViewCenterChange, // global
	];
	let isPushURLAction = action.IsAny(...pushURL_actions);
	let isReplaceURLAction = action.IsAny(...replaceURL_actions);
	if (isPushURLAction || isReplaceURLAction) {
		UpdateURL(isPushURLAction && !action["fromURL"]);
	}*/

	if (action.type == "@@reactReduxFirebase/LOGIN") {
		let userID = action["auth"].uid;
		let joinDate = await GetDataAsync("userExtras", userID, ".joinDate");
		if (joinDate == null) {
			/*let firebase = store.firebase.helpers;
			firebase.DBRef(`userExtras/${userID}`).update({
				permissionGroups: {basic: true, verified: true, mod: false, admin: false},
				joinDate: Date.now(),
			});*/
			manager.firestoreDB.doc(DBPath(`userExtras/${userID}`)).set({
				permissionGroups: {basic: true, verified: true, mod: false, admin: false},
				joinDate: Date.now(),
			}, {merge: true});
		}

		//Raven.setUserContext(action["auth"].Including("uid", "displayName", "email"));
	} /*else if (action.type == "@@reactReduxFirebase/LOGOUT") {
		Raven.setUserContext();
	}*/

	/*if (action.type == "@@reactReduxFirebase/SET" && action["data"] == null) {
		// remove the property from the store, if it is just null anyway (this makes it consistent with how firebase returns the whole db-state)
	}*/

	/*if (action.Is(ACTViewCenterChange) || action.Is(ACTMapNodeSelect)) {
		let simpleURL = GetSimpleURLForCurrentMapView();
		RecordPageView(simpleURL);
	}*/
}
function PostInit() {
	let lastAuth;
	//Log("Subscribed");
	manager.store.subscribe(()=> {
		let auth = manager.GetAuth();
		if (manager.IsAuthValid(auth) && auth != lastAuth) {
			//Log("Setting user-context: " + auth);
			//Raven.setUserContext(auth);
			Raven.setUserContext(auth.Including("uid", "displayName", "email", "photoURL"));
			lastAuth = auth;
		}
	});
}