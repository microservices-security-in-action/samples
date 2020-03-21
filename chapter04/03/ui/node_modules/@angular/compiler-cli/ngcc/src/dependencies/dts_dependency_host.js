(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/compiler-cli/ngcc/src/dependencies/dts_dependency_host", ["require", "exports", "tslib", "@angular/compiler-cli/ngcc/src/dependencies/esm_dependency_host", "@angular/compiler-cli/ngcc/src/dependencies/module_resolver"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var tslib_1 = require("tslib");
    var esm_dependency_host_1 = require("@angular/compiler-cli/ngcc/src/dependencies/esm_dependency_host");
    var module_resolver_1 = require("@angular/compiler-cli/ngcc/src/dependencies/module_resolver");
    /**
     * Helper functions for computing dependencies via typings files.
     */
    var DtsDependencyHost = /** @class */ (function (_super) {
        tslib_1.__extends(DtsDependencyHost, _super);
        function DtsDependencyHost(fs, pathMappings) {
            return _super.call(this, fs, new module_resolver_1.ModuleResolver(fs, pathMappings, ['', '.d.ts', '/index.d.ts', '.js', '/index.js'])) || this;
        }
        /**
         * Attempts to process the `importPath` directly and also inside `@types/...`.
         */
        DtsDependencyHost.prototype.processImport = function (importPath, file, dependencies, missing, deepImports, alreadySeen) {
            return _super.prototype.processImport.call(this, importPath, file, dependencies, missing, deepImports, alreadySeen) ||
                _super.prototype.processImport.call(this, "@types/" + importPath, file, dependencies, missing, deepImports, alreadySeen);
        };
        return DtsDependencyHost;
    }(esm_dependency_host_1.EsmDependencyHost));
    exports.DtsDependencyHost = DtsDependencyHost;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZHRzX2RlcGVuZGVuY3lfaG9zdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbXBpbGVyLWNsaS9uZ2NjL3NyYy9kZXBlbmRlbmNpZXMvZHRzX2RlcGVuZGVuY3lfaG9zdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7SUFTQSx1R0FBd0Q7SUFDeEQsK0ZBQWlEO0lBRWpEOztPQUVHO0lBQ0g7UUFBdUMsNkNBQWlCO1FBQ3RELDJCQUFZLEVBQWMsRUFBRSxZQUEyQjttQkFDckQsa0JBQ0ksRUFBRSxFQUFFLElBQUksZ0NBQWMsQ0FBQyxFQUFFLEVBQUUsWUFBWSxFQUFFLENBQUMsRUFBRSxFQUFFLE9BQU8sRUFBRSxhQUFhLEVBQUUsS0FBSyxFQUFFLFdBQVcsQ0FBQyxDQUFDLENBQUM7UUFDakcsQ0FBQztRQUVEOztXQUVHO1FBQ08seUNBQWEsR0FBdkIsVUFDSSxVQUFrQixFQUFFLElBQW9CLEVBQUUsWUFBaUMsRUFDM0UsT0FBb0IsRUFBRSxXQUF3QixFQUFFLFdBQWdDO1lBQ2xGLE9BQU8saUJBQU0sYUFBYSxZQUFDLFVBQVUsRUFBRSxJQUFJLEVBQUUsWUFBWSxFQUFFLE9BQU8sRUFBRSxXQUFXLEVBQUUsV0FBVyxDQUFDO2dCQUN6RixpQkFBTSxhQUFhLFlBQ2YsWUFBVSxVQUFZLEVBQUUsSUFBSSxFQUFFLFlBQVksRUFBRSxPQUFPLEVBQUUsV0FBVyxFQUFFLFdBQVcsQ0FBQyxDQUFDO1FBQ3pGLENBQUM7UUFDSCx3QkFBQztJQUFELENBQUMsQUFoQkQsQ0FBdUMsdUNBQWlCLEdBZ0J2RDtJQWhCWSw4Q0FBaUIiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5pbXBvcnQge0Fic29sdXRlRnNQYXRoLCBGaWxlU3lzdGVtfSBmcm9tICcuLi8uLi8uLi9zcmMvbmd0c2MvZmlsZV9zeXN0ZW0nO1xuaW1wb3J0IHtQYXRoTWFwcGluZ3N9IGZyb20gJy4uL3V0aWxzJztcbmltcG9ydCB7RXNtRGVwZW5kZW5jeUhvc3R9IGZyb20gJy4vZXNtX2RlcGVuZGVuY3lfaG9zdCc7XG5pbXBvcnQge01vZHVsZVJlc29sdmVyfSBmcm9tICcuL21vZHVsZV9yZXNvbHZlcic7XG5cbi8qKlxuICogSGVscGVyIGZ1bmN0aW9ucyBmb3IgY29tcHV0aW5nIGRlcGVuZGVuY2llcyB2aWEgdHlwaW5ncyBmaWxlcy5cbiAqL1xuZXhwb3J0IGNsYXNzIER0c0RlcGVuZGVuY3lIb3N0IGV4dGVuZHMgRXNtRGVwZW5kZW5jeUhvc3Qge1xuICBjb25zdHJ1Y3RvcihmczogRmlsZVN5c3RlbSwgcGF0aE1hcHBpbmdzPzogUGF0aE1hcHBpbmdzKSB7XG4gICAgc3VwZXIoXG4gICAgICAgIGZzLCBuZXcgTW9kdWxlUmVzb2x2ZXIoZnMsIHBhdGhNYXBwaW5ncywgWycnLCAnLmQudHMnLCAnL2luZGV4LmQudHMnLCAnLmpzJywgJy9pbmRleC5qcyddKSk7XG4gIH1cblxuICAvKipcbiAgICogQXR0ZW1wdHMgdG8gcHJvY2VzcyB0aGUgYGltcG9ydFBhdGhgIGRpcmVjdGx5IGFuZCBhbHNvIGluc2lkZSBgQHR5cGVzLy4uLmAuXG4gICAqL1xuICBwcm90ZWN0ZWQgcHJvY2Vzc0ltcG9ydChcbiAgICAgIGltcG9ydFBhdGg6IHN0cmluZywgZmlsZTogQWJzb2x1dGVGc1BhdGgsIGRlcGVuZGVuY2llczogU2V0PEFic29sdXRlRnNQYXRoPixcbiAgICAgIG1pc3Npbmc6IFNldDxzdHJpbmc+LCBkZWVwSW1wb3J0czogU2V0PHN0cmluZz4sIGFscmVhZHlTZWVuOiBTZXQ8QWJzb2x1dGVGc1BhdGg+KTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHN1cGVyLnByb2Nlc3NJbXBvcnQoaW1wb3J0UGF0aCwgZmlsZSwgZGVwZW5kZW5jaWVzLCBtaXNzaW5nLCBkZWVwSW1wb3J0cywgYWxyZWFkeVNlZW4pIHx8XG4gICAgICAgIHN1cGVyLnByb2Nlc3NJbXBvcnQoXG4gICAgICAgICAgICBgQHR5cGVzLyR7aW1wb3J0UGF0aH1gLCBmaWxlLCBkZXBlbmRlbmNpZXMsIG1pc3NpbmcsIGRlZXBJbXBvcnRzLCBhbHJlYWR5U2Vlbik7XG4gIH1cbn1cbiJdfQ==