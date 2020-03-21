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
        define("@angular/compiler-cli/src/ngtsc/scope/src/dependency", ["require", "exports", "tslib"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var tslib_1 = require("tslib");
    /**
     * Reads Angular metadata from classes declared in .d.ts files and computes an `ExportScope`.
     *
     * Given an NgModule declared in a .d.ts file, this resolver can produce a transitive `ExportScope`
     * of all of the directives/pipes it exports. It does this by reading metadata off of Ivy static
     * fields on directives, components, pipes, and NgModules.
     */
    var MetadataDtsModuleScopeResolver = /** @class */ (function () {
        /**
         * @param dtsMetaReader a `MetadataReader` which can read metadata from `.d.ts` files.
         */
        function MetadataDtsModuleScopeResolver(dtsMetaReader, aliasingHost) {
            this.dtsMetaReader = dtsMetaReader;
            this.aliasingHost = aliasingHost;
            /**
             * Cache which holds fully resolved scopes for NgModule classes from .d.ts files.
             */
            this.cache = new Map();
        }
        /**
         * Resolve a `Reference`'d NgModule from a .d.ts file and produce a transitive `ExportScope`
         * listing the directives and pipes which that NgModule exports to others.
         *
         * This operation relies on a `Reference` instead of a direct TypeScrpt node as the `Reference`s
         * produced depend on how the original NgModule was imported.
         */
        MetadataDtsModuleScopeResolver.prototype.resolve = function (ref) {
            var e_1, _a, e_2, _b, e_3, _c, e_4, _d;
            var clazz = ref.node;
            var sourceFile = clazz.getSourceFile();
            if (!sourceFile.isDeclarationFile) {
                throw new Error("Debug error: DtsModuleScopeResolver.read(" + ref.debugName + " from " + sourceFile.fileName + "), but not a .d.ts file");
            }
            if (this.cache.has(clazz)) {
                return this.cache.get(clazz);
            }
            // Build up the export scope - those directives and pipes made visible by this module.
            var directives = [];
            var pipes = [];
            var meta = this.dtsMetaReader.getNgModuleMetadata(ref);
            if (meta === null) {
                this.cache.set(clazz, null);
                return null;
            }
            var declarations = new Set();
            try {
                for (var _e = tslib_1.__values(meta.declarations), _f = _e.next(); !_f.done; _f = _e.next()) {
                    var declRef = _f.value;
                    declarations.add(declRef.node);
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (_f && !_f.done && (_a = _e.return)) _a.call(_e);
                }
                finally { if (e_1) throw e_1.error; }
            }
            try {
                // Only the 'exports' field of the NgModule's metadata is important. Imports and declarations
                // don't affect the export scope.
                for (var _g = tslib_1.__values(meta.exports), _h = _g.next(); !_h.done; _h = _g.next()) {
                    var exportRef = _h.value;
                    // Attempt to process the export as a directive.
                    var directive = this.dtsMetaReader.getDirectiveMetadata(exportRef);
                    if (directive !== null) {
                        var isReExport = !declarations.has(exportRef.node);
                        directives.push(this.maybeAlias(directive, sourceFile, isReExport));
                        continue;
                    }
                    // Attempt to process the export as a pipe.
                    var pipe = this.dtsMetaReader.getPipeMetadata(exportRef);
                    if (pipe !== null) {
                        var isReExport = !declarations.has(exportRef.node);
                        pipes.push(this.maybeAlias(pipe, sourceFile, isReExport));
                        continue;
                    }
                    // Attempt to process the export as a module.
                    var exportScope_1 = this.resolve(exportRef);
                    if (exportScope_1 !== null) {
                        // It is a module. Add exported directives and pipes to the current scope. This might
                        // involve rewriting the `Reference`s to those types to have an alias expression if one is
                        // required.
                        if (this.aliasingHost === null) {
                            // Fast path when aliases aren't required.
                            directives.push.apply(directives, tslib_1.__spread(exportScope_1.exported.directives));
                            pipes.push.apply(pipes, tslib_1.__spread(exportScope_1.exported.pipes));
                        }
                        else {
                            try {
                                // It's necessary to rewrite the `Reference`s to add alias expressions. This way, imports
                                // generated to these directives and pipes will use a shallow import to `sourceFile`
                                // instead of a deep import directly to the directive or pipe class.
                                //
                                // One important check here is whether the directive/pipe is declared in the same
                                // source file as the re-exporting NgModule. This can happen if both a directive, its
                                // NgModule, and the re-exporting NgModule are all in the same file. In this case,
                                // no import alias is needed as it would go to the same file anyway.
                                for (var _j = (e_3 = void 0, tslib_1.__values(exportScope_1.exported.directives)), _k = _j.next(); !_k.done; _k = _j.next()) {
                                    var directive_1 = _k.value;
                                    directives.push(this.maybeAlias(directive_1, sourceFile, /* isReExport */ true));
                                }
                            }
                            catch (e_3_1) { e_3 = { error: e_3_1 }; }
                            finally {
                                try {
                                    if (_k && !_k.done && (_c = _j.return)) _c.call(_j);
                                }
                                finally { if (e_3) throw e_3.error; }
                            }
                            try {
                                for (var _l = (e_4 = void 0, tslib_1.__values(exportScope_1.exported.pipes)), _m = _l.next(); !_m.done; _m = _l.next()) {
                                    var pipe_1 = _m.value;
                                    pipes.push(this.maybeAlias(pipe_1, sourceFile, /* isReExport */ true));
                                }
                            }
                            catch (e_4_1) { e_4 = { error: e_4_1 }; }
                            finally {
                                try {
                                    if (_m && !_m.done && (_d = _l.return)) _d.call(_l);
                                }
                                finally { if (e_4) throw e_4.error; }
                            }
                        }
                    }
                    continue;
                    // The export was not a directive, a pipe, or a module. This is an error.
                    // TODO(alxhub): produce a ts.Diagnostic
                    throw new Error("Exported value " + exportRef.debugName + " was not a directive, pipe, or module");
                }
            }
            catch (e_2_1) { e_2 = { error: e_2_1 }; }
            finally {
                try {
                    if (_h && !_h.done && (_b = _g.return)) _b.call(_g);
                }
                finally { if (e_2) throw e_2.error; }
            }
            var exportScope = {
                exported: { directives: directives, pipes: pipes },
            };
            this.cache.set(clazz, exportScope);
            return exportScope;
        };
        MetadataDtsModuleScopeResolver.prototype.maybeAlias = function (dirOrPipe, maybeAliasFrom, isReExport) {
            var ref = dirOrPipe.ref;
            if (this.aliasingHost === null || ref.node.getSourceFile() === maybeAliasFrom) {
                return dirOrPipe;
            }
            var alias = this.aliasingHost.getAliasIn(ref.node, maybeAliasFrom, isReExport);
            if (alias === null) {
                return dirOrPipe;
            }
            return tslib_1.__assign(tslib_1.__assign({}, dirOrPipe), { ref: ref.cloneWithAlias(alias) });
        };
        return MetadataDtsModuleScopeResolver;
    }());
    exports.MetadataDtsModuleScopeResolver = MetadataDtsModuleScopeResolver;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVwZW5kZW5jeS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbXBpbGVyLWNsaS9zcmMvbmd0c2Mvc2NvcGUvc3JjL2RlcGVuZGVuY3kudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOzs7Ozs7Ozs7Ozs7O0lBY0g7Ozs7OztPQU1HO0lBQ0g7UUFNRTs7V0FFRztRQUNILHdDQUFvQixhQUE2QixFQUFVLFlBQStCO1lBQXRFLGtCQUFhLEdBQWIsYUFBYSxDQUFnQjtZQUFVLGlCQUFZLEdBQVosWUFBWSxDQUFtQjtZQVIxRjs7ZUFFRztZQUNLLFVBQUssR0FBRyxJQUFJLEdBQUcsRUFBc0MsQ0FBQztRQUsrQixDQUFDO1FBRTlGOzs7Ozs7V0FNRztRQUNILGdEQUFPLEdBQVAsVUFBUSxHQUFnQzs7WUFDdEMsSUFBTSxLQUFLLEdBQUcsR0FBRyxDQUFDLElBQUksQ0FBQztZQUN2QixJQUFNLFVBQVUsR0FBRyxLQUFLLENBQUMsYUFBYSxFQUFFLENBQUM7WUFDekMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxpQkFBaUIsRUFBRTtnQkFDakMsTUFBTSxJQUFJLEtBQUssQ0FDWCw4Q0FBNEMsR0FBRyxDQUFDLFNBQVMsY0FBUyxVQUFVLENBQUMsUUFBUSw0QkFBeUIsQ0FBQyxDQUFDO2FBQ3JIO1lBRUQsSUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsRUFBRTtnQkFDekIsT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUcsQ0FBQzthQUNoQztZQUVELHNGQUFzRjtZQUN0RixJQUFNLFVBQVUsR0FBb0IsRUFBRSxDQUFDO1lBQ3ZDLElBQU0sS0FBSyxHQUFlLEVBQUUsQ0FBQztZQUU3QixJQUFNLElBQUksR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLG1CQUFtQixDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQ3pE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bnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCAqIGFzIHRzIGZyb20gJ3R5cGVzY3JpcHQnO1xuXG5pbXBvcnQge0FsaWFzaW5nSG9zdCwgUmVmZXJlbmNlfSBmcm9tICcuLi8uLi9pbXBvcnRzJztcbmltcG9ydCB7RGlyZWN0aXZlTWV0YSwgTWV0YWRhdGFSZWFkZXIsIFBpcGVNZXRhfSBmcm9tICcuLi8uLi9tZXRhZGF0YSc7XG5pbXBvcnQge0NsYXNzRGVjbGFyYXRpb259IGZyb20gJy4uLy4uL3JlZmxlY3Rpb24nO1xuXG5pbXBvcnQge0V4cG9ydFNjb3BlfSBmcm9tICcuL2FwaSc7XG5cbmV4cG9ydCBpbnRlcmZhY2UgRHRzTW9kdWxlU2NvcGVSZXNvbHZlciB7XG4gIHJlc29sdmUocmVmOiBSZWZlcmVuY2U8Q2xhc3NEZWNsYXJhdGlvbj4pOiBFeHBvcnRTY29wZXxudWxsO1xufVxuXG4vKipcbiAqIFJlYWRzIEFuZ3VsYXIgbWV0YWRhdGEgZnJvbSBjbGFzc2VzIGRlY2xhcmVkIGluIC5kLnRzIGZpbGVzIGFuZCBjb21wdXRlcyBhbiBgRXhwb3J0U2NvcGVgLlxuICpcbiAqIEdpdmVuIGFuIE5nTW9kdWxlIGRlY2xhcmVkIGluIGEgLmQudHMgZmlsZSwgdGhpcyByZXNvbHZlciBjYW4gcHJvZHVjZSBhIHRyYW5zaXRpdmUgYEV4cG9ydFNjb3BlYFxuICogb2YgYWxsIG9mIHRoZSBkaXJlY3RpdmVzL3BpcGVzIGl0IGV4cG9ydHMuIEl0IGRvZXMgdGhpcyBieSByZWFkaW5nIG1ldGFkYXRhIG9mZiBvZiBJdnkgc3RhdGljXG4gKiBmaWVsZHMgb24gZGlyZWN0aXZlcywgY29tcG9uZW50cywgcGlwZXMsIGFuZCBOZ01vZHVsZXMuXG4gKi9cbmV4cG9ydCBjbGFzcyBNZXRhZGF0YUR0c01vZHVsZVNjb3BlUmVzb2x2ZXIgaW1wbGVtZW50cyBEdHNNb2R1bGVTY29wZVJlc29sdmVyIHtcbiAgLyoqXG4gICAqIENhY2hlIHdoaWNoIGhvbGRzIGZ1bGx5IHJlc29sdmVkIHNjb3BlcyBmb3IgTmdNb2R1bGUgY2xhc3NlcyBmcm9tIC5kLnRzIGZpbGVzLlxuICAgKi9cbiAgcHJpdmF0ZSBjYWNoZSA9IG5ldyBNYXA8Q2xhc3NEZWNsYXJhdGlvbiwgRXhwb3J0U2NvcGV8bnVsbD4oKTtcblxuICAvKipcbiAgICogQHBhcmFtIGR0c01ldGFSZWFkZXIgYSBgTWV0YWRhdGFSZWFkZXJgIHdoaWNoIGNhbiByZWFkIG1ldGFkYXRhIGZyb20gYC5kLnRzYCBmaWxlcy5cbiAgICovXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgZHRzTWV0YVJlYWRlcjogTWV0YWRhdGFSZWFkZXIsIHByaXZhdGUgYWxpYXNpbmdIb3N0OiBBbGlhc2luZ0hvc3R8bnVsbCkge31cblxuICAvKipcbiAgICogUmVzb2x2ZSBhIGBSZWZlcmVuY2VgJ2QgTmdNb2R1bGUgZnJvbSBhIC5kLnRzIGZpbGUgYW5kIHByb2R1Y2UgYSB0cmFuc2l0aXZlIGBFeHBvcnRTY29wZWBcbiAgICogbGlzdGluZyB0aGUgZGlyZWN0aXZlcyBhbmQgcGlwZXMgd2hpY2ggdGhhdCBOZ01vZHVsZSBleHBvcnRzIHRvIG90aGVycy5cbiAgICpcbiAgICogVGhpcyBvcGVyYXRpb24gcmVsaWVzIG9uIGEgYFJlZmVyZW5jZWAgaW5zdGVhZCBvZiBhIGRpcmVjdCBUeXBlU2NycHQgbm9kZSBhcyB0aGUgYFJlZmVyZW5jZWBzXG4gICAqIHByb2R1Y2VkIGRlcGVuZCBvbiBob3cgdGhlIG9yaWdpbmFsIE5nTW9kdWxlIHdhcyBpbXBvcnRlZC5cbiAgICovXG4gIHJlc29sdmUocmVmOiBSZWZlcmVuY2U8Q2xhc3NEZWNsYXJhdGlvbj4pOiBFeHBvcnRTY29wZXxudWxsIHtcbiAgICBjb25zdCBjbGF6eiA9IHJlZi5ub2RlO1xuICAgIGNvbnN0IHNvdXJjZUZpbGUgPSBjbGF6ei5nZXRTb3VyY2VGaWxlKCk7XG4gICAgaWYgKCFzb3VyY2VGaWxlLmlzRGVjbGFyYXRpb25GaWxlKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgYERlYnVnIGVycm9yOiBEdHNNb2R1bGVTY29wZVJlc29sdmVyLnJlYWQoJHtyZWYuZGVidWdOYW1lfSBmcm9tICR7c291cmNlRmlsZS5maWxlTmFtZX0pLCBidXQgbm90IGEgLmQudHMgZmlsZWApO1xuICAgIH1cblxuICAgIGlmICh0aGlzLmNhY2hlLmhhcyhjbGF6eikpIHtcbiAgICAgIHJldHVybiB0aGlzLmNhY2hlLmdldChjbGF6eikgITtcbiAgICB9XG5cbiAgICAvLyBCdWlsZCB1cCB0aGUgZXhwb3J0IHNjb3BlIC0gdGhvc2UgZGlyZWN0aXZlcyBhbmQgcGlwZXMgbWFkZSB2aXNpYmxlIGJ5IHRoaXMgbW9kdWxlLlxuICAgIGNvbnN0IGRpcmVjdGl2ZXM6IERpcmVjdGl2ZU1ldGFbXSA9IFtdO1xuICAgIGNvbnN0IHBpcGVzOiBQaXBlTWV0YVtdID0gW107XG5cbiAgICBjb25zdCBtZXRhID0gdGhpcy5kdHNNZXRhUmVhZGVyLmdldE5nTW9kdWxlTWV0YWRhdGEocmVmKTtcbiAgICBpZiAobWV0YSA9PT0gbnVsbCkge1xuICAgICAgdGhpcy5jYWNoZS5zZXQoY2xhenosIG51bGwpO1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgY29uc3QgZGVjbGFyYXRpb25zID0gbmV3IFNldDxDbGFzc0RlY2xhcmF0aW9uPigpO1xuICAgIGZvciAoY29uc3QgZGVjbFJlZiBvZiBtZXRhLmRlY2xhcmF0aW9ucykge1xuICAgICAgZGVjbGFyYXRpb25zLmFkZChkZWNsUmVmLm5vZGUpO1xuICAgIH1cblxuICAgIC8vIE9ubHkgdGhlICdleHBvcnRzJyBmaWVsZCBvZiB0aGUgTmdNb2R1bGUncyBtZXRhZGF0YSBpcyBpbXBvcnRhbnQuIEltcG9ydHMgYW5kIGRlY2xhcmF0aW9uc1xuICAgIC8vIGRvbid0IGFmZmVjdCB0aGUgZXhwb3J0IHNjb3BlLlxuICAgIGZvciAoY29uc3QgZXhwb3J0UmVmIG9mIG1ldGEuZXhwb3J0cykge1xuICAgICAgLy8gQXR0ZW1wdCB0byBwcm9jZXNzIHRoZSBleHBvcnQgYXMgYSBkaXJlY3RpdmUuXG4gICAgICBjb25zdCBkaXJlY3RpdmUgPSB0aGlzLmR0c01ldGFSZWFkZXIuZ2V0RGlyZWN0aXZlTWV0YWRhdGEoZXhwb3J0UmVmKTtcbiAgICAgIGlmIChkaXJlY3RpdmUgIT09IG51bGwpIHtcbiAgICAgICAgY29uc3QgaXNSZUV4cG9ydCA9ICFkZWNsYXJhdGlvbnMuaGFzKGV4cG9ydFJlZi5ub2RlKTtcbiAgICAgICAgZGlyZWN0aXZlcy5wdXNoKHRoaXMubWF5YmVBbGlhcyhkaXJlY3RpdmUsIHNvdXJjZUZpbGUsIGlzUmVFeHBvcnQpKTtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG5cbiAgICAgIC8vIEF0dGVtcHQgdG8gcHJvY2VzcyB0aGUgZXhwb3J0IGFzIGEgcGlwZS5cbiAgICAgIGNvbnN0IHBpcGUgPSB0aGlzLmR0c01ldGFSZWFkZXIuZ2V0UGlwZU1ldGFkYXRhKGV4cG9ydFJlZik7XG4gICAgICBpZiAocGlwZSAhPT0gbnVsbCkge1xuICAgICAgICBjb25zdCBpc1JlRXhwb3J0ID0gIWRlY2xhcmF0aW9ucy5oYXMoZXhwb3J0UmVmLm5vZGUpO1xuICAgICAgICBwaXBlcy5wdXNoKHRoaXMubWF5YmVBbGlhcyhwaXBlLCBzb3VyY2VGaWxlLCBpc1JlRXhwb3J0KSk7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuXG4gICAgICAvLyBBdHRlbXB0IHRvIHByb2Nlc3MgdGhlIGV4cG9ydCBhcyBhIG1vZHVsZS5cbiAgICAgIGNvbnN0IGV4cG9ydFNjb3BlID0gdGhpcy5yZXNvbHZlKGV4cG9ydFJlZik7XG4gICAgICBpZiAoZXhwb3J0U2NvcGUgIT09IG51bGwpIHtcbiAgICAgICAgLy8gSXQgaXMgYSBtb2R1bGUuIEFkZCBleHBvcnRlZCBkaXJlY3RpdmVzIGFuZCBwaXBlcyB0byB0aGUgY3VycmVudCBzY29wZS4gVGhpcyBtaWdodFxuICAgICAgICAvLyBpbnZvbHZlIHJld3JpdGluZyB0aGUgYFJlZmVyZW5jZWBzIHRvIHRob3NlIHR5cGVzIHRvIGhhdmUgYW4gYWxpYXMgZXhwcmVzc2lvbiBpZiBvbmUgaXNcbiAgICAgICAgLy8gcmVxdWlyZWQuXG4gICAgICAgIGlmICh0aGlzLmFsaWFzaW5nSG9zdCA9PT0gbnVsbCkge1xuICAgICAgICAgIC8vIEZhc3QgcGF0aCB3aGVuIGFsaWFzZXMgYXJlbid0IHJlcXVpcmVkLlxuICAgICAgICAgIGRpcmVjdGl2ZXMucHVzaCguLi5leHBvcnRTY29wZS5leHBvcnRlZC5kaXJlY3RpdmVzKTtcbiAgICAgICAgICBwaXBlcy5wdXNoKC4uLmV4cG9ydFNjb3BlLmV4cG9ydGVkLnBpcGVzKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAvLyBJdCdzIG5lY2Vzc2FyeSB0byByZXdyaXRlIHRoZSBgUmVmZXJlbmNlYHMgdG8gYWRkIGFsaWFzIGV4cHJlc3Npb25zLiBUaGlzIHdheSwgaW1wb3J0c1xuICAgICAgICAgIC8vIGdlbmVyYXRlZCB0byB0aGVzZSBkaXJlY3RpdmVzIGFuZCBwaXBlcyB3aWxsIHVzZSBhIHNoYWxsb3cgaW1wb3J0IHRvIGBzb3VyY2VGaWxlYFxuICAgICAgICAgIC8vIGluc3RlYWQgb2YgYSBkZWVwIGltcG9ydCBkaXJlY3RseSB0byB0aGUgZGlyZWN0aXZlIG9yIHBpcGUgY2xhc3MuXG4gICAgICAgICAgLy9cbiAgICAgICAgICAvLyBPbmUgaW1wb3J0YW50IGNoZWNrIGhlcmUgaXMgd2hldGhlciB0aGUgZGlyZWN0aXZlL3BpcGUgaXMgZGVjbGFyZWQgaW4gdGhlIHNhbWVcbiAgICAgICAgICAvLyBzb3VyY2UgZmlsZSBhcyB0aGUgcmUtZXhwb3J0aW5nIE5nTW9kdWxlLiBUaGlzIGNhbiBoYXBwZW4gaWYgYm90aCBhIGRpcmVjdGl2ZSwgaXRzXG4gICAgICAgICAgLy8gTmdNb2R1bGUsIGFuZCB0aGUgcmUtZXhwb3J0aW5nIE5nTW9kdWxlIGFyZSBhbGwgaW4gdGhlIHNhbWUgZmlsZS4gSW4gdGhpcyBjYXNlLFxuICAgICAgICAgIC8vIG5vIGltcG9ydCBhbGlhcyBpcyBuZWVkZWQgYXMgaXQgd291bGQgZ28gdG8gdGhlIHNhbWUgZmlsZSBhbnl3YXkuXG4gICAgICAgICAgZm9yIChjb25zdCBkaXJlY3RpdmUgb2YgZXhwb3J0U2NvcGUuZXhwb3J0ZWQuZGlyZWN0aXZlcykge1xuICAgICAgICAgICAgZGlyZWN0aXZlcy5wdXNoKHRoaXMubWF5YmVBbGlhcyhkaXJlY3RpdmUsIHNvdXJjZUZpbGUsIC8qIGlzUmVFeHBvcnQgKi8gdHJ1ZSkpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBmb3IgKGNvbnN0IHBpcGUgb2YgZXhwb3J0U2NvcGUuZXhwb3J0ZWQucGlwZXMpIHtcbiAgICAgICAgICAgIHBpcGVzLnB1c2godGhpcy5tYXliZUFsaWFzKHBpcGUsIHNvdXJjZUZpbGUsIC8qIGlzUmVFeHBvcnQgKi8gdHJ1ZSkpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgY29udGludWU7XG5cbiAgICAgIC8vIFRoZSBleHBvcnQgd2FzIG5vdCBhIGRpcmVjdGl2ZSwgYSBwaXBlLCBvciBhIG1vZHVsZS4gVGhpcyBpcyBhbiBlcnJvci5cbiAgICAgIC8vIFRPRE8oYWx4aHViKTogcHJvZHVjZSBhIHRzLkRpYWdub3N0aWNcbiAgICAgIHRocm93IG5ldyBFcnJvcihgRXhwb3J0ZWQgdmFsdWUgJHtleHBvcnRSZWYuZGVidWdOYW1lfSB3YXMgbm90IGEgZGlyZWN0aXZlLCBwaXBlLCBvciBtb2R1bGVgKTtcbiAgICB9XG5cbiAgICBjb25zdCBleHBvcnRTY29wZTogRXhwb3J0U2NvcGUgPSB7XG4gICAgICBleHBvcnRlZDoge2RpcmVjdGl2ZXMsIHBpcGVzfSxcbiAgICB9O1xuICAgIHRoaXMuY2FjaGUuc2V0KGNsYXp6LCBleHBvcnRTY29wZSk7XG4gICAgcmV0dXJuIGV4cG9ydFNjb3BlO1xuICB9XG5cbiAgcHJpdmF0ZSBtYXliZUFsaWFzPFQgZXh0ZW5kcyBEaXJlY3RpdmVNZXRhfFBpcGVNZXRhPihcbiAgICAgIGRpck9yUGlwZTogVCwgbWF5YmVBbGlhc0Zyb206IHRzLlNvdXJjZUZpbGUsIGlzUmVFeHBvcnQ6IGJvb2xlYW4pOiBUIHtcbiAgICBjb25zdCByZWYgPSBkaXJPclBpcGUucmVmO1xuICAgIGlmICh0aGlzLmFsaWFzaW5nSG9zdCA9PT0gbnVsbCB8fCByZWYubm9kZS5nZXRTb3VyY2VGaWxlKCkgPT09IG1heWJlQWxpYXNGcm9tKSB7XG4gICAgICByZXR1cm4gZGlyT3JQaXBlO1xuICAgIH1cblxuICAgIGNvbnN0IGFsaWFzID0gdGhpcy5hbGlhc2luZ0hvc3QuZ2V0QWxpYXNJbihyZWYubm9kZSwgbWF5YmVBbGlhc0Zyb20sIGlzUmVFeHBvcnQpO1xuICAgIGlmIChhbGlhcyA9PT0gbnVsbCkge1xuICAgICAgcmV0dXJuIGRpck9yUGlwZTtcbiAgICB9XG5cbiAgICByZXR1cm4ge1xuICAgICAgLi4uZGlyT3JQaXBlLFxuICAgICAgcmVmOiByZWYuY2xvbmVXaXRoQWxpYXMoYWxpYXMpLFxuICAgIH07XG4gIH1cbn1cbiJdfQ==