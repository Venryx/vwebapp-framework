export declare function GetEntries(enumType: any, nameModifierFunc?: (name: string) => string): {
    name: string;
    value: number;
}[];
export declare function GetValues<T>(enumType: any): T[];
export declare function GetValues_ForSchema<T>(enumType: any): {
    const: {};
}[];
