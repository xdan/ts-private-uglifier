"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var A = /** @class */ (function () {
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
exports.A = A;
