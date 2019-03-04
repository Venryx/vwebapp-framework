import {LOCATION_CHANGE} from "connected-react-router";
import {DeepGet, VURL} from "js-vextensions";
import {manager, RootState_Base} from "../../Manager";
import {DBPath, GetDataAsync, ListenerPathToPath, ProcessDBData} from "../Database/DatabaseHelpers";
import {SplitStringBySlash_Cached} from "../Database/StringSplitCache";
import {Action} from "../General/Action";
import {MaybeLog_Base} from "../General/Logging";
import {GetCurrentURL, LoadURL} from "../URL/URLs";
import {ActionSet} from "./StoreHelpers";

// use this to intercept dispatches (for debugging)
/*let oldDispatch = store.dispatch;
store.dispatch = function(...args) {
	if (GetTimeSinceLoad() > 5)
		debugger;
	oldDispatch.apply(this, args);
};*/

export function DoesActionSetFirebaseData(action: Action<any>) {
	return action.type == "@@reactReduxFirebase/SET";
}
export function DoesActionSetFirestoreData(action: Action<any>) {
	// the LISTENER_RESPONSE action doesn't always actually change the store data (sometimes it stores the same data, meaning it only causes a meaningless status-update: {receiving:false, received:true})
	return action.type == "@@reduxFirestore/LISTENER_RESPONSE" || action.type == "@@reduxFirestore/DOCUMENT_ADDED" || action.type == "@@reduxFirestore/DOCUMENT_MODIFIED";
}
export function GetFirestoreDataSetterActionPath(action: Action<any>) {
	// "subcollections" prop currently bugged in some cases, so just use new "path" prop when available
	return action["meta"].path || ListenerPathToPath(action["meta"]);
}

const actionStacks_actionTypeIgnorePatterns = [
	"@@reactReduxFirebase/", // ignore redux actions
];

// only use this if you actually need to change the action-data before it gets dispatched/applied (otherwise use [Mid/Post]DispatchAction)
export function PreDispatchAction(action: Action<any>) {
	if (window["actionStacks"] || (manager.devEnv && !actionStacks_actionTypeIgnorePatterns.Any(a=>action.type.startsWith(a)))) {
		action["stack"] = new Error().stack.split("\n").slice(1); // add stack, so we can inspect in redux-devtools
	}

	if (DoesActionSetFirebaseData(action)) {
		if (action["data"]) {
			action["data"] = ProcessDBData(action["data"], true, true, SplitStringBySlash_Cached(action["path"]).Last());
		} else {
			// don't add the property to the store, if it is just null anyway (this makes it consistent with how firebase returns the whole db-state)
			delete action["data"];
		}
	}

	if (DoesActionSetFirestoreData(action)) {
		if (action.payload.data) {
			const path = GetFirestoreDataSetterActionPath(action);
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

export function MidDispatchAction(action: Action<any>, newState: RootState_Base) {
}

export async function PostDispatchAction(action: Action<any>) {
	const url = GetCurrentURL();

	//if (action.type == "@@INIT") {
	if (action.type == "persist/REHYDRATE") {
		manager.store.dispatch({type: "PostRehydrate"}); // todo: ms this also gets triggered when there is no saved-state (ie, first load)
	}
	// is triggered by back/forward navigation, as well things that call store.dispatch([push/replace]()) -- such as UpdateURL()
	if (action.type == LOCATION_CHANGE) {
		/*if (g.justChangedURLFromCode) {
			g.justChangedURLFromCode = false;
		} else {*/
		//if (!(action as any).payload.byCode) {
		if (DeepGet(action, "payload/location/state/byCode") != true) {
			LoadURL(url);
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
		const userID = action["auth"].uid;
		const joinDate = await GetDataAsync("userExtras", userID, ".joinDate");
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