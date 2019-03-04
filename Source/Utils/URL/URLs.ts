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

	loadingURL = false;
}