import {BaseComponent, BaseComponentPlus} from "react-vextensions";
import React, {Component} from "react";
import {TextArea, Column} from "react-vcomponents";
import {ScrollView} from "react-vscrollview";

type ReactErrorInfo = {componentStack: string};
export type ReactError = {message: string, info: ReactErrorInfo};

export type ErrorUIFunc = (props: ErrorUIProps, comp: Component)=>JSX.Element;
export type ErrorUIProps = {error: ReactError, style, defaultUI: ErrorUIFunc};
export const defaultErrorUI = (props: ErrorUIProps)=>{
	const {error, style} = props;
	return (
		<ScrollView style={E({height: "100%"}, style)}>
			{/*<Text>An error has occured in the UI-rendering code.</Text>
			<TextArea value={error}/>
			<TextArea value={errorInfo.componentStack}/>
			<TextArea value={ToJSON(errorInfo)}/>*/}
			<TextArea autoSize={true} value={`An error has occured in the UI-rendering code.\n\n${error.message}\n${error.info.componentStack}`}/>
		</ScrollView>
	);
};

// todo: maybe remove this; better to just use componentDidError + "EB_" functions below directly
export class ErrorBoundary extends BaseComponentPlus({errorUI: defaultErrorUI} as {errorUI?: ErrorUIFunc, errorUIStyle?}, {error: null as ReactError}) {
	componentDidCatch(message, info) { EB_StoreError(this, message, info); }
	ClearError() { this.SetState({error: null}); }

	render() {
		const {errorUI, errorUIStyle, children} = this.props;
		const {error} = this.state;
		if (error) {
			const errorUIProps = {error, style: errorUIStyle, defaultUI: defaultErrorUI};
			return errorUI(errorUIProps, this);
		}

		return children;
	}
}

// function-based approach
// todo: maybe add this functionality to the BaseComponentPlus function/class
export function EB_StoreError(comp: BaseComponent, errorMessage: string, errorInfo: ReactErrorInfo) {
	const error = {message: errorMessage, info: errorInfo};
	comp.SetState({error});
	Log(`%c In ErrorBoundary/componentDidCatch. error:`, "color: #222; background: #dfd");
	Log(error);
	//logErrorToMyService(error, info);
}
export function EB_ShowError(error: ReactError, style?) {
	return defaultErrorUI({error, style, defaultUI: null});
}