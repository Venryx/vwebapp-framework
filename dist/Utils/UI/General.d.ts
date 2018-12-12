export declare type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
export declare function StandardCompProps(): string[];
export declare function ElementAcceptsTextInput(element: Element): boolean;
