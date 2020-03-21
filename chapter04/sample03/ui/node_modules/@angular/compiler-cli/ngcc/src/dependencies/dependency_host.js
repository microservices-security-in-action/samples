(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/compiler-cli/ngcc/src/dependencies/dependency_host", ["require", "exports", "@angular/compiler-cli/ngcc/src/utils"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var utils_1 = require("@angular/compiler-cli/ngcc/src/utils");
    function createDependencyInfo() {
        return { dependencies: new Set(), missing: new Set(), deepImports: new Set() };
    }
    exports.createDependencyInfo = createDependencyInfo;
    var DependencyHostBase = /** @class */ (function () {
        function DependencyHostBase(fs, moduleResolver) {
            this.fs = fs;
            this.moduleResolver = moduleResolver;
        }
        /**
         * Find all the dependencies for the entry-point at the given path.
         *
         * @param entryPointPath The absolute path to the JavaScript file that represents an entry-point.
         * @param dependencyInfo An object containing information about the dependencies of the
         * entry-point, including those that were missing or deep imports into other entry-points. The
         * sets in this object will be updated with new information about the entry-point's dependencies.
         */
        DependencyHostBase.prototype.collectDependencies = function (entryPointPath, _a) {
            var dependencies = _a.dependencies, missing = _a.missing, deepImports = _a.deepImports;
            var resolvedFile = utils_1.resolveFileWithPostfixes(this.fs, entryPointPath, this.moduleResolver.relativeExtensions);
            if (resolvedFile !== null) {
                var alreadySeen = new Set();
                this.recursivelyCollectDependencies(resolvedFile, dependencies, missing, deepImports, alreadySeen);
            }
        };
        return DependencyHostBase;
    }());
    exports.DependencyHostBase = DependencyHostBase;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVwZW5kZW5jeV9ob3N0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tcGlsZXItY2xpL25nY2Mvc3JjL2RlcGVuZGVuY2llcy9kZXBlbmRlbmN5X2hvc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7SUFRQSw4REFBa0Q7SUFlbEQsU0FBZ0Isb0JBQW9CO1FBQ2xDLE9BQU8sRUFBQyxZQUFZLEVBQUUsSUFBSSxHQUFHLEVBQUUsRUFBRSxPQUFPLEVBQUUsSUFBSSxHQUFHLEVBQUUsRUFBRSxXQUFXLEVBQUUsSUFBSSxHQUFHLEVBQUUsRUFBQyxDQUFDO0lBQy9FLENBQUM7SUFGRCxvREFFQztJQUVEO1FBQ0UsNEJBQXNCLEVBQWMsRUFBWSxjQUE4QjtZQUF4RCxPQUFFLEdBQUYsRUFBRSxDQUFZO1lBQVksbUJBQWMsR0FBZCxjQUFjLENBQWdCO1FBQUcsQ0FBQztRQUVsRjs7Ozs7OztXQU9HO1FBQ0gsZ0RBQW1CLEdBQW5CLFVBQ0ksY0FBOEIsRUFBRSxFQUFvRDtnQkFBbkQsOEJBQVksRUFBRSxvQkFBTyxFQUFFLDRCQUFXO1lBQ3JFLElBQU0sWUFBWSxHQUNkLGdDQUF3QixDQUFDLElBQUksQ0FBQyxFQUFFLEVBQUUsY0FBYyxFQUFFLElBQUksQ0FBQyxjQUFjLENBQUMsa0JBQWtCLENBQUMsQ0FBQztZQUM5RixJQUFJLFlBQVksS0FBSyxJQUFJLEVBQUU7Z0JBQ3pCLElBQU0sV0FBVyxHQUFHLElBQUksR0FBRyxFQUFrQixDQUFDO2dCQUM5QyxJQUFJLENBQUMsOEJBQThCLENBQy9CLFlBQVksRUFBRSxZQUFZLEVBQUUsT0FBTyxFQUFFLFdBQVcsRUFBRSxXQUFXLENBQUMsQ0FBQzthQUNwRTtRQUNILENBQUM7UUFpQkgseUJBQUM7SUFBRCxDQUFDLEFBckNELElBcUNDO0lBckNxQixnREFBa0IiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5pbXBvcnQge0Fic29sdXRlRnNQYXRoLCBGaWxlU3lzdGVtLCBQYXRoU2VnbWVudH0gZnJvbSAnLi4vLi4vLi4vc3JjL25ndHNjL2ZpbGVfc3lzdGVtJztcbmltcG9ydCB7cmVzb2x2ZUZpbGVXaXRoUG9zdGZpeGVzfSBmcm9tICcuLi91dGlscyc7XG5cbmltcG9ydCB7TW9kdWxlUmVzb2x2ZXJ9IGZyb20gJy4vbW9kdWxlX3Jlc29sdmVyJztcblxuZXhwb3J0IGludGVyZmFjZSBEZXBlbmRlbmN5SG9zdCB7XG4gIGNvbGxlY3REZXBlbmRlbmNpZXMoXG4gICAgICBlbnRyeVBvaW50UGF0aDogQWJzb2x1dGVGc1BhdGgsIHtkZXBlbmRlbmNpZXMsIG1pc3NpbmcsIGRlZXBJbXBvcnRzfTogRGVwZW5kZW5jeUluZm8pOiB2b2lkO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIERlcGVuZGVuY3lJbmZvIHtcbiAgZGVwZW5kZW5jaWVzOiBTZXQ8QWJzb2x1dGVGc1BhdGg+O1xuICBtaXNzaW5nOiBTZXQ8QWJzb2x1dGVGc1BhdGh8UGF0aFNlZ21lbnQ+O1xuICBkZWVwSW1wb3J0czogU2V0PEFic29sdXRlRnNQYXRoPjtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZURlcGVuZGVuY3lJbmZvKCk6IERlcGVuZGVuY3lJbmZvIHtcbiAgcmV0dXJuIHtkZXBlbmRlbmNpZXM6IG5ldyBTZXQoKSwgbWlzc2luZzogbmV3IFNldCgpLCBkZWVwSW1wb3J0czogbmV3IFNldCgpfTtcbn1cblxuZXhwb3J0IGFic3RyYWN0IGNsYXNzIERlcGVuZGVuY3lIb3N0QmFzZSBpbXBsZW1lbnRzIERlcGVuZGVuY3lIb3N0IHtcbiAgY29uc3RydWN0b3IocHJvdGVjdGVkIGZzOiBGaWxlU3lzdGVtLCBwcm90ZWN0ZWQgbW9kdWxlUmVzb2x2ZXI6IE1vZHVsZVJlc29sdmVyKSB7fVxuXG4gIC8qKlxuICAgKiBGaW5kIGFsbCB0aGUgZGVwZW5kZW5jaWVzIGZvciB0aGUgZW50cnktcG9pbnQgYXQgdGhlIGdpdmVuIHBhdGguXG4gICAqXG4gICAqIEBwYXJhbSBlbnRyeVBvaW50UGF0aCBUaGUgYWJzb2x1dGUgcGF0aCB0byB0aGUgSmF2YVNjcmlwdCBmaWxlIHRoYXQgcmVwcmVzZW50cyBhbiBlbnRyeS1wb2ludC5cbiAgICogQHBhcmFtIGRlcGVuZGVuY3lJbmZvIEFuIG9iamVjdCBjb250YWluaW5nIGluZm9ybWF0aW9uIGFib3V0IHRoZSBkZXBlbmRlbmNpZXMgb2YgdGhlXG4gICAqIGVudHJ5LXBvaW50LCBpbmNsdWRpbmcgdGhvc2UgdGhhdCB3ZXJlIG1pc3Npbmcgb3IgZGVlcCBpbXBvcnRzIGludG8gb3RoZXIgZW50cnktcG9pbnRzLiBUaGVcbiAgICogc2V0cyBpbiB0aGlzIG9iamVjdCB3aWxsIGJlIHVwZGF0ZWQgd2l0aCBuZXcgaW5mb3JtYXRpb24gYWJvdXQgdGhlIGVudHJ5LXBvaW50J3MgZGVwZW5kZW5jaWVzLlxuICAgKi9cbiAgY29sbGVjdERlcGVuZGVuY2llcyhcbiAgICAgIGVudHJ5UG9pbnRQYXRoOiBBYnNvbHV0ZUZzUGF0aCwge2RlcGVuZGVuY2llcywgbWlzc2luZywgZGVlcEltcG9ydHN9OiBEZXBlbmRlbmN5SW5mbyk6IHZvaWQge1xuICAgIGNvbnN0IHJlc29sdmVkRmlsZSA9XG4gICAgICAgIHJlc29sdmVGaWxlV2l0aFBvc3RmaXhlcyh0aGlzLmZzLCBlbnRyeVBvaW50UGF0aCwgdGhpcy5tb2R1bGVSZXNvbHZlci5yZWxhdGl2ZUV4dGVuc2lvbnMpO1xuICAgIGlmIChyZXNvbHZlZEZpbGUgIT09IG51bGwpIHtcbiAgICAgIGNvbnN0IGFscmVhZHlTZWVuID0gbmV3IFNldDxBYnNvbHV0ZUZzUGF0aD4oKTtcbiAgICAgIHRoaXMucmVjdXJzaXZlbHlDb2xsZWN0RGVwZW5kZW5jaWVzKFxuICAgICAgICAgIHJlc29sdmVkRmlsZSwgZGVwZW5kZW5jaWVzLCBtaXNzaW5nLCBkZWVwSW1wb3J0cywgYWxyZWFkeVNlZW4pO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBDb21wdXRlIHRoZSBkZXBlbmRlbmNpZXMgb2YgdGhlIGdpdmVuIGZpbGUuXG4gICAqXG4gICAqIEBwYXJhbSBmaWxlIEFuIGFic29sdXRlIHBhdGggdG8gdGhlIGZpbGUgd2hvc2UgZGVwZW5kZW5jaWVzIHdlIHdhbnQgdG8gZ2V0LlxuICAgKiBAcGFyYW0gZGVwZW5kZW5jaWVzIEEgc2V0IHRoYXQgd2lsbCBoYXZlIHRoZSBhYnNvbHV0ZSBwYXRocyBvZiByZXNvbHZlZCBlbnRyeSBwb2ludHMgYWRkZWQgdG9cbiAgICogaXQuXG4gICAqIEBwYXJhbSBtaXNzaW5nIEEgc2V0IHRoYXQgd2lsbCBoYXZlIHRoZSBkZXBlbmRlbmNpZXMgdGhhdCBjb3VsZCBub3QgYmUgZm91bmQgYWRkZWQgdG8gaXQuXG4gICAqIEBwYXJhbSBkZWVwSW1wb3J0cyBBIHNldCB0aGF0IHdpbGwgaGF2ZSB0aGUgaW1wb3J0IHBhdGhzIHRoYXQgZXhpc3QgYnV0IGNhbm5vdCBiZSBtYXBwZWQgdG9cbiAgICogZW50cnktcG9pbnRzLCBpLmUuIGRlZXAtaW1wb3J0cy5cbiAgICogQHBhcmFtIGFscmVhZHlTZWVuIEEgc2V0IHRoYXQgaXMgdXNlZCB0byB0cmFjayBpbnRlcm5hbCBkZXBlbmRlbmNpZXMgdG8gcHJldmVudCBnZXR0aW5nIHN0dWNrXG4gICAqIGluIGEgY2lyY3VsYXIgZGVwZW5kZW5jeSBsb29wLlxuICAgKi9cbiAgcHJvdGVjdGVkIGFic3RyYWN0IHJlY3Vyc2l2ZWx5Q29sbGVjdERlcGVuZGVuY2llcyhcbiAgICAgIGZpbGU6IEFic29sdXRlRnNQYXRoLCBkZXBlbmRlbmNpZXM6IFNldDxBYnNvbHV0ZUZzUGF0aD4sIG1pc3Npbmc6IFNldDxzdHJpbmc+LFxuICAgICAgZGVlcEltcG9ydHM6IFNldDxBYnNvbHV0ZUZzUGF0aD4sIGFscmVhZHlTZWVuOiBTZXQ8QWJzb2x1dGVGc1BhdGg+KTogdm9pZDtcbn1cbiJdfQ==