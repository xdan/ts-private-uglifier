import { expect } from "chai";
import { privateTransformer } from "../index";
import * as ts from "typescript/lib/tsserverlibrary";

describe('Check compile methods', () => {
	it('should change private methods names', () => {

		const source = `class A {
			private __bestSpinner(test) {
				console.log(this.spinner + test);
			};
			public spinner: number = 1;
			dolg() {
				this.__bestSpinner(1);
			}
		}`;

		let result = ts.transpileModule(source, {
			transformers: privateTransformer
		});

		expect(`var A = /** @class */ (function () {
    function A() {
        this.spinner = 1;
    }
    A.prototype.a = function (test) {
        console.log(this.spinner + test);
    };
    ;
    A.prototype.dolg = function () {
        this.a(1);
    };
    return A;
}());
`).to.be.equal(result.outputText);
	});
});
