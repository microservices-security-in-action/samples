(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/compiler-cli/src/ngtsc/indexer/src/template", ["require", "exports", "tslib", "@angular/compiler", "@angular/compiler-cli/src/ngtsc/indexer/src/api"], factory);
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
    var compiler_1 = require("@angular/compiler");
    var api_1 = require("@angular/compiler-cli/src/ngtsc/indexer/src/api");
    /**
     * Visits the AST of an Angular template syntax expression, finding interesting
     * entities (variable references, etc.). Creates an array of Entities found in
     * the expression, with the location of the Entities being relative to the
     * expression.
     *
     * Visiting `text {{prop}}` will return
     * `[TopLevelIdentifier {name: 'prop', span: {start: 7, end: 11}}]`.
     */
    var ExpressionVisitor = /** @class */ (function (_super) {
        tslib_1.__extends(ExpressionVisitor, _super);
        function ExpressionVisitor(expressionStr, absoluteOffset, boundTemplate, targetToIdentifier) {
            var _this = _super.call(this) || this;
            _this.expressionStr = expressionStr;
            _this.absoluteOffset = absoluteOffset;
            _this.boundTemplate = boundTemplate;
            _this.targetToIdentifier = targetToIdentifier;
            _this.identifiers = [];
            return _this;
        }
        /**
         * Returns identifiers discovered in an expression.
         *
         * @param ast expression AST to visit
         * @param source expression AST source code
         * @param absoluteOffset absolute byte offset from start of the file to the start of the AST
         * source code.
         * @param boundTemplate bound target of the entire template, which can be used to query for the
         * entities expressions target.
         * @param targetToIdentifier closure converting a template target node to its identifier.
         */
        ExpressionVisitor.getIdentifiers = function (ast, source, absoluteOffset, boundTemplate, targetToIdentifier) {
            var visitor = new ExpressionVisitor(source, absoluteOffset, boundTemplate, targetToIdentifier);
            visitor.visit(ast);
            return visitor.identifiers;
        };
        ExpressionVisitor.prototype.visit = function (ast) { ast.visit(this); };
        ExpressionVisitor.prototype.visitMethodCall = function (ast, context) {
            this.visitIdentifier(ast, api_1.IdentifierKind.Method);
            _super.prototype.visitMethodCall.call(this, ast, context);
        };
        ExpressionVisitor.prototype.visitPropertyRead = function (ast, context) {
            this.visitIdentifier(ast, api_1.IdentifierKind.Property);
            _super.prototype.visitPropertyRead.call(this, ast, context);
        };
        ExpressionVisitor.prototype.visitPropertyWrite = function (ast, context) {
            this.visitIdentifier(ast, api_1.IdentifierKind.Property);
            _super.prototype.visitPropertyWrite.call(this, ast, context);
        };
        /**
         * Visits an identifier, adding it to the identifier store if it is useful for indexing.
         *
         * @param ast expression AST the identifier is in
         * @param kind identifier kind
         */
        ExpressionVisitor.prototype.visitIdentifier = function (ast, kind) {
            // The definition of a non-top-level property such as `bar` in `{{foo.bar}}` is currently
            // impossible to determine by an indexer and unsupported by the indexing module.
            // The indexing module also does not currently support references to identifiers declared in the
            // template itself, which have a non-null expression target.
            if (!(ast.receiver instanceof compiler_1.ImplicitReceiver)) {
                return;
            }
            // Get the location of the identifier of real interest.
            // The compiler's expression parser records the location of some expressions in a manner not
            // useful to the indexer. For example, a `MethodCall` `foo(a, b)` will record the span of the
            // entire method call, but the indexer is interested only in the method identifier.
            var localExpression = this.expressionStr.substr(ast.span.start);
            if (!localExpression.includes(ast.name)) {
                throw new Error("Impossible state: \"" + ast.name + "\" not found in \"" + localExpression + "\"");
            }
            var identifierStart = ast.span.start + localExpression.indexOf(ast.name);
            // Join the relative position of the expression within a node with the absolute position
            // of the node to get the absolute position of the expression in the source code.
            var absoluteStart = this.absoluteOffset + identifierStart;
            var span = new api_1.AbsoluteSourceSpan(absoluteStart, absoluteStart + ast.name.length);
            var targetAst = this.boundTemplate.getExpressionTarget(ast);
            var target = targetAst ? this.targetToIdentifier(targetAst) : null;
            var identifier = {
                name: ast.name,
                span: span,
                kind: kind,
                target: target,
            };
            this.identifiers.push(identifier);
        };
        return ExpressionVisitor;
    }(compiler_1.RecursiveAstVisitor));
    /**
     * Visits the AST of a parsed Angular template. Discovers and stores
     * identifiers of interest, deferring to an `ExpressionVisitor` as needed.
     */
    var TemplateVisitor = /** @class */ (function (_super) {
        tslib_1.__extends(TemplateVisitor, _super);
        /**
         * Creates a template visitor for a bound template target. The bound target can be used when
         * deferred to the expression visitor to get information about the target of an expression.
         *
         * @param boundTemplate bound template target
         */
        function TemplateVisitor(boundTemplate) {
            var _this = _super.call(this) || this;
            _this.boundTemplate = boundTemplate;
            // Identifiers of interest found in the template.
            _this.identifiers = new Set();
            // Map of targets in a template to their identifiers.
            _this.targetIdentifierCache = new Map();
            // Map of elements and templates to their identifiers.
            _this.elementAndTemplateIdentifierCache = new Map();
            return _this;
        }
        /**
         * Visits a node in the template.
         *
         * @param node node to visit
         */
        TemplateVisitor.prototype.visit = function (node) { node.visit(this); };
        TemplateVisitor.prototype.visitAll = function (nodes) {
            var _this = this;
            nodes.forEach(function (node) { return _this.visit(node); });
        };
        /**
         * Add an identifier for an HTML element and visit its children recursively.
         *
         * @param element
         */
        TemplateVisitor.prototype.visitElement = function (element) {
            var elementIdentifier = this.elementOrTemplateToIdentifier(element);
            this.identifiers.add(elementIdentifier);
            this.visitAll(element.references);
            this.visitAll(element.inputs);
            this.visitAll(element.attributes);
            this.visitAll(element.children);
            this.visitAll(element.outputs);
        };
        TemplateVisitor.prototype.visitTemplate = function (template) {
            var templateIdentifier = this.elementOrTemplateToIdentifier(template);
            this.identifiers.add(templateIdentifier);
            this.visitAll(template.variables);
            this.visitAll(template.attributes);
            this.visitAll(template.templateAttrs);
            this.visitAll(template.children);
            this.visitAll(template.references);
        };
        TemplateVisitor.prototype.visitBoundAttribute = function (attribute) {
            var _this = this;
            // A BoundAttribute's value (the parent AST) may have subexpressions (children ASTs) that have
            // recorded spans extending past the recorded span of the parent. The most common example of
            // this is with `*ngFor`.
            // To resolve this, use the information on the BoundAttribute Template AST, which is always
            // correct, to determine locations of identifiers in the expression.
            //
            // TODO(ayazhafiz): Remove this when https://github.com/angular/angular/pull/31813 lands.
            var attributeSrc = attribute.sourceSpan.toString();
            var attributeAbsolutePosition = attribute.sourceSpan.start.offset;
            // Skip the bytes of the attribute name so that there are no collisions between the attribute
            // name and expression identifier names later.
            var nameSkipOffet = attributeSrc.indexOf(attribute.name) + attribute.name.length;
            var expressionSrc = attributeSrc.substring(nameSkipOffet);
            var expressionAbsolutePosition = attributeAbsolutePosition + nameSkipOffet;
            var identifiers = ExpressionVisitor.getIdentifiers(attribute.value, expressionSrc, expressionAbsolutePosition, this.boundTemplate, this.targetToIdentifier.bind(this));
            identifiers.forEach(function (id) { return _this.identifiers.add(id); });
        };
        TemplateVisitor.prototype.visitBoundEvent = function (attribute) { this.visitExpression(attribute.handler); };
        TemplateVisitor.prototype.visitBoundText = function (text) { this.visitExpression(text.value); };
        TemplateVisitor.prototype.visitReference = function (reference) {
            var referenceIdentifer = this.targetToIdentifier(reference);
            this.identifiers.add(referenceIdentifer);
        };
        TemplateVisitor.prototype.visitVariable = function (variable) {
            var variableIdentifier = this.targetToIdentifier(variable);
            this.identifiers.add(variableIdentifier);
        };
        /** Creates an identifier for a template element or template node. */
        TemplateVisitor.prototype.elementOrTemplateToIdentifier = function (node) {
            // If this node has already been seen, return the cached result.
            if (this.elementAndTemplateIdentifierCache.has(node)) {
                return this.elementAndTemplateIdentifierCache.get(node);
            }
            var name;
            var kind;
            if (node instanceof compiler_1.TmplAstTemplate) {
                name = node.tagName;
                kind = api_1.IdentifierKind.Template;
            }
            else {
                name = node.name;
                kind = api_1.IdentifierKind.Element;
            }
            var sourceSpan = node.sourceSpan;
            // An element's or template's source span can be of the form `<element>`, `<element />`, or
            // `<element></element>`. Only the selector is interesting to the indexer, so the source is
            // searched for the first occurrence of the element (selector) name.
            var start = this.getStartLocation(name, sourceSpan);
            var absoluteSpan = new api_1.AbsoluteSourceSpan(start, start + name.length);
            // Record the nodes's attributes, which an indexer can later traverse to see if any of them
            // specify a used directive on the node.
            var attributes = node.attributes.map(function (_a) {
                var name = _a.name, sourceSpan = _a.sourceSpan;
                return {
                    name: name,
                    span: new api_1.AbsoluteSourceSpan(sourceSpan.start.offset, sourceSpan.end.offset),
                    kind: api_1.IdentifierKind.Attribute,
                };
            });
            var usedDirectives = this.boundTemplate.getDirectivesOfNode(node) || [];
            var identifier = {
                name: name,
                span: absoluteSpan, kind: kind,
                attributes: new Set(attributes),
                usedDirectives: new Set(usedDirectives.map(function (dir) {
                    return {
                        node: dir.ref.node,
                        selector: dir.selector,
                    };
                })),
            };
            this.elementAndTemplateIdentifierCache.set(node, identifier);
            return identifier;
        };
        /** Creates an identifier for a template reference or template variable target. */
        TemplateVisitor.prototype.targetToIdentifier = function (node) {
            // If this node has already been seen, return the cached result.
            if (this.targetIdentifierCache.has(node)) {
                return this.targetIdentifierCache.get(node);
            }
            var name = node.name, sourceSpan = node.sourceSpan;
            var start = this.getStartLocation(name, sourceSpan);
            var span = new api_1.AbsoluteSourceSpan(start, start + name.length);
            var identifier;
            if (node instanceof compiler_1.TmplAstReference) {
                // If the node is a reference, we care about its target. The target can be an element, a
                // template, a directive applied on a template or element (in which case the directive field
                // is non-null), or nothing at all.
                var refTarget = this.boundTemplate.getReferenceTarget(node);
                var target = null;
                if (refTarget) {
                    if (refTarget instanceof compiler_1.TmplAstElement || refTarget instanceof compiler_1.TmplAstTemplate) {
                        target = {
                            node: this.elementOrTemplateToIdentifier(refTarget),
                            directive: null,
                        };
                    }
                    else {
                        target = {
                            node: this.elementOrTemplateToIdentifier(refTarget.node),
                            directive: refTarget.directive.ref.node,
                        };
                    }
                }
                identifier = {
                    name: name,
                    span: span,
                    kind: api_1.IdentifierKind.Reference, target: target,
                };
            }
            else {
                identifier = {
                    name: name,
                    span: span,
                    kind: api_1.IdentifierKind.Variable,
                };
            }
            this.targetIdentifierCache.set(node, identifier);
            return identifier;
        };
        /** Gets the start location of a string in a SourceSpan */
        TemplateVisitor.prototype.getStartLocation = function (name, context) {
            var localStr = context.toString();
            if (!localStr.includes(name)) {
                throw new Error("Impossible state: \"" + name + "\" not found in \"" + localStr + "\"");
            }
            return context.start.offset + localStr.indexOf(name);
        };
        /**
         * Visits a node's expression and adds its identifiers, if any, to the visitor's state.
         * Only ASTs with information about the expression source and its location are visited.
         *
         * @param node node whose expression to visit
         */
        TemplateVisitor.prototype.visitExpression = function (ast) {
            var _this = this;
            // Only include ASTs that have information about their source and absolute source spans.
            if (ast instanceof compiler_1.ASTWithSource && ast.source !== null) {
                // Make target to identifier mapping closure stateful to this visitor instance.
                var targetToIdentifier = this.targetToIdentifier.bind(this);
                var absoluteOffset = ast.sourceSpan.start;
                var identifiers = ExpressionVisitor.getIdentifiers(ast, ast.source, absoluteOffset, this.boundTemplate, targetToIdentifier);
                identifiers.forEach(function (id) { return _this.identifiers.add(id); });
            }
        };
        return TemplateVisitor;
    }(compiler_1.TmplAstRecursiveVisitor));
    /**
     * Traverses a template AST and builds identifiers discovered in it.
     *
     * @param boundTemplate bound template target, which can be used for querying expression targets.
     * @return identifiers in template
     */
    function getTemplateIdentifiers(boundTemplate) {
        var visitor = new TemplateVisitor(boundTemplate);
        if (boundTemplate.target.template !== undefined) {
            visitor.visitAll(boundTemplate.target.template);
        }
        return visitor.identifiers;
    }
    exports.getTemplateIdentifiers = getTemplateIdentifiers;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVtcGxhdGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21waWxlci1jbGkvc3JjL25ndHNjL2luZGV4ZXIvc3JjL3RlbXBsYXRlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztJQUFBOzs7Ozs7T0FNRztJQUNILDhDQUF5VTtJQUN6VSx1RUFBNE47SUFpQjVOOzs7Ozs7OztPQVFHO0lBQ0g7UUFBZ0MsNkNBQW1CO1FBR2pELDJCQUNxQixhQUFxQixFQUFtQixjQUFzQixFQUM5RCxhQUF5QyxFQUN6QyxrQkFBNEQ7WUFIakYsWUFJRSxpQkFBTyxTQUNSO1lBSm9CLG1CQUFhLEdBQWIsYUFBYSxDQUFRO1lBQW1CLG9CQUFjLEdBQWQsY0FBYyxDQUFRO1lBQzlELG1CQUFhLEdBQWIsYUFBYSxDQUE0QjtZQUN6Qyx3QkFBa0IsR0FBbEIsa0JBQWtCLENBQTBDO1lBTHhFLGlCQUFXLEdBQTJCLEVBQUUsQ0FBQzs7UUFPbEQsQ0FBQztRQUVEOzs7Ozs7Ozs7O1dBVUc7UUFDSSxnQ0FBYyxHQUFyQixVQUNJLEdBQVEsRUFBRSxNQUFjLEVBQUUsY0FBc0IsRUFBRSxhQUF5QyxFQUMzRixrQkFBNEQ7WUFDOUQsSUFBTSxPQUFPLEdBQ1QsSUFBSSxpQkFBaUIsQ0FBQyxNQUFNLEVBQUUsY0FBYyxFQUFFLGFBQWEsRUFBRSxrQkFBa0IsQ0FBQyxDQUFDO1lBQ3JGLE9BQU8sQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDbkIsT0FBTyxPQUFPLENBQUMsV0FBVyxDQUFDO1FBQzdCLENBQUM7UUFFRCxpQ0FBSyxHQUFMLFVBQU0sR0FBUSxJQUFJLEdBQUcsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBRXBDLDJDQUFlLEdBQWYsVUFBZ0IsR0FBZSxFQUFFLE9BQVc7WUFDMUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxHQUFHLEVBQUUs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Q0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQzlELElBQU0sY0FBYyxHQUFHLEdBQUcsQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDO2dCQUM1QyxJQUFNLFdBQVcsR0FBRyxpQkFBaUIsQ0FBQyxjQUFjLENBQ2hELEdBQUcsRUFBRSxHQUFHLENBQUMsTUFBTSxFQUFFLGNBQWMsRUFBRSxJQUFJLENBQUMsYUFBYSxFQUFFLGtCQUFrQixDQUFDLENBQUM7Z0JBQzdFLFdBQVcsQ0FBQyxPQUFPLENBQUMsVUFBQSxFQUFFLElBQUksT0FBQSxLQUFJLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBeEIsQ0FBd0IsQ0FBQyxDQUFDO2FBQ3JEO1FBQ0gsQ0FBQztRQUNILHNCQUFDO0lBQUQsQ0FBQyxBQXpORCxDQUE4QixrQ0FBdUIsR0F5TnBEO0lBRUQ7Ozs7O09BS0c7SUFDSCxTQUFnQixzQkFBc0IsQ0FBQyxhQUF5QztRQUU5RSxJQUFNLE9BQU8sR0FBRyxJQUFJLGVBQWUsQ0FBQyxhQUFhLENBQUMsQ0FBQztRQUNuRCxJQUFJLGFBQWEsQ0FBQyxNQUFNLENBQUMsUUFBUSxLQUFLLFNBQVMsRUFBRTtZQUMvQyxPQUFPLENBQUMsUUFBUSxDQUFDLGFBQWEsQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUM7U0FDakQ7UUFDRCxPQUFPLE9BQU8sQ0FBQyxXQUFXLENBQUM7SUFDN0IsQ0FBQztJQVBELHdEQU9DIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuaW1wb3J0IHtBU1QsIEFTVFdpdGhTb3VyY2UsIEJvdW5kVGFyZ2V0LCBJbXBsaWNpdFJlY2VpdmVyLCBNZXRob2RDYWxsLCBQYXJzZVNvdXJjZVNwYW4sIFByb3BlcnR5UmVhZCwgUHJvcGVydHlXcml0ZSwgUmVjdXJzaXZlQXN0VmlzaXRvciwgVG1wbEFzdEJvdW5kQXR0cmlidXRlLCBUbXBsQXN0Qm91bmRFdmVudCwgVG1wbEFzdEJvdW5kVGV4dCwgVG1wbEFzdEVsZW1lbnQsIFRtcGxBc3ROb2RlLCBUbXBsQXN0UmVjdXJzaXZlVmlzaXRvciwgVG1wbEFzdFJlZmVyZW5jZSwgVG1wbEFzdFRlbXBsYXRlLCBUbXBsQXN0VmFyaWFibGV9IGZyb20gJ0Bhbmd1bGFyL2NvbXBpbGVyJztcbmltcG9ydCB7QWJzb2x1dGVTb3VyY2VTcGFuLCBBdHRyaWJ1dGVJZGVudGlmaWVyLCBFbGVtZW50SWRlbnRpZmllciwgSWRlbnRpZmllcktpbmQsIE1ldGhvZElkZW50aWZpZXIsIFByb3BlcnR5SWRlbnRpZmllciwgUmVmZXJlbmNlSWRlbnRpZmllciwgVGVtcGxhdGVOb2RlSWRlbnRpZmllciwgVG9wTGV2ZWxJZGVudGlmaWVyLCBWYXJpYWJsZUlkZW50aWZpZXJ9IGZyb20gJy4vYXBpJztcbmltcG9ydCB7Q29tcG9uZW50TWV0YX0gZnJvbSAnLi9jb250ZXh0JztcblxuLyoqXG4gKiBBIHBhcnNlZCBub2RlIGluIGEgdGVtcGxhdGUsIHdoaWNoIG1heSBoYXZlIGEgbmFtZSAoaWYgaXQgaXMgYSBzZWxlY3Rvcikgb3JcbiAqIGJlIGFub255bW91cyAobGlrZSBhIHRleHQgc3BhbikuXG4gKi9cbmludGVyZmFjZSBIVE1MTm9kZSBleHRlbmRzIFRtcGxBc3ROb2RlIHtcbiAgdGFnTmFtZT86IHN0cmluZztcbiAgbmFtZT86IHN0cmluZztcbn1cblxudHlwZSBFeHByZXNzaW9uSWRlbnRpZmllciA9IFByb3BlcnR5SWRlbnRpZmllciB8IE1ldGhvZElkZW50aWZpZXI7XG50eXBlIFRtcGxUYXJnZXQgPSBUbXBsQXN0UmVmZXJlbmNlIHwgVG1wbEFzdFZhcmlhYmxlO1xudHlwZSBUYXJnZXRJZGVudGlmaWVyID0gUmVmZXJlbmNlSWRlbnRpZmllciB8IFZhcmlhYmxlSWRlbnRpZmllcjtcbnR5cGUgVGFyZ2V0SWRlbnRpZmllck1hcCA9IE1hcDxUbXBsVGFyZ2V0LCBUYXJnZXRJZGVudGlmaWVyPjtcblxuLyoqXG4gKiBWaXNpdHMgdGhlIEFTVCBvZiBhbiBBbmd1bGFyIHRlbXBsYXRlIHN5bnRheCBleHByZXNzaW9uLCBmaW5kaW5nIGludGVyZXN0aW5nXG4gKiBlbnRpdGllcyAodmFyaWFibGUgcmVmZXJlbmNlcywgZXRjLikuIENyZWF0ZXMgYW4gYXJyYXkgb2YgRW50aXRpZXMgZm91bmQgaW5cbiAqIHRoZSBleHByZXNzaW9uLCB3aXRoIHRoZSBsb2NhdGlvbiBvZiB0aGUgRW50aXRpZXMgYmVpbmcgcmVsYXRpdmUgdG8gdGhlXG4gKiBleHByZXNzaW9uLlxuICpcbiAqIFZpc2l0aW5nIGB0ZXh0IHt7cHJvcH19YCB3aWxsIHJldHVyblxuICogYFtUb3BMZXZlbElkZW50aWZpZXIge25hbWU6ICdwcm9wJywgc3Bhbjoge3N0YXJ0OiA3LCBlbmQ6IDExfX1dYC5cbiAqL1xuY2xhc3MgRXhwcmVzc2lvblZpc2l0b3IgZXh0ZW5kcyBSZWN1cnNpdmVBc3RWaXNpdG9yIHtcbiAgcmVhZG9ubHkgaWRlbnRpZmllcnM6IEV4cHJlc3Npb25JZGVudGlmaWVyW10gPSBbXTtcblxuICBwcml2YXRlIGNvbnN0cnVjdG9yKFxuICAgICAgcHJpdmF0ZSByZWFkb25seSBleHByZXNzaW9uU3RyOiBzdHJpbmcsIHByaXZhdGUgcmVhZG9ubHkgYWJzb2x1dGVPZmZzZXQ6IG51bWJlcixcbiAgICAgIHByaXZhdGUgcmVhZG9ubHkgYm91bmRUZW1wbGF0ZTogQm91bmRUYXJnZXQ8Q29tcG9uZW50TWV0YT4sXG4gICAgICBwcml2YXRlIHJlYWRvbmx5IHRhcmdldFRvSWRlbnRpZmllcjogKHRhcmdldDogVG1wbFRhcmdldCkgPT4gVGFyZ2V0SWRlbnRpZmllcikge1xuICAgIHN1cGVyKCk7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyBpZGVudGlmaWVycyBkaXNjb3ZlcmVkIGluIGFuIGV4cHJlc3Npb24uXG4gICAqXG4gICAqIEBwYXJhbSBhc3QgZXhwcmVzc2lvbiBBU1QgdG8gdmlzaXRcbiAgICogQHBhcmFtIHNvdXJjZSBleHByZXNzaW9uIEFTVCBzb3VyY2UgY29kZVxuICAgKiBAcGFyYW0gYWJzb2x1dGVPZmZzZXQgYWJzb2x1dGUgYnl0ZSBvZmZzZXQgZnJvbSBzdGFydCBvZiB0aGUgZmlsZSB0byB0aGUgc3RhcnQgb2YgdGhlIEFTVFxuICAgKiBzb3VyY2UgY29kZS5cbiAgICogQHBhcmFtIGJvdW5kVGVtcGxhdGUgYm91bmQgdGFyZ2V0IG9mIHRoZSBlbnRpcmUgdGVtcGxhdGUsIHdoaWNoIGNhbiBiZSB1c2VkIHRvIHF1ZXJ5IGZvciB0aGVcbiAgICogZW50aXRpZXMgZXhwcmVzc2lvbnMgdGFyZ2V0LlxuICAgKiBAcGFyYW0gdGFyZ2V0VG9JZGVudGlmaWVyIGNsb3N1cmUgY29udmVydGluZyBhIHRlbXBsYXRlIHRhcmdldCBub2RlIHRvIGl0cyBpZGVudGlmaWVyLlxuICAgKi9cbiAgc3RhdGljIGdldElkZW50aWZpZXJzKFxuICAgICAgYXN0OiBBU1QsIHNvdXJjZTogc3RyaW5nLCBhYnNvbHV0ZU9mZnNldDogbnVtYmVyLCBib3VuZFRlbXBsYXRlOiBCb3VuZFRhcmdldDxDb21wb25lbnRNZXRhPixcbiAgICAgIHRhcmdldFRvSWRlbnRpZmllcjogKHRhcmdldDogVG1wbFRhcmdldCkgPT4gVGFyZ2V0SWRlbnRpZmllcik6IFRvcExldmVsSWRlbnRpZmllcltdIHtcbiAgICBjb25zdCB2aXNpdG9yID1cbiAgICAgICAgbmV3IEV4cHJlc3Npb25WaXNpdG9yKHNvdXJjZSwgYWJzb2x1dGVPZmZzZXQsIGJvdW5kVGVtcGxhdGUsIHRhcmdldFRvSWRlbnRpZmllcik7XG4gICAgdmlzaXRvci52aXNpdChhc3QpO1xuICAgIHJldHVybiB2aXNpdG9yLmlkZW50aWZpZXJzO1xuICB9XG5cbiAgdmlzaXQoYXN0OiBBU1QpIHsgYXN0LnZpc2l0KHRoaXMpOyB9XG5cbiAgdmlzaXRNZXRob2RDYWxsKGFzdDogTWV0aG9kQ2FsbCwgY29udGV4dDoge30pIHtcbiAgICB0aGlzLnZpc2l0SWRlbnRpZmllcihhc3QsIElkZW50aWZpZXJLaW5kLk1ldGhvZCk7XG4gICAgc3VwZXIudmlzaXRNZXRob2RDYWxsKGFzdCwgY29udGV4dCk7XG4gIH1cblxuICB2aXNpdFByb3BlcnR5UmVhZChhc3Q6IFByb3BlcnR5UmVhZCwgY29udGV4dDoge30pIHtcbiAgICB0aGlzLnZpc2l0SWRlbnRpZmllcihhc3QsIElkZW50aWZpZXJLaW5kLlByb3BlcnR5KTtcbiAgICBzdXBlci52aXNpdFByb3BlcnR5UmVhZChhc3QsIGNvbnRleHQpO1xuICB9XG5cbiAgdmlzaXRQcm9wZXJ0eVdyaXRlKGFzdDogUHJvcGVydHlXcml0ZSwgY29udGV4dDoge30pIHtcbiAgICB0aGlzLnZpc2l0SWRlbnRpZmllcihhc3QsIElkZW50aWZpZXJLaW5kLlByb3BlcnR5KTtcbiAgICBzdXBlci52aXNpdFByb3BlcnR5V3JpdGUoYXN0LCBjb250ZXh0KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBWaXNpdHMgYW4gaWRlbnRpZmllciwgYWRkaW5nIGl0IHRvIHRoZSBpZGVudGlmaWVyIHN0b3JlIGlmIGl0IGlzIHVzZWZ1bCBmb3IgaW5kZXhpbmcuXG4gICAqXG4gICAqIEBwYXJhbSBhc3QgZXhwcmVzc2lvbiBBU1QgdGhlIGlkZW50aWZpZXIgaXMgaW5cbiAgICogQHBhcmFtIGtpbmQgaWRlbnRpZmllciBraW5kXG4gICAqL1xuICBwcml2YXRlIHZpc2l0SWRlbnRpZmllcihcbiAgICAgIGFzdDogQVNUJntuYW1lOiBzdHJpbmcsIHJlY2VpdmVyOiBBU1R9LCBraW5kOiBFeHByZXNzaW9uSWRlbnRpZmllclsna2luZCddKSB7XG4gICAgLy8gVGhlIGRlZmluaXRpb24gb2YgYSBub24tdG9wLWxldmVsIHByb3BlcnR5IHN1Y2ggYXMgYGJhcmAgaW4gYHt7Zm9vLmJhcn19YCBpcyBjdXJyZW50bHlcbiAgICAvLyBpbXBvc3NpYmxlIHRvIGRldGVybWluZSBieSBhbiBpbmRleGVyIGFuZCB1bnN1cHBvcnRlZCBieSB0aGUgaW5kZXhpbmcgbW9kdWxlLlxuICAgIC8vIFRoZSBpbmRleGluZyBtb2R1bGUgYWxzbyBkb2VzIG5vdCBjdXJyZW50bHkgc3VwcG9ydCByZWZlcmVuY2VzIHRvIGlkZW50aWZpZXJzIGRlY2xhcmVkIGluIHRoZVxuICAgIC8vIHRlbXBsYXRlIGl0c2VsZiwgd2hpY2ggaGF2ZSBhIG5vbi1udWxsIGV4cHJlc3Npb24gdGFyZ2V0LlxuICAgIGlmICghKGFzdC5yZWNlaXZlciBpbnN0YW5jZW9mIEltcGxpY2l0UmVjZWl2ZXIpKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gR2V0IHRoZSBsb2NhdGlvbiBvZiB0aGUgaWRlbnRpZmllciBvZiByZWFsIGludGVyZXN0LlxuICAgIC8vIFRoZSBjb21waWxlcidzIGV4cHJlc3Npb24gcGFyc2VyIHJlY29yZHMgdGhlIGxvY2F0aW9uIG9mIHNvbWUgZXhwcmVzc2lvbnMgaW4gYSBtYW5uZXIgbm90XG4gICAgLy8gdXNlZnVsIHRvIHRoZSBpbmRleGVyLiBGb3IgZXhhbXBsZSwgYSBgTWV0aG9kQ2FsbGAgYGZvbyhhLCBiKWAgd2lsbCByZWNvcmQgdGhlIHNwYW4gb2YgdGhlXG4gICAgLy8gZW50aXJlIG1ldGhvZCBjYWxsLCBidXQgdGhlIGluZGV4ZXIgaXMgaW50ZXJlc3RlZCBvbmx5IGluIHRoZSBtZXRob2QgaWRlbnRpZmllci5cbiAgICBjb25zdCBsb2NhbEV4cHJlc3Npb24gPSB0aGlzLmV4cHJlc3Npb25TdHIuc3Vic3RyKGFzdC5zcGFuLnN0YXJ0KTtcbiAgICBpZiAoIWxvY2FsRXhwcmVzc2lvbi5pbmNsdWRlcyhhc3QubmFtZSkpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgSW1wb3NzaWJsZSBzdGF0ZTogXCIke2FzdC5uYW1lfVwiIG5vdCBmb3VuZCBpbiBcIiR7bG9jYWxFeHByZXNzaW9ufVwiYCk7XG4gICAgfVxuICAgIGNvbnN0IGlkZW50aWZpZXJTdGFydCA9IGFzdC5zcGFuLnN0YXJ0ICsgbG9jYWxFeHByZXNzaW9uLmluZGV4T2YoYXN0Lm5hbWUpO1xuXG4gICAgLy8gSm9pbiB0aGUgcmVsYXRpdmUgcG9zaXRpb24gb2YgdGhlIGV4cHJlc3Npb24gd2l0aGluIGEgbm9kZSB3aXRoIHRoZSBhYnNvbHV0ZSBwb3NpdGlvblxuICAgIC8vIG9mIHRoZSBub2RlIHRvIGdldCB0aGUgYWJzb2x1dGUgcG9zaXRpb24gb2YgdGhlIGV4cHJlc3Npb24gaW4gdGhlIHNvdXJjZSBjb2RlLlxuICAgIGNvbnN0IGFic29sdXRlU3RhcnQgPSB0aGlzLmFic29sdXRlT2Zmc2V0ICsgaWRlbnRpZmllclN0YXJ0O1xuICAgIGNvbnN0IHNwYW4gPSBuZXcgQWJzb2x1dGVTb3VyY2VTcGFuKGFic29sdXRlU3RhcnQsIGFic29sdXRlU3RhcnQgKyBhc3QubmFtZS5sZW5ndGgpO1xuXG4gICAgY29uc3QgdGFyZ2V0QXN0ID0gdGhpcy5ib3VuZFRlbXBsYXRlLmdldEV4cHJlc3Npb25UYXJnZXQoYXN0KTtcbiAgICBjb25zdCB0YXJnZXQgPSB0YXJnZXRBc3QgPyB0aGlzLnRhcmdldFRvSWRlbnRpZmllcih0YXJnZXRBc3QpIDogbnVsbDtcbiAgICBjb25zdCBpZGVudGlmaWVyID0ge1xuICAgICAgbmFtZTogYXN0Lm5hbWUsXG4gICAgICBzcGFuLFxuICAgICAga2luZCxcbiAgICAgIHRhcmdldCxcbiAgICB9IGFzIEV4cHJlc3Npb25JZGVudGlmaWVyO1xuXG4gICAgdGhpcy5pZGVudGlmaWVycy5wdXNoKGlkZW50aWZpZXIpO1xuICB9XG59XG5cbi8qKlxuICogVmlzaXRzIHRoZSBBU1Qgb2YgYSBwYXJzZWQgQW5ndWxhciB0ZW1wbGF0ZS4gRGlzY292ZXJzIGFuZCBzdG9yZXNcbiAqIGlkZW50aWZpZXJzIG9mIGludGVyZXN0LCBkZWZlcnJpbmcgdG8gYW4gYEV4cHJlc3Npb25WaXNpdG9yYCBhcyBuZWVkZWQuXG4gKi9cbmNsYXNzIFRlbXBsYXRlVmlzaXRvciBleHRlbmRzIFRtcGxBc3RSZWN1cnNpdmVWaXNpdG9yIHtcbiAgLy8gSWRlbnRpZmllcnMgb2YgaW50ZXJlc3QgZm91bmQgaW4gdGhlIHRlbXBsYXRlLlxuICByZWFkb25seSBpZGVudGlmaWVycyA9IG5ldyBTZXQ8VG9wTGV2ZWxJZGVudGlmaWVyPigpO1xuXG4gIC8vIE1hcCBvZiB0YXJnZXRzIGluIGEgdGVtcGxhdGUgdG8gdGhlaXIgaWRlbnRpZmllcnMuXG4gIHByaXZhdGUgcmVhZG9ubHkgdGFyZ2V0SWRlbnRpZmllckNhY2hlOiBUYXJnZXRJZGVudGlmaWVyTWFwID0gbmV3IE1hcCgpO1xuXG4gIC8vIE1hcCBvZiBlbGVtZW50cyBhbmQgdGVtcGxhdGVzIHRvIHRoZWlyIGlkZW50aWZpZXJzLlxuICBwcml2YXRlIHJlYWRvbmx5IGVsZW1lbnRBbmRUZW1wbGF0ZUlkZW50aWZpZXJDYWNoZSA9XG4gICAgICBuZXcgTWFwPFRtcGxBc3RFbGVtZW50fFRtcGxBc3RUZW1wbGF0ZSwgRWxlbWVudElkZW50aWZpZXJ8VGVtcGxhdGVOb2RlSWRlbnRpZmllcj4oKTtcblxuICAvKipcbiAgICogQ3JlYXRlcyBhIHRlbXBsYXRlIHZpc2l0b3IgZm9yIGEgYm91bmQgdGVtcGxhdGUgdGFyZ2V0LiBUaGUgYm91bmQgdGFyZ2V0IGNhbiBiZSB1c2VkIHdoZW5cbiAgICogZGVmZXJyZWQgdG8gdGhlIGV4cHJlc3Npb24gdmlzaXRvciB0byBnZXQgaW5mb3JtYXRpb24gYWJvdXQgdGhlIHRhcmdldCBvZiBhbiBleHByZXNzaW9uLlxuICAgKlxuICAgKiBAcGFyYW0gYm91bmRUZW1wbGF0ZSBib3VuZCB0ZW1wbGF0ZSB0YXJnZXRcbiAgICovXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgYm91bmRUZW1wbGF0ZTogQm91bmRUYXJnZXQ8Q29tcG9uZW50TWV0YT4pIHsgc3VwZXIoKTsgfVxuXG4gIC8qKlxuICAgKiBWaXNpdHMgYSBub2RlIGluIHRoZSB0ZW1wbGF0ZS5cbiAgICpcbiAgICogQHBhcmFtIG5vZGUgbm9kZSB0byB2aXNpdFxuICAgKi9cbiAgdmlzaXQobm9kZTogSFRNTE5vZGUpIHsgbm9kZS52aXNpdCh0aGlzKTsgfVxuXG4gIHZpc2l0QWxsKG5vZGVzOiBUbXBsQXN0Tm9kZVtdKSB7IG5vZGVzLmZvckVhY2gobm9kZSA9PiB0aGlzLnZpc2l0KG5vZGUpKTsgfVxuXG4gIC8qKlxuICAgKiBBZGQgYW4gaWRlbnRpZmllciBmb3IgYW4gSFRNTCBlbGVtZW50IGFuZCB2aXNpdCBpdHMgY2hpbGRyZW4gcmVjdXJzaXZlbHkuXG4gICAqXG4gICAqIEBwYXJhbSBlbGVtZW50XG4gICAqL1xuICB2aXNpdEVsZW1lbnQoZWxlbWVudDogVG1wbEFzdEVsZW1lbnQpIHtcbiAgICBjb25zdCBlbGVtZW50SWRlbnRpZmllciA9IHRoaXMuZWxlbWVudE9yVGVtcGxhdGVUb0lkZW50aWZpZXIoZWxlbWVudCk7XG5cbiAgICB0aGlzLmlkZW50aWZpZXJzLmFkZChlbGVtZW50SWRlbnRpZmllcik7XG5cbiAgICB0aGlzLnZpc2l0QWxsKGVsZW1lbnQucmVmZXJlbmNlcyk7XG4gICAgdGhpcy52aXNpdEFsbChlbGVtZW50LmlucHV0cyk7XG4gICAgdGhpcy52aXNpdEFsbChlbGVtZW50LmF0dHJpYnV0ZXMpO1xuICAgIHRoaXMudmlzaXRBbGwoZWxlbWVudC5jaGlsZHJlbik7XG4gICAgdGhpcy52aXNpdEFsbChlbGVtZW50Lm91dHB1dHMpO1xuICB9XG4gIHZpc2l0VGVtcGxhdGUodGVtcGxhdGU6IFRtcGxBc3RUZW1wbGF0ZSkge1xuICAgIGNvbnN0IHRlbXBsYXRlSWRlbnRpZmllciA9IHRoaXMuZWxlbWVudE9yVGVtcGxhdGVUb0lkZW50aWZpZXIodGVtcGxhdGUpO1xuXG4gICAgdGhpcy5pZGVudGlmaWVycy5hZGQodGVtcGxhdGVJZGVudGlmaWVyKTtcblxuICAgIHRoaXMudmlzaXRBbGwodGVtcGxhdGUudmFyaWFibGVzKTtcbiAgICB0aGlzLnZpc2l0QWxsKHRlbXBsYXRlLmF0dHJpYnV0ZXMpO1xuICAgIHRoaXMudmlzaXRBbGwodGVtcGxhdGUudGVtcGxhdGVBdHRycyk7XG4gICAgdGhpcy52aXNpdEFsbCh0ZW1wbGF0ZS5jaGlsZHJlbik7XG4gICAgdGhpcy52aXNpdEFsbCh0ZW1wbGF0ZS5yZWZlcmVuY2VzKTtcbiAgfVxuICB2aXNpdEJvdW5kQXR0cmlidXRlKGF0dHJpYnV0ZTogVG1wbEFzdEJvdW5kQXR0cmlidXRlKSB7XG4gICAgLy8gQSBCb3VuZEF0dHJpYnV0ZSdzIHZhbHVlICh0aGUgcGFyZW50IEFTVCkgbWF5IGhhdmUgc3ViZXhwcmVzc2lvbnMgKGNoaWxkcmVuIEFTVHMpIHRoYXQgaGF2ZVxuICAgIC8vIHJlY29yZGVkIHNwYW5zIGV4dGVuZGluZyBwYXN0IHRoZSByZWNvcmRlZCBzcGFuIG9mIHRoZSBwYXJlbnQuIFRoZSBtb3N0IGNvbW1vbiBleGFtcGxlIG9mXG4gICAgLy8gdGhpcyBpcyB3aXRoIGAqbmdGb3JgLlxuICAgIC8vIFRvIHJlc29sdmUgdGhpcywgdXNlIHRoZSBpbmZvcm1hdGlvbiBvbiB0aGUgQm91bmRBdHRyaWJ1dGUgVGVtcGxhdGUgQVNULCB3aGljaCBpcyBhbHdheXNcbiAgICAvLyBjb3JyZWN0LCB0byBkZXRlcm1pbmUgbG9jYXRpb25zIG9mIGlkZW50aWZpZXJzIGluIHRoZSBleHByZXNzaW9uLlxuICAgIC8vXG4gICAgLy8gVE9ETyhheWF6aGFmaXopOiBSZW1vdmUgdGhpcyB3aGVuIGh0dHBzOi8vZ2l0aHViLmNvbS9hbmd1bGFyL2FuZ3VsYXIvcHVsbC8zMTgxMyBsYW5kcy5cbiAgICBjb25zdCBhdHRyaWJ1dGVTcmMgPSBhdHRyaWJ1dGUuc291cmNlU3Bhbi50b1N0cmluZygpO1xuICAgIGNvbnN0IGF0dHJpYnV0ZUFic29sdXRlUG9zaXRpb24gPSBhdHRyaWJ1dGUuc291cmNlU3Bhbi5zdGFydC5vZmZzZXQ7XG5cbiAgICAvLyBTa2lwIHRoZSBieXRlcyBvZiB0aGUgYXR0cmlidXRlIG5hbWUgc28gdGhhdCB0aGVyZSBhcmUgbm8gY29sbGlzaW9ucyBiZXR3ZWVuIHRoZSBhdHRyaWJ1dGVcbiAgICAvLyBuYW1lIGFuZCBleHByZXNzaW9uIGlkZW50aWZpZXIgbmFtZXMgbGF0ZXIuXG4gICAgY29uc3QgbmFtZVNraXBPZmZldCA9IGF0dHJpYnV0ZVNyYy5pbmRleE9mKGF0dHJpYnV0ZS5uYW1lKSArIGF0dHJpYnV0ZS5uYW1lLmxlbmd0aDtcbiAgICBjb25zdCBleHByZXNzaW9uU3JjID0gYXR0cmlidXRlU3JjLnN1YnN0cmluZyhuYW1lU2tpcE9mZmV0KTtcbiAgICBjb25zdCBleHByZXNzaW9uQWJzb2x1dGVQb3NpdGlvbiA9IGF0dHJpYnV0ZUFic29sdXRlUG9zaXRpb24gKyBuYW1lU2tpcE9mZmV0O1xuXG4gICAgY29uc3QgaWRlbnRpZmllcnMgPSBFeHByZXNzaW9uVmlzaXRvci5nZXRJZGVudGlmaWVycyhcbiAgICAgICAgYXR0cmlidXRlLnZhbHVlLCBleHByZXNzaW9uU3JjLCBleHByZXNzaW9uQWJzb2x1dGVQb3NpdGlvbiwgdGhpcy5ib3VuZFRlbXBsYXRlLFxuICAgICAgICB0aGlzLnRhcmdldFRvSWRlbnRpZmllci5iaW5kKHRoaXMpKTtcbiAgICBpZGVudGlmaWVycy5mb3JFYWNoKGlkID0+IHRoaXMuaWRlbnRpZmllcnMuYWRkKGlkKSk7XG4gIH1cbiAgdmlzaXRCb3VuZEV2ZW50KGF0dHJpYnV0ZTogVG1wbEFzdEJvdW5kRXZlbnQpIHsgdGhpcy52aXNpdEV4cHJlc3Npb24oYXR0cmlidXRlLmhhbmRsZXIpOyB9XG4gIHZpc2l0Qm91bmRUZXh0KHRleHQ6IFRtcGxBc3RCb3VuZFRleHQpIHsgdGhpcy52aXNpdEV4cHJlc3Npb24odGV4dC52YWx1ZSk7IH1cbiAgdmlzaXRSZWZlcmVuY2UocmVmZXJlbmNlOiBUbXBsQXN0UmVmZXJlbmNlKSB7XG4gICAgY29uc3QgcmVmZXJlbmNlSWRlbnRpZmVyID0gdGhpcy50YXJnZXRUb0lkZW50aWZpZXIocmVmZXJlbmNlKTtcblxuICAgIHRoaXMuaWRlbnRpZmllcnMuYWRkKHJlZmVyZW5jZUlkZW50aWZlcik7XG4gIH1cbiAgdmlzaXRWYXJpYWJsZSh2YXJpYWJsZTogVG1wbEFzdFZhcmlhYmxlKSB7XG4gICAgY29uc3QgdmFyaWFibGVJZGVudGlmaWVyID0gdGhpcy50YXJnZXRUb0lkZW50aWZpZXIodmFyaWFibGUpO1xuXG4gICAgdGhpcy5pZGVudGlmaWVycy5hZGQodmFyaWFibGVJZGVudGlmaWVyKTtcbiAgfVxuXG4gIC8qKiBDcmVhdGVzIGFuIGlkZW50aWZpZXIgZm9yIGEgdGVtcGxhdGUgZWxlbWVudCBvciB0ZW1wbGF0ZSBub2RlLiAqL1xuICBwcml2YXRlIGVsZW1lbnRPclRlbXBsYXRlVG9JZGVudGlmaWVyKG5vZGU6IFRtcGxBc3RFbGVtZW50fFRtcGxBc3RUZW1wbGF0ZSk6IEVsZW1lbnRJZGVudGlmaWVyXG4gICAgICB8VGVtcGxhdGVOb2RlSWRlbnRpZmllciB7XG4gICAgLy8gSWYgdGhpcyBub2RlIGhhcyBhbHJlYWR5IGJlZW4gc2VlbiwgcmV0dXJuIHRoZSBjYWNoZWQgcmVzdWx0LlxuICAgIGlmICh0aGlzLmVsZW1lbnRBbmRUZW1wbGF0ZUlkZW50aWZpZXJDYWNoZS5oYXMobm9kZSkpIHtcbiAgICAgIHJldHVybiB0aGlzLmVsZW1lbnRBbmRUZW1wbGF0ZUlkZW50aWZpZXJDYWNoZS5nZXQobm9kZSkgITtcbiAgICB9XG5cbiAgICBsZXQgbmFtZTogc3RyaW5nO1xuICAgIGxldCBraW5kOiBJZGVudGlmaWVyS2luZC5FbGVtZW50fElkZW50aWZpZXJLaW5kLlRlbXBsYXRlO1xuICAgIGlmIChub2RlIGluc3RhbmNlb2YgVG1wbEFzdFRlbXBsYXRlKSB7XG4gICAgICBuYW1lID0gbm9kZS50YWdOYW1lO1xuICAgICAga2luZCA9IElkZW50aWZpZXJLaW5kLlRlbXBsYXRlO1xuICAgIH0gZWxzZSB7XG4gICAgICBuYW1lID0gbm9kZS5uYW1lO1xuICAgICAga2luZCA9IElkZW50aWZpZXJLaW5kLkVsZW1lbnQ7XG4gICAgfVxuICAgIGNvbnN0IHtzb3VyY2VTcGFufSA9IG5vZGU7XG4gICAgLy8gQW4gZWxlbWVudCdzIG9yIHRlbXBsYXRlJ3Mgc291cmNlIHNwYW4gY2FuIGJlIG9mIHRoZSBmb3JtIGA8ZWxlbWVudD5gLCBgPGVsZW1lbnQgLz5gLCBvclxuICAgIC8vIGA8ZWxlbWVudD48L2VsZW1lbnQ+YC4gT25seSB0aGUgc2VsZWN0b3IgaXMgaW50ZXJlc3RpbmcgdG8gdGhlIGluZGV4ZXIsIHNvIHRoZSBzb3VyY2UgaXNcbiAgICAvLyBzZWFyY2hlZCBmb3IgdGhlIGZpcnN0IG9jY3VycmVuY2Ugb2YgdGhlIGVsZW1lbnQgKHNlbGVjdG9yKSBuYW1lLlxuICAgIGNvbnN0IHN0YXJ0ID0gdGhpcy5nZXRTdGFydExvY2F0aW9uKG5hbWUsIHNvdXJjZVNwYW4pO1xuICAgIGNvbnN0IGFic29sdXRlU3BhbiA9IG5ldyBBYnNvbHV0ZVNvdXJjZVNwYW4oc3RhcnQsIHN0YXJ0ICsgbmFtZS5sZW5ndGgpO1xuXG4gICAgLy8gUmVjb3JkIHRoZSBub2RlcydzIGF0dHJpYnV0ZXMsIHdoaWNoIGFuIGluZGV4ZXIgY2FuIGxhdGVyIHRyYXZlcnNlIHRvIHNlZSBpZiBhbnkgb2YgdGhlbVxuICAgIC8vIHNwZWNpZnkgYSB1c2VkIGRpcmVjdGl2ZSBvbiB0aGUgbm9kZS5cbiAgICBjb25zdCBhdHRyaWJ1dGVzID0gbm9kZS5hdHRyaWJ1dGVzLm1hcCgoe25hbWUsIHNvdXJjZVNwYW59KTogQXR0cmlidXRlSWRlbnRpZmllciA9PiB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBuYW1lLFxuICAgICAgICBzcGFuOiBuZXcgQWJzb2x1dGVTb3VyY2VTcGFuKHNvdXJjZVNwYW4uc3RhcnQub2Zmc2V0LCBzb3VyY2VTcGFuLmVuZC5vZmZzZXQpLFxuICAgICAgICBraW5kOiBJZGVudGlmaWVyS2luZC5BdHRyaWJ1dGUsXG4gICAgICB9O1xuICAgIH0pO1xuICAgIGNvbnN0IHVzZWREaXJlY3RpdmVzID0gdGhpcy5ib3VuZFRlbXBsYXRlLmdldERpcmVjdGl2ZXNPZk5vZGUobm9kZSkgfHwgW107XG5cbiAgICBjb25zdCBpZGVudGlmaWVyID0ge1xuICAgICAgbmFtZSxcbiAgICAgIHNwYW46IGFic29sdXRlU3Bhbiwga2luZCxcbiAgICAgIGF0dHJpYnV0ZXM6IG5ldyBTZXQoYXR0cmlidXRlcyksXG4gICAgICB1c2VkRGlyZWN0aXZlczogbmV3IFNldCh1c2VkRGlyZWN0aXZlcy5tYXAoZGlyID0+IHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICBub2RlOiBkaXIucmVmLm5vZGUsXG4gICAgICAgICAgc2VsZWN0b3I6IGRpci5zZWxlY3RvcixcbiAgICAgICAgfTtcbiAgICAgIH0pKSxcbiAgICAgIC8vIGNhc3QgYi9jIHByZS1UeXBlU2NyaXB0IDMuNSB1bmlvbnMgYXJlbid0IHdlbGwgZGlzY3JpbWluYXRlZFxuICAgIH0gYXMgRWxlbWVudElkZW50aWZpZXIgfFxuICAgICAgICBUZW1wbGF0ZU5vZGVJZGVudGlmaWVyO1xuXG4gICAgdGhpcy5lbGVtZW50QW5kVGVtcGxhdGVJZGVudGlmaWVyQ2FjaGUuc2V0KG5vZGUsIGlkZW50aWZpZXIpO1xuICAgIHJldHVybiBpZGVudGlmaWVyO1xuICB9XG5cbiAgLyoqIENyZWF0ZXMgYW4gaWRlbnRpZmllciBmb3IgYSB0ZW1wbGF0ZSByZWZlcmVuY2Ugb3IgdGVtcGxhdGUgdmFyaWFibGUgdGFyZ2V0LiAqL1xuICBwcml2YXRlIHRhcmdldFRvSWRlbnRpZmllcihub2RlOiBUbXBsQXN0UmVmZXJlbmNlfFRtcGxBc3RWYXJpYWJsZSk6IFRhcmdldElkZW50aWZpZXIge1xuICAgIC8vIElmIHRoaXMgbm9kZSBoYXMgYWxyZWFkeSBiZWVuIHNlZW4sIHJldHVybiB0aGUgY2FjaGVkIHJlc3VsdC5cbiAgICBpZiAodGhpcy50YXJnZXRJZGVudGlmaWVyQ2FjaGUuaGFzKG5vZGUpKSB7XG4gICAgICByZXR1cm4gdGhpcy50YXJnZXRJZGVudGlmaWVyQ2FjaGUuZ2V0KG5vZGUpICE7XG4gICAgfVxuXG4gICAgY29uc3Qge25hbWUsIHNvdXJjZVNwYW59ID0gbm9kZTtcbiAgICBjb25zdCBzdGFydCA9IHRoaXMuZ2V0U3RhcnRMb2NhdGlvbihuYW1lLCBzb3VyY2VTcGFuKTtcbiAgICBjb25zdCBzcGFuID0gbmV3IEFic29sdXRlU291cmNlU3BhbihzdGFydCwgc3RhcnQgKyBuYW1lLmxlbmd0aCk7XG4gICAgbGV0IGlkZW50aWZpZXI6IFJlZmVyZW5jZUlkZW50aWZpZXJ8VmFyaWFibGVJZGVudGlmaWVyO1xuICAgIGlmIChub2RlIGluc3RhbmNlb2YgVG1wbEFzdFJlZmVyZW5jZSkge1xuICAgICAgLy8gSWYgdGhlIG5vZGUgaXMgYSByZWZlcmVuY2UsIHdlIGNhcmUgYWJvdXQgaXRzIHRhcmdldC4gVGhlIHRhcmdldCBjYW4gYmUgYW4gZWxlbWVudCwgYVxuICAgICAgLy8gdGVtcGxhdGUsIGEgZGlyZWN0aXZlIGFwcGxpZWQgb24gYSB0ZW1wbGF0ZSBvciBlbGVtZW50IChpbiB3aGljaCBjYXNlIHRoZSBkaXJlY3RpdmUgZmllbGRcbiAgICAgIC8vIGlzIG5vbi1udWxsKSwgb3Igbm90aGluZyBhdCBhbGwuXG4gICAgICBjb25zdCByZWZUYXJnZXQgPSB0aGlzLmJvdW5kVGVtcGxhdGUuZ2V0UmVmZXJlbmNlVGFyZ2V0KG5vZGUpO1xuICAgICAgbGV0IHRhcmdldCA9IG51bGw7XG4gICAgICBpZiAocmVmVGFyZ2V0KSB7XG4gICAgICAgIGlmIChyZWZUYXJnZXQgaW5zdGFuY2VvZiBUbXBsQXN0RWxlbWVudCB8fCByZWZUYXJnZXQgaW5zdGFuY2VvZiBUbXBsQXN0VGVtcGxhdGUpIHtcbiAgICAgICAgICB0YXJnZXQgPSB7XG4gICAgICAgICAgICBub2RlOiB0aGlzLmVsZW1lbnRPclRlbXBsYXRlVG9JZGVudGlmaWVyKHJlZlRhcmdldCksXG4gICAgICAgICAgICBkaXJlY3RpdmU6IG51bGwsXG4gICAgICAgICAgfTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0YXJnZXQgPSB7XG4gICAgICAgICAgICBub2RlOiB0aGlzLmVsZW1lbnRPclRlbXBsYXRlVG9JZGVudGlmaWVyKHJlZlRhcmdldC5ub2RlKSxcbiAgICAgICAgICAgIGRpcmVjdGl2ZTogcmVmVGFyZ2V0LmRpcmVjdGl2ZS5yZWYubm9kZSxcbiAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlkZW50aWZpZXIgPSB7XG4gICAgICAgIG5hbWUsXG4gICAgICAgIHNwYW4sXG4gICAgICAgIGtpbmQ6IElkZW50aWZpZXJLaW5kLlJlZmVyZW5jZSwgdGFyZ2V0LFxuICAgICAgfTtcbiAgICB9IGVsc2Uge1xuICAgICAgaWRlbnRpZmllciA9IHtcbiAgICAgICAgbmFtZSxcbiAgICAgICAgc3BhbixcbiAgICAgICAga2luZDogSWRlbnRpZmllcktpbmQuVmFyaWFibGUsXG4gICAgICB9O1xuICAgIH1cblxuICAgIHRoaXMudGFyZ2V0SWRlbnRpZmllckNhY2hlLnNldChub2RlLCBpZGVudGlmaWVyKTtcbiAgICByZXR1cm4gaWRlbnRpZmllcjtcbiAgfVxuXG4gIC8qKiBHZXRzIHRoZSBzdGFydCBsb2NhdGlvbiBvZiBhIHN0cmluZyBpbiBhIFNvdXJjZVNwYW4gKi9cbiAgcHJpdmF0ZSBnZXRTdGFydExvY2F0aW9uKG5hbWU6IHN0cmluZywgY29udGV4dDogUGFyc2VTb3VyY2VTcGFuKTogbnVtYmVyIHtcbiAgICBjb25zdCBsb2NhbFN0ciA9IGNvbnRleHQudG9TdHJpbmcoKTtcbiAgICBpZiAoIWxvY2FsU3RyLmluY2x1ZGVzKG5hbWUpKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYEltcG9zc2libGUgc3RhdGU6IFwiJHtuYW1lfVwiIG5vdCBmb3VuZCBpbiBcIiR7bG9jYWxTdHJ9XCJgKTtcbiAgICB9XG4gICAgcmV0dXJuIGNvbnRleHQuc3RhcnQub2Zmc2V0ICsgbG9jYWxTdHIuaW5kZXhPZihuYW1lKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBWaXNpdHMgYSBub2RlJ3MgZXhwcmVzc2lvbiBhbmQgYWRkcyBpdHMgaWRlbnRpZmllcnMsIGlmIGFueSwgdG8gdGhlIHZpc2l0b3IncyBzdGF0ZS5cbiAgICogT25seSBBU1RzIHdpdGggaW5mb3JtYXRpb24gYWJvdXQgdGhlIGV4cHJlc3Npb24gc291cmNlIGFuZCBpdHMgbG9jYXRpb24gYXJlIHZpc2l0ZWQuXG4gICAqXG4gICAqIEBwYXJhbSBub2RlIG5vZGUgd2hvc2UgZXhwcmVzc2lvbiB0byB2aXNpdFxuICAgKi9cbiAgcHJpdmF0ZSB2aXNpdEV4cHJlc3Npb24oYXN0OiBBU1QpIHtcbiAgICAvLyBPbmx5IGluY2x1ZGUgQVNUcyB0aGF0IGhhdmUgaW5mb3JtYXRpb24gYWJvdXQgdGhlaXIgc291cmNlIGFuZCBhYnNvbHV0ZSBzb3VyY2Ugc3BhbnMuXG4gICAgaWYgKGFzdCBpbnN0YW5jZW9mIEFTVFdpdGhTb3VyY2UgJiYgYXN0LnNvdXJjZSAhPT0gbnVsbCkge1xuICAgICAgLy8gTWFrZSB0YXJnZXQgdG8gaWRlbnRpZmllciBtYXBwaW5nIGNsb3N1cmUgc3RhdGVmdWwgdG8gdGhpcyB2aXNpdG9yIGluc3RhbmNlLlxuICAgICAgY29uc3QgdGFyZ2V0VG9JZGVudGlmaWVyID0gdGhpcy50YXJnZXRUb0lkZW50aWZpZXIuYmluZCh0aGlzKTtcbiAgICAgIGNvbnN0IGFic29sdXRlT2Zmc2V0ID0gYXN0LnNvdXJjZVNwYW4uc3RhcnQ7XG4gICAgICBjb25zdCBpZGVudGlmaWVycyA9IEV4cHJlc3Npb25WaXNpdG9yLmdldElkZW50aWZpZXJzKFxuICAgICAgICAgIGFzdCwgYXN0LnNvdXJjZSwgYWJzb2x1dGVPZmZzZXQsIHRoaXMuYm91bmRUZW1wbGF0ZSwgdGFyZ2V0VG9JZGVudGlmaWVyKTtcbiAgICAgIGlkZW50aWZpZXJzLmZvckVhY2goaWQgPT4gdGhpcy5pZGVudGlmaWVycy5hZGQoaWQpKTtcbiAgICB9XG4gIH1cbn1cblxuLyoqXG4gKiBUcmF2ZXJzZXMgYSB0ZW1wbGF0ZSBBU1QgYW5kIGJ1aWxkcyBpZGVudGlmaWVycyBkaXNjb3ZlcmVkIGluIGl0LlxuICpcbiAqIEBwYXJhbSBib3VuZFRlbXBsYXRlIGJvdW5kIHRlbXBsYXRlIHRhcmdldCwgd2hpY2ggY2FuIGJlIHVzZWQgZm9yIHF1ZXJ5aW5nIGV4cHJlc3Npb24gdGFyZ2V0cy5cbiAqIEByZXR1cm4gaWRlbnRpZmllcnMgaW4gdGVtcGxhdGVcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldFRlbXBsYXRlSWRlbnRpZmllcnMoYm91bmRUZW1wbGF0ZTogQm91bmRUYXJnZXQ8Q29tcG9uZW50TWV0YT4pOlxuICAgIFNldDxUb3BMZXZlbElkZW50aWZpZXI+IHtcbiAgY29uc3QgdmlzaXRvciA9IG5ldyBUZW1wbGF0ZVZpc2l0b3IoYm91bmRUZW1wbGF0ZSk7XG4gIGlmIChib3VuZFRlbXBsYXRlLnRhcmdldC50ZW1wbGF0ZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgdmlzaXRvci52aXNpdEFsbChib3VuZFRlbXBsYXRlLnRhcmdldC50ZW1wbGF0ZSk7XG4gIH1cbiAgcmV0dXJuIHZpc2l0b3IuaWRlbnRpZmllcnM7XG59XG4iXX0=