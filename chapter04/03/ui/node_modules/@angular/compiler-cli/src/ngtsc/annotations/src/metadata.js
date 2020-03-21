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
        define("@angular/compiler-cli/src/ngtsc/annotations/src/metadata", ["require", "exports", "@angular/compiler", "typescript", "@angular/compiler-cli/src/ngtsc/annotations/src/util"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var compiler_1 = require("@angular/compiler");
    var ts = require("typescript");
    var util_1 = require("@angular/compiler-cli/src/ngtsc/annotations/src/util");
    /**
     * Given a class declaration, generate a call to `setClassMetadata` with the Angular metadata
     * present on the class or its member fields.
     *
     * If no such metadata is present, this function returns `null`. Otherwise, the call is returned
     * as a `Statement` for inclusion along with the class.
     */
    function generateSetClassMetadataCall(clazz, reflection, defaultImportRecorder, isCore, annotateForClosureCompiler) {
        if (!reflection.isClass(clazz)) {
            return null;
        }
        var id = ts.updateIdentifier(reflection.getAdjacentNameOfClass(clazz));
        // Reflect over the class decorators. If none are present, or those that are aren't from
        // Angular, then return null. Otherwise, turn them into metadata.
        var classDecorators = reflection.getDecoratorsOfDeclaration(clazz);
        if (classDecorators === null) {
            return null;
        }
        var ngClassDecorators = classDecorators.filter(function (dec) { return isAngularDecorator(dec, isCore); })
            .map(function (decorator) { return decoratorToMetadata(decorator, annotateForClosureCompiler); });
        if (ngClassDecorators.length === 0) {
            return null;
        }
        var metaDecorators = ts.createArrayLiteral(ngClassDecorators);
        // Convert the constructor parameters to metadata, passing null if none are present.
        var metaCtorParameters = new compiler_1.LiteralExpr(null);
        var classCtorParameters = reflection.getConstructorParameters(clazz);
        if (classCtorParameters !== null) {
            var ctorParameters = classCtorParameters.map(function (param) { return ctorParameterToMetadata(param, defaultImportRecorder, isCore); });
            metaCtorParameters = new compiler_1.FunctionExpr([], [
                new compiler_1.ReturnStatement(new compiler_1.LiteralArrayExpr(ctorParameters)),
            ]);
        }
        // Do the same for property decorators.
        var metaPropDecorators = ts.createNull();
        var classMembers = reflection.getMembersOfClass(clazz).filter(function (member) { return !member.isStatic && member.decorators !== null && member.decorators.length > 0; });
        var duplicateDecoratedMemberNames = classMembers.map(function (member) { return member.name; }).filter(function (name, i, arr) { return arr.indexOf(name) < i; });
        if (duplicateDecoratedMemberNames.length > 0) {
            // This should theoretically never happen, because the only way to have duplicate instance
            // member names is getter/setter pairs and decorators cannot appear in both a getter and the
            // corresponding setter.
            throw new Error("Duplicate decorated properties found on class '" + clazz.name.text + "': " +
                duplicateDecoratedMemberNames.join(', '));
        }
        var decoratedMembers = classMembers.map(function (member) { return classMemberToMetadata(member.name, member.decorators, isCore); });
        if (decoratedMembers.length > 0) {
            metaPropDecorators = ts.createObjectLiteral(decoratedMembers);
        }
        // Generate a pure call to setClassMetadata with the class identifier and its metadata.
        var setClassMetadata = new compiler_1.ExternalExpr(compiler_1.Identifiers.setClassMetadata);
        var fnCall = new compiler_1.InvokeFunctionExpr(
        /* fn */ setClassMetadata, 
        /* args */
        [
            new compiler_1.WrappedNodeExpr(id),
            new compiler_1.WrappedNodeExpr(metaDecorators),
            metaCtorParameters,
            new compiler_1.WrappedNodeExpr(metaPropDecorators),
        ]);
        var iifeFn = new compiler_1.FunctionExpr([], [fnCall.toStmt()], compiler_1.NONE_TYPE);
        var iife = new compiler_1.InvokeFunctionExpr(
        /* fn */ iifeFn, 
        /* args */ [], 
        /* type */ undefined, 
        /* sourceSpan */ undefined, 
        /* pure */ true);
        return iife.toStmt();
    }
    exports.generateSetClassMetadataCall = generateSetClassMetadataCall;
    /**
     * Convert a reflected constructor parameter to metadata.
     */
    function ctorParameterToMetadata(param, defaultImportRecorder, isCore) {
        // Parameters sometimes have a type that can be referenced. If so, then use it, otherwise
        // its type is undefined.
        var type = param.typeValueReference !== null ?
            util_1.valueReferenceToExpression(param.typeValueReference, defaultImportRecorder) :
            new compiler_1.LiteralExpr(undefined);
        var mapEntries = [
            { key: 'type', value: type, quoted: false },
        ];
        // If the parameter has decorators, include the ones from Angular.
        if (param.decorators !== null) {
            var ngDecorators = param.decorators.filter(function (dec) { return isAngularDecorator(dec, isCore); })
                .map(function (decorator) { return decoratorToMetadata(decorator); });
            var value = new compiler_1.WrappedNodeExpr(ts.createArrayLiteral(ngDecorators));
            mapEntries.push({ key: 'decorators', value: value, quoted: false });
        }
        return compiler_1.literalMap(mapEntries);
    }
    /**
     * Convert a reflected class member to metadata.
     */
    function classMemberToMetadata(name, decorators, isCore) {
        var ngDecorators = decorators.filter(function (dec) { return isAngularDecorator(dec, isCore); })
            .map(function (decorator) { return decoratorToMetadata(decorator); });
        var decoratorMeta = ts.createArrayLiteral(ngDecorators);
        return ts.createPropertyAssignment(name, decoratorMeta);
    }
    /**
     * Convert a reflected decorator to metadata.
     */
    function decoratorToMetadata(decorator, wrapFunctionsInParens) {
        if (decorator.identifier === null) {
            throw new Error('Illegal state: synthesized decorator cannot be emitted in class metadata.');
        }
        // Decorators have a type.
        var properties = [
            ts.createPropertyAssignment('type', ts.getMutableClone(decorator.identifier)),
        ];
        // Sometimes they have arguments.
        if (decorator.args !== null && decorator.args.length > 0) {
            var args = decorator.args.map(function (arg) {
                var expr = ts.getMutableClone(arg);
                return wrapFunctionsInParens ? util_1.wrapFunctionExpressionsInParens(expr) : expr;
            });
            properties.push(ts.createPropertyAssignment('args', ts.createArrayLiteral(args)));
        }
        return ts.createObjectLiteral(properties, true);
    }
    /**
     * Whether a given decorator should be treated as an Angular decorator.
     *
     * Either it's used in @angular/core, or it's imported from there.
     */
    function isAngularDecorator(decorator, isCore) {
        return isCore || (decorator.import !== null && decorator.import.from === '@angular/core');
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWV0YWRhdGEuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21waWxlci1jbGkvc3JjL25ndHNjL2Fubm90YXRpb25zL3NyYy9tZXRhZGF0YS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7Ozs7Ozs7Ozs7OztJQUVILDhDQUE2TTtJQUM3TSwrQkFBaUM7SUFLakMsNkVBQW1GO0lBR25GOzs7Ozs7T0FNRztJQUNILFNBQWdCLDRCQUE0QixDQUN4QyxLQUFxQixFQUFFLFVBQTBCLEVBQUUscUJBQTRDLEVBQy9GLE1BQWUsRUFBRSwwQkFBb0M7UUFDdkQsSUFBSSxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLEVBQUU7WUFDOUIsT0FBTyxJQUFJLENBQUM7U0FDYjtRQUNELElBQU0sRUFBRSxHQUFHLEVBQUUsQ0FBQyxnQkFBZ0IsQ0FBQyxVQUFVLENBQUMsc0JBQXNCLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztRQUV6RSx3RkFBd0Y7UUFDeEYsaUVBQWlFO1FBQ2pFLElBQU0sZUFBZSxHQUFHLFVBQVUsQ0FBQywwQkFBMEIsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUNyRSxJQUFJLGVBQWUsS0FBSyxJQUFJLEVBQUU7WUFDNUIsT0FBTyxJQUFJLENBQUM7U0FDYjtRQUNELElBQU0saUJBQWlCLEdBQ25CLGVBQWUsQ0FBQyxNQUFNLENBQUMsVUFBQSxHQUFHLElBQUksT0FBQSxrQkFBa0IsQ0FBQyxHQUFHLEVBQUUsTUFBTSxDQUFDLEVBQS9CLENBQStCLENBQUM7YUFDekQsR0FBRyxDQUNBLFVBQUMsU0FBb0IsSUFBSyxPQUFBLG1CQUFtQixDQUFDLFNBQVMsRUFBRSwwQkFBMEIsQ0FBQyxFQUExRCxDQUEwRCxDQUFDLENBQUM7UUFDbEcsSUFBSSxpQkFBaUIsQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO1lBQ2xDLE9BQU8sSUFBSSxDQUFD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QUcsQ0FBQyxVQUFBLEdBQUc7Z0JBQ2pDLElBQU0sSUFBSSxHQUFHLEVBQUUsQ0FBQyxlQUFlLENBQUMsR0FBRyxDQUFDLENBQUM7Z0JBQ3JDLE9BQU8scUJBQXFCLENBQUMsQ0FBQyxDQUFDLHNDQUErQixDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7WUFDOUUsQ0FBQyxDQUFDLENBQUM7WUFDSCxVQUFVLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyx3QkFBd0IsQ0FBQyxNQUFNLEVBQUUsRUFBRSxDQUFDLGtCQUFrQixDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztTQUNuRjtRQUNELE9BQU8sRUFBRSxDQUFDLG1CQUFtQixDQUFDLFVBQVUsRUFBRSxJQUFJLENBQUMsQ0FBQztJQUNsRCxDQUFDO0lBRUQ7Ozs7T0FJRztJQUNILFNBQVMsa0JBQWtCLENBQUMsU0FBb0IsRUFBRSxNQUFlO1FBQy9ELE9BQU8sTUFBTSxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sS0FBSyxJQUFJLElBQUksU0FBUyxDQUFDLE1BQU0sQ0FBQyxJQUFJLEtBQUssZUFBZSxDQUFDLENBQUM7SUFDNUYsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtFeHByZXNzaW9uLCBFeHRlcm5hbEV4cHIsIEZ1bmN0aW9uRXhwciwgSWRlbnRpZmllcnMsIEludm9rZUZ1bmN0aW9uRXhwciwgTGl0ZXJhbEFycmF5RXhwciwgTGl0ZXJhbEV4cHIsIE5PTkVfVFlQRSwgUmV0dXJuU3RhdGVtZW50LCBTdGF0ZW1lbnQsIFdyYXBwZWROb2RlRXhwciwgbGl0ZXJhbE1hcH0gZnJvbSAnQGFuZ3VsYXIvY29tcGlsZXInO1xuaW1wb3J0ICogYXMgdHMgZnJvbSAndHlwZXNjcmlwdCc7XG5cbmltcG9ydCB7RGVmYXVsdEltcG9ydFJlY29yZGVyfSBmcm9tICcuLi8uLi9pbXBvcnRzJztcbmltcG9ydCB7Q3RvclBhcmFtZXRlciwgRGVjb3JhdG9yLCBSZWZsZWN0aW9uSG9zdH0gZnJvbSAnLi4vLi4vcmVmbGVjdGlvbic7XG5cbmltcG9ydCB7dmFsdWVSZWZlcmVuY2VUb0V4cHJlc3Npb24sIHdyYXBGdW5jdGlvbkV4cHJlc3Npb25zSW5QYXJlbnN9IGZyb20gJy4vdXRpbCc7XG5cblxuLyoqXG4gKiBHaXZlbiBhIGNsYXNzIGRlY2xhcmF0aW9uLCBnZW5lcmF0ZSBhIGNhbGwgdG8gYHNldENsYXNzTWV0YWRhdGFgIHdpdGggdGhlIEFuZ3VsYXIgbWV0YWRhdGFcbiAqIHByZXNlbnQgb24gdGhlIGNsYXNzIG9yIGl0cyBtZW1iZXIgZmllbGRzLlxuICpcbiAqIElmIG5vIHN1Y2ggbWV0YWRhdGEgaXMgcHJlc2VudCwgdGhpcyBmdW5jdGlvbiByZXR1cm5zIGBudWxsYC4gT3RoZXJ3aXNlLCB0aGUgY2FsbCBpcyByZXR1cm5lZFxuICogYXMgYSBgU3RhdGVtZW50YCBmb3IgaW5jbHVzaW9uIGFsb25nIHdpdGggdGhlIGNsYXNzLlxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2VuZXJhdGVTZXRDbGFzc01ldGFkYXRhQ2FsbChcbiAgICBjbGF6ejogdHMuRGVjbGFyYXRpb24sIHJlZmxlY3Rpb246IFJlZmxlY3Rpb25Ib3N0LCBkZWZhdWx0SW1wb3J0UmVjb3JkZXI6IERlZmF1bHRJbXBvcnRSZWNvcmRlcixcbiAgICBpc0NvcmU6IGJvb2xlYW4sIGFubm90YXRlRm9yQ2xvc3VyZUNvbXBpbGVyPzogYm9vbGVhbik6IFN0YXRlbWVudHxudWxsIHtcbiAgaWYgKCFyZWZsZWN0aW9uLmlzQ2xhc3MoY2xhenopKSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbiAgY29uc3QgaWQgPSB0cy51cGRhdGVJZGVudGlmaWVyKHJlZmxlY3Rpb24uZ2V0QWRqYWNlbnROYW1lT2ZDbGFzcyhjbGF6eikpO1xuXG4gIC8vIFJlZmxlY3Qgb3ZlciB0aGUgY2xhc3MgZGVjb3JhdG9ycy4gSWYgbm9uZSBhcmUgcHJlc2VudCwgb3IgdGhvc2UgdGhhdCBhcmUgYXJlbid0IGZyb21cbiAgLy8gQW5ndWxhciwgdGhlbiByZXR1cm4gbnVsbC4gT3RoZXJ3aXNlLCB0dXJuIHRoZW0gaW50byBtZXRhZGF0YS5cbiAgY29uc3QgY2xhc3NEZWNvcmF0b3JzID0gcmVmbGVjdGlvbi5nZXREZWNvcmF0b3JzT2ZEZWNsYXJhdGlvbihjbGF6eik7XG4gIGlmIChjbGFzc0RlY29yYXRvcnMgPT09IG51bGwpIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuICBjb25zdCBuZ0NsYXNzRGVjb3JhdG9ycyA9XG4gICAgICBjbGFzc0RlY29yYXRvcnMuZmlsdGVyKGRlYyA9PiBpc0FuZ3VsYXJEZWNvcmF0b3IoZGVjLCBpc0NvcmUpKVxuICAgICAgICAgIC5tYXAoXG4gICAgICAgICAgICAgIChkZWNvcmF0b3I6IERlY29yYXRvcikgPT4gZGVjb3JhdG9yVG9NZXRhZGF0YShkZWNvcmF0b3IsIGFubm90YXRlRm9yQ2xvc3VyZUNvbXBpbGVyKSk7XG4gIGlmIChuZ0NsYXNzRGVjb3JhdG9ycy5sZW5ndGggPT09IDApIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuICBjb25zdCBtZXRhRGVjb3JhdG9ycyA9IHRzLmNyZWF0ZUFycmF5TGl0ZXJhbChuZ0NsYXNzRGVjb3JhdG9ycyk7XG5cbiAgLy8gQ29udmVydCB0aGUgY29uc3RydWN0b3IgcGFyYW1ldGVycyB0byBtZXRhZGF0YSwgcGFzc2luZyBudWxsIGlmIG5vbmUgYXJlIHByZXNlbnQuXG4gIGxldCBtZXRhQ3RvclBhcmFtZXRlcnM6IEV4cHJlc3Npb24gPSBuZXcgTGl0ZXJhbEV4cHIobnVsbCk7XG4gIGNvbnN0IGNsYXNzQ3RvclBhcmFtZXRlcnMgPSByZWZsZWN0aW9uLmdldENvbnN0cnVjdG9yUGFyYW1ldGVycyhjbGF6eik7XG4gIGlmIChjbGFzc0N0b3JQYXJhbWV0ZXJzICE9PSBudWxsKSB7XG4gICAgY29uc3QgY3RvclBhcmFtZXRlcnMgPSBjbGFzc0N0b3JQYXJhbWV0ZXJzLm1hcChcbiAgICAgICAgcGFyYW0gPT4gY3RvclBhcmFtZXRlclRvTWV0YWRhdGEocGFyYW0sIGRlZmF1bHRJbXBvcnRSZWNvcmRlciwgaXNDb3JlKSk7XG4gICAgbWV0YUN0b3JQYXJhbWV0ZXJzID0gbmV3IEZ1bmN0aW9uRXhwcihbXSwgW1xuICAgICAgbmV3IFJldHVyblN0YXRlbWVudChuZXcgTGl0ZXJhbEFycmF5RXhwcihjdG9yUGFyYW1ldGVycykpLFxuICAgIF0pO1xuICB9XG5cbiAgLy8gRG8gdGhlIHNhbWUgZm9yIHByb3BlcnR5IGRlY29yYXRvcnMuXG4gIGxldCBtZXRhUHJvcERlY29yYXRvcnM6IHRzLkV4cHJlc3Npb24gPSB0cy5jcmVhdGVOdWxsKCk7XG4gIGNvbnN0IGNsYXNzTWVtYmVycyA9IHJlZmxlY3Rpb24uZ2V0TWVtYmVyc09mQ2xhc3MoY2xhenopLmZpbHRlcihcbiAgICAgIG1lbWJlciA9PiAhbWVtYmVyLmlzU3RhdGljICYmIG1lbWJlci5kZWNvcmF0b3JzICE9PSBudWxsICYmIG1lbWJlci5kZWNvcmF0b3JzLmxlbmd0aCA+IDApO1xuICBjb25zdCBkdXBsaWNhdGVEZWNvcmF0ZWRNZW1iZXJOYW1lcyA9XG4gICAgICBjbGFzc01lbWJlcnMubWFwKG1lbWJlciA9PiBtZW1iZXIubmFtZSkuZmlsdGVyKChuYW1lLCBpLCBhcnIpID0+IGFyci5pbmRleE9mKG5hbWUpIDwgaSk7XG4gIGlmIChkdXBsaWNhdGVEZWNvcmF0ZWRNZW1iZXJOYW1lcy5sZW5ndGggPiAwKSB7XG4gICAgLy8gVGhpcyBzaG91bGQgdGhlb3JldGljYWxseSBuZXZlciBoYXBwZW4sIGJlY2F1c2UgdGhlIG9ubHkgd2F5IHRvIGhhdmUgZHVwbGljYXRlIGluc3RhbmNlXG4gICAgLy8gbWVtYmVyIG5hbWVzIGlzIGdldHRlci9zZXR0ZXIgcGFpcnMgYW5kIGRlY29yYXRvcnMgY2Fubm90IGFwcGVhciBpbiBib3RoIGEgZ2V0dGVyIGFuZCB0aGVcbiAgICAvLyBjb3JyZXNwb25kaW5nIHNldHRlci5cbiAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgIGBEdXBsaWNhdGUgZGVjb3JhdGVkIHByb3BlcnRpZXMgZm91bmQgb24gY2xhc3MgJyR7Y2xhenoubmFtZS50ZXh0fSc6IGAgK1xuICAgICAgICBkdXBsaWNhdGVEZWNvcmF0ZWRNZW1iZXJOYW1lcy5qb2luKCcsICcpKTtcbiAgfVxuICBjb25zdCBkZWNvcmF0ZWRNZW1iZXJzID1cbiAgICAgIGNsYXNzTWVtYmVycy5tYXAobWVtYmVyID0+IGNsYXNzTWVtYmVyVG9NZXRhZGF0YShtZW1iZXIubmFtZSwgbWVtYmVyLmRlY29yYXRvcnMgISwgaXNDb3JlKSk7XG4gIGlmIChkZWNvcmF0ZWRNZW1iZXJzLmxlbmd0aCA+IDApIHtcbiAgICBtZXRhUHJvcERlY29yYXRvcnMgPSB0cy5jcmVhdGVPYmplY3RMaXRlcmFsKGRlY29yYXRlZE1lbWJlcnMpO1xuICB9XG5cbiAgLy8gR2VuZXJhdGUgYSBwdXJlIGNhbGwgdG8gc2V0Q2xhc3NNZXRhZGF0YSB3aXRoIHRoZSBjbGFzcyBpZGVudGlmaWVyIGFuZCBpdHMgbWV0YWRhdGEuXG4gIGNvbnN0IHNldENsYXNzTWV0YWRhdGEgPSBuZXcgRXh0ZXJuYWxFeHByKElkZW50aWZpZXJzLnNldENsYXNzTWV0YWRhdGEpO1xuICBjb25zdCBmbkNhbGwgPSBuZXcgSW52b2tlRnVuY3Rpb25FeHByKFxuICAgICAgLyogZm4gKi8gc2V0Q2xhc3NNZXRhZGF0YSxcbiAgICAgIC8qIGFyZ3MgKi9cbiAgICAgIFtcbiAgICAgICAgbmV3IFdyYXBwZWROb2RlRXhwcihpZCksXG4gICAgICAgIG5ldyBXcmFwcGVkTm9kZUV4cHIobWV0YURlY29yYXRvcnMpLFxuICAgICAgICBtZXRhQ3RvclBhcmFtZXRlcnMsXG4gICAgICAgIG5ldyBXcmFwcGVkTm9kZUV4cHIobWV0YVByb3BEZWNvcmF0b3JzKSxcbiAgICAgIF0pO1xuICBjb25zdCBpaWZlRm4gPSBuZXcgRnVuY3Rpb25FeHByKFtdLCBbZm5DYWxsLnRvU3RtdCgpXSwgTk9ORV9UWVBFKTtcbiAgY29uc3QgaWlmZSA9IG5ldyBJbnZva2VGdW5jdGlvbkV4cHIoXG4gICAgICAvKiBmbiAqLyBpaWZlRm4sXG4gICAgICAvKiBhcmdzICovW10sXG4gICAgICAvKiB0eXBlICovIHVuZGVmaW5lZCxcbiAgICAgIC8qIHNvdXJjZVNwYW4gKi8gdW5kZWZpbmVkLFxuICAgICAgLyogcHVyZSAqLyB0cnVlKTtcbiAgcmV0dXJuIGlpZmUudG9TdG10KCk7XG59XG5cbi8qKlxuICogQ29udmVydCBhIHJlZmxlY3RlZCBjb25zdHJ1Y3RvciBwYXJhbWV0ZXIgdG8gbWV0YWRhdGEuXG4gKi9cbmZ1bmN0aW9uIGN0b3JQYXJhbWV0ZXJUb01ldGFkYXRhKFxuICAgIHBhcmFtOiBDdG9yUGFyYW1ldGVyLCBkZWZhdWx0SW1wb3J0UmVjb3JkZXI6IERlZmF1bHRJbXBvcnRSZWNvcmRlcixcbiAgICBpc0NvcmU6IGJvb2xlYW4pOiBFeHByZXNzaW9uIHtcbiAgLy8gUGFyYW1ldGVycyBzb21ldGltZXMgaGF2ZSBhIHR5cGUgdGhhdCBjYW4gYmUgcmVmZXJlbmNlZC4gSWYgc28sIHRoZW4gdXNlIGl0LCBvdGhlcndpc2VcbiAgLy8gaXRzIHR5cGUgaXMgdW5kZWZpbmVkLlxuICBjb25zdCB0eXBlID0gcGFyYW0udHlwZVZhbHVlUmVmZXJlbmNlICE9PSBudWxsID9cbiAgICAgIHZhbHVlUmVmZXJlbmNlVG9FeHByZXNzaW9uKHBhcmFtLnR5cGVWYWx1ZVJlZmVyZW5jZSwgZGVmYXVsdEltcG9ydFJlY29yZGVyKSA6XG4gICAgICBuZXcgTGl0ZXJhbEV4cHIodW5kZWZpbmVkKTtcblxuICBjb25zdCBtYXBFbnRyaWVzOiB7a2V5OiBzdHJpbmcsIHZhbHVlOiBFeHByZXNzaW9uLCBxdW90ZWQ6IGZhbHNlfVtdID0gW1xuICAgIHtrZXk6ICd0eXBlJywgdmFsdWU6IHR5cGUsIHF1b3RlZDogZmFsc2V9LFxuICBdO1xuXG4gIC8vIElmIHRoZSBwYXJhbWV0ZXIgaGFzIGRlY29yYXRvcnMsIGluY2x1ZGUgdGhlIG9uZXMgZnJvbSBBbmd1bGFyLlxuICBpZiAocGFyYW0uZGVjb3JhdG9ycyAhPT0gbnVsbCkge1xuICAgIGNvbnN0IG5nRGVjb3JhdG9ycyA9IHBhcmFtLmRlY29yYXRvcnMuZmlsdGVyKGRlYyA9PiBpc0FuZ3VsYXJEZWNvcmF0b3IoZGVjLCBpc0NvcmUpKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAubWFwKChkZWNvcmF0b3I6IERlY29yYXRvcikgPT4gZGVjb3JhdG9yVG9NZXRhZGF0YShkZWNvcmF0b3IpKTtcbiAgICBjb25zdCB2YWx1ZSA9IG5ldyBXcmFwcGVkTm9kZUV4cHIodHMuY3JlYXRlQXJyYXlMaXRlcmFsKG5nRGVjb3JhdG9ycykpO1xuICAgIG1hcEVudHJpZXMucHVzaCh7a2V5OiAnZGVjb3JhdG9ycycsIHZhbHVlLCBxdW90ZWQ6IGZhbHNlfSk7XG4gIH1cbiAgcmV0dXJuIGxpdGVyYWxNYXAobWFwRW50cmllcyk7XG59XG5cbi8qKlxuICogQ29udmVydCBhIHJlZmxlY3RlZCBjbGFzcyBtZW1iZXIgdG8gbWV0YWRhdGEuXG4gKi9cbmZ1bmN0aW9uIGNsYXNzTWVtYmVyVG9NZXRhZGF0YShcbiAgICBuYW1lOiBzdHJpbmcsIGRlY29yYXRvcnM6IERlY29yYXRvcltdLCBpc0NvcmU6IGJvb2xlYW4pOiB0cy5Qcm9wZXJ0eUFzc2lnbm1lbnQge1xuICBjb25zdCBuZ0RlY29yYXRvcnMgPSBkZWNvcmF0b3JzLmZpbHRlcihkZWMgPT4gaXNBbmd1bGFyRGVjb3JhdG9yKGRlYywgaXNDb3JlKSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIC5tYXAoKGRlY29yYXRvcjogRGVjb3JhdG9yKSA9PiBkZWNvcmF0b3JUb01ldGFkYXRhKGRlY29yYXRvcikpO1xuICBjb25zdCBkZWNvcmF0b3JNZXRhID0gdHMuY3JlYXRlQXJyYXlMaXRlcmFsKG5nRGVjb3JhdG9ycyk7XG4gIHJldHVybiB0cy5jcmVhdGVQcm9wZXJ0eUFzc2lnbm1lbnQobmFtZSwgZGVjb3JhdG9yTWV0YSk7XG59XG5cbi8qKlxuICogQ29udmVydCBhIHJlZmxlY3RlZCBkZWNvcmF0b3IgdG8gbWV0YWRhdGEuXG4gKi9cbmZ1bmN0aW9uIGRlY29yYXRvclRvTWV0YWRhdGEoXG4gICAgZGVjb3JhdG9yOiBEZWNvcmF0b3IsIHdyYXBGdW5jdGlvbnNJblBhcmVucz86IGJvb2xlYW4pOiB0cy5PYmplY3RMaXRlcmFsRXhwcmVzc2lvbiB7XG4gIGlmIChkZWNvcmF0b3IuaWRlbnRpZmllciA9PT0gbnVsbCkge1xuICAgIHRocm93IG5ldyBFcnJvcignSWxsZWdhbCBzdGF0ZTogc3ludGhlc2l6ZWQgZGVjb3JhdG9yIGNhbm5vdCBiZSBlbWl0dGVkIGluIGNsYXNzIG1ldGFkYXRhLicpO1xuICB9XG4gIC8vIERlY29yYXRvcnMgaGF2ZSBhIHR5cGUuXG4gIGNvbnN0IHByb3BlcnRpZXM6IHRzLk9iamVjdExpdGVyYWxFbGVtZW50TGlrZVtdID0gW1xuICAgIHRzLmNyZWF0ZVByb3BlcnR5QXNzaWdubWVudCgndHlwZScsIHRzLmdldE11dGFibGVDbG9uZShkZWNvcmF0b3IuaWRlbnRpZmllcikpLFxuICBdO1xuICAvLyBTb21ldGltZXMgdGhleSBoYXZlIGFyZ3VtZW50cy5cbiAgaWYgKGRlY29yYXRvci5hcmdzICE9PSBudWxsICYmIGRlY29yYXRvci5hcmdzLmxlbmd0aCA+IDApIHtcbiAgICBjb25zdCBhcmdzID0gZGVjb3JhdG9yLmFyZ3MubWFwKGFyZyA9PiB7XG4gICAgICBjb25zdCBleHByID0gdHMuZ2V0TXV0YWJsZUNsb25lKGFyZyk7XG4gICAgICByZXR1cm4gd3JhcEZ1bmN0aW9uc0luUGFyZW5zID8gd3JhcEZ1bmN0aW9uRXhwcmVzc2lvbnNJblBhcmVucyhleHByKSA6IGV4cHI7XG4gICAgfSk7XG4gICAgcHJvcGVydGllcy5wdXNoKHRzLmNyZWF0ZVByb3BlcnR5QXNzaWdubWVudCgnYXJncycsIHRzLmNyZWF0ZUFycmF5TGl0ZXJhbChhcmdzKSkpO1xuICB9XG4gIHJldHVybiB0cy5jcmVhdGVPYmplY3RMaXRlcmFsKHByb3BlcnRpZXMsIHRydWUpO1xufVxuXG4vKipcbiAqIFdoZXRoZXIgYSBnaXZlbiBkZWNvcmF0b3Igc2hvdWxkIGJlIHRyZWF0ZWQgYXMgYW4gQW5ndWxhciBkZWNvcmF0b3IuXG4gKlxuICogRWl0aGVyIGl0J3MgdXNlZCBpbiBAYW5ndWxhci9jb3JlLCBvciBpdCdzIGltcG9ydGVkIGZyb20gdGhlcmUuXG4gKi9cbmZ1bmN0aW9uIGlzQW5ndWxhckRlY29yYXRvcihkZWNvcmF0b3I6IERlY29yYXRvciwgaXNDb3JlOiBib29sZWFuKTogYm9vbGVhbiB7XG4gIHJldHVybiBpc0NvcmUgfHwgKGRlY29yYXRvci5pbXBvcnQgIT09IG51bGwgJiYgZGVjb3JhdG9yLmltcG9ydC5mcm9tID09PSAnQGFuZ3VsYXIvY29yZScpO1xufVxuIl19