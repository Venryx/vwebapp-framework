import {GetCurrentURLString, VURL, DeepGet} from "js-vextensions";
import {runInAction} from "mobx";
import {manager} from "../../Manager";
import {e} from "../../PrivateExports";

/*export function GetCurrentURL(fromAddressBar = false) {
	if (fromAddressBar) return VURL.Parse(GetCurrentURLString());
	const locationObj = DeepGet(manager.store, manager.routerLocationPathInStore);
	return VURL.FromLocationObject(locationObj);
}*/
export function GetCurrentURL() {
	return VURL.Parse(GetCurrentURLString());
}

export let loadingURL = false;
export function LoadURL(url: VURL) {
	e.MaybeLog(a=>a.urlLoads, ()=>`Loading url: ${url.toString()}`);
	loadingURL = true;

	//if (!GetPath(GetUrlPath(url)).startsWith("global/map")) return;
	/*const syncActions = manager.GetLoadActionsForURL(url);
	manager.store.dispatch(new e.ActionSet(...syncActions));*/

	const actionFunc = manager.GetLoadActionFuncForURL(url);
	runInAction("LoadURL", ()=>actionFunc(manager.store));

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