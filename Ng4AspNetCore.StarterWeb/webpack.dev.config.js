﻿const path = require('path');
const ProgressPlugin = require('webpack/lib/ProgressPlugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const autoprefixer = require('autoprefixer');
const postcssUrl = require('postcss-url');

const { NoEmitOnErrorsPlugin, LoaderOptionsPlugin } = require('webpack');
const { GlobCopyWebpackPlugin, BaseHrefWebpackPlugin, SuppressExtractedTextChunksWebpackPlugin } = require('@angular/cli/plugins/webpack');
const { CommonsChunkPlugin } = require('webpack').optimize;
const { AotPlugin } = require('@ngtools/webpack');

const nodeModules = path.join(process.cwd(), 'node_modules');
const entryPoints = ["inline", "polyfills", "sw-register", "styles", "vendor", "main"];
const baseHref = undefined;
const deployUrl = undefined;




module.exports = function () {
	return {
		"output": {
			"path": path.join(process.cwd(), "wwwroot\\dist"),
			"filename": "[name].bundle.js",
			"chunkFilename": "[id].chunk.js",
			"publicPath": "/dist/"
		},
		"plugins": [
			new NoEmitOnErrorsPlugin(),
			new GlobCopyWebpackPlugin({
				"patterns": [
					"assets",
					"favicon.ico"
				],
				"globOptions": {
					"cwd": path.join(process.cwd(), "ClientApp"),
					"dot": true,
					"ignore": "**/.gitkeep"
				}
			}),
			new ProgressPlugin(),
			new CommonsChunkPlugin({
				"name": "inline",
				"minChunks": null
			}),
			new CommonsChunkPlugin({
				"name": "vendor",
				"minChunks": (module) => module.resource && module.resource.startsWith(nodeModules),
				"chunks": [
					"main"
				]
			}),
			new ExtractTextPlugin({
				"filename": "[name].bundle.css",
				"disable": false
			}),
			new LoaderOptionsPlugin({
				"sourceMap": true,
				"options": {
					"postcss": [
						autoprefixer(),
						postcssUrl({
							"url": (URL) => {
								// Only convert root relative URLs, which CSS-Loader won't process into require().
								if (!URL.startsWith('/') || URL.startsWith('//')) {
									return URL;
								}
								if (deployUrl.match(/:\/\//)) {
									// If deployUrl contains a scheme, ignore baseHref use deployUrl as is.
									return `${deployUrl.replace(/\/$/, '')}${URL}`;
								}
								else if (baseHref.match(/:\/\//)) {
									// If baseHref contains a scheme, include it as is.
									return baseHref.replace(/\/$/, '') +
										`/${deployUrl}/${URL}`.replace(/\/\/+/g, '/');
								}
								else {
									// Join together base-href, deploy-url and the original URL.
									// Also dedupe multiple slashes into single ones.
									return `/${baseHref}/${deployUrl}/${URL}`.replace(/\/\/+/g, '/');
								}
							}
						})
					],
					"sassLoader": {
						"sourceMap": true,
						"includePaths": []
					},
					"lessLoader": {
						"sourceMap": true
					},
					"context": ""
				}
			}),
			new SuppressExtractedTextChunksWebpackPlugin(),
			new AotPlugin({
				"mainPath": "main.ts",
				"hostReplacementPaths": {
					"environments\\environment.ts": "environments\\environment.ts"
				},
				"exclude": [],
				"tsConfigPath": "ClientApp\\tsconfig.app.json"
			})
		]
	};
}