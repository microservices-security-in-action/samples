(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/compiler-cli/ngcc/src/analysis/util", ["require", "exports", "@angular/compiler-cli/src/ngtsc/file_system"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var file_system_1 = require("@angular/compiler-cli/src/ngtsc/file_system");
    function isWithinPackage(packagePath, sourceFile) {
        return !file_system_1.relative(packagePath, file_system_1.absoluteFromSourceFile(sourceFile)).startsWith('..');
    }
    exports.isWithinPackage = isWithinPackage;
    var NoopDependencyTracker = /** @class */ (function () {
        function NoopDependencyTracker() {
        }
        NoopDependencyTracker.prototype.addDependency = function () { };
        NoopDependencyTracker.prototype.addResourceDependency = function () { };
        NoopDependencyTracker.prototype.addTransitiveDependency = function () { };
        NoopDependencyTracker.prototype.addTransitiveResources = function () { };
        return NoopDependencyTracker;
    }());
    exports.NOOP_DEPENDENCY_TRACKER = new NoopDependencyTracker();
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbXBpbGVyLWNsaS9uZ2NjL3NyYy9hbmFseXNpcy91dGlsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0lBU0EsMkVBQWdHO0lBR2hHLFNBQWdCLGVBQWUsQ0FBQyxXQUEyQixFQUFFLFVBQXlCO1FBQ3BGLE9BQU8sQ0FBQyxzQkFBUSxDQUFDLFdBQVcsRUFBRSxvQ0FBc0IsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUNyRixDQUFDO0lBRkQsMENBRUM7SUFFRDtRQUFBO1FBS0EsQ0FBQztRQUpDLDZDQUFhLEdBQWIsY0FBdUIsQ0FBQztRQUN4QixxREFBcUIsR0FBckIsY0FBK0IsQ0FBQztRQUNoQyx1REFBdUIsR0FBdkIsY0FBaUMsQ0FBQztRQUNsQyxzREFBc0IsR0FBdEIsY0FBZ0MsQ0FBQztRQUNuQyw0QkFBQztJQUFELENBQUMsQUFMRCxJQUtDO0lBRVksUUFBQSx1QkFBdUIsR0FBc0IsSUFBSSxxQkFBcUIsRUFBRSxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuaW1wb3J0ICogYXMgdHMgZnJvbSAndHlwZXNjcmlwdCc7XG5cbmltcG9ydCB7QWJzb2x1dGVGc1BhdGgsIGFic29sdXRlRnJvbVNvdXJjZUZpbGUsIHJlbGF0aXZlfSBmcm9tICcuLi8uLi8uLi9zcmMvbmd0c2MvZmlsZV9zeXN0ZW0nO1xuaW1wb3J0IHtEZXBlbmRlbmN5VHJhY2tlcn0gZnJvbSAnLi4vLi4vLi4vc3JjL25ndHNjL2luY3JlbWVudGFsL2FwaSc7XG5cbmV4cG9ydCBmdW5jdGlvbiBpc1dpdGhpblBhY2thZ2UocGFja2FnZVBhdGg6IEFic29sdXRlRnNQYXRoLCBzb3VyY2VGaWxlOiB0cy5Tb3VyY2VGaWxlKTogYm9vbGVhbiB7XG4gIHJldHVybiAhcmVsYXRpdmUocGFja2FnZVBhdGgsIGFic29sdXRlRnJvbVNvdXJjZUZpbGUoc291cmNlRmlsZSkpLnN0YXJ0c1dpdGgoJy4uJyk7XG59XG5cbmNsYXNzIE5vb3BEZXBlbmRlbmN5VHJhY2tlciBpbXBsZW1lbnRzIERlcGVuZGVuY3lUcmFja2VyIHtcbiAgYWRkRGVwZW5kZW5jeSgpOiB2b2lkIHt9XG4gIGFkZFJlc291cmNlRGVwZW5kZW5jeSgpOiB2b2lkIHt9XG4gIGFkZFRyYW5zaXRpdmVEZXBlbmRlbmN5KCk6IHZvaWQge31cbiAgYWRkVHJhbnNpdGl2ZVJlc291cmNlcygpOiB2b2lkIHt9XG59XG5cbmV4cG9ydCBjb25zdCBOT09QX0RFUEVOREVOQ1lfVFJBQ0tFUjogRGVwZW5kZW5jeVRyYWNrZXIgPSBuZXcgTm9vcERlcGVuZGVuY3lUcmFja2VyKCk7XG4iXX0=