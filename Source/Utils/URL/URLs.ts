import {GetCurrentURLString, VURL} from "js-vextensions";
import {manager} from "../../Manager";
import {e} from "../../PrivateExports";

export function GetCurrentURL(fromAddressBar = false) {
	return fromAddressBar ? VURL.Parse(GetCurrentURLString()) : VURL.FromLocationObject(e.State_Base(...manager.routerLocationPathInStore));
}

export let loadingURL = false;
export function LoadURL(url: VURL) {
	e.MaybeLog_Base(a=>a.urlLoads, ()=>`Loading url: ${url.toString()}`);
	loadingURL = true;

	//if (!GetPath(GetUrlPath(url)).startsWith("global/map")) return;
	const syncActions = manager.GetLoadActionsForURL(url);
	manager.store.dispatch(new e.ActionSet(...syncActions));

	//loadingURL = false;
}
export function NotifyURLLoaded() {
	loadingURL = false;
}

export function IsValidURL(str: string) {
	const urlClassProps = ["hash", "host", "hostname", "href", "origin", "password", "pathname", "port", "protocol", "search", "username"];

	const currentURL = window.location;
	var linkEl = document.createElement("a");
	linkEl.href = str;
	if (linkEl.host == null) return false;

	const linkElUrlPropsDiffer = urlClassProps.find(key=>linkEl[key] != currentURL[key]) != null;
	if (!linkElUrlPropsDiffer) return false;

	return true;
}