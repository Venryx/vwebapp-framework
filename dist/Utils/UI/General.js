"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function StandardCompProps() {
    return ["dispatch", "_user", "_permissions", "_extraInfo"];
}
exports.StandardCompProps = StandardCompProps;
function ElementAcceptsTextInput(element) {
    var elementType = document.activeElement.tagName.toLowerCase();
    return (elementType == "textarea" ||
        (elementType == "input" && document.activeElement.getAttribute("type") == "text"));
}
exports.ElementAcceptsTextInput = ElementAcceptsTextInput;
//# sourceMappingURL=General.js.map