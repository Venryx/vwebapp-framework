import { RootState_Base } from "../../Manager";

export var State_overrides = {
	state: null as RootState_Base,
	countAsAccess: null,
};

export class State_Options {
	state?: RootState_Base;
	countAsAccess?: boolean;
}