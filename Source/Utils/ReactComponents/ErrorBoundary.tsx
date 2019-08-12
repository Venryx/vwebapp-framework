import {BaseComponent} from "react-vextensions";
import React from "react";
import {TextArea, Column} from "react-vcomponents";

export class ErrorBoundary extends BaseComponent<{errorUI?: (defaultErrorUI: JSX.Element, boundaryComp: ErrorBoundary)=>JSX.Element}, {error: string, errorInfo: {componentStack: string}}> {
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
		const {errorUI, children} = this.props;
		const {error, errorInfo} = this.state;
		if (error) {
			const defaultErrorUI = (
				<Column style={{height: "100%"}}>
					{/*<Text>An error has occured in the UI-rendering code.</Text>
					<TextArea value={error}/>
					<TextArea value={errorInfo.componentStack}/>
					<TextArea value={ToJSON(errorInfo)}/>*/}
					<TextArea autoSize={true} value={`An error has occured in the UI-rendering code.\n\n${error}\n${errorInfo.componentStack}`}/>
				</Column>
			);
			if (errorUI) {
				return errorUI(defaultErrorUI, this);
			}
			return defaultErrorUI;
		}

		return children;
	}
}