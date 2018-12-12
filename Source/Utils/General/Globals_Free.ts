// class/function tags
// ==========

/*export function Global(...args) {
	if (!(args[0] instanceof Function)) { // if decorator's being early-called, to provide args
		var [receiveClassFunc] = args;
		return (...args2)=> {
			var [target] = args2;
			receiveClassFunc(target);
			Global(...args2);
		};
	}

	var [target] = args as [Function];

	var name = target.GetName();
	//console.log("Globalizing: " + name);
	g[name] = target;
}*/
export function Global(target: Function) {
	var name = target.GetName();
	//console.log("Globalizing: " + name);
	window[name] = target;
}

export function Grab(grabFunc) {
	return target=>grabFunc(target);
}

/*export function SimpleShouldUpdate(target) {
	target.prototype.shouldComponentUpdate = function(newProps, newState) {
	    return ShallowCompare(this, newProps, newState);
		/*var result = ShallowCompare(this, newProps, newState);
		Log(result + ";" + g.ToJSON(this.props) + ";" + g.ToJSON(newProps));
		return result;*#/
	}
}*/

// polyfills for constants
// ==========

if (Number.MIN_SAFE_INTEGER == null)
	(Number as any).MIN_SAFE_INTEGER = -9007199254740991;
if (Number.MAX_SAFE_INTEGER == null)
	(Number as any).MAX_SAFE_INTEGER = 9007199254740991;

//function Break() { debugger; };
export function Debugger(...args) { debugger; }
export function Debugger_Wrap(arg1, ...args) { debugger; return arg1; }
export function Debugger_True(...args) { debugger; return true; }
export function Debugger_If(condition, ...args) {
    if (condition)
        debugger;
}
export function WrapWithDebugger(func, ...args) {
	return function() {
		debugger;
		func.apply(this, arguments);
	};
}
G({Debugger, Debugger_Wrap, Debugger_True, Debugger_If, WrapWithDebugger});

//var quickIncrementValues = {};
//export function QuickIncrement(name = new Error().stack.split("\n")[2]) { // this doesn't always work, fsr
export function QuickIncrement(name = "default") {
	QuickIncrement["values"][name] = (QuickIncrement["values"][name]|0) + 1;
	return QuickIncrement["values"][name];
}
QuickIncrement["values"] = [];
G({QuickIncrement});

// general
// ==========

/*G({E}); declare global { function E(...objExtends: any[]); }
export function E(...objExtends: any[]) {
    var result = {} as any;
    for (var extend of objExtends)
        result.Extend(extend);
	return result;
	//return StyleSheet.create(result);
}*/
G({E}); declare global {	function E<E1,E2,E3,E4,E5,E6,E7,E8>(e1?:E1,e2?:E2,e3?:E3,e4?:E4,e5?:E5,e6?:E6,e7?:E7,e8?:E8):E1&E2&E3&E4&E5&E6&E7&E8; }
export							function E<E1,E2,E3,E4,E5,E6,E7,E8>(e1?:E1,e2?:E2,e3?:E3,e4?:E4,e5?:E5,e6?:E6,e7?:E7,e8?:E8):E1&E2&E3&E4&E5&E6&E7&E8 {
	var result = {} as any;
	for (var extend of arguments)
		result.Extend(extend);
	return result;
	//return StyleSheet.create(result);
}

var eo = {};
G({eo}); declare global { const eo: any; }

// methods: url writing/parsing
// ==================

export var inFirefox = navigator.userAgent.toLowerCase().includes("firefox");

// others
// ==================

/*export var inTestMode = true; //GetUrlVars(CurrentUrl()).inTestMode == "true";
export function InTestMode() { return inTestMode; }*/

export var blockCSCalls = false;

export var loadTime = Date.now();
/*setTimeout(()=> {
	$(()=> {
		loadTime = Date.now();
	});
});*/
export function GetTimeSinceLoad() {
	return (Date.now() - loadTime) / 1000;
}

//window.evalOld = window.eval;
//window.eval = function() { try { evalOld.apply(this, arguments); } catch(error) { Log("JS error: " + error); }};

/*window.evalOld = eval;
window.eval = function(code) {
    if (true) { //new Error().stack.Contains("Packages/VDF")) //!code.Contains(";") && code != "CallCS_Callback")
        window.lastSpecialEvalExpression = code;
        window.lastSpecialEvalStack = new Error().stack;
        //window.evalStacks = window.evalStacks || [];
        //window.evalStacks.push(new Error().stack);
        window.evalExpressionsStr += code + "\n";
        window.evalStacksStr += new Error().stack + "\n";
    }
    return evalOld.apply(this, arguments);
};*/

/*export function EStrToInt(eStr: string) {
	return parseInt(eStr.substr(1));
}
export function IntToEStr(int: number) {
	return "e" + int;
}*/

// another way to require at runtime -- with full paths
//g.RequireTest = (require as any).context("../../", true, /\.tsx?$/);

export function $Simple(queryStr): HTMLElement[] {
	return [].slice.call(document.querySelectorAll(queryStr));
}

export function CopyText(text) {
	/*
	//var note = $(`<input type="text">`).appendTo("body");
	var note = document.createElement("textarea");
	document.body.appendChild(note);
	note.innerHTML = text;

	note.focus();
	var range = document.createRange();
	range.setStart(note, 0);
	range.setEnd(note, 1);
	//range.setEnd(note2, 0);

	//range.setEnd(e("notesEnder"), 0); // adds one extra new-line; that's okay, right?
	var sel = window.getSelection();
	sel.removeAllRanges();
	sel.addRange(range);

	document.execCommand("copy");*/

	(document as any).oncopy = function(event) {
		event.clipboardData.setData("text/plain", text);
		event.preventDefault();
		(document as any).oncopy = null;
	};
	(document as any).execCommand("copy", false, null);
}

export function GetRandomNumber(options: {min: number, max: number, mustBeInteger?: boolean}) {
	var {min, max, mustBeInteger} = options;
	/*Assert(IsNumber(min), `Min must be a number. (not: ${min})`);
	Assert(IsNumber(max), `Max must be a number. (not: ${max})`);*/
	var range = max - min;
	if (options.mustBeInteger)
		return min + Math.floor(Math.random() * (range + 1));
	return min + (Math.random() * range);
}