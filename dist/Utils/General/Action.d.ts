export declare class Action<Payload> {
    constructor(payload: Payload);
    type: string;
    payload: Payload;
    Is<Payload2>(actionType: new (..._: any[]) => Action<Payload2>): this is Action<Payload2>;
    IsAny(...actionTypes: (new (..._: any[]) => Action<any>)[]): boolean;
}
export declare function IsACTSetFor(action: Action<any>, path: string): boolean;
