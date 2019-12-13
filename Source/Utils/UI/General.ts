import React from "react";
import {WrapWithGo} from "js-vextensions";
import {SimpleShouldUpdate, WarnOfTransientObjectProps, SimpleShouldUpdate_Options, WarnOfTransientObjectProps_Options} from "react-vextensions";
import ReactDOM from "react-dom";
import {OnPopulated} from "../../Manager";

export function StandardCompProps() {
	return ["dispatch", "_user", "_permissions", "_extraInfo"];
}

export type CSSColorStringType = "hsl" | "hsla";
/** Converts color-props into a css color-string of the specified format. */
export function CSSColor(
	/** [0-360] RefPoints: {red: 0, orange: 38, yellow: 60, green: 120, blue: 240, violet: 300, indigo: 274[?]} */
	hue: number,
	/** [0-1] */ saturation: number, /** [0-1] */ brightness: number, /** [0-1] */ alpha = 1,
	cssType: CSSColorStringType = "hsla",
) {
	if (cssType == "hsl") return `hsl(${hue}, ${saturation * 100}%, ${brightness * 100}%)`;
	if (cssType == "hsla") return `hsla(${hue}, ${saturation * 100}%, ${brightness * 100}%, ${alpha})`;
}
export function HSL(
	/** [0-360] RefPoints: {red: 0, orange: 38, yellow: 60, green: 120, blue: 240, violet: 300, indigo: 274[?]} */ hue: number,
	/** [0-1] */ saturation: number, /** [0-1] */ brightness: number,
) {
	return CSSColor(hue, saturation, brightness, null, "hsl");
}
export function HSLA(
	/** [0-360] RefPoints: {red: 0, orange: 38, yellow: 60, green: 120, blue: 240, violet: 300, indigo: 274[?]} */ hue: number,
	/** [0-1] */ saturation: number, /** [0-1] */ brightness: number, /** [0-1] */ alpha = 1,
) {
	return CSSColor(hue, saturation, brightness, alpha, "hsla");
}

export function ElementAcceptsTextInput(element: Element) {
	const elementType = document.activeElement.tagName.toLowerCase();
	return (
		elementType == "textarea" ||
		(elementType == "input" && document.activeElement.getAttribute("type") == "text")
	);
}

OnPopulated(()=>{
	// patch React.createElement to do early prop validation
	// ==========

	const createElement_old = React.createElement;
	React["createElement" as any] = function(componentClass, props) {
		if (componentClass.ValidateProps) {
			componentClass.ValidateProps(props);
		}
		return createElement_old.apply(this, arguments);
	};
});

export const RunWithRenderingBatched = WrapWithGo((func: Function)=>{
	ReactDOM.unstable_batchedUpdates(func as any);
});

/* export class ExpensiveComponent_Options {
	simpleShouldUpdate_call? = true;
	simpleShouldUpdate_options?: Partial<SimpleShouldUpdate_Options> = new SimpleShouldUpdate_Options();
	warnOfTransientObjectProps_call? = true;
	warnOfTransientObjectProps_options?: Partial<WarnOfTransientObjectProps_Options> = new WarnOfTransientObjectProps_Options();
}
export function ExpensiveComponent(targetClass: Function);
export function ExpensiveComponent(options: Partial<ExpensiveComponent_Options>);
export function ExpensiveComponent(...args) {
	//Assert(targetClass instanceof Function, `Must decorate a class directly. (no "()" in "@ExpensiveComponent" line)`);
	//let options = new ExpensiveComponent_Options();
	let options = new ExpensiveComponent_Options();
	if (typeof args[0] == "function") {
		ApplyToClass(args[0]);
	} else {
		options = E(options, args[0]);
		return ApplyToClass;
	}

	function ApplyToClass(targetClass: Function) {
		if (options.simpleShouldUpdate_call) SimpleShouldUpdate(options.simpleShouldUpdate_options)(targetClass);
		if (options.warnOfTransientObjectProps_call) WarnOfTransientObjectProps(options.warnOfTransientObjectProps_options)(targetClass);
	}
} */