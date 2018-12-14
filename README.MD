# TypeScript Private Uglify

After compiling with this CustomerTransform 
This code
```typescript
class A {
	private __hanSoloLooongLongName: string = '123';
	private __bestSpinnerLoonLongMethod(test) {
		console.log(this.spinner + test + this.__hanSoloLooongLongName);
	};
	public spinner: number = 1;
	dolg() {
		this.__bestSpinnerLoonLongMethod(1);
	}
}
```

will be compiled in
```typescript
var A = /** @class */ (function () {
    function A() {
        this.spinner = 1;
        this.a = '123';
    }
    A.prototype.b = function (test) {
        console.log(this.spinner + test + this.a);
    };
    A.prototype.dolg = function () {
        this.b(1);
    };
    return A;
}());
```
