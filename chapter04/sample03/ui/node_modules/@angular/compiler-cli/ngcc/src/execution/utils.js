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
        define("@angular/compiler-cli/ngcc/src/execution/utils", ["require", "exports", "tslib", "@angular/compiler-cli/src/ngtsc/file_system", "@angular/compiler-cli/ngcc/src/packages/build_marker"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var tslib_1 = require("tslib");
    var file_system_1 = require("@angular/compiler-cli/src/ngtsc/file_system");
    var build_marker_1 = require("@angular/compiler-cli/ngcc/src/packages/build_marker");
    /** A helper function for handling a task's being completed. */
    exports.onTaskCompleted = function (pkgJsonUpdater, task, outcome) {
        var entryPoint = task.entryPoint, formatPropertiesToMarkAsProcessed = task.formatPropertiesToMarkAsProcessed, processDts = task.processDts;
        if (outcome === 0 /* Processed */) {
            var packageJsonPath = file_system_1.resolve(entryPoint.path, 'package.json');
            var propsToMarkAsProcessed = tslib_1.__spread(formatPropertiesToMarkAsProcessed);
            if (processDts) {
                propsToMarkAsProcessed.push('typings');
            }
            build_marker_1.markAsProcessed(pkgJsonUpdater, entryPoint.packageJson, packageJsonPath, propsToMarkAsProcessed);
        }
    };
    /** Stringify a task for debugging purposes. */
    exports.stringifyTask = function (task) {
        return "{entryPoint: " + task.entryPoint.name + ", formatProperty: " + task.formatProperty + ", processDts: " + task.processDts + "}";
    };
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21waWxlci1jbGkvbmdjYy9zcmMvZXhlY3V0aW9uL3V0aWxzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7OztJQUVILDJFQUF1RDtJQUN2RCxxRkFBeUQ7SUFPekQsK0RBQStEO0lBQ2xELFFBQUEsZUFBZSxHQUN4QixVQUFDLGNBQWtDLEVBQUUsSUFBVSxFQUFFLE9BQThCO1FBQ3RFLElBQUEsNEJBQVUsRUFBRSwwRUFBaUMsRUFBRSw0QkFBVSxDQUFTO1FBRXpFLElBQUksT0FBTyxzQkFBb0MsRUFBRTtZQUMvQyxJQUFNLGVBQWUsR0FBRyxxQkFBTyxDQUFDLFVBQVUsQ0FBQyxJQUFJLEVBQUUsY0FBYyxDQUFDLENBQUM7WUFDakUsSUFBTSxzQkFBc0Isb0JBQ3BCLGlDQUFpQyxDQUFDLENBQUM7WUFFM0MsSUFBSSxVQUFVLEVBQUU7Z0JBQ2Qsc0JBQXNCLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO2FBQ3hDO1lBRUQsOEJBQWUsQ0FDWCxjQUFjLEVBQUUsVUFBVSxDQUFDLFdBQVcsRUFBRSxlQUFlLEVBQUUsc0JBQXNCLENBQUMsQ0FBQztTQUN0RjtJQUNILENBQUMsQ0FBQztJQUVOLCtDQUErQztJQUNsQyxRQUFBLGFBQWEsR0FBRyxVQUFDLElBQVU7UUFDcEMsT0FBQSxrQkFBZ0IsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLDBCQUFxQixJQUFJLENBQUMsY0FBYyxzQkFBaUIsSUFBSSxDQUFDLFVBQVUsTUFBRztJQUEvRyxDQUErRyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge3Jlc29sdmV9IGZyb20gJy4uLy4uLy4uL3NyYy9uZ3RzYy9maWxlX3N5c3RlbSc7XG5pbXBvcnQge21hcmtBc1Byb2Nlc3NlZH0gZnJvbSAnLi4vcGFja2FnZXMvYnVpbGRfbWFya2VyJztcbmltcG9ydCB7UGFja2FnZUpzb25Gb3JtYXRQcm9wZXJ0aWVzfSBmcm9tICcuLi9wYWNrYWdlcy9lbnRyeV9wb2ludCc7XG5pbXBvcnQge1BhY2thZ2VKc29uVXBkYXRlcn0gZnJvbSAnLi4vd3JpdGluZy9wYWNrYWdlX2pzb25fdXBkYXRlcic7XG5cbmltcG9ydCB7VGFzaywgVGFza1Byb2Nlc3NpbmdPdXRjb21lfSBmcm9tICcuL2FwaSc7XG5cblxuLyoqIEEgaGVscGVyIGZ1bmN0aW9uIGZvciBoYW5kbGluZyBhIHRhc2sncyBiZWluZyBjb21wbGV0ZWQuICovXG5leHBvcnQgY29uc3Qgb25UYXNrQ29tcGxldGVkID1cbiAgICAocGtnSnNvblVwZGF0ZXI6IFBhY2thZ2VKc29uVXBkYXRlciwgdGFzazogVGFzaywgb3V0Y29tZTogVGFza1Byb2Nlc3NpbmdPdXRjb21lKTogdm9pZCA9PiB7XG4gICAgICBjb25zdCB7ZW50cnlQb2ludCwgZm9ybWF0UHJvcGVydGllc1RvTWFya0FzUHJvY2Vzc2VkLCBwcm9jZXNzRHRzfSA9IHRhc2s7XG5cbiAgICAgIGlmIChvdXRjb21lID09PSBUYXNrUHJvY2Vzc2luZ091dGNvbWUuUHJvY2Vzc2VkKSB7XG4gICAgICAgIGNvbnN0IHBhY2thZ2VKc29uUGF0aCA9IHJlc29sdmUoZW50cnlQb2ludC5wYXRoLCAncGFja2FnZS5qc29uJyk7XG4gICAgICAgIGNvbnN0IHByb3BzVG9NYXJrQXNQcm9jZXNzZWQ6IFBhY2thZ2VKc29uRm9ybWF0UHJvcGVydGllc1tdID1cbiAgICAgICAgICAgIFsuLi5mb3JtYXRQcm9wZXJ0aWVzVG9NYXJrQXNQcm9jZXNzZWRdO1xuXG4gICAgICAgIGlmIChwcm9jZXNzRHRzKSB7XG4gICAgICAgICAgcHJvcHNUb01hcmtBc1Byb2Nlc3NlZC5wdXNoKCd0eXBpbmdzJyk7XG4gICAgICAgIH1cblxuICAgICAgICBtYXJrQXNQcm9jZXNzZWQoXG4gICAgICAgICAgICBwa2dKc29uVXBkYXRlciwgZW50cnlQb2ludC5wYWNrYWdlSnNvbiwgcGFja2FnZUpzb25QYXRoLCBwcm9wc1RvTWFya0FzUHJvY2Vzc2VkKTtcbiAgICAgIH1cbiAgICB9O1xuXG4vKiogU3RyaW5naWZ5IGEgdGFzayBmb3IgZGVidWdnaW5nIHB1cnBvc2VzLiAqL1xuZXhwb3J0IGNvbnN0IHN0cmluZ2lmeVRhc2sgPSAodGFzazogVGFzayk6IHN0cmluZyA9PlxuICAgIGB7ZW50cnlQb2ludDogJHt0YXNrLmVudHJ5UG9pbnQubmFtZX0sIGZvcm1hdFByb3BlcnR5OiAke3Rhc2suZm9ybWF0UHJvcGVydHl9LCBwcm9jZXNzRHRzOiAke3Rhc2sucHJvY2Vzc0R0c319YDtcbiJdfQ==