/// <reference types="react" />
interface HTMLElement {
    readonly R: React.Component;
}
interface Element {
    GetPageRect(): any;
}
declare function WaitTillDataPathIsSet(dataPath: string): Promise<{}>;
declare function WaitTillPropertyIsSet(obj: Object, prop: string): Promise<{}>;
