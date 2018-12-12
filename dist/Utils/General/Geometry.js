"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function GetDistanceBetweenRectAndCircle(rect, circle) {
    // find the closest point to the circle within the rectangle
    var closestX = circle.x.KeepBetween(rect.x, rect.Right);
    var closestY = circle.y.KeepBetween(rect.y, rect.Bottom);
    // calculate the distance between the circle's center and this closest point
    var distanceX = circle.x - closestX;
    var distanceY = circle.y - closestY;
    // if the distance is less than the circle's radius, an intersection occurs
    var distanceSquared = (distanceX * distanceX) + (distanceY * distanceY);
    //return distanceSquared < (circle.radius * circle.radius);
    return distanceSquared.ToPower(1 / 2);
}
exports.GetDistanceBetweenRectAndCircle = GetDistanceBetweenRectAndCircle;
function GetDistanceBetweenRectAndPoint(rect, point) {
    return GetDistanceBetweenRectAndCircle(rect, { x: point.x, y: point.y, radius: 0 });
}
exports.GetDistanceBetweenRectAndPoint = GetDistanceBetweenRectAndPoint;
//# sourceMappingURL=Geometry.js.map