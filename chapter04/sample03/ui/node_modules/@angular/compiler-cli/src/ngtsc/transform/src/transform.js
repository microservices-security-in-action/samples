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
        define("@angular/compiler-cli/src/ngtsc/transform/src/transform", ["require", "exports", "tslib", "@angular/compiler", "typescript", "@angular/compiler-cli/src/ngtsc/translator", "@angular/compiler-cli/src/ngtsc/util/src/visitor", "@angular/compiler-cli/src/ngtsc/transform/src/utils"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var tslib_1 = require("tslib");
    var compiler_1 = require("@angular/compiler");
    var ts = require("typescript");
    var translator_1 = require("@angular/compiler-cli/src/ngtsc/translator");
    var visitor_1 = require("@angular/compiler-cli/src/ngtsc/util/src/visitor");
    var utils_1 = require("@angular/compiler-cli/src/ngtsc/transform/src/utils");
    var NO_DECORATORS = new Set();
    var CLOSURE_FILE_OVERVIEW_REGEXP = /\s+@fileoverview\s+/i;
    function ivyTransformFactory(compilation, reflector, importRewriter, defaultImportRecorder, isCore, isClosureCompilerEnabled) {
        return function (context) {
            return function (file) {
                return transformIvySourceFile(compilation, context, reflector, importRewriter, file, isCore, isClosureCompilerEnabled, defaultImportRecorder);
            };
        };
    }
    exports.ivyTransformFactory = ivyTransformFactory;
    var IvyVisitor = /** @class */ (function (_super) {
        tslib_1.__extends(IvyVisitor, _super);
        function IvyVisitor(compilation, reflector, importManager, defaultImportRecorder, isCore, constantPool) {
            var _this = _super.call(this) || this;
            _this.compilation = compilation;
            _this.reflector = reflector;
            _this.importManager = importManager;
            _this.defaultImportRecorder = defaultImportRecorder;
            _this.isCore = isCore;
            _this.constantPool = constantPool;
            return _this;
        }
        IvyVisitor.prototype.visitClassDeclaration = function (node) {
            var _this = this;
            // Determine if this class has an Ivy field that needs to be added, and compile the field
            // to an expression if so.
            var res = this.compilation.compile(node, this.constantPool);
            if (res !== null) {
                // There is at least one field to add.
                var statements_1 = [];
                var members_1 = tslib_1.__spread(node.members);
                res.forEach(function (field) {
                    // Translate the initializer for the field into TS nodes.
                    var exprNode = translator_1.translateExpression(field.initializer, _this.importManager, _this.defaultImportRecorder, ts.ScriptTarget.ES2015);
                    // Create a static property declaration for the new field.
                    var property = ts.createProperty(undefined, [ts.createToken(ts.SyntaxKind.StaticKeyword)], field.name, undefined, undefined, exprNode);
                    field.statements
                        .map(function (stmt) { return translator_1.translateStatement(stmt, _this.importManager, _this.defaultImportRecorder, ts.ScriptTarget.ES2015); })
                        .forEach(function (stmt) { return statements_1.push(stmt); });
                    members_1.push(property);
                });
                // Replace the class declaration with an updated version.
                node = ts.updateClassDeclaration(node, 
                // Remove the decorator which triggered this compilation, leaving the others alone.
                maybeFilterDecorator(node.decorators, this.compilation.decoratorsFor(node)), node.modifiers, node.name, node.typeParameters, node.heritageClauses || [], 
                // Map over the class members and remove any Angular decorators from them.
                members_1.map(function (member) { return _this._stripAngularDecorators(member); }));
                return { node: node, after: statements_1 };
            }
            return { node: node };
        };
        /**
         * Return all decorators on a `Declaration` which are from @angular/core, or an empty set if none
         * are.
         */
        IvyVisitor.prototype._angularCoreDecorators = function (decl) {
            var _this = this;
            var decorators = this.reflector.getDecoratorsOfDeclaration(decl);
            if (decorators === null) {
                return NO_DECORATORS;
            }
            var coreDecorators = decorators.filter(function (dec) { return _this.isCore || isFromAngularCore(dec); })
                .map(function (dec) { return dec.node; });
            if (coreDecorators.length > 0) {
                return new Set(coreDecorators);
            }
            else {
                return NO_DECORATORS;
            }
        };
        /**
         * Given a `ts.Node`, filter the decorators array and return a version containing only non-Angular
         * decorators.
         *
         * If all decorators are removed (or none existed in the first place), this method returns
         * `undefined`.
         */
        IvyVisitor.prototype._nonCoreDecoratorsOnly = function (node) {
            // Shortcut if the node has no decorators.
            if (node.decorators === undefined) {
                return undefined;
            }
            // Build a Set of the decorators on this node from @angular/core.
            var coreDecorators = this._angularCoreDecorators(node);
            if (coreDecorators.size === node.decorators.length) {
                // If all decorators are to be removed, return `undefined`.
                return undefined;
            }
            else if (coreDecorators.size === 0) {
                // If no decorators need to be removed, return the original decorators array.
                return node.decorators;
            }
            // Filter out the core decorators.
            var filtered = node.decorators.filter(function (dec) { return !coreDecorators.has(dec); });
            // If no decorators survive, return `undefined`. This can only happen if a core decorator is
            // repeated on the node.
            if (filtered.length === 0) {
                return undefined;
            }
            // Create a new `NodeArray` with the filtered decorators that sourcemaps back to the original.
            var array = ts.createNodeArray(filtered);
            array.pos = node.decorators.pos;
            array.end = node.decorators.end;
            return array;
        };
        /**
         * Remove Angular decorators from a `ts.Node` in a shallow manner.
         *
         * This will remove decorators from class elements (getters, setters, properties, methods) as well
         * as parameters of constructors.
         */
        IvyVisitor.prototype._stripAngularDecorators = function (node) {
            var _this = this;
            if (ts.isParameter(node)) {
                // Strip decorators from parameters (probably of the constructor).
                node = ts.updateParameter(node, this._nonCoreDecoratorsOnly(node), node.modifiers, node.dotDotDotToken, node.name, node.questionToken, node.type, node.initializer);
            }
            else if (ts.isMethodDeclaration(node) && node.decorators !== undefined) {
                // Strip decorators of methods.
                node = ts.updateMethod(node, this._nonCoreDecoratorsOnly(node), node.modifiers, node.asteriskToken, node.name, node.questionToken, node.typeParameters, node.parameters, node.type, node.body);
            }
            else if (ts.isPropertyDeclaration(node) && node.decorators !== undefined) {
                // Strip decorators of properties.
                node = ts.updateProperty(node, this._nonCoreDecoratorsOnly(node), node.modifiers, node.name, node.questionToken, node.type, node.initializer);
            }
            else if (ts.isGetAccessor(node)) {
                // Strip decorators of getters.
                node = ts.updateGetAccessor(node, this._nonCoreDecoratorsOnly(node), node.modifiers, node.name, node.parameters, node.type, node.body);
            }
            else if (ts.isSetAccessor(node)) {
                // Strip decorators of setters.
                node = ts.updateSetAccessor(node, this._nonCoreDecoratorsOnly(node), node.modifiers, node.name, node.parameters, node.body);
            }
            else if (ts.isConstructorDeclaration(node)) {
                // For constructors, strip decorators of the parameters.
                var parameters = node.parameters.map(function (param) { return _this._stripAngularDecorators(param); });
                node =
                    ts.updateConstructor(node, node.decorators, node.modifiers, parameters, node.body);
            }
            return node;
        };
        return IvyVisitor;
    }(visitor_1.Visitor));
    /**
     * A transformer which operates on ts.SourceFiles and applies changes from an `IvyCompilation`.
     */
    function transformIvySourceFile(compilation, context, reflector, importRewriter, file, isCore, isClosureCompilerEnabled, defaultImportRecorder) {
        var constantPool = new compiler_1.ConstantPool();
        var importManager = new translator_1.ImportManager(importRewriter);
        // Recursively scan through the AST and perform any updates requested by the IvyCompilation.
        var visitor = new IvyVisitor(compilation, reflector, importManager, defaultImportRecorder, isCore, constantPool);
        var sf = visitor_1.visit(file, visitor, context);
        // Generate the constant statements first, as they may involve adding additional imports
        // to the ImportManager.
        var constants = constantPool.statements.map(function (stmt) {
            return translator_1.translateStatement(stmt, importManager, defaultImportRecorder, ts.ScriptTarget.ES2015);
        });
        // Preserve @fileoverview comments required by Closure, since the location might change as a
        // result of adding extra imports and constant pool statements.
        var fileOverviewMeta = isClosureCompilerEnabled ? getFileOverviewComment(sf.statements) : null;
        // Add new imports for this file.
        sf = utils_1.addImports(importManager, sf, constants);
        if (fileOverviewMeta !== null) {
            setFileOverviewComment(sf, fileOverviewMeta);
        }
        return sf;
    }
    function getFileOverviewComment(statements) {
        if (statements.length > 0) {
            var host = statements[0];
            var trailing = false;
            var comments = ts.getSyntheticLeadingComments(host);
            // If @fileoverview tag is not found in source file, tsickle produces fake node with trailing
            // comment and inject it at the very beginning of the generated file. So we need to check for
            // leading as well as trailing comments.
            if (!comments || comments.length === 0) {
                trailing = true;
                comments = ts.getSyntheticTrailingComments(host);
            }
            if (comments && comments.length > 0 && CLOSURE_FILE_OVERVIEW_REGEXP.test(comments[0].text)) {
                return { comments: comments, host: host, trailing: trailing };
            }
        }
        return null;
    }
    function setFileOverviewComment(sf, fileoverview) {
        var comments = fileoverview.comments, host = fileoverview.host, trailing = fileoverview.trailing;
        // If host statement is no longer the first one, it means that extra statements were added at the
        // very beginning, so we need to relocate @fileoverview comment and cleanup the original statement
        // that hosted it.
        if (sf.statements.length > 0 && host !== sf.statements[0]) {
            if (trailing) {
                ts.setSyntheticTrailingComments(host, undefined);
            }
            else {
                ts.setSyntheticLeadingComments(host, undefined);
            }
            ts.setSyntheticLeadingComments(sf.statements[0], comments);
        }
    }
    function maybeFilterDecorator(decorators, toRemove) {
        if (decorators === undefined) {
            return undefined;
        }
        var filtered = decorators.filter(function (dec) { return toRemove.find(function (decToRemove) { return ts.getOriginalNode(dec) === decToRemove; }) === undefined; });
        if (filtered.length === 0) {
            return undefined;
        }
        return ts.createNodeArray(filtered);
    }
    function isFromAngularCore(decorator) {
        return decorator.import !== null && decorator.import.from === '@angular/core';
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHJhbnNmb3JtLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tcGlsZXItY2xpL3NyYy9uZ3RzYy90cmFuc2Zvcm0vc3JjL3RyYW5zZm9ybS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7Ozs7Ozs7Ozs7Ozs7SUFFSCw4Q0FBK0M7SUFDL0MsK0JBQWlDO0lBSWpDLHlFQUF3RjtJQUN4Riw0RUFBNEU7SUFHNUUsNkVBQW1DO0lBRW5DLElBQU0sYUFBYSxHQUFHLElBQUksR0FBRyxFQUFnQixDQUFDO0lBRTlDLElBQU0sNEJBQTRCLEdBQUcsc0JBQXNCLENBQUM7SUFXNUQsU0FBZ0IsbUJBQW1CLENBQy9CLFdBQTBCLEVBQUUsU0FBeUIsRUFBRSxjQUE4QixFQUNyRixxQkFBNEMsRUFBRSxNQUFlLEVBQzdELHdCQUFpQztRQUNuQyxPQUFPLFVBQUMsT0FBaUM7WUFDdkMsT0FBTyxVQUFDLElBQW1CO2dCQUN6QixPQUFPLHNCQUFzQixDQUN6QixXQUFXLEVBQUUsT0FBTyxFQUFFLFNBQVMsRUFBRSxjQUFjLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBRSx3QkFBd0IsRUFDdkYscUJBQXFCLENBQUMsQ0FBQztZQUM3QixDQUFDLENBQUM7UUFDSixDQUFDLENBQUM7SUFDSixDQUFDO0lBWEQsa0RBV0M7SUFFRDtRQUF5QixzQ0FBTztRQUM5QixvQkFDWSxXQUEwQixFQUFVLFNBQXlCLEVBQzdELGFBQTRCLEVBQVUscUJBQTRDLEVBQ2xGLE1BQWUsRUFBVSxZQUEwQjtZQUgvRCxZQUlFLGlCQUFPLFNBQ1I7WUFKVyxpQkFBVyxHQUFYLFdBQVcsQ0FBZTtZQUFVLGVBQVMsR0FBVCxTQUFTLENBQWdCO1lBQzdELG1CQUFhLEdBQWIsYUFBYSxDQUFlO1lBQVUsMkJBQXFCLEdBQXJCLHFCQUFxQixDQUF1QjtZQUNsRixZQUFNLEdBQU4sTUFBTSxDQUFTO1lBQVUsa0JB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dXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtDb25zdGFudFBvb2x9IGZyb20gJ0Bhbmd1bGFyL2NvbXBpbGVyJztcbmltcG9ydCAqIGFzIHRzIGZyb20gJ3R5cGVzY3JpcHQnO1xuXG5pbXBvcnQge0RlZmF1bHRJbXBvcnRSZWNvcmRlciwgSW1wb3J0UmV3cml0ZXJ9IGZyb20gJy4uLy4uL2ltcG9ydHMnO1xuaW1wb3J0IHtEZWNvcmF0b3IsIFJlZmxlY3Rpb25Ib3N0fSBmcm9tICcuLi8uLi9yZWZsZWN0aW9uJztcbmltcG9ydCB7SW1wb3J0TWFuYWdlciwgdHJhbnNsYXRlRXhwcmVzc2lvbiwgdHJhbnNsYXRlU3RhdGVtZW50fSBmcm9tICcuLi8uLi90cmFuc2xhdG9yJztcbmltcG9ydCB7VmlzaXRMaXN0RW50cnlSZXN1bHQsIFZpc2l0b3IsIHZpc2l0fSBmcm9tICcuLi8uLi91dGlsL3NyYy92aXNpdG9yJztcblxuaW1wb3J0IHtUcmFpdENvbXBpbGVyfSBmcm9tICcuL2NvbXBpbGF0aW9uJztcbmltcG9ydCB7YWRkSW1wb3J0c30gZnJvbSAnLi91dGlscyc7XG5cbmNvbnN0IE5PX0RFQ09SQVRPUlMgPSBuZXcgU2V0PHRzLkRlY29yYXRvcj4oKTtcblxuY29uc3QgQ0xPU1VSRV9GSUxFX09WRVJWSUVXX1JFR0VYUCA9IC9cXHMrQGZpbGVvdmVydmlld1xccysvaTtcblxuLyoqXG4gKiBNZXRhZGF0YSB0byBzdXBwb3J0IEBmaWxlb3ZlcnZpZXcgYmxvY2tzIChDbG9zdXJlIGFubm90YXRpb25zKSBleHRyYWN0aW5nL3Jlc3RvcmluZy5cbiAqL1xuaW50ZXJmYWNlIEZpbGVPdmVydmlld01ldGEge1xuICBjb21tZW50czogdHMuU3ludGhlc2l6ZWRDb21tZW50W107XG4gIGhvc3Q6IHRzLlN0YXRlbWVudDtcbiAgdHJhaWxpbmc6IGJvb2xlYW47XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpdnlUcmFuc2Zvcm1GYWN0b3J5KFxuICAgIGNvbXBpbGF0aW9uOiBUcmFpdENvbXBpbGVyLCByZWZsZWN0b3I6IFJlZmxlY3Rpb25Ib3N0LCBpbXBvcnRSZXdyaXRlcjogSW1wb3J0UmV3cml0ZXIsXG4gICAgZGVmYXVsdEltcG9ydFJlY29yZGVyOiBEZWZhdWx0SW1wb3J0UmVjb3JkZXIsIGlzQ29yZTogYm9vbGVhbixcbiAgICBpc0Nsb3N1cmVDb21waWxlckVuYWJsZWQ6IGJvb2xlYW4pOiB0cy5UcmFuc2Zvcm1lckZhY3Rvcnk8dHMuU291cmNlRmlsZT4ge1xuICByZXR1cm4gKGNvbnRleHQ6IHRzLlRyYW5zZm9ybWF0aW9uQ29udGV4dCk6IHRzLlRyYW5zZm9ybWVyPHRzLlNvdXJjZUZpbGU+ID0+IHtcbiAgICByZXR1cm4gKGZpbGU6IHRzLlNvdXJjZUZpbGUpOiB0cy5Tb3VyY2VGaWxlID0+IHtcbiAgICAgIHJldHVybiB0cmFuc2Zvcm1JdnlTb3VyY2VGaWxlKFxuICAgICAgICAgIGNvbXBpbGF0aW9uLCBjb250ZXh0LCByZWZsZWN0b3IsIGltcG9ydFJld3JpdGVyLCBmaWxlLCBpc0NvcmUsIGlzQ2xvc3VyZUNvbXBpbGVyRW5hYmxlZCxcbiAgICAgICAgICBkZWZhdWx0SW1wb3J0UmVjb3JkZXIpO1xuICAgIH07XG4gIH07XG59XG5cbmNsYXNzIEl2eVZpc2l0b3IgZXh0ZW5kcyBWaXNpdG9yIHtcbiAgY29uc3RydWN0b3IoXG4gICAgICBwcml2YXRlIGNvbXBpbGF0aW9uOiBUcmFpdENvbXBpbGVyLCBwcml2YXRlIHJlZmxlY3RvcjogUmVmbGVjdGlvbkhvc3QsXG4gICAgICBwcml2YXRlIGltcG9ydE1hbmFnZXI6IEltcG9ydE1hbmFnZXIsIHByaXZhdGUgZGVmYXVsdEltcG9ydFJlY29yZGVyOiBEZWZhdWx0SW1wb3J0UmVjb3JkZXIsXG4gICAgICBwcml2YXRlIGlzQ29yZTogYm9vbGVhbiwgcHJpdmF0ZSBjb25zdGFudFBvb2w6IENvbnN0YW50UG9vbCkge1xuICAgIHN1cGVyKCk7XG4gIH1cblxuICB2aXNpdENsYXNzRGVjbGFyYXRpb24obm9kZTogdHMuQ2xhc3NEZWNsYXJhdGlvbik6XG4gICAgICBWaXNpdExpc3RFbnRyeVJlc3VsdDx0cy5TdGF0ZW1lbnQsIHRzLkNsYXNzRGVjbGFyYXRpb24+IHtcbiAgICAvLyBEZXRlcm1pbmUgaWYgdGhpcyBjbGFzcyBoYXMgYW4gSXZ5IGZpZWxkIHRoYXQgbmVlZHMgdG8gYmUgYWRkZWQsIGFuZCBjb21waWxlIHRoZSBmaWVsZFxuICAgIC8vIHRvIGFuIGV4cHJlc3Npb24gaWYgc28uXG4gICAgY29uc3QgcmVzID0gdGhpcy5jb21waWxhdGlvbi5jb21waWxlKG5vZGUsIHRoaXMuY29uc3RhbnRQb29sKTtcblxuICAgIGlmIChyZXMgIT09IG51bGwpIHtcbiAgICAgIC8vIFRoZXJlIGlzIGF0IGxlYXN0IG9uZSBmaWVsZCB0byBhZGQuXG4gICAgICBjb25zdCBzdGF0ZW1lbnRzOiB0cy5TdGF0ZW1lbnRbXSA9IFtdO1xuICAgICAgY29uc3QgbWVtYmVycyA9IFsuLi5ub2RlLm1lbWJlcnNdO1xuXG4gICAgICByZXMuZm9yRWFjaChmaWVsZCA9PiB7XG4gICAgICAgIC8vIFRyYW5zbGF0ZSB0aGUgaW5pdGlhbGl6ZXIgZm9yIHRoZSBmaWVsZCBpbnRvIFRTIG5vZGVzLlxuICAgICAgICBjb25zdCBleHByTm9kZSA9IHRyYW5zbGF0ZUV4cHJlc3Npb24oXG4gICAgICAgICAgICBmaWVsZC5pbml0aWFsaXplciwgdGhpcy5pbXBvcnRNYW5hZ2VyLCB0aGlzLmRlZmF1bHRJbXBvcnRSZWNvcmRlcixcbiAgICAgICAgICAgIHRzLlNjcmlwdFRhcmdldC5FUzIwMTUpO1xuXG4gICAgICAgIC8vIENyZWF0ZSBhIHN0YXRpYyBwcm9wZXJ0eSBkZWNsYXJhdGlvbiBmb3IgdGhlIG5ldyBmaWVsZC5cbiAgICAgICAgY29uc3QgcHJvcGVydHkgPSB0cy5jcmVhdGVQcm9wZXJ0eShcbiAgICAgICAgICAgIHVuZGVmaW5lZCwgW3RzLmNyZWF0ZVRva2VuKHRzLlN5bnRheEtpbmQuU3RhdGljS2V5d29yZCldLCBmaWVsZC5uYW1lLCB1bmRlZmluZWQsXG4gICAgICAgICAgICB1bmRlZmluZWQsIGV4cHJOb2RlKTtcblxuICAgICAgICBmaWVsZC5zdGF0ZW1lbnRzXG4gICAgICAgICAgICAubWFwKFxuICAgICAgICAgICAgICAgIHN0bXQgPT4gdHJhbnNsYXRlU3RhdGVtZW50KFxuICAgICAgICAgICAgICAgICAgICBzdG10LCB0aGlzLmltcG9ydE1hbmFnZXIsIHRoaXMuZGVmYXVsdEltcG9ydFJlY29yZGVyLCB0cy5TY3JpcHRUYXJnZXQuRVMyMDE1KSlcbiAgICAgICAgICAgIC5mb3JFYWNoKHN0bXQgPT4gc3RhdGVtZW50cy5wdXNoKHN0bXQpKTtcblxuICAgICAgICBtZW1iZXJzLnB1c2gocHJvcGVydHkpO1xuICAgICAgfSk7XG5cbiAgICAgIC8vIFJlcGxhY2UgdGhlIGNsYXNzIGRlY2xhcmF0aW9uIHdpdGggYW4gdXBkYXRlZCB2ZXJzaW9uLlxuICAgICAgbm9kZSA9IHRzLnVwZGF0ZUNsYXNzRGVjbGFyYXRpb24oXG4gICAgICAgICAgbm9kZSxcbiAgICAgICAgICAvLyBSZW1vdmUgdGhlIGRlY29yYXRvciB3aGljaCB0cmlnZ2VyZWQgdGhpcyBjb21waWxhdGlvbiwgbGVhdmluZyB0aGUgb3RoZXJzIGFsb25lLlxuICAgICAgICAgIG1heWJlRmlsdGVyRGVjb3JhdG9yKG5vZGUuZGVjb3JhdG9ycywgdGhpcy5jb21waWxhdGlvbi5kZWNvcmF0b3JzRm9yKG5vZGUpKSxcbiAgICAgICAgICBub2RlLm1vZGlmaWVycywgbm9kZS5uYW1lLCBub2RlLnR5cGVQYXJhbWV0ZXJzLCBub2RlLmhlcml0YWdlQ2xhdXNlcyB8fCBbXSxcbiAgICAgICAgICAvLyBNYXAgb3ZlciB0aGUgY2xhc3MgbWVtYmVycyBhbmQgcmVtb3ZlIGFueSBBbmd1bGFyIGRlY29yYXRvcnMgZnJvbSB0aGVtLlxuICAgICAgICAgIG1lbWJlcnMubWFwKG1lbWJlciA9PiB0aGlzLl9zdHJpcEFuZ3VsYXJEZWNvcmF0b3JzKG1lbWJlcikpKTtcbiAgICAgIHJldHVybiB7bm9kZSwgYWZ0ZXI6IHN0YXRlbWVudHN9O1xuICAgIH1cblxuICAgIHJldHVybiB7bm9kZX07XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJuIGFsbCBkZWNvcmF0b3JzIG9uIGEgYERlY2xhcmF0aW9uYCB3aGljaCBhcmUgZnJvbSBAYW5ndWxhci9jb3JlLCBvciBhbiBlbXB0eSBzZXQgaWYgbm9uZVxuICAgKiBhcmUuXG4gICAqL1xuICBwcml2YXRlIF9hbmd1bGFyQ29yZURlY29yYXRvcnMoZGVjbDogdHMuRGVjbGFyYXRpb24pOiBTZXQ8dHMuRGVjb3JhdG9yPiB7XG4gICAgY29uc3QgZGVjb3JhdG9ycyA9IHRoaXMucmVmbGVjdG9yLmdldERlY29yYXRvcnNPZkRlY2xhcmF0aW9uKGRlY2wpO1xuICAgIGlmIChkZWNvcmF0b3JzID09PSBudWxsKSB7XG4gICAgICByZXR1cm4gTk9fREVDT1JBVE9SUztcbiAgICB9XG4gICAgY29uc3QgY29yZURlY29yYXRvcnMgPSBkZWNvcmF0b3JzLmZpbHRlcihkZWMgPT4gdGhpcy5pc0NvcmUgfHwgaXNGcm9tQW5ndWxhckNvcmUoZGVjKSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAubWFwKGRlYyA9PiBkZWMubm9kZSBhcyB0cy5EZWNvcmF0b3IpO1xuICAgIGlmIChjb3JlRGVjb3JhdG9ycy5sZW5ndGggPiAwKSB7XG4gICAgICByZXR1cm4gbmV3IFNldDx0cy5EZWNvcmF0b3I+KGNvcmVEZWNvcmF0b3JzKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIE5PX0RFQ09SQVRPUlM7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEdpdmVuIGEgYHRzLk5vZGVgLCBmaWx0ZXIgdGhlIGRlY29yYXRvcnMgYXJyYXkgYW5kIHJldHVybiBhIHZlcnNpb24gY29udGFpbmluZyBvbmx5IG5vbi1Bbmd1bGFyXG4gICAqIGRlY29yYXRvcnMuXG4gICAqXG4gICAqIElmIGFsbCBkZWNvcmF0b3JzIGFyZSByZW1vdmVkIChvciBub25lIGV4aXN0ZWQgaW4gdGhlIGZpcnN0IHBsYWNlKSwgdGhpcyBtZXRob2QgcmV0dXJuc1xuICAgKiBgdW5kZWZpbmVkYC5cbiAgICovXG4gIHByaXZhdGUgX25vbkNvcmVEZWNvcmF0b3JzT25seShub2RlOiB0cy5EZWNsYXJhdGlvbik6IHRzLk5vZGVBcnJheTx0cy5EZWNvcmF0b3I+fHVuZGVmaW5lZCB7XG4gICAgLy8gU2hvcnRjdXQgaWYgdGhlIG5vZGUgaGFzIG5vIGRlY29yYXRvcnMuXG4gICAgaWYgKG5vZGUuZGVjb3JhdG9ycyA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIH1cbiAgICAvLyBCdWlsZCBhIFNldCBvZiB0aGUgZGVjb3JhdG9ycyBvbiB0aGlzIG5vZGUgZnJvbSBAYW5ndWxhci9jb3JlLlxuICAgIGNvbnN0IGNvcmVEZWNvcmF0b3JzID0gdGhpcy5fYW5ndWxhckNvcmVEZWNvcmF0b3JzKG5vZGUpO1xuXG4gICAgaWYgKGNvcmVEZWNvcmF0b3JzLnNpemUgPT09IG5vZGUuZGVjb3JhdG9ycy5sZW5ndGgpIHtcbiAgICAgIC8vIElmIGFsbCBkZWNvcmF0b3JzIGFyZSB0byBiZSByZW1vdmVkLCByZXR1cm4gYHVuZGVmaW5lZGAuXG4gICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIH0gZWxzZSBpZiAoY29yZURlY29yYXRvcnMuc2l6ZSA9PT0gMCkge1xuICAgICAgLy8gSWYgbm8gZGVjb3JhdG9ycyBuZWVkIHRvIGJlIHJlbW92ZWQsIHJldHVybiB0aGUgb3JpZ2luYWwgZGVjb3JhdG9ycyBhcnJheS5cbiAgICAgIHJldHVybiBub2RlLmRlY29yYXRvcnM7XG4gICAgfVxuXG4gICAgLy8gRmlsdGVyIG91dCB0aGUgY29yZSBkZWNvcmF0b3JzLlxuICAgIGNvbnN0IGZpbHRlcmVkID0gbm9kZS5kZWNvcmF0b3JzLmZpbHRlcihkZWMgPT4gIWNvcmVEZWNvcmF0b3JzLmhhcyhkZWMpKTtcblxuICAgIC8vIElmIG5vIGRlY29yYXRvcnMgc3Vydml2ZSwgcmV0dXJuIGB1bmRlZmluZWRgLiBUaGlzIGNhbiBvbmx5IGhhcHBlbiBpZiBhIGNvcmUgZGVjb3JhdG9yIGlzXG4gICAgLy8gcmVwZWF0ZWQgb24gdGhlIG5vZGUuXG4gICAgaWYgKGZpbHRlcmVkLmxlbmd0aCA9PT0gMCkge1xuICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICB9XG5cbiAgICAvLyBDcmVhdGUgYSBuZXcgYE5vZGVBcnJheWAgd2l0aCB0aGUgZmlsdGVyZWQgZGVjb3JhdG9ycyB0aGF0IHNvdXJjZW1hcHMgYmFjayB0byB0aGUgb3JpZ2luYWwuXG4gICAgY29uc3QgYXJyYXkgPSB0cy5jcmVhdGVOb2RlQXJyYXkoZmlsdGVyZWQpO1xuICAgIGFycmF5LnBvcyA9IG5vZGUuZGVjb3JhdG9ycy5wb3M7XG4gICAgYXJyYXkuZW5kID0gbm9kZS5kZWNvcmF0b3JzLmVuZDtcbiAgICByZXR1cm4gYXJyYXk7XG4gIH1cblxuICAvKipcbiAgICogUmVtb3ZlIEFuZ3VsYXIgZGVjb3JhdG9ycyBmcm9tIGEgYHRzLk5vZGVgIGluIGEgc2hhbGxvdyBtYW5uZXIuXG4gICAqXG4gICAqIFRoaXMgd2lsbCByZW1vdmUgZGVjb3JhdG9ycyBmcm9tIGNsYXNzIGVsZW1lbnRzIChnZXR0ZXJzLCBzZXR0ZXJzLCBwcm9wZXJ0aWVzLCBtZXRob2RzKSBhcyB3ZWxsXG4gICAqIGFzIHBhcmFtZXRlcnMgb2YgY29uc3RydWN0b3JzLlxuICAgKi9cbiAgcHJpdmF0ZSBfc3RyaXBBbmd1bGFyRGVjb3JhdG9yczxUIGV4dGVuZHMgdHMuTm9kZT4obm9kZTogVCk6IFQge1xuICAgIGlmICh0cy5pc1BhcmFtZXRlcihub2RlKSkge1xuICAgICAgLy8gU3RyaXAgZGVjb3JhdG9ycyBmcm9tIHBhcmFtZXRlcnMgKHByb2JhYmx5IG9mIHRoZSBjb25zdHJ1Y3RvcikuXG4gICAgICBub2RlID0gdHMudXBkYXRlUGFyYW1ldGVyKFxuICAgICAgICAgICAgICAgICBub2RlLCB0aGlzLl9ub25Db3JlRGVjb3JhdG9yc09ubHkobm9kZSksIG5vZGUubW9kaWZpZXJzLCBub2RlLmRvdERvdERvdFRva2VuLFxuICAgICAgICAgICAgICAgICBub2RlLm5hbWUsIG5vZGUucXVlc3Rpb25Ub2tlbiwgbm9kZS50eXBlLCBub2RlLmluaXRpYWxpemVyKSBhcyBUICZcbiAgICAgICAgICB0cy5QYXJhbWV0ZXJEZWNsYXJhdGlvbjtcbiAgICB9IGVsc2UgaWYgKHRzLmlzTWV0aG9kRGVjbGFyYXRpb24obm9kZSkgJiYgbm9kZS5kZWNvcmF0b3JzICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIC8vIFN0cmlwIGRlY29yYXRvcnMgb2YgbWV0aG9kcy5cbiAgICAgIG5vZGUgPSB0cy51cGRhdGVNZXRob2QoXG4gICAgICAgICAgICAgICAgIG5vZGUsIHRoaXMuX25vbkNvcmVEZWNvcmF0b3JzT25seShub2RlKSwgbm9kZS5tb2RpZmllcnMsIG5vZGUuYXN0ZXJpc2tUb2tlbixcbiAgICAgICAgICAgICAgICAgbm9kZS5uYW1lLCBub2RlLnF1ZXN0aW9uVG9rZW4sIG5vZGUudHlwZVBhcmFtZXRlcnMsIG5vZGUucGFyYW1ldGVycywgbm9kZS50eXBlLFxuICAgICAgICAgICAgICAgICBub2RlLmJvZHkpIGFzIFQgJlxuICAgICAgICAgIHRzLk1ldGhvZERlY2xhcmF0aW9uO1xuICAgIH0gZWxzZSBpZiAodHMuaXNQcm9wZXJ0eURlY2xhcmF0aW9uKG5vZGUpICYmIG5vZGUuZGVjb3JhdG9ycyAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAvLyBTdHJpcCBkZWNvcmF0b3JzIG9mIHByb3BlcnRpZXMuXG4gICAgICBub2RlID0gdHMudXBkYXRlUHJvcGVydHkoXG4gICAgICAgICAgICAgICAgIG5vZGUsIHRoaXMuX25vbkNvcmVEZWNvcmF0b3JzT25seShub2RlKSwgbm9kZS5tb2RpZmllcnMsIG5vZGUubmFtZSxcbiAgICAgICAgICAgICAgICAgbm9kZS5xdWVzdGlvblRva2VuLCBub2RlLnR5cGUsIG5vZGUuaW5pdGlhbGl6ZXIpIGFzIFQgJlxuICAgICAgICAgIHRzLlByb3BlcnR5RGVjbGFyYXRpb247XG4gICAgfSBlbHNlIGlmICh0cy5pc0dldEFjY2Vzc29yKG5vZGUpKSB7XG4gICAgICAvLyBTdHJpcCBkZWNvcmF0b3JzIG9mIGdldHRlcnMuXG4gICAgICBub2RlID0gdHMudXBkYXRlR2V0QWNjZXNzb3IoXG4gICAgICAgICAgICAgICAgIG5vZGUsIHRoaXMuX25vbkNvcmVEZWNvcmF0b3JzT25seShub2RlKSwgbm9kZS5tb2RpZmllcnMsIG5vZGUubmFtZSxcbiAgICAgICAgICAgICAgICAgbm9kZS5wYXJhbWV0ZXJzLCBub2RlLnR5cGUsIG5vZGUuYm9keSkgYXMgVCAmXG4gICAgICAgICAgdHMuR2V0QWNjZXNzb3JEZWNsYXJhdGlvbjtcbiAgICB9IGVsc2UgaWYgKHRzLmlzU2V0QWNjZXNzb3Iobm9kZSkpIHtcbiAgICAgIC8vIFN0cmlwIGRlY29yYXRvcnMgb2Ygc2V0dGVycy5cbiAgICAgIG5vZGUgPSB0cy51cGRhdGVTZXRBY2Nlc3NvcihcbiAgICAgICAgICAgICAgICAgbm9kZSwgdGhpcy5fbm9uQ29yZURlY29yYXRvcnNPbmx5KG5vZGUpLCBub2RlLm1vZGlmaWVycywgbm9kZS5uYW1lLFxuICAgICAgICAgICAgICAgICBub2RlLnBhcmFtZXRlcnMsIG5vZGUuYm9keSkgYXMgVCAmXG4gICAgICAgICAgdHMuU2V0QWNjZXNzb3JEZWNsYXJhdGlvbjtcbiAgICB9IGVsc2UgaWYgKHRzLmlzQ29uc3RydWN0b3JEZWNsYXJhdGlvbihub2RlKSkge1xuICAgICAgLy8gRm9yIGNvbnN0cnVjdG9ycywgc3RyaXAgZGVjb3JhdG9ycyBvZiB0aGUgcGFyYW1ldGVycy5cbiAgICAgIGNvbnN0IHBhcmFtZXRlcnMgPSBub2RlLnBhcmFtZXRlcnMubWFwKHBhcmFtID0+IHRoaXMuX3N0cmlwQW5ndWxhckRlY29yYXRvcnMocGFyYW0pKTtcbiAgICAgIG5vZGUgPVxuICAgICAgICAgIHRzLnVwZGF0ZUNvbnN0cnVjdG9yKG5vZGUsIG5vZGUuZGVjb3JhdG9ycywgbm9kZS5tb2RpZmllcnMsIHBhcmFtZXRlcnMsIG5vZGUuYm9keSkgYXMgVCAmXG4gICAgICAgICAgdHMuQ29uc3RydWN0b3JEZWNsYXJhdGlvbjtcbiAgICB9XG4gICAgcmV0dXJuIG5vZGU7XG4gIH1cbn1cblxuLyoqXG4gKiBBIHRyYW5zZm9ybWVyIHdoaWNoIG9wZXJhdGVzIG9uIHRzLlNvdXJjZUZpbGVzIGFuZCBhcHBsaWVzIGNoYW5nZXMgZnJvbSBhbiBgSXZ5Q29tcGlsYXRpb25gLlxuICovXG5mdW5jdGlvbiB0cmFuc2Zvcm1JdnlTb3VyY2VGaWxlKFxuICAgIGNvbXBpbGF0aW9uOiBUcmFpdENvbXBpbGVyLCBjb250ZXh0OiB0cy5UcmFuc2Zvcm1hdGlvbkNvbnRleHQsIHJlZmxlY3RvcjogUmVmbGVjdGlvbkhvc3QsXG4gICAgaW1wb3J0UmV3cml0ZXI6IEltcG9ydFJld3JpdGVyLCBmaWxlOiB0cy5Tb3VyY2VGaWxlLCBpc0NvcmU6IGJvb2xlYW4sXG4gICAgaXNDbG9zdXJlQ29tcGlsZXJFbmFibGVkOiBib29sZWFuLFxuICAgIGRlZmF1bHRJbXBvcnRSZWNvcmRlcjogRGVmYXVsdEltcG9ydFJlY29yZGVyKTogdHMuU291cmNlRmlsZSB7XG4gIGNvbnN0IGNvbnN0YW50UG9vbCA9IG5ldyBDb25zdGFudFBvb2woKTtcbiAgY29uc3QgaW1wb3J0TWFuYWdlciA9IG5ldyBJbXBvcnRNYW5hZ2VyKGltcG9ydFJld3JpdGVyKTtcblxuICAvLyBSZWN1cnNpdmVseSBzY2FuIHRocm91Z2ggdGhlIEFTVCBhbmQgcGVyZm9ybSBhbnkgdXBkYXRlcyByZXF1ZXN0ZWQgYnkgdGhlIEl2eUNvbXBpbGF0aW9uLlxuICBjb25zdCB2aXNpdG9yID0gbmV3IEl2eVZpc2l0b3IoXG4gICAgICBjb21waWxhdGlvbiwgcmVmbGVjdG9yLCBpbXBvcnRNYW5hZ2VyLCBkZWZhdWx0SW1wb3J0UmVjb3JkZXIsIGlzQ29yZSwgY29uc3RhbnRQb29sKTtcbiAgbGV0IHNmID0gdmlzaXQoZmlsZSwgdmlzaXRvciwgY29udGV4dCk7XG5cbiAgLy8gR2VuZXJhdGUgdGhlIGNvbnN0YW50IHN0YXRlbWVudHMgZmlyc3QsIGFzIHRoZXkgbWF5IGludm9sdmUgYWRkaW5nIGFkZGl0aW9uYWwgaW1wb3J0c1xuICAvLyB0byB0aGUgSW1wb3J0TWFuYWdlci5cbiAgY29uc3QgY29uc3RhbnRzID0gY29uc3RhbnRQb29sLnN0YXRlbWVudHMubWFwKFxuICAgICAgc3RtdCA9PlxuICAgICAgICAgIHRyYW5zbGF0ZVN0YXRlbWVudChzdG10LCBpbXBvcnRNYW5hZ2VyLCBkZWZhdWx0SW1wb3J0UmVjb3JkZXIsIHRzLlNjcmlwdFRhcmdldC5FUzIwMTUpKTtcblxuICAvLyBQcmVzZXJ2ZSBAZmlsZW92ZXJ2aWV3IGNvbW1lbnRzIHJlcXVpcmVkIGJ5IENsb3N1cmUsIHNpbmNlIHRoZSBsb2NhdGlvbiBtaWdodCBjaGFuZ2UgYXMgYVxuICAvLyByZXN1bHQgb2YgYWRkaW5nIGV4dHJhIGltcG9ydHMgYW5kIGNvbnN0YW50IHBvb2wgc3RhdGVtZW50cy5cbiAgY29uc3QgZmlsZU92ZXJ2aWV3TWV0YSA9IGlzQ2xvc3VyZUNvbXBpbGVyRW5hYmxlZCA/IGdldEZpbGVPdmVydmlld0NvbW1lbnQoc2Yuc3RhdGVtZW50cykgOiBudWxsO1xuXG4gIC8vIEFkZCBuZXcgaW1wb3J0cyBmb3IgdGhpcyBmaWxlLlxuICBzZiA9IGFkZEltcG9ydHMoaW1wb3J0TWFuYWdlciwgc2YsIGNvbnN0YW50cyk7XG5cbiAgaWYgKGZpbGVPdmVydmlld01ldGEgIT09IG51bGwpIHtcbiAgICBzZXRGaWxlT3ZlcnZpZXdDb21tZW50KHNmLCBmaWxlT3ZlcnZpZXdNZXRhKTtcbiAgfVxuXG4gIHJldHVybiBzZjtcbn1cblxuZnVuY3Rpb24gZ2V0RmlsZU92ZXJ2aWV3Q29tbWVudChzdGF0ZW1lbnRzOiB0cy5Ob2RlQXJyYXk8dHMuU3RhdGVtZW50Pik6IEZpbGVPdmVydmlld01ldGF8bnVsbCB7XG4gIGlmIChzdGF0ZW1lbnRzLmxlbmd0aCA+IDApIHtcbiAgICBjb25zdCBob3N0ID0gc3RhdGVtZW50c1swXTtcbiAgICBsZXQgdHJhaWxpbmcgPSBmYWxzZTtcbiAgICBsZXQgY29tbWVudHMgPSB0cy5nZXRTeW50aGV0aWNMZWFkaW5nQ29tbWVudHMoaG9zdCk7XG4gICAgLy8gSWYgQGZpbGVvdmVydmlldyB0YWcgaXMgbm90IGZvdW5kIGluIHNvdXJjZSBmaWxlLCB0c2lja2xlIHByb2R1Y2VzIGZha2Ugbm9kZSB3aXRoIHRyYWlsaW5nXG4gICAgLy8gY29tbWVudCBhbmQgaW5qZWN0IGl0IGF0IHRoZSB2ZXJ5IGJlZ2lubmluZyBvZiB0aGUgZ2VuZXJhdGVkIGZpbGUuIFNvIHdlIG5lZWQgdG8gY2hlY2sgZm9yXG4gICAgLy8gbGVhZGluZyBhcyB3ZWxsIGFzIHRyYWlsaW5nIGNvbW1lbnRzLlxuICAgIGlmICghY29tbWVudHMgfHwgY29tbWVudHMubGVuZ3RoID09PSAwKSB7XG4gICAgICB0cmFpbGluZyA9IHRydWU7XG4gICAgICBjb21tZW50cyA9IHRzLmdldFN5bnRoZXRpY1RyYWlsaW5nQ29tbWVudHMoaG9zdCk7XG4gICAgfVxuICAgIGlmIChjb21tZW50cyAmJiBjb21tZW50cy5sZW5ndGggPiAwICYmIENMT1NVUkVfRklMRV9PVkVSVklFV19SRUdFWFAudGVzdChjb21tZW50c1swXS50ZXh0KSkge1xuICAgICAgcmV0dXJuIHtjb21tZW50cywgaG9zdCwgdHJhaWxpbmd9O1xuICAgIH1cbiAgfVxuICByZXR1cm4gbnVsbDtcbn1cblxuZnVuY3Rpb24gc2V0RmlsZU92ZXJ2aWV3Q29tbWVudChzZjogdHMuU291cmNlRmlsZSwgZmlsZW92ZXJ2aWV3OiBGaWxlT3ZlcnZpZXdNZXRhKTogdm9pZCB7XG4gIGNvbnN0IHtjb21tZW50cywgaG9zdCwgdHJhaWxpbmd9ID0gZmlsZW92ZXJ2aWV3O1xuICAvLyBJZiBob3N0IHN0YXRlbWVudCBpcyBubyBsb25nZXIgdGhlIGZpcnN0IG9uZSwgaXQgbWVhbnMgdGhhdCBleHRyYSBzdGF0ZW1lbnRzIHdlcmUgYWRkZWQgYXQgdGhlXG4gIC8vIHZlcnkgYmVnaW5uaW5nLCBzbyB3ZSBuZWVkIHRvIHJlbG9jYXRlIEBmaWxlb3ZlcnZpZXcgY29tbWVudCBhbmQgY2xlYW51cCB0aGUgb3JpZ2luYWwgc3RhdGVtZW50XG4gIC8vIHRoYXQgaG9zdGVkIGl0LlxuICBpZiAoc2Yuc3RhdGVtZW50cy5sZW5ndGggPiAwICYmIGhvc3QgIT09IHNmLnN0YXRlbWVudHNbMF0pIHtcbiAgICBpZiAodHJhaWxpbmcpIHtcbiAgICAgIHRzLnNldFN5bnRoZXRpY1RyYWlsaW5nQ29tbWVudHMoaG9zdCwgdW5kZWZpbmVkKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdHMuc2V0U3ludGhldGljTGVhZGluZ0NvbW1lbnRzKGhvc3QsIHVuZGVmaW5lZCk7XG4gICAgfVxuICAgIHRzLnNldFN5bnRoZXRpY0xlYWRpbmdDb21tZW50cyhzZi5zdGF0ZW1lbnRzWzBdLCBjb21tZW50cyk7XG4gIH1cbn1cblxuZnVuY3Rpb24gbWF5YmVGaWx0ZXJEZWNvcmF0b3IoXG4gICAgZGVjb3JhdG9yczogdHMuTm9kZUFycmF5PHRzLkRlY29yYXRvcj58IHVuZGVmaW5lZCxcbiAgICB0b1JlbW92ZTogdHMuRGVjb3JhdG9yW10pOiB0cy5Ob2RlQXJyYXk8dHMuRGVjb3JhdG9yPnx1bmRlZmluZWQge1xuICBpZiAoZGVjb3JhdG9ycyA9PT0gdW5kZWZpbmVkKSB7XG4gICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgfVxuICBjb25zdCBmaWx0ZXJlZCA9IGRlY29yYXRvcnMuZmlsdGVyKFxuICAgICAgZGVjID0+IHRvUmVtb3ZlLmZpbmQoZGVjVG9SZW1vdmUgPT4gdHMuZ2V0T3JpZ2luYWxOb2RlKGRlYykgPT09IGRlY1RvUmVtb3ZlKSA9PT0gdW5kZWZpbmVkKTtcbiAgaWYgKGZpbHRlcmVkLmxlbmd0aCA9PT0gMCkge1xuICAgIHJldHVybiB1bmRlZmluZWQ7XG4gIH1cbiAgcmV0dXJuIHRzLmNyZWF0ZU5vZGVBcnJheShmaWx0ZXJlZCk7XG59XG5cbmZ1bmN0aW9uIGlzRnJvbUFuZ3VsYXJDb3JlKGRlY29yYXRvcjogRGVjb3JhdG9yKTogYm9vbGVhbiB7XG4gIHJldHVybiBkZWNvcmF0b3IuaW1wb3J0ICE9PSBudWxsICYmIGRlY29yYXRvci5pbXBvcnQuZnJvbSA9PT0gJ0Bhbmd1bGFyL2NvcmUnO1xufVxuIl19