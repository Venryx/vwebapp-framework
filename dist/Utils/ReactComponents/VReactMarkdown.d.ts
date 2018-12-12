/// <reference types="react" />
import { ReactMarkdownProps } from "react-markdown";
import { BaseComponent } from "react-vextensions";
import { Segment } from "../General/RegexHelpers";
export declare type ReplacementFunc = (segment: Segment, index: number, extraInfo: any) => JSX.Element;
export declare class VReactMarkdown extends BaseComponent<{
    source: string;
    replacements?: {
        [key: string]: ReplacementFunc;
    };
    extraInfo?: any;
    style?: any;
    addMarginsForDanglingNewLines?: boolean;
} & ReactMarkdownProps, {}> {
    render(): JSX.Element;
}
