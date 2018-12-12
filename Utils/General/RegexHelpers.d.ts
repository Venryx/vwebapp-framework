export interface Pattern {
    name: string;
    regex: RegExp;
}
export interface Segment {
    patternMatched: string;
    textParts: string[];
}
export declare function ParseSegmentsForPatterns(text: string, patterns: Pattern[]): Segment[];
