/// <reference types="react" />
import { BaseComponent } from "react-vextensions";
import { Vector2i } from "js-vextensions";
import { Omit } from "./General";
export declare class DraggableLabel extends BaseComponent<{
    onDragStart: () => any;
    onDrag?: (dragDelta: Vector2i, dragTotal: Vector2i, finalEvent: boolean) => any;
} & Omit<React.HTMLProps<HTMLLabelElement>, "onDragStart" | "onDrag">, {}> {
    render(): JSX.Element;
    ComponentWillUnmount(): void;
    RemoveListeners(): void;
    mouseDownPos: Vector2i;
    lastMousePos: Vector2i;
    OnMouseMove_Global: (e: MouseEvent) => void;
    OnMouseUp_Global: (e: MouseEvent) => void;
}
