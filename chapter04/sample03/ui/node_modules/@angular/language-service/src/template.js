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
        define("@angular/language-service/src/template", ["require", "exports", "tslib", "typescript", "@angular/language-service/src/global_symbols", "@angular/language-service/src/typescript_symbols"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var tslib_1 = require("tslib");
    var ts = require("typescript");
    var global_symbols_1 = require("@angular/language-service/src/global_symbols");
    var typescript_symbols_1 = require("@angular/language-service/src/typescript_symbols");
    /**
     * A base class to represent a template and which component class it is
     * associated with. A template source could answer basic questions about
     * top-level declarations of its class through the members() and query()
     * methods.
     */
    var BaseTemplate = /** @class */ (function () {
        function BaseTemplate(host, classDeclNode, classSymbol) {
            this.host = host;
            this.classDeclNode = classDeclNode;
            this.classSymbol = classSymbol;
            this.program = host.program;
        }
        Object.defineProperty(BaseTemplate.prototype, "type", {
            /**
             * Return the Angular StaticSymbol for the class that contains this template.
             */
            get: function () { return this.classSymbol; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(BaseTemplate.prototype, "members", {
            /**
             * Return a Map-like data structure that allows users to retrieve some or all
             * top-level declarations in the associated component class.
             */
            get: function () {
                if (!this.membersTable) {
                    var typeChecker = this.program.getTypeChecker();
                    var sourceFile = this.classDeclNode.getSourceFile();
                    this.membersTable = this.query.mergeSymbolTable([
                        global_symbols_1.createGlobalSymbolTable(this.query),
                        typescript_symbols_1.getClassMembersFromDeclaration(this.program, typeChecker, sourceFile, this.classDeclNode),
                    ]);
                }
                return this.membersTable;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(BaseTemplate.prototype, "query", {
            /**
             * Return an engine that provides more information about symbols in the
             * template.
             */
            get: function () {
                var _this = this;
                if (!this.queryCache) {
                    var program_1 = this.program;
                    var typeChecker_1 = program_1.getTypeChecker();
                    var sourceFile_1 = this.classDeclNode.getSourceFile();
                    this.queryCache = typescript_symbols_1.getSymbolQuery(program_1, typeChecker_1, sourceFile_1, function () {
                        // Computing the ast is relatively expensive. Do it only when absolutely
                        // necessary.
                        // TODO: There is circular dependency here between TemplateSource and
                        // TypeScriptHost. Consider refactoring the code to break this cycle.
                        var ast = _this.host.getTemplateAst(_this);
                        var pipes = (ast && ast.pipes) || [];
                        return typescript_symbols_1.getPipesTable(sourceFile_1, program_1, typeChecker_1, pipes);
                    });
                }
                return this.queryCache;
            },
            enumerable: true,
            configurable: true
        });
        return BaseTemplate;
    }());
    /**
     * An InlineTemplate represents template defined in a TS file through the
     * `template` attribute in the decorator.
     */
    var InlineTemplate = /** @class */ (function (_super) {
        tslib_1.__extends(InlineTemplate, _super);
        function InlineTemplate(templateNode, classDeclNode, classSymbol, host) {
            var _this = _super.call(this, host, classDeclNode, classSymbol) || this;
            var sourceFile = templateNode.getSourceFile();
            if (sourceFile !== classDeclNode.getSourceFile()) {
                throw new Error("Inline template and component class should belong to the same source file");
            }
            _this.fileName = sourceFile.fileName;
            // node.text returns the TS internal representation of the normalized text,
            // and all CR characters are stripped. node.getText() returns the raw text.
            _this.source = templateNode.getText().slice(1, -1); // strip leading and trailing quotes
            _this.span = {
                // TS string literal includes surrounding quotes in the start/end offsets.
                start: templateNode.getStart() + 1,
                end: templateNode.getEnd() - 1,
            };
            return _this;
        }
        return InlineTemplate;
    }(BaseTemplate));
    exports.InlineTemplate = InlineTemplate;
    /**
     * An ExternalTemplate represents template defined in an external (most likely
     * HTML, but not necessarily) file through the `templateUrl` attribute in the
     * decorator.
     * Note that there is no ts.Node associated with the template because it's not
     * a TS file.
     */
    var ExternalTemplate = /** @class */ (function (_super) {
        tslib_1.__extends(ExternalTemplate, _super);
        function ExternalTemplate(source, fileName, classDeclNode, classSymbol, host) {
            var _this = _super.call(this, host, classDeclNode, classSymbol) || this;
            _this.source = source;
            _this.fileName = fileName;
            _this.span = {
                start: 0,
                end: source.length,
            };
            return _this;
        }
        return ExternalTemplate;
    }(BaseTemplate));
    exports.ExternalTemplate = ExternalTemplate;
    /**
     * Returns a property assignment from the assignment value, or `undefined` if there is no
     * assignment.
     */
    function getPropertyAssignmentFromValue(value) {
        if (!value.parent || !ts.isPropertyAssignment(value.parent)) {
            return;
        }
        return value.parent;
    }
    exports.getPropertyAssignmentFromValue = getPropertyAssignmentFromValue;
    /**
     * Given a decorator property assignment, return the ClassDeclaration node that corresponds to the
     * directive class the property applies to.
     * If the property assignment is not on a class decorator, no declaration is returned.
     *
     * For example,
     *
     * @Component({
     *   template: '<div></div>'
     *   ^^^^^^^^^^^^^^^^^^^^^^^---- property assignment
     * })
     * class AppComponent {}
     *           ^---- class declaration node
     *
     * @param propAsgn property assignment
     */
    function getClassDeclFromDecoratorProp(propAsgnNode) {
        if (!propAsgnNode.parent || !ts.isObjectLiteralExpression(propAsgnNode.parent)) {
            return;
        }
        var objLitExprNode = propAsgnNode.parent;
        if (!objLitExprNode.parent || !ts.isCallExpression(objLitExprNode.parent)) {
            return;
        }
        var callExprNode = objLitExprNode.parent;
        if (!callExprNode.parent || !ts.isDecorator(callExprNode.parent)) {
            return;
        }
        var decorator = callExprNode.parent;
        if (!decorator.parent || !ts.isClassDeclaration(decorator.parent)) {
            return;
        }
        var classDeclNode = decorator.parent;
        return classDeclNode;
    }
    exports.getClassDeclFromDecoratorProp = getClassDeclFromDecoratorProp;
    /**
     * Determines if a property assignment is on a class decorator.
     * See `getClassDeclFromDecoratorProperty`, which gets the class the decorator is applied to, for
     * more details.
     *
     * @param prop property assignment
     */
    function isClassDecoratorProperty(propAsgn) {
        return !!getClassDeclFromDecoratorProp(propAsgn);
    }
    exports.isClassDecoratorProperty = isClassDecoratorProperty;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVtcGxhdGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9sYW5ndWFnZS1zZXJ2aWNlL3NyYy90ZW1wbGF0ZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7Ozs7Ozs7Ozs7Ozs7SUFFSCwrQkFBaUM7SUFFakMsK0VBQXlEO0lBR3pELHVGQUFtRztJQUduRzs7Ozs7T0FLRztJQUNIO1FBS0Usc0JBQ3FCLElBQTJCLEVBQzNCLGFBQWtDLEVBQ2xDLFdBQTRCO1lBRjVCLFNBQUksR0FBSixJQUFJLENBQXVCO1lBQzNCLGtCQUFhLEdBQWIsYUFBYSxDQUFxQjtZQUNsQyxnQkFBVyxHQUFYLFdBQVcsQ0FBaUI7WUFDL0MsSUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDO1FBQzlCLENBQUM7UUFTRCxzQkFBSSw4QkFBSTtZQUhSOztlQUVHO2lCQUNILGNBQWEsT0FBTyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQzs7O1dBQUE7UUFNdkMsc0JBQUksaUNBQU87WUFKWDs7O2VBR0c7aUJBQ0g7Z0JBQ0UsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLEVBQUU7b0JBQ3RCLElBQU0sV0FBVyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsY0FBYyxFQUFFLENBQUM7b0JBQ2xELElBQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsYUFBYSxFQUFFLENBQUM7b0JBQ3RELElBQUksQ0FBQyxZQUFZLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxnQkFBZ0IsQ0FBQzt3QkFDOUMsd0NBQXVCLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQzt3QkFDbkMsbURBQThCLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxXQUFXLEVBQUUsVUFBVSxFQUFFLElBQUksQ0FBQyxhQUFhLENBQUM7cUJBQzFGLENBQUMsQ0FBQztpQkFDSjtnQkFDRCxPQUFPLElBQUksQ0FB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Iiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQgKiBhcyB0cyBmcm9tICd0eXBlc2NyaXB0JztcblxuaW1wb3J0IHtjcmVhdGVHbG9iYWxTeW1ib2xUYWJsZX0gZnJvbSAnLi9nbG9iYWxfc3ltYm9scyc7XG5pbXBvcnQgKiBhcyBuZyBmcm9tICcuL3R5cGVzJztcbmltcG9ydCB7VHlwZVNjcmlwdFNlcnZpY2VIb3N0fSBmcm9tICcuL3R5cGVzY3JpcHRfaG9zdCc7XG5pbXBvcnQge2dldENsYXNzTWVtYmVyc0Zyb21EZWNsYXJhdGlvbiwgZ2V0UGlwZXNUYWJsZSwgZ2V0U3ltYm9sUXVlcnl9IGZyb20gJy4vdHlwZXNjcmlwdF9zeW1ib2xzJztcblxuXG4vKipcbiAqIEEgYmFzZSBjbGFzcyB0byByZXByZXNlbnQgYSB0ZW1wbGF0ZSBhbmQgd2hpY2ggY29tcG9uZW50IGNsYXNzIGl0IGlzXG4gKiBhc3NvY2lhdGVkIHdpdGguIEEgdGVtcGxhdGUgc291cmNlIGNvdWxkIGFuc3dlciBiYXNpYyBxdWVzdGlvbnMgYWJvdXRcbiAqIHRvcC1sZXZlbCBkZWNsYXJhdGlvbnMgb2YgaXRzIGNsYXNzIHRocm91Z2ggdGhlIG1lbWJlcnMoKSBhbmQgcXVlcnkoKVxuICogbWV0aG9kcy5cbiAqL1xuYWJzdHJhY3QgY2xhc3MgQmFzZVRlbXBsYXRlIGltcGxlbWVudHMgbmcuVGVtcGxhdGVTb3VyY2Uge1xuICBwcml2YXRlIHJlYWRvbmx5IHByb2dyYW06IHRzLlByb2dyYW07XG4gIHByaXZhdGUgbWVtYmVyc1RhYmxlOiBuZy5TeW1ib2xUYWJsZXx1bmRlZmluZWQ7XG4gIHByaXZhdGUgcXVlcnlDYWNoZTogbmcuU3ltYm9sUXVlcnl8dW5kZWZpbmVkO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgICAgcHJpdmF0ZSByZWFkb25seSBob3N0OiBUeXBlU2NyaXB0U2VydmljZUhvc3QsXG4gICAgICBwcml2YXRlIHJlYWRvbmx5IGNsYXNzRGVjbE5vZGU6IHRzLkNsYXNzRGVjbGFyYXRpb24sXG4gICAgICBwcml2YXRlIHJlYWRvbmx5IGNsYXNzU3ltYm9sOiBuZy5TdGF0aWNTeW1ib2wpIHtcbiAgICB0aGlzLnByb2dyYW0gPSBob3N0LnByb2dyYW07XG4gIH1cblxuICBhYnN0cmFjdCBnZXQgc3BhbigpOiBuZy5TcGFuO1xuICBhYnN0cmFjdCBnZXQgZmlsZU5hbWUoKTogc3RyaW5nO1xuICBhYnN0cmFjdCBnZXQgc291cmNlKCk6IHN0cmluZztcblxuICAvKipcbiAgICogUmV0dXJuIHRoZSBBbmd1bGFyIFN0YXRpY1N5bWJvbCBmb3IgdGhlIGNsYXNzIHRoYXQgY29udGFpbnMgdGhpcyB0ZW1wbGF0ZS5cbiAgICovXG4gIGdldCB0eXBlKCkgeyByZXR1cm4gdGhpcy5jbGFzc1N5bWJvbDsgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm4gYSBNYXAtbGlrZSBkYXRhIHN0cnVjdHVyZSB0aGF0IGFsbG93cyB1c2VycyB0byByZXRyaWV2ZSBzb21lIG9yIGFsbFxuICAgKiB0b3AtbGV2ZWwgZGVjbGFyYXRpb25zIGluIHRoZSBhc3NvY2lhdGVkIGNvbXBvbmVudCBjbGFzcy5cbiAgICovXG4gIGdldCBtZW1iZXJzKCkge1xuICAgIGlmICghdGhpcy5tZW1iZXJzVGFibGUpIHtcbiAgICAgIGNvbnN0IHR5cGVDaGVja2VyID0gdGhpcy5wcm9ncmFtLmdldFR5cGVDaGVja2VyKCk7XG4gICAgICBjb25zdCBzb3VyY2VGaWxlID0gdGhpcy5jbGFzc0RlY2xOb2RlLmdldFNvdXJjZUZpbGUoKTtcbiAgICAgIHRoaXMubWVtYmVyc1RhYmxlID0gdGhpcy5xdWVyeS5tZXJnZVN5bWJvbFRhYmxlKFtcbiAgICAgICAgY3JlYXRlR2xvYmFsU3ltYm9sVGFibGUodGhpcy5xdWVyeSksXG4gICAgICAgIGdldENsYXNzTWVtYmVyc0Zyb21EZWNsYXJhdGlvbih0aGlzLnByb2dyYW0sIHR5cGVDaGVja2VyLCBzb3VyY2VGaWxlLCB0aGlzLmNsYXNzRGVjbE5vZGUpLFxuICAgICAgXSk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLm1lbWJlcnNUYWJsZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm4gYW4gZW5naW5lIHRoYXQgcHJvdmlkZXMgbW9yZSBpbmZvcm1hdGlvbiBhYm91dCBzeW1ib2xzIGluIHRoZVxuICAgKiB0ZW1wbGF0ZS5cbiAgICovXG4gIGdldCBxdWVyeSgpIHtcbiAgICBpZiAoIXRoaXMucXVlcnlDYWNoZSkge1xuICAgICAgY29uc3QgcHJvZ3JhbSA9IHRoaXMucHJvZ3JhbTtcbiAgICAgIGNvbnN0IHR5cGVDaGVja2VyID0gcHJvZ3JhbS5nZXRUeXBlQ2hlY2tlcigpO1xuICAgICAgY29uc3Qgc291cmNlRmlsZSA9IHRoaXMuY2xhc3NEZWNsTm9kZS5nZXRTb3VyY2VGaWxlKCk7XG4gICAgICB0aGlzLnF1ZXJ5Q2FjaGUgPSBnZXRTeW1ib2xRdWVyeShwcm9ncmFtLCB0eXBlQ2hlY2tlciwgc291cmNlRmlsZSwgKCkgPT4ge1xuICAgICAgICAvLyBDb21wdXRpbmcgdGhlIGFzdCBpcyByZWxhdGl2ZWx5IGV4cGVuc2l2ZS4gRG8gaXQgb25seSB3aGVuIGFic29sdXRlbHlcbiAgICAgICAgLy8gbmVjZXNzYXJ5LlxuICAgICAgICAvLyBUT0RPOiBUaGVyZSBpcyBjaXJjdWxhciBkZXBlbmRlbmN5IGhlcmUgYmV0d2VlbiBUZW1wbGF0ZVNvdXJjZSBhbmRcbiAgICAgICAgLy8gVHlwZVNjcmlwdEhvc3QuIENvbnNpZGVyIHJlZmFjdG9yaW5nIHRoZSBjb2RlIHRvIGJyZWFrIHRoaXMgY3ljbGUuXG4gICAgICAgIGNvbnN0IGFzdCA9IHRoaXMuaG9zdC5nZXRUZW1wbGF0ZUFzdCh0aGlzKTtcbiAgICAgICAgY29uc3QgcGlwZXMgPSAoYXN0ICYmIGFzdC5waXBlcykgfHwgW107XG4gICAgICAgIHJldHVybiBnZXRQaXBlc1RhYmxlKHNvdXJjZUZpbGUsIHByb2dyYW0sIHR5cGVDaGVja2VyLCBwaXBlcyk7XG4gICAgICB9KTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMucXVlcnlDYWNoZTtcbiAgfVxufVxuXG4vKipcbiAqIEFuIElubGluZVRlbXBsYXRlIHJlcHJlc2VudHMgdGVtcGxhdGUgZGVmaW5lZCBpbiBhIFRTIGZpbGUgdGhyb3VnaCB0aGVcbiAqIGB0ZW1wbGF0ZWAgYXR0cmlidXRlIGluIHRoZSBkZWNvcmF0b3IuXG4gKi9cbmV4cG9ydCBjbGFzcyBJbmxpbmVUZW1wbGF0ZSBleHRlbmRzIEJhc2VUZW1wbGF0ZSB7XG4gIHB1YmxpYyByZWFkb25seSBmaWxlTmFtZTogc3RyaW5nO1xuICBwdWJsaWMgcmVhZG9ubHkgc291cmNlOiBzdHJpbmc7XG4gIHB1YmxpYyByZWFkb25seSBzcGFuOiBuZy5TcGFuO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgICAgdGVtcGxhdGVOb2RlOiB0cy5TdHJpbmdMaXRlcmFsTGlrZSwgY2xhc3NEZWNsTm9kZTogdHMuQ2xhc3NEZWNsYXJhdGlvbixcbiAgICAgIGNsYXNzU3ltYm9sOiBuZy5TdGF0aWNTeW1ib2wsIGhvc3Q6IFR5cGVTY3JpcHRTZXJ2aWNlSG9zdCkge1xuICAgIHN1cGVyKGhvc3QsIGNsYXNzRGVjbE5vZGUsIGNsYXNzU3ltYm9sKTtcbiAgICBjb25zdCBzb3VyY2VGaWxlID0gdGVtcGxhdGVOb2RlLmdldFNvdXJjZUZpbGUoKTtcbiAgICBpZiAoc291cmNlRmlsZSAhPT0gY2xhc3NEZWNsTm9kZS5nZXRTb3VyY2VGaWxlKCkpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgSW5saW5lIHRlbXBsYXRlIGFuZCBjb21wb25lbnQgY2xhc3Mgc2hvdWxkIGJlbG9uZyB0byB0aGUgc2FtZSBzb3VyY2UgZmlsZWApO1xuICAgIH1cbiAgICB0aGlzLmZpbGVOYW1lID0gc291cmNlRmlsZS5maWxlTmFtZTtcbiAgICAvLyBub2RlLnRleHQgcmV0dXJucyB0aGUgVFMgaW50ZXJuYWwgcmVwcmVzZW50YXRpb24gb2YgdGhlIG5vcm1hbGl6ZWQgdGV4dCxcbiAgICAvLyBhbmQgYWxsIENSIGNoYXJhY3RlcnMgYXJlIHN0cmlwcGVkLiBub2RlLmdldFRleHQoKSByZXR1cm5zIHRoZSByYXcgdGV4dC5cbiAgICB0aGlzLnNvdXJjZSA9IHRlbXBsYXRlTm9kZS5nZXRUZXh0KCkuc2xpY2UoMSwgLTEpOyAgLy8gc3RyaXAgbGVhZGluZyBhbmQgdHJhaWxpbmcgcXVvdGVzXG4gICAgdGhpcy5zcGFuID0ge1xuICAgICAgLy8gVFMgc3RyaW5nIGxpdGVyYWwgaW5jbHVkZXMgc3Vycm91bmRpbmcgcXVvdGVzIGluIHRoZSBzdGFydC9lbmQgb2Zmc2V0cy5cbiAgICAgIHN0YXJ0OiB0ZW1wbGF0ZU5vZGUuZ2V0U3RhcnQoKSArIDEsXG4gICAgICBlbmQ6IHRlbXBsYXRlTm9kZS5nZXRFbmQoKSAtIDEsXG4gICAgfTtcbiAgfVxufVxuXG4vKipcbiAqIEFuIEV4dGVybmFsVGVtcGxhdGUgcmVwcmVzZW50cyB0ZW1wbGF0ZSBkZWZpbmVkIGluIGFuIGV4dGVybmFsIChtb3N0IGxpa2VseVxuICogSFRNTCwgYnV0IG5vdCBuZWNlc3NhcmlseSkgZmlsZSB0aHJvdWdoIHRoZSBgdGVtcGxhdGVVcmxgIGF0dHJpYnV0ZSBpbiB0aGVcbiAqIGRlY29yYXRvci5cbiAqIE5vdGUgdGhhdCB0aGVyZSBpcyBubyB0cy5Ob2RlIGFzc29jaWF0ZWQgd2l0aCB0aGUgdGVtcGxhdGUgYmVjYXVzZSBpdCdzIG5vdFxuICogYSBUUyBmaWxlLlxuICovXG5leHBvcnQgY2xhc3MgRXh0ZXJuYWxUZW1wbGF0ZSBleHRlbmRzIEJhc2VUZW1wbGF0ZSB7XG4gIHB1YmxpYyByZWFkb25seSBzcGFuOiBuZy5TcGFuO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgICAgcHVibGljIHJlYWRvbmx5IHNvdXJjZTogc3RyaW5nLCBwdWJsaWMgcmVhZG9ubHkgZmlsZU5hbWU6IHN0cmluZyxcbiAgICAgIGNsYXNzRGVjbE5vZGU6IHRzLkNsYXNzRGVjbGFyYXRpb24sIGNsYXNzU3ltYm9sOiBuZy5TdGF0aWNTeW1ib2wsXG4gICAgICBob3N0OiBUeXBlU2NyaXB0U2VydmljZUhvc3QpIHtcbiAgICBzdXBlcihob3N0LCBjbGFzc0RlY2xOb2RlLCBjbGFzc1N5bWJvbCk7XG4gICAgdGhpcy5zcGFuID0ge1xuICAgICAgc3RhcnQ6IDAsXG4gICAgICBlbmQ6IHNvdXJjZS5sZW5ndGgsXG4gICAgfTtcbiAgfVxufVxuXG4vKipcbiAqIFJldHVybnMgYSBwcm9wZXJ0eSBhc3NpZ25tZW50IGZyb20gdGhlIGFzc2lnbm1lbnQgdmFsdWUsIG9yIGB1bmRlZmluZWRgIGlmIHRoZXJlIGlzIG5vXG4gKiBhc3NpZ25tZW50LlxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0UHJvcGVydHlBc3NpZ25tZW50RnJvbVZhbHVlKHZhbHVlOiB0cy5Ob2RlKTogdHMuUHJvcGVydHlBc3NpZ25tZW50fHVuZGVmaW5lZCB7XG4gIGlmICghdmFsdWUucGFyZW50IHx8ICF0cy5pc1Byb3BlcnR5QXNzaWdubWVudCh2YWx1ZS5wYXJlbnQpKSB7XG4gICAgcmV0dXJuO1xuICB9XG4gIHJldHVybiB2YWx1ZS5wYXJlbnQ7XG59XG5cbi8qKlxuICogR2l2ZW4gYSBkZWNvcmF0b3IgcHJvcGVydHkgYXNzaWdubWVudCwgcmV0dXJuIHRoZSBDbGFzc0RlY2xhcmF0aW9uIG5vZGUgdGhhdCBjb3JyZXNwb25kcyB0byB0aGVcbiAqIGRpcmVjdGl2ZSBjbGFzcyB0aGUgcHJvcGVydHkgYXBwbGllcyB0by5cbiAqIElmIHRoZSBwcm9wZXJ0eSBhc3NpZ25tZW50IGlzIG5vdCBvbiBhIGNsYXNzIGRlY29yYXRvciwgbm8gZGVjbGFyYXRpb24gaXMgcmV0dXJuZWQuXG4gKlxuICogRm9yIGV4YW1wbGUsXG4gKlxuICogQENvbXBvbmVudCh7XG4gKiAgIHRlbXBsYXRlOiAnPGRpdj48L2Rpdj4nXG4gKiAgIF5eXl5eXl5eXl5eXl5eXl5eXl5eXl5eLS0tLSBwcm9wZXJ0eSBhc3NpZ25tZW50XG4gKiB9KVxuICogY2xhc3MgQXBwQ29tcG9uZW50IHt9XG4gKiAgICAgICAgICAgXi0tLS0gY2xhc3MgZGVjbGFyYXRpb24gbm9kZVxuICpcbiAqIEBwYXJhbSBwcm9wQXNnbiBwcm9wZXJ0eSBhc3NpZ25tZW50XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRDbGFzc0RlY2xGcm9tRGVjb3JhdG9yUHJvcChwcm9wQXNnbk5vZGU6IHRzLlByb3BlcnR5QXNzaWdubWVudCk6XG4gICAgdHMuQ2xhc3NEZWNsYXJhdGlvbnx1bmRlZmluZWQge1xuICBpZiAoIXByb3BBc2duTm9kZS5wYXJlbnQgfHwgIXRzLmlzT2JqZWN0TGl0ZXJhbEV4cHJlc3Npb24ocHJvcEFzZ25Ob2RlLnBhcmVudCkpIHtcbiAgICByZXR1cm47XG4gIH1cbiAgY29uc3Qgb2JqTGl0RXhwck5vZGUgPSBwcm9wQXNnbk5vZGUucGFyZW50O1xuICBpZiAoIW9iakxpdEV4cHJOb2RlLnBhcmVudCB8fCAhdHMuaXNDYWxsRXhwcmVzc2lvbihvYmpMaXRFeHByTm9kZS5wYXJlbnQpKSB7XG4gICAgcmV0dXJuO1xuICB9XG4gIGNvbnN0IGNhbGxFeHByTm9kZSA9IG9iakxpdEV4cHJOb2RlLnBhcmVudDtcbiAgaWYgKCFjYWxsRXhwck5vZGUucGFyZW50IHx8ICF0cy5pc0RlY29yYXRvcihjYWxsRXhwck5vZGUucGFyZW50KSkge1xuICAgIHJldHVybjtcbiAgfVxuICBjb25zdCBkZWNvcmF0b3IgPSBjYWxsRXhwck5vZGUucGFyZW50O1xuICBpZiAoIWRlY29yYXRvci5wYXJlbnQgfHwgIXRzLmlzQ2xhc3NEZWNsYXJhdGlvbihkZWNvcmF0b3IucGFyZW50KSkge1xuICAgIHJldHVybjtcbiAgfVxuICBjb25zdCBjbGFzc0RlY2xOb2RlID0gZGVjb3JhdG9yLnBhcmVudDtcbiAgcmV0dXJuIGNsYXNzRGVjbE5vZGU7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lcyBpZiBhIHByb3BlcnR5IGFzc2lnbm1lbnQgaXMgb24gYSBjbGFzcyBkZWNvcmF0b3IuXG4gKiBTZWUgYGdldENsYXNzRGVjbEZyb21EZWNvcmF0b3JQcm9wZXJ0eWAsIHdoaWNoIGdldHMgdGhlIGNsYXNzIHRoZSBkZWNvcmF0b3IgaXMgYXBwbGllZCB0bywgZm9yXG4gKiBtb3JlIGRldGFpbHMuXG4gKlxuICogQHBhcmFtIHByb3AgcHJvcGVydHkgYXNzaWdubWVudFxuICovXG5leHBvcnQgZnVuY3Rpb24gaXNDbGFzc0RlY29yYXRvclByb3BlcnR5KHByb3BBc2duOiB0cy5Qcm9wZXJ0eUFzc2lnbm1lbnQpOiBib29sZWFuIHtcbiAgcmV0dXJuICEhZ2V0Q2xhc3NEZWNsRnJvbURlY29yYXRvclByb3AocHJvcEFzZ24pO1xufVxuIl19