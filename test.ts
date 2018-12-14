import * as ts from "typescript";
import CustomTransformers = ts.CustomTransformers;
import {TransformationContext, Transformer} from "typescript/lib/tsserverlibrary";
import SyntaxKind = ts.SyntaxKind;
import __String = ts.__String;

const source = `class A {
	public spinner: string = '123';
	f() {
		let b: string = '123';
		console.log(this.__bestSpinner  + this.spinner + b + this.printefSuper());
	}
	private printefSuper() {
		return 'super';
	}
	private __bestSpinner: string = '1';
}
`;

const isPrivateNode = (node: ts.Node): boolean => {
	return Boolean(node.modifiers && node.modifiers.some(mod => mod.kind === SyntaxKind.PrivateKeyword));
};

let allNames: Set<string> = new Set();
let names: Map<string, string> = new Map();

let index: number = 9;
let multy: number = 16;

function getNewVariableName(): string {
	index += 1;

	if (index % multy === 0) {
		index = multy * 10;
		multy *= 16;
	}

	return index.toString(16)
}
function generateName(): string {
	let newName: string;

	do {
		newName = getNewVariableName();
	} while(allNames.has(newName));

	return newName;
}

let result = ts.transpileModule(source, {
	compilerOptions: {
		module: ts.ModuleKind.CommonJS,
	},
	transformers:
		<CustomTransformers>{
			before: [
				(context: TransformationContext): Transformer<ts.Node> => {
					return function visitor(node: ts.Node): ts.Node {
						if (ts.isPropertyDeclaration(node) || ts.isMethodDeclaration(node)) {
							allNames.add(node.name.getFullText().trim());
						}

						return ts.visitEachChild(node, visitor, context)
					};
				},
				(context: TransformationContext): Transformer<ts.Node> => {
						return function visitor(node: ts.Node): ts.Node {
							if (ts.isPropertyDeclaration(node) && isPrivateNode(node)) {
								let newName: string = generateName();
								names.set(node.name.getFullText().trim(), newName);
								return ts.createProperty(node.decorators, node.modifiers, newName, node.questionToken, node.type, node.initializer)
							}

							if (ts.isMethodDeclaration(node) && isPrivateNode(node)) {
								let newName: string = generateName();

								names.set(node.name.getFullText().trim(), newName);
								return ts.createMethod(node.decorators, node.modifiers, node.asteriskToken, newName, node.questionToken, node.typeParameters, node.parameters, node.type, node.body)
							}

							return ts.visitEachChild(node, visitor, context)
						};
				},
				(context: TransformationContext): Transformer<ts.Node> => {
					return function visitor(node: ts.Node): ts.Node {
						if (ts.isPropertyAccessExpression(node)) {
							const oldName: string = node.name.getFullText().trim();

							if (names.has(oldName)) {
								return ts.createPropertyAccess(node.expression, names.get(oldName))
							}
						}

						return ts.visitEachChild(node, visitor, context)
					};
				}
			],

		}
});

console.log(JSON.stringify(result));
