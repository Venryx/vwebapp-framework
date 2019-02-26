import { ApplyDBUpdates, RemoveHelpers, DBPath, ApplyDBUpdates_InChunks, maxDBUpdatesPerBatch } from "../Utils/Database/DatabaseHelpers";
import { manager } from "../Manager";
import u from "updeep";
import {MaybeLog_Base} from "../Utils/General/Logging";

export class CommandUserInfo {
	id: string;
}

export let commandsWaitingToComplete = [];

export let currentCommandRun_listeners = null;
export async function WaitTillCurrentCommandFinishes() {
	return new Promise((resolve, reject)=> {
		currentCommandRun_listeners.push({resolve, reject});
	});
}
export function OnCurrentCommandFinished() {
	let currentCommandRun_listeners_copy = currentCommandRun_listeners;
	currentCommandRun_listeners = null;
	for (let listener of currentCommandRun_listeners_copy) {
		listener.resolve();
	}
}

export abstract class Command<Payload, ReturnData = void> {
	static defaultPayload = {};
	constructor(payload: Payload) {
		this.userInfo = { id: manager.GetUserID() }; // temp		
		this.type = this.constructor.name;
		this.payload = E(this.constructor['defaultPayload'], payload);
	}
	userInfo: CommandUserInfo;
	type: string;
	payload: Payload;
	returnData;

	// these methods are executed on the server (well, will be later)
	// ==========

	// parent commands should call MarkAsSubcommand() immediately after setting a subcommand's payload
	asSubcommand = false;
	MarkAsSubcommand() {
		this.asSubcommand = true;
		this.Validate_Early();
		return this;
	}

	/** [sync] Validates the payload data. (ie. the validation that doesn't require accessing the database) */
	Validate_Early() {}
	/** [async] Transforms the payload data, combines it with database data, and so on, in preparation for the database-updates-map construction. */
	abstract Prepare(): Promise<void>
	/** [async] Validates the prepared data, mostly using ajv shape-validation. */
	abstract Validate(): Promise<void>
	/** [sync] Retrieves the actual database updates that are to be made. (so we can do it in one atomic call) */
	abstract GetDBUpdates(): {}

	async PreRun() {
		RemoveHelpers(this.payload); // have this run locally, before sending, to save on bandwidth
		this.Validate_Early();
		await this.Prepare();
		await this.Validate();
	}

	/** [async] Validates the data, prepares it, and executes it -- thus applying it into the database. */
	async Run(maxUpdatesPerChunk = maxDBUpdatesPerBatch): Promise<ReturnData> {
		if (commandsWaitingToComplete.length > 0) {
			MaybeLog_Base(a => a.commands, l => l(`Queing command, since ${commandsWaitingToComplete.length} ${commandsWaitingToComplete.length == 1 ? "is" : "are"} already waiting for completion.${""
				}@type:`, this.constructor.name, ' @payload(', this.payload, ')'));
		}
		commandsWaitingToComplete.push(this);
		while (currentCommandRun_listeners) {
			await WaitTillCurrentCommandFinishes();
		}
		currentCommandRun_listeners = [];

		MaybeLog_Base(a => a.commands, l => l('Running command. @type:', this.constructor.name, ' @payload(', this.payload, ')'));

		try {
			await this.PreRun();

			const dbUpdates = this.GetDBUpdates();
			//await this.Validate_LateHeavy(dbUpdates);
			// FixDBUpdates(dbUpdates);
			// await store.firebase.helpers.DBRef().update(dbUpdates);
			await ApplyDBUpdates_InChunks(DBPath(), dbUpdates, maxUpdatesPerChunk);

			// MaybeLog(a=>a.commands, ()=>`Finishing command. @type:${this.constructor.name} @payload(${ToJSON(this.payload)}) @dbUpdates(${ToJSON(dbUpdates)})`);
			MaybeLog_Base(a => a.commands, l => l('Finishing command. @type:', this.constructor.name, ' @command(', this, ') @dbUpdates(', dbUpdates, ')'));
		} finally {
			commandsWaitingToComplete.Remove(this);
			OnCurrentCommandFinished();
		}

		// later on (once set up on server), this will send the data back to the client, rather than return it
		return this.returnData;
	}
}

/*type Update = {path: string, data: any};
function FixDBUpdates(updatesMap) {
	let updates = updatesMap.Props().map(prop=>({path: prop.name, data: prop.value}));
	for (let update of updates) {
		let otherUpdatesToMergeIntoThisOne: Update[] = updates.filter(update2=> {
			return update2.path.startsWith(update.path);
		});
		for (let updateToMerge of otherUpdatesToMergeIntoThisOne) {
			delete updates[updateToMerge.path];

			let updateToMerge_relativePath = updateToMerge.path.substr(0, update.path.length);
			update.data = u.updateIn(updateToMerge_relativePath, constant(updateToMerge.data), update.data)
		}
	}
}*/
type Update = {path: string, data: any};
export function MergeDBUpdates(baseUpdatesMap, updatesToMergeMap) {
	let baseUpdates = baseUpdatesMap.Props().map(prop=>({path: prop.name, data: prop.value})) as Update[];
	let updatesToMerge = updatesToMergeMap.Props().map(prop=>({path: prop.name, data: prop.value})) as Update[];

	for (let update of updatesToMerge) {
		// if an update-to-merge exists for a path, remove any base-updates starting with that path (since the to-merge ones have priority)
		if (update.data == null) {
			for (let update2 of baseUpdates.slice()) { // make copy, since Remove() seems to break iteration otherwise
				if (update2.path.startsWith(update.path)) {
					baseUpdates.Remove(update2);
				}
			}
		}
	}

	let finalUpdates = [] as Update[];
	for (let update of baseUpdates) {
		let updatesToMergeIntoThisOne: Update[] = updatesToMerge.filter(update2=> {
			return update2.path.startsWith(update.path);
		});
		for (let updateToMerge of updatesToMergeIntoThisOne) {
			let updateToMerge_relativePath = updateToMerge.path.substr(`${update.path}/`.length);

			//if (updateToMerge.data) {
			// assume that the update-to-merge has priority, so have it completely overwrite the data at its path
			update.data = u.updateIn(updateToMerge_relativePath.replace(/\//g, "."), u.constant(updateToMerge.data), update.data);
			/*} else {
				update.data = null;
			}*/

			// remove from updates-to-merge list (since we just merged it)
			updatesToMerge.Remove(updateToMerge);
		}

		finalUpdates.push(update);
	}

	// for any "update to merge" which couldn't be merged into one of the base-updates, just add it as its own update (it won't clash with the others)
	for (let update of updatesToMerge) {
		finalUpdates.push(update);
	}

	let finalUpdatesMap = finalUpdates.reduce((result, current)=>result.VSet(current.path, current.data), {});
	return finalUpdatesMap;
}