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
        define("@angular/language-service/src/expression_type", ["require", "exports", "tslib", "@angular/compiler", "@angular/language-service/src/diagnostic_messages", "@angular/language-service/src/symbols"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var tslib_1 = require("tslib");
    var compiler_1 = require("@angular/compiler");
    var diagnostic_messages_1 = require("@angular/language-service/src/diagnostic_messages");
    var symbols_1 = require("@angular/language-service/src/symbols");
    // AstType calculatetype of the ast given AST element.
    var AstType = /** @class */ (function () {
        function AstType(scope, query, context) {
            this.scope = scope;
            this.query = query;
            this.context = context;
            this.diagnostics = [];
        }
        AstType.prototype.getType = function (ast) { return ast.visit(this); };
        AstType.prototype.getDiagnostics = function (ast) {
            var type = ast.visit(this);
            if (this.context.event && type.callable) {
                this.diagnostics.push(diagnostic_messages_1.createDiagnostic(ast.span, diagnostic_messages_1.Diagnostic.callable_expression_expected_method_call));
            }
            return this.diagnostics;
        };
        AstType.prototype.visitBinary = function (ast) {
            var _this_1 = this;
            // Treat undefined and null as other.
            function normalize(kind, other) {
                switch (kind) {
                    case symbols_1.BuiltinType.Undefined:
                    case symbols_1.BuiltinType.Null:
                        return normalize(other, symbols_1.BuiltinType.Other);
                }
                return kind;
            }
            var getType = function (ast, operation) {
                var type = _this_1.getType(ast);
                if (type.nullable) {
                    switch (operation) {
                        case '&&':
                        case '||':
                        case '==':
                        case '!=':
                        case '===':
                        case '!==':
                            // Nullable allowed.
                            break;
                        default:
                            _this_1.diagnostics.push(diagnostic_messages_1.createDiagnostic(ast.span, diagnostic_messages_1.Diagnostic.expression_might_be_null));
                            break;
                    }
                    return _this_1.query.getNonNullableType(type);
                }
                return type;
            };
            var leftType = getType(ast.left, ast.operation);
            var rightType = getType(ast.right, ast.operation);
            var leftRawKind = this.query.getTypeKind(leftType);
            var rightRawKind = this.query.getTypeKind(rightType);
            var leftKind = normalize(leftRawKind, rightRawKind);
            var rightKind = normalize(rightRawKind, leftRawKind);
            // The following swtich implements operator typing similar to the
            // type production tables in the TypeScript specification.
            // https://github.com/Microsoft/TypeScript/blob/v1.8.10/doc/spec.md#4.19
            var operKind = leftKind << 8 | rightKind;
            switch (ast.operation) {
                case '*':
                case '/':
                case '%':
                case '-':
                case '<<':
                case '>>':
                case '>>>':
                case '&':
                case '^':
                case '|':
                    switch (operKind) {
                        case symbols_1.BuiltinType.Any << 8 | symbols_1.BuiltinType.Any:
                        case symbols_1.BuiltinType.Number << 8 | symbols_1.BuiltinType.Any:
                        case symbols_1.BuiltinType.Any << 8 | symbols_1.BuiltinType.Number:
                        case symbols_1.BuiltinType.Number << 8 | symbols_1.BuiltinType.Number:
                            return this.query.getBuiltinType(symbols_1.BuiltinType.Number);
                        default:
                            var errorAst = ast.left;
                            switch (leftKind) {
                                case symbols_1.BuiltinType.Any:
                                case symbols_1.BuiltinType.Number:
                                    errorAst = ast.right;
                                    break;
                            }
                            this.diagnostics.push(diagnostic_messages_1.createDiagnostic(errorAst.span, diagnostic_messages_1.Diagnostic.expected_a_number_type));
                            return this.anyType;
                    }
                case '+':
                    switch (operKind) {
                        case symbols_1.BuiltinType.Any << 8 | symbols_1.BuiltinType.Any:
                        case symbols_1.BuiltinType.Any << 8 | symbols_1.BuiltinType.Boolean:
                        case symbols_1.BuiltinType.Any << 8 | symbols_1.BuiltinType.Number:
                        case symbols_1.BuiltinType.Any << 8 | symbols_1.BuiltinType.Other:
                        case symbols_1.BuiltinType.Boolean << 8 | symbols_1.BuiltinType.Any:
                        case symbols_1.BuiltinType.Number << 8 | symbols_1.BuiltinType.Any:
                        case symbols_1.BuiltinType.Other << 8 | symbols_1.BuiltinType.Any:
                            return this.anyType;
                        case symbols_1.BuiltinType.Any << 8 | symbols_1.BuiltinType.String:
                        case symbols_1.BuiltinType.Boolean << 8 | symbols_1.BuiltinType.String:
                        case symbols_1.BuiltinType.Number << 8 | symbols_1.BuiltinType.String:
                        case symbols_1.BuiltinType.String << 8 | symbols_1.BuiltinType.Any:
                        case symbols_1.BuiltinType.String << 8 | symbols_1.BuiltinType.Boolean:
                        case symbols_1.BuiltinType.String << 8 | symbols_1.BuiltinType.Number:
                        case symbols_1.BuiltinType.String << 8 | symbols_1.BuiltinType.String:
                        case symbols_1.BuiltinType.String << 8 | symbols_1.BuiltinType.Other:
                        case symbols_1.BuiltinType.Other << 8 | symbols_1.BuiltinType.String:
                            return this.query.getBuiltinType(symbols_1.BuiltinType.String);
                        case symbols_1.BuiltinType.Number << 8 | symbols_1.BuiltinType.Number:
                            return this.query.getBuiltinType(symbols_1.BuiltinType.Number);
                        case symbols_1.BuiltinType.Boolean << 8 | symbols_1.BuiltinType.Number:
                        case symbols_1.BuiltinType.Other << 8 | symbols_1.BuiltinType.Number:
                            this.diagnostics.push(diagnostic_messages_1.createDiagnostic(ast.left.span, diagnostic_messages_1.Diagnostic.expected_a_number_type));
                            return this.anyType;
                        case symbols_1.BuiltinType.Number << 8 | symbols_1.BuiltinType.Boolean:
                        case symbols_1.BuiltinType.Number << 8 | symbols_1.BuiltinType.Other:
                            this.diagnostics.push(diagnostic_messages_1.createDiagnostic(ast.right.span, diagnostic_messages_1.Diagnostic.expected_a_number_type));
                            return this.anyType;
                        default:
                            this.diagnostics.push(diagnostic_messages_1.createDiagnostic(ast.span, diagnostic_messages_1.Diagnostic.expected_a_string_or_number_type));
                            return this.anyType;
                    }
                case '>':
                case '<':
                case '<=':
                case '>=':
                case '==':
                case '!=':
                case '===':
                case '!==':
                    switch (operKind) {
                        case symbols_1.BuiltinType.Any << 8 | symbols_1.BuiltinType.Any:
                        case symbols_1.BuiltinType.Any << 8 | symbols_1.BuiltinType.Boolean:
                        case symbols_1.BuiltinType.Any << 8 | symbols_1.BuiltinType.Number:
                        case symbols_1.BuiltinType.Any << 8 | symbols_1.BuiltinType.String:
                        case symbols_1.BuiltinType.Any << 8 | symbols_1.BuiltinType.Other:
                        case symbols_1.BuiltinType.Boolean << 8 | symbols_1.BuiltinType.Any:
                        case symbols_1.BuiltinType.Boolean << 8 | symbols_1.BuiltinType.Boolean:
                        case symbols_1.BuiltinType.Number << 8 | symbols_1.BuiltinType.Any:
                        case symbols_1.BuiltinType.Number << 8 | symbols_1.BuiltinType.Number:
                        case symbols_1.BuiltinType.String << 8 | symbols_1.BuiltinType.Any:
                        case symbols_1.BuiltinType.String << 8 | symbols_1.BuiltinType.String:
                        case symbols_1.BuiltinType.Other << 8 | symbols_1.BuiltinType.Any:
                        case symbols_1.BuiltinType.Other << 8 | symbols_1.BuiltinType.Other:
                            return this.query.getBuiltinType(symbols_1.BuiltinType.Boolean);
                        default:
                            this.diagnostics.push(diagnostic_messages_1.createDiagnostic(ast.span, diagnostic_messages_1.Diagnostic.expected_operands_of_similar_type_or_any));
                            return this.anyType;
                    }
                case '&&':
                    return rightType;
                case '||':
                    return this.query.getTypeUnion(leftType, rightType);
            }
            this.diagnostics.push(diagnostic_messages_1.createDiagnostic(ast.span, diagnostic_messages_1.Diagnostic.unrecognized_operator, ast.operation));
            return this.anyType;
        };
        AstType.prototype.visitChain = function (ast) {
            var e_1, _a;
            try {
                // If we are producing diagnostics, visit the children
                for (var _b = tslib_1.__values(ast.expressions), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var expr = _c.value;
                    expr.visit(this);
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_1) throw e_1.error; }
            }
            // The type of a chain is always undefined.
            return this.query.getBuiltinType(symbols_1.BuiltinType.Undefined);
        };
        AstType.prototype.visitConditional = function (ast) {
            // The type of a conditional is the union of the true and false conditions.
            ast.condition.visit(this);
            ast.trueExp.visit(this);
            ast.falseExp.visit(this);
            return this.query.getTypeUnion(this.getType(ast.trueExp), this.getType(ast.falseExp));
        };
        AstType.prototype.visitFunctionCall = function (ast) {
            var _this_1 = this;
            // The type of a function call is the return type of the selected signature.
            // The signature is selected based on the types of the arguments. Angular doesn't
            // support contextual typing of arguments so this is simpler than TypeScript's
            // version.
            var args = ast.args.map(function (arg) { return _this_1.getType(arg); });
            var target = this.getType(ast.target);
            if (!target || !target.callable) {
                this.diagnostics.push(diagnostic_messages_1.createDiagnostic(ast.span, diagnostic_messages_1.Diagnostic.call_target_not_callable));
                return this.anyType;
            }
            var signature = target.selectSignature(args);
            if (signature) {
                return signature.result;
            }
            // TODO: Consider a better error message here.
            this.diagnostics.push(diagnostic_messages_1.createDiagnostic(ast.span, diagnostic_messages_1.Diagnostic.unable_to_resolve_compatible_call_signature));
            return this.anyType;
        };
        AstType.prototype.visitImplicitReceiver = function (ast) {
            var _this = this;
            // Return a pseudo-symbol for the implicit receiver.
            // The members of the implicit receiver are what is defined by the
            // scope passed into this class.
            return {
                name: '$implicit',
                kind: 'component',
                language: 'ng-template',
                type: undefined,
                container: undefined,
                callable: false,
                nullable: false,
                public: true,
                definition: undefined,
                documentation: [],
                members: function () { return _this.scope; },
                signatures: function () { return []; },
                selectSignature: function (types) { return undefined; },
                indexed: function (argument) { return undefined; },
                typeArguments: function () { return undefined; },
            };
        };
        AstType.prototype.visitInterpolation = function (ast) {
            var e_2, _a;
            try {
                // If we are producing diagnostics, visit the children.
                for (var _b = tslib_1.__values(ast.expressions), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var expr = _c.value;
                    expr.visit(this);
                }
            }
            catch (e_2_1) { e_2 = { error: e_2_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_2) throw e_2.error; }
            }
            return this.undefinedType;
        };
        AstType.prototype.visitKeyedRead = function (ast) {
            var targetType = this.getType(ast.obj);
            var keyType = this.getType(ast.key);
            var result = targetType.indexed(keyType, ast.key instanceof compiler_1.LiteralPrimitive ? ast.key.value : undefined);
            return result || this.anyType;
        };
        AstType.prototype.visitKeyedWrite = function (ast) {
            // The write of a type is the type of the value being written.
            return this.getType(ast.value);
        };
        AstType.prototype.visitLiteralArray = function (ast) {
            var _a;
            var _this_1 = this;
            // A type literal is an array type of the union of the elements
            return this.query.getArrayType((_a = this.query).getTypeUnion.apply(_a, tslib_1.__spread(ast.expressions.map(function (element) { return _this_1.getType(element); }))));
        };
        AstType.prototype.visitLiteralMap = function (ast) {
            var e_3, _a;
            try {
                // If we are producing diagnostics, visit the children
                for (var _b = tslib_1.__values(ast.values), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var value = _c.value;
                    value.visit(this);
                }
            }
            catch (e_3_1) { e_3 = { error: e_3_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_3) throw e_3.error; }
            }
            // TODO: Return a composite type.
            return this.anyType;
        };
        AstType.prototype.visitLiteralPrimitive = function (ast) {
            // The type of a literal primitive depends on the value of the literal.
            switch (ast.value) {
                case true:
                case false:
                    return this.query.getBuiltinType(symbols_1.BuiltinType.Boolean);
                case null:
                    return this.query.getBuiltinType(symbols_1.BuiltinType.Null);
                case undefined:
                    return this.query.getBuiltinType(symbols_1.BuiltinType.Undefined);
                default:
                    switch (typeof ast.value) {
                        case 'string':
                            return this.query.getBuiltinType(symbols_1.BuiltinType.String);
                        case 'number':
                            return this.query.getBuiltinType(symbols_1.BuiltinType.Number);
                        default:
                            this.diagnostics.push(diagnostic_messages_1.createDiagnostic(ast.span, diagnostic_messages_1.Diagnostic.unrecognized_primitive, typeof ast.value));
                            return this.anyType;
                    }
            }
        };
        AstType.prototype.visitMethodCall = function (ast) {
            return this.resolveMethodCall(this.getType(ast.receiver), ast);
        };
        AstType.prototype.visitPipe = function (ast) {
            var _this_1 = this;
            // The type of a pipe node is the return type of the pipe's transform method. The table returned
            // by getPipes() is expected to contain symbols with the corresponding transform method type.
            var pipe = this.query.getPipes().get(ast.name);
            if (!pipe) {
                this.diagnostics.push(diagnostic_messages_1.createDiagnostic(ast.span, diagnostic_messages_1.Diagnostic.no_pipe_found, ast.name));
                return this.anyType;
            }
            var expType = this.getType(ast.exp);
            var signature = pipe.selectSignature([expType].concat(ast.args.map(function (arg) { return _this_1.getType(arg); })));
            if (!signature) {
                this.diagnostics.push(diagnostic_messages_1.createDiagnostic(ast.span, diagnostic_messages_1.Diagnostic.unable_to_resolve_signature, ast.name));
                return this.anyType;
            }
            return signature.result;
        };
        AstType.prototype.visitPrefixNot = function (ast) {
            // If we are producing diagnostics, visit the children
            ast.expression.visit(this);
            // The type of a prefix ! is always boolean.
            return this.query.getBuiltinType(symbols_1.BuiltinType.Boolean);
        };
        AstType.prototype.visitNonNullAssert = function (ast) {
            var expressionType = this.getType(ast.expression);
            return this.query.getNonNullableType(expressionType);
        };
        AstType.prototype.visitPropertyRead = function (ast) {
            return this.resolvePropertyRead(this.getType(ast.receiver), ast);
        };
        AstType.prototype.visitPropertyWrite = function (ast) {
            // The type of a write is the type of the value being written.
            return this.getType(ast.value);
        };
        AstType.prototype.visitQuote = function (ast) {
            // The type of a quoted expression is any.
            return this.query.getBuiltinType(symbols_1.BuiltinType.Any);
        };
        AstType.prototype.visitSafeMethodCall = function (ast) {
            return this.resolveMethodCall(this.query.getNonNullableType(this.getType(ast.receiver)), ast);
        };
        AstType.prototype.visitSafePropertyRead = function (ast) {
            return this.resolvePropertyRead(this.query.getNonNullableType(this.getType(ast.receiver)), ast);
        };
        Object.defineProperty(AstType.prototype, "anyType", {
            get: function () {
                var result = this._anyType;
                if (!result) {
                    result = this._anyType = this.query.getBuiltinType(symbols_1.BuiltinType.Any);
                }
                return result;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(AstType.prototype, "undefinedType", {
            get: function () {
                var result = this._undefinedType;
                if (!result) {
                    result = this._undefinedType = this.query.getBuiltinType(symbols_1.BuiltinType.Undefined);
                }
                return result;
            },
            enumerable: true,
            configurable: true
        });
        AstType.prototype.resolveMethodCall = function (receiverType, ast) {
            var _this_1 = this;
            if (this.isAny(receiverType)) {
                return this.anyType;
            }
            var methodType = this.resolvePropertyRead(receiverType, ast);
            if (!methodType) {
                this.diagnostics.push(diagnostic_messages_1.createDiagnostic(ast.span, diagnostic_messages_1.Diagnostic.could_not_resolve_type, ast.name));
                return this.anyType;
            }
            if (this.isAny(methodType)) {
                return this.anyType;
            }
            if (!methodType.callable) {
                this.diagnostics.push(diagnostic_messages_1.createDiagnostic(ast.span, diagnostic_messages_1.Diagnostic.identifier_not_callable, ast.name));
                return this.anyType;
            }
            var signature = methodType.selectSignature(ast.args.map(function (arg) { return _this_1.getType(arg); }));
            if (!signature) {
                this.diagnostics.push(diagnostic_messages_1.createDiagnostic(ast.span, diagnostic_messages_1.Diagnostic.unable_to_resolve_signature, ast.name));
                return this.anyType;
            }
            return signature.result;
        };
        AstType.prototype.resolvePropertyRead = function (receiverType, ast) {
            if (this.isAny(receiverType)) {
                return this.anyType;
            }
            // The type of a property read is the seelcted member's type.
            var member = receiverType.members().get(ast.name);
            if (!member) {
                if (receiverType.name === '$implicit') {
                    this.diagnostics.push(diagnostic_messages_1.createDiagnostic(ast.span, diagnostic_messages_1.Diagnostic.identifier_not_defined_in_app_context, ast.name));
                }
                else if (receiverType.nullable && ast.receiver instanceof compiler_1.PropertyRead) {
                    var receiver = ast.receiver.name;
                    this.diagnostics.push(diagnostic_messages_1.createDiagnostic(ast.span, diagnostic_messages_1.Diagnostic.identifier_possibly_undefined, receiver, receiver + "?." + ast.name, receiver + "!." + ast.name));
                }
                else {
                    this.diagnostics.push(diagnostic_messages_1.createDiagnostic(ast.span, diagnostic_messages_1.Diagnostic.identifier_not_defined_on_receiver, ast.name, receiverType.name));
                }
                return this.anyType;
            }
            if (!member.public) {
                var container = receiverType.name === '$implicit' ? 'the component' : "'" + receiverType.name + "'";
                this.diagnostics.push(diagnostic_messages_1.createDiagnostic(ast.span, diagnostic_messages_1.Diagnostic.identifier_is_private, ast.name, container));
            }
            return member.type;
        };
        AstType.prototype.isAny = function (symbol) {
            return !symbol || this.query.getTypeKind(symbol) === symbols_1.BuiltinType.Any ||
                (!!symbol.type && this.isAny(symbol.type));
        };
        return AstType;
    }());
    exports.AstType = AstType;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXhwcmVzc2lvbl90eXBlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvbGFuZ3VhZ2Utc2VydmljZS9zcmMvZXhwcmVzc2lvbl90eXBlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7OztJQUVILDhDQUF5VDtJQUV6VCx5RkFBbUU7SUFDbkUsaUVBQW1GO0lBS25GLHNEQUFzRDtJQUN0RDtRQUdFLGlCQUNZLEtBQWtCLEVBQVUsS0FBa0IsRUFDOUMsT0FBcUM7WUFEckMsVUFBSyxHQUFMLEtBQUssQ0FBYTtZQUFVLFVBQUssR0FBTCxLQUFLLENBQWE7WUFDOUMsWUFBTyxHQUFQLE9BQU8sQ0FBOEI7WUFKaEMsZ0JBQVcsR0FBb0IsRUFBRSxDQUFDO1FBSUMsQ0FBQztRQUVyRCx5QkFBTyxHQUFQLFVBQVEsR0FBUSxJQUFZLE9BQU8sR0FBRyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFFckQsZ0NBQWMsR0FBZCxVQUFlLEdBQVE7WUFDckIsSUFBTSxJQUFJLEdBQVcsR0FBRyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUNyQyxJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxJQUFJLElBQUksQ0FBQyxRQUFRLEVBQUU7Z0JBQ3ZDLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUNqQixzQ0FBZ0IsQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFLGdDQUFVLENBQUMsd0NBQXdDLENBQUMsQ0FBQyxDQUFDO2FBQ3RGO1lBQ0QsT0FBTyxJQUFJLENBQUMsV0FBVyxDQUFDO1FBQzFCLENBQUM7UUFFRCw2QkFBVyxHQUFYLFVBQVksR0FBVztZQUF2QixtQkFrSkM7WUFqSkMscUNBQXFDO1lBQ3JDLFNBQVMsU0FBUyxDQUFDLElBQWlCLEVBQUUsS0FBa0I7Z0JBQ3RELFFBQVEsSUFBSSxFQUFFO29CQUNaLEtBQUss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QUFELENBQUMsQUF4YUQsSUF3YUM7SUF4YVksMEJBQU8iLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7QVNULCBBc3RWaXNpdG9yLCBCaW5hcnksIEJpbmRpbmdQaXBlLCBDaGFpbiwgQ29uZGl0aW9uYWwsIEZ1bmN0aW9uQ2FsbCwgSW1wbGljaXRSZWNlaXZlciwgSW50ZXJwb2xhdGlvbiwgS2V5ZWRSZWFkLCBLZXllZFdyaXRlLCBMaXRlcmFsQXJyYXksIExpdGVyYWxNYXAsIExpdGVyYWxQcmltaXRpdmUsIE1ldGhvZENhbGwsIE5vbk51bGxBc3NlcnQsIFByZWZpeE5vdCwgUHJvcGVydHlSZWFkLCBQcm9wZXJ0eVdyaXRlLCBRdW90ZSwgU2FmZU1ldGhvZENhbGwsIFNhZmVQcm9wZXJ0eVJlYWR9IGZyb20gJ0Bhbmd1bGFyL2NvbXBpbGVyJztcblxuaW1wb3J0IHtEaWFnbm9zdGljLCBjcmVhdGVEaWFnbm9zdGljfSBmcm9tICcuL2RpYWdub3N0aWNfbWVzc2FnZXMnO1xuaW1wb3J0IHtCdWlsdGluVHlwZSwgU2lnbmF0dXJlLCBTeW1ib2wsIFN5bWJvbFF1ZXJ5LCBTeW1ib2xUYWJsZX0gZnJvbSAnLi9zeW1ib2xzJztcbmltcG9ydCAqIGFzIG5nIGZyb20gJy4vdHlwZXMnO1xuXG5leHBvcnQgaW50ZXJmYWNlIEV4cHJlc3Npb25EaWFnbm9zdGljc0NvbnRleHQgeyBldmVudD86IGJvb2xlYW47IH1cblxuLy8gQXN0VHlwZSBjYWxjdWxhdGV0eXBlIG9mIHRoZSBhc3QgZ2l2ZW4gQVNUIGVsZW1lbnQuXG5leHBvcnQgY2xhc3MgQXN0VHlwZSBpbXBsZW1lbnRzIEFzdFZpc2l0b3Ige1xuICBwcml2YXRlIHJlYWRvbmx5IGRpYWdub3N0aWNzOiBuZy5EaWFnbm9zdGljW10gPSBbXTtcblxuICBjb25zdHJ1Y3RvcihcbiAgICAgIHByaXZhdGUgc2NvcGU6IFN5bWJvbFRhYmxlLCBwcml2YXRlIHF1ZXJ5OiBTeW1ib2xRdWVyeSxcbiAgICAgIHByaXZhdGUgY29udGV4dDogRXhwcmVzc2lvbkRpYWdub3N0aWNzQ29udGV4dCkge31cblxuICBnZXRUeXBlKGFzdDogQVNUKTogU3ltYm9sIHsgcmV0dXJuIGFzdC52aXNpdCh0aGlzKTsgfVxuXG4gIGdldERpYWdub3N0aWNzKGFzdDogQVNUKTogbmcuRGlhZ25vc3RpY1tdIHtcbiAgICBjb25zdCB0eXBlOiBTeW1ib2wgPSBhc3QudmlzaXQodGhpcyk7XG4gICAgaWYgKHRoaXMuY29udGV4dC5ldmVudCAmJiB0eXBlLmNhbGxhYmxlKSB7XG4gICAgICB0aGlzLmRpYWdub3N0aWNzLnB1c2goXG4gICAgICAgICAgY3JlYXRlRGlhZ25vc3RpYyhhc3Quc3BhbiwgRGlhZ25vc3RpYy5jYWxsYWJsZV9leHByZXNzaW9uX2V4cGVjdGVkX21ldGhvZF9jYWxsKSk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLmRpYWdub3N0aWNzO1xuICB9XG5cbiAgdmlzaXRCaW5hcnkoYXN0OiBCaW5hcnkpOiBTeW1ib2wge1xuICAgIC8vIFRyZWF0IHVuZGVmaW5lZCBhbmQgbnVsbCBhcyBvdGhlci5cbiAgICBmdW5jdGlvbiBub3JtYWxpemUoa2luZDogQnVpbHRpblR5cGUsIG90aGVyOiBCdWlsdGluVHlwZSk6IEJ1aWx0aW5UeXBlIHtcbiAgICAgIHN3aXRjaCAoa2luZCkge1xuICAgICAgICBjYXNlIEJ1aWx0aW5UeXBlLlVuZGVmaW5lZDpcbiAgICAgICAgY2FzZSBCdWlsdGluVHlwZS5OdWxsOlxuICAgICAgICAgIHJldHVybiBub3JtYWxpemUob3RoZXIsIEJ1aWx0aW5UeXBlLk90aGVyKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBraW5kO1xuICAgIH1cblxuICAgIGNvbnN0IGdldFR5cGUgPSAoYXN0OiBBU1QsIG9wZXJhdGlvbjogc3RyaW5nKTogU3ltYm9sID0+IHtcbiAgICAgIGNvbnN0IHR5cGUgPSB0aGlzLmdldFR5cGUoYXN0KTtcbiAgICAgIGlmICh0eXBlLm51bGxhYmxlKSB7XG4gICAgICAgIHN3aXRjaCAob3BlcmF0aW9uKSB7XG4gICAgICAgICAgY2FzZSAnJiYnOlxuICAgICAgICAgIGNhc2UgJ3x8JzpcbiAgICAgICAgICBjYXNlICc9PSc6XG4gICAgICAgICAgY2FzZSAnIT0nOlxuICAgICAgICAgIGNhc2UgJz09PSc6XG4gICAgICAgICAgY2FzZSAnIT09JzpcbiAgICAgICAgICAgIC8vIE51bGxhYmxlIGFsbG93ZWQuXG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgdGhpcy5kaWFnbm9zdGljcy5wdXNoKGNyZWF0ZURpYWdub3N0aWMoYXN0LnNwYW4sIERpYWdub3N0aWMuZXhwcmVzc2lvbl9taWdodF9iZV9udWxsKSk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcy5xdWVyeS5nZXROb25OdWxsYWJsZVR5cGUodHlwZSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gdHlwZTtcbiAgICB9O1xuXG4gICAgY29uc3QgbGVmdFR5cGUgPSBnZXRUeXBlKGFzdC5sZWZ0LCBhc3Qub3BlcmF0aW9uKTtcbiAgICBjb25zdCByaWdodFR5cGUgPSBnZXRUeXBlKGFzdC5yaWdodCwgYXN0Lm9wZXJhdGlvbik7XG4gICAgY29uc3QgbGVmdFJhd0tpbmQgPSB0aGlzLnF1ZXJ5LmdldFR5cGVLaW5kKGxlZnRUeXBlKTtcbiAgICBjb25zdCByaWdodFJhd0tpbmQgPSB0aGlzLnF1ZXJ5LmdldFR5cGVLaW5kKHJpZ2h0VHlwZSk7XG4gICAgY29uc3QgbGVmdEtpbmQgPSBub3JtYWxpemUobGVmdFJhd0tpbmQsIHJpZ2h0UmF3S2luZCk7XG4gICAgY29uc3QgcmlnaHRLaW5kID0gbm9ybWFsaXplKHJpZ2h0UmF3S2luZCwgbGVmdFJhd0tpbmQpO1xuXG4gICAgLy8gVGhlIGZvbGxvd2luZyBzd3RpY2ggaW1wbGVtZW50cyBvcGVyYXRvciB0eXBpbmcgc2ltaWxhciB0byB0aGVcbiAgICAvLyB0eXBlIHByb2R1Y3Rpb24gdGFibGVzIGluIHRoZSBUeXBlU2NyaXB0IHNwZWNpZmljYXRpb24uXG4gICAgLy8gaHR0cHM6Ly9naXRodWIuY29tL01pY3Jvc29mdC9UeXBlU2NyaXB0L2Jsb2IvdjEuOC4xMC9kb2Mvc3BlYy5tZCM0LjE5XG4gICAgY29uc3Qgb3BlcktpbmQgPSBsZWZ0S2luZCA8PCA4IHwgcmlnaHRLaW5kO1xuICAgIHN3aXRjaCAoYXN0Lm9wZXJhdGlvbikge1xuICAgICAgY2FzZSAnKic6XG4gICAgICBjYXNlICcvJzpcbiAgICAgIGNhc2UgJyUnOlxuICAgICAgY2FzZSAnLSc6XG4gICAgICBjYXNlICc8PCc6XG4gICAgICBjYXNlICc+Pic6XG4gICAgICBjYXNlICc+Pj4nOlxuICAgICAgY2FzZSAnJic6XG4gICAgICBjYXNlICdeJzpcbiAgICAgIGNhc2UgJ3wnOlxuICAgICAgICBzd2l0Y2ggKG9wZXJLaW5kKSB7XG4gICAgICAgICAgY2FzZSBCdWlsdGluVHlwZS5BbnkgPDwgOCB8IEJ1aWx0aW5UeXBlLkFueTpcbiAgICAgICAgICBjYXNlIEJ1aWx0aW5UeXBlLk51bWJlciA8PCA4IHwgQnVpbHRpblR5cGUuQW55OlxuICAgICAgICAgIGNhc2UgQnVpbHRpblR5cGUuQW55IDw8IDggfCBCdWlsdGluVHlwZS5OdW1iZXI6XG4gICAgICAgICAgY2FzZSBCdWlsdGluVHlwZS5OdW1iZXIgPDwgOCB8IEJ1aWx0aW5UeXBlLk51bWJlcjpcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnF1ZXJ5LmdldEJ1aWx0aW5UeXBlKEJ1aWx0aW5UeXBlLk51bWJlcik7XG4gICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIGxldCBlcnJvckFzdCA9IGFzdC5sZWZ0O1xuICAgICAgICAgICAgc3dpdGNoIChsZWZ0S2luZCkge1xuICAgICAgICAgICAgICBjYXNlIEJ1aWx0aW5UeXBlLkFueTpcbiAgICAgICAgICAgICAgY2FzZSBCdWlsdGluVHlwZS5OdW1iZXI6XG4gICAgICAgICAgICAgICAgZXJyb3JBc3QgPSBhc3QucmlnaHQ7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLmRpYWdub3N0aWNzLnB1c2goXG4gICAgICAgICAgICAgICAgY3JlYXRlRGlhZ25vc3RpYyhlcnJvckFzdC5zcGFuLCBEaWFnbm9zdGljLmV4cGVjdGVkX2FfbnVtYmVyX3R5cGUpKTtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmFueVR5cGU7XG4gICAgICAgIH1cbiAgICAgIGNhc2UgJysnOlxuICAgICAgICBzd2l0Y2ggKG9wZXJLaW5kKSB7XG4gICAgICAgICAgY2FzZSBCdWlsdGluVHlwZS5BbnkgPDwgOCB8IEJ1aWx0aW5UeXBlLkFueTpcbiAgICAgICAgICBjYXNlIEJ1aWx0aW5UeXBlLkFueSA8PCA4IHwgQnVpbHRpblR5cGUuQm9vbGVhbjpcbiAgICAgICAgICBjYXNlIEJ1aWx0aW5UeXBlLkFueSA8PCA4IHwgQnVpbHRpblR5cGUuTnVtYmVyOlxuICAgICAgICAgIGNhc2UgQnVpbHRpblR5cGUuQW55IDw8IDggfCBCdWlsdGluVHlwZS5PdGhlcjpcbiAgICAgICAgICBjYXNlIEJ1aWx0aW5UeXBlLkJvb2xlYW4gPDwgOCB8IEJ1aWx0aW5UeXBlLkFueTpcbiAgICAgICAgICBjYXNlIEJ1aWx0aW5UeXBlLk51bWJlciA8PCA4IHwgQnVpbHRpblR5cGUuQW55OlxuICAgICAgICAgIGNhc2UgQnVpbHRpblR5cGUuT3RoZXIgPDwgOCB8IEJ1aWx0aW5UeXBlLkFueTpcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmFueVR5cGU7XG4gICAgICAgICAgY2FzZSBCdWlsdGluVHlwZS5BbnkgPDwgOCB8IEJ1aWx0aW5UeXBlLlN0cmluZzpcbiAgICAgICAgICBjYXNlIEJ1aWx0aW5UeXBlLkJvb2xlYW4gPDwgOCB8IEJ1aWx0aW5UeXBlLlN0cmluZzpcbiAgICAgICAgICBjYXNlIEJ1aWx0aW5UeXBlLk51bWJlciA8PCA4IHwgQnVpbHRpblR5cGUuU3RyaW5nOlxuICAgICAgICAgIGNhc2UgQnVpbHRpblR5cGUuU3RyaW5nIDw8IDggfCBCdWlsdGluVHlwZS5Bbnk6XG4gICAgICAgICAgY2FzZSBCdWlsdGluVHlwZS5TdHJpbmcgPDwgOCB8IEJ1aWx0aW5UeXBlLkJvb2xlYW46XG4gICAgICAgICAgY2FzZSBCdWlsdGluVHlwZS5TdHJpbmcgPDwgOCB8IEJ1aWx0aW5UeXBlLk51bWJlcjpcbiAgICAgICAgICBjYXNlIEJ1aWx0aW5UeXBlLlN0cmluZyA8PCA4IHwgQnVpbHRpblR5cGUuU3RyaW5nOlxuICAgICAgICAgIGNhc2UgQnVpbHRpblR5cGUuU3RyaW5nIDw8IDggfCBCdWlsdGluVHlwZS5PdGhlcjpcbiAgICAgICAgICBjYXNlIEJ1aWx0aW5UeXBlLk90aGVyIDw8IDggfCBCdWlsdGluVHlwZS5TdHJpbmc6XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5xdWVyeS5nZXRCdWlsdGluVHlwZShCdWlsdGluVHlwZS5TdHJpbmcpO1xuICAgICAgICAgIGNhc2UgQnVpbHRpblR5cGUuTnVtYmVyIDw8IDggfCBCdWlsdGluVHlwZS5OdW1iZXI6XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5xdWVyeS5nZXRCdWlsdGluVHlwZShCdWlsdGluVHlwZS5OdW1iZXIpO1xuICAgICAgICAgIGNhc2UgQnVpbHRpblR5cGUuQm9vbGVhbiA8PCA4IHwgQnVpbHRpblR5cGUuTnVtYmVyOlxuICAgICAgICAgIGNhc2UgQnVpbHRpblR5cGUuT3RoZXIgPDwgOCB8IEJ1aWx0aW5UeXBlLk51bWJlcjpcbiAgICAgICAgICAgIHRoaXMuZGlhZ25vc3RpY3MucHVzaChcbiAgICAgICAgICAgICAgICBjcmVhdGVEaWFnbm9zdGljKGFzdC5sZWZ0LnNwYW4sIERpYWdub3N0aWMuZXhwZWN0ZWRfYV9udW1iZXJfdHlwZSkpO1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuYW55VHlwZTtcbiAgICAgICAgICBjYXNlIEJ1aWx0aW5UeXBlLk51bWJlciA8PCA4IHwgQnVpbHRpblR5cGUuQm9vbGVhbjpcbiAgICAgICAgICBjYXNlIEJ1aWx0aW5UeXBlLk51bWJlciA8PCA4IHwgQnVpbHRpblR5cGUuT3RoZXI6XG4gICAgICAgICAgICB0aGlzLmRpYWdub3N0aWNzLnB1c2goXG4gICAgICAgICAgICAgICAgY3JlYXRlRGlhZ25vc3RpYyhhc3QucmlnaHQuc3BhbiwgRGlhZ25vc3RpYy5leHBlY3RlZF9hX251bWJlcl90eXBlKSk7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5hbnlUeXBlO1xuICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICB0aGlzLmRpYWdub3N0aWNzLnB1c2goXG4gICAgICAgICAgICAgICAgY3JlYXRlRGlhZ25vc3RpYyhhc3Quc3BhbiwgRGlhZ25vc3RpYy5leHBlY3RlZF9hX3N0cmluZ19vcl9udW1iZXJfdHlwZSkpO1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuYW55VHlwZTtcbiAgICAgICAgfVxuICAgICAgY2FzZSAnPic6XG4gICAgICBjYXNlICc8JzpcbiAgICAgIGNhc2UgJzw9JzpcbiAgICAgIGNhc2UgJz49JzpcbiAgICAgIGNhc2UgJz09JzpcbiAgICAgIGNhc2UgJyE9JzpcbiAgICAgIGNhc2UgJz09PSc6XG4gICAgICBjYXNlICchPT0nOlxuICAgICAgICBzd2l0Y2ggKG9wZXJLaW5kKSB7XG4gICAgICAgICAgY2FzZSBCdWlsdGluVHlwZS5BbnkgPDwgOCB8IEJ1aWx0aW5UeXBlLkFueTpcbiAgICAgICAgICBjYXNlIEJ1aWx0aW5UeXBlLkFueSA8PCA4IHwgQnVpbHRpblR5cGUuQm9vbGVhbjpcbiAgICAgICAgICBjYXNlIEJ1aWx0aW5UeXBlLkFueSA8PCA4IHwgQnVpbHRpblR5cGUuTnVtYmVyOlxuICAgICAgICAgIGNhc2UgQnVpbHRpblR5cGUuQW55IDw8IDggfCBCdWlsdGluVHlwZS5TdHJpbmc6XG4gICAgICAgICAgY2FzZSBCdWlsdGluVHlwZS5BbnkgPDwgOCB8IEJ1aWx0aW5UeXBlLk90aGVyOlxuICAgICAgICAgIGNhc2UgQnVpbHRpblR5cGUuQm9vbGVhbiA8PCA4IHwgQnVpbHRpblR5cGUuQW55OlxuICAgICAgICAgIGNhc2UgQnVpbHRpblR5cGUuQm9vbGVhbiA8PCA4IHwgQnVpbHRpblR5cGUuQm9vbGVhbjpcbiAgICAgICAgICBjYXNlIEJ1aWx0aW5UeXBlLk51bWJlciA8PCA4IHwgQnVpbHRpblR5cGUuQW55OlxuICAgICAgICAgIGNhc2UgQnVpbHRpblR5cGUuTnVtYmVyIDw8IDggfCBCdWlsdGluVHlwZS5OdW1iZXI6XG4gICAgICAgICAgY2FzZSBCdWlsdGluVHlwZS5TdHJpbmcgPDwgOCB8IEJ1aWx0aW5UeXBlLkFueTpcbiAgICAgICAgICBjYXNlIEJ1aWx0aW5UeXBlLlN0cmluZyA8PCA4IHwgQnVpbHRpblR5cGUuU3RyaW5nOlxuICAgICAgICAgIGNhc2UgQnVpbHRpblR5cGUuT3RoZXIgPDwgOCB8IEJ1aWx0aW5UeXBlLkFueTpcbiAgICAgICAgICBjYXNlIEJ1aWx0aW5UeXBlLk90aGVyIDw8IDggfCBCdWlsdGluVHlwZS5PdGhlcjpcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnF1ZXJ5LmdldEJ1aWx0aW5UeXBlKEJ1aWx0aW5UeXBlLkJvb2xlYW4pO1xuICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICB0aGlzLmRpYWdub3N0aWNzLnB1c2goXG4gICAgICAgICAgICAgICAgY3JlYXRlRGlhZ25vc3RpYyhhc3Quc3BhbiwgRGlhZ25vc3RpYy5leHBlY3RlZF9vcGVyYW5kc19vZl9zaW1pbGFyX3R5cGVfb3JfYW55KSk7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5hbnlUeXBlO1xuICAgICAgICB9XG4gICAgICBjYXNlICcmJic6XG4gICAgICAgIHJldHVybiByaWdodFR5cGU7XG4gICAgICBjYXNlICd8fCc6XG4gICAgICAgIHJldHVybiB0aGlzLnF1ZXJ5LmdldFR5cGVVbmlvbihsZWZ0VHlwZSwgcmlnaHRUeXBlKTtcbiAgICB9XG5cbiAgICB0aGlzLmRpYWdub3N0aWNzLnB1c2goXG4gICAgICAgIGNyZWF0ZURpYWdub3N0aWMoYXN0LnNwYW4sIERpYWdub3N0aWMudW5yZWNvZ25pemVkX29wZXJhdG9yLCBhc3Qub3BlcmF0aW9uKSk7XG4gICAgcmV0dXJuIHRoaXMuYW55VHlwZTtcbiAgfVxuXG4gIHZpc2l0Q2hhaW4oYXN0OiBDaGFpbikge1xuICAgIC8vIElmIHdlIGFyZSBwcm9kdWNpbmcgZGlhZ25vc3RpY3MsIHZpc2l0IHRoZSBjaGlsZHJlblxuICAgIGZvciAoY29uc3QgZXhwciBvZiBhc3QuZXhwcmVzc2lvbnMpIHtcbiAgICAgIGV4cHIudmlzaXQodGhpcyk7XG4gICAgfVxuICAgIC8vIFRoZSB0eXBlIG9mIGEgY2hhaW4gaXMgYWx3YXlzIHVuZGVmaW5lZC5cbiAgICByZXR1cm4gdGhpcy5xdWVyeS5nZXRCdWlsdGluVHlwZShCdWlsdGluVHlwZS5VbmRlZmluZWQpO1xuICB9XG5cbiAgdmlzaXRDb25kaXRpb25hbChhc3Q6IENvbmRpdGlvbmFsKSB7XG4gICAgLy8gVGhlIHR5cGUgb2YgYSBjb25kaXRpb25hbCBpcyB0aGUgdW5pb24gb2YgdGhlIHRydWUgYW5kIGZhbHNlIGNvbmRpdGlvbnMuXG4gICAgYXN0LmNvbmRpdGlvbi52aXNpdCh0aGlzKTtcbiAgICBhc3QudHJ1ZUV4cC52aXNpdCh0aGlzKTtcbiAgICBhc3QuZmFsc2VFeHAudmlzaXQodGhpcyk7XG4gICAgcmV0dXJuIHRoaXMucXVlcnkuZ2V0VHlwZVVuaW9uKHRoaXMuZ2V0VHlwZShhc3QudHJ1ZUV4cCksIHRoaXMuZ2V0VHlwZShhc3QuZmFsc2VFeHApKTtcbiAgfVxuXG4gIHZpc2l0RnVuY3Rpb25DYWxsKGFzdDogRnVuY3Rpb25DYWxsKSB7XG4gICAgLy8gVGhlIHR5cGUgb2YgYSBmdW5jdGlvbiBjYWxsIGlzIHRoZSByZXR1cm4gdHlwZSBvZiB0aGUgc2VsZWN0ZWQgc2lnbmF0dXJlLlxuICAgIC8vIFRoZSBzaWduYXR1cmUgaXMgc2VsZWN0ZWQgYmFzZWQgb24gdGhlIHR5cGVzIG9mIHRoZSBhcmd1bWVudHMuIEFuZ3VsYXIgZG9lc24ndFxuICAgIC8vIHN1cHBvcnQgY29udGV4dHVhbCB0eXBpbmcgb2YgYXJndW1lbnRzIHNvIHRoaXMgaXMgc2ltcGxlciB0aGFuIFR5cGVTY3JpcHQnc1xuICAgIC8vIHZlcnNpb24uXG4gICAgY29uc3QgYXJncyA9IGFzdC5hcmdzLm1hcChhcmcgPT4gdGhpcy5nZXRUeXBlKGFyZykpO1xuICAgIGNvbnN0IHRhcmdldCA9IHRoaXMuZ2V0VHlwZShhc3QudGFyZ2V0ICEpO1xuICAgIGlmICghdGFyZ2V0IHx8ICF0YXJnZXQuY2FsbGFibGUpIHtcbiAgICAgIHRoaXMuZGlhZ25vc3RpY3MucHVzaChjcmVhdGVEaWFnbm9zdGljKGFzdC5zcGFuLCBEaWFnbm9zdGljLmNhbGxfdGFyZ2V0X25vdF9jYWxsYWJsZSkpO1xuICAgICAgcmV0dXJuIHRoaXMuYW55VHlwZTtcbiAgICB9XG4gICAgY29uc3Qgc2lnbmF0dXJlID0gdGFyZ2V0LnNlbGVjdFNpZ25hdHVyZShhcmdzKTtcbiAgICBpZiAoc2lnbmF0dXJlKSB7XG4gICAgICByZXR1cm4gc2lnbmF0dXJlLnJlc3VsdDtcbiAgICB9XG4gICAgLy8gVE9ETzogQ29uc2lkZXIgYSBiZXR0ZXIgZXJyb3IgbWVzc2FnZSBoZXJlLlxuICAgIHRoaXMuZGlhZ25vc3RpY3MucHVzaChcbiAgICAgICAgY3JlYXRlRGlhZ25vc3RpYyhhc3Quc3BhbiwgRGlhZ25vc3RpYy51bmFibGVfdG9fcmVzb2x2ZV9jb21wYXRpYmxlX2NhbGxfc2lnbmF0dXJlKSk7XG4gICAgcmV0dXJuIHRoaXMuYW55VHlwZTtcbiAgfVxuXG4gIHZpc2l0SW1wbGljaXRSZWNlaXZlcihhc3Q6IEltcGxpY2l0UmVjZWl2ZXIpOiBTeW1ib2wge1xuICAgIGNvbnN0IF90aGlzID0gdGhpcztcbiAgICAvLyBSZXR1cm4gYSBwc2V1ZG8tc3ltYm9sIGZvciB0aGUgaW1wbGljaXQgcmVjZWl2ZXIuXG4gICAgLy8gVGhlIG1lbWJlcnMgb2YgdGhlIGltcGxpY2l0IHJlY2VpdmVyIGFyZSB3aGF0IGlzIGRlZmluZWQgYnkgdGhlXG4gICAgLy8gc2NvcGUgcGFzc2VkIGludG8gdGhpcyBjbGFzcy5cbiAgICByZXR1cm4ge1xuICAgICAgbmFtZTogJyRpbXBsaWNpdCcsXG4gICAgICBraW5kOiAnY29tcG9uZW50JyxcbiAgICAgIGxhbmd1YWdlOiAnbmctdGVtcGxhdGUnLFxuICAgICAgdHlwZTogdW5kZWZpbmVkLFxuICAgICAgY29udGFpbmVyOiB1bmRlZmluZWQsXG4gICAgICBjYWxsYWJsZTogZmFsc2UsXG4gICAgICBudWxsYWJsZTogZmFsc2UsXG4gICAgICBwdWJsaWM6IHRydWUsXG4gICAgICBkZWZpbml0aW9uOiB1bmRlZmluZWQsXG4gICAgICBkb2N1bWVudGF0aW9uOiBbXSxcbiAgICAgIG1lbWJlcnMoKTogU3ltYm9sVGFibGV7cmV0dXJuIF90aGlzLnNjb3BlO30sXG4gICAgICBzaWduYXR1cmVzKCk6IFNpZ25hdHVyZVtde3JldHVybiBbXTt9LFxuICAgICAgc2VsZWN0U2lnbmF0dXJlKHR5cGVzKTogU2lnbmF0dXJlIHwgdW5kZWZpbmVke3JldHVybiB1bmRlZmluZWQ7fSxcbiAgICAgIGluZGV4ZWQoYXJndW1lbnQpOiBTeW1ib2wgfCB1bmRlZmluZWR7cmV0dXJuIHVuZGVmaW5lZDt9LFxuICAgICAgdHlwZUFyZ3VtZW50cygpOiBTeW1ib2xbXSB8IHVuZGVmaW5lZHtyZXR1cm4gdW5kZWZpbmVkO30sXG4gICAgfTtcbiAgfVxuXG4gIHZpc2l0SW50ZXJwb2xhdGlvbihhc3Q6IEludGVycG9sYXRpb24pOiBTeW1ib2wge1xuICAgIC8vIElmIHdlIGFyZSBwcm9kdWNpbmcgZGlhZ25vc3RpY3MsIHZpc2l0IHRoZSBjaGlsZHJlbi5cbiAgICBmb3IgKGNvbnN0IGV4cHIgb2YgYXN0LmV4cHJlc3Npb25zKSB7XG4gICAgICBleHByLnZpc2l0KHRoaXMpO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy51bmRlZmluZWRUeXBlO1xuICB9XG5cbiAgdmlzaXRLZXllZFJlYWQoYXN0OiBLZXllZFJlYWQpOiBTeW1ib2wge1xuICAgIGNvbnN0IHRhcmdldFR5cGUgPSB0aGlzLmdldFR5cGUoYXN0Lm9iaik7XG4gICAgY29uc3Qga2V5VHlwZSA9IHRoaXMuZ2V0VHlwZShhc3Qua2V5KTtcbiAgICBjb25zdCByZXN1bHQgPSB0YXJnZXRUeXBlLmluZGV4ZWQoXG4gICAgICAgIGtleVR5cGUsIGFzdC5rZXkgaW5zdGFuY2VvZiBMaXRlcmFsUHJpbWl0aXZlID8gYXN0LmtleS52YWx1ZSA6IHVuZGVmaW5lZCk7XG4gICAgcmV0dXJuIHJlc3VsdCB8fCB0aGlzLmFueVR5cGU7XG4gIH1cblxuICB2aXNpdEtleWVkV3JpdGUoYXN0OiBLZXllZFdyaXRlKTogU3ltYm9sIHtcbiAgICAvLyBUaGUgd3JpdGUgb2YgYSB0eXBlIGlzIHRoZSB0eXBlIG9mIHRoZSB2YWx1ZSBiZWluZyB3cml0dGVuLlxuICAgIHJldHVybiB0aGlzLmdldFR5cGUoYXN0LnZhbHVlKTtcbiAgfVxuXG4gIHZpc2l0TGl0ZXJhbEFycmF5KGFzdDogTGl0ZXJhbEFycmF5KTogU3ltYm9sIHtcbiAgICAvLyBBIHR5cGUgbGl0ZXJhbCBpcyBhbiBhcnJheSB0eXBlIG9mIHRoZSB1bmlvbiBvZiB0aGUgZWxlbWVudHNcbiAgICByZXR1cm4gdGhpcy5xdWVyeS5nZXRBcnJheVR5cGUoXG4gICAgICAgIHRoaXMucXVlcnkuZ2V0VHlwZVVuaW9uKC4uLmFzdC5leHByZXNzaW9ucy5tYXAoZWxlbWVudCA9PiB0aGlzLmdldFR5cGUoZWxlbWVudCkpKSk7XG4gIH1cblxuICB2aXNpdExpdGVyYWxNYXAoYXN0OiBMaXRlcmFsTWFwKTogU3ltYm9sIHtcbiAgICAvLyBJZiB3ZSBhcmUgcHJvZHVjaW5nIGRpYWdub3N0aWNzLCB2aXNpdCB0aGUgY2hpbGRyZW5cbiAgICBmb3IgKGNvbnN0IHZhbHVlIG9mIGFzdC52YWx1ZXMpIHtcbiAgICAgIHZhbHVlLnZpc2l0KHRoaXMpO1xuICAgIH1cbiAgICAvLyBUT0RPOiBSZXR1cm4gYSBjb21wb3NpdGUgdHlwZS5cbiAgICByZXR1cm4gdGhpcy5hbnlUeXBlO1xuICB9XG5cbiAgdmlzaXRMaXRlcmFsUHJpbWl0aXZlKGFzdDogTGl0ZXJhbFByaW1pdGl2ZSkge1xuICAgIC8vIFRoZSB0eXBlIG9mIGEgbGl0ZXJhbCBwcmltaXRpdmUgZGVwZW5kcyBvbiB0aGUgdmFsdWUgb2YgdGhlIGxpdGVyYWwuXG4gICAgc3dpdGNoIChhc3QudmFsdWUpIHtcbiAgICAgIGNhc2UgdHJ1ZTpcbiAgICAgIGNhc2UgZmFsc2U6XG4gICAgICAgIHJldHVybiB0aGlzLnF1ZXJ5LmdldEJ1aWx0aW5UeXBlKEJ1aWx0aW5UeXBlLkJvb2xlYW4pO1xuICAgICAgY2FzZSBudWxsOlxuICAgICAgICByZXR1cm4gdGhpcy5xdWVyeS5nZXRCdWlsdGluVHlwZShCdWlsdGluVHlwZS5OdWxsKTtcbiAgICAgIGNhc2UgdW5kZWZpbmVkOlxuICAgICAgICByZXR1cm4gdGhpcy5xdWVyeS5nZXRCdWlsdGluVHlwZShCdWlsdGluVHlwZS5VbmRlZmluZWQpO1xuICAgICAgZGVmYXVsdDpcbiAgICAgICAgc3dpdGNoICh0eXBlb2YgYXN0LnZhbHVlKSB7XG4gICAgICAgICAgY2FzZSAnc3RyaW5nJzpcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnF1ZXJ5LmdldEJ1aWx0aW5UeXBlKEJ1aWx0aW5UeXBlLlN0cmluZyk7XG4gICAgICAgICAgY2FzZSAnbnVtYmVyJzpcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnF1ZXJ5LmdldEJ1aWx0aW5UeXBlKEJ1aWx0aW5UeXBlLk51bWJlcik7XG4gICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIHRoaXMuZGlhZ25vc3RpY3MucHVzaChcbiAgICAgICAgICAgICAgICBjcmVhdGVEaWFnbm9zdGljKGFzdC5zcGFuLCBEaWFnbm9zdGljLnVucmVjb2duaXplZF9wcmltaXRpdmUsIHR5cGVvZiBhc3QudmFsdWUpKTtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmFueVR5cGU7XG4gICAgICAgIH1cbiAgICB9XG4gIH1cblxuICB2aXNpdE1ldGhvZENhbGwoYXN0OiBNZXRob2RDYWxsKSB7XG4gICAgcmV0dXJuIHRoaXMucmVzb2x2ZU1ldGhvZENhbGwodGhpcy5nZXRUeXBlKGFzdC5yZWNlaXZlciksIGFzdCk7XG4gIH1cblxuICB2aXNpdFBpcGUoYXN0OiBCaW5kaW5nUGlwZSkge1xuICAgIC8vIFRoZSB0eXBlIG9mIGEgcGlwZSBub2RlIGlzIHRoZSByZXR1cm4gdHlwZSBvZiB0aGUgcGlwZSdzIHRyYW5zZm9ybSBtZXRob2QuIFRoZSB0YWJsZSByZXR1cm5lZFxuICAgIC8vIGJ5IGdldFBpcGVzKCkgaXMgZXhwZWN0ZWQgdG8gY29udGFpbiBzeW1ib2xzIHdpdGggdGhlIGNvcnJlc3BvbmRpbmcgdHJhbnNmb3JtIG1ldGhvZCB0eXBlLlxuICAgIGNvbnN0IHBpcGUgPSB0aGlzLnF1ZXJ5LmdldFBpcGVzKCkuZ2V0KGFzdC5uYW1lKTtcbiAgICBpZiAoIXBpcGUpIHtcbiAgICAgIHRoaXMuZGlhZ25vc3RpY3MucHVzaChjcmVhdGVEaWFnbm9zdGljKGFzdC5zcGFuLCBEaWFnbm9zdGljLm5vX3BpcGVfZm91bmQsIGFzdC5uYW1lKSk7XG4gICAgICByZXR1cm4gdGhpcy5hbnlUeXBlO1xuICAgIH1cbiAgICBjb25zdCBleHBUeXBlID0gdGhpcy5nZXRUeXBlKGFzdC5leHApO1xuICAgIGNvbnN0IHNpZ25hdHVyZSA9XG4gICAgICAgIHBpcGUuc2VsZWN0U2lnbmF0dXJlKFtleHBUeXBlXS5jb25jYXQoYXN0LmFyZ3MubWFwKGFyZyA9PiB0aGlzLmdldFR5cGUoYXJnKSkpKTtcbiAgICBpZiAoIXNpZ25hdHVyZSkge1xuICAgICAgdGhpcy5kaWFnbm9zdGljcy5wdXNoKFxuICAgICAgICAgIGNyZWF0ZURpYWdub3N0aWMoYXN0LnNwYW4sIERpYWdub3N0aWMudW5hYmxlX3RvX3Jlc29sdmVfc2lnbmF0dXJlLCBhc3QubmFtZSkpO1xuICAgICAgcmV0dXJuIHRoaXMuYW55VHlwZTtcbiAgICB9XG4gICAgcmV0dXJuIHNpZ25hdHVyZS5yZXN1bHQ7XG4gIH1cblxuICB2aXNpdFByZWZpeE5vdChhc3Q6IFByZWZpeE5vdCkge1xuICAgIC8vIElmIHdlIGFyZSBwcm9kdWNpbmcgZGlhZ25vc3RpY3MsIHZpc2l0IHRoZSBjaGlsZHJlblxuICAgIGFzdC5leHByZXNzaW9uLnZpc2l0KHRoaXMpO1xuICAgIC8vIFRoZSB0eXBlIG9mIGEgcHJlZml4ICEgaXMgYWx3YXlzIGJvb2xlYW4uXG4gICAgcmV0dXJuIHRoaXMucXVlcnkuZ2V0QnVpbHRpblR5cGUoQnVpbHRpblR5cGUuQm9vbGVhbik7XG4gIH1cblxuICB2aXNpdE5vbk51bGxBc3NlcnQoYXN0OiBOb25OdWxsQXNzZXJ0KSB7XG4gICAgY29uc3QgZXhwcmVzc2lvblR5cGUgPSB0aGlzLmdldFR5cGUoYXN0LmV4cHJlc3Npb24pO1xuICAgIHJldHVybiB0aGlzLnF1ZXJ5LmdldE5vbk51bGxhYmxlVHlwZShleHByZXNzaW9uVHlwZSk7XG4gIH1cblxuICB2aXNpdFByb3BlcnR5UmVhZChhc3Q6IFByb3BlcnR5UmVhZCkge1xuICAgIHJldHVybiB0aGlzLnJlc29sdmVQcm9wZXJ0eVJlYWQodGhpcy5nZXRUeXBlKGFzdC5yZWNlaXZlciksIGFzdCk7XG4gIH1cblxuICB2aXNpdFByb3BlcnR5V3JpdGUoYXN0OiBQcm9wZXJ0eVdyaXRlKSB7XG4gICAgLy8gVGhlIHR5cGUgb2YgYSB3cml0ZSBpcyB0aGUgdHlwZSBvZiB0aGUgdmFsdWUgYmVpbmcgd3JpdHRlbi5cbiAgICByZXR1cm4gdGhpcy5nZXRUeXBlKGFzdC52YWx1ZSk7XG4gIH1cblxuICB2aXNpdFF1b3RlKGFzdDogUXVvdGUpIHtcbiAgICAvLyBUaGUgdHlwZSBvZiBhIHF1b3RlZCBleHByZXNzaW9uIGlzIGFueS5cbiAgICByZXR1cm4gdGhpcy5xdWVyeS5nZXRCdWlsdGluVHlwZShCdWlsdGluVHlwZS5BbnkpO1xuICB9XG5cbiAgdmlzaXRTYWZlTWV0aG9kQ2FsbChhc3Q6IFNhZmVNZXRob2RDYWxsKSB7XG4gICAgcmV0dXJuIHRoaXMucmVzb2x2ZU1ldGhvZENhbGwodGhpcy5xdWVyeS5nZXROb25OdWxsYWJsZVR5cGUodGhpcy5nZXRUeXBlKGFzdC5yZWNlaXZlcikpLCBhc3QpO1xuICB9XG5cbiAgdmlzaXRTYWZlUHJvcGVydHlSZWFkKGFzdDogU2FmZVByb3BlcnR5UmVhZCkge1xuICAgIHJldHVybiB0aGlzLnJlc29sdmVQcm9wZXJ0eVJlYWQodGhpcy5xdWVyeS5nZXROb25OdWxsYWJsZVR5cGUodGhpcy5nZXRUeXBlKGFzdC5yZWNlaXZlcikpLCBhc3QpO1xuICB9XG5cbiAgcHJpdmF0ZSBfYW55VHlwZTogU3ltYm9sfHVuZGVmaW5lZDtcbiAgcHJpdmF0ZSBnZXQgYW55VHlwZSgpOiBTeW1ib2wge1xuICAgIGxldCByZXN1bHQgPSB0aGlzLl9hbnlUeXBlO1xuICAgIGlmICghcmVzdWx0KSB7XG4gICAgICByZXN1bHQgPSB0aGlzLl9hbnlUeXBlID0gdGhpcy5xdWVyeS5nZXRCdWlsdGluVHlwZShCdWlsdGluVHlwZS5BbnkpO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG5cbiAgcHJpdmF0ZSBfdW5kZWZpbmVkVHlwZTogU3ltYm9sfHVuZGVmaW5lZDtcbiAgcHJpdmF0ZSBnZXQgdW5kZWZpbmVkVHlwZSgpOiBTeW1ib2wge1xuICAgIGxldCByZXN1bHQgPSB0aGlzLl91bmRlZmluZWRUeXBlO1xuICAgIGlmICghcmVzdWx0KSB7XG4gICAgICByZXN1bHQgPSB0aGlzLl91bmRlZmluZWRUeXBlID0gdGhpcy5xdWVyeS5nZXRCdWlsdGluVHlwZShCdWlsdGluVHlwZS5VbmRlZmluZWQpO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG5cbiAgcHJpdmF0ZSByZXNvbHZlTWV0aG9kQ2FsbChyZWNlaXZlclR5cGU6IFN5bWJvbCwgYXN0OiBTYWZlTWV0aG9kQ2FsbHxNZXRob2RDYWxsKSB7XG4gICAgaWYgKHRoaXMuaXNBbnkocmVjZWl2ZXJUeXBlKSkge1xuICAgICAgcmV0dXJuIHRoaXMuYW55VHlwZTtcbiAgICB9XG4gICAgY29uc3QgbWV0aG9kVHlwZSA9IHRoaXMucmVzb2x2ZVByb3BlcnR5UmVhZChyZWNlaXZlclR5cGUsIGFzdCk7XG4gICAgaWYgKCFtZXRob2RUeXBlKSB7XG4gICAgICB0aGlzLmRpYWdub3N0aWNzLnB1c2goXG4gICAgICAgICAgY3JlYXRlRGlhZ25vc3RpYyhhc3Quc3BhbiwgRGlhZ25vc3RpYy5jb3VsZF9ub3RfcmVzb2x2ZV90eXBlLCBhc3QubmFtZSkpO1xuICAgICAgcmV0dXJuIHRoaXMuYW55VHlwZTtcbiAgICB9XG4gICAgaWYgKHRoaXMuaXNBbnkobWV0aG9kVHlwZSkpIHtcbiAgICAgIHJldHVybiB0aGlzLmFueVR5cGU7XG4gICAgfVxuICAgIGlmICghbWV0aG9kVHlwZS5jYWxsYWJsZSkge1xuICAgICAgdGhpcy5kaWFnbm9zdGljcy5wdXNoKFxuICAgICAgICAgIGNyZWF0ZURpYWdub3N0aWMoYXN0LnNwYW4sIERpYWdub3N0aWMuaWRlbnRpZmllcl9ub3RfY2FsbGFibGUsIGFzdC5uYW1lKSk7XG4gICAgICByZXR1cm4gdGhpcy5hbnlUeXBlO1xuICAgIH1cbiAgICBjb25zdCBzaWduYXR1cmUgPSBtZXRob2RUeXBlLnNlbGVjdFNpZ25hdHVyZShhc3QuYXJncy5tYXAoYXJnID0+IHRoaXMuZ2V0VHlwZShhcmcpKSk7XG4gICAgaWYgKCFzaWduYXR1cmUpIHtcbiAgICAgIHRoaXMuZGlhZ25vc3RpY3MucHVzaChcbiAgICAgICAgICBjcmVhdGVEaWFnbm9zdGljKGFzdC5zcGFuLCBEaWFnbm9zdGljLnVuYWJsZV90b19yZXNvbHZlX3NpZ25hdHVyZSwgYXN0Lm5hbWUpKTtcbiAgICAgIHJldHVybiB0aGlzLmFueVR5cGU7XG4gICAgfVxuICAgIHJldHVybiBzaWduYXR1cmUucmVzdWx0O1xuICB9XG5cbiAgcHJpdmF0ZSByZXNvbHZlUHJvcGVydHlSZWFkKHJlY2VpdmVyVHlwZTogU3ltYm9sLCBhc3Q6IFNhZmVQcm9wZXJ0eVJlYWR8UHJvcGVydHlSZWFkKSB7XG4gICAgaWYgKHRoaXMuaXNBbnkocmVjZWl2ZXJUeXBlKSkge1xuICAgICAgcmV0dXJuIHRoaXMuYW55VHlwZTtcbiAgICB9XG4gICAgLy8gVGhlIHR5cGUgb2YgYSBwcm9wZXJ0eSByZWFkIGlzIHRoZSBzZWVsY3RlZCBtZW1iZXIncyB0eXBlLlxuICAgIGNvbnN0IG1lbWJlciA9IHJlY2VpdmVyVHlwZS5tZW1iZXJzKCkuZ2V0KGFzdC5uYW1lKTtcbiAgICBpZiAoIW1lbWJlcikge1xuICAgICAgaWYgKHJlY2VpdmVyVHlwZS5uYW1lID09PSAnJGltcGxpY2l0Jykge1xuICAgICAgICB0aGlzLmRpYWdub3N0aWNzLnB1c2goXG4gICAgICAgICAgICBjcmVhdGVEaWFnbm9zdGljKGFzdC5zcGFuLCBEaWFnbm9zdGljLmlkZW50aWZpZXJfbm90X2RlZmluZWRfaW5fYXBwX2NvbnRleHQsIGFzdC5uYW1lKSk7XG4gICAgICB9IGVsc2UgaWYgKHJlY2VpdmVyVHlwZS5udWxsYWJsZSAmJiBhc3QucmVjZWl2ZXIgaW5zdGFuY2VvZiBQcm9wZXJ0eVJlYWQpIHtcbiAgICAgICAgY29uc3QgcmVjZWl2ZXIgPSBhc3QucmVjZWl2ZXIubmFtZTtcbiAgICAgICAgdGhpcy5kaWFnbm9zdGljcy5wdXNoKGNyZWF0ZURpYWdub3N0aWMoXG4gICAgICAgICAgICBhc3Quc3BhbiwgRGlhZ25vc3RpYy5pZGVudGlmaWVyX3Bvc3NpYmx5X3VuZGVmaW5lZCwgcmVjZWl2ZXIsXG4gICAgICAgICAgICBgJHtyZWNlaXZlcn0/LiR7YXN0Lm5hbWV9YCwgYCR7cmVjZWl2ZXJ9IS4ke2FzdC5uYW1lfWApKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuZGlhZ25vc3RpY3MucHVzaChjcmVhdGVEaWFnbm9zdGljKFxuICAgICAgICAgICAgYXN0LnNwYW4sIERpYWdub3N0aWMuaWRlbnRpZmllcl9ub3RfZGVmaW5lZF9vbl9yZWNlaXZlciwgYXN0Lm5hbWUsIHJlY2VpdmVyVHlwZS5uYW1lKSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gdGhpcy5hbnlUeXBlO1xuICAgIH1cbiAgICBpZiAoIW1lbWJlci5wdWJsaWMpIHtcbiAgICAgIGNvbnN0IGNvbnRhaW5lciA9XG4gICAgICAgICAgcmVjZWl2ZXJUeXBlLm5hbWUgPT09ICckaW1wbGljaXQnID8gJ3RoZSBjb21wb25lbnQnIDogYCcke3JlY2VpdmVyVHlwZS5uYW1lfSdgO1xuICAgICAgdGhpcy5kaWFnbm9zdGljcy5wdXNoKFxuICAgICAgICAgIGNyZWF0ZURpYWdub3N0aWMoYXN0LnNwYW4sIERpYWdub3N0aWMuaWRlbnRpZmllcl9pc19wcml2YXRlLCBhc3QubmFtZSwgY29udGFpbmVyKSk7XG4gICAgfVxuICAgIHJldHVybiBtZW1iZXIudHlwZTtcbiAgfVxuXG4gIHByaXZhdGUgaXNBbnkoc3ltYm9sOiBTeW1ib2wpOiBib29sZWFuIHtcbiAgICByZXR1cm4gIXN5bWJvbCB8fCB0aGlzLnF1ZXJ5LmdldFR5cGVLaW5kKHN5bWJvbCkgPT09IEJ1aWx0aW5UeXBlLkFueSB8fFxuICAgICAgICAoISFzeW1ib2wudHlwZSAmJiB0aGlzLmlzQW55KHN5bWJvbC50eXBlKSk7XG4gIH1cbn1cbiJdfQ==