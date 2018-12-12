import { RootState } from "../../Manager";

export var State_overrides = {
	state: null as RootState,
	countAsAccess: null,
};

export class State_Options {
	state?: RootState;
	countAsAccess?: boolean;
}