import { Action } from "../General/Action";
export declare function CombineReducers(reducerMap: {
    [key: string]: (state: any, action: Action<any>) => any;
}): any;
export declare function CombineReducers(getInitialState: () => any, reducerMap: {
    [key: string]: (state: any, action: Action<any>) => any;
}): any;
export declare const emptyObj: {};
export declare const emptyArray: any[];
export declare const emptyArray_forLoading: any[];
