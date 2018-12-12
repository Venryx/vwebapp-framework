export declare class Enum {
    static Deserialize: any;
    static _IsEnum: number;
    static entries: Enum[];
    static names: string[];
    static values: number[];
    static options: {
        name: any;
        value: any;
    }[];
    constructor(name: string, value: number);
    name: string;
    /** ie index */ value: number;
    toString(): string;
}
export declare function _Enum(target: any): void;
export declare function GetEntries(enumType: any, nameModifierFunc?: (name: string) => string): {
    name: string;
    value: number;
}[];
export declare function GetValues<T>(enumType: any): T[];
export declare function GetValues_ForSchema<T>(enumType: any): {
    const: {};
}[];
