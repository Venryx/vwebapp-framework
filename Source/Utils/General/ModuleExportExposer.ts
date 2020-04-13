import {Assert, IsString} from "js-vextensions";
import {ParseModuleData, Require, GetModuleNameFromPath} from "webpack-runtime-require";

export function ExposeModuleExports(addFromVendorDLL = false) {
	ParseModuleData(true);
	G({R: Require});
	const RR = function() { return RR; };
	RR.all = {}; // holds same values as on RR, except in an object (so you can log RR.all and easily observe the data)

	const moduleEntries = (Require as any).Pairs();

	// add modules from dll-bundle as well
	if (addFromVendorDLL) {
		Assert(Require["dll_reference vendor"] != null, "Could not find webpack-data for vendor chunk.");
		for (const dllEntry of Require["dll_reference vendor"].c.Pairs()) {
			const moduleName = GetModuleNameFromPath(dllEntry.key);
			Require[moduleName] = dllEntry.value.exports;
			moduleEntries.push({key: moduleName, value: dllEntry.value.exports});
		}
	}

	for (const {key: moduleName, value: moduleExports} of moduleEntries) {
		//if (moduleExports == null) continue;
		if (moduleExports == null || (IsString(moduleExports) && moduleExports == "[failed to retrieve module exports]")) continue;

		function StoreValue(baseKey: string, value: any) {
			// check for invalid keys
			if (baseKey == "length") return; // needed fsr
			if (baseKey.match(/^[0-9]+$/)) return;

			let finalKey = baseKey;
			while (finalKey in RR) {
				if (RR[finalKey] === value) break; // if key already holds this value, break (thus doing a noop/reassignment)
				finalKey += "_";
			}
			RR[finalKey] = value;
			RR.all[finalKey] = value;
		}

		for (const {key, value} of moduleExports.Pairs()) {
			StoreValue(key, value);
		}
		//let defaultExport = moduleExports.default || moduleExports;
		if (moduleExports.default) {
			StoreValue(moduleName, moduleExports.default);
		}
	}
	G({RR});
	return RR;
}