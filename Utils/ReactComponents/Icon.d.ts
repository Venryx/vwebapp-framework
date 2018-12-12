/// <reference types="react" />
import { BaseComponent } from "react-vextensions";
export declare class Icon extends BaseComponent<{
    icon: string;
    size: number;
    color?: string;
} & React.HTMLProps<SVGElement>, {}> {
    static defaultProps: {
        color: string;
    };
    render(): JSX.Element;
}
