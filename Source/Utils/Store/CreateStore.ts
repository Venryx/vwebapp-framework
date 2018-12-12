import firebase_ from "firebase";
import "firebase/firestore";
import { unstable_batchedUpdates } from "react-dom";
import { reactReduxFirebase } from "react-redux-firebase";
import { applyMiddleware, compose, createStore, StoreEnhancer } from "redux";
import { reduxFirestore } from "redux-firestore";
import { routerForBrowser } from "redux-little-router";
import { MidDispatchAction, PostDispatchAction, PreDispatchAction } from "./ActionProcessor";
import { manager } from "../../Manager";
import {persistStore} from "redux-persist";

let firebase = firebase_ as any;

//export const browserHistory = createBrowserHistory();
//import {browserHistory} from "react-router";

let routes = {
	"/": {},
	"/:seg": {},
	"/:seg/:seg": {},
	"/:seg/:seg/:seg": {},
	"/:seg/:seg/:seg/:seg": {},
	"/:seg/:seg/:seg/:seg/:seg": {},
};
export const {reducer: routerReducer, middleware: routerMiddleware, enhancer: routerEnhancer} = routerForBrowser({
  routes,
});

export function CreateStore(initialState = {}, history) {
	// Middleware Configuration
	// ==========
	const middleware = [
		//thunk.withExtraArgument(getFirebase),
		// for some reason, this breaks stuff if we have it the last one
		/*store=>next=>action=> {
			Log("What!" + action.type);
			PreDispatchAction(action);
			const returnValue = next(action);
			MidDispatchAction(action, returnValue);
			WaitXThenRun(0, ()=>PostDispatchAction(action));
			return returnValue;
		},*/
		//routerMiddleware(browserHistory),
		routerMiddleware,
	];
	let lateMiddleware = [
		// for some reason, this breaks stuff if we have it the last one
		store=>next=>action=> {
			PreDispatchAction(action); if (action.type == "ApplyActionSet") for (let sub of action.actions) PreDispatchAction(sub);
			const returnValue = next(action);
			MidDispatchAction(action, returnValue); if (action.type == "ApplyActionSet") for (let sub of action.actions) MidDispatchAction(sub, returnValue);
			setTimeout(()=> {
				PostDispatchAction(action); if (action.type == "ApplyActionSet") for (let sub of action.actions) PostDispatchAction(sub);
			});
			return returnValue;
		},
	];

	// redux dev-tools config
	// ==========

	let reduxDevToolsConfig = {
		maxAge: 70,
	};

	// Store Instantiation and HMR Setup
	// ==========

	//reduxConfig["userProfile"] = DBPath("users"); // root that user profiles are written to
	let reduxFirebaseConfig = {
		//userProfile: DBPath("users"), // root that user profiles are written to
		userProfile: `versions/v${manager.dbVersion}-${manager.env_short}/users`, // root that user profiles are written to
		enableLogging: true, // enable/disable Firebase Database Logging
		updateProfileOnLogin: false, // enable/disable updating of profile on login
		// profileDecorator: (userData) => ({ email: userData.email }) // customize format of user profile
		useFirestoreForProfile: true,
	};
	if (firebase.apps.length == 0) {
		firebase.initializeApp(manager.firebaseConfig);
	}
	let firestoreDB = firebase.firestore();
	firestoreDB.settings({timestampsInSnapshots: true});

	let extraReducers = {
		router: routerReducer,
	};
	let rootReducer = manager.MakeRootReducer();
	const store = createStore(
		rootReducer,
		initialState,
		// Note: Compose applies functions from right to left: compose(f, g, h) = (...args)=>f(g(h(...args))).
		// You can think of the earlier ones as "wrapping" and being able to "monitor" the ones after it, but (usually) telling them "you apply first, then I will".
		(compose as any)(...[
			//autoRehydrate({log: true}),
			routerEnhancer,
			applyMiddleware(...middleware),
			reactReduxFirebase(firebase, reduxFirebaseConfig),
			reduxFirestore(firebase, {}),
			//batchedSubscribe(unstable_batchedUpdates),
			applyMiddleware(...lateMiddleware), // place late-middleware after reduxFirebase, so it can intercept all its dispatched events
			window["devToolsExtension"] && window["devToolsExtension"](reduxDevToolsConfig),
		].filter(a=>a)) as StoreEnhancer<any>
	); // as ProjectStore;
	store["reducer"] = rootReducer;

	function Dispatch_WithStack(action) {
		if (window["actionStacks"] || (manager.devEnv && !actionStacks_actionTypeIgnorePatterns.Any(a=>action.type.startsWith(a)))) {
			action["stack"] = new Error().stack.split("\n").slice(1); // add stack, so we can inspect in redux-devtools
		}
		return store["dispatch_orig"](action);
	}
	if (store.dispatch != Dispatch_WithStack) {
		store["dispatch_orig"] = store.dispatch;
		store.dispatch = Dispatch_WithStack;
	}
	const actionStacks_actionTypeIgnorePatterns = [
		"@@reactReduxFirebase/", // ignore redux actions
	];

	/*let w = watch(()=>State());
	store.subscribe(w((newVal, oldVal) => {
		ProcessAction(g.lastAction, newVal, oldVal);
	}));*/

	// begin periodically persisting the store
	//let persister = persistStore(store, {whitelist: ["main"]});
	// you want to remove some keys before you save
	//let persister = persistStore(store, null, ()=>g.storeRehydrated = true);
	let persister = persistStore(store);
	if (manager.startURL.GetQueryVar("clearState")) {
		Log("Clearing redux-store's state and local-storage...");
		ClearLocalData(persister);
	}

	return {store, persister};
}

export function ClearLocalData(persister) {
	persister.purge();
	//localStorage.clear();
	for (let key in localStorage) {
		if (key.startsWith("firebase:")) continue; // keep auth-info
		delete localStorage[key];
	}
}