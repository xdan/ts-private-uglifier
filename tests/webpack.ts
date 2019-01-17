import * as webpack from "webpack";
import * as path from "path";
import {privateTransformer} from "../index";
import * as fs from "fs";
import {expect} from "chai";

describe('Run plugin from webpack config', () => {
	describe('Awesome TypeScript Loader', () => {

		it('should work like as usual mode', (done) => {
			const options = {
				entry: path.join(__dirname, 'data/A.ts'),
				output: {
					path: path.join(__dirname, 'build'),
				},
				resolve: {
					extensions: [".ts", ".d.ts", ".js"]
				},
				optimization: {
					minimize: false,
				},
				module: {
					rules: [
						{
							test: /\.(ts)$/,
							loader: 'awesome-typescript-loader',
							exclude: /(node_modules|bower_components)/,
							options: {
								getCustomTransformers: () => privateTransformer
							}
						}
					]
				},
			};

			webpack(options, (err, stats) => {
				if (err) return done(err);
				stats = stats.toJson({
					errorDetails: true
				});
				if (stats.errors.length > 0) {
					return done(new Error(stats.errors[0]));
				}

				let result = fs.readFileSync(path.join(__dirname, 'build/main.js'), 'utf8');

				result = result.substr(result.indexOf("use strict") - 1).replace(/^\n/mg, '')
				result = result.substr(0, result.indexOf("exports.A = A;") + 14) + '\n';

				expect(fs.readFileSync(path.join(__dirname, './data/A.result.js'), "utf8")).to.be.equal(result);

				done();
			});
		}).timeout(5000);

	});
	describe('Usual TypeScript Loader', () => {

		it('should work like as usual mode', (done) => {
			const options = {
				entry: path.join(__dirname, 'data/A.ts'),
				output: {
					path: path.join(__dirname, 'build'),
				},
				resolve: {
					extensions: [".ts", ".d.ts", ".js"]
				},
				optimization: {
					minimize: false,
				},
				module: {
					rules: [
						{
							test: /\.(ts)$/,
							loader: 'ts-loader',
							exclude: /(node_modules|bower_components)/,
							options: {
								getCustomTransformers: () => privateTransformer
							}
						}
					]
				},
			};

			webpack(options, (err, stats) => {
				if (err) return done(err);
				stats = stats.toJson({
					errorDetails: true
				});
				if (stats.errors.length > 0) {
					return done(new Error(stats.errors[0]));
				}

				let result = fs.readFileSync(path.join(__dirname, 'build/main.js'), 'utf8');

				result = result.substr(result.indexOf("use strict") - 1).replace(/^\n/mg, '')
				result = result.substr(0, result.indexOf("exports.A = A;") + 14) + '\n';

				expect(fs.readFileSync(path.join(__dirname, './data/A.result.js'), "utf8")).to.be.equal(result);

				done();
			});
		}).timeout(5000);

	});
});
