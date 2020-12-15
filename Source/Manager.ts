import {VURL, Assert} from "js-vextensions";
import {browserHistory} from "./Utils/URL/History";
import {LogOptions} from "./Utils/General/Logging";
import {ActionFunc} from "./Utils/Store/MobX";
import {RootStore} from "./UserTypes";
import {Page} from "./Utils/URL/URLs";

export class Manager {
	/*onPopulated = new Promise((resolve, reject)=>this.onPopulated_resolve = resolve);
	onPopulated_resolve: Function;*/
	//Populate(data: Omit<Manager, "onPopulated" | "onPopulated_resolve" | "Populate">) {
	Populate(data: Omit<Manager, "Populate" | "store" | "rootState" | "firestoreDB">) {
		this.Extend(data);
		//G({Log: Log}); // set globals
		//this.onPopulated_resolve();
		OnPopulated_listeners.forEach(a=>a());
	}
	// shortcuts
	get store() { return this.GetStore(); }
	get firestoreDB() { return this.store.firebase.firestore(); }

	// styling and such
	// ==========

	colors: {navBarBoxShadow: string};
	zIndexes: {subNavBar: number};
	iconInfo: {[key: string]: any};
	useExpandedNavBar: ()=>boolean;

	// core flags and such
	// ==========

	db_short: string;
	devEnv: boolean;
	prodEnv: boolean;
	dbVersion: number;
	HasHotReloaded: ()=>boolean;
	logTypes: any;
	/** Changes path-watch-manager to be compatible with mobx. (removes optimizations!) */
	mobxCompatMode: boolean;
	PostHandleError: (error: Error, errorStr: string)=>any;

	// urls
	// ==========

	startURL: VURL;
	pageTree: Page;
	GetLoadActionFuncForURL: (url: VURL)=>ActionFunc<any>;
	GetNewURL: ()=>VURL;
	DoesURLChangeCountAsPageChange: (oldURL: VURL, newURL: VURL)=>boolean;
	// new
	GetNewURLForStoreChanges: (actionFunc: ActionFunc<RootStore>)=>string;

	// store+db
	// ==========

	GetStore: ()=>any;
	GetAuth: ()=>any;
	GetUserID: ()=>string;
	// If provided, Command.ts will apply each Command's db-updates to a local copy of the db-data, then send this modified data to the ValidateDBData function (for assertions). Should probably disable in production.
	ValidateDBData?: (newData: Object)=>void;

	// others
	// ==========

	globalConnectorPropGetters: {[key: string]: (state: any, props: any)=>any};

	// YoutubePlayer
	GetYoutubePlayerPoolContainer?: ()=>HTMLElement;
	GetYoutubePlayersToKeepBuffered?: ()=>number;
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