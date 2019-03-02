import React from "react";
import { OnPopulated } from "../../Manager";

export function StandardCompProps() {
	return ["dispatch", "_user", "_permissions", "_extraInfo"];
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