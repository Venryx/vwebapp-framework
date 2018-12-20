import "js-vextensions";
import {ParseModuleData, Require, GetModuleNameFromPath} from "webpack-runtime-require";

export function ExposeModuleExports(addFromVendorDLL = false) {
	ParseModuleData(true);
	G({R: Require});
	let RR = {};

	let moduleEntries = (Require as any).Props();
	
	// add modules from dll-bundle as well
	if (addFromVendorDLL) {
		Assert(Require["dll_reference vendor"] != null, "Could not find webpack-data for vendor chunk.");
		for (let dllEntry of Require["dll_reference vendor"].c.Props()) {
			let moduleName = GetModuleNameFromPath(dllEntry.name);
			Require[moduleName] = dllEntry.value.exports;
			moduleEntries.push({name: moduleName, value: dllEntry.value.exports});
		}
	}
	
	for (let {name: moduleName, value: moduleExports} of moduleEntries) {
		//if (moduleExports == null) continue;
		if (moduleExports == null || (IsString(moduleExports) && moduleExports == "[failed to retrieve module exports]")) continue;

		for (let {key, value} of moduleExports.Pairs()) {
			let finalKey = key;
			while (finalKey in RR) {
				if (RR[finalKey] === value) break; // if key already holds this value, break (thus doing a noop/reassignment)
				finalKey += `_`;
			}
			RR[finalKey] = value;
		}

		//let defaultExport = moduleExports.default || moduleExports;
		if (moduleExports.default) {
			let finalKey = moduleName;
			while (finalKey in RR) finalKey += `_`;
			RR[finalKey] = moduleExports.default;
		}
	}
	G({RR});
}