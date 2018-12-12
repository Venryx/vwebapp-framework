import { VURL } from "js-vextensions";
export declare function GetCurrentURL_SimplifiedForPageViewTracking(): VURL;
export declare function GetSyncLoadActionsForURL(url: VURL, directURLChange: boolean): any[];
export declare var loadingURL: boolean;
export declare function LoadURL(urlStr: string): Promise<void>;
export declare function GetNewURL(includeMapViewStr?: boolean): VURL;
