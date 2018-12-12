export declare var onLogFuncs: any[];
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
