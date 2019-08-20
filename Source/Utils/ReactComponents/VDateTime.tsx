import {IsString} from "js-vextensions";
import Moment from "moment";
import React from "react";
import DateTime, {DatetimepickerProps} from "react-datetime";
import {BaseComponent} from "react-vextensions";

function RawValToMoment(val: Moment.Moment | string, props: VDateTime_Props): Moment.Moment {
	//let timeOnly = props.dateFormat == false;
	const {dateFormat, timeFormat} = props;

	// if string-input did not exactly match dateFormat+timeFormat, this function will try to parse the meaning anyway
	if (IsString(val)) {
		if (val == "" || (dateFormat == false && timeFormat == false)) return null;
		const asMoment = Moment(val);
		//const asMoment = Moment(val, ["HH:mm", "hh:mm a"]);
		/*const asMoment = Moment(val,
			dateFormat && timeFormat ? [`${dateFormat} ${timeFormat}`].concat(dateFo) :
			dateFormat ? [dateFormat] :
			timeFormat ? [timeFormat] :
			null);*/
		if (!asMoment.isValid()) return null;
		return asMoment;
	}

	return val;
}
function KeepInRange(val: Moment.Moment, min: Moment.Moment, max: Moment.Moment) {
	let result = val;
	if (min && result < min) result = min;
	if (max && result > max) result = max;
	return result;
}

export type VDateTime_Props = {
	delayChangeTillDefocus: boolean, min?: Moment.Moment, max?: Moment.Moment, onChange: (val: Moment.Moment)=>void,
	//dateFormatExtras?: string[], timeFormatExtras?: string[],
	// fixes for DatetimepickerProps
	dateFormat?: string | false, timeFormat?: string | false,
} & Omit<DatetimepickerProps, "dateFormat" | "timeFormat">;
export class VDateTime extends BaseComponent<VDateTime_Props, {editedValue_raw: Moment.Moment | string}> {
	/*static defaultProps = {
		dateFormatExtras: [""],
		timeFormatExtras: [""],
	};*/

	render() {
		const {value, onChange, delayChangeTillDefocus, min, max, ...rest} = this.props;
		const {editedValue_raw} = this.state;
		return (
			<DateTime {...rest} value={editedValue_raw != null ? editedValue_raw : value}
				onChange={newVal_raw=>{
					let newVal = RawValToMoment(newVal_raw, this.props);
					newVal = KeepInRange(newVal, min, max);
					if (`${newVal}` == `${RawValToMoment(editedValue_raw, this.props)}`) return; // if no change, ignore event

					if (delayChangeTillDefocus) {
						this.SetState({editedValue_raw: newVal_raw}, null, false);
					} else {
						onChange(newVal);
						this.SetState({editedValue_raw: null});
					}
				}}
				inputProps={{onBlur: e=>this.OnInputBlurOrBoxClose(e.target.value)}}
				onBlur={val=>this.OnInputBlurOrBoxClose(val as string | Moment.Moment)}/>
		);
	}
	OnInputBlurOrBoxClose(newVal_raw: Moment.Moment | string) {
		const {value, onChange, delayChangeTillDefocus, min, max} = this.props;
		let newVal = RawValToMoment(newVal_raw, this.props);
		newVal = KeepInRange(newVal, min, max);

		//if (`${newVal}` == `${value}`) return; // if no change, ignore event
		const valChanged = `${newVal}` != `${value}`; // don't just return if same value; we still need to clear edited-value (in case date-time string needs normalization)

		if (delayChangeTillDefocus) {
			if (onChange && valChanged) onChange(newVal);
			this.SetState({editedValue_raw: null});
		}
	}
}