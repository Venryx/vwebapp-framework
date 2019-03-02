// grab the hidden "exports" argument that is sent to the webpack module-wrapper function; thus we gain access to the exports object, letting us modify it
// declare var exports;

// import own exports; thus we gain access to the exports object, letting us modify it
import * as frameworkExportsObject from ".";

export * from "./ExportOverwriteEnabler";

export * from "./Manager";

export * from "./Server/Command";
export * from "./Server/CommandMacros";
export * from "./Server/Server";

export * from "./Utils/Audio/TextToSpeech";

export * from "./Utils/Database/DatabaseHelpers";
export * from "./Utils/Database/FirebaseConnect";
//export * from "./Utils/Database/QuickJoin";
export * from "./Utils/Database/StringSplitCache";

export * from "./Utils/General/Action";
export * from "./Utils/General/Errors";
export * from "./Utils/General/General";
export * from "./Utils/General/Geometry";
export * from "./Utils/General/Logging";
export * from "./Utils/General/ModuleExportExposer";
export * from "./Utils/General/Others";
export * from "./Utils/General/RegexHelpers";

export * from "./Utils/ReactComponents/DraggableLabel";
export * from "./Utils/ReactComponents/Icon";
export * from "./Utils/ReactComponents/InfoButton";
export * from "./Utils/ReactComponents/Link";
export * from "./Utils/ReactComponents/Route";
export * from "./Utils/ReactComponents/Slider";
export * from "./Utils/ReactComponents/Tooltip";
export * from "./Utils/ReactComponents/TreeView";
export * from "./Utils/ReactComponents/VDateTime";
export * from "./Utils/ReactComponents/VReactMarkdown_Remarkable";
export * from "./Utils/ReactComponents/VReactMarkdown";

export * from "./Utils/Store/ActionProcessor";
export * from "./Utils/Store/CreateStore";
export * from "./Utils/Store/ReducerUtils";
export * from "./Utils/Store/StateOverrides";
export * from "./Utils/Store/StoreHelpers";

export * from "./Utils/UI/General";
export * from "./Utils/UI/GlobalStyles";

export * from "./Utils/URL/History";
export * from "./Utils/URL/URLs";

// override system
// ==========

/*export const VWAF_exports_orig = E(frameworkExportsInterface);
export const VWAF_exports_final = frameworkExportsInterface;
export function VWAF_OverrideExport(newValue_withNameProp: any);
export function VWAF_OverrideExport(exportName: string, newValue: any);
export function VWAF_OverrideExport(...args) {
	let exportName: string, newValue: any; 
	if (args.length == 1) [exportName, newValue] = [args[0].name, args[0]];
	else [exportName, newValue] = args;
	VWAF_exports_final[exportName] = newValue;
}*/

export const VWAF_exports_orig = E(frameworkExportsObject);
export const VWAF_exports_final = frameworkExportsObject;
export function VWAF_OverrideExport(newValue_withNameProp: any);
export function VWAF_OverrideExport(exportName: string, newValue: any);
export function VWAF_OverrideExport(...args) {
	let exportName: string, newValue: any; 
	if (args.length == 1) [exportName, newValue] = [args[0].name, args[0]];
	else [exportName, newValue] = args;
	delete VWAF_exports_final[exportName]; // delete getter-setter
	VWAF_exports_final[exportName] = newValue;
}