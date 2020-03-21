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
        define("@angular/compiler-cli/src/ngtsc/typecheck/src/environment", ["require", "exports", "tslib", "@angular/compiler", "typescript", "@angular/compiler-cli/src/ngtsc/imports", "@angular/compiler-cli/src/ngtsc/translator", "@angular/compiler-cli/src/ngtsc/typecheck/src/ts_util", "@angular/compiler-cli/src/ngtsc/typecheck/src/type_constructor", "@angular/compiler-cli/src/ngtsc/typecheck/src/type_parameter_emitter"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var tslib_1 = require("tslib");
    var compiler_1 = require("@angular/compiler");
    var ts = require("typescript");
    var imports_1 = require("@angular/compiler-cli/src/ngtsc/imports");
    var translator_1 = require("@angular/compiler-cli/src/ngtsc/translator");
    var ts_util_1 = require("@angular/compiler-cli/src/ngtsc/typecheck/src/ts_util");
    var type_constructor_1 = require("@angular/compiler-cli/src/ngtsc/typecheck/src/type_constructor");
    var type_parameter_emitter_1 = require("@angular/compiler-cli/src/ngtsc/typecheck/src/type_parameter_emitter");
    /**
     * A context which hosts one or more Type Check Blocks (TCBs).
     *
     * An `Environment` supports the generation of TCBs by tracking necessary imports, declarations of
     * type constructors, and other statements beyond the type-checking code within the TCB itself.
     * Through method calls on `Environment`, the TCB generator can request `ts.Expression`s which
     * reference declarations in the `Environment` for these artifacts`.
     *
     * `Environment` can be used in a standalone fashion, or can be extended to support more specialized
     * usage.
     */
    var Environment = /** @class */ (function () {
        function Environment(config, importManager, refEmitter, reflector, contextFile) {
            this.config = config;
            this.importManager = importManager;
            this.refEmitter = refEmitter;
            this.reflector = reflector;
            this.contextFile = contextFile;
            this.nextIds = {
                pipeInst: 1,
                typeCtor: 1,
            };
            this.typeCtors = new Map();
            this.typeCtorStatements = [];
            this.pipeInsts = new Map();
            this.pipeInstStatements = [];
            this.outputHelperIdent = null;
            this.helperStatements = [];
        }
        /**
         * Get an expression referring to a type constructor for the given directive.
         *
         * Depending on the shape of the directive itself, this could be either a reference to a declared
         * type constructor, or to an inline type constructor.
         */
        Environment.prototype.typeCtorFor = function (dir) {
            var dirRef = dir.ref;
            var node = dirRef.node;
            if (this.typeCtors.has(node)) {
                return this.typeCtors.get(node);
            }
            if (type_constructor_1.requiresInlineTypeCtor(node, this.reflector)) {
                // The constructor has already been created inline, we just need to construct a reference to
                // it.
                var ref = this.reference(dirRef);
                var typeCtorExpr = ts.createPropertyAccess(ref, 'ngTypeCtor');
                this.typeCtors.set(node, typeCtorExpr);
                return typeCtorExpr;
            }
            else {
                var fnName = "_ctor" + this.nextIds.typeCtor++;
                var nodeTypeRef = this.referenceType(dirRef);
                if (!ts.isTypeReferenceNode(nodeTypeRef)) {
                    throw new Error("Expected TypeReferenceNode from reference to " + dirRef.debugName);
                }
                var meta = {
                    fnName: fnName,
                    body: true,
                    fields: {
                        inputs: Object.keys(dir.inputs),
                        outputs: Object.keys(dir.outputs),
                        // TODO: support queries
                        queries: dir.queries,
                    },
                    coercedInputFields: dir.coercedInputFields,
                };
                var typeParams = this.emitTypeParameters(node);
                var typeCtor = type_constructor_1.generateTypeCtorDeclarationFn(node, meta, nodeTypeRef.typeName, typeParams, this.reflector);
                this.typeCtorStatements.push(typeCtor);
                var fnId = ts.createIdentifier(fnName);
                this.typeCtors.set(node, fnId);
                return fnId;
            }
        };
        /*
         * Get an expression referring to an instance of the given pipe.
         */
        Environment.prototype.pipeInst = function (ref) {
            if (this.pipeInsts.has(ref.node)) {
                return this.pipeInsts.get(ref.node);
            }
            var pipeType = this.referenceType(ref);
            var pipeInstId = ts.createIdentifier("_pipe" + this.nextIds.pipeInst++);
            this.pipeInstStatements.push(ts_util_1.tsDeclareVariable(pipeInstId, pipeType));
            this.pipeInsts.set(ref.node, pipeInstId);
            return pipeInstId;
        };
        /**
         * Declares a helper function to be able to cast directive outputs of type `EventEmitter<T>` to
         * have an accurate `subscribe()` method that properly carries over the generic type `T` into the
         * listener function passed as argument to `subscribe`. This is done to work around a typing
         * deficiency in `EventEmitter.subscribe`, where the listener function is typed as any.
         */
        Environment.prototype.declareOutputHelper = function () {
            if (this.outputHelperIdent !== null) {
                return this.outputHelperIdent;
            }
            var outputHelperIdent = ts.createIdentifier('_outputHelper');
            var genericTypeDecl = ts.createTypeParameterDeclaration('T');
            var genericTypeRef = ts.createTypeReferenceNode('T', /* typeParameters */ undefined);
            var eventEmitter = this.referenceExternalType('@angular/core', 'EventEmitter', [new compiler_1.ExpressionType(new compiler_1.WrappedNodeExpr(genericTypeRef))]);
            // Declare a type that has a `subscribe` method that carries over type `T` as parameter
            // into the callback. The below code generates the following type literal:
            // `{subscribe(cb: (event: T) => any): void;}`
            var observableLike = ts.createTypeLiteralNode([ts.createMethodSignature(
                /* typeParameters */ undefined, 
                /* parameters */ [ts.createParameter(
                    /* decorators */ undefined, 
                    /* modifiers */ undefined, 
                    /* dotDotDotToken */ undefined, 
                    /* name */ 'cb', 
                    /* questionToken */ undefined, 
                    /* type */ ts.createFunctionTypeNode(
                    /* typeParameters */ undefined, 
                    /* parameters */ [ts.createParameter(
                        /* decorators */ undefined, 
                        /* modifiers */ undefined, 
                        /* dotDotDotToken */ undefined, 
                        /* name */ 'event', 
                        /* questionToken */ undefined, 
                        /* type */ genericTypeRef)], 
                    /* type */ ts.createKeywordTypeNode(ts.SyntaxKind.AnyKeyword)))], 
                /* type */ ts.createKeywordTypeNode(ts.SyntaxKind.VoidKeyword), 
                /* name */ 'subscribe', 
                /* questionToken */ undefined)]);
            // Declares the first signature of `_outputHelper` that matches arguments of type
            // `EventEmitter`, to convert them into `observableLike` defined above. The following
            // statement is generated:
            // `declare function _outputHelper<T>(output: EventEmitter<T>): observableLike;`
            this.helperStatements.push(ts.createFunctionDeclaration(
            /* decorators */ undefined, 
            /* modifiers */ [ts.createModifier(ts.SyntaxKind.DeclareKeyword)], 
            /* asteriskToken */ undefined, 
            /* name */ outputHelperIdent, 
            /* typeParameters */ [genericTypeDecl], 
            /* parameters */ [ts.createParameter(
                /* decorators */ undefined, 
                /* modifiers */ undefined, 
                /* dotDotDotToken */ undefined, 
                /* name */ 'output', 
                /* questionToken */ undefined, 
                /* type */ eventEmitter)], 
            /* type */ observableLike, 
            /* body */ undefined));
            // Declares the second signature of `_outputHelper` that matches all other argument types,
            // i.e. ensures type identity for output types other than `EventEmitter`. This corresponds
            // with the following statement:
            // `declare function _outputHelper<T>(output: T): T;`
            this.helperStatements.push(ts.createFunctionDeclaration(
            /* decorators */ undefined, 
            /* modifiers */ [ts.createModifier(ts.SyntaxKind.DeclareKeyword)], 
            /* asteriskToken */ undefined, 
            /* name */ outputHelperIdent, 
            /* typeParameters */ [genericTypeDecl], 
            /* parameters */ [ts.createParameter(
                /* decorators */ undefined, 
                /* modifiers */ undefined, 
                /* dotDotDotToken */ undefined, 
                /* name */ 'output', 
                /* questionToken */ undefined, 
                /* type */ genericTypeRef)], 
            /* type */ genericTypeRef, 
            /* body */ undefined));
            return this.outputHelperIdent = outputHelperIdent;
        };
        /**
         * Generate a `ts.Expression` that references the given node.
         *
         * This may involve importing the node into the file if it's not declared there already.
         */
        Environment.prototype.reference = function (ref) {
            // Disable aliasing for imports generated in a template type-checking context, as there is no
            // guarantee that any alias re-exports exist in the .d.ts files. It's safe to use direct imports
            // in these cases as there is no strict dependency checking during the template type-checking
            // pass.
            var ngExpr = this.refEmitter.emit(ref, this.contextFile, imports_1.ImportFlags.NoAliasing);
            // Use `translateExpression` to convert the `Expression` into a `ts.Expression`.
            return translator_1.translateExpression(ngExpr, this.importManager, imports_1.NOOP_DEFAULT_IMPORT_RECORDER, ts.ScriptTarget.ES2015);
        };
        /**
         * Generate a `ts.TypeNode` that references the given node as a type.
         *
         * This may involve importing the node into the file if it's not declared there already.
         */
        Environment.prototype.referenceType = function (ref) {
            var ngExpr = this.refEmitter.emit(ref, this.contextFile, imports_1.ImportFlags.NoAliasing | imports_1.ImportFlags.AllowTypeImports);
            // Create an `ExpressionType` from the `Expression` and translate it via `translateType`.
            // TODO(alxhub): support references to types with generic arguments in a clean way.
            return translator_1.translateType(new compiler_1.ExpressionType(ngExpr), this.importManager);
        };
        Environment.prototype.emitTypeParameters = function (declaration) {
            var _this = this;
            var emitter = new type_parameter_emitter_1.TypeParameterEmitter(declaration.typeParameters, this.reflector);
            return emitter.emit(function (ref) { return _this.referenceType(ref); });
        };
        /**
         * Generate a `ts.TypeNode` that references a given type from the provided module.
         *
         * This will involve importing the type into the file, and will also add type parameters if
         * provided.
         */
        Environment.prototype.referenceExternalType = function (moduleName, name, typeParams) {
            var external = new compiler_1.ExternalExpr({ moduleName: moduleName, name: name });
            return translator_1.translateType(new compiler_1.ExpressionType(external, null, typeParams), this.importManager);
        };
        Environment.prototype.getPreludeStatements = function () {
            return tslib_1.__spread(this.helperStatements, this.pipeInstStatements, this.typeCtorStatements);
        };
        return Environment;
    }());
    exports.Environment = Environment;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZW52aXJvbm1lbnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21waWxlci1jbGkvc3JjL25ndHNjL3R5cGVjaGVjay9zcmMvZW52aXJvbm1lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOzs7Ozs7Ozs7Ozs7O0lBRUgsOENBQXNGO0lBQ3RGLCtCQUFpQztJQUVqQyxtRUFBcUc7SUFFckcseUVBQW1GO0lBR25GLGlGQUE0QztJQUM1QyxtR0FBeUY7SUFDekYsK0dBQThEO0lBRTlEOzs7Ozs7Ozs7O09BVUc7SUFDSDtRQWVFLHFCQUNhLE1BQTBCLEVBQVksYUFBNEIsRUFDbkUsVUFBNEIsRUFBVSxTQUF5QixFQUM3RCxXQUEwQjtZQUYzQixXQUFNLEdBQU4sTUFBTSxDQUFvQjtZQUFZLGtCQUFhLEdBQWIsYUFBYSxDQUFlO1lBQ25FLGVBQVUsR0FBVixVQUFVLENBQWtCO1lBQVUsY0FBUyxHQUFULFNBQVMsQ0FBZ0I7WUFDN0QsZ0JBQVcsR0FBWCxXQUFXLENBQWU7WUFqQmhDLFlBQU8sR0FBRztnQkFDaEIsUUFBUSxFQUFFLENBQUM7Z0JBQ1gsUUFBUSxFQUFFLENBQUM7YUFDWixDQUFDO1lBRU0sY0FBUyxHQUFHLElBQUksR0FBRyxFQUFtQyxDQUFDO1lBQ3JELHVCQUFrQixHQUFtQixFQUFFLENBQUM7WUFFMUMsY0FBUyxHQUFHLElBQUksR0FBRyxFQUFtQyxDQUFDO1lBQ3JELHVCQUFrQixHQUFtQixFQUFFLENBQUM7WUFFMUMsc0JBQWlCLEdBQXVCLElBQUksQ0FBQztZQUMzQyxxQkFBZ0IsR0FBbUIsRUFBRSxDQUFDO1FBS0wsQ0FBQztRQUU1Qzs7Ozs7V0FLRztRQUNILGlDQUFXLEdBQVgsVUFBWSxHQUErQjtZQUN6QyxJQUFNLE1BQU0sR0FBRyxHQUFHLENBQUMsR0FBdUQsQ0FBQztZQUMzRSxJQUFNLElBQUksR0FBRyxNQUFNLENBQUMs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dXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtFeHByZXNzaW9uVHlwZSwgRXh0ZXJuYWxFeHByLCBUeXBlLCBXcmFwcGVkTm9kZUV4cHJ9IGZyb20gJ0Bhbmd1bGFyL2NvbXBpbGVyJztcbmltcG9ydCAqIGFzIHRzIGZyb20gJ3R5cGVzY3JpcHQnO1xuXG5pbXBvcnQge0ltcG9ydEZsYWdzLCBOT09QX0RFRkFVTFRfSU1QT1JUX1JFQ09SREVSLCBSZWZlcmVuY2UsIFJlZmVyZW5jZUVtaXR0ZXJ9IGZyb20gJy4uLy4uL2ltcG9ydHMnO1xuaW1wb3J0IHtDbGFzc0RlY2xhcmF0aW9uLCBSZWZsZWN0aW9uSG9zdH0gZnJvbSAnLi4vLi4vcmVmbGVjdGlvbic7XG5pbXBvcnQge0ltcG9ydE1hbmFnZXIsIHRyYW5zbGF0ZUV4cHJlc3Npb24sIHRyYW5zbGF0ZVR5cGV9IGZyb20gJy4uLy4uL3RyYW5zbGF0b3InO1xuXG5pbXBvcnQge1R5cGVDaGVja2FibGVEaXJlY3RpdmVNZXRhLCBUeXBlQ2hlY2tpbmdDb25maWcsIFR5cGVDdG9yTWV0YWRhdGF9IGZyb20gJy4vYXBpJztcbmltcG9ydCB7dHNEZWNsYXJlVmFyaWFibGV9IGZyb20gJy4vdHNfdXRpbCc7XG5pbXBvcnQge2dlbmVyYXRlVHlwZUN0b3JEZWNsYXJhdGlvbkZuLCByZXF1aXJlc0lubGluZVR5cGVDdG9yfSBmcm9tICcuL3R5cGVfY29uc3RydWN0b3InO1xuaW1wb3J0IHtUeXBlUGFyYW1ldGVyRW1pdHRlcn0gZnJvbSAnLi90eXBlX3BhcmFtZXRlcl9lbWl0dGVyJztcblxuLyoqXG4gKiBBIGNvbnRleHQgd2hpY2ggaG9zdHMgb25lIG9yIG1vcmUgVHlwZSBDaGVjayBCbG9ja3MgKFRDQnMpLlxuICpcbiAqIEFuIGBFbnZpcm9ubWVudGAgc3VwcG9ydHMgdGhlIGdlbmVyYXRpb24gb2YgVENCcyBieSB0cmFja2luZyBuZWNlc3NhcnkgaW1wb3J0cywgZGVjbGFyYXRpb25zIG9mXG4gKiB0eXBlIGNvbnN0cnVjdG9ycywgYW5kIG90aGVyIHN0YXRlbWVudHMgYmV5b25kIHRoZSB0eXBlLWNoZWNraW5nIGNvZGUgd2l0aGluIHRoZSBUQ0IgaXRzZWxmLlxuICogVGhyb3VnaCBtZXRob2QgY2FsbHMgb24gYEVudmlyb25tZW50YCwgdGhlIFRDQiBnZW5lcmF0b3IgY2FuIHJlcXVlc3QgYHRzLkV4cHJlc3Npb25gcyB3aGljaFxuICogcmVmZXJlbmNlIGRlY2xhcmF0aW9ucyBpbiB0aGUgYEVudmlyb25tZW50YCBmb3IgdGhlc2UgYXJ0aWZhY3RzYC5cbiAqXG4gKiBgRW52aXJvbm1lbnRgIGNhbiBiZSB1c2VkIGluIGEgc3RhbmRhbG9uZSBmYXNoaW9uLCBvciBjYW4gYmUgZXh0ZW5kZWQgdG8gc3VwcG9ydCBtb3JlIHNwZWNpYWxpemVkXG4gKiB1c2FnZS5cbiAqL1xuZXhwb3J0IGNsYXNzIEVudmlyb25tZW50IHtcbiAgcHJpdmF0ZSBuZXh0SWRzID0ge1xuICAgIHBpcGVJbnN0OiAxLFxuICAgIHR5cGVDdG9yOiAxLFxuICB9O1xuXG4gIHByaXZhdGUgdHlwZUN0b3JzID0gbmV3IE1hcDxDbGFzc0RlY2xhcmF0aW9uLCB0cy5FeHByZXNzaW9uPigpO1xuICBwcm90ZWN0ZWQgdHlwZUN0b3JTdGF0ZW1lbnRzOiB0cy5TdGF0ZW1lbnRbXSA9IFtdO1xuXG4gIHByaXZhdGUgcGlwZUluc3RzID0gbmV3IE1hcDxDbGFzc0RlY2xhcmF0aW9uLCB0cy5FeHByZXNzaW9uPigpO1xuICBwcm90ZWN0ZWQgcGlwZUluc3RTdGF0ZW1lbnRzOiB0cy5TdGF0ZW1lbnRbXSA9IFtdO1xuXG4gIHByaXZhdGUgb3V0cHV0SGVscGVySWRlbnQ6IHRzLklkZW50aWZpZXJ8bnVsbCA9IG51bGw7XG4gIHByb3RlY3RlZCBoZWxwZXJTdGF0ZW1lbnRzOiB0cy5TdGF0ZW1lbnRbXSA9IFtdO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgICAgcmVhZG9ubHkgY29uZmlnOiBUeXBlQ2hlY2tpbmdDb25maWcsIHByb3RlY3RlZCBpbXBvcnRNYW5hZ2VyOiBJbXBvcnRNYW5hZ2VyLFxuICAgICAgcHJpdmF0ZSByZWZFbWl0dGVyOiBSZWZlcmVuY2VFbWl0dGVyLCBwcml2YXRlIHJlZmxlY3RvcjogUmVmbGVjdGlvbkhvc3QsXG4gICAgICBwcm90ZWN0ZWQgY29udGV4dEZpbGU6IHRzLlNvdXJjZUZpbGUpIHt9XG5cbiAgLyoqXG4gICAqIEdldCBhbiBleHByZXNzaW9uIHJlZmVycmluZyB0byBhIHR5cGUgY29uc3RydWN0b3IgZm9yIHRoZSBnaXZlbiBkaXJlY3RpdmUuXG4gICAqXG4gICAqIERlcGVuZGluZyBvbiB0aGUgc2hhcGUgb2YgdGhlIGRpcmVjdGl2ZSBpdHNlbGYsIHRoaXMgY291bGQgYmUgZWl0aGVyIGEgcmVmZXJlbmNlIHRvIGEgZGVjbGFyZWRcbiAgICogdHlwZSBjb25zdHJ1Y3Rvciwgb3IgdG8gYW4gaW5saW5lIHR5cGUgY29uc3RydWN0b3IuXG4gICAqL1xuICB0eXBlQ3RvckZvcihkaXI6IFR5cGVDaGVja2FibGVEaXJlY3RpdmVNZXRhKTogdHMuRXhwcmVzc2lvbiB7XG4gICAgY29uc3QgZGlyUmVmID0gZGlyLnJlZiBhcyBSZWZlcmVuY2U8Q2xhc3NEZWNsYXJhdGlvbjx0cy5DbGFzc0RlY2xhcmF0aW9uPj47XG4gICAgY29uc3Qgbm9kZSA9IGRpclJlZi5ub2RlO1xuICAgIGlmICh0aGlzLnR5cGVDdG9ycy5oYXMobm9kZSkpIHtcbiAgICAgIHJldHVybiB0aGlzLnR5cGVDdG9ycy5nZXQobm9kZSkgITtcbiAgICB9XG5cbiAgICBpZiAocmVxdWlyZXNJbmxpbmVUeXBlQ3Rvcihub2RlLCB0aGlzLnJlZmxlY3RvcikpIHtcbiAgICAgIC8vIFRoZSBjb25zdHJ1Y3RvciBoYXMgYWxyZWFkeSBiZWVuIGNyZWF0ZWQgaW5saW5lLCB3ZSBqdXN0IG5lZWQgdG8gY29uc3RydWN0IGEgcmVmZXJlbmNlIHRvXG4gICAgICAvLyBpdC5cbiAgICAgIGNvbnN0IHJlZiA9IHRoaXMucmVmZXJlbmNlKGRpclJlZik7XG4gICAgICBjb25zdCB0eXBlQ3RvckV4cHIgPSB0cy5jcmVhdGVQcm9wZXJ0eUFjY2VzcyhyZWYsICduZ1R5cGVDdG9yJyk7XG4gICAgICB0aGlzLnR5cGVDdG9ycy5zZXQobm9kZSwgdHlwZUN0b3JFeHByKTtcbiAgICAgIHJldHVybiB0eXBlQ3RvckV4cHI7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnN0IGZuTmFtZSA9IGBfY3RvciR7dGhpcy5uZXh0SWRzLnR5cGVDdG9yKyt9YDtcbiAgICAgIGNvbnN0IG5vZGVUeXBlUmVmID0gdGhpcy5yZWZlcmVuY2VUeXBlKGRpclJlZik7XG4gICAgICBpZiAoIXRzLmlzVHlwZVJlZmVyZW5jZU5vZGUobm9kZVR5cGVSZWYpKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgRXhwZWN0ZWQgVHlwZVJlZmVyZW5jZU5vZGUgZnJvbSByZWZlcmVuY2UgdG8gJHtkaXJSZWYuZGVidWdOYW1lfWApO1xuICAgICAgfVxuICAgICAgY29uc3QgbWV0YTogVHlwZUN0b3JNZXRhZGF0YSA9IHtcbiAgICAgICAgZm5OYW1lLFxuICAgICAgICBib2R5OiB0cnVlLFxuICAgICAgICBmaWVsZHM6IHtcbiAgICAgICAgICBpbnB1dHM6IE9iamVjdC5rZXlzKGRpci5pbnB1dHMpLFxuICAgICAgICAgIG91dHB1dHM6IE9iamVjdC5rZXlzKGRpci5vdXRwdXRzKSxcbiAgICAgICAgICAvLyBUT0RPOiBzdXBwb3J0IHF1ZXJpZXNcbiAgICAgICAgICBxdWVyaWVzOiBkaXIucXVlcmllcyxcbiAgICAgICAgfSxcbiAgICAgICAgY29lcmNlZElucHV0RmllbGRzOiBkaXIuY29lcmNlZElucHV0RmllbGRzLFxuICAgICAgfTtcbiAgICAgIGNvbnN0IHR5cGVQYXJhbXMgPSB0aGlzLmVtaXRUeXBlUGFyYW1ldGVycyhub2RlKTtcbiAgICAgIGNvbnN0IHR5cGVDdG9yID0gZ2VuZXJhdGVUeXBlQ3RvckRlY2xhcmF0aW9uRm4oXG4gICAgICAgICAgbm9kZSwgbWV0YSwgbm9kZVR5cGVSZWYudHlwZU5hbWUsIHR5cGVQYXJhbXMsIHRoaXMucmVmbGVjdG9yKTtcbiAgICAgIHRoaXMudHlwZUN0b3JTdGF0ZW1lbnRzLnB1c2godHlwZUN0b3IpO1xuICAgICAgY29uc3QgZm5JZCA9IHRzLmNyZWF0ZUlkZW50aWZpZXIoZm5OYW1lKTtcbiAgICAgIHRoaXMudHlwZUN0b3JzLnNldChub2RlLCBmbklkKTtcbiAgICAgIHJldHVybiBmbklkO1xuICAgIH1cbiAgfVxuXG4gIC8qXG4gICAqIEdldCBhbiBleHByZXNzaW9uIHJlZmVycmluZyB0byBhbiBpbnN0YW5jZSBvZiB0aGUgZ2l2ZW4gcGlwZS5cbiAgICovXG4gIHBpcGVJbnN0KHJlZjogUmVmZXJlbmNlPENsYXNzRGVjbGFyYXRpb248dHMuQ2xhc3NEZWNsYXJhdGlvbj4+KTogdHMuRXhwcmVzc2lvbiB7XG4gICAgaWYgKHRoaXMucGlwZUluc3RzLmhhcyhyZWYubm9kZSkpIHtcbiAgICAgIHJldHVybiB0aGlzLnBpcGVJbnN0cy5nZXQocmVmLm5vZGUpICE7XG4gICAgfVxuXG4gICAgY29uc3QgcGlwZVR5cGUgPSB0aGlzLnJlZmVyZW5jZVR5cGUocmVmKTtcbiAgICBjb25zdCBwaXBlSW5zdElkID0gdHMuY3JlYXRlSWRlbnRpZmllcihgX3BpcGUke3RoaXMubmV4dElkcy5waXBlSW5zdCsrfWApO1xuXG4gICAgdGhpcy5waXBlSW5zdFN0YXRlbWVudHMucHVzaCh0c0RlY2xhcmVWYXJpYWJsZShwaXBlSW5zdElkLCBwaXBlVHlwZSkpO1xuICAgIHRoaXMucGlwZUluc3RzLnNldChyZWYubm9kZSwgcGlwZUluc3RJZCk7XG5cbiAgICByZXR1cm4gcGlwZUluc3RJZDtcbiAgfVxuXG4gIC8qKlxuICAgKiBEZWNsYXJlcyBhIGhlbHBlciBmdW5jdGlvbiB0byBiZSBhYmxlIHRvIGNhc3QgZGlyZWN0aXZlIG91dHB1dHMgb2YgdHlwZSBgRXZlbnRFbWl0dGVyPFQ+YCB0b1xuICAgKiBoYXZlIGFuIGFjY3VyYXRlIGBzdWJzY3JpYmUoKWAgbWV0aG9kIHRoYXQgcHJvcGVybHkgY2FycmllcyBvdmVyIHRoZSBnZW5lcmljIHR5cGUgYFRgIGludG8gdGhlXG4gICAqIGxpc3RlbmVyIGZ1bmN0aW9uIHBhc3NlZCBhcyBhcmd1bWVudCB0byBgc3Vic2NyaWJlYC4gVGhpcyBpcyBkb25lIHRvIHdvcmsgYXJvdW5kIGEgdHlwaW5nXG4gICAqIGRlZmljaWVuY3kgaW4gYEV2ZW50RW1pdHRlci5zdWJzY3JpYmVgLCB3aGVyZSB0aGUgbGlzdGVuZXIgZnVuY3Rpb24gaXMgdHlwZWQgYXMgYW55LlxuICAgKi9cbiAgZGVjbGFyZU91dHB1dEhlbHBlcigpOiB0cy5FeHByZXNzaW9uIHtcbiAgICBpZiAodGhpcy5vdXRwdXRIZWxwZXJJZGVudCAhPT0gbnVsbCkge1xuICAgICAgcmV0dXJuIHRoaXMub3V0cHV0SGVscGVySWRlbnQ7XG4gICAgfVxuXG4gICAgY29uc3Qgb3V0cHV0SGVscGVySWRlbnQgPSB0cy5jcmVhdGVJZGVudGlmaWVyKCdfb3V0cHV0SGVscGVyJyk7XG4gICAgY29uc3QgZ2VuZXJpY1R5cGVEZWNsID0gdHMuY3JlYXRlVHlwZVBhcmFtZXRlckRlY2xhcmF0aW9uKCdUJyk7XG4gICAgY29uc3QgZ2VuZXJpY1R5cGVSZWYgPSB0cy5jcmVhdGVUeXBlUmVmZXJlbmNlTm9kZSgnVCcsIC8qIHR5cGVQYXJhbWV0ZXJzICovIHVuZGVmaW5lZCk7XG5cbiAgICBjb25zdCBldmVudEVtaXR0ZXIgPSB0aGlzLnJlZmVyZW5jZUV4dGVybmFsVHlwZShcbiAgICAgICAgJ0Bhbmd1bGFyL2NvcmUnLCAnRXZlbnRFbWl0dGVyJywgW25ldyBFeHByZXNzaW9uVHlwZShuZXcgV3JhcHBlZE5vZGVFeHByKGdlbmVyaWNUeXBlUmVmKSldKTtcblxuICAgIC8vIERlY2xhcmUgYSB0eXBlIHRoYXQgaGFzIGEgYHN1YnNjcmliZWAgbWV0aG9kIHRoYXQgY2FycmllcyBvdmVyIHR5cGUgYFRgIGFzIHBhcmFtZXRlclxuICAgIC8vIGludG8gdGhlIGNhbGxiYWNrLiBUaGUgYmVsb3cgY29kZSBnZW5lcmF0ZXMgdGhlIGZvbGxvd2luZyB0eXBlIGxpdGVyYWw6XG4gICAgLy8gYHtzdWJzY3JpYmUoY2I6IChldmVudDogVCkgPT4gYW55KTogdm9pZDt9YFxuICAgIGNvbnN0IG9ic2VydmFibGVMaWtlID0gdHMuY3JlYXRlVHlwZUxpdGVyYWxOb2RlKFt0cy5jcmVhdGVNZXRob2RTaWduYXR1cmUoXG4gICAgICAgIC8qIHR5cGVQYXJhbWV0ZXJzICovIHVuZGVmaW5lZCxcbiAgICAgICAgLyogcGFyYW1ldGVycyAqL1t0cy5jcmVhdGVQYXJhbWV0ZXIoXG4gICAgICAgICAgICAvKiBkZWNvcmF0b3JzICovIHVuZGVmaW5lZCxcbiAgICAgICAgICAgIC8qIG1vZGlmaWVycyAqLyB1bmRlZmluZWQsXG4gICAgICAgICAgICAvKiBkb3REb3REb3RUb2tlbiAqLyB1bmRlZmluZWQsXG4gICAgICAgICAgICAvKiBuYW1lICovICdjYicsXG4gICAgICAgICAgICAvKiBxdWVzdGlvblRva2VuICovIHVuZGVmaW5lZCxcbiAgICAgICAgICAgIC8qIHR5cGUgKi8gdHMuY3JlYXRlRnVuY3Rpb25UeXBlTm9kZShcbiAgICAgICAgICAgICAgICAvKiB0eXBlUGFyYW1ldGVycyAqLyB1bmRlZmluZWQsXG4gICAgICAgICAgICAgICAgLyogcGFyYW1ldGVycyAqL1t0cy5jcmVhdGVQYXJhbWV0ZXIoXG4gICAgICAgICAgICAgICAgICAgIC8qIGRlY29yYXRvcnMgKi8gdW5kZWZpbmVkLFxuICAgICAgICAgICAgICAgICAgICAvKiBtb2RpZmllcnMgKi8gdW5kZWZpbmVkLFxuICAgICAgICAgICAgICAgICAgICAvKiBkb3REb3REb3RUb2tlbiAqLyB1bmRlZmluZWQsXG4gICAgICAgICAgICAgICAgICAgIC8qIG5hbWUgKi8gJ2V2ZW50JyxcbiAgICAgICAgICAgICAgICAgICAgLyogcXVlc3Rpb25Ub2tlbiAqLyB1bmRlZmluZWQsXG4gICAgICAgICAgICAgICAgICAgIC8qIHR5cGUgKi8gZ2VuZXJpY1R5cGVSZWYpXSxcbiAgICAgICAgICAgICAgICAvKiB0eXBlICovIHRzLmNyZWF0ZUtleXdvcmRUeXBlTm9kZSh0cy5TeW50YXhLaW5kLkFueUtleXdvcmQpKSldLFxuICAgICAgICAvKiB0eXBlICovIHRzLmNyZWF0ZUtleXdvcmRUeXBlTm9kZSh0cy5TeW50YXhLaW5kLlZvaWRLZXl3b3JkKSxcbiAgICAgICAgLyogbmFtZSAqLyAnc3Vic2NyaWJlJyxcbiAgICAgICAgLyogcXVlc3Rpb25Ub2tlbiAqLyB1bmRlZmluZWQpXSk7XG5cbiAgICAvLyBEZWNsYXJlcyB0aGUgZmlyc3Qgc2lnbmF0dXJlIG9mIGBfb3V0cHV0SGVscGVyYCB0aGF0IG1hdGNoZXMgYXJndW1lbnRzIG9mIHR5cGVcbiAgICAvLyBgRXZlbnRFbWl0dGVyYCwgdG8gY29udmVydCB0aGVtIGludG8gYG9ic2VydmFibGVMaWtlYCBkZWZpbmVkIGFib3ZlLiBUaGUgZm9sbG93aW5nXG4gICAgLy8gc3RhdGVtZW50IGlzIGdlbmVyYXRlZDpcbiAgICAvLyBgZGVjbGFyZSBmdW5jdGlvbiBfb3V0cHV0SGVscGVyPFQ+KG91dHB1dDogRXZlbnRFbWl0dGVyPFQ+KTogb2JzZXJ2YWJsZUxpa2U7YFxuICAgIHRoaXMuaGVscGVyU3RhdGVtZW50cy5wdXNoKHRzLmNyZWF0ZUZ1bmN0aW9uRGVjbGFyYXRpb24oXG4gICAgICAgIC8qIGRlY29yYXRvcnMgKi8gdW5kZWZpbmVkLFxuICAgICAgICAvKiBtb2RpZmllcnMgKi9bdHMuY3JlYXRlTW9kaWZpZXIodHMuU3ludGF4S2luZC5EZWNsYXJlS2V5d29yZCldLFxuICAgICAgICAvKiBhc3Rlcmlza1Rva2VuICovIHVuZGVmaW5lZCxcbiAgICAgICAgLyogbmFtZSAqLyBvdXRwdXRIZWxwZXJJZGVudCxcbiAgICAgICAgLyogdHlwZVBhcmFtZXRlcnMgKi9bZ2VuZXJpY1R5cGVEZWNsXSxcbiAgICAgICAgLyogcGFyYW1ldGVycyAqL1t0cy5jcmVhdGVQYXJhbWV0ZXIoXG4gICAgICAgICAgICAvKiBkZWNvcmF0b3JzICovIHVuZGVmaW5lZCxcbiAgICAgICAgICAgIC8qIG1vZGlmaWVycyAqLyB1bmRlZmluZWQsXG4gICAgICAgICAgICAvKiBkb3REb3REb3RUb2tlbiAqLyB1bmRlZmluZWQsXG4gICAgICAgICAgICAvKiBuYW1lICovICdvdXRwdXQnLFxuICAgICAgICAgICAgLyogcXVlc3Rpb25Ub2tlbiAqLyB1bmRlZmluZWQsXG4gICAgICAgICAgICAvKiB0eXBlICovIGV2ZW50RW1pdHRlcildLFxuICAgICAgICAvKiB0eXBlICovIG9ic2VydmFibGVMaWtlLFxuICAgICAgICAvKiBib2R5ICovIHVuZGVmaW5lZCkpO1xuXG4gICAgLy8gRGVjbGFyZXMgdGhlIHNlY29uZCBzaWduYXR1cmUgb2YgYF9vdXRwdXRIZWxwZXJgIHRoYXQgbWF0Y2hlcyBhbGwgb3RoZXIgYXJndW1lbnQgdHlwZXMsXG4gICAgLy8gaS5lLiBlbnN1cmVzIHR5cGUgaWRlbnRpdHkgZm9yIG91dHB1dCB0eXBlcyBvdGhlciB0aGFuIGBFdmVudEVtaXR0ZXJgLiBUaGlzIGNvcnJlc3BvbmRzXG4gICAgLy8gd2l0aCB0aGUgZm9sbG93aW5nIHN0YXRlbWVudDpcbiAgICAvLyBgZGVjbGFyZSBmdW5jdGlvbiBfb3V0cHV0SGVscGVyPFQ+KG91dHB1dDogVCk6IFQ7YFxuICAgIHRoaXMuaGVscGVyU3RhdGVtZW50cy5wdXNoKHRzLmNyZWF0ZUZ1bmN0aW9uRGVjbGFyYXRpb24oXG4gICAgICAgIC8qIGRlY29yYXRvcnMgKi8gdW5kZWZpbmVkLFxuICAgICAgICAvKiBtb2RpZmllcnMgKi9bdHMuY3JlYXRlTW9kaWZpZXIodHMuU3ludGF4S2luZC5EZWNsYXJlS2V5d29yZCldLFxuICAgICAgICAvKiBhc3Rlcmlza1Rva2VuICovIHVuZGVmaW5lZCxcbiAgICAgICAgLyogbmFtZSAqLyBvdXRwdXRIZWxwZXJJZGVudCxcbiAgICAgICAgLyogdHlwZVBhcmFtZXRlcnMgKi9bZ2VuZXJpY1R5cGVEZWNsXSxcbiAgICAgICAgLyogcGFyYW1ldGVycyAqL1t0cy5jcmVhdGVQYXJhbWV0ZXIoXG4gICAgICAgICAgICAvKiBkZWNvcmF0b3JzICovIHVuZGVmaW5lZCxcbiAgICAgICAgICAgIC8qIG1vZGlmaWVycyAqLyB1bmRlZmluZWQsXG4gICAgICAgICAgICAvKiBkb3REb3REb3RUb2tlbiAqLyB1bmRlZmluZWQsXG4gICAgICAgICAgICAvKiBuYW1lICovICdvdXRwdXQnLFxuICAgICAgICAgICAgLyogcXVlc3Rpb25Ub2tlbiAqLyB1bmRlZmluZWQsXG4gICAgICAgICAgICAvKiB0eXBlICovIGdlbmVyaWNUeXBlUmVmKV0sXG4gICAgICAgIC8qIHR5cGUgKi8gZ2VuZXJpY1R5cGVSZWYsXG4gICAgICAgIC8qIGJvZHkgKi8gdW5kZWZpbmVkKSk7XG5cbiAgICByZXR1cm4gdGhpcy5vdXRwdXRIZWxwZXJJZGVudCA9IG91dHB1dEhlbHBlcklkZW50O1xuICB9XG5cbiAgLyoqXG4gICAqIEdlbmVyYXRlIGEgYHRzLkV4cHJlc3Npb25gIHRoYXQgcmVmZXJlbmNlcyB0aGUgZ2l2ZW4gbm9kZS5cbiAgICpcbiAgICogVGhpcyBtYXkgaW52b2x2ZSBpbXBvcnRpbmcgdGhlIG5vZGUgaW50byB0aGUgZmlsZSBpZiBpdCdzIG5vdCBkZWNsYXJlZCB0aGVyZSBhbHJlYWR5LlxuICAgKi9cbiAgcmVmZXJlbmNlKHJlZjogUmVmZXJlbmNlPENsYXNzRGVjbGFyYXRpb248dHMuQ2xhc3NEZWNsYXJhdGlvbj4+KTogdHMuRXhwcmVzc2lvbiB7XG4gICAgLy8gRGlzYWJsZSBhbGlhc2luZyBmb3IgaW1wb3J0cyBnZW5lcmF0ZWQgaW4gYSB0ZW1wbGF0ZSB0eXBlLWNoZWNraW5nIGNvbnRleHQsIGFzIHRoZXJlIGlzIG5vXG4gICAgLy8gZ3VhcmFudGVlIHRoYXQgYW55IGFsaWFzIHJlLWV4cG9ydHMgZXhpc3QgaW4gdGhlIC5kLnRzIGZpbGVzLiBJdCdzIHNhZmUgdG8gdXNlIGRpcmVjdCBpbXBvcnRzXG4gICAgLy8gaW4gdGhlc2UgY2FzZXMgYXMgdGhlcmUgaXMgbm8gc3RyaWN0IGRlcGVuZGVuY3kgY2hlY2tpbmcgZHVyaW5nIHRoZSB0ZW1wbGF0ZSB0eXBlLWNoZWNraW5nXG4gICAgLy8gcGFzcy5cbiAgICBjb25zdCBuZ0V4cHIgPSB0aGlzLnJlZkVtaXR0ZXIuZW1pdChyZWYsIHRoaXMuY29udGV4dEZpbGUsIEltcG9ydEZsYWdzLk5vQWxpYXNpbmcpO1xuXG4gICAgLy8gVXNlIGB0cmFuc2xhdGVFeHByZXNzaW9uYCB0byBjb252ZXJ0IHRoZSBgRXhwcmVzc2lvbmAgaW50byBhIGB0cy5FeHByZXNzaW9uYC5cbiAgICByZXR1cm4gdHJhbnNsYXRlRXhwcmVzc2lvbihcbiAgICAgICAgbmdFeHByLCB0aGlzLmltcG9ydE1hbmFnZXIsIE5PT1BfREVGQVVMVF9JTVBPUlRfUkVDT1JERVIsIHRzLlNjcmlwdFRhcmdldC5FUzIwMTUpO1xuICB9XG5cbiAgLyoqXG4gICAqIEdlbmVyYXRlIGEgYHRzLlR5cGVOb2RlYCB0aGF0IHJlZmVyZW5jZXMgdGhlIGdpdmVuIG5vZGUgYXMgYSB0eXBlLlxuICAgKlxuICAgKiBUaGlzIG1heSBpbnZvbHZlIGltcG9ydGluZyB0aGUgbm9kZSBpbnRvIHRoZSBmaWxlIGlmIGl0J3Mgbm90IGRlY2xhcmVkIHRoZXJlIGFscmVhZHkuXG4gICAqL1xuICByZWZlcmVuY2VUeXBlKHJlZjogUmVmZXJlbmNlKTogdHMuVHlwZU5vZGUge1xuICAgIGNvbnN0IG5nRXhwciA9IHRoaXMucmVmRW1pdHRlci5lbWl0KFxuICAgICAgICByZWYsIHRoaXMuY29udGV4dEZpbGUsIEltcG9ydEZsYWdzLk5vQWxpYXNpbmcgfCBJbXBvcnRGbGFncy5BbGxvd1R5cGVJbXBvcnRzKTtcblxuICAgIC8vIENyZWF0ZSBhbiBgRXhwcmVzc2lvblR5cGVgIGZyb20gdGhlIGBFeHByZXNzaW9uYCBhbmQgdHJhbnNsYXRlIGl0IHZpYSBgdHJhbnNsYXRlVHlwZWAuXG4gICAgLy8gVE9ETyhhbHhodWIpOiBzdXBwb3J0IHJlZmVyZW5jZXMgdG8gdHlwZXMgd2l0aCBnZW5lcmljIGFyZ3VtZW50cyBpbiBhIGNsZWFuIHdheS5cbiAgICByZXR1cm4gdHJhbnNsYXRlVHlwZShuZXcgRXhwcmVzc2lvblR5cGUobmdFeHByKSwgdGhpcy5pbXBvcnRNYW5hZ2VyKTtcbiAgfVxuXG4gIHByaXZhdGUgZW1pdFR5cGVQYXJhbWV0ZXJzKGRlY2xhcmF0aW9uOiBDbGFzc0RlY2xhcmF0aW9uPHRzLkNsYXNzRGVjbGFyYXRpb24+KTpcbiAgICAgIHRzLlR5cGVQYXJhbWV0ZXJEZWNsYXJhdGlvbltdfHVuZGVmaW5lZCB7XG4gICAgY29uc3QgZW1pdHRlciA9IG5ldyBUeXBlUGFyYW1ldGVyRW1pdHRlcihkZWNsYXJhdGlvbi50eXBlUGFyYW1ldGVycywgdGhpcy5yZWZsZWN0b3IpO1xuICAgIHJldHVybiBlbWl0dGVyLmVtaXQocmVmID0+IHRoaXMucmVmZXJlbmNlVHlwZShyZWYpKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZW5lcmF0ZSBhIGB0cy5UeXBlTm9kZWAgdGhhdCByZWZlcmVuY2VzIGEgZ2l2ZW4gdHlwZSBmcm9tIHRoZSBwcm92aWRlZCBtb2R1bGUuXG4gICAqXG4gICAqIFRoaXMgd2lsbCBpbnZvbHZlIGltcG9ydGluZyB0aGUgdHlwZSBpbnRvIHRoZSBmaWxlLCBhbmQgd2lsbCBhbHNvIGFkZCB0eXBlIHBhcmFtZXRlcnMgaWZcbiAgICogcHJvdmlkZWQuXG4gICAqL1xuICByZWZlcmVuY2VFeHRlcm5hbFR5cGUobW9kdWxlTmFtZTogc3RyaW5nLCBuYW1lOiBzdHJpbmcsIHR5cGVQYXJhbXM/OiBUeXBlW10pOiB0cy5UeXBlTm9kZSB7XG4gICAgY29uc3QgZXh0ZXJuYWwgPSBuZXcgRXh0ZXJuYWxFeHByKHttb2R1bGVOYW1lLCBuYW1lfSk7XG4gICAgcmV0dXJuIHRyYW5zbGF0ZVR5cGUobmV3IEV4cHJlc3Npb25UeXBlKGV4dGVybmFsLCBudWxsLCB0eXBlUGFyYW1zKSwgdGhpcy5pbXBvcnRNYW5hZ2VyKTtcbiAgfVxuXG4gIGdldFByZWx1ZGVTdGF0ZW1lbnRzKCk6IHRzLlN0YXRlbWVudFtdIHtcbiAgICByZXR1cm4gW1xuICAgICAgLi4udGhpcy5oZWxwZXJTdGF0ZW1lbnRzLFxuICAgICAgLi4udGhpcy5waXBlSW5zdFN0YXRlbWVudHMsXG4gICAgICAuLi50aGlzLnR5cGVDdG9yU3RhdGVtZW50cyxcbiAgICBdO1xuICB9XG59XG4iXX0=