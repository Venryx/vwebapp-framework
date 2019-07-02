import {BaseComponent} from "react-vextensions";
import {DatetimepickerProps} from "react-datetime";
import DateTime from "react-datetime";
import Moment from "moment";
import React from "react";
import {IsString} from "js-vextensions";

function FixVal(val, props) {
	//let timeOnly = props.dateFormat == false;
	const {dateFormat, timeFormat} = props;
	if (IsString(val) && dateFormat && timeFormat) {
		if (val == "") return null;
		//const asMoment = Moment(val, ["HH:mm", "hh:mm a"]);
		const asMoment = Moment(val, [`${dateFormat} ${timeFormat}`]);
		if (!asMoment.isValid) return null;
		return asMoment;
	}
	return val;
}

export class VDateTime extends BaseComponent
		<{delayChangeTillDefocus: boolean, min?: Moment.Moment, max?: Moment.Moment, onChange: (val: Moment.Moment)=>void} & DatetimepickerProps,
		{valueTemp: any}> {
	render() {
		const {value, onChange, delayChangeTillDefocus, min, max, ...rest} = this.props;
		const {valueTemp} = this.state;
		return (
			<DateTime {...rest} value={valueTemp !== undefined ? valueTemp : value}
				onChange={val=>{
					if (!IsString(val)) {
						if (min && val < min) val = min;
						if (max && val > max) val = max;
					}
					if (delayChangeTillDefocus) this.SetState({valueTemp: val}, null, false);
					else onChange(FixVal(val, this.props));
				}}
				inputProps={{onBlur: e=>this.OnInputBlurOrBoxClose((e.target as HTMLInputElement).value)}}
				onBlur={val=>this.OnInputBlurOrBoxClose(val)}/>
		);
	}
	OnInputBlurOrBoxClose(val) {
		const {value, onChange, delayChangeTillDefocus, min, max, ...rest} = this.props;
		if (!delayChangeTillDefocus) return;
		if (!IsString(val)) {
			if (min && val < min) val = min;
			if (max && val > max) val = max;
		}
		onChange(FixVal(val, this.props));
	}
}