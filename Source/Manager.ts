import { Log } from "./Utils/General/Logging";
import { VURL } from "js-vextensions";
import { routerForBrowser } from "redux-little-router";
import { routerReducer } from "./Utils/Store/CreateStore";

export type RootState = any; // temp

export type Omit<T, K extends keyof T> = Pick<T, ({ [P in keyof T]: P } & { [P in K]: never })[keyof T]>;
export class Manager {
	GetExtraReducers() {
		return {
			router: routerReducer,
		};
	}

	/*onPopulated = new Promise((resolve, reject)=>this.onPopulated_resolve = resolve);
	onPopulated_resolve: Function;*/
	//Populate(data: Omit<Manager, "onPopulated" | "onPopulated_resolve" | "Populate">) {
	Populate(data: Omit<Manager, "Populate" | "GetExtraReducers">) {
		this.Extend(data);

		// set globals
		G({Log});

		//this.onPopulated_resolve();
		OnPopulated_listeners.forEach(a=>a());
	}

	env_short: string;
	devEnv: boolean;
	prodEnv: boolean;
	dbVersion: number;
	HasHotReloaded: ()=>boolean;
	logTypes: any;

	startURL: VURL;
	rootPages: string[];
	rootPageDefaultChilds: any;

	GetSyncLoadActionsForURL: (url: VURL, directURLChange: boolean)=>any[];
	GetNewURL: ()=>VURL;

	store: any;
	firebaseConfig: any;
	firestoreDB: any;
	MakeRootReducer: ()=>((state, action)=>any);

	globalConnectorPropGetters: {[key: string]: (state: any, props: any)=>any};

	PostHandleError: (error: Error, errorStr: string)=>any;
	
	GetAuth: ()=>any;
	IsAuthValid: (auth)=>boolean;
}
export const manager = new Manager();

export let OnPopulated_listeners = [];
export function OnPopulated(listener: ()=>any) { OnPopulated_listeners.push(listener); }

// globals
declare global {
	function Log(message, appendStackTrace?: boolean, logLater?: boolean);
}