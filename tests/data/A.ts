export class A {
	private __bestSpinner(test) {
		console.log(this.spinner + test);
	};
	public spinner: number = 1;
	dolg() {
		this.__bestSpinner(1);
	}
}
