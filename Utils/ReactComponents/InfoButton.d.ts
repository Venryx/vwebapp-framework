/// <reference types="react" />
import { BaseComponent } from "react-vextensions";
import { ButtonProps } from "react-vcomponents";
declare type EffectType = "float" | "solid";
declare class TooltipInfo {
    constructor(text: string, effect: EffectType);
    id: number;
    readonly IDStr: string;
    text: string;
    effect: EffectType;
}
export declare class InfoButton extends BaseComponent<{
    text: string;
    effect?: EffectType;
} & ButtonProps, {}> {
    static defaultProps: {
        effect: string;
    };
    ComponentWillMountOrReceiveProps(props: any): void;
    ComponentWillUnmount(): void;
    tooltip: TooltipInfo;
    DestroyTooltip(): void;
    CreateTooltip(props: any): void;
    render(): JSX.Element;
}
export {};
