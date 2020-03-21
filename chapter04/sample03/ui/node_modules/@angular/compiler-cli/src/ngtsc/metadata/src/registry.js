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
        define("@angular/compiler-cli/src/ngtsc/metadata/src/registry", ["require", "exports", "tslib", "@angular/compiler-cli/src/ngtsc/metadata/src/util"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var tslib_1 = require("tslib");
    var util_1 = require("@angular/compiler-cli/src/ngtsc/metadata/src/util");
    /**
     * A registry of directive, pipe, and module metadata for types defined in the current compilation
     * unit, which supports both reading and registering.
     */
    var LocalMetadataRegistry = /** @class */ (function () {
        function LocalMetadataRegistry() {
            this.directives = new Map();
            this.ngModules = new Map();
            this.pipes = new Map();
        }
        LocalMetadataRegistry.prototype.getDirectiveMetadata = function (ref) {
            return this.directives.has(ref.node) ? this.directives.get(ref.node) : null;
        };
        LocalMetadataRegistry.prototype.getNgModuleMetadata = function (ref) {
            return this.ngModules.has(ref.node) ? this.ngModules.get(ref.node) : null;
        };
        LocalMetadataRegistry.prototype.getPipeMetadata = function (ref) {
            return this.pipes.has(ref.node) ? this.pipes.get(ref.node) : null;
        };
        LocalMetadataRegistry.prototype.registerDirectiveMetadata = function (meta) { this.directives.set(meta.ref.node, meta); };
        LocalMetadataRegistry.prototype.registerNgModuleMetadata = function (meta) { this.ngModules.set(meta.ref.node, meta); };
        LocalMetadataRegistry.prototype.registerPipeMetadata = function (meta) { this.pipes.set(meta.ref.node, meta); };
        return LocalMetadataRegistry;
    }());
    exports.LocalMetadataRegistry = LocalMetadataRegistry;
    /**
     * A `MetadataRegistry` which registers metdata with multiple delegate `MetadataRegistry` instances.
     */
    var CompoundMetadataRegistry = /** @class */ (function () {
        function CompoundMetadataRegistry(registries) {
            this.registries = registries;
        }
        CompoundMetadataRegistry.prototype.registerDirectiveMetadata = function (meta) {
            var e_1, _a;
            try {
                for (var _b = tslib_1.__values(this.registries), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var registry = _c.value;
                    registry.registerDirectiveMetadata(meta);
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_1) throw e_1.error; }
            }
        };
        CompoundMetadataRegistry.prototype.registerNgModuleMetadata = function (meta) {
            var e_2, _a;
            try {
                for (var _b = tslib_1.__values(this.registries), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var registry = _c.value;
                    registry.registerNgModuleMetadata(meta);
                }
            }
            catch (e_2_1) { e_2 = { error: e_2_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_2) throw e_2.error; }
            }
        };
        CompoundMetadataRegistry.prototype.registerPipeMetadata = function (meta) {
            var e_3, _a;
            try {
                for (var _b = tslib_1.__values(this.registries), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var registry = _c.value;
                    registry.registerPipeMetadata(meta);
                }
            }
            catch (e_3_1) { e_3 = { error: e_3_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_3) throw e_3.error; }
            }
        };
        return CompoundMetadataRegistry;
    }());
    exports.CompoundMetadataRegistry = CompoundMetadataRegistry;
    /**
     * Registry that keeps track of classes that can be constructed via dependency injection (e.g.
     * injectables, directives, pipes).
     */
    var InjectableClassRegistry = /** @class */ (function () {
        function InjectableClassRegistry(host) {
            this.host = host;
            this.classes = new Set();
        }
        InjectableClassRegistry.prototype.registerInjectable = function (declaration) { this.classes.add(declaration); };
        InjectableClassRegistry.prototype.isInjectable = function (declaration) {
            // Figure out whether the class is injectable based on the registered classes, otherwise
            // fall back to looking at its members since we might not have been able register the class
            // if it was compiled already.
            return this.classes.has(declaration) || util_1.hasInjectableFields(declaration, this.host);
        };
        return InjectableClassRegistry;
    }());
    exports.InjectableClassRegistry = InjectableClassRegistry;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVnaXN0cnkuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21waWxlci1jbGkvc3JjL25ndHNjL21ldGFkYXRhL3NyYy9yZWdpc3RyeS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7Ozs7Ozs7Ozs7Ozs7SUFNSCwwRUFBMkM7SUFFM0M7OztPQUdHO0lBQ0g7UUFBQTtZQUNVLGVBQVUsR0FBRyxJQUFJLEdBQUcsRUFBbUMsQ0FBQztZQUN4RCxjQUFTLEdBQUcsSUFBSSxHQUFHLEVBQWtDLENBQUM7WUFDdEQsVUFBSyxHQUFHLElBQUksR0FBRyxFQUE4QixDQUFDO1FBZXhELENBQUM7UUFiQyxvREFBb0IsR0FBcEIsVUFBcUIsR0FBZ0M7WUFDbkQsT0FBTyxJQUFJLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUcsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDO1FBQ2hGLENBQUM7UUFDRCxtREFBbUIsR0FBbkIsVUFBb0IsR0FBZ0M7WUFDbEQsT0FBTyxJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUcsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDO1FBQzlFLENBQUM7UUFDRCwrQ0FBZSxHQUFmLFVBQWdCLEdBQWdDO1lBQzlDLE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFHLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztRQUN0RSxDQUFDO1FBRUQseURBQXlCLEdBQXpCLFVBQTBCLElBQW1CLElBQVUsSUFBSSxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ2xHLHdEQUF3QixHQUF4QixVQUF5QixJQUFrQixJQUFVLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUMvRixvREFBb0IsR0FBcEIsVUFBcUIsSUFBYyxJQUFVLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNyRiw0QkFBQztJQUFELENBQUMsQUFsQkQsSUFrQkM7SUFsQlksc0RBQXFCO0lBb0JsQzs7T0FFRztJQUNIO1FBQ0Usa0NBQW9CLFVBQThCO1lBQTlCLGVBQVUsR0FBVixVQUFVLENBQW9CO1FBQUcsQ0FBQztRQUV0RCw0REFBeUIsR0FBekIsVUFBMEIsSUFBbUI7OztnQkFDM0MsS0FBdUIsSUFBQSxLQUFBLGlCQUFBLElBQUksQ0FBQyxVQUFVLENBQUEsZ0JBQUEsNEJBQUU7b0JBQW5DLElBQU0sUUFBUSxXQUFBO29CQUNqQixRQUFRLENBQUMseUJBQXlCLENBQUMsSUFBSSxDQUFDLENBQUM7aUJBQzFDOzs7Ozs7Ozs7UUFDSCxDQUFDO1FBRUQsMkRBQXdCLEdBQXhCLFVBQXlCLElBQWtCOzs7Z0JBQ3pDLEtBQXVCLElBQUEsS0FBQSxpQkFBQSxJQUFJLENBQUMsVUFBVSxDQUFBLGdCQUFBLDRCQUFFO29CQUFuQyxJQUFNLFFBQVEsV0FBQTtvQkFDakIsUUFBUSxDQUFDLHdCQUF3QixDQUFDLElBQUksQ0FBQyxDQUFDO2lCQUN6Qzs7Ozs7Ozs7O1FBQ0gsQ0FBQztRQUVELHVEQUFvQixHQUFwQixVQUFxQixJQUFjOzs7Z0JBQ2pDLEtBQXVCLElBQUEsS0FBQSxpQkFBQSxJQUFJLENBQUMsVUFBVSxDQUFBLGdCQUFBLDRCQUFFO29CQUFuQyxJQUFNLFFBQVEsV0FBQTtvQkFDakIsUUFBUSxDQUFDLG9CQUFvQixDQUFDLElBQUksQ0FBQyxDQUFDO2lCQUNyQzs7Ozs7Ozs7O1FBQ0gsQ0FBQztRQUNILCtCQUFDO0lBQUQsQ0FBQyxBQXBCRCxJQW9CQztJQXBCWSw0REFBd0I7SUFzQnJDOzs7T0FHRztJQUNIO1FBR0UsaUNBQW9CLElBQW9CO1lBQXBCLFNBQUksR0FBSixJQUFJLENBQWdCO1lBRmhDLFlBQU8sR0FBRyxJQUFJLEdBQUcsRUFBb0IsQ0FBQztRQUVILENBQUM7UUFFNUMsb0RBQWtCLEdBQWxCLFVBQW1CLFdBQTZCLElBQVUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBRTFGLDhDQUFZLEdBQVosVUFBYSxXQUE2QjtZQUN4Qyx3RkFBd0Y7WUFDeEYsMkZBQTJGO1lBQzNGLDhCQUE4QjtZQUM5QixPQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLFdBQVcsQ0FBQyxJQUFJLDBCQUFtQixDQUFDLFdBQVcsRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDdEYsQ0FBQztRQUNILDhCQUFDO0lBQUQsQ0FBQyxBQWJELElBYUM7SUFiWSwwREFBdUIiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7UmVmZXJlbmNlfSBmcm9tICcuLi8uLi9pbXBvcnRzJztcbmltcG9ydCB7Q2xhc3NEZWNsYXJhdGlvbiwgUmVmbGVjdGlvbkhvc3R9IGZyb20gJy4uLy4uL3JlZmxlY3Rpb24nO1xuXG5pbXBvcnQge0RpcmVjdGl2ZU1ldGEsIE1ldGFkYXRhUmVhZGVyLCBNZXRhZGF0YVJlZ2lzdHJ5LCBOZ01vZHVsZU1ldGEsIFBpcGVNZXRhfSBmcm9tICcuL2FwaSc7XG5pbXBvcnQge2hhc0luamVjdGFibGVGaWVsZHN9IGZyb20gJy4vdXRpbCc7XG5cbi8qKlxuICogQSByZWdpc3RyeSBvZiBkaXJlY3RpdmUsIHBpcGUsIGFuZCBtb2R1bGUgbWV0YWRhdGEgZm9yIHR5cGVzIGRlZmluZWQgaW4gdGhlIGN1cnJlbnQgY29tcGlsYXRpb25cbiAqIHVuaXQsIHdoaWNoIHN1cHBvcnRzIGJvdGggcmVhZGluZyBhbmQgcmVnaXN0ZXJpbmcuXG4gKi9cbmV4cG9ydCBjbGFzcyBMb2NhbE1ldGFkYXRhUmVnaXN0cnkgaW1wbGVtZW50cyBNZXRhZGF0YVJlZ2lzdHJ5LCBNZXRhZGF0YVJlYWRlciB7XG4gIHByaXZhdGUgZGlyZWN0aXZlcyA9IG5ldyBNYXA8Q2xhc3NEZWNsYXJhdGlvbiwgRGlyZWN0aXZlTWV0YT4oKTtcbiAgcHJpdmF0ZSBuZ01vZHVsZXMgPSBuZXcgTWFwPENsYXNzRGVjbGFyYXRpb24sIE5nTW9kdWxlTWV0YT4oKTtcbiAgcHJpdmF0ZSBwaXBlcyA9IG5ldyBNYXA8Q2xhc3NEZWNsYXJhdGlvbiwgUGlwZU1ldGE+KCk7XG5cbiAgZ2V0RGlyZWN0aXZlTWV0YWRhdGEocmVmOiBSZWZlcmVuY2U8Q2xhc3NEZWNsYXJhdGlvbj4pOiBEaXJlY3RpdmVNZXRhfG51bGwge1xuICAgIHJldHVybiB0aGlzLmRpcmVjdGl2ZXMuaGFzKHJlZi5ub2RlKSA/IHRoaXMuZGlyZWN0aXZlcy5nZXQocmVmLm5vZGUpICEgOiBudWxsO1xuICB9XG4gIGdldE5nTW9kdWxlTWV0YWRhdGEocmVmOiBSZWZlcmVuY2U8Q2xhc3NEZWNsYXJhdGlvbj4pOiBOZ01vZHVsZU1ldGF8bnVsbCB7XG4gICAgcmV0dXJuIHRoaXMubmdNb2R1bGVzLmhhcyhyZWYubm9kZSkgPyB0aGlzLm5nTW9kdWxlcy5nZXQocmVmLm5vZGUpICEgOiBudWxsO1xuICB9XG4gIGdldFBpcGVNZXRhZGF0YShyZWY6IFJlZmVyZW5jZTxDbGFzc0RlY2xhcmF0aW9uPik6IFBpcGVNZXRhfG51bGwge1xuICAgIHJldHVybiB0aGlzLnBpcGVzLmhhcyhyZWYubm9kZSkgPyB0aGlzLnBpcGVzLmdldChyZWYubm9kZSkgISA6IG51bGw7XG4gIH1cblxuICByZWdpc3RlckRpcmVjdGl2ZU1ldGFkYXRhKG1ldGE6IERpcmVjdGl2ZU1ldGEpOiB2b2lkIHsgdGhpcy5kaXJlY3RpdmVzLnNldChtZXRhLnJlZi5ub2RlLCBtZXRhKTsgfVxuICByZWdpc3Rlck5nTW9kdWxlTWV0YWRhdGEobWV0YTogTmdNb2R1bGVNZXRhKTogdm9pZCB7IHRoaXMubmdNb2R1bGVzLnNldChtZXRhLnJlZi5ub2RlLCBtZXRhKTsgfVxuICByZWdpc3RlclBpcGVNZXRhZGF0YShtZXRhOiBQaXBlTWV0YSk6IHZvaWQgeyB0aGlzLnBpcGVzLnNldChtZXRhLnJlZi5ub2RlLCBtZXRhKTsgfVxufVxuXG4vKipcbiAqIEEgYE1ldGFkYXRhUmVnaXN0cnlgIHdoaWNoIHJlZ2lzdGVycyBtZXRkYXRhIHdpdGggbXVsdGlwbGUgZGVsZWdhdGUgYE1ldGFkYXRhUmVnaXN0cnlgIGluc3RhbmNlcy5cbiAqL1xuZXhwb3J0IGNsYXNzIENvbXBvdW5kTWV0YWRhdGFSZWdpc3RyeSBpbXBsZW1lbnRzIE1ldGFkYXRhUmVnaXN0cnkge1xuICBjb25zdHJ1Y3Rvcihwcml2YXRlIHJlZ2lzdHJpZXM6IE1ldGFkYXRhUmVnaXN0cnlbXSkge31cblxuICByZWdpc3RlckRpcmVjdGl2ZU1ldGFkYXRhKG1ldGE6IERpcmVjdGl2ZU1ldGEpOiB2b2lkIHtcbiAgICBmb3IgKGNvbnN0IHJlZ2lzdHJ5IG9mIHRoaXMucmVnaXN0cmllcykge1xuICAgICAgcmVnaXN0cnkucmVnaXN0ZXJEaXJlY3RpdmVNZXRhZGF0YShtZXRhKTtcbiAgICB9XG4gIH1cblxuICByZWdpc3Rlck5nTW9kdWxlTWV0YWRhdGEobWV0YTogTmdNb2R1bGVNZXRhKTogdm9pZCB7XG4gICAgZm9yIChjb25zdCByZWdpc3RyeSBvZiB0aGlzLnJlZ2lzdHJpZXMpIHtcbiAgICAgIHJlZ2lzdHJ5LnJlZ2lzdGVyTmdNb2R1bGVNZXRhZGF0YShtZXRhKTtcbiAgICB9XG4gIH1cblxuICByZWdpc3RlclBpcGVNZXRhZGF0YShtZXRhOiBQaXBlTWV0YSk6IHZvaWQge1xuICAgIGZvciAoY29uc3QgcmVnaXN0cnkgb2YgdGhpcy5yZWdpc3RyaWVzKSB7XG4gICAgICByZWdpc3RyeS5yZWdpc3RlclBpcGVNZXRhZGF0YShtZXRhKTtcbiAgICB9XG4gIH1cbn1cblxuLyoqXG4gKiBSZWdpc3RyeSB0aGF0IGtlZXBzIHRyYWNrIG9mIGNsYXNzZXMgdGhhdCBjYW4gYmUgY29uc3RydWN0ZWQgdmlhIGRlcGVuZGVuY3kgaW5qZWN0aW9uIChlLmcuXG4gKiBpbmplY3RhYmxlcywgZGlyZWN0aXZlcywgcGlwZXMpLlxuICovXG5leHBvcnQgY2xhc3MgSW5qZWN0YWJsZUNsYXNzUmVnaXN0cnkge1xuICBwcml2YXRlIGNsYXNzZXMgPSBuZXcgU2V0PENsYXNzRGVjbGFyYXRpb24+KCk7XG5cbiAgY29uc3RydWN0b3IocHJpdmF0ZSBob3N0OiBSZWZsZWN0aW9uSG9zdCkge31cblxuICByZWdpc3RlckluamVjdGFibGUoZGVjbGFyYXRpb246IENsYXNzRGVjbGFyYXRpb24pOiB2b2lkIHsgdGhpcy5jbGFzc2VzLmFkZChkZWNsYXJhdGlvbik7IH1cblxuICBpc0luamVjdGFibGUoZGVjbGFyYXRpb246IENsYXNzRGVjbGFyYXRpb24pOiBib29sZWFuIHtcbiAgICAvLyBGaWd1cmUgb3V0IHdoZXRoZXIgdGhlIGNsYXNzIGlzIGluamVjdGFibGUgYmFzZWQgb24gdGhlIHJlZ2lzdGVyZWQgY2xhc3Nlcywgb3RoZXJ3aXNlXG4gICAgLy8gZmFsbCBiYWNrIHRvIGxvb2tpbmcgYXQgaXRzIG1lbWJlcnMgc2luY2Ugd2UgbWlnaHQgbm90IGhhdmUgYmVlbiBhYmxlIHJlZ2lzdGVyIHRoZSBjbGFzc1xuICAgIC8vIGlmIGl0IHdhcyBjb21waWxlZCBhbHJlYWR5LlxuICAgIHJldHVybiB0aGlzLmNsYXNzZXMuaGFzKGRlY2xhcmF0aW9uKSB8fCBoYXNJbmplY3RhYmxlRmllbGRzKGRlY2xhcmF0aW9uLCB0aGlzLmhvc3QpO1xuICB9XG59XG4iXX0=