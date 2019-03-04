module.exports = {
	extends: [
		"vbase",
	],
	settings: {
		//"import/extensions": [".js", ".jsx", ".ts", ".tsx"],
		"import/resolver": {
			"webpack": {
				"config": "./webpack.config.js",
			},
			"node": {
				"paths": ["Source"],
				"extensions": [
				  ".js",
				  ".jsx",
				  ".ts",
				  ".tsx",
				]
			 }
		}
	},
	rules: {
	},
	globals: {
	},
};