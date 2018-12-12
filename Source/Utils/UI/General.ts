export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

export function StandardCompProps() {
	return ["dispatch", "_user", "_permissions", "_extraInfo"];
}

export function ElementAcceptsTextInput(element: Element) {
	let elementType = document.activeElement.tagName.toLowerCase();
	return (
		elementType == "textarea" ||
		(elementType == "input" && document.activeElement.getAttribute("type") == "text")
	);
}