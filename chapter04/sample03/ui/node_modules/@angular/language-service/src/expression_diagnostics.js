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
        define("@angular/language-service/src/expression_diagnostics", ["require", "exports", "tslib", "@angular/compiler", "@angular/language-service/src/diagnostic_messages", "@angular/language-service/src/expression_type", "@angular/language-service/src/symbols", "@angular/language-service/src/utils"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var tslib_1 = require("tslib");
    var compiler_1 = require("@angular/compiler");
    var diagnostic_messages_1 = require("@angular/language-service/src/diagnostic_messages");
    var expression_type_1 = require("@angular/language-service/src/expression_type");
    var symbols_1 = require("@angular/language-service/src/symbols");
    var utils_1 = require("@angular/language-service/src/utils");
    function getTemplateExpressionDiagnostics(info) {
        var visitor = new ExpressionDiagnosticsVisitor(info, function (path) { return getExpressionScope(info, path); });
        compiler_1.templateVisitAll(visitor, info.templateAst);
        return visitor.diagnostics;
    }
    exports.getTemplateExpressionDiagnostics = getTemplateExpressionDiagnostics;
    function getReferences(info) {
        var result = [];
        function processReferences(references) {
            var e_1, _a;
            var _loop_1 = function (reference) {
                var type = undefined;
                if (reference.value) {
                    type = info.query.getTypeSymbol(compiler_1.tokenReference(reference.value));
                }
                result.push({
                    name: reference.name,
                    kind: 'reference',
                    type: type || info.query.getBuiltinType(symbols_1.BuiltinType.Any),
                    get definition() { return getDefinitionOf(info, reference); }
                });
            };
            try {
                for (var references_1 = tslib_1.__values(references), references_1_1 = references_1.next(); !references_1_1.done; references_1_1 = references_1.next()) {
                    var reference = references_1_1.value;
                    _loop_1(reference);
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (references_1_1 && !references_1_1.done && (_a = references_1.return)) _a.call(references_1);
                }
                finally { if (e_1) throw e_1.error; }
            }
        }
        var visitor = new /** @class */ (function (_super) {
            tslib_1.__extends(class_1, _super);
            function class_1() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            class_1.prototype.visitEmbeddedTemplate = function (ast, context) {
                _super.prototype.visitEmbeddedTemplate.call(this, ast, context);
                processReferences(ast.references);
            };
            class_1.prototype.visitElement = function (ast, context) {
                _super.prototype.visitElement.call(this, ast, context);
                processReferences(ast.references);
            };
            return class_1;
        }(compiler_1.RecursiveTemplateAstVisitor));
        compiler_1.templateVisitAll(visitor, info.templateAst);
        return result;
    }
    function getDefinitionOf(info, ast) {
        if (info.fileName) {
            var templateOffset = info.offset;
            return [{
                    fileName: info.fileName,
                    span: {
                        start: ast.sourceSpan.start.offset + templateOffset,
                        end: ast.sourceSpan.end.offset + templateOffset
                    }
                }];
        }
    }
    /**
     * Resolve all variable declarations in a template by traversing the specified
     * `path`.
     * @param info
     * @param path template AST path
     */
    function getVarDeclarations(info, path) {
        var e_2, _a;
        var results = [];
        for (var current = path.head; current; current = path.childOf(current)) {
            if (!(current instanceof compiler_1.EmbeddedTemplateAst)) {
                continue;
            }
            var _loop_2 = function (variable) {
                var symbol = info.members.get(variable.value);
                if (!symbol) {
                    symbol = getVariableTypeFromDirectiveContext(variable.value, info.query, current);
                }
                var kind = info.query.getTypeKind(symbol);
                if (kind === symbols_1.BuiltinType.Any || kind === symbols_1.BuiltinType.Unbound) {
                    // For special cases such as ngFor and ngIf, the any type is not very useful.
                    // We can do better by resolving the binding value.
                    var symbolsInScope = info.query.mergeSymbolTable([
                        info.members,
                        // Since we are traversing the AST path from head to tail, any variables
                        // that have been declared so far are also in scope.
                        info.query.createSymbolTable(results),
                    ]);
                    symbol = refinedVariableType(variable.value, symbolsInScope, info.query, current);
                }
                results.push({
                    name: variable.name,
                    kind: 'variable',
                    type: symbol, get definition() { return getDefinitionOf(info, variable); },
                });
            };
            try {
                for (var _b = (e_2 = void 0, tslib_1.__values(current.variables)), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var variable = _c.value;
                    _loop_2(variable);
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
        return results;
    }
    /**
     * Resolve the type for the variable in `templateElement` by finding the structural
     * directive which has the context member. Returns any when not found.
     * @param value variable value name
     * @param query type symbol query
     * @param templateElement
     */
    function getVariableTypeFromDirectiveContext(value, query, templateElement) {
        var e_3, _a;
        try {
            for (var _b = tslib_1.__values(templateElement.directives), _c = _b.next(); !_c.done; _c = _b.next()) {
                var directive = _c.value.directive;
                var context = query.getTemplateContext(directive.type.reference);
                if (context) {
                    var member = context.get(value);
                    if (member && member.type) {
                        return member.type;
                    }
                }
            }
        }
        catch (e_3_1) { e_3 = { error: e_3_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_3) throw e_3.error; }
        }
        return query.getBuiltinType(symbols_1.BuiltinType.Any);
    }
    /**
     * Resolve a more specific type for the variable in `templateElement` by inspecting
     * all variables that are in scope in the `mergedTable`. This function is a special
     * case for `ngFor` and `ngIf`. If resolution fails, return the `any` type.
     * @param value variable value name
     * @param mergedTable symbol table for all variables in scope
     * @param query
     * @param templateElement
     */
    function refinedVariableType(value, mergedTable, query, templateElement) {
        if (value === '$implicit') {
            // Special case the ngFor directive
            var ngForDirective = templateElement.directives.find(function (d) {
                var name = compiler_1.identifierName(d.directive.type);
                return name == 'NgFor' || name == 'NgForOf';
            });
            if (ngForDirective) {
                var ngForOfBinding = ngForDirective.inputs.find(function (i) { return i.directiveName == 'ngForOf'; });
                if (ngForOfBinding) {
                    // Check if there is a known type for the ngFor binding.
                    var bindingType = new expression_type_1.AstType(mergedTable, query, {}).getType(ngForOfBinding.value);
                    if (bindingType) {
                        var result = query.getElementType(bindingType);
                        if (result) {
                            return result;
                        }
                    }
                }
            }
        }
        // Special case the ngIf directive ( *ngIf="data$ | async as variable" )
        if (value === 'ngIf') {
            var ngIfDirective = templateElement.directives.find(function (d) { return compiler_1.identifierName(d.directive.type) === 'NgIf'; });
            if (ngIfDirective) {
                var ngIfBinding = ngIfDirective.inputs.find(function (i) { return i.directiveName === 'ngIf'; });
                if (ngIfBinding) {
                    var bindingType = new expression_type_1.AstType(mergedTable, query, {}).getType(ngIfBinding.value);
                    if (bindingType) {
                        return bindingType;
                    }
                }
            }
        }
        // We can't do better, return any
        return query.getBuiltinType(symbols_1.BuiltinType.Any);
    }
    function getEventDeclaration(info, path) {
        var event = path.tail;
        if (!(event instanceof compiler_1.BoundEventAst)) {
            // No event available in this context.
            return;
        }
        var genericEvent = {
            name: '$event',
            kind: 'variable',
            type: info.query.getBuiltinType(symbols_1.BuiltinType.Any),
        };
        var outputSymbol = utils_1.findOutputBinding(event, path, info.query);
        if (!outputSymbol) {
            // The `$event` variable doesn't belong to an output, so its type can't be refined.
            // TODO: type `$event` variables in bindings to DOM events.
            return genericEvent;
        }
        // The raw event type is wrapped in a generic, like EventEmitter<T> or Observable<T>.
        var ta = outputSymbol.typeArguments();
        if (!ta || ta.length !== 1)
            return genericEvent;
        var eventType = ta[0];
        return tslib_1.__assign(tslib_1.__assign({}, genericEvent), { type: eventType });
    }
    /**
     * Returns the symbols available in a particular scope of a template.
     * @param info parsed template information
     * @param path path of template nodes narrowing to the context the expression scope should be
     * derived for.
     */
    function getExpressionScope(info, path) {
        var result = info.members;
        var references = getReferences(info);
        var variables = getVarDeclarations(info, path);
        var event = getEventDeclaration(info, path);
        if (references.length || variables.length || event) {
            var referenceTable = info.query.createSymbolTable(references);
            var variableTable = info.query.createSymbolTable(variables);
            var eventsTable = info.query.createSymbolTable(event ? [event] : []);
            result = info.query.mergeSymbolTable([result, referenceTable, variableTable, eventsTable]);
        }
        return result;
    }
    exports.getExpressionScope = getExpressionScope;
    var ExpressionDiagnosticsVisitor = /** @class */ (function (_super) {
        tslib_1.__extends(ExpressionDiagnosticsVisitor, _super);
        function ExpressionDiagnosticsVisitor(info, getExpressionScope) {
            var _this = _super.call(this) || this;
            _this.info = info;
            _this.getExpressionScope = getExpressionScope;
            _this.diagnostics = [];
            _this.path = new compiler_1.AstPath([]);
            return _this;
        }
        ExpressionDiagnosticsVisitor.prototype.visitDirective = function (ast, context) {
            // Override the default child visitor to ignore the host properties of a directive.
            if (ast.inputs && ast.inputs.length) {
                compiler_1.templateVisitAll(this, ast.inputs, context);
            }
        };
        ExpressionDiagnosticsVisitor.prototype.visitBoundText = function (ast) {
            this.push(ast);
            this.diagnoseExpression(ast.value, ast.sourceSpan.start.offset, false);
            this.pop();
        };
        ExpressionDiagnosticsVisitor.prototype.visitDirectiveProperty = function (ast) {
            this.push(ast);
            this.diagnoseExpression(ast.value, this.attributeValueLocation(ast), false);
            this.pop();
        };
        ExpressionDiagnosticsVisitor.prototype.visitElementProperty = function (ast) {
            this.push(ast);
            this.diagnoseExpression(ast.value, this.attributeValueLocation(ast), false);
            this.pop();
        };
        ExpressionDiagnosticsVisitor.prototype.visitEvent = function (ast) {
            this.push(ast);
            this.diagnoseExpression(ast.handler, this.attributeValueLocation(ast), true);
            this.pop();
        };
        ExpressionDiagnosticsVisitor.prototype.visitVariable = function (ast) {
            var directive = this.directiveSummary;
            if (directive && ast.value) {
                var context = this.info.query.getTemplateContext(directive.type.reference);
                if (context && !context.has(ast.value)) {
                    var missingMember = ast.value === '$implicit' ? 'an implicit value' : "a member called '" + ast.value + "'";
                    var span = this.absSpan(spanOf(ast.sourceSpan));
                    this.diagnostics.push(diagnostic_messages_1.createDiagnostic(span, diagnostic_messages_1.Diagnostic.template_context_missing_member, directive.type.reference.name, missingMember));
                }
            }
        };
        ExpressionDiagnosticsVisitor.prototype.visitElement = function (ast, context) {
            this.push(ast);
            _super.prototype.visitElement.call(this, ast, context);
            this.pop();
        };
        ExpressionDiagnosticsVisitor.prototype.visitEmbeddedTemplate = function (ast, context) {
            var previousDirectiveSummary = this.directiveSummary;
            this.push(ast);
            // Find directive that references this template
            this.directiveSummary =
                ast.directives.map(function (d) { return d.directive; }).find(function (d) { return hasTemplateReference(d.type); });
            // Process children
            _super.prototype.visitEmbeddedTemplate.call(this, ast, context);
            this.pop();
            this.directiveSummary = previousDirectiveSummary;
        };
        ExpressionDiagnosticsVisitor.prototype.attributeValueLocation = function (ast) {
            var path = utils_1.getPathToNodeAtPosition(this.info.htmlAst, ast.sourceSpan.start.offset);
            var last = path.tail;
            if (last instanceof compiler_1.Attribute && last.valueSpan) {
                return last.valueSpan.start.offset;
            }
            return ast.sourceSpan.start.offset;
        };
        ExpressionDiagnosticsVisitor.prototype.diagnoseExpression = function (ast, offset, event) {
            var e_4, _a;
            var scope = this.getExpressionScope(this.path, event);
            var analyzer = new expression_type_1.AstType(scope, this.info.query, { event: event });
            try {
                for (var _b = tslib_1.__values(analyzer.getDiagnostics(ast)), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var diagnostic = _c.value;
                    diagnostic.span = this.absSpan(diagnostic.span, offset);
                    this.diagnostics.push(diagnostic);
                }
            }
            catch (e_4_1) { e_4 = { error: e_4_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_4) throw e_4.error; }
            }
        };
        ExpressionDiagnosticsVisitor.prototype.push = function (ast) { this.path.push(ast); };
        ExpressionDiagnosticsVisitor.prototype.pop = function () { this.path.pop(); };
        ExpressionDiagnosticsVisitor.prototype.absSpan = function (span, additionalOffset) {
            if (additionalOffset === void 0) { additionalOffset = 0; }
            return {
                start: span.start + this.info.offset + additionalOffset,
                end: span.end + this.info.offset + additionalOffset,
            };
        };
        return ExpressionDiagnosticsVisitor;
    }(compiler_1.RecursiveTemplateAstVisitor));
    function hasTemplateReference(type) {
        var e_5, _a;
        if (type.diDeps) {
            try {
                for (var _b = tslib_1.__values(type.diDeps), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var diDep = _c.value;
                    if (diDep.token && diDep.token.identifier &&
                        compiler_1.identifierName(diDep.token.identifier) == 'TemplateRef')
                        return true;
                }
            }
            catch (e_5_1) { e_5 = { error: e_5_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_5) throw e_5.error; }
            }
        }
        return false;
    }
    function spanOf(sourceSpan) {
        return { start: sourceSpan.start.offset, end: sourceSpan.end.offset };
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXhwcmVzc2lvbl9kaWFnbm9zdGljcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2xhbmd1YWdlLXNlcnZpY2Uvc3JjL2V4cHJlc3Npb25fZGlhZ25vc3RpY3MudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOzs7Ozs7Ozs7Ozs7O0lBRUgsOENBQXVZO0lBRXZZLHlGQUFtRTtJQUNuRSxpRkFBMEM7SUFDMUMsaUVBQTZHO0lBRTdHLDZEQUFtRTtJQVduRSxTQUFnQixnQ0FBZ0MsQ0FBQyxJQUE0QjtRQUMzRSxJQUFNLE9BQU8sR0FBRyxJQUFJLDRCQUE0QixDQUM1QyxJQUFJLEVBQUUsVUFBQyxJQUFxQixJQUFLLE9BQUEsa0JBQWtCLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxFQUE5QixDQUE4QixDQUFDLENBQUM7UUFDckUsMkJBQWdCLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQztRQUM1QyxPQUFPLE9BQU8sQ0FBQyxXQUFXLENBQUM7SUFDN0IsQ0FBQztJQUxELDRFQUtDO0lBRUQsU0FBUyxhQUFhLENBQUMsSUFBNEI7UUFDakQsSUFBTSxNQUFNLEdBQXdCLEVBQUUsQ0FBQztRQUV2QyxTQUFTLGlCQUFpQixDQUFDLFVBQTBCOztvQ0FDeEMsU0FBUztnQkFDbEIsSUFBSSxJQUFJLEdBQXFCLFNBQVMsQ0FBQztnQkFDdkMsSUFBSSxTQUFTLENBQUMsS0FBSyxFQUFFO29CQUNuQixJQUFJLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxhQUFhLENBQUMseUJBQWMsQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztpQkFDbEU7Z0JBQ0QsTUFBTSxDQUFDLElBQUksQ0FBQztvQkFDVixJQUFJLEVBQUUsU0FBUyxDQUFDLElBQUk7b0JBQ3BCLElBQUksRUFBRSxXQUFXO29CQUNqQixJQUFJLEVBQUUsSUFBSSxJQUFJLElBQUksQ0FB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QWdCLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBRTFCLDhDQUFPLEdBQWYsVUFBZ0IsSUFBVSxFQUFFLGdCQUE0QjtZQUE1QixpQ0FBQSxFQUFBLG9CQUE0QjtZQUN0RCxPQUFPO2dCQUNMLEtBQUssRUFBRSxJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxHQUFHLGdCQUFnQjtnQkFDdkQsR0FBRyxFQUFFLElBQUksQ0FBQyxHQUFHLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLEdBQUcsZ0JBQWdCO2FBQ3BELENBQUM7UUFDSixDQUFDO1FBQ0gsbUNBQUM7SUFBRCxDQUFDLEFBL0dELENBQTJDLHNDQUEyQixHQStHckU7SUFFRCxTQUFTLG9CQUFvQixDQUFDLElBQXlCOztRQUNyRCxJQUFJLElBQUksQ0FBQyxNQUFNLEVBQUU7O2dCQUNmLEtBQWtCLElBQUEsS0FBQSxpQkFBQSxJQUFJLENBQUMsTUFBTSxDQUFBLGdCQUFBLDRCQUFFO29CQUExQixJQUFJLEtBQUssV0FBQTtvQkFDWixJQUFJLEtBQUssQ0FBQyxLQUFLLElBQUksS0FBSyxDQUFDLEtBQUssQ0FBQyxVQUFVO3dCQUNyQyx5QkFBYyxDQUFDLEtBQUssQ0FBQyxLQUFPLENBQUMsVUFBWSxDQUFDLElBQUksYUFBYTt3QkFDN0QsT0FBTyxJQUFJLENBQUM7aUJBQ2Y7Ozs7Ozs7OztTQUNGO1FBQ0QsT0FBTyxLQUFLLENBQUM7SUFDZixDQUFDO0lBRUQsU0FBUyxNQUFNLENBQUMsVUFBMkI7UUFDekMsT0FBTyxFQUFDLEtBQUssRUFBRSxVQUFVLENBQUMsS0FBSyxDQUFDLE1BQU0sRUFBRSxHQUFHLEVBQUUsVUFBVSxDQUFDLEdBQUcsQ0FBQyxNQUFNLEVBQUMsQ0FBQztJQUN0RSxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0FTVCwgQXN0UGF0aCwgQXR0cmlidXRlLCBCb3VuZERpcmVjdGl2ZVByb3BlcnR5QXN0LCBCb3VuZEVsZW1lbnRQcm9wZXJ0eUFzdCwgQm91bmRFdmVudEFzdCwgQm91bmRUZXh0QXN0LCBDb21waWxlRGlyZWN0aXZlU3VtbWFyeSwgQ29tcGlsZVR5cGVNZXRhZGF0YSwgRGlyZWN0aXZlQXN0LCBFbGVtZW50QXN0LCBFbWJlZGRlZFRlbXBsYXRlQXN0LCBOb2RlLCBQYXJzZVNvdXJjZVNwYW4sIFJlY3Vyc2l2ZVRlbXBsYXRlQXN0VmlzaXRvciwgUmVmZXJlbmNlQXN0LCBUZW1wbGF0ZUFzdCwgVGVtcGxhdGVBc3RQYXRoLCBWYXJpYWJsZUFzdCwgaWRlbnRpZmllck5hbWUsIHRlbXBsYXRlVmlzaXRBbGwsIHRva2VuUmVmZXJlbmNlfSBmcm9tICdAYW5ndWxhci9jb21waWxlcic7XG5cbmltcG9ydCB7RGlhZ25vc3RpYywgY3JlYXRlRGlhZ25vc3RpY30gZnJvbSAnLi9kaWFnbm9zdGljX21lc3NhZ2VzJztcbmltcG9ydCB7QXN0VHlwZX0gZnJvbSAnLi9leHByZXNzaW9uX3R5cGUnO1xuaW1wb3J0IHtCdWlsdGluVHlwZSwgRGVmaW5pdGlvbiwgU3BhbiwgU3ltYm9sLCBTeW1ib2xEZWNsYXJhdGlvbiwgU3ltYm9sUXVlcnksIFN5bWJvbFRhYmxlfSBmcm9tICcuL3N5bWJvbHMnO1xuaW1wb3J0ICogYXMgbmcgZnJvbSAnLi90eXBlcyc7XG5pbXBvcnQge2ZpbmRPdXRwdXRCaW5kaW5nLCBnZXRQYXRoVG9Ob2RlQXRQb3NpdGlvbn0gZnJvbSAnLi91dGlscyc7XG5cbmV4cG9ydCBpbnRlcmZhY2UgRGlhZ25vc3RpY1RlbXBsYXRlSW5mbyB7XG4gIGZpbGVOYW1lPzogc3RyaW5nO1xuICBvZmZzZXQ6IG51bWJlcjtcbiAgcXVlcnk6IFN5bWJvbFF1ZXJ5O1xuICBtZW1iZXJzOiBTeW1ib2xUYWJsZTtcbiAgaHRtbEFzdDogTm9kZVtdO1xuICB0ZW1wbGF0ZUFzdDogVGVtcGxhdGVBc3RbXTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldFRlbXBsYXRlRXhwcmVzc2lvbkRpYWdub3N0aWNzKGluZm86IERpYWdub3N0aWNUZW1wbGF0ZUluZm8pOiBuZy5EaWFnbm9zdGljW10ge1xuICBjb25zdCB2aXNpdG9yID0gbmV3IEV4cHJlc3Npb25EaWFnbm9zdGljc1Zpc2l0b3IoXG4gICAgICBpbmZvLCAocGF0aDogVGVtcGxhdGVBc3RQYXRoKSA9PiBnZXRFeHByZXNzaW9uU2NvcGUoaW5mbywgcGF0aCkpO1xuICB0ZW1wbGF0ZVZpc2l0QWxsKHZpc2l0b3IsIGluZm8udGVtcGxhdGVBc3QpO1xuICByZXR1cm4gdmlzaXRvci5kaWFnbm9zdGljcztcbn1cblxuZnVuY3Rpb24gZ2V0UmVmZXJlbmNlcyhpbmZvOiBEaWFnbm9zdGljVGVtcGxhdGVJbmZvKTogU3ltYm9sRGVjbGFyYXRpb25bXSB7XG4gIGNvbnN0IHJlc3VsdDogU3ltYm9sRGVjbGFyYXRpb25bXSA9IFtdO1xuXG4gIGZ1bmN0aW9uIHByb2Nlc3NSZWZlcmVuY2VzKHJlZmVyZW5jZXM6IFJlZmVyZW5jZUFzdFtdKSB7XG4gICAgZm9yIChjb25zdCByZWZlcmVuY2Ugb2YgcmVmZXJlbmNlcykge1xuICAgICAgbGV0IHR5cGU6IFN5bWJvbHx1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgICBpZiAocmVmZXJlbmNlLnZhbHVlKSB7XG4gICAgICAgIHR5cGUgPSBpbmZvLnF1ZXJ5LmdldFR5cGVTeW1ib2wodG9rZW5SZWZlcmVuY2UocmVmZXJlbmNlLnZhbHVlKSk7XG4gICAgICB9XG4gICAgICByZXN1bHQucHVzaCh7XG4gICAgICAgIG5hbWU6IHJlZmVyZW5jZS5uYW1lLFxuICAgICAgICBraW5kOiAncmVmZXJlbmNlJyxcbiAgICAgICAgdHlwZTogdHlwZSB8fCBpbmZvLnF1ZXJ5LmdldEJ1aWx0aW5UeXBlKEJ1aWx0aW5UeXBlLkFueSksXG4gICAgICAgIGdldCBkZWZpbml0aW9uKCkgeyByZXR1cm4gZ2V0RGVmaW5pdGlvbk9mKGluZm8sIHJlZmVyZW5jZSk7IH1cbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuXG4gIGNvbnN0IHZpc2l0b3IgPSBuZXcgY2xhc3MgZXh0ZW5kcyBSZWN1cnNpdmVUZW1wbGF0ZUFzdFZpc2l0b3Ige1xuICAgIHZpc2l0RW1iZWRkZWRUZW1wbGF0ZShhc3Q6IEVtYmVkZGVkVGVtcGxhdGVBc3QsIGNvbnRleHQ6IGFueSk6IGFueSB7XG4gICAgICBzdXBlci52aXNpdEVtYmVkZGVkVGVtcGxhdGUoYXN0LCBjb250ZXh0KTtcbiAgICAgIHByb2Nlc3NSZWZlcmVuY2VzKGFzdC5yZWZlcmVuY2VzKTtcbiAgICB9XG4gICAgdmlzaXRFbGVtZW50KGFzdDogRWxlbWVudEFzdCwgY29udGV4dDogYW55KTogYW55IHtcbiAgICAgIHN1cGVyLnZpc2l0RWxlbWVudChhc3QsIGNvbnRleHQpO1xuICAgICAgcHJvY2Vzc1JlZmVyZW5jZXMoYXN0LnJlZmVyZW5jZXMpO1xuICAgIH1cbiAgfTtcblxuICB0ZW1wbGF0ZVZpc2l0QWxsKHZpc2l0b3IsIGluZm8udGVtcGxhdGVBc3QpO1xuXG4gIHJldHVybiByZXN1bHQ7XG59XG5cbmZ1bmN0aW9uIGdldERlZmluaXRpb25PZihpbmZvOiBEaWFnbm9zdGljVGVtcGxhdGVJbmZvLCBhc3Q6IFRlbXBsYXRlQXN0KTogRGVmaW5pdGlvbnx1bmRlZmluZWQge1xuICBpZiAoaW5mby5maWxlTmFtZSkge1xuICAgIGNvbnN0IHRlbXBsYXRlT2Zmc2V0ID0gaW5mby5vZmZzZXQ7XG4gICAgcmV0dXJuIFt7XG4gICAgICBmaWxlTmFtZTogaW5mby5maWxlTmFtZSxcbiAgICAgIHNwYW46IHtcbiAgICAgICAgc3RhcnQ6IGFzdC5zb3VyY2VTcGFuLnN0YXJ0Lm9mZnNldCArIHRlbXBsYXRlT2Zmc2V0LFxuICAgICAgICBlbmQ6IGFzdC5zb3VyY2VTcGFuLmVuZC5vZmZzZXQgKyB0ZW1wbGF0ZU9mZnNldFxuICAgICAgfVxuICAgIH1dO1xuICB9XG59XG5cbi8qKlxuICogUmVzb2x2ZSBhbGwgdmFyaWFibGUgZGVjbGFyYXRpb25zIGluIGEgdGVtcGxhdGUgYnkgdHJhdmVyc2luZyB0aGUgc3BlY2lmaWVkXG4gKiBgcGF0aGAuXG4gKiBAcGFyYW0gaW5mb1xuICogQHBhcmFtIHBhdGggdGVtcGxhdGUgQVNUIHBhdGhcbiAqL1xuZnVuY3Rpb24gZ2V0VmFyRGVjbGFyYXRpb25zKFxuICAgIGluZm86IERpYWdub3N0aWNUZW1wbGF0ZUluZm8sIHBhdGg6IFRlbXBsYXRlQXN0UGF0aCk6IFN5bWJvbERlY2xhcmF0aW9uW10ge1xuICBjb25zdCByZXN1bHRzOiBTeW1ib2xEZWNsYXJhdGlvbltdID0gW107XG4gIGZvciAobGV0IGN1cnJlbnQgPSBwYXRoLmhlYWQ7IGN1cnJlbnQ7IGN1cnJlbnQgPSBwYXRoLmNoaWxkT2YoY3VycmVudCkpIHtcbiAgICBpZiAoIShjdXJyZW50IGluc3RhbmNlb2YgRW1iZWRkZWRUZW1wbGF0ZUFzdCkpIHtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cbiAgICBmb3IgKGNvbnN0IHZhcmlhYmxlIG9mIGN1cnJlbnQudmFyaWFibGVzKSB7XG4gICAgICBsZXQgc3ltYm9sID0gaW5mby5tZW1iZXJzLmdldCh2YXJpYWJsZS52YWx1ZSk7XG4gICAgICBpZiAoIXN5bWJvbCkge1xuICAgICAgICBzeW1ib2wgPSBnZXRWYXJpYWJsZVR5cGVGcm9tRGlyZWN0aXZlQ29udGV4dCh2YXJpYWJsZS52YWx1ZSwgaW5mby5xdWVyeSwgY3VycmVudCk7XG4gICAgICB9XG4gICAgICBjb25zdCBraW5kID0gaW5mby5xdWVyeS5nZXRUeXBlS2luZChzeW1ib2wpO1xuICAgICAgaWYgKGtpbmQgPT09IEJ1aWx0aW5UeXBlLkFueSB8fCBraW5kID09PSBCdWlsdGluVHlwZS5VbmJvdW5kKSB7XG4gICAgICAgIC8vIEZvciBzcGVjaWFsIGNhc2VzIHN1Y2ggYXMgbmdGb3IgYW5kIG5nSWYsIHRoZSBhbnkgdHlwZSBpcyBub3QgdmVyeSB1c2VmdWwuXG4gICAgICAgIC8vIFdlIGNhbiBkbyBiZXR0ZXIgYnkgcmVzb2x2aW5nIHRoZSBiaW5kaW5nIHZhbHVlLlxuICAgICAgICBjb25zdCBzeW1ib2xzSW5TY29wZSA9IGluZm8ucXVlcnkubWVyZ2VTeW1ib2xUYWJsZShbXG4gICAgICAgICAgaW5mby5tZW1iZXJzLFxuICAgICAgICAgIC8vIFNpbmNlIHdlIGFyZSB0cmF2ZXJzaW5nIHRoZSBBU1QgcGF0aCBmcm9tIGhlYWQgdG8gdGFpbCwgYW55IHZhcmlhYmxlc1xuICAgICAgICAgIC8vIHRoYXQgaGF2ZSBiZWVuIGRlY2xhcmVkIHNvIGZhciBhcmUgYWxzbyBpbiBzY29wZS5cbiAgICAgICAgICBpbmZvLnF1ZXJ5LmNyZWF0ZVN5bWJvbFRhYmxlKHJlc3VsdHMpLFxuICAgICAgICBdKTtcbiAgICAgICAgc3ltYm9sID0gcmVmaW5lZFZhcmlhYmxlVHlwZSh2YXJpYWJsZS52YWx1ZSwgc3ltYm9sc0luU2NvcGUsIGluZm8ucXVlcnksIGN1cnJlbnQpO1xuICAgICAgfVxuICAgICAgcmVzdWx0cy5wdXNoKHtcbiAgICAgICAgbmFtZTogdmFyaWFibGUubmFtZSxcbiAgICAgICAga2luZDogJ3ZhcmlhYmxlJyxcbiAgICAgICAgdHlwZTogc3ltYm9sLCBnZXQgZGVmaW5pdGlvbigpIHsgcmV0dXJuIGdldERlZmluaXRpb25PZihpbmZvLCB2YXJpYWJsZSk7IH0sXG4gICAgICB9KTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHJlc3VsdHM7XG59XG5cbi8qKlxuICogUmVzb2x2ZSB0aGUgdHlwZSBmb3IgdGhlIHZhcmlhYmxlIGluIGB0ZW1wbGF0ZUVsZW1lbnRgIGJ5IGZpbmRpbmcgdGhlIHN0cnVjdHVyYWxcbiAqIGRpcmVjdGl2ZSB3aGljaCBoYXMgdGhlIGNvbnRleHQgbWVtYmVyLiBSZXR1cm5zIGFueSB3aGVuIG5vdCBmb3VuZC5cbiAqIEBwYXJhbSB2YWx1ZSB2YXJpYWJsZSB2YWx1ZSBuYW1lXG4gKiBAcGFyYW0gcXVlcnkgdHlwZSBzeW1ib2wgcXVlcnlcbiAqIEBwYXJhbSB0ZW1wbGF0ZUVsZW1lbnRcbiAqL1xuZnVuY3Rpb24gZ2V0VmFyaWFibGVUeXBlRnJvbURpcmVjdGl2ZUNvbnRleHQoXG4gICAgdmFsdWU6IHN0cmluZywgcXVlcnk6IFN5bWJvbFF1ZXJ5LCB0ZW1wbGF0ZUVsZW1lbnQ6IEVtYmVkZGVkVGVtcGxhdGVBc3QpOiBTeW1ib2wge1xuICBmb3IgKGNvbnN0IHtkaXJlY3RpdmV9IG9mIHRlbXBsYXRlRWxlbWVudC5kaXJlY3RpdmVzKSB7XG4gICAgY29uc3QgY29udGV4dCA9IHF1ZXJ5LmdldFRlbXBsYXRlQ29udGV4dChkaXJlY3RpdmUudHlwZS5yZWZlcmVuY2UpO1xuICAgIGlmIChjb250ZXh0KSB7XG4gICAgICBjb25zdCBtZW1iZXIgPSBjb250ZXh0LmdldCh2YWx1ZSk7XG4gICAgICBpZiAobWVtYmVyICYmIG1lbWJlci50eXBlKSB7XG4gICAgICAgIHJldHVybiBtZW1iZXIudHlwZTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgcmV0dXJuIHF1ZXJ5LmdldEJ1aWx0aW5UeXBlKEJ1aWx0aW5UeXBlLkFueSk7XG59XG5cbi8qKlxuICogUmVzb2x2ZSBhIG1vcmUgc3BlY2lmaWMgdHlwZSBmb3IgdGhlIHZhcmlhYmxlIGluIGB0ZW1wbGF0ZUVsZW1lbnRgIGJ5IGluc3BlY3RpbmdcbiAqIGFsbCB2YXJpYWJsZXMgdGhhdCBhcmUgaW4gc2NvcGUgaW4gdGhlIGBtZXJnZWRUYWJsZWAuIFRoaXMgZnVuY3Rpb24gaXMgYSBzcGVjaWFsXG4gKiBjYXNlIGZvciBgbmdGb3JgIGFuZCBgbmdJZmAuIElmIHJlc29sdXRpb24gZmFpbHMsIHJldHVybiB0aGUgYGFueWAgdHlwZS5cbiAqIEBwYXJhbSB2YWx1ZSB2YXJpYWJsZSB2YWx1ZSBuYW1lXG4gKiBAcGFyYW0gbWVyZ2VkVGFibGUgc3ltYm9sIHRhYmxlIGZvciBhbGwgdmFyaWFibGVzIGluIHNjb3BlXG4gKiBAcGFyYW0gcXVlcnlcbiAqIEBwYXJhbSB0ZW1wbGF0ZUVsZW1lbnRcbiAqL1xuZnVuY3Rpb24gcmVmaW5lZFZhcmlhYmxlVHlwZShcbiAgICB2YWx1ZTogc3RyaW5nLCBtZXJnZWRUYWJsZTogU3ltYm9sVGFibGUsIHF1ZXJ5OiBTeW1ib2xRdWVyeSxcbiAgICB0ZW1wbGF0ZUVsZW1lbnQ6IEVtYmVkZGVkVGVtcGxhdGVBc3QpOiBTeW1ib2wge1xuICBpZiAodmFsdWUgPT09ICckaW1wbGljaXQnKSB7XG4gICAgLy8gU3BlY2lhbCBjYXNlIHRoZSBuZ0ZvciBkaXJlY3RpdmVcbiAgICBjb25zdCBuZ0ZvckRpcmVjdGl2ZSA9IHRlbXBsYXRlRWxlbWVudC5kaXJlY3RpdmVzLmZpbmQoZCA9PiB7XG4gICAgICBjb25zdCBuYW1lID0gaWRlbnRpZmllck5hbWUoZC5kaXJlY3RpdmUudHlwZSk7XG4gICAgICByZXR1cm4gbmFtZSA9PSAnTmdGb3InIHx8IG5hbWUgPT0gJ05nRm9yT2YnO1xuICAgIH0pO1xuICAgIGlmIChuZ0ZvckRpcmVjdGl2ZSkge1xuICAgICAgY29uc3QgbmdGb3JPZkJpbmRpbmcgPSBuZ0ZvckRpcmVjdGl2ZS5pbnB1dHMuZmluZChpID0+IGkuZGlyZWN0aXZlTmFtZSA9PSAnbmdGb3JPZicpO1xuICAgICAgaWYgKG5nRm9yT2ZCaW5kaW5nKSB7XG4gICAgICAgIC8vIENoZWNrIGlmIHRoZXJlIGlzIGEga25vd24gdHlwZSBmb3IgdGhlIG5nRm9yIGJpbmRpbmcuXG4gICAgICAgIGNvbnN0IGJpbmRpbmdUeXBlID0gbmV3IEFzdFR5cGUobWVyZ2VkVGFibGUsIHF1ZXJ5LCB7fSkuZ2V0VHlwZShuZ0Zvck9mQmluZGluZy52YWx1ZSk7XG4gICAgICAgIGlmIChiaW5kaW5nVHlwZSkge1xuICAgICAgICAgIGNvbnN0IHJlc3VsdCA9IHF1ZXJ5LmdldEVsZW1lbnRUeXBlKGJpbmRpbmdUeXBlKTtcbiAgICAgICAgICBpZiAocmVzdWx0KSB7XG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8vIFNwZWNpYWwgY2FzZSB0aGUgbmdJZiBkaXJlY3RpdmUgKCAqbmdJZj1cImRhdGEkIHwgYXN5bmMgYXMgdmFyaWFibGVcIiApXG4gIGlmICh2YWx1ZSA9PT0gJ25nSWYnKSB7XG4gICAgY29uc3QgbmdJZkRpcmVjdGl2ZSA9XG4gICAgICAgIHRlbXBsYXRlRWxlbWVudC5kaXJlY3RpdmVzLmZpbmQoZCA9PiBpZGVudGlmaWVyTmFtZShkLmRpcmVjdGl2ZS50eXBlKSA9PT0gJ05nSWYnKTtcbiAgICBpZiAobmdJZkRpcmVjdGl2ZSkge1xuICAgICAgY29uc3QgbmdJZkJpbmRpbmcgPSBuZ0lmRGlyZWN0aXZlLmlucHV0cy5maW5kKGkgPT4gaS5kaXJlY3RpdmVOYW1lID09PSAnbmdJZicpO1xuICAgICAgaWYgKG5nSWZCaW5kaW5nKSB7XG4gICAgICAgIGNvbnN0IGJpbmRpbmdUeXBlID0gbmV3IEFzdFR5cGUobWVyZ2VkVGFibGUsIHF1ZXJ5LCB7fSkuZ2V0VHlwZShuZ0lmQmluZGluZy52YWx1ZSk7XG4gICAgICAgIGlmIChiaW5kaW5nVHlwZSkge1xuICAgICAgICAgIHJldHVybiBiaW5kaW5nVHlwZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8vIFdlIGNhbid0IGRvIGJldHRlciwgcmV0dXJuIGFueVxuICByZXR1cm4gcXVlcnkuZ2V0QnVpbHRpblR5cGUoQnVpbHRpblR5cGUuQW55KTtcbn1cblxuZnVuY3Rpb24gZ2V0RXZlbnREZWNsYXJhdGlvbihcbiAgICBpbmZvOiBEaWFnbm9zdGljVGVtcGxhdGVJbmZvLCBwYXRoOiBUZW1wbGF0ZUFzdFBhdGgpOiBTeW1ib2xEZWNsYXJhdGlvbnx1bmRlZmluZWQge1xuICBjb25zdCBldmVudCA9IHBhdGgudGFpbDtcbiAgaWYgKCEoZXZlbnQgaW5zdGFuY2VvZiBCb3VuZEV2ZW50QXN0KSkge1xuICAgIC8vIE5vIGV2ZW50IGF2YWlsYWJsZSBpbiB0aGlzIGNvbnRleHQuXG4gICAgcmV0dXJuO1xuICB9XG5cbiAgY29uc3QgZ2VuZXJpY0V2ZW50OiBTeW1ib2xEZWNsYXJhdGlvbiA9IHtcbiAgICBuYW1lOiAnJGV2ZW50JyxcbiAgICBraW5kOiAndmFyaWFibGUnLFxuICAgIHR5cGU6IGluZm8ucXVlcnkuZ2V0QnVpbHRpblR5cGUoQnVpbHRpblR5cGUuQW55KSxcbiAgfTtcblxuICBjb25zdCBvdXRwdXRTeW1ib2wgPSBmaW5kT3V0cHV0QmluZGluZyhldmVudCwgcGF0aCwgaW5mby5xdWVyeSk7XG4gIGlmICghb3V0cHV0U3ltYm9sKSB7XG4gICAgLy8gVGhlIGAkZXZlbnRgIHZhcmlhYmxlIGRvZXNuJ3QgYmVsb25nIHRvIGFuIG91dHB1dCwgc28gaXRzIHR5cGUgY2FuJ3QgYmUgcmVmaW5lZC5cbiAgICAvLyBUT0RPOiB0eXBlIGAkZXZlbnRgIHZhcmlhYmxlcyBpbiBiaW5kaW5ncyB0byBET00gZXZlbnRzLlxuICAgIHJldHVybiBnZW5lcmljRXZlbnQ7XG4gIH1cblxuICAvLyBUaGUgcmF3IGV2ZW50IHR5cGUgaXMgd3JhcHBlZCBpbiBhIGdlbmVyaWMsIGxpa2UgRXZlbnRFbWl0dGVyPFQ+IG9yIE9ic2VydmFibGU8VD4uXG4gIGNvbnN0IHRhID0gb3V0cHV0U3ltYm9sLnR5cGVBcmd1bWVudHMoKTtcbiAgaWYgKCF0YSB8fCB0YS5sZW5ndGggIT09IDEpIHJldHVybiBnZW5lcmljRXZlbnQ7XG4gIGNvbnN0IGV2ZW50VHlwZSA9IHRhWzBdO1xuXG4gIHJldHVybiB7Li4uZ2VuZXJpY0V2ZW50LCB0eXBlOiBldmVudFR5cGV9O1xufVxuXG4vKipcbiAqIFJldHVybnMgdGhlIHN5bWJvbHMgYXZhaWxhYmxlIGluIGEgcGFydGljdWxhciBzY29wZSBvZiBhIHRlbXBsYXRlLlxuICogQHBhcmFtIGluZm8gcGFyc2VkIHRlbXBsYXRlIGluZm9ybWF0aW9uXG4gKiBAcGFyYW0gcGF0aCBwYXRoIG9mIHRlbXBsYXRlIG5vZGVzIG5hcnJvd2luZyB0byB0aGUgY29udGV4dCB0aGUgZXhwcmVzc2lvbiBzY29wZSBzaG91bGQgYmVcbiAqIGRlcml2ZWQgZm9yLlxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0RXhwcmVzc2lvblNjb3BlKFxuICAgIGluZm86IERpYWdub3N0aWNUZW1wbGF0ZUluZm8sIHBhdGg6IFRlbXBsYXRlQXN0UGF0aCk6IFN5bWJvbFRhYmxlIHtcbiAgbGV0IHJlc3VsdCA9IGluZm8ubWVtYmVycztcbiAgY29uc3QgcmVmZXJlbmNlcyA9IGdldFJlZmVyZW5jZXMoaW5mbyk7XG4gIGNvbnN0IHZhcmlhYmxlcyA9IGdldFZhckRlY2xhcmF0aW9ucyhpbmZvLCBwYXRoKTtcbiAgY29uc3QgZXZlbnQgPSBnZXRFdmVudERlY2xhcmF0aW9uKGluZm8sIHBhdGgpO1xuICBpZiAocmVmZXJlbmNlcy5sZW5ndGggfHwgdmFyaWFibGVzLmxlbmd0aCB8fCBldmVudCkge1xuICAgIGNvbnN0IHJlZmVyZW5jZVRhYmxlID0gaW5mby5xdWVyeS5jcmVhdGVTeW1ib2xUYWJsZShyZWZlcmVuY2VzKTtcbiAgICBjb25zdCB2YXJpYWJsZVRhYmxlID0gaW5mby5xdWVyeS5jcmVhdGVTeW1ib2xUYWJsZSh2YXJpYWJsZXMpO1xuICAgIGNvbnN0IGV2ZW50c1RhYmxlID0gaW5mby5xdWVyeS5jcmVhdGVTeW1ib2xUYWJsZShldmVudCA/IFtldmVudF0gOiBbXSk7XG4gICAgcmVzdWx0ID0gaW5mby5xdWVyeS5tZXJnZVN5bWJvbFRhYmxlKFtyZXN1bHQsIHJlZmVyZW5jZVRhYmxlLCB2YXJpYWJsZVRhYmxlLCBldmVudHNUYWJsZV0pO1xuICB9XG4gIHJldHVybiByZXN1bHQ7XG59XG5cbmNsYXNzIEV4cHJlc3Npb25EaWFnbm9zdGljc1Zpc2l0b3IgZXh0ZW5kcyBSZWN1cnNpdmVUZW1wbGF0ZUFzdFZpc2l0b3Ige1xuICBwcml2YXRlIHBhdGg6IFRlbXBsYXRlQXN0UGF0aDtcbiAgcHJpdmF0ZSBkaXJlY3RpdmVTdW1tYXJ5OiBDb21waWxlRGlyZWN0aXZlU3VtbWFyeXx1bmRlZmluZWQ7XG5cbiAgZGlhZ25vc3RpY3M6IG5nLkRpYWdub3N0aWNbXSA9IFtdO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgICAgcHJpdmF0ZSBpbmZvOiBEaWFnbm9zdGljVGVtcGxhdGVJbmZvLFxuICAgICAgcHJpdmF0ZSBnZXRFeHByZXNzaW9uU2NvcGU6IChwYXRoOiBUZW1wbGF0ZUFzdFBhdGgsIGluY2x1ZGVFdmVudDogYm9vbGVhbikgPT4gU3ltYm9sVGFibGUpIHtcbiAgICBzdXBlcigpO1xuICAgIHRoaXMucGF0aCA9IG5ldyBBc3RQYXRoPFRlbXBsYXRlQXN0PihbXSk7XG4gIH1cblxuICB2aXNpdERpcmVjdGl2ZShhc3Q6IERpcmVjdGl2ZUFzdCwgY29udGV4dDogYW55KTogYW55IHtcbiAgICAvLyBPdmVycmlkZSB0aGUgZGVmYXVsdCBjaGlsZCB2aXNpdG9yIHRvIGlnbm9yZSB0aGUgaG9zdCBwcm9wZXJ0aWVzIG9mIGEgZGlyZWN0aXZlLlxuICAgIGlmIChhc3QuaW5wdXRzICYmIGFzdC5pbnB1dHMubGVuZ3RoKSB7XG4gICAgICB0ZW1wbGF0ZVZpc2l0QWxsKHRoaXMsIGFzdC5pbnB1dHMsIGNvbnRleHQpO1xuICAgIH1cbiAgfVxuXG4gIHZpc2l0Qm91bmRUZXh0KGFzdDogQm91bmRUZXh0QXN0KTogdm9pZCB7XG4gICAgdGhpcy5wdXNoKGFzdCk7XG4gICAgdGhpcy5kaWFnbm9zZUV4cHJlc3Npb24oYXN0LnZhbHVlLCBhc3Quc291cmNlU3Bhbi5zdGFydC5vZmZzZXQsIGZhbHNlKTtcbiAgICB0aGlzLnBvcCgpO1xuICB9XG5cbiAgdmlzaXREaXJlY3RpdmVQcm9wZXJ0eShhc3Q6IEJvdW5kRGlyZWN0aXZlUHJvcGVydHlBc3QpOiB2b2lkIHtcbiAgICB0aGlzLnB1c2goYXN0KTtcbiAgICB0aGlzLmRpYWdub3NlRXhwcmVzc2lvbihhc3QudmFsdWUsIHRoaXMuYXR0cmlidXRlVmFsdWVMb2NhdGlvbihhc3QpLCBmYWxzZSk7XG4gICAgdGhpcy5wb3AoKTtcbiAgfVxuXG4gIHZpc2l0RWxlbWVudFByb3BlcnR5KGFzdDogQm91bmRFbGVtZW50UHJvcGVydHlBc3QpOiB2b2lkIHtcbiAgICB0aGlzLnB1c2goYXN0KTtcbiAgICB0aGlzLmRpYWdub3NlRXhwcmVzc2lvbihhc3QudmFsdWUsIHRoaXMuYXR0cmlidXRlVmFsdWVMb2NhdGlvbihhc3QpLCBmYWxzZSk7XG4gICAgdGhpcy5wb3AoKTtcbiAgfVxuXG4gIHZpc2l0RXZlbnQoYXN0OiBCb3VuZEV2ZW50QXN0KTogdm9pZCB7XG4gICAgdGhpcy5wdXNoKGFzdCk7XG4gICAgdGhpcy5kaWFnbm9zZUV4cHJlc3Npb24oYXN0LmhhbmRsZXIsIHRoaXMuYXR0cmlidXRlVmFsdWVMb2NhdGlvbihhc3QpLCB0cnVlKTtcbiAgICB0aGlzLnBvcCgpO1xuICB9XG5cbiAgdmlzaXRWYXJpYWJsZShhc3Q6IFZhcmlhYmxlQXN0KTogdm9pZCB7XG4gICAgY29uc3QgZGlyZWN0aXZlID0gdGhpcy5kaXJlY3RpdmVTdW1tYXJ5O1xuICAgIGlmIChkaXJlY3RpdmUgJiYgYXN0LnZhbHVlKSB7XG4gICAgICBjb25zdCBjb250ZXh0ID0gdGhpcy5pbmZvLnF1ZXJ5LmdldFRlbXBsYXRlQ29udGV4dChkaXJlY3RpdmUudHlwZS5yZWZlcmVuY2UpICE7XG4gICAgICBpZiAoY29udGV4dCAmJiAhY29udGV4dC5oYXMoYXN0LnZhbHVlKSkge1xuICAgICAgICBjb25zdCBtaXNzaW5nTWVtYmVyID1cbiAgICAgICAgICAgIGFzdC52YWx1ZSA9PT0gJyRpbXBsaWNpdCcgPyAnYW4gaW1wbGljaXQgdmFsdWUnIDogYGEgbWVtYmVyIGNhbGxlZCAnJHthc3QudmFsdWV9J2A7XG5cbiAgICAgICAgY29uc3Qgc3BhbiA9IHRoaXMuYWJzU3BhbihzcGFuT2YoYXN0LnNvdXJjZVNwYW4pKTtcbiAgICAgICAgdGhpcy5kaWFnbm9zdGljcy5wdXNoKGNyZWF0ZURpYWdub3N0aWMoXG4gICAgICAgICAgICBzcGFuLCBEaWFnbm9zdGljLnRlbXBsYXRlX2NvbnRleHRfbWlzc2luZ19tZW1iZXIsIGRpcmVjdGl2ZS50eXBlLnJlZmVyZW5jZS5uYW1lLFxuICAgICAgICAgICAgbWlzc2luZ01lbWJlcikpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHZpc2l0RWxlbWVudChhc3Q6IEVsZW1lbnRBc3QsIGNvbnRleHQ6IGFueSk6IHZvaWQge1xuICAgIHRoaXMucHVzaChhc3QpO1xuICAgIHN1cGVyLnZpc2l0RWxlbWVudChhc3QsIGNvbnRleHQpO1xuICAgIHRoaXMucG9wKCk7XG4gIH1cblxuICB2aXNpdEVtYmVkZGVkVGVtcGxhdGUoYXN0OiBFbWJlZGRlZFRlbXBsYXRlQXN0LCBjb250ZXh0OiBhbnkpOiBhbnkge1xuICAgIGNvbnN0IHByZXZpb3VzRGlyZWN0aXZlU3VtbWFyeSA9IHRoaXMuZGlyZWN0aXZlU3VtbWFyeTtcblxuICAgIHRoaXMucHVzaChhc3QpO1xuXG4gICAgLy8gRmluZCBkaXJlY3RpdmUgdGhhdCByZWZlcmVuY2VzIHRoaXMgdGVtcGxhdGVcbiAgICB0aGlzLmRpcmVjdGl2ZVN1bW1hcnkgPVxuICAgICAgICBhc3QuZGlyZWN0aXZlcy5tYXAoZCA9PiBkLmRpcmVjdGl2ZSkuZmluZChkID0+IGhhc1RlbXBsYXRlUmVmZXJlbmNlKGQudHlwZSkpICE7XG5cbiAgICAvLyBQcm9jZXNzIGNoaWxkcmVuXG4gICAgc3VwZXIudmlzaXRFbWJlZGRlZFRlbXBsYXRlKGFzdCwgY29udGV4dCk7XG5cbiAgICB0aGlzLnBvcCgpO1xuXG4gICAgdGhpcy5kaXJlY3RpdmVTdW1tYXJ5ID0gcHJldmlvdXNEaXJlY3RpdmVTdW1tYXJ5O1xuICB9XG5cbiAgcHJpdmF0ZSBhdHRyaWJ1dGVWYWx1ZUxvY2F0aW9uKGFzdDogVGVtcGxhdGVBc3QpIHtcbiAgICBjb25zdCBwYXRoID0gZ2V0UGF0aFRvTm9kZUF0UG9zaXRpb24odGhpcy5pbmZvLmh0bWxBc3QsIGFzdC5zb3VyY2VTcGFuLnN0YXJ0Lm9mZnNldCk7XG4gICAgY29uc3QgbGFzdCA9IHBhdGgudGFpbDtcbiAgICBpZiAobGFzdCBpbnN0YW5jZW9mIEF0dHJpYnV0ZSAmJiBsYXN0LnZhbHVlU3Bhbikge1xuICAgICAgcmV0dXJuIGxhc3QudmFsdWVTcGFuLnN0YXJ0Lm9mZnNldDtcbiAgICB9XG4gICAgcmV0dXJuIGFzdC5zb3VyY2VTcGFuLnN0YXJ0Lm9mZnNldDtcbiAgfVxuXG4gIHByaXZhdGUgZGlhZ25vc2VFeHByZXNzaW9uKGFzdDogQVNULCBvZmZzZXQ6IG51bWJlciwgZXZlbnQ6IGJvb2xlYW4pIHtcbiAgICBjb25zdCBzY29wZSA9IHRoaXMuZ2V0RXhwcmVzc2lvblNjb3BlKHRoaXMucGF0aCwgZXZlbnQpO1xuICAgIGNvbnN0IGFuYWx5emVyID0gbmV3IEFzdFR5cGUoc2NvcGUsIHRoaXMuaW5mby5xdWVyeSwge2V2ZW50fSk7XG4gICAgZm9yIChjb25zdCBkaWFnbm9zdGljIG9mIGFuYWx5emVyLmdldERpYWdub3N0aWNzKGFzdCkpIHtcbiAgICAgIGRpYWdub3N0aWMuc3BhbiA9IHRoaXMuYWJzU3BhbihkaWFnbm9zdGljLnNwYW4sIG9mZnNldCk7XG4gICAgICB0aGlzLmRpYWdub3N0aWNzLnB1c2goZGlhZ25vc3RpYyk7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBwdXNoKGFzdDogVGVtcGxhdGVBc3QpIHsgdGhpcy5wYXRoLnB1c2goYXN0KTsgfVxuXG4gIHByaXZhdGUgcG9wKCkgeyB0aGlzLnBhdGgucG9wKCk7IH1cblxuICBwcml2YXRlIGFic1NwYW4oc3BhbjogU3BhbiwgYWRkaXRpb25hbE9mZnNldDogbnVtYmVyID0gMCk6IFNwYW4ge1xuICAgIHJldHVybiB7XG4gICAgICBzdGFydDogc3Bhbi5zdGFydCArIHRoaXMuaW5mby5vZmZzZXQgKyBhZGRpdGlvbmFsT2Zmc2V0LFxuICAgICAgZW5kOiBzcGFuLmVuZCArIHRoaXMuaW5mby5vZmZzZXQgKyBhZGRpdGlvbmFsT2Zmc2V0LFxuICAgIH07XG4gIH1cbn1cblxuZnVuY3Rpb24gaGFzVGVtcGxhdGVSZWZlcmVuY2UodHlwZTogQ29tcGlsZVR5cGVNZXRhZGF0YSk6IGJvb2xlYW4ge1xuICBpZiAodHlwZS5kaURlcHMpIHtcbiAgICBmb3IgKGxldCBkaURlcCBvZiB0eXBlLmRpRGVwcykge1xuICAgICAgaWYgKGRpRGVwLnRva2VuICYmIGRpRGVwLnRva2VuLmlkZW50aWZpZXIgJiZcbiAgICAgICAgICBpZGVudGlmaWVyTmFtZShkaURlcC50b2tlbiAhLmlkZW50aWZpZXIgISkgPT0gJ1RlbXBsYXRlUmVmJylcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICB9XG4gIHJldHVybiBmYWxzZTtcbn1cblxuZnVuY3Rpb24gc3Bhbk9mKHNvdXJjZVNwYW46IFBhcnNlU291cmNlU3Bhbik6IFNwYW4ge1xuICByZXR1cm4ge3N0YXJ0OiBzb3VyY2VTcGFuLnN0YXJ0Lm9mZnNldCwgZW5kOiBzb3VyY2VTcGFuLmVuZC5vZmZzZXR9O1xufVxuIl19