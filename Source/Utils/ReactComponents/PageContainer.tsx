import {ScrollView} from "react-vscrollview";
import {BaseComponent} from "react-vextensions";
import {Row, Div} from "react-vcomponents";
import {ToInt, IsNumber} from "js-vextensions";
import React from "react";

// same as E(...), except applies extra things for style-objects
function ES(...styles) {
	const result = E(...styles);

	// prevents {flex: 1} from setting {[minWidth/minHeight]: "auto"}
	if (result.flex) {
		if (result.minWidth == null) result.minWidth = 0;
		if (result.minHeight == null) result.minHeight = 0;
	}

	return result;
}

export function GetExpandedCSSPropValuesFromString(propName: string, styleStrOrNum: React.ReactText) {
	if (styleStrOrNum == null) return {};
	if (IsNumber(styleStrOrNum)) return GetExpandedCSSPropValuesFromValueArray(propName, [styleStrOrNum]);
	//const values = styleStrOrNum.match(/\d+/g).map(valStr=>ToInt(valStr));
	const values = styleStrOrNum.split(" "); //.map(valStr=>ToInt(valStr));
	return GetExpandedCSSPropValuesFromValueArray(propName, values);
}
export function GetExpandedCSSPropValuesFromValueArray(propName: string, styleValues: React.ReactText[]) {
	/*if (styleValues.length === 1) {
		return {[propName]: styleValues[0]};
	}*/
	//function ExpandCSSPropValue(propName: string, ...values) {
	function Expand(...values: React.ReactText[]) {
		return {
			[`${propName}Top`]: values[0],
			[`${propName}Right`]: values[1],
			[`${propName}Bottom`]: values[2],
			[`${propName}Left`]: values[3],
		};
	}
	//if (styleValues.length === 0) return Expand(0, 0, 0, 0);
	if (styleValues.length === 0) return {};
	if (styleValues.length === 1) return Expand(styleValues[0], styleValues[0], styleValues[0], styleValues[0]);
	if (styleValues.length === 2) return Expand(styleValues[0], styleValues[1], styleValues[0], styleValues[1]);
	if (styleValues.length === 3) return Expand(styleValues[0], styleValues[1], styleValues[2], styleValues[1]);
	if (styleValues.length === 4) return Expand(styleValues[0], styleValues[1], styleValues[2], styleValues[3]);
	return {}; // invalid number of values (must contain calc() or something); return empty object
}

export function ReactTextToPixelVal(reactText: React.ReactText) {
	if (IsNumber(reactText)) return reactText;
	if (reactText.trim() == "0") return 0;
	const pxMatch = reactText.match(/(\d+)px/);
	if (!pxMatch) return null;
	return ToInt(pxMatch[1]);
}

export class PageContainer extends BaseComponent<{scrollable?: boolean, fullWidth?: boolean, fullHeight?: boolean, shadow?: boolean, style?, innerStyle?} & React.HTMLProps<ScrollView & Row>, {}> {
	static defaultProps = {scrollable: false, shadow: true};
	render() {
		let {scrollable, fullWidth, fullHeight, shadow, style, innerStyle, children, ...rest} = this.props; // eslint-disable-line
		const outerStyle = style || {};
		innerStyle = innerStyle || {};

		const outerStyle_base = ES(
			{flex: "0 1 960px", margin: "50px 10px 20px 10px"},
			shadow && {filter: "drop-shadow(rgb(0, 0, 0) 0px 0px 10px)"},
			fullWidth && {flex: 1, width: "100%"},
		);
		const innerStyle_base = {display: "flex", flexDirection: "column", background: `rgba(0,0,0,${shadow ? ".6" : ".8"})`, borderRadius: 10, padding: 50};

		const marginValuesFromMarginProp = GetExpandedCSSPropValuesFromString("margin", ES(outerStyle_base, outerStyle).margin);
		const marginValues = ES(marginValuesFromMarginProp, outerStyle);
		const verticalMargin = ReactTextToPixelVal(marginValues.marginTop) + ReactTextToPixelVal(marginValues.marginBottom);
		outerStyle_base[fullHeight ? "height" : "maxHeight"] = `calc(100% - ${verticalMargin}px)`;

		if (scrollable) {
			return (
				<ScrollView {...rest as any}
						style={ES(outerStyle_base, outerStyle)}
						contentStyle={ES(innerStyle_base, {display: "flex", flexDirection: "column"}, innerStyle)}>
					{children}
				</ScrollView>
			);
		}
		return (
			<Div {...rest as any}
					style={ES(outerStyle_base, innerStyle_base, {alignItems: "stretch"}, outerStyle, innerStyle)}>
				{children}
			</Div>
		);
	}
}