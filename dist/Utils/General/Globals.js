"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var moment_1 = require("moment");
G({ Moment: moment_1.default });
//g.Break = function() { debugger; };
G({ Debugger_If: Debugger_If });
function Debugger() { debugger; }
exports.Debugger = Debugger;
G({ Debugger_If: Debugger_If });
function Debugger_True() { debugger; return true; }
exports.Debugger_True = Debugger_True;
G({ Debugger_If: Debugger_If });
function Debugger_If(condition) {
    if (condition)
        debugger;
}
exports.Debugger_If = Debugger_If;
//# sourceMappingURL=Globals.js.map