import {BaseComponent} from "react-vextensions";
import RCSlider from "rc-slider";
import React from "react";

export class Slider extends BaseComponent
		<{
			min: number, max: number, step: number, value: number, enabled?: boolean, delayChangeTillDefocus?: boolean, onChange: (val: number)=>void,
			minimumTrackStyle?, trackStyle?, handleStyle?,
		},
		{editedValue: number}> {
	static defaultProps = {enabled: true};
	slider: RCSlider;
	render() {
		const {value, enabled, delayChangeTillDefocus, onChange, ...rest} = this.props;
		const {editedValue} = this.state;
		return (
			<RCSlider ref={c=>this.slider = c} {...rest} disabled={!enabled}
				value={editedValue != null ? editedValue : (value || 0)}
				onChange={val=>{
					if (delayChangeTillDefocus) {
						this.SetState({editedValue: val});
					} else {
						onChange(val);
						this.SetState({editedValue: null});
					}
				}}
				onAfterChange={val=>{
					if (delayChangeTillDefocus && onChange) {
						onChange(val);
						this.SetState({editedValue: null});
					}
				}}/>
		);
	}
}