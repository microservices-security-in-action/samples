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
        define("@angular/compiler-cli/src/ngtsc/typecheck/src/type_constructor", ["require", "exports", "tslib", "typescript", "@angular/compiler-cli/src/ngtsc/typecheck/src/type_parameter_emitter"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var tslib_1 = require("tslib");
    var ts = require("typescript");
    var type_parameter_emitter_1 = require("@angular/compiler-cli/src/ngtsc/typecheck/src/type_parameter_emitter");
    function generateTypeCtorDeclarationFn(node, meta, nodeTypeRef, typeParams, reflector) {
        if (requiresInlineTypeCtor(node, reflector)) {
            throw new Error(node.name.text + " requires an inline type constructor");
        }
        var rawTypeArgs = typeParams !== undefined ? generateGenericArgs(typeParams) : undefined;
        var rawType = ts.createTypeReferenceNode(nodeTypeRef, rawTypeArgs);
        var initParam = constructTypeCtorParameter(node, meta, rawType);
        var typeParameters = typeParametersWithDefaultTypes(typeParams);
        if (meta.body) {
            var fnType = ts.createFunctionTypeNode(
            /* typeParameters */ typeParameters, 
            /* parameters */ [initParam], 
            /* type */ rawType);
            var decl = ts.createVariableDeclaration(
            /* name */ meta.fnName, 
            /* type */ fnType, 
            /* body */ ts.createNonNullExpression(ts.createNull()));
            var declList = ts.createVariableDeclarationList([decl], ts.NodeFlags.Const);
            return ts.createVariableStatement(
            /* modifiers */ undefined, 
            /* declarationList */ declList);
        }
        else {
            return ts.createFunctionDeclaration(
            /* decorators */ undefined, 
            /* modifiers */ [ts.createModifier(ts.SyntaxKind.DeclareKeyword)], 
            /* asteriskToken */ undefined, 
            /* name */ meta.fnName, 
            /* typeParameters */ typeParameters, 
            /* parameters */ [initParam], 
            /* type */ rawType, 
            /* body */ undefined);
        }
    }
    exports.generateTypeCtorDeclarationFn = generateTypeCtorDeclarationFn;
    /**
     * Generate an inline type constructor for the given class and metadata.
     *
     * An inline type constructor is a specially shaped TypeScript static method, intended to be placed
     * within a directive class itself, that permits type inference of any generic type parameters of
     * the class from the types of expressions bound to inputs or outputs, and the types of elements
     * that match queries performed by the directive. It also catches any errors in the types of these
     * expressions. This method is never called at runtime, but is used in type-check blocks to
     * construct directive types.
     *
     * An inline type constructor for NgFor looks like:
     *
     * static ngTypeCtor<T>(init: Pick<NgForOf<T>, 'ngForOf'|'ngForTrackBy'|'ngForTemplate'>):
     *   NgForOf<T>;
     *
     * A typical constructor would be:
     *
     * NgForOf.ngTypeCtor(init: {
     *   ngForOf: ['foo', 'bar'],
     *   ngForTrackBy: null as any,
     *   ngForTemplate: null as any,
     * }); // Infers a type of NgForOf<string>.
     *
     * Any inputs declared on the type for which no property binding is present are assigned a value of
     * type `any`, to avoid producing any type errors for unset inputs.
     *
     * Inline type constructors are used when the type being created has bounded generic types which
     * make writing a declared type constructor (via `generateTypeCtorDeclarationFn`) difficult or
     * impossible.
     *
     * @param node the `ClassDeclaration<ts.ClassDeclaration>` for which a type constructor will be
     * generated.
     * @param meta additional metadata required to generate the type constructor.
     * @returns a `ts.MethodDeclaration` for the type constructor.
     */
    function generateInlineTypeCtor(node, meta) {
        // Build rawType, a `ts.TypeNode` of the class with its generic parameters passed through from
        // the definition without any type bounds. For example, if the class is
        // `FooDirective<T extends Bar>`, its rawType would be `FooDirective<T>`.
        var rawTypeArgs = node.typeParameters !== undefined ? generateGenericArgs(node.typeParameters) : undefined;
        var rawType = ts.createTypeReferenceNode(node.name, rawTypeArgs);
        var initParam = constructTypeCtorParameter(node, meta, rawType);
        // If this constructor is being generated into a .ts file, then it needs a fake body. The body
        // is set to a return of `null!`. If the type constructor is being generated into a .d.ts file,
        // it needs no body.
        var body = undefined;
        if (meta.body) {
            body = ts.createBlock([
                ts.createReturn(ts.createNonNullExpression(ts.createNull())),
            ]);
        }
        // Create the type constructor method declaration.
        return ts.createMethod(
        /* decorators */ undefined, 
        /* modifiers */ [ts.createModifier(ts.SyntaxKind.StaticKeyword)], 
        /* asteriskToken */ undefined, 
        /* name */ meta.fnName, 
        /* questionToken */ undefined, 
        /* typeParameters */ typeParametersWithDefaultTypes(node.typeParameters), 
        /* parameters */ [initParam], 
        /* type */ rawType, 
        /* body */ body);
    }
    exports.generateInlineTypeCtor = generateInlineTypeCtor;
    function constructTypeCtorParameter(node, meta, rawType) {
        var e_1, _a;
        // initType is the type of 'init', the single argument to the type constructor method.
        // If the Directive has any inputs, its initType will be:
        //
        // Pick<rawType, 'inputA'|'inputB'>
        //
        // Pick here is used to select only those fields from which the generic type parameters of the
        // directive will be inferred.
        //
        // In the special case there are no inputs, initType is set to {}.
        var initType = null;
        var keys = meta.fields.inputs;
        var plainKeys = [];
        var coercedKeys = [];
        try {
            for (var keys_1 = tslib_1.__values(keys), keys_1_1 = keys_1.next(); !keys_1_1.done; keys_1_1 = keys_1.next()) {
                var key = keys_1_1.value;
                if (!meta.coercedInputFields.has(key)) {
                    plainKeys.push(ts.createLiteralTypeNode(ts.createStringLiteral(key)));
                }
                else {
                    coercedKeys.push(ts.createPropertySignature(
                    /* modifiers */ undefined, 
                    /* name */ key, 
                    /* questionToken */ undefined, 
                    /* type */ ts.createTypeQueryNode(ts.createQualifiedName(rawType.typeName, "ngAcceptInputType_" + key)), 
                    /* initializer */ undefined));
                }
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (keys_1_1 && !keys_1_1.done && (_a = keys_1.return)) _a.call(keys_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
        if (plainKeys.length > 0) {
            // Construct a union of all the field names.
            var keyTypeUnion = ts.createUnionTypeNode(plainKeys);
            // Construct the Pick<rawType, keyTypeUnion>.
            initType = ts.createTypeReferenceNode('Pick', [rawType, keyTypeUnion]);
        }
        if (coercedKeys.length > 0) {
            var coercedLiteral = ts.createTypeLiteralNode(coercedKeys);
            initType =
                initType !== null ? ts.createUnionTypeNode([initType, coercedLiteral]) : coercedLiteral;
        }
        if (initType === null) {
            // Special case - no inputs, outputs, or other fields which could influence the result type.
            initType = ts.createTypeLiteralNode([]);
        }
        // Create the 'init' parameter itself.
        return ts.createParameter(
        /* decorators */ undefined, 
        /* modifiers */ undefined, 
        /* dotDotDotToken */ undefined, 
        /* name */ 'init', 
        /* questionToken */ undefined, 
        /* type */ initType, 
        /* initializer */ undefined);
    }
    function generateGenericArgs(params) {
        return params.map(function (param) { return ts.createTypeReferenceNode(param.name, undefined); });
    }
    function requiresInlineTypeCtor(node, host) {
        // The class requires an inline type constructor if it has generic type bounds that can not be
        // emitted into a different context.
        return !checkIfGenericTypeBoundsAreContextFree(node, host);
    }
    exports.requiresInlineTypeCtor = requiresInlineTypeCtor;
    function checkIfGenericTypeBoundsAreContextFree(node, reflector) {
        // Generic type parameters are considered context free if they can be emitted into any context.
        return new type_parameter_emitter_1.TypeParameterEmitter(node.typeParameters, reflector).canEmit();
    }
    /**
     * Add a default `= any` to type parameters that don't have a default value already.
     *
     * TypeScript uses the default type of a type parameter whenever inference of that parameter fails.
     * This can happen when inferring a complex type from 'any'. For example, if `NgFor`'s inference is
     * done with the TCB code:
     *
     * ```
     * class NgFor<T> {
     *   ngForOf: T[];
     * }
     *
     * declare function ctor<T>(o: Pick<NgFor<T>, 'ngForOf'|'ngForTrackBy'|'ngForTemplate'>): NgFor<T>;
     * ```
     *
     * An invocation looks like:
     *
     * ```
     * var _t1 = ctor({ngForOf: [1, 2], ngForTrackBy: null as any, ngForTemplate: null as any});
     * ```
     *
     * This correctly infers the type `NgFor<number>` for `_t1`, since `T` is inferred from the
     * assignment of type `number[]` to `ngForOf`'s type `T[]`. However, if `any` is passed instead:
     *
     * ```
     * var _t2 = ctor({ngForOf: [1, 2] as any, ngForTrackBy: null as any, ngForTemplate: null as any});
     * ```
     *
     * then inference for `T` fails (it cannot be inferred from `T[] = any`). In this case, `T` takes
     * the type `{}`, and so `_t2` is inferred as `NgFor<{}>`. This is obviously wrong.
     *
     * Adding a default type to the generic declaration in the constructor solves this problem, as the
     * default type will be used in the event that inference fails.
     *
     * ```
     * declare function ctor<T = any>(o: Pick<NgFor<T>, 'ngForOf'>): NgFor<T>;
     *
     * var _t3 = ctor({ngForOf: [1, 2] as any});
     * ```
     *
     * This correctly infers `T` as `any`, and therefore `_t3` as `NgFor<any>`.
     */
    function typeParametersWithDefaultTypes(params) {
        if (params === undefined) {
            return undefined;
        }
        return params.map(function (param) {
            if (param.default === undefined) {
                return ts.updateTypeParameterDeclaration(
                /* node */ param, 
                /* name */ param.name, 
                /* constraint */ param.constraint, 
                /* defaultType */ ts.createKeywordTypeNode(ts.SyntaxKind.AnyKeyword));
            }
            else {
                return param;
            }
        });
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHlwZV9jb25zdHJ1Y3Rvci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbXBpbGVyLWNsaS9zcmMvbmd0c2MvdHlwZWNoZWNrL3NyYy90eXBlX2NvbnN0cnVjdG9yLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7OztJQUVILCtCQUFpQztJQUtqQywrR0FBOEQ7SUFFOUQsU0FBZ0IsNkJBQTZCLENBQ3pDLElBQTJDLEVBQUUsSUFBc0IsRUFBRSxXQUEwQixFQUMvRixVQUFxRCxFQUNyRCxTQUF5QjtRQUMzQixJQUFJLHNCQUFzQixDQUFDLElBQUksRUFBRSxTQUFTLENBQUMsRUFBRTtZQUMzQyxNQUFNLElBQUksS0FBSyxDQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSx5Q0FBc0MsQ0FBQyxDQUFDO1NBQzFFO1FBRUQsSUFBTSxXQUFXLEdBQUcsVUFBVSxLQUFLLFNBQVMsQ0FBQyxDQUFDLENBQUMsbUJBQW1CLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQztRQUMzRixJQUFNLE9BQU8sR0FBRyxFQUFFLENBQUMsdUJBQXVCLENBQUMsV0FBVyxFQUFFLFdBQVcsQ0FBQyxDQUFDO1FBRXJFLElBQU0sU0FBUyxHQUFHLDBCQUEwQixDQUFDLElBQUksRUFBRSxJQUFJLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFFbEUsSUFBTSxjQUFjLEdBQUcsOEJBQThCLENBQUMsVUFBVSxDQUFDLENBQUM7UUFFbEUsSUFBSSxJQUFJLENBQUMsSUFBSSxFQUFFO1lBQ2IsSUFBTSxNQUFNLEdBQUcsRUFBRSxDQUFDLHNCQUFzQjtZQUNwQyxvQkFBb0IsQ0FBQyxjQUFjO1lBQ25DLGdCQUFnQixDQUFBLENBQUMsU0FBUyxDQUFDO1lBQzNCLFVBQVUsQ0FBQyxPQUFPLENBQUcsQ0FBQztZQUUxQixJQUFNLElBQUksR0FBRyxFQUFFLENBQUMseUJBQXlCO1lBQ3JDLFVBQVUsQ0FBQyxJQUFJLENBQUMsTUFBTTtZQUN0QixVQUFVLENBQUMsTUFBTTtZQUNqQixVQUFVLENBQUMsRUFBRSxDQUFDLHVCQUF1QixDQUFDLEVBQUUsQ0FBQyxVQUFVLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDNUQsSUFBTSxRQUFRLEdBQUcsRUFBRSxDQUFDLDZCQUE2QixDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsRUFBRSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUM5RSxPQUFPLEVBQUUsQ0FBQyx1QkFBdUI7WUFDN0IsZUFBZSxDQUFDLFNBQVM7WUFDekIscUJBQXFCLENBQUMsUUFBUSxDQUFDLENBQUM7U0FDckM7YUFBTTtZQUNMLE9BQU8sRUFBRSxDQUFDLHlCQUF5QjtZQUMvQixnQkFBZ0IsQ0FBQyxTQUFTO1lBQzFCLGVBQWUsQ0FBQSxDQUFDLEVBQUUsQ0FBQyxjQUFjLENBQUMsRUFBRSxDQUFDLFVBQVUsQ0FBQyxjQUFjLENBQUMsQ0FBQztZQUNoRSxtQkFBbUIsQ0FBQyxTQUFTO1lBQzdCLFVBQVUsQ0FBQyxJQUFJLENBQUMsTUFBTTtZQUN0QixvQkFBb0IsQ0FBQyxjQUFjO1lBQ25DLGdCQUFnQixDQUFBLENBQUMsU0FBUyxDQUFDO1lBQzNCLFVBQVUsQ0FBQyxPQUFPO1lBQ2xCLFVBQVUsQ0FBQyxTQUFTLENBQUMsQ0FBQztTQUMzQjtJQUNILENBQUM7SUF4Q0Qsc0VBd0NDO0lBRUQ7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7T0FrQ0c7SUFDSCxTQUFnQixzQkFBc0IsQ0FDbEMsSUFBMkMsRUFBRSxJQUFzQjtRQUNyRSw4RkFBOEY7UUFDOUYsdUVBQXVFO1FBQ3ZFLHlFQUF5RTtRQUN6RSxJQUFNLFdBQVcsR0FDYixJQUFJLENBQUMsY0FBYyxLQUFLLFNBQVMsQ0FBQyxDQUFDLENBQUMsbUJBQW1CLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUM7UUFDN0YsSUFBTSxPQUFPLEdBQUcsRUFBRSxDQUFDLHVCQUF1QixDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsV0FBVyxDQUFDLENBQUM7UUFFbkUsSUFBTSxTQUFTLEdBQUcsMEJBQTBCLENBQUMsSUFBSSxFQUFFLElBQUksRUFBRSxPQUFPLENBQUMsQ0FBQztRQUVsRSw4RkFBOEY7UUFDOUYsK0ZBQStGO1FBQy9GLG9CQUFvQjtRQUNwQixJQUFJLElBQUksR0FBdUIsU0FBUyxDQUFDO1FBQ3pDLElBQUksSUFBSSxDQUFDLElBQUksRUFBRTtZQUNiLElBQUksR0FBRyxFQUFFLENBQUMsV0FBVyxDQUFDO2dCQUNwQixFQUFFLENBQUMsWUFBWSxDQUFDLEVBQUUsQ0FBQyx1QkFBdUIsQ0FBQyxFQUFFLENBQUMsVUFBVSxFQUFFLENBQUMsQ0FBQzthQUM3RCxDQUFDLENBQUM7U0FDSjtRQUVELGtEQUFrRDtRQUNsRCxPQUFPLEVBQUUsQ0FBQyxZQUFZO1FBQ2xCLGdCQUFnQixDQUFDLFNBQVM7UUFDMUIsZUFBZSxDQUFBLENBQUMsRUFBRSxDQUFDLGNBQWMsQ0FBQyxFQUFFLENBQUMsVUFBVSxDQUFDLGFBQWEsQ0FBQyxDQUFDO1FBQy9ELG1CQUFtQixDQUFDLFNBQVM7UUFDN0IsVUFBVSxDQUFDLElBQUksQ0FBQyxNQUFNO1FBQ3RCLG1CQUFtQixDQUFDLFNBQVM7UUFDN0Isb0JBQW9CLENBQUMsOEJBQThCLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQztRQUN4RSxnQkFBZ0IsQ0FBQSxDQUFDLFNBQVMsQ0FBQztRQUMzQixVQUFVLENBQUMsT0FBTztRQUNsQixVQUFVLENBQUMsSUFBSSxDQUFHLENBQUM7SUFDekIsQ0FBQztJQWhDRCx3REFnQ0M7SUFFRCxTQUFTLDBCQUEwQixDQUMvQixJQUEyQyxFQUFFLElBQXNCLEVBQ25FLE9BQTZCOztRQUMvQixzRkFBc0Y7UUFDdEYseURBQXlEO1FBQ3pELEVBQUU7UUFDRixtQ0FBbUM7UUFDbkMsRUFBRTtRQUNGLDhGQUE4RjtRQUM5Riw4QkFBOEI7UUFDOUIsRUFBRTtRQUNGLGtFQUFrRTtRQUNsRSxJQUFJLFFBQVEsR0FBcUIsSUFBSSxDQUFDO1FBRXRDLElBQU0sSUFBSSxHQUFhLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDO1FBQzFDLElBQU0sU0FBUyxHQUF5QixFQUFFLENBQUM7UUFDM0MsSUFBTSxXQUFXLEdBQTJCLEVBQUUsQ0FBQzs7WUFDL0MsS0FBa0IsSUFBQSxTQUFBLGlCQUFBLElBQUksQ0FBQSwwQkFBQSw0Q0FBRTtnQkFBbkIsSUFBTSxHQUFHLGlCQUFBO2dCQUNaLElBQUksQ0FBQyxJQUFJLENBQUMsa0JBQWtCLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxFQUFFO29CQUNyQyxTQUFTLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxxQkFBcUIsQ0FBQyxFQUFFLENBQUMsbUJBQW1CLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO2lCQUN2RTtxQkFBTTtvQkFDTCxXQUFXLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyx1QkFBdUI7b0JBQ3ZDLGVBQWUsQ0FBQyxTQUFTO29CQUN6QixVQUFVLENBQUMsR0FBRztvQkFDZCxtQkFBbUIsQ0FBQyxTQUFTO29CQUM3QixVQUFVLENBQUMsRUFBRSxDQUFDLG1CQUFtQixDQUM3QixFQUFFLENBQUMsbUJBQW1CLENBQUMsT0FBTyxDQUFDLFFBQVEsRUFBRSx1QkFBcUIsR0FBSyxDQUFDLENBQUM7b0JBQ3pFLGlCQUFpQixDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUM7aUJBQ25DO2FBQ0Y7Ozs7Ozs7OztRQUNELElBQUksU0FBUyxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7WUFDeEIsNENBQTRDO1lBQzVDLElBQU0sWUFBWSxHQUFHLEVBQUUsQ0FBQyxtQkFBbUIsQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUV2RCw2Q0FBNkM7WUFDN0MsUUFBUSxHQUFHLEVBQUUsQ0FBQyx1QkFBdUIsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxPQUFPLEVBQUUsWUFBWSxDQUFDLENBQUMsQ0FBQztTQUN4RTtRQUNELElBQUksV0FBVyxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7WUFDMUIsSUFBTSxjQUFjLEdBQUcsRUFBRSxDQUFDLHFCQUFxQixDQUFDLFdBQVcsQ0FBQyxDQUFDO1lBRTdELFFBQVE7Z0JBQ0osUUFBUSxLQUFLLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLG1CQUFtQixDQUFDLENBQUMsUUFBUSxFQUFFLGNBQWMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLGNBQWMsQ0FBQztTQUM3RjtRQUVELElBQUksUUFBUSxLQUFLLElBQUksRUFBRTtZQUNyQiw0RkFBNEY7WUFDNUYsUUFBUSxHQUFHLEVBQUUsQ0FBQyxxQkFBcUIsQ0FBQyxFQUFFLENBQUMsQ0FBQztTQUN6QztRQUVELHNDQUFzQztRQUN0QyxPQUFPLEVBQUUsQ0FBQyxlQUFlO1FBQ3JCLGdCQUFnQixDQUFDLFNBQVM7UUFDMUIsZUFBZSxDQUFDLFNBQVM7UUFDekIsb0JBQW9CLENBQUMsU0FBUztRQUM5QixVQUFVLENBQUMsTUFBTTtRQUNqQixtQkFBbUIsQ0FBQyxTQUFTO1FBQzdCLFVBQVUsQ0FBQyxRQUFRO1FBQ25CLGlCQUFpQixDQUFDLFNBQVMsQ0FBQyxDQUFDO0lBQ25DLENBQUM7SUFFRCxTQUFTLG1CQUFtQixDQUFDLE1BQWtEO1FBQzdFLE9BQU8sTUFBTSxDQUFDLEdBQUcsQ0FBQyxVQUFBLEtBQUssSUFBSSxPQUFBLEVBQUUsQ0FBQyx1QkFBdUIsQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLFNBQVMsQ0FBQyxFQUFqRCxDQUFpRCxDQUFDLENBQUM7SUFDaEYsQ0FBQztJQUVELFNBQWdCLHNCQUFzQixDQUNsQyxJQUEyQyxFQUFFLElBQW9CO1FBQ25FLDhGQUE4RjtRQUM5RixvQ0FBb0M7UUFDcEMsT0FBTyxDQUFDLHNDQUFzQyxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQztJQUM3RCxDQUFDO0lBTEQsd0RBS0M7SUFFRCxTQUFTLHNDQUFzQyxDQUMzQyxJQUEyQyxFQUFFLFNBQXlCO1FBQ3hFLCtGQUErRjtRQUMvRixPQUFPLElBQUksNkNBQW9CLENBQUMsSUFBSSxDQUFDLGNBQWMsRUFBRSxTQUFTLENBQUMsQ0FBQyxPQUFPLEVBQUUsQ0FBQztJQUM1RSxDQUFDO0lBRUQ7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O09BeUNHO0lBQ0gsU0FBUyw4QkFBOEIsQ0FDbkMsTUFBNkQ7UUFFL0QsSUFBSSxNQUFNLEtBQUssU0FBUyxFQUFFO1lBQ3hCLE9BQU8sU0FBUyxDQUFDO1NBQ2xCO1FBRUQsT0FBTyxNQUFNLENBQUMsR0FBRyxDQUFDLFVBQUEsS0FBSztZQUNyQixJQUFJLEtBQUssQ0FBQyxPQUFPLEtBQUssU0FBUyxFQUFFO2dCQUMvQixPQUFPLEVBQUUsQ0FBQyw4QkFBOEI7Z0JBQ3BDLFVBQVUsQ0FBQyxLQUFLO2dCQUNoQixVQUFVLENBQUMsS0FBSyxDQUFDLElBQUk7Z0JBQ3JCLGdCQUFnQixDQUFDLEtBQUssQ0FBQyxVQUFVO2dCQUNqQyxpQkFBaUIsQ0FBQyxFQUFFLENBQUMscUJBQXFCLENBQUMsRUFBRSxDQUFDLFVBQVUsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDO2FBQzNFO2lCQUFNO2dCQUNMLE9BQU8sS0FBSyxDQUFDO2FBQ2Q7UUFDSCxDQUFDLENBQUMsQ0FBQztJQUNMLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCAqIGFzIHRzIGZyb20gJ3R5cGVzY3JpcHQnO1xuXG5pbXBvcnQge0NsYXNzRGVjbGFyYXRpb24sIFJlZmxlY3Rpb25Ib3N0fSBmcm9tICcuLi8uLi9yZWZsZWN0aW9uJztcblxuaW1wb3J0IHtUeXBlQ3Rvck1ldGFkYXRhfSBmcm9tICcuL2FwaSc7XG5pbXBvcnQge1R5cGVQYXJhbWV0ZXJFbWl0dGVyfSBmcm9tICcuL3R5cGVfcGFyYW1ldGVyX2VtaXR0ZXInO1xuXG5leHBvcnQgZnVuY3Rpb24gZ2VuZXJhdGVUeXBlQ3RvckRlY2xhcmF0aW9uRm4oXG4gICAgbm9kZTogQ2xhc3NEZWNsYXJhdGlvbjx0cy5DbGFzc0RlY2xhcmF0aW9uPiwgbWV0YTogVHlwZUN0b3JNZXRhZGF0YSwgbm9kZVR5cGVSZWY6IHRzLkVudGl0eU5hbWUsXG4gICAgdHlwZVBhcmFtczogdHMuVHlwZVBhcmFtZXRlckRlY2xhcmF0aW9uW10gfCB1bmRlZmluZWQsXG4gICAgcmVmbGVjdG9yOiBSZWZsZWN0aW9uSG9zdCk6IHRzLlN0YXRlbWVudCB7XG4gIGlmIChyZXF1aXJlc0lubGluZVR5cGVDdG9yKG5vZGUsIHJlZmxlY3RvcikpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoYCR7bm9kZS5uYW1lLnRleHR9IHJlcXVpcmVzIGFuIGlubGluZSB0eXBlIGNvbnN0cnVjdG9yYCk7XG4gIH1cblxuICBjb25zdCByYXdUeXBlQXJncyA9IHR5cGVQYXJhbXMgIT09IHVuZGVmaW5lZCA/IGdlbmVyYXRlR2VuZXJpY0FyZ3ModHlwZVBhcmFtcykgOiB1bmRlZmluZWQ7XG4gIGNvbnN0IHJhd1R5cGUgPSB0cy5jcmVhdGVUeXBlUmVmZXJlbmNlTm9kZShub2RlVHlwZVJlZiwgcmF3VHlwZUFyZ3MpO1xuXG4gIGNvbnN0IGluaXRQYXJhbSA9IGNvbnN0cnVjdFR5cGVDdG9yUGFyYW1ldGVyKG5vZGUsIG1ldGEsIHJhd1R5cGUpO1xuXG4gIGNvbnN0IHR5cGVQYXJhbWV0ZXJzID0gdHlwZVBhcmFtZXRlcnNXaXRoRGVmYXVsdFR5cGVzKHR5cGVQYXJhbXMpO1xuXG4gIGlmIChtZXRhLmJvZHkpIHtcbiAgICBjb25zdCBmblR5cGUgPSB0cy5jcmVhdGVGdW5jdGlvblR5cGVOb2RlKFxuICAgICAgICAvKiB0eXBlUGFyYW1ldGVycyAqLyB0eXBlUGFyYW1ldGVycyxcbiAgICAgICAgLyogcGFyYW1ldGVycyAqL1tpbml0UGFyYW1dLFxuICAgICAgICAvKiB0eXBlICovIHJhd1R5cGUsICk7XG5cbiAgICBjb25zdCBkZWNsID0gdHMuY3JlYXRlVmFyaWFibGVEZWNsYXJhdGlvbihcbiAgICAgICAgLyogbmFtZSAqLyBtZXRhLmZuTmFtZSxcbiAgICAgICAgLyogdHlwZSAqLyBmblR5cGUsXG4gICAgICAgIC8qIGJvZHkgKi8gdHMuY3JlYXRlTm9uTnVsbEV4cHJlc3Npb24odHMuY3JlYXRlTnVsbCgpKSk7XG4gICAgY29uc3QgZGVjbExpc3QgPSB0cy5jcmVhdGVWYXJpYWJsZURlY2xhcmF0aW9uTGlzdChbZGVjbF0sIHRzLk5vZGVGbGFncy5Db25zdCk7XG4gICAgcmV0dXJuIHRzLmNyZWF0ZVZhcmlhYmxlU3RhdGVtZW50KFxuICAgICAgICAvKiBtb2RpZmllcnMgKi8gdW5kZWZpbmVkLFxuICAgICAgICAvKiBkZWNsYXJhdGlvbkxpc3QgKi8gZGVjbExpc3QpO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiB0cy5jcmVhdGVGdW5jdGlvbkRlY2xhcmF0aW9uKFxuICAgICAgICAvKiBkZWNvcmF0b3JzICovIHVuZGVmaW5lZCxcbiAgICAgICAgLyogbW9kaWZpZXJzICovW3RzLmNyZWF0ZU1vZGlmaWVyKHRzLlN5bnRheEtpbmQuRGVjbGFyZUtleXdvcmQpXSxcbiAgICAgICAgLyogYXN0ZXJpc2tUb2tlbiAqLyB1bmRlZmluZWQsXG4gICAgICAgIC8qIG5hbWUgKi8gbWV0YS5mbk5hbWUsXG4gICAgICAgIC8qIHR5cGVQYXJhbWV0ZXJzICovIHR5cGVQYXJhbWV0ZXJzLFxuICAgICAgICAvKiBwYXJhbWV0ZXJzICovW2luaXRQYXJhbV0sXG4gICAgICAgIC8qIHR5cGUgKi8gcmF3VHlwZSxcbiAgICAgICAgLyogYm9keSAqLyB1bmRlZmluZWQpO1xuICB9XG59XG5cbi8qKlxuICogR2VuZXJhdGUgYW4gaW5saW5lIHR5cGUgY29uc3RydWN0b3IgZm9yIHRoZSBnaXZlbiBjbGFzcyBhbmQgbWV0YWRhdGEuXG4gKlxuICogQW4gaW5saW5lIHR5cGUgY29uc3RydWN0b3IgaXMgYSBzcGVjaWFsbHkgc2hhcGVkIFR5cGVTY3JpcHQgc3RhdGljIG1ldGhvZCwgaW50ZW5kZWQgdG8gYmUgcGxhY2VkXG4gKiB3aXRoaW4gYSBkaXJlY3RpdmUgY2xhc3MgaXRzZWxmLCB0aGF0IHBlcm1pdHMgdHlwZSBpbmZlcmVuY2Ugb2YgYW55IGdlbmVyaWMgdHlwZSBwYXJhbWV0ZXJzIG9mXG4gKiB0aGUgY2xhc3MgZnJvbSB0aGUgdHlwZXMgb2YgZXhwcmVzc2lvbnMgYm91bmQgdG8gaW5wdXRzIG9yIG91dHB1dHMsIGFuZCB0aGUgdHlwZXMgb2YgZWxlbWVudHNcbiAqIHRoYXQgbWF0Y2ggcXVlcmllcyBwZXJmb3JtZWQgYnkgdGhlIGRpcmVjdGl2ZS4gSXQgYWxzbyBjYXRjaGVzIGFueSBlcnJvcnMgaW4gdGhlIHR5cGVzIG9mIHRoZXNlXG4gKiBleHByZXNzaW9ucy4gVGhpcyBtZXRob2QgaXMgbmV2ZXIgY2FsbGVkIGF0IHJ1bnRpbWUsIGJ1dCBpcyB1c2VkIGluIHR5cGUtY2hlY2sgYmxvY2tzIHRvXG4gKiBjb25zdHJ1Y3QgZGlyZWN0aXZlIHR5cGVzLlxuICpcbiAqIEFuIGlubGluZSB0eXBlIGNvbnN0cnVjdG9yIGZvciBOZ0ZvciBsb29rcyBsaWtlOlxuICpcbiAqIHN0YXRpYyBuZ1R5cGVDdG9yPFQ+KGluaXQ6IFBpY2s8TmdGb3JPZjxUPiwgJ25nRm9yT2YnfCduZ0ZvclRyYWNrQnknfCduZ0ZvclRlbXBsYXRlJz4pOlxuICogICBOZ0Zvck9mPFQ+O1xuICpcbiAqIEEgdHlwaWNhbCBjb25zdHJ1Y3RvciB3b3VsZCBiZTpcbiAqXG4gKiBOZ0Zvck9mLm5nVHlwZUN0b3IoaW5pdDoge1xuICogICBuZ0Zvck9mOiBbJ2ZvbycsICdiYXInXSxcbiAqICAgbmdGb3JUcmFja0J5OiBudWxsIGFzIGFueSxcbiAqICAgbmdGb3JUZW1wbGF0ZTogbnVsbCBhcyBhbnksXG4gKiB9KTsgLy8gSW5mZXJzIGEgdHlwZSBvZiBOZ0Zvck9mPHN0cmluZz4uXG4gKlxuICogQW55IGlucHV0cyBkZWNsYXJlZCBvbiB0aGUgdHlwZSBmb3Igd2hpY2ggbm8gcHJvcGVydHkgYmluZGluZyBpcyBwcmVzZW50IGFyZSBhc3NpZ25lZCBhIHZhbHVlIG9mXG4gKiB0eXBlIGBhbnlgLCB0byBhdm9pZCBwcm9kdWNpbmcgYW55IHR5cGUgZXJyb3JzIGZvciB1bnNldCBpbnB1dHMuXG4gKlxuICogSW5saW5lIHR5cGUgY29uc3RydWN0b3JzIGFyZSB1c2VkIHdoZW4gdGhlIHR5cGUgYmVpbmcgY3JlYXRlZCBoYXMgYm91bmRlZCBnZW5lcmljIHR5cGVzIHdoaWNoXG4gKiBtYWtlIHdyaXRpbmcgYSBkZWNsYXJlZCB0eXBlIGNvbnN0cnVjdG9yICh2aWEgYGdlbmVyYXRlVHlwZUN0b3JEZWNsYXJhdGlvbkZuYCkgZGlmZmljdWx0IG9yXG4gKiBpbXBvc3NpYmxlLlxuICpcbiAqIEBwYXJhbSBub2RlIHRoZSBgQ2xhc3NEZWNsYXJhdGlvbjx0cy5DbGFzc0RlY2xhcmF0aW9uPmAgZm9yIHdoaWNoIGEgdHlwZSBjb25zdHJ1Y3RvciB3aWxsIGJlXG4gKiBnZW5lcmF0ZWQuXG4gKiBAcGFyYW0gbWV0YSBhZGRpdGlvbmFsIG1ldGFkYXRhIHJlcXVpcmVkIHRvIGdlbmVyYXRlIHRoZSB0eXBlIGNvbnN0cnVjdG9yLlxuICogQHJldHVybnMgYSBgdHMuTWV0aG9kRGVjbGFyYXRpb25gIGZvciB0aGUgdHlwZSBjb25zdHJ1Y3Rvci5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdlbmVyYXRlSW5saW5lVHlwZUN0b3IoXG4gICAgbm9kZTogQ2xhc3NEZWNsYXJhdGlvbjx0cy5DbGFzc0RlY2xhcmF0aW9uPiwgbWV0YTogVHlwZUN0b3JNZXRhZGF0YSk6IHRzLk1ldGhvZERlY2xhcmF0aW9uIHtcbiAgLy8gQnVpbGQgcmF3VHlwZSwgYSBgdHMuVHlwZU5vZGVgIG9mIHRoZSBjbGFzcyB3aXRoIGl0cyBnZW5lcmljIHBhcmFtZXRlcnMgcGFzc2VkIHRocm91Z2ggZnJvbVxuICAvLyB0aGUgZGVmaW5pdGlvbiB3aXRob3V0IGFueSB0eXBlIGJvdW5kcy4gRm9yIGV4YW1wbGUsIGlmIHRoZSBjbGFzcyBpc1xuICAvLyBgRm9vRGlyZWN0aXZlPFQgZXh0ZW5kcyBCYXI+YCwgaXRzIHJhd1R5cGUgd291bGQgYmUgYEZvb0RpcmVjdGl2ZTxUPmAuXG4gIGNvbnN0IHJhd1R5cGVBcmdzID1cbiAgICAgIG5vZGUudHlwZVBhcmFtZXRlcnMgIT09IHVuZGVmaW5lZCA/IGdlbmVyYXRlR2VuZXJpY0FyZ3Mobm9kZS50eXBlUGFyYW1ldGVycykgOiB1bmRlZmluZWQ7XG4gIGNvbnN0IHJhd1R5cGUgPSB0cy5jcmVhdGVUeXBlUmVmZXJlbmNlTm9kZShub2RlLm5hbWUsIHJhd1R5cGVBcmdzKTtcblxuICBjb25zdCBpbml0UGFyYW0gPSBjb25zdHJ1Y3RUeXBlQ3RvclBhcmFtZXRlcihub2RlLCBtZXRhLCByYXdUeXBlKTtcblxuICAvLyBJZiB0aGlzIGNvbnN0cnVjdG9yIGlzIGJlaW5nIGdlbmVyYXRlZCBpbnRvIGEgLnRzIGZpbGUsIHRoZW4gaXQgbmVlZHMgYSBmYWtlIGJvZHkuIFRoZSBib2R5XG4gIC8vIGlzIHNldCB0byBhIHJldHVybiBvZiBgbnVsbCFgLiBJZiB0aGUgdHlwZSBjb25zdHJ1Y3RvciBpcyBiZWluZyBnZW5lcmF0ZWQgaW50byBhIC5kLnRzIGZpbGUsXG4gIC8vIGl0IG5lZWRzIG5vIGJvZHkuXG4gIGxldCBib2R5OiB0cy5CbG9ja3x1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gIGlmIChtZXRhLmJvZHkpIHtcbiAgICBib2R5ID0gdHMuY3JlYXRlQmxvY2soW1xuICAgICAgdHMuY3JlYXRlUmV0dXJuKHRzLmNyZWF0ZU5vbk51bGxFeHByZXNzaW9uKHRzLmNyZWF0ZU51bGwoKSkpLFxuICAgIF0pO1xuICB9XG5cbiAgLy8gQ3JlYXRlIHRoZSB0eXBlIGNvbnN0cnVjdG9yIG1ldGhvZCBkZWNsYXJhdGlvbi5cbiAgcmV0dXJuIHRzLmNyZWF0ZU1ldGhvZChcbiAgICAgIC8qIGRlY29yYXRvcnMgKi8gdW5kZWZpbmVkLFxuICAgICAgLyogbW9kaWZpZXJzICovW3RzLmNyZWF0ZU1vZGlmaWVyKHRzLlN5bnRheEtpbmQuU3RhdGljS2V5d29yZCldLFxuICAgICAgLyogYXN0ZXJpc2tUb2tlbiAqLyB1bmRlZmluZWQsXG4gICAgICAvKiBuYW1lICovIG1ldGEuZm5OYW1lLFxuICAgICAgLyogcXVlc3Rpb25Ub2tlbiAqLyB1bmRlZmluZWQsXG4gICAgICAvKiB0eXBlUGFyYW1ldGVycyAqLyB0eXBlUGFyYW1ldGVyc1dpdGhEZWZhdWx0VHlwZXMobm9kZS50eXBlUGFyYW1ldGVycyksXG4gICAgICAvKiBwYXJhbWV0ZXJzICovW2luaXRQYXJhbV0sXG4gICAgICAvKiB0eXBlICovIHJhd1R5cGUsXG4gICAgICAvKiBib2R5ICovIGJvZHksICk7XG59XG5cbmZ1bmN0aW9uIGNvbnN0cnVjdFR5cGVDdG9yUGFyYW1ldGVyKFxuICAgIG5vZGU6IENsYXNzRGVjbGFyYXRpb248dHMuQ2xhc3NEZWNsYXJhdGlvbj4sIG1ldGE6IFR5cGVDdG9yTWV0YWRhdGEsXG4gICAgcmF3VHlwZTogdHMuVHlwZVJlZmVyZW5jZU5vZGUpOiB0cy5QYXJhbWV0ZXJEZWNsYXJhdGlvbiB7XG4gIC8vIGluaXRUeXBlIGlzIHRoZSB0eXBlIG9mICdpbml0JywgdGhlIHNpbmdsZSBhcmd1bWVudCB0byB0aGUgdHlwZSBjb25zdHJ1Y3RvciBtZXRob2QuXG4gIC8vIElmIHRoZSBEaXJlY3RpdmUgaGFzIGFueSBpbnB1dHMsIGl0cyBpbml0VHlwZSB3aWxsIGJlOlxuICAvL1xuICAvLyBQaWNrPHJhd1R5cGUsICdpbnB1dEEnfCdpbnB1dEInPlxuICAvL1xuICAvLyBQaWNrIGhlcmUgaXMgdXNlZCB0byBzZWxlY3Qgb25seSB0aG9zZSBmaWVsZHMgZnJvbSB3aGljaCB0aGUgZ2VuZXJpYyB0eXBlIHBhcmFtZXRlcnMgb2YgdGhlXG4gIC8vIGRpcmVjdGl2ZSB3aWxsIGJlIGluZmVycmVkLlxuICAvL1xuICAvLyBJbiB0aGUgc3BlY2lhbCBjYXNlIHRoZXJlIGFyZSBubyBpbnB1dHMsIGluaXRUeXBlIGlzIHNldCB0byB7fS5cbiAgbGV0IGluaXRUeXBlOiB0cy5UeXBlTm9kZXxudWxsID0gbnVsbDtcblxuICBjb25zdCBrZXlzOiBzdHJpbmdbXSA9IG1ldGEuZmllbGRzLmlucHV0cztcbiAgY29uc3QgcGxhaW5LZXlzOiB0cy5MaXRlcmFsVHlwZU5vZGVbXSA9IFtdO1xuICBjb25zdCBjb2VyY2VkS2V5czogdHMuUHJvcGVydHlTaWduYXR1cmVbXSA9IFtdO1xuICBmb3IgKGNvbnN0IGtleSBvZiBrZXlzKSB7XG4gICAgaWYgKCFtZXRhLmNvZXJjZWRJbnB1dEZpZWxkcy5oYXMoa2V5KSkge1xuICAgICAgcGxhaW5LZXlzLnB1c2godHMuY3JlYXRlTGl0ZXJhbFR5cGVOb2RlKHRzLmNyZWF0ZVN0cmluZ0xpdGVyYWwoa2V5KSkpO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb2VyY2VkS2V5cy5wdXNoKHRzLmNyZWF0ZVByb3BlcnR5U2lnbmF0dXJlKFxuICAgICAgICAgIC8qIG1vZGlmaWVycyAqLyB1bmRlZmluZWQsXG4gICAgICAgICAgLyogbmFtZSAqLyBrZXksXG4gICAgICAgICAgLyogcXVlc3Rpb25Ub2tlbiAqLyB1bmRlZmluZWQsXG4gICAgICAgICAgLyogdHlwZSAqLyB0cy5jcmVhdGVUeXBlUXVlcnlOb2RlKFxuICAgICAgICAgICAgICB0cy5jcmVhdGVRdWFsaWZpZWROYW1lKHJhd1R5cGUudHlwZU5hbWUsIGBuZ0FjY2VwdElucHV0VHlwZV8ke2tleX1gKSksXG4gICAgICAgICAgLyogaW5pdGlhbGl6ZXIgKi8gdW5kZWZpbmVkKSk7XG4gICAgfVxuICB9XG4gIGlmIChwbGFpbktleXMubGVuZ3RoID4gMCkge1xuICAgIC8vIENvbnN0cnVjdCBhIHVuaW9uIG9mIGFsbCB0aGUgZmllbGQgbmFtZXMuXG4gICAgY29uc3Qga2V5VHlwZVVuaW9uID0gdHMuY3JlYXRlVW5pb25UeXBlTm9kZShwbGFpbktleXMpO1xuXG4gICAgLy8gQ29uc3RydWN0IHRoZSBQaWNrPHJhd1R5cGUsIGtleVR5cGVVbmlvbj4uXG4gICAgaW5pdFR5cGUgPSB0cy5jcmVhdGVUeXBlUmVmZXJlbmNlTm9kZSgnUGljaycsIFtyYXdUeXBlLCBrZXlUeXBlVW5pb25dKTtcbiAgfVxuICBpZiAoY29lcmNlZEtleXMubGVuZ3RoID4gMCkge1xuICAgIGNvbnN0IGNvZXJjZWRMaXRlcmFsID0gdHMuY3JlYXRlVHlwZUxpdGVyYWxOb2RlKGNvZXJjZWRLZXlzKTtcblxuICAgIGluaXRUeXBlID1cbiAgICAgICAgaW5pdFR5cGUgIT09IG51bGwgPyB0cy5jcmVhdGVVbmlvblR5cGVOb2RlKFtpbml0VHlwZSwgY29lcmNlZExpdGVyYWxdKSA6IGNvZXJjZWRMaXRlcmFsO1xuICB9XG5cbiAgaWYgKGluaXRUeXBlID09PSBudWxsKSB7XG4gICAgLy8gU3BlY2lhbCBjYXNlIC0gbm8gaW5wdXRzLCBvdXRwdXRzLCBvciBvdGhlciBmaWVsZHMgd2hpY2ggY291bGQgaW5mbHVlbmNlIHRoZSByZXN1bHQgdHlwZS5cbiAgICBpbml0VHlwZSA9IHRzLmNyZWF0ZVR5cGVMaXRlcmFsTm9kZShbXSk7XG4gIH1cblxuICAvLyBDcmVhdGUgdGhlICdpbml0JyBwYXJhbWV0ZXIgaXRzZWxmLlxuICByZXR1cm4gdHMuY3JlYXRlUGFyYW1ldGVyKFxuICAgICAgLyogZGVjb3JhdG9ycyAqLyB1bmRlZmluZWQsXG4gICAgICAvKiBtb2RpZmllcnMgKi8gdW5kZWZpbmVkLFxuICAgICAgLyogZG90RG90RG90VG9rZW4gKi8gdW5kZWZpbmVkLFxuICAgICAgLyogbmFtZSAqLyAnaW5pdCcsXG4gICAgICAvKiBxdWVzdGlvblRva2VuICovIHVuZGVmaW5lZCxcbiAgICAgIC8qIHR5cGUgKi8gaW5pdFR5cGUsXG4gICAgICAvKiBpbml0aWFsaXplciAqLyB1bmRlZmluZWQpO1xufVxuXG5mdW5jdGlvbiBnZW5lcmF0ZUdlbmVyaWNBcmdzKHBhcmFtczogUmVhZG9ubHlBcnJheTx0cy5UeXBlUGFyYW1ldGVyRGVjbGFyYXRpb24+KTogdHMuVHlwZU5vZGVbXSB7XG4gIHJldHVybiBwYXJhbXMubWFwKHBhcmFtID0+IHRzLmNyZWF0ZVR5cGVSZWZlcmVuY2VOb2RlKHBhcmFtLm5hbWUsIHVuZGVmaW5lZCkpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcmVxdWlyZXNJbmxpbmVUeXBlQ3RvcihcbiAgICBub2RlOiBDbGFzc0RlY2xhcmF0aW9uPHRzLkNsYXNzRGVjbGFyYXRpb24+LCBob3N0OiBSZWZsZWN0aW9uSG9zdCk6IGJvb2xlYW4ge1xuICAvLyBUaGUgY2xhc3MgcmVxdWlyZXMgYW4gaW5saW5lIHR5cGUgY29uc3RydWN0b3IgaWYgaXQgaGFzIGdlbmVyaWMgdHlwZSBib3VuZHMgdGhhdCBjYW4gbm90IGJlXG4gIC8vIGVtaXR0ZWQgaW50byBhIGRpZmZlcmVudCBjb250ZXh0LlxuICByZXR1cm4gIWNoZWNrSWZHZW5lcmljVHlwZUJvdW5kc0FyZUNvbnRleHRGcmVlKG5vZGUsIGhvc3QpO1xufVxuXG5mdW5jdGlvbiBjaGVja0lmR2VuZXJpY1R5cGVCb3VuZHNBcmVDb250ZXh0RnJlZShcbiAgICBub2RlOiBDbGFzc0RlY2xhcmF0aW9uPHRzLkNsYXNzRGVjbGFyYXRpb24+LCByZWZsZWN0b3I6IFJlZmxlY3Rpb25Ib3N0KTogYm9vbGVhbiB7XG4gIC8vIEdlbmVyaWMgdHlwZSBwYXJhbWV0ZXJzIGFyZSBjb25zaWRlcmVkIGNvbnRleHQgZnJlZSBpZiB0aGV5IGNhbiBiZSBlbWl0dGVkIGludG8gYW55IGNvbnRleHQuXG4gIHJldHVybiBuZXcgVHlwZVBhcmFtZXRlckVtaXR0ZXIobm9kZS50eXBlUGFyYW1ldGVycywgcmVmbGVjdG9yKS5jYW5FbWl0KCk7XG59XG5cbi8qKlxuICogQWRkIGEgZGVmYXVsdCBgPSBhbnlgIHRvIHR5cGUgcGFyYW1ldGVycyB0aGF0IGRvbid0IGhhdmUgYSBkZWZhdWx0IHZhbHVlIGFscmVhZHkuXG4gKlxuICogVHlwZVNjcmlwdCB1c2VzIHRoZSBkZWZhdWx0IHR5cGUgb2YgYSB0eXBlIHBhcmFtZXRlciB3aGVuZXZlciBpbmZlcmVuY2Ugb2YgdGhhdCBwYXJhbWV0ZXIgZmFpbHMuXG4gKiBUaGlzIGNhbiBoYXBwZW4gd2hlbiBpbmZlcnJpbmcgYSBjb21wbGV4IHR5cGUgZnJvbSAnYW55Jy4gRm9yIGV4YW1wbGUsIGlmIGBOZ0ZvcmAncyBpbmZlcmVuY2UgaXNcbiAqIGRvbmUgd2l0aCB0aGUgVENCIGNvZGU6XG4gKlxuICogYGBgXG4gKiBjbGFzcyBOZ0ZvcjxUPiB7XG4gKiAgIG5nRm9yT2Y6IFRbXTtcbiAqIH1cbiAqXG4gKiBkZWNsYXJlIGZ1bmN0aW9uIGN0b3I8VD4obzogUGljazxOZ0ZvcjxUPiwgJ25nRm9yT2YnfCduZ0ZvclRyYWNrQnknfCduZ0ZvclRlbXBsYXRlJz4pOiBOZ0ZvcjxUPjtcbiAqIGBgYFxuICpcbiAqIEFuIGludm9jYXRpb24gbG9va3MgbGlrZTpcbiAqXG4gKiBgYGBcbiAqIHZhciBfdDEgPSBjdG9yKHtuZ0Zvck9mOiBbMSwgMl0sIG5nRm9yVHJhY2tCeTogbnVsbCBhcyBhbnksIG5nRm9yVGVtcGxhdGU6IG51bGwgYXMgYW55fSk7XG4gKiBgYGBcbiAqXG4gKiBUaGlzIGNvcnJlY3RseSBpbmZlcnMgdGhlIHR5cGUgYE5nRm9yPG51bWJlcj5gIGZvciBgX3QxYCwgc2luY2UgYFRgIGlzIGluZmVycmVkIGZyb20gdGhlXG4gKiBhc3NpZ25tZW50IG9mIHR5cGUgYG51bWJlcltdYCB0byBgbmdGb3JPZmAncyB0eXBlIGBUW11gLiBIb3dldmVyLCBpZiBgYW55YCBpcyBwYXNzZWQgaW5zdGVhZDpcbiAqXG4gKiBgYGBcbiAqIHZhciBfdDIgPSBjdG9yKHtuZ0Zvck9mOiBbMSwgMl0gYXMgYW55LCBuZ0ZvclRyYWNrQnk6IG51bGwgYXMgYW55LCBuZ0ZvclRlbXBsYXRlOiBudWxsIGFzIGFueX0pO1xuICogYGBgXG4gKlxuICogdGhlbiBpbmZlcmVuY2UgZm9yIGBUYCBmYWlscyAoaXQgY2Fubm90IGJlIGluZmVycmVkIGZyb20gYFRbXSA9IGFueWApLiBJbiB0aGlzIGNhc2UsIGBUYCB0YWtlc1xuICogdGhlIHR5cGUgYHt9YCwgYW5kIHNvIGBfdDJgIGlzIGluZmVycmVkIGFzIGBOZ0Zvcjx7fT5gLiBUaGlzIGlzIG9idmlvdXNseSB3cm9uZy5cbiAqXG4gKiBBZGRpbmcgYSBkZWZhdWx0IHR5cGUgdG8gdGhlIGdlbmVyaWMgZGVjbGFyYXRpb24gaW4gdGhlIGNvbnN0cnVjdG9yIHNvbHZlcyB0aGlzIHByb2JsZW0sIGFzIHRoZVxuICogZGVmYXVsdCB0eXBlIHdpbGwgYmUgdXNlZCBpbiB0aGUgZXZlbnQgdGhhdCBpbmZlcmVuY2UgZmFpbHMuXG4gKlxuICogYGBgXG4gKiBkZWNsYXJlIGZ1bmN0aW9uIGN0b3I8VCA9IGFueT4obzogUGljazxOZ0ZvcjxUPiwgJ25nRm9yT2YnPik6IE5nRm9yPFQ+O1xuICpcbiAqIHZhciBfdDMgPSBjdG9yKHtuZ0Zvck9mOiBbMSwgMl0gYXMgYW55fSk7XG4gKiBgYGBcbiAqXG4gKiBUaGlzIGNvcnJlY3RseSBpbmZlcnMgYFRgIGFzIGBhbnlgLCBhbmQgdGhlcmVmb3JlIGBfdDNgIGFzIGBOZ0Zvcjxhbnk+YC5cbiAqL1xuZnVuY3Rpb24gdHlwZVBhcmFtZXRlcnNXaXRoRGVmYXVsdFR5cGVzKFxuICAgIHBhcmFtczogUmVhZG9ubHlBcnJheTx0cy5UeXBlUGFyYW1ldGVyRGVjbGFyYXRpb24+fCB1bmRlZmluZWQpOiB0cy5UeXBlUGFyYW1ldGVyRGVjbGFyYXRpb25bXXxcbiAgICB1bmRlZmluZWQge1xuICBpZiAocGFyYW1zID09PSB1bmRlZmluZWQpIHtcbiAgICByZXR1cm4gdW5kZWZpbmVkO1xuICB9XG5cbiAgcmV0dXJuIHBhcmFtcy5tYXAocGFyYW0gPT4ge1xuICAgIGlmIChwYXJhbS5kZWZhdWx0ID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHJldHVybiB0cy51cGRhdGVUeXBlUGFyYW1ldGVyRGVjbGFyYXRpb24oXG4gICAgICAgICAgLyogbm9kZSAqLyBwYXJhbSxcbiAgICAgICAgICAvKiBuYW1lICovIHBhcmFtLm5hbWUsXG4gICAgICAgICAgLyogY29uc3RyYWludCAqLyBwYXJhbS5jb25zdHJhaW50LFxuICAgICAgICAgIC8qIGRlZmF1bHRUeXBlICovIHRzLmNyZWF0ZUtleXdvcmRUeXBlTm9kZSh0cy5TeW50YXhLaW5kLkFueUtleXdvcmQpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHBhcmFtO1xuICAgIH1cbiAgfSk7XG59XG4iXX0=