// we need to export something so that we can use "export * from ..." approach (thus having this file accessed prior to "export MyOverrideFunction" calls)
export const defineProperty_orig = Object.defineProperty;
Object.defineProperty = function(o, p, attributes) {
	let attributes_final = attributes;
	const isWebpackExport = Object.keys(attributes).length == 2 && attributes.enumerable == true && attributes.get && attributes.get.toString().match(/return _.+\[key\];/);
	if (isWebpackExport) {
		// add an empty setter, just so that the export-override calls don't error
		attributes_final = E(attributes, {set: ()=>{}, configurable: true});
	}
	defineProperty_orig.call(this, o, p, attributes_final);
};