(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/compiler-cli/ngcc/src/dependencies/commonjs_dependency_host", ["require", "exports", "tslib", "typescript", "@angular/compiler-cli/ngcc/src/host/commonjs_umd_utils", "@angular/compiler-cli/ngcc/src/dependencies/dependency_host", "@angular/compiler-cli/ngcc/src/dependencies/module_resolver"], factory);
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
    var commonjs_umd_utils_1 = require("@angular/compiler-cli/ngcc/src/host/commonjs_umd_utils");
    var dependency_host_1 = require("@angular/compiler-cli/ngcc/src/dependencies/dependency_host");
    var module_resolver_1 = require("@angular/compiler-cli/ngcc/src/dependencies/module_resolver");
    /**
     * Helper functions for computing dependencies.
     */
    var CommonJsDependencyHost = /** @class */ (function (_super) {
        tslib_1.__extends(CommonJsDependencyHost, _super);
        function CommonJsDependencyHost() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        /**
         * Compute the dependencies of the given file.
         *
         * @param file An absolute path to the file whose dependencies we want to get.
         * @param dependencies A set that will have the absolute paths of resolved entry points added to
         * it.
         * @param missing A set that will have the dependencies that could not be found added to it.
         * @param deepImports A set that will have the import paths that exist but cannot be mapped to
         * entry-points, i.e. deep-imports.
         * @param alreadySeen A set that is used to track internal dependencies to prevent getting stuck
         * in a circular dependency loop.
         */
        CommonJsDependencyHost.prototype.recursivelyCollectDependencies = function (file, dependencies, missing, deepImports, alreadySeen) {
            var e_1, _a, e_2, _b, e_3, _c;
            var fromContents = this.fs.readFile(file);
            if (!this.hasRequireCalls(fromContents)) {
                // Avoid parsing the source file as there are no imports.
                return;
            }
            // Parse the source into a TypeScript AST and then walk it looking for imports and re-exports.
            var sf = ts.createSourceFile(file, fromContents, ts.ScriptTarget.ES2015, false, ts.ScriptKind.JS);
            var requireCalls = [];
            try {
                for (var _d = tslib_1.__values(sf.statements), _e = _d.next(); !_e.done; _e = _d.next()) {
                    var stmt = _e.value;
                    if (ts.isVariableStatement(stmt)) {
                        // Regular import(s):
                        // `var foo = require('...')` or `var foo = require('...'), bar = require('...')`
                        var declarations = stmt.declarationList.declarations;
                        try {
                            for (var declarations_1 = (e_2 = void 0, tslib_1.__values(declarations)), declarations_1_1 = declarations_1.next(); !declarations_1_1.done; declarations_1_1 = declarations_1.next()) {
                                var declaration = declarations_1_1.value;
                                if ((declaration.initializer !== undefined) && commonjs_umd_utils_1.isRequireCall(declaration.initializer)) {
                                    requireCalls.push(declaration.initializer);
                                }
                            }
                        }
                        catch (e_2_1) { e_2 = { error: e_2_1 }; }
                        finally {
                            try {
                                if (declarations_1_1 && !declarations_1_1.done && (_b = declarations_1.return)) _b.call(declarations_1);
                            }
                            finally { if (e_2) throw e_2.error; }
                        }
                    }
                    else if (ts.isExpressionStatement(stmt)) {
                        if (commonjs_umd_utils_1.isRequireCall(stmt.expression)) {
                            // Import for the side-effects only:
                            // `require('...')`
                            requireCalls.push(stmt.expression);
                        }
                        else if (commonjs_umd_utils_1.isReexportStatement(stmt)) {
                            // Re-export in one of the following formats:
                            // - `__export(require('...'))`
                            // - `__export(<identifier>)`
                            // - `tslib_1.__exportStar(require('...'), exports)`
                            // - `tslib_1.__exportStar(<identifier>, exports)`
                            var firstExportArg = stmt.expression.arguments[0];
                            if (commonjs_umd_utils_1.isRequireCall(firstExportArg)) {
                                // Re-export with `require()` call:
                                // `__export(require('...'))` or `tslib_1.__exportStar(require('...'), exports)`
                                requireCalls.push(firstExportArg);
                            }
                        }
                        else if (ts.isBinaryExpression(stmt.expression) &&
                            (stmt.expression.operatorToken.kind === ts.SyntaxKind.EqualsToken)) {
                            if (commonjs_umd_utils_1.isRequireCall(stmt.expression.right)) {
                                // Import with assignment. E.g.:
                                // `exports.foo = require('...')`
                                requireCalls.push(stmt.expression.right);
                            }
                            else if (ts.isObjectLiteralExpression(stmt.expression.right)) {
                                // Import in object literal. E.g.:
                                // `module.exports = {foo: require('...')}`
                                stmt.expression.right.properties.forEach(function (prop) {
                                    if (ts.isPropertyAssignment(prop) && commonjs_umd_utils_1.isRequireCall(prop.initializer)) {
                                        requireCalls.push(prop.initializer);
                                    }
                                });
                            }
                        }
                    }
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (_e && !_e.done && (_a = _d.return)) _a.call(_d);
                }
                finally { if (e_1) throw e_1.error; }
            }
            var importPaths = new Set(requireCalls.map(function (call) { return call.arguments[0].text; }));
            try {
                for (var importPaths_1 = tslib_1.__values(importPaths), importPaths_1_1 = importPaths_1.next(); !importPaths_1_1.done; importPaths_1_1 = importPaths_1.next()) {
                    var importPath = importPaths_1_1.value;
                    var resolvedModule = this.moduleResolver.resolveModuleImport(importPath, file);
                    if (resolvedModule === null) {
                        missing.add(importPath);
                    }
                    else if (resolvedModule instanceof module_resolver_1.ResolvedRelativeModule) {
                        var internalDependency = resolvedModule.modulePath;
                        if (!alreadySeen.has(internalDependency)) {
                            alreadySeen.add(internalDependency);
                            this.recursivelyCollectDependencies(internalDependency, dependencies, missing, deepImports, alreadySeen);
                        }
                    }
                    else if (resolvedModule instanceof module_resolver_1.ResolvedDeepImport) {
                        deepImports.add(resolvedModule.importPath);
                    }
                    else {
                        dependencies.add(resolvedModule.entryPointPath);
                    }
                }
            }
            catch (e_3_1) { e_3 = { error: e_3_1 }; }
            finally {
                try {
                    if (importPaths_1_1 && !importPaths_1_1.done && (_c = importPaths_1.return)) _c.call(importPaths_1);
                }
                finally { if (e_3) throw e_3.error; }
            }
        };
        /**
         * Check whether a source file needs to be parsed for imports.
         * This is a performance short-circuit, which saves us from creating
         * a TypeScript AST unnecessarily.
         *
         * @param source The content of the source file to check.
         *
         * @returns false if there are definitely no require calls
         * in this file, true otherwise.
         */
        CommonJsDependencyHost.prototype.hasRequireCalls = function (source) { return /require\(['"]/.test(source); };
        return CommonJsDependencyHost;
    }(dependency_host_1.DependencyHostBase));
    exports.CommonJsDependencyHost = CommonJsDependencyHost;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tbW9uanNfZGVwZW5kZW5jeV9ob3N0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tcGlsZXItY2xpL25nY2Mvc3JjL2RlcGVuZGVuY2llcy9jb21tb25qc19kZXBlbmRlbmN5X2hvc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0lBQUE7Ozs7OztPQU1HO0lBQ0gsK0JBQWlDO0lBRWpDLDZGQUEyRjtJQUMzRiwrRkFBcUQ7SUFDckQsK0ZBQTZFO0lBRTdFOztPQUVHO0lBQ0g7UUFBNEMsa0RBQWtCO1FBQTlEOztRQTJHQSxDQUFDO1FBMUdDOzs7Ozs7Ozs7OztXQVdHO1FBQ08sK0RBQThCLEdBQXhDLFVBQ0ksSUFBb0IsRUFBRSxZQUFpQyxFQUFFLE9BQW9CLEVBQzdFLFdBQWdDLEVBQUUsV0FBZ0M7O1lBQ3BFLElBQU0sWUFBWSxHQUFHLElBQUksQ0FBQyxFQUFFLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDO1lBRTVDLElBQUksQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLFlBQVksQ0FBQyxFQUFFO2dCQUN2Qyx5REFBeUQ7Z0JBQ3pELE9BQU87YUFDUjtZQUVELDhGQUE4RjtZQUM5RixJQUFNLEVBQUUsR0FDSixFQUFFLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxFQUFFLFlBQVksRUFBRSxFQUFFLENBQUMsWUFBWSxDQUFDLE1BQU0sRUFBRSxLQUFLLEVBQUUsRUFBRSxDQUFDLFVBQVUsQ0FBQyxFQUFFLENBQUMsQ0FBQztZQUM3RixJQUFNLFlBQVksR0FBa0IsRUFBRSxDQUFDOztnQkFFdkMsS0FBbUIsSUFBQSxLQUFBLGlCQUFBLEVBQUUsQ0FBQyxVQUFVLENBQUEsZ0JBQUEsNEJBQUU7b0JBQTdCLElBQU0sSUFBSSxXQUFBO29CQUNiLElBQUksRUFBRSxDQUFDLG1CQUFtQixDQUFDLElBQUksQ0FBQyxFQUFFO3dCQUNoQyxxQkFBcUI7d0JB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LFVBQVUsQ0FBQyxDQUFDO3FCQUN6Qjt5QkFBTSxJQUFJLGNBQWMsWUFBWSx3Q0FBc0IsRUFBRTt3QkFDM0QsSUFBTSxrQkFBa0IsR0FBRyxjQUFjLENBQUMsVUFBVSxDQUFDO3dCQUNyRCxJQUFJLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxrQkFBa0IsQ0FBQyxFQUFFOzRCQUN4QyxXQUFXLENBQUMsR0FBRyxDQUFDLGtCQUFrQixDQUFDLENBQUM7NEJBQ3BDLElBQUksQ0FBQyw4QkFBOEIsQ0FDL0Isa0JBQWtCLEVBQUUsWUFBWSxFQUFFLE9BQU8sRUFBRSxXQUFXLEVBQUUsV0FBVyxDQUFDLENBQUM7eUJBQzFFO3FCQUNGO3lCQUFNLElBQUksY0FBYyxZQUFZLG9DQUFrQixFQUFFO3dCQUN2RCxXQUFXLENBQUMsR0FBRyxDQUFDLGNBQWMsQ0FBQyxVQUFVLENBQUMsQ0FBQztxQkFDNUM7eUJBQU07d0JBQ0wsWUFBWSxDQUFDLEdBQUcsQ0FBQyxjQUFjLENBQUMsY0FBYyxDQUFDLENBQUM7cUJBQ2pEO2lCQUNGOzs7Ozs7Ozs7UUFDSCxDQUFDO1FBRUQ7Ozs7Ozs7OztXQVNHO1FBQ0ssZ0RBQWUsR0FBdkIsVUFBd0IsTUFBYyxJQUFhLE9BQU8sZUFBZSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDM0YsNkJBQUM7SUFBRCxDQUFDLEFBM0dELENBQTRDLG9DQUFrQixHQTJHN0Q7SUEzR1ksd0RBQXNCIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuaW1wb3J0ICogYXMgdHMgZnJvbSAndHlwZXNjcmlwdCc7XG5pbXBvcnQge0Fic29sdXRlRnNQYXRofSBmcm9tICcuLi8uLi8uLi9zcmMvbmd0c2MvZmlsZV9zeXN0ZW0nO1xuaW1wb3J0IHtSZXF1aXJlQ2FsbCwgaXNSZWV4cG9ydFN0YXRlbWVudCwgaXNSZXF1aXJlQ2FsbH0gZnJvbSAnLi4vaG9zdC9jb21tb25qc191bWRfdXRpbHMnO1xuaW1wb3J0IHtEZXBlbmRlbmN5SG9zdEJhc2V9IGZyb20gJy4vZGVwZW5kZW5jeV9ob3N0JztcbmltcG9ydCB7UmVzb2x2ZWREZWVwSW1wb3J0LCBSZXNvbHZlZFJlbGF0aXZlTW9kdWxlfSBmcm9tICcuL21vZHVsZV9yZXNvbHZlcic7XG5cbi8qKlxuICogSGVscGVyIGZ1bmN0aW9ucyBmb3IgY29tcHV0aW5nIGRlcGVuZGVuY2llcy5cbiAqL1xuZXhwb3J0IGNsYXNzIENvbW1vbkpzRGVwZW5kZW5jeUhvc3QgZXh0ZW5kcyBEZXBlbmRlbmN5SG9zdEJhc2Uge1xuICAvKipcbiAgICogQ29tcHV0ZSB0aGUgZGVwZW5kZW5jaWVzIG9mIHRoZSBnaXZlbiBmaWxlLlxuICAgKlxuICAgKiBAcGFyYW0gZmlsZSBBbiBhYnNvbHV0ZSBwYXRoIHRvIHRoZSBmaWxlIHdob3NlIGRlcGVuZGVuY2llcyB3ZSB3YW50IHRvIGdldC5cbiAgICogQHBhcmFtIGRlcGVuZGVuY2llcyBBIHNldCB0aGF0IHdpbGwgaGF2ZSB0aGUgYWJzb2x1dGUgcGF0aHMgb2YgcmVzb2x2ZWQgZW50cnkgcG9pbnRzIGFkZGVkIHRvXG4gICAqIGl0LlxuICAgKiBAcGFyYW0gbWlzc2luZyBBIHNldCB0aGF0IHdpbGwgaGF2ZSB0aGUgZGVwZW5kZW5jaWVzIHRoYXQgY291bGQgbm90IGJlIGZvdW5kIGFkZGVkIHRvIGl0LlxuICAgKiBAcGFyYW0gZGVlcEltcG9ydHMgQSBzZXQgdGhhdCB3aWxsIGhhdmUgdGhlIGltcG9ydCBwYXRocyB0aGF0IGV4aXN0IGJ1dCBjYW5ub3QgYmUgbWFwcGVkIHRvXG4gICAqIGVudHJ5LXBvaW50cywgaS5lLiBkZWVwLWltcG9ydHMuXG4gICAqIEBwYXJhbSBhbHJlYWR5U2VlbiBBIHNldCB0aGF0IGlzIHVzZWQgdG8gdHJhY2sgaW50ZXJuYWwgZGVwZW5kZW5jaWVzIHRvIHByZXZlbnQgZ2V0dGluZyBzdHVja1xuICAgKiBpbiBhIGNpcmN1bGFyIGRlcGVuZGVuY3kgbG9vcC5cbiAgICovXG4gIHByb3RlY3RlZCByZWN1cnNpdmVseUNvbGxlY3REZXBlbmRlbmNpZXMoXG4gICAgICBmaWxlOiBBYnNvbHV0ZUZzUGF0aCwgZGVwZW5kZW5jaWVzOiBTZXQ8QWJzb2x1dGVGc1BhdGg+LCBtaXNzaW5nOiBTZXQ8c3RyaW5nPixcbiAgICAgIGRlZXBJbXBvcnRzOiBTZXQ8QWJzb2x1dGVGc1BhdGg+LCBhbHJlYWR5U2VlbjogU2V0PEFic29sdXRlRnNQYXRoPik6IHZvaWQge1xuICAgIGNvbnN0IGZyb21Db250ZW50cyA9IHRoaXMuZnMucmVhZEZpbGUoZmlsZSk7XG5cbiAgICBpZiAoIXRoaXMuaGFzUmVxdWlyZUNhbGxzKGZyb21Db250ZW50cykpIHtcbiAgICAgIC8vIEF2b2lkIHBhcnNpbmcgdGhlIHNvdXJjZSBmaWxlIGFzIHRoZXJlIGFyZSBubyBpbXBvcnRzLlxuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIFBhcnNlIHRoZSBzb3VyY2UgaW50byBhIFR5cGVTY3JpcHQgQVNUIGFuZCB0aGVuIHdhbGsgaXQgbG9va2luZyBmb3IgaW1wb3J0cyBhbmQgcmUtZXhwb3J0cy5cbiAgICBjb25zdCBzZiA9XG4gICAgICAgIHRzLmNyZWF0ZVNvdXJjZUZpbGUoZmlsZSwgZnJvbUNvbnRlbnRzLCB0cy5TY3JpcHRUYXJnZXQuRVMyMDE1LCBmYWxzZSwgdHMuU2NyaXB0S2luZC5KUyk7XG4gICAgY29uc3QgcmVxdWlyZUNhbGxzOiBSZXF1aXJlQ2FsbFtdID0gW107XG5cbiAgICBmb3IgKGNvbnN0IHN0bXQgb2Ygc2Yuc3RhdGVtZW50cykge1xuICAgICAgaWYgKHRzLmlzVmFyaWFibGVTdGF0ZW1lbnQoc3RtdCkpIHtcbiAgICAgICAgLy8gUmVndWxhciBpbXBvcnQocyk6XG4gICAgICAgIC8vIGB2YXIgZm9vID0gcmVxdWlyZSgnLi4uJylgIG9yIGB2YXIgZm9vID0gcmVxdWlyZSgnLi4uJyksIGJhciA9IHJlcXVpcmUoJy4uLicpYFxuICAgICAgICBjb25zdCBkZWNsYXJhdGlvbnMgPSBzdG10LmRlY2xhcmF0aW9uTGlzdC5kZWNsYXJhdGlvbnM7XG4gICAgICAgIGZvciAoY29uc3QgZGVjbGFyYXRpb24gb2YgZGVjbGFyYXRpb25zKSB7XG4gICAgICAgICAgaWYgKChkZWNsYXJhdGlvbi5pbml0aWFsaXplciAhPT0gdW5kZWZpbmVkKSAmJiBpc1JlcXVpcmVDYWxsKGRlY2xhcmF0aW9uLmluaXRpYWxpemVyKSkge1xuICAgICAgICAgICAgcmVxdWlyZUNhbGxzLnB1c2goZGVjbGFyYXRpb24uaW5pdGlhbGl6ZXIpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSBlbHNlIGlmICh0cy5pc0V4cHJlc3Npb25TdGF0ZW1lbnQoc3RtdCkpIHtcbiAgICAgICAgaWYgKGlzUmVxdWlyZUNhbGwoc3RtdC5leHByZXNzaW9uKSkge1xuICAgICAgICAgIC8vIEltcG9ydCBmb3IgdGhlIHNpZGUtZWZmZWN0cyBvbmx5OlxuICAgICAgICAgIC8vIGByZXF1aXJlKCcuLi4nKWBcbiAgICAgICAgICByZXF1aXJlQ2FsbHMucHVzaChzdG10LmV4cHJlc3Npb24pO1xuICAgICAgICB9IGVsc2UgaWYgKGlzUmVleHBvcnRTdGF0ZW1lbnQoc3RtdCkpIHtcbiAgICAgICAgICAvLyBSZS1leHBvcnQgaW4gb25lIG9mIHRoZSBmb2xsb3dpbmcgZm9ybWF0czpcbiAgICAgICAgICAvLyAtIGBfX2V4cG9ydChyZXF1aXJlKCcuLi4nKSlgXG4gICAgICAgICAgLy8gLSBgX19leHBvcnQoPGlkZW50aWZpZXI+KWBcbiAgICAgICAgICAvLyAtIGB0c2xpYl8xLl9fZXhwb3J0U3RhcihyZXF1aXJlKCcuLi4nKSwgZXhwb3J0cylgXG4gICAgICAgICAgLy8gLSBgdHNsaWJfMS5fX2V4cG9ydFN0YXIoPGlkZW50aWZpZXI+LCBleHBvcnRzKWBcbiAgICAgICAgICBjb25zdCBmaXJzdEV4cG9ydEFyZyA9IHN0bXQuZXhwcmVzc2lvbi5hcmd1bWVudHNbMF07XG5cbiAgICAgICAgICBpZiAoaXNSZXF1aXJlQ2FsbChmaXJzdEV4cG9ydEFyZykpIHtcbiAgICAgICAgICAgIC8vIFJlLWV4cG9ydCB3aXRoIGByZXF1aXJlKClgIGNhbGw6XG4gICAgICAgICAgICAvLyBgX19leHBvcnQocmVxdWlyZSgnLi4uJykpYCBvciBgdHNsaWJfMS5fX2V4cG9ydFN0YXIocmVxdWlyZSgnLi4uJyksIGV4cG9ydHMpYFxuICAgICAgICAgICAgcmVxdWlyZUNhbGxzLnB1c2goZmlyc3RFeHBvcnRBcmcpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIGlmIChcbiAgICAgICAgICAgIHRzLmlzQmluYXJ5RXhwcmVzc2lvbihzdG10LmV4cHJlc3Npb24pICYmXG4gICAgICAgICAgICAoc3RtdC5leHByZXNzaW9uLm9wZXJhdG9yVG9rZW4ua2luZCA9PT0gdHMuU3ludGF4S2luZC5FcXVhbHNUb2tlbikpIHtcbiAgICAgICAgICBpZiAoaXNSZXF1aXJlQ2FsbChzdG10LmV4cHJlc3Npb24ucmlnaHQpKSB7XG4gICAgICAgICAgICAvLyBJbXBvcnQgd2l0aCBhc3NpZ25tZW50LiBFLmcuOlxuICAgICAgICAgICAgLy8gYGV4cG9ydHMuZm9vID0gcmVxdWlyZSgnLi4uJylgXG4gICAgICAgICAgICByZXF1aXJlQ2FsbHMucHVzaChzdG10LmV4cHJlc3Npb24ucmlnaHQpO1xuICAgICAgICAgIH0gZWxzZSBpZiAodHMuaXNPYmplY3RMaXRlcmFsRXhwcmVzc2lvbihzdG10LmV4cHJlc3Npb24ucmlnaHQpKSB7XG4gICAgICAgICAgICAvLyBJbXBvcnQgaW4gb2JqZWN0IGxpdGVyYWwuIEUuZy46XG4gICAgICAgICAgICAvLyBgbW9kdWxlLmV4cG9ydHMgPSB7Zm9vOiByZXF1aXJlKCcuLi4nKX1gXG4gICAgICAgICAgICBzdG10LmV4cHJlc3Npb24ucmlnaHQucHJvcGVydGllcy5mb3JFYWNoKHByb3AgPT4ge1xuICAgICAgICAgICAgICBpZiAodHMuaXNQcm9wZXJ0eUFzc2lnbm1lbnQocHJvcCkgJiYgaXNSZXF1aXJlQ2FsbChwcm9wLmluaXRpYWxpemVyKSkge1xuICAgICAgICAgICAgICAgIHJlcXVpcmVDYWxscy5wdXNoKHByb3AuaW5pdGlhbGl6ZXIpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBjb25zdCBpbXBvcnRQYXRocyA9IG5ldyBTZXQocmVxdWlyZUNhbGxzLm1hcChjYWxsID0+IGNhbGwuYXJndW1lbnRzWzBdLnRleHQpKTtcbiAgICBmb3IgKGNvbnN0IGltcG9ydFBhdGggb2YgaW1wb3J0UGF0aHMpIHtcbiAgICAgIGNvbnN0IHJlc29sdmVkTW9kdWxlID0gdGhpcy5tb2R1bGVSZXNvbHZlci5yZXNvbHZlTW9kdWxlSW1wb3J0KGltcG9ydFBhdGgsIGZpbGUpO1xuICAgICAgaWYgKHJlc29sdmVkTW9kdWxlID09PSBudWxsKSB7XG4gICAgICAgIG1pc3NpbmcuYWRkKGltcG9ydFBhdGgpO1xuICAgICAgfSBlbHNlIGlmIChyZXNvbHZlZE1vZHVsZSBpbnN0YW5jZW9mIFJlc29sdmVkUmVsYXRpdmVNb2R1bGUpIHtcbiAgICAgICAgY29uc3QgaW50ZXJuYWxEZXBlbmRlbmN5ID0gcmVzb2x2ZWRNb2R1bGUubW9kdWxlUGF0aDtcbiAgICAgICAgaWYgKCFhbHJlYWR5U2Vlbi5oYXMoaW50ZXJuYWxEZXBlbmRlbmN5KSkge1xuICAgICAgICAgIGFscmVhZHlTZWVuLmFkZChpbnRlcm5hbERlcGVuZGVuY3kpO1xuICAgICAgICAgIHRoaXMucmVjdXJzaXZlbHlDb2xsZWN0RGVwZW5kZW5jaWVzKFxuICAgICAgICAgICAgICBpbnRlcm5hbERlcGVuZGVuY3ksIGRlcGVuZGVuY2llcywgbWlzc2luZywgZGVlcEltcG9ydHMsIGFscmVhZHlTZWVuKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIGlmIChyZXNvbHZlZE1vZHVsZSBpbnN0YW5jZW9mIFJlc29sdmVkRGVlcEltcG9ydCkge1xuICAgICAgICBkZWVwSW1wb3J0cy5hZGQocmVzb2x2ZWRNb2R1bGUuaW1wb3J0UGF0aCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBkZXBlbmRlbmNpZXMuYWRkKHJlc29sdmVkTW9kdWxlLmVudHJ5UG9pbnRQYXRoKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQ2hlY2sgd2hldGhlciBhIHNvdXJjZSBmaWxlIG5lZWRzIHRvIGJlIHBhcnNlZCBmb3IgaW1wb3J0cy5cbiAgICogVGhpcyBpcyBhIHBlcmZvcm1hbmNlIHNob3J0LWNpcmN1aXQsIHdoaWNoIHNhdmVzIHVzIGZyb20gY3JlYXRpbmdcbiAgICogYSBUeXBlU2NyaXB0IEFTVCB1bm5lY2Vzc2FyaWx5LlxuICAgKlxuICAgKiBAcGFyYW0gc291cmNlIFRoZSBjb250ZW50IG9mIHRoZSBzb3VyY2UgZmlsZSB0byBjaGVjay5cbiAgICpcbiAgICogQHJldHVybnMgZmFsc2UgaWYgdGhlcmUgYXJlIGRlZmluaXRlbHkgbm8gcmVxdWlyZSBjYWxsc1xuICAgKiBpbiB0aGlzIGZpbGUsIHRydWUgb3RoZXJ3aXNlLlxuICAgKi9cbiAgcHJpdmF0ZSBoYXNSZXF1aXJlQ2FsbHMoc291cmNlOiBzdHJpbmcpOiBib29sZWFuIHsgcmV0dXJuIC9yZXF1aXJlXFwoWydcIl0vLnRlc3Qoc291cmNlKTsgfVxufVxuIl19