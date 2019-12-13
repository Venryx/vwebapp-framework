/*
The interfaces below should be extended by the user project.

Example:
==========
import MyRootStore from "some/path/to/project/type";

declare module 'vwebapp-framework/Source/UserTypes' {
	interface RootStore extends MyRootStore {}
}
==========

This enables you to get typing within Link.actionFunc, etc. without having to pass type-data in each call.

Note: If npm linking this module, it's recommended to add this to your tsconfig.json:
==========
"*": [
	// prefer "/node_modules/X" over "/node_modules/[something]/node_modules/X"
	// (for when using npm link; fixes auto-importer sometimes using SomeLib/node_modules/TargetLib)
	"../node_modules/*",
	"*"
],
==========
*/

export interface RootStore {}
//export interface DBShape {}
/*export class LogTypes {
	dbRequests = false;
	dbRequests_onlyFirst = false;
	pageViews = false;
	urlLoads = false;
	cacheUpdates = false;
	commands = false;
}*/
export interface LogTypes {
	dbRequests: boolean;
	dbRequests_onlyFirst: boolean;
	pageViews: boolean;
	urlLoads: boolean;
	cacheUpdates: boolean;
	commands: boolean;
}