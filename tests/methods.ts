import { expect } from "chai";
import { privateTransformer } from "../index";
import * as ts from "typescript/lib/tsserverlibrary";
import * as fs from "fs";
import * as path from "path";

describe('Check compile methods', () => {
	it('should change private methods names', () => {

		const source: string = fs.readFileSync(path.join(__dirname, './data/A.ts'), "utf8");

		let result = ts.transpileModule(source, {
			transformers: privateTransformer
		});

		expect(fs.readFileSync(path.join(__dirname, './data/A.result.js'), "utf8")).to.be.equal(result.outputText);
	});
});
