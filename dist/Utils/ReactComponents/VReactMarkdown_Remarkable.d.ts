/// <reference types="react" />
import Remarkable from "remarkable";
import { BaseComponent } from "react-vextensions";
import { ReplacementFunc } from "./VReactMarkdown";
declare type Props = {
    source: string;
    markdownOptions?: any;
    rendererOptions?: any;
    replacements?: {
        [key: string]: ReplacementFunc;
    };
    extraInfo?: any;
    containerType?: any;
    style?: any;
    addMarginsForDanglingNewLines?: boolean;
} & React.HTMLProps<HTMLDivElement>;
export declare class VReactMarkdown_Remarkable extends BaseComponent<Props, {}> {
    static defaultProps: {
        containerType: string;
    };
    markdown: Remarkable;
    InitMarkdown(props: any): void;
    ComponentWillReceiveProps(props: any): void;
    render(): any;
}
export {};
