"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("js-vextensions");
var webpack_runtime_require_1 = require("webpack-runtime-require");
var ReactWithAddons_1 = require("react/lib/ReactWithAddons");
function SetUpRR(addFromVendorDLL) {
    if (addFromVendorDLL === void 0) { addFromVendorDLL = true; }
    setTimeout(function () {
        webpack_runtime_require_1.ParseModuleData(true);
        G({ R: webpack_runtime_require_1.Require });
        var RR = {};
        var moduleEntries = webpack_runtime_require_1.Require.Props();
        // add modules from dll-bundle as well
        if (addFromVendorDLL) {
            for (var _i = 0, _a = webpack_runtime_require_1.Require["dll_reference vendor"].c.Props(); _i < _a.length; _i++) {
                var dllEntry = _a[_i];
                var moduleName = webpack_runtime_require_1.GetModuleNameFromPath(dllEntry.name);
                webpack_runtime_require_1.Require[moduleName] = dllEntry.value.exports;
                moduleEntries.push({ name: moduleName, value: dllEntry.value.exports });
            }
        }
        for (var _b = 0, moduleEntries_1 = moduleEntries; _b < moduleEntries_1.length; _b++) {
            var _c = moduleEntries_1[_b], moduleName = _c.name, moduleExports = _c.value;
            //if (moduleExports == null) continue;
            if (moduleExports == null || (IsString(moduleExports) && moduleExports == "[failed to retrieve module exports]"))
                continue;
            for (var key in moduleExports) {
                var finalKey = key;
                while (finalKey in RR)
                    finalKey += "_";
                RR[finalKey] = moduleExports[key];
            }
            //let defaultExport = moduleExports.default || moduleExports;
            if (moduleExports.default) {
                var finalKey = moduleName;
                while (finalKey in RR)
                    finalKey += "_";
                RR[finalKey] = moduleExports.default;
            }
        }
        G({ RR: RR });
    }, 500); // wait a bit, since otherwise some modules are missed/empty during ParseModuleData it seems
}
exports.SetUpRR = SetUpRR;
// patch React.createElement to do early prop validation
// ==========
var createElement_old = ReactWithAddons_1.default.createElement;
ReactWithAddons_1.default.createElement = function (componentClass, props) {
    if (componentClass.ValidateProps) {
        componentClass.ValidateProps(props);
    }
    return createElement_old.apply(this, arguments);
};
//# sourceMappingURL=Main_Hot.js.map