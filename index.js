"use strict";
exports.__esModule = true;
var ts = require("typescript");
/**
 * Check if node element is private
 *
 * @param node
 */
var isPrivateNode = function (node) {
    return Boolean(node.modifiers &&
        node.modifiers.some(function (mod) { return mod.kind === ts.SyntaxKind.PrivateKeyword; }));
};
var PrivateTransformHelper = /** @class */ (function () {
    function PrivateTransformHelper() {
        this.allNames = new Set();
        this.names = new Map();
        this.index = 9;
        this.multy = 16;
    }
    PrivateTransformHelper.prototype.getNewVariableName = function () {
        this.index += 1;
        if (this.index % this.multy === 0) {
            this.index = this.multy * 10;
            this.multy *= 16;
        }
        return this.index.toString(16);
    };
    PrivateTransformHelper.prototype.generateName = function () {
        var newName;
        do {
            newName = this.getNewVariableName();
        } while (this.allNames.has(newName));
        return newName;
    };
    PrivateTransformHelper.getHelperFromContext = function (context) {
        var key = 'private_transfom_helper';
        if (!context[key]) {
            context[key] = new PrivateTransformHelper();
        }
        return context[key];
    };
    return PrivateTransformHelper;
}());
exports.privateTransformer = {
    before: [
        function (context) {
            var helper = PrivateTransformHelper.getHelperFromContext(context);
            return function visitor(node) {
                if (ts.isPropertyDeclaration(node) || ts.isMethodDeclaration(node)) {
                    helper.allNames.add(node.name.getFullText().trim());
                }
                return ts.visitEachChild(node, visitor, context);
            };
        },
        function (context) {
            var helper = PrivateTransformHelper.getHelperFromContext(context);
            return function visitor(node) {
                if (ts.isPropertyDeclaration(node) && isPrivateNode(node)) {
                    var newName = helper.generateName();
                    helper.names.set(node.name.getFullText().trim(), newName);
                    return ts.createProperty(node.decorators, node.modifiers, newName, node.questionToken, node.type, node.initializer);
                }
                if (ts.isMethodDeclaration(node) && isPrivateNode(node)) {
                    var newName = helper.generateName();
                    helper.names.set(node.name.getFullText().trim(), newName);
                    return ts.createMethod(node.decorators, node.modifiers, node.asteriskToken, newName, node.questionToken, node.typeParameters, node.parameters, node.type, node.body);
                }
                return ts.visitEachChild(node, visitor, context);
            };
        },
        function (context) {
            var helper = PrivateTransformHelper.getHelperFromContext(context);
            return function visitor(node) {
                if (ts.isPropertyAccessExpression(node)) {
                    var oldName = node.name.getFullText().trim();
                    if (helper.names.has(oldName)) {
                        return ts.createPropertyAccess(node.expression, helper.names.get(oldName));
                    }
                }
                return ts.visitEachChild(node, visitor, context);
            };
        }
    ]
};
