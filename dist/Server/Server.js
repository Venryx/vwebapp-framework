"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ajv_1 = require("ajv");
var ajv_keywords_1 = require("ajv-keywords");
exports.ajv = ajv_keywords_1.default(new ajv_1.default());
G({ ajv: exports.ajv });
G({ Schema: Schema });
function Schema(schema) {
    schema = E({ additionalProperties: false }, schema);
    return schema;
}
exports.Schema = Schema;
G({ AddSchema: AddSchema });
var schemaJSON = {};
function AddSchema(schema, name) {
    schema = Schema(schema);
    schemaJSON[name] = schema;
    exports.ajv.removeSchema(name); // for hot-reloading
    var result = exports.ajv.addSchema(schema, name);
    if (schemaAddListeners[name]) {
        for (var _i = 0, _a = schemaAddListeners[name]; _i < _a.length; _i++) {
            var listener = _a[_i];
            listener();
        }
        delete schemaAddListeners[name];
    }
    return result;
}
exports.AddSchema = AddSchema;
function GetSchemaJSON(name) {
    return schemaJSON[name];
}
exports.GetSchemaJSON = GetSchemaJSON;
var schemaAddListeners = {};
function WaitTillSchemaAddedThenRun(schemaName, callback) {
    // if schema is already added, run right away
    if (exports.ajv.getSchema(schemaName)) {
        callback();
        return;
    }
    schemaAddListeners[schemaName] = (schemaAddListeners[schemaName] || []).concat(callback);
}
exports.WaitTillSchemaAddedThenRun = WaitTillSchemaAddedThenRun;
/*AJV.prototype.AddSchema = function(this: AJV_Extended, schema, name: string) {
    return `${this.errorsText()} (${ToJSON(this.errors)})`;
};*/
ajv_1.default.prototype.FullErrorsText = function () {
    return this.errorsText() + "\n\nDetails: " + ToJSON(this.errors, null, 3) + "\n";
};
// validation
// ==========
function AssertValidate(schemaName, data, failureMessageOrGetter, addErrorsText, addDataStr) {
    if (addErrorsText === void 0) { addErrorsText = true; }
    if (addDataStr === void 0) { addDataStr = true; }
    var validationResult = exports.ajv.validate(schemaName, data);
    if (validationResult == true)
        return;
    var errorsText = exports.ajv.FullErrorsText();
    var failureMessage = IsString(failureMessageOrGetter) ? failureMessageOrGetter : failureMessageOrGetter(errorsText);
    if (addErrorsText) {
        failureMessage += ": " + errorsText;
    }
    if (addDataStr) {
        failureMessage += "\nData: " + ToJSON(data, null, 3);
    }
    failureMessage += "\n";
    Assert(validationResult, failureMessage);
}
exports.AssertValidate = AssertValidate;
//# sourceMappingURL=Server.js.map