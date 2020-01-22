import fs from "fs-extra";
import debug_base from "debug";
import {StartWebpackCompiler} from "../Build/WebpackCompiler";

import webpack = require("webpack");

declare const {CreateConfig}: typeof import("../Config");
const debug = debug_base("app:bin:compile");

export function Compile(config: ReturnType<typeof CreateConfig>, webpackConfig: webpack.Configuration) {
	const paths = config.utils_paths;
	debug("Starting compiler.");
	return Promise.resolve()
		.then(()=>StartWebpackCompiler(config, webpackConfig))
		.then(stats=>{
			if (stats.warnings.length && config.compiler_fail_on_warning) {
				throw new Error("Config set to fail on warning, exiting with status code '1'.");
			}
			debug("Copying resources to Dist folder.");
			// fs.copySync(paths.source("Resources"), paths.dist());
			fs.copySync(paths.base("Resources"), paths.dist());
		})
		.then(()=>{
			debug("Compilation completed successfully.");
		})
		.catch(err=>{
			debug("Compiler encountered an error.", err);
			process.exit(1);
		});
}