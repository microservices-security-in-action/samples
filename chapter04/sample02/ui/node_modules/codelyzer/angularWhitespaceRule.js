"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var Lint = require("tslint");
var ngWalker_1 = require("./angular/ngWalker");
var ast = require("@angular/compiler");
var basicTemplateAstVisitor_1 = require("./angular/templates/basicTemplateAstVisitor");
var expressionTypes_1 = require("./angular/expressionTypes");
var config_1 = require("./angular/config");
var recursiveAngularExpressionVisitor_1 = require("./angular/templates/recursiveAngularExpressionVisitor");
var InterpolationOpen = config_1.Config.interpolation[0];
var InterpolationClose = config_1.Config.interpolation[1];
var InterpolationNoWhitespaceRe = new RegExp(InterpolationOpen + "\\S(.*?)\\S" + InterpolationClose + "|" + InterpolationOpen +
    ("\\s(.*?)\\S" + InterpolationClose + "|" + InterpolationOpen + "\\S(.*?)\\s" + InterpolationClose), 'g');
var InterpolationExtraWhitespaceRe = new RegExp(InterpolationOpen + "\\s\\s(.*?)\\s" + InterpolationClose + "|" + InterpolationOpen + "\\s(.*?)\\s\\s" + InterpolationClose, 'g');
var SemicolonNoWhitespaceNotInSimpleQuoteRe = new RegExp(/;\S(?![^']*')/);
var SemicolonNoWhitespaceNotInDoubleQuoteRe = new RegExp(/;\S(?![^"]*")/);
var getSemicolonReplacements = function (text, absolutePosition) {
    return [
        new Lint.Replacement(absolutePosition, 1, '; ')
    ];
};
var InterpolationWhitespaceVisitor = (function (_super) {
    __extends(InterpolationWhitespaceVisitor, _super);
    function InterpolationWhitespaceVisitor() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    InterpolationWhitespaceVisitor.prototype.visitBoundText = function (text, context) {
        if (expressionTypes_1.ExpTypes.ASTWithSource(text.value)) {
            var error = null;
            var expr_1 = text.value.source;
            var applyRegex = function (regex, failure) {
                var match;
                while (match = regex.exec(expr_1)) {
                    var start = text.sourceSpan.start.offset + match.index;
                    var absolutePosition = context.getSourcePosition(start);
                    var length_1 = match[0].length;
                    context.addFailure(context.createFailure(start, length_1, failure, [
                        new Lint.Replacement(absolutePosition, length_1, InterpolationOpen + " " + match[0].replace(InterpolationOpen, '').replace(InterpolationClose, '').trim() + " " + InterpolationClose)
                    ]));
                }
            };
            InterpolationNoWhitespaceRe.lastIndex = 0;
            applyRegex(InterpolationNoWhitespaceRe, "Missing whitespace in interpolation; expecting " + InterpolationOpen + " expr " + InterpolationClose);
            InterpolationExtraWhitespaceRe.lastIndex = 0;
            applyRegex(InterpolationExtraWhitespaceRe, "Extra whitespace in interpolation; expecting " + InterpolationOpen + " expr " + InterpolationClose);
        }
        _super.prototype.visitBoundText.call(this, text, context);
        return null;
    };
    InterpolationWhitespaceVisitor.prototype.getOption = function () {
        return 'check-interpolation';
    };
    return InterpolationWhitespaceVisitor;
}(basicTemplateAstVisitor_1.BasicTemplateAstVisitor));
var SemicolonTemplateVisitor = (function (_super) {
    __extends(SemicolonTemplateVisitor, _super);
    function SemicolonTemplateVisitor() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    SemicolonTemplateVisitor.prototype.visitDirectiveProperty = function (prop, context) {
        if (prop.sourceSpan) {
            var directive = prop.sourceSpan.toString();
            var rawExpression = directive.split('=')[1].trim();
            var expr = rawExpression.substring(1, rawExpression.length - 1).trim();
            var doubleQuote = rawExpression.substring(0, 1).indexOf('\"') === 0;
            var error = null;
            if (doubleQuote && SemicolonNoWhitespaceNotInSimpleQuoteRe.test(expr)) {
                error = 'Missing whitespace after semicolon; expecting \'; expr\'';
                var internalStart = expr.search(SemicolonNoWhitespaceNotInSimpleQuoteRe) + 1;
                var start = prop.sourceSpan.start.offset + internalStart + directive.length - directive.split('=')[1].trim().length + 1;
                var absolutePosition = context.getSourcePosition(start - 1);
                return context.addFailure(context.createFailure(start, 2, error, getSemicolonReplacements(prop, absolutePosition)));
            }
            else if (!doubleQuote && SemicolonNoWhitespaceNotInDoubleQuoteRe.test(expr)) {
                error = 'Missing whitespace after semicolon; expecting \'; expr\'';
                var internalStart = expr.search(SemicolonNoWhitespaceNotInDoubleQuoteRe) + 1;
                var start = prop.sourceSpan.start.offset + internalStart + directive.length - directive.split('=')[1].trim().length + 1;
                var absolutePosition = context.getSourcePosition(start - 1);
                return context.addFailure(context.createFailure(start, 2, error, getSemicolonReplacements(prop, absolutePosition)));
            }
        }
    };
    SemicolonTemplateVisitor.prototype.getOption = function () {
        return 'check-semicolon';
    };
    return SemicolonTemplateVisitor;
}(basicTemplateAstVisitor_1.BasicTemplateAstVisitor));
var WhitespaceTemplateVisitor = (function (_super) {
    __extends(WhitespaceTemplateVisitor, _super);
    function WhitespaceTemplateVisitor() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.visitors = [
            new InterpolationWhitespaceVisitor(_this.getSourceFile(), _this.getOptions(), _this.context, _this.templateStart),
            new SemicolonTemplateVisitor(_this.getSourceFile(), _this.getOptions(), _this.context, _this.templateStart)
        ];
        return _this;
    }
    WhitespaceTemplateVisitor.prototype.visitBoundText = function (text, context) {
        var _this = this;
        var options = this.getOptions();
        this.visitors
            .filter(function (v) { return options.indexOf(v.getOption()) >= 0; })
            .map(function (v) { return v.visitBoundText(text, _this); })
            .filter(function (f) { return !!f; })
            .forEach(function (f) { return _this.addFailure(f); });
        _super.prototype.visitBoundText.call(this, text, context);
    };
    WhitespaceTemplateVisitor.prototype.visitDirectiveProperty = function (prop, context) {
        var _this = this;
        var options = this.getOptions();
        this.visitors
            .filter(function (v) { return options.indexOf(v.getOption()) >= 0; })
            .map(function (v) { return v.visitDirectiveProperty(prop, _this); })
            .filter(function (f) { return !!f; })
            .forEach(function (f) { return _this.addFailure(f); });
        _super.prototype.visitDirectiveProperty.call(this, prop, context);
    };
    return WhitespaceTemplateVisitor;
}(basicTemplateAstVisitor_1.BasicTemplateAstVisitor));
var PipeWhitespaceVisitor = (function (_super) {
    __extends(PipeWhitespaceVisitor, _super);
    function PipeWhitespaceVisitor() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    PipeWhitespaceVisitor.prototype.visitPipe = function (ast, context) {
        var exprStart, exprEnd, exprText, sf;
        exprStart = context.getSourcePosition(ast.exp.span.start);
        exprEnd = context.getSourcePosition(ast.exp.span.end);
        sf = context.getSourceFile().getFullText();
        exprText = sf.substring(exprStart, exprEnd);
        var replacements = [];
        var parentheses = false;
        var leftBeginning;
        if (sf[exprEnd] === ')') {
            parentheses = true;
            leftBeginning = exprEnd + 1 + 2;
        }
        else {
            leftBeginning = exprEnd + 1;
        }
        if (sf[leftBeginning] === ' ') {
            var ignoreSpace = 1;
            while (sf[leftBeginning + ignoreSpace] === ' ') {
                ignoreSpace += 1;
            }
            if (ignoreSpace > 1) {
                replacements.push(new Lint.Replacement(exprEnd + 1, ignoreSpace, ' '));
            }
        }
        else {
            replacements.push(new Lint.Replacement(exprEnd + 1, 0, ' '));
        }
        if (exprText[exprText.length - 1] === ' ') {
            var ignoreSpace = 1;
            while (exprText[exprText.length - 1 - ignoreSpace] === ' ') {
                ignoreSpace += 1;
            }
            if (ignoreSpace > 1) {
                replacements.push(new Lint.Replacement(exprEnd - ignoreSpace, ignoreSpace, ' '));
            }
        }
        else {
            if (!parentheses) {
                replacements.push(new Lint.Replacement(exprEnd, 0, ' '));
            }
        }
        if (replacements.length) {
            context.addFailure(context.createFailure(ast.exp.span.end - 1, 3, 'The pipe operator should be surrounded by one space on each side, i.e. " | ".', replacements));
        }
        _super.prototype.visitPipe.call(this, ast, context);
        return null;
    };
    PipeWhitespaceVisitor.prototype.getOption = function () {
        return 'check-pipe';
    };
    PipeWhitespaceVisitor.prototype.isAsyncBinding = function (expr) {
        return expr instanceof ast.BindingPipe && expr.name === 'async';
    };
    return PipeWhitespaceVisitor;
}(recursiveAngularExpressionVisitor_1.RecursiveAngularExpressionVisitor));
var TemplateExpressionVisitor = (function (_super) {
    __extends(TemplateExpressionVisitor, _super);
    function TemplateExpressionVisitor() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.visitors = [
            new PipeWhitespaceVisitor(_this.getSourceFile(), _this.getOptions(), _this.context, _this.basePosition)
        ];
        return _this;
    }
    TemplateExpressionVisitor.prototype.visitPipe = function (expr, context) {
        var _this = this;
        var options = this.getOptions();
        this.visitors
            .map(function (v) { return v.addParentAST(_this.parentAST); })
            .filter(function (v) { return options.indexOf(v.getOption()) >= 0; })
            .map(function (v) { return v.visitPipe(expr, _this); })
            .filter(function (f) { return !!f; })
            .forEach(function (f) { return _this.addFailure(f); });
    };
    return TemplateExpressionVisitor;
}(recursiveAngularExpressionVisitor_1.RecursiveAngularExpressionVisitor));
var Rule = (function (_super) {
    __extends(Rule, _super);
    function Rule() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Rule.prototype.apply = function (sourceFile) {
        return this.applyWithWalker(new ngWalker_1.NgWalker(sourceFile, this.getOptions(), {
            templateVisitorCtrl: WhitespaceTemplateVisitor,
            expressionVisitorCtrl: TemplateExpressionVisitor,
        }));
    };
    Rule.metadata = {
        ruleName: 'angular-whitespace',
        type: 'style',
        description: "Ensures the proper formatting of Angular expressions.",
        rationale: "Having whitespace in the right places in an Angular expression makes the template more readable.",
        optionsDescription: (_a = ["\n      Arguments may be optionally provided:\n      * `\"check-interpolation\"` checks for whitespace before and after the interpolation characters\n      * `\"check-pipe\"` checks for whitespace before and after a pipe\n      * `\"check-semicolon\"` checks for whitespace after semicolon"], _a.raw = ["\n      Arguments may be optionally provided:\n      * \\`\"check-interpolation\"\\` checks for whitespace before and after the interpolation characters\n      * \\`\"check-pipe\"\\` checks for whitespace before and after a pipe\n      * \\`\"check-semicolon\"\\` checks for whitespace after semicolon"], Lint.Utils.dedent(_a)),
        options: {
            type: 'array',
            items: {
                type: 'string',
                enum: ['check-interpolation', 'check-pipe', 'check-semicolon'],
            },
            minLength: 0,
            maxLength: 3,
        },
        optionExamples: ['[true, "check-interpolation"]'],
        typescriptOnly: true,
    };
    return Rule;
}(Lint.Rules.AbstractRule));
exports.Rule = Rule;
var _a;
