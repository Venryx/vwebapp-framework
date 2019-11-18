import {VURL} from "js-vextensions";
import {BaseComponent, BaseComponentPlus} from "react-vextensions";
import {push, replace} from "connected-react-router";
import React from "react";
import {manager} from "../../Manager";
import {MaybeLog_Base} from "../General/Logging";
import {loadingURL, NotifyURLLoaded} from "../URL/URLs";
import {e} from "../../PrivateExports";

let lastProcessedURL: VURL;
export class AddressBarWrapper extends BaseComponentPlus({}, {}) {
	render() {
		const newURL = manager.GetNewURL();
		const pushURL = !loadingURL && manager.DoesURLChangeCountAsPageChange(lastProcessedURL, newURL);
		// if (pushURL) Log(`Pushing: ${newURL} @oldURL:${lastURL}`);

		if (loadingURL) NotifyURLLoaded();

		if (newURL.toString({domain: false}) === lastProcessedURL.toString({domain: false})) return null;

		let action;
		if (lastProcessedURL) {
			action = pushURL ? push(newURL) : replace(newURL);
			MaybeLog_Base(a=>a.urlLoads, ()=>`Dispatching new-url: ${newURL} @type:${action.type}`);
		} else {
			// if page just loaded, do one "start-up" LOCATION_CHANGED action, with whatever's in the address-bar
			const startURL = e.GetCurrentURL(true).toString({domain: false});
			action = replace(startURL);
			MaybeLog_Base(a=>a.urlLoads, ()=>`Dispatching start-url: ${e.GetCurrentURL(true)} @type:${action.type}`);
		}

		// action.byUser = false;
		// g.justChangedURLFromCode = true;
		// action.payload.fromStateChange = true;
		// extend the "state" argument for the to-be-created history-entry (used in ActionProcessor.ts)
		//action.payload.args[1] = E(action.payload.args[1], {fromStateChange: true});

		manager.store.dispatch(action);

		lastProcessedURL = newURL;
		return null;
	}
}