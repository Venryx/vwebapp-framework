import React from 'react';
import { BaseComponent } from "react-vextensions";
declare type Props = {
    onClick?: any;
    style?: any;
    text?: string;
    to?: string;
    target?: string;
    replace?: boolean;
    actions?: (dispatch: Function) => void;
} & React.HTMLProps<HTMLAnchorElement>;
export declare class Link extends BaseComponent<Props, {}> {
    handleClick(event: any): void;
    render(): JSX.Element;
}
export {};
