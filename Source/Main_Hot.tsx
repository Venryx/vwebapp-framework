import "js-vextensions";
import {ParseModuleData, Require, GetModuleNameFromPath} from "webpack-runtime-require";
import React from "react/lib/ReactWithAddons";

export function SetUpRR() {
	setTimeout(()=> {
		ParseModuleData(true);
		G({R: Require});
		let RR = {};

		let moduleEntries = (Require as any).Props();
		// add modules from dll-bundle as well
		for (let dllEntry of Require["dll_reference vendor"].c.Props()) {
			let moduleName = GetModuleNameFromPath(dllEntry.name);
			Require[moduleName] = dllEntry.value.exports;
			moduleEntries.push({name: moduleName, value: dllEntry.value.exports});
		}
		
		for (let {name: moduleName, value: moduleExports} of moduleEntries) {
			if (moduleExports == null) continue;
			//if (moduleExports == null || (IsString(moduleExports) && moduleExports == "[failed to retrieve module exports]")) continue;

			for (let key in moduleExports) {
				let finalKey = key;
				while (finalKey in RR) finalKey += `_`;
				RR[finalKey] = moduleExports[key];
			}

			//let defaultExport = moduleExports.default || moduleExports;
			if (moduleExports.default) {
				let finalKey = moduleName;
				while (finalKey in RR) finalKey += `_`;
				RR[finalKey] = moduleExports.default;
			}
		}
		G({RR});
	}, 500); // wait a bit, since otherwise some modules are missed/empty during ParseModuleData it seems
}

// patch React.createElement to do early prop validation
// ==========

let createElement_old = React.createElement;
React.createElement = function(componentClass, props) {
	if (componentClass.ValidateProps) {
		componentClass.ValidateProps(props);
	}
	return createElement_old.apply(this, arguments);
};