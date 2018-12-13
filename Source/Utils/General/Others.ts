import {RemoveHelpers} from "../Database/DatabaseHelpers";
import {VRect, Vector2i} from "js-vextensions";
import { AddSchema } from "../../Server/Server";  

export function GetUpdates(oldData, newData, useNullInsteadOfUndefined = true) {
	let result = {};
	for (let key of oldData.VKeys(true).concat(newData.VKeys(true))) {
		if (newData[key] !== oldData[key]) {
			result[key] = newData[key];
			if (newData[key] === undefined && useNullInsteadOfUndefined) {
				result[key] = null;
			}
		}
	}
	return RemoveHelpers(result);
}

export function GetOffsetRect(el: HTMLElement) {
	return new VRect(el.clientLeft, el.clientTop, el.clientWidth, el.clientHeight, false);
}
export function GetScreenRect(el: HTMLElement) {
	var clientRect = el.getBoundingClientRect();
	return new VRect(clientRect.left, clientRect.top, clientRect.width, clientRect.height, false);
}

AddSchema({
	properties: {
		x: {type: "number"},
		y: {type: "number"},
	},
}, "Vector2i");
AddSchema({
	properties: {
		x: {type: "number"},
		y: {type: "number"},
		width: {type: "number"},
		height: {type: "number"},
	},
}, "VRect");