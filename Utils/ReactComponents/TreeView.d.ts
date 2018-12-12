/// <reference types="react" />
import { BaseComponent } from "react-vextensions";
import { Omit } from "Utils/UI/General";
declare type Props = {
    collapsable?: boolean;
    className?: string;
    itemClassName?: string;
    title: (JSX.Element | string);
    selected?: boolean;
    defaultCollapsed?: boolean;
    style?: any;
    titleStyle?: any;
    onClick?: (e: Event) => void;
    onArrowClick?: (newCollapsed: boolean) => void;
} & Omit<React.HTMLProps<HTMLDivElement>, "title">;
export declare class TreeView extends BaseComponent<Props, {
    collapsed: boolean;
}> {
    static defaultProps: {
        collapsable: boolean;
    };
    constructor(props: any);
    onArrowClick(...args: any[]): void;
    onClick(e: any): void;
    render(): JSX.Element;
}
export {};
