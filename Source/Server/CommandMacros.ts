import { GetDataAsync, GetAsync } from "../Utils/Database/DatabaseHelpers";
import {MergeDBUpdates, Command} from "./Command";

export function MapEdit(target: Function) {
	let oldPrepare = target.prototype.Prepare;
	target.prototype.Prepare = async function() {
		await oldPrepare.apply(this);
		if (this.payload.mapID) {
			this.map_oldEditCount = ToInt(await GetDataAsync({addHelpers: false}, "maps", this.payload.mapID, ".edits"), 0);
		}
	};

	let oldGetDBUpdates = target.prototype.GetDBUpdates;
	target.prototype.GetDBUpdates = function() {
		let updates = oldGetDBUpdates.apply(this);
		let newUpdates = {};
		if (this.payload.mapID) {
			newUpdates[`maps/${this.payload.mapID}/.edits`] = this.map_oldEditCount + 1;
			newUpdates[`maps/${this.payload.mapID}/.editedAt`] = Date.now();
		}
		return MergeDBUpdates(updates, newUpdates);
	}
}

// todo: maybe remove (kinda redundant vs UndoableAction)
export function UserEdit(target: Function) {
	let oldPrepare = target.prototype.Prepare;
	target.prototype.Prepare = async function() {
		await oldPrepare.apply(this);
		this.user_oldEditCount = ToInt(await GetDataAsync({addHelpers: false}, "userExtras", this.userInfo.id, ".edits"), 0);
	};

	let oldGetDBUpdates = target.prototype.GetDBUpdates;
	target.prototype.GetDBUpdates = function() {
		let updates = oldGetDBUpdates.apply(this);
		let newUpdates = {};
		newUpdates[`userExtras/${this.userInfo.id}/.edits`] = this.user_oldEditCount + 1;
		newUpdates[`userExtras/${this.userInfo.id}/.lastEditAt`] = Date.now();
		return MergeDBUpdates(updates, newUpdates);
	}
}