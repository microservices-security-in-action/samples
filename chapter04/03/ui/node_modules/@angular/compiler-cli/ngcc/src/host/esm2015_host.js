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
        define("@angular/compiler-cli/ngcc/src/host/esm2015_host", ["require", "exports", "tslib", "typescript", "@angular/compiler-cli/src/ngtsc/reflection", "@angular/compiler-cli/ngcc/src/analysis/util", "@angular/compiler-cli/ngcc/src/utils", "@angular/compiler-cli/ngcc/src/host/ngcc_host"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var tslib_1 = require("tslib");
    var ts = require("typescript");
    var reflection_1 = require("@angular/compiler-cli/src/ngtsc/reflection");
    var util_1 = require("@angular/compiler-cli/ngcc/src/analysis/util");
    var utils_1 = require("@angular/compiler-cli/ngcc/src/utils");
    var ngcc_host_1 = require("@angular/compiler-cli/ngcc/src/host/ngcc_host");
    exports.DECORATORS = 'decorators';
    exports.PROP_DECORATORS = 'propDecorators';
    exports.CONSTRUCTOR = '__constructor';
    exports.CONSTRUCTOR_PARAMS = 'ctorParameters';
    /**
     * Esm2015 packages contain ECMAScript 2015 classes, etc.
     * Decorators are defined via static properties on the class. For example:
     *
     * ```
     * class SomeDirective {
     * }
     * SomeDirective.decorators = [
     *   { type: Directive, args: [{ selector: '[someDirective]' },] }
     * ];
     * SomeDirective.ctorParameters = () => [
     *   { type: ViewContainerRef, },
     *   { type: TemplateRef, },
     *   { type: undefined, decorators: [{ type: Inject, args: [INJECTED_TOKEN,] },] },
     * ];
     * SomeDirective.propDecorators = {
     *   "input1": [{ type: Input },],
     *   "input2": [{ type: Input },],
     * };
     * ```
     *
     * * Classes are decorated if they have a static property called `decorators`.
     * * Members are decorated if there is a matching key on a static property
     *   called `propDecorators`.
     * * Constructor parameters decorators are found on an object returned from
     *   a static method called `ctorParameters`.
     */
    var Esm2015ReflectionHost = /** @class */ (function (_super) {
        tslib_1.__extends(Esm2015ReflectionHost, _super);
        function Esm2015ReflectionHost(logger, isCore, src, dts) {
            if (dts === void 0) { dts = null; }
            var _this = _super.call(this, src.program.getTypeChecker()) || this;
            _this.logger = logger;
            _this.isCore = isCore;
            _this.src = src;
            _this.dts = dts;
            /**
             * A mapping from source declarations to typings declarations, which are both publicly exported.
             *
             * There should be one entry for every public export visible from the root file of the source
             * tree. Note that by definition the key and value declarations will not be in the same TS
             * program.
             */
            _this.publicDtsDeclarationMap = null;
            /**
             * A mapping from source declarations to typings declarations, which are not publicly exported.
             *
             * This mapping is a best guess between declarations that happen to be exported from their file by
             * the same name in both the source and the dts file. Note that by definition the key and value
             * declarations will not be in the same TS program.
             */
            _this.privateDtsDeclarationMap = null;
            /**
             * The set of source files that have already been preprocessed.
             */
            _this.preprocessedSourceFiles = new Set();
            /**
             * In ES2015, class declarations may have been down-leveled into variable declarations,
             * initialized using a class expression. In certain scenarios, an additional variable
             * is introduced that represents the class so that results in code such as:
             *
             * ```
             * let MyClass_1; let MyClass = MyClass_1 = class MyClass {};
             * ```
             *
             * This map tracks those aliased variables to their original identifier, i.e. the key
             * corresponds with the declaration of `MyClass_1` and its value becomes the `MyClass` identifier
             * of the variable declaration.
             *
             * This map is populated during the preprocessing of each source file.
             */
            _this.aliasedClassDeclarations = new Map();
            /**
             * Caches the information of the decorators on a class, as the work involved with extracting
             * decorators is complex and frequently used.
             *
             * This map is lazily populated during the first call to `acquireDecoratorInfo` for a given class.
             */
            _this.decoratorCache = new Map();
            return _this;
        }
        /**
         * Find a symbol for a node that we think is a class.
         * Classes should have a `name` identifier, because they may need to be referenced in other parts
         * of the program.
         *
         * In ES2015, a class may be declared using a variable declaration of the following structure:
         *
         * ```
         * var MyClass = MyClass_1 = class MyClass {};
         * ```
         *
         * Here, the intermediate `MyClass_1` assignment is optional. In the above example, the
         * `class MyClass {}` node is returned as declaration of `MyClass`.
         *
         * @param declaration the declaration node whose symbol we are finding.
         * @returns the symbol for the node or `undefined` if it is not a "class" or has no symbol.
         */
        Esm2015ReflectionHost.prototype.getClassSymbol = function (declaration) {
            var symbol = this.getClassSymbolFromOuterDeclaration(declaration);
            if (symbol !== undefined) {
                return symbol;
            }
            return this.getClassSymbolFromInnerDeclaration(declaration);
        };
        /**
         * In ES2015, a class may be declared using a variable declaration of the following structure:
         *
         * ```
         * var MyClass = MyClass_1 = class MyClass {};
         * ```
         *
         * This method extracts the `NgccClassSymbol` for `MyClass` when provided with the `var MyClass`
         * declaration node. When the `class MyClass {}` node or any other node is given, this method will
         * return undefined instead.
         *
         * @param declaration the declaration whose symbol we are finding.
         * @returns the symbol for the node or `undefined` if it does not represent an outer declaration
         * of a class.
         */
        Esm2015ReflectionHost.prototype.getClassSymbolFromOuterDeclaration = function (declaration) {
            // Create a symbol without inner declaration if the declaration is a regular class declaration.
            if (ts.isClassDeclaration(declaration) && utils_1.hasNameIdentifier(declaration)) {
                return this.createClassSymbol(declaration, null);
            }
            // Otherwise, the declaration may be a variable declaration, in which case it must be
            // initialized using a class expression as inner declaration.
            if (ts.isVariableDeclaration(declaration) && utils_1.hasNameIdentifier(declaration)) {
                var innerDeclaration = getInnerClassDeclaration(declaration);
                if (innerDeclaration !== null) {
                    return this.createClassSymbol(declaration, innerDeclaration);
                }
            }
            return undefined;
        };
        /**
         * In ES2015, a class may be declared using a variable declaration of the following structure:
         *
         * ```
         * var MyClass = MyClass_1 = class MyClass {};
         * ```
         *
         * This method extracts the `NgccClassSymbol` for `MyClass` when provided with the
         * `class MyClass {}` declaration node. When the `var MyClass` node or any other node is given,
         * this method will return undefined instead.
         *
         * @param declaration the declaration whose symbol we are finding.
         * @returns the symbol for the node or `undefined` if it does not represent an inner declaration
         * of a class.
         */
        Esm2015ReflectionHost.prototype.getClassSymbolFromInnerDeclaration = function (declaration) {
            if (!ts.isClassExpression(declaration) || !utils_1.hasNameIdentifier(declaration)) {
                return undefined;
            }
            var outerDeclaration = getVariableDeclarationOfDeclaration(declaration);
            if (outerDeclaration === undefined || !utils_1.hasNameIdentifier(outerDeclaration)) {
                return undefined;
            }
            return this.createClassSymbol(outerDeclaration, declaration);
        };
        /**
         * Creates an `NgccClassSymbol` from an outer and inner declaration. If a class only has an outer
         * declaration, the "implementation" symbol of the created `NgccClassSymbol` will be set equal to
         * the "declaration" symbol.
         *
         * @param outerDeclaration The outer declaration node of the class.
         * @param innerDeclaration The inner declaration node of the class, or undefined if no inner
         * declaration is present.
         * @returns the `NgccClassSymbol` representing the class, or undefined if a `ts.Symbol` for any of
         * the declarations could not be resolved.
         */
        Esm2015ReflectionHost.prototype.createClassSymbol = function (outerDeclaration, innerDeclaration) {
            var declarationSymbol = this.checker.getSymbolAtLocation(outerDeclaration.name);
            if (declarationSymbol === undefined) {
                return undefined;
            }
            var implementationSymbol = innerDeclaration !== null ?
                this.checker.getSymbolAtLocation(innerDeclaration.name) :
                declarationSymbol;
            if (implementationSymbol === undefined) {
                return undefined;
            }
            return {
                name: declarationSymbol.name,
                declaration: declarationSymbol,
                implementation: implementationSymbol,
            };
        };
        /**
         * Examine a declaration (for example, of a class or function) and return metadata about any
         * decorators present on the declaration.
         *
         * @param declaration a TypeScript `ts.Declaration` node representing the class or function over
         * which to reflect. For example, if the intent is to reflect the decorators of a class and the
         * source is in ES6 format, this will be a `ts.ClassDeclaration` node. If the source is in ES5
         * format, this might be a `ts.VariableDeclaration` as classes in ES5 are represented as the
         * result of an IIFE execution.
         *
         * @returns an array of `Decorator` metadata if decorators are present on the declaration, or
         * `null` if either no decorators were present or if the declaration is not of a decoratable type.
         */
        Esm2015ReflectionHost.prototype.getDecoratorsOfDeclaration = function (declaration) {
            var symbol = this.getClassSymbol(declaration);
            if (!symbol) {
                return null;
            }
            return this.getDecoratorsOfSymbol(symbol);
        };
        /**
         * Examine a declaration which should be of a class, and return metadata about the members of the
         * class.
         *
         * @param clazz a `ClassDeclaration` representing the class over which to reflect.
         *
         * @returns an array of `ClassMember` metadata representing the members of the class.
         *
         * @throws if `declaration` does not resolve to a class declaration.
         */
        Esm2015ReflectionHost.prototype.getMembersOfClass = function (clazz) {
            var classSymbol = this.getClassSymbol(clazz);
            if (!classSymbol) {
                throw new Error("Attempted to get members of a non-class: \"" + clazz.getText() + "\"");
            }
            return this.getMembersOfSymbol(classSymbol);
        };
        /**
         * Reflect over the constructor of a class and return metadata about its parameters.
         *
         * This method only looks at the constructor of a class directly and not at any inherited
         * constructors.
         *
         * @param clazz a `ClassDeclaration` representing the class over which to reflect.
         *
         * @returns an array of `Parameter` metadata representing the parameters of the constructor, if
         * a constructor exists. If the constructor exists and has 0 parameters, this array will be empty.
         * If the class has no constructor, this method returns `null`.
         *
         * @throws if `declaration` does not resolve to a class declaration.
         */
        Esm2015ReflectionHost.prototype.getConstructorParameters = function (clazz) {
            var classSymbol = this.getClassSymbol(clazz);
            if (!classSymbol) {
                throw new Error("Attempted to get constructor parameters of a non-class: \"" + clazz.getText() + "\"");
            }
            var parameterNodes = this.getConstructorParameterDeclarations(classSymbol);
            if (parameterNodes) {
                return this.getConstructorParamInfo(classSymbol, parameterNodes);
            }
            return null;
        };
        Esm2015ReflectionHost.prototype.hasBaseClass = function (clazz) {
            var superHasBaseClass = _super.prototype.hasBaseClass.call(this, clazz);
            if (superHasBaseClass) {
                return superHasBaseClass;
            }
            var innerClassDeclaration = getInnerClassDeclaration(clazz);
            if (innerClassDeclaration === null) {
                return false;
            }
            return _super.prototype.hasBaseClass.call(this, innerClassDeclaration);
        };
        Esm2015ReflectionHost.prototype.getBaseClassExpression = function (clazz) {
            // First try getting the base class from the "outer" declaration
            var superBaseClassIdentifier = _super.prototype.getBaseClassExpression.call(this, clazz);
            if (superBaseClassIdentifier) {
                return superBaseClassIdentifier;
            }
            // That didn't work so now try getting it from the "inner" declaration.
            var innerClassDeclaration = getInnerClassDeclaration(clazz);
            if (innerClassDeclaration === null) {
                return null;
            }
            return _super.prototype.getBaseClassExpression.call(this, innerClassDeclaration);
        };
        /**
         * Check whether the given node actually represents a class.
         */
        Esm2015ReflectionHost.prototype.isClass = function (node) {
            return _super.prototype.isClass.call(this, node) || this.getClassSymbol(node) !== undefined;
        };
        /**
         * Trace an identifier to its declaration, if possible.
         *
         * This method attempts to resolve the declaration of the given identifier, tracing back through
         * imports and re-exports until the original declaration statement is found. A `Declaration`
         * object is returned if the original declaration is found, or `null` is returned otherwise.
         *
         * In ES2015, we need to account for identifiers that refer to aliased class declarations such as
         * `MyClass_1`. Since such declarations are only available within the module itself, we need to
         * find the original class declaration, e.g. `MyClass`, that is associated with the aliased one.
         *
         * @param id a TypeScript `ts.Identifier` to trace back to a declaration.
         *
         * @returns metadata about the `Declaration` if the original declaration is found, or `null`
         * otherwise.
         */
        Esm2015ReflectionHost.prototype.getDeclarationOfIdentifier = function (id) {
            var superDeclaration = _super.prototype.getDeclarationOfIdentifier.call(this, id);
            // The identifier may have been of an additional class assignment such as `MyClass_1` that was
            // present as alias for `MyClass`. If so, resolve such aliases to their original declaration.
            if (superDeclaration !== null && superDeclaration.node !== null) {
                var aliasedIdentifier = this.resolveAliasedClassIdentifier(superDeclaration.node);
                if (aliasedIdentifier !== null) {
                    return this.getDeclarationOfIdentifier(aliasedIdentifier);
                }
            }
            // If the identifier resolves to the global JavaScript `Object`, return a
            // declaration that denotes it as the known `JsGlobalObject` declaration.
            if (superDeclaration !== null && this.isJavaScriptObjectDeclaration(superDeclaration)) {
                return {
                    known: reflection_1.KnownDeclaration.JsGlobalObject,
                    expression: id,
                    viaModule: null,
                    node: null,
                };
            }
            return superDeclaration;
        };
        /**
         * Gets all decorators of the given class symbol. Any decorator that have been synthetically
         * injected by a migration will not be present in the returned collection.
         */
        Esm2015ReflectionHost.prototype.getDecoratorsOfSymbol = function (symbol) {
            var classDecorators = this.acquireDecoratorInfo(symbol).classDecorators;
            if (classDecorators === null) {
                return null;
            }
            // Return a clone of the array to prevent consumers from mutating the cache.
            return Array.from(classDecorators);
        };
        /**
         * Search the given module for variable declarations in which the initializer
         * is an identifier marked with the `PRE_R3_MARKER`.
         * @param module the module in which to search for switchable declarations.
         * @returns an array of variable declarations that match.
         */
        Esm2015ReflectionHost.prototype.getSwitchableDeclarations = function (module) {
            // Don't bother to walk the AST if the marker is not found in the text
            return module.getText().indexOf(ngcc_host_1.PRE_R3_MARKER) >= 0 ?
                utils_1.findAll(module, ngcc_host_1.isSwitchableVariableDeclaration) :
                [];
        };
        Esm2015ReflectionHost.prototype.getVariableValue = function (declaration) {
            var value = _super.prototype.getVariableValue.call(this, declaration);
            if (value) {
                return value;
            }
            // We have a variable declaration that has no initializer. For example:
            //
            // ```
            // var HttpClientXsrfModule_1;
            // ```
            //
            // So look for the special scenario where the variable is being assigned in
            // a nearby statement to the return value of a call to `__decorate`.
            // Then find the 2nd argument of that call, the "target", which will be the
            // actual class identifier. For example:
            //
            // ```
            // HttpClientXsrfModule = HttpClientXsrfModule_1 = tslib_1.__decorate([
            //   NgModule({
            //     providers: [],
            //   })
            // ], HttpClientXsrfModule);
            // ```
            //
            // And finally, find the declaration of the identifier in that argument.
            // Note also that the assignment can occur within another assignment.
            //
            var block = declaration.parent.parent.parent;
            var symbol = this.checker.getSymbolAtLocation(declaration.name);
            if (symbol && (ts.isBlock(block) || ts.isSourceFile(block))) {
                var decorateCall = this.findDecoratedVariableValue(block, symbol);
                var target = decorateCall && decorateCall.arguments[1];
                if (target && ts.isIdentifier(target)) {
                    var targetSymbol = this.checker.getSymbolAtLocation(target);
                    var targetDeclaration = targetSymbol && targetSymbol.valueDeclaration;
                    if (targetDeclaration) {
                        if (ts.isClassDeclaration(targetDeclaration) ||
                            ts.isFunctionDeclaration(targetDeclaration)) {
                            // The target is just a function or class declaration
                            // so return its identifier as the variable value.
                            return targetDeclaration.name || null;
                        }
                        else if (ts.isVariableDeclaration(targetDeclaration)) {
                            // The target is a variable declaration, so find the far right expression,
                            // in the case of multiple assignments (e.g. `var1 = var2 = value`).
                            var targetValue = targetDeclaration.initializer;
                            while (targetValue && isAssignment(targetValue)) {
                                targetValue = targetValue.right;
                            }
                            if (targetValue) {
                                return targetValue;
                            }
                        }
                    }
                }
            }
            return null;
        };
        /**
         * Find all top-level class symbols in the given file.
         * @param sourceFile The source file to search for classes.
         * @returns An array of class symbols.
         */
        Esm2015ReflectionHost.prototype.findClassSymbols = function (sourceFile) {
            var _this = this;
            var classes = [];
            this.getModuleStatements(sourceFile).forEach(function (statement) {
                if (ts.isVariableStatement(statement)) {
                    statement.declarationList.declarations.forEach(function (declaration) {
                        var classSymbol = _this.getClassSymbol(declaration);
                        if (classSymbol) {
                            classes.push(classSymbol);
                        }
                    });
                }
                else if (ts.isClassDeclaration(statement)) {
                    var classSymbol = _this.getClassSymbol(statement);
                    if (classSymbol) {
                        classes.push(classSymbol);
                    }
                }
            });
            return classes;
        };
        /**
         * Get the number of generic type parameters of a given class.
         *
         * @param clazz a `ClassDeclaration` representing the class over which to reflect.
         *
         * @returns the number of type parameters of the class, if known, or `null` if the declaration
         * is not a class or has an unknown number of type parameters.
         */
        Esm2015ReflectionHost.prototype.getGenericArityOfClass = function (clazz) {
            var dtsDeclaration = this.getDtsDeclaration(clazz);
            if (dtsDeclaration && ts.isClassDeclaration(dtsDeclaration)) {
                return dtsDeclaration.typeParameters ? dtsDeclaration.typeParameters.length : 0;
            }
            return null;
        };
        /**
         * Take an exported declaration of a class (maybe down-leveled to a variable) and look up the
         * declaration of its type in a separate .d.ts tree.
         *
         * This function is allowed to return `null` if the current compilation unit does not have a
         * separate .d.ts tree. When compiling TypeScript code this is always the case, since .d.ts files
         * are produced only during the emit of such a compilation. When compiling .js code, however,
         * there is frequently a parallel .d.ts tree which this method exposes.
         *
         * Note that the `ts.ClassDeclaration` returned from this function may not be from the same
         * `ts.Program` as the input declaration.
         */
        Esm2015ReflectionHost.prototype.getDtsDeclaration = function (declaration) {
            if (this.dts === null) {
                return null;
            }
            if (!isNamedDeclaration(declaration)) {
                throw new Error("Cannot get the dts file for a declaration that has no name: " + declaration.getText() + " in " + declaration.getSourceFile().fileName);
            }
            // Try to retrieve the dts declaration from the public map
            if (this.publicDtsDeclarationMap === null) {
                this.publicDtsDeclarationMap = this.computePublicDtsDeclarationMap(this.src, this.dts);
            }
            if (this.publicDtsDeclarationMap.has(declaration)) {
                return this.publicDtsDeclarationMap.get(declaration);
            }
            // No public export, try the private map
            if (this.privateDtsDeclarationMap === null) {
                this.privateDtsDeclarationMap = this.computePrivateDtsDeclarationMap(this.src, this.dts);
            }
            if (this.privateDtsDeclarationMap.has(declaration)) {
                return this.privateDtsDeclarationMap.get(declaration);
            }
            // No declaration found at all
            return null;
        };
        /**
         * Search the given source file for exported functions and static class methods that return
         * ModuleWithProviders objects.
         * @param f The source file to search for these functions
         * @returns An array of function declarations that look like they return ModuleWithProviders
         * objects.
         */
        Esm2015ReflectionHost.prototype.getModuleWithProvidersFunctions = function (f) {
            var _this = this;
            var exports = this.getExportsOfModule(f);
            if (!exports)
                return [];
            var infos = [];
            exports.forEach(function (declaration, name) {
                if (declaration.node === null) {
                    return;
                }
                if (_this.isClass(declaration.node)) {
                    _this.getMembersOfClass(declaration.node).forEach(function (member) {
                        if (member.isStatic) {
                            var info = _this.parseForModuleWithProviders(member.name, member.node, member.implementation, declaration.node);
                            if (info) {
                                infos.push(info);
                            }
                        }
                    });
                }
                else {
                    if (isNamedDeclaration(declaration.node)) {
                        var info = _this.parseForModuleWithProviders(declaration.node.name.text, declaration.node);
                        if (info) {
                            infos.push(info);
                        }
                    }
                }
            });
            return infos;
        };
        Esm2015ReflectionHost.prototype.getEndOfClass = function (classSymbol) {
            var last = classSymbol.declaration.valueDeclaration;
            // If there are static members on this class then find the last one
            if (classSymbol.declaration.exports !== undefined) {
                classSymbol.declaration.exports.forEach(function (exportSymbol) {
                    if (exportSymbol.valueDeclaration === undefined) {
                        return;
                    }
                    var exportStatement = getContainingStatement(exportSymbol.valueDeclaration);
                    if (exportStatement !== null && last.getEnd() < exportStatement.getEnd()) {
                        last = exportStatement;
                    }
                });
            }
            // If there are helper calls for this class then find the last one
            var helpers = this.getHelperCallsForClass(classSymbol, ['__decorate', '__extends', '__param', '__metadata']);
            helpers.forEach(function (helper) {
                var helperStatement = getContainingStatement(helper);
                if (helperStatement !== null && last.getEnd() < helperStatement.getEnd()) {
                    last = helperStatement;
                }
            });
            return last;
        };
        ///////////// Protected Helpers /////////////
        /**
         * Finds the identifier of the actual class declaration for a potentially aliased declaration of a
         * class.
         *
         * If the given declaration is for an alias of a class, this function will determine an identifier
         * to the original declaration that represents this class.
         *
         * @param declaration The declaration to resolve.
         * @returns The original identifier that the given class declaration resolves to, or `undefined`
         * if the declaration does not represent an aliased class.
         */
        Esm2015ReflectionHost.prototype.resolveAliasedClassIdentifier = function (declaration) {
            this.ensurePreprocessed(declaration.getSourceFile());
            return this.aliasedClassDeclarations.has(declaration) ?
                this.aliasedClassDeclarations.get(declaration) :
                null;
        };
        /**
         * Ensures that the source file that `node` is part of has been preprocessed.
         *
         * During preprocessing, all statements in the source file will be visited such that certain
         * processing steps can be done up-front and cached for subsequent usages.
         *
         * @param sourceFile The source file that needs to have gone through preprocessing.
         */
        Esm2015ReflectionHost.prototype.ensurePreprocessed = function (sourceFile) {
            var e_1, _a;
            if (!this.preprocessedSourceFiles.has(sourceFile)) {
                this.preprocessedSourceFiles.add(sourceFile);
                try {
                    for (var _b = tslib_1.__values(this.getModuleStatements(sourceFile)), _c = _b.next(); !_c.done; _c = _b.next()) {
                        var statement = _c.value;
                        this.preprocessStatement(statement);
                    }
                }
                catch (e_1_1) { e_1 = { error: e_1_1 }; }
                finally {
                    try {
                        if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                    }
                    finally { if (e_1) throw e_1.error; }
                }
            }
        };
        /**
         * Analyzes the given statement to see if it corresponds with a variable declaration like
         * `let MyClass = MyClass_1 = class MyClass {};`. If so, the declaration of `MyClass_1`
         * is associated with the `MyClass` identifier.
         *
         * @param statement The statement that needs to be preprocessed.
         */
        Esm2015ReflectionHost.prototype.preprocessStatement = function (statement) {
            if (!ts.isVariableStatement(statement)) {
                return;
            }
            var declarations = statement.declarationList.declarations;
            if (declarations.length !== 1) {
                return;
            }
            var declaration = declarations[0];
            var initializer = declaration.initializer;
            if (!ts.isIdentifier(declaration.name) || !initializer || !isAssignment(initializer) ||
                !ts.isIdentifier(initializer.left) || !this.isClass(declaration)) {
                return;
            }
            var aliasedIdentifier = initializer.left;
            var aliasedDeclaration = this.getDeclarationOfIdentifier(aliasedIdentifier);
            if (aliasedDeclaration === null || aliasedDeclaration.node === null) {
                throw new Error("Unable to locate declaration of " + aliasedIdentifier.text + " in \"" + statement.getText() + "\"");
            }
            this.aliasedClassDeclarations.set(aliasedDeclaration.node, declaration.name);
        };
        /** Get the top level statements for a module.
         *
         * In ES5 and ES2015 this is just the top level statements of the file.
         * @param sourceFile The module whose statements we want.
         * @returns An array of top level statements for the given module.
         */
        Esm2015ReflectionHost.prototype.getModuleStatements = function (sourceFile) {
            return Array.from(sourceFile.statements);
        };
        /**
         * Walk the AST looking for an assignment to the specified symbol.
         * @param node The current node we are searching.
         * @returns an expression that represents the value of the variable, or undefined if none can be
         * found.
         */
        Esm2015ReflectionHost.prototype.findDecoratedVariableValue = function (node, symbol) {
            var _this = this;
            if (!node) {
                return null;
            }
            if (ts.isBinaryExpression(node) && node.operatorToken.kind === ts.SyntaxKind.EqualsToken) {
                var left = node.left;
                var right = node.right;
                if (ts.isIdentifier(left) && this.checker.getSymbolAtLocation(left) === symbol) {
                    return (ts.isCallExpression(right) && getCalleeName(right) === '__decorate') ? right : null;
                }
                return this.findDecoratedVariableValue(right, symbol);
            }
            return node.forEachChild(function (node) { return _this.findDecoratedVariableValue(node, symbol); }) || null;
        };
        /**
         * Try to retrieve the symbol of a static property on a class.
         * @param symbol the class whose property we are interested in.
         * @param propertyName the name of static property.
         * @returns the symbol if it is found or `undefined` if not.
         */
        Esm2015ReflectionHost.prototype.getStaticProperty = function (symbol, propertyName) {
            return symbol.declaration.exports && symbol.declaration.exports.get(propertyName);
        };
        /**
         * This is the main entry-point for obtaining information on the decorators of a given class. This
         * information is computed either from static properties if present, or using `tslib.__decorate`
         * helper calls otherwise. The computed result is cached per class.
         *
         * @param classSymbol the class for which decorators should be acquired.
         * @returns all information of the decorators on the class.
         */
        Esm2015ReflectionHost.prototype.acquireDecoratorInfo = function (classSymbol) {
            var decl = classSymbol.declaration.valueDeclaration;
            if (this.decoratorCache.has(decl)) {
                return this.decoratorCache.get(decl);
            }
            // Extract decorators from static properties and `__decorate` helper calls, then merge them
            // together where the information from the static properties is preferred.
            var staticProps = this.computeDecoratorInfoFromStaticProperties(classSymbol);
            var helperCalls = this.computeDecoratorInfoFromHelperCalls(classSymbol);
            var decoratorInfo = {
                classDecorators: staticProps.classDecorators || helperCalls.classDecorators,
                memberDecorators: staticProps.memberDecorators || helperCalls.memberDecorators,
                constructorParamInfo: staticProps.constructorParamInfo || helperCalls.constructorParamInfo,
            };
            this.decoratorCache.set(decl, decoratorInfo);
            return decoratorInfo;
        };
        /**
         * Attempts to compute decorator information from static properties "decorators", "propDecorators"
         * and "ctorParameters" on the class. If neither of these static properties is present the
         * library is likely not compiled using tsickle for usage with Closure compiler, in which case
         * `null` is returned.
         *
         * @param classSymbol The class symbol to compute the decorators information for.
         * @returns All information on the decorators as extracted from static properties, or `null` if
         * none of the static properties exist.
         */
        Esm2015ReflectionHost.prototype.computeDecoratorInfoFromStaticProperties = function (classSymbol) {
            var classDecorators = null;
            var memberDecorators = null;
            var constructorParamInfo = null;
            var decoratorsProperty = this.getStaticProperty(classSymbol, exports.DECORATORS);
            if (decoratorsProperty !== undefined) {
                classDecorators = this.getClassDecoratorsFromStaticProperty(decoratorsProperty);
            }
            var propDecoratorsProperty = this.getStaticProperty(classSymbol, exports.PROP_DECORATORS);
            if (propDecoratorsProperty !== undefined) {
                memberDecorators = this.getMemberDecoratorsFromStaticProperty(propDecoratorsProperty);
            }
            var constructorParamsProperty = this.getStaticProperty(classSymbol, exports.CONSTRUCTOR_PARAMS);
            if (constructorParamsProperty !== undefined) {
                constructorParamInfo = this.getParamInfoFromStaticProperty(constructorParamsProperty);
            }
            return { classDecorators: classDecorators, memberDecorators: memberDecorators, constructorParamInfo: constructorParamInfo };
        };
        /**
         * Get all class decorators for the given class, where the decorators are declared
         * via a static property. For example:
         *
         * ```
         * class SomeDirective {}
         * SomeDirective.decorators = [
         *   { type: Directive, args: [{ selector: '[someDirective]' },] }
         * ];
         * ```
         *
         * @param decoratorsSymbol the property containing the decorators we want to get.
         * @returns an array of decorators or null if none where found.
         */
        Esm2015ReflectionHost.prototype.getClassDecoratorsFromStaticProperty = function (decoratorsSymbol) {
            var _this = this;
            var decoratorsIdentifier = decoratorsSymbol.valueDeclaration;
            if (decoratorsIdentifier && decoratorsIdentifier.parent) {
                if (ts.isBinaryExpression(decoratorsIdentifier.parent) &&
                    decoratorsIdentifier.parent.operatorToken.kind === ts.SyntaxKind.EqualsToken) {
                    // AST of the array of decorator values
                    var decoratorsArray = decoratorsIdentifier.parent.right;
                    return this.reflectDecorators(decoratorsArray)
                        .filter(function (decorator) { return _this.isFromCore(decorator); });
                }
            }
            return null;
        };
        /**
         * Examine a symbol which should be of a class, and return metadata about its members.
         *
         * @param symbol the `ClassSymbol` representing the class over which to reflect.
         * @returns an array of `ClassMember` metadata representing the members of the class.
         */
        Esm2015ReflectionHost.prototype.getMembersOfSymbol = function (symbol) {
            var _this = this;
            var members = [];
            // The decorators map contains all the properties that are decorated
            var memberDecorators = this.acquireDecoratorInfo(symbol).memberDecorators;
            // Make a copy of the decorators as successfully reflected members delete themselves from the
            // map, so that any leftovers can be easily dealt with.
            var decoratorsMap = new Map(memberDecorators);
            // The member map contains all the method (instance and static); and any instance properties
            // that are initialized in the class.
            if (symbol.implementation.members) {
                symbol.implementation.members.forEach(function (value, key) {
                    var decorators = decoratorsMap.get(key);
                    var reflectedMembers = _this.reflectMembers(value, decorators);
                    if (reflectedMembers) {
                        decoratorsMap.delete(key);
                        members.push.apply(members, tslib_1.__spread(reflectedMembers));
                    }
                });
            }
            // The static property map contains all the static properties
            if (symbol.implementation.exports) {
                symbol.implementation.exports.forEach(function (value, key) {
                    var decorators = decoratorsMap.get(key);
                    var reflectedMembers = _this.reflectMembers(value, decorators, true);
                    if (reflectedMembers) {
                        decoratorsMap.delete(key);
                        members.push.apply(members, tslib_1.__spread(reflectedMembers));
                    }
                });
            }
            // If this class was declared as a VariableDeclaration then it may have static properties
            // attached to the variable rather than the class itself
            // For example:
            // ```
            // let MyClass = class MyClass {
            //   // no static properties here!
            // }
            // MyClass.staticProperty = ...;
            // ```
            if (ts.isVariableDeclaration(symbol.declaration.valueDeclaration)) {
                if (symbol.declaration.exports) {
                    symbol.declaration.exports.forEach(function (value, key) {
                        var decorators = decoratorsMap.get(key);
                        var reflectedMembers = _this.reflectMembers(value, decorators, true);
                        if (reflectedMembers) {
                            decoratorsMap.delete(key);
                            members.push.apply(members, tslib_1.__spread(reflectedMembers));
                        }
                    });
                }
            }
            // Deal with any decorated properties that were not initialized in the class
            decoratorsMap.forEach(function (value, key) {
                members.push({
                    implementation: null,
                    decorators: value,
                    isStatic: false,
                    kind: reflection_1.ClassMemberKind.Property,
                    name: key,
                    nameNode: null,
                    node: null,
                    type: null,
                    value: null
                });
            });
            return members;
        };
        /**
         * Member decorators may be declared as static properties of the class:
         *
         * ```
         * SomeDirective.propDecorators = {
         *   "ngForOf": [{ type: Input },],
         *   "ngForTrackBy": [{ type: Input },],
         *   "ngForTemplate": [{ type: Input },],
         * };
         * ```
         *
         * @param decoratorsProperty the class whose member decorators we are interested in.
         * @returns a map whose keys are the name of the members and whose values are collections of
         * decorators for the given member.
         */
        Esm2015ReflectionHost.prototype.getMemberDecoratorsFromStaticProperty = function (decoratorsProperty) {
            var _this = this;
            var memberDecorators = new Map();
            // Symbol of the identifier for `SomeDirective.propDecorators`.
            var propDecoratorsMap = getPropertyValueFromSymbol(decoratorsProperty);
            if (propDecoratorsMap && ts.isObjectLiteralExpression(propDecoratorsMap)) {
                var propertiesMap = reflection_1.reflectObjectLiteral(propDecoratorsMap);
                propertiesMap.forEach(function (value, name) {
                    var decorators = _this.reflectDecorators(value).filter(function (decorator) { return _this.isFromCore(decorator); });
                    if (decorators.length) {
                        memberDecorators.set(name, decorators);
                    }
                });
            }
            return memberDecorators;
        };
        /**
         * For a given class symbol, collects all decorator information from tslib helper methods, as
         * generated by TypeScript into emitted JavaScript files.
         *
         * Class decorators are extracted from calls to `tslib.__decorate` that look as follows:
         *
         * ```
         * let SomeDirective = class SomeDirective {}
         * SomeDirective = __decorate([
         *   Directive({ selector: '[someDirective]' }),
         * ], SomeDirective);
         * ```
         *
         * The extraction of member decorators is similar, with the distinction that its 2nd and 3rd
         * argument correspond with a "prototype" target and the name of the member to which the
         * decorators apply.
         *
         * ```
         * __decorate([
         *     Input(),
         *     __metadata("design:type", String)
         * ], SomeDirective.prototype, "input1", void 0);
         * ```
         *
         * @param classSymbol The class symbol for which decorators should be extracted.
         * @returns All information on the decorators of the class.
         */
        Esm2015ReflectionHost.prototype.computeDecoratorInfoFromHelperCalls = function (classSymbol) {
            var e_2, _a, e_3, _b, e_4, _c;
            var _this = this;
            var classDecorators = null;
            var memberDecorators = new Map();
            var constructorParamInfo = [];
            var getConstructorParamInfo = function (index) {
                var param = constructorParamInfo[index];
                if (param === undefined) {
                    param = constructorParamInfo[index] = { decorators: null, typeExpression: null };
                }
                return param;
            };
            // All relevant information can be extracted from calls to `__decorate`, obtain these first.
            // Note that although the helper calls are retrieved using the class symbol, the result may
            // contain helper calls corresponding with unrelated classes. Therefore, each helper call still
            // has to be checked to actually correspond with the class symbol.
            var helperCalls = this.getHelperCallsForClass(classSymbol, ['__decorate']);
            var outerDeclaration = classSymbol.declaration.valueDeclaration;
            var innerDeclaration = classSymbol.implementation.valueDeclaration;
            var matchesClass = function (identifier) {
                var decl = _this.getDeclarationOfIdentifier(identifier);
                if (decl === null) {
                    return false;
                }
                // The identifier corresponds with the class if its declaration is either the outer or inner
                // declaration.
                return decl.node === outerDeclaration || decl.node === innerDeclaration;
            };
            try {
                for (var helperCalls_1 = tslib_1.__values(helperCalls), helperCalls_1_1 = helperCalls_1.next(); !helperCalls_1_1.done; helperCalls_1_1 = helperCalls_1.next()) {
                    var helperCall = helperCalls_1_1.value;
                    if (isClassDecorateCall(helperCall, matchesClass)) {
                        // This `__decorate` call is targeting the class itself.
                        var helperArgs = helperCall.arguments[0];
                        try {
                            for (var _d = (e_3 = void 0, tslib_1.__values(helperArgs.elements)), _e = _d.next(); !_e.done; _e = _d.next()) {
                                var element = _e.value;
                                var entry = this.reflectDecorateHelperEntry(element);
                                if (entry === null) {
                                    continue;
                                }
                                if (entry.type === 'decorator') {
                                    // The helper arg was reflected to represent an actual decorator
                                    if (this.isFromCore(entry.decorator)) {
                                        (classDecorators || (classDecorators = [])).push(entry.decorator);
                                    }
                                }
                                else if (entry.type === 'param:decorators') {
                                    // The helper arg represents a decorator for a parameter. Since it's applied to the
                                    // class, it corresponds with a constructor parameter of the class.
                                    var param = getConstructorParamInfo(entry.index);
                                    (param.decorators || (param.decorators = [])).push(entry.decorator);
                                }
                                else if (entry.type === 'params') {
                                    // The helper arg represents the types of the parameters. Since it's applied to the
                                    // class, it corresponds with the constructor parameters of the class.
                                    entry.types.forEach(function (type, index) { return getConstructorParamInfo(index).typeExpression = type; });
                                }
                            }
                        }
                        catch (e_3_1) { e_3 = { error: e_3_1 }; }
                        finally {
                            try {
                                if (_e && !_e.done && (_b = _d.return)) _b.call(_d);
                            }
                            finally { if (e_3) throw e_3.error; }
                        }
                    }
                    else if (isMemberDecorateCall(helperCall, matchesClass)) {
                        // The `__decorate` call is targeting a member of the class
                        var helperArgs = helperCall.arguments[0];
                        var memberName = helperCall.arguments[2].text;
                        try {
                            for (var _f = (e_4 = void 0, tslib_1.__values(helperArgs.elements)), _g = _f.next(); !_g.done; _g = _f.next()) {
                                var element = _g.value;
                                var entry = this.reflectDecorateHelperEntry(element);
                                if (entry === null) {
                                    continue;
                                }
                                if (entry.type === 'decorator') {
                                    // The helper arg was reflected to represent an actual decorator.
                                    if (this.isFromCore(entry.decorator)) {
                                        var decorators = memberDecorators.has(memberName) ? memberDecorators.get(memberName) : [];
                                        decorators.push(entry.decorator);
                                        memberDecorators.set(memberName, decorators);
                                    }
                                }
                                else {
                                    // Information on decorated parameters is not interesting for ngcc, so it's ignored.
                                }
                            }
                        }
                        catch (e_4_1) { e_4 = { error: e_4_1 }; }
                        finally {
                            try {
                                if (_g && !_g.done && (_c = _f.return)) _c.call(_f);
                            }
                            finally { if (e_4) throw e_4.error; }
                        }
                    }
                }
            }
            catch (e_2_1) { e_2 = { error: e_2_1 }; }
            finally {
                try {
                    if (helperCalls_1_1 && !helperCalls_1_1.done && (_a = helperCalls_1.return)) _a.call(helperCalls_1);
                }
                finally { if (e_2) throw e_2.error; }
            }
            return { classDecorators: classDecorators, memberDecorators: memberDecorators, constructorParamInfo: constructorParamInfo };
        };
        /**
         * Extract the details of an entry within a `__decorate` helper call. For example, given the
         * following code:
         *
         * ```
         * __decorate([
         *   Directive({ selector: '[someDirective]' }),
         *   tslib_1.__param(2, Inject(INJECTED_TOKEN)),
         *   tslib_1.__metadata("design:paramtypes", [ViewContainerRef, TemplateRef, String])
         * ], SomeDirective);
         * ```
         *
         * it can be seen that there are calls to regular decorators (the `Directive`) and calls into
         * `tslib` functions which have been inserted by TypeScript. Therefore, this function classifies
         * a call to correspond with
         *   1. a real decorator like `Directive` above, or
         *   2. a decorated parameter, corresponding with `__param` calls from `tslib`, or
         *   3. the type information of parameters, corresponding with `__metadata` call from `tslib`
         *
         * @param expression the expression that needs to be reflected into a `DecorateHelperEntry`
         * @returns an object that indicates which of the three categories the call represents, together
         * with the reflected information of the call, or null if the call is not a valid decorate call.
         */
        Esm2015ReflectionHost.prototype.reflectDecorateHelperEntry = function (expression) {
            // We only care about those elements that are actual calls
            if (!ts.isCallExpression(expression)) {
                return null;
            }
            var call = expression;
            var helperName = getCalleeName(call);
            if (helperName === '__metadata') {
                // This is a `tslib.__metadata` call, reflect to arguments into a `ParameterTypes` object
                // if the metadata key is "design:paramtypes".
                var key = call.arguments[0];
                if (key === undefined || !ts.isStringLiteral(key) || key.text !== 'design:paramtypes') {
                    return null;
                }
                var value = call.arguments[1];
                if (value === undefined || !ts.isArrayLiteralExpression(value)) {
                    return null;
                }
                return {
                    type: 'params',
                    types: Array.from(value.elements),
                };
            }
            if (helperName === '__param') {
                // This is a `tslib.__param` call that is reflected into a `ParameterDecorators` object.
                var indexArg = call.arguments[0];
                var index = indexArg && ts.isNumericLiteral(indexArg) ? parseInt(indexArg.text, 10) : NaN;
                if (isNaN(index)) {
                    return null;
                }
                var decoratorCall = call.arguments[1];
                if (decoratorCall === undefined || !ts.isCallExpression(decoratorCall)) {
                    return null;
                }
                var decorator_1 = this.reflectDecoratorCall(decoratorCall);
                if (decorator_1 === null) {
                    return null;
                }
                return {
                    type: 'param:decorators',
                    index: index,
                    decorator: decorator_1,
                };
            }
            // Otherwise attempt to reflect it as a regular decorator.
            var decorator = this.reflectDecoratorCall(call);
            if (decorator === null) {
                return null;
            }
            return {
                type: 'decorator',
                decorator: decorator,
            };
        };
        Esm2015ReflectionHost.prototype.reflectDecoratorCall = function (call) {
            var decoratorExpression = call.expression;
            if (!reflection_1.isDecoratorIdentifier(decoratorExpression)) {
                return null;
            }
            // We found a decorator!
            var decoratorIdentifier = ts.isIdentifier(decoratorExpression) ? decoratorExpression : decoratorExpression.name;
            return {
                name: decoratorIdentifier.text,
                identifier: decoratorExpression,
                import: this.getImportOfIdentifier(decoratorIdentifier),
                node: call,
                args: Array.from(call.arguments),
            };
        };
        /**
         * Check the given statement to see if it is a call to any of the specified helper functions or
         * null if not found.
         *
         * Matching statements will look like:  `tslib_1.__decorate(...);`.
         * @param statement the statement that may contain the call.
         * @param helperNames the names of the helper we are looking for.
         * @returns the node that corresponds to the `__decorate(...)` call or null if the statement
         * does not match.
         */
        Esm2015ReflectionHost.prototype.getHelperCall = function (statement, helperNames) {
            if ((ts.isExpressionStatement(statement) || ts.isReturnStatement(statement)) &&
                statement.expression) {
                var expression = statement.expression;
                while (isAssignment(expression)) {
                    expression = expression.right;
                }
                if (ts.isCallExpression(expression)) {
                    var calleeName = getCalleeName(expression);
                    if (calleeName !== null && helperNames.includes(calleeName)) {
                        return expression;
                    }
                }
            }
            return null;
        };
        /**
         * Reflect over the given array node and extract decorator information from each element.
         *
         * This is used for decorators that are defined in static properties. For example:
         *
         * ```
         * SomeDirective.decorators = [
         *   { type: Directive, args: [{ selector: '[someDirective]' },] }
         * ];
         * ```
         *
         * @param decoratorsArray an expression that contains decorator information.
         * @returns an array of decorator info that was reflected from the array node.
         */
        Esm2015ReflectionHost.prototype.reflectDecorators = function (decoratorsArray) {
            var _this = this;
            var decorators = [];
            if (ts.isArrayLiteralExpression(decoratorsArray)) {
                // Add each decorator that is imported from `@angular/core` into the `decorators` array
                decoratorsArray.elements.forEach(function (node) {
                    // If the decorator is not an object literal expression then we are not interested
                    if (ts.isObjectLiteralExpression(node)) {
                        // We are only interested in objects of the form: `{ type: DecoratorType, args: [...] }`
                        var decorator = reflection_1.reflectObjectLiteral(node);
                        // Is the value of the `type` property an identifier?
                        if (decorator.has('type')) {
                            var decoratorType = decorator.get('type');
                            if (reflection_1.isDecoratorIdentifier(decoratorType)) {
                                var decoratorIdentifier = ts.isIdentifier(decoratorType) ? decoratorType : decoratorType.name;
                                decorators.push({
                                    name: decoratorIdentifier.text,
                                    identifier: decoratorType,
                                    import: _this.getImportOfIdentifier(decoratorIdentifier), node: node,
                                    args: getDecoratorArgs(node),
                                });
                            }
                        }
                    }
                });
            }
            return decorators;
        };
        /**
         * Reflect over a symbol and extract the member information, combining it with the
         * provided decorator information, and whether it is a static member.
         *
         * A single symbol may represent multiple class members in the case of accessors;
         * an equally named getter/setter accessor pair is combined into a single symbol.
         * When the symbol is recognized as representing an accessor, its declarations are
         * analyzed such that both the setter and getter accessor are returned as separate
         * class members.
         *
         * One difference wrt the TypeScript host is that in ES2015, we cannot see which
         * accessor originally had any decorators applied to them, as decorators are applied
         * to the property descriptor in general, not a specific accessor. If an accessor
         * has both a setter and getter, any decorators are only attached to the setter member.
         *
         * @param symbol the symbol for the member to reflect over.
         * @param decorators an array of decorators associated with the member.
         * @param isStatic true if this member is static, false if it is an instance property.
         * @returns the reflected member information, or null if the symbol is not a member.
         */
        Esm2015ReflectionHost.prototype.reflectMembers = function (symbol, decorators, isStatic) {
            if (symbol.flags & ts.SymbolFlags.Accessor) {
                var members = [];
                var setter = symbol.declarations && symbol.declarations.find(ts.isSetAccessor);
                var getter = symbol.declarations && symbol.declarations.find(ts.isGetAccessor);
                var setterMember = setter && this.reflectMember(setter, reflection_1.ClassMemberKind.Setter, decorators, isStatic);
                if (setterMember) {
                    members.push(setterMember);
                    // Prevent attaching the decorators to a potential getter. In ES2015, we can't tell where
                    // the decorators were originally attached to, however we only want to attach them to a
                    // single `ClassMember` as otherwise ngtsc would handle the same decorators twice.
                    decorators = undefined;
                }
                var getterMember = getter && this.reflectMember(getter, reflection_1.ClassMemberKind.Getter, decorators, isStatic);
                if (getterMember) {
                    members.push(getterMember);
                }
                return members;
            }
            var kind = null;
            if (symbol.flags & ts.SymbolFlags.Method) {
                kind = reflection_1.ClassMemberKind.Method;
            }
            else if (symbol.flags & ts.SymbolFlags.Property) {
                kind = reflection_1.ClassMemberKind.Property;
            }
            var node = symbol.valueDeclaration || symbol.declarations && symbol.declarations[0];
            if (!node) {
                // If the symbol has been imported from a TypeScript typings file then the compiler
                // may pass the `prototype` symbol as an export of the class.
                // But this has no declaration. In this case we just quietly ignore it.
                return null;
            }
            var member = this.reflectMember(node, kind, decorators, isStatic);
            if (!member) {
                return null;
            }
            return [member];
        };
        /**
         * Reflect over a symbol and extract the member information, combining it with the
         * provided decorator information, and whether it is a static member.
         * @param node the declaration node for the member to reflect over.
         * @param kind the assumed kind of the member, may become more accurate during reflection.
         * @param decorators an array of decorators associated with the member.
         * @param isStatic true if this member is static, false if it is an instance property.
         * @returns the reflected member information, or null if the symbol is not a member.
         */
        Esm2015ReflectionHost.prototype.reflectMember = function (node, kind, decorators, isStatic) {
            var value = null;
            var name = null;
            var nameNode = null;
            if (!isClassMemberType(node)) {
                return null;
            }
            if (isStatic && isPropertyAccess(node)) {
                name = node.name.text;
                value = kind === reflection_1.ClassMemberKind.Property ? node.parent.right : null;
            }
            else if (isThisAssignment(node)) {
                kind = reflection_1.ClassMemberKind.Property;
                name = node.left.name.text;
                value = node.right;
                isStatic = false;
            }
            else if (ts.isConstructorDeclaration(node)) {
                kind = reflection_1.ClassMemberKind.Constructor;
                name = 'constructor';
                isStatic = false;
            }
            if (kind === null) {
                this.logger.warn("Unknown member type: \"" + node.getText());
                return null;
            }
            if (!name) {
                if (isNamedDeclaration(node)) {
                    name = node.name.text;
                    nameNode = node.name;
                }
                else {
                    return null;
                }
            }
            // If we have still not determined if this is a static or instance member then
            // look for the `static` keyword on the declaration
            if (isStatic === undefined) {
                isStatic = node.modifiers !== undefined &&
                    node.modifiers.some(function (mod) { return mod.kind === ts.SyntaxKind.StaticKeyword; });
            }
            var type = node.type || null;
            return {
                node: node,
                implementation: node, kind: kind, type: type, name: name, nameNode: nameNode, value: value, isStatic: isStatic,
                decorators: decorators || []
            };
        };
        /**
         * Find the declarations of the constructor parameters of a class identified by its symbol.
         * @param classSymbol the class whose parameters we want to find.
         * @returns an array of `ts.ParameterDeclaration` objects representing each of the parameters in
         * the class's constructor or null if there is no constructor.
         */
        Esm2015ReflectionHost.prototype.getConstructorParameterDeclarations = function (classSymbol) {
            var members = classSymbol.implementation.members;
            if (members && members.has(exports.CONSTRUCTOR)) {
                var constructorSymbol = members.get(exports.CONSTRUCTOR);
                // For some reason the constructor does not have a `valueDeclaration` ?!?
                var constructor = constructorSymbol.declarations &&
                    constructorSymbol.declarations[0];
                if (!constructor) {
                    return [];
                }
                if (constructor.parameters.length > 0) {
                    return Array.from(constructor.parameters);
                }
                if (isSynthesizedConstructor(constructor)) {
                    return null;
                }
                return [];
            }
            return null;
        };
        /**
         * Get the parameter decorators of a class constructor.
         *
         * @param classSymbol the class whose parameter info we want to get.
         * @param parameterNodes the array of TypeScript parameter nodes for this class's constructor.
         * @returns an array of constructor parameter info objects.
         */
        Esm2015ReflectionHost.prototype.getConstructorParamInfo = function (classSymbol, parameterNodes) {
            var _this = this;
            var constructorParamInfo = this.acquireDecoratorInfo(classSymbol).constructorParamInfo;
            return parameterNodes.map(function (node, index) {
                var _a = constructorParamInfo[index] ?
                    constructorParamInfo[index] :
                    { decorators: null, typeExpression: null }, decorators = _a.decorators, typeExpression = _a.typeExpression;
                var nameNode = node.name;
                var typeValueReference = null;
                if (typeExpression !== null) {
                    // `typeExpression` is an expression in a "type" context. Resolve it to a declared value.
                    // Either it's a reference to an imported type, or a type declared locally. Distinguish the
                    // two cases with `getDeclarationOfExpression`.
                    var decl = _this.getDeclarationOfExpression(typeExpression);
                    if (decl !== null && decl.node !== null && decl.viaModule !== null &&
                        isNamedDeclaration(decl.node)) {
                        typeValueReference = {
                            local: false,
                            valueDeclaration: decl.node,
                            moduleName: decl.viaModule,
                            name: decl.node.name.text,
                        };
                    }
                    else {
                        typeValueReference = {
                            local: true,
                            expression: typeExpression,
                            defaultImportStatement: null,
                        };
                    }
                }
                return {
                    name: utils_1.getNameText(nameNode),
                    nameNode: nameNode,
                    typeValueReference: typeValueReference,
                    typeNode: null, decorators: decorators
                };
            });
        };
        /**
         * Get the parameter type and decorators for the constructor of a class,
         * where the information is stored on a static property of the class.
         *
         * Note that in ESM2015, the property is defined an array, or by an arrow function that returns
         * an array, of decorator and type information.
         *
         * For example,
         *
         * ```
         * SomeDirective.ctorParameters = () => [
         *   {type: ViewContainerRef},
         *   {type: TemplateRef},
         *   {type: undefined, decorators: [{ type: Inject, args: [INJECTED_TOKEN]}]},
         * ];
         * ```
         *
         * or
         *
         * ```
         * SomeDirective.ctorParameters = [
         *   {type: ViewContainerRef},
         *   {type: TemplateRef},
         *   {type: undefined, decorators: [{type: Inject, args: [INJECTED_TOKEN]}]},
         * ];
         * ```
         *
         * @param paramDecoratorsProperty the property that holds the parameter info we want to get.
         * @returns an array of objects containing the type and decorators for each parameter.
         */
        Esm2015ReflectionHost.prototype.getParamInfoFromStaticProperty = function (paramDecoratorsProperty) {
            var _this = this;
            var paramDecorators = getPropertyValueFromSymbol(paramDecoratorsProperty);
            if (paramDecorators) {
                // The decorators array may be wrapped in an arrow function. If so unwrap it.
                var container = ts.isArrowFunction(paramDecorators) ? paramDecorators.body : paramDecorators;
                if (ts.isArrayLiteralExpression(container)) {
                    var elements = container.elements;
                    return elements
                        .map(function (element) {
                        return ts.isObjectLiteralExpression(element) ? reflection_1.reflectObjectLiteral(element) : null;
                    })
                        .map(function (paramInfo) {
                        var typeExpression = paramInfo && paramInfo.has('type') ? paramInfo.get('type') : null;
                        var decoratorInfo = paramInfo && paramInfo.has('decorators') ? paramInfo.get('decorators') : null;
                        var decorators = decoratorInfo &&
                            _this.reflectDecorators(decoratorInfo)
                                .filter(function (decorator) { return _this.isFromCore(decorator); });
                        return { typeExpression: typeExpression, decorators: decorators };
                    });
                }
                else if (paramDecorators !== undefined) {
                    this.logger.warn('Invalid constructor parameter decorator in ' +
                        paramDecorators.getSourceFile().fileName + ':\n', paramDecorators.getText());
                }
            }
            return null;
        };
        /**
         * Search statements related to the given class for calls to the specified helper.
         * @param classSymbol the class whose helper calls we are interested in.
         * @param helperNames the names of the helpers (e.g. `__decorate`) whose calls we are interested
         * in.
         * @returns an array of CallExpression nodes for each matching helper call.
         */
        Esm2015ReflectionHost.prototype.getHelperCallsForClass = function (classSymbol, helperNames) {
            var _this = this;
            return this.getStatementsForClass(classSymbol)
                .map(function (statement) { return _this.getHelperCall(statement, helperNames); })
                .filter(utils_1.isDefined);
        };
        /**
         * Find statements related to the given class that may contain calls to a helper.
         *
         * In ESM2015 code the helper calls are in the top level module, so we have to consider
         * all the statements in the module.
         *
         * @param classSymbol the class whose helper calls we are interested in.
         * @returns an array of statements that may contain helper calls.
         */
        Esm2015ReflectionHost.prototype.getStatementsForClass = function (classSymbol) {
            return Array.from(classSymbol.declaration.valueDeclaration.getSourceFile().statements);
        };
        /**
         * Test whether a decorator was imported from `@angular/core`.
         *
         * Is the decorator:
         * * externally imported from `@angular/core`?
         * * the current hosted program is actually `@angular/core` and
         *   - relatively internally imported; or
         *   - not imported, from the current file.
         *
         * @param decorator the decorator to test.
         */
        Esm2015ReflectionHost.prototype.isFromCore = function (decorator) {
            if (this.isCore) {
                return !decorator.import || /^\./.test(decorator.import.from);
            }
            else {
                return !!decorator.import && decorator.import.from === '@angular/core';
            }
        };
        /**
         * Create a mapping between the public exports in a src program and the public exports of a dts
         * program.
         *
         * @param src the program bundle containing the source files.
         * @param dts the program bundle containing the typings files.
         * @returns a map of source declarations to typings declarations.
         */
        Esm2015ReflectionHost.prototype.computePublicDtsDeclarationMap = function (src, dts) {
            var declarationMap = new Map();
            var dtsDeclarationMap = new Map();
            var rootDts = getRootFileOrFail(dts);
            this.collectDtsExportedDeclarations(dtsDeclarationMap, rootDts, dts.program.getTypeChecker());
            var rootSrc = getRootFileOrFail(src);
            this.collectSrcExportedDeclarations(declarationMap, dtsDeclarationMap, rootSrc);
            return declarationMap;
        };
        /**
         * Create a mapping between the "private" exports in a src program and the "private" exports of a
         * dts program. These exports may be exported from individual files in the src or dts programs,
         * but not exported from the root file (i.e publicly from the entry-point).
         *
         * This mapping is a "best guess" since we cannot guarantee that two declarations that happen to
         * be exported from a file with the same name are actually equivalent. But this is a reasonable
         * estimate for the purposes of ngcc.
         *
         * @param src the program bundle containing the source files.
         * @param dts the program bundle containing the typings files.
         * @returns a map of source declarations to typings declarations.
         */
        Esm2015ReflectionHost.prototype.computePrivateDtsDeclarationMap = function (src, dts) {
            var e_5, _a, e_6, _b;
            var declarationMap = new Map();
            var dtsDeclarationMap = new Map();
            var typeChecker = dts.program.getTypeChecker();
            var dtsFiles = getNonRootPackageFiles(dts);
            try {
                for (var dtsFiles_1 = tslib_1.__values(dtsFiles), dtsFiles_1_1 = dtsFiles_1.next(); !dtsFiles_1_1.done; dtsFiles_1_1 = dtsFiles_1.next()) {
                    var dtsFile = dtsFiles_1_1.value;
                    this.collectDtsExportedDeclarations(dtsDeclarationMap, dtsFile, typeChecker);
                }
            }
            catch (e_5_1) { e_5 = { error: e_5_1 }; }
            finally {
                try {
                    if (dtsFiles_1_1 && !dtsFiles_1_1.done && (_a = dtsFiles_1.return)) _a.call(dtsFiles_1);
                }
                finally { if (e_5) throw e_5.error; }
            }
            var srcFiles = getNonRootPackageFiles(src);
            try {
                for (var srcFiles_1 = tslib_1.__values(srcFiles), srcFiles_1_1 = srcFiles_1.next(); !srcFiles_1_1.done; srcFiles_1_1 = srcFiles_1.next()) {
                    var srcFile = srcFiles_1_1.value;
                    this.collectSrcExportedDeclarations(declarationMap, dtsDeclarationMap, srcFile);
                }
            }
            catch (e_6_1) { e_6 = { error: e_6_1 }; }
            finally {
                try {
                    if (srcFiles_1_1 && !srcFiles_1_1.done && (_b = srcFiles_1.return)) _b.call(srcFiles_1);
                }
                finally { if (e_6) throw e_6.error; }
            }
            return declarationMap;
        };
        /**
         * Collect mappings between names of exported declarations in a file and its actual declaration.
         *
         * Any new mappings are added to the `dtsDeclarationMap`.
         */
        Esm2015ReflectionHost.prototype.collectDtsExportedDeclarations = function (dtsDeclarationMap, srcFile, checker) {
            var srcModule = srcFile && checker.getSymbolAtLocation(srcFile);
            var moduleExports = srcModule && checker.getExportsOfModule(srcModule);
            if (moduleExports) {
                moduleExports.forEach(function (exportedSymbol) {
                    var name = exportedSymbol.name;
                    if (exportedSymbol.flags & ts.SymbolFlags.Alias) {
                        exportedSymbol = checker.getAliasedSymbol(exportedSymbol);
                    }
                    var declaration = exportedSymbol.valueDeclaration;
                    if (declaration && !dtsDeclarationMap.has(name)) {
                        dtsDeclarationMap.set(name, declaration);
                    }
                });
            }
        };
        Esm2015ReflectionHost.prototype.collectSrcExportedDeclarations = function (declarationMap, dtsDeclarationMap, srcFile) {
            var e_7, _a;
            var fileExports = this.getExportsOfModule(srcFile);
            if (fileExports !== null) {
                try {
                    for (var fileExports_1 = tslib_1.__values(fileExports), fileExports_1_1 = fileExports_1.next(); !fileExports_1_1.done; fileExports_1_1 = fileExports_1.next()) {
                        var _b = tslib_1.__read(fileExports_1_1.value, 2), exportName = _b[0], declaration = _b[1].node;
                        if (declaration !== null && dtsDeclarationMap.has(exportName)) {
                            declarationMap.set(declaration, dtsDeclarationMap.get(exportName));
                        }
                    }
                }
                catch (e_7_1) { e_7 = { error: e_7_1 }; }
                finally {
                    try {
                        if (fileExports_1_1 && !fileExports_1_1.done && (_a = fileExports_1.return)) _a.call(fileExports_1);
                    }
                    finally { if (e_7) throw e_7.error; }
                }
            }
        };
        /**
         * Parse a function/method node (or its implementation), to see if it returns a
         * `ModuleWithProviders` object.
         * @param name The name of the function.
         * @param node the node to check - this could be a function, a method or a variable declaration.
         * @param implementation the actual function expression if `node` is a variable declaration.
         * @param container the class that contains the function, if it is a method.
         * @returns info about the function if it does return a `ModuleWithProviders` object; `null`
         * otherwise.
         */
        Esm2015ReflectionHost.prototype.parseForModuleWithProviders = function (name, node, implementation, container) {
            if (implementation === void 0) { implementation = node; }
            if (container === void 0) { container = null; }
            if (implementation === null ||
                (!ts.isFunctionDeclaration(implementation) && !ts.isMethodDeclaration(implementation) &&
                    !ts.isFunctionExpression(implementation))) {
                return null;
            }
            var declaration = implementation;
            var definition = this.getDefinitionOfFunction(declaration);
            if (definition === null) {
                return null;
            }
            var body = definition.body;
            var lastStatement = body && body[body.length - 1];
            var returnExpression = lastStatement && ts.isReturnStatement(lastStatement) && lastStatement.expression || null;
            var ngModuleProperty = returnExpression && ts.isObjectLiteralExpression(returnExpression) &&
                returnExpression.properties.find(function (prop) {
                    return !!prop.name && ts.isIdentifier(prop.name) && prop.name.text === 'ngModule';
                }) ||
                null;
            if (!ngModuleProperty || !ts.isPropertyAssignment(ngModuleProperty)) {
                return null;
            }
            // The ngModuleValue could be of the form `SomeModule` or `namespace_1.SomeModule`
            var ngModuleValue = ngModuleProperty.initializer;
            if (!ts.isIdentifier(ngModuleValue) && !ts.isPropertyAccessExpression(ngModuleValue)) {
                return null;
            }
            var ngModuleDeclaration = this.getDeclarationOfExpression(ngModuleValue);
            if (!ngModuleDeclaration || ngModuleDeclaration.node === null) {
                throw new Error("Cannot find a declaration for NgModule " + ngModuleValue.getText() + " referenced in \"" + declaration.getText() + "\"");
            }
            if (!utils_1.hasNameIdentifier(ngModuleDeclaration.node)) {
                return null;
            }
            return {
                name: name,
                ngModule: ngModuleDeclaration, declaration: declaration, container: container
            };
        };
        Esm2015ReflectionHost.prototype.getDeclarationOfExpression = function (expression) {
            if (ts.isIdentifier(expression)) {
                return this.getDeclarationOfIdentifier(expression);
            }
            if (!ts.isPropertyAccessExpression(expression) || !ts.isIdentifier(expression.expression)) {
                return null;
            }
            var namespaceDecl = this.getDeclarationOfIdentifier(expression.expression);
            if (!namespaceDecl || namespaceDecl.node === null || !ts.isSourceFile(namespaceDecl.node)) {
                return null;
            }
            var namespaceExports = this.getExportsOfModule(namespaceDecl.node);
            if (namespaceExports === null) {
                return null;
            }
            if (!namespaceExports.has(expression.name.text)) {
                return null;
            }
            var exportDecl = namespaceExports.get(expression.name.text);
            return tslib_1.__assign(tslib_1.__assign({}, exportDecl), { viaModule: namespaceDecl.viaModule });
        };
        /** Checks if the specified declaration resolves to the known JavaScript global `Object`. */
        Esm2015ReflectionHost.prototype.isJavaScriptObjectDeclaration = function (decl) {
            if (decl.node === null) {
                return false;
            }
            var node = decl.node;
            // The default TypeScript library types the global `Object` variable through
            // a variable declaration with a type reference resolving to `ObjectConstructor`.
            if (!ts.isVariableDeclaration(node) || !ts.isIdentifier(node.name) ||
                node.name.text !== 'Object' || node.type === undefined) {
                return false;
            }
            var typeNode = node.type;
            // If the variable declaration does not have a type resolving to `ObjectConstructor`,
            // we cannot guarantee that the declaration resolves to the global `Object` variable.
            if (!ts.isTypeReferenceNode(typeNode) || !ts.isIdentifier(typeNode.typeName) ||
                typeNode.typeName.text !== 'ObjectConstructor') {
                return false;
            }
            // Finally, check if the type definition for `Object` originates from a default library
            // definition file. This requires default types to be enabled for the host program.
            return this.src.program.isSourceFileDefaultLibrary(node.getSourceFile());
        };
        return Esm2015ReflectionHost;
    }(reflection_1.TypeScriptReflectionHost));
    exports.Esm2015ReflectionHost = Esm2015ReflectionHost;
    /**
     * Test whether a statement node is an assignment statement.
     * @param statement the statement to test.
     */
    function isAssignmentStatement(statement) {
        return ts.isExpressionStatement(statement) && isAssignment(statement.expression) &&
            ts.isIdentifier(statement.expression.left);
    }
    exports.isAssignmentStatement = isAssignmentStatement;
    function isAssignment(node) {
        return ts.isBinaryExpression(node) && node.operatorToken.kind === ts.SyntaxKind.EqualsToken;
    }
    exports.isAssignment = isAssignment;
    /**
     * Tests whether the provided call expression targets a class, by verifying its arguments are
     * according to the following form:
     *
     * ```
     * __decorate([], SomeDirective);
     * ```
     *
     * @param call the call expression that is tested to represent a class decorator call.
     * @param matches predicate function to test whether the call is associated with the desired class.
     */
    function isClassDecorateCall(call, matches) {
        var helperArgs = call.arguments[0];
        if (helperArgs === undefined || !ts.isArrayLiteralExpression(helperArgs)) {
            return false;
        }
        var target = call.arguments[1];
        return target !== undefined && ts.isIdentifier(target) && matches(target);
    }
    exports.isClassDecorateCall = isClassDecorateCall;
    /**
     * Tests whether the provided call expression targets a member of the class, by verifying its
     * arguments are according to the following form:
     *
     * ```
     * __decorate([], SomeDirective.prototype, "member", void 0);
     * ```
     *
     * @param call the call expression that is tested to represent a member decorator call.
     * @param matches predicate function to test whether the call is associated with the desired class.
     */
    function isMemberDecorateCall(call, matches) {
        var helperArgs = call.arguments[0];
        if (helperArgs === undefined || !ts.isArrayLiteralExpression(helperArgs)) {
            return false;
        }
        var target = call.arguments[1];
        if (target === undefined || !ts.isPropertyAccessExpression(target) ||
            !ts.isIdentifier(target.expression) || !matches(target.expression) ||
            target.name.text !== 'prototype') {
            return false;
        }
        var memberName = call.arguments[2];
        return memberName !== undefined && ts.isStringLiteral(memberName);
    }
    exports.isMemberDecorateCall = isMemberDecorateCall;
    /**
     * Helper method to extract the value of a property given the property's "symbol",
     * which is actually the symbol of the identifier of the property.
     */
    function getPropertyValueFromSymbol(propSymbol) {
        var propIdentifier = propSymbol.valueDeclaration;
        var parent = propIdentifier && propIdentifier.parent;
        return parent && ts.isBinaryExpression(parent) ? parent.right : undefined;
    }
    exports.getPropertyValueFromSymbol = getPropertyValueFromSymbol;
    /**
     * A callee could be one of: `__decorate(...)` or `tslib_1.__decorate`.
     */
    function getCalleeName(call) {
        if (ts.isIdentifier(call.expression)) {
            return utils_1.stripDollarSuffix(call.expression.text);
        }
        if (ts.isPropertyAccessExpression(call.expression)) {
            return utils_1.stripDollarSuffix(call.expression.name.text);
        }
        return null;
    }
    ///////////// Internal Helpers /////////////
    /**
     * In ES2015, a class may be declared using a variable declaration of the following structure:
     *
     * ```
     * var MyClass = MyClass_1 = class MyClass {};
     * ```
     *
     * Here, the intermediate `MyClass_1` assignment is optional. In the above example, the
     * `class MyClass {}` expression is returned as declaration of `var MyClass`. If the variable
     * is not initialized using a class expression, null is returned.
     *
     * @param node the node that represents the class whose declaration we are finding.
     * @returns the declaration of the class or `null` if it is not a "class".
     */
    function getInnerClassDeclaration(node) {
        if (!ts.isVariableDeclaration(node) || node.initializer === undefined) {
            return null;
        }
        // Recognize a variable declaration of the form `var MyClass = class MyClass {}` or
        // `var MyClass = MyClass_1 = class MyClass {};`
        var expression = node.initializer;
        while (isAssignment(expression)) {
            expression = expression.right;
        }
        if (!ts.isClassExpression(expression) || !utils_1.hasNameIdentifier(expression)) {
            return null;
        }
        return expression;
    }
    function getDecoratorArgs(node) {
        // The arguments of a decorator are held in the `args` property of its declaration object.
        var argsProperty = node.properties.filter(ts.isPropertyAssignment)
            .find(function (property) { return utils_1.getNameText(property.name) === 'args'; });
        var argsExpression = argsProperty && argsProperty.initializer;
        return argsExpression && ts.isArrayLiteralExpression(argsExpression) ?
            Array.from(argsExpression.elements) :
            [];
    }
    function isPropertyAccess(node) {
        return !!node.parent && ts.isBinaryExpression(node.parent) && ts.isPropertyAccessExpression(node);
    }
    function isThisAssignment(node) {
        return ts.isBinaryExpression(node) && ts.isPropertyAccessExpression(node.left) &&
            node.left.expression.kind === ts.SyntaxKind.ThisKeyword;
    }
    function isNamedDeclaration(node) {
        var anyNode = node;
        return !!anyNode.name && ts.isIdentifier(anyNode.name);
    }
    function isClassMemberType(node) {
        return (ts.isClassElement(node) || isPropertyAccess(node) || ts.isBinaryExpression(node)) &&
            // Additionally, ensure `node` is not an index signature, for example on an abstract class:
            // `abstract class Foo { [key: string]: any; }`
            !ts.isIndexSignatureDeclaration(node);
    }
    /**
     * Attempt to resolve the variable declaration that the given declaration is assigned to.
     * For example, for the following code:
     *
     * ```
     * var MyClass = MyClass_1 = class MyClass {};
     * ```
     *
     * and the provided declaration being `class MyClass {}`, this will return the `var MyClass`
     * declaration.
     *
     * @param declaration The declaration for which any variable declaration should be obtained.
     * @returns the outer variable declaration if found, undefined otherwise.
     */
    function getVariableDeclarationOfDeclaration(declaration) {
        var node = declaration.parent;
        // Detect an intermediary variable assignment and skip over it.
        if (isAssignment(node) && ts.isIdentifier(node.left)) {
            node = node.parent;
        }
        return ts.isVariableDeclaration(node) ? node : undefined;
    }
    /**
     * A constructor function may have been "synthesized" by TypeScript during JavaScript emit,
     * in the case no user-defined constructor exists and e.g. property initializers are used.
     * Those initializers need to be emitted into a constructor in JavaScript, so the TypeScript
     * compiler generates a synthetic constructor.
     *
     * We need to identify such constructors as ngcc needs to be able to tell if a class did
     * originally have a constructor in the TypeScript source. When a class has a superclass,
     * a synthesized constructor must not be considered as a user-defined constructor as that
     * prevents a base factory call from being created by ngtsc, resulting in a factory function
     * that does not inject the dependencies of the superclass. Hence, we identify a default
     * synthesized super call in the constructor body, according to the structure that TypeScript
     * emits during JavaScript emit:
     * https://github.com/Microsoft/TypeScript/blob/v3.2.2/src/compiler/transformers/ts.ts#L1068-L1082
     *
     * @param constructor a constructor function to test
     * @returns true if the constructor appears to have been synthesized
     */
    function isSynthesizedConstructor(constructor) {
        if (!constructor.body)
            return false;
        var firstStatement = constructor.body.statements[0];
        if (!firstStatement || !ts.isExpressionStatement(firstStatement))
            return false;
        return isSynthesizedSuperCall(firstStatement.expression);
    }
    /**
     * Tests whether the expression appears to have been synthesized by TypeScript, i.e. whether
     * it is of the following form:
     *
     * ```
     * super(...arguments);
     * ```
     *
     * @param expression the expression that is to be tested
     * @returns true if the expression appears to be a synthesized super call
     */
    function isSynthesizedSuperCall(expression) {
        if (!ts.isCallExpression(expression))
            return false;
        if (expression.expression.kind !== ts.SyntaxKind.SuperKeyword)
            return false;
        if (expression.arguments.length !== 1)
            return false;
        var argument = expression.arguments[0];
        return ts.isSpreadElement(argument) && ts.isIdentifier(argument.expression) &&
            argument.expression.text === 'arguments';
    }
    /**
     * Find the statement that contains the given node
     * @param node a node whose containing statement we wish to find
     */
    function getContainingStatement(node) {
        while (node) {
            if (ts.isExpressionStatement(node)) {
                break;
            }
            node = node.parent;
        }
        return node || null;
    }
    function getRootFileOrFail(bundle) {
        var rootFile = bundle.program.getSourceFile(bundle.path);
        if (rootFile === undefined) {
            throw new Error("The given rootPath " + rootFile + " is not a file of the program.");
        }
        return rootFile;
    }
    function getNonRootPackageFiles(bundle) {
        var rootFile = bundle.program.getSourceFile(bundle.path);
        return bundle.program.getSourceFiles().filter(function (f) { return (f !== rootFile) && util_1.isWithinPackage(bundle.package, f); });
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXNtMjAxNV9ob3N0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tcGlsZXItY2xpL25nY2Mvc3JjL2hvc3QvZXNtMjAxNV9ob3N0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7OztJQUVILCtCQUFpQztJQUVqQyx5RUFBdVE7SUFDdlEscUVBQWlEO0lBR2pELDhEQUErRjtJQUUvRiwyRUFBeUw7SUFFNUssUUFBQSxVQUFVLEdBQUcsWUFBMkIsQ0FBQztJQUN6QyxRQUFBLGVBQWUsR0FBRyxnQkFBK0IsQ0FBQztJQUNsRCxRQUFBLFdBQVcsR0FBRyxlQUE4QixDQUFDO0lBQzdDLFFBQUEsa0JBQWtCLEdBQUcsZ0JBQStCLENBQUM7SUFFbEU7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O09BMEJHO0lBQ0g7UUFBMkMsaURBQXdCO1FBZ0RqRSwrQkFDYyxNQUFjLEVBQVksTUFBZSxFQUFZLEdBQWtCLEVBQ3ZFLEdBQThCO1lBQTlCLG9CQUFBLEVBQUEsVUFBOEI7WUFGNUMsWUFHRSxrQkFBTSxHQUFHLENBQUMsT0FBTyxDQUFDLGNBQWMsRUFBRSxDQUFDLFNBQ3BDO1lBSGEsWUFBTSxHQUFOLE1BQU0sQ0FBUTtZQUFZLFlBQU0sR0FBTixNQUFNLENBQVM7WUFBWSxTQUFHLEdBQUgsR0FBRyxDQUFlO1lBQ3ZFLFNBQUcsR0FBSCxHQUFHLENBQTJCO1lBakQ1Qzs7Ozs7O2VBTUc7WUFDTyw2QkFBdUIsR0FBNkMsSUFBSSxDQUFDO1lBQ25GOzs7Ozs7ZUFNRztZQUNPLDhCQUF3QixHQUE2QyxJQUFJLENBQUM7WUFFcEY7O2VBRUc7WUFDTyw2QkFBdUIsR0FBRyxJQUFJLEdBQUcsRUFBaUIsQ0FBQztZQUU3RDs7Ozs7Ozs7Ozs7Ozs7ZUFjRztZQUNPLDhCQUF3QixHQUFHLElBQUksR0FBRyxFQUFpQyxDQUFDO1lBRTlFOzs7OztlQUtHO1lBQ08s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QUFDLE1BQU0sQ0FBQztTQUNwQjtRQUNELE9BQU8sSUFBSSxJQUFJLElBQUksQ0FBQztJQUN0QixDQUFDO0lBRUQsU0FBUyxpQkFBaUIsQ0FBQyxNQUFxQjtRQUM5QyxJQUFNLFFBQVEsR0FBRyxNQUFNLENBQUMsT0FBTyxDQUFDLGFBQWEsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDM0QsSUFBSSxRQUFRLEtBQUssU0FBUyxFQUFFO1lBQzFCLE1BQU0sSUFBSSxLQUFLLENBQUMsd0JBQXNCLFFBQVEsbUNBQWdDLENBQUMsQ0FBQztTQUNqRjtRQUNELE9BQU8sUUFBUSxDQUFDO0lBQ2xCLENBQUM7SUFFRCxTQUFTLHNCQUFzQixDQUFDLE1BQXFCO1FBQ25ELElBQU0sUUFBUSxHQUFHLE1BQU0sQ0FBQyxPQUFPLENBQUMsYUFBYSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUMzRCxPQUFPLE1BQU0sQ0FBQyxPQUFPLENBQUMsY0FBYyxFQUFFLENBQUMsTUFBTSxDQUN6QyxVQUFBLENBQUMsSUFBSSxPQUFBLENBQUMsQ0FBQyxLQUFLLFFBQVEsQ0FBQyxJQUFJLHNCQUFlLENBQUMsTUFBTSxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUMsRUFBdEQsQ0FBc0QsQ0FBQyxDQUFDO0lBQ25FLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCAqIGFzIHRzIGZyb20gJ3R5cGVzY3JpcHQnO1xuXG5pbXBvcnQge0NsYXNzRGVjbGFyYXRpb24sIENsYXNzTWVtYmVyLCBDbGFzc01lbWJlcktpbmQsIENvbmNyZXRlRGVjbGFyYXRpb24sIEN0b3JQYXJhbWV0ZXIsIERlY2xhcmF0aW9uLCBEZWNvcmF0b3IsIEtub3duRGVjbGFyYXRpb24sIFR5cGVTY3JpcHRSZWZsZWN0aW9uSG9zdCwgVHlwZVZhbHVlUmVmZXJlbmNlLCBpc0RlY29yYXRvcklkZW50aWZpZXIsIHJlZmxlY3RPYmplY3RMaXRlcmFsLH0gZnJvbSAnLi4vLi4vLi4vc3JjL25ndHNjL3JlZmxlY3Rpb24nO1xuaW1wb3J0IHtpc1dpdGhpblBhY2thZ2V9IGZyb20gJy4uL2FuYWx5c2lzL3V0aWwnO1xuaW1wb3J0IHtMb2dnZXJ9IGZyb20gJy4uL2xvZ2dpbmcvbG9nZ2VyJztcbmltcG9ydCB7QnVuZGxlUHJvZ3JhbX0gZnJvbSAnLi4vcGFja2FnZXMvYnVuZGxlX3Byb2dyYW0nO1xuaW1wb3J0IHtmaW5kQWxsLCBnZXROYW1lVGV4dCwgaGFzTmFtZUlkZW50aWZpZXIsIGlzRGVmaW5lZCwgc3RyaXBEb2xsYXJTdWZmaXh9IGZyb20gJy4uL3V0aWxzJztcblxuaW1wb3J0IHtDbGFzc1N5bWJvbCwgTW9kdWxlV2l0aFByb3ZpZGVyc0Z1bmN0aW9uLCBOZ2NjQ2xhc3NTeW1ib2wsIE5nY2NSZWZsZWN0aW9uSG9zdCwgUFJFX1IzX01BUktFUiwgU3dpdGNoYWJsZVZhcmlhYmxlRGVjbGFyYXRpb24sIGlzU3dpdGNoYWJsZVZhcmlhYmxlRGVjbGFyYXRpb259IGZyb20gJy4vbmdjY19ob3N0JztcblxuZXhwb3J0IGNvbnN0IERFQ09SQVRPUlMgPSAnZGVjb3JhdG9ycycgYXMgdHMuX19TdHJpbmc7XG5leHBvcnQgY29uc3QgUFJPUF9ERUNPUkFUT1JTID0gJ3Byb3BEZWNvcmF0b3JzJyBhcyB0cy5fX1N0cmluZztcbmV4cG9ydCBjb25zdCBDT05TVFJVQ1RPUiA9ICdfX2NvbnN0cnVjdG9yJyBhcyB0cy5fX1N0cmluZztcbmV4cG9ydCBjb25zdCBDT05TVFJVQ1RPUl9QQVJBTVMgPSAnY3RvclBhcmFtZXRlcnMnIGFzIHRzLl9fU3RyaW5nO1xuXG4vKipcbiAqIEVzbTIwMTUgcGFja2FnZXMgY29udGFpbiBFQ01BU2NyaXB0IDIwMTUgY2xhc3NlcywgZXRjLlxuICogRGVjb3JhdG9ycyBhcmUgZGVmaW5lZCB2aWEgc3RhdGljIHByb3BlcnRpZXMgb24gdGhlIGNsYXNzLiBGb3IgZXhhbXBsZTpcbiAqXG4gKiBgYGBcbiAqIGNsYXNzIFNvbWVEaXJlY3RpdmUge1xuICogfVxuICogU29tZURpcmVjdGl2ZS5kZWNvcmF0b3JzID0gW1xuICogICB7IHR5cGU6IERpcmVjdGl2ZSwgYXJnczogW3sgc2VsZWN0b3I6ICdbc29tZURpcmVjdGl2ZV0nIH0sXSB9XG4gKiBdO1xuICogU29tZURpcmVjdGl2ZS5jdG9yUGFyYW1ldGVycyA9ICgpID0+IFtcbiAqICAgeyB0eXBlOiBWaWV3Q29udGFpbmVyUmVmLCB9LFxuICogICB7IHR5cGU6IFRlbXBsYXRlUmVmLCB9LFxuICogICB7IHR5cGU6IHVuZGVmaW5lZCwgZGVjb3JhdG9yczogW3sgdHlwZTogSW5qZWN0LCBhcmdzOiBbSU5KRUNURURfVE9LRU4sXSB9LF0gfSxcbiAqIF07XG4gKiBTb21lRGlyZWN0aXZlLnByb3BEZWNvcmF0b3JzID0ge1xuICogICBcImlucHV0MVwiOiBbeyB0eXBlOiBJbnB1dCB9LF0sXG4gKiAgIFwiaW5wdXQyXCI6IFt7IHR5cGU6IElucHV0IH0sXSxcbiAqIH07XG4gKiBgYGBcbiAqXG4gKiAqIENsYXNzZXMgYXJlIGRlY29yYXRlZCBpZiB0aGV5IGhhdmUgYSBzdGF0aWMgcHJvcGVydHkgY2FsbGVkIGBkZWNvcmF0b3JzYC5cbiAqICogTWVtYmVycyBhcmUgZGVjb3JhdGVkIGlmIHRoZXJlIGlzIGEgbWF0Y2hpbmcga2V5IG9uIGEgc3RhdGljIHByb3BlcnR5XG4gKiAgIGNhbGxlZCBgcHJvcERlY29yYXRvcnNgLlxuICogKiBDb25zdHJ1Y3RvciBwYXJhbWV0ZXJzIGRlY29yYXRvcnMgYXJlIGZvdW5kIG9uIGFuIG9iamVjdCByZXR1cm5lZCBmcm9tXG4gKiAgIGEgc3RhdGljIG1ldGhvZCBjYWxsZWQgYGN0b3JQYXJhbWV0ZXJzYC5cbiAqL1xuZXhwb3J0IGNsYXNzIEVzbTIwMTVSZWZsZWN0aW9uSG9zdCBleHRlbmRzIFR5cGVTY3JpcHRSZWZsZWN0aW9uSG9zdCBpbXBsZW1lbnRzIE5nY2NSZWZsZWN0aW9uSG9zdCB7XG4gIC8qKlxuICAgKiBBIG1hcHBpbmcgZnJvbSBzb3VyY2UgZGVjbGFyYXRpb25zIHRvIHR5cGluZ3MgZGVjbGFyYXRpb25zLCB3aGljaCBhcmUgYm90aCBwdWJsaWNseSBleHBvcnRlZC5cbiAgICpcbiAgICogVGhlcmUgc2hvdWxkIGJlIG9uZSBlbnRyeSBmb3IgZXZlcnkgcHVibGljIGV4cG9ydCB2aXNpYmxlIGZyb20gdGhlIHJvb3QgZmlsZSBvZiB0aGUgc291cmNlXG4gICAqIHRyZWUuIE5vdGUgdGhhdCBieSBkZWZpbml0aW9uIHRoZSBrZXkgYW5kIHZhbHVlIGRlY2xhcmF0aW9ucyB3aWxsIG5vdCBiZSBpbiB0aGUgc2FtZSBUU1xuICAgKiBwcm9ncmFtLlxuICAgKi9cbiAgcHJvdGVjdGVkIHB1YmxpY0R0c0RlY2xhcmF0aW9uTWFwOiBNYXA8dHMuRGVjbGFyYXRpb24sIHRzLkRlY2xhcmF0aW9uPnxudWxsID0gbnVsbDtcbiAgLyoqXG4gICAqIEEgbWFwcGluZyBmcm9tIHNvdXJjZSBkZWNsYXJhdGlvbnMgdG8gdHlwaW5ncyBkZWNsYXJhdGlvbnMsIHdoaWNoIGFyZSBub3QgcHVibGljbHkgZXhwb3J0ZWQuXG4gICAqXG4gICAqIFRoaXMgbWFwcGluZyBpcyBhIGJlc3QgZ3Vlc3MgYmV0d2VlbiBkZWNsYXJhdGlvbnMgdGhhdCBoYXBwZW4gdG8gYmUgZXhwb3J0ZWQgZnJvbSB0aGVpciBmaWxlIGJ5XG4gICAqIHRoZSBzYW1lIG5hbWUgaW4gYm90aCB0aGUgc291cmNlIGFuZCB0aGUgZHRzIGZpbGUuIE5vdGUgdGhhdCBieSBkZWZpbml0aW9uIHRoZSBrZXkgYW5kIHZhbHVlXG4gICAqIGRlY2xhcmF0aW9ucyB3aWxsIG5vdCBiZSBpbiB0aGUgc2FtZSBUUyBwcm9ncmFtLlxuICAgKi9cbiAgcHJvdGVjdGVkIHByaXZhdGVEdHNEZWNsYXJhdGlvbk1hcDogTWFwPHRzLkRlY2xhcmF0aW9uLCB0cy5EZWNsYXJhdGlvbj58bnVsbCA9IG51bGw7XG5cbiAgLyoqXG4gICAqIFRoZSBzZXQgb2Ygc291cmNlIGZpbGVzIHRoYXQgaGF2ZSBhbHJlYWR5IGJlZW4gcHJlcHJvY2Vzc2VkLlxuICAgKi9cbiAgcHJvdGVjdGVkIHByZXByb2Nlc3NlZFNvdXJjZUZpbGVzID0gbmV3IFNldDx0cy5Tb3VyY2VGaWxlPigpO1xuXG4gIC8qKlxuICAgKiBJbiBFUzIwMTUsIGNsYXNzIGRlY2xhcmF0aW9ucyBtYXkgaGF2ZSBiZWVuIGRvd24tbGV2ZWxlZCBpbnRvIHZhcmlhYmxlIGRlY2xhcmF0aW9ucyxcbiAgICogaW5pdGlhbGl6ZWQgdXNpbmcgYSBjbGFzcyBleHByZXNzaW9uLiBJbiBjZXJ0YWluIHNjZW5hcmlvcywgYW4gYWRkaXRpb25hbCB2YXJpYWJsZVxuICAgKiBpcyBpbnRyb2R1Y2VkIHRoYXQgcmVwcmVzZW50cyB0aGUgY2xhc3Mgc28gdGhhdCByZXN1bHRzIGluIGNvZGUgc3VjaCBhczpcbiAgICpcbiAgICogYGBgXG4gICAqIGxldCBNeUNsYXNzXzE7IGxldCBNeUNsYXNzID0gTXlDbGFzc18xID0gY2xhc3MgTXlDbGFzcyB7fTtcbiAgICogYGBgXG4gICAqXG4gICAqIFRoaXMgbWFwIHRyYWNrcyB0aG9zZSBhbGlhc2VkIHZhcmlhYmxlcyB0byB0aGVpciBvcmlnaW5hbCBpZGVudGlmaWVyLCBpLmUuIHRoZSBrZXlcbiAgICogY29ycmVzcG9uZHMgd2l0aCB0aGUgZGVjbGFyYXRpb24gb2YgYE15Q2xhc3NfMWAgYW5kIGl0cyB2YWx1ZSBiZWNvbWVzIHRoZSBgTXlDbGFzc2AgaWRlbnRpZmllclxuICAgKiBvZiB0aGUgdmFyaWFibGUgZGVjbGFyYXRpb24uXG4gICAqXG4gICAqIFRoaXMgbWFwIGlzIHBvcHVsYXRlZCBkdXJpbmcgdGhlIHByZXByb2Nlc3Npbmcgb2YgZWFjaCBzb3VyY2UgZmlsZS5cbiAgICovXG4gIHByb3RlY3RlZCBhbGlhc2VkQ2xhc3NEZWNsYXJhdGlvbnMgPSBuZXcgTWFwPHRzLkRlY2xhcmF0aW9uLCB0cy5JZGVudGlmaWVyPigpO1xuXG4gIC8qKlxuICAgKiBDYWNoZXMgdGhlIGluZm9ybWF0aW9uIG9mIHRoZSBkZWNvcmF0b3JzIG9uIGEgY2xhc3MsIGFzIHRoZSB3b3JrIGludm9sdmVkIHdpdGggZXh0cmFjdGluZ1xuICAgKiBkZWNvcmF0b3JzIGlzIGNvbXBsZXggYW5kIGZyZXF1ZW50bHkgdXNlZC5cbiAgICpcbiAgICogVGhpcyBtYXAgaXMgbGF6aWx5IHBvcHVsYXRlZCBkdXJpbmcgdGhlIGZpcnN0IGNhbGwgdG8gYGFjcXVpcmVEZWNvcmF0b3JJbmZvYCBmb3IgYSBnaXZlbiBjbGFzcy5cbiAgICovXG4gIHByb3RlY3RlZCBkZWNvcmF0b3JDYWNoZSA9IG5ldyBNYXA8Q2xhc3NEZWNsYXJhdGlvbiwgRGVjb3JhdG9ySW5mbz4oKTtcblxuICBjb25zdHJ1Y3RvcihcbiAgICAgIHByb3RlY3RlZCBsb2dnZXI6IExvZ2dlciwgcHJvdGVjdGVkIGlzQ29yZTogYm9vbGVhbiwgcHJvdGVjdGVkIHNyYzogQnVuZGxlUHJvZ3JhbSxcbiAgICAgIHByb3RlY3RlZCBkdHM6IEJ1bmRsZVByb2dyYW18bnVsbCA9IG51bGwpIHtcbiAgICBzdXBlcihzcmMucHJvZ3JhbS5nZXRUeXBlQ2hlY2tlcigpKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBGaW5kIGEgc3ltYm9sIGZvciBhIG5vZGUgdGhhdCB3ZSB0aGluayBpcyBhIGNsYXNzLlxuICAgKiBDbGFzc2VzIHNob3VsZCBoYXZlIGEgYG5hbWVgIGlkZW50aWZpZXIsIGJlY2F1c2UgdGhleSBtYXkgbmVlZCB0byBiZSByZWZlcmVuY2VkIGluIG90aGVyIHBhcnRzXG4gICAqIG9mIHRoZSBwcm9ncmFtLlxuICAgKlxuICAgKiBJbiBFUzIwMTUsIGEgY2xhc3MgbWF5IGJlIGRlY2xhcmVkIHVzaW5nIGEgdmFyaWFibGUgZGVjbGFyYXRpb24gb2YgdGhlIGZvbGxvd2luZyBzdHJ1Y3R1cmU6XG4gICAqXG4gICAqIGBgYFxuICAgKiB2YXIgTXlDbGFzcyA9IE15Q2xhc3NfMSA9IGNsYXNzIE15Q2xhc3Mge307XG4gICAqIGBgYFxuICAgKlxuICAgKiBIZXJlLCB0aGUgaW50ZXJtZWRpYXRlIGBNeUNsYXNzXzFgIGFzc2lnbm1lbnQgaXMgb3B0aW9uYWwuIEluIHRoZSBhYm92ZSBleGFtcGxlLCB0aGVcbiAgICogYGNsYXNzIE15Q2xhc3Mge31gIG5vZGUgaXMgcmV0dXJuZWQgYXMgZGVjbGFyYXRpb24gb2YgYE15Q2xhc3NgLlxuICAgKlxuICAgKiBAcGFyYW0gZGVjbGFyYXRpb24gdGhlIGRlY2xhcmF0aW9uIG5vZGUgd2hvc2Ugc3ltYm9sIHdlIGFyZSBmaW5kaW5nLlxuICAgKiBAcmV0dXJucyB0aGUgc3ltYm9sIGZvciB0aGUgbm9kZSBvciBgdW5kZWZpbmVkYCBpZiBpdCBpcyBub3QgYSBcImNsYXNzXCIgb3IgaGFzIG5vIHN5bWJvbC5cbiAgICovXG4gIGdldENsYXNzU3ltYm9sKGRlY2xhcmF0aW9uOiB0cy5Ob2RlKTogTmdjY0NsYXNzU3ltYm9sfHVuZGVmaW5lZCB7XG4gICAgY29uc3Qgc3ltYm9sID0gdGhpcy5nZXRDbGFzc1N5bWJvbEZyb21PdXRlckRlY2xhcmF0aW9uKGRlY2xhcmF0aW9uKTtcbiAgICBpZiAoc3ltYm9sICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIHJldHVybiBzeW1ib2w7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMuZ2V0Q2xhc3NTeW1ib2xGcm9tSW5uZXJEZWNsYXJhdGlvbihkZWNsYXJhdGlvbik7XG4gIH1cblxuICAvKipcbiAgICogSW4gRVMyMDE1LCBhIGNsYXNzIG1heSBiZSBkZWNsYXJlZCB1c2luZyBhIHZhcmlhYmxlIGRlY2xhcmF0aW9uIG9mIHRoZSBmb2xsb3dpbmcgc3RydWN0dXJlOlxuICAgKlxuICAgKiBgYGBcbiAgICogdmFyIE15Q2xhc3MgPSBNeUNsYXNzXzEgPSBjbGFzcyBNeUNsYXNzIHt9O1xuICAgKiBgYGBcbiAgICpcbiAgICogVGhpcyBtZXRob2QgZXh0cmFjdHMgdGhlIGBOZ2NjQ2xhc3NTeW1ib2xgIGZvciBgTXlDbGFzc2Agd2hlbiBwcm92aWRlZCB3aXRoIHRoZSBgdmFyIE15Q2xhc3NgXG4gICAqIGRlY2xhcmF0aW9uIG5vZGUuIFdoZW4gdGhlIGBjbGFzcyBNeUNsYXNzIHt9YCBub2RlIG9yIGFueSBvdGhlciBub2RlIGlzIGdpdmVuLCB0aGlzIG1ldGhvZCB3aWxsXG4gICAqIHJldHVybiB1bmRlZmluZWQgaW5zdGVhZC5cbiAgICpcbiAgICogQHBhcmFtIGRlY2xhcmF0aW9uIHRoZSBkZWNsYXJhdGlvbiB3aG9zZSBzeW1ib2wgd2UgYXJlIGZpbmRpbmcuXG4gICAqIEByZXR1cm5zIHRoZSBzeW1ib2wgZm9yIHRoZSBub2RlIG9yIGB1bmRlZmluZWRgIGlmIGl0IGRvZXMgbm90IHJlcHJlc2VudCBhbiBvdXRlciBkZWNsYXJhdGlvblxuICAgKiBvZiBhIGNsYXNzLlxuICAgKi9cbiAgcHJvdGVjdGVkIGdldENsYXNzU3ltYm9sRnJvbU91dGVyRGVjbGFyYXRpb24oZGVjbGFyYXRpb246IHRzLk5vZGUpOiBOZ2NjQ2xhc3NTeW1ib2x8dW5kZWZpbmVkIHtcbiAgICAvLyBDcmVhdGUgYSBzeW1ib2wgd2l0aG91dCBpbm5lciBkZWNsYXJhdGlvbiBpZiB0aGUgZGVjbGFyYXRpb24gaXMgYSByZWd1bGFyIGNsYXNzIGRlY2xhcmF0aW9uLlxuICAgIGlmICh0cy5pc0NsYXNzRGVjbGFyYXRpb24oZGVjbGFyYXRpb24pICYmIGhhc05hbWVJZGVudGlmaWVyKGRlY2xhcmF0aW9uKSkge1xuICAgICAgcmV0dXJuIHRoaXMuY3JlYXRlQ2xhc3NTeW1ib2woZGVjbGFyYXRpb24sIG51bGwpO1xuICAgIH1cblxuICAgIC8vIE90aGVyd2lzZSwgdGhlIGRlY2xhcmF0aW9uIG1heSBiZSBhIHZhcmlhYmxlIGRlY2xhcmF0aW9uLCBpbiB3aGljaCBjYXNlIGl0IG11c3QgYmVcbiAgICAvLyBpbml0aWFsaXplZCB1c2luZyBhIGNsYXNzIGV4cHJlc3Npb24gYXMgaW5uZXIgZGVjbGFyYXRpb24uXG4gICAgaWYgKHRzLmlzVmFyaWFibGVEZWNsYXJhdGlvbihkZWNsYXJhdGlvbikgJiYgaGFzTmFtZUlkZW50aWZpZXIoZGVjbGFyYXRpb24pKSB7XG4gICAgICBjb25zdCBpbm5lckRlY2xhcmF0aW9uID0gZ2V0SW5uZXJDbGFzc0RlY2xhcmF0aW9uKGRlY2xhcmF0aW9uKTtcbiAgICAgIGlmIChpbm5lckRlY2xhcmF0aW9uICE9PSBudWxsKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmNyZWF0ZUNsYXNzU3ltYm9sKGRlY2xhcmF0aW9uLCBpbm5lckRlY2xhcmF0aW9uKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gdW5kZWZpbmVkO1xuICB9XG5cbiAgLyoqXG4gICAqIEluIEVTMjAxNSwgYSBjbGFzcyBtYXkgYmUgZGVjbGFyZWQgdXNpbmcgYSB2YXJpYWJsZSBkZWNsYXJhdGlvbiBvZiB0aGUgZm9sbG93aW5nIHN0cnVjdHVyZTpcbiAgICpcbiAgICogYGBgXG4gICAqIHZhciBNeUNsYXNzID0gTXlDbGFzc18xID0gY2xhc3MgTXlDbGFzcyB7fTtcbiAgICogYGBgXG4gICAqXG4gICAqIFRoaXMgbWV0aG9kIGV4dHJhY3RzIHRoZSBgTmdjY0NsYXNzU3ltYm9sYCBmb3IgYE15Q2xhc3NgIHdoZW4gcHJvdmlkZWQgd2l0aCB0aGVcbiAgICogYGNsYXNzIE15Q2xhc3Mge31gIGRlY2xhcmF0aW9uIG5vZGUuIFdoZW4gdGhlIGB2YXIgTXlDbGFzc2Agbm9kZSBvciBhbnkgb3RoZXIgbm9kZSBpcyBnaXZlbixcbiAgICogdGhpcyBtZXRob2Qgd2lsbCByZXR1cm4gdW5kZWZpbmVkIGluc3RlYWQuXG4gICAqXG4gICAqIEBwYXJhbSBkZWNsYXJhdGlvbiB0aGUgZGVjbGFyYXRpb24gd2hvc2Ugc3ltYm9sIHdlIGFyZSBmaW5kaW5nLlxuICAgKiBAcmV0dXJucyB0aGUgc3ltYm9sIGZvciB0aGUgbm9kZSBvciBgdW5kZWZpbmVkYCBpZiBpdCBkb2VzIG5vdCByZXByZXNlbnQgYW4gaW5uZXIgZGVjbGFyYXRpb25cbiAgICogb2YgYSBjbGFzcy5cbiAgICovXG4gIHByb3RlY3RlZCBnZXRDbGFzc1N5bWJvbEZyb21Jbm5lckRlY2xhcmF0aW9uKGRlY2xhcmF0aW9uOiB0cy5Ob2RlKTogTmdjY0NsYXNzU3ltYm9sfHVuZGVmaW5lZCB7XG4gICAgaWYgKCF0cy5pc0NsYXNzRXhwcmVzc2lvbihkZWNsYXJhdGlvbikgfHwgIWhhc05hbWVJZGVudGlmaWVyKGRlY2xhcmF0aW9uKSkge1xuICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICB9XG5cbiAgICBjb25zdCBvdXRlckRlY2xhcmF0aW9uID0gZ2V0VmFyaWFibGVEZWNsYXJhdGlvbk9mRGVjbGFyYXRpb24oZGVjbGFyYXRpb24pO1xuICAgIGlmIChvdXRlckRlY2xhcmF0aW9uID09PSB1bmRlZmluZWQgfHwgIWhhc05hbWVJZGVudGlmaWVyKG91dGVyRGVjbGFyYXRpb24pKSB7XG4gICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzLmNyZWF0ZUNsYXNzU3ltYm9sKG91dGVyRGVjbGFyYXRpb24sIGRlY2xhcmF0aW9uKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDcmVhdGVzIGFuIGBOZ2NjQ2xhc3NTeW1ib2xgIGZyb20gYW4gb3V0ZXIgYW5kIGlubmVyIGRlY2xhcmF0aW9uLiBJZiBhIGNsYXNzIG9ubHkgaGFzIGFuIG91dGVyXG4gICAqIGRlY2xhcmF0aW9uLCB0aGUgXCJpbXBsZW1lbnRhdGlvblwiIHN5bWJvbCBvZiB0aGUgY3JlYXRlZCBgTmdjY0NsYXNzU3ltYm9sYCB3aWxsIGJlIHNldCBlcXVhbCB0b1xuICAgKiB0aGUgXCJkZWNsYXJhdGlvblwiIHN5bWJvbC5cbiAgICpcbiAgICogQHBhcmFtIG91dGVyRGVjbGFyYXRpb24gVGhlIG91dGVyIGRlY2xhcmF0aW9uIG5vZGUgb2YgdGhlIGNsYXNzLlxuICAgKiBAcGFyYW0gaW5uZXJEZWNsYXJhdGlvbiBUaGUgaW5uZXIgZGVjbGFyYXRpb24gbm9kZSBvZiB0aGUgY2xhc3MsIG9yIHVuZGVmaW5lZCBpZiBubyBpbm5lclxuICAgKiBkZWNsYXJhdGlvbiBpcyBwcmVzZW50LlxuICAgKiBAcmV0dXJucyB0aGUgYE5nY2NDbGFzc1N5bWJvbGAgcmVwcmVzZW50aW5nIHRoZSBjbGFzcywgb3IgdW5kZWZpbmVkIGlmIGEgYHRzLlN5bWJvbGAgZm9yIGFueSBvZlxuICAgKiB0aGUgZGVjbGFyYXRpb25zIGNvdWxkIG5vdCBiZSByZXNvbHZlZC5cbiAgICovXG4gIHByb3RlY3RlZCBjcmVhdGVDbGFzc1N5bWJvbChcbiAgICAgIG91dGVyRGVjbGFyYXRpb246IENsYXNzRGVjbGFyYXRpb24sIGlubmVyRGVjbGFyYXRpb246IENsYXNzRGVjbGFyYXRpb258bnVsbCk6IE5nY2NDbGFzc1N5bWJvbFxuICAgICAgfHVuZGVmaW5lZCB7XG4gICAgY29uc3QgZGVjbGFyYXRpb25TeW1ib2wgPVxuICAgICAgICB0aGlzLmNoZWNrZXIuZ2V0U3ltYm9sQXRMb2NhdGlvbihvdXRlckRlY2xhcmF0aW9uLm5hbWUpIGFzIENsYXNzU3ltYm9sIHwgdW5kZWZpbmVkO1xuICAgIGlmIChkZWNsYXJhdGlvblN5bWJvbCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIH1cblxuICAgIGNvbnN0IGltcGxlbWVudGF0aW9uU3ltYm9sID0gaW5uZXJEZWNsYXJhdGlvbiAhPT0gbnVsbCA/XG4gICAgICAgIHRoaXMuY2hlY2tlci5nZXRTeW1ib2xBdExvY2F0aW9uKGlubmVyRGVjbGFyYXRpb24ubmFtZSkgOlxuICAgICAgICBkZWNsYXJhdGlvblN5bWJvbDtcbiAgICBpZiAoaW1wbGVtZW50YXRpb25TeW1ib2wgPT09IHVuZGVmaW5lZCkge1xuICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICB9XG5cbiAgICByZXR1cm4ge1xuICAgICAgbmFtZTogZGVjbGFyYXRpb25TeW1ib2wubmFtZSxcbiAgICAgIGRlY2xhcmF0aW9uOiBkZWNsYXJhdGlvblN5bWJvbCxcbiAgICAgIGltcGxlbWVudGF0aW9uOiBpbXBsZW1lbnRhdGlvblN5bWJvbCxcbiAgICB9O1xuICB9XG5cbiAgLyoqXG4gICAqIEV4YW1pbmUgYSBkZWNsYXJhdGlvbiAoZm9yIGV4YW1wbGUsIG9mIGEgY2xhc3Mgb3IgZnVuY3Rpb24pIGFuZCByZXR1cm4gbWV0YWRhdGEgYWJvdXQgYW55XG4gICAqIGRlY29yYXRvcnMgcHJlc2VudCBvbiB0aGUgZGVjbGFyYXRpb24uXG4gICAqXG4gICAqIEBwYXJhbSBkZWNsYXJhdGlvbiBhIFR5cGVTY3JpcHQgYHRzLkRlY2xhcmF0aW9uYCBub2RlIHJlcHJlc2VudGluZyB0aGUgY2xhc3Mgb3IgZnVuY3Rpb24gb3ZlclxuICAgKiB3aGljaCB0byByZWZsZWN0LiBGb3IgZXhhbXBsZSwgaWYgdGhlIGludGVudCBpcyB0byByZWZsZWN0IHRoZSBkZWNvcmF0b3JzIG9mIGEgY2xhc3MgYW5kIHRoZVxuICAgKiBzb3VyY2UgaXMgaW4gRVM2IGZvcm1hdCwgdGhpcyB3aWxsIGJlIGEgYHRzLkNsYXNzRGVjbGFyYXRpb25gIG5vZGUuIElmIHRoZSBzb3VyY2UgaXMgaW4gRVM1XG4gICAqIGZvcm1hdCwgdGhpcyBtaWdodCBiZSBhIGB0cy5WYXJpYWJsZURlY2xhcmF0aW9uYCBhcyBjbGFzc2VzIGluIEVTNSBhcmUgcmVwcmVzZW50ZWQgYXMgdGhlXG4gICAqIHJlc3VsdCBvZiBhbiBJSUZFIGV4ZWN1dGlvbi5cbiAgICpcbiAgICogQHJldHVybnMgYW4gYXJyYXkgb2YgYERlY29yYXRvcmAgbWV0YWRhdGEgaWYgZGVjb3JhdG9ycyBhcmUgcHJlc2VudCBvbiB0aGUgZGVjbGFyYXRpb24sIG9yXG4gICAqIGBudWxsYCBpZiBlaXRoZXIgbm8gZGVjb3JhdG9ycyB3ZXJlIHByZXNlbnQgb3IgaWYgdGhlIGRlY2xhcmF0aW9uIGlzIG5vdCBvZiBhIGRlY29yYXRhYmxlIHR5cGUuXG4gICAqL1xuICBnZXREZWNvcmF0b3JzT2ZEZWNsYXJhdGlvbihkZWNsYXJhdGlvbjogdHMuRGVjbGFyYXRpb24pOiBEZWNvcmF0b3JbXXxudWxsIHtcbiAgICBjb25zdCBzeW1ib2wgPSB0aGlzLmdldENsYXNzU3ltYm9sKGRlY2xhcmF0aW9uKTtcbiAgICBpZiAoIXN5bWJvbCkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLmdldERlY29yYXRvcnNPZlN5bWJvbChzeW1ib2wpO1xuICB9XG5cbiAgLyoqXG4gICAqIEV4YW1pbmUgYSBkZWNsYXJhdGlvbiB3aGljaCBzaG91bGQgYmUgb2YgYSBjbGFzcywgYW5kIHJldHVybiBtZXRhZGF0YSBhYm91dCB0aGUgbWVtYmVycyBvZiB0aGVcbiAgICogY2xhc3MuXG4gICAqXG4gICAqIEBwYXJhbSBjbGF6eiBhIGBDbGFzc0RlY2xhcmF0aW9uYCByZXByZXNlbnRpbmcgdGhlIGNsYXNzIG92ZXIgd2hpY2ggdG8gcmVmbGVjdC5cbiAgICpcbiAgICogQHJldHVybnMgYW4gYXJyYXkgb2YgYENsYXNzTWVtYmVyYCBtZXRhZGF0YSByZXByZXNlbnRpbmcgdGhlIG1lbWJlcnMgb2YgdGhlIGNsYXNzLlxuICAgKlxuICAgKiBAdGhyb3dzIGlmIGBkZWNsYXJhdGlvbmAgZG9lcyBub3QgcmVzb2x2ZSB0byBhIGNsYXNzIGRlY2xhcmF0aW9uLlxuICAgKi9cbiAgZ2V0TWVtYmVyc09mQ2xhc3MoY2xheno6IENsYXNzRGVjbGFyYXRpb24pOiBDbGFzc01lbWJlcltdIHtcbiAgICBjb25zdCBjbGFzc1N5bWJvbCA9IHRoaXMuZ2V0Q2xhc3NTeW1ib2woY2xhenopO1xuICAgIGlmICghY2xhc3NTeW1ib2wpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgQXR0ZW1wdGVkIHRvIGdldCBtZW1iZXJzIG9mIGEgbm9uLWNsYXNzOiBcIiR7Y2xhenouZ2V0VGV4dCgpfVwiYCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMuZ2V0TWVtYmVyc09mU3ltYm9sKGNsYXNzU3ltYm9sKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZWZsZWN0IG92ZXIgdGhlIGNvbnN0cnVjdG9yIG9mIGEgY2xhc3MgYW5kIHJldHVybiBtZXRhZGF0YSBhYm91dCBpdHMgcGFyYW1ldGVycy5cbiAgICpcbiAgICogVGhpcyBtZXRob2Qgb25seSBsb29rcyBhdCB0aGUgY29uc3RydWN0b3Igb2YgYSBjbGFzcyBkaXJlY3RseSBhbmQgbm90IGF0IGFueSBpbmhlcml0ZWRcbiAgICogY29uc3RydWN0b3JzLlxuICAgKlxuICAgKiBAcGFyYW0gY2xhenogYSBgQ2xhc3NEZWNsYXJhdGlvbmAgcmVwcmVzZW50aW5nIHRoZSBjbGFzcyBvdmVyIHdoaWNoIHRvIHJlZmxlY3QuXG4gICAqXG4gICAqIEByZXR1cm5zIGFuIGFycmF5IG9mIGBQYXJhbWV0ZXJgIG1ldGFkYXRhIHJlcHJlc2VudGluZyB0aGUgcGFyYW1ldGVycyBvZiB0aGUgY29uc3RydWN0b3IsIGlmXG4gICAqIGEgY29uc3RydWN0b3IgZXhpc3RzLiBJZiB0aGUgY29uc3RydWN0b3IgZXhpc3RzIGFuZCBoYXMgMCBwYXJhbWV0ZXJzLCB0aGlzIGFycmF5IHdpbGwgYmUgZW1wdHkuXG4gICAqIElmIHRoZSBjbGFzcyBoYXMgbm8gY29uc3RydWN0b3IsIHRoaXMgbWV0aG9kIHJldHVybnMgYG51bGxgLlxuICAgKlxuICAgKiBAdGhyb3dzIGlmIGBkZWNsYXJhdGlvbmAgZG9lcyBub3QgcmVzb2x2ZSB0byBhIGNsYXNzIGRlY2xhcmF0aW9uLlxuICAgKi9cbiAgZ2V0Q29uc3RydWN0b3JQYXJhbWV0ZXJzKGNsYXp6OiBDbGFzc0RlY2xhcmF0aW9uKTogQ3RvclBhcmFtZXRlcltdfG51bGwge1xuICAgIGNvbnN0IGNsYXNzU3ltYm9sID0gdGhpcy5nZXRDbGFzc1N5bWJvbChjbGF6eik7XG4gICAgaWYgKCFjbGFzc1N5bWJvbCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgIGBBdHRlbXB0ZWQgdG8gZ2V0IGNvbnN0cnVjdG9yIHBhcmFtZXRlcnMgb2YgYSBub24tY2xhc3M6IFwiJHtjbGF6ei5nZXRUZXh0KCl9XCJgKTtcbiAgICB9XG4gICAgY29uc3QgcGFyYW1ldGVyTm9kZXMgPSB0aGlzLmdldENvbnN0cnVjdG9yUGFyYW1ldGVyRGVjbGFyYXRpb25zKGNsYXNzU3ltYm9sKTtcbiAgICBpZiAocGFyYW1ldGVyTm9kZXMpIHtcbiAgICAgIHJldHVybiB0aGlzLmdldENvbnN0cnVjdG9yUGFyYW1JbmZvKGNsYXNzU3ltYm9sLCBwYXJhbWV0ZXJOb2Rlcyk7XG4gICAgfVxuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgaGFzQmFzZUNsYXNzKGNsYXp6OiBDbGFzc0RlY2xhcmF0aW9uKTogYm9vbGVhbiB7XG4gICAgY29uc3Qgc3VwZXJIYXNCYXNlQ2xhc3MgPSBzdXBlci5oYXNCYXNlQ2xhc3MoY2xhenopO1xuICAgIGlmIChzdXBlckhhc0Jhc2VDbGFzcykge1xuICAgICAgcmV0dXJuIHN1cGVySGFzQmFzZUNsYXNzO1xuICAgIH1cblxuICAgIGNvbnN0IGlubmVyQ2xhc3NEZWNsYXJhdGlvbiA9IGdldElubmVyQ2xhc3NEZWNsYXJhdGlvbihjbGF6eik7XG4gICAgaWYgKGlubmVyQ2xhc3NEZWNsYXJhdGlvbiA9PT0gbnVsbCkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIHJldHVybiBzdXBlci5oYXNCYXNlQ2xhc3MoaW5uZXJDbGFzc0RlY2xhcmF0aW9uKTtcbiAgfVxuXG4gIGdldEJhc2VDbGFzc0V4cHJlc3Npb24oY2xheno6IENsYXNzRGVjbGFyYXRpb24pOiB0cy5FeHByZXNzaW9ufG51bGwge1xuICAgIC8vIEZpcnN0IHRyeSBnZXR0aW5nIHRoZSBiYXNlIGNsYXNzIGZyb20gdGhlIFwib3V0ZXJcIiBkZWNsYXJhdGlvblxuICAgIGNvbnN0IHN1cGVyQmFzZUNsYXNzSWRlbnRpZmllciA9IHN1cGVyLmdldEJhc2VDbGFzc0V4cHJlc3Npb24oY2xhenopO1xuICAgIGlmIChzdXBlckJhc2VDbGFzc0lkZW50aWZpZXIpIHtcbiAgICAgIHJldHVybiBzdXBlckJhc2VDbGFzc0lkZW50aWZpZXI7XG4gICAgfVxuICAgIC8vIFRoYXQgZGlkbid0IHdvcmsgc28gbm93IHRyeSBnZXR0aW5nIGl0IGZyb20gdGhlIFwiaW5uZXJcIiBkZWNsYXJhdGlvbi5cbiAgICBjb25zdCBpbm5lckNsYXNzRGVjbGFyYXRpb24gPSBnZXRJbm5lckNsYXNzRGVjbGFyYXRpb24oY2xhenopO1xuICAgIGlmIChpbm5lckNsYXNzRGVjbGFyYXRpb24gPT09IG51bGwpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICByZXR1cm4gc3VwZXIuZ2V0QmFzZUNsYXNzRXhwcmVzc2lvbihpbm5lckNsYXNzRGVjbGFyYXRpb24pO1xuICB9XG5cbiAgLyoqXG4gICAqIENoZWNrIHdoZXRoZXIgdGhlIGdpdmVuIG5vZGUgYWN0dWFsbHkgcmVwcmVzZW50cyBhIGNsYXNzLlxuICAgKi9cbiAgaXNDbGFzcyhub2RlOiB0cy5Ob2RlKTogbm9kZSBpcyBDbGFzc0RlY2xhcmF0aW9uIHtcbiAgICByZXR1cm4gc3VwZXIuaXNDbGFzcyhub2RlKSB8fCB0aGlzLmdldENsYXNzU3ltYm9sKG5vZGUpICE9PSB1bmRlZmluZWQ7XG4gIH1cblxuICAvKipcbiAgICogVHJhY2UgYW4gaWRlbnRpZmllciB0byBpdHMgZGVjbGFyYXRpb24sIGlmIHBvc3NpYmxlLlxuICAgKlxuICAgKiBUaGlzIG1ldGhvZCBhdHRlbXB0cyB0byByZXNvbHZlIHRoZSBkZWNsYXJhdGlvbiBvZiB0aGUgZ2l2ZW4gaWRlbnRpZmllciwgdHJhY2luZyBiYWNrIHRocm91Z2hcbiAgICogaW1wb3J0cyBhbmQgcmUtZXhwb3J0cyB1bnRpbCB0aGUgb3JpZ2luYWwgZGVjbGFyYXRpb24gc3RhdGVtZW50IGlzIGZvdW5kLiBBIGBEZWNsYXJhdGlvbmBcbiAgICogb2JqZWN0IGlzIHJldHVybmVkIGlmIHRoZSBvcmlnaW5hbCBkZWNsYXJhdGlvbiBpcyBmb3VuZCwgb3IgYG51bGxgIGlzIHJldHVybmVkIG90aGVyd2lzZS5cbiAgICpcbiAgICogSW4gRVMyMDE1LCB3ZSBuZWVkIHRvIGFjY291bnQgZm9yIGlkZW50aWZpZXJzIHRoYXQgcmVmZXIgdG8gYWxpYXNlZCBjbGFzcyBkZWNsYXJhdGlvbnMgc3VjaCBhc1xuICAgKiBgTXlDbGFzc18xYC4gU2luY2Ugc3VjaCBkZWNsYXJhdGlvbnMgYXJlIG9ubHkgYXZhaWxhYmxlIHdpdGhpbiB0aGUgbW9kdWxlIGl0c2VsZiwgd2UgbmVlZCB0b1xuICAgKiBmaW5kIHRoZSBvcmlnaW5hbCBjbGFzcyBkZWNsYXJhdGlvbiwgZS5nLiBgTXlDbGFzc2AsIHRoYXQgaXMgYXNzb2NpYXRlZCB3aXRoIHRoZSBhbGlhc2VkIG9uZS5cbiAgICpcbiAgICogQHBhcmFtIGlkIGEgVHlwZVNjcmlwdCBgdHMuSWRlbnRpZmllcmAgdG8gdHJhY2UgYmFjayB0byBhIGRlY2xhcmF0aW9uLlxuICAgKlxuICAgKiBAcmV0dXJucyBtZXRhZGF0YSBhYm91dCB0aGUgYERlY2xhcmF0aW9uYCBpZiB0aGUgb3JpZ2luYWwgZGVjbGFyYXRpb24gaXMgZm91bmQsIG9yIGBudWxsYFxuICAgKiBvdGhlcndpc2UuXG4gICAqL1xuICBnZXREZWNsYXJhdGlvbk9mSWRlbnRpZmllcihpZDogdHMuSWRlbnRpZmllcik6IERlY2xhcmF0aW9ufG51bGwge1xuICAgIGNvbnN0IHN1cGVyRGVjbGFyYXRpb24gPSBzdXBlci5nZXREZWNsYXJhdGlvbk9mSWRlbnRpZmllcihpZCk7XG5cbiAgICAvLyBUaGUgaWRlbnRpZmllciBtYXkgaGF2ZSBiZWVuIG9mIGFuIGFkZGl0aW9uYWwgY2xhc3MgYXNzaWdubWVudCBzdWNoIGFzIGBNeUNsYXNzXzFgIHRoYXQgd2FzXG4gICAgLy8gcHJlc2VudCBhcyBhbGlhcyBmb3IgYE15Q2xhc3NgLiBJZiBzbywgcmVzb2x2ZSBzdWNoIGFsaWFzZXMgdG8gdGhlaXIgb3JpZ2luYWwgZGVjbGFyYXRpb24uXG4gICAgaWYgKHN1cGVyRGVjbGFyYXRpb24gIT09IG51bGwgJiYgc3VwZXJEZWNsYXJhdGlvbi5ub2RlICE9PSBudWxsKSB7XG4gICAgICBjb25zdCBhbGlhc2VkSWRlbnRpZmllciA9IHRoaXMucmVzb2x2ZUFsaWFzZWRDbGFzc0lkZW50aWZpZXIoc3VwZXJEZWNsYXJhdGlvbi5ub2RlKTtcbiAgICAgIGlmIChhbGlhc2VkSWRlbnRpZmllciAhPT0gbnVsbCkge1xuICAgICAgICByZXR1cm4gdGhpcy5nZXREZWNsYXJhdGlvbk9mSWRlbnRpZmllcihhbGlhc2VkSWRlbnRpZmllcik7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gSWYgdGhlIGlkZW50aWZpZXIgcmVzb2x2ZXMgdG8gdGhlIGdsb2JhbCBKYXZhU2NyaXB0IGBPYmplY3RgLCByZXR1cm4gYVxuICAgIC8vIGRlY2xhcmF0aW9uIHRoYXQgZGVub3RlcyBpdCBhcyB0aGUga25vd24gYEpzR2xvYmFsT2JqZWN0YCBkZWNsYXJhdGlvbi5cbiAgICBpZiAoc3VwZXJEZWNsYXJhdGlvbiAhPT0gbnVsbCAmJiB0aGlzLmlzSmF2YVNjcmlwdE9iamVjdERlY2xhcmF0aW9uKHN1cGVyRGVjbGFyYXRpb24pKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBrbm93bjogS25vd25EZWNsYXJhdGlvbi5Kc0dsb2JhbE9iamVjdCxcbiAgICAgICAgZXhwcmVzc2lvbjogaWQsXG4gICAgICAgIHZpYU1vZHVsZTogbnVsbCxcbiAgICAgICAgbm9kZTogbnVsbCxcbiAgICAgIH07XG4gICAgfVxuXG4gICAgcmV0dXJuIHN1cGVyRGVjbGFyYXRpb247XG4gIH1cblxuICAvKipcbiAgICogR2V0cyBhbGwgZGVjb3JhdG9ycyBvZiB0aGUgZ2l2ZW4gY2xhc3Mgc3ltYm9sLiBBbnkgZGVjb3JhdG9yIHRoYXQgaGF2ZSBiZWVuIHN5bnRoZXRpY2FsbHlcbiAgICogaW5qZWN0ZWQgYnkgYSBtaWdyYXRpb24gd2lsbCBub3QgYmUgcHJlc2VudCBpbiB0aGUgcmV0dXJuZWQgY29sbGVjdGlvbi5cbiAgICovXG4gIGdldERlY29yYXRvcnNPZlN5bWJvbChzeW1ib2w6IE5nY2NDbGFzc1N5bWJvbCk6IERlY29yYXRvcltdfG51bGwge1xuICAgIGNvbnN0IHtjbGFzc0RlY29yYXRvcnN9ID0gdGhpcy5hY3F1aXJlRGVjb3JhdG9ySW5mbyhzeW1ib2wpO1xuICAgIGlmIChjbGFzc0RlY29yYXRvcnMgPT09IG51bGwpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIC8vIFJldHVybiBhIGNsb25lIG9mIHRoZSBhcnJheSB0byBwcmV2ZW50IGNvbnN1bWVycyBmcm9tIG11dGF0aW5nIHRoZSBjYWNoZS5cbiAgICByZXR1cm4gQXJyYXkuZnJvbShjbGFzc0RlY29yYXRvcnMpO1xuICB9XG5cbiAgLyoqXG4gICAqIFNlYXJjaCB0aGUgZ2l2ZW4gbW9kdWxlIGZvciB2YXJpYWJsZSBkZWNsYXJhdGlvbnMgaW4gd2hpY2ggdGhlIGluaXRpYWxpemVyXG4gICAqIGlzIGFuIGlkZW50aWZpZXIgbWFya2VkIHdpdGggdGhlIGBQUkVfUjNfTUFSS0VSYC5cbiAgICogQHBhcmFtIG1vZHVsZSB0aGUgbW9kdWxlIGluIHdoaWNoIHRvIHNlYXJjaCBmb3Igc3dpdGNoYWJsZSBkZWNsYXJhdGlvbnMuXG4gICAqIEByZXR1cm5zIGFuIGFycmF5IG9mIHZhcmlhYmxlIGRlY2xhcmF0aW9ucyB0aGF0IG1hdGNoLlxuICAgKi9cbiAgZ2V0U3dpdGNoYWJsZURlY2xhcmF0aW9ucyhtb2R1bGU6IHRzLk5vZGUpOiBTd2l0Y2hhYmxlVmFyaWFibGVEZWNsYXJhdGlvbltdIHtcbiAgICAvLyBEb24ndCBib3RoZXIgdG8gd2FsayB0aGUgQVNUIGlmIHRoZSBtYXJrZXIgaXMgbm90IGZvdW5kIGluIHRoZSB0ZXh0XG4gICAgcmV0dXJuIG1vZHVsZS5nZXRUZXh0KCkuaW5kZXhPZihQUkVfUjNfTUFSS0VSKSA+PSAwID9cbiAgICAgICAgZmluZEFsbChtb2R1bGUsIGlzU3dpdGNoYWJsZVZhcmlhYmxlRGVjbGFyYXRpb24pIDpcbiAgICAgICAgW107XG4gIH1cblxuICBnZXRWYXJpYWJsZVZhbHVlKGRlY2xhcmF0aW9uOiB0cy5WYXJpYWJsZURlY2xhcmF0aW9uKTogdHMuRXhwcmVzc2lvbnxudWxsIHtcbiAgICBjb25zdCB2YWx1ZSA9IHN1cGVyLmdldFZhcmlhYmxlVmFsdWUoZGVjbGFyYXRpb24pO1xuICAgIGlmICh2YWx1ZSkge1xuICAgICAgcmV0dXJuIHZhbHVlO1xuICAgIH1cblxuICAgIC8vIFdlIGhhdmUgYSB2YXJpYWJsZSBkZWNsYXJhdGlvbiB0aGF0IGhhcyBubyBpbml0aWFsaXplci4gRm9yIGV4YW1wbGU6XG4gICAgLy9cbiAgICAvLyBgYGBcbiAgICAvLyB2YXIgSHR0cENsaWVudFhzcmZNb2R1bGVfMTtcbiAgICAvLyBgYGBcbiAgICAvL1xuICAgIC8vIFNvIGxvb2sgZm9yIHRoZSBzcGVjaWFsIHNjZW5hcmlvIHdoZXJlIHRoZSB2YXJpYWJsZSBpcyBiZWluZyBhc3NpZ25lZCBpblxuICAgIC8vIGEgbmVhcmJ5IHN0YXRlbWVudCB0byB0aGUgcmV0dXJuIHZhbHVlIG9mIGEgY2FsbCB0byBgX19kZWNvcmF0ZWAuXG4gICAgLy8gVGhlbiBmaW5kIHRoZSAybmQgYXJndW1lbnQgb2YgdGhhdCBjYWxsLCB0aGUgXCJ0YXJnZXRcIiwgd2hpY2ggd2lsbCBiZSB0aGVcbiAgICAvLyBhY3R1YWwgY2xhc3MgaWRlbnRpZmllci4gRm9yIGV4YW1wbGU6XG4gICAgLy9cbiAgICAvLyBgYGBcbiAgICAvLyBIdHRwQ2xpZW50WHNyZk1vZHVsZSA9IEh0dHBDbGllbnRYc3JmTW9kdWxlXzEgPSB0c2xpYl8xLl9fZGVjb3JhdGUoW1xuICAgIC8vICAgTmdNb2R1bGUoe1xuICAgIC8vICAgICBwcm92aWRlcnM6IFtdLFxuICAgIC8vICAgfSlcbiAgICAvLyBdLCBIdHRwQ2xpZW50WHNyZk1vZHVsZSk7XG4gICAgLy8gYGBgXG4gICAgLy9cbiAgICAvLyBBbmQgZmluYWxseSwgZmluZCB0aGUgZGVjbGFyYXRpb24gb2YgdGhlIGlkZW50aWZpZXIgaW4gdGhhdCBhcmd1bWVudC5cbiAgICAvLyBOb3RlIGFsc28gdGhhdCB0aGUgYXNzaWdubWVudCBjYW4gb2NjdXIgd2l0aGluIGFub3RoZXIgYXNzaWdubWVudC5cbiAgICAvL1xuICAgIGNvbnN0IGJsb2NrID0gZGVjbGFyYXRpb24ucGFyZW50LnBhcmVudC5wYXJlbnQ7XG4gICAgY29uc3Qgc3ltYm9sID0gdGhpcy5jaGVja2VyLmdldFN5bWJvbEF0TG9jYXRpb24oZGVjbGFyYXRpb24ubmFtZSk7XG4gICAgaWYgKHN5bWJvbCAmJiAodHMuaXNCbG9jayhibG9jaykgfHwgdHMuaXNTb3VyY2VGaWxlKGJsb2NrKSkpIHtcbiAgICAgIGNvbnN0IGRlY29yYXRlQ2FsbCA9IHRoaXMuZmluZERlY29yYXRlZFZhcmlhYmxlVmFsdWUoYmxvY2ssIHN5bWJvbCk7XG4gICAgICBjb25zdCB0YXJnZXQgPSBkZWNvcmF0ZUNhbGwgJiYgZGVjb3JhdGVDYWxsLmFyZ3VtZW50c1sxXTtcbiAgICAgIGlmICh0YXJnZXQgJiYgdHMuaXNJZGVudGlmaWVyKHRhcmdldCkpIHtcbiAgICAgICAgY29uc3QgdGFyZ2V0U3ltYm9sID0gdGhpcy5jaGVja2VyLmdldFN5bWJvbEF0TG9jYXRpb24odGFyZ2V0KTtcbiAgICAgICAgY29uc3QgdGFyZ2V0RGVjbGFyYXRpb24gPSB0YXJnZXRTeW1ib2wgJiYgdGFyZ2V0U3ltYm9sLnZhbHVlRGVjbGFyYXRpb247XG4gICAgICAgIGlmICh0YXJnZXREZWNsYXJhdGlvbikge1xuICAgICAgICAgIGlmICh0cy5pc0NsYXNzRGVjbGFyYXRpb24odGFyZ2V0RGVjbGFyYXRpb24pIHx8XG4gICAgICAgICAgICAgIHRzLmlzRnVuY3Rpb25EZWNsYXJhdGlvbih0YXJnZXREZWNsYXJhdGlvbikpIHtcbiAgICAgICAgICAgIC8vIFRoZSB0YXJnZXQgaXMganVzdCBhIGZ1bmN0aW9uIG9yIGNsYXNzIGRlY2xhcmF0aW9uXG4gICAgICAgICAgICAvLyBzbyByZXR1cm4gaXRzIGlkZW50aWZpZXIgYXMgdGhlIHZhcmlhYmxlIHZhbHVlLlxuICAgICAgICAgICAgcmV0dXJuIHRhcmdldERlY2xhcmF0aW9uLm5hbWUgfHwgbnVsbDtcbiAgICAgICAgICB9IGVsc2UgaWYgKHRzLmlzVmFyaWFibGVEZWNsYXJhdGlvbih0YXJnZXREZWNsYXJhdGlvbikpIHtcbiAgICAgICAgICAgIC8vIFRoZSB0YXJnZXQgaXMgYSB2YXJpYWJsZSBkZWNsYXJhdGlvbiwgc28gZmluZCB0aGUgZmFyIHJpZ2h0IGV4cHJlc3Npb24sXG4gICAgICAgICAgICAvLyBpbiB0aGUgY2FzZSBvZiBtdWx0aXBsZSBhc3NpZ25tZW50cyAoZS5nLiBgdmFyMSA9IHZhcjIgPSB2YWx1ZWApLlxuICAgICAgICAgICAgbGV0IHRhcmdldFZhbHVlID0gdGFyZ2V0RGVjbGFyYXRpb24uaW5pdGlhbGl6ZXI7XG4gICAgICAgICAgICB3aGlsZSAodGFyZ2V0VmFsdWUgJiYgaXNBc3NpZ25tZW50KHRhcmdldFZhbHVlKSkge1xuICAgICAgICAgICAgICB0YXJnZXRWYWx1ZSA9IHRhcmdldFZhbHVlLnJpZ2h0O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHRhcmdldFZhbHVlKSB7XG4gICAgICAgICAgICAgIHJldHVybiB0YXJnZXRWYWx1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICAvKipcbiAgICogRmluZCBhbGwgdG9wLWxldmVsIGNsYXNzIHN5bWJvbHMgaW4gdGhlIGdpdmVuIGZpbGUuXG4gICAqIEBwYXJhbSBzb3VyY2VGaWxlIFRoZSBzb3VyY2UgZmlsZSB0byBzZWFyY2ggZm9yIGNsYXNzZXMuXG4gICAqIEByZXR1cm5zIEFuIGFycmF5IG9mIGNsYXNzIHN5bWJvbHMuXG4gICAqL1xuICBmaW5kQ2xhc3NTeW1ib2xzKHNvdXJjZUZpbGU6IHRzLlNvdXJjZUZpbGUpOiBOZ2NjQ2xhc3NTeW1ib2xbXSB7XG4gICAgY29uc3QgY2xhc3NlczogTmdjY0NsYXNzU3ltYm9sW10gPSBbXTtcbiAgICB0aGlzLmdldE1vZHVsZVN0YXRlbWVudHMoc291cmNlRmlsZSkuZm9yRWFjaChzdGF0ZW1lbnQgPT4ge1xuICAgICAgaWYgKHRzLmlzVmFyaWFibGVTdGF0ZW1lbnQoc3RhdGVtZW50KSkge1xuICAgICAgICBzdGF0ZW1lbnQuZGVjbGFyYXRpb25MaXN0LmRlY2xhcmF0aW9ucy5mb3JFYWNoKGRlY2xhcmF0aW9uID0+IHtcbiAgICAgICAgICBjb25zdCBjbGFzc1N5bWJvbCA9IHRoaXMuZ2V0Q2xhc3NTeW1ib2woZGVjbGFyYXRpb24pO1xuICAgICAgICAgIGlmIChjbGFzc1N5bWJvbCkge1xuICAgICAgICAgICAgY2xhc3Nlcy5wdXNoKGNsYXNzU3ltYm9sKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfSBlbHNlIGlmICh0cy5pc0NsYXNzRGVjbGFyYXRpb24oc3RhdGVtZW50KSkge1xuICAgICAgICBjb25zdCBjbGFzc1N5bWJvbCA9IHRoaXMuZ2V0Q2xhc3NTeW1ib2woc3RhdGVtZW50KTtcbiAgICAgICAgaWYgKGNsYXNzU3ltYm9sKSB7XG4gICAgICAgICAgY2xhc3Nlcy5wdXNoKGNsYXNzU3ltYm9sKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pO1xuICAgIHJldHVybiBjbGFzc2VzO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldCB0aGUgbnVtYmVyIG9mIGdlbmVyaWMgdHlwZSBwYXJhbWV0ZXJzIG9mIGEgZ2l2ZW4gY2xhc3MuXG4gICAqXG4gICAqIEBwYXJhbSBjbGF6eiBhIGBDbGFzc0RlY2xhcmF0aW9uYCByZXByZXNlbnRpbmcgdGhlIGNsYXNzIG92ZXIgd2hpY2ggdG8gcmVmbGVjdC5cbiAgICpcbiAgICogQHJldHVybnMgdGhlIG51bWJlciBvZiB0eXBlIHBhcmFtZXRlcnMgb2YgdGhlIGNsYXNzLCBpZiBrbm93biwgb3IgYG51bGxgIGlmIHRoZSBkZWNsYXJhdGlvblxuICAgKiBpcyBub3QgYSBjbGFzcyBvciBoYXMgYW4gdW5rbm93biBudW1iZXIgb2YgdHlwZSBwYXJhbWV0ZXJzLlxuICAgKi9cbiAgZ2V0R2VuZXJpY0FyaXR5T2ZDbGFzcyhjbGF6ejogQ2xhc3NEZWNsYXJhdGlvbik6IG51bWJlcnxudWxsIHtcbiAgICBjb25zdCBkdHNEZWNsYXJhdGlvbiA9IHRoaXMuZ2V0RHRzRGVjbGFyYXRpb24oY2xhenopO1xuICAgIGlmIChkdHNEZWNsYXJhdGlvbiAmJiB0cy5pc0NsYXNzRGVjbGFyYXRpb24oZHRzRGVjbGFyYXRpb24pKSB7XG4gICAgICByZXR1cm4gZHRzRGVjbGFyYXRpb24udHlwZVBhcmFtZXRlcnMgPyBkdHNEZWNsYXJhdGlvbi50eXBlUGFyYW1ldGVycy5sZW5ndGggOiAwO1xuICAgIH1cbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIC8qKlxuICAgKiBUYWtlIGFuIGV4cG9ydGVkIGRlY2xhcmF0aW9uIG9mIGEgY2xhc3MgKG1heWJlIGRvd24tbGV2ZWxlZCB0byBhIHZhcmlhYmxlKSBhbmQgbG9vayB1cCB0aGVcbiAgICogZGVjbGFyYXRpb24gb2YgaXRzIHR5cGUgaW4gYSBzZXBhcmF0ZSAuZC50cyB0cmVlLlxuICAgKlxuICAgKiBUaGlzIGZ1bmN0aW9uIGlzIGFsbG93ZWQgdG8gcmV0dXJuIGBudWxsYCBpZiB0aGUgY3VycmVudCBjb21waWxhdGlvbiB1bml0IGRvZXMgbm90IGhhdmUgYVxuICAgKiBzZXBhcmF0ZSAuZC50cyB0cmVlLiBXaGVuIGNvbXBpbGluZyBUeXBlU2NyaXB0IGNvZGUgdGhpcyBpcyBhbHdheXMgdGhlIGNhc2UsIHNpbmNlIC5kLnRzIGZpbGVzXG4gICAqIGFyZSBwcm9kdWNlZCBvbmx5IGR1cmluZyB0aGUgZW1pdCBvZiBzdWNoIGEgY29tcGlsYXRpb24uIFdoZW4gY29tcGlsaW5nIC5qcyBjb2RlLCBob3dldmVyLFxuICAgKiB0aGVyZSBpcyBmcmVxdWVudGx5IGEgcGFyYWxsZWwgLmQudHMgdHJlZSB3aGljaCB0aGlzIG1ldGhvZCBleHBvc2VzLlxuICAgKlxuICAgKiBOb3RlIHRoYXQgdGhlIGB0cy5DbGFzc0RlY2xhcmF0aW9uYCByZXR1cm5lZCBmcm9tIHRoaXMgZnVuY3Rpb24gbWF5IG5vdCBiZSBmcm9tIHRoZSBzYW1lXG4gICAqIGB0cy5Qcm9ncmFtYCBhcyB0aGUgaW5wdXQgZGVjbGFyYXRpb24uXG4gICAqL1xuICBnZXREdHNEZWNsYXJhdGlvbihkZWNsYXJhdGlvbjogdHMuRGVjbGFyYXRpb24pOiB0cy5EZWNsYXJhdGlvbnxudWxsIHtcbiAgICBpZiAodGhpcy5kdHMgPT09IG51bGwpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICBpZiAoIWlzTmFtZWREZWNsYXJhdGlvbihkZWNsYXJhdGlvbikpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICBgQ2Fubm90IGdldCB0aGUgZHRzIGZpbGUgZm9yIGEgZGVjbGFyYXRpb24gdGhhdCBoYXMgbm8gbmFtZTogJHtkZWNsYXJhdGlvbi5nZXRUZXh0KCl9IGluICR7ZGVjbGFyYXRpb24uZ2V0U291cmNlRmlsZSgpLmZpbGVOYW1lfWApO1xuICAgIH1cblxuICAgIC8vIFRyeSB0byByZXRyaWV2ZSB0aGUgZHRzIGRlY2xhcmF0aW9uIGZyb20gdGhlIHB1YmxpYyBtYXBcbiAgICBpZiAodGhpcy5wdWJsaWNEdHNEZWNsYXJhdGlvbk1hcCA9PT0gbnVsbCkge1xuICAgICAgdGhpcy5wdWJsaWNEdHNEZWNsYXJhdGlvbk1hcCA9IHRoaXMuY29tcHV0ZVB1YmxpY0R0c0RlY2xhcmF0aW9uTWFwKHRoaXMuc3JjLCB0aGlzLmR0cyk7XG4gICAgfVxuICAgIGlmICh0aGlzLnB1YmxpY0R0c0RlY2xhcmF0aW9uTWFwLmhhcyhkZWNsYXJhdGlvbikpIHtcbiAgICAgIHJldHVybiB0aGlzLnB1YmxpY0R0c0RlY2xhcmF0aW9uTWFwLmdldChkZWNsYXJhdGlvbikgITtcbiAgICB9XG5cbiAgICAvLyBObyBwdWJsaWMgZXhwb3J0LCB0cnkgdGhlIHByaXZhdGUgbWFwXG4gICAgaWYgKHRoaXMucHJpdmF0ZUR0c0RlY2xhcmF0aW9uTWFwID09PSBudWxsKSB7XG4gICAgICB0aGlzLnByaXZhdGVEdHNEZWNsYXJhdGlvbk1hcCA9IHRoaXMuY29tcHV0ZVByaXZhdGVEdHNEZWNsYXJhdGlvbk1hcCh0aGlzLnNyYywgdGhpcy5kdHMpO1xuICAgIH1cbiAgICBpZiAodGhpcy5wcml2YXRlRHRzRGVjbGFyYXRpb25NYXAuaGFzKGRlY2xhcmF0aW9uKSkge1xuICAgICAgcmV0dXJuIHRoaXMucHJpdmF0ZUR0c0RlY2xhcmF0aW9uTWFwLmdldChkZWNsYXJhdGlvbikgITtcbiAgICB9XG5cbiAgICAvLyBObyBkZWNsYXJhdGlvbiBmb3VuZCBhdCBhbGxcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZWFyY2ggdGhlIGdpdmVuIHNvdXJjZSBmaWxlIGZvciBleHBvcnRlZCBmdW5jdGlvbnMgYW5kIHN0YXRpYyBjbGFzcyBtZXRob2RzIHRoYXQgcmV0dXJuXG4gICAqIE1vZHVsZVdpdGhQcm92aWRlcnMgb2JqZWN0cy5cbiAgICogQHBhcmFtIGYgVGhlIHNvdXJjZSBmaWxlIHRvIHNlYXJjaCBmb3IgdGhlc2UgZnVuY3Rpb25zXG4gICAqIEByZXR1cm5zIEFuIGFycmF5IG9mIGZ1bmN0aW9uIGRlY2xhcmF0aW9ucyB0aGF0IGxvb2sgbGlrZSB0aGV5IHJldHVybiBNb2R1bGVXaXRoUHJvdmlkZXJzXG4gICAqIG9iamVjdHMuXG4gICAqL1xuICBnZXRNb2R1bGVXaXRoUHJvdmlkZXJzRnVuY3Rpb25zKGY6IHRzLlNvdXJjZUZpbGUpOiBNb2R1bGVXaXRoUHJvdmlkZXJzRnVuY3Rpb25bXSB7XG4gICAgY29uc3QgZXhwb3J0cyA9IHRoaXMuZ2V0RXhwb3J0c09mTW9kdWxlKGYpO1xuICAgIGlmICghZXhwb3J0cykgcmV0dXJuIFtdO1xuICAgIGNvbnN0IGluZm9zOiBNb2R1bGVXaXRoUHJvdmlkZXJzRnVuY3Rpb25bXSA9IFtdO1xuICAgIGV4cG9ydHMuZm9yRWFjaCgoZGVjbGFyYXRpb24sIG5hbWUpID0+IHtcbiAgICAgIGlmIChkZWNsYXJhdGlvbi5ub2RlID09PSBudWxsKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIGlmICh0aGlzLmlzQ2xhc3MoZGVjbGFyYXRpb24ubm9kZSkpIHtcbiAgICAgICAgdGhpcy5nZXRNZW1iZXJzT2ZDbGFzcyhkZWNsYXJhdGlvbi5ub2RlKS5mb3JFYWNoKG1lbWJlciA9PiB7XG4gICAgICAgICAgaWYgKG1lbWJlci5pc1N0YXRpYykge1xuICAgICAgICAgICAgY29uc3QgaW5mbyA9IHRoaXMucGFyc2VGb3JNb2R1bGVXaXRoUHJvdmlkZXJzKFxuICAgICAgICAgICAgICAgIG1lbWJlci5uYW1lLCBtZW1iZXIubm9kZSwgbWVtYmVyLmltcGxlbWVudGF0aW9uLCBkZWNsYXJhdGlvbi5ub2RlKTtcbiAgICAgICAgICAgIGlmIChpbmZvKSB7XG4gICAgICAgICAgICAgIGluZm9zLnB1c2goaW5mbyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGlmIChpc05hbWVkRGVjbGFyYXRpb24oZGVjbGFyYXRpb24ubm9kZSkpIHtcbiAgICAgICAgICBjb25zdCBpbmZvID1cbiAgICAgICAgICAgICAgdGhpcy5wYXJzZUZvck1vZHVsZVdpdGhQcm92aWRlcnMoZGVjbGFyYXRpb24ubm9kZS5uYW1lLnRleHQsIGRlY2xhcmF0aW9uLm5vZGUpO1xuICAgICAgICAgIGlmIChpbmZvKSB7XG4gICAgICAgICAgICBpbmZvcy5wdXNoKGluZm8pO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pO1xuICAgIHJldHVybiBpbmZvcztcbiAgfVxuXG4gIGdldEVuZE9mQ2xhc3MoY2xhc3NTeW1ib2w6IE5nY2NDbGFzc1N5bWJvbCk6IHRzLk5vZGUge1xuICAgIGxldCBsYXN0OiB0cy5Ob2RlID0gY2xhc3NTeW1ib2wuZGVjbGFyYXRpb24udmFsdWVEZWNsYXJhdGlvbjtcblxuICAgIC8vIElmIHRoZXJlIGFyZSBzdGF0aWMgbWVtYmVycyBvbiB0aGlzIGNsYXNzIHRoZW4gZmluZCB0aGUgbGFzdCBvbmVcbiAgICBpZiAoY2xhc3NTeW1ib2wuZGVjbGFyYXRpb24uZXhwb3J0cyAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICBjbGFzc1N5bWJvbC5kZWNsYXJhdGlvbi5leHBvcnRzLmZvckVhY2goZXhwb3J0U3ltYm9sID0+IHtcbiAgICAgICAgaWYgKGV4cG9ydFN5bWJvbC52YWx1ZURlY2xhcmF0aW9uID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgZXhwb3J0U3RhdGVtZW50ID0gZ2V0Q29udGFpbmluZ1N0YXRlbWVudChleHBvcnRTeW1ib2wudmFsdWVEZWNsYXJhdGlvbik7XG4gICAgICAgIGlmIChleHBvcnRTdGF0ZW1lbnQgIT09IG51bGwgJiYgbGFzdC5nZXRFbmQoKSA8IGV4cG9ydFN0YXRlbWVudC5nZXRFbmQoKSkge1xuICAgICAgICAgIGxhc3QgPSBleHBvcnRTdGF0ZW1lbnQ7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cblxuICAgIC8vIElmIHRoZXJlIGFyZSBoZWxwZXIgY2FsbHMgZm9yIHRoaXMgY2xhc3MgdGhlbiBmaW5kIHRoZSBsYXN0IG9uZVxuICAgIGNvbnN0IGhlbHBlcnMgPSB0aGlzLmdldEhlbHBlckNhbGxzRm9yQ2xhc3MoXG4gICAgICAgIGNsYXNzU3ltYm9sLCBbJ19fZGVjb3JhdGUnLCAnX19leHRlbmRzJywgJ19fcGFyYW0nLCAnX19tZXRhZGF0YSddKTtcbiAgICBoZWxwZXJzLmZvckVhY2goaGVscGVyID0+IHtcbiAgICAgIGNvbnN0IGhlbHBlclN0YXRlbWVudCA9IGdldENvbnRhaW5pbmdTdGF0ZW1lbnQoaGVscGVyKTtcbiAgICAgIGlmIChoZWxwZXJTdGF0ZW1lbnQgIT09IG51bGwgJiYgbGFzdC5nZXRFbmQoKSA8IGhlbHBlclN0YXRlbWVudC5nZXRFbmQoKSkge1xuICAgICAgICBsYXN0ID0gaGVscGVyU3RhdGVtZW50O1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgcmV0dXJuIGxhc3Q7XG4gIH1cblxuICAvLy8vLy8vLy8vLy8vIFByb3RlY3RlZCBIZWxwZXJzIC8vLy8vLy8vLy8vLy9cblxuICAvKipcbiAgICogRmluZHMgdGhlIGlkZW50aWZpZXIgb2YgdGhlIGFjdHVhbCBjbGFzcyBkZWNsYXJhdGlvbiBmb3IgYSBwb3RlbnRpYWxseSBhbGlhc2VkIGRlY2xhcmF0aW9uIG9mIGFcbiAgICogY2xhc3MuXG4gICAqXG4gICAqIElmIHRoZSBnaXZlbiBkZWNsYXJhdGlvbiBpcyBmb3IgYW4gYWxpYXMgb2YgYSBjbGFzcywgdGhpcyBmdW5jdGlvbiB3aWxsIGRldGVybWluZSBhbiBpZGVudGlmaWVyXG4gICAqIHRvIHRoZSBvcmlnaW5hbCBkZWNsYXJhdGlvbiB0aGF0IHJlcHJlc2VudHMgdGhpcyBjbGFzcy5cbiAgICpcbiAgICogQHBhcmFtIGRlY2xhcmF0aW9uIFRoZSBkZWNsYXJhdGlvbiB0byByZXNvbHZlLlxuICAgKiBAcmV0dXJucyBUaGUgb3JpZ2luYWwgaWRlbnRpZmllciB0aGF0IHRoZSBnaXZlbiBjbGFzcyBkZWNsYXJhdGlvbiByZXNvbHZlcyB0bywgb3IgYHVuZGVmaW5lZGBcbiAgICogaWYgdGhlIGRlY2xhcmF0aW9uIGRvZXMgbm90IHJlcHJlc2VudCBhbiBhbGlhc2VkIGNsYXNzLlxuICAgKi9cbiAgcHJvdGVjdGVkIHJlc29sdmVBbGlhc2VkQ2xhc3NJZGVudGlmaWVyKGRlY2xhcmF0aW9uOiB0cy5EZWNsYXJhdGlvbik6IHRzLklkZW50aWZpZXJ8bnVsbCB7XG4gICAgdGhpcy5lbnN1cmVQcmVwcm9jZXNzZWQoZGVjbGFyYXRpb24uZ2V0U291cmNlRmlsZSgpKTtcbiAgICByZXR1cm4gdGhpcy5hbGlhc2VkQ2xhc3NEZWNsYXJhdGlvbnMuaGFzKGRlY2xhcmF0aW9uKSA/XG4gICAgICAgIHRoaXMuYWxpYXNlZENsYXNzRGVjbGFyYXRpb25zLmdldChkZWNsYXJhdGlvbikgISA6XG4gICAgICAgIG51bGw7XG4gIH1cblxuICAvKipcbiAgICogRW5zdXJlcyB0aGF0IHRoZSBzb3VyY2UgZmlsZSB0aGF0IGBub2RlYCBpcyBwYXJ0IG9mIGhhcyBiZWVuIHByZXByb2Nlc3NlZC5cbiAgICpcbiAgICogRHVyaW5nIHByZXByb2Nlc3NpbmcsIGFsbCBzdGF0ZW1lbnRzIGluIHRoZSBzb3VyY2UgZmlsZSB3aWxsIGJlIHZpc2l0ZWQgc3VjaCB0aGF0IGNlcnRhaW5cbiAgICogcHJvY2Vzc2luZyBzdGVwcyBjYW4gYmUgZG9uZSB1cC1mcm9udCBhbmQgY2FjaGVkIGZvciBzdWJzZXF1ZW50IHVzYWdlcy5cbiAgICpcbiAgICogQHBhcmFtIHNvdXJjZUZpbGUgVGhlIHNvdXJjZSBmaWxlIHRoYXQgbmVlZHMgdG8gaGF2ZSBnb25lIHRocm91Z2ggcHJlcHJvY2Vzc2luZy5cbiAgICovXG4gIHByb3RlY3RlZCBlbnN1cmVQcmVwcm9jZXNzZWQoc291cmNlRmlsZTogdHMuU291cmNlRmlsZSk6IHZvaWQge1xuICAgIGlmICghdGhpcy5wcmVwcm9jZXNzZWRTb3VyY2VGaWxlcy5oYXMoc291cmNlRmlsZSkpIHtcbiAgICAgIHRoaXMucHJlcHJvY2Vzc2VkU291cmNlRmlsZXMuYWRkKHNvdXJjZUZpbGUpO1xuXG4gICAgICBmb3IgKGNvbnN0IHN0YXRlbWVudCBvZiB0aGlzLmdldE1vZHVsZVN0YXRlbWVudHMoc291cmNlRmlsZSkpIHtcbiAgICAgICAgdGhpcy5wcmVwcm9jZXNzU3RhdGVtZW50KHN0YXRlbWVudCk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEFuYWx5emVzIHRoZSBnaXZlbiBzdGF0ZW1lbnQgdG8gc2VlIGlmIGl0IGNvcnJlc3BvbmRzIHdpdGggYSB2YXJpYWJsZSBkZWNsYXJhdGlvbiBsaWtlXG4gICAqIGBsZXQgTXlDbGFzcyA9IE15Q2xhc3NfMSA9IGNsYXNzIE15Q2xhc3Mge307YC4gSWYgc28sIHRoZSBkZWNsYXJhdGlvbiBvZiBgTXlDbGFzc18xYFxuICAgKiBpcyBhc3NvY2lhdGVkIHdpdGggdGhlIGBNeUNsYXNzYCBpZGVudGlmaWVyLlxuICAgKlxuICAgKiBAcGFyYW0gc3RhdGVtZW50IFRoZSBzdGF0ZW1lbnQgdGhhdCBuZWVkcyB0byBiZSBwcmVwcm9jZXNzZWQuXG4gICAqL1xuICBwcm90ZWN0ZWQgcHJlcHJvY2Vzc1N0YXRlbWVudChzdGF0ZW1lbnQ6IHRzLlN0YXRlbWVudCk6IHZvaWQge1xuICAgIGlmICghdHMuaXNWYXJpYWJsZVN0YXRlbWVudChzdGF0ZW1lbnQpKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3QgZGVjbGFyYXRpb25zID0gc3RhdGVtZW50LmRlY2xhcmF0aW9uTGlzdC5kZWNsYXJhdGlvbnM7XG4gICAgaWYgKGRlY2xhcmF0aW9ucy5sZW5ndGggIT09IDEpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBkZWNsYXJhdGlvbiA9IGRlY2xhcmF0aW9uc1swXTtcbiAgICBjb25zdCBpbml0aWFsaXplciA9IGRlY2xhcmF0aW9uLmluaXRpYWxpemVyO1xuICAgIGlmICghdHMuaXNJZGVudGlmaWVyKGRlY2xhcmF0aW9uLm5hbWUpIHx8ICFpbml0aWFsaXplciB8fCAhaXNBc3NpZ25tZW50KGluaXRpYWxpemVyKSB8fFxuICAgICAgICAhdHMuaXNJZGVudGlmaWVyKGluaXRpYWxpemVyLmxlZnQpIHx8ICF0aGlzLmlzQ2xhc3MoZGVjbGFyYXRpb24pKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3QgYWxpYXNlZElkZW50aWZpZXIgPSBpbml0aWFsaXplci5sZWZ0O1xuXG4gICAgY29uc3QgYWxpYXNlZERlY2xhcmF0aW9uID0gdGhpcy5nZXREZWNsYXJhdGlvbk9mSWRlbnRpZmllcihhbGlhc2VkSWRlbnRpZmllcik7XG4gICAgaWYgKGFsaWFzZWREZWNsYXJhdGlvbiA9PT0gbnVsbCB8fCBhbGlhc2VkRGVjbGFyYXRpb24ubm9kZSA9PT0gbnVsbCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgIGBVbmFibGUgdG8gbG9jYXRlIGRlY2xhcmF0aW9uIG9mICR7YWxpYXNlZElkZW50aWZpZXIudGV4dH0gaW4gXCIke3N0YXRlbWVudC5nZXRUZXh0KCl9XCJgKTtcbiAgICB9XG4gICAgdGhpcy5hbGlhc2VkQ2xhc3NEZWNsYXJhdGlvbnMuc2V0KGFsaWFzZWREZWNsYXJhdGlvbi5ub2RlLCBkZWNsYXJhdGlvbi5uYW1lKTtcbiAgfVxuXG4gIC8qKiBHZXQgdGhlIHRvcCBsZXZlbCBzdGF0ZW1lbnRzIGZvciBhIG1vZHVsZS5cbiAgICpcbiAgICogSW4gRVM1IGFuZCBFUzIwMTUgdGhpcyBpcyBqdXN0IHRoZSB0b3AgbGV2ZWwgc3RhdGVtZW50cyBvZiB0aGUgZmlsZS5cbiAgICogQHBhcmFtIHNvdXJjZUZpbGUgVGhlIG1vZHVsZSB3aG9zZSBzdGF0ZW1lbnRzIHdlIHdhbnQuXG4gICAqIEByZXR1cm5zIEFuIGFycmF5IG9mIHRvcCBsZXZlbCBzdGF0ZW1lbnRzIGZvciB0aGUgZ2l2ZW4gbW9kdWxlLlxuICAgKi9cbiAgcHJvdGVjdGVkIGdldE1vZHVsZVN0YXRlbWVudHMoc291cmNlRmlsZTogdHMuU291cmNlRmlsZSk6IHRzLlN0YXRlbWVudFtdIHtcbiAgICByZXR1cm4gQXJyYXkuZnJvbShzb3VyY2VGaWxlLnN0YXRlbWVudHMpO1xuICB9XG5cbiAgLyoqXG4gICAqIFdhbGsgdGhlIEFTVCBsb29raW5nIGZvciBhbiBhc3NpZ25tZW50IHRvIHRoZSBzcGVjaWZpZWQgc3ltYm9sLlxuICAgKiBAcGFyYW0gbm9kZSBUaGUgY3VycmVudCBub2RlIHdlIGFyZSBzZWFyY2hpbmcuXG4gICAqIEByZXR1cm5zIGFuIGV4cHJlc3Npb24gdGhhdCByZXByZXNlbnRzIHRoZSB2YWx1ZSBvZiB0aGUgdmFyaWFibGUsIG9yIHVuZGVmaW5lZCBpZiBub25lIGNhbiBiZVxuICAgKiBmb3VuZC5cbiAgICovXG4gIHByb3RlY3RlZCBmaW5kRGVjb3JhdGVkVmFyaWFibGVWYWx1ZShub2RlOiB0cy5Ob2RlfHVuZGVmaW5lZCwgc3ltYm9sOiB0cy5TeW1ib2wpOlxuICAgICAgdHMuQ2FsbEV4cHJlc3Npb258bnVsbCB7XG4gICAgaWYgKCFub2RlKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgaWYgKHRzLmlzQmluYXJ5RXhwcmVzc2lvbihub2RlKSAmJiBub2RlLm9wZXJhdG9yVG9rZW4ua2luZCA9PT0gdHMuU3ludGF4S2luZC5FcXVhbHNUb2tlbikge1xuICAgICAgY29uc3QgbGVmdCA9IG5vZGUubGVmdDtcbiAgICAgIGNvbnN0IHJpZ2h0ID0gbm9kZS5yaWdodDtcbiAgICAgIGlmICh0cy5pc0lkZW50aWZpZXIobGVmdCkgJiYgdGhpcy5jaGVja2VyLmdldFN5bWJvbEF0TG9jYXRpb24obGVmdCkgPT09IHN5bWJvbCkge1xuICAgICAgICByZXR1cm4gKHRzLmlzQ2FsbEV4cHJlc3Npb24ocmlnaHQpICYmIGdldENhbGxlZU5hbWUocmlnaHQpID09PSAnX19kZWNvcmF0ZScpID8gcmlnaHQgOiBudWxsO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHRoaXMuZmluZERlY29yYXRlZFZhcmlhYmxlVmFsdWUocmlnaHQsIHN5bWJvbCk7XG4gICAgfVxuICAgIHJldHVybiBub2RlLmZvckVhY2hDaGlsZChub2RlID0+IHRoaXMuZmluZERlY29yYXRlZFZhcmlhYmxlVmFsdWUobm9kZSwgc3ltYm9sKSkgfHwgbnVsbDtcbiAgfVxuXG4gIC8qKlxuICAgKiBUcnkgdG8gcmV0cmlldmUgdGhlIHN5bWJvbCBvZiBhIHN0YXRpYyBwcm9wZXJ0eSBvbiBhIGNsYXNzLlxuICAgKiBAcGFyYW0gc3ltYm9sIHRoZSBjbGFzcyB3aG9zZSBwcm9wZXJ0eSB3ZSBhcmUgaW50ZXJlc3RlZCBpbi5cbiAgICogQHBhcmFtIHByb3BlcnR5TmFtZSB0aGUgbmFtZSBvZiBzdGF0aWMgcHJvcGVydHkuXG4gICAqIEByZXR1cm5zIHRoZSBzeW1ib2wgaWYgaXQgaXMgZm91bmQgb3IgYHVuZGVmaW5lZGAgaWYgbm90LlxuICAgKi9cbiAgcHJvdGVjdGVkIGdldFN0YXRpY1Byb3BlcnR5KHN5bWJvbDogTmdjY0NsYXNzU3ltYm9sLCBwcm9wZXJ0eU5hbWU6IHRzLl9fU3RyaW5nKTogdHMuU3ltYm9sXG4gICAgICB8dW5kZWZpbmVkIHtcbiAgICByZXR1cm4gc3ltYm9sLmRlY2xhcmF0aW9uLmV4cG9ydHMgJiYgc3ltYm9sLmRlY2xhcmF0aW9uLmV4cG9ydHMuZ2V0KHByb3BlcnR5TmFtZSk7XG4gIH1cblxuICAvKipcbiAgICogVGhpcyBpcyB0aGUgbWFpbiBlbnRyeS1wb2ludCBmb3Igb2J0YWluaW5nIGluZm9ybWF0aW9uIG9uIHRoZSBkZWNvcmF0b3JzIG9mIGEgZ2l2ZW4gY2xhc3MuIFRoaXNcbiAgICogaW5mb3JtYXRpb24gaXMgY29tcHV0ZWQgZWl0aGVyIGZyb20gc3RhdGljIHByb3BlcnRpZXMgaWYgcHJlc2VudCwgb3IgdXNpbmcgYHRzbGliLl9fZGVjb3JhdGVgXG4gICAqIGhlbHBlciBjYWxscyBvdGhlcndpc2UuIFRoZSBjb21wdXRlZCByZXN1bHQgaXMgY2FjaGVkIHBlciBjbGFzcy5cbiAgICpcbiAgICogQHBhcmFtIGNsYXNzU3ltYm9sIHRoZSBjbGFzcyBmb3Igd2hpY2ggZGVjb3JhdG9ycyBzaG91bGQgYmUgYWNxdWlyZWQuXG4gICAqIEByZXR1cm5zIGFsbCBpbmZvcm1hdGlvbiBvZiB0aGUgZGVjb3JhdG9ycyBvbiB0aGUgY2xhc3MuXG4gICAqL1xuICBwcm90ZWN0ZWQgYWNxdWlyZURlY29yYXRvckluZm8oY2xhc3NTeW1ib2w6IE5nY2NDbGFzc1N5bWJvbCk6IERlY29yYXRvckluZm8ge1xuICAgIGNvbnN0IGRlY2wgPSBjbGFzc1N5bWJvbC5kZWNsYXJhdGlvbi52YWx1ZURlY2xhcmF0aW9uO1xuICAgIGlmICh0aGlzLmRlY29yYXRvckNhY2hlLmhhcyhkZWNsKSkge1xuICAgICAgcmV0dXJuIHRoaXMuZGVjb3JhdG9yQ2FjaGUuZ2V0KGRlY2wpICE7XG4gICAgfVxuXG4gICAgLy8gRXh0cmFjdCBkZWNvcmF0b3JzIGZyb20gc3RhdGljIHByb3BlcnRpZXMgYW5kIGBfX2RlY29yYXRlYCBoZWxwZXIgY2FsbHMsIHRoZW4gbWVyZ2UgdGhlbVxuICAgIC8vIHRvZ2V0aGVyIHdoZXJlIHRoZSBpbmZvcm1hdGlvbiBmcm9tIHRoZSBzdGF0aWMgcHJvcGVydGllcyBpcyBwcmVmZXJyZWQuXG4gICAgY29uc3Qgc3RhdGljUHJvcHMgPSB0aGlzLmNvbXB1dGVEZWNvcmF0b3JJbmZvRnJvbVN0YXRpY1Byb3BlcnRpZXMoY2xhc3NTeW1ib2wpO1xuICAgIGNvbnN0IGhlbHBlckNhbGxzID0gdGhpcy5jb21wdXRlRGVjb3JhdG9ySW5mb0Zyb21IZWxwZXJDYWxscyhjbGFzc1N5bWJvbCk7XG5cbiAgICBjb25zdCBkZWNvcmF0b3JJbmZvOiBEZWNvcmF0b3JJbmZvID0ge1xuICAgICAgY2xhc3NEZWNvcmF0b3JzOiBzdGF0aWNQcm9wcy5jbGFzc0RlY29yYXRvcnMgfHwgaGVscGVyQ2FsbHMuY2xhc3NEZWNvcmF0b3JzLFxuICAgICAgbWVtYmVyRGVjb3JhdG9yczogc3RhdGljUHJvcHMubWVtYmVyRGVjb3JhdG9ycyB8fCBoZWxwZXJDYWxscy5tZW1iZXJEZWNvcmF0b3JzLFxuICAgICAgY29uc3RydWN0b3JQYXJhbUluZm86IHN0YXRpY1Byb3BzLmNvbnN0cnVjdG9yUGFyYW1JbmZvIHx8IGhlbHBlckNhbGxzLmNvbnN0cnVjdG9yUGFyYW1JbmZvLFxuICAgIH07XG5cbiAgICB0aGlzLmRlY29yYXRvckNhY2hlLnNldChkZWNsLCBkZWNvcmF0b3JJbmZvKTtcbiAgICByZXR1cm4gZGVjb3JhdG9ySW5mbztcbiAgfVxuXG4gIC8qKlxuICAgKiBBdHRlbXB0cyB0byBjb21wdXRlIGRlY29yYXRvciBpbmZvcm1hdGlvbiBmcm9tIHN0YXRpYyBwcm9wZXJ0aWVzIFwiZGVjb3JhdG9yc1wiLCBcInByb3BEZWNvcmF0b3JzXCJcbiAgICogYW5kIFwiY3RvclBhcmFtZXRlcnNcIiBvbiB0aGUgY2xhc3MuIElmIG5laXRoZXIgb2YgdGhlc2Ugc3RhdGljIHByb3BlcnRpZXMgaXMgcHJlc2VudCB0aGVcbiAgICogbGlicmFyeSBpcyBsaWtlbHkgbm90IGNvbXBpbGVkIHVzaW5nIHRzaWNrbGUgZm9yIHVzYWdlIHdpdGggQ2xvc3VyZSBjb21waWxlciwgaW4gd2hpY2ggY2FzZVxuICAgKiBgbnVsbGAgaXMgcmV0dXJuZWQuXG4gICAqXG4gICAqIEBwYXJhbSBjbGFzc1N5bWJvbCBUaGUgY2xhc3Mgc3ltYm9sIHRvIGNvbXB1dGUgdGhlIGRlY29yYXRvcnMgaW5mb3JtYXRpb24gZm9yLlxuICAgKiBAcmV0dXJucyBBbGwgaW5mb3JtYXRpb24gb24gdGhlIGRlY29yYXRvcnMgYXMgZXh0cmFjdGVkIGZyb20gc3RhdGljIHByb3BlcnRpZXMsIG9yIGBudWxsYCBpZlxuICAgKiBub25lIG9mIHRoZSBzdGF0aWMgcHJvcGVydGllcyBleGlzdC5cbiAgICovXG4gIHByb3RlY3RlZCBjb21wdXRlRGVjb3JhdG9ySW5mb0Zyb21TdGF0aWNQcm9wZXJ0aWVzKGNsYXNzU3ltYm9sOiBOZ2NjQ2xhc3NTeW1ib2wpOiB7XG4gICAgY2xhc3NEZWNvcmF0b3JzOiBEZWNvcmF0b3JbXSB8IG51bGw7IG1lbWJlckRlY29yYXRvcnM6IE1hcDxzdHJpbmcsIERlY29yYXRvcltdPnwgbnVsbDtcbiAgICBjb25zdHJ1Y3RvclBhcmFtSW5mbzogUGFyYW1JbmZvW10gfCBudWxsO1xuICB9IHtcbiAgICBsZXQgY2xhc3NEZWNvcmF0b3JzOiBEZWNvcmF0b3JbXXxudWxsID0gbnVsbDtcbiAgICBsZXQgbWVtYmVyRGVjb3JhdG9yczogTWFwPHN0cmluZywgRGVjb3JhdG9yW10+fG51bGwgPSBudWxsO1xuICAgIGxldCBjb25zdHJ1Y3RvclBhcmFtSW5mbzogUGFyYW1JbmZvW118bnVsbCA9IG51bGw7XG5cbiAgICBjb25zdCBkZWNvcmF0b3JzUHJvcGVydHkgPSB0aGlzLmdldFN0YXRpY1Byb3BlcnR5KGNsYXNzU3ltYm9sLCBERUNPUkFUT1JTKTtcbiAgICBpZiAoZGVjb3JhdG9yc1Byb3BlcnR5ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIGNsYXNzRGVjb3JhdG9ycyA9IHRoaXMuZ2V0Q2xhc3NEZWNvcmF0b3JzRnJvbVN0YXRpY1Byb3BlcnR5KGRlY29yYXRvcnNQcm9wZXJ0eSk7XG4gICAgfVxuXG4gICAgY29uc3QgcHJvcERlY29yYXRvcnNQcm9wZXJ0eSA9IHRoaXMuZ2V0U3RhdGljUHJvcGVydHkoY2xhc3NTeW1ib2wsIFBST1BfREVDT1JBVE9SUyk7XG4gICAgaWYgKHByb3BEZWNvcmF0b3JzUHJvcGVydHkgIT09IHVuZGVmaW5lZCkge1xuICAgICAgbWVtYmVyRGVjb3JhdG9ycyA9IHRoaXMuZ2V0TWVtYmVyRGVjb3JhdG9yc0Zyb21TdGF0aWNQcm9wZXJ0eShwcm9wRGVjb3JhdG9yc1Byb3BlcnR5KTtcbiAgICB9XG5cbiAgICBjb25zdCBjb25zdHJ1Y3RvclBhcmFtc1Byb3BlcnR5ID0gdGhpcy5nZXRTdGF0aWNQcm9wZXJ0eShjbGFzc1N5bWJvbCwgQ09OU1RSVUNUT1JfUEFSQU1TKTtcbiAgICBpZiAoY29uc3RydWN0b3JQYXJhbXNQcm9wZXJ0eSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICBjb25zdHJ1Y3RvclBhcmFtSW5mbyA9IHRoaXMuZ2V0UGFyYW1JbmZvRnJvbVN0YXRpY1Byb3BlcnR5KGNvbnN0cnVjdG9yUGFyYW1zUHJvcGVydHkpO1xuICAgIH1cblxuICAgIHJldHVybiB7Y2xhc3NEZWNvcmF0b3JzLCBtZW1iZXJEZWNvcmF0b3JzLCBjb25zdHJ1Y3RvclBhcmFtSW5mb307XG4gIH1cblxuICAvKipcbiAgICogR2V0IGFsbCBjbGFzcyBkZWNvcmF0b3JzIGZvciB0aGUgZ2l2ZW4gY2xhc3MsIHdoZXJlIHRoZSBkZWNvcmF0b3JzIGFyZSBkZWNsYXJlZFxuICAgKiB2aWEgYSBzdGF0aWMgcHJvcGVydHkuIEZvciBleGFtcGxlOlxuICAgKlxuICAgKiBgYGBcbiAgICogY2xhc3MgU29tZURpcmVjdGl2ZSB7fVxuICAgKiBTb21lRGlyZWN0aXZlLmRlY29yYXRvcnMgPSBbXG4gICAqICAgeyB0eXBlOiBEaXJlY3RpdmUsIGFyZ3M6IFt7IHNlbGVjdG9yOiAnW3NvbWVEaXJlY3RpdmVdJyB9LF0gfVxuICAgKiBdO1xuICAgKiBgYGBcbiAgICpcbiAgICogQHBhcmFtIGRlY29yYXRvcnNTeW1ib2wgdGhlIHByb3BlcnR5IGNvbnRhaW5pbmcgdGhlIGRlY29yYXRvcnMgd2Ugd2FudCB0byBnZXQuXG4gICAqIEByZXR1cm5zIGFuIGFycmF5IG9mIGRlY29yYXRvcnMgb3IgbnVsbCBpZiBub25lIHdoZXJlIGZvdW5kLlxuICAgKi9cbiAgcHJvdGVjdGVkIGdldENsYXNzRGVjb3JhdG9yc0Zyb21TdGF0aWNQcm9wZXJ0eShkZWNvcmF0b3JzU3ltYm9sOiB0cy5TeW1ib2wpOiBEZWNvcmF0b3JbXXxudWxsIHtcbiAgICBjb25zdCBkZWNvcmF0b3JzSWRlbnRpZmllciA9IGRlY29yYXRvcnNTeW1ib2wudmFsdWVEZWNsYXJhdGlvbjtcbiAgICBpZiAoZGVjb3JhdG9yc0lkZW50aWZpZXIgJiYgZGVjb3JhdG9yc0lkZW50aWZpZXIucGFyZW50KSB7XG4gICAgICBpZiAodHMuaXNCaW5hcnlFeHByZXNzaW9uKGRlY29yYXRvcnNJZGVudGlmaWVyLnBhcmVudCkgJiZcbiAgICAgICAgICBkZWNvcmF0b3JzSWRlbnRpZmllci5wYXJlbnQub3BlcmF0b3JUb2tlbi5raW5kID09PSB0cy5TeW50YXhLaW5kLkVxdWFsc1Rva2VuKSB7XG4gICAgICAgIC8vIEFTVCBvZiB0aGUgYXJyYXkgb2YgZGVjb3JhdG9yIHZhbHVlc1xuICAgICAgICBjb25zdCBkZWNvcmF0b3JzQXJyYXkgPSBkZWNvcmF0b3JzSWRlbnRpZmllci5wYXJlbnQucmlnaHQ7XG4gICAgICAgIHJldHVybiB0aGlzLnJlZmxlY3REZWNvcmF0b3JzKGRlY29yYXRvcnNBcnJheSlcbiAgICAgICAgICAgIC5maWx0ZXIoZGVjb3JhdG9yID0+IHRoaXMuaXNGcm9tQ29yZShkZWNvcmF0b3IpKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICAvKipcbiAgICogRXhhbWluZSBhIHN5bWJvbCB3aGljaCBzaG91bGQgYmUgb2YgYSBjbGFzcywgYW5kIHJldHVybiBtZXRhZGF0YSBhYm91dCBpdHMgbWVtYmVycy5cbiAgICpcbiAgICogQHBhcmFtIHN5bWJvbCB0aGUgYENsYXNzU3ltYm9sYCByZXByZXNlbnRpbmcgdGhlIGNsYXNzIG92ZXIgd2hpY2ggdG8gcmVmbGVjdC5cbiAgICogQHJldHVybnMgYW4gYXJyYXkgb2YgYENsYXNzTWVtYmVyYCBtZXRhZGF0YSByZXByZXNlbnRpbmcgdGhlIG1lbWJlcnMgb2YgdGhlIGNsYXNzLlxuICAgKi9cbiAgcHJvdGVjdGVkIGdldE1lbWJlcnNPZlN5bWJvbChzeW1ib2w6IE5nY2NDbGFzc1N5bWJvbCk6IENsYXNzTWVtYmVyW10ge1xuICAgIGNvbnN0IG1lbWJlcnM6IENsYXNzTWVtYmVyW10gPSBbXTtcblxuICAgIC8vIFRoZSBkZWNvcmF0b3JzIG1hcCBjb250YWlucyBhbGwgdGhlIHByb3BlcnRpZXMgdGhhdCBhcmUgZGVjb3JhdGVkXG4gICAgY29uc3Qge21lbWJlckRlY29yYXRvcnN9ID0gdGhpcy5hY3F1aXJlRGVjb3JhdG9ySW5mbyhzeW1ib2wpO1xuXG4gICAgLy8gTWFrZSBhIGNvcHkgb2YgdGhlIGRlY29yYXRvcnMgYXMgc3VjY2Vzc2Z1bGx5IHJlZmxlY3RlZCBtZW1iZXJzIGRlbGV0ZSB0aGVtc2VsdmVzIGZyb20gdGhlXG4gICAgLy8gbWFwLCBzbyB0aGF0IGFueSBsZWZ0b3ZlcnMgY2FuIGJlIGVhc2lseSBkZWFsdCB3aXRoLlxuICAgIGNvbnN0IGRlY29yYXRvcnNNYXAgPSBuZXcgTWFwKG1lbWJlckRlY29yYXRvcnMpO1xuXG4gICAgLy8gVGhlIG1lbWJlciBtYXAgY29udGFpbnMgYWxsIHRoZSBtZXRob2QgKGluc3RhbmNlIGFuZCBzdGF0aWMpOyBhbmQgYW55IGluc3RhbmNlIHByb3BlcnRpZXNcbiAgICAvLyB0aGF0IGFyZSBpbml0aWFsaXplZCBpbiB0aGUgY2xhc3MuXG4gICAgaWYgKHN5bWJvbC5pbXBsZW1lbnRhdGlvbi5tZW1iZXJzKSB7XG4gICAgICBzeW1ib2wuaW1wbGVtZW50YXRpb24ubWVtYmVycy5mb3JFYWNoKCh2YWx1ZSwga2V5KSA9PiB7XG4gICAgICAgIGNvbnN0IGRlY29yYXRvcnMgPSBkZWNvcmF0b3JzTWFwLmdldChrZXkgYXMgc3RyaW5nKTtcbiAgICAgICAgY29uc3QgcmVmbGVjdGVkTWVtYmVycyA9IHRoaXMucmVmbGVjdE1lbWJlcnModmFsdWUsIGRlY29yYXRvcnMpO1xuICAgICAgICBpZiAocmVmbGVjdGVkTWVtYmVycykge1xuICAgICAgICAgIGRlY29yYXRvcnNNYXAuZGVsZXRlKGtleSBhcyBzdHJpbmcpO1xuICAgICAgICAgIG1lbWJlcnMucHVzaCguLi5yZWZsZWN0ZWRNZW1iZXJzKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgLy8gVGhlIHN0YXRpYyBwcm9wZXJ0eSBtYXAgY29udGFpbnMgYWxsIHRoZSBzdGF0aWMgcHJvcGVydGllc1xuICAgIGlmIChzeW1ib2wuaW1wbGVtZW50YXRpb24uZXhwb3J0cykge1xuICAgICAgc3ltYm9sLmltcGxlbWVudGF0aW9uLmV4cG9ydHMuZm9yRWFjaCgodmFsdWUsIGtleSkgPT4ge1xuICAgICAgICBjb25zdCBkZWNvcmF0b3JzID0gZGVjb3JhdG9yc01hcC5nZXQoa2V5IGFzIHN0cmluZyk7XG4gICAgICAgIGNvbnN0IHJlZmxlY3RlZE1lbWJlcnMgPSB0aGlzLnJlZmxlY3RNZW1iZXJzKHZhbHVlLCBkZWNvcmF0b3JzLCB0cnVlKTtcbiAgICAgICAgaWYgKHJlZmxlY3RlZE1lbWJlcnMpIHtcbiAgICAgICAgICBkZWNvcmF0b3JzTWFwLmRlbGV0ZShrZXkgYXMgc3RyaW5nKTtcbiAgICAgICAgICBtZW1iZXJzLnB1c2goLi4ucmVmbGVjdGVkTWVtYmVycyk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cblxuICAgIC8vIElmIHRoaXMgY2xhc3Mgd2FzIGRlY2xhcmVkIGFzIGEgVmFyaWFibGVEZWNsYXJhdGlvbiB0aGVuIGl0IG1heSBoYXZlIHN0YXRpYyBwcm9wZXJ0aWVzXG4gICAgLy8gYXR0YWNoZWQgdG8gdGhlIHZhcmlhYmxlIHJhdGhlciB0aGFuIHRoZSBjbGFzcyBpdHNlbGZcbiAgICAvLyBGb3IgZXhhbXBsZTpcbiAgICAvLyBgYGBcbiAgICAvLyBsZXQgTXlDbGFzcyA9IGNsYXNzIE15Q2xhc3Mge1xuICAgIC8vICAgLy8gbm8gc3RhdGljIHByb3BlcnRpZXMgaGVyZSFcbiAgICAvLyB9XG4gICAgLy8gTXlDbGFzcy5zdGF0aWNQcm9wZXJ0eSA9IC4uLjtcbiAgICAvLyBgYGBcbiAgICBpZiAodHMuaXNWYXJpYWJsZURlY2xhcmF0aW9uKHN5bWJvbC5kZWNsYXJhdGlvbi52YWx1ZURlY2xhcmF0aW9uKSkge1xuICAgICAgaWYgKHN5bWJvbC5kZWNsYXJhdGlvbi5leHBvcnRzKSB7XG4gICAgICAgIHN5bWJvbC5kZWNsYXJhdGlvbi5leHBvcnRzLmZvckVhY2goKHZhbHVlLCBrZXkpID0+IHtcbiAgICAgICAgICBjb25zdCBkZWNvcmF0b3JzID0gZGVjb3JhdG9yc01hcC5nZXQoa2V5IGFzIHN0cmluZyk7XG4gICAgICAgICAgY29uc3QgcmVmbGVjdGVkTWVtYmVycyA9IHRoaXMucmVmbGVjdE1lbWJlcnModmFsdWUsIGRlY29yYXRvcnMsIHRydWUpO1xuICAgICAgICAgIGlmIChyZWZsZWN0ZWRNZW1iZXJzKSB7XG4gICAgICAgICAgICBkZWNvcmF0b3JzTWFwLmRlbGV0ZShrZXkgYXMgc3RyaW5nKTtcbiAgICAgICAgICAgIG1lbWJlcnMucHVzaCguLi5yZWZsZWN0ZWRNZW1iZXJzKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIERlYWwgd2l0aCBhbnkgZGVjb3JhdGVkIHByb3BlcnRpZXMgdGhhdCB3ZXJlIG5vdCBpbml0aWFsaXplZCBpbiB0aGUgY2xhc3NcbiAgICBkZWNvcmF0b3JzTWFwLmZvckVhY2goKHZhbHVlLCBrZXkpID0+IHtcbiAgICAgIG1lbWJlcnMucHVzaCh7XG4gICAgICAgIGltcGxlbWVudGF0aW9uOiBudWxsLFxuICAgICAgICBkZWNvcmF0b3JzOiB2YWx1ZSxcbiAgICAgICAgaXNTdGF0aWM6IGZhbHNlLFxuICAgICAgICBraW5kOiBDbGFzc01lbWJlcktpbmQuUHJvcGVydHksXG4gICAgICAgIG5hbWU6IGtleSxcbiAgICAgICAgbmFtZU5vZGU6IG51bGwsXG4gICAgICAgIG5vZGU6IG51bGwsXG4gICAgICAgIHR5cGU6IG51bGwsXG4gICAgICAgIHZhbHVlOiBudWxsXG4gICAgICB9KTtcbiAgICB9KTtcblxuICAgIHJldHVybiBtZW1iZXJzO1xuICB9XG5cbiAgLyoqXG4gICAqIE1lbWJlciBkZWNvcmF0b3JzIG1heSBiZSBkZWNsYXJlZCBhcyBzdGF0aWMgcHJvcGVydGllcyBvZiB0aGUgY2xhc3M6XG4gICAqXG4gICAqIGBgYFxuICAgKiBTb21lRGlyZWN0aXZlLnByb3BEZWNvcmF0b3JzID0ge1xuICAgKiAgIFwibmdGb3JPZlwiOiBbeyB0eXBlOiBJbnB1dCB9LF0sXG4gICAqICAgXCJuZ0ZvclRyYWNrQnlcIjogW3sgdHlwZTogSW5wdXQgfSxdLFxuICAgKiAgIFwibmdGb3JUZW1wbGF0ZVwiOiBbeyB0eXBlOiBJbnB1dCB9LF0sXG4gICAqIH07XG4gICAqIGBgYFxuICAgKlxuICAgKiBAcGFyYW0gZGVjb3JhdG9yc1Byb3BlcnR5IHRoZSBjbGFzcyB3aG9zZSBtZW1iZXIgZGVjb3JhdG9ycyB3ZSBhcmUgaW50ZXJlc3RlZCBpbi5cbiAgICogQHJldHVybnMgYSBtYXAgd2hvc2Uga2V5cyBhcmUgdGhlIG5hbWUgb2YgdGhlIG1lbWJlcnMgYW5kIHdob3NlIHZhbHVlcyBhcmUgY29sbGVjdGlvbnMgb2ZcbiAgICogZGVjb3JhdG9ycyBmb3IgdGhlIGdpdmVuIG1lbWJlci5cbiAgICovXG4gIHByb3RlY3RlZCBnZXRNZW1iZXJEZWNvcmF0b3JzRnJvbVN0YXRpY1Byb3BlcnR5KGRlY29yYXRvcnNQcm9wZXJ0eTogdHMuU3ltYm9sKTpcbiAgICAgIE1hcDxzdHJpbmcsIERlY29yYXRvcltdPiB7XG4gICAgY29uc3QgbWVtYmVyRGVjb3JhdG9ycyA9IG5ldyBNYXA8c3RyaW5nLCBEZWNvcmF0b3JbXT4oKTtcbiAgICAvLyBTeW1ib2wgb2YgdGhlIGlkZW50aWZpZXIgZm9yIGBTb21lRGlyZWN0aXZlLnByb3BEZWNvcmF0b3JzYC5cbiAgICBjb25zdCBwcm9wRGVjb3JhdG9yc01hcCA9IGdldFByb3BlcnR5VmFsdWVGcm9tU3ltYm9sKGRlY29yYXRvcnNQcm9wZXJ0eSk7XG4gICAgaWYgKHByb3BEZWNvcmF0b3JzTWFwICYmIHRzLmlzT2JqZWN0TGl0ZXJhbEV4cHJlc3Npb24ocHJvcERlY29yYXRvcnNNYXApKSB7XG4gICAgICBjb25zdCBwcm9wZXJ0aWVzTWFwID0gcmVmbGVjdE9iamVjdExpdGVyYWwocHJvcERlY29yYXRvcnNNYXApO1xuICAgICAgcHJvcGVydGllc01hcC5mb3JFYWNoKCh2YWx1ZSwgbmFtZSkgPT4ge1xuICAgICAgICBjb25zdCBkZWNvcmF0b3JzID1cbiAgICAgICAgICAgIHRoaXMucmVmbGVjdERlY29yYXRvcnModmFsdWUpLmZpbHRlcihkZWNvcmF0b3IgPT4gdGhpcy5pc0Zyb21Db3JlKGRlY29yYXRvcikpO1xuICAgICAgICBpZiAoZGVjb3JhdG9ycy5sZW5ndGgpIHtcbiAgICAgICAgICBtZW1iZXJEZWNvcmF0b3JzLnNldChuYW1lLCBkZWNvcmF0b3JzKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuICAgIHJldHVybiBtZW1iZXJEZWNvcmF0b3JzO1xuICB9XG5cbiAgLyoqXG4gICAqIEZvciBhIGdpdmVuIGNsYXNzIHN5bWJvbCwgY29sbGVjdHMgYWxsIGRlY29yYXRvciBpbmZvcm1hdGlvbiBmcm9tIHRzbGliIGhlbHBlciBtZXRob2RzLCBhc1xuICAgKiBnZW5lcmF0ZWQgYnkgVHlwZVNjcmlwdCBpbnRvIGVtaXR0ZWQgSmF2YVNjcmlwdCBmaWxlcy5cbiAgICpcbiAgICogQ2xhc3MgZGVjb3JhdG9ycyBhcmUgZXh0cmFjdGVkIGZyb20gY2FsbHMgdG8gYHRzbGliLl9fZGVjb3JhdGVgIHRoYXQgbG9vayBhcyBmb2xsb3dzOlxuICAgKlxuICAgKiBgYGBcbiAgICogbGV0IFNvbWVEaXJlY3RpdmUgPSBjbGFzcyBTb21lRGlyZWN0aXZlIHt9XG4gICAqIFNvbWVEaXJlY3RpdmUgPSBfX2RlY29yYXRlKFtcbiAgICogICBEaXJlY3RpdmUoeyBzZWxlY3RvcjogJ1tzb21lRGlyZWN0aXZlXScgfSksXG4gICAqIF0sIFNvbWVEaXJlY3RpdmUpO1xuICAgKiBgYGBcbiAgICpcbiAgICogVGhlIGV4dHJhY3Rpb24gb2YgbWVtYmVyIGRlY29yYXRvcnMgaXMgc2ltaWxhciwgd2l0aCB0aGUgZGlzdGluY3Rpb24gdGhhdCBpdHMgMm5kIGFuZCAzcmRcbiAgICogYXJndW1lbnQgY29ycmVzcG9uZCB3aXRoIGEgXCJwcm90b3R5cGVcIiB0YXJnZXQgYW5kIHRoZSBuYW1lIG9mIHRoZSBtZW1iZXIgdG8gd2hpY2ggdGhlXG4gICAqIGRlY29yYXRvcnMgYXBwbHkuXG4gICAqXG4gICAqIGBgYFxuICAgKiBfX2RlY29yYXRlKFtcbiAgICogICAgIElucHV0KCksXG4gICAqICAgICBfX21ldGFkYXRhKFwiZGVzaWduOnR5cGVcIiwgU3RyaW5nKVxuICAgKiBdLCBTb21lRGlyZWN0aXZlLnByb3RvdHlwZSwgXCJpbnB1dDFcIiwgdm9pZCAwKTtcbiAgICogYGBgXG4gICAqXG4gICAqIEBwYXJhbSBjbGFzc1N5bWJvbCBUaGUgY2xhc3Mgc3ltYm9sIGZvciB3aGljaCBkZWNvcmF0b3JzIHNob3VsZCBiZSBleHRyYWN0ZWQuXG4gICAqIEByZXR1cm5zIEFsbCBpbmZvcm1hdGlvbiBvbiB0aGUgZGVjb3JhdG9ycyBvZiB0aGUgY2xhc3MuXG4gICAqL1xuICBwcm90ZWN0ZWQgY29tcHV0ZURlY29yYXRvckluZm9Gcm9tSGVscGVyQ2FsbHMoY2xhc3NTeW1ib2w6IE5nY2NDbGFzc1N5bWJvbCk6IERlY29yYXRvckluZm8ge1xuICAgIGxldCBjbGFzc0RlY29yYXRvcnM6IERlY29yYXRvcltdfG51bGwgPSBudWxsO1xuICAgIGNvbnN0IG1lbWJlckRlY29yYXRvcnMgPSBuZXcgTWFwPHN0cmluZywgRGVjb3JhdG9yW10+KCk7XG4gICAgY29uc3QgY29uc3RydWN0b3JQYXJhbUluZm86IFBhcmFtSW5mb1tdID0gW107XG5cbiAgICBjb25zdCBnZXRDb25zdHJ1Y3RvclBhcmFtSW5mbyA9IChpbmRleDogbnVtYmVyKSA9PiB7XG4gICAgICBsZXQgcGFyYW0gPSBjb25zdHJ1Y3RvclBhcmFtSW5mb1tpbmRleF07XG4gICAgICBpZiAocGFyYW0gPT09IHVuZGVmaW5lZCkge1xuICAgICAgICBwYXJhbSA9IGNvbnN0cnVjdG9yUGFyYW1JbmZvW2luZGV4XSA9IHtkZWNvcmF0b3JzOiBudWxsLCB0eXBlRXhwcmVzc2lvbjogbnVsbH07XG4gICAgICB9XG4gICAgICByZXR1cm4gcGFyYW07XG4gICAgfTtcblxuICAgIC8vIEFsbCByZWxldmFudCBpbmZvcm1hdGlvbiBjYW4gYmUgZXh0cmFjdGVkIGZyb20gY2FsbHMgdG8gYF9fZGVjb3JhdGVgLCBvYnRhaW4gdGhlc2UgZmlyc3QuXG4gICAgLy8gTm90ZSB0aGF0IGFsdGhvdWdoIHRoZSBoZWxwZXIgY2FsbHMgYXJlIHJldHJpZXZlZCB1c2luZyB0aGUgY2xhc3Mgc3ltYm9sLCB0aGUgcmVzdWx0IG1heVxuICAgIC8vIGNvbnRhaW4gaGVscGVyIGNhbGxzIGNvcnJlc3BvbmRpbmcgd2l0aCB1bnJlbGF0ZWQgY2xhc3Nlcy4gVGhlcmVmb3JlLCBlYWNoIGhlbHBlciBjYWxsIHN0aWxsXG4gICAgLy8gaGFzIHRvIGJlIGNoZWNrZWQgdG8gYWN0dWFsbHkgY29ycmVzcG9uZCB3aXRoIHRoZSBjbGFzcyBzeW1ib2wuXG4gICAgY29uc3QgaGVscGVyQ2FsbHMgPSB0aGlzLmdldEhlbHBlckNhbGxzRm9yQ2xhc3MoY2xhc3NTeW1ib2wsIFsnX19kZWNvcmF0ZSddKTtcblxuICAgIGNvbnN0IG91dGVyRGVjbGFyYXRpb24gPSBjbGFzc1N5bWJvbC5kZWNsYXJhdGlvbi52YWx1ZURlY2xhcmF0aW9uO1xuICAgIGNvbnN0IGlubmVyRGVjbGFyYXRpb24gPSBjbGFzc1N5bWJvbC5pbXBsZW1lbnRhdGlvbi52YWx1ZURlY2xhcmF0aW9uO1xuICAgIGNvbnN0IG1hdGNoZXNDbGFzcyA9IChpZGVudGlmaWVyOiB0cy5JZGVudGlmaWVyKSA9PiB7XG4gICAgICBjb25zdCBkZWNsID0gdGhpcy5nZXREZWNsYXJhdGlvbk9mSWRlbnRpZmllcihpZGVudGlmaWVyKTtcbiAgICAgIGlmIChkZWNsID09PSBudWxsKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cblxuICAgICAgLy8gVGhlIGlkZW50aWZpZXIgY29ycmVzcG9uZHMgd2l0aCB0aGUgY2xhc3MgaWYgaXRzIGRlY2xhcmF0aW9uIGlzIGVpdGhlciB0aGUgb3V0ZXIgb3IgaW5uZXJcbiAgICAgIC8vIGRlY2xhcmF0aW9uLlxuICAgICAgcmV0dXJuIGRlY2wubm9kZSA9PT0gb3V0ZXJEZWNsYXJhdGlvbiB8fCBkZWNsLm5vZGUgPT09IGlubmVyRGVjbGFyYXRpb247XG4gICAgfTtcblxuICAgIGZvciAoY29uc3QgaGVscGVyQ2FsbCBvZiBoZWxwZXJDYWxscykge1xuICAgICAgaWYgKGlzQ2xhc3NEZWNvcmF0ZUNhbGwoaGVscGVyQ2FsbCwgbWF0Y2hlc0NsYXNzKSkge1xuICAgICAgICAvLyBUaGlzIGBfX2RlY29yYXRlYCBjYWxsIGlzIHRhcmdldGluZyB0aGUgY2xhc3MgaXRzZWxmLlxuICAgICAgICBjb25zdCBoZWxwZXJBcmdzID0gaGVscGVyQ2FsbC5hcmd1bWVudHNbMF07XG5cbiAgICAgICAgZm9yIChjb25zdCBlbGVtZW50IG9mIGhlbHBlckFyZ3MuZWxlbWVudHMpIHtcbiAgICAgICAgICBjb25zdCBlbnRyeSA9IHRoaXMucmVmbGVjdERlY29yYXRlSGVscGVyRW50cnkoZWxlbWVudCk7XG4gICAgICAgICAgaWYgKGVudHJ5ID09PSBudWxsKSB7XG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAoZW50cnkudHlwZSA9PT0gJ2RlY29yYXRvcicpIHtcbiAgICAgICAgICAgIC8vIFRoZSBoZWxwZXIgYXJnIHdhcyByZWZsZWN0ZWQgdG8gcmVwcmVzZW50IGFuIGFjdHVhbCBkZWNvcmF0b3JcbiAgICAgICAgICAgIGlmICh0aGlzLmlzRnJvbUNvcmUoZW50cnkuZGVjb3JhdG9yKSkge1xuICAgICAgICAgICAgICAoY2xhc3NEZWNvcmF0b3JzIHx8IChjbGFzc0RlY29yYXRvcnMgPSBbXSkpLnB1c2goZW50cnkuZGVjb3JhdG9yKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9IGVsc2UgaWYgKGVudHJ5LnR5cGUgPT09ICdwYXJhbTpkZWNvcmF0b3JzJykge1xuICAgICAgICAgICAgLy8gVGhlIGhlbHBlciBhcmcgcmVwcmVzZW50cyBhIGRlY29yYXRvciBmb3IgYSBwYXJhbWV0ZXIuIFNpbmNlIGl0J3MgYXBwbGllZCB0byB0aGVcbiAgICAgICAgICAgIC8vIGNsYXNzLCBpdCBjb3JyZXNwb25kcyB3aXRoIGEgY29uc3RydWN0b3IgcGFyYW1ldGVyIG9mIHRoZSBjbGFzcy5cbiAgICAgICAgICAgIGNvbnN0IHBhcmFtID0gZ2V0Q29uc3RydWN0b3JQYXJhbUluZm8oZW50cnkuaW5kZXgpO1xuICAgICAgICAgICAgKHBhcmFtLmRlY29yYXRvcnMgfHwgKHBhcmFtLmRlY29yYXRvcnMgPSBbXSkpLnB1c2goZW50cnkuZGVjb3JhdG9yKTtcbiAgICAgICAgICB9IGVsc2UgaWYgKGVudHJ5LnR5cGUgPT09ICdwYXJhbXMnKSB7XG4gICAgICAgICAgICAvLyBUaGUgaGVscGVyIGFyZyByZXByZXNlbnRzIHRoZSB0eXBlcyBvZiB0aGUgcGFyYW1ldGVycy4gU2luY2UgaXQncyBhcHBsaWVkIHRvIHRoZVxuICAgICAgICAgICAgLy8gY2xhc3MsIGl0IGNvcnJlc3BvbmRzIHdpdGggdGhlIGNvbnN0cnVjdG9yIHBhcmFtZXRlcnMgb2YgdGhlIGNsYXNzLlxuICAgICAgICAgICAgZW50cnkudHlwZXMuZm9yRWFjaChcbiAgICAgICAgICAgICAgICAodHlwZSwgaW5kZXgpID0+IGdldENvbnN0cnVjdG9yUGFyYW1JbmZvKGluZGV4KS50eXBlRXhwcmVzc2lvbiA9IHR5cGUpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSBlbHNlIGlmIChpc01lbWJlckRlY29yYXRlQ2FsbChoZWxwZXJDYWxsLCBtYXRjaGVzQ2xhc3MpKSB7XG4gICAgICAgIC8vIFRoZSBgX19kZWNvcmF0ZWAgY2FsbCBpcyB0YXJnZXRpbmcgYSBtZW1iZXIgb2YgdGhlIGNsYXNzXG4gICAgICAgIGNvbnN0IGhlbHBlckFyZ3MgPSBoZWxwZXJDYWxsLmFyZ3VtZW50c1swXTtcbiAgICAgICAgY29uc3QgbWVtYmVyTmFtZSA9IGhlbHBlckNhbGwuYXJndW1lbnRzWzJdLnRleHQ7XG5cbiAgICAgICAgZm9yIChjb25zdCBlbGVtZW50IG9mIGhlbHBlckFyZ3MuZWxlbWVudHMpIHtcbiAgICAgICAgICBjb25zdCBlbnRyeSA9IHRoaXMucmVmbGVjdERlY29yYXRlSGVscGVyRW50cnkoZWxlbWVudCk7XG4gICAgICAgICAgaWYgKGVudHJ5ID09PSBudWxsKSB7XG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAoZW50cnkudHlwZSA9PT0gJ2RlY29yYXRvcicpIHtcbiAgICAgICAgICAgIC8vIFRoZSBoZWxwZXIgYXJnIHdhcyByZWZsZWN0ZWQgdG8gcmVwcmVzZW50IGFuIGFjdHVhbCBkZWNvcmF0b3IuXG4gICAgICAgICAgICBpZiAodGhpcy5pc0Zyb21Db3JlKGVudHJ5LmRlY29yYXRvcikpIHtcbiAgICAgICAgICAgICAgY29uc3QgZGVjb3JhdG9ycyA9XG4gICAgICAgICAgICAgICAgICBtZW1iZXJEZWNvcmF0b3JzLmhhcyhtZW1iZXJOYW1lKSA/IG1lbWJlckRlY29yYXRvcnMuZ2V0KG1lbWJlck5hbWUpICEgOiBbXTtcbiAgICAgICAgICAgICAgZGVjb3JhdG9ycy5wdXNoKGVudHJ5LmRlY29yYXRvcik7XG4gICAgICAgICAgICAgIG1lbWJlckRlY29yYXRvcnMuc2V0KG1lbWJlck5hbWUsIGRlY29yYXRvcnMpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyBJbmZvcm1hdGlvbiBvbiBkZWNvcmF0ZWQgcGFyYW1ldGVycyBpcyBub3QgaW50ZXJlc3RpbmcgZm9yIG5nY2MsIHNvIGl0J3MgaWdub3JlZC5cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4ge2NsYXNzRGVjb3JhdG9ycywgbWVtYmVyRGVjb3JhdG9ycywgY29uc3RydWN0b3JQYXJhbUluZm99O1xuICB9XG5cbiAgLyoqXG4gICAqIEV4dHJhY3QgdGhlIGRldGFpbHMgb2YgYW4gZW50cnkgd2l0aGluIGEgYF9fZGVjb3JhdGVgIGhlbHBlciBjYWxsLiBGb3IgZXhhbXBsZSwgZ2l2ZW4gdGhlXG4gICAqIGZvbGxvd2luZyBjb2RlOlxuICAgKlxuICAgKiBgYGBcbiAgICogX19kZWNvcmF0ZShbXG4gICAqICAgRGlyZWN0aXZlKHsgc2VsZWN0b3I6ICdbc29tZURpcmVjdGl2ZV0nIH0pLFxuICAgKiAgIHRzbGliXzEuX19wYXJhbSgyLCBJbmplY3QoSU5KRUNURURfVE9LRU4pKSxcbiAgICogICB0c2xpYl8xLl9fbWV0YWRhdGEoXCJkZXNpZ246cGFyYW10eXBlc1wiLCBbVmlld0NvbnRhaW5lclJlZiwgVGVtcGxhdGVSZWYsIFN0cmluZ10pXG4gICAqIF0sIFNvbWVEaXJlY3RpdmUpO1xuICAgKiBgYGBcbiAgICpcbiAgICogaXQgY2FuIGJlIHNlZW4gdGhhdCB0aGVyZSBhcmUgY2FsbHMgdG8gcmVndWxhciBkZWNvcmF0b3JzICh0aGUgYERpcmVjdGl2ZWApIGFuZCBjYWxscyBpbnRvXG4gICAqIGB0c2xpYmAgZnVuY3Rpb25zIHdoaWNoIGhhdmUgYmVlbiBpbnNlcnRlZCBieSBUeXBlU2NyaXB0LiBUaGVyZWZvcmUsIHRoaXMgZnVuY3Rpb24gY2xhc3NpZmllc1xuICAgKiBhIGNhbGwgdG8gY29ycmVzcG9uZCB3aXRoXG4gICAqICAgMS4gYSByZWFsIGRlY29yYXRvciBsaWtlIGBEaXJlY3RpdmVgIGFib3ZlLCBvclxuICAgKiAgIDIuIGEgZGVjb3JhdGVkIHBhcmFtZXRlciwgY29ycmVzcG9uZGluZyB3aXRoIGBfX3BhcmFtYCBjYWxscyBmcm9tIGB0c2xpYmAsIG9yXG4gICAqICAgMy4gdGhlIHR5cGUgaW5mb3JtYXRpb24gb2YgcGFyYW1ldGVycywgY29ycmVzcG9uZGluZyB3aXRoIGBfX21ldGFkYXRhYCBjYWxsIGZyb20gYHRzbGliYFxuICAgKlxuICAgKiBAcGFyYW0gZXhwcmVzc2lvbiB0aGUgZXhwcmVzc2lvbiB0aGF0IG5lZWRzIHRvIGJlIHJlZmxlY3RlZCBpbnRvIGEgYERlY29yYXRlSGVscGVyRW50cnlgXG4gICAqIEByZXR1cm5zIGFuIG9iamVjdCB0aGF0IGluZGljYXRlcyB3aGljaCBvZiB0aGUgdGhyZWUgY2F0ZWdvcmllcyB0aGUgY2FsbCByZXByZXNlbnRzLCB0b2dldGhlclxuICAgKiB3aXRoIHRoZSByZWZsZWN0ZWQgaW5mb3JtYXRpb24gb2YgdGhlIGNhbGwsIG9yIG51bGwgaWYgdGhlIGNhbGwgaXMgbm90IGEgdmFsaWQgZGVjb3JhdGUgY2FsbC5cbiAgICovXG4gIHByb3RlY3RlZCByZWZsZWN0RGVjb3JhdGVIZWxwZXJFbnRyeShleHByZXNzaW9uOiB0cy5FeHByZXNzaW9uKTogRGVjb3JhdGVIZWxwZXJFbnRyeXxudWxsIHtcbiAgICAvLyBXZSBvbmx5IGNhcmUgYWJvdXQgdGhvc2UgZWxlbWVudHMgdGhhdCBhcmUgYWN0dWFsIGNhbGxzXG4gICAgaWYgKCF0cy5pc0NhbGxFeHByZXNzaW9uKGV4cHJlc3Npb24pKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgY29uc3QgY2FsbCA9IGV4cHJlc3Npb247XG5cbiAgICBjb25zdCBoZWxwZXJOYW1lID0gZ2V0Q2FsbGVlTmFtZShjYWxsKTtcbiAgICBpZiAoaGVscGVyTmFtZSA9PT0gJ19fbWV0YWRhdGEnKSB7XG4gICAgICAvLyBUaGlzIGlzIGEgYHRzbGliLl9fbWV0YWRhdGFgIGNhbGwsIHJlZmxlY3QgdG8gYXJndW1lbnRzIGludG8gYSBgUGFyYW1ldGVyVHlwZXNgIG9iamVjdFxuICAgICAgLy8gaWYgdGhlIG1ldGFkYXRhIGtleSBpcyBcImRlc2lnbjpwYXJhbXR5cGVzXCIuXG4gICAgICBjb25zdCBrZXkgPSBjYWxsLmFyZ3VtZW50c1swXTtcbiAgICAgIGlmIChrZXkgPT09IHVuZGVmaW5lZCB8fCAhdHMuaXNTdHJpbmdMaXRlcmFsKGtleSkgfHwga2V5LnRleHQgIT09ICdkZXNpZ246cGFyYW10eXBlcycpIHtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IHZhbHVlID0gY2FsbC5hcmd1bWVudHNbMV07XG4gICAgICBpZiAodmFsdWUgPT09IHVuZGVmaW5lZCB8fCAhdHMuaXNBcnJheUxpdGVyYWxFeHByZXNzaW9uKHZhbHVlKSkge1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgdHlwZTogJ3BhcmFtcycsXG4gICAgICAgIHR5cGVzOiBBcnJheS5mcm9tKHZhbHVlLmVsZW1lbnRzKSxcbiAgICAgIH07XG4gICAgfVxuXG4gICAgaWYgKGhlbHBlck5hbWUgPT09ICdfX3BhcmFtJykge1xuICAgICAgLy8gVGhpcyBpcyBhIGB0c2xpYi5fX3BhcmFtYCBjYWxsIHRoYXQgaXMgcmVmbGVjdGVkIGludG8gYSBgUGFyYW1ldGVyRGVjb3JhdG9yc2Agb2JqZWN0LlxuICAgICAgY29uc3QgaW5kZXhBcmcgPSBjYWxsLmFyZ3VtZW50c1swXTtcbiAgICAgIGNvbnN0IGluZGV4ID0gaW5kZXhBcmcgJiYgdHMuaXNOdW1lcmljTGl0ZXJhbChpbmRleEFyZykgPyBwYXJzZUludChpbmRleEFyZy50ZXh0LCAxMCkgOiBOYU47XG4gICAgICBpZiAoaXNOYU4oaW5kZXgpKSB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgICAgfVxuXG4gICAgICBjb25zdCBkZWNvcmF0b3JDYWxsID0gY2FsbC5hcmd1bWVudHNbMV07XG4gICAgICBpZiAoZGVjb3JhdG9yQ2FsbCA9PT0gdW5kZWZpbmVkIHx8ICF0cy5pc0NhbGxFeHByZXNzaW9uKGRlY29yYXRvckNhbGwpKSB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgICAgfVxuXG4gICAgICBjb25zdCBkZWNvcmF0b3IgPSB0aGlzLnJlZmxlY3REZWNvcmF0b3JDYWxsKGRlY29yYXRvckNhbGwpO1xuICAgICAgaWYgKGRlY29yYXRvciA9PT0gbnVsbCkge1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgdHlwZTogJ3BhcmFtOmRlY29yYXRvcnMnLFxuICAgICAgICBpbmRleCxcbiAgICAgICAgZGVjb3JhdG9yLFxuICAgICAgfTtcbiAgICB9XG5cbiAgICAvLyBPdGhlcndpc2UgYXR0ZW1wdCB0byByZWZsZWN0IGl0IGFzIGEgcmVndWxhciBkZWNvcmF0b3IuXG4gICAgY29uc3QgZGVjb3JhdG9yID0gdGhpcy5yZWZsZWN0RGVjb3JhdG9yQ2FsbChjYWxsKTtcbiAgICBpZiAoZGVjb3JhdG9yID09PSBudWxsKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgcmV0dXJuIHtcbiAgICAgIHR5cGU6ICdkZWNvcmF0b3InLFxuICAgICAgZGVjb3JhdG9yLFxuICAgIH07XG4gIH1cblxuICBwcm90ZWN0ZWQgcmVmbGVjdERlY29yYXRvckNhbGwoY2FsbDogdHMuQ2FsbEV4cHJlc3Npb24pOiBEZWNvcmF0b3J8bnVsbCB7XG4gICAgY29uc3QgZGVjb3JhdG9yRXhwcmVzc2lvbiA9IGNhbGwuZXhwcmVzc2lvbjtcbiAgICBpZiAoIWlzRGVjb3JhdG9ySWRlbnRpZmllcihkZWNvcmF0b3JFeHByZXNzaW9uKSkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgLy8gV2UgZm91bmQgYSBkZWNvcmF0b3IhXG4gICAgY29uc3QgZGVjb3JhdG9ySWRlbnRpZmllciA9XG4gICAgICAgIHRzLmlzSWRlbnRpZmllcihkZWNvcmF0b3JFeHByZXNzaW9uKSA/IGRlY29yYXRvckV4cHJlc3Npb24gOiBkZWNvcmF0b3JFeHByZXNzaW9uLm5hbWU7XG5cbiAgICByZXR1cm4ge1xuICAgICAgbmFtZTogZGVjb3JhdG9ySWRlbnRpZmllci50ZXh0LFxuICAgICAgaWRlbnRpZmllcjogZGVjb3JhdG9yRXhwcmVzc2lvbixcbiAgICAgIGltcG9ydDogdGhpcy5nZXRJbXBvcnRPZklkZW50aWZpZXIoZGVjb3JhdG9ySWRlbnRpZmllciksXG4gICAgICBub2RlOiBjYWxsLFxuICAgICAgYXJnczogQXJyYXkuZnJvbShjYWxsLmFyZ3VtZW50cyksXG4gICAgfTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDaGVjayB0aGUgZ2l2ZW4gc3RhdGVtZW50IHRvIHNlZSBpZiBpdCBpcyBhIGNhbGwgdG8gYW55IG9mIHRoZSBzcGVjaWZpZWQgaGVscGVyIGZ1bmN0aW9ucyBvclxuICAgKiBudWxsIGlmIG5vdCBmb3VuZC5cbiAgICpcbiAgICogTWF0Y2hpbmcgc3RhdGVtZW50cyB3aWxsIGxvb2sgbGlrZTogIGB0c2xpYl8xLl9fZGVjb3JhdGUoLi4uKTtgLlxuICAgKiBAcGFyYW0gc3RhdGVtZW50IHRoZSBzdGF0ZW1lbnQgdGhhdCBtYXkgY29udGFpbiB0aGUgY2FsbC5cbiAgICogQHBhcmFtIGhlbHBlck5hbWVzIHRoZSBuYW1lcyBvZiB0aGUgaGVscGVyIHdlIGFyZSBsb29raW5nIGZvci5cbiAgICogQHJldHVybnMgdGhlIG5vZGUgdGhhdCBjb3JyZXNwb25kcyB0byB0aGUgYF9fZGVjb3JhdGUoLi4uKWAgY2FsbCBvciBudWxsIGlmIHRoZSBzdGF0ZW1lbnRcbiAgICogZG9lcyBub3QgbWF0Y2guXG4gICAqL1xuICBwcm90ZWN0ZWQgZ2V0SGVscGVyQ2FsbChzdGF0ZW1lbnQ6IHRzLlN0YXRlbWVudCwgaGVscGVyTmFtZXM6IHN0cmluZ1tdKTogdHMuQ2FsbEV4cHJlc3Npb258bnVsbCB7XG4gICAgaWYgKCh0cy5pc0V4cHJlc3Npb25TdGF0ZW1lbnQoc3RhdGVtZW50KSB8fCB0cy5pc1JldHVyblN0YXRlbWVudChzdGF0ZW1lbnQpKSAmJlxuICAgICAgICBzdGF0ZW1lbnQuZXhwcmVzc2lvbikge1xuICAgICAgbGV0IGV4cHJlc3Npb24gPSBzdGF0ZW1lbnQuZXhwcmVzc2lvbjtcbiAgICAgIHdoaWxlIChpc0Fzc2lnbm1lbnQoZXhwcmVzc2lvbikpIHtcbiAgICAgICAgZXhwcmVzc2lvbiA9IGV4cHJlc3Npb24ucmlnaHQ7XG4gICAgICB9XG4gICAgICBpZiAodHMuaXNDYWxsRXhwcmVzc2lvbihleHByZXNzaW9uKSkge1xuICAgICAgICBjb25zdCBjYWxsZWVOYW1lID0gZ2V0Q2FsbGVlTmFtZShleHByZXNzaW9uKTtcbiAgICAgICAgaWYgKGNhbGxlZU5hbWUgIT09IG51bGwgJiYgaGVscGVyTmFtZXMuaW5jbHVkZXMoY2FsbGVlTmFtZSkpIHtcbiAgICAgICAgICByZXR1cm4gZXhwcmVzc2lvbjtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG5cbiAgLyoqXG4gICAqIFJlZmxlY3Qgb3ZlciB0aGUgZ2l2ZW4gYXJyYXkgbm9kZSBhbmQgZXh0cmFjdCBkZWNvcmF0b3IgaW5mb3JtYXRpb24gZnJvbSBlYWNoIGVsZW1lbnQuXG4gICAqXG4gICAqIFRoaXMgaXMgdXNlZCBmb3IgZGVjb3JhdG9ycyB0aGF0IGFyZSBkZWZpbmVkIGluIHN0YXRpYyBwcm9wZXJ0aWVzLiBGb3IgZXhhbXBsZTpcbiAgICpcbiAgICogYGBgXG4gICAqIFNvbWVEaXJlY3RpdmUuZGVjb3JhdG9ycyA9IFtcbiAgICogICB7IHR5cGU6IERpcmVjdGl2ZSwgYXJnczogW3sgc2VsZWN0b3I6ICdbc29tZURpcmVjdGl2ZV0nIH0sXSB9XG4gICAqIF07XG4gICAqIGBgYFxuICAgKlxuICAgKiBAcGFyYW0gZGVjb3JhdG9yc0FycmF5IGFuIGV4cHJlc3Npb24gdGhhdCBjb250YWlucyBkZWNvcmF0b3IgaW5mb3JtYXRpb24uXG4gICAqIEByZXR1cm5zIGFuIGFycmF5IG9mIGRlY29yYXRvciBpbmZvIHRoYXQgd2FzIHJlZmxlY3RlZCBmcm9tIHRoZSBhcnJheSBub2RlLlxuICAgKi9cbiAgcHJvdGVjdGVkIHJlZmxlY3REZWNvcmF0b3JzKGRlY29yYXRvcnNBcnJheTogdHMuRXhwcmVzc2lvbik6IERlY29yYXRvcltdIHtcbiAgICBjb25zdCBkZWNvcmF0b3JzOiBEZWNvcmF0b3JbXSA9IFtdO1xuXG4gICAgaWYgKHRzLmlzQXJyYXlMaXRlcmFsRXhwcmVzc2lvbihkZWNvcmF0b3JzQXJyYXkpKSB7XG4gICAgICAvLyBBZGQgZWFjaCBkZWNvcmF0b3IgdGhhdCBpcyBpbXBvcnRlZCBmcm9tIGBAYW5ndWxhci9jb3JlYCBpbnRvIHRoZSBgZGVjb3JhdG9yc2AgYXJyYXlcbiAgICAgIGRlY29yYXRvcnNBcnJheS5lbGVtZW50cy5mb3JFYWNoKG5vZGUgPT4ge1xuXG4gICAgICAgIC8vIElmIHRoZSBkZWNvcmF0b3IgaXMgbm90IGFuIG9iamVjdCBsaXRlcmFsIGV4cHJlc3Npb24gdGhlbiB3ZSBhcmUgbm90IGludGVyZXN0ZWRcbiAgICAgICAgaWYgKHRzLmlzT2JqZWN0TGl0ZXJhbEV4cHJlc3Npb24obm9kZSkpIHtcbiAgICAgICAgICAvLyBXZSBhcmUgb25seSBpbnRlcmVzdGVkIGluIG9iamVjdHMgb2YgdGhlIGZvcm06IGB7IHR5cGU6IERlY29yYXRvclR5cGUsIGFyZ3M6IFsuLi5dIH1gXG4gICAgICAgICAgY29uc3QgZGVjb3JhdG9yID0gcmVmbGVjdE9iamVjdExpdGVyYWwobm9kZSk7XG5cbiAgICAgICAgICAvLyBJcyB0aGUgdmFsdWUgb2YgdGhlIGB0eXBlYCBwcm9wZXJ0eSBhbiBpZGVudGlmaWVyP1xuICAgICAgICAgIGlmIChkZWNvcmF0b3IuaGFzKCd0eXBlJykpIHtcbiAgICAgICAgICAgIGxldCBkZWNvcmF0b3JUeXBlID0gZGVjb3JhdG9yLmdldCgndHlwZScpICE7XG4gICAgICAgICAgICBpZiAoaXNEZWNvcmF0b3JJZGVudGlmaWVyKGRlY29yYXRvclR5cGUpKSB7XG4gICAgICAgICAgICAgIGNvbnN0IGRlY29yYXRvcklkZW50aWZpZXIgPVxuICAgICAgICAgICAgICAgICAgdHMuaXNJZGVudGlmaWVyKGRlY29yYXRvclR5cGUpID8gZGVjb3JhdG9yVHlwZSA6IGRlY29yYXRvclR5cGUubmFtZTtcbiAgICAgICAgICAgICAgZGVjb3JhdG9ycy5wdXNoKHtcbiAgICAgICAgICAgICAgICBuYW1lOiBkZWNvcmF0b3JJZGVudGlmaWVyLnRleHQsXG4gICAgICAgICAgICAgICAgaWRlbnRpZmllcjogZGVjb3JhdG9yVHlwZSxcbiAgICAgICAgICAgICAgICBpbXBvcnQ6IHRoaXMuZ2V0SW1wb3J0T2ZJZGVudGlmaWVyKGRlY29yYXRvcklkZW50aWZpZXIpLCBub2RlLFxuICAgICAgICAgICAgICAgIGFyZ3M6IGdldERlY29yYXRvckFyZ3Mobm9kZSksXG4gICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuICAgIHJldHVybiBkZWNvcmF0b3JzO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlZmxlY3Qgb3ZlciBhIHN5bWJvbCBhbmQgZXh0cmFjdCB0aGUgbWVtYmVyIGluZm9ybWF0aW9uLCBjb21iaW5pbmcgaXQgd2l0aCB0aGVcbiAgICogcHJvdmlkZWQgZGVjb3JhdG9yIGluZm9ybWF0aW9uLCBhbmQgd2hldGhlciBpdCBpcyBhIHN0YXRpYyBtZW1iZXIuXG4gICAqXG4gICAqIEEgc2luZ2xlIHN5bWJvbCBtYXkgcmVwcmVzZW50IG11bHRpcGxlIGNsYXNzIG1lbWJlcnMgaW4gdGhlIGNhc2Ugb2YgYWNjZXNzb3JzO1xuICAgKiBhbiBlcXVhbGx5IG5hbWVkIGdldHRlci9zZXR0ZXIgYWNjZXNzb3IgcGFpciBpcyBjb21iaW5lZCBpbnRvIGEgc2luZ2xlIHN5bWJvbC5cbiAgICogV2hlbiB0aGUgc3ltYm9sIGlzIHJlY29nbml6ZWQgYXMgcmVwcmVzZW50aW5nIGFuIGFjY2Vzc29yLCBpdHMgZGVjbGFyYXRpb25zIGFyZVxuICAgKiBhbmFseXplZCBzdWNoIHRoYXQgYm90aCB0aGUgc2V0dGVyIGFuZCBnZXR0ZXIgYWNjZXNzb3IgYXJlIHJldHVybmVkIGFzIHNlcGFyYXRlXG4gICAqIGNsYXNzIG1lbWJlcnMuXG4gICAqXG4gICAqIE9uZSBkaWZmZXJlbmNlIHdydCB0aGUgVHlwZVNjcmlwdCBob3N0IGlzIHRoYXQgaW4gRVMyMDE1LCB3ZSBjYW5ub3Qgc2VlIHdoaWNoXG4gICAqIGFjY2Vzc29yIG9yaWdpbmFsbHkgaGFkIGFueSBkZWNvcmF0b3JzIGFwcGxpZWQgdG8gdGhlbSwgYXMgZGVjb3JhdG9ycyBhcmUgYXBwbGllZFxuICAgKiB0byB0aGUgcHJvcGVydHkgZGVzY3JpcHRvciBpbiBnZW5lcmFsLCBub3QgYSBzcGVjaWZpYyBhY2Nlc3Nvci4gSWYgYW4gYWNjZXNzb3JcbiAgICogaGFzIGJvdGggYSBzZXR0ZXIgYW5kIGdldHRlciwgYW55IGRlY29yYXRvcnMgYXJlIG9ubHkgYXR0YWNoZWQgdG8gdGhlIHNldHRlciBtZW1iZXIuXG4gICAqXG4gICAqIEBwYXJhbSBzeW1ib2wgdGhlIHN5bWJvbCBmb3IgdGhlIG1lbWJlciB0byByZWZsZWN0IG92ZXIuXG4gICAqIEBwYXJhbSBkZWNvcmF0b3JzIGFuIGFycmF5IG9mIGRlY29yYXRvcnMgYXNzb2NpYXRlZCB3aXRoIHRoZSBtZW1iZXIuXG4gICAqIEBwYXJhbSBpc1N0YXRpYyB0cnVlIGlmIHRoaXMgbWVtYmVyIGlzIHN0YXRpYywgZmFsc2UgaWYgaXQgaXMgYW4gaW5zdGFuY2UgcHJvcGVydHkuXG4gICAqIEByZXR1cm5zIHRoZSByZWZsZWN0ZWQgbWVtYmVyIGluZm9ybWF0aW9uLCBvciBudWxsIGlmIHRoZSBzeW1ib2wgaXMgbm90IGEgbWVtYmVyLlxuICAgKi9cbiAgcHJvdGVjdGVkIHJlZmxlY3RNZW1iZXJzKHN5bWJvbDogdHMuU3ltYm9sLCBkZWNvcmF0b3JzPzogRGVjb3JhdG9yW10sIGlzU3RhdGljPzogYm9vbGVhbik6XG4gICAgICBDbGFzc01lbWJlcltdfG51bGwge1xuICAgIGlmIChzeW1ib2wuZmxhZ3MgJiB0cy5TeW1ib2xGbGFncy5BY2Nlc3Nvcikge1xuICAgICAgY29uc3QgbWVtYmVyczogQ2xhc3NNZW1iZXJbXSA9IFtdO1xuICAgICAgY29uc3Qgc2V0dGVyID0gc3ltYm9sLmRlY2xhcmF0aW9ucyAmJiBzeW1ib2wuZGVjbGFyYXRpb25zLmZpbmQodHMuaXNTZXRBY2Nlc3Nvcik7XG4gICAgICBjb25zdCBnZXR0ZXIgPSBzeW1ib2wuZGVjbGFyYXRpb25zICYmIHN5bWJvbC5kZWNsYXJhdGlvbnMuZmluZCh0cy5pc0dldEFjY2Vzc29yKTtcblxuICAgICAgY29uc3Qgc2V0dGVyTWVtYmVyID1cbiAgICAgICAgICBzZXR0ZXIgJiYgdGhpcy5yZWZsZWN0TWVtYmVyKHNldHRlciwgQ2xhc3NNZW1iZXJLaW5kLlNldHRlciwgZGVjb3JhdG9ycywgaXNTdGF0aWMpO1xuICAgICAgaWYgKHNldHRlck1lbWJlcikge1xuICAgICAgICBtZW1iZXJzLnB1c2goc2V0dGVyTWVtYmVyKTtcblxuICAgICAgICAvLyBQcmV2ZW50IGF0dGFjaGluZyB0aGUgZGVjb3JhdG9ycyB0byBhIHBvdGVudGlhbCBnZXR0ZXIuIEluIEVTMjAxNSwgd2UgY2FuJ3QgdGVsbCB3aGVyZVxuICAgICAgICAvLyB0aGUgZGVjb3JhdG9ycyB3ZXJlIG9yaWdpbmFsbHkgYXR0YWNoZWQgdG8sIGhvd2V2ZXIgd2Ugb25seSB3YW50IHRvIGF0dGFjaCB0aGVtIHRvIGFcbiAgICAgICAgLy8gc2luZ2xlIGBDbGFzc01lbWJlcmAgYXMgb3RoZXJ3aXNlIG5ndHNjIHdvdWxkIGhhbmRsZSB0aGUgc2FtZSBkZWNvcmF0b3JzIHR3aWNlLlxuICAgICAgICBkZWNvcmF0b3JzID0gdW5kZWZpbmVkO1xuICAgICAgfVxuXG4gICAgICBjb25zdCBnZXR0ZXJNZW1iZXIgPVxuICAgICAgICAgIGdldHRlciAmJiB0aGlzLnJlZmxlY3RNZW1iZXIoZ2V0dGVyLCBDbGFzc01lbWJlcktpbmQuR2V0dGVyLCBkZWNvcmF0b3JzLCBpc1N0YXRpYyk7XG4gICAgICBpZiAoZ2V0dGVyTWVtYmVyKSB7XG4gICAgICAgIG1lbWJlcnMucHVzaChnZXR0ZXJNZW1iZXIpO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gbWVtYmVycztcbiAgICB9XG5cbiAgICBsZXQga2luZDogQ2xhc3NNZW1iZXJLaW5kfG51bGwgPSBudWxsO1xuICAgIGlmIChzeW1ib2wuZmxhZ3MgJiB0cy5TeW1ib2xGbGFncy5NZXRob2QpIHtcbiAgICAgIGtpbmQgPSBDbGFzc01lbWJlcktpbmQuTWV0aG9kO1xuICAgIH0gZWxzZSBpZiAoc3ltYm9sLmZsYWdzICYgdHMuU3ltYm9sRmxhZ3MuUHJvcGVydHkpIHtcbiAgICAgIGtpbmQgPSBDbGFzc01lbWJlcktpbmQuUHJvcGVydHk7XG4gICAgfVxuXG4gICAgY29uc3Qgbm9kZSA9IHN5bWJvbC52YWx1ZURlY2xhcmF0aW9uIHx8IHN5bWJvbC5kZWNsYXJhdGlvbnMgJiYgc3ltYm9sLmRlY2xhcmF0aW9uc1swXTtcbiAgICBpZiAoIW5vZGUpIHtcbiAgICAgIC8vIElmIHRoZSBzeW1ib2wgaGFzIGJlZW4gaW1wb3J0ZWQgZnJvbSBhIFR5cGVTY3JpcHQgdHlwaW5ncyBmaWxlIHRoZW4gdGhlIGNvbXBpbGVyXG4gICAgICAvLyBtYXkgcGFzcyB0aGUgYHByb3RvdHlwZWAgc3ltYm9sIGFzIGFuIGV4cG9ydCBvZiB0aGUgY2xhc3MuXG4gICAgICAvLyBCdXQgdGhpcyBoYXMgbm8gZGVjbGFyYXRpb24uIEluIHRoaXMgY2FzZSB3ZSBqdXN0IHF1aWV0bHkgaWdub3JlIGl0LlxuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgY29uc3QgbWVtYmVyID0gdGhpcy5yZWZsZWN0TWVtYmVyKG5vZGUsIGtpbmQsIGRlY29yYXRvcnMsIGlzU3RhdGljKTtcbiAgICBpZiAoIW1lbWJlcikge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgcmV0dXJuIFttZW1iZXJdO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlZmxlY3Qgb3ZlciBhIHN5bWJvbCBhbmQgZXh0cmFjdCB0aGUgbWVtYmVyIGluZm9ybWF0aW9uLCBjb21iaW5pbmcgaXQgd2l0aCB0aGVcbiAgICogcHJvdmlkZWQgZGVjb3JhdG9yIGluZm9ybWF0aW9uLCBhbmQgd2hldGhlciBpdCBpcyBhIHN0YXRpYyBtZW1iZXIuXG4gICAqIEBwYXJhbSBub2RlIHRoZSBkZWNsYXJhdGlvbiBub2RlIGZvciB0aGUgbWVtYmVyIHRvIHJlZmxlY3Qgb3Zlci5cbiAgICogQHBhcmFtIGtpbmQgdGhlIGFzc3VtZWQga2luZCBvZiB0aGUgbWVtYmVyLCBtYXkgYmVjb21lIG1vcmUgYWNjdXJhdGUgZHVyaW5nIHJlZmxlY3Rpb24uXG4gICAqIEBwYXJhbSBkZWNvcmF0b3JzIGFuIGFycmF5IG9mIGRlY29yYXRvcnMgYXNzb2NpYXRlZCB3aXRoIHRoZSBtZW1iZXIuXG4gICAqIEBwYXJhbSBpc1N0YXRpYyB0cnVlIGlmIHRoaXMgbWVtYmVyIGlzIHN0YXRpYywgZmFsc2UgaWYgaXQgaXMgYW4gaW5zdGFuY2UgcHJvcGVydHkuXG4gICAqIEByZXR1cm5zIHRoZSByZWZsZWN0ZWQgbWVtYmVyIGluZm9ybWF0aW9uLCBvciBudWxsIGlmIHRoZSBzeW1ib2wgaXMgbm90IGEgbWVtYmVyLlxuICAgKi9cbiAgcHJvdGVjdGVkIHJlZmxlY3RNZW1iZXIoXG4gICAgICBub2RlOiB0cy5EZWNsYXJhdGlvbiwga2luZDogQ2xhc3NNZW1iZXJLaW5kfG51bGwsIGRlY29yYXRvcnM/OiBEZWNvcmF0b3JbXSxcbiAgICAgIGlzU3RhdGljPzogYm9vbGVhbik6IENsYXNzTWVtYmVyfG51bGwge1xuICAgIGxldCB2YWx1ZTogdHMuRXhwcmVzc2lvbnxudWxsID0gbnVsbDtcbiAgICBsZXQgbmFtZTogc3RyaW5nfG51bGwgPSBudWxsO1xuICAgIGxldCBuYW1lTm9kZTogdHMuSWRlbnRpZmllcnxudWxsID0gbnVsbDtcblxuICAgIGlmICghaXNDbGFzc01lbWJlclR5cGUobm9kZSkpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIGlmIChpc1N0YXRpYyAmJiBpc1Byb3BlcnR5QWNjZXNzKG5vZGUpKSB7XG4gICAgICBuYW1lID0gbm9kZS5uYW1lLnRleHQ7XG4gICAgICB2YWx1ZSA9IGtpbmQgPT09IENsYXNzTWVtYmVyS2luZC5Qcm9wZXJ0eSA/IG5vZGUucGFyZW50LnJpZ2h0IDogbnVsbDtcbiAgICB9IGVsc2UgaWYgKGlzVGhpc0Fzc2lnbm1lbnQobm9kZSkpIHtcbiAgICAgIGtpbmQgPSBDbGFzc01lbWJlcktpbmQuUHJvcGVydHk7XG4gICAgICBuYW1lID0gbm9kZS5sZWZ0Lm5hbWUudGV4dDtcbiAgICAgIHZhbHVlID0gbm9kZS5yaWdodDtcbiAgICAgIGlzU3RhdGljID0gZmFsc2U7XG4gICAgfSBlbHNlIGlmICh0cy5pc0NvbnN0cnVjdG9yRGVjbGFyYXRpb24obm9kZSkpIHtcbiAgICAgIGtpbmQgPSBDbGFzc01lbWJlcktpbmQuQ29uc3RydWN0b3I7XG4gICAgICBuYW1lID0gJ2NvbnN0cnVjdG9yJztcbiAgICAgIGlzU3RhdGljID0gZmFsc2U7XG4gICAgfVxuXG4gICAgaWYgKGtpbmQgPT09IG51bGwpIHtcbiAgICAgIHRoaXMubG9nZ2VyLndhcm4oYFVua25vd24gbWVtYmVyIHR5cGU6IFwiJHtub2RlLmdldFRleHQoKX1gKTtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIGlmICghbmFtZSkge1xuICAgICAgaWYgKGlzTmFtZWREZWNsYXJhdGlvbihub2RlKSkge1xuICAgICAgICBuYW1lID0gbm9kZS5uYW1lLnRleHQ7XG4gICAgICAgIG5hbWVOb2RlID0gbm9kZS5uYW1lO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gSWYgd2UgaGF2ZSBzdGlsbCBub3QgZGV0ZXJtaW5lZCBpZiB0aGlzIGlzIGEgc3RhdGljIG9yIGluc3RhbmNlIG1lbWJlciB0aGVuXG4gICAgLy8gbG9vayBmb3IgdGhlIGBzdGF0aWNgIGtleXdvcmQgb24gdGhlIGRlY2xhcmF0aW9uXG4gICAgaWYgKGlzU3RhdGljID09PSB1bmRlZmluZWQpIHtcbiAgICAgIGlzU3RhdGljID0gbm9kZS5tb2RpZmllcnMgIT09IHVuZGVmaW5lZCAmJlxuICAgICAgICAgIG5vZGUubW9kaWZpZXJzLnNvbWUobW9kID0+IG1vZC5raW5kID09PSB0cy5TeW50YXhLaW5kLlN0YXRpY0tleXdvcmQpO1xuICAgIH1cblxuICAgIGNvbnN0IHR5cGU6IHRzLlR5cGVOb2RlID0gKG5vZGUgYXMgYW55KS50eXBlIHx8IG51bGw7XG4gICAgcmV0dXJuIHtcbiAgICAgIG5vZGUsXG4gICAgICBpbXBsZW1lbnRhdGlvbjogbm9kZSwga2luZCwgdHlwZSwgbmFtZSwgbmFtZU5vZGUsIHZhbHVlLCBpc1N0YXRpYyxcbiAgICAgIGRlY29yYXRvcnM6IGRlY29yYXRvcnMgfHwgW11cbiAgICB9O1xuICB9XG5cbiAgLyoqXG4gICAqIEZpbmQgdGhlIGRlY2xhcmF0aW9ucyBvZiB0aGUgY29uc3RydWN0b3IgcGFyYW1ldGVycyBvZiBhIGNsYXNzIGlkZW50aWZpZWQgYnkgaXRzIHN5bWJvbC5cbiAgICogQHBhcmFtIGNsYXNzU3ltYm9sIHRoZSBjbGFzcyB3aG9zZSBwYXJhbWV0ZXJzIHdlIHdhbnQgdG8gZmluZC5cbiAgICogQHJldHVybnMgYW4gYXJyYXkgb2YgYHRzLlBhcmFtZXRlckRlY2xhcmF0aW9uYCBvYmplY3RzIHJlcHJlc2VudGluZyBlYWNoIG9mIHRoZSBwYXJhbWV0ZXJzIGluXG4gICAqIHRoZSBjbGFzcydzIGNvbnN0cnVjdG9yIG9yIG51bGwgaWYgdGhlcmUgaXMgbm8gY29uc3RydWN0b3IuXG4gICAqL1xuICBwcm90ZWN0ZWQgZ2V0Q29uc3RydWN0b3JQYXJhbWV0ZXJEZWNsYXJhdGlvbnMoY2xhc3NTeW1ib2w6IE5nY2NDbGFzc1N5bWJvbCk6XG4gICAgICB0cy5QYXJhbWV0ZXJEZWNsYXJhdGlvbltdfG51bGwge1xuICAgIGNvbnN0IG1lbWJlcnMgPSBjbGFzc1N5bWJvbC5pbXBsZW1lbnRhdGlvbi5tZW1iZXJzO1xuICAgIGlmIChtZW1iZXJzICYmIG1lbWJlcnMuaGFzKENPTlNUUlVDVE9SKSkge1xuICAgICAgY29uc3QgY29uc3RydWN0b3JTeW1ib2wgPSBtZW1iZXJzLmdldChDT05TVFJVQ1RPUikgITtcbiAgICAgIC8vIEZvciBzb21lIHJlYXNvbiB0aGUgY29uc3RydWN0b3IgZG9lcyBub3QgaGF2ZSBhIGB2YWx1ZURlY2xhcmF0aW9uYCA/IT9cbiAgICAgIGNvbnN0IGNvbnN0cnVjdG9yID0gY29uc3RydWN0b3JTeW1ib2wuZGVjbGFyYXRpb25zICYmXG4gICAgICAgICAgY29uc3RydWN0b3JTeW1ib2wuZGVjbGFyYXRpb25zWzBdIGFzIHRzLkNvbnN0cnVjdG9yRGVjbGFyYXRpb24gfCB1bmRlZmluZWQ7XG4gICAgICBpZiAoIWNvbnN0cnVjdG9yKSB7XG4gICAgICAgIHJldHVybiBbXTtcbiAgICAgIH1cbiAgICAgIGlmIChjb25zdHJ1Y3Rvci5wYXJhbWV0ZXJzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgcmV0dXJuIEFycmF5LmZyb20oY29uc3RydWN0b3IucGFyYW1ldGVycyk7XG4gICAgICB9XG4gICAgICBpZiAoaXNTeW50aGVzaXplZENvbnN0cnVjdG9yKGNvbnN0cnVjdG9yKSkge1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgIH1cbiAgICAgIHJldHVybiBbXTtcbiAgICB9XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICAvKipcbiAgICogR2V0IHRoZSBwYXJhbWV0ZXIgZGVjb3JhdG9ycyBvZiBhIGNsYXNzIGNvbnN0cnVjdG9yLlxuICAgKlxuICAgKiBAcGFyYW0gY2xhc3NTeW1ib2wgdGhlIGNsYXNzIHdob3NlIHBhcmFtZXRlciBpbmZvIHdlIHdhbnQgdG8gZ2V0LlxuICAgKiBAcGFyYW0gcGFyYW1ldGVyTm9kZXMgdGhlIGFycmF5IG9mIFR5cGVTY3JpcHQgcGFyYW1ldGVyIG5vZGVzIGZvciB0aGlzIGNsYXNzJ3MgY29uc3RydWN0b3IuXG4gICAqIEByZXR1cm5zIGFuIGFycmF5IG9mIGNvbnN0cnVjdG9yIHBhcmFtZXRlciBpbmZvIG9iamVjdHMuXG4gICAqL1xuICBwcm90ZWN0ZWQgZ2V0Q29uc3RydWN0b3JQYXJhbUluZm8oXG4gICAgICBjbGFzc1N5bWJvbDogTmdjY0NsYXNzU3ltYm9sLCBwYXJhbWV0ZXJOb2RlczogdHMuUGFyYW1ldGVyRGVjbGFyYXRpb25bXSk6IEN0b3JQYXJhbWV0ZXJbXSB7XG4gICAgY29uc3Qge2NvbnN0cnVjdG9yUGFyYW1JbmZvfSA9IHRoaXMuYWNxdWlyZURlY29yYXRvckluZm8oY2xhc3NTeW1ib2wpO1xuXG4gICAgcmV0dXJuIHBhcmFtZXRlck5vZGVzLm1hcCgobm9kZSwgaW5kZXgpID0+IHtcbiAgICAgIGNvbnN0IHtkZWNvcmF0b3JzLCB0eXBlRXhwcmVzc2lvbn0gPSBjb25zdHJ1Y3RvclBhcmFtSW5mb1tpbmRleF0gP1xuICAgICAgICAgIGNvbnN0cnVjdG9yUGFyYW1JbmZvW2luZGV4XSA6XG4gICAgICAgICAge2RlY29yYXRvcnM6IG51bGwsIHR5cGVFeHByZXNzaW9uOiBudWxsfTtcbiAgICAgIGNvbnN0IG5hbWVOb2RlID0gbm9kZS5uYW1lO1xuXG4gICAgICBsZXQgdHlwZVZhbHVlUmVmZXJlbmNlOiBUeXBlVmFsdWVSZWZlcmVuY2V8bnVsbCA9IG51bGw7XG4gICAgICBpZiAodHlwZUV4cHJlc3Npb24gIT09IG51bGwpIHtcbiAgICAgICAgLy8gYHR5cGVFeHByZXNzaW9uYCBpcyBhbiBleHByZXNzaW9uIGluIGEgXCJ0eXBlXCIgY29udGV4dC4gUmVzb2x2ZSBpdCB0byBhIGRlY2xhcmVkIHZhbHVlLlxuICAgICAgICAvLyBFaXRoZXIgaXQncyBhIHJlZmVyZW5jZSB0byBhbiBpbXBvcnRlZCB0eXBlLCBvciBhIHR5cGUgZGVjbGFyZWQgbG9jYWxseS4gRGlzdGluZ3Vpc2ggdGhlXG4gICAgICAgIC8vIHR3byBjYXNlcyB3aXRoIGBnZXREZWNsYXJhdGlvbk9mRXhwcmVzc2lvbmAuXG4gICAgICAgIGNvbnN0IGRlY2wgPSB0aGlzLmdldERlY2xhcmF0aW9uT2ZFeHByZXNzaW9uKHR5cGVFeHByZXNzaW9uKTtcbiAgICAgICAgaWYgKGRlY2wgIT09IG51bGwgJiYgZGVjbC5ub2RlICE9PSBudWxsICYmIGRlY2wudmlhTW9kdWxlICE9PSBudWxsICYmXG4gICAgICAgICAgICBpc05hbWVkRGVjbGFyYXRpb24oZGVjbC5ub2RlKSkge1xuICAgICAgICAgIHR5cGVWYWx1ZVJlZmVyZW5jZSA9IHtcbiAgICAgICAgICAgIGxvY2FsOiBmYWxzZSxcbiAgICAgICAgICAgIHZhbHVlRGVjbGFyYXRpb246IGRlY2wubm9kZSxcbiAgICAgICAgICAgIG1vZHVsZU5hbWU6IGRlY2wudmlhTW9kdWxlLFxuICAgICAgICAgICAgbmFtZTogZGVjbC5ub2RlLm5hbWUudGV4dCxcbiAgICAgICAgICB9O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHR5cGVWYWx1ZVJlZmVyZW5jZSA9IHtcbiAgICAgICAgICAgIGxvY2FsOiB0cnVlLFxuICAgICAgICAgICAgZXhwcmVzc2lvbjogdHlwZUV4cHJlc3Npb24sXG4gICAgICAgICAgICBkZWZhdWx0SW1wb3J0U3RhdGVtZW50OiBudWxsLFxuICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgbmFtZTogZ2V0TmFtZVRleHQobmFtZU5vZGUpLFxuICAgICAgICBuYW1lTm9kZSxcbiAgICAgICAgdHlwZVZhbHVlUmVmZXJlbmNlLFxuICAgICAgICB0eXBlTm9kZTogbnVsbCwgZGVjb3JhdG9yc1xuICAgICAgfTtcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgdGhlIHBhcmFtZXRlciB0eXBlIGFuZCBkZWNvcmF0b3JzIGZvciB0aGUgY29uc3RydWN0b3Igb2YgYSBjbGFzcyxcbiAgICogd2hlcmUgdGhlIGluZm9ybWF0aW9uIGlzIHN0b3JlZCBvbiBhIHN0YXRpYyBwcm9wZXJ0eSBvZiB0aGUgY2xhc3MuXG4gICAqXG4gICAqIE5vdGUgdGhhdCBpbiBFU00yMDE1LCB0aGUgcHJvcGVydHkgaXMgZGVmaW5lZCBhbiBhcnJheSwgb3IgYnkgYW4gYXJyb3cgZnVuY3Rpb24gdGhhdCByZXR1cm5zXG4gICAqIGFuIGFycmF5LCBvZiBkZWNvcmF0b3IgYW5kIHR5cGUgaW5mb3JtYXRpb24uXG4gICAqXG4gICAqIEZvciBleGFtcGxlLFxuICAgKlxuICAgKiBgYGBcbiAgICogU29tZURpcmVjdGl2ZS5jdG9yUGFyYW1ldGVycyA9ICgpID0+IFtcbiAgICogICB7dHlwZTogVmlld0NvbnRhaW5lclJlZn0sXG4gICAqICAge3R5cGU6IFRlbXBsYXRlUmVmfSxcbiAgICogICB7dHlwZTogdW5kZWZpbmVkLCBkZWNvcmF0b3JzOiBbeyB0eXBlOiBJbmplY3QsIGFyZ3M6IFtJTkpFQ1RFRF9UT0tFTl19XX0sXG4gICAqIF07XG4gICAqIGBgYFxuICAgKlxuICAgKiBvclxuICAgKlxuICAgKiBgYGBcbiAgICogU29tZURpcmVjdGl2ZS5jdG9yUGFyYW1ldGVycyA9IFtcbiAgICogICB7dHlwZTogVmlld0NvbnRhaW5lclJlZn0sXG4gICAqICAge3R5cGU6IFRlbXBsYXRlUmVmfSxcbiAgICogICB7dHlwZTogdW5kZWZpbmVkLCBkZWNvcmF0b3JzOiBbe3R5cGU6IEluamVjdCwgYXJnczogW0lOSkVDVEVEX1RPS0VOXX1dfSxcbiAgICogXTtcbiAgICogYGBgXG4gICAqXG4gICAqIEBwYXJhbSBwYXJhbURlY29yYXRvcnNQcm9wZXJ0eSB0aGUgcHJvcGVydHkgdGhhdCBob2xkcyB0aGUgcGFyYW1ldGVyIGluZm8gd2Ugd2FudCB0byBnZXQuXG4gICAqIEByZXR1cm5zIGFuIGFycmF5IG9mIG9iamVjdHMgY29udGFpbmluZyB0aGUgdHlwZSBhbmQgZGVjb3JhdG9ycyBmb3IgZWFjaCBwYXJhbWV0ZXIuXG4gICAqL1xuICBwcm90ZWN0ZWQgZ2V0UGFyYW1JbmZvRnJvbVN0YXRpY1Byb3BlcnR5KHBhcmFtRGVjb3JhdG9yc1Byb3BlcnR5OiB0cy5TeW1ib2wpOiBQYXJhbUluZm9bXXxudWxsIHtcbiAgICBjb25zdCBwYXJhbURlY29yYXRvcnMgPSBnZXRQcm9wZXJ0eVZhbHVlRnJvbVN5bWJvbChwYXJhbURlY29yYXRvcnNQcm9wZXJ0eSk7XG4gICAgaWYgKHBhcmFtRGVjb3JhdG9ycykge1xuICAgICAgLy8gVGhlIGRlY29yYXRvcnMgYXJyYXkgbWF5IGJlIHdyYXBwZWQgaW4gYW4gYXJyb3cgZnVuY3Rpb24uIElmIHNvIHVud3JhcCBpdC5cbiAgICAgIGNvbnN0IGNvbnRhaW5lciA9XG4gICAgICAgICAgdHMuaXNBcnJvd0Z1bmN0aW9uKHBhcmFtRGVjb3JhdG9ycykgPyBwYXJhbURlY29yYXRvcnMuYm9keSA6IHBhcmFtRGVjb3JhdG9ycztcbiAgICAgIGlmICh0cy5pc0FycmF5TGl0ZXJhbEV4cHJlc3Npb24oY29udGFpbmVyKSkge1xuICAgICAgICBjb25zdCBlbGVtZW50cyA9IGNvbnRhaW5lci5lbGVtZW50cztcbiAgICAgICAgcmV0dXJuIGVsZW1lbnRzXG4gICAgICAgICAgICAubWFwKFxuICAgICAgICAgICAgICAgIGVsZW1lbnQgPT5cbiAgICAgICAgICAgICAgICAgICAgdHMuaXNPYmplY3RMaXRlcmFsRXhwcmVzc2lvbihlbGVtZW50KSA/IHJlZmxlY3RPYmplY3RMaXRlcmFsKGVsZW1lbnQpIDogbnVsbClcbiAgICAgICAgICAgIC5tYXAocGFyYW1JbmZvID0+IHtcbiAgICAgICAgICAgICAgY29uc3QgdHlwZUV4cHJlc3Npb24gPVxuICAgICAgICAgICAgICAgICAgcGFyYW1JbmZvICYmIHBhcmFtSW5mby5oYXMoJ3R5cGUnKSA/IHBhcmFtSW5mby5nZXQoJ3R5cGUnKSAhIDogbnVsbDtcbiAgICAgICAgICAgICAgY29uc3QgZGVjb3JhdG9ySW5mbyA9XG4gICAgICAgICAgICAgICAgICBwYXJhbUluZm8gJiYgcGFyYW1JbmZvLmhhcygnZGVjb3JhdG9ycycpID8gcGFyYW1JbmZvLmdldCgnZGVjb3JhdG9ycycpICEgOiBudWxsO1xuICAgICAgICAgICAgICBjb25zdCBkZWNvcmF0b3JzID0gZGVjb3JhdG9ySW5mbyAmJlxuICAgICAgICAgICAgICAgICAgdGhpcy5yZWZsZWN0RGVjb3JhdG9ycyhkZWNvcmF0b3JJbmZvKVxuICAgICAgICAgICAgICAgICAgICAgIC5maWx0ZXIoZGVjb3JhdG9yID0+IHRoaXMuaXNGcm9tQ29yZShkZWNvcmF0b3IpKTtcbiAgICAgICAgICAgICAgcmV0dXJuIHt0eXBlRXhwcmVzc2lvbiwgZGVjb3JhdG9yc307XG4gICAgICAgICAgICB9KTtcbiAgICAgIH0gZWxzZSBpZiAocGFyYW1EZWNvcmF0b3JzICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgdGhpcy5sb2dnZXIud2FybihcbiAgICAgICAgICAgICdJbnZhbGlkIGNvbnN0cnVjdG9yIHBhcmFtZXRlciBkZWNvcmF0b3IgaW4gJyArXG4gICAgICAgICAgICAgICAgcGFyYW1EZWNvcmF0b3JzLmdldFNvdXJjZUZpbGUoKS5maWxlTmFtZSArICc6XFxuJyxcbiAgICAgICAgICAgIHBhcmFtRGVjb3JhdG9ycy5nZXRUZXh0KCkpO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZWFyY2ggc3RhdGVtZW50cyByZWxhdGVkIHRvIHRoZSBnaXZlbiBjbGFzcyBmb3IgY2FsbHMgdG8gdGhlIHNwZWNpZmllZCBoZWxwZXIuXG4gICAqIEBwYXJhbSBjbGFzc1N5bWJvbCB0aGUgY2xhc3Mgd2hvc2UgaGVscGVyIGNhbGxzIHdlIGFyZSBpbnRlcmVzdGVkIGluLlxuICAgKiBAcGFyYW0gaGVscGVyTmFtZXMgdGhlIG5hbWVzIG9mIHRoZSBoZWxwZXJzIChlLmcuIGBfX2RlY29yYXRlYCkgd2hvc2UgY2FsbHMgd2UgYXJlIGludGVyZXN0ZWRcbiAgICogaW4uXG4gICAqIEByZXR1cm5zIGFuIGFycmF5IG9mIENhbGxFeHByZXNzaW9uIG5vZGVzIGZvciBlYWNoIG1hdGNoaW5nIGhlbHBlciBjYWxsLlxuICAgKi9cbiAgcHJvdGVjdGVkIGdldEhlbHBlckNhbGxzRm9yQ2xhc3MoY2xhc3NTeW1ib2w6IE5nY2NDbGFzc1N5bWJvbCwgaGVscGVyTmFtZXM6IHN0cmluZ1tdKTpcbiAgICAgIHRzLkNhbGxFeHByZXNzaW9uW10ge1xuICAgIHJldHVybiB0aGlzLmdldFN0YXRlbWVudHNGb3JDbGFzcyhjbGFzc1N5bWJvbClcbiAgICAgICAgLm1hcChzdGF0ZW1lbnQgPT4gdGhpcy5nZXRIZWxwZXJDYWxsKHN0YXRlbWVudCwgaGVscGVyTmFtZXMpKVxuICAgICAgICAuZmlsdGVyKGlzRGVmaW5lZCk7XG4gIH1cblxuICAvKipcbiAgICogRmluZCBzdGF0ZW1lbnRzIHJlbGF0ZWQgdG8gdGhlIGdpdmVuIGNsYXNzIHRoYXQgbWF5IGNvbnRhaW4gY2FsbHMgdG8gYSBoZWxwZXIuXG4gICAqXG4gICAqIEluIEVTTTIwMTUgY29kZSB0aGUgaGVscGVyIGNhbGxzIGFyZSBpbiB0aGUgdG9wIGxldmVsIG1vZHVsZSwgc28gd2UgaGF2ZSB0byBjb25zaWRlclxuICAgKiBhbGwgdGhlIHN0YXRlbWVudHMgaW4gdGhlIG1vZHVsZS5cbiAgICpcbiAgICogQHBhcmFtIGNsYXNzU3ltYm9sIHRoZSBjbGFzcyB3aG9zZSBoZWxwZXIgY2FsbHMgd2UgYXJlIGludGVyZXN0ZWQgaW4uXG4gICAqIEByZXR1cm5zIGFuIGFycmF5IG9mIHN0YXRlbWVudHMgdGhhdCBtYXkgY29udGFpbiBoZWxwZXIgY2FsbHMuXG4gICAqL1xuICBwcm90ZWN0ZWQgZ2V0U3RhdGVtZW50c0ZvckNsYXNzKGNsYXNzU3ltYm9sOiBOZ2NjQ2xhc3NTeW1ib2wpOiB0cy5TdGF0ZW1lbnRbXSB7XG4gICAgcmV0dXJuIEFycmF5LmZyb20oY2xhc3NTeW1ib2wuZGVjbGFyYXRpb24udmFsdWVEZWNsYXJhdGlvbi5nZXRTb3VyY2VGaWxlKCkuc3RhdGVtZW50cyk7XG4gIH1cblxuICAvKipcbiAgICogVGVzdCB3aGV0aGVyIGEgZGVjb3JhdG9yIHdhcyBpbXBvcnRlZCBmcm9tIGBAYW5ndWxhci9jb3JlYC5cbiAgICpcbiAgICogSXMgdGhlIGRlY29yYXRvcjpcbiAgICogKiBleHRlcm5hbGx5IGltcG9ydGVkIGZyb20gYEBhbmd1bGFyL2NvcmVgP1xuICAgKiAqIHRoZSBjdXJyZW50IGhvc3RlZCBwcm9ncmFtIGlzIGFjdHVhbGx5IGBAYW5ndWxhci9jb3JlYCBhbmRcbiAgICogICAtIHJlbGF0aXZlbHkgaW50ZXJuYWxseSBpbXBvcnRlZDsgb3JcbiAgICogICAtIG5vdCBpbXBvcnRlZCwgZnJvbSB0aGUgY3VycmVudCBmaWxlLlxuICAgKlxuICAgKiBAcGFyYW0gZGVjb3JhdG9yIHRoZSBkZWNvcmF0b3IgdG8gdGVzdC5cbiAgICovXG4gIHByb3RlY3RlZCBpc0Zyb21Db3JlKGRlY29yYXRvcjogRGVjb3JhdG9yKTogYm9vbGVhbiB7XG4gICAgaWYgKHRoaXMuaXNDb3JlKSB7XG4gICAgICByZXR1cm4gIWRlY29yYXRvci5pbXBvcnQgfHwgL15cXC4vLnRlc3QoZGVjb3JhdG9yLmltcG9ydC5mcm9tKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuICEhZGVjb3JhdG9yLmltcG9ydCAmJiBkZWNvcmF0b3IuaW1wb3J0LmZyb20gPT09ICdAYW5ndWxhci9jb3JlJztcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQ3JlYXRlIGEgbWFwcGluZyBiZXR3ZWVuIHRoZSBwdWJsaWMgZXhwb3J0cyBpbiBhIHNyYyBwcm9ncmFtIGFuZCB0aGUgcHVibGljIGV4cG9ydHMgb2YgYSBkdHNcbiAgICogcHJvZ3JhbS5cbiAgICpcbiAgICogQHBhcmFtIHNyYyB0aGUgcHJvZ3JhbSBidW5kbGUgY29udGFpbmluZyB0aGUgc291cmNlIGZpbGVzLlxuICAgKiBAcGFyYW0gZHRzIHRoZSBwcm9ncmFtIGJ1bmRsZSBjb250YWluaW5nIHRoZSB0eXBpbmdzIGZpbGVzLlxuICAgKiBAcmV0dXJucyBhIG1hcCBvZiBzb3VyY2UgZGVjbGFyYXRpb25zIHRvIHR5cGluZ3MgZGVjbGFyYXRpb25zLlxuICAgKi9cbiAgcHJvdGVjdGVkIGNvbXB1dGVQdWJsaWNEdHNEZWNsYXJhdGlvbk1hcChzcmM6IEJ1bmRsZVByb2dyYW0sIGR0czogQnVuZGxlUHJvZ3JhbSk6XG4gICAgICBNYXA8dHMuRGVjbGFyYXRpb24sIHRzLkRlY2xhcmF0aW9uPiB7XG4gICAgY29uc3QgZGVjbGFyYXRpb25NYXAgPSBuZXcgTWFwPHRzLkRlY2xhcmF0aW9uLCB0cy5EZWNsYXJhdGlvbj4oKTtcbiAgICBjb25zdCBkdHNEZWNsYXJhdGlvbk1hcCA9IG5ldyBNYXA8c3RyaW5nLCB0cy5EZWNsYXJhdGlvbj4oKTtcbiAgICBjb25zdCByb290RHRzID0gZ2V0Um9vdEZpbGVPckZhaWwoZHRzKTtcbiAgICB0aGlzLmNvbGxlY3REdHNFeHBvcnRlZERlY2xhcmF0aW9ucyhkdHNEZWNsYXJhdGlvbk1hcCwgcm9vdER0cywgZHRzLnByb2dyYW0uZ2V0VHlwZUNoZWNrZXIoKSk7XG4gICAgY29uc3Qgcm9vdFNyYyA9IGdldFJvb3RGaWxlT3JGYWlsKHNyYyk7XG4gICAgdGhpcy5jb2xsZWN0U3JjRXhwb3J0ZWREZWNsYXJhdGlvbnMoZGVjbGFyYXRpb25NYXAsIGR0c0RlY2xhcmF0aW9uTWFwLCByb290U3JjKTtcbiAgICByZXR1cm4gZGVjbGFyYXRpb25NYXA7XG4gIH1cblxuICAvKipcbiAgICogQ3JlYXRlIGEgbWFwcGluZyBiZXR3ZWVuIHRoZSBcInByaXZhdGVcIiBleHBvcnRzIGluIGEgc3JjIHByb2dyYW0gYW5kIHRoZSBcInByaXZhdGVcIiBleHBvcnRzIG9mIGFcbiAgICogZHRzIHByb2dyYW0uIFRoZXNlIGV4cG9ydHMgbWF5IGJlIGV4cG9ydGVkIGZyb20gaW5kaXZpZHVhbCBmaWxlcyBpbiB0aGUgc3JjIG9yIGR0cyBwcm9ncmFtcyxcbiAgICogYnV0IG5vdCBleHBvcnRlZCBmcm9tIHRoZSByb290IGZpbGUgKGkuZSBwdWJsaWNseSBmcm9tIHRoZSBlbnRyeS1wb2ludCkuXG4gICAqXG4gICAqIFRoaXMgbWFwcGluZyBpcyBhIFwiYmVzdCBndWVzc1wiIHNpbmNlIHdlIGNhbm5vdCBndWFyYW50ZWUgdGhhdCB0d28gZGVjbGFyYXRpb25zIHRoYXQgaGFwcGVuIHRvXG4gICAqIGJlIGV4cG9ydGVkIGZyb20gYSBmaWxlIHdpdGggdGhlIHNhbWUgbmFtZSBhcmUgYWN0dWFsbHkgZXF1aXZhbGVudC4gQnV0IHRoaXMgaXMgYSByZWFzb25hYmxlXG4gICAqIGVzdGltYXRlIGZvciB0aGUgcHVycG9zZXMgb2YgbmdjYy5cbiAgICpcbiAgICogQHBhcmFtIHNyYyB0aGUgcHJvZ3JhbSBidW5kbGUgY29udGFpbmluZyB0aGUgc291cmNlIGZpbGVzLlxuICAgKiBAcGFyYW0gZHRzIHRoZSBwcm9ncmFtIGJ1bmRsZSBjb250YWluaW5nIHRoZSB0eXBpbmdzIGZpbGVzLlxuICAgKiBAcmV0dXJucyBhIG1hcCBvZiBzb3VyY2UgZGVjbGFyYXRpb25zIHRvIHR5cGluZ3MgZGVjbGFyYXRpb25zLlxuICAgKi9cbiAgcHJvdGVjdGVkIGNvbXB1dGVQcml2YXRlRHRzRGVjbGFyYXRpb25NYXAoc3JjOiBCdW5kbGVQcm9ncmFtLCBkdHM6IEJ1bmRsZVByb2dyYW0pOlxuICAgICAgTWFwPHRzLkRlY2xhcmF0aW9uLCB0cy5EZWNsYXJhdGlvbj4ge1xuICAgIGNvbnN0IGRlY2xhcmF0aW9uTWFwID0gbmV3IE1hcDx0cy5EZWNsYXJhdGlvbiwgdHMuRGVjbGFyYXRpb24+KCk7XG4gICAgY29uc3QgZHRzRGVjbGFyYXRpb25NYXAgPSBuZXcgTWFwPHN0cmluZywgdHMuRGVjbGFyYXRpb24+KCk7XG4gICAgY29uc3QgdHlwZUNoZWNrZXIgPSBkdHMucHJvZ3JhbS5nZXRUeXBlQ2hlY2tlcigpO1xuXG4gICAgY29uc3QgZHRzRmlsZXMgPSBnZXROb25Sb290UGFja2FnZUZpbGVzKGR0cyk7XG4gICAgZm9yIChjb25zdCBkdHNGaWxlIG9mIGR0c0ZpbGVzKSB7XG4gICAgICB0aGlzLmNvbGxlY3REdHNFeHBvcnRlZERlY2xhcmF0aW9ucyhkdHNEZWNsYXJhdGlvbk1hcCwgZHRzRmlsZSwgdHlwZUNoZWNrZXIpO1xuICAgIH1cblxuICAgIGNvbnN0IHNyY0ZpbGVzID0gZ2V0Tm9uUm9vdFBhY2thZ2VGaWxlcyhzcmMpO1xuICAgIGZvciAoY29uc3Qgc3JjRmlsZSBvZiBzcmNGaWxlcykge1xuICAgICAgdGhpcy5jb2xsZWN0U3JjRXhwb3J0ZWREZWNsYXJhdGlvbnMoZGVjbGFyYXRpb25NYXAsIGR0c0RlY2xhcmF0aW9uTWFwLCBzcmNGaWxlKTtcbiAgICB9XG4gICAgcmV0dXJuIGRlY2xhcmF0aW9uTWFwO1xuICB9XG5cbiAgLyoqXG4gICAqIENvbGxlY3QgbWFwcGluZ3MgYmV0d2VlbiBuYW1lcyBvZiBleHBvcnRlZCBkZWNsYXJhdGlvbnMgaW4gYSBmaWxlIGFuZCBpdHMgYWN0dWFsIGRlY2xhcmF0aW9uLlxuICAgKlxuICAgKiBBbnkgbmV3IG1hcHBpbmdzIGFyZSBhZGRlZCB0byB0aGUgYGR0c0RlY2xhcmF0aW9uTWFwYC5cbiAgICovXG4gIHByb3RlY3RlZCBjb2xsZWN0RHRzRXhwb3J0ZWREZWNsYXJhdGlvbnMoXG4gICAgICBkdHNEZWNsYXJhdGlvbk1hcDogTWFwPHN0cmluZywgdHMuRGVjbGFyYXRpb24+LCBzcmNGaWxlOiB0cy5Tb3VyY2VGaWxlLFxuICAgICAgY2hlY2tlcjogdHMuVHlwZUNoZWNrZXIpOiB2b2lkIHtcbiAgICBjb25zdCBzcmNNb2R1bGUgPSBzcmNGaWxlICYmIGNoZWNrZXIuZ2V0U3ltYm9sQXRMb2NhdGlvbihzcmNGaWxlKTtcbiAgICBjb25zdCBtb2R1bGVFeHBvcnRzID0gc3JjTW9kdWxlICYmIGNoZWNrZXIuZ2V0RXhwb3J0c09mTW9kdWxlKHNyY01vZHVsZSk7XG4gICAgaWYgKG1vZHVsZUV4cG9ydHMpIHtcbiAgICAgIG1vZHVsZUV4cG9ydHMuZm9yRWFjaChleHBvcnRlZFN5bWJvbCA9PiB7XG4gICAgICAgIGNvbnN0IG5hbWUgPSBleHBvcnRlZFN5bWJvbC5uYW1lO1xuICAgICAgICBpZiAoZXhwb3J0ZWRTeW1ib2wuZmxhZ3MgJiB0cy5TeW1ib2xGbGFncy5BbGlhcykge1xuICAgICAgICAgIGV4cG9ydGVkU3ltYm9sID0gY2hlY2tlci5nZXRBbGlhc2VkU3ltYm9sKGV4cG9ydGVkU3ltYm9sKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBkZWNsYXJhdGlvbiA9IGV4cG9ydGVkU3ltYm9sLnZhbHVlRGVjbGFyYXRpb247XG4gICAgICAgIGlmIChkZWNsYXJhdGlvbiAmJiAhZHRzRGVjbGFyYXRpb25NYXAuaGFzKG5hbWUpKSB7XG4gICAgICAgICAgZHRzRGVjbGFyYXRpb25NYXAuc2V0KG5hbWUsIGRlY2xhcmF0aW9uKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuICB9XG5cblxuICBwcm90ZWN0ZWQgY29sbGVjdFNyY0V4cG9ydGVkRGVjbGFyYXRpb25zKFxuICAgICAgZGVjbGFyYXRpb25NYXA6IE1hcDx0cy5EZWNsYXJhdGlvbiwgdHMuRGVjbGFyYXRpb24+LFxuICAgICAgZHRzRGVjbGFyYXRpb25NYXA6IE1hcDxzdHJpbmcsIHRzLkRlY2xhcmF0aW9uPiwgc3JjRmlsZTogdHMuU291cmNlRmlsZSk6IHZvaWQge1xuICAgIGNvbnN0IGZpbGVFeHBvcnRzID0gdGhpcy5nZXRFeHBvcnRzT2ZNb2R1bGUoc3JjRmlsZSk7XG4gICAgaWYgKGZpbGVFeHBvcnRzICE9PSBudWxsKSB7XG4gICAgICBmb3IgKGNvbnN0IFtleHBvcnROYW1lLCB7bm9kZTogZGVjbGFyYXRpb259XSBvZiBmaWxlRXhwb3J0cykge1xuICAgICAgICBpZiAoZGVjbGFyYXRpb24gIT09IG51bGwgJiYgZHRzRGVjbGFyYXRpb25NYXAuaGFzKGV4cG9ydE5hbWUpKSB7XG4gICAgICAgICAgZGVjbGFyYXRpb25NYXAuc2V0KGRlY2xhcmF0aW9uLCBkdHNEZWNsYXJhdGlvbk1hcC5nZXQoZXhwb3J0TmFtZSkgISk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogUGFyc2UgYSBmdW5jdGlvbi9tZXRob2Qgbm9kZSAob3IgaXRzIGltcGxlbWVudGF0aW9uKSwgdG8gc2VlIGlmIGl0IHJldHVybnMgYVxuICAgKiBgTW9kdWxlV2l0aFByb3ZpZGVyc2Agb2JqZWN0LlxuICAgKiBAcGFyYW0gbmFtZSBUaGUgbmFtZSBvZiB0aGUgZnVuY3Rpb24uXG4gICAqIEBwYXJhbSBub2RlIHRoZSBub2RlIHRvIGNoZWNrIC0gdGhpcyBjb3VsZCBiZSBhIGZ1bmN0aW9uLCBhIG1ldGhvZCBvciBhIHZhcmlhYmxlIGRlY2xhcmF0aW9uLlxuICAgKiBAcGFyYW0gaW1wbGVtZW50YXRpb24gdGhlIGFjdHVhbCBmdW5jdGlvbiBleHByZXNzaW9uIGlmIGBub2RlYCBpcyBhIHZhcmlhYmxlIGRlY2xhcmF0aW9uLlxuICAgKiBAcGFyYW0gY29udGFpbmVyIHRoZSBjbGFzcyB0aGF0IGNvbnRhaW5zIHRoZSBmdW5jdGlvbiwgaWYgaXQgaXMgYSBtZXRob2QuXG4gICAqIEByZXR1cm5zIGluZm8gYWJvdXQgdGhlIGZ1bmN0aW9uIGlmIGl0IGRvZXMgcmV0dXJuIGEgYE1vZHVsZVdpdGhQcm92aWRlcnNgIG9iamVjdDsgYG51bGxgXG4gICAqIG90aGVyd2lzZS5cbiAgICovXG4gIHByb3RlY3RlZCBwYXJzZUZvck1vZHVsZVdpdGhQcm92aWRlcnMoXG4gICAgICBuYW1lOiBzdHJpbmcsIG5vZGU6IHRzLk5vZGV8bnVsbCwgaW1wbGVtZW50YXRpb246IHRzLk5vZGV8bnVsbCA9IG5vZGUsXG4gICAgICBjb250YWluZXI6IHRzLkRlY2xhcmF0aW9ufG51bGwgPSBudWxsKTogTW9kdWxlV2l0aFByb3ZpZGVyc0Z1bmN0aW9ufG51bGwge1xuICAgIGlmIChpbXBsZW1lbnRhdGlvbiA9PT0gbnVsbCB8fFxuICAgICAgICAoIXRzLmlzRnVuY3Rpb25EZWNsYXJhdGlvbihpbXBsZW1lbnRhdGlvbikgJiYgIXRzLmlzTWV0aG9kRGVjbGFyYXRpb24oaW1wbGVtZW50YXRpb24pICYmXG4gICAgICAgICAhdHMuaXNGdW5jdGlvbkV4cHJlc3Npb24oaW1wbGVtZW50YXRpb24pKSkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIGNvbnN0IGRlY2xhcmF0aW9uID0gaW1wbGVtZW50YXRpb247XG4gICAgY29uc3QgZGVmaW5pdGlvbiA9IHRoaXMuZ2V0RGVmaW5pdGlvbk9mRnVuY3Rpb24oZGVjbGFyYXRpb24pO1xuICAgIGlmIChkZWZpbml0aW9uID09PSBudWxsKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgY29uc3QgYm9keSA9IGRlZmluaXRpb24uYm9keTtcbiAgICBjb25zdCBsYXN0U3RhdGVtZW50ID0gYm9keSAmJiBib2R5W2JvZHkubGVuZ3RoIC0gMV07XG4gICAgY29uc3QgcmV0dXJuRXhwcmVzc2lvbiA9XG4gICAgICAgIGxhc3RTdGF0ZW1lbnQgJiYgdHMuaXNSZXR1cm5TdGF0ZW1lbnQobGFzdFN0YXRlbWVudCkgJiYgbGFzdFN0YXRlbWVudC5leHByZXNzaW9uIHx8IG51bGw7XG4gICAgY29uc3QgbmdNb2R1bGVQcm9wZXJ0eSA9IHJldHVybkV4cHJlc3Npb24gJiYgdHMuaXNPYmplY3RMaXRlcmFsRXhwcmVzc2lvbihyZXR1cm5FeHByZXNzaW9uKSAmJlxuICAgICAgICAgICAgcmV0dXJuRXhwcmVzc2lvbi5wcm9wZXJ0aWVzLmZpbmQoXG4gICAgICAgICAgICAgICAgcHJvcCA9PlxuICAgICAgICAgICAgICAgICAgICAhIXByb3AubmFtZSAmJiB0cy5pc0lkZW50aWZpZXIocHJvcC5uYW1lKSAmJiBwcm9wLm5hbWUudGV4dCA9PT0gJ25nTW9kdWxlJykgfHxcbiAgICAgICAgbnVsbDtcblxuICAgIGlmICghbmdNb2R1bGVQcm9wZXJ0eSB8fCAhdHMuaXNQcm9wZXJ0eUFzc2lnbm1lbnQobmdNb2R1bGVQcm9wZXJ0eSkpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIC8vIFRoZSBuZ01vZHVsZVZhbHVlIGNvdWxkIGJlIG9mIHRoZSBmb3JtIGBTb21lTW9kdWxlYCBvciBgbmFtZXNwYWNlXzEuU29tZU1vZHVsZWBcbiAgICBjb25zdCBuZ01vZHVsZVZhbHVlID0gbmdNb2R1bGVQcm9wZXJ0eS5pbml0aWFsaXplcjtcbiAgICBpZiAoIXRzLmlzSWRlbnRpZmllcihuZ01vZHVsZVZhbHVlKSAmJiAhdHMuaXNQcm9wZXJ0eUFjY2Vzc0V4cHJlc3Npb24obmdNb2R1bGVWYWx1ZSkpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIGNvbnN0IG5nTW9kdWxlRGVjbGFyYXRpb24gPSB0aGlzLmdldERlY2xhcmF0aW9uT2ZFeHByZXNzaW9uKG5nTW9kdWxlVmFsdWUpO1xuICAgIGlmICghbmdNb2R1bGVEZWNsYXJhdGlvbiB8fCBuZ01vZHVsZURlY2xhcmF0aW9uLm5vZGUgPT09IG51bGwpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICBgQ2Fubm90IGZpbmQgYSBkZWNsYXJhdGlvbiBmb3IgTmdNb2R1bGUgJHtuZ01vZHVsZVZhbHVlLmdldFRleHQoKX0gcmVmZXJlbmNlZCBpbiBcIiR7ZGVjbGFyYXRpb24hLmdldFRleHQoKX1cImApO1xuICAgIH1cbiAgICBpZiAoIWhhc05hbWVJZGVudGlmaWVyKG5nTW9kdWxlRGVjbGFyYXRpb24ubm9kZSkpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICByZXR1cm4ge1xuICAgICAgbmFtZSxcbiAgICAgIG5nTW9kdWxlOiBuZ01vZHVsZURlY2xhcmF0aW9uIGFzIENvbmNyZXRlRGVjbGFyYXRpb248Q2xhc3NEZWNsYXJhdGlvbj4sIGRlY2xhcmF0aW9uLCBjb250YWluZXJcbiAgICB9O1xuICB9XG5cbiAgcHJvdGVjdGVkIGdldERlY2xhcmF0aW9uT2ZFeHByZXNzaW9uKGV4cHJlc3Npb246IHRzLkV4cHJlc3Npb24pOiBEZWNsYXJhdGlvbnxudWxsIHtcbiAgICBpZiAodHMuaXNJZGVudGlmaWVyKGV4cHJlc3Npb24pKSB7XG4gICAgICByZXR1cm4gdGhpcy5nZXREZWNsYXJhdGlvbk9mSWRlbnRpZmllcihleHByZXNzaW9uKTtcbiAgICB9XG5cbiAgICBpZiAoIXRzLmlzUHJvcGVydHlBY2Nlc3NFeHByZXNzaW9uKGV4cHJlc3Npb24pIHx8ICF0cy5pc0lkZW50aWZpZXIoZXhwcmVzc2lvbi5leHByZXNzaW9uKSkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgY29uc3QgbmFtZXNwYWNlRGVjbCA9IHRoaXMuZ2V0RGVjbGFyYXRpb25PZklkZW50aWZpZXIoZXhwcmVzc2lvbi5leHByZXNzaW9uKTtcbiAgICBpZiAoIW5hbWVzcGFjZURlY2wgfHwgbmFtZXNwYWNlRGVjbC5ub2RlID09PSBudWxsIHx8ICF0cy5pc1NvdXJjZUZpbGUobmFtZXNwYWNlRGVjbC5ub2RlKSkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgY29uc3QgbmFtZXNwYWNlRXhwb3J0cyA9IHRoaXMuZ2V0RXhwb3J0c09mTW9kdWxlKG5hbWVzcGFjZURlY2wubm9kZSk7XG4gICAgaWYgKG5hbWVzcGFjZUV4cG9ydHMgPT09IG51bGwpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIGlmICghbmFtZXNwYWNlRXhwb3J0cy5oYXMoZXhwcmVzc2lvbi5uYW1lLnRleHQpKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICBjb25zdCBleHBvcnREZWNsID0gbmFtZXNwYWNlRXhwb3J0cy5nZXQoZXhwcmVzc2lvbi5uYW1lLnRleHQpICE7XG4gICAgcmV0dXJuIHsuLi5leHBvcnREZWNsLCB2aWFNb2R1bGU6IG5hbWVzcGFjZURlY2wudmlhTW9kdWxlfTtcbiAgfVxuXG4gIC8qKiBDaGVja3MgaWYgdGhlIHNwZWNpZmllZCBkZWNsYXJhdGlvbiByZXNvbHZlcyB0byB0aGUga25vd24gSmF2YVNjcmlwdCBnbG9iYWwgYE9iamVjdGAuICovXG4gIHByb3RlY3RlZCBpc0phdmFTY3JpcHRPYmplY3REZWNsYXJhdGlvbihkZWNsOiBEZWNsYXJhdGlvbik6IGJvb2xlYW4ge1xuICAgIGlmIChkZWNsLm5vZGUgPT09IG51bGwpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgY29uc3Qgbm9kZSA9IGRlY2wubm9kZTtcbiAgICAvLyBUaGUgZGVmYXVsdCBUeXBlU2NyaXB0IGxpYnJhcnkgdHlwZXMgdGhlIGdsb2JhbCBgT2JqZWN0YCB2YXJpYWJsZSB0aHJvdWdoXG4gICAgLy8gYSB2YXJpYWJsZSBkZWNsYXJhdGlvbiB3aXRoIGEgdHlwZSByZWZlcmVuY2UgcmVzb2x2aW5nIHRvIGBPYmplY3RDb25zdHJ1Y3RvcmAuXG4gICAgaWYgKCF0cy5pc1ZhcmlhYmxlRGVjbGFyYXRpb24obm9kZSkgfHwgIXRzLmlzSWRlbnRpZmllcihub2RlLm5hbWUpIHx8XG4gICAgICAgIG5vZGUubmFtZS50ZXh0ICE9PSAnT2JqZWN0JyB8fCBub2RlLnR5cGUgPT09IHVuZGVmaW5lZCkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICBjb25zdCB0eXBlTm9kZSA9IG5vZGUudHlwZTtcbiAgICAvLyBJZiB0aGUgdmFyaWFibGUgZGVjbGFyYXRpb24gZG9lcyBub3QgaGF2ZSBhIHR5cGUgcmVzb2x2aW5nIHRvIGBPYmplY3RDb25zdHJ1Y3RvcmAsXG4gICAgLy8gd2UgY2Fubm90IGd1YXJhbnRlZSB0aGF0IHRoZSBkZWNsYXJhdGlvbiByZXNvbHZlcyB0byB0aGUgZ2xvYmFsIGBPYmplY3RgIHZhcmlhYmxlLlxuICAgIGlmICghdHMuaXNUeXBlUmVmZXJlbmNlTm9kZSh0eXBlTm9kZSkgfHwgIXRzLmlzSWRlbnRpZmllcih0eXBlTm9kZS50eXBlTmFtZSkgfHxcbiAgICAgICAgdHlwZU5vZGUudHlwZU5hbWUudGV4dCAhPT0gJ09iamVjdENvbnN0cnVjdG9yJykge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICAvLyBGaW5hbGx5LCBjaGVjayBpZiB0aGUgdHlwZSBkZWZpbml0aW9uIGZvciBgT2JqZWN0YCBvcmlnaW5hdGVzIGZyb20gYSBkZWZhdWx0IGxpYnJhcnlcbiAgICAvLyBkZWZpbml0aW9uIGZpbGUuIFRoaXMgcmVxdWlyZXMgZGVmYXVsdCB0eXBlcyB0byBiZSBlbmFibGVkIGZvciB0aGUgaG9zdCBwcm9ncmFtLlxuICAgIHJldHVybiB0aGlzLnNyYy5wcm9ncmFtLmlzU291cmNlRmlsZURlZmF1bHRMaWJyYXJ5KG5vZGUuZ2V0U291cmNlRmlsZSgpKTtcbiAgfVxufVxuXG4vLy8vLy8vLy8vLy8vIEV4cG9ydGVkIEhlbHBlcnMgLy8vLy8vLy8vLy8vL1xuXG5leHBvcnQgdHlwZSBQYXJhbUluZm8gPSB7XG4gIGRlY29yYXRvcnM6IERlY29yYXRvcltdIHwgbnVsbCxcbiAgdHlwZUV4cHJlc3Npb246IHRzLkV4cHJlc3Npb24gfCBudWxsXG59O1xuXG4vKipcbiAqIFJlcHJlc2VudHMgYSBjYWxsIHRvIGB0c2xpYi5fX21ldGFkYXRhYCBhcyBwcmVzZW50IGluIGB0c2xpYi5fX2RlY29yYXRlYCBjYWxscy4gVGhpcyBpcyBhXG4gKiBzeW50aGV0aWMgZGVjb3JhdG9yIGluc2VydGVkIGJ5IFR5cGVTY3JpcHQgdGhhdCBjb250YWlucyByZWZsZWN0aW9uIGluZm9ybWF0aW9uIGFib3V0IHRoZVxuICogdGFyZ2V0IG9mIHRoZSBkZWNvcmF0b3IsIGkuZS4gdGhlIGNsYXNzIG9yIHByb3BlcnR5LlxuICovXG5leHBvcnQgaW50ZXJmYWNlIFBhcmFtZXRlclR5cGVzIHtcbiAgdHlwZTogJ3BhcmFtcyc7XG4gIHR5cGVzOiB0cy5FeHByZXNzaW9uW107XG59XG5cbi8qKlxuICogUmVwcmVzZW50cyBhIGNhbGwgdG8gYHRzbGliLl9fcGFyYW1gIGFzIHByZXNlbnQgaW4gYHRzbGliLl9fZGVjb3JhdGVgIGNhbGxzLiBUaGlzIGNvbnRhaW5zXG4gKiBpbmZvcm1hdGlvbiBvbiBhbnkgZGVjb3JhdG9ycyB3ZXJlIGFwcGxpZWQgdG8gYSBjZXJ0YWluIHBhcmFtZXRlci5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBQYXJhbWV0ZXJEZWNvcmF0b3JzIHtcbiAgdHlwZTogJ3BhcmFtOmRlY29yYXRvcnMnO1xuICBpbmRleDogbnVtYmVyO1xuICBkZWNvcmF0b3I6IERlY29yYXRvcjtcbn1cblxuLyoqXG4gKiBSZXByZXNlbnRzIGEgY2FsbCB0byBhIGRlY29yYXRvciBhcyBpdCB3YXMgcHJlc2VudCBpbiB0aGUgb3JpZ2luYWwgc291cmNlIGNvZGUsIGFzIHByZXNlbnQgaW5cbiAqIGB0c2xpYi5fX2RlY29yYXRlYCBjYWxscy5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBEZWNvcmF0b3JDYWxsIHtcbiAgdHlwZTogJ2RlY29yYXRvcic7XG4gIGRlY29yYXRvcjogRGVjb3JhdG9yO1xufVxuXG4vKipcbiAqIFJlcHJlc2VudHMgdGhlIGRpZmZlcmVudCBraW5kcyBvZiBkZWNvcmF0ZSBoZWxwZXJzIHRoYXQgbWF5IGJlIHByZXNlbnQgYXMgZmlyc3QgYXJndW1lbnQgdG9cbiAqIGB0c2xpYi5fX2RlY29yYXRlYCwgYXMgZm9sbG93czpcbiAqXG4gKiBgYGBcbiAqIF9fZGVjb3JhdGUoW1xuICogICBEaXJlY3RpdmUoeyBzZWxlY3RvcjogJ1tzb21lRGlyZWN0aXZlXScgfSksXG4gKiAgIHRzbGliXzEuX19wYXJhbSgyLCBJbmplY3QoSU5KRUNURURfVE9LRU4pKSxcbiAqICAgdHNsaWJfMS5fX21ldGFkYXRhKFwiZGVzaWduOnBhcmFtdHlwZXNcIiwgW1ZpZXdDb250YWluZXJSZWYsIFRlbXBsYXRlUmVmLCBTdHJpbmddKVxuICogXSwgU29tZURpcmVjdGl2ZSk7XG4gKiBgYGBcbiAqL1xuZXhwb3J0IHR5cGUgRGVjb3JhdGVIZWxwZXJFbnRyeSA9IFBhcmFtZXRlclR5cGVzIHwgUGFyYW1ldGVyRGVjb3JhdG9ycyB8IERlY29yYXRvckNhbGw7XG5cbi8qKlxuICogVGhlIHJlY29yZGVkIGRlY29yYXRvciBpbmZvcm1hdGlvbiBvZiBhIHNpbmdsZSBjbGFzcy4gVGhpcyBpbmZvcm1hdGlvbiBpcyBjYWNoZWQgaW4gdGhlIGhvc3QuXG4gKi9cbmludGVyZmFjZSBEZWNvcmF0b3JJbmZvIHtcbiAgLyoqXG4gICAqIEFsbCBkZWNvcmF0b3JzIHRoYXQgd2VyZSBwcmVzZW50IG9uIHRoZSBjbGFzcy4gSWYgbm8gZGVjb3JhdG9ycyB3ZXJlIHByZXNlbnQsIHRoaXMgaXMgYG51bGxgXG4gICAqL1xuICBjbGFzc0RlY29yYXRvcnM6IERlY29yYXRvcltdfG51bGw7XG5cbiAgLyoqXG4gICAqIEFsbCBkZWNvcmF0b3JzIHBlciBtZW1iZXIgb2YgdGhlIGNsYXNzIHRoZXkgd2VyZSBwcmVzZW50IG9uLlxuICAgKi9cbiAgbWVtYmVyRGVjb3JhdG9yczogTWFwPHN0cmluZywgRGVjb3JhdG9yW10+O1xuXG4gIC8qKlxuICAgKiBSZXByZXNlbnRzIHRoZSBjb25zdHJ1Y3RvciBwYXJhbWV0ZXIgaW5mb3JtYXRpb24sIHN1Y2ggYXMgdGhlIHR5cGUgb2YgYSBwYXJhbWV0ZXIgYW5kIGFsbFxuICAgKiBkZWNvcmF0b3JzIGZvciBhIGNlcnRhaW4gcGFyYW1ldGVyLiBJbmRpY2VzIGluIHRoaXMgYXJyYXkgY29ycmVzcG9uZCB3aXRoIHRoZSBwYXJhbWV0ZXInc1xuICAgKiBpbmRleCBpbiB0aGUgY29uc3RydWN0b3IuIE5vdGUgdGhhdCB0aGlzIGFycmF5IG1heSBiZSBzcGFyc2UsIGkuZS4gY2VydGFpbiBjb25zdHJ1Y3RvclxuICAgKiBwYXJhbWV0ZXJzIG1heSBub3QgaGF2ZSBhbnkgaW5mbyByZWNvcmRlZC5cbiAgICovXG4gIGNvbnN0cnVjdG9yUGFyYW1JbmZvOiBQYXJhbUluZm9bXTtcbn1cblxuLyoqXG4gKiBBIHN0YXRlbWVudCBub2RlIHRoYXQgcmVwcmVzZW50cyBhbiBhc3NpZ25tZW50LlxuICovXG5leHBvcnQgdHlwZSBBc3NpZ25tZW50U3RhdGVtZW50ID1cbiAgICB0cy5FeHByZXNzaW9uU3RhdGVtZW50ICYge2V4cHJlc3Npb246IHtsZWZ0OiB0cy5JZGVudGlmaWVyLCByaWdodDogdHMuRXhwcmVzc2lvbn19O1xuXG4vKipcbiAqIFRlc3Qgd2hldGhlciBhIHN0YXRlbWVudCBub2RlIGlzIGFuIGFzc2lnbm1lbnQgc3RhdGVtZW50LlxuICogQHBhcmFtIHN0YXRlbWVudCB0aGUgc3RhdGVtZW50IHRvIHRlc3QuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpc0Fzc2lnbm1lbnRTdGF0ZW1lbnQoc3RhdGVtZW50OiB0cy5TdGF0ZW1lbnQpOiBzdGF0ZW1lbnQgaXMgQXNzaWdubWVudFN0YXRlbWVudCB7XG4gIHJldHVybiB0cy5pc0V4cHJlc3Npb25TdGF0ZW1lbnQoc3RhdGVtZW50KSAmJiBpc0Fzc2lnbm1lbnQoc3RhdGVtZW50LmV4cHJlc3Npb24pICYmXG4gICAgICB0cy5pc0lkZW50aWZpZXIoc3RhdGVtZW50LmV4cHJlc3Npb24ubGVmdCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc0Fzc2lnbm1lbnQobm9kZTogdHMuTm9kZSk6IG5vZGUgaXMgdHMuQXNzaWdubWVudEV4cHJlc3Npb248dHMuRXF1YWxzVG9rZW4+IHtcbiAgcmV0dXJuIHRzLmlzQmluYXJ5RXhwcmVzc2lvbihub2RlKSAmJiBub2RlLm9wZXJhdG9yVG9rZW4ua2luZCA9PT0gdHMuU3ludGF4S2luZC5FcXVhbHNUb2tlbjtcbn1cblxuLyoqXG4gKiBUZXN0cyB3aGV0aGVyIHRoZSBwcm92aWRlZCBjYWxsIGV4cHJlc3Npb24gdGFyZ2V0cyBhIGNsYXNzLCBieSB2ZXJpZnlpbmcgaXRzIGFyZ3VtZW50cyBhcmVcbiAqIGFjY29yZGluZyB0byB0aGUgZm9sbG93aW5nIGZvcm06XG4gKlxuICogYGBgXG4gKiBfX2RlY29yYXRlKFtdLCBTb21lRGlyZWN0aXZlKTtcbiAqIGBgYFxuICpcbiAqIEBwYXJhbSBjYWxsIHRoZSBjYWxsIGV4cHJlc3Npb24gdGhhdCBpcyB0ZXN0ZWQgdG8gcmVwcmVzZW50IGEgY2xhc3MgZGVjb3JhdG9yIGNhbGwuXG4gKiBAcGFyYW0gbWF0Y2hlcyBwcmVkaWNhdGUgZnVuY3Rpb24gdG8gdGVzdCB3aGV0aGVyIHRoZSBjYWxsIGlzIGFzc29jaWF0ZWQgd2l0aCB0aGUgZGVzaXJlZCBjbGFzcy5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlzQ2xhc3NEZWNvcmF0ZUNhbGwoXG4gICAgY2FsbDogdHMuQ2FsbEV4cHJlc3Npb24sIG1hdGNoZXM6IChpZGVudGlmaWVyOiB0cy5JZGVudGlmaWVyKSA9PiBib29sZWFuKTpcbiAgICBjYWxsIGlzIHRzLkNhbGxFeHByZXNzaW9uJnthcmd1bWVudHM6IFt0cy5BcnJheUxpdGVyYWxFeHByZXNzaW9uLCB0cy5FeHByZXNzaW9uXX0ge1xuICBjb25zdCBoZWxwZXJBcmdzID0gY2FsbC5hcmd1bWVudHNbMF07XG4gIGlmIChoZWxwZXJBcmdzID09PSB1bmRlZmluZWQgfHwgIXRzLmlzQXJyYXlMaXRlcmFsRXhwcmVzc2lvbihoZWxwZXJBcmdzKSkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIGNvbnN0IHRhcmdldCA9IGNhbGwuYXJndW1lbnRzWzFdO1xuICByZXR1cm4gdGFyZ2V0ICE9PSB1bmRlZmluZWQgJiYgdHMuaXNJZGVudGlmaWVyKHRhcmdldCkgJiYgbWF0Y2hlcyh0YXJnZXQpO1xufVxuXG4vKipcbiAqIFRlc3RzIHdoZXRoZXIgdGhlIHByb3ZpZGVkIGNhbGwgZXhwcmVzc2lvbiB0YXJnZXRzIGEgbWVtYmVyIG9mIHRoZSBjbGFzcywgYnkgdmVyaWZ5aW5nIGl0c1xuICogYXJndW1lbnRzIGFyZSBhY2NvcmRpbmcgdG8gdGhlIGZvbGxvd2luZyBmb3JtOlxuICpcbiAqIGBgYFxuICogX19kZWNvcmF0ZShbXSwgU29tZURpcmVjdGl2ZS5wcm90b3R5cGUsIFwibWVtYmVyXCIsIHZvaWQgMCk7XG4gKiBgYGBcbiAqXG4gKiBAcGFyYW0gY2FsbCB0aGUgY2FsbCBleHByZXNzaW9uIHRoYXQgaXMgdGVzdGVkIHRvIHJlcHJlc2VudCBhIG1lbWJlciBkZWNvcmF0b3IgY2FsbC5cbiAqIEBwYXJhbSBtYXRjaGVzIHByZWRpY2F0ZSBmdW5jdGlvbiB0byB0ZXN0IHdoZXRoZXIgdGhlIGNhbGwgaXMgYXNzb2NpYXRlZCB3aXRoIHRoZSBkZXNpcmVkIGNsYXNzLlxuICovXG5leHBvcnQgZnVuY3Rpb24gaXNNZW1iZXJEZWNvcmF0ZUNhbGwoXG4gICAgY2FsbDogdHMuQ2FsbEV4cHJlc3Npb24sIG1hdGNoZXM6IChpZGVudGlmaWVyOiB0cy5JZGVudGlmaWVyKSA9PiBib29sZWFuKTpcbiAgICBjYWxsIGlzIHRzLkNhbGxFeHByZXNzaW9uJlxuICAgIHthcmd1bWVudHM6IFt0cy5BcnJheUxpdGVyYWxFeHByZXNzaW9uLCB0cy5TdHJpbmdMaXRlcmFsLCB0cy5TdHJpbmdMaXRlcmFsXX0ge1xuICBjb25zdCBoZWxwZXJBcmdzID0gY2FsbC5hcmd1bWVudHNbMF07XG4gIGlmIChoZWxwZXJBcmdzID09PSB1bmRlZmluZWQgfHwgIXRzLmlzQXJyYXlMaXRlcmFsRXhwcmVzc2lvbihoZWxwZXJBcmdzKSkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIGNvbnN0IHRhcmdldCA9IGNhbGwuYXJndW1lbnRzWzFdO1xuICBpZiAodGFyZ2V0ID09PSB1bmRlZmluZWQgfHwgIXRzLmlzUHJvcGVydHlBY2Nlc3NFeHByZXNzaW9uKHRhcmdldCkgfHxcbiAgICAgICF0cy5pc0lkZW50aWZpZXIodGFyZ2V0LmV4cHJlc3Npb24pIHx8ICFtYXRjaGVzKHRhcmdldC5leHByZXNzaW9uKSB8fFxuICAgICAgdGFyZ2V0Lm5hbWUudGV4dCAhPT0gJ3Byb3RvdHlwZScpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBjb25zdCBtZW1iZXJOYW1lID0gY2FsbC5hcmd1bWVudHNbMl07XG4gIHJldHVybiBtZW1iZXJOYW1lICE9PSB1bmRlZmluZWQgJiYgdHMuaXNTdHJpbmdMaXRlcmFsKG1lbWJlck5hbWUpO1xufVxuXG4vKipcbiAqIEhlbHBlciBtZXRob2QgdG8gZXh0cmFjdCB0aGUgdmFsdWUgb2YgYSBwcm9wZXJ0eSBnaXZlbiB0aGUgcHJvcGVydHkncyBcInN5bWJvbFwiLFxuICogd2hpY2ggaXMgYWN0dWFsbHkgdGhlIHN5bWJvbCBvZiB0aGUgaWRlbnRpZmllciBvZiB0aGUgcHJvcGVydHkuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRQcm9wZXJ0eVZhbHVlRnJvbVN5bWJvbChwcm9wU3ltYm9sOiB0cy5TeW1ib2wpOiB0cy5FeHByZXNzaW9ufHVuZGVmaW5lZCB7XG4gIGNvbnN0IHByb3BJZGVudGlmaWVyID0gcHJvcFN5bWJvbC52YWx1ZURlY2xhcmF0aW9uO1xuICBjb25zdCBwYXJlbnQgPSBwcm9wSWRlbnRpZmllciAmJiBwcm9wSWRlbnRpZmllci5wYXJlbnQ7XG4gIHJldHVybiBwYXJlbnQgJiYgdHMuaXNCaW5hcnlFeHByZXNzaW9uKHBhcmVudCkgPyBwYXJlbnQucmlnaHQgOiB1bmRlZmluZWQ7XG59XG5cbi8qKlxuICogQSBjYWxsZWUgY291bGQgYmUgb25lIG9mOiBgX19kZWNvcmF0ZSguLi4pYCBvciBgdHNsaWJfMS5fX2RlY29yYXRlYC5cbiAqL1xuZnVuY3Rpb24gZ2V0Q2FsbGVlTmFtZShjYWxsOiB0cy5DYWxsRXhwcmVzc2lvbik6IHN0cmluZ3xudWxsIHtcbiAgaWYgKHRzLmlzSWRlbnRpZmllcihjYWxsLmV4cHJlc3Npb24pKSB7XG4gICAgcmV0dXJuIHN0cmlwRG9sbGFyU3VmZml4KGNhbGwuZXhwcmVzc2lvbi50ZXh0KTtcbiAgfVxuICBpZiAodHMuaXNQcm9wZXJ0eUFjY2Vzc0V4cHJlc3Npb24oY2FsbC5leHByZXNzaW9uKSkge1xuICAgIHJldHVybiBzdHJpcERvbGxhclN1ZmZpeChjYWxsLmV4cHJlc3Npb24ubmFtZS50ZXh0KTtcbiAgfVxuICByZXR1cm4gbnVsbDtcbn1cblxuLy8vLy8vLy8vLy8vLyBJbnRlcm5hbCBIZWxwZXJzIC8vLy8vLy8vLy8vLy9cblxuLyoqXG4gKiBJbiBFUzIwMTUsIGEgY2xhc3MgbWF5IGJlIGRlY2xhcmVkIHVzaW5nIGEgdmFyaWFibGUgZGVjbGFyYXRpb24gb2YgdGhlIGZvbGxvd2luZyBzdHJ1Y3R1cmU6XG4gKlxuICogYGBgXG4gKiB2YXIgTXlDbGFzcyA9IE15Q2xhc3NfMSA9IGNsYXNzIE15Q2xhc3Mge307XG4gKiBgYGBcbiAqXG4gKiBIZXJlLCB0aGUgaW50ZXJtZWRpYXRlIGBNeUNsYXNzXzFgIGFzc2lnbm1lbnQgaXMgb3B0aW9uYWwuIEluIHRoZSBhYm92ZSBleGFtcGxlLCB0aGVcbiAqIGBjbGFzcyBNeUNsYXNzIHt9YCBleHByZXNzaW9uIGlzIHJldHVybmVkIGFzIGRlY2xhcmF0aW9uIG9mIGB2YXIgTXlDbGFzc2AuIElmIHRoZSB2YXJpYWJsZVxuICogaXMgbm90IGluaXRpYWxpemVkIHVzaW5nIGEgY2xhc3MgZXhwcmVzc2lvbiwgbnVsbCBpcyByZXR1cm5lZC5cbiAqXG4gKiBAcGFyYW0gbm9kZSB0aGUgbm9kZSB0aGF0IHJlcHJlc2VudHMgdGhlIGNsYXNzIHdob3NlIGRlY2xhcmF0aW9uIHdlIGFyZSBmaW5kaW5nLlxuICogQHJldHVybnMgdGhlIGRlY2xhcmF0aW9uIG9mIHRoZSBjbGFzcyBvciBgbnVsbGAgaWYgaXQgaXMgbm90IGEgXCJjbGFzc1wiLlxuICovXG5mdW5jdGlvbiBnZXRJbm5lckNsYXNzRGVjbGFyYXRpb24obm9kZTogdHMuTm9kZSk6IENsYXNzRGVjbGFyYXRpb248dHMuQ2xhc3NFeHByZXNzaW9uPnxudWxsIHtcbiAgaWYgKCF0cy5pc1ZhcmlhYmxlRGVjbGFyYXRpb24obm9kZSkgfHwgbm9kZS5pbml0aWFsaXplciA9PT0gdW5kZWZpbmVkKSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICAvLyBSZWNvZ25pemUgYSB2YXJpYWJsZSBkZWNsYXJhdGlvbiBvZiB0aGUgZm9ybSBgdmFyIE15Q2xhc3MgPSBjbGFzcyBNeUNsYXNzIHt9YCBvclxuICAvLyBgdmFyIE15Q2xhc3MgPSBNeUNsYXNzXzEgPSBjbGFzcyBNeUNsYXNzIHt9O2BcbiAgbGV0IGV4cHJlc3Npb24gPSBub2RlLmluaXRpYWxpemVyO1xuICB3aGlsZSAoaXNBc3NpZ25tZW50KGV4cHJlc3Npb24pKSB7XG4gICAgZXhwcmVzc2lvbiA9IGV4cHJlc3Npb24ucmlnaHQ7XG4gIH1cblxuICBpZiAoIXRzLmlzQ2xhc3NFeHByZXNzaW9uKGV4cHJlc3Npb24pIHx8ICFoYXNOYW1lSWRlbnRpZmllcihleHByZXNzaW9uKSkge1xuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgcmV0dXJuIGV4cHJlc3Npb247XG59XG5cbmZ1bmN0aW9uIGdldERlY29yYXRvckFyZ3Mobm9kZTogdHMuT2JqZWN0TGl0ZXJhbEV4cHJlc3Npb24pOiB0cy5FeHByZXNzaW9uW10ge1xuICAvLyBUaGUgYXJndW1lbnRzIG9mIGEgZGVjb3JhdG9yIGFyZSBoZWxkIGluIHRoZSBgYXJnc2AgcHJvcGVydHkgb2YgaXRzIGRlY2xhcmF0aW9uIG9iamVjdC5cbiAgY29uc3QgYXJnc1Byb3BlcnR5ID0gbm9kZS5wcm9wZXJ0aWVzLmZpbHRlcih0cy5pc1Byb3BlcnR5QXNzaWdubWVudClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIC5maW5kKHByb3BlcnR5ID0+IGdldE5hbWVUZXh0KHByb3BlcnR5Lm5hbWUpID09PSAnYXJncycpO1xuICBjb25zdCBhcmdzRXhwcmVzc2lvbiA9IGFyZ3NQcm9wZXJ0eSAmJiBhcmdzUHJvcGVydHkuaW5pdGlhbGl6ZXI7XG4gIHJldHVybiBhcmdzRXhwcmVzc2lvbiAmJiB0cy5pc0FycmF5TGl0ZXJhbEV4cHJlc3Npb24oYXJnc0V4cHJlc3Npb24pID9cbiAgICAgIEFycmF5LmZyb20oYXJnc0V4cHJlc3Npb24uZWxlbWVudHMpIDpcbiAgICAgIFtdO1xufVxuXG5mdW5jdGlvbiBpc1Byb3BlcnR5QWNjZXNzKG5vZGU6IHRzLk5vZGUpOiBub2RlIGlzIHRzLlByb3BlcnR5QWNjZXNzRXhwcmVzc2lvbiZcbiAgICB7cGFyZW50OiB0cy5CaW5hcnlFeHByZXNzaW9ufSB7XG4gIHJldHVybiAhIW5vZGUucGFyZW50ICYmIHRzLmlzQmluYXJ5RXhwcmVzc2lvbihub2RlLnBhcmVudCkgJiYgdHMuaXNQcm9wZXJ0eUFjY2Vzc0V4cHJlc3Npb24obm9kZSk7XG59XG5cbmZ1bmN0aW9uIGlzVGhpc0Fzc2lnbm1lbnQobm9kZTogdHMuRGVjbGFyYXRpb24pOiBub2RlIGlzIHRzLkJpbmFyeUV4cHJlc3Npb24mXG4gICAge2xlZnQ6IHRzLlByb3BlcnR5QWNjZXNzRXhwcmVzc2lvbn0ge1xuICByZXR1cm4gdHMuaXNCaW5hcnlFeHByZXNzaW9uKG5vZGUpICYmIHRzLmlzUHJvcGVydHlBY2Nlc3NFeHByZXNzaW9uKG5vZGUubGVmdCkgJiZcbiAgICAgIG5vZGUubGVmdC5leHByZXNzaW9uLmtpbmQgPT09IHRzLlN5bnRheEtpbmQuVGhpc0tleXdvcmQ7XG59XG5cbmZ1bmN0aW9uIGlzTmFtZWREZWNsYXJhdGlvbihub2RlOiB0cy5EZWNsYXJhdGlvbik6IG5vZGUgaXMgdHMuTmFtZWREZWNsYXJhdGlvbiZcbiAgICB7bmFtZTogdHMuSWRlbnRpZmllcn0ge1xuICBjb25zdCBhbnlOb2RlOiBhbnkgPSBub2RlO1xuICByZXR1cm4gISFhbnlOb2RlLm5hbWUgJiYgdHMuaXNJZGVudGlmaWVyKGFueU5vZGUubmFtZSk7XG59XG5cblxuZnVuY3Rpb24gaXNDbGFzc01lbWJlclR5cGUobm9kZTogdHMuRGVjbGFyYXRpb24pOiBub2RlIGlzIHRzLkNsYXNzRWxlbWVudHxcbiAgICB0cy5Qcm9wZXJ0eUFjY2Vzc0V4cHJlc3Npb258dHMuQmluYXJ5RXhwcmVzc2lvbiB7XG4gIHJldHVybiAodHMuaXNDbGFzc0VsZW1lbnQobm9kZSkgfHwgaXNQcm9wZXJ0eUFjY2Vzcyhub2RlKSB8fCB0cy5pc0JpbmFyeUV4cHJlc3Npb24obm9kZSkpICYmXG4gICAgICAvLyBBZGRpdGlvbmFsbHksIGVuc3VyZSBgbm9kZWAgaXMgbm90IGFuIGluZGV4IHNpZ25hdHVyZSwgZm9yIGV4YW1wbGUgb24gYW4gYWJzdHJhY3QgY2xhc3M6XG4gICAgICAvLyBgYWJzdHJhY3QgY2xhc3MgRm9vIHsgW2tleTogc3RyaW5nXTogYW55OyB9YFxuICAgICAgIXRzLmlzSW5kZXhTaWduYXR1cmVEZWNsYXJhdGlvbihub2RlKTtcbn1cblxuLyoqXG4gKiBBdHRlbXB0IHRvIHJlc29sdmUgdGhlIHZhcmlhYmxlIGRlY2xhcmF0aW9uIHRoYXQgdGhlIGdpdmVuIGRlY2xhcmF0aW9uIGlzIGFzc2lnbmVkIHRvLlxuICogRm9yIGV4YW1wbGUsIGZvciB0aGUgZm9sbG93aW5nIGNvZGU6XG4gKlxuICogYGBgXG4gKiB2YXIgTXlDbGFzcyA9IE15Q2xhc3NfMSA9IGNsYXNzIE15Q2xhc3Mge307XG4gKiBgYGBcbiAqXG4gKiBhbmQgdGhlIHByb3ZpZGVkIGRlY2xhcmF0aW9uIGJlaW5nIGBjbGFzcyBNeUNsYXNzIHt9YCwgdGhpcyB3aWxsIHJldHVybiB0aGUgYHZhciBNeUNsYXNzYFxuICogZGVjbGFyYXRpb24uXG4gKlxuICogQHBhcmFtIGRlY2xhcmF0aW9uIFRoZSBkZWNsYXJhdGlvbiBmb3Igd2hpY2ggYW55IHZhcmlhYmxlIGRlY2xhcmF0aW9uIHNob3VsZCBiZSBvYnRhaW5lZC5cbiAqIEByZXR1cm5zIHRoZSBvdXRlciB2YXJpYWJsZSBkZWNsYXJhdGlvbiBpZiBmb3VuZCwgdW5kZWZpbmVkIG90aGVyd2lzZS5cbiAqL1xuZnVuY3Rpb24gZ2V0VmFyaWFibGVEZWNsYXJhdGlvbk9mRGVjbGFyYXRpb24oZGVjbGFyYXRpb246IHRzLkRlY2xhcmF0aW9uKTogdHMuVmFyaWFibGVEZWNsYXJhdGlvbnxcbiAgICB1bmRlZmluZWQge1xuICBsZXQgbm9kZSA9IGRlY2xhcmF0aW9uLnBhcmVudDtcblxuICAvLyBEZXRlY3QgYW4gaW50ZXJtZWRpYXJ5IHZhcmlhYmxlIGFzc2lnbm1lbnQgYW5kIHNraXAgb3ZlciBpdC5cbiAgaWYgKGlzQXNzaWdubWVudChub2RlKSAmJiB0cy5pc0lkZW50aWZpZXIobm9kZS5sZWZ0KSkge1xuICAgIG5vZGUgPSBub2RlLnBhcmVudDtcbiAgfVxuXG4gIHJldHVybiB0cy5pc1ZhcmlhYmxlRGVjbGFyYXRpb24obm9kZSkgPyBub2RlIDogdW5kZWZpbmVkO1xufVxuXG4vKipcbiAqIEEgY29uc3RydWN0b3IgZnVuY3Rpb24gbWF5IGhhdmUgYmVlbiBcInN5bnRoZXNpemVkXCIgYnkgVHlwZVNjcmlwdCBkdXJpbmcgSmF2YVNjcmlwdCBlbWl0LFxuICogaW4gdGhlIGNhc2Ugbm8gdXNlci1kZWZpbmVkIGNvbnN0cnVjdG9yIGV4aXN0cyBhbmQgZS5nLiBwcm9wZXJ0eSBpbml0aWFsaXplcnMgYXJlIHVzZWQuXG4gKiBUaG9zZSBpbml0aWFsaXplcnMgbmVlZCB0byBiZSBlbWl0dGVkIGludG8gYSBjb25zdHJ1Y3RvciBpbiBKYXZhU2NyaXB0LCBzbyB0aGUgVHlwZVNjcmlwdFxuICogY29tcGlsZXIgZ2VuZXJhdGVzIGEgc3ludGhldGljIGNvbnN0cnVjdG9yLlxuICpcbiAqIFdlIG5lZWQgdG8gaWRlbnRpZnkgc3VjaCBjb25zdHJ1Y3RvcnMgYXMgbmdjYyBuZWVkcyB0byBiZSBhYmxlIHRvIHRlbGwgaWYgYSBjbGFzcyBkaWRcbiAqIG9yaWdpbmFsbHkgaGF2ZSBhIGNvbnN0cnVjdG9yIGluIHRoZSBUeXBlU2NyaXB0IHNvdXJjZS4gV2hlbiBhIGNsYXNzIGhhcyBhIHN1cGVyY2xhc3MsXG4gKiBhIHN5bnRoZXNpemVkIGNvbnN0cnVjdG9yIG11c3Qgbm90IGJlIGNvbnNpZGVyZWQgYXMgYSB1c2VyLWRlZmluZWQgY29uc3RydWN0b3IgYXMgdGhhdFxuICogcHJldmVudHMgYSBiYXNlIGZhY3RvcnkgY2FsbCBmcm9tIGJlaW5nIGNyZWF0ZWQgYnkgbmd0c2MsIHJlc3VsdGluZyBpbiBhIGZhY3RvcnkgZnVuY3Rpb25cbiAqIHRoYXQgZG9lcyBub3QgaW5qZWN0IHRoZSBkZXBlbmRlbmNpZXMgb2YgdGhlIHN1cGVyY2xhc3MuIEhlbmNlLCB3ZSBpZGVudGlmeSBhIGRlZmF1bHRcbiAqIHN5bnRoZXNpemVkIHN1cGVyIGNhbGwgaW4gdGhlIGNvbnN0cnVjdG9yIGJvZHksIGFjY29yZGluZyB0byB0aGUgc3RydWN0dXJlIHRoYXQgVHlwZVNjcmlwdFxuICogZW1pdHMgZHVyaW5nIEphdmFTY3JpcHQgZW1pdDpcbiAqIGh0dHBzOi8vZ2l0aHViLmNvbS9NaWNyb3NvZnQvVHlwZVNjcmlwdC9ibG9iL3YzLjIuMi9zcmMvY29tcGlsZXIvdHJhbnNmb3JtZXJzL3RzLnRzI0wxMDY4LUwxMDgyXG4gKlxuICogQHBhcmFtIGNvbnN0cnVjdG9yIGEgY29uc3RydWN0b3IgZnVuY3Rpb24gdG8gdGVzdFxuICogQHJldHVybnMgdHJ1ZSBpZiB0aGUgY29uc3RydWN0b3IgYXBwZWFycyB0byBoYXZlIGJlZW4gc3ludGhlc2l6ZWRcbiAqL1xuZnVuY3Rpb24gaXNTeW50aGVzaXplZENvbnN0cnVjdG9yKGNvbnN0cnVjdG9yOiB0cy5Db25zdHJ1Y3RvckRlY2xhcmF0aW9uKTogYm9vbGVhbiB7XG4gIGlmICghY29uc3RydWN0b3IuYm9keSkgcmV0dXJuIGZhbHNlO1xuXG4gIGNvbnN0IGZpcnN0U3RhdGVtZW50ID0gY29uc3RydWN0b3IuYm9keS5zdGF0ZW1lbnRzWzBdO1xuICBpZiAoIWZpcnN0U3RhdGVtZW50IHx8ICF0cy5pc0V4cHJlc3Npb25TdGF0ZW1lbnQoZmlyc3RTdGF0ZW1lbnQpKSByZXR1cm4gZmFsc2U7XG5cbiAgcmV0dXJuIGlzU3ludGhlc2l6ZWRTdXBlckNhbGwoZmlyc3RTdGF0ZW1lbnQuZXhwcmVzc2lvbik7XG59XG5cbi8qKlxuICogVGVzdHMgd2hldGhlciB0aGUgZXhwcmVzc2lvbiBhcHBlYXJzIHRvIGhhdmUgYmVlbiBzeW50aGVzaXplZCBieSBUeXBlU2NyaXB0LCBpLmUuIHdoZXRoZXJcbiAqIGl0IGlzIG9mIHRoZSBmb2xsb3dpbmcgZm9ybTpcbiAqXG4gKiBgYGBcbiAqIHN1cGVyKC4uLmFyZ3VtZW50cyk7XG4gKiBgYGBcbiAqXG4gKiBAcGFyYW0gZXhwcmVzc2lvbiB0aGUgZXhwcmVzc2lvbiB0aGF0IGlzIHRvIGJlIHRlc3RlZFxuICogQHJldHVybnMgdHJ1ZSBpZiB0aGUgZXhwcmVzc2lvbiBhcHBlYXJzIHRvIGJlIGEgc3ludGhlc2l6ZWQgc3VwZXIgY2FsbFxuICovXG5mdW5jdGlvbiBpc1N5bnRoZXNpemVkU3VwZXJDYWxsKGV4cHJlc3Npb246IHRzLkV4cHJlc3Npb24pOiBib29sZWFuIHtcbiAgaWYgKCF0cy5pc0NhbGxFeHByZXNzaW9uKGV4cHJlc3Npb24pKSByZXR1cm4gZmFsc2U7XG4gIGlmIChleHByZXNzaW9uLmV4cHJlc3Npb24ua2luZCAhPT0gdHMuU3ludGF4S2luZC5TdXBlcktleXdvcmQpIHJldHVybiBmYWxzZTtcbiAgaWYgKGV4cHJlc3Npb24uYXJndW1lbnRzLmxlbmd0aCAhPT0gMSkgcmV0dXJuIGZhbHNlO1xuXG4gIGNvbnN0IGFyZ3VtZW50ID0gZXhwcmVzc2lvbi5hcmd1bWVudHNbMF07XG4gIHJldHVybiB0cy5pc1NwcmVhZEVsZW1lbnQoYXJndW1lbnQpICYmIHRzLmlzSWRlbnRpZmllcihhcmd1bWVudC5leHByZXNzaW9uKSAmJlxuICAgICAgYXJndW1lbnQuZXhwcmVzc2lvbi50ZXh0ID09PSAnYXJndW1lbnRzJztcbn1cblxuLyoqXG4gKiBGaW5kIHRoZSBzdGF0ZW1lbnQgdGhhdCBjb250YWlucyB0aGUgZ2l2ZW4gbm9kZVxuICogQHBhcmFtIG5vZGUgYSBub2RlIHdob3NlIGNvbnRhaW5pbmcgc3RhdGVtZW50IHdlIHdpc2ggdG8gZmluZFxuICovXG5mdW5jdGlvbiBnZXRDb250YWluaW5nU3RhdGVtZW50KG5vZGU6IHRzLk5vZGUpOiB0cy5FeHByZXNzaW9uU3RhdGVtZW50fG51bGwge1xuICB3aGlsZSAobm9kZSkge1xuICAgIGlmICh0cy5pc0V4cHJlc3Npb25TdGF0ZW1lbnQobm9kZSkpIHtcbiAgICAgIGJyZWFrO1xuICAgIH1cbiAgICBub2RlID0gbm9kZS5wYXJlbnQ7XG4gIH1cbiAgcmV0dXJuIG5vZGUgfHwgbnVsbDtcbn1cblxuZnVuY3Rpb24gZ2V0Um9vdEZpbGVPckZhaWwoYnVuZGxlOiBCdW5kbGVQcm9ncmFtKTogdHMuU291cmNlRmlsZSB7XG4gIGNvbnN0IHJvb3RGaWxlID0gYnVuZGxlLnByb2dyYW0uZ2V0U291cmNlRmlsZShidW5kbGUucGF0aCk7XG4gIGlmIChyb290RmlsZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKGBUaGUgZ2l2ZW4gcm9vdFBhdGggJHtyb290RmlsZX0gaXMgbm90IGEgZmlsZSBvZiB0aGUgcHJvZ3JhbS5gKTtcbiAgfVxuICByZXR1cm4gcm9vdEZpbGU7XG59XG5cbmZ1bmN0aW9uIGdldE5vblJvb3RQYWNrYWdlRmlsZXMoYnVuZGxlOiBCdW5kbGVQcm9ncmFtKTogdHMuU291cmNlRmlsZVtdIHtcbiAgY29uc3Qgcm9vdEZpbGUgPSBidW5kbGUucHJvZ3JhbS5nZXRTb3VyY2VGaWxlKGJ1bmRsZS5wYXRoKTtcbiAgcmV0dXJuIGJ1bmRsZS5wcm9ncmFtLmdldFNvdXJjZUZpbGVzKCkuZmlsdGVyKFxuICAgICAgZiA9PiAoZiAhPT0gcm9vdEZpbGUpICYmIGlzV2l0aGluUGFja2FnZShidW5kbGUucGFja2FnZSwgZikpO1xufVxuIl19