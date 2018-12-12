export declare function Global(target: Function): void;
export declare function Grab(grabFunc: any): (target: any) => any;
export declare function Debugger(...args: any[]): void;
export declare function Debugger_Wrap(arg1: any, ...args: any[]): any;
export declare function Debugger_True(...args: any[]): boolean;
export declare function Debugger_If(condition: any, ...args: any[]): void;
export declare function WrapWithDebugger(func: any, ...args: any[]): () => void;
export declare function QuickIncrement(name?: string): any;
declare global {
    function E<E1, E2, E3, E4, E5, E6, E7, E8>(e1?: E1, e2?: E2, e3?: E3, e4?: E4, e5?: E5, e6?: E6, e7?: E7, e8?: E8): E1 & E2 & E3 & E4 & E5 & E6 & E7 & E8;
}
export declare function E<E1, E2, E3, E4, E5, E6, E7, E8>(e1?: E1, e2?: E2, e3?: E3, e4?: E4, e5?: E5, e6?: E6, e7?: E7, e8?: E8): E1 & E2 & E3 & E4 & E5 & E6 & E7 & E8;
declare global {
    const eo: any;
}
export declare var inFirefox: boolean;
export declare var blockCSCalls: boolean;
export declare var loadTime: number;
export declare function GetTimeSinceLoad(): number;
export declare function $Simple(queryStr: any): HTMLElement[];
export declare function CopyText(text: any): void;
export declare function GetRandomNumber(options: {
    min: number;
    max: number;
    mustBeInteger?: boolean;
}): number;
