import { BaseComponent } from "react-vextensions";
import { Vector2i } from "js-vextensions";
import React from "react";
import {Omit} from "../../Manager";

export class DraggableLabel extends BaseComponent<{
	onDragStart: ()=>any,
	onDrag?: (dragDelta: Vector2i, dragTotal: Vector2i, finalEvent: boolean)=>any,
} & Omit<React.HTMLProps<HTMLLabelElement>, "onDragStart" | "onDrag">, {}> {
	render() {
		let {onDragStart, onDrag, style, ...rest} = this.props;
		return (
			<label {...rest}
				style={E(
					onDrag && {cursor: "col-resize"},
					style,
				)}
				onMouseDown={e=> {
					if (onDrag == null) return;

					this.mouseDownPos = new Vector2i(e.pageX, e.pageY);
					this.lastMousePos = this.mouseDownPos;
					onDragStart();

					document.addEventListener("mousemove", this.OnMouseMove_Global);
					document.addEventListener("mouseup", this.OnMouseUp_Global);
				}}/>
		);
	}

	ComponentWillUnmount() {
		this.RemoveListeners();
	}
	RemoveListeners() {
		document.removeEventListener("mousemove", this.OnMouseMove_Global);
		document.removeEventListener("mouseup", this.OnMouseUp_Global);
	}

	mouseDownPos: Vector2i;
	lastMousePos: Vector2i;
	OnMouseMove_Global = (e: MouseEvent)=> {
		let {onDrag} = this.props;
		let mousePos = new Vector2i(e.pageX, e.pageY);
		onDrag(mousePos.Minus(this.lastMousePos), mousePos.Minus(this.mouseDownPos), false);

		this.lastMousePos = mousePos;
	};
	OnMouseUp_Global = (e: MouseEvent)=> {
		let {onDrag} = this.props;
		let mousePos = new Vector2i(e.pageX, e.pageY);
		onDrag(mousePos.Minus(this.lastMousePos), mousePos.Minus(this.mouseDownPos), true);

		this.RemoveListeners();
	};
}