import {BaseComponent} from "react-vextensions";
import React from "react";
import {TextArea, Column} from "react-vcomponents";
import {ScrollView} from "react-vscrollview";

export type ErrorUIFunc = (props: ErrorUIProps, boundaryComp: ErrorBoundary)=>JSX.Element;
export type ErrorUIProps = {error: string, errorInfo: {componentStack: string}, style, defaultUI: ErrorUIFunc};

const defaultErrorUI = (props: ErrorUIProps)=>{
	const {error, errorInfo, style} = props;
	return (
		<ScrollView style={E({height: "100%"}, style)}>
			{/*<Text>An error has occured in the UI-rendering code.</Text>
			<TextArea value={error}/>
			<TextArea value={errorInfo.componentStack}/>
			<TextArea value={ToJSON(errorInfo)}/>*/}
			<TextArea autoSize={true} value={`An error has occured in the UI-rendering code.\n\n${error}\n${errorInfo.componentStack}`}/>
		</ScrollView>
	);
};

export class ErrorBoundary extends BaseComponent
		<{errorUI?: ErrorUIFunc, errorUIStyle?},
		{error: string, errorInfo: {componentStack: string}}> {
	static defaultProps = {errorUI: defaultErrorUI};

	componentDidCatch(error, errorInfo) {
		this.SetState({error, errorInfo});
		Log(`%c In RootUI/componentDidCatch. error: ${error}, errorInfo:`, "color: #222; background: #dfd");
		Log(this.state.errorInfo);
		//logErrorToMyService(error, info);
	}

	ClearError() {
		this.SetState({error: null, errorInfo: null});
	}

	render() {
		const {errorUI, errorUIStyle, children} = this.props;
		const {error, errorInfo} = this.state;
		if (error) {
			const errorUIProps = {error, errorInfo, style: errorUIStyle, defaultUI: defaultErrorUI};
			return errorUI(errorUIProps, this);
		}

		return children;
	}
}