"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function ParseSegmentsForPatterns(text, patterns) {
    var segments = [];
    var textRemaining = text;
    while (textRemaining.length) {
        var match = void 0;
        for (var _i = 0, patterns_1 = patterns; _i < patterns_1.length; _i++) {
            var pattern = patterns_1[_i];
            match = pattern.regex.exec(textRemaining);
            if (match) {
                var partNotUsed = textRemaining.substr(0, match.index);
                if (partNotUsed.length)
                    segments.push({ patternMatched: null, textParts: [partNotUsed] });
                segments.push({ patternMatched: pattern.name, textParts: match });
                textRemaining = textRemaining.substr(match.index + match[0].length);
                break;
            }
        }
        if (!match) {
            var partNotUsed = textRemaining;
            if (partNotUsed.length)
                segments.push({ patternMatched: null, textParts: [partNotUsed] });
            textRemaining = "";
        }
    }
    return segments;
}
exports.ParseSegmentsForPatterns = ParseSegmentsForPatterns;
//# sourceMappingURL=RegexHelpers.js.map