import {GetCurrentURLString, VURL, DeepGet, ModifyString} from "js-vextensions";
import {runInAction} from "mobx";
import {manager} from "../../Manager";
import {e} from "../../PrivateExports";
import {ActionFunc} from "../Store/MobX";
import {RootStore} from "../../UserTypes";

export class Page {
	constructor(initialData?: Partial<Page>, children?: {[key: string]: Page}) {
		if (initialData) this.VSet(initialData);
		if (children) {
			for (const {key, value: child} of children.Pairs()) {
				if (child.key == null) child.key = key;
				if (child.title == null) child.title = ModifyString(child.key, m=>[m.startLower_to_upper]);
			}
			this.children = children;
		}
	}

	key: string;
	title: string;
	simpleSubpages? = true;
	/** Action performed (within MobX action) when nav-bar entry is clicked, but page/subpage is already active. */
	// note: for now user-project must implement this, within NavBarPageButton and SubNavBarButton classes (see LF repo for example)
	actionIfActive?: ActionFunc<RootStore>;

	children?: {[key: string]: Page};
	get ChildKeys() { return Object.keys(this.children); }
	get DefaultChild() { return this.children?.Pairs()[0].key; }
}

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