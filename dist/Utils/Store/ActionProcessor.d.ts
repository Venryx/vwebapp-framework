import { Action } from "../General/Action";
import { RootState } from "../../Store/index";
import { VURL } from "js-vextensions";
export declare function PreDispatchAction(action: Action<any>): void;
export declare function MidDispatchAction(action: Action<any>, newState: RootState): void;
export declare function DoesURLChangeCountAsPageChange(oldURL: VURL, newURL: VURL, directURLChange: boolean): boolean;
export declare function RecordPageView(url: VURL): void;
export declare function PostDispatchAction(action: Action<any>): Promise<void>;
