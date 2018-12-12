export declare type Omit<T, K extends keyof T> = Pick<T, ({
    [P in keyof T]: P;
} & {
    [P in K]: never;
})[keyof T]>;
export declare class Manager {
    Populate(data: Omit<Manager, "Populate">): void;
    logTypes: any;
    store: any;
    globalConnectorPropGetters: {
        [key: string]: (state: any, props: any) => any;
    };
    PostHandleError: (error: Error, errorStr: string) => any;
}
export declare const manager: Manager;
export declare let OnPopulated_listeners: any[];
export declare function OnPopulated(listener: () => any): void;
declare global {
    function Log(message: any, appendStackTrace?: boolean, logLater?: boolean): any;
}
