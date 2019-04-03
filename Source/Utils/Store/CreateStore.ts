import {routerMiddleware} from "connected-react-router";
import firebase from "firebase/app";
import "firebase/auth";
import "firebase/firestore";
import {reactReduxFirebase} from "react-redux-firebase";
import {applyMiddleware, compose, createStore, StoreEnhancer} from "redux";
import {reduxFirestore} from "redux-firestore";
import {persistStore} from "redux-persist";
import {manager} from "../../Manager";
import {g} from "../../PrivateExports";
import {browserHistory} from "../URL/History";
import {MidDispatchAction, PostDispatchAction, PreDispatchAction} from "./ActionProcessor";
import {ActionSet} from "./StoreHelpers";

const dispatchInterceptors = [];
export function AddDispatchInterceptor(interceptor: Function) {
	dispatchInterceptors.push(interceptor);
}

export function CreateStore(initialState = {}) {
	// middleware configuration
	// ==========

	const outerMiddleware = [
		//routerMiddleware(browserHistory),
		routerMiddleware(browserHistory),
	];
	const innerMiddleware = [
		store=>next=>action=>{
			const subactions = ActionSet.EnsureActionFlattened(action);
			for (const subaction of subactions) {
				PreDispatchAction(subaction);
				if (manager.PreDispatchAction) manager.PreDispatchAction(subaction);
			}

			const returnValue = next(action);
			for (const subaction of subactions) {
				MidDispatchAction(subaction, returnValue);
				if (manager.PreDispatchAction) manager.MidDispatchAction(subaction, returnValue);
			}

			setTimeout(()=>{
				for (const subaction of subactions) {
					PostDispatchAction(subaction);
					if (manager.PostDispatchAction) manager.PostDispatchAction(subaction);
				}
			});

			return returnValue;
		},
		store=>next=>action=>{
			const actionStacks_actionTypeIgnorePatterns = [
				"@@reactReduxFirebase/", // ignore redux actions
			];
			if (g.actionStacks || (manager.devEnv && !actionStacks_actionTypeIgnorePatterns.Any(a=>action.type.startsWith(a)))) {
				action["stack"] = new Error().stack.split("\n").slice(1); // add stack, so we can inspect in redux-devtools
			}
			for (const interceptor of dispatchInterceptors) {
				const result = interceptor(action);
				if (result == false) return;
			}

			const returnValue = next(action);
			return returnValue;
		},
	];

	// redux dev-tools config
	// ==========

	const reduxDevToolsConfig = {
		maxAge: 70,
		trace: true,
	};

	// store instantiation and HMR setup
	// ==========

	//reduxConfig["userProfile"] = DBPath("users"); // root that user profiles are written to
	const reduxFirebaseConfig = {
		//userProfile: DBPath("users"), // root that user profiles are written to
		userProfile: `versions/v${manager.dbVersion}-${manager.db_short}/users`, // root that user profiles are written to
		enableLogging: true, // enable/disable Firebase Database Logging
		updateProfileOnLogin: false, // enable/disable updating of profile on login
		// profileDecorator: (userData) => ({ email: userData.email }) // customize format of user profile
		useFirestoreForProfile: true,
	};
	if (firebase.apps.length == 0) {
		firebase.initializeApp(manager.firebaseConfig);
	}
	const firestoreDB = firebase.firestore();
	firestoreDB.settings({});

	const rootReducer = manager.MakeRootReducer();
	const store = createStore(
		rootReducer,
		initialState,
		// Note: Compose applies functions from right to left: compose(f, g, h) = (...args)=>f(g(h(...args))).
		// You can think of the earlier ones as "wrapping" and being able to "monitor the results of" the ones after it, but (usually) telling them "you apply first, then I will".
		// So put your middleware earlier in this list if you want it to monitor another middleware's *results*. And put it after if you want it to be able to *intercept* its actions and such.
		(compose as any)(...[
			//autoRehydrate({log: true}),
			//routerEnhancer,
			applyMiddleware(...outerMiddleware),
			reactReduxFirebase(firebase, reduxFirebaseConfig),
			reduxFirestore(firebase, {mergeOrdered: false, mergeOrderedDocUpdate: false, mergeOrderedCollectionUpdates: false}),
			//batchedSubscribe(unstable_batchedUpdates),
			applyMiddleware(...innerMiddleware), // place inner-middleware after reduxFirebase (deeper to func that *actually dispatches*), so it can intercept all its dispatched events
			window["__REDUX_DEVTOOLS_EXTENSION__"] && window["__REDUX_DEVTOOLS_EXTENSION__"](reduxDevToolsConfig),
		].filter(a=>a)) as StoreEnhancer<any>,
	); // as ProjectStore;
	store["reducer"] = rootReducer;

	/*function Dispatch_WithStack(action) {
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
	];*/

	/*let w = watch(()=>State());
	store.subscribe(w((newVal, oldVal) => {
		ProcessAction(g.lastAction, newVal, oldVal);
	}));*/

	// begin periodically persisting the store
	//let persister = persistStore(store, {whitelist: ["main"]});
	// you want to remove some keys before you save
	//let persister = persistStore(store, null, ()=>g.storeRehydrated = true);
	const persister = persistStore(store);
	if (manager.startURL.GetQueryVar("clearState")) {
		Log("Clearing redux-store's state and local-storage...");
		ClearLocalData(persister);
	}

	return {store, persister};
}

export function ClearLocalData(persister) {
	persister.purge();
	//localStorage.clear();
	for (const key in localStorage) {
		if (key.startsWith("firebase:")) continue; // keep auth-info
		delete localStorage[key];
	}
}