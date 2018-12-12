/// <reference types="react" />
import { BaseComponent } from "react-vextensions";
import RCSlider from "rc-slider";
export declare class Slider extends BaseComponent<{
    min: number;
    max: number;
    step: number;
    value: number;
    enabled?: boolean;
    delayChangeTillDefocus?: boolean;
    onChange: (val: number) => void;
    minimumTrackStyle?: any;
    trackStyle?: any;
    handleStyle?: any;
}, {
    editedValue: number;
}> {
    static defaultProps: {
        enabled: boolean;
    };
    slider: RCSlider;
    render(): JSX.Element;
}
