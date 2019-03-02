import {VURL} from "js-vextensions";
import {connectRouter} from "connected-react-router";
import {browserHistory} from "./Utils/URL/History";
import {LogOptions} from "./Utils/General/Logging";

export type RootState_Base = any; // temp

export type Omit<T, K extends keyof T> = Pick<T, ({ [P in keyof T]: P } & { [P in K]: never })[keyof T]>;
export class Manager {
	GetExtraReducers() {
		//let { routerReducer } = require("./Utils/Store/CreateStore");
		return {
			//router: routerReducer,
			router: connectRouter(browserHistory),
		};
	}

	/*onPopulated = new Promise((resolve, reject)=>this.onPopulated_resolve = resolve);
	onPopulated_resolve: Function;*/
	//Populate(data: Omit<Manager, "onPopulated" | "onPopulated_resolve" | "Populate">) {
	Populate(data: Omit<Manager, "Populate" | "GetExtraReducers" | "store" | "firestoreDB">) {
		this.Extend(data);

		// set globals
		G({Log: require("./Utils/General/Logging").Log});

		//this.onPopulated_resolve();
		OnPopulated_listeners.forEach(a=>a());
	}
	// shortcuts
	get store() { return this.GetStore(); }
	get firestoreDB() { return this.store.firebase.firestore(); }

	iconInfo: {[key: string]: any};

	env_short: string;
	devEnv: boolean;
	prodEnv: boolean;
	dbVersion: number;
	HasHotReloaded: ()=>boolean;
	logTypes: any;

	startURL: VURL;
	routerLocationPathInStore: string[];
	GetSyncLoadActionsForURL: (url: VURL, directURLChange: boolean)=>any[];
	GetNewURL: ()=>VURL;

	GetStore: ()=>any;
	firebaseConfig: any;
	MakeRootReducer: ()=>((state, action)=>any);

	globalConnectorPropGetters: {[key: string]: (state: any, props: any)=>any};

	PostHandleError: (error: Error, errorStr: string)=>any;

	GetAuth: ()=>any;
	GetUserID: ()=>string;
}
export const manager = new Manager();

export let OnPopulated_listeners = [];
export function OnPopulated(listener: ()=>any) { OnPopulated_listeners.push(listener); }

// globals
declare global {
	//function Log(message, appendStackTrace?: boolean, logLater?: boolean);
	function Log(options: LogOptions, ...messageSegments: any[]);
	function Log(...messageSegments: any[]);
}

// breakpoint: implement deep-function-replacement system