/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/compiler-cli/src/metadata/collector", ["require", "exports", "tslib", "typescript", "@angular/compiler-cli/src/metadata/evaluator", "@angular/compiler-cli/src/metadata/schema", "@angular/compiler-cli/src/metadata/symbols"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var tslib_1 = require("tslib");
    var ts = require("typescript");
    var evaluator_1 = require("@angular/compiler-cli/src/metadata/evaluator");
    var schema_1 = require("@angular/compiler-cli/src/metadata/schema");
    var symbols_1 = require("@angular/compiler-cli/src/metadata/symbols");
    var isStatic = function (node) {
        return ts.getCombinedModifierFlags(node) & ts.ModifierFlags.Static;
    };
    /**
     * Collect decorator metadata from a TypeScript module.
     */
    var MetadataCollector = /** @class */ (function () {
        function MetadataCollector(options) {
            if (options === void 0) { options = {}; }
            this.options = options;
        }
        /**
         * Returns a JSON.stringify friendly form describing the decorators of the exported classes from
         * the source file that is expected to correspond to a module.
         */
        MetadataCollector.prototype.getMetadata = function (sourceFile, strict, substituteExpression) {
            var _this = this;
            if (strict === void 0) { strict = false; }
            var locals = new symbols_1.Symbols(sourceFile);
            var nodeMap = new Map();
            var composedSubstituter = substituteExpression && this.options.substituteExpression ?
                function (value, node) {
                    return _this.options.substituteExpression(substituteExpression(value, node), node);
                } :
                substituteExpression;
            var evaluatorOptions = substituteExpression ? tslib_1.__assign(tslib_1.__assign({}, this.options), { substituteExpression: composedSubstituter }) :
                this.options;
            var metadata;
            var evaluator = new evaluator_1.Evaluator(locals, nodeMap, evaluatorOptions, function (name, value) {
                if (!metadata)
                    metadata = {};
                metadata[name] = value;
            });
            var exports = undefined;
            function objFromDecorator(decoratorNode) {
                return evaluator.evaluateNode(decoratorNode.expression);
            }
            function recordEntry(entry, node) {
                if (composedSubstituter) {
                    entry = composedSubstituter(entry, node);
                }
                return evaluator_1.recordMapEntry(entry, node, nodeMap, sourceFile);
            }
            function errorSym(message, node, context) {
                return evaluator_1.errorSymbol(message, node, context, sourceFile);
            }
            function maybeGetSimpleFunction(functionDeclaration) {
                if (functionDeclaration.name && functionDeclaration.name.kind == ts.SyntaxKind.Identifier) {
                    var nameNode = functionDeclaration.name;
                    var functionName = nameNode.text;
                    var functionBody = functionDeclaration.body;
                    if (functionBody && functionBody.statements.length == 1) {
                        var statement = functionBody.statements[0];
                        if (statement.kind === ts.SyntaxKind.ReturnStatement) {
                            var returnStatement = statement;
                            if (returnStatement.expression) {
                                var func = {
                                    __symbolic: 'function',
                                    parameters: namesOf(functionDeclaration.parameters),
                                    value: evaluator.evaluateNode(returnStatement.expression)
                                };
                                if (functionDeclaration.parameters.some(function (p) { return p.initializer != null; })) {
                                    func.defaults = functionDeclaration.parameters.map(function (p) { return p.initializer && evaluator.evaluateNode(p.initializer); });
                                }
                                return recordEntry({ func: func, name: functionName }, functionDeclaration);
                            }
                        }
                    }
                }
            }
            function classMetadataOf(classDeclaration) {
                var e_1, _a, e_2, _b;
                var result = { __symbolic: 'class' };
                function getDecorators(decorators) {
                    if (decorators && decorators.length)
                        return decorators.map(function (decorator) { return objFromDecorator(decorator); });
                    return undefined;
                }
                function referenceFrom(node) {
                    var result = evaluator.evaluateNode(node);
                    if (schema_1.isMetadataError(result) || schema_1.isMetadataSymbolicReferenceExpression(result) ||
                        schema_1.isMetadataSymbolicSelectExpression(result)) {
                        return result;
                    }
                    else {
                        return errorSym('Symbol reference expected', node);
                    }
                }
                // Add class parents
                if (classDeclaration.heritageClauses) {
                    classDeclaration.heritageClauses.forEach(function (hc) {
                        if (hc.token === ts.SyntaxKind.ExtendsKeyword && hc.types) {
                            hc.types.forEach(function (type) { return result.extends = referenceFrom(type.expression); });
                        }
                    });
                }
                // Add arity if the type is generic
                var typeParameters = classDeclaration.typeParameters;
                if (typeParameters && typeParameters.length) {
                    result.arity = typeParameters.length;
                }
                // Add class decorators
                if (classDeclaration.decorators) {
                    result.decorators = getDecorators(classDeclaration.decorators);
                }
                // member decorators
                var members = null;
                function recordMember(name, metadata) {
                    if (!members)
                        members = {};
                    var data = members.hasOwnProperty(name) ? members[name] : [];
                    data.push(metadata);
                    members[name] = data;
                }
                // static member
                var statics = null;
                function recordStaticMember(name, value) {
                    if (!statics)
                        statics = {};
                    statics[name] = value;
                }
                try {
                    for (var _c = tslib_1.__values(classDeclaration.members), _d = _c.next(); !_d.done; _d = _c.next()) {
                        var member = _d.value;
                        var isConstructor = false;
                        switch (member.kind) {
                            case ts.SyntaxKind.Constructor:
                            case ts.SyntaxKind.MethodDeclaration:
                                isConstructor = member.kind === ts.SyntaxKind.Constructor;
                                var method = member;
                                if (isStatic(method)) {
                                    var maybeFunc = maybeGetSimpleFunction(method);
                                    if (maybeFunc) {
                                        recordStaticMember(maybeFunc.name, maybeFunc.func);
                                    }
                                    continue;
                                }
                                var methodDecorators = getDecorators(method.decorators);
                                var parameters = method.parameters;
                                var parameterDecoratorData = [];
                                var parametersData = [];
                                var hasDecoratorData = false;
                                var hasParameterData = false;
                                try {
                                    for (var parameters_1 = (e_2 = void 0, tslib_1.__values(parameters)), parameters_1_1 = parameters_1.next(); !parameters_1_1.done; parameters_1_1 = parameters_1.next()) {
                                        var parameter = parameters_1_1.value;
                                        var parameterData = getDecorators(parameter.decorators);
                                        parameterDecoratorData.push(parameterData);
                                        hasDecoratorData = hasDecoratorData || !!parameterData;
                                        if (isConstructor) {
                                            if (parameter.type) {
                                                parametersData.push(referenceFrom(parameter.type));
                                            }
                                            else {
                                                parametersData.push(null);
                                            }
                                            hasParameterData = true;
                                        }
                                    }
                                }
                                catch (e_2_1) { e_2 = { error: e_2_1 }; }
                                finally {
                                    try {
                                        if (parameters_1_1 && !parameters_1_1.done && (_b = parameters_1.return)) _b.call(parameters_1);
                                    }
                                    finally { if (e_2) throw e_2.error; }
                                }
                                var data = { __symbolic: isConstructor ? 'constructor' : 'method' };
                                var name = isConstructor ? '__ctor__' : evaluator.nameOf(member.name);
                                if (methodDecorators) {
                                    data.decorators = methodDecorators;
                                }
                                if (hasDecoratorData) {
                                    data.parameterDecorators = parameterDecoratorData;
                                }
                                if (hasParameterData) {
                                    data.parameters = parametersData;
                                }
                                if (!schema_1.isMetadataError(name)) {
                                    recordMember(name, data);
                                }
                                break;
                            case ts.SyntaxKind.PropertyDeclaration:
                            case ts.SyntaxKind.GetAccessor:
                            case ts.SyntaxKind.SetAccessor:
                                var property = member;
                                if (isStatic(property)) {
                                    var name_1 = evaluator.nameOf(property.name);
                                    if (!schema_1.isMetadataError(name_1) && !shouldIgnoreStaticMember(name_1)) {
                                        if (property.initializer) {
                                            var value = evaluator.evaluateNode(property.initializer);
                                            recordStaticMember(name_1, value);
                                        }
                                        else {
                                            recordStaticMember(name_1, errorSym('Variable not initialized', property.name));
                                        }
                                    }
                                }
                                var propertyDecorators = getDecorators(property.decorators);
                                if (propertyDecorators) {
                                    var name_2 = evaluator.nameOf(property.name);
                                    if (!schema_1.isMetadataError(name_2)) {
                                        recordMember(name_2, { __symbolic: 'property', decorators: propertyDecorators });
                                    }
                                }
                                break;
                        }
                    }
                }
                catch (e_1_1) { e_1 = { error: e_1_1 }; }
                finally {
                    try {
                        if (_d && !_d.done && (_a = _c.return)) _a.call(_c);
                    }
                    finally { if (e_1) throw e_1.error; }
                }
                if (members) {
                    result.members = members;
                }
                if (statics) {
                    result.statics = statics;
                }
                return recordEntry(result, classDeclaration);
            }
            // Collect all exported symbols from an exports clause.
            var exportMap = new Map();
            ts.forEachChild(sourceFile, function (node) {
                switch (node.kind) {
                    case ts.SyntaxKind.ExportDeclaration:
                        var exportDeclaration = node;
                        var moduleSpecifier = exportDeclaration.moduleSpecifier, exportClause = exportDeclaration.exportClause;
                        if (!moduleSpecifier) {
                            // If there is a module specifier there is also an exportClause
                            exportClause.elements.forEach(function (spec) {
                                var exportedAs = spec.name.text;
                                var name = (spec.propertyName || spec.name).text;
                                exportMap.set(name, exportedAs);
                            });
                        }
                }
            });
            var isExport = function (node) { return sourceFile.isDeclarationFile ||
                ts.getCombinedModifierFlags(node) & ts.ModifierFlags.Export; };
            var isExportedIdentifier = function (identifier) {
                return identifier && exportMap.has(identifier.text);
            };
            var isExported = function (node) {
                return isExport(node) || isExportedIdentifier(node.name);
            };
            var exportedIdentifierName = function (identifier) {
                return identifier && (exportMap.get(identifier.text) || identifier.text);
            };
            var exportedName = function (node) { return exportedIdentifierName(node.name); };
            // Pre-declare classes and functions
            ts.forEachChild(sourceFile, function (node) {
                switch (node.kind) {
                    case ts.SyntaxKind.ClassDeclaration:
                        var classDeclaration = node;
                        if (classDeclaration.name) {
                            var className = classDeclaration.name.text;
                            if (isExported(classDeclaration)) {
                                locals.define(className, { __symbolic: 'reference', name: exportedName(classDeclaration) });
                            }
                            else {
                                locals.define(className, errorSym('Reference to non-exported class', node, { className: className }));
                            }
                        }
                        break;
                    case ts.SyntaxKind.InterfaceDeclaration:
                        var interfaceDeclaration = node;
                        if (interfaceDeclaration.name) {
                            var interfaceName = interfaceDeclaration.name.text;
                            // All references to interfaces should be converted to references to `any`.
                            locals.define(interfaceName, { __symbolic: 'reference', name: 'any' });
                        }
                        break;
                    case ts.SyntaxKind.FunctionDeclaration:
                        var functionDeclaration = node;
                        if (!isExported(functionDeclaration)) {
                            // Report references to this function as an error.
                            var nameNode = functionDeclaration.name;
                            if (nameNode && nameNode.text) {
                                locals.define(nameNode.text, errorSym('Reference to a non-exported function', nameNode, { name: nameNode.text }));
                            }
                        }
                        break;
                }
            });
            ts.forEachChild(sourceFile, function (node) {
                var e_3, _a, e_4, _b;
                switch (node.kind) {
                    case ts.SyntaxKind.ExportDeclaration:
                        // Record export declarations
                        var exportDeclaration = node;
                        var moduleSpecifier = exportDeclaration.moduleSpecifier, exportClause = exportDeclaration.exportClause;
                        if (!moduleSpecifier) {
                            // no module specifier -> export {propName as name};
                            if (exportClause) {
                                exportClause.elements.forEach(function (spec) {
                                    var name = spec.name.text;
                                    // If the symbol was not already exported, export a reference since it is a
                                    // reference to an import
                                    if (!metadata || !metadata[name]) {
                                        var propNode = spec.propertyName || spec.name;
                                        var value = evaluator.evaluateNode(propNode);
                                        if (!metadata)
                                            metadata = {};
                                        metadata[name] = recordEntry(value, node);
                                    }
                                });
                            }
                        }
                        if (moduleSpecifier && moduleSpecifier.kind == ts.SyntaxKind.StringLiteral) {
                            // Ignore exports that don't have string literals as exports.
                            // This is allowed by the syntax but will be flagged as an error by the type checker.
                            var from = moduleSpecifier.text;
                            var moduleExport = { from: from };
                            if (exportClause) {
                                moduleExport.export = exportClause.elements.map(function (spec) { return spec.propertyName ? { name: spec.propertyName.text, as: spec.name.text } :
                                    spec.name.text; });
                            }
                            if (!exports)
                                exports = [];
                            exports.push(moduleExport);
                        }
                        break;
                    case ts.SyntaxKind.ClassDeclaration:
                        var classDeclaration = node;
                        if (classDeclaration.name) {
                            if (isExported(classDeclaration)) {
                                var name = exportedName(classDeclaration);
                                if (name) {
                                    if (!metadata)
                                        metadata = {};
                                    metadata[name] = classMetadataOf(classDeclaration);
                                }
                            }
                        }
                        // Otherwise don't record metadata for the class.
                        break;
                    case ts.SyntaxKind.TypeAliasDeclaration:
                        var typeDeclaration = node;
                        if (typeDeclaration.name && isExported(typeDeclaration)) {
                            var name = exportedName(typeDeclaration);
                            if (name) {
                                if (!metadata)
                                    metadata = {};
                                metadata[name] = { __symbolic: 'interface' };
                            }
                        }
                        break;
                    case ts.SyntaxKind.InterfaceDeclaration:
                        var interfaceDeclaration = node;
                        if (interfaceDeclaration.name && isExported(interfaceDeclaration)) {
                            var name = exportedName(interfaceDeclaration);
                            if (name) {
                                if (!metadata)
                                    metadata = {};
                                metadata[name] = { __symbolic: 'interface' };
                            }
                        }
                        break;
                    case ts.SyntaxKind.FunctionDeclaration:
                        // Record functions that return a single value. Record the parameter
                        // names substitution will be performed by the StaticReflector.
                        var functionDeclaration = node;
                        if (isExported(functionDeclaration) && functionDeclaration.name) {
                            var name = exportedName(functionDeclaration);
                            var maybeFunc = maybeGetSimpleFunction(functionDeclaration);
                            if (name) {
                                if (!metadata)
                                    metadata = {};
                                // TODO(alxhub): The literal here is not valid FunctionMetadata.
                                metadata[name] = maybeFunc ? recordEntry(maybeFunc.func, node) :
                                    { __symbolic: 'function' };
                            }
                        }
                        break;
                    case ts.SyntaxKind.EnumDeclaration:
                        var enumDeclaration = node;
                        if (isExported(enumDeclaration)) {
                            var enumValueHolder = {};
                            var enumName = exportedName(enumDeclaration);
                            var nextDefaultValue = 0;
                            var writtenMembers = 0;
                            try {
                                for (var _c = tslib_1.__values(enumDeclaration.members), _d = _c.next(); !_d.done; _d = _c.next()) {
                                    var member = _d.value;
                                    var enumValue = void 0;
                                    if (!member.initializer) {
                                        enumValue = nextDefaultValue;
                                    }
                                    else {
                                        enumValue = evaluator.evaluateNode(member.initializer);
                                    }
                                    var name = undefined;
                                    if (member.name.kind == ts.SyntaxKind.Identifier) {
                                        var identifier = member.name;
                                        name = identifier.text;
                                        enumValueHolder[name] = enumValue;
                                        writtenMembers++;
                                    }
                                    if (typeof enumValue === 'number') {
                                        nextDefaultValue = enumValue + 1;
                                    }
                                    else if (name) {
                                        // TODO(alxhub): 'left' here has a name propery which is not valid for
                                        // MetadataSymbolicSelectExpression.
                                        nextDefaultValue = {
                                            __symbolic: 'binary',
                                            operator: '+',
                                            left: {
                                                __symbolic: 'select',
                                                expression: recordEntry({ __symbolic: 'reference', name: enumName }, node), name: name
                                            },
                                        };
                                    }
                                    else {
                                        nextDefaultValue =
                                            recordEntry(errorSym('Unsupported enum member name', member.name), node);
                                    }
                                }
                            }
                            catch (e_3_1) { e_3 = { error: e_3_1 }; }
                            finally {
                                try {
                                    if (_d && !_d.done && (_a = _c.return)) _a.call(_c);
                                }
                                finally { if (e_3) throw e_3.error; }
                            }
                            if (writtenMembers) {
                                if (enumName) {
                                    if (!metadata)
                                        metadata = {};
                                    metadata[enumName] = recordEntry(enumValueHolder, node);
                                }
                            }
                        }
                        break;
                    case ts.SyntaxKind.VariableStatement:
                        var variableStatement = node;
                        var _loop_1 = function (variableDeclaration) {
                            if (variableDeclaration.name.kind == ts.SyntaxKind.Identifier) {
                                var nameNode = variableDeclaration.name;
                                var varValue = void 0;
                                if (variableDeclaration.initializer) {
                                    varValue = evaluator.evaluateNode(variableDeclaration.initializer);
                                }
                                else {
                                    varValue = recordEntry(errorSym('Variable not initialized', nameNode), nameNode);
                                }
                                var exported = false;
                                if (isExport(variableStatement) || isExport(variableDeclaration) ||
                                    isExportedIdentifier(nameNode)) {
                                    var name = exportedIdentifierName(nameNode);
                                    if (name) {
                                        if (!metadata)
                                            metadata = {};
                                        metadata[name] = recordEntry(varValue, node);
                                    }
                                    exported = true;
                                }
                                if (typeof varValue == 'string' || typeof varValue == 'number' ||
                                    typeof varValue == 'boolean') {
                                    locals.define(nameNode.text, varValue);
                                    if (exported) {
                                        locals.defineReference(nameNode.text, { __symbolic: 'reference', name: nameNode.text });
                                    }
                                }
                                else if (!exported) {
                                    if (varValue && !schema_1.isMetadataError(varValue)) {
                                        locals.define(nameNode.text, recordEntry(varValue, node));
                                    }
                                    else {
                                        locals.define(nameNode.text, recordEntry(errorSym('Reference to a local symbol', nameNode, { name: nameNode.text }), node));
                                    }
                                }
                            }
                            else {
                                // Destructuring (or binding) declarations are not supported,
                                // var {<identifier>[, <identifier>]+} = <expression>;
                                //   or
                                // var [<identifier>[, <identifier}+] = <expression>;
                                // are not supported.
                                var report_1 = function (nameNode) {
                                    switch (nameNode.kind) {
                                        case ts.SyntaxKind.Identifier:
                                            var name = nameNode;
                                            var varValue = errorSym('Destructuring not supported', name);
                                            locals.define(name.text, varValue);
                                            if (isExport(node)) {
                                                if (!metadata)
                                                    metadata = {};
                                                metadata[name.text] = varValue;
                                            }
                                            break;
                                        case ts.SyntaxKind.BindingElement:
                                            var bindingElement = nameNode;
                                            report_1(bindingElement.name);
                                            break;
                                        case ts.SyntaxKind.ObjectBindingPattern:
                                        case ts.SyntaxKind.ArrayBindingPattern:
                                            var bindings = nameNode;
                                            bindings.elements.forEach(report_1);
                                            break;
                                    }
                                };
                                report_1(variableDeclaration.name);
                            }
                        };
                        try {
                            for (var _e = tslib_1.__values(variableStatement.declarationList.declarations), _f = _e.next(); !_f.done; _f = _e.next()) {
                                var variableDeclaration = _f.value;
                                _loop_1(variableDeclaration);
                            }
                        }
                        catch (e_4_1) { e_4 = { error: e_4_1 }; }
                        finally {
                            try {
                                if (_f && !_f.done && (_b = _e.return)) _b.call(_e);
                            }
                            finally { if (e_4) throw e_4.error; }
                        }
                        break;
                }
            });
            if (metadata || exports) {
                if (!metadata)
                    metadata = {};
                else if (strict) {
                    validateMetadata(sourceFile, nodeMap, metadata);
                }
                var result = {
                    __symbolic: 'module',
                    version: this.options.version || schema_1.METADATA_VERSION, metadata: metadata
                };
                if (sourceFile.moduleName)
                    result.importAs = sourceFile.moduleName;
                if (exports)
                    result.exports = exports;
                return result;
            }
        };
        return MetadataCollector;
    }());
    exports.MetadataCollector = MetadataCollector;
    // This will throw if the metadata entry given contains an error node.
    function validateMetadata(sourceFile, nodeMap, metadata) {
        var locals = new Set(['Array', 'Object', 'Set', 'Map', 'string', 'number', 'any']);
        function validateExpression(expression) {
            if (!expression) {
                return;
            }
            else if (Array.isArray(expression)) {
                expression.forEach(validateExpression);
            }
            else if (typeof expression === 'object' && !expression.hasOwnProperty('__symbolic')) {
                Object.getOwnPropertyNames(expression).forEach(function (v) { return validateExpression(expression[v]); });
            }
            else if (schema_1.isMetadataError(expression)) {
                reportError(expression);
            }
            else if (schema_1.isMetadataGlobalReferenceExpression(expression)) {
                if (!locals.has(expression.name)) {
                    var reference = metadata[expression.name];
                    if (reference) {
                        validateExpression(reference);
                    }
                }
            }
            else if (schema_1.isFunctionMetadata(expression)) {
                validateFunction(expression);
            }
            else if (schema_1.isMetadataSymbolicExpression(expression)) {
                switch (expression.__symbolic) {
                    case 'binary':
                        var binaryExpression = expression;
                        validateExpression(binaryExpression.left);
                        validateExpression(binaryExpression.right);
                        break;
                    case 'call':
                    case 'new':
                        var callExpression = expression;
                        validateExpression(callExpression.expression);
                        if (callExpression.arguments)
                            callExpression.arguments.forEach(validateExpression);
                        break;
                    case 'index':
                        var indexExpression = expression;
                        validateExpression(indexExpression.expression);
                        validateExpression(indexExpression.index);
                        break;
                    case 'pre':
                        var prefixExpression = expression;
                        validateExpression(prefixExpression.operand);
                        break;
                    case 'select':
                        var selectExpression = expression;
                        validateExpression(selectExpression.expression);
                        break;
                    case 'spread':
                        var spreadExpression = expression;
                        validateExpression(spreadExpression.expression);
                        break;
                    case 'if':
                        var ifExpression = expression;
                        validateExpression(ifExpression.condition);
                        validateExpression(ifExpression.elseExpression);
                        validateExpression(ifExpression.thenExpression);
                        break;
                }
            }
        }
        function validateMember(classData, member) {
            if (member.decorators) {
                member.decorators.forEach(validateExpression);
            }
            if (schema_1.isMethodMetadata(member) && member.parameterDecorators) {
                member.parameterDecorators.forEach(validateExpression);
            }
            // Only validate parameters of classes for which we know that are used with our DI
            if (classData.decorators && schema_1.isConstructorMetadata(member) && member.parameters) {
                member.parameters.forEach(validateExpression);
            }
        }
        function validateClass(classData) {
            if (classData.decorators) {
                classData.decorators.forEach(validateExpression);
            }
            if (classData.members) {
                Object.getOwnPropertyNames(classData.members)
                    .forEach(function (name) { return classData.members[name].forEach(function (m) { return validateMember(classData, m); }); });
            }
            if (classData.statics) {
                Object.getOwnPropertyNames(classData.statics).forEach(function (name) {
                    var staticMember = classData.statics[name];
                    if (schema_1.isFunctionMetadata(staticMember)) {
                        validateExpression(staticMember.value);
                    }
                    else {
                        validateExpression(staticMember);
                    }
                });
            }
        }
        function validateFunction(functionDeclaration) {
            if (functionDeclaration.value) {
                var oldLocals = locals;
                if (functionDeclaration.parameters) {
                    locals = new Set(oldLocals.values());
                    if (functionDeclaration.parameters)
                        functionDeclaration.parameters.forEach(function (n) { return locals.add(n); });
                }
                validateExpression(functionDeclaration.value);
                locals = oldLocals;
            }
        }
        function shouldReportNode(node) {
            if (node) {
                var nodeStart = node.getStart();
                return !(node.pos != nodeStart &&
                    sourceFile.text.substring(node.pos, nodeStart).indexOf('@dynamic') >= 0);
            }
            return true;
        }
        function reportError(error) {
            var node = nodeMap.get(error);
            if (shouldReportNode(node)) {
                var lineInfo = error.line != undefined ?
                    error.character != undefined ? ":" + (error.line + 1) + ":" + (error.character + 1) :
                        ":" + (error.line + 1) :
                    '';
                throw new Error("" + sourceFile.fileName + lineInfo + ": Metadata collected contains an error that will be reported at runtime: " + expandedMessage(error) + ".\n  " + JSON.stringify(error));
            }
        }
        Object.getOwnPropertyNames(metadata).forEach(function (name) {
            var entry = metadata[name];
            try {
                if (schema_1.isClassMetadata(entry)) {
                    validateClass(entry);
                }
            }
            catch (e) {
                var node = nodeMap.get(entry);
                if (shouldReportNode(node)) {
                    if (node) {
                        var _a = sourceFile.getLineAndCharacterOfPosition(node.getStart()), line = _a.line, character = _a.character;
                        throw new Error(sourceFile.fileName + ":" + (line + 1) + ":" + (character + 1) + ": Error encountered in metadata generated for exported symbol '" + name + "': \n " + e.message);
                    }
                    throw new Error("Error encountered in metadata generated for exported symbol " + name + ": \n " + e.message);
                }
            }
        });
    }
    // Collect parameter names from a function.
    function namesOf(parameters) {
        var e_5, _a;
        var result = [];
        function addNamesOf(name) {
            var e_6, _a;
            if (name.kind == ts.SyntaxKind.Identifier) {
                var identifier = name;
                result.push(identifier.text);
            }
            else {
                var bindingPattern = name;
                try {
                    for (var _b = tslib_1.__values(bindingPattern.elements), _c = _b.next(); !_c.done; _c = _b.next()) {
                        var element = _c.value;
                        var name_3 = element.name;
                        if (name_3) {
                            addNamesOf(name_3);
                        }
                    }
                }
                catch (e_6_1) { e_6 = { error: e_6_1 }; }
                finally {
                    try {
                        if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                    }
                    finally { if (e_6) throw e_6.error; }
                }
            }
        }
        try {
            for (var parameters_2 = tslib_1.__values(parameters), parameters_2_1 = parameters_2.next(); !parameters_2_1.done; parameters_2_1 = parameters_2.next()) {
                var parameter = parameters_2_1.value;
                addNamesOf(parameter.name);
            }
        }
        catch (e_5_1) { e_5 = { error: e_5_1 }; }
        finally {
            try {
                if (parameters_2_1 && !parameters_2_1.done && (_a = parameters_2.return)) _a.call(parameters_2);
            }
            finally { if (e_5) throw e_5.error; }
        }
        return result;
    }
    function shouldIgnoreStaticMember(memberName) {
        return memberName.startsWith('ngAcceptInputType_') || memberName.startsWith('ngTemplateGuard_');
    }
    function expandedMessage(error) {
        switch (error.message) {
            case 'Reference to non-exported class':
                if (error.context && error.context.className) {
                    return "Reference to a non-exported class " + error.context.className + ". Consider exporting the class";
                }
                break;
            case 'Variable not initialized':
                return 'Only initialized variables and constants can be referenced because the value of this variable is needed by the template compiler';
            case 'Destructuring not supported':
                return 'Referencing an exported destructured variable or constant is not supported by the template compiler. Consider simplifying this to avoid destructuring';
            case 'Could not resolve type':
                if (error.context && error.context.typeName) {
                    return "Could not resolve type " + error.context.typeName;
                }
                break;
            case 'Function call not supported':
                var prefix = error.context && error.context.name ? "Calling function '" + error.context.name + "', f" : 'F';
                return prefix +
                    'unction calls are not supported. Consider replacing the function or lambda with a reference to an exported function';
            case 'Reference to a local symbol':
                if (error.context && error.context.name) {
                    return "Reference to a local (non-exported) symbol '" + error.context.name + "'. Consider exporting the symbol";
                }
        }
        return error.message;
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29sbGVjdG9yLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tcGlsZXItY2xpL3NyYy9tZXRhZGF0YS9jb2xsZWN0b3IudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOzs7Ozs7Ozs7Ozs7O0lBRUgsK0JBQWlDO0lBRWpDLDBFQUFtRTtJQUNuRSxvRUFBdTFCO0lBQ3YxQixzRUFBa0M7SUFFbEMsSUFBTSxRQUFRLEdBQUcsVUFBQyxJQUFvQjtRQUNsQyxPQUFBLEVBQUUsQ0FBQyx3QkFBd0IsQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUMsYUFBYSxDQUFDLE1BQU07SUFBM0QsQ0FBMkQsQ0FBQztJQTRCaEU7O09BRUc7SUFDSDtRQUNFLDJCQUFvQixPQUE4QjtZQUE5Qix3QkFBQSxFQUFBLFlBQThCO1lBQTlCLFlBQU8sR0FBUCxPQUFPLENBQXVCO1FBQUcsQ0FBQztRQUV0RDs7O1dBR0c7UUFDSSx1Q0FBVyxHQUFsQixVQUNJLFVBQXlCLEVBQUUsTUFBdUIsRUFDbEQsb0JBQTZFO1lBRmpGLGlCQThmQztZQTdmOEIsdUJBQUEsRUFBQSxjQUF1QjtZQUdwRCxJQUFNLE1BQU0sR0FBRyxJQUFJLGlCQUFPLENBQUMsVUFBVSxDQUFDLENBQUM7WUFDdkMsSUFBTSxPQUFPLEdBQ1QsSUFBSSxHQUFHLEVBQTJFLENBQUM7WUFDdkYsSUFBTSxtQkFBbUIsR0FBRyxvQkFBb0IsSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLG9CQUFvQixDQUFDLENBQUM7Z0JBQ25GLFVBQUMsS0FBb0IsRUFBRSxJQUFhO29CQUNoQyxPQUFBLEtBQUksQ0FBQyxPQUFPLENBQUMsb0JBQXNCLENBQUMsb0JBQW9CLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxFQUFFLElBQUksQ0FBQztnQkFBNUUsQ0FBNEUsQ0FBQyxDQUFDO2dCQUNsRixvQkFBb0IsQ0FBQztZQUN6QixJQUFNLGdCQUFnQixHQUFHLG9CQUFvQixDQUFDLENBQUMsdUNBQ3ZDLElBQUksQ0FBQyxPQUFPLEtBQUUsb0JBQW9CLEVBQUUsbUJBQW1CLElBQUUsQ0FBQztnQkFDOUQsSUFBSSxDQUFDLE9BQU8sQ0FBQztZQUNqQixJQUFJLFFBQXNGLENBQUM7WUFDM0YsSUFBTSxTQUFTLEdBQUcsSUFBSSxxQkFBUyxDQUFDLE1BQU0sRUFBRSxPQUFPLEVBQUUsZ0JBQWdCLEVBQUUsVUFBQyxJQUFJLEVBQUUsS0FBSztnQkFDN0UsSUFBSSxDQUFDLFFBQVE7b0JBQUUsUUFBUSxHQUFHLEVBQUUsQ0FBQztnQkFDN0IsUUFBUSxDQUFDLElBQUksQ0FBQyxHQUFHLEtBQUssQ0FBQztZQUN6QixDQUFDLENBQUMsQ0FBQztZQUNILElBQUksT0FBTyxHQUFxQyxTQUFTLENBQUM7WUFFMUQsU0FBUyxnQkFBZ0IsQ0FBQyxhQUEyQjtnQkFDbkQsT0FBbUMsU0FBUyxDQUFDLFlBQVksQ0FBQyxhQUFhLENBQUMsVUFBVSxDQUFDLENBQUM7WUFDdEYsQ0FBQztZQUVELFNBQVMsV0FBVyxDQUEwQixLQUFRLEVBQUUsSUFBYTtnQkFDbkUsSUFBSSxtQkFBbUIsRUFBRTtvQkFDdkIsS0FBSyxHQUFHLG1CQUFtQixDQUFDLEtBQXNCLEVBQUUsSUFBSSxDQUFNLENBQUM7aUJBQ2hFO2dCQUNELE9BQU8sMEJBQWMsQ0FBQyxLQUFLLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBRSxVQUFVLENBQUMsQ0FBQztZQUMxRCxDQUFDO1lBRUQsU0FBUyxRQUFRLENBQ2IsT0FBZSxFQUFFLElBQWMsRUFBRSxPQUFrQztnQkFDckUsT0FBTyx1QkFBVyxDQUFDLE9BQU8sRUFBRSxJQUFJLEVBQUUsT0FBTyxFQUFFLFVBQVUsQ0FBQyxDQUFDO1lBQ3pELENBQUM7WUFFRCxTQUFTLHNCQUFzQixDQUMzQixtQkFDb0I7Z0JBQ3RCLElBQUksbUJBQW1CLENBQUMsSUFBSSxJQUFJLG1CQUFtQixDQUFDLElBQUksQ0FBQyxJQUFJLElBQUksRUFBRSxDQUFDLFVBQVUsQ0FBQyxVQUFVLEVBQUU7b0JBQ3pGLElBQU0sUUFBUSxHQUFrQixtQkFBbUIsQ0FBQyxJQUFJLENBQUM7b0JBQ3pELElBQU0sWUFBWSxHQUFHLFFBQVEsQ0FBQyxJQUFJLENBQUM7b0JBQ25DLElBQU0sWUFBWSxHQUFHLG1CQUFtQixDQUFDLElBQUksQ0FBQztvQkFDOUMsSUFBSSxZQUFZLElBQUksWUFBWSxDQUFDLFVBQVUsQ0FBQyxNQUFNLElBQUksQ0FBQyxFQUFFO3dCQUN2RCxJQUFNLFNBQVMsR0FBRyxZQUFZLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDO3dCQUM3QyxJQUFJLFNBQVMsQ0FBQyxJQUFJLEtBQUssRUFBRSxDQUFDLFVBQVUsQ0FBQyxlQUFlLEVBQUU7NEJBQ3BELElBQU0sZUFBZSxHQUF1QixTQUFTLENBQUM7NEJBQ3RELElBQUksZUFBZSxDQUFDLFVBQVUsRUFBRTtnQ0FDOUIsSUFBTSxJQUFJLEdBQXFCO29DQUM3QixVQUFVLEVBQUUsVUFBVTtvQ0FDdEIsVUFBVSxFQUFFLE9BQU8sQ0FBQyxtQkFBbUIsQ0FBQyxVQUFVLENBQUM7b0NBQ25ELEtBQUssRUFBRSxTQUFTLENBQUMsWUFBWSxDQUFDLGVBQWUsQ0FBQyxVQUFVLENBQUM7aUNBQzFELENBQUM7Z0NBQ0YsSUFBSSxtQkFBbUIsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLFVBQUEsQ0FBQyxJQUFJLE9BQUEsQ0FBQyxDQUFDLFdBQVcsSUFBSSxJQUFJLEVBQXJCLENBQXFCLENBQUMsRUFBRTtvQ0FDbkUsSUFBSSxDQUFDLFFBQVEsR0FBRyxtQkFBbUIsQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUM5QyxVQUFBLENBQUMsSUFBSSxPQUFBLENBQUMsQ0FBQyxXQUFXLElBQUksU0FBUyxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsV0FBVyxDQUFDLEVBQXRELENBQXNELENBQUMsQ0FBQztpQ0FDbEU7Z0NBQ0QsT0FBTyxXQUFXLENBQUMsRUFBQyxJQUFJLE1BQUEsRUFBRSxJQUFJLEVBQUUsWUFBWSxFQUFDLEVBQUUsbUJBQW1CLENBQUMsQ0FBQzs2QkFDckU7eUJBQ0Y7cUJBQ0Y7aUJBQ0Y7WUFDSCxDQUFDO1lBRUQsU0FBUyxlQUFlLENBQUMsZ0JBQXFDOztnQkFDNUQsSUFBTSxNQUFNLEdBQWtCLEVBQUMsVUFBVSxFQUFFLE9BQU8sRUFBQyxDQUFDO2dCQUVwRCxTQUFTLGFBQWEsQ0FBQyxVQUFrRDtvQkFFdkUsSUFBSSxVQUFVLElBQUksVUFBVSxDQUFDLE1BQU07d0JBQ2pDLE9BQU8sVUFBVSxDQUFDLEdBQUcsQ0FBQyxVQUFBLFNBQVMsSUFBSSxPQUFBLGdCQUFnQixDQUFDLFNBQVMsQ0FBQyxFQUEzQixDQUEyQixDQUFDLENBQUM7b0JBQ2xFLE9BQU8sU0FBUyxDQUFDO2dCQUNuQixDQUFDO2dCQUVELFNBQVMsYUFBYSxDQUFDLElBQWE7b0JBRWxDLElBQU0sTUFBTSxHQUFHLFNBQVMsQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLENBQUM7b0JBQzVDLElBQUksd0JBQWUsQ0FBQyxNQUFNLENBQUMsSUFBSSw4Q0FBcUMsQ0FBQyxNQUFNLENBQUM7d0JBQ3hFLDJDQUFrQyxDQUFDLE1BQU0sQ0FBQyxFQUFFO3dCQUM5QyxPQUFPLE1BQU0sQ0FBQztxQkFDZjt5QkFBTTt3QkFDTCxPQUFPLFFBQVEsQ0FBQywyQkFBMkIsRUFBRSxJQUFJLENBQUMsQ0FBQztxQkFDcEQ7Z0JBQ0gsQ0FBQztnQkFFRCxvQkFBb0I7Z0JBQ3BCLElBQUksZ0JBQWdCLENBQUMsZUFBZSxFQUFFO29CQUNwQyxnQkFBZ0IsQ0FBQyxlQUFlLENBQUMsT0FBTyxDQUFDLFVBQUMsRUFBRTt3QkFDMUMsSUFBSSxFQUFFLENBQUMsS0FBSyxLQUFLLEVBQUUsQ0FBQyxVQUFVLENBQUMsY0FBYyxJQUFJLEVBQUUsQ0FBQyxLQUFLLEVBQUU7NEJBQ3pELEVBQUUsQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLFVBQUEsSUFBSSxJQUFJLE9BQUEsTUFBTSxDQUFDLE9BQU8sR0FBRyxhQUFhLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxFQUEvQyxDQUErQyxDQUFDLENBQUM7eUJBQzNFO29CQUNILENBQUMsQ0FBQyxDQUFDO2lCQUNKO2dCQUVELG1DQUFtQztnQkFDbkMsSUFBTSxjQUFjLEdBQUcsZ0JBQWdCLENBQUMsY0FBYyxDQUFDO2dCQUN2RCxJQUFJLGNBQWMsSUFBSSxjQUFjLENBQUMsTUFBTSxFQUFFO29CQUMzQyxNQUFNLENBQUMsS0FBSyxHQUFHLGNBQWMsQ0FBQyxNQUFNLENBQUM7aUJBQ3RDO2dCQUVELHVCQUF1QjtnQkFDdkIsSUFBSSxnQkFBZ0IsQ0FBQyxVQUFVLEVBQUU7b0JBQy9CLE1BQU0sQ0FBQyxVQUFVLEdBQUcsYUFBYSxDQUFDLGdCQUFnQixDQUFDLFVBQVUsQ0FBQyxDQUFDO2lCQUNoRTtnQkFFRCxvQkFBb0I7Z0JBQ3BCLElBQUksT0FBTyxHQUFxQixJQUFJLENBQUM7Z0JBQ3JDLFNBQVMsWUFBWSxDQUFDLElBQVksRUFBRSxRQUF3QjtvQkFDMUQsSUFBSSxDQUFDLE9BQU87d0JBQUUsT0FBTyxHQUFHLEVBQUUsQ0FBQztvQkFDM0IsSUFBTSxJQUFJLEdBQUcsT0FBTyxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUM7b0JBQy9ELElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7b0JBQ3BCLE9BQU8sQ0FBQyxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUM7Z0JBQ3ZCLENBQUM7Z0JBRUQsZ0JBQWdCO2dCQUNoQixJQUFJLE9BQU8sR0FBNEQsSUFBSSxDQUFDO2dCQUM1RSxTQUFTLGtCQUFrQixDQUFDLElBQVksRUFBRSxLQUF1QztvQkFDL0UsSUFBSSxDQUFDLE9BQU87d0JBQUUsT0FBTyxHQUFHLEVBQUUsQ0FBQztvQkFDM0IsT0FBTyxDQUFDLElBQUksQ0FBQyxHQUFHLEtBQUssQ0FBQztnQkFDeEIsQ0FBQzs7b0JBRUQsS0FBcUIsSUFBQSxLQUFBLGlCQUFBLGdCQUFnQixDQUFDLE9BQU8sQ0FBQSxnQkFBQSw0QkFBRTt3QkFBMUMsSUFBTSxNQUFNLFdBQUE7d0JBQ2YsSUFBSSxhQUFhLEdBQUcsS0FBSyxDQUFDO3dCQUMxQixRQUFRLE1BQU0sQ0FBQyxJQUFJLEVBQUU7NEJBQ25CLEtBQUssRUFBRSxDQUFDLFVBQVUsQ0FBQyxXQUFXLENBQUM7NEJBQy9CLEtBQUssRUFBRSxDQUFDLFVBQVUsQ0FBQyxpQkFBaUI7Z0NBQ2xDLGFBQWEsR0FBRyxNQUFNLENBQUMsSUFBSSxLQUFLLEVBQUUsQ0FBQyxVQUFVLENBQUMsV0FBVyxDQUFDO2dDQUMxRCxJQUFNLE1BQU0sR0FBbUQsTUFBTSxDQUFDO2dDQUN0RSxJQUFJLFFBQVEsQ0FBQyxNQUFNLENBQUMsRUFBRTtvQ0FDcEIsSUFBTSxTQUFTLEdBQUcsc0JBQXNCLENBQXVCLE1BQU0sQ0FBQyxDQUFDO29DQUN2RSxJQUFJLFNBQVMsRUFBRTt3Q0FDYixrQkFBa0IsQ0FBQyxTQUFTLENBQUMsSUFBSSxFQUFFLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQztxQ0FDcEQ7b0NBQ0QsU0FBUztpQ0FDVjtnQ0FDRCxJQUFNLGdCQUFnQixHQUFHLGFBQWEsQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLENBQUM7Z0NBQzFELElBQU0sVUFBVSxHQUFHLE1BQU0sQ0FBQyxVQUFVLENBQUM7Z0NBQ3JDLElBQU0sc0JBQXNCLEdBQ3lDLEVBQUUsQ0FBQztnQ0FDeEUsSUFBTSxjQUFjLEdBRThCLEVBQUUsQ0FBQztnQ0FDckQsSUFBSSxnQkFBZ0IsR0FBWSxLQUFLLENBQUM7Z0NBQ3RDLElBQUksZ0JBQWdCLEdBQVksS0FBSyxDQUFDOztvQ0FDdEMsS0FBd0IsSUFBQSw4QkFBQSxpQkFBQSxVQUFVLENBQUEsQ0FBQSxzQ0FBQSw4REFBRTt3Q0FBL0IsSUFBTSxTQUFTLHVCQUFBO3dDQUNsQixJQUFNLGFBQWEsR0FBRyxhQUFhLENBQUMsU0FBUyxDQUFDLFVBQVUsQ0FBQyxDQUFDO3dDQUMxRCxzQkFBc0IsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUM7d0NBQzNDLGdCQUFnQixHQUFHLGdCQUFnQixJQUFJLENBQUMsQ0FBQyxhQUFhLENBQUM7d0NBQ3ZELElBQUksYUFBYSxFQUFFOzRDQUNqQixJQUFJLFNBQVMsQ0FBQyxJQUFJLEVBQUU7Z0RBQ2xCLGNBQWMsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDOzZDQUNwRDtpREFBTTtnREFDTCxjQUFjLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDOzZDQUMzQjs0Q0FDRCxnQkFBZ0IsR0FBRyxJQUFJLENBQUM7eUNBQ3pCO3FDQUNGOzs7Ozs7Ozs7Z0NBQ0QsSUFBTSxJQUFJLEdBQW1CLEVBQUMsVUFBVSxFQUFFLGFBQWEsQ0FBQyxDQUFDLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQyxRQUFRLEVBQUMsQ0FBQztnQ0FDcEYsSUFBTSxJQUFJLEdBQUcsYUFBYSxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDO2dDQUN4RSxJQUFJLGdCQUFnQixFQUFFO29DQUNwQixJQUFJLENBQUMsVUFBVSxHQUFHLGdCQUFnQixDQUFDO2lDQUNwQztnQ0FDRCxJQUFJLGdCQUFnQixFQUFFO29DQUNwQixJQUFJLENBQUMsbUJBQW1CLEdBQUcsc0JBQXNCLENBQUM7aUNBQ25EO2dDQUNELElBQUksZ0JBQWdCLEVBQUU7b0NBQ0UsSUFBSyxDQUFDLFVBQVUsR0FBRyxjQUFjLENBQUM7aUNBQ3pEO2dDQUNELElBQUksQ0FBQyx3QkFBZSxDQUFDLElBQUksQ0FBQyxFQUFFO29DQUMxQixZQUFZLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDO2lDQUMxQjtnQ0FDRCxNQUFNOzRCQUNSLEtBQUssRUFBRSxDQUFDLFVBQVUsQ0FBQyxtQkFBbUIsQ0FBQzs0QkFDdkMsS0FBSyxFQUFFLENBQUMsVUFBVSxDQUFDLFdBQVcsQ0FBQzs0QkFDL0IsS0FBSyxFQUFFLENBQUMsVUFBVSxDQUFDLFdBQVc7Z0NBQzVCLElBQU0sUUFBUSxHQUEyQixNQUFNLENBQUM7Z0NBQ2hELElBQUksUUFBUSxDQUFDLFFBQVEsQ0FBQyxFQUFFO29DQUN0QixJQUFNLE1BQUksR0FBRyxTQUFTLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQztvQ0FDN0MsSUFBSSxDQUFDLHdCQUFlLENBQUMsTUFBSSxDQUFDLElBQUksQ0FBQyx3QkFBd0IsQ0FBQyxNQUFJLENBQUMsRUFBRTt3Q0FDN0QsSUFBSSxRQUFRLENBQUMsV0FBVyxFQUFFOzRDQUN4QixJQUFNLEtBQUssR0FBRyxTQUFTLENBQUMsWUFBWSxDQUFDLFFBQVEsQ0FBQyxXQUFXLENBQUMsQ0FBQzs0Q0FDM0Qsa0JBQWtCLENBQUMsTUFBSSxFQUFFLEtBQUssQ0FBQyxDQUFDO3lDQUNqQzs2Q0FBTTs0Q0FDTCxrQkFBa0IsQ0FBQyxNQUFJLEVBQUUsUUFBUSxDQUFDLDBCQUEwQixFQUFFLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO3lDQUMvRTtxQ0FDRjtpQ0FDRjtnQ0FDRCxJQUFNLGtCQUFrQixHQUFHLGFBQWEsQ0FBQyxRQUFRLENBQUMsVUFBVSxDQUFDLENBQUM7Z0NBQzlELElBQUksa0JBQWtCLEVBQUU7b0NBQ3RCLElBQU0sTUFBSSxHQUFHLFNBQVMsQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDO29DQUM3QyxJQUFJLENBQUMsd0JBQWUsQ0FBQyxNQUFJLENBQUMsRUFBRTt3Q0FDMUIsWUFBWSxDQUFDLE1BQUksRUFBRSxFQUFDLFVBQVUsRUFBRSxVQUFVLEVBQUUsVUFBVSxFQUFFLGtCQUFrQixFQUFDLENBQUMsQ0FBQztxQ0FDOUU7aUNBQ0Y7Z0NBQ0QsTUFBTTt5QkFDVDtxQkFDRjs7Ozs7Ozs7O2dCQUNELElBQUksT0FBTyxFQUFFO29CQUNYLE1BQU0sQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFDO2lCQUMxQjtnQkFDRCxJQUFJLE9BQU8sRUFBRTtvQkFDWCxNQUFNLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQztpQkFDMUI7Z0JBRUQsT0FBTyxXQUFXLENBQUMsTUFBTSxFQUFFLGdCQUFnQixDQUFDLENBQUM7WUFDL0MsQ0FBQztZQUVELHVEQUF1RDtZQUN2RCxJQUFNLFNBQVMsR0FBRyxJQUFJLEdBQUcsRUFBa0IsQ0FBQztZQUM1QyxFQUFFLENBQUMsWUFBWSxDQUFDLFVBQVUsRUFBRSxVQUFBLElBQUk7Z0JBQzlCLFFBQVEsSUFBSSxDQUFDLElBQUksRUFBRTtvQkFDakIsS0FBSyxFQUFFLENBQUMsVUFBVSxDQUFDLGlCQUFpQjt3QkFDbEMsSUFBTSxpQkFBaUIsR0FBeUIsSUFBSSxDQUFDO3dCQUM5QyxJQUFBLG1EQUFlLEVBQUUsNkNBQVksQ0FBc0I7d0JBRTFELElBQUksQ0FBQyxlQUFlLEVBQUU7NEJBQ3BCLCtEQUErRDs0QkFDL0QsWUFBYyxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsVUFBQSxJQUFJO2dDQUNsQyxJQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQztnQ0FDbEMsSUFBTSxJQUFJLEdBQUcsQ0FBQyxJQUFJLENBQUMsWUFBWSxJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUM7Z0NBQ25ELFNBQVMsQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFLFVBQVUsQ0FBQyxDQUFDOzRCQUNsQyxDQUFDLENBQUMsQ0FBQzt5QkFDSjtpQkFDSjtZQUNILENBQUMsQ0FBQyxDQUFDO1lBRUgsSUFBTSxRQUFRLEdBQUcsVUFBQyxJQUFhLElBQUssT0FBQSxVQUFVLENBQUMsaUJBQWlCO2dCQUM1RCxFQUFFLENBQUMsd0JBQXdCLENBQUMsSUFBc0IsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxhQUFhLENBQUMsTUFBTSxFQUQ3QyxDQUM2QyxDQUFDO1lBQ2xGLElBQU0sb0JBQW9CLEdBQUcsVUFBQyxVQUEwQjtnQkFDcEQsT0FBQSxVQUFVLElBQUksU0FBUyxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDO1lBQTVDLENBQTRDLENBQUM7WUFDakQsSUFBTSxVQUFVLEdBQ1osVUFBQyxJQUM0QztnQkFDekMsT0FBQSxRQUFRLENBQUMsSUFBSSxDQUFDLElBQUksb0JBQW9CLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQztZQUFqRCxDQUFpRCxDQUFDO1lBQzFELElBQU0sc0JBQXNCLEdBQUcsVUFBQyxVQUEwQjtnQkFDdEQsT0FBQSxVQUFVLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSxVQUFVLENBQUMsSUFBSSxDQUFDO1lBQWpFLENBQWlFLENBQUM7WUFDdEUsSUFBTSxZQUFZLEdBQ2QsVUFBQyxJQUM0QyxJQUFLLE9BQUEsc0JBQXNCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFqQyxDQUFpQyxDQUFDO1lBR3hGLG9DQUFvQztZQUNwQyxFQUFFLENBQUMsWUFBWSxDQUFDLFVBQVUsRUFBRSxVQUFBLElBQUk7Z0JBQzlCLFFBQVEsSUFBSSxDQUFDLElBQUksRUFBRTtvQkFDakIsS0FBSyxFQUFFLENBQUMsVUFBVSxDQUFDLGdCQUFnQjt3QkFDakMsSUFBTSxnQkFBZ0IsR0FBd0IsSUFBSSxDQUFDO3dCQUNuRCxJQUFJLGdCQUFnQixDQUFDLElBQUksRUFBRTs0QkFDekIsSUFBTSxTQUFTLEdBQUcsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQzs0QkFDN0MsSUFBSSxVQUFVLENBQUMsZ0JBQWdCLENBQUMsRUFBRTtnQ0FDaEMsTUFBTSxDQUFDLE1BQU0sQ0FDVCxTQUFTLEVBQUUsRUFBQyxVQUFVLEVBQUUsV0FBVyxFQUFFLElBQUksRUFBRSxZQUFZLENBQUMsZ0JBQWdCLENBQUMsRUFBQyxDQUFDLENBQUM7NkJBQ2pGO2lDQUFNO2dDQUNMLE1BQU0sQ0FBQyxNQUFNLENBQ1QsU0FBUyxFQUFFLFFBQVEsQ0FBQyxpQ0FBaUMsRUFBRSxJQUFJLEVBQUUsRUFBQyxTQUFTLFdBQUEsRUFBQyxDQUFDLENBQUMsQ0FBQzs2QkFDaEY7eUJBQ0Y7d0JBQ0QsTUFBTTtvQkFFUixLQUFLLEVBQUUsQ0FBQyxVQUFVLENBQUMsb0JBQW9CO3dCQUNyQyxJQUFNLG9CQUFvQixHQUE0QixJQUFJLENBQUM7d0JBQzNELElBQUksb0JBQW9CLENBQUMsSUFBSSxFQUFFOzRCQUM3QixJQUFNLGFBQWEsR0FBRyxvQkFBb0IsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDOzRCQUNyRCwyRUFBMkU7NEJBQzNFLE1BQU0sQ0FBQyxNQUFNLENBQUMsYUFBYSxFQUFFLEVBQUMsVUFBVSxFQUFFLFdBQVcsRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFDLENBQUMsQ0FBQzt5QkFDdEU7d0JBQ0QsTUFBTTtvQkFFUixLQUFLLEVBQUUsQ0FBQyxVQUFVLENBQUMsbUJBQW1CO3dCQUNwQyxJQUFNLG1CQUFtQixHQUEyQixJQUFJLENBQUM7d0JBQ3pELElBQUksQ0FBQyxVQUFVLENBQUMsbUJBQW1CLENBQUMsRUFBRTs0QkFDcEMsa0RBQWtEOzRCQUNsRCxJQUFNLFFBQVEsR0FBRyxtQkFBbUIsQ0FBQyxJQUFJLENBQUM7NEJBQzFDLElBQUksUUFBUSxJQUFJLFFBQVEsQ0FBQyxJQUFJLEVBQUU7Z0NBQzdCLE1BQU0sQ0FBQyxNQUFNLENBQ1QsUUFBUSxDQUFDLElBQUksRUFDYixRQUFRLENBQ0osc0NBQXNDLEVBQUUsUUFBUSxFQUFFLEVBQUMsSUFBSSxFQUFFLFFBQVEsQ0FBQyxJQUFJLEVBQUMsQ0FBQyxDQUFDLENBQUM7NkJBQ25GO3lCQUNGO3dCQUNELE1BQU07aUJBQ1Q7WUFDSCxDQUFDLENBQUMsQ0FBQztZQUVILEVBQUUsQ0FBQyxZQUFZLENBQUMsVUFBVSxFQUFFLFVBQUEsSUFBSTs7Z0JBQzlCLFFBQVEsSUFBSSxDQUFDLElBQUksRUFBRTtvQkFDakIsS0FBSyxFQUFFLENBQUMsVUFBVSxDQUFDLGlCQUFpQjt3QkFDbEMsNkJBQTZCO3dCQUM3QixJQUFNLGlCQUFpQixHQUF5QixJQUFJLENBQUM7d0JBQzlDLElBQUEsbURBQWUsRUFBRSw2Q0FBWSxDQUFzQjt3QkFFMUQsSUFBSSxDQUFDLGVBQWUsRUFBRTs0QkFDcEIsb0RBQW9EOzRCQUNwRCxJQUFJLFlBQVksRUFBRTtnQ0FDaEIsWUFBWSxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsVUFBQSxJQUFJO29DQUNoQyxJQUFNLElBQUksR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQztvQ0FDNUIsMkVBQTJFO29DQUMzRSx5QkFBeUI7b0NBQ3pCLElBQUksQ0FBQyxRQUFRLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLEVBQUU7d0NBQ2hDLElBQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxZQUFZLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQzt3Q0FDaEQsSUFBTSxLQUFLLEdBQWtCLFNBQVMsQ0FBQyxZQUFZLENBQUMsUUFBUSxDQUFDLENBQUM7d0NBQzlELElBQUksQ0FBQyxRQUFROzRDQUFFLFFBQVEsR0FBRyxFQUFFLENBQUM7d0NBQzdCLFFBQVEsQ0FBQyxJQUFJLENBQUMsR0FBRyxXQUFXLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxDQUFDO3FDQUMzQztnQ0FDSCxDQUFDLENBQUMsQ0FBQzs2QkFDSjt5QkFDRjt3QkFFRCxJQUFJLGVBQWUsSUFBSSxlQUFlLENBQUMsSUFBSSxJQUFJLEVBQUUsQ0FBQyxVQUFVLENBQUMsYUFBYSxFQUFFOzRCQUMxRSw2REFBNkQ7NEJBQzdELHFGQUFxRjs0QkFDckYsSUFBTSxJQUFJLEdBQXNCLGVBQWdCLENBQUMsSUFBSSxDQUFDOzRCQUN0RCxJQUFNLFlBQVksR0FBeUIsRUFBQyxJQUFJLE1BQUEsRUFBQyxDQUFDOzRCQUNsRCxJQUFJLFlBQVksRUFBRTtnQ0FDaEIsWUFBWSxDQUFDLE1BQU0sR0FBRyxZQUFZLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FDM0MsVUFBQSxJQUFJLElBQUksT0FBQSxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxFQUFDLElBQUksRUFBRSxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksRUFBRSxFQUFFLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUMsQ0FBQyxDQUFDO29DQUNwRCxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksRUFEbEMsQ0FDa0MsQ0FBQyxDQUFDOzZCQUNqRDs0QkFDRCxJQUFJLENBQUMsT0FBTztnQ0FBRSxPQUFPLEdBQUcsRUFBRSxDQUFDOzRCQUMzQixPQUFPLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDO3lCQUM1Qjt3QkFDRCxNQUFNO29CQUNSLEtBQUssRUFBRSxDQUFDLFVBQVUsQ0FBQyxnQkFBZ0I7d0JBQ2pDLElBQU0sZ0JBQWdCLEdBQXdCLElBQUksQ0FBQzt3QkFDbkQsSUFBSSxnQkFBZ0IsQ0FBQyxJQUFJLEVBQUU7NEJBQ3pCLElBQUksVUFBVSxDQUFDLGdCQUFnQixDQUFDLEVBQUU7Z0NBQ2hDLElBQU0sSUFBSSxHQUFHLFlBQVksQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO2dDQUM1QyxJQUFJLElBQUksRUFBRTtvQ0FDUixJQUFJLENBQUMsUUFBUTt3Q0FBRSxRQUFRLEdBQUcsRUFBRSxDQUFDO29DQUM3QixRQUFRLENBQUMsSUFBSSxDQUFDLEdBQUcsZUFBZSxDQUFDLGdCQUFnQixDQUFDLENBQUM7aUNBQ3BEOzZCQUNGO3lCQUNGO3dCQUNELGlEQUFpRDt3QkFDakQsTUFBTTtvQkFFUixLQUFLLEVBQUUsQ0FBQyxVQUFVLENBQUMsb0JBQW9CO3dCQUNyQyxJQUFNLGVBQWUsR0FBNEIsSUFBSSxDQUFDO3dCQUN0RCxJQUFJLGVBQWUsQ0FBQyxJQUFJLElBQUksVUFBVSxDQUFDLGVBQWUsQ0FBQyxFQUFFOzRCQUN2RCxJQUFNLElBQUksR0FBRyxZQUFZLENBQUMsZUFBZSxDQUFDLENBQUM7NEJBQzNDLElBQUksSUFBSSxFQUFFO2dDQUNSLElBQUksQ0FBQyxRQUFRO29DQUFFLFFBQVEsR0FBRyxFQUFFLENBQUM7Z0NBQzdCLFFBQVEsQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFDLFVBQVUsRUFBRSxXQUFXLEVBQUMsQ0FBQzs2QkFDNUM7eUJBQ0Y7d0JBQ0QsTUFBTTtvQkFFUixLQUFLLEVBQUUsQ0FBQyxVQUFVLENBQUMsb0JBQW9CO3dCQUNyQyxJQUFNLG9CQUFvQixHQUE0QixJQUFJLENBQUM7d0JBQzNELElBQUksb0JBQW9CLENBQUMsSUFBSSxJQUFJLFVBQVUsQ0FBQyxvQkFBb0IsQ0FBQyxFQUFFOzRCQUNqRSxJQUFNLElBQUksR0FBRyxZQUFZLENBQUMsb0JBQW9CLENBQUMsQ0FBQzs0QkFDaEQsSUFBSSxJQUFJLEVBQUU7Z0NBQ1IsSUFBSSxDQUFDLFFBQVE7b0NBQUUsUUFBUSxHQUFHLEVBQUUsQ0FBQztnQ0FDN0IsUUFBUSxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUMsVUFBVSxFQUFFLFdBQVcsRUFBQyxDQUFDOzZCQUM1Qzt5QkFDRjt3QkFDRCxNQUFNO29CQUVSLEtBQUssRUFBRSxDQUFDLFVBQVUsQ0FBQyxtQkFBbUI7d0JBQ3BDLG9FQUFvRTt3QkFDcEUsK0RBQStEO3dCQUMvRCxJQUFNLG1CQUFtQixHQUEyQixJQUFJLENBQUM7d0JBQ3pELElBQUksVUFBVSxDQUFDLG1CQUFtQixDQUFDLElBQUksbUJBQW1CLENBQUMsSUFBSSxFQUFFOzRCQUMvRCxJQUFNLElBQUksR0FBRyxZQUFZLENBQUMsbUJBQW1CLENBQUMsQ0FBQzs0QkFDL0MsSUFBTSxTQUFTLEdBQUcsc0JBQXNCLENBQUMsbUJBQW1CLENBQUMsQ0FBQzs0QkFDOUQsSUFBSSxJQUFJLEVBQUU7Z0NBQ1IsSUFBSSxDQUFDLFFBQVE7b0NBQUUsUUFBUSxHQUFHLEVBQUUsQ0FBQztnQ0FDN0IsZ0VBQWdFO2dDQUNoRSxRQUFRLENBQUMsSUFBSSxDQUFDLEdBQUcsU0FBUyxDQUFDLENBQUMsQ0FBQyxXQUFXLENBQUMsU0FBUyxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDO29DQUNsQyxFQUFFLFVBQVUsRUFBRSxVQUFVLEVBQVUsQ0FBQzs2QkFDbEU7eUJBQ0Y7d0JBQ0QsTUFBTTtvQkFFUixLQUFLLEVBQUUsQ0FBQyxVQUFVLENBQUMsZUFBZTt3QkFDaEMsSUFBTSxlQUFlLEdBQXVCLElBQUksQ0FBQzt3QkFDakQsSUFBSSxVQUFVLENBQUMsZUFBZSxDQUFDLEVBQUU7NEJBQy9CLElBQU0sZUFBZSxHQUFvQyxFQUFFLENBQUM7NEJBQzVELElBQU0sUUFBUSxHQUFHLFlBQVksQ0FBQyxlQUFlLENBQUMsQ0FBQzs0QkFDL0MsSUFBSSxnQkFBZ0IsR0FBa0IsQ0FBQyxDQUFDOzRCQUN4QyxJQUFJLGNBQWMsR0FBRyxDQUFDLENBQUM7O2dDQUN2QixLQUFxQixJQUFBLEtBQUEsaUJBQUEsZUFBZSxDQUFDLE9BQU8sQ0FBQSxnQkFBQSw0QkFBRTtvQ0FBekMsSUFBTSxNQUFNLFdBQUE7b0NBQ2YsSUFBSSxTQUFTLFNBQWUsQ0FBQztvQ0FDN0IsSUFBSSxDQUFDLE1BQU0sQ0FBQyxXQUFXLEVBQUU7d0NBQ3ZCLFNBQVMsR0FBRyxnQkFBZ0IsQ0FBQztxQ0FDOUI7eUNBQU07d0NBQ0wsU0FBUyxHQUFHLFNBQVMsQ0FBQyxZQUFZLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxDQUFDO3FDQUN4RDtvQ0FDRCxJQUFJLElBQUksR0FBcUIsU0FBUyxDQUFDO29DQUN2QyxJQUFJLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxJQUFJLEVBQUUsQ0FBQyxVQUFVLENBQUMsVUFBVSxFQUFFO3dDQUNoRCxJQUFNLFVBQVUsR0FBa0IsTUFBTSxDQUFDLElBQUksQ0FBQzt3Q0FDOUMsSUFBSSxHQUFHLFVBQVUsQ0FBQyxJQUFJLENBQUM7d0NBQ3ZCLGVBQWUsQ0FBQyxJQUFJLENBQUMsR0FBRyxTQUFTLENBQUM7d0NBQ2xDLGNBQWMsRUFBRSxDQUFDO3FDQUNsQjtvQ0FDRCxJQUFJLE9BQU8sU0FBUyxLQUFLLFFBQVEsRUFBRTt3Q0FDakMsZ0JBQWdCLEdBQUcsU0FBUyxHQUFHLENBQUMsQ0FBQztxQ0FDbEM7eUNBQU0sSUFBSSxJQUFJLEVBQUU7d0NBQ2Ysc0VBQXNFO3dDQUN0RSxvQ0FBb0M7d0NBQ3BDLGdCQUFnQixHQUFHOzRDQUNqQixVQUFVLEVBQUUsUUFBUTs0Q0FDcEIsUUFBUSxFQUFFLEdBQUc7NENBQ2IsSUFBSSxFQUFFO2dEQUNKLFVBQVUsRUFBRSxRQUFRO2dEQUNwQixVQUFVLEVBQUUsV0FBVyxDQUFDLEVBQUMsVUFBVSxFQUFFLFdBQVcsRUFBRSxJQUFJLEVBQUUsUUFBUSxFQUFDLEVBQUUsSUFBSSxDQUFDLEVBQUUsSUFBSSxNQUFBOzZDQUMvRTt5Q0FDSyxDQUFDO3FDQUNWO3lDQUFNO3dDQUNMLGdCQUFnQjs0Q0FDWixXQUFXLENBQUMsUUFBUSxDQUFDLDhCQUE4QixFQUFFLE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQztxQ0FDOUU7aUNBQ0Y7Ozs7Ozs7Ozs0QkFDRCxJQUFJLGNBQWMsRUFBRTtnQ0FDbEIsSUFBSSxRQUFRLEVBQUU7b0NBQ1osSUFBSSxDQUFDLFFBQVE7d0NBQUUsUUFBUSxHQUFHLEVBQUUsQ0FBQztvQ0FDN0IsUUFBUSxDQUFDLFFBQVEsQ0FBQyxHQUFHLFdBQVcsQ0FBQyxlQUFlLEVBQUUsSUFBSSxDQUFDLENBQUM7aUNBQ3pEOzZCQUNGO3lCQUNGO3dCQUNELE1BQU07b0JBRVIsS0FBSyxFQUFFLENBQUMsVUFBVSxDQUFDLGlCQUFpQjt3QkFDbEMsSUFBTSxpQkFBaUIsR0FBeUIsSUFBSSxDQUFDO2dEQUMxQyxtQkFBbUI7NEJBQzVCLElBQUksbUJBQW1CLENBQUMsSUFBSSxDQUFDLElBQUksSUFBSSxFQUFFLENBQUMsVUFBVSxDQUFDLFVBQVUsRUFBRTtnQ0FDN0QsSUFBTSxRQUFRLEdBQWtCLG1CQUFtQixDQUFDLElBQUksQ0FBQztnQ0FDekQsSUFBSSxRQUFRLFNBQWUsQ0FBQztnQ0FDNUIsSUFBSSxtQkFBbUIsQ0FBQyxXQUFXLEVBQUU7b0NBQ25DLFFBQVEsR0FBRyxTQUFTLENBQUMsWUFBWSxDQUFDLG1CQUFtQixDQUFDLFdBQVcsQ0FBQyxDQUFDO2lDQUNwRTtxQ0FBTTtvQ0FDTCxRQUFRLEdBQUcsV0FBVyxDQUFDLFFBQVEsQ0FBQywwQkFBMEIsRUFBRSxRQUFRLENBQUMsRUFBRSxRQUFRLENBQUMsQ0FBQztpQ0FDbEY7Z0NBQ0QsSUFBSSxRQUFRLEdBQUcsS0FBSyxDQUFDO2dDQUNyQixJQUFJLFFBQVEsQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLFFBQVEsQ0FBQyxtQkFBbUIsQ0FBQztvQ0FDNUQsb0JBQW9CLENBQUMsUUFBUSxDQUFDLEVBQUU7b0NBQ2xDLElBQU0sSUFBSSxHQUFHLHNCQUFzQixDQUFDLFFBQVEsQ0FBQyxDQUFDO29DQUM5QyxJQUFJLElBQUksRUFBRTt3Q0FDUixJQUFJLENBQUMsUUFBUTs0Q0FBRSxRQUFRLEdBQUcsRUFBRSxDQUFDO3dDQUM3QixRQUFRLENBQUMsSUFBSSxDQUFDLEdBQUcsV0FBVyxDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsQ0FBQztxQ0FDOUM7b0NBQ0QsUUFBUSxHQUFHLElBQUksQ0FBQztpQ0FDakI7Z0NBQ0QsSUFBSSxPQUFPLFFBQVEsSUFBSSxRQUFRLElBQUksT0FBTyxRQUFRLElBQUksUUFBUTtvQ0FDMUQsT0FBTyxRQUFRLElBQUksU0FBUyxFQUFFO29DQUNoQyxNQUFNLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxJQUFJLEVBQUUsUUFBUSxDQUFDLENBQUM7b0NBQ3ZDLElBQUksUUFBUSxFQUFFO3dDQUNaLE1BQU0sQ0FBQyxlQUFlLENBQ2xCLFFBQVEsQ0FBQyxJQUFJLEVBQUUsRUFBQyxVQUFVLEVBQUUsV0FBVyxFQUFFLElBQUksRUFBRSxRQUFRLENBQUMsSUFBSSxFQUFDLENBQUMsQ0FBQztxQ0FDcEU7aUNBQ0Y7cUNBQU0sSUFBSSxDQUFDLFFBQVEsRUFBRTtvQ0FDcEIsSUFBSSxRQUFRLElBQUksQ0FBQyx3QkFBZSxDQUFDLFFBQVEsQ0FBQyxFQUFFO3dDQUMxQyxNQUFNLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxJQUFJLEVBQUUsV0FBVyxDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDO3FDQUMzRDt5Q0FBTTt3Q0FDTCxNQUFNLENBQUMsTUFBTSxDQUNULFFBQVEsQ0FBQyxJQUFJLEVBQ2IsV0FBVyxDQUNQLFFBQVEsQ0FBQyw2QkFBNkIsRUFBRSxRQUFRLEVBQUUsRUFBQyxJQUFJLEVBQUUsUUFBUSxDQUFDLElBQUksRUFBQyxDQUFDLEVBQ3hFLElBQUksQ0FBQyxDQUFDLENBQUM7cUNBQ2hCO2lDQUNGOzZCQUNGO2lDQUFNO2dDQUNMLDZEQUE2RDtnQ0FDN0Qsc0RBQXNEO2dDQUN0RCxPQUFPO2dDQUNQLHFEQUFxRDtnQ0FDckQscUJBQXFCO2dDQUNyQixJQUFNLFFBQU0sR0FBZ0MsVUFBQyxRQUFpQjtvQ0FDNUQsUUFBUSxRQUFRLENBQUMsSUFBSSxFQUFFO3dDQUNyQixLQUFLLEVBQUUsQ0FBQyxVQUFVLENBQUMsVUFBVTs0Q0FDM0IsSUFBTSxJQUFJLEdBQWtCLFFBQVEsQ0FBQzs0Q0FDckMsSUFBTSxRQUFRLEdBQUcsUUFBUSxDQUFDLDZCQUE2QixFQUFFLElBQUksQ0FBQyxDQUFDOzRDQUMvRCxNQUFNLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsUUFBUSxDQUFDLENBQUM7NENBQ25DLElBQUksUUFBUSxDQUFDLElBQUksQ0FBQyxFQUFFO2dEQUNsQixJQUFJLENBQUMsUUFBUTtvREFBRSxRQUFRLEdBQUcsRUFBRSxDQUFDO2dEQUM3QixRQUFRLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLFFBQVEsQ0FBQzs2Q0FDaEM7NENBQ0QsTUFBTTt3Q0FDUixLQUFLLEVBQUUsQ0FBQyxVQUFVLENBQUMsY0FBYzs0Q0FDL0IsSUFBTSxjQUFjLEdBQXNCLFFBQVEsQ0FBQzs0Q0FDbkQsUUFBTSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsQ0FBQzs0Q0FDNUIsTUFBTTt3Q0FDUixLQUFLLEVBQUUsQ0FBQyxVQUFVLENBQUMsb0JBQW9CLENBQUM7d0NBQ3hDLEtBQUssRUFBRSxDQUFDLFVBQVUsQ0FBQyxtQkFBbUI7NENBQ3BDLElBQU0sUUFBUSxHQUFzQixRQUFRLENBQUM7NENBQzVDLFFBQWdCLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxRQUFNLENBQUMsQ0FBQzs0Q0FDM0MsTUFBTTtxQ0FDVDtnQ0FDSCxDQUFDLENBQUM7Z0NBQ0YsUUFBTSxDQUFDLG1CQUFtQixDQUFDLElBQUksQ0FBQyxDQUFDOzZCQUNsQzs7OzRCQWxFSCxLQUFrQyxJQUFBLEtBQUEsaUJBQUEsaUJBQWlCLENBQUMsZUFBZSxDQUFDLFlBQVksQ0FBQSxnQkFBQTtnQ0FBM0UsSUFBTSxtQkFBbUIsV0FBQTt3Q0FBbkIsbUJBQW1COzZCQW1FN0I7Ozs7Ozs7Ozt3QkFDRCxNQUFNO2lCQUNUO1lBQ0gsQ0FBQyxDQUFDLENBQUM7WUFFSCxJQUFJLFFBQVEsSUFBSSxPQUFPLEVBQUU7Z0JBQ3ZCLElBQUksQ0FBQyxRQUFRO29CQUNYLFFBQVEsR0FBRyxFQUFFLENBQUM7cUJBQ1gsSUFBSSxNQUFNLEVBQUU7b0JBQ2YsZ0JBQWdCLENBQUMsVUFBVSxFQUFFLE9BQU8sRUFBRSxRQUFRLENBQUMsQ0FBQztpQkFDakQ7Z0JBQ0QsSUFBTSxNQUFNLEdBQW1CO29CQUM3QixVQUFVLEVBQUUsUUFBUTtvQkFDcEIsT0FBTyxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxJQUFJLHlCQUFnQixFQUFFLFFBQVEsVUFBQTtpQkFDNUQsQ0FBQztnQkFDRixJQUFJLFVBQVUsQ0FBQyxVQUFVO29CQUFFLE1BQU0sQ0FBQyxRQUFRLEdBQUcsVUFBVSxDQUFDLFVBQVUsQ0FBQztnQkFDbkUsSUFBSSxPQUFPO29CQUFFLE1BQU0sQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFDO2dCQUN0QyxPQUFPLE1BQU0sQ0FBQzthQUNmO1FBQ0gsQ0FBQztRQUNILHdCQUFDO0lBQUQsQ0FBQyxBQXRnQkQsSUFzZ0JDO0lBdGdCWSw4Q0FBaUI7SUF3Z0I5QixzRUFBc0U7SUFDdEUsU0FBUyxnQkFBZ0IsQ0FDckIsVUFBeUIsRUFBRSxPQUFvQyxFQUMvRCxRQUF5QztRQUMzQyxJQUFJLE1BQU0sR0FBZ0IsSUFBSSxHQUFHLENBQUMsQ0FBQyxPQUFPLEVBQUUsUUFBUSxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsUUFBUSxFQUFFLFFBQVEsRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDO1FBRWhHLFNBQVMsa0JBQWtCLENBQ3ZCLFVBQXNFO1lBQ3hFLElBQUksQ0FBQyxVQUFVLEVBQUU7Z0JBQ2YsT0FBTzthQUNSO2lCQUFNLElBQUksS0FBSyxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsRUFBRTtnQkFDcEMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO2FBQ3hDO2lCQUFNLElBQUksT0FBTyxVQUFVLEtBQUssUUFBUSxJQUFJLENBQUMsVUFBVSxDQUFDLGNBQWMsQ0FBQyxZQUFZLENBQUMsRUFBRTtnQkFDckYsTUFBTSxDQUFDLG1CQUFtQixDQUFDLFVBQVUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxVQUFBLENBQUMsSUFBSSxPQUFBLGtCQUFrQixDQUFPLFVBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUF4QyxDQUF3QyxDQUFDLENBQUM7YUFDL0Y7aUJBQU0sSUFBSSx3QkFBZSxDQUFDLFVBQVUsQ0FBQyxFQUFFO2dCQUN0QyxXQUFXLENBQUMsVUFBVSxDQUFDLENBQUM7YUFDekI7aUJBQU0sSUFBSSw0Q0FBbUMsQ0FBQyxVQUFVLENBQUMsRUFBRTtnQkFDMUQsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxFQUFFO29CQUNoQyxJQUFNLFNBQVMsR0FBa0IsUUFBUSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQztvQkFDM0QsSUFBSSxTQUFTLEVBQUU7d0JBQ2Isa0JBQWtCLENBQUMsU0FBUyxDQUFDLENBQUM7cUJBQy9CO2lCQUNGO2FBQ0Y7aUJBQU0sSUFBSSwyQkFBa0IsQ0FBQyxVQUFVLENBQUMsRUFBRTtnQkFDekMsZ0JBQWdCLENBQU0sVUFBVSxDQUFDLENBQUM7YUFDbkM7aUJBQU0sSUFBSSxxQ0FBNEIsQ0FBQyxVQUFVLENBQUMsRUFBRTtnQkFDbkQsUUFBUSxVQUFVLENBQUMsVUFBVSxFQUFFO29CQUM3QixLQUFLLFFBQVE7d0JBQ1gsSUFBTSxnQkFBZ0IsR0FBcUMsVUFBVSxDQUFDO3dCQUN0RSxrQkFBa0IsQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsQ0FBQzt3QkFDMUMsa0JBQWtCLENBQUMsZ0JBQWdCLENBQUMsS0FBSyxDQUFDLENBQUM7d0JBQzNDLE1BQU07b0JBQ1IsS0FBSyxNQUFNLENBQUM7b0JBQ1osS0FBSyxLQUFLO3dCQUNSLElBQU0sY0FBYyxHQUFtQyxVQUFVLENBQUM7d0JBQ2xFLGtCQUFrQixDQUFDLGNBQWMsQ0FBQyxVQUFVLENBQUMsQ0FBQzt3QkFDOUMsSUFBSSxjQUFjLENBQUMsU0FBUzs0QkFBRSxjQUFjLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO3dCQUNuRixNQUFNO29CQUNSLEtBQUssT0FBTzt3QkFDVixJQUFNLGVBQWUsR0FBb0MsVUFBVSxDQUFDO3dCQUNwRSxrQkFBa0IsQ0FBQyxlQUFlLENBQUMsVUFBVSxDQUFDLENBQUM7d0JBQy9DLGtCQUFrQixDQUFDLGVBQWUsQ0FBQyxLQUFLLENBQUMsQ0FBQzt3QkFDMUMsTUFBTTtvQkFDUixLQUFLLEtBQUs7d0JBQ1IsSUFBTSxnQkFBZ0IsR0FBcUMsVUFBVSxDQUFDO3dCQUN0RSxrQkFBa0IsQ0FBQyxnQkFBZ0IsQ0FBQyxPQUFPLENBQUMsQ0FBQzt3QkFDN0MsTUFBTTtvQkFDUixLQUFLLFFBQVE7d0JBQ1gsSUFBTSxnQkFBZ0IsR0FBcUMsVUFBVSxDQUFDO3dCQUN0RSxrQkFBa0IsQ0FBQyxnQkFBZ0IsQ0FBQyxVQUFVLENBQUMsQ0FBQzt3QkFDaEQsTUFBTTtvQkFDUixLQUFLLFFBQVE7d0JBQ1gsSUFBTSxnQkFBZ0IsR0FBcUMsVUFBVSxDQUFDO3dCQUN0RSxrQkFBa0IsQ0FBQyxnQkFBZ0IsQ0FBQyxVQUFVLENBQUMsQ0FBQzt3QkFDaEQsTUFBTTtvQkFDUixLQUFLLElBQUk7d0JBQ1AsSUFBTSxZQUFZLEdBQWlDLFVBQVUsQ0FBQzt3QkFDOUQsa0JBQWtCLENBQUMsWUFBWSxDQUFDLFNBQVMsQ0FBQyxDQUFDO3dCQUMzQyxrQkFBa0IsQ0FBQyxZQUFZLENBQUMsY0FBYyxDQUFDLENBQUM7d0JBQ2hELGtCQUFrQixDQUFDLFlBQVksQ0FBQyxjQUFjLENBQUMsQ0FBQzt3QkFDaEQsTUFBTTtpQkFDVDthQUNGO1FBQ0gsQ0FBQztRQUVELFNBQVMsY0FBYyxDQUFDLFNBQXdCLEVBQUUsTUFBc0I7WUFDdEUsSUFBSSxNQUFNLENBQUMsVUFBVSxFQUFFO2dCQUNyQixNQUFNLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO2FBQy9DO1lBQ0QsSUFBSSx5QkFBZ0IsQ0FBQyxNQUFNLENBQUMsSUFBSSxNQUFNLENBQUMsbUJBQW1CLEVBQUU7Z0JBQzFELE1BQU0sQ0FBQyxtQkFBbUIsQ0FBQyxPQUFPLENBQUMsa0JBQWtCLENBQUMsQ0FBQzthQUN4RDtZQUNELGtGQUFrRjtZQUNsRixJQUFJLFNBQVMsQ0FBQyxVQUFVLElBQUksOEJBQXFCLENBQUMsTUFBTSxDQUFDLElBQUksTUFBTSxDQUFDLFVBQVUsRUFBRTtnQkFDOUUsTUFBTSxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsa0JBQWtCLENBQUMsQ0FBQzthQUMvQztRQUNILENBQUM7UUFFRCxTQUFTLGFBQWEsQ0FBQyxTQUF3QjtZQUM3QyxJQUFJLFNBQVMsQ0FBQyxVQUFVLEVBQUU7Z0JBQ3hCLFNBQVMsQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLGtCQUFrQixDQUFDLENBQUM7YUFDbEQ7WUFDRCxJQUFJLFNBQVMsQ0FBQyxPQUFPLEVBQUU7Z0JBQ3JCLE1BQU0sQ0FBQyxtQkFBbUIsQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDO3FCQUN4QyxPQUFPLENBQUMsVUFBQSxJQUFJLElBQUksT0FBQSxTQUFTLENBQUMsT0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDLE9BQU8sQ0FBQyxVQUFDLENBQUMsSUFBSyxPQUFBLGNBQWMsQ0FBQyxTQUFTLEVBQUUsQ0FBQyxDQUFDLEVBQTVCLENBQTRCLENBQUMsRUFBdEUsQ0FBc0UsQ0FBQyxDQUFDO2FBQzlGO1lBQ0QsSUFBSSxTQUFTLENBQUMsT0FBTyxFQUFFO2dCQUNyQixNQUFNLENBQUMsbUJBQW1CLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxDQUFDLE9BQU8sQ0FBQyxVQUFBLElBQUk7b0JBQ3hELElBQU0sWUFBWSxHQUFHLFNBQVMsQ0FBQyxPQUFTLENBQUMsSUFBSSxDQUFDLENBQUM7b0JBQy9DLElBQUksMkJBQWtCLENBQUMsWUFBWSxDQUFDLEVBQUU7d0JBQ3BDLGtCQUFrQixDQUFDLFlBQVksQ0FBQyxLQUFLLENBQUMsQ0FBQztxQkFDeEM7eUJBQU07d0JBQ0wsa0JBQWtCLENBQUMsWUFBWSxDQUFDLENBQUM7cUJBQ2xDO2dCQUNILENBQUMsQ0FBQyxDQUFDO2FBQ0o7UUFDSCxDQUFDO1FBRUQsU0FBUyxnQkFBZ0IsQ0FBQyxtQkFBcUM7WUFDN0QsSUFBSSxtQkFBbUIsQ0FBQyxLQUFLLEVBQUU7Z0JBQzdCLElBQU0sU0FBUyxHQUFHLE1BQU0sQ0FBQztnQkFDekIsSUFBSSxtQkFBbUIsQ0FBQyxVQUFVLEVBQUU7b0JBQ2xDLE1BQU0sR0FBRyxJQUFJLEdBQUcsQ0FBQyxTQUFTLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQztvQkFDckMsSUFBSSxtQkFBbUIsQ0FBQyxVQUFVO3dCQUNoQyxtQkFBbUIsQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLFVBQUEsQ0FBQyxJQUFJLE9BQUEsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBYixDQUFhLENBQUMsQ0FBQztpQkFDOUQ7Z0JBQ0Qsa0JBQWtCLENBQUMsbUJBQW1CLENBQUMsS0FBSyxDQUFDLENBQUM7Z0JBQzlDLE1BQU0sR0FBRyxTQUFTLENBQUM7YUFDcEI7UUFDSCxDQUFDO1FBRUQsU0FBUyxnQkFBZ0IsQ0FBQyxJQUF5QjtZQUNqRCxJQUFJLElBQUksRUFBRTtnQkFDUixJQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUM7Z0JBQ2xDLE9BQU8sQ0FBQyxDQUNKLElBQUksQ0FBQyxHQUFHLElBQUksU0FBUztvQkFDckIsVUFBVSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxTQUFTLENBQUMsQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7YUFDOUU7WUFDRCxPQUFPLElBQUksQ0FBQztRQUNkLENBQUM7UUFFRCxTQUFTLFdBQVcsQ0FBQyxLQUFvQjtZQUN2QyxJQUFNLElBQUksR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQ2hDLElBQUksZ0JBQWdCLENBQUMsSUFBSSxDQUFDLEVBQUU7Z0JBQzFCLElBQU0sUUFBUSxHQUFHLEtBQUssQ0FBQyxJQUFJLElBQUksU0FBUyxDQUFDLENBQUM7b0JBQ3RDLEtBQUssQ0FBQyxTQUFTLElBQUksU0FBUyxDQUFDLENBQUMsQ0FBQyxPQUFJLEtBQUssQ0FBQyxJQUFJLEdBQUcsQ0FBQyxXQUFJLEtBQUssQ0FBQyxTQUFTLEdBQUcsQ0FBQyxDQUFFLENBQUMsQ0FBQzt3QkFDN0MsT0FBSSxLQUFLLENBQUMsSUFBSSxHQUFHLENBQUMsQ0FBRSxDQUFDLENBQUM7b0JBQ3JELEVBQUUsQ0FBQztnQkFDUCxNQUFNLElBQUksS0FBSyxDQUNYLEtBQUcsVUFBVSxDQUFDLFFBQVEsR0FBRyxRQUFRLGlGQUE0RSxlQUFlLENBQUMsS0FBSyxDQUFDLGFBQVEsSUFBSSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUcsQ0FBQyxDQUFDO2FBQ3pLO1FBQ0gsQ0FBQztRQUVELE1BQU0sQ0FBQyxtQkFBbUIsQ0FBQyxRQUFRLENBQUMsQ0FBQyxPQUFPLENBQUMsVUFBQSxJQUFJO1lBQy9DLElBQU0sS0FBSyxHQUFHLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUM3QixJQUFJO2dCQUNGLElBQUksd0JBQWUsQ0FBQyxLQUFLLENBQUMsRUFBRTtvQkFDMUIsYUFBYSxDQUFDLEtBQUssQ0FBQyxDQUFDO2lCQUN0QjthQUNGO1lBQUMsT0FBTyxDQUFDLEVBQUU7Z0JBQ1YsSUFBTSxJQUFJLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQztnQkFDaEMsSUFBSSxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsRUFBRTtvQkFDMUIsSUFBSSxJQUFJLEVBQUU7d0JBQ0YsSUFBQSw4REFBNkUsRUFBNUUsY0FBSSxFQUFFLHdCQUFzRSxDQUFDO3dCQUNwRixNQUFNLElBQUksS0FBSyxDQUNSLFVBQVUsQ0FBQyxRQUFRLFVBQUksSUFBSSxHQUFHLENBQUMsV0FBSSxTQUFTLEdBQUcsQ0FBQyx3RUFBa0UsSUFBSSxjQUFTLENBQUMsQ0FBQyxPQUFTLENBQUMsQ0FBQztxQkFDcEo7b0JBQ0QsTUFBTSxJQUFJLEtBQUssQ0FDWCxpRUFBK0QsSUFBSSxhQUFRLENBQUMsQ0FBQyxPQUFTLENBQUMsQ0FBQztpQkFDN0Y7YUFDRjtRQUNILENBQUMsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztJQUVELDJDQUEyQztJQUMzQyxTQUFTLE9BQU8sQ0FBQyxVQUFpRDs7UUFDaEUsSUFBTSxNQUFNLEdBQWEsRUFBRSxDQUFDO1FBRTVCLFNBQVMsVUFBVSxDQUFDLElBQXVDOztZQUN6RCxJQUFJLElBQUksQ0FBQyxJQUFJLElBQUksRUFBRSxDQUFDLFVBQVUsQ0FBQyxVQUFVLEVBQUU7Z0JBQ3pDLElBQU0sVUFBVSxHQUFrQixJQUFJLENBQUM7Z0JBQ3ZDLE1BQU0sQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFDO2FBQzlCO2lCQUFNO2dCQUNMLElBQU0sY0FBYyxHQUFzQixJQUFJLENBQUM7O29CQUMvQyxLQUFzQixJQUFBLEtBQUEsaUJBQUEsY0FBYyxDQUFDLFFBQVEsQ0FBQSxnQkFBQSw0QkFBRTt3QkFBMUMsSUFBTSxPQUFPLFdBQUE7d0JBQ2hCLElBQU0sTUFBSSxHQUFJLE9BQWUsQ0FBQyxJQUFJLENBQUM7d0JBQ25DLElBQUksTUFBSSxFQUFFOzRCQUNSLFVBQVUsQ0FBQyxNQUFJLENBQUMsQ0FBQzt5QkFDbEI7cUJBQ0Y7Ozs7Ozs7OzthQUNGO1FBQ0gsQ0FBQzs7WUFFRCxLQUF3QixJQUFBLGVBQUEsaUJBQUEsVUFBVSxDQUFBLHNDQUFBLDhEQUFFO2dCQUEvQixJQUFNLFNBQVMsdUJBQUE7Z0JBQ2xCLFVBQVUsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUM7YUFDNUI7Ozs7Ozs7OztRQUVELE9BQU8sTUFBTSxDQUFDO0lBQ2hCLENBQUM7SUFFRCxTQUFTLHdCQUF3QixDQUFDLFVBQWtCO1FBQ2xELE9BQU8sVUFBVSxDQUFDLFVBQVUsQ0FBQyxvQkFBb0IsQ0FBQyxJQUFJLFVBQVUsQ0FBQyxVQUFVLENBQUMsa0JBQWtCLENBQUMsQ0FBQztJQUNsRyxDQUFDO0lBRUQsU0FBUyxlQUFlLENBQUMsS0FBVTtRQUNqQyxRQUFRLEtBQUssQ0FBQyxPQUFPLEVBQUU7WUFDckIsS0FBSyxpQ0FBaUM7Z0JBQ3BDLElBQUksS0FBSyxDQUFDLE9BQU8sSUFBSSxLQUFLLENBQUMsT0FBTyxDQUFDLFNBQVMsRUFBRTtvQkFDNUMsT0FBTyx1Q0FBcUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxTQUFTLG1DQUFnQyxDQUFDO2lCQUNyRztnQkFDRCxNQUFNO1lBQ1IsS0FBSywwQkFBMEI7Z0JBQzdCLE9BQU8sa0lBQWtJLENBQUM7WUFDNUksS0FBSyw2QkFBNkI7Z0JBQ2hDLE9BQU8sdUpBQXVKLENBQUM7WUFDakssS0FBSyx3QkFBd0I7Z0JBQzNCLElBQUksS0FBSyxDQUFDLE9BQU8sSUFBSSxLQUFLLENBQUMsT0FBTyxDQUFDLFFBQVEsRUFBRTtvQkFDM0MsT0FBTyw0QkFBMEIsS0FBSyxDQUFDLE9BQU8sQ0FBQyxRQUFVLENBQUM7aUJBQzNEO2dCQUNELE1BQU07WUFDUixLQUFLLDZCQUE2QjtnQkFDaEMsSUFBSSxNQUFNLEdBQ04sS0FBSyxDQUFDLE9BQU8sSUFBSSxLQUFLLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsdUJBQXFCLEtBQUssQ0FBQyxPQUFPLENBQUMsSUFBSSxTQUFNLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQztnQkFDOUYsT0FBTyxNQUFNO29CQUNULHFIQUFxSCxDQUFDO1lBQzVILEtBQUssNkJBQTZCO2dCQUNoQyxJQUFJLEtBQUssQ0FBQyxPQUFPLElBQUksS0FBSyxDQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQUU7b0JBQ3ZDLE9BQU8saURBQStDLEtBQUssQ0FBQyxPQUFPLENBQUMsSUFBSSxxQ0FBa0MsQ0FBQztpQkFDNUc7U0FDSjtRQUNELE9BQU8sS0FBSyxDQUFDLE9BQU8sQ0FBQztJQUN2QixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQgKiBhcyB0cyBmcm9tICd0eXBlc2NyaXB0JztcblxuaW1wb3J0IHtFdmFsdWF0b3IsIGVycm9yU3ltYm9sLCByZWNvcmRNYXBFbnRyeX0gZnJvbSAnLi9ldmFsdWF0b3InO1xuaW1wb3J0IHtDbGFzc01ldGFkYXRhLCBDb25zdHJ1Y3Rvck1ldGFkYXRhLCBGdW5jdGlvbk1ldGFkYXRhLCBJbnRlcmZhY2VNZXRhZGF0YSwgTUVUQURBVEFfVkVSU0lPTiwgTWVtYmVyTWV0YWRhdGEsIE1ldGFkYXRhRW50cnksIE1ldGFkYXRhRXJyb3IsIE1ldGFkYXRhTWFwLCBNZXRhZGF0YVN5bWJvbGljQmluYXJ5RXhwcmVzc2lvbiwgTWV0YWRhdGFTeW1ib2xpY0NhbGxFeHByZXNzaW9uLCBNZXRhZGF0YVN5bWJvbGljRXhwcmVzc2lvbiwgTWV0YWRhdGFTeW1ib2xpY0lmRXhwcmVzc2lvbiwgTWV0YWRhdGFTeW1ib2xpY0luZGV4RXhwcmVzc2lvbiwgTWV0YWRhdGFTeW1ib2xpY1ByZWZpeEV4cHJlc3Npb24sIE1ldGFkYXRhU3ltYm9saWNSZWZlcmVuY2VFeHByZXNzaW9uLCBNZXRhZGF0YVN5bWJvbGljU2VsZWN0RXhwcmVzc2lvbiwgTWV0YWRhdGFTeW1ib2xpY1NwcmVhZEV4cHJlc3Npb24sIE1ldGFkYXRhVmFsdWUsIE1ldGhvZE1ldGFkYXRhLCBNb2R1bGVFeHBvcnRNZXRhZGF0YSwgTW9kdWxlTWV0YWRhdGEsIGlzQ2xhc3NNZXRhZGF0YSwgaXNDb25zdHJ1Y3Rvck1ldGFkYXRhLCBpc0Z1bmN0aW9uTWV0YWRhdGEsIGlzTWV0YWRhdGFFcnJvciwgaXNNZXRhZGF0YUdsb2JhbFJlZmVyZW5jZUV4cHJlc3Npb24sIGlzTWV0YWRhdGFJbXBvcnREZWZhdWx0UmVmZXJlbmNlLCBpc01ldGFkYXRhSW1wb3J0ZWRTeW1ib2xSZWZlcmVuY2VFeHByZXNzaW9uLCBpc01ldGFkYXRhU3ltYm9saWNFeHByZXNzaW9uLCBpc01ldGFkYXRhU3ltYm9saWNSZWZlcmVuY2VFeHByZXNzaW9uLCBpc01ldGFkYXRhU3ltYm9saWNTZWxlY3RFeHByZXNzaW9uLCBpc01ldGhvZE1ldGFkYXRhfSBmcm9tICcuL3NjaGVtYSc7XG5pbXBvcnQge1N5bWJvbHN9IGZyb20gJy4vc3ltYm9scyc7XG5cbmNvbnN0IGlzU3RhdGljID0gKG5vZGU6IHRzLkRlY2xhcmF0aW9uKSA9PlxuICAgIHRzLmdldENvbWJpbmVkTW9kaWZpZXJGbGFncyhub2RlKSAmIHRzLk1vZGlmaWVyRmxhZ3MuU3RhdGljO1xuXG4vKipcbiAqIEEgc2V0IG9mIGNvbGxlY3RvciBvcHRpb25zIHRvIHVzZSB3aGVuIGNvbGxlY3RpbmcgbWV0YWRhdGEuXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgQ29sbGVjdG9yT3B0aW9ucyB7XG4gIC8qKlxuICAgKiBWZXJzaW9uIG9mIHRoZSBtZXRhZGF0YSB0byBjb2xsZWN0LlxuICAgKi9cbiAgdmVyc2lvbj86IG51bWJlcjtcblxuICAvKipcbiAgICogQ29sbGVjdCBhIGhpZGRlbiBmaWVsZCBcIiRxdW90ZWQkXCIgaW4gb2JqZWN0cyBsaXRlcmFscyB0aGF0IHJlY29yZCB3aGVuIHRoZSBrZXkgd2FzIHF1b3RlZCBpblxuICAgKiB0aGUgc291cmNlLlxuICAgKi9cbiAgcXVvdGVkTmFtZXM/OiBib29sZWFuO1xuXG4gIC8qKlxuICAgKiBEbyBub3Qgc2ltcGxpZnkgaW52YWxpZCBleHByZXNzaW9ucy5cbiAgICovXG4gIHZlcmJvc2VJbnZhbGlkRXhwcmVzc2lvbj86IGJvb2xlYW47XG5cbiAgLyoqXG4gICAqIEFuIGV4cHJlc3Npb24gc3Vic3RpdHV0aW9uIGNhbGxiYWNrLlxuICAgKi9cbiAgc3Vic3RpdHV0ZUV4cHJlc3Npb24/OiAodmFsdWU6IE1ldGFkYXRhVmFsdWUsIG5vZGU6IHRzLk5vZGUpID0+IE1ldGFkYXRhVmFsdWU7XG59XG5cbi8qKlxuICogQ29sbGVjdCBkZWNvcmF0b3IgbWV0YWRhdGEgZnJvbSBhIFR5cGVTY3JpcHQgbW9kdWxlLlxuICovXG5leHBvcnQgY2xhc3MgTWV0YWRhdGFDb2xsZWN0b3Ige1xuICBjb25zdHJ1Y3Rvcihwcml2YXRlIG9wdGlvbnM6IENvbGxlY3Rvck9wdGlvbnMgPSB7fSkge31cblxuICAvKipcbiAgICogUmV0dXJucyBhIEpTT04uc3RyaW5naWZ5IGZyaWVuZGx5IGZvcm0gZGVzY3JpYmluZyB0aGUgZGVjb3JhdG9ycyBvZiB0aGUgZXhwb3J0ZWQgY2xhc3NlcyBmcm9tXG4gICAqIHRoZSBzb3VyY2UgZmlsZSB0aGF0IGlzIGV4cGVjdGVkIHRvIGNvcnJlc3BvbmQgdG8gYSBtb2R1bGUuXG4gICAqL1xuICBwdWJsaWMgZ2V0TWV0YWRhdGEoXG4gICAgICBzb3VyY2VGaWxlOiB0cy5Tb3VyY2VGaWxlLCBzdHJpY3Q6IGJvb2xlYW4gPSBmYWxzZSxcbiAgICAgIHN1YnN0aXR1dGVFeHByZXNzaW9uPzogKHZhbHVlOiBNZXRhZGF0YVZhbHVlLCBub2RlOiB0cy5Ob2RlKSA9PiBNZXRhZGF0YVZhbHVlKTogTW9kdWxlTWV0YWRhdGFcbiAgICAgIHx1bmRlZmluZWQge1xuICAgIGNvbnN0IGxvY2FscyA9IG5ldyBTeW1ib2xzKHNvdXJjZUZpbGUpO1xuICAgIGNvbnN0IG5vZGVNYXAgPVxuICAgICAgICBuZXcgTWFwPE1ldGFkYXRhVmFsdWV8Q2xhc3NNZXRhZGF0YXxJbnRlcmZhY2VNZXRhZGF0YXxGdW5jdGlvbk1ldGFkYXRhLCB0cy5Ob2RlPigpO1xuICAgIGNvbnN0IGNvbXBvc2VkU3Vic3RpdHV0ZXIgPSBzdWJzdGl0dXRlRXhwcmVzc2lvbiAmJiB0aGlzLm9wdGlvbnMuc3Vic3RpdHV0ZUV4cHJlc3Npb24gP1xuICAgICAgICAodmFsdWU6IE1ldGFkYXRhVmFsdWUsIG5vZGU6IHRzLk5vZGUpID0+XG4gICAgICAgICAgICB0aGlzLm9wdGlvbnMuc3Vic3RpdHV0ZUV4cHJlc3Npb24gIShzdWJzdGl0dXRlRXhwcmVzc2lvbih2YWx1ZSwgbm9kZSksIG5vZGUpIDpcbiAgICAgICAgc3Vic3RpdHV0ZUV4cHJlc3Npb247XG4gICAgY29uc3QgZXZhbHVhdG9yT3B0aW9ucyA9IHN1YnN0aXR1dGVFeHByZXNzaW9uID9cbiAgICAgICAgey4uLnRoaXMub3B0aW9ucywgc3Vic3RpdHV0ZUV4cHJlc3Npb246IGNvbXBvc2VkU3Vic3RpdHV0ZXJ9IDpcbiAgICAgICAgdGhpcy5vcHRpb25zO1xuICAgIGxldCBtZXRhZGF0YToge1tuYW1lOiBzdHJpbmddOiBNZXRhZGF0YVZhbHVlIHwgQ2xhc3NNZXRhZGF0YSB8IEZ1bmN0aW9uTWV0YWRhdGF9fHVuZGVmaW5lZDtcbiAgICBjb25zdCBldmFsdWF0b3IgPSBuZXcgRXZhbHVhdG9yKGxvY2Fscywgbm9kZU1hcCwgZXZhbHVhdG9yT3B0aW9ucywgKG5hbWUsIHZhbHVlKSA9PiB7XG4gICAgICBpZiAoIW1ldGFkYXRhKSBtZXRhZGF0YSA9IHt9O1xuICAgICAgbWV0YWRhdGFbbmFtZV0gPSB2YWx1ZTtcbiAgICB9KTtcbiAgICBsZXQgZXhwb3J0czogTW9kdWxlRXhwb3J0TWV0YWRhdGFbXXx1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG5cbiAgICBmdW5jdGlvbiBvYmpGcm9tRGVjb3JhdG9yKGRlY29yYXRvck5vZGU6IHRzLkRlY29yYXRvcik6IE1ldGFkYXRhU3ltYm9saWNFeHByZXNzaW9uIHtcbiAgICAgIHJldHVybiA8TWV0YWRhdGFTeW1ib2xpY0V4cHJlc3Npb24+ZXZhbHVhdG9yLmV2YWx1YXRlTm9kZShkZWNvcmF0b3JOb2RlLmV4cHJlc3Npb24pO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHJlY29yZEVudHJ5PFQgZXh0ZW5kcyBNZXRhZGF0YUVudHJ5PihlbnRyeTogVCwgbm9kZTogdHMuTm9kZSk6IFQge1xuICAgICAgaWYgKGNvbXBvc2VkU3Vic3RpdHV0ZXIpIHtcbiAgICAgICAgZW50cnkgPSBjb21wb3NlZFN1YnN0aXR1dGVyKGVudHJ5IGFzIE1ldGFkYXRhVmFsdWUsIG5vZGUpIGFzIFQ7XG4gICAgICB9XG4gICAgICByZXR1cm4gcmVjb3JkTWFwRW50cnkoZW50cnksIG5vZGUsIG5vZGVNYXAsIHNvdXJjZUZpbGUpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGVycm9yU3ltKFxuICAgICAgICBtZXNzYWdlOiBzdHJpbmcsIG5vZGU/OiB0cy5Ob2RlLCBjb250ZXh0Pzoge1tuYW1lOiBzdHJpbmddOiBzdHJpbmd9KTogTWV0YWRhdGFFcnJvciB7XG4gICAgICByZXR1cm4gZXJyb3JTeW1ib2wobWVzc2FnZSwgbm9kZSwgY29udGV4dCwgc291cmNlRmlsZSk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gbWF5YmVHZXRTaW1wbGVGdW5jdGlvbihcbiAgICAgICAgZnVuY3Rpb25EZWNsYXJhdGlvbjogdHMuRnVuY3Rpb25EZWNsYXJhdGlvbiB8XG4gICAgICAgIHRzLk1ldGhvZERlY2xhcmF0aW9uKToge2Z1bmM6IEZ1bmN0aW9uTWV0YWRhdGEsIG5hbWU6IHN0cmluZ318dW5kZWZpbmVkIHtcbiAgICAgIGlmIChmdW5jdGlvbkRlY2xhcmF0aW9uLm5hbWUgJiYgZnVuY3Rpb25EZWNsYXJhdGlvbi5uYW1lLmtpbmQgPT0gdHMuU3ludGF4S2luZC5JZGVudGlmaWVyKSB7XG4gICAgICAgIGNvbnN0IG5hbWVOb2RlID0gPHRzLklkZW50aWZpZXI+ZnVuY3Rpb25EZWNsYXJhdGlvbi5uYW1lO1xuICAgICAgICBjb25zdCBmdW5jdGlvbk5hbWUgPSBuYW1lTm9kZS50ZXh0O1xuICAgICAgICBjb25zdCBmdW5jdGlvbkJvZHkgPSBmdW5jdGlvbkRlY2xhcmF0aW9uLmJvZHk7XG4gICAgICAgIGlmIChmdW5jdGlvbkJvZHkgJiYgZnVuY3Rpb25Cb2R5LnN0YXRlbWVudHMubGVuZ3RoID09IDEpIHtcbiAgICAgICAgICBjb25zdCBzdGF0ZW1lbnQgPSBmdW5jdGlvbkJvZHkuc3RhdGVtZW50c1swXTtcbiAgICAgICAgICBpZiAoc3RhdGVtZW50LmtpbmQgPT09IHRzLlN5bnRheEtpbmQuUmV0dXJuU3RhdGVtZW50KSB7XG4gICAgICAgICAgICBjb25zdCByZXR1cm5TdGF0ZW1lbnQgPSA8dHMuUmV0dXJuU3RhdGVtZW50PnN0YXRlbWVudDtcbiAgICAgICAgICAgIGlmIChyZXR1cm5TdGF0ZW1lbnQuZXhwcmVzc2lvbikge1xuICAgICAgICAgICAgICBjb25zdCBmdW5jOiBGdW5jdGlvbk1ldGFkYXRhID0ge1xuICAgICAgICAgICAgICAgIF9fc3ltYm9saWM6ICdmdW5jdGlvbicsXG4gICAgICAgICAgICAgICAgcGFyYW1ldGVyczogbmFtZXNPZihmdW5jdGlvbkRlY2xhcmF0aW9uLnBhcmFtZXRlcnMpLFxuICAgICAgICAgICAgICAgIHZhbHVlOiBldmFsdWF0b3IuZXZhbHVhdGVOb2RlKHJldHVyblN0YXRlbWVudC5leHByZXNzaW9uKVxuICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICBpZiAoZnVuY3Rpb25EZWNsYXJhdGlvbi5wYXJhbWV0ZXJzLnNvbWUocCA9PiBwLmluaXRpYWxpemVyICE9IG51bGwpKSB7XG4gICAgICAgICAgICAgICAgZnVuYy5kZWZhdWx0cyA9IGZ1bmN0aW9uRGVjbGFyYXRpb24ucGFyYW1ldGVycy5tYXAoXG4gICAgICAgICAgICAgICAgICAgIHAgPT4gcC5pbml0aWFsaXplciAmJiBldmFsdWF0b3IuZXZhbHVhdGVOb2RlKHAuaW5pdGlhbGl6ZXIpKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICByZXR1cm4gcmVjb3JkRW50cnkoe2Z1bmMsIG5hbWU6IGZ1bmN0aW9uTmFtZX0sIGZ1bmN0aW9uRGVjbGFyYXRpb24pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIGNsYXNzTWV0YWRhdGFPZihjbGFzc0RlY2xhcmF0aW9uOiB0cy5DbGFzc0RlY2xhcmF0aW9uKTogQ2xhc3NNZXRhZGF0YSB7XG4gICAgICBjb25zdCByZXN1bHQ6IENsYXNzTWV0YWRhdGEgPSB7X19zeW1ib2xpYzogJ2NsYXNzJ307XG5cbiAgICAgIGZ1bmN0aW9uIGdldERlY29yYXRvcnMoZGVjb3JhdG9yczogUmVhZG9ubHlBcnJheTx0cy5EZWNvcmF0b3I+fCB1bmRlZmluZWQpOlxuICAgICAgICAgIE1ldGFkYXRhU3ltYm9saWNFeHByZXNzaW9uW118dW5kZWZpbmVkIHtcbiAgICAgICAgaWYgKGRlY29yYXRvcnMgJiYgZGVjb3JhdG9ycy5sZW5ndGgpXG4gICAgICAgICAgcmV0dXJuIGRlY29yYXRvcnMubWFwKGRlY29yYXRvciA9PiBvYmpGcm9tRGVjb3JhdG9yKGRlY29yYXRvcikpO1xuICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgICAgfVxuXG4gICAgICBmdW5jdGlvbiByZWZlcmVuY2VGcm9tKG5vZGU6IHRzLk5vZGUpOiBNZXRhZGF0YVN5bWJvbGljUmVmZXJlbmNlRXhwcmVzc2lvbnxNZXRhZGF0YUVycm9yfFxuICAgICAgICAgIE1ldGFkYXRhU3ltYm9saWNTZWxlY3RFeHByZXNzaW9uIHtcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gZXZhbHVhdG9yLmV2YWx1YXRlTm9kZShub2RlKTtcbiAgICAgICAgaWYgKGlzTWV0YWRhdGFFcnJvcihyZXN1bHQpIHx8IGlzTWV0YWRhdGFTeW1ib2xpY1JlZmVyZW5jZUV4cHJlc3Npb24ocmVzdWx0KSB8fFxuICAgICAgICAgICAgaXNNZXRhZGF0YVN5bWJvbGljU2VsZWN0RXhwcmVzc2lvbihyZXN1bHQpKSB7XG4gICAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXR1cm4gZXJyb3JTeW0oJ1N5bWJvbCByZWZlcmVuY2UgZXhwZWN0ZWQnLCBub2RlKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAvLyBBZGQgY2xhc3MgcGFyZW50c1xuICAgICAgaWYgKGNsYXNzRGVjbGFyYXRpb24uaGVyaXRhZ2VDbGF1c2VzKSB7XG4gICAgICAgIGNsYXNzRGVjbGFyYXRpb24uaGVyaXRhZ2VDbGF1c2VzLmZvckVhY2goKGhjKSA9PiB7XG4gICAgICAgICAgaWYgKGhjLnRva2VuID09PSB0cy5TeW50YXhLaW5kLkV4dGVuZHNLZXl3b3JkICYmIGhjLnR5cGVzKSB7XG4gICAgICAgICAgICBoYy50eXBlcy5mb3JFYWNoKHR5cGUgPT4gcmVzdWx0LmV4dGVuZHMgPSByZWZlcmVuY2VGcm9tKHR5cGUuZXhwcmVzc2lvbikpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9XG5cbiAgICAgIC8vIEFkZCBhcml0eSBpZiB0aGUgdHlwZSBpcyBnZW5lcmljXG4gICAgICBjb25zdCB0eXBlUGFyYW1ldGVycyA9IGNsYXNzRGVjbGFyYXRpb24udHlwZVBhcmFtZXRlcnM7XG4gICAgICBpZiAodHlwZVBhcmFtZXRlcnMgJiYgdHlwZVBhcmFtZXRlcnMubGVuZ3RoKSB7XG4gICAgICAgIHJlc3VsdC5hcml0eSA9IHR5cGVQYXJhbWV0ZXJzLmxlbmd0aDtcbiAgICAgIH1cblxuICAgICAgLy8gQWRkIGNsYXNzIGRlY29yYXRvcnNcbiAgICAgIGlmIChjbGFzc0RlY2xhcmF0aW9uLmRlY29yYXRvcnMpIHtcbiAgICAgICAgcmVzdWx0LmRlY29yYXRvcnMgPSBnZXREZWNvcmF0b3JzKGNsYXNzRGVjbGFyYXRpb24uZGVjb3JhdG9ycyk7XG4gICAgICB9XG5cbiAgICAgIC8vIG1lbWJlciBkZWNvcmF0b3JzXG4gICAgICBsZXQgbWVtYmVyczogTWV0YWRhdGFNYXB8bnVsbCA9IG51bGw7XG4gICAgICBmdW5jdGlvbiByZWNvcmRNZW1iZXIobmFtZTogc3RyaW5nLCBtZXRhZGF0YTogTWVtYmVyTWV0YWRhdGEpIHtcbiAgICAgICAgaWYgKCFtZW1iZXJzKSBtZW1iZXJzID0ge307XG4gICAgICAgIGNvbnN0IGRhdGEgPSBtZW1iZXJzLmhhc093blByb3BlcnR5KG5hbWUpID8gbWVtYmVyc1tuYW1lXSA6IFtdO1xuICAgICAgICBkYXRhLnB1c2gobWV0YWRhdGEpO1xuICAgICAgICBtZW1iZXJzW25hbWVdID0gZGF0YTtcbiAgICAgIH1cblxuICAgICAgLy8gc3RhdGljIG1lbWJlclxuICAgICAgbGV0IHN0YXRpY3M6IHtbbmFtZTogc3RyaW5nXTogTWV0YWRhdGFWYWx1ZSB8IEZ1bmN0aW9uTWV0YWRhdGF9fG51bGwgPSBudWxsO1xuICAgICAgZnVuY3Rpb24gcmVjb3JkU3RhdGljTWVtYmVyKG5hbWU6IHN0cmluZywgdmFsdWU6IE1ldGFkYXRhVmFsdWUgfCBGdW5jdGlvbk1ldGFkYXRhKSB7XG4gICAgICAgIGlmICghc3RhdGljcykgc3RhdGljcyA9IHt9O1xuICAgICAgICBzdGF0aWNzW25hbWVdID0gdmFsdWU7XG4gICAgICB9XG5cbiAgICAgIGZvciAoY29uc3QgbWVtYmVyIG9mIGNsYXNzRGVjbGFyYXRpb24ubWVtYmVycykge1xuICAgICAgICBsZXQgaXNDb25zdHJ1Y3RvciA9IGZhbHNlO1xuICAgICAgICBzd2l0Y2ggKG1lbWJlci5raW5kKSB7XG4gICAgICAgICAgY2FzZSB0cy5TeW50YXhLaW5kLkNvbnN0cnVjdG9yOlxuICAgICAgICAgIGNhc2UgdHMuU3ludGF4S2luZC5NZXRob2REZWNsYXJhdGlvbjpcbiAgICAgICAgICAgIGlzQ29uc3RydWN0b3IgPSBtZW1iZXIua2luZCA9PT0gdHMuU3ludGF4S2luZC5Db25zdHJ1Y3RvcjtcbiAgICAgICAgICAgIGNvbnN0IG1ldGhvZCA9IDx0cy5NZXRob2REZWNsYXJhdGlvbnx0cy5Db25zdHJ1Y3RvckRlY2xhcmF0aW9uPm1lbWJlcjtcbiAgICAgICAgICAgIGlmIChpc1N0YXRpYyhtZXRob2QpKSB7XG4gICAgICAgICAgICAgIGNvbnN0IG1heWJlRnVuYyA9IG1heWJlR2V0U2ltcGxlRnVuY3Rpb24oPHRzLk1ldGhvZERlY2xhcmF0aW9uPm1ldGhvZCk7XG4gICAgICAgICAgICAgIGlmIChtYXliZUZ1bmMpIHtcbiAgICAgICAgICAgICAgICByZWNvcmRTdGF0aWNNZW1iZXIobWF5YmVGdW5jLm5hbWUsIG1heWJlRnVuYy5mdW5jKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnN0IG1ldGhvZERlY29yYXRvcnMgPSBnZXREZWNvcmF0b3JzKG1ldGhvZC5kZWNvcmF0b3JzKTtcbiAgICAgICAgICAgIGNvbnN0IHBhcmFtZXRlcnMgPSBtZXRob2QucGFyYW1ldGVycztcbiAgICAgICAgICAgIGNvbnN0IHBhcmFtZXRlckRlY29yYXRvckRhdGE6XG4gICAgICAgICAgICAgICAgKChNZXRhZGF0YVN5bWJvbGljRXhwcmVzc2lvbiB8IE1ldGFkYXRhRXJyb3IpW10gfCB1bmRlZmluZWQpW10gPSBbXTtcbiAgICAgICAgICAgIGNvbnN0IHBhcmFtZXRlcnNEYXRhOlxuICAgICAgICAgICAgICAgIChNZXRhZGF0YVN5bWJvbGljUmVmZXJlbmNlRXhwcmVzc2lvbiB8IE1ldGFkYXRhRXJyb3IgfFxuICAgICAgICAgICAgICAgICBNZXRhZGF0YVN5bWJvbGljU2VsZWN0RXhwcmVzc2lvbiB8IG51bGwpW10gPSBbXTtcbiAgICAgICAgICAgIGxldCBoYXNEZWNvcmF0b3JEYXRhOiBib29sZWFuID0gZmFsc2U7XG4gICAgICAgICAgICBsZXQgaGFzUGFyYW1ldGVyRGF0YTogYm9vbGVhbiA9IGZhbHNlO1xuICAgICAgICAgICAgZm9yIChjb25zdCBwYXJhbWV0ZXIgb2YgcGFyYW1ldGVycykge1xuICAgICAgICAgICAgICBjb25zdCBwYXJhbWV0ZXJEYXRhID0gZ2V0RGVjb3JhdG9ycyhwYXJhbWV0ZXIuZGVjb3JhdG9ycyk7XG4gICAgICAgICAgICAgIHBhcmFtZXRlckRlY29yYXRvckRhdGEucHVzaChwYXJhbWV0ZXJEYXRhKTtcbiAgICAgICAgICAgICAgaGFzRGVjb3JhdG9yRGF0YSA9IGhhc0RlY29yYXRvckRhdGEgfHwgISFwYXJhbWV0ZXJEYXRhO1xuICAgICAgICAgICAgICBpZiAoaXNDb25zdHJ1Y3Rvcikge1xuICAgICAgICAgICAgICAgIGlmIChwYXJhbWV0ZXIudHlwZSkge1xuICAgICAgICAgICAgICAgICAgcGFyYW1ldGVyc0RhdGEucHVzaChyZWZlcmVuY2VGcm9tKHBhcmFtZXRlci50eXBlKSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgIHBhcmFtZXRlcnNEYXRhLnB1c2gobnVsbCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGhhc1BhcmFtZXRlckRhdGEgPSB0cnVlO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdCBkYXRhOiBNZXRob2RNZXRhZGF0YSA9IHtfX3N5bWJvbGljOiBpc0NvbnN0cnVjdG9yID8gJ2NvbnN0cnVjdG9yJyA6ICdtZXRob2QnfTtcbiAgICAgICAgICAgIGNvbnN0IG5hbWUgPSBpc0NvbnN0cnVjdG9yID8gJ19fY3Rvcl9fJyA6IGV2YWx1YXRvci5uYW1lT2YobWVtYmVyLm5hbWUpO1xuICAgICAgICAgICAgaWYgKG1ldGhvZERlY29yYXRvcnMpIHtcbiAgICAgICAgICAgICAgZGF0YS5kZWNvcmF0b3JzID0gbWV0aG9kRGVjb3JhdG9ycztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChoYXNEZWNvcmF0b3JEYXRhKSB7XG4gICAgICAgICAgICAgIGRhdGEucGFyYW1ldGVyRGVjb3JhdG9ycyA9IHBhcmFtZXRlckRlY29yYXRvckRhdGE7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoaGFzUGFyYW1ldGVyRGF0YSkge1xuICAgICAgICAgICAgICAoPENvbnN0cnVjdG9yTWV0YWRhdGE+ZGF0YSkucGFyYW1ldGVycyA9IHBhcmFtZXRlcnNEYXRhO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKCFpc01ldGFkYXRhRXJyb3IobmFtZSkpIHtcbiAgICAgICAgICAgICAgcmVjb3JkTWVtYmVyKG5hbWUsIGRhdGEpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSB0cy5TeW50YXhLaW5kLlByb3BlcnR5RGVjbGFyYXRpb246XG4gICAgICAgICAgY2FzZSB0cy5TeW50YXhLaW5kLkdldEFjY2Vzc29yOlxuICAgICAgICAgIGNhc2UgdHMuU3ludGF4S2luZC5TZXRBY2Nlc3NvcjpcbiAgICAgICAgICAgIGNvbnN0IHByb3BlcnR5ID0gPHRzLlByb3BlcnR5RGVjbGFyYXRpb24+bWVtYmVyO1xuICAgICAgICAgICAgaWYgKGlzU3RhdGljKHByb3BlcnR5KSkge1xuICAgICAgICAgICAgICBjb25zdCBuYW1lID0gZXZhbHVhdG9yLm5hbWVPZihwcm9wZXJ0eS5uYW1lKTtcbiAgICAgICAgICAgICAgaWYgKCFpc01ldGFkYXRhRXJyb3IobmFtZSkgJiYgIXNob3VsZElnbm9yZVN0YXRpY01lbWJlcihuYW1lKSkge1xuICAgICAgICAgICAgICAgIGlmIChwcm9wZXJ0eS5pbml0aWFsaXplcikge1xuICAgICAgICAgICAgICAgICAgY29uc3QgdmFsdWUgPSBldmFsdWF0b3IuZXZhbHVhdGVOb2RlKHByb3BlcnR5LmluaXRpYWxpemVyKTtcbiAgICAgICAgICAgICAgICAgIHJlY29yZFN0YXRpY01lbWJlcihuYW1lLCB2YWx1ZSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgIHJlY29yZFN0YXRpY01lbWJlcihuYW1lLCBlcnJvclN5bSgnVmFyaWFibGUgbm90IGluaXRpYWxpemVkJywgcHJvcGVydHkubmFtZSkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc3QgcHJvcGVydHlEZWNvcmF0b3JzID0gZ2V0RGVjb3JhdG9ycyhwcm9wZXJ0eS5kZWNvcmF0b3JzKTtcbiAgICAgICAgICAgIGlmIChwcm9wZXJ0eURlY29yYXRvcnMpIHtcbiAgICAgICAgICAgICAgY29uc3QgbmFtZSA9IGV2YWx1YXRvci5uYW1lT2YocHJvcGVydHkubmFtZSk7XG4gICAgICAgICAgICAgIGlmICghaXNNZXRhZGF0YUVycm9yKG5hbWUpKSB7XG4gICAgICAgICAgICAgICAgcmVjb3JkTWVtYmVyKG5hbWUsIHtfX3N5bWJvbGljOiAncHJvcGVydHknLCBkZWNvcmF0b3JzOiBwcm9wZXJ0eURlY29yYXRvcnN9KTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGlmIChtZW1iZXJzKSB7XG4gICAgICAgIHJlc3VsdC5tZW1iZXJzID0gbWVtYmVycztcbiAgICAgIH1cbiAgICAgIGlmIChzdGF0aWNzKSB7XG4gICAgICAgIHJlc3VsdC5zdGF0aWNzID0gc3RhdGljcztcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHJlY29yZEVudHJ5KHJlc3VsdCwgY2xhc3NEZWNsYXJhdGlvbik7XG4gICAgfVxuXG4gICAgLy8gQ29sbGVjdCBhbGwgZXhwb3J0ZWQgc3ltYm9scyBmcm9tIGFuIGV4cG9ydHMgY2xhdXNlLlxuICAgIGNvbnN0IGV4cG9ydE1hcCA9IG5ldyBNYXA8c3RyaW5nLCBzdHJpbmc+KCk7XG4gICAgdHMuZm9yRWFjaENoaWxkKHNvdXJjZUZpbGUsIG5vZGUgPT4ge1xuICAgICAgc3dpdGNoIChub2RlLmtpbmQpIHtcbiAgICAgICAgY2FzZSB0cy5TeW50YXhLaW5kLkV4cG9ydERlY2xhcmF0aW9uOlxuICAgICAgICAgIGNvbnN0IGV4cG9ydERlY2xhcmF0aW9uID0gPHRzLkV4cG9ydERlY2xhcmF0aW9uPm5vZGU7XG4gICAgICAgICAgY29uc3Qge21vZHVsZVNwZWNpZmllciwgZXhwb3J0Q2xhdXNlfSA9IGV4cG9ydERlY2xhcmF0aW9uO1xuXG4gICAgICAgICAgaWYgKCFtb2R1bGVTcGVjaWZpZXIpIHtcbiAgICAgICAgICAgIC8vIElmIHRoZXJlIGlzIGEgbW9kdWxlIHNwZWNpZmllciB0aGVyZSBpcyBhbHNvIGFuIGV4cG9ydENsYXVzZVxuICAgICAgICAgICAgZXhwb3J0Q2xhdXNlICEuZWxlbWVudHMuZm9yRWFjaChzcGVjID0+IHtcbiAgICAgICAgICAgICAgY29uc3QgZXhwb3J0ZWRBcyA9IHNwZWMubmFtZS50ZXh0O1xuICAgICAgICAgICAgICBjb25zdCBuYW1lID0gKHNwZWMucHJvcGVydHlOYW1lIHx8IHNwZWMubmFtZSkudGV4dDtcbiAgICAgICAgICAgICAgZXhwb3J0TWFwLnNldChuYW1lLCBleHBvcnRlZEFzKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH1cbiAgICAgIH1cbiAgICB9KTtcblxuICAgIGNvbnN0IGlzRXhwb3J0ID0gKG5vZGU6IHRzLk5vZGUpID0+IHNvdXJjZUZpbGUuaXNEZWNsYXJhdGlvbkZpbGUgfHxcbiAgICAgICAgdHMuZ2V0Q29tYmluZWRNb2RpZmllckZsYWdzKG5vZGUgYXMgdHMuRGVjbGFyYXRpb24pICYgdHMuTW9kaWZpZXJGbGFncy5FeHBvcnQ7XG4gICAgY29uc3QgaXNFeHBvcnRlZElkZW50aWZpZXIgPSAoaWRlbnRpZmllcj86IHRzLklkZW50aWZpZXIpID0+XG4gICAgICAgIGlkZW50aWZpZXIgJiYgZXhwb3J0TWFwLmhhcyhpZGVudGlmaWVyLnRleHQpO1xuICAgIGNvbnN0IGlzRXhwb3J0ZWQgPVxuICAgICAgICAobm9kZTogdHMuRnVuY3Rpb25EZWNsYXJhdGlvbiB8IHRzLkNsYXNzRGVjbGFyYXRpb24gfCB0cy5UeXBlQWxpYXNEZWNsYXJhdGlvbiB8XG4gICAgICAgICB0cy5JbnRlcmZhY2VEZWNsYXJhdGlvbiB8IHRzLkVudW1EZWNsYXJhdGlvbikgPT5cbiAgICAgICAgICAgIGlzRXhwb3J0KG5vZGUpIHx8IGlzRXhwb3J0ZWRJZGVudGlmaWVyKG5vZGUubmFtZSk7XG4gICAgY29uc3QgZXhwb3J0ZWRJZGVudGlmaWVyTmFtZSA9IChpZGVudGlmaWVyPzogdHMuSWRlbnRpZmllcikgPT5cbiAgICAgICAgaWRlbnRpZmllciAmJiAoZXhwb3J0TWFwLmdldChpZGVudGlmaWVyLnRleHQpIHx8IGlkZW50aWZpZXIudGV4dCk7XG4gICAgY29uc3QgZXhwb3J0ZWROYW1lID1cbiAgICAgICAgKG5vZGU6IHRzLkZ1bmN0aW9uRGVjbGFyYXRpb24gfCB0cy5DbGFzc0RlY2xhcmF0aW9uIHwgdHMuSW50ZXJmYWNlRGVjbGFyYXRpb24gfFxuICAgICAgICAgdHMuVHlwZUFsaWFzRGVjbGFyYXRpb24gfCB0cy5FbnVtRGVjbGFyYXRpb24pID0+IGV4cG9ydGVkSWRlbnRpZmllck5hbWUobm9kZS5uYW1lKTtcblxuXG4gICAgLy8gUHJlLWRlY2xhcmUgY2xhc3NlcyBhbmQgZnVuY3Rpb25zXG4gICAgdHMuZm9yRWFjaENoaWxkKHNvdXJjZUZpbGUsIG5vZGUgPT4ge1xuICAgICAgc3dpdGNoIChub2RlLmtpbmQpIHtcbiAgICAgICAgY2FzZSB0cy5TeW50YXhLaW5kLkNsYXNzRGVjbGFyYXRpb246XG4gICAgICAgICAgY29uc3QgY2xhc3NEZWNsYXJhdGlvbiA9IDx0cy5DbGFzc0RlY2xhcmF0aW9uPm5vZGU7XG4gICAgICAgICAgaWYgKGNsYXNzRGVjbGFyYXRpb24ubmFtZSkge1xuICAgICAgICAgICAgY29uc3QgY2xhc3NOYW1lID0gY2xhc3NEZWNsYXJhdGlvbi5uYW1lLnRleHQ7XG4gICAgICAgICAgICBpZiAoaXNFeHBvcnRlZChjbGFzc0RlY2xhcmF0aW9uKSkge1xuICAgICAgICAgICAgICBsb2NhbHMuZGVmaW5lKFxuICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lLCB7X19zeW1ib2xpYzogJ3JlZmVyZW5jZScsIG5hbWU6IGV4cG9ydGVkTmFtZShjbGFzc0RlY2xhcmF0aW9uKX0pO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgbG9jYWxzLmRlZmluZShcbiAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZSwgZXJyb3JTeW0oJ1JlZmVyZW5jZSB0byBub24tZXhwb3J0ZWQgY2xhc3MnLCBub2RlLCB7Y2xhc3NOYW1lfSkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgICBicmVhaztcblxuICAgICAgICBjYXNlIHRzLlN5bnRheEtpbmQuSW50ZXJmYWNlRGVjbGFyYXRpb246XG4gICAgICAgICAgY29uc3QgaW50ZXJmYWNlRGVjbGFyYXRpb24gPSA8dHMuSW50ZXJmYWNlRGVjbGFyYXRpb24+bm9kZTtcbiAgICAgICAgICBpZiAoaW50ZXJmYWNlRGVjbGFyYXRpb24ubmFtZSkge1xuICAgICAgICAgICAgY29uc3QgaW50ZXJmYWNlTmFtZSA9IGludGVyZmFjZURlY2xhcmF0aW9uLm5hbWUudGV4dDtcbiAgICAgICAgICAgIC8vIEFsbCByZWZlcmVuY2VzIHRvIGludGVyZmFjZXMgc2hvdWxkIGJlIGNvbnZlcnRlZCB0byByZWZlcmVuY2VzIHRvIGBhbnlgLlxuICAgICAgICAgICAgbG9jYWxzLmRlZmluZShpbnRlcmZhY2VOYW1lLCB7X19zeW1ib2xpYzogJ3JlZmVyZW5jZScsIG5hbWU6ICdhbnknfSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgIGNhc2UgdHMuU3ludGF4S2luZC5GdW5jdGlvbkRlY2xhcmF0aW9uOlxuICAgICAgICAgIGNvbnN0IGZ1bmN0aW9uRGVjbGFyYXRpb24gPSA8dHMuRnVuY3Rpb25EZWNsYXJhdGlvbj5ub2RlO1xuICAgICAgICAgIGlmICghaXNFeHBvcnRlZChmdW5jdGlvbkRlY2xhcmF0aW9uKSkge1xuICAgICAgICAgICAgLy8gUmVwb3J0IHJlZmVyZW5jZXMgdG8gdGhpcyBmdW5jdGlvbiBhcyBhbiBlcnJvci5cbiAgICAgICAgICAgIGNvbnN0IG5hbWVOb2RlID0gZnVuY3Rpb25EZWNsYXJhdGlvbi5uYW1lO1xuICAgICAgICAgICAgaWYgKG5hbWVOb2RlICYmIG5hbWVOb2RlLnRleHQpIHtcbiAgICAgICAgICAgICAgbG9jYWxzLmRlZmluZShcbiAgICAgICAgICAgICAgICAgIG5hbWVOb2RlLnRleHQsXG4gICAgICAgICAgICAgICAgICBlcnJvclN5bShcbiAgICAgICAgICAgICAgICAgICAgICAnUmVmZXJlbmNlIHRvIGEgbm9uLWV4cG9ydGVkIGZ1bmN0aW9uJywgbmFtZU5vZGUsIHtuYW1lOiBuYW1lTm9kZS50ZXh0fSkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIHRzLmZvckVhY2hDaGlsZChzb3VyY2VGaWxlLCBub2RlID0+IHtcbiAgICAgIHN3aXRjaCAobm9kZS5raW5kKSB7XG4gICAgICAgIGNhc2UgdHMuU3ludGF4S2luZC5FeHBvcnREZWNsYXJhdGlvbjpcbiAgICAgICAgICAvLyBSZWNvcmQgZXhwb3J0IGRlY2xhcmF0aW9uc1xuICAgICAgICAgIGNvbnN0IGV4cG9ydERlY2xhcmF0aW9uID0gPHRzLkV4cG9ydERlY2xhcmF0aW9uPm5vZGU7XG4gICAgICAgICAgY29uc3Qge21vZHVsZVNwZWNpZmllciwgZXhwb3J0Q2xhdXNlfSA9IGV4cG9ydERlY2xhcmF0aW9uO1xuXG4gICAgICAgICAgaWYgKCFtb2R1bGVTcGVjaWZpZXIpIHtcbiAgICAgICAgICAgIC8vIG5vIG1vZHVsZSBzcGVjaWZpZXIgLT4gZXhwb3J0IHtwcm9wTmFtZSBhcyBuYW1lfTtcbiAgICAgICAgICAgIGlmIChleHBvcnRDbGF1c2UpIHtcbiAgICAgICAgICAgICAgZXhwb3J0Q2xhdXNlLmVsZW1lbnRzLmZvckVhY2goc3BlYyA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3QgbmFtZSA9IHNwZWMubmFtZS50ZXh0O1xuICAgICAgICAgICAgICAgIC8vIElmIHRoZSBzeW1ib2wgd2FzIG5vdCBhbHJlYWR5IGV4cG9ydGVkLCBleHBvcnQgYSByZWZlcmVuY2Ugc2luY2UgaXQgaXMgYVxuICAgICAgICAgICAgICAgIC8vIHJlZmVyZW5jZSB0byBhbiBpbXBvcnRcbiAgICAgICAgICAgICAgICBpZiAoIW1ldGFkYXRhIHx8ICFtZXRhZGF0YVtuYW1lXSkge1xuICAgICAgICAgICAgICAgICAgY29uc3QgcHJvcE5vZGUgPSBzcGVjLnByb3BlcnR5TmFtZSB8fCBzcGVjLm5hbWU7XG4gICAgICAgICAgICAgICAgICBjb25zdCB2YWx1ZTogTWV0YWRhdGFWYWx1ZSA9IGV2YWx1YXRvci5ldmFsdWF0ZU5vZGUocHJvcE5vZGUpO1xuICAgICAgICAgICAgICAgICAgaWYgKCFtZXRhZGF0YSkgbWV0YWRhdGEgPSB7fTtcbiAgICAgICAgICAgICAgICAgIG1ldGFkYXRhW25hbWVdID0gcmVjb3JkRW50cnkodmFsdWUsIG5vZGUpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKG1vZHVsZVNwZWNpZmllciAmJiBtb2R1bGVTcGVjaWZpZXIua2luZCA9PSB0cy5TeW50YXhLaW5kLlN0cmluZ0xpdGVyYWwpIHtcbiAgICAgICAgICAgIC8vIElnbm9yZSBleHBvcnRzIHRoYXQgZG9uJ3QgaGF2ZSBzdHJpbmcgbGl0ZXJhbHMgYXMgZXhwb3J0cy5cbiAgICAgICAgICAgIC8vIFRoaXMgaXMgYWxsb3dlZCBieSB0aGUgc3ludGF4IGJ1dCB3aWxsIGJlIGZsYWdnZWQgYXMgYW4gZXJyb3IgYnkgdGhlIHR5cGUgY2hlY2tlci5cbiAgICAgICAgICAgIGNvbnN0IGZyb20gPSAoPHRzLlN0cmluZ0xpdGVyYWw+bW9kdWxlU3BlY2lmaWVyKS50ZXh0O1xuICAgICAgICAgICAgY29uc3QgbW9kdWxlRXhwb3J0OiBNb2R1bGVFeHBvcnRNZXRhZGF0YSA9IHtmcm9tfTtcbiAgICAgICAgICAgIGlmIChleHBvcnRDbGF1c2UpIHtcbiAgICAgICAgICAgICAgbW9kdWxlRXhwb3J0LmV4cG9ydCA9IGV4cG9ydENsYXVzZS5lbGVtZW50cy5tYXAoXG4gICAgICAgICAgICAgICAgICBzcGVjID0+IHNwZWMucHJvcGVydHlOYW1lID8ge25hbWU6IHNwZWMucHJvcGVydHlOYW1lLnRleHQsIGFzOiBzcGVjLm5hbWUudGV4dH0gOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNwZWMubmFtZS50ZXh0KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICghZXhwb3J0cykgZXhwb3J0cyA9IFtdO1xuICAgICAgICAgICAgZXhwb3J0cy5wdXNoKG1vZHVsZUV4cG9ydCk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIHRzLlN5bnRheEtpbmQuQ2xhc3NEZWNsYXJhdGlvbjpcbiAgICAgICAgICBjb25zdCBjbGFzc0RlY2xhcmF0aW9uID0gPHRzLkNsYXNzRGVjbGFyYXRpb24+bm9kZTtcbiAgICAgICAgICBpZiAoY2xhc3NEZWNsYXJhdGlvbi5uYW1lKSB7XG4gICAgICAgICAgICBpZiAoaXNFeHBvcnRlZChjbGFzc0RlY2xhcmF0aW9uKSkge1xuICAgICAgICAgICAgICBjb25zdCBuYW1lID0gZXhwb3J0ZWROYW1lKGNsYXNzRGVjbGFyYXRpb24pO1xuICAgICAgICAgICAgICBpZiAobmFtZSkge1xuICAgICAgICAgICAgICAgIGlmICghbWV0YWRhdGEpIG1ldGFkYXRhID0ge307XG4gICAgICAgICAgICAgICAgbWV0YWRhdGFbbmFtZV0gPSBjbGFzc01ldGFkYXRhT2YoY2xhc3NEZWNsYXJhdGlvbik7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgICAgLy8gT3RoZXJ3aXNlIGRvbid0IHJlY29yZCBtZXRhZGF0YSBmb3IgdGhlIGNsYXNzLlxuICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgIGNhc2UgdHMuU3ludGF4S2luZC5UeXBlQWxpYXNEZWNsYXJhdGlvbjpcbiAgICAgICAgICBjb25zdCB0eXBlRGVjbGFyYXRpb24gPSA8dHMuVHlwZUFsaWFzRGVjbGFyYXRpb24+bm9kZTtcbiAgICAgICAgICBpZiAodHlwZURlY2xhcmF0aW9uLm5hbWUgJiYgaXNFeHBvcnRlZCh0eXBlRGVjbGFyYXRpb24pKSB7XG4gICAgICAgICAgICBjb25zdCBuYW1lID0gZXhwb3J0ZWROYW1lKHR5cGVEZWNsYXJhdGlvbik7XG4gICAgICAgICAgICBpZiAobmFtZSkge1xuICAgICAgICAgICAgICBpZiAoIW1ldGFkYXRhKSBtZXRhZGF0YSA9IHt9O1xuICAgICAgICAgICAgICBtZXRhZGF0YVtuYW1lXSA9IHtfX3N5bWJvbGljOiAnaW50ZXJmYWNlJ307XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgIGNhc2UgdHMuU3ludGF4S2luZC5JbnRlcmZhY2VEZWNsYXJhdGlvbjpcbiAgICAgICAgICBjb25zdCBpbnRlcmZhY2VEZWNsYXJhdGlvbiA9IDx0cy5JbnRlcmZhY2VEZWNsYXJhdGlvbj5ub2RlO1xuICAgICAgICAgIGlmIChpbnRlcmZhY2VEZWNsYXJhdGlvbi5uYW1lICYmIGlzRXhwb3J0ZWQoaW50ZXJmYWNlRGVjbGFyYXRpb24pKSB7XG4gICAgICAgICAgICBjb25zdCBuYW1lID0gZXhwb3J0ZWROYW1lKGludGVyZmFjZURlY2xhcmF0aW9uKTtcbiAgICAgICAgICAgIGlmIChuYW1lKSB7XG4gICAgICAgICAgICAgIGlmICghbWV0YWRhdGEpIG1ldGFkYXRhID0ge307XG4gICAgICAgICAgICAgIG1ldGFkYXRhW25hbWVdID0ge19fc3ltYm9saWM6ICdpbnRlcmZhY2UnfTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgY2FzZSB0cy5TeW50YXhLaW5kLkZ1bmN0aW9uRGVjbGFyYXRpb246XG4gICAgICAgICAgLy8gUmVjb3JkIGZ1bmN0aW9ucyB0aGF0IHJldHVybiBhIHNpbmdsZSB2YWx1ZS4gUmVjb3JkIHRoZSBwYXJhbWV0ZXJcbiAgICAgICAgICAvLyBuYW1lcyBzdWJzdGl0dXRpb24gd2lsbCBiZSBwZXJmb3JtZWQgYnkgdGhlIFN0YXRpY1JlZmxlY3Rvci5cbiAgICAgICAgICBjb25zdCBmdW5jdGlvbkRlY2xhcmF0aW9uID0gPHRzLkZ1bmN0aW9uRGVjbGFyYXRpb24+bm9kZTtcbiAgICAgICAgICBpZiAoaXNFeHBvcnRlZChmdW5jdGlvbkRlY2xhcmF0aW9uKSAmJiBmdW5jdGlvbkRlY2xhcmF0aW9uLm5hbWUpIHtcbiAgICAgICAgICAgIGNvbnN0IG5hbWUgPSBleHBvcnRlZE5hbWUoZnVuY3Rpb25EZWNsYXJhdGlvbik7XG4gICAgICAgICAgICBjb25zdCBtYXliZUZ1bmMgPSBtYXliZUdldFNpbXBsZUZ1bmN0aW9uKGZ1bmN0aW9uRGVjbGFyYXRpb24pO1xuICAgICAgICAgICAgaWYgKG5hbWUpIHtcbiAgICAgICAgICAgICAgaWYgKCFtZXRhZGF0YSkgbWV0YWRhdGEgPSB7fTtcbiAgICAgICAgICAgICAgLy8gVE9ETyhhbHhodWIpOiBUaGUgbGl0ZXJhbCBoZXJlIGlzIG5vdCB2YWxpZCBGdW5jdGlvbk1ldGFkYXRhLlxuICAgICAgICAgICAgICBtZXRhZGF0YVtuYW1lXSA9IG1heWJlRnVuYyA/IHJlY29yZEVudHJ5KG1heWJlRnVuYy5mdW5jLCBub2RlKSA6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKHsgX19zeW1ib2xpYzogJ2Z1bmN0aW9uJyB9IGFzIGFueSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgIGNhc2UgdHMuU3ludGF4S2luZC5FbnVtRGVjbGFyYXRpb246XG4gICAgICAgICAgY29uc3QgZW51bURlY2xhcmF0aW9uID0gPHRzLkVudW1EZWNsYXJhdGlvbj5ub2RlO1xuICAgICAgICAgIGlmIChpc0V4cG9ydGVkKGVudW1EZWNsYXJhdGlvbikpIHtcbiAgICAgICAgICAgIGNvbnN0IGVudW1WYWx1ZUhvbGRlcjoge1tuYW1lOiBzdHJpbmddOiBNZXRhZGF0YVZhbHVlfSA9IHt9O1xuICAgICAgICAgICAgY29uc3QgZW51bU5hbWUgPSBleHBvcnRlZE5hbWUoZW51bURlY2xhcmF0aW9uKTtcbiAgICAgICAgICAgIGxldCBuZXh0RGVmYXVsdFZhbHVlOiBNZXRhZGF0YVZhbHVlID0gMDtcbiAgICAgICAgICAgIGxldCB3cml0dGVuTWVtYmVycyA9IDA7XG4gICAgICAgICAgICBmb3IgKGNvbnN0IG1lbWJlciBvZiBlbnVtRGVjbGFyYXRpb24ubWVtYmVycykge1xuICAgICAgICAgICAgICBsZXQgZW51bVZhbHVlOiBNZXRhZGF0YVZhbHVlO1xuICAgICAgICAgICAgICBpZiAoIW1lbWJlci5pbml0aWFsaXplcikge1xuICAgICAgICAgICAgICAgIGVudW1WYWx1ZSA9IG5leHREZWZhdWx0VmFsdWU7XG4gICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgZW51bVZhbHVlID0gZXZhbHVhdG9yLmV2YWx1YXRlTm9kZShtZW1iZXIuaW5pdGlhbGl6ZXIpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIGxldCBuYW1lOiBzdHJpbmd8dW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgICBpZiAobWVtYmVyLm5hbWUua2luZCA9PSB0cy5TeW50YXhLaW5kLklkZW50aWZpZXIpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBpZGVudGlmaWVyID0gPHRzLklkZW50aWZpZXI+bWVtYmVyLm5hbWU7XG4gICAgICAgICAgICAgICAgbmFtZSA9IGlkZW50aWZpZXIudGV4dDtcbiAgICAgICAgICAgICAgICBlbnVtVmFsdWVIb2xkZXJbbmFtZV0gPSBlbnVtVmFsdWU7XG4gICAgICAgICAgICAgICAgd3JpdHRlbk1lbWJlcnMrKztcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBpZiAodHlwZW9mIGVudW1WYWx1ZSA9PT0gJ251bWJlcicpIHtcbiAgICAgICAgICAgICAgICBuZXh0RGVmYXVsdFZhbHVlID0gZW51bVZhbHVlICsgMTtcbiAgICAgICAgICAgICAgfSBlbHNlIGlmIChuYW1lKSB7XG4gICAgICAgICAgICAgICAgLy8gVE9ETyhhbHhodWIpOiAnbGVmdCcgaGVyZSBoYXMgYSBuYW1lIHByb3Blcnkgd2hpY2ggaXMgbm90IHZhbGlkIGZvclxuICAgICAgICAgICAgICAgIC8vIE1ldGFkYXRhU3ltYm9saWNTZWxlY3RFeHByZXNzaW9uLlxuICAgICAgICAgICAgICAgIG5leHREZWZhdWx0VmFsdWUgPSB7XG4gICAgICAgICAgICAgICAgICBfX3N5bWJvbGljOiAnYmluYXJ5JyxcbiAgICAgICAgICAgICAgICAgIG9wZXJhdG9yOiAnKycsXG4gICAgICAgICAgICAgICAgICBsZWZ0OiB7XG4gICAgICAgICAgICAgICAgICAgIF9fc3ltYm9saWM6ICdzZWxlY3QnLFxuICAgICAgICAgICAgICAgICAgICBleHByZXNzaW9uOiByZWNvcmRFbnRyeSh7X19zeW1ib2xpYzogJ3JlZmVyZW5jZScsIG5hbWU6IGVudW1OYW1lfSwgbm9kZSksIG5hbWVcbiAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgfSBhcyBhbnk7XG4gICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgbmV4dERlZmF1bHRWYWx1ZSA9XG4gICAgICAgICAgICAgICAgICAgIHJlY29yZEVudHJ5KGVycm9yU3ltKCdVbnN1cHBvcnRlZCBlbnVtIG1lbWJlciBuYW1lJywgbWVtYmVyLm5hbWUpLCBub2RlKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHdyaXR0ZW5NZW1iZXJzKSB7XG4gICAgICAgICAgICAgIGlmIChlbnVtTmFtZSkge1xuICAgICAgICAgICAgICAgIGlmICghbWV0YWRhdGEpIG1ldGFkYXRhID0ge307XG4gICAgICAgICAgICAgICAgbWV0YWRhdGFbZW51bU5hbWVdID0gcmVjb3JkRW50cnkoZW51bVZhbHVlSG9sZGVyLCBub2RlKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgICBicmVhaztcblxuICAgICAgICBjYXNlIHRzLlN5bnRheEtpbmQuVmFyaWFibGVTdGF0ZW1lbnQ6XG4gICAgICAgICAgY29uc3QgdmFyaWFibGVTdGF0ZW1lbnQgPSA8dHMuVmFyaWFibGVTdGF0ZW1lbnQ+bm9kZTtcbiAgICAgICAgICBmb3IgKGNvbnN0IHZhcmlhYmxlRGVjbGFyYXRpb24gb2YgdmFyaWFibGVTdGF0ZW1lbnQuZGVjbGFyYXRpb25MaXN0LmRlY2xhcmF0aW9ucykge1xuICAgICAgICAgICAgaWYgKHZhcmlhYmxlRGVjbGFyYXRpb24ubmFtZS5raW5kID09IHRzLlN5bnRheEtpbmQuSWRlbnRpZmllcikge1xuICAgICAgICAgICAgICBjb25zdCBuYW1lTm9kZSA9IDx0cy5JZGVudGlmaWVyPnZhcmlhYmxlRGVjbGFyYXRpb24ubmFtZTtcbiAgICAgICAgICAgICAgbGV0IHZhclZhbHVlOiBNZXRhZGF0YVZhbHVlO1xuICAgICAgICAgICAgICBpZiAodmFyaWFibGVEZWNsYXJhdGlvbi5pbml0aWFsaXplcikge1xuICAgICAgICAgICAgICAgIHZhclZhbHVlID0gZXZhbHVhdG9yLmV2YWx1YXRlTm9kZSh2YXJpYWJsZURlY2xhcmF0aW9uLmluaXRpYWxpemVyKTtcbiAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB2YXJWYWx1ZSA9IHJlY29yZEVudHJ5KGVycm9yU3ltKCdWYXJpYWJsZSBub3QgaW5pdGlhbGl6ZWQnLCBuYW1lTm9kZSksIG5hbWVOb2RlKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBsZXQgZXhwb3J0ZWQgPSBmYWxzZTtcbiAgICAgICAgICAgICAgaWYgKGlzRXhwb3J0KHZhcmlhYmxlU3RhdGVtZW50KSB8fCBpc0V4cG9ydCh2YXJpYWJsZURlY2xhcmF0aW9uKSB8fFxuICAgICAgICAgICAgICAgICAgaXNFeHBvcnRlZElkZW50aWZpZXIobmFtZU5vZGUpKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgbmFtZSA9IGV4cG9ydGVkSWRlbnRpZmllck5hbWUobmFtZU5vZGUpO1xuICAgICAgICAgICAgICAgIGlmIChuYW1lKSB7XG4gICAgICAgICAgICAgICAgICBpZiAoIW1ldGFkYXRhKSBtZXRhZGF0YSA9IHt9O1xuICAgICAgICAgICAgICAgICAgbWV0YWRhdGFbbmFtZV0gPSByZWNvcmRFbnRyeSh2YXJWYWx1ZSwgbm9kZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGV4cG9ydGVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBpZiAodHlwZW9mIHZhclZhbHVlID09ICdzdHJpbmcnIHx8IHR5cGVvZiB2YXJWYWx1ZSA9PSAnbnVtYmVyJyB8fFxuICAgICAgICAgICAgICAgICAgdHlwZW9mIHZhclZhbHVlID09ICdib29sZWFuJykge1xuICAgICAgICAgICAgICAgIGxvY2Fscy5kZWZpbmUobmFtZU5vZGUudGV4dCwgdmFyVmFsdWUpO1xuICAgICAgICAgICAgICAgIGlmIChleHBvcnRlZCkge1xuICAgICAgICAgICAgICAgICAgbG9jYWxzLmRlZmluZVJlZmVyZW5jZShcbiAgICAgICAgICAgICAgICAgICAgICBuYW1lTm9kZS50ZXh0LCB7X19zeW1ib2xpYzogJ3JlZmVyZW5jZScsIG5hbWU6IG5hbWVOb2RlLnRleHR9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH0gZWxzZSBpZiAoIWV4cG9ydGVkKSB7XG4gICAgICAgICAgICAgICAgaWYgKHZhclZhbHVlICYmICFpc01ldGFkYXRhRXJyb3IodmFyVmFsdWUpKSB7XG4gICAgICAgICAgICAgICAgICBsb2NhbHMuZGVmaW5lKG5hbWVOb2RlLnRleHQsIHJlY29yZEVudHJ5KHZhclZhbHVlLCBub2RlKSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgIGxvY2Fscy5kZWZpbmUoXG4gICAgICAgICAgICAgICAgICAgICAgbmFtZU5vZGUudGV4dCxcbiAgICAgICAgICAgICAgICAgICAgICByZWNvcmRFbnRyeShcbiAgICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JTeW0oJ1JlZmVyZW5jZSB0byBhIGxvY2FsIHN5bWJvbCcsIG5hbWVOb2RlLCB7bmFtZTogbmFtZU5vZGUudGV4dH0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICBub2RlKSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAvLyBEZXN0cnVjdHVyaW5nIChvciBiaW5kaW5nKSBkZWNsYXJhdGlvbnMgYXJlIG5vdCBzdXBwb3J0ZWQsXG4gICAgICAgICAgICAgIC8vIHZhciB7PGlkZW50aWZpZXI+WywgPGlkZW50aWZpZXI+XSt9ID0gPGV4cHJlc3Npb24+O1xuICAgICAgICAgICAgICAvLyAgIG9yXG4gICAgICAgICAgICAgIC8vIHZhciBbPGlkZW50aWZpZXI+WywgPGlkZW50aWZpZXJ9K10gPSA8ZXhwcmVzc2lvbj47XG4gICAgICAgICAgICAgIC8vIGFyZSBub3Qgc3VwcG9ydGVkLlxuICAgICAgICAgICAgICBjb25zdCByZXBvcnQ6IChuYW1lTm9kZTogdHMuTm9kZSkgPT4gdm9pZCA9IChuYW1lTm9kZTogdHMuTm9kZSkgPT4ge1xuICAgICAgICAgICAgICAgIHN3aXRjaCAobmFtZU5vZGUua2luZCkge1xuICAgICAgICAgICAgICAgICAgY2FzZSB0cy5TeW50YXhLaW5kLklkZW50aWZpZXI6XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IG5hbWUgPSA8dHMuSWRlbnRpZmllcj5uYW1lTm9kZTtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgdmFyVmFsdWUgPSBlcnJvclN5bSgnRGVzdHJ1Y3R1cmluZyBub3Qgc3VwcG9ydGVkJywgbmFtZSk7XG4gICAgICAgICAgICAgICAgICAgIGxvY2Fscy5kZWZpbmUobmFtZS50ZXh0LCB2YXJWYWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChpc0V4cG9ydChub2RlKSkge1xuICAgICAgICAgICAgICAgICAgICAgIGlmICghbWV0YWRhdGEpIG1ldGFkYXRhID0ge307XG4gICAgICAgICAgICAgICAgICAgICAgbWV0YWRhdGFbbmFtZS50ZXh0XSA9IHZhclZhbHVlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgY2FzZSB0cy5TeW50YXhLaW5kLkJpbmRpbmdFbGVtZW50OlxuICAgICAgICAgICAgICAgICAgICBjb25zdCBiaW5kaW5nRWxlbWVudCA9IDx0cy5CaW5kaW5nRWxlbWVudD5uYW1lTm9kZTtcbiAgICAgICAgICAgICAgICAgICAgcmVwb3J0KGJpbmRpbmdFbGVtZW50Lm5hbWUpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgIGNhc2UgdHMuU3ludGF4S2luZC5PYmplY3RCaW5kaW5nUGF0dGVybjpcbiAgICAgICAgICAgICAgICAgIGNhc2UgdHMuU3ludGF4S2luZC5BcnJheUJpbmRpbmdQYXR0ZXJuOlxuICAgICAgICAgICAgICAgICAgICBjb25zdCBiaW5kaW5ncyA9IDx0cy5CaW5kaW5nUGF0dGVybj5uYW1lTm9kZTtcbiAgICAgICAgICAgICAgICAgICAgKGJpbmRpbmdzIGFzIGFueSkuZWxlbWVudHMuZm9yRWFjaChyZXBvcnQpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgIHJlcG9ydCh2YXJpYWJsZURlY2xhcmF0aW9uLm5hbWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIGlmIChtZXRhZGF0YSB8fCBleHBvcnRzKSB7XG4gICAgICBpZiAoIW1ldGFkYXRhKVxuICAgICAgICBtZXRhZGF0YSA9IHt9O1xuICAgICAgZWxzZSBpZiAoc3RyaWN0KSB7XG4gICAgICAgIHZhbGlkYXRlTWV0YWRhdGEoc291cmNlRmlsZSwgbm9kZU1hcCwgbWV0YWRhdGEpO1xuICAgICAgfVxuICAgICAgY29uc3QgcmVzdWx0OiBNb2R1bGVNZXRhZGF0YSA9IHtcbiAgICAgICAgX19zeW1ib2xpYzogJ21vZHVsZScsXG4gICAgICAgIHZlcnNpb246IHRoaXMub3B0aW9ucy52ZXJzaW9uIHx8IE1FVEFEQVRBX1ZFUlNJT04sIG1ldGFkYXRhXG4gICAgICB9O1xuICAgICAgaWYgKHNvdXJjZUZpbGUubW9kdWxlTmFtZSkgcmVzdWx0LmltcG9ydEFzID0gc291cmNlRmlsZS5tb2R1bGVOYW1lO1xuICAgICAgaWYgKGV4cG9ydHMpIHJlc3VsdC5leHBvcnRzID0gZXhwb3J0cztcbiAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxuICB9XG59XG5cbi8vIFRoaXMgd2lsbCB0aHJvdyBpZiB0aGUgbWV0YWRhdGEgZW50cnkgZ2l2ZW4gY29udGFpbnMgYW4gZXJyb3Igbm9kZS5cbmZ1bmN0aW9uIHZhbGlkYXRlTWV0YWRhdGEoXG4gICAgc291cmNlRmlsZTogdHMuU291cmNlRmlsZSwgbm9kZU1hcDogTWFwPE1ldGFkYXRhRW50cnksIHRzLk5vZGU+LFxuICAgIG1ldGFkYXRhOiB7W25hbWU6IHN0cmluZ106IE1ldGFkYXRhRW50cnl9KSB7XG4gIGxldCBsb2NhbHM6IFNldDxzdHJpbmc+ID0gbmV3IFNldChbJ0FycmF5JywgJ09iamVjdCcsICdTZXQnLCAnTWFwJywgJ3N0cmluZycsICdudW1iZXInLCAnYW55J10pO1xuXG4gIGZ1bmN0aW9uIHZhbGlkYXRlRXhwcmVzc2lvbihcbiAgICAgIGV4cHJlc3Npb246IE1ldGFkYXRhVmFsdWUgfCBNZXRhZGF0YVN5bWJvbGljRXhwcmVzc2lvbiB8IE1ldGFkYXRhRXJyb3IpIHtcbiAgICBpZiAoIWV4cHJlc3Npb24pIHtcbiAgICAgIHJldHVybjtcbiAgICB9IGVsc2UgaWYgKEFycmF5LmlzQXJyYXkoZXhwcmVzc2lvbikpIHtcbiAgICAgIGV4cHJlc3Npb24uZm9yRWFjaCh2YWxpZGF0ZUV4cHJlc3Npb24pO1xuICAgIH0gZWxzZSBpZiAodHlwZW9mIGV4cHJlc3Npb24gPT09ICdvYmplY3QnICYmICFleHByZXNzaW9uLmhhc093blByb3BlcnR5KCdfX3N5bWJvbGljJykpIHtcbiAgICAgIE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzKGV4cHJlc3Npb24pLmZvckVhY2godiA9PiB2YWxpZGF0ZUV4cHJlc3Npb24oKDxhbnk+ZXhwcmVzc2lvbilbdl0pKTtcbiAgICB9IGVsc2UgaWYgKGlzTWV0YWRhdGFFcnJvcihleHByZXNzaW9uKSkge1xuICAgICAgcmVwb3J0RXJyb3IoZXhwcmVzc2lvbik7XG4gICAgfSBlbHNlIGlmIChpc01ldGFkYXRhR2xvYmFsUmVmZXJlbmNlRXhwcmVzc2lvbihleHByZXNzaW9uKSkge1xuICAgICAgaWYgKCFsb2NhbHMuaGFzKGV4cHJlc3Npb24ubmFtZSkpIHtcbiAgICAgICAgY29uc3QgcmVmZXJlbmNlID0gPE1ldGFkYXRhVmFsdWU+bWV0YWRhdGFbZXhwcmVzc2lvbi5uYW1lXTtcbiAgICAgICAgaWYgKHJlZmVyZW5jZSkge1xuICAgICAgICAgIHZhbGlkYXRlRXhwcmVzc2lvbihyZWZlcmVuY2UpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSBlbHNlIGlmIChpc0Z1bmN0aW9uTWV0YWRhdGEoZXhwcmVzc2lvbikpIHtcbiAgICAgIHZhbGlkYXRlRnVuY3Rpb24oPGFueT5leHByZXNzaW9uKTtcbiAgICB9IGVsc2UgaWYgKGlzTWV0YWRhdGFTeW1ib2xpY0V4cHJlc3Npb24oZXhwcmVzc2lvbikpIHtcbiAgICAgIHN3aXRjaCAoZXhwcmVzc2lvbi5fX3N5bWJvbGljKSB7XG4gICAgICAgIGNhc2UgJ2JpbmFyeSc6XG4gICAgICAgICAgY29uc3QgYmluYXJ5RXhwcmVzc2lvbiA9IDxNZXRhZGF0YVN5bWJvbGljQmluYXJ5RXhwcmVzc2lvbj5leHByZXNzaW9uO1xuICAgICAgICAgIHZhbGlkYXRlRXhwcmVzc2lvbihiaW5hcnlFeHByZXNzaW9uLmxlZnQpO1xuICAgICAgICAgIHZhbGlkYXRlRXhwcmVzc2lvbihiaW5hcnlFeHByZXNzaW9uLnJpZ2h0KTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAnY2FsbCc6XG4gICAgICAgIGNhc2UgJ25ldyc6XG4gICAgICAgICAgY29uc3QgY2FsbEV4cHJlc3Npb24gPSA8TWV0YWRhdGFTeW1ib2xpY0NhbGxFeHByZXNzaW9uPmV4cHJlc3Npb247XG4gICAgICAgICAgdmFsaWRhdGVFeHByZXNzaW9uKGNhbGxFeHByZXNzaW9uLmV4cHJlc3Npb24pO1xuICAgICAgICAgIGlmIChjYWxsRXhwcmVzc2lvbi5hcmd1bWVudHMpIGNhbGxFeHByZXNzaW9uLmFyZ3VtZW50cy5mb3JFYWNoKHZhbGlkYXRlRXhwcmVzc2lvbik7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ2luZGV4JzpcbiAgICAgICAgICBjb25zdCBpbmRleEV4cHJlc3Npb24gPSA8TWV0YWRhdGFTeW1ib2xpY0luZGV4RXhwcmVzc2lvbj5leHByZXNzaW9uO1xuICAgICAgICAgIHZhbGlkYXRlRXhwcmVzc2lvbihpbmRleEV4cHJlc3Npb24uZXhwcmVzc2lvbik7XG4gICAgICAgICAgdmFsaWRhdGVFeHByZXNzaW9uKGluZGV4RXhwcmVzc2lvbi5pbmRleCk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ3ByZSc6XG4gICAgICAgICAgY29uc3QgcHJlZml4RXhwcmVzc2lvbiA9IDxNZXRhZGF0YVN5bWJvbGljUHJlZml4RXhwcmVzc2lvbj5leHByZXNzaW9uO1xuICAgICAgICAgIHZhbGlkYXRlRXhwcmVzc2lvbihwcmVmaXhFeHByZXNzaW9uLm9wZXJhbmQpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICdzZWxlY3QnOlxuICAgICAgICAgIGNvbnN0IHNlbGVjdEV4cHJlc3Npb24gPSA8TWV0YWRhdGFTeW1ib2xpY1NlbGVjdEV4cHJlc3Npb24+ZXhwcmVzc2lvbjtcbiAgICAgICAgICB2YWxpZGF0ZUV4cHJlc3Npb24oc2VsZWN0RXhwcmVzc2lvbi5leHByZXNzaW9uKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAnc3ByZWFkJzpcbiAgICAgICAgICBjb25zdCBzcHJlYWRFeHByZXNzaW9uID0gPE1ldGFkYXRhU3ltYm9saWNTcHJlYWRFeHByZXNzaW9uPmV4cHJlc3Npb247XG4gICAgICAgICAgdmFsaWRhdGVFeHByZXNzaW9uKHNwcmVhZEV4cHJlc3Npb24uZXhwcmVzc2lvbik7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ2lmJzpcbiAgICAgICAgICBjb25zdCBpZkV4cHJlc3Npb24gPSA8TWV0YWRhdGFTeW1ib2xpY0lmRXhwcmVzc2lvbj5leHByZXNzaW9uO1xuICAgICAgICAgIHZhbGlkYXRlRXhwcmVzc2lvbihpZkV4cHJlc3Npb24uY29uZGl0aW9uKTtcbiAgICAgICAgICB2YWxpZGF0ZUV4cHJlc3Npb24oaWZFeHByZXNzaW9uLmVsc2VFeHByZXNzaW9uKTtcbiAgICAgICAgICB2YWxpZGF0ZUV4cHJlc3Npb24oaWZFeHByZXNzaW9uLnRoZW5FeHByZXNzaW9uKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiB2YWxpZGF0ZU1lbWJlcihjbGFzc0RhdGE6IENsYXNzTWV0YWRhdGEsIG1lbWJlcjogTWVtYmVyTWV0YWRhdGEpIHtcbiAgICBpZiAobWVtYmVyLmRlY29yYXRvcnMpIHtcbiAgICAgIG1lbWJlci5kZWNvcmF0b3JzLmZvckVhY2godmFsaWRhdGVFeHByZXNzaW9uKTtcbiAgICB9XG4gICAgaWYgKGlzTWV0aG9kTWV0YWRhdGEobWVtYmVyKSAmJiBtZW1iZXIucGFyYW1ldGVyRGVjb3JhdG9ycykge1xuICAgICAgbWVtYmVyLnBhcmFtZXRlckRlY29yYXRvcnMuZm9yRWFjaCh2YWxpZGF0ZUV4cHJlc3Npb24pO1xuICAgIH1cbiAgICAvLyBPbmx5IHZhbGlkYXRlIHBhcmFtZXRlcnMgb2YgY2xhc3NlcyBmb3Igd2hpY2ggd2Uga25vdyB0aGF0IGFyZSB1c2VkIHdpdGggb3VyIERJXG4gICAgaWYgKGNsYXNzRGF0YS5kZWNvcmF0b3JzICYmIGlzQ29uc3RydWN0b3JNZXRhZGF0YShtZW1iZXIpICYmIG1lbWJlci5wYXJhbWV0ZXJzKSB7XG4gICAgICBtZW1iZXIucGFyYW1ldGVycy5mb3JFYWNoKHZhbGlkYXRlRXhwcmVzc2lvbik7XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gdmFsaWRhdGVDbGFzcyhjbGFzc0RhdGE6IENsYXNzTWV0YWRhdGEpIHtcbiAgICBpZiAoY2xhc3NEYXRhLmRlY29yYXRvcnMpIHtcbiAgICAgIGNsYXNzRGF0YS5kZWNvcmF0b3JzLmZvckVhY2godmFsaWRhdGVFeHByZXNzaW9uKTtcbiAgICB9XG4gICAgaWYgKGNsYXNzRGF0YS5tZW1iZXJzKSB7XG4gICAgICBPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyhjbGFzc0RhdGEubWVtYmVycylcbiAgICAgICAgICAuZm9yRWFjaChuYW1lID0+IGNsYXNzRGF0YS5tZW1iZXJzICFbbmFtZV0uZm9yRWFjaCgobSkgPT4gdmFsaWRhdGVNZW1iZXIoY2xhc3NEYXRhLCBtKSkpO1xuICAgIH1cbiAgICBpZiAoY2xhc3NEYXRhLnN0YXRpY3MpIHtcbiAgICAgIE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzKGNsYXNzRGF0YS5zdGF0aWNzKS5mb3JFYWNoKG5hbWUgPT4ge1xuICAgICAgICBjb25zdCBzdGF0aWNNZW1iZXIgPSBjbGFzc0RhdGEuc3RhdGljcyAhW25hbWVdO1xuICAgICAgICBpZiAoaXNGdW5jdGlvbk1ldGFkYXRhKHN0YXRpY01lbWJlcikpIHtcbiAgICAgICAgICB2YWxpZGF0ZUV4cHJlc3Npb24oc3RhdGljTWVtYmVyLnZhbHVlKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB2YWxpZGF0ZUV4cHJlc3Npb24oc3RhdGljTWVtYmVyKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gdmFsaWRhdGVGdW5jdGlvbihmdW5jdGlvbkRlY2xhcmF0aW9uOiBGdW5jdGlvbk1ldGFkYXRhKSB7XG4gICAgaWYgKGZ1bmN0aW9uRGVjbGFyYXRpb24udmFsdWUpIHtcbiAgICAgIGNvbnN0IG9sZExvY2FscyA9IGxvY2FscztcbiAgICAgIGlmIChmdW5jdGlvbkRlY2xhcmF0aW9uLnBhcmFtZXRlcnMpIHtcbiAgICAgICAgbG9jYWxzID0gbmV3IFNldChvbGRMb2NhbHMudmFsdWVzKCkpO1xuICAgICAgICBpZiAoZnVuY3Rpb25EZWNsYXJhdGlvbi5wYXJhbWV0ZXJzKVxuICAgICAgICAgIGZ1bmN0aW9uRGVjbGFyYXRpb24ucGFyYW1ldGVycy5mb3JFYWNoKG4gPT4gbG9jYWxzLmFkZChuKSk7XG4gICAgICB9XG4gICAgICB2YWxpZGF0ZUV4cHJlc3Npb24oZnVuY3Rpb25EZWNsYXJhdGlvbi52YWx1ZSk7XG4gICAgICBsb2NhbHMgPSBvbGRMb2NhbHM7XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gc2hvdWxkUmVwb3J0Tm9kZShub2RlOiB0cy5Ob2RlIHwgdW5kZWZpbmVkKSB7XG4gICAgaWYgKG5vZGUpIHtcbiAgICAgIGNvbnN0IG5vZGVTdGFydCA9IG5vZGUuZ2V0U3RhcnQoKTtcbiAgICAgIHJldHVybiAhKFxuICAgICAgICAgIG5vZGUucG9zICE9IG5vZGVTdGFydCAmJlxuICAgICAgICAgIHNvdXJjZUZpbGUudGV4dC5zdWJzdHJpbmcobm9kZS5wb3MsIG5vZGVTdGFydCkuaW5kZXhPZignQGR5bmFtaWMnKSA+PSAwKTtcbiAgICB9XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICBmdW5jdGlvbiByZXBvcnRFcnJvcihlcnJvcjogTWV0YWRhdGFFcnJvcikge1xuICAgIGNvbnN0IG5vZGUgPSBub2RlTWFwLmdldChlcnJvcik7XG4gICAgaWYgKHNob3VsZFJlcG9ydE5vZGUobm9kZSkpIHtcbiAgICAgIGNvbnN0IGxpbmVJbmZvID0gZXJyb3IubGluZSAhPSB1bmRlZmluZWQgP1xuICAgICAgICAgIGVycm9yLmNoYXJhY3RlciAhPSB1bmRlZmluZWQgPyBgOiR7ZXJyb3IubGluZSArIDF9OiR7ZXJyb3IuY2hhcmFjdGVyICsgMX1gIDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYDoke2Vycm9yLmxpbmUgKyAxfWAgOlxuICAgICAgICAgICcnO1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgIGAke3NvdXJjZUZpbGUuZmlsZU5hbWV9JHtsaW5lSW5mb306IE1ldGFkYXRhIGNvbGxlY3RlZCBjb250YWlucyBhbiBlcnJvciB0aGF0IHdpbGwgYmUgcmVwb3J0ZWQgYXQgcnVudGltZTogJHtleHBhbmRlZE1lc3NhZ2UoZXJyb3IpfS5cXG4gICR7SlNPTi5zdHJpbmdpZnkoZXJyb3IpfWApO1xuICAgIH1cbiAgfVxuXG4gIE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzKG1ldGFkYXRhKS5mb3JFYWNoKG5hbWUgPT4ge1xuICAgIGNvbnN0IGVudHJ5ID0gbWV0YWRhdGFbbmFtZV07XG4gICAgdHJ5IHtcbiAgICAgIGlmIChpc0NsYXNzTWV0YWRhdGEoZW50cnkpKSB7XG4gICAgICAgIHZhbGlkYXRlQ2xhc3MoZW50cnkpO1xuICAgICAgfVxuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIGNvbnN0IG5vZGUgPSBub2RlTWFwLmdldChlbnRyeSk7XG4gICAgICBpZiAoc2hvdWxkUmVwb3J0Tm9kZShub2RlKSkge1xuICAgICAgICBpZiAobm9kZSkge1xuICAgICAgICAgIGNvbnN0IHtsaW5lLCBjaGFyYWN0ZXJ9ID0gc291cmNlRmlsZS5nZXRMaW5lQW5kQ2hhcmFjdGVyT2ZQb3NpdGlvbihub2RlLmdldFN0YXJ0KCkpO1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICAgICAgYCR7c291cmNlRmlsZS5maWxlTmFtZX06JHtsaW5lICsgMX06JHtjaGFyYWN0ZXIgKyAxfTogRXJyb3IgZW5jb3VudGVyZWQgaW4gbWV0YWRhdGEgZ2VuZXJhdGVkIGZvciBleHBvcnRlZCBzeW1ib2wgJyR7bmFtZX0nOiBcXG4gJHtlLm1lc3NhZ2V9YCk7XG4gICAgICAgIH1cbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgICAgYEVycm9yIGVuY291bnRlcmVkIGluIG1ldGFkYXRhIGdlbmVyYXRlZCBmb3IgZXhwb3J0ZWQgc3ltYm9sICR7bmFtZX06IFxcbiAke2UubWVzc2FnZX1gKTtcbiAgICAgIH1cbiAgICB9XG4gIH0pO1xufVxuXG4vLyBDb2xsZWN0IHBhcmFtZXRlciBuYW1lcyBmcm9tIGEgZnVuY3Rpb24uXG5mdW5jdGlvbiBuYW1lc09mKHBhcmFtZXRlcnM6IHRzLk5vZGVBcnJheTx0cy5QYXJhbWV0ZXJEZWNsYXJhdGlvbj4pOiBzdHJpbmdbXSB7XG4gIGNvbnN0IHJlc3VsdDogc3RyaW5nW10gPSBbXTtcblxuICBmdW5jdGlvbiBhZGROYW1lc09mKG5hbWU6IHRzLklkZW50aWZpZXIgfCB0cy5CaW5kaW5nUGF0dGVybikge1xuICAgIGlmIChuYW1lLmtpbmQgPT0gdHMuU3ludGF4S2luZC5JZGVudGlmaWVyKSB7XG4gICAgICBjb25zdCBpZGVudGlmaWVyID0gPHRzLklkZW50aWZpZXI+bmFtZTtcbiAgICAgIHJlc3VsdC5wdXNoKGlkZW50aWZpZXIudGV4dCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnN0IGJpbmRpbmdQYXR0ZXJuID0gPHRzLkJpbmRpbmdQYXR0ZXJuPm5hbWU7XG4gICAgICBmb3IgKGNvbnN0IGVsZW1lbnQgb2YgYmluZGluZ1BhdHRlcm4uZWxlbWVudHMpIHtcbiAgICAgICAgY29uc3QgbmFtZSA9IChlbGVtZW50IGFzIGFueSkubmFtZTtcbiAgICAgICAgaWYgKG5hbWUpIHtcbiAgICAgICAgICBhZGROYW1lc09mKG5hbWUpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgZm9yIChjb25zdCBwYXJhbWV0ZXIgb2YgcGFyYW1ldGVycykge1xuICAgIGFkZE5hbWVzT2YocGFyYW1ldGVyLm5hbWUpO1xuICB9XG5cbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxuZnVuY3Rpb24gc2hvdWxkSWdub3JlU3RhdGljTWVtYmVyKG1lbWJlck5hbWU6IHN0cmluZyk6IGJvb2xlYW4ge1xuICByZXR1cm4gbWVtYmVyTmFtZS5zdGFydHNXaXRoKCduZ0FjY2VwdElucHV0VHlwZV8nKSB8fCBtZW1iZXJOYW1lLnN0YXJ0c1dpdGgoJ25nVGVtcGxhdGVHdWFyZF8nKTtcbn1cblxuZnVuY3Rpb24gZXhwYW5kZWRNZXNzYWdlKGVycm9yOiBhbnkpOiBzdHJpbmcge1xuICBzd2l0Y2ggKGVycm9yLm1lc3NhZ2UpIHtcbiAgICBjYXNlICdSZWZlcmVuY2UgdG8gbm9uLWV4cG9ydGVkIGNsYXNzJzpcbiAgICAgIGlmIChlcnJvci5jb250ZXh0ICYmIGVycm9yLmNvbnRleHQuY2xhc3NOYW1lKSB7XG4gICAgICAgIHJldHVybiBgUmVmZXJlbmNlIHRvIGEgbm9uLWV4cG9ydGVkIGNsYXNzICR7ZXJyb3IuY29udGV4dC5jbGFzc05hbWV9LiBDb25zaWRlciBleHBvcnRpbmcgdGhlIGNsYXNzYDtcbiAgICAgIH1cbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ1ZhcmlhYmxlIG5vdCBpbml0aWFsaXplZCc6XG4gICAgICByZXR1cm4gJ09ubHkgaW5pdGlhbGl6ZWQgdmFyaWFibGVzIGFuZCBjb25zdGFudHMgY2FuIGJlIHJlZmVyZW5jZWQgYmVjYXVzZSB0aGUgdmFsdWUgb2YgdGhpcyB2YXJpYWJsZSBpcyBuZWVkZWQgYnkgdGhlIHRlbXBsYXRlIGNvbXBpbGVyJztcbiAgICBjYXNlICdEZXN0cnVjdHVyaW5nIG5vdCBzdXBwb3J0ZWQnOlxuICAgICAgcmV0dXJuICdSZWZlcmVuY2luZyBhbiBleHBvcnRlZCBkZXN0cnVjdHVyZWQgdmFyaWFibGUgb3IgY29uc3RhbnQgaXMgbm90IHN1cHBvcnRlZCBieSB0aGUgdGVtcGxhdGUgY29tcGlsZXIuIENvbnNpZGVyIHNpbXBsaWZ5aW5nIHRoaXMgdG8gYXZvaWQgZGVzdHJ1Y3R1cmluZyc7XG4gICAgY2FzZSAnQ291bGQgbm90IHJlc29sdmUgdHlwZSc6XG4gICAgICBpZiAoZXJyb3IuY29udGV4dCAmJiBlcnJvci5jb250ZXh0LnR5cGVOYW1lKSB7XG4gICAgICAgIHJldHVybiBgQ291bGQgbm90IHJlc29sdmUgdHlwZSAke2Vycm9yLmNvbnRleHQudHlwZU5hbWV9YDtcbiAgICAgIH1cbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ0Z1bmN0aW9uIGNhbGwgbm90IHN1cHBvcnRlZCc6XG4gICAgICBsZXQgcHJlZml4ID1cbiAgICAgICAgICBlcnJvci5jb250ZXh0ICYmIGVycm9yLmNvbnRleHQubmFtZSA/IGBDYWxsaW5nIGZ1bmN0aW9uICcke2Vycm9yLmNvbnRleHQubmFtZX0nLCBmYCA6ICdGJztcbiAgICAgIHJldHVybiBwcmVmaXggK1xuICAgICAgICAgICd1bmN0aW9uIGNhbGxzIGFyZSBub3Qgc3VwcG9ydGVkLiBDb25zaWRlciByZXBsYWNpbmcgdGhlIGZ1bmN0aW9uIG9yIGxhbWJkYSB3aXRoIGEgcmVmZXJlbmNlIHRvIGFuIGV4cG9ydGVkIGZ1bmN0aW9uJztcbiAgICBjYXNlICdSZWZlcmVuY2UgdG8gYSBsb2NhbCBzeW1ib2wnOlxuICAgICAgaWYgKGVycm9yLmNvbnRleHQgJiYgZXJyb3IuY29udGV4dC5uYW1lKSB7XG4gICAgICAgIHJldHVybiBgUmVmZXJlbmNlIHRvIGEgbG9jYWwgKG5vbi1leHBvcnRlZCkgc3ltYm9sICcke2Vycm9yLmNvbnRleHQubmFtZX0nLiBDb25zaWRlciBleHBvcnRpbmcgdGhlIHN5bWJvbGA7XG4gICAgICB9XG4gIH1cbiAgcmV0dXJuIGVycm9yLm1lc3NhZ2U7XG59XG4iXX0=