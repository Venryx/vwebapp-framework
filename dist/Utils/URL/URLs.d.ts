import { VURL } from "js-vextensions";
export declare const rootPages: string[];
export declare const rootPageDefaultChilds: {
    more: string;
    home: string;
    tools: string;
};
export declare function GetCurrentURL(fromAddressBar?: boolean): VURL;
export declare function NormalizeURL(url: VURL): VURL;
