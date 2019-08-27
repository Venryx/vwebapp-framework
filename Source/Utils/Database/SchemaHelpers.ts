import AJV from "ajv";
import AJVKeywords from "ajv-keywords";
import {Clone, ToJSON, IsString, Assert, IsObject} from "js-vextensions";
import {RemoveHelpers} from "./DatabaseHelpers";

export const ajv = AJVKeywords(new AJV({allErrors: true})) as AJV_Extended;

export function Schema(schema) {
	schema = E({additionalProperties: false}, schema);
	return schema;
}

const schemaJSON = {};
export function AddSchema(schema, name: string) {
	schema = Schema(schema);
	schemaJSON[name] = schema;
	ajv.removeSchema(name); // for hot-reloading
	const result = ajv.addSchema(schema, name);

	if (schemaAddListeners[name]) {
		for (const listener of schemaAddListeners[name]) {
			listener();
		}
		delete schemaAddListeners[name];
	}

	return result;
}

export function GetSchemaJSON(name: string): any {
	return Clone(schemaJSON[name]);
}

/*export type DataWrapper<T> = {data: T};
export function DataWrapper(dataSchema: any) {
	return {
		properties: {
			data: dataSchema,
		},
		required: ['data'],
	};
}
export function WrapData<T>(data: T) {
	return { data } as DataWrapper<T>;
}*/

var schemaAddListeners = {};
export function WaitTillSchemaAddedThenRun(schemaName: string, callback: ()=>void) {
	// if schema is already added, run right away
	if (ajv.getSchema(schemaName)) {
		callback();
		return;
	}
	schemaAddListeners[schemaName] = (schemaAddListeners[schemaName] || []).concat(callback);
}

type AJV_Extended = AJV.Ajv & {
	// AddSchema(schema, name: string): void;
	FullErrorsText(): string;
};
/* AJV.prototype.AddSchema = function(this: AJV_Extended, schema, name: string) {
	return `${this.errorsText()} (${ToJSON(this.errors)})`;
}; */
AJV.prototype.FullErrorsText = function(this: AJV_Extended) {
	return `${this.errorsText()}

Details: ${ToJSON(this.errors, null, 3)}
`;
};

// validation
// ==========

export const ajvExtraChecks = {}; // schemaName -> $index -> $validationFunc
export function AddAJVExtraCheck(schemaName: string, extraCheckFunc: (item: any)=>string) {
	ajvExtraChecks[schemaName] = ajvExtraChecks[schemaName] || [];
	ajvExtraChecks[schemaName].push(extraCheckFunc);
}
export function ValidateAJVExtraChecks(schemaName: string, data) {
	if (ajvExtraChecks[schemaName] == null) return null;
	for (const extraCheck of ajvExtraChecks[schemaName]) {
		const errorMessage = extraCheck(data);
		if (errorMessage) return errorMessage;
	}
}

/** Returns null if the supplied data matches the schema. Else, returns error message. */
export function Validate(schemaName: string, data, removeHelpers = true) {
	return Validate_Full(GetSchemaJSON(schemaName), schemaName, data, removeHelpers);
}
/** Returns null if the supplied data matches the schema. Else, returns error message. */
export function Validate_Full(schemaObject: Object, schemaName: string, data, removeHelpers = true) {
	if (removeHelpers) {
		data = RemoveHelpers(Clone(data));
	}

	if (data == null) return "Data is null/undefined!";

	const passed = ajv.validate(schemaObject, data);
	if (!passed) return ajv.FullErrorsText();

	// additional, non-ajv checks
	if (schemaName) {
		return ValidateAJVExtraChecks(schemaName, data);
	}
}

export class AssertValidateOptions {
	addErrorsText = true;
	addDataStr = true;
	allowOptionalPropsToBeNull = true;
}
export function AssertValidate(schemaName: string, data, failureMessageOrGetter: string | ((errorsText: string)=>string), options = new AssertValidateOptions()) {
	return AssertValidate_Full(GetSchemaJSON(schemaName), schemaName, data, failureMessageOrGetter, options);
}
export function AssertValidate_Full(schemaObject: Object, schemaName: string, data, failureMessageOrGetter: string | ((errorsText: string)=>string), options?: Partial<AssertValidateOptions>) {
	options = E(new AssertValidateOptions(), options);
	if (options.allowOptionalPropsToBeNull) {
		schemaObject = Schema_WithOptionalPropsAllowedNull(schemaObject);
	}

	const errorsText = Validate_Full(schemaObject, schemaName, data, false);

	let failureMessage = IsString(failureMessageOrGetter) ? failureMessageOrGetter : failureMessageOrGetter(errorsText);
	if (options.addErrorsText) {
		failureMessage += `: ${errorsText}`;
	}
	if (options.addDataStr) {
		failureMessage += `\nData: ${ToJSON(data, null, 3)}`;
	}
	failureMessage += "\n";

	Assert(errorsText == null, failureMessage);
}

export function Schema_WithOptionalPropsAllowedNull(schema: any) {
	const result = Clone(schema);
	for (const {key: propName, value: propSchema} of (result.properties || {}).Pairs()) {
		const propOptional = result.required == null || !result.required.Contains(propName);
		if (propOptional && propSchema.type) {
			propSchema.type = IsString(propSchema.type) ? ["null", propSchema.type] : ["null"].concat(propSchema.type).Distinct();
		}
	}
	return result;
}

/*export function GetInvalidPropPaths(obj: Object, schemaObj: Object, checkForExtraneous = true, checkForNotMatching = true, ignoreParentsOfInvalids = true) {
	Assert(IsObject(schemaObj), "schemaObj must be an object. (eg. result from GetSchemaJSON)");
	const result = [];
	for (const pair of obj.Pairs()) {
		const propSchema_raw = (schemaObj["properties"] || {})[pair.key];
		const propSchema = propSchema_raw && propSchema_raw["$ref"] ? GetSchemaJSON(propSchema_raw["$ref"]) : propSchema_raw;

		const selfInvalid =
			(checkForExtraneous && propSchema == null) ||
			(checkForNotMatching && propSchema && Validate_Full(propSchema, null, pair.value) != null);

		// if object (and we have schema-data available for this level), look for invalid prop-paths within it
		if (IsObject(pair.value) && propSchema) {
			const subResults = GetInvalidPropPaths(pair.value, propSchema);
			if (!ignoreParentsOfInvalids || subResults.length == 0) result.push(pair.key);
			result.push(...subResults.map(subPath=>`${pair.key}/${subPath}`));
		} else {
			if (selfInvalid) result.push(pair.key);
		}
	}
	return result;
}*/
export function GetInvalidPropPaths(data: Object, schemaObject: Object) {
	const passed = ajv.validate(schemaObject, data);
	if (passed) return [];

	return ajv.errors.map(error=>{
		let propPath = error.dataPath
			.replace(/^\./, "") // remove starting dot
			.replace(/[.[\]]/g, "/") // replace instances of ".", "[", and "]" with "/"
			.replace(/\/+/g, "/"); // collapse each sequence of "/" into a single "/" (can be caused by: "arrayProp[0].prop" -> "arrayProp/0//prop")
		if (error.keyword == "additionalProperties") {
			propPath += `/${error.params["additionalProperty"]}`;
		}
		return {propPath, error};
	});
}