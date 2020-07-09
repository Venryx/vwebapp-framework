import Moment from "moment";
import {Assert, emptyArray, emptyArray_forLoading} from "js-vextensions";

G({Moment});

G({Debugger}); declare global { function Debugger(); }
export function Debugger(ifCondition = true, returnVal = null) {
	if (ifCondition) {
		debugger;
	}
	return returnVal;
}

// class/function tags
// ==========

export function Grab(grabFunc) {
	return target=>grabFunc(target);
}

// polyfills for constants
// ==========

//var quickIncrementValues = {};
//export function QuickIncrement(name = new Error().stack.split("\n")[2]) { // this doesn't always work, fsr
export function QuickIncrement(name = "default") {
	QuickIncrement["values"][name] = (QuickIncrement["values"][name] | 0) + 1;
	return QuickIncrement["values"][name];
}
QuickIncrement["values"] = [];
G({QuickIncrement});

// methods: url writing/parsing
// ==================

export var inFirefox = navigator.userAgent.toLowerCase().includes("firefox");

// others
// ==================

export var loadTime = Date.now();
export function GetTimeSinceLoad() {
	return (Date.now() - loadTime) / 1000;
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
	if (mustBeInteger) {
		return min + Math.floor(Math.random() * (range + 1));
	}
	return min + (Math.random() * range);
}

export type ReadAsString_FuncName = "readAsBinaryString" | "readAsDataURL" | "readAsText";
export function BlobToString(blob: Blob, readAsFuncName = "readAsText" as ReadAsString_FuncName) {
	return new Promise((resolve, reject)=>{
		const reader = new FileReader();
		//reader.addEventListener("loadend", e=>resolve(e.srcElement["result"]));
		reader.addEventListener("loadend", e=>resolve(reader.result as string));
		reader[readAsFuncName](blob);
	}) as Promise<string>;
}
export function BlobToArrayBuffer(blob: Blob): Promise<ArrayBuffer> {
	return new Promise((resolve, reject)=>{
		const reader = new FileReader();
		/*reader.onloadend = e=>resolve(reader.result as ArrayBuffer);
		reader.onerror = e=>reject(e["error"]);*/
		reader.addEventListener("loadend", e=>resolve(reader.result as ArrayBuffer));
		reader.addEventListener("error", e=>reject(e["error"]));
		reader.readAsArrayBuffer(blob);
	});
}