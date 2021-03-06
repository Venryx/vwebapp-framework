import {CE, E} from "js-vextensions";

// import own exports; thus we gain access to the exports object, letting us modify it
import * as frameworkExportsObject from ".";

//type __ = typeof import("../node_modules/js-vextensions/Helpers/@ApplyCETypes");
type __ = typeof import("js-vextensions/Helpers/@ApplyCETypes");
import "js-vextensions/Helpers/@ApplyCECode.js"; // eslint-disable-line

export * from "./@EnableExportOverwrites";
// special key, marking this module's exports object, which allows the patch in ExportOverwriteEnabler.ts to make the remaining exports overwriteable
//export const __EnableExportOverwrites__ = true;

export * from "./Manager";
export * from "./UserTypes";

//export * from "./Server/Command";

export * from "./Utils/Audio/AudioNodes";
export * from "./Utils/Audio/SpeechToText";
export * from "./Utils/Audio/TextToSpeech";
export * from "./Utils/Audio/VMediaRecorder";

//export * from "./Utils/Database/DatabaseHelpers";
//export * from "./Utils/Database/QuickJoin";
//export * from "./Utils/Database/SchemaHelpers";
//export * from "./Utils/Database/StringSplitCache";

export * from "./Utils/General/Constants";
export * from "./Utils/General/Errors";
export * from "./Utils/General/General";
export * from "./Utils/General/Geometry";
//export * from "./Utils/General/KeyGenerator";
export * from "./Utils/General/KeyNames";
export * from "./Utils/General/Logging";
export * from "./Utils/General/ModuleExportExposer";
export * from "./Utils/General/Others";
export * from "./Utils/General/RegexHelpers";
export * from "./Utils/General/YoutubePlayer";
//export * from "./Utils/General/ClassExtensions/MobX";

export * from "./Utils/ReactComponents/AddressBarWrapper";
export * from "./Utils/ReactComponents/DraggableLabel";
export * from "./Utils/ReactComponents/ErrorBoundary";
export * from "./Utils/ReactComponents/Icon";
export * from "./Utils/ReactComponents/InfoButton";
export * from "./Utils/ReactComponents/Link";
export * from "./Utils/ReactComponents/PageContainer";
export * from "./Utils/ReactComponents/Slider";
export * from "./Utils/ReactComponents/TextPlus";
export * from "./Utils/ReactComponents/Tooltip";
export * from "./Utils/ReactComponents/TreeView";
export * from "./Utils/ReactComponents/VDateTime";
export * from "./Utils/ReactComponents/VReactMarkdown_Remarkable";
export * from "./Utils/ReactComponents/VReactMarkdown";
export * from "./Utils/ReactComponents/YoutubePlayerUI";

export * from "./Utils/Store/MobX";

export * from "./Utils/UI/DNDHelpers";
export * from "./Utils/UI/General";
export * from "./Utils/UI/NavBar";
export * from "./Utils/UI/ReactHooks";
export * from "./Utils/UI/SubNavBar";

export * from "./Utils/URL/History";
export * from "./Utils/URL/URLs";

//export * from "./__DisableExportOverwrites__";
export const __DisableExportOverwrites__ = true;

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

export const VWAF_exports_orig = E(CE(frameworkExportsObject).Excluding("VWAF_exports_orig", "VWAF_exports_final", "VWAF_OverrideExport"));
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