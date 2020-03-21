(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/compiler-cli/src/ngtsc/typecheck/src/type_parameter_emitter", ["require", "exports", "typescript", "@angular/compiler-cli/src/ngtsc/imports", "@angular/compiler-cli/src/ngtsc/typecheck/src/type_emitter"], factory);
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
    var type_emitter_1 = require("@angular/compiler-cli/src/ngtsc/typecheck/src/type_emitter");
    /**
     * See `TypeEmitter` for more information on the emitting process.
     */
    var TypeParameterEmitter = /** @class */ (function () {
        function TypeParameterEmitter(typeParameters, reflector) {
            this.typeParameters = typeParameters;
            this.reflector = reflector;
        }
        /**
         * Determines whether the type parameters can be emitted. If this returns true, then a call to
         * `emit` is known to succeed. Vice versa, if false is returned then `emit` should not be
         * called, as it would fail.
         */
        TypeParameterEmitter.prototype.canEmit = function () {
            var _this = this;
            if (this.typeParameters === undefined) {
                return true;
            }
            return this.typeParameters.every(function (typeParam) {
                if (typeParam.constraint === undefined) {
                    return true;
                }
                return type_emitter_1.canEmitType(typeParam.constraint, function (type) { return _this.resolveTypeReference(type); });
            });
        };
        /**
         * Emits the type parameters using the provided emitter function for `Reference`s.
         */
        TypeParameterEmitter.prototype.emit = function (emitReference) {
            var _this = this;
            if (this.typeParameters === undefined) {
                return undefined;
            }
            var emitter = new type_emitter_1.TypeEmitter(function (type) { return _this.resolveTypeReference(type); }, emitReference);
            return this.typeParameters.map(function (typeParam) {
                var constraint = typeParam.constraint !== undefined ? emitter.emitType(typeParam.constraint) : undefined;
                return ts.updateTypeParameterDeclaration(
                /* node */ typeParam, 
                /* name */ typeParam.name, 
                /* constraint */ constraint, 
                /* defaultType */ typeParam.default);
            });
        };
        TypeParameterEmitter.prototype.resolveTypeReference = function (type) {
            var target = ts.isIdentifier(type.typeName) ? type.typeName : type.typeName.right;
            var declaration = this.reflector.getDeclarationOfIdentifier(target);
            // If no declaration could be resolved or does not have a `ts.Declaration`, the type cannot be
            // resolved.
            if (declaration === null || declaration.node === null) {
                return null;
            }
            // If the declaration corresponds with a local type parameter, the type reference can be used
            // as is.
            if (this.isLocalTypeParameter(declaration.node)) {
                return type;
            }
            var owningModule = null;
            if (declaration.viaModule !== null) {
                owningModule = {
                    specifier: declaration.viaModule,
                    resolutionContext: type.getSourceFile().fileName,
                };
            }
            return new imports_1.Reference(declaration.node, owningModule);
        };
        TypeParameterEmitter.prototype.isLocalTypeParameter = function (decl) {
            // Checking for local type parameters only occurs during resolution of type parameters, so it is
            // guaranteed that type parameters are present.
            return this.typeParameters.some(function (param) { return param === decl; });
        };
        return TypeParameterEmitter;
    }());
    exports.TypeParameterEmitter = TypeParameterEmitter;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHlwZV9wYXJhbWV0ZXJfZW1pdHRlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbXBpbGVyLWNsaS9zcmMvbmd0c2MvdHlwZWNoZWNrL3NyYy90eXBlX3BhcmFtZXRlcl9lbWl0dGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0lBQUE7Ozs7OztPQU1HO0lBQ0gsK0JBQWlDO0lBRWpDLG1FQUFzRDtJQUd0RCwyRkFBK0U7SUFHL0U7O09BRUc7SUFDSDtRQUNFLDhCQUNZLGNBQW1FLEVBQ25FLFNBQXlCO1lBRHpCLG1CQUFjLEdBQWQsY0FBYyxDQUFxRDtZQUNuRSxjQUFTLEdBQVQsU0FBUyxDQUFnQjtRQUFHLENBQUM7UUFFekM7Ozs7V0FJRztRQUNILHNDQUFPLEdBQVA7WUFBQSxpQkFZQztZQVhDLElBQUksSUFBSSxDQUFDLGNBQWMsS0FBSyxTQUFTLEVBQUU7Z0JBQ3JDLE9BQU8sSUFBSSxDQUFDO2FBQ2I7WUFFRCxPQUFPLElBQUksQ0FBQyxjQUFjLENBQUMsS0FBSyxDQUFDLFVBQUEsU0FBUztnQkFDeEMsSUFBSSxTQUFTLENBQUMsVUFBVSxLQUFLLFNBQVMsRUFBRTtvQkFDdEMsT0FBTyxJQUFJLENBQUM7aUJBQ2I7Z0JBRUQsT0FBTywwQkFBVyxDQUFDLFNBQVMsQ0FBQyxVQUFVLEVBQUUsVUFBQSxJQUFJLElBQUksT0FBQSxLQUFJLENBQUMsb0JBQW9CLENBQUMsSUFBSSxDQUFDLEVBQS9CLENBQStCLENBQUMsQ0FBQztZQUNwRixDQUFDLENBQUMsQ0FBQztRQUNMLENBQUM7UUFFRDs7V0FFRztRQUNILG1DQUFJLEdBQUosVUFBSyxhQUE4QztZQUFuRCxpQkFpQkM7WUFoQkMsSUFBSSxJQUFJLENBQUMsY0FBYyxLQUFLLFNBQVMsRUFBRTtnQkFDckMsT0FBTyxTQUFTLENBQUM7YUFDbEI7WUFFRCxJQUFNLE9BQU8sR0FBRyxJQUFJLDBCQUFXLENBQUMsVUFBQSxJQUFJLElBQUksT0FBQSxLQUFJLENBQUMsb0JBQW9CLENBQUMsSUFBSSxDQUFDLEVBQS9CLENBQStCLEVBQUUsYUFBYSxDQUFDLENBQUM7WUFFeEYsT0FBTyxJQUFJLENBQUMsY0FBYyxDQUFDLEdBQUcsQ0FBQyxVQUFBLFNBQVM7Z0JBQ3RDLElBQU0sVUFBVSxHQUNaLFNBQVMsQ0FBQyxVQUFVLEtBQUssU0FBUyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDO2dCQUU1RixPQUFPLEVBQUUsQ0FBQyw4QkFBOEI7Z0JBQ3BDLFVBQVUsQ0FBQyxTQUFTO2dCQUNwQixVQUFVLENBQUMsU0FBUyxDQUFDLElBQUk7Z0JBQ3pCLGdCQUFnQixDQUFDLFVBQVU7Z0JBQzNCLGlCQUFpQixDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUMzQyxDQUFDLENBQUMsQ0FBQztRQUNMLENBQUM7UUFFTyxtREFBb0IsR0FBNUIsVUFBNkIsSUFBMEI7WUFDckQsSUFBTSxNQUFNLEdBQUcsRUFBRSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDO1lBQ3BGLElBQU0sV0FBVyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsMEJBQTBCLENBQUMsTUFBTSxDQUFDLENBQUM7WUFFdEUsOEZBQThGO1lBQzlGLFlBQVk7WUFDWixJQUFJLFdBQVcsS0FBSyxJQUFJLElBQUksV0FBVyxDQUFDLElBQUksS0FBSyxJQUFJLEVBQUU7Z0JBQ3JELE9BQU8sSUFBSSxDQUFDO2FBQ2I7WUFFRCw2RkFBNkY7WUFDN0YsU0FBUztZQUNULElBQUksSUFBSSxDQUFDLG9CQUFvQixDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsRUFBRTtnQkFDL0MsT0FBTyxJQUFJLENBQUM7YUFDYjtZQUVELElBQUksWUFBWSxHQUFzQixJQUFJLENBQUM7WUFDM0MsSUFBSSxXQUFXLENBQUMsU0FBUyxLQUFLLElBQUksRUFBRTtnQkFDbEMsWUFBWSxHQUFHO29CQUNiLFNBQVMsRUFBRSxXQUFXLENBQUMsU0FBUztvQkFDaEMsaUJBQWlCLEVBQUUsSUFBSSxDQUFDLGFBQWEsRUFBRSxDQUFDLFFBQVE7aUJBQ2pELENBQUM7YUFDSDtZQUVELE9BQU8sSUFBSSxtQkFBUyxDQUFDLFdBQVcsQ0FBQyxJQUFJLEVBQUUsWUFBWSxDQUFDLENBQUM7UUFDdkQsQ0FBQztRQUVPLG1EQUFvQixHQUE1QixVQUE2QixJQUFvQjtZQUMvQyxnR0FBZ0c7WUFDaEcsK0NBQStDO1lBQy9DLE9BQU8sSUFBSSxDQUFDLGNBQWdCLENBQUMsSUFBSSxDQUFDLFVBQUEsS0FBSyxJQUFJLE9BQUEsS0FBSyxLQUFLLElBQUksRUFBZCxDQUFjLENBQUMsQ0FBQztRQUM3RCxDQUFDO1FBQ0gsMkJBQUM7SUFBRCxDQUFDLEFBOUVELElBOEVDO0lBOUVZLG9EQUFvQiIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cbmltcG9ydCAqIGFzIHRzIGZyb20gJ3R5cGVzY3JpcHQnO1xuXG5pbXBvcnQge093bmluZ01vZHVsZSwgUmVmZXJlbmNlfSBmcm9tICcuLi8uLi9pbXBvcnRzJztcbmltcG9ydCB7UmVmbGVjdGlvbkhvc3R9IGZyb20gJy4uLy4uL3JlZmxlY3Rpb24nO1xuXG5pbXBvcnQge1Jlc29sdmVkVHlwZVJlZmVyZW5jZSwgVHlwZUVtaXR0ZXIsIGNhbkVtaXRUeXBlfSBmcm9tICcuL3R5cGVfZW1pdHRlcic7XG5cblxuLyoqXG4gKiBTZWUgYFR5cGVFbWl0dGVyYCBmb3IgbW9yZSBpbmZvcm1hdGlvbiBvbiB0aGUgZW1pdHRpbmcgcHJvY2Vzcy5cbiAqL1xuZXhwb3J0IGNsYXNzIFR5cGVQYXJhbWV0ZXJFbWl0dGVyIHtcbiAgY29uc3RydWN0b3IoXG4gICAgICBwcml2YXRlIHR5cGVQYXJhbWV0ZXJzOiB0cy5Ob2RlQXJyYXk8dHMuVHlwZVBhcmFtZXRlckRlY2xhcmF0aW9uPnx1bmRlZmluZWQsXG4gICAgICBwcml2YXRlIHJlZmxlY3RvcjogUmVmbGVjdGlvbkhvc3QpIHt9XG5cbiAgLyoqXG4gICAqIERldGVybWluZXMgd2hldGhlciB0aGUgdHlwZSBwYXJhbWV0ZXJzIGNhbiBiZSBlbWl0dGVkLiBJZiB0aGlzIHJldHVybnMgdHJ1ZSwgdGhlbiBhIGNhbGwgdG9cbiAgICogYGVtaXRgIGlzIGtub3duIHRvIHN1Y2NlZWQuIFZpY2UgdmVyc2EsIGlmIGZhbHNlIGlzIHJldHVybmVkIHRoZW4gYGVtaXRgIHNob3VsZCBub3QgYmVcbiAgICogY2FsbGVkLCBhcyBpdCB3b3VsZCBmYWlsLlxuICAgKi9cbiAgY2FuRW1pdCgpOiBib29sZWFuIHtcbiAgICBpZiAodGhpcy50eXBlUGFyYW1ldGVycyA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy50eXBlUGFyYW1ldGVycy5ldmVyeSh0eXBlUGFyYW0gPT4ge1xuICAgICAgaWYgKHR5cGVQYXJhbS5jb25zdHJhaW50ID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBjYW5FbWl0VHlwZSh0eXBlUGFyYW0uY29uc3RyYWludCwgdHlwZSA9PiB0aGlzLnJlc29sdmVUeXBlUmVmZXJlbmNlKHR5cGUpKTtcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBFbWl0cyB0aGUgdHlwZSBwYXJhbWV0ZXJzIHVzaW5nIHRoZSBwcm92aWRlZCBlbWl0dGVyIGZ1bmN0aW9uIGZvciBgUmVmZXJlbmNlYHMuXG4gICAqL1xuICBlbWl0KGVtaXRSZWZlcmVuY2U6IChyZWY6IFJlZmVyZW5jZSkgPT4gdHMuVHlwZU5vZGUpOiB0cy5UeXBlUGFyYW1ldGVyRGVjbGFyYXRpb25bXXx1bmRlZmluZWQge1xuICAgIGlmICh0aGlzLnR5cGVQYXJhbWV0ZXJzID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgfVxuXG4gICAgY29uc3QgZW1pdHRlciA9IG5ldyBUeXBlRW1pdHRlcih0eXBlID0+IHRoaXMucmVzb2x2ZVR5cGVSZWZlcmVuY2UodHlwZSksIGVtaXRSZWZlcmVuY2UpO1xuXG4gICAgcmV0dXJuIHRoaXMudHlwZVBhcmFtZXRlcnMubWFwKHR5cGVQYXJhbSA9PiB7XG4gICAgICBjb25zdCBjb25zdHJhaW50ID1cbiAgICAgICAgICB0eXBlUGFyYW0uY29uc3RyYWludCAhPT0gdW5kZWZpbmVkID8gZW1pdHRlci5lbWl0VHlwZSh0eXBlUGFyYW0uY29uc3RyYWludCkgOiB1bmRlZmluZWQ7XG5cbiAgICAgIHJldHVybiB0cy51cGRhdGVUeXBlUGFyYW1ldGVyRGVjbGFyYXRpb24oXG4gICAgICAgICAgLyogbm9kZSAqLyB0eXBlUGFyYW0sXG4gICAgICAgICAgLyogbmFtZSAqLyB0eXBlUGFyYW0ubmFtZSxcbiAgICAgICAgICAvKiBjb25zdHJhaW50ICovIGNvbnN0cmFpbnQsXG4gICAgICAgICAgLyogZGVmYXVsdFR5cGUgKi8gdHlwZVBhcmFtLmRlZmF1bHQpO1xuICAgIH0pO1xuICB9XG5cbiAgcHJpdmF0ZSByZXNvbHZlVHlwZVJlZmVyZW5jZSh0eXBlOiB0cy5UeXBlUmVmZXJlbmNlTm9kZSk6IFJlc29sdmVkVHlwZVJlZmVyZW5jZSB7XG4gICAgY29uc3QgdGFyZ2V0ID0gdHMuaXNJZGVudGlmaWVyKHR5cGUudHlwZU5hbWUpID8gdHlwZS50eXBlTmFtZSA6IHR5cGUudHlwZU5hbWUucmlnaHQ7XG4gICAgY29uc3QgZGVjbGFyYXRpb24gPSB0aGlzLnJlZmxlY3Rvci5nZXREZWNsYXJhdGlvbk9mSWRlbnRpZmllcih0YXJnZXQpO1xuXG4gICAgLy8gSWYgbm8gZGVjbGFyYXRpb24gY291bGQgYmUgcmVzb2x2ZWQgb3IgZG9lcyBub3QgaGF2ZSBhIGB0cy5EZWNsYXJhdGlvbmAsIHRoZSB0eXBlIGNhbm5vdCBiZVxuICAgIC8vIHJlc29sdmVkLlxuICAgIGlmIChkZWNsYXJhdGlvbiA9PT0gbnVsbCB8fCBkZWNsYXJhdGlvbi5ub2RlID09PSBudWxsKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICAvLyBJZiB0aGUgZGVjbGFyYXRpb24gY29ycmVzcG9uZHMgd2l0aCBhIGxvY2FsIHR5cGUgcGFyYW1ldGVyLCB0aGUgdHlwZSByZWZlcmVuY2UgY2FuIGJlIHVzZWRcbiAgICAvLyBhcyBpcy5cbiAgICBpZiAodGhpcy5pc0xvY2FsVHlwZVBhcmFtZXRlcihkZWNsYXJhdGlvbi5ub2RlKSkge1xuICAgICAgcmV0dXJuIHR5cGU7XG4gICAgfVxuXG4gICAgbGV0IG93bmluZ01vZHVsZTogT3duaW5nTW9kdWxlfG51bGwgPSBudWxsO1xuICAgIGlmIChkZWNsYXJhdGlvbi52aWFNb2R1bGUgIT09IG51bGwpIHtcbiAgICAgIG93bmluZ01vZHVsZSA9IHtcbiAgICAgICAgc3BlY2lmaWVyOiBkZWNsYXJhdGlvbi52aWFNb2R1bGUsXG4gICAgICAgIHJlc29sdXRpb25Db250ZXh0OiB0eXBlLmdldFNvdXJjZUZpbGUoKS5maWxlTmFtZSxcbiAgICAgIH07XG4gICAgfVxuXG4gICAgcmV0dXJuIG5ldyBSZWZlcmVuY2UoZGVjbGFyYXRpb24ubm9kZSwgb3duaW5nTW9kdWxlKTtcbiAgfVxuXG4gIHByaXZhdGUgaXNMb2NhbFR5cGVQYXJhbWV0ZXIoZGVjbDogdHMuRGVjbGFyYXRpb24pOiBib29sZWFuIHtcbiAgICAvLyBDaGVja2luZyBmb3IgbG9jYWwgdHlwZSBwYXJhbWV0ZXJzIG9ubHkgb2NjdXJzIGR1cmluZyByZXNvbHV0aW9uIG9mIHR5cGUgcGFyYW1ldGVycywgc28gaXQgaXNcbiAgICAvLyBndWFyYW50ZWVkIHRoYXQgdHlwZSBwYXJhbWV0ZXJzIGFyZSBwcmVzZW50LlxuICAgIHJldHVybiB0aGlzLnR5cGVQYXJhbWV0ZXJzICEuc29tZShwYXJhbSA9PiBwYXJhbSA9PT0gZGVjbCk7XG4gIH1cbn1cbiJdfQ==