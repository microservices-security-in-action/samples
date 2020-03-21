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
        define("@angular/compiler-cli/src/ngtsc/annotations/src/pipe", ["require", "exports", "tslib", "@angular/compiler", "typescript", "@angular/compiler-cli/src/ngtsc/diagnostics", "@angular/compiler-cli/src/ngtsc/imports", "@angular/compiler-cli/src/ngtsc/reflection", "@angular/compiler-cli/src/ngtsc/transform", "@angular/compiler-cli/src/ngtsc/annotations/src/factory", "@angular/compiler-cli/src/ngtsc/annotations/src/metadata", "@angular/compiler-cli/src/ngtsc/annotations/src/util"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var tslib_1 = require("tslib");
    var compiler_1 = require("@angular/compiler");
    var ts = require("typescript");
    var diagnostics_1 = require("@angular/compiler-cli/src/ngtsc/diagnostics");
    var imports_1 = require("@angular/compiler-cli/src/ngtsc/imports");
    var reflection_1 = require("@angular/compiler-cli/src/ngtsc/reflection");
    var transform_1 = require("@angular/compiler-cli/src/ngtsc/transform");
    var factory_1 = require("@angular/compiler-cli/src/ngtsc/annotations/src/factory");
    var metadata_1 = require("@angular/compiler-cli/src/ngtsc/annotations/src/metadata");
    var util_1 = require("@angular/compiler-cli/src/ngtsc/annotations/src/util");
    var PipeDecoratorHandler = /** @class */ (function () {
        function PipeDecoratorHandler(reflector, evaluator, metaRegistry, scopeRegistry, defaultImportRecorder, injectableRegistry, isCore) {
            this.reflector = reflector;
            this.evaluator = evaluator;
            this.metaRegistry = metaRegistry;
            this.scopeRegistry = scopeRegistry;
            this.defaultImportRecorder = defaultImportRecorder;
            this.injectableRegistry = injectableRegistry;
            this.isCore = isCore;
            this.precedence = transform_1.HandlerPrecedence.PRIMARY;
            this.name = PipeDecoratorHandler.name;
        }
        PipeDecoratorHandler.prototype.detect = function (node, decorators) {
            if (!decorators) {
                return undefined;
            }
            var decorator = util_1.findAngularDecorator(decorators, 'Pipe', this.isCore);
            if (decorator !== undefined) {
                return {
                    trigger: decorator.node,
                    decorator: decorator,
                    metadata: decorator,
                };
            }
            else {
                return undefined;
            }
        };
        PipeDecoratorHandler.prototype.analyze = function (clazz, decorator) {
            var name = clazz.name.text;
            var type = util_1.wrapTypeReference(this.reflector, clazz);
            var internalType = new compiler_1.WrappedNodeExpr(this.reflector.getInternalNameOfClass(clazz));
            if (decorator.args === null) {
                throw new diagnostics_1.FatalDiagnosticError(diagnostics_1.ErrorCode.DECORATOR_NOT_CALLED, reflection_1.Decorator.nodeForError(decorator), "@Pipe must be called");
            }
            if (decorator.args.length !== 1) {
                throw new diagnostics_1.FatalDiagnosticError(diagnostics_1.ErrorCode.DECORATOR_ARITY_WRONG, reflection_1.Decorator.nodeForError(decorator), '@Pipe must have exactly one argument');
            }
            var meta = util_1.unwrapExpression(decorator.args[0]);
            if (!ts.isObjectLiteralExpression(meta)) {
                throw new diagnostics_1.FatalDiagnosticError(diagnostics_1.ErrorCode.DECORATOR_ARG_NOT_LITERAL, meta, '@Pipe must have a literal argument');
            }
            var pipe = reflection_1.reflectObjectLiteral(meta);
            if (!pipe.has('name')) {
                throw new diagnostics_1.FatalDiagnosticError(diagnostics_1.ErrorCode.PIPE_MISSING_NAME, meta, "@Pipe decorator is missing name field");
            }
            var pipeNameExpr = pipe.get('name');
            var pipeName = this.evaluator.evaluate(pipeNameExpr);
            if (typeof pipeName !== 'string') {
                throw new diagnostics_1.FatalDiagnosticError(diagnostics_1.ErrorCode.VALUE_HAS_WRONG_TYPE, pipeNameExpr, "@Pipe.name must be a string");
            }
            var pure = true;
            if (pipe.has('pure')) {
                var expr = pipe.get('pure');
                var pureValue = this.evaluator.evaluate(expr);
                if (typeof pureValue !== 'boolean') {
                    throw new diagnostics_1.FatalDiagnosticError(diagnostics_1.ErrorCode.VALUE_HAS_WRONG_TYPE, expr, "@Pipe.pure must be a boolean");
                }
                pure = pureValue;
            }
            return {
                analysis: {
                    meta: {
                        name: name,
                        type: type,
                        internalType: internalType,
                        typeArgumentCount: this.reflector.getGenericArityOfClass(clazz) || 0, pipeName: pipeName,
                        deps: util_1.getValidConstructorDependencies(clazz, this.reflector, this.defaultImportRecorder, this.isCore),
                        pure: pure,
                    },
                    metadataStmt: metadata_1.generateSetClassMetadataCall(clazz, this.reflector, this.defaultImportRecorder, this.isCore),
                },
            };
        };
        PipeDecoratorHandler.prototype.register = function (node, analysis) {
            var ref = new imports_1.Reference(node);
            this.metaRegistry.registerPipeMetadata({ ref: ref, name: analysis.meta.pipeName });
            this.injectableRegistry.registerInjectable(node);
        };
        PipeDecoratorHandler.prototype.resolve = function (node) {
            var duplicateDeclData = this.scopeRegistry.getDuplicateDeclarations(node);
            if (duplicateDeclData !== null) {
                // This pipe was declared twice (or more).
                return {
                    diagnostics: [util_1.makeDuplicateDeclarationError(node, duplicateDeclData, 'Pipe')],
                };
            }
            return {};
        };
        PipeDecoratorHandler.prototype.compile = function (node, analysis) {
            var meta = analysis.meta;
            var res = compiler_1.compilePipeFromMetadata(meta);
            var factoryRes = factory_1.compileNgFactoryDefField(tslib_1.__assign(tslib_1.__assign({}, meta), { injectFn: compiler_1.Identifiers.directiveInject, target: compiler_1.R3FactoryTarget.Pipe }));
            if (analysis.metadataStmt !== null) {
                factoryRes.statements.push(analysis.metadataStmt);
            }
            return [
                factoryRes, {
                    name: 'ɵpipe',
                    initializer: res.expression,
                    statements: [],
                    type: res.type,
                }
            ];
        };
        return PipeDecoratorHandler;
    }());
    exports.PipeDecoratorHandler = PipeDecoratorHandler;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGlwZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbXBpbGVyLWNsaS9zcmMvbmd0c2MvYW5ub3RhdGlvbnMvc3JjL3BpcGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOzs7Ozs7Ozs7Ozs7O0lBRUgsOENBQW9JO0lBQ3BJLCtCQUFpQztJQUVqQywyRUFBa0U7SUFDbEUsbUVBQStEO0lBRy9ELHlFQUFtRztJQUVuRyx1RUFBZ0k7SUFFaEksbUZBQW1EO0lBQ25ELHFGQUF3RDtJQUN4RCw2RUFBaUo7SUFPako7UUFDRSw4QkFDWSxTQUF5QixFQUFVLFNBQTJCLEVBQzlELFlBQThCLEVBQVUsYUFBdUMsRUFDL0UscUJBQTRDLEVBQzVDLGtCQUEyQyxFQUFVLE1BQWU7WUFIcEUsY0FBUyxHQUFULFNBQVMsQ0FBZ0I7WUFBVSxjQUFTLEdBQVQsU0FBUyxDQUFrQjtZQUM5RCxpQkFBWSxHQUFaLFlBQVksQ0FBa0I7WUFBVSxrQkFBYSxHQUFiLGFBQWEsQ0FBMEI7WUFDL0UsMEJBQXFCLEdBQXJCLHFCQUFxQixDQUF1QjtZQUM1Qyx1QkFBa0IsR0FBbEIsa0JBQWtCLENBQXlCO1lBQVUsV0FBTSxHQUFOLE1BQU0sQ0FBUztZQUV2RSxlQUFVLEdBQUcsNkJBQWlCLENBQUMsT0FBTyxDQUFDO1lBQ3ZDLFNBQUksR0FBRyxvQkFBb0IsQ0FBQyxJQUFJLENBQUM7UUFIeUMsQ0FBQztRQUtwRixxQ0FBTSxHQUFOLFVBQU8sSUFBc0IsRUFBRSxVQUE0QjtZQUN6RCxJQUFJLENBQUMsVUFBVSxFQUFFO2dCQUNmLE9BQU8sU0FBUyxDQUFDO2FBQ2xCO1lBQ0QsSUFBTSxTQUFTLEdBQUcsMkJBQW9CLENBQUMsVUFBVSxFQUFFLE1BQU0sRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDeEUsSUFBSSxTQUFTLEtBQUssU0FBUyxFQUFFO2dCQUMzQixPQUFPO29C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QUFNLElBQUksR0FBRyxRQUFRLENBQUMsSUFBSSxDQUFDO1lBQzNCLElBQU0sR0FBRyxHQUFHLGtDQUF1QixDQUFDLElBQUksQ0FBQyxDQUFDO1lBQzFDLElBQU0sVUFBVSxHQUFHLGtDQUF3Qix1Q0FDdEMsSUFBSSxLQUNQLFFBQVEsRUFBRSxzQkFBVyxDQUFDLGVBQWUsRUFDckMsTUFBTSxFQUFFLDBCQUFlLENBQUMsSUFBSSxJQUM1QixDQUFDO1lBQ0gsSUFBSSxRQUFRLENBQUMsWUFBWSxLQUFLLElBQUksRUFBRTtnQkFDbEMsVUFBVSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLFlBQVksQ0FBQyxDQUFDO2FBQ25EO1lBQ0QsT0FBTztnQkFDTCxVQUFVLEVBQUU7b0JBQ1YsSUFBSSxFQUFFLE9BQU87b0JBQ2IsV0FBVyxFQUFFLEdBQUcsQ0FBQyxVQUFVO29CQUMzQixVQUFVLEVBQUUsRUFBRTtvQkFDZCxJQUFJLEVBQUUsR0FBRyxDQUFDLElBQUk7aUJBQ2Y7YUFDRixDQUFDO1FBQ0osQ0FBQztRQUNILDJCQUFDO0lBQUQsQ0FBQyxBQS9IRCxJQStIQztJQS9IWSxvREFBb0IiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7SWRlbnRpZmllcnMsIFIzRmFjdG9yeVRhcmdldCwgUjNQaXBlTWV0YWRhdGEsIFN0YXRlbWVudCwgV3JhcHBlZE5vZGVFeHByLCBjb21waWxlUGlwZUZyb21NZXRhZGF0YX0gZnJvbSAnQGFuZ3VsYXIvY29tcGlsZXInO1xuaW1wb3J0ICogYXMgdHMgZnJvbSAndHlwZXNjcmlwdCc7XG5cbmltcG9ydCB7RXJyb3JDb2RlLCBGYXRhbERpYWdub3N0aWNFcnJvcn0gZnJvbSAnLi4vLi4vZGlhZ25vc3RpY3MnO1xuaW1wb3J0IHtEZWZhdWx0SW1wb3J0UmVjb3JkZXIsIFJlZmVyZW5jZX0gZnJvbSAnLi4vLi4vaW1wb3J0cyc7XG5pbXBvcnQge0luamVjdGFibGVDbGFzc1JlZ2lzdHJ5LCBNZXRhZGF0YVJlZ2lzdHJ5fSBmcm9tICcuLi8uLi9tZXRhZGF0YSc7XG5pbXBvcnQge1BhcnRpYWxFdmFsdWF0b3J9IGZyb20gJy4uLy4uL3BhcnRpYWxfZXZhbHVhdG9yJztcbmltcG9ydCB7Q2xhc3NEZWNsYXJhdGlvbiwgRGVjb3JhdG9yLCBSZWZsZWN0aW9uSG9zdCwgcmVmbGVjdE9iamVjdExpdGVyYWx9IGZyb20gJy4uLy4uL3JlZmxlY3Rpb24nO1xuaW1wb3J0IHtMb2NhbE1vZHVsZVNjb3BlUmVnaXN0cnl9IGZyb20gJy4uLy4uL3Njb3BlJztcbmltcG9ydCB7QW5hbHlzaXNPdXRwdXQsIENvbXBpbGVSZXN1bHQsIERlY29yYXRvckhhbmRsZXIsIERldGVjdFJlc3VsdCwgSGFuZGxlclByZWNlZGVuY2UsIFJlc29sdmVSZXN1bHR9IGZyb20gJy4uLy4uL3RyYW5zZm9ybSc7XG5cbmltcG9ydCB7Y29tcGlsZU5nRmFjdG9yeURlZkZpZWxkfSBmcm9tICcuL2ZhY3RvcnknO1xuaW1wb3J0IHtnZW5lcmF0ZVNldENsYXNzTWV0YWRhdGFDYWxsfSBmcm9tICcuL21ldGFkYXRhJztcbmltcG9ydCB7ZmluZEFuZ3VsYXJEZWNvcmF0b3IsIGdldFZhbGlkQ29uc3RydWN0b3JEZXBlbmRlbmNpZXMsIG1ha2VEdXBsaWNhdGVEZWNsYXJhdGlvbkVycm9yLCB1bndyYXBFeHByZXNzaW9uLCB3cmFwVHlwZVJlZmVyZW5jZX0gZnJvbSAnLi91dGlsJztcblxuZXhwb3J0IGludGVyZmFjZSBQaXBlSGFuZGxlckRhdGEge1xuICBtZXRhOiBSM1BpcGVNZXRhZGF0YTtcbiAgbWV0YWRhdGFTdG10OiBTdGF0ZW1lbnR8bnVsbDtcbn1cblxuZXhwb3J0IGNsYXNzIFBpcGVEZWNvcmF0b3JIYW5kbGVyIGltcGxlbWVudHMgRGVjb3JhdG9ySGFuZGxlcjxEZWNvcmF0b3IsIFBpcGVIYW5kbGVyRGF0YSwgdW5rbm93bj4ge1xuICBjb25zdHJ1Y3RvcihcbiAgICAgIHByaXZhdGUgcmVmbGVjdG9yOiBSZWZsZWN0aW9uSG9zdCwgcHJpdmF0ZSBldmFsdWF0b3I6IFBhcnRpYWxFdmFsdWF0b3IsXG4gICAgICBwcml2YXRlIG1ldGFSZWdpc3RyeTogTWV0YWRhdGFSZWdpc3RyeSwgcHJpdmF0ZSBzY29wZVJlZ2lzdHJ5OiBMb2NhbE1vZHVsZVNjb3BlUmVnaXN0cnksXG4gICAgICBwcml2YXRlIGRlZmF1bHRJbXBvcnRSZWNvcmRlcjogRGVmYXVsdEltcG9ydFJlY29yZGVyLFxuICAgICAgcHJpdmF0ZSBpbmplY3RhYmxlUmVnaXN0cnk6IEluamVjdGFibGVDbGFzc1JlZ2lzdHJ5LCBwcml2YXRlIGlzQ29yZTogYm9vbGVhbikge31cblxuICByZWFkb25seSBwcmVjZWRlbmNlID0gSGFuZGxlclByZWNlZGVuY2UuUFJJTUFSWTtcbiAgcmVhZG9ubHkgbmFtZSA9IFBpcGVEZWNvcmF0b3JIYW5kbGVyLm5hbWU7XG5cbiAgZGV0ZWN0KG5vZGU6IENsYXNzRGVjbGFyYXRpb24sIGRlY29yYXRvcnM6IERlY29yYXRvcltdfG51bGwpOiBEZXRlY3RSZXN1bHQ8RGVjb3JhdG9yPnx1bmRlZmluZWQge1xuICAgIGlmICghZGVjb3JhdG9ycykge1xuICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICB9XG4gICAgY29uc3QgZGVjb3JhdG9yID0gZmluZEFuZ3VsYXJEZWNvcmF0b3IoZGVjb3JhdG9ycywgJ1BpcGUnLCB0aGlzLmlzQ29yZSk7XG4gICAgaWYgKGRlY29yYXRvciAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICB0cmlnZ2VyOiBkZWNvcmF0b3Iubm9kZSxcbiAgICAgICAgZGVjb3JhdG9yOiBkZWNvcmF0b3IsXG4gICAgICAgIG1ldGFkYXRhOiBkZWNvcmF0b3IsXG4gICAgICB9O1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIH1cbiAgfVxuXG4gIGFuYWx5emUoY2xheno6IENsYXNzRGVjbGFyYXRpb24sIGRlY29yYXRvcjogUmVhZG9ubHk8RGVjb3JhdG9yPik6XG4gICAgICBBbmFseXNpc091dHB1dDxQaXBlSGFuZGxlckRhdGE+IHtcbiAgICBjb25zdCBuYW1lID0gY2xhenoubmFtZS50ZXh0O1xuICAgIGNvbnN0IHR5cGUgPSB3cmFwVHlwZVJlZmVyZW5jZSh0aGlzLnJlZmxlY3RvciwgY2xhenopO1xuICAgIGNvbnN0IGludGVybmFsVHlwZSA9IG5ldyBXcmFwcGVkTm9kZUV4cHIodGhpcy5yZWZsZWN0b3IuZ2V0SW50ZXJuYWxOYW1lT2ZDbGFzcyhjbGF6eikpO1xuXG4gICAgaWYgKGRlY29yYXRvci5hcmdzID09PSBudWxsKSB7XG4gICAgICB0aHJvdyBuZXcgRmF0YWxEaWFnbm9zdGljRXJyb3IoXG4gICAgICAgICAgRXJyb3JDb2RlLkRFQ09SQVRPUl9OT1RfQ0FMTEVELCBEZWNvcmF0b3Iubm9kZUZvckVycm9yKGRlY29yYXRvciksXG4gICAgICAgICAgYEBQaXBlIG11c3QgYmUgY2FsbGVkYCk7XG4gICAgfVxuICAgIGlmIChkZWNvcmF0b3IuYXJncy5sZW5ndGggIT09IDEpIHtcbiAgICAgIHRocm93IG5ldyBGYXRhbERpYWdub3N0aWNFcnJvcihcbiAgICAgICAgICBFcnJvckNvZGUuREVDT1JBVE9SX0FSSVRZX1dST05HLCBEZWNvcmF0b3Iubm9kZUZvckVycm9yKGRlY29yYXRvciksXG4gICAgICAgICAgJ0BQaXBlIG11c3QgaGF2ZSBleGFjdGx5IG9uZSBhcmd1bWVudCcpO1xuICAgIH1cbiAgICBjb25zdCBtZXRhID0gdW53cmFwRXhwcmVzc2lvbihkZWNvcmF0b3IuYXJnc1swXSk7XG4gICAgaWYgKCF0cy5pc09iamVjdExpdGVyYWxFeHByZXNzaW9uKG1ldGEpKSB7XG4gICAgICB0aHJvdyBuZXcgRmF0YWxEaWFnbm9zdGljRXJyb3IoXG4gICAgICAgICAgRXJyb3JDb2RlLkRFQ09SQVRPUl9BUkdfTk9UX0xJVEVSQUwsIG1ldGEsICdAUGlwZSBtdXN0IGhhdmUgYSBsaXRlcmFsIGFyZ3VtZW50Jyk7XG4gICAgfVxuICAgIGNvbnN0IHBpcGUgPSByZWZsZWN0T2JqZWN0TGl0ZXJhbChtZXRhKTtcblxuICAgIGlmICghcGlwZS5oYXMoJ25hbWUnKSkge1xuICAgICAgdGhyb3cgbmV3IEZhdGFsRGlhZ25vc3RpY0Vycm9yKFxuICAgICAgICAgIEVycm9yQ29kZS5QSVBFX01JU1NJTkdfTkFNRSwgbWV0YSwgYEBQaXBlIGRlY29yYXRvciBpcyBtaXNzaW5nIG5hbWUgZmllbGRgKTtcbiAgICB9XG4gICAgY29uc3QgcGlwZU5hbWVFeHByID0gcGlwZS5nZXQoJ25hbWUnKSAhO1xuICAgIGNvbnN0IHBpcGVOYW1lID0gdGhpcy5ldmFsdWF0b3IuZXZhbHVhdGUocGlwZU5hbWVFeHByKTtcbiAgICBpZiAodHlwZW9mIHBpcGVOYW1lICE9PSAnc3RyaW5nJykge1xuICAgICAgdGhyb3cgbmV3IEZhdGFsRGlhZ25vc3RpY0Vycm9yKFxuICAgICAgICAgIEVycm9yQ29kZS5WQUxVRV9IQVNfV1JPTkdfVFlQRSwgcGlwZU5hbWVFeHByLCBgQFBpcGUubmFtZSBtdXN0IGJlIGEgc3RyaW5nYCk7XG4gICAgfVxuXG4gICAgbGV0IHB1cmUgPSB0cnVlO1xuICAgIGlmIChwaXBlLmhhcygncHVyZScpKSB7XG4gICAgICBjb25zdCBleHByID0gcGlwZS5nZXQoJ3B1cmUnKSAhO1xuICAgICAgY29uc3QgcHVyZVZhbHVlID0gdGhpcy5ldmFsdWF0b3IuZXZhbHVhdGUoZXhwcik7XG4gICAgICBpZiAodHlwZW9mIHB1cmVWYWx1ZSAhPT0gJ2Jvb2xlYW4nKSB7XG4gICAgICAgIHRocm93IG5ldyBGYXRhbERpYWdub3N0aWNFcnJvcihcbiAgICAgICAgICAgIEVycm9yQ29kZS5WQUxVRV9IQVNfV1JPTkdfVFlQRSwgZXhwciwgYEBQaXBlLnB1cmUgbXVzdCBiZSBhIGJvb2xlYW5gKTtcbiAgICAgIH1cbiAgICAgIHB1cmUgPSBwdXJlVmFsdWU7XG4gICAgfVxuXG4gICAgcmV0dXJuIHtcbiAgICAgIGFuYWx5c2lzOiB7XG4gICAgICAgIG1ldGE6IHtcbiAgICAgICAgICBuYW1lLFxuICAgICAgICAgIHR5cGUsXG4gICAgICAgICAgaW50ZXJuYWxUeXBlLFxuICAgICAgICAgIHR5cGVBcmd1bWVudENvdW50OiB0aGlzLnJlZmxlY3Rvci5nZXRHZW5lcmljQXJpdHlPZkNsYXNzKGNsYXp6KSB8fCAwLCBwaXBlTmFtZSxcbiAgICAgICAgICBkZXBzOiBnZXRWYWxpZENvbnN0cnVjdG9yRGVwZW5kZW5jaWVzKFxuICAgICAgICAgICAgICBjbGF6eiwgdGhpcy5yZWZsZWN0b3IsIHRoaXMuZGVmYXVsdEltcG9ydFJlY29yZGVyLCB0aGlzLmlzQ29yZSksXG4gICAgICAgICAgcHVyZSxcbiAgICAgICAgfSxcbiAgICAgICAgbWV0YWRhdGFTdG10OiBnZW5lcmF0ZVNldENsYXNzTWV0YWRhdGFDYWxsKFxuICAgICAgICAgICAgY2xhenosIHRoaXMucmVmbGVjdG9yLCB0aGlzLmRlZmF1bHRJbXBvcnRSZWNvcmRlciwgdGhpcy5pc0NvcmUpLFxuICAgICAgfSxcbiAgICB9O1xuICB9XG5cbiAgcmVnaXN0ZXIobm9kZTogQ2xhc3NEZWNsYXJhdGlvbiwgYW5hbHlzaXM6IFJlYWRvbmx5PFBpcGVIYW5kbGVyRGF0YT4pOiB2b2lkIHtcbiAgICBjb25zdCByZWYgPSBuZXcgUmVmZXJlbmNlKG5vZGUpO1xuICAgIHRoaXMubWV0YVJlZ2lzdHJ5LnJlZ2lzdGVyUGlwZU1ldGFkYXRhKHtyZWYsIG5hbWU6IGFuYWx5c2lzLm1ldGEucGlwZU5hbWV9KTtcblxuICAgIHRoaXMuaW5qZWN0YWJsZVJlZ2lzdHJ5LnJlZ2lzdGVySW5qZWN0YWJsZShub2RlKTtcbiAgfVxuXG4gIHJlc29sdmUobm9kZTogQ2xhc3NEZWNsYXJhdGlvbik6IFJlc29sdmVSZXN1bHQ8dW5rbm93bj4ge1xuICAgIGNvbnN0IGR1cGxpY2F0ZURlY2xEYXRhID0gdGhpcy5zY29wZVJlZ2lzdHJ5LmdldER1cGxpY2F0ZURlY2xhcmF0aW9ucyhub2RlKTtcbiAgICBpZiAoZHVwbGljYXRlRGVjbERhdGEgIT09IG51bGwpIHtcbiAgICAgIC8vIFRoaXMgcGlwZSB3YXMgZGVjbGFyZWQgdHdpY2UgKG9yIG1vcmUpLlxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgZGlhZ25vc3RpY3M6IFttYWtlRHVwbGljYXRlRGVjbGFyYXRpb25FcnJvcihub2RlLCBkdXBsaWNhdGVEZWNsRGF0YSwgJ1BpcGUnKV0sXG4gICAgICB9O1xuICAgIH1cblxuICAgIHJldHVybiB7fTtcbiAgfVxuXG4gIGNvbXBpbGUobm9kZTogQ2xhc3NEZWNsYXJhdGlvbiwgYW5hbHlzaXM6IFJlYWRvbmx5PFBpcGVIYW5kbGVyRGF0YT4pOiBDb21waWxlUmVzdWx0W10ge1xuICAgIGNvbnN0IG1ldGEgPSBhbmFseXNpcy5tZXRhO1xuICAgIGNvbnN0IHJlcyA9IGNvbXBpbGVQaXBlRnJvbU1ldGFkYXRhKG1ldGEpO1xuICAgIGNvbnN0IGZhY3RvcnlSZXMgPSBjb21waWxlTmdGYWN0b3J5RGVmRmllbGQoe1xuICAgICAgLi4ubWV0YSxcbiAgICAgIGluamVjdEZuOiBJZGVudGlmaWVycy5kaXJlY3RpdmVJbmplY3QsXG4gICAgICB0YXJnZXQ6IFIzRmFjdG9yeVRhcmdldC5QaXBlLFxuICAgIH0pO1xuICAgIGlmIChhbmFseXNpcy5tZXRhZGF0YVN0bXQgIT09IG51bGwpIHtcbiAgICAgIGZhY3RvcnlSZXMuc3RhdGVtZW50cy5wdXNoKGFuYWx5c2lzLm1ldGFkYXRhU3RtdCk7XG4gICAgfVxuICAgIHJldHVybiBbXG4gICAgICBmYWN0b3J5UmVzLCB7XG4gICAgICAgIG5hbWU6ICfJtXBpcGUnLFxuICAgICAgICBpbml0aWFsaXplcjogcmVzLmV4cHJlc3Npb24sXG4gICAgICAgIHN0YXRlbWVudHM6IFtdLFxuICAgICAgICB0eXBlOiByZXMudHlwZSxcbiAgICAgIH1cbiAgICBdO1xuICB9XG59XG4iXX0=