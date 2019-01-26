import { GetDataAsync, GetAsync } from "../Utils/Database/DatabaseHelpers";
import {MergeDBUpdates, Command} from "./Command";

// todo: maybe remove
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