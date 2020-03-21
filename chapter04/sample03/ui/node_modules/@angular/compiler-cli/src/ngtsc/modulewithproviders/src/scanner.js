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
        define("@angular/compiler-cli/src/ngtsc/modulewithproviders/src/scanner", ["require", "exports", "tslib", "@angular/compiler", "typescript", "@angular/compiler-cli/src/ngtsc/imports"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var tslib_1 = require("tslib");
    var compiler_1 = require("@angular/compiler");
    var ts = require("typescript");
    var imports_1 = require("@angular/compiler-cli/src/ngtsc/imports");
    var ModuleWithProvidersScanner = /** @class */ (function () {
        function ModuleWithProvidersScanner(host, evaluator, emitter) {
            this.host = host;
            this.evaluator = evaluator;
            this.emitter = emitter;
        }
        ModuleWithProvidersScanner.prototype.scan = function (sf, dts) {
            var e_1, _a;
            try {
                for (var _b = tslib_1.__values(sf.statements), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var stmt = _c.value;
                    this.visitStatement(dts, stmt);
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_1) throw e_1.error; }
            }
        };
        ModuleWithProvidersScanner.prototype.visitStatement = function (dts, stmt) {
            var e_2, _a;
            // Detect whether a statement is exported, which is used as one of the hints whether to look
            // more closely at possible MWP functions within. This is a syntactic check, not a semantic
            // check, so it won't detect cases like:
            //
            // var X = ...;
            // export {X}
            //
            // This is intentional, because the alternative is slow and this will catch 99% of the cases we
            // need to handle.
            var isExported = stmt.modifiers !== undefined &&
                stmt.modifiers.some(function (mod) { return mod.kind === ts.SyntaxKind.ExportKeyword; });
            if (!isExported) {
                return;
            }
            if (ts.isClassDeclaration(stmt)) {
                try {
                    for (var _b = tslib_1.__values(stmt.members), _c = _b.next(); !_c.done; _c = _b.next()) {
                        var member = _c.value;
                        if (!ts.isMethodDeclaration(member) || !isStatic(member)) {
                            continue;
                        }
                        this.visitFunctionOrMethodDeclaration(dts, member);
                    }
                }
                catch (e_2_1) { e_2 = { error: e_2_1 }; }
                finally {
                    try {
                        if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                    }
                    finally { if (e_2) throw e_2.error; }
                }
            }
            else if (ts.isFunctionDeclaration(stmt)) {
                this.visitFunctionOrMethodDeclaration(dts, stmt);
            }
        };
        ModuleWithProvidersScanner.prototype.visitFunctionOrMethodDeclaration = function (dts, decl) {
            // First, some sanity. This should have a method body with a single return statement.
            if (decl.body === undefined || decl.body.statements.length !== 1) {
                return;
            }
            var retStmt = decl.body.statements[0];
            if (!ts.isReturnStatement(retStmt) || retStmt.expression === undefined) {
                return;
            }
            var retValue = retStmt.expression;
            // Now, look at the return type of the method. Maybe bail if the type is already marked, or if
            // it's incompatible with a MWP function.
            var returnType = this.returnTypeOf(decl);
            if (returnType === ReturnType.OTHER || returnType === ReturnType.MWP_WITH_TYPE) {
                // Don't process this declaration, it either already declares the right return type, or an
                // incompatible one.
                return;
            }
            var value = this.evaluator.evaluate(retValue);
            if (!(value instanceof Map) || !value.has('ngModule')) {
                // The return value does not provide sufficient information to be able to add a generic type.
                return;
            }
            if (returnType === ReturnType.INFERRED && !isModuleWithProvidersType(value)) {
                // The return type is inferred but the returned object is not of the correct shape, so we
                // shouldn's modify the return type to become `ModuleWithProviders`.
                return;
            }
            // The return type has been verified to represent the `ModuleWithProviders` type, but either the
            // return type is inferred or the generic type argument is missing. In both cases, a new return
            // type is created where the `ngModule` type is included as generic type argument.
            var ngModule = value.get('ngModule');
            if (!(ngModule instanceof imports_1.Reference) || !ts.isClassDeclaration(ngModule.node)) {
                return;
            }
            var ngModuleExpr = this.emitter.emit(ngModule, decl.getSourceFile(), imports_1.ImportFlags.ForceNewImport);
            var ngModuleType = new compiler_1.ExpressionType(ngModuleExpr);
            var mwpNgType = new compiler_1.ExpressionType(new compiler_1.ExternalExpr(compiler_1.R3Identifiers.ModuleWithProviders), /* modifiers */ null, [ngModuleType]);
            dts.addTypeReplacement(decl, mwpNgType);
        };
        ModuleWithProvidersScanner.prototype.returnTypeOf = function (decl) {
            if (decl.type === undefined) {
                return ReturnType.INFERRED;
            }
            else if (!ts.isTypeReferenceNode(decl.type)) {
                return ReturnType.OTHER;
            }
            // Try to figure out if the type is of a familiar form, something that looks like it was
            // imported.
            var typeId;
            if (ts.isIdentifier(decl.type.typeName)) {
                // def: ModuleWithProviders
                typeId = decl.type.typeName;
            }
            else if (ts.isQualifiedName(decl.type.typeName) && ts.isIdentifier(decl.type.typeName.left)) {
                // def: i0.ModuleWithProviders
                typeId = decl.type.typeName.right;
            }
            else {
                return ReturnType.OTHER;
            }
            var importDecl = this.host.getImportOfIdentifier(typeId);
            if (importDecl === null || importDecl.from !== '@angular/core' ||
                importDecl.name !== 'ModuleWithProviders') {
                return ReturnType.OTHER;
            }
            if (decl.type.typeArguments === undefined || decl.type.typeArguments.length === 0) {
                // The return type is indeed ModuleWithProviders, but no generic type parameter was found.
                return ReturnType.MWP_NO_TYPE;
            }
            else {
                // The return type is ModuleWithProviders, and the user has already specified a generic type.
                return ReturnType.MWP_WITH_TYPE;
            }
        };
        return ModuleWithProvidersScanner;
    }());
    exports.ModuleWithProvidersScanner = ModuleWithProvidersScanner;
    var ReturnType;
    (function (ReturnType) {
        ReturnType[ReturnType["INFERRED"] = 0] = "INFERRED";
        ReturnType[ReturnType["MWP_NO_TYPE"] = 1] = "MWP_NO_TYPE";
        ReturnType[ReturnType["MWP_WITH_TYPE"] = 2] = "MWP_WITH_TYPE";
        ReturnType[ReturnType["OTHER"] = 3] = "OTHER";
    })(ReturnType || (ReturnType = {}));
    /** Whether the resolved value map represents a ModuleWithProviders object */
    function isModuleWithProvidersType(value) {
        var ngModule = value.has('ngModule');
        var providers = value.has('providers');
        return ngModule && (value.size === 1 || (providers && value.size === 2));
    }
    function isStatic(node) {
        return node.modifiers !== undefined &&
            node.modifiers.some(function (mod) { return mod.kind === ts.SyntaxKind.StaticKeyword; });
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2Nhbm5lci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbXBpbGVyLWNsaS9zcmMvbmd0c2MvbW9kdWxld2l0aHByb3ZpZGVycy9zcmMvc2Nhbm5lci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7Ozs7Ozs7Ozs7Ozs7SUFFSCw4Q0FBbUc7SUFDbkcsK0JBQWlDO0lBRWpDLG1FQUF1RTtJQU12RTtRQUNFLG9DQUNZLElBQW9CLEVBQVUsU0FBMkIsRUFDekQsT0FBeUI7WUFEekIsU0FBSSxHQUFKLElBQUksQ0FBZ0I7WUFBVSxjQUFTLEdBQVQsU0FBUyxDQUFrQjtZQUN6RCxZQUFPLEdBQVAsT0FBTyxDQUFrQjtRQUFHLENBQUM7UUFFekMseUNBQUksR0FBSixVQUFLLEVBQWlCLEVBQUUsR0FBZTs7O2dCQUNyQyxLQUFtQixJQUFBLEtBQUEsaUJBQUEsRUFBRSxDQUFDLFVBQVUsQ0FBQSxnQkFBQSw0QkFBRTtvQkFBN0IsSUFBTSxJQUFJLFdBQUE7b0JBQ2IsSUFBSSxDQUFDLGNBQWMsQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLENBQUM7aUJBQ2hDOzs7Ozs7Ozs7UUFDSCxDQUFDO1FBRU8sbURBQWMsR0FBdEIsVUFBdUIsR0FBZSxFQUFFLElBQWtCOztZQUN4RCw0RkFBNEY7WUFDNUYsMkZBQTJGO1lBQzNGLHdDQUF3QztZQUN4QyxFQUFFO1lBQ0YsZUFBZTtZQUNmLGFBQWE7WUFDYixFQUFFO1lBQ0YsK0ZBQStGO1lBQy9GLGtCQUFrQjtZQUNsQixJQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsU0FBUyxLQUFLLFNBQVM7Z0JBQzNDLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLFVBQUEsR0FBRyxJQUFJLE9BQUEsR0FBRyxDQUFDLElBQUksS0FBSyxFQUFFLENBQUMsVUFBVSxDQUFDLGFBQWEsRUFBeEMsQ0FBd0MsQ0FBQyxDQUFDO1lBRXpF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bnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0V4cHJlc3Npb25UeXBlLCBFeHRlcm5hbEV4cHIsIFIzSWRlbnRpZmllcnMgYXMgSWRlbnRpZmllcnMsIFR5cGV9IGZyb20gJ0Bhbmd1bGFyL2NvbXBpbGVyJztcbmltcG9ydCAqIGFzIHRzIGZyb20gJ3R5cGVzY3JpcHQnO1xuXG5pbXBvcnQge0ltcG9ydEZsYWdzLCBSZWZlcmVuY2UsIFJlZmVyZW5jZUVtaXR0ZXJ9IGZyb20gJy4uLy4uL2ltcG9ydHMnO1xuaW1wb3J0IHtQYXJ0aWFsRXZhbHVhdG9yLCBSZXNvbHZlZFZhbHVlTWFwfSBmcm9tICcuLi8uLi9wYXJ0aWFsX2V2YWx1YXRvcic7XG5pbXBvcnQge1JlZmxlY3Rpb25Ib3N0fSBmcm9tICcuLi8uLi9yZWZsZWN0aW9uJztcblxuZXhwb3J0IGludGVyZmFjZSBEdHNIYW5kbGVyIHsgYWRkVHlwZVJlcGxhY2VtZW50KG5vZGU6IHRzLkRlY2xhcmF0aW9uLCB0eXBlOiBUeXBlKTogdm9pZDsgfVxuXG5leHBvcnQgY2xhc3MgTW9kdWxlV2l0aFByb3ZpZGVyc1NjYW5uZXIge1xuICBjb25zdHJ1Y3RvcihcbiAgICAgIHByaXZhdGUgaG9zdDogUmVmbGVjdGlvbkhvc3QsIHByaXZhdGUgZXZhbHVhdG9yOiBQYXJ0aWFsRXZhbHVhdG9yLFxuICAgICAgcHJpdmF0ZSBlbWl0dGVyOiBSZWZlcmVuY2VFbWl0dGVyKSB7fVxuXG4gIHNjYW4oc2Y6IHRzLlNvdXJjZUZpbGUsIGR0czogRHRzSGFuZGxlcik6IHZvaWQge1xuICAgIGZvciAoY29uc3Qgc3RtdCBvZiBzZi5zdGF0ZW1lbnRzKSB7XG4gICAgICB0aGlzLnZpc2l0U3RhdGVtZW50KGR0cywgc3RtdCk7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSB2aXNpdFN0YXRlbWVudChkdHM6IER0c0hhbmRsZXIsIHN0bXQ6IHRzLlN0YXRlbWVudCk6IHZvaWQge1xuICAgIC8vIERldGVjdCB3aGV0aGVyIGEgc3RhdGVtZW50IGlzIGV4cG9ydGVkLCB3aGljaCBpcyB1c2VkIGFzIG9uZSBvZiB0aGUgaGludHMgd2hldGhlciB0byBsb29rXG4gICAgLy8gbW9yZSBjbG9zZWx5IGF0IHBvc3NpYmxlIE1XUCBmdW5jdGlvbnMgd2l0aGluLiBUaGlzIGlzIGEgc3ludGFjdGljIGNoZWNrLCBub3QgYSBzZW1hbnRpY1xuICAgIC8vIGNoZWNrLCBzbyBpdCB3b24ndCBkZXRlY3QgY2FzZXMgbGlrZTpcbiAgICAvL1xuICAgIC8vIHZhciBYID0gLi4uO1xuICAgIC8vIGV4cG9ydCB7WH1cbiAgICAvL1xuICAgIC8vIFRoaXMgaXMgaW50ZW50aW9uYWwsIGJlY2F1c2UgdGhlIGFsdGVybmF0aXZlIGlzIHNsb3cgYW5kIHRoaXMgd2lsbCBjYXRjaCA5OSUgb2YgdGhlIGNhc2VzIHdlXG4gICAgLy8gbmVlZCB0byBoYW5kbGUuXG4gICAgY29uc3QgaXNFeHBvcnRlZCA9IHN0bXQubW9kaWZpZXJzICE9PSB1bmRlZmluZWQgJiZcbiAgICAgICAgc3RtdC5tb2RpZmllcnMuc29tZShtb2QgPT4gbW9kLmtpbmQgPT09IHRzLlN5bnRheEtpbmQuRXhwb3J0S2V5d29yZCk7XG5cbiAgICBpZiAoIWlzRXhwb3J0ZWQpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZiAodHMuaXNDbGFzc0RlY2xhcmF0aW9uKHN0bXQpKSB7XG4gICAgICBmb3IgKGNvbnN0IG1lbWJlciBvZiBzdG10Lm1lbWJlcnMpIHtcbiAgICAgICAgaWYgKCF0cy5pc01ldGhvZERlY2xhcmF0aW9uKG1lbWJlcikgfHwgIWlzU3RhdGljKG1lbWJlcikpIHtcbiAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMudmlzaXRGdW5jdGlvbk9yTWV0aG9kRGVjbGFyYXRpb24oZHRzLCBtZW1iZXIpO1xuICAgICAgfVxuICAgIH0gZWxzZSBpZiAodHMuaXNGdW5jdGlvbkRlY2xhcmF0aW9uKHN0bXQpKSB7XG4gICAgICB0aGlzLnZpc2l0RnVuY3Rpb25Pck1ldGhvZERlY2xhcmF0aW9uKGR0cywgc3RtdCk7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSB2aXNpdEZ1bmN0aW9uT3JNZXRob2REZWNsYXJhdGlvbihcbiAgICAgIGR0czogRHRzSGFuZGxlciwgZGVjbDogdHMuTWV0aG9kRGVjbGFyYXRpb258dHMuRnVuY3Rpb25EZWNsYXJhdGlvbik6IHZvaWQge1xuICAgIC8vIEZpcnN0LCBzb21lIHNhbml0eS4gVGhpcyBzaG91bGQgaGF2ZSBhIG1ldGhvZCBib2R5IHdpdGggYSBzaW5nbGUgcmV0dXJuIHN0YXRlbWVudC5cbiAgICBpZiAoZGVjbC5ib2R5ID09PSB1bmRlZmluZWQgfHwgZGVjbC5ib2R5LnN0YXRlbWVudHMubGVuZ3RoICE9PSAxKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGNvbnN0IHJldFN0bXQgPSBkZWNsLmJvZHkuc3RhdGVtZW50c1swXTtcbiAgICBpZiAoIXRzLmlzUmV0dXJuU3RhdGVtZW50KHJldFN0bXQpIHx8IHJldFN0bXQuZXhwcmVzc2lvbiA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGNvbnN0IHJldFZhbHVlID0gcmV0U3RtdC5leHByZXNzaW9uO1xuXG4gICAgLy8gTm93LCBsb29rIGF0IHRoZSByZXR1cm4gdHlwZSBvZiB0aGUgbWV0aG9kLiBNYXliZSBiYWlsIGlmIHRoZSB0eXBlIGlzIGFscmVhZHkgbWFya2VkLCBvciBpZlxuICAgIC8vIGl0J3MgaW5jb21wYXRpYmxlIHdpdGggYSBNV1AgZnVuY3Rpb24uXG4gICAgY29uc3QgcmV0dXJuVHlwZSA9IHRoaXMucmV0dXJuVHlwZU9mKGRlY2wpO1xuICAgIGlmIChyZXR1cm5UeXBlID09PSBSZXR1cm5UeXBlLk9USEVSIHx8IHJldHVyblR5cGUgPT09IFJldHVyblR5cGUuTVdQX1dJVEhfVFlQRSkge1xuICAgICAgLy8gRG9uJ3QgcHJvY2VzcyB0aGlzIGRlY2xhcmF0aW9uLCBpdCBlaXRoZXIgYWxyZWFkeSBkZWNsYXJlcyB0aGUgcmlnaHQgcmV0dXJuIHR5cGUsIG9yIGFuXG4gICAgICAvLyBpbmNvbXBhdGlibGUgb25lLlxuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IHZhbHVlID0gdGhpcy5ldmFsdWF0b3IuZXZhbHVhdGUocmV0VmFsdWUpO1xuICAgIGlmICghKHZhbHVlIGluc3RhbmNlb2YgTWFwKSB8fCAhdmFsdWUuaGFzKCduZ01vZHVsZScpKSB7XG4gICAgICAvLyBUaGUgcmV0dXJuIHZhbHVlIGRvZXMgbm90IHByb3ZpZGUgc3VmZmljaWVudCBpbmZvcm1hdGlvbiB0byBiZSBhYmxlIHRvIGFkZCBhIGdlbmVyaWMgdHlwZS5cbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZiAocmV0dXJuVHlwZSA9PT0gUmV0dXJuVHlwZS5JTkZFUlJFRCAmJiAhaXNNb2R1bGVXaXRoUHJvdmlkZXJzVHlwZSh2YWx1ZSkpIHtcbiAgICAgIC8vIFRoZSByZXR1cm4gdHlwZSBpcyBpbmZlcnJlZCBidXQgdGhlIHJldHVybmVkIG9iamVjdCBpcyBub3Qgb2YgdGhlIGNvcnJlY3Qgc2hhcGUsIHNvIHdlXG4gICAgICAvLyBzaG91bGRuJ3MgbW9kaWZ5IHRoZSByZXR1cm4gdHlwZSB0byBiZWNvbWUgYE1vZHVsZVdpdGhQcm92aWRlcnNgLlxuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIFRoZSByZXR1cm4gdHlwZSBoYXMgYmVlbiB2ZXJpZmllZCB0byByZXByZXNlbnQgdGhlIGBNb2R1bGVXaXRoUHJvdmlkZXJzYCB0eXBlLCBidXQgZWl0aGVyIHRoZVxuICAgIC8vIHJldHVybiB0eXBlIGlzIGluZmVycmVkIG9yIHRoZSBnZW5lcmljIHR5cGUgYXJndW1lbnQgaXMgbWlzc2luZy4gSW4gYm90aCBjYXNlcywgYSBuZXcgcmV0dXJuXG4gICAgLy8gdHlwZSBpcyBjcmVhdGVkIHdoZXJlIHRoZSBgbmdNb2R1bGVgIHR5cGUgaXMgaW5jbHVkZWQgYXMgZ2VuZXJpYyB0eXBlIGFyZ3VtZW50LlxuICAgIGNvbnN0IG5nTW9kdWxlID0gdmFsdWUuZ2V0KCduZ01vZHVsZScpO1xuICAgIGlmICghKG5nTW9kdWxlIGluc3RhbmNlb2YgUmVmZXJlbmNlKSB8fCAhdHMuaXNDbGFzc0RlY2xhcmF0aW9uKG5nTW9kdWxlLm5vZGUpKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3QgbmdNb2R1bGVFeHByID1cbiAgICAgICAgdGhpcy5lbWl0dGVyLmVtaXQobmdNb2R1bGUsIGRlY2wuZ2V0U291cmNlRmlsZSgpLCBJbXBvcnRGbGFncy5Gb3JjZU5ld0ltcG9ydCk7XG4gICAgY29uc3QgbmdNb2R1bGVUeXBlID0gbmV3IEV4cHJlc3Npb25UeXBlKG5nTW9kdWxlRXhwcik7XG4gICAgY29uc3QgbXdwTmdUeXBlID0gbmV3IEV4cHJlc3Npb25UeXBlKFxuICAgICAgICBuZXcgRXh0ZXJuYWxFeHByKElkZW50aWZpZXJzLk1vZHVsZVdpdGhQcm92aWRlcnMpLCAvKiBtb2RpZmllcnMgKi8gbnVsbCwgW25nTW9kdWxlVHlwZV0pO1xuXG4gICAgZHRzLmFkZFR5cGVSZXBsYWNlbWVudChkZWNsLCBtd3BOZ1R5cGUpO1xuICB9XG5cbiAgcHJpdmF0ZSByZXR1cm5UeXBlT2YoZGVjbDogdHMuRnVuY3Rpb25EZWNsYXJhdGlvbnx0cy5NZXRob2REZWNsYXJhdGlvbnxcbiAgICAgICAgICAgICAgICAgICAgICAgdHMuVmFyaWFibGVEZWNsYXJhdGlvbik6IFJldHVyblR5cGUge1xuICAgIGlmIChkZWNsLnR5cGUgPT09IHVuZGVmaW5lZCkge1xuICAgICAgcmV0dXJuIFJldHVyblR5cGUuSU5GRVJSRUQ7XG4gICAgfSBlbHNlIGlmICghdHMuaXNUeXBlUmVmZXJlbmNlTm9kZShkZWNsLnR5cGUpKSB7XG4gICAgICByZXR1cm4gUmV0dXJuVHlwZS5PVEhFUjtcbiAgICB9XG5cbiAgICAvLyBUcnkgdG8gZmlndXJlIG91dCBpZiB0aGUgdHlwZSBpcyBvZiBhIGZhbWlsaWFyIGZvcm0sIHNvbWV0aGluZyB0aGF0IGxvb2tzIGxpa2UgaXQgd2FzXG4gICAgLy8gaW1wb3J0ZWQuXG4gICAgbGV0IHR5cGVJZDogdHMuSWRlbnRpZmllcjtcbiAgICBpZiAodHMuaXNJZGVudGlmaWVyKGRlY2wudHlwZS50eXBlTmFtZSkpIHtcbiAgICAgIC8vIGRlZjogTW9kdWxlV2l0aFByb3ZpZGVyc1xuICAgICAgdHlwZUlkID0gZGVjbC50eXBlLnR5cGVOYW1lO1xuICAgIH0gZWxzZSBpZiAodHMuaXNRdWFsaWZpZWROYW1lKGRlY2wudHlwZS50eXBlTmFtZSkgJiYgdHMuaXNJZGVudGlmaWVyKGRlY2wudHlwZS50eXBlTmFtZS5sZWZ0KSkge1xuICAgICAgLy8gZGVmOiBpMC5Nb2R1bGVXaXRoUHJvdmlkZXJzXG4gICAgICB0eXBlSWQgPSBkZWNsLnR5cGUudHlwZU5hbWUucmlnaHQ7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBSZXR1cm5UeXBlLk9USEVSO1xuICAgIH1cblxuICAgIGNvbnN0IGltcG9ydERlY2wgPSB0aGlzLmhvc3QuZ2V0SW1wb3J0T2ZJZGVudGlmaWVyKHR5cGVJZCk7XG4gICAgaWYgKGltcG9ydERlY2wgPT09IG51bGwgfHwgaW1wb3J0RGVjbC5mcm9tICE9PSAnQGFuZ3VsYXIvY29yZScgfHxcbiAgICAgICAgaW1wb3J0RGVjbC5uYW1lICE9PSAnTW9kdWxlV2l0aFByb3ZpZGVycycpIHtcbiAgICAgIHJldHVybiBSZXR1cm5UeXBlLk9USEVSO1xuICAgIH1cblxuICAgIGlmIChkZWNsLnR5cGUudHlwZUFyZ3VtZW50cyA9PT0gdW5kZWZpbmVkIHx8IGRlY2wudHlwZS50eXBlQXJndW1lbnRzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgLy8gVGhlIHJldHVybiB0eXBlIGlzIGluZGVlZCBNb2R1bGVXaXRoUHJvdmlkZXJzLCBidXQgbm8gZ2VuZXJpYyB0eXBlIHBhcmFtZXRlciB3YXMgZm91bmQuXG4gICAgICByZXR1cm4gUmV0dXJuVHlwZS5NV1BfTk9fVFlQRTtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gVGhlIHJldHVybiB0eXBlIGlzIE1vZHVsZVdpdGhQcm92aWRlcnMsIGFuZCB0aGUgdXNlciBoYXMgYWxyZWFkeSBzcGVjaWZpZWQgYSBnZW5lcmljIHR5cGUuXG4gICAgICByZXR1cm4gUmV0dXJuVHlwZS5NV1BfV0lUSF9UWVBFO1xuICAgIH1cbiAgfVxufVxuXG5lbnVtIFJldHVyblR5cGUge1xuICBJTkZFUlJFRCxcbiAgTVdQX05PX1RZUEUsXG4gIE1XUF9XSVRIX1RZUEUsXG4gIE9USEVSLFxufVxuXG4vKiogV2hldGhlciB0aGUgcmVzb2x2ZWQgdmFsdWUgbWFwIHJlcHJlc2VudHMgYSBNb2R1bGVXaXRoUHJvdmlkZXJzIG9iamVjdCAqL1xuZnVuY3Rpb24gaXNNb2R1bGVXaXRoUHJvdmlkZXJzVHlwZSh2YWx1ZTogUmVzb2x2ZWRWYWx1ZU1hcCk6IGJvb2xlYW4ge1xuICBjb25zdCBuZ01vZHVsZSA9IHZhbHVlLmhhcygnbmdNb2R1bGUnKTtcbiAgY29uc3QgcHJvdmlkZXJzID0gdmFsdWUuaGFzKCdwcm92aWRlcnMnKTtcblxuICByZXR1cm4gbmdNb2R1bGUgJiYgKHZhbHVlLnNpemUgPT09IDEgfHwgKHByb3ZpZGVycyAmJiB2YWx1ZS5zaXplID09PSAyKSk7XG59XG5cbmZ1bmN0aW9uIGlzU3RhdGljKG5vZGU6IHRzLk5vZGUpOiBib29sZWFuIHtcbiAgcmV0dXJuIG5vZGUubW9kaWZpZXJzICE9PSB1bmRlZmluZWQgJiZcbiAgICAgIG5vZGUubW9kaWZpZXJzLnNvbWUobW9kID0+IG1vZC5raW5kID09PSB0cy5TeW50YXhLaW5kLlN0YXRpY0tleXdvcmQpO1xufVxuIl19