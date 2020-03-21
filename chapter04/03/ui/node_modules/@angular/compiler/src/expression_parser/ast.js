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
        define("@angular/compiler/src/expression_parser/ast", ["require", "exports", "tslib"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var tslib_1 = require("tslib");
    var ParserError = /** @class */ (function () {
        function ParserError(message, input, errLocation, ctxLocation) {
            this.input = input;
            this.errLocation = errLocation;
            this.ctxLocation = ctxLocation;
            this.message = "Parser Error: " + message + " " + errLocation + " [" + input + "] in " + ctxLocation;
        }
        return ParserError;
    }());
    exports.ParserError = ParserError;
    var ParseSpan = /** @class */ (function () {
        function ParseSpan(start, end) {
            this.start = start;
            this.end = end;
        }
        ParseSpan.prototype.toAbsolute = function (absoluteOffset) {
            return new AbsoluteSourceSpan(absoluteOffset + this.start, absoluteOffset + this.end);
        };
        return ParseSpan;
    }());
    exports.ParseSpan = ParseSpan;
    var AST = /** @class */ (function () {
        function AST(span, 
        /**
         * Absolute location of the expression AST in a source code file.
         */
        sourceSpan) {
            this.span = span;
            this.sourceSpan = sourceSpan;
        }
        AST.prototype.visit = function (visitor, context) {
            if (context === void 0) { context = null; }
            return null;
        };
        AST.prototype.toString = function () { return 'AST'; };
        return AST;
    }());
    exports.AST = AST;
    /**
     * Represents a quoted expression of the form:
     *
     * quote = prefix `:` uninterpretedExpression
     * prefix = identifier
     * uninterpretedExpression = arbitrary string
     *
     * A quoted expression is meant to be pre-processed by an AST transformer that
     * converts it into another AST that no longer contains quoted expressions.
     * It is meant to allow third-party developers to extend Angular template
     * expression language. The `uninterpretedExpression` part of the quote is
     * therefore not interpreted by the Angular's own expression parser.
     */
    var Quote = /** @class */ (function (_super) {
        tslib_1.__extends(Quote, _super);
        function Quote(span, sourceSpan, prefix, uninterpretedExpression, location) {
            var _this = _super.call(this, span, sourceSpan) || this;
            _this.prefix = prefix;
            _this.uninterpretedExpression = uninterpretedExpression;
            _this.location = location;
            return _this;
        }
        Quote.prototype.visit = function (visitor, context) {
            if (context === void 0) { context = null; }
            return visitor.visitQuote(this, context);
        };
        Quote.prototype.toString = function () { return 'Quote'; };
        return Quote;
    }(AST));
    exports.Quote = Quote;
    var EmptyExpr = /** @class */ (function (_super) {
        tslib_1.__extends(EmptyExpr, _super);
        function EmptyExpr() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        EmptyExpr.prototype.visit = function (visitor, context) {
            if (context === void 0) { context = null; }
            // do nothing
        };
        return EmptyExpr;
    }(AST));
    exports.EmptyExpr = EmptyExpr;
    var ImplicitReceiver = /** @class */ (function (_super) {
        tslib_1.__extends(ImplicitReceiver, _super);
        function ImplicitReceiver() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        ImplicitReceiver.prototype.visit = function (visitor, context) {
            if (context === void 0) { context = null; }
            return visitor.visitImplicitReceiver(this, context);
        };
        return ImplicitReceiver;
    }(AST));
    exports.ImplicitReceiver = ImplicitReceiver;
    /**
     * Multiple expressions separated by a semicolon.
     */
    var Chain = /** @class */ (function (_super) {
        tslib_1.__extends(Chain, _super);
        function Chain(span, sourceSpan, expressions) {
            var _this = _super.call(this, span, sourceSpan) || this;
            _this.expressions = expressions;
            return _this;
        }
        Chain.prototype.visit = function (visitor, context) {
            if (context === void 0) { context = null; }
            return visitor.visitChain(this, context);
        };
        return Chain;
    }(AST));
    exports.Chain = Chain;
    var Conditional = /** @class */ (function (_super) {
        tslib_1.__extends(Conditional, _super);
        function Conditional(span, sourceSpan, condition, trueExp, falseExp) {
            var _this = _super.call(this, span, sourceSpan) || this;
            _this.condition = condition;
            _this.trueExp = trueExp;
            _this.falseExp = falseExp;
            return _this;
        }
        Conditional.prototype.visit = function (visitor, context) {
            if (context === void 0) { context = null; }
            return visitor.visitConditional(this, context);
        };
        return Conditional;
    }(AST));
    exports.Conditional = Conditional;
    var PropertyRead = /** @class */ (function (_super) {
        tslib_1.__extends(PropertyRead, _super);
        function PropertyRead(span, sourceSpan, receiver, name) {
            var _this = _super.call(this, span, sourceSpan) || this;
            _this.receiver = receiver;
            _this.name = name;
            return _this;
        }
        PropertyRead.prototype.visit = function (visitor, context) {
            if (context === void 0) { context = null; }
            return visitor.visitPropertyRead(this, context);
        };
        return PropertyRead;
    }(AST));
    exports.PropertyRead = PropertyRead;
    var PropertyWrite = /** @class */ (function (_super) {
        tslib_1.__extends(PropertyWrite, _super);
        function PropertyWrite(span, sourceSpan, receiver, name, value) {
            var _this = _super.call(this, span, sourceSpan) || this;
            _this.receiver = receiver;
            _this.name = name;
            _this.value = value;
            return _this;
        }
        PropertyWrite.prototype.visit = function (visitor, context) {
            if (context === void 0) { context = null; }
            return visitor.visitPropertyWrite(this, context);
        };
        return PropertyWrite;
    }(AST));
    exports.PropertyWrite = PropertyWrite;
    var SafePropertyRead = /** @class */ (function (_super) {
        tslib_1.__extends(SafePropertyRead, _super);
        function SafePropertyRead(span, sourceSpan, receiver, name) {
            var _this = _super.call(this, span, sourceSpan) || this;
            _this.receiver = receiver;
            _this.name = name;
            return _this;
        }
        SafePropertyRead.prototype.visit = function (visitor, context) {
            if (context === void 0) { context = null; }
            return visitor.visitSafePropertyRead(this, context);
        };
        return SafePropertyRead;
    }(AST));
    exports.SafePropertyRead = SafePropertyRead;
    var KeyedRead = /** @class */ (function (_super) {
        tslib_1.__extends(KeyedRead, _super);
        function KeyedRead(span, sourceSpan, obj, key) {
            var _this = _super.call(this, span, sourceSpan) || this;
            _this.obj = obj;
            _this.key = key;
            return _this;
        }
        KeyedRead.prototype.visit = function (visitor, context) {
            if (context === void 0) { context = null; }
            return visitor.visitKeyedRead(this, context);
        };
        return KeyedRead;
    }(AST));
    exports.KeyedRead = KeyedRead;
    var KeyedWrite = /** @class */ (function (_super) {
        tslib_1.__extends(KeyedWrite, _super);
        function KeyedWrite(span, sourceSpan, obj, key, value) {
            var _this = _super.call(this, span, sourceSpan) || this;
            _this.obj = obj;
            _this.key = key;
            _this.value = value;
            return _this;
        }
        KeyedWrite.prototype.visit = function (visitor, context) {
            if (context === void 0) { context = null; }
            return visitor.visitKeyedWrite(this, context);
        };
        return KeyedWrite;
    }(AST));
    exports.KeyedWrite = KeyedWrite;
    var BindingPipe = /** @class */ (function (_super) {
        tslib_1.__extends(BindingPipe, _super);
        function BindingPipe(span, sourceSpan, exp, name, args, nameSpan) {
            var _this = _super.call(this, span, sourceSpan) || this;
            _this.exp = exp;
            _this.name = name;
            _this.args = args;
            _this.nameSpan = nameSpan;
            return _this;
        }
        BindingPipe.prototype.visit = function (visitor, context) {
            if (context === void 0) { context = null; }
            return visitor.visitPipe(this, context);
        };
        return BindingPipe;
    }(AST));
    exports.BindingPipe = BindingPipe;
    var LiteralPrimitive = /** @class */ (function (_super) {
        tslib_1.__extends(LiteralPrimitive, _super);
        function LiteralPrimitive(span, sourceSpan, value) {
            var _this = _super.call(this, span, sourceSpan) || this;
            _this.value = value;
            return _this;
        }
        LiteralPrimitive.prototype.visit = function (visitor, context) {
            if (context === void 0) { context = null; }
            return visitor.visitLiteralPrimitive(this, context);
        };
        return LiteralPrimitive;
    }(AST));
    exports.LiteralPrimitive = LiteralPrimitive;
    var LiteralArray = /** @class */ (function (_super) {
        tslib_1.__extends(LiteralArray, _super);
        function LiteralArray(span, sourceSpan, expressions) {
            var _this = _super.call(this, span, sourceSpan) || this;
            _this.expressions = expressions;
            return _this;
        }
        LiteralArray.prototype.visit = function (visitor, context) {
            if (context === void 0) { context = null; }
            return visitor.visitLiteralArray(this, context);
        };
        return LiteralArray;
    }(AST));
    exports.LiteralArray = LiteralArray;
    var LiteralMap = /** @class */ (function (_super) {
        tslib_1.__extends(LiteralMap, _super);
        function LiteralMap(span, sourceSpan, keys, values) {
            var _this = _super.call(this, span, sourceSpan) || this;
            _this.keys = keys;
            _this.values = values;
            return _this;
        }
        LiteralMap.prototype.visit = function (visitor, context) {
            if (context === void 0) { context = null; }
            return visitor.visitLiteralMap(this, context);
        };
        return LiteralMap;
    }(AST));
    exports.LiteralMap = LiteralMap;
    var Interpolation = /** @class */ (function (_super) {
        tslib_1.__extends(Interpolation, _super);
        function Interpolation(span, sourceSpan, strings, expressions) {
            var _this = _super.call(this, span, sourceSpan) || this;
            _this.strings = strings;
            _this.expressions = expressions;
            return _this;
        }
        Interpolation.prototype.visit = function (visitor, context) {
            if (context === void 0) { context = null; }
            return visitor.visitInterpolation(this, context);
        };
        return Interpolation;
    }(AST));
    exports.Interpolation = Interpolation;
    var Binary = /** @class */ (function (_super) {
        tslib_1.__extends(Binary, _super);
        function Binary(span, sourceSpan, operation, left, right) {
            var _this = _super.call(this, span, sourceSpan) || this;
            _this.operation = operation;
            _this.left = left;
            _this.right = right;
            return _this;
        }
        Binary.prototype.visit = function (visitor, context) {
            if (context === void 0) { context = null; }
            return visitor.visitBinary(this, context);
        };
        return Binary;
    }(AST));
    exports.Binary = Binary;
    var PrefixNot = /** @class */ (function (_super) {
        tslib_1.__extends(PrefixNot, _super);
        function PrefixNot(span, sourceSpan, expression) {
            var _this = _super.call(this, span, sourceSpan) || this;
            _this.expression = expression;
            return _this;
        }
        PrefixNot.prototype.visit = function (visitor, context) {
            if (context === void 0) { context = null; }
            return visitor.visitPrefixNot(this, context);
        };
        return PrefixNot;
    }(AST));
    exports.PrefixNot = PrefixNot;
    var NonNullAssert = /** @class */ (function (_super) {
        tslib_1.__extends(NonNullAssert, _super);
        function NonNullAssert(span, sourceSpan, expression) {
            var _this = _super.call(this, span, sourceSpan) || this;
            _this.expression = expression;
            return _this;
        }
        NonNullAssert.prototype.visit = function (visitor, context) {
            if (context === void 0) { context = null; }
            return visitor.visitNonNullAssert(this, context);
        };
        return NonNullAssert;
    }(AST));
    exports.NonNullAssert = NonNullAssert;
    var MethodCall = /** @class */ (function (_super) {
        tslib_1.__extends(MethodCall, _super);
        function MethodCall(span, sourceSpan, receiver, name, args) {
            var _this = _super.call(this, span, sourceSpan) || this;
            _this.receiver = receiver;
            _this.name = name;
            _this.args = args;
            return _this;
        }
        MethodCall.prototype.visit = function (visitor, context) {
            if (context === void 0) { context = null; }
            return visitor.visitMethodCall(this, context);
        };
        return MethodCall;
    }(AST));
    exports.MethodCall = MethodCall;
    var SafeMethodCall = /** @class */ (function (_super) {
        tslib_1.__extends(SafeMethodCall, _super);
        function SafeMethodCall(span, sourceSpan, receiver, name, args) {
            var _this = _super.call(this, span, sourceSpan) || this;
            _this.receiver = receiver;
            _this.name = name;
            _this.args = args;
            return _this;
        }
        SafeMethodCall.prototype.visit = function (visitor, context) {
            if (context === void 0) { context = null; }
            return visitor.visitSafeMethodCall(this, context);
        };
        return SafeMethodCall;
    }(AST));
    exports.SafeMethodCall = SafeMethodCall;
    var FunctionCall = /** @class */ (function (_super) {
        tslib_1.__extends(FunctionCall, _super);
        function FunctionCall(span, sourceSpan, target, args) {
            var _this = _super.call(this, span, sourceSpan) || this;
            _this.target = target;
            _this.args = args;
            return _this;
        }
        FunctionCall.prototype.visit = function (visitor, context) {
            if (context === void 0) { context = null; }
            return visitor.visitFunctionCall(this, context);
        };
        return FunctionCall;
    }(AST));
    exports.FunctionCall = FunctionCall;
    /**
     * Records the absolute position of a text span in a source file, where `start` and `end` are the
     * starting and ending byte offsets, respectively, of the text span in a source file.
     */
    var AbsoluteSourceSpan = /** @class */ (function () {
        function AbsoluteSourceSpan(start, end) {
            this.start = start;
            this.end = end;
        }
        return AbsoluteSourceSpan;
    }());
    exports.AbsoluteSourceSpan = AbsoluteSourceSpan;
    var ASTWithSource = /** @class */ (function (_super) {
        tslib_1.__extends(ASTWithSource, _super);
        function ASTWithSource(ast, source, location, absoluteOffset, errors) {
            var _this = _super.call(this, new ParseSpan(0, source === null ? 0 : source.length), new AbsoluteSourceSpan(absoluteOffset, source === null ? absoluteOffset : absoluteOffset + source.length)) || this;
            _this.ast = ast;
            _this.source = source;
            _this.location = location;
            _this.errors = errors;
            return _this;
        }
        ASTWithSource.prototype.visit = function (visitor, context) {
            if (context === void 0) { context = null; }
            if (visitor.visitASTWithSource) {
                return visitor.visitASTWithSource(this, context);
            }
            return this.ast.visit(visitor, context);
        };
        ASTWithSource.prototype.toString = function () { return this.source + " in " + this.location; };
        return ASTWithSource;
    }(AST));
    exports.ASTWithSource = ASTWithSource;
    var TemplateBinding = /** @class */ (function () {
        function TemplateBinding(span, sourceSpan, key, keyIsVar, name, expression) {
            this.span = span;
            this.key = key;
            this.keyIsVar = keyIsVar;
            this.name = name;
            this.expression = expression;
        }
        return TemplateBinding;
    }());
    exports.TemplateBinding = TemplateBinding;
    var RecursiveAstVisitor = /** @class */ (function () {
        function RecursiveAstVisitor() {
        }
        RecursiveAstVisitor.prototype.visit = function (ast, context) {
            // The default implementation just visits every node.
            // Classes that extend RecursiveAstVisitor should override this function
            // to selectively visit the specified node.
            ast.visit(this, context);
        };
        RecursiveAstVisitor.prototype.visitBinary = function (ast, context) {
            this.visit(ast.left, context);
            this.visit(ast.right, context);
        };
        RecursiveAstVisitor.prototype.visitChain = function (ast, context) { this.visitAll(ast.expressions, context); };
        RecursiveAstVisitor.prototype.visitConditional = function (ast, context) {
            this.visit(ast.condition, context);
            this.visit(ast.trueExp, context);
            this.visit(ast.falseExp, context);
        };
        RecursiveAstVisitor.prototype.visitPipe = function (ast, context) {
            this.visit(ast.exp, context);
            this.visitAll(ast.args, context);
        };
        RecursiveAstVisitor.prototype.visitFunctionCall = function (ast, context) {
            if (ast.target) {
                this.visit(ast.target, context);
            }
            this.visitAll(ast.args, context);
        };
        RecursiveAstVisitor.prototype.visitImplicitReceiver = function (ast, context) { };
        RecursiveAstVisitor.prototype.visitInterpolation = function (ast, context) {
            this.visitAll(ast.expressions, context);
        };
        RecursiveAstVisitor.prototype.visitKeyedRead = function (ast, context) {
            this.visit(ast.obj, context);
            this.visit(ast.key, context);
        };
        RecursiveAstVisitor.prototype.visitKeyedWrite = function (ast, context) {
            this.visit(ast.obj, context);
            this.visit(ast.key, context);
            this.visit(ast.value, context);
        };
        RecursiveAstVisitor.prototype.visitLiteralArray = function (ast, context) {
            this.visitAll(ast.expressions, context);
        };
        RecursiveAstVisitor.prototype.visitLiteralMap = function (ast, context) { this.visitAll(ast.values, context); };
        RecursiveAstVisitor.prototype.visitLiteralPrimitive = function (ast, context) { };
        RecursiveAstVisitor.prototype.visitMethodCall = function (ast, context) {
            this.visit(ast.receiver, context);
            this.visitAll(ast.args, context);
        };
        RecursiveAstVisitor.prototype.visitPrefixNot = function (ast, context) { this.visit(ast.expression, context); };
        RecursiveAstVisitor.prototype.visitNonNullAssert = function (ast, context) { this.visit(ast.expression, context); };
        RecursiveAstVisitor.prototype.visitPropertyRead = function (ast, context) { this.visit(ast.receiver, context); };
        RecursiveAstVisitor.prototype.visitPropertyWrite = function (ast, context) {
            this.visit(ast.receiver, context);
            this.visit(ast.value, context);
        };
        RecursiveAstVisitor.prototype.visitSafePropertyRead = function (ast, context) {
            this.visit(ast.receiver, context);
        };
        RecursiveAstVisitor.prototype.visitSafeMethodCall = function (ast, context) {
            this.visit(ast.receiver, context);
            this.visitAll(ast.args, context);
        };
        RecursiveAstVisitor.prototype.visitQuote = function (ast, context) { };
        // This is not part of the AstVisitor interface, just a helper method
        RecursiveAstVisitor.prototype.visitAll = function (asts, context) {
            var e_1, _a;
            try {
                for (var asts_1 = tslib_1.__values(asts), asts_1_1 = asts_1.next(); !asts_1_1.done; asts_1_1 = asts_1.next()) {
                    var ast = asts_1_1.value;
                    this.visit(ast, context);
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (asts_1_1 && !asts_1_1.done && (_a = asts_1.return)) _a.call(asts_1);
                }
                finally { if (e_1) throw e_1.error; }
            }
        };
        return RecursiveAstVisitor;
    }());
    exports.RecursiveAstVisitor = RecursiveAstVisitor;
    var AstTransformer = /** @class */ (function () {
        function AstTransformer() {
        }
        AstTransformer.prototype.visitImplicitReceiver = function (ast, context) { return ast; };
        AstTransformer.prototype.visitInterpolation = function (ast, context) {
            return new Interpolation(ast.span, ast.sourceSpan, ast.strings, this.visitAll(ast.expressions));
        };
        AstTransformer.prototype.visitLiteralPrimitive = function (ast, context) {
            return new LiteralPrimitive(ast.span, ast.sourceSpan, ast.value);
        };
        AstTransformer.prototype.visitPropertyRead = function (ast, context) {
            return new PropertyRead(ast.span, ast.sourceSpan, ast.receiver.visit(this), ast.name);
        };
        AstTransformer.prototype.visitPropertyWrite = function (ast, context) {
            return new PropertyWrite(ast.span, ast.sourceSpan, ast.receiver.visit(this), ast.name, ast.value.visit(this));
        };
        AstTransformer.prototype.visitSafePropertyRead = function (ast, context) {
            return new SafePropertyRead(ast.span, ast.sourceSpan, ast.receiver.visit(this), ast.name);
        };
        AstTransformer.prototype.visitMethodCall = function (ast, context) {
            return new MethodCall(ast.span, ast.sourceSpan, ast.receiver.visit(this), ast.name, this.visitAll(ast.args));
        };
        AstTransformer.prototype.visitSafeMethodCall = function (ast, context) {
            return new SafeMethodCall(ast.span, ast.sourceSpan, ast.receiver.visit(this), ast.name, this.visitAll(ast.args));
        };
        AstTransformer.prototype.visitFunctionCall = function (ast, context) {
            return new FunctionCall(ast.span, ast.sourceSpan, ast.target.visit(this), this.visitAll(ast.args));
        };
        AstTransformer.prototype.visitLiteralArray = function (ast, context) {
            return new LiteralArray(ast.span, ast.sourceSpan, this.visitAll(ast.expressions));
        };
        AstTransformer.prototype.visitLiteralMap = function (ast, context) {
            return new LiteralMap(ast.span, ast.sourceSpan, ast.keys, this.visitAll(ast.values));
        };
        AstTransformer.prototype.visitBinary = function (ast, context) {
            return new Binary(ast.span, ast.sourceSpan, ast.operation, ast.left.visit(this), ast.right.visit(this));
        };
        AstTransformer.prototype.visitPrefixNot = function (ast, context) {
            return new PrefixNot(ast.span, ast.sourceSpan, ast.expression.visit(this));
        };
        AstTransformer.prototype.visitNonNullAssert = function (ast, context) {
            return new NonNullAssert(ast.span, ast.sourceSpan, ast.expression.visit(this));
        };
        AstTransformer.prototype.visitConditional = function (ast, context) {
            return new Conditional(ast.span, ast.sourceSpan, ast.condition.visit(this), ast.trueExp.visit(this), ast.falseExp.visit(this));
        };
        AstTransformer.prototype.visitPipe = function (ast, context) {
            return new BindingPipe(ast.span, ast.sourceSpan, ast.exp.visit(this), ast.name, this.visitAll(ast.args), ast.nameSpan);
        };
        AstTransformer.prototype.visitKeyedRead = function (ast, context) {
            return new KeyedRead(ast.span, ast.sourceSpan, ast.obj.visit(this), ast.key.visit(this));
        };
        AstTransformer.prototype.visitKeyedWrite = function (ast, context) {
            return new KeyedWrite(ast.span, ast.sourceSpan, ast.obj.visit(this), ast.key.visit(this), ast.value.visit(this));
        };
        AstTransformer.prototype.visitAll = function (asts) {
            var res = [];
            for (var i = 0; i < asts.length; ++i) {
                res[i] = asts[i].visit(this);
            }
            return res;
        };
        AstTransformer.prototype.visitChain = function (ast, context) {
            return new Chain(ast.span, ast.sourceSpan, this.visitAll(ast.expressions));
        };
        AstTransformer.prototype.visitQuote = function (ast, context) {
            return new Quote(ast.span, ast.sourceSpan, ast.prefix, ast.uninterpretedExpression, ast.location);
        };
        return AstTransformer;
    }());
    exports.AstTransformer = AstTransformer;
    // A transformer that only creates new nodes if the transformer makes a change or
    // a change is made a child node.
    var AstMemoryEfficientTransformer = /** @class */ (function () {
        function AstMemoryEfficientTransformer() {
        }
        AstMemoryEfficientTransformer.prototype.visitImplicitReceiver = function (ast, context) { return ast; };
        AstMemoryEfficientTransformer.prototype.visitInterpolation = function (ast, context) {
            var expressions = this.visitAll(ast.expressions);
            if (expressions !== ast.expressions)
                return new Interpolation(ast.span, ast.sourceSpan, ast.strings, expressions);
            return ast;
        };
        AstMemoryEfficientTransformer.prototype.visitLiteralPrimitive = function (ast, context) { return ast; };
        AstMemoryEfficientTransformer.prototype.visitPropertyRead = function (ast, context) {
            var receiver = ast.receiver.visit(this);
            if (receiver !== ast.receiver) {
                return new PropertyRead(ast.span, ast.sourceSpan, receiver, ast.name);
            }
            return ast;
        };
        AstMemoryEfficientTransformer.prototype.visitPropertyWrite = function (ast, context) {
            var receiver = ast.receiver.visit(this);
            var value = ast.value.visit(this);
            if (receiver !== ast.receiver || value !== ast.value) {
                return new PropertyWrite(ast.span, ast.sourceSpan, receiver, ast.name, value);
            }
            return ast;
        };
        AstMemoryEfficientTransformer.prototype.visitSafePropertyRead = function (ast, context) {
            var receiver = ast.receiver.visit(this);
            if (receiver !== ast.receiver) {
                return new SafePropertyRead(ast.span, ast.sourceSpan, receiver, ast.name);
            }
            return ast;
        };
        AstMemoryEfficientTransformer.prototype.visitMethodCall = function (ast, context) {
            var receiver = ast.receiver.visit(this);
            var args = this.visitAll(ast.args);
            if (receiver !== ast.receiver || args !== ast.args) {
                return new MethodCall(ast.span, ast.sourceSpan, receiver, ast.name, args);
            }
            return ast;
        };
        AstMemoryEfficientTransformer.prototype.visitSafeMethodCall = function (ast, context) {
            var receiver = ast.receiver.visit(this);
            var args = this.visitAll(ast.args);
            if (receiver !== ast.receiver || args !== ast.args) {
                return new SafeMethodCall(ast.span, ast.sourceSpan, receiver, ast.name, args);
            }
            return ast;
        };
        AstMemoryEfficientTransformer.prototype.visitFunctionCall = function (ast, context) {
            var target = ast.target && ast.target.visit(this);
            var args = this.visitAll(ast.args);
            if (target !== ast.target || args !== ast.args) {
                return new FunctionCall(ast.span, ast.sourceSpan, target, args);
            }
            return ast;
        };
        AstMemoryEfficientTransformer.prototype.visitLiteralArray = function (ast, context) {
            var expressions = this.visitAll(ast.expressions);
            if (expressions !== ast.expressions) {
                return new LiteralArray(ast.span, ast.sourceSpan, expressions);
            }
            return ast;
        };
        AstMemoryEfficientTransformer.prototype.visitLiteralMap = function (ast, context) {
            var values = this.visitAll(ast.values);
            if (values !== ast.values) {
                return new LiteralMap(ast.span, ast.sourceSpan, ast.keys, values);
            }
            return ast;
        };
        AstMemoryEfficientTransformer.prototype.visitBinary = function (ast, context) {
            var left = ast.left.visit(this);
            var right = ast.right.visit(this);
            if (left !== ast.left || right !== ast.right) {
                return new Binary(ast.span, ast.sourceSpan, ast.operation, left, right);
            }
            return ast;
        };
        AstMemoryEfficientTransformer.prototype.visitPrefixNot = function (ast, context) {
            var expression = ast.expression.visit(this);
            if (expression !== ast.expression) {
                return new PrefixNot(ast.span, ast.sourceSpan, expression);
            }
            return ast;
        };
        AstMemoryEfficientTransformer.prototype.visitNonNullAssert = function (ast, context) {
            var expression = ast.expression.visit(this);
            if (expression !== ast.expression) {
                return new NonNullAssert(ast.span, ast.sourceSpan, expression);
            }
            return ast;
        };
        AstMemoryEfficientTransformer.prototype.visitConditional = function (ast, context) {
            var condition = ast.condition.visit(this);
            var trueExp = ast.trueExp.visit(this);
            var falseExp = ast.falseExp.visit(this);
            if (condition !== ast.condition || trueExp !== ast.trueExp || falseExp !== ast.falseExp) {
                return new Conditional(ast.span, ast.sourceSpan, condition, trueExp, falseExp);
            }
            return ast;
        };
        AstMemoryEfficientTransformer.prototype.visitPipe = function (ast, context) {
            var exp = ast.exp.visit(this);
            var args = this.visitAll(ast.args);
            if (exp !== ast.exp || args !== ast.args) {
                return new BindingPipe(ast.span, ast.sourceSpan, exp, ast.name, args, ast.nameSpan);
            }
            return ast;
        };
        AstMemoryEfficientTransformer.prototype.visitKeyedRead = function (ast, context) {
            var obj = ast.obj.visit(this);
            var key = ast.key.visit(this);
            if (obj !== ast.obj || key !== ast.key) {
                return new KeyedRead(ast.span, ast.sourceSpan, obj, key);
            }
            return ast;
        };
        AstMemoryEfficientTransformer.prototype.visitKeyedWrite = function (ast, context) {
            var obj = ast.obj.visit(this);
            var key = ast.key.visit(this);
            var value = ast.value.visit(this);
            if (obj !== ast.obj || key !== ast.key || value !== ast.value) {
                return new KeyedWrite(ast.span, ast.sourceSpan, obj, key, value);
            }
            return ast;
        };
        AstMemoryEfficientTransformer.prototype.visitAll = function (asts) {
            var res = [];
            var modified = false;
            for (var i = 0; i < asts.length; ++i) {
                var original = asts[i];
                var value = original.visit(this);
                res[i] = value;
                modified = modified || value !== original;
            }
            return modified ? res : asts;
        };
        AstMemoryEfficientTransformer.prototype.visitChain = function (ast, context) {
            var expressions = this.visitAll(ast.expressions);
            if (expressions !== ast.expressions) {
                return new Chain(ast.span, ast.sourceSpan, expressions);
            }
            return ast;
        };
        AstMemoryEfficientTransformer.prototype.visitQuote = function (ast, context) { return ast; };
        return AstMemoryEfficientTransformer;
    }());
    exports.AstMemoryEfficientTransformer = AstMemoryEfficientTransformer;
    // Bindings
    var ParsedProperty = /** @class */ (function () {
        function ParsedProperty(name, expression, type, sourceSpan, valueSpan) {
            this.name = name;
            this.expression = expression;
            this.type = type;
            this.sourceSpan = sourceSpan;
            this.valueSpan = valueSpan;
            this.isLiteral = this.type === ParsedPropertyType.LITERAL_ATTR;
            this.isAnimation = this.type === ParsedPropertyType.ANIMATION;
        }
        return ParsedProperty;
    }());
    exports.ParsedProperty = ParsedProperty;
    var ParsedPropertyType;
    (function (ParsedPropertyType) {
        ParsedPropertyType[ParsedPropertyType["DEFAULT"] = 0] = "DEFAULT";
        ParsedPropertyType[ParsedPropertyType["LITERAL_ATTR"] = 1] = "LITERAL_ATTR";
        ParsedPropertyType[ParsedPropertyType["ANIMATION"] = 2] = "ANIMATION";
    })(ParsedPropertyType = exports.ParsedPropertyType || (exports.ParsedPropertyType = {}));
    var ParsedEvent = /** @class */ (function () {
        // Regular events have a target
        // Animation events have a phase
        function ParsedEvent(name, targetOrPhase, type, handler, sourceSpan, handlerSpan) {
            this.name = name;
            this.targetOrPhase = targetOrPhase;
            this.type = type;
            this.handler = handler;
            this.sourceSpan = sourceSpan;
            this.handlerSpan = handlerSpan;
        }
        return ParsedEvent;
    }());
    exports.ParsedEvent = ParsedEvent;
    var ParsedVariable = /** @class */ (function () {
        function ParsedVariable(name, value, sourceSpan) {
            this.name = name;
            this.value = value;
            this.sourceSpan = sourceSpan;
        }
        return ParsedVariable;
    }());
    exports.ParsedVariable = ParsedVariable;
    var BoundElementProperty = /** @class */ (function () {
        function BoundElementProperty(name, type, securityContext, value, unit, sourceSpan, valueSpan) {
            this.name = name;
            this.type = type;
            this.securityContext = securityContext;
            this.value = value;
            this.unit = unit;
            this.sourceSpan = sourceSpan;
            this.valueSpan = valueSpan;
        }
        return BoundElementProperty;
    }());
    exports.BoundElementProperty = BoundElementProperty;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXN0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tcGlsZXIvc3JjL2V4cHJlc3Npb25fcGFyc2VyL2FzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7Ozs7Ozs7Ozs7Ozs7SUFLSDtRQUVFLHFCQUNJLE9BQWUsRUFBUyxLQUFhLEVBQVMsV0FBbUIsRUFBUyxXQUFpQjtZQUFuRSxVQUFLLEdBQUwsS0FBSyxDQUFRO1lBQVMsZ0JBQVcsR0FBWCxXQUFXLENBQVE7WUFBUyxnQkFBVyxHQUFYLFdBQVcsQ0FBTTtZQUM3RixJQUFJLENBQUMsT0FBTyxHQUFHLG1CQUFpQixPQUFPLFNBQUksV0FBVyxVQUFLLEtBQUssYUFBUSxXQUFhLENBQUM7UUFDeEYsQ0FBQztRQUNILGtCQUFDO0lBQUQsQ0FBQyxBQU5ELElBTUM7SUFOWSxrQ0FBVztJQVF4QjtRQUNFLG1CQUFtQixLQUFhLEVBQVMsR0FBVztZQUFqQyxVQUFLLEdBQUwsS0FBSyxDQUFRO1lBQVMsUUFBRyxHQUFILEdBQUcsQ0FBUTtRQUFHLENBQUM7UUFDeEQsOEJBQVUsR0FBVixVQUFXLGNBQXNCO1lBQy9CLE9BQU8sSUFBSSxrQkFBa0IsQ0FBQyxjQUFjLEdBQUcsSUFBSSxDQUFDLEtBQUssRUFBRSxjQUFjLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ3hGLENBQUM7UUFDSCxnQkFBQztJQUFELENBQUMsQUFMRCxJQUtDO0lBTFksOEJBQVM7SUFPdEI7UUFDRSxhQUNXLElBQWU7UUFDdEI7O1dBRUc7UUFDSSxVQUE4QjtZQUo5QixTQUFJLEdBQUosSUFBSSxDQUFXO1lBSWYsZUFBVSxHQUFWLFVBQVUsQ0FBb0I7UUFBRyxDQUFDO1FBQzdDLG1CQUFLLEdBQUwsVUFBTSxPQUFtQixFQUFFLE9BQW1CO1lBQW5CLHdCQUFBLEVBQUEsY0FBbUI7WUFBUyxPQUFPLElBQUksQ0FBQztRQUFDLENBQUM7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QUFLO1lBQVMsZUFBVSxHQUFWLFVBQVUsQ0FBaUI7WUFDaEQsZ0JBQVcsR0FBWCxXQUFXLENBQWlCO1FBQUcsQ0FBQztRQUM3QyxrQkFBQztJQUFELENBQUMsQUFQRCxJQU9DO0lBUFksa0NBQVc7SUFTeEI7UUFDRSx3QkFBbUIsSUFBWSxFQUFTLEtBQWEsRUFBUyxVQUEyQjtZQUF0RSxTQUFJLEdBQUosSUFBSSxDQUFRO1lBQVMsVUFBSyxHQUFMLEtBQUssQ0FBUTtZQUFTLGVBQVUsR0FBVixVQUFVLENBQWlCO1FBQUcsQ0FBQztRQUMvRixxQkFBQztJQUFELENBQUMsQUFGRCxJQUVDO0lBRlksd0NBQWM7SUFpQjNCO1FBQ0UsOEJBQ1csSUFBWSxFQUFTLElBQWlCLEVBQVMsZUFBZ0MsRUFDL0UsS0FBVSxFQUFTLElBQWlCLEVBQVMsVUFBMkIsRUFDeEUsU0FBMkI7WUFGM0IsU0FBSSxHQUFKLElBQUksQ0FBUTtZQUFTLFNBQUksR0FBSixJQUFJLENBQWE7WUFBUyxvQkFBZSxHQUFmLGVBQWUsQ0FBaUI7WUFDL0UsVUFBSyxHQUFMLEtBQUssQ0FBSztZQUFTLFNBQUksR0FBSixJQUFJLENBQWE7WUFBUyxlQUFVLEdBQVYsVUFBVSxDQUFpQjtZQUN4RSxjQUFTLEdBQVQsU0FBUyxDQUFrQjtRQUFHLENBQUM7UUFDNUMsMkJBQUM7SUFBRCxDQUFDLEFBTEQsSUFLQztJQUxZLG9EQUFvQiIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtTZWN1cml0eUNvbnRleHR9IGZyb20gJy4uL2NvcmUnO1xuaW1wb3J0IHtQYXJzZVNvdXJjZVNwYW59IGZyb20gJy4uL3BhcnNlX3V0aWwnO1xuXG5leHBvcnQgY2xhc3MgUGFyc2VyRXJyb3Ige1xuICBwdWJsaWMgbWVzc2FnZTogc3RyaW5nO1xuICBjb25zdHJ1Y3RvcihcbiAgICAgIG1lc3NhZ2U6IHN0cmluZywgcHVibGljIGlucHV0OiBzdHJpbmcsIHB1YmxpYyBlcnJMb2NhdGlvbjogc3RyaW5nLCBwdWJsaWMgY3R4TG9jYXRpb24/OiBhbnkpIHtcbiAgICB0aGlzLm1lc3NhZ2UgPSBgUGFyc2VyIEVycm9yOiAke21lc3NhZ2V9ICR7ZXJyTG9jYXRpb259IFske2lucHV0fV0gaW4gJHtjdHhMb2NhdGlvbn1gO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBQYXJzZVNwYW4ge1xuICBjb25zdHJ1Y3RvcihwdWJsaWMgc3RhcnQ6IG51bWJlciwgcHVibGljIGVuZDogbnVtYmVyKSB7fVxuICB0b0Fic29sdXRlKGFic29sdXRlT2Zmc2V0OiBudW1iZXIpOiBBYnNvbHV0ZVNvdXJjZVNwYW4ge1xuICAgIHJldHVybiBuZXcgQWJzb2x1dGVTb3VyY2VTcGFuKGFic29sdXRlT2Zmc2V0ICsgdGhpcy5zdGFydCwgYWJzb2x1dGVPZmZzZXQgKyB0aGlzLmVuZCk7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIEFTVCB7XG4gIGNvbnN0cnVjdG9yKFxuICAgICAgcHVibGljIHNwYW46IFBhcnNlU3BhbixcbiAgICAgIC8qKlxuICAgICAgICogQWJzb2x1dGUgbG9jYXRpb24gb2YgdGhlIGV4cHJlc3Npb24gQVNUIGluIGEgc291cmNlIGNvZGUgZmlsZS5cbiAgICAgICAqL1xuICAgICAgcHVibGljIHNvdXJjZVNwYW46IEFic29sdXRlU291cmNlU3Bhbikge31cbiAgdmlzaXQodmlzaXRvcjogQXN0VmlzaXRvciwgY29udGV4dDogYW55ID0gbnVsbCk6IGFueSB7IHJldHVybiBudWxsOyB9XG4gIHRvU3RyaW5nKCk6IHN0cmluZyB7IHJldHVybiAnQVNUJzsgfVxufVxuXG4vKipcbiAqIFJlcHJlc2VudHMgYSBxdW90ZWQgZXhwcmVzc2lvbiBvZiB0aGUgZm9ybTpcbiAqXG4gKiBxdW90ZSA9IHByZWZpeCBgOmAgdW5pbnRlcnByZXRlZEV4cHJlc3Npb25cbiAqIHByZWZpeCA9IGlkZW50aWZpZXJcbiAqIHVuaW50ZXJwcmV0ZWRFeHByZXNzaW9uID0gYXJiaXRyYXJ5IHN0cmluZ1xuICpcbiAqIEEgcXVvdGVkIGV4cHJlc3Npb24gaXMgbWVhbnQgdG8gYmUgcHJlLXByb2Nlc3NlZCBieSBhbiBBU1QgdHJhbnNmb3JtZXIgdGhhdFxuICogY29udmVydHMgaXQgaW50byBhbm90aGVyIEFTVCB0aGF0IG5vIGxvbmdlciBjb250YWlucyBxdW90ZWQgZXhwcmVzc2lvbnMuXG4gKiBJdCBpcyBtZWFudCB0byBhbGxvdyB0aGlyZC1wYXJ0eSBkZXZlbG9wZXJzIHRvIGV4dGVuZCBBbmd1bGFyIHRlbXBsYXRlXG4gKiBleHByZXNzaW9uIGxhbmd1YWdlLiBUaGUgYHVuaW50ZXJwcmV0ZWRFeHByZXNzaW9uYCBwYXJ0IG9mIHRoZSBxdW90ZSBpc1xuICogdGhlcmVmb3JlIG5vdCBpbnRlcnByZXRlZCBieSB0aGUgQW5ndWxhcidzIG93biBleHByZXNzaW9uIHBhcnNlci5cbiAqL1xuZXhwb3J0IGNsYXNzIFF1b3RlIGV4dGVuZHMgQVNUIHtcbiAgY29uc3RydWN0b3IoXG4gICAgICBzcGFuOiBQYXJzZVNwYW4sIHNvdXJjZVNwYW46IEFic29sdXRlU291cmNlU3BhbiwgcHVibGljIHByZWZpeDogc3RyaW5nLFxuICAgICAgcHVibGljIHVuaW50ZXJwcmV0ZWRFeHByZXNzaW9uOiBzdHJpbmcsIHB1YmxpYyBsb2NhdGlvbjogYW55KSB7XG4gICAgc3VwZXIoc3Bhbiwgc291cmNlU3Bhbik7XG4gIH1cbiAgdmlzaXQodmlzaXRvcjogQXN0VmlzaXRvciwgY29udGV4dDogYW55ID0gbnVsbCk6IGFueSB7IHJldHVybiB2aXNpdG9yLnZpc2l0UXVvdGUodGhpcywgY29udGV4dCk7IH1cbiAgdG9TdHJpbmcoKTogc3RyaW5nIHsgcmV0dXJuICdRdW90ZSc7IH1cbn1cblxuZXhwb3J0IGNsYXNzIEVtcHR5RXhwciBleHRlbmRzIEFTVCB7XG4gIHZpc2l0KHZpc2l0b3I6IEFzdFZpc2l0b3IsIGNvbnRleHQ6IGFueSA9IG51bGwpIHtcbiAgICAvLyBkbyBub3RoaW5nXG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIEltcGxpY2l0UmVjZWl2ZXIgZXh0ZW5kcyBBU1Qge1xuICB2aXNpdCh2aXNpdG9yOiBBc3RWaXNpdG9yLCBjb250ZXh0OiBhbnkgPSBudWxsKTogYW55IHtcbiAgICByZXR1cm4gdmlzaXRvci52aXNpdEltcGxpY2l0UmVjZWl2ZXIodGhpcywgY29udGV4dCk7XG4gIH1cbn1cblxuLyoqXG4gKiBNdWx0aXBsZSBleHByZXNzaW9ucyBzZXBhcmF0ZWQgYnkgYSBzZW1pY29sb24uXG4gKi9cbmV4cG9ydCBjbGFzcyBDaGFpbiBleHRlbmRzIEFTVCB7XG4gIGNvbnN0cnVjdG9yKHNwYW46IFBhcnNlU3Bhbiwgc291cmNlU3BhbjogQWJzb2x1dGVTb3VyY2VTcGFuLCBwdWJsaWMgZXhwcmVzc2lvbnM6IGFueVtdKSB7XG4gICAgc3VwZXIoc3Bhbiwgc291cmNlU3Bhbik7XG4gIH1cbiAgdmlzaXQodmlzaXRvcjogQXN0VmlzaXRvciwgY29udGV4dDogYW55ID0gbnVsbCk6IGFueSB7IHJldHVybiB2aXNpdG9yLnZpc2l0Q2hhaW4odGhpcywgY29udGV4dCk7IH1cbn1cblxuZXhwb3J0IGNsYXNzIENvbmRpdGlvbmFsIGV4dGVuZHMgQVNUIHtcbiAgY29uc3RydWN0b3IoXG4gICAgICBzcGFuOiBQYXJzZVNwYW4sIHNvdXJjZVNwYW46IEFic29sdXRlU291cmNlU3BhbiwgcHVibGljIGNvbmRpdGlvbjogQVNULCBwdWJsaWMgdHJ1ZUV4cDogQVNULFxuICAgICAgcHVibGljIGZhbHNlRXhwOiBBU1QpIHtcbiAgICBzdXBlcihzcGFuLCBzb3VyY2VTcGFuKTtcbiAgfVxuICB2aXNpdCh2aXNpdG9yOiBBc3RWaXNpdG9yLCBjb250ZXh0OiBhbnkgPSBudWxsKTogYW55IHtcbiAgICByZXR1cm4gdmlzaXRvci52aXNpdENvbmRpdGlvbmFsKHRoaXMsIGNvbnRleHQpO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBQcm9wZXJ0eVJlYWQgZXh0ZW5kcyBBU1Qge1xuICBjb25zdHJ1Y3RvcihcbiAgICAgIHNwYW46IFBhcnNlU3Bhbiwgc291cmNlU3BhbjogQWJzb2x1dGVTb3VyY2VTcGFuLCBwdWJsaWMgcmVjZWl2ZXI6IEFTVCwgcHVibGljIG5hbWU6IHN0cmluZykge1xuICAgIHN1cGVyKHNwYW4sIHNvdXJjZVNwYW4pO1xuICB9XG4gIHZpc2l0KHZpc2l0b3I6IEFzdFZpc2l0b3IsIGNvbnRleHQ6IGFueSA9IG51bGwpOiBhbnkge1xuICAgIHJldHVybiB2aXNpdG9yLnZpc2l0UHJvcGVydHlSZWFkKHRoaXMsIGNvbnRleHQpO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBQcm9wZXJ0eVdyaXRlIGV4dGVuZHMgQVNUIHtcbiAgY29uc3RydWN0b3IoXG4gICAgICBzcGFuOiBQYXJzZVNwYW4sIHNvdXJjZVNwYW46IEFic29sdXRlU291cmNlU3BhbiwgcHVibGljIHJlY2VpdmVyOiBBU1QsIHB1YmxpYyBuYW1lOiBzdHJpbmcsXG4gICAgICBwdWJsaWMgdmFsdWU6IEFTVCkge1xuICAgIHN1cGVyKHNwYW4sIHNvdXJjZVNwYW4pO1xuICB9XG4gIHZpc2l0KHZpc2l0b3I6IEFzdFZpc2l0b3IsIGNvbnRleHQ6IGFueSA9IG51bGwpOiBhbnkge1xuICAgIHJldHVybiB2aXNpdG9yLnZpc2l0UHJvcGVydHlXcml0ZSh0aGlzLCBjb250ZXh0KTtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgU2FmZVByb3BlcnR5UmVhZCBleHRlbmRzIEFTVCB7XG4gIGNvbnN0cnVjdG9yKFxuICAgICAgc3BhbjogUGFyc2VTcGFuLCBzb3VyY2VTcGFuOiBBYnNvbHV0ZVNvdXJjZVNwYW4sIHB1YmxpYyByZWNlaXZlcjogQVNULCBwdWJsaWMgbmFtZTogc3RyaW5nKSB7XG4gICAgc3VwZXIoc3Bhbiwgc291cmNlU3Bhbik7XG4gIH1cbiAgdmlzaXQodmlzaXRvcjogQXN0VmlzaXRvciwgY29udGV4dDogYW55ID0gbnVsbCk6IGFueSB7XG4gICAgcmV0dXJuIHZpc2l0b3IudmlzaXRTYWZlUHJvcGVydHlSZWFkKHRoaXMsIGNvbnRleHQpO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBLZXllZFJlYWQgZXh0ZW5kcyBBU1Qge1xuICBjb25zdHJ1Y3RvcihzcGFuOiBQYXJzZVNwYW4sIHNvdXJjZVNwYW46IEFic29sdXRlU291cmNlU3BhbiwgcHVibGljIG9iajogQVNULCBwdWJsaWMga2V5OiBBU1QpIHtcbiAgICBzdXBlcihzcGFuLCBzb3VyY2VTcGFuKTtcbiAgfVxuICB2aXNpdCh2aXNpdG9yOiBBc3RWaXNpdG9yLCBjb250ZXh0OiBhbnkgPSBudWxsKTogYW55IHtcbiAgICByZXR1cm4gdmlzaXRvci52aXNpdEtleWVkUmVhZCh0aGlzLCBjb250ZXh0KTtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgS2V5ZWRXcml0ZSBleHRlbmRzIEFTVCB7XG4gIGNvbnN0cnVjdG9yKFxuICAgICAgc3BhbjogUGFyc2VTcGFuLCBzb3VyY2VTcGFuOiBBYnNvbHV0ZVNvdXJjZVNwYW4sIHB1YmxpYyBvYmo6IEFTVCwgcHVibGljIGtleTogQVNULFxuICAgICAgcHVibGljIHZhbHVlOiBBU1QpIHtcbiAgICBzdXBlcihzcGFuLCBzb3VyY2VTcGFuKTtcbiAgfVxuICB2aXNpdCh2aXNpdG9yOiBBc3RWaXNpdG9yLCBjb250ZXh0OiBhbnkgPSBudWxsKTogYW55IHtcbiAgICByZXR1cm4gdmlzaXRvci52aXNpdEtleWVkV3JpdGUodGhpcywgY29udGV4dCk7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIEJpbmRpbmdQaXBlIGV4dGVuZHMgQVNUIHtcbiAgY29uc3RydWN0b3IoXG4gICAgICBzcGFuOiBQYXJzZVNwYW4sIHNvdXJjZVNwYW46IEFic29sdXRlU291cmNlU3BhbiwgcHVibGljIGV4cDogQVNULCBwdWJsaWMgbmFtZTogc3RyaW5nLFxuICAgICAgcHVibGljIGFyZ3M6IGFueVtdLCBwdWJsaWMgbmFtZVNwYW46IEFic29sdXRlU291cmNlU3Bhbikge1xuICAgIHN1cGVyKHNwYW4sIHNvdXJjZVNwYW4pO1xuICB9XG4gIHZpc2l0KHZpc2l0b3I6IEFzdFZpc2l0b3IsIGNvbnRleHQ6IGFueSA9IG51bGwpOiBhbnkgeyByZXR1cm4gdmlzaXRvci52aXNpdFBpcGUodGhpcywgY29udGV4dCk7IH1cbn1cblxuZXhwb3J0IGNsYXNzIExpdGVyYWxQcmltaXRpdmUgZXh0ZW5kcyBBU1Qge1xuICBjb25zdHJ1Y3RvcihzcGFuOiBQYXJzZVNwYW4sIHNvdXJjZVNwYW46IEFic29sdXRlU291cmNlU3BhbiwgcHVibGljIHZhbHVlOiBhbnkpIHtcbiAgICBzdXBlcihzcGFuLCBzb3VyY2VTcGFuKTtcbiAgfVxuICB2aXNpdCh2aXNpdG9yOiBBc3RWaXNpdG9yLCBjb250ZXh0OiBhbnkgPSBudWxsKTogYW55IHtcbiAgICByZXR1cm4gdmlzaXRvci52aXNpdExpdGVyYWxQcmltaXRpdmUodGhpcywgY29udGV4dCk7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIExpdGVyYWxBcnJheSBleHRlbmRzIEFTVCB7XG4gIGNvbnN0cnVjdG9yKHNwYW46IFBhcnNlU3Bhbiwgc291cmNlU3BhbjogQWJzb2x1dGVTb3VyY2VTcGFuLCBwdWJsaWMgZXhwcmVzc2lvbnM6IGFueVtdKSB7XG4gICAgc3VwZXIoc3Bhbiwgc291cmNlU3Bhbik7XG4gIH1cbiAgdmlzaXQodmlzaXRvcjogQXN0VmlzaXRvciwgY29udGV4dDogYW55ID0gbnVsbCk6IGFueSB7XG4gICAgcmV0dXJuIHZpc2l0b3IudmlzaXRMaXRlcmFsQXJyYXkodGhpcywgY29udGV4dCk7XG4gIH1cbn1cblxuZXhwb3J0IHR5cGUgTGl0ZXJhbE1hcEtleSA9IHtcbiAga2V5OiBzdHJpbmc7IHF1b3RlZDogYm9vbGVhbjtcbn07XG5cbmV4cG9ydCBjbGFzcyBMaXRlcmFsTWFwIGV4dGVuZHMgQVNUIHtcbiAgY29uc3RydWN0b3IoXG4gICAgICBzcGFuOiBQYXJzZVNwYW4sIHNvdXJjZVNwYW46IEFic29sdXRlU291cmNlU3BhbiwgcHVibGljIGtleXM6IExpdGVyYWxNYXBLZXlbXSxcbiAgICAgIHB1YmxpYyB2YWx1ZXM6IGFueVtdKSB7XG4gICAgc3VwZXIoc3Bhbiwgc291cmNlU3Bhbik7XG4gIH1cbiAgdmlzaXQodmlzaXRvcjogQXN0VmlzaXRvciwgY29udGV4dDogYW55ID0gbnVsbCk6IGFueSB7XG4gICAgcmV0dXJuIHZpc2l0b3IudmlzaXRMaXRlcmFsTWFwKHRoaXMsIGNvbnRleHQpO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBJbnRlcnBvbGF0aW9uIGV4dGVuZHMgQVNUIHtcbiAgY29uc3RydWN0b3IoXG4gICAgICBzcGFuOiBQYXJzZVNwYW4sIHNvdXJjZVNwYW46IEFic29sdXRlU291cmNlU3BhbiwgcHVibGljIHN0cmluZ3M6IGFueVtdLFxuICAgICAgcHVibGljIGV4cHJlc3Npb25zOiBhbnlbXSkge1xuICAgIHN1cGVyKHNwYW4sIHNvdXJjZVNwYW4pO1xuICB9XG4gIHZpc2l0KHZpc2l0b3I6IEFzdFZpc2l0b3IsIGNvbnRleHQ6IGFueSA9IG51bGwpOiBhbnkge1xuICAgIHJldHVybiB2aXNpdG9yLnZpc2l0SW50ZXJwb2xhdGlvbih0aGlzLCBjb250ZXh0KTtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgQmluYXJ5IGV4dGVuZHMgQVNUIHtcbiAgY29uc3RydWN0b3IoXG4gICAgICBzcGFuOiBQYXJzZVNwYW4sIHNvdXJjZVNwYW46IEFic29sdXRlU291cmNlU3BhbiwgcHVibGljIG9wZXJhdGlvbjogc3RyaW5nLCBwdWJsaWMgbGVmdDogQVNULFxuICAgICAgcHVibGljIHJpZ2h0OiBBU1QpIHtcbiAgICBzdXBlcihzcGFuLCBzb3VyY2VTcGFuKTtcbiAgfVxuICB2aXNpdCh2aXNpdG9yOiBBc3RWaXNpdG9yLCBjb250ZXh0OiBhbnkgPSBudWxsKTogYW55IHtcbiAgICByZXR1cm4gdmlzaXRvci52aXNpdEJpbmFyeSh0aGlzLCBjb250ZXh0KTtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgUHJlZml4Tm90IGV4dGVuZHMgQVNUIHtcbiAgY29uc3RydWN0b3Ioc3BhbjogUGFyc2VTcGFuLCBzb3VyY2VTcGFuOiBBYnNvbHV0ZVNvdXJjZVNwYW4sIHB1YmxpYyBleHByZXNzaW9uOiBBU1QpIHtcbiAgICBzdXBlcihzcGFuLCBzb3VyY2VTcGFuKTtcbiAgfVxuICB2aXNpdCh2aXNpdG9yOiBBc3RWaXNpdG9yLCBjb250ZXh0OiBhbnkgPSBudWxsKTogYW55IHtcbiAgICByZXR1cm4gdmlzaXRvci52aXNpdFByZWZpeE5vdCh0aGlzLCBjb250ZXh0KTtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgTm9uTnVsbEFzc2VydCBleHRlbmRzIEFTVCB7XG4gIGNvbnN0cnVjdG9yKHNwYW46IFBhcnNlU3Bhbiwgc291cmNlU3BhbjogQWJzb2x1dGVTb3VyY2VTcGFuLCBwdWJsaWMgZXhwcmVzc2lvbjogQVNUKSB7XG4gICAgc3VwZXIoc3Bhbiwgc291cmNlU3Bhbik7XG4gIH1cbiAgdmlzaXQodmlzaXRvcjogQXN0VmlzaXRvciwgY29udGV4dDogYW55ID0gbnVsbCk6IGFueSB7XG4gICAgcmV0dXJuIHZpc2l0b3IudmlzaXROb25OdWxsQXNzZXJ0KHRoaXMsIGNvbnRleHQpO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBNZXRob2RDYWxsIGV4dGVuZHMgQVNUIHtcbiAgY29uc3RydWN0b3IoXG4gICAgICBzcGFuOiBQYXJzZVNwYW4sIHNvdXJjZVNwYW46IEFic29sdXRlU291cmNlU3BhbiwgcHVibGljIHJlY2VpdmVyOiBBU1QsIHB1YmxpYyBuYW1lOiBzdHJpbmcsXG4gICAgICBwdWJsaWMgYXJnczogYW55W10pIHtcbiAgICBzdXBlcihzcGFuLCBzb3VyY2VTcGFuKTtcbiAgfVxuICB2aXNpdCh2aXNpdG9yOiBBc3RWaXNpdG9yLCBjb250ZXh0OiBhbnkgPSBudWxsKTogYW55IHtcbiAgICByZXR1cm4gdmlzaXRvci52aXNpdE1ldGhvZENhbGwodGhpcywgY29udGV4dCk7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIFNhZmVNZXRob2RDYWxsIGV4dGVuZHMgQVNUIHtcbiAgY29uc3RydWN0b3IoXG4gICAgICBzcGFuOiBQYXJzZVNwYW4sIHNvdXJjZVNwYW46IEFic29sdXRlU291cmNlU3BhbiwgcHVibGljIHJlY2VpdmVyOiBBU1QsIHB1YmxpYyBuYW1lOiBzdHJpbmcsXG4gICAgICBwdWJsaWMgYXJnczogYW55W10pIHtcbiAgICBzdXBlcihzcGFuLCBzb3VyY2VTcGFuKTtcbiAgfVxuICB2aXNpdCh2aXNpdG9yOiBBc3RWaXNpdG9yLCBjb250ZXh0OiBhbnkgPSBudWxsKTogYW55IHtcbiAgICByZXR1cm4gdmlzaXRvci52aXNpdFNhZmVNZXRob2RDYWxsKHRoaXMsIGNvbnRleHQpO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBGdW5jdGlvbkNhbGwgZXh0ZW5kcyBBU1Qge1xuICBjb25zdHJ1Y3RvcihcbiAgICAgIHNwYW46IFBhcnNlU3Bhbiwgc291cmNlU3BhbjogQWJzb2x1dGVTb3VyY2VTcGFuLCBwdWJsaWMgdGFyZ2V0OiBBU1R8bnVsbCxcbiAgICAgIHB1YmxpYyBhcmdzOiBhbnlbXSkge1xuICAgIHN1cGVyKHNwYW4sIHNvdXJjZVNwYW4pO1xuICB9XG4gIHZpc2l0KHZpc2l0b3I6IEFzdFZpc2l0b3IsIGNvbnRleHQ6IGFueSA9IG51bGwpOiBhbnkge1xuICAgIHJldHVybiB2aXNpdG9yLnZpc2l0RnVuY3Rpb25DYWxsKHRoaXMsIGNvbnRleHQpO1xuICB9XG59XG5cbi8qKlxuICogUmVjb3JkcyB0aGUgYWJzb2x1dGUgcG9zaXRpb24gb2YgYSB0ZXh0IHNwYW4gaW4gYSBzb3VyY2UgZmlsZSwgd2hlcmUgYHN0YXJ0YCBhbmQgYGVuZGAgYXJlIHRoZVxuICogc3RhcnRpbmcgYW5kIGVuZGluZyBieXRlIG9mZnNldHMsIHJlc3BlY3RpdmVseSwgb2YgdGhlIHRleHQgc3BhbiBpbiBhIHNvdXJjZSBmaWxlLlxuICovXG5leHBvcnQgY2xhc3MgQWJzb2x1dGVTb3VyY2VTcGFuIHtcbiAgY29uc3RydWN0b3IocHVibGljIHJlYWRvbmx5IHN0YXJ0OiBudW1iZXIsIHB1YmxpYyByZWFkb25seSBlbmQ6IG51bWJlcikge31cbn1cblxuZXhwb3J0IGNsYXNzIEFTVFdpdGhTb3VyY2UgZXh0ZW5kcyBBU1Qge1xuICBjb25zdHJ1Y3RvcihcbiAgICAgIHB1YmxpYyBhc3Q6IEFTVCwgcHVibGljIHNvdXJjZTogc3RyaW5nfG51bGwsIHB1YmxpYyBsb2NhdGlvbjogc3RyaW5nLCBhYnNvbHV0ZU9mZnNldDogbnVtYmVyLFxuICAgICAgcHVibGljIGVycm9yczogUGFyc2VyRXJyb3JbXSkge1xuICAgIHN1cGVyKFxuICAgICAgICBuZXcgUGFyc2VTcGFuKDAsIHNvdXJjZSA9PT0gbnVsbCA/IDAgOiBzb3VyY2UubGVuZ3RoKSxcbiAgICAgICAgbmV3IEFic29sdXRlU291cmNlU3BhbihcbiAgICAgICAgICAgIGFic29sdXRlT2Zmc2V0LCBzb3VyY2UgPT09IG51bGwgPyBhYnNvbHV0ZU9mZnNldCA6IGFic29sdXRlT2Zmc2V0ICsgc291cmNlLmxlbmd0aCkpO1xuICB9XG4gIHZpc2l0KHZpc2l0b3I6IEFzdFZpc2l0b3IsIGNvbnRleHQ6IGFueSA9IG51bGwpOiBhbnkge1xuICAgIGlmICh2aXNpdG9yLnZpc2l0QVNUV2l0aFNvdXJjZSkge1xuICAgICAgcmV0dXJuIHZpc2l0b3IudmlzaXRBU1RXaXRoU291cmNlKHRoaXMsIGNvbnRleHQpO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5hc3QudmlzaXQodmlzaXRvciwgY29udGV4dCk7XG4gIH1cbiAgdG9TdHJpbmcoKTogc3RyaW5nIHsgcmV0dXJuIGAke3RoaXMuc291cmNlfSBpbiAke3RoaXMubG9jYXRpb259YDsgfVxufVxuXG5leHBvcnQgY2xhc3MgVGVtcGxhdGVCaW5kaW5nIHtcbiAgY29uc3RydWN0b3IoXG4gICAgICBwdWJsaWMgc3BhbjogUGFyc2VTcGFuLCBzb3VyY2VTcGFuOiBBYnNvbHV0ZVNvdXJjZVNwYW4sIHB1YmxpYyBrZXk6IHN0cmluZyxcbiAgICAgIHB1YmxpYyBrZXlJc1ZhcjogYm9vbGVhbiwgcHVibGljIG5hbWU6IHN0cmluZywgcHVibGljIGV4cHJlc3Npb246IEFTVFdpdGhTb3VyY2V8bnVsbCkge31cbn1cblxuZXhwb3J0IGludGVyZmFjZSBBc3RWaXNpdG9yIHtcbiAgdmlzaXRCaW5hcnkoYXN0OiBCaW5hcnksIGNvbnRleHQ6IGFueSk6IGFueTtcbiAgdmlzaXRDaGFpbihhc3Q6IENoYWluLCBjb250ZXh0OiBhbnkpOiBhbnk7XG4gIHZpc2l0Q29uZGl0aW9uYWwoYXN0OiBDb25kaXRpb25hbCwgY29udGV4dDogYW55KTogYW55O1xuICB2aXNpdEZ1bmN0aW9uQ2FsbChhc3Q6IEZ1bmN0aW9uQ2FsbCwgY29udGV4dDogYW55KTogYW55O1xuICB2aXNpdEltcGxpY2l0UmVjZWl2ZXIoYXN0OiBJbXBsaWNpdFJlY2VpdmVyLCBjb250ZXh0OiBhbnkpOiBhbnk7XG4gIHZpc2l0SW50ZXJwb2xhdGlvbihhc3Q6IEludGVycG9sYXRpb24sIGNvbnRleHQ6IGFueSk6IGFueTtcbiAgdmlzaXRLZXllZFJlYWQoYXN0OiBLZXllZFJlYWQsIGNvbnRleHQ6IGFueSk6IGFueTtcbiAgdmlzaXRLZXllZFdyaXRlKGFzdDogS2V5ZWRXcml0ZSwgY29udGV4dDogYW55KTogYW55O1xuICB2aXNpdExpdGVyYWxBcnJheShhc3Q6IExpdGVyYWxBcnJheSwgY29udGV4dDogYW55KTogYW55O1xuICB2aXNpdExpdGVyYWxNYXAoYXN0OiBMaXRlcmFsTWFwLCBjb250ZXh0OiBhbnkpOiBhbnk7XG4gIHZpc2l0TGl0ZXJhbFByaW1pdGl2ZShhc3Q6IExpdGVyYWxQcmltaXRpdmUsIGNvbnRleHQ6IGFueSk6IGFueTtcbiAgdmlzaXRNZXRob2RDYWxsKGFzdDogTWV0aG9kQ2FsbCwgY29udGV4dDogYW55KTogYW55O1xuICB2aXNpdFBpcGUoYXN0OiBCaW5kaW5nUGlwZSwgY29udGV4dDogYW55KTogYW55O1xuICB2aXNpdFByZWZpeE5vdChhc3Q6IFByZWZpeE5vdCwgY29udGV4dDogYW55KTogYW55O1xuICB2aXNpdE5vbk51bGxBc3NlcnQoYXN0OiBOb25OdWxsQXNzZXJ0LCBjb250ZXh0OiBhbnkpOiBhbnk7XG4gIHZpc2l0UHJvcGVydHlSZWFkKGFzdDogUHJvcGVydHlSZWFkLCBjb250ZXh0OiBhbnkpOiBhbnk7XG4gIHZpc2l0UHJvcGVydHlXcml0ZShhc3Q6IFByb3BlcnR5V3JpdGUsIGNvbnRleHQ6IGFueSk6IGFueTtcbiAgdmlzaXRRdW90ZShhc3Q6IFF1b3RlLCBjb250ZXh0OiBhbnkpOiBhbnk7XG4gIHZpc2l0U2FmZU1ldGhvZENhbGwoYXN0OiBTYWZlTWV0aG9kQ2FsbCwgY29udGV4dDogYW55KTogYW55O1xuICB2aXNpdFNhZmVQcm9wZXJ0eVJlYWQoYXN0OiBTYWZlUHJvcGVydHlSZWFkLCBjb250ZXh0OiBhbnkpOiBhbnk7XG4gIHZpc2l0QVNUV2l0aFNvdXJjZT8oYXN0OiBBU1RXaXRoU291cmNlLCBjb250ZXh0OiBhbnkpOiBhbnk7XG4gIC8qKlxuICAgKiBUaGlzIGZ1bmN0aW9uIGlzIG9wdGlvbmFsbHkgZGVmaW5lZCB0byBhbGxvdyBjbGFzc2VzIHRoYXQgaW1wbGVtZW50IHRoaXNcbiAgICogaW50ZXJmYWNlIHRvIHNlbGVjdGl2ZWx5IGRlY2lkZSBpZiB0aGUgc3BlY2lmaWVkIGBhc3RgIHNob3VsZCBiZSB2aXNpdGVkLlxuICAgKiBAcGFyYW0gYXN0IG5vZGUgdG8gdmlzaXRcbiAgICogQHBhcmFtIGNvbnRleHQgY29udGV4dCB0aGF0IGdldHMgcGFzc2VkIHRvIHRoZSBub2RlIGFuZCBhbGwgaXRzIGNoaWxkcmVuXG4gICAqL1xuICB2aXNpdD8oYXN0OiBBU1QsIGNvbnRleHQ/OiBhbnkpOiBhbnk7XG59XG5cbmV4cG9ydCBjbGFzcyBSZWN1cnNpdmVBc3RWaXNpdG9yIGltcGxlbWVudHMgQXN0VmlzaXRvciB7XG4gIHZpc2l0KGFzdDogQVNULCBjb250ZXh0PzogYW55KTogYW55IHtcbiAgICAvLyBUaGUgZGVmYXVsdCBpbXBsZW1lbnRhdGlvbiBqdXN0IHZpc2l0cyBldmVyeSBub2RlLlxuICAgIC8vIENsYXNzZXMgdGhhdCBleHRlbmQgUmVjdXJzaXZlQXN0VmlzaXRvciBzaG91bGQgb3ZlcnJpZGUgdGhpcyBmdW5jdGlvblxuICAgIC8vIHRvIHNlbGVjdGl2ZWx5IHZpc2l0IHRoZSBzcGVjaWZpZWQgbm9kZS5cbiAgICBhc3QudmlzaXQodGhpcywgY29udGV4dCk7XG4gIH1cbiAgdmlzaXRCaW5hcnkoYXN0OiBCaW5hcnksIGNvbnRleHQ6IGFueSk6IGFueSB7XG4gICAgdGhpcy52aXNpdChhc3QubGVmdCwgY29udGV4dCk7XG4gICAgdGhpcy52aXNpdChhc3QucmlnaHQsIGNvbnRleHQpO1xuICB9XG4gIHZpc2l0Q2hhaW4oYXN0OiBDaGFpbiwgY29udGV4dDogYW55KTogYW55IHsgdGhpcy52aXNpdEFsbChhc3QuZXhwcmVzc2lvbnMsIGNvbnRleHQpOyB9XG4gIHZpc2l0Q29uZGl0aW9uYWwoYXN0OiBDb25kaXRpb25hbCwgY29udGV4dDogYW55KTogYW55IHtcbiAgICB0aGlzLnZpc2l0KGFzdC5jb25kaXRpb24sIGNvbnRleHQpO1xuICAgIHRoaXMudmlzaXQoYXN0LnRydWVFeHAsIGNvbnRleHQpO1xuICAgIHRoaXMudmlzaXQoYXN0LmZhbHNlRXhwLCBjb250ZXh0KTtcbiAgfVxuICB2aXNpdFBpcGUoYXN0OiBCaW5kaW5nUGlwZSwgY29udGV4dDogYW55KTogYW55IHtcbiAgICB0aGlzLnZpc2l0KGFzdC5leHAsIGNvbnRleHQpO1xuICAgIHRoaXMudmlzaXRBbGwoYXN0LmFyZ3MsIGNvbnRleHQpO1xuICB9XG4gIHZpc2l0RnVuY3Rpb25DYWxsKGFzdDogRnVuY3Rpb25DYWxsLCBjb250ZXh0OiBhbnkpOiBhbnkge1xuICAgIGlmIChhc3QudGFyZ2V0KSB7XG4gICAgICB0aGlzLnZpc2l0KGFzdC50YXJnZXQsIGNvbnRleHQpO1xuICAgIH1cbiAgICB0aGlzLnZpc2l0QWxsKGFzdC5hcmdzLCBjb250ZXh0KTtcbiAgfVxuICB2aXNpdEltcGxpY2l0UmVjZWl2ZXIoYXN0OiBJbXBsaWNpdFJlY2VpdmVyLCBjb250ZXh0OiBhbnkpOiBhbnkge31cbiAgdmlzaXRJbnRlcnBvbGF0aW9uKGFzdDogSW50ZXJwb2xhdGlvbiwgY29udGV4dDogYW55KTogYW55IHtcbiAgICB0aGlzLnZpc2l0QWxsKGFzdC5leHByZXNzaW9ucywgY29udGV4dCk7XG4gIH1cbiAgdmlzaXRLZXllZFJlYWQoYXN0OiBLZXllZFJlYWQsIGNvbnRleHQ6IGFueSk6IGFueSB7XG4gICAgdGhpcy52aXNpdChhc3Qub2JqLCBjb250ZXh0KTtcbiAgICB0aGlzLnZpc2l0KGFzdC5rZXksIGNvbnRleHQpO1xuICB9XG4gIHZpc2l0S2V5ZWRXcml0ZShhc3Q6IEtleWVkV3JpdGUsIGNvbnRleHQ6IGFueSk6IGFueSB7XG4gICAgdGhpcy52aXNpdChhc3Qub2JqLCBjb250ZXh0KTtcbiAgICB0aGlzLnZpc2l0KGFzdC5rZXksIGNvbnRleHQpO1xuICAgIHRoaXMudmlzaXQoYXN0LnZhbHVlLCBjb250ZXh0KTtcbiAgfVxuICB2aXNpdExpdGVyYWxBcnJheShhc3Q6IExpdGVyYWxBcnJheSwgY29udGV4dDogYW55KTogYW55IHtcbiAgICB0aGlzLnZpc2l0QWxsKGFzdC5leHByZXNzaW9ucywgY29udGV4dCk7XG4gIH1cbiAgdmlzaXRMaXRlcmFsTWFwKGFzdDogTGl0ZXJhbE1hcCwgY29udGV4dDogYW55KTogYW55IHsgdGhpcy52aXNpdEFsbChhc3QudmFsdWVzLCBjb250ZXh0KTsgfVxuICB2aXNpdExpdGVyYWxQcmltaXRpdmUoYXN0OiBMaXRlcmFsUHJpbWl0aXZlLCBjb250ZXh0OiBhbnkpOiBhbnkge31cbiAgdmlzaXRNZXRob2RDYWxsKGFzdDogTWV0aG9kQ2FsbCwgY29udGV4dDogYW55KTogYW55IHtcbiAgICB0aGlzLnZpc2l0KGFzdC5yZWNlaXZlciwgY29udGV4dCk7XG4gICAgdGhpcy52aXNpdEFsbChhc3QuYXJncywgY29udGV4dCk7XG4gIH1cbiAgdmlzaXRQcmVmaXhOb3QoYXN0OiBQcmVmaXhOb3QsIGNvbnRleHQ6IGFueSk6IGFueSB7IHRoaXMudmlzaXQoYXN0LmV4cHJlc3Npb24sIGNvbnRleHQpOyB9XG4gIHZpc2l0Tm9uTnVsbEFzc2VydChhc3Q6IE5vbk51bGxBc3NlcnQsIGNvbnRleHQ6IGFueSk6IGFueSB7IHRoaXMudmlzaXQoYXN0LmV4cHJlc3Npb24sIGNvbnRleHQpOyB9XG4gIHZpc2l0UHJvcGVydHlSZWFkKGFzdDogUHJvcGVydHlSZWFkLCBjb250ZXh0OiBhbnkpOiBhbnkgeyB0aGlzLnZpc2l0KGFzdC5yZWNlaXZlciwgY29udGV4dCk7IH1cbiAgdmlzaXRQcm9wZXJ0eVdyaXRlKGFzdDogUHJvcGVydHlXcml0ZSwgY29udGV4dDogYW55KTogYW55IHtcbiAgICB0aGlzLnZpc2l0KGFzdC5yZWNlaXZlciwgY29udGV4dCk7XG4gICAgdGhpcy52aXNpdChhc3QudmFsdWUsIGNvbnRleHQpO1xuICB9XG4gIHZpc2l0U2FmZVByb3BlcnR5UmVhZChhc3Q6IFNhZmVQcm9wZXJ0eVJlYWQsIGNvbnRleHQ6IGFueSk6IGFueSB7XG4gICAgdGhpcy52aXNpdChhc3QucmVjZWl2ZXIsIGNvbnRleHQpO1xuICB9XG4gIHZpc2l0U2FmZU1ldGhvZENhbGwoYXN0OiBTYWZlTWV0aG9kQ2FsbCwgY29udGV4dDogYW55KTogYW55IHtcbiAgICB0aGlzLnZpc2l0KGFzdC5yZWNlaXZlciwgY29udGV4dCk7XG4gICAgdGhpcy52aXNpdEFsbChhc3QuYXJncywgY29udGV4dCk7XG4gIH1cbiAgdmlzaXRRdW90ZShhc3Q6IFF1b3RlLCBjb250ZXh0OiBhbnkpOiBhbnkge31cbiAgLy8gVGhpcyBpcyBub3QgcGFydCBvZiB0aGUgQXN0VmlzaXRvciBpbnRlcmZhY2UsIGp1c3QgYSBoZWxwZXIgbWV0aG9kXG4gIHZpc2l0QWxsKGFzdHM6IEFTVFtdLCBjb250ZXh0OiBhbnkpOiBhbnkge1xuICAgIGZvciAoY29uc3QgYXN0IG9mIGFzdHMpIHtcbiAgICAgIHRoaXMudmlzaXQoYXN0LCBjb250ZXh0KTtcbiAgICB9XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIEFzdFRyYW5zZm9ybWVyIGltcGxlbWVudHMgQXN0VmlzaXRvciB7XG4gIHZpc2l0SW1wbGljaXRSZWNlaXZlcihhc3Q6IEltcGxpY2l0UmVjZWl2ZXIsIGNvbnRleHQ6IGFueSk6IEFTVCB7IHJldHVybiBhc3Q7IH1cblxuICB2aXNpdEludGVycG9sYXRpb24oYXN0OiBJbnRlcnBvbGF0aW9uLCBjb250ZXh0OiBhbnkpOiBBU1Qge1xuICAgIHJldHVybiBuZXcgSW50ZXJwb2xhdGlvbihhc3Quc3BhbiwgYXN0LnNvdXJjZVNwYW4sIGFzdC5zdHJpbmdzLCB0aGlzLnZpc2l0QWxsKGFzdC5leHByZXNzaW9ucykpO1xuICB9XG5cbiAgdmlzaXRMaXRlcmFsUHJpbWl0aXZlKGFzdDogTGl0ZXJhbFByaW1pdGl2ZSwgY29udGV4dDogYW55KTogQVNUIHtcbiAgICByZXR1cm4gbmV3IExpdGVyYWxQcmltaXRpdmUoYXN0LnNwYW4sIGFzdC5zb3VyY2VTcGFuLCBhc3QudmFsdWUpO1xuICB9XG5cbiAgdmlzaXRQcm9wZXJ0eVJlYWQoYXN0OiBQcm9wZXJ0eVJlYWQsIGNvbnRleHQ6IGFueSk6IEFTVCB7XG4gICAgcmV0dXJuIG5ldyBQcm9wZXJ0eVJlYWQoYXN0LnNwYW4sIGFzdC5zb3VyY2VTcGFuLCBhc3QucmVjZWl2ZXIudmlzaXQodGhpcyksIGFzdC5uYW1lKTtcbiAgfVxuXG4gIHZpc2l0UHJvcGVydHlXcml0ZShhc3Q6IFByb3BlcnR5V3JpdGUsIGNvbnRleHQ6IGFueSk6IEFTVCB7XG4gICAgcmV0dXJuIG5ldyBQcm9wZXJ0eVdyaXRlKFxuICAgICAgICBhc3Quc3BhbiwgYXN0LnNvdXJjZVNwYW4sIGFzdC5yZWNlaXZlci52aXNpdCh0aGlzKSwgYXN0Lm5hbWUsIGFzdC52YWx1ZS52aXNpdCh0aGlzKSk7XG4gIH1cblxuICB2aXNpdFNhZmVQcm9wZXJ0eVJlYWQoYXN0OiBTYWZlUHJvcGVydHlSZWFkLCBjb250ZXh0OiBhbnkpOiBBU1Qge1xuICAgIHJldHVybiBuZXcgU2FmZVByb3BlcnR5UmVhZChhc3Quc3BhbiwgYXN0LnNvdXJjZVNwYW4sIGFzdC5yZWNlaXZlci52aXNpdCh0aGlzKSwgYXN0Lm5hbWUpO1xuICB9XG5cbiAgdmlzaXRNZXRob2RDYWxsKGFzdDogTWV0aG9kQ2FsbCwgY29udGV4dDogYW55KTogQVNUIHtcbiAgICByZXR1cm4gbmV3IE1ldGhvZENhbGwoXG4gICAgICAgIGFzdC5zcGFuLCBhc3Quc291cmNlU3BhbiwgYXN0LnJlY2VpdmVyLnZpc2l0KHRoaXMpLCBhc3QubmFtZSwgdGhpcy52aXNpdEFsbChhc3QuYXJncykpO1xuICB9XG5cbiAgdmlzaXRTYWZlTWV0aG9kQ2FsbChhc3Q6IFNhZmVNZXRob2RDYWxsLCBjb250ZXh0OiBhbnkpOiBBU1Qge1xuICAgIHJldHVybiBuZXcgU2FmZU1ldGhvZENhbGwoXG4gICAgICAgIGFzdC5zcGFuLCBhc3Quc291cmNlU3BhbiwgYXN0LnJlY2VpdmVyLnZpc2l0KHRoaXMpLCBhc3QubmFtZSwgdGhpcy52aXNpdEFsbChhc3QuYXJncykpO1xuICB9XG5cbiAgdmlzaXRGdW5jdGlvbkNhbGwoYXN0OiBGdW5jdGlvbkNhbGwsIGNvbnRleHQ6IGFueSk6IEFTVCB7XG4gICAgcmV0dXJuIG5ldyBGdW5jdGlvbkNhbGwoXG4gICAgICAgIGFzdC5zcGFuLCBhc3Quc291cmNlU3BhbiwgYXN0LnRhcmdldCAhLnZpc2l0KHRoaXMpLCB0aGlzLnZpc2l0QWxsKGFzdC5hcmdzKSk7XG4gIH1cblxuICB2aXNpdExpdGVyYWxBcnJheShhc3Q6IExpdGVyYWxBcnJheSwgY29udGV4dDogYW55KTogQVNUIHtcbiAgICByZXR1cm4gbmV3IExpdGVyYWxBcnJheShhc3Quc3BhbiwgYXN0LnNvdXJjZVNwYW4sIHRoaXMudmlzaXRBbGwoYXN0LmV4cHJlc3Npb25zKSk7XG4gIH1cblxuICB2aXNpdExpdGVyYWxNYXAoYXN0OiBMaXRlcmFsTWFwLCBjb250ZXh0OiBhbnkpOiBBU1Qge1xuICAgIHJldHVybiBuZXcgTGl0ZXJhbE1hcChhc3Quc3BhbiwgYXN0LnNvdXJjZVNwYW4sIGFzdC5rZXlzLCB0aGlzLnZpc2l0QWxsKGFzdC52YWx1ZXMpKTtcbiAgfVxuXG4gIHZpc2l0QmluYXJ5KGFzdDogQmluYXJ5LCBjb250ZXh0OiBhbnkpOiBBU1Qge1xuICAgIHJldHVybiBuZXcgQmluYXJ5KFxuICAgICAgICBhc3Quc3BhbiwgYXN0LnNvdXJjZVNwYW4sIGFzdC5vcGVyYXRpb24sIGFzdC5sZWZ0LnZpc2l0KHRoaXMpLCBhc3QucmlnaHQudmlzaXQodGhpcykpO1xuICB9XG5cbiAgdmlzaXRQcmVmaXhOb3QoYXN0OiBQcmVmaXhOb3QsIGNvbnRleHQ6IGFueSk6IEFTVCB7XG4gICAgcmV0dXJuIG5ldyBQcmVmaXhOb3QoYXN0LnNwYW4sIGFzdC5zb3VyY2VTcGFuLCBhc3QuZXhwcmVzc2lvbi52aXNpdCh0aGlzKSk7XG4gIH1cblxuICB2aXNpdE5vbk51bGxBc3NlcnQoYXN0OiBOb25OdWxsQXNzZXJ0LCBjb250ZXh0OiBhbnkpOiBBU1Qge1xuICAgIHJldHVybiBuZXcgTm9uTnVsbEFzc2VydChhc3Quc3BhbiwgYXN0LnNvdXJjZVNwYW4sIGFzdC5leHByZXNzaW9uLnZpc2l0KHRoaXMpKTtcbiAgfVxuXG4gIHZpc2l0Q29uZGl0aW9uYWwoYXN0OiBDb25kaXRpb25hbCwgY29udGV4dDogYW55KTogQVNUIHtcbiAgICByZXR1cm4gbmV3IENvbmRpdGlvbmFsKFxuICAgICAgICBhc3Quc3BhbiwgYXN0LnNvdXJjZVNwYW4sIGFzdC5jb25kaXRpb24udmlzaXQodGhpcyksIGFzdC50cnVlRXhwLnZpc2l0KHRoaXMpLFxuICAgICAgICBhc3QuZmFsc2VFeHAudmlzaXQodGhpcykpO1xuICB9XG5cbiAgdmlzaXRQaXBlKGFzdDogQmluZGluZ1BpcGUsIGNvbnRleHQ6IGFueSk6IEFTVCB7XG4gICAgcmV0dXJuIG5ldyBCaW5kaW5nUGlwZShcbiAgICAgICAgYXN0LnNwYW4sIGFzdC5zb3VyY2VTcGFuLCBhc3QuZXhwLnZpc2l0KHRoaXMpLCBhc3QubmFtZSwgdGhpcy52aXNpdEFsbChhc3QuYXJncyksXG4gICAgICAgIGFzdC5uYW1lU3Bhbik7XG4gIH1cblxuICB2aXNpdEtleWVkUmVhZChhc3Q6IEtleWVkUmVhZCwgY29udGV4dDogYW55KTogQVNUIHtcbiAgICByZXR1cm4gbmV3IEtleWVkUmVhZChhc3Quc3BhbiwgYXN0LnNvdXJjZVNwYW4sIGFzdC5vYmoudmlzaXQodGhpcyksIGFzdC5rZXkudmlzaXQodGhpcykpO1xuICB9XG5cbiAgdmlzaXRLZXllZFdyaXRlKGFzdDogS2V5ZWRXcml0ZSwgY29udGV4dDogYW55KTogQVNUIHtcbiAgICByZXR1cm4gbmV3IEtleWVkV3JpdGUoXG4gICAgICAgIGFzdC5zcGFuLCBhc3Quc291cmNlU3BhbiwgYXN0Lm9iai52aXNpdCh0aGlzKSwgYXN0LmtleS52aXNpdCh0aGlzKSwgYXN0LnZhbHVlLnZpc2l0KHRoaXMpKTtcbiAgfVxuXG4gIHZpc2l0QWxsKGFzdHM6IGFueVtdKTogYW55W10ge1xuICAgIGNvbnN0IHJlcyA9IFtdO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgYXN0cy5sZW5ndGg7ICsraSkge1xuICAgICAgcmVzW2ldID0gYXN0c1tpXS52aXNpdCh0aGlzKTtcbiAgICB9XG4gICAgcmV0dXJuIHJlcztcbiAgfVxuXG4gIHZpc2l0Q2hhaW4oYXN0OiBDaGFpbiwgY29udGV4dDogYW55KTogQVNUIHtcbiAgICByZXR1cm4gbmV3IENoYWluKGFzdC5zcGFuLCBhc3Quc291cmNlU3BhbiwgdGhpcy52aXNpdEFsbChhc3QuZXhwcmVzc2lvbnMpKTtcbiAgfVxuXG4gIHZpc2l0UXVvdGUoYXN0OiBRdW90ZSwgY29udGV4dDogYW55KTogQVNUIHtcbiAgICByZXR1cm4gbmV3IFF1b3RlKFxuICAgICAgICBhc3Quc3BhbiwgYXN0LnNvdXJjZVNwYW4sIGFzdC5wcmVmaXgsIGFzdC51bmludGVycHJldGVkRXhwcmVzc2lvbiwgYXN0LmxvY2F0aW9uKTtcbiAgfVxufVxuXG4vLyBBIHRyYW5zZm9ybWVyIHRoYXQgb25seSBjcmVhdGVzIG5ldyBub2RlcyBpZiB0aGUgdHJhbnNmb3JtZXIgbWFrZXMgYSBjaGFuZ2Ugb3Jcbi8vIGEgY2hhbmdlIGlzIG1hZGUgYSBjaGlsZCBub2RlLlxuZXhwb3J0IGNsYXNzIEFzdE1lbW9yeUVmZmljaWVudFRyYW5zZm9ybWVyIGltcGxlbWVudHMgQXN0VmlzaXRvciB7XG4gIHZpc2l0SW1wbGljaXRSZWNlaXZlcihhc3Q6IEltcGxpY2l0UmVjZWl2ZXIsIGNvbnRleHQ6IGFueSk6IEFTVCB7IHJldHVybiBhc3Q7IH1cblxuICB2aXNpdEludGVycG9sYXRpb24oYXN0OiBJbnRlcnBvbGF0aW9uLCBjb250ZXh0OiBhbnkpOiBJbnRlcnBvbGF0aW9uIHtcbiAgICBjb25zdCBleHByZXNzaW9ucyA9IHRoaXMudmlzaXRBbGwoYXN0LmV4cHJlc3Npb25zKTtcbiAgICBpZiAoZXhwcmVzc2lvbnMgIT09IGFzdC5leHByZXNzaW9ucylcbiAgICAgIHJldHVybiBuZXcgSW50ZXJwb2xhdGlvbihhc3Quc3BhbiwgYXN0LnNvdXJjZVNwYW4sIGFzdC5zdHJpbmdzLCBleHByZXNzaW9ucyk7XG4gICAgcmV0dXJuIGFzdDtcbiAgfVxuXG4gIHZpc2l0TGl0ZXJhbFByaW1pdGl2ZShhc3Q6IExpdGVyYWxQcmltaXRpdmUsIGNvbnRleHQ6IGFueSk6IEFTVCB7IHJldHVybiBhc3Q7IH1cblxuICB2aXNpdFByb3BlcnR5UmVhZChhc3Q6IFByb3BlcnR5UmVhZCwgY29udGV4dDogYW55KTogQVNUIHtcbiAgICBjb25zdCByZWNlaXZlciA9IGFzdC5yZWNlaXZlci52aXNpdCh0aGlzKTtcbiAgICBpZiAocmVjZWl2ZXIgIT09IGFzdC5yZWNlaXZlcikge1xuICAgICAgcmV0dXJuIG5ldyBQcm9wZXJ0eVJlYWQoYXN0LnNwYW4sIGFzdC5zb3VyY2VTcGFuLCByZWNlaXZlciwgYXN0Lm5hbWUpO1xuICAgIH1cbiAgICByZXR1cm4gYXN0O1xuICB9XG5cbiAgdmlzaXRQcm9wZXJ0eVdyaXRlKGFzdDogUHJvcGVydHlXcml0ZSwgY29udGV4dDogYW55KTogQVNUIHtcbiAgICBjb25zdCByZWNlaXZlciA9IGFzdC5yZWNlaXZlci52aXNpdCh0aGlzKTtcbiAgICBjb25zdCB2YWx1ZSA9IGFzdC52YWx1ZS52aXNpdCh0aGlzKTtcbiAgICBpZiAocmVjZWl2ZXIgIT09IGFzdC5yZWNlaXZlciB8fCB2YWx1ZSAhPT0gYXN0LnZhbHVlKSB7XG4gICAgICByZXR1cm4gbmV3IFByb3BlcnR5V3JpdGUoYXN0LnNwYW4sIGFzdC5zb3VyY2VTcGFuLCByZWNlaXZlciwgYXN0Lm5hbWUsIHZhbHVlKTtcbiAgICB9XG4gICAgcmV0dXJuIGFzdDtcbiAgfVxuXG4gIHZpc2l0U2FmZVByb3BlcnR5UmVhZChhc3Q6IFNhZmVQcm9wZXJ0eVJlYWQsIGNvbnRleHQ6IGFueSk6IEFTVCB7XG4gICAgY29uc3QgcmVjZWl2ZXIgPSBhc3QucmVjZWl2ZXIudmlzaXQodGhpcyk7XG4gICAgaWYgKHJlY2VpdmVyICE9PSBhc3QucmVjZWl2ZXIpIHtcbiAgICAgIHJldHVybiBuZXcgU2FmZVByb3BlcnR5UmVhZChhc3Quc3BhbiwgYXN0LnNvdXJjZVNwYW4sIHJlY2VpdmVyLCBhc3QubmFtZSk7XG4gICAgfVxuICAgIHJldHVybiBhc3Q7XG4gIH1cblxuICB2aXNpdE1ldGhvZENhbGwoYXN0OiBNZXRob2RDYWxsLCBjb250ZXh0OiBhbnkpOiBBU1Qge1xuICAgIGNvbnN0IHJlY2VpdmVyID0gYXN0LnJlY2VpdmVyLnZpc2l0KHRoaXMpO1xuICAgIGNvbnN0IGFyZ3MgPSB0aGlzLnZpc2l0QWxsKGFzdC5hcmdzKTtcbiAgICBpZiAocmVjZWl2ZXIgIT09IGFzdC5yZWNlaXZlciB8fCBhcmdzICE9PSBhc3QuYXJncykge1xuICAgICAgcmV0dXJuIG5ldyBNZXRob2RDYWxsKGFzdC5zcGFuLCBhc3Quc291cmNlU3BhbiwgcmVjZWl2ZXIsIGFzdC5uYW1lLCBhcmdzKTtcbiAgICB9XG4gICAgcmV0dXJuIGFzdDtcbiAgfVxuXG4gIHZpc2l0U2FmZU1ldGhvZENhbGwoYXN0OiBTYWZlTWV0aG9kQ2FsbCwgY29udGV4dDogYW55KTogQVNUIHtcbiAgICBjb25zdCByZWNlaXZlciA9IGFzdC5yZWNlaXZlci52aXNpdCh0aGlzKTtcbiAgICBjb25zdCBhcmdzID0gdGhpcy52aXNpdEFsbChhc3QuYXJncyk7XG4gICAgaWYgKHJlY2VpdmVyICE9PSBhc3QucmVjZWl2ZXIgfHwgYXJncyAhPT0gYXN0LmFyZ3MpIHtcbiAgICAgIHJldHVybiBuZXcgU2FmZU1ldGhvZENhbGwoYXN0LnNwYW4sIGFzdC5zb3VyY2VTcGFuLCByZWNlaXZlciwgYXN0Lm5hbWUsIGFyZ3MpO1xuICAgIH1cbiAgICByZXR1cm4gYXN0O1xuICB9XG5cbiAgdmlzaXRGdW5jdGlvbkNhbGwoYXN0OiBGdW5jdGlvbkNhbGwsIGNvbnRleHQ6IGFueSk6IEFTVCB7XG4gICAgY29uc3QgdGFyZ2V0ID0gYXN0LnRhcmdldCAmJiBhc3QudGFyZ2V0LnZpc2l0KHRoaXMpO1xuICAgIGNvbnN0IGFyZ3MgPSB0aGlzLnZpc2l0QWxsKGFzdC5hcmdzKTtcbiAgICBpZiAodGFyZ2V0ICE9PSBhc3QudGFyZ2V0IHx8IGFyZ3MgIT09IGFzdC5hcmdzKSB7XG4gICAgICByZXR1cm4gbmV3IEZ1bmN0aW9uQ2FsbChhc3Quc3BhbiwgYXN0LnNvdXJjZVNwYW4sIHRhcmdldCwgYXJncyk7XG4gICAgfVxuICAgIHJldHVybiBhc3Q7XG4gIH1cblxuICB2aXNpdExpdGVyYWxBcnJheShhc3Q6IExpdGVyYWxBcnJheSwgY29udGV4dDogYW55KTogQVNUIHtcbiAgICBjb25zdCBleHByZXNzaW9ucyA9IHRoaXMudmlzaXRBbGwoYXN0LmV4cHJlc3Npb25zKTtcbiAgICBpZiAoZXhwcmVzc2lvbnMgIT09IGFzdC5leHByZXNzaW9ucykge1xuICAgICAgcmV0dXJuIG5ldyBMaXRlcmFsQXJyYXkoYXN0LnNwYW4sIGFzdC5zb3VyY2VTcGFuLCBleHByZXNzaW9ucyk7XG4gICAgfVxuICAgIHJldHVybiBhc3Q7XG4gIH1cblxuICB2aXNpdExpdGVyYWxNYXAoYXN0OiBMaXRlcmFsTWFwLCBjb250ZXh0OiBhbnkpOiBBU1Qge1xuICAgIGNvbnN0IHZhbHVlcyA9IHRoaXMudmlzaXRBbGwoYXN0LnZhbHVlcyk7XG4gICAgaWYgKHZhbHVlcyAhPT0gYXN0LnZhbHVlcykge1xuICAgICAgcmV0dXJuIG5ldyBMaXRlcmFsTWFwKGFzdC5zcGFuLCBhc3Quc291cmNlU3BhbiwgYXN0LmtleXMsIHZhbHVlcyk7XG4gICAgfVxuICAgIHJldHVybiBhc3Q7XG4gIH1cblxuICB2aXNpdEJpbmFyeShhc3Q6IEJpbmFyeSwgY29udGV4dDogYW55KTogQVNUIHtcbiAgICBjb25zdCBsZWZ0ID0gYXN0LmxlZnQudmlzaXQodGhpcyk7XG4gICAgY29uc3QgcmlnaHQgPSBhc3QucmlnaHQudmlzaXQodGhpcyk7XG4gICAgaWYgKGxlZnQgIT09IGFzdC5sZWZ0IHx8IHJpZ2h0ICE9PSBhc3QucmlnaHQpIHtcbiAgICAgIHJldHVybiBuZXcgQmluYXJ5KGFzdC5zcGFuLCBhc3Quc291cmNlU3BhbiwgYXN0Lm9wZXJhdGlvbiwgbGVmdCwgcmlnaHQpO1xuICAgIH1cbiAgICByZXR1cm4gYXN0O1xuICB9XG5cbiAgdmlzaXRQcmVmaXhOb3QoYXN0OiBQcmVmaXhOb3QsIGNvbnRleHQ6IGFueSk6IEFTVCB7XG4gICAgY29uc3QgZXhwcmVzc2lvbiA9IGFzdC5leHByZXNzaW9uLnZpc2l0KHRoaXMpO1xuICAgIGlmIChleHByZXNzaW9uICE9PSBhc3QuZXhwcmVzc2lvbikge1xuICAgICAgcmV0dXJuIG5ldyBQcmVmaXhOb3QoYXN0LnNwYW4sIGFzdC5zb3VyY2VTcGFuLCBleHByZXNzaW9uKTtcbiAgICB9XG4gICAgcmV0dXJuIGFzdDtcbiAgfVxuXG4gIHZpc2l0Tm9uTnVsbEFzc2VydChhc3Q6IE5vbk51bGxBc3NlcnQsIGNvbnRleHQ6IGFueSk6IEFTVCB7XG4gICAgY29uc3QgZXhwcmVzc2lvbiA9IGFzdC5leHByZXNzaW9uLnZpc2l0KHRoaXMpO1xuICAgIGlmIChleHByZXNzaW9uICE9PSBhc3QuZXhwcmVzc2lvbikge1xuICAgICAgcmV0dXJuIG5ldyBOb25OdWxsQXNzZXJ0KGFzdC5zcGFuLCBhc3Quc291cmNlU3BhbiwgZXhwcmVzc2lvbik7XG4gICAgfVxuICAgIHJldHVybiBhc3Q7XG4gIH1cblxuICB2aXNpdENvbmRpdGlvbmFsKGFzdDogQ29uZGl0aW9uYWwsIGNvbnRleHQ6IGFueSk6IEFTVCB7XG4gICAgY29uc3QgY29uZGl0aW9uID0gYXN0LmNvbmRpdGlvbi52aXNpdCh0aGlzKTtcbiAgICBjb25zdCB0cnVlRXhwID0gYXN0LnRydWVFeHAudmlzaXQodGhpcyk7XG4gICAgY29uc3QgZmFsc2VFeHAgPSBhc3QuZmFsc2VFeHAudmlzaXQodGhpcyk7XG4gICAgaWYgKGNvbmRpdGlvbiAhPT0gYXN0LmNvbmRpdGlvbiB8fCB0cnVlRXhwICE9PSBhc3QudHJ1ZUV4cCB8fCBmYWxzZUV4cCAhPT0gYXN0LmZhbHNlRXhwKSB7XG4gICAgICByZXR1cm4gbmV3IENvbmRpdGlvbmFsKGFzdC5zcGFuLCBhc3Quc291cmNlU3BhbiwgY29uZGl0aW9uLCB0cnVlRXhwLCBmYWxzZUV4cCk7XG4gICAgfVxuICAgIHJldHVybiBhc3Q7XG4gIH1cblxuICB2aXNpdFBpcGUoYXN0OiBCaW5kaW5nUGlwZSwgY29udGV4dDogYW55KTogQVNUIHtcbiAgICBjb25zdCBleHAgPSBhc3QuZXhwLnZpc2l0KHRoaXMpO1xuICAgIGNvbnN0IGFyZ3MgPSB0aGlzLnZpc2l0QWxsKGFzdC5hcmdzKTtcbiAgICBpZiAoZXhwICE9PSBhc3QuZXhwIHx8IGFyZ3MgIT09IGFzdC5hcmdzKSB7XG4gICAgICByZXR1cm4gbmV3IEJpbmRpbmdQaXBlKGFzdC5zcGFuLCBhc3Quc291cmNlU3BhbiwgZXhwLCBhc3QubmFtZSwgYXJncywgYXN0Lm5hbWVTcGFuKTtcbiAgICB9XG4gICAgcmV0dXJuIGFzdDtcbiAgfVxuXG4gIHZpc2l0S2V5ZWRSZWFkKGFzdDogS2V5ZWRSZWFkLCBjb250ZXh0OiBhbnkpOiBBU1Qge1xuICAgIGNvbnN0IG9iaiA9IGFzdC5vYmoudmlzaXQodGhpcyk7XG4gICAgY29uc3Qga2V5ID0gYXN0LmtleS52aXNpdCh0aGlzKTtcbiAgICBpZiAob2JqICE9PSBhc3Qub2JqIHx8IGtleSAhPT0gYXN0LmtleSkge1xuICAgICAgcmV0dXJuIG5ldyBLZXllZFJlYWQoYXN0LnNwYW4sIGFzdC5zb3VyY2VTcGFuLCBvYmosIGtleSk7XG4gICAgfVxuICAgIHJldHVybiBhc3Q7XG4gIH1cblxuICB2aXNpdEtleWVkV3JpdGUoYXN0OiBLZXllZFdyaXRlLCBjb250ZXh0OiBhbnkpOiBBU1Qge1xuICAgIGNvbnN0IG9iaiA9IGFzdC5vYmoudmlzaXQodGhpcyk7XG4gICAgY29uc3Qga2V5ID0gYXN0LmtleS52aXNpdCh0aGlzKTtcbiAgICBjb25zdCB2YWx1ZSA9IGFzdC52YWx1ZS52aXNpdCh0aGlzKTtcbiAgICBpZiAob2JqICE9PSBhc3Qub2JqIHx8IGtleSAhPT0gYXN0LmtleSB8fCB2YWx1ZSAhPT0gYXN0LnZhbHVlKSB7XG4gICAgICByZXR1cm4gbmV3IEtleWVkV3JpdGUoYXN0LnNwYW4sIGFzdC5zb3VyY2VTcGFuLCBvYmosIGtleSwgdmFsdWUpO1xuICAgIH1cbiAgICByZXR1cm4gYXN0O1xuICB9XG5cbiAgdmlzaXRBbGwoYXN0czogYW55W10pOiBhbnlbXSB7XG4gICAgY29uc3QgcmVzID0gW107XG4gICAgbGV0IG1vZGlmaWVkID0gZmFsc2U7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBhc3RzLmxlbmd0aDsgKytpKSB7XG4gICAgICBjb25zdCBvcmlnaW5hbCA9IGFzdHNbaV07XG4gICAgICBjb25zdCB2YWx1ZSA9IG9yaWdpbmFsLnZpc2l0KHRoaXMpO1xuICAgICAgcmVzW2ldID0gdmFsdWU7XG4gICAgICBtb2RpZmllZCA9IG1vZGlmaWVkIHx8IHZhbHVlICE9PSBvcmlnaW5hbDtcbiAgICB9XG4gICAgcmV0dXJuIG1vZGlmaWVkID8gcmVzIDogYXN0cztcbiAgfVxuXG4gIHZpc2l0Q2hhaW4oYXN0OiBDaGFpbiwgY29udGV4dDogYW55KTogQVNUIHtcbiAgICBjb25zdCBleHByZXNzaW9ucyA9IHRoaXMudmlzaXRBbGwoYXN0LmV4cHJlc3Npb25zKTtcbiAgICBpZiAoZXhwcmVzc2lvbnMgIT09IGFzdC5leHByZXNzaW9ucykge1xuICAgICAgcmV0dXJuIG5ldyBDaGFpbihhc3Quc3BhbiwgYXN0LnNvdXJjZVNwYW4sIGV4cHJlc3Npb25zKTtcbiAgICB9XG4gICAgcmV0dXJuIGFzdDtcbiAgfVxuXG4gIHZpc2l0UXVvdGUoYXN0OiBRdW90ZSwgY29udGV4dDogYW55KTogQVNUIHsgcmV0dXJuIGFzdDsgfVxufVxuXG4vLyBCaW5kaW5nc1xuXG5leHBvcnQgY2xhc3MgUGFyc2VkUHJvcGVydHkge1xuICBwdWJsaWMgcmVhZG9ubHkgaXNMaXRlcmFsOiBib29sZWFuO1xuICBwdWJsaWMgcmVhZG9ubHkgaXNBbmltYXRpb246IGJvb2xlYW47XG5cbiAgY29uc3RydWN0b3IoXG4gICAgICBwdWJsaWMgbmFtZTogc3RyaW5nLCBwdWJsaWMgZXhwcmVzc2lvbjogQVNUV2l0aFNvdXJjZSwgcHVibGljIHR5cGU6IFBhcnNlZFByb3BlcnR5VHlwZSxcbiAgICAgIHB1YmxpYyBzb3VyY2VTcGFuOiBQYXJzZVNvdXJjZVNwYW4sIHB1YmxpYyB2YWx1ZVNwYW4/OiBQYXJzZVNvdXJjZVNwYW4pIHtcbiAgICB0aGlzLmlzTGl0ZXJhbCA9IHRoaXMudHlwZSA9PT0gUGFyc2VkUHJvcGVydHlUeXBlLkxJVEVSQUxfQVRUUjtcbiAgICB0aGlzLmlzQW5pbWF0aW9uID0gdGhpcy50eXBlID09PSBQYXJzZWRQcm9wZXJ0eVR5cGUuQU5JTUFUSU9OO1xuICB9XG59XG5cbmV4cG9ydCBlbnVtIFBhcnNlZFByb3BlcnR5VHlwZSB7XG4gIERFRkFVTFQsXG4gIExJVEVSQUxfQVRUUixcbiAgQU5JTUFUSU9OXG59XG5cbmV4cG9ydCBjb25zdCBlbnVtIFBhcnNlZEV2ZW50VHlwZSB7XG4gIC8vIERPTSBvciBEaXJlY3RpdmUgZXZlbnRcbiAgUmVndWxhcixcbiAgLy8gQW5pbWF0aW9uIHNwZWNpZmljIGV2ZW50XG4gIEFuaW1hdGlvbixcbn1cblxuZXhwb3J0IGNsYXNzIFBhcnNlZEV2ZW50IHtcbiAgLy8gUmVndWxhciBldmVudHMgaGF2ZSBhIHRhcmdldFxuICAvLyBBbmltYXRpb24gZXZlbnRzIGhhdmUgYSBwaGFzZVxuICBjb25zdHJ1Y3RvcihcbiAgICAgIHB1YmxpYyBuYW1lOiBzdHJpbmcsIHB1YmxpYyB0YXJnZXRPclBoYXNlOiBzdHJpbmcsIHB1YmxpYyB0eXBlOiBQYXJzZWRFdmVudFR5cGUsXG4gICAgICBwdWJsaWMgaGFuZGxlcjogQVNULCBwdWJsaWMgc291cmNlU3BhbjogUGFyc2VTb3VyY2VTcGFuLFxuICAgICAgcHVibGljIGhhbmRsZXJTcGFuOiBQYXJzZVNvdXJjZVNwYW4pIHt9XG59XG5cbmV4cG9ydCBjbGFzcyBQYXJzZWRWYXJpYWJsZSB7XG4gIGNvbnN0cnVjdG9yKHB1YmxpYyBuYW1lOiBzdHJpbmcsIHB1YmxpYyB2YWx1ZTogc3RyaW5nLCBwdWJsaWMgc291cmNlU3BhbjogUGFyc2VTb3VyY2VTcGFuKSB7fVxufVxuXG5leHBvcnQgY29uc3QgZW51bSBCaW5kaW5nVHlwZSB7XG4gIC8vIEEgcmVndWxhciBiaW5kaW5nIHRvIGEgcHJvcGVydHkgKGUuZy4gYFtwcm9wZXJ0eV09XCJleHByZXNzaW9uXCJgKS5cbiAgUHJvcGVydHksXG4gIC8vIEEgYmluZGluZyB0byBhbiBlbGVtZW50IGF0dHJpYnV0ZSAoZS5nLiBgW2F0dHIubmFtZV09XCJleHByZXNzaW9uXCJgKS5cbiAgQXR0cmlidXRlLFxuICAvLyBBIGJpbmRpbmcgdG8gYSBDU1MgY2xhc3MgKGUuZy4gYFtjbGFzcy5uYW1lXT1cImNvbmRpdGlvblwiYCkuXG4gIENsYXNzLFxuICAvLyBBIGJpbmRpbmcgdG8gYSBzdHlsZSBydWxlIChlLmcuIGBbc3R5bGUucnVsZV09XCJleHByZXNzaW9uXCJgKS5cbiAgU3R5bGUsXG4gIC8vIEEgYmluZGluZyB0byBhbiBhbmltYXRpb24gcmVmZXJlbmNlIChlLmcuIGBbYW5pbWF0ZS5rZXldPVwiZXhwcmVzc2lvblwiYCkuXG4gIEFuaW1hdGlvbixcbn1cblxuZXhwb3J0IGNsYXNzIEJvdW5kRWxlbWVudFByb3BlcnR5IHtcbiAgY29uc3RydWN0b3IoXG4gICAgICBwdWJsaWMgbmFtZTogc3RyaW5nLCBwdWJsaWMgdHlwZTogQmluZGluZ1R5cGUsIHB1YmxpYyBzZWN1cml0eUNvbnRleHQ6IFNlY3VyaXR5Q29udGV4dCxcbiAgICAgIHB1YmxpYyB2YWx1ZTogQVNULCBwdWJsaWMgdW5pdDogc3RyaW5nfG51bGwsIHB1YmxpYyBzb3VyY2VTcGFuOiBQYXJzZVNvdXJjZVNwYW4sXG4gICAgICBwdWJsaWMgdmFsdWVTcGFuPzogUGFyc2VTb3VyY2VTcGFuKSB7fVxufVxuIl19