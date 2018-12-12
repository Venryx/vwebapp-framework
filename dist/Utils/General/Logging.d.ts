export declare class LogTypes {
    nodeRenders: boolean;
    nodeRenders_for: number;
    nodeRenderDetails: boolean;
    nodeRenderDetails_for: number;
    pageViews: boolean;
    urlLoads: boolean;
    cacheUpdates: boolean;
    commands: boolean;
}
declare global {
    var logTypes: LogTypes;
}
declare global {
    function ShouldLog(shouldLogFunc: (logTypes: LogTypes) => boolean): any;
}
declare global {
    function MaybeLog(shouldLogFunc: (logTypes: LogTypes) => boolean, logMessageGetter: () => string): any;
}
export declare var onLogFuncs: any[];
declare global {
    function Log(message: any, appendStackTrace?: boolean, logLater?: boolean): any;
}
export declare function Log(message: any, appendStackTrace?: boolean, logLater?: boolean): any;
declare global {
    function LogLater(message: any, appendStackTrace?: any): any;
}
export declare function LogLater(message: any, appendStackTrace?: boolean): void;
declare global {
    function LogWarning(message: any, appendStackTrace?: any, logLater?: any): any;
}
export declare function LogWarning(message: any, appendStackTrace?: boolean, logLater?: boolean): any;
declare global {
    function LogError(message: any, appendStackTrace?: any, logLater?: any): any;
}
export declare function LogError(message: any, appendStackTrace?: boolean, logLater?: boolean): any;
