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
        define("@angular/compiler-cli/src/ngtsc/typecheck/src/expression", ["require", "exports", "@angular/compiler", "typescript", "@angular/compiler-cli/src/ngtsc/typecheck/src/diagnostics", "@angular/compiler-cli/src/ngtsc/typecheck/src/ts_util"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var compiler_1 = require("@angular/compiler");
    var ts = require("typescript");
    var diagnostics_1 = require("@angular/compiler-cli/src/ngtsc/typecheck/src/diagnostics");
    var ts_util_1 = require("@angular/compiler-cli/src/ngtsc/typecheck/src/ts_util");
    exports.NULL_AS_ANY = ts.createAsExpression(ts.createNull(), ts.createKeywordTypeNode(ts.SyntaxKind.AnyKeyword));
    var UNDEFINED = ts.createIdentifier('undefined');
    var BINARY_OPS = new Map([
        ['+', ts.SyntaxKind.PlusToken],
        ['-', ts.SyntaxKind.MinusToken],
        ['<', ts.SyntaxKind.LessThanToken],
        ['>', ts.SyntaxKind.GreaterThanToken],
        ['<=', ts.SyntaxKind.LessThanEqualsToken],
        ['>=', ts.SyntaxKind.GreaterThanEqualsToken],
        ['==', ts.SyntaxKind.EqualsEqualsToken],
        ['===', ts.SyntaxKind.EqualsEqualsEqualsToken],
        ['*', ts.SyntaxKind.AsteriskToken],
        ['/', ts.SyntaxKind.SlashToken],
        ['%', ts.SyntaxKind.PercentToken],
        ['!=', ts.SyntaxKind.ExclamationEqualsToken],
        ['!==', ts.SyntaxKind.ExclamationEqualsEqualsToken],
        ['||', ts.SyntaxKind.BarBarToken],
        ['&&', ts.SyntaxKind.AmpersandAmpersandToken],
        ['&', ts.SyntaxKind.AmpersandToken],
        ['|', ts.SyntaxKind.BarToken],
    ]);
    /**
     * Convert an `AST` to TypeScript code directly, without going through an intermediate `Expression`
     * AST.
     */
    function astToTypescript(ast, maybeResolve, config) {
        var translator = new AstTranslator(maybeResolve, config);
        return translator.translate(ast);
    }
    exports.astToTypescript = astToTypescript;
    var AstTranslator = /** @class */ (function () {
        function AstTranslator(maybeResolve, config) {
            this.maybeResolve = maybeResolve;
            this.config = config;
        }
        AstTranslator.prototype.translate = function (ast) {
            // Skip over an `ASTWithSource` as its `visit` method calls directly into its ast's `visit`,
            // which would prevent any custom resolution through `maybeResolve` for that node.
            if (ast instanceof compiler_1.ASTWithSource) {
                ast = ast.ast;
            }
            // The `EmptyExpr` doesn't have a dedicated method on `AstVisitor`, so it's special cased here.
            if (ast instanceof compiler_1.EmptyExpr) {
                return UNDEFINED;
            }
            // First attempt to let any custom resolution logic provide a translation for the given node.
            var resolved = this.maybeResolve(ast);
            if (resolved !== null) {
                return resolved;
            }
            return ast.visit(this);
        };
        AstTranslator.prototype.visitBinary = function (ast) {
            var lhs = diagnostics_1.wrapForDiagnostics(this.translate(ast.left));
            var rhs = diagnostics_1.wrapForDiagnostics(this.translate(ast.right));
            var op = BINARY_OPS.get(ast.operation);
            if (op === undefined) {
                throw new Error("Unsupported Binary.operation: " + ast.operation);
            }
            var node = ts.createBinary(lhs, op, rhs);
            diagnostics_1.addParseSpanInfo(node, ast.sourceSpan);
            return node;
        };
        AstTranslator.prototype.visitChain = function (ast) {
            var _this = this;
            var elements = ast.expressions.map(function (expr) { return _this.translate(expr); });
            var node = diagnostics_1.wrapForDiagnostics(ts.createCommaList(elements));
            diagnostics_1.addParseSpanInfo(node, ast.sourceSpan);
            return node;
        };
        AstTranslator.prototype.visitConditional = function (ast) {
            var condExpr = this.translate(ast.condition);
            var trueExpr = this.translate(ast.trueExp);
            var falseExpr = this.translate(ast.falseExp);
            var node = ts.createParen(ts.createConditional(condExpr, trueExpr, falseExpr));
            diagnostics_1.addParseSpanInfo(node, ast.sourceSpan);
            return node;
        };
        AstTranslator.prototype.visitFunctionCall = function (ast) {
            var _this = this;
            var receiver = diagnostics_1.wrapForDiagnostics(this.translate(ast.target));
            var args = ast.args.map(function (expr) { return _this.translate(expr); });
            var node = ts.createCall(receiver, undefined, args);
            diagnostics_1.addParseSpanInfo(node, ast.sourceSpan);
            return node;
        };
        AstTranslator.prototype.visitImplicitReceiver = function (ast) {
            throw new Error('Method not implemented.');
        };
        AstTranslator.prototype.visitInterpolation = function (ast) {
            var _this = this;
            // Build up a chain of binary + operations to simulate the string concatenation of the
            // interpolation's expressions. The chain is started using an actual string literal to ensure
            // the type is inferred as 'string'.
            return ast.expressions.reduce(function (lhs, ast) { return ts.createBinary(lhs, ts.SyntaxKind.PlusToken, _this.translate(ast)); }, ts.createLiteral(''));
        };
        AstTranslator.prototype.visitKeyedRead = function (ast) {
            var receiver = diagnostics_1.wrapForDiagnostics(this.translate(ast.obj));
            var key = this.translate(ast.key);
            var node = ts.createElementAccess(receiver, key);
            diagnostics_1.addParseSpanInfo(node, ast.sourceSpan);
            return node;
        };
        AstTranslator.prototype.visitKeyedWrite = function (ast) {
            var receiver = diagnostics_1.wrapForDiagnostics(this.translate(ast.obj));
            var left = ts.createElementAccess(receiver, this.translate(ast.key));
            // TODO(joost): annotate `left` with the span of the element access, which is not currently
            //  available on `ast`.
            var right = this.translate(ast.value);
            var node = diagnostics_1.wrapForDiagnostics(ts.createBinary(left, ts.SyntaxKind.EqualsToken, right));
            diagnostics_1.addParseSpanInfo(node, ast.sourceSpan);
            return node;
        };
        AstTranslator.prototype.visitLiteralArray = function (ast) {
            var _this = this;
            var elements = ast.expressions.map(function (expr) { return _this.translate(expr); });
            var literal = ts.createArrayLiteral(elements);
            // If strictLiteralTypes is disabled, array literals are cast to `any`.
            var node = this.config.strictLiteralTypes ? literal : ts_util_1.tsCastToAny(literal);
            diagnostics_1.addParseSpanInfo(node, ast.sourceSpan);
            return node;
        };
        AstTranslator.prototype.visitLiteralMap = function (ast) {
            var _this = this;
            var properties = ast.keys.map(function (_a, idx) {
                var key = _a.key;
                var value = _this.translate(ast.values[idx]);
                return ts.createPropertyAssignment(ts.createStringLiteral(key), value);
            });
            var literal = ts.createObjectLiteral(properties, true);
            // If strictLiteralTypes is disabled, object literals are cast to `any`.
            var node = this.config.strictLiteralTypes ? literal : ts_util_1.tsCastToAny(literal);
            diagnostics_1.addParseSpanInfo(node, ast.sourceSpan);
            return node;
        };
        AstTranslator.prototype.visitLiteralPrimitive = function (ast) {
            var node;
            if (ast.value === undefined) {
                node = ts.createIdentifier('undefined');
            }
            else if (ast.value === null) {
                node = ts.createNull();
            }
            else {
                node = ts.createLiteral(ast.value);
            }
            diagnostics_1.addParseSpanInfo(node, ast.sourceSpan);
            return node;
        };
        AstTranslator.prototype.visitMethodCall = function (ast) {
            var _this = this;
            var receiver = diagnostics_1.wrapForDiagnostics(this.translate(ast.receiver));
            var method = ts.createPropertyAccess(receiver, ast.name);
            var args = ast.args.map(function (expr) { return _this.translate(expr); });
            var node = ts.createCall(method, undefined, args);
            diagnostics_1.addParseSpanInfo(node, ast.sourceSpan);
            return node;
        };
        AstTranslator.prototype.visitNonNullAssert = function (ast) {
            var expr = diagnostics_1.wrapForDiagnostics(this.translate(ast.expression));
            var node = ts.createNonNullExpression(expr);
            diagnostics_1.addParseSpanInfo(node, ast.sourceSpan);
            return node;
        };
        AstTranslator.prototype.visitPipe = function (ast) { throw new Error('Method not implemented.'); };
        AstTranslator.prototype.visitPrefixNot = function (ast) {
            var expression = diagnostics_1.wrapForDiagnostics(this.translate(ast.expression));
            var node = ts.createLogicalNot(expression);
            diagnostics_1.addParseSpanInfo(node, ast.sourceSpan);
            return node;
        };
        AstTranslator.prototype.visitPropertyRead = function (ast) {
            // This is a normal property read - convert the receiver to an expression and emit the correct
            // TypeScript expression to read the property.
            var receiver = diagnostics_1.wrapForDiagnostics(this.translate(ast.receiver));
            var node = ts.createPropertyAccess(receiver, ast.name);
            diagnostics_1.addParseSpanInfo(node, ast.sourceSpan);
            return node;
        };
        AstTranslator.prototype.visitPropertyWrite = function (ast) {
            var receiver = diagnostics_1.wrapForDiagnostics(this.translate(ast.receiver));
            var left = ts.createPropertyAccess(receiver, ast.name);
            // TODO(joost): annotate `left` with the span of the property access, which is not currently
            //  available on `ast`.
            var right = this.translate(ast.value);
            var node = diagnostics_1.wrapForDiagnostics(ts.createBinary(left, ts.SyntaxKind.EqualsToken, right));
            diagnostics_1.addParseSpanInfo(node, ast.sourceSpan);
            return node;
        };
        AstTranslator.prototype.visitQuote = function (ast) { throw new Error('Method not implemented.'); };
        AstTranslator.prototype.visitSafeMethodCall = function (ast) {
            var _this = this;
            // See the comments in SafePropertyRead above for an explanation of the cases here.
            var node;
            var receiver = diagnostics_1.wrapForDiagnostics(this.translate(ast.receiver));
            var args = ast.args.map(function (expr) { return _this.translate(expr); });
            if (this.config.strictSafeNavigationTypes) {
                // "a?.method(...)" becomes (null as any ? a!.method(...) : undefined)
                var method = ts.createPropertyAccess(ts.createNonNullExpression(receiver), ast.name);
                var call = ts.createCall(method, undefined, args);
                node = ts.createParen(ts.createConditional(exports.NULL_AS_ANY, call, UNDEFINED));
            }
            else if (VeSafeLhsInferenceBugDetector.veWillInferAnyFor(ast)) {
                // "a?.method(...)" becomes (a as any).method(...)
                var method = ts.createPropertyAccess(ts_util_1.tsCastToAny(receiver), ast.name);
                node = ts.createCall(method, undefined, args);
            }
            else {
                // "a?.method(...)" becomes (a!.method(...) as any)
                var method = ts.createPropertyAccess(ts.createNonNullExpression(receiver), ast.name);
                node = ts_util_1.tsCastToAny(ts.createCall(method, undefined, args));
            }
            diagnostics_1.addParseSpanInfo(node, ast.sourceSpan);
            return node;
        };
        AstTranslator.prototype.visitSafePropertyRead = function (ast) {
            var node;
            var receiver = diagnostics_1.wrapForDiagnostics(this.translate(ast.receiver));
            // The form of safe property reads depends on whether strictness is in use.
            if (this.config.strictSafeNavigationTypes) {
                // Basically, the return here is either the type of the complete expression with a null-safe
                // property read, or `undefined`. So a ternary is used to create an "or" type:
                // "a?.b" becomes (null as any ? a!.b : undefined)
                // The type of this expression is (typeof a!.b) | undefined, which is exactly as desired.
                var expr = ts.createPropertyAccess(ts.createNonNullExpression(receiver), ast.name);
                node = ts.createParen(ts.createConditional(exports.NULL_AS_ANY, expr, UNDEFINED));
            }
            else if (VeSafeLhsInferenceBugDetector.veWillInferAnyFor(ast)) {
                // Emulate a View Engine bug where 'any' is inferred for the left-hand side of the safe
                // navigation operation. With this bug, the type of the left-hand side is regarded as any.
                // Therefore, the left-hand side only needs repeating in the output (to validate it), and then
                // 'any' is used for the rest of the expression. This is done using a comma operator:
                // "a?.b" becomes (a as any).b, which will of course have type 'any'.
                node = ts.createPropertyAccess(ts_util_1.tsCastToAny(receiver), ast.name);
            }
            else {
                // The View Engine bug isn't active, so check the entire type of the expression, but the final
                // result is still inferred as `any`.
                // "a?.b" becomes (a!.b as any)
                var expr = ts.createPropertyAccess(ts.createNonNullExpression(receiver), ast.name);
                node = ts_util_1.tsCastToAny(expr);
            }
            diagnostics_1.addParseSpanInfo(node, ast.sourceSpan);
            return node;
        };
        return AstTranslator;
    }());
    /**
     * Checks whether View Engine will infer a type of 'any' for the left-hand side of a safe navigation
     * operation.
     *
     * In View Engine's template type-checker, certain receivers of safe navigation operations will
     * cause a temporary variable to be allocated as part of the checking expression, to save the value
     * of the receiver and use it more than once in the expression. This temporary variable has type
     * 'any'. In practice, this means certain receivers cause View Engine to not check the full
     * expression, and other receivers will receive more complete checking.
     *
     * For compatibility, this logic is adapted from View Engine's expression_converter.ts so that the
     * Ivy checker can emulate this bug when needed.
     */
    var VeSafeLhsInferenceBugDetector = /** @class */ (function () {
        function VeSafeLhsInferenceBugDetector() {
        }
        VeSafeLhsInferenceBugDetector.veWillInferAnyFor = function (ast) {
            return ast.receiver.visit(VeSafeLhsInferenceBugDetector.SINGLETON);
        };
        VeSafeLhsInferenceBugDetector.prototype.visitBinary = function (ast) { return ast.left.visit(this) || ast.right.visit(this); };
        VeSafeLhsInferenceBugDetector.prototype.visitChain = function (ast) { return false; };
        VeSafeLhsInferenceBugDetector.prototype.visitConditional = function (ast) {
            return ast.condition.visit(this) || ast.trueExp.visit(this) || ast.falseExp.visit(this);
        };
        VeSafeLhsInferenceBugDetector.prototype.visitFunctionCall = function (ast) { return true; };
        VeSafeLhsInferenceBugDetector.prototype.visitImplicitReceiver = function (ast) { return false; };
        VeSafeLhsInferenceBugDetector.prototype.visitInterpolation = function (ast) {
            var _this = this;
            return ast.expressions.some(function (exp) { return exp.visit(_this); });
        };
        VeSafeLhsInferenceBugDetector.prototype.visitKeyedRead = function (ast) { return false; };
        VeSafeLhsInferenceBugDetector.prototype.visitKeyedWrite = function (ast) { return false; };
        VeSafeLhsInferenceBugDetector.prototype.visitLiteralArray = function (ast) { return true; };
        VeSafeLhsInferenceBugDetector.prototype.visitLiteralMap = function (ast) { return true; };
        VeSafeLhsInferenceBugDetector.prototype.visitLiteralPrimitive = function (ast) { return false; };
        VeSafeLhsInferenceBugDetector.prototype.visitMethodCall = function (ast) { return true; };
        VeSafeLhsInferenceBugDetector.prototype.visitPipe = function (ast) { return true; };
        VeSafeLhsInferenceBugDetector.prototype.visitPrefixNot = function (ast) { return ast.expression.visit(this); };
        VeSafeLhsInferenceBugDetector.prototype.visitNonNullAssert = function (ast) { return ast.expression.visit(this); };
        VeSafeLhsInferenceBugDetector.prototype.visitPropertyRead = function (ast) { return false; };
        VeSafeLhsInferenceBugDetector.prototype.visitPropertyWrite = function (ast) { return false; };
        VeSafeLhsInferenceBugDetector.prototype.visitQuote = function (ast) { return false; };
        VeSafeLhsInferenceBugDetector.prototype.visitSafeMethodCall = function (ast) { return true; };
        VeSafeLhsInferenceBugDetector.prototype.visitSafePropertyRead = function (ast) { return false; };
        VeSafeLhsInferenceBugDetector.SINGLETON = new VeSafeLhsInferenceBugDetector();
        return VeSafeLhsInferenceBugDetector;
    }());
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXhwcmVzc2lvbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbXBpbGVyLWNsaS9zcmMvbmd0c2MvdHlwZWNoZWNrL3NyYy9leHByZXNzaW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7O0lBRUgsOENBQW1WO0lBQ25WLCtCQUFpQztJQUdqQyx5RkFBc0Y7SUFDdEYsaUZBQXNDO0lBRXpCLFFBQUEsV0FBVyxHQUNwQixFQUFFLENBQUMsa0JBQWtCLENBQUMsRUFBRSxDQUFDLFVBQVUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxxQkFBcUIsQ0FBQyxFQUFFLENBQUMsVUFBVSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUM7SUFDL0YsSUFBTSxTQUFTLEdBQUcsRUFBRSxDQUFDLGdCQUFnQixDQUFDLFdBQVcsQ0FBQyxDQUFDO0lBRW5ELElBQU0sVUFBVSxHQUFHLElBQUksR0FBRyxDQUF3QjtRQUNoRCxDQUFDLEdBQUcsRUFBRSxFQUFFLENBQUMsVUFBVSxDQUFDLFNBQVMsQ0FBQztRQUM5QixDQUFDLEdBQUcsRUFBRSxFQUFFLENBQUMsVUFBVSxDQUFDLFVBQVUsQ0FBQztRQUMvQixDQUFDLEdBQUcsRUFBRSxFQUFFLENBQUMsVUFBVSxDQUFDLGFBQWEsQ0FBQztRQUNsQyxDQUFDLEdBQUcsRUFBRSxFQUFFLENBQUMsVUFBVSxDQUFDLGdCQUFnQixDQUFDO1FBQ3JDLENBQUMsSUFBSSxFQUFFLEVBQUUsQ0FBQyxVQUFVLENBQUMsbUJBQW1CLENBQUM7UUFDekMsQ0FBQyxJQUFJLEVBQUUsRUFBRSxDQUFDLFVBQVUsQ0FBQyxzQkFBc0IsQ0FBQztRQUM1QyxDQUFDLElBQUksRUFBRSxFQUFFLENBQUMsVUFBVSxDQUFDLGlCQUFpQixDQUFDO1FBQ3ZDLENBQUMsS0FBSyxFQUFFLEVBQUUsQ0FBQyxVQUFVLENBQUMsdUJBQXVCLENBQUM7UUFD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QUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQzlFLDBEQUFrQixHQUFsQixVQUFtQixHQUFjLElBQWEsT0FBTyxHQUFHLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDbEYseURBQWlCLEdBQWpCLFVBQWtCLEdBQWlCLElBQWEsT0FBTyxLQUFLLENBQUMsQ0FBQyxDQUFDO1FBQy9ELDBEQUFrQixHQUFsQixVQUFtQixHQUFrQixJQUFhLE9BQU8sS0FBSyxDQUFDLENBQUMsQ0FBQztRQUNqRSxrREFBVSxHQUFWLFVBQVcsR0FBVSxJQUFhLE9BQU8sS0FBSyxDQUFDLENBQUMsQ0FBQztRQUNqRCwyREFBbUIsR0FBbkIsVUFBb0IsR0FBbUIsSUFBYSxPQUFPLElBQUksQ0FBQyxDQUFDLENBQUM7UUFDbEUsNkRBQXFCLEdBQXJCLFVBQXNCLEdBQXFCLElBQWEsT0FBTyxLQUFLLENBQUMsQ0FBQyxDQUFDO1FBN0J4RCx1Q0FBUyxHQUFHLElBQUksNkJBQTZCLEVBQUUsQ0FBQztRQThCakUsb0NBQUM7S0FBQSxBQS9CRCxJQStCQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtBU1QsIEFTVFdpdGhTb3VyY2UsIEFzdFZpc2l0b3IsIEJpbmFyeSwgQmluZGluZ1BpcGUsIENoYWluLCBDb25kaXRpb25hbCwgRW1wdHlFeHByLCBGdW5jdGlvbkNhbGwsIEltcGxpY2l0UmVjZWl2ZXIsIEludGVycG9sYXRpb24sIEtleWVkUmVhZCwgS2V5ZWRXcml0ZSwgTGl0ZXJhbEFycmF5LCBMaXRlcmFsTWFwLCBMaXRlcmFsUHJpbWl0aXZlLCBNZXRob2RDYWxsLCBOb25OdWxsQXNzZXJ0LCBQcmVmaXhOb3QsIFByb3BlcnR5UmVhZCwgUHJvcGVydHlXcml0ZSwgUXVvdGUsIFNhZmVNZXRob2RDYWxsLCBTYWZlUHJvcGVydHlSZWFkfSBmcm9tICdAYW5ndWxhci9jb21waWxlcic7XG5pbXBvcnQgKiBhcyB0cyBmcm9tICd0eXBlc2NyaXB0JztcblxuaW1wb3J0IHtUeXBlQ2hlY2tpbmdDb25maWd9IGZyb20gJy4vYXBpJztcbmltcG9ydCB7YWRkUGFyc2VTcGFuSW5mbywgaWdub3JlRGlhZ25vc3RpY3MsIHdyYXBGb3JEaWFnbm9zdGljc30gZnJvbSAnLi9kaWFnbm9zdGljcyc7XG5pbXBvcnQge3RzQ2FzdFRvQW55fSBmcm9tICcuL3RzX3V0aWwnO1xuXG5leHBvcnQgY29uc3QgTlVMTF9BU19BTlkgPVxuICAgIHRzLmNyZWF0ZUFzRXhwcmVzc2lvbih0cy5jcmVhdGVOdWxsKCksIHRzLmNyZWF0ZUtleXdvcmRUeXBlTm9kZSh0cy5TeW50YXhLaW5kLkFueUtleXdvcmQpKTtcbmNvbnN0IFVOREVGSU5FRCA9IHRzLmNyZWF0ZUlkZW50aWZpZXIoJ3VuZGVmaW5lZCcpO1xuXG5jb25zdCBCSU5BUllfT1BTID0gbmV3IE1hcDxzdHJpbmcsIHRzLlN5bnRheEtpbmQ+KFtcbiAgWycrJywgdHMuU3ludGF4S2luZC5QbHVzVG9rZW5dLFxuICBbJy0nLCB0cy5TeW50YXhLaW5kLk1pbnVzVG9rZW5dLFxuICBbJzwnLCB0cy5TeW50YXhLaW5kLkxlc3NUaGFuVG9rZW5dLFxuICBbJz4nLCB0cy5TeW50YXhLaW5kLkdyZWF0ZXJUaGFuVG9rZW5dLFxuICBbJzw9JywgdHMuU3ludGF4S2luZC5MZXNzVGhhbkVxdWFsc1Rva2VuXSxcbiAgWyc+PScsIHRzLlN5bnRheEtpbmQuR3JlYXRlclRoYW5FcXVhbHNUb2tlbl0sXG4gIFsnPT0nLCB0cy5TeW50YXhLaW5kLkVxdWFsc0VxdWFsc1Rva2VuXSxcbiAgWyc9PT0nLCB0cy5TeW50YXhLaW5kLkVxdWFsc0VxdWFsc0VxdWFsc1Rva2VuXSxcbiAgWycqJywgdHMuU3ludGF4S2luZC5Bc3Rlcmlza1Rva2VuXSxcbiAgWycvJywgdHMuU3ludGF4S2luZC5TbGFzaFRva2VuXSxcbiAgWyclJywgdHMuU3ludGF4S2luZC5QZXJjZW50VG9rZW5dLFxuICBbJyE9JywgdHMuU3ludGF4S2luZC5FeGNsYW1hdGlvbkVxdWFsc1Rva2VuXSxcbiAgWychPT0nLCB0cy5TeW50YXhLaW5kLkV4Y2xhbWF0aW9uRXF1YWxzRXF1YWxzVG9rZW5dLFxuICBbJ3x8JywgdHMuU3ludGF4S2luZC5CYXJCYXJUb2tlbl0sXG4gIFsnJiYnLCB0cy5TeW50YXhLaW5kLkFtcGVyc2FuZEFtcGVyc2FuZFRva2VuXSxcbiAgWycmJywgdHMuU3ludGF4S2luZC5BbXBlcnNhbmRUb2tlbl0sXG4gIFsnfCcsIHRzLlN5bnRheEtpbmQuQmFyVG9rZW5dLFxuXSk7XG5cbi8qKlxuICogQ29udmVydCBhbiBgQVNUYCB0byBUeXBlU2NyaXB0IGNvZGUgZGlyZWN0bHksIHdpdGhvdXQgZ29pbmcgdGhyb3VnaCBhbiBpbnRlcm1lZGlhdGUgYEV4cHJlc3Npb25gXG4gKiBBU1QuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBhc3RUb1R5cGVzY3JpcHQoXG4gICAgYXN0OiBBU1QsIG1heWJlUmVzb2x2ZTogKGFzdDogQVNUKSA9PiAodHMuRXhwcmVzc2lvbiB8IG51bGwpLFxuICAgIGNvbmZpZzogVHlwZUNoZWNraW5nQ29uZmlnKTogdHMuRXhwcmVzc2lvbiB7XG4gIGNvbnN0IHRyYW5zbGF0b3IgPSBuZXcgQXN0VHJhbnNsYXRvcihtYXliZVJlc29sdmUsIGNvbmZpZyk7XG4gIHJldHVybiB0cmFuc2xhdG9yLnRyYW5zbGF0ZShhc3QpO1xufVxuXG5jbGFzcyBBc3RUcmFuc2xhdG9yIGltcGxlbWVudHMgQXN0VmlzaXRvciB7XG4gIGNvbnN0cnVjdG9yKFxuICAgICAgcHJpdmF0ZSBtYXliZVJlc29sdmU6IChhc3Q6IEFTVCkgPT4gKHRzLkV4cHJlc3Npb24gfCBudWxsKSxcbiAgICAgIHByaXZhdGUgY29uZmlnOiBUeXBlQ2hlY2tpbmdDb25maWcpIHt9XG5cbiAgdHJhbnNsYXRlKGFzdDogQVNUKTogdHMuRXhwcmVzc2lvbiB7XG4gICAgLy8gU2tpcCBvdmVyIGFuIGBBU1RXaXRoU291cmNlYCBhcyBpdHMgYHZpc2l0YCBtZXRob2QgY2FsbHMgZGlyZWN0bHkgaW50byBpdHMgYXN0J3MgYHZpc2l0YCxcbiAgICAvLyB3aGljaCB3b3VsZCBwcmV2ZW50IGFueSBjdXN0b20gcmVzb2x1dGlvbiB0aHJvdWdoIGBtYXliZVJlc29sdmVgIGZvciB0aGF0IG5vZGUuXG4gICAgaWYgKGFzdCBpbnN0YW5jZW9mIEFTVFdpdGhTb3VyY2UpIHtcbiAgICAgIGFzdCA9IGFzdC5hc3Q7XG4gICAgfVxuXG4gICAgLy8gVGhlIGBFbXB0eUV4cHJgIGRvZXNuJ3QgaGF2ZSBhIGRlZGljYXRlZCBtZXRob2Qgb24gYEFzdFZpc2l0b3JgLCBzbyBpdCdzIHNwZWNpYWwgY2FzZWQgaGVyZS5cbiAgICBpZiAoYXN0IGluc3RhbmNlb2YgRW1wdHlFeHByKSB7XG4gICAgICByZXR1cm4gVU5ERUZJTkVEO1xuICAgIH1cblxuICAgIC8vIEZpcnN0IGF0dGVtcHQgdG8gbGV0IGFueSBjdXN0b20gcmVzb2x1dGlvbiBsb2dpYyBwcm92aWRlIGEgdHJhbnNsYXRpb24gZm9yIHRoZSBnaXZlbiBub2RlLlxuICAgIGNvbnN0IHJlc29sdmVkID0gdGhpcy5tYXliZVJlc29sdmUoYXN0KTtcbiAgICBpZiAocmVzb2x2ZWQgIT09IG51bGwpIHtcbiAgICAgIHJldHVybiByZXNvbHZlZDtcbiAgICB9XG5cbiAgICByZXR1cm4gYXN0LnZpc2l0KHRoaXMpO1xuICB9XG5cbiAgdmlzaXRCaW5hcnkoYXN0OiBCaW5hcnkpOiB0cy5FeHByZXNzaW9uIHtcbiAgICBjb25zdCBsaHMgPSB3cmFwRm9yRGlhZ25vc3RpY3ModGhpcy50cmFuc2xhdGUoYXN0LmxlZnQpKTtcbiAgICBjb25zdCByaHMgPSB3cmFwRm9yRGlhZ25vc3RpY3ModGhpcy50cmFuc2xhdGUoYXN0LnJpZ2h0KSk7XG4gICAgY29uc3Qgb3AgPSBCSU5BUllfT1BTLmdldChhc3Qub3BlcmF0aW9uKTtcbiAgICBpZiAob3AgPT09IHVuZGVmaW5lZCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBVbnN1cHBvcnRlZCBCaW5hcnkub3BlcmF0aW9uOiAke2FzdC5vcGVyYXRpb259YCk7XG4gICAgfVxuICAgIGNvbnN0IG5vZGUgPSB0cy5jcmVhdGVCaW5hcnkobGhzLCBvcCBhcyBhbnksIHJocyk7XG4gICAgYWRkUGFyc2VTcGFuSW5mbyhub2RlLCBhc3Quc291cmNlU3Bhbik7XG4gICAgcmV0dXJuIG5vZGU7XG4gIH1cblxuICB2aXNpdENoYWluKGFzdDogQ2hhaW4pOiB0cy5FeHByZXNzaW9uIHtcbiAgICBjb25zdCBlbGVtZW50cyA9IGFzdC5leHByZXNzaW9ucy5tYXAoZXhwciA9PiB0aGlzLnRyYW5zbGF0ZShleHByKSk7XG4gICAgY29uc3Qgbm9kZSA9IHdyYXBGb3JEaWFnbm9zdGljcyh0cy5jcmVhdGVDb21tYUxpc3QoZWxlbWVudHMpKTtcbiAgICBhZGRQYXJzZVNwYW5JbmZvKG5vZGUsIGFzdC5zb3VyY2VTcGFuKTtcbiAgICByZXR1cm4gbm9kZTtcbiAgfVxuXG4gIHZpc2l0Q29uZGl0aW9uYWwoYXN0OiBDb25kaXRpb25hbCk6IHRzLkV4cHJlc3Npb24ge1xuICAgIGNvbnN0IGNvbmRFeHByID0gdGhpcy50cmFuc2xhdGUoYXN0LmNvbmRpdGlvbik7XG4gICAgY29uc3QgdHJ1ZUV4cHIgPSB0aGlzLnRyYW5zbGF0ZShhc3QudHJ1ZUV4cCk7XG4gICAgY29uc3QgZmFsc2VFeHByID0gdGhpcy50cmFuc2xhdGUoYXN0LmZhbHNlRXhwKTtcbiAgICBjb25zdCBub2RlID0gdHMuY3JlYXRlUGFyZW4odHMuY3JlYXRlQ29uZGl0aW9uYWwoY29uZEV4cHIsIHRydWVFeHByLCBmYWxzZUV4cHIpKTtcbiAgICBhZGRQYXJzZVNwYW5JbmZvKG5vZGUsIGFzdC5zb3VyY2VTcGFuKTtcbiAgICByZXR1cm4gbm9kZTtcbiAgfVxuXG4gIHZpc2l0RnVuY3Rpb25DYWxsKGFzdDogRnVuY3Rpb25DYWxsKTogdHMuRXhwcmVzc2lvbiB7XG4gICAgY29uc3QgcmVjZWl2ZXIgPSB3cmFwRm9yRGlhZ25vc3RpY3ModGhpcy50cmFuc2xhdGUoYXN0LnRhcmdldCAhKSk7XG4gICAgY29uc3QgYXJncyA9IGFzdC5hcmdzLm1hcChleHByID0+IHRoaXMudHJhbnNsYXRlKGV4cHIpKTtcbiAgICBjb25zdCBub2RlID0gdHMuY3JlYXRlQ2FsbChyZWNlaXZlciwgdW5kZWZpbmVkLCBhcmdzKTtcbiAgICBhZGRQYXJzZVNwYW5JbmZvKG5vZGUsIGFzdC5zb3VyY2VTcGFuKTtcbiAgICByZXR1cm4gbm9kZTtcbiAgfVxuXG4gIHZpc2l0SW1wbGljaXRSZWNlaXZlcihhc3Q6IEltcGxpY2l0UmVjZWl2ZXIpOiBuZXZlciB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdNZXRob2Qgbm90IGltcGxlbWVudGVkLicpO1xuICB9XG5cbiAgdmlzaXRJbnRlcnBvbGF0aW9uKGFzdDogSW50ZXJwb2xhdGlvbik6IHRzLkV4cHJlc3Npb24ge1xuICAgIC8vIEJ1aWxkIHVwIGEgY2hhaW4gb2YgYmluYXJ5ICsgb3BlcmF0aW9ucyB0byBzaW11bGF0ZSB0aGUgc3RyaW5nIGNvbmNhdGVuYXRpb24gb2YgdGhlXG4gICAgLy8gaW50ZXJwb2xhdGlvbidzIGV4cHJlc3Npb25zLiBUaGUgY2hhaW4gaXMgc3RhcnRlZCB1c2luZyBhbiBhY3R1YWwgc3RyaW5nIGxpdGVyYWwgdG8gZW5zdXJlXG4gICAgLy8gdGhlIHR5cGUgaXMgaW5mZXJyZWQgYXMgJ3N0cmluZycuXG4gICAgcmV0dXJuIGFzdC5leHByZXNzaW9ucy5yZWR1Y2UoXG4gICAgICAgIChsaHMsIGFzdCkgPT4gdHMuY3JlYXRlQmluYXJ5KGxocywgdHMuU3ludGF4S2luZC5QbHVzVG9rZW4sIHRoaXMudHJhbnNsYXRlKGFzdCkpLFxuICAgICAgICB0cy5jcmVhdGVMaXRlcmFsKCcnKSk7XG4gIH1cblxuICB2aXNpdEtleWVkUmVhZChhc3Q6IEtleWVkUmVhZCk6IHRzLkV4cHJlc3Npb24ge1xuICAgIGNvbnN0IHJlY2VpdmVyID0gd3JhcEZvckRpYWdub3N0aWNzKHRoaXMudHJhbnNsYXRlKGFzdC5vYmopKTtcbiAgICBjb25zdCBrZXkgPSB0aGlzLnRyYW5zbGF0ZShhc3Qua2V5KTtcbiAgICBjb25zdCBub2RlID0gdHMuY3JlYXRlRWxlbWVudEFjY2VzcyhyZWNlaXZlciwga2V5KTtcbiAgICBhZGRQYXJzZVNwYW5JbmZvKG5vZGUsIGFzdC5zb3VyY2VTcGFuKTtcbiAgICByZXR1cm4gbm9kZTtcbiAgfVxuXG4gIHZpc2l0S2V5ZWRXcml0ZShhc3Q6IEtleWVkV3JpdGUpOiB0cy5FeHByZXNzaW9uIHtcbiAgICBjb25zdCByZWNlaXZlciA9IHdyYXBGb3JEaWFnbm9zdGljcyh0aGlzLnRyYW5zbGF0ZShhc3Qub2JqKSk7XG4gICAgY29uc3QgbGVmdCA9IHRzLmNyZWF0ZUVsZW1lbnRBY2Nlc3MocmVjZWl2ZXIsIHRoaXMudHJhbnNsYXRlKGFzdC5rZXkpKTtcbiAgICAvLyBUT0RPKGpvb3N0KTogYW5ub3RhdGUgYGxlZnRgIHdpdGggdGhlIHNwYW4gb2YgdGhlIGVsZW1lbnQgYWNjZXNzLCB3aGljaCBpcyBub3QgY3VycmVudGx5XG4gICAgLy8gIGF2YWlsYWJsZSBvbiBgYXN0YC5cbiAgICBjb25zdCByaWdodCA9IHRoaXMudHJhbnNsYXRlKGFzdC52YWx1ZSk7XG4gICAgY29uc3Qgbm9kZSA9IHdyYXBGb3JEaWFnbm9zdGljcyh0cy5jcmVhdGVCaW5hcnkobGVmdCwgdHMuU3ludGF4S2luZC5FcXVhbHNUb2tlbiwgcmlnaHQpKTtcbiAgICBhZGRQYXJzZVNwYW5JbmZvKG5vZGUsIGFzdC5zb3VyY2VTcGFuKTtcbiAgICByZXR1cm4gbm9kZTtcbiAgfVxuXG4gIHZpc2l0TGl0ZXJhbEFycmF5KGFzdDogTGl0ZXJhbEFycmF5KTogdHMuRXhwcmVzc2lvbiB7XG4gICAgY29uc3QgZWxlbWVudHMgPSBhc3QuZXhwcmVzc2lvbnMubWFwKGV4cHIgPT4gdGhpcy50cmFuc2xhdGUoZXhwcikpO1xuICAgIGNvbnN0IGxpdGVyYWwgPSB0cy5jcmVhdGVBcnJheUxpdGVyYWwoZWxlbWVudHMpO1xuICAgIC8vIElmIHN0cmljdExpdGVyYWxUeXBlcyBpcyBkaXNhYmxlZCwgYXJyYXkgbGl0ZXJhbHMgYXJlIGNhc3QgdG8gYGFueWAuXG4gICAgY29uc3Qgbm9kZSA9IHRoaXMuY29uZmlnLnN0cmljdExpdGVyYWxUeXBlcyA/IGxpdGVyYWwgOiB0c0Nhc3RUb0FueShsaXRlcmFsKTtcbiAgICBhZGRQYXJzZVNwYW5JbmZvKG5vZGUsIGFzdC5zb3VyY2VTcGFuKTtcbiAgICByZXR1cm4gbm9kZTtcbiAgfVxuXG4gIHZpc2l0TGl0ZXJhbE1hcChhc3Q6IExpdGVyYWxNYXApOiB0cy5FeHByZXNzaW9uIHtcbiAgICBjb25zdCBwcm9wZXJ0aWVzID0gYXN0LmtleXMubWFwKCh7a2V5fSwgaWR4KSA9PiB7XG4gICAgICBjb25zdCB2YWx1ZSA9IHRoaXMudHJhbnNsYXRlKGFzdC52YWx1ZXNbaWR4XSk7XG4gICAgICByZXR1cm4gdHMuY3JlYXRlUHJvcGVydHlBc3NpZ25tZW50KHRzLmNyZWF0ZVN0cmluZ0xpdGVyYWwoa2V5KSwgdmFsdWUpO1xuICAgIH0pO1xuICAgIGNvbnN0IGxpdGVyYWwgPSB0cy5jcmVhdGVPYmplY3RMaXRlcmFsKHByb3BlcnRpZXMsIHRydWUpO1xuICAgIC8vIElmIHN0cmljdExpdGVyYWxUeXBlcyBpcyBkaXNhYmxlZCwgb2JqZWN0IGxpdGVyYWxzIGFyZSBjYXN0IHRvIGBhbnlgLlxuICAgIGNvbnN0IG5vZGUgPSB0aGlzLmNvbmZpZy5zdHJpY3RMaXRlcmFsVHlwZXMgPyBsaXRlcmFsIDogdHNDYXN0VG9BbnkobGl0ZXJhbCk7XG4gICAgYWRkUGFyc2VTcGFuSW5mbyhub2RlLCBhc3Quc291cmNlU3Bhbik7XG4gICAgcmV0dXJuIG5vZGU7XG4gIH1cblxuICB2aXNpdExpdGVyYWxQcmltaXRpdmUoYXN0OiBMaXRlcmFsUHJpbWl0aXZlKTogdHMuRXhwcmVzc2lvbiB7XG4gICAgbGV0IG5vZGU6IHRzLkV4cHJlc3Npb247XG4gICAgaWYgKGFzdC52YWx1ZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICBub2RlID0gdHMuY3JlYXRlSWRlbnRpZmllcigndW5kZWZpbmVkJyk7XG4gICAgfSBlbHNlIGlmIChhc3QudmFsdWUgPT09IG51bGwpIHtcbiAgICAgIG5vZGUgPSB0cy5jcmVhdGVOdWxsKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIG5vZGUgPSB0cy5jcmVhdGVMaXRlcmFsKGFzdC52YWx1ZSk7XG4gICAgfVxuICAgIGFkZFBhcnNlU3BhbkluZm8obm9kZSwgYXN0LnNvdXJjZVNwYW4pO1xuICAgIHJldHVybiBub2RlO1xuICB9XG5cbiAgdmlzaXRNZXRob2RDYWxsKGFzdDogTWV0aG9kQ2FsbCk6IHRzLkV4cHJlc3Npb24ge1xuICAgIGNvbnN0IHJlY2VpdmVyID0gd3JhcEZvckRpYWdub3N0aWNzKHRoaXMudHJhbnNsYXRlKGFzdC5yZWNlaXZlcikpO1xuICAgIGNvbnN0IG1ldGhvZCA9IHRzLmNyZWF0ZVByb3BlcnR5QWNjZXNzKHJlY2VpdmVyLCBhc3QubmFtZSk7XG4gICAgY29uc3QgYXJncyA9IGFzdC5hcmdzLm1hcChleHByID0+IHRoaXMudHJhbnNsYXRlKGV4cHIpKTtcbiAgICBjb25zdCBub2RlID0gdHMuY3JlYXRlQ2FsbChtZXRob2QsIHVuZGVmaW5lZCwgYXJncyk7XG4gICAgYWRkUGFyc2VTcGFuSW5mbyhub2RlLCBhc3Quc291cmNlU3Bhbik7XG4gICAgcmV0dXJuIG5vZGU7XG4gIH1cblxuICB2aXNpdE5vbk51bGxBc3NlcnQoYXN0OiBOb25OdWxsQXNzZXJ0KTogdHMuRXhwcmVzc2lvbiB7XG4gICAgY29uc3QgZXhwciA9IHdyYXBGb3JEaWFnbm9zdGljcyh0aGlzLnRyYW5zbGF0ZShhc3QuZXhwcmVzc2lvbikpO1xuICAgIGNvbnN0IG5vZGUgPSB0cy5jcmVhdGVOb25OdWxsRXhwcmVzc2lvbihleHByKTtcbiAgICBhZGRQYXJzZVNwYW5JbmZvKG5vZGUsIGFzdC5zb3VyY2VTcGFuKTtcbiAgICByZXR1cm4gbm9kZTtcbiAgfVxuXG4gIHZpc2l0UGlwZShhc3Q6IEJpbmRpbmdQaXBlKTogbmV2ZXIgeyB0aHJvdyBuZXcgRXJyb3IoJ01ldGhvZCBub3QgaW1wbGVtZW50ZWQuJyk7IH1cblxuICB2aXNpdFByZWZpeE5vdChhc3Q6IFByZWZpeE5vdCk6IHRzLkV4cHJlc3Npb24ge1xuICAgIGNvbnN0IGV4cHJlc3Npb24gPSB3cmFwRm9yRGlhZ25vc3RpY3ModGhpcy50cmFuc2xhdGUoYXN0LmV4cHJlc3Npb24pKTtcbiAgICBjb25zdCBub2RlID0gdHMuY3JlYXRlTG9naWNhbE5vdChleHByZXNzaW9uKTtcbiAgICBhZGRQYXJzZVNwYW5JbmZvKG5vZGUsIGFzdC5zb3VyY2VTcGFuKTtcbiAgICByZXR1cm4gbm9kZTtcbiAgfVxuXG4gIHZpc2l0UHJvcGVydHlSZWFkKGFzdDogUHJvcGVydHlSZWFkKTogdHMuRXhwcmVzc2lvbiB7XG4gICAgLy8gVGhpcyBpcyBhIG5vcm1hbCBwcm9wZXJ0eSByZWFkIC0gY29udmVydCB0aGUgcmVjZWl2ZXIgdG8gYW4gZXhwcmVzc2lvbiBhbmQgZW1pdCB0aGUgY29ycmVjdFxuICAgIC8vIFR5cGVTY3JpcHQgZXhwcmVzc2lvbiB0byByZWFkIHRoZSBwcm9wZXJ0eS5cbiAgICBjb25zdCByZWNlaXZlciA9IHdyYXBGb3JEaWFnbm9zdGljcyh0aGlzLnRyYW5zbGF0ZShhc3QucmVjZWl2ZXIpKTtcbiAgICBjb25zdCBub2RlID0gdHMuY3JlYXRlUHJvcGVydHlBY2Nlc3MocmVjZWl2ZXIsIGFzdC5uYW1lKTtcbiAgICBhZGRQYXJzZVNwYW5JbmZvKG5vZGUsIGFzdC5zb3VyY2VTcGFuKTtcbiAgICByZXR1cm4gbm9kZTtcbiAgfVxuXG4gIHZpc2l0UHJvcGVydHlXcml0ZShhc3Q6IFByb3BlcnR5V3JpdGUpOiB0cy5FeHByZXNzaW9uIHtcbiAgICBjb25zdCByZWNlaXZlciA9IHdyYXBGb3JEaWFnbm9zdGljcyh0aGlzLnRyYW5zbGF0ZShhc3QucmVjZWl2ZXIpKTtcbiAgICBjb25zdCBsZWZ0ID0gdHMuY3JlYXRlUHJvcGVydHlBY2Nlc3MocmVjZWl2ZXIsIGFzdC5uYW1lKTtcbiAgICAvLyBUT0RPKGpvb3N0KTogYW5ub3RhdGUgYGxlZnRgIHdpdGggdGhlIHNwYW4gb2YgdGhlIHByb3BlcnR5IGFjY2Vzcywgd2hpY2ggaXMgbm90IGN1cnJlbnRseVxuICAgIC8vICBhdmFpbGFibGUgb24gYGFzdGAuXG4gICAgY29uc3QgcmlnaHQgPSB0aGlzLnRyYW5zbGF0ZShhc3QudmFsdWUpO1xuICAgIGNvbnN0IG5vZGUgPSB3cmFwRm9yRGlhZ25vc3RpY3ModHMuY3JlYXRlQmluYXJ5KGxlZnQsIHRzLlN5bnRheEtpbmQuRXF1YWxzVG9rZW4sIHJpZ2h0KSk7XG4gICAgYWRkUGFyc2VTcGFuSW5mbyhub2RlLCBhc3Quc291cmNlU3Bhbik7XG4gICAgcmV0dXJuIG5vZGU7XG4gIH1cblxuICB2aXNpdFF1b3RlKGFzdDogUXVvdGUpOiBuZXZlciB7IHRocm93IG5ldyBFcnJvcignTWV0aG9kIG5vdCBpbXBsZW1lbnRlZC4nKTsgfVxuXG4gIHZpc2l0U2FmZU1ldGhvZENhbGwoYXN0OiBTYWZlTWV0aG9kQ2FsbCk6IHRzLkV4cHJlc3Npb24ge1xuICAgIC8vIFNlZSB0aGUgY29tbWVudHMgaW4gU2FmZVByb3BlcnR5UmVhZCBhYm92ZSBmb3IgYW4gZXhwbGFuYXRpb24gb2YgdGhlIGNhc2VzIGhlcmUuXG4gICAgbGV0IG5vZGU6IHRzLkV4cHJlc3Npb247XG4gICAgY29uc3QgcmVjZWl2ZXIgPSB3cmFwRm9yRGlhZ25vc3RpY3ModGhpcy50cmFuc2xhdGUoYXN0LnJlY2VpdmVyKSk7XG4gICAgY29uc3QgYXJncyA9IGFzdC5hcmdzLm1hcChleHByID0+IHRoaXMudHJhbnNsYXRlKGV4cHIpKTtcbiAgICBpZiAodGhpcy5jb25maWcuc3RyaWN0U2FmZU5hdmlnYXRpb25UeXBlcykge1xuICAgICAgLy8gXCJhPy5tZXRob2QoLi4uKVwiIGJlY29tZXMgKG51bGwgYXMgYW55ID8gYSEubWV0aG9kKC4uLikgOiB1bmRlZmluZWQpXG4gICAgICBjb25zdCBtZXRob2QgPSB0cy5jcmVhdGVQcm9wZXJ0eUFjY2Vzcyh0cy5jcmVhdGVOb25OdWxsRXhwcmVzc2lvbihyZWNlaXZlciksIGFzdC5uYW1lKTtcbiAgICAgIGNvbnN0IGNhbGwgPSB0cy5jcmVhdGVDYWxsKG1ldGhvZCwgdW5kZWZpbmVkLCBhcmdzKTtcbiAgICAgIG5vZGUgPSB0cy5jcmVhdGVQYXJlbih0cy5jcmVhdGVDb25kaXRpb25hbChOVUxMX0FTX0FOWSwgY2FsbCwgVU5ERUZJTkVEKSk7XG4gICAgfSBlbHNlIGlmIChWZVNhZmVMaHNJbmZlcmVuY2VCdWdEZXRlY3Rvci52ZVdpbGxJbmZlckFueUZvcihhc3QpKSB7XG4gICAgICAvLyBcImE/Lm1ldGhvZCguLi4pXCIgYmVjb21lcyAoYSBhcyBhbnkpLm1ldGhvZCguLi4pXG4gICAgICBjb25zdCBtZXRob2QgPSB0cy5jcmVhdGVQcm9wZXJ0eUFjY2Vzcyh0c0Nhc3RUb0FueShyZWNlaXZlciksIGFzdC5uYW1lKTtcbiAgICAgIG5vZGUgPSB0cy5jcmVhdGVDYWxsKG1ldGhvZCwgdW5kZWZpbmVkLCBhcmdzKTtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gXCJhPy5tZXRob2QoLi4uKVwiIGJlY29tZXMgKGEhLm1ldGhvZCguLi4pIGFzIGFueSlcbiAgICAgIGNvbnN0IG1ldGhvZCA9IHRzLmNyZWF0ZVByb3BlcnR5QWNjZXNzKHRzLmNyZWF0ZU5vbk51bGxFeHByZXNzaW9uKHJlY2VpdmVyKSwgYXN0Lm5hbWUpO1xuICAgICAgbm9kZSA9IHRzQ2FzdFRvQW55KHRzLmNyZWF0ZUNhbGwobWV0aG9kLCB1bmRlZmluZWQsIGFyZ3MpKTtcbiAgICB9XG4gICAgYWRkUGFyc2VTcGFuSW5mbyhub2RlLCBhc3Quc291cmNlU3Bhbik7XG4gICAgcmV0dXJuIG5vZGU7XG4gIH1cblxuICB2aXNpdFNhZmVQcm9wZXJ0eVJlYWQoYXN0OiBTYWZlUHJvcGVydHlSZWFkKTogdHMuRXhwcmVzc2lvbiB7XG4gICAgbGV0IG5vZGU6IHRzLkV4cHJlc3Npb247XG4gICAgY29uc3QgcmVjZWl2ZXIgPSB3cmFwRm9yRGlhZ25vc3RpY3ModGhpcy50cmFuc2xhdGUoYXN0LnJlY2VpdmVyKSk7XG4gICAgLy8gVGhlIGZvcm0gb2Ygc2FmZSBwcm9wZXJ0eSByZWFkcyBkZXBlbmRzIG9uIHdoZXRoZXIgc3RyaWN0bmVzcyBpcyBpbiB1c2UuXG4gICAgaWYgKHRoaXMuY29uZmlnLnN0cmljdFNhZmVOYXZpZ2F0aW9uVHlwZXMpIHtcbiAgICAgIC8vIEJhc2ljYWxseSwgdGhlIHJldHVybiBoZXJlIGlzIGVpdGhlciB0aGUgdHlwZSBvZiB0aGUgY29tcGxldGUgZXhwcmVzc2lvbiB3aXRoIGEgbnVsbC1zYWZlXG4gICAgICAvLyBwcm9wZXJ0eSByZWFkLCBvciBgdW5kZWZpbmVkYC4gU28gYSB0ZXJuYXJ5IGlzIHVzZWQgdG8gY3JlYXRlIGFuIFwib3JcIiB0eXBlOlxuICAgICAgLy8gXCJhPy5iXCIgYmVjb21lcyAobnVsbCBhcyBhbnkgPyBhIS5iIDogdW5kZWZpbmVkKVxuICAgICAgLy8gVGhlIHR5cGUgb2YgdGhpcyBleHByZXNzaW9uIGlzICh0eXBlb2YgYSEuYikgfCB1bmRlZmluZWQsIHdoaWNoIGlzIGV4YWN0bHkgYXMgZGVzaXJlZC5cbiAgICAgIGNvbnN0IGV4cHIgPSB0cy5jcmVhdGVQcm9wZXJ0eUFjY2Vzcyh0cy5jcmVhdGVOb25OdWxsRXhwcmVzc2lvbihyZWNlaXZlciksIGFzdC5uYW1lKTtcbiAgICAgIG5vZGUgPSB0cy5jcmVhdGVQYXJlbih0cy5jcmVhdGVDb25kaXRpb25hbChOVUxMX0FTX0FOWSwgZXhwciwgVU5ERUZJTkVEKSk7XG4gICAgfSBlbHNlIGlmIChWZVNhZmVMaHNJbmZlcmVuY2VCdWdEZXRlY3Rvci52ZVdpbGxJbmZlckFueUZvcihhc3QpKSB7XG4gICAgICAvLyBFbXVsYXRlIGEgVmlldyBFbmdpbmUgYnVnIHdoZXJlICdhbnknIGlzIGluZmVycmVkIGZvciB0aGUgbGVmdC1oYW5kIHNpZGUgb2YgdGhlIHNhZmVcbiAgICAgIC8vIG5hdmlnYXRpb24gb3BlcmF0aW9uLiBXaXRoIHRoaXMgYnVnLCB0aGUgdHlwZSBvZiB0aGUgbGVmdC1oYW5kIHNpZGUgaXMgcmVnYXJkZWQgYXMgYW55LlxuICAgICAgLy8gVGhlcmVmb3JlLCB0aGUgbGVmdC1oYW5kIHNpZGUgb25seSBuZWVkcyByZXBlYXRpbmcgaW4gdGhlIG91dHB1dCAodG8gdmFsaWRhdGUgaXQpLCBhbmQgdGhlblxuICAgICAgLy8gJ2FueScgaXMgdXNlZCBmb3IgdGhlIHJlc3Qgb2YgdGhlIGV4cHJlc3Npb24uIFRoaXMgaXMgZG9uZSB1c2luZyBhIGNvbW1hIG9wZXJhdG9yOlxuICAgICAgLy8gXCJhPy5iXCIgYmVjb21lcyAoYSBhcyBhbnkpLmIsIHdoaWNoIHdpbGwgb2YgY291cnNlIGhhdmUgdHlwZSAnYW55Jy5cbiAgICAgIG5vZGUgPSB0cy5jcmVhdGVQcm9wZXJ0eUFjY2Vzcyh0c0Nhc3RUb0FueShyZWNlaXZlciksIGFzdC5uYW1lKTtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gVGhlIFZpZXcgRW5naW5lIGJ1ZyBpc24ndCBhY3RpdmUsIHNvIGNoZWNrIHRoZSBlbnRpcmUgdHlwZSBvZiB0aGUgZXhwcmVzc2lvbiwgYnV0IHRoZSBmaW5hbFxuICAgICAgLy8gcmVzdWx0IGlzIHN0aWxsIGluZmVycmVkIGFzIGBhbnlgLlxuICAgICAgLy8gXCJhPy5iXCIgYmVjb21lcyAoYSEuYiBhcyBhbnkpXG4gICAgICBjb25zdCBleHByID0gdHMuY3JlYXRlUHJvcGVydHlBY2Nlc3ModHMuY3JlYXRlTm9uTnVsbEV4cHJlc3Npb24ocmVjZWl2ZXIpLCBhc3QubmFtZSk7XG4gICAgICBub2RlID0gdHNDYXN0VG9BbnkoZXhwcik7XG4gICAgfVxuICAgIGFkZFBhcnNlU3BhbkluZm8obm9kZSwgYXN0LnNvdXJjZVNwYW4pO1xuICAgIHJldHVybiBub2RlO1xuICB9XG59XG5cbi8qKlxuICogQ2hlY2tzIHdoZXRoZXIgVmlldyBFbmdpbmUgd2lsbCBpbmZlciBhIHR5cGUgb2YgJ2FueScgZm9yIHRoZSBsZWZ0LWhhbmQgc2lkZSBvZiBhIHNhZmUgbmF2aWdhdGlvblxuICogb3BlcmF0aW9uLlxuICpcbiAqIEluIFZpZXcgRW5naW5lJ3MgdGVtcGxhdGUgdHlwZS1jaGVja2VyLCBjZXJ0YWluIHJlY2VpdmVycyBvZiBzYWZlIG5hdmlnYXRpb24gb3BlcmF0aW9ucyB3aWxsXG4gKiBjYXVzZSBhIHRlbXBvcmFyeSB2YXJpYWJsZSB0byBiZSBhbGxvY2F0ZWQgYXMgcGFydCBvZiB0aGUgY2hlY2tpbmcgZXhwcmVzc2lvbiwgdG8gc2F2ZSB0aGUgdmFsdWVcbiAqIG9mIHRoZSByZWNlaXZlciBhbmQgdXNlIGl0IG1vcmUgdGhhbiBvbmNlIGluIHRoZSBleHByZXNzaW9uLiBUaGlzIHRlbXBvcmFyeSB2YXJpYWJsZSBoYXMgdHlwZVxuICogJ2FueScuIEluIHByYWN0aWNlLCB0aGlzIG1lYW5zIGNlcnRhaW4gcmVjZWl2ZXJzIGNhdXNlIFZpZXcgRW5naW5lIHRvIG5vdCBjaGVjayB0aGUgZnVsbFxuICogZXhwcmVzc2lvbiwgYW5kIG90aGVyIHJlY2VpdmVycyB3aWxsIHJlY2VpdmUgbW9yZSBjb21wbGV0ZSBjaGVja2luZy5cbiAqXG4gKiBGb3IgY29tcGF0aWJpbGl0eSwgdGhpcyBsb2dpYyBpcyBhZGFwdGVkIGZyb20gVmlldyBFbmdpbmUncyBleHByZXNzaW9uX2NvbnZlcnRlci50cyBzbyB0aGF0IHRoZVxuICogSXZ5IGNoZWNrZXIgY2FuIGVtdWxhdGUgdGhpcyBidWcgd2hlbiBuZWVkZWQuXG4gKi9cbmNsYXNzIFZlU2FmZUxoc0luZmVyZW5jZUJ1Z0RldGVjdG9yIGltcGxlbWVudHMgQXN0VmlzaXRvciB7XG4gIHByaXZhdGUgc3RhdGljIFNJTkdMRVRPTiA9IG5ldyBWZVNhZmVMaHNJbmZlcmVuY2VCdWdEZXRlY3RvcigpO1xuXG4gIHN0YXRpYyB2ZVdpbGxJbmZlckFueUZvcihhc3Q6IFNhZmVNZXRob2RDYWxsfFNhZmVQcm9wZXJ0eVJlYWQpIHtcbiAgICByZXR1cm4gYXN0LnJlY2VpdmVyLnZpc2l0KFZlU2FmZUxoc0luZmVyZW5jZUJ1Z0RldGVjdG9yLlNJTkdMRVRPTik7XG4gIH1cblxuICB2aXNpdEJpbmFyeShhc3Q6IEJpbmFyeSk6IGJvb2xlYW4geyByZXR1cm4gYXN0LmxlZnQudmlzaXQodGhpcykgfHwgYXN0LnJpZ2h0LnZpc2l0KHRoaXMpOyB9XG4gIHZpc2l0Q2hhaW4oYXN0OiBDaGFpbik6IGJvb2xlYW4geyByZXR1cm4gZmFsc2U7IH1cbiAgdmlzaXRDb25kaXRpb25hbChhc3Q6IENvbmRpdGlvbmFsKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIGFzdC5jb25kaXRpb24udmlzaXQodGhpcykgfHwgYXN0LnRydWVFeHAudmlzaXQodGhpcykgfHwgYXN0LmZhbHNlRXhwLnZpc2l0KHRoaXMpO1xuICB9XG4gIHZpc2l0RnVuY3Rpb25DYWxsKGFzdDogRnVuY3Rpb25DYWxsKTogYm9vbGVhbiB7IHJldHVybiB0cnVlOyB9XG4gIHZpc2l0SW1wbGljaXRSZWNlaXZlcihhc3Q6IEltcGxpY2l0UmVjZWl2ZXIpOiBib29sZWFuIHsgcmV0dXJuIGZhbHNlOyB9XG4gIHZpc2l0SW50ZXJwb2xhdGlvbihhc3Q6IEludGVycG9sYXRpb24pOiBib29sZWFuIHtcbiAgICByZXR1cm4gYXN0LmV4cHJlc3Npb25zLnNvbWUoZXhwID0+IGV4cC52aXNpdCh0aGlzKSk7XG4gIH1cbiAgdmlzaXRLZXllZFJlYWQoYXN0OiBLZXllZFJlYWQpOiBib29sZWFuIHsgcmV0dXJuIGZhbHNlOyB9XG4gIHZpc2l0S2V5ZWRXcml0ZShhc3Q6IEtleWVkV3JpdGUpOiBib29sZWFuIHsgcmV0dXJuIGZhbHNlOyB9XG4gIHZpc2l0TGl0ZXJhbEFycmF5KGFzdDogTGl0ZXJhbEFycmF5KTogYm9vbGVhbiB7IHJldHVybiB0cnVlOyB9XG4gIHZpc2l0TGl0ZXJhbE1hcChhc3Q6IExpdGVyYWxNYXApOiBib29sZWFuIHsgcmV0dXJuIHRydWU7IH1cbiAgdmlzaXRMaXRlcmFsUHJpbWl0aXZlKGFzdDogTGl0ZXJhbFByaW1pdGl2ZSk6IGJvb2xlYW4geyByZXR1cm4gZmFsc2U7IH1cbiAgdmlzaXRNZXRob2RDYWxsKGFzdDogTWV0aG9kQ2FsbCk6IGJvb2xlYW4geyByZXR1cm4gdHJ1ZTsgfVxuICB2aXNpdFBpcGUoYXN0OiBCaW5kaW5nUGlwZSk6IGJvb2xlYW4geyByZXR1cm4gdHJ1ZTsgfVxuICB2aXNpdFByZWZpeE5vdChhc3Q6IFByZWZpeE5vdCk6IGJvb2xlYW4geyByZXR1cm4gYXN0LmV4cHJlc3Npb24udmlzaXQodGhpcyk7IH1cbiAgdmlzaXROb25OdWxsQXNzZXJ0KGFzdDogUHJlZml4Tm90KTogYm9vbGVhbiB7IHJldHVybiBhc3QuZXhwcmVzc2lvbi52aXNpdCh0aGlzKTsgfVxuICB2aXNpdFByb3BlcnR5UmVhZChhc3Q6IFByb3BlcnR5UmVhZCk6IGJvb2xlYW4geyByZXR1cm4gZmFsc2U7IH1cbiAgdmlzaXRQcm9wZXJ0eVdyaXRlKGFzdDogUHJvcGVydHlXcml0ZSk6IGJvb2xlYW4geyByZXR1cm4gZmFsc2U7IH1cbiAgdmlzaXRRdW90ZShhc3Q6IFF1b3RlKTogYm9vbGVhbiB7IHJldHVybiBmYWxzZTsgfVxuICB2aXNpdFNhZmVNZXRob2RDYWxsKGFzdDogU2FmZU1ldGhvZENhbGwpOiBib29sZWFuIHsgcmV0dXJuIHRydWU7IH1cbiAgdmlzaXRTYWZlUHJvcGVydHlSZWFkKGFzdDogU2FmZVByb3BlcnR5UmVhZCk6IGJvb2xlYW4geyByZXR1cm4gZmFsc2U7IH1cbn1cbiJdfQ==