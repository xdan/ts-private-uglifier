import { expect } from "chai";
import { privateTransformer } from "../index";
import * as ts from "typescript/lib/tsserverlibrary";

describe('Check compile properties', () => {
	it('should change properties names', () => {

		const source = `class A {
			private __bestSpinner: string = '1';
			public b: number = 1;
			dolg() {
				this.__bestSpinner = '2';
				console.log(this.__bestSpinner);
			}
		}`;

		let result = ts.transpileModule(source, {
			transformers: privateTransformer
		});

		expect(`var A = /** @class */ (function () {
    function A() {
        this.a = '1';
        this.b = 1;
    }
    A.prototype.dolg = function () {
        this.a = '2';
        console.log(this.a);
    };
    return A;
}());
`).to.be.equal(result.outputText);
	});
});
