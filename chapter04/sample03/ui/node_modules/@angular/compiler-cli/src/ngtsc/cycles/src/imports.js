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
        define("@angular/compiler-cli/src/ngtsc/cycles/src/imports", ["require", "exports", "typescript"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var ts = require("typescript");
    /**
     * A cached graph of imports in the `ts.Program`.
     *
     * The `ImportGraph` keeps track of dependencies (imports) of individual `ts.SourceFile`s. Only
     * dependencies within the same program are tracked; imports into packages on NPM are not.
     */
    var ImportGraph = /** @class */ (function () {
        function ImportGraph(resolver) {
            this.resolver = resolver;
            this.map = new Map();
        }
        /**
         * List the direct (not transitive) imports of a given `ts.SourceFile`.
         *
         * This operation is cached.
         */
        ImportGraph.prototype.importsOf = function (sf) {
            if (!this.map.has(sf)) {
                this.map.set(sf, this.scanImports(sf));
            }
            return this.map.get(sf);
        };
        /**
         * Lists the transitive imports of a given `ts.SourceFile`.
         */
        ImportGraph.prototype.transitiveImportsOf = function (sf) {
            var imports = new Set();
            this.transitiveImportsOfHelper(sf, imports);
            return imports;
        };
        ImportGraph.prototype.transitiveImportsOfHelper = function (sf, results) {
            var _this = this;
            if (results.has(sf)) {
                return;
            }
            results.add(sf);
            this.importsOf(sf).forEach(function (imported) { _this.transitiveImportsOfHelper(imported, results); });
        };
        /**
         * Add a record of an import from `sf` to `imported`, that's not present in the original
         * `ts.Program` but will be remembered by the `ImportGraph`.
         */
        ImportGraph.prototype.addSyntheticImport = function (sf, imported) {
            if (isLocalFile(imported)) {
                this.importsOf(sf).add(imported);
            }
        };
        ImportGraph.prototype.scanImports = function (sf) {
            var _this = this;
            var imports = new Set();
            // Look through the source file for import statements.
            sf.statements.forEach(function (stmt) {
                if ((ts.isImportDeclaration(stmt) || ts.isExportDeclaration(stmt)) &&
                    stmt.moduleSpecifier !== undefined && ts.isStringLiteral(stmt.moduleSpecifier)) {
                    // Resolve the module to a file, and check whether that file is in the ts.Program.
                    var moduleName = stmt.moduleSpecifier.text;
                    var moduleFile = _this.resolver.resolveModule(moduleName, sf.fileName);
                    if (moduleFile !== null && isLocalFile(moduleFile)) {
                        // Record this local import.
                        imports.add(moduleFile);
                    }
                }
            });
            return imports;
        };
        return ImportGraph;
    }());
    exports.ImportGraph = ImportGraph;
    function isLocalFile(sf) {
        return !sf.fileName.endsWith('.d.ts');
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW1wb3J0cy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbXBpbGVyLWNsaS9zcmMvbmd0c2MvY3ljbGVzL3NyYy9pbXBvcnRzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7O0lBRUgsK0JBQWlDO0lBSWpDOzs7OztPQUtHO0lBQ0g7UUFHRSxxQkFBb0IsUUFBd0I7WUFBeEIsYUFBUSxHQUFSLFFBQVEsQ0FBZ0I7WUFGcEMsUUFBRyxHQUFHLElBQUksR0FBRyxFQUFxQyxDQUFDO1FBRVosQ0FBQztRQUVoRDs7OztXQUlHO1FBQ0gsK0JBQVMsR0FBVCxVQUFVLEVBQWlCO1lBQ3pCLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRTtnQkFDckIsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsRUFBRSxFQUFFLElBQUksQ0FBQyxXQUFXLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQzthQUN4QztZQUNELE9BQU8sSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFHLENBQUM7UUFDNUIsQ0FBQztRQUVEOztXQUVHO1FBQ0gseUNBQW1CLEdBQW5CLFVBQW9CLEVBQWlCO1lBQ25DLElBQU0sT0FBTyxHQUFHLElBQUksR0FBRyxFQUFpQixDQUFDO1lBQ3pDLElBQUksQ0FBQyx5QkFBeUIsQ0FBQyxFQUFFLEVBQUUsT0FBTyxDQUFDLENBQUM7WUFDNUMsT0FBTyxPQUFPLENBQUM7UUFDakIsQ0FBQztRQUVPLCtDQUF5QixHQUFqQyxVQUFrQyxFQUFpQixFQUFFLE9BQTJCO1lBQWhGLGlCQU1DO1lBTEMsSUFBSSxPQUFPLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxFQUFFO2dCQUNuQixPQUFPO2FBQ1I7WUFDRCxPQUFPLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBQ2hCLElBQUksQ0FBQyxTQUFTLENBQUMsRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDLFVBQUEsUUFBUSxJQUFNLEtBQUksQ0FBQyx5QkFBeUIsQ0FBQyxRQUFRLEVBQUUsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNqRyxDQUFDO1FBRUQ7OztXQUdHO1FBQ0gsd0NBQWtCLEdBQWxCLFVBQW1CLEVBQWlCLEVBQUUsUUFBdUI7WUFDM0QsSUFBSSxXQUFXLENBQUMsUUFBUSxDQUFDLEVBQUU7Z0JBQ3pCLElBQUksQ0FBQyxTQUFTLENBQUMsRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDO2FBQ2xDO1FBQ0gsQ0FBQztRQUVPLGlDQUFXLEdBQW5CLFVBQW9CLEVBQWlCO1lBQXJDLGlCQWdCQztZQWZDLElBQU0sT0FBTyxHQUFHLElBQUksR0FBRyxFQUFpQixDQUFDO1lBQ3pDLHNEQUFzRDtZQUN0RCxFQUFFLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxVQUFBLElBQUk7Z0JBQ3hCLElBQUksQ0FBQyxFQUFFLENBQUMsbUJBQW1CLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDLG1CQUFtQixDQUFDLElBQUksQ0FBQyxDQUFDO29CQUM5RCxJQUFJLENBQUMsZUFBZSxLQUFLLFNBQVMsSUFBSSxFQUFFLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsRUFBRTtvQkFDbEYsa0ZBQWtGO29CQUNsRixJQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQztvQkFDN0MsSUFBTSxVQUFVLEdBQUcsS0FBSSxDQUFDLFFBQVEsQ0FBQyxhQUFhLENBQUMsVUFBVSxFQUFFLEVBQUUsQ0FBQyxRQUFRLENBQUMsQ0FBQztvQkFDeEUsSUFBSSxVQUFVLEtBQUssSUFBSSxJQUFJLFdBQVcsQ0FBQyxVQUFVLENBQUMsRUFBRTt3QkFDbEQsNEJBQTRCO3dCQUM1QixPQUFPLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxDQUFDO3FCQUN6QjtpQkFDRjtZQUNILENBQUMsQ0FBQyxDQUFDO1lBQ0gsT0FBTyxPQUFPLENBQUM7UUFDakIsQ0FBQztRQUNILGtCQUFDO0lBQUQsQ0FBQyxBQTdERCxJQTZEQztJQTdEWSxrQ0FBVztJQStEeEIsU0FBUyxXQUFXLENBQUMsRUFBaUI7UUFDcEMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBQ3hDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCAqIGFzIHRzIGZyb20gJ3R5cGVzY3JpcHQnO1xuXG5pbXBvcnQge01vZHVsZVJlc29sdmVyfSBmcm9tICcuLi8uLi9pbXBvcnRzJztcblxuLyoqXG4gKiBBIGNhY2hlZCBncmFwaCBvZiBpbXBvcnRzIGluIHRoZSBgdHMuUHJvZ3JhbWAuXG4gKlxuICogVGhlIGBJbXBvcnRHcmFwaGAga2VlcHMgdHJhY2sgb2YgZGVwZW5kZW5jaWVzIChpbXBvcnRzKSBvZiBpbmRpdmlkdWFsIGB0cy5Tb3VyY2VGaWxlYHMuIE9ubHlcbiAqIGRlcGVuZGVuY2llcyB3aXRoaW4gdGhlIHNhbWUgcHJvZ3JhbSBhcmUgdHJhY2tlZDsgaW1wb3J0cyBpbnRvIHBhY2thZ2VzIG9uIE5QTSBhcmUgbm90LlxuICovXG5leHBvcnQgY2xhc3MgSW1wb3J0R3JhcGgge1xuICBwcml2YXRlIG1hcCA9IG5ldyBNYXA8dHMuU291cmNlRmlsZSwgU2V0PHRzLlNvdXJjZUZpbGU+PigpO1xuXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgcmVzb2x2ZXI6IE1vZHVsZVJlc29sdmVyKSB7fVxuXG4gIC8qKlxuICAgKiBMaXN0IHRoZSBkaXJlY3QgKG5vdCB0cmFuc2l0aXZlKSBpbXBvcnRzIG9mIGEgZ2l2ZW4gYHRzLlNvdXJjZUZpbGVgLlxuICAgKlxuICAgKiBUaGlzIG9wZXJhdGlvbiBpcyBjYWNoZWQuXG4gICAqL1xuICBpbXBvcnRzT2Yoc2Y6IHRzLlNvdXJjZUZpbGUpOiBTZXQ8dHMuU291cmNlRmlsZT4ge1xuICAgIGlmICghdGhpcy5tYXAuaGFzKHNmKSkge1xuICAgICAgdGhpcy5tYXAuc2V0KHNmLCB0aGlzLnNjYW5JbXBvcnRzKHNmKSk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLm1hcC5nZXQoc2YpICE7XG4gIH1cblxuICAvKipcbiAgICogTGlzdHMgdGhlIHRyYW5zaXRpdmUgaW1wb3J0cyBvZiBhIGdpdmVuIGB0cy5Tb3VyY2VGaWxlYC5cbiAgICovXG4gIHRyYW5zaXRpdmVJbXBvcnRzT2Yoc2Y6IHRzLlNvdXJjZUZpbGUpOiBTZXQ8dHMuU291cmNlRmlsZT4ge1xuICAgIGNvbnN0IGltcG9ydHMgPSBuZXcgU2V0PHRzLlNvdXJjZUZpbGU+KCk7XG4gICAgdGhpcy50cmFuc2l0aXZlSW1wb3J0c09mSGVscGVyKHNmLCBpbXBvcnRzKTtcbiAgICByZXR1cm4gaW1wb3J0cztcbiAgfVxuXG4gIHByaXZhdGUgdHJhbnNpdGl2ZUltcG9ydHNPZkhlbHBlcihzZjogdHMuU291cmNlRmlsZSwgcmVzdWx0czogU2V0PHRzLlNvdXJjZUZpbGU+KTogdm9pZCB7XG4gICAgaWYgKHJlc3VsdHMuaGFzKHNmKSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICByZXN1bHRzLmFkZChzZik7XG4gICAgdGhpcy5pbXBvcnRzT2Yoc2YpLmZvckVhY2goaW1wb3J0ZWQgPT4geyB0aGlzLnRyYW5zaXRpdmVJbXBvcnRzT2ZIZWxwZXIoaW1wb3J0ZWQsIHJlc3VsdHMpOyB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBZGQgYSByZWNvcmQgb2YgYW4gaW1wb3J0IGZyb20gYHNmYCB0byBgaW1wb3J0ZWRgLCB0aGF0J3Mgbm90IHByZXNlbnQgaW4gdGhlIG9yaWdpbmFsXG4gICAqIGB0cy5Qcm9ncmFtYCBidXQgd2lsbCBiZSByZW1lbWJlcmVkIGJ5IHRoZSBgSW1wb3J0R3JhcGhgLlxuICAgKi9cbiAgYWRkU3ludGhldGljSW1wb3J0KHNmOiB0cy5Tb3VyY2VGaWxlLCBpbXBvcnRlZDogdHMuU291cmNlRmlsZSk6IHZvaWQge1xuICAgIGlmIChpc0xvY2FsRmlsZShpbXBvcnRlZCkpIHtcbiAgICAgIHRoaXMuaW1wb3J0c09mKHNmKS5hZGQoaW1wb3J0ZWQpO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgc2NhbkltcG9ydHMoc2Y6IHRzLlNvdXJjZUZpbGUpOiBTZXQ8dHMuU291cmNlRmlsZT4ge1xuICAgIGNvbnN0IGltcG9ydHMgPSBuZXcgU2V0PHRzLlNvdXJjZUZpbGU+KCk7XG4gICAgLy8gTG9vayB0aHJvdWdoIHRoZSBzb3VyY2UgZmlsZSBmb3IgaW1wb3J0IHN0YXRlbWVudHMuXG4gICAgc2Yuc3RhdGVtZW50cy5mb3JFYWNoKHN0bXQgPT4ge1xuICAgICAgaWYgKCh0cy5pc0ltcG9ydERlY2xhcmF0aW9uKHN0bXQpIHx8IHRzLmlzRXhwb3J0RGVjbGFyYXRpb24oc3RtdCkpICYmXG4gICAgICAgICAgc3RtdC5tb2R1bGVTcGVjaWZpZXIgIT09IHVuZGVmaW5lZCAmJiB0cy5pc1N0cmluZ0xpdGVyYWwoc3RtdC5tb2R1bGVTcGVjaWZpZXIpKSB7XG4gICAgICAgIC8vIFJlc29sdmUgdGhlIG1vZHVsZSB0byBhIGZpbGUsIGFuZCBjaGVjayB3aGV0aGVyIHRoYXQgZmlsZSBpcyBpbiB0aGUgdHMuUHJvZ3JhbS5cbiAgICAgICAgY29uc3QgbW9kdWxlTmFtZSA9IHN0bXQubW9kdWxlU3BlY2lmaWVyLnRleHQ7XG4gICAgICAgIGNvbnN0IG1vZHVsZUZpbGUgPSB0aGlzLnJlc29sdmVyLnJlc29sdmVNb2R1bGUobW9kdWxlTmFtZSwgc2YuZmlsZU5hbWUpO1xuICAgICAgICBpZiAobW9kdWxlRmlsZSAhPT0gbnVsbCAmJiBpc0xvY2FsRmlsZShtb2R1bGVGaWxlKSkge1xuICAgICAgICAgIC8vIFJlY29yZCB0aGlzIGxvY2FsIGltcG9ydC5cbiAgICAgICAgICBpbXBvcnRzLmFkZChtb2R1bGVGaWxlKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pO1xuICAgIHJldHVybiBpbXBvcnRzO1xuICB9XG59XG5cbmZ1bmN0aW9uIGlzTG9jYWxGaWxlKHNmOiB0cy5Tb3VyY2VGaWxlKTogYm9vbGVhbiB7XG4gIHJldHVybiAhc2YuZmlsZU5hbWUuZW5kc1dpdGgoJy5kLnRzJyk7XG59XG4iXX0=