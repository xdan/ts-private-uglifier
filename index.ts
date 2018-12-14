import {TransformationContext, Transformer} from "typescript/lib/tsserverlibrary";
import * as ts from "typescript";
import CustomTransformers = ts.CustomTransformers;

const isPrivateNode = (node: ts.Node): boolean => {
	return Boolean(node.modifiers && node.modifiers.some(mod => mod.kind === ts.SyntaxKind.PrivateKeyword));
};

class PrivateTransformHelper {
	allNames: Set<string> = new Set();
	names: Map<string, string> = new Map();

	index: number = 9;
	multy: number = 16;

	getNewVariableName(): string {
		this.index += 1;

		if (this.index % this.multy === 0) {
			this.index = this.multy * 10;
			this.multy *= 16;
		}

		return this.index.toString(16)
	}

	generateName(): string {
		let newName: string;

		do {
			newName = this.getNewVariableName();
		} while(this.allNames.has(newName));

		return newName;
	}


	static getHelperFromContext(context: TransformationContext): PrivateTransformHelper {
		const key: string = 'private_transfom_helper';

		if (!context[key]) {
			context[key] = new PrivateTransformHelper();
		}

		return context[key]
	}
}

export const privateTransformer: CustomTransformers = <CustomTransformers>{
	before: [
		(context: TransformationContext): Transformer<ts.Node> => {
			const helper = PrivateTransformHelper.getHelperFromContext(context);

			return function visitor(node: ts.Node): ts.Node {
				if (ts.isPropertyDeclaration(node) || ts.isMethodDeclaration(node)) {
					helper.allNames.add(node.name.getFullText().trim());
				}

				return ts.visitEachChild(node, visitor, context)
			};
		},
		(context: TransformationContext): Transformer<ts.Node> => {
			const helper = PrivateTransformHelper.getHelperFromContext(context);

			return function visitor(node: ts.Node): ts.Node {
				if (ts.isPropertyDeclaration(node) && isPrivateNode(node)) {
					let newName: string = helper.generateName();
					helper.names.set(node.name.getFullText().trim(), newName);
					return ts.createProperty(node.decorators, node.modifiers, newName, node.questionToken, node.type, node.initializer)
				}

				if (ts.isMethodDeclaration(node) && isPrivateNode(node)) {
					let newName: string = helper.generateName();

					helper.names.set(node.name.getFullText().trim(), newName);
					return ts.createMethod(node.decorators, node.modifiers, node.asteriskToken, newName, node.questionToken, node.typeParameters, node.parameters, node.type, node.body)
				}

				return ts.visitEachChild(node, visitor, context)
			};
		},
		(context: TransformationContext): Transformer<ts.Node> => {
			const helper = PrivateTransformHelper.getHelperFromContext(context);

			return function visitor(node: ts.Node): ts.Node {
				if (ts.isPropertyAccessExpression(node)) {
					const oldName: string = node.name.getFullText().trim();

					if (helper.names.has(oldName)) {
						return ts.createPropertyAccess(node.expression, helper.names.get(oldName))
					}
				}

				return ts.visitEachChild(node, visitor, context)
			};
		}
	],
};
