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
        define("@angular/language-service/src/completions", ["require", "exports", "tslib", "@angular/compiler", "@angular/compiler/src/chars", "@angular/language-service/src/expression_diagnostics", "@angular/language-service/src/expressions", "@angular/language-service/src/html_info", "@angular/language-service/src/template", "@angular/language-service/src/types", "@angular/language-service/src/utils"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var tslib_1 = require("tslib");
    var compiler_1 = require("@angular/compiler");
    var chars_1 = require("@angular/compiler/src/chars");
    var expression_diagnostics_1 = require("@angular/language-service/src/expression_diagnostics");
    var expressions_1 = require("@angular/language-service/src/expressions");
    var html_info_1 = require("@angular/language-service/src/html_info");
    var template_1 = require("@angular/language-service/src/template");
    var ng = require("@angular/language-service/src/types");
    var utils_1 = require("@angular/language-service/src/utils");
    var HIDDEN_HTML_ELEMENTS = new Set(['html', 'script', 'noscript', 'base', 'body', 'title', 'head', 'link']);
    var HTML_ELEMENTS = html_info_1.elementNames().filter(function (name) { return !HIDDEN_HTML_ELEMENTS.has(name); }).map(function (name) {
        return {
            name: name,
            kind: ng.CompletionKind.HTML_ELEMENT,
            sortText: name,
        };
    });
    var ANGULAR_ELEMENTS = [
        {
            name: 'ng-container',
            kind: ng.CompletionKind.ANGULAR_ELEMENT,
            sortText: 'ng-container',
        },
        {
            name: 'ng-content',
            kind: ng.CompletionKind.ANGULAR_ELEMENT,
            sortText: 'ng-content',
        },
        {
            name: 'ng-template',
            kind: ng.CompletionKind.ANGULAR_ELEMENT,
            sortText: 'ng-template',
        },
    ];
    // This is adapted from packages/compiler/src/render3/r3_template_transform.ts
    // to allow empty binding names.
    var BIND_NAME_REGEXP = /^(?:(?:(?:(bind-)|(let-)|(ref-|#)|(on-)|(bindon-)|(@))(.*))|\[\(([^\)]*)\)\]|\[([^\]]*)\]|\(([^\)]*)\))$/;
    var ATTR;
    (function (ATTR) {
        // Group 1 = "bind-"
        ATTR[ATTR["KW_BIND_IDX"] = 1] = "KW_BIND_IDX";
        // Group 2 = "let-"
        ATTR[ATTR["KW_LET_IDX"] = 2] = "KW_LET_IDX";
        // Group 3 = "ref-/#"
        ATTR[ATTR["KW_REF_IDX"] = 3] = "KW_REF_IDX";
        // Group 4 = "on-"
        ATTR[ATTR["KW_ON_IDX"] = 4] = "KW_ON_IDX";
        // Group 5 = "bindon-"
        ATTR[ATTR["KW_BINDON_IDX"] = 5] = "KW_BINDON_IDX";
        // Group 6 = "@"
        ATTR[ATTR["KW_AT_IDX"] = 6] = "KW_AT_IDX";
        // Group 7 = the identifier after "bind-", "let-", "ref-/#", "on-", "bindon-" or "@"
        ATTR[ATTR["IDENT_KW_IDX"] = 7] = "IDENT_KW_IDX";
        // Group 8 = identifier inside [()]
        ATTR[ATTR["IDENT_BANANA_BOX_IDX"] = 8] = "IDENT_BANANA_BOX_IDX";
        // Group 9 = identifier inside []
        ATTR[ATTR["IDENT_PROPERTY_IDX"] = 9] = "IDENT_PROPERTY_IDX";
        // Group 10 = identifier inside ()
        ATTR[ATTR["IDENT_EVENT_IDX"] = 10] = "IDENT_EVENT_IDX";
    })(ATTR || (ATTR = {}));
    function isIdentifierPart(code) {
        // Identifiers consist of alphanumeric characters, '_', or '$'.
        return chars_1.isAsciiLetter(code) || chars_1.isDigit(code) || code == chars_1.$$ || code == chars_1.$_;
    }
    /**
     * Gets the span of word in a template that surrounds `position`. If there is no word around
     * `position`, nothing is returned.
     */
    function getBoundedWordSpan(templateInfo, position) {
        var template = templateInfo.template;
        var templateSrc = template.source;
        if (!templateSrc)
            return;
        // TODO(ayazhafiz): A solution based on word expansion will always be expensive compared to one
        // based on ASTs. Whatever penalty we incur is probably manageable for small-length (i.e. the
        // majority of) identifiers, but the current solution involes a number of branchings and we can't
        // control potentially very long identifiers. Consider moving to an AST-based solution once
        // existing difficulties with AST spans are more clearly resolved (see #31898 for discussion of
        // known problems, and #33091 for how they affect text replacement).
        //
        // `templatePosition` represents the right-bound location of a cursor in the template.
        //    key.ent|ry
        //           ^---- cursor, at position `r` is at.
        // A cursor is not itself a character in the template; it has a left (lower) and right (upper)
        // index bound that hugs the cursor itself.
        var templatePosition = position - template.span.start;
        // To perform word expansion, we want to determine the left and right indices that hug the cursor.
        // There are three cases here.
        var left, right;
        if (templatePosition === 0) {
            // 1. Case like
            //      |rest of template
            //    the cursor is at the start of the template, hugged only by the right side (0-index).
            left = right = 0;
        }
        else if (templatePosition === templateSrc.length) {
            // 2. Case like
            //      rest of template|
            //    the cursor is at the end of the template, hugged only by the left side (last-index).
            left = right = templateSrc.length - 1;
        }
        else {
            // 3. Case like
            //      wo|rd
            //    there is a clear left and right index.
            left = templatePosition - 1;
            right = templatePosition;
        }
        if (!isIdentifierPart(templateSrc.charCodeAt(left)) &&
            !isIdentifierPart(templateSrc.charCodeAt(right))) {
            // Case like
            //         .|.
            // left ---^ ^--- right
            // There is no word here.
            return;
        }
        // Expand on the left and right side until a word boundary is hit. Back up one expansion on both
        // side to stay inside the word.
        while (left >= 0 && isIdentifierPart(templateSrc.charCodeAt(left)))
            --left;
        ++left;
        while (right < templateSrc.length && isIdentifierPart(templateSrc.charCodeAt(right)))
            ++right;
        --right;
        var absoluteStartPosition = position - (templatePosition - left);
        var length = right - left + 1;
        return { start: absoluteStartPosition, length: length };
    }
    function getTemplateCompletions(templateInfo, position) {
        var result = [];
        var htmlAst = templateInfo.htmlAst, template = templateInfo.template;
        // The templateNode starts at the delimiter character so we add 1 to skip it.
        var templatePosition = position - template.span.start;
        var path = utils_1.getPathToNodeAtPosition(htmlAst, templatePosition);
        var mostSpecific = path.tail;
        if (path.empty || !mostSpecific) {
            result = elementCompletions(templateInfo);
        }
        else {
            var astPosition_1 = templatePosition - mostSpecific.sourceSpan.start.offset;
            mostSpecific.visit({
                visitElement: function (ast) {
                    var startTagSpan = utils_1.spanOf(ast.sourceSpan);
                    var tagLen = ast.name.length;
                    // + 1 for the opening angle bracket
                    if (templatePosition <= startTagSpan.start + tagLen + 1) {
                        // If we are in the tag then return the element completions.
                        result = elementCompletions(templateInfo);
                    }
                    else if (templatePosition < startTagSpan.end) {
                        // We are in the attribute section of the element (but not in an attribute).
                        // Return the attribute completions.
                        result = attributeCompletionsForElement(templateInfo, ast.name);
                    }
                },
                visitAttribute: function (ast) {
                    // An attribute consists of two parts, LHS="RHS".
                    // Determine if completions are requested for LHS or RHS
                    if (ast.valueSpan && utils_1.inSpan(templatePosition, utils_1.spanOf(ast.valueSpan))) {
                        // RHS completion
                        result = attributeValueCompletions(templateInfo, path);
                    }
                    else {
                        // LHS completion
                        result = attributeCompletions(templateInfo, path);
                    }
                },
                visitText: function (ast) {
                    // Check if we are in a entity.
                    result = entityCompletions(getSourceText(template, utils_1.spanOf(ast)), astPosition_1);
                    if (result.length)
                        return result;
                    result = interpolationCompletions(templateInfo, templatePosition);
                    if (result.length)
                        return result;
                    var element = path.first(compiler_1.Element);
                    if (element) {
                        var definition = compiler_1.getHtmlTagDefinition(element.name);
                        if (definition.contentType === compiler_1.TagContentType.PARSABLE_DATA) {
                            result = voidElementAttributeCompletions(templateInfo, path);
                            if (!result.length) {
                                // If the element can hold content, show element completions.
                                result = elementCompletions(templateInfo);
                            }
                        }
                    }
                    else {
                        // If no element container, implies parsable data so show elements.
                        result = voidElementAttributeCompletions(templateInfo, path);
                        if (!result.length) {
                            result = elementCompletions(templateInfo);
                        }
                    }
                },
                visitComment: function () { },
                visitExpansion: function () { },
                visitExpansionCase: function () { }
            }, null);
        }
        var replacementSpan = getBoundedWordSpan(templateInfo, position);
        return result.map(function (entry) {
            return tslib_1.__assign(tslib_1.__assign({}, entry), { replacementSpan: replacementSpan });
        });
    }
    exports.getTemplateCompletions = getTemplateCompletions;
    function attributeCompletions(info, path) {
        var attr = path.tail;
        var elem = path.parentOf(attr);
        if (!(attr instanceof compiler_1.Attribute) || !(elem instanceof compiler_1.Element)) {
            return [];
        }
        // TODO: Consider parsing the attrinute name to a proper AST instead of
        // matching using regex. This is because the regexp would incorrectly identify
        // bind parts for cases like [()|]
        //                              ^ cursor is here
        var bindParts = attr.name.match(BIND_NAME_REGEXP);
        // TemplateRef starts with '*'. See https://angular.io/api/core/TemplateRef
        var isTemplateRef = attr.name.startsWith('*');
        var isBinding = bindParts !== null || isTemplateRef;
        if (!isBinding) {
            return attributeCompletionsForElement(info, elem.name);
        }
        var results = [];
        var ngAttrs = angularAttributes(info, elem.name);
        if (!bindParts) {
            // If bindParts is null then this must be a TemplateRef.
            results.push.apply(results, tslib_1.__spread(ngAttrs.templateRefs));
        }
        else if (bindParts[ATTR.KW_BIND_IDX] !== undefined ||
            bindParts[ATTR.IDENT_PROPERTY_IDX] !== undefined) {
            // property binding via bind- or []
            results.push.apply(results, tslib_1.__spread(html_info_1.propertyNames(elem.name), ngAttrs.inputs));
        }
        else if (bindParts[ATTR.KW_ON_IDX] !== undefined || bindParts[ATTR.IDENT_EVENT_IDX] !== undefined) {
            // event binding via on- or ()
            results.push.apply(results, tslib_1.__spread(html_info_1.eventNames(elem.name), ngAttrs.outputs));
        }
        else if (bindParts[ATTR.KW_BINDON_IDX] !== undefined ||
            bindParts[ATTR.IDENT_BANANA_BOX_IDX] !== undefined) {
            // banana-in-a-box binding via bindon- or [()]
            results.push.apply(results, tslib_1.__spread(ngAttrs.bananas));
        }
        return results.map(function (name) {
            return {
                name: name,
                kind: ng.CompletionKind.ATTRIBUTE,
                sortText: name,
            };
        });
    }
    function attributeCompletionsForElement(info, elementName) {
        var e_1, _a, e_2, _b;
        var results = [];
        if (info.template instanceof template_1.InlineTemplate) {
            try {
                // Provide HTML attributes completion only for inline templates
                for (var _c = tslib_1.__values(html_info_1.attributeNames(elementName)), _d = _c.next(); !_d.done; _d = _c.next()) {
                    var name_1 = _d.value;
                    results.push({
                        name: name_1,
                        kind: ng.CompletionKind.HTML_ATTRIBUTE,
                        sortText: name_1,
                    });
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (_d && !_d.done && (_a = _c.return)) _a.call(_c);
                }
                finally { if (e_1) throw e_1.error; }
            }
        }
        // Add Angular attributes
        var ngAttrs = angularAttributes(info, elementName);
        try {
            for (var _e = tslib_1.__values(ngAttrs.others), _f = _e.next(); !_f.done; _f = _e.next()) {
                var name_2 = _f.value;
                results.push({
                    name: name_2,
                    kind: ng.CompletionKind.ATTRIBUTE,
                    sortText: name_2,
                });
            }
        }
        catch (e_2_1) { e_2 = { error: e_2_1 }; }
        finally {
            try {
                if (_f && !_f.done && (_b = _e.return)) _b.call(_e);
            }
            finally { if (e_2) throw e_2.error; }
        }
        return results;
    }
    /**
     * Provide completions to the RHS of an attribute, which is of the form
     * LHS="RHS". The template path is computed from the specified `info` whereas
     * the context is determined from the specified `htmlPath`.
     * @param info Object that contains the template AST
     * @param htmlPath Path to the HTML node
     */
    function attributeValueCompletions(info, htmlPath) {
        // Find the corresponding Template AST path.
        var templatePath = utils_1.findTemplateAstAt(info.templateAst, htmlPath.position);
        var visitor = new ExpressionVisitor(info, htmlPath.position, function () {
            var dinfo = utils_1.diagnosticInfoFromTemplateInfo(info);
            return expression_diagnostics_1.getExpressionScope(dinfo, templatePath);
        });
        if (templatePath.tail instanceof compiler_1.AttrAst ||
            templatePath.tail instanceof compiler_1.BoundElementPropertyAst ||
            templatePath.tail instanceof compiler_1.BoundEventAst) {
            templatePath.tail.visit(visitor, null);
            return visitor.results;
        }
        // In order to provide accurate attribute value completion, we need to know
        // what the LHS is, and construct the proper AST if it is missing.
        var htmlAttr = htmlPath.tail;
        var bindParts = htmlAttr.name.match(BIND_NAME_REGEXP);
        if (bindParts && bindParts[ATTR.KW_REF_IDX] !== undefined) {
            var refAst = void 0;
            var elemAst = void 0;
            if (templatePath.tail instanceof compiler_1.ReferenceAst) {
                refAst = templatePath.tail;
                var parent_1 = templatePath.parentOf(refAst);
                if (parent_1 instanceof compiler_1.ElementAst) {
                    elemAst = parent_1;
                }
            }
            else if (templatePath.tail instanceof compiler_1.ElementAst) {
                refAst = new compiler_1.ReferenceAst(htmlAttr.name, null, htmlAttr.value, htmlAttr.valueSpan);
                elemAst = templatePath.tail;
            }
            if (refAst && elemAst) {
                refAst.visit(visitor, elemAst);
            }
        }
        else {
            // HtmlAst contains the `Attribute` node, however the corresponding `AttrAst`
            // node is missing from the TemplateAst.
            var attrAst = new compiler_1.AttrAst(htmlAttr.name, htmlAttr.value, htmlAttr.valueSpan);
            attrAst.visit(visitor, null);
        }
        return visitor.results;
    }
    function elementCompletions(info) {
        var e_3, _a;
        var results = tslib_1.__spread(ANGULAR_ELEMENTS);
        if (info.template instanceof template_1.InlineTemplate) {
            // Provide HTML elements completion only for inline templates
            results.push.apply(results, tslib_1.__spread(HTML_ELEMENTS));
        }
        // Collect the elements referenced by the selectors
        var components = new Set();
        try {
            for (var _b = tslib_1.__values(utils_1.getSelectors(info).selectors), _c = _b.next(); !_c.done; _c = _b.next()) {
                var selector = _c.value;
                var name_3 = selector.element;
                if (name_3 && !components.has(name_3)) {
                    components.add(name_3);
                    results.push({
                        name: name_3,
                        kind: ng.CompletionKind.COMPONENT,
                        sortText: name_3,
                    });
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
        return results;
    }
    function entityCompletions(value, position) {
        // Look for entity completions
        var re = /&[A-Za-z]*;?(?!\d)/g;
        var found;
        var result = [];
        while (found = re.exec(value)) {
            var len = found[0].length;
            if (position >= found.index && position < (found.index + len)) {
                result = Object.keys(compiler_1.NAMED_ENTITIES).map(function (name) {
                    return {
                        name: "&" + name + ";",
                        kind: ng.CompletionKind.ENTITY,
                        sortText: name,
                    };
                });
                break;
            }
        }
        return result;
    }
    function interpolationCompletions(info, position) {
        // Look for an interpolation in at the position.
        var templatePath = utils_1.findTemplateAstAt(info.templateAst, position);
        if (!templatePath.tail) {
            return [];
        }
        var visitor = new ExpressionVisitor(info, position, function () { return expression_diagnostics_1.getExpressionScope(utils_1.diagnosticInfoFromTemplateInfo(info), templatePath); });
        templatePath.tail.visit(visitor, null);
        return visitor.results;
    }
    // There is a special case of HTML where text that contains a unclosed tag is treated as
    // text. For exaple '<h1> Some <a text </h1>' produces a text nodes inside of the H1
    // element "Some <a text". We, however, want to treat this as if the user was requesting
    // the attributes of an "a" element, not requesting completion in the a text element. This
    // code checks for this case and returns element completions if it is detected or undefined
    // if it is not.
    function voidElementAttributeCompletions(info, path) {
        var tail = path.tail;
        if (tail instanceof compiler_1.Text) {
            var match = tail.value.match(/<(\w(\w|\d|-)*:)?(\w(\w|\d|-)*)\s/);
            // The position must be after the match, otherwise we are still in a place where elements
            // are expected (such as `<|a` or `<a|`; we only want attributes for `<a |` or after).
            if (match &&
                path.position >= (match.index || 0) + match[0].length + tail.sourceSpan.start.offset) {
                return attributeCompletionsForElement(info, match[3]);
            }
        }
        return [];
    }
    var ExpressionVisitor = /** @class */ (function (_super) {
        tslib_1.__extends(ExpressionVisitor, _super);
        function ExpressionVisitor(info, position, getExpressionScope) {
            var _this = _super.call(this) || this;
            _this.info = info;
            _this.position = position;
            _this.getExpressionScope = getExpressionScope;
            _this.completions = new Map();
            return _this;
        }
        Object.defineProperty(ExpressionVisitor.prototype, "results", {
            get: function () { return Array.from(this.completions.values()); },
            enumerable: true,
            configurable: true
        });
        ExpressionVisitor.prototype.visitDirectiveProperty = function (ast) {
            this.processExpressionCompletions(ast.value);
        };
        ExpressionVisitor.prototype.visitElementProperty = function (ast) {
            this.processExpressionCompletions(ast.value);
        };
        ExpressionVisitor.prototype.visitEvent = function (ast) { this.processExpressionCompletions(ast.handler); };
        ExpressionVisitor.prototype.visitElement = function () {
            // no-op for now
        };
        ExpressionVisitor.prototype.visitAttr = function (ast) {
            if (ast.name.startsWith('*')) {
                // This a template binding given by micro syntax expression.
                // First, verify the attribute consists of some binding we can give completions for.
                var templateBindings = this.info.expressionParser.parseTemplateBindings(ast.name, ast.value, ast.sourceSpan.toString(), ast.sourceSpan.start.offset).templateBindings;
                // Find where the cursor is relative to the start of the attribute value.
                var valueRelativePosition_1 = this.position - ast.sourceSpan.start.offset;
                // Find the template binding that contains the position.
                var binding = templateBindings.find(function (b) { return utils_1.inSpan(valueRelativePosition_1, b.span); });
                if (!binding) {
                    return;
                }
                this.microSyntaxInAttributeValue(ast, binding);
            }
            else {
                var expressionAst = this.info.expressionParser.parseBinding(ast.value, ast.sourceSpan.toString(), ast.sourceSpan.start.offset);
                this.processExpressionCompletions(expressionAst);
            }
        };
        ExpressionVisitor.prototype.visitReference = function (_ast, context) {
            var _this = this;
            context.directives.forEach(function (dir) {
                var exportAs = dir.directive.exportAs;
                if (exportAs) {
                    _this.completions.set(exportAs, { name: exportAs, kind: ng.CompletionKind.REFERENCE, sortText: exportAs });
                }
            });
        };
        ExpressionVisitor.prototype.visitBoundText = function (ast) {
            if (utils_1.inSpan(this.position, ast.value.sourceSpan)) {
                var completions = expressions_1.getExpressionCompletions(this.getExpressionScope(), ast.value, this.position, this.info.template.query);
                if (completions) {
                    this.addSymbolsToCompletions(completions);
                }
            }
        };
        ExpressionVisitor.prototype.processExpressionCompletions = function (value) {
            var symbols = expressions_1.getExpressionCompletions(this.getExpressionScope(), value, this.position, this.info.template.query);
            if (symbols) {
                this.addSymbolsToCompletions(symbols);
            }
        };
        ExpressionVisitor.prototype.addSymbolsToCompletions = function (symbols) {
            var e_4, _a;
            try {
                for (var symbols_1 = tslib_1.__values(symbols), symbols_1_1 = symbols_1.next(); !symbols_1_1.done; symbols_1_1 = symbols_1.next()) {
                    var s = symbols_1_1.value;
                    if (s.name.startsWith('__') || !s.public || this.completions.has(s.name)) {
                        continue;
                    }
                    // The pipe method should not include parentheses.
                    // e.g. {{ value_expression | slice : start [ : end ] }}
                    var shouldInsertParentheses = s.callable && s.kind !== ng.CompletionKind.PIPE;
                    this.completions.set(s.name, {
                        name: s.name,
                        kind: s.kind,
                        sortText: s.name,
                        insertText: shouldInsertParentheses ? s.name + "()" : s.name,
                    });
                }
            }
            catch (e_4_1) { e_4 = { error: e_4_1 }; }
            finally {
                try {
                    if (symbols_1_1 && !symbols_1_1.done && (_a = symbols_1.return)) _a.call(symbols_1);
                }
                finally { if (e_4) throw e_4.error; }
            }
        };
        /**
         * This method handles the completions of attribute values for directives that
         * support the microsyntax format. Examples are *ngFor and *ngIf.
         * These directives allows declaration of "let" variables, adds context-specific
         * symbols like $implicit, index, count, among other behaviors.
         * For a complete description of such format, see
         * https://angular.io/guide/structural-directives#the-asterisk--prefix
         *
         * @param attr descriptor for attribute name and value pair
         * @param binding template binding for the expression in the attribute
         */
        ExpressionVisitor.prototype.microSyntaxInAttributeValue = function (attr, binding) {
            var key = attr.name.substring(1); // remove leading asterisk
            // Find the selector - eg ngFor, ngIf, etc
            var selectorInfo = utils_1.getSelectors(this.info);
            var selector = selectorInfo.selectors.find(function (s) {
                // attributes are listed in (attribute, value) pairs
                for (var i = 0; i < s.attrs.length; i += 2) {
                    if (s.attrs[i] === key) {
                        return true;
                    }
                }
            });
            if (!selector) {
                return;
            }
            var valueRelativePosition = this.position - attr.sourceSpan.start.offset;
            if (binding.keyIsVar) {
                var equalLocation = attr.value.indexOf('=');
                if (equalLocation > 0 && valueRelativePosition > equalLocation) {
                    // We are after the '=' in a let clause. The valid values here are the members of the
                    // template reference's type parameter.
                    var directiveMetadata = selectorInfo.map.get(selector);
                    if (directiveMetadata) {
                        var contextTable = this.info.template.query.getTemplateContext(directiveMetadata.type.reference);
                        if (contextTable) {
                            // This adds symbols like $implicit, index, count, etc.
                            this.addSymbolsToCompletions(contextTable.values());
                            return;
                        }
                    }
                }
            }
            if (binding.expression && utils_1.inSpan(valueRelativePosition, binding.expression.ast.span)) {
                this.processExpressionCompletions(binding.expression.ast);
                return;
            }
            // If the expression is incomplete, for example *ngFor="let x of |"
            // binding.expression is null. We could still try to provide suggestions
            // by looking for symbols that are in scope.
            var KW_OF = ' of ';
            var ofLocation = attr.value.indexOf(KW_OF);
            if (ofLocation > 0 && valueRelativePosition >= ofLocation + KW_OF.length) {
                var expressionAst = this.info.expressionParser.parseBinding(attr.value, attr.sourceSpan.toString(), attr.sourceSpan.start.offset);
                this.processExpressionCompletions(expressionAst);
            }
        };
        return ExpressionVisitor;
    }(compiler_1.NullTemplateVisitor));
    function getSourceText(template, span) {
        return template.source.substring(span.start, span.end);
    }
    /**
     * Return all Angular-specific attributes for the element with `elementName`.
     * @param info
     * @param elementName
     */
    function angularAttributes(info, elementName) {
        var e_5, _a, e_6, _b, e_7, _c, e_8, _d;
        var _e = utils_1.getSelectors(info), selectors = _e.selectors, selectorMap = _e.map;
        var templateRefs = new Set();
        var inputs = new Set();
        var outputs = new Set();
        var bananas = new Set();
        var others = new Set();
        try {
            for (var selectors_1 = tslib_1.__values(selectors), selectors_1_1 = selectors_1.next(); !selectors_1_1.done; selectors_1_1 = selectors_1.next()) {
                var selector = selectors_1_1.value;
                if (selector.element && selector.element !== elementName) {
                    continue;
                }
                var summary = selectorMap.get(selector);
                var isTemplateRef = utils_1.hasTemplateReference(summary.type);
                // attributes are listed in (attribute, value) pairs
                for (var i = 0; i < selector.attrs.length; i += 2) {
                    var attr = selector.attrs[i];
                    if (isTemplateRef) {
                        templateRefs.add(attr);
                    }
                    else {
                        others.add(attr);
                    }
                }
                try {
                    for (var _f = (e_6 = void 0, tslib_1.__values(Object.values(summary.inputs))), _g = _f.next(); !_g.done; _g = _f.next()) {
                        var input = _g.value;
                        inputs.add(input);
                    }
                }
                catch (e_6_1) { e_6 = { error: e_6_1 }; }
                finally {
                    try {
                        if (_g && !_g.done && (_b = _f.return)) _b.call(_f);
                    }
                    finally { if (e_6) throw e_6.error; }
                }
                try {
                    for (var _h = (e_7 = void 0, tslib_1.__values(Object.values(summary.outputs))), _j = _h.next(); !_j.done; _j = _h.next()) {
                        var output = _j.value;
                        outputs.add(output);
                    }
                }
                catch (e_7_1) { e_7 = { error: e_7_1 }; }
                finally {
                    try {
                        if (_j && !_j.done && (_c = _h.return)) _c.call(_h);
                    }
                    finally { if (e_7) throw e_7.error; }
                }
            }
        }
        catch (e_5_1) { e_5 = { error: e_5_1 }; }
        finally {
            try {
                if (selectors_1_1 && !selectors_1_1.done && (_a = selectors_1.return)) _a.call(selectors_1);
            }
            finally { if (e_5) throw e_5.error; }
        }
        try {
            for (var inputs_1 = tslib_1.__values(inputs), inputs_1_1 = inputs_1.next(); !inputs_1_1.done; inputs_1_1 = inputs_1.next()) {
                var name_4 = inputs_1_1.value;
                // Add banana-in-a-box syntax
                // https://angular.io/guide/template-syntax#two-way-binding-
                if (outputs.has(name_4 + "Change")) {
                    bananas.add(name_4);
                }
            }
        }
        catch (e_8_1) { e_8 = { error: e_8_1 }; }
        finally {
            try {
                if (inputs_1_1 && !inputs_1_1.done && (_d = inputs_1.return)) _d.call(inputs_1);
            }
            finally { if (e_8) throw e_8.error; }
        }
        return { templateRefs: templateRefs, inputs: inputs, outputs: outputs, bananas: bananas, others: others };
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tcGxldGlvbnMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9sYW5ndWFnZS1zZXJ2aWNlL3NyYy9jb21wbGV0aW9ucy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7Ozs7Ozs7Ozs7Ozs7SUFFSCw4Q0FBdVQ7SUFDdlQscURBQTJFO0lBRzNFLCtGQUE0RDtJQUM1RCx5RUFBdUQ7SUFDdkQscUVBQW9GO0lBQ3BGLG1FQUEwQztJQUMxQyx3REFBOEI7SUFDOUIsNkRBQXVKO0lBRXZKLElBQU0sb0JBQW9CLEdBQ3RCLElBQUksR0FBRyxDQUFDLENBQUMsTUFBTSxFQUFFLFFBQVEsRUFBRSxVQUFVLEVBQUUsTUFBTSxFQUFFLE1BQU0sRUFBRSxPQUFPLEVBQUUsTUFBTSxFQUFFLE1BQU0sQ0FBQyxDQUFDLENBQUM7SUFDckYsSUFBTSxhQUFhLEdBQ2Ysd0JBQVksRUFBRSxDQUFDLE1BQU0sQ0FBQyxVQUFBLElBQUksSUFBSSxPQUFBLENBQUMsb0JBQW9CLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxFQUEvQixDQUErQixDQUFDLENBQUMsR0FBRyxDQUFDLFVBQUEsSUFBSTtRQUNyRSxPQUFPO1lBQ0wsSUFBSSxNQUFBO1lBQ0osSUFBSSxFQUFFLEVBQUUsQ0FBQyxjQUFjLENBQUMsWUFBWTtZQUNwQyxRQUFRLEVBQUUsSUFBSTtTQUNmLENBQUM7SUFDSixDQUFDLENBQUMsQ0FBQztJQUNQLElBQU0sZ0JBQWdCLEdBQXNDO1FBQzFEO1lBQ0UsSUFBSSxFQUFFLGNBQWM7WUFDcEIsSUFBSSxFQUFFLEVBQUUsQ0FBQyxjQUFjLENBQUMsZUFBZTtZQUN2QyxRQUFRLEVBQUUsY0FBYztTQUN6QjtRQUNEO1lBQ0UsSUFBSSxFQUFFLFlBQVk7WUFDbEIsSUFBSSxFQUFFLEVBQUUsQ0FBQyxjQUFjLENBQUMsZUFBZTtZQUN2QyxRQUFRLEVBQUUsWUFBWTtTQUN2QjtRQUNEO1lBQ0Us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SyxXQUFBO3dCQUNkLE1BQU0sQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUM7cUJBQ25COzs7Ozs7Ozs7O29CQUNELEtBQXFCLElBQUEsb0JBQUEsaUJBQUEsTUFBTSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUEsQ0FBQSxnQkFBQSw0QkFBRTt3QkFBaEQsSUFBTSxNQUFNLFdBQUE7d0JBQ2YsT0FBTyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQztxQkFDckI7Ozs7Ozs7OzthQUNGOzs7Ozs7Ozs7O1lBQ0QsS0FBbUIsSUFBQSxXQUFBLGlCQUFBLE1BQU0sQ0FBQSw4QkFBQSxrREFBRTtnQkFBdEIsSUFBTSxNQUFJLG1CQUFBO2dCQUNiLDZCQUE2QjtnQkFDN0IsNERBQTREO2dCQUM1RCxJQUFJLE9BQU8sQ0FBQyxHQUFHLENBQUksTUFBSSxXQUFRLENBQUMsRUFBRTtvQkFDaEMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxNQUFJLENBQUMsQ0FBQztpQkFDbkI7YUFDRjs7Ozs7Ozs7O1FBQ0QsT0FBTyxFQUFDLFlBQVksY0FBQSxFQUFFLE1BQU0sUUFBQSxFQUFFLE9BQU8sU0FBQSxFQUFFLE9BQU8sU0FBQSxFQUFFLE1BQU0sUUFBQSxFQUFDLENBQUM7SUFDMUQsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtBU1QsIEFzdFBhdGgsIEF0dHJBc3QsIEF0dHJpYnV0ZSwgQm91bmREaXJlY3RpdmVQcm9wZXJ0eUFzdCwgQm91bmRFbGVtZW50UHJvcGVydHlBc3QsIEJvdW5kRXZlbnRBc3QsIEJvdW5kVGV4dEFzdCwgRWxlbWVudCwgRWxlbWVudEFzdCwgSHRtbEFzdFBhdGgsIE5BTUVEX0VOVElUSUVTLCBOb2RlIGFzIEh0bWxBc3QsIE51bGxUZW1wbGF0ZVZpc2l0b3IsIFJlZmVyZW5jZUFzdCwgVGFnQ29udGVudFR5cGUsIFRlbXBsYXRlQmluZGluZywgVGV4dCwgZ2V0SHRtbFRhZ0RlZmluaXRpb259IGZyb20gJ0Bhbmd1bGFyL2NvbXBpbGVyJztcbmltcG9ydCB7JCQsICRfLCBpc0FzY2lpTGV0dGVyLCBpc0RpZ2l0fSBmcm9tICdAYW5ndWxhci9jb21waWxlci9zcmMvY2hhcnMnO1xuXG5pbXBvcnQge0FzdFJlc3VsdH0gZnJvbSAnLi9jb21tb24nO1xuaW1wb3J0IHtnZXRFeHByZXNzaW9uU2NvcGV9IGZyb20gJy4vZXhwcmVzc2lvbl9kaWFnbm9zdGljcyc7XG5pbXBvcnQge2dldEV4cHJlc3Npb25Db21wbGV0aW9uc30gZnJvbSAnLi9leHByZXNzaW9ucyc7XG5pbXBvcnQge2F0dHJpYnV0ZU5hbWVzLCBlbGVtZW50TmFtZXMsIGV2ZW50TmFtZXMsIHByb3BlcnR5TmFtZXN9IGZyb20gJy4vaHRtbF9pbmZvJztcbmltcG9ydCB7SW5saW5lVGVtcGxhdGV9IGZyb20gJy4vdGVtcGxhdGUnO1xuaW1wb3J0ICogYXMgbmcgZnJvbSAnLi90eXBlcyc7XG5pbXBvcnQge2RpYWdub3N0aWNJbmZvRnJvbVRlbXBsYXRlSW5mbywgZmluZFRlbXBsYXRlQXN0QXQsIGdldFBhdGhUb05vZGVBdFBvc2l0aW9uLCBnZXRTZWxlY3RvcnMsIGhhc1RlbXBsYXRlUmVmZXJlbmNlLCBpblNwYW4sIHNwYW5PZn0gZnJvbSAnLi91dGlscyc7XG5cbmNvbnN0IEhJRERFTl9IVE1MX0VMRU1FTlRTOiBSZWFkb25seVNldDxzdHJpbmc+ID1cbiAgICBuZXcgU2V0KFsnaHRtbCcsICdzY3JpcHQnLCAnbm9zY3JpcHQnLCAnYmFzZScsICdib2R5JywgJ3RpdGxlJywgJ2hlYWQnLCAnbGluayddKTtcbmNvbnN0IEhUTUxfRUxFTUVOVFM6IFJlYWRvbmx5QXJyYXk8bmcuQ29tcGxldGlvbkVudHJ5PiA9XG4gICAgZWxlbWVudE5hbWVzKCkuZmlsdGVyKG5hbWUgPT4gIUhJRERFTl9IVE1MX0VMRU1FTlRTLmhhcyhuYW1lKSkubWFwKG5hbWUgPT4ge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgbmFtZSxcbiAgICAgICAga2luZDogbmcuQ29tcGxldGlvbktpbmQuSFRNTF9FTEVNRU5ULFxuICAgICAgICBzb3J0VGV4dDogbmFtZSxcbiAgICAgIH07XG4gICAgfSk7XG5jb25zdCBBTkdVTEFSX0VMRU1FTlRTOiBSZWFkb25seUFycmF5PG5nLkNvbXBsZXRpb25FbnRyeT4gPSBbXG4gIHtcbiAgICBuYW1lOiAnbmctY29udGFpbmVyJyxcbiAgICBraW5kOiBuZy5Db21wbGV0aW9uS2luZC5BTkdVTEFSX0VMRU1FTlQsXG4gICAgc29ydFRleHQ6ICduZy1jb250YWluZXInLFxuICB9LFxuICB7XG4gICAgbmFtZTogJ25nLWNvbnRlbnQnLFxuICAgIGtpbmQ6IG5nLkNvbXBsZXRpb25LaW5kLkFOR1VMQVJfRUxFTUVOVCxcbiAgICBzb3J0VGV4dDogJ25nLWNvbnRlbnQnLFxuICB9LFxuICB7XG4gICAgbmFtZTogJ25nLXRlbXBsYXRlJyxcbiAgICBraW5kOiBuZy5Db21wbGV0aW9uS2luZC5BTkdVTEFSX0VMRU1FTlQsXG4gICAgc29ydFRleHQ6ICduZy10ZW1wbGF0ZScsXG4gIH0sXG5dO1xuXG4vLyBUaGlzIGlzIGFkYXB0ZWQgZnJvbSBwYWNrYWdlcy9jb21waWxlci9zcmMvcmVuZGVyMy9yM190ZW1wbGF0ZV90cmFuc2Zvcm0udHNcbi8vIHRvIGFsbG93IGVtcHR5IGJpbmRpbmcgbmFtZXMuXG5jb25zdCBCSU5EX05BTUVfUkVHRVhQID1cbiAgICAvXig/Oig/Oig/OihiaW5kLSl8KGxldC0pfChyZWYtfCMpfChvbi0pfChiaW5kb24tKXwoQCkpKC4qKSl8XFxbXFwoKFteXFwpXSopXFwpXFxdfFxcWyhbXlxcXV0qKVxcXXxcXCgoW15cXCldKilcXCkpJC87XG5lbnVtIEFUVFIge1xuICAvLyBHcm91cCAxID0gXCJiaW5kLVwiXG4gIEtXX0JJTkRfSURYID0gMSxcbiAgLy8gR3JvdXAgMiA9IFwibGV0LVwiXG4gIEtXX0xFVF9JRFggPSAyLFxuICAvLyBHcm91cCAzID0gXCJyZWYtLyNcIlxuICBLV19SRUZfSURYID0gMyxcbiAgLy8gR3JvdXAgNCA9IFwib24tXCJcbiAgS1dfT05fSURYID0gNCxcbiAgLy8gR3JvdXAgNSA9IFwiYmluZG9uLVwiXG4gIEtXX0JJTkRPTl9JRFggPSA1LFxuICAvLyBHcm91cCA2ID0gXCJAXCJcbiAgS1dfQVRfSURYID0gNixcbiAgLy8gR3JvdXAgNyA9IHRoZSBpZGVudGlmaWVyIGFmdGVyIFwiYmluZC1cIiwgXCJsZXQtXCIsIFwicmVmLS8jXCIsIFwib24tXCIsIFwiYmluZG9uLVwiIG9yIFwiQFwiXG4gIElERU5UX0tXX0lEWCA9IDcsXG4gIC8vIEdyb3VwIDggPSBpZGVudGlmaWVyIGluc2lkZSBbKCldXG4gIElERU5UX0JBTkFOQV9CT1hfSURYID0gOCxcbiAgLy8gR3JvdXAgOSA9IGlkZW50aWZpZXIgaW5zaWRlIFtdXG4gIElERU5UX1BST1BFUlRZX0lEWCA9IDksXG4gIC8vIEdyb3VwIDEwID0gaWRlbnRpZmllciBpbnNpZGUgKClcbiAgSURFTlRfRVZFTlRfSURYID0gMTAsXG59XG5cbmZ1bmN0aW9uIGlzSWRlbnRpZmllclBhcnQoY29kZTogbnVtYmVyKSB7XG4gIC8vIElkZW50aWZpZXJzIGNvbnNpc3Qgb2YgYWxwaGFudW1lcmljIGNoYXJhY3RlcnMsICdfJywgb3IgJyQnLlxuICByZXR1cm4gaXNBc2NpaUxldHRlcihjb2RlKSB8fCBpc0RpZ2l0KGNvZGUpIHx8IGNvZGUgPT0gJCQgfHwgY29kZSA9PSAkXztcbn1cblxuLyoqXG4gKiBHZXRzIHRoZSBzcGFuIG9mIHdvcmQgaW4gYSB0ZW1wbGF0ZSB0aGF0IHN1cnJvdW5kcyBgcG9zaXRpb25gLiBJZiB0aGVyZSBpcyBubyB3b3JkIGFyb3VuZFxuICogYHBvc2l0aW9uYCwgbm90aGluZyBpcyByZXR1cm5lZC5cbiAqL1xuZnVuY3Rpb24gZ2V0Qm91bmRlZFdvcmRTcGFuKHRlbXBsYXRlSW5mbzogQXN0UmVzdWx0LCBwb3NpdGlvbjogbnVtYmVyKTogdHMuVGV4dFNwYW58dW5kZWZpbmVkIHtcbiAgY29uc3Qge3RlbXBsYXRlfSA9IHRlbXBsYXRlSW5mbztcbiAgY29uc3QgdGVtcGxhdGVTcmMgPSB0ZW1wbGF0ZS5zb3VyY2U7XG5cbiAgaWYgKCF0ZW1wbGF0ZVNyYykgcmV0dXJuO1xuXG4gIC8vIFRPRE8oYXlhemhhZml6KTogQSBzb2x1dGlvbiBiYXNlZCBvbiB3b3JkIGV4cGFuc2lvbiB3aWxsIGFsd2F5cyBiZSBleHBlbnNpdmUgY29tcGFyZWQgdG8gb25lXG4gIC8vIGJhc2VkIG9uIEFTVHMuIFdoYXRldmVyIHBlbmFsdHkgd2UgaW5jdXIgaXMgcHJvYmFibHkgbWFuYWdlYWJsZSBmb3Igc21hbGwtbGVuZ3RoIChpLmUuIHRoZVxuICAvLyBtYWpvcml0eSBvZikgaWRlbnRpZmllcnMsIGJ1dCB0aGUgY3VycmVudCBzb2x1dGlvbiBpbnZvbGVzIGEgbnVtYmVyIG9mIGJyYW5jaGluZ3MgYW5kIHdlIGNhbid0XG4gIC8vIGNvbnRyb2wgcG90ZW50aWFsbHkgdmVyeSBsb25nIGlkZW50aWZpZXJzLiBDb25zaWRlciBtb3ZpbmcgdG8gYW4gQVNULWJhc2VkIHNvbHV0aW9uIG9uY2VcbiAgLy8gZXhpc3RpbmcgZGlmZmljdWx0aWVzIHdpdGggQVNUIHNwYW5zIGFyZSBtb3JlIGNsZWFybHkgcmVzb2x2ZWQgKHNlZSAjMzE4OTggZm9yIGRpc2N1c3Npb24gb2ZcbiAgLy8ga25vd24gcHJvYmxlbXMsIGFuZCAjMzMwOTEgZm9yIGhvdyB0aGV5IGFmZmVjdCB0ZXh0IHJlcGxhY2VtZW50KS5cbiAgLy9cbiAgLy8gYHRlbXBsYXRlUG9zaXRpb25gIHJlcHJlc2VudHMgdGhlIHJpZ2h0LWJvdW5kIGxvY2F0aW9uIG9mIGEgY3Vyc29yIGluIHRoZSB0ZW1wbGF0ZS5cbiAgLy8gICAga2V5LmVudHxyeVxuICAvLyAgICAgICAgICAgXi0tLS0gY3Vyc29yLCBhdCBwb3NpdGlvbiBgcmAgaXMgYXQuXG4gIC8vIEEgY3Vyc29yIGlzIG5vdCBpdHNlbGYgYSBjaGFyYWN0ZXIgaW4gdGhlIHRlbXBsYXRlOyBpdCBoYXMgYSBsZWZ0IChsb3dlcikgYW5kIHJpZ2h0ICh1cHBlcilcbiAgLy8gaW5kZXggYm91bmQgdGhhdCBodWdzIHRoZSBjdXJzb3IgaXRzZWxmLlxuICBsZXQgdGVtcGxhdGVQb3NpdGlvbiA9IHBvc2l0aW9uIC0gdGVtcGxhdGUuc3Bhbi5zdGFydDtcbiAgLy8gVG8gcGVyZm9ybSB3b3JkIGV4cGFuc2lvbiwgd2Ugd2FudCB0byBkZXRlcm1pbmUgdGhlIGxlZnQgYW5kIHJpZ2h0IGluZGljZXMgdGhhdCBodWcgdGhlIGN1cnNvci5cbiAgLy8gVGhlcmUgYXJlIHRocmVlIGNhc2VzIGhlcmUuXG4gIGxldCBsZWZ0LCByaWdodDtcbiAgaWYgKHRlbXBsYXRlUG9zaXRpb24gPT09IDApIHtcbiAgICAvLyAxLiBDYXNlIGxpa2VcbiAgICAvLyAgICAgIHxyZXN0IG9mIHRlbXBsYXRlXG4gICAgLy8gICAgdGhlIGN1cnNvciBpcyBhdCB0aGUgc3RhcnQgb2YgdGhlIHRlbXBsYXRlLCBodWdnZWQgb25seSBieSB0aGUgcmlnaHQgc2lkZSAoMC1pbmRleCkuXG4gICAgbGVmdCA9IHJpZ2h0ID0gMDtcbiAgfSBlbHNlIGlmICh0ZW1wbGF0ZVBvc2l0aW9uID09PSB0ZW1wbGF0ZVNyYy5sZW5ndGgpIHtcbiAgICAvLyAyLiBDYXNlIGxpa2VcbiAgICAvLyAgICAgIHJlc3Qgb2YgdGVtcGxhdGV8XG4gICAgLy8gICAgdGhlIGN1cnNvciBpcyBhdCB0aGUgZW5kIG9mIHRoZSB0ZW1wbGF0ZSwgaHVnZ2VkIG9ubHkgYnkgdGhlIGxlZnQgc2lkZSAobGFzdC1pbmRleCkuXG4gICAgbGVmdCA9IHJpZ2h0ID0gdGVtcGxhdGVTcmMubGVuZ3RoIC0gMTtcbiAgfSBlbHNlIHtcbiAgICAvLyAzLiBDYXNlIGxpa2VcbiAgICAvLyAgICAgIHdvfHJkXG4gICAgLy8gICAgdGhlcmUgaXMgYSBjbGVhciBsZWZ0IGFuZCByaWdodCBpbmRleC5cbiAgICBsZWZ0ID0gdGVtcGxhdGVQb3NpdGlvbiAtIDE7XG4gICAgcmlnaHQgPSB0ZW1wbGF0ZVBvc2l0aW9uO1xuICB9XG5cbiAgaWYgKCFpc0lkZW50aWZpZXJQYXJ0KHRlbXBsYXRlU3JjLmNoYXJDb2RlQXQobGVmdCkpICYmXG4gICAgICAhaXNJZGVudGlmaWVyUGFydCh0ZW1wbGF0ZVNyYy5jaGFyQ29kZUF0KHJpZ2h0KSkpIHtcbiAgICAvLyBDYXNlIGxpa2VcbiAgICAvLyAgICAgICAgIC58LlxuICAgIC8vIGxlZnQgLS0tXiBeLS0tIHJpZ2h0XG4gICAgLy8gVGhlcmUgaXMgbm8gd29yZCBoZXJlLlxuICAgIHJldHVybjtcbiAgfVxuXG4gIC8vIEV4cGFuZCBvbiB0aGUgbGVmdCBhbmQgcmlnaHQgc2lkZSB1bnRpbCBhIHdvcmQgYm91bmRhcnkgaXMgaGl0LiBCYWNrIHVwIG9uZSBleHBhbnNpb24gb24gYm90aFxuICAvLyBzaWRlIHRvIHN0YXkgaW5zaWRlIHRoZSB3b3JkLlxuICB3aGlsZSAobGVmdCA+PSAwICYmIGlzSWRlbnRpZmllclBhcnQodGVtcGxhdGVTcmMuY2hhckNvZGVBdChsZWZ0KSkpIC0tbGVmdDtcbiAgKytsZWZ0O1xuICB3aGlsZSAocmlnaHQgPCB0ZW1wbGF0ZVNyYy5sZW5ndGggJiYgaXNJZGVudGlmaWVyUGFydCh0ZW1wbGF0ZVNyYy5jaGFyQ29kZUF0KHJpZ2h0KSkpICsrcmlnaHQ7XG4gIC0tcmlnaHQ7XG5cbiAgY29uc3QgYWJzb2x1dGVTdGFydFBvc2l0aW9uID0gcG9zaXRpb24gLSAodGVtcGxhdGVQb3NpdGlvbiAtIGxlZnQpO1xuICBjb25zdCBsZW5ndGggPSByaWdodCAtIGxlZnQgKyAxO1xuICByZXR1cm4ge3N0YXJ0OiBhYnNvbHV0ZVN0YXJ0UG9zaXRpb24sIGxlbmd0aH07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRUZW1wbGF0ZUNvbXBsZXRpb25zKFxuICAgIHRlbXBsYXRlSW5mbzogQXN0UmVzdWx0LCBwb3NpdGlvbjogbnVtYmVyKTogbmcuQ29tcGxldGlvbkVudHJ5W10ge1xuICBsZXQgcmVzdWx0OiBuZy5Db21wbGV0aW9uRW50cnlbXSA9IFtdO1xuICBjb25zdCB7aHRtbEFzdCwgdGVtcGxhdGV9ID0gdGVtcGxhdGVJbmZvO1xuICAvLyBUaGUgdGVtcGxhdGVOb2RlIHN0YXJ0cyBhdCB0aGUgZGVsaW1pdGVyIGNoYXJhY3RlciBzbyB3ZSBhZGQgMSB0byBza2lwIGl0LlxuICBjb25zdCB0ZW1wbGF0ZVBvc2l0aW9uID0gcG9zaXRpb24gLSB0ZW1wbGF0ZS5zcGFuLnN0YXJ0O1xuICBjb25zdCBwYXRoID0gZ2V0UGF0aFRvTm9kZUF0UG9zaXRpb24oaHRtbEFzdCwgdGVtcGxhdGVQb3NpdGlvbik7XG4gIGNvbnN0IG1vc3RTcGVjaWZpYyA9IHBhdGgudGFpbDtcbiAgaWYgKHBhdGguZW1wdHkgfHwgIW1vc3RTcGVjaWZpYykge1xuICAgIHJlc3VsdCA9IGVsZW1lbnRDb21wbGV0aW9ucyh0ZW1wbGF0ZUluZm8pO1xuICB9IGVsc2Uge1xuICAgIGNvbnN0IGFzdFBvc2l0aW9uID0gdGVtcGxhdGVQb3NpdGlvbiAtIG1vc3RTcGVjaWZpYy5zb3VyY2VTcGFuLnN0YXJ0Lm9mZnNldDtcbiAgICBtb3N0U3BlY2lmaWMudmlzaXQoXG4gICAgICAgIHtcbiAgICAgICAgICB2aXNpdEVsZW1lbnQoYXN0KSB7XG4gICAgICAgICAgICBjb25zdCBzdGFydFRhZ1NwYW4gPSBzcGFuT2YoYXN0LnNvdXJjZVNwYW4pO1xuICAgICAgICAgICAgY29uc3QgdGFnTGVuID0gYXN0Lm5hbWUubGVuZ3RoO1xuICAgICAgICAgICAgLy8gKyAxIGZvciB0aGUgb3BlbmluZyBhbmdsZSBicmFja2V0XG4gICAgICAgICAgICBpZiAodGVtcGxhdGVQb3NpdGlvbiA8PSBzdGFydFRhZ1NwYW4uc3RhcnQgKyB0YWdMZW4gKyAxKSB7XG4gICAgICAgICAgICAgIC8vIElmIHdlIGFyZSBpbiB0aGUgdGFnIHRoZW4gcmV0dXJuIHRoZSBlbGVtZW50IGNvbXBsZXRpb25zLlxuICAgICAgICAgICAgICByZXN1bHQgPSBlbGVtZW50Q29tcGxldGlvbnModGVtcGxhdGVJbmZvKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodGVtcGxhdGVQb3NpdGlvbiA8IHN0YXJ0VGFnU3Bhbi5lbmQpIHtcbiAgICAgICAgICAgICAgLy8gV2UgYXJlIGluIHRoZSBhdHRyaWJ1dGUgc2VjdGlvbiBvZiB0aGUgZWxlbWVudCAoYnV0IG5vdCBpbiBhbiBhdHRyaWJ1dGUpLlxuICAgICAgICAgICAgICAvLyBSZXR1cm4gdGhlIGF0dHJpYnV0ZSBjb21wbGV0aW9ucy5cbiAgICAgICAgICAgICAgcmVzdWx0ID0gYXR0cmlidXRlQ29tcGxldGlvbnNGb3JFbGVtZW50KHRlbXBsYXRlSW5mbywgYXN0Lm5hbWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0sXG4gICAgICAgICAgdmlzaXRBdHRyaWJ1dGUoYXN0OiBBdHRyaWJ1dGUpIHtcbiAgICAgICAgICAgIC8vIEFuIGF0dHJpYnV0ZSBjb25zaXN0cyBvZiB0d28gcGFydHMsIExIUz1cIlJIU1wiLlxuICAgICAgICAgICAgLy8gRGV0ZXJtaW5lIGlmIGNvbXBsZXRpb25zIGFyZSByZXF1ZXN0ZWQgZm9yIExIUyBvciBSSFNcbiAgICAgICAgICAgIGlmIChhc3QudmFsdWVTcGFuICYmIGluU3Bhbih0ZW1wbGF0ZVBvc2l0aW9uLCBzcGFuT2YoYXN0LnZhbHVlU3BhbikpKSB7XG4gICAgICAgICAgICAgIC8vIFJIUyBjb21wbGV0aW9uXG4gICAgICAgICAgICAgIHJlc3VsdCA9IGF0dHJpYnV0ZVZhbHVlQ29tcGxldGlvbnModGVtcGxhdGVJbmZvLCBwYXRoKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIC8vIExIUyBjb21wbGV0aW9uXG4gICAgICAgICAgICAgIHJlc3VsdCA9IGF0dHJpYnV0ZUNvbXBsZXRpb25zKHRlbXBsYXRlSW5mbywgcGF0aCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSxcbiAgICAgICAgICB2aXNpdFRleHQoYXN0KSB7XG4gICAgICAgICAgICAvLyBDaGVjayBpZiB3ZSBhcmUgaW4gYSBlbnRpdHkuXG4gICAgICAgICAgICByZXN1bHQgPSBlbnRpdHlDb21wbGV0aW9ucyhnZXRTb3VyY2VUZXh0KHRlbXBsYXRlLCBzcGFuT2YoYXN0KSksIGFzdFBvc2l0aW9uKTtcbiAgICAgICAgICAgIGlmIChyZXN1bHQubGVuZ3RoKSByZXR1cm4gcmVzdWx0O1xuICAgICAgICAgICAgcmVzdWx0ID0gaW50ZXJwb2xhdGlvbkNvbXBsZXRpb25zKHRlbXBsYXRlSW5mbywgdGVtcGxhdGVQb3NpdGlvbik7XG4gICAgICAgICAgICBpZiAocmVzdWx0Lmxlbmd0aCkgcmV0dXJuIHJlc3VsdDtcbiAgICAgICAgICAgIGNvbnN0IGVsZW1lbnQgPSBwYXRoLmZpcnN0KEVsZW1lbnQpO1xuICAgICAgICAgICAgaWYgKGVsZW1lbnQpIHtcbiAgICAgICAgICAgICAgY29uc3QgZGVmaW5pdGlvbiA9IGdldEh0bWxUYWdEZWZpbml0aW9uKGVsZW1lbnQubmFtZSk7XG4gICAgICAgICAgICAgIGlmIChkZWZpbml0aW9uLmNvbnRlbnRUeXBlID09PSBUYWdDb250ZW50VHlwZS5QQVJTQUJMRV9EQVRBKSB7XG4gICAgICAgICAgICAgICAgcmVzdWx0ID0gdm9pZEVsZW1lbnRBdHRyaWJ1dGVDb21wbGV0aW9ucyh0ZW1wbGF0ZUluZm8sIHBhdGgpO1xuICAgICAgICAgICAgICAgIGlmICghcmVzdWx0Lmxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgLy8gSWYgdGhlIGVsZW1lbnQgY2FuIGhvbGQgY29udGVudCwgc2hvdyBlbGVtZW50IGNvbXBsZXRpb25zLlxuICAgICAgICAgICAgICAgICAgcmVzdWx0ID0gZWxlbWVudENvbXBsZXRpb25zKHRlbXBsYXRlSW5mbyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAvLyBJZiBubyBlbGVtZW50IGNvbnRhaW5lciwgaW1wbGllcyBwYXJzYWJsZSBkYXRhIHNvIHNob3cgZWxlbWVudHMuXG4gICAgICAgICAgICAgIHJlc3VsdCA9IHZvaWRFbGVtZW50QXR0cmlidXRlQ29tcGxldGlvbnModGVtcGxhdGVJbmZvLCBwYXRoKTtcbiAgICAgICAgICAgICAgaWYgKCFyZXN1bHQubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgcmVzdWx0ID0gZWxlbWVudENvbXBsZXRpb25zKHRlbXBsYXRlSW5mbyk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9LFxuICAgICAgICAgIHZpc2l0Q29tbWVudCgpIHt9LFxuICAgICAgICAgIHZpc2l0RXhwYW5zaW9uKCkge30sXG4gICAgICAgICAgdmlzaXRFeHBhbnNpb25DYXNlKCkge31cbiAgICAgICAgfSxcbiAgICAgICAgbnVsbCk7XG4gIH1cblxuICBjb25zdCByZXBsYWNlbWVudFNwYW4gPSBnZXRCb3VuZGVkV29yZFNwYW4odGVtcGxhdGVJbmZvLCBwb3NpdGlvbik7XG4gIHJldHVybiByZXN1bHQubWFwKGVudHJ5ID0+IHtcbiAgICByZXR1cm4ge1xuICAgICAgICAuLi5lbnRyeSwgcmVwbGFjZW1lbnRTcGFuLFxuICAgIH07XG4gIH0pO1xufVxuXG5mdW5jdGlvbiBhdHRyaWJ1dGVDb21wbGV0aW9ucyhpbmZvOiBBc3RSZXN1bHQsIHBhdGg6IEFzdFBhdGg8SHRtbEFzdD4pOiBuZy5Db21wbGV0aW9uRW50cnlbXSB7XG4gIGNvbnN0IGF0dHIgPSBwYXRoLnRhaWw7XG4gIGNvbnN0IGVsZW0gPSBwYXRoLnBhcmVudE9mKGF0dHIpO1xuICBpZiAoIShhdHRyIGluc3RhbmNlb2YgQXR0cmlidXRlKSB8fCAhKGVsZW0gaW5zdGFuY2VvZiBFbGVtZW50KSkge1xuICAgIHJldHVybiBbXTtcbiAgfVxuXG4gIC8vIFRPRE86IENvbnNpZGVyIHBhcnNpbmcgdGhlIGF0dHJpbnV0ZSBuYW1lIHRvIGEgcHJvcGVyIEFTVCBpbnN0ZWFkIG9mXG4gIC8vIG1hdGNoaW5nIHVzaW5nIHJlZ2V4LiBUaGlzIGlzIGJlY2F1c2UgdGhlIHJlZ2V4cCB3b3VsZCBpbmNvcnJlY3RseSBpZGVudGlmeVxuICAvLyBiaW5kIHBhcnRzIGZvciBjYXNlcyBsaWtlIFsoKXxdXG4gIC8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXiBjdXJzb3IgaXMgaGVyZVxuICBjb25zdCBiaW5kUGFydHMgPSBhdHRyLm5hbWUubWF0Y2goQklORF9OQU1FX1JFR0VYUCk7XG4gIC8vIFRlbXBsYXRlUmVmIHN0YXJ0cyB3aXRoICcqJy4gU2VlIGh0dHBzOi8vYW5ndWxhci5pby9hcGkvY29yZS9UZW1wbGF0ZVJlZlxuICBjb25zdCBpc1RlbXBsYXRlUmVmID0gYXR0ci5uYW1lLnN0YXJ0c1dpdGgoJyonKTtcbiAgY29uc3QgaXNCaW5kaW5nID0gYmluZFBhcnRzICE9PSBudWxsIHx8IGlzVGVtcGxhdGVSZWY7XG5cbiAgaWYgKCFpc0JpbmRpbmcpIHtcbiAgICByZXR1cm4gYXR0cmlidXRlQ29tcGxldGlvbnNGb3JFbGVtZW50KGluZm8sIGVsZW0ubmFtZSk7XG4gIH1cblxuICBjb25zdCByZXN1bHRzOiBzdHJpbmdbXSA9IFtdO1xuICBjb25zdCBuZ0F0dHJzID0gYW5ndWxhckF0dHJpYnV0ZXMoaW5mbywgZWxlbS5uYW1lKTtcbiAgaWYgKCFiaW5kUGFydHMpIHtcbiAgICAvLyBJZiBiaW5kUGFydHMgaXMgbnVsbCB0aGVuIHRoaXMgbXVzdCBiZSBhIFRlbXBsYXRlUmVmLlxuICAgIHJlc3VsdHMucHVzaCguLi5uZ0F0dHJzLnRlbXBsYXRlUmVmcyk7XG4gIH0gZWxzZSBpZiAoXG4gICAgICBiaW5kUGFydHNbQVRUUi5LV19CSU5EX0lEWF0gIT09IHVuZGVmaW5lZCB8fFxuICAgICAgYmluZFBhcnRzW0FUVFIuSURFTlRfUFJPUEVSVFlfSURYXSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgLy8gcHJvcGVydHkgYmluZGluZyB2aWEgYmluZC0gb3IgW11cbiAgICByZXN1bHRzLnB1c2goLi4ucHJvcGVydHlOYW1lcyhlbGVtLm5hbWUpLCAuLi5uZ0F0dHJzLmlucHV0cyk7XG4gIH0gZWxzZSBpZiAoXG4gICAgICBiaW5kUGFydHNbQVRUUi5LV19PTl9JRFhdICE9PSB1bmRlZmluZWQgfHwgYmluZFBhcnRzW0FUVFIuSURFTlRfRVZFTlRfSURYXSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgLy8gZXZlbnQgYmluZGluZyB2aWEgb24tIG9yICgpXG4gICAgcmVzdWx0cy5wdXNoKC4uLmV2ZW50TmFtZXMoZWxlbS5uYW1lKSwgLi4ubmdBdHRycy5vdXRwdXRzKTtcbiAgfSBlbHNlIGlmIChcbiAgICAgIGJpbmRQYXJ0c1tBVFRSLktXX0JJTkRPTl9JRFhdICE9PSB1bmRlZmluZWQgfHxcbiAgICAgIGJpbmRQYXJ0c1tBVFRSLklERU5UX0JBTkFOQV9CT1hfSURYXSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgLy8gYmFuYW5hLWluLWEtYm94IGJpbmRpbmcgdmlhIGJpbmRvbi0gb3IgWygpXVxuICAgIHJlc3VsdHMucHVzaCguLi5uZ0F0dHJzLmJhbmFuYXMpO1xuICB9XG4gIHJldHVybiByZXN1bHRzLm1hcChuYW1lID0+IHtcbiAgICByZXR1cm4ge1xuICAgICAgbmFtZSxcbiAgICAgIGtpbmQ6IG5nLkNvbXBsZXRpb25LaW5kLkFUVFJJQlVURSxcbiAgICAgIHNvcnRUZXh0OiBuYW1lLFxuICAgIH07XG4gIH0pO1xufVxuXG5mdW5jdGlvbiBhdHRyaWJ1dGVDb21wbGV0aW9uc0ZvckVsZW1lbnQoXG4gICAgaW5mbzogQXN0UmVzdWx0LCBlbGVtZW50TmFtZTogc3RyaW5nKTogbmcuQ29tcGxldGlvbkVudHJ5W10ge1xuICBjb25zdCByZXN1bHRzOiBuZy5Db21wbGV0aW9uRW50cnlbXSA9IFtdO1xuXG4gIGlmIChpbmZvLnRlbXBsYXRlIGluc3RhbmNlb2YgSW5saW5lVGVtcGxhdGUpIHtcbiAgICAvLyBQcm92aWRlIEhUTUwgYXR0cmlidXRlcyBjb21wbGV0aW9uIG9ubHkgZm9yIGlubGluZSB0ZW1wbGF0ZXNcbiAgICBmb3IgKGNvbnN0IG5hbWUgb2YgYXR0cmlidXRlTmFtZXMoZWxlbWVudE5hbWUpKSB7XG4gICAgICByZXN1bHRzLnB1c2goe1xuICAgICAgICBuYW1lLFxuICAgICAgICBraW5kOiBuZy5Db21wbGV0aW9uS2luZC5IVE1MX0FUVFJJQlVURSxcbiAgICAgICAgc29ydFRleHQ6IG5hbWUsXG4gICAgICB9KTtcbiAgICB9XG4gIH1cblxuICAvLyBBZGQgQW5ndWxhciBhdHRyaWJ1dGVzXG4gIGNvbnN0IG5nQXR0cnMgPSBhbmd1bGFyQXR0cmlidXRlcyhpbmZvLCBlbGVtZW50TmFtZSk7XG4gIGZvciAoY29uc3QgbmFtZSBvZiBuZ0F0dHJzLm90aGVycykge1xuICAgIHJlc3VsdHMucHVzaCh7XG4gICAgICBuYW1lLFxuICAgICAga2luZDogbmcuQ29tcGxldGlvbktpbmQuQVRUUklCVVRFLFxuICAgICAgc29ydFRleHQ6IG5hbWUsXG4gICAgfSk7XG4gIH1cblxuICByZXR1cm4gcmVzdWx0cztcbn1cblxuLyoqXG4gKiBQcm92aWRlIGNvbXBsZXRpb25zIHRvIHRoZSBSSFMgb2YgYW4gYXR0cmlidXRlLCB3aGljaCBpcyBvZiB0aGUgZm9ybVxuICogTEhTPVwiUkhTXCIuIFRoZSB0ZW1wbGF0ZSBwYXRoIGlzIGNvbXB1dGVkIGZyb20gdGhlIHNwZWNpZmllZCBgaW5mb2Agd2hlcmVhc1xuICogdGhlIGNvbnRleHQgaXMgZGV0ZXJtaW5lZCBmcm9tIHRoZSBzcGVjaWZpZWQgYGh0bWxQYXRoYC5cbiAqIEBwYXJhbSBpbmZvIE9iamVjdCB0aGF0IGNvbnRhaW5zIHRoZSB0ZW1wbGF0ZSBBU1RcbiAqIEBwYXJhbSBodG1sUGF0aCBQYXRoIHRvIHRoZSBIVE1MIG5vZGVcbiAqL1xuZnVuY3Rpb24gYXR0cmlidXRlVmFsdWVDb21wbGV0aW9ucyhpbmZvOiBBc3RSZXN1bHQsIGh0bWxQYXRoOiBIdG1sQXN0UGF0aCk6IG5nLkNvbXBsZXRpb25FbnRyeVtdIHtcbiAgLy8gRmluZCB0aGUgY29ycmVzcG9uZGluZyBUZW1wbGF0ZSBBU1QgcGF0aC5cbiAgY29uc3QgdGVtcGxhdGVQYXRoID0gZmluZFRlbXBsYXRlQXN0QXQoaW5mby50ZW1wbGF0ZUFzdCwgaHRtbFBhdGgucG9zaXRpb24pO1xuICBjb25zdCB2aXNpdG9yID0gbmV3IEV4cHJlc3Npb25WaXNpdG9yKGluZm8sIGh0bWxQYXRoLnBvc2l0aW9uLCAoKSA9PiB7XG4gICAgY29uc3QgZGluZm8gPSBkaWFnbm9zdGljSW5mb0Zyb21UZW1wbGF0ZUluZm8oaW5mbyk7XG4gICAgcmV0dXJuIGdldEV4cHJlc3Npb25TY29wZShkaW5mbywgdGVtcGxhdGVQYXRoKTtcbiAgfSk7XG4gIGlmICh0ZW1wbGF0ZVBhdGgudGFpbCBpbnN0YW5jZW9mIEF0dHJBc3QgfHxcbiAgICAgIHRlbXBsYXRlUGF0aC50YWlsIGluc3RhbmNlb2YgQm91bmRFbGVtZW50UHJvcGVydHlBc3QgfHxcbiAgICAgIHRlbXBsYXRlUGF0aC50YWlsIGluc3RhbmNlb2YgQm91bmRFdmVudEFzdCkge1xuICAgIHRlbXBsYXRlUGF0aC50YWlsLnZpc2l0KHZpc2l0b3IsIG51bGwpO1xuICAgIHJldHVybiB2aXNpdG9yLnJlc3VsdHM7XG4gIH1cbiAgLy8gSW4gb3JkZXIgdG8gcHJvdmlkZSBhY2N1cmF0ZSBhdHRyaWJ1dGUgdmFsdWUgY29tcGxldGlvbiwgd2UgbmVlZCB0byBrbm93XG4gIC8vIHdoYXQgdGhlIExIUyBpcywgYW5kIGNvbnN0cnVjdCB0aGUgcHJvcGVyIEFTVCBpZiBpdCBpcyBtaXNzaW5nLlxuICBjb25zdCBodG1sQXR0ciA9IGh0bWxQYXRoLnRhaWwgYXMgQXR0cmlidXRlO1xuICBjb25zdCBiaW5kUGFydHMgPSBodG1sQXR0ci5uYW1lLm1hdGNoKEJJTkRfTkFNRV9SRUdFWFApO1xuICBpZiAoYmluZFBhcnRzICYmIGJpbmRQYXJ0c1tBVFRSLktXX1JFRl9JRFhdICE9PSB1bmRlZmluZWQpIHtcbiAgICBsZXQgcmVmQXN0OiBSZWZlcmVuY2VBc3R8dW5kZWZpbmVkO1xuICAgIGxldCBlbGVtQXN0OiBFbGVtZW50QXN0fHVuZGVmaW5lZDtcbiAgICBpZiAodGVtcGxhdGVQYXRoLnRhaWwgaW5zdGFuY2VvZiBSZWZlcmVuY2VBc3QpIHtcbiAgICAgIHJlZkFzdCA9IHRlbXBsYXRlUGF0aC50YWlsO1xuICAgICAgY29uc3QgcGFyZW50ID0gdGVtcGxhdGVQYXRoLnBhcmVudE9mKHJlZkFzdCk7XG4gICAgICBpZiAocGFyZW50IGluc3RhbmNlb2YgRWxlbWVudEFzdCkge1xuICAgICAgICBlbGVtQXN0ID0gcGFyZW50O1xuICAgICAgfVxuICAgIH0gZWxzZSBpZiAodGVtcGxhdGVQYXRoLnRhaWwgaW5zdGFuY2VvZiBFbGVtZW50QXN0KSB7XG4gICAgICByZWZBc3QgPSBuZXcgUmVmZXJlbmNlQXN0KGh0bWxBdHRyLm5hbWUsIG51bGwgISwgaHRtbEF0dHIudmFsdWUsIGh0bWxBdHRyLnZhbHVlU3BhbiAhKTtcbiAgICAgIGVsZW1Bc3QgPSB0ZW1wbGF0ZVBhdGgudGFpbDtcbiAgICB9XG4gICAgaWYgKHJlZkFzdCAmJiBlbGVtQXN0KSB7XG4gICAgICByZWZBc3QudmlzaXQodmlzaXRvciwgZWxlbUFzdCk7XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIC8vIEh0bWxBc3QgY29udGFpbnMgdGhlIGBBdHRyaWJ1dGVgIG5vZGUsIGhvd2V2ZXIgdGhlIGNvcnJlc3BvbmRpbmcgYEF0dHJBc3RgXG4gICAgLy8gbm9kZSBpcyBtaXNzaW5nIGZyb20gdGhlIFRlbXBsYXRlQXN0LlxuICAgIGNvbnN0IGF0dHJBc3QgPSBuZXcgQXR0ckFzdChodG1sQXR0ci5uYW1lLCBodG1sQXR0ci52YWx1ZSwgaHRtbEF0dHIudmFsdWVTcGFuICEpO1xuICAgIGF0dHJBc3QudmlzaXQodmlzaXRvciwgbnVsbCk7XG4gIH1cbiAgcmV0dXJuIHZpc2l0b3IucmVzdWx0cztcbn1cblxuZnVuY3Rpb24gZWxlbWVudENvbXBsZXRpb25zKGluZm86IEFzdFJlc3VsdCk6IG5nLkNvbXBsZXRpb25FbnRyeVtdIHtcbiAgY29uc3QgcmVzdWx0czogbmcuQ29tcGxldGlvbkVudHJ5W10gPSBbLi4uQU5HVUxBUl9FTEVNRU5UU107XG5cbiAgaWYgKGluZm8udGVtcGxhdGUgaW5zdGFuY2VvZiBJbmxpbmVUZW1wbGF0ZSkge1xuICAgIC8vIFByb3ZpZGUgSFRNTCBlbGVtZW50cyBjb21wbGV0aW9uIG9ubHkgZm9yIGlubGluZSB0ZW1wbGF0ZXNcbiAgICByZXN1bHRzLnB1c2goLi4uSFRNTF9FTEVNRU5UUyk7XG4gIH1cblxuICAvLyBDb2xsZWN0IHRoZSBlbGVtZW50cyByZWZlcmVuY2VkIGJ5IHRoZSBzZWxlY3RvcnNcbiAgY29uc3QgY29tcG9uZW50cyA9IG5ldyBTZXQ8c3RyaW5nPigpO1xuICBmb3IgKGNvbnN0IHNlbGVjdG9yIG9mIGdldFNlbGVjdG9ycyhpbmZvKS5zZWxlY3RvcnMpIHtcbiAgICBjb25zdCBuYW1lID0gc2VsZWN0b3IuZWxlbWVudDtcbiAgICBpZiAobmFtZSAmJiAhY29tcG9uZW50cy5oYXMobmFtZSkpIHtcbiAgICAgIGNvbXBvbmVudHMuYWRkKG5hbWUpO1xuICAgICAgcmVzdWx0cy5wdXNoKHtcbiAgICAgICAgbmFtZSxcbiAgICAgICAga2luZDogbmcuQ29tcGxldGlvbktpbmQuQ09NUE9ORU5ULFxuICAgICAgICBzb3J0VGV4dDogbmFtZSxcbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiByZXN1bHRzO1xufVxuXG5mdW5jdGlvbiBlbnRpdHlDb21wbGV0aW9ucyh2YWx1ZTogc3RyaW5nLCBwb3NpdGlvbjogbnVtYmVyKTogbmcuQ29tcGxldGlvbkVudHJ5W10ge1xuICAvLyBMb29rIGZvciBlbnRpdHkgY29tcGxldGlvbnNcbiAgY29uc3QgcmUgPSAvJltBLVphLXpdKjs/KD8hXFxkKS9nO1xuICBsZXQgZm91bmQ6IFJlZ0V4cEV4ZWNBcnJheXxudWxsO1xuICBsZXQgcmVzdWx0OiBuZy5Db21wbGV0aW9uRW50cnlbXSA9IFtdO1xuICB3aGlsZSAoZm91bmQgPSByZS5leGVjKHZhbHVlKSkge1xuICAgIGxldCBsZW4gPSBmb3VuZFswXS5sZW5ndGg7XG4gICAgaWYgKHBvc2l0aW9uID49IGZvdW5kLmluZGV4ICYmIHBvc2l0aW9uIDwgKGZvdW5kLmluZGV4ICsgbGVuKSkge1xuICAgICAgcmVzdWx0ID0gT2JqZWN0LmtleXMoTkFNRURfRU5USVRJRVMpLm1hcChuYW1lID0+IHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICBuYW1lOiBgJiR7bmFtZX07YCxcbiAgICAgICAgICBraW5kOiBuZy5Db21wbGV0aW9uS2luZC5FTlRJVFksXG4gICAgICAgICAgc29ydFRleHQ6IG5hbWUsXG4gICAgICAgIH07XG4gICAgICB9KTtcbiAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxuICByZXR1cm4gcmVzdWx0O1xufVxuXG5mdW5jdGlvbiBpbnRlcnBvbGF0aW9uQ29tcGxldGlvbnMoaW5mbzogQXN0UmVzdWx0LCBwb3NpdGlvbjogbnVtYmVyKTogbmcuQ29tcGxldGlvbkVudHJ5W10ge1xuICAvLyBMb29rIGZvciBhbiBpbnRlcnBvbGF0aW9uIGluIGF0IHRoZSBwb3NpdGlvbi5cbiAgY29uc3QgdGVtcGxhdGVQYXRoID0gZmluZFRlbXBsYXRlQXN0QXQoaW5mby50ZW1wbGF0ZUFzdCwgcG9zaXRpb24pO1xuICBpZiAoIXRlbXBsYXRlUGF0aC50YWlsKSB7XG4gICAgcmV0dXJuIFtdO1xuICB9XG4gIGNvbnN0IHZpc2l0b3IgPSBuZXcgRXhwcmVzc2lvblZpc2l0b3IoXG4gICAgICBpbmZvLCBwb3NpdGlvbiwgKCkgPT4gZ2V0RXhwcmVzc2lvblNjb3BlKGRpYWdub3N0aWNJbmZvRnJvbVRlbXBsYXRlSW5mbyhpbmZvKSwgdGVtcGxhdGVQYXRoKSk7XG4gIHRlbXBsYXRlUGF0aC50YWlsLnZpc2l0KHZpc2l0b3IsIG51bGwpO1xuICByZXR1cm4gdmlzaXRvci5yZXN1bHRzO1xufVxuXG4vLyBUaGVyZSBpcyBhIHNwZWNpYWwgY2FzZSBvZiBIVE1MIHdoZXJlIHRleHQgdGhhdCBjb250YWlucyBhIHVuY2xvc2VkIHRhZyBpcyB0cmVhdGVkIGFzXG4vLyB0ZXh0LiBGb3IgZXhhcGxlICc8aDE+IFNvbWUgPGEgdGV4dCA8L2gxPicgcHJvZHVjZXMgYSB0ZXh0IG5vZGVzIGluc2lkZSBvZiB0aGUgSDFcbi8vIGVsZW1lbnQgXCJTb21lIDxhIHRleHRcIi4gV2UsIGhvd2V2ZXIsIHdhbnQgdG8gdHJlYXQgdGhpcyBhcyBpZiB0aGUgdXNlciB3YXMgcmVxdWVzdGluZ1xuLy8gdGhlIGF0dHJpYnV0ZXMgb2YgYW4gXCJhXCIgZWxlbWVudCwgbm90IHJlcXVlc3RpbmcgY29tcGxldGlvbiBpbiB0aGUgYSB0ZXh0IGVsZW1lbnQuIFRoaXNcbi8vIGNvZGUgY2hlY2tzIGZvciB0aGlzIGNhc2UgYW5kIHJldHVybnMgZWxlbWVudCBjb21wbGV0aW9ucyBpZiBpdCBpcyBkZXRlY3RlZCBvciB1bmRlZmluZWRcbi8vIGlmIGl0IGlzIG5vdC5cbmZ1bmN0aW9uIHZvaWRFbGVtZW50QXR0cmlidXRlQ29tcGxldGlvbnMoXG4gICAgaW5mbzogQXN0UmVzdWx0LCBwYXRoOiBBc3RQYXRoPEh0bWxBc3Q+KTogbmcuQ29tcGxldGlvbkVudHJ5W10ge1xuICBjb25zdCB0YWlsID0gcGF0aC50YWlsO1xuICBpZiAodGFpbCBpbnN0YW5jZW9mIFRleHQpIHtcbiAgICBjb25zdCBtYXRjaCA9IHRhaWwudmFsdWUubWF0Y2goLzwoXFx3KFxcd3xcXGR8LSkqOik/KFxcdyhcXHd8XFxkfC0pKilcXHMvKTtcbiAgICAvLyBUaGUgcG9zaXRpb24gbXVzdCBiZSBhZnRlciB0aGUgbWF0Y2gsIG90aGVyd2lzZSB3ZSBhcmUgc3RpbGwgaW4gYSBwbGFjZSB3aGVyZSBlbGVtZW50c1xuICAgIC8vIGFyZSBleHBlY3RlZCAoc3VjaCBhcyBgPHxhYCBvciBgPGF8YDsgd2Ugb25seSB3YW50IGF0dHJpYnV0ZXMgZm9yIGA8YSB8YCBvciBhZnRlcikuXG4gICAgaWYgKG1hdGNoICYmXG4gICAgICAgIHBhdGgucG9zaXRpb24gPj0gKG1hdGNoLmluZGV4IHx8IDApICsgbWF0Y2hbMF0ubGVuZ3RoICsgdGFpbC5zb3VyY2VTcGFuLnN0YXJ0Lm9mZnNldCkge1xuICAgICAgcmV0dXJuIGF0dHJpYnV0ZUNvbXBsZXRpb25zRm9yRWxlbWVudChpbmZvLCBtYXRjaFszXSk7XG4gICAgfVxuICB9XG4gIHJldHVybiBbXTtcbn1cblxuY2xhc3MgRXhwcmVzc2lvblZpc2l0b3IgZXh0ZW5kcyBOdWxsVGVtcGxhdGVWaXNpdG9yIHtcbiAgcHJpdmF0ZSByZWFkb25seSBjb21wbGV0aW9ucyA9IG5ldyBNYXA8c3RyaW5nLCBuZy5Db21wbGV0aW9uRW50cnk+KCk7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgICBwcml2YXRlIHJlYWRvbmx5IGluZm86IEFzdFJlc3VsdCwgcHJpdmF0ZSByZWFkb25seSBwb3NpdGlvbjogbnVtYmVyLFxuICAgICAgcHJpdmF0ZSByZWFkb25seSBnZXRFeHByZXNzaW9uU2NvcGU6ICgpID0+IG5nLlN5bWJvbFRhYmxlKSB7XG4gICAgc3VwZXIoKTtcbiAgfVxuXG4gIGdldCByZXN1bHRzKCk6IG5nLkNvbXBsZXRpb25FbnRyeVtdIHsgcmV0dXJuIEFycmF5LmZyb20odGhpcy5jb21wbGV0aW9ucy52YWx1ZXMoKSk7IH1cblxuICB2aXNpdERpcmVjdGl2ZVByb3BlcnR5KGFzdDogQm91bmREaXJlY3RpdmVQcm9wZXJ0eUFzdCk6IHZvaWQge1xuICAgIHRoaXMucHJvY2Vzc0V4cHJlc3Npb25Db21wbGV0aW9ucyhhc3QudmFsdWUpO1xuICB9XG5cbiAgdmlzaXRFbGVtZW50UHJvcGVydHkoYXN0OiBCb3VuZEVsZW1lbnRQcm9wZXJ0eUFzdCk6IHZvaWQge1xuICAgIHRoaXMucHJvY2Vzc0V4cHJlc3Npb25Db21wbGV0aW9ucyhhc3QudmFsdWUpO1xuICB9XG5cbiAgdmlzaXRFdmVudChhc3Q6IEJvdW5kRXZlbnRBc3QpOiB2b2lkIHsgdGhpcy5wcm9jZXNzRXhwcmVzc2lvbkNvbXBsZXRpb25zKGFzdC5oYW5kbGVyKTsgfVxuXG4gIHZpc2l0RWxlbWVudCgpOiB2b2lkIHtcbiAgICAvLyBuby1vcCBmb3Igbm93XG4gIH1cblxuICB2aXNpdEF0dHIoYXN0OiBBdHRyQXN0KSB7XG4gICAgaWYgKGFzdC5uYW1lLnN0YXJ0c1dpdGgoJyonKSkge1xuICAgICAgLy8gVGhpcyBhIHRlbXBsYXRlIGJpbmRpbmcgZ2l2ZW4gYnkgbWljcm8gc3ludGF4IGV4cHJlc3Npb24uXG4gICAgICAvLyBGaXJzdCwgdmVyaWZ5IHRoZSBhdHRyaWJ1dGUgY29uc2lzdHMgb2Ygc29tZSBiaW5kaW5nIHdlIGNhbiBnaXZlIGNvbXBsZXRpb25zIGZvci5cbiAgICAgIGNvbnN0IHt0ZW1wbGF0ZUJpbmRpbmdzfSA9IHRoaXMuaW5mby5leHByZXNzaW9uUGFyc2VyLnBhcnNlVGVtcGxhdGVCaW5kaW5ncyhcbiAgICAgICAgICBhc3QubmFtZSwgYXN0LnZhbHVlLCBhc3Quc291cmNlU3Bhbi50b1N0cmluZygpLCBhc3Quc291cmNlU3Bhbi5zdGFydC5vZmZzZXQpO1xuICAgICAgLy8gRmluZCB3aGVyZSB0aGUgY3Vyc29yIGlzIHJlbGF0aXZlIHRvIHRoZSBzdGFydCBvZiB0aGUgYXR0cmlidXRlIHZhbHVlLlxuICAgICAgY29uc3QgdmFsdWVSZWxhdGl2ZVBvc2l0aW9uID0gdGhpcy5wb3NpdGlvbiAtIGFzdC5zb3VyY2VTcGFuLnN0YXJ0Lm9mZnNldDtcbiAgICAgIC8vIEZpbmQgdGhlIHRlbXBsYXRlIGJpbmRpbmcgdGhhdCBjb250YWlucyB0aGUgcG9zaXRpb24uXG4gICAgICBjb25zdCBiaW5kaW5nID0gdGVtcGxhdGVCaW5kaW5ncy5maW5kKGIgPT4gaW5TcGFuKHZhbHVlUmVsYXRpdmVQb3NpdGlvbiwgYi5zcGFuKSk7XG5cbiAgICAgIGlmICghYmluZGluZykge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIHRoaXMubWljcm9TeW50YXhJbkF0dHJpYnV0ZVZhbHVlKGFzdCwgYmluZGluZyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnN0IGV4cHJlc3Npb25Bc3QgPSB0aGlzLmluZm8uZXhwcmVzc2lvblBhcnNlci5wYXJzZUJpbmRpbmcoXG4gICAgICAgICAgYXN0LnZhbHVlLCBhc3Quc291cmNlU3Bhbi50b1N0cmluZygpLCBhc3Quc291cmNlU3Bhbi5zdGFydC5vZmZzZXQpO1xuICAgICAgdGhpcy5wcm9jZXNzRXhwcmVzc2lvbkNvbXBsZXRpb25zKGV4cHJlc3Npb25Bc3QpO1xuICAgIH1cbiAgfVxuXG4gIHZpc2l0UmVmZXJlbmNlKF9hc3Q6IFJlZmVyZW5jZUFzdCwgY29udGV4dDogRWxlbWVudEFzdCkge1xuICAgIGNvbnRleHQuZGlyZWN0aXZlcy5mb3JFYWNoKGRpciA9PiB7XG4gICAgICBjb25zdCB7ZXhwb3J0QXN9ID0gZGlyLmRpcmVjdGl2ZTtcbiAgICAgIGlmIChleHBvcnRBcykge1xuICAgICAgICB0aGlzLmNvbXBsZXRpb25zLnNldChcbiAgICAgICAgICAgIGV4cG9ydEFzLCB7bmFtZTogZXhwb3J0QXMsIGtpbmQ6IG5nLkNvbXBsZXRpb25LaW5kLlJFRkVSRU5DRSwgc29ydFRleHQ6IGV4cG9ydEFzfSk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICB2aXNpdEJvdW5kVGV4dChhc3Q6IEJvdW5kVGV4dEFzdCkge1xuICAgIGlmIChpblNwYW4odGhpcy5wb3NpdGlvbiwgYXN0LnZhbHVlLnNvdXJjZVNwYW4pKSB7XG4gICAgICBjb25zdCBjb21wbGV0aW9ucyA9IGdldEV4cHJlc3Npb25Db21wbGV0aW9ucyhcbiAgICAgICAgICB0aGlzLmdldEV4cHJlc3Npb25TY29wZSgpLCBhc3QudmFsdWUsIHRoaXMucG9zaXRpb24sIHRoaXMuaW5mby50ZW1wbGF0ZS5xdWVyeSk7XG4gICAgICBpZiAoY29tcGxldGlvbnMpIHtcbiAgICAgICAgdGhpcy5hZGRTeW1ib2xzVG9Db21wbGV0aW9ucyhjb21wbGV0aW9ucyk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBwcm9jZXNzRXhwcmVzc2lvbkNvbXBsZXRpb25zKHZhbHVlOiBBU1QpIHtcbiAgICBjb25zdCBzeW1ib2xzID0gZ2V0RXhwcmVzc2lvbkNvbXBsZXRpb25zKFxuICAgICAgICB0aGlzLmdldEV4cHJlc3Npb25TY29wZSgpLCB2YWx1ZSwgdGhpcy5wb3NpdGlvbiwgdGhpcy5pbmZvLnRlbXBsYXRlLnF1ZXJ5KTtcbiAgICBpZiAoc3ltYm9scykge1xuICAgICAgdGhpcy5hZGRTeW1ib2xzVG9Db21wbGV0aW9ucyhzeW1ib2xzKTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIGFkZFN5bWJvbHNUb0NvbXBsZXRpb25zKHN5bWJvbHM6IG5nLlN5bWJvbFtdKSB7XG4gICAgZm9yIChjb25zdCBzIG9mIHN5bWJvbHMpIHtcbiAgICAgIGlmIChzLm5hbWUuc3RhcnRzV2l0aCgnX18nKSB8fCAhcy5wdWJsaWMgfHwgdGhpcy5jb21wbGV0aW9ucy5oYXMocy5uYW1lKSkge1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cblxuICAgICAgLy8gVGhlIHBpcGUgbWV0aG9kIHNob3VsZCBub3QgaW5jbHVkZSBwYXJlbnRoZXNlcy5cbiAgICAgIC8vIGUuZy4ge3sgdmFsdWVfZXhwcmVzc2lvbiB8IHNsaWNlIDogc3RhcnQgWyA6IGVuZCBdIH19XG4gICAgICBjb25zdCBzaG91bGRJbnNlcnRQYXJlbnRoZXNlcyA9IHMuY2FsbGFibGUgJiYgcy5raW5kICE9PSBuZy5Db21wbGV0aW9uS2luZC5QSVBFO1xuICAgICAgdGhpcy5jb21wbGV0aW9ucy5zZXQocy5uYW1lLCB7XG4gICAgICAgIG5hbWU6IHMubmFtZSxcbiAgICAgICAga2luZDogcy5raW5kIGFzIG5nLkNvbXBsZXRpb25LaW5kLFxuICAgICAgICBzb3J0VGV4dDogcy5uYW1lLFxuICAgICAgICBpbnNlcnRUZXh0OiBzaG91bGRJbnNlcnRQYXJlbnRoZXNlcyA/IGAke3MubmFtZX0oKWAgOiBzLm5hbWUsXG4gICAgICB9KTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogVGhpcyBtZXRob2QgaGFuZGxlcyB0aGUgY29tcGxldGlvbnMgb2YgYXR0cmlidXRlIHZhbHVlcyBmb3IgZGlyZWN0aXZlcyB0aGF0XG4gICAqIHN1cHBvcnQgdGhlIG1pY3Jvc3ludGF4IGZvcm1hdC4gRXhhbXBsZXMgYXJlICpuZ0ZvciBhbmQgKm5nSWYuXG4gICAqIFRoZXNlIGRpcmVjdGl2ZXMgYWxsb3dzIGRlY2xhcmF0aW9uIG9mIFwibGV0XCIgdmFyaWFibGVzLCBhZGRzIGNvbnRleHQtc3BlY2lmaWNcbiAgICogc3ltYm9scyBsaWtlICRpbXBsaWNpdCwgaW5kZXgsIGNvdW50LCBhbW9uZyBvdGhlciBiZWhhdmlvcnMuXG4gICAqIEZvciBhIGNvbXBsZXRlIGRlc2NyaXB0aW9uIG9mIHN1Y2ggZm9ybWF0LCBzZWVcbiAgICogaHR0cHM6Ly9hbmd1bGFyLmlvL2d1aWRlL3N0cnVjdHVyYWwtZGlyZWN0aXZlcyN0aGUtYXN0ZXJpc2stLXByZWZpeFxuICAgKlxuICAgKiBAcGFyYW0gYXR0ciBkZXNjcmlwdG9yIGZvciBhdHRyaWJ1dGUgbmFtZSBhbmQgdmFsdWUgcGFpclxuICAgKiBAcGFyYW0gYmluZGluZyB0ZW1wbGF0ZSBiaW5kaW5nIGZvciB0aGUgZXhwcmVzc2lvbiBpbiB0aGUgYXR0cmlidXRlXG4gICAqL1xuICBwcml2YXRlIG1pY3JvU3ludGF4SW5BdHRyaWJ1dGVWYWx1ZShhdHRyOiBBdHRyQXN0LCBiaW5kaW5nOiBUZW1wbGF0ZUJpbmRpbmcpIHtcbiAgICBjb25zdCBrZXkgPSBhdHRyLm5hbWUuc3Vic3RyaW5nKDEpOyAgLy8gcmVtb3ZlIGxlYWRpbmcgYXN0ZXJpc2tcblxuICAgIC8vIEZpbmQgdGhlIHNlbGVjdG9yIC0gZWcgbmdGb3IsIG5nSWYsIGV0Y1xuICAgIGNvbnN0IHNlbGVjdG9ySW5mbyA9IGdldFNlbGVjdG9ycyh0aGlzLmluZm8pO1xuICAgIGNvbnN0IHNlbGVjdG9yID0gc2VsZWN0b3JJbmZvLnNlbGVjdG9ycy5maW5kKHMgPT4ge1xuICAgICAgLy8gYXR0cmlidXRlcyBhcmUgbGlzdGVkIGluIChhdHRyaWJ1dGUsIHZhbHVlKSBwYWlyc1xuICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBzLmF0dHJzLmxlbmd0aDsgaSArPSAyKSB7XG4gICAgICAgIGlmIChzLmF0dHJzW2ldID09PSBrZXkpIHtcbiAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pO1xuXG4gICAgaWYgKCFzZWxlY3Rvcikge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IHZhbHVlUmVsYXRpdmVQb3NpdGlvbiA9IHRoaXMucG9zaXRpb24gLSBhdHRyLnNvdXJjZVNwYW4uc3RhcnQub2Zmc2V0O1xuXG4gICAgaWYgKGJpbmRpbmcua2V5SXNWYXIpIHtcbiAgICAgIGNvbnN0IGVxdWFsTG9jYXRpb24gPSBhdHRyLnZhbHVlLmluZGV4T2YoJz0nKTtcbiAgICAgIGlmIChlcXVhbExvY2F0aW9uID4gMCAmJiB2YWx1ZVJlbGF0aXZlUG9zaXRpb24gPiBlcXVhbExvY2F0aW9uKSB7XG4gICAgICAgIC8vIFdlIGFyZSBhZnRlciB0aGUgJz0nIGluIGEgbGV0IGNsYXVzZS4gVGhlIHZhbGlkIHZhbHVlcyBoZXJlIGFyZSB0aGUgbWVtYmVycyBvZiB0aGVcbiAgICAgICAgLy8gdGVtcGxhdGUgcmVmZXJlbmNlJ3MgdHlwZSBwYXJhbWV0ZXIuXG4gICAgICAgIGNvbnN0IGRpcmVjdGl2ZU1ldGFkYXRhID0gc2VsZWN0b3JJbmZvLm1hcC5nZXQoc2VsZWN0b3IpO1xuICAgICAgICBpZiAoZGlyZWN0aXZlTWV0YWRhdGEpIHtcbiAgICAgICAgICBjb25zdCBjb250ZXh0VGFibGUgPVxuICAgICAgICAgICAgICB0aGlzLmluZm8udGVtcGxhdGUucXVlcnkuZ2V0VGVtcGxhdGVDb250ZXh0KGRpcmVjdGl2ZU1ldGFkYXRhLnR5cGUucmVmZXJlbmNlKTtcbiAgICAgICAgICBpZiAoY29udGV4dFRhYmxlKSB7XG4gICAgICAgICAgICAvLyBUaGlzIGFkZHMgc3ltYm9scyBsaWtlICRpbXBsaWNpdCwgaW5kZXgsIGNvdW50LCBldGMuXG4gICAgICAgICAgICB0aGlzLmFkZFN5bWJvbHNUb0NvbXBsZXRpb25zKGNvbnRleHRUYWJsZS52YWx1ZXMoKSk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKGJpbmRpbmcuZXhwcmVzc2lvbiAmJiBpblNwYW4odmFsdWVSZWxhdGl2ZVBvc2l0aW9uLCBiaW5kaW5nLmV4cHJlc3Npb24uYXN0LnNwYW4pKSB7XG4gICAgICB0aGlzLnByb2Nlc3NFeHByZXNzaW9uQ29tcGxldGlvbnMoYmluZGluZy5leHByZXNzaW9uLmFzdCk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gSWYgdGhlIGV4cHJlc3Npb24gaXMgaW5jb21wbGV0ZSwgZm9yIGV4YW1wbGUgKm5nRm9yPVwibGV0IHggb2YgfFwiXG4gICAgLy8gYmluZGluZy5leHByZXNzaW9uIGlzIG51bGwuIFdlIGNvdWxkIHN0aWxsIHRyeSB0byBwcm92aWRlIHN1Z2dlc3Rpb25zXG4gICAgLy8gYnkgbG9va2luZyBmb3Igc3ltYm9scyB0aGF0IGFyZSBpbiBzY29wZS5cbiAgICBjb25zdCBLV19PRiA9ICcgb2YgJztcbiAgICBjb25zdCBvZkxvY2F0aW9uID0gYXR0ci52YWx1ZS5pbmRleE9mKEtXX09GKTtcbiAgICBpZiAob2ZMb2NhdGlvbiA+IDAgJiYgdmFsdWVSZWxhdGl2ZVBvc2l0aW9uID49IG9mTG9jYXRpb24gKyBLV19PRi5sZW5ndGgpIHtcbiAgICAgIGNvbnN0IGV4cHJlc3Npb25Bc3QgPSB0aGlzLmluZm8uZXhwcmVzc2lvblBhcnNlci5wYXJzZUJpbmRpbmcoXG4gICAgICAgICAgYXR0ci52YWx1ZSwgYXR0ci5zb3VyY2VTcGFuLnRvU3RyaW5nKCksIGF0dHIuc291cmNlU3Bhbi5zdGFydC5vZmZzZXQpO1xuICAgICAgdGhpcy5wcm9jZXNzRXhwcmVzc2lvbkNvbXBsZXRpb25zKGV4cHJlc3Npb25Bc3QpO1xuICAgIH1cbiAgfVxufVxuXG5mdW5jdGlvbiBnZXRTb3VyY2VUZXh0KHRlbXBsYXRlOiBuZy5UZW1wbGF0ZVNvdXJjZSwgc3BhbjogbmcuU3Bhbik6IHN0cmluZyB7XG4gIHJldHVybiB0ZW1wbGF0ZS5zb3VyY2Uuc3Vic3RyaW5nKHNwYW4uc3RhcnQsIHNwYW4uZW5kKTtcbn1cblxuaW50ZXJmYWNlIEFuZ3VsYXJBdHRyaWJ1dGVzIHtcbiAgLyoqXG4gICAqIEF0dHJpYnV0ZXMgdGhhdCBzdXBwb3J0IHRoZSAqIHN5bnRheC4gU2VlIGh0dHBzOi8vYW5ndWxhci5pby9hcGkvY29yZS9UZW1wbGF0ZVJlZlxuICAgKi9cbiAgdGVtcGxhdGVSZWZzOiBTZXQ8c3RyaW5nPjtcbiAgLyoqXG4gICAqIEF0dHJpYnV0ZXMgd2l0aCB0aGUgQElucHV0IGFubm90YXRpb24uXG4gICAqL1xuICBpbnB1dHM6IFNldDxzdHJpbmc+O1xuICAvKipcbiAgICogQXR0cmlidXRlcyB3aXRoIHRoZSBAT3V0cHV0IGFubm90YXRpb24uXG4gICAqL1xuICBvdXRwdXRzOiBTZXQ8c3RyaW5nPjtcbiAgLyoqXG4gICAqIEF0dHJpYnV0ZXMgdGhhdCBzdXBwb3J0IHRoZSBbKCldIG9yIGJpbmRvbi0gc3ludGF4LlxuICAgKi9cbiAgYmFuYW5hczogU2V0PHN0cmluZz47XG4gIC8qKlxuICAgKiBHZW5lcmFsIGF0dHJpYnV0ZXMgdGhhdCBtYXRjaCB0aGUgc3BlY2lmaWVkIGVsZW1lbnQuXG4gICAqL1xuICBvdGhlcnM6IFNldDxzdHJpbmc+O1xufVxuXG4vKipcbiAqIFJldHVybiBhbGwgQW5ndWxhci1zcGVjaWZpYyBhdHRyaWJ1dGVzIGZvciB0aGUgZWxlbWVudCB3aXRoIGBlbGVtZW50TmFtZWAuXG4gKiBAcGFyYW0gaW5mb1xuICogQHBhcmFtIGVsZW1lbnROYW1lXG4gKi9cbmZ1bmN0aW9uIGFuZ3VsYXJBdHRyaWJ1dGVzKGluZm86IEFzdFJlc3VsdCwgZWxlbWVudE5hbWU6IHN0cmluZyk6IEFuZ3VsYXJBdHRyaWJ1dGVzIHtcbiAgY29uc3Qge3NlbGVjdG9ycywgbWFwOiBzZWxlY3Rvck1hcH0gPSBnZXRTZWxlY3RvcnMoaW5mbyk7XG4gIGNvbnN0IHRlbXBsYXRlUmVmcyA9IG5ldyBTZXQ8c3RyaW5nPigpO1xuICBjb25zdCBpbnB1dHMgPSBuZXcgU2V0PHN0cmluZz4oKTtcbiAgY29uc3Qgb3V0cHV0cyA9IG5ldyBTZXQ8c3RyaW5nPigpO1xuICBjb25zdCBiYW5hbmFzID0gbmV3IFNldDxzdHJpbmc+KCk7XG4gIGNvbnN0IG90aGVycyA9IG5ldyBTZXQ8c3RyaW5nPigpO1xuICBmb3IgKGNvbnN0IHNlbGVjdG9yIG9mIHNlbGVjdG9ycykge1xuICAgIGlmIChzZWxlY3Rvci5lbGVtZW50ICYmIHNlbGVjdG9yLmVsZW1lbnQgIT09IGVsZW1lbnROYW1lKSB7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG4gICAgY29uc3Qgc3VtbWFyeSA9IHNlbGVjdG9yTWFwLmdldChzZWxlY3RvcikgITtcbiAgICBjb25zdCBpc1RlbXBsYXRlUmVmID0gaGFzVGVtcGxhdGVSZWZlcmVuY2Uoc3VtbWFyeS50eXBlKTtcbiAgICAvLyBhdHRyaWJ1dGVzIGFyZSBsaXN0ZWQgaW4gKGF0dHJpYnV0ZSwgdmFsdWUpIHBhaXJzXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBzZWxlY3Rvci5hdHRycy5sZW5ndGg7IGkgKz0gMikge1xuICAgICAgY29uc3QgYXR0ciA9IHNlbGVjdG9yLmF0dHJzW2ldO1xuICAgICAgaWYgKGlzVGVtcGxhdGVSZWYpIHtcbiAgICAgICAgdGVtcGxhdGVSZWZzLmFkZChhdHRyKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIG90aGVycy5hZGQoYXR0cik7XG4gICAgICB9XG4gICAgfVxuICAgIGZvciAoY29uc3QgaW5wdXQgb2YgT2JqZWN0LnZhbHVlcyhzdW1tYXJ5LmlucHV0cykpIHtcbiAgICAgIGlucHV0cy5hZGQoaW5wdXQpO1xuICAgIH1cbiAgICBmb3IgKGNvbnN0IG91dHB1dCBvZiBPYmplY3QudmFsdWVzKHN1bW1hcnkub3V0cHV0cykpIHtcbiAgICAgIG91dHB1dHMuYWRkKG91dHB1dCk7XG4gICAgfVxuICB9XG4gIGZvciAoY29uc3QgbmFtZSBvZiBpbnB1dHMpIHtcbiAgICAvLyBBZGQgYmFuYW5hLWluLWEtYm94IHN5bnRheFxuICAgIC8vIGh0dHBzOi8vYW5ndWxhci5pby9ndWlkZS90ZW1wbGF0ZS1zeW50YXgjdHdvLXdheS1iaW5kaW5nLVxuICAgIGlmIChvdXRwdXRzLmhhcyhgJHtuYW1lfUNoYW5nZWApKSB7XG4gICAgICBiYW5hbmFzLmFkZChuYW1lKTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHt0ZW1wbGF0ZVJlZnMsIGlucHV0cywgb3V0cHV0cywgYmFuYW5hcywgb3RoZXJzfTtcbn1cbiJdfQ==