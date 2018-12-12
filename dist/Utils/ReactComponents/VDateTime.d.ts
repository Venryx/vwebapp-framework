/// <reference types="react" />
import { BaseComponent } from "react-vextensions";
import { DatetimepickerProps } from "react-datetime";
import Moment from "moment";
export declare class VDateTime extends BaseComponent<{
    delayChangeTillDefocus: boolean;
    min?: Moment.Moment;
    max?: Moment.Moment;
    onChange: (val: Moment.Moment) => void;
} & DatetimepickerProps, {
    valueTemp: any;
}> {
    render(): JSX.Element;
    OnInputBlurOrBoxClose(val: any): void;
}
