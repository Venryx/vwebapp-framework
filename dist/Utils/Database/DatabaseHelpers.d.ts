export declare class Imports {
    dbVersion: any;
    env_short: any;
    __DEV__: any;
    State: any;
    firestoreDB: any;
    g: any;
    store: any;
    firebase: any;
    SplitStringBySlash_Cached: any;
    DeepGet: any;
    DeepSet: any;
    GetTreeNodesInObjTree: any;
    ShallowChanged: any;
    ClearRequestedPaths: any;
    GetRequestedPaths: any;
    RequestPath: any;
    SetListeners: any;
    UnsetListeners: any;
}
export declare function VInit_DatabaseHelpers(imports: Imports): void;
export declare function IsAuthValid(auth: any): boolean;
export declare function VPathToFBPath(vPath: string): string;
export declare function FBPathToVPath(fbPath: string): string;
export declare function VFieldPathToFBFieldPath(vFieldPath: string): string;
export declare function FBFieldPathToVFieldPath(vFieldPath: string): string;
export declare function GetPathParts(path: string, asFBPath?: boolean): string[];
export declare function DBPath(path?: string, inVersionRoot?: boolean): string;
export declare function DBPathSegments(pathSegments: (string | number)[], inVersionRoot?: boolean): (string | number)[];
export declare function PathToListenerPath(path: string): any;
export declare function ListenerPathToPath(listenerPath: any): string;
export declare function SlicePath(path: string, removeFromEndCount: number, ...itemsToAdd: string[]): any;
export declare function ProcessDBData(data: any, standardizeForm: boolean, addHelpers: boolean, rootKey: string): any;
/** Note: this mutates the original object. */
export declare function RemoveHelpers(data: any): any;
export declare class GetData_Options {
    inVersionRoot?: boolean;
    makeRequest?: boolean;
    useUndefinedForInProgress?: boolean;
    queries?: any;
}
/** Begins request to get data at the given path in the Firebase database.
 *
 * Returns undefined when the current-data for the path is null/non-existent, but a request is in-progress.
 * Returns null when we've completed the request, and there is no data at that path. */
export declare function GetData(...pathSegments: (string | number)[]): any;
export declare function GetData(options: GetData_Options, ...pathSegments: (string | number)[]): any;
export declare class GetDataAsync_Options {
    inVersionRoot?: boolean;
    addHelpers?: boolean;
}
export declare function GetDataAsync(...pathSegments: (string | number)[]): any;
export declare function GetDataAsync(options: GetDataAsync_Options, ...pathSegments: (string | number)[]): any;
export declare function GetAsync<T>(dbGetterFunc: () => T, statsLogger?: ({ requestedPaths: string }: {
    requestedPaths: any;
}) => void): Promise<T>;
export declare function GetAsync_Raw<T>(dbGetterFunc: () => T, statsLogger?: ({ requestedPaths: string }: {
    requestedPaths: any;
}) => void): Promise<T>;
export declare function WaitTillPathDataIsReceived(path: string): Promise<any>;
export declare function ApplyDBUpdates(rootPath: string, dbUpdates: Object): Promise<void>;
