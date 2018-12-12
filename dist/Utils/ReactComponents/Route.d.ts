/// <reference types="react" />
import { BaseComponent } from "react-vextensions";
export declare class Route extends BaseComponent<{
    path?: string;
    withConditions?: Function;
}, {}> {
    render(): JSX.Element;
}
