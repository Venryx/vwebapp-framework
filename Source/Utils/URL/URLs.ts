import { GetCurrentURLString, VURL } from "js-vextensions";
import { manager } from "../../Manager";
import { MaybeLog } from "../General/Logging";
import { State_Base } from "../Store/StoreHelpers";

export function GetCurrentURL(fromAddressBar = false) {
	return fromAddressBar ? VURL.Parse(GetCurrentURLString()) : VURL.FromLocationObject(State_Base("router", "location"));
}
export function NormalizeURL(url: VURL) {
	let result = url.Clone();
	if (!manager.rootPages.Contains(result.pathNodes[0])) {
		result.pathNodes.Insert(0, "home");
	}
	if (result.pathNodes[1] == null && manager.rootPageDefaultChilds[result.pathNodes[0]]) {
		result.pathNodes.Insert(1, manager.rootPageDefaultChilds[result.pathNodes[0]]);
	}
	return result;
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
	let result = GetNewURL();

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

const pagesWithSimpleSubpages = ["home", "more", "write"].ToMap(page=>page, ()=>null);
export function GetSyncLoadActionsForURL(url: VURL, directURLChange: boolean) {
	return manager.GetSyncLoadActionsForURL(url, directURLChange);
}

// maybe temp; easier than using the "fromURL" prop, since AddressBarWrapper class currently doesn't have access to the triggering action itself
export var loadingURL = false;
export async function LoadURL(urlStr: string) {
	MaybeLog(a=>a.urlLoads, ()=>"Loading url: " + urlStr);
	loadingURL = true;

	//if (!GetPath(GetUrlPath(url)).startsWith("global/map")) return;
	let url = NormalizeURL(VURL.Parse(urlStr));

	let syncActions = GetSyncLoadActionsForURL(url, true);
	for (let action of syncActions) {
		manager.store.dispatch(action);
	}

	loadingURL = false;
}

// saving
// ==========

//g.justChangedURLFromCode = false;
export function GetNewURL() {
	return manager.GetNewURL();
}