(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/compiler-cli/ngcc/src/rendering/esm_rendering_formatter", ["require", "exports", "tslib", "typescript", "@angular/compiler-cli/src/ngtsc/file_system", "@angular/compiler-cli/src/ngtsc/imports", "@angular/compiler-cli/src/ngtsc/translator", "@angular/compiler-cli/src/ngtsc/util/src/typescript", "@angular/compiler-cli/ngcc/src/host/ngcc_host", "@angular/compiler-cli/ngcc/src/rendering/utils", "@angular/compiler-cli/ngcc/src/host/esm2015_host"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var tslib_1 = require("tslib");
    var ts = require("typescript");
    var file_system_1 = require("@angular/compiler-cli/src/ngtsc/file_system");
    var imports_1 = require("@angular/compiler-cli/src/ngtsc/imports");
    var translator_1 = require("@angular/compiler-cli/src/ngtsc/translator");
    var typescript_1 = require("@angular/compiler-cli/src/ngtsc/util/src/typescript");
    var ngcc_host_1 = require("@angular/compiler-cli/ngcc/src/host/ngcc_host");
    var utils_1 = require("@angular/compiler-cli/ngcc/src/rendering/utils");
    var esm2015_host_1 = require("@angular/compiler-cli/ngcc/src/host/esm2015_host");
    /**
     * A RenderingFormatter that works with ECMAScript Module import and export statements.
     */
    var EsmRenderingFormatter = /** @class */ (function () {
        function EsmRenderingFormatter(host, isCore) {
            this.host = host;
            this.isCore = isCore;
            this.printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed });
        }
        /**
         *  Add the imports at the top of the file, after any imports that are already there.
         */
        EsmRenderingFormatter.prototype.addImports = function (output, imports, sf) {
            if (imports.length === 0) {
                return;
            }
            var insertionPoint = this.findEndOfImports(sf);
            var renderedImports = imports.map(function (i) { return "import * as " + i.qualifier + " from '" + i.specifier + "';\n"; }).join('');
            output.appendLeft(insertionPoint, renderedImports);
        };
        /**
         * Add the exports to the end of the file.
         */
        EsmRenderingFormatter.prototype.addExports = function (output, entryPointBasePath, exports, importManager, file) {
            exports.forEach(function (e) {
                var exportFrom = '';
                var isDtsFile = typescript_1.isDtsPath(entryPointBasePath);
                var from = isDtsFile ? e.dtsFrom : e.from;
                if (from) {
                    var basePath = utils_1.stripExtension(from);
                    var relativePath = './' + file_system_1.relative(file_system_1.dirname(entryPointBasePath), basePath);
                    exportFrom = entryPointBasePath !== basePath ? " from '" + relativePath + "'" : '';
                }
                var exportStr = "\nexport {" + e.identifier + "}" + exportFrom + ";";
                output.append(exportStr);
            });
        };
        /**
         * Add plain exports to the end of the file.
         *
         * Unlike `addExports`, direct exports go directly in a .js and .d.ts file and don't get added to
         * an entrypoint.
         */
        EsmRenderingFormatter.prototype.addDirectExports = function (output, exports, importManager, file) {
            var e_1, _a;
            try {
                for (var exports_1 = tslib_1.__values(exports), exports_1_1 = exports_1.next(); !exports_1_1.done; exports_1_1 = exports_1.next()) {
                    var e = exports_1_1.value;
                    var exportStatement = "\nexport {" + e.symbolName + " as " + e.asAlias + "} from '" + e.fromModule + "';";
                    output.append(exportStatement);
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (exports_1_1 && !exports_1_1.done && (_a = exports_1.return)) _a.call(exports_1);
                }
                finally { if (e_1) throw e_1.error; }
            }
        };
        /**
         * Add the constants directly after the imports.
         */
        EsmRenderingFormatter.prototype.addConstants = function (output, constants, file) {
            if (constants === '') {
                return;
            }
            var insertionPoint = this.findEndOfImports(file);
            // Append the constants to the right of the insertion point, to ensure they get ordered after
            // added imports (those are appended left to the insertion point).
            output.appendRight(insertionPoint, '\n' + constants + '\n');
        };
        /**
         * Add the definitions directly after their decorated class.
         */
        EsmRenderingFormatter.prototype.addDefinitions = function (output, compiledClass, definitions) {
            var classSymbol = this.host.getClassSymbol(compiledClass.declaration);
            if (!classSymbol) {
                throw new Error("Compiled class does not have a valid symbol: " + compiledClass.name);
            }
            var declarationStatement = getDeclarationStatement(classSymbol.declaration.valueDeclaration);
            var insertionPoint = declarationStatement.getEnd();
            output.appendLeft(insertionPoint, '\n' + definitions);
        };
        /**
         * Add the adjacent statements after all static properties of the class.
         */
        EsmRenderingFormatter.prototype.addAdjacentStatements = function (output, compiledClass, statements) {
            var classSymbol = this.host.getClassSymbol(compiledClass.declaration);
            if (!classSymbol) {
                throw new Error("Compiled class does not have a valid symbol: " + compiledClass.name);
            }
            var endOfClass = this.host.getEndOfClass(classSymbol);
            output.appendLeft(endOfClass.getEnd(), '\n' + statements);
        };
        /**
         * Remove static decorator properties from classes.
         */
        EsmRenderingFormatter.prototype.removeDecorators = function (output, decoratorsToRemove) {
            decoratorsToRemove.forEach(function (nodesToRemove, containerNode) {
                if (ts.isArrayLiteralExpression(containerNode)) {
                    var items_1 = containerNode.elements;
                    if (items_1.length === nodesToRemove.length) {
                        // Remove the entire statement
                        var statement = findStatement(containerNode);
                        if (statement) {
                            if (ts.isExpressionStatement(statement)) {
                                // The statement looks like: `SomeClass = __decorate(...);`
                                // Remove it completely
                                output.remove(statement.getFullStart(), statement.getEnd());
                            }
                            else if (ts.isReturnStatement(statement) && statement.expression &&
                                esm2015_host_1.isAssignment(statement.expression)) {
                                // The statement looks like: `return SomeClass = __decorate(...);`
                                // We only want to end up with: `return SomeClass;`
                                var startOfRemoval = statement.expression.left.getEnd();
                                var endOfRemoval = getEndExceptSemicolon(statement);
                                output.remove(startOfRemoval, endOfRemoval);
                            }
                        }
                    }
                    else {
                        nodesToRemove.forEach(function (node) {
                            // remove any trailing comma
                            var nextSibling = getNextSiblingInArray(node, items_1);
                            var end;
                            if (nextSibling !== null &&
                                output.slice(nextSibling.getFullStart() - 1, nextSibling.getFullStart()) === ',') {
                                end = nextSibling.getFullStart() - 1 + nextSibling.getLeadingTriviaWidth();
                            }
                            else if (output.slice(node.getEnd(), node.getEnd() + 1) === ',') {
                                end = node.getEnd() + 1;
                            }
                            else {
                                end = node.getEnd();
                            }
                            output.remove(node.getFullStart(), end);
                        });
                    }
                }
            });
        };
        /**
         * Rewrite the the IVY switch markers to indicate we are in IVY mode.
         */
        EsmRenderingFormatter.prototype.rewriteSwitchableDeclarations = function (outputText, sourceFile, declarations) {
            declarations.forEach(function (declaration) {
                var start = declaration.initializer.getStart();
                var end = declaration.initializer.getEnd();
                var replacement = declaration.initializer.text.replace(ngcc_host_1.PRE_R3_MARKER, ngcc_host_1.POST_R3_MARKER);
                outputText.overwrite(start, end, replacement);
            });
        };
        /**
         * Add the type parameters to the appropriate functions that return `ModuleWithProviders`
         * structures.
         *
         * This function will only get called on typings files.
         */
        EsmRenderingFormatter.prototype.addModuleWithProvidersParams = function (outputText, moduleWithProviders, importManager) {
            var _this = this;
            moduleWithProviders.forEach(function (info) {
                var ngModuleName = info.ngModule.node.name.text;
                var declarationFile = file_system_1.absoluteFromSourceFile(info.declaration.getSourceFile());
                var ngModuleFile = file_system_1.absoluteFromSourceFile(info.ngModule.node.getSourceFile());
                var importPath = info.ngModule.viaModule ||
                    (declarationFile !== ngModuleFile ?
                        utils_1.stripExtension("./" + file_system_1.relative(file_system_1.dirname(declarationFile), ngModuleFile)) :
                        null);
                var ngModule = generateImportString(importManager, importPath, ngModuleName);
                if (info.declaration.type) {
                    var typeName = info.declaration.type && ts.isTypeReferenceNode(info.declaration.type) ?
                        info.declaration.type.typeName :
                        null;
                    if (_this.isCoreModuleWithProvidersType(typeName)) {
                        // The declaration already returns `ModuleWithProvider` but it needs the `NgModule` type
                        // parameter adding.
                        outputText.overwrite(info.declaration.type.getStart(), info.declaration.type.getEnd(), "ModuleWithProviders<" + ngModule + ">");
                    }
                    else {
                        // The declaration returns an unknown type so we need to convert it to a union that
                        // includes the ngModule property.
                        var originalTypeString = info.declaration.type.getText();
                        outputText.overwrite(info.declaration.type.getStart(), info.declaration.type.getEnd(), "(" + originalTypeString + ")&{ngModule:" + ngModule + "}");
                    }
                }
                else {
                    // The declaration has no return type so provide one.
                    var lastToken = info.declaration.getLastToken();
                    var insertPoint = lastToken && lastToken.kind === ts.SyntaxKind.SemicolonToken ?
                        lastToken.getStart() :
                        info.declaration.getEnd();
                    outputText.appendLeft(insertPoint, ": " + generateImportString(importManager, '@angular/core', 'ModuleWithProviders') + "<" + ngModule + ">");
                }
            });
        };
        /**
         * Convert a `Statement` to JavaScript code in a format suitable for rendering by this formatter.
         *
         * @param stmt The `Statement` to print.
         * @param sourceFile A `ts.SourceFile` that provides context for the statement. See
         *     `ts.Printer#printNode()` for more info.
         * @param importManager The `ImportManager` to use for managing imports.
         *
         * @return The JavaScript code corresponding to `stmt` (in the appropriate format).
         */
        EsmRenderingFormatter.prototype.printStatement = function (stmt, sourceFile, importManager) {
            var node = translator_1.translateStatement(stmt, importManager, imports_1.NOOP_DEFAULT_IMPORT_RECORDER, ts.ScriptTarget.ES2015);
            var code = this.printer.printNode(ts.EmitHint.Unspecified, node, sourceFile);
            return code;
        };
        EsmRenderingFormatter.prototype.findEndOfImports = function (sf) {
            var e_2, _a;
            try {
                for (var _b = tslib_1.__values(sf.statements), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var stmt = _c.value;
                    if (!ts.isImportDeclaration(stmt) && !ts.isImportEqualsDeclaration(stmt) &&
                        !ts.isNamespaceImport(stmt)) {
                        return stmt.getStart();
                    }
                }
            }
            catch (e_2_1) { e_2 = { error: e_2_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_2) throw e_2.error; }
            }
            return 0;
        };
        /**
         * Check whether the given type is the core Angular `ModuleWithProviders` interface.
         * @param typeName The type to check.
         * @returns true if the type is the core Angular `ModuleWithProviders` interface.
         */
        EsmRenderingFormatter.prototype.isCoreModuleWithProvidersType = function (typeName) {
            var id = typeName && ts.isIdentifier(typeName) ? this.host.getImportOfIdentifier(typeName) : null;
            return (id && id.name === 'ModuleWithProviders' && (this.isCore || id.from === '@angular/core'));
        };
        return EsmRenderingFormatter;
    }());
    exports.EsmRenderingFormatter = EsmRenderingFormatter;
    function getDeclarationStatement(node) {
        var statement = node;
        while (statement) {
            if (ts.isVariableStatement(statement) || ts.isClassDeclaration(statement)) {
                return statement;
            }
            statement = statement.parent;
        }
        throw new Error("Class is not defined in a declaration statement: " + node.getText());
    }
    function findStatement(node) {
        while (node) {
            if (ts.isExpressionStatement(node) || ts.isReturnStatement(node)) {
                return node;
            }
            node = node.parent;
        }
        return undefined;
    }
    function generateImportString(importManager, importPath, importName) {
        var importAs = importPath ? importManager.generateNamedImport(importPath, importName) : null;
        return importAs ? importAs.moduleImport + "." + importAs.symbol : "" + importName;
    }
    function getNextSiblingInArray(node, array) {
        var index = array.indexOf(node);
        return index !== -1 && array.length > index + 1 ? array[index + 1] : null;
    }
    function getEndExceptSemicolon(statement) {
        var lastToken = statement.getLastToken();
        return (lastToken && lastToken.kind === ts.SyntaxKind.SemicolonToken) ? statement.getEnd() - 1 :
            statement.getEnd();
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXNtX3JlbmRlcmluZ19mb3JtYXR0ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21waWxlci1jbGkvbmdjYy9zcmMvcmVuZGVyaW5nL2VzbV9yZW5kZXJpbmdfZm9ybWF0dGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztJQVNBLCtCQUFpQztJQUNqQywyRUFBeUc7SUFDekcsbUVBQWtGO0lBQ2xGLHlFQUF3RjtJQUN4RixrRkFBaUU7SUFFakUsMkVBQW1IO0lBSW5ILHdFQUF1QztJQUN2QyxpRkFBa0Q7SUFFbEQ7O09BRUc7SUFDSDtRQUdFLCtCQUFzQixJQUF3QixFQUFZLE1BQWU7WUFBbkQsU0FBSSxHQUFKLElBQUksQ0FBb0I7WUFBWSxXQUFNLEdBQU4sTUFBTSxDQUFTO1lBRi9ELFlBQU8sR0FBRyxFQUFFLENBQUMsYUFBYSxDQUFDLEVBQUMsT0FBTyxFQUFFLEVBQUUsQ0FBQyxXQUFXLENBQUMsUUFBUSxFQUFDLENBQUMsQ0FBQztRQUVHLENBQUM7UUFFN0U7O1dBRUc7UUFDSCwwQ0FBVSxHQUFWLFVBQVcsTUFBbUIsRUFBRSxPQUFpQixFQUFFLEVBQWlCO1lBQ2xFLElBQUksT0FBTyxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7Z0JBQ3hCLE9BQU87YUFDUjtZQUVELElBQU0sY0FBYyxHQUFHLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxFQUFFLENBQUMsQ0FBQztZQUNqRCxJQUFNLGVBQWUsR0FDakIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxVQUFBLENBQUMsSUFBSSxPQUFBLGlCQUFlLENBQUMsQ0FBQyxTQUFTLGVBQVUsQ0FBQyxDQUFDLFNBQVMsU0FBTSxFQUFyRCxDQUFxRCxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBQ3JGLE1BQU0sQ0FBQyxVQUFVLENBQUMsY0FBYyxFQUFFLGVBQWUsQ0FBQyxDQUFDO1FBQ3JELENBQUM7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QU0sQ0FBQztTQUNwQjtRQUNELE9BQU8sU0FBUyxDQUFDO0lBQ25CLENBQUM7SUFFRCxTQUFTLG9CQUFvQixDQUN6QixhQUE0QixFQUFFLFVBQXlCLEVBQUUsVUFBa0I7UUFDN0UsSUFBTSxRQUFRLEdBQUcsVUFBVSxDQUFDLENBQUMsQ0FBQyxhQUFhLENBQUMsbUJBQW1CLENBQUMsVUFBVSxFQUFFLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7UUFDL0YsT0FBTyxRQUFRLENBQUMsQ0FBQyxDQUFJLFFBQVEsQ0FBQyxZQUFZLFNBQUksUUFBUSxDQUFDLE1BQVEsQ0FBQyxDQUFDLENBQUMsS0FBRyxVQUFZLENBQUM7SUFDcEYsQ0FBQztJQUVELFNBQVMscUJBQXFCLENBQW9CLElBQU8sRUFBRSxLQUFzQjtRQUMvRSxJQUFNLEtBQUssR0FBRyxLQUFLLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ2xDLE9BQU8sS0FBSyxLQUFLLENBQUMsQ0FBQyxJQUFJLEtBQUssQ0FBQyxNQUFNLEdBQUcsS0FBSyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDO0lBQzVFLENBQUM7SUFFRCxTQUFTLHFCQUFxQixDQUFDLFNBQXVCO1FBQ3BELElBQU0sU0FBUyxHQUFHLFNBQVMsQ0FBQyxZQUFZLEVBQUUsQ0FBQztRQUMzQyxPQUFPLENBQUMsU0FBUyxJQUFJLFNBQVMsQ0FBQyxJQUFJLEtBQUssRUFBRSxDQUFDLFVBQVUsQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLE1BQU0sRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDO1lBQ3hCLFNBQVMsQ0FBQyxNQUFNLEVBQUUsQ0FBQztJQUM3RixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuaW1wb3J0IHtTdGF0ZW1lbnR9IGZyb20gJ0Bhbmd1bGFyL2NvbXBpbGVyJztcbmltcG9ydCBNYWdpY1N0cmluZyBmcm9tICdtYWdpYy1zdHJpbmcnO1xuaW1wb3J0ICogYXMgdHMgZnJvbSAndHlwZXNjcmlwdCc7XG5pbXBvcnQge3JlbGF0aXZlLCBkaXJuYW1lLCBBYnNvbHV0ZUZzUGF0aCwgYWJzb2x1dGVGcm9tU291cmNlRmlsZX0gZnJvbSAnLi4vLi4vLi4vc3JjL25ndHNjL2ZpbGVfc3lzdGVtJztcbmltcG9ydCB7Tk9PUF9ERUZBVUxUX0lNUE9SVF9SRUNPUkRFUiwgUmVleHBvcnR9IGZyb20gJy4uLy4uLy4uL3NyYy9uZ3RzYy9pbXBvcnRzJztcbmltcG9ydCB7SW1wb3J0LCBJbXBvcnRNYW5hZ2VyLCB0cmFuc2xhdGVTdGF0ZW1lbnR9IGZyb20gJy4uLy4uLy4uL3NyYy9uZ3RzYy90cmFuc2xhdG9yJztcbmltcG9ydCB7aXNEdHNQYXRofSBmcm9tICcuLi8uLi8uLi9zcmMvbmd0c2MvdXRpbC9zcmMvdHlwZXNjcmlwdCc7XG5pbXBvcnQge0NvbXBpbGVkQ2xhc3N9IGZyb20gJy4uL2FuYWx5c2lzL3R5cGVzJztcbmltcG9ydCB7TmdjY1JlZmxlY3Rpb25Ib3N0LCBQT1NUX1IzX01BUktFUiwgUFJFX1IzX01BUktFUiwgU3dpdGNoYWJsZVZhcmlhYmxlRGVjbGFyYXRpb259IGZyb20gJy4uL2hvc3QvbmdjY19ob3N0JztcbmltcG9ydCB7TW9kdWxlV2l0aFByb3ZpZGVyc0luZm99IGZyb20gJy4uL2FuYWx5c2lzL21vZHVsZV93aXRoX3Byb3ZpZGVyc19hbmFseXplcic7XG5pbXBvcnQge0V4cG9ydEluZm99IGZyb20gJy4uL2FuYWx5c2lzL3ByaXZhdGVfZGVjbGFyYXRpb25zX2FuYWx5emVyJztcbmltcG9ydCB7UmVuZGVyaW5nRm9ybWF0dGVyLCBSZWR1bmRhbnREZWNvcmF0b3JNYXB9IGZyb20gJy4vcmVuZGVyaW5nX2Zvcm1hdHRlcic7XG5pbXBvcnQge3N0cmlwRXh0ZW5zaW9ufSBmcm9tICcuL3V0aWxzJztcbmltcG9ydCB7aXNBc3NpZ25tZW50fSBmcm9tICcuLi9ob3N0L2VzbTIwMTVfaG9zdCc7XG5cbi8qKlxuICogQSBSZW5kZXJpbmdGb3JtYXR0ZXIgdGhhdCB3b3JrcyB3aXRoIEVDTUFTY3JpcHQgTW9kdWxlIGltcG9ydCBhbmQgZXhwb3J0IHN0YXRlbWVudHMuXG4gKi9cbmV4cG9ydCBjbGFzcyBFc21SZW5kZXJpbmdGb3JtYXR0ZXIgaW1wbGVtZW50cyBSZW5kZXJpbmdGb3JtYXR0ZXIge1xuICBwcm90ZWN0ZWQgcHJpbnRlciA9IHRzLmNyZWF0ZVByaW50ZXIoe25ld0xpbmU6IHRzLk5ld0xpbmVLaW5kLkxpbmVGZWVkfSk7XG5cbiAgY29uc3RydWN0b3IocHJvdGVjdGVkIGhvc3Q6IE5nY2NSZWZsZWN0aW9uSG9zdCwgcHJvdGVjdGVkIGlzQ29yZTogYm9vbGVhbikge31cblxuICAvKipcbiAgICogIEFkZCB0aGUgaW1wb3J0cyBhdCB0aGUgdG9wIG9mIHRoZSBmaWxlLCBhZnRlciBhbnkgaW1wb3J0cyB0aGF0IGFyZSBhbHJlYWR5IHRoZXJlLlxuICAgKi9cbiAgYWRkSW1wb3J0cyhvdXRwdXQ6IE1hZ2ljU3RyaW5nLCBpbXBvcnRzOiBJbXBvcnRbXSwgc2Y6IHRzLlNvdXJjZUZpbGUpOiB2b2lkIHtcbiAgICBpZiAoaW1wb3J0cy5sZW5ndGggPT09IDApIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBpbnNlcnRpb25Qb2ludCA9IHRoaXMuZmluZEVuZE9mSW1wb3J0cyhzZik7XG4gICAgY29uc3QgcmVuZGVyZWRJbXBvcnRzID1cbiAgICAgICAgaW1wb3J0cy5tYXAoaSA9PiBgaW1wb3J0ICogYXMgJHtpLnF1YWxpZmllcn0gZnJvbSAnJHtpLnNwZWNpZmllcn0nO1xcbmApLmpvaW4oJycpO1xuICAgIG91dHB1dC5hcHBlbmRMZWZ0KGluc2VydGlvblBvaW50LCByZW5kZXJlZEltcG9ydHMpO1xuICB9XG5cbiAgLyoqXG4gICAqIEFkZCB0aGUgZXhwb3J0cyB0byB0aGUgZW5kIG9mIHRoZSBmaWxlLlxuICAgKi9cbiAgYWRkRXhwb3J0cyhcbiAgICAgIG91dHB1dDogTWFnaWNTdHJpbmcsIGVudHJ5UG9pbnRCYXNlUGF0aDogQWJzb2x1dGVGc1BhdGgsIGV4cG9ydHM6IEV4cG9ydEluZm9bXSxcbiAgICAgIGltcG9ydE1hbmFnZXI6IEltcG9ydE1hbmFnZXIsIGZpbGU6IHRzLlNvdXJjZUZpbGUpOiB2b2lkIHtcbiAgICBleHBvcnRzLmZvckVhY2goZSA9PiB7XG4gICAgICBsZXQgZXhwb3J0RnJvbSA9ICcnO1xuICAgICAgY29uc3QgaXNEdHNGaWxlID0gaXNEdHNQYXRoKGVudHJ5UG9pbnRCYXNlUGF0aCk7XG4gICAgICBjb25zdCBmcm9tID0gaXNEdHNGaWxlID8gZS5kdHNGcm9tIDogZS5mcm9tO1xuXG4gICAgICBpZiAoZnJvbSkge1xuICAgICAgICBjb25zdCBiYXNlUGF0aCA9IHN0cmlwRXh0ZW5zaW9uKGZyb20pO1xuICAgICAgICBjb25zdCByZWxhdGl2ZVBhdGggPSAnLi8nICsgcmVsYXRpdmUoZGlybmFtZShlbnRyeVBvaW50QmFzZVBhdGgpLCBiYXNlUGF0aCk7XG4gICAgICAgIGV4cG9ydEZyb20gPSBlbnRyeVBvaW50QmFzZVBhdGggIT09IGJhc2VQYXRoID8gYCBmcm9tICcke3JlbGF0aXZlUGF0aH0nYCA6ICcnO1xuICAgICAgfVxuXG4gICAgICBjb25zdCBleHBvcnRTdHIgPSBgXFxuZXhwb3J0IHske2UuaWRlbnRpZmllcn19JHtleHBvcnRGcm9tfTtgO1xuICAgICAgb3V0cHV0LmFwcGVuZChleHBvcnRTdHIpO1xuICAgIH0pO1xuICB9XG5cblxuICAvKipcbiAgICogQWRkIHBsYWluIGV4cG9ydHMgdG8gdGhlIGVuZCBvZiB0aGUgZmlsZS5cbiAgICpcbiAgICogVW5saWtlIGBhZGRFeHBvcnRzYCwgZGlyZWN0IGV4cG9ydHMgZ28gZGlyZWN0bHkgaW4gYSAuanMgYW5kIC5kLnRzIGZpbGUgYW5kIGRvbid0IGdldCBhZGRlZCB0b1xuICAgKiBhbiBlbnRyeXBvaW50LlxuICAgKi9cbiAgYWRkRGlyZWN0RXhwb3J0cyhcbiAgICAgIG91dHB1dDogTWFnaWNTdHJpbmcsIGV4cG9ydHM6IFJlZXhwb3J0W10sIGltcG9ydE1hbmFnZXI6IEltcG9ydE1hbmFnZXIsXG4gICAgICBmaWxlOiB0cy5Tb3VyY2VGaWxlKTogdm9pZCB7XG4gICAgZm9yIChjb25zdCBlIG9mIGV4cG9ydHMpIHtcbiAgICAgIGNvbnN0IGV4cG9ydFN0YXRlbWVudCA9IGBcXG5leHBvcnQgeyR7ZS5zeW1ib2xOYW1lfSBhcyAke2UuYXNBbGlhc319IGZyb20gJyR7ZS5mcm9tTW9kdWxlfSc7YDtcbiAgICAgIG91dHB1dC5hcHBlbmQoZXhwb3J0U3RhdGVtZW50KTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQWRkIHRoZSBjb25zdGFudHMgZGlyZWN0bHkgYWZ0ZXIgdGhlIGltcG9ydHMuXG4gICAqL1xuICBhZGRDb25zdGFudHMob3V0cHV0OiBNYWdpY1N0cmluZywgY29uc3RhbnRzOiBzdHJpbmcsIGZpbGU6IHRzLlNvdXJjZUZpbGUpOiB2b2lkIHtcbiAgICBpZiAoY29uc3RhbnRzID09PSAnJykge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBjb25zdCBpbnNlcnRpb25Qb2ludCA9IHRoaXMuZmluZEVuZE9mSW1wb3J0cyhmaWxlKTtcblxuICAgIC8vIEFwcGVuZCB0aGUgY29uc3RhbnRzIHRvIHRoZSByaWdodCBvZiB0aGUgaW5zZXJ0aW9uIHBvaW50LCB0byBlbnN1cmUgdGhleSBnZXQgb3JkZXJlZCBhZnRlclxuICAgIC8vIGFkZGVkIGltcG9ydHMgKHRob3NlIGFyZSBhcHBlbmRlZCBsZWZ0IHRvIHRoZSBpbnNlcnRpb24gcG9pbnQpLlxuICAgIG91dHB1dC5hcHBlbmRSaWdodChpbnNlcnRpb25Qb2ludCwgJ1xcbicgKyBjb25zdGFudHMgKyAnXFxuJyk7XG4gIH1cblxuICAvKipcbiAgICogQWRkIHRoZSBkZWZpbml0aW9ucyBkaXJlY3RseSBhZnRlciB0aGVpciBkZWNvcmF0ZWQgY2xhc3MuXG4gICAqL1xuICBhZGREZWZpbml0aW9ucyhvdXRwdXQ6IE1hZ2ljU3RyaW5nLCBjb21waWxlZENsYXNzOiBDb21waWxlZENsYXNzLCBkZWZpbml0aW9uczogc3RyaW5nKTogdm9pZCB7XG4gICAgY29uc3QgY2xhc3NTeW1ib2wgPSB0aGlzLmhvc3QuZ2V0Q2xhc3NTeW1ib2woY29tcGlsZWRDbGFzcy5kZWNsYXJhdGlvbik7XG4gICAgaWYgKCFjbGFzc1N5bWJvbCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBDb21waWxlZCBjbGFzcyBkb2VzIG5vdCBoYXZlIGEgdmFsaWQgc3ltYm9sOiAke2NvbXBpbGVkQ2xhc3MubmFtZX1gKTtcbiAgICB9XG4gICAgY29uc3QgZGVjbGFyYXRpb25TdGF0ZW1lbnQgPSBnZXREZWNsYXJhdGlvblN0YXRlbWVudChjbGFzc1N5bWJvbC5kZWNsYXJhdGlvbi52YWx1ZURlY2xhcmF0aW9uKTtcbiAgICBjb25zdCBpbnNlcnRpb25Qb2ludCA9IGRlY2xhcmF0aW9uU3RhdGVtZW50LmdldEVuZCgpO1xuICAgIG91dHB1dC5hcHBlbmRMZWZ0KGluc2VydGlvblBvaW50LCAnXFxuJyArIGRlZmluaXRpb25zKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBZGQgdGhlIGFkamFjZW50IHN0YXRlbWVudHMgYWZ0ZXIgYWxsIHN0YXRpYyBwcm9wZXJ0aWVzIG9mIHRoZSBjbGFzcy5cbiAgICovXG4gIGFkZEFkamFjZW50U3RhdGVtZW50cyhvdXRwdXQ6IE1hZ2ljU3RyaW5nLCBjb21waWxlZENsYXNzOiBDb21waWxlZENsYXNzLCBzdGF0ZW1lbnRzOiBzdHJpbmcpOlxuICAgICAgdm9pZCB7XG4gICAgY29uc3QgY2xhc3NTeW1ib2wgPSB0aGlzLmhvc3QuZ2V0Q2xhc3NTeW1ib2woY29tcGlsZWRDbGFzcy5kZWNsYXJhdGlvbik7XG4gICAgaWYgKCFjbGFzc1N5bWJvbCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBDb21waWxlZCBjbGFzcyBkb2VzIG5vdCBoYXZlIGEgdmFsaWQgc3ltYm9sOiAke2NvbXBpbGVkQ2xhc3MubmFtZX1gKTtcbiAgICB9XG4gICAgY29uc3QgZW5kT2ZDbGFzcyA9IHRoaXMuaG9zdC5nZXRFbmRPZkNsYXNzKGNsYXNzU3ltYm9sKTtcbiAgICBvdXRwdXQuYXBwZW5kTGVmdChlbmRPZkNsYXNzLmdldEVuZCgpLCAnXFxuJyArIHN0YXRlbWVudHMpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlbW92ZSBzdGF0aWMgZGVjb3JhdG9yIHByb3BlcnRpZXMgZnJvbSBjbGFzc2VzLlxuICAgKi9cbiAgcmVtb3ZlRGVjb3JhdG9ycyhvdXRwdXQ6IE1hZ2ljU3RyaW5nLCBkZWNvcmF0b3JzVG9SZW1vdmU6IFJlZHVuZGFudERlY29yYXRvck1hcCk6IHZvaWQge1xuICAgIGRlY29yYXRvcnNUb1JlbW92ZS5mb3JFYWNoKChub2Rlc1RvUmVtb3ZlLCBjb250YWluZXJOb2RlKSA9PiB7XG4gICAgICBpZiAodHMuaXNBcnJheUxpdGVyYWxFeHByZXNzaW9uKGNvbnRhaW5lck5vZGUpKSB7XG4gICAgICAgIGNvbnN0IGl0ZW1zID0gY29udGFpbmVyTm9kZS5lbGVtZW50cztcbiAgICAgICAgaWYgKGl0ZW1zLmxlbmd0aCA9PT0gbm9kZXNUb1JlbW92ZS5sZW5ndGgpIHtcbiAgICAgICAgICAvLyBSZW1vdmUgdGhlIGVudGlyZSBzdGF0ZW1lbnRcbiAgICAgICAgICBjb25zdCBzdGF0ZW1lbnQgPSBmaW5kU3RhdGVtZW50KGNvbnRhaW5lck5vZGUpO1xuICAgICAgICAgIGlmIChzdGF0ZW1lbnQpIHtcbiAgICAgICAgICAgIGlmICh0cy5pc0V4cHJlc3Npb25TdGF0ZW1lbnQoc3RhdGVtZW50KSkge1xuICAgICAgICAgICAgICAvLyBUaGUgc3RhdGVtZW50IGxvb2tzIGxpa2U6IGBTb21lQ2xhc3MgPSBfX2RlY29yYXRlKC4uLik7YFxuICAgICAgICAgICAgICAvLyBSZW1vdmUgaXQgY29tcGxldGVseVxuICAgICAgICAgICAgICBvdXRwdXQucmVtb3ZlKHN0YXRlbWVudC5nZXRGdWxsU3RhcnQoKSwgc3RhdGVtZW50LmdldEVuZCgpKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoXG4gICAgICAgICAgICAgICAgdHMuaXNSZXR1cm5TdGF0ZW1lbnQoc3RhdGVtZW50KSAmJiBzdGF0ZW1lbnQuZXhwcmVzc2lvbiAmJlxuICAgICAgICAgICAgICAgIGlzQXNzaWdubWVudChzdGF0ZW1lbnQuZXhwcmVzc2lvbikpIHtcbiAgICAgICAgICAgICAgLy8gVGhlIHN0YXRlbWVudCBsb29rcyBsaWtlOiBgcmV0dXJuIFNvbWVDbGFzcyA9IF9fZGVjb3JhdGUoLi4uKTtgXG4gICAgICAgICAgICAgIC8vIFdlIG9ubHkgd2FudCB0byBlbmQgdXAgd2l0aDogYHJldHVybiBTb21lQ2xhc3M7YFxuICAgICAgICAgICAgICBjb25zdCBzdGFydE9mUmVtb3ZhbCA9IHN0YXRlbWVudC5leHByZXNzaW9uLmxlZnQuZ2V0RW5kKCk7XG4gICAgICAgICAgICAgIGNvbnN0IGVuZE9mUmVtb3ZhbCA9IGdldEVuZEV4Y2VwdFNlbWljb2xvbihzdGF0ZW1lbnQpO1xuICAgICAgICAgICAgICBvdXRwdXQucmVtb3ZlKHN0YXJ0T2ZSZW1vdmFsLCBlbmRPZlJlbW92YWwpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBub2Rlc1RvUmVtb3ZlLmZvckVhY2gobm9kZSA9PiB7XG4gICAgICAgICAgICAvLyByZW1vdmUgYW55IHRyYWlsaW5nIGNvbW1hXG4gICAgICAgICAgICBjb25zdCBuZXh0U2libGluZyA9IGdldE5leHRTaWJsaW5nSW5BcnJheShub2RlLCBpdGVtcyk7XG4gICAgICAgICAgICBsZXQgZW5kOiBudW1iZXI7XG5cbiAgICAgICAgICAgIGlmIChuZXh0U2libGluZyAhPT0gbnVsbCAmJlxuICAgICAgICAgICAgICAgIG91dHB1dC5zbGljZShuZXh0U2libGluZy5nZXRGdWxsU3RhcnQoKSAtIDEsIG5leHRTaWJsaW5nLmdldEZ1bGxTdGFydCgpKSA9PT0gJywnKSB7XG4gICAgICAgICAgICAgIGVuZCA9IG5leHRTaWJsaW5nLmdldEZ1bGxTdGFydCgpIC0gMSArIG5leHRTaWJsaW5nLmdldExlYWRpbmdUcml2aWFXaWR0aCgpO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChvdXRwdXQuc2xpY2Uobm9kZS5nZXRFbmQoKSwgbm9kZS5nZXRFbmQoKSArIDEpID09PSAnLCcpIHtcbiAgICAgICAgICAgICAgZW5kID0gbm9kZS5nZXRFbmQoKSArIDE7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICBlbmQgPSBub2RlLmdldEVuZCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgb3V0cHV0LnJlbW92ZShub2RlLmdldEZ1bGxTdGFydCgpLCBlbmQpO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogUmV3cml0ZSB0aGUgdGhlIElWWSBzd2l0Y2ggbWFya2VycyB0byBpbmRpY2F0ZSB3ZSBhcmUgaW4gSVZZIG1vZGUuXG4gICAqL1xuICByZXdyaXRlU3dpdGNoYWJsZURlY2xhcmF0aW9ucyhcbiAgICAgIG91dHB1dFRleHQ6IE1hZ2ljU3RyaW5nLCBzb3VyY2VGaWxlOiB0cy5Tb3VyY2VGaWxlLFxuICAgICAgZGVjbGFyYXRpb25zOiBTd2l0Y2hhYmxlVmFyaWFibGVEZWNsYXJhdGlvbltdKTogdm9pZCB7XG4gICAgZGVjbGFyYXRpb25zLmZvckVhY2goZGVjbGFyYXRpb24gPT4ge1xuICAgICAgY29uc3Qgc3RhcnQgPSBkZWNsYXJhdGlvbi5pbml0aWFsaXplci5nZXRTdGFydCgpO1xuICAgICAgY29uc3QgZW5kID0gZGVjbGFyYXRpb24uaW5pdGlhbGl6ZXIuZ2V0RW5kKCk7XG4gICAgICBjb25zdCByZXBsYWNlbWVudCA9IGRlY2xhcmF0aW9uLmluaXRpYWxpemVyLnRleHQucmVwbGFjZShQUkVfUjNfTUFSS0VSLCBQT1NUX1IzX01BUktFUik7XG4gICAgICBvdXRwdXRUZXh0Lm92ZXJ3cml0ZShzdGFydCwgZW5kLCByZXBsYWNlbWVudCk7XG4gICAgfSk7XG4gIH1cblxuXG4gIC8qKlxuICAgKiBBZGQgdGhlIHR5cGUgcGFyYW1ldGVycyB0byB0aGUgYXBwcm9wcmlhdGUgZnVuY3Rpb25zIHRoYXQgcmV0dXJuIGBNb2R1bGVXaXRoUHJvdmlkZXJzYFxuICAgKiBzdHJ1Y3R1cmVzLlxuICAgKlxuICAgKiBUaGlzIGZ1bmN0aW9uIHdpbGwgb25seSBnZXQgY2FsbGVkIG9uIHR5cGluZ3MgZmlsZXMuXG4gICAqL1xuICBhZGRNb2R1bGVXaXRoUHJvdmlkZXJzUGFyYW1zKFxuICAgICAgb3V0cHV0VGV4dDogTWFnaWNTdHJpbmcsIG1vZHVsZVdpdGhQcm92aWRlcnM6IE1vZHVsZVdpdGhQcm92aWRlcnNJbmZvW10sXG4gICAgICBpbXBvcnRNYW5hZ2VyOiBJbXBvcnRNYW5hZ2VyKTogdm9pZCB7XG4gICAgbW9kdWxlV2l0aFByb3ZpZGVycy5mb3JFYWNoKGluZm8gPT4ge1xuICAgICAgY29uc3QgbmdNb2R1bGVOYW1lID0gaW5mby5uZ01vZHVsZS5ub2RlLm5hbWUudGV4dDtcbiAgICAgIGNvbnN0IGRlY2xhcmF0aW9uRmlsZSA9IGFic29sdXRlRnJvbVNvdXJjZUZpbGUoaW5mby5kZWNsYXJhdGlvbi5nZXRTb3VyY2VGaWxlKCkpO1xuICAgICAgY29uc3QgbmdNb2R1bGVGaWxlID0gYWJzb2x1dGVGcm9tU291cmNlRmlsZShpbmZvLm5nTW9kdWxlLm5vZGUuZ2V0U291cmNlRmlsZSgpKTtcbiAgICAgIGNvbnN0IGltcG9ydFBhdGggPSBpbmZvLm5nTW9kdWxlLnZpYU1vZHVsZSB8fFxuICAgICAgICAgIChkZWNsYXJhdGlvbkZpbGUgIT09IG5nTW9kdWxlRmlsZSA/XG4gICAgICAgICAgICAgICBzdHJpcEV4dGVuc2lvbihgLi8ke3JlbGF0aXZlKGRpcm5hbWUoZGVjbGFyYXRpb25GaWxlKSwgbmdNb2R1bGVGaWxlKX1gKSA6XG4gICAgICAgICAgICAgICBudWxsKTtcbiAgICAgIGNvbnN0IG5nTW9kdWxlID0gZ2VuZXJhdGVJbXBvcnRTdHJpbmcoaW1wb3J0TWFuYWdlciwgaW1wb3J0UGF0aCwgbmdNb2R1bGVOYW1lKTtcblxuICAgICAgaWYgKGluZm8uZGVjbGFyYXRpb24udHlwZSkge1xuICAgICAgICBjb25zdCB0eXBlTmFtZSA9IGluZm8uZGVjbGFyYXRpb24udHlwZSAmJiB0cy5pc1R5cGVSZWZlcmVuY2VOb2RlKGluZm8uZGVjbGFyYXRpb24udHlwZSkgP1xuICAgICAgICAgICAgaW5mby5kZWNsYXJhdGlvbi50eXBlLnR5cGVOYW1lIDpcbiAgICAgICAgICAgIG51bGw7XG4gICAgICAgIGlmICh0aGlzLmlzQ29yZU1vZHVsZVdpdGhQcm92aWRlcnNUeXBlKHR5cGVOYW1lKSkge1xuICAgICAgICAgIC8vIFRoZSBkZWNsYXJhdGlvbiBhbHJlYWR5IHJldHVybnMgYE1vZHVsZVdpdGhQcm92aWRlcmAgYnV0IGl0IG5lZWRzIHRoZSBgTmdNb2R1bGVgIHR5cGVcbiAgICAgICAgICAvLyBwYXJhbWV0ZXIgYWRkaW5nLlxuICAgICAgICAgIG91dHB1dFRleHQub3ZlcndyaXRlKFxuICAgICAgICAgICAgICBpbmZvLmRlY2xhcmF0aW9uLnR5cGUuZ2V0U3RhcnQoKSwgaW5mby5kZWNsYXJhdGlvbi50eXBlLmdldEVuZCgpLFxuICAgICAgICAgICAgICBgTW9kdWxlV2l0aFByb3ZpZGVyczwke25nTW9kdWxlfT5gKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAvLyBUaGUgZGVjbGFyYXRpb24gcmV0dXJucyBhbiB1bmtub3duIHR5cGUgc28gd2UgbmVlZCB0byBjb252ZXJ0IGl0IHRvIGEgdW5pb24gdGhhdFxuICAgICAgICAgIC8vIGluY2x1ZGVzIHRoZSBuZ01vZHVsZSBwcm9wZXJ0eS5cbiAgICAgICAgICBjb25zdCBvcmlnaW5hbFR5cGVTdHJpbmcgPSBpbmZvLmRlY2xhcmF0aW9uLnR5cGUuZ2V0VGV4dCgpO1xuICAgICAgICAgIG91dHB1dFRleHQub3ZlcndyaXRlKFxuICAgICAgICAgICAgICBpbmZvLmRlY2xhcmF0aW9uLnR5cGUuZ2V0U3RhcnQoKSwgaW5mby5kZWNsYXJhdGlvbi50eXBlLmdldEVuZCgpLFxuICAgICAgICAgICAgICBgKCR7b3JpZ2luYWxUeXBlU3RyaW5nfSkme25nTW9kdWxlOiR7bmdNb2R1bGV9fWApO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBUaGUgZGVjbGFyYXRpb24gaGFzIG5vIHJldHVybiB0eXBlIHNvIHByb3ZpZGUgb25lLlxuICAgICAgICBjb25zdCBsYXN0VG9rZW4gPSBpbmZvLmRlY2xhcmF0aW9uLmdldExhc3RUb2tlbigpO1xuICAgICAgICBjb25zdCBpbnNlcnRQb2ludCA9IGxhc3RUb2tlbiAmJiBsYXN0VG9rZW4ua2luZCA9PT0gdHMuU3ludGF4S2luZC5TZW1pY29sb25Ub2tlbiA/XG4gICAgICAgICAgICBsYXN0VG9rZW4uZ2V0U3RhcnQoKSA6XG4gICAgICAgICAgICBpbmZvLmRlY2xhcmF0aW9uLmdldEVuZCgpO1xuICAgICAgICBvdXRwdXRUZXh0LmFwcGVuZExlZnQoXG4gICAgICAgICAgICBpbnNlcnRQb2ludCxcbiAgICAgICAgICAgIGA6ICR7Z2VuZXJhdGVJbXBvcnRTdHJpbmcoaW1wb3J0TWFuYWdlciwgJ0Bhbmd1bGFyL2NvcmUnLCAnTW9kdWxlV2l0aFByb3ZpZGVycycpfTwke25nTW9kdWxlfT5gKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDb252ZXJ0IGEgYFN0YXRlbWVudGAgdG8gSmF2YVNjcmlwdCBjb2RlIGluIGEgZm9ybWF0IHN1aXRhYmxlIGZvciByZW5kZXJpbmcgYnkgdGhpcyBmb3JtYXR0ZXIuXG4gICAqXG4gICAqIEBwYXJhbSBzdG10IFRoZSBgU3RhdGVtZW50YCB0byBwcmludC5cbiAgICogQHBhcmFtIHNvdXJjZUZpbGUgQSBgdHMuU291cmNlRmlsZWAgdGhhdCBwcm92aWRlcyBjb250ZXh0IGZvciB0aGUgc3RhdGVtZW50LiBTZWVcbiAgICogICAgIGB0cy5QcmludGVyI3ByaW50Tm9kZSgpYCBmb3IgbW9yZSBpbmZvLlxuICAgKiBAcGFyYW0gaW1wb3J0TWFuYWdlciBUaGUgYEltcG9ydE1hbmFnZXJgIHRvIHVzZSBmb3IgbWFuYWdpbmcgaW1wb3J0cy5cbiAgICpcbiAgICogQHJldHVybiBUaGUgSmF2YVNjcmlwdCBjb2RlIGNvcnJlc3BvbmRpbmcgdG8gYHN0bXRgIChpbiB0aGUgYXBwcm9wcmlhdGUgZm9ybWF0KS5cbiAgICovXG4gIHByaW50U3RhdGVtZW50KHN0bXQ6IFN0YXRlbWVudCwgc291cmNlRmlsZTogdHMuU291cmNlRmlsZSwgaW1wb3J0TWFuYWdlcjogSW1wb3J0TWFuYWdlcik6IHN0cmluZyB7XG4gICAgY29uc3Qgbm9kZSA9IHRyYW5zbGF0ZVN0YXRlbWVudChcbiAgICAgICAgc3RtdCwgaW1wb3J0TWFuYWdlciwgTk9PUF9ERUZBVUxUX0lNUE9SVF9SRUNPUkRFUiwgdHMuU2NyaXB0VGFyZ2V0LkVTMjAxNSk7XG4gICAgY29uc3QgY29kZSA9IHRoaXMucHJpbnRlci5wcmludE5vZGUodHMuRW1pdEhpbnQuVW5zcGVjaWZpZWQsIG5vZGUsIHNvdXJjZUZpbGUpO1xuXG4gICAgcmV0dXJuIGNvZGU7XG4gIH1cblxuICBwcm90ZWN0ZWQgZmluZEVuZE9mSW1wb3J0cyhzZjogdHMuU291cmNlRmlsZSk6IG51bWJlciB7XG4gICAgZm9yIChjb25zdCBzdG10IG9mIHNmLnN0YXRlbWVudHMpIHtcbiAgICAgIGlmICghdHMuaXNJbXBvcnREZWNsYXJhdGlvbihzdG10KSAmJiAhdHMuaXNJbXBvcnRFcXVhbHNEZWNsYXJhdGlvbihzdG10KSAmJlxuICAgICAgICAgICF0cy5pc05hbWVzcGFjZUltcG9ydChzdG10KSkge1xuICAgICAgICByZXR1cm4gc3RtdC5nZXRTdGFydCgpO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gMDtcbiAgfVxuXG5cblxuICAvKipcbiAgICogQ2hlY2sgd2hldGhlciB0aGUgZ2l2ZW4gdHlwZSBpcyB0aGUgY29yZSBBbmd1bGFyIGBNb2R1bGVXaXRoUHJvdmlkZXJzYCBpbnRlcmZhY2UuXG4gICAqIEBwYXJhbSB0eXBlTmFtZSBUaGUgdHlwZSB0byBjaGVjay5cbiAgICogQHJldHVybnMgdHJ1ZSBpZiB0aGUgdHlwZSBpcyB0aGUgY29yZSBBbmd1bGFyIGBNb2R1bGVXaXRoUHJvdmlkZXJzYCBpbnRlcmZhY2UuXG4gICAqL1xuICBwcml2YXRlIGlzQ29yZU1vZHVsZVdpdGhQcm92aWRlcnNUeXBlKHR5cGVOYW1lOiB0cy5FbnRpdHlOYW1lfG51bGwpIHtcbiAgICBjb25zdCBpZCA9XG4gICAgICAgIHR5cGVOYW1lICYmIHRzLmlzSWRlbnRpZmllcih0eXBlTmFtZSkgPyB0aGlzLmhvc3QuZ2V0SW1wb3J0T2ZJZGVudGlmaWVyKHR5cGVOYW1lKSA6IG51bGw7XG4gICAgcmV0dXJuIChcbiAgICAgICAgaWQgJiYgaWQubmFtZSA9PT0gJ01vZHVsZVdpdGhQcm92aWRlcnMnICYmICh0aGlzLmlzQ29yZSB8fCBpZC5mcm9tID09PSAnQGFuZ3VsYXIvY29yZScpKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBnZXREZWNsYXJhdGlvblN0YXRlbWVudChub2RlOiB0cy5Ob2RlKTogdHMuU3RhdGVtZW50IHtcbiAgbGV0IHN0YXRlbWVudCA9IG5vZGU7XG4gIHdoaWxlIChzdGF0ZW1lbnQpIHtcbiAgICBpZiAodHMuaXNWYXJpYWJsZVN0YXRlbWVudChzdGF0ZW1lbnQpIHx8IHRzLmlzQ2xhc3NEZWNsYXJhdGlvbihzdGF0ZW1lbnQpKSB7XG4gICAgICByZXR1cm4gc3RhdGVtZW50O1xuICAgIH1cbiAgICBzdGF0ZW1lbnQgPSBzdGF0ZW1lbnQucGFyZW50O1xuICB9XG4gIHRocm93IG5ldyBFcnJvcihgQ2xhc3MgaXMgbm90IGRlZmluZWQgaW4gYSBkZWNsYXJhdGlvbiBzdGF0ZW1lbnQ6ICR7bm9kZS5nZXRUZXh0KCl9YCk7XG59XG5cbmZ1bmN0aW9uIGZpbmRTdGF0ZW1lbnQobm9kZTogdHMuTm9kZSk6IHRzLlN0YXRlbWVudHx1bmRlZmluZWQge1xuICB3aGlsZSAobm9kZSkge1xuICAgIGlmICh0cy5pc0V4cHJlc3Npb25TdGF0ZW1lbnQobm9kZSkgfHwgdHMuaXNSZXR1cm5TdGF0ZW1lbnQobm9kZSkpIHtcbiAgICAgIHJldHVybiBub2RlO1xuICAgIH1cbiAgICBub2RlID0gbm9kZS5wYXJlbnQ7XG4gIH1cbiAgcmV0dXJuIHVuZGVmaW5lZDtcbn1cblxuZnVuY3Rpb24gZ2VuZXJhdGVJbXBvcnRTdHJpbmcoXG4gICAgaW1wb3J0TWFuYWdlcjogSW1wb3J0TWFuYWdlciwgaW1wb3J0UGF0aDogc3RyaW5nIHwgbnVsbCwgaW1wb3J0TmFtZTogc3RyaW5nKSB7XG4gIGNvbnN0IGltcG9ydEFzID0gaW1wb3J0UGF0aCA/IGltcG9ydE1hbmFnZXIuZ2VuZXJhdGVOYW1lZEltcG9ydChpbXBvcnRQYXRoLCBpbXBvcnROYW1lKSA6IG51bGw7XG4gIHJldHVybiBpbXBvcnRBcyA/IGAke2ltcG9ydEFzLm1vZHVsZUltcG9ydH0uJHtpbXBvcnRBcy5zeW1ib2x9YCA6IGAke2ltcG9ydE5hbWV9YDtcbn1cblxuZnVuY3Rpb24gZ2V0TmV4dFNpYmxpbmdJbkFycmF5PFQgZXh0ZW5kcyB0cy5Ob2RlPihub2RlOiBULCBhcnJheTogdHMuTm9kZUFycmF5PFQ+KTogVHxudWxsIHtcbiAgY29uc3QgaW5kZXggPSBhcnJheS5pbmRleE9mKG5vZGUpO1xuICByZXR1cm4gaW5kZXggIT09IC0xICYmIGFycmF5Lmxlbmd0aCA+IGluZGV4ICsgMSA/IGFycmF5W2luZGV4ICsgMV0gOiBudWxsO1xufVxuXG5mdW5jdGlvbiBnZXRFbmRFeGNlcHRTZW1pY29sb24oc3RhdGVtZW50OiB0cy5TdGF0ZW1lbnQpOiBudW1iZXIge1xuICBjb25zdCBsYXN0VG9rZW4gPSBzdGF0ZW1lbnQuZ2V0TGFzdFRva2VuKCk7XG4gIHJldHVybiAobGFzdFRva2VuICYmIGxhc3RUb2tlbi5raW5kID09PSB0cy5TeW50YXhLaW5kLlNlbWljb2xvblRva2VuKSA/IHN0YXRlbWVudC5nZXRFbmQoKSAtIDEgOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdGF0ZW1lbnQuZ2V0RW5kKCk7XG59XG4iXX0=