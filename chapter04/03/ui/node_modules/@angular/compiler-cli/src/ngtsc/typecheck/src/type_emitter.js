(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/compiler-cli/src/ngtsc/typecheck/src/type_emitter", ["require", "exports", "typescript", "@angular/compiler-cli/src/ngtsc/imports"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * @license
     * Copyright Google Inc. All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */
    var ts = require("typescript");
    var imports_1 = require("@angular/compiler-cli/src/ngtsc/imports");
    /**
     * Determines whether the provided type can be emitted, which means that it can be safely emitted
     * into a different location.
     *
     * If this function returns true, a `TypeEmitter` should be able to succeed. Vice versa, if this
     * function returns false, then using the `TypeEmitter` should not be attempted as it is known to
     * fail.
     */
    function canEmitType(type, resolver) {
        return canEmitTypeWorker(type);
        function canEmitTypeWorker(type) {
            return visitTypeNode(type, {
                visitTypeReferenceNode: function (type) { return canEmitTypeReference(type); },
                visitArrayTypeNode: function (type) { return canEmitTypeWorker(type.elementType); },
                visitKeywordType: function () { return true; },
                visitOtherType: function () { return false; },
            });
        }
        function canEmitTypeReference(type) {
            var reference = resolver(type);
            // If the type could not be resolved, it can not be emitted.
            if (reference === null) {
                return false;
            }
            // If the type is a reference without a owning module, consider the type not to be eligible for
            // emitting.
            if (reference instanceof imports_1.Reference && !reference.hasOwningModuleGuess) {
                return false;
            }
            // The type can be emitted if either it does not have any type arguments, or all of them can be
            // emitted.
            return type.typeArguments === undefined || type.typeArguments.every(canEmitTypeWorker);
        }
    }
    exports.canEmitType = canEmitType;
    /**
     * Given a `ts.TypeNode`, this class derives an equivalent `ts.TypeNode` that has been emitted into
     * a different context.
     *
     * For example, consider the following code:
     *
     * ```
     * import {NgIterable} from '@angular/core';
     *
     * class NgForOf<T, U extends NgIterable<T>> {}
     * ```
     *
     * Here, the generic type parameters `T` and `U` can be emitted into a different context, as the
     * type reference to `NgIterable` originates from an absolute module import so that it can be
     * emitted anywhere, using that same module import. The process of emitting translates the
     * `NgIterable` type reference to a type reference that is valid in the context in which it is
     * emitted, for example:
     *
     * ```
     * import * as i0 from '@angular/core';
     * import * as i1 from '@angular/common';
     *
     * const _ctor1: <T, U extends i0.NgIterable<T>>(o: Pick<i1.NgForOf<T, U>, 'ngForOf'>):
     * i1.NgForOf<T, U>;
     * ```
     *
     * Notice how the type reference for `NgIterable` has been translated into a qualified name,
     * referring to the namespace import that was created.
     */
    var TypeEmitter = /** @class */ (function () {
        function TypeEmitter(resolver, emitReference) {
            this.resolver = resolver;
            this.emitReference = emitReference;
        }
        TypeEmitter.prototype.emitType = function (type) {
            var _this = this;
            return visitTypeNode(type, {
                visitTypeReferenceNode: function (type) { return _this.emitTypeReference(type); },
                visitArrayTypeNode: function (type) { return ts.updateArrayTypeNode(type, _this.emitType(type.elementType)); },
                visitKeywordType: function (type) { return type; },
                visitOtherType: function () { throw new Error('Unable to emit a complex type'); },
            });
        };
        TypeEmitter.prototype.emitTypeReference = function (type) {
            var _this = this;
            // Determine the reference that the type corresponds with.
            var reference = this.resolver(type);
            if (reference === null) {
                throw new Error('Unable to emit an unresolved reference');
            }
            // Emit the type arguments, if any.
            var typeArguments = undefined;
            if (type.typeArguments !== undefined) {
                typeArguments = ts.createNodeArray(type.typeArguments.map(function (typeArg) { return _this.emitType(typeArg); }));
            }
            // Emit the type name.
            var typeName = type.typeName;
            if (reference instanceof imports_1.Reference) {
                if (!reference.hasOwningModuleGuess) {
                    throw new Error('A type reference to emit must be imported from an absolute module');
                }
                var emittedType = this.emitReference(reference);
                if (!ts.isTypeReferenceNode(emittedType)) {
                    throw new Error("Expected TypeReferenceNode for emitted reference, got " + ts.SyntaxKind[emittedType.kind]);
                }
                typeName = emittedType.typeName;
            }
            return ts.updateTypeReferenceNode(type, typeName, typeArguments);
        };
        return TypeEmitter;
    }());
    exports.TypeEmitter = TypeEmitter;
    function visitTypeNode(type, visitor) {
        if (ts.isTypeReferenceNode(type)) {
            return visitor.visitTypeReferenceNode(type);
        }
        else if (ts.isArrayTypeNode(type)) {
            return visitor.visitArrayTypeNode(type);
        }
        switch (type.kind) {
            case ts.SyntaxKind.AnyKeyword:
            case ts.SyntaxKind.UnknownKeyword:
            case ts.SyntaxKind.NumberKeyword:
            case ts.SyntaxKind.ObjectKeyword:
            case ts.SyntaxKind.BooleanKeyword:
            case ts.SyntaxKind.StringKeyword:
            case ts.SyntaxKind.UndefinedKeyword:
            case ts.SyntaxKind.NullKeyword:
                return visitor.visitKeywordType(type);
            default:
                return visitor.visitOtherType(type);
        }
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHlwZV9lbWl0dGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tcGlsZXItY2xpL3NyYy9uZ3RzYy90eXBlY2hlY2svc3JjL3R5cGVfZW1pdHRlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztJQUFBOzs7Ozs7T0FNRztJQUNILCtCQUFpQztJQUNqQyxtRUFBd0M7SUFjeEM7Ozs7Ozs7T0FPRztJQUNILFNBQWdCLFdBQVcsQ0FBQyxJQUFpQixFQUFFLFFBQStCO1FBQzVFLE9BQU8saUJBQWlCLENBQUMsSUFBSSxDQUFDLENBQUM7UUFFL0IsU0FBUyxpQkFBaUIsQ0FBQyxJQUFpQjtZQUMxQyxPQUFPLGFBQWEsQ0FBQyxJQUFJLEVBQUU7Z0JBQ3pCLHNCQUFzQixFQUFFLFVBQUEsSUFBSSxJQUFJLE9BQUEsb0JBQW9CLENBQUMsSUFBSSxDQUFDLEVBQTFCLENBQTBCO2dCQUMxRCxrQkFBa0IsRUFBRSxVQUFBLElBQUksSUFBSSxPQUFBLGlCQUFpQixDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsRUFBbkMsQ0FBbUM7Z0JBQy9ELGdCQUFnQixFQUFFLGNBQU0sT0FBQSxJQUFJLEVBQUosQ0FBSTtnQkFDNUIsY0FBYyxFQUFFLGNBQU0sT0FBQSxLQUFLLEVBQUwsQ0FBSzthQUM1QixDQUFDLENBQUM7UUFDTCxDQUFDO1FBRUQsU0FBUyxvQkFBb0IsQ0FBQyxJQUEwQjtZQUN0RCxJQUFNLFNBQVMsR0FBRyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUM7WUFFakMsNERBQTREO1lBQzVELElBQUksU0FBUyxLQUFLLElBQUksRUFBRTtnQkFDdEIsT0FBTyxLQUFLLENBQUM7YUFDZDtZQUVELCtGQUErRjtZQUMvRixZQUFZO1lBQ1osSUFBSSxTQUFTLFlBQVksbUJBQVMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxvQkFBb0IsRUFBRTtnQkFDckUsT0FBTyxLQUFLLENBQUM7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QUFPLENBQUMsc0JBQXNCLENBQUMsSUFBSSxDQUFDLENBQUM7U0FDN0M7YUFBTSxJQUFJLEVBQUUsQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLEVBQUU7WUFDbkMsT0FBTyxPQUFPLENBQUMsa0JBQWtCLENBQUMsSUFBSSxDQUFDLENBQUM7U0FDekM7UUFFRCxRQUFRLElBQUksQ0FBQyxJQUFJLEVBQUU7WUFDakIsS0FBSyxFQUFFLENBQUMsVUFBVSxDQUFDLFVBQVUsQ0FBQztZQUM5QixLQUFLLEVBQUUsQ0FBQyxVQUFVLENBQUMsY0FBYyxDQUFDO1lBQ2xDLEtBQUssRUFBRSxDQUFDLFVBQVUsQ0FBQyxhQUFhLENBQUM7WUFDakMsS0FBSyxFQUFFLENBQUMsVUFBVSxDQUFDLGFBQWEsQ0FBQztZQUNqQyxLQUFLLEVBQUUsQ0FBQyxVQUFVLENBQUMsY0FBYyxDQUFDO1lBQ2xDLEtBQUssRUFBRSxDQUFDLFVBQVUsQ0FBQyxhQUFhLENBQUM7WUFDakMsS0FBSyxFQUFFLENBQUMsVUFBVSxDQUFDLGdCQUFnQixDQUFDO1lBQ3BDLEtBQUssRUFBRSxDQUFDLFVBQVUsQ0FBQyxXQUFXO2dCQUM1QixPQUFPLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQyxJQUEwQixDQUFDLENBQUM7WUFDOUQ7Z0JBQ0UsT0FBTyxPQUFPLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxDQUFDO1NBQ3ZDO0lBQ0gsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cbmltcG9ydCAqIGFzIHRzIGZyb20gJ3R5cGVzY3JpcHQnO1xuaW1wb3J0IHtSZWZlcmVuY2V9IGZyb20gJy4uLy4uL2ltcG9ydHMnO1xuXG4vKipcbiAqIEEgcmVzb2x2ZWQgdHlwZSByZWZlcmVuY2UgY2FuIGVpdGhlciBiZSBhIGBSZWZlcmVuY2VgLCB0aGUgb3JpZ2luYWwgYHRzLlR5cGVSZWZlcmVuY2VOb2RlYCBpdHNlbGZcbiAqIG9yIG51bGwgdG8gaW5kaWNhdGUgdGhlIG5vIHJlZmVyZW5jZSBjb3VsZCBiZSByZXNvbHZlZC5cbiAqL1xuZXhwb3J0IHR5cGUgUmVzb2x2ZWRUeXBlUmVmZXJlbmNlID0gUmVmZXJlbmNlIHwgdHMuVHlwZVJlZmVyZW5jZU5vZGUgfCBudWxsO1xuXG4vKipcbiAqIEEgdHlwZSByZWZlcmVuY2UgcmVzb2x2ZXIgZnVuY3Rpb24gaXMgcmVzcG9uc2libGUgZm9yIGZpbmRpbmcgdGhlIGRlY2xhcmF0aW9uIG9mIHRoZSB0eXBlXG4gKiByZWZlcmVuY2UgYW5kIHZlcmlmeWluZyB3aGV0aGVyIGl0IGNhbiBiZSBlbWl0dGVkLlxuICovXG5leHBvcnQgdHlwZSBUeXBlUmVmZXJlbmNlUmVzb2x2ZXIgPSAodHlwZTogdHMuVHlwZVJlZmVyZW5jZU5vZGUpID0+IFJlc29sdmVkVHlwZVJlZmVyZW5jZTtcblxuLyoqXG4gKiBEZXRlcm1pbmVzIHdoZXRoZXIgdGhlIHByb3ZpZGVkIHR5cGUgY2FuIGJlIGVtaXR0ZWQsIHdoaWNoIG1lYW5zIHRoYXQgaXQgY2FuIGJlIHNhZmVseSBlbWl0dGVkXG4gKiBpbnRvIGEgZGlmZmVyZW50IGxvY2F0aW9uLlxuICpcbiAqIElmIHRoaXMgZnVuY3Rpb24gcmV0dXJucyB0cnVlLCBhIGBUeXBlRW1pdHRlcmAgc2hvdWxkIGJlIGFibGUgdG8gc3VjY2VlZC4gVmljZSB2ZXJzYSwgaWYgdGhpc1xuICogZnVuY3Rpb24gcmV0dXJucyBmYWxzZSwgdGhlbiB1c2luZyB0aGUgYFR5cGVFbWl0dGVyYCBzaG91bGQgbm90IGJlIGF0dGVtcHRlZCBhcyBpdCBpcyBrbm93biB0b1xuICogZmFpbC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNhbkVtaXRUeXBlKHR5cGU6IHRzLlR5cGVOb2RlLCByZXNvbHZlcjogVHlwZVJlZmVyZW5jZVJlc29sdmVyKTogYm9vbGVhbiB7XG4gIHJldHVybiBjYW5FbWl0VHlwZVdvcmtlcih0eXBlKTtcblxuICBmdW5jdGlvbiBjYW5FbWl0VHlwZVdvcmtlcih0eXBlOiB0cy5UeXBlTm9kZSk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB2aXNpdFR5cGVOb2RlKHR5cGUsIHtcbiAgICAgIHZpc2l0VHlwZVJlZmVyZW5jZU5vZGU6IHR5cGUgPT4gY2FuRW1pdFR5cGVSZWZlcmVuY2UodHlwZSksXG4gICAgICB2aXNpdEFycmF5VHlwZU5vZGU6IHR5cGUgPT4gY2FuRW1pdFR5cGVXb3JrZXIodHlwZS5lbGVtZW50VHlwZSksXG4gICAgICB2aXNpdEtleXdvcmRUeXBlOiAoKSA9PiB0cnVlLFxuICAgICAgdmlzaXRPdGhlclR5cGU6ICgpID0+IGZhbHNlLFxuICAgIH0pO1xuICB9XG5cbiAgZnVuY3Rpb24gY2FuRW1pdFR5cGVSZWZlcmVuY2UodHlwZTogdHMuVHlwZVJlZmVyZW5jZU5vZGUpOiBib29sZWFuIHtcbiAgICBjb25zdCByZWZlcmVuY2UgPSByZXNvbHZlcih0eXBlKTtcblxuICAgIC8vIElmIHRoZSB0eXBlIGNvdWxkIG5vdCBiZSByZXNvbHZlZCwgaXQgY2FuIG5vdCBiZSBlbWl0dGVkLlxuICAgIGlmIChyZWZlcmVuY2UgPT09IG51bGwpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICAvLyBJZiB0aGUgdHlwZSBpcyBhIHJlZmVyZW5jZSB3aXRob3V0IGEgb3duaW5nIG1vZHVsZSwgY29uc2lkZXIgdGhlIHR5cGUgbm90IHRvIGJlIGVsaWdpYmxlIGZvclxuICAgIC8vIGVtaXR0aW5nLlxuICAgIGlmIChyZWZlcmVuY2UgaW5zdGFuY2VvZiBSZWZlcmVuY2UgJiYgIXJlZmVyZW5jZS5oYXNPd25pbmdNb2R1bGVHdWVzcykge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIC8vIFRoZSB0eXBlIGNhbiBiZSBlbWl0dGVkIGlmIGVpdGhlciBpdCBkb2VzIG5vdCBoYXZlIGFueSB0eXBlIGFyZ3VtZW50cywgb3IgYWxsIG9mIHRoZW0gY2FuIGJlXG4gICAgLy8gZW1pdHRlZC5cbiAgICByZXR1cm4gdHlwZS50eXBlQXJndW1lbnRzID09PSB1bmRlZmluZWQgfHwgdHlwZS50eXBlQXJndW1lbnRzLmV2ZXJ5KGNhbkVtaXRUeXBlV29ya2VyKTtcbiAgfVxufVxuXG4vKipcbiAqIEdpdmVuIGEgYHRzLlR5cGVOb2RlYCwgdGhpcyBjbGFzcyBkZXJpdmVzIGFuIGVxdWl2YWxlbnQgYHRzLlR5cGVOb2RlYCB0aGF0IGhhcyBiZWVuIGVtaXR0ZWQgaW50b1xuICogYSBkaWZmZXJlbnQgY29udGV4dC5cbiAqXG4gKiBGb3IgZXhhbXBsZSwgY29uc2lkZXIgdGhlIGZvbGxvd2luZyBjb2RlOlxuICpcbiAqIGBgYFxuICogaW1wb3J0IHtOZ0l0ZXJhYmxlfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbiAqXG4gKiBjbGFzcyBOZ0Zvck9mPFQsIFUgZXh0ZW5kcyBOZ0l0ZXJhYmxlPFQ+PiB7fVxuICogYGBgXG4gKlxuICogSGVyZSwgdGhlIGdlbmVyaWMgdHlwZSBwYXJhbWV0ZXJzIGBUYCBhbmQgYFVgIGNhbiBiZSBlbWl0dGVkIGludG8gYSBkaWZmZXJlbnQgY29udGV4dCwgYXMgdGhlXG4gKiB0eXBlIHJlZmVyZW5jZSB0byBgTmdJdGVyYWJsZWAgb3JpZ2luYXRlcyBmcm9tIGFuIGFic29sdXRlIG1vZHVsZSBpbXBvcnQgc28gdGhhdCBpdCBjYW4gYmVcbiAqIGVtaXR0ZWQgYW55d2hlcmUsIHVzaW5nIHRoYXQgc2FtZSBtb2R1bGUgaW1wb3J0LiBUaGUgcHJvY2VzcyBvZiBlbWl0dGluZyB0cmFuc2xhdGVzIHRoZVxuICogYE5nSXRlcmFibGVgIHR5cGUgcmVmZXJlbmNlIHRvIGEgdHlwZSByZWZlcmVuY2UgdGhhdCBpcyB2YWxpZCBpbiB0aGUgY29udGV4dCBpbiB3aGljaCBpdCBpc1xuICogZW1pdHRlZCwgZm9yIGV4YW1wbGU6XG4gKlxuICogYGBgXG4gKiBpbXBvcnQgKiBhcyBpMCBmcm9tICdAYW5ndWxhci9jb3JlJztcbiAqIGltcG9ydCAqIGFzIGkxIGZyb20gJ0Bhbmd1bGFyL2NvbW1vbic7XG4gKlxuICogY29uc3QgX2N0b3IxOiA8VCwgVSBleHRlbmRzIGkwLk5nSXRlcmFibGU8VD4+KG86IFBpY2s8aTEuTmdGb3JPZjxULCBVPiwgJ25nRm9yT2YnPik6XG4gKiBpMS5OZ0Zvck9mPFQsIFU+O1xuICogYGBgXG4gKlxuICogTm90aWNlIGhvdyB0aGUgdHlwZSByZWZlcmVuY2UgZm9yIGBOZ0l0ZXJhYmxlYCBoYXMgYmVlbiB0cmFuc2xhdGVkIGludG8gYSBxdWFsaWZpZWQgbmFtZSxcbiAqIHJlZmVycmluZyB0byB0aGUgbmFtZXNwYWNlIGltcG9ydCB0aGF0IHdhcyBjcmVhdGVkLlxuICovXG5leHBvcnQgY2xhc3MgVHlwZUVtaXR0ZXIge1xuICAvKipcbiAgICogUmVzb2x2ZXIgZnVuY3Rpb24gdGhhdCBjb21wdXRlcyBhIGBSZWZlcmVuY2VgIGNvcnJlc3BvbmRpbmcgd2l0aCBhIGB0cy5UeXBlUmVmZXJlbmNlTm9kZWAuXG4gICAqL1xuICBwcml2YXRlIHJlc29sdmVyOiBUeXBlUmVmZXJlbmNlUmVzb2x2ZXI7XG5cbiAgLyoqXG4gICAqIEdpdmVuIGEgYFJlZmVyZW5jZWAsIHRoaXMgZnVuY3Rpb24gaXMgcmVzcG9uc2libGUgZm9yIHRoZSBhY3R1YWwgZW1pdHRpbmcgd29yay4gSXQgc2hvdWxkXG4gICAqIHByb2R1Y2UgYSBgdHMuVHlwZU5vZGVgIHRoYXQgaXMgdmFsaWQgd2l0aGluIHRoZSBkZXNpcmVkIGNvbnRleHQuXG4gICAqL1xuICBwcml2YXRlIGVtaXRSZWZlcmVuY2U6IChyZWY6IFJlZmVyZW5jZSkgPT4gdHMuVHlwZU5vZGU7XG5cbiAgY29uc3RydWN0b3IocmVzb2x2ZXI6IFR5cGVSZWZlcmVuY2VSZXNvbHZlciwgZW1pdFJlZmVyZW5jZTogKHJlZjogUmVmZXJlbmNlKSA9PiB0cy5UeXBlTm9kZSkge1xuICAgIHRoaXMucmVzb2x2ZXIgPSByZXNvbHZlcjtcbiAgICB0aGlzLmVtaXRSZWZlcmVuY2UgPSBlbWl0UmVmZXJlbmNlO1xuICB9XG5cbiAgZW1pdFR5cGUodHlwZTogdHMuVHlwZU5vZGUpOiB0cy5UeXBlTm9kZSB7XG4gICAgcmV0dXJuIHZpc2l0VHlwZU5vZGUodHlwZSwge1xuICAgICAgdmlzaXRUeXBlUmVmZXJlbmNlTm9kZTogdHlwZSA9PiB0aGlzLmVtaXRUeXBlUmVmZXJlbmNlKHR5cGUpLFxuICAgICAgdmlzaXRBcnJheVR5cGVOb2RlOiB0eXBlID0+IHRzLnVwZGF0ZUFycmF5VHlwZU5vZGUodHlwZSwgdGhpcy5lbWl0VHlwZSh0eXBlLmVsZW1lbnRUeXBlKSksXG4gICAgICB2aXNpdEtleXdvcmRUeXBlOiB0eXBlID0+IHR5cGUsXG4gICAgICB2aXNpdE90aGVyVHlwZTogKCkgPT4geyB0aHJvdyBuZXcgRXJyb3IoJ1VuYWJsZSB0byBlbWl0IGEgY29tcGxleCB0eXBlJyk7IH0sXG4gICAgfSk7XG4gIH1cblxuICBwcml2YXRlIGVtaXRUeXBlUmVmZXJlbmNlKHR5cGU6IHRzLlR5cGVSZWZlcmVuY2VOb2RlKTogdHMuVHlwZU5vZGUge1xuICAgIC8vIERldGVybWluZSB0aGUgcmVmZXJlbmNlIHRoYXQgdGhlIHR5cGUgY29ycmVzcG9uZHMgd2l0aC5cbiAgICBjb25zdCByZWZlcmVuY2UgPSB0aGlzLnJlc29sdmVyKHR5cGUpO1xuICAgIGlmIChyZWZlcmVuY2UgPT09IG51bGwpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignVW5hYmxlIHRvIGVtaXQgYW4gdW5yZXNvbHZlZCByZWZlcmVuY2UnKTtcbiAgICB9XG5cbiAgICAvLyBFbWl0IHRoZSB0eXBlIGFyZ3VtZW50cywgaWYgYW55LlxuICAgIGxldCB0eXBlQXJndW1lbnRzOiB0cy5Ob2RlQXJyYXk8dHMuVHlwZU5vZGU+fHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBpZiAodHlwZS50eXBlQXJndW1lbnRzICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIHR5cGVBcmd1bWVudHMgPSB0cy5jcmVhdGVOb2RlQXJyYXkodHlwZS50eXBlQXJndW1lbnRzLm1hcCh0eXBlQXJnID0+IHRoaXMuZW1pdFR5cGUodHlwZUFyZykpKTtcbiAgICB9XG5cbiAgICAvLyBFbWl0IHRoZSB0eXBlIG5hbWUuXG4gICAgbGV0IHR5cGVOYW1lID0gdHlwZS50eXBlTmFtZTtcbiAgICBpZiAocmVmZXJlbmNlIGluc3RhbmNlb2YgUmVmZXJlbmNlKSB7XG4gICAgICBpZiAoIXJlZmVyZW5jZS5oYXNPd25pbmdNb2R1bGVHdWVzcykge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0EgdHlwZSByZWZlcmVuY2UgdG8gZW1pdCBtdXN0IGJlIGltcG9ydGVkIGZyb20gYW4gYWJzb2x1dGUgbW9kdWxlJyk7XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IGVtaXR0ZWRUeXBlID0gdGhpcy5lbWl0UmVmZXJlbmNlKHJlZmVyZW5jZSk7XG4gICAgICBpZiAoIXRzLmlzVHlwZVJlZmVyZW5jZU5vZGUoZW1pdHRlZFR5cGUpKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICAgIGBFeHBlY3RlZCBUeXBlUmVmZXJlbmNlTm9kZSBmb3IgZW1pdHRlZCByZWZlcmVuY2UsIGdvdCAke3RzLlN5bnRheEtpbmRbZW1pdHRlZFR5cGUua2luZF19YCk7XG4gICAgICB9XG5cbiAgICAgIHR5cGVOYW1lID0gZW1pdHRlZFR5cGUudHlwZU5hbWU7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRzLnVwZGF0ZVR5cGVSZWZlcmVuY2VOb2RlKHR5cGUsIHR5cGVOYW1lLCB0eXBlQXJndW1lbnRzKTtcbiAgfVxufVxuXG4vKipcbiAqIFZpc2l0b3IgaW50ZXJmYWNlIHRoYXQgYWxsb3dzIGZvciB1bmlmaWVkIHJlY29nbml0aW9uIG9mIHRoZSBkaWZmZXJlbnQgdHlwZXMgb2YgYHRzLlR5cGVOb2RlYHMsXG4gKiBzbyB0aGF0IGB2aXNpdFR5cGVOb2RlYCBpcyBhIGNlbnRyYWxpemVkIHBpZWNlIG9mIHJlY29nbml0aW9uIGxvZ2ljIHRvIGJlIHVzZWQgaW4gYm90aFxuICogYGNhbkVtaXRUeXBlYCBhbmQgYFR5cGVFbWl0dGVyYC5cbiAqL1xuaW50ZXJmYWNlIFR5cGVFbWl0dGVyVmlzaXRvcjxSPiB7XG4gIHZpc2l0VHlwZVJlZmVyZW5jZU5vZGUodHlwZTogdHMuVHlwZVJlZmVyZW5jZU5vZGUpOiBSO1xuICB2aXNpdEFycmF5VHlwZU5vZGUodHlwZTogdHMuQXJyYXlUeXBlTm9kZSk6IFI7XG4gIHZpc2l0S2V5d29yZFR5cGUodHlwZTogdHMuS2V5d29yZFR5cGVOb2RlKTogUjtcbiAgdmlzaXRPdGhlclR5cGUodHlwZTogdHMuVHlwZU5vZGUpOiBSO1xufVxuXG5mdW5jdGlvbiB2aXNpdFR5cGVOb2RlPFI+KHR5cGU6IHRzLlR5cGVOb2RlLCB2aXNpdG9yOiBUeXBlRW1pdHRlclZpc2l0b3I8Uj4pOiBSIHtcbiAgaWYgKHRzLmlzVHlwZVJlZmVyZW5jZU5vZGUodHlwZSkpIHtcbiAgICByZXR1cm4gdmlzaXRvci52aXNpdFR5cGVSZWZlcmVuY2VOb2RlKHR5cGUpO1xuICB9IGVsc2UgaWYgKHRzLmlzQXJyYXlUeXBlTm9kZSh0eXBlKSkge1xuICAgIHJldHVybiB2aXNpdG9yLnZpc2l0QXJyYXlUeXBlTm9kZSh0eXBlKTtcbiAgfVxuXG4gIHN3aXRjaCAodHlwZS5raW5kKSB7XG4gICAgY2FzZSB0cy5TeW50YXhLaW5kLkFueUtleXdvcmQ6XG4gICAgY2FzZSB0cy5TeW50YXhLaW5kLlVua25vd25LZXl3b3JkOlxuICAgIGNhc2UgdHMuU3ludGF4S2luZC5OdW1iZXJLZXl3b3JkOlxuICAgIGNhc2UgdHMuU3ludGF4S2luZC5PYmplY3RLZXl3b3JkOlxuICAgIGNhc2UgdHMuU3ludGF4S2luZC5Cb29sZWFuS2V5d29yZDpcbiAgICBjYXNlIHRzLlN5bnRheEtpbmQuU3RyaW5nS2V5d29yZDpcbiAgICBjYXNlIHRzLlN5bnRheEtpbmQuVW5kZWZpbmVkS2V5d29yZDpcbiAgICBjYXNlIHRzLlN5bnRheEtpbmQuTnVsbEtleXdvcmQ6XG4gICAgICByZXR1cm4gdmlzaXRvci52aXNpdEtleXdvcmRUeXBlKHR5cGUgYXMgdHMuS2V5d29yZFR5cGVOb2RlKTtcbiAgICBkZWZhdWx0OlxuICAgICAgcmV0dXJuIHZpc2l0b3IudmlzaXRPdGhlclR5cGUodHlwZSk7XG4gIH1cbn1cbiJdfQ==