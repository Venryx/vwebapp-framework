import { VRect, Vector2i } from "js-vextensions";
import * as THREE from "three";
export declare function GetUpdates(oldData: any, newData: any, useNullInsteadOfUndefined?: boolean): any;
export declare function GetOffsetRect(el: HTMLElement): VRect;
export declare function GetScreenRect(el: HTMLElement): VRect;
export declare function ToVector2i(vector: THREE.Vector3): Vector2i;
export declare function ToVector2(vector: Vector2i): any;
export declare function ToVector3(vector: Vector2i, z?: number): any;
