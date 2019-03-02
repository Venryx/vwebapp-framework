import {GetCurrentURLString, VURL} from "js-vextensions";
import {manager} from "../../Manager";
import {MaybeLog_Base} from "../General/Logging";
import {e} from "../../PrivateExports";

export function GetCurrentURL(fromAddressBar = false) {
	return fromAddressBar ? VURL.Parse(GetCurrentURLString()) : VURL.FromLocationObject(e.State_Base(...manager.routerLocationPathInStore));
}

/*export function GetCrawlerURLStrForMap(mapID: number) {
	let map = GetMap(mapID);
	if (map == null) return mapID.toString();

	let result = map.name.toLowerCase().replace(/[^a-z]/g, "-");
	// need to loop, in some cases, since regex doesn't reprocess "---" as two sets of "--".
	while (result.Contains("--")) {
		result = result.replace(/--/g, "-");
	}
	result = result.TrimStart("-").TrimEnd("-") + "." + map._id.toString();
	return result;
}

export function GetCrawlerURLStrForNode(node: MapNode) {
	let result = GetNodeDisplayText(node).toLowerCase().replace(/[^a-z]/g, "-");
	// need to loop, in some cases, since regex doesn't reprocess "---" as two sets of "--".
	while (result.Contains("--")) {
		result = result.replace(/--/g, "-");
	}
	result = result.TrimStart("-").TrimEnd("-") + "." + node._id.toString();
	return result;
}*/
export function GetCurrentURL_SimplifiedForPageViewTracking() {
	//let result = URL.Current();
	const result = manager.GetNewURL();

	/*let mapID = GetOpenMapID();
	let onMapPage = result.Normalized().toString({domain: false}).startsWith("/global/map");
	if (mapID && onMapPage) {
		let nodeID = GetFocusedNodeID(mapID);
		let node = nodeID ? GetNode(nodeID) : null;
		//if (result.pathNodes.length == 1) {
		/*if (result.Normalized().toString({domain: false}).startsWith("/global/map") && result.pathNodes.length == 1) {
			result.pathNodes.push("map");
		}*#/
		if (node) {
			result = result.Normalized();
			result.pathNodes.push(GetCrawlerURLStrForNode(node));
		}
}*/
	return result;
}

// loading
// ==========

// maybe temp; easier than using the "fromURL" prop, since AddressBarWrapper class currently doesn't have access to the triggering action itself
export var loadingURL = false;
export async function LoadURL(urlStr: string) {
	MaybeLog_Base(a=>a.urlLoads, ()=>`Loading url: ${urlStr}`);
	loadingURL = true;

	//if (!GetPath(GetUrlPath(url)).startsWith("global/map")) return;
	const url = VURL.Parse(urlStr);

	const syncActions = manager.GetSyncLoadActionsForURL(url, true);
	for (const action of syncActions) {
		manager.store.dispatch(action);
	}

	loadingURL = false;
}