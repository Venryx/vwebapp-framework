import {UseState} from "react-vextensions";
import {VRect, ToJSON} from "js-vextensions";
import {useRef, useLayoutEffect, MutableRefObject, useState, useCallback, Component} from "react";
import {shallowEqual} from "react-redux";
import ReactDOM from "react-dom";

// general
// ==========

// will try to finish this once I have more experience with react-hooks
/* export function UseCheckStillHoveredTimer() {
	let checkStillHoveredTimer;
	useEffect(()=>{
		checkStillHoveredTimer = new Timer(100, ()=>{
			const dom = GetDOM(this.root);
			if (dom == null) {
				checkStillHoveredTimer.Stop();
				return;
			}
			const mainRect = VRect.FromLTWH(dom.getBoundingClientRect());

			const leftBoxDOM = dom.querySelector(".NodeUI_LeftBox");
			const leftBoxRect = leftBoxDOM ? VRect.FromLTWH(leftBoxDOM.getBoundingClientRect()) : null;

			const mouseRect = new VRect(mousePos, new Vector2i(1, 1));
			const intersectsOne = mouseRect.Intersects(mainRect) || (leftBoxRect && mouseRect.Intersects(leftBoxRect));
			// Log(`Main: ${mainRect} Mouse:${mousePos} Intersects one?:${intersectsOne}`);
			setHovered(intersectsOne);
		});
		return ()=>checkStillHoveredTimer.Stop(); // cleanup func
	}, []);
	return checkStillHoveredTimer;
} */

export type Size = {width: number, height: number};
export enum UseSize_Method {
	/** How much of the parent's "relative positioning" space is taken up by the element. (ie. it ignores the element's position: absolute descendents) */
	OffsetSize = 10,
	/** Same as OffsetSize, except it excludes the element's own border, margin, and the height of its horizontal scroll-bar (if it has one). */
	ClientSize = 20,
	/** How much space is needed to see all of the element's content/descendents (including position: absolute ones) without scrolling. */
	ScrollSize = 30,
	/** Same as ScrollSize, except that it's calculated after the element's css transforms are applied. */
	BoundingClientRect = 40,
}
export class UseSize_Options {
	method = UseSize_Method.OffsetSize;
}
export function GetSize(el: HTMLElement, method: UseSize_Method) {
	let size: Size;
	if (method == UseSize_Method.OffsetSize) {
		size = {width: el.offsetWidth, height: el.offsetHeight};
	} else if (method == UseSize_Method.ClientSize) {
		size = {width: el.clientWidth, height: el.clientHeight};
	} else if (method == UseSize_Method.ScrollSize) {
		size = {width: el.scrollWidth, height: el.scrollHeight};
	} else if (method == UseSize_Method.BoundingClientRect) {
		size = el.getBoundingClientRect().Including("width", "height") as any;
	}
	return size;
}
export function UseSize(options?: Partial<UseSize_Options>): [(node: Component | Element)=>any, Size] {
	options = E(new UseSize_Options(), options);
	const [size, setSize] = UseState({width: null, height: null} as Size, shallowEqual);

	//const ref = useRef<HTMLElement>();
	const [node, setNode] = UseState(null);
	const ref = useCallback(compOrNode=>{
		if (compOrNode == null) return; // if element was unmounted, just ignore (ie. wait till remounted to call setSize)
		let newNode: Element = compOrNode;
		if (compOrNode instanceof Component) newNode = ReactDOM.findDOMNode(compOrNode) as Element;
		setNode(newNode);
	}, []);

	useLayoutEffect(()=>{
		if (node == null) return;
		window.requestAnimationFrame(()=>{
			//const el = ref.current as HTMLElement;
			const newSize = GetSize(node, options.method);
			setSize(newSize);
		});
	}, [node]);
	return [ref, size];
}