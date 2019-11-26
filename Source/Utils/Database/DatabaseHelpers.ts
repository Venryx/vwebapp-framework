import {Assert, IsString} from "js-vextensions";
import {manager, SplitStringBySlash_Cached} from "../..";

export function VPathToFBPath(vPath: string) {
	return vPath != null ? vPath.replace(/\/\./g, ".") : null;
}
export function FBPathToVPath(fbPath: string) {
	return fbPath != null ? fbPath.replace(/\./g, "/.") : null;
}
export function VFieldPathToFBFieldPath(vFieldPath: string) {
	return vFieldPath != null ? vFieldPath.replace(/\//g, ".") : null;
}
export function FBFieldPathToVFieldPath(vFieldPath: string) {
	return vFieldPath != null ? vFieldPath.replace(/\./g, "/") : null;
}

/**
 * @param asFBPath If true, returned paths are separated with "."; if false, by "/". Default: false
 * @returns [colOrDocPath, fieldPathInDoc]
 * */
export function GetPathParts(path: string, asFBPath = false): [string, string] {
	let colOrDocPath = path.substr(0, path.indexOf("/.").IfN1Then(path.length));
	const isDocPath = colOrDocPath.length != path.length; // if length differs, it means field-path is supplied, which means it's a doc-path
	if (isDocPath) {
		Assert(SplitStringBySlash_Cached(colOrDocPath).length % 2 == 0, `Segment count in docPath (${colOrDocPath}) must be multiple of 2.`);
	}

	let fieldPathInDoc = colOrDocPath.length < path.length ? path.substr(colOrDocPath.length + 2).replace(/\./g, "") : null;
	if (asFBPath) {
		[colOrDocPath, fieldPathInDoc] = [VPathToFBPath(colOrDocPath), VFieldPathToFBFieldPath(fieldPathInDoc)];
	}
	return [colOrDocPath, fieldPathInDoc];
}

export function DBPath(path = "", inVersionRoot = true) {
	Assert(path != null, "Path cannot be null.");
	Assert(IsString(path), "Path must be a string.");
	/*let versionPrefix = path.match(/^v[0-9]+/);
	if (versionPrefix == null) // if no version prefix already, add one (referencing the current version)*/
	if (inVersionRoot) {
		path = `versions/v${manager.dbVersion}-${manager.db_short}${path ? `/${path}` : ""}`;
	}
	return path;
}
export function DBPathSegments(pathSegments: (string | number)[], inVersionRoot = true) {
	let result = pathSegments;
	if (inVersionRoot) {
		result = (["versions", `v${manager.dbVersion}-${manager.db_short}`] as any).concat(result);
	}
	return result;
}

export function SlicePath(path: string, removeFromEndCount: number, ...itemsToAdd: string[]) {
	//let parts = path.split("/");
	const parts = SplitStringBySlash_Cached(path).slice();
	parts.splice(parts.length - removeFromEndCount, removeFromEndCount, ...itemsToAdd);
	if (parts.length == 0) return null;
	return parts.join("/");
}