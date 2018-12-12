interface Rect {
    x: number;
    y: number;
    readonly Right: any;
    readonly Bottom: any;
}
interface Circle {
    x: number;
    y: number;
    radius: number;
}
export declare function GetDistanceBetweenRectAndCircle(rect: Rect, circle: Circle): number;
interface Vector2i {
    x: number;
    y: number;
}
export declare function GetDistanceBetweenRectAndPoint(rect: Rect, point: Vector2i): number;
export {};
