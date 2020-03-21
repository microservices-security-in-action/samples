(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/compiler-cli/src/ngtsc/shims/src/factory_generator", ["require", "exports", "tslib", "typescript", "@angular/compiler-cli/src/ngtsc/file_system", "@angular/compiler-cli/src/ngtsc/util/src/typescript", "@angular/compiler-cli/src/ngtsc/shims/src/util"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var tslib_1 = require("tslib");
    /**
     * @license
     * Copyright Google Inc. All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */
    var ts = require("typescript");
    var file_system_1 = require("@angular/compiler-cli/src/ngtsc/file_system");
    var typescript_1 = require("@angular/compiler-cli/src/ngtsc/util/src/typescript");
    var util_1 = require("@angular/compiler-cli/src/ngtsc/shims/src/util");
    var TS_DTS_SUFFIX = /(\.d)?\.ts$/;
    var STRIP_NG_FACTORY = /(.*)NgFactory$/;
    /**
     * Generates ts.SourceFiles which contain variable declarations for NgFactories for every exported
     * class of an input ts.SourceFile.
     */
    var FactoryGenerator = /** @class */ (function () {
        function FactoryGenerator(map) {
            this.map = map;
        }
        Object.defineProperty(FactoryGenerator.prototype, "factoryFileMap", {
            get: function () { return this.map; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(FactoryGenerator.prototype, "factoryFileNames", {
            get: function () { return Array.from(this.map.keys()); },
            enumerable: true,
            configurable: true
        });
        FactoryGenerator.prototype.recognize = function (fileName) { return this.map.has(fileName); };
        FactoryGenerator.prototype.generate = function (genFilePath, readFile) {
            var originalPath = this.map.get(genFilePath);
            var original = readFile(originalPath);
            if (original === null) {
                return null;
            }
            var relativePathToSource = './' + file_system_1.basename(original.fileName).replace(TS_DTS_SUFFIX, '');
            // Collect a list of classes that need to have factory types emitted for them. This list is
            // overly broad as at this point the ts.TypeChecker hasn't been created, and can't be used to
            // semantically understand which decorated types are actually decorated with Angular decorators.
            //
            // The exports generated here are pruned in the factory transform during emit.
            var symbolNames = original
                .statements
                // Pick out top level class declarations...
                .filter(ts.isClassDeclaration)
                // which are named, exported, and have decorators.
                .filter(function (decl) { return isExported(decl) && decl.decorators !== undefined &&
                decl.name !== undefined; })
                // Grab the symbol name.
                .map(function (decl) { return decl.name.text; });
            // If there is a top-level comment in the original file, copy it over at the top of the
            // generated factory file. This is important for preserving any load-bearing jsdoc comments.
            var comment = '';
            if (original.statements.length > 0) {
                var firstStatement = original.statements[0];
                // Must pass SourceFile to getLeadingTriviaWidth() and getFullText(), otherwise it'll try to
                // get SourceFile by recursively looking up the parent of the Node and fail,
                // because parent is undefined.
                var leadingTriviaWidth = firstStatement.getLeadingTriviaWidth(original);
                if (leadingTriviaWidth > 0) {
                    comment = firstStatement.getFullText(original).substr(0, leadingTriviaWidth);
                }
            }
            var sourceText = comment;
            if (symbolNames.length > 0) {
                // For each symbol name, generate a constant export of the corresponding NgFactory.
                // This will encompass a lot of symbols which don't need factories, but that's okay
                // because it won't miss any that do.
                var varLines = symbolNames.map(function (name) {
                    return "export const " + name + "NgFactory: i0.\u0275NgModuleFactory<any> = new i0.\u0275NgModuleFactory(" + name + ");";
                });
                sourceText += tslib_1.__spread([
                    // This might be incorrect if the current package being compiled is Angular core, but it's
                    // okay to leave in at type checking time. TypeScript can handle this reference via its path
                    // mapping, but downstream bundlers can't. If the current package is core itself, this will
                    // be replaced in the factory transformer before emit.
                    "import * as i0 from '@angular/core';",
                    "import {" + symbolNames.join(', ') + "} from '" + relativePathToSource + "';"
                ], varLines).join('\n');
            }
            // Add an extra export to ensure this module has at least one. It'll be removed later in the
            // factory transformer if it ends up not being needed.
            sourceText += '\nexport const ɵNonEmptyModule = true;';
            var genFile = ts.createSourceFile(genFilePath, sourceText, original.languageVersion, true, ts.ScriptKind.TS);
            if (original.moduleName !== undefined) {
                genFile.moduleName =
                    util_1.generatedModuleName(original.moduleName, original.fileName, '.ngfactory');
            }
            return genFile;
        };
        FactoryGenerator.forRootFiles = function (files) {
            var map = new Map();
            files.filter(function (sourceFile) { return typescript_1.isNonDeclarationTsPath(sourceFile); })
                .forEach(function (sourceFile) {
                return map.set(file_system_1.absoluteFrom(sourceFile.replace(/\.ts$/, '.ngfactory.ts')), sourceFile);
            });
            return new FactoryGenerator(map);
        };
        return FactoryGenerator;
    }());
    exports.FactoryGenerator = FactoryGenerator;
    function isExported(decl) {
        return decl.modifiers !== undefined &&
            decl.modifiers.some(function (mod) { return mod.kind == ts.SyntaxKind.ExportKeyword; });
    }
    function generatedFactoryTransform(factoryMap, importRewriter) {
        return function (context) {
            return function (file) {
                return transformFactorySourceFile(factoryMap, context, importRewriter, file);
            };
        };
    }
    exports.generatedFactoryTransform = generatedFactoryTransform;
    function transformFactorySourceFile(factoryMap, context, importRewriter, file) {
        var e_1, _a;
        // If this is not a generated file, it won't have factory info associated with it.
        if (!factoryMap.has(file.fileName)) {
            // Don't transform non-generated code.
            return file;
        }
        var _b = factoryMap.get(file.fileName), moduleSymbolNames = _b.moduleSymbolNames, sourceFilePath = _b.sourceFilePath;
        file = ts.getMutableClone(file);
        // Not every exported factory statement is valid. They were generated before the program was
        // analyzed, and before ngtsc knew which symbols were actually NgModules. factoryMap contains
        // that knowledge now, so this transform filters the statement list and removes exported factories
        // that aren't actually factories.
        //
        // This could leave the generated factory file empty. To prevent this (it causes issues with
        // closure compiler) a 'ɵNonEmptyModule' export was added when the factory shim was created.
        // Preserve that export if needed, and remove it otherwise.
        //
        // Additionally, an import to @angular/core is generated, but the current compilation unit could
        // actually be @angular/core, in which case such an import is invalid and should be replaced with
        // the proper path to access Ivy symbols in core.
        // The filtered set of statements.
        var transformedStatements = [];
        // The statement identified as the ɵNonEmptyModule export.
        var nonEmptyExport = null;
        // Extracted identifiers which refer to import statements from @angular/core.
        var coreImportIdentifiers = new Set();
        try {
            // Consider all the statements.
            for (var _c = tslib_1.__values(file.statements), _d = _c.next(); !_d.done; _d = _c.next()) {
                var stmt = _d.value;
                // Look for imports to @angular/core.
                if (ts.isImportDeclaration(stmt) && ts.isStringLiteral(stmt.moduleSpecifier) &&
                    stmt.moduleSpecifier.text === '@angular/core') {
                    // Update the import path to point to the correct file using the ImportRewriter.
                    var rewrittenModuleSpecifier = importRewriter.rewriteSpecifier('@angular/core', sourceFilePath);
                    if (rewrittenModuleSpecifier !== stmt.moduleSpecifier.text) {
                        transformedStatements.push(ts.updateImportDeclaration(stmt, stmt.decorators, stmt.modifiers, stmt.importClause, ts.createStringLiteral(rewrittenModuleSpecifier)));
                        // Record the identifier by which this imported module goes, so references to its symbols
                        // can be discovered later.
                        if (stmt.importClause !== undefined && stmt.importClause.namedBindings !== undefined &&
                            ts.isNamespaceImport(stmt.importClause.namedBindings)) {
                            coreImportIdentifiers.add(stmt.importClause.namedBindings.name.text);
                        }
                    }
                    else {
                        transformedStatements.push(stmt);
                    }
                }
                else if (ts.isVariableStatement(stmt) && stmt.declarationList.declarations.length === 1) {
                    var decl = stmt.declarationList.declarations[0];
                    // If this is the ɵNonEmptyModule export, then save it for later.
                    if (ts.isIdentifier(decl.name)) {
                        if (decl.name.text === 'ɵNonEmptyModule') {
                            nonEmptyExport = stmt;
                            continue;
                        }
                        // Otherwise, check if this export is a factory for a known NgModule, and retain it if so.
                        var match = STRIP_NG_FACTORY.exec(decl.name.text);
                        if (match !== null && moduleSymbolNames.has(match[1])) {
                            transformedStatements.push(stmt);
                        }
                    }
                    else {
                        // Leave the statement alone, as it can't be understood.
                        transformedStatements.push(stmt);
                    }
                }
                else {
                    // Include non-variable statements (imports, etc).
                    transformedStatements.push(stmt);
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
        // Check whether the empty module export is still needed.
        if (!transformedStatements.some(ts.isVariableStatement) && nonEmptyExport !== null) {
            // If the resulting file has no factories, include an empty export to
            // satisfy closure compiler.
            transformedStatements.push(nonEmptyExport);
        }
        file.statements = ts.createNodeArray(transformedStatements);
        // If any imports to @angular/core were detected and rewritten (which happens when compiling
        // @angular/core), go through the SourceFile and rewrite references to symbols imported from core.
        if (coreImportIdentifiers.size > 0) {
            var visit_1 = function (node) {
                node = ts.visitEachChild(node, function (child) { return visit_1(child); }, context);
                // Look for expressions of the form "i.s" where 'i' is a detected name for an @angular/core
                // import that was changed above. Rewrite 's' using the ImportResolver.
                if (ts.isPropertyAccessExpression(node) && ts.isIdentifier(node.expression) &&
                    coreImportIdentifiers.has(node.expression.text)) {
                    // This is an import of a symbol from @angular/core. Transform it with the importRewriter.
                    var rewrittenSymbol = importRewriter.rewriteSymbol(node.name.text, '@angular/core');
                    if (rewrittenSymbol !== node.name.text) {
                        var updated = ts.updatePropertyAccess(node, node.expression, ts.createIdentifier(rewrittenSymbol));
                        node = updated;
                    }
                }
                return node;
            };
            file = visit_1(file);
        }
        return file;
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmFjdG9yeV9nZW5lcmF0b3IuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21waWxlci1jbGkvc3JjL25ndHNjL3NoaW1zL3NyYy9mYWN0b3J5X2dlbmVyYXRvci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7SUFBQTs7Ozs7O09BTUc7SUFDSCwrQkFBaUM7SUFFakMsMkVBQXlFO0lBRXpFLGtGQUFpRTtJQUdqRSx1RUFBMkM7SUFFM0MsSUFBTSxhQUFhLEdBQUcsYUFBYSxDQUFDO0lBQ3BDLElBQU0sZ0JBQWdCLEdBQUcsZ0JBQWdCLENBQUM7SUFFMUM7OztPQUdHO0lBQ0g7UUFDRSwwQkFBNEIsR0FBd0M7WUFBeEMsUUFBRyxHQUFILEdBQUcsQ0FBcUM7UUFBRyxDQUFDO1FBRXhFLHNCQUFJLDRDQUFjO2lCQUFsQixjQUE0RCxPQUFPLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDOzs7V0FBQTtRQUU5RSxzQkFBSSw4Q0FBZ0I7aUJBQXBCLGNBQTJDLE9BQU8sS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDOzs7V0FBQTtRQUVoRixvQ0FBUyxHQUFULFVBQVUsUUFBd0IsSUFBYSxPQUFPLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUUvRSxtQ0FBUSxHQUFSLFVBQVMsV0FBMkIsRUFBRSxRQUFvRDtZQUV4RixJQUFNLFlBQVksR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUcsQ0FBQztZQUNqRCxJQUFNLFFBQVEsR0FBRyxRQUFRLENBQUMsWUFBWSxDQUFDLENBQUM7WUFDeEMsSUFBSSxRQUFRLEtBQUssSUFBSSxFQUFFO2dCQUNyQixPQUFPLElBQUksQ0FBQzthQUNiO1lBRUQsSUFB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Q0FBQztvQkFDdEYsSUFBSSxlQUFlLEtBQUssSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUU7d0JBQ3RDLElBQU0sT0FBTyxHQUNULEVBQUUsQ0FBQyxvQkFBb0IsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLFVBQVUsRUFBRSxFQUFFLENBQUMsZ0JBQWdCLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQzt3QkFDekYsSUFBSSxHQUFHLE9BQTBDLENBQUM7cUJBQ25EO2lCQUNGO2dCQUNELE9BQU8sSUFBSSxDQUFDO1lBQ2QsQ0FBQyxDQUFDO1lBRUYsSUFBSSxHQUFHLE9BQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztTQUNwQjtRQUVELE9BQU8sSUFBSSxDQUFDO0lBQ2QsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cbmltcG9ydCAqIGFzIHRzIGZyb20gJ3R5cGVzY3JpcHQnO1xuXG5pbXBvcnQge0Fic29sdXRlRnNQYXRoLCBhYnNvbHV0ZUZyb20sIGJhc2VuYW1lfSBmcm9tICcuLi8uLi9maWxlX3N5c3RlbSc7XG5pbXBvcnQge0ltcG9ydFJld3JpdGVyfSBmcm9tICcuLi8uLi9pbXBvcnRzJztcbmltcG9ydCB7aXNOb25EZWNsYXJhdGlvblRzUGF0aH0gZnJvbSAnLi4vLi4vdXRpbC9zcmMvdHlwZXNjcmlwdCc7XG5cbmltcG9ydCB7U2hpbUdlbmVyYXRvcn0gZnJvbSAnLi9hcGknO1xuaW1wb3J0IHtnZW5lcmF0ZWRNb2R1bGVOYW1lfSBmcm9tICcuL3V0aWwnO1xuXG5jb25zdCBUU19EVFNfU1VGRklYID0gLyhcXC5kKT9cXC50cyQvO1xuY29uc3QgU1RSSVBfTkdfRkFDVE9SWSA9IC8oLiopTmdGYWN0b3J5JC87XG5cbi8qKlxuICogR2VuZXJhdGVzIHRzLlNvdXJjZUZpbGVzIHdoaWNoIGNvbnRhaW4gdmFyaWFibGUgZGVjbGFyYXRpb25zIGZvciBOZ0ZhY3RvcmllcyBmb3IgZXZlcnkgZXhwb3J0ZWRcbiAqIGNsYXNzIG9mIGFuIGlucHV0IHRzLlNvdXJjZUZpbGUuXG4gKi9cbmV4cG9ydCBjbGFzcyBGYWN0b3J5R2VuZXJhdG9yIGltcGxlbWVudHMgU2hpbUdlbmVyYXRvciB7XG4gIHByaXZhdGUgY29uc3RydWN0b3IocHJpdmF0ZSBtYXA6IE1hcDxBYnNvbHV0ZUZzUGF0aCwgQWJzb2x1dGVGc1BhdGg+KSB7fVxuXG4gIGdldCBmYWN0b3J5RmlsZU1hcCgpOiBNYXA8QWJzb2x1dGVGc1BhdGgsIEFic29sdXRlRnNQYXRoPiB7IHJldHVybiB0aGlzLm1hcDsgfVxuXG4gIGdldCBmYWN0b3J5RmlsZU5hbWVzKCk6IEFic29sdXRlRnNQYXRoW10geyByZXR1cm4gQXJyYXkuZnJvbSh0aGlzLm1hcC5rZXlzKCkpOyB9XG5cbiAgcmVjb2duaXplKGZpbGVOYW1lOiBBYnNvbHV0ZUZzUGF0aCk6IGJvb2xlYW4geyByZXR1cm4gdGhpcy5tYXAuaGFzKGZpbGVOYW1lKTsgfVxuXG4gIGdlbmVyYXRlKGdlbkZpbGVQYXRoOiBBYnNvbHV0ZUZzUGF0aCwgcmVhZEZpbGU6IChmaWxlTmFtZTogc3RyaW5nKSA9PiB0cy5Tb3VyY2VGaWxlIHwgbnVsbCk6XG4gICAgICB0cy5Tb3VyY2VGaWxlfG51bGwge1xuICAgIGNvbnN0IG9yaWdpbmFsUGF0aCA9IHRoaXMubWFwLmdldChnZW5GaWxlUGF0aCkgITtcbiAgICBjb25zdCBvcmlnaW5hbCA9IHJlYWRGaWxlKG9yaWdpbmFsUGF0aCk7XG4gICAgaWYgKG9yaWdpbmFsID09PSBudWxsKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICBjb25zdCByZWxhdGl2ZVBhdGhUb1NvdXJjZSA9ICcuLycgKyBiYXNlbmFtZShvcmlnaW5hbC5maWxlTmFtZSkucmVwbGFjZShUU19EVFNfU1VGRklYLCAnJyk7XG4gICAgLy8gQ29sbGVjdCBhIGxpc3Qgb2YgY2xhc3NlcyB0aGF0IG5lZWQgdG8gaGF2ZSBmYWN0b3J5IHR5cGVzIGVtaXR0ZWQgZm9yIHRoZW0uIFRoaXMgbGlzdCBpc1xuICAgIC8vIG92ZXJseSBicm9hZCBhcyBhdCB0aGlzIHBvaW50IHRoZSB0cy5UeXBlQ2hlY2tlciBoYXNuJ3QgYmVlbiBjcmVhdGVkLCBhbmQgY2FuJ3QgYmUgdXNlZCB0b1xuICAgIC8vIHNlbWFudGljYWxseSB1bmRlcnN0YW5kIHdoaWNoIGRlY29yYXRlZCB0eXBlcyBhcmUgYWN0dWFsbHkgZGVjb3JhdGVkIHdpdGggQW5ndWxhciBkZWNvcmF0b3JzLlxuICAgIC8vXG4gICAgLy8gVGhlIGV4cG9ydHMgZ2VuZXJhdGVkIGhlcmUgYXJlIHBydW5lZCBpbiB0aGUgZmFjdG9yeSB0cmFuc2Zvcm0gZHVyaW5nIGVtaXQuXG4gICAgY29uc3Qgc3ltYm9sTmFtZXMgPSBvcmlnaW5hbFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5zdGF0ZW1lbnRzXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gUGljayBvdXQgdG9wIGxldmVsIGNsYXNzIGRlY2xhcmF0aW9ucy4uLlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5maWx0ZXIodHMuaXNDbGFzc0RlY2xhcmF0aW9uKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIHdoaWNoIGFyZSBuYW1lZCwgZXhwb3J0ZWQsIGFuZCBoYXZlIGRlY29yYXRvcnMuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLmZpbHRlcihcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVjbCA9PiBpc0V4cG9ydGVkKGRlY2wpICYmIGRlY2wuZGVjb3JhdG9ycyAhPT0gdW5kZWZpbmVkICYmXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWNsLm5hbWUgIT09IHVuZGVmaW5lZClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBHcmFiIHRoZSBzeW1ib2wgbmFtZS5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAubWFwKGRlY2wgPT4gZGVjbC5uYW1lICEudGV4dCk7XG5cblxuICAgIC8vIElmIHRoZXJlIGlzIGEgdG9wLWxldmVsIGNvbW1lbnQgaW4gdGhlIG9yaWdpbmFsIGZpbGUsIGNvcHkgaXQgb3ZlciBhdCB0aGUgdG9wIG9mIHRoZVxuICAgIC8vIGdlbmVyYXRlZCBmYWN0b3J5IGZpbGUuIFRoaXMgaXMgaW1wb3J0YW50IGZvciBwcmVzZXJ2aW5nIGFueSBsb2FkLWJlYXJpbmcganNkb2MgY29tbWVudHMuXG4gICAgbGV0IGNvbW1lbnQ6IHN0cmluZyA9ICcnO1xuICAgIGlmIChvcmlnaW5hbC5zdGF0ZW1lbnRzLmxlbmd0aCA+IDApIHtcbiAgICAgIGNvbnN0IGZpcnN0U3RhdGVtZW50ID0gb3JpZ2luYWwuc3RhdGVtZW50c1swXTtcbiAgICAgIC8vIE11c3QgcGFzcyBTb3VyY2VGaWxlIHRvIGdldExlYWRpbmdUcml2aWFXaWR0aCgpIGFuZCBnZXRGdWxsVGV4dCgpLCBvdGhlcndpc2UgaXQnbGwgdHJ5IHRvXG4gICAgICAvLyBnZXQgU291cmNlRmlsZSBieSByZWN1cnNpdmVseSBsb29raW5nIHVwIHRoZSBwYXJlbnQgb2YgdGhlIE5vZGUgYW5kIGZhaWwsXG4gICAgICAvLyBiZWNhdXNlIHBhcmVudCBpcyB1bmRlZmluZWQuXG4gICAgICBjb25zdCBsZWFkaW5nVHJpdmlhV2lkdGggPSBmaXJzdFN0YXRlbWVudC5nZXRMZWFkaW5nVHJpdmlhV2lkdGgob3JpZ2luYWwpO1xuICAgICAgaWYgKGxlYWRpbmdUcml2aWFXaWR0aCA+IDApIHtcbiAgICAgICAgY29tbWVudCA9IGZpcnN0U3RhdGVtZW50LmdldEZ1bGxUZXh0KG9yaWdpbmFsKS5zdWJzdHIoMCwgbGVhZGluZ1RyaXZpYVdpZHRoKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBsZXQgc291cmNlVGV4dCA9IGNvbW1lbnQ7XG4gICAgaWYgKHN5bWJvbE5hbWVzLmxlbmd0aCA+IDApIHtcbiAgICAgIC8vIEZvciBlYWNoIHN5bWJvbCBuYW1lLCBnZW5lcmF0ZSBhIGNvbnN0YW50IGV4cG9ydCBvZiB0aGUgY29ycmVzcG9uZGluZyBOZ0ZhY3RvcnkuXG4gICAgICAvLyBUaGlzIHdpbGwgZW5jb21wYXNzIGEgbG90IG9mIHN5bWJvbHMgd2hpY2ggZG9uJ3QgbmVlZCBmYWN0b3JpZXMsIGJ1dCB0aGF0J3Mgb2theVxuICAgICAgLy8gYmVjYXVzZSBpdCB3b24ndCBtaXNzIGFueSB0aGF0IGRvLlxuICAgICAgY29uc3QgdmFyTGluZXMgPSBzeW1ib2xOYW1lcy5tYXAoXG4gICAgICAgICAgbmFtZSA9PlxuICAgICAgICAgICAgICBgZXhwb3J0IGNvbnN0ICR7bmFtZX1OZ0ZhY3Rvcnk6IGkwLsm1TmdNb2R1bGVGYWN0b3J5PGFueT4gPSBuZXcgaTAuybVOZ01vZHVsZUZhY3RvcnkoJHtuYW1lfSk7YCk7XG4gICAgICBzb3VyY2VUZXh0ICs9IFtcbiAgICAgICAgLy8gVGhpcyBtaWdodCBiZSBpbmNvcnJlY3QgaWYgdGhlIGN1cnJlbnQgcGFja2FnZSBiZWluZyBjb21waWxlZCBpcyBBbmd1bGFyIGNvcmUsIGJ1dCBpdCdzXG4gICAgICAgIC8vIG9rYXkgdG8gbGVhdmUgaW4gYXQgdHlwZSBjaGVja2luZyB0aW1lLiBUeXBlU2NyaXB0IGNhbiBoYW5kbGUgdGhpcyByZWZlcmVuY2UgdmlhIGl0cyBwYXRoXG4gICAgICAgIC8vIG1hcHBpbmcsIGJ1dCBkb3duc3RyZWFtIGJ1bmRsZXJzIGNhbid0LiBJZiB0aGUgY3VycmVudCBwYWNrYWdlIGlzIGNvcmUgaXRzZWxmLCB0aGlzIHdpbGxcbiAgICAgICAgLy8gYmUgcmVwbGFjZWQgaW4gdGhlIGZhY3RvcnkgdHJhbnNmb3JtZXIgYmVmb3JlIGVtaXQuXG4gICAgICAgIGBpbXBvcnQgKiBhcyBpMCBmcm9tICdAYW5ndWxhci9jb3JlJztgLFxuICAgICAgICBgaW1wb3J0IHske3N5bWJvbE5hbWVzLmpvaW4oJywgJyl9fSBmcm9tICcke3JlbGF0aXZlUGF0aFRvU291cmNlfSc7YCxcbiAgICAgICAgLi4udmFyTGluZXMsXG4gICAgICBdLmpvaW4oJ1xcbicpO1xuICAgIH1cblxuICAgIC8vIEFkZCBhbiBleHRyYSBleHBvcnQgdG8gZW5zdXJlIHRoaXMgbW9kdWxlIGhhcyBhdCBsZWFzdCBvbmUuIEl0J2xsIGJlIHJlbW92ZWQgbGF0ZXIgaW4gdGhlXG4gICAgLy8gZmFjdG9yeSB0cmFuc2Zvcm1lciBpZiBpdCBlbmRzIHVwIG5vdCBiZWluZyBuZWVkZWQuXG4gICAgc291cmNlVGV4dCArPSAnXFxuZXhwb3J0IGNvbnN0IMm1Tm9uRW1wdHlNb2R1bGUgPSB0cnVlOyc7XG5cbiAgICBjb25zdCBnZW5GaWxlID0gdHMuY3JlYXRlU291cmNlRmlsZShcbiAgICAgICAgZ2VuRmlsZVBhdGgsIHNvdXJjZVRleHQsIG9yaWdpbmFsLmxhbmd1YWdlVmVyc2lvbiwgdHJ1ZSwgdHMuU2NyaXB0S2luZC5UUyk7XG4gICAgaWYgKG9yaWdpbmFsLm1vZHVsZU5hbWUgIT09IHVuZGVmaW5lZCkge1xuICAgICAgZ2VuRmlsZS5tb2R1bGVOYW1lID1cbiAgICAgICAgICBnZW5lcmF0ZWRNb2R1bGVOYW1lKG9yaWdpbmFsLm1vZHVsZU5hbWUsIG9yaWdpbmFsLmZpbGVOYW1lLCAnLm5nZmFjdG9yeScpO1xuICAgIH1cbiAgICByZXR1cm4gZ2VuRmlsZTtcbiAgfVxuXG4gIHN0YXRpYyBmb3JSb290RmlsZXMoZmlsZXM6IFJlYWRvbmx5QXJyYXk8QWJzb2x1dGVGc1BhdGg+KTogRmFjdG9yeUdlbmVyYXRvciB7XG4gICAgY29uc3QgbWFwID0gbmV3IE1hcDxBYnNvbHV0ZUZzUGF0aCwgQWJzb2x1dGVGc1BhdGg+KCk7XG4gICAgZmlsZXMuZmlsdGVyKHNvdXJjZUZpbGUgPT4gaXNOb25EZWNsYXJhdGlvblRzUGF0aChzb3VyY2VGaWxlKSlcbiAgICAgICAgLmZvckVhY2goXG4gICAgICAgICAgICBzb3VyY2VGaWxlID0+XG4gICAgICAgICAgICAgICAgbWFwLnNldChhYnNvbHV0ZUZyb20oc291cmNlRmlsZS5yZXBsYWNlKC9cXC50cyQvLCAnLm5nZmFjdG9yeS50cycpKSwgc291cmNlRmlsZSkpO1xuICAgIHJldHVybiBuZXcgRmFjdG9yeUdlbmVyYXRvcihtYXApO1xuICB9XG59XG5cbmZ1bmN0aW9uIGlzRXhwb3J0ZWQoZGVjbDogdHMuRGVjbGFyYXRpb24pOiBib29sZWFuIHtcbiAgcmV0dXJuIGRlY2wubW9kaWZpZXJzICE9PSB1bmRlZmluZWQgJiZcbiAgICAgIGRlY2wubW9kaWZpZXJzLnNvbWUobW9kID0+IG1vZC5raW5kID09IHRzLlN5bnRheEtpbmQuRXhwb3J0S2V5d29yZCk7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgRmFjdG9yeUluZm8ge1xuICBzb3VyY2VGaWxlUGF0aDogc3RyaW5nO1xuICBtb2R1bGVTeW1ib2xOYW1lczogU2V0PHN0cmluZz47XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZW5lcmF0ZWRGYWN0b3J5VHJhbnNmb3JtKFxuICAgIGZhY3RvcnlNYXA6IE1hcDxzdHJpbmcsIEZhY3RvcnlJbmZvPixcbiAgICBpbXBvcnRSZXdyaXRlcjogSW1wb3J0UmV3cml0ZXIpOiB0cy5UcmFuc2Zvcm1lckZhY3Rvcnk8dHMuU291cmNlRmlsZT4ge1xuICByZXR1cm4gKGNvbnRleHQ6IHRzLlRyYW5zZm9ybWF0aW9uQ29udGV4dCk6IHRzLlRyYW5zZm9ybWVyPHRzLlNvdXJjZUZpbGU+ID0+IHtcbiAgICByZXR1cm4gKGZpbGU6IHRzLlNvdXJjZUZpbGUpOiB0cy5Tb3VyY2VGaWxlID0+IHtcbiAgICAgIHJldHVybiB0cmFuc2Zvcm1GYWN0b3J5U291cmNlRmlsZShmYWN0b3J5TWFwLCBjb250ZXh0LCBpbXBvcnRSZXdyaXRlciwgZmlsZSk7XG4gICAgfTtcbiAgfTtcbn1cblxuZnVuY3Rpb24gdHJhbnNmb3JtRmFjdG9yeVNvdXJjZUZpbGUoXG4gICAgZmFjdG9yeU1hcDogTWFwPHN0cmluZywgRmFjdG9yeUluZm8+LCBjb250ZXh0OiB0cy5UcmFuc2Zvcm1hdGlvbkNvbnRleHQsXG4gICAgaW1wb3J0UmV3cml0ZXI6IEltcG9ydFJld3JpdGVyLCBmaWxlOiB0cy5Tb3VyY2VGaWxlKTogdHMuU291cmNlRmlsZSB7XG4gIC8vIElmIHRoaXMgaXMgbm90IGEgZ2VuZXJhdGVkIGZpbGUsIGl0IHdvbid0IGhhdmUgZmFjdG9yeSBpbmZvIGFzc29jaWF0ZWQgd2l0aCBpdC5cbiAgaWYgKCFmYWN0b3J5TWFwLmhhcyhmaWxlLmZpbGVOYW1lKSkge1xuICAgIC8vIERvbid0IHRyYW5zZm9ybSBub24tZ2VuZXJhdGVkIGNvZGUuXG4gICAgcmV0dXJuIGZpbGU7XG4gIH1cblxuICBjb25zdCB7bW9kdWxlU3ltYm9sTmFtZXMsIHNvdXJjZUZpbGVQYXRofSA9IGZhY3RvcnlNYXAuZ2V0KGZpbGUuZmlsZU5hbWUpICE7XG5cbiAgZmlsZSA9IHRzLmdldE11dGFibGVDbG9uZShmaWxlKTtcblxuICAvLyBOb3QgZXZlcnkgZXhwb3J0ZWQgZmFjdG9yeSBzdGF0ZW1lbnQgaXMgdmFsaWQuIFRoZXkgd2VyZSBnZW5lcmF0ZWQgYmVmb3JlIHRoZSBwcm9ncmFtIHdhc1xuICAvLyBhbmFseXplZCwgYW5kIGJlZm9yZSBuZ3RzYyBrbmV3IHdoaWNoIHN5bWJvbHMgd2VyZSBhY3R1YWxseSBOZ01vZHVsZXMuIGZhY3RvcnlNYXAgY29udGFpbnNcbiAgLy8gdGhhdCBrbm93bGVkZ2Ugbm93LCBzbyB0aGlzIHRyYW5zZm9ybSBmaWx0ZXJzIHRoZSBzdGF0ZW1lbnQgbGlzdCBhbmQgcmVtb3ZlcyBleHBvcnRlZCBmYWN0b3JpZXNcbiAgLy8gdGhhdCBhcmVuJ3QgYWN0dWFsbHkgZmFjdG9yaWVzLlxuICAvL1xuICAvLyBUaGlzIGNvdWxkIGxlYXZlIHRoZSBnZW5lcmF0ZWQgZmFjdG9yeSBmaWxlIGVtcHR5LiBUbyBwcmV2ZW50IHRoaXMgKGl0IGNhdXNlcyBpc3N1ZXMgd2l0aFxuICAvLyBjbG9zdXJlIGNvbXBpbGVyKSBhICfJtU5vbkVtcHR5TW9kdWxlJyBleHBvcnQgd2FzIGFkZGVkIHdoZW4gdGhlIGZhY3Rvcnkgc2hpbSB3YXMgY3JlYXRlZC5cbiAgLy8gUHJlc2VydmUgdGhhdCBleHBvcnQgaWYgbmVlZGVkLCBhbmQgcmVtb3ZlIGl0IG90aGVyd2lzZS5cbiAgLy9cbiAgLy8gQWRkaXRpb25hbGx5LCBhbiBpbXBvcnQgdG8gQGFuZ3VsYXIvY29yZSBpcyBnZW5lcmF0ZWQsIGJ1dCB0aGUgY3VycmVudCBjb21waWxhdGlvbiB1bml0IGNvdWxkXG4gIC8vIGFjdHVhbGx5IGJlIEBhbmd1bGFyL2NvcmUsIGluIHdoaWNoIGNhc2Ugc3VjaCBhbiBpbXBvcnQgaXMgaW52YWxpZCBhbmQgc2hvdWxkIGJlIHJlcGxhY2VkIHdpdGhcbiAgLy8gdGhlIHByb3BlciBwYXRoIHRvIGFjY2VzcyBJdnkgc3ltYm9scyBpbiBjb3JlLlxuXG4gIC8vIFRoZSBmaWx0ZXJlZCBzZXQgb2Ygc3RhdGVtZW50cy5cbiAgY29uc3QgdHJhbnNmb3JtZWRTdGF0ZW1lbnRzOiB0cy5TdGF0ZW1lbnRbXSA9IFtdO1xuXG4gIC8vIFRoZSBzdGF0ZW1lbnQgaWRlbnRpZmllZCBhcyB0aGUgybVOb25FbXB0eU1vZHVsZSBleHBvcnQuXG4gIGxldCBub25FbXB0eUV4cG9ydDogdHMuU3RhdGVtZW50fG51bGwgPSBudWxsO1xuXG4gIC8vIEV4dHJhY3RlZCBpZGVudGlmaWVycyB3aGljaCByZWZlciB0byBpbXBvcnQgc3RhdGVtZW50cyBmcm9tIEBhbmd1bGFyL2NvcmUuXG4gIGNvbnN0IGNvcmVJbXBvcnRJZGVudGlmaWVycyA9IG5ldyBTZXQ8c3RyaW5nPigpO1xuXG4gIC8vIENvbnNpZGVyIGFsbCB0aGUgc3RhdGVtZW50cy5cbiAgZm9yIChjb25zdCBzdG10IG9mIGZpbGUuc3RhdGVtZW50cykge1xuICAgIC8vIExvb2sgZm9yIGltcG9ydHMgdG8gQGFuZ3VsYXIvY29yZS5cbiAgICBpZiAodHMuaXNJbXBvcnREZWNsYXJhdGlvbihzdG10KSAmJiB0cy5pc1N0cmluZ0xpdGVyYWwoc3RtdC5tb2R1bGVTcGVjaWZpZXIpICYmXG4gICAgICAgIHN0bXQubW9kdWxlU3BlY2lmaWVyLnRleHQgPT09ICdAYW5ndWxhci9jb3JlJykge1xuICAgICAgLy8gVXBkYXRlIHRoZSBpbXBvcnQgcGF0aCB0byBwb2ludCB0byB0aGUgY29ycmVjdCBmaWxlIHVzaW5nIHRoZSBJbXBvcnRSZXdyaXRlci5cbiAgICAgIGNvbnN0IHJld3JpdHRlbk1vZHVsZVNwZWNpZmllciA9XG4gICAgICAgICAgaW1wb3J0UmV3cml0ZXIucmV3cml0ZVNwZWNpZmllcignQGFuZ3VsYXIvY29yZScsIHNvdXJjZUZpbGVQYXRoKTtcbiAgICAgIGlmIChyZXdyaXR0ZW5Nb2R1bGVTcGVjaWZpZXIgIT09IHN0bXQubW9kdWxlU3BlY2lmaWVyLnRleHQpIHtcbiAgICAgICAgdHJhbnNmb3JtZWRTdGF0ZW1lbnRzLnB1c2godHMudXBkYXRlSW1wb3J0RGVjbGFyYXRpb24oXG4gICAgICAgICAgICBzdG10LCBzdG10LmRlY29yYXRvcnMsIHN0bXQubW9kaWZpZXJzLCBzdG10LmltcG9ydENsYXVzZSxcbiAgICAgICAgICAgIHRzLmNyZWF0ZVN0cmluZ0xpdGVyYWwocmV3cml0dGVuTW9kdWxlU3BlY2lmaWVyKSkpO1xuXG4gICAgICAgIC8vIFJlY29yZCB0aGUgaWRlbnRpZmllciBieSB3aGljaCB0aGlzIGltcG9ydGVkIG1vZHVsZSBnb2VzLCBzbyByZWZlcmVuY2VzIHRvIGl0cyBzeW1ib2xzXG4gICAgICAgIC8vIGNhbiBiZSBkaXNjb3ZlcmVkIGxhdGVyLlxuICAgICAgICBpZiAoc3RtdC5pbXBvcnRDbGF1c2UgIT09IHVuZGVmaW5lZCAmJiBzdG10LmltcG9ydENsYXVzZS5uYW1lZEJpbmRpbmdzICE9PSB1bmRlZmluZWQgJiZcbiAgICAgICAgICAgIHRzLmlzTmFtZXNwYWNlSW1wb3J0KHN0bXQuaW1wb3J0Q2xhdXNlLm5hbWVkQmluZGluZ3MpKSB7XG4gICAgICAgICAgY29yZUltcG9ydElkZW50aWZpZXJzLmFkZChzdG10LmltcG9ydENsYXVzZS5uYW1lZEJpbmRpbmdzLm5hbWUudGV4dCk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRyYW5zZm9ybWVkU3RhdGVtZW50cy5wdXNoKHN0bXQpO1xuICAgICAgfVxuICAgIH0gZWxzZSBpZiAodHMuaXNWYXJpYWJsZVN0YXRlbWVudChzdG10KSAmJiBzdG10LmRlY2xhcmF0aW9uTGlzdC5kZWNsYXJhdGlvbnMubGVuZ3RoID09PSAxKSB7XG4gICAgICBjb25zdCBkZWNsID0gc3RtdC5kZWNsYXJhdGlvbkxpc3QuZGVjbGFyYXRpb25zWzBdO1xuXG4gICAgICAvLyBJZiB0aGlzIGlzIHRoZSDJtU5vbkVtcHR5TW9kdWxlIGV4cG9ydCwgdGhlbiBzYXZlIGl0IGZvciBsYXRlci5cbiAgICAgIGlmICh0cy5pc0lkZW50aWZpZXIoZGVjbC5uYW1lKSkge1xuICAgICAgICBpZiAoZGVjbC5uYW1lLnRleHQgPT09ICfJtU5vbkVtcHR5TW9kdWxlJykge1xuICAgICAgICAgIG5vbkVtcHR5RXhwb3J0ID0gc3RtdDtcbiAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIE90aGVyd2lzZSwgY2hlY2sgaWYgdGhpcyBleHBvcnQgaXMgYSBmYWN0b3J5IGZvciBhIGtub3duIE5nTW9kdWxlLCBhbmQgcmV0YWluIGl0IGlmIHNvLlxuICAgICAgICBjb25zdCBtYXRjaCA9IFNUUklQX05HX0ZBQ1RPUlkuZXhlYyhkZWNsLm5hbWUudGV4dCk7XG4gICAgICAgIGlmIChtYXRjaCAhPT0gbnVsbCAmJiBtb2R1bGVTeW1ib2xOYW1lcy5oYXMobWF0Y2hbMV0pKSB7XG4gICAgICAgICAgdHJhbnNmb3JtZWRTdGF0ZW1lbnRzLnB1c2goc3RtdCk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIExlYXZlIHRoZSBzdGF0ZW1lbnQgYWxvbmUsIGFzIGl0IGNhbid0IGJlIHVuZGVyc3Rvb2QuXG4gICAgICAgIHRyYW5zZm9ybWVkU3RhdGVtZW50cy5wdXNoKHN0bXQpO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICAvLyBJbmNsdWRlIG5vbi12YXJpYWJsZSBzdGF0ZW1lbnRzIChpbXBvcnRzLCBldGMpLlxuICAgICAgdHJhbnNmb3JtZWRTdGF0ZW1lbnRzLnB1c2goc3RtdCk7XG4gICAgfVxuICB9XG5cbiAgLy8gQ2hlY2sgd2hldGhlciB0aGUgZW1wdHkgbW9kdWxlIGV4cG9ydCBpcyBzdGlsbCBuZWVkZWQuXG4gIGlmICghdHJhbnNmb3JtZWRTdGF0ZW1lbnRzLnNvbWUodHMuaXNWYXJpYWJsZVN0YXRlbWVudCkgJiYgbm9uRW1wdHlFeHBvcnQgIT09IG51bGwpIHtcbiAgICAvLyBJZiB0aGUgcmVzdWx0aW5nIGZpbGUgaGFzIG5vIGZhY3RvcmllcywgaW5jbHVkZSBhbiBlbXB0eSBleHBvcnQgdG9cbiAgICAvLyBzYXRpc2Z5IGNsb3N1cmUgY29tcGlsZXIuXG4gICAgdHJhbnNmb3JtZWRTdGF0ZW1lbnRzLnB1c2gobm9uRW1wdHlFeHBvcnQpO1xuICB9XG4gIGZpbGUuc3RhdGVtZW50cyA9IHRzLmNyZWF0ZU5vZGVBcnJheSh0cmFuc2Zvcm1lZFN0YXRlbWVudHMpO1xuXG4gIC8vIElmIGFueSBpbXBvcnRzIHRvIEBhbmd1bGFyL2NvcmUgd2VyZSBkZXRlY3RlZCBhbmQgcmV3cml0dGVuICh3aGljaCBoYXBwZW5zIHdoZW4gY29tcGlsaW5nXG4gIC8vIEBhbmd1bGFyL2NvcmUpLCBnbyB0aHJvdWdoIHRoZSBTb3VyY2VGaWxlIGFuZCByZXdyaXRlIHJlZmVyZW5jZXMgdG8gc3ltYm9scyBpbXBvcnRlZCBmcm9tIGNvcmUuXG4gIGlmIChjb3JlSW1wb3J0SWRlbnRpZmllcnMuc2l6ZSA+IDApIHtcbiAgICBjb25zdCB2aXNpdCA9IDxUIGV4dGVuZHMgdHMuTm9kZT4obm9kZTogVCk6IFQgPT4ge1xuICAgICAgbm9kZSA9IHRzLnZpc2l0RWFjaENoaWxkKG5vZGUsIGNoaWxkID0+IHZpc2l0KGNoaWxkKSwgY29udGV4dCk7XG5cbiAgICAgIC8vIExvb2sgZm9yIGV4cHJlc3Npb25zIG9mIHRoZSBmb3JtIFwiaS5zXCIgd2hlcmUgJ2knIGlzIGEgZGV0ZWN0ZWQgbmFtZSBmb3IgYW4gQGFuZ3VsYXIvY29yZVxuICAgICAgLy8gaW1wb3J0IHRoYXQgd2FzIGNoYW5nZWQgYWJvdmUuIFJld3JpdGUgJ3MnIHVzaW5nIHRoZSBJbXBvcnRSZXNvbHZlci5cbiAgICAgIGlmICh0cy5pc1Byb3BlcnR5QWNjZXNzRXhwcmVzc2lvbihub2RlKSAmJiB0cy5pc0lkZW50aWZpZXIobm9kZS5leHByZXNzaW9uKSAmJlxuICAgICAgICAgIGNvcmVJbXBvcnRJZGVudGlmaWVycy5oYXMobm9kZS5leHByZXNzaW9uLnRleHQpKSB7XG4gICAgICAgIC8vIFRoaXMgaXMgYW4gaW1wb3J0IG9mIGEgc3ltYm9sIGZyb20gQGFuZ3VsYXIvY29yZS4gVHJhbnNmb3JtIGl0IHdpdGggdGhlIGltcG9ydFJld3JpdGVyLlxuICAgICAgICBjb25zdCByZXdyaXR0ZW5TeW1ib2wgPSBpbXBvcnRSZXdyaXRlci5yZXdyaXRlU3ltYm9sKG5vZGUubmFtZS50ZXh0LCAnQGFuZ3VsYXIvY29yZScpO1xuICAgICAgICBpZiAocmV3cml0dGVuU3ltYm9sICE9PSBub2RlLm5hbWUudGV4dCkge1xuICAgICAgICAgIGNvbnN0IHVwZGF0ZWQgPVxuICAgICAgICAgICAgICB0cy51cGRhdGVQcm9wZXJ0eUFjY2Vzcyhub2RlLCBub2RlLmV4cHJlc3Npb24sIHRzLmNyZWF0ZUlkZW50aWZpZXIocmV3cml0dGVuU3ltYm9sKSk7XG4gICAgICAgICAgbm9kZSA9IHVwZGF0ZWQgYXMgVCAmIHRzLlByb3BlcnR5QWNjZXNzRXhwcmVzc2lvbjtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIG5vZGU7XG4gICAgfTtcblxuICAgIGZpbGUgPSB2aXNpdChmaWxlKTtcbiAgfVxuXG4gIHJldHVybiBmaWxlO1xufVxuIl19