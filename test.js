"use strict";
exports.__esModule = true;
var ts = require("typescript");
var SyntaxKind = ts.SyntaxKind;
var source = "class A {\n\tpublic spinner: string = '123';\n\tf() {\n\t\tlet b: string = '123';\n\t\tconsole.log(this.__bestSpinner  + this.spinner + b + this.printefSuper());\n\t}\n\tprivate printefSuper() {\n\t\treturn 'super';\n\t}\n\tprivate __bestSpinner: string = '1';\n}\n";
var isPrivateNode = function (node) {
    return Boolean(node.modifiers && node.modifiers.some(function (mod) { return mod.kind === SyntaxKind.PrivateKeyword; }));
};
var allNames = new Set();
var names = new Map();
var index = 9;
var multy = 16;
function getNewVariableName() {
    index += 1;
    if (index % multy === 0) {
        index = multy * 10;
        multy *= 16;
    }
    return index.toString(16);
}
function generateName() {
    var newName;
    do {
        newName = getNewVariableName();
    } while (allNames.has(newName));
    return newName;
}
var result = ts.transpileModule(source, {
    compilerOptions: {
        module: ts.ModuleKind.CommonJS
    },
    transformers: {
        before: [
            function (context) {
                return function visitor(node) {
                    if (ts.isPropertyDeclaration(node) || ts.isMethodDeclaration(node)) {
                        allNames.add(node.name.getFullText().trim());
                    }
                    return ts.visitEachChild(node, visitor, context);
                };
            },
            function (context) {
                return function visitor(node) {
                    if (ts.isPropertyDeclaration(node) && isPrivateNode(node)) {
                        var newName = generateName();
                        names.set(node.name.getFullText().trim(), newName);
                        return ts.createProperty(node.decorators, node.modifiers, newName, node.questionToken, node.type, node.initializer);
                    }
                    if (ts.isMethodDeclaration(node) && isPrivateNode(node)) {
                        var newName = generateName();
                        names.set(node.name.getFullText().trim(), newName);
                        return ts.createMethod(node.decorators, node.modifiers, node.asteriskToken, newName, node.questionToken, node.typeParameters, node.parameters, node.type, node.body);
                    }
                    return ts.visitEachChild(node, visitor, context);
                };
            },
            function (context) {
                return function visitor(node) {
                    if (ts.isPropertyAccessExpression(node)) {
                        var oldName = node.name.getFullText().trim();
                        if (names.has(oldName)) {
                            return ts.createPropertyAccess(node.expression, names.get(oldName));
                        }
                    }
                    return ts.visitEachChild(node, visitor, context);
                };
            }
        ]
    }
});
console.log(JSON.stringify(result));
